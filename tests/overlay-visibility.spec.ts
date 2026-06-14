import { expect, test, type Locator, type Page } from "@playwright/test";

const routes = [
  "/",
  "/auth",
  "/blueprint",
  "/fair-play",
  "/fifa-special",
  "/game-rules",
  "/play",
  "/privacy",
  "/rankings",
  "/rewards",
  "/scoring",
  "/terms",
  "/the-show",
  "/dashboard",
  "/onboarding",
  "/profile",
  "/security",
  "/admin/audits",
] as const;

const badgeSelectors = [
  '[id*="lovable" i]',
  '[class*="lovable" i]',
  '[data-testid*="lovable" i]',
  '[aria-label*="lovable" i]',
  'a[href*="lovable.dev" i]',
  'a[href*="lovable.app" i]',
].join(",");

async function visibleElements(locator: Locator) {
  return locator.evaluateAll((elements) =>
    elements
      .filter((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          Number(style.opacity) > 0 &&
          rect.width > 0 &&
          rect.height > 0
        );
      })
      .map((element) => element.outerHTML.slice(0, 300)),
  );
}

async function auditPage(page: Page, route: string) {
  await page.goto(route, { waitUntil: "networkidle" });

  const layout = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    pageWidth: document.documentElement.scrollWidth,
  }));
  expect(layout.pageWidth, `Horizontal overflow on ${route}`).toBeLessThanOrEqual(
    layout.viewportWidth + 1,
  );

  await expect(page.getByText(/edit with lovable/i)).toHaveCount(0);
  expect(await visibleElements(page.locator(badgeSelectors))).toEqual([]);

  const unexpectedFixedOverlays = await page.locator("body *").evaluateAll((elements) =>
    elements
      .filter((element) => {
        if (element.closest('[data-overlay-allowed="true"]')) return false;
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return (
          style.position === "fixed" &&
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          Number(style.opacity) > 0 &&
          rect.width > 0 &&
          rect.height > 0
        );
      })
      .map((element) => element.outerHTML.slice(0, 300)),
  );

  expect(unexpectedFixedOverlays, `Unexpected fixed overlay on ${route}`).toEqual([]);
}

for (const route of routes) {
  test(`${route} has no badge or unexpected overlay`, async ({ page }) => {
    await auditPage(page, route);
  });
}