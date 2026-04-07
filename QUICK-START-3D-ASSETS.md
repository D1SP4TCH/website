# 🚀 Quick Start: Import 3D Models (5 Minutes)

## Step-by-Step Tutorial

### 1️⃣ Find a Free Model (1 min)

Go to **https://poly.pizza** and search:
- "low poly monitor"
- "retro computer"
- "desk keyboard"

Click any model → Download `.glb` file

**Example models to try:**
- Monitor: https://poly.pizza/m/cyQKlbGAZR
- Keyboard: https://poly.pizza/m/bxBwezKBtD
- Coffee: https://poly.pizza/m/dScNnCzJBv

### 2️⃣ Add to Project (30 sec)

```bash
# Create models folder
mkdir public/models

# Move your downloaded .glb file there
mv ~/Downloads/monitor.glb public/models/
```

### 3️⃣ Use in Scene (2 min)

Open `components/3d/retro-desk-scene.tsx` and add:

```typescript
import { GenericModel } from "./imported-desk-items";

// Inside your scene, replace the old Monitor with:
<GenericModel 
  path="/models/monitor.glb"
  position={[0, -0.05, -0.2]}
  scale={0.1}
  onClick={() => router.push("/projects")}
/>
```

### 4️⃣ Adjust Size (1 min)

Model too big or small? Change the `scale`:

```typescript
scale={0.05}  // Smaller
scale={0.2}   // Bigger
scale={0.1}   // Just right
```

Model upside down? Add rotation:

```typescript
rotation={[Math.PI, 0, 0]}  // Flip upside down
```

### 5️⃣ Done! 🎉

Refresh http://localhost:3000 and see your imported model!

---

## Common Scenarios

### Replace All Desk Items

```typescript
// In retro-desk-scene.tsx

// Monitor
<GenericModel path="/models/monitor.glb" position={[0, -0.05, -0.2]} scale={0.1} />

// Keyboard  
<GenericModel path="/models/keyboard.glb" position={[0, -0.18, 0.15]} scale={0.08} />

// Coffee Cup
<GenericModel path="/models/coffee.glb" position={[-0.4, -0.18, 0.2]} scale={0.05} />

// Controller
<GenericModel path="/models/controller.glb" position={[0.45, -0.19, -0.1]} scale={0.06} />
```

### Make Model Glow

```typescript
<ImportedMonitor 
  position={[0, 0, 0]}
  scale={0.1}
/>
```

The ImportedMonitor component (in `imported-desk-items.tsx`) already has glow effects built in!

### Mix Primitives + Models

You don't need to replace everything:

```typescript
{/* Use imported model for main items */}
<GenericModel path="/models/monitor.glb" position={[0, 0, 0]} scale={0.1} />

{/* Keep primitives for simple stuff */}
<CoffeeCup position={[-0.4, -0.18, 0.2]} />  {/* Your old primitive */}
```

---

## Troubleshooting

**Model doesn't appear?**
- Check file path: `public/models/yourfile.glb` → use `/models/yourfile.glb`
- Check console for errors (F12)

**Model too big/small?**
- Adjust `scale` prop (try values between 0.01 to 1.0)

**Model wrong orientation?**
- Add `rotation={[Math.PI, 0, 0]}` to flip

**Model too dark?**
- Increase lighting in scene:
  ```typescript
  <ambientLight intensity={0.8} />
  ```

**Performance slow?**
- File too big? Optimize at https://gltf.report
- Too many models? Start with 1-2 first

---

## Pro Tips

✅ **Start small** - Replace one item first (monitor)
✅ **Test immediately** - Check after each model
✅ **Optimize files** - Use https://gltf.report before importing
✅ **Keep backups** - Don't delete your primitive components yet!
✅ **Check licenses** - Poly Pizza is CC0 (free for anything)

---

## Next Steps

Once you're comfortable:
1. Read `IMPORTING-3D-ASSETS.md` for advanced techniques
2. Try animating models with `useAnimations`
3. Add custom materials and effects
4. Create your own models in Blender

Happy modeling! 🎨





