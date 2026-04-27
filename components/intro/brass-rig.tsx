'use client';

import { motion, useMotionTemplate, useTransform, type MotionValue } from 'framer-motion';

type BrassRigProps = {
  nodeX: MotionValue<number>;
  nodeY: MotionValue<number>;
  width: number;
  height: number;
  drawn: boolean;
  pulse: MotionValue<number>;
  flicker: MotionValue<number>;
  vertical: boolean;
};

export function BrassRig({
  nodeX,
  nodeY,
  width,
  height,
  drawn,
  pulse,
  flicker,
  vertical,
}: BrassRigProps) {
  const startA = vertical ? { x: width / 2, y: 0 } : { x: 0, y: 0 };
  const startB = vertical ? { x: width / 2, y: height } : { x: width, y: 0 };

  const ctrlA = useTransform([nodeX, nodeY], ([x, y]) => {
    const nx = x as number;
    const ny = y as number;
    if (vertical) return `${(startA.x + nx) / 2},${startA.y + (ny - startA.y) * 0.35}`;
    return `${startA.x + (nx - startA.x) * 0.35},${(startA.y + ny) / 2}`;
  });

  const ctrlB = useTransform([nodeX, nodeY], ([x, y]) => {
    const nx = x as number;
    const ny = y as number;
    if (vertical) return `${(startB.x + nx) / 2},${startB.y + (ny - startB.y) * 0.35}`;
    return `${startB.x + (nx - startB.x) * 0.35},${(startB.y + ny) / 2}`;
  });

  const endPoint = useMotionTemplate`${nodeX},${nodeY}`;
  const pathA = useMotionTemplate`M ${startA.x} ${startA.y} Q ${ctrlA} ${endPoint}`;
  const pathB = useMotionTemplate`M ${startB.x} ${startB.y} Q ${ctrlB} ${endPoint}`;
  const opacity = useTransform(flicker, (f) => 0.82 + f * 0.18);
  const strokeWidth = useTransform(flicker, (f) => 1.15 + f * 0.55);
  const nodeScale = useTransform(pulse, (p) => p);
  const glowOpacity = useTransform(pulse, (p) => 0.38 + (p - 1) * 1.25);

  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <radialGradient id="combined-brass-node-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#d2c22d" stopOpacity="0.95" />
          <stop offset="62%" stopColor="#d2c22d" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#d2c22d" stopOpacity="0" />
        </radialGradient>
      </defs>
      {[pathA, pathB].map((path, index) => (
        <motion.path
          key={index}
          d={path}
          stroke="#d2c22d"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={drawn ? { pathLength: 1 } : { pathLength: 0 }}
          transition={drawn ? { pathLength: { duration: 0.75, ease: 'easeOut' } } : undefined}
          style={{
            opacity,
            strokeWidth,
            filter: 'drop-shadow(0 0 5px rgba(210,194,45,0.5))',
          }}
        />
      ))}
      <motion.circle
        cx={nodeX}
        cy={nodeY}
        r={26}
        fill="url(#combined-brass-node-glow)"
        style={{ scale: nodeScale, opacity: glowOpacity, transformOrigin: 'center', transformBox: 'fill-box' }}
      />
      <motion.circle
        cx={nodeX}
        cy={nodeY}
        r={6}
        fill="#d2c22d"
        initial={{ opacity: 0 }}
        animate={{ opacity: drawn ? 1 : 0 }}
        transition={{ duration: 0.4, delay: drawn ? 0.45 : 0 }}
        style={{
          scale: nodeScale,
          transformOrigin: 'center',
          transformBox: 'fill-box',
          filter: 'drop-shadow(0 0 7px rgba(210,194,45,0.86))',
        }}
      />
    </svg>
  );
}
