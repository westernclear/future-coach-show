import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Radio } from "lucide-react";

import { CoachFacePageShell, PageHero } from "@/components/coachface-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const coaches = [
  { rank: 1, initials: "MC", name: "Marcus Cole", sport: "Football", role: "Head Coach", score: 94.2, change: "+3.8", form: "W W W L W" },
  { rank: 2, initials: "AR", name: "Ana Reyes", sport: "Soccer", role: "Manager", score: 91.7, change: "+1.4", form: "W D W W W" },
  { rank: 3, initials: "DM", name: "Darius Miles", sport: "Basketball", role: "Head Coach", score: 89.4, change: "+4.2", form: "W W L W W" },
  { rank: 4, initials: "JL", name: "Jordan Lee", sport: "Baseball", role: "Manager", score: 86.9, change: "-0.6", form: "W L W W L" },
  { rank: 5, initials: "SK", name: "Samira Khan", sport: "Soccer", role: "Manager", score: 85.8, change: "+2.1", form: "D W W L W" },
  { rank: 6, initials: "TB", name: "Theo Brooks", sport: "Basketball", role: "Head Coach", score: 83.6, change: "-1.2", form: "L W W W L" },
];
const sports = ["All", "Football", "Basketball", "Baseball", "Soccer"];

export const Route = createFileRoute("/rankings")({
  head: () => ({ meta: [
    { title: "Live Coach Rankings | CoachFace" },
    { name: "description", content: "Compare live, explainable CoachFace rankings across football, basketball, baseball, and soccer." },
    { property: "og:title", content: "Live Coach Rankings | CoachFace" },
    { property: "og:description", content: "See which coaches owned the week across four sports." },
  ] }),
  component: RankingsPage,
});

function RankingsPage() {
  const [sport, setSport] = useState("All");
  const visible = useMemo(() => coaches.filter((coach) => sport === "All" || coach.sport === sport), [sport]);
  return (
    <CoachFacePageShell>
      <PageHero eyebrow="CoachFace Index" title="Who owned the week?" description="A live, explainable ranking built from game management, tactical decisions, unit performance, and results." aside={<Badge className="w-fit rounded-sm px-3 py-2 uppercase tracking-wider"><Radio className="mr-2 size-3" /> Live index</Badge>} />
      <main className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        <div className="flex flex-wrap gap-2" aria-label="Filter rankings by sport">
          {sports.map((item) => <Button key={item} size="sm" variant={sport === item ? "default" : "outline"} onClick={() => setSport(item)}>{item}</Button>)}
        </div>
        <div className="mt-8 border-t border-border">
          {visible.map((coach) => (
            <article key={coach.name} className="grid items-center gap-4 border-b border-border py-5 sm:grid-cols-[48px_1fr_auto_auto]">
              <span className="font-display text-2xl font-black text-muted-foreground">{String(coach.rank).padStart(2, "0")}</span>
              <div className="flex items-center gap-4"><span className="grid size-12 place-items-center rounded-full bg-secondary font-display font-black">{coach.initials}</span><div><h2 className="font-bold">{coach.name}</h2><p className="text-sm text-muted-foreground">{coach.sport} · {coach.role}</p></div></div>
              <div className="hidden text-right md:block"><p className="font-mono text-xs uppercase text-muted-foreground">Last five</p><p className="mt-1 font-mono text-sm font-bold">{coach.form}</p></div>
              <div className="flex min-w-32 items-center justify-between gap-4 sm:justify-end"><span className={cn("flex items-center text-xs font-bold", coach.change.startsWith("+") ? "text-positive" : "text-destructive")}>{coach.change.startsWith("+") && <ArrowUpRight className="size-3" />}{coach.change}</span><strong className="font-display text-3xl">{coach.score}</strong></div>
            </article>
          ))}
        </div>
      </main>
    </CoachFacePageShell>
  );
}