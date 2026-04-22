'use client';

import { useState } from 'react';
import { NeuralBoot } from '@/components/ui/neural-boot';
import { useRouter } from 'next/navigation';

export default function BootPage() {
  const [showBoot, setShowBoot] = useState(true);
  const router = useRouter();

  const handleComplete = () => {
    setShowBoot(false);
    // Redirect to home after boot completes
    setTimeout(() => {
      router.push('/');
    }, 500);
  };

  const handleSkip = () => {
    router.push('/');
  };

  if (!showBoot) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#2f3731]">
        <div className="animate-pulse font-mono text-sm uppercase tracking-[0.2em] text-white/70">
          Loading...
        </div>
      </div>
    );
  }

  return <NeuralBoot onComplete={handleComplete} onSkip={handleSkip} />;
}

