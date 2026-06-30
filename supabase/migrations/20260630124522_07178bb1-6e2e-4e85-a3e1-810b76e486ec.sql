
CREATE TABLE public.jurisdiction_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL,
  region_code text,
  jurisdiction_name text NOT NULL,
  free_play_allowed boolean NOT NULL DEFAULT true,
  paid_contests_allowed boolean NOT NULL DEFAULT true,
  dfs_allowed boolean NOT NULL DEFAULT true,
  season_long_allowed boolean NOT NULL DEFAULT true,
  min_age integer NOT NULL DEFAULT 18,
  notes text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (country_code, region_code)
);
GRANT SELECT ON public.jurisdiction_rules TO authenticated, anon;
GRANT ALL ON public.jurisdiction_rules TO service_role;
ALTER TABLE public.jurisdiction_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active jurisdiction rules" ON public.jurisdiction_rules FOR SELECT USING (active = true);
CREATE POLICY "Admins manage jurisdiction rules" ON public.jurisdiction_rules FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE TRIGGER jurisdiction_rules_updated_at BEFORE UPDATE ON public.jurisdiction_rules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.user_eligibility (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  attested_country_code text NOT NULL,
  attested_region_code text,
  date_of_birth date NOT NULL,
  age_confirmed_at timestamptz NOT NULL DEFAULT now(),
  terms_accepted_at timestamptz NOT NULL DEFAULT now(),
  responsible_play_accepted_at timestamptz NOT NULL DEFAULT now(),
  free_play_eligible boolean NOT NULL DEFAULT false,
  paid_play_eligible boolean NOT NULL DEFAULT false,
  last_checked_at timestamptz NOT NULL DEFAULT now(),
  last_ip_country text,
  last_ip_region text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.user_eligibility TO authenticated;
GRANT ALL ON public.user_eligibility TO service_role;
ALTER TABLE public.user_eligibility ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own eligibility" ON public.user_eligibility FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own eligibility" ON public.user_eligibility FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own eligibility" ON public.user_eligibility FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read all eligibility" ON public.user_eligibility FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE TRIGGER user_eligibility_updated_at BEFORE UPDATE ON public.user_eligibility
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.geo_block_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  attested_country text,
  attested_region text,
  ip_country text,
  ip_region text,
  contest_type text,
  action text NOT NULL,
  reason text NOT NULL,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.geo_block_log TO authenticated;
GRANT ALL ON public.geo_block_log TO service_role;
ALTER TABLE public.geo_block_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert own block log" ON public.geo_block_log FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users read own block log" ON public.geo_block_log FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read all block logs" ON public.geo_block_log FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX geo_block_log_created_at_idx ON public.geo_block_log (created_at DESC);
CREATE INDEX geo_block_log_user_idx ON public.geo_block_log (user_id);

INSERT INTO public.jurisdiction_rules
  (country_code, region_code, jurisdiction_name, free_play_allowed, paid_contests_allowed, dfs_allowed, season_long_allowed, min_age, notes)
VALUES
  ('US', NULL, 'United States', true, true, true, true, 18, 'Default US rule; state rows override.'),
  ('US', 'HI', 'Hawaii',     true, false, false, false, 18, 'Paid DFS prohibited.'),
  ('US', 'ID', 'Idaho',      true, false, false, false, 18, 'Paid DFS prohibited.'),
  ('US', 'MT', 'Montana',    true, false, false, false, 18, 'Paid DFS prohibited.'),
  ('US', 'NV', 'Nevada',     true, false, false, false, 21, 'Treated as gambling; requires NV gaming license.'),
  ('US', 'WA', 'Washington', true, false, false, false, 18, 'Paid DFS prohibited.'),
  ('US', 'AL', 'Alabama',    true, false, false, false, 19, 'Restricted pending license.'),
  ('US', 'AZ', 'Arizona',    true, false, false, false, 21, 'Restricted pending license.'),
  ('US', 'AR', 'Arkansas',   true, false, false, false, 18, 'Restricted pending license.'),
  ('US', 'DE', 'Delaware',   true, false, false, false, 18, 'Restricted pending license.'),
  ('US', 'LA', 'Louisiana',  true, false, false, false, 21, 'Parish opt-in; blocked until licensed statewide.'),
  ('US', 'ME', 'Maine',      true, false, false, false, 18, 'Restricted pending license.'),
  ('US', 'MA', 'Massachusetts', true, true, true, true, 21, 'Minimum age 21 for paid contests.'),
  ('US', 'IA', 'Iowa',          true, true, true, true, 21, 'Minimum age 21 for paid contests.'),
  ('CU', NULL, 'Cuba',         false, false, false, false, 18, 'OFAC sanctioned.'),
  ('IR', NULL, 'Iran',         false, false, false, false, 18, 'OFAC sanctioned.'),
  ('KP', NULL, 'North Korea',  false, false, false, false, 18, 'OFAC sanctioned.'),
  ('SY', NULL, 'Syria',        false, false, false, false, 18, 'OFAC sanctioned.'),
  ('RU', NULL, 'Russia',       false, false, false, false, 18, 'OFAC sanctioned.'),
  ('BY', NULL, 'Belarus',      false, false, false, false, 18, 'OFAC sanctioned.'),
  ('MM', NULL, 'Myanmar',      false, false, false, false, 18, 'OFAC sanctioned.'),
  ('VE', NULL, 'Venezuela',    false, false, false, false, 18, 'OFAC sanctioned.');
