"use client";

import { motion } from "framer-motion";
import { ParallaxSection } from "@/components/animations/parallax-section";

export function AboutHero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <ParallaxSection speed={-0.3} className="absolute inset-0 z-0">
        <div className="h-full w-full bg-gradient-to-br from-white/10 via-[#2f3731] to-[#202621]" />
      </ParallaxSection>

      <div className="container relative z-10 mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8 inline-block"
          >
            <div className="h-40 w-40 rounded-full border border-white/20 bg-gradient-to-br from-white/15 via-[#d2c22d]/30 to-white/5" />
          </motion.div>

          <p className="mb-5 text-xs font-medium uppercase tracking-[0.24em] text-white/65">
            About
          </p>
          <h1 className="mb-6 text-4xl font-medium leading-[1.12] tracking-tight text-white md:text-5xl">
            About Me
          </h1>

          <p className="mx-auto max-w-3xl text-base leading-relaxed text-white/75 md:text-lg">
            I'm a technical designer passionate about creating unique digital
            experiences that blend creativity, technology, and functionality.
          </p>
        </motion.div>
      </div>
    </section>
  );
}





