import { createFileRoute, redirect, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  BadgeCheck,
  Briefcase,
  Code2,
  GraduationCap,
  Plus,
  Sparkles,
  Trophy,
  Wand2,
  Loader2,
  Camera,
  Pencil,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { authStore } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { profileApi, recordsApi } from "@/lib/services";
import { GlassCard } from "@/components/glass-card";
import { ScoreRing } from "@/components/score-ring";
import { ChatWidget } from "@/components/chat-widget";
import { Modal } from "@/components/modal";
import { FileDrop } from "@/components/file-drop";
import { Button } from "@/components/ui/button";
import { Field, inputCls } from "./login";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !authStore.getToken()) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({
    meta: [
      { title: "Dashboard — Trackademic" },
      { name: "description", content: "Your Trackademic student dashboard." },
    ],
  }),
  component: DashboardPage,
  errorComponent: ({ error }) => (
    <div className="p-10">
      <GlassCard>
        <div className="text-destructive">Error: {error.message}</div>
      </GlassCard>
    </div>
  ),
});

type Section =
  | "profile"
  | "skills"
  | "projects"
  | "certifications"
  | "internships"
  | "hackathons";

const TABS: { key: Section; label: string; icon: React.ReactNode }[] = [
  { key: "profile", label: "Profile", icon: <GraduationCap size={16} /> },
  { key: "skills", label: "Skills", icon: <Sparkles size={16} /> },
  { key: "projects", label: "Projects", icon: <Code2 size={16} /> },
  { key: "certifications", label: "Certifications", icon: <BadgeCheck size={16} /> },
  { key: "internships", label: "Internships", icon: <Briefcase size={16} /> },
  { key: "hackathons", label: "Hackathons", icon: <Trophy size={16} /> },
];

function DashboardPage() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("profile");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "faculty") {
      navigate({ to: "/faculty" });
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const data = await profileApi.getFull().catch(() => profileApi.get());
        setProfile(normalizeProfile(data, user));
      } catch (e: any) {
        // Fall back to local user
        setProfile(normalizeProfile(null, user));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const score: number = profile?.score ?? profile?.activity_score ?? 0;
  const skillsCount = (profile?.skills ?? []).length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* SIDEBAR */}
        <aside className="lg:sticky lg:top-24 self-start space-y-4">
          <GlassCard className="p-5">
            <div className="flex flex-col items-center text-center">
              <ProfileAvatar profile={profile} onUpdated={(p) => setProfile(p)} />
              <div className="mt-3 text-base font-semibold text-foreground">
                {profile?.name || user?.name || "Your name"}
              </div>
              <div className="text-xs text-muted-foreground">
                {profile?.usn || user?.usn || "—"}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {profile?.department || user?.department || ""}
              </div>
            </div>

            <div className="mt-5 grid place-items-center">
              <ScoreRing value={score} max={1000} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <MiniStat label="Skills" value={skillsCount} />
              <MiniStat label="Projects" value={(profile?.projects ?? []).length} />
            </div>
          </GlassCard>

          <GlassCard hover={false} className="p-2">
            <nav className="flex flex-col gap-1">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setSection(t.key)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                    section === t.key
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                  )}
                >
                  <span className={cn(section === t.key && "text-accent")}>
                    {t.icon}
                  </span>
                  {t.label}
                </button>
              ))}
            </nav>
          </GlassCard>
        </aside>

        {/* MAIN */}
        <section className="space-y-5 min-w-0">
          {loading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-3xl skeleton" />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={section}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                {section === "profile" && (
                  <ProfileSection
                    profile={profile}
                    onSaved={(p) => {
                      setProfile(p);
                      refresh();
                    }}
                  />
                )}
                {section === "skills" && (
                  <SkillsSection
                    profile={profile}
                    onChange={setProfile}
                  />
                )}
                {section === "projects" && (
                  <ListSection
                    title="Projects"
                    icon={<Code2 />}
                    items={profile?.projects ?? []}
                    fields={[
                      { key: "title", label: "Title", required: true },
                      { key: "description", label: "Description", textarea: true },
                      { key: "tech", label: "Tech stack" },
                      { key: "url", label: "Link" },
                    ]}
                    onAdd={async (vals) => {
                      const r = await recordsApi.addProject(vals);
                      toast.success("Project added");
                      const next = appendItem(profile, "projects", r ?? vals);
                      setProfile(next);
                    }}
                  />
                )}
                {section === "certifications" && (
                  <ListSection
                    title="Certifications"
                    icon={<BadgeCheck />}
                    items={profile?.certifications ?? []}
                    fields={[
                      { key: "title", label: "Title", required: true },
                      { key: "issuer", label: "Issuer" },
                      { key: "date", label: "Date" },
                      { key: "url", label: "Credential URL" },
                    ]}
                    upload
                    onAdd={async (vals) => {
                      const r = await recordsApi.addCertification(vals);
                      toast.success("Certification added");
                      setProfile(appendItem(profile, "certifications", r ?? vals));
                    }}
                  />
                )}
                {section === "internships" && (
                  <ListSection
                    title="Internships"
                    icon={<Briefcase />}
                    items={profile?.internships ?? []}
                    fields={[
                      { key: "company", label: "Company", required: true },
                      { key: "role", label: "Role" },
                      { key: "duration", label: "Duration" },
                      { key: "description", label: "Description", textarea: true },
                    ]}
                    onAdd={async (vals) => {
                      const r = await recordsApi.addInternship(vals);
                      toast.success("Internship added");
                      setProfile(appendItem(profile, "internships", r ?? vals));
                    }}
                  />
                )}
                {section === "hackathons" && (
                  <ListSection
                    title="Hackathons"
                    icon={<Trophy />}
                    items={profile?.hackathons ?? []}
                    fields={[
                      { key: "name", label: "Hackathon", required: true },
                      { key: "position", label: "Position" },
                      { key: "year", label: "Year" },
                      { key: "description", label: "Description", textarea: true },
                    ]}
                    onAdd={async (vals) => {
                      const r = await recordsApi.addHackathon(vals);
                      toast.success("Hackathon added");
                      setProfile(appendItem(profile, "hackathons", r ?? vals));
                    }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </section>
      </div>

      <ChatWidget />
    </div>
  );
}

/* ---------- helpers ---------- */

function normalizeProfile(data: any, user: any) {
  const base = data?.profile || data || {};
  return {
    name: base.name || user?.name || "",
    email: base.email || user?.email || "",
    usn: base.usn || user?.usn || "",
    department: base.department || user?.department || "",
    bio: base.bio || "",
    avatarUrl: base.avatarUrl || base.avatar_url || user?.avatarUrl || "",
    score: base.score ?? base.activity_score ?? 0,
    skills: base.skills ?? [],
    projects: base.projects ?? [],
    certifications: base.certifications ?? [],
    internships: base.internships ?? [],
    hackathons: base.hackathons ?? [],
    ...base,
  };
}

function appendItem(profile: any, key: string, item: any) {
  const arr = Array.isArray(profile?.[key]) ? profile[key] : [];
  return { ...profile, [key]: [...arr, item] };
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-secondary/50 border border-border p-3 text-center">
      <div className="text-xl font-semibold text-foreground tabular-nums">
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function ProfileAvatar({
  profile,
  onUpdated,
}: {
  profile: any;
  onUpdated: (p: any) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try {
      const res = await profileApi.uploadImage(f);
      const url = res?.url || res?.avatarUrl || res?.avatar_url;
      toast.success("Photo updated");
      onUpdated({ ...profile, avatarUrl: url || profile?.avatarUrl });
    } catch (e: any) {
      toast.error("Upload failed", { description: e?.message });
    } finally {
      setBusy(false);
    }
  }

  const initial = (profile?.name || profile?.email || "U")
    .toString()
    .slice(0, 1)
    .toUpperCase();

  return (
    <label className="relative h-24 w-24 rounded-full grid place-items-center cursor-pointer group overflow-hidden">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPick}
      />
      {profile?.avatarUrl ? (
        <img
          src={profile.avatarUrl}
          alt="avatar"
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <div className="h-full w-full rounded-full gradient-accent grid place-items-center text-3xl font-semibold text-accent-foreground">
          {initial}
        </div>
      )}
      <div className="absolute inset-0 rounded-full bg-background/60 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity">
        {busy ? (
          <Loader2 className="animate-spin text-foreground" size={18} />
        ) : (
          <Camera size={18} className="text-foreground" />
        )}
      </div>
    </label>
  );
}

/* ---------- Profile section (inline edit) ---------- */

function ProfileSection({
  profile,
  onSaved,
}: {
  profile: any;
  onSaved: (p: any) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState({
    name: profile?.name || "",
    department: profile?.department || "",
    usn: profile?.usn || "",
    bio: profile?.bio || "",
  });

  async function save() {
    setBusy(true);
    try {
      let res;
      try {
        res = await profileApi.update(draft);
      } catch {
        res = await profileApi.create(draft);
      }
      const next = { ...profile, ...draft, ...(res?.profile || res || {}) };
      onSaved(next);
      toast.success("Profile saved");
      setEditing(false);
    } catch (e: any) {
      toast.error("Couldn't save", { description: e?.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <GlassCard>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">About</h2>
          <p className="text-sm text-muted-foreground">
            Your public profile information.
          </p>
        </div>
        {!editing ? (
          <Button variant="glass" size="sm" onClick={() => setEditing(true)}>
            <Pencil size={14} /> Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(false);
                setDraft({
                  name: profile?.name || "",
                  department: profile?.department || "",
                  usn: profile?.usn || "",
                  bio: profile?.bio || "",
                });
              }}
            >
              Cancel
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={save}
              disabled={busy}
            >
              {busy ? <Loader2 className="animate-spin" size={14} /> : "Save"}
            </Button>
          </div>
        )}
      </div>

      <div className="mt-5 grid sm:grid-cols-2 gap-4">
        <ReadOrEdit
          label="Name"
          value={editing ? draft.name : profile?.name}
          editing={editing}
          onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
        />
        <ReadOrEdit
          label="Department"
          value={editing ? draft.department : profile?.department}
          editing={editing}
          onChange={(v) => setDraft((d) => ({ ...d, department: v }))}
        />
        <ReadOrEdit
          label="USN"
          value={editing ? draft.usn : profile?.usn}
          editing={editing}
          onChange={(v) => setDraft((d) => ({ ...d, usn: v }))}
        />
        <ReadOrEdit label="Email" value={profile?.email} editing={false} />
        <div className="sm:col-span-2">
          <ReadOrEdit
            label="Bio"
            value={editing ? draft.bio : profile?.bio}
            editing={editing}
            textarea
            onChange={(v) => setDraft((d) => ({ ...d, bio: v }))}
          />
        </div>
      </div>
    </GlassCard>
  );
}

function ReadOrEdit({
  label,
  value,
  editing,
  onChange,
  textarea,
}: {
  label: string;
  value?: string;
  editing: boolean;
  onChange?: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <Field label={label}>
      {editing ? (
        textarea ? (
          <textarea
            className={cn(inputCls, "h-24 py-2.5 resize-none")}
            value={value ?? ""}
            onChange={(e) => onChange?.(e.target.value)}
          />
        ) : (
          <input
            className={inputCls}
            value={value ?? ""}
            onChange={(e) => onChange?.(e.target.value)}
          />
        )
      ) : (
        <div className="min-h-[2.75rem] px-4 py-2.5 rounded-xl bg-secondary/40 border border-border text-sm text-foreground whitespace-pre-wrap">
          {value || <span className="text-muted-foreground">Not set</span>}
        </div>
      )}
    </Field>
  );
}

/* ---------- Skills ---------- */

function SkillsSection({
  profile,
  onChange,
}: {
  profile: any;
  onChange: (p: any) => void;
}) {
  const [val, setVal] = useState("");
  const [busy, setBusy] = useState(false);
  const skills: any[] = profile?.skills ?? [];

  async function add() {
    const name = val.trim();
    if (!name) return;
    setBusy(true);
    try {
      const r = await recordsApi.addSkill({ name });
      const item = r?.skill || r || { name };
      onChange({ ...profile, skills: [...skills, item] });
      setVal("");
      toast.success(`Added ${name}`);
    } catch (e: any) {
      toast.error("Couldn't add skill", { description: e?.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <GlassCard>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Skills</h2>
          <p className="text-sm text-muted-foreground">
            What you're great at — searchable by faculty.
          </p>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder="e.g. React, PyTorch, Figma…"
          className={inputCls}
        />
        <Button variant="accent" onClick={add} disabled={busy}>
          {busy ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
          Add
        </Button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {skills.length === 0 ? (
          <div className="text-sm text-muted-foreground">No skills yet.</div>
        ) : (
          skills.map((s, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-3 py-1.5 rounded-full bg-secondary/60 border border-border text-sm text-foreground hover-lift"
            >
              {s?.name || s?.skill || String(s)}
            </motion.span>
          ))
        )}
      </div>
    </GlassCard>
  );
}

/* ---------- Generic list with add/upload ---------- */

type FieldDef = {
  key: string;
  label: string;
  required?: boolean;
  textarea?: boolean;
};

function ListSection({
  title,
  icon,
  items,
  fields,
  onAdd,
  upload,
}: {
  title: string;
  icon: React.ReactNode;
  items: any[];
  fields: FieldDef[];
  onAdd: (values: Record<string, string>) => Promise<void> | void;
  upload?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [vals, setVals] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  function reset() {
    setVals({});
    setFile(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    for (const f of fields) {
      if (f.required && !vals[f.key]?.trim()) {
        toast.error(`${f.label} is required`);
        return;
      }
    }
    setBusy(true);
    try {
      let payload: Record<string, string> = { ...vals };
      if (file) {
        setUploading(true);
        try {
          const up = await recordsApi.upload(file, title.toLowerCase());
          const url = up?.url || up?.fileUrl || up?.path;
          if (url) payload.fileUrl = url;
        } catch (e: any) {
          toast.error("Upload failed", { description: e?.message });
        } finally {
          setUploading(false);
        }
      }
      await onAdd(payload);
      setOpen(false);
      reset();
    } catch (e: any) {
      toast.error("Couldn't save", { description: e?.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <GlassCard>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 rounded-xl gradient-accent grid place-items-center text-accent-foreground shadow-glow">
            {icon}
          </span>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? "entry" : "entries"}
            </p>
          </div>
        </div>
        <Button variant="accent" size="sm" onClick={() => setOpen(true)}>
          <Plus size={14} /> Add
        </Button>
      </div>

      <div className="mt-5 grid sm:grid-cols-2 gap-3">
        {items.length === 0 ? (
          <div className="sm:col-span-2">
            <EmptyState
              icon={<Wand2 size={20} />}
              title={`No ${title.toLowerCase()} yet`}
              description={`Add your first ${title.toLowerCase().slice(0, -1)} to get started.`}
              action={
                <Button variant="accent" size="sm" onClick={() => setOpen(true)}>
                  <Plus size={14} /> Add
                </Button>
              }
            />
          </div>
        ) : (
          items.map((it, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl p-4 bg-secondary/40 border border-border hover-lift group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-foreground truncate">
                    {it.title || it.name || it.company || "Untitled"}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {it.issuer || it.role || it.position || it.tech || ""}
                  </div>
                </div>
                {(it.url || it.fileUrl) && (
                  <a
                    href={it.url || it.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
              {it.description && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                  {it.description}
                </p>
              )}
              {(it.year || it.date || it.duration) && (
                <div className="mt-3 text-[11px] uppercase tracking-wider text-muted-foreground">
                  {it.year || it.date || it.duration}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Add ${title.slice(0, -1)}`}
      >
        <form onSubmit={submit} className="space-y-4">
          {fields.map((f) => (
            <Field key={f.key} label={f.label}>
              {f.textarea ? (
                <textarea
                  className={cn(inputCls, "h-24 py-2.5 resize-none")}
                  value={vals[f.key] ?? ""}
                  onChange={(e) =>
                    setVals((v) => ({ ...v, [f.key]: e.target.value }))
                  }
                />
              ) : (
                <input
                  className={inputCls}
                  value={vals[f.key] ?? ""}
                  onChange={(e) =>
                    setVals((v) => ({ ...v, [f.key]: e.target.value }))
                  }
                />
              )}
            </Field>
          ))}
          {upload && (
            <Field label="Certificate (optional)">
              <FileDrop onFile={setFile} busy={uploading} />
            </Field>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={busy}>
              {busy ? <Loader2 className="animate-spin" size={14} /> : "Save"}
            </Button>
          </div>
        </form>
      </Modal>
    </GlassCard>
  );
}
