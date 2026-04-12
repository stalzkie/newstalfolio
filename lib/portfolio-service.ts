import { supabase } from "./supabase";
import type { WorkExperience, RecentWork, Project, PortfolioLink } from "./portfolio-store";

/* ─── Helpers: DB row ↔ TypeScript object ────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toExp(row: any): WorkExperience {
  return {
    id: row.id,
    company: row.company,
    role: row.role,
    startDate: row.start_date,
    endDate: row.end_date,
    logoText: row.logo_text ?? "",
    logoColor: row.logo_color ?? "#1a1a1a",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toWork(row: any): RecentWork {
  return {
    id: row.id,
    title: row.title,
    imageUrl: row.image_url ?? "",
    link: row.link ?? "",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toProject(row: any): Project {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    content: row.content ?? "",
    tags: row.tags ?? [],
    imageUrl: row.image_url ?? "",
    coverImageUrl: row.cover_image_url ?? "",
    category: row.category ?? "",
    link: row.link ?? "",
    publishedAt: row.published_at ?? null,
  };
}

/* ─── Work Experience ────────────────────────────────────────────── */

export async function getExperience(): Promise<WorkExperience[]> {
  const { data, error } = await supabase
    .from("work_experience")
    .select("*")
    .order("start_date", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data ?? []).map(toExp);
}

export async function createExperience(
  exp: Omit<WorkExperience, "id">
): Promise<WorkExperience> {
  const { data, error } = await supabase
    .from("work_experience")
    .insert({
      company: exp.company,
      role: exp.role,
      start_date: exp.startDate,
      end_date: exp.endDate,
      logo_text: exp.logoText ?? "",
      logo_color: exp.logoColor ?? "#1a1a1a",
    })
    .select()
    .single();
  if (error) throw error;
  return toExp(data);
}

export async function updateExperience(
  id: string,
  exp: Omit<WorkExperience, "id">
): Promise<WorkExperience> {
  const { data, error } = await supabase
    .from("work_experience")
    .update({
      company: exp.company,
      role: exp.role,
      start_date: exp.startDate,
      end_date: exp.endDate,
      logo_text: exp.logoText ?? "",
      logo_color: exp.logoColor ?? "#1a1a1a",
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return toExp(data);
}

export async function deleteExperience(id: string): Promise<void> {
  const { error } = await supabase
    .from("work_experience")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

/* ─── Recent Work ────────────────────────────────────────────────── */

export async function getRecentWork(): Promise<RecentWork[]> {
  const { data, error } = await supabase
    .from("recent_work")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(toWork);
}

export async function createRecentWork(
  work: Omit<RecentWork, "id">
): Promise<RecentWork> {
  const { data, error } = await supabase
    .from("recent_work")
    .insert({
      title: work.title,
      image_url: work.imageUrl ?? "",
      link: work.link ?? "",
    })
    .select()
    .single();
  if (error) throw error;
  return toWork(data);
}

export async function updateRecentWork(
  id: string,
  work: Omit<RecentWork, "id">
): Promise<RecentWork> {
  const { data, error } = await supabase
    .from("recent_work")
    .update({ title: work.title, image_url: work.imageUrl ?? "", link: work.link ?? "" })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return toWork(data);
}

export async function deleteRecentWork(id: string): Promise<void> {
  const { error } = await supabase.from("recent_work").delete().eq("id", id);
  if (error) throw error;
}

/* ─── Projects ───────────────────────────────────────────────────── */

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toProject);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return toProject(data);
}

export async function createProject(
  proj: Omit<Project, "id">
): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .insert({
      slug: proj.slug,
      title: proj.title,
      description: proj.description,
      content: proj.content ?? "",
      tags: proj.tags ?? [],
      image_url: proj.imageUrl ?? "",
      cover_image_url: proj.coverImageUrl ?? "",
      category: proj.category ?? "",
      link: proj.link ?? "",
      published_at: proj.publishedAt ?? new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return toProject(data);
}

export async function updateProject(
  id: string,
  proj: Omit<Project, "id">
): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .update({
      slug: proj.slug,
      title: proj.title,
      description: proj.description,
      content: proj.content ?? "",
      tags: proj.tags ?? [],
      image_url: proj.imageUrl ?? "",
      cover_image_url: proj.coverImageUrl ?? "",
      category: proj.category ?? "",
      link: proj.link ?? "",
      published_at: proj.publishedAt ?? new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return toProject(data);
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

/* ─── Links ──────────────────────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toLink(row: any): PortfolioLink {
  return {
    id: row.id,
    label: row.label,
    abbr: row.abbr ?? "",
    url: row.url ?? "",
    imageUrl: row.image_url ?? "",
  };
}

export async function getLinks(): Promise<PortfolioLink[]> {
  const { data, error } = await supabase
    .from("links")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(toLink);
}

export async function createLink(
  link: Omit<PortfolioLink, "id">
): Promise<PortfolioLink> {
  const { data, error } = await supabase
    .from("links")
    .insert({
      label: link.label,
      abbr: link.abbr,
      url: link.url,
      image_url: link.imageUrl ?? "",
    })
    .select()
    .single();
  if (error) throw error;
  return toLink(data);
}

export async function updateLink(
  id: string,
  link: Omit<PortfolioLink, "id">
): Promise<PortfolioLink> {
  const { data, error } = await supabase
    .from("links")
    .update({ label: link.label, abbr: link.abbr, url: link.url, image_url: link.imageUrl ?? "" })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return toLink(data);
}

export async function deleteLink(id: string): Promise<void> {
  const { error } = await supabase.from("links").delete().eq("id", id);
  if (error) throw error;
}
