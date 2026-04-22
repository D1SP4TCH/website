import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | Portfolio",
  description: "A short introduction.",
};

export default function AboutPage() {
  return (
    <main className="relative -mt-24 min-h-screen bg-[#f7f3e3] pt-24 text-[#2f3731]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(117, 138, 123, 0.18), transparent 55%), radial-gradient(circle at 85% 80%, rgba(210, 194, 45, 0.12), transparent 60%)",
        }}
      />

      <section className="relative mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-24">
        <p className="mb-6 text-xs font-medium uppercase tracking-[0.24em] text-[#758a7b]">
          About
        </p>
        <h1 className="mb-8 text-4xl font-medium leading-[1.15] tracking-tight text-[#2f3731] md:text-5xl">
          Hi, I&apos;m a technical designer.
        </h1>
        <div className="space-y-5 text-base leading-relaxed text-[#2f3731]/80 md:text-lg">
          <p>
            I build digital experiences that sit at the intersection of design,
            code, and a little bit of play.
          </p>
          <p>
            Currently focused on web, 3D, and interactive work. Always happy to
            chat about new projects.
          </p>
        </div>

        <div className="mt-12">
          <Link
            href="/contact"
            className="inline-flex items-center gap-1 text-sm font-medium text-[#2f3731] transition-colors duration-300 hover:text-[#b4a84b] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-[#b4a84b]"
            data-cursor-hover
          >
            <span className="border-b border-[#b4a84b] pb-0.5">
              Get in touch
            </span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
