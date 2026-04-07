import { useEffect, useRef, useCallback } from 'react';

interface UseBootSoundsOptions {
  enabled?: boolean;
}

export const useBootSounds = ({ enabled = false }: UseBootSoundsOptions = {}) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Create audio context on first interaction
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [enabled]);

  const playBeep = useCallback(
    (frequency: number = 800, duration: number = 100) => {
      if (!enabled || !audioContextRef.current) return;

      const context = audioContextRef.current;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'square';

      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration / 1000);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + duration / 1000);
    },
    [enabled]
  );

  const playBootSound = useCallback(() => {
    // Simulated boot beep sequence
    playBeep(800, 50);
  }, [playBeep]);

  const playKeypress = useCallback(() => {
    // Very subtle click sound
    playBeep(1200, 10);
  }, [playBeep]);

  const playComplete = useCallback(() => {
    // Success sound sequence
    setTimeout(() => playBeep(600, 80), 0);
    setTimeout(() => playBeep(800, 80), 100);
    setTimeout(() => playBeep(1000, 120), 200);
  }, [playBeep]);

  return {
    playBootSound,
    playKeypress,
    playComplete,
    playBeep,
  };
};




