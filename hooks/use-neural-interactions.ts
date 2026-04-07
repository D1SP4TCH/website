import { useState, useCallback, useRef, useEffect } from 'react';
import { NeuralNode, getNodeRadius } from '@/lib/neural-map-data';

interface InteractionState {
  hoveredNode: NeuralNode | null;
  selectedNode: NeuralNode | null;
  draggedNode: NeuralNode | null;
  isDragging: boolean;
  dragOffset: { x: number; y: number };
}

interface Transform {
  x: number;
  y: number;
  scale: number;
}

export const useNeuralInteractions = (
  nodes: NeuralNode[],
  canvasRef: React.RefObject<HTMLCanvasElement>,
  transform: Transform
) => {
  const [state, setState] = useState<InteractionState>({
    hoveredNode: null,
    selectedNode: null,
    draggedNode: null,
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
  });

  const lastMousePos = useRef({ x: 0, y: 0 });

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };

      return {
        x: (screenX - rect.left - transform.x) / transform.scale,
        y: (screenY - rect.top - transform.y) / transform.scale,
      };
    },
    [canvasRef, transform]
  );

  // Find node at position
  const findNodeAtPosition = useCallback(
    (canvasX: number, canvasY: number): NeuralNode | null => {
      for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i];
        if (!node.x || !node.y) continue;

        const radius = getNodeRadius(node.size);
        const dx = canvasX - node.x;
        const dy = canvasY - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= radius) {
          return node;
        }
      }
      return null;
    },
    [nodes]
  );

  // Mouse move handler
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      lastMousePos.current = { x: e.clientX, y: e.clientY };

      if (state.isDragging && state.draggedNode) {
        // Update dragged node position
        setState((prev) => ({
          ...prev,
          draggedNode: prev.draggedNode
            ? {
                ...prev.draggedNode,
                x: canvasPos.x - prev.dragOffset.x,
                y: canvasPos.y - prev.dragOffset.y,
              }
            : null,
        }));
      } else {
        // Update hovered node
        const hoveredNode = findNodeAtPosition(canvasPos.x, canvasPos.y);
        setState((prev) => ({
          ...prev,
          hoveredNode,
        }));

        // Update cursor
        canvas.style.cursor = hoveredNode ? 'pointer' : 'grab';
      }
    },
    [canvasRef, screenToCanvas, findNodeAtPosition, state.isDragging, state.draggedNode]
  );

  // Mouse down handler
  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      const node = findNodeAtPosition(canvasPos.x, canvasPos.y);

      if (node) {
        e.preventDefault();
        const dragOffset = {
          x: canvasPos.x - (node.x || 0),
          y: canvasPos.y - (node.y || 0),
        };

        setState((prev) => ({
          ...prev,
          draggedNode: node,
          isDragging: true,
          dragOffset,
        }));

        if (canvasRef.current) {
          canvasRef.current.style.cursor = 'grabbing';
        }
      }
    },
    [canvasRef, screenToCanvas, findNodeAtPosition]
  );

  // Mouse up handler
  const handleMouseUp = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isDragging: false,
      draggedNode: null,
      dragOffset: { x: 0, y: 0 },
    }));

    if (canvasRef.current) {
      canvasRef.current.style.cursor = state.hoveredNode ? 'pointer' : 'grab';
    }
  }, [canvasRef, state.hoveredNode]);

  // Click handler
  const handleClick = useCallback(
    (e: MouseEvent, onNavigate?: (url: string) => void) => {
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      const node = findNodeAtPosition(canvasPos.x, canvasPos.y);

      if (node) {
        setState((prev) => ({
          ...prev,
          selectedNode: node,
        }));

        // Navigate if node has URL
        if (node.url && onNavigate) {
          onNavigate(node.url);
        }
      }
    },
    [screenToCanvas, findNodeAtPosition]
  );

  // Add event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [canvasRef, handleMouseMove, handleMouseDown, handleMouseUp]);

  return {
    hoveredNode: state.hoveredNode,
    selectedNode: state.selectedNode,
    draggedNode: state.draggedNode,
    isDragging: state.isDragging,
    handleClick,
  };
};




