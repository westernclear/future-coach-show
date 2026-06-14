import { useState, type FormEvent } from "react";
import { useQueryClient, useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Camera, Check, Image, Loader2, ShieldCheck, Upload } from "lucide-react";

import avatarCrest from "@/assets/avatar-crest.jpg";
import avatarMascot from "@/assets/avatar-mascot.jpg";
import avatarStrategist from "@/assets/avatar-strategist.jpg";
import avatarTactician from "@/assets/avatar-tactician.jpg";
import { CoachFacePageShell, PageHero } from "@/components/coachface-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { getProfileEditor, updateProfileEditor } from "@/lib/profile-editor.functions";
import { cn } from "@/lib/utils";

type AvatarType = "real_photo" | "ai_avatar" | "cartoon_avatar" | "team_logo" | "custom_image";

const profileQuery = queryOptions({
  queryKey: ["profile-editor"],
  queryFn: () => getProfileEditor(),
});

const presets: Array<{ name: string; type: AvatarType; image: string }> = [
  { name: "The Tactician", type: "ai_avatar", image: avatarTactician },
  { name: "The Strategist", type: "ai_avatar", image: avatarStrategist },
  { name: "Coach Fox", type: "cartoon_avatar", image: avatarMascot },
  { name: "Falcon Crest", type: "team_logo", image: avatarCrest },
];

export const Route = createFileRoute("/_authenticated/profile")({
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQuery),
  head: () => ({ meta: [
    { title: "Edit CoachFace Profile" },
    { name: "description", content: "Customize your CoachFace name, sports identity, photo, avatar, team logo, or custom image." },
  ] }),
  component: ProfileEditorPage,
});

function ProfileEditorPage() {
  const { data } = useSuspenseQuery(profileQuery);
  const saveProfile = useServerFn(updateProfileEditor);
  const queryClient = useQueryClient();
  const profile = data.profile;
  const [form, setForm] = useState({
    username: profile?.username ?? "",
    favoriteSport: profile?.favorite_sport ?? "",
    favoriteTeam: profile?.favorite_team ?? "",
    preferredLeague: profile?.preferred_league ?? "",
    fantasySkillLevel: profile?.fantasy_skill_level ?? "rookie",
    avatarUrl: profile?.avatar_url ?? "",
    avatarType: (profile?.avatar_type ?? "custom_image") as AvatarType,
  });
  const [preview, setPreview] = useState(data.avatarPreviewUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const choosePreset = (preset: (typeof presets)[number]) => {
    setForm((current) => ({ ...current, avatarUrl: preset.image, avatarType: preset.type }));
    setPreview(preset.image);
    setMessage(null);
  };

  const uploadImage = async (file: File | undefined) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setMessage("Choose a JPG, PNG, or WebP image smaller than 5 MB.");
      return;
    }
    setUploading(true);
    setMessage(null);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setUploading(false);
      setMessage("Please sign in again before uploading an image.");
      return;
    }
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/profile-${Date.now()}.${extension}`;
    const { error } = await supabase.storage
      .from("profile-photos")
      .upload(path, file, { contentType: file.type });
    if (error) {
      setMessage("We could not upload that image. Please try again.");
    } else {
      const { data: signed } = await supabase.storage.from("profile-photos").createSignedUrl(path, 3600);
      setForm((current) => ({ ...current, avatarUrl: path }));
      setPreview(signed?.signedUrl ?? URL.createObjectURL(file));
    }
    setUploading(false);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await saveProfile({ data: {
        ...form,
        fantasySkillLevel: form.fantasySkillLevel as "rookie" | "intermediate" | "advanced" | "expert",
      } });
      await queryClient.invalidateQueries({ queryKey: ["profile-editor"] });
      await queryClient.invalidateQueries({ queryKey: ["player-dashboard"] });
      setMessage("Profile saved. Your CoachFace identity is ready.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <CoachFacePageShell>
      <PageHero eyebrow="Fantasy identity" title="Make it your CoachFace." description="Use a personal photo, AI avatar, cartoon coach, original team crest, or your own custom graphic. A real photograph is never required." aside={<Badge className="rounded-sm px-3 py-1.5 uppercase tracking-wider"><ShieldCheck className="mr-2 size-4" /> You control your identity</Badge>} />
      <main className="mx-auto grid max-w-7xl gap-12 px-5 py-12 lg:grid-cols-[0.72fr_1.28fr] lg:px-8 lg:py-16">
        <aside>
          <div className="border-t-4 border-primary bg-foreground p-7 text-background">
            <div className="mx-auto grid size-40 place-items-center overflow-hidden rounded-full border-4 border-primary bg-game-surface font-display text-5xl font-black">
              {preview ? <img src={preview} alt="Current CoachFace identity" className="size-full object-cover" /> : "CF"}
            </div>
            <p className="mt-6 text-center font-display text-3xl font-black uppercase">{form.username || "Your CoachFace"}</p>
            <p className="mt-1 text-center text-sm text-game-muted">{form.favoriteTeam || "Your favorite team"}</p>
            <div className="mt-6 grid grid-cols-2 gap-px bg-game-border text-center">
              <div className="bg-game-surface p-4"><p className="font-display text-2xl font-black">8,450</p><p className="text-xs text-game-muted">Coach score</p></div>
              <div className="bg-game-surface p-4"><p className="font-display text-2xl font-black">71%</p><p className="text-xs text-game-muted">Accuracy</p></div>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Your selected image represents your fantasy coaching identity across rankings, contests, and rewards.</p>
        </aside>

        <form onSubmit={submit}>
          <section>
            <p className="eyebrow">Choose your look</p>
            <h2 className="mt-2 font-display text-4xl font-black uppercase">Avatar locker</h2>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {presets.map((preset) => {
                const selected = form.avatarUrl === preset.image;
                return (
                  <Button key={preset.name} type="button" variant="outline" onClick={() => choosePreset(preset)} className={cn("relative h-auto flex-col gap-3 rounded-none p-3", selected && "border-primary bg-primary/5")}>
                    <img src={preset.image} alt={preset.name} loading="lazy" width={768} height={768} className="aspect-square w-full object-cover" />
                    <span>{preset.name}</span>
                    {selected && <span className="absolute right-4 top-4 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="size-4" /></span>}
                  </Button>
                );
              })}
            </div>
          </section>

          <section className="mt-10 border-y border-border py-7">
            <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <Label htmlFor="avatar-type">Upload type</Label>
                <Select value={form.avatarType} onValueChange={(value) => setForm({ ...form, avatarType: value as AvatarType })}>
                  <SelectTrigger id="avatar-type" className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="real_photo">Personal photo</SelectItem>
                    <SelectItem value="ai_avatar">AI avatar</SelectItem>
                    <SelectItem value="cartoon_avatar">Cartoon avatar</SelectItem>
                    <SelectItem value="team_logo">Team logo</SelectItem>
                    <SelectItem value="custom_image">Custom image</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Label htmlFor="profile-image" className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 border border-input px-4 text-sm font-bold hover:bg-accent">
                {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Upload image
              </Label>
              <Input id="profile-image" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploading} onChange={(event) => void uploadImage(event.target.files?.[0])} />
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Camera className="size-3.5" /> Photo optional</span><span className="flex items-center gap-1"><Bot className="size-3.5" /> AI avatars welcome</span><span className="flex items-center gap-1"><Image className="size-3.5" /> JPG, PNG, WebP, max 5 MB</span></div>
          </section>

          <section className="mt-10">
            <p className="eyebrow">Profile details</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <ProfileField label="CoachFace name"><Input required minLength={3} maxLength={30} pattern="[A-Za-z0-9_]+" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} /></ProfileField>
              <ProfileField label="Favorite sport"><Input required maxLength={80} value={form.favoriteSport} onChange={(event) => setForm({ ...form, favoriteSport: event.target.value })} /></ProfileField>
              <ProfileField label="Favorite team"><Input required maxLength={100} value={form.favoriteTeam} onChange={(event) => setForm({ ...form, favoriteTeam: event.target.value })} /></ProfileField>
              <ProfileField label="Preferred league"><Input maxLength={100} value={form.preferredLeague} onChange={(event) => setForm({ ...form, preferredLeague: event.target.value })} /></ProfileField>
              <ProfileField label="Fantasy skill level"><Select value={form.fantasySkillLevel} onValueChange={(value) => setForm({ ...form, fantasySkillLevel: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="rookie">Rookie</SelectItem><SelectItem value="intermediate">Intermediate</SelectItem><SelectItem value="advanced">Advanced</SelectItem><SelectItem value="expert">Expert</SelectItem></SelectContent></Select></ProfileField>
            </div>
          </section>
          {message && <p role="status" className="mt-6 border border-border bg-secondary p-4 text-sm">{message}</p>}
          <Button type="submit" size="lg" className="mt-7" disabled={saving || uploading}>{saving && <Loader2 className="animate-spin" />} Save profile</Button>
        </form>
      </main>
    </CoachFacePageShell>
  );
}

function ProfileField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}