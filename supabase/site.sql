-- ─────────────────────────────────────────────────────────────────────
-- stalfolio — content tables for the macOS-desktop site.
--
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query)
-- after schema.sql and storage.sql, then fill the tables from
-- /admin → site content → import.
--
-- Until they are filled the site falls back to lib/desktop/seed.ts, so
-- nothing breaks if you run this and stop here.
--
-- Every image column is optional. When it is empty the site renders the
-- generated SVG placeholder for that slot instead, so you can attach
-- images later from /admin without touching any code.
-- ─────────────────────────────────────────────────────────────────────

-- ─── Site copy: one row, id = 1 ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_config (
  id                 INTEGER PRIMARY KEY DEFAULT 1,

  email              TEXT    NOT NULL DEFAULT '',
  -- Empty posts the contact form to this app's own /api/contact (Resend).
  form_endpoint      TEXT    NOT NULL DEFAULT '',
  github_url         TEXT    NOT NULL DEFAULT '',

  -- Images
  profile_photo_url  TEXT    NOT NULL DEFAULT '',   -- Photo Booth window on /#about
  og_image_url       TEXT    NOT NULL DEFAULT '',   -- social preview

  -- Hero
  hero_eyebrow       TEXT    NOT NULL DEFAULT '',
  hero_name          TEXT    NOT NULL DEFAULT '',
  hero_sub           TEXT    NOT NULL DEFAULT '',
  hero_fine          TEXT    NOT NULL DEFAULT '',
  hero_bubble        TEXT    NOT NULL DEFAULT '',
  now_lines          TEXT[]  NOT NULL DEFAULT '{}',

  -- About
  bio_heading        TEXT    NOT NULL DEFAULT '',
  bio                TEXT[]  NOT NULL DEFAULT '{}',
  facts              JSONB   NOT NULL DEFAULT '[]',   -- [["based in","Bacolod City, PH"], …]

  -- Home
  featured           TEXT[]  NOT NULL DEFAULT '{}',   -- project slugs, in order
  featured_bubbles   TEXT[]  NOT NULL DEFAULT '{}',
  stats_file         TEXT    NOT NULL DEFAULT 'stats.json',
  stats              JSONB   NOT NULL DEFAULT '[]',   -- [{value,label}, …]
  currently_heading  TEXT    NOT NULL DEFAULT '',
  currently_desc     TEXT    NOT NULL DEFAULT '',
  currently          JSONB   NOT NULL DEFAULT '[]',   -- [{file,role,title,body}, …]
  cta_heading        TEXT    NOT NULL DEFAULT '',
  cta_sub            TEXT    NOT NULL DEFAULT '',

  -- Work with me
  tiers              JSONB   NOT NULL DEFAULT '[]',   -- [{name,amt,from,hl,file,items[]}, …]
  pricing_note       TEXT    NOT NULL DEFAULT '',
  steps              JSONB   NOT NULL DEFAULT '[]',   -- [{title,note}, …]

  -- Chrome
  footer_blurb       TEXT    NOT NULL DEFAULT '',
  cats               JSONB   NOT NULL DEFAULT '{}',   -- {systems:{label,short,title,desc}, …}

  updated_at         TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT site_config_single_row CHECK (id = 1)
);

INSERT INTO site_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ─── Projects / case studies ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_projects (
  id               UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  slug             TEXT    UNIQUE NOT NULL,
  cat              TEXT    NOT NULL DEFAULT 'systems',  -- systems | ai | ventures
  name             TEXT    NOT NULL,
  file             TEXT    NOT NULL DEFAULT '',         -- filename in the window title bar
  art              TEXT    NOT NULL DEFAULT '',         -- generated-art key, used with no image
  industry         TEXT    NOT NULL DEFAULT '',
  nda              BOOLEAN NOT NULL DEFAULT FALSE,
  status_kind      TEXT    NOT NULL DEFAULT 'live',     -- live | beta | dev
  status_label     TEXT    NOT NULL DEFAULT '',
  tag              TEXT    NOT NULL DEFAULT '',
  summary          TEXT    NOT NULL DEFAULT '',
  features         TEXT[]  NOT NULL DEFAULT '{}',
  flow             TEXT[]  NOT NULL DEFAULT '{}',
  numbers          JSONB   NOT NULL DEFAULT '[]',       -- [["4,000+","lots mapped"], …]
  stack            TEXT[]  NOT NULL DEFAULT '{}',
  role             TEXT    NOT NULL DEFAULT '',
  repo             TEXT    NOT NULL DEFAULT '',
  priv             BOOLEAN NOT NULL DEFAULT FALSE,      -- private repo: disabled chip, never a link
  live             TEXT    NOT NULL DEFAULT '',
  install          TEXT    NOT NULL DEFAULT '',
  award            TEXT    NOT NULL DEFAULT '',
  pending          BOOLEAN NOT NULL DEFAULT FALSE,
  image_url        TEXT    NOT NULL DEFAULT '',         -- card art
  cover_image_url  TEXT    NOT NULL DEFAULT '',         -- case study hero
  sort_order       INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT site_projects_cat CHECK (cat IN ('systems', 'ai', 'ventures')),
  CONSTRAINT site_projects_status CHECK (status_kind IN ('live', 'beta', 'dev'))
);

-- ─── git log --career ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_experience (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  head        BOOLEAN NOT NULL DEFAULT FALSE,   -- current role: filled timeline node
  when_label  TEXT    NOT NULL DEFAULT '',
  title       TEXT    NOT NULL,
  org         TEXT    NOT NULL DEFAULT '',
  body        TEXT[]  NOT NULL DEFAULT '{}',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Awards and features ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_awards (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  kind        TEXT    NOT NULL DEFAULT 'award',  -- award | feature
  title       TEXT    NOT NULL,
  org         TEXT    NOT NULL DEFAULT '',
  note        TEXT    NOT NULL DEFAULT '',
  href        TEXT    NOT NULL DEFAULT '',       -- e.g. #p-hiway
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT site_awards_kind CHECK (kind IN ('award', 'feature'))
);

-- ─── Certificates ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_certs (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT    NOT NULL,
  org         TEXT    NOT NULL DEFAULT '',
  note        TEXT    NOT NULL DEFAULT '',
  image_url   TEXT    NOT NULL DEFAULT '',       -- scan; empty shows the drawn seal
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Side quests ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_side_quests (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT    NOT NULL,
  note        TEXT    NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Launchpad skills ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_skills (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  icon        TEXT    NOT NULL,                  -- simple-icons key, or txt:XX
  group_key   TEXT    NOT NULL DEFAULT 'craft',  -- ai | lang | web | infra | craft
  label       TEXT    NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT site_skills_group CHECK (group_key IN ('ai', 'lang', 'web', 'infra', 'craft'))
);

-- ─── Writing: research.bib and articles.feed ─────────────────────────
CREATE TABLE IF NOT EXISTS site_research (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  when_label  TEXT    NOT NULL DEFAULT '',
  title       TEXT    NOT NULL,
  note        TEXT    NOT NULL DEFAULT '',
  url         TEXT    NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_articles (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  when_label  TEXT    NOT NULL DEFAULT '',
  title       TEXT    NOT NULL,
  note        TEXT    NOT NULL DEFAULT '',
  url         TEXT    NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Row Level Security: world-readable, owner-writable ──────────────
ALTER TABLE site_config      ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_projects    ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_experience  ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_awards      ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_certs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_side_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_skills      ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_research    ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_articles    ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'site_config', 'site_projects', 'site_experience', 'site_awards',
    'site_certs', 'site_side_quests', 'site_skills', 'site_research',
    'site_articles'
  ])
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I', 'public read ' || t, t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR SELECT USING (true)', 'public read ' || t, t);
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I', 'auth write ' || t, t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR ALL USING (auth.role() = ''authenticated'')',
      'auth write ' || t, t);
  END LOOP;
END $$;
