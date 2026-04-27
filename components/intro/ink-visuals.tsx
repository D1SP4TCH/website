'use client';

import { motion, type MotionValue } from 'framer-motion';

export function InkGardenVisual({
  opacity,
  vertical,
}: {
  opacity: MotionValue<number>;
  vertical: boolean;
}) {
  const fireflies = [
    { cx: 185, cy: 240, delay: 0 },
    { cx: 262, cy: 184, delay: 0.7 },
    { cx: 496, cy: 218, delay: 1.1 },
    { cx: 570, cy: 302, delay: 0.35 },
    { cx: 404, cy: 152, delay: 1.6 },
  ];

  return (
    <motion.svg
      className={`absolute ${vertical ? 'left-1/2 top-[49%] h-[58%] w-[94%] -translate-x-1/2 -translate-y-1/2' : 'bottom-[7%] left-[7%] h-[68%] w-[84%]'}`}
      viewBox="0 0 760 520"
      preserveAspectRatio="xMidYMid meet"
      style={{ opacity }}
      aria-hidden
    >
      <defs>
        <clipPath id="garden-portal-clip">
          <path d="M132 425 V162 C132 121 163 91 204 91 H556 C597 91 628 121 628 162 V425 Z" />
        </clipPath>
        <filter id="garden-portal-soft" x="-18%" y="-18%" width="136%" height="136%">
          <feDropShadow dx="0" dy="24" stdDeviation="22" floodColor="#171c19" floodOpacity="0.18" />
        </filter>
        <filter id="garden-portal-wobble" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="52" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.9" />
        </filter>
        <linearGradient id="garden-portal-brass" x1="0" x2="1">
          <stop offset="0%" stopColor="#9c8f3d" />
          <stop offset="42%" stopColor="#d2c22d" />
          <stop offset="100%" stopColor="#b4a84b" />
        </linearGradient>
        <linearGradient id="garden-portal-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2f3731" />
          <stop offset="46%" stopColor="#222a25" />
          <stop offset="100%" stopColor="#111713" />
        </linearGradient>
        <radialGradient id="garden-portal-glow" cx="52%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#d2c22d" stopOpacity="0.22" />
          <stop offset="48%" stopColor="#758a7b" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#2f3731" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="garden-ground" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#758a7b" stopOpacity="0.64" />
          <stop offset="100%" stopColor="#2f3731" stopOpacity="0.98" />
        </linearGradient>
      </defs>

      <path
        d="M94 111 C224 89 533 88 666 112 C687 116 696 132 693 154 C676 266 678 346 694 430 C698 451 681 465 657 461 C489 442 271 444 103 461 C80 464 63 450 67 429 C84 315 83 237 67 153 C63 132 73 116 94 111 Z"
        fill="#f5f1e6"
        opacity="0.42"
      />

      <g filter="url(#garden-portal-soft)">
        <g clipPath="url(#garden-portal-clip)">
          <rect x="132" y="91" width="496" height="334" fill="url(#garden-portal-sky)" />
          <rect x="132" y="91" width="496" height="334" fill="url(#garden-portal-glow)" />

          <path
            d="M90 350 C178 309 261 310 332 338 C420 371 500 331 676 354 V453 H90 Z"
            fill="#151d18"
            opacity="0.8"
          />
          <path
            d="M110 381 C230 337 307 359 382 388 C463 420 538 380 664 392 V453 H110 Z"
            fill="url(#garden-ground)"
            opacity="0.9"
          />

          <g filter="url(#garden-portal-wobble)">
            <path
              d="M182 378 C172 323 190 277 230 245 C215 220 228 191 260 188 C267 149 304 126 340 142 C367 113 416 117 440 150 C480 145 512 174 509 213 C547 232 552 282 516 306 C512 353 464 383 421 363 C384 394 331 384 307 345 C264 373 219 383 182 378 Z"
              fill="#5e6e63"
              opacity="0.58"
            />
            <path
              d="M438 365 C427 321 439 282 469 255 C458 226 477 200 508 203 C520 169 558 154 587 177 C618 159 660 178 663 215 C700 236 697 285 659 303 C655 344 611 371 574 353 C539 379 483 386 438 365 Z"
              fill="#758a7b"
              opacity="0.52"
            />
            <path
              d="M128 421 C175 371 231 350 292 360 C240 386 206 411 181 453 H128 Z"
              fill="#2f3731"
              opacity="0.82"
            />
            <path
              d="M632 424 C593 377 544 354 487 361 C536 386 574 418 600 453 H632 Z"
              fill="#2f3731"
              opacity="0.82"
            />
          </g>

          <g stroke="#d2c22d" strokeLinecap="round" opacity="0.42">
            <path d="M205 420 C271 395 465 395 550 420" strokeWidth="1.1" fill="none" />
            <path d="M246 401 C309 382 439 382 508 402" strokeWidth="0.9" fill="none" />
          </g>

          {fireflies.map((fly) => (
            <motion.circle
              key={`${fly.cx}-${fly.cy}`}
              cx={fly.cx}
              cy={fly.cy}
              r="2.3"
              fill="#d2c22d"
              initial={{ opacity: 0.28, y: 0 }}
              animate={{ opacity: [0.22, 0.9, 0.28], y: [0, -8, 0] }}
              transition={{ duration: 4.5, delay: fly.delay, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </g>

        <path
          d="M132 425 V162 C132 121 163 91 204 91 H556 C597 91 628 121 628 162 V425"
          stroke="url(#garden-portal-brass)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter="url(#garden-portal-wobble)"
        />
        <path
          d="M158 421 V171 C158 143 178 121 207 121 H553 C582 121 602 143 602 171 V421"
          stroke="#d2c22d"
          strokeOpacity="0.35"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      <g opacity="0.9">
        <ellipse cx="380" cy="455" rx="54" ry="15" fill="#2f3731" opacity="0.82" />
        <ellipse cx="302" cy="469" rx="35" ry="10" fill="#758a7b" opacity="0.58" />
        <ellipse cx="458" cy="469" rx="35" ry="10" fill="#758a7b" opacity="0.58" />
      </g>

      <g fontFamily="var(--font-geist-mono), monospace" fontSize="10" fill="#171c19" opacity="0.38">
        <text x="143" y="76">garden.preview()</text>
        <text x="482" y="452">enter_world()</text>
      </g>
    </motion.svg>
  );
}

export function EditorialWorkVisual({
  opacity,
  labelOpacity,
  vertical,
}: {
  opacity: MotionValue<number>;
  labelOpacity: MotionValue<number>;
  vertical: boolean;
}) {
  const cards = [
    { x: 86, y: 95, w: 180, h: 246, r: -4, title: 'VEVEY', accent: '#d2c22d' },
    { x: 258, y: 67, w: 205, h: 278, r: 3, title: 'HOLLOW', accent: '#758a7b' },
    { x: 455, y: 126, w: 178, h: 238, r: -2, title: 'PORTFOLIO', accent: '#b4a84b' },
  ];

  return (
    <motion.svg
      className={`absolute ${vertical ? 'bottom-4 left-1/2 h-[50%] w-[96%] -translate-x-1/2' : 'bottom-[8%] left-[6%] h-[64%] w-[88%]'}`}
      viewBox="0 0 720 470"
      preserveAspectRatio="xMidYMid meet"
      style={{ opacity }}
      aria-hidden
    >
      <defs>
        <filter id="work-paper-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="16" stdDeviation="16" floodColor="#000" floodOpacity="0.32" />
        </filter>
        <filter id="work-paper-edge" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="12" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.1" />
        </filter>
        <linearGradient id="work-card-wash" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#fffbe8" />
          <stop offset="54%" stopColor="#f4f4d7" />
          <stop offset="100%" stopColor="#dfd6ad" />
        </linearGradient>
      </defs>

      <g opacity="0.38" stroke="#f4f4d7" strokeWidth="0.7">
        {Array.from({ length: 11 }).map((_, index) => (
          <path key={`v-${index}`} d={`M${90 + index * 54} 34 L${90 + index * 54} 438`} opacity={index % 3 === 0 ? 0.42 : 0.18} />
        ))}
        {Array.from({ length: 7 }).map((_, index) => (
          <path key={`h-${index}`} d={`M52 ${70 + index * 55} L668 ${70 + index * 55}`} opacity={index % 2 === 0 ? 0.36 : 0.16} />
        ))}
      </g>

      {cards.map((card, index) => (
        <motion.g
          key={card.title}
          transform={`translate(${card.x} ${card.y}) rotate(${card.r} ${card.w / 2} ${card.h / 2})`}
          filter="url(#work-paper-shadow)"
          initial={{ y: 22, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.08 * index, ease: [0.22, 1, 0.36, 1] }}
        >
          <path
            d={`M12 0 H${card.w - 8} C${card.w - 1} 0 ${card.w + 1} 8 ${card.w - 1} 16 V${card.h - 12} C${card.w - 2} ${card.h - 2} ${card.w - 12} ${card.h + 1} ${card.w - 22} ${card.h} H14 C4 ${card.h} 0 ${card.h - 8} 1 ${card.h - 18} V16 C1 6 4 1 12 0 Z`}
            fill="url(#work-card-wash)"
            filter="url(#work-paper-edge)"
          />
          <path
            d={`M22 28 H${card.w - 22} M22 54 H${card.w - 54} M22 ${card.h - 42} H${card.w - 22}`}
            stroke="#171c19"
            strokeOpacity="0.2"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <path
            d={`M26 82 C58 65 94 68 119 93 C143 117 157 117 ${card.w - 28} 90 V${card.h - 78} H26 Z`}
            fill={card.accent}
            opacity="0.18"
          />
          <path
            d={`M30 ${card.h - 102} C70 ${card.h - 140} 111 ${card.h - 126} ${card.w - 30} ${card.h - 162}`}
            stroke={card.accent}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.72"
          />
          <motion.text
            x="24"
            y={card.h - 20}
            fill="#171c19"
            fontFamily="var(--font-geist-mono), monospace"
            fontSize="11"
            letterSpacing="3"
            style={{ opacity: labelOpacity }}
          >
            {card.title}
          </motion.text>
        </motion.g>
      ))}
    </motion.svg>
  );
}
