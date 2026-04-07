"use client";

import { motion } from "framer-motion";
import { HorizontalScroll } from "@/components/animations/horizontal-scroll";

const skills = [
  {
    category: "Frontend",
    items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    color: "from-primary to-secondary",
  },
  {
    category: "3D & Graphics",
    items: ["Three.js", "WebGL", "GLSL", "Blender", "React Three Fiber"],
    color: "from-secondary to-accent",
  },
  {
    category: "Backend",
    items: ["Node.js", "Express", "PostgreSQL", "MongoDB", "REST APIs"],
    color: "from-accent to-primary",
  },
  {
    category: "Tools & Design",
    items: ["Figma", "Git", "Vercel", "Adobe CC", "Procreate"],
    color: "from-primary via-secondary to-accent",
  },
];

export function SkillsShowcase() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="mb-16 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-4 text-4xl font-bold md:text-5xl"
        >
          Skills & Expertise
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg text-muted-foreground"
        >
          Scroll to explore my technical toolkit
        </motion.p>
      </div>

      <HorizontalScroll>
        {skills.map((skill, index) => (
          <div
            key={skill.category}
            className="flex h-[60vh] w-[80vw] flex-shrink-0 items-center justify-center md:w-[50vw]"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`h-full w-full rounded-3xl bg-gradient-to-br ${skill.color} p-12 shadow-2xl`}
            >
              <h3 className="mb-8 text-4xl font-bold text-white">
                {skill.category}
              </h3>
              <ul className="space-y-4">
                {skill.items.map((item, itemIndex) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: itemIndex * 0.1 }}
                    className="flex items-center gap-3 text-2xl text-white"
                  >
                    <span className="text-3xl">•</span>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        ))}
      </HorizontalScroll>
    </section>
  );
}





