# 🎮 Retro 3D Desk Scene Guide

## What You Got

A fully interactive, first-person 3D desk scene with low-poly, retro gaming aesthetics. Think PS1/N64 vibes with modern web tech!

## 🎯 How It Works

### The Architecture

```
RetroDeskScene (Main Scene)
├── Canvas (Three.js renderer)
├── Camera (First-person POV)
├── Lighting (Ambient + Directional + Point)
├── Room (Floor + Walls + Window)
├── Desk (Surface + Legs)
└── Interactive Items
    ├── Monitor (Click → Projects)
    ├── Keyboard (Click → About)
    ├── Mouse (Hoverable)
    ├── Coffee Cup (Click to drink)
    ├── Desk Lamp (Click to toggle light)
    ├── Game Controller (Click → Projects)
    └── Plant (Decoration)
```

### Key Components

#### 1. **Camera Setup** (`retro-desk-scene.tsx`)
```typescript
<PerspectiveCamera
  position={[0, 0.3, 0.8]}  // Sitting position
  fov={60}                   // Field of view
  rotation={[-0.3, 0, 0]}    // Looking down at desk
/>
```

- **Position**: `[x, y, z]` - You're sitting 0.8 units back, 0.3 units up
- **Rotation**: Tilted down slightly to see the desk
- **FOV**: 60° gives natural human perspective

#### 2. **3D Models** (`desk-items.tsx`)

Each item is built from primitive geometries:

**Monitor:**
- `CylinderGeometry` → Stand
- `BoxGeometry` → Frame + Base
- `PlaneGeometry` → Screen
- State: idle/booted, interactive

**Keyboard:**
- Main `BoxGeometry` → Base
- 40 small `BoxGeometry` → Keys
- Grid layout using math

**Coffee Cup:**
- `CylinderGeometry` → Cup body
- `TorusGeometry` → Handle
- Animated steam particles
- Drinkable (3 levels)

**Desk Lamp:**
- Multiple `CylinderGeometry` → Base + Pole
- `ConeGeometry` → Lamp head
- `SpotLight` → Real light when on
- Toggle interaction

**Game Controller:**
- `BoxGeometry` → Body + Grips
- Small cylinders → Buttons
- Wobble animation on hover

#### 3. **Retro Aesthetics**

**Achieved through:**
```typescript
// Low poly counts
<cylinderGeometry args={[radius, radius, height, 6]} /> // Only 6 sides!

// Flat shading (no smooth gradients)
<meshStandardMaterial flatShading />

// Reduced anti-aliasing
gl={{ antialias: false }}

// Lower DPR (pixel density)
dpr={[1, 1.5]}
```

#### 4. **Interactivity**

Three types of interactions:

**Hover:**
```typescript
onPointerOver={() => setHovered(true)}
onPointerOut={() => setHovered(false)}
```

**Click:**
```typescript
onClick={() => router.push("/projects")}
```

**Animation:**
```typescript
useFrame((state) => {
  if (hovered) {
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;
  }
});
```

## 🎨 Customization Guide

### Change Camera Angle

```typescript
// retro-desk-scene.tsx
<PerspectiveCamera
  position={[0, 0.5, 1.2]}    // Further back & higher up
  rotation={[-0.5, 0, 0]}     // Look down more
  fov={50}                     // Narrower FOV (more zoomed in)
/>
```

### Add New Desk Items

1. **Create the component in `desk-items.tsx`:**

```typescript
export function Phone({ position }: { position: [number, number, number] }) {
  const [ringing, setRinging] = useState(false);
  
  return (
    <group position={position}>
      {/* Phone body */}
      <mesh onClick={() => setRinging(!ringing)}>
        <boxGeometry args={[0.06, 0.01, 0.1]} />
        <meshStandardMaterial 
          color={ringing ? "#ff0000" : "#1a1a1a"} 
          flatShading 
        />
      </mesh>
      
      {/* Screen */}
      <mesh position={[0, 0.006, 0]}>
        <planeGeometry args={[0.05, 0.08]} />
        <meshStandardMaterial 
          color="#4a90e2"
          emissive={ringing ? "#4a90e2" : "#000000"}
          emissiveIntensity={ringing ? 0.5 : 0}
        />
      </mesh>
    </group>
  );
}
```

2. **Add to scene in `retro-desk-scene.tsx`:**

```typescript
<Phone position={[-0.3, -0.19, 0.3]} />
```

### Change Colors/Aesthetic

**Make it more cyberpunk:**
```typescript
// Desk surface
<meshStandardMaterial color="#1a0033" flatShading /> // Purple desk

// Add neon lights
<pointLight position={[-1, 0.5, 0]} intensity={2} color="#ff00ff" />
<pointLight position={[1, 0.5, 0]} intensity={2} color="#00ffff" />
```

**Make it cozy/warm:**
```typescript
// Warmer lighting
<ambientLight intensity={0.5} color="#fff4e6" />
<pointLight position={[-2, 1, 1]} intensity={0.8} color="#ffb366" />
```

### Add More Animations

**Floating animation:**
```typescript
useFrame((state) => {
  if (ref.current) {
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.02;
  }
});
```

**Rotation:**
```typescript
useFrame((state) => {
  if (ref.current) {
    ref.current.rotation.y += 0.01;
  }
});
```

### Adjust Retro Effect

**More pixelated (stronger retro):**
```typescript
<Canvas
  dpr={[0.5, 1]}  // Lower resolution
  gl={{ antialias: false }}
/>
```

**Less pixelated (smoother):**
```typescript
<Canvas
  dpr={[1, 2]}
  gl={{ antialias: true }}
/>
```

## 🎮 Interactive Features

### Current Interactions:

| Item | Action | Result |
|------|--------|--------|
| 💻 Monitor | Click once | Boots up with terminal effect |
| 💻 Monitor | Click twice | Navigate to Projects |
| ⌨️ Keyboard | Click | Navigate to About |
| ⌨️ Keyboard | Hover | Keys light up |
| ☕ Coffee | Click (3x) | Drink coffee, steam disappears |
| 💡 Lamp | Click | Toggle light on/off |
| 🎮 Controller | Click | Navigate to Projects |
| 🎮 Controller | Hover | Wobble animation |
| 🖱️ Mouse | Hover | Color changes |

### Add Custom Interactions:

```typescript
// Easter egg example
const [secretClicks, setSecretClicks] = useState(0);

onClick={() => {
  const newCount = secretClicks + 1;
  setSecretClicks(newCount);
  
  if (newCount === 5) {
    unlockAchievement("desk-explorer");
    // Trigger special effect
  }
}}
```

## 🚀 Performance Tips

1. **Keep poly counts low** - Use 6-8 segments max for cylinders
2. **Reuse materials** - Create once, use multiple times
3. **Limit lights** - 3-4 total max
4. **Use `flatShading`** - Faster rendering
5. **Lazy load** - Already implemented with Suspense

## 🛠️ Troubleshooting

**Issue: Items not clickable**
- Make sure `onClick` is on the `<mesh>`, not the `<group>`
- Check if another mesh is blocking (z-fighting)

**Issue: Lighting too dark/bright**
- Adjust `intensity` values on lights
- Add/remove `<ambientLight>`

**Issue: Performance slow**
- Lower `dpr` in Canvas
- Reduce number of lights
- Simplify geometries (fewer segments)

**Issue: Items in wrong position**
- Adjust `position={[x, y, z]}` values
- Remember: +Y is up, +Z is toward camera, +X is right

## 🎯 Next Steps

### Easy Additions:
- 📱 Add phone (ringing effect)
- 🖼️ Add picture frame on desk
- 📚 Add book stack
- 🎧 Add headphones
- 🖊️ Add pen/pencil holder

### Medium Complexity:
- 🪟 Animate window (day/night cycle)
- 📊 Display real data on monitor screen
- 🔊 Add sound effects on interactions
- ✨ Particle effects on hover

### Advanced:
- 🗺️ Multiple desk layouts (switch scenes)
- 👤 Add hand/arm for true FPS feel
- 🎨 Custom 3D models (import .glb files)
- 🌍 Room environment (more detail)

## 📚 Resources

- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)
- [Three.js Docs](https://threejs.org/docs/)
- [Drei Helpers](https://github.com/pmndrs/drei)

---

**Your scene is live at http://localhost:3000** - Start clicking around! 🎮





