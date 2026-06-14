ALTER TABLE public.profiles
ADD COLUMN avatar_type text NOT NULL DEFAULT 'custom_image';

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_avatar_type_check
CHECK (avatar_type IN ('real_photo', 'ai_avatar', 'cartoon_avatar', 'team_logo', 'custom_image'));

COMMENT ON COLUMN public.profiles.avatar_type IS 'User-selected fantasy identity image type; real photographs are optional.';