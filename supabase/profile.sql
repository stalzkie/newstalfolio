-- ─────────────────────────────────────────────────────────────────────
-- stalfolio — profile table (single row, id = 1)
-- Run in Supabase SQL Editor before deploying
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profile (
  id               INTEGER     PRIMARY KEY DEFAULT 1,
  name             TEXT        NOT NULL DEFAULT '',
  title            TEXT        NOT NULL DEFAULT '',
  specialisation   TEXT        NOT NULL DEFAULT '',
  about            TEXT        NOT NULL DEFAULT '',
  location         TEXT        NOT NULL DEFAULT '',
  website          TEXT        NOT NULL DEFAULT '',
  email            TEXT        NOT NULL DEFAULT '',
  portfolio_handle TEXT        NOT NULL DEFAULT '',
  avatar_url       TEXT        NOT NULL DEFAULT '',
  banner_url       TEXT        NOT NULL DEFAULT '',
  resume_url       TEXT        NOT NULL DEFAULT '',
  updated_at       TIMESTAMPTZ          DEFAULT NOW()
);

-- Enforce single row
ALTER TABLE profile
  ADD CONSTRAINT profile_single_row CHECK (id = 1);

-- Seed the one row so upserts always hit an existing record
INSERT INTO profile (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ─── Row Level Security ──────────────────────────────────────────────
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;

-- Anyone can read
CREATE POLICY "public read profile" ON profile
  FOR SELECT USING (true);

-- Only signed-in users can write
CREATE POLICY "auth write profile" ON profile
  FOR ALL USING (auth.role() = 'authenticated');
