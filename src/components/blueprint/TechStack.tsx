import { SectionTitle, Table, Tag } from "./shared";

const rows = [
  ["Frontend Framework", "TanStack Start (existing)", "SSR, file-based routing, server functions", <Tag variant="green">Keep</Tag>],
  ["UI Components", "Radix UI + shadcn/ui + Tailwind v4 (existing)", "Accessible, themeable, zero lock-in", <Tag variant="green">Keep</Tag>],
  ["State / Data Fetching", "TanStack Query v5 (existing)", "Cache, dedup, background refetch", <Tag variant="green">Keep</Tag>],
  ["Database", "Supabase Postgres (existing)", "Relational, RLS, extensions (pg_vector, pg_cron)", <Tag variant="green">Keep</Tag>],
  ["Auth", "Supabase Auth", "Magic link, OAuth (Google/Apple), JWT + RLS integration", <Tag variant="blue">Add Phase 1</Tag>],
  ["Realtime", "Supabase Realtime", "WebSocket channels, Postgres CDC fan-out", <Tag variant="blue">Add Phase 2</Tag>],
  ["Background Jobs", "Inngest (self-hostable)", "Event-driven, retries, observability built-in", <Tag variant="blue">Add Phase 2</Tag>],
  ["Edge Functions", "Supabase Edge Functions (Deno)", "Low-latency compute: score webhooks, ingestion", <Tag variant="blue">Add Phase 2</Tag>],
  ["Cache", "Upstash Redis", "Leaderboard snapshots, rate-limit counters, session store", <Tag variant="blue">Add Phase 2</Tag>],
  ["Search", "Supabase pg_vector + tsvector", "Full-text + semantic coach search", <Tag variant="orange">Add Phase 3</Tag>],
  ["AI / Recaps", "OpenAI GPT-4o via Supabase Edge Function", "Weekly AI recap generation per user roster", <Tag variant="orange">Add Phase 3</Tag>],
  ["Media / Uploads", "Supabase Storage + Cloudflare Images", "Coach headshots, editorial thumbnails", <Tag variant="blue">Add Phase 2</Tag>],
  ["CDN", "Cloudflare (free tier → Pro)", "Static asset caching, DDoS protection", <Tag variant="blue">Add Phase 2</Tag>],
  ["Email", "Resend (Supabase SMTP-compatible)", "Transactional: roster lock confirmations, results", <Tag variant="blue">Add Phase 2</Tag>],
  ["Monitoring", "Sentry + Supabase Logs + Grafana Cloud", "Error tracking, query perf, infra metrics", <Tag variant="orange">Add Phase 3</Tag>],
  ["Analytics", "PostHog (self-hosted optional)", "Product analytics, funnel analysis, feature flags", <Tag variant="orange">Add Phase 3</Tag>],
  ["Licensed Sports Data", "Sportradar Essential tier (or Stats Perform)", "Game events, box scores, win/loss, real coaches", <Tag variant="red">Add Phase 2</Tag>],
  ["CI/CD", "GitHub Actions → Lovable / Fly.io deploy", "Preview deploys, migration checks, test gate", <Tag variant="blue">Add Phase 1</Tag>],
];

export function TechStack() {
  return (
    <div>
      <SectionTitle
        eyebrow="Section 2 · Technology Choices"
        title="Tech Stack"
        sub="Choices are deliberately Supabase-centric to maximise velocity and keep the team on a single control plane through Phase 3. External services are additive, never replacing the core stack."
      />
      <Table
        headers={["Concern", "Technology", "Rationale", "Timeline"]}
        rows={rows}
      />
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-green-700 dark:text-green-400 mb-1">Existing — Keep</p>
          <p className="text-sm text-muted-foreground">TanStack Start, Supabase Postgres, Radix UI, TanStack Query, Tailwind v4. Production-ready as-is.</p>
        </div>
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">Phase 1–2 Additions</p>
          <p className="text-sm text-muted-foreground">Auth, Realtime, Edge Functions, Redis, Storage, CI/CD, licensed feed adapter, email.</p>
        </div>
        <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400 mb-1">Phase 3+ Additions</p>
          <p className="text-sm text-muted-foreground">Vector search, AI recaps, Grafana observability stack, PostHog analytics, Cloudflare Pro CDN.</p>
        </div>
      </div>
    </div>
  );
}
