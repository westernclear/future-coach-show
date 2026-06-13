import { useState } from "react";
import { ArchOverview } from "./ArchOverview";
import { DomainModules } from "./DomainModules";
import { DatabaseEntities } from "./DatabaseEntities";
import { DataIngestion } from "./DataIngestion";
import { ScoringEngine } from "./ScoringEngine";
import { RealtimeDelivery } from "./RealtimeDelivery";
import { SecurityAuth } from "./SecurityAuth";
import { Observability } from "./Observability";
import { PhasedPlan } from "./PhasedPlan";
import { TechStack } from "./TechStack";
import { cn } from "@/lib/utils";
import { 
  BookOpen, Database, GitBranch, Layers, Radio, Shield, 
  BarChart3, Map, Zap, Server
} from "lucide-react";

const sections = [
  { id: "overview",     label: "System Overview",       icon: Map },
  { id: "stack",        label: "Tech Stack",             icon: Server },
  { id: "domains",      label: "Domain Modules",         icon: Layers },
  { id: "db",           label: "Database Schema",        icon: Database },
  { id: "ingestion",    label: "Event Ingestion",        icon: GitBranch },
  { id: "scoring",      label: "Scoring Engine",         icon: BarChart3 },
  { id: "realtime",     label: "Realtime Delivery",      icon: Radio },
  { id: "security",     label: "Security & Auth",        icon: Shield },
  { id: "observability",label: "Observability",          icon: Zap },
  { id: "phases",       label: "Phased Roadmap",         icon: BookOpen },
];

export function BlueprintApp() {
  const [active, setActive] = useState("overview");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-4 px-4 lg:px-8">
          <a href="/" className="flex items-center gap-2 shrink-0">
            <span className="grid size-8 place-items-center rounded-sm bg-primary font-display text-lg font-black text-primary-foreground">CF</span>
            <span className="hidden font-display text-sm font-black uppercase tracking-tight sm:block">CoachFace</span>
          </a>
          <span className="text-muted-foreground">/</span>
          <span className="font-semibold text-sm">Architecture Blueprint</span>
        </div>
      </header>

      <div className="mx-auto flex max-w-screen-2xl">
        {/* Sidebar nav */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-border py-6 lg:block">
          <p className="mb-3 px-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">Sections</p>
          <nav className="space-y-0.5 px-3">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActive(id);
                  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                  active === id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 px-5 py-10 lg:px-12">
          <div className="mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Read-only · Architecture Document</p>
            <h1 className="font-display text-4xl font-black uppercase tracking-tight lg:text-5xl">
              CoachFace<br />
              <span className="text-muted-foreground">Mega-Scale Blueprint</span>
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
              A complete architecture, domain decomposition, database schema, event pipeline, scoring engine design, 
              realtime delivery, security model, observability stack, and phased build roadmap — 
              grounded in the existing TanStack Start + Supabase prototype.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs">
              {["Baseball","Football","Basketball","Soccer"].map(s => (
                <span key={s} className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1 font-semibold text-primary">{s}</span>
              ))}
              {["Live Data Feeds","Realtime Scoring","Fantasy Game","Public Coach DB","Editorial CMS","Admin Overrides"].map(s => (
                <span key={s} className="rounded-full border border-border px-3 py-1 font-medium text-muted-foreground">{s}</span>
              ))}
            </div>
          </div>

          <div className="space-y-20">
            <SectionWrapper id="overview" onVisible={setActive}><ArchOverview /></SectionWrapper>
            <SectionWrapper id="stack" onVisible={setActive}><TechStack /></SectionWrapper>
            <SectionWrapper id="domains" onVisible={setActive}><DomainModules /></SectionWrapper>
            <SectionWrapper id="db" onVisible={setActive}><DatabaseEntities /></SectionWrapper>
            <SectionWrapper id="ingestion" onVisible={setActive}><DataIngestion /></SectionWrapper>
            <SectionWrapper id="scoring" onVisible={setActive}><ScoringEngine /></SectionWrapper>
            <SectionWrapper id="realtime" onVisible={setActive}><RealtimeDelivery /></SectionWrapper>
            <SectionWrapper id="security" onVisible={setActive}><SecurityAuth /></SectionWrapper>
            <SectionWrapper id="observability" onVisible={setActive}><Observability /></SectionWrapper>
            <SectionWrapper id="phases" onVisible={setActive}><PhasedPlan /></SectionWrapper>
          </div>
        </main>
      </div>
    </div>
  );
}

function SectionWrapper({ id, children, onVisible }: { id: string; children: React.ReactNode; onVisible: (id: string) => void }) {
  return (
    <section
      id={id}
      className="scroll-mt-20"
      ref={(el) => {
        if (!el) return;
        const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) onVisible(id); }, { threshold: 0.15 });
        obs.observe(el);
      }}
    >
      {children}
    </section>
  );
}
