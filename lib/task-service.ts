import { supabase } from "./supabase";

/* ─── Types ───────────────────────────────────────────────────────── */

export interface TaskProject {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  sortOrder: number;
  createdAt: string;
}

export interface TaskTable {
  id: string;
  projectId: string;
  name: string;
  sortOrder: number;
  createdAt: string;
}

export type TaskStatus = "todo" | "in_progress" | "in_review" | "done" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  tableId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string | null;
  tags: string[];
  assignee: string;
  notes: string;
  sortOrder: number;
  reminderSentDayBefore: boolean;
  reminderSentDayOf: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ─── Mappers ─────────────────────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toProject(r: any): TaskProject {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? "",
    color: r.color ?? "#1a1a1a",
    icon: r.icon ?? "📁",
    sortOrder: r.sort_order ?? 0,
    createdAt: r.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toTable(r: any): TaskTable {
  return {
    id: r.id,
    projectId: r.project_id,
    name: r.name,
    sortOrder: r.sort_order ?? 0,
    createdAt: r.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toTask(r: any): Task {
  return {
    id: r.id,
    tableId: r.table_id,
    title: r.title,
    description: r.description ?? "",
    status: r.status ?? "todo",
    priority: r.priority ?? "medium",
    deadline: r.deadline ?? null,
    tags: r.tags ?? [],
    assignee: r.assignee ?? "",
    notes: r.notes ?? "",
    sortOrder: r.sort_order ?? 0,
    reminderSentDayBefore: r.reminder_sent_day_before ?? false,
    reminderSentDayOf: r.reminder_sent_day_of ?? false,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

/* ─── Projects ────────────────────────────────────────────────────── */

export async function getProjects(): Promise<TaskProject[]> {
  const { data, error } = await supabase
    .from("task_projects")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(toProject);
}

export async function createProject(
  p: Pick<TaskProject, "name" | "description" | "color" | "icon">
): Promise<TaskProject> {
  const { data, error } = await supabase
    .from("task_projects")
    .insert({ name: p.name, description: p.description, color: p.color, icon: p.icon })
    .select()
    .single();
  if (error) throw error;
  return toProject(data);
}

export async function updateProject(
  id: string,
  patch: Partial<Pick<TaskProject, "name" | "description" | "color" | "icon">>
): Promise<TaskProject> {
  const { data, error } = await supabase
    .from("task_projects")
    .update({ name: patch.name, description: patch.description, color: patch.color, icon: patch.icon })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return toProject(data);
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from("task_projects").delete().eq("id", id);
  if (error) throw error;
}

/* ─── Tables ──────────────────────────────────────────────────────── */

export async function getTablesForProject(projectId: string): Promise<TaskTable[]> {
  const { data, error } = await supabase
    .from("task_tables")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(toTable);
}

export async function createTable(
  projectId: string,
  name: string
): Promise<TaskTable> {
  const { data, error } = await supabase
    .from("task_tables")
    .insert({ project_id: projectId, name })
    .select()
    .single();
  if (error) throw error;
  return toTable(data);
}

export async function updateTable(id: string, name: string): Promise<TaskTable> {
  const { data, error } = await supabase
    .from("task_tables")
    .update({ name })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return toTable(data);
}

export async function deleteTable(id: string): Promise<void> {
  const { error } = await supabase.from("task_tables").delete().eq("id", id);
  if (error) throw error;
}

/* ─── Tasks ───────────────────────────────────────────────────────── */

export async function getTasksForTable(tableId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("table_id", tableId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(toTask);
}

export async function createTask(
  tableId: string,
  title: string
): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .insert({ table_id: tableId, title })
    .select()
    .single();
  if (error) throw error;
  return toTask(data);
}

export async function updateTask(
  id: string,
  patch: Partial<Omit<Task, "id" | "tableId" | "createdAt" | "updatedAt">>
): Promise<Task> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.title !== undefined) dbPatch.title = patch.title;
  if (patch.description !== undefined) dbPatch.description = patch.description;
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.priority !== undefined) dbPatch.priority = patch.priority;
  if (patch.deadline !== undefined) dbPatch.deadline = patch.deadline;
  if (patch.tags !== undefined) dbPatch.tags = patch.tags;
  if (patch.assignee !== undefined) dbPatch.assignee = patch.assignee;
  if (patch.notes !== undefined) dbPatch.notes = patch.notes;
  if (patch.reminderSentDayBefore !== undefined) dbPatch.reminder_sent_day_before = patch.reminderSentDayBefore;
  if (patch.reminderSentDayOf !== undefined) dbPatch.reminder_sent_day_of = patch.reminderSentDayOf;

  const { data, error } = await supabase
    .from("tasks")
    .update(dbPatch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return toTask(data);
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}

export async function reorderTasks(orderedIds: string[]): Promise<void> {
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("tasks").update({ sort_order: index }).eq("id", id)
    )
  );
}
