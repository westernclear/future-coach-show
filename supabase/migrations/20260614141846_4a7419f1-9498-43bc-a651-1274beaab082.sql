REVOKE ALL ON TABLE public.user_roles FROM anon;
REVOKE ALL ON TABLE public.user_roles FROM authenticated;
GRANT SELECT ON TABLE public.user_roles TO authenticated;
GRANT ALL ON TABLE public.user_roles TO service_role;

CREATE OR REPLACE FUNCTION private.protect_contest_entry_server_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
BEGIN
  IF auth.role() = 'authenticated'
     AND NOT private.has_role(auth.uid(), 'admin'::public.app_role)
     AND (
       NEW.user_id IS DISTINCT FROM OLD.user_id
       OR NEW.contest_id IS DISTINCT FROM OLD.contest_id
       OR NEW.total_points IS DISTINCT FROM OLD.total_points
       OR NEW.rank IS DISTINCT FROM OLD.rank
       OR NEW.tiebreaker_value IS DISTINCT FROM OLD.tiebreaker_value
       OR NEW.created_at IS DISTINCT FROM OLD.created_at
     )
  THEN
    RAISE EXCEPTION 'Server-controlled contest entry fields cannot be changed';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_contest_entry_server_fields ON public.contest_entries;
CREATE TRIGGER protect_contest_entry_server_fields
BEFORE UPDATE ON public.contest_entries
FOR EACH ROW
EXECUTE FUNCTION private.protect_contest_entry_server_fields();