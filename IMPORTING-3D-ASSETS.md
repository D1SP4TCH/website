# 🎨 Importing 3D Assets Guide

## Where to Find Free 3D Models

### Best Sources for Retro/Low-Poly Assets:

1. **Poly Pizza** (FREE, no attribution)
   - https://poly.pizza
   - Huge collection of low-poly models
   - Perfect for retro aesthetic
   - CC0 License (completely free)

2. **Quaternius** (FREE)
   - https://quaternius.com
   - Stylized low-poly packs
   - Great for gaming aesthetic
   - Download entire themed packs

3. **Sketchfab** (FREE + Paid)
   - https://sketchfab.com/3d-models
   - Filter by "Downloadable" + "Free"
   - Check license (CC-BY usually requires attribution)
   - Tons of retro gaming assets

4. **Kenney Assets** (FREE)
   - https://kenney.nl/assets
   - Game-ready low-poly models
   - Consistent style
   - Public domain

5. **Google Poly Archive**
   - https://github.com/google/poly
   - Archived low-poly models
   - Good for simple objects

### What to Look For:
- ✅ `.glb` or `.gltf` format (preferred for web)
- ✅ Low poly count (<10k triangles per object)
- ✅ Under 5MB file size
- ✅ PBR materials (looks better with lighting)
- ✅ Free/CC0 license

## File Formats Explained

| Format | What It Is | When to Use |
|--------|-----------|-------------|
| `.glb` | Binary GLTF (single file) | **BEST for web** - everything in one file |
| `.gltf` | JSON GLTF + separate files | When you need to edit textures separately |
| `.obj` | Old format, no materials | Simple shapes only |
| `.fbx` | Autodesk format | Convert to GLB first |

**Rule of thumb: Always use `.glb` for web!**

## How to Optimize Models for Web

### Using Online Tools:

**1. glTF-Transform (Online)**
- Go to: https://gltf.report
- Upload your `.glb` file
- See poly count, file size, textures
- Use the "Optimize" button
- Download optimized version

**2. gltfjsx (Command Line)**
```bash
# Install
npm install -g gltfjsx

# Convert GLB to React component
npx gltfjsx model.glb --transform

# Options:
# --transform: Auto-optimize
# --simplify: Reduce poly count
# --instance: Enable instancing for performance
```

### Using Blender (Free Software):

```
1. Import model (File → Import → glTF 2.0)
2. Simplify if needed:
   - Select object
   - Add Modifier → Decimate
   - Set Ratio to 0.5 (50% fewer faces)
   - Apply modifier
3. Export:
   - File → Export → glTF 2.0
   - Format: glTF Binary (.glb)
   - Check "Apply Modifiers"
   - Export!
```

### Target Specs for Web:
- **File size:** <2MB per model (ideally <500KB)
- **Poly count:** <5,000 triangles per object
- **Texture size:** 512x512 or 1024x1024 (not 4K!)
- **Textures:** Combine into single atlas if possible

## Implementation in Your Project

### Step 1: Add Model Files

Create a models directory:
```bash
mkdir public/models
```

Put your `.glb` files there:
```
public/
└── models/
    ├── monitor.glb
    ├── keyboard.glb
    ├── coffee-cup.glb
    └── game-controller.glb
```

### Step 2: Install GLTF Loader (Already Installed!)

Drei already includes `useGLTF` - you're good to go!

### Step 3: Create Model Component

**Option A: Simple Direct Load**

```typescript
// components/3d/imported-models.tsx
"use client";

import { useGLTF } from "@react-three/drei";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ImportedMonitor({ position }: { position: [number, number, number] }) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  
  // Load the model
  const { scene } = useGLTF("/models/monitor.glb");
  
  return (
    <primitive
      object={scene}
      position={position}
      scale={0.1} // Adjust size as needed
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => router.push("/projects")}
    />
  );
}

// Preload for better performance
useGLTF.preload("/models/monitor.glb");
```

**Option B: With Animations & Control**

```typescript
import { useGLTF, useAnimations } from "@react-three/drei";
import { useEffect, useRef } from "react";

export function AnimatedMonitor({ position }: { position: [number, number, number] }) {
  const group = useRef();
  const { scene, animations } = useGLTF("/models/monitor.glb");
  const { actions } = useAnimations(animations, group);
  
  useEffect(() => {
    // Play animation named "ScreenOn" if it exists
    if (actions && actions["ScreenOn"]) {
      actions["ScreenOn"].play();
    }
  }, [actions]);
  
  return (
    <group ref={group} position={position}>
      <primitive object={scene} scale={0.1} />
    </group>
  );
}

useGLTF.preload("/models/monitor.glb");
```

**Option C: With Custom Materials/Emissive**

```typescript
import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

export function GlowingMonitor({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF("/models/monitor.glb");
  
  useEffect(() => {
    // Find the screen mesh and make it glow
    scene.traverse((child) => {
      if (child.name === "Screen") { // Check name in Blender
        child.material = new THREE.MeshStandardMaterial({
          color: "#3b82f6",
          emissive: "#3b82f6",
          emissiveIntensity: 0.5,
        });
      }
    });
  }, [scene]);
  
  return <primitive object={scene} position={position} scale={0.1} />;
}

useGLTF.preload("/models/monitor.glb");
```

### Step 4: Use in Scene

```typescript
// components/3d/retro-desk-scene.tsx
import { ImportedMonitor } from "./imported-models";

export function RetroDeskScene() {
  return (
    <Canvas>
      {/* Replace old Monitor with new one */}
      <ImportedMonitor position={[0, -0.05, -0.2]} />
      
      {/* Keep other items or replace them too */}
      <Keyboard position={[0, -0.18, 0.15]} />
    </Canvas>
  );
}
```

## Advanced Techniques

### Instance Same Model Multiple Times

For repeated objects (like books, plants):

```typescript
import { useGLTF, Instances, Instance } from "@react-three/drei";

function Books() {
  const { scene } = useGLTF("/models/book.glb");
  
  return (
    <Instances geometry={scene.children[0].geometry} material={scene.children[0].material}>
      <Instance position={[0, 0, 0]} rotation={[0, 0, 0]} />
      <Instance position={[0.1, 0, 0]} rotation={[0, 0.2, 0]} />
      <Instance position={[0.2, 0, 0]} rotation={[0, -0.1, 0]} />
    </Instances>
  );
}
```

### Mix Primitives with Models

You don't have to replace everything!

```typescript
<group>
  {/* Use imported model for hero item */}
  <ImportedMonitor position={[0, 0, 0]} />
  
  {/* Keep primitives for simple items */}
  <mesh position={[0.5, 0, 0]}>
    <boxGeometry args={[0.1, 0.1, 0.1]} />
    <meshStandardMaterial color="#ff0000" />
  </mesh>
</group>
```

### Add Shadows

```typescript
export function ImportedModel({ position }) {
  const { scene } = useGLTF("/models/item.glb");
  
  // Enable shadows for all meshes
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);
  
  return <primitive object={scene} position={position} />;
}
```

## TypeScript Support

Create type definitions:

```typescript
// types/gltf.d.ts
import { GLTF } from "three-stdlib";

export type MonitorGLTF = GLTF & {
  nodes: {
    Screen: THREE.Mesh;
    Frame: THREE.Mesh;
    Stand: THREE.Mesh;
  };
  materials: {
    ScreenMaterial: THREE.MeshStandardMaterial;
    PlasticMaterial: THREE.MeshStandardMaterial;
  };
};
```

Use it:

```typescript
import type { MonitorGLTF } from "@/types/gltf";

export function Monitor() {
  const { nodes, materials } = useGLTF("/models/monitor.glb") as MonitorGLTF;
  
  return (
    <group>
      <mesh geometry={nodes.Screen.geometry} material={materials.ScreenMaterial} />
      <mesh geometry={nodes.Frame.geometry} material={materials.PlasticMaterial} />
    </group>
  );
}
```

## Common Issues & Fixes

### Issue: Model Too Big/Small
```typescript
<primitive object={scene} scale={0.1} /> // Adjust this number
```

### Issue: Model Upside Down
```typescript
<primitive object={scene} rotation={[Math.PI, 0, 0]} />
```

### Issue: Model Too Dark
```typescript
// Increase ambient light
<ambientLight intensity={0.8} />

// Or make materials brighter
scene.traverse((child) => {
  if (child.isMesh) {
    child.material.emissiveIntensity = 0.2;
  }
});
```

### Issue: Model Not Clickable
```typescript
// Make sure raycast is enabled
scene.traverse((child) => {
  if (child.isMesh) {
    child.raycast = THREE.Mesh.prototype.raycast;
  }
});
```

### Issue: Slow Performance
```typescript
// Enable frustum culling
<primitive object={scene} frustumCulled={true} />

// Or use LOD (Level of Detail)
import { Detailed } from "@react-three/drei";

<Detailed distances={[0, 10, 20]}>
  <HighPolyModel />
  <MediumPolyModel />
  <LowPolyModel />
</Detailed>
```

## Recommended Workflow

1. **Find model** on Poly Pizza or Sketchfab
2. **Download** as `.glb`
3. **Test in viewer** at https://gltf.report
4. **Optimize** if >2MB or >10k triangles
5. **Put in** `public/models/`
6. **Import** with `useGLTF`
7. **Adjust** scale/position/rotation
8. **Add** interactions
9. **Preload** for performance

## Quick Start Example

Let me create a ready-to-use component for you!





