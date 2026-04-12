-- ─────────────────────────────────────────────────────────────────────
-- stalfolio — Links table
-- Run this in the Supabase SQL Editor (after schema.sql)
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS links (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  label       TEXT        NOT NULL,
  abbr        TEXT        DEFAULT '',
  url         TEXT        DEFAULT '',
  image_url   TEXT        DEFAULT '',
  sort_order  INTEGER     DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read links" ON links
  FOR SELECT USING (true);

CREATE POLICY "auth write links" ON links
  FOR ALL USING (auth.role() = 'authenticated');
