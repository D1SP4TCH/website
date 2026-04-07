'use client';

import { useState } from 'react';
import { NeuralNode } from '@/lib/neural-map-data';

interface DebugPanelProps {
  nodes: NeuralNode[];
  onClose: () => void;
}

export const DebugPanel = ({ nodes, onClose }: DebugPanelProps) => {
  const [copied, setCopied] = useState(false);

  const generateCode = () => {
    const positions = nodes
      .filter(n => n.x !== undefined && n.y !== undefined)
      .map(n => `      '${n.id}': { x: ${Math.round(n.x!)}, y: ${Math.round(n.y!)} },`)
      .join('\n');

    return `const presetPositions: Record<string, { x: number; y: number }> = {
${positions}
    };`;
  };

  const copyToClipboard = async () => {
    const code = generateCode();
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed top-4 right-4 bg-black/95 border border-purple-500 rounded-lg p-4 max-w-md max-h-[80vh] overflow-auto z-[100]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg">🔧 Debug Mode</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-xl leading-none"
          aria-label="Close debug panel"
        >
          ×
        </button>
      </div>

      <div className="space-y-3 mb-4">
        <div className="text-sm text-gray-300">
          <p className="mb-2">• Drag nodes to reposition them</p>
          <p className="mb-2 text-green-400">✓ Navigation disabled in debug mode</p>
          <p className="mb-2">• Click "Copy Code" when done</p>
          <p>• Paste into <code className="bg-purple-900/50 px-1 rounded">use-neural-physics.ts</code></p>
        </div>
      </div>

      <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
        <p className="text-xs text-gray-400 font-semibold">Current Positions:</p>
        {nodes.map((node) => (
          <div key={node.id} className="text-xs font-mono text-gray-300 flex justify-between">
            <span className="text-purple-400">{node.id}</span>
            <span>({Math.round(node.x || 0)}, {Math.round(node.y || 0)})</span>
          </div>
        ))}
      </div>

      <button
        onClick={copyToClipboard}
        className={`w-full py-2 px-4 rounded transition-colors ${
          copied
            ? 'bg-green-600 text-white'
            : 'bg-purple-600 hover:bg-purple-700 text-white'
        }`}
      >
        {copied ? '✓ Copied!' : 'Copy Code to Clipboard'}
      </button>

      <details className="mt-4">
        <summary className="text-sm text-gray-400 cursor-pointer hover:text-white mb-2">
          Preview Code
        </summary>
        <pre className="text-xs bg-black/50 p-3 rounded overflow-x-auto text-gray-300">
          <code>{generateCode()}</code>
        </pre>
      </details>
    </div>
  );
};

