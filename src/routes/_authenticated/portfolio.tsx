import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/site/AppShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { myPortfolioQuery } from "@/lib/skills-queries";
import { setPortfolioVisibility } from "@/lib/portfolio/portfolio.functions";

export const Route = createFileRoute("/_authenticated/portfolio")({
  head: () => ({
    meta: [
      { title: "My portfolio — CareerBridge AI" },
      { name: "description", content: "Manage and share evidence of your assessed simulation work." },
      { property: "og:title", content: "My portfolio — CareerBridge AI" },
      { property: "og:description", content: "Manage and share evidence of your assessed simulation work." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(myPortfolioQuery()),
  component: Portfolio,
});

function Portfolio() {
  const { data: entries } = useSuspenseQuery(myPortfolioQuery());
  const setVis = useServerFn(setPortfolioVisibility);
  const qc = useQueryClient();

  async function toggle(id: string, isPublic: boolean) {
    try { await setVis({ data: { id, isPublic } }); await qc.invalidateQueries({ queryKey: ["my-portfolio"] }); }
    catch { toast.error("Could not update sharing"); }
  }
  async function remove(id: string) {
    const { error } = await supabase.from("portfolio_entries").delete().eq("id", id);
    if (error) { toast.error("Could not remove"); return; }
    await qc.invalidateQueries();
  }
  function copy(id: string) {
    navigator.clipboard.writeText(`${window.location.origin}/p/${id}`);
    toast.success("Link copied");
  }

  return (
    <AppShell>
      <h1 className="text-3xl font-bold">My portfolio</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">Assessed work you've chosen to keep as evidence. Entries are private until you switch on sharing; shared pages show your summary and scores, never your full answers or files. Your self-reported skill ratings stay private and are never mixed with these scores.</p>
      {!entries.length ? (
        <div className="mt-8 rounded-xl border bg-card p-6 shadow-card">
          <p>No entries yet. Open a completed feedback report and choose <strong>Add to portfolio</strong>.</p>
          <Button className="mt-4" variant="outline" asChild><Link to="/dashboard">Go to dashboard</Link></Button>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {entries.map((e) => (
            <li key={e.id} className="rounded-xl border bg-card p-5 shadow-card">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">Simulated workplace project</p>
                  <p className="font-display text-lg font-semibold">{e.title}</p>
                  <p className="text-sm text-muted-foreground">Added {new Date(e.created_at).toLocaleDateString()} · Overall {Number(e.overall_score)}/100 (AI-assisted formative assessment)</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-2 text-sm"><Switch checked={e.is_public} onCheckedChange={(v) => toggle(e.id, v)} aria-label="Share publicly" /> {e.is_public ? "Shared" : "Private"}</label>
                  {e.is_public && <>
                    <Button size="sm" variant="outline" onClick={() => copy(e.id)}><Copy /> Copy link</Button>
                    <Button size="sm" variant="ghost" asChild><Link to="/p/$id" params={{ id: e.id }}><ExternalLink /> View</Link></Button>
                  </>}
                  {e.submission_id && <Button size="sm" variant="ghost" asChild><Link to="/feedback/$id" params={{ id: e.submission_id }}>Feedback</Link></Button>}
                  <Button size="sm" variant="ghost" onClick={() => remove(e.id)} aria-label="Remove"><Trash2 /></Button>
                </div>
              </div>
              {e.summary && <p className="mt-3 text-sm">{e.summary}</p>}
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
