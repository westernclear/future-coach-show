ALTER TABLE public.profiles
  ADD COLUMN legal_name text,
  ADD COLUMN mobile_number text,
  ADD COLUMN country_code text,
  ADD COLUMN region text,
  ADD COLUMN date_of_birth date,
  ADD COLUMN favorite_sport text,
  ADD COLUMN favorite_team text,
  ADD COLUMN preferred_league text,
  ADD COLUMN fantasy_skill_level text,
  ADD COLUMN age_confirmed_at timestamptz,
  ADD COLUMN location_confirmed_at timestamptz,
  ADD COLUMN onboarding_completed_at timestamptz,
  ADD CONSTRAINT profiles_legal_name_check CHECK (legal_name IS NULL OR char_length(legal_name) BETWEEN 1 AND 120),
  ADD CONSTRAINT profiles_mobile_number_check CHECK (mobile_number IS NULL OR mobile_number ~ '^\+[1-9][0-9]{7,14}$'),
  ADD CONSTRAINT profiles_country_code_check CHECK (country_code IS NULL OR country_code ~ '^[A-Z]{2}$'),
  ADD CONSTRAINT profiles_region_check CHECK (region IS NULL OR char_length(region) BETWEEN 1 AND 100),
  ADD CONSTRAINT profiles_fantasy_skill_level_check CHECK (fantasy_skill_level IS NULL OR fantasy_skill_level IN ('rookie', 'intermediate', 'advanced', 'expert'));

CREATE TABLE public.account_verifications (
  user_id uuid PRIMARY KEY,
  email_verified_at timestamptz,
  phone_verified_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.account_verifications TO authenticated;
GRANT ALL ON public.account_verifications TO service_role;
ALTER TABLE public.account_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own verification status" ON public.account_verifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER set_account_verifications_updated_at BEFORE UPDATE ON public.account_verifications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.user_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('terms_of_service', 'game_rules', 'privacy_policy', 'fair_play_policy')),
  document_version text NOT NULL CHECK (char_length(document_version) BETWEEN 1 AND 40),
  accepted_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, document_type, document_version)
);
GRANT SELECT, INSERT ON public.user_consents TO authenticated;
GRANT ALL ON public.user_consents TO service_role;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own consent history" ON public.user_consents FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can record own consent" ON public.user_consents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX user_consents_user_id_idx ON public.user_consents(user_id, accepted_at DESC);

CREATE TABLE public.identity_verifications (
  user_id uuid PRIMARY KEY,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'pending', 'verified', 'failed', 'needs_review')),
  government_id_status text NOT NULL DEFAULT 'not_started' CHECK (government_id_status IN ('not_started', 'pending', 'verified', 'failed')),
  selfie_match_status text NOT NULL DEFAULT 'not_started' CHECK (selfie_match_status IN ('not_started', 'pending', 'verified', 'failed')),
  address_status text NOT NULL DEFAULT 'not_started' CHECK (address_status IN ('not_started', 'pending', 'verified', 'failed')),
  location_status text NOT NULL DEFAULT 'not_started' CHECK (location_status IN ('not_started', 'pending', 'verified', 'failed')),
  tax_status text NOT NULL DEFAULT 'not_required' CHECK (tax_status IN ('not_required', 'required', 'pending', 'verified', 'failed')),
  provider_reference text,
  verified_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.identity_verifications TO authenticated;
GRANT ALL ON public.identity_verifications TO service_role;
ALTER TABLE public.identity_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own identity status" ON public.identity_verifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER set_identity_verifications_updated_at BEFORE UPDATE ON public.identity_verifications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.user_wallets (
  user_id uuid PRIMARY KEY,
  fantasy_points numeric(14,2) NOT NULL DEFAULT 0 CHECK (fantasy_points >= 0),
  reward_credits numeric(14,2) NOT NULL DEFAULT 0 CHECK (reward_credits >= 0),
  winnings_cents bigint NOT NULL DEFAULT 0 CHECK (winnings_cents >= 0),
  promotional_tokens numeric(14,2) NOT NULL DEFAULT 0 CHECK (promotional_tokens >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.user_wallets TO authenticated;
GRANT ALL ON public.user_wallets TO service_role;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wallet" ON public.user_wallets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER set_user_wallets_updated_at BEFORE UPDATE ON public.user_wallets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();