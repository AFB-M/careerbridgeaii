import type { ReactNode } from "react";
import { useSession } from "@/lib/session";
import { AppShell } from "./AppShell";
import { SiteFooter, SiteHeader } from "./SiteHeader";

/** Public content pages: app navigation when signed in, marketing header otherwise. */
export function PageFrame({ children }: { children: ReactNode }) {
  const { session, ready } = useSession();
  if (ready && session) return <AppShell>{children}</AppShell>;
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
      <SiteFooter />
    </div>
  );
}
