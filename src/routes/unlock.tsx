import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { Loader2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { unlockSite } from "@/lib/site_gate.functions";
import { clearGateSensitiveCaches } from "@/lib/pwa";

export const Route = createFileRoute("/unlock")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Enter access code | CoachFace" },
      { name: "description", content: "Private preview. Enter your access code to continue." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: UnlockPage,
});

function UnlockPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { redirect } = Route.useSearch();
  const unlock = useServerFn(unlockSite);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await unlock({ data: { code } });
      if (!result.ok) {
        setError("Incorrect access code. Try again.");
        setLoading(false);
        return;
      }
      await router.invalidate();
      await clearGateSensitiveCaches();
      const target = redirect && redirect.startsWith("/") && !redirect.startsWith("/unlock")
        ? redirect
        : "/";
      window.location.href = target;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-foreground p-6 text-background">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 font-display text-xl font-black uppercase">
          <span className="grid size-9 place-items-center rounded-sm bg-primary text-primary-foreground">
            CF
          </span>
          CoachFace
        </div>
        <div className="mt-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-game-border px-3 py-1 text-xs font-bold uppercase tracking-wider text-game-muted">
            <Lock className="size-3.5" /> Private preview
          </div>
          <h1 className="mt-4 font-display text-4xl font-black uppercase leading-none sm:text-5xl">
            Enter access code
          </h1>
          <p className="mt-3 text-sm text-game-muted">
            CoachFace is in invite-only preview. Enter the access code you were given to continue.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="access-code" className="text-background">
              Access code
            </Label>
            <Input
              id="access-code"
              type="password"
              autoComplete="off"
              autoFocus
              required
              maxLength={200}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="bg-background text-foreground"
            />
          </div>
          {error && (
            <p
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-background"
            >
              {error}
            </p>
          )}
          <Button className="w-full" size="lg" type="submit" disabled={loading || !code}>
            {loading && <Loader2 className="animate-spin" />}
            Unlock
          </Button>
        </form>

        <p className="mt-8 text-xs text-game-muted">
          Don&apos;t have a code? Contact the CoachFace team to request access.
        </p>
      </div>
    </main>
  );
}
