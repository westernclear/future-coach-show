import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getPlayerDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [profileResult, walletResult, entriesResult, badgesResult, rewardsResult] = await Promise.all([
      context.supabase.from("profiles").select("display_name, username, favorite_sport, favorite_team, preferred_league, fantasy_skill_level, onboarding_completed_at").eq("id", context.userId).maybeSingle(),
      context.supabase.from("user_wallets").select("fantasy_points, reward_credits, winnings_cents, promotional_tokens").eq("user_id", context.userId).maybeSingle(),
      context.supabase.from("contest_entries").select("id, entry_name, total_points, rank, submitted_at, contests(name, status, locks_at)").eq("user_id", context.userId).order("created_at", { ascending: false }).limit(6),
      context.supabase.from("user_badges").select("id, awarded_at, reward_badges(name, description, icon, tier)").eq("user_id", context.userId).order("awarded_at", { ascending: false }).limit(6),
      context.supabase.from("reward_ledger").select("id, kind, amount, status, description, awarded_at").eq("user_id", context.userId).order("awarded_at", { ascending: false }).limit(8),
    ]);
    return {
      profile: profileResult.data,
      wallet: walletResult.data ?? { fantasy_points: 0, reward_credits: 0, winnings_cents: 0, promotional_tokens: 0 },
      entries: entriesResult.data ?? [],
      badges: badgesResult.data ?? [],
      rewards: rewardsResult.data ?? [],
    };
  });