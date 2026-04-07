"use client";

/**
 * Scaled desk items to match Apple Macintosh model at scale 0.2
 * These are smaller, more proportional versions
 */

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRouter } from "next/navigation";

// Scaled Keyboard (smaller)
export function Keyboard({ position }: { position: [number, number, number] }) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      {/* Keyboard Base */}
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => router.push("/about")}
      >
        <boxGeometry args={[0.25, 0.015, 0.1]} />
        <meshStandardMaterial
          color={hovered ? "#3a3a3a" : "#2a2a2a"}
          flatShading
        />
      </mesh>

      {/* Keys - reduced count and size */}
      {[...Array(30)].map((_, i) => {
        const row = Math.floor(i / 10);
        const col = i % 10;
        return (
          <mesh
            key={i}
            position={[
              -0.11 + col * 0.025,
              0.01,
              -0.04 + row * 0.028,
            ]}
          >
            <boxGeometry args={[0.02, 0.008, 0.02]} />
            <meshStandardMaterial
              color={hovered ? "#4a4a4a" : "#3a3a3a"}
              flatShading
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Scaled Coffee Cup
export function CoffeeCup({ position }: { position: [number, number, number] }) {
  const [level, setLevel] = useState(1);
  const [hovered, setHovered] = useState(false);
  const steamRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (steamRef.current && level > 0) {
      steamRef.current.position.y = 0.12 + Math.sin(state.clock.elapsedTime * 2) * 0.015;
    }
  });

  return (
    <group position={position}>
      {/* Cup */}
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => setLevel(Math.max(0, level - 0.33))}
      >
        <cylinderGeometry args={[0.03, 0.025, 0.06, 8]} />
        <meshStandardMaterial
          color={hovered ? "#8b4513" : "#654321"}
          flatShading
        />
      </mesh>

      {/* Coffee */}
      {level > 0 && (
        <mesh position={[0, 0.015 - (1 - level) * 0.025, 0]}>
          <cylinderGeometry args={[0.028, 0.024, 0.015, 8]} />
          <meshStandardMaterial color="#3e2723" flatShading />
        </mesh>
      )}

      {/* Handle */}
      <mesh position={[0.038, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.015, 0.004, 6, 8]} />
        <meshStandardMaterial color="#654321" flatShading />
      </mesh>

      {/* Steam particles */}
      {level > 0 && (
        <group ref={steamRef}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0, 0.12 + i * 0.015, 0]}>
              <sphereGeometry args={[0.008, 4, 4]} />
              <meshStandardMaterial
                color="#ffffff"
                transparent
                opacity={0.25 - i * 0.08}
                flatShading
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

// Scaled Desk Lamp
export function DeskLamp({ position }: { position: [number, number, number] }) {
  const [isOn, setIsOn] = useState(false);
  const [hovered, setHovered] = useState(false);
  const lightRef = useRef<THREE.SpotLight>(null);

  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.06, 0.015, 8]} />
        <meshStandardMaterial color="#2a2a2a" flatShading />
      </mesh>

      {/* Pole */}
      <mesh position={[0, 0.11, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.22, 6]} />
        <meshStandardMaterial color="#3a3a3a" flatShading />
      </mesh>

      {/* Lamp Head */}
      <mesh
        position={[0, 0.22, 0.04]}
        rotation={[Math.PI / 4, 0, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => setIsOn(!isOn)}
      >
        <coneGeometry args={[0.06, 0.08, 8]} />
        <meshStandardMaterial
          color={hovered ? "#4a4a4a" : "#3a3a3a"}
          flatShading
        />
      </mesh>

      {/* Light bulb */}
      <mesh position={[0, 0.21, 0.06]}>
        <sphereGeometry args={[0.015, 6, 6]} />
        <meshStandardMaterial
          color={isOn ? "#ffeb3b" : "#333333"}
          emissive={isOn ? "#ffeb3b" : "#000000"}
          emissiveIntensity={isOn ? 1 : 0}
          flatShading
        />
      </mesh>

      {/* Spot light */}
      {isOn && (
        <spotLight
          ref={lightRef}
          position={[0, 0.22, 0.08]}
          angle={0.6}
          penumbra={0.5}
          intensity={1.5}
          color="#fff4e6"
          target-position={[0, -0.4, 0]}
        />
      )}
    </group>
  );
}

// Scaled Game Controller
export function GameController({ position }: { position: [number, number, number] }) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current && hovered) {
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.08;
    }
  });

  return (
    <group
      ref={ref}
      position={position}
      rotation={[0, Math.PI / 4, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => router.push("/projects")}
    >
      {/* Controller Body */}
      <mesh>
        <boxGeometry args={[0.09, 0.015, 0.06]} />
        <meshStandardMaterial
          color={hovered ? "#6a5acd" : "#5a4acb"}
          flatShading
        />
      </mesh>

      {/* Grips */}
      <mesh position={[-0.038, -0.015, 0]}>
        <boxGeometry args={[0.022, 0.03, 0.045]} />
        <meshStandardMaterial color="#4a3acb" flatShading />
      </mesh>
      <mesh position={[0.038, -0.015, 0]}>
        <boxGeometry args={[0.022, 0.03, 0.045]} />
        <meshStandardMaterial color="#4a3acb" flatShading />
      </mesh>

      {/* Buttons */}
      {[
        [-0.015, 0.01, -0.015],
        [0.015, 0.01, -0.015],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.006, 0.006, 0.008, 6]} />
          <meshStandardMaterial color="#ff4444" flatShading />
        </mesh>
      ))}
    </group>
  );
}

// Scaled Mouse
export function Mouse({ position }: { position: [number, number, number] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Mouse Body */}
      <mesh>
        <boxGeometry args={[0.035, 0.022, 0.06]} />
        <meshStandardMaterial
          color={hovered ? "#3a3a3a" : "#2a2a2a"}
          flatShading
        />
      </mesh>

      {/* Scroll Wheel */}
      <mesh position={[0, 0.012, -0.008]}>
        <cylinderGeometry args={[0.006, 0.006, 0.022, 6]} />
        <meshStandardMaterial color="#4a4a4a" flatShading />
      </mesh>
    </group>
  );
}

// Scaled Plant
export function Plant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Pot */}
      <mesh>
        <cylinderGeometry args={[0.03, 0.025, 0.045, 6]} />
        <meshStandardMaterial color="#8b4513" flatShading />
      </mesh>

      {/* Leaves */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[
            Math.cos(i * Math.PI / 2) * 0.022,
            0.038 + i * 0.008,
            Math.sin(i * Math.PI / 2) * 0.022,
          ]}
          rotation={[0, i * Math.PI / 2, Math.PI / 4]}
        >
          <boxGeometry args={[0.03, 0.008, 0.015]} />
          <meshStandardMaterial color="#2d5016" flatShading />
        </mesh>
      ))}
    </group>
  );
}





