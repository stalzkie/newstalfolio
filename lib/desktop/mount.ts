/* ─────────────────────────────────────────────────────────────────────
   Client runtime: hash router, dock magnification, Spotlight, draggable
   hero windows, the terminal, the Launchpad filter, the contact form,
   the Manila clock, the welcome toast, and the footer folder word.

   `mountDesktop()` wires all of it to DOM that already exists (rendered
   by app/page.tsx) and returns a teardown function for React.
   ───────────────────────────────────────────────────────────────────── */

import { glyph, tileBg } from "./art";
import {
  countUp,
  flip,
  swallow,
  magnetic,
  onVisible,
  tilt,
  trackPointer,
  whileVisible,
  withViewTransition,
} from "./motion";
import {
  about,
  detail,
  dockHtml,
  esc,
  foldWord,
  hash7,
  home,
  listPage,
  searchIndex,
  ventures,
  work,
  writing,
  type IndexItem,
} from "./render";
import type { ProjectCat, SiteContent } from "./types";

const SECTION_ROUTES: Record<string, string> = {
  contact: "work", experience: "about", awards: "about",
  certificates: "about", skills: "about",
};

export interface MountOptions {
  /** Route the server already rendered into #app, so we skip re-rendering it. */
  initialRoute?: string;
}

export function mountDesktop(
  content: SiteContent,
  opts: MountOptions = {}
): () => void {
  const cfg = content.config;
  const cleanups: (() => void)[] = [];

  const $ = (id: string) => document.getElementById(id);
  const app = $("app");
  const dock = $("dock");
  const spot = $("spot");
  const spotIn = $("spotInput") as HTMLInputElement | null;
  const spotList = $("spotList");
  if (!app || !dock || !spot || !spotIn || !spotList) return () => {};

  const on = <K extends keyof HTMLElementEventMap>(
    el: EventTarget,
    type: K | string,
    fn: EventListenerOrEventListenerObject,
    opt?: AddEventListenerOptions
  ) => {
    el.addEventListener(type as string, fn, opt);
    cleanups.push(() => el.removeEventListener(type as string, fn, opt));
  };

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const timers: ReturnType<typeof setTimeout>[] = [];
  cleanups.push(() => timers.forEach(clearTimeout));
  const fine = matchMedia("(pointer:fine)").matches;
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

  /* ─── Router ───────────────────────────────────────────────────── */

  let current = opts.initialRoute || "";
  let first = true;

  function route() {
    let h = (location.hash || "#home").slice(1);
    let html = "";
    let nav = "";
    let scrollTo: string | null = null;

    if (SECTION_ROUTES[h]) {
      scrollTo = h;
      h = SECTION_ROUTES[h];
    }

    if (h.indexOf("p-") === 0) {
      const p = content.projects.find((x) => "p-" + x.slug === h);
      if (p) {
        html = detail(content, p);
        nav = p.cat;
        document.title = p.name + " · Stal Dollosa";
      }
    } else if (h === "systems" || h === "ai") {
      html = listPage(content, h as ProjectCat);
      nav = h;
      document.title = cfg.cats[h as ProjectCat].title + " · Stal Dollosa";
    } else if (h === "ventures") {
      html = ventures(content);
      nav = h;
      document.title = "Ventures · Stal Dollosa";
    } else if (h === "writing") {
      html = writing(content);
      nav = h;
      document.title = "Writing · Stal Dollosa";
    } else if (h === "work") {
      html = work(content);
      nav = "work";
      document.title = "Work with me · Stal Dollosa";
    } else if (h === "about") {
      html = about(content);
      nav = "about";
      document.title = "About · Stal Dollosa";
    }

    if (!html) {
      html = home(content);
      nav = "home";
      document.title = "Stal Dollosa · Software, Mobile & AI Engineer";
      h = "home";
    }

    if (current !== h || first) {
      /* G1: tag the art that should morph, while the old DOM is still
         there, then let the View Transition snapshot it. Only ever one
         element carries the name, so names can never collide. */
      const toSlug = h.indexOf("p-") === 0 ? h.slice(2) : "";
      const fromSlug = current.indexOf("p-") === 0 ? current.slice(2) : "";
      const morph = toSlug || fromSlug;
      if (morph && current !== h) {
        const source = app!.querySelector<HTMLElement>('[data-shot="' + morph + '"]');
        if (source) source.classList.add("vt-shot");
      }

      const swap = () => {
        if (current !== h) app!.innerHTML = html;
        current = h;
        wire(nav);
        first = false;
        if (morph) {
          const target = app!.querySelector<HTMLElement>('[data-shot="' + morph + '"]');
          if (target) target.classList.add("vt-shot");
        }
      };

      if (morph && !first) withViewTransition(swap);
      else swap();
    }

    document.querySelectorAll("[data-nav]").forEach((a) => {
      if ((a as HTMLElement).dataset.nav === nav) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });

    renderDock(nav);

    if (scrollTo) {
      const el = document.getElementById(scrollTo);
      if (el) el.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
  }

  function wire(nav: string) {
    if (nav === "work") {
      wireForm();
      wireContactTabs();
    }
    if (nav === "about") {
      wireTerminal();
      wirePad();
    }
    if (nav === "home") {
      wireDrag();
      wireFinder();
      wireCounters();
      wireKineticName();
      wireLiveTerminal();
      wireTypingBubbles();
    }
    wireReveal();
    wirePointerEffects();
    wireCaseStudy();
    wireProcessSteps();
    wireCertStamp();

    /* Let anything else attach to this route without editing route().
       (motion-spec §2.3) */
    window.dispatchEvent(new CustomEvent("stal:route", { detail: { nav } }));
  }

  on(window, "hashchange", route);

  /* Pricing "get a quote" buttons switch the contact form to quote mode
     and tick the platform checkbox that matches the tier. */
  const SERVICE_PLATFORM: Record<string, string> = {
    "Website design & development": "Website",
    "Full-stack development": "Backend / API",
    "AI tools & AI-native systems": "AI / automation",
  };
  on(document, "click", (e) => {
    const b = (e.target as HTMLElement | null)?.closest("[data-service]") as HTMLElement | null;
    if (!b) return;
    const v = b.dataset.service || "";
    setTimeout(() => {
      setContactMode("quote");
      const platform = SERVICE_PLATFORM[v];
      if (platform) {
        const cb = document.querySelector<HTMLInputElement>('[data-platform="' + platform + '"]');
        if (cb) cb.checked = true;
      }
    }, 0);
  });

  /* ─── Dock ─────────────────────────────────────────────────────── */

  let lastDockActive = "";
  const visited = new Set<string>();
  function renderDock(active: string) {
    dock!.innerHTML = dockHtml(active, cfg.githubUrl);
    const btn = $("dockSearch");
    if (btn) btn.addEventListener("click", openSpot);

    /* G3: mark every page opened this session */
    if (active) visited.add(active);
    dock!.querySelectorAll<HTMLAnchorElement>("a[href^='#']").forEach((a) => {
      const key = a.getAttribute("href")!.slice(1);
      if (visited.has(key)) a.classList.add("seen");
    });

    /* macOS bounces an icon as its app opens — do the same when the
       route changes, but not on the very first paint. */
    if (!reduce && lastDockActive && lastDockActive !== active) {
      const icon = dock!.querySelector<HTMLElement>("a.on");
      if (icon) {
        icon.classList.add("bounce");
        const t = setTimeout(() => icon.classList.remove("bounce"), 700);
        timers.push(t);
      }
    }
    lastDockActive = active;
  }

  if (fine && !reduce) {
    on(dock, "mousemove", ((e: MouseEvent) => {
      dock.querySelectorAll("a, button").forEach((node) => {
        const el = node as HTMLElement;
        const r = el.getBoundingClientRect();
        const d = Math.abs(e.clientX - (r.left + r.width / 2));
        const s = Math.max(1, 1.55 - d / 120);
        el.style.transform = "scale(" + s + ")";
        el.style.margin = "0 " + (s - 1) * 14 + "px";
      });
    }) as EventListener);
    on(dock, "mouseleave", () => {
      dock.querySelectorAll("a, button").forEach((node) => {
        const el = node as HTMLElement;
        el.style.transform = "";
        el.style.margin = "";
      });
    });
  }

  /* ─── Spotlight ────────────────────────────────────────────────── */

  const INDEX = searchIndex(content);
  let sel = 0;
  let results: IndexItem[] = [];

  /**
   * Subsequence match — "lcl frg" finds LocalForge. Only ever applied to
   * a result's title: running it across the pitch and stack too would
   * match almost everything.
   */
  function subseq(hay: string, needle: string): boolean {
    let i = 0;
    for (const ch of needle) {
      if (ch === " ") continue;
      i = hay.indexOf(ch, i);
      if (i < 0) return false;
      i++;
    }
    return true;
  }

  /** Lower is better; -1 means no match. */
  function score(it: IndexItem, q: string): number {
    const title = it.t.toLowerCase();
    const hay = (it.t + " " + it.s + " " + (it.x || "")).toLowerCase();
    if (title.indexOf(q) === 0) return 0;
    if (title.indexOf(q) > 0) return 10 + title.indexOf(q);
    if (hay.indexOf(q) > -1) return 100 + hay.indexOf(q);
    if (subseq(title, q)) return 300;
    return -1;
  }

  function renderSpot() {
    const q = spotIn!.value.trim().toLowerCase();
    results = (q
      ? INDEX.map((it) => [it, score(it, q)] as const)
          .filter(([, sc]) => sc >= 0)
          .sort((a, b) => a[1] - b[1])
          .map(([it]) => it)
      : INDEX
    ).slice(0, 9);
    if (sel >= results.length) sel = 0;
    spotList!.innerHTML = results.length
      ? results
          .map(
            (it, i) =>
              '<a class="spot-item" role="option" href="' + it.h + '" aria-selected="' + (i === sel) +
              '" data-i="' + i + '"><span class="si" style="' + tileBg(it.k) + '">' + glyph(it.k) +
              '</span><span style="min-width:0"><b>' + esc(it.t) + "</b><small>" +
              esc(it.s.length > 80 ? it.s.slice(0, 80) + "…" : it.s) + "</small></span></a>"
          )
          .join("")
      : '<div class="empty" style="padding:24px"><b>no results</b><p class="muted">Try "ai", "rust", or "pricing".</p></div>';
  }

  function openSpot() {
    spot!.hidden = false;
    spotIn!.value = "";
    sel = 0;
    renderSpot();
    setTimeout(() => spotIn!.focus(), 0);
  }
  function closeSpot() {
    spot!.hidden = true;
  }

  on(spotIn, "input", () => {
    sel = 0;
    renderSpot();
  });
  on(spotIn, "keydown", ((e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      sel = Math.min(results.length - 1, sel + 1);
      renderSpot();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      sel = Math.max(0, sel - 1);
      renderSpot();
    } else if (e.key === "Enter" && results[sel]) {
      e.preventDefault();
      location.hash = results[sel].h;
      closeSpot();
    }
  }) as EventListener);
  on(spotList, "click", (e) => {
    if ((e.target as HTMLElement | null)?.closest(".spot-item")) closeSpot();
  });
  on(spot, "click", (e) => {
    if (e.target === spot) closeSpot();
  });

  const searchBtn = $("searchBtn");
  if (searchBtn) on(searchBtn, "click", openSpot);
  const kbd = $("kbdHint");
  if (kbd) kbd.textContent = isMac ? "⌘K" : "Ctrl K";

  on(document, "keydown", ((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (spot!.hidden) openSpot();
      else closeSpot();
    } else if (e.key === "Escape" && !spot!.hidden) {
      closeSpot();
    }
  }) as EventListener);

  /* ─── Showreel ─────────────────────────────────────────────────── */

  const showreelModal = $("showreelModal");
  const showreelVideo = $("showreelVideo") as HTMLVideoElement | null;

  function openShowreel() {
    if (!showreelModal) return;
    showreelModal.hidden = false;
    showreelVideo?.play().catch(() => {});
  }
  function closeShowreel() {
    if (!showreelModal) return;
    showreelModal.hidden = true;
    showreelVideo?.pause();
    if (showreelVideo) showreelVideo.currentTime = 0;
  }

  /* The folder is re-rendered on every home-route mount, so this
     listens on document rather than binding it directly. */
  on(document, "click", (e) => {
    const t = e.target as HTMLElement | null;
    if (t?.closest("#showreelOpen")) openShowreel();
    else if (t?.closest("#showreelClose")) closeShowreel();
    else if (t === showreelModal) closeShowreel();
  });
  on(document, "keydown", ((e: KeyboardEvent) => {
    if (e.key === "Escape" && showreelModal && !showreelModal.hidden) closeShowreel();
  }) as EventListener);

  /* ─── G5. Theme ────────────────────────────────────────────────── */

  /* The site ships light; the toggle flips straight between light and
     dark. It deliberately does not cycle through "auto": on a machine
     set to dark, auto looks identical to dark, so that click reads as
     doing nothing. "auto" can still be set explicitly from the terminal
     (`theme auto`), and is resolved against the system setting here.

     The choice is remembered, and the no-flash script in app/page.tsx
     applies it before first paint. */
  type Theme = "light" | "dark" | "auto";

  function readTheme(): Theme {
    try {
      const v = localStorage.getItem("stal-theme");
      if (v === "light" || v === "dark" || v === "auto") return v;
    } catch {
      /* private browsing */
    }
    return "light";
  }

  /** What the visitor is actually looking at right now. */
  function resolvedTheme(): "light" | "dark" {
    const t = readTheme();
    if (t !== "auto") return t;
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(t: Theme) {
    const root = document.documentElement;
    if (t === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", t);
    try {
      localStorage.setItem("stal-theme", t);
    } catch {
      /* private browsing */
    }
    const btn = $("themeBtn");
    if (btn) {
      const shown = t === "auto" ? resolvedTheme() + " (auto)" : t;
      btn.setAttribute("title", "Theme: " + shown + " — press T to switch");
      btn.setAttribute(
        "aria-label",
        "Switch to " + (resolvedTheme() === "dark" ? "light" : "dark") + " theme"
      );
    }
  }

  function cycleTheme(origin?: { x: number; y: number }) {
    /* Always the opposite of what is on screen, so every click changes
       something the visitor can see. */
    const next: Theme = resolvedTheme() === "dark" ? "light" : "dark";
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => {
        ready: Promise<void>;
        finished: Promise<void>;
        updateCallbackDone: Promise<void>;
      };
    };
    if (reduce || document.hidden || typeof doc.startViewTransition !== "function") {
      applyTheme(next);
      return;
    }
    const x = origin?.x ?? window.innerWidth - 60;
    const y = origin?.y ?? 20;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const vt = doc.startViewTransition(() => applyTheme(next));
    swallow(vt.finished);
    swallow(vt.updateCallbackDone);
    vt.ready
      .then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              "circle(0px at " + x + "px " + y + "px)",
              "circle(" + r + "px at " + x + "px " + y + "px)",
            ],
          },
          { duration: 460, easing: "cubic-bezier(.2,.8,.2,1)", pseudoElement: "::view-transition-new(root)" }
        );
      })
      .catch(() => {});
  }

  applyTheme(readTheme());
  const themeBtn = $("themeBtn");
  if (themeBtn) {
    on(themeBtn, "click", ((e: MouseEvent) => {
      const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
      cycleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    }) as EventListener);
  }

  /* ─── G12. Keyboard shortcuts ──────────────────────────────────── */

  const SHORTCUTS: [string, string][] = [
    ["\u2318K / Ctrl K", "Search"],
    ["?", "This sheet"],
    ["G then H", "Home"],
    ["G then A", "About"],
    ["G then S", "Full-stack"],
    ["G then I", "AI engineering"],
    ["G then V", "Ventures"],
    ["G then W", "Writing"],
    ["G then K", "Work with me"],
    ["\u2190 / \u2192", "Previous / next case study"],
    ["T", "Light / dark"],
    ["Esc", "Close"],
  ];

  const GOTO: Record<string, string> = {
    h: "home", a: "about", s: "systems", i: "ai",
    v: "ventures", w: "writing", k: "work",
  };

  let sheet: HTMLElement | null = null;

  function closeSheet() {
    sheet?.remove();
    sheet = null;
  }

  function openSheet() {
    if (sheet) return closeSheet();
    const el = document.createElement("div");
    el.className = "sheet";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "Keyboard shortcuts");
    el.innerHTML =
      '<div class="sheet-box"><div class="win-bar"><span class="dots"><i></i><i></i><i></i></span><span class="win-title">shortcuts</span></div>' +
      '<div class="sheet-body">' +
      SHORTCUTS.map(
        ([k, label]) =>
          '<div class="sheet-row"><b>' + esc(label) + "</b><kbd>" + esc(k) + "</kbd></div>"
      ).join("") +
      "</div></div>";
    document.body.appendChild(el);
    sheet = el;
    el.addEventListener("click", (e) => {
      if (e.target === el) closeSheet();
    });
    (el.querySelector(".sheet-box") as HTMLElement | null)?.focus?.();
  }

  /** True while the visitor is typing, so shortcuts never steal keys. */
  function typing(e: KeyboardEvent): boolean {
    const t = e.target as HTMLElement | null;
    if (!t) return false;
    const tag = t.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || t.isContentEditable;
  }

  let awaitingGoto = 0;
  on(document, "keydown", ((e: KeyboardEvent) => {
    if (typing(e) || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLowerCase();

    if (e.key === "Escape" && sheet) {
      closeSheet();
      return;
    }
    if (e.key === "?") {
      e.preventDefault();
      openSheet();
      return;
    }
    if (!spot!.hidden) return;

    /* G then a letter jumps to a page */
    if (awaitingGoto && Date.now() < awaitingGoto) {
      awaitingGoto = 0;
      if (GOTO[k]) {
        e.preventDefault();
        location.hash = "#" + GOTO[k];
        return;
      }
    }
    if (k === "g") {
      awaitingGoto = Date.now() + 1200;
      return;
    }
    if (k === "t") {
      e.preventDefault();
      cycleTheme();
      return;
    }

    /* arrows walk the pager on a case study */
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      const pager = app!.querySelector(".pager");
      if (!pager) return;
      const link = pager.querySelector<HTMLAnchorElement>(
        e.key === "ArrowRight" ? "a.next" : "a:not(.next)"
      );
      if (link) {
        e.preventDefault();
        location.hash = link.getAttribute("href") || "";
      }
    }
  }) as EventListener);

  /* ─── Draggable hero windows ───────────────────────────────────── */

  /* What separates a click from a drag: a few pixels of travel is a shaky
     click, and a press longer than this reads as picking the thing up. */
  const DRAG_PX = 4;
  const HOLD_MS = 400;

  function wireDrag() {
    const hero = $("hero");
    if (!hero || !fine) return;
    let z = 10;
    hero.querySelectorAll("[data-drag]").forEach((node) => {
      const el = node as HTMLElement;

      /* The folders are links as well as objects on the desk, so letting
         go after a drag fires a click that would open the folder you were
         only moving. A folder opens on a quick click and nothing else:
         the pointer has to stay put, and the press has to be brief. */
      let dragged = false;
      el.addEventListener("click", (e: MouseEvent) => {
        if (!dragged) return;
        e.preventDefault();
        e.stopPropagation();
      });
      /* If the browser ever starts its own link drag, that is a drag. */
      el.addEventListener("dragstart", () => {
        dragged = true;
      });

      el.addEventListener("pointerdown", (e: PointerEvent) => {
        if (e.button !== 0) return;
        dragged = false;
        const down = performance.now();
        const sx = e.clientX;
        const sy = e.clientY;
        const hr = hero.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        const ox = e.clientX - r.left;
        const oy = e.clientY - r.top;
        el.style.left = r.left - hr.left + "px";
        el.style.top = r.top - hr.top + "px";
        el.style.right = "auto";
        el.classList.add("dragging");
        el.style.zIndex = String(++z);
        el.setPointerCapture(e.pointerId);
        e.preventDefault();
        const mv = (ev: PointerEvent) => {
          if (!dragged && Math.hypot(ev.clientX - sx, ev.clientY - sy) > DRAG_PX) dragged = true;
          let x = ev.clientX - hr.left - ox;
          let y = ev.clientY - hr.top - oy;
          /* Bounded by the window, not by the hero's text column: the
             column is much narrower than the screen, and clamping to it
             meant a window could not be moved out to the sides at all.
             `x` is relative to the hero, so the edges shift by hr.left,
             and the width is the client width — innerWidth would let a
             window slide under the scrollbar and widen the page. */
          const edge = document.documentElement.clientWidth;
          x = Math.max(8 - hr.left, Math.min(edge - 8 - r.width - hr.left, x));
          y = Math.max(-10, Math.min((hero as HTMLElement).offsetHeight - 40, y));
          el.style.left = x + "px";
          el.style.top = y + "px";
        };
        const up = () => {
          /* Holding on to something and setting it down is a move, even
             when it lands where it started. Only a brief press opens. */
          if (performance.now() - down > HOLD_MS) dragged = true;
          el.classList.remove("dragging");
          el.removeEventListener("pointermove", mv);
          el.removeEventListener("pointerup", up);
          el.removeEventListener("pointercancel", up);
        };
        el.addEventListener("pointermove", mv);
        el.addEventListener("pointerup", up);
        el.addEventListener("pointercancel", up);
      });
    });
  }

  /* Observers belong to whichever route is rendered; a new render
     replaces them instead of stacking another one on removed nodes. */
  let revealIO: IntersectionObserver | null = null;
  let countIO: IntersectionObserver | null = null;
  cleanups.push(() => {
    revealIO?.disconnect();
    countIO?.disconnect();
  });

  /* ─── Finder ───────────────────────────────────────────────────── */

  /** Sidebar tabs that swap panels, with macOS-style arrow-key movement. */
  function wireFinder() {
    const side = document.querySelector(".finder-side");
    const title = $("finderTitle");
    if (!side) return;
    const tabs = Array.from(side.querySelectorAll<HTMLElement>("[data-tab]"));
    if (!tabs.length) return;

    function show(key: string, focus?: boolean) {
      tabs.forEach((t) => {
        const on = t.dataset.tab === key;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = $("fp-" + t.dataset.tab);
        if (panel) panel.hidden = !on;
        if (on) {
          if (title) title.textContent = "~/stal/" + (t.dataset.path || "");
          if (focus) t.focus();
        }
      });
    }

    tabs.forEach((t, i) => {
      t.addEventListener("click", () => show(t.dataset.tab || ""));
      t.addEventListener("keydown", (e: KeyboardEvent) => {
        const d =
          e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 :
          e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        show(tabs[(i + d + tabs.length) % tabs.length].dataset.tab || "", true);
      });
    });
  }

  /* ─── Scroll reveal ────────────────────────────────────────────── */

  /**
   * Fades blocks in as they scroll into view. The attribute is added
   * here rather than in the markup, so with no JavaScript — or no
   * IntersectionObserver — everything simply stays visible.
   */
  function wireReveal() {
    revealIO?.disconnect();
    revealIO = null;
    if (reduce || typeof IntersectionObserver === "undefined") return;
    const targets = Array.from(
      app!.querySelectorAll<HTMLElement>(
        ".sec-head, .hero-center, .stats, .feature, .cards > .card, .grid-2 > .win, .grid-3 > .win, .stickers > *, .win.price, .steps li, .detail-head, .detail-main > div, .detail-side > .side-box, .rows, .about-top > *, #finder, .empty"
      )
    ).filter((el) => !el.closest(".hero .float"));

    if (!targets.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          /* Stagger siblings slightly so a grid arrives as a wave. */
          const delay = Number(el.dataset.revealDelay || 0);
          timers.push(setTimeout(() => el.classList.add("in"), delay));
          io.unobserve(el);
        }
      },
      /* threshold 0: any overlap counts, so a block can never be left
         invisible on screen — which a deep link such as #contact, that
         lands mid-page, would otherwise do. */
      { rootMargin: "0px 0px -6% 0px", threshold: 0 }
    );

    const seen = new Map<Element, number>();
    for (const el of targets) {
      const parent = el.parentElement as Element;
      const n = (seen.get(parent) ?? -1) + 1;
      seen.set(parent, n);
      el.dataset.revealDelay = String(Math.min(n, 5) * 60);
      el.setAttribute("data-reveal", "");
    }

    /* Let the browser paint the hidden state once before observing,
       otherwise the first screenful appears without transitioning. */
    requestAnimationFrame(() => targets.forEach((el) => io.observe(el)));

    /* Safety net: whatever is still hidden but on screen a moment later
       gets shown anyway. Content must never be stuck invisible. */
    const net = setTimeout(() => {
      for (const el of targets) {
        if (el.classList.contains("in")) continue;
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("in");
      }
    }, 1200);
    timers.push(net);
    revealIO = io;
  }

  /* ─── Counting stats ───────────────────────────────────────────── */

  /** Runs the numbers in the stats strip up from zero when it appears. */
  function wireCounters() {
    countIO?.disconnect();
    countIO = null;
    const strip = app!.querySelector(".stats");
    if (!strip || reduce || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          io.disconnect();
          strip.querySelectorAll<HTMLElement>(".stat").forEach((stat, i) => {
            const b = stat.querySelector("b");
            if (!b) return;
            stat.classList.add("counting");
            countUp(b as HTMLElement, 900, i * 90);
            const t = setTimeout(() => stat.classList.remove("counting"), 1000 + i * 90);
            timers.push(t);
          });
        }
      },
      { threshold: 0.35 }
    );
    io.observe(strip);
    countIO = io;
  }

  /* ─── H1. Kinetic name ─────────────────────────────────────────── */

  /** Letters drop in on load, dodge the pointer, and hop when clicked. */
  function wireKineticName() {
    const h1 = app!.querySelector<HTMLElement>(".hero h1");
    if (!h1) return;
    const chars = Array.from(h1.querySelectorAll<HTMLElement>(".ch"));
    if (!chars.length) return;

    /* The hidden start state is only applied once JS is here, so the
       name is never invisible without it. */
    if (!reduce) document.body.classList.add("anim-ready");

    chars.forEach((ch) => {
      ch.addEventListener("click", () => {
        if (reduce) return;
        ch.classList.remove("hop");
        void ch.offsetWidth;
        ch.classList.add("hop");
      });
    });

    if (reduce || !fine) return;

    const move = (e: PointerEvent) => {
      for (const ch of chars) {
        const r = ch.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy);
        if (d > 110) {
          ch.style.removeProperty("--chx");
          ch.style.removeProperty("--chy");
          continue;
        }
        const push = (1 - d / 110) * 6;
        ch.style.setProperty("--chx", (-dx / (d || 1)) * push + "px");
        ch.style.setProperty("--chy", (-dy / (d || 1)) * push + "px");
      }
    };
    const leave = () =>
      chars.forEach((ch) => {
        ch.style.removeProperty("--chx");
        ch.style.removeProperty("--chy");
      });
    h1.addEventListener("pointermove", move);
    h1.addEventListener("pointerleave", leave);
  }

  /* ─── H3. Live terminal in the hero ────────────────────────────── */

  /**
   * Types and runs a LocalForge commit on a loop, paused offscreen.
   *
   * Opt-in by marking the terminal `data-live-term`. It used to take the
   * first `.term` in the hero, which silently became now.txt the moment
   * the LocalForge window was replaced — a loop that overwrites whatever
   * terminal happens to be first is a trap, so the target is explicit.
   * Nothing claims it today, so this stays dormant.
   */
  function wireLiveTerminal() {
    const term = app!.querySelector<HTMLElement>(".hero [data-live-term]");
    if (!term || reduce) return;

    const SCENES: [string, string][][] = [
      [
        ['$ git commit -m "ship it"', ""],
        ["\u2713 regex scan", "<1ms"],
        ["\u2713 coreml check", "~200ms"],
        ["\u25cf qwen review", "advisory"],
        ["\u2713 advisory report saved", ""],
      ],
      [
        ['$ git commit -m "add client"', ""],
        ["\u2713 regex scan", "<1ms"],
        ["\u2715 blocked: AWS key", "staged"],
        ["\u25cf remove the secret", "then retry"],
      ],
    ];

    let scene = 0;
    let stopped = false;
    /* Waits resolve early when the loop is stopped, so `run()` can fall
       out of its while-loop instead of hanging on a cleared timer. */
    let wake: (() => void)[] = [];
    const wait = (ms: number) =>
      new Promise<void>((res) => {
        const t = setTimeout(() => {
          wake = wake.filter((w) => w !== res);
          res();
        }, ms);
        timers.push(t);
        wake.push(res);
      });

    const cls = (line: string) =>
      line.startsWith("\u2713") ? "ok" : line.startsWith("\u2715") ? "e" : line.startsWith("\u25cf") ? "run" : "";

    async function run() {
      while (!stopped) {
        const lines = SCENES[scene % SCENES.length];
        term!.innerHTML = "";
        /* type the command out character by character */
        const cmd = document.createElement("div");
        term!.appendChild(cmd);
        const text = lines[0][0];
        for (let i = 1; i <= text.length && !stopped; i++) {
          cmd.textContent = text.slice(0, i);
          await wait(28);
        }
        if (stopped) return;
        for (const [line, note] of lines.slice(1)) {
          await wait(260);
          if (stopped) return;
          const d = document.createElement("div");
          const k = cls(line);
          d.innerHTML =
            (k ? '<span class="' + k + '">' + esc(line[0]) + "</span>" : "") +
            esc(k ? line.slice(1) : line) +
            (note ? ' <span class="dim">' + esc(note) + "</span>" : "");
          term!.appendChild(d);
        }
        const caret = document.createElement("div");
        caret.innerHTML = '<span class="dim">$</span><span class="cursor"></span>';
        term!.appendChild(caret);
        await wait(4000);
        scene++;
      }
    }

    let running = false;
    const stop = () => {
      stopped = true;
      wake.splice(0).forEach((w) => w());
    };
    const start = () => {
      if (running) return;
      stopped = false;
      running = true;
      run().finally(() => {
        running = false;
      });
    };
    cleanups.push(whileVisible(term, start, stop));
    cleanups.push(stop);
  }

  /* ─── H4. Typing bubbles ───────────────────────────────────────── */

  /** Shows a typing indicator, then pops the message in. */
  function wireTypingBubbles() {
    if (reduce) return;
    const bubbles = Array.from(app!.querySelectorAll<HTMLElement>("#heroBubble, .feature .bubble.left"));
    for (const b of bubbles) {
      const message = b.innerHTML;
      b.innerHTML = '<span class="dots3"><i></i><i></i><i></i></span>';
      b.classList.add("typing");
      cleanups.push(
        onVisible(
          b,
          () => {
            const t = setTimeout(() => {
              b.innerHTML = message;
              b.classList.remove("typing");
              b.classList.add("pop");
            }, 900);
            timers.push(t);
          },
          { threshold: 0.4 }
        )
      );
    }
  }

  /* ─── G7. Pointer spotlight, tilt and magnetic buttons ─────────── */

  function wirePointerEffects() {
    if (reduce || !fine) return;
    /* Pricing cards stay still on purpose — only their buttons react. */
    app!.querySelectorAll<HTMLElement>(".card").forEach((el) => {
      cleanups.push(trackPointer(el));
      cleanups.push(tilt(el, 4));
    });
    app!.querySelectorAll<HTMLElement>(".award").forEach((el) => {
      cleanups.push(trackPointer(el));
      cleanups.push(tilt(el, 10));
    });
    app!.querySelectorAll<HTMLElement>(".btn-primary").forEach((el) => {
      cleanups.push(magnetic(el));
    });
  }

  /* ─── C1. Case study: reading progress, flow steps, numbers ────── */

  /** Loads the demo engine on demand and mounts it into the case study. */
  let demoTeardown: (() => void) | null = null;
  async function wireDemo() {
    demoTeardown?.();
    demoTeardown = null;
    const slot = $("demoSlot");
    const slug = slot?.dataset.demoSlug;
    if (!slot || !slug) return;
    try {
      const mod = await import("./demo");
      if (!mod.hasDemo(slug)) {
        /* No demo for this project: drop the section rather than
           leaving a loading message behind. */
        slot.remove();
        return;
      }
      /* The slot may have been replaced by another route while the
         import was in flight. */
      if (!slot.isConnected) return;
      slot.innerHTML = "<h2>// try it</h2>";
      const host = document.createElement("div");
      slot.appendChild(host);
      demoTeardown = mod.mountDemo(host, slug);
      cleanups.push(() => demoTeardown?.());
    } catch {
      slot.remove();
    }
  }

  function wireCaseStudy() {
    wireDemo();

    /* numbers count up when the tiles arrive */
    app!.querySelectorAll<HTMLElement>(".nums .num b").forEach((b, i) => {
      cleanups.push(onVisible(b, () => countUp(b, 900, i * 80), { threshold: 0.4 }));
    });

    const bar = $("readBar");
    const win = $("caseWin");
    if (bar && win) {
      const onScroll = () => {
        const r = win.getBoundingClientRect();
        const total = r.height - window.innerHeight;
        const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
        bar.style.setProperty("--p", String(p));
      };
      on(window, "scroll", onScroll, { passive: true } as AddEventListenerOptions);
      onScroll();
    }

    /* each pipeline step lights up as it passes the middle of the screen */
    const steps = Array.from(app!.querySelectorAll<HTMLElement>(".flow div"));
    if (steps.length && !reduce && typeof IntersectionObserver !== "undefined") {
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) e.target.classList.toggle("on", e.isIntersecting);
        },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
      );
      steps.forEach((st) => io.observe(st));
      cleanups.push(() => io.disconnect());
    }
  }

  /* ─── P3. Process steps: a line that fills as you scroll ───────── */

  function wireProcessSteps() {
    const list = app!.querySelector<HTMLElement>(".steps");
    if (!list) return;
    const items = Array.from(list.querySelectorAll<HTMLElement>("li"));
    if (!items.length) return;

    if (reduce) {
      list.style.setProperty("--p", "1");
      items.forEach((li) => li.classList.add("lit"));
      return;
    }
    items.forEach((li, i) => {
      cleanups.push(
        onVisible(
          li,
          () => {
            li.classList.add("lit");
            list.style.setProperty("--p", String((i + 1) / items.length));
          },
          { threshold: 0.6 }
        )
      );
    });
  }

  /* ─── A7. Certificate seal stamps down on first view ───────────── */

  function wireCertStamp() {
    if (reduce) return;
    app!.querySelectorAll<HTMLElement>(".cert").forEach((cert) => {
      cleanups.push(onVisible(cert, () => cert.classList.add("stamp"), { threshold: 0.5 }));
    });
  }

  /* ─── Terminal ─────────────────────────────────────────────────── */

  function wireTerminal() {
    const out = $("tty");
    const inp = $("ttyIn") as HTMLInputElement | null;
    if (!out || !inp) return;
    const hist: string[] = [];
    let hi = 0;

    function print(html: string) {
      const d = document.createElement("div");
      d.innerHTML = html;
      out!.appendChild(d);
      out!.scrollTop = out!.scrollHeight;
    }
    const link = (h: string, t: string) => '<a href="' + h + '">' + t + "</a>";

    const CMDS: Record<string, () => string | null> = {
      help: () =>
        "commands: <b>whoami</b> · <b>projects</b> · <b>ai</b> · <b>stack</b> · <b>experience</b> · <b>awards</b> · <b>contact</b> · <b>neofetch</b> · <b>date</b> · <b>shortcuts</b> · <b>theme &lt;dark|light|auto&gt;</b> · <b>ls</b> · <b>cd &lt;folder&gt;</b> · <b>open &lt;project&gt;</b> · <b>clear</b>" +
        '<br><span class="c">tab completes commands, folders and projects</span>',
      whoami: () =>
        'Stalingrad "Stal" Dollosa. Freelance software engineer, mobile developer, and AI engineer in Bacolod City, PH. Founder of Euclid, solo builder of Bernn, and teaches AI engineering at USLS.',
      projects: () =>
        content.projects
          .filter((p) => p.cat === "systems")
          .map((p) => "· " + link("#p-" + p.slug, esc(p.name)))
          .join("<br>"),
      ai: () =>
        content.projects
          .filter((p) => p.cat === "ai")
          .map((p) => "· " + link("#p-" + p.slug, esc(p.name)) + ' <span class="c">' + esc(p.status[1]) + "</span>")
          .join("<br>"),
      stack: () =>
        content.skills
          .filter((s) => s.icon.indexOf("txt:") !== 0)
          .map((s) => esc((s.label || s.icon).toLowerCase()))
          .join(" · "),
      experience: () =>
        content.experience
          .slice(0, 4)
          .map(
            (x) =>
              '<span style="color:var(--gold)">' + hash7(x.title + x.org) + "</span> " +
              esc(x.title) + ' <span class="c">@ ' + esc(x.org) + "</span>"
          )
          .join("<br>"),
      awards: () =>
        content.awards
          .filter((a) => a.kind === "award")
          .map((a) => "★ " + esc(a.title) + ' <span class="c">· ' + esc(a.org) + "</span>")
          .join("<br>"),
      contact: () => "email: " + esc(cfg.email) + " · or " + link("#contact", "open the contact form"),
      ls: () => "full-stack/  ai/  ventures/  writing/  about/  work/",
      date: () => {
        try {
          return new Intl.DateTimeFormat("en-US", {
            dateStyle: "full", timeStyle: "short", timeZone: "Asia/Manila",
          }).format(new Date()) + ' <span class="c">(Manila)</span>';
        } catch {
          return new Date().toString();
        }
      },
      shortcuts: () => {
        openSheet();
        return "opening the shortcuts sheet…";
      },
      neofetch: () => {
        const counts = { systems: 0, ai: 0, ventures: 0 } as Record<string, number>;
        for (const p of content.projects) counts[p.cat] = (counts[p.cat] || 0) + 1;
        const art = [
          '<span style="color:var(--folder)">  ______      </span>',
          '<span style="color:var(--folder)"> /     /|     </span>',
          '<span style="color:var(--folder)">/_____/ |     </span>',
          '<span style="color:var(--folder)">|     | /     </span>',
          '<span style="color:var(--folder)">|_____|/      </span>',
        ];
        const facts = [
          "<b>stal</b>@portfolio",
          "-----------------",
          "OS: Stal OS (web)",
          "Host: " + esc(cfg.cats.systems.short) + " · " + esc(cfg.cats.ai.short) + " · " + esc(cfg.cats.ventures.short),
          "Projects: " + content.projects.length +
            " (" + counts.systems + " full-stack, " + counts.ai + " ai, " + counts.ventures + " ventures)",
          "Skills: " + content.skills.length + " tiles",
          "Shell: zsh",
          "Contact: " + esc(cfg.email),
        ];
        const rows = Math.max(art.length, facts.length);
        let out = "";
        for (let i = 0; i < rows; i++) {
          out += (art[i] || '<span style="opacity:0">              </span>') + " " + (facts[i] || "") + "<br>";
        }
        return out;
      },
      clear: () => {
        out!.innerHTML = "";
        return null;
      },
    };

    const FOLDERS: Record<string, string> = {
      "full-stack": "systems", systems: "systems", ai: "ai", ventures: "ventures",
      writing: "writing", about: "about", work: "work", "~": "home", "..": "home",
    };

    function run(raw: string) {
      const cmd = raw.trim();
      if (!cmd) return;
      hist.push(cmd);
      hi = hist.length;
      print('<span class="p">stal ~ %</span> ' + esc(cmd));
      const parts = cmd.split(/\s+/);
      const c = parts[0].toLowerCase();
      const arg = (parts.slice(1).join(" ") || "").replace(/\/$/, "").toLowerCase();

      if (cmd.toLowerCase() === "sudo hire stal") {
        print("[sudo] permission granted. opening the work-with-me page…");
        setTimeout(() => {
          location.hash = "#work";
        }, 700);
        return;
      }
      if (c === "theme") {
        if (arg === "dark" || arg === "light" || arg === "auto") {
          applyTheme(arg);
          print("theme set to " + arg);
        } else {
          print('<span class="e">theme: use dark, light, or auto</span>');
        }
        return;
      }
      if (c === "cd") {
        if (FOLDERS[arg]) {
          print("→ ~/" + arg);
          setTimeout(() => {
            location.hash = "#" + FOLDERS[arg];
          }, 400);
        } else {
          print('<span class="e">cd: no such folder: ' + esc(arg) + "</span>");
        }
        return;
      }
      if (c === "open") {
        const p = content.projects.find(
          (x) => x.slug.indexOf(arg) === 0 || x.name.toLowerCase().indexOf(arg) === 0
        );
        if (arg && p) {
          print("opening " + esc(p.name) + "…");
          setTimeout(() => {
            location.hash = "#p-" + p.slug;
          }, 400);
        } else {
          print('<span class="e">open: nothing called "' + esc(arg) + '". try: open localforge</span>');
        }
        return;
      }
      if (CMDS[c]) {
        const r = CMDS[c]();
        if (r !== null) print(r);
      } else if (c === "sudo") {
        print('<span class="e">nice try. try: sudo hire stal</span>');
      } else {
        print('<span class="e">zsh: command not found: ' + esc(c) + '</span> <span class="c">(type help)</span>');
      }
    }

    inp.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        /* A2: complete the command, a folder after cd, or a project
           slug after open. */
        e.preventDefault();
        const raw = inp.value;
        const parts = raw.split(/\s+/);
        if (parts.length < 2) {
          const names = Object.keys(CMDS).concat(["theme", "cd", "open", "sudo"]);
          const hit = names.filter((n) => n.indexOf(parts[0].toLowerCase()) === 0).sort();
          if (hit.length === 1) inp.value = hit[0] + " ";
          else if (hit.length > 1) print(hit.join("  "));
        } else {
          const head = parts[0].toLowerCase();
          const frag = parts[parts.length - 1].toLowerCase();
          let pool: string[] = [];
          if (head === "cd") pool = Object.keys(FOLDERS);
          else if (head === "open") pool = content.projects.map((p) => p.slug);
          else if (head === "theme") pool = ["dark", "light", "auto"];
          const hit = pool.filter((n) => n.indexOf(frag) === 0).sort();
          if (hit.length === 1) inp.value = parts.slice(0, -1).concat(hit[0]).join(" ");
          else if (hit.length > 1) print(hit.join("  "));
        }
        return;
      }
      if (e.key === "Enter") {
        run(inp.value);
        inp.value = "";
      } else if (e.key === "ArrowUp") {
        if (hi > 0) {
          hi--;
          inp.value = hist[hi];
        }
        e.preventDefault();
      } else if (e.key === "ArrowDown") {
        if (hi < hist.length - 1) {
          hi++;
          inp.value = hist[hi];
        } else {
          hi = hist.length;
          inp.value = "";
        }
        e.preventDefault();
      }
    });

    document.querySelectorAll("[data-cmd]").forEach((node) => {
      const b = node as HTMLElement;
      b.addEventListener("click", () => run(b.dataset.cmd || ""));
    });

    out.parentElement?.addEventListener("click", (e) => {
      if (!(e.target as HTMLElement | null)?.closest("a,button")) inp.focus({ preventScroll: true });
    });
  }

  /* ─── Launchpad filter ─────────────────────────────────────────── */

  function wirePad() {
    const seg = $("padSeg");
    const pad = $("pad");
    if (!seg || !pad) return;
    seg.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement | null)?.closest("button") as HTMLElement | null;
      if (!b) return;
      seg.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));

      /* A4: measure, change, then glide the tiles to their new spots. */
      const tiles = Array.from(pad.querySelectorAll<HTMLElement>(".app"));
      const play = flip(tiles.filter((t) => !t.hidden));
      tiles.forEach((a) => {
        a.hidden = !(b.dataset.f === "all" || a.dataset.g === b.dataset.f);
      });
      play();
    });
  }

  /* ─── Contact form ─────────────────────────────────────────────── */

  /* "message" is the standard contact form; "quote" is the full
     software-development quote request, so the pricing tiers can land
     here pre-filled. */
  function setContactMode(mode: "message" | "quote") {
    const seg = $("contactSeg");
    if (!seg) return;
    seg.querySelectorAll<HTMLButtonElement>("button[data-mode]").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.mode === mode));
    });
    document.querySelectorAll<HTMLElement>("[data-mode-field]").forEach((el) => {
      el.hidden = el.dataset.modeField !== mode;
    });
    const label = $("f-msg-label");
    const msg = $("f-msg") as HTMLTextAreaElement | null;
    const submit = $("contactSubmit");
    if (mode === "quote") {
      if (label) label.textContent = "What do you want built? (a few sentences)";
      if (msg) msg.placeholder = "What are you building, who is it for, and when do you need it?";
      if (submit) submit.textContent = "send quote request";
    } else {
      if (label) label.textContent = "Message";
      if (msg) msg.placeholder = "What's on your mind?";
      if (submit) submit.textContent = "send message";
    }
  }

  function wireContactTabs() {
    const seg = $("contactSeg");
    if (!seg) return;
    seg.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement | null)?.closest("button[data-mode]") as HTMLButtonElement | null;
      if (!b) return;
      setContactMode(b.dataset.mode === "quote" ? "quote" : "message");
    });
  }

  function wireForm() {
    const f = $("contactForm") as HTMLFormElement | null;
    if (!f) return;
    const val = (id: string) => ($(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;

    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = val("f-name").trim();
      const email = val("f-email").trim();
      const msg = val("f-msg").trim();
      let ok = true;
      const set = (id: string, t: string) => {
        const el = $(id);
        if (el) el.textContent = t;
        if (!t) return;
        ok = false;
        /* P4: shake the field that needs attention. */
        const field = el?.closest(".field") as HTMLElement | null;
        if (field && !reduce) {
          field.classList.remove("bad");
          void field.offsetWidth;
          field.classList.add("bad");
        }
      };
      set("e-name", name ? "" : "Add your name so I know who to reply to.");
      set("e-email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Enter an email address like you@company.com.");
      set("e-msg", msg.length >= 10 ? "" : "Add a sentence or two about the project.");
      if (!ok) return;

      const mode = $("contactSeg")?.querySelector('button[aria-pressed="true"]')?.getAttribute("data-mode") === "quote"
        ? "quote" : "message";

      const checked = (sel: string) =>
        Array.from(document.querySelectorAll<HTMLInputElement>(sel))
          .filter((i) => i.checked)
          .map((i) => i.dataset.platform || i.dataset.feature || "");

      const data = {
        mode, name, email,
        subject: val("f-subject").trim(),
        company: val("f-company").trim(),
        phone: val("f-phone").trim(),
        project: val("f-project").trim(),
        platforms: checked("[data-platform]"),
        features: checked("[data-feature]"),
        other: val("f-other").trim(),
        deadline: val("f-deadline"),
        budget: val("f-budget"),
        message: msg,
      };
      const text = mode === "quote"
        ? "Name: " + data.name + "\nEmail: " + data.email +
          (data.company ? "\nCompany: " + data.company : "") +
          (data.phone ? "\nPhone / WhatsApp: " + data.phone : "") +
          (data.project ? "\nProject: " + data.project : "") +
          (data.platforms.length ? "\nPlatform: " + data.platforms.join(", ") : "") +
          (data.features.length ? "\nFeatures: " + data.features.join(", ") : "") +
          "\nWhen: " + data.deadline + "\nBudget: " + data.budget +
          "\n\n" + data.message +
          (data.other ? "\n\nOther: " + data.other : "")
        : "Name: " + data.name + "\nEmail: " + data.email + "\n\n" + data.message;
      const subject = mode === "quote"
        ? "Quote request" + (data.project ? ": " + data.project : "")
        : (data.subject ? data.subject : "Message from the site");
      const sent = $("sent");
      if (!sent) return;

      function showCompose() {
        sent!.innerHTML =
          '<div style="display:flex; flex-direction:column; gap:12px"><h3 style="margin:0">your message is ready</h3><p class="muted">Copy it and send it to the address below. I\'ll reply to ' +
          esc(data.email) + '.</p><div class="composed" id="composed">' +
          esc("Subject: " + subject + "\n\n" + text) + '</div><div class="copyline"><button class="btn btn-primary" type="button" id="copyBtn">copy message</button><code>' +
          esc(cfg.email) + '</code><a href="mailto:' + esc(cfg.email) + "?subject=" +
          encodeURIComponent(subject) + "&body=" + encodeURIComponent(text) +
          '">open in email app</a></div><button class="btn btn-ghost" type="button" id="editBtn" style="align-self:flex-start">edit message</button></div>';

        const copyBtn = $("copyBtn");
        copyBtn?.addEventListener("click", () => {
          const btn = copyBtn;
          const t = "Subject: " + subject + "\n\n" + text;
          const fallback = () => {
            const composed = $("composed");
            if (!composed) return;
            const r = document.createRange();
            r.selectNodeContents(composed);
            const s = getSelection();
            s?.removeAllRanges();
            s?.addRange(r);
            btn.textContent = "selected: press ⌘C / Ctrl+C";
          };
          try {
            navigator.clipboard.writeText(t).then(() => {
              btn.textContent = "copied";
            }, fallback);
          } catch {
            fallback();
          }
        });
        $("editBtn")?.addEventListener("click", () => {
          sent!.hidden = true;
          f!.hidden = false;
        });
      }

      function showSent() {
        sent!.innerHTML =
          '<div style="display:flex; flex-direction:column; gap:8px"><h3 style="margin:0">message sent</h3><p class="muted">Thanks, ' +
          esc(data.name) + ". I'll get back to you at " + esc(data.email) + ".</p></div>";
      }

      f!.hidden = true;
      sent.hidden = false;
      sent.innerHTML = '<p class="muted">Sending…</p>';

      /* No external endpoint configured: post to this app's own API route. */
      const endpoint = cfg.formEndpoint || "/api/contact";
      const body = cfg.formEndpoint
        ? JSON.stringify(data)
        : JSON.stringify({ name: data.name, email: data.email, subject, message: text });

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body,
      })
        .then((r) => {
          if (!r.ok) throw new Error(String(r.status));
          showSent();
        })
        .catch(showCompose);
    });
  }

  /* ─── Clock ────────────────────────────────────────────────────── */

  const clock = $("clock");
  function tick() {
    if (!clock) return;
    try {
      clock.textContent = new Intl.DateTimeFormat("en-US", {
        hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila",
      }).format(new Date());
    } catch {
      /* Intl without tz data: leave the placeholder. */
    }
  }
  tick();
  const clockTimer = setInterval(tick, 30000);
  cleanups.push(() => clearInterval(clockTimer));

  /* ─── Welcome toast ────────────────────────────────────────────── */

  function toast() {
    let seen = false;
    try {
      seen = sessionStorage.getItem("stal-toast") === "1";
      sessionStorage.setItem("stal-toast", "1");
    } catch {
      /* private browsing: just show it. */
    }
    if (seen) return;
    const host = $("toastHost");
    if (!host) return;
    timers.push(
      setTimeout(() => {
        host.innerHTML =
          '<div class="toast" role="status"><span class="ti">' + glyph("about") +
          '</span><div><b>stal · now</b><p>hey, thanks for stopping by. Press <span class="mono">' +
          (isMac ? "⌘K" : "Ctrl K") +
          '</span> to search anything, or try the terminal on the about page.</p></div><button type="button" aria-label="Dismiss">×</button></div>';
        const t = host.firstChild as HTMLElement;
        t.querySelector("button")?.addEventListener("click", () => {
          host.innerHTML = "";
        });
        timers.push(
          setTimeout(() => {
            if (host.firstChild === t) host.innerHTML = "";
          }, 9000)
        );
      }, 1200)
    );
  }
  /* ─── Footer folder word ───────────────────────────────────────── */

  const fw = $("foldword");
  if (fw) {
    const { cols, html } = foldWord("stal");
    fw.style.gridTemplateColumns = "repeat(" + cols + ", minmax(0,1fr))";
    fw.innerHTML = html;
    /* F1: folders fall into place, column by column. */
    if (!reduce) {
      fw.querySelectorAll<HTMLElement>("i").forEach((el, i) => {
        el.style.setProperty("--i", String(i % cols));
      });
      cleanups.push(onVisible(fw, () => fw.classList.add("drop"), { threshold: 0.3 }));
    }
  }

  route();
  toast();

  return () => cleanups.forEach((fn) => fn());
}
