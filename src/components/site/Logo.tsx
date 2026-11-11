import { Link } from "@tanstack/react-router";

export function Logo({ tone = "default" }: { tone?: "default" | "inverse" }) {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="CareerBridge AI home">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
          <path d="M3 17c3-6 6-9 9-9s6 3 9 9" strokeLinecap="round" />
          <path d="M7 17v-4M12 17V8M17 17v-4" strokeLinecap="round" />
        </svg>
      </span>
      <span className={`font-display text-lg font-bold tracking-tight ${tone === "inverse" ? "text-ink-foreground" : "text-foreground"}`}>
        CareerBridge<span className="text-highlight"> AI</span>
      </span>
    </Link>
  );
}
