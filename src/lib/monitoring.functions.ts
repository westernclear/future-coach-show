import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const listSchema = z.object({
  hours: z.number().int().min(1).max(168).default(24),
  kinds: z
    .array(z.enum(["client_error", "server_error", "probe_failure", "probe_success", "alert_sent"]))
    .optional(),
  limit: z.number().int().min(1).max(500).default(200),
});

async function assertAdmin(supabase: { from: (t: string) => any }, userId: string) {
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const isAdmin = (roles ?? []).some((r: { role: string }) => r.role === "admin");
  if (!isAdmin) throw new Error("Forbidden");
}

export const getMonitoringEvents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => listSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const sinceIso = new Date(Date.now() - data.hours * 3600_000).toISOString();
    let query = supabaseAdmin
      .from("monitoring_events")
      .select("id,kind,severity,route,message,status_code,duration_ms,created_at,metadata")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.kinds && data.kinds.length > 0) query = query.in("kind", data.kinds);

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);

    const summary = {
      client_error: 0,
      server_error: 0,
      probe_failure: 0,
      probe_success: 0,
      alert_sent: 0,
    } as Record<string, number>;
    for (const r of rows ?? []) summary[r.kind] = (summary[r.kind] ?? 0) + 1;

    return {
      rows: (rows ?? []).map((r) => ({
        id: r.id,
        kind: r.kind,
        severity: r.severity,
        route: r.route,
        message: r.message,
        statusCode: r.status_code,
        durationMs: r.duration_ms,
        createdAt: r.created_at,
        metadata: r.metadata,
      })),
      summary,
      sinceIso,
    };
  });

export const triggerProbe = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const res = await fetch("https://coachface.com/api/public/monitoring/probe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    return { ok: res.ok, status: res.status };
  });

export const triggerAlertSweep = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const res = await fetch("https://coachface.com/api/public/monitoring/alert-sweep", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    const body = await res.text();
    return { ok: res.ok, status: res.status, body: body.slice(0, 500) };
  });
