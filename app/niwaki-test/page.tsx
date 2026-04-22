'use client';

import { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { ProceduralNiwaki, makeNiwakiGenes, NIWAKI_DEFAULTS, type NiwakiGenes } from '@/components/3d/procedural-niwaki';
import { SeededRandom } from '@/lib/utils/seeded-random';

type HeroControls = {
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
  showSkeleton: boolean;
};

const INITIAL: HeroControls = {
  seed: 2242,
  height: 2.9,
  trunkCurl: 0.72,
  trunkLean: 0.28,
  trunkThickness: 0.085,
  padCount: 5,
  padSize: 0.55,
  padSpread: 0.35,
  padFlatness: 0.68,
  branchReach: 0.95,
  branchDroop: 0.15,
  hasApexPad: true,
  trunkColor: NIWAKI_DEFAULTS.trunkColor,
  padColor: NIWAKI_DEFAULTS.padColor,
  accentColor: NIWAKI_DEFAULTS.accentColor,
  showSkeleton: false,
};

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format = (v) => v.toFixed(2),
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <label className="flex flex-col gap-1 text-[11px] uppercase tracking-[0.14em] text-white/60">
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <span className="font-mono text-[11px] tracking-normal text-[#e9eaae]">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[#d2c22d]"
      />
    </label>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.14em] text-white/60">
      <span>{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[11px] tracking-normal text-white/80">{value.toUpperCase()}</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-6 w-8 cursor-pointer rounded border border-white/20 bg-transparent"
        />
      </div>
    </label>
  );
}

function HeroScene({ genes, showSkeleton }: { genes: NiwakiGenes; showSkeleton: boolean }) {
  return (
    <Canvas shadows={false}>
      <PerspectiveCamera makeDefault position={[3.5, 2.6, 5.4]} fov={42} />
      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        minDistance={3.2}
        maxDistance={12}
        maxPolarAngle={1.5}
        target={[0, genes.height * 0.45, 0]}
      />

      <ambientLight intensity={0.6} />
      <directionalLight position={[7, 9, 5]} intensity={0.9} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[3.5, 40]} />
        <meshBasicMaterial color="#3f4e43" wireframe />
      </mesh>

      <gridHelper args={[7, 14, '#3a4a3f', '#2a3830']} position={[0, 0, 0]} />

      <ProceduralNiwaki genes={genes} showSkeleton={showSkeleton} />
    </Canvas>
  );
}

function VariantGallery({ baseSeed, template }: { baseSeed: number; template: HeroControls }) {
  const variants = useMemo(() => {
    const rng = new SeededRandom(baseSeed);
    return Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      genes: makeNiwakiGenes(rng.int(1, 1_000_000), {
        trunkColor: template.trunkColor,
        padColor: template.padColor,
        accentColor: template.accentColor,
      }),
    }));
  }, [baseSeed, template.trunkColor, template.padColor, template.accentColor]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {variants.map((v) => (
        <div
          key={v.id}
          className="relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-[#2f3a2f] to-[#151a16]"
        >
          <Canvas>
            <PerspectiveCamera makeDefault position={[2.6, 2.2, 4.4]} fov={44} />
            <OrbitControls
              enableDamping
              dampingFactor={0.06}
              enableZoom={false}
              enablePan={false}
              target={[0, v.genes.height * 0.45, 0]}
            />
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 7, 4]} intensity={0.8} />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
              <circleGeometry args={[2.4, 32]} />
              <meshBasicMaterial color="#3f4e43" wireframe />
            </mesh>
            <ProceduralNiwaki genes={v.genes} />
          </Canvas>
          <div className="pointer-events-none absolute bottom-1 left-2 font-mono text-[10px] text-white/50">
            seed #{v.genes.seed}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NiwakiTestPage() {
  const [controls, setControls] = useState<HeroControls>(INITIAL);
  const [galleryKey, setGalleryKey] = useState(1);

  const heroGenes = useMemo<NiwakiGenes>(
    () => ({
      seed: controls.seed,
      height: controls.height,
      trunkCurl: controls.trunkCurl,
      trunkLean: controls.trunkLean,
      trunkThickness: controls.trunkThickness,
      padCount: controls.padCount,
      padSize: controls.padSize,
      padSpread: controls.padSpread,
      padFlatness: controls.padFlatness,
      branchReach: controls.branchReach,
      branchDroop: controls.branchDroop,
      hasApexPad: controls.hasApexPad,
      trunkColor: controls.trunkColor,
      padColor: controls.padColor,
      accentColor: controls.accentColor,
    }),
    [controls]
  );

  const update = <K extends keyof HeroControls>(key: K, value: HeroControls[K]) =>
    setControls((prev) => ({ ...prev, [key]: value }));

  const randomizeSeed = () => update('seed', Math.floor(Math.random() * 1_000_000));
  const resetAll = () => setControls(INITIAL);

  return (
    <div className="min-h-screen bg-[#232823] text-white">
      <header className="border-b border-white/10 bg-[#232823]/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <h1 className="text-2xl font-medium tracking-tight">Niwaki Generator Test</h1>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/60">
              Cloud-pruned procedural tree · live parameter tuning
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={resetAll}
              className="rounded-md border border-white/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/70 transition-colors hover:bg-white/5"
            >
              Reset
            </button>
            <button
              onClick={randomizeSeed}
              className="rounded-md bg-[#d2c22d] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#2f3731] transition-colors hover:bg-[#e7dc74]"
            >
              Randomize Seed
            </button>
            <a href="/" className="text-sm text-[#e9eaae] hover:text-[#f4f4d7]">
              Back Home
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          {/* Controls panel */}
          <aside className="space-y-5 rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e9eaae]">Seed</h2>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={controls.seed}
                  onChange={(e) => update('seed', parseInt(e.target.value, 10) || 0)}
                  className="w-full rounded-md border border-white/15 bg-black/20 px-3 py-2 font-mono text-sm text-white focus:border-[#d2c22d] focus:outline-none"
                />
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e9eaae]">Trunk</h2>
              <Slider label="Height" value={controls.height} min={1.2} max={5} step={0.05} onChange={(v) => update('height', v)} />
              <Slider label="Curl" value={controls.trunkCurl} min={0} max={1.4} step={0.02} onChange={(v) => update('trunkCurl', v)} />
              <Slider label="Lean" value={controls.trunkLean} min={-1} max={1} step={0.02} onChange={(v) => update('trunkLean', v)} />
              <Slider label="Thickness" value={controls.trunkThickness} min={0.04} max={0.18} step={0.005} onChange={(v) => update('trunkThickness', v)} format={(v) => v.toFixed(3)} />
            </section>

            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e9eaae]">Branches</h2>
              <Slider label="Reach" value={controls.branchReach} min={0.4} max={1.6} step={0.02} onChange={(v) => update('branchReach', v)} />
              <Slider label="Droop" value={controls.branchDroop} min={0} max={0.4} step={0.01} onChange={(v) => update('branchDroop', v)} />
            </section>

            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e9eaae]">Cloud Pads</h2>
              <Slider label="Pad Count" value={controls.padCount} min={2} max={10} step={1} onChange={(v) => update('padCount', v)} format={(v) => v.toFixed(0)} />
              <Slider label="Pad Size" value={controls.padSize} min={0.25} max={1.1} step={0.02} onChange={(v) => update('padSize', v)} />
              <Slider label="Size Variance" value={controls.padSpread} min={0} max={0.8} step={0.02} onChange={(v) => update('padSpread', v)} />
              <Slider label="Flatness" value={controls.padFlatness} min={0.3} max={1} step={0.02} onChange={(v) => update('padFlatness', v)} />
              <label className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-white/60">
                <span>Apex Pad</span>
                <input
                  type="checkbox"
                  checked={controls.hasApexPad}
                  onChange={(e) => update('hasApexPad', e.target.checked)}
                  className="h-4 w-4 cursor-pointer accent-[#d2c22d]"
                />
              </label>
            </section>

            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e9eaae]">Colors</h2>
              <ColorInput label="Trunk" value={controls.trunkColor} onChange={(v) => update('trunkColor', v)} />
              <ColorInput label="Pad" value={controls.padColor} onChange={(v) => update('padColor', v)} />
              <ColorInput label="Accent" value={controls.accentColor} onChange={(v) => update('accentColor', v)} />
            </section>

            <section className="space-y-3 border-t border-white/10 pt-4">
              <label className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-white/60">
                <span>Show Pad Anchors</span>
                <input
                  type="checkbox"
                  checked={controls.showSkeleton}
                  onChange={(e) => update('showSkeleton', e.target.checked)}
                  className="h-4 w-4 cursor-pointer accent-[#d2c22d]"
                />
              </label>
            </section>
          </aside>

          {/* Hero + gallery */}
          <div className="space-y-6">
            <div className="overflow-hidden rounded-xl border border-white/15 bg-white/[0.03]">
              <div className="relative aspect-[16/10] bg-gradient-to-b from-[#2f3a2f] to-[#151a16]">
                <HeroScene genes={heroGenes} showSkeleton={controls.showSkeleton} />
                <div className="pointer-events-none absolute left-4 top-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
                  Hero · seed #{controls.seed}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e9eaae]">Variant Gallery</h2>
                <button
                  onClick={() => setGalleryKey((k) => k + 1)}
                  className="rounded-md border border-white/15 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70 transition-colors hover:bg-white/5"
                >
                  New Batch
                </button>
              </div>
              <VariantGallery key={galleryKey} baseSeed={galleryKey * 7919} template={controls} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
