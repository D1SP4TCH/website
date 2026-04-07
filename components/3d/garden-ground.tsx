'use client';

import { useMemo, useRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import {
  PAINTERLY_GROUND_VERTEX,
  PAINTERLY_GROUND_FRAGMENT,
  PAINTERLY_STONE_VERTEX,
  PAINTERLY_STONE_FRAGMENT,
  PAINTERLY_PALETTES,
} from '@/lib/shaders/painterly-shaders';
import { SeededRandom } from '@/lib/utils/seeded-random';

// Painterly Ground Material
const PainterlyGroundMaterial = shaderMaterial(
  {
    uColor1: new THREE.Color(PAINTERLY_PALETTES.spring.ground.color1),
    uColor2: new THREE.Color(PAINTERLY_PALETTES.spring.ground.color2),
    uColor3: new THREE.Color(PAINTERLY_PALETTES.spring.ground.color3),
    uTime: 0,
  },
  PAINTERLY_GROUND_VERTEX,
  PAINTERLY_GROUND_FRAGMENT
);

// Painterly Stone Material
const PainterlyStoneMaterial = shaderMaterial(
  {
    uColor: new THREE.Color(PAINTERLY_PALETTES.spring.stone),
    uTime: 0,
  },
  PAINTERLY_STONE_VERTEX,
  PAINTERLY_STONE_FRAGMENT
);

extend({ PainterlyGroundMaterial, PainterlyStoneMaterial });

// Type declarations
declare module '@react-three/fiber' {
  interface ThreeElements {
    painterlyGroundMaterial: JSX.IntrinsicElements['shaderMaterial'] & {
      uColor1?: THREE.Color;
      uColor2?: THREE.Color;
      uColor3?: THREE.Color;
      uTime?: number;
    };
    painterlyStoneMaterial: JSX.IntrinsicElements['shaderMaterial'] & {
      uColor?: THREE.Color;
      uTime?: number;
    };
  }
}

/**
 * Garden ground with painterly shader
 */
export const GardenGround = () => {
  const groundMatRef = useRef<THREE.ShaderMaterial>(null);
  
  useFrame((state) => {
    if (groundMatRef.current) {
      groundMatRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });
  
  return (
    <group>
      {/* Main ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[20, 32]} />
        <meshBasicMaterial
          color={PAINTERLY_PALETTES.spring.ground.color2}
          wireframe
        />
      </mesh>
      
      {/* Outer grid ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <ringGeometry args={[18, 22, 16]} />
        <meshBasicMaterial 
          color="#A89880"
          wireframe
        />
      </mesh>
      
      {/* Decorative elements */}
      <StoneFormations />
      <ZenCircles />
    </group>
  );
};

/**
 * Stone formations with painterly shader
 */
const StoneFormations = () => {
  const stoneMatRef = useRef<THREE.ShaderMaterial>(null);
  
  useFrame((state) => {
    if (stoneMatRef.current) {
      stoneMatRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });
  
  const stones = useMemo(() => {
    const stoneData: Array<{
      position: [number, number, number];
      scale: [number, number, number];
      rotation: [number, number, number];
      colorShift: number;
    }> = [];
    
    // Main decorative stone clusters
    const clusters = [
      { x: -5, z: 5, count: 4, baseSize: 0.35 },
      { x: 6, z: -4, count: 3, baseSize: 0.3 },
      { x: -3, z: -6, count: 2, baseSize: 0.25 },
      { x: 4, z: 6, count: 3, baseSize: 0.28 },
    ];
    
    for (const cluster of clusters) {
      for (let i = 0; i < cluster.count; i++) {
        const offsetX = (Math.random() - 0.5) * 1.2;
        const offsetZ = (Math.random() - 0.5) * 1.2;
        const size = cluster.baseSize * (0.6 + Math.random() * 0.8);
        
        stoneData.push({
          position: [
            cluster.x + offsetX,
            size * 0.35,
            cluster.z + offsetZ
          ],
          scale: [
            size * (1 + Math.random() * 0.4),
            size * (0.5 + Math.random() * 0.3),
            size * (0.8 + Math.random() * 0.4)
          ],
          rotation: [
            Math.random() * 0.15,
            Math.random() * Math.PI,
            Math.random() * 0.15
          ],
          colorShift: Math.random() * 0.1,
        });
      }
    }
    
    // Scattered pebbles
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 8;
      const size = 0.03 + Math.random() * 0.07;
      
      stoneData.push({
        position: [
          Math.cos(angle) * radius,
          size * 0.5,
          Math.sin(angle) * radius
        ],
        scale: [size * 1.4, size * 0.6, size],
        rotation: [0, Math.random() * Math.PI, 0],
        colorShift: Math.random() * 0.15,
      });
    }
    
    return stoneData;
  }, []);
  
  const baseColor = new THREE.Color(PAINTERLY_PALETTES.spring.stone);
  
  return (
    <group>
      {stones.map((stone, i) => {
        const color = baseColor.clone();
        const hsl = { h: 0, s: 0, l: 0 };
        color.getHSL(hsl);
        color.setHSL(hsl.h, hsl.s, hsl.l + stone.colorShift - 0.05);
        
        return (
          <mesh
            key={i}
            position={stone.position}
            scale={stone.scale}
            rotation={stone.rotation}
            castShadow
            receiveShadow
          >
          <dodecahedronGeometry args={[1, 0]} />
          <meshBasicMaterial
            color={color}
            wireframe
          />
          </mesh>
        );
      })}
    </group>
  );
};

/**
 * Zen garden circles (slowly rotating)
 */
const ZenCircles = () => {
  const circlesRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (circlesRef.current) {
      circlesRef.current.rotation.z = state.clock.getElapsedTime() * 0.008;
    }
  });
  
  const circleColor = new THREE.Color(PAINTERLY_PALETTES.spring.ground.color2);
  circleColor.multiplyScalar(0.95);
  
  return (
    <group ref={circlesRef} position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {[2.5, 4, 5.5, 7.5, 10].map((radius, i) => (
        <mesh key={i}>
          <ringGeometry args={[radius - 0.02, radius + 0.02, 24]} />
          <meshBasicMaterial
            color="#A89880"
            wireframe
          />
        </mesh>
      ))}
    </group>
  );
};

/**
 * Rock formation/bed (rocks only, no flowers)
 */
const RockBed = ({ 
  position, 
  radius = 1.2, 
  seed = 12345 
}: { 
  position: [number, number, number]; 
  radius?: number; 
  seed?: number;
}) => {
  const rng = useMemo(() => new SeededRandom(seed), [seed]);
  
  // Create rocks around the perimeter
  const rocks = useMemo(() => {
    const rockCount = 12 + rng.int(0, 6);
    return Array.from({ length: rockCount }).map((_, i) => {
      const angle = (i / rockCount) * Math.PI * 2 + rng.range(-0.2, 0.2);
      const dist = radius + rng.range(-0.1, 0.15);
      const size = 0.08 + rng.range(0, 0.12);
      const colorShift = rng.range(-0.05, 0.05);
      
      return {
        position: [
          position[0] + Math.cos(angle) * dist,
          position[1] + size * 0.4,
          position[2] + Math.sin(angle) * dist
        ] as [number, number, number],
        scale: [
          size * (1 + rng.range(0, 0.3)),
          size * (0.5 + rng.range(0, 0.2)),
          size * (0.8 + rng.range(0, 0.3))
        ] as [number, number, number],
        rotation: [
          rng.range(-0.2, 0.2),
          rng.range(0, Math.PI * 2),
          rng.range(-0.2, 0.2)
        ] as [number, number, number],
        colorShift,
      };
    });
  }, [position, radius, rng, seed]);
  
  const baseColor = new THREE.Color(PAINTERLY_PALETTES.spring.stone);
  
  return (
    <group>
      {/* Rocks around the border */}
      {rocks.map((rock, i) => {
        const color = baseColor.clone();
        const hsl = { h: 0, s: 0, l: 0 };
        color.getHSL(hsl);
        color.setHSL(hsl.h, hsl.s, hsl.l + rock.colorShift);
        
        return (
          <mesh
            key={`rock-${i}`}
            position={rock.position}
            scale={rock.scale}
            rotation={rock.rotation}
          >
            <dodecahedronGeometry args={[1, 0]} />
            <meshBasicMaterial
              color={color}
              wireframe
            />
          </mesh>
        );
      })}
    </group>
  );
};

/**
 * Garden decorations (exported for scene use)
 */
export const GardenDecorations = () => {
  return (
    <group>
      {/* Additional ambient elements could go here */}
      <AmbientParticles />
    </group>
  );
};

/**
 * Floating ambient particles (dust/pollen)
 */
const AmbientParticles = () => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const count = 50;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2 + Math.random() * 10;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = 0.5 + Math.random() * 3;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    
    return positions;
  }, []);
  
  useFrame((state) => {
    if (particlesRef.current) {
      const time = state.clock.getElapsedTime();
      particlesRef.current.rotation.y = time * 0.02;
      
      // Gentle floating motion
      const posArray = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < posArray.length / 3; i++) {
        posArray[i * 3 + 1] += Math.sin(time * 0.3 + i) * 0.001;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#E8DCC8"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
};
