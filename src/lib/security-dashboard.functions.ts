import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const updateFindingSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["open", "in_progress", "resolved", "accepted_risk"]),
  owner: z.string().trim().max(120),
});

async function requireAdmin(context: {
  supabase: Parameters<Parameters<typeof requireSupabaseAuth>["options"]["server"]>[0] extends never
    ? never
    : any;
  userId: string;
}) {
  const { data: role } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!role) throw new Error("Administrator access is required.");
}

export const getSecurityDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const [findingsResult, runsResult] = await Promise.all([
      context.supabase
        .from("security_findings")
        .select("*")
        .order("last_detected_at", { ascending: false }),
      context.supabase
        .from("security_scan_runs")
        .select("*")
        .order("scanned_at", { ascending: true }),
    ]);
    if (findingsResult.error || runsResult.error)
      throw new Error("Security scan data could not be loaded.");
    return { findings: findingsResult.data ?? [], runs: runsResult.data ?? [] };
  });

export const updateSecurityFinding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => updateFindingSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const resolvedAt = data.status === "resolved" ? new Date().toISOString() : null;
    const { error } = await context.supabase
      .from("security_findings")
      .update({ owner: data.owner || null, status: data.status, resolved_at: resolvedAt })
      .eq("id", data.id);
    if (error) throw new Error("The finding could not be updated.");
    return { ok: true };
  });