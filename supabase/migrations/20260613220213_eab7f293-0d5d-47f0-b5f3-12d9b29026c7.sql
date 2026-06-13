CREATE TYPE public.contest_format AS ENUM ('global', 'private_league', 'head_to_head');
CREATE TYPE public.contest_entry_type AS ENUM ('free', 'paid');
CREATE TYPE public.contest_settlement_status AS ENUM ('unsettled', 'pending_review', 'settled', 'cancelled', 'refunded');
CREATE TYPE public.reward_kind AS ENUM ('points', 'contest_ticket', 'badge', 'merchandise', 'cash');
CREATE TYPE public.reward_status AS ENUM ('pending', 'available', 'fulfilled', 'cancelled', 'expired');

ALTER TABLE public.contests
  ADD COLUMN format public.contest_format NOT NULL DEFAULT 'global',
  ADD COLUMN entry_type public.contest_entry_type NOT NULL DEFAULT 'free',
  ADD COLUMN entry_price_cents integer NOT NULL DEFAULT 0 CHECK (entry_price_cents >= 0),
  ADD COLUMN guaranteed_prize_cents integer NOT NULL DEFAULT 0 CHECK (guaranteed_prize_cents >= 0),
  ADD COLUMN payout_structure jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN eligibility_rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN settlement_status public.contest_settlement_status NOT NULL DEFAULT 'unsettled',
  ADD COLUMN platform_fee_bps integer NOT NULL DEFAULT 0 CHECK (platform_fee_bps BETWEEN 0 AND 10000),
  ADD COLUMN league_id uuid REFERENCES public.leagues(id) ON DELETE SET NULL,
  ADD COLUMN head_to_head_size integer CHECK (head_to_head_size IS NULL OR head_to_head_size = 2),
  ADD CONSTRAINT contests_entry_price_matches_type CHECK ((entry_type = 'free' AND entry_price_cents = 0) OR entry_type = 'paid'),
  ADD CONSTRAINT contests_format_details_valid CHECK ((format = 'private_league' AND league_id IS NOT NULL) OR (format <> 'private_league'));

ALTER TABLE public.coach_scores
  ADD COLUMN performance_points numeric NOT NULL DEFAULT 0,
  ADD COLUMN decision_points numeric NOT NULL DEFAULT 0,
  ADD COLUMN context_points numeric NOT NULL DEFAULT 0,
  ADD COLUMN scoring_breakdown jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE public.reward_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'trophy',
  tier text NOT NULL DEFAULT 'weekly' CHECK (tier IN ('weekly', 'premium', 'season', 'legacy')),
  criteria jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reward_badges TO authenticated;
GRANT ALL ON public.reward_badges TO service_role;
ALTER TABLE public.reward_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users can view active reward badges" ON public.reward_badges FOR SELECT TO authenticated USING (is_active = true);

CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_id uuid NOT NULL REFERENCES public.reward_badges(id) ON DELETE RESTRICT,
  contest_id uuid REFERENCES public.contests(id) ON DELETE SET NULL,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id, contest_id)
);
GRANT SELECT ON public.user_badges TO authenticated;
GRANT ALL ON public.user_badges TO service_role;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own badges" ON public.user_badges FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.reward_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  contest_id uuid REFERENCES public.contests(id) ON DELETE SET NULL,
  entry_id uuid REFERENCES public.contest_entries(id) ON DELETE SET NULL,
  kind public.reward_kind NOT NULL,
  status public.reward_status NOT NULL DEFAULT 'pending',
  amount numeric NOT NULL DEFAULT 0,
  currency text,
  description text NOT NULL,
  reference_key text UNIQUE,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  fulfilled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reward_ledger TO authenticated;
GRANT ALL ON public.reward_ledger TO service_role;
ALTER TABLE public.reward_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own reward ledger" ON public.reward_ledger FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.prize_awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  contest_id uuid NOT NULL REFERENCES public.contests(id) ON DELETE RESTRICT,
  entry_id uuid REFERENCES public.contest_entries(id) ON DELETE SET NULL,
  placement integer NOT NULL CHECK (placement > 0),
  kind public.reward_kind NOT NULL,
  status public.reward_status NOT NULL DEFAULT 'pending',
  amount numeric NOT NULL DEFAULT 0 CHECK (amount >= 0),
  currency text,
  fulfillment_reference text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  fulfilled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contest_id, entry_id, kind)
);
GRANT SELECT ON public.prize_awards TO authenticated;
GRANT ALL ON public.prize_awards TO service_role;
ALTER TABLE public.prize_awards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own prize awards" ON public.prize_awards FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE INDEX user_badges_user_awarded_idx ON public.user_badges (user_id, awarded_at DESC);
CREATE INDEX reward_ledger_user_awarded_idx ON public.reward_ledger (user_id, awarded_at DESC);
CREATE INDEX prize_awards_user_contest_idx ON public.prize_awards (user_id, contest_id);
CREATE INDEX contests_format_status_idx ON public.contests (format, status, is_published);

CREATE TRIGGER set_reward_badges_updated_at BEFORE UPDATE ON public.reward_badges FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_reward_ledger_updated_at BEFORE UPDATE ON public.reward_ledger FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_prize_awards_updated_at BEFORE UPDATE ON public.prize_awards FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();