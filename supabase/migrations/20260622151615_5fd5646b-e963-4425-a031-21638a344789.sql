
-- 1. Move pg_net by drop/recreate (SET SCHEMA is unsupported for pg_net)
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;
DROP EXTENSION IF EXISTS pg_net;
CREATE EXTENSION pg_net WITH SCHEMA extensions;

-- 2. Lock down monitoring_events writes
REVOKE INSERT, UPDATE, DELETE ON public.monitoring_events FROM anon, authenticated;

CREATE POLICY "No client writes to monitoring events"
  ON public.monitoring_events
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- 3. Lock down user_roles writes to prevent privilege escalation
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon, authenticated;

CREATE POLICY "No client writes to user roles"
  ON public.user_roles
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);
