import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import { NavDock } from "@/components/nav-dock";
import { ArrowLeft, CalendarDays, Tag } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

// Always server-render — never statically generated
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;

  // Reject slugs that contain anything other than lowercase letters, digits, and hyphens
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

  const publishedDate = data.published_at
    ? new Date(data.published_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <main className="min-h-screen bg-white pb-32">
      {/* ── Cover image ──────────────────────────────────────────── */}
      {data.cover_image_url ? (
        <div className="w-full aspect-[2.4/1] overflow-hidden bg-gray-100">
          <img
            src={data.cover_image_url}
            alt={data.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-52 sm:h-72 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600" />
      )}

      {/* ── Article shell ─────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-800 lowercase transition-colors"
          >
            <ArrowLeft size={13} />
            back to portfolio
          </Link>
          <span className="text-gray-200">/</span>
          <span className="text-xs text-gray-400 lowercase truncate max-w-[180px]">
            {data.title}
          </span>
        </nav>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {data.category && (
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              <Tag size={9} />
              {data.category}
            </span>
          )}
          {publishedDate && (
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 font-medium lowercase">
              <CalendarDays size={11} />
              {publishedDate}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 lowercase leading-tight tracking-tight mb-6">
          {data.title}
        </h1>

        {/* Description (lead paragraph) */}
        {data.description && (
          <p className="text-base sm:text-lg text-gray-500 lowercase leading-relaxed mb-8 pb-8 border-b border-gray-100">
            {data.description}
          </p>
        )}

        {/* ── Article body ──────────────────────────────────────── */}
        {data.content ? (
          <div className="prose-stalfolio">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
              {data.content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="py-12 text-center border border-dashed border-gray-200 rounded-2xl">
            <p className="text-sm text-gray-300 lowercase font-medium">
              article content will appear here
            </p>
            <p className="text-xs text-gray-200 lowercase mt-1">
              add it via the admin panel → projects → edit content
            </p>
          </div>
        )}

        {/* Tags */}
        {data.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-gray-100">
            {data.tags.map((tag: string) => (
              <span
                key={tag}
                className="text-[11px] font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full lowercase"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Back link */}
        <div className="mt-12 pt-6 border-t border-gray-100">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 lowercase transition-colors"
          >
            <ArrowLeft size={14} />
            back to portfolio
          </Link>
        </div>
      </div>

      <NavDock />
    </main>
  );
}
