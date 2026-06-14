import { createFileRoute } from "@tanstack/react-router";

import { LegalDocument } from "@/components/legal-document";
import { termsSections } from "@/lib/legal-policies";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "CoachFace Terms of Service" },
      {
        name: "description",
        content: "Terms governing CoachFace accounts, fantasy games, rewards, conduct, and service use.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalDocument
      eyebrow="Terms of Service"
      title="The agreement for using CoachFace."
      summary="These Terms explain who may use CoachFace, how accounts and platform features operate, and the responsibilities shared by CoachFace and every participant."
      sections={termsSections}
    />
  );
}