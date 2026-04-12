"use client";

import { useEffect, useState, useRef } from "react";
import * as svc from "@/lib/task-service";
import type { TaskProject, TaskTable, Task, TaskStatus, TaskPriority } from "@/lib/task-service";
import {
  Plus, Trash2, ChevronDown, ChevronRight, Calendar, Tag, Briefcase,
  X, Check, AlertCircle, Clock, Circle, CheckCircle2,
  XCircle, Pencil, ArrowUpRight, GripVertical,
} from "lucide-react";

/* ─── Constants ──────────────────────────────────────────────────── */

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; icon: React.ReactNode }> = {
  todo:        { label: "to do",       color: "bg-gray-100 text-gray-600",   icon: <Circle size={11} /> },
  in_progress: { label: "in progress", color: "bg-blue-50 text-blue-600",    icon: <Clock size={11} /> },
  in_review:   { label: "in review",   color: "bg-purple-50 text-purple-600",icon: <AlertCircle size={11} /> },
  done:        { label: "done",        color: "bg-green-50 text-green-600",  icon: <CheckCircle2 size={11} /> },
  cancelled:   { label: "cancelled",   color: "bg-red-50 text-red-400",      icon: <XCircle size={11} /> },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; dot: string }> = {
  low:    { label: "low",    dot: "bg-gray-300" },
  medium: { label: "medium", dot: "bg-yellow-400" },
  high:   { label: "high",   dot: "bg-orange-400" },
  urgent: { label: "urgent", dot: "bg-red-500" },
};

const PROJECT_COLORS = [
  "#1a1a1a", "#2563eb", "#7c3aed", "#dc2626", "#d97706",
  "#059669", "#0891b2", "#db2777", "#65a30d", "#ea580c",
];

const PROJECT_ICON_IDS = [
  "folder", "rocket", "bulb", "bolt", "target",
  "wrench", "chart", "pen", "search", "globe",
] as const;
type ProjectIconId = typeof PROJECT_ICON_IDS[number];

function ProjectIcon({ id, size = 16 }: { id: string; size?: number }) {
  const s = size;
  const icons: Record<string, React.ReactNode> = {
    folder: (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 4.5C1 3.67 1.67 3 2.5 3H6l1.5 2H13.5C14.33 5 15 5.67 15 6.5V12A1.5 1.5 0 0113.5 13.5H2.5A1.5 1.5 0 011 12V4.5z"/>
      </svg>
    ),
    rocket: (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 1s4 1.5 4 6.5L9.5 10H6.5L4 7.5C4 2.5 8 1 8 1z"/>
        <path d="M6.5 10l-2 3 2-1 1.5 1.5L9.5 10"/>
        <circle cx="8" cy="6" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
    bulb: (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2a4 4 0 013 6.65V10H5v-1.35A4 4 0 018 2z"/>
        <path d="M6 10h4v1.5a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5V10z"/>
        <path d="M7 12.5v1M9 12.5v1"/>
      </svg>
    ),
    bolt: (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 1.5L4 9h5l-2 5.5L14 7H9L9 1.5z"/>
      </svg>
    ),
    target: (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <circle cx="8" cy="8" r="6"/>
        <circle cx="8" cy="8" r="3"/>
        <circle cx="8" cy="8" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
    wrench: (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 2a3 3 0 00-2.83 4L3 11.17A1.5 1.5 0 105.17 13L10.17 8A3 3 0 0011 2z"/>
      </svg>
    ),
    chart: (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 13V9M6 13V6M10 13V3M14 13V7"/>
        <path d="M1 13h14"/>
      </svg>
    ),
    pen: (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 2.5l2.5 2.5L5 13.5H2.5V11L11 2.5z"/>
        <path d="M9 4.5l2.5 2.5"/>
      </svg>
    ),
    search: (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <circle cx="6.5" cy="6.5" r="4"/>
        <path d="M10 10l3.5 3.5"/>
      </svg>
    ),
    globe: (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <circle cx="8" cy="8" r="6"/>
        <path d="M8 2c-2 2-2 8 0 12M8 2c2 2 2 8 0 12"/>
        <path d="M2.5 6h11M2.5 10h11"/>
      </svg>
    ),
  };
  return <>{icons[id] ?? icons["folder"]}</>;
}

/* ─── Helpers ────────────────────────────────────────────────────── */

function formatDeadline(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isOverdue(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso) < new Date();
}

function googleCalendarUrl(task: Task): string {
  if (!task.deadline) return "";
  const start = new Date(task.deadline);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const details = [
    task.assignee ? `Client: ${task.assignee}` : "",
    task.description || task.notes || "",
  ].filter(Boolean).join("\n\n");
  const params = new URLSearchParams({
    text: task.title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details,
  });
  return `https://calendar.google.com/calendar/r/eventedit?${params}`;
}

/* ─── Sub-components ─────────────────────────────────────────────── */

function StatusBadge({ status, onClick }: { status: TaskStatus; onClick?: () => void }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold lowercase whitespace-nowrap shrink-0 ${cfg.color} ${onClick ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
    >
      {cfg.icon}
      {cfg.label}
    </button>
  );
}

function PriorityDot({ priority }: { priority: TaskPriority }) {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <span title={cfg.label} className={`inline-block h-2 w-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
  );
}

function StatusPicker({ value, onChange }: { value: TaskStatus; onChange: (s: TaskStatus) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <StatusBadge status={value} onClick={() => setOpen((o) => !o)} />
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-100 rounded-xl shadow-lg p-1 flex flex-col gap-0.5 min-w-[140px]">
          {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => { onChange(s); setOpen(false); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium lowercase hover:bg-gray-50 text-left ${value === s ? "bg-gray-50" : ""}`}
            >
              {STATUS_CONFIG[s].icon}
              {STATUS_CONFIG[s].label}
              {value === s && <Check size={11} className="ml-auto text-gray-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PriorityPicker({ value, onChange }: { value: TaskPriority; onChange: (p: TaskPriority) => void }) {
  const [open, setOpen] = useState(false);
  const cfg = PRIORITY_CONFIG[value];
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 lowercase"
      >
        <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
        {cfg.label}
        <ChevronDown size={11} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-100 rounded-xl shadow-lg p-1 flex flex-col gap-0.5 min-w-[120px]">
          {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((p) => (
            <button
              key={p}
              onClick={() => { onChange(p); setOpen(false); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium lowercase hover:bg-gray-50 ${value === p ? "bg-gray-50" : ""}`}
            >
              <span className={`h-2 w-2 rounded-full ${PRIORITY_CONFIG[p].dot}`} />
              {PRIORITY_CONFIG[p].label}
              {value === p && <Check size={11} className="ml-auto text-gray-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Task Detail Modal ───────────────────────────────────────────── */

function TaskModal({
  task,
  onClose,
  onSave,
  onDelete,
}: {
  task: Task;
  onClose: () => void;
  onSave: (updated: Task) => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState<Task>(task);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (!t || draft.tags.includes(t)) return;
    setDraft((d) => ({ ...d, tags: [...d.tags, t] }));
    setTagInput("");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await svc.updateTask(draft.id, {
        title: draft.title,
        description: draft.description,
        status: draft.status,
        priority: draft.priority,
        deadline: draft.deadline,
        tags: draft.tags,
        assignee: draft.assignee,
        notes: draft.notes,
      });
      onSave(updated);
    } finally {
      setSaving(false);
    }
  };

  const deadlineInputValue = (() => {
    if (!draft.deadline) return "";
    const d = new Date(draft.deadline);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  })();

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/20" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-lg bg-white border-l border-gray-100 flex flex-col h-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <StatusPicker
              value={draft.status}
              onChange={(s) => setDraft((d) => ({ ...d, status: s }))}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { if (confirm("delete this task?")) onDelete(task.id); }}
              className="h-8 w-8 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors group"
            >
              <Trash2 size={14} className="text-gray-400 group-hover:text-red-500" />
            </button>
            <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
              <X size={16} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
          {/* Title */}
          <textarea
            ref={titleRef}
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            placeholder="task title"
            rows={2}
            className="w-full text-xl font-bold text-gray-900 resize-none focus:outline-none placeholder:text-gray-300 lowercase"
          />

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">priority</span>
              <PriorityPicker
                value={draft.priority}
                onChange={(p) => setDraft((d) => ({ ...d, priority: p }))}
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Fields grid */}
          <div className="flex flex-col gap-4">
            {/* Deadline */}
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-1.5 w-28 shrink-0 pt-0.5">
                <Calendar size={13} className="text-gray-400" />
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">deadline</span>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="datetime-local"
                  value={deadlineInputValue}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      deadline: e.target.value ? new Date(e.target.value).toISOString() : null,
                    }))
                  }
                  className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                />
                {draft.deadline && (
                  <a
                    href={googleCalendarUrl(draft)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-700 font-medium transition-colors"
                    title="add to google calendar"
                  >
                    <ArrowUpRight size={13} />
                    gcal
                  </a>
                )}
              </div>
            </div>

            {/* Client */}
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-1.5 w-28 shrink-0 pt-0.5">
                <Briefcase size={13} className="text-gray-400" />
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">client</span>
              </div>
              <input
                value={draft.assignee}
                onChange={(e) => setDraft((d) => ({ ...d, assignee: e.target.value }))}
                placeholder="client name or company"
                className="flex-1 text-sm text-gray-700 bg-transparent border-b border-gray-100 focus:outline-none focus:border-gray-400 pb-0.5 lowercase placeholder:text-gray-300 transition-colors"
              />
            </div>

            {/* Tags */}
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-1.5 w-28 shrink-0 pt-0.5">
                <Tag size={13} className="text-gray-400" />
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">tags</span>
              </div>
              <div className="flex-1 flex flex-wrap gap-1.5">
                {draft.tags.map((t) => (
                  <button
                    key={t}
                    onClick={() => setDraft((d) => ({ ...d, tags: d.tags.filter((x) => x !== t) }))}
                    className="flex items-center gap-1 text-[10px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors lowercase"
                  >
                    {t} <X size={9} />
                  </button>
                ))}
                <input
                  value={tagInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.endsWith(",")) {
                      setTagInput(val.slice(0, -1));
                      setTimeout(addTag, 0);
                    } else {
                      setTagInput(val);
                    }
                  }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  onBlur={addTag}
                  placeholder="type + enter"
                  className="text-[11px] text-gray-500 bg-transparent focus:outline-none w-24 placeholder:text-gray-300 lowercase"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">description</label>
            <textarea
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              placeholder="what needs to be done?"
              rows={3}
              className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all lowercase placeholder:text-gray-300"
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">notes</label>
            <textarea
              value={draft.notes}
              onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
              placeholder="additional context, links, thoughts..."
              rows={5}
              className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all lowercase placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[10px] text-gray-400 lowercase">
            updated {new Date(task.updatedAt).toLocaleDateString()}
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl lowercase transition-colors"
          >
            <Check size={13} />
            {saving ? "saving…" : "save"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Task Row ────────────────────────────────────────────────────── */

function TaskRow({
  task, onClick, onDragStart, onDragEnter, onDragEnd, onDrop, isDragOver,
}: {
  task: Task;
  onClick: () => void;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
  onDrop: () => void;
  isDragOver: boolean;
}) {
  const overdue = isOverdue(task.deadline) && task.status !== "done" && task.status !== "cancelled";
  const struck = task.status === "done" || task.status === "cancelled";

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragEnd={onDragEnd}
      onDrop={(e) => { e.preventDefault(); onDrop(); }}
      onDragOver={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex items-center gap-0 cursor-pointer border-b border-gray-50 transition-colors group ${isDragOver ? "bg-blue-50/50 border-b-blue-200" : "hover:bg-gray-50"}`}
    >
      {/* Drag handle */}
      <div className="pl-2 pr-1 py-2.5 flex items-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
        <GripVertical size={13} className="text-gray-300" />
      </div>

      {/* Priority + Title */}
      <div className="flex items-center gap-2.5 px-2 py-2.5 flex-1 min-w-0">
        <PriorityDot priority={task.priority} />
        <p className={`text-sm font-medium lowercase truncate ${struck ? "line-through text-gray-400" : "text-gray-800"}`}>
          {task.title}
        </p>
      </div>

      {/* Client */}
      <div className="w-32 px-3 py-2.5 flex-shrink-0 border-l border-gray-50">
        <p className="text-[11px] text-gray-500 lowercase truncate">{task.assignee || <span className="text-gray-300">—</span>}</p>
      </div>

      {/* Tags */}
      <div className="w-44 px-3 py-2.5 flex-shrink-0 border-l border-gray-50">
        <div className="flex flex-wrap gap-1">
          {task.tags.length > 0
            ? task.tags.slice(0, 3).map((t) => (
                <span key={t} className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full lowercase">{t}</span>
              ))
            : <span className="text-[11px] text-gray-300">—</span>
          }
        </div>
      </div>

      {/* Deadline */}
      <div className="w-36 px-3 py-2.5 flex-shrink-0 border-l border-gray-50">
        {task.deadline ? (
          <span className={`text-[11px] font-medium flex items-center gap-1 ${overdue ? "text-red-500" : "text-gray-500"}`}>
            <Calendar size={10} />
            {formatDeadline(task.deadline)}
          </span>
        ) : (
          <span className="text-[11px] text-gray-300">—</span>
        )}
      </div>

      {/* Status */}
      <div className="w-32 px-3 py-2.5 flex-shrink-0 border-l border-gray-50">
        <StatusBadge status={task.status} />
      </div>

      {/* Open arrow */}
      <div className="w-8 flex items-center justify-center py-2.5 border-l border-gray-50">
        <ArrowUpRight size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

/* ─── Table Section ───────────────────────────────────────────────── */

function TableSection({
  table,
  onRename,
  onDelete,
  onTaskCreated,
  onTaskClick,
  onTaskUpdate,
  onTaskDelete,
}: {
  table: TaskTable;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onTaskCreated: (tableId: string, task: Task) => void;
  onTaskClick: (task: Task) => void;
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTask, setAddingTask] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(table.name);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const dragIndex = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    svc.getTasksForTable(table.id).then((t) => { setTasks(t); setLoading(false); });
  }, [table.id]);

  const handleAddTask = async () => {
    if (!newTitle.trim()) return;
    const task = await svc.createTask(table.id, newTitle.trim());
    setTasks((prev) => [...prev, task]);
    onTaskCreated(table.id, task);
    setNewTitle("");
    setAddingTask(false);
  };

  const handleTaskSave = (updated: Task) => {
    setTasks((prev) => prev.map((t) => t.id === updated.id ? updated : t));
    onTaskUpdate(updated);
    setSelectedTask(null);
  };

  const handleTaskDelete = async (id: string) => {
    await svc.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    onTaskDelete(id);
    setSelectedTask(null);
  };

  const handleRenameBlur = () => {
    if (nameVal.trim() && nameVal !== table.name) {
      onRename(table.id, nameVal.trim());
    }
    setEditingName(false);
  };

  const handleDragEnd = async () => {
    if (dragIndex.current === null || dragOverIndex === null || dragIndex.current === dragOverIndex) {
      dragIndex.current = null;
      setDragOverIndex(null);
      return;
    }
    const reordered = [...tasks];
    const [moved] = reordered.splice(dragIndex.current, 1);
    reordered.splice(dragOverIndex, 0, moved);
    setTasks(reordered);
    dragIndex.current = null;
    setDragOverIndex(null);
    await svc.reorderTasks(reordered.map((t) => t.id));
  };

  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <>
      <div className="mb-4">
        {/* Table header */}
        <div className="flex items-center gap-2 mb-1 group/header">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
          </button>

          {editingName ? (
            <input
              autoFocus
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              onBlur={handleRenameBlur}
              onKeyDown={(e) => { if (e.key === "Enter") handleRenameBlur(); if (e.key === "Escape") setEditingName(false); }}
              className="text-sm font-bold text-gray-900 lowercase bg-transparent border-b border-gray-900 focus:outline-none flex-1 max-w-[200px]"
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="flex items-center gap-1.5 group/name"
            >
              <span className="text-sm font-bold text-gray-900 lowercase">{table.name}</span>
              <Pencil size={11} className="text-gray-300 opacity-0 group-hover/name:opacity-100 transition-opacity" />
            </button>
          )}

          <span className="text-[10px] text-gray-400 font-medium">
            {doneCount}/{tasks.length}
          </span>

          <div className="ml-auto flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition-opacity">
            <button
              onClick={() => setAddingTask(true)}
              className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors lowercase"
            >
              <Plus size={11} /> task
            </button>
            <button
              onClick={() => { if (confirm(`delete "${table.name}" and all its tasks?`)) onDelete(table.id); }}
              className="h-6 w-6 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors group/del"
            >
              <Trash2 size={11} className="text-gray-300 group-hover/del:text-red-400" />
            </button>
          </div>
        </div>

        {/* Column headers */}
        {!collapsed && (
          <div className="flex items-center border-b border-gray-100 bg-gray-50/50">
            <span className="flex-1 px-4 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">task</span>
            <span className="w-32 px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest border-l border-gray-100">client</span>
            <span className="w-44 px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest border-l border-gray-100">tags</span>
            <span className="w-36 px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest border-l border-gray-100">deadline</span>
            <span className="w-32 px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest border-l border-gray-100">status</span>
            <span className="w-8 border-l border-gray-100" />
          </div>
        )}

        {!collapsed && (
          <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-12">
                <div className="h-4 w-4 rounded-full border-2 border-gray-200 border-t-gray-600 animate-spin" />
              </div>
            ) : tasks.length === 0 && !addingTask ? (
              <div
                onClick={() => setAddingTask(true)}
                className="px-4 py-4 text-center text-xs text-gray-300 hover:text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors lowercase w-full"
              >
                + add first task
              </div>
            ) : (
              <>
                {tasks.map((task, i) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onClick={() => setSelectedTask(task)}
                    onDragStart={() => { dragIndex.current = i; }}
                    onDragEnter={() => setDragOverIndex(i)}
                    onDragEnd={handleDragEnd}
                    onDrop={handleDragEnd}
                    isDragOver={dragOverIndex === i && dragIndex.current !== i}
                  />
                ))}

                {addingTask ? (
                  <div className="flex items-center gap-2 px-4 py-2.5 border-t border-gray-50">
                    <PriorityDot priority="medium" />
                    <input
                      autoFocus
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddTask();
                        if (e.key === "Escape") { setAddingTask(false); setNewTitle(""); }
                      }}
                      placeholder="task name…"
                      className="flex-1 text-sm text-gray-800 bg-transparent focus:outline-none lowercase placeholder:text-gray-300"
                    />
                    <button onClick={handleAddTask} className="text-[11px] font-semibold text-white bg-gray-900 px-3 py-1 rounded-lg lowercase">add</button>
                    <button onClick={() => { setAddingTask(false); setNewTitle(""); }} className="text-[11px] text-gray-400 px-2 py-1 rounded-lg hover:bg-gray-100 lowercase">cancel</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingTask(true)}
                    className="flex items-center gap-1.5 w-full px-4 py-2 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors border-t border-gray-50 lowercase"
                  >
                    <Plus size={12} /> add task
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Task modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={handleTaskSave}
          onDelete={handleTaskDelete}
        />
      )}
    </>
  );
}

/* ─── New Project Modal ───────────────────────────────────────────── */

function NewProjectModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (p: TaskProject) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [icon, setIcon] = useState<string>(PROJECT_ICON_IDS[0]);
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const p = await svc.createProject({ name: name.trim(), description, color, icon });
      onCreate(p);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 w-full max-w-md shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 lowercase">new project</h3>
          <button onClick={onClose} className="h-7 w-7 rounded-lg hover:bg-gray-100 flex items-center justify-center">
            <X size={14} className="text-gray-400" />
          </button>
        </div>

        {/* Icon picker */}
        <div>
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 block">icon</label>
          <div className="flex flex-wrap gap-1.5">
            {PROJECT_ICON_IDS.map((id) => (
              <button
                key={id}
                onClick={() => setIcon(id)}
                className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${icon === id ? "bg-gray-900 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}
              >
                <ProjectIcon id={id} size={15} />
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div>
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 block">color</label>
          <div className="flex flex-wrap gap-1.5">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`h-6 w-6 rounded-full transition-transform ${color === c ? "scale-125 ring-2 ring-offset-1 ring-gray-400" : ""}`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">name</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="project name"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all lowercase"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">description (optional)</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="what is this project about?"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all lowercase"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="text-sm text-gray-500 px-4 py-2 rounded-xl hover:bg-gray-100 lowercase">cancel</button>
          <button
            onClick={handleCreate}
            disabled={saving || !name.trim()}
            className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl lowercase transition-colors"
          >
            <Plus size={13} />
            {saving ? "creating…" : "create"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */

export function TaskManagement() {
  const [projects, setProjects] = useState<TaskProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [tables, setTables] = useState<TaskTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingProject, setAddingProject] = useState(false);
  const [addingTable, setAddingTable] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) ?? null;

  useEffect(() => {
    svc.getProjects()
      .then((ps) => {
        setProjects(ps);
        if (ps.length > 0) setSelectedProjectId(ps[0].id);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedProjectId) { setTables([]); return; }
    svc.getTablesForProject(selectedProjectId)
      .then(setTables)
      .catch((e) => setError(e.message));
  }, [selectedProjectId]);

  const handleAddTable = async () => {
    if (!newTableName.trim() || !selectedProjectId) return;
    try {
      const table = await svc.createTable(selectedProjectId, newTableName.trim());
      setTables((prev) => [...prev, table]);
      setNewTableName("");
      setAddingTable(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "error");
    }
  };

  const handleRenameTable = async (id: string, name: string) => {
    try {
      const updated = await svc.updateTable(id, name);
      setTables((prev) => prev.map((t) => t.id === id ? updated : t));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "error");
    }
  };

  const handleDeleteTable = async (id: string) => {
    try {
      await svc.deleteTable(id);
      setTables((prev) => prev.filter((t) => t.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "error");
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("delete this project and all its tables/tasks?")) return;
    try {
      await svc.deleteProject(id);
      const remaining = projects.filter((p) => p.id !== id);
      setProjects(remaining);
      setSelectedProjectId(remaining[0]?.id ?? null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-6 w-6 rounded-full border-2 border-gray-200 border-t-gray-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-112px)] bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* ── Sidebar ── */}
      <div className="w-56 flex-shrink-0 border-r border-gray-100 bg-gray-50 flex flex-col">
        <div className="px-3 pt-4 pb-2">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-2">projects</p>
        </div>

        <div className="flex-1 overflow-y-auto px-2 flex flex-col gap-0.5">
          {projects.map((p) => (
            <div key={p.id} className="group/proj relative">
              <button
                onClick={() => setSelectedProjectId(p.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                  selectedProjectId === p.id
                    ? "bg-white shadow-sm border border-gray-100"
                    : "hover:bg-white/60"
                }`}
              >
                <span className="text-gray-600 flex-shrink-0"><ProjectIcon id={p.icon} size={14} /></span>
                <span className="flex-1 text-xs font-semibold text-gray-800 lowercase truncate">{p.name}</span>
                <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
              </button>
              <button
                onClick={() => handleDeleteProject(p.id)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded-md bg-white border border-gray-100 flex items-center justify-center opacity-0 group-hover/proj:opacity-100 transition-opacity hover:bg-red-50"
              >
                <Trash2 size={9} className="text-gray-400 hover:text-red-400" />
              </button>
            </div>
          ))}
        </div>

        <div className="p-2 border-t border-gray-100">
          <button
            onClick={() => setAddingProject(true)}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-white/60 transition-colors lowercase"
          >
            <Plus size={13} /> new project
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedProject ? (
          <>
            {/* Project header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <span className="text-gray-700"><ProjectIcon id={selectedProject.icon} size={22} /></span>
              <div>
                <h2 className="text-base font-bold text-gray-900 lowercase">{selectedProject.name}</h2>
                {selectedProject.description && (
                  <p className="text-xs text-gray-400 lowercase">{selectedProject.description}</p>
                )}
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mx-6 mt-4 px-4 py-2 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 lowercase flex justify-between">
                {error}
                <button onClick={() => setError(null)} className="font-semibold">dismiss</button>
              </div>
            )}

            {/* Tables */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {tables.length === 0 && !addingTable ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <span className="text-gray-200"><ProjectIcon id="folder" size={32} /></span>
                  <p className="text-sm text-gray-400 lowercase">no tables yet — add one to start tracking tasks</p>
                  <button
                    onClick={() => setAddingTable(true)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl lowercase transition-colors"
                  >
                    <Plus size={14} /> add table
                  </button>
                </div>
              ) : (
                <>
                  {tables.map((table) => (
                    <TableSection
                      key={table.id}
                      table={table}
                      onRename={handleRenameTable}
                      onDelete={handleDeleteTable}
                      onTaskCreated={() => {}}
                      onTaskClick={() => {}}
                      onTaskUpdate={() => {}}
                      onTaskDelete={() => {}}
                    />
                  ))}

                  {addingTable ? (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        autoFocus
                        value={newTableName}
                        onChange={(e) => setNewTableName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddTable();
                          if (e.key === "Escape") { setAddingTable(false); setNewTableName(""); }
                        }}
                        placeholder="table name…"
                        className="flex-1 rounded-xl border border-gray-900 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none lowercase max-w-xs"
                      />
                      <button onClick={handleAddTable} className="text-sm font-semibold text-white bg-gray-900 px-4 py-2 rounded-xl lowercase">add</button>
                      <button onClick={() => { setAddingTable(false); setNewTableName(""); }} className="text-sm text-gray-400 px-3 py-2 rounded-xl hover:bg-gray-100 lowercase">cancel</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingTable(true)}
                      className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-700 mt-2 lowercase transition-colors"
                    >
                      <Plus size={14} /> add table
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <span className="text-gray-200"><ProjectIcon id="folder" size={40} /></span>
            <p className="text-sm text-gray-400 lowercase">create a project to get started</p>
            <button
              onClick={() => setAddingProject(true)}
              className="flex items-center gap-1.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-700 px-4 py-2 rounded-xl lowercase transition-colors"
            >
              <Plus size={14} /> new project
            </button>
          </div>
        )}
      </div>

      {/* New project modal */}
      {addingProject && (
        <NewProjectModal
          onClose={() => setAddingProject(false)}
          onCreate={(p) => {
            setProjects((prev) => [...prev, p]);
            setSelectedProjectId(p.id);
            setAddingProject(false);
          }}
        />
      )}
    </div>
  );
}
