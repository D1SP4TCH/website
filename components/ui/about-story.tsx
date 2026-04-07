"use client";

import { FadeInView } from "@/components/animations/fade-in-view";
import { ParallaxSection } from "@/components/animations/parallax-section";

export function AboutStory() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <FadeInView direction="left">
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">My Journey</h2>
            <div className="space-y-4 text-lg leading-relaxed text-muted-foreground">
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
              <div className="relative h-full min-h-[400px] overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-8">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-8xl opacity-20">💡</div>
                </div>
              </div>
            </FadeInView>
          </ParallaxSection>
        </div>

        <FadeInView className="mt-24">
          <div className="rounded-3xl border border-border bg-card p-12 text-center">
            <h3 className="mb-4 text-2xl font-bold">Let's Work Together</h3>
            <p className="mb-8 text-lg text-muted-foreground">
              I'm always interested in hearing about new projects and opportunities.
            </p>
            <a
              href="/contact"
              className="inline-block rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground transition-transform hover:scale-105"
              data-cursor-hover
            >
              Get in Touch
            </a>
          </div>
        </FadeInView>
      </div>
    </section>
  );
}





