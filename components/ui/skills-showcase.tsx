"use client";

import { motion } from "framer-motion";
import { HorizontalScroll } from "@/components/animations/horizontal-scroll";

const skills = [
  {
    category: "Frontend",
    items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
  },
  {
    category: "3D & Graphics",
    items: ["Three.js", "WebGL", "GLSL", "Blender", "React Three Fiber"],
  },
  {
    category: "Backend",
    items: ["Node.js", "Express", "PostgreSQL", "MongoDB", "REST APIs"],
  },
  {
    category: "Tools & Design",
    items: ["Figma", "Git", "Vercel", "Adobe CC", "Procreate"],
  },
];

export function SkillsShowcase() {
  return (
    <section className="relative overflow-hidden py-24 md:py-28">
      <div className="mb-16 text-center">
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-4 text-xs font-medium uppercase tracking-[0.24em] text-white/60"
        >
          Skills
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-4 text-3xl font-medium tracking-tight text-white md:text-4xl"
        >
          Skills & Expertise
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-base leading-relaxed text-white/70 md:text-lg"
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
              className="h-full w-full rounded-3xl border border-white/15 bg-white/[0.03] p-12"
            >
              <h3 className="mb-8 text-3xl font-medium tracking-tight text-white md:text-4xl">
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
                    className="flex items-center gap-3 text-xl text-white/85 md:text-2xl"
                  >
                    <span className="text-2xl text-[#d2c22d]">•</span>
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





