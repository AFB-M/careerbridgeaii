import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Building2, Clock, Download, FileSpreadsheet, Gauge, Info, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { PageFrame } from "@/components/site/PageFrame";
import { Button } from "@/components/ui/button";
import { formatDuration, simulationQuery } from "@/lib/content";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/simulations/$slug")({
  loader: async ({ context, params }) => {
    const sim = await context.queryClient.ensureQueryData(simulationQuery(params.slug));
    if (!sim) throw notFound();
    return { title: sim.title, org: sim.organisation_name };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.title} — CareerBridge AI` : "Simulation — CareerBridge AI";
    const description = loaderData ? `A workplace simulation at ${loaderData.org}, Lagos. Read the brief, download the dataset and see the assessment rubric.` : "Workplace simulation";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  notFoundComponent: () => <PageFrame><h1 className="text-2xl font-bold">Simulation not found</h1><Link to="/simulations" className="text-primary">Back to catalogue</Link></PageFrame>,
  component: SimulationDetail,
});

function SimulationDetail() {
  const { slug } = Route.useParams();
  const { data: s } = useSuspenseQuery(simulationQuery(slug));
  const { session } = useSession();
  if (!s) return null;
  return (
    <PageFrame>
      <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/simulations" className="hover:text-foreground">Simulations</Link> / <span>{s.title}</span>
      </nav>
      <header className="mt-4 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">{s.career_paths?.title}</p>
          <h1 className="mt-2 text-4xl font-bold">{s.title}</h1>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4 md:grid-cols-2">
          <Meta icon={<UserRound />} label="Your role" value={s.role_title} />
          <Meta icon={<Building2 />} label="Organisation" value={s.organisation_name} />
          <Meta icon={<Clock />} label="Estimated time" value={formatDuration(s.estimated_minutes)} />
          <Meta icon={<Gauge />} label="Difficulty" value={s.difficulty} />
        </dl>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          <Section title="Organisation background"><p>{s.organisation_background}</p></Section>
          <Section title="The business problem"><p>{s.business_problem}</p></Section>
          <Section title="Your responsibilities">
            <ul className="list-disc space-y-1.5 pl-5">{s.responsibilities.map((r) => <li key={r}>{r}</li>)}</ul>
          </Section>
          <Section title="Assignment tasks">
            <ol className="space-y-4">
              {s.simulation_tasks.map((t) => (
                <li key={t.id} className="flex gap-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary font-display text-sm font-bold text-primary">{t.position}</span>
                  <div><p className="font-semibold text-foreground">{t.title}</p><p className="text-sm">{t.instructions}</p></div>
                </li>
              ))}
            </ol>
          </Section>
          <Section title="Expected deliverables">
            <ul className="list-disc space-y-1.5 pl-5">{s.deliverables.map((d) => <li key={d}>{d}</li>)}</ul>
          </Section>
          <Section title="Assessment criteria">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                  <tr><th className="py-2 pr-4">Criterion</th><th className="py-2 pr-4">What we look for</th><th className="py-2 text-right">Weight</th></tr>
                </thead>
                <tbody className="divide-y">
                  {s.rubric_criteria.map((c) => (
                    <tr key={c.id}>
                      <td className="py-3 pr-4 font-semibold text-foreground">{c.title}<p className="text-xs font-normal text-muted-foreground">{c.competencies?.title}</p></td>
                      <td className="py-3 pr-4">{c.description}</td>
                      <td className="py-3 text-right font-display font-bold text-foreground">{c.weight}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 flex gap-2 rounded-lg bg-muted p-3 text-xs"><Info className="h-4 w-4 shrink-0" />Feedback on this simulation is formative AI-assisted practice feedback. It is not an independently verified professional certification.</p>
          </Section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <h2 className="flex items-center gap-2 font-display font-semibold"><FileSpreadsheet className="h-5 w-5 text-primary" />Dataset</h2>
            <p className="mt-2 text-sm text-muted-foreground">{s.dataset_description}</p>
            {s.dataset_filename && (
              <Button className="mt-4 w-full" asChild>
                <a href={`/datasets/${s.dataset_filename}`} download><Download /> Download {s.dataset_filename}</a>
              </Button>
            )}
            <p className="mt-3 text-xs text-muted-foreground">Use any tool you like: Excel, Google Sheets, Python, R or Power BI.</p>
          </div>
          <div className="rounded-xl border bg-secondary p-5">
            <h2 className="font-display font-semibold">Submitting your work</h2>
            <p className="mt-2 text-sm text-muted-foreground">When you've finished, write up each task and your key figures to get feedback against the criteria. You can revise and resubmit as many times as you like.</p>
            {session ? (
              <Button className="mt-4 w-full" asChild><Link to="/submit/$slug" params={{ slug: s.slug }}>Submit your work</Link></Button>
            ) : (
              <Button variant="outline" className="mt-4 w-full" asChild><Link to="/auth" search={{ mode: "signup" }}>Create an account to submit</Link></Button>
            )}
          </div>
        </aside>
      </div>
    </PageFrame>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-6 shadow-card">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-3 text-muted-foreground">{children}</div>
    </section>
  );
}

function Meta({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground [&_svg]:h-3.5 [&_svg]:w-3.5">{icon}{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}
