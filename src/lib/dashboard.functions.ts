import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getPlayerDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [profileResult, walletResult, entriesResult, badgesResult, rewardsResult, accountResult, identityResult] =
      await Promise.all([
        context.supabase
          .from("profiles")
          .select(
            "display_name, username, avatar_url, avatar_type, favorite_sport, favorite_team, preferred_league, fantasy_skill_level, onboarding_completed_at",
          )
          .eq("id", context.userId)
          .maybeSingle(),
        context.supabase
          .from("user_wallets")
          .select("fantasy_points, reward_credits, winnings_cents, promotional_tokens")
          .eq("user_id", context.userId)
          .maybeSingle(),
        context.supabase
          .from("contest_entries")
          .select(
            "id, entry_name, total_points, rank, submitted_at, contests(name, status, locks_at)",
          )
          .eq("user_id", context.userId)
          .order("created_at", { ascending: false })
          .limit(6),
        context.supabase
          .from("user_badges")
          .select("id, awarded_at, reward_badges(name, description, icon, tier)")
          .eq("user_id", context.userId)
          .order("awarded_at", { ascending: false })
          .limit(6),
        context.supabase
          .from("reward_ledger")
          .select("id, kind, amount, status, description, awarded_at")
          .eq("user_id", context.userId)
          .order("awarded_at", { ascending: false })
          .limit(8),
        context.supabase
          .from("account_verifications")
          .select("email_verified_at, phone_verified_at")
          .eq("user_id", context.userId)
          .maybeSingle(),
        context.supabase
          .from("identity_verifications")
          .select("status, government_id_status, selfie_match_status, location_status, tax_status")
          .eq("user_id", context.userId)
          .maybeSingle(),
      ]);
    const account = accountResult.data;
    const identity = identityResult.data;
    const isVerified = Boolean(account?.email_verified_at && account?.phone_verified_at);
    const isPrizeReady = Boolean(
      isVerified &&
        identity?.status === "verified" &&
        identity.government_id_status === "verified" &&
        identity.selfie_match_status === "verified" &&
        identity.location_status === "verified" &&
        ["verified", "not_required"].includes(identity.tax_status),
    );
    let avatarPreviewUrl = profileResult.data?.avatar_url ?? "";
    if (avatarPreviewUrl && !avatarPreviewUrl.startsWith("http")) {
      const { data } = await context.supabase.storage
        .from("profile-photos")
        .createSignedUrl(avatarPreviewUrl, 3600);
      avatarPreviewUrl = data?.signedUrl ?? "";
    }
    return {
      profile: profileResult.data,
      avatarPreviewUrl,
      access: {
        level: isPrizeReady ? 3 : isVerified ? 2 : 1,
        emailVerified: Boolean(account?.email_verified_at),
        phoneVerified: Boolean(account?.phone_verified_at),
        prizeReady: isPrizeReady,
      },
      wallet: walletResult.data ?? {
        fantasy_points: 0,
        reward_credits: 0,
        winnings_cents: 0,
        promotional_tokens: 0,
      },
      entries: entriesResult.data ?? [],
      badges: badgesResult.data ?? [],
      rewards: rewardsResult.data ?? [],
    };
  });
