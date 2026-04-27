'use client';

import { motion, type MotionValue } from 'framer-motion';

export function ActualGardenWindow({
  opacity,
  vertical,
}: {
  opacity: MotionValue<number>;
  vertical: boolean;
}) {
  const restingLayout = vertical
    ? {
        left: '50%',
        top: '49%',
        width: '88%',
        height: '58%',
        x: '-50%',
        y: '-50%',
        scale: 1,
      }
    : {
        left: '9%',
        top: '26%',
        width: '78%',
        height: '66%',
        x: '0%',
        y: '0%',
        scale: 1,
      };

  return (
    <motion.div
      className="pointer-events-none absolute"
      initial={restingLayout}
      animate={restingLayout}
      transition={{ duration: 0.55, ease: [0.65, 0, 0.35, 1] }}
      style={{ opacity }}
      aria-hidden
    >
      <div className="relative h-full w-full rounded-[1.6rem] border border-[#d2c22d]/70 shadow-[0_22px_56px_rgba(23,28,25,0.16)]">
        <div className="pointer-events-none absolute inset-0 rounded-[1.6rem] ring-1 ring-inset ring-white/40" />
        <div className="pointer-events-none absolute inset-0 rounded-[1.6rem] bg-[radial-gradient(circle_at_50%_30%,transparent_0%,transparent_55%,rgba(18,23,19,0.18)_100%)]" />
      </div>
    </motion.div>
  );
}
