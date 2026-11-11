import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";

export function AppShell({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { mode: "signin" }, replace: true });
  }
  const link = "shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground";
  const active = { className: "bg-secondary text-secondary-foreground" };
  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-40 border-b bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-[auto_auto] items-center justify-between gap-x-4 px-4 py-2 md:flex md:h-16 md:py-0">
          <Logo />
          <nav aria-label="Main" className="col-span-2 row-start-2 -mx-4 flex items-center gap-1 overflow-x-auto px-4 pb-1 md:col-span-1 md:row-start-auto md:mx-0 md:px-0 md:pb-0">
            <Link to="/dashboard" className={link} activeProps={active}>Dashboard</Link>
            <Link to="/pathway" className={link} activeProps={active}>Pathway</Link>
            <Link to="/simulations" className={link} activeProps={active}>Simulations</Link>
            <Link to="/skills" className={link} activeProps={active}>Skills</Link>
            <Link to="/portfolio" className={link} activeProps={active}>Portfolio</Link>
            <Link to="/onboarding" className={link} activeProps={active}>Profile</Link>
          </nav>
          <Button variant="ghost" size="sm" onClick={signOut}><LogOut /> <span className="hidden sm:inline">Sign out</span></Button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
