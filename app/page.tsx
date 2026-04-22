'use client';

import dynamic from 'next/dynamic';

// Dynamic import for 3D scene to avoid SSR issues
const GardenScene = dynamic(
  () => import('@/components/3d/garden-scene').then(mod => ({ default: mod.GardenScene })),
  { 
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 flex items-center justify-center bg-[#2f3731]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-[#d2c22d]" />
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-white/65">Growing garden...</p>
        </div>
      </div>
    )
  }
);

export default function Home() {
  return (
    <main className="fixed inset-0 w-screen h-screen overflow-hidden">
      <GardenScene />
    </main>
  );
}
