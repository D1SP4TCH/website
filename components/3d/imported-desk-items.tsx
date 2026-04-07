"use client";

/**
 * Example components for importing 3D models
 * 
 * SETUP:
 * 1. Download models from poly.pizza or sketchfab
 * 2. Put .glb files in public/models/
 * 3. Replace the path in useGLTF
 * 4. Adjust scale/position as needed
 */

import { useGLTF } from "@react-three/drei";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import * as THREE from "three";

/**
 * Example: Imported Monitor Model
 * 
 * USAGE:
 * <ImportedMonitor position={[0, 0, 0]} />
 * 
 * HOW TO USE YOUR OWN MODEL:
 * 1. Put monitor.glb in public/models/
 * 2. This will auto-load it
 * 3. Adjust scale prop to resize
 */
export function ImportedMonitor({ 
  position = [0, 0, 0],
  scale = 0.1,
}: { 
  position?: [number, number, number];
  scale?: number;
}) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  // Load the model - CHANGE THIS PATH to your model
  const { scene } = useGLTF("/models/monitor.glb");
  
  // Clone the scene so we can use it multiple times
  const clonedScene = scene.clone();
  
  useEffect(() => {
    // Make all parts clickable and add shadows
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Optional: Make screen glow when clicked
        if (clicked && child.name.toLowerCase().includes("screen")) {
          child.material = new THREE.MeshStandardMaterial({
            color: "#3b82f6",
            emissive: "#3b82f6",
            emissiveIntensity: 0.8,
          });
        }
      }
    });
  }, [clonedScene, clicked]);
  
  return (
    <primitive
      object={clonedScene}
      position={position}
      scale={hovered ? scale * 1.05 : scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => {
        setClicked(true);
        setTimeout(() => router.push("/projects"), 1000);
      }}
    />
  );
}

// Preload the model for better performance
// Uncomment when you have the actual model file
// useGLTF.preload("/models/monitor.glb");


/**
 * Example: Imported Keyboard Model
 */
export function ImportedKeyboard({ 
  position = [0, 0, 0],
  scale = 0.1,
}: { 
  position?: [number, number, number];
  scale?: number;
}) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  
  // CHANGE THIS PATH to your keyboard model
  const { scene } = useGLTF("/models/keyboard.glb");
  const clonedScene = scene.clone();
  
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Change color on hover
        if (hovered) {
          child.material = child.material.clone();
          child.material.color = new THREE.Color("#4a4a4a");
        }
      }
    });
  }, [clonedScene, hovered]);
  
  return (
    <primitive
      object={clonedScene}
      position={position}
      scale={scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => router.push("/about")}
    />
  );
}

// useGLTF.preload("/models/keyboard.glb");


/**
 * Example: Coffee Cup with Animation
 */
export function ImportedCoffeeCup({ 
  position = [0, 0, 0],
  scale = 0.1,
}: { 
  position?: [number, number, number];
  scale?: number;
}) {
  const [level, setLevel] = useState(1);
  
  const { scene } = useGLTF("/models/coffee-cup.glb");
  const clonedScene = scene.clone();
  
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // If the mesh is the coffee liquid, scale it down as it's drunk
        if (child.name.toLowerCase().includes("liquid")) {
          child.scale.y = level;
        }
      }
    });
  }, [clonedScene, level]);
  
  return (
    <primitive
      object={clonedScene}
      position={position}
      scale={scale}
      onClick={() => setLevel(Math.max(0, level - 0.33))}
    />
  );
}

// useGLTF.preload("/models/coffee-cup.glb");


/**
 * Generic Model Loader
 * Use this for any model!
 * 
 * USAGE:
 * <GenericModel 
 *   path="/models/your-model.glb"
 *   position={[0, 0, 0]}
 *   scale={0.1}
 *   onClick={() => console.log("clicked!")}
 * />
 */
export function GenericModel({ 
  path,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 0.1,
  onClick,
  castShadow = true,
  receiveShadow = true,
}: { 
  path: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  onClick?: () => void;
  castShadow?: boolean;
  receiveShadow?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const { scene } = useGLTF(path);
  const clonedScene = scene.clone();
  
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = castShadow;
        child.receiveShadow = receiveShadow;
      }
    });
  }, [clonedScene, castShadow, receiveShadow]);
  
  return (
    <primitive
      object={clonedScene}
      position={position}
      rotation={rotation}
      scale={hovered ? (typeof scale === "number" ? scale * 1.02 : scale) : scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "auto" }}
    />
  );
}


/**
 * HOW TO USE IN YOUR SCENE:
 * 
 * In retro-desk-scene.tsx, replace:
 * 
 * OLD:
 * <Monitor position={[0, -0.05, -0.2]} />
 * 
 * NEW:
 * <ImportedMonitor position={[0, -0.05, -0.2]} scale={0.1} />
 * 
 * OR use generic loader:
 * <GenericModel 
 *   path="/models/monitor.glb"
 *   position={[0, -0.05, -0.2]}
 *   scale={0.1}
 *   onClick={() => router.push("/projects")}
 * />
 */


/**
 * FINDING FREE MODELS:
 * 
 * Best sources:
 * 1. https://poly.pizza - Free low-poly models (CC0)
 * 2. https://quaternius.com - Free game assets
 * 3. https://sketchfab.com - Filter by "downloadable" + free
 * 4. https://kenney.nl/assets - Public domain game assets
 * 
 * Search terms to try:
 * - "low poly monitor"
 * - "retro computer"
 * - "pixel art keyboard"
 * - "stylized desk items"
 * - "voxel coffee cup"
 */


/**
 * MODEL OPTIMIZATION:
 * 
 * Before using, optimize your models:
 * 1. Go to https://gltf.report
 * 2. Upload your .glb file
 * 3. Click "Optimize" button
 * 4. Download optimized version
 * 
 * Target specs:
 * - File size: <500KB (2MB max)
 * - Triangles: <5,000 per object
 * - Textures: 512x512 or 1024x1024
 */





