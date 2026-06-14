import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  calculateBlurScore,
  detectImageType,
  PROFILE_IMAGE_BLUR_THRESHOLD,
  PROFILE_IMAGE_MAX_BYTES,
  validateImageDimensions,
} from "@/lib/profile-image-validation";

const avatarTypeSchema = z.enum([
  "real_photo",
  "ai_avatar",
  "cartoon_avatar",
  "team_logo",
  "custom_image",
]);

const updateProfileSchema = z.object({
  username: z.string().trim().regex(/^[A-Za-z0-9_]{3,30}$/),
  favoriteSport: z.string().trim().min(1).max(80),
  favoriteTeam: z.string().trim().min(1).max(100),
  preferredLeague: z.string().trim().max(100),
  fantasySkillLevel: z.enum(["rookie", "intermediate", "advanced", "expert"]),
  avatarUrl: z.string().trim().max(500),
  avatarType: avatarTypeSchema,
});

const validateUploadSchema = z.object({
  bytes: z.array(z.number().int().min(0).max(255)).min(1).max(PROFILE_IMAGE_MAX_BYTES),
  claimedType: z.enum(["image/jpeg", "image/png", "image/webp"]),
});

export const getProfileEditor = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profile, error } = await context.supabase
      .from("profiles")
      .select(
        "username, display_name, favorite_sport, favorite_team, preferred_league, fantasy_skill_level, avatar_url, avatar_type",
      )
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error("We could not load your profile.");

    let avatarPreviewUrl = profile?.avatar_url ?? "";
    if (
      avatarPreviewUrl &&
      !avatarPreviewUrl.startsWith("http") &&
      !avatarPreviewUrl.startsWith("/")
    ) {
      const { data } = await context.supabase.storage
        .from("profile-photos")
        .createSignedUrl(avatarPreviewUrl, 3600);
      avatarPreviewUrl = data?.signedUrl ?? "";
    }
    return { profile, avatarPreviewUrl };
  });

export const validateProfileImageUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => validateUploadSchema.parse(input))
  .handler(async ({ data }) => {
    const bytes = Uint8Array.from(data.bytes);
    const detectedType = detectImageType(bytes);
    if (!detectedType || detectedType !== data.claimedType) {
      throw new Error("That file is not a valid JPG, PNG, or WebP image.");
    }
    try {
      const { Image } = await import("cross-image");
      const image = await Image.decode(bytes);
      const dimensionError = validateImageDimensions(image.width, image.height);
      if (dimensionError) throw new Error(dimensionError);
      if (calculateBlurScore(image.data, image.width, image.height) < PROFILE_IMAGE_BLUR_THRESHOLD) {
        throw new Error("That image is too blurry. Choose a sharper photo or graphic.");
      }
      return { ok: true, width: image.width, height: image.height, detectedType };
    } catch (error) {
      if (error instanceof Error && (error.message.startsWith("That image") || error.message.startsWith("Choose an image"))) {
        throw error;
      }
      throw new Error("That file could not be decoded as a supported image.");
    }
  });

export const updateProfileEditor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => updateProfileSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({
        username: data.username,
        display_name: data.username,
        favorite_sport: data.favoriteSport,
        favorite_sports: [data.favoriteSport],
        favorite_team: data.favoriteTeam,
        preferred_league: data.preferredLeague || null,
        fantasy_skill_level: data.fantasySkillLevel,
        avatar_url: data.avatarUrl || null,
        avatar_type: data.avatarType,
      })
      .eq("id", context.userId);
    if (error) {
      throw new Error(
        error.message.includes("username")
          ? "That CoachFace name is already taken."
          : "We could not save your profile.",
      );
    }
    return { ok: true };
  });