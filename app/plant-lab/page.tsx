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
      <div className="min-h-screen bg-[#E8E4D5] flex items-center justify-center">
        <div className="text-[#4A4035] text-xl">Initializing Plant Lab...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8E4D5] text-[#4A4035]">
      {/* Header */}
      <header className="border-b border-[#4A4035]/20 bg-[#E8E4D5]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🌿 Plant Laboratory</h1>
            <p className="text-sm text-[#8B8075]">Procedural L-System Plant Generator</p>
          </div>
          <a 
            href="/"
            className="px-4 py-2 border border-[#4A4035]/30 rounded hover:bg-[#4A4035]/5 transition-colors"
          >
            ← Back Home
          </a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 3D Viewer - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white/40 backdrop-blur-sm rounded-lg border border-[#4A4035]/20 overflow-hidden">
              {/* Canvas */}
              <div className="relative aspect-[4/3] bg-gradient-to-b from-[#E8E4D5] to-[#D5E8E4]">
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
                    <meshBasicMaterial color="#C4B5A0" wireframe />
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
                  <div className="absolute inset-0 bg-[#E8E4D5]/80 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-2 animate-pulse">🌱</div>
                      <div className="text-[#4A4035] font-medium">Growing plant...</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="p-6 bg-white/60 border-t border-[#4A4035]/20">
                <button
                  onClick={generateNewPlant}
                  disabled={isGenerating}
                  className="w-full bg-[#7BA05B] hover:bg-[#6B9A5B] disabled:bg-[#8B8075] text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
                >
                  {isGenerating ? '🌱 Growing...' : '✨ Generate New Plant'}
                </button>
                <p className="text-xs text-[#8B8075] text-center mt-2">
                  Click and drag to rotate • Scroll to zoom
                </p>
              </div>
            </div>
          </div>

          {/* Info Panel - 1 column */}
          <div className="space-y-6">
            {/* Plant Info */}
            <div className="bg-white/40 backdrop-blur-sm rounded-lg border border-[#4A4035]/20 p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🏷️</span> Plant DNA
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-[#8B8075]">Common Name</div>
                  <div className="font-semibold text-lg">{currentPlant.name}</div>
                </div>

                <div>
                  <div className="text-sm text-[#8B8075]">Scientific Name</div>
                  <div className="font-medium italic">{currentPlant.scientificName}</div>
                </div>

                <div>
                  <div className="text-sm text-[#8B8075]">Species</div>
                  <div className="font-medium capitalize">
                    {currentPlant.species}
                    {currentPlant.hybridWith && (
                      <span className="text-[#8B8075]"> × {currentPlant.hybridWith}</span>
                    )}
                  </div>
                </div>

                <div className="border-t border-[#4A4035]/10 pt-4">
                  <div className="text-sm text-[#8B8075] mb-2">Genetic Parameters</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-[#8B8075]">Branch Angle:</span>
                      <div className="font-mono">{currentPlant.params.angle.toFixed(1)}°</div>
                    </div>
                    <div>
                      <span className="text-[#8B8075]">Iterations:</span>
                      <div className="font-mono">{currentPlant.params.iterations}</div>
                    </div>
                    <div>
                      <span className="text-[#8B8075]">Seg. Length:</span>
                      <div className="font-mono">{currentPlant.params.segmentLength.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-[#8B8075]">Seg. Decay:</span>
                      <div className="font-mono">{currentPlant.params.segmentDecay.toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#4A4035]/10 pt-4">
                  <div className="text-sm text-[#8B8075] mb-2">Color Palette</div>
                  <div className="flex gap-2">
                    <div 
                      className="w-10 h-10 rounded border border-[#4A4035]/20"
                      style={{ backgroundColor: currentPlant.colors.stem }}
                      title="Stem"
                    />
                    <div 
                      className="w-10 h-10 rounded border border-[#4A4035]/20"
                      style={{ backgroundColor: currentPlant.colors.leaf }}
                      title="Leaf"
                    />
                    <div 
                      className="w-10 h-10 rounded border border-[#4A4035]/20"
                      style={{ backgroundColor: currentPlant.colors.flower }}
                      title="Flower"
                    />
                    <div 
                      className="w-10 h-10 rounded border border-[#4A4035]/20"
                      style={{ backgroundColor: currentPlant.colors.accent }}
                      title="Accent"
                    />
                  </div>
                </div>

                <div className="border-t border-[#4A4035]/10 pt-4">
                  <div className="text-sm text-[#8B8075] mb-2">L-System Rules</div>
                  <div className="bg-[#4A4035]/5 rounded p-3 font-mono text-xs space-y-1 max-h-32 overflow-y-auto">
                    <div>
                      <span className="text-[#8B8075]">Axiom:</span> {currentPlant.params.axiom}
                    </div>
                    {Object.entries(currentPlant.params.rules).map(([symbol, rule]) => (
                      <div key={symbol}>
                        <span className="text-[#8B8075]">{symbol} →</span> {rule as string}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* History */}
            {plantHistory.length > 1 && (
              <div className="bg-white/40 backdrop-blur-sm rounded-lg border border-[#4A4035]/20 p-6">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span>📚</span> Recent Plants
                </h2>
                <div className="space-y-2">
                  {plantHistory.slice(1, 5).map((plant, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPlant(plant)}
                      className="w-full text-left p-3 bg-white/40 hover:bg-white/60 rounded border border-[#4A4035]/10 transition-colors"
                    >
                      <div className="font-medium text-sm truncate">{plant.name}</div>
                      <div className="text-xs text-[#8B8075] italic">{plant.scientificName}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Info Card */}
            <div className="bg-white/40 backdrop-blur-sm rounded-lg border border-[#4A4035]/20 p-6">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span>ℹ️</span> About L-Systems
              </h2>
              <p className="text-sm text-[#4A4035]/80 leading-relaxed">
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

