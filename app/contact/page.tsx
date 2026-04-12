"use client";

import { NavDock } from "@/components/nav-dock";
import { Send } from "lucide-react";
import { useState } from "react";

const TRUST_STATS = [
  { value: "5+", label: "years of experience" },
  { value: "20+", label: "projects delivered" },
  { value: "3", label: "core disciplines" },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="min-h-screen bg-white pb-32">
      <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col lg:flex-row gap-16 items-start">

        {/* ── Left: intro ── */}
        <div className="w-full lg:w-1/2 flex flex-col gap-10 lg:sticky lg:top-16">
          <div>
            <h1 className="text-4xl font-black text-gray-900 lowercase tracking-tight mb-3">
              let&apos;s work together
            </h1>
            <p className="text-gray-500 text-base lowercase leading-relaxed">
              whether you need agentic project management, an seo content
              strategy, or business intelligence — i&apos;d love to hear about
              your goals and see how i can help.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {TRUST_STATS.map((s) => (
              <div
                key={s.label}
                className="flex flex-col gap-1 p-4 rounded-2xl bg-gray-50 border border-gray-100"
              >
                <span className="text-2xl font-black text-gray-900 lowercase">
                  {s.value}
                </span>
                <span className="text-xs text-gray-400 lowercase leading-snug">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: contact form ── */}
        <div className="w-full lg:w-1/2">
          {submitted ? (
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-10 text-center">
              <div className="text-3xl mb-3">✉️</div>
              <p className="text-base font-semibold text-gray-800 lowercase">
                message sent!
              </p>
              <p className="text-sm text-gray-500 lowercase mt-1">
                i&apos;ll get back to you soon.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-gray-50 border border-gray-100">
              <form
                action="https://formsubmit.co/dstalingrad@gmail.com"
                method="POST"
                onSubmit={() => setSubmitted(true)}
                className="w-full flex flex-col gap-5 p-8"
              >
                {/* Formsubmit config */}
                <input type="hidden" name="_subject" value="new message from stalfolio" />
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_next" value="https://stalfolio.vercel.app/contact" />
                <input type="hidden" name="_template" value="table" />
                <input type="text" name="_honey" style={{ display: "none" }} />

                <div>
                  <h2 className="text-xl font-black text-gray-900 lowercase tracking-tight mb-1">
                    send a message
                  </h2>
                  <p className="text-xs text-gray-400 lowercase">
                    i typically reply within 24 hours.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 lowercase tracking-wide">
                      name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="your name"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 lowercase tracking-wide">
                      email
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="your@email.com"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 lowercase tracking-wide">
                    subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    placeholder="what's on your mind?"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 lowercase tracking-wide">
                    message
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={6}
                    placeholder="tell me about your project..."
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 hover:bg-gray-700 text-white font-semibold text-sm py-3.5 transition-colors lowercase"
                >
                  <Send size={16} />
                  send message
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <NavDock />
    </main>
  );
}
