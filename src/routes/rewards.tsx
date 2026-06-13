import { createFileRoute } from "@tanstack/react-router";
import { Award, Crown, Medal, Shirt, Sparkles, Ticket, Trophy, Users } from "lucide-react";

import { CoachFacePageShell, PageHero } from "@/components/coachface-page-shell";
import { Badge } from "@/components/ui/badge";

const rewardTiers = [
  { finish: "Play the week", reward: "Participation XP", detail: "Submit a valid roster before lock and keep your streak alive.", icon: Sparkles },
  { finish: "Top 25%", reward: "CoachFace Points", detail: "Earn redeemable loyalty points plus a weekly profile badge.", icon: Award },
  { finish: "Top 10%", reward: "Points + contest ticket", detail: "Unlock more points and a discounted future contest entry.", icon: Ticket },
  { finish: "Top 3", reward: "Premium prize tier", detail: "Receive profile recognition, merchandise, and a future entry.", icon: Medal },
  { finish: "1st place", reward: "Weekly Champion", detail: "Claim the title, shareable winner card, merchandise, and the top published prize.", icon: Crown },
];

const formats = [
  { title: "Global leaderboard", text: "Compete against the full CoachFace field in free and eligible paid weekly contests.", icon: Trophy },
  { title: "Private leagues", text: "Challenge friends, offices, and communities for weekly wins and season standings.", icon: Users },
  { title: "Head-to-head", text: "Face one opponent. Highest verified roster score wins under the published rules.", icon: Medal },
];

export const Route = createFileRoute("/rewards")({
  head: () => ({ meta: [
    { title: "Weekly Fantasy Rewards | CoachFace" },
    { name: "description", content: "Explore CoachFace weekly fantasy rewards, badges, contest tickets, merchandise, and published prize pools." },
    { property: "og:title", content: "Weekly Fantasy Rewards | CoachFace" },
    { property: "og:description", content: "Every valid roster earns progress. Top finishes unlock badges, tickets, merchandise, and eligible contest prizes." },
  ] }),
  component: RewardsPage,
});

function RewardsPage() {
  return (
    <CoachFacePageShell>
      <PageHero
        eyebrow="Weekly rewards"
        title="Every roster has something to chase."
        description="Build your streak, earn CoachFace Points, collect achievement badges, and compete for the prize published before every contest locks."
        aside={<div className="border-l-2 border-primary pl-5"><p className="font-display text-4xl font-black">5 tiers</p><p className="text-sm text-muted-foreground">From entry to champion</p></div>}
      />
      <main className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        <section aria-labelledby="reward-ladder-title">
          <p className="eyebrow">The weekly ladder</p>
          <h2 id="reward-ladder-title" className="section-title">Finish higher. Unlock more.</h2>
          <div className="mt-10 border-t border-border">
            {rewardTiers.map(({ finish, reward, detail, icon: Icon }, index) => (
              <article key={finish} className="grid gap-4 border-b border-border py-6 sm:grid-cols-[52px_0.45fr_1fr] sm:items-center">
                <span className="grid size-11 place-items-center rounded-full bg-secondary"><Icon className="size-5 text-primary" /></span>
                <div><p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Tier {index + 1}</p><h3 className="mt-1 font-display text-2xl font-black uppercase">{finish}</h3></div>
                <div><p className="font-bold">{reward}</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{detail}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20 grid gap-10 lg:grid-cols-[0.75fr_1.25fr]" aria-labelledby="points-title">
          <div><p className="eyebrow">CoachFace Points</p><h2 id="points-title" className="section-title">Value that stays in the game.</h2></div>
          <div className="grid gap-px bg-border sm:grid-cols-2">
            {[{ icon: Ticket, title: "Contest entries", text: "Redeem points for eligible free or discounted future entries." }, { icon: Shirt, title: "Merchandise", text: "Unlock CoachFace gear and sponsored weekly rewards." }, { icon: Award, title: "Profile upgrades", text: "Display premium badges, streaks, titles, and trophy history." }, { icon: Trophy, title: "Special tournaments", text: "Qualify for limited contests and season-ending events." }].map(({ icon: Icon, title, text }) => (
              <article key={title} className="bg-background p-6"><Icon className="size-6 text-primary" /><h3 className="mt-5 font-bold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p></article>
            ))}
          </div>
        </section>

        <section className="mt-20" aria-labelledby="formats-title">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">Ways to win</p><h2 id="formats-title" className="section-title">Your competition. Your call.</h2></div><Badge variant="outline" className="w-fit">Free and eligible paid contests</Badge></div>
          <div className="mt-10 grid gap-px bg-border md:grid-cols-3">
            {formats.map(({ title, text, icon: Icon }) => <article key={title} className="bg-background p-7"><Icon className="size-7 text-primary" /><h3 className="mt-6 font-display text-2xl font-black uppercase">{title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p></article>)}
          </div>
        </section>

        <section className="mt-20 border-y border-border py-8" aria-label="Paid contest notice">
          <div className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr]"><h2 className="font-display text-3xl font-black uppercase">Clear rules before lock.</h2><p className="leading-relaxed text-muted-foreground">Every eligible paid contest will publish its entry price, guaranteed prize pool, payout table, roster rules, tiebreaker, location eligibility, and settlement policy before entry. Cash prizes remain pending until all relevant sports results and scoring events are final.</p></div>
        </section>
      </main>
    </CoachFacePageShell>
  );
}