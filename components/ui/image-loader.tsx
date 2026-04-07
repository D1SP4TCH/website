"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ImageLoaderProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
}

export function ImageLoader({
  src,
  alt,
  className = "",
  aspectRatio = "aspect-video",
}: ImageLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", aspectRatio, className)}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 animate-pulse" />
      )}
      <motion.img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
      />
    </div>
  );
}





