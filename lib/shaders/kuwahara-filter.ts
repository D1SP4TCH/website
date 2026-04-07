/**
 * Kuwahara Filter - Painterly Post-Processing Effect
 * Extracted from Blender node setup
 * 
 * Creates a painterly/anisotropic effect by smoothing areas while preserving edges
 * This is the key technique from the Blender composition setup
 */

import type { JSX } from 'react';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

const KuwaharaFilterMaterial = shaderMaterial(
  {
    tDiffuse: null,
    uResolution: new THREE.Vector2(1, 1),
    uSize: 4.0, // Filter size (from Blender: Size: 4.000)
    uSharpness: 3.0, // Sharpness (from Blender: Sharpen: 3.000)
    uEccentricity: 1.0, // Eccentricity (from Blender: Eccentric: 1.000)
  },
  // Vertex
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment - Kuwahara filter implementation
  `
    uniform sampler2D tDiffuse;
    uniform vec2 uResolution;
    uniform float uSize;
    uniform float uSharpness;
    uniform float uEccentricity;
    
    varying vec2 vUv;
    
    // Calculate variance in a quadrant
    float calculateVariance(vec2 uv, vec2 offset, float size) {
      vec2 texelSize = 1.0 / uResolution;
      vec3 mean = vec3(0.0);
      vec3 meanSq = vec3(0.0);
      float count = 0.0;
      
      for (float y = -size; y <= size; y++) {
        for (float x = -size; x <= size; x++) {
          vec2 sampleUV = uv + (offset + vec2(x, y)) * texelSize;
          vec3 color = texture2D(tDiffuse, sampleUV).rgb;
          mean += color;
          meanSq += color * color;
          count += 1.0;
        }
      }
      
      mean /= count;
      meanSq /= count;
      vec3 variance = meanSq - mean * mean;
      return dot(variance, vec3(1.0));
    }
    
    void main() {
      vec2 texelSize = 1.0 / uResolution;
      float size = uSize;
      
      // Four quadrants
      vec2 offsets[4];
      offsets[0] = vec2(-size, -size); // Bottom-left
      offsets[1] = vec2(size, -size);  // Bottom-right
      offsets[2] = vec2(-size, size);  // Top-left
      offsets[3] = vec2(size, size);   // Top-right
      
      float variances[4];
      vec3 colors[4];
      
      // Calculate variance and mean color for each quadrant
      for (int i = 0; i < 4; i++) {
        vec2 offset = offsets[i] * 0.5;
        variances[i] = calculateVariance(vUv, offset, size);
        
        // Get mean color of quadrant
        vec3 mean = vec3(0.0);
        float count = 0.0;
        for (float y = -size; y <= size; y++) {
          for (float x = -size; x <= size; x++) {
            vec2 sampleUV = vUv + (offset + vec2(x, y)) * texelSize;
            mean += texture2D(tDiffuse, sampleUV).rgb;
            count += 1.0;
          }
        }
        colors[i] = mean / count;
      }
      
      // Find quadrant with minimum variance (most uniform)
      float minVariance = variances[0];
      int minIndex = 0;
      for (int i = 1; i < 4; i++) {
        if (variances[i] < minVariance) {
          minVariance = variances[i];
          minIndex = i;
        }
      }
      
      // Use color from most uniform quadrant
      vec3 color = colors[minIndex];
      
      // Apply sharpness
      vec3 original = texture2D(tDiffuse, vUv).rgb;
      color = mix(original, color, 1.0 / (1.0 + uSharpness));
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
);

extend({ KuwaharaFilterMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    kuwaharaFilterMaterial: JSX.IntrinsicElements['shaderMaterial'] & {
      tDiffuse?: THREE.Texture;
      uResolution?: THREE.Vector2;
      uSize?: number;
      uSharpness?: number;
      uEccentricity?: number;
    };
  }
}

export { KuwaharaFilterMaterial };

