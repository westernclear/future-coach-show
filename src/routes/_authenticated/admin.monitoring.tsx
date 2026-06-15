import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AlertCircle, Loader2, Mail, RefreshCw, Siren } from "lucide-react";

import { CoachFacePageShell, PageHero } from "@/components/coachface-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toast } from "sonner";
import {
  getMonitoringEvents,
  triggerAlertSweep,
  triggerProbe,
} from "@/lib/monitoring.functions";

export const Route = createFileRoute("/_authenticated/admin/monitoring")({
  head: () => ({
    meta: [
      { title: "Monitoring & Alerts | CoachFace Admin" },
      { name: "description", content: "Live uptime probes, error feed, and alert controls." },
    ],
  }),
  component: AdminMonitoringPage,
});

const kindColors: Record<string, string> = {
  client_error: "bg-orange-500/15 text-orange-700 border-orange-500/30",
  server_error: "bg-red-500/15 text-red-700 border-red-500/30",
  probe_failure: "bg-red-500/15 text-red-700 border-red-500/30",
  probe_success: "bg-green-500/15 text-green-700 border-green-500/30",
  alert_sent: "bg-blue-500/15 text-blue-700 border-blue-500/30",
};

const kindLabels: Record<string, string> = {
  client_error: "Client error",
  server_error: "Server error",
  probe_failure: "Probe failed",
  probe_success: "Probe ok",
  alert_sent: "Alert sent",
};

function AdminMonitoringPage() {
  const [hours, setHours] = useState(24);
  const [kindFilter, setKindFilter] = useState<string>("incidents");

  const fetchEvents = useServerFn(getMonitoringEvents);
  const runProbe = useServerFn(triggerProbe);
  const runSweep = useServerFn(triggerAlertSweep);
  const qc = useQueryClient();

  const kinds =
    kindFilter === "incidents"
      ? (["client_error", "server_error", "probe_failure"] as const)
      : kindFilter === "all"
        ? undefined
        : ([kindFilter] as ("client_error" | "server_error" | "probe_failure" | "probe_success" | "alert_sent")[]);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["monitoring-events", hours, kindFilter],
    queryFn: () =>
      fetchEvents({
        data: { hours, kinds: kinds as never, limit: 200 },
      }),
    refetchInterval: 30_000,
  });

  const probeMutation = useMutation({
    mutationFn: () => runProbe({} as never),
    onSuccess: (r) => {
      toast.success(`Probe ran (${r.status})`);
      qc.invalidateQueries({ queryKey: ["monitoring-events"] });
    },
    onError: (e) => toast.error(`Probe failed: ${e instanceof Error ? e.message : String(e)}`),
  });

  const sweepMutation = useMutation({
    mutationFn: () => runSweep({} as never),
    onSuccess: (r) =>
      toast.success(`Alert sweep ran (${r.status}). ${r.body.slice(0, 120)}`),
    onError: (e) => toast.error(`Sweep failed: ${e instanceof Error ? e.message : String(e)}`),
  });

  const summary = data?.summary ?? {
    client_error: 0,
    server_error: 0,
    probe_failure: 0,
    probe_success: 0,
    alert_sent: 0,
  };

  return (
    <CoachFacePageShell>
      <PageHero
        eyebrow="Admin"
        title="Monitoring & Alerts"
        description="Synthetic uptime probes run every 5 minutes against the homepage, /auth, /dashboard, /onboarding, /profile, and /security. Client-side errors and SSR crashes are captured here. Email alerts go to info@coachface.com when failures appear."
        aside={
          <div className="flex flex-col gap-2 lg:items-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => probeMutation.mutate()}
              disabled={probeMutation.isPending}
            >
              {probeMutation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Siren className="mr-2 size-4" />
              )}
              Run probe now
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => sweepMutation.mutate()}
              disabled={sweepMutation.isPending}
            >
              {sweepMutation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Mail className="mr-2 size-4" />
              )}
              Run alert sweep
            </Button>
          </div>
        }
      />

      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <StatCard label="Client errors" value={summary.client_error} tone="warn" />
          <StatCard label="Server errors" value={summary.server_error} tone="bad" />
          <StatCard label="Probe failures" value={summary.probe_failure} tone="bad" />
          <StatCard label="Probe successes" value={summary.probe_success} tone="ok" />
          <StatCard label="Alerts sent" value={summary.alert_sent} tone="info" />
        </div>

        <Card className="mt-6">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">Event feed</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={String(hours)} onValueChange={(v) => setHours(Number(v))}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Last 1 hour</SelectItem>
                  <SelectItem value="6">Last 6 hours</SelectItem>
                  <SelectItem value="24">Last 24 hours</SelectItem>
                  <SelectItem value="72">Last 3 days</SelectItem>
                  <SelectItem value="168">Last 7 days</SelectItem>
                </SelectContent>
              </Select>
              <Select value={kindFilter} onValueChange={setKindFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="incidents">Incidents only</SelectItem>
                  <SelectItem value="all">All events</SelectItem>
                  <SelectItem value="client_error">Client errors</SelectItem>
                  <SelectItem value="server_error">Server errors</SelectItem>
                  <SelectItem value="probe_failure">Probe failures</SelectItem>
                  <SelectItem value="probe_success">Probe successes</SelectItem>
                  <SelectItem value="alert_sent">Alerts sent</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                <AlertCircle className="size-4" /> {(error as Error).message}
              </div>
            ) : isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Loading events...
              </div>
            ) : !data?.rows.length ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No events in this window. {kindFilter === "incidents" ? "Clean slate." : ""}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>When</TableHead>
                      <TableHead>Kind</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.rows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {new Date(r.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={kindColors[r.kind]}>
                            {kindLabels[r.kind] ?? r.kind}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{r.route ?? "-"}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {r.statusCode ?? "-"}
                          {r.durationMs ? ` (${r.durationMs}ms)` : ""}
                        </TableCell>
                        <TableCell className="max-w-[480px] truncate text-xs" title={r.message}>
                          {r.message}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </CoachFacePageShell>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "ok" | "warn" | "bad" | "info";
}) {
  const toneClasses = {
    ok: "border-green-500/30 bg-green-500/5 text-green-700",
    warn: "border-orange-500/30 bg-orange-500/5 text-orange-700",
    bad: "border-red-500/30 bg-red-500/5 text-red-700",
    info: "border-blue-500/30 bg-blue-500/5 text-blue-700",
  }[tone];
  return (
    <div className={`rounded-lg border p-4 ${toneClasses}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-1 font-display text-3xl font-black">{value}</p>
    </div>
  );
}
