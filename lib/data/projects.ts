export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  category: string;
  tags: string[];
  thumbnail: string;
  images: string[];
  video?: string;
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  year: number;
  role: string;
  techStack: string[];
}

export const projects: Project[] = [
  {
    id: "vevey-landing",
    title: "Vevey",
    description:
      "AI-native game-creation platform — describe a game, play it, edit it in chat, share it.",
    longDescription:
      "Vevey is a full-stack platform from Helvetica Labs where anyone can turn a prompt into a playable 2D or 3D game, iterate on it through conversation, and publish it to a community lobby. As lead developer I shipped the game-generation pipeline, the rewindable conversational editor, and the Three.js workshop that serves as the app's primary UI.",
    category: "AI Product",
    tags: ["AI", "Game Dev", "Next.js", "Three.js", "MongoDB"],
    thumbnail: "/projects/vevey-thumb.jpg",
    images: [],
    liveUrl: "https://vevey.ai",
    featured: true,
    year: 2026,
    role: "Lead Developer",
    techStack: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Three.js / R3F",
      "Phaser 3",
      "MongoDB",
      "AWS S3",
      "Claude Sonnet 4.5",
      "Gemini 3 Pro",
    ],
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.id === slug);
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((project) => project.featured);
}
