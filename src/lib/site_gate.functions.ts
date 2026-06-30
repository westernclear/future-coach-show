import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, setResponseHeader, useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

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

export const getGateStatus = createServerFn({ method: "GET" }).handler(async () => {
  setResponseHeader("cache-control", "no-store, no-cache, max-age=0, must-revalidate");
  setResponseHeader("pragma", "no-cache");
  setResponseHeader("expires", "0");
  if (isPreviewOrLocalHost(getRequestHeader("host"))) {
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
    const expected = process.env.SITE_ACCESS_CODE;
    if (!expected) throw new Error("SITE_ACCESS_CODE is not set");
    if (!passwordMatches(data.code, expected)) {
      return { ok: false as const };
    }
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
