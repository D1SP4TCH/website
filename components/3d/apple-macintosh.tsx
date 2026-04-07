"use client";

import { useGLTF } from "@react-three/drei";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import * as THREE from "three";

export function AppleMacintosh({ 
  position = [0, 0, 0],
  scale = 0.1,
  rotation = [0, 0, 0],
}: { 
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
}) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  // Load the Apple Macintosh model
  const { scene } = useGLTF("/models/apple_macintosh.glb");
  
  // Clone so we can use it multiple times if needed
  const clonedScene = scene.clone();
  
  useEffect(() => {
    // Highlight/glow the entire Mac when hovered or clicked
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Enable raycasting for clicks
        child.raycast = THREE.Mesh.prototype.raycast;
        
        // Store original material if not stored
        if (!child.userData.originalMaterial) {
          child.userData.originalMaterial = child.material.clone();
        }
        
        // Apply highlight when hovered or clicked
        if (hovered || clicked) {
          const originalMat = child.userData.originalMaterial;
          child.material = new THREE.MeshStandardMaterial({
            color: originalMat.color,
            emissive: new THREE.Color(clicked ? "#3b82f6" : "#06b6d4"),
            emissiveIntensity: clicked ? 0.6 : 0.3,
            metalness: originalMat.metalness || 0,
            roughness: originalMat.roughness || 0.5,
          });
        } else {
          // Restore original material
          child.material = child.userData.originalMaterial;
        }
      }
    });
  }, [clonedScene, hovered, clicked]);
  
  const handleClick = (e: any) => {
    e.stopPropagation();
    setClicked(!clicked); // Toggle highlight
  };

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerOver={(e) => {
        // ONLY set hovered if we're actually hitting the Mac model
        if (e.object && e.object.parent) {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
      onPointerMove={(e) => {
        // Prevent hover from bubbling
        e.stopPropagation();
      }}
      onClick={handleClick}
    >
      <primitive object={clonedScene} />
    </group>
  );
}

// Preload for better performance
useGLTF.preload("/models/apple_macintosh.glb");

