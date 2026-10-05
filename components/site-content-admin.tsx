"use client";

/* ─────────────────────────────────────────────────────────────────────
   /admin → "site" section: edits everything the desktop portfolio
   renders — the page copy in site_config plus the eight site_* lists.

   One generic field/row editor drives every table, so adding a column
   means adding a FieldSpec, not another CRUD screen. Image fields reuse
   the cropping uploader; leaving one empty keeps the site's drawn
   placeholder for that slot.
   ───────────────────────────────────────────────────────────────────── */

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { ImageUploader } from "@/components/image-uploader";
import * as site from "@/lib/site-admin-service";
import type { SiteRow, SiteTable } from "@/lib/site-admin-service";
import { SEED_CONTENT } from "@/lib/desktop/seed";

/* ─── Field specs ────────────────────────────────────────────────── */

type FieldType =
  | "text"
  | "textarea"
  | "bool"
  | "select"
  | "lines"   // text[] — one entry per line
  | "pairs"   // [[a,b], …] — one "a | b" per line
  | "image";

interface FieldSpec {
  k: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  /** image: storage subfolder and preview shape */
  folder?: string;
  aspect?: string;
  cropAspect?: number;
  hint?: string;
  /** Render at full width inside the two-column grid. */
  wide?: boolean;
}

interface TableSpec {
  table: SiteTable;
  tab: string;
  title: string;
  blurb: string;
  /** Short label for a collapsed row. */
  rowTitle: (r: SiteRow) => string;
  rowNote?: (r: SiteRow) => string;
  fields: FieldSpec[];
}

const CATS = ["systems", "ai", "ventures"];
const STATUS_KINDS = ["live", "beta", "dev"];
const SKILL_GROUPS = ["ai", "lang", "web", "infra", "craft"];
/** Keys understood by lib/desktop/art.ts; used when no image is attached. */
const ART_KEYS = [
  "browser", "graph", "shield", "align", "phone",
  "lots", "chat", "scan", "edu", "menu", "euclid", "spend",
];

const TABLE_SPECS: TableSpec[] = [
  {
    table: "site_projects",
    tab: "projects",
    title: "projects & case studies",
    blurb: "every card and case study. nda projects must never name the client.",
    rowTitle: (r) => r.name || r.slug,
    rowNote: (r) => `${r.cat} · ${r.status_label || r.status_kind}`,
    fields: [
      { k: "name", label: "name", type: "text", placeholder: "Real Estate Sales & Property System" },
      { k: "slug", label: "slug (url id, #p-<slug>)", type: "text", placeholder: "real-estate-pmss" },
      { k: "cat", label: "folder", type: "select", options: CATS },
      { k: "file", label: "filename in the title bar", type: "text", placeholder: "pmss.app" },
      { k: "status_kind", label: "status dot", type: "select", options: STATUS_KINDS },
      { k: "status_label", label: "status label", type: "text", placeholder: "Live · v2" },
      { k: "industry", label: "industry (shown instead of a client name)", type: "text", placeholder: "Real estate developer" },
      { k: "nda", label: "under nda — hide the client", type: "bool" },
      { k: "tag", label: "one-line pitch", type: "textarea", wide: true },
      { k: "summary", label: "overview paragraph", type: "textarea", wide: true },
      { k: "features", label: "what it does (one per line)", type: "lines", wide: true },
      { k: "flow", label: "how it works — pipeline steps (one per line)", type: "lines", wide: true },
      { k: "numbers", label: "by the numbers (one 'value | label' per line)", type: "pairs", wide: true },
      { k: "stack", label: "stack chips (one per line)", type: "lines", wide: true },
      { k: "role", label: "my role", type: "textarea", wide: true },
      { k: "repo", label: "public repo url (leave empty for nda or private work)", type: "text" },
      { k: "priv", label: "repo is private — show a disabled chip", type: "bool" },
      { k: "live", label: "live site url", type: "text" },
      { k: "install", label: "try it command", type: "text", placeholder: "pipx install cascaid" },
      { k: "award", label: "award banner", type: "text" },
      { k: "pending", label: "case study not written yet", type: "bool" },
      {
        k: "art", label: "placeholder art (used until you attach an image)",
        type: "select", options: ART_KEYS,
      },
      {
        k: "image_url", label: "card image", type: "image", folder: "projects",
        aspect: "2/1", cropAspect: 2, wide: true,
        hint: "shown on cards and feature rows. empty keeps the generated art.",
      },
      {
        k: "cover_image_url", label: "case study hero image", type: "image", folder: "projects",
        aspect: "21/5", cropAspect: 21 / 5, wide: true,
        hint: "wide banner at the top of the case study. empty falls back to the card image, then to the art.",
      },
    ],
  },
  {
    table: "site_experience",
    tab: "experience",
    title: "git log --career",
    blurb: "newest first. the top entry gets the HEAD → main ref.",
    rowTitle: (r) => r.title,
    rowNote: (r) => `${r.org}${r.when_label ? " · " + r.when_label : ""}`,
    fields: [
      { k: "title", label: "role", type: "text" },
      { k: "org", label: "organisation", type: "text" },
      { k: "when_label", label: "when", type: "text", placeholder: "now · previously · 2021–2026" },
      { k: "head", label: "current role (filled timeline node)", type: "bool" },
      { k: "body", label: "bullets (one per line)", type: "lines", wide: true },
    ],
  },
  {
    table: "site_awards",
    tab: "awards",
    title: "awards & features",
    blurb: "gold medal for awards, document icon for features.",
    rowTitle: (r) => r.title,
    rowNote: (r) => `${r.kind} · ${r.org}`,
    fields: [
      { k: "title", label: "title", type: "text" },
      { k: "org", label: "where", type: "text" },
      { k: "kind", label: "kind", type: "select", options: ["award", "feature"] },
      { k: "href", label: "link to a case study", type: "text", placeholder: "#p-hiway" },
      { k: "note", label: "note", type: "textarea", wide: true },
    ],
  },
  {
    table: "site_certs",
    tab: "certificates",
    title: "certificates",
    blurb: "shown in a Preview.app window. attach a scan or keep the drawn seal.",
    rowTitle: (r) => r.title,
    rowNote: (r) => r.org,
    fields: [
      { k: "title", label: "certificate", type: "text" },
      { k: "org", label: "issuer", type: "text" },
      { k: "note", label: "note", type: "textarea", wide: true },
      {
        k: "image_url", label: "scan", type: "image", folder: "certificates",
        aspect: "1/1", wide: true,
        hint: "empty shows the drawn seal instead.",
      },
    ],
  },
  {
    table: "site_skills",
    tab: "skills",
    title: "launchpad",
    blurb: "icon keys come from simple-icons (e.g. python, rust, nextdotjs). use txt:PM for a text tile.",
    rowTitle: (r) => r.label || r.icon,
    rowNote: (r) => r.group_key,
    fields: [
      { k: "icon", label: "icon key", type: "text", placeholder: "python  ·  txt:PM" },
      { k: "group_key", label: "group", type: "select", options: SKILL_GROUPS },
      { k: "label", label: "label (optional — defaults to the icon's name)", type: "text" },
    ],
  },
  {
    table: "site_research",
    tab: "research",
    title: "research.bib",
    blurb: "papers and theses listed on the writing page.",
    rowTitle: (r) => r.title,
    rowNote: (r) => r.when_label,
    fields: [
      { k: "title", label: "title", type: "text" },
      { k: "when_label", label: "when", type: "text", placeholder: "In progress" },
      { k: "note", label: "abstract / note", type: "textarea", wide: true },
      { k: "url", label: "url", type: "text" },
    ],
  },
  {
    table: "site_articles",
    tab: "articles",
    title: "articles.feed",
    blurb: "empty shows a designed empty state on the writing page.",
    rowTitle: (r) => r.title,
    rowNote: (r) => r.when_label,
    fields: [
      { k: "title", label: "title", type: "text" },
      { k: "when_label", label: "when", type: "text", placeholder: "Mar 2026" },
      { k: "note", label: "summary", type: "textarea", wide: true },
      { k: "url", label: "url", type: "text" },
    ],
  },
  {
    table: "site_side_quests",
    tab: "side quests",
    title: "also built",
    blurb: "smaller things, shown at the bottom of the about page.",
    rowTitle: (r) => r.title,
    fields: [
      { k: "title", label: "title", type: "text" },
      { k: "note", label: "note", type: "textarea", wide: true },
    ],
  },
];

/* ─── Errors ─────────────────────────────────────────────────────── */

const SETUP_HINT =
  "the site_* tables don't exist yet — paste supabase/site.sql into the supabase sql editor and run it, then press import below.";

/** Turns a missing-table error into setup instructions, anything else passes through. */
function explain(e: unknown): string {
  const m = (e as Error)?.message || String(e);
  return /schema cache|does not exist|relation .* does not exist/i.test(m) ? SETUP_HINT : m;
}

/* ─── Shared styles ──────────────────────────────────────────────── */

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all";
const labelCls = "text-[11px] font-semibold text-gray-400 uppercase tracking-widest";
const cardCls = "bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-4";
const btnCls =
  "flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl lowercase transition-colors";
const ghostCls =
  "flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 lowercase transition-colors";

/* ─── Value <-> textarea conversions ─────────────────────────────── */

const linesToText = (v: unknown) => (Array.isArray(v) ? v.join("\n") : "");
const textToLines = (t: string) =>
  t.split("\n").map((s) => s.trim()).filter(Boolean);

const pairsToText = (v: unknown) =>
  Array.isArray(v) ? v.map((p) => (Array.isArray(p) ? p.join(" | ") : String(p))).join("\n") : "";
const textToPairs = (t: string) =>
  t
    .split("\n")
    .map((line) => line.split("|").map((s) => s.trim()))
    .filter((p) => p[0])
    .map((p) => [p[0], p.slice(1).join(" | ")] as [string, string]);

/* ─── Generic field ──────────────────────────────────────────────── */

function FieldInput({
  spec,
  value,
  onChange,
}: {
  spec: FieldSpec;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (spec.type === "image") {
    return (
      <div className="flex flex-col gap-1">
        <ImageUploader
          label={spec.label}
          value={(value as string) || ""}
          onChange={onChange}
          folder={spec.folder}
          aspectRatio={spec.aspect}
          enableCrop
          cropAspect={spec.cropAspect}
        />
        {spec.hint && <span className="text-[11px] text-gray-400 lowercase">{spec.hint}</span>}
      </div>
    );
  }

  if (spec.type === "bool") {
    return (
      <label className="flex items-center gap-2.5 py-2 cursor-pointer">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 accent-gray-900"
        />
        <span className="text-xs font-semibold text-gray-600 lowercase">{spec.label}</span>
      </label>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <label className={labelCls}>{spec.label}</label>
      {spec.type === "select" ? (
        <select
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        >
          {spec.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : spec.type === "lines" ? (
        <textarea
          value={linesToText(value)}
          onChange={(e) => onChange(textToLines(e.target.value))}
          rows={4}
          placeholder={spec.placeholder}
          className={`${inputCls} resize-y font-mono text-[12.5px]`}
        />
      ) : spec.type === "pairs" ? (
        <textarea
          value={pairsToText(value)}
          onChange={(e) => onChange(textToPairs(e.target.value))}
          rows={3}
          placeholder={spec.placeholder || "4,000+ | lots mapped"}
          className={`${inputCls} resize-y font-mono text-[12.5px]`}
        />
      ) : spec.type === "textarea" ? (
        <textarea
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={spec.placeholder}
          className={`${inputCls} resize-y`}
        />
      ) : (
        <input
          type="text"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={spec.placeholder}
          className={inputCls}
        />
      )}
      {spec.hint && <span className="text-[11px] text-gray-400 lowercase">{spec.hint}</span>}
    </div>
  );
}

function FieldGrid({
  fields,
  draft,
  set,
}: {
  fields: FieldSpec[];
  draft: SiteRow;
  set: (k: string, v: unknown) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fields.map((f) => (
        <div key={f.k} className={f.wide || f.type === "image" ? "sm:col-span-2" : ""}>
          <FieldInput spec={f} value={draft[f.k]} onChange={(v) => set(f.k, v)} />
        </div>
      ))}
    </div>
  );
}

/* ─── Table editor ───────────────────────────────────────────────── */

function blankRow(spec: TableSpec): SiteRow {
  const r: SiteRow = {};
  for (const f of spec.fields) {
    r[f.k] =
      f.type === "bool" ? false
      : f.type === "lines" || f.type === "pairs" ? []
      : f.type === "select" ? f.options?.[0] ?? ""
      : "";
  }
  return r;
}

function TableEditor({
  spec,
  onToast,
  onError,
}: {
  spec: TableSpec;
  onToast: (m: string) => void;
  onError: (m: string) => void;
}) {
  const [rows, setRows] = useState<SiteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<SiteRow>(() => blankRow(spec));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<SiteRow>({});

  const load = useCallback(async () => {
    try {
      setRows(await site.listRows(spec.table));
    } catch (e) {
      onError(explain(e));
    } finally {
      setLoading(false);
    }
  }, [spec.table, onError]);

  useEffect(() => {
    load();
  }, [load]);

  const only = (r: SiteRow) => {
    const out: SiteRow = {};
    for (const f of spec.fields) out[f.k] = r[f.k];
    return out;
  };

  async function add() {
    try {
      const created = await site.createRow(spec.table, {
        ...only(draft),
        sort_order: rows.length,
      });
      setRows([...rows, created]);
      setDraft(blankRow(spec));
      setAdding(false);
      onToast("added");
    } catch (e) {
      onError(explain(e));
    }
  }

  async function save(id: string) {
    try {
      const updated = await site.updateRow(spec.table, id, only(editDraft));
      setRows(rows.map((r) => (r.id === id ? updated : r)));
      setEditingId(null);
      onToast("saved");
    } catch (e) {
      onError(explain(e));
    }
  }

  async function remove(id: string) {
    if (!confirm("delete this entry?")) return;
    try {
      await site.deleteRow(spec.table, id);
      setRows(rows.filter((r) => r.id !== id));
      onToast("deleted");
    } catch (e) {
      onError(explain(e));
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const next = [...rows];
    const to = index + dir;
    if (to < 0 || to >= next.length) return;
    [next[index], next[to]] = [next[to], next[index]];
    setRows(next);
    try {
      await site.reorderRows(spec.table, next.map((r) => r.id as string));
    } catch (e) {
      onError(explain(e));
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className={cardCls}>
        <div>
          <h2 className="text-sm font-bold text-gray-900 lowercase">{spec.title}</h2>
          <p className="text-xs text-gray-400 lowercase mt-1">{spec.blurb}</p>
        </div>
        {!rows.length && !loading && (
          <p className="text-xs text-gray-400 lowercase">
            no rows yet — the site is showing its seeded content for this section. add a row to take
            over, or press import above to bring in everything at once.
          </p>
        )}
      </div>

      {rows.map((r, i) =>
        editingId === r.id ? (
          <div key={r.id} className={cardCls}>
            <FieldGrid
              fields={spec.fields}
              draft={editDraft}
              set={(k, v) => setEditDraft((d) => ({ ...d, [k]: v }))}
            />
            <div className="flex items-center gap-3 justify-end">
              <button className={ghostCls} onClick={() => setEditingId(null)}>
                <X size={13} />
                cancel
              </button>
              <button className={btnCls} onClick={() => save(r.id as string)}>
                <Check size={14} />
                save
              </button>
            </div>
          </div>
        ) : (
          <div
            key={r.id}
            className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3"
          >
            <div className="flex flex-col">
              <button
                className="text-gray-300 hover:text-gray-700 disabled:opacity-30"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label="move up"
              >
                <ChevronUp size={14} />
              </button>
              <button
                className="text-gray-300 hover:text-gray-700 disabled:opacity-30"
                onClick={() => move(i, 1)}
                disabled={i === rows.length - 1}
                aria-label="move down"
              >
                <ChevronDown size={14} />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{spec.rowTitle(r)}</p>
              {spec.rowNote && (
                <p className="text-[11px] text-gray-400 lowercase truncate">{spec.rowNote(r)}</p>
              )}
            </div>
            <button
              className="text-gray-400 hover:text-gray-900"
              onClick={() => {
                setEditDraft({ ...blankRow(spec), ...only(r) });
                setEditingId(r.id as string);
              }}
              aria-label="edit"
            >
              <Pencil size={14} />
            </button>
            <button
              className="text-gray-300 hover:text-red-500"
              onClick={() => remove(r.id as string)}
              aria-label="delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )
      )}

      {adding ? (
        <div className={cardCls}>
          <h3 className="text-sm font-bold text-gray-900 lowercase">new entry</h3>
          <FieldGrid
            fields={spec.fields}
            draft={draft}
            set={(k, v) => setDraft((d) => ({ ...d, [k]: v }))}
          />
          <div className="flex items-center gap-3 justify-end">
            <button className={ghostCls} onClick={() => setAdding(false)}>
              <X size={13} />
              cancel
            </button>
            <button className={btnCls} onClick={add}>
              <Check size={14} />
              add
            </button>
          </div>
        </div>
      ) : (
        <button
          className="flex items-center justify-center gap-2 border border-dashed border-gray-200 rounded-2xl py-3 text-xs font-semibold text-gray-400 hover:text-gray-900 hover:border-gray-300 lowercase transition-colors"
          onClick={() => setAdding(true)}
        >
          <Plus size={14} />
          add to {spec.tab}
        </button>
      )}
    </div>
  );
}

/* ─── Copy editor (site_config) ──────────────────────────────────── */

const CONFIG_FIELDS: { group: string; fields: FieldSpec[] }[] = [
  {
    group: "contact & links",
    fields: [
      { k: "email", label: "email shown on the site", type: "text" },
      { k: "github_url", label: "github url", type: "text" },
      {
        k: "form_endpoint", label: "external form endpoint", type: "text", wide: true,
        hint: "leave empty to send through this app's own /api/contact (resend).",
      },
    ],
  },
  {
    group: "images",
    fields: [
      {
        k: "profile_photo_url", label: "profile photo (photo booth window)", type: "image",
        folder: "profile", aspect: "4/5", cropAspect: 4 / 5, wide: true,
        hint: "empty shows the 'photo goes here' placeholder.",
      },
      {
        k: "og_image_url", label: "social preview image", type: "image",
        folder: "og", aspect: "1200/630", cropAspect: 1200 / 630, wide: true,
        hint: "empty generates a designed preview card instead.",
      },
    ],
  },
  {
    group: "hero",
    fields: [
      { k: "hero_name", label: "big name", type: "text" },
      { k: "hero_eyebrow", label: "eyebrow pill", type: "text" },
      { k: "hero_sub", label: "subline", type: "textarea", wide: true },
      { k: "hero_fine", label: "fine print under the buttons", type: "text", wide: true },
      { k: "hero_bubble", label: "floating speech bubble", type: "text" },
      { k: "now_lines", label: "now.txt lines (one per line)", type: "lines" },
    ],
  },
  {
    group: "stats strip",
    fields: [
      { k: "stats_file", label: "window filename", type: "text" },
      {
        k: "stats", label: "stats (one 'value | label' per line)", type: "pairs", wide: true,
        placeholder: "4,000+ | real estate lots mapped across 4 developments",
      },
    ],
  },
  {
    group: "currently",
    fields: [
      { k: "currently_heading", label: "heading", type: "text" },
      { k: "currently_desc", label: "description", type: "textarea", wide: true },
    ],
  },
  {
    group: "selected work",
    fields: [
      {
        k: "featured", label: "featured project slugs (one per line, in order)", type: "lines",
        hint: "three works best. slugs must match the projects tab.",
      },
      { k: "featured_bubbles", label: "bubble per featured project (one per line)", type: "lines" },
    ],
  },
  {
    group: "about",
    fields: [
      { k: "bio_heading", label: "heading", type: "text" },
      { k: "bio", label: "paragraphs (one per line)", type: "lines", wide: true },
      {
        k: "facts", label: "quick facts (one 'label | value' per line)", type: "pairs", wide: true,
        placeholder: "based in | Bacolod City, PH",
      },
    ],
  },
  {
    group: "work with me",
    fields: [
      { k: "pricing_note", label: "note under the pricing cards", type: "textarea", wide: true },
      { k: "cta_heading", label: "home cta heading", type: "text" },
      { k: "cta_sub", label: "home cta subline", type: "text" },
    ],
  },
  {
    group: "footer",
    fields: [{ k: "footer_blurb", label: "based in", type: "textarea", wide: true }],
  },
];

/** Keys edited through the structured JSON editors below. */
const JSON_KEYS: { k: string; label: string; blurb: string }[] = [
  { k: "currently", label: "currently cards", blurb: "{file, role, title, body} — body may contain one [text](#hash) link." },
  { k: "tiers", label: "pricing tiers", blurb: "{name, amt, from, hl, file, items[]}" },
  { k: "steps", label: "process steps", blurb: "{title, note}" },
  { k: "cats", label: "folder labels", blurb: "{systems|ai|ventures: {label, short, title, desc}}" },
];

function configRowFromSeed(): SiteRow {
  const c = SEED_CONTENT.config;
  return {
    email: c.email,
    github_url: c.githubUrl,
    form_endpoint: c.formEndpoint,
    profile_photo_url: c.profilePhoto,
    og_image_url: c.ogImageUrl,
    hero_name: c.heroName,
    hero_eyebrow: c.heroEyebrow,
    hero_sub: c.heroSub,
    hero_fine: c.heroFine,
    hero_bubble: c.heroBubble,
    now_lines: c.nowLines,
    stats_file: c.statsFile,
    stats: c.stats.map((s) => [s.value, s.label]),
    currently_heading: c.currentlyHeading,
    currently_desc: c.currentlyDesc,
    currently: c.currently,
    featured: c.featured,
    featured_bubbles: c.featuredBubbles,
    bio_heading: c.bioHeading,
    bio: c.bio,
    facts: c.facts,
    tiers: c.tiers,
    pricing_note: c.pricingNote,
    steps: c.steps,
    cta_heading: c.ctaHeading,
    cta_sub: c.ctaSub,
    footer_blurb: c.footerBlurb,
    cats: c.cats,
  };
}

/* stats are stored as [{value,label}] but edited as pairs. */
const statsToPairs = (v: unknown) =>
  Array.isArray(v)
    ? v.map((s) =>
        Array.isArray(s) ? s : [String(s?.value ?? ""), String(s?.label ?? "")]
      )
    : [];
const pairsToStats = (v: unknown) =>
  Array.isArray(v)
    ? v.map((p) => (Array.isArray(p) ? { value: p[0], label: p[1] } : p))
    : [];

function CopyEditor({
  onToast,
  onError,
}: {
  onToast: (m: string) => void;
  onError: (m: string) => void;
}) {
  const [draft, setDraft] = useState<SiteRow>({});
  const [jsonText, setJsonText] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    (async () => {
      /* The editor always starts from the seed — that is what the site
         renders until the tables are filled — then the stored row is
         merged over it, field by field. */
      const base = configRowFromSeed();
      let row: SiteRow | null = null;
      try {
        row = await site.getConfigRow();
      } catch (e) {
        onError(explain(e));
      }
      {
        const isBlank = !row || !row.hero_name;
        const merged: SiteRow = { ...base };
        if (row) {
          for (const [k, v] of Object.entries(row)) {
            const emptyStr = typeof v === "string" && !v.length;
            const emptyArr = Array.isArray(v) && !v.length;
            const emptyObj =
              v && typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length;
            if (v !== null && !emptyStr && !emptyArr && !emptyObj) merged[k] = v;
          }
        }
        merged.stats = statsToPairs(merged.stats);
        setSeeded(isBlank);
        setDraft(merged);
        setJsonText(
          Object.fromEntries(
            JSON_KEYS.map(({ k }) => [k, JSON.stringify(merged[k] ?? (k === "cats" ? {} : []), null, 2)])
          )
        );
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    const row: SiteRow = { ...draft, stats: pairsToStats(draft.stats) };
    for (const { k, label } of JSON_KEYS) {
      try {
        row[k] = JSON.parse(jsonText[k] || (k === "cats" ? "{}" : "[]"));
      } catch {
        onError(`${label}: not valid json`);
        return;
      }
    }
    try {
      await site.saveConfigRow(row);
      setSeeded(false);
      onToast("saved");
    } catch (e) {
      onError(explain(e));
    }
  }

  if (loading) return <p className="text-xs text-gray-400 lowercase">loading…</p>;

  return (
    <div className="flex flex-col gap-3">
      {seeded && (
        <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-700 lowercase">
          this is the seeded copy, not saved rows yet. press save to store it in supabase.
        </div>
      )}

      {CONFIG_FIELDS.map(({ group, fields }) => (
        <div key={group} className={cardCls}>
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{group}</h3>
          <FieldGrid
            fields={fields}
            draft={draft}
            set={(k, v) => setDraft((d) => ({ ...d, [k]: v }))}
          />
        </div>
      ))}

      {JSON_KEYS.map(({ k, label, blurb }) => (
        <div key={k} className={cardCls}>
          <div>
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</h3>
            <p className="text-[11px] text-gray-400 lowercase mt-1 font-mono">{blurb}</p>
          </div>
          <textarea
            value={jsonText[k] ?? ""}
            onChange={(e) => setJsonText((t) => ({ ...t, [k]: e.target.value }))}
            rows={10}
            spellCheck={false}
            className={`${inputCls} resize-y font-mono text-[12px]`}
          />
        </div>
      ))}

      <button className={`${btnCls} self-end`} onClick={save}>
        <Check size={14} />
        save site copy
      </button>
    </div>
  );
}

/* ─── Import ─────────────────────────────────────────────────────── */

type ImportReport = { table: string; status: "imported" | "skipped"; count: number }[];

/**
 * One-click import of the seeded content. Runs as the signed-in admin,
 * so it needs no service-role key — just the session you already have.
 */
function ImportPanel({
  onError,
  onDone,
}: {
  onError: (m: string) => void;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [open, setOpen] = useState(false);

  async function run(replace: boolean) {
    if (replace && !confirm("replace every row in the site_* tables with the seeded content?")) return;
    setBusy(true);
    setReport(null);
    try {
      setReport(await site.importSeedContent(replace));
      onDone();
    } catch (e) {
      onError(explain(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cardCls}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-gray-900 lowercase">import seeded content</h3>
          <p className="text-xs text-gray-400 lowercase mt-1">
            copies everything from the handover into supabase so you can edit it here. tables that
            already have rows are left alone.
          </p>
        </div>
        <button className={btnCls} onClick={() => run(false)} disabled={busy}>
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          {busy ? "importing…" : "import"}
        </button>
      </div>

      {report && (
        <div className="flex flex-col gap-1 text-xs lowercase">
          {report.map((r) => (
            <div key={r.table} className="flex items-center justify-between gap-3">
              <span className="font-mono text-gray-500">{r.table}</span>
              <span className={r.status === "imported" ? "text-green-600" : "text-gray-400"}>
                {r.status === "imported" ? `imported ${r.count}` : `skipped — ${r.count} rows already`}
              </span>
            </div>
          ))}
          <p className="text-gray-400 mt-1">
            images were left empty on purpose — attach them in the tabs above.
          </p>
        </div>
      )}

      <button
        className="self-start text-[11px] font-semibold text-gray-300 hover:text-red-500 lowercase"
        onClick={() => (open ? run(true) : setOpen(true))}
        disabled={busy}
      >
        {open ? "confirm: replace everything with the seed" : "re-import and replace existing rows"}
      </button>
    </div>
  );
}

/* ─── Section shell ──────────────────────────────────────────────── */

const TABS = ["copy", ...TABLE_SPECS.map((s) => s.tab)];

export function SiteContentAdmin() {
  const [tab, setTab] = useState<string>("copy");
  /* Bumped after an import so the open editor refetches. */
  const [nonce, setNonce] = useState(0);
  const [toast, setToast] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onToast = useCallback((m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 1800);
  }, []);
  const onError = useCallback((m: string) => setError(m), []);

  const spec = TABLE_SPECS.find((s) => s.tab === tab);

  return (
    <div className="flex flex-col gap-5 pb-24">
      <div>
        <h1 className="text-base font-bold text-gray-900 lowercase">site content</h1>
        <p className="text-xs text-gray-400 lowercase mt-1">
          everything the portfolio renders. sections with no rows fall back to the seeded copy, and
          empty image fields keep the site&apos;s drawn placeholders.
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 lowercase flex items-start justify-between gap-3">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-semibold flex-shrink-0">
            dismiss
          </button>
        </div>
      )}

      <ImportPanel onError={onError} onDone={() => setNonce((n) => n + 1)} />

      <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1.5 w-full overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold lowercase whitespace-nowrap transition-colors ${
              tab === t ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "copy" ? (
        <CopyEditor key={nonce} onToast={onToast} onError={onError} />
      ) : spec ? (
        <TableEditor key={spec.table + nonce} spec={spec} onToast={onToast} onError={onError} />
      ) : null}

      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg lowercase transition-all duration-300 z-50 ${
          toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <Check size={13} />
        {toast || "saved"}
      </div>
    </div>
  );
}
