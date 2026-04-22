"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { type Project } from "@/lib/data/projects";
import { displayProjectYear } from "@/lib/utils/display-project-year";

interface ProjectHeroProps {
  project: Project;
}

export function ProjectHero({ project }: ProjectHeroProps) {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-[#2f3731] to-[#202621]" />
      
      {/* Animated elements */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        style={{
          backgroundImage:
            "radial-gradient(circle at center, rgba(210, 194, 45, 0.14) 0%, transparent 55%)",
          backgroundSize: "50% 50%",
        }}
      />

      <div className="container relative z-10 mx-auto px-6 py-24">
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
            <span className="border-b border-[#d2c22d]/70 pb-0.5">Back to Projects</span>
          </Link>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-white/60">
              {project.category}
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-white/55">
              {displayProjectYear(project.year)}
            </span>
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-[#e9eaae] transition-colors duration-300 hover:text-[#f4f4d7] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-[#f4f4d7]"
                data-cursor-hover
              >
                <span className="border-b border-[#d2c22d]/70 pb-0.5">View Live</span>
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
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
          </div>

          <h1 className="mb-6 text-4xl font-medium leading-[1.12] tracking-tight text-white md:text-5xl">
            {project.title}
          </h1>

          <p className="mb-8 max-w-3xl text-base leading-relaxed text-white/75 md:text-lg">
            {project.longDescription}
          </p>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-white/60">
                Role
              </h3>
              <p className="text-base leading-relaxed text-white/85 md:text-lg">
                {project.role}
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-white/60">
                Year
              </h3>
              <p className="text-base leading-relaxed text-white/85 md:text-lg">
                {displayProjectYear(project.year)}
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-white/60">
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-white/15 bg-white/[0.03] px-3 py-1 text-sm text-white/85"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}





