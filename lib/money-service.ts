import { supabase } from "./supabase";

/* ─── Types ───────────────────────────────────────────────────────── */

export type EntryType = "income" | "expense";

export interface Budget {
  id: string;
  category: string;
  amount: number;
  createdAt: string;
}
export type ARStatus = "pending" | "received" | "overdue" | "partial";
export type APStatus = "pending" | "paid" | "overdue" | "partial";

export interface Platform {
  id: string;
  name: string;
  color: string;
  openingBalance: number;
  createdAt: string;
}

export interface PlatformBalance extends Platform {
  income: number;
  expenses: number;
  balance: number;
}

export interface FinancialEntry {
  id: string;
  year: number;
  month: number;
  type: EntryType;
  description: string;
  category: string;
  amount: number;
  amountSettled: number;
  counterparty: string;
  platform: string;
  entryDate: string | null;
  createdAt: string;
}

export interface AccountReceivable {
  id: string;
  description: string;
  category: string;
  amount: number;
  amountReceived: number;
  paidBy: string;
  platform: string;
  status: ARStatus;
  dueDate: string | null;
  receivedDate: string | null;
  createdAt: string;
}

export interface AccountPayable {
  id: string;
  description: string;
  category: string;
  amount: number;
  amountPaid: number;
  paidTo: string;
  platform: string;
  status: APStatus;
  dueDate: string | null;
  paidDate: string | null;
  createdAt: string;
}

/* ─── Mappers ─────────────────────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPlatform(r: any): Platform {
  return {
    id: r.id,
    name: r.name,
    color: r.color ?? "#1a1a1a",
    openingBalance: Number(r.opening_balance ?? 0),
    createdAt: r.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toBudget(r: any): Budget {
  return {
    id: r.id,
    category: r.category,
    amount: Number(r.amount ?? 0),
    createdAt: r.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toEntry(r: any): FinancialEntry {
  return {
    id: r.id,
    year: r.year,
    month: r.month,
    type: r.type,
    description: r.description,
    category: r.category ?? "",
    amount: Number(r.amount ?? 0),
    amountSettled: Number(r.amount_settled ?? 0),
    counterparty: r.counterparty ?? "",
    platform: r.platform ?? "",
    entryDate: r.entry_date ?? null,
    createdAt: r.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toAR(r: any): AccountReceivable {
  return {
    id: r.id,
    description: r.description,
    category: r.category ?? "",
    amount: Number(r.amount ?? 0),
    amountReceived: Number(r.amount_received ?? 0),
    paidBy: r.paid_by ?? "",
    platform: r.platform ?? "",
    status: r.status ?? "pending",
    dueDate: r.due_date ?? null,
    receivedDate: r.received_date ?? null,
    createdAt: r.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toAP(r: any): AccountPayable {
  return {
    id: r.id,
    description: r.description,
    category: r.category ?? "",
    amount: Number(r.amount ?? 0),
    amountPaid: Number(r.amount_paid ?? 0),
    paidTo: r.paid_to ?? "",
    platform: r.platform ?? "",
    status: r.status ?? "pending",
    dueDate: r.due_date ?? null,
    paidDate: r.paid_date ?? null,
    createdAt: r.created_at,
  };
}

/* ─── Financial Entries ───────────────────────────────────────────── */

export async function getEntriesByYear(year: number): Promise<FinancialEntry[]> {
  const { data, error } = await supabase
    .from("financial_entries")
    .select("*")
    .eq("year", year)
    .order("month", { ascending: true })
    .order("entry_date", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(toEntry);
}

export async function getEntriesByMonth(year: number, month: number): Promise<FinancialEntry[]> {
  const { data, error } = await supabase
    .from("financial_entries")
    .select("*")
    .eq("year", year)
    .eq("month", month)
    .order("entry_date", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(toEntry);
}

export async function createEntry(
  entry: Omit<FinancialEntry, "id" | "createdAt">
): Promise<FinancialEntry> {
  const { data, error } = await supabase
    .from("financial_entries")
    .insert({
      year: entry.year,
      month: entry.month,
      type: entry.type,
      description: entry.description,
      category: entry.category,
      amount: entry.amount,
      amount_settled: entry.amountSettled,
      counterparty: entry.counterparty,
      platform: entry.platform ?? "",
      entry_date: entry.entryDate,
    })
    .select()
    .single();
  if (error) throw error;
  return toEntry(data);
}

export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabase.from("financial_entries").delete().eq("id", id);
  if (error) throw error;
}

/* ─── Account Receivables ─────────────────────────────────────────── */

export async function getReceivables(): Promise<AccountReceivable[]> {
  const { data, error } = await supabase
    .from("account_receivables")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toAR);
}

export async function createReceivable(
  r: Omit<AccountReceivable, "id" | "createdAt">
): Promise<AccountReceivable> {
  const { data, error } = await supabase
    .from("account_receivables")
    .insert({
      description: r.description,
      category: r.category,
      amount: r.amount,
      amount_received: r.amountReceived,
      paid_by: r.paidBy,
      platform: r.platform ?? "",
      status: r.status,
      due_date: r.dueDate,
      received_date: r.receivedDate,
    })
    .select()
    .single();
  if (error) throw error;
  return toAR(data);
}

export async function updateReceivable(
  id: string,
  patch: Partial<Omit<AccountReceivable, "id" | "createdAt">>
): Promise<AccountReceivable> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.description !== undefined) dbPatch.description = patch.description;
  if (patch.category !== undefined) dbPatch.category = patch.category;
  if (patch.amount !== undefined) dbPatch.amount = patch.amount;
  if (patch.amountReceived !== undefined) dbPatch.amount_received = patch.amountReceived;
  if (patch.paidBy !== undefined) dbPatch.paid_by = patch.paidBy;
  if (patch.platform !== undefined) dbPatch.platform = patch.platform;
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.dueDate !== undefined) dbPatch.due_date = patch.dueDate;
  if (patch.receivedDate !== undefined) dbPatch.received_date = patch.receivedDate;
  const { data, error } = await supabase
    .from("account_receivables").update(dbPatch).eq("id", id).select().single();
  if (error) throw error;
  return toAR(data);
}

export async function deleteReceivable(id: string): Promise<void> {
  const { error } = await supabase.from("account_receivables").delete().eq("id", id);
  if (error) throw error;
}

/* ─── Account Payables ────────────────────────────────────────────── */

export async function getPayables(): Promise<AccountPayable[]> {
  const { data, error } = await supabase
    .from("account_payables")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toAP);
}

export async function createPayable(
  p: Omit<AccountPayable, "id" | "createdAt">
): Promise<AccountPayable> {
  const { data, error } = await supabase
    .from("account_payables")
    .insert({
      description: p.description,
      category: p.category,
      amount: p.amount,
      amount_paid: p.amountPaid,
      paid_to: p.paidTo,
      platform: p.platform ?? "",
      status: p.status,
      due_date: p.dueDate,
      paid_date: p.paidDate,
    })
    .select()
    .single();
  if (error) throw error;
  return toAP(data);
}

export async function updatePayable(
  id: string,
  patch: Partial<Omit<AccountPayable, "id" | "createdAt">>
): Promise<AccountPayable> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.description !== undefined) dbPatch.description = patch.description;
  if (patch.category !== undefined) dbPatch.category = patch.category;
  if (patch.amount !== undefined) dbPatch.amount = patch.amount;
  if (patch.amountPaid !== undefined) dbPatch.amount_paid = patch.amountPaid;
  if (patch.paidTo !== undefined) dbPatch.paid_to = patch.paidTo;
  if (patch.platform !== undefined) dbPatch.platform = patch.platform;
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.dueDate !== undefined) dbPatch.due_date = patch.dueDate;
  if (patch.paidDate !== undefined) dbPatch.paid_date = patch.paidDate;
  const { data, error } = await supabase
    .from("account_payables").update(dbPatch).eq("id", id).select().single();
  if (error) throw error;
  return toAP(data);
}

export async function deletePayable(id: string): Promise<void> {
  const { error } = await supabase.from("account_payables").delete().eq("id", id);
  if (error) throw error;
}

/* ─── Monthly Cash Settings ───────────────────────────────────────── */

export async function getCashBeginning(year: number, month: number): Promise<number> {
  const { data } = await supabase
    .from("monthly_cash_settings")
    .select("cash_beginning")
    .eq("year", year)
    .eq("month", month)
    .single();
  return Number(data?.cash_beginning ?? 0);
}

export async function setCashBeginning(year: number, month: number, amount: number): Promise<void> {
  const { error } = await supabase
    .from("monthly_cash_settings")
    .upsert({ year, month, cash_beginning: amount }, { onConflict: "year,month" });
  if (error) throw error;
}

/* ─── Budgets ─────────────────────────────────────────────────────── */

export async function getBudgets(): Promise<Budget[]> {
  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(toBudget);
}

export async function createBudget(
  b: Omit<Budget, "id" | "createdAt">
): Promise<Budget> {
  const { data, error } = await supabase
    .from("budgets")
    .insert({ category: b.category, amount: b.amount })
    .select()
    .single();
  if (error) throw error;
  return toBudget(data);
}

export async function updateBudget(
  id: string,
  patch: Partial<Omit<Budget, "id" | "createdAt">>
): Promise<Budget> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.category !== undefined) dbPatch.category = patch.category;
  if (patch.amount !== undefined) dbPatch.amount = patch.amount;
  const { data, error } = await supabase
    .from("budgets").update(dbPatch).eq("id", id).select().single();
  if (error) throw error;
  return toBudget(data);
}

export async function deleteBudget(id: string): Promise<void> {
  const { error } = await supabase.from("budgets").delete().eq("id", id);
  if (error) throw error;
}

/* ─── Platforms ───────────────────────────────────────────────────── */

export async function getPlatforms(): Promise<Platform[]> {
  const { data, error } = await supabase
    .from("platforms")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(toPlatform);
}

export async function createPlatform(p: Pick<Platform, "name" | "color" | "openingBalance">): Promise<Platform> {
  const { data, error } = await supabase
    .from("platforms")
    .insert({ name: p.name, color: p.color, opening_balance: p.openingBalance ?? 0 })
    .select()
    .single();
  if (error) throw error;
  return toPlatform(data);
}

export async function updatePlatform(
  id: string,
  patch: Partial<Pick<Platform, "name" | "color" | "openingBalance">>
): Promise<Platform> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.color !== undefined) dbPatch.color = patch.color;
  if (patch.openingBalance !== undefined) dbPatch.opening_balance = patch.openingBalance;
  const { data, error } = await supabase
    .from("platforms").update(dbPatch).eq("id", id).select().single();
  if (error) throw error;
  return toPlatform(data);
}

export async function deletePlatform(id: string): Promise<void> {
  const { error } = await supabase.from("platforms").delete().eq("id", id);
  if (error) throw error;
}

export async function getPlatformBalances(): Promise<PlatformBalance[]> {
  const [{ data: platforms, error: pe }, { data: entries, error: ee }] = await Promise.all([
    supabase.from("platforms").select("*").order("created_at", { ascending: true }),
    supabase.from("financial_entries").select("type, amount, platform"),
  ]);
  if (pe) throw pe;
  if (ee) throw ee;
  return (platforms ?? []).map((p) => {
    const pEntries = (entries ?? []).filter((e) => e.platform === p.name);
    const income = pEntries.filter((e) => e.type === "income").reduce((s: number, e: { amount: number }) => s + Number(e.amount), 0);
    const expenses = pEntries.filter((e) => e.type === "expense").reduce((s: number, e: { amount: number }) => s + Number(e.amount), 0);
    const opening = Number(p.opening_balance ?? 0);
    return { ...toPlatform(p), income, expenses, balance: opening + income - expenses };
  });
}
