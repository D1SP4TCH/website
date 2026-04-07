import { useState, useEffect, useCallback, useRef } from 'react';

export type EasterEgg = 'matrix' | 'whoami' | 'ls' | 'neofetch' | 'help' | null;

interface UseKeyboardCommandsOptions {
  enabled?: boolean;
  onSkip?: () => void;
  onCommand?: (command: string) => void;
}

export const useKeyboardCommands = ({
  enabled = true,
  onSkip,
  onCommand,
}: UseKeyboardCommandsOptions = {}) => {
  const [currentInput, setCurrentInput] = useState('');
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [easterEgg, setEasterEgg] = useState<EasterEgg>(null);
  const inputBufferRef = useRef('');
  const lastKeyTimeRef = useRef(Date.now());

  const clearEasterEgg = useCallback(() => {
    setEasterEgg(null);
  }, []);

  const processCommand = useCallback((cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    setLastCommand(trimmedCmd);
    onCommand?.(trimmedCmd);

    // Check for easter egg commands
    if (trimmedCmd === 'whoami') {
      setEasterEgg('whoami');
    } else if (trimmedCmd === 'ls' || trimmedCmd === 'ls -la' || trimmedCmd === 'ls -l') {
      setEasterEgg('ls');
    } else if (trimmedCmd === 'matrix') {
      setEasterEgg('matrix');
    } else if (trimmedCmd === 'help' || trimmedCmd === 'help me' || trimmedCmd === '?') {
      setEasterEgg('help');
    } else if (trimmedCmd === 'neofetch' || trimmedCmd === 'screenfetch') {
      setEasterEgg('neofetch');
    } else if (trimmedCmd) {
      // Unknown command
      setEasterEgg(null);
    }

    // Clear input after processing
    setCurrentInput('');
    inputBufferRef.current = '';
  }, [onCommand]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip sequences
      if (e.key === 'Escape' || (e.ctrlKey && e.key === 'c')) {
        e.preventDefault();
        onSkip?.();
        return;
      }

      // Ignore special keys that shouldn't be added to input
      if (
        e.key === 'Shift' ||
        e.key === 'Control' ||
        e.key === 'Alt' ||
        e.key === 'Meta' ||
        e.key === 'CapsLock' ||
        e.key === 'Tab'
      ) {
        return;
      }

      const now = Date.now();
      const timeSinceLastKey = now - lastKeyTimeRef.current;

      // Reset buffer if too much time has passed (1 second)
      if (timeSinceLastKey > 1000) {
        inputBufferRef.current = '';
      }

      lastKeyTimeRef.current = now;

      if (e.key === 'Enter') {
        e.preventDefault();
        processCommand(inputBufferRef.current);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        inputBufferRef.current = inputBufferRef.current.slice(0, -1);
        setCurrentInput(inputBufferRef.current);
      } else if (e.key.length === 1) {
        // Only add single character keys (letters, numbers, symbols)
        e.preventDefault();
        inputBufferRef.current += e.key;
        setCurrentInput(inputBufferRef.current);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, onSkip, processCommand]);

  return {
    currentInput,
    lastCommand,
    easterEgg,
    clearEasterEgg,
    processCommand,
  };
};




