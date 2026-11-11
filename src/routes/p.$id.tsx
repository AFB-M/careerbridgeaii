import { createFileRoute, notFound } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { PageFrame } from "@/components/site/PageFrame";
import { getPublicPortfolioEntry } from "@/lib/portfolio/portfolio.functions";

export const Route = createFileRoute("/p/$id")({
  loader: async ({ params }) => {
    if (!/^[0-9a-f-]{36}$/i.test(params.id)) throw notFound();
    const entry = await getPublicPortfolioEntry({ data: { id: params.id } });
    if (!entry) throw notFound();
    return entry;
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.owner_name ?? "A student"} — ${loaderData.title} | CareerBridge AI` : "Portfolio — CareerBridge AI";
    const d = loaderData?.summary?.slice(0, 155) ?? "Assessed workplace simulation evidence on CareerBridge AI.";
    return { meta: [
      { title: t }, { name: "description", content: d },
      { property: "og:title", content: t }, { property: "og:description", content: d },
      { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" },
    ] };
  },
  notFoundComponent: () => <PageFrame><p className="py-20 text-center text-muted-foreground">This portfolio entry is private or doesn't exist.</p></PageFrame>,
  component: PublicEntry,
});

function PublicEntry() {
  const e = Route.useLoaderData();
  const scores = (e.competency_scores ?? []) as { title: string; criterion: string; score: number }[];
  const highlights = (e.highlights ?? []) as string[];
  return (
    <PageFrame>
      <article className="mx-auto max-w-3xl py-10">
        <p className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Simulated workplace project</p>
        <p className="mt-2 text-sm text-muted-foreground">Portfolio evidence · {new Date(e.created_at).toLocaleDateString()}</p>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">{e.title}</h1>
        {e.owner_name && <p className="mt-1 text-lg">by {e.owner_name}</p>}
        <p className="mt-3 text-sm text-muted-foreground">Practice work completed on a fictional company scenario in CareerBridge AI. It is not employment history.</p>
        <div className="mt-6 flex items-center gap-6 rounded-2xl bg-ink p-6 text-ink-foreground">
          <div className="text-center"><p className="text-xs uppercase opacity-70">Overall</p><p className="font-display text-5xl font-bold text-highlight">{Number(e.overall_score)}</p><p className="text-xs opacity-70">out of 100</p><p className="mt-1 text-[10px] uppercase opacity-70">AI-assisted</p></div>
          {e.summary && <p className="opacity-90">{e.summary}</p>}
        </div>
        <h2 className="mt-8 font-display text-xl font-semibold">Competencies demonstrated through submitted work</h2>
        <p className="mt-1 text-sm text-muted-foreground">Scored 1–5 by AI-assisted formative assessment of the written submission. Self-reported skill ratings are not shown here.</p>
        <ul className="mt-3 divide-y rounded-xl border bg-card">
          {scores.map((s, i) => (
            <li key={i} className="flex items-center justify-between gap-4 p-4">
              <div><p className="font-medium">{s.criterion}</p><p className="text-xs text-muted-foreground">{s.title}</p></div>
              <span className="font-display font-bold text-primary">{s.score}/5</span>
            </li>
          ))}
        </ul>
        {highlights.length > 0 && <>
          <h2 className="mt-8 font-display text-xl font-semibold">Strengths noted in the AI-assisted feedback</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5">{highlights.map((h, i) => <li key={i}>{h}</li>)}</ul>
        </>}
        <p className="mt-8 flex gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground"><Info className="h-4 w-4 shrink-0" />Scores come from formative AI-assisted feedback on a CareerBridge workplace simulation. It is not a professional certification, not employment history and has not been independently verified.</p>
      </article>
    </PageFrame>
  );
}
