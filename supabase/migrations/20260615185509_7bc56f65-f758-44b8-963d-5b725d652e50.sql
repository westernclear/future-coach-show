
-- 1) Allow users to read their own profile upload rejection history
CREATE POLICY "Users view own profile upload rejections"
ON public.profile_upload_rejections
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2) Lock down contest_entries UPDATE so users cannot change scoring fields
DROP POLICY "Users update own entry details" ON public.contest_entries;
CREATE POLICY "Users update own entry details"
ON public.contest_entries
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND total_points = (0)::numeric
  AND rank IS NULL
  AND submitted_at IS NULL
);

-- 3) Force points = 0 in roster_picks UPDATE WITH CHECK
DROP POLICY "Users update unlocked picks for own entries" ON public.roster_picks;
CREATE POLICY "Users update unlocked picks for own entries"
ON public.roster_picks
FOR UPDATE
TO authenticated
USING (
  (locked_at IS NULL) AND (EXISTS (
    SELECT 1 FROM contest_entries e
    JOIN contests c ON c.id = e.contest_id
    WHERE e.id = roster_picks.entry_id
      AND e.user_id = auth.uid()
      AND c.status = 'open'::contest_status
      AND c.locks_at > now()
  ))
)
WITH CHECK (
  (locked_at IS NULL)
  AND (points = (0)::numeric)
  AND (EXISTS (
    SELECT 1 FROM contest_entries e
    JOIN contests c ON c.id = e.contest_id
    WHERE e.id = roster_picks.entry_id
      AND e.user_id = auth.uid()
      AND c.status = 'open'::contest_status
      AND c.locks_at > now()
  ))
);
