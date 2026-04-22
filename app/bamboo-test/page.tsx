'use client';

import { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { SeededRandom } from '@/lib/utils/seeded-random';
import { ProceduralBamboo, makeBambooGenes, BAMBOO_DEFAULTS } from '@/components/3d/procedural-bamboo';

type GroveVariant = {
  seed: number;
  position: [number, number, number];
  culmCount: number;
  height: number;
  colorPreset: {
    culmColor: string;
    nodeColor: string;
    leafColor: string;
    accentColor: string;
  };
};

const COLOR_PRESETS = [
  {
    // Classic green bamboo
    culmColor: '#8FA368',
    nodeColor: '#5F6E44',
    leafColor: '#9DB67A',
    accentColor: '#C7D89F',
  },
  {
    // Golden bamboo
    culmColor: '#C9B264',
    nodeColor: '#7A6A36',
    leafColor: '#A9B368',
    accentColor: '#E2D58A',
  },
  {
    // Black bamboo (moso-inspired)
    culmColor: '#3E3A33',
    nodeColor: '#1E1B16',
    leafColor: '#7A8E63',
    accentColor: '#B8C49A',
  },
  {
    // Jade / new growth
    culmColor: '#A8C48B',
    nodeColor: '#6A8556',
    leafColor: '#B7D198',
    accentColor: '#DDEBB8',
  },
];

function BambooGrid({ seed }: { seed: number }) {
  const groves = useMemo<GroveVariant[]>(() => {
    const rng = new SeededRandom(seed);
    const cols = COLOR_PRESETS.length;
    const rows = 2;
    const xSpacing = 3.2;
    const zSpacing = 3.2;
    const xStart = -((cols - 1) * xSpacing) / 2;
    const zStart = -((rows - 1) * zSpacing) / 2;

    const items: GroveVariant[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        items.push({
          seed: rng.int(1, 1_000_000),
          position: [xStart + c * xSpacing, 0, zStart + r * zSpacing],
          culmCount: 2 + r * 2 + rng.int(0, 1),
          height: r === 0 ? rng.range(2.8, 3.6) : rng.range(4.0, 5.0),
          colorPreset: COLOR_PRESETS[c],
        });
      }
    }
    return items;
  }, [seed]);

  return (
    <group>
      {groves.map((grove, i) => {
        const genes = makeBambooGenes(grove.seed, {
          height: grove.height,
          culmCount: grove.culmCount,
          ...grove.colorPreset,
        });
        return (
          <ProceduralBamboo
            key={i}
            genes={genes}
            position={grove.position}
          />
        );
      })}
    </group>
  );
}

export default function BambooTestPage() {
  const [seed, setSeed] = useState(8080);

  return (
    <div className="min-h-screen bg-[#1d211d] text-white">
      <header className="border-b border-white/10 bg-[#1d211d]/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-medium tracking-tight">Bamboo Generator Test</h1>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/60">
              Procedural groves · node rings · leaf fans
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSeed((prev) => prev + 1)}
              className="rounded-md bg-[#9DB67A] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#1d211d] transition-colors hover:bg-[#C7D89F]"
            >
              Regenerate
            </button>
            <a href="/" className="text-sm text-[#C7D89F] hover:text-[#E2EDC8]">
              Back Home
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="overflow-hidden rounded-xl border border-white/15 bg-white/[0.03]">
          <div className="relative aspect-[16/10] bg-gradient-to-b from-[#2a332a] to-[#10130f]">
            <Canvas>
              <PerspectiveCamera makeDefault position={[0, 4.5, 12]} fov={46} />
              <OrbitControls
                enableDamping
                dampingFactor={0.06}
                minDistance={5}
                maxDistance={22}
                maxPolarAngle={1.5}
                target={[0, 1.6, 0]}
              />

              <ambientLight intensity={0.55} />
              <directionalLight position={[7, 10, 5]} intensity={0.8} />

              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
                <circleGeometry args={[9, 64]} />
                <meshBasicMaterial color="#3f4e43" wireframe />
              </mesh>

              <BambooGrid seed={seed} />
            </Canvas>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COLOR_PRESETS.map((preset, i) => (
            <div
              key={i}
              className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
            >
              <div className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-white/60">
                Preset {i + 1}
              </div>
              <div className="flex items-center gap-2">
                {(['culmColor', 'nodeColor', 'leafColor', 'accentColor'] as const).map((k) => (
                  <div
                    key={k}
                    className="h-5 w-5 rounded-full border border-white/20"
                    style={{ background: preset[k] }}
                    title={`${k}: ${preset[k]}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">
          <p className="mb-2 font-medium text-white/90">About this generator</p>
          <p>
            Each grove is a cluster of tapered culms with visible node rings (torus
            geometry) at each segment. Branches emerge only above{' '}
            <code className="rounded bg-white/10 px-1">branchStart</code> and terminate in lance-shaped leaf fans.
            All output is seeded — the same seed always produces the same grove.
            Default palette:{' '}
            <span style={{ color: BAMBOO_DEFAULTS.culmColor }}>culm</span> ·{' '}
            <span style={{ color: BAMBOO_DEFAULTS.leafColor }}>leaf</span> ·{' '}
            <span style={{ color: BAMBOO_DEFAULTS.accentColor }}>accent</span>.
          </p>
        </div>
      </main>
    </div>
  );
}
