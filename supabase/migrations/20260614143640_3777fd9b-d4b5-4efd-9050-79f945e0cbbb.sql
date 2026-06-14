REVOKE ALL ON FUNCTION public.enforce_paid_contest_eligibility() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enforce_paid_contest_eligibility() FROM anon;
REVOKE ALL ON FUNCTION public.enforce_paid_contest_eligibility() FROM authenticated;
REVOKE ALL ON FUNCTION public.enforce_paid_contest_eligibility() FROM service_role;