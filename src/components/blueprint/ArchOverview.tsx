import { SectionTitle, Card, Tag } from "./shared";

const layers = [
  {
    name: "Edge / CDN",
    color: "bg-blue-500/10 border-blue-500/30",
    items: ["Cloudflare CDN (static assets)", "Cloudflare Workers (edge auth tokens, geo-routing)", "Image optimization pipeline"],
  },
  {
    name: "Presentation Layer",
    color: "bg-purple-500/10 border-purple-500/30",
    items: ["TanStack Start SSR (existing)", "Public Coach Rankings", "Fantasy Game UI", "User Profile & Roster", "Admin + Editorial CMS"],
  },
  {
    name: "API Gateway",
    color: "bg-orange-500/10 border-orange-500/30",
    items: ["TanStack Start server functions", "Supabase Edge Functions (isolated compute)", "Rate limiting & abuse prevention", "API versioning headers"],
  },
  {
    name: "Core Services (Supabase + Workers)",
    color: "bg-green-500/10 border-green-500/30",
    items: [
      "Auth Service (Supabase Auth + RLS)",
      "Coach Data Service",
      "Scoring Engine Worker",
      "Fantasy Roster Service",
      "Event Ingestion Worker",
      "Editorial Review Service",
      "Admin Override Service",
      "Notification / Pub-Sub",
    ],
  },
  {
    name: "Data Platform",
    color: "bg-yellow-500/10 border-yellow-500/30",
    items: [
      "Supabase Postgres (primary store)",
      "Supabase Realtime (WebSocket fan-out)",
      "Supabase Storage (media, exports)",
      "Redis / Upstash (score cache, locks)",
      "pg_vector (coach embeddings for search)",
    ],
  },
  {
    name: "External Data Feeds",
    color: "bg-red-500/10 border-red-500/30",
    items: [
      "Sports Data Provider (Sportradar / Stats Perform)",
      "NFL Official Stats API",
      "MLB Stats API (free)",
      "NBA Stats API",
      "Opta / WhoScored (Soccer)",
      "Webhook fallback: manual CSV import",
    ],
  },
  {
    name: "Async Processing",
    color: "bg-slate-500/10 border-slate-500/30",
    items: [
      "Supabase pg_cron (scheduled score recalcs)",
      "Inngest / Trigger.dev (event-driven jobs)",
      "Background: roster lock enforcement",
      "Background: leaderboard aggregation",
      "Background: AI recap generation (OpenAI)",
    ],
  },
];

const principles = [
  { label: "Supabase-first", desc: "Auth, Postgres, Realtime, Storage, and Edge Functions from one platform minimises infra ops in phases 1–3." },
  { label: "Event-sourced scoring", desc: "Every score mutation is an immutable event row, enabling full replay, versioning, and audit." },
  { label: "RLS at the database", desc: "Row-Level Security enforces multi-tenancy and privacy without application-layer enforcement gaps." },
  { label: "Sports-agnostic schema", desc: "A single sport-scoped entity model covers all four leagues; new sports add config, not migrations." },
  { label: "Explainability by default", desc: "Score events store human-readable reason + algorithm version; no black-box points." },
  { label: "Edge-first delivery", desc: "Leaderboard snapshots pre-computed to Redis every 60 s; WebSocket pushes diffs only." },
];

export function ArchOverview() {
  return (
    <div>
      <SectionTitle
        eyebrow="Section 1 · System Overview"
        title="Architecture at a Glance"
        sub="CoachFace is structured as seven horizontal layers, each with clearly bounded responsibilities. The existing TanStack Start + Supabase prototype sits in the Presentation and Core Services layers; everything below and around it is new build."
      />

      <div className="space-y-3 mb-10">
        {layers.map((layer) => (
          <div key={layer.name} className={`rounded-lg border p-4 ${layer.color}`}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2">{layer.name}</p>
            <div className="flex flex-wrap gap-2">
              {layer.items.map((item) => (
                <span key={item} className="rounded border border-current/20 bg-background/50 px-2 py-0.5 text-xs font-medium">{item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h3 className="font-bold text-lg mb-4">Core Design Principles</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {principles.map(({ label, desc }) => (
          <Card key={label}>
            <p className="font-bold text-sm mb-1 text-primary">{label}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-primary/30 bg-primary/5 p-5">
        <p className="font-bold text-sm mb-2">Capacity Targets (Phase 3+)</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-center">
          {[
            { v: "500K", label: "Registered users" },
            { v: "4", label: "Sports supported" },
            { v: "< 200ms", label: "Score update latency" },
            { v: "99.9%", label: "Uptime SLA" },
          ].map(({ v, label }) => (
            <div key={label}>
              <p className="font-display text-3xl font-black text-primary">{v}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
