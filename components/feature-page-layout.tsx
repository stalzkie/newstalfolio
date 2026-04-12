"use client";

import React from "react";
import { NavDock } from "@/components/nav-dock";
import Link from "next/link";
import { Image as ImageIcon, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ─── Types ────────────────────────────────────────────────────────── */
export interface SectionData {
  tag: string;
  headline: string;
  body: string;
  bullets: string[];
  mediaLabel: string;
  mediaSubLabel?: string;
  reverse?: boolean;
  media?: React.ReactNode;
}

export interface CapabilityData {
  icon: LucideIcon;
  title: string;
  body: string;
}

export interface FeaturePageData {
  tag: string;
  headline: string;
  subtext: string;
  sections: SectionData[];
  capabilities: CapabilityData[];
}

/* ─── Media placeholder ────────────────────────────────────────────── */
function MediaPlaceholder({
  label,
  subLabel,
}: {
  label: string;
  subLabel?: string;
}) {
  return (
    <div className="w-full aspect-[16/10] rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-3 text-center px-6">
      <div className="h-12 w-12 rounded-2xl border border-gray-200 bg-white flex items-center justify-center shadow-sm">
        <ImageIcon size={20} className="text-gray-300" />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 lowercase leading-snug">
          {label}
        </p>
        <p className="text-[10px] text-gray-300 lowercase mt-0.5">
          {subLabel ?? "image · screenshot · animation"}
        </p>
      </div>
    </div>
  );
}

/* ─── Feature section ──────────────────────────────────────────────── */
function FeatureSection({
  index,
  tag,
  headline,
  body,
  bullets,
  mediaLabel,
  mediaSubLabel,
  reverse,
  media,
}: SectionData & { index: number }) {
  const isEven = index % 2 === 0;
  const bg = isEven ? "bg-white" : "bg-gray-50";

  return (
    <section className={`${bg} py-16 sm:py-24`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
            reverse ? "lg:[&>*:first-child]:order-2" : ""
          }`}
        >
          {/* Text column */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
                0{index + 1}
              </span>
              <span className="h-px flex-1 bg-gray-200 max-w-[40px]" />
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest lowercase">
                {tag}
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 lowercase leading-tight tracking-tight">
              {headline}
            </h2>

            <p className="text-sm sm:text-base text-gray-500 lowercase leading-relaxed">
              {body}
            </p>

            <ul className="flex flex-col gap-2.5 mt-1">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-600 lowercase leading-relaxed">
                    {b}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Media column */}
          <div className={reverse ? "lg:order-first" : ""}>
            {media ?? <MediaPlaceholder label={mediaLabel} subLabel={mediaSubLabel} />}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Capability card ──────────────────────────────────────────────── */
function CapabilityCard({ icon: Icon, title, body }: CapabilityData) {
  return (
    <div className="flex flex-col gap-3 p-5 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all">
      <div className="h-9 w-9 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
        <Icon size={17} className="text-gray-700" />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-900 lowercase mb-1">{title}</p>
        <p className="text-xs text-gray-500 lowercase leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

/* ─── Main layout ──────────────────────────────────────────────────── */
export function FeaturePageLayout({
  tag,
  headline,
  subtext,
  sections,
  capabilities,
}: FeaturePageData) {
  return (
    <main className="min-h-screen bg-white">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="pt-16 sm:pt-24 pb-16 sm:pb-20 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-5">
          <span className="inline-block text-[10px] font-black text-gray-400 uppercase tracking-[0.18em] bg-gray-50 border border-gray-200 px-4 py-1.5 rounded-full lowercase">
            {tag}
          </span>

          <h1 className="text-[2rem] sm:text-5xl lg:text-7xl font-black text-gray-900 lowercase leading-[1.1] tracking-tight">
            {headline}
          </h1>

          <p className="text-base sm:text-lg text-gray-500 lowercase leading-relaxed max-w-xl">
            {subtext}
          </p>

          <Link
            href="/contact"
            className="inline-flex items-center gap-2 mt-2 h-10 px-5 rounded-full bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold lowercase transition-colors"
          >
            work with me
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Decorative divider */}
        <div className="mt-16 sm:mt-20 max-w-5xl mx-auto h-px bg-gray-100" />
      </section>

      {/* ── Feature sections ──────────────────────────────────────── */}
      {sections.map((section, i) => (
        <FeatureSection key={section.tag} index={i} {...section} />
      ))}

      {/* ── Capabilities grid ─────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest lowercase">
              capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 lowercase tracking-tight mt-2">
              everything in the toolkit.
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {capabilities.map((cap) => (
              <CapabilityCard key={cap.title} {...cap} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing CTA ───────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 text-center border-t border-gray-100">
        <div className="max-w-xl mx-auto flex flex-col items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 lowercase tracking-tight">
            ready to get started?
          </h2>
          <p className="text-sm text-gray-500 lowercase leading-relaxed">
            let's talk about your project and figure out how I can help.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 mt-2 h-10 px-6 rounded-full bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold lowercase transition-colors"
          >
            get in touch
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <NavDock />
    </main>
  );
}
