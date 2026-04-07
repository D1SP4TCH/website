'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createSampleData, NeuralNode } from '@/lib/neural-map-data';
import { DebugPanel } from './debug-panel';

interface Neural3DNetworkProps {
  onReady?: () => void;
  debugMode?: boolean;
}

interface Node3D extends NeuralNode {
  mesh?: THREE.Mesh;
  innerGlow?: THREE.Mesh;
  glowMesh?: THREE.Mesh;
  z?: number;
}

interface SignalParticle {
  geometry: THREE.BufferGeometry;
  material: THREE.LineBasicMaterial;
  line: THREE.Line;
  progress: number;
  speed: number;
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;
}

export const Neural3DNetwork = ({ onReady, debugMode }: Neural3DNetworkProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [nodes, setNodes] = useState<Node3D[]>([]);
  const [hoveredNode, setHoveredNode] = useState<Node3D | null>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const router = useRouter();
  const signalParticlesRef = useRef<SignalParticle[]>([]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 1200, 2500);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      3000
    );
    camera.position.set(0, 0, 900);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 400;
    controls.maxDistance = 1500;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const light1 = new THREE.PointLight(0x8b5cf6, 3, 1500);
    light1.position.set(300, 300, 300);
    scene.add(light1);

    const light2 = new THREE.PointLight(0x3b82f6, 3, 1500);
    light2.position.set(-300, -300, 300);
    scene.add(light2);

    const light3 = new THREE.PointLight(0x06b6d4, 2, 1500);
    light3.position.set(0, 300, -300);
    scene.add(light3);

    // Create nodes
    const { nodes: sampleNodes } = createSampleData();
    const nodes3D = initializeNodes(sampleNodes, scene);
    setNodes(nodes3D);

    // Create connections
    createConnections(nodes3D, scene);

    onReady?.();

    // Animation loop variables
    let time = 0;

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      time += 0.016;

      // Update nodes
      nodes3D.forEach((node) => {
        if (!node.mesh || !node.glowMesh || !node.innerGlow) return;

        // Distance from center for wave effect
        const distFromCenter = Math.sqrt(
          node.mesh.position.x ** 2 + 
          node.mesh.position.y ** 2 + 
          node.mesh.position.z ** 2
        );
        
        const wave = Math.sin(time * 2 - distFromCenter * 0.01) * 0.5 + 0.5;
        
        // Check if this node is hovered or connected to hovered
        const isHovered = hoveredNode?.id === node.id;
        const isConnected = hoveredNode && node.connections.includes(hoveredNode.id);
        
        // Pulse glow
        const glowMat = node.glowMesh.material as THREE.MeshBasicMaterial;
        glowMat.opacity = isHovered ? 0.7 : isConnected ? 0.5 : wave * 0.25;
        
        // Scale animation
        const scale = isHovered ? 1.4 : isConnected ? 1.2 : 1 + wave * 0.08;
        node.glowMesh.scale.set(scale, 1, scale);
        
        // Rotate
        node.mesh.rotation.z += isHovered ? 0.03 : 0.008;
        
        // Inner glow pulse
        const innerMat = node.innerGlow.material as THREE.MeshBasicMaterial;
        innerMat.opacity = isHovered ? 0.8 : isConnected ? 0.6 : 0.3 + wave * 0.2;
        
        // Main material
        const mainMat = node.mesh.material as THREE.MeshPhysicalMaterial;
        mainMat.opacity = isHovered ? 0.6 : isConnected ? 0.45 : 0.3;
      });

      // Update signal particles
      signalParticlesRef.current = signalParticlesRef.current.filter(signal => {
        signal.progress += signal.speed;

        if (signal.progress >= 1) {
          scene.remove(signal.line);
          signal.geometry.dispose();
          signal.material.dispose();
          return false;
        }

        // Fade out as it reaches target
        signal.material.opacity = 0.9 * (1 - signal.progress);

        // Update line to show progress
        const currentPos = signal.startPos.clone().lerp(signal.endPos, signal.progress);
        const trailLength = 0.15; // Length of the trail
        const trailStart = Math.max(0, signal.progress - trailLength);
        const trailStartPos = signal.startPos.clone().lerp(signal.endPos, trailStart);
        
        const positions = signal.geometry.attributes.position;
        positions.setXYZ(0, trailStartPos.x, trailStartPos.y, trailStartPos.z);
        positions.setXYZ(1, currentPos.x, currentPos.y, currentPos.z);
        positions.needsUpdate = true;

        return true;
      });

      // Spawn signals to hovered node
      if (hoveredNode && hoveredNode.mesh && Math.random() > 0.85) {
        const connectedNodes = nodes3D.filter(n => 
          n.mesh && hoveredNode.connections.includes(n.id)
        );

        if (connectedNodes.length > 0) {
          const sourceNode = connectedNodes[Math.floor(Math.random() * connectedNodes.length)];
          if (sourceNode.mesh) {
            const startPos = sourceNode.mesh.position.clone();
            const endPos = hoveredNode.mesh.position.clone();
            const points = [startPos, endPos];

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
              color: 0xffffff,
              transparent: true,
              opacity: 0.9,
            });

            const line = new THREE.Line(geometry, material);
            scene.add(line);

            signalParticlesRef.current.push({
              geometry,
              material,
              line,
              progress: 0,
              speed: 0.04 + Math.random() * 0.03,
              startPos,
              endPos,
            });

            // Limit signals
            if (signalParticlesRef.current.length > 15) {
              const removed = signalParticlesRef.current.shift();
              if (removed) {
                scene.remove(removed.line);
                removed.geometry.dispose();
                removed.material.dispose();
              }
            }
          }
        }
      }
      
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      
      // Clean up signals
      signalParticlesRef.current.forEach(signal => {
        scene.remove(signal.line);
        signal.geometry.dispose();
        signal.material.dispose();
      });
      
      renderer.dispose();
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [onReady, hoveredNode]);

  // Initialize nodes with hexagonal geometry
  const initializeNodes = (nodes: NeuralNode[], scene: THREE.Scene): Node3D[] => {
    const presetPositions: Record<string, { x: number; y: number; z: number }> = {
      'center': { x: 0, y: 0, z: 0 },
      'about': { x: -163, y: -131, z: -50 },
      'projects-hub': { x: 63, y: -80, z: 50 },
      'contact': { x: 0, y: 140, z: -30 },
      'project-1': { x: 78, y: 82, z: 40 },
      'project-2': { x: -244, y: 136, z: -40 },
      'project-3': { x: 0, y: -200, z: 60 },
      'skill-react': { x: 281, y: -134, z: -60 },
      'skill-nextjs': { x: 431, y: 171, z: 30 },
      'skill-canvas': { x: 180, y: 276, z: -45 },
      'skill-threejs': { x: -442, y: 269, z: 55 },
      'skill-webgl': { x: -516, y: -154, z: -35 },
      'skill-typescript': { x: -422, y: 50, z: 45 },
      'skill-design': { x: -348, y: -305, z: -55 },
      'skill-development': { x: 100, y: -275, z: 35 },
    };

    return nodes.map((node) => {
      const preset = presetPositions[node.id] || { x: 0, y: 0, z: 0 };
      
      // Hexagonal geometry
      const size = node.size === 'large' ? 70 : node.size === 'medium' ? 45 : 28;
      const geometry = new THREE.CylinderGeometry(size, size, 15, 6);
      
      // Glass morphism material
      const material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(node.color),
        transparent: true,
        opacity: 0.3,
        metalness: 0,
        roughness: 0.05,
        transmission: 0.9,
        thickness: 1.5,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        ior: 1.5,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(preset.x, preset.y, preset.z);
      mesh.rotation.x = Math.PI / 2;
      mesh.userData = { nodeId: node.id };
      scene.add(mesh);

      // Inner glow sphere
      const innerGlowGeometry = new THREE.SphereGeometry(size * 0.5, 16, 16);
      const innerGlowMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(node.color),
        transparent: true,
        opacity: 0.4,
      });
      const innerGlow = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
      innerGlow.position.copy(mesh.position);
      scene.add(innerGlow);

      // Outer glow
      const glowGeometry = new THREE.CylinderGeometry(size * 2, size * 2, 15, 6);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(node.color),
        transparent: true,
        opacity: 0,
        side: THREE.BackSide,
      });
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      glowMesh.position.copy(mesh.position);
      glowMesh.rotation.x = Math.PI / 2;
      scene.add(glowMesh);

      return {
        ...node,
        x: preset.x,
        y: preset.y,
        z: preset.z,
        mesh,
        innerGlow,
        glowMesh,
      };
    });
  };

  // Create connection lines
  const createConnections = (nodes: Node3D[], scene: THREE.Scene) => {
    const drawnConnections = new Set<string>();

    nodes.forEach((node1) => {
      if (!node1.mesh) return;

      node1.connections.forEach((connId) => {
        const connectionKey = [node1.id, connId].sort().join('-');
        if (drawnConnections.has(connectionKey)) return;
        drawnConnections.add(connectionKey);

        const node2 = nodes.find((n) => n.id === connId);
        if (!node2 || !node2.mesh) return;

        const points = [
          node1.mesh.position.clone(),
          node2.mesh.position.clone(),
        ];

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: 0x4a5568,
          transparent: true,
          opacity: 0.12,
        });

        const line = new THREE.Line(geometry, material);
        scene.add(line);
      });
    });
  };

  // Main Three.js setup
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const controls = controlsRef.current;

    if (!scene || !camera || !renderer || !controls) {
      // Initialize on first run
      const newScene = new THREE.Scene();
      newScene.background = new THREE.Color(0x0a0a0a);
      newScene.fog = new THREE.Fog(0x0a0a0a, 1200, 2500);
      sceneRef.current = newScene;

      const newCamera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        3000
      );
      newCamera.position.set(0, 0, 900);
      cameraRef.current = newCamera;

      const newRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      newRenderer.setSize(window.innerWidth, window.innerHeight);
      newRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(newRenderer.domElement);
      rendererRef.current = newRenderer;

      const newControls = new OrbitControls(newCamera, newRenderer.domElement);
      newControls.enableDamping = true;
      newControls.dampingFactor = 0.05;
      newControls.enablePan = false;
      newControls.minDistance = 400;
      newControls.maxDistance = 1500;
      newControls.autoRotate = !debugMode;
      newControls.autoRotateSpeed = 0.3;
      controlsRef.current = newControls;

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      newScene.add(ambientLight);

      const light1 = new THREE.PointLight(0x8b5cf6, 3, 1500);
      light1.position.set(300, 300, 300);
      newScene.add(light1);

      const light2 = new THREE.PointLight(0x3b82f6, 3, 1500);
      light2.position.set(-300, -300, 300);
      newScene.add(light2);

      const light3 = new THREE.PointLight(0x06b6d4, 2, 1500);
      light3.position.set(0, 300, -300);
      newScene.add(light3);

      // Create nodes
      const { nodes: sampleNodes } = createSampleData();
      const nodes3D = initializeNodes(sampleNodes, newScene);
      setNodes(nodes3D);

      // Create connections
      createConnections(nodes3D, newScene);

      setTimeout(() => onReady?.(), 100);
    }

    // Handle resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [onReady, debugMode]);

  // Animation loop
  useEffect(() => {
    if (nodes.length === 0) return;

    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const controls = controlsRef.current;

    if (!scene || !camera || !renderer || !controls) return;

    let time = 0;
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      time += 0.016;

      // Update nodes with wave animation
      nodes.forEach((node) => {
        if (!node.mesh || !node.glowMesh || !node.innerGlow) return;

        const distFromCenter = node.mesh.position.length();
        const wave = Math.sin(time * 2 - distFromCenter * 0.01) * 0.5 + 0.5;
        
        const isHovered = hoveredNode?.id === node.id;
        const isConnected = hoveredNode && node.connections.includes(hoveredNode.id);
        
        // Glow
        const glowMat = node.glowMesh.material as THREE.MeshBasicMaterial;
        glowMat.opacity = isHovered ? 0.7 : isConnected ? 0.5 : wave * 0.25;
        
        const scale = isHovered ? 1.4 : isConnected ? 1.2 : 1 + wave * 0.08;
        node.glowMesh.scale.set(scale, 1, scale);
        
        // Rotation
        node.mesh.rotation.z += isHovered ? 0.03 : 0.008;
        
        // Inner glow
        const innerMat = node.innerGlow.material as THREE.MeshBasicMaterial;
        innerMat.opacity = isHovered ? 0.8 : isConnected ? 0.6 : 0.3 + wave * 0.2;
        
        // Main material
        const mainMat = node.mesh.material as THREE.MeshPhysicalMaterial;
        mainMat.opacity = isHovered ? 0.6 : isConnected ? 0.45 : 0.3;
      });

      // Update signals
      signalParticlesRef.current = signalParticlesRef.current.filter(signal => {
        signal.progress += signal.speed;

        if (signal.progress >= 1) {
          scene.remove(signal.line);
          signal.geometry.dispose();
          signal.material.dispose();
          return false;
        }

        signal.material.opacity = 0.9 * (1 - signal.progress);

        const currentPos = signal.startPos.clone().lerp(signal.endPos, signal.progress);
        const trailLength = 0.15;
        const trailStart = Math.max(0, signal.progress - trailLength);
        const trailStartPos = signal.startPos.clone().lerp(signal.endPos, trailStart);
        
        const positions = signal.geometry.attributes.position;
        positions.setXYZ(0, trailStartPos.x, trailStartPos.y, trailStartPos.z);
        positions.setXYZ(1, currentPos.x, currentPos.y, currentPos.z);
        positions.needsUpdate = true;

        return true;
      });

      // Spawn signals
      if (hoveredNode && hoveredNode.mesh && Math.random() > 0.85) {
        const connectedNodes = nodes.filter(n => 
          n.mesh && hoveredNode.connections.includes(n.id)
        );

        if (connectedNodes.length > 0) {
          const sourceNode = connectedNodes[Math.floor(Math.random() * connectedNodes.length)];
          if (sourceNode.mesh) {
            const startPos = sourceNode.mesh.position.clone();
            const endPos = hoveredNode.mesh.position.clone();

            const geometry = new THREE.BufferGeometry().setFromPoints([startPos, endPos]);
            const material = new THREE.LineBasicMaterial({
              color: 0xffffff,
              transparent: true,
              opacity: 0.9,
            });

            const line = new THREE.Line(geometry, material);
            scene.add(line);

            signalParticlesRef.current.push({
              geometry,
              material,
              line,
              progress: 0,
              speed: 0.04 + Math.random() * 0.03,
              startPos,
              endPos,
            });

            if (signalParticlesRef.current.length > 15) {
              const removed = signalParticlesRef.current.shift();
              if (removed) {
                scene.remove(removed.line);
                removed.geometry.dispose();
                removed.material.dispose();
              }
            }
          }
        }
      }
      
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [nodes, hoveredNode]);

  // Mouse interaction
  useEffect(() => {
    if (!containerRef.current || !cameraRef.current || nodes.length === 0) return;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = containerRef.current!.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, cameraRef.current!);
      
      const meshes = nodes.map(n => n.mesh).filter(Boolean) as THREE.Mesh[];
      const intersects = raycaster.current.intersectObjects(meshes);

      if (intersects.length > 0) {
        const nodeId = intersects[0].object.userData.nodeId;
        const node = nodes.find(n => n.id === nodeId);
        setHoveredNode(node || null);
        if (containerRef.current) {
          containerRef.current.style.cursor = 'pointer';
        }
      } else {
        setHoveredNode(null);
        if (containerRef.current) {
          containerRef.current.style.cursor = 'grab';
        }
      }
    };

    const handleClick = () => {
      if (hoveredNode && hoveredNode.url && !debugMode) {
        router.push(hoveredNode.url);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, [nodes, hoveredNode, router, debugMode]);

  // Update auto-rotate based on debug mode
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = !debugMode;
    }
  }, [debugMode]);

  return (
    <>
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />
      
      {debugMode && nodes.length > 0 && (
        <DebugPanel 
          nodes={nodes.map(n => ({
            ...n,
            x: n.mesh?.position.x || 0,
            y: n.mesh?.position.y || 0,
          }))} 
          onClose={() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('neural-debug-mode');
              window.location.reload();
            }
          }} 
        />
      )}
    </>
  );
};
