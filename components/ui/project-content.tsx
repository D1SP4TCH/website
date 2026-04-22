"use client";

import { motion } from "framer-motion";
import { type Project } from "@/lib/data/projects";

interface ProjectContentProps {
  project: Project;
}

export function ProjectContent({ project }: ProjectContentProps) {
  return (
    <section className="py-24 md:py-28">
      <div className="container mx-auto px-6">
        {/* Main showcase image */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 overflow-hidden rounded-3xl border border-white/15"
        >
          <div className="aspect-video w-full bg-gradient-to-br from-white/10 via-[#2f3731] to-[#202621]" />
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-24"
        >
          <h2 className="mb-6 text-3xl font-medium tracking-tight text-white md:text-4xl">
            Project Overview
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="text-base leading-relaxed text-white/75 md:text-lg">
              <p className="mb-4">{project.longDescription}</p>
              <p>
                This project demonstrates expertise in modern web development,
                creative problem-solving, and attention to detail. Each element
                was carefully crafted to provide an exceptional user experience.
              </p>
            </div>
            <div className="text-base leading-relaxed text-white/75 md:text-lg">
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
            className="grid items-center gap-12 md:grid-cols-2"
          >
            <div>
              <h3 className="mb-4 text-2xl font-medium tracking-tight text-white">
                Interactive Design
              </h3>
              <p className="text-base leading-relaxed text-white/75 md:text-lg">
                The interface features carefully crafted interactions that guide
                users through the experience. Every animation and transition
                serves a purpose, enhancing usability while maintaining visual
                appeal.
              </p>
            </div>
            <div className="aspect-square overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-white/10 to-[#202621]" />
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid items-center gap-12 md:grid-cols-2"
          >
            <div className="order-2 aspect-square overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-white/10 to-[#202621] md:order-1" />
            <div className="order-1 md:order-2">
              <h3 className="mb-4 text-2xl font-medium tracking-tight text-white">
                Technical Excellence
              </h3>
              <p className="text-base leading-relaxed text-white/75 md:text-lg">
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
            className="grid items-center gap-12 md:grid-cols-2"
          >
            <div>
              <h3 className="mb-4 text-2xl font-medium tracking-tight text-white">
                User Experience
              </h3>
              <p className="text-base leading-relaxed text-white/75 md:text-lg">
                Every decision was made with the user in mind. The intuitive
                interface, clear navigation, and thoughtful details create an
                enjoyable experience that keeps users engaged.
              </p>
            </div>
            <div className="aspect-square overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-white/10 to-[#202621]" />
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
          <h2 className="mb-8 text-3xl font-medium tracking-tight text-white md:text-4xl">
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
                className="rounded-2xl border border-white/15 bg-white/[0.03] px-7 py-6 text-center transition-colors hover:border-[#d2c22d]/70"
              >
                <div className="mb-3 text-4xl">⚡</div>
                <h4 className="font-medium text-white/90 break-words">{tech}</h4>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}





