"use client";

export const dynamic = "force-dynamic";

import {
  usePortfolioData,
  type WorkExperience,
  type RecentWork,
  type Project,
} from "@/lib/portfolio-store";
import * as svc from "@/lib/portfolio-service";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import {
  Trash2,
  Plus,
  Check,
  ChevronLeft,
  GripVertical,
  LogIn,
  LogOut,
  Eye,
  EyeOff,
  Pencil,
  X,
} from "lucide-react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { ImageUploader } from "@/components/image-uploader";
import { TaskManagement } from "@/components/task-management";
import { MoneyManagement } from "@/components/money-management";
import { LinkIcon, getPlatform } from "@/components/link-icon";

type Tab = "profile" | "experience" | "work" | "projects" | "links";
type Section = "admin" | "tasks" | "money";

/* ─── Helpers ────────────────────────────────────────────────────── */
function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/* ─── Field ──────────────────────────────────────────────────────── */
function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
  rows?: number;
}) {
  const base =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all lowercase";
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
        {label}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`${base} resize-y`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={base}
        />
      )}
    </div>
  );
}

/* ─── Toast ──────────────────────────────────────────────────────── */
function Toast({ show, message = "saved" }: { show: boolean; message?: string }) {
  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg lowercase transition-all duration-300 z-50 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <Check size={13} />
      {message}
    </div>
  );
}

/* ─── Tab button ─────────────────────────────────────────────────── */
function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-xs font-semibold lowercase transition-colors ${
        active ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

/* ─── Login screen ───────────────────────────────────────────────── */
function LoginScreen({ onLogin }: { onLogin: (u: User) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    if (data.user) onLogin(data.user);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <div className="mb-7">
          <div className="h-10 w-10 rounded-2xl bg-gray-900 flex items-center justify-center mb-4">
            <span className="text-sm font-black text-white lowercase">a</span>
          </div>
          <h1 className="text-xl font-black text-gray-900 lowercase tracking-tight">admin panel</h1>
          <p className="text-xs text-gray-400 lowercase mt-1">sign in with your supabase account</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 pr-10 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 lowercase">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white text-sm font-semibold lowercase transition-colors"
          >
            <LogIn size={14} />
            {loading ? "signing in…" : "sign in"}
          </button>
        </form>

        <p className="text-[10px] text-gray-300 lowercase mt-6 text-center leading-relaxed">
          create your account in supabase dashboard → authentication → users
        </p>
      </div>
    </main>
  );
}

/* ════════════════════════════════════════════════════════════════════ */
export default function AdminPage() {
  const { data: profileData, save: saveProfile } = usePortfolioData();
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [section, setSection] = useState<Section>("admin");
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  /* ── Links ── */
  const [links, setLinks] = useState<import("@/lib/portfolio-store").PortfolioLink[]>([]);
  const [addingLink, setAddingLink] = useState(false);
  const [newLink, setNewLink] = useState({ label: "", abbr: "", url: "", imageUrl: "" });
  const [toast, setToast] = useState({ show: false, message: "saved" });
  const [dbError, setDbError] = useState<string | null>(null);

  /* ── Auth check on mount ── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthChecked(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  /* ── Profile ── */
  const [profile, setProfile] = useState({
    name: "", title: "", specialisation: "", about: "",
    location: "", website: "", email: "", portfolioHandle: "",
    avatarUrl: "", bannerUrl: "", resumeUrl: "",
  });

  /* ── Experience ── */
  const [experience, setExperience] = useState<WorkExperience[]>([]);
  const [addingExp, setAddingExp] = useState(false);
  const [newExp, setNewExp] = useState<Omit<WorkExperience, "id">>({
    company: "", role: "", startDate: "", endDate: "", logoText: "", logoColor: "#1a1a1a",
  });

  /* ── Recent Work ── */
  const [recentWork, setRecentWork] = useState<RecentWork[]>([]);
  const [addingWork, setAddingWork] = useState(false);
  const [newWork, setNewWork] = useState<Omit<RecentWork, "id">>({ title: "", imageUrl: "", link: "" });

  /* ── Projects ── */
  const [projects, setProjects] = useState<Project[]>([]);
  const [addingProject, setAddingProject] = useState(false);
  const [newProject, setNewProject] = useState<Omit<Project, "id">>({
    slug: "", title: "", description: "", content: "", tags: [],
    imageUrl: "", coverImageUrl: "", category: "", link: "", publishedAt: null,
  });
  const [tagInput, setTagInput] = useState("");

  /* ── Edit state ── */
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [editExpDraft, setEditExpDraft] = useState<Omit<WorkExperience, "id">>({ company: "", role: "", startDate: "", endDate: "", logoText: "", logoColor: "#1a1a1a" });

  const [editingWorkId, setEditingWorkId] = useState<string | null>(null);
  const [editWorkDraft, setEditWorkDraft] = useState<Omit<RecentWork, "id">>({ title: "", imageUrl: "", link: "" });

  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editProjectDraft, setEditProjectDraft] = useState<Omit<Project, "id">>({ slug: "", title: "", description: "", content: "", tags: [], imageUrl: "", coverImageUrl: "", category: "", link: "", publishedAt: null });
  const [editTagInput, setEditTagInput] = useState("");

  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editLinkDraft, setEditLinkDraft] = useState({ label: "", abbr: "", url: "", imageUrl: "" });

  /* ── Load data when authenticated ── */
  useEffect(() => {
    if (!user) return;
    setProfile({
      name: profileData.name, title: profileData.title,
      specialisation: profileData.specialisation, about: profileData.about,
      location: profileData.location, website: profileData.website,
      email: profileData.email, portfolioHandle: profileData.portfolioHandle,
      avatarUrl: profileData.avatarUrl, bannerUrl: profileData.bannerUrl,
      resumeUrl: profileData.resumeUrl ?? "",
    });
    Promise.all([svc.getExperience(), svc.getRecentWork(), svc.getProjects(), svc.getLinks()])
      .then(([exp, work, proj, lnk]) => {
        setExperience(exp);
        setRecentWork(work);
        setProjects(proj);
        setLinks(lnk);
      })
      .catch((e) => setDbError(e.message));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const showToast = (message = "saved") => {
    setToast({ show: true, message });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500);
  };

  const handleSignOut = () => supabase.auth.signOut();

  /* ── Profile save (Supabase) ── */
  const handleSaveProfile = async () => {
    try {
      await saveProfile({ ...profileData, ...profile });
      showToast("profile saved");
    } catch (e: unknown) {
      setDbError(e instanceof Error ? e.message : "failed to save profile");
    }
  };

  /* ── Experience ── */
  const handleAddExp = async () => {
    if (!newExp.company || !newExp.role) return;
    try {
      const created = await svc.createExperience(newExp);
      setExperience((prev) => [...prev, created]);
      setNewExp({ company: "", role: "", startDate: "", endDate: "", logoText: "", logoColor: "#1a1a1a" });
      setAddingExp(false);
      showToast("experience added");
    } catch (e: unknown) {
      setDbError(e instanceof Error ? e.message : "error");
    }
  };

  const handleDeleteExp = async (id: string) => {
    try {
      await svc.deleteExperience(id);
      setExperience((prev) => prev.filter((e) => e.id !== id));
      showToast("removed");
    } catch (e: unknown) {
      setDbError(e instanceof Error ? e.message : "error");
    }
  };

  /* ── Recent Work ── */
  const handleAddWork = async () => {
    if (!newWork.title) return;
    try {
      const created = await svc.createRecentWork(newWork);
      setRecentWork((prev) => [...prev, created]);
      setNewWork({ title: "", imageUrl: "", link: "" });
      setAddingWork(false);
      showToast("work added");
    } catch (e: unknown) {
      setDbError(e instanceof Error ? e.message : "error");
    }
  };

  const handleDeleteWork = async (id: string) => {
    try {
      await svc.deleteRecentWork(id);
      setRecentWork((prev) => prev.filter((w) => w.id !== id));
      showToast("removed");
    } catch (e: unknown) {
      setDbError(e instanceof Error ? e.message : "error");
    }
  };

  /* ── Projects ── */
  const handleAddProject = async () => {
    if (!newProject.title || !newProject.slug) return;
    try {
      const created = await svc.createProject({
        ...newProject,
        publishedAt: new Date().toISOString(),
      });
      setProjects((prev) => [...prev, created]);
      setNewProject({ slug: "", title: "", description: "", content: "", tags: [], imageUrl: "", coverImageUrl: "", category: "", link: "", publishedAt: null });
      setTagInput("");
      setAddingProject(false);
      showToast("project added");
    } catch (e: unknown) {
      setDbError(e instanceof Error ? e.message : "error");
    }
  };

  /* ── Links ── */
  const handleAddLink = async () => {
    if (!newLink.label) return;
    try {
      const created = await svc.createLink(newLink);
      setLinks((prev) => [...prev, created]);
      setNewLink({ label: "", abbr: "", url: "", imageUrl: "" });
      setAddingLink(false);
      showToast("link added");
    } catch (e: unknown) { setDbError(e instanceof Error ? e.message : "error"); }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      await svc.deleteLink(id);
      setLinks((prev) => prev.filter((l) => l.id !== id));
      showToast("removed");
    } catch (e: unknown) { setDbError(e instanceof Error ? e.message : "error"); }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await svc.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      showToast("removed");
    } catch (e: unknown) {
      setDbError(e instanceof Error ? e.message : "error");
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (!tag || newProject.tags.includes(tag)) return;
    setNewProject((p) => ({ ...p, tags: [...p.tags, tag] }));
    setTagInput("");
  };

  /* ── Update handlers ── */
  const handleUpdateExp = async () => {
    if (!editingExpId || !editExpDraft.company || !editExpDraft.role) return;
    try {
      const updated = await svc.updateExperience(editingExpId, editExpDraft);
      setExperience((prev) => prev.map((e) => e.id === editingExpId ? updated : e));
      setEditingExpId(null);
      showToast("experience updated");
    } catch (e: unknown) { setDbError(e instanceof Error ? e.message : "error"); }
  };

  const handleUpdateWork = async () => {
    if (!editingWorkId || !editWorkDraft.title) return;
    try {
      const updated = await svc.updateRecentWork(editingWorkId, editWorkDraft);
      setRecentWork((prev) => prev.map((w) => w.id === editingWorkId ? updated : w));
      setEditingWorkId(null);
      showToast("certification updated");
    } catch (e: unknown) { setDbError(e instanceof Error ? e.message : "error"); }
  };

  const handleUpdateProject = async () => {
    if (!editingProjectId || !editProjectDraft.title || !editProjectDraft.slug) return;
    try {
      const updated = await svc.updateProject(editingProjectId, editProjectDraft);
      setProjects((prev) => prev.map((p) => p.id === editingProjectId ? updated : p));
      setEditingProjectId(null);
      setEditTagInput("");
      showToast("project updated");
    } catch (e: unknown) { setDbError(e instanceof Error ? e.message : "error"); }
  };

  const handleUpdateLink = async () => {
    if (!editingLinkId || !editLinkDraft.label) return;
    try {
      const updated = await svc.updateLink(editingLinkId, editLinkDraft);
      setLinks((prev) => prev.map((l) => l.id === editingLinkId ? updated : l));
      setEditingLinkId(null);
      showToast("link updated");
    } catch (e: unknown) { setDbError(e instanceof Error ? e.message : "error"); }
  };

  /* ── Auth gate ── */
  if (!authChecked) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-gray-300 border-t-gray-900 animate-spin" />
      </main>
    );
  }
  if (!user) return <LoginScreen onLogin={(u) => setUser(u)} />;

  /* ─── Render (authenticated) ─────────────────────────────────────── */
  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Top row: back link + sign out */}
          <div className="flex items-center justify-between h-11 sm:h-14">
            <Link href="/" className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 lowercase transition-colors">
              <ChevronLeft size={14} />
              portfolio
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-gray-400 lowercase hidden sm:block">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 lowercase transition-colors"
              >
                <LogOut size={13} />
                sign out
              </button>
            </div>
          </div>
          {/* Section switcher — scrollable on mobile */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 mb-2 w-full overflow-x-auto">
            {(["admin", "tasks", "money"] as Section[]).map((s) => (
              <button
                key={s}
                onClick={() => setSection(s)}
                className={`flex-1 min-w-0 px-3 py-1.5 rounded-lg text-xs font-semibold lowercase transition-colors whitespace-nowrap ${section === s ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
              >
                <span className="sm:hidden">{s === "tasks" ? "tasks" : s === "money" ? "money" : "admin"}</span>
                <span className="hidden sm:inline">{s === "tasks" ? "task management" : s === "money" ? "money" : "admin"}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {section === "tasks" && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
          <TaskManagement />
        </div>
      )}

      {section === "money" && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-24">
          <MoneyManagement />
        </div>
      )}

      <div className={`max-w-3xl mx-auto px-4 sm:px-6 pt-6 ${section !== "admin" ? "hidden" : ""}`}>
        {/* DB error banner */}
        {dbError && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 lowercase flex items-start justify-between gap-3">
            <span>supabase error: {dbError}</span>
            <button onClick={() => setDbError(null)} className="font-semibold flex-shrink-0">dismiss</button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white border border-gray-100 rounded-2xl p-1.5 w-full overflow-x-auto">
          {(["profile", "experience", "work", "projects", "links"] as Tab[]).map((t) => (
            <TabBtn key={t} active={activeTab === t} onClick={() => setActiveTab(t)}>
              {t === "work" ? "certifications" : t}
            </TabBtn>
          ))}
        </div>

        {/* ── Profile ─────────────────────────────────────────────── */}
        {activeTab === "profile" && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="text-sm font-bold text-gray-900 lowercase">profile information</h2>
            <p className="text-xs text-gray-400 lowercase -mt-2">stored in your browser (localStorage)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="name" value={profile.name} onChange={(v) => setProfile((p) => ({ ...p, name: v }))} placeholder="Stalingrad S. Dollosa" />
              <Field label="portfolio handle" value={profile.portfolioHandle} onChange={(v) => setProfile((p) => ({ ...p, portfolioHandle: v }))} placeholder="@stal" />
            </div>
            <Field label="title / headline" value={profile.title} onChange={(v) => setProfile((p) => ({ ...p, title: v }))} placeholder="project manager · content strategist" />
            <Field label="specialisation" value={profile.specialisation} onChange={(v) => setProfile((p) => ({ ...p, specialisation: v }))} placeholder="I specialise in..." />
            <Field label="about me" value={profile.about} onChange={(v) => setProfile((p) => ({ ...p, about: v }))} placeholder="Your bio..." textarea />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="location" value={profile.location} onChange={(v) => setProfile((p) => ({ ...p, location: v }))} placeholder="City, Country" />
              <Field label="website" value={profile.website} onChange={(v) => setProfile((p) => ({ ...p, website: v }))} placeholder="stalfolio.com" />
              <Field label="email" value={profile.email} onChange={(v) => setProfile((p) => ({ ...p, email: v }))} placeholder="you@email.com" />
            </div>
            <hr className="border-gray-100" />
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">images (paste url)</h3>
            <Field label="resume url (for download button)" value={profile.resumeUrl} onChange={(v) => setProfile((p) => ({ ...p, resumeUrl: v }))} placeholder="https://..." />
            <hr className="border-gray-100" />
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">images (upload or paste url)</h3>
            <ImageUploader
              label="avatar"
              value={profile.avatarUrl}
              onChange={(v) => setProfile((p) => ({ ...p, avatarUrl: v }))}
              folder="avatars"
              aspectRatio="1/1"
            />
            <ImageUploader
              label="banner"
              value={profile.bannerUrl}
              onChange={(v) => setProfile((p) => ({ ...p, bannerUrl: v }))}
              folder="banners"
              aspectRatio="16/5"
            />
            <button onClick={handleSaveProfile} className="mt-2 self-end flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl lowercase transition-colors">
              <Check size={14} />save profile
            </button>
          </div>
        )}

        {/* ── Experience ───────────────────────────────────────────── */}
        {activeTab === "experience" && (
          <div className="flex flex-col gap-3">
            {experience.map((exp) => (
              <div key={exp.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                {editingExpId === exp.id ? (
                  <div className="p-5 flex flex-col gap-3 border border-gray-900 rounded-2xl">
                    <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">edit experience</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="role" value={editExpDraft.role} onChange={(v) => setEditExpDraft((e) => ({ ...e, role: v }))} placeholder="Product Manager" />
                      <Field label="company" value={editExpDraft.company} onChange={(v) => setEditExpDraft((e) => ({ ...e, company: v }))} placeholder="Acme Corp" />
                      <Field label="start date" value={editExpDraft.startDate} onChange={(v) => setEditExpDraft((e) => ({ ...e, startDate: v }))} placeholder="Jan 2022" />
                      <Field label="end date" value={editExpDraft.endDate} onChange={(v) => setEditExpDraft((e) => ({ ...e, endDate: v }))} placeholder="Present" />
                      <Field label="logo text (2 chars)" value={editExpDraft.logoText || ""} onChange={(v) => setEditExpDraft((e) => ({ ...e, logoText: v.slice(0, 2).toUpperCase() }))} placeholder="AC" />
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">logo color</label>
                        <input type="color" value={editExpDraft.logoColor || "#1a1a1a"} onChange={(e) => setEditExpDraft((n) => ({ ...n, logoColor: e.target.value }))} className="h-10 w-full rounded-xl border border-gray-200 cursor-pointer" />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end mt-1">
                      <button onClick={() => setEditingExpId(null)} className="text-sm text-gray-500 px-4 py-2 rounded-xl hover:bg-gray-100 lowercase">cancel</button>
                      <button onClick={handleUpdateExp} className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-xl lowercase">
                        <Check size={13} />save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 flex items-center gap-4">
                    <GripVertical size={14} className="text-gray-300 flex-shrink-0" />
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: exp.logoColor || "#1a1a1a" }}>
                      {exp.logoText || exp.company.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 lowercase truncate">{exp.role}</p>
                      <p className="text-xs text-gray-500 lowercase truncate">{exp.company} · {exp.startDate} – {exp.endDate}</p>
                    </div>
                    <button onClick={() => { setEditingExpId(exp.id); setEditExpDraft({ company: exp.company, role: exp.role, startDate: exp.startDate, endDate: exp.endDate, logoText: exp.logoText, logoColor: exp.logoColor }); }} className="flex-shrink-0 h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors group">
                      <Pencil size={13} className="text-gray-400 group-hover:text-gray-700 transition-colors" />
                    </button>
                    <button onClick={() => handleDeleteExp(exp.id)} className="flex-shrink-0 h-8 w-8 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors group">
                      <Trash2 size={13} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {addingExp ? (
              <div className="bg-white border border-gray-900 rounded-2xl p-5 flex flex-col gap-3">
                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">new experience</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="role" value={newExp.role} onChange={(v) => setNewExp((e) => ({ ...e, role: v }))} placeholder="Product Manager" />
                  <Field label="company" value={newExp.company} onChange={(v) => setNewExp((e) => ({ ...e, company: v }))} placeholder="Acme Corp" />
                  <Field label="start date" value={newExp.startDate} onChange={(v) => setNewExp((e) => ({ ...e, startDate: v }))} placeholder="Jan 2022" />
                  <Field label="end date" value={newExp.endDate} onChange={(v) => setNewExp((e) => ({ ...e, endDate: v }))} placeholder="Present" />
                  <Field label="logo text (2 chars)" value={newExp.logoText || ""} onChange={(v) => setNewExp((e) => ({ ...e, logoText: v.slice(0, 2).toUpperCase() }))} placeholder="AC" />
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">logo color</label>
                    <input type="color" value={newExp.logoColor || "#1a1a1a"} onChange={(e) => setNewExp((n) => ({ ...n, logoColor: e.target.value }))} className="h-10 w-full rounded-xl border border-gray-200 cursor-pointer" />
                  </div>
                </div>
                <div className="flex gap-2 justify-end mt-1">
                  <button onClick={() => setAddingExp(false)} className="text-sm text-gray-500 px-4 py-2 rounded-xl hover:bg-gray-100 lowercase">cancel</button>
                  <button onClick={handleAddExp} className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-xl lowercase">
                    <Plus size={13} />add
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingExp(true)} className="flex items-center justify-center gap-2 w-full border border-dashed border-gray-300 rounded-2xl py-3.5 text-sm font-medium text-gray-500 hover:text-gray-800 hover:border-gray-500 lowercase transition-colors">
                <Plus size={15} />add experience
              </button>
            )}
          </div>
        )}

        {/* ── Recent Work ──────────────────────────────────────────── */}
        {activeTab === "work" && (
          <div className="flex flex-col gap-3">
            {recentWork.map((work) => (
              <div key={work.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                {editingWorkId === work.id ? (
                  <div className="p-5 flex flex-col gap-3 border border-gray-900 rounded-2xl">
                    <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">edit certification</h3>
                    <Field label="title" value={editWorkDraft.title} onChange={(v) => setEditWorkDraft((w) => ({ ...w, title: v }))} placeholder="Certification name" />
                    <ImageUploader label="image" value={editWorkDraft.imageUrl || ""} onChange={(v) => setEditWorkDraft((w) => ({ ...w, imageUrl: v }))} folder="work" aspectRatio="4/3" />
                    <Field label="link (optional)" value={editWorkDraft.link || ""} onChange={(v) => setEditWorkDraft((w) => ({ ...w, link: v }))} placeholder="https://..." />
                    <div className="flex gap-2 justify-end mt-1">
                      <button onClick={() => setEditingWorkId(null)} className="text-sm text-gray-500 px-4 py-2 rounded-xl hover:bg-gray-100 lowercase">cancel</button>
                      <button onClick={handleUpdateWork} className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-xl lowercase">
                        <Check size={13} />save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {work.imageUrl ? <img src={work.imageUrl} alt={work.title} className="w-full h-full object-cover" /> : <span className="text-[9px] text-gray-300 font-bold uppercase">{work.title.slice(0, 2)}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 lowercase truncate">{work.title}</p>
                      <p className="text-xs text-gray-400 truncate">{work.link || "no link"}</p>
                    </div>
                    <button onClick={() => { setEditingWorkId(work.id); setEditWorkDraft({ title: work.title, imageUrl: work.imageUrl, link: work.link }); }} className="flex-shrink-0 h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors group">
                      <Pencil size={13} className="text-gray-400 group-hover:text-gray-700 transition-colors" />
                    </button>
                    <button onClick={() => handleDeleteWork(work.id)} className="flex-shrink-0 h-8 w-8 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors group">
                      <Trash2 size={13} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {addingWork ? (
              <div className="bg-white border border-gray-900 rounded-2xl p-5 flex flex-col gap-3">
                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">new certification</h3>
                <Field label="title" value={newWork.title} onChange={(v) => setNewWork((w) => ({ ...w, title: v }))} placeholder="Project name" />
                <ImageUploader
                  label="image"
                  value={newWork.imageUrl || ""}
                  onChange={(v) => setNewWork((w) => ({ ...w, imageUrl: v }))}
                  folder="work"
                  aspectRatio="4/3"
                />
                <Field label="link (optional)" value={newWork.link || ""} onChange={(v) => setNewWork((w) => ({ ...w, link: v }))} placeholder="https://..." />
                <div className="flex gap-2 justify-end mt-1">
                  <button onClick={() => setAddingWork(false)} className="text-sm text-gray-500 px-4 py-2 rounded-xl hover:bg-gray-100 lowercase">cancel</button>
                  <button onClick={handleAddWork} className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-xl lowercase">
                    <Plus size={13} />add
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingWork(true)} className="flex items-center justify-center gap-2 w-full border border-dashed border-gray-300 rounded-2xl py-3.5 text-sm font-medium text-gray-500 hover:text-gray-800 hover:border-gray-500 lowercase transition-colors">
                <Plus size={15} />add certification
              </button>
            )}
          </div>
        )}

        {/* ── Projects ─────────────────────────────────────────────── */}
        {activeTab === "projects" && (
          <div className="flex flex-col gap-3">
            {projects.map((proj) => (
              <div key={proj.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                {editingProjectId === proj.id ? (
                  <div className="p-5 flex flex-col gap-3 border border-gray-900 rounded-2xl">
                    <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">edit project</h3>
                    <Field label="title" value={editProjectDraft.title} onChange={(v) => setEditProjectDraft((p) => ({ ...p, title: v, slug: p.slug || slugify(v) }))} placeholder="My awesome project" />
                    <Field label="slug (url)" value={editProjectDraft.slug} onChange={(v) => setEditProjectDraft((p) => ({ ...p, slug: slugify(v) }))} placeholder="my-awesome-project" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="category" value={editProjectDraft.category || ""} onChange={(v) => setEditProjectDraft((p) => ({ ...p, category: v }))} placeholder="case study" />
                      <Field label="external link (optional)" value={editProjectDraft.link || ""} onChange={(v) => setEditProjectDraft((p) => ({ ...p, link: v }))} placeholder="https://..." />
                    </div>
                    <Field label="short description" value={editProjectDraft.description} onChange={(v) => setEditProjectDraft((p) => ({ ...p, description: v }))} placeholder="One or two sentences..." textarea rows={2} />
                    <ImageUploader label="thumbnail" value={editProjectDraft.imageUrl || ""} onChange={(v) => setEditProjectDraft((p) => ({ ...p, imageUrl: v }))} folder="projects" aspectRatio="16/9" enableCrop cropAspect={16 / 9} />
                    <ImageUploader label="cover image" value={editProjectDraft.coverImageUrl || ""} onChange={(v) => setEditProjectDraft((p) => ({ ...p, coverImageUrl: v }))} folder="covers" aspectRatio="2.4/1" enableCrop cropAspect={2.4} />
                    <Field label="article content (markdown)" value={editProjectDraft.content || ""} onChange={(v) => setEditProjectDraft((p) => ({ ...p, content: v }))} placeholder="## intro..." textarea rows={10} />
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">tags</label>
                      <div className="flex gap-2">
                        <input type="text" value={editTagInput} onChange={(e) => setEditTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const t = editTagInput.trim().toLowerCase(); if (t && !editProjectDraft.tags.includes(t)) { setEditProjectDraft((p) => ({ ...p, tags: [...p.tags, t] })); setEditTagInput(""); } } }} placeholder="add tag + enter" className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all lowercase" />
                        <button onClick={() => { const t = editTagInput.trim().toLowerCase(); if (t && !editProjectDraft.tags.includes(t)) { setEditProjectDraft((p) => ({ ...p, tags: [...p.tags, t] })); setEditTagInput(""); } }} className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 lowercase">add</button>
                      </div>
                      {editProjectDraft.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {editProjectDraft.tags.map((t) => (
                            <button key={t} onClick={() => setEditProjectDraft((p) => ({ ...p, tags: p.tags.filter((x) => x !== t) }))} className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full lowercase hover:bg-red-50 hover:text-red-500 transition-colors">{t} ×</button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 justify-end mt-1">
                      <button onClick={() => { setEditingProjectId(null); setEditTagInput(""); }} className="text-sm text-gray-500 px-4 py-2 rounded-xl hover:bg-gray-100 lowercase">cancel</button>
                      <button onClick={handleUpdateProject} className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-xl lowercase">
                        <Check size={13} />save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 flex items-start gap-4">
                    <GripVertical size={14} className="text-gray-300 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 lowercase">{proj.title}</p>
                      <p className="text-[10px] text-gray-400 lowercase font-mono mt-0.5">/posts/{proj.slug}</p>
                      <p className="text-xs text-gray-500 lowercase mt-0.5 line-clamp-1">{proj.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {proj.tags.map((t) => (
                          <span key={t} className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full lowercase">{t}</span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => { setEditingProjectId(proj.id); setEditProjectDraft({ slug: proj.slug, title: proj.title, description: proj.description, content: proj.content, tags: [...proj.tags], imageUrl: proj.imageUrl, coverImageUrl: proj.coverImageUrl, category: proj.category, link: proj.link, publishedAt: proj.publishedAt }); }} className="flex-shrink-0 h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center group">
                      <Pencil size={13} className="text-gray-400 group-hover:text-gray-700 transition-colors" />
                    </button>
                    <button onClick={() => handleDeleteProject(proj.id)} className="flex-shrink-0 h-8 w-8 rounded-full hover:bg-red-50 flex items-center justify-center group">
                      <Trash2 size={13} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {addingProject ? (
              <div className="bg-white border border-gray-900 rounded-2xl p-5 flex flex-col gap-3">
                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">new project</h3>
                <Field
                  label="title"
                  value={newProject.title}
                  onChange={(v) => setNewProject((p) => ({ ...p, title: v, slug: p.slug || slugify(v) }))}
                  placeholder="My awesome project"
                />
                <Field
                  label="slug (url)"
                  value={newProject.slug}
                  onChange={(v) => setNewProject((p) => ({ ...p, slug: slugify(v) }))}
                  placeholder="my-awesome-project"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="category" value={newProject.category || ""} onChange={(v) => setNewProject((p) => ({ ...p, category: v }))} placeholder="case study" />
                  <Field label="external link (optional)" value={newProject.link || ""} onChange={(v) => setNewProject((p) => ({ ...p, link: v }))} placeholder="https://..." />
                </div>
                <Field label="short description (shown on cards)" value={newProject.description} onChange={(v) => setNewProject((p) => ({ ...p, description: v }))} placeholder="One or two sentences..." textarea rows={2} />
                <ImageUploader
                  label="thumbnail (shown on cards)"
                  value={newProject.imageUrl || ""}
                  onChange={(v) => setNewProject((p) => ({ ...p, imageUrl: v }))}
                  folder="projects"
                  aspectRatio="16/9"
                  enableCrop
                  cropAspect={16 / 9}
                />
                <ImageUploader
                  label="cover image (blog page hero)"
                  value={newProject.coverImageUrl || ""}
                  onChange={(v) => setNewProject((p) => ({ ...p, coverImageUrl: v }))}
                  folder="covers"
                  aspectRatio="2.4/1"
                  enableCrop
                  cropAspect={2.4}
                />
                <Field
                  label="article content (markdown)"
                  value={newProject.content || ""}
                  onChange={(v) => setNewProject((p) => ({ ...p, content: v }))}
                  placeholder={`## intro\n\nWrite your article here in markdown...\n\n## what we did\n\n- point one\n- point two`}
                  textarea
                  rows={10}
                />

                {/* Tags */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">tags</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      placeholder="add tag + enter"
                      className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all lowercase"
                    />
                    <button onClick={addTag} className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 lowercase transition-colors">add</button>
                  </div>
                  {newProject.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {newProject.tags.map((t) => (
                        <button key={t} onClick={() => setNewProject((p) => ({ ...p, tags: p.tags.filter((x) => x !== t) }))} className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full lowercase hover:bg-red-50 hover:text-red-500 transition-colors">
                          {t} ×
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 justify-end mt-1">
                  <button onClick={() => setAddingProject(false)} className="text-sm text-gray-500 px-4 py-2 rounded-xl hover:bg-gray-100 lowercase">cancel</button>
                  <button onClick={handleAddProject} className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-xl lowercase">
                    <Plus size={13} />add certification
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingProject(true)} className="flex items-center justify-center gap-2 w-full border border-dashed border-gray-300 rounded-2xl py-3.5 text-sm font-medium text-gray-500 hover:text-gray-800 hover:border-gray-500 lowercase transition-colors">
                <Plus size={15} />add project
              </button>
            )}
          </div>
        )}

        {/* ── Links ────────────────────────────────────────────────── */}
        {activeTab === "links" && (
          <div className="flex flex-col gap-3">
            {links.map((lnk) => (
              <div key={lnk.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                {editingLinkId === lnk.id ? (
                  <div className="p-5 flex flex-col gap-3 border border-gray-900 rounded-2xl">
                    <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">edit link</h3>
                    <ImageUploader label="icon" value={editLinkDraft.imageUrl} onChange={(url) => setEditLinkDraft((l) => ({ ...l, imageUrl: url }))} folder="link-icons" aspectRatio="1/1" />
                    <Field label="label" value={editLinkDraft.label} onChange={(v) => setEditLinkDraft((l) => ({ ...l, label: v }))} placeholder="linkedin" />
                    <Field label="url" value={editLinkDraft.url} onChange={(v) => setEditLinkDraft((l) => ({ ...l, url: v }))} placeholder="https://..." />
                    <div className="flex gap-2 justify-end mt-1">
                      <button onClick={() => setEditingLinkId(null)} className="text-sm text-gray-500 px-4 py-2 rounded-xl hover:bg-gray-100 lowercase">cancel</button>
                      <button onClick={handleUpdateLink} className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-xl lowercase">
                        <Check size={13} />save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {getPlatform(lnk.abbr) ? (
                        <LinkIcon platform={lnk.abbr} size={36} />
                      ) : lnk.imageUrl ? (
                        <div className="h-9 w-9 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                          <img src={lnk.imageUrl} alt={lnk.label} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-9 w-9 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
                          <span className="text-[9px] font-black text-gray-300 uppercase tracking-wide">{lnk.abbr || lnk.label.slice(0, 2)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 lowercase truncate">{lnk.label}</p>
                      <p className="text-xs text-gray-400 truncate">{lnk.url || "no url"}</p>
                    </div>
                    <button onClick={() => { setEditingLinkId(lnk.id); setEditLinkDraft({ label: lnk.label, abbr: lnk.abbr, url: lnk.url, imageUrl: lnk.imageUrl || "" }); }} className="flex-shrink-0 h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center group">
                      <Pencil size={13} className="text-gray-400 group-hover:text-gray-700 transition-colors" />
                    </button>
                    <button onClick={() => handleDeleteLink(lnk.id)} className="flex-shrink-0 h-8 w-8 rounded-full hover:bg-red-50 flex items-center justify-center group">
                      <Trash2 size={13} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {addingLink ? (
              <div className="bg-white border border-gray-900 rounded-2xl p-5 flex flex-col gap-3">
                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">new link</h3>
                <ImageUploader
                  label="icon"
                  value={newLink.imageUrl}
                  onChange={(url) => setNewLink((l) => ({ ...l, imageUrl: url }))}
                  folder="link-icons"
                  aspectRatio="1/1"
                />
                <Field label="label" value={newLink.label} onChange={(v) => setNewLink((l) => ({ ...l, label: v }))} placeholder="linkedin" />
                <Field label="url" value={newLink.url} onChange={(v) => setNewLink((l) => ({ ...l, url: v }))} placeholder="https://linkedin.com/in/..." />
                <div className="flex gap-2 justify-end mt-1">
                  <button onClick={() => setAddingLink(false)} className="text-sm text-gray-500 px-4 py-2 rounded-xl hover:bg-gray-100 lowercase">cancel</button>
                  <button onClick={handleAddLink} className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-xl lowercase">
                    <Plus size={13} />add link
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingLink(true)} className="flex items-center justify-center gap-2 w-full border border-dashed border-gray-300 rounded-2xl py-3.5 text-sm font-medium text-gray-500 hover:text-gray-800 hover:border-gray-500 lowercase transition-colors">
                <Plus size={15} />add link
              </button>
            )}
          </div>
        )}
      </div>  {/* end admin section */}

      <Toast show={toast.show} message={toast.message} />
    </main>
  );
}
