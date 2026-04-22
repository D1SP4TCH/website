"use client";

import { FadeInView } from "@/components/animations/fade-in-view";
import { ParallaxSection } from "@/components/animations/parallax-section";

export function AboutStory() {
  return (
    <section className="py-24 md:py-28">
      <div className="container mx-auto px-6">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <FadeInView direction="left">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.24em] text-white/60">
              Story
            </p>
            <h2 className="mb-6 text-3xl font-medium tracking-tight text-white md:text-4xl">
              My Journey
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-white/75 md:text-lg">
              <p>
                My journey into technical design began with a curiosity about how
                things work and a desire to create meaningful experiences. Over the
                years, I've developed expertise in web development, 3D graphics,
                and interactive design.
              </p>
              <p>
                I believe that the best digital experiences are those that combine
                technical excellence with creative vision. Every project is an
                opportunity to push boundaries and explore new possibilities.
              </p>
              <p>
                When I'm not coding or designing, you can find me exploring new
                technologies, playing video games, or sketching ideas for the next
                big project.
              </p>
            </div>
          </FadeInView>

          <ParallaxSection speed={0.2}>
            <FadeInView direction="right" className="h-full">
              <div className="relative h-full min-h-[400px] overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-white/10 via-[#d2c22d]/10 to-white/5 p-8">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-8xl opacity-20">💡</div>
                </div>
              </div>
            </FadeInView>
          </ParallaxSection>
        </div>

        <FadeInView className="mt-24">
          <div className="rounded-3xl border border-white/15 bg-white/[0.03] p-12 text-center">
            <h3 className="mb-4 text-2xl font-medium tracking-tight text-white">
              Let's Work Together
            </h3>
            <p className="mb-8 text-base leading-relaxed text-white/70 md:text-lg">
              I'm always interested in hearing about new projects and opportunities.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-1 text-sm font-medium text-[#e9eaae] transition-colors duration-300 hover:text-[#f4f4d7] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-[#f4f4d7]"
              data-cursor-hover
            >
              <span className="border-b border-[#d2c22d]/70 pb-0.5">Get in Touch</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </FadeInView>
      </div>
    </section>
  );
}





