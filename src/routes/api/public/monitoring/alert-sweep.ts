import { createFileRoute } from "@tanstack/react-router";

const ALERT_RECIPIENT = "info@coachface.com";
const ALERT_FROM = "CoachFace Monitor <onboarding@resend.dev>";
const LOOKBACK_MINUTES = 10;
// Don't email more often than this for the same incident signature.
const COOLDOWN_MINUTES = 30;

interface EventRow {
  id: string;
  kind: string;
  severity: string;
  route: string | null;
  message: string;
  status_code: number | null;
  created_at: string;
}

function buildEmailBody(events: EventRow[], origin: string) {
  const byKind = new Map<string, EventRow[]>();
  for (const e of events) {
    const arr = byKind.get(e.kind) ?? [];
    arr.push(e);
    byKind.set(e.kind, arr);
  }
  const sections = [...byKind.entries()]
    .map(([kind, rows]) => {
      const lines = rows
        .slice(0, 8)
        .map(
          (r) =>
            `<li><code>${escapeHtml(r.route ?? "-")}</code> &mdash; ${escapeHtml(
              r.message,
            )}${r.status_code ? ` (HTTP ${r.status_code})` : ""}<br/><small>${new Date(
              r.created_at,
            ).toUTCString()}</small></li>`,
        )
        .join("");
      return `<h3 style="margin:16px 0 6px;color:#dc2626">${escapeHtml(kind)} &times; ${rows.length}</h3><ul style="padding-left:18px;margin:0">${lines}</ul>${rows.length > 8 ? `<p><small>+${rows.length - 8} more&hellip;</small></p>` : ""}`;
    })
    .join("");

  return `<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111">
    <h1 style="font-size:20px;margin:0 0 8px;color:#dc2626">CoachFace alert: ${events.length} incident${events.length === 1 ? "" : "s"} in the last ${LOOKBACK_MINUTES} min</h1>
    <p style="margin:0 0 16px;color:#444">Source: <code>${escapeHtml(origin)}</code></p>
    ${sections}
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
    <p style="margin:0;color:#666;font-size:13px">View the full feed in your <a href="${origin}/admin/monitoring">Monitoring dashboard</a>.</p>
  </body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendAlertEmail(html: string, subject: string) {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
    throw new Error("Missing LOVABLE_API_KEY or RESEND_API_KEY for alert email");
  }
  const res = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": RESEND_API_KEY,
    },
    body: JSON.stringify({
      from: ALERT_FROM,
      to: [ALERT_RECIPIENT],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend gateway ${res.status}: ${body}`);
  }
}

export const Route = createFileRoute("/api/public/monitoring/alert-sweep")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const origin = `${url.protocol}//${url.host}`;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { logMonitoringEvent } = await import("@/lib/monitoring/log.server");

        const sinceIso = new Date(Date.now() - LOOKBACK_MINUTES * 60_000).toISOString();

        const { data: events, error } = await supabaseAdmin
          .from("monitoring_events")
          .select("id,kind,severity,route,message,status_code,created_at")
          .in("kind", ["client_error", "server_error", "probe_failure"])
          .in("severity", ["error", "critical"])
          .gte("created_at", sinceIso)
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) {
          console.error("[alert-sweep] query failed", error);
          return new Response(JSON.stringify({ error: "query_failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (!events || events.length === 0) {
          return Response.json({ ok: true, alerted: false, reason: "no_events" });
        }

        // Build a signature so we don't spam if the same routes keep failing.
        const signature = [...new Set(events.map((e) => `${e.kind}:${e.route ?? "-"}`))]
          .sort()
          .join("|");

        const { data: stateRows } = await supabaseAdmin
          .from("monitoring_alert_state")
          .select("last_alert_sent_at,last_alert_signature")
          .eq("id", true)
          .limit(1);
        const state = stateRows?.[0];

        const sameSignature = state?.last_alert_signature === signature;
        const lastSent = state?.last_alert_sent_at ? new Date(state.last_alert_sent_at) : null;
        const cooledDown =
          !lastSent || Date.now() - lastSent.getTime() > COOLDOWN_MINUTES * 60_000;

        if (sameSignature && !cooledDown) {
          return Response.json({
            ok: true,
            alerted: false,
            reason: "cooldown",
            signature,
            eventCount: events.length,
          });
        }

        const subject = `🚨 CoachFace: ${events.length} incident${events.length === 1 ? "" : "s"} (${LOOKBACK_MINUTES}m)`;
        const html = buildEmailBody(events as EventRow[], origin);

        try {
          await sendAlertEmail(html, subject);
        } catch (err) {
          console.error("[alert-sweep] send failed", err);
          await logMonitoringEvent({
            kind: "alert_sent",
            severity: "warning",
            message: `Alert send failed: ${err instanceof Error ? err.message : String(err)}`,
            metadata: { signature, eventCount: events.length },
          });
          return new Response(JSON.stringify({ error: "send_failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        await supabaseAdmin
          .from("monitoring_alert_state")
          .update({
            last_alert_sent_at: new Date().toISOString(),
            last_alert_signature: signature,
            updated_at: new Date().toISOString(),
          })
          .eq("id", true);

        await logMonitoringEvent({
          kind: "alert_sent",
          severity: "info",
          message: `Alert email sent for ${events.length} incident${events.length === 1 ? "" : "s"}`,
          metadata: { signature, eventCount: events.length, recipient: ALERT_RECIPIENT },
        });

        return Response.json({
          ok: true,
          alerted: true,
          eventCount: events.length,
          signature,
        });
      },
    },
  },
});
