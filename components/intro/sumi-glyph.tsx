'use client';

import { motion } from 'framer-motion';

const BRUSH_STACK =
  "'Kaiti SC','STKaiti','Yu Mincho','YuMincho','Hiragino Mincho ProN','Hiragino Mincho Pro','Songti SC','SimSun','DFKai-SB','serif'";

export function SumiGlyph({
  glyph,
  size = 220,
  delay = 0,
  reducedMotion = false,
  color = '#1a1a1a',
}: {
  glyph: 'garden' | 'work';
  size?: number;
  delay?: number;
  reducedMotion?: boolean;
  color?: string;
}) {
  const character = glyph === 'garden' ? '庭' : '作';

  return (
    <motion.span
      aria-hidden
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reducedMotion ? { duration: 0.01 } : { delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: 'inline-block',
        lineHeight: 1,
        fontFamily: BRUSH_STACK,
        fontWeight: 400,
        color,
        fontSize: size,
        textShadow: `0 0 1.2px ${color}88, 0 0 7px ${color}18`,
        userSelect: 'none',
        WebkitTextStroke: `0.4px ${color}55`,
      }}
    >
      <motion.span
        initial={reducedMotion ? { clipPath: 'inset(0 0 0 0)' } : { clipPath: 'inset(0 0 100% 0)' }}
        animate={{ clipPath: 'inset(0 0 0 0)' }}
        transition={reducedMotion ? { duration: 0.01 } : { delay: delay + 0.1, duration: 0.58, ease: [0.65, 0, 0.35, 1] }}
        style={{ display: 'inline-block', willChange: 'clip-path' }}
      >
        {character}
      </motion.span>
    </motion.span>
  );
}

export function HankoSeal({
  delay = 0,
  size = 38,
  reducedMotion = false,
}: {
  delay?: number;
  size?: number;
  reducedMotion?: boolean;
}) {
  return (
    <motion.svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 44 44"
      initial={reducedMotion ? { opacity: 1, scale: 1, rotate: -4 } : { opacity: 0, scale: 0, rotate: -8 }}
      animate={{ opacity: 1, scale: 1, rotate: -4 }}
      transition={
        reducedMotion
          ? { duration: 0.01 }
          : { delay, duration: 0.34, type: 'spring', stiffness: 320, damping: 14, mass: 0.6 }
      }
      style={{ display: 'block' }}
    >
      <defs>
        <filter id="combined-hanko-bleed" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.4" />
        </filter>
      </defs>
      <rect x="3" y="3" width="38" height="38" rx="3" fill="#a82a1f" filter="url(#combined-hanko-bleed)" opacity="0.96" />
      <rect x="3" y="3" width="38" height="38" rx="3" fill="none" stroke="#7a1d15" strokeOpacity="0.35" strokeWidth="0.6" />
      <rect x="13" y="20.5" width="18" height="3" fill="#f5f1e6" opacity="0.92" rx="0.4" />
      <rect x="20.5" y="13" width="3" height="18" fill="#f5f1e6" opacity="0.92" rx="0.4" />
    </motion.svg>
  );
}
