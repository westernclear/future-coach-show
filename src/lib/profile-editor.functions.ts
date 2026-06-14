import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  calculateBlurScore,
  detectImageType,
  PROFILE_IMAGE_BLUR_THRESHOLD,
  PROFILE_IMAGE_DECODE_TIMEOUT_MS,
  PROFILE_IMAGE_MAX_BYTES,
  PROFILE_IMAGE_MAX_PIXELS,
  readEncodedImageDimensions,
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
  bytes: z.array(z.number().int().min(0).max(255)).min(1).max(PROFILE_IMAGE_MAX_BYTES + 1024 * 1024),
  claimedType: z.enum(["image/jpeg", "image/png", "image/webp"]),
});

type RejectionCode = "invalid_type" | "type_mismatch" | "oversized_bytes" | "oversized_pixels" | "invalid_dimensions" | "decode_timeout" | "decode_failed" | "too_blurry";

class UploadRejection extends Error {
  constructor(public readonly code: RejectionCode, message: string) {
    super(message);
  }
}

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
  .handler(async ({ data, context }) => {
    const startedAt = Date.now();
    const bytes = Uint8Array.from(data.bytes);
    const detectedType = detectImageType(bytes);
    let dimensions: { width: number; height: number } | null = null;
    try {
      if (bytes.byteLength > PROFILE_IMAGE_MAX_BYTES) {
        throw new UploadRejection("oversized_bytes", "Choose an image smaller than 5 MB.");
      }
      if (!detectedType) {
        throw new UploadRejection("invalid_type", "That file is not a valid JPG, PNG, or WebP image.");
      }
      if (detectedType !== data.claimedType) {
        throw new UploadRejection("type_mismatch", "That file's contents do not match its image type.");
      }
      dimensions = readEncodedImageDimensions(bytes, detectedType);
      if (!dimensions) {
        throw new UploadRejection("invalid_dimensions", "That image has invalid or unreadable dimensions.");
      }
      const headerDimensionError = validateImageDimensions(dimensions.width, dimensions.height);
      if (headerDimensionError) {
        throw new UploadRejection(
          dimensions.width * dimensions.height > PROFILE_IMAGE_MAX_PIXELS ? "oversized_pixels" : "invalid_dimensions",
          headerDimensionError,
        );
      }
      const { Image } = await import("cross-image");
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      const timeout = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new UploadRejection("decode_timeout", "That image took too long to decode. Choose a smaller image.")),
          PROFILE_IMAGE_DECODE_TIMEOUT_MS,
        );
      });
      const image = await Promise.race([Image.decode(bytes), timeout]).finally(() => {
        if (timeoutId) clearTimeout(timeoutId);
      });
      const dimensionError = validateImageDimensions(image.width, image.height);
      if (dimensionError || image.width !== dimensions.width || image.height !== dimensions.height) {
        throw new UploadRejection(
          image.width * image.height > PROFILE_IMAGE_MAX_PIXELS ? "oversized_pixels" : "invalid_dimensions",
          dimensionError ?? "That image's decoded dimensions do not match its header.",
        );
      }
      if (calculateBlurScore(image.data, image.width, image.height) < PROFILE_IMAGE_BLUR_THRESHOLD) {
        throw new UploadRejection("too_blurry", "That image is too blurry. Choose a sharper photo or graphic.");
      }
      return { ok: true, width: image.width, height: image.height, detectedType };
    } catch (error) {
      const rejection = error instanceof UploadRejection
        ? error
        : new UploadRejection("decode_failed", "That file could not be decoded as a supported image.");
      const { error: auditError } = await context.supabase.from("profile_upload_rejections").insert({
        user_id: context.userId,
        reason_code: rejection.code,
        claimed_type: data.claimedType,
        detected_type: detectedType,
        byte_size: bytes.byteLength,
        width: dimensions?.width ?? null,
        height: dimensions?.height ?? null,
        validation_duration_ms: Date.now() - startedAt,
      });
      if (auditError) {
        console.error("Profile upload rejection audit failed", { reasonCode: rejection.code, userId: context.userId });
      }
      throw new Error(rejection.message);
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