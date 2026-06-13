import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, CalendarDays, Minus, Radio, Zap } from "lucide-react";

import { CoachFacePageShell, PageHero } from "@/components/coachface-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const coaches = [
  { rank: 1, previous: 3, initials: "AR", name: "Andy Reid", sport: "NFL Football", role: "Kansas City Chiefs", score: 94.2, change: "+3.8", form: "W W W L W", reason: "Elite fourth-down decisions and complete control of the closing drive." },
  { rank: 2, previous: 2, initials: "MD", name: "Mark Daigneault", sport: "Basketball", role: "Oklahoma City Thunder", score: 93.1, change: "+2.4", form: "W W W W W", reason: "Perfect week powered by sharp rotations and relentless defensive adjustments." },
  { rank: 3, previous: 5, initials: "DR", name: "Dave Roberts", sport: "Baseball", role: "Los Angeles Dodgers", score: 91.8, change: "+1.7", form: "W W L W W", reason: "Bullpen timing and matchup management swung two close games." },
  { rank: 4, previous: 6, initials: "MA", name: "Mikel Arteta", sport: "Premier League", role: "Arsenal", score: 90.6, change: "+1.3", form: "W D W W W", reason: "A decisive halftime shape change unlocked another statement result." },
  { rank: 5, previous: 9, initials: "LE", name: "Luis Enrique", sport: "Champions League", role: "Paris Saint-Germain", score: 89.9, change: "+4.1", form: "W W W W W", reason: "The week's biggest riser after a fearless European tactical performance." },
  { rank: 6, previous: 4, initials: "HF", name: "Hansi Flick", sport: "La Liga", role: "FC Barcelona", score: 88.7, change: "+2.0", form: "W W D W W", reason: "Strong attacking output, held back by late-game control in the draw." },
  { rank: 7, previous: 8, initials: "FL", name: "Frank Lampard", sport: "Championship League", role: "Coventry City", score: 86.5, change: "+1.8", form: "W D W L W", reason: "A high-risk press delivered points and moved Coventry up the table." },
  { rank: 8, previous: 7, initials: "RS", name: "Randy Smith", sport: "Golf", role: "Coach to Scottie Scheffler", score: 84.4, change: "+0.9", form: "T5 W T3 T8 W", reason: "Course strategy remained excellent through a difficult final round." },
  { rank: 9, previous: 9, initials: "SV", name: "Simone Vagnozzi", sport: "Tennis", role: "Coach to Jannik Sinner", score: 83.2, change: "-0.4", form: "W W W L W", reason: "Still consistent, but the semifinal loss exposed a slow tactical response." },
];
const sports = ["All", "NFL Football", "Basketball", "Baseball", "Premier League", "La Liga", "Golf", "Tennis", "Champions League", "Championship League"];

export const Route = createFileRoute("/rankings")({
  head: () => ({ meta: [
    { title: "Coach Power Rankings | CoachFace" },
    { name: "description", content: "See the weekly CoachFace power rankings across football, basketball, baseball, soccer, golf, and tennis." },
    { property: "og:title", content: "Coach Power Rankings | CoachFace" },
    { property: "og:description", content: "See which coaches owned the week and why they moved." },
  ] }),
  component: RankingsPage,
});

function RankingsPage() {
  const [sport, setSport] = useState("All");
  const visible = useMemo(() => coaches.filter((coach) => sport === "All" || coach.sport === sport), [sport]);
  return (
    <CoachFacePageShell>
      <PageHero eyebrow="CoachFace Index" title="Power rankings" description="The definitive weekly ranking of coaching performance across sports, with every rise and fall explained." aside={<div className="flex flex-col items-start gap-3 lg:items-end"><Badge className="w-fit rounded-sm px-3 py-2 uppercase tracking-wider"><Radio className="mr-2 size-3" /> Live index</Badge><span className="flex items-center gap-2 text-sm font-semibold text-muted-foreground"><CalendarDays className="size-4" /> Week of June 8, 2026</span></div>} />
      <main className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        <section className="grid border-y border-border lg:grid-cols-[1.35fr_1fr_1fr]" aria-label="Power ranking leaders">
          <div className="border-b border-border py-7 lg:border-b-0 lg:border-r lg:pr-8">
            <p className="eyebrow">Number one this week</p>
            <div className="mt-4 flex items-center gap-5"><span className="grid size-16 place-items-center rounded-full bg-primary font-display text-xl font-black text-primary-foreground">AR</span><div><h2 className="font-display text-3xl font-black uppercase">Andy Reid</h2><p className="text-sm text-muted-foreground">NFL Football · Kansas City Chiefs</p></div></div>
          </div>
          <div className="border-b border-border py-7 lg:border-b-0 lg:border-r lg:px-8"><p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted-foreground"><Zap className="size-4 text-primary" /> Biggest riser</p><p className="mt-3 font-display text-2xl font-black">Luis Enrique</p><p className="mt-1 text-sm text-positive">Up 4 places · 89.9 score</p></div>
          <div className="py-7 lg:pl-8"><p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Top score</p><p className="mt-2 font-display text-5xl font-black">94.2</p><p className="text-sm text-muted-foreground">CoachFace Power Score</p></div>
        </section>
        <div className="flex flex-wrap gap-2" aria-label="Filter rankings by sport">
          {sports.map((item) => <Button key={item} size="sm" variant={sport === item ? "default" : "outline"} onClick={() => setSport(item)}>{item}</Button>)}
        </div>
        <div className="mt-8 border-t border-border">
          {visible.map((coach) => (
            <article key={coach.name} className="grid items-center gap-4 border-b border-border py-6 sm:grid-cols-[64px_1fr_auto_auto]">
              <div><span className="font-display text-3xl font-black text-muted-foreground">{String(coach.rank).padStart(2, "0")}</span><span className={cn("mt-1 flex items-center text-xs font-bold", coach.previous > coach.rank ? "text-positive" : coach.previous < coach.rank ? "text-destructive" : "text-muted-foreground")}>{coach.previous > coach.rank ? <ArrowUpRight className="size-3" /> : coach.previous < coach.rank ? <ArrowDownRight className="size-3" /> : <Minus className="size-3" />}{Math.abs(coach.previous - coach.rank) || "Hold"}</span></div>
              <div className="flex items-center gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-full bg-secondary font-display font-black">{coach.initials}</span><div><h2 className="font-bold">{coach.name}</h2><p className="text-sm text-muted-foreground">{coach.sport} · {coach.role}</p><p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{coach.reason}</p></div></div>
              <div className="hidden text-right md:block"><p className="font-mono text-xs uppercase text-muted-foreground">Last five</p><p className="mt-1 font-mono text-sm font-bold">{coach.form}</p></div>
              <div className="flex min-w-32 items-center justify-between gap-4 sm:justify-end"><span className={cn("flex items-center text-xs font-bold", coach.change.startsWith("+") ? "text-positive" : "text-destructive")}>{coach.change.startsWith("+") && <ArrowUpRight className="size-3" />}{coach.change}</span><strong className="font-display text-3xl">{coach.score}</strong></div>
            </article>
          ))}
        </div>
      </main>
    </CoachFacePageShell>
  );
}