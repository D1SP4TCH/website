'use client';

import React, { useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ProceduralPlant } from './procedural-plant';
import type { GardenProject } from '@/lib/data/garden-portfolio';

interface DraggablePlantProps {
  project: GardenProject;
  isSelected: boolean;
  isHovered: boolean;
  isEditMode: boolean;
  controlsRef: React.MutableRefObject<any>;
  onClick: () => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
  onMove: (position: [number, number, number]) => void;
}

export const DraggablePlant = ({
  project,
  isSelected,
  isHovered,
  isEditMode,
  controlsRef,
  onClick,
  onPointerOver,
  onPointerOut,
  onMove,
}: DraggablePlantProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, gl, size } = useThree();
  
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({
    isDragging: false,
    plane: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    offset: new THREE.Vector3(),
    intersection: new THREE.Vector3(),
  });
  
  const handlePointerDown = (e: any) => {
    if (!isEditMode || !isSelected) return;
    
    e.stopPropagation();
    
    // Disable orbit controls
    if (controlsRef.current) {
      controlsRef.current.enabled = false;
    }
    
    // Calculate intersection with ground plane
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(
      (e.clientX / size.width) * 2 - 1,
      -(e.clientY / size.height) * 2 + 1
    );
    raycaster.setFromCamera(mouse, camera);
    
    if (raycaster.ray.intersectPlane(dragState.current.plane, dragState.current.intersection)) {
      if (groupRef.current) {
        dragState.current.offset.copy(dragState.current.intersection).sub(groupRef.current.position);
      }
    }
    
    dragState.current.isDragging = true;
    setIsDragging(true);
    gl.domElement.style.cursor = 'grabbing';
  };
  
  const handlePointerMove = (e: any) => {
    if (!dragState.current.isDragging) return;
    
    e.stopPropagation();
    
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(
      (e.clientX / size.width) * 2 - 1,
      -(e.clientY / size.height) * 2 + 1
    );
    raycaster.setFromCamera(mouse, camera);
    
    if (raycaster.ray.intersectPlane(dragState.current.plane, dragState.current.intersection)) {
      if (groupRef.current) {
        const newPos = dragState.current.intersection.sub(dragState.current.offset);
        groupRef.current.position.x = newPos.x;
        groupRef.current.position.z = newPos.z;
        groupRef.current.position.y = 0;
      }
    }
  };
  
  const handlePointerUp = (e: any) => {
    if (!dragState.current.isDragging) return;
    
    e.stopPropagation();
    dragState.current.isDragging = false;
    setIsDragging(false);
    
    // Re-enable orbit controls
    if (controlsRef.current) {
      controlsRef.current.enabled = true;
    }
    
    gl.domElement.style.cursor = 'pointer';
    
    // Save new position
    if (groupRef.current) {
      const newPos: [number, number, number] = [
        Math.round(groupRef.current.position.x * 10) / 10,
        0,
        Math.round(groupRef.current.position.z * 10) / 10,
      ];
      onMove(newPos);
    }
  };
  
  // Visual feedback for draggable state
  const showDragIndicator = isEditMode && isSelected && !isDragging;
  
  // Attach window-level listeners for drag
  React.useEffect(() => {
    if (isSelected && isEditMode) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isSelected, isEditMode, handlePointerMove, handlePointerUp]);
  
  return (
    <group
      ref={groupRef}
      position={project.position}
      onPointerDown={handlePointerDown}
    >
      {/* The actual plant */}
      <ProceduralPlant
        project={{ ...project, position: [0, 0, 0] }}
        isSelected={isSelected}
        isHovered={isHovered || isDragging}
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      />
      
      {/* Drag indicator ring */}
      {showDragIndicator && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.6, 0.7, 32]} />
          <meshBasicMaterial 
            color="#9DB5A0" 
            transparent 
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Dragging indicator */}
      {isDragging && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.5, 0.8, 32]} />
          <meshBasicMaterial 
            color="#FFD700" 
            transparent 
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
};

