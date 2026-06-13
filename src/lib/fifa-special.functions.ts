import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const entrySchema = z.object({
  entryName: z.string().trim().min(1).max(80),
  coachSlugs: z.array(z.string().regex(/^[a-z0-9-]+$/)).length(3).refine((slugs) => new Set(slugs).size === 3),
});

export const submitFifaSpecialEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => entrySchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;
    const now = new Date();
    const { data: contest, error: contestError } = await supabase
      .from("contests")
      .select("id, status, locks_at, roster_size")
      .eq("slug", "fifa-coaches-special-2026")
      .eq("is_published", true)
      .single();

    if (contestError || !contest) throw new Error("The FIFA Coaches Special is not available.");
    if (contest.status !== "open" || now >= new Date(contest.locks_at)) throw new Error("Entries for this contest are locked.");
    if (data.coachSlugs.length !== contest.roster_size) throw new Error(`Select exactly ${contest.roster_size} coaches.`);

    const { data: coaches, error: coachesError } = await supabase
      .from("coaches")
      .select("id, slug, metadata")
      .in("slug", data.coachSlugs)
      .eq("status", "active");
    if (coachesError || !coaches || coaches.length !== 3) throw new Error("One or more selected coaches are unavailable.");

    const groupCounts = coaches.reduce<Record<string, number>>((counts, coach) => {
      const metadata = coach.metadata && typeof coach.metadata === "object" && !Array.isArray(coach.metadata) ? coach.metadata : {};
      const group = typeof metadata.group === "string" ? metadata.group : "unknown";
      counts[group] = (counts[group] ?? 0) + 1;
      return counts;
    }, {});
    if (Object.values(groupCounts).some((count) => count > 2)) throw new Error("Choose no more than two coaches from the same group.");

    const email = typeof claims.email === "string" ? claims.email : "CoachFace player";
    const defaultUsername = `coach_${userId.replaceAll("-", "").slice(0, 12)}`;
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      username: defaultUsername,
      display_name: email.split("@")[0]?.slice(0, 80) || "CoachFace player",
    }, { onConflict: "id", ignoreDuplicates: true });
    if (profileError) throw new Error("We could not finish your player registration.");

    const { data: existingEntry } = await supabase
      .from("contest_entries")
      .select("id")
      .eq("contest_id", contest.id)
      .eq("user_id", userId)
      .maybeSingle();

    let entryId = existingEntry?.id;
    if (entryId) {
      const { error } = await supabase.from("contest_entries").update({ entry_name: data.entryName, submitted_at: now.toISOString() }).eq("id", entryId);
      if (error) throw new Error("We could not update your entry.");
      const { error: deleteError } = await supabase.from("roster_picks").delete().eq("entry_id", entryId);
      if (deleteError) throw new Error("We could not update your roster.");
    } else {
      const { data: entry, error } = await supabase.from("contest_entries").insert({
        contest_id: contest.id,
        user_id: userId,
        entry_name: data.entryName,
        submitted_at: now.toISOString(),
      }).select("id").single();
      if (error || !entry) throw new Error("We could not create your entry.");
      entryId = entry.id;
    }

    const coachBySlug = new Map(coaches.map((coach) => [coach.slug, coach.id]));
    const picks = data.coachSlugs.map((slug, index) => ({
      entry_id: entryId,
      coach_id: coachBySlug.get(slug) ?? "",
      slot: `coach_${index + 1}`,
    }));
    const { error: picksError } = await supabase.from("roster_picks").insert(picks);
    if (picksError) throw new Error("We could not save your selected coaches.");

    return { ok: true, entryId, submittedAt: now.toISOString() };
  });