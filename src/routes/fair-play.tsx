import { createFileRoute } from "@tanstack/react-router";

import { LegalDocument } from "@/components/legal-document";
import { fairPlaySections } from "@/lib/legal-policies";

export const Route = createFileRoute("/fair-play")({
  head: () => ({
    meta: [
      { title: "CoachFace Fair Play Policy" },
      {
        name: "description",
        content: "CoachFace standards against collusion, automation, multi-accounting, fraud, and abuse.",
      },
    ],
  }),
  component: FairPlayPage,
});

function FairPlayPage() {
  return (
    <LegalDocument
      eyebrow="Fair Play Policy"
      title="One player. One account. One fair game."
      summary="This Policy protects competition by defining independent play, prohibited advantages, integrity monitoring, proportionate enforcement, and appeal rights."
      sections={fairPlaySections}
    />
  );
}