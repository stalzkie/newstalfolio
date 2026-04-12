-- ─────────────────────────────────────────────────────────────────────
-- stalfolio — Supabase schema
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query)
-- ─────────────────────────────────────────────────────────────────────

-- Work Experience
CREATE TABLE IF NOT EXISTS work_experience (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  company     TEXT        NOT NULL,
  role        TEXT        NOT NULL,
  start_date  TEXT        NOT NULL DEFAULT '',
  end_date    TEXT        NOT NULL DEFAULT '',
  logo_text   TEXT        DEFAULT '',
  logo_color  TEXT        DEFAULT '#1a1a1a',
  sort_order  INTEGER     DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Recent Work
CREATE TABLE IF NOT EXISTS recent_work (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT        NOT NULL,
  image_url   TEXT        DEFAULT '',
  link        TEXT        DEFAULT '',
  sort_order  INTEGER     DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Projects (with blog content)
CREATE TABLE IF NOT EXISTS projects (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug             TEXT        UNIQUE NOT NULL,
  title            TEXT        NOT NULL,
  description      TEXT        DEFAULT '',
  content          TEXT        DEFAULT '',   -- markdown body for the blog page
  tags             TEXT[]      DEFAULT '{}',
  image_url        TEXT        DEFAULT '',   -- thumbnail shown on cards
  cover_image_url  TEXT        DEFAULT '',   -- full-width hero on blog page
  category         TEXT        DEFAULT '',
  link             TEXT        DEFAULT '',
  published_at     TIMESTAMPTZ DEFAULT NOW(),
  sort_order       INTEGER     DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Row Level Security ──────────────────────────────────────────────
ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE recent_work     ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects        ENABLE ROW LEVEL SECURITY;

-- Anyone can read
CREATE POLICY "public read work_experience" ON work_experience
  FOR SELECT USING (true);

CREATE POLICY "public read recent_work" ON recent_work
  FOR SELECT USING (true);

CREATE POLICY "public read projects" ON projects
  FOR SELECT USING (true);

-- Only signed-in users can write (you'll create your account via Supabase Auth)
CREATE POLICY "auth write work_experience" ON work_experience
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "auth write recent_work" ON recent_work
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "auth write projects" ON projects
  FOR ALL USING (auth.role() = 'authenticated');

