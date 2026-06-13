import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, CirclePlay, Flame, Radio, Sparkles, Users } from "lucide-react";

import stadiumImage from "@/assets/coachface-stadium.jpg";
import { CoachFacePageShell, PageHero } from "@/components/coachface-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/the-show")({
  head: () => ({ meta: [
    { title: "The CoachFace Show" },
    { name: "description", content: "Watch the weekly CoachFace show covering bold calls, hot seats, rankings, and fan debate." },
    { property: "og:title", content: "The CoachFace Show" },
    { property: "og:description", content: "The calls everyone is already arguing about." },
  ] }),
  component: ShowPage,
});

function ShowPage() {
  const segments = [
    { icon: Flame, title: "Hot Seat Index", text: "The pressure shifts after every game, and we show exactly why." },
    { icon: Users, title: "Fan Verdict", text: "Fans vote on the week's most disputed coaching decisions." },
    { icon: BarChart3, title: "Film-Room Grades", text: "Every major call is measured against context, outcome, and risk." },
    { icon: Sparkles, title: "The Recap", text: "A fast finish covering risers, fallers, and the next slate." },
  ];
  return (
    <CoachFacePageShell>
      <PageHero eyebrow="Weekly live" title="The calls everyone is arguing about." description="A fast weekly show where hosts draft coaches, break down the biggest decisions, reveal the leaderboard, and let fans make the call." aside={<Badge className="w-fit rounded-sm px-3 py-2 uppercase tracking-wider"><Radio className="mr-2 size-3" /> New episode Friday</Badge>} />
      <main>
        <section className="mx-auto grid max-w-7xl lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative min-h-[440px] overflow-hidden bg-foreground"><img src={stadiumImage} alt="Stadium tunnel prepared for The CoachFace Show" width={1536} height={1024} className="absolute inset-0 h-full w-full object-cover opacity-60" /><div className="absolute inset-0 grid place-items-center bg-media-overlay"><Button size="lg" className="rounded-full px-6" onClick={() => alert("The first CoachFace episode is coming soon.")}><CirclePlay className="size-5" /> Watch latest episode</Button></div></div>
          <div className="flex flex-col justify-center bg-foreground px-7 py-12 text-background lg:px-12"><p className="eyebrow">Episode 01</p><h2 className="mt-4 font-display text-4xl font-black uppercase leading-none">Fourth down, final say</h2><p className="mt-5 leading-relaxed text-game-muted">Why three aggressive calls changed the rankings, which dugouts found an edge, and who fans trust with the next possession.</p><Button variant="outline" asChild className="mt-8 w-fit border-game-border bg-transparent text-background hover:bg-game-selected hover:text-background"><Link to="/rankings">View this week's rankings</Link></Button></div>
        </section>
        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><p className="eyebrow">Inside every episode</p><h2 className="section-title">Four segments. No soft takes.</h2><div className="mt-10 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">{segments.map(({ icon: Icon, title, text }) => <article key={title} className="bg-background p-6"><Icon className="size-6 text-primary" /><h3 className="mt-6 font-display text-xl font-black uppercase">{title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p></article>)}</div></section>
      </main>
    </CoachFacePageShell>
  );
}