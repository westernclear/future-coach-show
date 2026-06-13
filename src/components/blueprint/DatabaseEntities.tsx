import { SectionTitle, CodeBlock, Card } from "./shared";

const schema = `-- IDENTITY
create table profiles (
  id          uuid primary key references auth.users,
  username    text unique not null,
  display_name text,
  avatar_url  text,
  bio         text,
  created_at  timestamptz default now()
);

-- COACH DATA PLATFORM
create table coaches (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  sport       text not null check (sport in ('football','basketball','baseball','soccer')),
  current_role text,
  current_team text,
  headshot_url text,
  is_active   boolean default true,
  search_vec  tsvector generated always as (
                to_tsvector('english', full_name || ' ' || coalesce(current_team,''))
              ) stored,
  created_at  timestamptz default now()
);
create index on coaches using gin(search_vec);
create index on coaches(sport, is_active);

create table coach_career_history (
  id          uuid primary key default gen_random_uuid(),
  coach_id    uuid references coaches on delete cascade,
  team        text not null,
  role        text not null,
  sport       text not null,
  season_start int,
  season_end   int,
  record_w    int, record_l int, record_d int
);

-- SCORING ENGINE (event-sourced)
create table scoring_rule_versions (
  id          uuid primary key default gen_random_uuid(),
  version     text not null unique,  -- e.g. "2025-v1"
  sport       text not null,
  rules_json  jsonb not null,
  published_at timestamptz,
  is_current  boolean default false
);

create table score_events (
  id              uuid primary key default gen_random_uuid(),
  coach_id        uuid references coaches,
  game_id         text not null,          -- external game identifier
  rule_version_id uuid references scoring_rule_versions,
  rule_key        text not null,          -- e.g. "fourth_down_conversion"
  points          numeric(6,2) not null,
  confidence      numeric(4,2),           -- 0-1
  explanation     text not null,
  source          text default 'feed',    -- 'feed' | 'editorial' | 'admin'
  admin_override_id uuid,
  occurred_at     timestamptz not null,
  created_at      timestamptz default now()
);
create index on score_events(coach_id, occurred_at desc);

create table score_snapshots (
  id          uuid primary key default gen_random_uuid(),
  coach_id    uuid references coaches,
  week_id     text not null,
  total_points numeric(8,2),
  event_count  int,
  snapshot_at  timestamptz default now()
);
create unique index on score_snapshots(coach_id, week_id);

create table admin_overrides (
  id              uuid primary key default gen_random_uuid(),
  admin_id        uuid references profiles,
  score_event_id  uuid references score_events,
  reason          text not null,
  delta_points    numeric(6,2),
  applied_at      timestamptz default now()
);

-- FANTASY GAME
create table contests (
  id          uuid primary key default gen_random_uuid(),
  week_id     text unique not null,
  sport       text,                      -- null = all sports
  locks_at    timestamptz not null,
  ends_at     timestamptz not null,
  status      text default 'upcoming'    -- upcoming|open|locked|complete
);

create table rosters (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles,
  contest_id  uuid references contests,
  submitted_at timestamptz default now(),
  unique(user_id, contest_id)
);

create table roster_coaches (
  roster_id   uuid references rosters on delete cascade,
  coach_id    uuid references coaches,
  primary key (roster_id, coach_id)
);

-- LEADERBOARD (materialised, refreshed by pg_cron)
create table leaderboard_snapshots (
  contest_id  uuid references contests,
  user_id     uuid references profiles,
  total_pts   numeric(8,2),
  rank        int,
  refreshed_at timestamptz,
  primary key (contest_id, user_id)
);

-- EDITORIAL
create table editorial_proposals (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid references profiles,
  entity_type text not null,   -- 'coach' | 'score_event'
  entity_id   uuid not null,
  change_json jsonb not null,
  status      text default 'pending',  -- pending|approved|rejected
  reviewed_by uuid references profiles,
  reviewed_at timestamptz,
  created_at  timestamptz default now()
);

-- RAW INGESTION
create table raw_game_events (
  id               uuid primary key default gen_random_uuid(),
  external_event_id text unique not null,
  sport            text not null,
  provider         text not null,
  payload          jsonb not null,
  processed        boolean default false,
  processed_at     timestamptz,
  created_at       timestamptz default now()
);`;

const rls = [
  ["profiles", "Anyone can read public profiles. Only owner can update own row."],
  ["coaches", "Anyone can read. Only admin/editorial roles can insert or update."],
  ["score_events", "Anyone can read. Insert via Edge Function service role only."],
  ["rosters", "Owner reads own roster. Locked contests: no insert/update."],
  ["leaderboard_snapshots", "Public read. Write by pg_cron service role only."],
  ["editorial_proposals", "Editorial role can insert; admin role can update status."],
  ["admin_overrides", "Admin role only — full CRUD; audit log on every mutation."],
  ["raw_game_events", "Service role only — no public access."],
];

export function DatabaseEntities() {
  return (
    <div>
      <SectionTitle
        eyebrow="Section 4 · Data Model"
        title="Database Schema"
        sub="All tables live in Supabase Postgres. Row-Level Security (RLS) policies enforce access at the database layer — no application-layer bypass possible."
      />
      <CodeBlock>{schema}</CodeBlock>
      <h3 className="font-bold text-lg mt-8 mb-4">Row-Level Security Policies</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {rls.map(([table, policy]) => (
          <Card key={table} className="!py-3">
            <code className="text-xs font-mono font-bold text-primary">{table}</code>
            <p className="mt-1 text-sm text-muted-foreground">{policy}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
