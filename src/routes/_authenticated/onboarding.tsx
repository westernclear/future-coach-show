import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Check,
  ChevronRight,
  CircleCheck,
  Loader2,
  LockKeyhole,
  MailCheck,
  MapPinCheck,
  ShieldCheck,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  completeOnboarding,
  getOnboardingStatus,
  saveOnboardingDraft,
} from "@/lib/onboarding.functions";
import { validateProfileImageUpload } from "@/lib/profile-editor.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Set Up Your CoachFace Account" },
      {
        name: "description",
        content:
          "Verify your account, build your CoachFace profile, and confirm free-play eligibility.",
      },
    ],
  }),
  component: OnboardingPage,
});

const steps = ["Verify email", "Profile", "Eligibility", "Ready"];

function OnboardingPage() {
  const navigate = useNavigate();
  const loadStatus = useServerFn(getOnboardingStatus);
  const saveOnboarding = useServerFn(completeOnboarding);
  const saveDraft = useServerFn(saveOnboardingDraft);
  const validateUpload = useServerFn(validateProfileImageUpload);
  const [status, setStatus] = useState<Awaited<ReturnType<typeof getOnboardingStatus>> | null>(
    null,
  );
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [form, setForm] = useState({
    legalName: "",
    username: "",
    mobileNumber: "",
    countryCode: "",
    region: "",
    dateOfBirth: "",
    favoriteSport: "",
    favoriteTeam: "",
    preferredLeague: "",
    fantasySkillLevel: "rookie",
    avatarUrl: "",
    avatarType: "custom_image",
  });
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);

  const refresh = async () => {
    const next = await loadStatus();
    setStatus(next);
    setForm((current) => ({
      ...current,
      ...next.registration,
      favoriteSport: next.profile?.favorite_sport ?? current.favoriteSport,
      favoriteTeam: next.profile?.favorite_team ?? current.favoriteTeam,
      preferredLeague: next.profile?.preferred_league ?? current.preferredLeague,
      fantasySkillLevel: next.profile?.fantasy_skill_level ?? current.fantasySkillLevel,
      avatarUrl: next.profile?.avatar_url ?? current.avatarUrl,
      avatarType: next.profile?.avatar_type ?? current.avatarType,
    }));
    setAvatarPreview(next.avatarPreviewUrl);
    setStep(next.completed ? 3 : Math.min(next.savedStep, 2));
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    if (!status || loading || status.completed || step === 3) return;
    setSaveState("saving");
    const timer = window.setTimeout(async () => {
      try {
        await saveDraft({
          data: {
            ...form,
            fantasySkillLevel: form.fantasySkillLevel as
              | "rookie"
              | "intermediate"
              | "advanced"
              | "expert",
            avatarType: form.avatarType as
              | "real_photo"
              | "ai_avatar"
              | "cartoon_avatar"
              | "team_logo"
              | "custom_image",
            step,
          },
        });
        setSaveState("saved");
      } catch {
        setSaveState("idle");
      }
    }, 700);
    return () => window.clearTimeout(timer);
  }, [form, step, status, loading]);

  const uploadPhoto = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      setMessage("Choose a JPG, PNG, or WebP image smaller than 5 MB.");
      return;
    }
    setUploadingPhoto(true);
    setMessage(null);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setMessage("Please sign in again before uploading a photo.");
      setUploadingPhoto(false);
      return;
    }
    try {
      const bytes = Array.from(new Uint8Array(await file.arrayBuffer()));
      await validateUpload({ data: { bytes, claimedType: file.type } });
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "That image could not be validated. Choose a different photo.",
      );
      setUploadingPhoto(false);
      return;
    }
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/avatar.${extension}`;
    const { error } = await supabase.storage
      .from("profile-photos")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) {
      setMessage("We could not upload that photo. Please try again.");
    } else {
      const { data } = await supabase.storage.from("profile-photos").createSignedUrl(path, 3600);
      setForm((current) => ({ ...current, avatarUrl: path }));
      setAvatarPreview(data?.signedUrl ?? URL.createObjectURL(file));
    }
    setUploadingPhoto(false);
  };

  const continueToEligibility = (profileForm: HTMLFormElement | null) => {
    if (!profileForm) return;
    const values = new FormData(profileForm);
    const nextProfile = {
      legalName: String(values.get("cfLegalName") ?? "").trim(),
      username: String(values.get("cfUsername") ?? "").trim(),
      mobileNumber: String(values.get("cfMobileNumber") ?? "").trim(),
      favoriteSport: String(values.get("cfFavoriteSport") ?? "").trim(),
      favoriteTeam: String(values.get("cfFavoriteTeam") ?? "").trim(),
      preferredLeague: String(values.get("cfPreferredLeague") ?? "").trim(),
    };
    const missingField = [
      nextProfile.username,
      nextProfile.mobileNumber,
      nextProfile.favoriteSport,
      nextProfile.favoriteTeam,
      nextProfile.preferredLeague,
    ].some((value) => !value);
    if (missingField) {
      setMessage("Complete all required profile fields before checking eligibility.");
      return;
    }
    setForm((current) => ({
      ...current,
      ...nextProfile,
    }));
    setMessage(null);
    setStep(2);
  };

  const finish = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await saveOnboarding({
        data: {
          ...form,
          fantasySkillLevel: form.fantasySkillLevel as
            | "rookie"
            | "intermediate"
            | "advanced"
            | "expert",
            avatarType: form.avatarType as
              | "real_photo"
              | "ai_avatar"
              | "cartoon_avatar"
              | "team_logo"
              | "custom_image",
          ageConfirmed,
          locationConfirmed,
          acceptedPolicies,
        },
      });
      setStep(3);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not complete onboarding.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !status)
    return (
      <main className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="size-7 animate-spin text-primary" />
      </main>
    );
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-foreground text-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-sm bg-primary font-display text-xl font-black text-primary-foreground">
              CF
            </span>
            <span className="font-display text-xl font-black uppercase">CoachFace</span>
          </div>
          <p className="text-sm text-game-muted">Secure player setup</p>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
          <aside>
            <p className="eyebrow">Player onboarding</p>
            <h1 className="mt-3 font-display text-5xl font-black uppercase leading-[0.9]">
              Get game ready.
            </h1>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
               Build a fantasy coaching identity now. Add verification only when you want verified status or prize access.
            </p>
            <ol className="mt-8 border-y border-border">
              {steps.map((label, index) => (
                <li
                  key={label}
                  className={cn(
                    "flex items-center gap-3 border-b border-border py-4 last:border-b-0",
                    index === step ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-7 place-items-center rounded-full border text-xs font-bold",
                      index < step
                        ? "border-primary bg-primary text-primary-foreground"
                        : index === step
                          ? "border-primary"
                          : "border-border",
                    )}
                  >
                    {index < step ? <Check className="size-4" /> : index + 1}
                  </span>
                  <span className="font-bold">{label}</span>
                </li>
              ))}
            </ol>
          </aside>

          <section className="border-t-4 border-primary bg-card p-6 shadow-sm sm:p-10">
            {step > 0 && step < 3 && (
              <div
                className="mb-6 flex justify-end text-xs font-bold text-muted-foreground"
                aria-live="polite"
              >
                {saveState === "saving" ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-3.5 animate-spin" /> Saving progress
                  </span>
                ) : saveState === "saved" ? (
                  <span className="flex items-center gap-2">
                    <CircleCheck className="size-3.5 text-primary" /> Progress saved
                  </span>
                ) : null}
              </div>
            )}
            {step === 0 && (
              <div>
                <p className="eyebrow">Step 1 of 4</p>
                <h2 className="mt-3 font-display text-4xl font-black uppercase">Verify email</h2>
                <div className="mt-8 max-w-md border border-border p-5">
                  <MailCheck className="size-6 text-primary" />
                  <h3 className="mt-4 font-bold">Email address</h3>
                  <p className="mt-1 break-all text-sm text-muted-foreground">{status?.email}</p>
                   <p className="mt-4 text-sm font-bold">{status?.emailVerified ? "Verified" : "Added, verification available later"}</p>
                </div>
                {message && (
                  <p role="status" className="mt-4 border border-border bg-secondary p-3 text-sm">
                    {message}
                  </p>
                )}
                 <Button className="mt-8" size="lg" onClick={() => setStep(1)}>
                  Create profile <ChevronRight />
                </Button>
              </div>
            )}

            {step === 1 && (
              <form
                noValidate
                autoComplete="off"
                onSubmit={(event) => {
                  event.preventDefault();
                  continueToEligibility(event.currentTarget);
                }}
              >
                <p className="eyebrow">Step 2 of 4</p>
                <h2 className="mt-3 font-display text-4xl font-black uppercase">
                  Build your CoachFace profile
                </h2>
                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                   <Field label="Legal name (optional until prize play)">
                    <Input
                      name="cfLegalName"
                      autoComplete="off"
                      maxLength={120}
                      defaultValue={form.legalName}
                      onInput={(event) =>
                        setForm((current) => ({ ...current, legalName: event.currentTarget.value }))
                      }
                    />
                  </Field>
                   <Field label="Mobile number">
                     <Input
                       name="cfMobileNumber"
                       type="tel"
                       required
                       placeholder="+12125550123"
                       value={form.mobileNumber}
                       onChange={(event) => setForm({ ...form, mobileNumber: event.target.value })}
                     />
                   </Field>
                  <Field label="Username">
                    <Input
                      name="cfUsername"
                      autoComplete="off"
                      required
                      pattern="[A-Za-z0-9_]+"
                      minLength={3}
                      maxLength={30}
                      defaultValue={form.username}
                      onInput={(event) =>
                        setForm((current) => ({ ...current, username: event.currentTarget.value }))
                      }
                    />
                  </Field>
                  <Field label="Favorite sport">
                    <Input
                      name="cfFavoriteSport"
                      autoComplete="off"
                      required
                      maxLength={80}
                      placeholder="Football"
                      defaultValue={form.favoriteSport}
                      onInput={(event) =>
                        setForm((current) => ({
                          ...current,
                          favoriteSport: event.currentTarget.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Favorite team">
                    <Input
                      name="cfFavoriteTeam"
                      autoComplete="off"
                      required
                      maxLength={100}
                      defaultValue={form.favoriteTeam}
                      onInput={(event) =>
                        setForm((current) => ({
                          ...current,
                          favoriteTeam: event.currentTarget.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Preferred league">
                    <Input
                      name="cfPreferredLeague"
                      autoComplete="off"
                      required
                      maxLength={100}
                      placeholder="Premier League"
                      defaultValue={form.preferredLeague}
                      onInput={(event) =>
                        setForm((current) => ({
                          ...current,
                          preferredLeague: event.currentTarget.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Fantasy skill level">
                    <Select
                      value={form.fantasySkillLevel}
                      onValueChange={(value) => setForm({ ...form, fantasySkillLevel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rookie">Rookie</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                   <Field label="Fantasy identity image">
                     <Select
                       value={form.avatarType}
                       onValueChange={(value) => setForm({ ...form, avatarType: value })}
                     >
                       <SelectTrigger><SelectValue /></SelectTrigger>
                       <SelectContent>
                         <SelectItem value="ai_avatar">AI avatar</SelectItem>
                         <SelectItem value="cartoon_avatar">Cartoon avatar</SelectItem>
                         <SelectItem value="team_logo">Team logo</SelectItem>
                         <SelectItem value="real_photo">Real photo</SelectItem>
                         <SelectItem value="custom_image">Custom graphic</SelectItem>
                       </SelectContent>
                     </Select>
                    <div className="flex items-center gap-4">
                      <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-secondary">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Profile preview"
                            className="size-full object-cover"
                          />
                        ) : (
                          <span className="font-display text-lg font-black text-muted-foreground">
                            CF
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Label
                          htmlFor="profile-photo"
                          className="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-input px-3 text-sm font-medium hover:bg-accent"
                        >
                          {uploadingPhoto ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Upload className="size-4" />
                          )}
                           {avatarPreview ? "Replace image" : "Upload image"}
                        </Label>
                        <Input
                          id="profile-photo"
                          className="sr-only"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          disabled={uploadingPhoto}
                          onChange={(event) => void uploadPhoto(event.target.files?.[0])}
                        />
                        <p className="mt-2 text-xs text-muted-foreground">
                           Your real photograph is never required. Upload the image type you selected. JPG, PNG, or WebP, max 5 MB.
                        </p>
                      </div>
                    </div>
                  </Field>
                </div>
                {message && (
                  <p role="alert" className="mt-5 text-sm font-medium text-destructive">
                    {message}
                  </p>
                )}
                <Button
                  className="mt-8"
                  size="lg"
                  type="submit"
                >
                  Check eligibility <ChevronRight />
                </Button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={finish}>
                <p className="eyebrow">Step 3 of 4</p>
                <h2 className="mt-3 font-display text-4xl font-black uppercase">
                   Choose your access level
                </h2>
                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                   <Field label="Country code (optional for free play)">
                    <Input
                      minLength={2}
                      maxLength={2}
                      placeholder="US"
                      value={form.countryCode}
                      onChange={(event) =>
                        setForm({ ...form, countryCode: event.target.value.toUpperCase() })
                      }
                    />
                  </Field>
                   <Field label="State or region (optional for free play)">
                    <Input
                      maxLength={100}
                      value={form.region}
                      onChange={(event) => setForm({ ...form, region: event.target.value })}
                    />
                  </Field>
                   <Field label="Date of birth (optional for free play)">
                    <Input
                      required
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value })}
                    />
                  </Field>
                </div>
                <div className="mt-8 space-y-4 border-y border-border py-6">
                   <Consent checked={ageConfirmed} onChange={setAgeConfirmed} icon={<ShieldCheck />}>
                     I confirm that I am at least 18 years old (required before prize play).
                  </Consent>
                  <Consent
                    checked={locationConfirmed}
                    onChange={setLocationConfirmed}
                    icon={<MapPinCheck />}
                  >
                    I confirm my current country and state or region are accurate.
                  </Consent>
                  <Consent
                    checked={acceptedPolicies}
                    onChange={setAcceptedPolicies}
                    icon={<LockKeyhole />}
                  >
                    I agree to the CoachFace{" "}
                    <Link to="/terms" target="_blank" className="font-bold underline underline-offset-2">
                      Terms of Service
                    </Link>
                    ,{" "}
                    <Link to="/game-rules" target="_blank" className="font-bold underline underline-offset-2">
                      Game Rules
                    </Link>
                    ,{" "}
                    <Link to="/privacy" target="_blank" className="font-bold underline underline-offset-2">
                      Privacy Policy
                    </Link>
                    , and{" "}
                    <Link to="/fair-play" target="_blank" className="font-bold underline underline-offset-2">
                      Fair Play Policy
                    </Link>
                    .
                  </Consent>
                </div>
                 <div className="mt-6 grid gap-3 sm:grid-cols-3">
                   <AccessLevel title="Level 1 · Casual" text="Username, contact details, avatar, sport, and team. Free play starts immediately." />
                   <AccessLevel title="Level 2 · Verified" text="Verified email and phone unlock the CoachFace Verified badge." />
                   <AccessLevel title="Level 3 · Prize" text="ID, selfie, age, location, and tax checks unlock eligible cash contests and withdrawals." />
                </div>
                {message && (
                  <p role="alert" className="mt-4 text-sm text-destructive">
                    {message}
                  </p>
                )}
                <Button
                  className="mt-8"
                  size="lg"
                  type="submit"
                   disabled={loading || !acceptedPolicies}
                >
                  {loading && <Loader2 className="animate-spin" />} Complete setup
                </Button>
              </form>
            )}

            {step === 3 && (
              <div className="py-8 text-center">
                <span className="mx-auto grid size-16 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-8" />
                </span>
                <p className="eyebrow mt-7">Setup complete</p>
                <h2 className="mt-3 font-display text-5xl font-black uppercase">
                  Welcome to CoachFace.
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
                  Your free-play account, profile, wallet, and points balance are ready. Identity
                  verification stays off until a money or reward feature requires it.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Button size="lg" onClick={() => navigate({ to: "/play" })}>
                    Play free fantasy <ChevronRight />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate({ to: "/dashboard" })}
                  >
                    Open dashboard
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
function AccessLevel({ title, text }: { title: string; text: string }) {
  return (
    <div className="border border-border bg-secondary/40 p-4">
      <h3 className="font-bold">{title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}
function Consent({
  checked,
  onChange,
  icon,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onChange(value === true)}
        className="mt-0.5"
      />
      <span className="mt-0.5 text-primary [&_svg]:size-5">{icon}</span>
      <span className="text-sm leading-relaxed">{children}</span>
    </label>
  );
}
