import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Building2, Clock, Gauge } from "lucide-react";
import { PageFrame } from "@/components/site/PageFrame";
import { formatDuration, simulationsQuery } from "@/lib/content";

export const Route = createFileRoute("/simulations/")({
  head: () => ({
    meta: [
      { title: "Workplace simulations — CareerBridge AI" },
      { name: "description", content: "Realistic workplace assignments set in Nigerian organisations. Practise the work junior professionals actually do." },
      { property: "og:title", content: "Workplace simulations — CareerBridge AI" },
      { property: "og:description", content: "Realistic workplace assignments set in Nigerian organisations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(simulationsQuery()),
  component: Catalogue,
});

function Catalogue() {
  const { data: sims } = useSuspenseQuery(simulationsQuery());
  return (
    <PageFrame>
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">Simulation catalogue</p>
      <h1 className="mt-2 text-4xl font-bold">Workplace simulations</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">Each simulation is a realistic assignment with a business brief, dataset and published assessment rubric. More pathways and simulations are coming.</p>
      <ul className="mt-10 grid gap-6 md:grid-cols-2">
        {sims.map((s) => (
          <li key={s.id}>
            <Link to="/simulations/$slug" params={{ slug: s.slug }} className="group block h-full rounded-xl border bg-card p-6 shadow-card transition hover:border-primary">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.career_paths?.title}</p>
              <h2 className="mt-2 text-xl font-bold group-hover:text-primary">{s.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{s.business_problem}</p>
              <dl className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <div className="flex items-center gap-1.5"><Building2 className="h-4 w-4 text-primary" /><dt className="sr-only">Organisation</dt><dd>{s.organisation_name}</dd></div>
                <div className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary" /><dt className="sr-only">Time</dt><dd>{formatDuration(s.estimated_minutes)}</dd></div>
                <div className="flex items-center gap-1.5"><Gauge className="h-4 w-4 text-primary" /><dt className="sr-only">Difficulty</dt><dd>{s.difficulty}</dd></div>
              </dl>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">View brief <ArrowRight className="h-4 w-4" /></span>
            </Link>
          </li>
        ))}
      </ul>
    </PageFrame>
  );
}
