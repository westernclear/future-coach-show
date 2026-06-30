import { createFileRoute, Link } from "@tanstack/react-router";
import { CoachFacePageShell, PageHero } from "@/components/coachface-page-shell";

export const Route = createFileRoute("/legal/eligibility")({
  head: () => ({
    meta: [
      { title: "Eligibility Rules | CoachFace Fantasy Sports" },
      {
        name: "description",
        content:
          "Who can play CoachFace Fantasy Sports. Minimum age, U.S. state availability, and country restrictions for paid contests.",
      },
    ],
  }),
  component: EligibilityLegalPage,
});

function EligibilityLegalPage() {
  return (
    <CoachFacePageShell>
      <PageHero
        eyebrow="Legal"
        title="Eligibility rules"
        description="CoachFace is a skill-based Fantasy Sports platform. Eligibility depends on your age and where you live."
      />
      <main className="mx-auto max-w-3xl space-y-8 px-5 py-12 text-sm leading-relaxed lg:px-8">
        <section>
          <h2 className="font-display text-2xl font-black uppercase">1. General requirements</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
            <li>You must be at least <strong className="text-foreground">18 years old</strong> (21+ in AZ, IA, LA, MA, NV).</li>
            <li>You must be a legal resident of an eligible country and U.S. state.</li>
            <li>You must register a single account with accurate identity information.</li>
            <li>You must not be on any OFAC sanctioned list.</li>
            <li>You must not be an employee, contractor, or immediate family member of CoachFace or of any participating professional sports league.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-black uppercase">2. Free play vs paid contests</h2>
          <p className="mt-3 text-muted-foreground">
            <strong className="text-foreground">Free play</strong> (no-entry-fee contests with optional points-only rewards) is available almost everywhere CoachFace operates.{" "}
            <strong className="text-foreground">Paid contests</strong> (including Daily Fantasy Sports and Season-Long money leagues) are only available in U.S. states and countries where Fantasy Sports is a legal game of skill under applicable law.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-black uppercase">3. U.S. legal basis</h2>
          <p className="mt-3 text-muted-foreground">
            Fantasy Sports contests on CoachFace are designed to qualify for the Fantasy Sports carve-out under the Unlawful Internet Gambling Enforcement Act of 2006 (UIGEA), 31 U.S.C. § 5362(1)(E)(ix): outcomes reflect the relative skill of participants and are determined predominantly by accumulated statistical results of multiple real-world sporting events; no prize is based on the score, point spread, or performance of any single team or solely on any single performance of an individual athlete.
          </p>
          <p className="mt-3 text-muted-foreground">
            UIGEA does not preempt state law. We block paid play in states where Fantasy Sports has been determined to be unlawful or remains unlicensed.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-black uppercase">4. Restricted U.S. states (paid contests)</h2>
          <p className="mt-3 text-muted-foreground">
            Paid CoachFace contests are <strong className="text-foreground">not available</strong> to residents of, or persons located in, the following states:
          </p>
          <p className="mt-3 font-mono text-sm">AL, AR, AZ, DE, HI, ID, LA, ME, MT, NV, WA</p>
          <p className="mt-3 text-muted-foreground">
            See the full list and live status on the{" "}
            <Link to="/legal/prohibited" className="underline">Prohibited Jurisdictions</Link> page.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-black uppercase">5. Location verification</h2>
          <p className="mt-3 text-muted-foreground">
            At sign-up you must self-attest your country of residence, U.S. state of residence (if applicable), and date of birth. On every paid-contest entry attempt we cross-check your self-attested location against your network IP location. Mismatches between attested country and detected IP country block paid entry. Using a VPN, proxy, or other tool to misrepresent your location is a violation of our{" "}
            <Link to="/terms" className="underline">Terms of Service</Link> and may be a violation of federal and state law.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-black uppercase">6. Update your eligibility</h2>
          <p className="mt-3 text-muted-foreground">
            Manage your country, state, and date of birth on the{" "}
            <Link to="/eligibility" className="underline">Eligibility &amp; Location</Link> page.
          </p>
        </section>
      </main>
    </CoachFacePageShell>
  );
}
