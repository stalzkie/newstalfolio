"use client";

import { useEffect, useState } from "react";

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
  content?: string;         // markdown body for blog page
  tags: string[];
  imageUrl?: string;
  coverImageUrl?: string;  // full-width hero on blog page
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
  experience: WorkExperience[];
  recentWork: RecentWork[];
  projects: Project[];
}

const DEFAULT_DATA: PortfolioData = {
  name: "Stalingrad S. Dollosa",
  title: "agentic project manager · content strategist · business intelligence",
  specialisation: "I specialise in agentic project management, SEO strategy, and business intelligence.",
  about: "Your bio goes here. I'm a versatile professional who bridges the gap between AI-driven project delivery, organic content growth, and data-informed decision making. I enjoy working on ambitious products and helping teams move faster with better insights.",
  location: "Your City, Country",
  website: "stalfolio.com",
  email: "dstalingrad@gmail.com",
  portfolioHandle: "@stal",
  avatarUrl: "",
  bannerUrl: "",
  resumeUrl: "",
  experience: [
    {
      id: "exp-1",
      company: "Company Name",
      role: "Your Role Title",
      startDate: "Jan 2022",
      endDate: "Present",
      logoText: "CO",
      logoColor: "#1a1a1a",
    },
  ],
  recentWork: [
    { id: "rw-1", title: "recent work 1", imageUrl: "", link: "" },
    { id: "rw-2", title: "recent work 2", imageUrl: "", link: "" },
    { id: "rw-3", title: "recent work 3", imageUrl: "", link: "" },
    { id: "rw-4", title: "recent work 4", imageUrl: "", link: "" },
  ],
  projects: [
    {
      id: "proj-1",
      slug: "project-title",
      title: "project title",
      description: "Brief description of this project and what it achieved for the team or client.",
      content: "",
      tags: ["tag1", "tag2"],
      imageUrl: "",
      coverImageUrl: "",
      category: "",
      link: "",
      publishedAt: null,
    },
  ],
};

const STORAGE_KEY = "stalfolio-data";

export function usePortfolioData() {
  const [data, setData] = useState<PortfolioData>(DEFAULT_DATA);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setData({ ...DEFAULT_DATA, ...JSON.parse(stored) });
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  const save = (newData: PortfolioData) => {
    setData(newData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch {
      // ignore
    }
  };

  return { data, save, loaded };
}