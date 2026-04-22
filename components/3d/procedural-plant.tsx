'use client';

import { useMemo, useRef } from 'react';
import type { JSX } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { SeededRandom } from '@/lib/utils/seeded-random';
import { projectToGenes } from '@/lib/utils/plant-generator';
import type { GardenProject, PlantGenes } from '@/lib/data/garden-portfolio';
import {
  PAINTERLY_PLANT_VERTEX,
  PAINTERLY_PLANT_FRAGMENT,
  PAINTERLY_LEAF_VERTEX,
  PAINTERLY_LEAF_FRAGMENT,
  PAINTERLY_PALETTES,
} from '@/lib/shaders/painterly-shaders';
import { 
  ProceduralFlower,
  type GardenBloomSpecies,
} from './procedural-flora';
import { ProceduralNiwaki, makeNiwakiGenes } from './procedural-niwaki';
import { ProceduralBamboo, makeBambooGenes } from './procedural-bamboo';

// ============================================
// FLORA TYPE SELECTION
// ============================================

type FloraType = 'tree' | 'flower' | 'niwaki' | 'bamboo';

const getFloraType = (project: GardenProject): FloraType => {
  if (project.plantType) return project.plantType;
  switch (project.type) {
    case 'game':
      return 'bamboo';
    case 'web':
      return project.monthsDuration > 3 ? 'tree' : 'flower';
    case 'design':
      return 'flower';
    case 'experiment':
      return 'flower';
    default:
      return 'flower';
  }
};

// ============================================
// PAINTERLY MATERIALS
// ============================================

const PainterlyPlantMaterial = shaderMaterial(
  {
    uColor: new THREE.Color(PAINTERLY_PALETTES.spring.plant.base),
    uShadowColor: new THREE.Color(PAINTERLY_PALETTES.spring.plant.shadow),
    uHighlightColor: new THREE.Color(PAINTERLY_PALETTES.spring.plant.highlight),
    uLightPosition: new THREE.Vector3(12, 18, 8),
    uTime: 0,
    uWindStrength: 0.03,
    uSelected: 0,
  },
  PAINTERLY_PLANT_VERTEX,
  PAINTERLY_PLANT_FRAGMENT
);

const PainterlyLeafMaterial = shaderMaterial(
  {
    uColor: new THREE.Color(PAINTERLY_PALETTES.spring.leaf.base),
    uShadowColor: new THREE.Color(PAINTERLY_PALETTES.spring.leaf.shadow),
    uTime: 0,
    uWindStrength: 0.06,
  },
  PAINTERLY_LEAF_VERTEX,
  PAINTERLY_LEAF_FRAGMENT
);

extend({ PainterlyPlantMaterial, PainterlyLeafMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    painterlyPlantMaterial: JSX.IntrinsicElements['shaderMaterial'] & {
      uColor?: THREE.Color;
      uShadowColor?: THREE.Color;
      uHighlightColor?: THREE.Color;
      uLightPosition?: THREE.Vector3;
      uTime?: number;
      uWindStrength?: number;
      uSelected?: number;
    };
    painterlyLeafMaterial: JSX.IntrinsicElements['shaderMaterial'] & {
      uColor?: THREE.Color;
      uShadowColor?: THREE.Color;
      uTime?: number;
      uWindStrength?: number;
    };
  }
}

// ============================================
// MAIN PROCEDURAL PLANT COMPONENT
// ============================================

interface ProceduralPlantProps {
  project: GardenProject;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
}

export const ProceduralPlant = ({
  project,
  isSelected = false,
  isHovered = false,
  onClick,
  onPointerOver,
  onPointerOut,
}: ProceduralPlantProps) => {
  const genes = useMemo(() => projectToGenes(project), [project]);
  const floraType = useMemo(() => getFloraType(project), [project]);
  
  const handleClick = (e: any) => {
    e.stopPropagation();
    onClick?.();
  };
  
  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
    onPointerOver?.();
  };
  
  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    document.body.style.cursor = 'auto';
    onPointerOut?.();
  };
  
  return (
    <group
      position={project.position}
      rotation={[0, project.rotation || 0, 0]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Invisible hitbox */}
      <mesh visible={false}>
        <cylinderGeometry args={[0.8, 0.8, genes.height * 1.5, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Render appropriate flora type */}
      {floraType === 'tree' && (
        <ProceduralTree
          genes={genes}
          isSelected={isSelected}
          isHovered={isHovered}
        />
      )}
      
      {floraType === 'flower' && (
        <FlowerCluster
          genes={genes}
          isSelected={isSelected}
          isHovered={isHovered}
        />
      )}
      
      {floraType === 'niwaki' && (
        <NiwakiFromProject
          genes={genes}
          project={project}
          isSelected={isSelected}
          isHovered={isHovered}
        />
      )}

      {floraType === 'bamboo' && (
        <BambooFromProject
          genes={genes}
          isSelected={isSelected}
          isHovered={isHovered}
        />
      )}
    </group>
  );
};

// ============================================
// BAMBOO FROM PROJECT
// ============================================

interface BambooFromProjectProps {
  genes: PlantGenes;
  isSelected?: boolean;
  isHovered?: boolean;
}

const BambooFromProject = ({ genes, isSelected, isHovered }: BambooFromProjectProps) => {
  const bambooGenes = useMemo(
    () =>
      makeBambooGenes(genes.seed, {
        height: Math.max(2.8, genes.height * 0.9 + 1.5),
        culmCount: Math.max(3, Math.min(6, 2 + genes.complexity)),
        culmColor: genes.stemColor,
        leafColor: genes.leafColor,
        accentColor: genes.accentColor,
      }),
    [genes]
  );
  const scale = isSelected ? 1.03 : isHovered ? 1.015 : 1;
  return <ProceduralBamboo genes={bambooGenes} scale={scale} />;
};

// ============================================
// NIWAKI FROM PROJECT
// ============================================

interface NiwakiFromProjectProps {
  genes: PlantGenes;
  project: GardenProject;
  isSelected?: boolean;
  isHovered?: boolean;
}

const NiwakiFromProject = ({ genes, project, isSelected, isHovered }: NiwakiFromProjectProps) => {
  const niwakiGenes = useMemo(
    () =>
      makeNiwakiGenes(genes.seed, {
        height: genes.height * 0.75,
        padCount: Math.max(3, Math.min(7, 3 + genes.complexity)),
        trunkColor: genes.stemColor,
        padColor: genes.leafColor,
        accentColor: genes.accentColor,
      }),
    [genes]
  );
  const scale = isSelected ? 1.03 : isHovered ? 1.015 : 1;
  return <ProceduralNiwaki genes={niwakiGenes} scale={scale} />;
};

// ============================================
// PROCEDURAL TREE (original implementation)
// ============================================

interface TreeProps {
  genes: PlantGenes;
  isSelected?: boolean;
  isHovered?: boolean;
}

const ProceduralTree = ({ genes, isSelected, isHovered }: TreeProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const plantMatRef = useRef<THREE.ShaderMaterial>(null);
  const leafMatRef = useRef<THREE.ShaderMaterial>(null);
  
  const colors = useMemo(() => getPlantColors(genes), [genes]);
  
  const { tubeGeometries, leaves } = useMemo(() => {
    const branches = generateBranches(genes);
    const leaves = generateLeaves(branches, genes);
    
    const tubeGeometries = branches.map(branch => {
      return new THREE.TubeGeometry(branch.curve, 16, branch.thickness, 8, false);
    });
    
    return { tubeGeometries, leaves };
  }, [genes]);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (plantMatRef.current) {
      plantMatRef.current.uniforms.uTime.value = time;
      plantMatRef.current.uniforms.uSelected.value = isSelected ? 1.0 : 0.0;
      plantMatRef.current.uniforms.uWindStrength.value = isHovered ? 0.05 : 0.025;
    }
    if (leafMatRef.current) {
      leafMatRef.current.uniforms.uTime.value = time;
      leafMatRef.current.uniforms.uWindStrength.value = isHovered ? 0.08 : 0.05;
    }
  });
  
  const scale = isSelected ? 1.03 : isHovered ? 1.015 : 1;
  
  return (
    <group ref={groupRef} scale={scale}>
      {tubeGeometries.map((geometry, i) => (
        <mesh key={`branch-${i}`} geometry={geometry}>
          <meshBasicMaterial 
            color={isSelected ? '#FFFFFF' : isHovered ? '#CCCCCC' : '#8B7355'}
            wireframe
          />
        </mesh>
      ))}
      
      {leaves.map((leaf, i) => (
        <mesh
          key={`leaf-${i}`}
          position={leaf.position}
          rotation={leaf.rotation}
          scale={leaf.scale}
        >
          <sphereGeometry args={[1, 8, 6]} />
          <meshBasicMaterial 
            color={isSelected ? '#B5C4A8' : isHovered ? '#9DB5A0' : '#7BA05B'}
            wireframe
          />
        </mesh>
      ))}
      
      {genes.hasGlow && (
        <pointLight
          position={[0, genes.height * 0.6, 0]}
          color={genes.leafColor}
          intensity={isSelected ? 0.6 : 0.25}
          distance={3.5}
        />
      )}
    </group>
  );
};

// ============================================
// FLOWER CLUSTER (multiple flowers)
// ============================================

interface FlowerClusterProps {
  genes: PlantGenes;
  isSelected?: boolean;
  isHovered?: boolean;
}

const FlowerCluster = ({ genes, isSelected, isHovered }: FlowerClusterProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const rng = useMemo(() => new SeededRandom(genes.seed), [genes.seed]);
  
  const flowers = useMemo(() => {
    const palette = [
      '#E53935', '#FF4D4D', // red
      '#8E24AA', '#B85CFF', // purple
      '#1E88E5', '#4DA3FF', // blue
      '#F4C430', '#FFD84D', // yellow
    ];
    const speciesList: GardenBloomSpecies[] = [
      'garden-rose',
      'cup-rose',
      'water-lotus',
      'orchid-spike',
      'star-lily',
      'sun-daisy',
    ];
    const bloomStages = [0.4, 0.58, 0.78, 1.0];

    return Array.from({ length: 18 }).map((_, i) => {
      const ring = i < 7 ? 0 : i < 13 ? 1 : 2;
      const radius = ring === 0 ? rng.range(0.12, 0.4) : ring === 1 ? rng.range(0.42, 0.66) : rng.range(0.68, 0.82);
      const angle = (i / 18) * Math.PI * 2 + rng.range(-0.22, 0.22);
      const variationSeed = rng.int(1, 1_000_000);

      return {
        position: new THREE.Vector3(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        ),
        scale: rng.range(0.55, 0.9),
        petalCount: 0,
        color: rng.pick(palette),
        species: rng.pick(speciesList),
        bloom: rng.pick(bloomStages),
        variationSeed,
      };
    });
  }, [genes.seed, rng]);

  const planterRocks = useMemo(() => {
    const rockCount = 10 + rng.int(0, 4);
    const baseRadius = 1.05;
    return Array.from({ length: rockCount }).map((_, i) => {
      const angle = (i / rockCount) * Math.PI * 2 + rng.range(-0.1, 0.1);
      const dist = baseRadius + rng.range(-0.05, 0.08);
      const size = 0.08 + rng.range(0, 0.08);

      return {
        position: [
          Math.cos(angle) * dist,
          size * 0.45,
          Math.sin(angle) * dist,
        ] as [number, number, number],
        scale: [
          size * (1.1 + rng.range(0, 0.25)),
          size * (0.65 + rng.range(0, 0.2)),
          size * (0.95 + rng.range(0, 0.25)),
        ] as [number, number, number],
        rotation: [
          rng.range(-0.15, 0.15),
          rng.range(0, Math.PI * 2),
          rng.range(-0.15, 0.15),
        ] as [number, number, number],
      };
    });
  }, [rng]);
  
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      // Constant subtle sway, no rotation change on hover
      const sway = 0.01;
      groupRef.current.rotation.z = Math.sin(time * 0.8 + genes.seed) * sway;
    }
  });
  
  const scale = isSelected ? 1.05 : isHovered ? 1.02 : 1;
  const baseColor = new THREE.Color('#8B8075');
  
  return (
    <group ref={groupRef} scale={scale}>
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.95, 1.08, 16]} />
          <meshBasicMaterial color="#A89880" wireframe />
        </mesh>

        {planterRocks.map((rock, i) => {
          const color = baseColor.clone();
          const hsl = { h: 0, s: 0, l: 0 };
          color.getHSL(hsl);
          color.setHSL(hsl.h, hsl.s, hsl.l + rng.range(-0.03, 0.03));

          return (
            <mesh
              key={`rock-${i}`}
              position={rock.position}
              scale={rock.scale}
              rotation={rock.rotation}
            >
              <dodecahedronGeometry args={[1, 0]} />
              <meshBasicMaterial color={color} wireframe />
            </mesh>
          );
        })}
      </group>

      {flowers.map((flower, i) => (
        <ProceduralFlower
          key={i}
          position={flower.position}
          genes={genes}
          petalCount={flower.petalCount}
          petalColor={flower.color}
          scale={flower.scale}
          species={flower.species}
          bloom={flower.bloom}
          variationSeed={flower.variationSeed}
        />
      ))}
    </group>
  );
};

// ============================================
// HELPER FUNCTIONS
// ============================================

interface BranchData {
  curve: THREE.CatmullRomCurve3;
  thickness: number;
  generation: number;
}

interface LeafData {
  position: THREE.Vector3;
  scale: number;
  rotation: THREE.Euler;
}

const generateBranches = (genes: PlantGenes): BranchData[] => {
  const branches: BranchData[] = [];
  const rng = new SeededRandom(genes.seed);
  
  const grow = (
    start: THREE.Vector3,
    direction: THREE.Vector3,
    length: number,
    thickness: number,
    generation: number
  ) => {
    if (generation > genes.complexity + 1 || length < 0.06) return;
    
    const points: THREE.Vector3[] = [start.clone()];
    const segments = 8;
    let currentPos = start.clone();
    let currentDir = direction.clone();
    
    for (let i = 1; i <= segments; i++) {
      const wobble = new THREE.Vector3(
        rng.gaussian(0, 0.03),
        rng.gaussian(0, 0.02),
        rng.gaussian(0, 0.03)
      );
      currentDir.add(wobble).normalize();
      currentDir.y = Math.max(currentDir.y, 0.3);
      currentDir.normalize();
      
      const segmentLength = length / segments;
      currentPos = currentPos.clone().add(currentDir.clone().multiplyScalar(segmentLength));
      points.push(currentPos.clone());
    }
    
    const curve = new THREE.CatmullRomCurve3(points);
    branches.push({ curve, thickness, generation });
    
    const end = currentPos;
    
    if (generation < genes.complexity + 1) {
      const childCount = generation === 0 
        ? genes.branchCount 
        : Math.max(1, genes.branchCount - generation);
      
      for (let i = 0; i < childCount; i++) {
        const angleOffset = (i / childCount) * Math.PI * 2 + rng.range(-0.4, 0.4);
        const spreadAngle = (genes.branchAngle * Math.PI) / 180;
        const randomSpread = rng.range(0.6, 1.1);
        
        const newDir = new THREE.Vector3(
          Math.sin(spreadAngle * randomSpread) * Math.cos(angleOffset),
          Math.cos(spreadAngle * randomSpread) * 0.8 + 0.2,
          Math.sin(spreadAngle * randomSpread) * Math.sin(angleOffset)
        ).normalize();
        
        grow(
          end,
          newDir,
          length * rng.range(0.55, 0.75),
          thickness * 0.55,
          generation + 1
        );
      }
    }
  };
  
  grow(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(rng.range(-0.1, 0.1), 1, rng.range(-0.1, 0.1)).normalize(),
    genes.height * 0.45,
    genes.thickness * 1.8,
    0
  );
  
  return branches;
};

const generateLeaves = (branches: BranchData[], genes: PlantGenes): LeafData[] => {
  const leaves: LeafData[] = [];
  const rng = new SeededRandom(genes.seed + 1000);
  
  const eligibleBranches = branches.filter(b => b.generation >= Math.max(1, genes.complexity - 1));
  
  for (const branch of eligibleBranches) {
    const endPoint = branch.curve.getPoint(1);
    // Fewer but larger foliage clusters for cleaner wireframe canopy silhouettes
    const leafCount = Math.max(2, Math.floor(genes.leafDensity * rng.range(2.2, 4.4)));
    
    for (let i = 0; i < leafCount; i++) {
      const theta = rng.range(0, Math.PI * 2);
      const phi = rng.range(0.2, Math.PI * 0.7);
      const radius = rng.range(0.18, 0.42);
      
      const offset = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * radius,
        Math.cos(phi) * radius * 0.4 + rng.range(0.04, 0.2),
        Math.sin(phi) * Math.sin(theta) * radius
      );
      
      leaves.push({
        position: endPoint.clone().add(offset),
        scale: rng.range(0.3, 0.62) * Math.max(0.9, genes.leafDensity * 0.8),
        rotation: new THREE.Euler(
          rng.range(-0.35, 0.35),
          rng.range(0, Math.PI * 2),
          rng.range(-0.35, 0.35)
        ),
      });
    }
  }
  
  return leaves;
};

const getPlantColors = (genes: PlantGenes) => {
  const palette = PAINTERLY_PALETTES.spring;
  const rng = new SeededRandom(genes.seed);
  const hueShift = rng.range(-0.05, 0.05);
  
  const shiftColor = (hex: string, amount: number) => {
    const color = new THREE.Color(hex);
    const hsl = { h: 0, s: 0, l: 0 };
    color.getHSL(hsl);
    hsl.h = (hsl.h + amount + 1) % 1;
    color.setHSL(hsl.h, hsl.s, hsl.l);
    return color;
  };
  
  return {
    plant: {
      base: shiftColor(genes.stemColor || palette.plant.base, hueShift),
      shadow: shiftColor(palette.plant.shadow, hueShift),
      highlight: shiftColor(palette.plant.highlight, hueShift),
    },
    leaf: {
      base: shiftColor(genes.leafColor || palette.leaf.base, hueShift),
      shadow: shiftColor(palette.leaf.shadow, hueShift),
    },
  };
};
