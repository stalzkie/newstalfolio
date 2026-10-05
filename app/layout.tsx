import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  weight: ["400", "500"],
  display: "swap",
});

/* Still used by the admin and legacy tool pages via globals.css. */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://stalfolio.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Stal Dollosa · Software, Mobile & AI Engineer",
  description:
    "Stalingrad Dollosa: freelance software engineer, mobile developer, and AI engineer in Bacolod City, Philippines. Full-stack systems, mobile apps, and AI-native tools that hold up in production.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Stal Dollosa · Software, Mobile & AI Engineer",
    description:
      "Full-stack systems, mobile apps, and AI-native tools that hold up in production.",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stal Dollosa · Software, Mobile & AI Engineer",
    description:
      "Full-stack systems, mobile apps, and AI-native tools that hold up in production.",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.jpg" },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /* data-theme="light" pins the site to the light palette instead of
       following the visitor's system setting; the dark token block in
       desktop.css is guarded by :root:not([data-theme="light"]).

       Font variables go on <html> so the design tokens in desktop.css,
       which are declared on :root, can read them. */
    <html
      lang="en"
      data-theme="light"
      className={`${geist.variable} ${geistMono.variable} ${inter.variable}`}
    >
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
