import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, setResponseHeader, useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

function hashWithSalt(code: string): string {
  const salt = process.env.SITE_GATE_SESSION_SECRET ?? "";
  return createHash("sha256").update(`${salt}::${code.trim()}`, "utf8").digest("hex");
}

type GateSession = { unlocked?: boolean };

const PREVIEW_HOSTS = ["lovableproject.com", "lovableproject-dev.com", "beta.lovable.dev"];

function isPreviewOrLocalHost(host: string | null | undefined) {
  const hostname = (host ?? "").split(":")[0]?.toLowerCase() ?? "";
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("id-preview--") ||
    hostname.startsWith("preview--") ||
    PREVIEW_HOSTS.some((previewHost) =>
      hostname === previewHost || hostname.endsWith(`.${previewHost}`),
    )
  );
}

function getSessionConfig() {
  const password = process.env.SITE_GATE_SESSION_SECRET;
  if (!password) throw new Error("SITE_GATE_SESSION_SECRET is not set");
  return {
    password,
    name: "coachface-gate",
    maxAge: 60 * 60 * 24 * 365,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

function passwordMatches(input: string, expected: string): boolean {
  const a = createHash("sha256").update(input.trim(), "utf8").digest();
  const b = createHash("sha256").update(expected.trim(), "utf8").digest();
  return timingSafeEqual(a, b);
}

function anyHostIsPreview() {
  const candidates = [
    getRequestHeader("x-forwarded-host"),
    getRequestHeader("x-original-host"),
    getRequestHeader("host"),
    getRequestHeader("referer"),
    getRequestHeader("origin"),
  ];
  for (const raw of candidates) {
    if (!raw) continue;
    try {
      const host = raw.includes("://") ? new URL(raw).host : raw;
      if (isPreviewOrLocalHost(host)) return true;
    } catch {
      if (isPreviewOrLocalHost(raw)) return true;
    }
  }
  return false;
}

export const getGateStatus = createServerFn({ method: "GET" }).handler(async () => {
  setResponseHeader("cache-control", "no-store, no-cache, max-age=0, must-revalidate");
  setResponseHeader("pragma", "no-cache");
  setResponseHeader("expires", "0");
  if (anyHostIsPreview()) {
    return { unlocked: true, previewBypass: true };
  }
  const session = await useSession<GateSession>(getSessionConfig());
  return { unlocked: Boolean(session.data.unlocked), previewBypass: false };
});

export const unlockSite = createServerFn({ method: "POST" })
  .inputValidator((data: { code: string }) => {
    if (typeof data?.code !== "string" || data.code.length === 0 || data.code.length > 200) {
      throw new Error("Invalid code");
    }
    return { code: data.code };
  })
  .handler(async ({ data }) => {
    setResponseHeader("cache-control", "no-store, no-cache, max-age=0, must-revalidate");
    setResponseHeader("pragma", "no-cache");
    setResponseHeader("expires", "0");

    let granted = false;

    // 1) Legacy env-var master code
    const expected = process.env.SITE_ACCESS_CODE;
    if (expected && passwordMatches(data.code, expected)) {
      granted = true;
    }

    // 2) Admin-issued codes from DB
    if (!granted) {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const code_hash = hashWithSalt(data.code);
        const { data: row } = await supabaseAdmin
          .from("site_access_codes")
          .select("id, active, expires_at, max_uses, uses")
          .eq("code_hash", code_hash)
          .maybeSingle();
        if (row && row.active) {
          const notExpired = !row.expires_at || new Date(row.expires_at) > new Date();
          const underLimit = row.max_uses == null || row.uses < row.max_uses;
          if (notExpired && underLimit) {
            granted = true;
            await supabaseAdmin
              .from("site_access_codes")
              .update({ uses: row.uses + 1, last_used_at: new Date().toISOString() })
              .eq("id", row.id);
          }
        }
      } catch (err) {
        console.error("[site_gate] db code lookup failed", err);
      }
    }

    if (!granted) return { ok: false as const };

    const session = await useSession<GateSession>(getSessionConfig());
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const lockSite = createServerFn({ method: "POST" }).handler(async () => {
  setResponseHeader("cache-control", "no-store, no-cache, max-age=0, must-revalidate");
  setResponseHeader("pragma", "no-cache");
  setResponseHeader("expires", "0");
  const session = await useSession<GateSession>(getSessionConfig());
  await session.clear();
  return { ok: true as const };
});
