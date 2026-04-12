"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

/* ─── Types ──────────────────────────────────────────────────────── */

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  logoText?: string;
  logoColor?: string;
}

export interface RecentWork {
  id: string;
  title: string;
  imageUrl?: string;
  link?: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  content?: string;
  tags: string[];
  imageUrl?: string;
  coverImageUrl?: string;
  category?: string;
  link?: string;
  publishedAt?: string | null;
}

export interface PortfolioLink {
  id: string;
  label: string;
  abbr: string;
  url: string;
  imageUrl?: string;
}

export interface PortfolioData {
  name: string;
  title: string;
  specialisation: string;
  about: string;
  location: string;
  website: string;
  email: string;
  portfolioHandle: string;
  avatarUrl: string;
  bannerUrl: string;
  resumeUrl: string;
  // kept for fallback rendering only — real data is fetched separately via svc.*
  experience: WorkExperience[];
  recentWork: RecentWork[];
  projects: Project[];
}

/* ─── Defaults ───────────────────────────────────────────────────── */

export const DEFAULT_DATA: PortfolioData = {
  name: "Stalingrad S. Dollosa",
  title: "agentic project manager · content strategist · business intelligence",
  specialisation: "I specialise in agentic project management, SEO strategy, and business intelligence.",
  about: "Your bio goes here. I'm a versatile professional who bridges the gap between AI-driven project delivery, organic content growth, and data-informed decision making.",
  location: "Your City, Country",
  website: "stalfolio.com",
  email: "dstalingrad@gmail.com",
  portfolioHandle: "@stal",
  avatarUrl: "",
  bannerUrl: "",
  resumeUrl: "",
  experience: [],
  recentWork: [],
  projects: [],
};

/* ─── Supabase row → PortfolioData ───────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToProfile(row: any): Partial<PortfolioData> {
  return {
    name:             row.name             ?? "",
    title:            row.title            ?? "",
    specialisation:   row.specialisation   ?? "",
    about:            row.about            ?? "",
    location:         row.location         ?? "",
    website:          row.website          ?? "",
    email:            row.email            ?? "",
    portfolioHandle:  row.portfolio_handle ?? "",
    avatarUrl:        row.avatar_url       ?? "",
    bannerUrl:        row.banner_url       ?? "",
    resumeUrl:        row.resume_url       ?? "",
  };
}

/* ─── Hook ───────────────────────────────────────────────────────── */

export function usePortfolioData() {
  const [data, setData] = useState<PortfolioData>(DEFAULT_DATA);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { data: row } = await supabase
          .from("profile")
          .select("*")
          .eq("id", 1)
          .single();
        if (row) setData((d) => ({ ...d, ...rowToProfile(row) }));
      } catch {
        // network error — fall back to DEFAULT_DATA already in state
      } finally {
        setLoaded(true);
      }
    }
    load();
  }, []);

  const save = async (newData: PortfolioData): Promise<void> => {
    setData(newData);
    const { error } = await supabase.from("profile").upsert({
      id:               1,
      name:             newData.name,
      title:            newData.title,
      specialisation:   newData.specialisation,
      about:            newData.about,
      location:         newData.location,
      website:          newData.website,
      email:            newData.email,
      portfolio_handle: newData.portfolioHandle,
      avatar_url:       newData.avatarUrl,
      banner_url:       newData.bannerUrl,
      resume_url:       newData.resumeUrl,
      updated_at:       new Date().toISOString(),
    });
    if (error) throw error;
  };

  return { data, save, loaded };
}
