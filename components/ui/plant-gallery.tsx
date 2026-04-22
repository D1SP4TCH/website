'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

import {
  generateRandomPlant,
  type PlantGeneProfile,
} from '@/lib/utils/lsystem-generator';
import { CenteredLSystemPlant } from '@/components/3d/lsystem-plant';
import {
  ProceduralBamboo,
  makeBambooGenes,
} from '@/components/3d/procedural-bamboo';
import {
  ProceduralNiwaki,
  makeNiwakiGenes,
} from '@/components/3d/procedural-niwaki';
import { CompactFlowerCluster } from '@/components/3d/flora-test-scene';

type CardProps = {
  title: string;
  caption: string;
  seed: number;
  onRegenerate: () => void;
  children: React.ReactNode;
};

function CanvasCard({ title, caption, seed, onRegenerate, children }: CardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/[0.03]">
      <div className="relative aspect-[4/3] bg-gradient-to-b from-[#2f3a2f] to-[#151a16]">
        {children}
        <div className="pointer-events-none absolute left-4 top-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
          {title}
        </div>
        <div className="pointer-events-none absolute right-4 top-3 font-mono text-[10px] text-white/45">
          seed #{seed}
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-white/10 bg-white/[0.02] px-4 py-3">
        <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">
          {caption}
        </p>
        <button
          type="button"
          onClick={onRegenerate}
          className="rounded-md border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/85 transition-colors hover:bg-white/10"
          data-cursor-hover
        >
          Regenerate
        </button>
      </div>
    </div>
  );
}

function LSystemCard() {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1_000_000));
  const [profile, setProfile] = useState<PlantGeneProfile | null>(null);

  useEffect(() => {
    setProfile(generateRandomPlant(seed));
  }, [seed]);

  const regenerate = () =>
    setSeed((prev) => {
      let next = prev;
      while (next === prev) next = Math.floor(Math.random() * 1_000_000);
      return next;
    });

  return (
    <CanvasCard
      title="L-System plant"
      caption="Recursive grammar · 8+ species"
      seed={seed}
      onRegenerate={regenerate}
    >
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 4]} />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={2}
          maxDistance={8}
        />
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshBasicMaterial color="#465045" wireframe />
        </mesh>

        {profile && <CenteredLSystemPlant profile={profile} />}

        <EffectComposer>
          <Bloom
            intensity={1.0}
            luminanceThreshold={0.35}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </CanvasCard>
  );
}

function FlowerCard() {
  const [seed, setSeed] = useState(4242);

  return (
    <CanvasCard
      title="Flowers"
      caption="Bezier petals · seeded bloom"
      seed={seed}
      onRegenerate={() => setSeed((s) => s + 1)}
    >
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 1.6, 3.4]} fov={46} />
        <OrbitControls
          enableDamping
          dampingFactor={0.06}
          minDistance={2.4}
          maxDistance={6}
          maxPolarAngle={1.45}
          target={[0, 0.55, 0]}
        />

        <ambientLight intensity={0.55} />
        <directionalLight position={[5, 7, 4]} intensity={0.85} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <circleGeometry args={[1.6, 40]} />
          <meshBasicMaterial color="#3f4e43" wireframe />
        </mesh>

        <CompactFlowerCluster seed={seed} />
      </Canvas>
    </CanvasCard>
  );
}

const BAMBOO_PRESETS = [
  {
    name: 'classic green',
    culmColor: '#8FA368',
    nodeColor: '#5F6E44',
    leafColor: '#9DB67A',
    accentColor: '#C7D89F',
  },
  {
    name: 'golden',
    culmColor: '#C9B264',
    nodeColor: '#7A6A36',
    leafColor: '#A9B368',
    accentColor: '#E2D58A',
  },
  {
    name: 'black moso',
    culmColor: '#3E3A33',
    nodeColor: '#1E1B16',
    leafColor: '#7A8E63',
    accentColor: '#B8C49A',
  },
  {
    name: 'jade',
    culmColor: '#A8C48B',
    nodeColor: '#6A8556',
    leafColor: '#B7D198',
    accentColor: '#DDEBB8',
  },
] as const;

function BambooCard() {
  const [seed, setSeed] = useState(8080);
  const [presetIdx, setPresetIdx] = useState(0);

  const preset = BAMBOO_PRESETS[presetIdx];
  // Vary culm count + height per seed too, so silhouettes shift.
  const seededRng = ((seed * 9301 + 49297) % 233280) / 233280;
  const genes = makeBambooGenes(seed, {
    height: 2.8 + seededRng * 1.6,
    culmCount: 3 + Math.floor(seededRng * 4),
    culmColor: preset.culmColor,
    nodeColor: preset.nodeColor,
    leafColor: preset.leafColor,
    accentColor: preset.accentColor,
  });

  const regenerate = () => {
    setSeed(Math.floor(Math.random() * 1_000_000));
    setPresetIdx((prev) => {
      let next = prev;
      while (next === prev)
        next = Math.floor(Math.random() * BAMBOO_PRESETS.length);
      return next;
    });
  };

  return (
    <CanvasCard
      title="Bamboo grove"
      caption={`Tapered culms · ${preset.name}`}
      seed={seed}
      onRegenerate={regenerate}
    >
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 2.4, 6.6]} fov={48} />
        <OrbitControls
          enableDamping
          dampingFactor={0.06}
          minDistance={3}
          maxDistance={10}
          maxPolarAngle={1.45}
          target={[0, 1.4, 0]}
        />

        <ambientLight intensity={0.55} />
        <directionalLight position={[7, 10, 5]} intensity={0.8} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <circleGeometry args={[3.5, 48]} />
          <meshBasicMaterial color="#3f4e43" wireframe />
        </mesh>

        <ProceduralBamboo genes={genes} position={[0, 0, 0]} />
      </Canvas>
    </CanvasCard>
  );
}

function NiwakiCard() {
  const [seed, setSeed] = useState(2242);
  const genes = makeNiwakiGenes(seed);

  return (
    <CanvasCard
      title="Niwaki tree"
      caption="Cloud-pruned · sliders → trunk, pads"
      seed={seed}
      onRegenerate={() => setSeed(Math.floor(Math.random() * 1_000_000))}
    >
      <Canvas>
        <PerspectiveCamera makeDefault position={[3.2, 2.4, 5.0]} fov={44} />
        <OrbitControls
          enableDamping
          dampingFactor={0.06}
          minDistance={3.2}
          maxDistance={10}
          maxPolarAngle={1.45}
          target={[0, genes.height * 0.45, 0]}
        />

        <ambientLight intensity={0.6} />
        <directionalLight position={[7, 9, 5]} intensity={0.9} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <circleGeometry args={[3.2, 40]} />
          <meshBasicMaterial color="#3f4e43" wireframe />
        </mesh>

        <ProceduralNiwaki genes={genes} />
      </Canvas>
    </CanvasCard>
  );
}

function PlantGalleryClient() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <LSystemCard />
      <FlowerCard />
      <BambooCard />
      <NiwakiCard />
    </div>
  );
}

// 3D code uses browser-only APIs (postprocessing, refs, useFrame). Skip SSR.
export const PlantGallery = dynamic(() => Promise.resolve(PlantGalleryClient), {
  ssr: false,
  loading: () => (
    <div className="grid gap-5 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="aspect-[4/3] animate-pulse rounded-2xl border border-white/15 bg-white/[0.04]"
        />
      ))}
    </div>
  ),
});
