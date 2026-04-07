'use client';

import { useState, useEffect, ReactNode } from 'react';
import { NeuralBoot } from './neural-boot';

interface BootManagerProps {
  children: ReactNode;
}

export const BootManager = ({ children }: BootManagerProps) => {
  const [bootCompleted, setBootCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showBoot, setShowBoot] = useState(false);

  useEffect(() => {
    // Check if we should show boot screen
    const checkBootStatus = () => {
      // Check for dev mode override
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('boot') === 'true') {
          setShowBoot(true);
          setIsLoading(false);
          return;
        }

        // Check if boot was already shown this session
        const hasBooted = sessionStorage.getItem('boot-completed');
        
        if (hasBooted === 'true') {
          setBootCompleted(true);
          setShowBoot(false);
        } else {
          setShowBoot(true);
        }
      }
      
      setIsLoading(false);
    };

    checkBootStatus();
  }, []);

  useEffect(() => {
    // Check for reduced motion preference
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      if (prefersReducedMotion && showBoot) {
        // Skip boot animation for users who prefer reduced motion
        handleBootComplete();
      }
    }
  }, [showBoot]);

  const handleBootComplete = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('boot-completed', 'true');
    }
    
    // Add a small transition delay
    setTimeout(() => {
      setBootCompleted(true);
      setShowBoot(false);
    }, 500);
  };

  const handleSkip = () => {
    handleBootComplete();
  };

  // Show nothing while checking boot status
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-purple-600 font-mono">Initializing...</div>
      </div>
    );
  }

  // Show boot screen if needed
  if (showBoot && !bootCompleted) {
    return <NeuralBoot onComplete={handleBootComplete} onSkip={handleSkip} />;
  }

  // Show main content with fade-in
  return (
    <div className={`transition-opacity duration-500 ${bootCompleted ? 'opacity-100' : 'opacity-0'}`}>
      {children}
    </div>
  );
};

