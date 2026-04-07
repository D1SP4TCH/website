import { useState, useEffect, useCallback, useRef } from 'react';
import { BootPhase, BootMessage } from '@/lib/boot-messages';

interface UseBootSequenceOptions {
  onComplete?: () => void;
  autoProgress?: boolean;
}

export const useBootSequence = ({ onComplete, autoProgress = true }: UseBootSequenceOptions = {}) => {
  const [phase, setPhase] = useState<BootPhase>('bios');
  const [isComplete, setIsComplete] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const completeSequence = useCallback(() => {
    setIsComplete(true);
    setPhase('complete');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onComplete?.();
  }, [onComplete]);

  const skipToPhase = useCallback((targetPhase: BootPhase) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setPhase(targetPhase);
  }, []);

  const pauseSequence = useCallback(() => {
    setIsPaused(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const resumeSequence = useCallback(() => {
    setIsPaused(false);
  }, []);

  useEffect(() => {
    if (!autoProgress || isPaused || isComplete) return;

    const phaseDurations: Record<BootPhase, number> = {
      bios: 1500,
      bootloader: 1800,
      kernel: 2500,
      init: 2800,
      login: 3000,
      complete: 0,
    };

    const phaseOrder: BootPhase[] = ['bios', 'bootloader', 'kernel', 'init', 'login', 'complete'];
    const currentIndex = phaseOrder.indexOf(phase);
    const nextPhase = phaseOrder[currentIndex + 1];

    if (nextPhase && nextPhase !== 'complete') {
      timeoutRef.current = setTimeout(() => {
        setPhase(nextPhase);
      }, phaseDurations[phase]);
    } else if (nextPhase === 'complete') {
      timeoutRef.current = setTimeout(() => {
        completeSequence();
      }, phaseDurations[phase]);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [phase, autoProgress, isPaused, isComplete, completeSequence]);

  return {
    phase,
    isComplete,
    isPaused,
    completeSequence,
    skipToPhase,
    pauseSequence,
    resumeSequence,
  };
};




