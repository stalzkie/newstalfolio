"use client";

import { FeaturePageLayout, type FeaturePageData } from "@/components/feature-page-layout";
import { ContentScriptAnim, ContentArticleAnim, ContentBundleAnim } from "@/components/page-animations";
import {
  Video,
  FileText,
  Sparkles,
  BarChart2,
} from "lucide-react";

const data: FeaturePageData = {
  tag: "content writer & seo",
  headline: "content that ranks. copy that converts.",
  subtext:
    "i write youtube scripts, long-form articles, and ai-assisted content bundles that earn attention, build audiences, and turn readers and viewers into qualified leads.",

  sections: [
    {
      tag: "youtube script writing",
      headline: "scripts that hook in three seconds. hold for the full runtime.",
      body: "i write youtube scripts built around retention — strong hooks that stop the scroll, clear narrative arcs that hold attention, and calls to action that convert viewers into followers and customers. every script is shaped around the channel's voice, the audience's intent, and the algorithm's signals.",
      bullets: [
        "hook engineering designed to maximize click-through and watch time",
        "narrative structure mapped to youtube's retention curve",
        "research-backed talking points paired with conversational delivery cues",
        "seo-optimized titles, descriptions, and chapter breakdowns included",
      ],
      mediaLabel: "youtube script draft",
      mediaSubLabel: "script structure view · add your screenshot",
      media: <ContentScriptAnim />,
      reverse: false,
    },
    {
      tag: "long-form writing",
      headline: "articles that answer everything google wants.",
      body: "i write 1,500–5,000 word expert pieces with tight structure, strategic internal linking, and e-e-a-t signals built into every paragraph. every article is optimized for both the human who reads it and the crawler that indexes it.",
      bullets: [
        "research-backed pillar and cluster content at scale",
        "semantic keyword integration without forced keyword stuffing",
        "internal link architecture mapped before the first draft",
        "schema markup and meta recommendations included in every delivery",
      ],
      mediaLabel: "article draft preview",
      mediaSubLabel: "long-form article structure · add your screenshot",
      media: <ContentArticleAnim />,
      reverse: true,
    },
    {
      tag: "ai-assisted content bundles",
      headline: "one source. a full suite of personalized content.",
      body: "i build ai-assisted content bundles that take a single source — an interview, a long-form article, or a video — and expand it into a personalized suite of formats tailored to each audience segment. the right message, in the right format, for the right person — at scale.",
      bullets: [
        "source content atomized into email, social, video, and blog formats",
        "ai-assisted tone and message personalization by audience segment",
        "content bundles mapped to every stage of the buyer journey",
        "volume-optimized turnaround without sacrificing brand voice",
      ],
      mediaLabel: "content bundle overview",
      mediaSubLabel: "repurposing workflow · add your screenshot",
      media: <ContentBundleAnim />,
      reverse: false,
    },
  ],

  capabilities: [
    {
      icon: Video,
      title: "youtube scripts",
      body: "hook-first scripts built around retention, channel voice, and the algorithm — with seo metadata included.",
    },
    {
      icon: FileText,
      title: "long-form content",
      body: "expert-level articles from 1,500 to 5,000+ words with e-e-a-t signals and tight editorial structure.",
    },
    {
      icon: Sparkles,
      title: "ai content bundles",
      body: "one source expanded into personalized multi-format content suites for every audience segment.",
    },
    {
      icon: BarChart2,
      title: "performance reporting",
      body: "monthly seo digest reporting tied to revenue metrics — no vanity numbers, only what drives growth.",
    },
  ],
};

export default function ContentPage() {
  return <FeaturePageLayout {...data} />;
}
