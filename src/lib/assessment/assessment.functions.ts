import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const submitSchema = z.object({
  simulationSlug: z.string().min(1).max(100),
  answers: z.record(z.string().uuid(), z.string().max(8000)),
  metrics: z.record(z.string().max(50), z.string().max(200)),
  evidenceUrl: z.string().url().max(500).nullable(),
});

type Outcome = { submissionId: string; status: "completed" | "failed"; error: string | null };

export const submitWork = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => submitSchema.parse(input))
  .handler(async ({ data, context }): Promise<Outcome> => {
    const { supabase, userId } = context;
    const { data: sim, error } = await supabase
      .from("simulations")
      .select("id, simulation_tasks(id)")
      .eq("slug", data.simulationSlug)
      .maybeSingle();
    if (error || !sim) throw new Error("Simulation not found");
    const taskIds = new Set(sim.simulation_tasks.map((t) => t.id));
    const answers = Object.fromEntries(Object.entries(data.answers).filter(([k]) => taskIds.has(k)));
    const filled = Object.values(answers).filter((a) => a.trim().length >= 20).length;
    if (filled < taskIds.size) throw new Error("Please answer every task (at least a couple of sentences each).");

    const { count } = await supabase.from("submissions").select("id", { count: "exact", head: true }).eq("simulation_id", sim.id);
    const { data: sub, error: insErr } = await supabase
      .from("submissions")
      .insert({
        user_id: userId,
        simulation_id: sim.id,
        attempt_number: (count ?? 0) + 1,
        status: "submitted",
        submitted_at: new Date().toISOString(),
        answers,
        metrics: data.metrics,
        evidence_url: data.evidenceUrl,
      })
      .select("id")
      .single();
    if (insErr || !sub) throw new Error("Could not save your submission");
    return evaluate(sub.id, userId);
  });

export const retryEvaluation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ submissionId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    // RLS confirms the caller owns this submission.
    const { data: own } = await context.supabase.from("submissions").select("id").eq("id", data.submissionId).maybeSingle();
    if (!own) throw new Error("Submission not found");
    return evaluate(own.id, context.userId);
  });

async function evaluate(submissionId: string, userId: string): Promise<Outcome> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { checkMetrics, keepVerifiedQuotes, weightedScore } = await import("./checks");
  const { runAiAssessment, AssessmentError, ASSESSMENT_MODEL } = await import("./evaluate.server");

  const { data: sub } = await supabaseAdmin
    .from("submissions")
    .select("id, user_id, answers, metrics, simulation_id, simulations(title, organisation_name, role_title, business_problem, simulation_tasks(id, position, title, instructions), rubric_criteria(id, position, title, description, weight, competencies(title)), simulation_metrics(metric_key, label))")
    .eq("id", submissionId)
    .single();
  if (!sub || sub.user_id !== userId || !sub.simulations) throw new Error("Submission not found");
  const sim = sub.simulations;
  const answers = (sub.answers ?? {}) as Record<string, string>;
  const metrics = (sub.metrics ?? {}) as Record<string, string>;

  const { data: keys } = await supabaseAdmin
    .from("answer_keys")
    .select("metric_key, expected_numeric, expected_text, tolerance_pct, tolerance_abs")
    .eq("simulation_id", sub.simulation_id);
  const checks = checkMetrics(
    (keys ?? []).map((k) => ({ ...k, expected_numeric: k.expected_numeric === null ? null : Number(k.expected_numeric), tolerance_pct: Number(k.tolerance_pct), tolerance_abs: Number(k.tolerance_abs) })),
    metrics,
  );

  await supabaseAdmin.from("evaluations").upsert(
    { submission_id: submissionId, user_id: userId, status: "pending", checks, error: null, model: ASSESSMENT_MODEL },
    { onConflict: "submission_id" },
  );

  const criteria = [...sim.rubric_criteria].sort((a, b) => a.position - b.position);
  const tasks = [...sim.simulation_tasks].sort((a, b) => a.position - b.position);
  try {
    const ai = await runAiAssessment({
      simulation: sim,
      tasks,
      criteria: criteria.map((c) => ({ id: c.id, title: c.title, description: c.description, weight: c.weight, competency: c.competencies?.title ?? null })),
      answers,
      metricLabels: Object.fromEntries(sim.simulation_metrics.map((m) => [m.metric_key, m.label])),
      checks,
    });
    const corpus = Object.values(answers).join("\n");
    const byId = new Map(ai.criteria.map((c) => [c.criterion_id, c]));
    const scored = criteria.map((c) => {
      const r = byId.get(c.id);
      if (!r) throw new AssessmentError("The assessment was incomplete. Please try again.", 502);
      const score = Math.min(5, Math.max(1, Math.round(r.score)));
      return {
        criterion_id: c.id,
        title: c.title,
        weight: c.weight,
        score,
        rationale: r.rationale,
        strengths: r.strengths.slice(0, 3),
        weaknesses: r.weaknesses.slice(0, 3),
        improvements: r.improvements.slice(0, 3),
        evidence_quotes: keepVerifiedQuotes(r.evidence_quotes, corpus).slice(0, 3),
      };
    });
    await supabaseAdmin
      .from("evaluations")
      .update({ status: "completed", summary: ai.summary, criteria: scored, next_steps: ai.next_steps.slice(0, 4), overall_score: weightedScore(scored) })
      .eq("submission_id", submissionId);
    await supabaseAdmin.from("submissions").update({ status: "evaluated" }).eq("id", submissionId);
    return { submissionId, status: "completed", error: null };
  } catch (e) {
    const message = e instanceof AssessmentError ? e.message : "The assessment could not be completed. Your work was saved — please try again.";
    if (!(e instanceof AssessmentError)) console.error("evaluation failed", e);
    await supabaseAdmin.from("evaluations").update({ status: "failed", error: message }).eq("submission_id", submissionId);
    return { submissionId, status: "failed", error: message };
  }
}
