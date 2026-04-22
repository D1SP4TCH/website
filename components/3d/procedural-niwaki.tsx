'use client';

/**
 * Procedural Niwaki Tree
 * Japanese cloud-pruned garden tree: sinuous leaning trunk, sparse branches,
 * and distinct rounded foliage "cloud pads" at branch tips.
 */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SeededRandom } from '@/lib/utils/seeded-random';

export interface NiwakiGenes {
  seed: number;
  height: number;
  trunkCurl: number;
  trunkLean: number;
  trunkThickness: number;
  padCount: number;
  padSize: number;
  padSpread: number;
  padFlatness: number;
  branchReach: number;
  branchDroop: number;
  hasApexPad: boolean;
  trunkColor: string;
  padColor: string;
  accentColor: string;
}

export const NIWAKI_DEFAULTS = {
  trunkColor: '#7A6B5A',
  padColor: '#8FA884',
  accentColor: '#B5C4A8',
};

export const makeNiwakiGenes = (seed: number, overrides: Partial<NiwakiGenes> = {}): NiwakiGenes => {
  const rng = new SeededRandom(seed);
  return {
    seed,
    height: rng.range(2.4, 3.4),
    trunkCurl: rng.range(0.55, 0.9),
    trunkLean: rng.range(-0.55, 0.55),
    trunkThickness: rng.range(0.07, 0.1),
    padCount: rng.int(4, 7),
    padSize: rng.range(0.45, 0.68),
    padSpread: rng.range(0.25, 0.5),
    padFlatness: rng.range(0.55, 0.78),
    branchReach: rng.range(0.75, 1.15),
    branchDroop: rng.range(0.08, 0.22),
    hasApexPad: rng.bool(0.78),
    trunkColor: NIWAKI_DEFAULTS.trunkColor,
    padColor: NIWAKI_DEFAULTS.padColor,
    accentColor: NIWAKI_DEFAULTS.accentColor,
    ...overrides,
  };
};

// ============================================
// TRUNK
// ============================================

function buildTrunk(genes: NiwakiGenes, rng: SeededRandom) {
  const segments = 7;
  const points: THREE.Vector3[] = [new THREE.Vector3(0, 0, 0)];

  // Directional lean vector in XZ plane
  const leanAngle = rng.range(0, Math.PI * 2);
  const leanDir = new THREE.Vector3(Math.cos(leanAngle), 0, Math.sin(leanAngle));

  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const y = genes.height * t;

    // S-curve waves along trunk
    const wave1 = Math.sin(t * Math.PI * 1.35 + genes.seed * 0.013) * genes.trunkCurl * 0.28;
    const wave2 = Math.sin(t * Math.PI * 2.6 + genes.seed * 0.021) * genes.trunkCurl * 0.1;

    // Lean decays softly toward the top so the crown stays balanced
    const leanFalloff = 1 - Math.pow(t, 1.6) * 0.35;
    const leanMagnitude = genes.trunkLean * genes.height * 0.24 * leanFalloff;

    const jitterX = rng.range(-0.04, 0.04) * genes.trunkCurl;
    const jitterZ = rng.range(-0.04, 0.04) * genes.trunkCurl;

    const x = leanDir.x * leanMagnitude + wave1 + jitterX;
    const z = leanDir.z * leanMagnitude + wave2 + jitterZ;

    points.push(new THREE.Vector3(x, y, z));
  }

  const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
  const geometry = new THREE.TubeGeometry(curve, 72, genes.trunkThickness, 8, false);

  // Taper the tube toward the top for a more organic trunk
  const posAttr = geometry.attributes.position;
  const tmp = new THREE.Vector3();
  for (let i = 0; i < posAttr.count; i++) {
    tmp.fromBufferAttribute(posAttr, i);
    const t = THREE.MathUtils.clamp(tmp.y / genes.height, 0, 1);
    const taper = THREE.MathUtils.lerp(1, 0.42, t);
    const sample = curve.getPoint(t);
    tmp.x = sample.x + (tmp.x - sample.x) * taper;
    tmp.z = sample.z + (tmp.z - sample.z) * taper;
    posAttr.setXYZ(i, tmp.x, tmp.y, tmp.z);
  }
  posAttr.needsUpdate = true;
  geometry.computeVertexNormals();

  return { geometry, curve };
}

// ============================================
// BRANCHES + PAD ANCHORS
// ============================================

interface BranchData {
  geometry: THREE.TubeGeometry;
  padCenter: THREE.Vector3;
  padScale: number;
  padTilt: number;
}

function buildBranches(
  genes: NiwakiGenes,
  trunkCurve: THREE.CatmullRomCurve3,
  rng: SeededRandom
): BranchData[] {
  const branches: BranchData[] = [];
  const lateralCount = Math.max(0, genes.padCount - (genes.hasApexPad ? 1 : 0));

  // Distribute heights along the trunk with jitter, biased toward upper 2/3
  const heights: number[] = [];
  for (let i = 0; i < lateralCount; i++) {
    const base = 0.22 + (i / Math.max(1, lateralCount - 1)) * 0.62;
    heights.push(THREE.MathUtils.clamp(base + rng.range(-0.05, 0.05), 0.12, 0.92));
  }

  // Alternate sides for a classic niwaki silhouette, but with variation
  let lastAngle = rng.range(0, Math.PI * 2);
  for (let i = 0; i < lateralCount; i++) {
    const t = heights[i];
    const base = trunkCurve.getPoint(t);
    const tangent = trunkCurve.getTangent(t).normalize();

    const flip = i % 2 === 0 ? 1 : -1;
    lastAngle += Math.PI * flip * rng.range(0.55, 0.95) + rng.range(-0.35, 0.35);
    const horizontal = new THREE.Vector3(Math.cos(lastAngle), 0, Math.sin(lastAngle));
    horizontal.addScaledVector(tangent, -horizontal.dot(tangent)).normalize();

    const reach = genes.branchReach * rng.range(0.7, 1.2) * (0.6 + (1 - t) * 0.7);
    const droop = genes.branchDroop * rng.range(0.6, 1.25);
    const lift = rng.range(0.15, 0.38);

    // 3 control points give the branch a dip-then-lift profile
    const start = base.clone();
    const ctrl1 = base
      .clone()
      .addScaledVector(horizontal, reach * 0.3)
      .add(new THREE.Vector3(0, 0.03, 0));
    const ctrl2 = base
      .clone()
      .addScaledVector(horizontal, reach * 0.65)
      .add(new THREE.Vector3(0, -droop, 0));
    const tip = base
      .clone()
      .addScaledVector(horizontal, reach)
      .add(new THREE.Vector3(0, lift, 0));

    const curve = new THREE.CatmullRomCurve3([start, ctrl1, ctrl2, tip]);
    const thickness = genes.trunkThickness * rng.range(0.4, 0.58) * (1 - t * 0.35);
    const geometry = new THREE.TubeGeometry(curve, 28, thickness, 6, false);

    const padScale = genes.padSize * rng.range(1 - genes.padSpread, 1 + genes.padSpread);
    const padTilt = rng.range(-0.18, 0.18);

    branches.push({
      geometry,
      padCenter: tip.clone().add(new THREE.Vector3(0, padScale * 0.25, 0)),
      padScale,
      padTilt,
    });
  }

  if (genes.hasApexPad) {
    const apex = trunkCurve.getPoint(1);
    const padScale = genes.padSize * rng.range(1.0, 1.28);
    const stubCurve = new THREE.CatmullRomCurve3([
      apex.clone(),
      apex.clone().add(new THREE.Vector3(rng.range(-0.05, 0.05), 0.14, rng.range(-0.05, 0.05))),
    ]);
    const geometry = new THREE.TubeGeometry(stubCurve, 4, genes.trunkThickness * 0.45, 6, false);
    branches.push({
      geometry,
      padCenter: apex.clone().add(new THREE.Vector3(0, padScale * 0.4, 0)),
      padScale,
      padTilt: rng.range(-0.08, 0.08),
    });
  }

  return branches;
}

// ============================================
// CLOUD PADS
// ============================================

interface Puff {
  position: THREE.Vector3;
  scale: THREE.Vector3;
  rotation: THREE.Euler;
  accent: boolean;
}

function buildCloudPad(
  center: THREE.Vector3,
  scale: number,
  flatness: number,
  tilt: number,
  rng: SeededRandom
): Puff[] {
  const puffs: Puff[] = [];
  const puffCount = rng.int(6, 10);

  // Central puff
  puffs.push({
    position: center.clone(),
    scale: new THREE.Vector3(scale, scale * flatness, scale),
    rotation: new THREE.Euler(tilt, rng.range(0, Math.PI), 0),
    accent: false,
  });

  for (let i = 0; i < puffCount; i++) {
    const angle = (i / puffCount) * Math.PI * 2 + rng.range(-0.25, 0.25);
    const radius = scale * rng.range(0.42, 0.82);
    const dy = (rng.range(-0.15, 0.15) + Math.sin(tilt + angle) * 0.12) * scale * flatness;
    const puffScale = scale * rng.range(0.45, 0.78);
    puffs.push({
      position: new THREE.Vector3(
        center.x + Math.cos(angle) * radius,
        center.y + dy,
        center.z + Math.sin(angle) * radius
      ),
      scale: new THREE.Vector3(puffScale, puffScale * flatness * rng.range(0.9, 1.1), puffScale),
      rotation: new THREE.Euler(
        rng.range(-0.3, 0.3) + tilt,
        rng.range(0, Math.PI * 2),
        rng.range(-0.3, 0.3)
      ),
      accent: rng.bool(0.18),
    });
  }

  return puffs;
}

// ============================================
// COMPONENT
// ============================================

interface ProceduralNiwakiProps {
  genes: NiwakiGenes;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  sway?: number;
  showSkeleton?: boolean;
}

export function ProceduralNiwaki({
  genes,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  sway = 0.012,
  showSkeleton = false,
}: ProceduralNiwakiProps) {
  const groupRef = useRef<THREE.Group>(null);

  const { trunkGeometry, branches, pads } = useMemo(() => {
    // Separate RNGs so trunk/branches/pads are stable yet varied
    const trunkRng = new SeededRandom(genes.seed);
    const branchRng = new SeededRandom(genes.seed + 7919);
    const padRng = new SeededRandom(genes.seed + 104729);

    const { geometry: trunkGeometry, curve } = buildTrunk(genes, trunkRng);
    const branches = buildBranches(genes, curve, branchRng);
    const pads = branches.map((b) =>
      buildCloudPad(b.padCenter, b.padScale, genes.padFlatness, b.padTilt, padRng)
    );

    return { trunkGeometry, branches, pads };
  }, [genes]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.z = Math.sin(t * 0.5 + genes.seed * 0.001) * sway;
    groupRef.current.rotation.x = Math.cos(t * 0.37 + genes.seed * 0.002) * sway * 0.6;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <mesh geometry={trunkGeometry}>
        <meshBasicMaterial color={genes.trunkColor} wireframe />
      </mesh>

      {branches.map((branch, i) => (
        <mesh key={`branch-${i}`} geometry={branch.geometry}>
          <meshBasicMaterial color={genes.trunkColor} wireframe />
        </mesh>
      ))}

      {pads.flatMap((pad, padIdx) =>
        pad.map((puff, i) => (
          <mesh
            key={`pad-${padIdx}-puff-${i}`}
            position={puff.position}
            scale={puff.scale}
            rotation={puff.rotation}
          >
            <icosahedronGeometry args={[1, 1]} />
            <meshBasicMaterial
              color={puff.accent ? genes.accentColor : genes.padColor}
              wireframe
            />
          </mesh>
        ))
      )}

      {showSkeleton &&
        branches.map((branch, i) => (
          <mesh key={`anchor-${i}`} position={branch.padCenter}>
            <sphereGeometry args={[0.04, 6, 4]} />
            <meshBasicMaterial color="#ff3860" />
          </mesh>
        ))}
    </group>
  );
}
