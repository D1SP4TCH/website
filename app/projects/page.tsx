import { Metadata } from "next";
import Link from "next/link";
import { Poppins } from "next/font/google";

export const metadata: Metadata = {
  title: "Projects | Portfolio",
  description: "A hand-curated list of selected projects",
};

interface ManualProject {
  title: string;
  summary: string;
  category: string;
  year: string;
  stack: string;
  link?: string;
}

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

// Manual content: update this list directly whenever needed.
const manualProjects: ManualProject[] = [
  {
    title: "Interactive Analytics Dashboard",
    summary:
      "Real-time dashboard for exploring product and user data with a strong focus on speed and clarity.",
    category: "Web Application",
    year: "2024",
    stack: "Next.js, TypeScript, React Three Fiber",
    link: "#",
  },
  {
    title: "Immersive Art Gallery",
    summary:
      "3D gallery experience with motion-driven navigation and tactile interactions for showcasing digital work.",
    category: "Interactive Experience",
    year: "2024",
    stack: "Three.js, Framer Motion, WebGL",
    link: "#",
  },
  {
    title: "Multiplayer Puzzle Prototype",
    summary:
      "Fast browser-based prototype for co-op puzzle play with procedural level generation and live syncing.",
    category: "Game Design",
    year: "2023",
    stack: "PixiJS, WebSocket, Node.js",
    link: "#",
  },
  {
    title: "Creative Portfolio Collection",
    summary:
      "A set of custom portfolio websites for creative clients with bespoke interactions and visual systems.",
    category: "Web Design",
    year: "2023",
    stack: "Next.js, Tailwind CSS, Motion",
    link: "#",
  },
];

export default function ProjectsPage() {
  return (
    <main className={`${poppins.className} flex min-h-screen justify-center bg-[#2f3731] py-28 text-white md:py-40`}>
      <section
        className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 text-center"
        style={{ marginTop: "25vh" }}
      >
        <div className="mx-auto w-full max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-white/65">
            Projects
          </p>
          <h1 className="mt-7 text-4xl font-medium leading-[1.12] tracking-tight text-white md:text-5xl">
            Selected work, built with a product-first mindset.
          </h1>
          <div className="mt-10 flex w-full justify-center">
            <p className="w-full max-w-2xl text-base font-normal leading-relaxed text-white/75 md:text-lg">
              A manually curated list of recent projects. Edit the `manualProjects`
              list in `app/projects/page.tsx` whenever you want to update this
              page.
            </p>
          </div>
        </div>

        <div className="mt-24 flex w-full flex-col items-center md:mt-28">
          {manualProjects.map((project, index) => (
            <div key={project.title} className="mx-auto w-full max-w-3xl">
              <article className="flex w-full flex-col items-center text-center">
                <p className="w-full text-xs uppercase tracking-[0.16em] text-white/60">
                  {String(index + 1).padStart(2, "0")} / {project.year} /{" "}
                  {project.category}
                </p>
                <h2 className="mt-5 w-full text-3xl font-medium leading-tight tracking-tight text-white md:text-4xl">
                  {project.title}
                </h2>
                <p className="mx-auto mt-7 w-full max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
                  {project.summary}
                </p>
                <p className="mt-6 w-full text-sm leading-relaxed text-white/65">
                  Stack: {project.stack}
                </p>

                {project.link && (
                  <Link
                    href={project.link}
                    className="mt-8 inline-flex items-center gap-1 text-sm font-medium text-[#e9eaae] transition-colors duration-300 hover:text-[#f4f4d7] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-[#f4f4d7]"
                    data-cursor-hover
                  >
                    <span className="border-b border-[#d2c22d]/70 pb-0.5">
                      View project
                    </span>
                    <span aria-hidden="true">
                      →
                    </span>
                  </Link>
                )}
              </article>

              {index < manualProjects.length - 1 && (
                <div
                  aria-hidden="true"
                  className="relative left-1/2 mt-12 h-16 w-full max-w-2xl -translate-x-1/2 md:mt-14"
                >
                  <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/28 to-transparent" />
                  <div className="absolute inset-x-8 top-1/2 h-px -translate-y-[10px] bg-gradient-to-r from-transparent via-white/18 to-transparent" />
                  <div className="absolute inset-x-12 top-1/2 h-px translate-y-[10px] bg-gradient-to-r from-transparent via-white/14 to-transparent" />
                  <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#dce3cf]/70" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#dce3cf]/55" />
                    <span className="h-2 w-2 rounded-full bg-[#dce3cf]/70" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

