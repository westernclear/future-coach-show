import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Copy, KeyRound, Loader2, Plus, ShieldCheck, Trash2 } from "lucide-react";

import { CoachFacePageShell, PageHero } from "@/components/coachface-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { checkIsAdmin } from "@/lib/admin-audits.functions";
import {
  createAccessCode,
  deleteAccessCode,
  listAccessCodes,
  setAccessCodeActive,
} from "@/lib/access_codes.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/access-codes")({
  head: () => ({
    meta: [
      { title: "Access Codes | CoachFace Admin" },
      { name: "description", content: "Create and manage invite-only access codes." },
    ],
  }),
  component: AccessCodesPage,
});

function AccessCodesPage() {
  const checkAdmin = useServerFn(checkIsAdmin);
  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => checkAdmin(),
    retry: false,
  });

  if (checkingAdmin) {
    return (
      <CoachFacePageShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </CoachFacePageShell>
    );
  }

  if (!isAdmin) {
    return (
      <CoachFacePageShell>
        <div className="mx-auto max-w-2xl px-5 py-20 text-center">
          <h1 className="font-display text-3xl font-black">Admins only</h1>
          <p className="mt-3 text-muted-foreground">
            You don't have permission to manage access codes.
          </p>
        </div>
      </CoachFacePageShell>
    );
  }

  return (
    <CoachFacePageShell>
      <PageHero
        eyebrow="Admin"
        title="Access Codes"
        description="Mint invite-only codes for the public site gate. Codes are shown once at creation; we only store a salted hash."
      />
      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <CreateForm />
        <CodeList />
      </section>
    </CoachFacePageShell>
  );
}

function CreateForm() {
  const qc = useQueryClient();
  const create = useServerFn(createAccessCode);
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");
  const [maxUses, setMaxUses] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [issued, setIssued] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () =>
      create({
        data: {
          label: label.trim(),
          note: note.trim() ? note.trim() : null,
          maxUses: maxUses ? Number(maxUses) : null,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        },
      }),
    onSuccess: (res) => {
      setIssued(res.code);
      setLabel("");
      setNote("");
      setMaxUses("");
      setExpiresAt("");
      qc.invalidateQueries({ queryKey: ["access-codes"] });
      toast.success("Access code created");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to create code"),
  });

  return (
    <div className="rounded-md border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <KeyRound className="size-5 text-primary" />
        <h2 className="font-display text-xl font-black uppercase tracking-tight">
          Create a new code
        </h2>
      </div>
      <form
        className="mt-5 grid gap-4 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!label.trim()) {
            toast.error("Label is required");
            return;
          }
          mutation.mutate();
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="label">Label *</Label>
          <Input
            id="label"
            placeholder="e.g. Investor demo, Beta cohort"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={80}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="max-uses">Max uses (optional)</Label>
          <Input
            id="max-uses"
            type="number"
            min={1}
            placeholder="Unlimited"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="note">Note (optional)</Label>
          <Textarea
            id="note"
            placeholder="Who is this for? Internal context only."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={280}
            rows={2}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="expires">Expires at (optional)</Label>
          <Input
            id="expires"
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={mutation.isPending} className="w-full md:w-auto">
            {mutation.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Plus className="mr-2 size-4" />
            )}
            Generate code
          </Button>
        </div>
      </form>

      {issued ? (
        <div className="mt-6 rounded-md border border-primary/40 bg-primary/5 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-primary">
            New code (shown once)
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <code className="rounded bg-background px-3 py-2 font-mono text-lg font-bold tracking-widest">
              {issued}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(issued);
                toast.success("Copied to clipboard");
              }}
            >
              <Copy className="mr-2 size-4" /> Copy
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIssued(null)}>
              Dismiss
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Save it now. For security we only store a hash, so this exact value cannot be shown again.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function CodeList() {
  const qc = useQueryClient();
  const list = useServerFn(listAccessCodes);
  const toggle = useServerFn(setAccessCodeActive);
  const remove = useServerFn(deleteAccessCode);

  const { data, isLoading } = useQuery({
    queryKey: ["access-codes"],
    queryFn: () => list(),
  });

  const toggleMutation = useMutation({
    mutationFn: (vars: { id: string; active: boolean }) => toggle({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["access-codes"] }),
    onError: (e: Error) => toast.error(e.message),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Code deleted");
      qc.invalidateQueries({ queryKey: ["access-codes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mt-10 rounded-md border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" />
          <h2 className="font-display text-xl font-black uppercase tracking-tight">
            Issued codes
          </h2>
        </div>
        <span className="text-xs text-muted-foreground">
          {data?.codes.length ?? 0} total
        </span>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : !data || data.codes.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">
          No codes yet. Create your first invite above.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Uses</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.codes.map((c: any) => {
              const expired = c.expires_at && new Date(c.expires_at) < new Date();
              const exhausted = c.max_uses != null && c.uses >= c.max_uses;
              return (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="font-semibold">{c.label}</div>
                    {c.note ? (
                      <div className="text-xs text-muted-foreground">{c.note}</div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    {c.uses}
                    {c.max_uses != null ? ` / ${c.max_uses}` : ""}
                  </TableCell>
                  <TableCell className="text-xs">
                    {c.expires_at ? new Date(c.expires_at).toLocaleString() : "Never"}
                  </TableCell>
                  <TableCell>
                    {!c.active ? (
                      <Badge variant="secondary">Disabled</Badge>
                    ) : expired ? (
                      <Badge variant="destructive">Expired</Badge>
                    ) : exhausted ? (
                      <Badge variant="destructive">Exhausted</Badge>
                    ) : (
                      <Badge>Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={toggleMutation.isPending}
                        onClick={() =>
                          toggleMutation.mutate({ id: c.id, active: !c.active })
                        }
                      >
                        {c.active ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          if (confirm(`Delete code "${c.label}"? This cannot be undone.`)) {
                            deleteMutation.mutate(c.id);
                          }
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
