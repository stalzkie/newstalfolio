/* ─────────────────────────────────────────────────────────────────────
   Navigable project demos — the shape of a demo.

   Each demo mirrors the navigation of the real project (read from its
   repository) but contains only invented sample data, no branding, and
   no colour: everything renders in grey so it reads as a wireframe
   rather than a screenshot of a live system.

   NDA: for client work, screen names stay generic industry terms.
   Never put a client, development, or project name in a spec — not even
   an abbreviation.
   ───────────────────────────────────────────────────────────────────── */

export type DemoBlock =
  /** A row of headline figures. */
  | { kind: "stats"; items: [string, string][] }
  /** Rows of data; `open` makes each row navigate to that screen. */
  | { kind: "table"; cols: string[]; rows: string[][]; open?: string }
  /** Columns of cards. Clicking a card advances it to the next column. */
  | { kind: "board"; cols: string[]; cards: { col: number; text: string; meta?: string }[] }
  /** Label / value pairs, for a detail panel. */
  | { kind: "kv"; title?: string; items: [string, string][] }
  /** Horizontal bars, 0–100. */
  | { kind: "chart"; title?: string; bars: [string, number][] }
  /** A clickable map of cells; clicking one cycles its state. */
  | { kind: "grid"; title?: string; cols: number; cells: number[]; legend: string[] }
  /** A simple list of items. */
  | { kind: "list"; title?: string; items: { title: string; meta?: string; note?: string }[] }
  /** A read-only form, to show what a flow captures. */
  | { kind: "form"; title?: string; fields: [string, string][]; submit?: string }
  /** A short explanatory line. */
  | { kind: "note"; text: string }
  /** A pipeline or stepper, with one step highlighted. */
  | { kind: "steps"; items: string[]; active?: number }
  /** Two columns of blocks side by side. */
  | { kind: "split"; left: DemoBlock[]; right: DemoBlock[] }
  /** The data model behind a screen: field name, type, and any enum. */
  | { kind: "fields"; title?: string; entity: string; items: [string, string, string?][] }
  /** A long state machine, rendered compactly. `at` marks where a record sits. */
  | { kind: "lifecycle"; title?: string; note?: string; states: string[]; at?: number }
  /** An audit trail or activity log. */
  | { kind: "timeline"; title?: string; items: { when: string; who: string; what: string; detail?: string }[] }
  /** A toolbar of filters above a table, purely indicative. */
  | { kind: "filters"; items: string[]; active?: number };

export interface DemoScreen {
  id: string;
  /** Sidebar label. */
  label: string;
  /** Group heading in the sidebar; screens with the same group sit together. */
  group?: string;
  title: string;
  note?: string;
  blocks: DemoBlock[];
  /** Hidden from the sidebar — reached by drilling into a row. */
  sub?: boolean;
}

export interface DemoSpec {
  /** Matches a project slug. */
  slug: string;
  /** Window title, after "demo.app — ". */
  name: string;
  /** One line under the window chrome. */
  blurb: string;
  /** Renders the screens inside a phone shell. */
  frame?: "phone";
  screens: DemoScreen[];
}
