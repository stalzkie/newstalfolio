/* ─────────────────────────────────────────────────────────────────────
   Write access to the site_* tables, used by the /admin → site editor.

   Rows are passed through as snake_case objects so one generic editor
   can drive every table; the table definitions live in
   components/site-content-admin.tsx.
   ───────────────────────────────────────────────────────────────────── */

import { supabase } from "./supabase";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type SiteRow = Record<string, any> & { id?: string };

export const SITE_TABLES = [
  "site_projects",
  "site_experience",
  "site_awards",
  "site_certs",
  "site_side_quests",
  "site_skills",
  "site_research",
  "site_articles",
] as const;

export type SiteTable = (typeof SITE_TABLES)[number];

export async function listRows(table: SiteTable): Promise<SiteRow[]> {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createRow(table: SiteTable, row: SiteRow): Promise<SiteRow> {
  const { data, error } = await supabase.from(table).insert(row).select().single();
  if (error) throw error;
  return data;
}

export async function updateRow(table: SiteTable, id: string, row: SiteRow): Promise<SiteRow> {
  const { data, error } = await supabase.from(table).update(row).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteRow(table: SiteTable, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}

/** Persists the order of a whole list after a move up/down. */
export async function reorderRows(table: SiteTable, ids: string[]): Promise<void> {
  for (let i = 0; i < ids.length; i++) {
    const { error } = await supabase.from(table).update({ sort_order: i }).eq("id", ids[i]);
    if (error) throw error;
  }
}

/* ─── site_config: the single copy row ───────────────────────────── */

export async function getConfigRow(): Promise<SiteRow | null> {
  const { data, error } = await supabase.from("site_config").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveConfigRow(row: SiteRow): Promise<void> {
  const { error } = await supabase
    .from("site_config")
    .upsert({ ...row, id: 1, updated_at: new Date().toISOString() });
  if (error) throw error;
}

/* ─── Importing the seeded content ───────────────────────────────── */

/**
 * Copies lib/desktop/seed.ts — the content from the handover — into the
 * database, as the signed-in admin. Tables that already have rows are
 * left alone unless `replace` is set.
 *
 * Returns a per-table summary for the admin UI.
 */
export async function importSeedContent(
  replace = false
): Promise<{ table: string; status: "imported" | "skipped"; count: number }[]> {
  const { configRow, tableRows } = await import("./desktop/seed-rows");
  const report: { table: string; status: "imported" | "skipped"; count: number }[] = [];

  const { error: cErr } = await supabase
    .from("site_config")
    .upsert({ ...configRow(), id: 1, updated_at: new Date().toISOString() });
  if (cErr) throw cErr;
  report.push({ table: "site_config", status: "imported", count: 1 });

  for (const { table, rows } of tableRows()) {
    if (replace) {
      const { error } = await supabase.from(table).delete().not("id", "is", null);
      if (error) throw error;
    } else {
      const { count, error } = await supabase
        .from(table)
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      if (count) {
        report.push({ table, status: "skipped", count });
        continue;
      }
    }
    if (rows.length) {
      const { error } = await supabase.from(table).insert(rows);
      if (error) throw error;
    }
    report.push({ table, status: "imported", count: rows.length });
  }

  return report;
}
