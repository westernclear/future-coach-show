import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";

import { CoachFacePageShell, PageHero } from "@/components/coachface-page-shell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  listJurisdictionRules,
  saveJurisdictionRule,
  type JurisdictionRule,
} from "@/lib/eligibility.functions";

export const Route = createFileRoute("/_authenticated/admin/jurisdictions")({
  head: () => ({
    meta: [
      { title: "Jurisdiction Rules | CoachFace Admin" },
      { name: "description", content: "Configure which states and countries can access CoachFace contests." },
    ],
  }),
  component: AdminJurisdictionsPage,
});

function AdminJurisdictionsPage() {
  const list = useServerFn(listJurisdictionRules);
  const save = useServerFn(saveJurisdictionRule);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["jurisdiction-rules"],
    queryFn: () => list(),
  });
  const [filter, setFilter] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    const f = filter.trim().toLowerCase();
    if (!f) return data;
    return data.filter(
      (r) =>
        r.jurisdiction_name.toLowerCase().includes(f) ||
        r.country_code.toLowerCase().includes(f) ||
        (r.region_code ?? "").toLowerCase().includes(f),
    );
  }, [data, filter]);

  async function update(rule: JurisdictionRule, patch: Partial<JurisdictionRule>) {
    setSavingId(rule.id);
    try {
      await save({
        data: {
          id: rule.id,
          country_code: rule.country_code,
          region_code: rule.region_code,
          jurisdiction_name: rule.jurisdiction_name,
          free_play_allowed: rule.free_play_allowed,
          paid_contests_allowed: rule.paid_contests_allowed,
          dfs_allowed: rule.dfs_allowed,
          season_long_allowed: rule.season_long_allowed,
          min_age: rule.min_age,
          notes: rule.notes,
          active: rule.active,
          ...patch,
        },
      });
      await refetch();
    } finally {
      setSavingId(null);
    }
  }

  return (
    <CoachFacePageShell>
      <PageHero
        eyebrow="Admin"
        title="Jurisdiction rules"
        description="Configure which countries and U.S. states can access free play, paid contests, DFS, and season-long leagues."
      />
      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="mb-4 flex items-center gap-3">
          <Input
            placeholder="Filter by name or code..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-xs"
          />
          {isLoading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        </div>
        <div className="overflow-x-auto rounded border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jurisdiction</TableHead>
                <TableHead>Code</TableHead>
                <TableHead className="text-center">Free</TableHead>
                <TableHead className="text-center">Paid</TableHead>
                <TableHead className="text-center">DFS</TableHead>
                <TableHead className="text-center">Season</TableHead>
                <TableHead className="text-center">Min age</TableHead>
                <TableHead className="text-center">Active</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.jurisdiction_name}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {r.country_code}{r.region_code ? `-${r.region_code}` : ""}
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox checked={r.free_play_allowed} onCheckedChange={(v) => update(r, { free_play_allowed: !!v })} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox checked={r.paid_contests_allowed} onCheckedChange={(v) => update(r, { paid_contests_allowed: !!v })} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox checked={r.dfs_allowed} onCheckedChange={(v) => update(r, { dfs_allowed: !!v })} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox checked={r.season_long_allowed} onCheckedChange={(v) => update(r, { season_long_allowed: !!v })} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Input
                      type="number"
                      min={13}
                      max={99}
                      defaultValue={r.min_age}
                      onBlur={(e) => {
                        const v = parseInt(e.target.value, 10);
                        if (v !== r.min_age && !Number.isNaN(v)) update(r, { min_age: v });
                      }}
                      className="mx-auto h-8 w-16 text-center"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox checked={r.active} onCheckedChange={(v) => update(r, { active: !!v })} />
                  </TableCell>
                  <TableCell>
                    {savingId === r.id ? (
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    ) : (
                      <Save className="size-4 text-muted-foreground/30" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Changes are saved automatically when you toggle a value or blur a min-age field.
        </p>
      </main>
    </CoachFacePageShell>
  );
}
