'use client';

import { useMemo, useRef } from 'react';
import type { JSX } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { SeededRandom } from '@/lib/utils/seeded-random';
import type { PlantGenes } from '@/lib/data/garden-portfolio';
import {
  NOISE_FUNCTIONS,
  PAINTERLY_PALETTES,
} from '@/lib/shaders/painterly-shaders';

// ============================================
// FLOWER SHADER
// ============================================

const FlowerPetalMaterial = shaderMaterial(
  {
    uColor: new THREE.Color('#E8A0B0'),
    uCenterColor: new THREE.Color('#FFD700'),
    uTime: 0,
    uStylized: 0.0, // 0=painterly, 1=crystalline Blender style
  },
  // Vertex - gentle sway
  `
    uniform float uTime;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    
    ${NOISE_FUNCTIONS}
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      
      vec3 pos = position;
      
      // Gentle petal sway
      float sway = sin(uTime * 1.2 + pos.x * 2.0) * 0.02;
      pos.x += sway;
      pos.z += sway * 0.5;
      
      vec4 worldPos = modelMatrix * vec4(pos, 1.0);
      vWorldPosition = worldPos.xyz;
      
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  // Fragment - stylized petal shading (Blender-inspired)
  `
    uniform vec3 uColor;
    uniform vec3 uCenterColor;
    uniform float uTime;
    uniform float uStylized;
    
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    
    ${NOISE_FUNCTIONS}
    
    void main() {
      vec3 lightDir = normalize(vec3(12.0, 18.0, 8.0) - vWorldPosition);
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float NdotL = dot(vNormal, lightDir);
      
      // Base color with gradient
      float dist = length(vPosition.xz);
      float centerBlend = smoothstep(0.3, 0.0, dist);
      vec3 baseColor = mix(uColor, uCenterColor, centerBlend);
      
      vec3 color;
      
      if (uStylized > 0.5) {
        // ====== BLENDER STYLIZED MODE ======
        
        // ColorRamp shading - discrete bands
        float lightValue = NdotL * 0.5 + 0.5;
        vec3 shadowColor = baseColor * 0.5;
        vec3 midColor = baseColor * 0.9;
        vec3 highlightColor = baseColor * 1.3 + vec3(0.2);
        color = colorRampStylized(lightValue, shadowColor, midColor, highlightColor);
        
        // Crystalline pattern
        vec2 uv = vPosition.xy * 0.8;
        vec3 crystal = crystallinePattern(uv, 8.0, uTime);
        
        // Add white streaks
        color = mix(color, vec3(1.0), crystal.z * 0.6);
        
        // Overlay blend for faceted look
        vec3 facets = vec3(crystal.x);
        color = overlayBlend(color, facets, 0.4);
        
        // Strong rim light
        float rim = fresnelEffect(vNormal, viewDir, 2.5);
        color += vec3(0.8, 0.9, 1.0) * rim * 0.8;
        
      } else {
        // ====== PAINTERLY MODE ======
        
        float light = smoothstep(-0.2, 0.8, NdotL) * 0.5 + 0.5;
        color = baseColor * light;
        
        // Enhanced vein pattern
        vec2 uv = vPosition.xy * 0.5;
        float mainVein = lineDistanceField(uv, vec2(0.0, -0.5), vec2(0.0, 0.5));
        float vein1 = lineDistanceField(uv, vec2(0.0, 0.0), vec2(0.3, 0.3));
        float vein2 = lineDistanceField(uv, vec2(0.0, 0.0), vec2(-0.3, 0.3));
        float vein3 = lineDistanceField(uv, vec2(0.0, 0.0), vec2(0.2, -0.2));
        float vein4 = lineDistanceField(uv, vec2(0.0, 0.0), vec2(-0.2, -0.2));
        
        float veins = smoothstep(0.015, 0.0, mainVein) * 0.08;
        veins += smoothstep(0.01, 0.0, min(min(vein1, vein2), min(vein3, vein4))) * 0.05;
        veins *= (0.8 + snoise(vWorldPosition * 5.0) * 0.2);
        color += veins * uColor * 0.3;
        
        // Subsurface
        float backlight = max(0.0, dot(-vNormal, lightDir)) * 0.3;
        color += uColor * backlight;
        
        // Subtle rim
        float rim = fresnelEffect(vNormal, viewDir, 3.0);
        color += vec3(1.0) * rim * 0.2;
      }
      
      float alpha = uStylized > 0.5 ? 0.9 : 0.95;
      gl_FragColor = vec4(color, alpha);
    }
  `
);

// ============================================
// GRASS BLADE SHADER
// ============================================

const GrassBladeMaterial = shaderMaterial(
  {
    uColor: new THREE.Color('#7BA05B'),
    uTipColor: new THREE.Color('#A8C686'),
    uTime: 0,
    uWindStrength: 0.1,
  },
  // Vertex - grass sway
  `
    uniform float uTime;
    uniform float uWindStrength;
    
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    
    ${NOISE_FUNCTIONS}
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      vUv = uv;
      
      vec3 pos = position;
      
      // Height-based sway (more at tip)
      float heightFactor = smoothstep(0.0, 1.0, pos.y);
      heightFactor = heightFactor * heightFactor;
      
      float windNoise = snoise(vec3(pos.xz * 0.5, uTime * 0.8));
      float wind = sin(uTime * 2.5 + pos.x * 0.5 + windNoise) * uWindStrength * heightFactor;
      
      pos.x += wind;
      pos.z += wind * 0.4;
      
      // Slight bend
      pos.x += heightFactor * 0.1;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment - grass blade shading
  `
    uniform vec3 uColor;
    uniform vec3 uTipColor;
    uniform float uTime;
    
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    
    void main() {
      vec3 lightDir = normalize(vec3(12.0, 18.0, 8.0));
      float NdotL = dot(vNormal, lightDir);
      float light = NdotL * 0.4 + 0.6;
      
      // Gradient from base to tip
      float tipBlend = smoothstep(0.0, 1.0, vPosition.y);
      vec3 color = mix(uColor * 0.8, uTipColor, tipBlend);
      
      color *= light;
      
      // Translucency
      float backlight = max(0.0, dot(-vNormal, lightDir)) * 0.2;
      color += uTipColor * backlight;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
);

extend({ FlowerPetalMaterial, GrassBladeMaterial });

// Type declarations
declare module '@react-three/fiber' {
  interface ThreeElements {
    flowerPetalMaterial: JSX.IntrinsicElements['shaderMaterial'] & {
      uColor?: THREE.Color;
      uCenterColor?: THREE.Color;
      uTime?: number;
      uStylized?: number;
    };
    grassBladeMaterial: JSX.IntrinsicElements['shaderMaterial'] & {
      uColor?: THREE.Color;
      uTipColor?: THREE.Color;
      uTime?: number;
      uWindStrength?: number;
    };
  }
}

// ============================================
// PROCEDURAL FLOWER
// ============================================

// Test-page petal geometry (kept identical for visual parity)
const createVolumetricPetalGeometry = (
  width: number,
  length: number,
  detail: number,
  depth = 0.014
) => {
  const shape = new THREE.Shape();

  shape.moveTo(0, 0);
  shape.bezierCurveTo(width * 0.85, length * 0.2, width * 0.92, length * 0.62, 0, length);
  shape.bezierCurveTo(-width * 0.92, length * 0.62, -width * 0.85, length * 0.2, 0, 0);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    steps: 1,
    bevelEnabled: true,
    bevelThickness: depth * 0.45,
    bevelSize: width * 0.06,
    bevelSegments: 1,
    curveSegments: detail,
  });

  geometry.translate(0, 0, -depth * 0.5);
  return geometry;
};

// Compact leaf shape so stem leaves stay understated in flower clusters
const createStemLeafGeometry = () => {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.22, 0.08, 0.3, 0.34, 0.0, 0.66);
  shape.bezierCurveTo(-0.3, 0.34, -0.22, 0.08, 0, 0);
  return new THREE.ShapeGeometry(shape, 12);
};

interface FlowerProps {
  position: THREE.Vector3;
  genes: PlantGenes;
  petalCount?: number;
  petalColor?: string;
  scale?: number;
  variationSeed?: number;
  stylized?: boolean; // Enable Blender-style crystalline look
  noRotation?: boolean; // Disable rotation for decorative flowers
  species?: GardenBloomSpecies;
  bloom?: number;
}

export type GardenBloomSpecies = 'garden-rose' | 'star-lily' | 'cup-rose' | 'sun-daisy' | 'orchid-spike' | 'water-lotus';
type FlowerShapeType = 'teardrop' | 'oval' | 'spear' | 'heart' | 'fan' | 'ruffle' | 'frond' | 'needle';

type LayerConfig = {
  shape: FlowerShapeType;
  count: [number, number];
  width: [number, number];
  length: [number, number];
  depth: number;
  tilt: [number, number];
  radial: [number, number];
  size: [number, number];
};

type SpeciesConfig = {
  layers: LayerConfig[];
  centerColor: string;
  centerRadius: [number, number];
  innerBlend: number;
  leafShape: FlowerShapeType;
  leafCount: [number, number];
  stemRadius: [number, number];
};

type PetalInstance = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
};

const createGardenFlowerShapeGeometry = (
  shapeType: FlowerShapeType,
  width: number,
  length: number,
  detail: number,
  depth = 0.014
): THREE.ExtrudeGeometry => {
  const shape = new THREE.Shape();

  if (shapeType === 'oval') {
    shape.moveTo(0, 0);
    shape.bezierCurveTo(width * 1.0, length * 0.18, width * 1.1, length * 0.68, 0, length);
    shape.bezierCurveTo(-width * 1.1, length * 0.68, -width * 1.0, length * 0.18, 0, 0);
  } else if (shapeType === 'spear') {
    shape.moveTo(0, 0);
    shape.bezierCurveTo(width * 0.48, length * 0.2, width * 0.35, length * 0.8, 0, length);
    shape.bezierCurveTo(-width * 0.35, length * 0.8, -width * 0.48, length * 0.2, 0, 0);
  } else if (shapeType === 'heart') {
    shape.moveTo(0, 0);
    shape.bezierCurveTo(width * 1.2, length * 0.14, width * 0.95, length * 0.54, 0, length);
    shape.bezierCurveTo(-width * 0.95, length * 0.54, -width * 1.2, length * 0.14, 0, 0);
  } else if (shapeType === 'fan') {
    shape.moveTo(0, 0);
    shape.bezierCurveTo(width * 1.28, length * 0.26, width * 1.12, length * 0.82, 0, length);
    shape.bezierCurveTo(-width * 1.12, length * 0.82, -width * 1.28, length * 0.26, 0, 0);
  } else if (shapeType === 'ruffle') {
    shape.moveTo(0, 0);
    shape.bezierCurveTo(width * 1.12, length * 0.16, width * 1.22, length * 0.56, width * 0.5, length * 0.86);
    shape.bezierCurveTo(width * 0.15, length * 0.95, width * 0.08, length * 0.98, 0, length);
    shape.bezierCurveTo(-width * 0.08, length * 0.98, -width * 0.15, length * 0.95, -width * 0.5, length * 0.86);
    shape.bezierCurveTo(-width * 1.22, length * 0.56, -width * 1.12, length * 0.16, 0, 0);
  } else if (shapeType === 'frond') {
    shape.moveTo(0, 0);
    shape.bezierCurveTo(width * 0.78, length * 0.16, width * 0.96, length * 0.76, width * 0.2, length);
    shape.bezierCurveTo(-width * 0.28, length * 0.84, -width * 0.58, length * 0.26, 0, 0);
  } else if (shapeType === 'needle') {
    shape.moveTo(0, 0);
    shape.bezierCurveTo(width * 0.3, length * 0.2, width * 0.25, length * 0.72, 0, length);
    shape.bezierCurveTo(-width * 0.25, length * 0.72, -width * 0.3, length * 0.2, 0, 0);
  } else {
    shape.moveTo(0, 0);
    shape.bezierCurveTo(width * 0.85, length * 0.2, width * 0.92, length * 0.62, 0, length);
    shape.bezierCurveTo(-width * 0.92, length * 0.62, -width * 0.85, length * 0.2, 0, 0);
  }

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    steps: 1,
    bevelEnabled: false,
    curveSegments: Math.max(6, Math.floor(detail * 0.45)),
  });
  geometry.translate(0, 0, -depth * 0.5);
  return geometry;
};

const GARDEN_SPECIES: Record<GardenBloomSpecies, SpeciesConfig> = {
  'garden-rose': {
    layers: [
      { shape: 'ruffle', count: [7, 10], width: [0.085, 0.11], length: [0.12, 0.17], depth: 0.014, tilt: [0.01, 0.08], radial: [0.0, 0.015], size: [0.7, 0.9] },
      { shape: 'heart', count: [8, 12], width: [0.1, 0.13], length: [0.17, 0.24], depth: 0.012, tilt: [0.08, 0.17], radial: [0.02, 0.06], size: [0.85, 1.02] },
      { shape: 'oval', count: [6, 9], width: [0.11, 0.14], length: [0.22, 0.3], depth: 0.01, tilt: [0.14, 0.26], radial: [0.06, 0.12], size: [0.98, 1.14] },
    ],
    centerColor: '#E7C978',
    centerRadius: [0.028, 0.05],
    innerBlend: 0.22,
    leafShape: 'oval',
    leafCount: [2, 3],
    stemRadius: [0.013, 0.019],
  },
  'star-lily': {
    layers: [
      { shape: 'spear', count: [9, 14], width: [0.08, 0.12], length: [0.34, 0.46], depth: 0.013, tilt: [0.28, 0.44], radial: [0.02, 0.06], size: [0.9, 1.2] },
      { shape: 'needle', count: [7, 11], width: [0.05, 0.08], length: [0.25, 0.34], depth: 0.01, tilt: [0.14, 0.26], radial: [0.0, 0.03], size: [0.75, 0.95] },
    ],
    centerColor: '#EED37D',
    centerRadius: [0.055, 0.085],
    innerBlend: 0.35,
    leafShape: 'needle',
    leafCount: [2, 4],
    stemRadius: [0.012, 0.018],
  },
  'cup-rose': {
    layers: [
      { shape: 'ruffle', count: [6, 9], width: [0.11, 0.14], length: [0.22, 0.32], depth: 0.018, tilt: [0.04, 0.12], radial: [0.01, 0.03], size: [0.95, 1.1] },
      { shape: 'heart', count: [7, 12], width: [0.08, 0.12], length: [0.2, 0.28], depth: 0.014, tilt: [0.08, 0.2], radial: [0.04, 0.08], size: [0.82, 1.0] },
      { shape: 'teardrop', count: [10, 14], width: [0.06, 0.09], length: [0.14, 0.2], depth: 0.01, tilt: [0.1, 0.24], radial: [0.08, 0.14], size: [0.72, 0.9] },
    ],
    centerColor: '#F0D488',
    centerRadius: [0.04, 0.07],
    innerBlend: 0.4,
    leafShape: 'oval',
    leafCount: [2, 3],
    stemRadius: [0.014, 0.02],
  },
  'sun-daisy': {
    layers: [
      { shape: 'teardrop', count: [11, 16], width: [0.09, 0.13], length: [0.3, 0.42], depth: 0.016, tilt: [0.2, 0.34], radial: [0.03, 0.07], size: [0.9, 1.15] },
      { shape: 'fan', count: [8, 12], width: [0.08, 0.11], length: [0.18, 0.28], depth: 0.012, tilt: [0.08, 0.2], radial: [0.01, 0.03], size: [0.76, 0.94] },
    ],
    centerColor: '#E8C76D',
    centerRadius: [0.07, 0.1],
    innerBlend: 0.28,
    leafShape: 'frond',
    leafCount: [2, 5],
    stemRadius: [0.013, 0.019],
  },
  'orchid-spike': {
    layers: [
      { shape: 'heart', count: [5, 8], width: [0.1, 0.13], length: [0.18, 0.26], depth: 0.014, tilt: [0.18, 0.32], radial: [0.03, 0.06], size: [0.9, 1.15] },
      { shape: 'oval', count: [4, 7], width: [0.07, 0.1], length: [0.14, 0.2], depth: 0.011, tilt: [0.08, 0.2], radial: [0.0, 0.025], size: [0.7, 0.92] },
    ],
    centerColor: '#E7CC82',
    centerRadius: [0.045, 0.07],
    innerBlend: 0.45,
    leafShape: 'spear',
    leafCount: [3, 5],
    stemRadius: [0.01, 0.016],
  },
  'water-lotus': {
    layers: [
      { shape: 'fan', count: [8, 12], width: [0.1, 0.14], length: [0.24, 0.34], depth: 0.014, tilt: [0.12, 0.24], radial: [0.05, 0.1], size: [0.9, 1.1] },
      { shape: 'oval', count: [10, 14], width: [0.08, 0.11], length: [0.18, 0.26], depth: 0.011, tilt: [0.08, 0.18], radial: [0.02, 0.06], size: [0.78, 0.96] },
      { shape: 'teardrop', count: [6, 10], width: [0.07, 0.1], length: [0.14, 0.2], depth: 0.01, tilt: [0.06, 0.14], radial: [0.0, 0.02], size: [0.65, 0.82] },
    ],
    centerColor: '#EACF75',
    centerRadius: [0.06, 0.09],
    innerBlend: 0.3,
    leafShape: 'oval',
    leafCount: [2, 4],
    stemRadius: [0.012, 0.018],
  },
};

export const ProceduralFlower = ({
  position,
  genes,
  petalCount = 5,
  petalColor,
  scale = 1,
  variationSeed,
  stylized = false,
  noRotation = false,
  species = 'garden-rose',
  bloom = 0.88,
}: FlowerProps) => {
  const groupRef = useRef<THREE.Group>(null);
  void petalCount;
  void stylized;
  const cfg = GARDEN_SPECIES[species];

  const flowerData = useMemo(() => {
    const positionHash = Math.floor((position.x * 997 + position.y * 211 + position.z * 431) * 1000);
    const seed = genes.seed + 5000 + (variationSeed ?? positionHash);
    const rng = new SeededRandom(seed);
    const stemHeight = rng.range(0.55, 1.15);
    const swayX = rng.range(-0.1, 0.1);
    const swayZ = rng.range(-0.1, 0.1);

    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(swayX * 0.2, stemHeight * 0.22, swayZ * 0.2),
      new THREE.Vector3(swayX * 0.55, stemHeight * 0.56, swayZ * 0.55),
      new THREE.Vector3(swayX * 0.9, stemHeight * 0.84, swayZ * 0.9),
      new THREE.Vector3(swayX, stemHeight, swayZ),
    ]);

    const stemGeom = new THREE.TubeGeometry(
      stemCurve,
      24,
      rng.range(cfg.stemRadius[0], cfg.stemRadius[1]),
      7,
      false
    );

    const leaves = Array.from({ length: rng.int(cfg.leafCount[0], cfg.leafCount[1]) }).map((_, i) => ({
      y: stemHeight * rng.range(0.2, 0.78),
      angle: i * Math.PI + rng.range(-0.5, 0.5),
      width: rng.range(0.75, 1.2),
      length: rng.range(0.7, 1.18),
      roll: rng.range(-0.22, 0.22),
      geom: createGardenFlowerShapeGeometry(
        cfg.leafShape,
        rng.range(0.07, 0.13),
        rng.range(0.18, 0.33),
        14,
        0.008
      ),
    }));

    const layers = cfg.layers.map((layer, layerIndex) => {
      const count = rng.int(layer.count[0], layer.count[1]);
      const budWrapStrengthBySpecies: Record<GardenBloomSpecies, number> = {
        'garden-rose': 1.0,
        'cup-rose': 0.78,
        'water-lotus': 0.6,
        'orchid-spike': 0.5,
        'sun-daisy': 0.34,
        'star-lily': 0.25,
      };
      const budSpeciesFactor = budWrapStrengthBySpecies[species];
      const geom = createGardenFlowerShapeGeometry(
        layer.shape,
        rng.range(layer.width[0], layer.width[1]),
        rng.range(layer.length[0], layer.length[1]),
        22 - layerIndex * 3,
        layer.depth
      );

      const petals = Array.from({ length: count }).map<PetalInstance>((_, i) => {
        const openFactor = THREE.MathUtils.clamp(bloom, 0, 1);
        const openness = openFactor;
        const wrapStrength = 1 - openness;
        const budCoreShape =
          Math.max(0, 1 - layerIndex * (0.5 + (1 - budSpeciesFactor) * 0.25)) * budSpeciesFactor;
        const budCoreFold = budCoreShape * wrapStrength;
        const budSpiral = (i / count) * Math.PI * 2;
        const budInwardYaw = budCoreFold * THREE.MathUtils.lerp(1.1, 0.2, openness);

        const angle = (i / count) * Math.PI * 2 + rng.range(-0.025, 0.025);
        const radial = rng.range(layer.radial[0], layer.radial[1]) * (0.03 + openness * 0.9);
        const height = layerIndex * 0.003 * (0.15 + openness * 1.0);
        const size = rng.range(layer.size[0], layer.size[1]) * (0.72 + openness * 0.34);

        const inwardDir = new THREE.Vector3(-Math.cos(angle), 0, -Math.sin(angle)).normalize();
        const outwardDir = inwardDir.clone().multiplyScalar(-1);
        const fullBloomBlend = THREE.MathUtils.smoothstep(openness, 0.74, 1.0) * 0.5;
        const zAxis = inwardDir
          .clone()
          .lerp(outwardDir, fullBloomBlend)
          .add(new THREE.Vector3(0, THREE.MathUtils.lerp(0.02, 0.12, openness), 0))
          .normalize();

        const yTarget = outwardDir
          .clone()
          .multiplyScalar(THREE.MathUtils.lerp(0.06, 1.55, openness))
          .add(new THREE.Vector3(0, THREE.MathUtils.lerp(1.0, 0.32, openness), 0));
        const yProjected = yTarget.sub(zAxis.clone().multiplyScalar(yTarget.dot(zAxis)));
        let yAxis = yProjected.lengthSq() > 1e-6
          ? yProjected.normalize()
          : new THREE.Vector3(0, 1, 0);
        if (yAxis.y < 0.12) {
          const upProjected = new THREE.Vector3(0, 1, 0)
            .sub(zAxis.clone().multiplyScalar(zAxis.y))
            .normalize();
          yAxis = yAxis.clone().lerp(upProjected, 0.5).normalize();
        }
        const xAxis = new THREE.Vector3().crossVectors(yAxis, zAxis).normalize();
        const correctedYAxis = new THREE.Vector3().crossVectors(zAxis, xAxis).normalize();

        const basis = new THREE.Matrix4().makeBasis(xAxis, correctedYAxis, zAxis);
        const q = new THREE.Quaternion().setFromRotationMatrix(basis);
        const roll = (wrapStrength * rng.range(0.02, 0.1))
          + (budCoreFold * Math.sin(budSpiral) * THREE.MathUtils.lerp(0.1, 0.03, openness))
          + (budInwardYaw * 0.03);
        q.multiply(new THREE.Quaternion().setFromAxisAngle(zAxis, roll));
        const e = new THREE.Euler().setFromQuaternion(q);

        return {
          position: [Math.cos(angle) * radial, height, Math.sin(angle) * radial],
          rotation: [e.x, e.y, e.z],
          scale: [size, size, 1],
        };
      });

      return {
        edgeGeom: new THREE.EdgesGeometry(geom, 24),
        petals,
      };
    });

    return {
      stemGeom,
      leaves,
      layers,
      headOffset: [swayX, stemHeight, swayZ] as [number, number, number],
      headTilt: [rng.range(-0.28, 0.28), rng.range(0, Math.PI * 2), rng.range(-0.2, 0.2)] as [number, number, number],
      centerGeom: new THREE.IcosahedronGeometry(rng.range(cfg.centerRadius[0], cfg.centerRadius[1]), 0),
    };
  }, [bloom, cfg, genes.seed, position.x, position.y, position.z, species, variationSeed]);

  const outerColor = useMemo(() => new THREE.Color(petalColor || '#D81B60'), [petalColor]);
  const innerColor = useMemo(
    () => outerColor.clone().lerp(new THREE.Color('#ffffff'), cfg.innerBlend),
    [cfg.innerBlend, outerColor]
  );

  useFrame((state) => {
    if (!groupRef.current || noRotation) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.z = Math.sin(t * 0.78 + genes.seed * 0.001) * 0.04;
    groupRef.current.rotation.x = Math.sin(t * 0.48 + genes.seed * 0.0007) * 0.025;
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh geometry={flowerData.stemGeom}>
        <meshBasicMaterial color="#6a8f66" wireframe />
      </mesh>

      {flowerData.leaves.map((leaf, i) => (
        <mesh
          key={`leaf-${i}`}
          geometry={leaf.geom}
          position={[Math.cos(leaf.angle) * 0.05, leaf.y, Math.sin(leaf.angle) * 0.05]}
          rotation={[Math.PI / 2 - 0.22, leaf.angle, leaf.roll]}
          scale={[leaf.width * 0.14, leaf.length * 0.2, 1]}
        >
          <meshBasicMaterial color="#82a071" wireframe side={THREE.DoubleSide} />
        </mesh>
      ))}

      <group position={flowerData.headOffset} rotation={flowerData.headTilt}>
        <mesh geometry={flowerData.centerGeom}>
          <meshBasicMaterial color={cfg.centerColor} wireframe />
        </mesh>

        {flowerData.layers.map((layer, layerIndex) =>
          layer.petals.map((petal, petalIndex) => (
            <lineSegments
              key={`layer-${layerIndex}-petal-${petalIndex}`}
              geometry={layer.edgeGeom}
              position={petal.position}
              rotation={petal.rotation}
              scale={petal.scale}
            >
              <lineBasicMaterial color={layerIndex === 0 ? outerColor : innerColor} />
            </lineSegments>
          ))
        )}
      </group>
    </group>
  );
};

// ============================================
// PROCEDURAL GRASS CLUSTER
// ============================================

interface GrassClusterProps {
  position: [number, number, number];
  genes: PlantGenes;
  bladeCount?: number;
}

export const ProceduralGrassCluster = ({ 
  position, 
  genes, 
  bladeCount = 12 
}: GrassClusterProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const rng = useMemo(() => new SeededRandom(genes.seed + 3000), [genes.seed]);
  
  const blades = useMemo(() => {
    return Array.from({ length: bladeCount }).map((_, i) => {
      const angle = rng.range(0, Math.PI * 2);
      const dist = rng.range(0, 0.15);
      const height = 0.2 + rng.range(0, 0.25);
      const lean = rng.range(-0.3, 0.3);
      const twist = rng.range(-0.2, 0.2);
      
      return {
        position: [Math.cos(angle) * dist, 0, Math.sin(angle) * dist] as [number, number, number],
        height,
        rotation: [lean, rng.range(0, Math.PI * 2), twist] as [number, number, number],
        width: 0.015 + rng.range(0, 0.01),
      };
    });
  }, [bladeCount, rng]);
  
  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });
  
  return (
    <group ref={groupRef} position={position}>
      {blades.map((blade, i) => (
        <mesh
          key={i}
          position={[blade.position[0], blade.height * 0.5, blade.position[2]]}
          rotation={blade.rotation}
        >
          <planeGeometry args={[blade.width, blade.height, 1, 1]} />
          <meshBasicMaterial
            color={genes.leafColor || '#7BA05B'}
            wireframe
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

// ============================================
// GROUND COVER (small scattered plants)
// ============================================

interface GroundCoverProps {
  genes: PlantGenes;
  radius?: number;
  density?: number;
}

export const GroundCover = ({ genes, radius = 0.5, density = 10 }: GroundCoverProps) => {
  const elements = useMemo(() => {
    const rng = new SeededRandom(genes.seed + 4000);
    const items: Array<{
      type: 'grass' | 'flower' | 'pebble';
      position: [number, number, number];
      scale: number;
      color: string;
      rotation: number;
    }> = [];
    
    for (let i = 0; i < density; i++) {
      const angle = rng.range(0, Math.PI * 2);
      const dist = rng.range(0, radius);
      const type = rng.pick(['grass', 'grass', 'grass', 'flower', 'pebble'] as const);
      
      items.push({
        type,
        position: [
          Math.cos(angle) * dist,
          0,
          Math.sin(angle) * dist
        ],
        scale: rng.range(0.5, 1.0),
        color: type === 'flower' 
          ? rng.pick(['#FFB6C1', '#FFFACD', '#E6E6FA', '#98FB98'])
          : genes.leafColor,
        rotation: rng.range(0, Math.PI),
      });
    }
    
    return items;
  }, [genes, radius, density]);
  
  return (
    <group>
      {elements.map((el, i) => {
        if (el.type === 'grass') {
          return (
            <ProceduralGrassCluster
              key={i}
              position={el.position}
              genes={genes}
              bladeCount={5}
            />
          );
        }
        if (el.type === 'flower') {
          return (
            <ProceduralFlower
              key={i}
              position={new THREE.Vector3(...el.position)}
              genes={genes}
              petalCount={4}
              petalColor={el.color}
              scale={el.scale * 0.5}
              stylized={true} // Enable Blender-style look
            />
          );
        }
        // Pebble
        return (
          <mesh
            key={i}
            position={el.position}
            scale={[0.03 * el.scale, 0.015 * el.scale, 0.025 * el.scale]}
            rotation={[0, el.rotation, 0]}
          >
            <dodecahedronGeometry args={[1, 0]} />
            <meshBasicMaterial color="#8B8075" wireframe />
          </mesh>
        );
      })}
    </group>
  );
};

