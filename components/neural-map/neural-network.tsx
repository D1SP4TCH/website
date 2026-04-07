'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  NeuralNode,
  createSampleData,
  getNodeRadius,
  areNodesConnected,
} from '@/lib/neural-map-data';
import { useNeuralPhysics } from '@/hooks/use-neural-physics';
import { useNeuralInteractions } from '@/hooks/use-neural-interactions';
import { DebugPanel } from './debug-panel';

interface NeuralNetworkProps {
  onReady?: () => void;
  debugMode?: boolean;
}

interface Particle {
  node1Id: string;
  node2Id: string;
  progress: number;
  speed: number;
}

export const NeuralNetwork = ({ onReady, debugMode }: NeuralNetworkProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const [nodes, setNodes] = useState<NeuralNode[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [internalDebugMode, setInternalDebugMode] = useState(false);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const timeRef = useRef(0);
  
  // Use prop debugMode or internal state
  const isDebugMode = debugMode ?? internalDebugMode;

  // Check for debug mode on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const debugParam = urlParams.get('debug');
      const localStorageDebug = localStorage.getItem('neural-debug-mode');
      
      if (debugParam === 'true' || localStorageDebug === 'true') {
        setInternalDebugMode(true);
        console.log('🔧 Neural Debug Mode Enabled');
      }
    }
  }, []);

  const { initializePositions, applyForces } = useNeuralPhysics();
  const { hoveredNode, draggedNode, isDragging, handleClick } = useNeuralInteractions(
    nodes,
    canvasRef,
    transform
  );

  // Initialize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Ensure canvas has dimensions
    if (canvas.width === 0 || canvas.height === 0) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    if (isInitialized) return;

    const { nodes: sampleNodes } = createSampleData();
    const initializedNodes = initializePositions(
      sampleNodes,
      canvas.width,
      canvas.height
    );
    
    setNodes(initializedNodes);
    setIsInitialized(true);
    
    // Call onReady after a small delay to ensure rendering starts
    setTimeout(() => {
      onReady?.();
    }, 100);
  }, [initializePositions, isInitialized, onReady]);

  // Resize handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Re-center transform
      setTransform(prev => ({
        ...prev,
        x: canvas.width / 2,
        y: canvas.height / 2,
      }));
    };

    resize();
    window.addEventListener('resize', resize);

    return () => window.removeEventListener('resize', resize);
  }, []);

  // Update dragged node position
  useEffect(() => {
    if (draggedNode) {
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === draggedNode.id ? draggedNode : node
        )
      );
    }
  }, [draggedNode]);

  // Physics simulation (only when not dragging) - reduced frequency for performance
  useEffect(() => {
    if (isDragging || nodes.length === 0) return;

    const interval = setInterval(() => {
      setNodes((prevNodes) => {
        // Nodes are in local space centered at origin
        return applyForces(prevNodes, 0, 0);
      });
    }, 50); // ~20fps - smoother performance

    return () => clearInterval(interval);
  }, [isDragging, nodes.length, applyForces]);

  // Generate particles - reduced for performance
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.85) { // Reduced spawn rate
        const connections: Array<[NeuralNode, NeuralNode]> = [];
        
        nodes.forEach((node1) => {
          node1.connections.forEach((connId) => {
            const node2 = nodes.find((n) => n.id === connId);
            if (node2 && node1.x && node1.y && node2.x && node2.y) {
              connections.push([node1, node2]);
            }
          });
        });

        if (connections.length > 0) {
          const [node1, node2] = connections[Math.floor(Math.random() * connections.length)];
          
          setParticles((prev) => [
            ...prev.slice(-10), // Reduced max particles
            {
              node1Id: node1.id,
              node2Id: node2.id,
              progress: 0,
              speed: 0.02 + Math.random() * 0.03,
            },
          ]);
        }
      }
    }, 500); // Less frequent checks

    return () => clearInterval(interval);
  }, [nodes]);

  // Update particles - optimized
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({ ...p, progress: p.progress + p.speed }))
          .filter((p) => p.progress < 1)
      );
    }, 33); // 30fps for particles

    return () => clearInterval(interval);
  }, []);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      timeRef.current += 0.016;

      // Clear
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.scale, transform.scale);

      // Draw connections - optimized
      const drawnConnections = new Set<string>();
      nodes.forEach((node1) => {
        const x1 = node1.x;
        const y1 = node1.y;
        if (x1 === undefined || y1 === undefined) return;

        node1.connections.forEach((connId) => {
          // Avoid drawing same connection twice
          const connectionKey = [node1.id, connId].sort().join('-');
          if (drawnConnections.has(connectionKey)) return;
          drawnConnections.add(connectionKey);

          const node2 = nodes.find((n) => n.id === connId);
          const x2 = node2?.x;
          const y2 = node2?.y;
          if (!node2 || x2 === undefined || y2 === undefined) return;

          const isHighlighted =
            hoveredNode?.id === node1.id ||
            hoveredNode?.id === node2.id;

          const opacity = isHighlighted ? 0.6 : 0.2;

          // Simple color instead of gradient for performance
          ctx.strokeStyle = isHighlighted 
            ? `rgba(139, 92, 246, ${opacity})` 
            : `rgba(100, 100, 120, ${opacity})`;
          ctx.lineWidth = isHighlighted ? 2 : 1;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        });
      });

      // Draw particles
      particles.forEach((particle) => {
        const node1 = nodes.find((n) => n.id === particle.node1Id);
        const node2 = nodes.find((n) => n.id === particle.node2Id);
        const px1 = node1?.x;
        const py1 = node1?.y;
        const px2 = node2?.x;
        const py2 = node2?.y;
        if (!node1 || !node2 || px1 === undefined || py1 === undefined || px2 === undefined || py2 === undefined) return;

        const x = px1 + (px2 - px1) * particle.progress;
        const y = py1 + (py2 - py1) * particle.progress;

        ctx.fillStyle = '#8b5cf6';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw nodes
      nodes.forEach((node) => {
        const nx = node.x;
        const ny = node.y;
        if (nx === undefined || ny === undefined) return;

        const radius = getNodeRadius(node.size);
        const isHovered = hoveredNode?.id === node.id;
        const isConnectedToHovered = hoveredNode && areNodesConnected(node, hoveredNode);
        const scale = isHovered ? 1.2 : isConnectedToHovered ? 1.1 : 1;
        const finalRadius = radius * scale;

        // Pulse animation for center node
        const pulse = node.type === 'center' ? Math.sin(timeRef.current * 2) * 0.1 + 1 : 1;

        // Glow - simplified for performance
        if (isHovered || node.type === 'center') {
          const glowRadius = finalRadius * (node.type === 'center' ? 1.8 * pulse : 1.3);
          const gradient = ctx.createRadialGradient(nx, ny, 0, nx, ny, glowRadius);
          gradient.addColorStop(0, `${node.color}40`);
          gradient.addColorStop(1, `${node.color}00`);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(nx, ny, glowRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Node circle
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(nx, ny, finalRadius * (node.type === 'center' ? pulse : 1), 0, Math.PI * 2);
        ctx.fill();

        // Border - thicker for center
        ctx.strokeStyle = isHovered ? '#000000' : `${node.color}cc`;
        ctx.lineWidth = node.type === 'center' ? 3 : 2;
        ctx.stroke();

        // Icon or title
        ctx.fillStyle = '#000000';
        ctx.font = node.size === 'large' ? 'bold 16px sans-serif' : node.size === 'medium' ? 'bold 14px sans-serif' : '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (node.icon) {
          ctx.font = node.size === 'large' ? '32px sans-serif' : node.size === 'medium' ? '24px sans-serif' : '16px sans-serif';
          ctx.fillText(node.icon, nx, ny);
        } else if (node.size === 'large') {
          const lines = node.title.split(' ');
          lines.forEach((line, i) => {
            ctx.fillText(line, nx, ny + (i - lines.length / 2 + 0.5) * 20);
          });
        }

        // Label below node
        if (node.size !== 'large' && !node.icon) {
          ctx.font = '12px sans-serif';
          ctx.fillStyle = '#000000';
          ctx.fillText(node.title, nx, ny + finalRadius + 15);
        }
      });

      ctx.restore();

      // Tooltip for hovered node
      if (hoveredNode && hoveredNode.description) {
        const x = (hoveredNode.x || 0) * transform.scale + transform.x;
        const y = (hoveredNode.y || 0) * transform.scale + transform.y - 50;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.strokeStyle = hoveredNode.color;
        ctx.lineWidth = 2;
        
        const padding = 12;
        const textWidth = ctx.measureText(hoveredNode.description).width;
        const boxWidth = textWidth + padding * 2;
        const boxHeight = 30;

        ctx.beginPath();
        ctx.roundRect(x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#000000';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hoveredNode.description, x, y);
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [nodes, particles, hoveredNode, transform]);

  // Handle canvas click (disabled in debug mode)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isDebugMode) return; // Skip if in debug mode

    const onClick = (e: MouseEvent) => {
      handleClick(e, (url) => router.push(url));
    };

    canvas.addEventListener('click', onClick);
    return () => canvas.removeEventListener('click', onClick);
  }, [handleClick, router, isDebugMode]);

  // Zoom with mouse wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.001;
      setTransform((prev) => ({
        ...prev,
        scale: Math.max(0.5, Math.min(2, prev.scale + delta)),
      }));
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full bg-white"
        style={{ cursor: isDebugMode ? 'move' : 'grab', display: 'block' }}
      />
      
      {isDebugMode && (
        <DebugPanel 
          nodes={nodes} 
          onClose={() => {
            setInternalDebugMode(false);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('neural-debug-mode');
            }
          }} 
        />
      )}
    </>
  );
};

