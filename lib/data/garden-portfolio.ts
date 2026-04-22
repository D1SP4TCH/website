/**
 * Garden Portfolio Data Structure
 * Each project becomes a unique procedurally-generated plant
 */

export type ProjectType = 'web' | 'design' | 'experiment' | 'game';

export type PlantType = 'tree' | 'flower' | 'niwaki' | 'bamboo';

export interface GardenProject {
  id: string;
  title: string;
  description: string;
  type: ProjectType;
  techStack: string[];
  monthsDuration: number;
  featured: boolean;
  images?: string[];
  liveUrl?: string;
  githubUrl?: string;
  date: string; // ISO date string

  // Garden placement
  position: [number, number, number];
  rotation?: number;

  // Optional override: force a specific procedural plant type,
  // bypassing the automatic mapping from `type`.
  plantType?: PlantType;

  // Custom colors (override defaults)
  colors?: {
    branch?: string;
    leaf?: string;
    flower?: string;
  };

  // Optional link to a featured project (see lib/data/featured-projects.ts).
  // When set, clicking the plant in view mode opens a card that pulls the
  // latest info from the project library and can deep-link into the case
  // study. Unset means the plant is decorative or uses its own inline copy.
  projectSlug?: string;

  // True for purely decorative plants with no linked project. Clicking an
  // empty plant in view mode is a no-op — they're just part of the scenery.
  isEmpty?: boolean;
}

/**
 * Plant genes derived from project properties
 * These control the procedural generation
 */
export interface PlantGenes {
  seed: number;
  
  // Structure
  height: number;          // 1-5 based on duration
  complexity: number;      // 1-4 based on tech stack
  branchCount: number;     // 2-6 random
  branchAngle: number;     // 20-50 degrees
  
  // Appearance
  leafDensity: number;     // 0.5-2.0
  thickness: number;       // Base stem thickness
  
  // Colors (muted pastels)
  stemColor: string;
  leafColor: string;
  accentColor: string;
  
  // Special effects
  hasGlow: boolean;        // Featured projects glow
  hasParticles: boolean;   // Experiments have particles
}

/**
 * Muted pastel color palette (zen garden aesthetic)
 */
export const GARDEN_PALETTE = {
  // Stem/branch colors
  stems: [
    '#8B7355', // Warm brown
    '#9C8B7A', // Taupe
    '#7A6B5A', // Umber
    '#A69585', // Sandstone
  ],
  
  // Leaf/foliage colors
  leaves: [
    '#9DB5A0', // Sage green
    '#B5C4A8', // Moss
    '#A8C4B5', // Seafoam
    '#C4B5A8', // Sand
    '#D4C5B5', // Cream
    '#B5A8C4', // Lavender
    '#C4A8B5', // Dusty rose
  ],
  
  // Accent colors for featured projects
  accents: [
    '#E8D5C4', // Warm white
    '#D5E8E4', // Cool white
    '#E8E4D5', // Ivory
  ],
  
  // Background/ground
  background: '#E8E4D5', // Warm cream (like reference image)
  ground: '#C4B5A0',     // Sandy
  water: '#B5D4E4',      // Pale blue
  
  // UI colors
  text: '#4A4035',       // Dark brown
  textMuted: '#8B8075',  // Muted brown
};

/**
 * Sample projects for the garden
 */
export const sampleProjects: GardenProject[] = [
  {
    id: 'memory-garden-game',
    title: 'Memory Garden',
    description: 'A narrative gardening game about inheritance, growth, and the cycle of life. You inherit your grandfather\'s neglected garden and restore it while uncovering memories.',
    type: 'game',
    techStack: ['Unity', 'C#', 'Narrative Design', '3D Modeling'],
    monthsDuration: 8,
    featured: true,
    liveUrl: 'https://example.com/memory-garden',
    date: '2024-06-15',
    position: [0, 0, 0],
  },
  {
    id: 'portfolio-garden',
    title: 'Procedural Garden Portfolio',
    description: 'This very website! A portfolio where each project grows as a unique procedurally-generated plant in a zen garden.',
    type: 'web',
    techStack: ['Next.js', 'React Three Fiber', 'TypeScript', 'Tailwind'],
    monthsDuration: 2,
    featured: true,
    date: '2024-12-01',
    position: [3, 0, 2],
  },
  {
    id: 'design-system',
    title: 'Component Library',
    description: 'A comprehensive design system and component library built for scalability and accessibility.',
    type: 'design',
    techStack: ['React', 'Storybook', 'Figma', 'TypeScript'],
    monthsDuration: 4,
    featured: false,
    date: '2024-03-01',
    position: [-3, 0, 1],
  },
  {
    id: 'ai-experiment',
    title: 'Generative Art Tool',
    description: 'An experimental tool for creating generative art using machine learning and procedural algorithms.',
    type: 'experiment',
    techStack: ['Python', 'TensorFlow', 'WebGL'],
    monthsDuration: 1,
    featured: false,
    date: '2024-08-01',
    position: [2, 0, -3],
  },
  {
    id: 'ecommerce-platform',
    title: 'Artisan Marketplace',
    description: 'A full-stack e-commerce platform connecting local artisans with customers who appreciate handcrafted goods.',
    type: 'web',
    techStack: ['Node.js', 'PostgreSQL', 'Redis', 'Stripe', 'Next.js'],
    monthsDuration: 6,
    featured: false,
    date: '2024-01-15',
    position: [-2, 0, -2],
  },
];

/**
 * Get all projects (in the future, this could fetch from a database)
 */
export const getProjects = (): GardenProject[] => {
  return sampleProjects;
};

/**
 * Get a single project by ID
 */
export const getProjectById = (id: string): GardenProject | undefined => {
  return sampleProjects.find(p => p.id === id);
};


