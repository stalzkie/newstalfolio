/* ─────────────────────────────────────────────────────────────────────
   stalfolio — seed content.

   Generated from handover.md section 14. This is the fallback the site
   renders with when the Supabase tables are empty or unreachable, and
   the payload the /admin import button pushes into the database.

   Edit content in the database (/admin), not here.
   ───────────────────────────────────────────────────────────────────── */

import type { SiteContent } from "./types";

export const SEED_CONTENT: SiteContent = {
  "config": {
    "email": "dstalingrad@gmail.com",
    "formEndpoint": "",
    "profilePhoto": "",
    "ogImageUrl": "",
    "githubUrl": "https://github.com/stalzkie",
    "heroEyebrow": "bacolod city, philippines · open for projects",
    "heroName": "stalingrad dollosa",
    "heroSub": "Freelance software engineer, mobile developer, and AI engineer. I build full-stack systems, mobile apps, and AI-native tools that hold up in production.",
    "heroFine": "full-stack · mobile · ai engineering · founder of euclid",
    "bioHeading": "hi, i'm stal.",
    "bio": [
      "I'm a freelance software engineer, mobile developer, and AI engineer from Bacolod City, Philippines. I build the systems businesses run on: sales and collections platforms, restaurant operations, education marketplaces, and the AI features inside them.",
      "I spent the last stretch as technical product manager at Hoversight, where I was the main engineer on financial modules. Now I freelance, run Euclid, and build Bernn on my own. My AI tools run close to the machine: LocalForge reviews code on-device before it's committed, and Cascaid predicts failures in AI pipelines before they spread. I also teach AI engineering at the University of St. La Salle, and before all of this I ran a content writing agency that grew to a team of 15.",
      "I care about systems that keep working after launch. That means tests before trusting generated code, diagnoses written down, and dashboards people actually use."
    ],
    "facts": [
      [
        "based in",
        "Bacolod City, PH"
      ],
      [
        "focus",
        "AI engineering · product"
      ],
      [
        "education",
        "B.S. Computer Science, USLS"
      ]
    ],
    "heroBubble": "can you build our ai system?",
    "nowLines": [
      "freelance swe · mobile · ai",
      "founder @ euclid",
      "building bernn"
    ],
    "featured": [
      "localforge",
      "cascaid",
      "real-estate-pmss"
    ],
    "featuredBubbles": [
      "can it stop a leaked key before the commit?",
      "what breaks next in our AI pipeline?",
      "one system for sales, collections, and lots?"
    ],
    "statsFile": "stats.json",
    "stats": [
      {
        "value": "5",
        "label": "client products shipped, with 78% fewer production issues"
      },
      {
        "value": "22",
        "label": "security vulnerabilities resolved, 3 of them critical"
      },
      {
        "value": "4,000+",
        "label": "real estate lots mapped across 4 developments"
      },
      {
        "value": "3rd",
        "label": "place and Most Promising Prototype at AI.DEAS 2025"
      }
    ],
    "currentlyHeading": "what i'm doing now",
    "currentlyDesc": "Freelancing for clients, running my own AI firm, building a mobile app, and teaching the next batch of AI engineers.",
    "currently": [
      {
        "file": "freelance.role",
        "role": "software engineer · mobile developer · ai engineer",
        "title": "Freelance",
        "body": "Full-stack systems, mobile apps, and AI-native tools for clients in real estate, food service, education, and more. [Open for projects.](#work)"
      },
      {
        "file": "euclid.role",
        "role": "founder",
        "title": "Euclid",
        "body": "An AI systems firm that rescues broken AI systems and builds traceable new ones, plus its own products: Cascaid, LocalForge, and Bernn."
      },
      {
        "file": "bernn.role",
        "role": "solo builder · mobile developer",
        "title": "Bernn",
        "body": "A React Native app that puts your cloud bill and AI API spend in one place, built for solo developers."
      },
      {
        "file": "usls.role",
        "role": "part-time faculty",
        "title": "University of St. La Salle",
        "body": "Teaching AI engineering at the College of Computing Studies, from zero Python to deployed AI systems."
      }
    ],
    "tiers": [
      {
        "name": "Website design & development",
        "amt": "$500–$3,000",
        "file": "websites.pkg",
        "items": [
          "Custom design, not a template",
          "Responsive build for phones and desktops",
          "Content setup and basic SEO",
          "Deployment and a handoff walkthrough"
        ]
      },
      {
        "name": "Full-stack development",
        "amt": "$2,000",
        "from": true,
        "hl": true,
        "file": "full-stack.pkg",
        "items": [
          "Database design and APIs",
          "Roles, permissions, and dashboards",
          "Business workflows such as CRM, collections, or orders",
          "CI/CD and deployment"
        ]
      },
      {
        "name": "AI tools & AI-native systems",
        "amt": "$3,000",
        "from": true,
        "file": "ai-systems.pkg",
        "items": [
          "RAG, tool calling, and agentic workflows",
          "Evaluation sets so you can tell it works",
          "Monitoring and cost guards",
          "Rescue and repair of existing AI systems"
        ]
      }
    ],
    "pricingNote": "Prices in USD. Final quote depends on scope, integrations, and timeline.",
    "steps": [
      {
        "title": "scoping call",
        "note": "We talk through the problem, users, and constraints."
      },
      {
        "title": "written proposal",
        "note": "Scope, timeline, and a fixed quote inside the range."
      },
      {
        "title": "build in sprints",
        "note": "Weekly check-ins with a live preview you can click through."
      },
      {
        "title": "launch and handoff",
        "note": "Deployment, docs, and a walkthrough so your team owns it."
      }
    ],
    "ctaHeading": "have something to build?",
    "ctaSub": "Websites from $500. Full-stack systems from $2,000. AI systems from $3,000.",
    "footerBlurb": "Bacolod City, Philippines. Available for remote projects.",
    "cats": {
      "systems": {
        "label": "full-stack systems",
        "short": "full-stack",
        "title": "full-stack system projects",
        "desc": "Production systems built for real businesses: databases, roles, dashboards, and the workflows people use every day."
      },
      "ai": {
        "label": "ai engineering",
        "short": "ai",
        "title": "ai engineering projects",
        "desc": "Models, pipelines, and AI-native tools, from on-device code review to predicting failures in LLM pipelines."
      },
      "ventures": {
        "label": "ventures",
        "short": "ventures",
        "title": "current ventures",
        "desc": "What I'm building as a founder and mobile app developer."
      }
    }
  },
  "projects": [
    {
      "slug": "real-estate-pmss",
      "cat": "systems",
      "name": "Real Estate Sales & Property System",
      "file": "pmss.app",
      "art": "lots",
      "industry": "Real estate developer",
      "nda": true,
      "status": [
        "live",
        "Rolled out to staff"
      ],
      "tag": "One system for a real estate developer's whole buyer lifecycle: reservations, amortization, collections, disbursements, and lot inventory.",
      "summary": "A developer selling lots across several projects needed sales, collections, and finance in one place. This platform serves staff, finance, management, and buyers, and puts every lot on an interactive map so availability is visible at a glance.",
      "features": [
        "Buyer CRM, reservations, and promo codes, with a buyer journey simulator for sales staff",
        "Amortization schedules, payments, deferrals, and automated delinquency processing with statement-of-account emails",
        "Disbursements: purchase orders, canvassing approvals, check vouchers, petty cash, reimbursements, and budget requests",
        "Job orders and material requests routed by department",
        "Sales commissions that unlock automatically as buyers pay",
        "Client portal where buyers see payments and documents, with ownership certificate notices by email",
        "Interactive SVG lot maps generated from site plans",
        "Role-based module access, announcements with acknowledgements, and a full audit log"
      ],
      "flow": [
        "site plan PDFs",
        "PyMuPDF + automated contour detection",
        "lot polygons → interactive inventory maps",
        "reservations → amortization → collections",
        "finance approvals → check vouchers",
        "dashboards, reports, client portal"
      ],
      "numbers": [
        [
          "4,000+",
          "lots mapped across 4 developments"
        ],
        [
          "45",
          "data entities"
        ],
        [
          "41",
          "backend functions"
        ],
        [
          "37",
          "app screens"
        ]
      ],
      "stack": [
        "React",
        "Vite",
        "Base44",
        "Tailwind CSS",
        "Python",
        "PyMuPDF",
        "SVG"
      ],
      "role": "Lead engineer and main engineer on the financial modules, from discovery through staff rollout, including the lot-map pipeline and pricing formula analysis."
    },
    {
      "slug": "motorcycle-dealership-erp",
      "cat": "systems",
      "name": "Motorcycle Dealership ERP",
      "file": "dealership-erp",
      "art": "browser",
      "industry": "Motorcycle dealership",
      "nda": true,
      "status": [
        "live",
        "Live · v2"
      ],
      "tag": "Runs a motorcycle dealership end to end: unit sales, in-house financing, parts inventory, payables, and payroll.",
      "summary": "A dealership selling motorcycles on in-house financing needed every desk on one system, from the sales agent taking an application to the owner reviewing the balance sheet. Version two gives every role its own dashboard and puts an approval trail on every sensitive change.",
      "features": [
        "Financing applications with credit investigation, escalation, and document templates",
        "Unit, parts, and small-item inventory with purchase orders, deliveries, and stock adjustments",
        "OR/CR registration document tracking for every unit sold",
        "Cashier payments, collection targets, and recent-transaction review",
        "Payables calendar, expenses, and balance sheet",
        "Payroll runs, attendance, salary profiles, and sales commissions",
        "Edit requests with approvals, an audit trail, user activity tracking, and bulk imports",
        "Owner controls, including calamity overrides that relieve payment schedules"
      ],
      "numbers": [
        [
          "8",
          "role dashboards: owner to sales agent"
        ],
        [
          "34",
          "data entities"
        ],
        [
          "50",
          "app screens"
        ],
        [
          "v2",
          "rebuilt and live"
        ]
      ],
      "stack": [
        "React",
        "Vite",
        "Base44",
        "Tailwind CSS",
        "React Query",
        "Recharts"
      ],
      "role": "Designed and built the system, including the financing workflow, inventory, and payroll modules."
    },
    {
      "slug": "business-education-platform",
      "cat": "systems",
      "name": "Business Education & Mentorship Platform",
      "file": "edtech-platform",
      "art": "edu",
      "industry": "Business education",
      "nda": true,
      "status": [
        "live",
        "Live · security-hardened"
      ],
      "tag": "A learning, mentorship, and hiring platform for a business institute, with paid assessments, verifiable credentials, and AI career tools.",
      "summary": "A business institute wanted one place where students learn, get mentored, prove their skills, and get hired. The platform connects students, mentors, coordinators, and employers, and went through a formal security audit and remediation.",
      "features": [
        "Learning paths, modules, quizzes, study planner, and peer reviews",
        "Skills benchmark assessments scored server-side, with a public leaderboard",
        "Mentorship marketplace: applications, booking, session notes, escrow payments, contracts sent for signature, and reviews",
        "Apprenticeships and an employer job board with AI match scores",
        "Verifiable credentials, certificate PDFs, and public student portfolios",
        "AI tools: path finder, mock interviews, job matching, and generated apprenticeship reports",
        "Gamification with XP, badges, and streaks"
      ],
      "numbers": [
        [
          "22",
          "audit vulnerabilities remediated (3 critical, 9 high)"
        ],
        [
          "35",
          "codebase issues fixed"
        ],
        [
          "76",
          "data entities"
        ],
        [
          "40",
          "backend functions"
        ]
      ],
      "stack": [
        "React",
        "Vite",
        "Base44",
        "Tailwind CSS",
        "LLM integrations",
        "DOMPurify"
      ],
      "role": "Ran the security remediation and engineering: role guards, IDOR fixes, server-side scoring, upload validation, security headers, and a central error handler, plus feature development."
    },
    {
      "slug": "restaurant-operations-suite",
      "cat": "systems",
      "name": "Restaurant Operations Suite",
      "file": "restaurant-ops",
      "art": "menu",
      "industry": "Full-service restaurant",
      "nda": true,
      "status": [
        "live",
        "Live"
      ],
      "tag": "POS, kitchen display, inventory, loyalty, catering, and the public website for a full-service restaurant, in one system.",
      "summary": "A full-service restaurant needed the floor, the kitchen, the back office, and the guest-facing website on one system. This suite runs all of it from one codebase.",
      "features": [
        "POS and order taking with table sections, discounts, and manager PIN checks",
        "Kitchen display system and ticket printing to kitchen printers",
        "Ingredient-level inventory with daily logs, low-stock alerts, receiving, suppliers, and purchase orders",
        "Cash drawer shifts, daily sales encoding, expenses, budgets, and reports",
        "CRM with automated email sequences, digital loyalty stamp cards, and QR vouchers",
        "Table booking with reservation emails, plus catering and food tray packages",
        "Website and menu management, a guest chatbot, and an AI business analyst for the owners"
      ],
      "numbers": [
        [
          "55",
          "data entities"
        ],
        [
          "35",
          "app screens"
        ],
        [
          "2",
          "AI assistants: guests and owners"
        ]
      ],
      "stack": [
        "React",
        "Vite",
        "Base44",
        "Tailwind CSS",
        "LLM integrations"
      ],
      "role": "Designed and built the suite end to end, from POS and kitchen flow to the loyalty program and website."
    },
    {
      "slug": "qr-ordering",
      "cat": "systems",
      "name": "QR Ordering Platform",
      "file": "qr-ordering",
      "art": "scan",
      "industry": "Restaurants & venues · SaaS",
      "status": [
        "live",
        "Multi-tenant SaaS"
      ],
      "tag": "QR menus and table ordering for restaurants and venues, with an AI waiter and orders that print straight to the kitchen.",
      "summary": "Guests scan a code at their table, browse the menu, and order without waiting for staff. Each business gets its own branded menu, and orders flow to the right kitchen printer and into the POS.",
      "features": [
        "Multi-business setup with per-venue tables and branded menu themes",
        "Public QR menus with ordering from the table",
        "Order tickets routed to kitchen printers by menu category, with custom receipt templates",
        "Sync with Loyverse POS",
        "AI waiter chatbot that answers questions about the menu",
        "Admin tools to copy menus between businesses and manage platform settings"
      ],
      "numbers": [
        [
          "16",
          "data entities"
        ],
        [
          "17",
          "backend functions"
        ]
      ],
      "stack": [
        "React",
        "Vite",
        "Base44",
        "Tailwind CSS",
        "Loyverse API",
        "LLM"
      ],
      "role": "Built the platform, including ordering, printer routing, POS sync, and the menu chatbot.",
      "repo": "https://github.com/stalzkie/hoverscan",
      "priv": true
    },
    {
      "slug": "ai-receptionist-crm",
      "cat": "systems",
      "name": "AI Receptionist CRM",
      "file": "ai-receptionist-crm",
      "art": "chat",
      "industry": "AI receptionist agency",
      "status": [
        "live",
        "CRM + lead funnel"
      ],
      "tag": "A CRM and lead funnel for an AI receptionist service, with a scorecard quiz and a live voice demo.",
      "summary": "Prospects take a short quiz about how they handle inbound leads, get an AI-written scorecard, then talk to a live AI receptionist tuned to their business. Every lead lands in a CRM that tracks clients, onboarding, revenue, NPS, and referrals.",
      "features": [
        "Lead Response Score quiz with AI-generated insights and an emailed action-plan report",
        "Live AI receptionist demo with voice, personalized to the prospect's business",
        "CRM for leads and clients, onboarding, financials, NPS, referrals, and team",
        "AI assistant inside the CRM",
        "Rate-limited public endpoints"
      ],
      "numbers": [
        [
          "28",
          "API routes"
        ],
        [
          "14",
          "app pages"
        ]
      ],
      "stack": [
        "Next.js",
        "TypeScript",
        "Supabase",
        "Claude API",
        "ElevenLabs",
        "Resend"
      ],
      "role": "Built the app end to end: funnel, voice demo, CRM, and AI features.",
      "repo": "https://github.com/stalzkie/ChatZillaCRM",
      "priv": true
    },
    {
      "slug": "cascaid",
      "cat": "ai",
      "name": "Cascaid",
      "file": "cascaid",
      "art": "graph",
      "status": [
        "dev",
        "In development · on PyPI"
      ],
      "tag": "Predicts which part of an AI pipeline is about to take the rest down, before it happens.",
      "summary": "Observability tools for LLM apps mostly explain failures after the fact. Cascaid models a LangGraph, LiteLLM, or vector-DB pipeline as a graph and predicts cascading failures before they spread. It is self-hosted, so pipeline data never leaves your environment.",
      "features": [
        "cascaid demo: a synthetic fault-injection pipeline, trained and seeded locally with zero setup",
        "cascaid run: auto-detects LangGraph, LiteLLM, Pinecone, and Weaviate and instruments them with no code changes",
        "cascaid ingest: streams live events into the graph store and Postgres the dashboard reads",
        "GNN model benchmarked against an XGBoost baseline",
        "Dashboard in React and TypeScript; alerting stays off until you trust the track record"
      ],
      "flow": [
        "your app (LangGraph · LiteLLM · vector DB)",
        "cascaid run → zero-code instrumentation",
        "event stream → graph store + Postgres",
        "GNN cascade-risk prediction",
        "dashboard + optional alerts"
      ],
      "numbers": [
        [
          "3-tier",
          "test pyramid: unit, integration, e2e"
        ],
        [
          "1 command",
          "docker compose up for dashboard, model server, Postgres"
        ]
      ],
      "stack": [
        "Python",
        "PyTorch",
        "XGBoost",
        "Postgres",
        "React",
        "TypeScript",
        "Docker",
        "GitHub Actions"
      ],
      "role": "Founder and sole engineer: product spec, model, CLI, dashboard, and the CI pipeline that retrains and publishes the model on each tagged release.",
      "repo": "https://github.com/stalzkie/cascaid",
      "install": "pipx install cascaid"
    },
    {
      "slug": "localforge",
      "cat": "ai",
      "name": "LocalForge",
      "file": "localforge",
      "art": "shield",
      "status": [
        "beta",
        "Beta · v2.1.3"
      ],
      "tag": "A Rust-native security gateway that reviews your code before git does. Fully on-device.",
      "summary": "LocalForge intercepts every git commit and runs the staged diff through three layers on the Mac itself. Secrets and risky code are blocked before they land, and a local LLM writes an advisory review. No cloud, no API keys, no code leaving the machine.",
      "features": [
        "Blocks hardcoded secrets: 26 patterns across 13 providers, including AWS, Stripe, OpenAI, and Anthropic keys",
        "Local Qwen2.5-Coder review finds SQL injection, XSS, dead functions, and logic bugs across 11 languages",
        "Native SwiftUI macOS app with live scan monitor and multi-repo management",
        "MCP server for Cursor, VS Code, and other MCP clients",
        "Team install script and JSON/CSV compliance export"
      ],
      "flow": [
        "git commit",
        "pre-commit hook → staged diff",
        "layer 1 · Rust regex · <1 ms · blocks",
        "layer 2 · CoreML on the Neural Engine · ~200 ms · blocks",
        "layer 3 · Qwen2.5-Coder via MLX · ~5–8 s · advisory report"
      ],
      "numbers": [
        [
          "<1 ms",
          "secret scan with compiled Rust regex"
        ],
        [
          "0.754",
          "cross-validated F1 for the CoreML classifier"
        ],
        [
          "11",
          "languages reviewed"
        ],
        [
          "0",
          "bytes of code sent to the cloud"
        ]
      ],
      "stack": [
        "Rust",
        "Swift",
        "SwiftUI",
        "CoreML",
        "MLX",
        "Qwen2.5-Coder",
        "MCP"
      ],
      "role": "Designed and built the whole pipeline, the macOS app, and the release process. Shared on Product Hunt, Hacker News, and Reddit.",
      "repo": "https://github.com/stalzkie/local-forge"
    },
    {
      "slug": "curricalign",
      "cat": "ai",
      "name": "CurricAlign",
      "file": "curricalign",
      "art": "align",
      "status": [
        "live",
        "Research system"
      ],
      "tag": "Scores how well a college syllabus matches what employers are hiring for right now.",
      "summary": "Course content drifts away from the job market faster than syllabi are revised. CurricAlign scrapes job postings, extracts the skills employers ask for, and uses Sentence-BERT embeddings with trained regressors to score how well each course covers them.",
      "features": [
        "Job posting scraper and in-demand skill extraction",
        "Sentence-BERT semantic matching of course content against job skills",
        "LightGBM and Kernel Ridge models for alignment and subject-success scoring",
        "Gemini API for language tasks in the pipeline",
        "Course-to-job alignment dashboard"
      ],
      "flow": [
        "job postings",
        "skill extraction",
        "course syllabi",
        "Sentence-BERT embeddings",
        "LightGBM / Kernel Ridge scoring",
        "alignment dashboard"
      ],
      "numbers": [
        [
          "0.84",
          "R² model fit"
        ],
        [
          "0.91",
          "Spearman ρ ranking agreement"
        ]
      ],
      "stack": [
        "Next.js",
        "TypeScript",
        "FastAPI",
        "Sentence-BERT",
        "LightGBM",
        "Gemini API",
        "Supabase"
      ],
      "role": "Built the data pipeline, models, API, and dashboard.",
      "repo": "https://github.com/stalzkie/curricalign"
    },
    {
      "slug": "hiway",
      "cat": "ai",
      "name": "HiWay",
      "file": "hiway",
      "art": "phone",
      "status": [
        "dev",
        "Mobile app"
      ],
      "award": "3rd Place & Most Promising Prototype · AI.DEAS 2025 Hackathon",
      "tag": "A mobile-first career platform built for the Philippines' skills mismatch.",
      "summary": "HiWay helps job seekers see which jobs they are actually close to, and what to learn next. It is built for low-end phones and patchy data connections so it reaches provincial and grassroots users, not just city ones.",
      "features": [
        "AI resume builder from uploaded or typed details",
        "AI upskilling roadmap for a target role, with confidence scores, courses, and timelines",
        "Social-feed job timeline with a personal confidence score on every post",
        "Median salary tags to prevent underpayment",
        "Profiles that update as users complete roadmap milestones"
      ],
      "numbers": [
        [
          "3rd",
          "place at AI.DEAS 2025"
        ],
        [
          "5",
          "person team"
        ]
      ],
      "stack": [
        "Flutter",
        "Dart",
        "FastAPI",
        "Supabase",
        "OpenAI",
        "SerpAPI"
      ],
      "role": "Tech lead. Led the backend and system architecture for a five-person team.",
      "repo": "https://github.com/stalzkie/hiway"
    },
    {
      "slug": "euclid",
      "cat": "ventures",
      "name": "Euclid",
      "file": "euclid-hq",
      "art": "euclid",
      "status": [
        "live",
        "Founder"
      ],
      "tag": "AI solutions, built on proof. Euclid rescues broken AI systems and builds new ones that stay traceable.",
      "summary": "Many AI systems are shipped fast and then degrade, and the original developers are gone. Euclid is the team that diagnoses why, fixes it, and documents it. Diagnosis comes before any code changes, and that write-up belongs to the client whether or not the engagement continues.",
      "features": [
        "Rescue: fix broken or degrading AI systems, with a written diagnosis of why they failed",
        "Build: new AI-native systems designed for traceability from day one",
        "Products: Cascaid (in development), LocalForge (beta), and Bernn"
      ],
      "stack": [
        "AI systems",
        "LLMOps",
        "Evaluation",
        "Observability"
      ],
      "role": "Founder.",
      "live": "https://euclid-hq.vercel.app/"
    },
    {
      "slug": "bernn",
      "cat": "ventures",
      "name": "Bernn",
      "file": "bernn.app",
      "art": "spend",
      "status": [
        "beta",
        "In build"
      ],
      "tag": "One glance at everything you're burning: cloud infrastructure and AI API spend, in one mobile app.",
      "summary": "Solo developers pay AWS, Anthropic, and OpenAI on separate dashboards, all desktop-first, and anomaly alerts arrive a day or two late. Existing consolidation tools are built for enterprise FinOps teams. Bernn is personal-scale: one dashboard, one widget, and one alert system on your phone.",
      "features": [
        "Connect AWS and Anthropic (OpenAI built and behind a flag) and see total spend this month with a per-provider breakdown",
        "Provider credentials encrypted at rest and readable only by the service role",
        "Spend records partitioned by month with row-level security per user",
        "Modular backend: connection, ingestion, aggregation, alerting, notification, and billing modules in one deployable service",
        "CI on every push: lint, typecheck, unit and integration tests, and format checks in parallel, with the build gated on all of them"
      ],
      "flow": [
        "provider credentials (encrypted)",
        "ingestion poll per provider",
        "spend_records (monthly partitions, RLS)",
        "aggregation → dashboard API",
        "alerts and notifications",
        "React Native app + widget"
      ],
      "numbers": [
        [
          "3",
          "providers: AWS, Anthropic, OpenAI"
        ],
        [
          "10",
          "backend modules"
        ],
        [
          "5",
          "parallel CI checks"
        ]
      ],
      "stack": [
        "React Native",
        "Expo",
        "TypeScript",
        "Node",
        "Supabase",
        "Postgres",
        "Turborepo",
        "Railway"
      ],
      "role": "Solo builder: product spec, mobile app, backend, and CI.",
      "repo": "https://github.com/stalzkie/bern",
      "priv": true
    }
  ],
  "experience": [
    {
      "head": true,
      "when": "now",
      "title": "Freelance Software Engineer, Mobile Developer & AI Engineer",
      "org": "Independent",
      "body": [
        "Building full-stack systems, mobile apps, and AI-native tools for clients.",
        "Open for website, full-stack, and AI system projects; see pricing on the work with me page."
      ]
    },
    {
      "head": true,
      "when": "now",
      "title": "Founder",
      "org": "Euclid",
      "body": [
        "An AI systems firm that rescues broken AI systems and builds traceable new ones.",
        "Products: Cascaid, LocalForge, and Bernn."
      ]
    },
    {
      "head": true,
      "when": "now",
      "title": "Solo Builder & Mobile Developer",
      "org": "Bernn",
      "body": [
        "Building a React Native app that puts cloud and AI API spend in one place, with a TypeScript backend and CI on every push."
      ]
    },
    {
      "head": true,
      "when": "s.y. 2026–27",
      "title": "Part-Time Faculty",
      "org": "College of Computing Studies, University of St. La Salle",
      "body": [
        "Teaching AI engineering: from zero Python to deployed AI systems, run as a real software development cycle with sprints, a DevOps track, and a demo day."
      ]
    },
    {
      "when": "previously",
      "title": "Technical Product Manager & AI Engineer",
      "org": "Hoversight AI Agency",
      "body": [
        "Led product and engineering for custom software in finance, real estate, education, and food service; main engineer on the financial modules.",
        "Ran full-cycle security remediation and system design across 5 products: 22 vulnerabilities resolved (3 critical, 9 high) and 35 codebase issues fixed.",
        "Brought production issues down 78% with a 5-month average shipping time.",
        "Built an interactive property map system covering 4,000+ lots across 4 developments, generated from site plans with PyMuPDF and automated contour detection."
      ]
    },
    {
      "when": "internship",
      "title": "Intern",
      "org": "Green Module Systems",
      "body": [
        "Hands-on work in computer vision, LLMs, and full-stack development."
      ]
    },
    {
      "when": "college",
      "title": "Founder",
      "org": "Content writing agency",
      "body": [
        "Started a content writing agency at 20 and grew it to $20k ARR with a team of 15 while studying."
      ]
    },
    {
      "when": "2021–2026",
      "title": "B.S. Computer Science",
      "org": "University of St. La Salle, Bacolod",
      "body": [
        "Thesis: a graph neural network surrogate for cost-aware chiplet design space exploration (GNN-CADSE)."
      ]
    }
  ],
  "awards": [
    {
      "kind": "award",
      "title": "3rd Place & Most Promising Prototype",
      "org": "AI.DEAS 2025 Hackathon",
      "note": "Tech lead for HiWay, an AI career alignment platform built by a five-person team.",
      "href": "#p-hiway"
    },
    {
      "kind": "award",
      "title": "Top 10, Regional Finals",
      "org": "Philippine Startup Challenge X",
      "note": "Tech lead representing the University of St. La Salle in the Region 6 pitching competition."
    },
    {
      "kind": "feature",
      "title": "Show HN, Product Hunt, Reddit",
      "org": "LocalForge launch",
      "note": "LocalForge shared with the developer communities on Hacker News, Product Hunt, and Reddit.",
      "href": "#p-localforge"
    },
    {
      "kind": "feature",
      "title": "Published on PyPI",
      "org": "Cascaid",
      "note": "Installable with one command: pipx install cascaid.",
      "href": "#p-cascaid"
    }
  ],
  "certs": [
    {
      "title": "Google Business Intelligence Professional Certificate",
      "org": "Google · Coursera",
      "note": "Data modeling, ETL pipelines, and dashboards for business decisions."
    }
  ],
  "side": [
    {
      "title": "Project Daedalus",
      "note": "An aerospace intelligence platform with real-time launch tracking, 3D orbital visualization in CesiumJS, and a delta-v calculator."
    },
    {
      "title": "Teaching materials",
      "note": "A full AI engineering course: reading guides, assignments with verified answer keys, and a project-based final with a DevOps track."
    }
  ],
  "skills": [
    {
      "icon": "python",
      "group": "ai"
    },
    {
      "icon": "pytorch",
      "group": "ai"
    },
    {
      "icon": "scikitlearn",
      "group": "ai"
    },
    {
      "icon": "huggingface",
      "group": "ai"
    },
    {
      "icon": "langchain",
      "group": "ai"
    },
    {
      "icon": "anthropic",
      "group": "ai"
    },
    {
      "icon": "rust",
      "group": "lang"
    },
    {
      "icon": "swift",
      "group": "lang"
    },
    {
      "icon": "typescript",
      "group": "lang"
    },
    {
      "icon": "javascript",
      "group": "lang"
    },
    {
      "icon": "dart",
      "group": "lang"
    },
    {
      "icon": "react",
      "group": "web"
    },
    {
      "icon": "nextdotjs",
      "group": "web"
    },
    {
      "icon": "nodedotjs",
      "group": "web"
    },
    {
      "icon": "fastapi",
      "group": "web"
    },
    {
      "icon": "flutter",
      "group": "web"
    },
    {
      "icon": "tailwindcss",
      "group": "web"
    },
    {
      "icon": "figma",
      "group": "web"
    },
    {
      "icon": "postgresql",
      "group": "infra"
    },
    {
      "icon": "supabase",
      "group": "infra"
    },
    {
      "icon": "sqlite",
      "group": "infra"
    },
    {
      "icon": "docker",
      "group": "infra"
    },
    {
      "icon": "githubactions",
      "group": "infra"
    },
    {
      "icon": "vercel",
      "group": "infra"
    },
    {
      "icon": "git",
      "group": "infra"
    },
    {
      "icon": "apple",
      "group": "infra"
    },
    {
      "icon": "txt:PM",
      "group": "craft",
      "label": "Product management"
    },
    {
      "icon": "txt:BI",
      "group": "craft",
      "label": "Business intelligence"
    },
    {
      "icon": "txt:SEO",
      "group": "craft",
      "label": "Content strategy & SEO"
    },
    {
      "icon": "txt:MLX",
      "group": "ai",
      "label": "MLX / CoreML"
    }
  ],
  "research": [
    {
      "when": "In progress",
      "title": "GNN-CADSE: a graph neural network surrogate for cost-aware chiplet design space exploration",
      "note": "Undergraduate thesis. A GNN surrogate trained on RapidChiplet data that predicts design cost, so the design space can be explored without running the full simulator each time."
    }
  ],
  "articles": []
};
