"use client";

import { FeaturePageLayout, type FeaturePageData } from "@/components/feature-page-layout";
import { PMTeamAnim, PMMilestoneAnim, PMStakeholderAnim } from "@/components/page-animations";
import {
  Users,
  CalendarCheck,
  Target,
  MessageSquareDot,
} from "lucide-react";

const data: FeaturePageData = {
  tag: "agentic project management",
  headline: "teams aligned. deadlines met. stakeholders happy.",
  subtext:
    "i use ai to run tighter, faster delivery cycles — surfacing risks early, keeping every team member unblocked, and making sure goals land on time with no surprises for leadership.",

  sections: [
    {
      tag: "ai-assisted team management",
      headline: "lead your team. let ai handle the noise.",
      body: "i use ai to track workload balance, surface blockers, and synthesize progress signals from jira, slack, and github — so my focus stays on people and problems, not status updates. every sprint runs with full visibility without the overhead of constant check-ins.",
      bullets: [
        "workload visibility across every team member in real time",
        "ai-flagged blockers and risks before they derail a sprint",
        "automated standup summaries so nothing slips through the cracks",
        "capacity forecasting to catch burnout and resourcing gaps early",
      ],
      mediaLabel: "team workload view",
      mediaSubLabel: "ai capacity overview · add your screenshot",
      media: <PMTeamAnim />,
      reverse: false,
    },
    {
      tag: "deadline & goal tracking",
      headline: "every milestone hit. no excuses, no surprises.",
      body: "i build predictive delivery frameworks that map goals to measurable milestones and flag deviations before they become misses. ai monitors velocity, scope, and progress daily — so i can make the call before the deadline is at risk, not after.",
      bullets: [
        "goal-to-milestone decomposition with dependency mapping",
        "velocity tracking with early warning on slip risk",
        "scope change impact analysis run before any ticket gets added",
        "weekly delivery confidence scores shared with the full team",
      ],
      mediaLabel: "delivery tracking dashboard",
      mediaSubLabel: "milestone progress view · add your screenshot",
      media: <PMMilestoneAnim />,
      reverse: true,
    },
    {
      tag: "stakeholder communication",
      headline: "leadership always knows. without you writing the update.",
      body: "i use ai to generate clear, consistent stakeholder updates from live project data — progress, risks, and decisions surfaced in plain language on a reliable cadence. stakeholders stay informed, confident, and aligned without pulling engineers away from work.",
      bullets: [
        "auto-generated weekly status reports tailored per audience",
        "risk and escalation summaries with recommended next actions",
        "decision log maintained automatically as the project evolves",
        "one-click executive briefing ready for every board or leadership review",
      ],
      mediaLabel: "stakeholder report",
      mediaSubLabel: "weekly digest view · add your screenshot",
      media: <PMStakeholderAnim />,
      reverse: false,
    },
  ],

  capabilities: [
    {
      icon: Users,
      title: "team management",
      body: "workload visibility, blocker detection, and capacity planning — so your team stays unblocked and on pace.",
    },
    {
      icon: CalendarCheck,
      title: "deadline delivery",
      body: "milestone tracking and predictive risk signals that keep every commitment on schedule.",
    },
    {
      icon: Target,
      title: "goal alignment",
      body: "objectives broken into measurable milestones with progress tracked and course-corrected in real time.",
    },
    {
      icon: MessageSquareDot,
      title: "stakeholder updates",
      body: "auto-generated reports and briefings that keep leadership informed and aligned without extra overhead.",
    },
  ],
};

export default function ProjectsPage() {
  return <FeaturePageLayout {...data} />;
}
