"use client";

import { useEffect, useRef } from "react";
import { wireDemo } from "@/lib/desktop/demo";

/**
 * Attaches the demo's navigation to markup that was rendered on the
 * server, so /demo/<slug> is a real, shareable, indexable page rather
 * than an empty shell that fills in after hydration.
 */
export function DemoClient() {
  const done = useRef(false);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".demo");
    if (!root || done.current) return;
    done.current = true;
    const stop = wireDemo(root);
    return () => {
      done.current = false;
      stop();
    };
  }, []);

  return null;
}
