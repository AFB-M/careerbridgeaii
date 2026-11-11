import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { useSession } from "@/lib/session";

export function SiteHeader() {
  const { session } = useSession();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link to="/pathway" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>Data Analyst pathway</Link>
          <Link to="/simulations" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>Simulations</Link>
        </nav>
        <div className="flex items-center gap-2">
          {session ? (
            <Button asChild><Link to="/dashboard">Dashboard</Link></Button>
          ) : (
            <>
              <Button variant="ghost" asChild><Link to="/auth" search={{ mode: "signin" }}>Sign in</Link></Button>
              <Button asChild><Link to="/auth" search={{ mode: "signup" }}>Get started</Link></Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div className="space-y-3">
          <Logo tone="inverse" />
          <p className="text-sm opacity-75">From academic knowledge to demonstrable workplace competence.</p>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold">Explore</p>
          <ul className="space-y-2 opacity-80">
            <li><Link to="/pathway">Data Analyst pathway</Link></li>
            <li><Link to="/simulations">Workplace simulations</Link></li>
            <li><Link to="/auth" search={{ mode: "signup" }}>Create an account</Link></li>
          </ul>
        </div>
        <p className="text-xs opacity-70">
          Built for the Wale Lab NextGen AI Hackathon 2026 · Track 2: Bridging the University-to-Work Gap.
          Feedback on CareerBridge AI is formative and is not a professional certification.
        </p>
      </div>
    </footer>
  );
}
