'use client';

/**
 * Procedural Bamboo Grove
 * Clustered tall culms with visible segment nodes, sparse upper branches,
 * and lance-shaped leaf fans at the tips. Wireframe aesthetic to match
 * the rest of the garden flora.
 */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SeededRandom } from '@/lib/utils/seeded-random';

export interface BambooGenes {
  seed: number;
  height: number;
  culmCount: number;
  culmSpread: number;
  segmentLength: number;
  trunkThickness: number;
  taper: number;
  sway: number;
  branchStart: number;
  branchesPerCulm: number;
  leavesPerBranch: number;
  leafLength: number;
  leafWidth: number;
  culmColor: string;
  nodeColor: string;
  leafColor: string;
  accentColor: string;
}

export const BAMBOO_DEFAULTS = {
  culmColor: '#8FA368',
  nodeColor: '#5F6E44',
  leafColor: '#9DB67A',
  accentColor: '#C7D89F',
};

export const makeBambooGenes = (
  seed: number,
  overrides: Partial<BambooGenes> = {}
): BambooGenes => {
  const rng = new SeededRandom(seed);
  return {
    seed,
    height: rng.range(3.2, 4.6),
    culmCount: rng.int(3, 6),
    culmSpread: rng.range(0.18, 0.38),
    segmentLength: rng.range(0.32, 0.48),
    trunkThickness: rng.range(0.055, 0.085),
    taper: rng.range(0.48, 0.65),
    sway: rng.range(0.06, 0.14),
    branchStart: rng.range(0.48, 0.62),
    branchesPerCulm: rng.int(3, 6),
    leavesPerBranch: rng.int(4, 7),
    leafLength: rng.range(0.26, 0.38),
    leafWidth: rng.range(0.045, 0.07),
    culmColor: BAMBOO_DEFAULTS.culmColor,
    nodeColor: BAMBOO_DEFAULTS.nodeColor,
    leafColor: BAMBOO_DEFAULTS.leafColor,
    accentColor: BAMBOO_DEFAULTS.accentColor,
    ...overrides,
  };
};

// ============================================
// LEAF GEOMETRY (lance-shaped blade)
// ============================================

function createBambooLeafGeometry(width: number, length: number): THREE.ShapeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(width * 0.9, length * 0.12, width * 0.55, length * 0.7, 0, length);
  shape.bezierCurveTo(-width * 0.55, length * 0.7, -width * 0.9, length * 0.12, 0, 0);
  return new THREE.ShapeGeometry(shape, 10);
}

// ============================================
// CULM (single bamboo stalk)
// ============================================

interface SegmentData {
  position: THREE.Vector3;
  radius: number;
  tangent: THREE.Vector3;
}

interface CulmData {
  tubeGeometry: THREE.TubeGeometry;
  nodes: SegmentData[];
  curve: THREE.CatmullRomCurve3;
  height: number;
  baseOffset: THREE.Vector3;
  yawOffset: number;
}

function buildCulm(
  genes: BambooGenes,
  rng: SeededRandom,
  culmIndex: number,
  totalCulms: number
): CulmData {
  // Cluster culms around the origin, with a small ring so they don't overlap
  const angle = (culmIndex / totalCulms) * Math.PI * 2 + rng.range(-0.35, 0.35);
  const ringRadius = rng.range(0, genes.culmSpread);
  const baseOffset = new THREE.Vector3(
    Math.cos(angle) * ringRadius,
    0,
    Math.sin(angle) * ringRadius
  );

  // Per-culm height variation keeps the grove looking natural
  const culmHeight = genes.height * rng.range(0.78, 1.08);

  // Direction each culm bends toward (in XZ plane)
  const bendAngle = rng.range(0, Math.PI * 2);
  const bendDir = new THREE.Vector3(Math.cos(bendAngle), 0, Math.sin(bendAngle));
  const bendAmount = genes.sway * rng.range(0.6, 1.3);

  const segments = Math.max(6, Math.ceil(culmHeight / genes.segmentLength));
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = culmHeight * t;
    // Bamboo arcs more near the top than the base.
    const curveAmount = Math.pow(t, 1.4) * bendAmount * culmHeight;
    const wobble = Math.sin(t * Math.PI * 2.2 + genes.seed * 0.017 + culmIndex) * 0.02;
    points.push(
      new THREE.Vector3(
        baseOffset.x + bendDir.x * curveAmount + wobble,
        y,
        baseOffset.z + bendDir.z * curveAmount + wobble
      )
    );
  }

  const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
  const radialSegments = 6;
  const tubeSegments = segments * 4;
  const baseRadius = genes.trunkThickness * rng.range(0.88, 1.08);
  const geometry = new THREE.TubeGeometry(curve, tubeSegments, baseRadius, radialSegments, false);

  // Taper the culm toward the top using per-vertex scaling
  const posAttr = geometry.attributes.position;
  const tmp = new THREE.Vector3();
  for (let i = 0; i < posAttr.count; i++) {
    tmp.fromBufferAttribute(posAttr, i);
    const t = THREE.MathUtils.clamp(tmp.y / culmHeight, 0, 1);
    const taperFactor = THREE.MathUtils.lerp(1, genes.taper, t);
    const sample = curve.getPoint(t);
    tmp.x = sample.x + (tmp.x - sample.x) * taperFactor;
    tmp.z = sample.z + (tmp.z - sample.z) * taperFactor;
    posAttr.setXYZ(i, tmp.x, tmp.y, tmp.z);
  }
  posAttr.needsUpdate = true;
  geometry.computeVertexNormals();

  // Node rings placed every segmentLength along the culm
  const nodeCount = Math.max(3, Math.floor(culmHeight / genes.segmentLength));
  const nodes: SegmentData[] = [];
  for (let i = 1; i <= nodeCount; i++) {
    const t = i / (nodeCount + 1);
    const position = curve.getPoint(t);
    const tangent = curve.getTangent(t).normalize();
    const radius = baseRadius * THREE.MathUtils.lerp(1, genes.taper, t) * 1.18;
    nodes.push({ position, radius, tangent });
  }

  return {
    tubeGeometry: geometry,
    nodes,
    curve,
    height: culmHeight,
    baseOffset,
    yawOffset: angle,
  };
}

// ============================================
// BRANCHES + LEAF FANS
// ============================================

interface LeafInstance {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
  accent: boolean;
}

interface BranchData {
  geometry: THREE.TubeGeometry;
  leaves: LeafInstance[];
}

function buildBranchesForCulm(
  genes: BambooGenes,
  culm: CulmData,
  rng: SeededRandom
): BranchData[] {
  const branches: BranchData[] = [];
  const count = genes.branchesPerCulm;
  // Branches only appear above the branchStart threshold
  for (let i = 0; i < count; i++) {
    const t = THREE.MathUtils.lerp(
      genes.branchStart,
      0.96,
      i / Math.max(1, count - 1)
    ) + rng.range(-0.03, 0.03);
    const tClamped = THREE.MathUtils.clamp(t, 0, 0.98);

    const base = culm.curve.getPoint(tClamped);
    const tangent = culm.curve.getTangent(tClamped).normalize();

    // Direction alternates around the culm for a natural whorl
    const yaw = culm.yawOffset + i * (Math.PI * 0.9) + rng.range(-0.3, 0.3);
    const horizontal = new THREE.Vector3(Math.cos(yaw), 0, Math.sin(yaw));
    horizontal.addScaledVector(tangent, -horizontal.dot(tangent)).normalize();

    const reach = genes.height * rng.range(0.12, 0.22) * (1 - tClamped * 0.4);
    const droop = rng.range(0.02, 0.08);
    const lift = rng.range(0.05, 0.12);

    const start = base.clone();
    const mid = base
      .clone()
      .addScaledVector(horizontal, reach * 0.55)
      .add(new THREE.Vector3(0, -droop, 0));
    const tip = base
      .clone()
      .addScaledVector(horizontal, reach)
      .add(new THREE.Vector3(0, lift, 0));

    const curve = new THREE.CatmullRomCurve3([start, mid, tip]);
    const branchThickness = genes.trunkThickness * 0.22 * (1 - tClamped * 0.3);
    const geometry = new THREE.TubeGeometry(curve, 14, branchThickness, 5, false);

    // Cluster of leaves hanging naturally from the branch tip.
    // Each leaf picks its own outward direction around the full 360° and
    // droops downward under gravity, so they don't all point the same way.
    const leaves: LeafInstance[] = [];
    const leafCount = genes.leavesPerBranch;
    const fanCenter = tip.clone().add(horizontal.clone().multiplyScalar(0.03));
    const UP = new THREE.Vector3(0, 1, 0);

    for (let l = 0; l < leafCount; l++) {
      // Independent yaw per leaf across the full circle so leaves radiate
      // in all directions, not just along the branch.
      const leafYaw = rng.range(0, Math.PI * 2);

      // Gravity-driven droop: leaves hang between 20° and 70° below horizontal.
      const droopAngle = rng.range(0.35, 1.2);

      // Build the target length-axis direction directly.
      // y is negative (below horizontal) so leaves hang downward.
      const cosDroop = Math.cos(droopAngle);
      const dir = new THREE.Vector3(
        Math.cos(leafYaw) * cosDroop,
        -Math.sin(droopAngle),
        Math.sin(leafYaw) * cosDroop
      ).normalize();

      // Small radial offset from the tip so leaves don't all overlap at one point.
      const radialOffset = rng.range(0.02, 0.06);
      const leafPos = fanCenter.clone().add(
        new THREE.Vector3(
          Math.cos(leafYaw) * radialOffset,
          rng.range(-0.02, 0.02),
          Math.sin(leafYaw) * radialOffset
        )
      );

      // Rotate the leaf's native +Y axis (its length) to point along `dir`,
      // then roll the blade around its own length so faces vary.
      const q = new THREE.Quaternion().setFromUnitVectors(UP, dir);
      q.multiply(
        new THREE.Quaternion().setFromAxisAngle(UP, rng.range(0, Math.PI * 2))
      );
      const rotation = new THREE.Euler().setFromQuaternion(q);

      leaves.push({
        position: leafPos,
        rotation,
        scale: rng.range(0.82, 1.18),
        accent: rng.bool(0.18),
      });
    }

    branches.push({ geometry, leaves });
  }

  return branches;
}

// ============================================
// COMPONENT
// ============================================

interface ProceduralBambooProps {
  genes: BambooGenes;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  sway?: number;
}

export function ProceduralBamboo({
  genes,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  sway = 0.01,
}: ProceduralBambooProps) {
  const groupRef = useRef<THREE.Group>(null);

  const { culms, branches, leafGeometry } = useMemo(() => {
    const culmRng = new SeededRandom(genes.seed);
    const branchRng = new SeededRandom(genes.seed + 7919);

    const culms: CulmData[] = [];
    for (let i = 0; i < genes.culmCount; i++) {
      culms.push(buildCulm(genes, culmRng, i, genes.culmCount));
    }

    const branches = culms.map((culm) => buildBranchesForCulm(genes, culm, branchRng));
    const leafGeometry = createBambooLeafGeometry(genes.leafWidth, genes.leafLength);

    return { culms, branches, leafGeometry };
  }, [genes]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    // Bamboo sways subtly, mostly at the crown
    groupRef.current.rotation.z = Math.sin(t * 0.6 + genes.seed * 0.001) * sway;
    groupRef.current.rotation.x = Math.cos(t * 0.42 + genes.seed * 0.002) * sway * 0.5;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {culms.map((culm, i) => (
        <group key={`culm-${i}`}>
          <mesh geometry={culm.tubeGeometry}>
            <meshBasicMaterial color={genes.culmColor} wireframe />
          </mesh>
          {culm.nodes.map((node, n) => (
            <mesh
              key={`node-${i}-${n}`}
              position={node.position}
              scale={[node.radius, node.radius * 0.45, node.radius]}
            >
              <torusGeometry args={[1, 0.35, 4, 10]} />
              <meshBasicMaterial color={genes.nodeColor} wireframe />
            </mesh>
          ))}

          {branches[i].map((branch, b) => (
            <group key={`branch-${i}-${b}`}>
              <mesh geometry={branch.geometry}>
                <meshBasicMaterial color={genes.culmColor} wireframe />
              </mesh>
              {branch.leaves.map((leaf, l) => (
                <mesh
                  key={`leaf-${i}-${b}-${l}`}
                  geometry={leafGeometry}
                  position={leaf.position}
                  rotation={leaf.rotation}
                  scale={leaf.scale}
                >
                  <meshBasicMaterial
                    color={leaf.accent ? genes.accentColor : genes.leafColor}
                    wireframe
                    side={THREE.DoubleSide}
                  />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}
