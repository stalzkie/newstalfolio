/* ─────────────────────────────────────────────────────────────────────
   Navigable project demos — renderer and wiring.

   Loaded lazily, only when a case study that has a demo is opened, so
   none of this is in the first-load bundle.

   Everything renders inside `.demo`, which overrides the colour tokens
   to greys: the demos are wireframes of the real navigation, not
   screenshots, and they must never look like branded product shots.
   ───────────────────────────────────────────────────────────────────── */

import { DEMOS } from "./demos";
import { esc } from "./render";
import type { DemoBlock, DemoScreen, DemoSpec } from "./demo-types";

export function hasDemo(slug: string): boolean {
  return DEMOS.some((d) => d.slug === slug);
}

/* ─── Blocks ─────────────────────────────────────────────────────── */

function block(b: DemoBlock): string {
  switch (b.kind) {
    case "stats":
      return (
        '<div class="d-stats">' +
        b.items
          .map(([v, l]) => '<div class="d-stat"><b>' + esc(v) + "</b><span>" + esc(l) + "</span></div>")
          .join("") +
        "</div>"
      );

    case "table":
      return (
        '<div class="d-tablewrap"><table class="d-table"><thead><tr>' +
        b.cols.map((c) => "<th>" + esc(c) + "</th>").join("") +
        "</tr></thead><tbody>" +
        b.rows
          .map(
            (r) =>
              "<tr" +
              (b.open ? ' tabindex="0" role="button" class="go" data-go="' + esc(b.open) + '"' : "") +
              ">" +
              r.map((cell) => "<td>" + cellHtml(cell) + "</td>").join("") +
              "</tr>"
          )
          .join("") +
        "</tbody></table></div>"
      );

    case "board":
      return (
        '<div class="d-board">' +
        b.cols
          .map(
            (c, i) =>
              '<div class="d-col" data-col="' + i + '"><h5>' + esc(c) +
              ' <span class="n">' + b.cards.filter((k) => k.col === i).length + "</span></h5>" +
              b.cards
                .map((k, ki) =>
                  k.col === i
                    ? '<button type="button" class="d-card" data-card="' + ki + '">' +
                      esc(k.text) + (k.meta ? "<span>" + esc(k.meta) + "</span>" : "") + "</button>"
                    : ""
                )
                .join("") +
              "</div>"
          )
          .join("") +
        '</div><p class="d-hint">Click a card to move it along.</p>'
      );

    case "kv":
      return (
        '<div class="d-box">' +
        (b.title ? "<h5>" + esc(b.title) + "</h5>" : "") +
        '<dl class="d-kv">' +
        b.items.map(([k, v]) => "<dt>" + esc(k) + "</dt><dd>" + cellHtml(v) + "</dd>").join("") +
        "</dl></div>"
      );

    case "chart":
      return (
        '<div class="d-box">' +
        (b.title ? "<h5>" + esc(b.title) + "</h5>" : "") +
        '<div class="d-bars">' +
        b.bars
          .map(
            ([l, v]) =>
              '<div class="d-barrow"><span>' + esc(l) + '</span><i style="--v:' +
              Math.max(0, Math.min(100, v)) + '%"></i><b>' + Math.round(v) + "%</b></div>"
          )
          .join("") +
        "</div></div>"
      );

    case "grid":
      return (
        '<div class="d-box">' +
        (b.title ? "<h5>" + esc(b.title) + "</h5>" : "") +
        '<div class="d-grid" style="--cols:' + b.cols + '" data-legend="' + esc(b.legend.join("|")) + '">' +
        b.cells
          .map(
            (s, i) =>
              '<button type="button" class="d-cell" data-s="' + s + '" data-i="' + i +
              '" aria-label="cell ' + (i + 1) + ', ' + esc(b.legend[s] || "") + '"></button>'
          )
          .join("") +
        "</div>" +
        '<div class="d-legend">' +
        b.legend.map((l, i) => '<span data-s="' + i + '"><i></i>' + esc(l) + "</span>").join("") +
        "</div>" +
        '<p class="d-hint">Click a cell to change its state.</p></div>'
      );

    case "list":
      return (
        '<div class="d-box">' +
        (b.title ? "<h5>" + esc(b.title) + "</h5>" : "") +
        '<ul class="d-list">' +
        b.items
          .map(
            (it) =>
              "<li><b>" + esc(it.title) + "</b>" +
              (it.meta ? '<span class="m">' + esc(it.meta) + "</span>" : "") +
              (it.note ? "<p>" + esc(it.note) + "</p>" : "") +
              "</li>"
          )
          .join("") +
        "</ul></div>"
      );

    case "form":
      return (
        '<div class="d-box">' +
        (b.title ? "<h5>" + esc(b.title) + "</h5>" : "") +
        '<div class="d-form">' +
        b.fields
          .map(
            ([l, v]) =>
              '<label class="d-field"><span>' + esc(l) + "</span><i>" + esc(v) + "</i></label>"
          )
          .join("") +
        "</div>" +
        (b.submit ? '<span class="d-btn" aria-disabled="true">' + esc(b.submit) + "</span>" : "") +
        "</div>"
      );

    case "steps":
      return (
        '<ol class="d-steps">' +
        b.items
          .map(
            (s, i) =>
              '<li' + (i === (b.active ?? -1) ? ' class="on"' : "") + "><i>" + (i + 1) + "</i>" + esc(s) + "</li>"
          )
          .join("") +
        "</ol>"
      );

    case "note":
      return '<p class="d-note">' + esc(b.text) + "</p>";

    case "split":
      return (
        '<div class="d-split"><div>' + b.left.map(block).join("") + "</div><div>" +
        b.right.map(block).join("") + "</div></div>"
      );

    case "fields":
      return (
        '<div class="d-box d-schema">' +
        '<h5>' + esc(b.title || "data model") + ' <span class="d-ent">' + esc(b.entity) + "</span></h5>" +
        '<div class="d-fields">' +
        b.items
          .map(
            ([name, type, values]) =>
              '<div class="d-fld"><code>' + esc(name) + "</code><em>" + esc(type) + "</em>" +
              (values ? '<span class="d-enum">' + esc(values) + "</span>" : "") + "</div>"
          )
          .join("") +
        "</div></div>"
      );

    case "lifecycle":
      return (
        '<div class="d-box">' +
        (b.title ? "<h5>" + esc(b.title) + "</h5>" : "") +
        (b.note ? '<p class="d-hint">' + esc(b.note) + "</p>" : "") +
        '<ol class="d-life">' +
        b.states
          .map(
            (st, i) =>
              "<li" + (i === (b.at ?? -1) ? ' class="at"' : "") + ">" +
              '<span class="n">' + (i + 1) + "</span>" + esc(st) + "</li>"
          )
          .join("") +
        "</ol></div>"
      );

    case "timeline":
      return (
        '<div class="d-box">' +
        (b.title ? "<h5>" + esc(b.title) + "</h5>" : "") +
        '<ol class="d-time">' +
        b.items
          .map(
            (it) =>
              '<li><span class="w">' + esc(it.when) + "</span>" +
              '<span class="b"><b>' + esc(it.what) + '</b><span class="who">' + esc(it.who) + "</span>" +
              (it.detail ? "<p>" + esc(it.detail) + "</p>" : "") + "</span></li>"
          )
          .join("") +
        "</ol></div>"
      );

    case "filters":
      return (
        '<div class="d-filters">' +
        b.items
          .map(
            (f, i) =>
              '<span class="d-filter' + (i === (b.active ?? 0) ? " on" : "") + '">' + esc(f) + "</span>"
          )
          .join("") +
        "</div>"
      );
  }
}

/** Renders a status word as a chip, anything else as plain text. */
function cellHtml(v: string): string {
  const m = /^\[(.+)\]$/.exec(v);
  return m ? '<span class="d-chip">' + esc(m[1]) + "</span>" : esc(v);
}

/* ─── Screen and shell ───────────────────────────────────────────── */

function screenHtml(s: DemoScreen, i: number): string {
  return (
    '<section class="d-screen" id="dsc-' + s.id + '" role="tabpanel"' + (i ? " hidden" : "") + ">" +
    '<header class="d-head"><h4>' + esc(s.title) + "</h4>" +
    (s.note ? "<p>" + esc(s.note) + "</p>" : "") + "</header>" +
    s.blocks.map(block).join("") +
    "</section>"
  );
}

export function demoHtml(spec: DemoSpec): string {
  const nav = spec.screens.filter((s) => !s.sub);

  /* Collect screens under their group, keeping the order each group
     first appears. Without this a group listed twice in the spec would
     print its heading twice. */
  const order: string[] = [];
  const byGroup = new Map<string, DemoScreen[]>();
  for (const s of nav) {
    const g = s.group || "";
    if (!byGroup.has(g)) {
      byGroup.set(g, []);
      order.push(g);
    }
    byGroup.get(g)!.push(s);
  }

  /* Tab order follows the sidebar, so arrow keys move the way the eye
     does. */
  const flat = order.flatMap((g) => byGroup.get(g)!);

  const side = order
    .map((g) => {
      const items = byGroup.get(g)!;
      return (
        (g ? '<span class="d-grp">' + esc(g) + "</span>" : "") +
        items
          .map((s) => {
            const first = flat.indexOf(s) === 0;
            return (
              '<button type="button" class="d-tab" role="tab" data-screen="' + esc(s.id) +
              '" aria-selected="' + first + '" tabindex="' + (first ? 0 : -1) + '">' +
              esc(s.label) + "</button>"
            );
          })
          .join("")
      );
    })
    .join("");

  return (
    '<div class="demo' + (spec.frame === "phone" ? " phone" : "") + '" data-demo="' + esc(spec.slug) + '">' +
      '<div class="d-bar">' +
        '<span class="dots"><i></i><i></i><i></i></span>' +
        '<span class="d-title">demo.app — ' + esc(spec.name) + "</span>" +
        '<span class="d-tag">demo data</span>' +
        '<a class="d-open" href="/demo/' + esc(spec.slug) + '">full screen ↗</a>' +
      "</div>" +
      '<p class="d-blurb">' + esc(spec.blurb) + "</p>" +
      '<div class="d-body">' +
        '<nav class="d-side" role="tablist" aria-label="' + esc(spec.name) + ' screens">' + side + "</nav>" +
        '<div class="d-main">' +
          '<div class="d-crumb" hidden><button type="button" class="d-back">← back</button></div>' +
          spec.screens
            .map((sc) => screenHtml(sc, sc.id === flat[0]?.id ? 0 : 1))
            .join("") +
        "</div>" +
      "</div>" +
    "</div>"
  );
}

/* ─── Wiring ─────────────────────────────────────────────────────── */

/**
 * Mounts the demo for `slug` into `host`. Returns a teardown, or null
 * when that project has no demo.
 */
export function mountDemo(host: HTMLElement, slug: string): (() => void) | null {
  const spec = DEMOS.find((d) => d.slug === slug);
  if (!spec) return null;
  host.innerHTML = demoHtml(spec);
  const root = host.querySelector<HTMLElement>(".demo");
  if (!root) return null;
  const stop = wireDemo(root);
  return () => {
    stop();
    host.innerHTML = "";
  };
}

/**
 * Attaches the navigation and interactions to an already-rendered demo
 * root. The full-screen page at /demo/<slug> server-renders the markup
 * and calls this, so the page works as a shareable URL.
 */
export function wireDemo(root: HTMLElement): () => void {
  const tabs = Array.from(root.querySelectorAll<HTMLElement>(".d-tab"));
  const crumb = root.querySelector<HTMLElement>(".d-crumb");
  const back = root.querySelector<HTMLElement>(".d-back");
  let previous = tabs[0]?.dataset.screen || "";

  function show(id: string, opts: { drill?: boolean; focus?: boolean } = {}) {
    const screens = root.querySelectorAll<HTMLElement>(".d-screen");
    let found = false;
    screens.forEach((sc) => {
      const on = sc.id === "dsc-" + id;
      sc.hidden = !on;
      if (on) found = true;
    });
    if (!found) return;

    tabs.forEach((t) => {
      const on = t.dataset.screen === id;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && opts.focus) t.focus();
    });
    if (crumb) crumb.hidden = !opts.drill;
    root.querySelector(".d-main")?.scrollTo({ top: 0 });
  }

  tabs.forEach((t, i) => {
    t.addEventListener("click", () => {
      previous = t.dataset.screen || previous;
      show(t.dataset.screen || "");
    });
    t.addEventListener("keydown", (e: KeyboardEvent) => {
      const d =
        e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 :
        e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      const next = tabs[(i + d + tabs.length) % tabs.length];
      previous = next.dataset.screen || previous;
      show(next.dataset.screen || "", { focus: true });
    });
  });

  back?.addEventListener("click", () => show(previous));

  /* Drill into a row. */
  root.addEventListener("click", (e) => {
    const row = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-go]");
    if (!row) return;
    show(row.dataset.go || "", { drill: true });
  });
  root.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const row = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-go]");
    if (!row) return;
    e.preventDefault();
    show(row.dataset.go || "", { drill: true });
  });

  /* Board cards advance a stage; grid cells cycle state. */
  root.addEventListener("click", (e) => {
    const target = e.target as HTMLElement | null;

    const card = target?.closest<HTMLElement>(".d-card");
    if (card) {
      const board = card.closest(".d-board");
      const col = card.closest<HTMLElement>(".d-col");
      if (board && col) {
        const index = Number(col.dataset.col || 0);
        const cols = Array.from(board.querySelectorAll<HTMLElement>(".d-col"));
        const next = cols[(index + 1) % cols.length];
        next.appendChild(card);
        cols.forEach((c) => {
          const n = c.querySelector(".n");
          if (n) n.textContent = String(c.querySelectorAll(".d-card").length);
        });
      }
      return;
    }

    const cell = target?.closest<HTMLElement>(".d-cell");
    if (cell) {
      const grid = cell.closest<HTMLElement>(".d-grid");
      const legend = (grid?.dataset.legend || "").split("|");
      const next = (Number(cell.dataset.s || 0) + 1) % Math.max(1, legend.length);
      cell.dataset.s = String(next);
      cell.setAttribute(
        "aria-label",
        (cell.getAttribute("aria-label") || "").replace(/,.*$/, ", " + (legend[next] || ""))
      );
    }
  });

  return () => {
    /* Listeners live on `root`; dropping the node drops them. */
  };
}
