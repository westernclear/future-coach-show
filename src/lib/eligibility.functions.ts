import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- Types ----------
export type ContestKind = "free" | "paid" | "dfs" | "season_long";

export interface JurisdictionRule {
  id: string;
  country_code: string;
  region_code: string | null;
  jurisdiction_name: string;
  free_play_allowed: boolean;
  paid_contests_allowed: boolean;
  dfs_allowed: boolean;
  season_long_allowed: boolean;
  min_age: number;
  notes: string | null;
  active: boolean;
}

export interface EligibilityRecord {
  user_id: string;
  attested_country_code: string;
  attested_region_code: string | null;
  date_of_birth: string;
  free_play_eligible: boolean;
  paid_play_eligible: boolean;
  last_ip_country: string | null;
  last_ip_region: string | null;
  last_checked_at: string;
}

// ---------- Helpers ----------
function ageFromDOB(dob: string): number {
  const birth = new Date(dob + "T00:00:00Z");
  const now = new Date();
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const m = now.getUTCMonth() - birth.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < birth.getUTCDate())) age--;
  return age;
}

function getIpGeoFromRequest(): { country: string | null; region: string | null } {
  try {
    const req = getRequest();
    const h = req.headers;
    return {
      country: h.get("cf-ipcountry") ?? h.get("x-vercel-ip-country") ?? null,
      region: h.get("cf-region-code") ?? h.get("x-vercel-ip-country-region") ?? null,
    };
  } catch {
    return { country: null, region: null };
  }
}

async function resolveRule(
  supabase: any,
  countryCode: string,
  regionCode: string | null,
): Promise<JurisdictionRule | null> {
  // Try region-specific first, then country-wide
  if (regionCode) {
    const { data } = await supabase
      .from("jurisdiction_rules")
      .select("*")
      .eq("country_code", countryCode)
      .eq("region_code", regionCode)
      .eq("active", true)
      .maybeSingle();
    if (data) return data as JurisdictionRule;
  }
  const { data: country } = await supabase
    .from("jurisdiction_rules")
    .select("*")
    .eq("country_code", countryCode)
    .is("region_code", null)
    .eq("active", true)
    .maybeSingle();
  return (country as JurisdictionRule | null) ?? null;
}

// ---------- Read: get current user's eligibility + IP geo ----------
export const getMyEligibility = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_eligibility")
      .select("*")
      .eq("user_id", context.userId)
      .maybeSingle();
    const ip = getIpGeoFromRequest();
    return {
      eligibility: (data as EligibilityRecord | null) ?? null,
      ipCountry: ip.country,
      ipRegion: ip.region,
    };
  });

// ---------- Read: list active jurisdiction rules ----------
export const listJurisdictionRules = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("jurisdiction_rules")
      .select("*")
      .order("country_code", { ascending: true })
      .order("region_code", { ascending: true, nullsFirst: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as JurisdictionRule[];
  });

// ---------- Write: user self-attest country/state/DOB ----------
const attestSchema = z.object({
  countryCode: z.string().trim().length(2).toUpperCase(),
  regionCode: z.string().trim().max(5).optional().nullable(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  acceptTerms: z.literal(true),
  acceptResponsiblePlay: z.literal(true),
});

export const attestEligibility = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => attestSchema.parse(input))
  .handler(async ({ data, context }) => {
    const country = data.countryCode.toUpperCase();
    const region = data.regionCode ? data.regionCode.toUpperCase() : null;
    const age = ageFromDOB(data.dateOfBirth);

    if (age < 18) {
      await context.supabase.from("geo_block_log").insert({
        user_id: context.userId,
        attested_country: country,
        attested_region: region,
        action: "age_blocked",
        reason: `User under 18 (age ${age})`,
        context: { age, dob: data.dateOfBirth },
      });
      throw new Error(
        "You must be at least 18 years old to use CoachFace.",
      );
    }

    const rule = await resolveRule(context.supabase, country, region);
    const ip = getIpGeoFromRequest();

    const freeOk = rule ? rule.free_play_allowed : true;
    const paidOk = rule
      ? rule.paid_contests_allowed && age >= rule.min_age
      : age >= 18;

    // Mismatch flag (don't block, just log)
    if (
      ip.country &&
      ip.country.toUpperCase() !== country &&
      ip.country.toUpperCase() !== "XX"
    ) {
      await context.supabase.from("geo_block_log").insert({
        user_id: context.userId,
        attested_country: country,
        attested_region: region,
        ip_country: ip.country,
        ip_region: ip.region,
        action: "flagged_mismatch",
        reason: "Attested country differs from detected IP country",
        context: { age },
      });
    }

    const payload = {
      user_id: context.userId,
      attested_country_code: country,
      attested_region_code: region,
      date_of_birth: data.dateOfBirth,
      age_confirmed_at: new Date().toISOString(),
      terms_accepted_at: new Date().toISOString(),
      responsible_play_accepted_at: new Date().toISOString(),
      free_play_eligible: freeOk,
      paid_play_eligible: paidOk,
      last_checked_at: new Date().toISOString(),
      last_ip_country: ip.country,
      last_ip_region: ip.region,
    };

    const { error } = await context.supabase
      .from("user_eligibility")
      .upsert(payload, { onConflict: "user_id" });
    if (error) throw new Error(error.message);

    return {
      ok: true,
      free_play_eligible: freeOk,
      paid_play_eligible: paidOk,
      rule_name: rule?.jurisdiction_name ?? `${country}`,
      min_age: rule?.min_age ?? 18,
      age,
    };
  });

// ---------- Server-side gate: check a specific contest type ----------
const checkSchema = z.object({
  contestType: z.enum(["free", "paid", "dfs", "season_long"]),
});

export const checkContestEligibility = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => checkSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: elig } = await context.supabase
      .from("user_eligibility")
      .select("*")
      .eq("user_id", context.userId)
      .maybeSingle();

    const ip = getIpGeoFromRequest();

    if (!elig) {
      return {
        allowed: data.contestType === "free", // free play is open even pre-attestation? No: require attest.
        eligible: false,
        reason: "no_attestation",
        message: "Confirm your age and location before playing.",
        ipCountry: ip.country,
        ipRegion: ip.region,
      };
    }

    const rule = await resolveRule(
      context.supabase,
      (elig as EligibilityRecord).attested_country_code,
      (elig as EligibilityRecord).attested_region_code,
    );

    // IP cross-check: if IP country differs from attested country, block paid
    const ipCountry = ip.country ? ip.country.toUpperCase() : null;
    const attestedCountry = (elig as EligibilityRecord).attested_country_code;
    const ipMismatch = !!ipCountry && ipCountry !== attestedCountry;

    let allowed = false;
    let reason = "ok";

    if (data.contestType === "free") {
      allowed = rule ? rule.free_play_allowed : true;
      if (!allowed) reason = "free_blocked_in_region";
    } else {
      // paid/dfs/season_long
      const paidOk = rule ? rule.paid_contests_allowed : true;
      const dfsOk = rule ? rule.dfs_allowed : true;
      const seasonOk = rule ? rule.season_long_allowed : true;
      const ageOk = (elig as EligibilityRecord).paid_play_eligible;
      const typeOk =
        data.contestType === "paid"
          ? paidOk
          : data.contestType === "dfs"
            ? dfsOk
            : seasonOk;

      if (!ageOk) {
        allowed = false;
        reason = "underage_for_paid";
      } else if (!typeOk) {
        allowed = false;
        reason = "blocked_in_region";
      } else if (ipMismatch) {
        allowed = false;
        reason = "ip_country_mismatch";
      } else if (ipCountry) {
        // Check IP-side region too
        const ipRule = await resolveRule(
          context.supabase,
          ipCountry,
          ip.region ? ip.region.toUpperCase() : null,
        );
        const ipAllows = ipRule
          ? data.contestType === "dfs"
            ? ipRule.dfs_allowed
            : data.contestType === "season_long"
              ? ipRule.season_long_allowed
              : ipRule.paid_contests_allowed
          : true;
        if (!ipAllows) {
          allowed = false;
          reason = "ip_region_blocked";
        } else {
          allowed = true;
        }
      } else {
        allowed = true;
      }
    }

    if (!allowed) {
      await context.supabase.from("geo_block_log").insert({
        user_id: context.userId,
        attested_country: attestedCountry,
        attested_region: (elig as EligibilityRecord).attested_region_code,
        ip_country: ipCountry,
        ip_region: ip.region,
        contest_type: data.contestType,
        action: "blocked",
        reason,
        context: { rule_name: rule?.jurisdiction_name ?? null },
      });
    }

    return {
      allowed,
      eligible: true,
      reason,
      message:
        reason === "ok"
          ? "Eligible"
          : reason === "underage_for_paid"
            ? `Minimum age for paid contests in your region is ${rule?.min_age ?? 18}.`
            : reason === "blocked_in_region"
              ? `Paid contests are not permitted in ${rule?.jurisdiction_name ?? attestedCountry}.`
              : reason === "ip_country_mismatch"
                ? "Your current IP location does not match your registered country. Paid contests are blocked while traveling outside your home country."
                : reason === "ip_region_blocked"
                  ? "Paid contests are not permitted from your current location."
                  : "Not eligible.",
      ipCountry,
      ipRegion: ip.region,
      ruleName: rule?.jurisdiction_name ?? null,
      minAge: rule?.min_age ?? 18,
    };
  });

// ---------- Admin: upsert jurisdiction rule ----------
const ruleSchema = z.object({
  id: z.string().uuid().optional(),
  country_code: z.string().length(2).toUpperCase(),
  region_code: z.string().max(5).optional().nullable(),
  jurisdiction_name: z.string().min(1).max(120),
  free_play_allowed: z.boolean(),
  paid_contests_allowed: z.boolean(),
  dfs_allowed: z.boolean(),
  season_long_allowed: z.boolean(),
  min_age: z.number().int().min(13).max(99),
  notes: z.string().max(500).optional().nullable(),
  active: z.boolean(),
});

async function ensureAdmin(supabase: any, userId: string) {
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (!roles?.some((r: any) => r.role === "admin")) {
    throw new Error("Forbidden");
  }
}

export const saveJurisdictionRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => ruleSchema.parse(input))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const row = {
      ...data,
      region_code: data.region_code || null,
      notes: data.notes ?? null,
    };
    if (data.id) {
      const { error } = await supabaseAdmin
        .from("jurisdiction_rules")
        .update(row)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("jurisdiction_rules")
        .upsert(row, { onConflict: "country_code,region_code" });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// ---------- Admin: list geo-block log ----------
const blockListSchema = z.object({
  reason: z.string().optional(),
  action: z.string().optional(),
  userId: z.string().uuid().optional(),
  timeRange: z.enum(["24h", "7d", "30d", "all"]).default("30d"),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(50),
});

export const listGeoBlocks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => blockListSchema.parse(input))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    let q = supabaseAdmin
      .from("geo_block_log")
      .select("*", { count: "exact" });

    if (data.reason) q = q.eq("reason", data.reason);
    if (data.action) q = q.eq("action", data.action);
    if (data.userId) q = q.eq("user_id", data.userId);
    const now = Date.now();
    if (data.timeRange === "24h")
      q = q.gte("created_at", new Date(now - 86400000).toISOString());
    else if (data.timeRange === "7d")
      q = q.gte("created_at", new Date(now - 7 * 86400000).toISOString());
    else if (data.timeRange === "30d")
      q = q.gte("created_at", new Date(now - 30 * 86400000).toISOString());

    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;
    const { data: rows, count, error } = await q
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw new Error(error.message);
    return {
      rows: rows ?? [],
      count: count ?? 0,
      page: data.page,
      pageSize: data.pageSize,
    };
  });
