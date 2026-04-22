"use client";

import { motion } from "framer-motion";

export function ContactHero() {
  return (
    <section className="relative py-24 md:py-28">
      <div className="container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.24em] text-[#e1dcb7]/70">
            Contact
          </p>
          <h1 className="mb-6 text-4xl font-medium leading-[1.12] tracking-tight text-[#f4f4d7] md:text-5xl">
            Let's Connect
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-[#e1dcb7]/80 md:text-lg">
            Have a project in mind or just want to chat? I'd love to hear from you.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-12 flex flex-wrap justify-center gap-7"
        >
          <a
            href="mailto:chiujason02@gmail.com"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#e1dcb7] transition-colors duration-300 hover:text-[#f4f4d7] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-[#b4a84b]"
            data-cursor-hover
          >
            <span>📧</span>
            <span className="border-b border-[#b4a84b]/70 pb-0.5">
              chiujason02@gmail.com
            </span>
          </a>
          <a
            href="https://www.linkedin.com/in/jasoncb40/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#e1dcb7] transition-colors duration-300 hover:text-[#f4f4d7] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-[#b4a84b]"
            data-cursor-hover
          >
            <span>💼</span>
            <span className="border-b border-[#b4a84b]/70 pb-0.5">LinkedIn</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}





