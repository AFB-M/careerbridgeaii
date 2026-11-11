import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/Logo";

type Mode = "signin" | "signup" | "forgot";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { mode?: Mode } => ({
    mode: s.mode === "signup" || s.mode === "forgot" ? s.mode : s.mode === "signin" ? "signin" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in or create an account — CareerBridge AI" },
      { name: "description", content: "Access your CareerBridge AI workplace simulations, feedback and portfolio." },
      { property: "og:title", content: "Sign in — CareerBridge AI" },
      { property: "og:description", content: "Access your CareerBridge AI workplace simulations, feedback and portfolio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode = "signin" } = Route.useSearch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const setMode = (m: Mode) => { setSent(null); navigate({ to: "/auth", search: { mode: m }, replace: true }); };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") || "").trim();
    const password = String(f.get("password") || "");
    setLoading(true);
    try {
      if (mode === "signup") {
        const full_name = String(f.get("full_name") || "").trim();
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { full_name } },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/onboarding" });
        else setSent(`We sent a confirmation link to ${email}. Open it to activate your account.`);
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setSent(`If an account exists for ${email}, a password reset link is on its way.`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const title = mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset your password" : "Welcome back";
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-ink p-10 text-ink-foreground md:flex">
        <Logo tone="inverse" />
        <blockquote className="max-w-md">
          <p className="font-display text-3xl font-semibold leading-tight">Practise the work. Get honest feedback. Show the evidence.</p>
          <p className="mt-4 opacity-75">Your simulations, feedback and portfolio stay private to your account.</p>
        </blockquote>
        <p className="text-xs opacity-60">CareerBridge AI · Formative feedback, not certification.</p>
      </aside>
      <main className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 md:hidden"><Logo /></div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {sent ? (
            <div className="mt-6 rounded-lg border bg-secondary p-4 text-sm" role="status">{sent}</div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              {mode === "signup" && (
                <div className="space-y-1.5"><Label htmlFor="full_name">Full name</Label><Input id="full_name" name="full_name" required autoComplete="name" /></div>
              )}
              <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required autoComplete="email" /></div>
              {mode !== "forgot" && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {mode === "signin" && <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary hover:underline">Forgot password?</button>}
                  </div>
                  <Input id="password" name="password" type="password" required minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} />
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Please wait…" : mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"}
              </Button>
            </form>
          )}
          <p className="mt-6 text-sm text-muted-foreground">
            {mode === "signup" ? (
              <>Already have an account? <button className="text-primary hover:underline" onClick={() => setMode("signin")}>Sign in</button></>
            ) : mode === "forgot" ? (
              <button className="text-primary hover:underline" onClick={() => setMode("signin")}>Back to sign in</button>
            ) : (
              <>New here? <button className="text-primary hover:underline" onClick={() => setMode("signup")}>Create an account</button></>
            )}
          </p>
          <p className="mt-8 text-xs text-muted-foreground"><Link to="/" className="hover:underline">← Back to home</Link></p>
        </div>
      </main>
    </div>
  );
}
