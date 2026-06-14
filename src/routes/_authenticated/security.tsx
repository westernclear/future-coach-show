import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  Loader2,
  ScanSearch,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { CoachFacePageShell, PageHero } from "@/components/coachface-page-shell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSecurityDashboard, updateSecurityFinding } from "@/lib/security-dashboard.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/security")({
  head: () => ({
    meta: [
      { title: "Security Operations | CoachFace" },
      {
        name: "description",
        content: "Monitor CoachFace security findings, owners, status, and scan trends.",
      },
    ],
  }),
  component: SecurityDashboard,
});

type FindingStatus = "open" | "in_progress" | "resolved" | "accepted_risk";

function SecurityDashboard() {
  const fetchDashboard = useServerFn(getSecurityDashboard);
  const saveFinding = useServerFn(updateSecurityFinding);
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useQuery({
    queryKey: ["security-dashboard"],
    queryFn: fetchDashboard,
  });
  const mutation = useMutation({
    mutationFn: saveFinding,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["security-dashboard"] }),
  });

  const findings = useMemo(() => data?.findings ?? [], [data?.findings]);
  const runs = useMemo(() => data?.runs ?? [], [data?.runs]);
  const filtered = useMemo(
    () =>
      findings.filter((finding) => {
        const matchesStatus = statusFilter === "all" || finding.status === statusFilter;
        const matchesSeverity = severityFilter === "all" || finding.severity === severityFilter;
        const needle = search.toLowerCase();
        const matchesSearch =
          !needle ||
          `${finding.title} ${finding.scanner} ${finding.owner ?? ""}`
            .toLowerCase()
            .includes(needle);
        return matchesStatus && matchesSeverity && matchesSearch;
      }),
    [findings, search, severityFilter, statusFilter],
  );

  const openCount = findings.filter(
    (finding) => finding.status === "open" || finding.status === "in_progress",
  ).length;
  const resolvedCount = findings.filter((finding) => finding.status === "resolved").length;
  const latestRuns = [...runs]
    .sort((a, b) => b.scanned_at.localeCompare(a.scanned_at))
    .filter((run, index, all) => all.findIndex((item) => item.source === run.source) === index);

  return (
    <CoachFacePageShell>
      <PageHero
        eyebrow="Security operations"
        title="Every finding. One accountable view."
        description="Track application, database, framework, and connector scans with clear ownership and remediation status."
        aside={
          <div className="flex items-center gap-2 border border-border bg-card px-4 py-3 text-sm font-bold">
            <ShieldCheck className="size-5 text-positive" /> Admin protected
          </div>
        }
      />
      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={error.message} />
        ) : (
          <>
            <section
              className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4"
              aria-label="Security summary"
            >
              <Summary
                label="Open issues"
                value={openCount}
                icon={<AlertTriangle />}
                urgent={openCount > 0}
              />
              <Summary label="Resolved" value={resolvedCount} icon={<CheckCircle2 />} />
              <Summary label="Scan sources" value={latestRuns.length} icon={<ScanSearch />} />
              <Summary
                label="Assigned"
                value={findings.filter((finding) => finding.owner).length}
                icon={<UserRound />}
              />
            </section>

            <div className="mt-12 grid gap-10 lg:grid-cols-[1.6fr_0.8fr]">
              <section>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="eyebrow">Issue register</p>
                    <h2 className="mt-2 font-display text-4xl font-black uppercase">Findings</h2>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Input
                      aria-label="Search findings"
                      placeholder="Search issues"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                    <Filter
                      value={severityFilter}
                      onChange={setSeverityFilter}
                      label="Severity"
                      options={["all", "critical", "high", "medium", "low", "info"]}
                    />
                    <Filter
                      value={statusFilter}
                      onChange={setStatusFilter}
                      label="Status"
                      options={["all", "open", "in_progress", "resolved", "accepted_risk"]}
                    />
                  </div>
                </div>
                <div className="mt-6 border-t border-border">
                  {filtered.length ? (
                    filtered.map((finding) => (
                      <article
                        key={finding.id}
                        className="grid gap-5 border-b border-border py-6 xl:grid-cols-[1fr_180px_170px]"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Severity severity={finding.severity} />
                            <Badge variant="outline" className="font-mono font-normal">
                              {sourceLabel(finding.scanner)}
                            </Badge>
                          </div>
                          <h3 className="mt-3 text-lg font-bold">{finding.title}</h3>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            {finding.description}
                          </p>
                          {finding.remediation && (
                            <p className="mt-3 border-l-2 border-primary pl-3 text-sm">
                              <strong>Remediation:</strong> {finding.remediation}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                            htmlFor={`owner-${finding.id}`}
                          >
                            Owner
                          </label>
                          <Input
                            id={`owner-${finding.id}`}
                            className="mt-2"
                            defaultValue={finding.owner ?? ""}
                            onBlur={(event) =>
                              mutation.mutate({
                                data: {
                                  id: finding.id,
                                  status: finding.status as FindingStatus,
                                  owner: event.target.value,
                                },
                              })
                            }
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Status
                          </p>
                          <Select
                            value={finding.status}
                            onValueChange={(status: FindingStatus) =>
                              mutation.mutate({
                                data: { id: finding.id, status, owner: finding.owner ?? "" },
                              })
                            }
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {["open", "in_progress", "resolved", "accepted_risk"].map(
                                (status) => (
                                  <SelectItem key={status} value={status}>
                                    {pretty(status)}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                          <p className="mt-3 text-xs text-muted-foreground">
                            Last seen {dateLabel(finding.last_detected_at)}
                          </p>
                        </div>
                      </article>
                    ))
                  ) : (
                    <p className="py-10 text-sm text-muted-foreground">
                      No findings match these filters.
                    </p>
                  )}
                </div>
              </section>

              <aside className="space-y-10">
                <section>
                  <p className="eyebrow">Coverage</p>
                  <h2 className="mt-2 font-display text-3xl font-black uppercase">Latest scans</h2>
                  <div className="mt-5 border-t border-border">
                    {latestRuns.map((run) => (
                      <div
                        key={run.id}
                        className="flex items-center justify-between gap-4 border-b border-border py-4"
                      >
                        <div>
                          <p className="font-bold">{sourceLabel(run.source)}</p>
                          <p className="text-xs text-muted-foreground">
                            v{run.scanner_version ?? "current"} · {dateLabel(run.scanned_at)}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "flex items-center gap-1.5 text-xs font-bold",
                            run.status === "completed" ? "text-positive" : "text-destructive",
                          )}
                        >
                          <CircleDot className="size-3" />
                          {pretty(run.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
                <section>
                  <p className="eyebrow">Trend</p>
                  <h2 className="mt-2 font-display text-3xl font-black uppercase">
                    Issues by scan
                  </h2>
                  <Trend runs={runs} />
                </section>
                {mutation.isPending && (
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" /> Saving update
                  </p>
                )}
                {mutation.error && (
                  <p role="alert" className="text-sm text-destructive">
                    {mutation.error.message}
                  </p>
                )}
              </aside>
            </div>
          </>
        )}
      </main>
    </CoachFacePageShell>
  );
}

function Summary({
  label,
  value,
  icon,
  urgent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  urgent?: boolean;
}) {
  return (
    <div className="bg-card p-6">
      <span className={cn("[&_svg]:size-5", urgent ? "text-destructive" : "text-primary")}>
        {icon}
      </span>
      <p className="mt-5 font-display text-4xl font-black">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
function Severity({ severity }: { severity: string }) {
  return (
    <Badge variant={severity === "critical" || severity === "high" ? "destructive" : "secondary"}>
      {pretty(severity)}
    </Badge>
  );
}
function Filter({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  options: string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {pretty(option)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
function Trend({
  runs,
}: {
  runs: Array<{ id: string; issues_found: number; scanned_at: string; source: string }>;
}) {
  const points = [...runs].sort((a, b) => a.scanned_at.localeCompare(b.scanned_at)).slice(-8);
  const max = Math.max(1, ...points.map((run) => run.issues_found));
  return (
    <div className="mt-5 flex h-44 items-end gap-2 border-b border-l border-border px-3 pt-4">
      {points.map((run) => (
        <div key={run.id} className="group flex flex-1 flex-col items-center justify-end gap-2">
          <span className="text-xs font-bold">{run.issues_found}</span>
          <div
            className="w-full min-w-3 bg-primary transition-opacity group-hover:opacity-75"
            style={{ height: `${Math.max(6, (run.issues_found / max) * 110)}px` }}
            title={`${sourceLabel(run.source)}: ${run.issues_found} issues`}
          />
        </div>
      ))}
    </div>
  );
}
function Loading() {
  return (
    <div className="grid min-h-72 place-items-center">
      <Loader2 className="size-7 animate-spin text-primary" />
    </div>
  );
}
function ErrorState({ message }: { message: string }) {
  return (
    <div role="alert" className="border border-destructive/30 bg-card p-6">
      <h2 className="font-bold">Security dashboard unavailable</h2>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
function sourceLabel(source: string) {
  return (
    {
      connector_security_scan: "Connectors / Wiz",
      supabase: "Database Linter",
      supabase_lov: "Cloud Security",
      tanstack: "Application",
    }[source] ?? source
  );
}
function pretty(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
