CREATE TABLE public.profile_upload_rejections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason_code TEXT NOT NULL CHECK (reason_code IN ('invalid_type', 'type_mismatch', 'oversized_bytes', 'oversized_pixels', 'invalid_dimensions', 'decode_timeout', 'decode_failed', 'too_blurry')),
  claimed_type TEXT,
  detected_type TEXT,
  byte_size INTEGER NOT NULL CHECK (byte_size >= 0),
  width INTEGER CHECK (width IS NULL OR width > 0),
  height INTEGER CHECK (height IS NULL OR height > 0),
  validation_duration_ms INTEGER NOT NULL CHECK (validation_duration_ms >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.profile_upload_rejections TO authenticated;
GRANT ALL ON public.profile_upload_rejections TO service_role;
ALTER TABLE public.profile_upload_rejections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can log own profile upload rejections"
ON public.profile_upload_rejections
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
CREATE INDEX profile_upload_rejections_user_created_idx
ON public.profile_upload_rejections (user_id, created_at DESC);