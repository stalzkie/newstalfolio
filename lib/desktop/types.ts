/* ─────────────────────────────────────────────────────────────────────
   stalfolio — content model for the macOS-desktop site.

   Every field here maps to a Supabase column (see supabase/site.sql).
   `lib/site-service.ts` reads the database into a SiteContent object;
   `lib/desktop/seed.ts` holds the same shape as a fallback so the site
   renders even before the tables are filled.
   ───────────────────────────────────────────────────────────────────── */

export type ProjectCat = "systems" | "ai" | "ventures";
export type StatusKind = "live" | "beta" | "dev";
export type AwardKind = "award" | "feature";
export type SkillGroup = "ai" | "lang" | "web" | "infra" | "craft";

export interface SiteProject {
  slug: string;
  cat: ProjectCat;
  name: string;
  /** Fake filename shown in the window title bar. */
  file: string;
  /** Key for the generated SVG in `art()`, used when no image is attached. */
  art: string;
  industry?: string;
  nda?: boolean;
  status: [StatusKind, string];
  tag: string;
  summary?: string;
  features?: string[];
  flow?: string[];
  numbers?: [string, string][];
  stack: string[];
  role?: string;
  repo?: string;
  /** Repo is private: show a disabled chip instead of a link. */
  priv?: boolean;
  live?: string;
  install?: string;
  award?: string;
  /** Case study not written yet: show the "soon" note instead of the body. */
  pending?: boolean;
  /** Card/thumbnail image. Empty falls back to the generated SVG art. */
  imageUrl?: string;
  /** Wide hero image on the case study. Empty falls back to the SVG art. */
  coverImageUrl?: string;
}

export interface SiteExperience {
  /** Current role: filled timeline node. */
  head?: boolean;
  when: string;
  title: string;
  org: string;
  body: string[];
}

export interface SiteAward {
  kind: AwardKind;
  title: string;
  org: string;
  note: string;
  /** Optional hash link to a related case study, e.g. "#p-hiway". */
  href?: string;
}

export interface SiteCert {
  title: string;
  org: string;
  note: string;
  /** Scan of the certificate. Empty falls back to the drawn seal. */
  imageUrl?: string;
}

export interface SiteSideQuest {
  title: string;
  note: string;
}

export interface SiteSkill {
  /** simple-icons key, or "txt:XX" for a text tile. */
  icon: string;
  group: SkillGroup;
  label?: string;
}

export interface SiteEntry {
  when: string;
  title: string;
  note: string;
  url?: string;
}

export interface SiteCat {
  label: string;
  short: string;
  title: string;
  desc: string;
}

export interface SiteStat {
  value: string;
  label: string;
}

export interface SiteCurrently {
  file: string;
  role: string;
  title: string;
  /** May contain a single hash link as `[text](#hash)`. */
  body: string;
}

export interface SiteTier {
  name: string;
  amt: string;
  /** Render the amount as "from $X onwards". */
  from?: boolean;
  /** Highlighted (middle) card. */
  hl?: boolean;
  file: string;
  items: string[];
}

export interface SiteStep {
  title: string;
  note: string;
}

export interface SiteConfig {
  email: string;
  /** External form endpoint. Empty posts to this app's own /api/contact. */
  formEndpoint: string;
  profilePhoto: string;
  /** Social preview image. Empty renders the designed card instead. */
  ogImageUrl: string;
  githubUrl: string;
  heroEyebrow: string;
  heroName: string;
  heroSub: string;
  heroFine: string;
  bioHeading: string;
  bio: string[];
  facts: [string, string][];
  heroBubble: string;
  /** The three lines in the floating now.txt window on the hero. */
  nowLines: string[];
  featured: string[];
  featuredBubbles: string[];
  statsFile: string;
  stats: SiteStat[];
  currentlyHeading: string;
  currentlyDesc: string;
  currently: SiteCurrently[];
  tiers: SiteTier[];
  pricingNote: string;
  steps: SiteStep[];
  ctaHeading: string;
  ctaSub: string;
  footerBlurb: string;
  cats: Record<ProjectCat, SiteCat>;
}

export interface SiteContent {
  config: SiteConfig;
  projects: SiteProject[];
  experience: SiteExperience[];
  awards: SiteAward[];
  certs: SiteCert[];
  side: SiteSideQuest[];
  skills: SiteSkill[];
  research: SiteEntry[];
  articles: SiteEntry[];
}
