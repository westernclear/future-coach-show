import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Ban, ChevronLeft, ChevronRight, Filter, Loader2, ShieldCheck } from "lucide-react";

import { CoachFacePageShell, PageHero } from "@/components/coachface-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { checkIsAdmin, getUploadRejectionAudits } from "@/lib/admin-audits.functions";
import { cn } from "@/lib/utils";

const reasonLabels: Record<string, string> = {
  invalid_type: "Invalid type",
  type_mismatch: "Type mismatch",
  oversized_bytes: "Oversized file",
  oversized_pixels: "Too many pixels",
  invalid_dimensions: "Invalid dimensions",
  decode_timeout: "Decode timeout",
  decode_failed: "Decode failed",
  too_blurry: "Too blurry",
};

const reasonCodes = [
  "invalid_type",
  "type_mismatch",
  "oversized_bytes",
  "oversized_pixels",
  "invalid_dimensions",
  "decode_timeout",
  "decode_failed",
  "too_blurry",
];

export const Route = createFileRoute("/_authenticated/admin/audits")({
  head: () => ({
    meta: [
      { title: "Upload Rejection Audits | CoachFace Admin" },
      { name: "description", content: "Browse and filter profile image upload rejection audits." },
    ],
  }),
  component: AdminAuditsPage,
  errorComponent: ({ error }) => (
    <CoachFacePageShell>
      <main className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <p role="alert" className="text-sm text-destructive">
          {error.message}
        </p>
      </main>
    </CoachFacePageShell>
  ),
});

function AdminAuditsPage() {
  const checkAdmin = useServerFn(checkIsAdmin);
  const fetchAudits = useServerFn(getUploadRejectionAudits);

  const [reasonFilter, setReasonFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("");
  const [timeRange, setTimeRange] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => checkAdmin(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const filters = useMemo(
    () => ({
      reason: reasonFilter === "all" ? undefined : reasonFilter,
      userId: userFilter.trim() || undefined,
      timeRange: timeRange as "24h" | "7d" | "30d" | "all" | "custom",
      startDate: timeRange === "custom" ? startDate : undefined,
      endDate: timeRange === "custom" ? endDate : undefined,
      page,
      pageSize,
    }),
    [reasonFilter, userFilter, timeRange, startDate, endDate, page],
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ["upload-rejection-audits", filters],
    queryFn: () => fetchAudits({ data: filters }),
    enabled: isAdmin === true,
    retry: false,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.count / data.pageSize)) : 1;

  if (checkingAdmin) {
    return (
      <CoachFacePageShell>
        <main className="mx-auto flex max-w-7xl items-center justify-center px-5 py-20 lg:px-8">
          <Loader2 className="size-6 animate-spin text-primary" />
        </main>
      </CoachFacePageShell>
    );
  }

  if (!isAdmin) {
    return (
      <CoachFacePageShell>
        <PageHero
          eyebrow="Admin"
          title="Access denied."
          description="You do not have permission to view this area."
        />
        <main className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
          <div className="flex items-center gap-3 border border-destructive/30 bg-destructive/5 p-6 text-destructive">
            <Ban className="size-5" />
            <p className="text-sm font-medium">This page is restricted to administrators.</p>
          </div>
        </main>
      </CoachFacePageShell>
    );
  }

  return (
    <CoachFacePageShell>
      <PageHero
        eyebrow="Admin"
        title="Upload rejection audits."
        description="Browse and filter profile image upload rejections by reason, user, and time range."
        aside={
          <div className="flex items-center gap-2 border border-border bg-card px-4 py-3 text-sm font-bold">
            <ShieldCheck className="size-5 text-positive" /> Admin protected
          </div>
        }
      />
      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reason</label>
            <Select value={reasonFilter} onValueChange={(value) => { setReasonFilter(value); setPage(1); }}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All reasons</SelectItem>
                {reasonCodes.map((code) => (
                  <SelectItem key={code} value={code}>
                    {reasonLabels[code] ?? code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">User ID</label>
            <Input
              placeholder="Filter by user UUID"
              value={userFilter}
              onChange={(e) => { setUserFilter(e.target.value); setPage(1); }}
              className="mt-2"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Time range</label>
            <Select value={timeRange} onValueChange={(value) => { setTimeRange(value); setPage(1); }}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Results</label>
            <p className="mt-3 text-sm font-medium">
              {data?.count ?? 0} total rejection{data && data.count !== 1 ? "s" : ""}
            </p>
          </div>
        </section>

        {timeRange === "custom" && (
          <section className="mb-8 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">From</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-2" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">To</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-2" />
            </div>
          </section>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <p role="alert" className="text-sm text-destructive">
            {error.message}
          </p>
        ) : (
          <>
            <div className="overflow-auto rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Claimed type</TableHead>
                    <TableHead>Detected type</TableHead>
                    <TableHead className="text-right">Size</TableHead>
                    <TableHead className="text-right">Dimensions</TableHead>
                    <TableHead className="text-right">Duration (ms)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data && data.rows.length > 0 ? (
                    data.rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="whitespace-nowrap text-xs">
                          {new Date(row.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <p className="font-medium">{row.displayName ?? row.username ?? "—"}</p>
                            <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{row.userId.slice(0, 8)}…</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {reasonLabels[row.reasonCode] ?? row.reasonCode}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{row.claimedType ?? "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{row.detectedType ?? "—"}</TableCell>
                        <TableCell className="text-right text-xs font-mono">
                          {formatBytes(row.byteSize)}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono">
                          {row.width && row.height ? `${row.width}×${row.height}` : "—"}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono">
                          {row.validationDurationMs}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                        No rejections match the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Page {page} of {totalPages} · {data?.count ?? 0} total
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </CoachFacePageShell>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
