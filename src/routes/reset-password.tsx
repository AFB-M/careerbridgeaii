import { useHydrated, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — CareerBridge AI" },
      { name: "description", content: "Choose a new password for your CareerBridge AI account." },
      { property: "og:title", content: "Set a new password — CareerBridge AI" },
      { property: "og:description", content: "Choose a new password for your CareerBridge AI account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const hydrated = useHydrated();
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => { if (event === "PASSWORD_RECOVERY") setReady(true); });
    if (window.location.hash.includes("type=recovery")) setReady(true);
    supabase.auth.getSession().then(({ data: d }) => { if (d.session) setReady(true); });
    return () => data.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const password = String(f.get("password"));
    if (password !== String(f.get("confirm"))) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated");
    navigate({ to: "/dashboard" });
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8"><Logo /></div>
        <h1 className="text-3xl font-bold">Set a new password</h1>
        {!ready ? (
          <p className="mt-4 text-sm text-muted-foreground">Open this page from the reset link in your email. If the link has expired, request a new one from the sign-in page.</p>
        ) : (
          <form method="post" onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5"><Label htmlFor="password">New password</Label><Input id="password" name="password" type="password" minLength={8} required autoComplete="new-password" /></div>
            <div className="space-y-1.5"><Label htmlFor="confirm">Confirm password</Label><Input id="confirm" name="confirm" type="password" minLength={8} required autoComplete="new-password" /></div>
            <Button className="w-full" disabled={loading || !hydrated}>{loading ? "Saving…" : "Update password"}</Button>
          </form>
        )}
      </div>
    </main>
  );
}
