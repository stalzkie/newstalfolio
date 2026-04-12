-- Add opening_balance to platforms (run after platforms.sql)
ALTER TABLE platforms
  ADD COLUMN IF NOT EXISTS opening_balance DECIMAL(14,2) NOT NULL DEFAULT 0;
