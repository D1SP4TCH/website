/**
 * Projects surfaced on the /projects page and available for linking
 * from plants inside the interactive garden.
 *
 * This is the single source of truth for "my featured work". The /projects
 * page renders these in order, and the garden editor lets you plant any of
 * them as a plant you can click back into.
 */

export interface FeaturedProject {
  /** Stable identifier. Used for garden linking and case-study routing. */
  slug: string;
  title: string;
  tagline: string;
  category: string;
  year: string;
  role: string;
  stack: string;
  techStack?: string[];
  liveUrl?: string;
  liveLabel?: string;
  githubUrl?: string;
  /** Whether a case study page exists at /projects/[slug]. */
  hasCaseStudy: boolean;
}

export const featuredProjects: FeaturedProject[] = [
  {
    slug: "vevey-landing",
    title: "Vevey",
    tagline:
      "Lead developer on an AI-native game-creation platform — turn a prompt into a playable 2D or 3D game, iterate on it through chat, and publish it to a Three.js workshop lobby.",
    category: "AI Product",
    year: "2026",
    role: "Lead Developer",
    stack: "Next.js 16, React 19, Three.js, Phaser 3, MongoDB, Claude + Gemini",
    techStack: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Three.js",
      "Phaser 3",
      "MongoDB",
      "Claude",
      "Gemini",
    ],
    liveUrl: "https://vevey.ai",
    hasCaseStudy: true,
  },
  {
    slug: "portfolio",
    title: "This portfolio",
    tagline:
      "Designed and built a portfolio that doubles as an interactive 3D garden — L-system plants, custom GLSL shaders, and an in-browser live editor that autosaves every change.",
    category: "Interactive Site",
    year: "2026",
    role: "Designer & Developer",
    stack: "Next.js 16, React Three Fiber, GLSL, L-systems, Framer Motion",
    techStack: [
      "Next.js 16",
      "React Three Fiber",
      "GLSL",
      "L-systems",
      "Framer Motion",
    ],
    liveUrl: "/",
    liveLabel: "Enter the garden",
    hasCaseStudy: true,
  },
  {
    slug: "rubiks-dice",
    title: "Rubiks Dice",
    tagline:
      "A minimalist RPG where combat happens on a Rubik's cube — twist the faces to stack red for attack or yellow for defense, with only three actions per round. Built in a weekend for GMTK Game Jam 2022.",
    category: "Game Jam",
    year: "2022",
    role: "Co-Developer",
    stack: "Unity, C#, HTML5, Windows, macOS, Android",
    techStack: ["Unity", "C#", "HTML5"],
    liveUrl: "https://blasin.itch.io/robiks-dice",
    liveLabel: "Play on itch.io",
    hasCaseStudy: false,
  },
  {
    slug: "spooks-in-suits",
    title: "Spooks In Suits",
    tagline:
      "A point-and-click visual novel made for NYU Game Center's Capstone I — play Kai, a broke twentysomething who answers a $10,000 Craigslist ad to retrieve documents from the Richardson estate, only to realize something is very off about the family. Concept to build in 14 weeks.",
    category: "Visual Novel",
    year: "2024",
    role: "Sound Design · Ink Systems · Narrative Design",
    stack: "Unity, Ink, C#, macOS",
    techStack: ["Unity", "Ink", "C#"],
    liveUrl: "https://b4o.itch.io/spooks-in-suits",
    liveLabel: "View on itch.io",
    hasCaseStudy: false,
  },
  {
    slug: "hollow",
    title: "Hollow",
    tagline:
      "A short black-and-white comic I wrote and drew based on a dream I had — silent, monochrome, and a little uneasy.",
    category: "Comic",
    year: "2024",
    role: "Writer & Illustrator",
    stack: "Ink, paper, Procreate",
    techStack: ["Ink", "Procreate"],
    liveUrl: "/projects/hollow",
    liveLabel: "Read the comic",
    hasCaseStudy: false,
  },
  {
    slug: "better-days",
    title: "Better Days",
    tagline:
      "A melancholic narrative walking simulator. Play as Justine Heron, a girl returning to her dying small hometown, where residents wait on Aleo — a mystical creature believed to multiply wealth — to save them. Justine doesn't want to wait. Can she convince her loved ones to leave before faith swallows the town?",
    category: "Narrative Walking Sim",
    year: "2024",
    role: "Project Manager · Level Designer",
    stack: "Unity, C#, 3D, Narrative Design",
    techStack: ["Unity", "C#", "Narrative Design"],
    liveUrl: "https://b4o.itch.io/betterdays",
    liveLabel: "View on itch.io",
    hasCaseStudy: false,
  },
];

export function getFeaturedProjectBySlug(
  slug: string,
): FeaturedProject | undefined {
  return featuredProjects.find((project) => project.slug === slug);
}
