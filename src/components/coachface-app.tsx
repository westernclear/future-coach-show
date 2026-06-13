import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  CirclePlay,
  Flame,
  Radio,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

import stadiumImage from "@/assets/coachface-stadium.jpg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Coach = {
  id: number;
  initials: string;
  name: string;
  role: string;
  sport: string;
  score: number;
  movement: string;
  form: string;
};

const coaches: Coach[] = [
  { id: 1, initials: "MC", name: "Marcus Cole", role: "Head coach", sport: "Football", score: 94.2, movement: "+3.8", form: "W W W L W" },
  { id: 2, initials: "AR", name: "Ana Reyes", role: "Manager", sport: "Soccer", score: 91.7, movement: "+1.4", form: "W D W W W" },
  { id: 3, initials: "DM", name: "Darius Miles", role: "Head coach", sport: "Basketball", score: 89.4, movement: "+4.2", form: "W W L W W" },
  { id: 4, initials: "JL", name: "Jordan Lee", role: "Manager", sport: "Baseball", score: 86.9, movement: "-0.6", form: "W L W W L" },
];

const scoreEvents = [
  { label: "Fourth-down conversion", detail: "Aggressive call, 4th & 2", points: "+4.0" },
  { label: "Red-zone efficiency", detail: "4 touchdowns from 5 visits", points: "+3.5" },
  { label: "Challenge won", detail: "Catch overturned in Q3", points: "+2.0" },
  { label: "Clock management", detail: "Timeout preserved before half", points: "+1.5" },
];

const sports = ["All sports", "Football", "Basketball", "Baseball", "Soccer"];

export function CoachFaceApp() {
  const [activeSport, setActiveSport] = useState("All sports");
  const [roster, setRoster] = useState<number[]>([1]);

  const visibleCoaches = useMemo(
    () => coaches.filter((coach) => activeSport === "All sports" || coach.sport === activeSport),
    [activeSport],
  );

  const toggleRoster = (id: number) => {
    setRoster((current) =>
      current.includes(id) ? current.filter((coachId) => coachId !== id) : [...current, id].slice(-3),
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label="CoachFace home">
            <span className="grid size-9 place-items-center rounded-sm bg-primary font-display text-xl font-black text-primary-foreground">CF</span>
            <span className="font-display text-xl font-black uppercase tracking-tight">CoachFace</span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-muted-foreground md:flex" aria-label="Main navigation">
            <a className="transition-colors hover:text-foreground" href="#rankings">Rankings</a>
            <a className="transition-colors hover:text-foreground" href="#game">Play</a>
            <a className="transition-colors hover:text-foreground" href="#show">The show</a>
            <a className="transition-colors hover:text-foreground" href="#scoring">How scoring works</a>
          </nav>
          <Button size="sm" onClick={() => document.querySelector("#game")?.scrollIntoView({ behavior: "smooth" })}>
            Build roster <ArrowRight />
          </Button>
        </div>
      </header>

      <main id="top">
        <section className="relative isolate min-h-[620px] overflow-hidden border-b border-border">
          <img src={stadiumImage} alt="Coach looking out from a stadium tunnel" width={1536} height={1024} className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 -z-10 bg-hero-overlay" />
          <div className="mx-auto flex min-h-[620px] max-w-7xl items-center px-5 py-20 lg:px-8">
            <div className="max-w-2xl">
              <Badge className="mb-6 rounded-sm px-3 py-1.5 uppercase tracking-[0.18em]" variant="secondary">
                <Radio className="mr-2 size-3" /> The game behind the game
              </Badge>
              <h1 className="font-display text-6xl font-black uppercase leading-[0.9] tracking-[-0.035em] text-hero-foreground sm:text-7xl lg:text-8xl">
                Draft the<br /><span className="text-primary">decision makers.</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-hero-muted sm:text-xl">
                Build a roster of coaches across sports. Score every call, every adjustment, and every result. The sideline finally counts.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button size="lg" onClick={() => document.querySelector("#game")?.scrollIntoView({ behavior: "smooth" })}>Play free this week <ArrowRight /></Button>
                <Button size="lg" variant="outline" className="border-hero-border bg-hero-surface text-hero-foreground hover:bg-hero-surface-hover hover:text-hero-foreground" onClick={() => document.querySelector("#show")?.scrollIntoView({ behavior: "smooth" })}>
                  <CirclePlay /> Watch the format
                </Button>
              </div>
              <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium text-hero-muted">
                <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> Free to play</span>
                <span className="flex items-center gap-2"><BarChart3 className="size-4 text-primary" /> Transparent scoring</span>
                <span className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /> AI-powered recaps</span>
              </div>
            </div>
          </div>
        </section>

        <section id="rankings" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="eyebrow">CoachFace Index</p>
              <h2 className="section-title">Who owned the week?</h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">A live, explainable ranking built from game management, unit performance, tactical decisions, and results.</p>
            </div>
            <div className="flex flex-wrap gap-2" aria-label="Filter rankings by sport">
              {sports.map((sport) => (
                <Button key={sport} size="sm" variant={activeSport === sport ? "default" : "outline"} onClick={() => setActiveSport(sport)}>{sport}</Button>
              ))}
            </div>
          </div>

          <div className="mt-10 overflow-hidden border-y border-border">
            {visibleCoaches.map((coach, index) => (
              <article key={coach.id} className="grid items-center gap-4 border-b border-border py-5 last:border-b-0 sm:grid-cols-[42px_1fr_auto_auto]">
                <span className="font-display text-2xl font-black text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                <div className="flex items-center gap-4">
                  <div className="grid size-12 place-items-center rounded-full bg-secondary font-display font-black text-secondary-foreground">{coach.initials}</div>
                  <div>
                    <h3 className="font-bold">{coach.name}</h3>
                    <p className="text-sm text-muted-foreground">{coach.sport} · {coach.role}</p>
                  </div>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Form</p>
                  <p className="mt-1 font-mono text-sm font-bold">{coach.form}</p>
                </div>
                <div className="flex min-w-28 items-center justify-between gap-4 sm:justify-end">
                  <span className={cn("text-xs font-bold", coach.movement.startsWith("+") ? "text-positive" : "text-destructive")}>{coach.movement}</span>
                  <span className="font-display text-3xl font-black">{coach.score}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="game" className="bg-foreground py-20 text-background">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
            <div>
              <p className="eyebrow text-primary">Weekly free play</p>
              <h2 className="font-display text-5xl font-black uppercase leading-none tracking-tight sm:text-6xl">Your coaches.<br />Your call.</h2>
              <p className="mt-6 max-w-md leading-relaxed text-game-muted">Choose up to three leaders for the weekly slate. No entry fee, no betting, just proof that you know the game beyond the players.</p>
              <div className="mt-10 border-l-2 border-primary pl-5">
                <p className="font-display text-3xl font-black">{roster.length}/3 selected</p>
                <p className="mt-1 text-sm text-game-muted">Roster locks Sunday at 12:55 PM ET</p>
              </div>
            </div>
            <div className="space-y-3">
              {coaches.slice(0, 3).map((coach) => {
                const selected = roster.includes(coach.id);
                return (
                  <div key={coach.id} className={cn("flex flex-col gap-4 border p-5 transition-colors sm:flex-row sm:items-center", selected ? "border-primary bg-game-selected" : "border-game-border bg-game-surface")}>
                    <div className="grid size-11 shrink-0 place-items-center rounded-full bg-primary font-display font-black text-primary-foreground">{coach.initials}</div>
                    <div className="flex-1">
                      <h3 className="font-bold">{coach.name}</h3>
                      <p className="text-sm text-game-muted">{coach.sport} · Projected {coach.score} pts</p>
                    </div>
                    <Button variant={selected ? "default" : "outline"} onClick={() => toggleRoster(coach.id)} className={cn(!selected && "border-game-border bg-transparent text-background hover:bg-game-selected hover:text-background")}>
                      {selected ? <><Check /> Selected</> : <>Add coach <ChevronRight /></>}
                    </Button>
                  </div>
                );
              })}
              <Button size="lg" className="mt-4 w-full" disabled={roster.length === 0} onClick={() => alert(`Roster saved with ${roster.length} coach${roster.length === 1 ? "" : "es"}. This concept demo keeps your picks in this session.`)}>
                Save weekly roster <Trophy />
              </Button>
            </div>
          </div>
        </section>

        <section id="scoring" className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="eyebrow">No mystery points</p>
            <h2 className="section-title">Every score has a reason.</h2>
            <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">CoachFace separates objective game events from fan opinion. Every point links back to the decision, result, and rule that produced it.</p>
            <div className="mt-8 flex gap-8">
              <div><p className="font-display text-4xl font-black">11.0</p><p className="text-sm text-muted-foreground">Decision points</p></div>
              <div><p className="font-display text-4xl font-black">83%</p><p className="text-sm text-muted-foreground">Confidence</p></div>
            </div>
          </div>
          <div className="border-t border-border">
            {scoreEvents.map((event) => (
              <div key={event.label} className="grid grid-cols-[1fr_auto] gap-4 border-b border-border py-5">
                <div><h3 className="font-bold">{event.label}</h3><p className="mt-1 text-sm text-muted-foreground">{event.detail}</p></div>
                <span className="font-display text-2xl font-black text-positive">{event.points}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="show" className="border-y border-border bg-secondary/50">
          <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
            <div className="relative min-h-96 overflow-hidden bg-foreground">
              <img src={stadiumImage} alt="Stadium tunnel prepared for the CoachFace show" loading="lazy" width={1536} height={1024} className="absolute inset-0 h-full w-full object-cover opacity-60" />
              <div className="absolute inset-0 grid place-items-center bg-media-overlay">
                <Button size="lg" className="rounded-full px-6"><CirclePlay className="size-5" /> Watch concept trailer</Button>
              </div>
              <Badge className="absolute left-6 top-6 rounded-sm uppercase tracking-wider"><Radio className="mr-2 size-3" /> Weekly live</Badge>
            </div>
            <div className="flex flex-col justify-center px-6 py-14 lg:px-14">
              <p className="eyebrow">The CoachFace Show</p>
              <h2 className="section-title">The calls everyone is already arguing about.</h2>
              <p className="mt-5 leading-relaxed text-muted-foreground">A fast weekly show where hosts draft coaches, break down the biggest decisions, reveal the leaderboard, and let fans make the call.</p>
              <div className="mt-8 grid grid-cols-2 gap-5 text-sm">
                <span className="flex items-center gap-2 font-semibold"><Flame className="text-primary" /> Hot Seat Index</span>
                <span className="flex items-center gap-2 font-semibold"><Users className="text-primary" /> Fan voting</span>
                <span className="flex items-center gap-2 font-semibold"><BarChart3 className="text-primary" /> Film-room grades</span>
                <span className="flex items-center gap-2 font-semibold"><Sparkles className="text-primary" /> Personal recaps</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-foreground py-10 text-background">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-5 sm:flex-row sm:items-center lg:px-8">
          <div><p className="font-display text-2xl font-black uppercase">CoachFace</p><p className="mt-1 text-sm text-game-muted">The game behind the game.</p></div>
          <p className="max-w-md text-xs leading-relaxed text-game-muted">Concept experience based on the original CoachFace vision. Coach names and scores shown here are fictional for prototype purposes.</p>
        </div>
      </footer>
    </div>
  );
}