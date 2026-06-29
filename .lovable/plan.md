# Access Code Gate (Site-wide)

A single shared access code blocks the entire CoachFace site. Visitors who haven't entered the code are redirected to `/unlock`. Once entered, they stay unlocked indefinitely (1 year cookie, refreshed on each visit, "until further notice").

## How it works

1. Two server-only secrets are stored: `SITE_ACCESS_CODE` (the code Isaac sets) and `SITE_GATE_SESSION_SECRET` (auto-generated, encrypts the cookie).
2. A server function `unlockSite` compares the submitted code to `SITE_ACCESS_CODE` using a timing-safe check. On success it sets an encrypted session cookie (`coachface-gate`) flagged `unlocked: true` for 365 days.
3. A request-level middleware runs on every server request. If the path is anything other than `/unlock`, `/api/public/*`, or static assets and the session is not unlocked, it redirects to `/unlock`.
4. The root route's `beforeLoad` also checks the session for SSR/client navigations and redirects unauthenticated visitors to `/unlock`, preserving the original URL via `?redirect=`.
5. `/unlock` route renders a branded CoachFace lock screen with a single password input. On success it navigates to the original target (or `/`).

## Files to add

- `src/lib/site-gate.functions.ts` — `unlockSite`, `lockSite`, `getGateStatus` server functions + shared session config helper.
- `src/lib/site-gate.server.ts` — server-only helpers (timing-safe compare, `requireUnlocked`, session config).
- `src/routes/unlock.tsx` — the lock screen UI (CoachFace branding, matches `auth.tsx` styling).
- Root `beforeLoad` guard added to `src/routes/__root.tsx` (skips `/unlock` and `/api/public/*`).

## Files to modify

- `src/routes/__root.tsx` — add `beforeLoad` that calls `getGateStatus` and throws `redirect({ to: "/unlock", search: { redirect: location.pathname } })` when locked, unless path is exempt.
- `src/start.ts` — append a request middleware that enforces the gate at the server boundary (defense in depth for direct route hits and API calls).

## Exemptions

- `/unlock` (the form itself)
- `/api/public/*` (webhooks, monitoring probes, cron)
- Static assets (`/manifest.webmanifest`, icons, `/_build/*`) handled by middleware path checks

`/auth` and all other routes are gated, per your "Entire site" choice.

## Secrets

- `SITE_ACCESS_CODE` — I'll request this from you via the secure secret form (you type the code you want visitors to use).
- `SITE_GATE_SESSION_SECRET` — auto-generated (64 chars), used only to encrypt the gate cookie.

## Unlock duration

365-day cookie, refreshed on every request while unlocked. To revoke access later, rotate `SITE_ACCESS_CODE` (everyone re-enters) or change `SITE_GATE_SESSION_SECRET` (invalidates all existing cookies instantly).

## Out of scope

- No per-user codes, no usage tracking, no rate limiting on the unlock form (can add later if you want).
- Existing Supabase auth (`/auth`, dashboard) keeps working unchanged behind the gate.
