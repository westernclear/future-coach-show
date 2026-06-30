import { createServerFn } from "@tanstack/react-start";
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function hashCode(code: string): string {
  const salt = process.env.SITE_GATE_SESSION_SECRET ?? "";
  return createHash("sha256").update(`${salt}::${code.trim()}`, "utf8").digest("hex");
}

function generateCode(): string {
  // 10 char base32-ish, no ambiguous chars
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const buf = randomBytes(10);
  let out = "";
  for (let i = 0; i < 10; i++) out += alphabet[buf[i]! % alphabet.length];
  return out;
}

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data: roles } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId);
  const isAdmin = roles?.some((r: { role: string }) => r.role === "admin") ?? false;
  if (!isAdmin) throw new Error("Forbidden");
}

export const listAccessCodes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("site_access_codes")
      .select("id, label, note, max_uses, uses, expires_at, active, created_at, last_used_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return { codes: data ?? [] };
  });

const createSchema = z.object({
  label: z.string().trim().min(1).max(80),
  note: z.string().trim().max(280).optional().nullable(),
  maxUses: z.number().int().min(1).max(100000).nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

export const createAccessCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => createSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const code = generateCode();
    const code_hash = hashCode(code);
    const { error } = await context.supabase.from("site_access_codes").insert({
      code_hash,
      label: data.label,
      note: data.note ?? null,
      max_uses: data.maxUses ?? null,
      expires_at: data.expiresAt ?? null,
      created_by: context.userId,
      active: true,
    });
    if (error) throw error;
    // Plaintext returned ONCE; never stored.
    return { code };
  });

export const setAccessCodeActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid(), active: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("site_access_codes")
      .update({ active: data.active })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true as const };
  });

export const deleteAccessCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("site_access_codes")
      .delete()
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true as const };
  });
