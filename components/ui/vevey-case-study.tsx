"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

import { displayProjectYear } from "@/lib/utils/display-project-year";

const meta = {
  title: "Vevey",
  tagline:
    "An AI-native game-creation platform. Describe a game, play it, edit it in chat, share it.",
  category: "AI Product",
  year: "2026",
  role: "Lead Developer",
  team: "Helvetica Labs",
  appUrl: "https://play.vevey.ai",
  siteUrl: "https://vevey.ai",
};

type Innovation = {
  label: string;
  title: string;
  bullets: string[];
};

const innovations: Innovation[] = [
  {
    label: "01",
    title: "Agentic AI engineering",
    bullets: [
      "Architected the Opus 4.5 agent loop",
      "Cut cost with aggressive prompt caching",
      "Shipped an in-house model into the stack",
      "Built a swappable provider layer",
    ],
  },
  {
    label: "02",
    title: "Real-time product UX",
    bullets: [
      "Streamed thinking, tasks, and code live",
      "Hot-reload preview mid-generation",
      "Branch and undo across long chats",
      "Designed the conversational editor",
    ],
  },
  {
    label: "03",
    title: "Interactive 3D systems",
    bullets: [
      "Built the R3F workshop as primary UI",
      "Designed a photo/prompt → GLB pipeline",
      "Persisted 3D scene state per user",
      "Embedded Phaser + Three.js games inline",
    ],
  },
];

const stack = [
  "Next.js 16",
  "React 19",
  "Three.js + R3F",
  "Phaser 3",
  "MongoDB",
  "AWS S3",
  "Claude Sonnet 4.5",
  "Gemini 3 Pro",
];

function LiveEmbed() {
  const [active, setActive] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-black/40 shadow-2xl">
      <div className="aspect-[16/10] w-full">
        <iframe
          src={meta.appUrl}
          title="Vevey — live app"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock"
          allow="autoplay; fullscreen; clipboard-write"
          className="h-full w-full"
          style={{ pointerEvents: active ? "auto" : "none" }}
        />
      </div>

      {/* Click-to-activate overlay so the page can still be scrolled past the embed */}
      {!active && (
        <button
          type="button"
          onClick={() => setActive(true)}
          className="absolute inset-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/60 via-black/0 to-black/0 px-6 py-6 text-left transition-colors duration-300 hover:from-black/70 md:px-8 md:py-8"
          aria-label="Activate Vevey embed"
          data-cursor-hover
        >
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/85">
            Click to interact · play.vevey.ai
          </span>
          <span className="text-xs font-medium text-white/70">
            <a
              href={meta.appUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="border-b border-white/40 pb-0.5 transition-colors hover:text-white"
            >
              Open in new tab ↗
            </a>
          </span>
        </button>
      )}
    </div>
  );
}

export function VeveyCaseStudy() {
  return (
    <main className="-mt-24 min-h-screen bg-[#2f3731] pt-24 text-white">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-[#2f3731] to-[#202621]" />
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          style={{
            backgroundImage:
              "radial-gradient(circle at center, rgba(210, 194, 45, 0.16) 0%, transparent 55%)",
            backgroundSize: "50% 50%",
          }}
        />

        <div className="container relative z-10 mx-auto px-6 pb-16 pt-16 md:pb-20 md:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/projects"
              className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-[#e9eaae] transition-colors duration-300 hover:text-[#f4f4d7] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-[#f4f4d7]"
              data-cursor-hover
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="border-b border-[#d2c22d]/70 pb-0.5">
                Back to Projects
              </span>
            </Link>

            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-white/60">
                {meta.category}
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-white/55">
                {displayProjectYear(meta.year)}
              </span>
              <a
                href={meta.appUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-[#e9eaae] transition-colors duration-300 hover:text-[#f4f4d7]"
                data-cursor-hover
              >
                <span className="border-b border-[#d2c22d]/70 pb-0.5">
                  play.vevey.ai
                </span>
                <span aria-hidden="true">↗</span>
              </a>
            </div>

            <h1 className="mb-5 text-4xl font-medium leading-[1.12] tracking-tight text-white md:text-6xl">
              {meta.title}
            </h1>
            <p className="max-w-3xl text-base leading-relaxed text-white/80 md:text-xl">
              {meta.tagline}
            </p>

            <div className="mt-10 grid max-w-2xl gap-6 md:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/55">
                  Role
                </p>
                <p className="mt-1 text-base text-white/90 md:text-lg">
                  {meta.role}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/55">
                  Team
                </p>
                <p className="mt-1 text-base text-white/90 md:text-lg">
                  {meta.team}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/55">
                  Year
                </p>
                <p className="mt-1 text-base text-white/90 md:text-lg">
                  {displayProjectYear(meta.year)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* LIVE EMBED */}
      <section className="pb-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <LiveEmbed />
          </motion.div>
        </div>
      </section>

      {/* INNOVATIONS — 3 slides, PPT style */}
      <section className="border-t border-white/10 py-20 md:py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-white/55">
              Skills I developed
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {innovations.map((item, index) => (
              <motion.article
                key={item.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="relative flex flex-col overflow-hidden rounded-3xl border border-white/15 bg-white/[0.03] p-7 md:p-8"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-60"
                  style={{
                    backgroundImage:
                      "radial-gradient(60% 80% at 100% 0%, rgba(210, 194, 45, 0.10) 0%, transparent 60%)",
                  }}
                />

                <span className="relative text-3xl font-medium tracking-tight text-[#d2c22d] md:text-4xl">
                  {item.label}
                </span>

                <h3 className="relative mt-4 text-xl font-medium leading-snug tracking-tight text-white md:text-2xl">
                  {item.title}
                </h3>

                <ul className="relative mt-6 space-y-2.5">
                  {item.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex gap-2.5 text-sm leading-snug text-white/80 md:text-base"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#d2c22d]/75"
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* STACK + CTA */}
      <section className="border-t border-white/10 py-14 md:py-16">
        <div className="container mx-auto px-6">
          <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-white/55">
                Stack
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-white/15 bg-white/[0.03] px-3 py-1 text-sm text-white/85"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 md:justify-end">
              <a
                href={meta.appUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-[#e9eaae] transition-colors duration-300 hover:text-[#f4f4d7]"
                data-cursor-hover
              >
                <span className="border-b border-[#d2c22d]/70 pb-0.5">
                  Try the app
                </span>
                <span aria-hidden="true">↗</span>
              </a>
              <a
                href={meta.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-white/80 transition-colors duration-300 hover:text-white"
                data-cursor-hover
              >
                <span className="border-b border-white/40 pb-0.5">
                  vevey.ai
                </span>
                <span aria-hidden="true">↗</span>
              </a>
              <Link
                href="/projects"
                className="inline-flex items-center gap-1 text-sm font-medium text-white/65 transition-colors duration-300 hover:text-white/90"
                data-cursor-hover
              >
                <span aria-hidden="true">←</span>
                <span className="border-b border-white/30 pb-0.5">
                  All projects
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
