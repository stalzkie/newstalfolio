"use client";

import { useEffect } from "react";
import { mountDesktop } from "@/lib/desktop/mount";
import type { SiteContent } from "@/lib/desktop/types";

/**
 * Mounts the framework-free desktop runtime onto the chrome that
 * app/page.tsx rendered on the server, and tears it down on unmount.
 *
 * The page's markup is produced by plain template-string functions
 * (lib/desktop/render.ts) exactly as in the handover spec; React's only
 * job here is lifecycle.
 */
export function DesktopRoot({
  content,
  initialRoute,
}: {
  content: SiteContent;
  initialRoute?: string;
}) {
  useEffect(() => mountDesktop(content, { initialRoute }), [content, initialRoute]);
  return null;
}
