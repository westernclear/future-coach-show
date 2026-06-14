import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, ChevronRight, Clock3, Trophy } from "lucide-react";

import { CoachFacePageShell, PageHero } from "@/components/coachface-page-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const slate = [
  { id: 1, initials: "AR", name: "Andy Reid", sport: "NFL Football · Kansas City Chiefs", projection: 94.2 },
  { id: 2, initials: "MD", name: "Mark Daigneault", sport: "Basketball · Oklahoma City Thunder", projection: 93.1 },
  { id: 3, initials: "DR", name: "Dave Roberts", sport: "Baseball · Los Angeles Dodgers", projection: 91.8 },
  { id: 4, initials: "MA", name: "Mikel Arteta", sport: "Premier League · Arsenal", projection: 90.6 },
  { id: 5, initials: "LE", name: "Luis Enrique", sport: "Champions League · Paris Saint-Germain", projection: 89.9 },
  { id: 6, initials: "FL", name: "Frank Lampard", sport: "Championship League · Coventry City", projection: 86.5 },
];

export const Route = createFileRoute("/play")({
  head: () => ({ meta: [
    { title: "Play CoachFace Fantasy" },
    { name: "description", content: "Build a free weekly fantasy roster of coaches across four sports." },
    { property: "og:title", content: "Play CoachFace Fantasy" },
    { property: "og:description", content: "Choose three decision makers and compete in the weekly free slate." },
  ] }),
  component: PlayPage,
});

function PlayPage() {
  const [roster, setRoster] = useState<number[]>([1]);
  const toggle = (id: number) => setRoster((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 3 ? [...current, id] : current);
  return (
    <CoachFacePageShell>
      <PageHero eyebrow="Weekly free play" title="Your coaches. Your call." description="Draft up to three leaders for the weekly slate. Every tactical adjustment, challenge, and result can move your roster." aside={<div className="border-l-2 border-primary pl-5"><p className="font-display text-4xl font-black">{roster.length}/3</p><p className="text-sm text-muted-foreground">Coaches selected</p></div>} />
      <main className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[0.7fr_1.3fr] lg:px-8 lg:py-16">
        <aside>
          <p className="eyebrow">Week 14 slate</p><h2 className="mt-3 font-display text-4xl font-black uppercase">Build your lineup</h2>
          <div className="mt-6 flex items-start gap-3 border-y border-border py-5"><Clock3 className="mt-0.5 size-5 text-primary" /><div><p className="font-bold">Locks Sunday at 12:55 PM ET</p><p className="mt-1 text-sm text-muted-foreground">You can update your roster until the slate locks.</p></div></div>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">Free to play. Pick coaches from any sport. Your highest combined CoachFace score determines your leaderboard position.</p>
        </aside>
        <section aria-label="Available coaches" className="space-y-3">
          {slate.map((coach) => {
            const selected = roster.includes(coach.id);
            return <article key={coach.id} className={cn("flex flex-col gap-4 border p-4 sm:flex-row sm:items-center sm:p-5", selected ? "border-primary bg-primary/5" : "border-border")}><span className="grid size-12 shrink-0 place-items-center rounded-full bg-secondary font-display font-black">{coach.initials}</span><div className="min-w-0 flex-1"><h2 className="font-bold">{coach.name}</h2><p className="break-words text-sm text-muted-foreground">{coach.sport} · Projected {coach.projection} pts</p></div><Button className="w-full sm:w-auto" variant={selected ? "default" : "outline"} onClick={() => toggle(coach.id)} disabled={!selected && roster.length >= 3}>{selected ? <><Check /> Selected</> : <>Add coach <ChevronRight /></>}</Button></article>;
          })}
          <Button size="lg" className="mt-5 w-full" disabled={roster.length === 0} onClick={() => alert(`Roster saved with ${roster.length} coach${roster.length === 1 ? "" : "es"}.`)}>Save weekly roster <Trophy /></Button>
        </section>
      </main>
    </CoachFacePageShell>
  );
}