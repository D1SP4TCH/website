'use client';

/**
 * Garden Backdrop
 * Layered environment behind the main garden:
 *   1. SKY_GRADIENT   – CSS linear-gradient applied to the canvas container.
 *                       Lives outside WebGL so it's invariant to camera.
 *   2. RollingHills   – three wireframe ridge rings wrapping the scene.
 *   3. DistantTreeLine – ring of small procedural bamboo clusters.
 *
 * Hills + trees sit within / just past the fog falloff so the horizon
 * fades into the sky gradient for a painterly shan-shui effect.
 */

import { useMemo } from 'react';
import * as THREE from 'three';
import { ProceduralBamboo, makeBambooGenes } from './procedural-bamboo';
import { SeededRandom } from '@/lib/utils/seeded-random';

// ============================================
// SKY GRADIENT (CSS — applied to canvas container)
// ============================================

interface HillLayer {
  radius: number;
  baseHeight: number;
  amplitude: number;
  segments: number;
  seed: number;
  color: string;
  opacity: number;
}

function buildHillGeometry(layer: HillLayer): THREE.BufferGeometry {
  const rng = new SeededRandom(layer.seed);
  // Three octaves of sine noise around the ring for soft varied peaks.
  const octaves = [
    { freq: 2, phase: rng.range(0, Math.PI * 2), amp: 0.55 },
    { freq: 5, phase: rng.range(0, Math.PI * 2), amp: 0.3 },
    { freq: 11, phase: rng.range(0, Math.PI * 2), amp: 0.15 },
  ];

  const positions: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= layer.segments; i++) {
    const angle = (i / layer.segments) * Math.PI * 2;
    let noise = 0;
    for (const o of octaves) noise += Math.sin(angle * o.freq + o.phase) * o.amp;
    // remap [-1..1] → [0..1]
    const h = layer.baseHeight + layer.amplitude * (noise * 0.5 + 0.5);
    const r = layer.radius + Math.sin(angle * 3 + layer.seed) * 0.25;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    positions.push(x, 0, z, x, h, z);
  }

  for (let i = 0; i < layer.segments; i++) {
    const a = i * 2;
    const b = i * 2 + 1;
    const c = (i + 1) * 2;
    const d = (i + 1) * 2 + 1;
    indices.push(a, c, b, b, c, d);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

const HILL_LAYERS: HillLayer[] = [
  { radius: 28, baseHeight: 1.6, amplitude: 2.0, segments: 90, seed: 101, color: '#7E8C86', opacity: 0.85 },
  { radius: 34, baseHeight: 3.0, amplitude: 2.6, segments: 110, seed: 202, color: '#9DA8A3', opacity: 0.75 },
  { radius: 40, baseHeight: 4.2, amplitude: 2.4, segments: 130, seed: 303, color: '#BAC0BB', opacity: 0.6 },
];

const RollingHills = () => {
  const geometries = useMemo(() => HILL_LAYERS.map(buildHillGeometry), []);

  return (
    <group>
      {HILL_LAYERS.map((layer, i) => (
        <mesh key={i} geometry={geometries[i]} renderOrder={-500 + i}>
          <meshBasicMaterial
            color={layer.color}
            wireframe
            transparent
            opacity={layer.opacity}
          />
        </mesh>
      ))}
    </group>
  );
};

// ============================================
// DISTANT TREE LINE (simplified bamboo)
// ============================================

const DistantTreeLine = () => {
  const clusters = useMemo(() => {
    const rng = new SeededRandom(9999);
    const count = 12;
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2 + rng.range(-0.18, 0.18);
      const radius = 23.5 + rng.range(-1.0, 1.5);
      const scale = 0.7 + rng.range(0, 0.35);
      const seed = 8000 + i * 37;
      // Slim, muted distant bamboo — fewer branches/leaves for perf.
      const genes = makeBambooGenes(seed, {
        culmCount: rng.int(2, 3),
        height: rng.range(3.8, 5.4),
        branchesPerCulm: rng.int(2, 3),
        leavesPerBranch: rng.int(3, 4),
        culmColor: '#6F7E5A',
        nodeColor: '#4C5A38',
        leafColor: '#82A070',
        accentColor: '#9AB585',
      });
      return {
        position: [
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius,
        ] as [number, number, number],
        rotation: [0, rng.range(0, Math.PI * 2), 0] as [number, number, number],
        scale,
        genes,
      };
    });
  }, []);

  return (
    <group>
      {clusters.map((c, i) => (
        <ProceduralBamboo
          key={i}
          genes={c.genes}
          position={c.position}
          rotation={c.rotation}
          scale={c.scale}
          sway={0.012}
        />
      ))}
    </group>
  );
};

// ============================================
// COMBINED BACKDROP
// ============================================

/**
 * Horizon color — match fog to this for a seamless fade between the
 * hills/trees and the CSS sky gradient.
 */
export const BACKDROP_HORIZON_COLOR = '#EADFCC';

/** Zenith color at the top of the CSS sky gradient. */
export const BACKDROP_ZENITH_COLOR = '#CFBEB4';

/**
 * CSS linear-gradient string suitable for the canvas container's `background`
 * style. Bottom → top, matching the in-scene horizon color so hills fade
 * smoothly into the sky.
 */
export const SKY_GRADIENT_CSS = `linear-gradient(to top, ${BACKDROP_HORIZON_COLOR} 0%, ${BACKDROP_HORIZON_COLOR} 35%, #DDCCBE 65%, ${BACKDROP_ZENITH_COLOR} 100%)`;

export const GardenBackdrop = () => (
  <>
    <RollingHills />
    <DistantTreeLine />
  </>
);
