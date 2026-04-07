'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useBootSequence } from '@/hooks/use-boot-sequence';
import { useKeyboardCommands } from '@/hooks/use-keyboard-commands';
import { useBootSounds } from '@/hooks/use-boot-sounds';
import {
  biosMessages,
  bootloaderMessages,
  kernelMessages,
  initMessages,
  loginMessages,
  getWelcomeMessage,
  type BootPhase,
  type BootMessage,
} from '@/lib/boot-messages';
import { EasterEggDisplay, MatrixRain, BlinkingCursor } from './boot-easter-eggs';

interface BootScreenProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export const BootScreen = ({ onComplete, onSkip }: BootScreenProps) => {
  const [messages, setMessages] = useState<BootMessage[]>([]);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showMatrixRain, setShowMatrixRain] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasPlayedBootSound = useRef(false);
  
  const { playBootSound, playKeypress, playComplete } = useBootSounds({ enabled: soundEnabled });

  const { phase, isComplete, completeSequence } = useBootSequence({
    onComplete,
    autoProgress: true,
  });

  const {
    currentInput,
    lastCommand,
    easterEgg,
    clearEasterEgg,
  } = useKeyboardCommands({
    enabled: !isComplete && !showMatrixRain,
    onSkip: () => {
      onSkip?.();
      completeSequence();
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Matrix easter egg
  useEffect(() => {
    if (easterEgg === 'matrix') {
      setShowMatrixRain(true);
    }
  }, [easterEgg]);

  const handleMatrixComplete = useCallback(() => {
    setShowMatrixRain(false);
    clearEasterEgg();
  }, [clearEasterEgg]);

  // Display messages based on phase
  useEffect(() => {
    let phaseMessages: BootMessage[] = [];

    switch (phase) {
      case 'bios':
        phaseMessages = biosMessages;
        break;
      case 'bootloader':
        phaseMessages = [...biosMessages, ...bootloaderMessages];
        break;
      case 'kernel':
        phaseMessages = [...biosMessages, ...bootloaderMessages, ...kernelMessages];
        break;
      case 'init':
        phaseMessages = [
          ...biosMessages,
          ...bootloaderMessages,
          ...kernelMessages,
          ...initMessages,
        ];
        break;
      case 'login':
        phaseMessages = [
          ...biosMessages,
          ...bootloaderMessages,
          ...kernelMessages,
          ...initMessages,
          ...loginMessages,
        ];
        setShowLoginPrompt(true);
        break;
      case 'complete':
        return;
    }

    // Animate messages appearing
    let currentDelay = 0;
    const timeouts: NodeJS.Timeout[] = [];

    phaseMessages.forEach((msg, index) => {
      currentDelay += msg.delay;
      const timeout = setTimeout(() => {
        setMessages((prev) => {
          // Only add if not already present
          if (prev.length > index) return prev;
          return [...prev, msg];
        });
      }, currentDelay);
      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [phase]);

  // Play boot sound on mount (if enabled)
  useEffect(() => {
    if (!hasPlayedBootSound.current && soundEnabled) {
      playBootSound();
      hasPlayedBootSound.current = true;
    }
  }, [soundEnabled, playBootSound]);
  
  // Play complete sound when login prompt shows
  useEffect(() => {
    if (showLoginPrompt && soundEnabled) {
      playComplete();
    }
  }, [showLoginPrompt, soundEnabled, playComplete]);

  // Auto-login after delay
  useEffect(() => {
    if (showLoginPrompt && !isComplete) {
      const timeout = setTimeout(() => {
        completeSequence();
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [showLoginPrompt, isComplete, completeSequence]);

  if (showMatrixRain) {
    return <MatrixRain onComplete={handleMatrixComplete} />;
  }

  return (
    <div 
      className="boot-screen fixed inset-0 z-50 bg-black text-green-500 overflow-hidden"
      role="main"
      aria-label="Boot sequence animation"
      aria-live="polite"
    >
      {/* Screen reader announcement */}
      <div className="sr-only" aria-atomic="true">
        {phase === 'bios' && 'Initializing system...'}
        {phase === 'bootloader' && 'Loading bootloader...'}
        {phase === 'kernel' && 'Starting kernel...'}
        {phase === 'init' && 'Initializing services...'}
        {phase === 'login' && 'Login ready. Press Escape to skip.'}
        {isComplete && 'Boot complete. Loading portfolio...'}
      </div>

      {/* CRT Effect Overlay */}
      <div className="crt-overlay" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />

      {/* Sound Toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="absolute top-4 right-4 z-10 px-3 py-1 text-xs border border-green-500 hover:bg-green-500 hover:text-black transition-colors"
        aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>

      {/* Skip Button */}
      <button
        onClick={() => {
          onSkip?.();
          completeSequence();
        }}
        className="absolute top-4 left-4 z-10 px-3 py-1 text-xs border border-green-500 hover:bg-green-500 hover:text-black transition-colors animate-pulse focus:outline-none focus:ring-2 focus:ring-green-500"
        aria-label="Skip boot sequence - Press Escape or click this button"
        title="Skip boot sequence (ESC or Ctrl+C)"
      >
        Press ESC to skip
      </button>

      {/* Main content */}
      <div className="h-full overflow-y-auto p-8 font-mono text-sm">
        <div className="max-w-4xl">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`leading-relaxed ${
                msg.type === 'ok'
                  ? 'text-green-400'
                  : msg.type === 'warn'
                  ? 'text-yellow-400'
                  : msg.type === 'error'
                  ? 'text-red-400'
                  : msg.type === 'info'
                  ? 'text-cyan-400'
                  : 'text-green-500'
              }`}
            >
              {msg.text || '\u00A0'}
            </div>
          ))}

          {showLoginPrompt && (
            <div className="mt-4 space-y-2">
              <div className="text-green-400">{getWelcomeMessage()}</div>
              <div className="text-green-500">
                portfolio login: <span className="text-white">guest</span>
              </div>
              <div className="text-green-500 flex items-center">
                Password: <span className="ml-2">●●●●●●●●</span>
              </div>
              <div className="mt-4 text-cyan-400">
                Last login: {new Date().toLocaleString()}
              </div>
              <div className="mt-2 text-green-500">
                guest@portfolio:~$ <span className="text-white">{currentInput}</span>
                <BlinkingCursor />
              </div>

              {/* Easter Egg Display */}
              {(easterEgg || lastCommand) && (
                <EasterEggDisplay
                  easterEgg={easterEgg}
                  lastCommand={lastCommand}
                  onClose={clearEasterEgg}
                />
              )}

              <div className="mt-4 text-green-500 opacity-70 text-xs">
                Hint: Try typing &quot;help&quot;, &quot;whoami&quot;, &quot;ls&quot;, or &quot;matrix&quot;
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

