
DROP POLICY "Users delete own entries" ON public.contest_entries;
CREATE POLICY "Users delete own entries"
ON public.contest_entries
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
  AND submitted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM contests c
    WHERE c.id = contest_entries.contest_id
      AND c.status = 'open'::contest_status
      AND c.locks_at > now()
  )
);

DROP POLICY "Users update own entry details" ON public.contest_entries;
CREATE POLICY "Users update own entry details"
ON public.contest_entries
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND submitted_at IS NULL)
WITH CHECK (
  auth.uid() = user_id
  AND total_points = (0)::numeric
  AND rank IS NULL
  AND submitted_at IS NULL
);
