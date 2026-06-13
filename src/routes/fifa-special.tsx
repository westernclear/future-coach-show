import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, ChevronRight, Clock3, Globe2, Loader2, Search, ShieldCheck, Trophy } from "lucide-react";

import stadiumImage from "@/assets/coachface-stadium.jpg";
import { CoachFacePageShell } from "@/components/coachface-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { submitFifaSpecialEntry } from "@/lib/fifa-special.functions";
import { cn } from "@/lib/utils";

const fifaCoaches = [
  { id: 1, group: "A", initials: "JA", name: "Javier Aguirre", nation: "Mexico", score: 86.8, trait: "Competitive edge" },
  { id: 2, group: "A", initials: "HM", name: "Hong Myung-bo", nation: "South Korea", score: 81.7, trait: "Compact organization" },
  { id: 3, group: "A", initials: "HB", name: "Hugo Broos", nation: "South Africa", score: 79.8, trait: "Tournament experience" },
  { id: 4, group: "A", initials: "MK", name: "Miroslav Koubek", nation: "Czechia", score: 78.9, trait: "Defensive structure" },
  { id: 5, group: "B", initials: "JM", name: "Jesse Marsch", nation: "Canada", score: 84.5, trait: "Aggressive pressing" },
  { id: 6, group: "B", initials: "MY", name: "Murat Yakin", nation: "Switzerland", score: 83.2, trait: "Knockout discipline" },
  { id: 7, group: "B", initials: "JL", name: "Julen Lopetegui", nation: "Qatar", score: 78.5, trait: "Possession control" },
  { id: 8, group: "B", initials: "SB", name: "Sergej Barbarez", nation: "Bosnia & Herzegovina", score: 77.7, trait: "Direct transitions" },
  { id: 9, group: "C", initials: "CA", name: "Carlo Ancelotti", nation: "Brazil", score: 95.4, trait: "Tournament control" },
  { id: 10, group: "C", initials: "MO", name: "Mohamed Ouahbi", nation: "Morocco", score: 83.8, trait: "Youth integration" },
  { id: 11, group: "C", initials: "SC", name: "Steve Clarke", nation: "Scotland", score: 81.2, trait: "Compact defending" },
  { id: 12, group: "C", initials: "SM", name: "Sébastien Migné", nation: "Haiti", score: 75.8, trait: "Counterattack timing" },
  { id: 13, group: "D", initials: "MP", name: "Mauricio Pochettino", nation: "United States", score: 87.6, trait: "Pressing intensity" },
  { id: 14, group: "D", initials: "VM", name: "Vincenzo Montella", nation: "Turkey", score: 84.1, trait: "Fluid attacking" },
  { id: 15, group: "D", initials: "TP", name: "Tony Popovic", nation: "Australia", score: 80.7, trait: "Defensive resilience" },
  { id: 16, group: "D", initials: "GA", name: "Gustavo Alfaro", nation: "Paraguay", score: 82.4, trait: "Game-state control" },
  { id: 17, group: "E", initials: "JN", name: "Julian Nagelsmann", nation: "Germany", score: 90.9, trait: "High-pressure attack" },
  { id: 18, group: "E", initials: "SB", name: "Sebastián Beccacece", nation: "Ecuador", score: 83.5, trait: "Vertical tempo" },
  { id: 19, group: "E", initials: "EF", name: "Emerse Faé", nation: "Ivory Coast", score: 82.8, trait: "Momentum management" },
  { id: 20, group: "E", initials: "DA", name: "Dick Advocaat", nation: "Curaçao", score: 77.2, trait: "Veteran pragmatism" },
  { id: 21, group: "F", initials: "RK", name: "Ronald Koeman", nation: "Netherlands", score: 88.9, trait: "Transition play" },
  { id: 22, group: "F", initials: "HM", name: "Hajime Moriyasu", nation: "Japan", score: 85.7, trait: "Tactical adaptation" },
  { id: 23, group: "F", initials: "GP", name: "Graham Potter", nation: "Sweden", score: 82.1, trait: "Flexible buildup" },
  { id: 24, group: "F", initials: "SL", name: "Sabri Lamouchi", nation: "Tunisia", score: 77.9, trait: "Midfield balance" },
  { id: 25, group: "G", initials: "RG", name: "Rudi Garcia", nation: "Belgium", score: 85.2, trait: "Attacking balance" },
  { id: 26, group: "G", initials: "AG", name: "Amir Ghalenoei", nation: "Iran", score: 81.5, trait: "Direct efficiency" },
  { id: 27, group: "G", initials: "HH", name: "Hossam Hassan", nation: "Egypt", score: 82.6, trait: "Competitive intensity" },
  { id: 28, group: "G", initials: "DB", name: "Darren Bazeley", nation: "New Zealand", score: 76.5, trait: "Set-piece focus" },
  { id: 29, group: "H", initials: "LF", name: "Luis de la Fuente", nation: "Spain", score: 94.1, trait: "Midfield command" },
  { id: 30, group: "H", initials: "MB", name: "Marcelo Bielsa", nation: "Uruguay", score: 88.2, trait: "Relentless tempo" },
  { id: 31, group: "H", initials: "GD", name: "Giorgios Donis", nation: "Saudi Arabia", score: 78.2, trait: "Compact transitions" },
  { id: 32, group: "H", initials: "BU", name: "Bubista", nation: "Cabo Verde", score: 77.5, trait: "Collective discipline" },
  { id: 33, group: "I", initials: "DD", name: "Didier Deschamps", nation: "France", score: 92.6, trait: "Squad balance" },
  { id: 34, group: "I", initials: "PT", name: "Pape Thiaw", nation: "Senegal", score: 84.7, trait: "Physical control" },
  { id: 35, group: "I", initials: "SS", name: "Ståle Solbakken", nation: "Norway", score: 84.3, trait: "Direct attacking" },
  { id: 36, group: "I", initials: "GA", name: "Graham Arnold", nation: "Iraq", score: 78.7, trait: "Tournament grit" },
  { id: 37, group: "J", initials: "LS", name: "Lionel Scaloni", nation: "Argentina", score: 93.8, trait: "Knockout composure" },
  { id: 38, group: "J", initials: "VP", name: "Vladimir Petković", nation: "Algeria", score: 82.9, trait: "Shape flexibility" },
  { id: 39, group: "J", initials: "RR", name: "Ralf Rangnick", nation: "Austria", score: 85.9, trait: "Pressing structure" },
  { id: 40, group: "J", initials: "JS", name: "Jamal Sellami", nation: "Jordan", score: 76.9, trait: "Counterattack belief" },
  { id: 41, group: "K", initials: "RM", name: "Roberto Martínez", nation: "Portugal", score: 89.8, trait: "Creative overloads" },
  { id: 42, group: "K", initials: "NL", name: "Néstor Lorenzo", nation: "Colombia", score: 86.3, trait: "Unbeaten mentality" },
  { id: 43, group: "K", initials: "FC", name: "Fabio Cannavaro", nation: "Uzbekistan", score: 79.5, trait: "Defensive authority" },
  { id: 44, group: "K", initials: "SD", name: "Sébastien Desabre", nation: "DR Congo", score: 80.2, trait: "Transition threat" },
  { id: 45, group: "L", initials: "TT", name: "Thomas Tuchel", nation: "England", score: 91.7, trait: "Tactical flexibility" },
  { id: 46, group: "L", initials: "ZD", name: "Zlatko Dalić", nation: "Croatia", score: 86.6, trait: "Tournament composure" },
  { id: 47, group: "L", initials: "TC", name: "Thomas Christiansen", nation: "Panama", score: 79.2, trait: "Organized buildup" },
  { id: 48, group: "L", initials: "CQ", name: "Carlos Queiroz", nation: "Ghana", score: 80.5, trait: "Tournament pragmatism" },
];

const groups = [...new Set(fifaCoaches.map((coach) => coach.group))];
const rankingById = new Map(
  [...fifaCoaches]
    .sort((a, b) => b.score - a.score)
    .map((coach, index) => [coach.id, index + 1]),
);

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
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState("All");
  const [entryName, setEntryName] = useState("My FIFA Special XI");
  const [submitting, setSubmitting] = useState(false);
  const [entryMessage, setEntryMessage] = useState<string | null>(null);
  const submitEntry = useServerFn(submitFifaSpecialEntry);
  const toggleCoach = (id: number) => {
    setEntryMessage(null);
    setRoster((current) => {
      if (current.includes(id)) return current.filter((coachId) => coachId !== id);
      const coach = fifaCoaches.find((item) => item.id === id);
      const sameGroupCount = current.filter((coachId) => fifaCoaches.find((item) => item.id === coachId)?.group === coach?.group).length;
      return current.length < 3 && sameGroupCount < 2 ? [...current, id] : current;
    });
  };
  const handleEntry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEntryMessage(null);
    if (roster.length !== 3) return;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      window.location.assign("/auth?redirect=/fifa-special");
      return;
    }
    setSubmitting(true);
    try {
      await submitEntry({ data: { entryName, coachSlugs: roster.map((id) => fifaCoaches.find((coach) => coach.id === id)?.slug ?? "") } });
      setEntryMessage("Entry confirmed. Your three coaches are locked into the global leaderboard.");
    } catch (error) {
      setEntryMessage(error instanceof Error ? error.message : "Your entry could not be saved.");
    } finally {
      setSubmitting(false);
    }
  };
  const normalizedSearch = search.trim().toLowerCase();
  const visibleCoaches = fifaCoaches.filter((coach) => {
    const matchesGroup = activeGroup === "All" || coach.group === activeGroup;
    const matchesSearch = !normalizedSearch || `${coach.name} ${coach.nation}`.toLowerCase().includes(normalizedSearch);
    return matchesGroup && matchesSearch;
  });
  const visibleGroups = groups.filter((group) => activeGroup === "All" || group === activeGroup);

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
              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-hero-muted sm:text-xl">Draft from all 48 World Cup coaches. Score every selection, tactical switch, substitution, and match result on football's biggest stage.</p>
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
            <p className="mt-5 leading-relaxed text-muted-foreground">Every tournament coach is available. International players drive the outcome, while your coaches earn points for squad selection, formation, substitutions, game management, and competitive context.</p>
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
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search coach or country" aria-label="Search World Cup coaches" className="pl-10" />
              </div>
              <div className="flex flex-wrap gap-2" aria-label="Filter coaches by group">
                {["All", ...groups].map((group) => (
                  <Button key={group} type="button" size="sm" variant={activeGroup === group ? "default" : "outline"} onClick={() => setActiveGroup(group)}>
                    {group === "All" ? "All 48" : `Group ${group}`}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-9">
              {visibleGroups.map((group) => {
                const groupCoaches = visibleCoaches.filter((coach) => coach.group === group);
                if (groupCoaches.length === 0) return null;
                return (
                  <section key={group} aria-labelledby={`group-${group}`}>
                    <div className="flex items-end justify-between border-b-2 border-foreground pb-3">
                      <h3 id={`group-${group}`} className="font-display text-2xl font-black uppercase">Group {group}</h3>
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{groupCoaches.length} coaches</span>
                    </div>
                    {groupCoaches.map((coach) => {
                      const selected = roster.includes(coach.id);
                      return (
                        <article key={coach.id} className={cn("grid items-center gap-4 border-b border-border py-5 sm:grid-cols-[36px_1fr_auto]", selected && "bg-primary/5")}>
                          <span className="font-display text-xl font-black text-muted-foreground">{String(rankingById.get(coach.id)).padStart(2, "0")}</span>
                          <div className="flex items-center gap-4">
                            <span className={cn("grid size-12 shrink-0 place-items-center rounded-full font-display font-black", selected ? "bg-primary text-primary-foreground" : "bg-secondary")}>{coach.initials}</span>
                            <div><h4 className="font-bold">{coach.name}</h4><p className="text-sm text-muted-foreground">{coach.nation} · {coach.trait}</p><p className="mt-1 font-mono text-xs font-bold">Projected {coach.score}</p></div>
                          </div>
                          <Button variant={selected ? "default" : "outline"} onClick={() => toggleCoach(coach.id)} disabled={!selected && roster.length >= 3}>{selected ? <><Check /> Selected</> : <>Draft <ChevronRight /></>}</Button>
                        </article>
                      );
                    })}
                  </section>
                );
              })}
              {visibleCoaches.length === 0 && <p className="border-y border-border py-10 text-center text-muted-foreground">No coaches match your search.</p>}
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