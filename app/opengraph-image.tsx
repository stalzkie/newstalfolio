import { ImageResponse } from "next/og";
import { getSiteContent } from "@/lib/site-service";

/* Read per request so an uploaded OG image takes effect without a redeploy. */
export const revalidate = 0;

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Stal Dollosa · Software, Mobile & AI Engineer";

/**
 * Social preview. Renders the designed card by default; when an OG image
 * is attached in /admin it is used full-bleed instead.
 */
export default async function Image() {
  const { config } = await getSiteContent();
  const ogImage = config.ogImageUrl;

  if (ogImage) {
    return new ImageResponse(
      (
        <div style={{ display: "flex", width: "100%", height: "100%" }}>
          <img src={ogImage} alt="" width={1200} height={630} style={{ objectFit: "cover" }} />
        </div>
      ),
      size
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#eeeff2",
          padding: 64,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: "#ffffff",
            border: "1px solid #e1e3e8",
            borderRadius: 18,
            overflow: "hidden",
          }}
        >
          {/* Window title bar with traffic lights */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "16px 20px",
              background: "#f6f7f9",
              borderBottom: "1px solid #e1e3e8",
            }}
          >
            <div style={{ width: 13, height: 13, borderRadius: 99, background: "#ff5f57" }} />
            <div style={{ width: 13, height: 13, borderRadius: 99, background: "#febc2e" }} />
            <div style={{ width: 13, height: 13, borderRadius: 99, background: "#28c840" }} />
            <div style={{ marginLeft: 16, fontSize: 20, color: "#686c76" }}>~/stal</div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "0 64px",
              gap: 20,
            }}
          >
            <div style={{ fontSize: 24, color: "#2b72ee", letterSpacing: -0.5 }}>
              {config.heroEyebrow}
            </div>
            <div
              style={{
                fontSize: 92,
                fontWeight: 600,
                color: "#141518",
                letterSpacing: -4,
                lineHeight: 1,
              }}
            >
              {config.heroName}
            </div>
            <div style={{ fontSize: 30, color: "#686c76", lineHeight: 1.35, maxWidth: 900 }}>
              {config.heroFine}
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
