import { SectionTitle, Card, Tag } from "./shared";

const modules = [
  {
    id: "identity",
    name: "Identity & Profiles",
    phase: "1",
    owns: ["users", "profiles", "preferences", "social_links", "notification_settings"],
    api: ["POST /auth/signup", "GET /me", "PATCH /me/profile", "GET /users/:id (public)"],
    desc: "Handles registration, OAuth login, public profile pages, display names, avatar uploads, favourite teams, and notification preferences. Owned by Supabase Auth + a profiles table.",
    tags: ["Auth", "OAuth", "Magic Link"],
  },
  {
    id: "coach-data",
    name: "Coach Data Platform",
    phase: "1",
    owns: ["coaches", "coach_roles", "coach_career_history", "coach_bio_snapshots"],
    api: ["GET /coaches", "GET /coaches/:id", "GET /coaches/:id/history", "POST /coaches (admin)", "PATCH /coaches/:id (admin/editorial)"],
    desc: "The public coach database. Each coach record spans all four sports with career history, current role, and headshot. Editorial staff can propose changes; admins approve or override. Fully searchable.",
    tags: ["Public", "Editorial", "Search"],
  },
  {
    id: "scoring",
    name: "Scoring Engine",
    phase: "2",
    owns: ["score_events", "score_snapshots", "scoring_rules", "scoring_rule_versions", "admin_overrides"],
    api: ["GET /coaches/:id/score", "GET /coaches/:id/score-events", "GET /scoring-rules", "POST /admin/overrides"],
    desc: "Event-sourced. Every scoring action (4th-down conversion, challenge win, timeout, etc.) creates an immutable score_event row with coach_id, game_id, rule_id, points, confidence, and explanation text. Snapshots are materialised hourly.",
    tags: ["Event-sourced", "Versioned", "Explainable"],
  },
  {
    id: "fantasy",
    name: "Fantasy Game",
    phase: "2",
    owns: ["seasons", "weeks", "contests", "rosters", "roster_coaches", "roster_results", "leaderboard_snapshots"],
    api: ["GET /contests/current", "POST /rosters", "GET /rosters/:id", "GET /leaderboard"],
    desc: "Free-to-play weekly game. Users select up to 3 coaches per week before the roster-lock deadline. Rosters accumulate live scores from the Scoring Engine. Leaderboard snapshots refresh every 60 seconds from Redis.",
    tags: ["Free-to-play", "Weekly", "Roster lock"],
  },
  {
    id: "ingestion",
    name: "Event Ingestion",
    phase: "2",
    owns: ["raw_game_events", "ingestion_logs", "sport_feed_configs"],
    api: ["POST /webhooks/sportradar (internal)", "POST /admin/events/manual (admin)"],
    desc: "Normalises raw game events from licensed feeds (Sportradar/Stats Perform) into a canonical CoachFace game-event schema. Each sport has its own adapter. Events are idempotent (external_event_id dedup). Manual import CSV supported.",
    tags: ["Webhook", "Adapter", "Idempotent"],
  },
  {
    id: "editorial",
    name: "Editorial & Review",
    phase: "2",
    owns: ["editorial_proposals", "editorial_reviews", "content_flags"],
    api: ["POST /editorial/proposals", "PATCH /editorial/proposals/:id/review", "GET /editorial/queue"],
    desc: "Editorial staff propose updates to coach bios, scores, or canonical game interpretations. Proposals flow through a review queue. Admins can approve, reject, or directly override. All actions are audit-logged.",
    tags: ["Review queue", "Audit log", "Role-gated"],
  },
  {
    id: "realtime",
    name: "Realtime & Pub-Sub",
    phase: "2",
    owns: ["supabase_realtime_channels", "score_change_events (CDC)"],
    api: ["WS /realtime/v1/score-updates", "WS /realtime/v1/leaderboard"],
    desc: "Postgres CDC feeds Supabase Realtime. Clients subscribe to per-coach or per-leaderboard channels and receive diff payloads. Presence used for concurrent viewer counts on the weekly Show feature.",
    tags: ["WebSocket", "CDC", "Presence"],
  },
  {
    id: "admin",
    name: "Admin & Overrides",
    phase: "2",
    owns: ["admin_actions", "role_grants", "feature_flags"],
    api: ["GET /admin/dashboard", "POST /admin/overrides", "POST /admin/flags", "GET /admin/audit-log"],
    desc: "Super-admins can override any score event, suspend users, grant editorial roles, toggle feature flags per sport or region, and view a full immutable audit log of every privileged action.",
    tags: ["RBAC", "Audit", "Feature flags"],
  },
  {
    id: "show",
    name: "The CoachFace Show",
    phase: "3",
    owns: ["episodes", "episode_segments", "fan_votes", "hot_seat_index"],
    api: ["GET /show/episodes", "POST /show/votes", "GET /show/hot-seat"],
    desc: "Weekly editorial show format. CMS-driven episode records link to video, segment breakdowns, and the week's leaderboard reveal. Fan voting opens during the live window. Hot Seat Index is a derived score of coaching volatility.",
    tags: ["CMS", "Fan vote", "Live window"],
  },
  {
    id: "ai",
    name: "AI Recaps & Search",
    phase: "3",
    owns: ["recap_jobs", "coach_embeddings", "user_digests"],
    api: ["GET /me/recap/:week_id", "GET /coaches/search?q="],
    desc: "Weekly personalised AI recaps generated per user via OpenAI GPT-4o, seeded with the user's roster results and top score events. Coach semantic search via pg_vector + full-text fallback.",
    tags: ["OpenAI", "pg_vector", "Personalised"],
  },
];

export function DomainModules() {
  return (
    <div>
      <SectionTitle
        eyebrow="Section 3 · Domain Decomposition"
        title="Domain Modules"
        sub="CoachFace is split into ten bounded domains. Each owns its data tables and API surface. Modules communicate via the shared Postgres database (Phase 1–2) and a lightweight internal event bus (Phase 3+)."
      />
      <div className="space-y-5">
        {modules.map((mod) => (
          <Card key={mod.id} className="!p-0 overflow-hidden">
            <div className="flex items-start gap-4 p-5 border-b border-border">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-display font-black text-lg uppercase tracking-tight">{mod.name}</h3>
                  <Tag variant={mod.phase === "1" ? "green" : mod.phase === "2" ? "blue" : "orange"}>Phase {mod.phase}</Tag>
                  {mod.tags.map(t => <Tag key={t}>{t}</Tag>)}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{mod.desc}</p>
              </div>
            </div>
            <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <div className="p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Owns Tables</p>
                <div className="flex flex-wrap gap-1.5">
                  {mod.owns.map(t => (
                    <code key={t} className="rounded bg-secondary px-1.5 py-0.5 text-xs font-mono">{t}</code>
                  ))}
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">API Surface</p>
                <div className="space-y-1">
                  {mod.api.map(a => (
                    <code key={a} className="block text-xs font-mono text-foreground/70">{a}</code>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
