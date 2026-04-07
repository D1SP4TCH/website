"use client";

/**
 * Custom Shaders Collection
 * Retro gaming & cyberpunk effects
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// CRT Screen Shader (Old TV effect)
export const CRTShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
    distortion: { value: 0.1 },
    distortion2: { value: 0.05 },
    speed: { value: 0.3 },
    rollSpeed: { value: 0.1 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float distortion;
    uniform float distortion2;
    uniform float speed;
    uniform float rollSpeed;
    varying vec2 vUv;
    
    // CRT distortion
    vec2 barrelDistortion(vec2 coord, float amt) {
      vec2 cc = coord - 0.5;
      float dist = dot(cc, cc);
      return coord + cc * dist * amt;
    }
    
    void main() {
      vec2 uv = vUv;
      
      // Barrel distortion
      uv = barrelDistortion(uv, distortion);
      
      // Scanlines
      float scanline = sin(uv.y * 800.0) * 0.04;
      
      // RGB shift (chromatic aberration)
      float r = texture2D(tDiffuse, uv + vec2(0.001, 0.0)).r;
      float g = texture2D(tDiffuse, uv).g;
      float b = texture2D(tDiffuse, uv - vec2(0.001, 0.0)).b;
      
      vec3 color = vec3(r, g, b);
      
      // Add scanlines
      color -= scanline;
      
      // Vignette
      float vignette = smoothstep(0.8, 0.2, length(uv - 0.5));
      color *= vignette;
      
      // Random noise/static
      float noise = fract(sin(dot(uv + time, vec2(12.9898, 78.233))) * 43758.5453) * 0.05;
      color += noise;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

// Hologram Shader (Sci-fi effect)
export const HologramShader = {
  uniforms: {
    time: { value: 0 },
    color: { value: new THREE.Color(0x00ffff) },
    opacity: { value: 0.8 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec3 color;
    uniform float opacity;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      // Scanlines moving up
      float scanline = sin(vUv.y * 30.0 - time * 5.0) * 0.5 + 0.5;
      
      // Fresnel effect (glow on edges)
      float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
      
      // Glitch lines
      float glitch = step(0.98, sin(vUv.y * 50.0 + time * 10.0));
      
      // Combine effects
      vec3 finalColor = color * (scanline * 0.5 + 0.5);
      finalColor += color * fresnel * 0.5;
      finalColor += glitch * 0.3;
      
      // Flicker
      float flicker = sin(time * 20.0) * 0.05 + 0.95;
      
      gl_FragColor = vec4(finalColor * flicker, opacity * (scanline * 0.5 + 0.5));
    }
  `,
};

// Glitch Material Shader
export const GlitchShader = {
  uniforms: {
    time: { value: 0 },
    texture: { value: null },
    glitchIntensity: { value: 0.5 },
  },
  vertexShader: `
    varying vec2 vUv;
    uniform float time;
    uniform float glitchIntensity;
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Random glitch displacement
      float glitch = step(0.95, sin(time * 10.0 + position.y * 50.0));
      pos.x += glitch * glitchIntensity * sin(time * 50.0) * 0.1;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D texture;
    uniform float time;
    varying vec2 vUv;
    
    void main() {
      vec2 uv = vUv;
      
      // RGB split glitch
      float glitch = step(0.98, sin(uv.y * 100.0 + time * 20.0));
      vec2 offset = vec2(glitch * 0.05, 0.0);
      
      float r = texture2D(texture, uv + offset).r;
      float g = texture2D(texture, uv).g;
      float b = texture2D(texture, uv - offset).b;
      
      vec3 color = vec3(r, g, b);
      
      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

// Pixelated Shader (Retro game style)
export const PixelatedShader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: new THREE.Vector2(64, 64) }, // Pixel grid size
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    varying vec2 vUv;
    
    void main() {
      vec2 uv = vUv;
      
      // Pixelate
      vec2 pixel = floor(uv * resolution) / resolution;
      
      vec4 color = texture2D(tDiffuse, pixel);
      
      gl_FragColor = color;
    }
  `,
};

// VHS Distortion Shader
export const VHSShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
    distortionAmount: { value: 0.5 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float distortionAmount;
    varying vec2 vUv;
    
    void main() {
      vec2 uv = vUv;
      
      // VHS tracking distortion
      float distortion = sin(uv.y * 10.0 + time * 2.0) * distortionAmount * 0.01;
      uv.x += distortion;
      
      // Color bleeding
      float r = texture2D(tDiffuse, uv + vec2(0.002, 0.0)).r;
      float g = texture2D(tDiffuse, uv).g;
      float b = texture2D(tDiffuse, uv - vec2(0.002, 0.0)).b;
      
      vec3 color = vec3(r, g, b);
      
      // Horizontal lines (tracking errors)
      float line = step(0.99, sin(uv.y * 500.0 + time * 5.0));
      color += line * 0.1;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

/**
 * React Components for Easy Use
 */

// Hologram Material Component
export function HologramMaterial({ color = "#00ffff" }: { color?: string }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <shaderMaterial
      ref={materialRef}
      vertexShader={HologramShader.vertexShader}
      fragmentShader={HologramShader.fragmentShader}
      uniforms={HologramShader.uniforms}
      transparent
      side={THREE.DoubleSide}
    />
  );
}

// Glitch Material Component
export function GlitchMaterial({ 
  texture,
  intensity = 0.5 
}: { 
  texture?: THREE.Texture;
  intensity?: number;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
      materialRef.current.uniforms.glitchIntensity.value = intensity;
    }
  });

  return (
    <shaderMaterial
      ref={materialRef}
      vertexShader={GlitchShader.vertexShader}
      fragmentShader={GlitchShader.fragmentShader}
      uniforms={{
        ...GlitchShader.uniforms,
        texture: { value: texture },
      }}
    />
  );
}

// Animated Scanlines Overlay
export function Scanlines({ 
  intensity = 0.5,
  count = 800 
}: { 
  intensity?: number;
  count?: number;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh position={[0, 0, 0.5]}>
      <planeGeometry args={[100, 100]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.0, 1.0);
          }
        `}
        fragmentShader={`
          uniform float time;
          varying vec2 vUv;
          
          void main() {
            float scanline = sin(vUv.y * ${count.toFixed(1)} - time * 10.0) * ${intensity.toFixed(2)};
            gl_FragColor = vec4(0.0, 0.0, 0.0, scanline);
          }
        `}
        uniforms={{
          time: { value: 0 },
        }}
      />
    </mesh>
  );
}

// Screen Glow Effect (for monitors)
export function ScreenGlow({
  color = "#3b82f6",
  intensity = 1.0,
  position,
  size = [0.6, 0.4],
}: {
  color?: string;
  intensity?: number;
  position: [number, number, number];
  size?: [number, number];
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh position={position}>
      <planeGeometry args={size} />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float time;
          uniform vec3 color;
          uniform float intensity;
          varying vec2 vUv;
          
          void main() {
            vec2 center = vUv - 0.5;
            float dist = length(center);
            float glow = 1.0 - smoothstep(0.0, 0.5, dist);
            
            // Pulsing effect
            float pulse = sin(time * 2.0) * 0.2 + 0.8;
            
            gl_FragColor = vec4(color, glow * intensity * pulse * 0.3);
          }
        `}
        uniforms={{
          time: { value: 0 },
          color: { value: new THREE.Color(color) },
          intensity: { value: intensity },
        }}
      />
    </mesh>
  );
}





