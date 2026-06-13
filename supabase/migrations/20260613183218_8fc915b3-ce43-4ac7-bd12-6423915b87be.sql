CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'scoring_analyst', 'user');
CREATE TYPE public.game_status AS ENUM ('scheduled', 'live', 'final', 'postponed', 'cancelled');
CREATE TYPE public.review_status AS ENUM ('pending', 'approved', 'rejected', 'overridden');
CREATE TYPE public.contest_status AS ENUM ('draft', 'open', 'locked', 'live', 'final', 'cancelled');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  username text NOT NULL UNIQUE CHECK (username ~ '^[A-Za-z0-9_]{3,30}$'),
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 80),
  avatar_url text,
  bio text CHECK (char_length(bio) <= 500),
  location text CHECK (char_length(location) <= 120),
  favorite_sports text[] NOT NULL DEFAULT '{}',
  favorite_team_ids uuid[] NOT NULL DEFAULT '{}',
  notification_preferences jsonb NOT NULL DEFAULT '{"score_updates":true,"roster_reminders":true,"weekly_recap":true}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can create own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can delete own profile" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.sports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.sports TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.sports TO authenticated;
GRANT ALL ON public.sports TO service_role;
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sports are public" ON public.sports FOR SELECT USING (true);
CREATE POLICY "Admins manage sports" ON public.sports FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.leagues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id uuid NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  country_code text,
  provider_refs jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.leagues TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.leagues TO authenticated;
GRANT ALL ON public.leagues TO service_role;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leagues are public" ON public.leagues FOR SELECT USING (true);
CREATE POLICY "Admins manage leagues" ON public.leagues FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  abbreviation text NOT NULL,
  city text,
  logo_url text,
  provider_refs jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.teams TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.teams TO authenticated;
GRANT ALL ON public.teams TO service_role;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teams are public" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Admins manage teams" ON public.teams FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.coaches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id uuid NOT NULL REFERENCES public.sports(id) ON DELETE RESTRICT,
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  slug text NOT NULL UNIQUE,
  full_name text NOT NULL,
  role text NOT NULL,
  image_url text,
  biography text,
  status text NOT NULL DEFAULT 'active',
  provider_refs jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.coaches TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.coaches TO authenticated;
GRANT ALL ON public.coaches TO service_role;
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coaches are public" ON public.coaches FOR SELECT USING (true);
CREATE POLICY "Admins manage coaches" ON public.coaches FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  home_team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE RESTRICT,
  away_team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE RESTRICT,
  starts_at timestamptz NOT NULL,
  status public.game_status NOT NULL DEFAULT 'scheduled',
  home_score integer NOT NULL DEFAULT 0,
  away_score integer NOT NULL DEFAULT 0,
  period_label text,
  clock_display text,
  venue text,
  provider_refs jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_updated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (home_team_id <> away_team_id)
);
GRANT SELECT ON public.games TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.games TO authenticated;
GRANT ALL ON public.games TO service_role;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Games are public" ON public.games FOR SELECT USING (true);
CREATE POLICY "Admins manage games" ON public.games FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.scoring_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id uuid NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  coach_role text NOT NULL,
  event_type text NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  points numeric(8,2) NOT NULL,
  version integer NOT NULL,
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sport_id, coach_role, event_type, version)
);
GRANT SELECT ON public.scoring_rules TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.scoring_rules TO authenticated;
GRANT ALL ON public.scoring_rules TO service_role;
ALTER TABLE public.scoring_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active scoring rules are public" ON public.scoring_rules FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage scoring rules" ON public.scoring_rules FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'scoring_analyst')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'scoring_analyst'));

CREATE TABLE public.score_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key text NOT NULL UNIQUE,
  game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  coach_id uuid NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  scoring_rule_id uuid NOT NULL REFERENCES public.scoring_rules(id) ON DELETE RESTRICT,
  event_type text NOT NULL,
  occurred_at timestamptz NOT NULL,
  points numeric(8,2) NOT NULL,
  title text NOT NULL,
  explanation text NOT NULL,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_type text NOT NULL,
  source_ref text,
  confidence numeric(5,4) CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 1),
  review_status public.review_status NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  supersedes_event_id uuid REFERENCES public.score_events(id) ON DELETE SET NULL,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.score_events TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.score_events TO authenticated;
GRANT ALL ON public.score_events TO service_role;
ALTER TABLE public.score_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published score events are public" ON public.score_events FOR SELECT USING (is_published = true);
CREATE POLICY "Scoring staff manage events" ON public.score_events FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor') OR public.has_role(auth.uid(), 'scoring_analyst')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor') OR public.has_role(auth.uid(), 'scoring_analyst'));

CREATE TABLE public.coach_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  game_id uuid REFERENCES public.games(id) ON DELETE CASCADE,
  scope text NOT NULL CHECK (scope IN ('game', 'week', 'season', 'all_time')),
  scope_key text NOT NULL,
  objective_points numeric(10,2) NOT NULL DEFAULT 0,
  editorial_points numeric(10,2) NOT NULL DEFAULT 0,
  total_points numeric(10,2) NOT NULL DEFAULT 0,
  event_count integer NOT NULL DEFAULT 0,
  rank integer,
  movement numeric(10,2),
  is_final boolean NOT NULL DEFAULT false,
  calculated_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (coach_id, scope, scope_key)
);
GRANT SELECT ON public.coach_scores TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.coach_scores TO authenticated;
GRANT ALL ON public.coach_scores TO service_role;
ALTER TABLE public.coach_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coach scores are public" ON public.coach_scores FOR SELECT USING (true);
CREATE POLICY "Scoring staff manage totals" ON public.coach_scores FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'scoring_analyst')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'scoring_analyst'));

CREATE TABLE public.contests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id uuid REFERENCES public.sports(id) ON DELETE SET NULL,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  status public.contest_status NOT NULL DEFAULT 'draft',
  opens_at timestamptz NOT NULL,
  locks_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  roster_size integer NOT NULL CHECK (roster_size BETWEEN 1 AND 20),
  max_entries_per_user integer NOT NULL DEFAULT 1 CHECK (max_entries_per_user BETWEEN 1 AND 100),
  rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (opens_at < locks_at AND locks_at < ends_at)
);
GRANT SELECT ON public.contests TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.contests TO authenticated;
GRANT ALL ON public.contests TO service_role;
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published contests are public" ON public.contests FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage contests" ON public.contests FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE TABLE public.contest_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id uuid NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  entry_name text NOT NULL CHECK (char_length(entry_name) BETWEEN 1 AND 80),
  total_points numeric(10,2) NOT NULL DEFAULT 0,
  rank integer,
  tiebreaker_value numeric(12,2),
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contest_id, user_id, entry_name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contest_entries TO authenticated;
GRANT ALL ON public.contest_entries TO service_role;
ALTER TABLE public.contest_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own entries" ON public.contest_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage entries" ON public.contest_entries FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.roster_picks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES public.contest_entries(id) ON DELETE CASCADE,
  coach_id uuid NOT NULL REFERENCES public.coaches(id) ON DELETE RESTRICT,
  slot text NOT NULL,
  locked_at timestamptz,
  points numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entry_id, coach_id),
  UNIQUE (entry_id, slot)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roster_picks TO authenticated;
GRANT ALL ON public.roster_picks TO service_role;
ALTER TABLE public.roster_picks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage picks for own entries" ON public.roster_picks FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.contest_entries e WHERE e.id = entry_id AND e.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.contest_entries e WHERE e.id = entry_id AND e.user_id = auth.uid()));
CREATE POLICY "Admins manage picks" ON public.roster_picks FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER sports_updated_at BEFORE UPDATE ON public.sports FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER leagues_updated_at BEFORE UPDATE ON public.leagues FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER coaches_updated_at BEFORE UPDATE ON public.coaches FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER games_updated_at BEFORE UPDATE ON public.games FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER scoring_rules_updated_at BEFORE UPDATE ON public.scoring_rules FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER score_events_updated_at BEFORE UPDATE ON public.score_events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER coach_scores_updated_at BEFORE UPDATE ON public.coach_scores FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER contests_updated_at BEFORE UPDATE ON public.contests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER contest_entries_updated_at BEFORE UPDATE ON public.contest_entries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER roster_picks_updated_at BEFORE UPDATE ON public.roster_picks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX games_status_starts_idx ON public.games(status, starts_at);
CREATE INDEX games_league_starts_idx ON public.games(league_id, starts_at DESC);
CREATE INDEX coaches_sport_team_idx ON public.coaches(sport_id, team_id);
CREATE INDEX score_events_game_time_idx ON public.score_events(game_id, occurred_at DESC);
CREATE INDEX score_events_coach_time_idx ON public.score_events(coach_id, occurred_at DESC);
CREATE INDEX score_events_review_idx ON public.score_events(review_status, is_published);
CREATE INDEX coach_scores_scope_rank_idx ON public.coach_scores(scope, scope_key, rank);
CREATE INDEX contest_entries_contest_rank_idx ON public.contest_entries(contest_id, rank);
CREATE INDEX roster_picks_coach_idx ON public.roster_picks(coach_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.games;
ALTER PUBLICATION supabase_realtime ADD TABLE public.score_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.coach_scores;