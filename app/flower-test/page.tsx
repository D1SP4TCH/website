'use client';

import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { FlowerPatch } from '@/components/3d/flora-test-scene';

export default function FlowerTestPage() {
  const [seed, setSeed] = useState(4242);

  return (
    <div className="min-h-screen bg-[#232823] text-white">
      <header className="border-b border-white/10 bg-[#232823]/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-medium tracking-tight">Flora Generator Test</h1>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/60">
              Completely rebuilt morphology system
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSeed((prev) => prev + 1)}
              className="rounded-md bg-[#d2c22d] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#2f3731] transition-colors hover:bg-[#e7dc74]"
            >
              Regenerate
            </button>
            <a href="/" className="text-sm text-[#e9eaae] hover:text-[#f4f4d7]">
              Back Home
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="overflow-hidden rounded-xl border border-white/15 bg-white/[0.03]">
          <div className="relative aspect-[16/10] bg-gradient-to-b from-[#2f3a2f] to-[#151a16]">
            <Canvas>
              <PerspectiveCamera makeDefault position={[0, 4.0, 10.2]} fov={46} />
              <OrbitControls
                enableDamping
                dampingFactor={0.06}
                minDistance={5}
                maxDistance={14}
                maxPolarAngle={1.5}
              />

              <ambientLight intensity={0.5} />
              <directionalLight position={[7, 9, 5]} intensity={0.8} />

              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
                <circleGeometry args={[6.3, 52]} />
                <meshBasicMaterial color="#3f4e43" wireframe />
              </mesh>

              <FlowerPatch seed={seed} />
            </Canvas>
          </div>
        </div>
      </main>
    </div>
  );
}
