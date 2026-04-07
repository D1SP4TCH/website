"use client";

/**
 * Particle Systems Collection
 * Ambient effects for enhanced atmosphere
 */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Floating Dust Particles (ambient room particles)
export function FloatingDust({
  count = 200,
  size = 0.02,
  color = "#ffffff",
  spread = 5,
}: {
  count?: number;
  size?: number;
  color?: string;
  spread?: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Random positions
      positions[i * 3] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;

      // Random slow velocities
      velocities[i * 3] = (Math.random() - 0.5) * 0.001;
      velocities[i * 3 + 1] = Math.random() * 0.002;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.001;
    }

    return { positions, velocities };
  }, [count, spread]);

  useFrame(() => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      // Move particles
      positions[i * 3] += particles.velocities[i * 3];
      positions[i * 3 + 1] += particles.velocities[i * 3 + 1];
      positions[i * 3 + 2] += particles.velocities[i * 3 + 2];

      // Wrap around
      if (positions[i * 3 + 1] > spread / 2) {
        positions[i * 3 + 1] = -spread / 2;
      }
      if (Math.abs(positions[i * 3]) > spread / 2) {
        positions[i * 3] = (Math.random() - 0.5) * spread;
      }
      if (Math.abs(positions[i * 3 + 2]) > spread / 2) {
        positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Screen Particles (glowing particles near monitor)
export function ScreenParticles({
  position = [0, 0, 0],
  count = 50,
  color = "#3b82f6",
}: {
  position?: [number, number, number];
  count?: number;
  color?: string;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.6;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
      positions[i * 3 + 2] = Math.random() * 0.2;

      velocities[i * 3] = (Math.random() - 0.5) * 0.002;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.002;
      velocities[i * 3 + 2] = Math.random() * 0.001;
    }

    return { positions, velocities };
  }, [count]);

  useFrame(() => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      positions[i * 3] += particles.velocities[i * 3];
      positions[i * 3 + 1] += particles.velocities[i * 3 + 1];
      positions[i * 3 + 2] += particles.velocities[i * 3 + 2];

      // Reset if too far
      if (positions[i * 3 + 2] > 0.3) {
        positions[i * 3] = (Math.random() - 0.5) * 0.6;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
        positions[i * 3 + 2] = 0;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group position={position}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={particles.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.015}
          color={color}
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

// Magic Sparkles (for interactions)
export function MagicSparkles({
  position = [0, 0, 0],
  count = 30,
  colors = ["#3b82f6", "#8b5cf6", "#06b6d4"],
}: {
  position?: [number, number, number];
  count?: number;
  colors?: string[];
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colorArray = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = Math.random() * 0.3;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.random() * 0.2 - 0.1;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      const colorIndex = Math.floor(Math.random() * colors.length);
      const color = new THREE.Color(colors[colorIndex]);
      colorArray[i * 3] = color.r;
      colorArray[i * 3 + 1] = color.g;
      colorArray[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * 0.02 + 0.01;
    }

    return { positions, colorArray, sizes };
  }, [count, colors]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + state.clock.elapsedTime;
      const radius = 0.2 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.1;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(state.clock.elapsedTime + i) * 0.1;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group position={position}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={particles.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={count}
            array={particles.colorArray}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={count}
            array={particles.sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

// Data Stream Particles (Matrix-style)
export function DataStream({
  position = [0, 0, 0],
  count = 100,
}: {
  position?: [number, number, number];
  count?: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = Math.random() * 3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
      velocities[i] = Math.random() * 0.01 + 0.005;
    }

    return { positions, velocities };
  }, [count]);

  useFrame(() => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] -= particles.velocities[i];

      if (positions[i * 3 + 1] < -1) {
        positions[i * 3 + 1] = 3;
        positions[i * 3] = (Math.random() - 0.5) * 2;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group position={position}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={particles.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          color="#00ff00"
          transparent
          opacity={0.6}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

// Floating Flower Particles (hover around flowers with 3D motion)
export function FloatingFlowerParticles({
  position = [0, 0, 0],
  count = 8,
  radius = 0.3,
  color = "#ffffff",
}: {
  position?: [number, number, number];
  count?: number;
  radius?: number;
  color?: string;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  // Create circular gradient texture for particles
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    
    const context = canvas.getContext('2d');
    if (!context) return null;
    
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const offsets = new Float32Array(count * 3); // 3D offsets for varied motion
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Random initial positions in a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = radius * (0.5 + Math.random() * 0.5);
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Random phase offsets for varied motion
      offsets[i * 3] = Math.random() * Math.PI * 2;
      offsets[i * 3 + 1] = Math.random() * Math.PI * 2;
      offsets[i * 3 + 2] = Math.random() * Math.PI * 2;

      // Random speeds
      speeds[i] = 0.3 + Math.random() * 0.4;
    }

    return { positions, offsets, speeds };
  }, [count, radius]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      // 3D floating motion with different frequencies
      const speed = particles.speeds[i];
      const offsetX = particles.offsets[i * 3];
      const offsetY = particles.offsets[i * 3 + 1];
      const offsetZ = particles.offsets[i * 3 + 2];

      // Smooth 3D hovering using sine waves with different phases
      positions[i * 3] = Math.sin(time * speed + offsetX) * radius * 0.8;
      positions[i * 3 + 1] = Math.sin(time * speed * 0.7 + offsetY) * radius * 0.6;
      positions[i * 3 + 2] = Math.cos(time * speed * 0.8 + offsetZ) * radius * 0.8;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group position={position}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={particles.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          color={color}
          map={particleTexture}
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

// Orbiting Particles (around objects)
export function OrbitingParticles({
  position = [0, 0, 0],
  count = 20,
  radius = 0.3,
  speed = 1,
  color = "#ffffff",
}: {
  position?: [number, number, number];
  count?: number;
  radius?: number;
  speed?: number;
  color?: string;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const offsets = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      offsets[i] = (i / count) * Math.PI * 2;
    }

    return { positions, offsets };
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const angle = state.clock.elapsedTime * speed + particles.offsets[i];
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle * 2) * 0.1;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group position={position}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={particles.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color={color}
          transparent
          opacity={0.7}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}




