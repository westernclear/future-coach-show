import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, CalendarDays, Minus, Radio, Zap } from "lucide-react";

import { CoachFacePageShell, PageHero } from "@/components/coachface-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RankingSeed = { name: string; role: string };

const rankingSeeds: Record<string, RankingSeed[]> = {
  "NFL Football": [
    { name: "Andy Reid", role: "Kansas City Chiefs" }, { name: "Sean McVay", role: "Los Angeles Rams" },
    { name: "Dan Campbell", role: "Detroit Lions" }, { name: "Kyle Shanahan", role: "San Francisco 49ers" },
    { name: "John Harbaugh", role: "Baltimore Ravens" }, { name: "Sean McDermott", role: "Buffalo Bills" },
    { name: "Matt LaFleur", role: "Green Bay Packers" }, { name: "Mike Tomlin", role: "Pittsburgh Steelers" },
    { name: "Kevin O'Connell", role: "Minnesota Vikings" }, { name: "DeMeco Ryans", role: "Houston Texans" },
  ],
  Basketball: [
    { name: "Mark Daigneault", role: "Oklahoma City Thunder" }, { name: "Joe Mazzulla", role: "Boston Celtics" },
    { name: "Erik Spoelstra", role: "Miami Heat" }, { name: "Michael Malone", role: "Denver Nuggets" },
    { name: "Steve Kerr", role: "Golden State Warriors" }, { name: "Rick Carlisle", role: "Indiana Pacers" },
    { name: "Tom Thibodeau", role: "New York Knicks" }, { name: "Tyronn Lue", role: "LA Clippers" },
    { name: "Chris Finch", role: "Minnesota Timberwolves" }, { name: "Jamahl Mosley", role: "Orlando Magic" },
  ],
  Baseball: [
    { name: "Dave Roberts", role: "Los Angeles Dodgers" }, { name: "Brian Snitker", role: "Atlanta Braves" },
    { name: "Bruce Bochy", role: "Texas Rangers" }, { name: "Torey Lovullo", role: "Arizona Diamondbacks" },
    { name: "Brandon Hyde", role: "Baltimore Orioles" }, { name: "Stephen Vogt", role: "Cleveland Guardians" },
    { name: "Rob Thomson", role: "Philadelphia Phillies" }, { name: "Kevin Cash", role: "Tampa Bay Rays" },
    { name: "Pat Murphy", role: "Milwaukee Brewers" }, { name: "A.J. Hinch", role: "Detroit Tigers" },
  ],
  "Premier League": [
    { name: "Mikel Arteta", role: "Arsenal" }, { name: "Pep Guardiola", role: "Manchester City" },
    { name: "Arne Slot", role: "Liverpool" }, { name: "Unai Emery", role: "Aston Villa" },
    { name: "Eddie Howe", role: "Newcastle United" }, { name: "Thomas Frank", role: "Brentford" },
    { name: "Marco Silva", role: "Fulham" }, { name: "Oliver Glasner", role: "Crystal Palace" },
    { name: "Nuno Espírito Santo", role: "Nottingham Forest" }, { name: "Andoni Iraola", role: "Bournemouth" },
  ],
  "La Liga": [
    { name: "Hansi Flick", role: "FC Barcelona" }, { name: "Carlo Ancelotti", role: "Real Madrid" },
    { name: "Diego Simeone", role: "Atlético Madrid" }, { name: "Ernesto Valverde", role: "Athletic Club" },
    { name: "Míchel Sánchez", role: "Girona" }, { name: "Manuel Pellegrini", role: "Real Betis" },
    { name: "Marcelino García", role: "Villarreal" }, { name: "Imanol Alguacil", role: "Real Sociedad" },
    { name: "Jagoba Arrasate", role: "Mallorca" }, { name: "José Bordalás", role: "Getafe" },
  ],
  Golf: [
    { name: "Randy Smith", role: "Coach to Scottie Scheffler" }, { name: "Phil Kenyon", role: "Putting coach to elite tour players" },
    { name: "Claude Harmon III", role: "Coach to Brooks Koepka" }, { name: "Sean Foley", role: "Tour performance coach" },
    { name: "Pete Cowen", role: "Coach to major champions" }, { name: "Jamie Mulligan", role: "Coach to Patrick Cantlay" },
    { name: "Mark Blackburn", role: "PGA Tour swing coach" }, { name: "Chris Como", role: "Coach to Xander Schauffele" },
    { name: "Dana Dahlquist", role: "Elite tour coach" }, { name: "Mike Bender", role: "PGA Tour instructor" },
  ],
  Tennis: [
    { name: "Simone Vagnozzi", role: "Coach to Jannik Sinner" }, { name: "Juan Carlos Ferrero", role: "Coach to Carlos Alcaraz" },
    { name: "Goran Ivanišević", role: "Elite tour coach" }, { name: "Patrick Mouratoglou", role: "Elite tour coach" },
    { name: "Darren Cahill", role: "Coach to Jannik Sinner" }, { name: "Brad Gilbert", role: "Elite tour coach" },
    { name: "Wim Fissette", role: "WTA tour coach" }, { name: "Conchita Martínez", role: "Grand Slam champion coach" },
    { name: "Ivan Lendl", role: "Grand Slam champion coach" }, { name: "Carlos Moyá", role: "Coach to Rafael Nadal" },
  ],
  "Champions League": [
    { name: "Luis Enrique", role: "Paris Saint-Germain" }, { name: "Carlo Ancelotti", role: "Real Madrid" },
    { name: "Pep Guardiola", role: "Manchester City" }, { name: "Mikel Arteta", role: "Arsenal" },
    { name: "Hansi Flick", role: "FC Barcelona" }, { name: "Diego Simeone", role: "Atlético Madrid" },
    { name: "Simone Inzaghi", role: "Inter Milan" }, { name: "Vincent Kompany", role: "Bayern Munich" },
    { name: "Xabi Alonso", role: "Bayer Leverkusen" }, { name: "Arne Slot", role: "Liverpool" },
  ],
  "Championship League": [
    { name: "Frank Lampard", role: "Coventry City" }, { name: "Daniel Farke", role: "Leeds United" },
    { name: "Scott Parker", role: "Burnley" }, { name: "Chris Wilder", role: "Sheffield United" },
    { name: "Régis Le Bris", role: "Sunderland" }, { name: "Michael Carrick", role: "Middlesbrough" },
    { name: "Tony Mowbray", role: "West Bromwich Albion" }, { name: "Martí Cifuentes", role: "Queens Park Rangers" },
    { name: "John Eustace", role: "Blackburn Rovers" }, { name: "Miron Muslic", role: "Plymouth Argyle" },
  ],
};

const reasons = [
  "Set the weekly standard with decisive adjustments and excellent late-game control.",
  "Combined smart preparation with disciplined execution in the biggest moments.",
  "Created a clear tactical advantage and trusted the right decisions under pressure.",
  "Managed personnel and momentum with precision throughout the week.",
  "Delivered strong situational choices and a composed finish when it mattered.",
  "Maintained an aggressive plan while limiting costly tactical mistakes.",
  "Turned a difficult matchup into a positive result through timely adjustments.",
  "Showed consistent game management, with one late decision limiting the score.",
  "Produced a competitive performance but left points available in key moments.",
  "Remains in the top 10, though execution and response time must improve next week.",
];

const coaches = Object.entries(rankingSeeds).flatMap(([sport, entries]) =>
  entries.map((entry, index) => {
    const rank = index + 1;
    const movement = index % 4 === 0 ? 2 : index % 4 === 1 ? 0 : index % 4 === 2 ? -1 : 1;
    return {
      ...entry,
      sport,
      rank,
      previous: Math.max(1, Math.min(10, rank + movement)),
      initials: entry.name.split(" ").map((part) => part[0]).slice(0, 2).join(""),
      score: Number((95.2 - index * 1.55 - Object.keys(rankingSeeds).indexOf(sport) * 0.15).toFixed(1)),
      change: `${index % 5 === 4 ? "-" : "+"}${(3.8 - index * 0.31).toFixed(1)}`,
      form: sport === "Golf" ? "T5 W T3 T8 W" : sport === "Tennis" ? "W W W L W" : "W W D W W",
      reason: reasons[index],
    };
  }),
);
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