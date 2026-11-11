import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Clock, FolderKanban, MessageSquareText, CheckCircle2, Compass } from "lucide-react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/site/AppShell";
import { Button } from "@/components/ui/button";
import { myProfileQuery } from "@/lib/profile";
import { formatDuration, simulationsQuery } from "@/lib/content";

const myActivityQuery = () =>
  queryOptions({
    queryKey: ["my-activity"],
    queryFn: async () => {
      const [subs, port] = await Promise.all([
        supabase.from("submissions").select("id, status, simulation_id, submitted_at, simulations(title, slug)").order("updated_at", { ascending: false }),
        supabase.from("portfolio_entries").select("id, title, created_at").order("created_at", { ascending: false }),
      ]);
      if (subs.error) throw subs.error;
      if (port.error) throw port.error;
      return { submissions: subs.data, portfolio: port.data };
    },
  });

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — CareerBridge AI" },
      { name: "description", content: "Your simulations, feedback and portfolio at a glance." },
      { property: "og:title", content: "Dashboard — CareerBridge AI" },
      { property: "og:description", content: "Your simulations, feedback and portfolio at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: async ({ context }) => {
    const profile = await context.queryClient.ensureQueryData(myProfileQuery());
    if (!profile?.onboarded_at) throw redirect({ to: "/onboarding" });
    await Promise.all([
      context.queryClient.ensureQueryData(simulationsQuery()),
      context.queryClient.ensureQueryData(myActivityQuery()),
    ]);
  },
  component: Dashboard,
});

function Dashboard() {
  const { data: profile } = useSuspenseQuery(myProfileQuery());
  const { data: sims } = useSuspenseQuery(simulationsQuery());
  const { data: activity } = useSuspenseQuery(myActivityQuery());
  const firstName = profile?.full_name?.split(" ")[0] ?? "there";
  const completed = activity.submissions.filter((s) => s.status === "completed");
  const startedIds = new Set(activity.submissions.map((s) => s.simulation_id));
  const next = sims.find((s) => !startedIds.has(s.id)) ?? sims[0];

  return (
    <AppShell>
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-muted-foreground">{profile?.institution} · {profile?.course_of_study}</p>
          <h1 className="mt-1 text-3xl font-bold md:text-4xl">Welcome, {firstName}</h1>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 shadow-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Current pathway</p>
          <Link to="/pathway" className="font-display font-semibold text-primary hover:underline">{profile?.career_paths?.title ?? "Not selected"}</Link>
        </div>
      </section>

      {next && (
        <section className="mt-8 overflow-hidden rounded-2xl bg-ink p-6 text-ink-foreground md:p-8">
          <p className="flex items-center gap-2 text-sm font-semibold text-highlight"><Compass className="h-4 w-4" /> Recommended next activity</p>
          <h2 className="mt-2 text-2xl font-bold">{next.title}</h2>
          <p className="mt-2 max-w-2xl opacity-80">Step into the role of {next.role_title} at {next.organisation_name}. Read the brief, download the dataset and work through the tasks.</p>
          <Button variant="highlight" className="mt-5" asChild>
            <Link to="/simulations/$slug" params={{ slug: next.slug }}>Open the brief <ArrowRight /></Link>
          </Button>
        </section>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Panel title="Available simulations" icon={<Clock className="h-4 w-4" />} count={sims.length} className="lg:col-span-2">
          <ul className="divide-y">
            {sims.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <Link to="/simulations/$slug" params={{ slug: s.slug }} className="font-medium hover:text-primary">{s.title}</Link>
                  <p className="text-sm text-muted-foreground">{s.difficulty} · {formatDuration(s.estimated_minutes)}</p>
                </div>
                <Button size="sm" variant="outline" asChild><Link to="/simulations/$slug" params={{ slug: s.slug }}>View</Link></Button>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Completed simulations" icon={<CheckCircle2 className="h-4 w-4" />} count={completed.length}>
          {completed.length ? (
            <ul className="space-y-2 text-sm">{completed.map((c) => <li key={c.id}>{c.simulations?.title}</li>)}</ul>
          ) : (
            <Empty>You haven't completed a simulation yet. Finished simulations will appear here.</Empty>
          )}
        </Panel>
        <Panel title="Recent assessment feedback" icon={<MessageSquareText className="h-4 w-4" />} className="lg:col-span-2">
          <Empty>No feedback yet. Once you submit a simulation, rubric-based feedback for each criterion will appear here.</Empty>
        </Panel>
        <Panel title="Portfolio projects" icon={<FolderKanban className="h-4 w-4" />} count={activity.portfolio.length}>
          {activity.portfolio.length ? (
            <ul className="space-y-2 text-sm">{activity.portfolio.map((p) => <li key={p.id}>{p.title}</li>)}</ul>
          ) : (
            <Empty>No portfolio projects yet. Completed work can be turned into portfolio evidence.</Empty>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}

function Panel({ title, icon, count, children, className }: { title: string; icon: ReactNode; count?: number; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border bg-card p-5 shadow-card ${className ?? ""}`}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold"><span className="text-primary">{icon}</span>{title}</h2>
        {count !== undefined && <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">{count}</span>}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">{children}</p>;
}
