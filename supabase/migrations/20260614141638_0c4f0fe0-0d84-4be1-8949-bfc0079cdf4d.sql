REVOKE ALL ON TABLE public.contest_entries FROM anon;
REVOKE ALL ON TABLE public.contest_entries FROM authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.contest_entries TO authenticated;
GRANT UPDATE (entry_name, submitted_at) ON TABLE public.contest_entries TO authenticated;
GRANT ALL ON TABLE public.contest_entries TO service_role;

DROP POLICY IF EXISTS "Users manage own entries" ON public.contest_entries;
CREATE POLICY "Users view own entries"
ON public.contest_entries FOR SELECT TO authenticated
USING (auth.uid() = user_id);
CREATE POLICY "Users create own entries"
ON public.contest_entries FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND total_points = 0
  AND rank IS NULL
);
CREATE POLICY "Users update own entry details"
ON public.contest_entries FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own entries"
ON public.contest_entries FOR DELETE TO authenticated
USING (auth.uid() = user_id);

REVOKE ALL ON TABLE public.roster_picks FROM anon;
REVOKE ALL ON TABLE public.roster_picks FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.roster_picks TO authenticated;
GRANT ALL ON TABLE public.roster_picks TO service_role;

DROP POLICY IF EXISTS "Users manage picks for own entries" ON public.roster_picks;
CREATE POLICY "Users view picks for own entries"
ON public.roster_picks FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.contest_entries e
    WHERE e.id = roster_picks.entry_id AND e.user_id = auth.uid()
  )
);
CREATE POLICY "Users create unlocked picks for own entries"
ON public.roster_picks FOR INSERT TO authenticated
WITH CHECK (
  locked_at IS NULL
  AND EXISTS (
    SELECT 1 FROM public.contest_entries e
    JOIN public.contests c ON c.id = e.contest_id
    WHERE e.id = roster_picks.entry_id
      AND e.user_id = auth.uid()
      AND c.status = 'open'
      AND c.locks_at > now()
  )
);
CREATE POLICY "Users update unlocked picks for own entries"
ON public.roster_picks FOR UPDATE TO authenticated
USING (
  locked_at IS NULL
  AND EXISTS (
    SELECT 1 FROM public.contest_entries e
    JOIN public.contests c ON c.id = e.contest_id
    WHERE e.id = roster_picks.entry_id
      AND e.user_id = auth.uid()
      AND c.status = 'open'
      AND c.locks_at > now()
  )
)
WITH CHECK (
  locked_at IS NULL
  AND EXISTS (
    SELECT 1 FROM public.contest_entries e
    JOIN public.contests c ON c.id = e.contest_id
    WHERE e.id = roster_picks.entry_id
      AND e.user_id = auth.uid()
      AND c.status = 'open'
      AND c.locks_at > now()
  )
);
CREATE POLICY "Users delete unlocked picks for own entries"
ON public.roster_picks FOR DELETE TO authenticated
USING (
  locked_at IS NULL
  AND EXISTS (
    SELECT 1 FROM public.contest_entries e
    JOIN public.contests c ON c.id = e.contest_id
    WHERE e.id = roster_picks.entry_id
      AND e.user_id = auth.uid()
      AND c.status = 'open'
      AND c.locks_at > now()
  )
);

REVOKE ALL ON TABLE public.reward_ledger FROM anon;
REVOKE ALL ON TABLE public.reward_ledger FROM authenticated;
GRANT SELECT ON TABLE public.reward_ledger TO authenticated;
GRANT ALL ON TABLE public.reward_ledger TO service_role;

REVOKE ALL ON TABLE public.user_wallets FROM anon;
REVOKE ALL ON TABLE public.user_wallets FROM authenticated;
GRANT SELECT ON TABLE public.user_wallets TO authenticated;
GRANT ALL ON TABLE public.user_wallets TO service_role;