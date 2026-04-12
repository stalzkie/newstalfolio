"use client";

import { NavDock } from "@/components/nav-dock";
import { SparklesText } from "@/components/magicui/sparkles-text";
import { usePortfolioData } from "@/lib/portfolio-store";
import type { WorkExperience, RecentWork, Project, PortfolioLink } from "@/lib/portfolio-store";
import * as svc from "@/lib/portfolio-service";
import {
  MapPin,
  Globe,
  AtSign,
  Mail,
  ExternalLink,
  MoreHorizontal,
  MessageSquare,
  Video,
  ArrowUpRight,
  Download,
  Settings,
  Music,
  Square,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LinkIcon, getPlatform } from "@/components/link-icon";

const SPOTIFY_EMBED =
  "https://open.spotify.com/embed/album/27KwvdCscr3IQtSbnyAZpo?utm_source=generator&autoplay=1&theme=0";


export default function HomePage() {
  const { data } = usePortfolioData();

  // Supabase-backed sections
  const [experience, setExperience] = useState<WorkExperience[]>([]);
  const [recentWork, setRecentWork]  = useState<RecentWork[]>([]);
  const [projects,   setProjects]    = useState<Project[]>([]);
  const [dbReady,    setDbReady]     = useState(false);
  const [links,      setLinks]       = useState<PortfolioLink[]>([]);

  // Dropdown + Spotify state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [playing,      setPlaying]      = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    Promise.all([
      svc.getExperience(),
      svc.getRecentWork(),
      svc.getProjects(),
      svc.getLinks(),
    ])
      .then(([exp, work, proj, lnk]) => {
        setExperience(exp);
        setRecentWork(work);
        setProjects(proj);
        setLinks(lnk);
      })
      .catch(() => {
        setExperience(data.experience);
        setRecentWork(data.recentWork);
        setProjects(data.projects);
      })
      .finally(() => setDbReady(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-white pb-32">
      {/* ── Banner ────────────────────────────────────────────── */}
      <div className="w-full h-44 sm:h-56 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 relative overflow-hidden">
        {data.bannerUrl ? (
          <img
            src={data.bannerUrl}
            alt="banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[11px] text-gray-600 font-medium lowercase tracking-wide">
              add banner via{" "}
              <Link href="/admin" className="underline">
                admin panel
              </Link>
            </span>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* ── Profile header ──────────────────────────────────── */}
        <div className="flex justify-between items-start">
          {/* Avatar */}
          <div className="-mt-14 sm:-mt-16 z-10 relative">
            <div className="h-28 w-28 sm:h-36 sm:w-36 rounded-full border-4 border-white bg-gray-100 shadow-sm overflow-hidden flex items-center justify-center">
              {data.avatarUrl ? (
                <img
                  src={data.avatarUrl}
                  alt={data.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
                  <span className="text-2xl font-black text-white lowercase tracking-tight">
                    {data.name.slice(0, 2).toLowerCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-4 sm:mt-6">
            {/* ··· dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="h-9 w-9 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <MoreHorizontal size={15} className="text-gray-600" />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 top-11 z-50 w-44 bg-white rounded-2xl border border-gray-100 shadow-lg py-1.5 flex flex-col">
                  {/* Download resume */}
                  {data.resumeUrl ? (
                    <a
                      href={data.resumeUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 lowercase transition-colors"
                    >
                      <Download size={13} className="text-gray-400" />
                      download resume
                    </a>
                  ) : (
                    <span className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-300 lowercase cursor-not-allowed">
                      <Download size={13} />
                      download resume
                    </span>
                  )}

                  {/* Admin page */}
                  <Link
                    href="/admin"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 lowercase transition-colors"
                  >
                    <Settings size={13} className="text-gray-400" />
                    admin page
                  </Link>

                  <div className="h-px bg-gray-100 mx-3 my-1" />

                  {/* Play / stop song */}
                  <button
                    onClick={() => { setPlaying((v) => !v); setDropdownOpen(false); }}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 lowercase transition-colors text-left"
                  >
                    {playing ? (
                      <><Square size={13} className="text-gray-400" />stop playing</>
                    ) : (
                      <><Music size={13} className="text-gray-400" />play song</>
                    )}
                  </button>
                </div>
              )}
            </div>
            <a href="/contact" className="h-9 px-3 sm:px-4 rounded-full border border-gray-200 bg-white flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Video size={13} />
              <span className="lowercase hidden sm:inline">book a meeting</span>
            </a>
            <a href="/contact" className="h-9 px-3 sm:px-4 rounded-full bg-gray-900 flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white hover:bg-gray-700 transition-colors">
              <MessageSquare size={13} />
              <span className="lowercase hidden sm:inline">send an email</span>
            </a>
          </div>
        </div>

        {/* Name + title */}
        <div className="mt-3 mb-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight lowercase">
            <SparklesText text={data.name} sparklesCount={6} />
          </h1>
          <p className="text-sm sm:text-base text-gray-500 lowercase mt-1 leading-snug">
            {data.title}
          </p>
        </div>

        <hr className="border-gray-100 mb-6" />

        {/* ── Experience header + About + Info ────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Left col (2/3): Experience heading + About me */}
          <div className="md:col-span-2">
            <h2 className="text-base font-bold text-gray-900 lowercase mb-0.5">
              specialization
            </h2>
            <p className="text-sm text-gray-500 lowercase mb-5 leading-relaxed">
              {data.specialisation}
            </p>

            <h3 className="text-sm font-semibold text-gray-900 lowercase mb-2">
              about me
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed lowercase line-clamp-6">
              {data.about}
            </p>
            <button className="text-xs font-semibold text-gray-800 lowercase mt-2 hover:underline">
              read more
            </button>
          </div>

          {/* Right col (1/3): 2×2 info grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 content-start">
            {(
              [
                { label: "location", value: data.location, icon: MapPin, link: false },
                { label: "website", value: data.website, icon: Globe, link: true },
                { label: "portfolio", value: data.portfolioHandle, icon: AtSign, link: false },
                { label: "email", value: data.email, icon: Mail, link: true },
              ] as const
            ).map(({ label, value, icon: Icon, link }) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                  {label}
                </span>
                <div className="flex items-center gap-1">
                  <Icon size={11} className="text-gray-500 flex-shrink-0" />
                  <span className="text-xs font-medium text-gray-800 lowercase truncate leading-tight">
                    {value}
                  </span>
                  {link && (
                    <ExternalLink
                      size={9}
                      className="text-gray-400 flex-shrink-0"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-gray-100 mb-6" />

        {/* ── Work Experience Cards ──────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-base font-bold text-gray-900 lowercase mb-4">
            work experience
          </h2>
          {!dbReady ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-20 rounded-2xl bg-gray-50 border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {experience.map((exp) => (
                <div
                  key={exp.id}
                  className="border border-gray-100 rounded-2xl p-4 flex flex-col gap-2 hover:shadow-sm hover:border-gray-200 transition-all bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: exp.logoColor || "#1a1a1a" }}
                    >
                      {exp.logoText || exp.company.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 lowercase leading-tight truncate">
                        {exp.role}
                      </p>
                      <p className="text-xs text-gray-500 lowercase truncate">
                        {exp.company}
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 lowercase pl-0.5">
                    {exp.startDate} – {exp.endDate}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <hr className="border-gray-100 mb-6" />

        {/* ── Recent Work ──────────────────────────────────────── */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 lowercase">
              certifications
            </h2>
          </div>
          {!dbReady ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-20 rounded-2xl bg-gray-50 border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentWork.map((work) => (
                <a
                  key={work.id}
                  href={work.link || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-gray-100 rounded-2xl p-4 flex items-center gap-3 hover:shadow-sm hover:border-gray-200 transition-all bg-white group"
                >
                  <div className="h-10 w-10 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {work.imageUrl ? (
                      <img
                        src={work.imageUrl}
                        alt={work.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[9px] text-gray-300 font-bold uppercase tracking-wide text-center leading-tight px-1">
                        {work.title.slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 lowercase leading-tight line-clamp-2 min-w-0">
                    {work.title}
                  </p>
                </a>
              ))}
            </div>
          )}
        </section>

        <hr className="border-gray-100 mb-6" />

        {/* ── Projects ─────────────────────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-base font-bold text-gray-900 lowercase mb-4">
            projects
          </h2>
          {!dbReady ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-2xl bg-gray-50 border border-gray-100 animate-pulse h-52" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/posts/${project.slug}`}
                  className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-sm hover:border-gray-200 transition-all bg-white group block"
                >
                  <div className="aspect-video bg-gray-50 relative overflow-hidden">
                    {project.imageUrl ? (
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs text-gray-300 font-medium lowercase">
                          {project.title}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 lowercase leading-tight">
                        {project.title}
                      </h3>
                      <ArrowUpRight
                        size={14}
                        className="text-gray-300 group-hover:text-gray-600 transition-colors flex-shrink-0 mt-0.5"
                      />
                    </div>
                    <p className="text-xs text-gray-500 lowercase leading-relaxed mb-3 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full lowercase"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <hr className="border-gray-100 mb-6" />
      </div>

      {/* ── Links bento grid ──────────────────────────────────────── */}
      {links.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-10">
          <h2 className="text-base font-bold text-gray-900 lowercase mb-4">links</h2>
          <div className="flex flex-wrap gap-3">
            {links.map((item) => (
              <a
                key={item.id}
                href={item.url || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 w-12 rounded-2xl hover:scale-105 hover:shadow-md transition-all"
              >
                {getPlatform(item.abbr) ? (
                  <LinkIcon platform={item.abbr} size={48} className="rounded-2xl" />
                ) : item.imageUrl ? (
                  <div className="h-12 w-12 rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden">
                    <img src={item.imageUrl} alt={item.label} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-wide">
                      {item.abbr || item.label.slice(0, 2)}
                    </span>
                  </div>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── Floating Spotify player ───────────────────────────────── */}
      {playing && (
        <div className="fixed bottom-28 left-4 right-4 sm:left-auto sm:right-4 sm:w-[300px] z-40 shadow-xl rounded-xl overflow-hidden">
          <iframe
            src={SPOTIFY_EMBED}
            width="100%"
            height="80"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            style={{ border: "none" }}
          />
        </div>
      )}

      <NavDock />
    </main>
  );
}
