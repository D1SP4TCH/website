export type NodeType = 'center' | 'project' | 'skill' | 'section';
export type NodeSize = 'large' | 'medium' | 'small';

export interface NeuralNode {
  id: string;
  type: NodeType;
  title: string;
  description?: string;
  icon?: string;
  color: string;
  size: NodeSize;
  url?: string;
  connections: string[];
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  fixed?: boolean;
}

export interface NeuralMapData {
  nodes: NeuralNode[];
  centerNode: NeuralNode;
}

// Color scheme
export const NODE_COLORS = {
  center: '#8b5cf6',      // Purple
  project: '#3b82f6',     // Blue
  skill: '#06b6d4',       // Cyan
  section: '#8b5cf6',     // Purple
};

// Node sizes in pixels
export const NODE_SIZES = {
  large: 100, // Bigger center node
  medium: 60,
  small: 40,
};

// Sample data structure
export const createSampleData = (): NeuralMapData => {
  const centerNode: NeuralNode = {
    id: 'center',
    type: 'center',
    title: 'Jason Chiu',
    description: 'Creative Developer & Designer',
    color: NODE_COLORS.center,
    size: 'large',
    connections: ['about', 'projects-hub', 'contact'],
    fixed: true,
  };

  const sectionNodes: NeuralNode[] = [
    {
      id: 'about',
      type: 'section',
      title: 'About Me',
      description: 'Learn about my journey',
      icon: '👤',
      color: NODE_COLORS.section,
      size: 'medium',
      url: '/about',
      connections: ['center', 'skill-design', 'skill-development'],
    },
    {
      id: 'projects-hub',
      type: 'section',
      title: 'Projects',
      description: 'Explore my work',
      icon: '💼',
      color: NODE_COLORS.section,
      size: 'medium',
      url: '/projects',
      connections: ['center', 'project-1', 'project-2', 'project-3'],
    },
    {
      id: 'contact',
      type: 'section',
      title: 'Contact',
      description: 'Get in touch',
      icon: '📧',
      color: NODE_COLORS.section,
      size: 'medium',
      url: '/contact',
      connections: ['center'],
    },
  ];

  const projectNodes: NeuralNode[] = [
    {
      id: 'project-1',
      type: 'project',
      title: 'Interactive Portfolio',
      description: 'This neural network site',
      color: NODE_COLORS.project,
      size: 'medium',
      url: '/projects/portfolio',
      connections: ['projects-hub', 'skill-react', 'skill-nextjs', 'skill-canvas'],
    },
    {
      id: 'project-2',
      type: 'project',
      title: '3D Web Experience',
      description: 'Immersive 3D showcase',
      color: NODE_COLORS.project,
      size: 'medium',
      url: '/projects/3d-experience',
      connections: ['projects-hub', 'skill-threejs', 'skill-webgl', 'skill-design'],
    },
    {
      id: 'project-3',
      type: 'project',
      title: 'Design System',
      description: 'Component library',
      color: NODE_COLORS.project,
      size: 'medium',
      url: '/projects/design-system',
      connections: ['projects-hub', 'skill-react', 'skill-typescript', 'skill-design'],
    },
  ];

  const skillNodes: NeuralNode[] = [
    {
      id: 'skill-react',
      type: 'skill',
      title: 'React',
      icon: '⚛️',
      color: NODE_COLORS.skill,
      size: 'small',
      connections: ['project-1', 'project-3'],
    },
    {
      id: 'skill-nextjs',
      type: 'skill',
      title: 'Next.js',
      icon: '▲',
      color: NODE_COLORS.skill,
      size: 'small',
      connections: ['project-1'],
    },
    {
      id: 'skill-canvas',
      type: 'skill',
      title: 'Canvas API',
      icon: '🎨',
      color: NODE_COLORS.skill,
      size: 'small',
      connections: ['project-1'],
    },
    {
      id: 'skill-threejs',
      type: 'skill',
      title: 'Three.js',
      icon: '🧊',
      color: NODE_COLORS.skill,
      size: 'small',
      connections: ['project-2'],
    },
    {
      id: 'skill-webgl',
      type: 'skill',
      title: 'WebGL',
      icon: '✨',
      color: NODE_COLORS.skill,
      size: 'small',
      connections: ['project-2'],
    },
    {
      id: 'skill-typescript',
      type: 'skill',
      title: 'TypeScript',
      icon: '📘',
      color: NODE_COLORS.skill,
      size: 'small',
      connections: ['project-3'],
    },
    {
      id: 'skill-design',
      type: 'skill',
      title: 'UI/UX Design',
      icon: '🎯',
      color: NODE_COLORS.skill,
      size: 'small',
      connections: ['project-2', 'project-3', 'about'],
    },
    {
      id: 'skill-development',
      type: 'skill',
      title: 'Full Stack',
      icon: '💻',
      color: NODE_COLORS.skill,
      size: 'small',
      connections: ['about'],
    },
  ];

  const allNodes = [centerNode, ...sectionNodes, ...projectNodes, ...skillNodes];

  return {
    nodes: allNodes,
    centerNode,
  };
};

// Helper to get node radius based on size
export const getNodeRadius = (size: NodeSize): number => {
  return NODE_SIZES[size];
};

// Helper to check if two nodes are connected
export const areNodesConnected = (node1: NeuralNode, node2: NeuralNode): boolean => {
  return node1.connections.includes(node2.id) || node2.connections.includes(node1.id);
};

