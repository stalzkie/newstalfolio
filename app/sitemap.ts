import type { MetadataRoute } from "next";
import { DEMOS } from "@/lib/desktop/demos";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://stalfolio.com";

/* The portfolio is one page with hash routes; each project walkthrough
   is a real URL of its own. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, lastModified: new Date(), priority: 1 },
    ...DEMOS.map((d) => ({
      url: `${SITE_URL}/demo/${d.slug}`,
      lastModified: new Date(),
      priority: 0.6,
    })),
  ];
}
