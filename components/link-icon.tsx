"use client";

import type { ReactElement } from "react";

/* ─── Platform registry ───────────────────────────────────────────── */

export const LINK_PLATFORMS = [
  { id: "facebook",  label: "facebook",  color: "#1877F2" },
  { id: "linkedin",  label: "linkedin",  color: "#0A66C2" },
  { id: "youtube",   label: "youtube",   color: "#FF0000" },
  { id: "fiverr",    label: "fiverr",    color: "#1DBF73" },
  { id: "instagram", label: "instagram", color: "#E4405F" },
  { id: "upwork",    label: "upwork",    color: "#6FDA44" },
] as const;

export type PlatformId = (typeof LINK_PLATFORMS)[number]["id"];

export function getPlatform(id: string) {
  return LINK_PLATFORMS.find((p) => p.id === id) ?? null;
}

/* ─── SVG paths ───────────────────────────────────────────────────── */

function FacebookSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

function LinkedInSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function YouTubeSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function FiverrSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {/* Vertical bar */}
      <rect x="9.5" y="6.5" width="2.5" height="13" rx="1.25" />
      {/* Horizontal arm */}
      <rect x="7" y="11" width="9.5" height="2.5" rx="1.25" />
      {/* Dot */}
      <circle cx="17.5" cy="7" r="2" />
      {/* Curved top of "f" */}
      <path d="M10 9.5V7.5C10 5.567 11.567 4 13.5 4H15V6.5h-1.5a1 1 0 00-1 1V9.5H10z" />
    </svg>
  );
}

function InstagramSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function UpworkSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.375 7.5c-2.109 0-3.75 1.336-4.5 3.398-.469-1.851-1.758-3.117-3.281-3.398v5.578C10.594 14.133 9.75 15 8.625 15S6.656 14.133 6.656 13.078V7.5H4.5v5.578C4.5 15.328 6.328 17.156 8.625 17.156c1.265 0 2.39-.585 3.187-1.523C12.586 16.57 13.922 17.156 15 17.156c2.297 0 4.125-1.828 4.125-4.078V11.25C19.125 9.234 18.937 7.5 18.375 7.5zm-.938 5.578c0 1.055-.843 1.922-1.968 1.922s-1.969-.867-1.969-1.922v-2.226c.235-1.407 1.055-2.352 1.969-2.352 1.125 0 1.968.867 1.968 1.922v2.656z" />
    </svg>
  );
}

const ICON_MAP: Record<string, () => ReactElement> = {
  facebook:  FacebookSvg,
  linkedin:  LinkedInSvg,
  youtube:   YouTubeSvg,
  fiverr:    FiverrSvg,
  instagram: InstagramSvg,
  upwork:    UpworkSvg,
};

/* ─── LinkIcon ────────────────────────────────────────────────────── */
// Renders a square tile: brand-colored background + white icon.
// Falls back to null if platform is not recognised.

export function LinkIcon({
  platform,
  size = 32,
  className = "",
}: {
  platform: string;
  size?: number;
  className?: string;
}) {
  const meta = getPlatform(platform);
  const SvgComp = ICON_MAP[platform];
  if (!meta || !SvgComp) return null;

  return (
    <span
      className={`flex items-center justify-center rounded-xl flex-shrink-0 ${className}`}
      style={{ width: size, height: size, background: meta.color }}
    >
      <span className="text-white" style={{ width: size * 0.55, height: size * 0.55, display: "flex" }}>
        <SvgComp />
      </span>
    </span>
  );
}

/* ─── PlatformPicker ──────────────────────────────────────────────── */
// Grid of platform tiles for the admin "add link" form.

export function PlatformPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (platformId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">platform icon</p>
      <div className="grid grid-cols-3 gap-2">
        {LINK_PLATFORMS.map((p) => {
          const SvgComp = ICON_MAP[p.id];
          const selected = value === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange(p.id)}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all ${
                selected
                  ? "border-gray-900 bg-gray-50 shadow-sm"
                  : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <span
                className="flex items-center justify-center rounded-xl"
                style={{ width: 32, height: 32, background: p.color }}
              >
                <span className="text-white" style={{ width: 18, height: 18, display: "flex" }}>
                  <SvgComp />
                </span>
              </span>
              <span className="text-[10px] font-semibold text-gray-500 lowercase">{p.label}</span>
              {selected && (
                <span className="h-1.5 w-1.5 rounded-full bg-gray-900" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
