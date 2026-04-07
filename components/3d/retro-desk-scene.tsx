"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei";
import { Monitor, Keyboard, CoffeeCup, DeskLamp, GameController, Mouse, Plant } from "./desk-items";
import { Suspense } from "react";
import * as THREE from "three";

function Desk() {
  return (
    <group>
      {/* Desk Surface */}
      <mesh position={[0, -0.22, 0]} receiveShadow>
        <boxGeometry args={[2, 0.04, 1]} />
        <meshStandardMaterial color="#4a3728" flatShading />
      </mesh>

      {/* Desk Edge Detail */}
      <mesh position={[0, -0.24, 0.5]}>
        <boxGeometry args={[2, 0.01, 0.02]} />
        <meshStandardMaterial color="#3a2718" flatShading />
      </mesh>

      {/* Desk Legs */}
      {[
        [-0.9, -0.5, -0.4],
        [0.9, -0.5, -0.4],
        [-0.9, -0.5, 0.4],
        [0.9, -0.5, 0.4],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.06, 0.6, 0.06]} />
          <meshStandardMaterial color="#3a2718" flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Room() {
  return (
    <group>
      {/* Floor */}
      <mesh position={[0, -0.8, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#1a1a2e" flatShading />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 1, -2]} receiveShadow>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#16213e" flatShading />
      </mesh>

      {/* Window glow effect */}
      <mesh position={[2, 0.5, -1.9]}>
        <planeGeometry args={[1.5, 2]} />
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

export function RetroDeskScene() {
  return (
    <div className="h-screen w-full">
      <Canvas
        shadows
        gl={{
          antialias: false, // Retro pixelated look
          toneMapping: THREE.NoToneMapping,
        }}
        dpr={[1, 1.5]} // Lower DPR for retro effect
      >
        <Suspense fallback={<LoadingScreen />}>
          {/* Camera Setup - First Person View */}
          <PerspectiveCamera
            makeDefault
            position={[0, 0.3, 0.8]}
            fov={60}
            rotation={[-0.3, 0, 0]}
          />

          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={0.5}
            castShadow
            shadow-mapSize-width={512}
            shadow-mapSize-height={512}
          />
          <pointLight position={[-2, 1, 1]} intensity={0.3} color="#6a5acd" />

          {/* Scene */}
          <Room />
          <Desk />

          {/* Desk Items - Positioned like a real desk */}
          <Monitor position={[0, -0.05, -0.2]} />
          <Keyboard position={[0, -0.18, 0.15]} />
          <Mouse position={[0.25, -0.19, 0.15]} />
          <CoffeeCup position={[-0.4, -0.18, 0.2]} />
          <DeskLamp position={[-0.6, -0.2, -0.2]} />
          <GameController position={[0.45, -0.19, -0.1]} />
          <Plant position={[0.7, -0.17, -0.3]} />

          {/* Subtle environment lighting */}
          <Environment preset="night" />

          {/* Optional: Enable for debugging/exploration */}
          {/* <OrbitControls 
            enableZoom={true}
            enablePan={true}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
          /> */}
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
        <p className="font-mono text-sm text-white/70">
          🖱️ Click on items to interact • Hover to explore
        </p>
      </div>
    </div>
  );
}





