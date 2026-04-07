"use client";

import { motion } from "framer-motion";
import { type Project } from "@/lib/data/projects";

interface ProjectContentProps {
  project: Project;
}

export function ProjectContent({ project }: ProjectContentProps) {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        {/* Main showcase image */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 overflow-hidden rounded-3xl"
        >
          <div className="aspect-video w-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20" />
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-24"
        >
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            Project Overview
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="text-lg leading-relaxed text-muted-foreground">
              <p className="mb-4">{project.longDescription}</p>
              <p>
                This project demonstrates expertise in modern web development,
                creative problem-solving, and attention to detail. Each element
                was carefully crafted to provide an exceptional user experience.
              </p>
            </div>
            <div className="text-lg leading-relaxed text-muted-foreground">
              <p className="mb-4">
                Key features include responsive design, smooth animations, and
                optimized performance. The technical implementation showcases
                proficiency with the latest tools and frameworks.
              </p>
              <p>
                The result is a polished, professional solution that exceeds
                expectations and delivers real value.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Feature sections */}
        <div className="space-y-24">
          {/* Feature 1 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid gap-12 md:grid-cols-2 items-center"
          >
            <div>
              <h3 className="mb-4 text-2xl font-bold">Interactive Design</h3>
              <p className="text-lg leading-relaxed text-muted-foreground">
                The interface features carefully crafted interactions that guide
                users through the experience. Every animation and transition
                serves a purpose, enhancing usability while maintaining visual
                appeal.
              </p>
            </div>
            <div className="aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20" />
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid gap-12 md:grid-cols-2 items-center"
          >
            <div className="order-2 md:order-1 aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-secondary/20 to-accent/20" />
            <div className="order-1 md:order-2">
              <h3 className="mb-4 text-2xl font-bold">Technical Excellence</h3>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Built with modern technologies and best practices, the codebase
                is clean, maintainable, and performant. Optimizations ensure fast
                load times and smooth interactions across all devices.
              </p>
            </div>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid gap-12 md:grid-cols-2 items-center"
          >
            <div>
              <h3 className="mb-4 text-2xl font-bold">User Experience</h3>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Every decision was made with the user in mind. The intuitive
                interface, clear navigation, and thoughtful details create an
                enjoyable experience that keeps users engaged.
              </p>
            </div>
            <div className="aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-accent/20 to-primary/20" />
          </motion.div>
        </div>

        {/* Tech Stack Detail */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-24"
        >
          <h2 className="mb-8 text-3xl font-bold md:text-4xl">
            Technologies Used
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {project.techStack.map((tech, index) => (
              <motion.div
                key={tech}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="rounded-2xl border border-border bg-card p-6 text-center transition-colors hover:border-primary"
              >
                <div className="mb-3 text-4xl">⚡</div>
                <h4 className="font-semibold">{tech}</h4>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}





