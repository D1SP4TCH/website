"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { type Project } from "@/lib/data/projects";

interface ProjectNavigationProps {
  prevProject: Project | null;
  nextProject: Project | null;
}

export function ProjectNavigation({
  prevProject,
  nextProject,
}: ProjectNavigationProps) {
  return (
    <section className="border-t border-white/15 py-16">
      <div className="container mx-auto px-6">
        <div className="grid gap-8 md:grid-cols-2">
          {prevProject && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Link
                href={`/projects/${prevProject.id}`}
                className="group block"
                data-cursor-hover
              >
                <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-white/60">
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
                  Previous Project
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/[0.03] px-7 py-6 transition-all duration-300 group-hover:border-[#d2c22d]/70">
                  <h3 className="mb-2 text-xl font-medium tracking-tight text-white transition-colors group-hover:text-[#f4f4d7] break-words">
                    {prevProject.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/65 break-words">
                    {prevProject.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          )}

          {nextProject && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={prevProject ? "" : "md:col-start-2"}
            >
              <Link
                href={`/projects/${nextProject.id}`}
                className="group block"
                data-cursor-hover
              >
                <div className="mb-4 flex items-center justify-end gap-2 text-xs font-medium uppercase tracking-[0.16em] text-white/60">
                  Next Project
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/[0.03] px-7 py-6 text-right transition-all duration-300 group-hover:border-[#d2c22d]/70">
                  <h3 className="mb-2 text-xl font-medium tracking-tight text-white transition-colors group-hover:text-[#f4f4d7] break-words">
                    {nextProject.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/65 break-words">
                    {nextProject.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}





