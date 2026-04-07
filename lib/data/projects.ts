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
    id: "interactive-dashboard",
    title: "Interactive Analytics Dashboard",
    description: "A real-time data visualization platform with 3D charts",
    longDescription:
      "Built a comprehensive analytics dashboard featuring real-time data visualization, interactive 3D charts using Three.js, and a responsive design system. The platform processes thousands of data points per second with smooth animations.",
    category: "Web Application",
    tags: ["React", "Three.js", "WebGL", "Real-time"],
    thumbnail: "/projects/dashboard-thumb.jpg",
    images: [
      "/projects/dashboard-1.jpg",
      "/projects/dashboard-2.jpg",
      "/projects/dashboard-3.jpg",
    ],
    video: "/projects/dashboard-demo.mp4",
    liveUrl: "https://example.com",
    featured: true,
    year: 2024,
    role: "Technical Designer & Developer",
    techStack: ["Next.js", "React Three Fiber", "D3.js", "TypeScript"],
  },
  {
    id: "immersive-gallery",
    title: "Immersive Art Gallery",
    description: "Virtual 3D gallery with physics-based interactions",
    longDescription:
      "Created an immersive virtual art gallery experience where users can navigate a 3D space, interact with artworks, and experience physics-based interactions. Features dynamic lighting, post-processing effects, and spatial audio.",
    category: "Interactive Experience",
    tags: ["3D", "WebGL", "Interactive", "Art"],
    thumbnail: "/projects/gallery-thumb.jpg",
    images: [
      "/projects/gallery-1.jpg",
      "/projects/gallery-2.jpg",
      "/projects/gallery-3.jpg",
    ],
    featured: true,
    year: 2024,
    role: "Creative Developer",
    techStack: ["React Three Fiber", "Rapier", "GLSL", "Blender"],
  },
  {
    id: "game-prototype",
    title: "Web-Based Game Prototype",
    description: "Multiplayer puzzle game with procedural generation",
    longDescription:
      "Designed and developed a browser-based multiplayer puzzle game featuring procedural level generation, real-time multiplayer capabilities, and smooth gameplay mechanics. Includes achievement system and leaderboards.",
    category: "Game Design",
    tags: ["Game Dev", "Multiplayer", "WebGL"],
    thumbnail: "/projects/game-thumb.jpg",
    images: [
      "/projects/game-1.jpg",
      "/projects/game-2.jpg",
      "/projects/game-3.jpg",
    ],
    featured: true,
    year: 2023,
    role: "Game Designer & Developer",
    techStack: ["PixiJS", "WebSockets", "Node.js", "MongoDB"],
  },
  {
    id: "portfolio-redesign",
    title: "Creative Portfolio Sites",
    description: "Collection of unique portfolio websites for clients",
    longDescription:
      "Designed and built multiple portfolio websites for creative professionals, each with unique interactions, animations, and experiences tailored to showcase their work effectively.",
    category: "Web Design",
    tags: ["Design", "Animation", "UI/UX"],
    thumbnail: "/projects/portfolio-thumb.jpg",
    images: [
      "/projects/portfolio-1.jpg",
      "/projects/portfolio-2.jpg",
      "/projects/portfolio-3.jpg",
    ],
    featured: false,
    year: 2023,
    role: "Technical Designer",
    techStack: ["Next.js", "Framer Motion", "Tailwind CSS"],
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.id === slug);
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((project) => project.featured);
}





