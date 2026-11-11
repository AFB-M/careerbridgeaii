import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BriefcaseBusiness, ClipboardCheck, FileSpreadsheet, FolderKanban, Gauge, RefreshCcw, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/site/SiteHeader";
import hero from "@/assets/hero-analyst.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareerBridge AI — Workplace simulations for Nigerian graduates" },
      { name: "description", content: "Practise realistic workplace tasks, get rubric-based feedback and build a portfolio that proves what you can do. Starting with Entry-Level Data Analyst." },
      { property: "og:title", content: "CareerBridge AI — Workplace simulations for Nigerian graduates" },
      { property: "og:description", content: "From academic knowledge to demonstrable workplace competence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const steps = [
  { icon: Target, title: "Choose your career", text: "Build your profile and pick a target role. We start with Entry-Level Data Analyst." },
  { icon: FileSpreadsheet, title: "Do the real work", text: "Read a workplace brief, download a messy business dataset and complete the assignment yourself." },
  { icon: ClipboardCheck, title: "Get rubric feedback", text: "Your submission is scored against transparent criteria with specific strengths and gaps." },
  { icon: RefreshCcw, title: "Revise and improve", text: "Resubmit, track your progress per competency, and see exactly what changed." },
  { icon: FolderKanban, title: "Prove it", text: "Turn finished work into portfolio evidence that shows employers demonstrated skills." },
];

const benefits = [
  { title: "Experience before your first job", text: "Practise the tasks junior analysts actually do in Lagos banks, retailers and fintechs — not quiz questions." },
  { title: "Feedback you can act on", text: "Every score is tied to a published rubric and to evidence from your own submission." },
  { title: "Demonstrated, not claimed", text: "Your portfolio separates skills you listed from skills you showed in real work." },
  { title: "Built for your schedule", text: "Self-paced simulations you can complete between lectures, NYSC or a current job." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 grid-paper opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-[1.1fr_1fr] md:py-24">
            <div>
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-highlight" /> Now open: Entry-Level Data Analyst pathway
              </p>
              <h1 className="text-4xl font-bold leading-[1.05] text-foreground md:text-6xl">
                From academic knowledge to <span className="text-primary">demonstrable</span> workplace competence.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                Nigerian graduates know the theory but rarely get to practise real work. CareerBridge AI gives you guided workplace simulations, structured feedback against clear rubrics, and portfolio evidence employers can see.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" asChild><Link to="/auth" search={{ mode: "signup" }}>Start practising free <ArrowRight /></Link></Button>
                <Button size="lg" variant="outline" asChild><Link to="/simulations/$slug" params={{ slug: "retail-sales-performance" }}>See a simulation</Link></Button>
              </div>
            </div>
            <div className="relative">
              <img src={hero} alt="A Nigerian graduate analysing a sales dashboard on her laptop" width={1280} height={1024} className="aspect-[5/4] w-full rounded-2xl object-cover shadow-card" />
              <div className="absolute -bottom-6 -left-4 hidden w-64 rounded-xl border bg-card p-4 shadow-card sm:block">
                <p className="text-xs font-medium text-muted-foreground">Your role</p>
                <p className="font-display font-semibold">Junior Data Analyst</p>
                <p className="text-sm text-muted-foreground">Ọjà Mart Retail · Ikeja, Lagos</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y bg-card">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">The gap</p>
              <h2 className="mt-2 text-3xl font-bold">Degrees teach concepts. Employers hire for proof.</h2>
            </div>
            <p className="text-muted-foreground">
              Most students graduate without having cleaned a real dataset, written for a manager, or had their work reviewed against professional standards. Internships are scarce and competitive. CareerBridge AI closes that gap with structured practice that mirrors the workplace — and records what you can actually do.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20" id="how">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">How it works</p>
          <h2 className="mt-2 max-w-2xl text-3xl font-bold md:text-4xl">Five steps from student to job-ready evidence</h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-5">
            {steps.map((s, i) => (
              <li key={s.title} className="rounded-xl border bg-card p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <s.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  <span className="font-display text-sm font-bold text-muted-foreground">0{i + 1}</span>
                </div>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="bg-ink text-ink-foreground">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-highlight">What is a workplace simulation?</p>
              <h2 className="mt-2 text-3xl font-bold md:text-4xl">A realistic assignment, not a lesson.</h2>
              <p className="mt-5 opacity-80">
                Each simulation places you in a role at a fictional Nigerian organisation. You get a business brief, a real-looking dataset with real-world problems, clear deliverables and the exact rubric you'll be assessed on. You do the work in your own tools — Excel, Google Sheets, Python or Power BI — then submit structured answers.
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {[
                [BriefcaseBusiness, "Business context", "Organisation background, stakeholders and the problem to solve."],
                [FileSpreadsheet, "Messy data", "Duplicates, missing values and inconsistent formats — like real exports."],
                [ClipboardCheck, "Transparent rubric", "Weighted criteria published before you start."],
                [Gauge, "Formative feedback", "Clearly labelled as practice feedback, not a certificate."],
              ].map(([Icon, t, d]) => {
                const I = Icon as typeof Gauge;
                return (
                  <li key={t as string} className="rounded-xl border border-sidebar-border bg-sidebar-accent p-5">
                    <I className="h-5 w-5 text-highlight" aria-hidden="true" />
                    <p className="mt-3 font-semibold">{t as string}</p>
                    <p className="mt-1 text-sm opacity-75">{d as string}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">For students and graduates</p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">Why practise on CareerBridge AI</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {benefits.map((b) => (
              <div key={b.title} className="border-l-4 border-highlight pl-5">
                <h3 className="text-lg font-semibold">{b.title}</h3>
                <p className="mt-1 text-muted-foreground">{b.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="grid overflow-hidden rounded-2xl border bg-card shadow-card md:grid-cols-[1.4fr_1fr]">
            <div className="p-8 md:p-10">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Featured simulation</p>
              <h2 className="mt-2 text-3xl font-bold">Retail Sales Performance Analysis</h2>
              <p className="mt-4 text-muted-foreground">
                Join Ọjà Mart, a Lagos retail chain, as a Junior Data Analyst. Clean a year of point-of-sale transactions across four stores and a delivery app, calculate the numbers management relies on, and recommend where to grow next quarter.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-sm">
                {["Data cleaning", "Business indicators", "Trend analysis", "Recommendations"].map((t) => (
                  <span key={t} className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground">{t}</span>
                ))}
              </div>
              <Button className="mt-8" asChild><Link to="/simulations/$slug" params={{ slug: "retail-sales-performance" }}>View the brief <ArrowRight /></Link></Button>
            </div>
            <dl className="grid content-center gap-6 bg-secondary p-8 md:p-10">
              <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Role</dt><dd className="font-display text-lg font-semibold">Junior Data Analyst</dd></div>
              <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Estimated time</dt><dd className="font-display text-lg font-semibold">About 3 hours</dd></div>
              <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Dataset</dt><dd className="font-display text-lg font-semibold">~1,500 sales transactions (CSV)</dd></div>
            </dl>
          </div>
        </section>

        <section className="border-t bg-secondary">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-14 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-bold">Ready to show what you can do?</h2>
              <p className="mt-2 text-muted-foreground">Create your free account and start the Data Analyst pathway today.</p>
            </div>
            <Button size="lg" asChild><Link to="/auth" search={{ mode: "signup" }}>Create your account <ArrowRight /></Link></Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
