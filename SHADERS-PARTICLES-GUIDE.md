# 🔥 Shaders & Particles Guide

## What You Got

A complete collection of visual effects to make your website look INSANE:

### 🎨 Custom Shaders:
- **CRT Screen** - Old TV distortion, scanlines, RGB split
- **Hologram** - Sci-fi glowing effect with scanlines
- **Glitch** - Digital distortion, RGB separation
- **Pixelation** - Retro game style
- **VHS** - Old tape tracking errors
- **Screen Glow** - Monitor light emission

### ✨ Particle Systems:
- **Floating Dust** - Ambient room particles
- **Screen Particles** - Glowing bits near monitor
- **Magic Sparkles** - Interactive effects
- **Data Stream** - Matrix-style falling code
- **Orbiting Particles** - Circle around objects

### 🎬 Post-Processing Effects:
- **Retro Pack** - CRT + pixelation + bloom
- **Cyberpunk Pack** - Heavy bloom + glitch + aberration
- **Modern Pack** - Subtle professional effects
- **VHS Pack** - Old tape aesthetic
- **Minimal Pack** - Just glow

---

## 🚀 Quick Start

### 1. Use the Enhanced Scene (Easiest)

Replace your current scene in `app/page.tsx`:

```typescript
import { RetroDeskSceneEnhanced } from "@/components/3d/retro-desk-scene-enhanced";

export default function Home() {
  return (
    <main>
      <RetroDeskSceneEnhanced />  {/* Already has everything! */}
      <FeaturedProjects />
    </main>
  );
}
```

**Done!** You now have particles, screen glow, dust, and retro effects!

---

### 2. Add Effects to Your Current Scene

#### Add Particles:

```typescript
// In retro-desk-scene.tsx
import { FloatingDust, ScreenParticles } from "./particles";

// Inside your Canvas:
<FloatingDust count={200} size={0.02} />
<ScreenParticles position={[0, 0.15, 0]} />
```

#### Add Post-Processing:

```typescript
import { RetroEffects } from "./post-effects";

// At the END of your Canvas, before </Canvas>:
<RetroEffects />
```

#### Add Screen Glow:

```typescript
import { ScreenGlow } from "./shaders";

// Near your monitor:
<ScreenGlow 
  position={[0, 0.15, 0.03]} 
  size={[0.6, 0.4]} 
  color="#3b82f6"
/>
```

---

## 🎨 Customization Examples

### Change Effect Intensity

**More Retro/Pixelated:**
```typescript
<RetroEffects />
// Already includes pixelation!

// Or add more:
<Pixelation granularity={5} />  // Higher = more pixelated
```

**Cyberpunk Vibe:**
```typescript
<CyberpunkEffects />  // Replace RetroEffects with this
```

**Clean/Professional:**
```typescript
<ModernEffects />  // Subtle and classy
```

**VHS Aesthetic:**
```typescript
<VHSEffects />  // Old tape look
```

### Customize Particle Colors

**Blue tech theme:**
```typescript
<FloatingDust color="#3b82f6" count={200} />
<ScreenParticles color="#06b6d4" />
```

**Purple cyberpunk:**
```typescript
<FloatingDust color="#8b5cf6" count={200} />
<ScreenParticles color="#a855f7" />
```

**Green Matrix:**
```typescript
<FloatingDust color="#00ff00" count={200} />
<DataStream position={[0, 1, -1]} />  // Falling code!
```

### Add More Particle Types

**Sparkles around controller:**
```typescript
<MagicSparkles 
  position={[0.45, -0.15, -0.1]}  // Controller position
  count={30}
  colors={["#3b82f6", "#8b5cf6", "#06b6d4"]}
/>
```

**Orbiting particles:**
```typescript
<OrbitingParticles 
  position={[0, 0, 0]}
  radius={0.5}
  color="#ffffff"
/>
```

**Data stream background:**
```typescript
<DataStream position={[2, 1, -1.5]} count={150} />
```

### Apply Hologram Material

**Make an object holographic:**
```typescript
import { HologramMaterial } from "./shaders";

<mesh>
  <boxGeometry args={[0.5, 0.5, 0.5]} />
  <HologramMaterial color="#00ffff" />
</mesh>
```

---

## 🔧 Advanced Techniques

### Conditional Effects (Toggle)

```typescript
const [effectsEnabled, setEffectsEnabled] = useState(true);

// In Canvas:
{effectsEnabled && <RetroEffects />}
```

### Different Effects Per Scene

```typescript
// Homepage - Retro
<RetroEffects />

// Projects page - Cyberpunk
<CyberpunkEffects />

// About page - Clean
<ModernEffects />
```

### Combine Multiple Particle Systems

```typescript
<FloatingDust count={100} color="#ffffff" spread={5} />
<FloatingDust count={50} color="#3b82f6" spread={3} />
<ScreenParticles position={[0, 0.15, 0]} />
<MagicSparkles position={[0.45, -0.15, -0.1]} />
```

### Custom Shader Material

Create your own glowing object:

```typescript
const materialRef = useRef<THREE.ShaderMaterial>(null);

useFrame((state) => {
  if (materialRef.current) {
    materialRef.current.uniforms.time.value = state.clock.elapsedTime;
  }
});

return (
  <mesh>
    <boxGeometry args={[0.5, 0.5, 0.5]} />
    <shaderMaterial
      ref={materialRef}
      uniforms={{
        time: { value: 0 },
        color: { value: new THREE.Color("#ff0000") },
      }}
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
        varying vec2 vUv;
        
        void main() {
          float pulse = sin(time * 2.0) * 0.5 + 0.5;
          gl_FragColor = vec4(color * pulse, 1.0);
        }
      `}
    />
  </mesh>
);
```

---

## 🎯 Effect Presets by Vibe

### 🕹️ Retro Gaming
```typescript
<RetroEffects />
<FloatingDust count={100} size={0.015} color="#ffffff" />
<ScreenParticles color="#3b82f6" />
<ScreenGlow color="#3b82f6" intensity={1.0} />
```

### 🌃 Cyberpunk
```typescript
<CyberpunkEffects />
<FloatingDust count={200} size={0.02} color="#ff00ff" />
<DataStream position={[2, 1, -1.5]} />
<ScreenGlow color="#ff00ff" intensity={1.5} />
```

### 💻 Hacker/Matrix
```typescript
<VHSEffects />
<DataStream position={[0, 2, -1]} count={200} />
<FloatingDust count={150} color="#00ff00" />
<ScreenGlow color="#00ff00" intensity={1.0} />
```

### ✨ Magic/Fantasy
```typescript
<ModernEffects />
<MagicSparkles position={[0, 0, 0]} colors={["#ffd700", "#ff69b4", "#00ffff"]} />
<FloatingDust count={300} size={0.025} color="#ffd700" />
```

### 🌌 Space/Sci-Fi
```typescript
<MinimalEffects />
<FloatingDust count={500} size={0.01} color="#ffffff" spread={10} />
<OrbitingParticles radius={2} color="#00bfff" />
```

---

## 📊 Performance Tips

### Light Effects (60+ FPS)
- 100-200 particles max
- Minimal or Modern effects pack
- Lower pixelation granularity

### Medium Effects (30-60 FPS)
- 200-300 particles
- Retro effects pack
- Standard settings

### Heavy Effects (30 FPS+)
- 300-500 particles
- Cyberpunk or VHS effects
- Multiple particle systems
- High pixelation

**If slow, reduce:**
```typescript
<FloatingDust count={50} />  // Instead of 200
<RetroEffects />  // Remove pixelation if needed
```

---

## 🎨 Real-World Examples

### Glowing Monitor Setup

```typescript
{/* Monitor */}
<Monitor position={[0, -0.05, -0.2]} />

{/* Add glow */}
<ScreenGlow 
  position={[0, 0.15, 0.03]}
  size={[0.6, 0.4]}
  color="#3b82f6"
  intensity={1.2}
/>

{/* Add particles */}
<ScreenParticles 
  position={[0, 0.15, 0]}
  count={40}
  color="#3b82f6"
/>
```

### Atmospheric Room

```typescript
{/* Dust in air */}
<FloatingDust 
  count={200}
  size={0.015}
  spread={6}
  color="#ffffff"
/>

{/* Light rays */}
<spotLight 
  position={[2, 2, 0]}
  angle={0.3}
  penumbra={1}
  intensity={0.5}
/>
```

### Interactive Sparkles on Hover

```typescript
const [isHovered, setIsHovered] = useState(false);

<group 
  onPointerOver={() => setIsHovered(true)}
  onPointerOut={() => setIsHovered(false)}
>
  <GameController position={[0.45, -0.19, -0.1]} />
  
  {isHovered && (
    <MagicSparkles 
      position={[0.45, -0.15, -0.1]}
      count={30}
    />
  )}
</group>
```

---

## 🐛 Troubleshooting

**Effects not visible?**
- Make sure `<RetroEffects />` is INSIDE `<Canvas>`
- Check it's after all meshes (at the end)

**Particles not moving?**
- They animate automatically, give them a few seconds
- Check `count` prop isn't 0

**Too pixelated?**
- Lower granularity: `<Pixelation granularity={2} />`
- Or remove pixelation entirely

**Performance issues?**
- Reduce particle `count`
- Use `MinimalEffects` instead
- Lower Canvas `dpr` to `[0.5, 1]`

**Particles in wrong place?**
- Adjust `position` prop
- Remember: [x, y, z] where +Y is up

---

## 🔥 Pro Tips

✅ **Mix and match** - Combine effects from different packs
✅ **Less is more** - Don't use all effects at once
✅ **Match your vibe** - Choose effects that fit your brand
✅ **Test on mobile** - Disable heavy effects for mobile
✅ **Animate on interaction** - Show particles on click/hover
✅ **Use color theory** - Match particle colors to your theme

---

## Next Level Stuff

Once comfortable, try:
- Create custom shaders (see `shaders.tsx` for templates)
- Animate shader uniforms based on music
- Trigger particles on specific events
- Make particles react to mouse position
- Combine post-processing effects creatively

Your desk scene is about to look LEGENDARY! 🎮✨





