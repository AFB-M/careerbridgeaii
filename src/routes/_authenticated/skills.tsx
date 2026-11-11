import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Compass, Info } from "lucide-react";
import { AppShell } from "@/components/site/AppShell";
import { Button } from "@/components/ui/button";
import { careerPathQuery, simulationsQuery } from "@/lib/content";
import { myEvidenceQuery, mySelfRatingsQuery } from "@/lib/skills-queries";
import { demonstratedScores, recommend, type ScoredCriterion } from "@/lib/skills";

export const Route = createFileRoute("/_authenticated/skills")({
  head: () => ({
    meta: [
      { title: "Skills & recommendations — CareerBridge AI" },
      { name: "description", content: "Compare self-reported skills with skills demonstrated in your simulation work." },
      { property: "og:title", content: "Skills & recommendations — CareerBridge AI" },
      { property: "og:description", content: "Compare self-reported skills with skills demonstrated in your simulation work." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => Promise.all([
    context.queryClient.ensureQueryData(careerPathQuery("data-analyst")),
    context.queryClient.ensureQueryData(mySelfRatingsQuery()),
    context.queryClient.ensureQueryData(myEvidenceQuery()),
    context.queryClient.ensureQueryData(simulationsQuery()),
  ]),
  component: Skills,
});

function Skills() {
  const { data: path } = useSuspenseQuery(careerPathQuery("data-analyst"));
  const { data: ratings } = useSuspenseQuery(mySelfRatingsQuery());
  const { data: ev } = useSuspenseQuery(myEvidenceQuery());
  const { data: sims } = useSuspenseQuery(simulationsQuery());
  const comps = path?.competencies ?? [];
  const self = Object.fromEntries(ratings.map((r) => [r.competency_id, r.rating]));
  const attempts = ev.submissions
    .filter((s) => s.evaluations?.status === "completed")
    .map((s) => ({ simulation_id: s.simulation_id, attempt_number: s.attempt_number, criteria: (s.evaluations?.criteria ?? []) as unknown as ScoredCriterion[] }));
  const shown = demonstratedScores(attempts, ev.criterionToCompetency);
  const recs = recommend(comps, self, shown);

  return (
    <AppShell>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold">Your skills</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Self-reported confidence next to what your assessed work demonstrates (latest attempt of each simulation).</p>
        </div>
        <Button variant="outline" asChild><Link to="/baseline">{ratings.length ? "Update self-assessment" : "Take baseline self-assessment"}</Link></Button>
      </div>
      <p className="mt-4 flex gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground"><Info className="h-4 w-4 shrink-0" />Demonstrated scores come from formative AI-assisted feedback, not professional certification.</p>

      <section className="mt-6 overflow-hidden rounded-xl border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">Competency</th><th className="p-3">Self-reported</th><th className="p-3">Demonstrated</th></tr>
          </thead>
          <tbody className="divide-y">
            {comps.map((c) => (
              <tr key={c.id}>
                <td className="p-3 font-medium">{c.title}</td>
                <td className="p-3"><Bar value={self[c.id]} tone="bg-highlight" /></td>
                <td className="p-3"><Bar value={shown[c.id]?.score} tone="bg-primary" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-8">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold"><Compass className="h-5 w-5 text-primary" /> Recommended next steps</h2>
        {!recs.length ? (
          <p className="mt-3 text-muted-foreground">Your latest work is proficient in every competency. Keep it up by trying another simulation when one is added.</p>
        ) : (
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {recs.map((r, i) => (
              <li key={i} className="rounded-xl border bg-card p-5 shadow-card">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">{r.kind === "no-evidence" ? "Gather evidence" : r.kind === "overrated" ? "Check your self-rating" : "Improve"}</p>
                <p className="mt-1 font-medium">{r.message}</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">{r.actions.map((a, j) => <li key={j}>{a}</li>)}</ul>
                {sims[0] && <Button size="sm" variant="outline" className="mt-3" asChild><Link to="/simulations/$slug" params={{ slug: sims[0].slug }}>{r.kind === "no-evidence" ? "Open a simulation" : "Revisit the simulation"}</Link></Button>}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-muted-foreground">Recommendations use only your own feedback and activities available on CareerBridge — no external courses are suggested.</p>
      </section>
    </AppShell>
  );
}

function Bar({ value, tone }: { value: number | undefined; tone: string }) {
  if (value === undefined) return <span className="text-muted-foreground">Not yet</span>;
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 rounded-full bg-muted"><div className={`h-2 rounded-full ${tone}`} style={{ width: `${(value / 5) * 100}%` }} /></div>
      <span className="font-semibold">{value}/5</span>
    </div>
  );
}
