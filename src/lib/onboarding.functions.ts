import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const profileSchema = z.object({
  legalName: z.string().trim().max(120),
  username: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_]{3,30}$/),
  mobileNumber: z.string().trim().regex(/^\+[1-9][0-9]{7,14}$/),
  countryCode: z
    .string()
    .trim()
    .regex(/^[A-Z]{2}$/)
    .or(z.literal("")),
  region: z.string().trim().max(100),
  dateOfBirth: z.string().date().or(z.literal("")),
  favoriteSport: z.string().trim().min(1).max(80),
  favoriteTeam: z.string().trim().min(1).max(100),
  preferredLeague: z.string().trim().min(1).max(100),
  fantasySkillLevel: z.enum(["rookie", "intermediate", "advanced", "expert"]),
  avatarUrl: z.string().trim().max(500),
  avatarType: z
    .enum(["real_photo", "ai_avatar", "cartoon_avatar", "team_logo", "custom_image"])
    .default("custom_image"),
  ageConfirmed: z.boolean(),
  locationConfirmed: z.boolean(),
  acceptedPolicies: z.literal(true),
});

const draftSchema = z.object({
  legalName: z.string().trim().max(120),
  username: z.string().trim().max(30),
  mobileNumber: z.string().trim().max(20),
  countryCode: z.string().trim().max(2),
  region: z.string().trim().max(100),
  dateOfBirth: z.string().trim().max(10),
  favoriteSport: z.string().trim().max(80),
  favoriteTeam: z.string().trim().max(100),
  preferredLeague: z.string().trim().max(100),
  fantasySkillLevel: z.enum(["rookie", "intermediate", "advanced", "expert"]),
  avatarUrl: z.string().trim().max(500),
  avatarType: z
    .enum(["real_photo", "ai_avatar", "cartoon_avatar", "team_logo", "custom_image"])
    .default("custom_image"),
  step: z.number().int().min(0).max(2),
});

export const getOnboardingStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profile } = await context.supabase
      .from("profiles")
      .select(
        "legal_name, username, mobile_number, country_code, region, date_of_birth, favorite_sport, favorite_team, preferred_league, fantasy_skill_level, avatar_url, avatar_type, onboarding_step, onboarding_completed_at",
      )
      .eq("id", context.userId)
      .maybeSingle();
    const { data: userData } = await context.supabase.auth.getUser();
    const user = userData.user;
    const metadata = user?.user_metadata ?? {};
    let avatarPreviewUrl = profile?.avatar_url ?? "";
    if (
      profile?.avatar_url &&
      !profile.avatar_url.startsWith("http") &&
      !profile.avatar_url.startsWith("/")
    ) {
      const { data } = await context.supabase.storage
        .from("profile-photos")
        .createSignedUrl(profile.avatar_url, 3600);
      avatarPreviewUrl = data?.signedUrl ?? "";
    }
    return {
      email: user?.email ?? "",
      emailVerified: Boolean(user?.email_confirmed_at),
      completed: Boolean(profile?.onboarding_completed_at),
      savedStep: profile?.onboarding_step ?? 0,
      avatarPreviewUrl,
      profile,
      registration: {
        legalName:
          profile?.legal_name ??
          (typeof metadata.legal_name === "string" ? metadata.legal_name : ""),
        username:
          profile?.username ?? (typeof metadata.username === "string" ? metadata.username : ""),
        mobileNumber:
          user?.phone ?? (typeof metadata.mobile_number === "string" ? metadata.mobile_number : ""),
        countryCode:
          profile?.country_code ??
          (typeof metadata.country_code === "string" ? metadata.country_code : ""),
        region: profile?.region ?? (typeof metadata.region === "string" ? metadata.region : ""),
        dateOfBirth:
          profile?.date_of_birth ??
          (typeof metadata.date_of_birth === "string" ? metadata.date_of_birth : ""),
      },
    };
  });

export const saveOnboardingDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => draftSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("profiles").upsert({
      id: context.userId,
      legal_name: data.legalName || null,
      display_name: data.legalName || "CoachFace Player",
      username: data.username || `player_${context.userId.slice(0, 8)}`,
      mobile_number: data.mobileNumber || null,
      country_code: data.countryCode || null,
      region: data.region || null,
      date_of_birth: data.dateOfBirth || null,
      favorite_sport: data.favoriteSport || null,
      favorite_sports: data.favoriteSport ? [data.favoriteSport] : [],
      favorite_team: data.favoriteTeam || null,
      preferred_league: data.preferredLeague || null,
      fantasy_skill_level: data.fantasySkillLevel,
      avatar_url: data.avatarUrl || null,
      avatar_type: data.avatarType,
      onboarding_step: data.step,
    });
    if (error) {
      throw new Error(
        error.message.includes("username")
          ? "That username is already taken."
          : "We could not save your progress.",
      );
    }
    return { ok: true };
  });

export const completeOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => profileSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: userData } = await context.supabase.auth.getUser();
    const user = userData.user;
    const now = new Date().toISOString();
    const { error: profileError } = await context.supabase.from("profiles").upsert({
      id: context.userId,
      display_name: data.username,
      legal_name: data.legalName || null,
      username: data.username,
      mobile_number: data.mobileNumber || null,
      country_code: data.countryCode || null,
      region: data.region || null,
      location: data.region && data.countryCode ? `${data.region}, ${data.countryCode}` : null,
      date_of_birth: data.dateOfBirth || null,
      favorite_sport: data.favoriteSport,
      favorite_sports: [data.favoriteSport],
      favorite_team: data.favoriteTeam,
      preferred_league: data.preferredLeague,
      fantasy_skill_level: data.fantasySkillLevel,
      avatar_url: data.avatarUrl || null,
      avatar_type: data.avatarType,
      age_confirmed_at: data.ageConfirmed ? now : null,
      location_confirmed_at: data.locationConfirmed ? now : null,
      onboarding_completed_at: now,
      onboarding_step: 3,
    });
    if (profileError)
      throw new Error(
        profileError.message.includes("username")
          ? "That username is already taken."
          : "We could not save your profile.",
      );

    const documents = ["terms_of_service", "game_rules", "privacy_policy", "fair_play_policy"];
    const { error: consentError } = await context.supabase.from("user_consents").upsert(
      documents.map((documentType) => ({
        user_id: context.userId,
        document_type: documentType,
        document_version: "2026-01",
      })),
      { onConflict: "user_id,document_type,document_version" },
    );
    if (consentError) throw new Error("We could not record your policy acceptance.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await Promise.all([
      supabaseAdmin.from("account_verifications").upsert({
        user_id: context.userId,
        email_verified_at: user?.email_confirmed_at ?? null,
      }),
      supabaseAdmin.from("identity_verifications").upsert({ user_id: context.userId }),
      supabaseAdmin.from("user_wallets").upsert({ user_id: context.userId }),
    ]);
    return { ok: true };
  });
