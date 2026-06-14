import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

const signupMetadataSchema = z.object({
  legal_name: z.string().trim().min(1).max(120),
  username: z.string().trim().regex(/^[A-Za-z0-9_]{3,30}$/),
});

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ redirect: z.string().startsWith("/").optional() }),
  head: () => ({
    meta: [
      { title: "Sign in | CoachFace" },
      { name: "description", content: "Sign in or create your CoachFace account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [legalName, setLegalName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const result =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/onboarding`,
              data: signupMetadataSchema.parse({
                legal_name: legalName.trim(),
                username: username.trim(),
              }),
            },
          });

    setLoading(false);
    if (result.error) {
      setMessage(result.error.message);
      return;
    }
    if (mode === "signup" && !result.data.session) {
      setMessage("Check your email to confirm your account, then return to sign in.");
      return;
    }
    await navigate({
      to:
        mode === "signup"
          ? "/onboarding"
          : redirect === "/fifa-special"
            ? "/fifa-special"
            : "/onboarding",
    });
  };

  const handleGoogle = async () => {
    setLoading(true);
    setMessage(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setLoading(false);
      setMessage(result.error.message);
      return;
    }
    if (!result.redirected)
      await navigate({ to: redirect === "/fifa-special" ? "/fifa-special" : "/onboarding" });
  };

  return (
    <main className="grid min-h-screen bg-foreground text-background lg:grid-cols-2">
      <section className="flex min-h-72 flex-col justify-between border-b border-game-border p-6 lg:min-h-screen lg:border-b-0 lg:border-r lg:p-12">
        <Link to="/" className="flex items-center gap-3 font-display text-xl font-black uppercase">
          <span className="grid size-9 place-items-center rounded-sm bg-primary text-primary-foreground">
            CF
          </span>
          CoachFace
        </Link>
        <div className="max-w-xl py-14">
          <p className="eyebrow">The game behind the game</p>
          <h1 className="mt-4 font-display text-5xl font-black uppercase leading-none sm:text-7xl">
            Your sideline starts here.
          </h1>
          <p className="mt-6 max-w-md text-game-muted">
            Build rosters, follow live coach scores, join leaderboards, and receive explainable
            updates for every decision.
          </p>
        </div>
        <p className="text-xs text-game-muted">
          Free weekly play. Eligible paid contests require age, identity, and location verification.
        </p>
      </section>

      <section className="flex items-center justify-center bg-background p-6 text-foreground lg:p-12">
        <div className="w-full max-w-md">
          <Button variant="ghost" asChild className="mb-8 -ml-3">
            <Link to="/">
              <ArrowLeft /> Back home
            </Link>
          </Button>
          <p className="eyebrow">CoachFace account</p>
          <h2 className="mt-3 font-display text-4xl font-black uppercase">
            {mode === "signin" ? "Welcome back" : "Create account"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to manage rosters and live alerts."
              : "Join the first multi-sport fantasy platform built around coaches."}
          </p>

          <Button
            variant="outline"
            className="mt-8 w-full"
            onClick={handleGoogle}
            disabled={loading}
          >
            Continue with Google
          </Button>
          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or email
            <span className="h-px flex-1 bg-border" />
          </div>

          <form className="space-y-5" onSubmit={handleEmail}>
            {mode === "signup" && (
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="legal-name">Full legal name</Label>
                  <Input
                    id="legal-name"
                    autoComplete="name"
                    required
                    maxLength={120}
                    value={legalName}
                    onChange={(event) => setLegalName(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    required
                    minLength={3}
                    maxLength={30}
                    pattern="[A-Za-z0-9_]+"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile number</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    autoComplete="tel"
                    required
                    placeholder="+12125550123"
                    pattern="\+[1-9][0-9]{7,14}"
                    value={mobileNumber}
                    onChange={(event) => setMobileNumber(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country code</Label>
                  <Input
                    id="country"
                    required
                    minLength={2}
                    maxLength={2}
                    placeholder="US"
                    value={countryCode}
                    onChange={(event) => setCountryCode(event.target.value.toUpperCase())}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">State or region</Label>
                  <Input
                    id="region"
                    required
                    maxLength={100}
                    value={region}
                    onChange={(event) => setRegion(event.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="birth-date">Date of birth</Label>
                  <Input
                    id="birth-date"
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={(event) => setDateOfBirth(event.target.value)}
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                minLength={8}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            {message && (
              <p role="status" className="rounded-md border border-border bg-secondary p-3 text-sm">
                {message}
              </p>
            )}
            <Button className="w-full" size="lg" type="submit" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create free account"}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-1 text-sm text-muted-foreground">
            {mode === "signin" ? "New to CoachFace?" : "Already have an account?"}{" "}
            <Button
              variant="link"
              className="h-auto p-0 text-foreground"
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setMessage(null);
              }}
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
