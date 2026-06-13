import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, CheckCircle2, Eye, ShieldCheck } from "lucide-react";

import { CoachFacePageShell, PageHero } from "@/components/coachface-page-shell";

const events = [
  { label: "Fourth-down conversion", detail: "Aggressive call, 4th & 2", points: "+4.0" },
  { label: "Red-zone efficiency", detail: "4 touchdowns from 5 visits", points: "+3.5" },
  { label: "Challenge won", detail: "Catch overturned in Q3", points: "+2.0" },
  { label: "Clock management", detail: "Timeout preserved before half", points: "+1.5" },
];

export const Route = createFileRoute("/scoring")({
  head: () => ({ meta: [
    { title: "How CoachFace Scoring Works" },
    { name: "description", content: "Learn how CoachFace turns coaching decisions and results into transparent fantasy points." },
    { property: "og:title", content: "How CoachFace Scoring Works" },
    { property: "og:description", content: "Every coaching score has a traceable reason." },
  ] }),
  component: ScoringPage,
});

function ScoringPage() {
  return (
    <CoachFacePageShell>
      <PageHero eyebrow="No mystery points" title="Every score has a reason." description="CoachFace separates objective game events from analysis. Every point links back to the decision, result, and rule that produced it." aside={<div className="grid grid-cols-2 gap-8"><div><p className="font-display text-4xl font-black">11.0</p><p className="text-sm text-muted-foreground">Decision points</p></div><div><p className="font-display text-4xl font-black">83%</p><p className="text-sm text-muted-foreground">Confidence</p></div></div>} />
      <main className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
        <section className="grid gap-px bg-border md:grid-cols-3">
          {[{ icon: Eye, title: "Observe", text: "Live game data records the call, context, and result." }, { icon: BarChart3, title: "Apply the rule", text: "The scoring engine applies the published rule for that sport." }, { icon: ShieldCheck, title: "Verify", text: "Confidence, source, and any analyst review remain attached." }].map(({ icon: Icon, title, text }, index) => <article key={title} className="bg-background p-7"><span className="font-mono text-xs text-muted-foreground">0{index + 1}</span><Icon className="mt-6 size-7 text-primary" /><h2 className="mt-5 font-display text-2xl font-black uppercase">{title}</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p></article>)}
        </section>
        <section className="mt-16 grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div><p className="eyebrow">Example scorecard</p><h2 className="section-title">One game, fully explained.</h2><p className="mt-5 max-w-md leading-relaxed text-muted-foreground">Positive and negative events combine into a coach's game score. Nothing is added without a source and a matching scoring rule.</p><div className="mt-7 flex items-center gap-2 text-sm font-bold"><CheckCircle2 className="size-5 text-positive" /> Reviewed against live game context</div></div>
          <div className="border-t border-border">{events.map((event) => <div key={event.label} className="grid grid-cols-[1fr_auto] gap-4 border-b border-border py-5"><div><h3 className="font-bold">{event.label}</h3><p className="mt-1 text-sm text-muted-foreground">{event.detail}</p></div><strong className="font-display text-2xl text-positive">{event.points}</strong></div>)}</div>
        </section>
      </main>
    </CoachFacePageShell>
  );
}