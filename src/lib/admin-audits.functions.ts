import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const reasonCodes = [
  "invalid_type",
  "type_mismatch",
  "oversized_bytes",
  "oversized_pixels",
  "invalid_dimensions",
  "decode_timeout",
  "decode_failed",
  "too_blurry",
] as const;

const listAuditsSchema = z.object({
  reason: z.string().optional(),
  userId: z.string().uuid().optional(),
  timeRange: z.enum(["24h", "7d", "30d", "all", "custom"]).default("all"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(50),
});

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: roles } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    return (roles?.some((r) => r.role === "admin") ?? false);
  });

export const getUploadRejectionAudits = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => listAuditsSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: roles } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const isAdmin = roles?.some((r) => r.role === "admin") ?? false;
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let query = supabaseAdmin
      .from("profile_upload_rejections")
      .select("*", { count: "exact" });

    if (data.reason && reasonCodes.includes(data.reason as (typeof reasonCodes)[number])) {
      query = query.eq("reason_code", data.reason);
    }
    if (data.userId) {
      query = query.eq("user_id", data.userId);
    }

    const now = new Date();
    if (data.timeRange === "24h") {
      const since = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      query = query.gte("created_at", since);
    } else if (data.timeRange === "7d") {
      const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte("created_at", since);
    } else if (data.timeRange === "30d") {
      const since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte("created_at", since);
    } else if (data.timeRange === "custom" && data.startDate && data.endDate) {
      const startIso = new Date(data.startDate + "T00:00:00.000Z").toISOString();
      const endIso = new Date(data.endDate + "T23:59:59.999Z").toISOString();
      query = query.gte("created_at", startIso).lte("created_at", endIso);
    }

    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;

    const { data: rows, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Admin audit query failed", error);
      throw new Error("Failed to load audit data.");
    }

    const userIds = [...new Set((rows ?? []).map((r) => r.user_id))];
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, username, display_name")
      .in("id", userIds);

    const profileMap = new Map(
      (profiles ?? []).map((p) => [p.id, p as { username: string | null; display_name: string | null }]),
    );

    return {
      rows: (rows ?? []).map((r) => {
        const profile = profileMap.get(r.user_id);
        return {
          id: r.id,
          userId: r.user_id,
          reasonCode: r.reason_code,
          claimedType: r.claimed_type,
          detectedType: r.detected_type,
          byteSize: r.byte_size,
          width: r.width,
          height: r.height,
          validationDurationMs: r.validation_duration_ms,
          createdAt: r.created_at,
          username: profile?.username ?? null,
          displayName: profile?.display_name ?? null,
        };
      }),
      count: count ?? 0,
      page: data.page,
      pageSize: data.pageSize,
    };
  });
