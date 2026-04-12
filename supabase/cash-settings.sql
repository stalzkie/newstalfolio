-- Cash beginning per month (run after money.sql)
CREATE TABLE IF NOT EXISTS monthly_cash_settings (
  id            UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
  year          INTEGER        NOT NULL,
  month         INTEGER        NOT NULL CHECK (month BETWEEN 1 AND 12),
  cash_beginning DECIMAL(14,2) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ    DEFAULT NOW(),
  UNIQUE (year, month)
);

ALTER TABLE monthly_cash_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth manage monthly_cash_settings" ON monthly_cash_settings
  FOR ALL USING (auth.role() = 'authenticated');
