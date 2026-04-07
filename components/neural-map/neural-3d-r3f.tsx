'use client';

import { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import { createSampleData, NeuralNode } from '@/lib/neural-map-data';
import { DebugPanel } from './debug-panel';

interface HexNodeProps {
  node: NeuralNode;
  isHovered: boolean;
  isConnected: boolean;
  onClick: () => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}

function HexNode({ node, isHovered, isConnected, onClick, onPointerEnter, onPointerLeave }: HexNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const innerGlowRef = useRef<THREE.Mesh>(null);

  const size = node.size === 'large' ? 70 : node.size === 'medium' ? 45 : 28;
  const position: [number, number, number] = [node.x || 0, node.y || 0, node.z || 0];

  useFrame(({ clock }) => {
    if (!meshRef.current || !glowRef.current || !innerGlowRef.current) return;

    const time = clock.getElapsedTime();
    const dist = Math.sqrt(position[0] ** 2 + position[1] ** 2 + position[2] ** 2);
    const wave = Math.sin(time * 2 - dist * 0.01) * 0.5 + 0.5;

    // Rotation
    meshRef.current.rotation.z += isHovered ? 0.03 : 0.008;

    // Glow scale
    const scale = isHovered ? 1.4 : isConnected ? 1.2 : 1 + wave * 0.08;
    glowRef.current.scale.set(scale, 1, scale);

    // Glow opacity
    const glowMat = glowRef.current.material as THREE.MeshBasicMaterial;
    glowMat.opacity = isHovered ? 0.7 : isConnected ? 0.5 : wave * 0.25;

    // Inner glow
    const innerMat = innerGlowRef.current.material as THREE.MeshBasicMaterial;
    innerMat.opacity = isHovered ? 0.8 : isConnected ? 0.6 : 0.3 + wave * 0.2;

    // Main material
    const mainMat = meshRef.current.material as THREE.MeshPhysicalMaterial;
    mainMat.opacity = isHovered ? 0.6 : isConnected ? 0.45 : 0.3;
  });

  return (
    <group position={position}>
      {/* Main hexagon */}
      <mesh
        ref={meshRef}
        rotation={[Math.PI / 2, 0, 0]}
        onClick={onClick}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      >
        <cylinderGeometry args={[size, size, 15, 6]} />
        <meshPhysicalMaterial
          color={node.color}
          transparent
          opacity={0.3}
          metalness={0}
          roughness={0.05}
          transmission={0.9}
          thickness={1.5}
          clearcoat={1}
          clearcoatRoughness={0.05}
          ior={1.5}
        />
      </mesh>

      {/* Inner glow */}
      <mesh ref={innerGlowRef}>
        <sphereGeometry args={[size * 0.5, 16, 16]} />
        <meshBasicMaterial
          color={node.color}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Outer glow */}
      <mesh ref={glowRef} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[size * 2, size * 2, 15, 6]} />
        <meshBasicMaterial
          color={node.color}
          transparent
          opacity={0}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

function ConnectionLine({ start, end }: { start: THREE.Vector3; end: THREE.Vector3 }) {
  const points = useMemo(() => [start, end], [start, end]);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color={0x4a5568} transparent opacity={0.12} />
    </line>
  );
}

function SignalBeam({ start, end, progress }: { start: THREE.Vector3; end: THREE.Vector3; progress: number }) {
  const trailLength = 0.15;
  const trailStart = Math.max(0, progress - trailLength);
  
  const currentPos = useMemo(() => start.clone().lerp(end, progress), [start, end, progress]);
  const trailStartPos = useMemo(() => start.clone().lerp(end, trailStart), [start, end, trailStart]);
  
  const points = [trailStartPos, currentPos];
  
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color={0xffffff} transparent opacity={0.9 * (1 - progress)} />
    </line>
  );
}

function Scene({ onHover, hoveredNode, debugMode }: { 
  onHover: (node: NeuralNode | null) => void;
  hoveredNode: NeuralNode | null;
  debugMode?: boolean;
}) {
  const router = useRouter();
  const [signals, setSignals] = useState<Array<{ start: THREE.Vector3; end: THREE.Vector3; progress: number; speed: number; id: string }>>([]);
  
  const { nodes } = createSampleData();
  
  const nodes3D = useMemo(() => {
    const presetPositions: Record<string, { x: number; y: number; z: number }> = {
      'center': { x: 0, y: 0, z: 0 },
      'about': { x: -163, y: -131, z: -50 },
      'projects-hub': { x: 63, y: -80, z: 50 },
      'contact': { x: 0, y: 140, z: -30 },
      'project-1': { x: 78, y: 82, z: 40 },
      'project-2': { x: -244, y: 136, z: -40 },
      'project-3': { x: 0, y: -200, z: 60 },
      'skill-react': { x: 281, y: -134, z: -60 },
      'skill-nextjs': { x: 431, y: 171, z: 30 },
      'skill-canvas': { x: 180, y: 276, z: -45 },
      'skill-threejs': { x: -442, y: 269, z: 55 },
      'skill-webgl': { x: -516, y: -154, z: -35 },
      'skill-typescript': { x: -422, y: 50, z: 45 },
      'skill-design': { x: -348, y: -305, z: -55 },
      'skill-development': { x: 100, y: -275, z: 35 },
    };

    return nodes.map(node => ({
      ...node,
      ...presetPositions[node.id],
    }));
  }, [nodes]);

  // Update signals
  useFrame(() => {
    // Update existing signals
    setSignals(prev => {
      const updated = prev.map(s => ({ ...s, progress: s.progress + s.speed }))
        .filter(s => s.progress < 1);
      
      // Spawn new signals to hovered node
      if (hoveredNode && Math.random() > 0.85) {
        const hoveredNode3D = nodes3D.find(n => n.id === hoveredNode.id);
        if (hoveredNode3D) {
          const connectedNodes = nodes3D.filter(n => 
            hoveredNode3D.connections.includes(n.id)
          );
          
          if (connectedNodes.length > 0) {
            const source = connectedNodes[Math.floor(Math.random() * connectedNodes.length)];
            const newSignal = {
              start: new THREE.Vector3(source.x || 0, source.y || 0, source.z || 0),
              end: new THREE.Vector3(hoveredNode3D.x || 0, hoveredNode3D.y || 0, hoveredNode3D.z || 0),
              progress: 0,
              speed: 0.04 + Math.random() * 0.03,
              id: `${source.id}-${hoveredNode3D.id}-${Date.now()}-${Math.random()}`,
            };
            
            if (updated.length < 15) {
              return [...updated, newSignal];
            }
          }
        }
      }
      
      return updated;
    });
  });

  // Connections
  const connections = useMemo(() => {
    const conns: Array<{ start: THREE.Vector3; end: THREE.Vector3; key: string }> = [];
    const drawn = new Set<string>();

    nodes3D.forEach(node1 => {
      node1.connections.forEach(connId => {
        const key = [node1.id, connId].sort().join('-');
        if (drawn.has(key)) return;
        drawn.add(key);

        const node2 = nodes3D.find(n => n.id === connId);
        if (node2) {
          conns.push({
            start: new THREE.Vector3(node1.x || 0, node1.y || 0, node1.z || 0),
            end: new THREE.Vector3(node2.x || 0, node2.y || 0, node2.z || 0),
            key,
          });
        }
      });
    });

    return conns;
  }, [nodes3D]);

  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.5} />
      <pointLight position={[300, 300, 300]} intensity={3} distance={1500} color="#8b5cf6" />
      <pointLight position={[-300, -300, 300]} intensity={3} distance={1500} color="#3b82f6" />
      <pointLight position={[0, 300, -300]} intensity={2} distance={1500} color="#06b6d4" />
      
      {/* Fog */}
      <fog attach="fog" args={['#0a0a0a', 1200, 2500]} />

      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 0, 900]} fov={60} />
      
      {/* Controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        enablePan={false}
        minDistance={400}
        maxDistance={1500}
        autoRotate={!debugMode}
        autoRotateSpeed={0.3}
      />

      {/* Connections */}
      {connections.map(conn => (
        <ConnectionLine key={conn.key} start={conn.start} end={conn.end} />
      ))}

      {/* Signal beams */}
      {signals.map(signal => (
        <SignalBeam key={signal.id} start={signal.start} end={signal.end} progress={signal.progress} />
      ))}

      {/* Nodes */}
      {nodes3D.map(node => (
        <HexNode
          key={node.id}
          node={node}
          isHovered={hoveredNode?.id === node.id}
          isConnected={hoveredNode ? node.connections.includes(hoveredNode.id) : false}
          onClick={() => {
            if (node.url && !debugMode) {
              router.push(node.url);
            }
          }}
          onPointerEnter={() => onHover(node)}
          onPointerLeave={() => onHover(null)}
        />
      ))}
    </>
  );
}

export const Neural3DR3F = ({ onReady, debugMode }: { onReady?: () => void; debugMode?: boolean }) => {
  const [hoveredNode, setHoveredNode] = useState<NeuralNode | null>(null);
  const [nodes, setNodes] = useState<NeuralNode[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isReady) return;
    const { nodes: sampleNodes } = createSampleData();
    const presetPositions: Record<string, { x: number; y: number; z: number }> = {
      'center': { x: 0, y: 0, z: 0 },
      'about': { x: -163, y: -131, z: -50 },
      'projects-hub': { x: 63, y: -80, z: 50 },
      'contact': { x: 0, y: 140, z: -30 },
      'project-1': { x: 78, y: 82, z: 40 },
      'project-2': { x: -244, y: 136, z: -40 },
      'project-3': { x: 0, y: -200, z: 60 },
      'skill-react': { x: 281, y: -134, z: -60 },
      'skill-nextjs': { x: 431, y: 171, z: 30 },
      'skill-canvas': { x: 180, y: 276, z: -45 },
      'skill-threejs': { x: -442, y: 269, z: 55 },
      'skill-webgl': { x: -516, y: -154, z: -35 },
      'skill-typescript': { x: -422, y: 50, z: 45 },
      'skill-design': { x: -348, y: -305, z: -55 },
      'skill-development': { x: 100, y: -275, z: 35 },
    };

    const positioned = sampleNodes.map(node => ({
      ...node,
      ...presetPositions[node.id],
    }));
    
    setNodes(positioned);
    setIsReady(true);
    setTimeout(() => onReady?.(), 100);
  }, [onReady, isReady]);

  return (
    <>
      <div className="absolute inset-0 w-full h-full">
        <Canvas
          gl={{ 
            antialias: true, 
            alpha: false,
            powerPreference: 'high-performance',
          }}
          dpr={[1, 2]}
        >
          <color attach="background" args={['#ffffff']} />
          <Scene onHover={setHoveredNode} hoveredNode={hoveredNode} debugMode={debugMode} />
        </Canvas>
      </div>
      
      {debugMode && nodes.length > 0 && (
        <DebugPanel 
          nodes={nodes} 
          onClose={() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('neural-debug-mode');
              localStorage.removeItem('neural-3d-mode');
              window.location.reload();
            }
          }} 
        />
      )}
    </>
  );
};

