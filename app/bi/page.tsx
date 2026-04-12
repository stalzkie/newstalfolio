"use client";

import { FeaturePageLayout, type FeaturePageData } from "@/components/feature-page-layout";
import { BIAppAnim, BIKPIAnim, BIChurnAnim } from "@/components/page-animations";
import {
  Code2,
  LayoutDashboard,
  Layers,
  TrendingUp,
} from "lucide-react";

const data: FeaturePageData = {
  tag: "business intelligence",
  headline: "fullstack apps that make data make sense.",
  subtext:
    "i develop fullstack business intelligence applications — custom-built tools that surface the right data to the right people, in the right format, without waiting on an analytics team.",

  sections: [
    {
      tag: "fullstack bi applications",
      headline: "not a dashboard. a system built for your business.",
      body: "i build fullstack bi applications end-to-end — from data layer to interactive ui — tailored to exactly how your team makes decisions. these aren't generic dashboards dropped on your data. they're purpose-built tools with real-time data, role-based views, and the logic that matters to your specific workflow.",
      bullets: [
        "custom fullstack apps built with next.js, supabase, and tailwind",
        "role-based access and views tailored to each team's needs",
        "real-time data sync so decisions are always based on current numbers",
        "deployed, maintained, and iterable — not a one-time deliverable",
      ],
      mediaLabel: "bi application ui",
      mediaSubLabel: "fullstack app view · add your screenshot",
      media: <BIAppAnim />,
      reverse: false,
    },
    {
      tag: "executive dashboards",
      headline: "one screen. every answer they need.",
      body: "i design dashboards built for decisions, not data dumps. every chart earns its place. i work with tableau, looker, and metabase to give leadership clear north-star metrics with drill-down depth — formatted to match how they think.",
      bullets: [
        "revenue, retention, and activation kpi views on one pane",
        "cohort analysis and funnel metrics by segment and period",
        "anomaly detection highlights so outliers are never missed",
        "one-click export formatted for board decks and investor updates",
      ],
      mediaLabel: "executive dashboard",
      mediaSubLabel: "kpi overview view · add your screenshot",
      media: <BIKPIAnim />,
      reverse: true,
    },
    {
      tag: "predictive analytics",
      headline: "don't react to the past. predict the future.",
      body: "i build lightweight ml models and statistical frameworks that forecast churn, revenue, and demand — then surface those predictions inside the tools leadership already uses, so insights get acted on rather than ignored.",
      bullets: [
        "churn probability scoring updated daily at the customer level",
        "revenue forecasting models with confidence intervals",
        "demand and inventory prediction tied to procurement workflows",
        "model monitoring and automated retraining on data drift",
      ],
      mediaLabel: "predictive model output",
      mediaSubLabel: "churn forecast view · add your screenshot",
      media: <BIChurnAnim />,
      reverse: false,
    },
  ],

  capabilities: [
    {
      icon: Code2,
      title: "fullstack bi apps",
      body: "end-to-end application development — data layer, api, and ui — built specifically for business intelligence.",
    },
    {
      icon: LayoutDashboard,
      title: "dashboard design",
      body: "clear, decision-ready views in tableau, looker, or metabase — built around how leaders actually think.",
    },
    {
      icon: Layers,
      title: "data architecture",
      body: "structured, scalable data models that feed clean, reliable numbers into every layer of your application.",
    },
    {
      icon: TrendingUp,
      title: "predictive models",
      body: "lightweight ml for churn, revenue, and demand — surfaced inside the tools your team already uses.",
    },
  ],
};

export default function BIPage() {
  return <FeaturePageLayout {...data} />;
}
