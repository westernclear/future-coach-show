ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_step smallint NOT NULL DEFAULT 0;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_onboarding_step_range CHECK (onboarding_step BETWEEN 0 AND 3);