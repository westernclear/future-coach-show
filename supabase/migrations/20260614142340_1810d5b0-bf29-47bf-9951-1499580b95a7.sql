CREATE TABLE public.security_scan_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scanned_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL CHECK (source IN ('connector_security_scan','supabase','supabase_lov','tanstack')),
  scanner_version text,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('completed','running','failed')),
  issues_found integer NOT NULL DEFAULT 0 CHECK (issues_found >= 0),
  critical_count integer NOT NULL DEFAULT 0 CHECK (critical_count >= 0),
  high_count integer NOT NULL DEFAULT 0 CHECK (high_count >= 0),
  medium_count integer NOT NULL DEFAULT 0 CHECK (medium_count >= 0),
  low_count integer NOT NULL DEFAULT 0 CHECK (low_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.security_scan_runs TO authenticated;
GRANT ALL ON public.security_scan_runs TO service_role;
ALTER TABLE public.security_scan_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view security scan runs" ON public.security_scan_runs FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins create security scan runs" ON public.security_scan_runs FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins update security scan runs" ON public.security_scan_runs FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins delete security scan runs" ON public.security_scan_runs FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TABLE public.security_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text NOT NULL,
  scan_run_id uuid REFERENCES public.security_scan_runs(id) ON DELETE SET NULL,
  scanner text NOT NULL,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 240),
  description text NOT NULL DEFAULT '',
  severity text NOT NULL CHECK (severity IN ('critical','high','medium','low','info')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','accepted_risk')),
  owner text CHECK (owner IS NULL OR char_length(owner) <= 120),
  remediation text NOT NULL DEFAULT '',
  first_detected_at timestamptz NOT NULL DEFAULT now(),
  last_detected_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (scanner, external_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.security_findings TO authenticated;
GRANT ALL ON public.security_findings TO service_role;
ALTER TABLE public.security_findings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view security findings" ON public.security_findings FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins create security findings" ON public.security_findings FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins update security findings" ON public.security_findings FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins delete security findings" ON public.security_findings FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE TRIGGER security_findings_updated_at BEFORE UPDATE ON public.security_findings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX security_findings_status_severity_idx ON public.security_findings(status, severity);
CREATE INDEX security_findings_owner_idx ON public.security_findings(owner);
CREATE INDEX security_scan_runs_scanned_at_idx ON public.security_scan_runs(scanned_at DESC);

WITH run AS (
  INSERT INTO public.security_scan_runs (scanned_at, source, scanner_version, status, issues_found, high_count, medium_count)
  VALUES ('2026-06-14T14:20:50Z', 'supabase_lov', '3.2', 'completed', 4, 3, 1)
  RETURNING id
)
INSERT INTO public.security_findings (external_id, scan_run_id, scanner, title, description, severity, status, owner, remediation, first_detected_at, last_detected_at, resolved_at)
SELECT v.external_id, run.id, 'supabase_lov', v.title, v.description, v.severity, 'resolved', v.owner, v.remediation, '2026-06-14T02:58:18Z', '2026-06-14T14:20:50Z', '2026-06-14T14:21:00Z'
FROM run CROSS JOIN (VALUES
 ('contest_entries_user_write_privilege_escalation','Contest entry score manipulation','Players could modify server-controlled score and ranking fields.','high','Platform Security','Restricted update grants and added a database trigger protecting score, rank, tiebreaker, ownership, contest, and creation fields.'),
 ('roster_picks_post_lock_modification','Roster changes after contest lock','Players could modify roster picks after contest lock.','high','Game Integrity','Added operation-specific policies requiring ownership, an open contest, a future lock time, and unlocked picks.'),
 ('user_roles_write_privilege','Role privilege escalation','Role records required explicit trusted-writer enforcement.','high','Identity & Access','Revoked all player write privileges. Role changes are restricted to trusted backend services.'),
 ('roster_picks_arbitrary_points','Arbitrary pick points on creation','Players could submit picks with preset point values.','medium','Game Integrity','Pick creation now requires points to equal zero.')
) AS v(external_id,title,description,severity,owner,remediation);

INSERT INTO public.security_scan_runs (scanned_at, source, scanner_version, status, issues_found)
VALUES
 ('2026-06-14T14:20:50Z','connector_security_scan','1.0','completed',0),
 ('2026-06-14T14:20:50Z','supabase','1.0','completed',0),
 ('2026-06-14T14:20:50Z','tanstack','2.0','completed',0);

WITH run AS (
  INSERT INTO public.security_scan_runs (scanned_at, source, scanner_version, status, issues_found, high_count, medium_count)
  VALUES ('2026-06-14T02:58:18Z', 'supabase_lov', '3.2', 'completed', 4, 2, 2)
  RETURNING id
)
INSERT INTO public.security_findings (external_id, scan_run_id, scanner, title, description, severity, status, owner, remediation, first_detected_at, last_detected_at, resolved_at)
SELECT v.external_id, run.id, 'supabase_lov', v.title, v.description, v.severity, 'resolved', v.owner, v.remediation, '2026-06-14T02:58:18Z', '2026-06-14T02:58:18Z', '2026-06-14T14:21:00Z'
FROM run CROSS JOIN (VALUES
 ('reward_ledger_no_write_restriction','Reward ledger write protection','Reward history required explicit trusted-writer enforcement.','medium','Platform Security','Revoked player write privileges and retained owner-scoped read access.'),
 ('user_wallets_no_write_policy','Wallet write protection','Wallet balances required explicit trusted-writer enforcement.','medium','Payments Security','Revoked player write privileges and retained owner-scoped read access.')
) AS v(external_id,title,description,severity,owner,remediation)
ON CONFLICT (scanner, external_id) DO NOTHING;