import { createFileRoute } from "@tanstack/react-router";

import { LegalDocument } from "@/components/legal-document";
import { privacySections } from "@/lib/legal-policies";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "CoachFace Privacy Policy" },
      {
        name: "description",
        content: "How CoachFace collects, uses, shares, protects, and retains personal information.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="Privacy Policy"
      title="Your information. Clearly handled."
      summary="This Policy describes the personal information CoachFace needs to operate secure fantasy games, how that information is used, and the controls available to you."
      sections={privacySections}
    />
  );
}