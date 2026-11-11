import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, CheckCircle2, CircleDashed, Info, Loader2, Quote, RefreshCcw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/site/AppShell";
import { Button } from "@/components/ui/button";
import { attemptsQuery, submissionQuery, type CriterionFeedback, type MetricCheck } from "@/lib/content";
import { retryEvaluation } from "@/lib/assessment/assessment.functions";
import { addToPortfolio } from "@/lib/portfolio/portfolio.functions";
import { supabase } from "@/integrations/supabase/client";
import { FolderPlus, Paperclip } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/feedback/$id")({
  head: () => ({
    meta: [
      { title: "Your feedback — CareerBridge AI" },
      { name: "description", content: "Criterion-by-criterion feedback on your simulation submission." },
      { property: "og:title", content: "Your feedback — CareerBridge AI" },
      { property: "og:description", content: "Criterion-by-criterion feedback on your simulation submission." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: async ({ context, params }) => {
    const sub = await context.queryClient.ensureQueryData(submissionQuery(params.id));
    if (!sub?.simulations) throw notFound();
    await context.queryClient.ensureQueryData(attemptsQuery(sub.simulations.id));
  },
  component: FeedbackPage,
});

const levels = ["", "Not demonstrated", "Emerging", "Developing", "Proficient", "Strong"];

function FeedbackPage() {
  const { id } = Route.useParams();
  const { data: sub } = useSuspenseQuery(submissionQuery(id));
  const sim = sub!.simulations!;
  const { data: attempts } = useSuspenseQuery(attemptsQuery(sim.id));
  const ev = sub!.evaluations;
  const retry = useServerFn(retryEvaluation);
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  const criteria = (ev?.criteria ?? []) as unknown as CriterionFeedback[];
  const checks = (ev?.checks ?? []) as unknown as MetricCheck[];
  const nextSteps = (ev?.next_steps ?? []) as unknown as string[];
  const labels = Object.fromEntries(sim.simulation_metrics.map((m) => [m.metric_key, m.label]));
  const prev = attempts.filter((a) => a.attempt_number < sub!.attempt_number && a.evaluations?.status === "completed").at(-1);
  const prevScores = new Map(((prev?.evaluations?.criteria ?? []) as unknown as CriterionFeedback[]).map((c) => [c.criterion_id, c.score]));
  const prevOverall = prev?.evaluations?.overall_score != null ? Number(prev.evaluations.overall_score) : null;

  const addPortfolio = useServerFn(addToPortfolio);
  const navigate = useNavigate();
  async function onAddPortfolio() {
    try {
      await addPortfolio({ data: { submissionId: id } });
      await qc.invalidateQueries();
      toast.success("Added to your portfolio");
      navigate({ to: "/portfolio" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not add to portfolio");
    }
  }
  async function openFile() {
    const { data, error } = await supabase.storage.from("evidence").createSignedUrl(sub!.evidence_file_path!, 300);
    if (error || !data) { toast.error("Could not open the file"); return; }
    window.open(data.signedUrl, "_blank", "noopener");
  }

  async function onRetry() {
    setBusy(true);
    try {
      const r = await retry({ data: { submissionId: id } });
      if (r.status === "failed") toast.error(r.error ?? "Assessment failed");
      await qc.invalidateQueries();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not retry");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <nav className="text-sm text-muted-foreground"><Link to="/simulations/$slug" params={{ slug: sim.slug }} className="hover:text-foreground">{sim.title}</Link> / Attempt {sub!.attempt_number}</nav>
      <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <h1 className="text-3xl font-bold">Feedback on attempt {sub!.attempt_number}</h1>
        <div className="flex flex-wrap gap-2">
          {sub!.evidence_file_path && <Button variant="ghost" onClick={openFile}><Paperclip /> Attached file</Button>}
          {ev?.status === "completed" && <Button variant="secondary" onClick={onAddPortfolio}><FolderPlus /> Add to portfolio</Button>}
          <Button variant="outline" asChild><Link to="/submit/$slug" params={{ slug: sim.slug }}><RefreshCcw /> Revise and resubmit</Link></Button>
        </div>
      </div>
      <p className="mt-3 flex gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground"><Info className="h-4 w-4 shrink-0" />This is formative AI-assisted feedback to help you improve. It is not an independently verified professional certification.</p>

      {ev?.status !== "completed" ? (
        <div className="mt-8 rounded-xl border bg-card p-6 shadow-card">
          {ev?.status === "pending" || busy ? (
            <p className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Your work is being assessed…</p>
          ) : (
            <>
              <p className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-destructive" /> Assessment not completed</p>
              <p className="mt-1 text-sm text-muted-foreground">{ev?.error ?? "Your work was saved but has not been assessed yet."}</p>
              <Button className="mt-4" onClick={onRetry} disabled={busy}>Try assessment again</Button>
            </>
          )}
        </div>
      ) : (
        <>
          <section className="mt-8 grid gap-6 rounded-2xl bg-ink p-6 text-ink-foreground md:grid-cols-[auto_1fr] md:p-8">
            <div className="text-center md:pr-8">
              <p className="text-xs uppercase tracking-wider opacity-70">Overall</p>
              <p className="font-display text-6xl font-bold text-highlight">{Number(ev.overall_score)}</p>
              <p className="text-xs opacity-70">out of 100 (weighted)</p>
              {prevOverall !== null && <Delta value={Number(ev.overall_score) - prevOverall} label="vs previous attempt" />}
            </div>
            <p className="self-center text-lg leading-relaxed opacity-90">{ev.summary}</p>
          </section>

          <section className="mt-8 rounded-xl border bg-card p-6 shadow-card">
            <h2 className="text-xl font-bold">Score by criterion</h2>
            <ul className="mt-4 space-y-3">
              {criteria.map((c) => (
                <li key={c.criterion_id} className="grid items-center gap-2 sm:grid-cols-[220px_1fr_auto]">
                  <span className="text-sm font-medium">{c.title} <span className="text-muted-foreground">({c.weight}%)</span></span>
                  <div className="flex gap-1" role="img" aria-label={`${c.score} out of 5`}>
                    {[1, 2, 3, 4, 5].map((n) => <span key={n} className={`h-2.5 flex-1 rounded-full ${n <= c.score ? "bg-primary" : "bg-muted"}`} />)}
                  </div>
                  <span className="flex items-center gap-2 text-sm font-semibold">{c.score}/5 · {levels[c.score]}
                    {prevScores.has(c.criterion_id) && <Delta value={c.score - (prevScores.get(c.criterion_id) ?? 0)} />}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8 rounded-xl border bg-card p-6 shadow-card">
            <h2 className="text-xl font-bold">Automatic figure checks</h2>
            <p className="mt-1 text-sm text-muted-foreground">Your key figures compared with the reference values for the cleaned dataset.</p>
            <ul className="mt-4 divide-y">
              {checks.map((c) => (
                <li key={c.metric_key} className="flex items-start gap-3 py-3">
                  {c.status === "correct" ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" /> : c.status === "missing" ? <CircleDashed className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />}
                  <div>
                    <p className="text-sm font-medium">{labels[c.metric_key] ?? c.metric_key}: <span className="font-normal">{c.submitted ?? "—"}</span></p>
                    <p className="text-xs text-muted-foreground">{c.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-8 space-y-6">
            {criteria.map((c) => (
              <article key={c.criterion_id} className="rounded-xl border bg-card p-6 shadow-card">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-lg font-bold">{c.title}</h3>
                  <span className="font-display font-bold text-primary">{c.score}/5</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{c.rationale}</p>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <List title="Strengths" items={c.strengths} />
                  <List title="Weaknesses" items={c.weaknesses} />
                  <List title="How to improve" items={c.improvements} />
                </div>
                {c.evidence_quotes.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Evidence from your submission</p>
                    {c.evidence_quotes.map((q) => <p key={q} className="flex gap-2 rounded-md bg-secondary p-2 text-sm"><Quote className="h-4 w-4 shrink-0 text-primary" />{q}</p>)}
                  </div>
                )}
              </article>
            ))}
          </div>

          {nextSteps.length > 0 && (
            <section className="mt-8 rounded-xl border bg-secondary p-6">
              <h2 className="text-xl font-bold">Suggested next learning activities</h2>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">{nextSteps.map((s) => <li key={s}>{s}</li>)}</ul>
            </section>
          )}
        </>
      )}

      {attempts.length > 1 && (
        <section className="mt-8 rounded-xl border bg-card p-6 shadow-card">
          <h2 className="text-xl font-bold">Your attempts</h2>
          <ul className="mt-3 divide-y">
            {attempts.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2 text-sm">
                <Link to="/feedback/$id" params={{ id: a.id }} className={a.id === id ? "font-semibold" : "text-primary hover:underline"}>Attempt {a.attempt_number}</Link>
                <span>{a.evaluations?.status === "completed" ? `${Number(a.evaluations.overall_score)}/100` : "Not assessed"}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </AppShell>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      {items.length ? <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">{items.map((i) => <li key={i}>{i}</li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">None noted.</p>}
    </div>
  );
}

function Delta({ value, label, inverse }: { value: number; label?: string; inverse?: boolean }) {
  if (value === 0) return <span className="text-xs opacity-70">no change{label ? ` ${label}` : ""}</span>;
  const up = value > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? (inverse ? "text-highlight" : "text-primary") : "text-destructive"}`}>
      {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}{Math.abs(value)}{label ? ` ${label}` : ""}
    </span>
  );
}
