import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Check,
  ChevronRight,
  Loader2,
  LockKeyhole,
  MailCheck,
  MapPinCheck,
  ShieldCheck,
  Smartphone,
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
import { completeOnboarding, getOnboardingStatus } from "@/lib/onboarding.functions";
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

const steps = ["Verify", "Profile", "Eligibility", "Ready"];

function OnboardingPage() {
  const navigate = useNavigate();
  const loadStatus = useServerFn(getOnboardingStatus);
  const saveOnboarding = useServerFn(completeOnboarding);
  const [status, setStatus] = useState<Awaited<ReturnType<typeof getOnboardingStatus>> | null>(
    null,
  );
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [phoneCode, setPhoneCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
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
    }));
    if (next.completed) setStep(3);
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const sendPhoneCode = async () => {
    setMessage(null);
    const { error } = await supabase.auth.updateUser({ phone: form.mobileNumber });
    if (error) {
      setMessage(error.message);
      return;
    }
    setCodeSent(true);
    setMessage("We sent a verification code to your mobile number.");
  };

  const verifyPhone = async () => {
    setMessage(null);
    const { error } = await supabase.auth.verifyOtp({
      phone: form.mobileNumber,
      token: phoneCode,
      type: "phone_change",
    });
    if (error) {
      setMessage(error.message);
      return;
    }
    await refresh();
    setMessage("Mobile number verified.");
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
          ageConfirmed: true,
          locationConfirmed: true,
          acceptedPolicies: true,
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
  const verified = Boolean(status?.emailVerified && status.phoneVerified);

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
              Verify once, personalize your profile, and start playing free fantasy games.
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
            {step === 0 && (
              <div>
                <p className="eyebrow">Step 1 of 4</p>
                <h2 className="mt-3 font-display text-4xl font-black uppercase">
                  Verify email and phone
                </h2>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="border border-border p-5">
                    <MailCheck className="size-6 text-primary" />
                    <h3 className="mt-4 font-bold">Email address</h3>
                    <p className="mt-1 break-all text-sm text-muted-foreground">{status?.email}</p>
                    <p className="mt-4 text-sm font-bold">
                      {status?.emailVerified ? "Verified" : "Check your inbox to confirm"}
                    </p>
                  </div>
                  <div className="border border-border p-5">
                    <Smartphone className="size-6 text-primary" />
                    <h3 className="mt-4 font-bold">Mobile number</h3>
                    <div className="mt-3 flex gap-2">
                      <Input
                        aria-label="Mobile number"
                        placeholder="+12125550123"
                        value={form.mobileNumber}
                        onChange={(event) => setForm({ ...form, mobileNumber: event.target.value })}
                      />
                      <Button type="button" onClick={sendPhoneCode}>
                        {status?.phoneVerified ? "Verified" : "Send code"}
                      </Button>
                    </div>
                    {codeSent && !status?.phoneVerified && (
                      <div className="mt-3 flex gap-2">
                        <Input
                          aria-label="SMS verification code"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="6-digit code"
                          value={phoneCode}
                          onChange={(event) => setPhoneCode(event.target.value.replace(/\D/g, ""))}
                        />
                        <Button variant="outline" type="button" onClick={verifyPhone}>
                          Verify
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                {message && (
                  <p role="status" className="mt-4 border border-border bg-secondary p-3 text-sm">
                    {message}
                  </p>
                )}
                <Button className="mt-8" size="lg" disabled={!verified} onClick={() => setStep(1)}>
                  Create profile <ChevronRight />
                </Button>
              </div>
            )}

            {step === 1 && (
              <div>
                <p className="eyebrow">Step 2 of 4</p>
                <h2 className="mt-3 font-display text-4xl font-black uppercase">
                  Build your CoachFace profile
                </h2>
                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  <Field label="Full legal name">
                    <Input
                      required
                      maxLength={120}
                      value={form.legalName}
                      onChange={(event) => setForm({ ...form, legalName: event.target.value })}
                    />
                  </Field>
                  <Field label="Username">
                    <Input
                      required
                      pattern="[A-Za-z0-9_]+"
                      minLength={3}
                      maxLength={30}
                      value={form.username}
                      onChange={(event) => setForm({ ...form, username: event.target.value })}
                    />
                  </Field>
                  <Field label="Favorite sport">
                    <Input
                      required
                      maxLength={80}
                      placeholder="Football"
                      value={form.favoriteSport}
                      onChange={(event) => setForm({ ...form, favoriteSport: event.target.value })}
                    />
                  </Field>
                  <Field label="Favorite team">
                    <Input
                      required
                      maxLength={100}
                      value={form.favoriteTeam}
                      onChange={(event) => setForm({ ...form, favoriteTeam: event.target.value })}
                    />
                  </Field>
                  <Field label="Preferred league">
                    <Input
                      required
                      maxLength={100}
                      placeholder="Premier League"
                      value={form.preferredLeague}
                      onChange={(event) =>
                        setForm({ ...form, preferredLeague: event.target.value })
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
                  <Field label="Profile photo URL">
                    <Input
                      type="url"
                      placeholder="https://"
                      value={form.avatarUrl}
                      onChange={(event) => setForm({ ...form, avatarUrl: event.target.value })}
                    />
                  </Field>
                </div>
                <Button
                  className="mt-8"
                  size="lg"
                  disabled={
                    !form.legalName ||
                    !form.username ||
                    !form.favoriteSport ||
                    !form.favoriteTeam ||
                    !form.preferredLeague
                  }
                  onClick={() => setStep(2)}
                >
                  Check eligibility <ChevronRight />
                </Button>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={finish}>
                <p className="eyebrow">Step 3 of 4</p>
                <h2 className="mt-3 font-display text-4xl font-black uppercase">
                  Confirm eligibility
                </h2>
                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  <Field label="Country code">
                    <Input
                      required
                      minLength={2}
                      maxLength={2}
                      placeholder="US"
                      value={form.countryCode}
                      onChange={(event) =>
                        setForm({ ...form, countryCode: event.target.value.toUpperCase() })
                      }
                    />
                  </Field>
                  <Field label="State or region">
                    <Input
                      required
                      maxLength={100}
                      value={form.region}
                      onChange={(event) => setForm({ ...form, region: event.target.value })}
                    />
                  </Field>
                  <Field label="Date of birth">
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
                    I confirm that I am at least 18 years old.
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
                    I agree to the CoachFace Terms of Service, Game Rules, Privacy Policy, and Fair
                    Play Policy.
                  </Consent>
                </div>
                <div className="mt-6 border-l-2 border-primary bg-secondary/60 p-4 text-sm text-muted-foreground">
                  <strong className="text-foreground">Free play starts now.</strong> Identity
                  verification is requested only before paid entry, cash prizes, token rewards, or
                  withdrawals.
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
                  disabled={loading || !ageConfirmed || !locationConfirmed || !acceptedPolicies}
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
