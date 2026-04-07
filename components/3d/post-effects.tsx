"use client";

/**
 * Post-Processing Effects
 * Full-screen effects applied to entire scene
 */

import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise, Glitch, Pixelation } from "@react-three/postprocessing";
import { BlendFunction, GlitchMode } from "postprocessing";
import * as THREE from "three";

/**
 * Retro Gaming Effect Pack
 * Combines CRT, scanlines, bloom for authentic retro look
 */
export function RetroEffects() {
  return (
    <EffectComposer>
      {/* Bloom for glow */}
      <Bloom
        intensity={0.5}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
      />
      
      {/* Chromatic aberration (RGB split) */}
      <ChromaticAberration
        offset={new THREE.Vector2(0.002, 0.002)}
        blendFunction={BlendFunction.NORMAL}
      />
      
      {/* Vignette (darkens edges) */}
      <Vignette
        offset={0.3}
        darkness={0.5}
      />
      
      {/* Noise/grain */}
      <Noise
        opacity={0.1}
        blendFunction={BlendFunction.OVERLAY}
      />
      
      {/* Pixelation for retro look */}
      <Pixelation granularity={3} />
    </EffectComposer>
  );
}

/**
 * Cyberpunk Effect Pack
 * Heavy bloom, glitch, chromatic aberration
 */
export function CyberpunkEffects() {
  return (
    <EffectComposer>
      {/* Strong bloom for neon glow */}
      <Bloom
        intensity={1.5}
        luminanceThreshold={0.1}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      
      {/* Heavy chromatic aberration */}
      <ChromaticAberration
        offset={new THREE.Vector2(0.005, 0.005)}
        blendFunction={BlendFunction.NORMAL}
      />
      
      {/* Glitch effect */}
      <Glitch
        delay={new THREE.Vector2(1.5, 3.5)}
        duration={new THREE.Vector2(0.1, 0.3)}
        strength={new THREE.Vector2(0.1, 0.2)}
        mode={GlitchMode.SPORADIC}
      />
      
      {/* Vignette */}
      <Vignette
        offset={0.2}
        darkness={0.7}
      />
    </EffectComposer>
  );
}

/**
 * Clean Modern Effect Pack
 * Subtle effects for professional look
 */
export function ModernEffects() {
  return (
    <EffectComposer>
      {/* Subtle bloom */}
      <Bloom
        intensity={0.3}
        luminanceThreshold={0.9}
        luminanceSmoothing={0.7}
      />
      
      {/* Light chromatic aberration */}
      <ChromaticAberration
        offset={new THREE.Vector2(0.001, 0.001)}
        blendFunction={BlendFunction.NORMAL}
      />
      
      {/* Subtle vignette */}
      <Vignette
        offset={0.5}
        darkness={0.3}
      />
    </EffectComposer>
  );
}

/**
 * Minimal Effect Pack
 * Just bloom for subtle glow
 */
export function MinimalEffects() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.2}
        luminanceThreshold={0.95}
        luminanceSmoothing={0.5}
      />
    </EffectComposer>
  );
}

/**
 * VHS Effect Pack
 * Old tape distortion look
 */
export function VHSEffects() {
  return (
    <EffectComposer>
      {/* Chromatic aberration */}
      <ChromaticAberration
        offset={new THREE.Vector2(0.003, 0.003)}
        blendFunction={BlendFunction.NORMAL}
      />
      
      {/* Heavy noise */}
      <Noise
        opacity={0.2}
        blendFunction={BlendFunction.OVERLAY}
      />
      
      {/* Vignette */}
      <Vignette
        offset={0.2}
        darkness={0.6}
      />
      
      {/* Slight glitch */}
      <Glitch
        delay={new THREE.Vector2(2, 4)}
        duration={new THREE.Vector2(0.05, 0.1)}
        strength={new THREE.Vector2(0.05, 0.1)}
        mode={GlitchMode.SPORADIC}
      />
    </EffectComposer>
  );
}





