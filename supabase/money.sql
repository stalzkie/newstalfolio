-- ─────────────────────────────────────────────────────────────────────
-- stalfolio — Money Management tables
-- Run in Supabase SQL Editor (after schema.sql, links.sql, tasks.sql)
-- ─────────────────────────────────────────────────────────────────────

-- Monthly income & expense entries
CREATE TABLE IF NOT EXISTS financial_entries (
  id           UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
  year         INTEGER        NOT NULL,
  month        INTEGER        NOT NULL CHECK (month BETWEEN 1 AND 12),
  type         TEXT           NOT NULL CHECK (type IN ('income', 'expense')),
  description  TEXT           NOT NULL,
  category     TEXT           NOT NULL DEFAULT '',
  amount       DECIMAL(14,2)  NOT NULL DEFAULT 0,
  amount_settled DECIMAL(14,2) NOT NULL DEFAULT 0,
  counterparty TEXT           NOT NULL DEFAULT '',
  entry_date   DATE,
  created_at   TIMESTAMPTZ    DEFAULT NOW()
);

-- Account Receivables (money owed to you)
CREATE TABLE IF NOT EXISTS account_receivables (
  id              UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
  description     TEXT           NOT NULL,
  category        TEXT           NOT NULL DEFAULT '',
  amount          DECIMAL(14,2)  NOT NULL DEFAULT 0,
  amount_received DECIMAL(14,2)  NOT NULL DEFAULT 0,
  paid_by         TEXT           NOT NULL DEFAULT '',
  status          TEXT           NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'overdue', 'partial')),
  due_date        DATE,
  received_date   DATE,
  created_at      TIMESTAMPTZ    DEFAULT NOW()
);

-- Account Payables (money you owe)
CREATE TABLE IF NOT EXISTS account_payables (
  id          UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT           NOT NULL,
  category    TEXT           NOT NULL DEFAULT '',
  amount      DECIMAL(14,2)  NOT NULL DEFAULT 0,
  amount_paid DECIMAL(14,2)  NOT NULL DEFAULT 0,
  paid_to     TEXT           NOT NULL DEFAULT '',
  status      TEXT           NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'partial')),
  due_date    DATE,
  paid_date   DATE,
  created_at  TIMESTAMPTZ    DEFAULT NOW()
);

-- Expense budgets (per category)
CREATE TABLE IF NOT EXISTS budgets (
  id           UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
  category     TEXT           NOT NULL,
  amount       DECIMAL(14,2)  NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ    DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE financial_entries   ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_receivables ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_payables    ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets             ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth manage financial_entries" ON financial_entries
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "auth manage account_receivables" ON account_receivables
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "auth manage account_payables" ON account_payables
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "auth manage budgets" ON budgets
  FOR ALL USING (auth.role() = 'authenticated');
