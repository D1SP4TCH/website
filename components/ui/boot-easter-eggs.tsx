'use client';

import { useEffect, useState, useRef } from 'react';
import { easterEggResponses, getCommandNotFoundMessage } from '@/lib/boot-messages';
import type { EasterEgg } from '@/hooks/use-keyboard-commands';

interface EasterEggDisplayProps {
  easterEgg: EasterEgg;
  lastCommand: string | null;
  onClose?: () => void;
}

export const EasterEggDisplay = ({ easterEgg, lastCommand, onClose }: EasterEggDisplayProps) => {
  if (!easterEgg && !lastCommand) return null;

  let lines: string[] = [];

  if (easterEgg === 'whoami') {
    lines = easterEggResponses.whoami;
  } else if (easterEgg === 'help') {
    lines = easterEggResponses.help;
  } else if (easterEgg === 'ls') {
    lines = easterEggResponses.ls;
  } else if (easterEgg === 'neofetch') {
    lines = easterEggResponses.neofetch;
  } else if (lastCommand && !easterEgg) {
    lines = getCommandNotFoundMessage(lastCommand);
  }

  return (
    <div className="font-mono text-sm space-y-1 mt-2 animate-fade-in">
      {lines.map((line, idx) => (
        <div key={idx} className="whitespace-pre">
          {line}
        </div>
      ))}
    </div>
  );
};

interface MatrixRainProps {
  onComplete?: () => void;
}

export const MatrixRain = ({ onComplete }: MatrixRainProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Matrix characters
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?/~`';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);

    // Initialize drops
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -100);
    }

    let animationId: number;
    let frameCount = 0;

    const draw = () => {
      // Semi-transparent black to create trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text style
      ctx.fillStyle = '#0F0'; // Matrix green
      ctx.font = `${fontSize}px monospace`;

      // Draw characters
      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(char, x, y);

        // Reset drop randomly
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }

      frameCount++;
      
      // Run for about 5 seconds (assuming 60fps)
      if (frameCount < 300) {
        animationId = requestAnimationFrame(draw);
      } else {
        setIsActive(false);
        onComplete?.();
      }
    };

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-500 font-mono text-xl animate-pulse">
        Wake up, Neo...
      </div>
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-green-500 font-mono text-sm opacity-70">
        Press any key to exit
      </div>
    </div>
  );
};

interface TypewriterTextProps {
  text: string;
  delay?: number;
  onComplete?: () => void;
}

export const TypewriterText = ({ text, delay = 30, onComplete }: TypewriterTextProps) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, delay);

      return () => clearTimeout(timeout);
    } else if (currentIndex === text.length && onComplete) {
      onComplete();
    }
  }, [currentIndex, text, delay, onComplete]);

  return <span>{displayText}</span>;
};

interface BlinkingCursorProps {
  show?: boolean;
}

export const BlinkingCursor = ({ show = true }: BlinkingCursorProps) => {
  if (!show) return null;

  return (
    <span className="inline-block w-2 h-4 bg-green-500 ml-1 animate-blink">
      &nbsp;
    </span>
  );
};




