"use client";

/**
 * Enhanced Retro Desk Scene
 * With shaders, particles, and post-processing effects
 */

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei";
import { CoffeeCup, DeskLamp, GameController, Plant } from "./scaled-desk-items";
import { AppleMacintosh } from "./apple-macintosh";
import { Suspense } from "react";
import * as THREE from "three";

// Import effects
import { FloatingDust, ScreenParticles, MagicSparkles } from "./particles";
import { RetroEffects } from "./post-effects";

function Desk() {
  return (
    <group
      onPointerOver={(e) => {
        // Prevent desk from triggering hover on other objects
        e.stopPropagation();
        document.body.style.cursor = "auto";
      }}
    >
      {/* Desk Surface - Sized for the Mac */}
      <mesh position={[0, -0.21, 0]} receiveShadow>
        <boxGeometry args={[1.5, 0.03, 0.8]} />
        <meshStandardMaterial color="#4a3728" flatShading />
      </mesh>

      {/* Desk Edge Detail */}
      <mesh position={[0, -0.225, 0.4]}>
        <boxGeometry args={[1.5, 0.01, 0.02]} />
        <meshStandardMaterial color="#3a2718" flatShading />
      </mesh>

      {/* Desk Legs */}
      {[
        [-0.7, -0.45, -0.35],
        [0.7, -0.45, -0.35],
        [-0.7, -0.45, 0.35],
        [0.7, -0.45, 0.35],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.04, 0.5, 0.04]} />
          <meshStandardMaterial color="#3a2718" flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Room() {
  return (
    <group
      onPointerOver={(e) => {
        // Prevent room from triggering hover on other objects
        e.stopPropagation();
      }}
    >
      {/* Floor */}
      <mesh position={[0, -0.7, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#1a1a2e" flatShading />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 0.8, -1.5]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#16213e" flatShading />
      </mesh>

      {/* Window glow effect */}
      <mesh position={[1.5, 0.3, -1.45]}>
        <planeGeometry args={[1, 1.5]} />
        <meshStandardMaterial
          color="#1a1a3e"
          emissive="#3b4a7a"
          emissiveIntensity={0.3}
          flatShading
        />
      </mesh>
    </group>
  );
}

function LoadingScreen() {
  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <meshBasicMaterial color="#1a1a2e" />
    </mesh>
  );
}

export function RetroDeskSceneEnhanced() {
  return (
    <div className="h-screen w-full">
      <Canvas
        shadows
        gl={{
          antialias: false, // Retro pixelated look
          toneMapping: THREE.NoToneMapping,
        }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={<LoadingScreen />}>
          {/* Camera Setup - First Person View, framed for Mac */}
          <PerspectiveCamera
            makeDefault
            position={[0, 0.25, 0.9]}
            fov={45}
            rotation={[-0.25, 0, 0]}
          />

          {/* Lighting - Focused on Mac */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[3, 3, 3]}
            intensity={0.6}
            castShadow
            shadow-mapSize-width={512}
            shadow-mapSize-height={512}
          />
          <pointLight position={[-1.5, 0.5, 0.5]} intensity={0.4} color="#6a5acd" />
          <spotLight 
            position={[0, 1, 0.5]} 
            angle={0.5} 
            penumbra={0.5} 
            intensity={0.3}
            target-position={[0, -0.15, 0]}
          />

          {/* Scene */}
          <Room />
          <Desk />

          {/* Desk Items - Proportional to Mac */}
          <AppleMacintosh position={[0, 0, 0]} scale={0.01} rotation={[0, 0, 0]} />
          <CoffeeCup position={[-0.35, -0.19, 0.15]} />
          <DeskLamp position={[-0.5, -0.2, -0.15]} />
          <GameController position={[0.35, -0.195, 0.05]} />
          <Plant position={[0.55, -0.18, -0.25]} />

          {/* PARTICLE EFFECTS - Scaled to scene */}
          <FloatingDust count={100} size={0.01} spread={3} />
          <ScreenParticles position={[0, -0.05, 0.05]} count={25} color="#3b82f6" />
          <MagicSparkles position={[0.35, -0.15, 0.05]} count={15} />

          {/* Environment */}
          <Environment preset="night" />

          {/* POST-PROCESSING EFFECTS */}
          <RetroEffects />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
        <p className="font-mono text-sm text-white/70">
          🖱️ Click items to interact • Enhanced with shaders & particles
        </p>
      </div>
    </div>
  );
}

