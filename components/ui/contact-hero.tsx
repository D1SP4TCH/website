"use client";

import { motion } from "framer-motion";

export function ContactHero() {
  return (
    <section className="relative py-24">
      <div className="container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="mb-6 text-5xl font-bold md:text-6xl">Let's Connect</h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Have a project in mind or just want to chat? I'd love to hear from you.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-12 flex flex-wrap justify-center gap-6"
        >
          <a
            href="mailto:hello@example.com"
            className="flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 transition-colors hover:border-primary"
            data-cursor-hover
          >
            <span>📧</span>
            <span>hello@example.com</span>
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 transition-colors hover:border-primary"
            data-cursor-hover
          >
            <span>💻</span>
            <span>GitHub</span>
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 transition-colors hover:border-primary"
            data-cursor-hover
          >
            <span>💼</span>
            <span>LinkedIn</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}





