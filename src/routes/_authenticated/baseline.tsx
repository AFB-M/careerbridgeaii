import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/site/AppShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { careerPathQuery } from "@/lib/content";
import { mySelfRatingsQuery } from "@/lib/skills-queries";

const scale = ["Never done it", "Know the idea", "Done it with help", "Do it on my own", "Could teach it"];

export const Route = createFileRoute("/_authenticated/baseline")({
  head: () => ({
    meta: [
      { title: "Baseline self-assessment — CareerBridge AI" },
      { name: "description", content: "Rate your starting confidence in each Data Analyst competency." },
      { property: "og:title", content: "Baseline self-assessment — CareerBridge AI" },
      { property: "og:description", content: "Rate your starting confidence in each Data Analyst competency." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => Promise.all([
    context.queryClient.ensureQueryData(careerPathQuery("data-analyst")),
    context.queryClient.ensureQueryData(mySelfRatingsQuery()),
  ]),
  component: Baseline,
});

function Baseline() {
  const { data: path } = useSuspenseQuery(careerPathQuery("data-analyst"));
  const { data: ratings } = useSuspenseQuery(mySelfRatingsQuery());
  const current = Object.fromEntries(ratings.map((r) => [r.competency_id, r]));
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const comps = path?.competencies ?? [];

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const { data: u } = await supabase.auth.getUser();
    const rows = comps.flatMap((c) => {
      const r = Number(f.get(`r-${c.id}`));
      return r ? [{ user_id: u.user!.id, competency_id: c.id, rating: r, note: String(f.get(`n-${c.id}`) ?? "").slice(0, 300) || null, updated_at: new Date().toISOString() }] : [];
    });
    if (rows.length < comps.length) return toast.error("Please rate every competency.");
    setBusy(true);
    const { error } = await supabase.from("skill_self_ratings").upsert(rows, { onConflict: "user_id,competency_id" });
    setBusy(false);
    if (error) return toast.error("Could not save your ratings");
    await qc.invalidateQueries();
    toast.success("Baseline saved");
    navigate({ to: "/skills" });
  }

  return (
    <AppShell>
      <h1 className="text-3xl font-bold">Baseline self-assessment</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">Be honest — this is your starting point, not a test. These ratings stay labelled as <strong>self-reported</strong> and are compared with what your submitted work actually shows.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <fieldset disabled={busy} className="space-y-4">
          {comps.map((c) => (
            <div key={c.id} className="rounded-xl border bg-card p-5 shadow-card">
              <p className="font-display font-semibold">{c.title}</p>
              {c.description && <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>}
              <div className="mt-4 grid gap-2 sm:grid-cols-5" role="radiogroup" aria-label={c.title}>
                {scale.map((label, i) => (
                  <label key={i} className="flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-secondary">
                    <input type="radio" name={`r-${c.id}`} value={i + 1} defaultChecked={current[c.id]?.rating === i + 1} className="accent-primary" />
                    <span><strong>{i + 1}</strong> · {label}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3 space-y-1">
                <Label htmlFor={`n-${c.id}`} className="text-xs text-muted-foreground">Where have you used this? (optional)</Label>
                <Input id={`n-${c.id}`} name={`n-${c.id}`} maxLength={300} defaultValue={current[c.id]?.note ?? ""} />
              </div>
            </div>
          ))}
        </fieldset>
        <Button type="submit" size="lg" disabled={busy}>Save baseline</Button>
      </form>
    </AppShell>
  );
}
