DROP POLICY IF EXISTS "Users create unlocked picks for own entries" ON public.roster_picks;
CREATE POLICY "Users create unlocked picks for own entries"
ON public.roster_picks FOR INSERT TO authenticated
WITH CHECK (
  locked_at IS NULL
  AND points = 0
  AND EXISTS (
    SELECT 1 FROM public.contest_entries e
    JOIN public.contests c ON c.id = e.contest_id
    WHERE e.id = roster_picks.entry_id
      AND e.user_id = auth.uid()
      AND c.status = 'open'
      AND c.locks_at > now()
  )
);