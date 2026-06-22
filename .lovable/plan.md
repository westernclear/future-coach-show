## Goal
Produce a standalone Theory of Operations document for the CoachFace engineering team, covering how the system runs, how it is secured, and how it is maintained.

## Deliverable
A single professional document (DOCX) stored under `/mnt/documents/` and presented as a downloadable artifact. The document will be written in plain language suitable for both frontend engineers and backend developers.

## Structure
1. **Executive Summary** — one-page snapshot of CoachFace, its stage, and why this document exists.
2. **System Purpose & Scope** — what CoachFace does (multi-sport fantasy coach game), primary user flows, and bounded context.
3. **Architecture Overview** — the seven horizontal layers (Edge/CDN, Presentation, API Gateway, Core Services, Data Platform, External Feeds, Async Processing) with a concise diagram description.
4. **Technology Stack** — canonical stack table: TanStack Start, React 19, Tailwind v4, Radix/shadcn, Supabase Postgres, Supabase Auth/RLS/Realtime, TanStack Query, with notes on what is live today versus phased additions.
5. **Data Model** — schema summary of every public table, its purpose, key relationships, and RLS posture. Includes critical constraints (e.g., contest entry eligibility tied to identity verification).
6. **Security & Access Control** — authentication flow (Supabase Auth, Google OAuth via Lovable broker), role model (admin, editor, scoring_analyst, user), RLS policy strategy, service-role vs. user-scoped access, and the security-dashboard workflow.
7. **Server Runtime & API** — TanStack Start server functions, middleware chain (error handling, auth attacher), public API endpoint rules (`/api/public/*`), and the SSR/edge runtime constraints (Cloudflare Workers / stateless).
8. **Monitoring & Observability** — monitoring events table, probe/alert-sweep endpoints, error capture pipeline, and how the security scanner findings are tracked and remediated.
9. **Operational Procedures** — how to read logs, how alerts are triggered, how to respond to a security finding, and how to run a database migration.
10. **Deployment & Environments** — preview URL, published URL, custom domain, build commands, and environment-variable classification (client vs. server secrets).
11. **Known Constraints & Risks** — Worker runtime limits (no child_process, no sharp), RLS-first design implications, and current external dependencies.
12. **Roadmap Context** — summary of Phase 1–3 additions from the architecture blueprint so engineers understand what is coming.

## Process
- I will synthesize the existing codebase, migrations, and blueprint into the document.
- No source code changes are required.
- Once approved, I will generate the DOCX and present it as an artifact.