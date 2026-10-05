/* ─────────────────────────────────────────────────────────────────────
   Navigable project walkthroughs — the full set.

   Split by kind so each file stays readable: the full-stack systems
   carry the most depth, since their value is in the workflows and the
   data model behind them.

   See demos-systems.ts for the NDA rules that govern the client work.
   ───────────────────────────────────────────────────────────────────── */

import type { DemoSpec } from "./demo-types";
import { SYSTEM_DEMOS } from "./demos-systems";
import { PRODUCT_DEMOS } from "./demos-products";

export const DEMOS: DemoSpec[] = [...SYSTEM_DEMOS, ...PRODUCT_DEMOS];
