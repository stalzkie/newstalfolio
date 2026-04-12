"use client";

import { useEffect, useState } from "react";
import { Check, Mail, FileText, Video, AlertTriangle, TrendingUp, Layers } from "lucide-react";

/* ─── Shared primitives ───────────────────────────────────────────────── */

function Outer({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div className={`w-full aspect-[16/10] rounded-2xl overflow-hidden relative flex items-center justify-center p-5 sm:p-6 ${color}`}>
      {children}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-[300px] p-4 flex flex-col gap-3 relative overflow-hidden">
      {children}
    </div>
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold lowercase ${color}`}>
      {text}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */
/*  PM 1 · Team Workload                                                    */
/* ──────────────────────────────────────────────────────────────────────── */

export function PMTeamAnim() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const delays = [2500, 2200, 1800, 2500];
    let p = 0;
    let t: ReturnType<typeof setTimeout>;
    const next = () => {
      p = (p + 1) % 4;
      setPhase(p);
      t = setTimeout(next, delays[p]);
    };
    t = setTimeout(next, delays[0]);
    return () => clearTimeout(t);
  }, []);

  const people = [
    { init: "A", name: "alice", load: 62 },
    { init: "B", name: "ben",   load: 88 },
    { init: "K", name: "kim",   load: 54 },
  ];

  return (
    <Outer color="bg-gradient-to-br from-blue-50 via-indigo-50/40 to-blue-50">
      <div className="absolute top-3 left-5 h-2 w-2 rounded-full bg-blue-200/60" />
      <div className="absolute bottom-5 right-6 h-1.5 w-1.5 rounded-full bg-indigo-200/60" />
      <div className="absolute top-7 right-10 h-1 w-1 rounded-full bg-blue-300/40" />

      <Card>
        {/* header */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-gray-700 lowercase">team capacity</span>
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold transition-all duration-500 ${
            phase === 3 ? "bg-green-100 text-green-700" :
            phase === 0 ? "bg-blue-50 text-blue-500" :
            "bg-red-50 text-red-500"
          }`}>
            {phase === 3 ? "✓ all clear" : phase === 0 ? "monitoring" : "1 blocked"}
          </span>
        </div>

        {/* rows */}
        {people.map((p, i) => {
          const isTarget = i === 1;
          const rowPhase = isTarget ? phase : 0;
          const barColor =
            rowPhase === 1 ? "bg-red-400" :
            rowPhase === 2 ? "bg-amber-400" :
            rowPhase === 3 ? "bg-green-400" :
            p.load > 75 ? "bg-blue-400" : "bg-blue-300";
          const avatarColor =
            rowPhase === 1 ? "bg-red-400" :
            rowPhase === 2 ? "bg-amber-400" :
            rowPhase === 3 ? "bg-green-500" :
            "bg-blue-400";
          const barWidth = rowPhase === 3 ? 60 : p.load;

          return (
            <div key={p.name} className="flex items-center gap-2">
              <div className={`h-6 w-6 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-black text-white transition-colors duration-500 ${avatarColor}`}>
                {p.init}
              </div>
              <span className="text-[10px] text-gray-500 w-7 flex-shrink-0 lowercase">{p.name}</span>
              <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <div className="w-14 flex justify-end flex-shrink-0">
                {isTarget && rowPhase === 1 && <Badge text="blocked" color="bg-red-100 text-red-600 animate-pulse" />}
                {isTarget && rowPhase === 2 && <Badge text="ai fix" color="bg-amber-100 text-amber-700" />}
                {isTarget && rowPhase === 3 && <Badge text="✓ clear" color="bg-green-100 text-green-700" />}
                {(!isTarget || rowPhase === 0) && (
                  <span className="text-[9px] text-gray-300">{p.load}%</span>
                )}
              </div>
            </div>
          );
        })}

        {/* footer pulse */}
        <div className="flex items-center gap-1.5 pt-1 border-t border-gray-50">
          <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 transition-colors duration-500 ${
            phase === 3 ? "bg-green-400" : "bg-blue-400 animate-pulse"
          }`} />
          <p className="text-[10px] text-gray-400 lowercase truncate">
            {phase === 0 ? "ai monitoring capacity in real time" :
             phase === 1 ? "blocker detected · flagging team" :
             phase === 2 ? "reassigning workload…" :
             "resolved · all members unblocked"}
          </p>
        </div>
      </Card>
    </Outer>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */
/*  PM 2 · Milestone Tracker                                                */
/* ──────────────────────────────────────────────────────────────────────── */

export function PMMilestoneAnim() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPhase(p => (p + 1) % 6), 1300);
    return () => clearInterval(t);
  }, []);

  const milestones = ["kickoff", "design", "build", "launch"];
  const progress = Math.min(Math.round((phase / 5) * 78), 78);

  return (
    <Outer color="bg-gradient-to-br from-sky-50 via-blue-50/30 to-indigo-50">
      <div className="absolute top-4 right-8 h-2 w-2 rounded-full bg-sky-200/60" />
      <div className="absolute bottom-4 left-6 h-1.5 w-1.5 rounded-full bg-indigo-200/60" />

      <Card>
        {/* header */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-gray-700 lowercase">delivery milestones</span>
          {phase >= 5 && (
            <Badge text="on track ✓" color="bg-green-100 text-green-700 animate-pulse" />
          )}
        </div>

        {/* milestone dots + connectors */}
        <div className="flex items-center py-1">
          {milestones.map((m, i) => {
            const done = i < phase;
            const active = i === phase && phase < milestones.length;
            return (
              <div key={m} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                    done     ? "bg-blue-500 border-blue-500" :
                    active   ? "border-blue-400 bg-blue-50 animate-pulse" :
                    "border-gray-200 bg-white"
                  }`}>
                    {done   && <Check size={10} className="text-white" strokeWidth={3} />}
                    {active && <div className="h-2 w-2 rounded-full bg-blue-400" />}
                  </div>
                  <span className={`text-[8px] lowercase font-medium transition-colors duration-500 ${
                    done ? "text-blue-500" : active ? "text-blue-400" : "text-gray-300"
                  }`}>
                    {m}
                  </span>
                </div>
                {i < milestones.length - 1 && (
                  <div className="flex-1 h-0.5 mx-1 mb-4 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full transition-all duration-700"
                      style={{ width: i < phase - 1 ? "100%" : i === phase - 1 ? "55%" : "0%" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* progress bar */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <span className="text-[10px] text-gray-400 lowercase">overall progress</span>
            <span className="text-[10px] font-bold text-blue-500">{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-400 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* status */}
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
          <p className="text-[10px] text-gray-400 lowercase">
            {phase < 4 ? "sprint in progress · 2 weeks to launch" : "entering final sprint · on schedule"}
          </p>
        </div>
      </Card>
    </Outer>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */
/*  PM 3 · Stakeholder Report                                               */
/* ──────────────────────────────────────────────────────────────────────── */

export function PMStakeholderAnim() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPhase(p => (p + 1) % 6), 1400);
    return () => clearInterval(t);
  }, []);

  const items = [
    { label: "revenue",   value: "↑ +18% this week", bg: "bg-green-50",  text: "text-green-700" },
    { label: "sprint",    value: "✓ delivered on time", bg: "bg-blue-50",   text: "text-blue-700"  },
    { label: "open risk", value: "1 flagged · low",  bg: "bg-amber-50",  text: "text-amber-700" },
  ];

  const avatarColors = ["bg-blue-300", "bg-violet-300", "bg-green-300"];

  return (
    <Outer color="bg-gradient-to-br from-violet-50 via-indigo-50/30 to-blue-50">
      <div className="absolute top-4 left-6 h-1.5 w-1.5 rounded-full bg-violet-200/60" />
      <div className="absolute bottom-5 right-7 h-2 w-2 rounded-full bg-blue-200/60" />
      <div className="absolute top-6 right-12 h-1 w-1 rounded-full bg-indigo-300/40" />

      <Card>
        {/* header */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-gray-700 lowercase">weekly report</span>
          <span className="text-[9px] text-gray-400 lowercase">apr 12</span>
        </div>

        {/* status rows */}
        {items.map((item, i) => (
          <div
            key={item.label}
            className={`flex items-center justify-between rounded-xl px-3 py-2 transition-all duration-500 ${
              phase > i ? item.bg : "bg-gray-50"
            }`}
          >
            <span className="text-[10px] text-gray-600 lowercase font-medium">{item.label}</span>
            <span className={`text-[10px] font-bold transition-all duration-300 ${
              phase > i ? item.text : "text-gray-300"
            }`}>
              {phase > i ? item.value : "···"}
            </span>
          </div>
        ))}

        {/* send footer */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-50">
          <div className="flex -space-x-1">
            {avatarColors.map((c, i) => (
              <div
                key={i}
                className={`h-5 w-5 rounded-full border-2 border-white transition-all duration-500 ${c}`}
                style={{ opacity: phase >= i + 4 ? 1 : 0.2, transform: phase >= i + 4 ? "scale(1)" : "scale(0.85)" }}
              />
            ))}
          </div>
          <span className={`text-[9px] font-bold transition-all duration-500 ${
            phase >= 5 ? "text-green-600" : "text-gray-300"
          }`}>
            {phase >= 5 ? "✓ sent to 3 stakeholders" : "preparing digest…"}
          </span>
        </div>
      </Card>
    </Outer>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */
/*  Content 1 · YouTube Script                                              */
/* ──────────────────────────────────────────────────────────────────────── */

export function ContentScriptAnim() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPhase(p => (p + 1) % 5), 1500);
    return () => clearInterval(t);
  }, []);

  const retentions = [0, 72, 79, 85, 87];
  const ret = retentions[Math.min(phase, 4)];

  const sections = [
    { tag: "HOOK", line: "you're losing half your team to burnout —", accent: "border-red-200 bg-red-50/50" },
    { tag: "BODY", line: "here's the ai system that fixes it in 2 weeks", accent: "border-gray-100 bg-gray-50/50" },
    { tag: "CTA",  line: "download the free template below",             accent: "border-gray-100 bg-gray-50/50" },
  ];

  return (
    <Outer color="bg-gradient-to-br from-rose-50 via-red-50/30 to-orange-50/20">
      <div className="absolute top-4 right-8 h-2 w-2 rounded-full bg-rose-200/60" />
      <div className="absolute bottom-4 left-6 h-1.5 w-1.5 rounded-full bg-red-200/50" />

      {/* Tighter card: p-3 + gap-2 to stay within aspect-[16/10] height */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-[300px] p-3 flex flex-col gap-2 relative overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-5 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0">
              <Video size={10} className="text-white" />
            </div>
            <span className="text-[11px] font-bold text-gray-700 lowercase">script draft</span>
          </div>
          {phase >= 4 && (
            <Badge text="top hook 🔥" color="bg-red-100 text-red-600 animate-pulse" />
          )}
        </div>

        {/* script sections */}
        {sections.map((s, i) => (
          <div
            key={s.tag}
            className={`rounded-xl border px-2.5 py-1.5 transition-all duration-500 ${
              phase > i ? s.accent : "border-gray-100 bg-gray-50/30 opacity-30"
            }`}
          >
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{s.tag}</span>
            <p className={`text-[10px] text-gray-600 mt-0.5 lowercase transition-opacity duration-500 ${
              phase > i ? "opacity-100" : "opacity-0"
            }`}>
              {s.line}
            </p>
          </div>
        ))}

        {/* retention bar */}
        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-[10px] text-gray-400 lowercase flex-shrink-0">avg retention</span>
          <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-red-400 transition-all duration-700"
              style={{ width: `${ret}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-red-500 w-7 text-right">{ret}%</span>
        </div>
      </div>
    </Outer>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */
/*  Content 2 · Long-form Article                                           */
/* ──────────────────────────────────────────────────────────────────────── */

export function ContentArticleAnim() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPhase(p => (p + 1) % 6), 1300);
    return () => clearInterval(t);
  }, []);

  const wordCounts = [0, 480, 1120, 1870, 2390, 2847];
  const seoScores  = [0,  28,   54,   72,   85,   94];
  const words = wordCounts[Math.min(phase, 5)];
  const seo   = seoScores[Math.min(phase, 5)];

  const lines = [
    { w: "82%", indent: 0,  minPhase: 1 },
    { w: "60%", indent: 0,  minPhase: 1 },
    { w: "90%", indent: 12, minPhase: 2 },
    { w: "76%", indent: 12, minPhase: 2 },
    { w: "88%", indent: 12, minPhase: 3 },
    { w: "55%", indent: 12, minPhase: 3 },
    { w: "70%", indent: 0,  minPhase: 4 },
    { w: "45%", indent: 0,  minPhase: 4 },
  ];

  return (
    <Outer color="bg-gradient-to-br from-purple-50 via-violet-50/30 to-purple-50">
      <div className="absolute top-3 right-7 h-2 w-2 rounded-full bg-purple-200/60" />
      <div className="absolute bottom-5 left-5 h-1.5 w-1.5 rounded-full bg-violet-200/60" />

      <Card>
        {/* header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <FileText size={12} className="text-purple-400" />
            <span className="text-[11px] font-bold text-gray-700 lowercase">article draft</span>
          </div>
          {phase >= 5 && (
            <Badge text="ready ✓" color="bg-purple-100 text-purple-700" />
          )}
        </div>

        {/* document lines */}
        <div className="flex flex-col gap-1.5 py-0.5">
          {lines.map((l, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full bg-purple-200 transition-all duration-700"
              style={{
                width: l.w,
                marginLeft: l.indent,
                opacity: phase >= l.minPhase ? (l.indent > 0 ? 0.45 : 0.75) : 0.1,
              }}
            />
          ))}
        </div>

        {/* word count + seo */}
        <div className="flex items-center gap-3 pt-0.5 border-t border-gray-50">
          <div className="flex flex-col gap-0.5 flex-1">
            <span className="text-[10px] text-gray-400 lowercase">words</span>
            <span className="text-sm font-black text-gray-800">{words.toLocaleString()}</span>
          </div>
          <div className="flex flex-col gap-0.5 flex-1">
            <div className="flex justify-between">
              <span className="text-[10px] text-gray-400 lowercase">seo</span>
              <span className="text-[10px] font-bold text-purple-600">{seo}</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-purple-400 transition-all duration-700"
                style={{ width: `${seo}%` }}
              />
            </div>
          </div>
        </div>
      </Card>
    </Outer>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */
/*  Content 3 · AI Content Bundle                                           */
/* ──────────────────────────────────────────────────────────────────────── */

export function ContentBundleAnim() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPhase(p => (p + 1) % 6), 1200);
    return () => clearInterval(t);
  }, []);

  // Fixed 240×108 coordinate space.
  // Source doc (32×32) centred at (120, 54) → top-left (104, 38).
  // Icons (28×28) positioned at the four corners, centres at:
  //   YouTube  (32, 22)  →  top-left (18, 8)
  //   Email    (32, 86)  →  top-left (18, 72)
  //   Blog     (208, 22) →  top-left (194, 8)
  //   Social   (208, 86) →  top-left (194, 72)
  const CX = 120, CY = 54;
  const formats = [
    { icon: Video,    label: "youtube", color: "bg-red-100 text-red-500",    lx: 32,  ly: 22,  tx: 18,  ty: 8  },
    { icon: Mail,     label: "email",   color: "bg-blue-100 text-blue-500",  lx: 32,  ly: 86,  tx: 18,  ty: 72 },
    { icon: FileText, label: "blog",    color: "bg-green-100 text-green-600",lx: 208, ly: 22,  tx: 194, ty: 8  },
    { icon: Layers,   label: "social",  color: "bg-violet-100 text-violet-600",lx: 208,ly: 86,  tx: 194, ty: 72 },
  ];

  return (
    <Outer color="bg-gradient-to-br from-fuchsia-50 via-pink-50/30 to-rose-50/20">
      <div className="absolute top-4 left-7 h-2 w-2 rounded-full bg-fuchsia-200/60" />
      <div className="absolute bottom-4 right-8 h-1.5 w-1.5 rounded-full bg-pink-200/60" />

      <Card>
        {/* header */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-gray-700 lowercase">content bundle</span>
          {phase >= 5 && (
            <Badge text="4 formats ready ✓" color="bg-fuchsia-100 text-fuchsia-700 animate-pulse" />
          )}
        </div>

        {/* hub-and-spoke — fixed 240×108 box so SVG and HTML share one coordinate space */}
        <div className="relative mx-auto" style={{ width: 240, height: 108 }}>

          {/* SVG lines — drawn BEFORE icons so they sit behind */}
          <svg
            width="240"
            height="108"
            className="absolute inset-0"
            style={{ overflow: "visible" }}
          >
            {formats.map((f, i) => (
              <line
                key={f.label + "-line"}
                x1={CX} y1={CY}
                x2={f.lx} y2={f.ly}
                stroke="#e5e7eb"
                strokeWidth="1.5"
                strokeLinecap="round"
                style={{
                  opacity: phase > i ? 1 : 0,
                  transition: "opacity 0.4s ease",
                }}
              />
            ))}
          </svg>

          {/* Source doc centred at (CX, CY) */}
          <div
            className={`absolute z-10 h-8 w-8 rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 transition-all duration-500 ${
              phase === 0 ? "border-gray-200 bg-gray-50" : "border-fuchsia-200 bg-fuchsia-50"
            }`}
            style={{ left: CX - 16, top: CY - 16 }}
          >
            <div className="h-1 w-5 rounded-full bg-gray-300" />
            <div className="h-1 w-4 rounded-full bg-gray-200" />
            <div className="h-1 w-5 rounded-full bg-gray-200" />
          </div>

          {/* Format icons — top-left at (tx, ty), 28×28 */}
          {formats.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.label}
                className={`absolute z-10 h-7 w-7 rounded-xl flex items-center justify-center transition-all duration-500 ${f.color}`}
                style={{
                  left: f.tx,
                  top: f.ty,
                  opacity: phase > i ? 1 : 0,
                  transform: phase > i ? "scale(1)" : "scale(0.7)",
                }}
              >
                <Icon size={13} />
              </div>
            );
          })}
        </div>

        {/* format labels */}
        <div className="flex justify-center gap-2 flex-wrap">
          {formats.map((f, i) => (
            <span
              key={f.label + "-tag"}
              className={`text-[9px] px-2 py-0.5 rounded-full font-semibold transition-all duration-500 ${f.color} ${
                phase > i ? "opacity-100" : "opacity-20"
              }`}
            >
              {f.label}
            </span>
          ))}
        </div>
      </Card>
    </Outer>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */
/*  BI 1 · Live Application                                                 */
/* ──────────────────────────────────────────────────────────────────────── */

export function BIAppAnim() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPhase(p => (p + 1) % 5), 1400);
    return () => clearInterval(t);
  }, []);

  const bars = [
    { label: "users",   heights: [30, 52, 68, 74, 74], color: "bg-emerald-400" },
    { label: "revenue", heights: [20, 44, 60, 80, 80], color: "bg-teal-400"    },
    { label: "events",  heights: [40, 58, 72, 65, 65], color: "bg-green-400"   },
    { label: "conv.",   heights: [15, 34, 48, 56, 56], color: "bg-emerald-300" },
  ];

  return (
    <Outer color="bg-gradient-to-br from-emerald-50 via-teal-50/30 to-green-50">
      <div className="absolute top-3 right-6 h-2 w-2 rounded-full bg-emerald-200/60" />
      <div className="absolute bottom-5 left-5 h-1.5 w-1.5 rounded-full bg-teal-200/60" />

      <Card>
        {/* app nav bar */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-gray-200" />
            <div className="h-2 w-2 rounded-full bg-gray-200" />
            <div className="h-2 w-2 rounded-full bg-gray-200" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`h-1.5 w-1.5 rounded-full transition-colors ${phase >= 1 ? "bg-emerald-400 animate-pulse" : "bg-gray-200"}`} />
            <span className="text-[9px] text-gray-400 lowercase font-semibold">live</span>
          </div>
        </div>

        {/* bar chart */}
        <div className="flex items-end gap-2 px-1" style={{ height: 72 }}>
          {bars.map((b) => (
            <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end rounded-t-md overflow-hidden" style={{ height: 60 }}>
                <div
                  className={`w-full rounded-t-md transition-all duration-700 ${b.color}`}
                  style={{ height: `${b.heights[Math.min(phase, 4)]}%` }}
                />
              </div>
              <span className="text-[8px] text-gray-300 lowercase">{b.label}</span>
            </div>
          ))}
        </div>

        {/* stats row */}
        <div className="flex gap-2 pt-1 border-t border-gray-50">
          {[
            { label: "users",   val: phase >= 2 ? "+1.2k" : "···" },
            { label: "revenue", val: phase >= 3 ? "+₱840" : "···" },
            { label: "uptime",  val: phase >= 4 ? "99.9%" : "···" },
          ].map((s) => (
            <div key={s.label} className="flex-1 flex flex-col items-center">
              <span className="text-[10px] font-bold text-gray-700">{s.val}</span>
              <span className="text-[8px] text-gray-300 lowercase">{s.label}</span>
            </div>
          ))}
        </div>
      </Card>
    </Outer>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */
/*  BI 2 · Executive KPI Dashboard                                          */
/* ──────────────────────────────────────────────────────────────────────── */

export function BIKPIAnim() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPhase(p => (p + 1) % 5), 1400);
    return () => clearInterval(t);
  }, []);

  const kpis = [
    { label: "monthly revenue", values: ["—", "₱1.1M", "₱1.8M", "₱2.4M", "₱2.4M"], trend: "↑ +18%", color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "active users",    values: ["—", "6.2k",  "11.4k", "14.2k", "14.2k"], trend: "↑ +31%", color: "text-blue-600",    bg: "bg-blue-50"    },
    { label: "churn rate",      values: ["—", "8.1%",  "5.4%",  "3.1%",  "3.1%"],  trend: "↓ good",  color: "text-green-600",  bg: "bg-green-50"   },
    { label: "nps score",       values: ["—", "42",    "58",    "71",    "71"],     trend: "↑ +29pt", color: "text-violet-600", bg: "bg-violet-50"  },
  ];

  return (
    <Outer color="bg-gradient-to-br from-teal-50 via-emerald-50/30 to-cyan-50">
      <div className="absolute top-4 left-7 h-2 w-2 rounded-full bg-teal-200/60" />
      <div className="absolute bottom-4 right-8 h-1.5 w-1.5 rounded-full bg-cyan-200/60" />

      <Card>
        {/* header */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-gray-700 lowercase">kpi overview</span>
          <div className="flex items-center gap-1">
            <TrendingUp size={10} className="text-emerald-500" />
            <span className="text-[9px] text-emerald-600 font-bold lowercase">all green</span>
          </div>
        </div>

        {/* kpi grid */}
        <div className="grid grid-cols-2 gap-2">
          {kpis.map((k, i) => (
            <div
              key={k.label}
              className={`rounded-xl p-2.5 transition-all duration-500 ${phase > i ? k.bg : "bg-gray-50"}`}
            >
              <p className="text-[8px] text-gray-400 lowercase truncate">{k.label}</p>
              <p className={`text-sm font-black transition-all duration-500 ${phase > i ? k.color : "text-gray-200"}`}>
                {k.values[Math.min(phase, 4)]}
              </p>
              <p className={`text-[9px] font-semibold transition-all duration-300 ${phase > i ? k.color : "text-transparent"}`}>
                {k.trend}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </Outer>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */
/*  BI 3 · Churn Prediction                                                 */
/* ──────────────────────────────────────────────────────────────────────── */

export function BIChurnAnim() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const delays = [1800, 1500, 1500, 2500, 2200];
    let p = 0;
    let t: ReturnType<typeof setTimeout>;
    const next = () => {
      p = (p + 1) % 5;
      setPhase(p);
      t = setTimeout(next, delays[p]);
    };
    t = setTimeout(next, delays[0]);
    return () => clearTimeout(t);
  }, []);

  const customers = [
    { name: "ana r.", score: 12, label: "low risk",  bar: "bg-green-400",  badge: "bg-green-100 text-green-700"  },
    { name: "ben l.", score: 48, label: "medium",    bar: "bg-amber-400",  badge: "bg-amber-100 text-amber-700"  },
    { name: "carl t.",score: 91, label: "at risk ⚠", bar: "bg-red-400",    badge: "bg-red-100 text-red-600"      },
  ];

  return (
    <Outer color="bg-gradient-to-br from-green-50 via-emerald-50/30 to-teal-50">
      <div className="absolute top-4 right-7 h-2 w-2 rounded-full bg-green-200/60" />
      <div className="absolute bottom-5 left-6 h-1.5 w-1.5 rounded-full bg-emerald-200/60" />

      <Card>
        {/* header */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-gray-700 lowercase">churn prediction</span>
          {phase >= 3 && (
            <Badge text="1 at risk" color="bg-red-100 text-red-600 animate-pulse" />
          )}
        </div>

        {/* customer rows */}
        {customers.map((c, i) => (
          <div key={c.name} className={`flex items-center gap-2 transition-opacity duration-500 ${phase > i ? "opacity-100" : "opacity-20"}`}>
            <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-black text-gray-400 flex-shrink-0">
              {c.name[0].toUpperCase()}
            </div>
            <span className="text-[10px] text-gray-600 w-10 flex-shrink-0 lowercase">{c.name}</span>
            <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${c.bar}`}
                style={{ width: phase > i ? `${c.score}%` : "0%" }}
              />
            </div>
            <span className="text-[9px] font-bold text-gray-500 w-6 text-right flex-shrink-0">{c.score}%</span>
            {phase > i && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${c.badge}`}>
                {c.label}
              </span>
            )}
          </div>
        ))}

        {/* action button */}
        <button
          className={`w-full py-2 rounded-xl text-[10px] font-bold lowercase transition-all duration-500 flex items-center justify-center gap-1.5 ${
            phase >= 4
              ? "bg-red-500 text-white shadow-sm shadow-red-200 animate-pulse"
              : "bg-gray-100 text-gray-300"
          }`}
        >
          <AlertTriangle size={10} />
          {phase >= 4 ? "flag carl t. for review" : "awaiting analysis…"}
        </button>
      </Card>
    </Outer>
  );
}
