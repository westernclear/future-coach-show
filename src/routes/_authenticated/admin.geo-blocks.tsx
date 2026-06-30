import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Ban, Loader2, ShieldAlert } from "lucide-react";

import { CoachFacePageShell, PageHero } from "@/components/coachface-page-shell";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { listGeoBlocks } from "@/lib/eligibility.functions";

export const Route = createFileRoute("/_authenticated/admin/geo-blocks")({
  head: () => ({
    meta: [
      { title: "Geo Block Audit | CoachFace Admin" },
      { name: "description", content: "Audit log of blocked or flagged contest attempts." },
    ],
  }),
  component: AdminGeoBlocksPage,
});

const actions = ["blocked", "flagged_mismatch", "age_blocked"];
const timeRanges: Array<{ value: "24h"|"7d"|"30d"|"all"; label: string }> = [
  { value: "24h", label: "Last 24h" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
];

function AdminGeoBlocksPage() {
  const list = useServerFn(listGeoBlocks);
  const [action, setAction] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<"24h"|"7d"|"30d"|"all">("30d");

  const { data, isLoading } = useQuery({
    queryKey: ["geo-blocks", action, timeRange],
    queryFn: () =>
      list({
        data: {
          action: action === "all" ? undefined : action,
          timeRange,
          page: 1,
          pageSize: 100,
        },
      }),
  });

  return (
    <CoachFacePageShell>
      <PageHero
        eyebrow="Admin"
        title="Geo block audit log"
        description="Every blocked or flagged contest attempt is logged here for compliance review."
      />
      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Action" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              {actions.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {timeRanges.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {isLoading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
          <span className="ml-auto text-sm text-muted-foreground">
            {data?.count ?? 0} event{(data?.count ?? 0) === 1 ? "" : "s"}
          </span>
        </div>
        <div className="overflow-x-auto rounded border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Contest</TableHead>
                <TableHead>Attested</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.rows ?? []).map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap text-xs">
                    {new Date(r.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={r.action === "blocked" ? "destructive" : "secondary"} className="gap-1">
                      {r.action === "blocked" ? <Ban className="size-3" /> : <ShieldAlert className="size-3" />}
                      {r.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{r.reason}</TableCell>
                  <TableCell className="text-xs">{r.contest_type ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {r.attested_country ?? "?"}{r.attested_region ? `-${r.attested_region}` : ""}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {r.ip_country ?? "?"}{r.ip_region ? `-${r.ip_region}` : ""}
                  </TableCell>
                  <TableCell className="font-mono text-[10px] text-muted-foreground">
                    {r.user_id ? `${r.user_id.slice(0, 8)}...` : "anon"}
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && (data?.rows ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                    No events for this filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </CoachFacePageShell>
  );
}
