import { Metadata } from "next";
import { AboutHero } from "@/components/ui/about-hero";
import { SkillsShowcase } from "@/components/ui/skills-showcase";
import { AboutStory } from "@/components/ui/about-story";
import { MiniGame } from "@/components/ui/mini-game";

export const metadata: Metadata = {
  title: "About | Portfolio",
  description: "Learn more about me and my journey as a technical designer",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <AboutHero />
      <AboutStory />
      <SkillsShowcase />
      <section className="py-24">
        <div className="container mx-auto px-6">
          <MiniGame />
        </div>
      </section>
    </main>
  );
}

