import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/site/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { careerPathsQuery, myProfileQuery } from "@/lib/profile";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Your career profile — CareerBridge AI" },
      { name: "description", content: "Tell us about your studies and target career." },
      { property: "og:title", content: "Your career profile — CareerBridge AI" },
      { property: "og:description", content: "Tell us about your studies and target career." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([context.queryClient.ensureQueryData(myProfileQuery()), context.queryClient.ensureQueryData(careerPathsQuery())]),
  component: Onboarding,
});

function Onboarding() {
  const { data: profile } = useSuspenseQuery(myProfileQuery());
  const { data: paths } = useSuspenseQuery(careerPathsQuery());
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const isFirst = !profile?.onboarded_at;
  const year = new Date().getFullYear();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const gy = Number(f.get("graduation_year"));
    const payload = {
      id: user.id,
      full_name: String(f.get("full_name")).trim(),
      institution: String(f.get("institution")).trim(),
      course_of_study: String(f.get("course_of_study")).trim(),
      graduation_year: Number.isFinite(gy) ? gy : null,
      location: String(f.get("location")).trim(),
      target_career_path_id: String(f.get("target_career_path_id")) || null,
      onboarded_at: profile?.onboarded_at ?? new Date().toISOString(),
    };
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    await qc.invalidateQueries({ queryKey: ["my-profile"] });
    toast.success("Profile saved");
    if (isFirst) navigate({ to: "/dashboard" });
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">{isFirst ? "Set up your career profile" : "Your career profile"}</h1>
        <p className="mt-2 text-muted-foreground">This helps us tailor simulations and feedback. You can update it any time.</p>
        <form onSubmit={onSubmit} className="mt-8 grid gap-5 rounded-xl border bg-card p-6 shadow-card sm:grid-cols-2">
          <Field label="Full name" name="full_name" defaultValue={profile?.full_name} autoComplete="name" className="sm:col-span-2" />
          <Field label="University / institution" name="institution" defaultValue={profile?.institution} placeholder="e.g. University of Lagos" className="sm:col-span-2" />
          <Field label="Course of study" name="course_of_study" defaultValue={profile?.course_of_study} placeholder="e.g. B.Sc. Economics" />
          <div className="space-y-1.5">
            <Label htmlFor="graduation_year">Graduation year</Label>
            <Input id="graduation_year" name="graduation_year" type="number" min={1990} max={year + 8} required defaultValue={profile?.graduation_year ?? ""} />
          </div>
          <Field label="Location" name="location" defaultValue={profile?.location} placeholder="e.g. Ibadan, Oyo State" />
          <div className="space-y-1.5">
            <Label htmlFor="target_career_path_id">Target career</Label>
            <select id="target_career_path_id" name="target_career_path_id" required defaultValue={profile?.target_career_path_id ?? paths[0]?.id ?? ""} className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              {paths.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : isFirst ? "Save and continue" : "Save changes"}</Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

function Field({ label, name, defaultValue, className, ...rest }: { label: string; name: string; defaultValue?: string | null | undefined; className?: string | undefined; placeholder?: string | undefined; autoComplete?: string | undefined }) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} required defaultValue={defaultValue ?? ""} maxLength={150} {...rest} />
    </div>
  );
}
