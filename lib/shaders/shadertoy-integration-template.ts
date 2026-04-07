/**
 * Template for integrating Shadertoy shaders
 * 
 * To use:
 * 1. Copy the shader code from Shadertoy
 * 2. Replace the placeholder code below
 * 3. Adapt mainImage() to main()
 * 4. Convert fragCoord/iResolution to vUv
 */

import type { JSX } from 'react';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { NOISE_FUNCTIONS } from './painterly-shaders';

// ============================================
// SHADERTOY INTEGRATION TEMPLATE
// ============================================

/**
 * Step 1: Extract useful functions from Shadertoy
 * (These are usually in "Common" or "Buffer A" tabs)
 */
const SHADERTOY_FUNCTIONS = `
  // Paste any helper functions here from Shadertoy
  // Example:
  // float someFunction(vec2 uv) {
  //   return ...;
  // }
`;

/**
 * Step 2: Create the material
 * 
 * Shadertoy format:
 * void mainImage(out vec4 fragColor, in vec2 fragCoord) {
 *   vec2 uv = fragCoord / iResolution.xy;
 *   // ... shader code
 *   fragColor = vec4(color, 1.0);
 * }
 * 
 * Three.js format:
 * void main() {
 *   vec2 uv = vUv;
 *   // ... shader code
 *   gl_FragColor = vec4(color, 1.0);
 * }
 */
export const ShadertoyMaterial = shaderMaterial(
  {
    // Uniforms from Shadertoy (convert iTime, iResolution, etc.)
    uTime: 0,
    uColor: new THREE.Color(0xffffff),
    // Add other uniforms as needed
    // uResolution: new THREE.Vector2(1, 1),
  },
  // Vertex Shader
  `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    ${NOISE_FUNCTIONS}
    ${SHADERTOY_FUNCTIONS}
    
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      
      // Optional: Add vertex animation from Shadertoy if it has any
      vec3 pos = position;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment Shader (paste Shadertoy code here, adapted)
  `
    uniform float uTime;
    uniform vec3 uColor;
    // uniform vec2 uResolution; // If needed
    
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    ${NOISE_FUNCTIONS}
    ${SHADERTOY_FUNCTIONS}
    
    void main() {
      // Convert Shadertoy coordinates to UV
      // Shadertoy: vec2 uv = fragCoord / iResolution.xy;
      // Three.js: vec2 uv = vUv;
      vec2 uv = vUv;
      
      // ============================================
      // PASTE YOUR SHADERTOY CODE HERE
      // ============================================
      // Replace mainImage() with main()
      // Replace fragColor with gl_FragColor
      // Replace iTime with uTime
      // Replace iResolution with uResolution (if needed)
      // Replace fragCoord/iResolution.xy with vUv
      
      // Example placeholder:
      vec3 color = vec3(0.5);
      
      // Your shader code goes here...
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
);

extend({ ShadertoyMaterial });

// Type declaration
declare module '@react-three/fiber' {
  interface ThreeElements {
    shadertoyMaterial: JSX.IntrinsicElements['shaderMaterial'] & {
      uTime?: number;
      uColor?: THREE.Color;
    };
  }
}

// ============================================
// USAGE EXAMPLE
// ============================================

/**
 * Use in a component like this:
 * 
 * import { useFrame } from '@react-three/fiber';
 * 
 * function MyComponent() {
 *   const materialRef = useRef();
 *   
 *   useFrame((state) => {
 *     if (materialRef.current) {
 *       materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
 *     }
 *   });
 *   
 *   return (
 *     <mesh>
 *       <planeGeometry args={[2, 2]} />
 *       <shadertoyMaterial 
 *         ref={materialRef}
 *         uTime={0}
 *         uColor={new THREE.Color(0xffffff)}
 *       />
 *     </mesh>
 *   );
 * }
 */




