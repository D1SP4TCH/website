'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useMousePosition } from '@/hooks/use-mouse-position';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  connections: number[];
  activated: boolean;
  activationTime: number;
}

interface NeuralBootProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export const NeuralBoot = ({ onComplete, onSkip }: NeuralBootProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const animationFrameRef = useRef<number>();
  const mousePosition = useMousePosition();
  
  const [stage, setStage] = useState(0); // 0: forming, 1: pulsing, 2: revealing, 3: complete
  const [progress, setProgress] = useState(0);
  const [nameRevealed, setNameRevealed] = useState(false);
  const startTimeRef = useRef(Date.now());

  const createNodes = useCallback((width: number, height: number) => {
    const nodes: Node[] = [];
    const nodeCount = Math.min(Math.floor((width * height) / 8000), 150);
    
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        connections: [],
        activated: false,
        activationTime: 0,
      });
    }
    
    // Create connections between nearby nodes
    nodes.forEach((node, i) => {
      const nearbyNodes = nodes
        .map((n, idx) => ({ node: n, idx }))
        .filter(({ node: n, idx }) => {
          if (idx === i) return false;
          const dx = n.x - node.x;
          const dy = n.y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance < 150;
        })
        .sort((a, b) => {
          const distA = Math.sqrt(Math.pow(a.node.x - node.x, 2) + Math.pow(a.node.y - node.y, 2));
          const distB = Math.sqrt(Math.pow(b.node.x - node.x, 2) + Math.pow(b.node.y - node.y, 2));
          return distA - distB;
        })
        .slice(0, 5);
      
      node.connections = nearbyNodes.map(n => n.idx);
    });
    
    return nodes;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      nodesRef.current = createNodes(canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);

    let animationStartTime = Date.now();
    let waveOriginX = canvas.width / 2;
    let waveOriginY = canvas.height / 2;

    const draw = () => {
      const now = Date.now();
      const elapsed = now - animationStartTime;
      
      // Clear with fade trail
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const nodes = nodesRef.current;
      
      // Update wave origin based on mouse position
      if (mousePosition.x > 0 && mousePosition.y > 0) {
        waveOriginX += (mousePosition.x - waveOriginX) * 0.05;
        waveOriginY += (mousePosition.y - waveOriginY) * 0.05;
      }

      // Activation wave spreads from origin
      const waveRadius = (elapsed / 15) + (progress * 200);
      
      nodes.forEach((node, i) => {
        // Update position with subtle floating
        if (stage < 3) {
          node.x += node.vx;
          node.y += node.vy;

          if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
          if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
        }

        // Check if node should be activated by wave
        const dx = node.x - waveOriginX;
        const dy = node.y - waveOriginY;
        const distanceFromOrigin = Math.sqrt(dx * dx + dy * dy);
        
        if (distanceFromOrigin < waveRadius && !node.activated) {
          node.activated = true;
          node.activationTime = now;
        }

        // Draw connections
        if (node.activated) {
          node.connections.forEach(connIdx => {
            const connNode = nodes[connIdx];
            if (!connNode.activated) return;

            const timeSinceActivation = now - node.activationTime;
            const opacity = Math.min(timeSinceActivation / 500, 1) * (1 - progress * 0.3);
            
            // Distance-based intensity
            const dx = connNode.x - node.x;
            const dy = connNode.y - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const intensity = 1 - (distance / 150);

            // Mouse proximity effect
            let mouseInfluence = 0;
            if (mousePosition.x > 0) {
              const mdx = (node.x + connNode.x) / 2 - mousePosition.x;
              const mdy = (node.y + connNode.y) / 2 - mousePosition.y;
              const mouseDist = Math.sqrt(mdx * mdx + mdy * mdy);
              mouseInfluence = Math.max(0, 1 - mouseDist / 200);
            }

            const finalOpacity = opacity * intensity * (0.3 + mouseInfluence * 0.7);

            // Gradient line with cyberpunk colors
            const gradient = ctx.createLinearGradient(node.x, node.y, connNode.x, connNode.y);
            gradient.addColorStop(0, `rgba(139, 92, 246, ${finalOpacity})`); // Purple
            gradient.addColorStop(0.5, `rgba(59, 130, 246, ${finalOpacity})`); // Blue
            gradient.addColorStop(1, `rgba(6, 182, 212, ${finalOpacity})`); // Cyan

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1 + mouseInfluence * 2;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(connNode.x, connNode.y);
            ctx.stroke();

            // Data packets flowing along connections
            if (stage >= 1 && Math.random() > 0.98) {
              const t = Math.random();
              const px = node.x + (connNode.x - node.x) * t;
              const py = node.y + (connNode.y - node.y) * t;
              
              ctx.fillStyle = `rgba(139, 92, 246, ${opacity})`;
              ctx.beginPath();
              ctx.arc(px, py, 2, 0, Math.PI * 2);
              ctx.fill();
            }
          });
        }

        // Draw nodes
        if (node.activated) {
          const timeSinceActivation = now - node.activationTime;
          const pulseOpacity = Math.min(timeSinceActivation / 500, 1);
          const pulse = Math.sin(elapsed / 500 + i) * 0.3 + 0.7;

          // Mouse proximity glow
          let glowSize = 3;
          if (mousePosition.x > 0) {
            const mdx = node.x - mousePosition.x;
            const mdy = node.y - mousePosition.y;
            const mouseDist = Math.sqrt(mdx * mdx + mdy * mdy);
            const mouseGlow = Math.max(0, 1 - mouseDist / 150);
            glowSize = 3 + mouseGlow * 8;
          }

          // Glow
          const glowGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowSize);
          glowGradient.addColorStop(0, `rgba(139, 92, 246, ${pulseOpacity * pulse * 0.8})`);
          glowGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, glowSize, 0, Math.PI * 2);
          ctx.fill();

          // Core
          ctx.fillStyle = `rgba(139, 92, 246, ${pulseOpacity})`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Auto-progress stages
      if (elapsed > 2000 && stage === 0) {
        setStage(1);
      }
      if (elapsed > 4000 && stage === 1) {
        setStage(2);
        setNameRevealed(true);
      }
      if (elapsed > 7000 && stage === 2) {
        setStage(3);
        setTimeout(onComplete, 1000);
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [createNodes, mousePosition, stage, progress, onComplete]);

  // Scroll to progress
  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      e.preventDefault();
      setProgress(prev => Math.min(1, prev + e.deltaY / 1000));
      
      if (progress > 0.3 && stage === 0) setStage(1);
      if (progress > 0.6 && stage === 1) {
        setStage(2);
        setNameRevealed(true);
      }
      if (progress > 0.95 && stage === 2) {
        setStage(3);
        setTimeout(onComplete, 500);
      }
    };

    window.addEventListener('wheel', handleScroll, { passive: false });
    return () => window.removeEventListener('wheel', handleScroll);
  }, [progress, stage, onComplete]);

  return (
    <div className="fixed inset-0 bg-white overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ cursor: 'none' }}
      />

      {/* Custom cursor */}
      {mousePosition.x > 0 && (
        <div
          className="fixed w-8 h-8 pointer-events-none z-50 mix-blend-screen"
          style={{
            left: mousePosition.x - 16,
            top: mousePosition.y - 16,
            transition: 'opacity 0.2s',
          }}
        >
          <div className="w-full h-full rounded-full border-2 border-purple-400 animate-ping opacity-75" />
          <div className="absolute inset-0 w-full h-full rounded-full border border-cyan-400" />
        </div>
      )}

      {/* Text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div
          className={`text-center transition-all duration-1000 ${
            nameRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <h1 className="text-7xl md:text-9xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Your Name
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-light tracking-wide">
            Creative Developer & Designer
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <div className={`transition-opacity duration-500 ${stage >= 2 ? 'opacity-0' : 'opacity-100'}`}>
          <p className="text-gray-600 text-sm mb-2">Move your mouse to interact</p>
          <p className="text-gray-500 text-xs">Scroll or wait to continue</p>
        </div>
      </div>

      {/* Skip button */}
      <button
        onClick={onSkip}
        className="absolute top-6 right-6 px-4 py-2 text-sm text-gray-600 hover:text-black border border-gray-300 hover:border-gray-400 rounded-lg transition-all duration-300 hover:scale-105 pointer-events-auto"
      >
        Skip
      </button>

      {/* Progress indicator */}
      <div className="absolute top-6 left-6 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-500 ${
              stage >= i ? 'bg-purple-600 scale-100' : 'bg-gray-300 scale-75'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

