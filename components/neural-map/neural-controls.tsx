'use client';

import { useState } from 'react';

interface NeuralControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onReset?: () => void;
  onToggleList?: () => void;
  onToggleDebug?: () => void;
  showDebugButton?: boolean;
}

export const NeuralControls = ({
  onZoomIn,
  onZoomOut,
  onReset,
  onToggleList,
  onToggleDebug,
  showDebugButton = false,
}: NeuralControlsProps) => {
  const [showLegend, setShowLegend] = useState(false);

  return (
    <>
      {/* Main Controls - Bottom Right */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-10">
        {/* Zoom Controls */}
        <div className="flex flex-col gap-2 bg-black/80 backdrop-blur-sm border border-purple-500/30 rounded-lg p-2">
          <button
            onClick={onZoomIn}
            className="w-12 h-12 flex items-center justify-center text-white hover:text-purple-400 hover:bg-purple-500/20 rounded-lg transition-all"
            aria-label="Zoom in"
            title="Zoom in"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={onZoomOut}
            className="w-12 h-12 flex items-center justify-center text-white hover:text-purple-400 hover:bg-purple-500/20 rounded-lg transition-all"
            aria-label="Zoom out"
            title="Zoom out"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
        </div>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="w-12 h-12 flex items-center justify-center bg-black/80 backdrop-blur-sm border border-purple-500/30 rounded-lg text-white hover:text-purple-400 hover:bg-purple-500/20 transition-all"
          aria-label="Reset view"
          title="Reset view"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Top Left Controls */}
      <div className="fixed top-8 left-8 flex flex-col gap-3 z-10">
        {/* List View Toggle */}
        <button
          onClick={onToggleList}
          className="px-4 py-2 bg-black/80 backdrop-blur-sm border border-purple-500/30 rounded-lg text-white hover:text-purple-400 hover:bg-purple-500/20 transition-all flex items-center gap-2"
          aria-label="Toggle list view"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="text-sm font-medium">List View</span>
        </button>

        {/* Legend Toggle */}
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="px-4 py-2 bg-black/80 backdrop-blur-sm border border-purple-500/30 rounded-lg text-white hover:text-purple-400 hover:bg-purple-500/20 transition-all flex items-center gap-2"
          aria-label="Toggle legend"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">Legend</span>
        </button>

        {/* Debug Toggle (only shown in dev) */}
        {showDebugButton && (
          <button
            onClick={onToggleDebug}
            className="px-4 py-2 bg-black/80 backdrop-blur-sm border border-orange-500/30 rounded-lg text-orange-400 hover:text-orange-300 hover:bg-orange-500/20 transition-all flex items-center gap-2"
            aria-label="Toggle debug mode"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span className="text-sm font-medium">Debug</span>
          </button>
        )}
      </div>

      {/* Legend Panel */}
      {showLegend && (
        <div className="fixed top-32 left-8 bg-black/90 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 z-10 max-w-xs">
          <h3 className="text-white font-bold text-lg mb-4">Legend</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500 border-2 border-white" />
              <div>
                <div className="text-white font-medium">Center</div>
                <div className="text-gray-400 text-sm">Your profile</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white" />
              <div>
                <div className="text-white font-medium">Projects</div>
                <div className="text-gray-400 text-sm">Your work</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-cyan-500 border-2 border-white" />
              <div>
                <div className="text-white font-medium">Skills</div>
                <div className="text-gray-400 text-sm">Technologies</div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-purple-500/30">
            <p className="text-gray-400 text-sm">
              <strong className="text-white">Tip:</strong> Drag nodes to rearrange, scroll to zoom, click to navigate.
            </p>
          </div>
        </div>
      )}

      {/* Instructions - Bottom Center */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm border border-purple-500/30 rounded-lg px-6 py-3 z-10">
        <p className="text-white text-sm text-center">
          <span className="text-purple-400 font-medium">Explore:</span> Drag nodes • Scroll to zoom • Click to navigate
        </p>
      </div>
    </>
  );
};

