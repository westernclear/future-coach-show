import { test, expect, request as pwRequest } from "@playwright/test";

// Production host: gate MUST redirect anonymous visitors to /unlock.
// Preview host: gate MUST bypass via isPreviewOrLocalHost() in site_gate.functions.ts.
const PROD_URL = process.env.GATE_PROD_URL ?? "https://coachface.com";
const PREVIEW_URL =
  process.env.GATE_PREVIEW_URL ??
  "https://id-preview--05cbd7a7-84ea-478e-af54-13e485221a1a.lovable.app";

test.describe("site access-code gate", () => {
  test("production redirects anonymous visitors to /unlock", async () => {
    const ctx = await pwRequest.newContext({ ignoreHTTPSErrors: true });
    const res = await ctx.get(`${PROD_URL}/`, { maxRedirects: 0 });
    expect(res.status(), "expected 3xx redirect from production root").toBeGreaterThanOrEqual(300);
    expect(res.status()).toBeLessThan(400);
    const location = res.headers()["location"] ?? "";
    expect(location, "expected redirect to /unlock").toContain("/unlock");
    await ctx.dispose();
  });

  test("production /unlock serves the access-code page", async () => {
    const ctx = await pwRequest.newContext({ ignoreHTTPSErrors: true });
    const res = await ctx.get(`${PROD_URL}/unlock`);
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html.toLowerCase()).toContain("access code");
    await ctx.dispose();
  });

  test("preview host bypasses the gate and serves the app", async () => {
    const ctx = await pwRequest.newContext({ ignoreHTTPSErrors: true });
    // Follow Lovable auth-bridge redirects, but verify final URL is NOT /unlock.
    const res = await ctx.get(`${PREVIEW_URL}/`);
    expect(res.status()).toBe(200);
    expect(res.url(), "preview must not redirect to /unlock").not.toContain("/unlock");
    await ctx.dispose();
  });
});
