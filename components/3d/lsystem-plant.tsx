'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { PlantGeneProfile } from '@/lib/utils/lsystem-generator';
import { getExpandedLSystem } from '@/lib/utils/lsystem-generator';
import { FloatingFlowerParticles } from './particles';

// ============================================
// GLOW TEXTURE GENERATOR
// ============================================

/**
 * Create a circular gradient texture for glow effect
 */
function createGlowTexture(size = 128): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  
  const context = canvas.getContext('2d');
  if (!context) return new THREE.Texture();
  
  const gradient = context.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  );
  
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)');
  gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  
  return texture;
}

// ============================================
// TURTLE GRAPHICS STATE
// ============================================

interface TurtleState {
  position: THREE.Vector3;
  direction: THREE.Vector3;
  right: THREE.Vector3;
  up: THREE.Vector3;
  thickness: number;
}

interface BranchSegment {
  start: THREE.Vector3;
  end: THREE.Vector3;
  thickness: number;
}

interface LeafPoint {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
}

// Safety limits to prevent browser crashes
const MAX_BRANCHES = 2000;
const MAX_LEAVES = 1000;

// ============================================
// TURTLE INTERPRETER
// ============================================

class TurtleInterpreter {
  private state: TurtleState;
  private stateStack: TurtleState[] = [];
  private branches: BranchSegment[] = [];
  private leaves: LeafPoint[] = [];
  private angle: number;
  private segmentLength: number;
  private segmentDecay: number;
  private thicknessDecay: number;
  private depth: number = 0;

  constructor(
    angle: number,
    segmentLength: number,
    segmentDecay: number,
    thickness: number,
    thicknessDecay: number
  ) {
    this.angle = (angle * Math.PI) / 180; // Convert to radians
    this.segmentLength = segmentLength;
    this.segmentDecay = segmentDecay;
    this.thicknessDecay = thicknessDecay;

    // Initial state
    this.state = {
      position: new THREE.Vector3(0, 0, 0),
      direction: new THREE.Vector3(0, 1, 0), // Start pointing up
      right: new THREE.Vector3(1, 0, 0),
      up: new THREE.Vector3(0, 0, 1),
      thickness,
    };
  }

  /**
   * Interpret L-system string and generate geometry with safety limits
   */
  interpret(lsystem: string): { branches: BranchSegment[]; leaves: LeafPoint[] } {
    for (const symbol of lsystem) {
      // Safety check: stop if we have too many branches
      if (this.branches.length >= MAX_BRANCHES) {
        console.warn(`Reached max branches limit (${MAX_BRANCHES}). Stopping interpretation.`);
        break;
      }
      this.processSymbol(symbol);
    }

    return {
      branches: this.branches,
      leaves: this.leaves.slice(0, MAX_LEAVES), // Cap leaves as well
    };
  }

  /**
   * Process a single L-system symbol
   */
  private processSymbol(symbol: string) {
    switch (symbol) {
      case 'F': // Draw forward (create branch)
        this.drawForward();
        break;

      case '+': // Rotate right (yaw)
        this.rotateRight();
        break;

      case '-': // Rotate left (yaw)
        this.rotateLeft();
        break;

      case '&': // Pitch down
        this.pitchDown();
        break;

      case '^': // Pitch up
        this.pitchUp();
        break;

      case '\\': // Roll left
        this.rollLeft();
        break;

      case '/': // Roll right
        this.rollRight();
        break;

      case '[': // Push state (start branch)
        this.pushState();
        break;

      case ']': // Pop state (end branch, add leaf)
        this.popState();
        break;

      case 'X': // Non-terminal (no action)
      case 'Y':
        break;

      default:
        // Ignore unknown symbols
        break;
    }
  }

  /**
   * Draw forward - creates a branch segment
   */
  private drawForward() {
    const start = this.state.position.clone();
    const length = this.segmentLength * Math.pow(this.segmentDecay, this.depth);
    const offset = this.state.direction.clone().multiplyScalar(length);
    const end = start.clone().add(offset);

    this.branches.push({
      start,
      end,
      thickness: this.state.thickness,
    });

    this.state.position = end;
  }

  /**
   * Rotate right around up vector
   */
  private rotateRight() {
    this.state.direction.applyAxisAngle(this.state.up, this.angle);
    this.state.right.applyAxisAngle(this.state.up, this.angle);
  }

  /**
   * Rotate left around up vector
   */
  private rotateLeft() {
    this.state.direction.applyAxisAngle(this.state.up, -this.angle);
    this.state.right.applyAxisAngle(this.state.up, -this.angle);
  }

  /**
   * Pitch down
   */
  private pitchDown() {
    this.state.direction.applyAxisAngle(this.state.right, this.angle);
    this.state.up.applyAxisAngle(this.state.right, this.angle);
  }

  /**
   * Pitch up
   */
  private pitchUp() {
    this.state.direction.applyAxisAngle(this.state.right, -this.angle);
    this.state.up.applyAxisAngle(this.state.right, -this.angle);
  }

  /**
   * Roll left
   */
  private rollLeft() {
    this.state.right.applyAxisAngle(this.state.direction, this.angle);
    this.state.up.applyAxisAngle(this.state.direction, this.angle);
  }

  /**
   * Roll right
   */
  private rollRight() {
    this.state.right.applyAxisAngle(this.state.direction, -this.angle);
    this.state.up.applyAxisAngle(this.state.direction, -this.angle);
  }

  /**
   * Push current state onto stack
   */
  private pushState() {
    this.stateStack.push({
      position: this.state.position.clone(),
      direction: this.state.direction.clone(),
      right: this.state.right.clone(),
      up: this.state.up.clone(),
      thickness: this.state.thickness * this.thicknessDecay,
    });
    this.depth++;
  }

  /**
   * Pop state from stack and add leaf at branch tip
   */
  private popState() {
    // Add leaf at current position (branch tip) - with limit check
    if (this.depth > 0 && this.leaves.length < MAX_LEAVES) {
      this.leaves.push({
        position: this.state.position.clone(),
        rotation: new THREE.Euler(
          Math.random() * 0.5,
          Math.random() * Math.PI * 2,
          Math.random() * 0.5
        ),
        scale: 0.08 * Math.pow(0.8, this.depth),
      });
    }

    const prevState = this.stateStack.pop();
    if (prevState) {
      this.state = prevState;
      this.depth--;
    }
  }
}

// ============================================
// REACT COMPONENT
// ============================================

interface LSystemPlantProps {
  profile: PlantGeneProfile;
  scale?: number;
  animated?: boolean;
}

export const LSystemPlant = ({ 
  profile, 
  scale = 1,
  animated = true 
}: LSystemPlantProps) => {
  const groupRef = useRef<THREE.Group>(null);

  // Create glow texture once
  const glowTexture = useMemo(() => createGlowTexture(128), []);

  // Generate geometry from L-system
  const geometry = useMemo(() => {
    const lsystemString = getExpandedLSystem(profile);
    
    const interpreter = new TurtleInterpreter(
      profile.params.angle,
      profile.params.segmentLength,
      profile.params.segmentDecay,
      profile.params.thickness,
      profile.params.thicknessDecay
    );

    const result = interpreter.interpret(lsystemString);
    
    // Create tube geometries for branches
    const branchGeometries = result.branches.map((branch) => {
      const path = new THREE.LineCurve3(branch.start, branch.end);
      return new THREE.TubeGeometry(path, 2, branch.thickness, 6, false);
    });

    return {
      branches: branchGeometries,
      leaves: result.leaves,
    };
  }, [profile]);

  // Animate subtle sway
  useFrame((state) => {
    if (groupRef.current && animated) {
      const time = state.clock.getElapsedTime();
      groupRef.current.rotation.z = Math.sin(time * 0.5) * 0.02;
      groupRef.current.rotation.x = Math.sin(time * 0.3) * 0.01;
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* Branches */}
      {geometry.branches.map((branchGeometry, i) => (
        <mesh key={`branch-${i}`} geometry={branchGeometry}>
          <meshBasicMaterial 
            color={profile.colors.stem}
            wireframe
          />
        </mesh>
      ))}

      {/* Leaves - clustered scribbles (reduced for flower species) */}
      {geometry.leaves
        .filter((_, i) => {
          // For flower species, only show 30% of leaves to let flowers shine
          if (profile.species === 'flower') return i % 3 === 0;
          // For other species, show most leaves but skip some for variety
          return i % 1 === 0; // Show all
        })
        .map((leaf, i) => {
        // Create a cluster of small icosahedrons for organic scribble effect
        const clusterSize = profile.species === 'flower' ? 2 : (3 + (i % 2)); // Smaller clusters for flowers
        const baseScale = leaf.scale;
        
        return (
          <group key={`leaf-cluster-${i}`} position={leaf.position} rotation={leaf.rotation}>
            {Array.from({ length: clusterSize }).map((_, j) => {
              // Slight offset for each shape in cluster
              const offsetAngle = (j / clusterSize) * Math.PI * 2;
              const offsetDist = baseScale * 0.3;
              const x = Math.cos(offsetAngle) * offsetDist;
              const y = Math.sin(offsetAngle) * offsetDist * 0.5;
              const z = Math.sin(offsetAngle + 1) * offsetDist;
              
              return (
                <mesh
                  key={j}
                  position={[x, y, z]}
                  rotation={[
                    (i * 0.7 + j) * 0.5,
                    (i * 1.3 + j) * 0.8,
                    (i * 0.9 + j) * 0.6
                  ]}
                  scale={baseScale * (0.6 + (j / clusterSize) * 0.6)}
                >
                  <icosahedronGeometry args={[1, 1]} />
                  <meshBasicMaterial 
                    color={profile.colors.leaf}
                    wireframe
                  />
                </mesh>
              );
            })}
          </group>
        );
      })}

      {/* Flowers - prominent for flower species, solid with glow */}
      {geometry.leaves
        .filter((_, i) => {
          // Flower species: every 2nd position gets a flower (50%)
          if (profile.species === 'flower') return i % 2 === 0;
          // Succulent species: occasional flowers (20%)
          if (profile.species === 'succulent') return i % 5 === 0;
          // Other species: rare flowers (10%)
          return i % 10 === 0;
        })
        .slice(0, profile.species === 'flower' ? 20 : profile.species === 'succulent' ? 8 : 4) // More flowers for flower species
        .map((leaf, i) => {
          const isFlowerSpecies = profile.species === 'flower';
          const petalCount = isFlowerSpecies ? 6 : 4; // More petals for flower species
          const flowerScale = isFlowerSpecies ? leaf.scale * 0.5 : leaf.scale * 0.35; // Smaller, more delicate
          
          return (
            <group key={`flower-${i}`} position={leaf.position}>
              {/* Soft point light for glow effect */}
              <pointLight
                position={[0, 0, 0]}
                color={profile.colors.flower}
                intensity={0.2}
                distance={flowerScale * 4}
              />
              
              {/* Center of flower - solid with emissive glow */}
              <mesh scale={flowerScale * 0.4}>
                <sphereGeometry args={[1, 8, 8]} />
                <meshStandardMaterial 
                  color={profile.colors.accent}
                  emissive={profile.colors.accent}
                  emissiveIntensity={1.2}
                  roughness={0.7}
                  metalness={0.1}
                />
              </mesh>

              {/* Glowing sprite billboard - always faces camera */}
              <sprite scale={flowerScale * 1.5}>
                <spriteMaterial
                  map={glowTexture}
                  color={profile.colors.accent}
                  transparent={true}
                  opacity={0.9}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </sprite>

              {/* Floating particles for bloom effect */}
              <FloatingFlowerParticles
                position={[0, 0, 0]}
                count={8}
                radius={flowerScale * 1.2}
                color={profile.colors.flower}
              />
              
              {/* Petals arranged radially - solid with glow */}
              {Array.from({ length: petalCount }).map((_, j) => {
                const angle = (j / petalCount) * Math.PI * 2;
                const radius = flowerScale * 0.5;
                return (
                  <mesh
                    key={j}
                    position={[
                      Math.cos(angle) * radius,
                      Math.sin(angle) * radius * 0.3,
                      Math.sin(angle) * radius
                    ]}
                    rotation={[
                      angle,
                      0,
                      Math.PI / 2
                    ]}
                    scale={flowerScale * 0.5}
                  >
                    <sphereGeometry args={[1, 8, 8]} />
                    <meshStandardMaterial 
                      color={profile.colors.flower}
                      emissive={profile.colors.flower}
                      emissiveIntensity={0.8}
                      roughness={0.6}
                      metalness={0.2}
                    />
                  </mesh>
                );
              })}
            </group>
          );
        })}
    </group>
  );
};

// ============================================
// CENTERED PLANT (for display)
// ============================================

interface CenteredLSystemPlantProps {
  profile: PlantGeneProfile;
  scale?: number;
}

export const CenteredLSystemPlant = ({ 
  profile, 
  scale = 2.5 
}: CenteredLSystemPlantProps) => {
  return (
    <group position={[0, -0.5, 0]}>
      <LSystemPlant profile={profile} scale={scale} />
    </group>
  );
};

