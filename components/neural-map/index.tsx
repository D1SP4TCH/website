'use client';

import { useState, useEffect } from 'react';
import { NeuralNetwork } from './neural-network';
import { Neural3DR3F } from './neural-3d-r3f';
import { NeuralControls } from './neural-controls';
import { NeuralMobile } from './neural-mobile';
import { useMediaQuery } from '@/hooks/use-media-query';

export const NeuralMap = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isReady, setIsReady] = useState(false);
  const [showListView, setShowListView] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [forceReset, setForceReset] = useState(0);
  const [showDebugButton, setShowDebugButton] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [use3D, setUse3D] = useState(false);

  // Check if in dev mode and debug mode status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      setShowDebugButton(isDev);
      
      const debugEnabled = localStorage.getItem('neural-debug-mode') === 'true';
      setDebugMode(debugEnabled);
      
      // Enable 3D mode by default
      const use3DMode = localStorage.getItem('neural-3d-mode') !== 'false';
      setUse3D(use3DMode);
    }
  }, []);

  // Show list view on mobile
  useEffect(() => {
    if (isMobile) {
      setShowListView(true);
      setIsReady(true); // Mobile is always ready
    }
  }, [isMobile]);

  // Set ready after a timeout as fallback
  useEffect(() => {
    if (!isMobile) {
      const timeout = setTimeout(() => {
        setIsReady(true);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isMobile]);

  // Check for reduced motion preference
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion && !isMobile) {
      setShowListView(true);
    }
  }, [isMobile]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'l':
          e.preventDefault();
          handleToggleList();
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
        case '_':
          e.preventDefault();
          handleZoomOut();
          break;
        case 'r':
          e.preventDefault();
          handleReset();
          break;
        case '?':
          // Show keyboard shortcuts (could open a modal)
          alert('Keyboard shortcuts:\nL - Toggle list view\n+ - Zoom in\n- - Zoom out\nR - Reset view');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(2, prev + 0.2));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(0.5, prev - 0.2));
  };

  const handleReset = () => {
    setZoomLevel(1);
    setForceReset((prev) => prev + 1);
  };

  const handleToggleList = () => {
    setShowListView((prev) => !prev);
  };

  const handleToggleDebug = () => {
    if (typeof window !== 'undefined') {
      const current = localStorage.getItem('neural-debug-mode') === 'true';
      localStorage.setItem('neural-debug-mode', String(!current));
      window.location.reload(); // Reload to enable debug mode
    }
  };

  // Loading state
  if (!isReady && !isMobile) {
    return (
      <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-white flex flex-col items-center justify-center z-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </div>
        <p className="mt-6 text-black text-lg font-medium animate-pulse">
          Initializing Neural Network...
        </p>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen overflow-hidden bg-white"
      role="main"
      aria-label="Interactive neural network portfolio navigation"
      style={{ margin: 0, padding: 0 }}
    >
      {/* Screen reader announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        {!showListView && !isMobile
          ? 'Interactive neural network view. Use Tab to navigate between nodes, Enter to select, or press L to switch to list view.'
          : 'List view active. Browse through sections and projects.'}
      </div>

      {/* Skip to content */}
      <a
        href="#main-navigation"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-500 focus:text-white focus:rounded"
      >
        Skip to navigation
      </a>

      {/* Desktop: Show neural network or list view */}
      {!isMobile && (
        <>
          {!showListView ? (
            <>
              {use3D ? (
                <Neural3DR3F key={forceReset} onReady={() => setIsReady(true)} debugMode={debugMode} />
              ) : (
                <NeuralNetwork key={forceReset} onReady={() => setIsReady(true)} debugMode={debugMode} />
              )}
              <NeuralControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onReset={handleReset}
                onToggleList={handleToggleList}
                onToggleDebug={handleToggleDebug}
                showDebugButton={showDebugButton}
              />
            </>
          ) : (
            <>
              <NeuralMobile />
              <button
                onClick={handleToggleList}
                className="fixed top-8 left-8 px-4 py-2 bg-white/80 backdrop-blur-sm border border-purple-500/30 rounded-lg text-black hover:text-purple-600 hover:bg-purple-100 transition-all flex items-center gap-2 z-10"
                aria-label="Switch to network view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                <span className="text-sm font-medium">Network View</span>
              </button>
            </>
          )}
        </>
      )}

      {/* Mobile: Always show list view */}
      {isMobile && <NeuralMobile />}

      {/* Keyboard shortcuts hint */}
      <div className="sr-only" id="keyboard-help">
        Keyboard shortcuts: L for list view, + for zoom in, - for zoom out, R for reset, Escape to access navigation menu
      </div>
    </div>
  );
};

