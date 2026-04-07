/**
 * Painterly Shader System
 * Inspired by ShapeScape Studio - NPR hand-painted aesthetic
 * 
 * Features:
 * - Brush stroke noise texture
 * - Soft color banding (not harsh toon)
 * - Wind animation
 * - Warm artistic shadows
 * - Subsurface scattering
 */

// ============================================
// SHARED GLSL FUNCTIONS
// ============================================

export const NOISE_FUNCTIONS = `
  // Simplex-like noise for organic patterns
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  // Brush stroke pattern
  float brushStroke(vec2 uv, float scale, float time) {
    float n1 = snoise(vec3(uv * scale, time * 0.1));
    float n2 = snoise(vec3(uv * scale * 2.0, time * 0.15 + 100.0));
    return n1 * 0.6 + n2 * 0.4;
  }
  
  // ============================================
  // UTILITY FUNCTIONS (from Shadertoy)
  // ============================================
  
  // Rotate 2D point around origin
  vec2 rotate2D(vec2 p, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
  }
  
  // Distance field to a line segment
  float lineDistanceField(vec2 p, vec2 a, vec2 b) {
    vec2 ba = b - a;
    float k = dot(p - a, ba) / dot(ba, ba);
    return length((a + clamp(k, 0.0, 1.0) * (b - a)) - p);
  }
  
  // Distance field to a 2D box
  float boxDistanceField(vec2 p, vec2 size) {
    vec2 d = abs(p - size * 0.5) - size * 0.5;
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
  }
  
  // Sample sky color (useful for backgrounds)
  vec3 sampleSkyColor(vec2 direction) {
    vec3 skyColor = vec3(0.6, 0.85, 1.0) * 1.25;
    return skyColor * max(0.0, 2.0 * direction.y - 1.0);
  }
  
  // ============================================
  // BLENDER-STYLE EFFECTS
  // ============================================
  
  // ColorRamp - discrete color bands for stylized shading
  vec3 colorRampStylized(float value, vec3 shadow, vec3 mid, vec3 highlight) {
    // Create distinct bands like Blender ColorRamp
    if (value < 0.35) {
      return shadow;
    } else if (value < 0.65) {
      // Soft transition to mid tone
      float t = smoothstep(0.35, 0.65, value);
      return mix(shadow, mid, t);
    } else {
      // Soft transition to highlight
      float t = smoothstep(0.65, 1.0, value);
      return mix(mid, highlight, t);
    }
  }
  
  // Fresnel/Rim lighting effect
  float fresnelEffect(vec3 normal, vec3 viewDir, float power) {
    float fresnel = 1.0 - max(dot(normal, viewDir), 0.0);
    return pow(fresnel, power);
  }
  
  // Crystalline/fragmented pattern
  vec3 crystallinePattern(vec2 uv, float scale, float time) {
    // Create faceted look using noise
    float n1 = snoise(vec3(uv * scale, time * 0.1));
    float n2 = snoise(vec3(uv * scale * 2.0, time * 0.15 + 100.0));
    
    // Sharp edges for crystalline effect
    float pattern = abs(n1) * 0.6 + abs(n2) * 0.4;
    pattern = pow(pattern, 2.0); // Sharpen
    
    // Create white streaks at pattern peaks
    float streaks = smoothstep(0.6, 0.8, pattern);
    
    return vec3(pattern, pattern, streaks);
  }
  
  // Overlay blend mode (from Blender)
  vec3 overlayBlend(vec3 base, vec3 blend, float factor) {
    vec3 result = vec3(0.0);
    for (int i = 0; i < 3; i++) {
      if (base[i] < 0.5) {
        result[i] = 2.0 * base[i] * blend[i];
      } else {
        result[i] = 1.0 - 2.0 * (1.0 - base[i]) * (1.0 - blend[i]);
      }
    }
    return mix(base, result, factor);
  }
`;

export const PAINTERLY_LIGHTING = `
  // Soft color ramp - painterly lighting
  vec3 painterlyLight(vec3 baseColor, vec3 shadowColor, vec3 highlightColor, float NdotL, float brushNoise) {
    // Soft bands instead of harsh steps
    float shadow = smoothstep(-0.1, 0.3, NdotL);
    float mid = smoothstep(0.2, 0.6, NdotL);
    float highlight = smoothstep(0.5, 0.9, NdotL);
    
    // Mix colors with soft transitions
    vec3 color = shadowColor;
    color = mix(color, baseColor, shadow);
    color = mix(color, highlightColor, highlight * 0.5);
    
    // Add brush stroke variation
    color += brushNoise * 0.08 * baseColor;
    
    return color;
  }
  
  // Warm shadow calculation
  vec3 warmShadow(vec3 color, float shadow) {
    vec3 warmTint = vec3(1.0, 0.9, 0.8);
    return mix(color * 0.4 * warmTint, color, shadow);
  }
`;

// ============================================
// PAINTERLY PLANT SHADER
// ============================================

export const PAINTERLY_PLANT_VERTEX = `
  uniform float uTime;
  uniform float uWindStrength;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying vec2 vUv;
  
  ${NOISE_FUNCTIONS}
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    
    vec3 pos = position;
    
    // Height factor - NO movement at base, gradual increase
    // Starts at 0 below 0.3, smoothly ramps up after
    float heightFactor = smoothstep(0.3, 2.0, pos.y);
    heightFactor = heightFactor * heightFactor; // Quadratic for more solid base
    
    // Wind animation - only affects upper parts
    float windOffset = snoise(vec3(pos.x * 0.3, pos.z * 0.3, uTime * 0.5));
    float wind = sin(uTime * 1.5 + pos.x * 0.2 + windOffset * 0.5) * uWindStrength * heightFactor;
    
    pos.x += wind * 0.5;
    pos.z += wind * 0.3;
    
    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPos.xyz;
    vPosition = pos;
    
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const PAINTERLY_PLANT_FRAGMENT = `
  uniform vec3 uColor;
  uniform vec3 uShadowColor;
  uniform vec3 uHighlightColor;
  uniform vec3 uLightPosition;
  uniform float uTime;
  uniform float uSelected;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying vec2 vUv;
  
  ${NOISE_FUNCTIONS}
  ${PAINTERLY_LIGHTING}
  
  // Wood grain texture
  float woodGrain(vec3 pos) {
    // Create ring pattern (like tree rings)
    float rings = sin(length(pos.xz) * 40.0 + pos.y * 5.0) * 0.5 + 0.5;
    rings = smoothstep(0.3, 0.7, rings);
    
    // Add vertical grain lines
    float grain = snoise(vec3(pos.x * 50.0, pos.y * 8.0, pos.z * 50.0));
    grain = grain * 0.5 + 0.5;
    
    // Combine rings and grain
    float wood = mix(rings, grain, 0.4);
    
    // Add some knots
    float knots = snoise(pos * 3.0);
    knots = smoothstep(0.6, 0.8, abs(knots)) * 0.3;
    
    return wood + knots;
  }
  
  void main() {
    vec3 lightDir = normalize(uLightPosition - vWorldPosition);
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float NdotL = dot(vNormal, lightDir);
    
    // Wood grain texture
    float grain = woodGrain(vWorldPosition);
    
    // Create wood color variation
    vec3 darkWood = uShadowColor * 0.9;
    vec3 lightWood = uColor * 1.1;
    vec3 woodColor = mix(darkWood, lightWood, grain * 0.3);
    
    // Brush stroke noise (subtle for wood)
    float brush = brushStroke(vWorldPosition.xz, 2.0, 0.0) * 0.3;
    
    // Painterly lighting with wood color
    vec3 color = painterlyLight(woodColor, uShadowColor * 0.8, uHighlightColor, NdotL, brush);
    
    // Add grain detail to final color
    color = mix(color, color * (0.9 + grain * 0.2), 0.5);
    
    // Rim light for depth
    float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);
    rim = smoothstep(0.5, 1.0, rim);
    color += rim * 0.1 * uHighlightColor;
    
    // Height gradient - slightly lighter at top
    float heightGrad = smoothstep(0.0, 2.5, vPosition.y);
    color = mix(color * 0.95, color * 1.05, heightGrad);
    
    // Selection glow
    if (uSelected > 0.5) {
      color += 0.08 * uHighlightColor;
    }
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// ============================================
// PAINTERLY FOLIAGE/LEAF SHADER
// ============================================

export const PAINTERLY_LEAF_VERTEX = `
  uniform float uTime;
  uniform float uWindStrength;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  
  ${NOISE_FUNCTIONS}
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    
    vec3 pos = position;
    
    // Get world position for height check
    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    
    // Height-based movement reduction (less flutter near ground)
    float heightFactor = smoothstep(0.5, 2.0, worldPos.y);
    
    // Gentle leaf flutter animation
    float flutter = snoise(vec3(pos.xy * 1.5, uTime * 2.0)) * 0.08 * heightFactor;
    float wind = sin(uTime * 1.8 + pos.x * 0.5) * uWindStrength * heightFactor * 0.6;
    
    pos.x += wind + flutter * 0.2;
    pos.y += flutter * 0.1;
    pos.z += wind * 0.4;
    
    worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPos.xyz;
    vPosition = pos;
    
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const PAINTERLY_LEAF_FRAGMENT = `
  uniform vec3 uColor;
  uniform vec3 uShadowColor;
  uniform float uTime;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  
  ${NOISE_FUNCTIONS}
  
  void main() {
    vec3 lightDir = normalize(vec3(12.0, 18.0, 8.0) - vWorldPosition);
    float NdotL = dot(vNormal, lightDir);
    
    // Soft lighting for leaves
    float light = smoothstep(-0.3, 0.7, NdotL) * 0.6 + 0.4;
    
    // Subsurface scattering - light through leaves
    float backlight = max(0.0, dot(-vNormal, lightDir));
    vec3 subsurface = uColor * backlight * 0.4;
    
    // Brush texture on leaves
    float brush = brushStroke(vWorldPosition.xz, 8.0, uTime * 0.5);
    
    // Leaf vein pattern using lineDistanceField
    vec2 leafUV = vPosition.xy * 0.3;
    // Main central vein
    float mainVein = lineDistanceField(leafUV, vec2(0.0, -0.8), vec2(0.0, 0.8));
    // Side veins
    float vein1 = lineDistanceField(leafUV, vec2(0.0, 0.2), vec2(0.4, 0.5));
    float vein2 = lineDistanceField(leafUV, vec2(0.0, 0.2), vec2(-0.4, 0.5));
    float vein3 = lineDistanceField(leafUV, vec2(0.0, -0.2), vec2(0.3, -0.4));
    float vein4 = lineDistanceField(leafUV, vec2(0.0, -0.2), vec2(-0.3, -0.4));
    
    float veins = smoothstep(0.02, 0.0, mainVein) * 0.06;
    veins += smoothstep(0.015, 0.0, min(min(vein1, vein2), min(vein3, vein4))) * 0.04;
    veins *= (0.7 + snoise(vWorldPosition * 8.0) * 0.3);
    
    // Final color
    vec3 color = mix(uShadowColor, uColor, light);
    color += subsurface;
    color += brush * 0.06 * uColor;
    color += veins * uShadowColor * 0.5; // Darker veins
    
    // Color variation across leaf
    float variation = snoise(vWorldPosition * 10.0) * 0.08;
    color += variation * uColor;
    
    gl_FragColor = vec4(color, 0.95);
  }
`;

// ============================================
// PAINTERLY GROUND SHADER
// ============================================

export const PAINTERLY_GROUND_VERTEX = `
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const PAINTERLY_GROUND_FRAGMENT = `
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform float uTime;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  
  ${NOISE_FUNCTIONS}
  
  void main() {
    // Distance from center
    float dist = length(vPosition.xz) / 15.0;
    dist = clamp(dist, 0.0, 1.0);
    
    // Multi-layer noise for painterly texture
    float n1 = snoise(vec3(vPosition.xz * 0.5, uTime * 0.02)) * 0.5 + 0.5;
    float n2 = snoise(vec3(vPosition.xz * 2.0, uTime * 0.03 + 50.0)) * 0.5 + 0.5;
    float n3 = snoise(vec3(vPosition.xz * 5.0, 100.0)) * 0.5 + 0.5;
    
    // Combine noise layers
    float pattern = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
    
    // Brush stroke effect
    float brush = brushStroke(vPosition.xz, 1.5, uTime * 0.5);
    pattern += brush * 0.15;
    
    // Decorative patterns using boxDistanceField
    vec2 gridUV = fract(vPosition.xz * 0.2) - 0.5;
    float decorative = boxDistanceField(gridUV, vec2(0.15, 0.15));
    decorative = smoothstep(0.02, 0.0, decorative) * 0.03;
    // Rotate pattern slightly for variation
    vec2 rotatedUV = rotate2D(gridUV, uTime * 0.1);
    float decorative2 = boxDistanceField(rotatedUV, vec2(0.1, 0.1));
    decorative2 = smoothstep(0.015, 0.0, decorative2) * 0.02;
    pattern += decorative + decorative2;
    
    // Color mixing
    vec3 color = mix(uColor1, uColor2, pattern * 0.4);
    color = mix(color, uColor3, dist * 0.3);
    
    // Soft radial gradient
    color = mix(color, uColor3 * 0.95, dist * 0.2);
    
    // Vignette
    float vignette = 1.0 - dist * 0.15;
    color *= vignette;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// ============================================
// PAINTERLY STONE SHADER
// ============================================

export const PAINTERLY_STONE_VERTEX = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const PAINTERLY_STONE_FRAGMENT = `
  uniform vec3 uColor;
  uniform float uTime;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  
  ${NOISE_FUNCTIONS}
  
  void main() {
    vec3 lightDir = normalize(vec3(12.0, 18.0, 8.0) - vWorldPosition);
    float NdotL = dot(vNormal, lightDir);
    
    // Soft toon lighting for stones
    float light = smoothstep(-0.2, 0.5, NdotL) * 0.5 + 0.5;
    
    // Stone texture noise
    float stoneNoise = snoise(vWorldPosition * 8.0) * 0.1;
    
    // Brush effect
    float brush = brushStroke(vWorldPosition.xz, 4.0, 0.0);
    
    vec3 color = uColor * light;
    color += stoneNoise * uColor;
    color += brush * 0.05 * uColor;
    
    // Warm shadow tint
    vec3 shadowColor = uColor * vec3(0.9, 0.85, 0.8) * 0.6;
    color = mix(shadowColor, color, light);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// ============================================
// PAINTERLY COLOR PALETTES
// ============================================

export const PAINTERLY_PALETTES = {
  spring: {
    plant: { base: '#7BA05B', shadow: '#4A5D3A', highlight: '#A8C686' },
    leaf: { base: '#8FBC6B', shadow: '#5A7A42' },
    ground: { color1: '#C9B896', color2: '#B8A882', color3: '#DFD5C0' },
    stone: '#9E9585',
  },
  summer: {
    plant: { base: '#5C8A4A', shadow: '#3D5C32', highlight: '#8AB86E' },
    leaf: { base: '#6B9E52', shadow: '#486B38' },
    ground: { color1: '#D4C5A8', color2: '#C4B594', color3: '#E8DCC8' },
    stone: '#A89E8A',
  },
  autumn: {
    plant: { base: '#8B6B4A', shadow: '#5C4632', highlight: '#B8956E' },
    leaf: { base: '#C4783A', shadow: '#8B5228' },
    ground: { color1: '#C9A872', color2: '#B89862', color3: '#DBC896' },
    stone: '#8E7E6A',
  },
  winter: {
    plant: { base: '#6B7A6B', shadow: '#4A5A4A', highlight: '#9AAA9A' },
    leaf: { base: '#7A8A7A', shadow: '#5A6A5A' },
    ground: { color1: '#D8D0C4', color2: '#C8C0B4', color3: '#E8E0D8' },
    stone: '#A8A098',
  },
};

