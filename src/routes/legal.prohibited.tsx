import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Ban, Check } from "lucide-react";

import { CoachFacePageShell, PageHero } from "@/components/coachface-page-shell";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { listJurisdictionRules } from "@/lib/eligibility.functions";

export const Route = createFileRoute("/legal/prohibited")({
  head: () => ({
    meta: [
      { title: "Prohibited Jurisdictions | CoachFace" },
      {
        name: "description",
        content:
          "U.S. states and countries where CoachFace paid Fantasy Sports contests are unavailable.",
      },
    ],
  }),
  component: ProhibitedPage,
});

function ProhibitedPage() {
  const list = useServerFn(listJurisdictionRules);
  const { data } = useQuery({
    queryKey: ["public-jurisdictions"],
    queryFn: () => list(),
    retry: false,
  });

  const rows = (data ?? []).filter((r) => r.active);

  return (
    <CoachFacePageShell>
      <PageHero
        eyebrow="Legal"
        title="Prohibited jurisdictions"
        description="Where CoachFace contests are and aren't available, updated live from our compliance configuration."
      />
      <main className="mx-auto max-w-5xl space-y-6 px-5 py-12 lg:px-8">
        <p className="text-sm text-muted-foreground">
          The table below is the same configuration used by our gate. A green check means the contest type is allowed in that jurisdiction.
        </p>
        <div className="overflow-x-auto rounded border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jurisdiction</TableHead>
                <TableHead>Code</TableHead>
                <TableHead className="text-center">Free play</TableHead>
                <TableHead className="text-center">Paid</TableHead>
                <TableHead className="text-center">DFS</TableHead>
                <TableHead className="text-center">Season long</TableHead>
                <TableHead className="text-center">Min age</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.jurisdiction_name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {r.country_code}{r.region_code ? `-${r.region_code}` : ""}
                  </TableCell>
                  <TableCell className="text-center">{r.free_play_allowed ? <Check className="mx-auto size-4 text-primary" /> : <Ban className="mx-auto size-4 text-destructive" />}</TableCell>
                  <TableCell className="text-center">{r.paid_contests_allowed ? <Check className="mx-auto size-4 text-primary" /> : <Ban className="mx-auto size-4 text-destructive" />}</TableCell>
                  <TableCell className="text-center">{r.dfs_allowed ? <Check className="mx-auto size-4 text-primary" /> : <Ban className="mx-auto size-4 text-destructive" />}</TableCell>
                  <TableCell className="text-center">{r.season_long_allowed ? <Check className="mx-auto size-4 text-primary" /> : <Ban className="mx-auto size-4 text-destructive" />}</TableCell>
                  <TableCell className="text-center font-mono">{r.min_age}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground">
          Jurisdictions not listed default to the country baseline. United States residents in states not listed individually inherit the U.S. baseline (paid play allowed, age 18+). See{" "}
          <Link to="/legal/eligibility" className="underline">Eligibility Rules</Link> for details.
        </p>
      </main>
    </CoachFacePageShell>
  );
}
