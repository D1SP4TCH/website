# ⚡ Visual Effects Quick Reference

## 🚀 Instant Upgrade (30 seconds)

Replace this in `app/page.tsx`:

```typescript
// OLD
import { RetroDeskScene } from "@/components/3d/retro-desk-scene";

// NEW
import { RetroDeskSceneEnhanced } from "@/components/3d/retro-desk-scene-enhanced";
```

**BOOM!** You now have:
- ✨ Floating dust particles
- 💫 Screen glow effects  
- ⚡ Sparkles around controller
- 🎮 Retro CRT effects
- 📺 Pixelation + bloom

---

## 🎨 One-Line Effect Changes

### Want More Particles?
```typescript
<FloatingDust count={500} />  // Way more dust!
```

### Want Different Color Theme?
```typescript
// Purple cyberpunk
<ScreenParticles color="#8b5cf6" />
<ScreenGlow color="#a855f7" />

// Green Matrix
<ScreenParticles color="#00ff00" />
<DataStream position={[0, 2, -1]} />

// Gold magic
<MagicSparkles colors={["#ffd700", "#ffeb3b"]} />
```

### Want Different Post-Processing?
```typescript
// In retro-desk-scene-enhanced.tsx, replace <RetroEffects /> with:

<CyberpunkEffects />  // Heavy bloom + glitch
<VHSEffects />        // Old tape look
<ModernEffects />     // Clean/professional
<MinimalEffects />    // Just subtle glow
```

---

## 💡 Common Add-Ons

### Add Matrix Rain

```typescript
import { DataStream } from "./particles";

<DataStream position={[2, 2, -1.5]} count={100} />
```

### Add Orbiting Particles Around Object

```typescript
import { OrbitingParticles } from "./particles";

<OrbitingParticles 
  position={[0.45, -0.15, -0.1]}  // Around controller
  radius={0.2}
  color="#3b82f6"
/>
```

### Make Something Holographic

```typescript
import { HologramMaterial } from "./shaders";

<mesh>
  <boxGeometry />
  <HologramMaterial color="#00ffff" />
</mesh>
```

---

## 🎯 Effect Presets (Copy-Paste)

### Retro Gaming Vibe
```typescript
<RetroEffects />
<FloatingDust count={150} color="#ffffff" />
<ScreenParticles color="#3b82f6" />
```

### Cyberpunk Night
```typescript
<CyberpunkEffects />
<FloatingDust count={200} color="#ff00ff" />
<ScreenGlow color="#ff00ff" intensity={1.5} />
```

### Hacker Matrix
```typescript
<VHSEffects />
<DataStream position={[0, 2, -1]} count={200} />
<FloatingDust count={150} color="#00ff00" />
```

### Magic Fantasy
```typescript
<ModernEffects />
<MagicSparkles colors={["#ffd700", "#ff69b4", "#00ffff"]} />
<FloatingDust count={300} color="#ffd700" />
```

---

## 🔥 Performance Modes

### Potato Mode (fastest)
```typescript
<MinimalEffects />
<FloatingDust count={50} />
// Remove other particles
```

### Balanced Mode
```typescript
<RetroEffects />
<FloatingDust count={150} />
<ScreenParticles count={30} />
```

### Beast Mode (looks insane)
```typescript
<CyberpunkEffects />
<FloatingDust count={500} />
<ScreenParticles count={100} />
<MagicSparkles count={50} />
<DataStream count={200} />
```

---

## 🎨 Color Themes

### Blue Tech
```typescript
color="#3b82f6"  // Primary blue
color="#06b6d4"  // Cyan accent
```

### Purple Cyber
```typescript
color="#8b5cf6"  // Purple
color="#a855f7"  // Light purple
```

### Green Matrix
```typescript
color="#00ff00"  // Bright green
color="#22c55e"  // Softer green
```

### Pink Vapor
```typescript
color="#ec4899"  // Hot pink
color="#f472b6"  // Light pink
```

### Gold Magic
```typescript
color="#ffd700"  // Gold
color="#ffeb3b"  // Yellow
```

---

## 📍 Particle Positioning

**General rules:**
- [x, y, z] where:
  - x: Left (-) to Right (+)
  - y: Down (-) to Up (+)  
  - z: Back (-) to Front (+)

**Common positions:**
```typescript
// Around monitor
position={[0, 0.15, 0]}

// Above desk center
position={[0, 0, 0]}

// Behind desk (background)
position={[0, 1, -1.5]}

// Around controller (right side)
position={[0.45, -0.15, -0.1]}

// Around coffee (left side)
position={[-0.4, -0.15, 0.2]}
```

---

## ⚡ Toggle Effects (Conditional)

```typescript
const [effectsOn, setEffectsOn] = useState(true);

// In Canvas:
{effectsOn && (
  <>
    <RetroEffects />
    <FloatingDust count={200} />
  </>
)}

// UI Button:
<button onClick={() => setEffectsOn(!effectsOn)}>
  Toggle Effects
</button>
```

---

## 🐛 Quick Fixes

**Can't see effects?**
```typescript
// Make sure this is INSIDE <Canvas> and AFTER all meshes:
<RetroEffects />
```

**Too laggy?**
```typescript
<FloatingDust count={50} />  // Reduce from 200
<MinimalEffects />           // Use lighter effects
```

**Effects too strong?**
```typescript
// Reduce intensity in post-effects.tsx:
<Bloom intensity={0.2} />  // Instead of 0.5
```

**Particles in wrong spot?**
```typescript
// Adjust position values:
position={[0, 0.2, 0]}  // Move up
position={[0.5, 0, 0]}  // Move right
```

---

## 📚 Full Documentation

- **Complete guide:** `SHADERS-PARTICLES-GUIDE.md`
- **Code examples:** `components/3d/shaders.tsx`, `particles.tsx`
- **Working scene:** `retro-desk-scene-enhanced.tsx`

---

**TL;DR:** Just use `RetroDeskSceneEnhanced` and it looks sick! 🔥





