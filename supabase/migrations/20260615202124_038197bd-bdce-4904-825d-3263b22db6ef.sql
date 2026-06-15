CREATE TYPE public.monitoring_event_kind AS ENUM (
  'client_error',
  'server_error',
  'probe_failure',
  'probe_success',
  'alert_sent'
);

CREATE TYPE public.monitoring_severity AS ENUM ('info', 'warning', 'error', 'critical');

CREATE TABLE public.monitoring_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind public.monitoring_event_kind NOT NULL,
  severity public.monitoring_severity NOT NULL DEFAULT 'error',
  route TEXT,
  message TEXT NOT NULL,
  status_code INTEGER,
  duration_ms INTEGER,
  user_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_monitoring_events_created_at ON public.monitoring_events (created_at DESC);
CREATE INDEX idx_monitoring_events_kind_created ON public.monitoring_events (kind, created_at DESC);
CREATE INDEX idx_monitoring_events_severity ON public.monitoring_events (severity, created_at DESC);

GRANT SELECT ON public.monitoring_events TO authenticated;
GRANT ALL ON public.monitoring_events TO service_role;

ALTER TABLE public.monitoring_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all monitoring events"
ON public.monitoring_events FOR SELECT TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TABLE public.monitoring_alert_state (
  id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id = TRUE),
  last_alert_sent_at TIMESTAMPTZ,
  last_alert_signature TEXT,
  consecutive_failures INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.monitoring_alert_state TO authenticated;
GRANT ALL ON public.monitoring_alert_state TO service_role;

ALTER TABLE public.monitoring_alert_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read alert state"
ON public.monitoring_alert_state FOR SELECT TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

INSERT INTO public.monitoring_alert_state (id) VALUES (TRUE);

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.schedule(
  'monitoring-probe-every-5min',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://coachface.com/api/public/monitoring/probe',
    headers := '{"Content-Type": "application/json", "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92a2RycnhpeHhtaXVwZ25oam5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjQ3MzYsImV4cCI6MjA5Njk0MDczNn0.hvIEytu_Qco2iiPmuGsI-ygEnpHv403DNiyZz1YNKik"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'monitoring-alert-sweep-every-5min',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://coachface.com/api/public/monitoring/alert-sweep',
    headers := '{"Content-Type": "application/json", "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92a2RycnhpeHhtaXVwZ25oam5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjQ3MzYsImV4cCI6MjA5Njk0MDczNn0.hvIEytu_Qco2iiPmuGsI-ygEnpHv403DNiyZz1YNKik"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);