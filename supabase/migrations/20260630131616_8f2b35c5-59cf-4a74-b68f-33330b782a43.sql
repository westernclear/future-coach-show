
CREATE TABLE public.site_access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_hash text NOT NULL UNIQUE,
  label text NOT NULL,
  note text,
  max_uses integer,
  uses integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_access_codes TO authenticated;
GRANT ALL ON public.site_access_codes TO service_role;

ALTER TABLE public.site_access_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage access codes"
ON public.site_access_codes FOR ALL
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER set_site_access_codes_updated_at
BEFORE UPDATE ON public.site_access_codes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_site_access_codes_active ON public.site_access_codes(active) WHERE active = true;
