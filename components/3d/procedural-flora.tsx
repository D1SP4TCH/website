'use client';

import { useMemo, useRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { SeededRandom } from '@/lib/utils/seeded-random';
import type { PlantGenes } from '@/lib/data/garden-portfolio';
import {
  NOISE_FUNCTIONS,
  PAINTERLY_PALETTES,
} from '@/lib/shaders/painterly-shaders';

// ============================================
// FLOWER SHADER
// ============================================

const FlowerPetalMaterial = shaderMaterial(
  {
    uColor: new THREE.Color('#E8A0B0'),
    uCenterColor: new THREE.Color('#FFD700'),
    uTime: 0,
    uStylized: 0.0, // 0=painterly, 1=crystalline Blender style
  },
  // Vertex - gentle sway
  `
    uniform float uTime;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    
    ${NOISE_FUNCTIONS}
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      
      vec3 pos = position;
      
      // Gentle petal sway
      float sway = sin(uTime * 1.2 + pos.x * 2.0) * 0.02;
      pos.x += sway;
      pos.z += sway * 0.5;
      
      vec4 worldPos = modelMatrix * vec4(pos, 1.0);
      vWorldPosition = worldPos.xyz;
      
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  // Fragment - stylized petal shading (Blender-inspired)
  `
    uniform vec3 uColor;
    uniform vec3 uCenterColor;
    uniform float uTime;
    uniform float uStylized;
    
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    
    ${NOISE_FUNCTIONS}
    
    void main() {
      vec3 lightDir = normalize(vec3(12.0, 18.0, 8.0) - vWorldPosition);
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float NdotL = dot(vNormal, lightDir);
      
      // Base color with gradient
      float dist = length(vPosition.xz);
      float centerBlend = smoothstep(0.3, 0.0, dist);
      vec3 baseColor = mix(uColor, uCenterColor, centerBlend);
      
      vec3 color;
      
      if (uStylized > 0.5) {
        // ====== BLENDER STYLIZED MODE ======
        
        // ColorRamp shading - discrete bands
        float lightValue = NdotL * 0.5 + 0.5;
        vec3 shadowColor = baseColor * 0.5;
        vec3 midColor = baseColor * 0.9;
        vec3 highlightColor = baseColor * 1.3 + vec3(0.2);
        color = colorRampStylized(lightValue, shadowColor, midColor, highlightColor);
        
        // Crystalline pattern
        vec2 uv = vPosition.xy * 0.8;
        vec3 crystal = crystallinePattern(uv, 8.0, uTime);
        
        // Add white streaks
        color = mix(color, vec3(1.0), crystal.z * 0.6);
        
        // Overlay blend for faceted look
        vec3 facets = vec3(crystal.x);
        color = overlayBlend(color, facets, 0.4);
        
        // Strong rim light
        float rim = fresnelEffect(vNormal, viewDir, 2.5);
        color += vec3(0.8, 0.9, 1.0) * rim * 0.8;
        
      } else {
        // ====== PAINTERLY MODE ======
        
        float light = smoothstep(-0.2, 0.8, NdotL) * 0.5 + 0.5;
        color = baseColor * light;
        
        // Enhanced vein pattern
        vec2 uv = vPosition.xy * 0.5;
        float mainVein = lineDistanceField(uv, vec2(0.0, -0.5), vec2(0.0, 0.5));
        float vein1 = lineDistanceField(uv, vec2(0.0, 0.0), vec2(0.3, 0.3));
        float vein2 = lineDistanceField(uv, vec2(0.0, 0.0), vec2(-0.3, 0.3));
        float vein3 = lineDistanceField(uv, vec2(0.0, 0.0), vec2(0.2, -0.2));
        float vein4 = lineDistanceField(uv, vec2(0.0, 0.0), vec2(-0.2, -0.2));
        
        float veins = smoothstep(0.015, 0.0, mainVein) * 0.08;
        veins += smoothstep(0.01, 0.0, min(min(vein1, vein2), min(vein3, vein4))) * 0.05;
        veins *= (0.8 + snoise(vWorldPosition * 5.0) * 0.2);
        color += veins * uColor * 0.3;
        
        // Subsurface
        float backlight = max(0.0, dot(-vNormal, lightDir)) * 0.3;
        color += uColor * backlight;
        
        // Subtle rim
        float rim = fresnelEffect(vNormal, viewDir, 3.0);
        color += vec3(1.0) * rim * 0.2;
      }
      
      float alpha = uStylized > 0.5 ? 0.9 : 0.95;
      gl_FragColor = vec4(color, alpha);
    }
  `
);

// ============================================
// GRASS BLADE SHADER
// ============================================

const GrassBladeMaterial = shaderMaterial(
  {
    uColor: new THREE.Color('#7BA05B'),
    uTipColor: new THREE.Color('#A8C686'),
    uTime: 0,
    uWindStrength: 0.1,
  },
  // Vertex - grass sway
  `
    uniform float uTime;
    uniform float uWindStrength;
    
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    
    ${NOISE_FUNCTIONS}
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      vUv = uv;
      
      vec3 pos = position;
      
      // Height-based sway (more at tip)
      float heightFactor = smoothstep(0.0, 1.0, pos.y);
      heightFactor = heightFactor * heightFactor;
      
      float windNoise = snoise(vec3(pos.xz * 0.5, uTime * 0.8));
      float wind = sin(uTime * 2.5 + pos.x * 0.5 + windNoise) * uWindStrength * heightFactor;
      
      pos.x += wind;
      pos.z += wind * 0.4;
      
      // Slight bend
      pos.x += heightFactor * 0.1;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment - grass blade shading
  `
    uniform vec3 uColor;
    uniform vec3 uTipColor;
    uniform float uTime;
    
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    
    void main() {
      vec3 lightDir = normalize(vec3(12.0, 18.0, 8.0));
      float NdotL = dot(vNormal, lightDir);
      float light = NdotL * 0.4 + 0.6;
      
      // Gradient from base to tip
      float tipBlend = smoothstep(0.0, 1.0, vPosition.y);
      vec3 color = mix(uColor * 0.8, uTipColor, tipBlend);
      
      color *= light;
      
      // Translucency
      float backlight = max(0.0, dot(-vNormal, lightDir)) * 0.2;
      color += uTipColor * backlight;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
);

extend({ FlowerPetalMaterial, GrassBladeMaterial });

// Type declarations
declare module '@react-three/fiber' {
  interface ThreeElements {
    flowerPetalMaterial: JSX.IntrinsicElements['shaderMaterial'];
    grassBladeMaterial: JSX.IntrinsicElements['shaderMaterial'];
  }
}

// ============================================
// PROCEDURAL FLOWER
// ============================================

type PetalShapeType = 'teardrop' | 'round' | 'spear' | 'heart';

// Create petal shape geometry variants for species diversity
const createPetalGeometry = (shapeType: PetalShapeType = 'teardrop') => {
  const shape = new THREE.Shape();

  if (shapeType === 'round') {
    // Rounded daisy-like petal
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.22, 0.08, 0.3, 0.42, 0.18, 0.75);
    shape.bezierCurveTo(0.1, 0.95, 0.0, 1.02, 0.0, 1.02);
    shape.bezierCurveTo(0.0, 1.02, -0.1, 0.95, -0.18, 0.75);
    shape.bezierCurveTo(-0.3, 0.42, -0.22, 0.08, 0, 0);
  } else if (shapeType === 'spear') {
    // Long spear/lily-like petal
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.08, 0.08, 0.12, 0.45, 0.07, 0.9);
    shape.bezierCurveTo(0.03, 1.15, 0.0, 1.22, 0.0, 1.22);
    shape.bezierCurveTo(0.0, 1.22, -0.03, 1.15, -0.07, 0.9);
    shape.bezierCurveTo(-0.12, 0.45, -0.08, 0.08, 0, 0);
  } else if (shapeType === 'heart') {
    // Heart-like cosmos/anemone petal
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.2, 0.12, 0.24, 0.42, 0.1, 0.72);
    shape.bezierCurveTo(0.03, 0.86, 0.06, 0.96, 0.0, 1.03);
    shape.bezierCurveTo(-0.06, 0.96, -0.03, 0.86, -0.1, 0.72);
    shape.bezierCurveTo(-0.24, 0.42, -0.2, 0.12, 0, 0);
  } else {
    // Teardrop default petal
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.15, 0.1, 0.2, 0.4, 0.12, 0.7);
    shape.bezierCurveTo(0.05, 0.9, 0, 1, 0, 1);
    shape.bezierCurveTo(0, 1, -0.05, 0.9, -0.12, 0.7);
    shape.bezierCurveTo(-0.2, 0.4, -0.15, 0.1, 0, 0);
  }

  const geometry = new THREE.ShapeGeometry(shape, 16);
  return geometry;
};

interface FlowerProps {
  position: THREE.Vector3;
  genes: PlantGenes;
  petalCount?: number;
  petalColor?: string;
  scale?: number;
  variationSeed?: number;
  stylized?: boolean; // Enable Blender-style crystalline look
  noRotation?: boolean; // Disable rotation for decorative flowers
}

export const ProceduralFlower = ({ 
  position, 
  genes, 
  petalCount = 5,
  petalColor,
  scale = 1,
  variationSeed,
  stylized = false,
  noRotation = false
}: FlowerProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const materialRefs = useRef<THREE.ShaderMaterial[]>([]);
  
  // Pre-compute ALL random values in useMemo to avoid render-time randomness
  const flowerData = useMemo(() => {
    const positionHash = Math.floor((position.x * 997 + position.y * 211 + position.z * 431) * 1000);
    const rng = new SeededRandom(genes.seed + 5000 + (variationSeed ?? positionHash));

    const flowerStyle = rng.pick(['cosmos', 'anemone', 'daisy', 'lily'] as const);
    const styleConfig = {
      cosmos: { petalBias: 1, centerScale: 0.85, innerRatio: 0.42, tiltBase: 0.26, tiltVar: 0.22, petalShape: 'heart' as PetalShapeType, centerType: 'button' as const },
      anemone: { petalBias: 2, centerScale: 1.35, innerRatio: 0.85, tiltBase: 0.2, tiltVar: 0.15, petalShape: 'round' as PetalShapeType, centerType: 'disk' as const },
      daisy: { petalBias: 0, centerScale: 1.0, innerRatio: 0.55, tiltBase: 0.32, tiltVar: 0.2, petalShape: 'teardrop' as PetalShapeType, centerType: 'button' as const },
      lily: { petalBias: -1, centerScale: 0.7, innerRatio: 0.18, tiltBase: 0.12, tiltVar: 0.1, petalShape: 'spear' as PetalShapeType, centerType: 'star' as const },
    }[flowerStyle];

    const stemHeight = 0.34 + rng.range(0, 0.42);
    const petals = Math.max(4, petalCount + styleConfig.petalBias + rng.int(-1, 2));
    const petalLength = 0.18 + rng.range(0, 0.14);
    const petalWidth = 0.075 + rng.range(0, 0.05);
    const centerSize = (0.028 + rng.range(0, 0.02)) * styleConfig.centerScale;
    
    // Stem bend - one point of curve (like nature)
    // Bend happens at some point along the stem, then straight after
    const bendPoint = rng.range(0.3, 0.7); // Where along the stem the bend occurs (30-70% up)
    const bendAngleX = rng.range(-0.3, 0.3); // Horizontal bend angle
    const bendAngleZ = rng.range(-0.2, 0.2); // Depth bend angle
    const bendHeight = stemHeight * bendPoint;
    
    // Calculate the offset at the bend point
    const bendOffsetX = Math.sin(bendAngleX) * bendHeight * 0.3;
    const bendOffsetZ = Math.sin(bendAngleZ) * bendHeight * 0.3;
    
    // Calculate direction after bend
    const remainingHeight = stemHeight - bendHeight;
    const finalOffsetX = bendOffsetX + Math.sin(bendAngleX) * remainingHeight * 0.5;
    const finalOffsetZ = bendOffsetZ + Math.sin(bendAngleZ) * remainingHeight * 0.5;
    
    // Calculate the direction vector of the stem after the bend
    const stemDirectionX = finalOffsetX - bendOffsetX;
    const stemDirectionY = remainingHeight;
    const stemDirectionZ = finalOffsetZ - bendOffsetZ;
    
    // Calculate rotation angles to follow the stem direction
    // Y rotation (around vertical axis) based on horizontal direction
    const stemRotationY = Math.atan2(stemDirectionX, stemDirectionZ);
    // X rotation (tilt forward/back) based on the angle of the stem segment
    const stemLength = Math.sqrt(stemDirectionX * stemDirectionX + stemDirectionY * stemDirectionY + stemDirectionZ * stemDirectionZ);
    const stemRotationX = Math.asin(stemDirectionY / stemLength);
    
    // Flower head tilt
    const headTiltX = 0.15 + rng.range(0, 0.25);
    const headTiltZ = rng.range(-0.08, 0.08);
    
    // Petal color palette: wider species-like variety (white, red, pink, blue, violet, mint)
    const baseColor = petalColor || (stylized 
      ? rng.pick([
          '#7D5CFF', '#AA6BFF', '#5A8FFF', '#40B8FF',
          '#36D6C0', '#FF5C8A', '#FF7AB6', '#F5F7FF'
        ])
      : rng.pick([
          '#FF4F7A', '#FF64B6', '#E07BFF', '#A38AFF',
          '#5D8BFF', '#40B7FF', '#35D7C0', '#FFFFFF', '#EAF0FF', '#FF6B6B'
        ])
    );

    // Push flower tones into vivid, bright ranges so they never look muddy
    const vividColorObj = new THREE.Color(baseColor);
    const vividHsl = { h: 0, s: 0, l: 0 };
    vividColorObj.getHSL(vividHsl);
    const color = new THREE.Color().setHSL(
      vividHsl.h,
      Math.min(1, vividHsl.s * 1.25 + 0.08),
      Math.max(0.52, Math.min(0.76, vividHsl.l * 1.08 + 0.05))
    ).getStyle();
    
    // Pre-compute petal data
    const petalData = Array.from({ length: petals }).map((_, i) => ({
      angle: (i / petals) * Math.PI * 2 + rng.range(-0.08, 0.08),
      tiltAngle: styleConfig.tiltBase + rng.range(0, styleConfig.tiltVar),
      petalScale: 0.82 + rng.range(0, 0.34),
      radius: centerSize * rng.range(0.55, 1.15),
    }));
    
    // Inner petals (slightly smaller, offset angle)
    const innerPetalCount = petals >= 5 ? Math.floor(petals * styleConfig.innerRatio) : 0;
    const innerPetalData = Array.from({ length: innerPetalCount }).map((_, i) => ({
      angle: (i / Math.max(1, innerPetalCount)) * Math.PI * 2 + (Math.PI / petals) + rng.range(-0.06, 0.06),
      petalScale: 0.52 + rng.range(0, 0.28),
      radius: centerSize * rng.range(0.2, 0.62),
    }));

    const centerPalette = {
      cosmos: rng.pick(['#F6E27A', '#FFE5B0', '#F8D59A']),
      anemone: rng.pick(['#2C2140', '#3A2552', '#4C2D66']),
      daisy: rng.pick(['#F5D95E', '#F7C95D', '#F1D07A']),
      lily: rng.pick(['#D4A55A', '#8D4B2D', '#C78A54']),
    }[flowerStyle];
    
    // Create a simpler stem path so wireframe stays clean
    const stemPoints = [
      new THREE.Vector3(0, 0, 0), // Base - straight up
      new THREE.Vector3(0, bendHeight * 0.9, 0), // Just before bend
      new THREE.Vector3(bendOffsetX, bendHeight, bendOffsetZ), // Bend point
      new THREE.Vector3(finalOffsetX * 0.85, stemHeight, finalOffsetZ * 0.85), // Softer end offset
    ];
    const stemCurve = new THREE.CatmullRomCurve3(stemPoints);

    const stemLeafCount = rng.int(1, 4);
    const stemLeaves = Array.from({ length: stemLeafCount }).map(() => {
      const t = rng.range(0.2, 0.78);
      const side = rng.pick([-1, 1] as const);
      const spread = rng.range(0.02, 0.05) * side;
      return {
        t,
        spread,
        yawOffset: rng.range(0.6, 1.2) * side,
        roll: rng.range(0.2, 0.7) * side,
        sizeX: rng.range(0.04, 0.085),
        sizeY: rng.range(0.08, 0.18),
      };
    });
    
    return { 
      stemHeight, 
      centerSize,
      petals, 
      petalLength,
      petalWidth,
      headTiltX, 
      headTiltZ,
      color,
      centerCoreColor: centerPalette,
      petalShape: styleConfig.petalShape,
      centerType: styleConfig.centerType,
      petalData,
      innerPetalData,
      stemLeaves,
      stemCurve,
      finalOffsetX,
      finalOffsetZ,
      stemRotationX,
      stemRotationY,
    };
  }, [genes.seed, petalCount, petalColor, stylized, variationSeed, position.x, position.y, position.z]);
  
  const petalGeometry = useMemo(() => createPetalGeometry(flowerData.petalShape), [flowerData.petalShape]);
  const stemLeafGeometry = useMemo(() => createPetalGeometry('teardrop'), []);

  const centerGeometry = useMemo(() => {
    if (flowerData.centerType === 'disk') {
      return new THREE.CylinderGeometry(
        flowerData.centerSize * 1.35,
        flowerData.centerSize * 1.55,
        flowerData.centerSize * 0.8,
        10
      );
    }
    if (flowerData.centerType === 'star') {
      return new THREE.OctahedronGeometry(flowerData.centerSize * 1.25, 0);
    }
    return new THREE.SphereGeometry(flowerData.centerSize * 1.5, 10, 8);
  }, [flowerData.centerSize, flowerData.centerType]);
  
  // Inner color derived from main color
  const innerColor = useMemo(() => {
    const colorObj = new THREE.Color(flowerData.color);
    const hsl = { h: 0, s: 0, l: 0 };
    colorObj.getHSL(hsl);
    return new THREE.Color().setHSL(hsl.h, hsl.s * 0.8, Math.min(1, hsl.l * 1.1));
  }, [flowerData.color]);

  const centerColor = useMemo(() => {
    return new THREE.Color(flowerData.centerCoreColor).lerp(new THREE.Color(flowerData.color), 0.12);
  }, [flowerData.centerCoreColor, flowerData.color]);

  const stemColors = useMemo(() => {
    const stem = new THREE.Color(genes.stemColor || '#7A6B5A');
    const leaf = new THREE.Color(genes.leafColor || '#6B8A5A');

    const stemHsl = { h: 0, s: 0, l: 0 };
    stem.getHSL(stemHsl);
    const mutedStem = new THREE.Color().setHSL(
      stemHsl.h,
      Math.max(0.08, stemHsl.s * 0.45),
      Math.max(0.2, stemHsl.l * 0.72)
    );

    const leafHsl = { h: 0, s: 0, l: 0 };
    leaf.getHSL(leafHsl);
    const mutedLeaf = new THREE.Color().setHSL(
      leafHsl.h,
      Math.max(0.1, leafHsl.s * 0.5),
      Math.max(0.22, leafHsl.l * 0.68)
    );

    return { stem: mutedStem, leaf: mutedLeaf };
  }, [genes.leafColor, genes.stemColor]);
  
  useFrame((state) => {
    if (groupRef.current && !noRotation) {
      const time = state.clock.getElapsedTime();
      // Gentle sway (disabled for decorative flowers)
      groupRef.current.rotation.z = Math.sin(time * 0.8 + genes.seed) * 0.03;
      groupRef.current.rotation.x = Math.sin(time * 0.6 + genes.seed * 0.5) * 0.02;
    }
    
    // Update shader time uniforms
    materialRefs.current.forEach(mat => {
      if (mat && mat.uniforms.uTime) {
        mat.uniforms.uTime.value = state.clock.getElapsedTime();
      }
    });
  });
  
  // Create stem geometry from curve
  const stemGeometry = useMemo(() => {
    // Ultra-minimal stem mesh: only a few wireframe lines
    return new THREE.TubeGeometry(flowerData.stemCurve, 1, 0.012, 3, false);
  }, [flowerData.stemCurve]);
  
  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Curved stem */}
      <mesh geometry={stemGeometry}>
        <meshBasicMaterial color={stemColors.stem} wireframe />
      </mesh>

      {flowerData.stemLeaves.map((leaf, i) => {
        const point = flowerData.stemCurve.getPoint(leaf.t);
        const tangent = flowerData.stemCurve.getTangent(leaf.t);
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
        const leafPos = point.clone().add(normal.multiplyScalar(leaf.spread));
        const yaw = Math.atan2(tangent.x, tangent.z) + leaf.yawOffset;

        return (
          <mesh
            key={`stem-leaf-${i}`}
            geometry={stemLeafGeometry}
            position={leafPos}
            rotation={[
              Math.PI / 2 - 0.25,
              yaw,
              leaf.roll,
            ]}
            scale={[leaf.sizeX, leaf.sizeY, 1]}
          >
            <meshBasicMaterial color={stemColors.leaf} wireframe side={THREE.DoubleSide} />
          </mesh>
        );
      })}
      
      {/* Flower head - positioned at end of bent stem, perpendicular to stem direction */}
      <group 
        position={[
          flowerData.finalOffsetX,
          flowerData.stemHeight,
          flowerData.finalOffsetZ
        ]} 
        rotation={[
          flowerData.headTiltX + flowerData.stemRotationX + Math.PI / 2, // 90 degrees to be perpendicular
          flowerData.stemRotationY,
          flowerData.headTiltZ
        ]}
      >
        {/* Tiny center (pistil/stamen) */}
        <mesh>
          <primitive object={centerGeometry} attach="geometry" />
          <meshStandardMaterial 
            color={flowerData.centerCoreColor}
            roughness={0.5}
            metalness={0.05}
            emissive={flowerData.centerCoreColor}
            emissiveIntensity={0.08}
          />
        </mesh>
        
        {/* Petals arranged around center */}
        {flowerData.petalData.map((petal, i) => (
          <mesh
            key={i}
            geometry={petalGeometry}
            position={[
              Math.cos(petal.angle) * petal.radius,
              0,
              Math.sin(petal.angle) * petal.radius
            ]}
            rotation={[
              Math.PI / 2 - petal.tiltAngle,
              0,
              -petal.angle + Math.PI
            ]}
            scale={[
              flowerData.petalWidth * petal.petalScale,
              flowerData.petalLength * petal.petalScale,
              1
            ]}
          >
            <flowerPetalMaterial
              ref={(el) => {
                if (el) materialRefs.current[i] = el as THREE.ShaderMaterial;
              }}
              uColor={new THREE.Color(flowerData.color)}
              uCenterColor={centerColor}
              uStylized={stylized ? 1.0 : 0.0}
              side={THREE.DoubleSide}
              transparent
            />
          </mesh>
        ))}
        
        {/* Inner petals (smaller, for fullness) */}
        {flowerData.innerPetalData.map((petal, i) => (
          <mesh
            key={`inner-${i}`}
            geometry={petalGeometry}
            position={[
              Math.cos(petal.angle) * petal.radius,
              0.002,
              Math.sin(petal.angle) * petal.radius
            ]}
            rotation={[
              Math.PI / 2 - 0.15,
              0,
              -petal.angle + Math.PI
            ]}
            scale={[
              flowerData.petalWidth * petal.petalScale * 0.7,
              flowerData.petalLength * petal.petalScale * 0.65,
              1
            ]}
          >
            <flowerPetalMaterial
              ref={(el) => {
                if (el) materialRefs.current[flowerData.petalData.length + i] = el as THREE.ShaderMaterial;
              }}
              uColor={innerColor}
              uCenterColor={centerColor}
              uStylized={stylized ? 1.0 : 0.0}
              side={THREE.DoubleSide}
              transparent
            />
          </mesh>
        ))}
      </group>
      
    </group>
  );
};

// ============================================
// PROCEDURAL BUSH
// ============================================

interface BushProps {
  genes: PlantGenes;
  isSelected?: boolean;
  isHovered?: boolean;
}

export const ProceduralBush = ({ genes, isSelected, isHovered }: BushProps) => {
  const groupRef = useRef<THREE.Group>(null);
  
  const bushData = useMemo(() => {
    const rng = new SeededRandom(genes.seed);
    const clusterCount = 6 + rng.int(0, 5);
    const trunkHeight = 0.22 + rng.range(0, 0.18);
    const trunkRadius = 0.03 + rng.range(0, 0.02);
    const clusters: Array<{
      position: [number, number, number];
      scale: number;
      color: string;
    }> = [];
    
    // Create a cohesive canopy around a central trunk
    for (let i = 0; i < clusterCount; i++) {
      const theta = rng.range(0, Math.PI * 2);
      const phi = rng.range(0.15, Math.PI * 0.55);
      const radius = genes.height * 0.3 * rng.range(0.45, 0.9);
      
      const x = Math.sin(phi) * Math.cos(theta) * radius;
      const y = trunkHeight + Math.cos(phi) * radius * 0.55;
      const z = Math.sin(phi) * Math.sin(theta) * radius;
      
      clusters.push({
        position: [x, y, z],
        scale: 0.28 + rng.range(0, 0.18),
        color: rng.pick([genes.leafColor, '#7BA05B', '#8BC06B', '#6B9A5B']),
      });
    }
    
    // Pre-compute flower colors for each cluster
    const flowerColors = clusters.slice(0, 4).map(() => ({
      color: rng.pick(['#FFB6C1', '#FFFACD', '#E6E6FA']),
    }));
    
    return { clusters, flowerColors, trunkHeight, trunkRadius };
  }, [genes]);
  
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      // Constant subtle sway, no rotation change on hover
      const sway = 0.008;
      groupRef.current.rotation.z = Math.sin(time * 0.8 + genes.seed) * sway;
    }
  });
  
  const scale = isSelected ? 1.05 : isHovered ? 1.02 : 1;
  
  return (
    <group ref={groupRef} scale={scale}>
      {/* Bush trunk */}
      <mesh position={[0, bushData.trunkHeight * 0.5, 0]}>
        <cylinderGeometry args={[bushData.trunkRadius * 0.75, bushData.trunkRadius, bushData.trunkHeight, 6]} />
        <meshBasicMaterial color="#7A6248" wireframe />
      </mesh>

      {/* Bush clusters */}
      {bushData.clusters.map((cluster, i) => (
        <mesh
          key={i}
          position={cluster.position}
          scale={cluster.scale}
          castShadow
        >
          <dodecahedronGeometry args={[1, 1]} />
          <meshBasicMaterial
            color={cluster.color}
            wireframe
          />
        </mesh>
      ))}
      
      {/* Small flowers on bush (optional based on gene) */}
      {genes.hasGlow && bushData.clusters.slice(0, 4).map((cluster, i) => (
        <mesh
          key={`flower-${i}`}
          position={[
            cluster.position[0] * 1.1,
            cluster.position[1] + 0.1,
            cluster.position[2] * 1.1
          ]}
          scale={0.05}
        >
          <sphereGeometry args={[1, 6, 6]} />
          <meshBasicMaterial
            color={bushData.flowerColors[i]?.color || '#FFB6C1'}
            wireframe
          />
        </mesh>
      ))}
    </group>
  );
};

// ============================================
// PROCEDURAL GRASS CLUSTER
// ============================================

interface GrassClusterProps {
  position: [number, number, number];
  genes: PlantGenes;
  bladeCount?: number;
}

export const ProceduralGrassCluster = ({ 
  position, 
  genes, 
  bladeCount = 12 
}: GrassClusterProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const rng = useMemo(() => new SeededRandom(genes.seed + 3000), [genes.seed]);
  
  const blades = useMemo(() => {
    return Array.from({ length: bladeCount }).map((_, i) => {
      const angle = rng.range(0, Math.PI * 2);
      const dist = rng.range(0, 0.15);
      const height = 0.2 + rng.range(0, 0.25);
      const lean = rng.range(-0.3, 0.3);
      const twist = rng.range(-0.2, 0.2);
      
      return {
        position: [Math.cos(angle) * dist, 0, Math.sin(angle) * dist] as [number, number, number],
        height,
        rotation: [lean, rng.range(0, Math.PI * 2), twist] as [number, number, number],
        width: 0.015 + rng.range(0, 0.01),
      };
    });
  }, [bladeCount, rng]);
  
  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });
  
  return (
    <group ref={groupRef} position={position}>
      {blades.map((blade, i) => (
        <mesh
          key={i}
          position={[blade.position[0], blade.height * 0.5, blade.position[2]]}
          rotation={blade.rotation}
        >
          <planeGeometry args={[blade.width, blade.height, 1, 1]} />
          <meshBasicMaterial
            color={genes.leafColor || '#7BA05B'}
            wireframe
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

// ============================================
// PROCEDURAL FERN/PLANT
// ============================================

interface FernProps {
  genes: PlantGenes;
  isSelected?: boolean;
  isHovered?: boolean;
}

export const ProceduralFern = ({ genes, isSelected, isHovered }: FernProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const rng = useMemo(() => new SeededRandom(genes.seed), [genes.seed]);
  const leafletGeometry = useMemo(() => createPetalGeometry(), []);
  
  const fronds = useMemo(() => {
    const count = 5 + rng.int(0, 4);
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2 + rng.range(-0.2, 0.2);
      const length = genes.height * 0.6 * rng.range(0.7, 1.0);
      const curl = rng.range(0.3, 0.6);
      
      // Create frond curve
      const points: THREE.Vector3[] = [];
      const segments = 8;
      for (let j = 0; j <= segments; j++) {
        const t = j / segments;
        const x = Math.cos(angle) * t * length;
        const y = t * length * 0.3 - t * t * curl * length;
        const z = Math.sin(angle) * t * length;
        points.push(new THREE.Vector3(x, y + 0.1, z));
      }
      
      return {
        curve: new THREE.CatmullRomCurve3(points),
        leaflets: rng.int(10, 16),
        color: rng.pick([genes.leafColor, '#5A8A4A', '#6B9A5B']),
      };
    });
  }, [genes, rng]);
  
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      // Constant subtle sway, no rotation change on hover
      const sway = 0.01;
      groupRef.current.rotation.z = Math.sin(time * 0.6 + genes.seed) * sway;
      groupRef.current.rotation.x = Math.sin(time * 0.4 + genes.seed * 0.5) * sway * 0.5;
    }
  });
  
  const scale = isSelected ? 1.06 : isHovered ? 1.03 : 1;
  
  return (
    <group ref={groupRef} scale={scale}>
      {fronds.map((frond, i) => (
        <group key={i}>
          {/* Frond stem */}
          <mesh>
            <tubeGeometry args={[frond.curve, 8, 0.01, 4, false]} />
            <meshBasicMaterial color="#6B8A5A" wireframe />
          </mesh>
          
          {/* Leaflets along frond */}
          {Array.from({ length: frond.leaflets }).map((_, j) => {
            const t = (j + 1) / (frond.leaflets + 1);
            const pos = frond.curve.getPoint(t);
            const tangent = frond.curve.getTangent(t);
            const side = j % 2 === 0 ? 1 : -1;
            const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
            const spread = (0.035 + 0.045 * (1 - t * 0.6)) * side;
            const leafletPos = pos.clone().add(normal.multiplyScalar(spread));
            const yaw = Math.atan2(tangent.x, tangent.z) + side * 0.9;
            const roll = side * (0.18 + (1 - t) * 0.12);
            
            return (
              <mesh
                key={j}
                geometry={leafletGeometry}
                position={leafletPos}
                rotation={[
                  Math.PI / 2 - (0.2 + t * 0.15),
                  yaw,
                  roll
                ]}
                scale={[0.085 * (1 - t * 0.45), 0.18 * (1 - t * 0.25), 1]}
              >
                <meshBasicMaterial color={frond.color} wireframe side={THREE.DoubleSide} />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
};

// ============================================
// GROUND COVER (small scattered plants)
// ============================================

interface GroundCoverProps {
  genes: PlantGenes;
  radius?: number;
  density?: number;
}

export const GroundCover = ({ genes, radius = 0.5, density = 10 }: GroundCoverProps) => {
  const elements = useMemo(() => {
    const rng = new SeededRandom(genes.seed + 4000);
    const items: Array<{
      type: 'grass' | 'flower' | 'pebble';
      position: [number, number, number];
      scale: number;
      color: string;
      rotation: number;
    }> = [];
    
    for (let i = 0; i < density; i++) {
      const angle = rng.range(0, Math.PI * 2);
      const dist = rng.range(0, radius);
      const type = rng.pick(['grass', 'grass', 'grass', 'flower', 'pebble'] as const);
      
      items.push({
        type,
        position: [
          Math.cos(angle) * dist,
          0,
          Math.sin(angle) * dist
        ],
        scale: rng.range(0.5, 1.0),
        color: type === 'flower' 
          ? rng.pick(['#FFB6C1', '#FFFACD', '#E6E6FA', '#98FB98'])
          : genes.leafColor,
        rotation: rng.range(0, Math.PI),
      });
    }
    
    return items;
  }, [genes, radius, density]);
  
  return (
    <group>
      {elements.map((el, i) => {
        if (el.type === 'grass') {
          return (
            <ProceduralGrassCluster
              key={i}
              position={el.position}
              genes={genes}
              bladeCount={5}
            />
          );
        }
        if (el.type === 'flower') {
          return (
            <ProceduralFlower
              key={i}
              position={new THREE.Vector3(...el.position)}
              genes={genes}
              petalCount={4}
              petalColor={el.color}
              scale={el.scale * 0.5}
              stylized={true} // Enable Blender-style look
            />
          );
        }
        // Pebble
        return (
          <mesh
            key={i}
            position={el.position}
            scale={[0.03 * el.scale, 0.015 * el.scale, 0.025 * el.scale]}
            rotation={[0, el.rotation, 0]}
          >
            <dodecahedronGeometry args={[1, 0]} />
            <meshBasicMaterial color="#8B8075" wireframe />
          </mesh>
        );
      })}
    </group>
  );
};

