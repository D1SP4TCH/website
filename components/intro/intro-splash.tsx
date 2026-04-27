'use client';

import { useRouter } from 'next/navigation';
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActualGardenWindow } from './actual-garden-window';
import { BrassRig } from './brass-rig';
import { EditorialWorkVisual } from './ink-visuals';
import { HankoSeal, SumiGlyph } from './sumi-glyph';
import { useEntryChoice, type EntryChoice } from './use-entry-choice';

const COMMIT_THRESHOLD = 0.01;
const COMMIT_HOLD_MS = 250;
const INTRO_MS = 320;

export function IntroSplash() {
  const router = useRouter();
  const { status, persist } = useEntryChoice();
  const [mounted, setMounted] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [vertical, setVertical] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [introReady, setIntroReady] = useState(false);
  const [committable, setCommittable] = useState<EntryChoice | null>(null);
  const [committed, setCommitted] = useState<EntryChoice | null>(null);
  const [gardenEntered, setGardenEntered] = useState(false);
  const [commitPoint, setCommitPoint] = useState({ x: 50, y: 50 });
  const focusedRef = useRef<EntryChoice>('garden');
  const sustainRef = useRef<{ side: EntryChoice | null; since: number }>({ side: null, since: 0 });
  const commitTimerRef = useRef<number | null>(null);
  const lastLayerRef = useRef(0);

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const pulse = useMotionValue(1);
  const flicker = useMotionValue(0);
  const nodeX = useSpring(cursorX, { stiffness: 120, damping: 18, mass: 0.6 });
  const nodeY = useSpring(cursorY, { stiffness: 120, damping: 18, mass: 0.6 });
  const pulseSpring = useSpring(pulse, { stiffness: 280, damping: 18 });
  const flickerSpring = useSpring(flicker, { stiffness: 320, damping: 22 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    router.prefetch('/garden');
    router.prefetch('/projects');
  }, [router]);

  useEffect(() => {
    if (status !== 'show' || gardenEntered) {
      delete document.body.dataset.splashOpen;
      delete document.body.dataset.gardenEntering;
      if (gardenEntered) {
        document.body.dataset.gardenActive = 'true';
      }
      return;
    }
    delete document.body.dataset.gardenActive;
    document.body.dataset.splashOpen = 'true';
    return () => {
      delete document.body.dataset.splashOpen;
      delete document.body.dataset.gardenEntering;
    };
  }, [gardenEntered, status]);

  useEffect(() => {
    if (committed === 'garden' && !gardenEntered) {
      document.body.dataset.gardenEntering = 'true';
      return;
    }
    delete document.body.dataset.gardenEntering;
  }, [committed, gardenEntered]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setSize({ width, height });
      setVertical(width < 768);
      cursorX.set(width / 2);
      cursorY.set(height / 2);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [cursorX, cursorY]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (status !== 'show') return;
    if (reducedMotion) {
      setIntroReady(true);
      return;
    }
    setIntroReady(false);
    const timer = window.setTimeout(() => setIntroReady(true), INTRO_MS);
    return () => window.clearTimeout(timer);
  }, [status, reducedMotion]);

  const centerX = size.width / 2;
  const centerY = size.height / 2;

  const signedBias = useTransform<number, number>([nodeX, nodeY], ([x, y]) => {
    if (!size.width || !size.height) return 0;
    const raw = vertical ? ((y as number) - centerY) / (size.height / 2) : ((x as number) - centerX) / (size.width / 2);
    return Math.max(-1, Math.min(1, raw));
  });
  const gardenBias = useTransform(signedBias, (v): number => (v < 0 ? 1 : 0));
  const workBias = useTransform(signedBias, (v): number => (v > 0 ? 1 : 0));
  const gardenReveal = useSpring(gardenBias, { stiffness: 95, damping: 20, mass: 0.7 });
  const workReveal = useSpring(workBias, { stiffness: 95, damping: 20, mass: 0.7 });

  useMotionValueEvent(signedBias, 'change', (value) => {
    if (committed || !introReady) return;
    const magnitude = Math.abs(value);
    const layer = magnitude >= COMMIT_THRESHOLD ? 4 : 0;
    if (layer > lastLayerRef.current) {
      pulse.set(1.16);
      flicker.set(1);
      window.setTimeout(() => pulse.set(1), 120);
      window.setTimeout(() => flicker.set(0), 80);
    }
    lastLayerRef.current = layer;

    const side: EntryChoice | null =
      magnitude >= COMMIT_THRESHOLD ? (value < 0 ? 'garden' : 'projects') : null;
    const now = performance.now();
    if (side !== sustainRef.current.side) {
      sustainRef.current = { side, since: now };
      if (commitTimerRef.current !== null) window.clearTimeout(commitTimerRef.current);
      if (side === null) {
        setCommittable(null);
      } else {
        commitTimerRef.current = window.setTimeout(() => {
          if (sustainRef.current.side === side) setCommittable(side);
        }, COMMIT_HOLD_MS);
      }
    }
    if (side && committable !== side && now - sustainRef.current.since >= COMMIT_HOLD_MS) {
      setCommittable(side);
    }
  });

  useEffect(() => {
    return () => {
      if (commitTimerRef.current !== null) window.clearTimeout(commitTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    const start = performance.now();
    const tick = () => {
      if (lastLayerRef.current === 0) {
        const phase = Math.sin(((performance.now() - start) / 2000) * Math.PI * 2);
        pulse.set(1 + phase * 0.04);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pulse, reducedMotion]);

  useEffect(() => {
    if (status !== 'show') return;
    const onMove = (event: MouseEvent) => {
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
    };
    const onTouch = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      cursorX.set(touch.clientX);
      cursorY.set(touch.clientY);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onTouch, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouch);
    };
  }, [cursorX, cursorY, status]);

  const commit = useCallback(
    (choice: EntryChoice) => {
      if (committed) return;
      persist(choice);
      setCommitted(choice);
      setCommitPoint({
        x: size.width ? (cursorX.get() / size.width) * 100 : choice === 'garden' ? 35 : 65,
        y: size.height ? (cursorY.get() / size.height) * 100 : 50,
      });
      const delay = reducedMotion ? 120 : choice === 'garden' ? 980 : 760;
      window.setTimeout(() => {
        if (choice === 'garden') {
          window.history.pushState(null, '', '/garden');
          setGardenEntered(true);
          return;
        }
        router.push('/projects');
      }, delay);
    },
    [committed, cursorX, cursorY, persist, reducedMotion, router, size.height, size.width]
  );

  useEffect(() => {
    if (status !== 'show') return;
    const onKey = (event: KeyboardEvent) => {
      if (committed) return;
      if (event.key === 'ArrowLeft' || (vertical && event.key === 'ArrowUp')) {
        event.preventDefault();
        focusedRef.current = 'garden';
        if (vertical) cursorY.set(centerY - 0.84 * (size.height / 2));
        else cursorX.set(centerX - 0.84 * (size.width / 2));
      } else if (event.key === 'ArrowRight' || (vertical && event.key === 'ArrowDown')) {
        event.preventDefault();
        focusedRef.current = 'projects';
        if (vertical) cursorY.set(centerY + 0.84 * (size.height / 2));
        else cursorX.set(centerX + 0.84 * (size.width / 2));
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        commit(committable ?? focusedRef.current);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [centerX, centerY, commit, committed, committable, cursorX, cursorY, size.height, size.width, status, vertical]);

  const chooseFromPointer = useCallback(
    (choice: EntryChoice) => {
      focusedRef.current = choice;
      const x = choice === 'garden' ? centerX - 0.84 * (size.width / 2) : centerX + 0.84 * (size.width / 2);
      const y = choice === 'garden' ? centerY - 0.84 * (size.height / 2) : centerY + 0.84 * (size.height / 2);
      if (vertical) cursorY.set(y);
      else cursorX.set(x);
      if (committable === choice || reducedMotion) commit(choice);
    },
    [centerX, centerY, commit, committable, cursorX, cursorY, reducedMotion, size.height, size.width, vertical]
  );

  const hint = useMemo(() => {
    if (!introReady) return 'choose your path';
    if (committable === 'garden') return 'click or press enter — the garden';
    if (committable === 'projects') return 'click or press enter — the work';
    return vertical ? 'drag up or down to choose' : 'move left or right to choose';
  }, [committable, introReady, vertical]);

  if (!mounted || status === 'pending') {
    return <div className="fixed inset-0 z-[60] bg-[#f5f1e6]" aria-hidden />;
  }

  if (gardenEntered) {
    return null;
  }

  if (reducedMotion) {
    return <ReducedSplash onChoose={commit} />;
  }

  return (
    <motion.div
      className="fixed inset-0 z-[60] select-none overflow-hidden"
      initial={false}
      animate={committed === 'garden' ? { opacity: [1, 0] } : { opacity: 1 }}
      transition={
        committed === 'garden'
          ? { duration: 0.92, ease: [0.65, 0, 0.35, 1] }
          : { duration: 0.82, ease: [0.65, 0, 0.35, 1] }
      }
      style={{
        backgroundImage:
          'radial-gradient(circle at 50% 42%, rgba(245,241,230,0.24), transparent 34%), repeating-linear-gradient(45deg, rgba(245,241,230,0.09) 0 1px, transparent 1px 4px)',
      }}
    >
      <span className="pointer-events-none absolute left-1/2 top-6 z-20 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-[#171c19]/45">
        JC · {new Date().getFullYear()}
      </span>

      <motion.div
        className="absolute inset-0"
        animate={committed === 'projects' ? { opacity: 0.35, x: vertical ? 0 : '-18%', y: vertical ? '-18%' : 0 } : { opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.45, ease: [0.65, 0, 0.35, 1] }}
      >
        <GardenSide
          bias={gardenReveal}
          introReady={introReady}
          vertical={vertical}
          committable={committable === 'garden'}
          entering={committed === 'garden'}
        />
      </motion.div>

      <motion.div
        className="absolute inset-0"
        animate={committed === 'garden' ? { opacity: 0.35, x: vertical ? 0 : '18%', y: vertical ? '18%' : 0 } : { opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.45, ease: [0.65, 0, 0.35, 1] }}
      >
        <WorkSide bias={workReveal} introReady={introReady} vertical={vertical} committable={committable === 'projects'} />
      </motion.div>

      {size.width > 0 && (
        <>
          <motion.div
            className="absolute inset-0 z-10"
            animate={
              committed
                ? {
                    opacity: 0,
                    x: vertical ? 0 : committed === 'garden' ? -size.width * 0.6 : size.width * 0.6,
                    y: vertical ? (committed === 'garden' ? -size.height * 0.6 : size.height * 0.6) : 0,
                  }
                : { opacity: 1, x: 0, y: 0 }
            }
            transition={{ duration: 0.35, ease: 'easeIn' }}
          >
            <BrassRig
              nodeX={nodeX}
              nodeY={nodeY}
              width={size.width}
              height={size.height}
              drawn={introReady}
              pulse={pulseSpring}
              flicker={flickerSpring}
              vertical={vertical}
            />
          </motion.div>
          <CursorRipples nodeX={nodeX} nodeY={nodeY} width={size.width} height={size.height} introReady={introReady} />
        </>
      )}

      <button
        type="button"
        aria-label="Enter the garden"
        onFocus={() => {
          focusedRef.current = 'garden';
        }}
        onClick={() => chooseFromPointer('garden')}
        className={`absolute z-20 opacity-0 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d2c22d] ${
          vertical ? 'inset-x-0 top-0 h-1/2' : 'inset-y-0 left-0 w-1/2'
        }`}
      >
        <span className="sr-only">Enter the garden</span>
      </button>
      <button
        type="button"
        aria-label="View the projects"
        onFocus={() => {
          focusedRef.current = 'projects';
        }}
        onClick={() => chooseFromPointer('projects')}
        className={`absolute z-20 opacity-0 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d2c22d] ${
          vertical ? 'inset-x-0 bottom-0 h-1/2' : 'inset-y-0 right-0 w-1/2'
        }`}
      >
        <span className="sr-only">View the projects</span>
      </button>

      <div className="pointer-events-none absolute inset-x-0 bottom-8 z-30 flex justify-center" aria-live="polite">
        <span className="rounded-full border border-[#171c19]/10 bg-[#f5f1e6]/70 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.26em] text-[#171c19]/55 backdrop-blur">
          {hint}
        </span>
      </div>

      <motion.div
        className="pointer-events-none absolute inset-0 z-40"
        initial={false}
        animate={
          committed === 'projects'
            ? {
                clipPath: `circle(200vmax at ${commitPoint.x}% ${commitPoint.y}%)`,
                opacity: 1,
              }
            : {
                clipPath: `circle(0vmax at ${commitPoint.x}% ${commitPoint.y}%)`,
                opacity: 0,
              }
        }
        transition={{ duration: 0.72, ease: [0.65, 0, 0.35, 1] }}
        style={{ backgroundColor: '#171c19' }}
      />
    </motion.div>
  );
}

function GardenSide({
  bias,
  introReady,
  vertical,
  committable,
  entering,
}: {
  bias: MotionValue<number>;
  introReady: boolean;
  vertical: boolean;
  committable: boolean;
  entering: boolean;
}) {
  const artOpacity = useTransform(bias, [0, 1], [0.28, 1], { clamp: true });
  const particlesOpacity = useTransform(bias, [0, 1], [0, 1], { clamp: true });
  const glyphOpacity = useTransform(bias, [0, 1], [0, 1], { clamp: true });
  const windowCoverOpacity = useTransform(bias, [0, 1], [1, 0], { clamp: true });

  const restingLayout = vertical
    ? { left: '0%', top: '0%', width: '100%', height: '50%' }
    : { left: '0%', top: '0%', width: '50%', height: '100%' };

  return (
    <motion.section
      className="absolute overflow-hidden"
      initial={restingLayout}
      animate={{
        ...(entering ? { left: '0%', top: '0%', width: '100%', height: '100%' } : restingLayout),
        opacity: 1,
      }}
      transition={{ duration: entering ? 0.58 : 0.55, ease: [0.65, 0, 0.35, 1] }}
      aria-hidden
    >
      <GardenWindowScrim vertical={vertical} windowCoverOpacity={windowCoverOpacity} />
      <ActualGardenWindow opacity={artOpacity} vertical={vertical} />
      <motion.div className="absolute inset-0" style={{ opacity: particlesOpacity }}>
        {[18, 34, 49, 63, 78].map((left, index) => (
          <motion.span
            key={left}
            className="absolute h-1 w-1 rounded-full bg-[#171c19]/35"
            style={{ left: `${left}%`, top: `${28 + (index % 3) * 14}%`, boxShadow: '0 0 8px rgba(210,194,45,0.35)' }}
            animate={{ y: [0, -14, 0], opacity: [0.35, 0.8, 0.35] }}
            transition={{ duration: 6 + index, delay: index * 0.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </motion.div>
      <motion.div
        className={`absolute flex items-center gap-4 ${vertical ? 'left-8 top-8' : 'left-[10%] top-[18%]'}`}
        style={{ opacity: glyphOpacity }}
      >
        <SumiGlyph glyph="garden" size={vertical ? 88 : 132} reducedMotion color="#171c19" />
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#171c19]/50">I</p>
          <motion.h2
            className="text-[30px] font-light leading-none tracking-tight text-[#171c19] md:text-[42px]"
            style={{
              fontFamily: 'var(--font-poppins), serif',
              textShadow: committable ? '0 0 16px rgba(210,194,45,0.75)' : 'none',
            }}
          >
            the garden
          </motion.h2>
          <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.28em] text-[#a82a1f]">enter →</span>
        </div>
        {committable && <HankoSeal reducedMotion />}
      </motion.div>
    </motion.section>
  );
}

function GardenWindowScrim({
  vertical,
  windowCoverOpacity,
}: {
  vertical: boolean;
  windowCoverOpacity: MotionValue<number>;
}) {
  const cutoutPath = vertical
    ? 'M0 0H100V100H0Z M10 20H90Q94 20 94 24V74Q94 78 90 78H10Q6 78 6 74V24Q6 20 10 20Z'
    : 'M0 0H100V100H0Z M13 29H83Q87 29 87 33V88Q87 92 83 92H13Q9 92 9 88V33Q9 29 13 29Z';
  const windowPath = vertical
    ? 'M10 20H90Q94 20 94 24V74Q94 78 90 78H10Q6 78 6 74V24Q6 20 10 20Z'
    : 'M13 29H83Q87 29 87 33V88Q87 92 83 92H13Q9 92 9 88V33Q9 29 13 29Z';

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path d={cutoutPath} fill="#f5f1e6" fillOpacity="0.98" fillRule="evenodd" />
      <path d={cutoutPath} fill="url(#garden-scrim-grain)" fillOpacity="0.06" fillRule="evenodd" />
      <motion.path d={windowPath} fill="#f5f1e6" style={{ opacity: windowCoverOpacity }} />
      <defs>
        <pattern id="garden-scrim-grain" width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M0 0H1V1H0Z" fill="#171c19" opacity="0.2" />
        </pattern>
      </defs>
    </svg>
  );
}

function WorkSide({
  bias,
  introReady,
  vertical,
  committable,
}: {
  bias: MotionValue<number>;
  introReady: boolean;
  vertical: boolean;
  committable: boolean;
}) {
  const gridOpacity = useTransform(bias, [0, 1], [0.22, 1], { clamp: true });
  const labelsOpacity = useTransform(bias, [0, 1], [0, 1], { clamp: true });
  const glyphOpacity = useTransform(bias, [0, 1], [0, 1], { clamp: true });

  return (
    <motion.section
      className={`absolute overflow-hidden bg-[#171c19] ${vertical ? 'inset-x-0 bottom-0 h-1/2' : 'inset-y-0 right-0 w-1/2'}`}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.55 }}
      aria-hidden
    >
      <motion.div
        className="absolute inset-0"
        style={{
          opacity: gridOpacity,
          backgroundImage:
            'linear-gradient(rgba(244,244,215,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(244,244,215,0.16) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'linear-gradient(to top, black 72%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 72%, transparent 100%)',
        }}
      />
      <EditorialWorkVisual opacity={gridOpacity} labelOpacity={labelsOpacity} vertical={vertical} />
      <motion.div
        className={`absolute flex items-center gap-4 ${vertical ? 'left-8 top-8' : 'left-[10%] top-[18%]'}`}
        style={{ opacity: glyphOpacity }}
      >
        <SumiGlyph glyph="work" size={vertical ? 88 : 132} reducedMotion color="#f4f4d7" />
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#f4f4d7]/50">II</p>
          <h2
            className="text-[30px] font-light leading-none tracking-tight text-[#f4f4d7] md:text-[42px]"
            style={{
              fontFamily: 'var(--font-poppins), serif',
              textShadow: committable ? '0 0 16px rgba(210,194,45,0.75)' : 'none',
            }}
          >
            the work
          </h2>
          <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.28em] text-[#d2c22d]">enter →</span>
        </div>
        {committable && <HankoSeal reducedMotion />}
      </motion.div>
    </motion.section>
  );
}

function CursorRipples({
  nodeX,
  nodeY,
  width,
  height,
  introReady,
}: {
  nodeX: MotionValue<number>;
  nodeY: MotionValue<number>;
  width: number;
  height: number;
  introReady: boolean;
}) {
  return (
    <motion.svg
      className="pointer-events-none absolute inset-0 z-[9]"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      initial={{ opacity: 0 }}
      animate={{ opacity: introReady ? 1 : 0 }}
      aria-hidden
    >
      {[0, 0.55, 1.1].map((delay) => (
        <motion.circle
          key={delay}
          cx={nodeX}
          cy={nodeY}
          r="56"
          fill="none"
          stroke="#a89878"
          strokeWidth="1"
          initial={{ scale: 0.55, opacity: 0 }}
          animate={{ scale: [0.55, 1.45], opacity: [0.36, 0] }}
          transition={{ duration: 1.8, delay, repeat: Infinity, ease: 'easeOut' }}
          style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
        />
      ))}
    </motion.svg>
  );
}

function ReducedSplash({ onChoose }: { onChoose: (choice: EntryChoice) => void }) {
  return (
    <div className="fixed inset-0 z-[60] grid grid-cols-1 bg-[#f5f1e6] md:grid-cols-2">
      <button
        type="button"
        onClick={() => onChoose('garden')}
        aria-label="Enter the garden"
        className="flex min-h-[50vh] flex-col items-center justify-center border-b border-[#171c19]/10 text-[#171c19] transition-colors hover:bg-[#ebe3cd] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d2c22d] md:border-b-0 md:border-r"
      >
        <SumiGlyph glyph="garden" size={120} reducedMotion color="#171c19" />
        <span className="mt-4 text-3xl font-light">the garden</span>
        <span className="mt-3 font-mono text-[10px] uppercase tracking-[0.28em] text-[#a82a1f]">enter →</span>
      </button>
      <button
        type="button"
        onClick={() => onChoose('projects')}
        aria-label="View the projects"
        className="flex min-h-[50vh] flex-col items-center justify-center bg-[#171c19] text-[#f4f4d7] transition-colors hover:bg-[#242b26] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d2c22d]"
      >
        <SumiGlyph glyph="work" size={120} reducedMotion color="#f4f4d7" />
        <span className="mt-4 text-3xl font-light">the work</span>
        <span className="mt-3 font-mono text-[10px] uppercase tracking-[0.28em] text-[#d2c22d]">enter →</span>
      </button>
    </div>
  );
}
