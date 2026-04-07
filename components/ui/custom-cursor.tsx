"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    if (!isDesktop) return;

    const updateCursor = (e: MouseEvent) => {
      if (cursorRef.current && cursorDotRef.current) {
        const x = e.clientX;
        const y = e.clientY;

        cursorRef.current.style.transform = `translate(${x}px, ${y}px)`;
        cursorDotRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);
    const handleCursorLeave = () => setIsHidden(true);
    const handleCursorEnter = () => setIsHidden(false);

    // Add hover effect to interactive elements
    const interactiveElements = document.querySelectorAll(
      'a, button, [role="button"], input, textarea, select, [data-cursor-hover]'
    );

    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    document.addEventListener("mousemove", updateCursor);
    document.addEventListener("mouseleave", handleCursorLeave);
    document.addEventListener("mouseenter", handleCursorEnter);

    return () => {
      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
      document.removeEventListener("mousemove", updateCursor);
      document.removeEventListener("mouseleave", handleCursorLeave);
      document.removeEventListener("mouseenter", handleCursorEnter);
    };
  }, [isDesktop]);

  if (!isDesktop) return null;

  return (
    <>
      <motion.div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] mix-blend-difference"
        initial={{ opacity: 0 }}
        animate={{
          opacity: isHidden ? 0 : 1,
          scale: isHovering ? 1.5 : 1,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div className="relative -left-5 -top-5 h-10 w-10 rounded-full border border-white/50" />
      </motion.div>
      <motion.div
        ref={cursorDotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] mix-blend-difference"
        initial={{ opacity: 0 }}
        animate={{
          opacity: isHidden ? 0 : 1,
          scale: isHovering ? 0 : 1,
        }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        <div className="relative -left-1 -top-1 h-2 w-2 rounded-full bg-white" />
      </motion.div>
    </>
  );
}





