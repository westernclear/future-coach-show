CREATE TABLE public.security_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  finding_id uuid NOT NULL REFERENCES public.security_findings(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('high_severity_detected','issue_resolved')),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 240),
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 1000),
  severity text NOT NULL CHECK (severity IN ('critical','high','medium','low','info')),
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, finding_id, event_type)
);
GRANT SELECT, UPDATE, DELETE ON public.security_notifications TO authenticated;
GRANT ALL ON public.security_notifications TO service_role;
ALTER TABLE public.security_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view own security notifications" ON public.security_notifications FOR SELECT TO authenticated USING (auth.uid() = user_id AND private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins update own security notifications" ON public.security_notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id AND private.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (auth.uid() = user_id AND private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins delete own security notifications" ON public.security_notifications FOR DELETE TO authenticated USING (auth.uid() = user_id AND private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX security_notifications_user_created_idx ON public.security_notifications(user_id, created_at DESC);

CREATE OR REPLACE FUNCTION private.create_security_finding_notifications()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  alert_event text;
  alert_title text;
  alert_message text;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.severity IN ('critical', 'high') AND NEW.status <> 'resolved' THEN
    alert_event := 'high_severity_detected';
    alert_title := 'New ' || upper(NEW.severity) || ' security issue';
    alert_message := NEW.title || ' was detected by ' || NEW.scanner || '.';
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'resolved' AND OLD.status IS DISTINCT FROM 'resolved' THEN
    alert_event := 'issue_resolved';
    alert_title := 'Security issue resolved';
    alert_message := NEW.title || ' has been marked Resolved.';
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.security_notifications (user_id, finding_id, event_type, title, message, severity)
  SELECT ur.user_id, NEW.id, alert_event, alert_title, alert_message, NEW.severity
  FROM public.user_roles ur
  WHERE ur.role = 'admin'
  ON CONFLICT (user_id, finding_id, event_type) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER create_security_finding_notifications
AFTER INSERT OR UPDATE OF status ON public.security_findings
FOR EACH ROW EXECUTE FUNCTION private.create_security_finding_notifications();

ALTER PUBLICATION supabase_realtime ADD TABLE public.security_notifications;