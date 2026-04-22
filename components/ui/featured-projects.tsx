"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { getFeaturedProjects } from "@/lib/data/projects";
import { displayProjectYear } from "@/lib/utils/display-project-year";

export function FeaturedProjects() {
  const projects = getFeaturedProjects();

  return (
    <section className="relative py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            Featured Projects
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            A selection of recent work showcasing innovative design and technical
            expertise
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link
                href={`/projects/${project.id}`}
                className="group block"
                data-cursor-hover
              >
                <div className="overflow-hidden rounded-2xl bg-card shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                  <div className="aspect-video overflow-hidden bg-muted">
                    <div className="h-full w-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="px-7 py-6">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {project.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {displayProjectYear(project.year)}
                      </span>
                    </div>
                    <h3 className="mb-2 text-xl font-bold group-hover:text-primary transition-colors break-words">
                      {project.title}
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground break-words">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-muted-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link
            href="/projects"
            className="inline-block rounded-full border-2 border-foreground px-8 py-4 font-semibold transition-all hover:bg-foreground hover:text-background"
            data-cursor-hover
          >
            View All Projects
          </Link>
        </motion.div>
      </div>
    </section>
  );
}





