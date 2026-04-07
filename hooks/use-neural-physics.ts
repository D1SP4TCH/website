import { useCallback, useRef } from 'react';
import { NeuralNode, areNodesConnected, getNodeRadius } from '@/lib/neural-map-data';

interface PhysicsConfig {
  centerForce: number;
  linkDistance: number;
  linkStrength: number;
  chargeStrength: number;
  velocityDecay: number;
  collisionRadius: number;
}

const DEFAULT_CONFIG: PhysicsConfig = {
  centerForce: 0.02, // Gentle pull to center (preset positions already good)
  linkDistance: 120, // Closer connections
  linkStrength: 0.2, // Gentler links to maintain preset positions
  chargeStrength: -150, // Less repulsion
  velocityDecay: 0.7, // Higher friction to keep nodes stable
  collisionRadius: 1.5,
};

export const useNeuralPhysics = (config: Partial<PhysicsConfig> = {}) => {
  const physicsConfig = { ...DEFAULT_CONFIG, ...config };
  const animationFrameRef = useRef<number | undefined>(undefined);

  const initializePositions = useCallback((
    nodes: NeuralNode[],
    width: number,
    height: number
  ): NeuralNode[] => {
    // Preset positions for specific nodes (centered around 0,0)
    const presetPositions: Record<string, { x: number; y: number }> = {
      'center': { x: 0, y: 0 },
      'about': { x: -163, y: -131 },
      'projects-hub': { x: 63, y: -80 },
      'contact': { x: 0, y: 140 },
      'project-1': { x: 78, y: 82 },
      'project-2': { x: -244, y: 136 },
      'project-3': { x: 0, y: -200 },
      'skill-react': { x: 281, y: -134 },
      'skill-nextjs': { x: 431, y: 171 },
      'skill-canvas': { x: 180, y: 276 },
      'skill-threejs': { x: -442, y: 269 },
      'skill-webgl': { x: -516, y: -154 },
      'skill-typescript': { x: -422, y: 50 },
      'skill-design': { x: -348, y: -305 },
      'skill-development': { x: 100, y: -275 },
    };

    return nodes.map((node) => {
      const preset = presetPositions[node.id];
      
      if (preset) {
        return {
          ...node,
          x: preset.x,
          y: preset.y,
          vx: 0,
          vy: 0,
        };
      }

      // Fallback for any nodes without preset positions
      let radius = 200;
      if (node.type === 'section') radius = 120;
      else if (node.type === 'skill') radius = 280;
      
      const angle = Math.random() * Math.PI * 2;
      
      return {
        ...node,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyForces = useCallback((
    nodes: NeuralNode[],
    centerX: number,
    centerY: number
  ): NeuralNode[] => {
    const updatedNodes = [...nodes];

    // Apply forces between all nodes
    // Note: centerX and centerY are now 0,0 since nodes are in local space
    for (let i = 0; i < updatedNodes.length; i++) {
      const nodeA = updatedNodes[i];
      if (!nodeA.x || !nodeA.y) continue;
      if (nodeA.fixed) continue;

      let fx = 0;
      let fy = 0;

      // Center force (gravity towards origin 0,0)
      const dcx = 0 - nodeA.x;
      const dcy = 0 - nodeA.y;
      const distanceToCenter = Math.sqrt(dcx * dcx + dcy * dcy);
      if (distanceToCenter > 0) {
        fx += (dcx / distanceToCenter) * physicsConfig.centerForce * distanceToCenter;
        fy += (dcy / distanceToCenter) * physicsConfig.centerForce * distanceToCenter;
      }

      // Forces from other nodes
      for (let j = 0; j < updatedNodes.length; j++) {
        if (i === j) continue;
        const nodeB = updatedNodes[j];
        if (!nodeB.x || !nodeB.y) continue;

        const dx = nodeB.x - nodeA.x;
        const dy = nodeB.y - nodeA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) continue;

        const isConnected = areNodesConnected(nodeA, nodeB);

        if (isConnected) {
          // Link force (spring attraction)
          const force = (distance - physicsConfig.linkDistance) * physicsConfig.linkStrength;
          fx += (dx / distance) * force;
          fy += (dy / distance) * force;
        } else {
          // Charge force (repulsion)
          const force = physicsConfig.chargeStrength / (distance * distance);
          fx += (dx / distance) * force;
          fy += (dy / distance) * force;
        }

        // Collision detection
        const radiusA = getNodeRadius(nodeA.size) * physicsConfig.collisionRadius;
        const radiusB = getNodeRadius(nodeB.size) * physicsConfig.collisionRadius;
        const minDistance = radiusA + radiusB;

        if (distance < minDistance) {
          const force = (minDistance - distance) * 0.5;
          fx -= (dx / distance) * force;
          fy -= (dy / distance) * force;
        }
      }

      // Update velocity
      nodeA.vx = ((nodeA.vx || 0) + fx) * physicsConfig.velocityDecay;
      nodeA.vy = ((nodeA.vy || 0) + fy) * physicsConfig.velocityDecay;

      // Update position
      nodeA.x += nodeA.vx;
      nodeA.y += nodeA.vy;
    }

    return updatedNodes;
  }, [physicsConfig]);

  const simulate = useCallback((
    nodes: NeuralNode[],
    centerX: number,
    centerY: number,
    onUpdate: (nodes: NeuralNode[]) => void,
    iterations: number = 300
  ) => {
    let currentNodes = [...nodes];
    let iteration = 0;

    const step = () => {
      currentNodes = applyForces(currentNodes, centerX, centerY);
      onUpdate(currentNodes);
      iteration++;

      if (iteration < iterations) {
        animationFrameRef.current = requestAnimationFrame(step);
      }
    };

    step();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [applyForces]);

  const stopSimulation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  return {
    initializePositions,
    applyForces,
    simulate,
    stopSimulation,
  };
};

