import { createFileRoute } from "@tanstack/react-router";

// Synthetic probes hit critical SSR-rendered pages. A 5xx (or network failure)
// is recorded as a probe_failure; 2xx/3xx/4xx counts as success (auth-gated
// pages legitimately return redirects or auth shells).
const TARGETS = [
  { path: "/", label: "homepage" },
  { path: "/auth", label: "auth" },
  { path: "/dashboard", label: "dashboard" },
  { path: "/onboarding", label: "onboarding" },
  { path: "/profile", label: "profile" },
  { path: "/security", label: "security" },
];

const TIMEOUT_MS = 10_000;

async function probeOne(origin: string, path: string) {
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${origin}${path}`, {
      method: "GET",
      signal: controller.signal,
      headers: { "user-agent": "CoachFace-Monitor/1.0" },
      redirect: "manual",
    });
    return {
      ok: res.status < 500,
      status: res.status,
      durationMs: Date.now() - start,
      error: null as string | null,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function runProbe(origin: string) {
  const { logMonitoringEvent } = await import("@/lib/monitoring/log.server");
  const results = await Promise.all(
    TARGETS.map(async (t) => {
      const r = await probeOne(origin, t.path);
      await logMonitoringEvent({
        kind: r.ok ? "probe_success" : "probe_failure",
        severity: r.ok ? "info" : "critical",
        route: t.path,
        statusCode: r.status,
        durationMs: r.durationMs,
        message: r.ok
          ? `probe ok ${t.label} ${r.status} ${r.durationMs}ms`
          : `probe failed ${t.label} status=${r.status} err=${r.error ?? "5xx"}`,
        metadata: { label: t.label, error: r.error },
      });
      return { ...t, ...r };
    }),
  );
  return results;
}

export const Route = createFileRoute("/api/public/monitoring/probe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const origin = `${url.protocol}//${url.host}`;
        const results = await runProbe(origin);
        return Response.json({ ok: true, origin, results });
      },
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const origin = `${url.protocol}//${url.host}`;
        const results = await runProbe(origin);
        return Response.json({ ok: true, origin, results });
      },
    },
  },
});
