'use client';

import dynamic from 'next/dynamic';

// Dynamic import for 3D scene to avoid SSR issues
const GardenScene = dynamic(
  () => import('@/components/3d/garden-scene').then(mod => ({ default: mod.GardenScene })),
  { 
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#E8E4D5' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#4A4035]/20 border-t-[#4A4035] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm" style={{ color: '#8B8075' }}>Growing garden...</p>
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
