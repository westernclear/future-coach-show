import { createFileRoute } from "@tanstack/react-router";
import { BlueprintApp } from "@/components/blueprint/BlueprintApp";

export const Route = createFileRoute("/blueprint")({
  head: () => ({
    meta: [
      { title: "CoachFace Architecture Blueprint" },
      { name: "description", content: "Mega-scale architecture and phased implementation plan for CoachFace." },
    ],
  }),
  component: () => <BlueprintApp />,
});
