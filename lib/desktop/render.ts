/* ─────────────────────────────────────────────────────────────────────
   Page renderers.

   Pure string functions — no DOM access — so the landing page can be
   rendered on the server and handed to the client to take over.
   `esc()` escapes every value that comes from the database.
   ───────────────────────────────────────────────────────────────────── */

import { art, medal, tileBg, glyph } from "./art";
import { ICONS } from "./icons";
import type {
  ProjectCat,
  SiteAward,
  SiteContent,
  SiteProject,
  SiteSkill,
} from "./types";

/* ─── Helpers ────────────────────────────────────────────────────── */

const ESCAPES: Record<string, string> = {
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
};

export function esc(s: unknown): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

/** Escapes, then re-enables `[text](#hash)` links written in content. */
function inline(s: string): string {
  return esc(s).replace(
    /\[([^\]]+)\]\((#[a-z0-9-]+)\)/gi,
    (_m, text, href) => '<a href="' + href + '">' + text + "</a>"
  );
}

function bar(t: string, extra = ""): string {
  return (
    '<div class="win-bar"><span class="dots"><i></i><i></i><i></i></span><span class="win-title">' +
    esc(t) + "</span>" + extra + "</div>"
  );
}

/**
 * A photo pinned to the hero, in a polaroid frame.
 *
 * The tilt sits on the frame rather than on the draggable wrapper around
 * it: a rotated element reports a wider bounding box than it occupies, so
 * tilting the wrapper would make a window jump on the first drag.
 */
function polaroid(src: string, caption: string, alt: string, tilt: string): string {
  return (
    '<figure class="polaroid" style="--tilt:' + esc(tilt) + '">' +
    '<img src="' + esc(src) + '" alt="' + esc(alt) + '" width="800" height="600" decoding="async">' +
    "<figcaption>" + esc(caption) + "</figcaption></figure>"
  );
}

function status(p: SiteProject): string {
  return '<span class="status ' + esc(p.status[0]) + '">' + esc(p.status[1]) + "</span>";
}

function kindLabel(p: SiteProject): string {
  return p.cat === "systems" ? "full-stack" : p.cat === "ai" ? "ai" : "venture";
}

export function hash7(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ("0000000" + (h >>> 0).toString(16)).slice(-7);
}

/**
 * What goes inside a project's `.screen`: an attached image when the
 * database has one, otherwise the generated SVG art as the placeholder.
 */
function shot(p: SiteProject, kind: "card" | "cover" = "card"): string {
  const src = (kind === "cover" ? p.coverImageUrl || p.imageUrl : p.imageUrl) || "";
  if (!src) return art(p.art);
  return (
    '<img class="shot" src="' + esc(src) + '" alt="' + esc(p.name) +
    '" loading="lazy" decoding="async">'
  );
}

function card(p: SiteProject): string {
  return (
    '<a class="win card" href="#p-' + esc(p.slug) + '">' + bar(p.file) +
    '<span class="screen" data-shot="' + esc(p.slug) + '"><span class="kind">' + kindLabel(p) + "</span>" + shot(p) + "</span>" +
    '<span class="cbody">' +
    (p.industry ? '<span class="ind">' + esc(p.industry) + "</span>" : "") +
    '<span class="crow"><h3>' + esc(p.name) + "</h3>" + status(p) + "</span><p>" +
    esc(p.tag) + '</p><span class="open">open case study →</span></span></a>'
  );
}

function secHead(pill: string, title: string, desc: string, id?: string): string {
  return (
    '<div class="sec-head"' + (id ? ' id="' + id + '"' : "") +
    '><span class="eyebrow-pill">' + pill + "</span><h2>" + title + "</h2>" +
    (desc ? "<p>" + desc + "</p>" : "") + "</div>"
  );
}

function skillTile(s: SiteSkill): string {
  let label: string;
  let inner: string;
  if (s.icon.indexOf("txt:") === 0) {
    label = s.label || s.icon.slice(4);
    inner = '<span class="txt">' + esc(s.icon.slice(4)) + "</span>";
  } else {
    const ic = ICONS[s.icon];
    label = s.label || (ic ? ic[0] : s.icon);
    inner = ic
      ? '<svg viewBox="0 0 24 24" role="img" aria-label="' + esc(label) + '"><path d="' + ic[1] + '"/></svg>'
      : '<span class="txt">' + esc(label.slice(0, 2)) + "</span>";
  }
  return (
    '<div class="app" data-g="' + esc(s.group) + '"><div class="tile">' + inner +
    "</div><span>" + esc(label) + "</span></div>"
  );
}

function awardCard(a: SiteAward): string {
  const inner =
    medal(a.kind) + '<span class="kind">' + (a.kind === "feature" ? "feature" : "award") +
    " · " + esc(a.org) + "</span><h3>" + esc(a.title) + "</h3><p>" + esc(a.note) + "</p>";
  return a.href
    ? '<a class="award' + (a.kind === "feature" ? " feature-k" : "") + '" href="' + esc(a.href) +
      '" style="text-decoration:none; color:var(--ink)">' + inner + "</a>"
    : '<div class="award">' + inner + "</div>";
}

function byCat(c: SiteContent, cat: ProjectCat): SiteProject[] {
  return c.projects.filter((p) => p.cat === cat);
}

/**
 * A Finder window: folders down the left, that folder's projects as a
 * list on the right. The sidebar is a real tablist — `wireFinder()` in
 * mount.ts adds click and arrow-key handling.
 */
export function finder(c: SiteContent): string {
  const cats: ProjectCat[] = ["systems", "ai", "ventures"];

  const side = cats
    .map((cat, i) => {
      const meta = c.config.cats[cat];
      const n = byCat(c, cat).length;
      return (
        '<button class="tab" role="tab" id="ftab-' + cat + '" aria-controls="fp-' + cat +
        '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) +
        '" data-tab="' + cat + '" data-path="' + esc(meta.short) + '"><span class="mini"></span>' +
        esc(meta.short) + '<span class="n">' + n + "</span></button>"
      );
    })
    .join("");

  const panels = cats
    .map((cat, i) => {
      const meta = c.config.cats[cat];
      const list = byCat(c, cat);
      const rows = list
        .map(
          (p) =>
            '<a class="frow" href="#p-' + esc(p.slug) + '"><span class="fic"></span>' +
            '<span class="ftxt"><b>' + esc(p.name) + "</b><span>" + esc(p.tag) + "</span></span>" +
            '<span class="fend">' + status(p) + '<span class="far">open →</span></span></a>'
        )
        .join("");
      return (
        '<div role="tabpanel" id="fp-' + cat + '" aria-labelledby="ftab-' + cat +
        '" class="finder-panel"' + (i ? " hidden" : "") +
        ' style="display:flex; flex-direction:column; gap:18px">' +
        '<div class="panel-head"><span class="wk">~/stal/' + esc(meta.short) + " — " +
        list.length + ' item' + (list.length === 1 ? "" : "s") + "</span><h3>" +
        esc(meta.title) + "</h3><p>" + esc(meta.desc) + "</p></div>" +
        '<div class="finder-rows">' + rows + "</div>" +
        '<a class="btn btn-ghost" href="#' + cat + '" style="align-self:flex-start">open the folder →</a>' +
        "</div>"
      );
    })
    .join("");

  return (
    '<div class="win" id="finder">' +
    '<div class="win-bar"><span class="dots"><i></i><i></i><i></i></span><span class="win-title" id="finderTitle">~/stal/' +
    esc(c.config.cats.systems.short) + "</span></div>" +
    '<div class="finder">' +
      '<div class="finder-side" role="tablist" aria-label="Project folders">' +
        '<span class="lbl">Favorites</span>' + side +
      "</div>" +
      '<div class="finder-main">' + panels + "</div>" +
    "</div></div>"
  );
}

/* ─── Pages ──────────────────────────────────────────────────────── */

const WORKED_WITH = [
  { name: "Hoversight", file: "/company-logos/hoversight.png" },
  { name: "Acqron", file: "/company-logos/acqron.png" },
  { name: "Modern Institute of Business", file: "/company-logos/mib.png" },
  { name: "blvd", file: "/company-logos/blvd.png" },
];

export function home(c: SiteContent): string {
  const cfg = c.config;
  const feat = cfg.featured
    .map((s) => c.projects.find((p) => p.slug === s))
    .filter((p): p is SiteProject => Boolean(p));
  const bubbles = cfg.featuredBubbles;
  /* H1: one span per letter so each can drop in and dodge the pointer.
     The whole name stays available to assistive tech via .sr. */
  const nameHtml =
    '<span class="sr">' + esc(cfg.heroName) + "</span>" +
    cfg.heroName
      .split(/(\s+)/)
      .map((word, w) =>
        /^\s+$/.test(word)
          ? "<br>"
          : '<span class="wd" aria-hidden="true">' +
            word
              .split("")
              .map(
                (ch, i) =>
                  '<span class="ch" style="--i:' + (w * 10 + i) + '">' + esc(ch) + "</span>"
              )
              .join("") +
            "</span>"
      )
      .join("");

  return (
    '<div class="hero" id="hero">' +
      '<div class="float" data-drag style="left:0; top:20px; width:196px">' +
        polaroid(
          "/hackathon.jpeg",
          "ai.deas 2025",
          "The HiWay team holding up certificates and a trophy at the AI.DEAS 2025 hackathon.",
          "-3deg"
        ) + "</div>" +
      '<div class="float kao" data-drag style="left:14px; top:214px">( •_•)&gt;⌐■-■</div>' +
      '<a class="float folder" data-drag draggable="false" style="left:20px; top:258px" href="#systems"><span class="folder-ico"></span><span>full-stack</span></a>' +
      '<div class="float sticker" data-drag style="left:122px; top:240px"><b>HELLO</b><small>my name is</small><span>stal</span></div>' +
      '<div class="float" data-drag style="left:0; top:350px"><span class="bubble" id="heroBubble" style="max-width:220px">' + esc(cfg.heroBubble) + "</span></div>" +
      '<div class="float" data-drag style="right:0; top:20px; width:196px">' +
        polaroid(
          "/pitching.jpeg",
          "startup challenge x",
          "The HiWay team on stage with certificates of recognition at the Philippine Startup Challenge X regional finals.",
          "3.5deg"
        ) + "</div>" +
      '<div class="float kao" data-drag style="right:20px; top:208px">ᕦ(ò_óˇ)ᕤ</div>' +
      '<a class="float folder" data-drag draggable="false" style="right:150px; top:200px" href="#ai"><span class="folder-ico"></span><span>ai</span></a>' +
      '<div class="float" data-drag style="right:0; top:290px; width:220px"><div class="win">' + bar("now.txt") +
        '<div class="term" style="background:var(--win); color:var(--ink)">' +
        cfg.nowLines.map((l) => "<div>→ " + esc(l) + "</div>").join("") +
        "</div></div></div>" +
      '<div class="hero-center">' +
        '<span class="eyebrow-pill">' + esc(cfg.heroEyebrow) + "</span>" +
        "<h1>" + nameHtml + "</h1>" +
        '<p class="sub">' + esc(cfg.heroSub) + "</p>" +
        '<div class="btns"><a class="btn btn-primary" href="#systems"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="1.5" y="3" width="13" height="10" rx="2"/><path d="M1.5 6h13"/></svg>see the work</a><a class="btn btn-ghost" href="#about">about me</a></div>' +
        '<p class="fine">' + esc(cfg.heroFine) + "</p>" +
      "</div>" +
      '<span class="drag-hint">psst: the windows are draggable</span>' +
      '<div class="phone-strip"><a class="folder" href="#systems"><span class="folder-ico"></span><span>full-stack</span></a><a class="folder" href="#ai"><span class="folder-ico"></span><span>ai</span></a><a class="folder" href="#ventures"><span class="folder-ico"></span><span>ventures</span></a><a class="folder" href="#about"><span class="folder-ico"></span><span>about</span></a></div>' +
    "</div>" +

    (cfg.stats.length
      ? '<div class="win" style="margin-top:12px">' + bar(cfg.statsFile) + '<div class="stats">' +
        cfg.stats.map((s) => '<div class="stat"><b>' + esc(s.value) + "</b><span>" + esc(s.label) + "</span></div>").join("") +
        "</div></div>"
      : "") +

    '<div class="win" style="margin-top:12px">' + bar("worked-with.logos") +
      '<div class="logowall"><span class="logowall-label">worked with</span>' +
      WORKED_WITH.map((w) =>
        '<img src="' + esc(w.file) + '" alt="' + esc(w.name) + '" loading="lazy">'
      ).join("") +
      "</div></div>" +

    "<section>" + secHead("currently", esc(cfg.currentlyHeading), esc(cfg.currentlyDesc)) +
      '<div class="grid-2">' +
        cfg.currently.map((n) =>
          '<div class="win">' + bar(n.file) + '<div class="win-body now"><span class="role">' +
          esc(n.role) + "</span><h3>" + esc(n.title) + '</h3><p class="muted">' + inline(n.body) + "</p></div></div>"
        ).join("") +
      "</div>" +

    "<section>" + secHead("selected work", "things i've shipped", "") +
      feat.map((p, i) =>
        '<div class="feature' + (i % 2 ? " flip" : "") + '"><div class="side">' +
        (bubbles[i] ? '<span class="bubble left">' + esc(bubbles[i]) + "</span>" : "") +
        "<h3>" + esc(p.name) + '</h3><p class="muted">' + esc(p.tag) + '</p><div class="chips">' +
        p.stack.slice(0, 4).map((s) => '<span class="chip">' + esc(s) + "</span>").join("") +
        '</div><a class="link" href="#p-' + esc(p.slug) + '">read the case study →</a></div>' +
        '<a class="win card" href="#p-' + esc(p.slug) + '" aria-label="' + esc(p.name) + ' case study">' +
        bar(p.file) + '<span class="screen" style="aspect-ratio:16/8">' + shot(p) + "</span></a></div>"
      ).join("") +
    "</section>" +

    '<section style="padding-top:24px">' +
      secHead("everything", "browse by folder", "Click through the folders, or use the arrow keys.") +
      finder(c) +
    "</section>" +

    (c.awards.length
      ? "<section>" + secHead("recognition", "awards &amp; features", "") +
        '<div class="stickers">' + c.awards.map(awardCard).join("") + "</div></section>"
      : "") +

    "<section>" +
      '<div class="win"><div class="win-body" style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:18px; padding:28px">' +
        '<div style="display:flex; flex-direction:column; gap:6px"><h3 style="font-size:24px; margin:0">' +
        esc(cfg.ctaHeading) + '</h3><p class="muted">' + esc(cfg.ctaSub) + "</p></div>" +
        '<div class="btns"><a class="btn btn-primary" href="#contact">start a project</a><a class="btn btn-ghost" href="#work">see pricing</a></div>' +
      "</div></div>" +
    "</section>"
  );
}

export function about(c: SiteContent): string {
  const cfg = c.config;
  const photo = cfg.profilePhoto
    ? '<img src="' + esc(cfg.profilePhoto) + '" alt="' + esc(cfg.heroName) + '">'
    : '<div class="ph"><svg width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden="true"><circle cx="48" cy="36" r="17" stroke="rgba(255,255,255,.55)" stroke-width="2"/><path d="M16 88c4-18 17-28 32-28s28 10 32 28" stroke="rgba(255,255,255,.55)" stroke-width="2"/></svg><span>me.jpg<br>photo goes here</span></div><span class="ring"></span>';

  return (
    '<section style="padding-top:56px">' +
      '<div class="about-top">' +
        '<div class="win">' + bar("Photo Booth") + '<div class="booth">' + photo +
        '</div><div class="booth-bar"><span>effects</span><span class="shutter" aria-hidden="true"></span><span>4:5</span></div></div>' +
        '<div style="display:flex; flex-direction:column; gap:18px; min-width:0">' +
          '<div class="bio"><span class="eyebrow-pill" style="align-self:flex-start">overview</span><h1>' +
            esc(cfg.bioHeading) + "</h1>" +
            cfg.bio.map((p, i) => (i === 0 ? "<p>" + esc(p) + "</p>" : '<p class="muted">' + esc(p) + "</p>")).join("") +
          "</div>" +
          '<div class="facts">' +
            cfg.facts.map((f) => "<div><small>" + esc(f[0]) + "</small>" + esc(f[1]) + "</div>").join("") +
            '<div><small>contact</small><span class="mono" style="font-size:12.5px; user-select:all">' +
            esc(cfg.email) + "</span></div>" +
          "</div>" +
          '<div class="btns"><a class="btn btn-primary" href="#contact">work with me</a><a class="btn btn-ghost" href="' +
          esc(cfg.githubUrl) + '" target="_blank" rel="noopener">github ↗</a></div>' +
        "</div>" +
      "</div>" +
    "</section>" +

    '<section style="padding-top:48px">' + secHead("try it", "ask my terminal", "Type a command, or tap one below.") +
      '<div class="win" style="max-width:760px; margin:0 auto">' + bar("stal@portfolio: ~") +
        '<div class="tty" id="tty" aria-live="polite"><div class="c">Last login: today on ttys001. Type <b>help</b> to see commands.</div></div>' +
        '<div class="tty" style="height:auto; padding-top:0; padding-bottom:12px"><label class="tty-in"><span class="p">stal ~ %</span><span class="sr">command</span><input id="ttyIn" autocomplete="off" spellcheck="false" aria-label="Terminal command"></label></div>' +
        '<div class="tty-chips">' +
        ["help", "whoami", "projects", "stack", "awards", "ls", "sudo hire stal"]
          .map((cmd) => '<button type="button" data-cmd="' + cmd + '">' + cmd + "</button>").join("") +
        "</div>" +
      "</div>" +
    "</section>" +

    (c.experience.length
      ? "<section>" + secHead("experience", "git log --career", "The work, newest first. Click an entry to expand it.", "experience") +
        '<div class="win">' + bar("~/career — git log") + '<div class="log">' +
        c.experience.map((x, i) =>
          '<details class="commit' + (x.head ? " head" : "") + '"' + (i < 2 ? " open" : "") +
          '><summary><span class="node"></span><span class="hash">' + hash7(x.title + x.org) +
          '</span><span class="what"><b>' + esc(x.title) +
          (i === 0 ? '<span class="ref">HEAD → main</span>' : "") + "</b><span>" + esc(x.org) +
          '</span></span><span class="when">' + esc(x.when) + '</span><span class="tog"></span></summary><div class="body"><ul class="clean">' +
          x.body.map((b) => "<li>" + esc(b) + "</li>").join("") + "</ul></div></details>"
        ).join("") + "</div></div>" + "</section>"
      : "") +

    (c.skills.length
      ? "<section>" + secHead("skills", "launchpad", "The tools I reach for. Filter by type.", "skills") +
        '<div style="display:flex; justify-content:center; margin-bottom:16px"><div class="seg" id="padSeg" role="group" aria-label="Filter skills">' +
        ([["all", "all"], ["ai", "ai & data"], ["lang", "languages"], ["web", "web & apps"], ["infra", "infra & tools"], ["craft", "product"]] as [string, string][])
          .map((f, i) => '<button type="button" data-f="' + f[0] + '" aria-pressed="' + (i === 0) + '">' + f[1] + "</button>").join("") +
        "</div></div>" +
        '<div class="win">' + bar("Launchpad") + '<div class="pad" id="pad">' +
        c.skills.map(skillTile).join("") + "</div></div>" + "</section>"
      : "") +

    (c.awards.length
      ? "<section>" + secHead("recognition", "awards &amp; features", "", "awards") +
        '<div class="stickers">' + c.awards.map(awardCard).join("") + "</div></section>"
      : "") +

    (c.certs.length
      ? "<section>" + secHead("credentials", "certificates", "", "certificates") +
        c.certs.map((cert) => {
          const seal = cert.imageUrl
            ? '<img class="shot seal" src="' + esc(cert.imageUrl) + '" alt="' + esc(cert.title) + '" loading="lazy" decoding="async">'
            : '<svg class="seal" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="38" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2" stroke-dasharray="4 3"/><circle cx="42" cy="42" r="26" fill="var(--accent)"/><path d="M31 43l7 7 15-16" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
          return (
            '<div class="win" style="max-width:760px; margin:0 auto">' + bar("Preview — certificate.pdf") +
            '<div class="cert">' + seal +
            '<div style="display:flex; flex-direction:column; gap:6px; min-width:0"><small>' + esc(cert.org) +
            "</small><h3>" + esc(cert.title) + '</h3><p class="muted" style="font-size:14px">' + esc(cert.note) +
            "</p></div></div></div>"
          );
        }).join("") + "</section>"
      : "") +

    (c.side.length
      ? "<section>" + secHead("side quests", "also built", "") +
        '<div class="grid-2">' +
        c.side.map((s) =>
          '<div class="win">' + bar(s.title.toLowerCase().replace(/\s+/g, "-") + ".md") +
          '<div class="win-body"><h3>' + esc(s.title) + '</h3><p class="muted">' + esc(s.note) + "</p></div></div>"
        ).join("") + "</div>" + "</section>"
      : "")
  );
}

export function listPage(c: SiteContent, cat: ProjectCat): string {
  const meta = c.config.cats[cat];
  const list = byCat(c, cat);
  return (
    '<section style="padding-top:56px">' +
    secHead("~/" + esc(meta.short), esc(meta.title), esc(meta.desc)) +
    '<div class="cards">' + list.map(card).join("") + "</div></section>"
  );
}

export function ventures(c: SiteContent): string {
  const meta = c.config.cats.ventures;
  return (
    '<section style="padding-top:56px">' +
    secHead("~/ventures", esc(meta.title), esc(meta.desc)) +
    byCat(c, "ventures").map((p, i) =>
      '<div class="feature' + (i % 2 ? " flip" : "") + '"><div class="side"><span class="eyebrow-pill">' +
      esc((p.role || "").replace(/\.$/, "").toLowerCase()) + "</span><h3>" + esc(p.name) +
      '</h3><p class="muted">' + esc(p.tag) + "</p>" + status(p) +
      '<div class="btns"><a class="btn btn-ghost" href="#p-' + esc(p.slug) + '">read more</a>' +
      (p.live ? '<a class="btn btn-primary" href="' + esc(p.live) + '" target="_blank" rel="noopener">visit site ↗</a>' : "") +
      "</div></div>" +
      '<a class="win card" href="#p-' + esc(p.slug) + '" aria-label="' + esc(p.name) + '">' + bar(p.file) +
      '<span class="screen" style="aspect-ratio:16/8">' + shot(p) + "</span></a></div>"
    ).join("") + "</section>"
  );
}

export function detail(c: SiteContent, p: SiteProject): string {
  const meta = c.config.cats[p.cat];
  const list = byCat(c, p.cat);
  const i = list.indexOf(p);
  const prev = list[(i - 1 + list.length) % list.length];
  const next = list[(i + 1) % list.length];

  let links = "";
  if (p.live) links += '<a class="btn btn-primary" href="' + esc(p.live) + '" target="_blank" rel="noopener">visit live site ↗</a>';
  if (p.repo && !p.priv) links += '<a class="btn btn-ghost" href="' + esc(p.repo) + '" target="_blank" rel="noopener">view on github ↗</a>';
  if (p.repo && p.priv) links += '<span class="btn btn-ghost" aria-disabled="true" title="This repository is private">private repository</span>';
  if (p.nda) links += '<span class="btn btn-ghost" aria-disabled="true" title="Client name withheld under NDA">client work · name withheld under NDA</span>';

  let main = "";
  if (p.award)
    main += '<div class="award-note">' + medal("award").replace('class="medal"', 'class="medal" width="28" height="28"') +
      "<span><b>" + esc(p.award) + "</b></span></div>";
  if (p.pending) {
    main += '<div class="pending"><span class="k">soon</span><span>A full case study for ' + esc(p.name) +
      " is being written up: the client's problem, what the system does, how it's built, and results. Want details now? <a href=\"#contact\">Ask me about it.</a></span></div>";
  } else {
    if (p.summary) main += "<div><h2>// overview</h2><p>" + esc(p.summary) + "</p></div>";
    /* The navigable demo is mounted here by lib/desktop/demo.ts, which
       is imported lazily the first time a case study with one opens. */
    main +=
      '<div id="demoSlot" data-demo-slug="' + esc(p.slug) +
      '"><h2>// try it</h2><p class="muted" style="font-size:13.5px">Loading the demo…</p></div>';
    if (p.features && p.features.length)
      main += '<div><h2>// what it does</h2><ul class="clean">' +
        p.features.map((f) => "<li>" + esc(f) + "</li>").join("") + "</ul></div>";
    if (p.flow && p.flow.length)
      main += '<div><h2>// how it works</h2><div class="flow">' +
        p.flow.map((f, k) => "<div>" + (k ? '<span class="arrow">↓ </span>' : '<span class="arrow">· </span>') + esc(f) + "</div>").join("") +
        "</div></div>";
    if (p.numbers && p.numbers.length)
      main += '<div><h2>// by the numbers</h2><div class="nums">' +
        p.numbers.map((n) => '<div class="num"><b>' + esc(n[0]) + "</b><span>" + esc(n[1]) + "</span></div>").join("") +
        "</div></div>";
  }

  let side = "";
  if (p.industry)
    side += '<div class="side-box"><h4>client</h4><p>' + esc(p.industry) +
      (p.nda ? '<br><span class="muted" style="font-size:12.5px">Name withheld under NDA.</span>' : "") + "</p></div>";
  if (p.role) side += '<div class="side-box"><h4>my role</h4><p>' + esc(p.role) + "</p></div>";
  if (p.stack && p.stack.length)
    side += '<div class="side-box"><h4>stack</h4><div class="chips">' +
      p.stack.map((s) => '<span class="chip">' + esc(s) + "</span>").join("") + "</div></div>";
  if (p.install)
    side += '<div class="side-box"><h4>try it</h4><code class="mono" style="font-size:12.5px">' + esc(p.install) + "</code></div>";
  side += '<div class="side-box"><h4>status</h4>' + status(p) + "</div>";
  side += '<div class="side-box"><h4>need something like this?</h4><a href="#contact" style="font-weight:500">start a project →</a></div>';

  return (
    '<section style="padding-top:40px">' +
      '<a class="crumb" href="#' + p.cat + '">← ~/' + esc(meta.short) + "</a>" +
      '<article class="win" id="caseWin">' +
        bar("~/" + meta.short + "/" + p.file, '<span class="read-bar" id="readBar" aria-hidden="true"></span>') +
        '<div class="screen wide" data-shot="' + esc(p.slug) + '" style="aspect-ratio:21/5">' + shot(p, "cover") + "</div>" +
        '<div class="detail-head"><span class="eyebrow-pill" style="align-self:flex-start">' + esc(meta.label) +
        (p.industry ? " · " + esc(p.industry.toLowerCase()) : "") + "</span><h1>" + esc(p.name) +
        '</h1><p class="tag">' + esc(p.tag) + '</p><div class="btns">' + links + "</div></div>" +
        '<div class="detail-grid"><div class="detail-main">' + main + '</div><aside class="detail-side">' + side + "</aside></div>" +
      "</article>" +
      '<nav class="pager" aria-label="More projects"><a href="#p-' + esc(prev.slug) + '"><span>← previous</span>' +
      esc(prev.name) + '</a><a class="next" href="#p-' + esc(next.slug) + '"><span>next →</span>' + esc(next.name) + "</a></nav>" +
    "</section>"
  );
}

export function writing(c: SiteContent): string {
  const arts = c.articles.length
    ? '<div class="rows">' + c.articles.map((a) => {
        /* A post on this site opens in place; an outside byline opens away. */
        const url = a.url || "#";
        const away = /^https?:/i.test(url);
        return (
          '<a class="rowi" href="' + esc(url) + '"' +
          (away ? ' target="_blank" rel="noopener"' : "") + '><span class="when">' +
          esc(a.when) + "</span><span><b>" + esc(a.title) + "</b><p>" + esc(a.note) +
          '</p></span><span class="muted">' + (away ? "↗" : "→") + "</span></a>"
        );
      }).join("") + "</div>"
    : '<div class="empty"><span class="kao">(｡•̀ᴗ-)✧</span><b>articles are on their way</b><p class="muted" style="max-width:46ch">Essays on AI engineering, product, and content strategy will be listed here.</p></div>';

  return (
    '<section style="padding-top:56px">' +
    secHead("~/writing", "articles &amp; research", "Notes from building AI systems, managing technical products, and a background in content strategy.") +
    (c.research.length
      ? '<div class="win">' + bar("research.bib") + '<div class="rows">' +
        c.research.map((r) =>
          '<div class="rowi"><span class="when">' + esc(r.when) + "</span><span><b>" + esc(r.title) +
          "</b><p>" + esc(r.note) + "</p></span><span></span></div>"
        ).join("") + "</div></div>"
      : "") +
    '<div class="win" style="margin-top:18px">' + bar("articles.feed") + arts + "</div>" +
    "</section>"
  );
}

const PLATFORMS = ["Website", "Web app", "iOS app", "Android app", "Backend / API", "AI / automation"];
const FEATURES = [
  "User login / accounts", "Payments / billing", "Admin dashboard",
  "Notifications", "File uploads", "Search",
  "Reports / exports", "Chat / messaging", "Third-party integrations",
  "AI / LLM features", "Multi-language", "Not sure yet",
];

export function work(c: SiteContent): string {
  const cfg = c.config;
  return (
    '<section style="padding-top:56px">' +
    secHead("~/work-with-me", "work with me", "Clear price ranges up front. You get a written scope and quote after a short call.") +
      '<div class="grid-3">' +
      cfg.tiers.map((t) =>
        '<div class="win price' + (t.hl ? " hl" : "") + '">' + bar(t.file) +
        '<div class="win-body"><h3 style="margin:0">' + esc(t.name) + '</h3><div class="amt">' +
        (t.from ? "<small>from </small>" : "") + esc(t.amt) + (t.from ? "<small> onwards</small>" : "") +
        '</div><ul class="clean">' + t.items.map((x) => "<li>" + esc(x) + "</li>").join("") +
        '</ul><a class="btn ' + (t.hl ? "btn-primary" : "btn-ghost") + '" href="#contact" data-service="' +
        esc(t.name) + '">get a quote</a></div></div>'
      ).join("") + "</div>" +
      '<p class="muted" style="text-align:center; font-size:13.5px; margin-top:14px">' + esc(cfg.pricingNote) + "</p>" +
    "</section>" +
    "<section>" + secHead("process", "how a project runs", "") +
      '<ol class="steps">' +
      cfg.steps.map((s) => "<li><b>" + esc(s.title) + "</b><span>" + esc(s.note) + "</span></li>").join("") +
      "</ol>" +
    "</section>" +
    '<section id="contact">' + secHead("contact", "tell me what you're building", "A few details are enough to start.") +
      '<div class="win" style="max-width:760px; margin:0 auto">' + bar("new-message.eml") + '<div class="win-body">' +
        '<div class="seg" id="contactSeg" role="tablist" aria-label="Contact mode" style="margin-bottom:18px">' +
          '<button type="button" data-mode="message" aria-pressed="true">send me a message</button>' +
          '<button type="button" data-mode="quote" aria-pressed="false">get a quote</button>' +
        "</div>" +
        '<form class="form" id="contactForm" novalidate>' +
          '<div class="field"><label for="f-name">Full name</label><input id="f-name" autocomplete="name" required><span class="err" id="e-name"></span></div>' +
          '<div class="field"><label for="f-email">Email</label><input id="f-email" type="email" autocomplete="email" required><span class="err" id="e-email"></span></div>' +
          '<div class="field full" data-mode-field="message"><label for="f-subject">Subject</label><input id="f-subject" placeholder="What\'s on your mind?"></div>' +
          '<div class="field" data-mode-field="quote" hidden><label for="f-company">Company <span class="muted">(if any)</span></label><input id="f-company" autocomplete="organization"></div>' +
          '<div class="field" data-mode-field="quote" hidden><label for="f-phone">Phone / WhatsApp</label><input id="f-phone" autocomplete="tel"></div>' +
          '<div class="field full" data-mode-field="quote" hidden><label for="f-project">Project name</label><input id="f-project"></div>' +
          '<div class="field full"><label for="f-msg" id="f-msg-label">Message</label><textarea id="f-msg" placeholder="What\'s on your mind?" required></textarea><span class="err" id="e-msg"></span></div>' +
          '<div class="field full" data-mode-field="quote" hidden><label>Platform</label><div class="check-grid">' +
          PLATFORMS.map((p) =>
            '<label class="check"><input type="checkbox" data-platform="' + esc(p) + '">' + esc(p) + "</label>"
          ).join("") + "</div></div>" +
          '<div class="field full" data-mode-field="quote" hidden><label>Features <span class="muted">(tick everything you need)</span></label><div class="check-grid">' +
          FEATURES.map((f) =>
            '<label class="check"><input type="checkbox" data-feature="' + esc(f) + '">' + esc(f) + "</label>"
          ).join("") + "</div></div>" +
          '<div class="field full" data-mode-field="quote" hidden><label for="f-other">Other features, or anything above you want explained</label><textarea id="f-other"></textarea></div>' +
          '<div class="field" data-mode-field="quote" hidden><label for="f-deadline">When do you need it?</label><select id="f-deadline"><option>ASAP</option><option>Within 1 month</option><option>1–3 months</option><option>3–6 months</option><option>No rush / not sure</option></select></div>' +
          '<div class="field" data-mode-field="quote" hidden><label for="f-budget">Budget range</label><select id="f-budget"><option>$500–$2,000</option><option>$2,000–$5,000</option><option>$5,000–$10,000</option><option>$10,000+</option><option>Not sure yet</option></select></div>' +
          '<div class="form-foot"><small>Or email me directly at <span class="mono" style="user-select:all">' +
          esc(cfg.email) + '</span></small><button class="btn btn-primary" type="submit" id="contactSubmit">send message</button></div>' +
        "</form>" +
        '<div id="sent" hidden></div>' +
      "</div></div>" +
    "</section>"
  );
}

/* ─── Dock and Spotlight ─────────────────────────────────────────── */

export const DOCK: [string, string][] = [
  ["home", "home"], ["about", "about"], ["systems", "full-stack"],
  ["ai", "ai engineering"], ["ventures", "ventures"], ["writing", "writing"],
  ["work", "work with me"],
];

export function dockHtml(active: string, githubUrl: string): string {
  return (
    DOCK.map((d) =>
      '<a href="#' + d[0] + '" class="' + (d[0] === active ? "on" : "") + '" aria-label="' + d[1] + '"' +
      (d[0] === active ? ' aria-current="page"' : "") + '><span class="ic" style="' + tileBg(d[0]) + '">' +
      glyph(d[0]) + '</span><span class="tip">' + d[1] + "</span></a>"
    ).join("") +
    '<span class="sep extra" aria-hidden="true"></span><button type="button" class="extra" id="dockSearch" aria-label="search"><span class="ic" style="' +
    tileBg("search") + '">' + glyph("search") + '</span><span class="tip">search ⌘K</span></button>' +
    '<a class="extra" href="' + esc(githubUrl) + '" target="_blank" rel="noopener" aria-label="github"><span class="ic" style="' +
    tileBg("github") + '">' + glyph("github") + '</span><span class="tip">github</span></a>'
  );
}

export interface IndexItem { t: string; s: string; h: string; k: string; x?: string }

export function searchIndex(c: SiteContent): IndexItem[] {
  const pages: IndexItem[] = [
    { t: "Home", s: "Landing page", h: "#home", k: "home" },
    { t: "About", s: "Overview, terminal, skills", h: "#about", k: "about" },
    { t: "Experience", s: "Career log", h: "#experience", k: "about" },
    { t: "Awards & features", s: "Recognition", h: "#awards", k: "about" },
    { t: "Certificates", s: "Credentials", h: "#certificates", k: "about" },
    { t: "Skills", s: "Launchpad", h: "#skills", k: "about" },
    { t: "Full-stack systems", s: "Folder", h: "#systems", k: "systems" },
    { t: "AI engineering", s: "Folder", h: "#ai", k: "ai" },
    { t: "Ventures", s: "Folder", h: "#ventures", k: "ventures" },
    { t: "Articles & research", s: "Writing", h: "#writing", k: "writing" },
    { t: "Pricing", s: "Work with me", h: "#work", k: "work" },
    { t: "Contact", s: "Send a message", h: "#contact", k: "work" },
  ];
  return pages.concat(
    c.projects.map((p) => ({
      t: p.name,
      s: c.config.cats[p.cat].label + " · " + p.tag,
      h: "#p-" + p.slug,
      k: p.cat,
      x: (p.stack || []).join(" "),
    }))
  );
}

/* ─── Footer word ────────────────────────────────────────────────── */

const G: Record<string, string[]> = {
  s: [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
  t: ["..#..", "..#..", "#####", "..#..", "..#..", "..#..", "...##"],
  a: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  l: [".##..", "..#..", "..#..", "..#..", "..#..", "..#..", ".###."],
};

export function foldWord(word: string): { cols: number; html: string } {
  const letters = word.split("").filter((ch) => G[ch]);
  let out = "";
  for (let r = 0; r < 7; r++)
    for (let w = 0; w < letters.length; w++) {
      const row = G[letters[w]][r];
      for (let c = 0; c < 5; c++) out += row[c] === "#" ? "<i></i>" : "<b></b>";
      if (w < letters.length - 1) out += "<b></b>";
    }
  return { cols: letters.length * 5 + letters.length - 1, html: out };
}
