
CREATE OR REPLACE FUNCTION public.enforce_paid_contest_eligibility()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  target_contest public.contests%ROWTYPE;
  account_check public.account_verifications%ROWTYPE;
  identity_check public.identity_verifications%ROWTYPE;
  elig_check public.user_eligibility%ROWTYPE;
BEGIN
  SELECT * INTO target_contest FROM public.contests WHERE id = NEW.contest_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contest not found';
  END IF;

  -- Free, no-prize contests still require basic eligibility attestation
  SELECT * INTO elig_check FROM public.user_eligibility WHERE user_id = NEW.user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'You must confirm your age and location before entering any contest. Visit /eligibility.';
  END IF;

  IF target_contest.entry_type = 'free'::public.contest_entry_type
     AND target_contest.guaranteed_prize_cents = 0 THEN
    IF NOT elig_check.free_play_eligible THEN
      RAISE EXCEPTION 'Free play is not permitted in your jurisdiction.';
    END IF;
    RETURN NEW;
  END IF;

  -- Paid / prize contests
  IF NOT elig_check.paid_play_eligible THEN
    RAISE EXCEPTION 'Paid contests are not available in your registered jurisdiction (see /legal/prohibited).';
  END IF;

  SELECT * INTO account_check FROM public.account_verifications WHERE user_id = NEW.user_id;
  IF account_check.email_verified_at IS NULL OR account_check.phone_verified_at IS NULL THEN
    RAISE EXCEPTION 'Verified email and phone are required for paid or prize competitions';
  END IF;

  SELECT * INTO identity_check FROM public.identity_verifications WHERE user_id = NEW.user_id;
  IF identity_check.status <> 'verified'
     OR identity_check.government_id_status <> 'verified'
     OR identity_check.selfie_match_status <> 'verified'
     OR identity_check.location_status <> 'verified'
     OR identity_check.address_status <> 'verified'
     OR identity_check.tax_status NOT IN ('verified', 'not_required') THEN
    RAISE EXCEPTION 'Identity, age, location, and tax eligibility must be completed before entering paid or prize competitions';
  END IF;

  RETURN NEW;
END;
$function$;
