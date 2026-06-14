import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, BarChart3, ChevronRight, CircleDollarSign, Coins, Trophy } from "lucide-react";

import { CoachFacePageShell, PageHero } from "@/components/coachface-page-shell";
import { Button } from "@/components/ui/button";
import { getPlayerDashboard } from "@/lib/dashboard.functions";

const dashboardQuery = queryOptions({ queryKey: ["player-dashboard"], queryFn: () => getPlayerDashboard() });

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [
    { title: "Player Dashboard | CoachFace" },
    { name: "description", content: "Track CoachFace contests, predictions, rankings, badges, rewards, and wallet balances." },
  ] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data } = useSuspenseQuery(dashboardQuery);
  const name = data.profile?.display_name ?? "CoachFace player";
  return <CoachFacePageShell>
    <PageHero eyebrow="Player dashboard" title={`Welcome, ${name}.`} description="Your contests, coaching predictions, rankings, badges, rewards, and leaderboard position in one place." aside={<Button asChild><Link to="/play">Build a roster <ChevronRight /></Link></Button>} />
    <main className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
      <section aria-label="Wallet and points balance" className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={<BarChart3 />} label="Fantasy points" value={String(data.wallet.fantasy_points)} />
        <Metric icon={<Coins />} label="Reward credits" value={String(data.wallet.reward_credits)} />
        <Metric icon={<Trophy />} label="Promo tokens" value={String(data.wallet.promotional_tokens)} />
        <Metric icon={<CircleDollarSign />} label="Winnings" value={`$${(data.wallet.winnings_cents / 100).toFixed(2)}`} />
      </section>
      <div className="mt-12 grid gap-12 lg:grid-cols-[1.3fr_0.7fr]">
        <section><div className="flex items-end justify-between"><div><p className="eyebrow">Active and recent</p><h2 className="mt-2 font-display text-4xl font-black uppercase">Contests and predictions</h2></div><Button variant="link" asChild><Link to="/play">Play now</Link></Button></div><div className="mt-6 border-t border-border">{data.entries.length ? data.entries.map((entry) => <article key={entry.id} className="grid gap-3 border-b border-border py-5 sm:grid-cols-[1fr_auto_auto]"><div><h3 className="font-bold">{entry.contests?.name ?? entry.entry_name}</h3><p className="text-sm text-muted-foreground">{entry.entry_name}</p></div><div><p className="text-xs uppercase tracking-wider text-muted-foreground">Points</p><p className="font-display text-2xl font-black">{entry.total_points}</p></div><div><p className="text-xs uppercase tracking-wider text-muted-foreground">Rank</p><p className="font-display text-2xl font-black">{entry.rank ? `#${entry.rank}` : "Pending"}</p></div></article>) : <Empty text="No active contests yet. Build your first free roster to begin." />}</div></section>
        <aside><p className="eyebrow">Achievements</p><h2 className="mt-2 font-display text-4xl font-black uppercase">Badges</h2><div className="mt-6 border-t border-border">{data.badges.length ? data.badges.map((badge) => <div key={badge.id} className="flex items-center gap-4 border-b border-border py-5"><span className="grid size-11 place-items-center rounded-full bg-secondary"><Award className="text-primary" /></span><div><p className="font-bold">{badge.reward_badges?.name ?? "CoachFace badge"}</p><p className="text-sm text-muted-foreground">{badge.reward_badges?.description}</p></div></div>) : <Empty text="Your earned badges will appear here." />}</div></aside>
      </div>
      <section className="mt-12"><p className="eyebrow">Wallet history</p><h2 className="mt-2 font-display text-4xl font-black uppercase">Rewards</h2><div className="mt-6 border-t border-border">{data.rewards.length ? data.rewards.map((reward) => <div key={reward.id} className="grid grid-cols-[1fr_auto] gap-4 border-b border-border py-4"><div><p className="font-bold">{reward.description}</p><p className="text-sm capitalize text-muted-foreground">{reward.kind} · {reward.status}</p></div><p className="font-display text-2xl font-black">{reward.amount}</p></div>) : <Empty text="Points, rewards, credits, winnings, and promotional tokens will be tracked here." />}</div></section>
    </main>
  </CoachFacePageShell>;
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="bg-card p-6"><span className="text-primary [&_svg]:size-5">{icon}</span><p className="mt-5 font-display text-4xl font-black">{value}</p><p className="mt-1 text-sm text-muted-foreground">{label}</p></div>; }
function Empty({ text }: { text: string }) { return <p className="border-b border-border py-8 text-sm text-muted-foreground">{text}</p>; }