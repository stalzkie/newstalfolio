# stalfolio

Portfolio for Stalingrad "Stal" Dollosa — software engineer, mobile developer, AI engineer.
Built as a macOS desktop: a menu bar with a live Manila clock, a magnifying dock, Spotlight
search, draggable hero windows, a working terminal, and a case study behind every window.

Next.js (App Router) + Supabase. All content is database-driven and editable at `/admin`.
It ships in the light palette (`data-theme="light"` in `app/layout.tsx`), with a menu-bar
toggle for dark and auto.

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
```

`.env.local` needs:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
RESEND_API_KEY=...          # contact form
NEXT_PUBLIC_APP_URL=...     # canonical URL, used for OG/sitemap
```

## First-time database setup

1. Supabase → SQL Editor → paste `supabase/site.sql` → Run. (Also run `supabase/storage.sql`
   if the `portfolio-images` bucket does not exist yet.)
2. Go to `/admin` → **site content** → press **import**. It copies everything from the
   handover into the tables using your signed-in session — no keys needed. Tables that already
   have rows are skipped; "re-import and replace existing rows" overwrites them.

Until this is done the site still renders — every section falls back to `lib/desktop/seed.ts`.

## Editing content

Everything lives at `/admin` → **site content**:

| Tab | Table | What it drives |
|---|---|---|
| copy | `site_config` | hero, stats, currently, about, pricing, process, footer, folder labels |
| projects | `site_projects` | every card and case study |
| experience | `site_experience` | `git log --career` on the about page |
| awards | `site_awards` | award and feature stickers |
| certificates | `site_certs` | the Preview.app certificate windows |
| skills | `site_skills` | Launchpad tiles |
| research / articles | `site_research`, `site_articles` | the writing page |
| side quests | `site_side_quests` | "also built" |

### Images

Every image slot is optional and has a designed placeholder, so nothing ever looks broken:

| Slot | Field | Placeholder when empty |
|---|---|---|
| Project card | `site_projects.image_url` | generated SVG art (`art` column picks which) |
| Case study hero | `site_projects.cover_image_url` | the card image, then the SVG art |
| Profile photo | `site_config.profile_photo_url` | "me.jpg / photo goes here" in Photo Booth |
| Certificate scan | `site_certs.image_url` | the drawn seal |
| Social preview | `site_config.og_image_url` | a generated card (`app/opengraph-image.tsx`) |

Uploads go to the `portfolio-images` Supabase bucket through the cropping uploader in `/admin`.

## Interaction

The page is meant to feel like a live desktop. Everything below is disabled by the global
`prefers-reduced-motion` rule in `app/desktop.css`, and nothing is hidden when JavaScript
does not run.

Motion tokens (`--dur-1`…`--dur-4`, `--ease-*`, `--stagger`) live in `:root` and collapse to
`0ms` under reduced motion, so the whole layer switches off together. Helpers are in
`lib/desktop/motion.ts`.

| Where | What happens |
|---|---|
| Home → browse by folder | A **Finder window**: folders in the sidebar, that folder's projects as a list. Click or use the arrow keys; the window title tracks the folder. |
| Card → case study | A **View Transition** morphs the card's art into the case study banner, and back. Browsers without the API swap instantly. |
| Hero name | Letters drop in with a stagger, dodge the pointer, and hop when clicked. The full name stays in the DOM for screen readers. |
| Hero zsh window | Types and runs a commit on a loop, with a blinking cursor. Pauses offscreen and in hidden tabs. |
| Hero / feature bubbles | An iMessage typing indicator, then the message pops in |
| Stats strip | Numbers count up the first time they scroll into view |
| Every section | Fades and rises in, staggered so a grid arrives as a wave |
| Project cards and awards | A cursor-following spotlight and a slight 3D tilt; award stickers get a holographic foil. Pricing cards stay still — only their buttons react. |
| Buttons | Lift, sheen sweep, and press; primary buttons lean toward the cursor |
| Case studies | A reading progress bar in the title bar, pipeline steps that light as they pass, numbers that count up |
| Process steps | A progress line fills and each number lights as you scroll |
| Certificates | The seal stamps down and its check draws itself |
| Window title bars | Traffic lights reveal their ×, −, + glyphs on hover |
| Dock | Magnifies under the pointer, bounces when a page opens, and dots every page opened this session |
| Spotlight | Scales in on ⌘K, with ranked fuzzy matching (`lcl frg` → LocalForge) |
| Terminal | Tab completion, plus `neofetch`, `date`, `theme`, `shortcuts` |
| Launchpad | Filtering glides with FLIP instead of jumping |
| Footer | The folders spelling "stal" drop into place |
| Contact form | Invalid fields shake once |

### Keyboard

`?` opens the shortcuts sheet. `⌘K`/`Ctrl K` is Spotlight, `G` then `H/A/S/I/V/W/K` jumps to a
page, `←`/`→` walk between case studies, `T` switches theme, `Esc` closes. Shortcuts never fire
while you are typing in a field.

### Theme

The site ships light. The menu-bar toggle (or `T`) flips straight between light and dark with a
circular reveal, remembers the choice in `localStorage`, and an inline script in `app/page.tsx`
applies it before first paint so there is no flash.

It deliberately does **not** cycle through an "auto" step: on a machine set to dark, auto looks
identical to dark, so that click reads as doing nothing. `theme auto` in the terminal still sets
it explicitly, and the toggle resolves it against the system setting.

## Project demos

Every case study carries a `demo.app` window you can click through: the same screens and
navigation as the real project, with invented data. They are **deliberately colourless** —
inside `.demo` the accent and status tokens are redefined to greys, so a demo reads as a
wireframe of the system rather than a screenshot of it. No logos, no brand colour, no real
records.

Navigation mirrors each project's own repository (sidebar screens, drill-down rows), and the
interactive pieces really work: kanban cards advance a stage, lot-map cells cycle state, and
the sidebar is keyboard navigable.

Each walkthrough also has a **URL of its own at `/demo/<slug>`**, prerendered and full screen,
linked from the embedded window with "full screen ↗". Those pages are server-rendered, so they
are shareable and indexable on their own; the client only attaches the navigation.

Inside a case study the engine loads lazily, so it costs nothing on first paint. The specs are
data in `lib/desktop/demos.ts`.

### What these are not

They are walkthroughs of the navigation, not running copies of the systems. A literal copy is
not possible: four of the six full-stack systems are NDA client work, and the rest are Flutter,
React Native, Rust and Swift apps, or thin clients over backends that would render empty
without their databases and keys.

**Adding or editing one:** change the spec in `lib/desktop/demos.ts`. The block primitives are
`stats`, `table` (with drill-down), `board`, `kv`, `chart`, `grid`, `list`, `form`, `steps`,
`note` and `split`; `frame: "phone"` wraps the screens in a phone shell.

> **NDA:** the four client systems use generic industry screen names only. Never put a client,
> development, or project name in a spec — including abbreviations. The import screens named
> after developments in the real repositories are deliberately left out.

## Architecture

| Path | Role |
|---|---|
| `app/page.tsx` | server component: loads content, renders the chrome, server-renders the landing page |
| `app/desktop.css` | the design system, ported from the handover |
| `lib/desktop/render.ts` | pure string renderers for every page — no DOM, so they run on the server |
| `lib/desktop/mount.ts` | client runtime: hash router, dock, Spotlight, terminal, drag, form, Finder, scroll reveal, counters |
| `lib/desktop/motion.ts` | motion helpers: reveal, FLIP, tilt, magnetic, count-up, view transitions |
| `lib/desktop/demos.ts` | the navigable demo specs (data) |
| `lib/desktop/demo.ts` | demo renderer and wiring, lazily imported |
| `lib/desktop/art.ts` | generated SVG art, dock glyphs, medals |
| `lib/desktop/seed.ts` | fallback content, generated from `handover.md` |
| `lib/desktop/seed-rows.ts` | maps that seed onto the database columns for the import button |
| `lib/site-service.ts` | database → `SiteContent` (per-section fallback to the seed) |
| `lib/site-admin-service.ts` | writes for the admin editor |

Routes are hashes on one page: `#home`, `#about`, `#systems`, `#ai`, `#ventures`, `#writing`,
`#work`, `#contact`, and `#p-<slug>` for each case study. Unknown hashes fall back to home.

The old marketing pages (`/projects`, `/content`, `/bi`, `/contact`) are redirected in
`next.config.ts`; the private tools at `/admin` and `/posts/[slug]` are unchanged.

## Rules that must not be broken

- **NDA.** Four client projects are shown by industry only. Never put their real names,
  repos, or project names in content, slugs, window titles, alt text, or commits.
- Private repos (`hoverscan`, `ChatZillaCRM`, `bern`) show a disabled "private repository"
  chip — never a link.
- No invented facts: every number, award, and date came from the owner or his repos.

## Deploy

Vercel. `next.config.ts` carries the security headers and legacy redirects; `vercel.json`
only configures the reminder cron.
