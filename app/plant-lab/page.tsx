'use client';

import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { generateRandomPlant, type PlantGeneProfile } from '@/lib/utils/lsystem-generator';
import { CenteredLSystemPlant } from '@/components/3d/lsystem-plant';

export default function PlantLabPage() {
  const [currentPlant, setCurrentPlant] = useState<PlantGeneProfile | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [plantHistory, setPlantHistory] = useState<PlantGeneProfile[]>([]);

  // Generate initial plant on mount
  useEffect(() => {
    generateNewPlant();
  }, []);

  const generateNewPlant = () => {
    setIsGenerating(true);
    
    // Simulate generation time for effect
    setTimeout(() => {
      const seed = Math.floor(Math.random() * 1000000);
      const plant = generateRandomPlant(seed);
      
      setCurrentPlant(plant);
      setPlantHistory(prev => [plant, ...prev.slice(0, 4)]); // Keep last 5
      setIsGenerating(false);
    }, 300);
  };

  if (!currentPlant) {
    return (
      <div className="-mt-24 flex min-h-screen items-center justify-center bg-[#2f3731] pt-24">
        <div className="text-sm font-medium uppercase tracking-[0.16em] text-white/65">
          Initializing Plant Lab...
        </div>
      </div>
    );
  }

  return (
    <div className="-mt-24 min-h-screen bg-[#2f3731] pt-24 text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#2f3731]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium tracking-tight">🌿 Plant Laboratory</h1>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/60">
              Procedural L-System Plant Generator
            </p>
          </div>
          <a 
            href="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-[#e9eaae] transition-colors duration-300 hover:text-[#f4f4d7]"
          >
            <span className="border-b border-[#d2c22d]/70 pb-0.5">← Back Home</span>
          </a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 3D Viewer - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-lg border border-white/15 bg-white/[0.03] backdrop-blur-sm">
              {/* Canvas */}
              <div className="relative aspect-[4/3] bg-gradient-to-b from-[#3a443d] to-[#202621]">
                <Canvas>
                  <PerspectiveCamera makeDefault position={[0, 0, 4]} />
                  <OrbitControls 
                    enableDamping 
                    dampingFactor={0.05}
                    minDistance={2}
                    maxDistance={8}
                  />
                  
                  {/* Lighting */}
                  <ambientLight intensity={0.6} />
                  <directionalLight position={[10, 10, 5]} intensity={0.8} />
                  <directionalLight position={[-5, -5, -5]} intensity={0.3} />

                  {/* Ground plane */}
                  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
                    <planeGeometry args={[10, 10]} />
                    <meshBasicMaterial color="#465045" wireframe />
                  </mesh>

                  {/* Plant */}
                  <CenteredLSystemPlant profile={currentPlant} />

                  {/* Post-processing effects for glow */}
                  <EffectComposer>
                    <Bloom
                      intensity={1.2}
                      luminanceThreshold={0.3}
                      luminanceSmoothing={0.9}
                      mipmapBlur
                    />
                  </EffectComposer>
                </Canvas>

                {/* Generation overlay */}
                {isGenerating && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#2f3731]/85">
                    <div className="text-center">
                      <div className="text-6xl mb-2 animate-pulse">🌱</div>
                      <div className="text-sm font-medium uppercase tracking-[0.16em] text-white/70">
                        Growing plant...
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="border-t border-white/10 bg-white/[0.03] p-6">
                <button
                  onClick={generateNewPlant}
                  disabled={isGenerating}
                  className="w-full rounded-lg bg-[#d2c22d] px-6 py-3 text-sm font-medium uppercase tracking-[0.12em] text-[#2f3731] transition-all hover:scale-[1.02] hover:bg-[#e9eaae] active:scale-[0.98] disabled:scale-100 disabled:cursor-not-allowed disabled:bg-white/30 disabled:text-white/70"
                >
                  {isGenerating ? '🌱 Growing...' : '✨ Generate New Plant'}
                </button>
                <p className="mt-2 text-center text-xs text-white/60">
                  Click and drag to rotate • Scroll to zoom
                </p>
              </div>
            </div>
          </div>

          {/* Info Panel - 1 column */}
          <div className="space-y-6">
            {/* Plant Info */}
            <div className="rounded-lg border border-white/15 bg-white/[0.03] p-6 backdrop-blur-sm">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-medium tracking-tight">
                <span>🏷️</span> Plant DNA
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.16em] text-white/60">Common Name</div>
                  <div className="text-lg font-medium">{currentPlant.name}</div>
                </div>

                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.16em] text-white/60">Scientific Name</div>
                  <div className="font-medium italic text-white/85">{currentPlant.scientificName}</div>
                </div>

                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.16em] text-white/60">Species</div>
                  <div className="font-medium capitalize">
                    {currentPlant.species}
                    {currentPlant.hybridWith && (
                      <span className="text-white/55"> × {currentPlant.hybridWith}</span>
                    )}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <div className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-white/60">Genetic Parameters</div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-white/85">
                    <div>
                      <span className="text-white/60">Branch Angle:</span>
                      <div className="font-mono">{currentPlant.params.angle.toFixed(1)}°</div>
                    </div>
                    <div>
                      <span className="text-white/60">Iterations:</span>
                      <div className="font-mono">{currentPlant.params.iterations}</div>
                    </div>
                    <div>
                      <span className="text-white/60">Seg. Length:</span>
                      <div className="font-mono">{currentPlant.params.segmentLength.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-white/60">Seg. Decay:</span>
                      <div className="font-mono">{currentPlant.params.segmentDecay.toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <div className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-white/60">Color Palette</div>
                  <div className="flex gap-2">
                    <div 
                      className="h-10 w-10 rounded border border-white/20"
                      style={{ backgroundColor: currentPlant.colors.stem }}
                      title="Stem"
                    />
                    <div 
                      className="h-10 w-10 rounded border border-white/20"
                      style={{ backgroundColor: currentPlant.colors.leaf }}
                      title="Leaf"
                    />
                    <div 
                      className="h-10 w-10 rounded border border-white/20"
                      style={{ backgroundColor: currentPlant.colors.flower }}
                      title="Flower"
                    />
                    <div 
                      className="h-10 w-10 rounded border border-white/20"
                      style={{ backgroundColor: currentPlant.colors.accent }}
                      title="Accent"
                    />
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <div className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-white/60">L-System Rules</div>
                  <div className="max-h-32 space-y-1 overflow-y-auto rounded border border-white/10 bg-white/[0.03] p-3 font-mono text-xs text-white/85">
                    <div>
                      <span className="text-white/60">Axiom:</span> {currentPlant.params.axiom}
                    </div>
                    {Object.entries(currentPlant.params.rules).map(([symbol, rule]) => (
                      <div key={symbol}>
                        <span className="text-white/60">{symbol} →</span> {rule as string}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* History */}
            {plantHistory.length > 1 && (
              <div className="rounded-lg border border-white/15 bg-white/[0.03] p-6 backdrop-blur-sm">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-medium tracking-tight">
                  <span>📚</span> Recent Plants
                </h2>
                <div className="space-y-2">
                  {plantHistory.slice(1, 5).map((plant, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPlant(plant)}
                      className="w-full rounded border border-white/10 bg-white/[0.03] p-3 text-left transition-colors hover:bg-white/10"
                    >
                      <div className="font-medium text-sm truncate">{plant.name}</div>
                      <div className="text-xs italic text-white/60">{plant.scientificName}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Info Card */}
            <div className="rounded-lg border border-white/15 bg-white/[0.03] p-6 backdrop-blur-sm">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-medium tracking-tight">
                <span>ℹ️</span> About L-Systems
              </h2>
              <p className="text-sm leading-relaxed text-white/70">
                L-systems (Lindenmayer Systems) use recursive production rules to simulate 
                natural plant growth. Each plant is generated from a seed using branching 
                patterns inspired by real botanical structures like ferns, trees, and flowers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

