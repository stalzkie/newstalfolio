-- Platforms (run after money.sql and cash-settings.sql)
CREATE TABLE IF NOT EXISTS platforms (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  color      TEXT NOT NULL DEFAULT '#1a1a1a',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth manage platforms" ON platforms
  FOR ALL USING (auth.role() = 'authenticated');

-- Add platform column to existing tables
ALTER TABLE financial_entries
  ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT '';

ALTER TABLE account_receivables
  ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT '';

ALTER TABLE account_payables
  ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT '';
