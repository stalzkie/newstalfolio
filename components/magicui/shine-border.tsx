"use client";

import { cn } from "@/lib/utils";
import { CSSProperties } from "react";

export interface ShineBorderProps {
  borderRadius?: number;
  borderWidth?: number;
  duration?: number;
  /** Accepted as `color` (array/string) or `shineColor` (string) */
  color?: string | string[];
  shineColor?: string | string[];
  className?: string;
  style?: CSSProperties;
}

/**
 * Two usage patterns:
 *
 * 1. Overlay (recommended) — place as a sibling inside a `relative overflow-hidden` container:
 *    ```tsx
 *    <div className="relative overflow-hidden rounded-2xl">
 *      <ShineBorder shineColor={["#9ca3af", "#d1d5db"]} />
 *      ...content...
 *    </div>
 *    ```
 *
 * 2. Wrapper (legacy) — wraps children directly (no longer recommended):
 *    ```tsx
 *    <ShineBorder color={["#9ca3af", "#d1d5db"]} className="bg-white">
 *      ...content...
 *    </ShineBorder>
 *    ```
 */
export function ShineBorder({
  borderRadius = 8,
  borderWidth = 1.5,
  duration = 12,
  color,
  shineColor,
  className,
  style,
}: ShineBorderProps) {
  const resolvedColor = shineColor ?? color ?? ["#9ca3af", "#6b7280", "#d1d5db"];
  const gradient = `radial-gradient(transparent, transparent, ${
    Array.isArray(resolvedColor) ? resolvedColor.join(",") : resolvedColor
  }, transparent, transparent)`;
  const mask = `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`;

  return (
    <div
      aria-hidden="true"
      style={
        {
          "--shine-border-radius": `${borderRadius}px`,
          "--shine-border-width": `${borderWidth}px`,
          "--shine-duration": `${duration}s`,
          "--shine-gradient": gradient,
          "--shine-mask": mask,
          borderRadius: `var(--shine-border-radius)`,
          ...style,
        } as CSSProperties
      }
      className={cn(
        "pointer-events-none absolute inset-0 before:absolute before:inset-0 before:rounded-[var(--shine-border-radius)] before:p-[var(--shine-border-width)] before:will-change-[background-position] before:content-[''] before:[background-image:var(--shine-gradient)] before:[background-size:300%_300%] before:[mask:var(--shine-mask)] motion-safe:before:animate-[shine_var(--shine-duration)_infinite_linear]",
        className
      )}
    />
  );
}
