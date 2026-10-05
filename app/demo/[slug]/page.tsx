import "../../desktop.css";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoClient } from "@/components/demo-client";
import { DEMOS } from "@/lib/desktop/demos";
import { demoHtml } from "@/lib/desktop/demo";

/* Specs are static data, so every demo page is prerendered. */
export function generateStaticParams() {
  return DEMOS.map((d) => ({ slug: d.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const spec = DEMOS.find((d) => d.slug === slug);
  if (!spec) return {};
  return {
    title: `${spec.name} — walkthrough · Stal Dollosa`,
    description: spec.blurb,
    alternates: { canonical: `/demo/${spec.slug}` },
  };
}

export default async function DemoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const spec = DEMOS.find((d) => d.slug === slug);
  if (!spec) notFound();

  return (
    <div className="demo-page">
      <header className="demo-top">
        <a className="demo-back" href={`/#p-${spec.slug}`}>
          ← case study
        </a>
        <span className="demo-name">{spec.name}</span>
        <span className="demo-flag">walkthrough · sample data</span>
      </header>

      {/* Server-rendered so the URL works on its own; DemoClient only
          attaches the navigation. */}
      <main
        className="demo-stage"
        dangerouslySetInnerHTML={{ __html: demoHtml(spec) }}
      />

      <footer className="demo-foot">
        <p>
          A walkthrough of the screens and navigation, built from the project&apos;s own
          structure. Every record shown is invented, and client systems are shown by industry
          only.
        </p>
        <Link href="/">stalfolio ↗</Link>
      </footer>

      <DemoClient />
    </div>
  );
}
