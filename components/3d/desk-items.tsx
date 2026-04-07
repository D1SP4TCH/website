"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { useRouter } from "next/navigation";

// Monitor Component
export function Monitor({ position }: { position: [number, number, number] }) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [booted, setBooted] = useState(false);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current && hovered) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Monitor Stand */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 0.1, 6]} />
        <meshStandardMaterial color="#2a2a2a" flatShading />
      </mesh>

      {/* Monitor Base */}
      <mesh position={[0, -0.2, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.3, 0.02, 0.15]} />
        <meshStandardMaterial color="#1a1a1a" flatShading />
      </mesh>

      {/* Monitor Frame */}
      <mesh
        position={[0, 0.15, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => {
          if (!booted) {
            setBooted(true);
            setTimeout(() => router.push("/projects"), 2000);
          }
        }}
      >
        <boxGeometry args={[0.6, 0.4, 0.05]} />
        <meshStandardMaterial color="#1a1a1a" flatShading />
      </mesh>

      {/* Screen */}
      <mesh position={[0, 0.15, 0.026]}>
        <planeGeometry args={[0.52, 0.32]} />
        <meshStandardMaterial
          color={booted ? "#3b82f6" : hovered ? "#1a1a2e" : "#0a0a0a"}
          emissive={booted ? "#3b82f6" : hovered ? "#1a1a2e" : "#000000"}
          emissiveIntensity={booted ? 0.5 : hovered ? 0.2 : 0}
        />
      </mesh>

      {/* Screen Text */}
      {booted && (
        <Text
          position={[0, 0.15, 0.03]}
          fontSize={0.04}
          color="#00ff00"
          anchorX="center"
          anchorY="middle"
        >
          LOADING...
        </Text>
      )}

      {!booted && hovered && (
        <Text
          position={[0, 0.15, 0.03]}
          fontSize={0.03}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          CLICK ME
        </Text>
      )}
    </group>
  );
}

// Keyboard Component
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
        <boxGeometry args={[0.4, 0.02, 0.15]} />
        <meshStandardMaterial
          color={hovered ? "#3a3a3a" : "#2a2a2a"}
          flatShading
        />
      </mesh>

      {/* Keys */}
      {[...Array(40)].map((_, i) => {
        const row = Math.floor(i / 10);
        const col = i % 10;
        return (
          <mesh
            key={i}
            position={[
              -0.18 + col * 0.04,
              0.015,
              -0.06 + row * 0.035,
            ]}
          >
            <boxGeometry args={[0.03, 0.01, 0.03]} />
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

// Coffee Cup Component
export function CoffeeCup({ position }: { position: [number, number, number] }) {
  const [level, setLevel] = useState(1);
  const [hovered, setHovered] = useState(false);
  const steamRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (steamRef.current && level > 0) {
      steamRef.current.position.y = 0.15 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
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
        <cylinderGeometry args={[0.04, 0.03, 0.08, 8]} />
        <meshStandardMaterial
          color={hovered ? "#8b4513" : "#654321"}
          flatShading
        />
      </mesh>

      {/* Coffee */}
      {level > 0 && (
        <mesh position={[0, 0.02 - (1 - level) * 0.03, 0]}>
          <cylinderGeometry args={[0.038, 0.035, 0.02, 8]} />
          <meshStandardMaterial color="#3e2723" flatShading />
        </mesh>
      )}

      {/* Handle */}
      <mesh position={[0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.02, 0.005, 6, 8]} />
        <meshStandardMaterial color="#654321" flatShading />
      </mesh>

      {/* Steam particles */}
      {level > 0 && (
        <group ref={steamRef}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0, 0.15 + i * 0.02, 0]}>
              <sphereGeometry args={[0.01, 4, 4]} />
              <meshStandardMaterial
                color="#ffffff"
                transparent
                opacity={0.3 - i * 0.1}
                flatShading
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

// Desk Lamp Component
export function DeskLamp({ position }: { position: [number, number, number] }) {
  const [isOn, setIsOn] = useState(false);
  const [hovered, setHovered] = useState(false);
  const lightRef = useRef<THREE.SpotLight>(null);

  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.02, 8]} />
        <meshStandardMaterial color="#2a2a2a" flatShading />
      </mesh>

      {/* Pole */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.3, 6]} />
        <meshStandardMaterial color="#3a3a3a" flatShading />
      </mesh>

      {/* Lamp Head */}
      <mesh
        position={[0, 0.3, 0.05]}
        rotation={[Math.PI / 4, 0, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => setIsOn(!isOn)}
      >
        <coneGeometry args={[0.08, 0.1, 8]} />
        <meshStandardMaterial
          color={hovered ? "#4a4a4a" : "#3a3a3a"}
          flatShading
        />
      </mesh>

      {/* Light bulb */}
      <mesh position={[0, 0.28, 0.08]}>
        <sphereGeometry args={[0.02, 6, 6]} />
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
          position={[0, 0.3, 0.1]}
          angle={0.6}
          penumbra={0.5}
          intensity={2}
          color="#fff4e6"
          target-position={[0, -0.5, 0]}
        />
      )}
    </group>
  );
}

// Game Controller Component
export function GameController({ position }: { position: [number, number, number] }) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current && hovered) {
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.1;
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
        <boxGeometry args={[0.12, 0.02, 0.08]} />
        <meshStandardMaterial
          color={hovered ? "#6a5acd" : "#5a4acb"}
          flatShading
        />
      </mesh>

      {/* Grips */}
      <mesh position={[-0.05, -0.02, 0]}>
        <boxGeometry args={[0.03, 0.04, 0.06]} />
        <meshStandardMaterial color="#4a3acb" flatShading />
      </mesh>
      <mesh position={[0.05, -0.02, 0]}>
        <boxGeometry args={[0.03, 0.04, 0.06]} />
        <meshStandardMaterial color="#4a3acb" flatShading />
      </mesh>

      {/* Buttons */}
      {[
        [-0.02, 0.015, -0.02],
        [0.02, 0.015, -0.02],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.008, 0.008, 0.01, 6]} />
          <meshStandardMaterial color="#ff4444" flatShading />
        </mesh>
      ))}
    </group>
  );
}

// Mouse Component
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
        <boxGeometry args={[0.05, 0.03, 0.08]} />
        <meshStandardMaterial
          color={hovered ? "#3a3a3a" : "#2a2a2a"}
          flatShading
        />
      </mesh>

      {/* Scroll Wheel */}
      <mesh position={[0, 0.016, -0.01]}>
        <cylinderGeometry args={[0.008, 0.008, 0.03, 6]} />
        <meshStandardMaterial color="#4a4a4a" flatShading />
      </mesh>
    </group>
  );
}

// Plant Component
export function Plant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Pot */}
      <mesh>
        <cylinderGeometry args={[0.04, 0.03, 0.06, 6]} />
        <meshStandardMaterial color="#8b4513" flatShading />
      </mesh>

      {/* Leaves */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[
            Math.cos(i * Math.PI / 2) * 0.03,
            0.05 + i * 0.01,
            Math.sin(i * Math.PI / 2) * 0.03,
          ]}
          rotation={[0, i * Math.PI / 2, Math.PI / 4]}
        >
          <boxGeometry args={[0.04, 0.01, 0.02]} />
          <meshStandardMaterial color="#2d5016" flatShading />
        </mesh>
      ))}
    </group>
  );
}





