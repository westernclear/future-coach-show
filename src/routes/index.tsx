import { createFileRoute } from "@tanstack/react-router";
import { CoachFaceApp } from "@/components/coachface-app";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CoachFace | Draft the Decision Makers" },
      { name: "description", content: "Draft coaches across sports, score every decision, and compete in the game behind the game." },
      { property: "og:title", content: "CoachFace | Draft the Decision Makers" },
      { property: "og:description", content: "Draft coaches across sports, score every decision, and compete in the game behind the game." },
    ],
  }),
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  return <CoachFaceApp />;
}
