import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Check } from "lucide-react";
import { PageFrame } from "@/components/site/PageFrame";
import { Button } from "@/components/ui/button";
import { careerPathQuery } from "@/lib/content";

export const Route = createFileRoute("/pathway")({
  head: () => ({
    meta: [
      { title: "Entry-Level Data Analyst pathway — CareerBridge AI" },
      { name: "description", content: "The five competencies you will practise and demonstrate on the CareerBridge AI Data Analyst pathway." },
      { property: "og:title", content: "Entry-Level Data Analyst pathway — CareerBridge AI" },
      { property: "og:description", content: "Data cleaning, analysis, insight, visualisation and business communication — practised through real workplace simulations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(careerPathQuery("data-analyst")),
  component: Pathway,
});

function Pathway() {
  const { data: path } = useSuspenseQuery(careerPathQuery("data-analyst"));
  if (!path) return <PageFrame><p>Pathway not found.</p></PageFrame>;
  return (
    <PageFrame>
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">Career pathway</p>
      <h1 className="mt-2 text-4xl font-bold">{path.title}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{path.summary}</p>
      <p className="mt-4 max-w-3xl text-muted-foreground">{path.description}</p>

      <h2 className="mt-12 text-2xl font-bold">Competencies you will demonstrate</h2>
      <ol className="mt-6 grid gap-4 md:grid-cols-2">
        {path.competencies.map((c) => (
          <li key={c.id} className="rounded-xl border bg-card p-6 shadow-card">
            <div className="flex items-start gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-secondary font-display font-bold text-primary">{c.position}</span>
              <div>
                <h3 className="text-lg font-semibold">{c.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                <ul className="mt-3 space-y-1.5">
                  {c.indicators.map((i) => (
                    <li key={i} className="flex gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />{i}</li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-10">
        <Button asChild><Link to="/simulations">Browse simulations <ArrowRight /></Link></Button>
      </div>
    </PageFrame>
  );
}
