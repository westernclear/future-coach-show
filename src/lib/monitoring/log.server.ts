// Server-only helper for inserting monitoring events.
// Must only be imported from server routes / server-fn handler bodies.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type MonitoringEventKind =
  | "client_error"
  | "server_error"
  | "probe_failure"
  | "probe_success"
  | "alert_sent";

export type MonitoringSeverity = "info" | "warning" | "error" | "critical";

export interface LogMonitoringEventInput {
  kind: MonitoringEventKind;
  message: string;
  severity?: MonitoringSeverity;
  route?: string | null;
  statusCode?: number | null;
  durationMs?: number | null;
  userId?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}

export async function logMonitoringEvent(input: LogMonitoringEventInput): Promise<void> {
  try {
    const { error } = await supabaseAdmin.from("monitoring_events").insert({
      kind: input.kind,
      severity: input.severity ?? "error",
      route: input.route ?? null,
      message: input.message.slice(0, 2000),
      status_code: input.statusCode ?? null,
      duration_ms: input.durationMs ?? null,
      user_id: input.userId ?? null,
      user_agent: input.userAgent?.slice(0, 500) ?? null,
      metadata: input.metadata ?? {},
    });
    if (error) console.error("[monitoring] insert failed", error);
  } catch (err) {
    console.error("[monitoring] insert threw", err);
  }
}
