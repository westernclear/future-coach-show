import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, ChevronRight, Clock3, Globe2, ShieldCheck, Trophy } from "lucide-react";

import stadiumImage from "@/assets/coachface-stadium.jpg";
import { CoachFacePageShell } from "@/components/coachface-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fifaCoaches = [
  { id: 1, initials: "CA", name: "Carlo Ancelotti", nation: "Brazil", score: 95.4, trait: "Tournament control" },
  { id: 2, initials: "LE", name: "Luis de la Fuente", nation: "Spain", score: 94.1, trait: "Midfield command" },
  { id: 3, initials: "LS", name: "Lionel Scaloni", nation: "Argentina", score: 93.8, trait: "Knockout composure" },
  { id: 4, initials: "DD", name: "Didier Deschamps", nation: "France", score: 92.6, trait: "Squad balance" },
  { id: 5, initials: "TT", name: "Thomas Tuchel", nation: "England", score: 91.7, trait: "Tactical flexibility" },
  { id: 6, initials: "JN", name: "Julian Nagelsmann", nation: "Germany", score: 90.9, trait: "High-pressure attack" },
  { id: 7, initials: "RM", name: "Roberto Martínez", nation: "Portugal", score: 89.8, trait: "Creative overloads" },
  { id: 8, initials: "RK", name: "Ronald Koeman", nation: "Netherlands", score: 88.9, trait: "Transition play" },
  { id: 9, initials: "MP", name: "Mauricio Pochettino", nation: "United States", score: 87.6, trait: "Pressing intensity" },
  { id: 10, initials: "JM", name: "Javier Aguirre", nation: "Mexico", score: 86.8, trait: "Competitive edge" },
];

export const Route = createFileRoute("/fifa-special")({
  head: () => ({
    meta: [
      { title: "FIFA Coaches Special | CoachFace" },
      { name: "description", content: "Draft elite international football coaches in the limited CoachFace FIFA Coaches Special." },
      { property: "og:title", content: "FIFA Coaches Special | CoachFace" },
      { property: "og:description", content: "Pick three international coaches. Every selection, substitution, and result counts." },
    ],
  }),
  component: FifaSpecialPage,
});

function FifaSpecialPage() {
  const [roster, setRoster] = useState<number[]>([]);
  const toggleCoach = (id: number) => {
    setRoster((current) => current.includes(id) ? current.filter((coachId) => coachId !== id) : current.length < 3 ? [...current, id] : current);
  };

  return (
    <CoachFacePageShell>
      <main>
        <section className="relative isolate min-h-[560px] overflow-hidden border-b border-border">
          <img src={stadiumImage} alt="Football stadium prepared for an international match" className="absolute inset-0 -z-20 h-full w-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-hero-overlay" />
          <div className="mx-auto flex min-h-[560px] max-w-7xl items-center px-5 py-16 lg:px-8">
            <div className="max-w-3xl">
              <Badge className="rounded-sm px-3 py-1.5 uppercase tracking-[0.18em]"><Globe2 className="mr-2 size-3" /> Limited release</Badge>
              <h1 className="mt-6 font-display text-6xl font-black uppercase leading-[0.88] tracking-tight text-hero-foreground sm:text-7xl lg:text-8xl">FIFA coaches<br /><span className="text-primary">special.</span></h1>
              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-hero-muted sm:text-xl">Build a three-coach international roster. Score every selection, tactical switch, substitution, and match result on football's biggest stage.</p>
              <div className="mt-8 flex flex-wrap gap-5 text-sm font-semibold text-hero-muted">
                <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> Free special entry</span>
                <span className="flex items-center gap-2"><Clock3 className="size-4 text-primary" /> Limited-time slate</span>
                <span className="flex items-center gap-2"><Trophy className="size-4 text-primary" /> Exclusive badge</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[0.7fr_1.3fr] lg:px-8 lg:py-20">
          <aside>
            <p className="eyebrow">Special roster</p>
            <h2 className="mt-3 font-display text-4xl font-black uppercase leading-none">Pick your three.</h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">International players drive the outcome, while the coach earns points for squad selection, formation, substitutions, game management, and competitive context.</p>
            <div className="mt-8 border-y border-border py-6">
              <p className="font-display text-5xl font-black">{roster.length}/3</p>
              <p className="mt-1 text-sm text-muted-foreground">Coaches selected</p>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div><strong className="font-display text-2xl">45%</strong><p className="text-xs text-muted-foreground">Player result</p></div>
              <div><strong className="font-display text-2xl">35%</strong><p className="text-xs text-muted-foreground">Coach calls</p></div>
              <div><strong className="font-display text-2xl">20%</strong><p className="text-xs text-muted-foreground">Match context</p></div>
            </div>
          </aside>

          <div>
            <div className="border-t border-border">
              {fifaCoaches.map((coach, index) => {
                const selected = roster.includes(coach.id);
                return (
                  <article key={coach.id} className={cn("grid items-center gap-4 border-b border-border py-5 sm:grid-cols-[36px_1fr_auto]", selected && "bg-primary/5")}>
                    <span className="font-display text-xl font-black text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                    <div className="flex items-center gap-4">
                      <span className={cn("grid size-12 shrink-0 place-items-center rounded-full font-display font-black", selected ? "bg-primary text-primary-foreground" : "bg-secondary")}>{coach.initials}</span>
                      <div><h3 className="font-bold">{coach.name}</h3><p className="text-sm text-muted-foreground">{coach.nation} · {coach.trait}</p><p className="mt-1 font-mono text-xs font-bold">Projected {coach.score}</p></div>
                    </div>
                    <Button variant={selected ? "default" : "outline"} onClick={() => toggleCoach(coach.id)} disabled={!selected && roster.length >= 3}>{selected ? <><Check /> Selected</> : <>Draft <ChevronRight /></>}</Button>
                  </article>
                );
              })}
            </div>
            <Button size="lg" className="mt-6 w-full" disabled={roster.length !== 3} onClick={() => alert("Your FIFA Coaches Special roster is locked in.")}>Enter the special <Trophy /></Button>
          </div>
        </section>

        <section className="border-t border-border bg-secondary/40 px-5 py-8 text-center">
          <p className="mx-auto max-w-3xl text-xs leading-relaxed text-muted-foreground">CoachFace is an independent fantasy sports platform and is not affiliated with, endorsed by, or sponsored by FIFA or any national football association. Names are used for informational fantasy competition purposes.</p>
        </section>
      </main>
    </CoachFacePageShell>
  );
}