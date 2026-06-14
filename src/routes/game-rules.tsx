import { createFileRoute } from "@tanstack/react-router";

import { LegalDocument } from "@/components/legal-document";
import { gameRulesSections } from "@/lib/legal-policies";

export const Route = createFileRoute("/game-rules")({
  head: () => ({
    meta: [
      { title: "CoachFace Fantasy Game Rules" },
      {
        name: "description",
        content: "Official CoachFace rules for entries, lineups, scoring, corrections, ties, and awards.",
      },
    ],
  }),
  component: GameRulesPage,
});

function GameRulesPage() {
  return (
    <LegalDocument
      eyebrow="Official Game Rules"
      title="Transparent rules. Defensible results."
      summary="These rules govern CoachFace fantasy contests, from entry and lineup lock through scoring, stat corrections, rankings, awards, and appeals."
      sections={gameRulesSections}
    />
  );
}