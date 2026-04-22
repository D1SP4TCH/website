import { Metadata } from "next";
import Link from "next/link";
import { featuredProjects } from "@/lib/data/featured-projects";
import { displayProjectYear } from "@/lib/utils/display-project-year";

export const metadata: Metadata = {
  title: "Projects | Portfolio",
  description: "Selected work — case studies of products I've shipped.",
};

const featured = featuredProjects.map((project) => ({
  slug: project.hasCaseStudy ? project.slug : undefined,
  title: project.title,
  tagline: project.tagline,
  category: project.category,
  year: displayProjectYear(project.year),
  role: project.role,
  stack: project.stack,
  liveUrl: project.liveUrl,
  liveLabel: project.liveLabel,
}));

export default function ProjectsPage() {
  return (
    <main className="-mt-24 flex min-h-screen justify-center bg-[#2f3731] pt-32 pb-28 text-white md:pt-40 md:pb-40">
      <section className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 text-center">
        <div className="mx-auto w-full max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-white/65">
            Projects
          </p>
          <h1 className="mt-7 text-4xl font-medium leading-[1.12] tracking-tight text-white md:text-5xl">
            Selected work, built with a product-first mindset.
          </h1>
          <div className="mt-10 flex w-full justify-center">
            <p className="w-full max-w-2xl text-base font-normal leading-relaxed text-white/75 md:text-lg">
              A small, deliberately curated set of projects I&apos;ve led end-to-end.
              Each one links to a deeper case study.
            </p>
          </div>
        </div>

        <div className="mt-12 flex w-full flex-col items-center md:mt-14">
          {featured.map((project, index) => {
            const isInternalLive = project.liveUrl?.startsWith("/");
            const liveLabel = project.liveLabel ?? "Visit site";

            return (
              <article
                key={project.slug ?? project.title}
                className="flex w-full max-w-3xl flex-col items-center text-center"
              >
                {index > 0 && (
                  <div
                    aria-hidden="true"
                    className="relative mb-10 h-px w-full max-w-md md:mb-12"
                  >
                    <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </div>
                )}

                <p className="w-full text-xs uppercase tracking-[0.16em] text-white/60">
                  {String(index + 1).padStart(2, "0")} / {project.year} /{" "}
                  {project.category}
                </p>

                <h2 className="mt-5 w-full text-3xl font-medium leading-tight tracking-tight text-white md:text-4xl">
                  {project.title}
                </h2>

                <p className="mx-auto mt-7 w-full max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
                  {project.tagline}
                </p>

                <p className="mt-6 w-full text-sm leading-relaxed text-white/65">
                  Role: {project.role}
                </p>
                <p className="mt-1 w-full text-sm leading-relaxed text-white/65">
                  Stack: {project.stack}
                </p>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                  {project.slug && (
                    <Link
                      href={`/projects/${project.slug}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-[#e9eaae] transition-colors duration-300 hover:text-[#f4f4d7] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-[#f4f4d7]"
                      data-cursor-hover
                    >
                      <span className="border-b border-[#d2c22d]/70 pb-0.5">
                        Read the case study
                      </span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  )}

                  {project.liveUrl &&
                    (isInternalLive ? (
                      <Link
                        href={project.liveUrl}
                        className="inline-flex items-center gap-1 text-sm font-medium text-white/80 transition-colors duration-300 hover:text-white focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-[#f4f4d7]"
                        data-cursor-hover
                      >
                        <span className="border-b border-white/40 pb-0.5">
                          {liveLabel}
                        </span>
                        <span aria-hidden="true">→</span>
                      </Link>
                    ) : (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-white/80 transition-colors duration-300 hover:text-white focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-[#f4f4d7]"
                        data-cursor-hover
                      >
                        <span className="border-b border-white/40 pb-0.5">
                          {liveLabel}
                        </span>
                        <span aria-hidden="true">↗</span>
                      </a>
                    ))}
                </div>
              </article>
            );
          })}
        </div>

        <div
          aria-hidden="true"
          className="relative mt-24 h-16 w-full max-w-2xl md:mt-28"
        >
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/28 to-transparent" />
          <div className="absolute inset-x-8 top-1/2 h-px -translate-y-[10px] bg-gradient-to-r from-transparent via-white/18 to-transparent" />
          <div className="absolute inset-x-12 top-1/2 h-px translate-y-[10px] bg-gradient-to-r from-transparent via-white/14 to-transparent" />
          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#dce3cf]/70" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#dce3cf]/55" />
            <span className="h-2 w-2 rounded-full bg-[#dce3cf]/70" />
          </div>
        </div>

        <p className="mt-12 max-w-md text-sm leading-relaxed text-white/55">
          More case studies are in the works. In the meantime, the about and
          contact pages have a fuller picture of what I&apos;m building.
        </p>
      </section>
    </main>
  );
}
