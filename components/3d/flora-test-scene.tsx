'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SeededRandom } from '@/lib/utils/seeded-random';

export type BloomSpecies =
  | 'garden-rose'
  | 'star-lily'
  | 'cup-rose'
  | 'sun-daisy'
  | 'orchid-spike'
  | 'water-lotus';

export type ShapeType =
  | 'teardrop'
  | 'oval'
  | 'spear'
  | 'heart'
  | 'fan'
  | 'ruffle'
  | 'frond'
  | 'needle';

type FlowerVariant = {
  seed: number;
  position: [number, number, number];
  scale: number;
  species: BloomSpecies;
  color: string;
  bloom: number;
};

type LayerConfig = {
  shape: ShapeType;
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
  leafShape: ShapeType;
  leafCount: [number, number];
  stemRadius: [number, number];
};

type FloraFlowerProps = {
  seed: number;
  position: [number, number, number];
  scale: number;
  species: BloomSpecies;
  color: string;
  bloom: number;
};

type PetalInstance = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
};

function createShapeGeometry(
  shapeType: ShapeType,
  width: number,
  length: number,
  detail: number,
  depth = 0.014
): THREE.ExtrudeGeometry {
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
}

const SPECIES: Record<BloomSpecies, SpeciesConfig> = {
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

export function FloraFlower({ seed, position, scale, species, color, bloom }: FloraFlowerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const cfg = SPECIES[species];

  const flower = useMemo(() => {
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
      geom: createShapeGeometry(
        cfg.leafShape,
        rng.range(0.07, 0.13),
        rng.range(0.18, 0.33),
        14,
        0.008
      ),
    }));

    const layers = cfg.layers.map((layer, layerIndex) => {
      const count = rng.int(layer.count[0], layer.count[1]);
      const budWrapStrengthBySpecies: Record<BloomSpecies, number> = {
        'garden-rose': 1.0,
        'cup-rose': 0.78,
        'water-lotus': 0.6,
        'orchid-spike': 0.5,
        'sun-daisy': 0.34,
        'star-lily': 0.25,
      };
      const budSpeciesFactor = budWrapStrengthBySpecies[species];
      const geom = createShapeGeometry(
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

        const roll =
          wrapStrength * rng.range(0.02, 0.1) +
          budCoreFold * Math.sin(budSpiral) * THREE.MathUtils.lerp(0.1, 0.03, openness) +
          budInwardYaw * 0.03;
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
      headTilt: [
        rng.range(-0.28, 0.28),
        rng.range(0, Math.PI * 2),
        rng.range(-0.2, 0.2),
      ] as [number, number, number],
      centerGeom: new THREE.IcosahedronGeometry(rng.range(cfg.centerRadius[0], cfg.centerRadius[1]), 0),
    };
  }, [bloom, cfg, seed, species]);

  const outerColor = useMemo(() => new THREE.Color(color), [color]);
  const innerColor = useMemo(
    () => outerColor.clone().lerp(new THREE.Color('#ffffff'), cfg.innerBlend),
    [cfg.innerBlend, outerColor]
  );

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.z = Math.sin(t * 0.78 + seed * 0.001) * 0.04;
    groupRef.current.rotation.x = Math.sin(t * 0.48 + seed * 0.0007) * 0.025;
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh geometry={flower.stemGeom}>
        <meshBasicMaterial color="#6a8f66" wireframe />
      </mesh>

      {flower.leaves.map((leaf, i) => (
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

      <group position={flower.headOffset} rotation={flower.headTilt}>
        <mesh geometry={flower.centerGeom}>
          <meshBasicMaterial color={cfg.centerColor} wireframe />
        </mesh>

        {flower.layers.map((layer, layerIndex) =>
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
}

export function FlowerPatch({ seed }: { seed: number }) {
  const flowers = useMemo<FlowerVariant[]>(() => {
    const rng = new SeededRandom(seed);
    const species: BloomSpecies[] = [
      'garden-rose',
      'cup-rose',
      'water-lotus',
      'orchid-spike',
      'star-lily',
      'sun-daisy',
    ];
    const palette = [
      '#C2185B', '#D81B60',
      '#E53935', '#FF4D4D',
      '#AD1457', '#B85CFF',
    ];

    const bloomStages = [0.2, 0.88, 0.95, 1.0];

    const xSpacing = 1.15;
    const zSpacing = 1.35;
    const xStart = -((species.length - 1) * xSpacing) / 2;
    const zStart = -((bloomStages.length - 1) * zSpacing) / 2;

    return species.flatMap((sp, speciesIdx) =>
      bloomStages.map((bloom, stageIdx) => ({
        seed: rng.int(1, 1_000_000),
        position: [
          xStart + speciesIdx * xSpacing + rng.range(-0.07, 0.07),
          0,
          zStart + stageIdx * zSpacing + rng.range(-0.06, 0.06),
        ] as [number, number, number],
        scale: rng.range(0.72, 0.94),
        species: sp,
        color: rng.pick(palette),
        bloom,
      }))
    );
  }, [seed]);

  return (
    <group>
      {flowers.map((flower, i) => (
        <FloraFlower
          key={i}
          seed={flower.seed}
          position={flower.position}
          scale={flower.scale}
          species={flower.species}
          color={flower.color}
          bloom={flower.bloom}
        />
      ))}
    </group>
  );
}

const ALL_BLOOM_SPECIES: BloomSpecies[] = [
  'garden-rose',
  'star-lily',
  'cup-rose',
  'sun-daisy',
  'orchid-spike',
  'water-lotus',
];

// Wide-range palette — pinks, reds, purples, blues, oranges, yellows, whites.
export const FLOWER_PALETTE: string[] = [
  '#C2185B', // crimson pink
  '#D81B60', // magenta
  '#E53935', // poppy red
  '#FF4D4D', // coral
  '#AD1457', // berry
  '#B85CFF', // violet
  '#7E57C2', // amethyst
  '#5E35B1', // deep purple
  '#3F51B5', // indigo
  '#1E88E5', // sky blue
  '#26C6DA', // cyan
  '#26A69A', // teal
  '#FB8C00', // orange
  '#FFB300', // amber
  '#FDD835', // butter yellow
  '#F4F1B5', // cream
  '#FFFFFF', // white
  '#F8BBD0', // baby pink
  '#FF80AB', // hot pink
];

export function CompactFlowerCluster({ seed }: { seed: number }) {
  const flowers = useMemo<FlowerVariant[]>(() => {
    const rng = new SeededRandom(seed);

    // Pick a fresh subset of 5 species each regenerate, then shuffle.
    const speciesPool = [...ALL_BLOOM_SPECIES];
    for (let i = speciesPool.length - 1; i > 0; i--) {
      const j = rng.int(0, i);
      [speciesPool[i], speciesPool[j]] = [speciesPool[j], speciesPool[i]];
    }
    const species = speciesPool.slice(0, 5);

    const ring = species.length;
    const radius = 0.7;

    return species.map((sp, idx) => {
      const angle = (idx / ring) * Math.PI * 2 + rng.range(-0.08, 0.08);
      return {
        seed: rng.int(1, 1_000_000),
        position: [
          Math.cos(angle) * radius + rng.range(-0.05, 0.05),
          0,
          Math.sin(angle) * radius + rng.range(-0.05, 0.05),
        ] as [number, number, number],
        scale: rng.range(0.82, 1.08),
        species: sp,
        color: rng.pick(FLOWER_PALETTE),
        bloom: rng.range(0.85, 1.0),
      };
    });
  }, [seed]);

  return (
    <group>
      {flowers.map((flower, i) => (
        <FloraFlower
          key={i}
          seed={flower.seed}
          position={flower.position}
          scale={flower.scale}
          species={flower.species}
          color={flower.color}
          bloom={flower.bloom}
        />
      ))}
    </group>
  );
}
