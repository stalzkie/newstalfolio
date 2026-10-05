/* ─────────────────────────────────────────────────────────────────────
   Reads the site_* tables into one SiteContent object.

   Every section falls back to lib/desktop/seed.ts independently, so a
   missing table, an empty table, or a network error degrades to the
   seeded copy for that section instead of an empty page.
   ───────────────────────────────────────────────────────────────────── */

import { supabase } from "./supabase";
import { SEED_CONTENT } from "./desktop/seed";
import type {
  AwardKind,
  ProjectCat,
  SiteAward,
  SiteCert,
  SiteConfig,
  SiteContent,
  SiteEntry,
  SiteExperience,
  SiteProject,
  SiteSideQuest,
  SiteSkill,
  SkillGroup,
  StatusKind,
} from "./desktop/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

const str = (v: unknown, fallback = ""): string =>
  typeof v === "string" && v.length ? v : fallback;
const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/* ─── Row → object ───────────────────────────────────────────────── */

function toProject(r: Row): SiteProject {
  return {
    slug: r.slug,
    cat: (r.cat || "systems") as ProjectCat,
    name: str(r.name),
    file: str(r.file),
    art: str(r.art),
    industry: str(r.industry) || undefined,
    nda: !!r.nda,
    status: [(r.status_kind || "live") as StatusKind, str(r.status_label)],
    tag: str(r.tag),
    summary: str(r.summary) || undefined,
    features: arr<string>(r.features),
    flow: arr<string>(r.flow),
    numbers: arr<[string, string]>(r.numbers),
    stack: arr<string>(r.stack),
    role: str(r.role) || undefined,
    repo: str(r.repo) || undefined,
    priv: !!r.priv,
    live: str(r.live) || undefined,
    install: str(r.install) || undefined,
    award: str(r.award) || undefined,
    pending: !!r.pending,
    imageUrl: str(r.image_url) || undefined,
    coverImageUrl: str(r.cover_image_url) || undefined,
  };
}

function toExperience(r: Row): SiteExperience {
  return {
    head: !!r.head,
    when: str(r.when_label),
    title: str(r.title),
    org: str(r.org),
    body: arr<string>(r.body),
  };
}

function toAward(r: Row): SiteAward {
  return {
    kind: (r.kind || "award") as AwardKind,
    title: str(r.title),
    org: str(r.org),
    note: str(r.note),
    href: str(r.href) || undefined,
  };
}

function toCert(r: Row): SiteCert {
  return {
    title: str(r.title),
    org: str(r.org),
    note: str(r.note),
    imageUrl: str(r.image_url) || undefined,
  };
}

function toSideQuest(r: Row): SiteSideQuest {
  return { title: str(r.title), note: str(r.note) };
}

function toSkill(r: Row): SiteSkill {
  return {
    icon: str(r.icon),
    group: (r.group_key || "craft") as SkillGroup,
    label: str(r.label) || undefined,
  };
}

function toEntry(r: Row): SiteEntry {
  return {
    when: str(r.when_label),
    title: str(r.title),
    note: str(r.note),
    url: str(r.url) || undefined,
  };
}

/**
 * A post written in the admin — rows of `projects`, which despite the
 * table's name are the articles published at /posts/<slug>. They are the
 * writing, so the articles feed is built from them.
 */
function toPost(r: Row): SiteEntry {
  const when = r.published_at ? new Date(r.published_at) : null;
  return {
    when:
      when && !Number.isNaN(when.getTime())
        ? when.toLocaleDateString("en-US", { month: "short", year: "numeric" }).toLowerCase()
        : "",
    title: str(r.title),
    note: str(r.description),
    url: "/posts/" + str(r.slug),
  };
}

/** Merges a config row over the seed, field by field, keeping seed copy for blanks. */
function toConfig(r: Row | null): SiteConfig {
  const s = SEED_CONTENT.config;
  if (!r) return s;
  const list = <T,>(v: unknown, fallback: T[]): T[] => {
    const a = arr<T>(v);
    return a.length ? a : fallback;
  };
  return {
    email: str(r.email, s.email),
    formEndpoint: str(r.form_endpoint, s.formEndpoint),
    profilePhoto: str(r.profile_photo_url, s.profilePhoto),
    ogImageUrl: str(r.og_image_url, s.ogImageUrl),
    githubUrl: str(r.github_url, s.githubUrl),
    heroEyebrow: str(r.hero_eyebrow, s.heroEyebrow),
    heroName: str(r.hero_name, s.heroName),
    heroSub: str(r.hero_sub, s.heroSub),
    heroFine: str(r.hero_fine, s.heroFine),
    heroBubble: str(r.hero_bubble, s.heroBubble),
    nowLines: list(r.now_lines, s.nowLines),
    bioHeading: str(r.bio_heading, s.bioHeading),
    bio: list(r.bio, s.bio),
    facts: list(r.facts, s.facts),
    featured: list(r.featured, s.featured),
    featuredBubbles: list(r.featured_bubbles, s.featuredBubbles),
    statsFile: str(r.stats_file, s.statsFile),
    stats: list(r.stats, s.stats),
    currentlyHeading: str(r.currently_heading, s.currentlyHeading),
    currentlyDesc: str(r.currently_desc, s.currentlyDesc),
    currently: list(r.currently, s.currently),
    tiers: list(r.tiers, s.tiers),
    pricingNote: str(r.pricing_note, s.pricingNote),
    steps: list(r.steps, s.steps),
    ctaHeading: str(r.cta_heading, s.ctaHeading),
    ctaSub: str(r.cta_sub, s.ctaSub),
    footerBlurb: str(r.footer_blurb, s.footerBlurb),
    cats:
      r.cats && typeof r.cats === "object" && Object.keys(r.cats).length
        ? r.cats
        : s.cats,
  };
}

/* ─── Query helpers ──────────────────────────────────────────────── */

const ordered = (table: string) =>
  supabase
    .from(table)
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

/** Maps rows to objects, or returns the seeded fallback when there are none. */
function section<T>(
  res: { data: Row[] | null; error: unknown },
  map: (r: Row) => T,
  fallback: T[]
): T[] {
  if (res.error || !res.data || !res.data.length) return fallback;
  return res.data.map(map);
}

/**
 * The whole site's content. Call from a server component; the result is
 * serialised into the client runtime, so it must stay JSON-safe.
 */
export async function getSiteContent(): Promise<SiteContent> {
  const seed = SEED_CONTENT;

  const empty = { data: null as Row[] | null, error: true as unknown };
  const safe = async (p: PromiseLike<{ data: Row[] | null; error: unknown }>) => {
    try {
      return await p;
    } catch {
      return empty;
    }
  };

  const [
    config,
    projects,
    experience,
    awards,
    certs,
    sideQuests,
    skills,
    research,
    articles,
    posts,
  ] = await Promise.all([
    (async () => {
      try {
        const { data } = await supabase
          .from("site_config")
          .select("*")
          .eq("id", 1)
          .maybeSingle();
        return toConfig(data as Row | null);
      } catch {
        return seed.config;
      }
    })(),
    safe(ordered("site_projects")),
    safe(ordered("site_experience")),
    safe(ordered("site_awards")),
    safe(ordered("site_certs")),
    safe(ordered("site_side_quests")),
    safe(ordered("site_skills")),
    safe(ordered("site_research")),
    safe(ordered("site_articles")),
    /* Posts are ordered the way the admin lists them. */
    safe(
      supabase
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("published_at", { ascending: false })
    ),
  ]);

  return {
    config,
    projects: section(projects, toProject, seed.projects),
    experience: section(experience, toExperience, seed.experience),
    awards: section(awards, toAward, seed.awards),
    certs: section(certs, toCert, seed.certs),
    side: section(sideQuests, toSideQuest, seed.side),
    skills: section(skills, toSkill, seed.skills),
    research: section(research, toEntry, seed.research),
    /* The feed is what has actually been written: the admin's posts first,
       then any hand-listed entries (an external byline, say). Legitimately
       empty until the first one is published. */
    articles: [
      ...section(posts, toPost, []),
      ...section(articles, toEntry, seed.articles),
    ],
  };
}
