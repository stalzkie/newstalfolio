"use client";

import { useEffect, useState, useCallback } from "react";
import * as svc from "@/lib/money-service";
import type {
  FinancialEntry, AccountReceivable, AccountPayable,
  EntryType, ARStatus, APStatus, Budget, Platform, PlatformBalance,
} from "@/lib/money-service";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Plus, Trash2, TrendingUp, TrendingDown, DollarSign,
  ChevronDown, Check, X, ChevronLeft, ChevronRight,
} from "lucide-react";

/* ─── Constants ───────────────────────────────────────────────────── */

const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
const MONTHS_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const CURRENT_YEAR = new Date().getFullYear();

const PLATFORM_COLORS = [
  "#1a1a1a","#2563eb","#7c3aed","#dc2626","#d97706",
  "#059669","#0891b2","#db2777","#65a30d","#ea580c",
];

const AR_STATUS_CFG: Record<ARStatus, { label: string; color: string }> = {
  pending:  { label: "pending",  color: "bg-yellow-50 text-yellow-700" },
  received: { label: "received", color: "bg-green-50 text-green-700" },
  overdue:  { label: "overdue",  color: "bg-red-50 text-red-600" },
  partial:  { label: "partial",  color: "bg-blue-50 text-blue-600" },
};

const AP_STATUS_CFG: Record<APStatus, { label: string; color: string }> = {
  pending: { label: "pending", color: "bg-yellow-50 text-yellow-700" },
  paid:    { label: "paid",    color: "bg-green-50 text-green-700" },
  overdue: { label: "overdue", color: "bg-red-50 text-red-600" },
  partial: { label: "partial", color: "bg-blue-50 text-blue-600" },
};

/* ─── Helpers ─────────────────────────────────────────────────────── */

const peso = (n: number) =>
  "₱" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const pesoShort = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `₱${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `₱${(n / 1_000).toFixed(1)}K`;
  return peso(n);
};

function sumBy(entries: FinancialEntry[], type: EntryType) {
  return entries.filter((e) => e.type === type).reduce((s, e) => s + e.amount, 0);
}

function groupByCategory(entries: FinancialEntry[], type: EntryType) {
  const filtered = entries.filter((e) => e.type === type);
  const map: Record<string, number> = {};
  for (const e of filtered) {
    map[e.category || "uncategorized"] = (map[e.category || "uncategorized"] || 0) + e.amount;
  }
  return Object.entries(map)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

/* ─── Shared Table Input ──────────────────────────────────────────── */

function Cell({
  value, onChange, placeholder, type = "text", className = "",
}: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none lowercase ${className}`}
    />
  );
}

/* ─── KPI Card ────────────────────────────────────────────────────── */

function KPI({
  label, value, sub, trend, color = "gray",
}: {
  label: string; value: string; sub?: string;
  trend?: "up" | "down" | "neutral"; color?: "green" | "red" | "gray" | "blue";
}) {
  const colors = {
    green: "bg-green-50 border-green-100",
    red:   "bg-red-50 border-red-100",
    gray:  "bg-gray-50 border-gray-100",
    blue:  "bg-blue-50 border-blue-100",
  };
  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-1 ${colors[color]}`}>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest lowercase">{label}</p>
      <p className={`text-2xl font-black tracking-tight ${color === "green" ? "text-green-700" : color === "red" ? "text-red-600" : color === "blue" ? "text-blue-600" : "text-gray-900"}`}>
        {value}
      </p>
      {sub && (
        <p className="text-[11px] text-gray-500 lowercase flex items-center gap-1">
          {trend === "up" && <TrendingUp size={11} className="text-green-500" />}
          {trend === "down" && <TrendingDown size={11} className="text-red-500" />}
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─── Status Badge ────────────────────────────────────────────────── */

function StatusBadge<T extends string>({
  value, cfg, onChange,
}: {
  value: T;
  cfg: Record<string, { label: string; color: string }>;
  onChange?: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const c = cfg[value] ?? { label: value, color: "bg-gray-100 text-gray-500" };
  return (
    <div className="relative">
      <button
        onClick={() => onChange && setOpen((o) => !o)}
        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold lowercase ${c.color} ${onChange ? "cursor-pointer" : "cursor-default"}`}
      >
        {c.label}
      </button>
      {open && onChange && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-100 rounded-xl shadow-lg p-1 flex flex-col gap-0.5 min-w-[120px]">
          {Object.entries(cfg).map(([k, v]) => (
            <button
              key={k}
              onClick={() => { onChange(k as T); setOpen(false); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-50 text-left"
            >
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${v.color}`}>{v.label}</span>
              {k === value && <Check size={10} className="ml-auto text-gray-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Platform Picker ─────────────────────────────────────────────── */

function PlatformPicker({
  value, platforms, onChange,
}: {
  value: string;
  platforms: Platform[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = platforms.find((p) => p.name === value);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors px-1.5 py-0.5 text-[10px] w-full"
      >
        {selected ? (
          <>
            <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: selected.color }} />
            <span className="truncate lowercase text-gray-700">{selected.name}</span>
          </>
        ) : (
          <span className="text-gray-300 lowercase">none</span>
        )}
        <ChevronDown size={8} className="text-gray-300 flex-shrink-0 ml-auto" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-100 rounded-xl shadow-lg p-1 min-w-[140px] flex flex-col gap-0.5">
          <button
            onClick={() => { onChange(""); setOpen(false); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-50 text-gray-400 lowercase"
          >
            none {!value && <Check size={10} className="ml-auto" />}
          </button>
          {platforms.map((p) => (
            <button
              key={p.id}
              onClick={() => { onChange(p.name); setOpen(false); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-50 lowercase"
            >
              <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
              <span className="text-gray-700">{p.name}</span>
              {p.name === value && <Check size={10} className="ml-auto text-gray-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Custom Tooltip ──────────────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-xs">
      <p className="font-bold text-gray-700 mb-1.5 uppercase tracking-wide">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-500 lowercase">{p.name}:</span>
          <span className="font-semibold text-gray-800">{peso(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Dashboard Tab ───────────────────────────────────────────────── */

function Dashboard() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (y: number) => {
    setLoading(true);
    const data = await svc.getEntriesByYear(y);
    setEntries(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(year); }, [year, load]);

  const chartData = MONTHS.map((m, i) => {
    const monthEntries = entries.filter((e) => e.month === i + 1);
    const income = sumBy(monthEntries, "income");
    const expenses = sumBy(monthEntries, "expense");
    return { month: m.toUpperCase(), income, expenses, profit: income - expenses };
  });

  const totalIncome = entries.filter((e) => e.type === "income").reduce((s, e) => s + e.amount, 0);
  const totalExpenses = entries.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const margin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
  const activeMonths = chartData.filter((m) => m.income > 0 || m.expenses > 0).length || 1;
  const avgMonthlyProfit = netProfit / activeMonths;
  const bestMonth = [...chartData].sort((a, b) => b.profit - a.profit)[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setYear((y) => y - 1)} className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
          <ChevronLeft size={14} className="text-gray-500" />
        </button>
        <span className="text-sm font-bold text-gray-900 w-12 text-center">{year}</span>
        <button onClick={() => setYear((y) => y + 1)} disabled={year >= CURRENT_YEAR} className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-colors">
          <ChevronRight size={14} className="text-gray-500" />
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KPI label="total revenue" value={pesoShort(totalIncome)} color="green" />
        <KPI label="total expenses" value={pesoShort(totalExpenses)} color="red" />
        <KPI label="net profit" value={pesoShort(netProfit)} color={netProfit >= 0 ? "green" : "red"} trend={netProfit >= 0 ? "up" : "down"} />
        <KPI label="profit margin" value={`${margin.toFixed(1)}%`} color={margin >= 0 ? "blue" : "red"} />
        <KPI label="avg monthly profit" value={pesoShort(avgMonthlyProfit)} color={avgMonthlyProfit >= 0 ? "gray" : "red"} />
        <KPI
          label="best month"
          value={bestMonth.profit > 0 ? MONTHS_FULL[chartData.indexOf(bestMonth)] : "—"}
          sub={bestMonth.profit > 0 ? pesoShort(bestMonth.profit) + " profit" : "no data yet"}
          color="gray"
        />
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-bold text-gray-900 lowercase">revenue vs expenses</p>
            <p className="text-xs text-gray-400 lowercase">monthly overview · {year}</p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-gray-500"><span className="h-2 w-2 rounded-full bg-emerald-400" />income</span>
            <span className="flex items-center gap-1.5 text-gray-500"><span className="h-2 w-2 rounded-full bg-red-400" />expenses</span>
          </div>
        </div>
        {loading ? (
          <div className="h-56 flex items-center justify-center">
            <div className="h-5 w-5 rounded-full border-2 border-gray-200 border-t-gray-700 animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => pesoShort(v)} tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={55} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="income" name="income" stroke="#10b981" strokeWidth={2} fill="url(#incGrad)" dot={false} activeDot={{ r: 4, fill: "#10b981" }} />
              <Area type="monotone" dataKey="expenses" name="expenses" stroke="#f87171" strokeWidth={2} fill="url(#expGrad)" dot={false} activeDot={{ r: 4, fill: "#f87171" }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <div className="mb-4">
          <p className="text-sm font-bold text-gray-900 lowercase">monthly profit</p>
          <p className="text-xs text-gray-400 lowercase">net profit per month · {year}</p>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => pesoShort(v)} tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={55} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="profit" name="profit" radius={[4, 4, 0, 0]} fill="#1a1a1a" label={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl">
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900 lowercase">monthly breakdown · {year}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">month</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">income</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">expenses</th>
                <th className="text-right px-6 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">net profit</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row, i) => {
                const profit = row.income - row.expenses;
                const isEmpty = row.income === 0 && row.expenses === 0;
                return (
                  <tr key={row.month} className={`border-b border-gray-50 ${isEmpty ? "opacity-40" : ""}`}>
                    <td className="px-6 py-2.5 text-xs font-semibold text-gray-700 lowercase">{MONTHS_FULL[i]}</td>
                    <td className="px-4 py-2.5 text-xs text-right text-green-600 font-medium">{row.income > 0 ? peso(row.income) : "—"}</td>
                    <td className="px-4 py-2.5 text-xs text-right text-red-500 font-medium">{row.expenses > 0 ? peso(row.expenses) : "—"}</td>
                    <td className={`px-6 py-2.5 text-xs text-right font-bold ${profit >= 0 ? "text-gray-900" : "text-red-600"}`}>
                      {isEmpty ? "—" : peso(profit)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td className="px-6 py-2.5 text-xs font-bold text-gray-900 lowercase">total</td>
                <td className="px-4 py-2.5 text-xs font-bold text-right text-green-600">{peso(totalIncome)}</td>
                <td className="px-4 py-2.5 text-xs font-bold text-right text-red-500">{peso(totalExpenses)}</td>
                <td className={`px-6 py-2.5 text-xs font-black text-right ${netProfit >= 0 ? "text-gray-900" : "text-red-600"}`}>{peso(netProfit)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Budget Section ──────────────────────────────────────────────── */

function BudgetSection({ expenses, year, month }: { expenses: FinancialEntry[]; year: number; month: number }) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ category: "", amount: 0 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    svc.getBudgets()
      .then(setBudgets)
      .catch((e) => setError(e instanceof Error ? e.message : "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!draft.category || draft.amount <= 0) return;
    try {
      const created = await svc.createBudget({ ...draft, category: draft.category.trim() });
      setBudgets((prev) => [...prev, created]);
      setDraft({ category: "", amount: 0 });
      setAdding(false);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "error"); }
  };

  const handleDelete = async (id: string) => {
    try {
      await svc.deleteBudget(id);
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "error"); }
  };

  if (loading) return null;
  const hasContent = budgets.length > 0 || adding;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-gray-700 lowercase">budgets · {MONTHS_FULL[month - 1].toLowerCase()} {year}</p>
        {!adding && (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition-colors lowercase">
            <Plus size={11} /> add budget
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 lowercase">{error}</p>}
      {hasContent && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {budgets.map((b) => {
            const spent = expenses
              .filter((e) => (e.category || "uncategorized").trim().toLowerCase() === b.category.trim().toLowerCase())
              .reduce((s, e) => s + e.amount, 0);
            const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0;
            const isOver = pct >= 100;
            const isNear = pct >= 70 && pct < 100;
            const cardColor = isOver ? "bg-red-50 border-red-200" : isNear ? "bg-yellow-50 border-yellow-200" : "bg-gray-50 border-gray-100";
            const barColor = isOver ? "bg-red-400" : isNear ? "bg-yellow-400" : "bg-emerald-400";
            const valueColor = isOver ? "text-red-600" : isNear ? "text-yellow-600" : "text-gray-900";
            const pctColor = isOver ? "text-red-500" : isNear ? "text-yellow-600" : "text-gray-400";
            return (
              <div key={b.id} className={`rounded-2xl border p-4 flex flex-col gap-2 group relative ${cardColor}`}>
                <button onClick={() => handleDelete(b.id)} className="absolute top-2 right-2 h-5 w-5 rounded hover:bg-red-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={10} className="text-red-400" />
                </button>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest pr-5 truncate">{b.category}</p>
                <p className={`text-xl font-black tracking-tight ${valueColor}`}>{peso(spent)}</p>
                <p className="text-[10px] text-gray-400 lowercase">of {peso(b.amount)}</p>
                <div className="h-1.5 rounded-full bg-gray-200/80 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <p className={`text-[10px] font-semibold lowercase ${pctColor}`}>
                  {pct.toFixed(0)}% used{isOver ? " — over budget!" : isNear ? " — near limit" : ""}
                </p>
              </div>
            );
          })}
          {adding && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-4 flex flex-col gap-3">
              <input
                value={draft.category}
                onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                placeholder="category name"
                className="text-xs text-gray-700 bg-transparent focus:outline-none border-b border-gray-100 pb-1 lowercase placeholder:text-gray-300"
              />
              <input
                type="number"
                value={draft.amount === 0 ? "" : String(draft.amount)}
                onChange={(e) => setDraft((d) => ({ ...d, amount: parseFloat(e.target.value) || 0 }))}
                placeholder="budget amount"
                className="text-xs text-gray-700 bg-transparent focus:outline-none border-b border-gray-100 pb-1 placeholder:text-gray-300"
              />
              <div className="flex gap-1.5 mt-auto">
                <button onClick={handleAdd} className="flex-1 py-1.5 bg-gray-900 text-white rounded-lg text-[10px] font-semibold lowercase">save</button>
                <button onClick={() => { setAdding(false); setDraft({ category: "", amount: 0 }); }} className="flex-1 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-semibold lowercase hover:bg-gray-200">cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
      {!hasContent && (
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-dashed border-gray-200 text-xs text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors w-full lowercase">
          <Plus size={13} /> set a budget category
        </button>
      )}
    </div>
  );
}

/* ─── Monthly Tab ─────────────────────────────────────────────────── */

const EMPTY_INCOME = (): Omit<FinancialEntry, "id" | "createdAt"> => ({
  year: CURRENT_YEAR, month: new Date().getMonth() + 1, type: "income",
  description: "", category: "", amount: 0, amountSettled: 0, counterparty: "", platform: "", entryDate: null,
});
const EMPTY_EXPENSE = (): Omit<FinancialEntry, "id" | "createdAt"> => ({
  ...EMPTY_INCOME(), type: "expense",
});

function MonthlyTracker({ platforms }: { platforms: Platform[] }) {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newIncome, setNewIncome] = useState(EMPTY_INCOME());
  const [newExpense, setNewExpense] = useState(EMPTY_EXPENSE());
  const [addingIncome, setAddingIncome] = useState(false);
  const [addingExpense, setAddingExpense] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cashBeginning, setCashBeginningState] = useState(0);
  const [editingCash, setEditingCash] = useState(false);
  const [cashDraft, setCashDraft] = useState("");
  const [platformBalances, setPlatformBalances] = useState<PlatformBalance[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data, cb, pb] = await Promise.all([
        svc.getEntriesByMonth(year, month),
        svc.getCashBeginning(year, month),
        platforms.length > 0 ? svc.getPlatformBalances() : Promise.resolve([]),
      ]);
      setEntries(data);
      setCashBeginningState(cb);
      setPlatformBalances(pb);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "error"); }
    setLoading(false);
  }, [year, month, platforms.length]);

  useEffect(() => { load(); }, [load]);

  const saveCashBeginning = async (val: number) => {
    try {
      await svc.setCashBeginning(year, month, val);
      setCashBeginningState(val);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "error"); }
    setEditingCash(false);
  };

  const income = entries.filter((e) => e.type === "income");
  const expenses = entries.filter((e) => e.type === "expense");
  const totalIncome = income.reduce((s, e) => s + e.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const cashEnd = cashBeginning + netProfit;

  const handleAdd = async (type: EntryType) => {
    const draft = type === "income" ? newIncome : newExpense;
    if (!draft.description) return;
    try {
      const created = await svc.createEntry({ ...draft, year, month, type, category: draft.category.trim() });
      setEntries((prev) => [...prev, created]);
      if (type === "income") { setNewIncome(EMPTY_INCOME()); setAddingIncome(false); }
      else { setNewExpense(EMPTY_EXPENSE()); setAddingExpense(false); }
      // Refresh platform balances
      if (platforms.length > 0) {
        const pb = await svc.getPlatformBalances();
        setPlatformBalances(pb);
      }
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "error"); }
  };

  const handleDelete = async (id: string) => {
    try {
      await svc.deleteEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      if (platforms.length > 0) {
        const pb = await svc.getPlatformBalances();
        setPlatformBalances(pb);
      }
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "error"); }
  };

  const incomeByCategory = groupByCategory(entries, "income");
  const expenseByCategory = groupByCategory(entries, "expense");

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setYear((y) => y - 1)} className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
            <ChevronLeft size={14} className="text-gray-500" />
          </button>
          <span className="text-sm font-bold text-gray-900 w-12 text-center">{year}</span>
          <button onClick={() => setYear((y) => y + 1)} disabled={year >= CURRENT_YEAR} className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30">
            <ChevronRight size={14} className="text-gray-500" />
          </button>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {MONTHS.map((m, i) => (
            <button
              key={m}
              onClick={() => setMonth(i + 1)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold lowercase transition-colors ${month === i + 1 ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPI label="income" value={peso(totalIncome)} color="green" />
        <KPI label="expenses" value={peso(totalExpenses)} color="red" />
        <KPI label="net profit" value={peso(netProfit)} color={netProfit >= 0 ? "blue" : "red"} trend={netProfit >= 0 ? "up" : "down"} />

        {/* Cash Beginning — click to edit */}
        <div
          className="rounded-2xl border border-gray-100 bg-gray-50 p-5 flex flex-col gap-1 cursor-pointer group"
          onClick={() => { if (!editingCash) { setCashDraft(String(cashBeginning)); setEditingCash(true); } }}
        >
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">cash beginning</p>
          {editingCash ? (
            <input
              autoFocus
              type="number"
              value={cashDraft}
              onChange={(e) => setCashDraft(e.target.value)}
              onBlur={() => saveCashBeginning(parseFloat(cashDraft) || 0)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveCashBeginning(parseFloat(cashDraft) || 0);
                if (e.key === "Escape") setEditingCash(false);
              }}
              onClick={(e) => e.stopPropagation()}
              className="text-2xl font-black tracking-tight text-gray-900 bg-transparent focus:outline-none w-full border-b border-gray-300"
            />
          ) : (
            <p className="text-2xl font-black tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
              {peso(cashBeginning)}
            </p>
          )}
          <p className="text-[11px] text-gray-400 lowercase">click to edit</p>
        </div>

        {/* Cash End — auto-calculated */}
        <div className={`rounded-2xl border p-5 flex flex-col gap-1 ${cashEnd >= 0 ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">cash end</p>
          <p className={`text-2xl font-black tracking-tight ${cashEnd >= 0 ? "text-green-700" : "text-red-600"}`}>
            {peso(cashEnd)}
          </p>
          <p className="text-[11px] text-gray-400 lowercase">beginning ± net</p>
        </div>
      </div>

      {error && (
        <div className="px-4 py-2 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 lowercase flex justify-between">
          {error} <button onClick={() => setError(null)} className="font-semibold">dismiss</button>
        </div>
      )}

      {/* Platform balances */}
      {platformBalances.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-700 lowercase">platform balances</p>
            <button
              onClick={async () => {
                const total = platformBalances.reduce((s, p) => s + p.balance, 0);
                await saveCashBeginning(total);
              }}
              className="flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-700 transition-colors lowercase font-semibold"
            >
              <DollarSign size={11} /> use total as cash beginning
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {platformBalances.map((p) => (
              <div key={p.id} className="rounded-2xl border border-gray-100 bg-white p-4 flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest truncate">{p.name}</p>
                </div>
                <p className={`text-xl font-black tracking-tight ${p.balance >= 0 ? "text-gray-900" : "text-red-600"}`}>
                  {peso(p.balance)}
                </p>
                <p className="text-[10px] text-gray-400 lowercase">+{pesoShort(p.income)} / −{pesoShort(p.expenses)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget cards */}
      <BudgetSection expenses={expenses} year={year} month={month} />

      {/* Bar charts */}
      {(incomeByCategory.length > 0 || expenseByCategory.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {incomeByCategory.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="text-xs font-bold text-gray-700 lowercase mb-4">income by category</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={incomeByCategory} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => pesoShort(v)} tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="category" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="amount" name="income" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {expenseByCategory.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="text-xs font-bold text-gray-700 lowercase mb-4">expenses by category</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={expenseByCategory} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => pesoShort(v)} tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="category" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="amount" name="expenses" fill="#f87171" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Income table */}
      <FinancialTable
        title="income" type="income" entries={income} loading={loading}
        adding={addingIncome} draft={newIncome}
        onDraftChange={(patch) => setNewIncome((d) => ({ ...d, ...patch }))}
        note="receivables transfer here when marked received"
        onStartAdd={() => setAddingIncome(true)}
        onCancelAdd={() => { setAddingIncome(false); setNewIncome(EMPTY_INCOME()); }}
        onConfirmAdd={() => handleAdd("income")}
        onDelete={handleDelete}
        totalLabel="total income" total={totalIncome}
        platforms={platforms}
      />

      {/* Expense table */}
      <FinancialTable
        title="expenses" type="expense" entries={expenses} loading={loading}
        adding={addingExpense} draft={newExpense}
        onDraftChange={(patch) => setNewExpense((d) => ({ ...d, ...patch }))}
        onStartAdd={() => setAddingExpense(true)}
        onCancelAdd={() => { setAddingExpense(false); setNewExpense(EMPTY_EXPENSE()); }}
        onConfirmAdd={() => handleAdd("expense")}
        onDelete={handleDelete}
        totalLabel="total expenses" total={totalExpenses}
        platforms={platforms}
      />
    </div>
  );
}

/* ─── Financial Table (Income / Expense) ──────────────────────────── */

function FinancialTable({
  title, type, entries, loading, adding, draft,
  onDraftChange, onStartAdd, onCancelAdd, onConfirmAdd, onDelete, totalLabel, total, note, platforms,
}: {
  title: string; type: EntryType; entries: FinancialEntry[]; loading: boolean;
  adding: boolean; draft: Omit<FinancialEntry, "id" | "createdAt">;
  onDraftChange: (patch: Partial<Omit<FinancialEntry, "id" | "createdAt">>) => void;
  onStartAdd: () => void; onCancelAdd: () => void; onConfirmAdd: () => void;
  onDelete: (id: string) => void; totalLabel: string; total: number;
  note?: string; platforms: Platform[];
}) {
  const isIncome = type === "income";
  const accentGreen = isIncome ? "text-green-600" : "text-red-500";

  const COL_HEADERS = [
    { label: "description", w: "flex-1" },
    { label: "category",    w: "w-32" },
    { label: "amount",      w: "w-32" },
    { label: isIncome ? "paid by" : "paid to", w: "w-36" },
    { label: "platform",   w: "w-32" },
    { label: "date",        w: "w-28" },
    { label: "",            w: "w-8"  },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl">
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-3 border-b rounded-t-2xl ${isIncome ? "border-green-50 bg-green-50/40" : "border-red-50 bg-red-50/40"}`}>
        <div className="flex items-center gap-2 flex-wrap">
          {isIncome ? <TrendingUp size={14} className="text-green-500" /> : <TrendingDown size={14} className="text-red-400" />}
          <span className="text-xs font-bold text-gray-800 lowercase">{title}</span>
          <span className="text-[10px] text-gray-400">({entries.length})</span>
          {note && <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full lowercase">{note}</span>}
        </div>
        <span className={`text-sm font-black ${accentGreen}`}>{peso(total)}</span>
      </div>

      {/* Column headers */}
      <div className="flex items-center border-b border-gray-100 bg-gray-50/50">
        {COL_HEADERS.map((h) => (
          <div key={h.label} className={`${h.w} px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest border-r border-gray-100 last:border-r-0`}>
            {h.label}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="h-12 flex items-center justify-center">
          <div className="h-4 w-4 rounded-full border-2 border-gray-200 border-t-gray-600 animate-spin" />
        </div>
      ) : (
        <>
          {entries.map((e) => {
            const plat = platforms.find((p) => p.name === e.platform);
            return (
              <div key={e.id} className="flex items-center border-b border-gray-50 hover:bg-gray-50/50 group">
                <div className="flex-1 px-3 py-2.5"><p className="text-sm text-gray-800 lowercase truncate">{e.description}</p></div>
                <div className="w-32 px-3 py-2.5 border-l border-gray-50"><p className="text-xs text-gray-500 lowercase truncate">{e.category || "—"}</p></div>
                <div className="w-32 px-3 py-2.5 border-l border-gray-50"><p className={`text-sm font-semibold ${accentGreen}`}>{peso(e.amount)}</p></div>
                <div className="w-36 px-3 py-2.5 border-l border-gray-50"><p className="text-xs text-gray-500 lowercase truncate">{e.counterparty || "—"}</p></div>
                <div className="w-32 px-3 py-2.5 border-l border-gray-50">
                  {plat ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-gray-600 font-medium lowercase">
                      <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: plat.color }} />
                      {plat.name}
                    </span>
                  ) : <p className="text-[11px] text-gray-300">—</p>}
                </div>
                <div className="w-28 px-3 py-2.5 border-l border-gray-50"><p className="text-[11px] text-gray-400">{e.entryDate ?? "—"}</p></div>
                <div className="w-8 flex items-center justify-center py-2.5 border-l border-gray-50">
                  <button onClick={() => onDelete(e.id)} className="h-6 w-6 rounded-lg hover:bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={11} className="text-red-400" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* New row form */}
          {adding && (
            <div className="flex items-center border-b border-gray-900/20 bg-gray-50/70">
              <div className="flex-1 px-3 py-2">
                <Cell value={draft.description} onChange={(v) => onDraftChange({ description: v })} placeholder="description" />
              </div>
              <div className="w-32 px-3 py-2 border-l border-gray-200">
                <Cell value={draft.category} onChange={(v) => onDraftChange({ category: v })} placeholder="category" />
              </div>
              <div className="w-32 px-3 py-2 border-l border-gray-200">
                <Cell type="number" value={draft.amount === 0 ? "" : String(draft.amount)} onChange={(v) => onDraftChange({ amount: parseFloat(v) || 0 })} placeholder="0.00" className="text-right" />
              </div>
              <div className="w-36 px-3 py-2 border-l border-gray-200">
                <Cell value={draft.counterparty} onChange={(v) => onDraftChange({ counterparty: v })} placeholder={isIncome ? "paid by" : "paid to"} />
              </div>
              <div className="w-32 px-3 py-2 border-l border-gray-200">
                <PlatformPicker value={draft.platform} platforms={platforms} onChange={(v) => onDraftChange({ platform: v })} />
              </div>
              <div className="w-28 px-3 py-2 border-l border-gray-200">
                <input type="date" value={draft.entryDate ?? ""} onChange={(e) => onDraftChange({ entryDate: e.target.value || null })} className="text-[11px] text-gray-600 bg-transparent focus:outline-none w-full" />
              </div>
              <div className="w-8 flex items-center justify-center gap-1 py-2 border-l border-gray-200 flex-shrink-0">
                <button onClick={onConfirmAdd} className="h-5 w-5 rounded bg-gray-900 flex items-center justify-center">
                  <Check size={10} className="text-white" />
                </button>
                <button onClick={onCancelAdd} className="h-5 w-5 rounded hover:bg-gray-100 flex items-center justify-center">
                  <X size={10} className="text-gray-400" />
                </button>
              </div>
            </div>
          )}

          <button onClick={onStartAdd} className="flex items-center gap-1.5 w-full px-4 py-2.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors lowercase rounded-b-2xl">
            <Plus size={12} /> add {title === "income" ? "income" : "expense"}
          </button>
        </>
      )}
    </div>
  );
}

/* ─── Receivables Tab ─────────────────────────────────────────────── */

function ReceivablesTab({ platforms }: { platforms: Platform[] }) {
  const [items, setItems] = useState<AccountReceivable[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const EMPTY_AR = (): Omit<AccountReceivable, "id" | "createdAt"> => ({
    description: "", category: "", amount: 0, amountReceived: 0, paidBy: "",
    platform: "", status: "pending", dueDate: null, receivedDate: null,
  });
  const [draft, setDraft] = useState<Omit<AccountReceivable, "id" | "createdAt">>(EMPTY_AR());
  const [error, setError] = useState<string | null>(null);
  const [transferring, setTransferring] = useState<string | null>(null);

  useEffect(() => {
    svc.getReceivables()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const totalOwed = items.filter((i) => i.status !== "received").reduce((s, i) => s + i.amount, 0);
  const totalReceived = items.reduce((s, i) => s + i.amountReceived, 0);

  const handleAdd = async () => {
    if (!draft.description) return;
    try {
      const created = await svc.createReceivable(draft);
      setItems((prev) => [created, ...prev]);
      setDraft(EMPTY_AR());
      setAdding(false);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "error"); }
  };

  const handleMarkReceived = async (item: AccountReceivable) => {
    setTransferring(item.id);
    try {
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      await svc.createEntry({
        year: now.getFullYear(), month: now.getMonth() + 1, type: "income",
        description: item.description, category: item.category,
        amount: item.amount, amountSettled: item.amount,
        counterparty: item.paidBy, platform: item.platform, entryDate: today,
      });
      const updated = await svc.updateReceivable(item.id, {
        status: "received", amountReceived: item.amount, receivedDate: today,
      });
      setItems((prev) => prev.map((i) => i.id === item.id ? updated : i));
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "error"); }
    setTransferring(null);
  };

  const handleStatusChange = async (id: string, status: ARStatus) => {
    try {
      const updated = await svc.updateReceivable(id, { status });
      setItems((prev) => prev.map((i) => i.id === id ? updated : i));
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "error"); }
  };

  const handleDelete = async (id: string) => {
    try {
      await svc.deleteReceivable(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "error"); }
  };

  const AR_COLS = [
    { l: "description", w: "flex-1" }, { l: "category", w: "w-28" },
    { l: "amount", w: "w-32" }, { l: "amount received", w: "w-32" },
    { l: "paid by", w: "w-32" }, { l: "platform", w: "w-32" },
    { l: "due date", w: "w-28" }, { l: "status", w: "w-24" },
    { l: "action", w: "w-28" }, { l: "", w: "w-8" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-4">
        <KPI label="total outstanding" value={peso(totalOwed)} color="red" />
        <KPI label="total received" value={peso(totalReceived)} color="green" />
        <KPI label="entries" value={String(items.length)} color="gray" />
      </div>
      {error && (
        <div className="px-4 py-2 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 flex justify-between">
          {error}<button onClick={() => setError(null)} className="font-semibold">dismiss</button>
        </div>
      )}
      <div className="bg-white border border-gray-100 rounded-2xl">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-green-50/30 rounded-t-2xl">
          <span className="text-xs font-bold text-gray-800 lowercase">account receivables</span>
          <span className="text-sm font-black text-green-600">{peso(totalOwed)} outstanding</span>
        </div>
        <div className="flex items-center border-b border-gray-100 bg-gray-50/50">
          {AR_COLS.map((h) => (
            <div key={h.l} className={`${h.w} px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest border-r border-gray-100 last:border-r-0`}>{h.l}</div>
          ))}
        </div>
        {loading ? (
          <div className="h-12 flex items-center justify-center">
            <div className="h-4 w-4 rounded-full border-2 border-gray-200 border-t-gray-600 animate-spin" />
          </div>
        ) : (
          <>
            {items.map((item) => {
              const plat = platforms.find((p) => p.name === item.platform);
              return (
                <div key={item.id} className="flex items-center border-b border-gray-50 hover:bg-gray-50/50 group">
                  <div className="flex-1 px-3 py-2.5"><p className="text-sm text-gray-800 lowercase truncate">{item.description}</p></div>
                  <div className="w-28 px-3 py-2.5 border-l border-gray-50"><p className="text-xs text-gray-500 lowercase truncate">{item.category || "—"}</p></div>
                  <div className="w-32 px-3 py-2.5 border-l border-gray-50"><p className="text-sm font-semibold text-gray-800">{peso(item.amount)}</p></div>
                  <div className="w-32 px-3 py-2.5 border-l border-gray-50"><p className={`text-sm font-medium ${item.amountReceived > 0 ? "text-green-600" : "text-gray-300"}`}>{item.amountReceived > 0 ? peso(item.amountReceived) : "—"}</p></div>
                  <div className="w-32 px-3 py-2.5 border-l border-gray-50"><p className="text-xs text-gray-500 lowercase truncate">{item.paidBy || "—"}</p></div>
                  <div className="w-32 px-3 py-2.5 border-l border-gray-50">
                    {plat ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-gray-600 font-medium lowercase">
                        <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: plat.color }} />
                        {plat.name}
                      </span>
                    ) : <p className="text-[11px] text-gray-300">—</p>}
                  </div>
                  <div className="w-28 px-3 py-2.5 border-l border-gray-50"><p className="text-[11px] text-gray-400">{item.dueDate ?? "—"}</p></div>
                  <div className="w-24 px-3 py-2.5 border-l border-gray-50">
                    <StatusBadge<ARStatus> value={item.status} cfg={AR_STATUS_CFG} onChange={(s) => handleStatusChange(item.id, s)} />
                  </div>
                  <div className="w-28 px-3 py-2.5 border-l border-gray-50">
                    {item.status !== "received" ? (
                      <button onClick={() => handleMarkReceived(item)} disabled={transferring === item.id}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 text-[11px] font-semibold lowercase transition-colors disabled:opacity-50">
                        <Check size={10} />
                        {transferring === item.id ? "saving…" : "received"}
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-300 lowercase">transferred</span>
                    )}
                  </div>
                  <div className="w-8 flex items-center justify-center py-2.5 border-l border-gray-50">
                    <button onClick={() => handleDelete(item.id)} className="h-6 w-6 rounded-lg hover:bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={11} className="text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })}
            {adding && (
              <div className="flex items-center border-b border-gray-900/20 bg-gray-50/70">
                <div className="flex-1 px-3 py-2"><Cell value={draft.description} onChange={(v) => setDraft((d) => ({ ...d, description: v }))} placeholder="description" /></div>
                <div className="w-28 px-3 py-2 border-l border-gray-200"><Cell value={draft.category} onChange={(v) => setDraft((d) => ({ ...d, category: v }))} placeholder="category" /></div>
                <div className="w-32 px-3 py-2 border-l border-gray-200"><Cell type="number" value={draft.amount === 0 ? "" : String(draft.amount)} onChange={(v) => setDraft((d) => ({ ...d, amount: parseFloat(v) || 0 }))} placeholder="0.00" className="text-right" /></div>
                <div className="w-32 px-3 py-2 border-l border-gray-200"><Cell type="number" value={draft.amountReceived === 0 ? "" : String(draft.amountReceived)} onChange={(v) => setDraft((d) => ({ ...d, amountReceived: parseFloat(v) || 0 }))} placeholder="0.00" className="text-right" /></div>
                <div className="w-32 px-3 py-2 border-l border-gray-200"><Cell value={draft.paidBy} onChange={(v) => setDraft((d) => ({ ...d, paidBy: v }))} placeholder="client name" /></div>
                <div className="w-32 px-3 py-2 border-l border-gray-200">
                  <PlatformPicker value={draft.platform} platforms={platforms} onChange={(v) => setDraft((d) => ({ ...d, platform: v }))} />
                </div>
                <div className="w-28 px-3 py-2 border-l border-gray-200"><input type="date" value={draft.dueDate ?? ""} onChange={(e) => setDraft((d) => ({ ...d, dueDate: e.target.value || null }))} className="text-[11px] text-gray-600 bg-transparent focus:outline-none w-full" /></div>
                <div className="w-24 px-3 py-2 border-l border-gray-200">
                  <select value={draft.status} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as ARStatus }))} className="text-[11px] text-gray-600 bg-transparent focus:outline-none w-full">
                    {Object.keys(AR_STATUS_CFG).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="w-28 border-l border-gray-200" />
                <div className="w-8 flex flex-col items-center justify-center gap-0.5 py-2 border-l border-gray-200">
                  <button onClick={handleAdd} className="h-5 w-5 rounded bg-gray-900 flex items-center justify-center"><Check size={10} className="text-white" /></button>
                  <button onClick={() => setAdding(false)} className="h-5 w-5 rounded hover:bg-gray-100 flex items-center justify-center"><X size={10} className="text-gray-400" /></button>
                </div>
              </div>
            )}
            <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 w-full px-4 py-2.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors lowercase rounded-b-2xl">
              <Plus size={12} /> add receivable
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Payables Tab ────────────────────────────────────────────────── */

function PayablesTab({ platforms }: { platforms: Platform[] }) {
  const [items, setItems] = useState<AccountPayable[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const EMPTY_AP = (): Omit<AccountPayable, "id" | "createdAt"> => ({
    description: "", category: "", amount: 0, amountPaid: 0, paidTo: "",
    platform: "", status: "pending", dueDate: null, paidDate: null,
  });
  const [draft, setDraft] = useState<Omit<AccountPayable, "id" | "createdAt">>(EMPTY_AP());
  const [error, setError] = useState<string | null>(null);
  const [transferring, setTransferring] = useState<string | null>(null);

  useEffect(() => {
    svc.getPayables()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const totalOwed = items.filter((i) => i.status !== "paid").reduce((s, i) => s + i.amount, 0);
  const totalPaid = items.reduce((s, i) => s + i.amountPaid, 0);

  const handleAdd = async () => {
    if (!draft.description) return;
    try {
      const created = await svc.createPayable(draft);
      setItems((prev) => [created, ...prev]);
      setDraft(EMPTY_AP());
      setAdding(false);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "error"); }
  };

  const handleMarkPaid = async (item: AccountPayable) => {
    setTransferring(item.id);
    try {
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      await svc.createEntry({
        year: now.getFullYear(), month: now.getMonth() + 1, type: "expense",
        description: item.description, category: item.category,
        amount: item.amount, amountSettled: item.amount,
        counterparty: item.paidTo, platform: item.platform, entryDate: today,
      });
      const updated = await svc.updatePayable(item.id, {
        status: "paid", amountPaid: item.amount, paidDate: today,
      });
      setItems((prev) => prev.map((i) => i.id === item.id ? updated : i));
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "error"); }
    setTransferring(null);
  };

  const handleStatusChange = async (id: string, status: APStatus) => {
    try {
      const updated = await svc.updatePayable(id, { status });
      setItems((prev) => prev.map((i) => i.id === id ? updated : i));
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "error"); }
  };

  const handleDelete = async (id: string) => {
    try {
      await svc.deletePayable(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "error"); }
  };

  const AP_COLS = [
    { l: "description", w: "flex-1" }, { l: "category", w: "w-28" },
    { l: "amount", w: "w-32" }, { l: "amount paid", w: "w-32" },
    { l: "paid to", w: "w-32" }, { l: "platform", w: "w-32" },
    { l: "due date", w: "w-28" }, { l: "status", w: "w-24" },
    { l: "action", w: "w-28" }, { l: "", w: "w-8" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-4">
        <KPI label="total outstanding" value={peso(totalOwed)} color="red" />
        <KPI label="total paid" value={peso(totalPaid)} color="green" />
        <KPI label="entries" value={String(items.length)} color="gray" />
      </div>
      {error && (
        <div className="px-4 py-2 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 flex justify-between">
          {error}<button onClick={() => setError(null)} className="font-semibold">dismiss</button>
        </div>
      )}
      <div className="bg-white border border-gray-100 rounded-2xl">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-red-50/30 rounded-t-2xl">
          <span className="text-xs font-bold text-gray-800 lowercase">account payables</span>
          <span className="text-sm font-black text-red-500">{peso(totalOwed)} outstanding</span>
        </div>
        <div className="flex items-center border-b border-gray-100 bg-gray-50/50">
          {AP_COLS.map((h) => (
            <div key={h.l} className={`${h.w} px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest border-r border-gray-100 last:border-r-0`}>{h.l}</div>
          ))}
        </div>
        {loading ? (
          <div className="h-12 flex items-center justify-center">
            <div className="h-4 w-4 rounded-full border-2 border-gray-200 border-t-gray-600 animate-spin" />
          </div>
        ) : (
          <>
            {items.map((item) => {
              const plat = platforms.find((p) => p.name === item.platform);
              return (
                <div key={item.id} className="flex items-center border-b border-gray-50 hover:bg-gray-50/50 group">
                  <div className="flex-1 px-3 py-2.5"><p className="text-sm text-gray-800 lowercase truncate">{item.description}</p></div>
                  <div className="w-28 px-3 py-2.5 border-l border-gray-50"><p className="text-xs text-gray-500 lowercase truncate">{item.category || "—"}</p></div>
                  <div className="w-32 px-3 py-2.5 border-l border-gray-50"><p className="text-sm font-semibold text-gray-800">{peso(item.amount)}</p></div>
                  <div className="w-32 px-3 py-2.5 border-l border-gray-50"><p className={`text-sm font-medium ${item.amountPaid > 0 ? "text-green-600" : "text-gray-300"}`}>{item.amountPaid > 0 ? peso(item.amountPaid) : "—"}</p></div>
                  <div className="w-32 px-3 py-2.5 border-l border-gray-50"><p className="text-xs text-gray-500 lowercase truncate">{item.paidTo || "—"}</p></div>
                  <div className="w-32 px-3 py-2.5 border-l border-gray-50">
                    {plat ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-gray-600 font-medium lowercase">
                        <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: plat.color }} />
                        {plat.name}
                      </span>
                    ) : <p className="text-[11px] text-gray-300">—</p>}
                  </div>
                  <div className="w-28 px-3 py-2.5 border-l border-gray-50"><p className="text-[11px] text-gray-400">{item.dueDate ?? "—"}</p></div>
                  <div className="w-24 px-3 py-2.5 border-l border-gray-50">
                    <StatusBadge<APStatus> value={item.status} cfg={AP_STATUS_CFG} onChange={(s) => handleStatusChange(item.id, s)} />
                  </div>
                  <div className="w-28 px-3 py-2.5 border-l border-gray-50">
                    {item.status !== "paid" ? (
                      <button onClick={() => handleMarkPaid(item)} disabled={transferring === item.id}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-900 hover:bg-gray-700 text-white text-[11px] font-semibold lowercase transition-colors disabled:opacity-50">
                        <Check size={10} />
                        {transferring === item.id ? "saving…" : "mark paid"}
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-300 lowercase">transferred</span>
                    )}
                  </div>
                  <div className="w-8 flex items-center justify-center py-2.5 border-l border-gray-50">
                    <button onClick={() => handleDelete(item.id)} className="h-6 w-6 rounded-lg hover:bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={11} className="text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })}
            {adding && (
              <div className="flex items-center border-b border-gray-900/20 bg-gray-50/70">
                <div className="flex-1 px-3 py-2"><Cell value={draft.description} onChange={(v) => setDraft((d) => ({ ...d, description: v }))} placeholder="description" /></div>
                <div className="w-28 px-3 py-2 border-l border-gray-200"><Cell value={draft.category} onChange={(v) => setDraft((d) => ({ ...d, category: v }))} placeholder="category" /></div>
                <div className="w-32 px-3 py-2 border-l border-gray-200"><Cell type="number" value={draft.amount === 0 ? "" : String(draft.amount)} onChange={(v) => setDraft((d) => ({ ...d, amount: parseFloat(v) || 0 }))} placeholder="0.00" className="text-right" /></div>
                <div className="w-32 px-3 py-2 border-l border-gray-200"><Cell type="number" value={draft.amountPaid === 0 ? "" : String(draft.amountPaid)} onChange={(v) => setDraft((d) => ({ ...d, amountPaid: parseFloat(v) || 0 }))} placeholder="0.00" className="text-right" /></div>
                <div className="w-32 px-3 py-2 border-l border-gray-200"><Cell value={draft.paidTo} onChange={(v) => setDraft((d) => ({ ...d, paidTo: v }))} placeholder="vendor / person" /></div>
                <div className="w-32 px-3 py-2 border-l border-gray-200">
                  <PlatformPicker value={draft.platform} platforms={platforms} onChange={(v) => setDraft((d) => ({ ...d, platform: v }))} />
                </div>
                <div className="w-28 px-3 py-2 border-l border-gray-200"><input type="date" value={draft.dueDate ?? ""} onChange={(e) => setDraft((d) => ({ ...d, dueDate: e.target.value || null }))} className="text-[11px] text-gray-600 bg-transparent focus:outline-none w-full" /></div>
                <div className="w-24 px-3 py-2 border-l border-gray-200">
                  <select value={draft.status} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as APStatus }))} className="text-[11px] text-gray-600 bg-transparent focus:outline-none w-full">
                    {Object.keys(AP_STATUS_CFG).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="w-28 border-l border-gray-200" />
                <div className="w-8 flex flex-col items-center justify-center gap-0.5 py-2 border-l border-gray-200">
                  <button onClick={handleAdd} className="h-5 w-5 rounded bg-gray-900 flex items-center justify-center"><Check size={10} className="text-white" /></button>
                  <button onClick={() => setAdding(false)} className="h-5 w-5 rounded hover:bg-gray-100 flex items-center justify-center"><X size={10} className="text-gray-400" /></button>
                </div>
              </div>
            )}
            <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 w-full px-4 py-2.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors lowercase rounded-b-2xl">
              <Plus size={12} /> add payable
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Platforms Tab ───────────────────────────────────────────────── */

function PlatformCard({
  p, onUpdate, onDelete,
}: {
  p: PlatformBalance;
  onUpdate: (id: string, patch: Partial<Pick<Platform, "name" | "color" | "openingBalance">>) => Promise<void>;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(p.name);
  const [color, setColor] = useState(p.color);
  const [openingBalance, setOpeningBalance] = useState(String(p.openingBalance));

  const save = async () => {
    await onUpdate(p.id, {
      name: name.trim() || p.name,
      color,
      openingBalance: parseFloat(openingBalance) || 0,
    });
    setEditing(false);
  };

  const cancel = () => {
    setName(p.name);
    setColor(p.color);
    setOpeningBalance(String(p.openingBalance));
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="bg-white border-2 border-gray-900/10 rounded-2xl p-5 flex flex-col gap-4">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="platform name"
          className="text-sm font-bold text-gray-800 bg-transparent focus:outline-none border-b border-gray-200 pb-1 placeholder:text-gray-300 lowercase"
        />
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">opening balance</p>
          <input
            type="number"
            value={openingBalance}
            onChange={(e) => setOpeningBalance(e.target.value)}
            placeholder="0.00"
            className="text-xl font-black text-gray-800 bg-transparent focus:outline-none border-b border-gray-200 pb-1 placeholder:text-gray-300 w-full"
          />
          <p className="text-[10px] text-gray-400 lowercase">starting amount before any entries</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">color</p>
          <div className="flex flex-wrap gap-2">
            {PLATFORM_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-5 w-5 rounded-full transition-transform ${color === c ? "ring-2 ring-offset-1 ring-gray-400 scale-110" : "hover:scale-110"}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="flex-1 py-1.5 bg-gray-900 text-white rounded-xl text-[11px] font-semibold lowercase">save</button>
          <button onClick={cancel} className="flex-1 py-1.5 bg-gray-100 text-gray-500 rounded-xl text-[11px] font-semibold lowercase hover:bg-gray-200">cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 group relative">
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setEditing(true)} className="h-6 w-6 rounded-lg hover:bg-gray-100 flex items-center justify-center">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
            <path d="M11 2l3 3-9 9H2v-3L11 2z"/>
          </svg>
        </button>
        <button onClick={() => onDelete(p.id)} className="h-6 w-6 rounded-lg hover:bg-red-50 flex items-center justify-center">
          <Trash2 size={11} className="text-red-400" />
        </button>
      </div>
      <div className="flex items-center gap-2.5">
        <span className="h-3.5 w-3.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
        <p className="text-sm font-bold text-gray-900 lowercase">{p.name}</p>
      </div>
      <p className={`text-3xl font-black tracking-tight ${p.balance >= 0 ? "text-gray-900" : "text-red-600"}`}>
        {peso(p.balance)}
      </p>
      {p.openingBalance !== 0 && (
        <p className="text-[10px] text-gray-400 lowercase">opening: {pesoShort(p.openingBalance)}</p>
      )}
      <div className="flex gap-4 text-[11px] text-gray-400">
        <span className="flex items-center gap-1"><TrendingUp size={10} className="text-green-500" />{pesoShort(p.income)}</span>
        <span className="flex items-center gap-1"><TrendingDown size={10} className="text-red-400" />{pesoShort(p.expenses)}</span>
      </div>
    </div>
  );
}

function PlatformsTab({
  platforms, onPlatformsChange,
}: {
  platforms: Platform[];
  onPlatformsChange: (p: Platform[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftColor, setDraftColor] = useState(PLATFORM_COLORS[0]);
  const [draftOpening, setDraftOpening] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [balances, setBalances] = useState<PlatformBalance[]>([]);
  const [loadingBalances, setLoadingBalances] = useState(true);

  const refreshBalances = useCallback(async () => {
    if (platforms.length === 0) { setLoadingBalances(false); return; }
    const pb = await svc.getPlatformBalances();
    setBalances(pb);
    setLoadingBalances(false);
  }, [platforms.length]);

  useEffect(() => { refreshBalances(); }, [refreshBalances]);

  const handleAdd = async () => {
    if (!draftName.trim()) return;
    try {
      const created = await svc.createPlatform({
        name: draftName.trim(),
        color: draftColor,
        openingBalance: parseFloat(draftOpening) || 0,
      });
      onPlatformsChange([...platforms, created]);
      setDraftName(""); setDraftColor(PLATFORM_COLORS[0]); setDraftOpening("");
      setAdding(false);
      const pb = await svc.getPlatformBalances();
      setBalances(pb);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "error"); }
  };

  const handleUpdate = async (id: string, patch: Partial<Pick<Platform, "name" | "color" | "openingBalance">>) => {
    try {
      const updated = await svc.updatePlatform(id, patch);
      onPlatformsChange(platforms.map((p) => p.id === id ? updated : p));
      const pb = await svc.getPlatformBalances();
      setBalances(pb);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "error"); }
  };

  const handleDelete = async (id: string) => {
    try {
      await svc.deletePlatform(id);
      onPlatformsChange(platforms.filter((p) => p.id !== id));
      setBalances((prev) => prev.filter((b) => b.id !== id));
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "error"); }
  };

  const totalBalance = balances.reduce((s, p) => s + p.balance, 0);

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="px-4 py-2 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 flex justify-between">
          {error}<button onClick={() => setError(null)} className="font-semibold">dismiss</button>
        </div>
      )}

      {balances.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPI label="total balance (all platforms)" value={peso(totalBalance)} color={totalBalance >= 0 ? "green" : "red"} />
          <KPI label="total income (all time)" value={peso(balances.reduce((s, p) => s + p.income, 0))} color="gray" />
          <KPI label="total expenses (all time)" value={peso(balances.reduce((s, p) => s + p.expenses, 0))} color="gray" />
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-gray-700 lowercase">platforms</p>
          <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition-colors lowercase">
            <Plus size={11} /> add platform
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {(loadingBalances
            ? platforms.map((p) => ({ ...p, income: 0, expenses: 0, balance: p.openingBalance }))
            : balances
          ).map((p) => (
            <PlatformCard key={p.id} p={p} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}

          {adding && (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-5 flex flex-col gap-4">
              <input
                autoFocus
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="platform name"
                className="text-sm font-semibold text-gray-800 bg-transparent focus:outline-none border-b border-gray-100 pb-1 placeholder:text-gray-300 lowercase"
              />
              <div className="flex flex-col gap-1">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">opening balance</p>
                <input
                  type="number"
                  value={draftOpening}
                  onChange={(e) => setDraftOpening(e.target.value)}
                  placeholder="0.00"
                  className="text-sm text-gray-700 bg-transparent focus:outline-none border-b border-gray-100 pb-1 placeholder:text-gray-300 w-full"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">color</p>
                <div className="flex flex-wrap gap-2">
                  {PLATFORM_COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setDraftColor(c)}
                      className={`h-5 w-5 rounded-full transition-transform ${draftColor === c ? "ring-2 ring-offset-1 ring-gray-400 scale-110" : "hover:scale-110"}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAdd} className="flex-1 py-1.5 bg-gray-900 text-white rounded-xl text-[11px] font-semibold lowercase">save</button>
                <button onClick={() => { setAdding(false); setDraftName(""); setDraftOpening(""); }} className="flex-1 py-1.5 bg-gray-100 text-gray-500 rounded-xl text-[11px] font-semibold lowercase hover:bg-gray-200">cancel</button>
              </div>
            </div>
          )}
        </div>

        {platforms.length === 0 && !adding && (
          <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-dashed border-gray-200 text-xs text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors w-full lowercase">
            <Plus size={13} /> add your first platform (e.g. GCash, Bank, PayPal)
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Main ────────────────────────────────────────────────────────── */

type MoneyTab = "dashboard" | "monthly" | "receivables" | "payables" | "platforms";

export function MoneyManagement() {
  const [tab, setTab] = useState<MoneyTab>("dashboard");
  const [platforms, setPlatforms] = useState<Platform[]>([]);

  useEffect(() => {
    svc.getPlatforms().then(setPlatforms).catch(() => {});
  }, []);

  const tabs: { id: MoneyTab; label: string }[] = [
    { id: "dashboard",   label: "dashboard" },
    { id: "monthly",     label: "monthly tracker" },
    { id: "receivables", label: "receivables" },
    { id: "payables",    label: "payables" },
    { id: "platforms",   label: "platforms" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1.5 w-fit overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold lowercase transition-colors whitespace-nowrap ${tab === t.id ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "dashboard"   && <Dashboard />}
      {tab === "monthly"     && <MonthlyTracker platforms={platforms} />}
      {tab === "receivables" && <ReceivablesTab platforms={platforms} />}
      {tab === "payables"    && <PayablesTab platforms={platforms} />}
      {tab === "platforms"   && <PlatformsTab platforms={platforms} onPlatformsChange={setPlatforms} />}
    </div>
  );
}
