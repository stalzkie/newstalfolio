/* ─────────────────────────────────────────────────────────────────────
   SEED_CONTENT → database rows.

   The single place the seed's camelCase shape is mapped onto the
   snake_case columns in supabase/site.sql. Used by the "import seeded
   content" button in /admin.

   Image columns are deliberately left empty: the site renders its drawn
   placeholders until images are attached in the admin.
   ───────────────────────────────────────────────────────────────────── */

import { SEED_CONTENT } from "./seed";
import type { SiteTable } from "../site-admin-service";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function configRow(): Record<string, any> {
  const c = SEED_CONTENT.config;
  return {
    email: c.email,
    form_endpoint: c.formEndpoint,
    github_url: c.githubUrl,
    profile_photo_url: c.profilePhoto,
    og_image_url: c.ogImageUrl,
    hero_eyebrow: c.heroEyebrow,
    hero_name: c.heroName,
    hero_sub: c.heroSub,
    hero_fine: c.heroFine,
    hero_bubble: c.heroBubble,
    now_lines: c.nowLines,
    bio_heading: c.bioHeading,
    bio: c.bio,
    facts: c.facts,
    featured: c.featured,
    featured_bubbles: c.featuredBubbles,
    stats_file: c.statsFile,
    stats: c.stats,
    currently_heading: c.currentlyHeading,
    currently_desc: c.currentlyDesc,
    currently: c.currently,
    tiers: c.tiers,
    pricing_note: c.pricingNote,
    steps: c.steps,
    cta_heading: c.ctaHeading,
    cta_sub: c.ctaSub,
    footer_blurb: c.footerBlurb,
    cats: c.cats,
  };
}

export function tableRows(): { table: SiteTable; rows: Record<string, any>[] }[] {
  const c = SEED_CONTENT;
  return [
    {
      table: "site_projects",
      rows: c.projects.map((p, i) => ({
        slug: p.slug,
        cat: p.cat,
        name: p.name,
        file: p.file ?? "",
        art: p.art ?? "",
        industry: p.industry ?? "",
        nda: !!p.nda,
        status_kind: p.status?.[0] ?? "live",
        status_label: p.status?.[1] ?? "",
        tag: p.tag ?? "",
        summary: p.summary ?? "",
        features: p.features ?? [],
        flow: p.flow ?? [],
        numbers: p.numbers ?? [],
        stack: p.stack ?? [],
        role: p.role ?? "",
        repo: p.repo ?? "",
        priv: !!p.priv,
        live: p.live ?? "",
        install: p.install ?? "",
        award: p.award ?? "",
        pending: !!p.pending,
        image_url: "",
        cover_image_url: "",
        sort_order: i,
      })),
    },
    {
      table: "site_experience",
      rows: c.experience.map((x, i) => ({
        head: !!x.head,
        when_label: x.when ?? "",
        title: x.title,
        org: x.org ?? "",
        body: x.body ?? [],
        sort_order: i,
      })),
    },
    {
      table: "site_awards",
      rows: c.awards.map((a, i) => ({
        kind: a.kind,
        title: a.title,
        org: a.org ?? "",
        note: a.note ?? "",
        href: a.href ?? "",
        sort_order: i,
      })),
    },
    {
      table: "site_certs",
      rows: c.certs.map((x, i) => ({
        title: x.title,
        org: x.org ?? "",
        note: x.note ?? "",
        image_url: "",
        sort_order: i,
      })),
    },
    {
      table: "site_side_quests",
      rows: c.side.map((s, i) => ({
        title: s.title,
        note: s.note ?? "",
        sort_order: i,
      })),
    },
    {
      table: "site_skills",
      rows: c.skills.map((s, i) => ({
        icon: s.icon,
        group_key: s.group,
        label: s.label ?? "",
        sort_order: i,
      })),
    },
    {
      table: "site_research",
      rows: c.research.map((r, i) => ({
        when_label: r.when ?? "",
        title: r.title,
        note: r.note ?? "",
        url: r.url ?? "",
        sort_order: i,
      })),
    },
    {
      table: "site_articles",
      rows: c.articles.map((a, i) => ({
        when_label: a.when ?? "",
        title: a.title,
        note: a.note ?? "",
        url: a.url ?? "",
        sort_order: i,
      })),
    },
  ];
}
