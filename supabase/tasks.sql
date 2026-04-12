-- ─────────────────────────────────────────────────────────────────────
-- stalfolio — Task Management tables
-- Run this in the Supabase SQL Editor (after schema.sql and links.sql)
-- ─────────────────────────────────────────────────────────────────────

-- Projects (top-level containers)
CREATE TABLE IF NOT EXISTS task_projects (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT        NOT NULL,
  description  TEXT        DEFAULT '',
  color        TEXT        DEFAULT '#1a1a1a',
  icon         TEXT        DEFAULT '📁',
  sort_order   INTEGER     DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Tables (sections within a project, like a Notion database)
CREATE TABLE IF NOT EXISTS task_tables (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id   UUID        REFERENCES task_projects(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  sort_order   INTEGER     DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id                       UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  table_id                 UUID        REFERENCES task_tables(id) ON DELETE CASCADE,
  title                    TEXT        NOT NULL,
  description              TEXT        DEFAULT '',
  status                   TEXT        DEFAULT 'todo',
  priority                 TEXT        DEFAULT 'medium',
  deadline                 TIMESTAMPTZ,
  tags                     TEXT[]      DEFAULT '{}',
  assignee                 TEXT        DEFAULT '',
  notes                    TEXT        DEFAULT '',
  sort_order               INTEGER     DEFAULT 0,
  reminder_sent_day_before BOOLEAN     DEFAULT FALSE,
  reminder_sent_day_of     BOOLEAN     DEFAULT FALSE,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_tasks_updated_at();

-- Row Level Security
ALTER TABLE task_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tables   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks         ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth manage task_projects" ON task_projects
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "auth manage task_tables" ON task_tables
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "auth manage tasks" ON tasks
  FOR ALL USING (auth.role() = 'authenticated');
