import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ScrollDirectionChrome } from "@/components/ui/scroll-direction-chrome";

export const metadata: Metadata = {
  title: "Hollow | Comic",
  description:
    "A short black-and-white comic written and illustrated by Jason Chiu, based on a dream.",
};

export default function HollowPage() {
  return (
    <main className="-mt-24 min-h-screen bg-black pt-32 pb-28 text-white md:pt-40 md:pb-40">
      <ScrollDirectionChrome />
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-6">
        <Link
          href="/projects"
          className="mb-10 inline-flex items-center gap-1 self-start text-sm font-medium text-[#e9eaae] transition-colors duration-300 hover:text-[#f4f4d7] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-[#f4f4d7]"
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

        <header className="mb-12 w-full text-center">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-white/65">
            Comic · 2024
          </p>
          <h1 className="mt-6 text-4xl font-medium leading-[1.12] tracking-tight text-white md:text-5xl">
            Hollow
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
            A short comic I wrote and drew, based on a dream I had.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-white/55">
            Writer & Illustrator · Ink, paper, Procreate
          </p>
        </header>

        <figure className="w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-2 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] md:p-3">
          <Image
            src="/projects/hollow.png?v=2"
            alt="Hollow — a short black-and-white comic by Jason Chiu"
            width={1008}
            height={14999}
            sizes="(min-width: 768px) 720px, 92vw"
            className="h-auto w-full rounded-xl"
            priority
          />
        </figure>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 text-sm font-medium text-white/80 transition-colors duration-300 hover:text-white focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-[#f4f4d7]"
            data-cursor-hover
          >
            <span aria-hidden="true">←</span>
            <span className="border-b border-white/40 pb-0.5">All projects</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
