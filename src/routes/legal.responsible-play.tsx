import { createFileRoute } from "@tanstack/react-router";
import { CoachFacePageShell, PageHero } from "@/components/coachface-page-shell";

export const Route = createFileRoute("/legal/responsible-play")({
  head: () => ({
    meta: [
      { title: "Responsible Play Policy | CoachFace" },
      {
        name: "description",
        content:
          "How CoachFace promotes safe, healthy Fantasy Sports play, including deposit limits, self-exclusion, and problem gambling resources.",
      },
    ],
  }),
  component: ResponsiblePlayPage,
});

function ResponsiblePlayPage() {
  return (
    <CoachFacePageShell>
      <PageHero
        eyebrow="Legal"
        title="Responsible Play"
        description="Fantasy Sports is entertainment. Play within your limits. If it stops being fun, stop playing."
      />
      <main className="mx-auto max-w-3xl space-y-8 px-5 py-12 text-sm leading-relaxed lg:px-8">
        <section>
          <h2 className="font-display text-2xl font-black uppercase">Our commitments</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
            <li>Every account is age- and location-verified before paid play.</li>
            <li>Paid contests are blocked in jurisdictions where Fantasy Sports is not legal.</li>
            <li>Deposit, entry-fee, and time limits are available on request.</li>
            <li>Self-exclusion (24h, 7d, 30d, 6 months, or permanent) is available on request.</li>
            <li>We never market paid contests to users under 18 or in restricted states.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-black uppercase">Warning signs</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
            <li>Spending more than you can afford to lose.</li>
            <li>Chasing losses with bigger entries.</li>
            <li>Hiding play from family or friends.</li>
            <li>Playing to escape stress, anxiety, or depression.</li>
            <li>Borrowing money to enter contests.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-black uppercase">Get help</h2>
          <p className="mt-3 text-muted-foreground">
            If you or someone you know may have a gambling problem, free, confidential help is available 24/7:
          </p>
          <ul className="mt-3 space-y-1.5 text-muted-foreground">
            <li><strong className="text-foreground">National Problem Gambling Helpline</strong>: call or text 1-800-GAMBLER</li>
            <li><strong className="text-foreground">National Council on Problem Gambling</strong>: <a className="underline" href="https://www.ncpgambling.org" target="_blank" rel="noopener noreferrer">ncpgambling.org</a></li>
            <li><strong className="text-foreground">Gamblers Anonymous</strong>: <a className="underline" href="https://www.gamblersanonymous.org" target="_blank" rel="noopener noreferrer">gamblersanonymous.org</a></li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-black uppercase">Self-exclusion</h2>
          <p className="mt-3 text-muted-foreground">
            To exclude yourself, email <a className="underline" href="mailto:responsible-play@coachface.com">responsible-play@coachface.com</a> from your registered address with the period you want. We will close paid-contest access immediately and refund any remaining account balance.
          </p>
        </section>
      </main>
    </CoachFacePageShell>
  );
}
