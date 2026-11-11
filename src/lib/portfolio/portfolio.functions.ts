import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Crit = { criterion_id: string; title: string; score: number; strengths: string[] };

// Portfolio entries are snapshots of a completed, server-written evaluation, so students cannot forge scores.
export const addToPortfolio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ submissionId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: sub } = await context.supabase
      .from("submissions")
      .select("id, user_id, simulations(title, rubric_criteria(id, competencies(title))), evaluations(status, overall_score, summary, criteria)")
      .eq("id", data.submissionId)
      .maybeSingle();
    if (!sub || sub.user_id !== context.userId || !sub.simulations) throw new Error("Submission not found");
    const ev = sub.evaluations;
    if (ev?.status !== "completed") throw new Error("Only assessed work can be added to your portfolio.");
    const { data: profile } = await context.supabase.from("profiles").select("full_name").eq("id", context.userId).maybeSingle();
    const compOf = Object.fromEntries(sub.simulations.rubric_criteria.map((r) => [r.id, r.competencies?.title ?? null]));
    const crits = (ev.criteria ?? []) as unknown as Crit[];
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("portfolio_entries")
      .upsert({
        user_id: context.userId,
        submission_id: sub.id,
        title: sub.simulations.title,
        simulation_title: sub.simulations.title,
        summary: ev.summary,
        overall_score: ev.overall_score,
        owner_name: profile?.full_name ?? null,
        competency_scores: crits.map((c) => ({ title: compOf[c.criterion_id] ?? c.title, criterion: c.title, score: c.score })),
        highlights: crits.flatMap((c) => c.strengths).slice(0, 5),
      }, { onConflict: "submission_id" })
      .select("id")
      .single();
    if (error || !row) throw new Error("Could not add to portfolio");
    return { id: row.id };
  });

export const setPortfolioVisibility = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid(), isPublic: z.boolean() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: own } = await context.supabase.from("portfolio_entries").select("id, user_id").eq("id", data.id).maybeSingle();
    if (!own || own.user_id !== context.userId) throw new Error("Not found");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("portfolio_entries").update({ is_public: data.isPublic }).eq("id", data.id);
    if (error) throw new Error("Could not update");
    return { ok: true };
  });

// Public read for shared entries (anon policy only exposes is_public rows).
export const getPublicPortfolioEntry = createServerFn({ method: "GET" })
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const sb = createClient(process.env.SUPABASE_URL!, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      global: key.startsWith("sb_") ? { fetch: (input, init) => { const h = new Headers(init?.headers); if (h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization"); h.set("apikey", key); return fetch(input, { ...init, headers: h }); } } : undefined,
    });
    const { data: row } = await sb
      .from("portfolio_entries")
      .select("id, title, simulation_title, summary, overall_score, owner_name, competency_scores, highlights, created_at")
      .eq("id", data.id).eq("is_public", true).maybeSingle();
    return row;
  });
