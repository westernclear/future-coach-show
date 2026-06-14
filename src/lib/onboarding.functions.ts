import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const profileSchema = z.object({
  legalName: z.string().trim().min(1).max(120),
  username: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_]{3,30}$/),
  mobileNumber: z
    .string()
    .trim()
    .regex(/^\+[1-9][0-9]{7,14}$/),
  countryCode: z
    .string()
    .trim()
    .regex(/^[A-Z]{2}$/),
  region: z.string().trim().min(1).max(100),
  dateOfBirth: z.string().date(),
  favoriteSport: z.string().trim().min(1).max(80),
  favoriteTeam: z.string().trim().min(1).max(100),
  preferredLeague: z.string().trim().min(1).max(100),
  fantasySkillLevel: z.enum(["rookie", "intermediate", "advanced", "expert"]),
  avatarUrl: z.string().url().max(500).or(z.literal("")),
  ageConfirmed: z.literal(true),
  locationConfirmed: z.literal(true),
  acceptedPolicies: z.literal(true),
});

export const getOnboardingStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profile } = await context.supabase
      .from("profiles")
      .select(
        "legal_name, username, mobile_number, country_code, region, date_of_birth, favorite_sport, favorite_team, preferred_league, fantasy_skill_level, avatar_url, onboarding_completed_at",
      )
      .eq("id", context.userId)
      .maybeSingle();
    const { data: userData } = await context.supabase.auth.getUser();
    const user = userData.user;
    const metadata = user?.user_metadata ?? {};
    return {
      email: user?.email ?? "",
      emailVerified: Boolean(user?.email_confirmed_at),
      phoneVerified: Boolean(user?.phone_confirmed_at),
      completed: Boolean(profile?.onboarding_completed_at),
      profile,
      registration: {
        legalName: typeof metadata.legal_name === "string" ? metadata.legal_name : "",
        username: typeof metadata.username === "string" ? metadata.username : "",
        mobileNumber:
          user?.phone ?? (typeof metadata.mobile_number === "string" ? metadata.mobile_number : ""),
        countryCode: typeof metadata.country_code === "string" ? metadata.country_code : "",
        region: typeof metadata.region === "string" ? metadata.region : "",
        dateOfBirth: typeof metadata.date_of_birth === "string" ? metadata.date_of_birth : "",
      },
    };
  });

export const completeOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => profileSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: userData } = await context.supabase.auth.getUser();
    const user = userData.user;
    if (!user?.email_confirmed_at || !user.phone_confirmed_at) {
      throw new Error("Verify both your email and mobile number before continuing.");
    }

    const birthDate = new Date(`${data.dateOfBirth}T00:00:00Z`);
    const ageDate = new Date(Date.now() - birthDate.getTime());
    if (ageDate.getUTCFullYear() - 1970 < 18)
      throw new Error("You must be at least 18 years old to use CoachFace.");

    const now = new Date().toISOString();
    const { error: profileError } = await context.supabase.from("profiles").upsert({
      id: context.userId,
      display_name: data.legalName,
      legal_name: data.legalName,
      username: data.username,
      mobile_number: data.mobileNumber,
      country_code: data.countryCode,
      region: data.region,
      location: `${data.region}, ${data.countryCode}`,
      date_of_birth: data.dateOfBirth,
      favorite_sport: data.favoriteSport,
      favorite_sports: [data.favoriteSport],
      favorite_team: data.favoriteTeam,
      preferred_league: data.preferredLeague,
      fantasy_skill_level: data.fantasySkillLevel,
      avatar_url: data.avatarUrl || null,
      age_confirmed_at: now,
      location_confirmed_at: now,
      onboarding_completed_at: now,
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
      supabaseAdmin
        .from("account_verifications")
        .upsert({
          user_id: context.userId,
          email_verified_at: user.email_confirmed_at,
          phone_verified_at: user.phone_confirmed_at,
        }),
      supabaseAdmin.from("identity_verifications").upsert({ user_id: context.userId }),
      supabaseAdmin.from("user_wallets").upsert({ user_id: context.userId }),
    ]);
    return { ok: true };
  });
