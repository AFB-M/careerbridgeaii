import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/site/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { simulationMetricsQuery, simulationQuery } from "@/lib/content";
import { supabase } from "@/integrations/supabase/client";
import { submitWork } from "@/lib/assessment/assessment.functions";

export const Route = createFileRoute("/_authenticated/submit/$slug")({
  head: () => ({
    meta: [
      { title: "Submit your work — CareerBridge AI" },
      { name: "description", content: "Submit your simulation answers for rubric-based feedback." },
      { property: "og:title", content: "Submit your work — CareerBridge AI" },
      { property: "og:description", content: "Submit your simulation answers for rubric-based feedback." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: async ({ context, params }) => {
    const sim = await context.queryClient.ensureQueryData(simulationQuery(params.slug));
    if (!sim) throw notFound();
    await context.queryClient.ensureQueryData(simulationMetricsQuery(sim.id));
  },
  component: SubmitPage,
});

function SubmitPage() {
  const { slug } = Route.useParams();
  const { data: sim } = useSuspenseQuery(simulationQuery(slug));
  const { data: metrics } = useSuspenseQuery(simulationMetricsQuery(sim!.id));
  const submit = useServerFn(submitWork);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  if (!sim) return null;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const answers = Object.fromEntries(sim!.simulation_tasks.map((t) => [t.id, String(f.get(`task-${t.id}`) ?? "")]));
    const metricValues = Object.fromEntries(metrics.map((m) => [m.metric_key, String(f.get(`metric-${m.metric_key}`) ?? "").trim()]));
    const url = String(f.get("evidence_url") ?? "").trim();
    const file = f.get("evidence_file");
    setBusy(true);
    try {
      let evidenceFilePath: string | null = null;
      if (file instanceof File && file.size > 0) {
        if (file.size > 10 * 1024 * 1024) throw new Error("File must be under 10 MB");
        const { data: u } = await supabase.auth.getUser();
        const path = `${u.user!.id}/${Date.now()}-${file.name.replace(/[^\w.-]+/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("evidence").upload(path, file);
        if (upErr) throw new Error("Could not upload your file");
        evidenceFilePath = path;
      }
      const res = await submit({ data: { simulationSlug: slug, answers, metrics: metricValues, evidenceUrl: url || null, evidenceFilePath } });
      await qc.invalidateQueries();
      if (res.status === "failed") toast.error(res.error ?? "Assessment failed");
      navigate({ to: "/feedback/$id", params: { id: res.submissionId } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit");
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <nav className="text-sm text-muted-foreground"><Link to="/simulations/$slug" params={{ slug }} className="hover:text-foreground">← Back to the brief</Link></nav>
      <h1 className="mt-3 text-3xl font-bold">Submit: {sim.title}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">Write up your work for each task as you would for your manager. Explain what you did and why, and quote your actual figures.</p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <fieldset disabled={busy} className="space-y-5">
          {sim.simulation_tasks.map((t) => (
            <div key={t.id} className="rounded-xl border bg-card p-5 shadow-card">
              <Label htmlFor={`task-${t.id}`} className="font-display text-base font-semibold">Task {t.position}: {t.title}</Label>
              <p className="mt-1 text-sm text-muted-foreground">{t.instructions}</p>
              <Textarea id={`task-${t.id}`} name={`task-${t.id}`} required minLength={20} maxLength={8000} rows={6} className="mt-3" />
            </div>
          ))}
        </fieldset>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <fieldset disabled={busy} className="rounded-xl border bg-card p-5 shadow-card">
            <legend className="sr-only">Key figures</legend>
            <h2 className="font-display font-semibold">Key figures</h2>
            <p className="mt-1 text-xs text-muted-foreground">These are checked automatically against the cleaned dataset.</p>
            <div className="mt-4 space-y-3">
              {metrics.map((m) => (
                <div key={m.metric_key} className="space-y-1">
                  <Label htmlFor={`metric-${m.metric_key}`} className="text-sm">{m.label}</Label>
                  <Input id={`metric-${m.metric_key}`} name={`metric-${m.metric_key}`} inputMode={m.kind === "number" ? "decimal" : "text"} placeholder={m.hint ?? ""} maxLength={200} />
                </div>
              ))}
              <div className="space-y-1 pt-2">
                <Label htmlFor="evidence_url" className="text-sm">Link to your work (optional)</Label>
                <Input id="evidence_url" name="evidence_url" type="url" placeholder="Google Sheet, notebook or dashboard" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="evidence_file" className="text-sm">Attach a file (optional)</Label>
                <Input id="evidence_file" name="evidence_file" type="file" accept=".csv,.xlsx,.xls,.pdf,.png,.jpg,.jpeg,.ipynb,.pbix,.docx" />
                <p className="text-xs text-muted-foreground">Cleaned sheet, chart or report. Max 10 MB. Only you can see it.</p>
              </div>
            </div>
          </fieldset>
          <Button type="submit" className="w-full" size="lg" disabled={busy}>
            {busy ? <><Loader2 className="animate-spin" /> Assessing your work…</> : "Submit for feedback"}
          </Button>
          {busy && <p className="text-center text-xs text-muted-foreground" role="status">This usually takes under a minute. Please keep this page open.</p>}
          <p className="flex gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground"><Info className="h-4 w-4 shrink-0" />Feedback is formative AI-assisted practice feedback, not a professional certification. Only your written answers are assessed.</p>
        </aside>
      </form>
    </AppShell>
  );
}
