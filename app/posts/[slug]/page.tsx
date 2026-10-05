import "../../desktop.css";

import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { ThemeInit } from "@/components/theme-init";

/* Posts are edited in the admin, so a published change shows up without a
   redeploy. */
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

interface Neighbour {
  slug: string;
  title: string;
}

/** Window-bar filename, the way every other surface on the site names one. */
function fileName(slug: string): string {
  return slug + ".md";
}

/** "august 17, 2026" — lowercase, to match the rest of the site's voice. */
function longDate(value: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d
    .toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    .toLowerCase();
}

/** Rounded up, and never "0 min" for a post that exists. */
function readingTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200)) + " min read";
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;

  /* Reject anything that is not a plain slug before it reaches the query. */
  if (!/^[a-z0-9-]{1,200}$/.test(slug)) notFound();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) notFound();

  const supabase = createClient(url, key);

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) notFound();

  /* Neighbours for the pager, in the same order the writing feed lists
     them, so "previous" means what the reader just scrolled past. */
  const { data: feed } = await supabase
    .from("projects")
    .select("slug,title")
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });

  const list: Neighbour[] = feed ?? [];
  const at = list.findIndex((p) => p.slug === slug);
  const prev = at > 0 ? list[at - 1] : null;
  const next = at >= 0 && at < list.length - 1 ? list[at + 1] : null;

  const published = longDate(data.published_at);
  const content: string = data.content || "";
  const tags: string[] = Array.isArray(data.tags) ? data.tags : [];

  return (
    <div className="post-page">
      <ThemeInit />

      <header className="post-top">
        <Link className="post-back" href="/#writing">
          ← writing
        </Link>
        <span className="post-name">{data.title}</span>
        <span className="post-flag">{fileName(slug)}</span>
      </header>

      <main className="post-stage">
        <article className="win post-win">
          <div className="win-bar">
            <span className="dots">
              <i />
              <i />
              <i />
            </span>
            <span className="win-title">{fileName(slug)}</span>
          </div>

          {/* A cover is a screenshot in a window, like every other image
              on the site — not a full-bleed banner above the chrome. */}
          {data.cover_image_url ? (
            /* Covers are arbitrary Supabase storage URLs and next/image has
               no remotePatterns configured, so this stays a plain img. */
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              className="post-cover"
              src={data.cover_image_url}
              alt=""
              decoding="async"
            />
          ) : null}

          <div className="post-body">
            <header className="post-head">
              <div className="post-kicker">
                {data.category ? (
                  <span className="eyebrow-pill">{String(data.category).toLowerCase()}</span>
                ) : null}
                {published ? <span className="post-when">{published}</span> : null}
                {content ? <span className="post-when">{readingTime(content)}</span> : null}
              </div>

              <h1>{data.title}</h1>

              {data.description ? (
                <p className="post-lead">{data.description}</p>
              ) : null}
            </header>

            {content ? (
              <div className="article">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="empty post-empty">
                <span className="kao">(´･_･`)</span>
                <b>this one is still being written</b>
                <p className="muted">
                  The body lands here once it is added in the admin, under projects.
                </p>
              </div>
            )}

            {tags.length ? (
              <div className="post-tags">
                <span className="post-tags-label">tags</span>
                <div className="chips">
                  {tags.map((tag) => (
                    <span className="chip" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </article>

        {prev || next ? (
          <nav className="pager" aria-label="More writing">
            {prev ? (
              <Link href={`/posts/${prev.slug}`}>
                <span>← previous</span>
                {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link className="next" href={`/posts/${next.slug}`}>
                <span>next →</span>
                {next.title}
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </main>

      <footer className="post-foot">
        <p>
          Notes from building AI systems, managing technical products, and a background
          in content strategy.
        </p>
        <Link href="/#writing">all writing ↗</Link>
      </footer>
    </div>
  );
}
