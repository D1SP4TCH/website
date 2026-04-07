'use client';

import React, { useState, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { ProceduralPlant } from './procedural-plant';
import { DraggablePlant } from './draggable-plant';
import { GardenGround, GardenDecorations } from './garden-ground';
import { PAINTERLY_PALETTES } from '@/lib/shaders/painterly-shaders';
import { ProjectDetailCard } from '../ui/project-detail-card';
import { GardenEditorPanel, EditModeBadge } from '../ui/garden-editor-panel';
import { 
  GardenEditorProvider, 
  useGardenEditor,
  useGardenEditorOptional,
} from '@/lib/context/garden-editor-context';
import type { GardenProject } from '@/lib/data/garden-portfolio';

// Background color from palette
const BG_COLOR = PAINTERLY_PALETTES.spring.ground.color3;

/**
 * Main Garden Scene Component
 * Painterly isometric garden with NPR shaders
 */
export const GardenScene = () => {
  return (
    <GardenEditorProvider>
      <GardenSceneInner />
    </GardenEditorProvider>
  );
};

const GardenSceneInner = () => {
  const { 
    projects, 
    isEditMode, 
    selectedProjectId, 
    selectProject,
    moveProject,
  } = useGardenEditor();
  
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [viewingProject, setViewingProject] = useState<GardenProject | null>(null);
  
  const handleProjectClick = useCallback((project: GardenProject) => {
    if (isEditMode) {
      // In edit mode, select for editing
      selectProject(selectedProjectId === project.id ? null : project.id);
    } else {
      // In view mode, show detail card
      setViewingProject(prev => prev?.id === project.id ? null : project);
    }
  }, [isEditMode, selectedProjectId, selectProject]);
  
  const handleClose = useCallback(() => {
    setViewingProject(null);
  }, []);

  const handleMove = useCallback((id: string, position: [number, number, number]) => {
    moveProject(id, position);
  }, [moveProject]);
  
  return (
    <div className="relative w-full h-full">
      {/* 3D Canvas */}
      <Canvas
        shadows={false}
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: 'high-performance',
        }}
        style={{ background: BG_COLOR }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={[BG_COLOR]} />
        
        <Suspense fallback={null}>
          <GardenSceneContent
            projects={projects}
            selectedId={isEditMode ? selectedProjectId : viewingProject?.id || null}
            hoveredId={hoveredProject}
            isEditMode={isEditMode}
            onProjectClick={handleProjectClick}
            onProjectHover={setHoveredProject}
            onProjectMove={handleMove}
          />
        </Suspense>
      </Canvas>
      
      {/* Project Detail Card (view mode only) */}
      {!isEditMode && (
        <ProjectDetailCard
          project={viewingProject}
          onClose={handleClose}
        />
      )}
      
      {/* Editor UI */}
      <EditModeBadge />
      <GardenEditorPanel />
      
      {/* Instructions */}
      {!viewingProject && !isEditMode && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none">
          <p 
            className="text-sm px-6 py-3 rounded-full backdrop-blur-md shadow-lg font-medium"
            style={{ 
              color: '#5C5245',
              background: 'rgba(255, 255, 255, 0.9)',
            }}
          >
            Click on plants to explore my work
          </p>
        </div>
      )}
      
      {/* Edit mode instructions */}
      {isEditMode && !selectedProjectId && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none">
          <p 
            className="text-sm px-6 py-3 rounded-full backdrop-blur-md shadow-lg font-medium"
            style={{ 
              color: '#5C5245',
              background: 'rgba(157, 181, 160, 0.9)',
            }}
          >
            Click a plant to select • Use panel to add/edit • ESC to exit
          </p>
        </div>
      )}
      
      {isEditMode && selectedProjectId && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none">
          <p 
            className="text-sm px-6 py-3 rounded-full backdrop-blur-md shadow-lg font-medium"
            style={{ 
              color: '#5C5245',
              background: 'rgba(255, 215, 0, 0.9)',
            }}
          >
            Drag to move plant • Edit in panel → • ESC to deselect
          </p>
        </div>
      )}
      
      {/* Title */}
      <div className="absolute top-8 left-8 pointer-events-none" style={{ marginLeft: isEditMode ? '120px' : 0 }}>
        <h1 
          className="text-4xl font-light tracking-wide"
          style={{ color: '#4A4035' }}
        >
          Creative Garden
        </h1>
        <p 
          className="text-sm mt-2 tracking-wider uppercase font-medium"
          style={{ color: '#8B8075' }}
        >
          Jason Chiu • Portfolio
        </p>
      </div>
      
      {/* Plant count */}
      <div 
        className="absolute bottom-8 right-8 text-sm font-medium pointer-events-none"
        style={{ color: '#8B8075', marginRight: isEditMode ? '340px' : 0 }}
      >
        {projects.length} plants growing
      </div>
    </div>
  );
};

/**
 * Scene content (inside Canvas)
 */
interface SceneContentProps {
  projects: GardenProject[];
  selectedId: string | null;
  hoveredId: string | null;
  isEditMode: boolean;
  onProjectClick: (project: GardenProject) => void;
  onProjectHover: (id: string | null) => void;
  onProjectMove: (id: string, position: [number, number, number]) => void;
}

const GardenSceneContent = ({
  projects,
  selectedId,
  hoveredId,
  isEditMode,
  onProjectClick,
  onProjectHover,
  onProjectMove,
}: SceneContentProps) => {
  const controlsRef = React.useRef<any>(null);
  
  return (
    <>
      {/* Isometric Camera */}
      <PerspectiveCamera
        makeDefault
        position={[15, 13, 15]}
        fov={30}
        near={0.1}
        far={100}
      />
      
      <OrbitControls
        ref={controlsRef}
        makeDefault
        target={[0, 0.8, 0]}
        enablePan={isEditMode}
        minDistance={12}
        maxDistance={30}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        rotateSpeed={0.35}
        zoomSpeed={0.5}
        enableDamping
        dampingFactor={0.05}
      />
      
      {/* Simple lighting for wireframe - no shadows */}
      <ambientLight intensity={0.8} />
      
      {/* Ground */}
      <GardenGround />
      <GardenDecorations />
      
      {/* Plants */}
      {projects.map(project => (
        isEditMode ? (
          <DraggablePlant
            key={project.id}
            project={project}
            isSelected={selectedId === project.id}
            isHovered={hoveredId === project.id}
            isEditMode={isEditMode}
            controlsRef={controlsRef}
            onClick={() => onProjectClick(project)}
            onPointerOver={() => onProjectHover(project.id)}
            onPointerOut={() => onProjectHover(null)}
            onMove={(pos) => onProjectMove(project.id, pos)}
          />
        ) : (
          <ProceduralPlant
            key={project.id}
            project={project}
            isSelected={selectedId === project.id}
            isHovered={hoveredId === project.id}
            onClick={() => onProjectClick(project)}
            onPointerOver={() => onProjectHover(project.id)}
            onPointerOut={() => onProjectHover(null)}
          />
        )
      ))}
      
      {/* Atmospheric fog */}
      <fog attach="fog" args={[BG_COLOR, 20, 45]} />
    </>
  );
};
