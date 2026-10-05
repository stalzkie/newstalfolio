/* ─────────────────────────────────────────────────────────────────────
   Motion helpers (motion-spec.md §2.2).

   Dependency-free, and every one of them is a no-op under
   prefers-reduced-motion, so callers do not have to check.
   ───────────────────────────────────────────────────────────────────── */

export const reduced = () =>
  typeof matchMedia !== "undefined" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches;

export const finePointer = () =>
  typeof matchMedia !== "undefined" && matchMedia("(pointer: fine)").matches;

export const hasIO = () => typeof IntersectionObserver !== "undefined";

/** Runs `cb` once, the first time `el` scrolls into view. */
export function onVisible(
  el: Element,
  cb: (el: Element) => void,
  opts: IntersectionObserverInit = { threshold: 0.25 }
): () => void {
  if (!hasIO()) {
    cb(el);
    return () => {};
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      cb(e.target);
    }
  }, opts);
  io.observe(el);
  return () => io.disconnect();
}

/**
 * Starts a loop while `el` is on screen and the tab is visible, stops it
 * otherwise. Returns a teardown that also stops the loop.
 */
export function whileVisible(
  el: Element,
  start: () => void,
  stop: () => void
): () => void {
  let running = false;
  let visible = false;

  const sync = () => {
    const want = visible && !document.hidden;
    if (want && !running) {
      running = true;
      start();
    } else if (!want && running) {
      running = false;
      stop();
    }
  };

  const onVis = () => sync();
  document.addEventListener("visibilitychange", onVis);

  if (!hasIO()) {
    visible = true;
    sync();
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      if (running) stop();
    };
  }

  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    sync();
  });
  io.observe(el);

  return () => {
    io.disconnect();
    document.removeEventListener("visibilitychange", onVis);
    if (running) stop();
  };
}

/**
 * FLIP: measure before a DOM change, then call the returned function
 * after it to animate each element from where it was to where it is.
 */
export function flip(els: Iterable<HTMLElement>): () => void {
  const first = new Map<HTMLElement, DOMRect>();
  for (const el of els) first.set(el, el.getBoundingClientRect());
  return () => {
    if (reduced()) return;
    first.forEach((f, el) => {
      const l = el.getBoundingClientRect();
      const dx = f.left - l.left;
      const dy = f.top - l.top;
      if (!dx && !dy) return;
      el.animate(
        [{ transform: `translate(${dx}px,${dy}px)` }, { transform: "none" }],
        { duration: 380, easing: "cubic-bezier(.2,.8,.2,1)" }
      );
    });
  };
}

/**
 * Publishes the pointer position on `el` as `--mx` / `--my` percentages,
 * for spotlight and holographic effects. Fine pointers only.
 */
export function trackPointer(el: HTMLElement): () => void {
  if (!finePointer() || reduced()) return () => {};
  const move = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
    el.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
  };
  const leave = () => {
    el.style.removeProperty("--mx");
    el.style.removeProperty("--my");
  };
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerleave", leave);
  return () => {
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerleave", leave);
  };
}

/**
 * A 3D tilt toward the pointer, written as `--rx` / `--ry` degrees so the
 * CSS decides how to use them.
 */
export function tilt(el: HTMLElement, max = 4): () => void {
  if (!finePointer() || reduced()) return () => {};
  const move = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", (px * max * 2).toFixed(2) + "deg");
    el.style.setProperty("--rx", (-py * max * 2).toFixed(2) + "deg");
  };
  const leave = () => {
    el.style.removeProperty("--rx");
    el.style.removeProperty("--ry");
  };
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerleave", leave);
  return () => {
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerleave", leave);
  };
}

/**
 * Pulls a control up to `strength` px toward the pointer while it is
 * close, and releases it on leave (motion-spec G7).
 */
export function magnetic(el: HTMLElement, strength = 6): () => void {
  if (!finePointer() || reduced()) return () => {};
  const move = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    el.style.setProperty("--magx", (dx * 0.18).toFixed(1) + "px");
    el.style.setProperty("--magy", (dy * 0.3).toFixed(1) + "px");
  };
  const leave = () => {
    el.style.removeProperty("--magx");
    el.style.removeProperty("--magy");
  };
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerleave", leave);
  void strength;
  return () => {
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerleave", leave);
  };
}

/**
 * Rolls a number up to the value already in the DOM, keeping whatever
 * prefix and suffix surround it ("4,000+", "3rd").
 *
 * Safe to call more than once on the same element: the target is cached
 * on first call, so a second pass can never mistake a half-counted
 * number for the real one, and a run in flight is not restarted.
 */
export function countUp(el: HTMLElement, duration = 900, delay = 0): void {
  if (el.dataset.counting === "1") return;
  const final = el.dataset.countTo ?? el.textContent ?? "";
  el.dataset.countTo = final;
  const m = final.match(/^([^\d]*)([\d,]+)(.*)$/);
  if (reduced() || !m) return;
  const target = Number(m[2].replace(/,/g, ""));
  if (!isFinite(target) || target === 0) return;
  const grouped = m[2].indexOf(",") > -1;
  const t0 = performance.now() + delay;
  el.dataset.counting = "1";

  /* requestAnimationFrame stalls in a background tab, which would leave
     a half-counted number on screen. setTimeout still fires, so this
     guarantees the real value lands whatever the browser does. */
  const settle = setTimeout(() => {
    el.textContent = final;
    delete el.dataset.counting;
  }, delay + duration + 400);

  const step = (now: number) => {
    const p = Math.min(1, Math.max(0, (now - t0) / duration));
    const v = Math.round(target * (1 - Math.pow(1 - p, 3)));
    el.textContent = m[1] + (grouped ? v.toLocaleString("en-US") : String(v)) + m[3];
    if (p < 1) {
      requestAnimationFrame(step);
      return;
    }
    clearTimeout(settle);
    el.textContent = final;
    delete el.dataset.counting;
  };
  requestAnimationFrame(step);
}

/**
 * Wraps a view-transition around a DOM change (motion-spec G1). Falls
 * back to running the change immediately where the API is missing or
 * motion is reduced.
 */
export function withViewTransition(change: () => void): void {
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => {
      ready: Promise<void>;
      finished: Promise<void>;
      updateCallbackDone: Promise<void>;
    };
  };
  /* A hidden document aborts the transition outright, so skip it and
     just make the change. */
  if (reduced() || document.hidden || typeof doc.startViewTransition !== "function") {
    change();
    return;
  }
  try {
    const vt = doc.startViewTransition(change);
    /* An aborted transition still applies the DOM change; swallow the
       rejection so it never surfaces as an unhandled error. */
    swallow(vt.ready);
    swallow(vt.finished);
    swallow(vt.updateCallbackDone);
  } catch {
    change();
  }
}

/** Ignores a promise rejection without leaving it unhandled. */
export function swallow(p: Promise<unknown> | undefined): void {
  if (p && typeof p.then === "function") p.then(undefined, () => {});
}
