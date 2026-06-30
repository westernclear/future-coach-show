import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, AlertTriangle, Loader2, MapPin, ShieldCheck, Ban } from "lucide-react";

import { CoachFacePageShell, PageHero } from "@/components/coachface-page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { attestEligibility, getMyEligibility } from "@/lib/eligibility.functions";

export const Route = createFileRoute("/_authenticated/eligibility")({
  head: () => ({
    meta: [
      { title: "Eligibility & Location | CoachFace" },
      {
        name: "description",
        content:
          "Confirm your age, country, and U.S. state to access CoachFace contests. Required for legal Fantasy Sports play.",
      },
    ],
  }),
  component: EligibilityPage,
});

const US_STATES: { code: string; name: string }[] = [
  ["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],
  ["CA","California"],["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],
  ["FL","Florida"],["GA","Georgia"],["HI","Hawaii"],["ID","Idaho"],
  ["IL","Illinois"],["IN","Indiana"],["IA","Iowa"],["KS","Kansas"],
  ["KY","Kentucky"],["LA","Louisiana"],["ME","Maine"],["MD","Maryland"],
  ["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],["MS","Mississippi"],
  ["MO","Missouri"],["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],
  ["NH","New Hampshire"],["NJ","New Jersey"],["NM","New Mexico"],["NY","New York"],
  ["NC","North Carolina"],["ND","North Dakota"],["OH","Ohio"],["OK","Oklahoma"],
  ["OR","Oregon"],["PA","Pennsylvania"],["RI","Rhode Island"],["SC","South Carolina"],
  ["SD","South Dakota"],["TN","Tennessee"],["TX","Texas"],["UT","Utah"],
  ["VT","Vermont"],["VA","Virginia"],["WA","Washington"],["WV","West Virginia"],
  ["WI","Wisconsin"],["WY","Wyoming"],["DC","District of Columbia"],
].map(([code, name]) => ({ code, name }));

const COUNTRIES: { code: string; name: string }[] = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "NG", name: "Nigeria" },
  { code: "MX", name: "Mexico" },
  { code: "BR", name: "Brazil" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "IN", name: "India" },
  { code: "JP", name: "Japan" },
  { code: "ZA", name: "South Africa" },
  { code: "OTHER", name: "Other / Not listed" },
];

function EligibilityPage() {
  const getElig = useServerFn(getMyEligibility);
  const attest = useServerFn(attestEligibility);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["my-eligibility"],
    queryFn: () => getElig(),
  });

  const [country, setCountry] = useState("US");
  const [region, setRegion] = useState("");
  const [dob, setDob] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptRP, setAcceptRP] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (data?.eligibility) {
      setCountry(data.eligibility.attested_country_code);
      setRegion(data.eligibility.attested_region_code ?? "");
      setDob(data.eligibility.date_of_birth);
    }
  }, [data?.eligibility]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!acceptTerms || !acceptRP) {
      setMsg({ kind: "err", text: "You must accept the Terms and Responsible Play policy." });
      return;
    }
    setSubmitting(true);
    try {
      const res = await attest({
        data: {
          countryCode: country,
          regionCode: country === "US" ? region : null,
          dateOfBirth: dob,
          acceptTerms: true,
          acceptResponsiblePlay: true,
        },
      });
      setMsg({
        kind: "ok",
        text: `Confirmed for ${res.rule_name}. Free play: ${res.free_play_eligible ? "yes" : "no"}. Paid contests: ${res.paid_play_eligible ? "yes" : "no"} (min age ${res.min_age}).`,
      });
      refetch();
    } catch (err: any) {
      setMsg({ kind: "err", text: err?.message ?? "Failed to save." });
    } finally {
      setSubmitting(false);
    }
  }

  const ipMismatch =
    data?.eligibility &&
    data.ipCountry &&
    data.ipCountry.toUpperCase() !== data.eligibility.attested_country_code;

  return (
    <CoachFacePageShell>
      <PageHero
        eyebrow="Legal & Compliance"
        title="Confirm your age and location"
        description="U.S. Fantasy Sports laws vary by state. We need to know where you are and how old you are so we can show you contests you're legally allowed to play."
      />
      <main className="mx-auto max-w-3xl px-5 py-12 lg:px-8">
        <form
          onSubmit={onSubmit}
          className="space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm"
        >
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading your status...
            </div>
          ) : (
            <>
              {data?.eligibility && (
                <div className="rounded border border-border bg-secondary/40 p-4 text-sm">
                  <p className="flex items-center gap-2 font-semibold">
                    <ShieldCheck className="size-4 text-primary" /> Current status
                  </p>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>
                      Free play:{" "}
                      <strong className={data.eligibility.free_play_eligible ? "text-foreground" : "text-destructive"}>
                        {data.eligibility.free_play_eligible ? "Allowed" : "Blocked"}
                      </strong>
                    </li>
                    <li>
                      Paid contests:{" "}
                      <strong className={data.eligibility.paid_play_eligible ? "text-foreground" : "text-destructive"}>
                        {data.eligibility.paid_play_eligible ? "Allowed" : "Blocked"}
                      </strong>
                    </li>
                  </ul>
                </div>
              )}

              {data?.ipCountry && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="size-3.5" />
                  Detected location from your network: <strong className="text-foreground">{data.ipCountry}{data.ipRegion ? ` / ${data.ipRegion}` : ""}</strong>
                </p>
              )}
              {ipMismatch && (
                <div className="flex items-start gap-2 rounded border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <span>
                    Your detected country ({data!.ipCountry}) does not match your registered country ({data!.eligibility!.attested_country_code}). Paid contests will be blocked while traveling.
                  </span>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger id="country"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {country === "US" && (
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select value={region} onValueChange={setRegion}>
                      <SelectTrigger id="state"><SelectValue placeholder="Select your state" /></SelectTrigger>
                      <SelectContent>
                        {US_STATES.map((s) => (
                          <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="dob">Date of birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                    max={new Date().toISOString().slice(0, 10)}
                  />
                  <p className="text-xs text-muted-foreground">Must be 18+ (21+ in some states).</p>
                </div>
              </div>

              <div className="space-y-3 rounded border border-border bg-background p-4 text-sm">
                <label className="flex items-start gap-2">
                  <Checkbox checked={acceptTerms} onCheckedChange={(v) => setAcceptTerms(!!v)} />
                  <span>
                    I have read and accept the{" "}
                    <Link to="/terms" className="underline">Terms of Service</Link>,{" "}
                    <Link to="/legal/eligibility" className="underline">Eligibility Rules</Link>, and{" "}
                    <Link to="/legal/prohibited" className="underline">Prohibited Jurisdictions</Link>.
                  </span>
                </label>
                <label className="flex items-start gap-2">
                  <Checkbox checked={acceptRP} onCheckedChange={(v) => setAcceptRP(!!v)} />
                  <span>
                    I have read the{" "}
                    <Link to="/legal/responsible-play" className="underline">Responsible Play Policy</Link>{" "}
                    and confirm I am playing for entertainment only.
                  </span>
                </label>
              </div>

              {msg && (
                <div
                  className={`flex items-start gap-2 rounded border p-3 text-sm ${
                    msg.kind === "ok"
                      ? "border-primary/40 bg-primary/10 text-foreground"
                      : "border-destructive/40 bg-destructive/10 text-destructive"
                  }`}
                >
                  {msg.kind === "ok" ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                  ) : (
                    <Ban className="mt-0.5 size-4 shrink-0" />
                  )}
                  <span>{msg.text}</span>
                </div>
              )}

              <Button type="submit" disabled={submitting || !dob || (country === "US" && !region)}>
                {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                Save eligibility
              </Button>
            </>
          )}
        </form>

        <p className="mt-6 text-xs text-muted-foreground">
          We cross-check your self-attested location against your network IP location. Misrepresenting your location to access paid contests violates our Terms of Service and may be a violation of U.S. federal and state law (including UIGEA).
        </p>
      </main>
    </CoachFacePageShell>
  );
}
