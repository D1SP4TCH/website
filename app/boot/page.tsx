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
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-purple-600 font-mono animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return <NeuralBoot onComplete={handleComplete} onSkip={handleSkip} />;
}

