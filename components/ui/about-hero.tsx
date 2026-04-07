"use client";

import { motion } from "framer-motion";
import { ParallaxSection } from "@/components/animations/parallax-section";

export function AboutHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <ParallaxSection speed={-0.3} className="absolute inset-0 z-0">
        <div className="h-full w-full bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
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
            <div className="h-40 w-40 rounded-full bg-gradient-to-br from-primary via-secondary to-accent" />
          </motion.div>

          <h1 className="mb-6 text-5xl font-bold md:text-6xl lg:text-7xl">
            About Me
          </h1>

          <p className="mx-auto max-w-3xl text-xl text-muted-foreground md:text-2xl">
            I'm a technical designer passionate about creating unique digital
            experiences that blend creativity, technology, and functionality.
          </p>
        </motion.div>
      </div>
    </section>
  );
}





