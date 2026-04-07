"use client";

import { motion } from "framer-motion";

export function MorphingBlob() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden opacity-50">
      <svg
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        width="800"
        height="800"
        viewBox="0 0 800 800"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
            <stop offset="50%" stopColor="rgb(139, 92, 246)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(6, 182, 212)" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <motion.path
          fill="url(#gradient)"
          initial={{
            d: "M400,100 Q600,200 700,400 T400,700 Q200,600 100,400 T400,100",
          }}
          animate={{
            d: [
              "M400,100 Q600,200 700,400 T400,700 Q200,600 100,400 T400,100",
              "M400,150 Q550,250 650,400 T400,650 Q250,550 150,400 T400,150",
              "M400,120 Q580,220 680,400 T400,680 Q220,580 120,400 T400,120",
              "M400,100 Q600,200 700,400 T400,700 Q200,600 100,400 T400,100",
            ],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>
    </div>
  );
}





