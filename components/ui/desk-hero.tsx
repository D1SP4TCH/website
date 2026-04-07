"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { unlockAchievement } from "@/lib/achievements";

export function DeskHero() {
  const router = useRouter();
  const [monitorState, setMonitorState] = useState<"idle" | "booting" | "ready">("idle");
  const [lampOn, setLampOn] = useState(false);
  const [coffeeLevel, setCoffeeLevel] = useState(3);
  const [notepadOpen, setNotepadOpen] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [clickedItems, setClickedItems] = useState<Set<string>>(new Set());

  const trackInteraction = (item: string) => {
    const newClicked = new Set(clickedItems);
    newClicked.add(item);
    setClickedItems(newClicked);
    
    if (newClicked.size >= 5) {
      unlockAchievement("curious");
    }
  };

  const handleMonitorClick = () => {
    trackInteraction("monitor");
    if (monitorState === "idle") {
      setMonitorState("booting");
      setTimeout(() => setMonitorState("ready"), 2000);
    } else if (monitorState === "ready") {
      router.push("/projects");
    }
  };

  const handleCoffeeClick = () => {
    trackInteraction("coffee");
    if (coffeeLevel > 0) {
      setCoffeeLevel(coffeeLevel - 1);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f1419]">
      {/* Window/Background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="absolute inset-0"
      >
        {/* Stars/particles outside window */}
        <div className="absolute right-0 top-0 h-1/2 w-1/3 opacity-30">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Main Desk Scene */}
      <div className="container relative mx-auto flex h-screen items-center justify-center px-6">
        <div className="relative w-full max-w-6xl">
          {/* Desk Surface */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative"
          >
            {/* Monitor - Center */}
            <motion.div
              className="relative mx-auto mb-8 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={handleMonitorClick}
              data-cursor-hover
            >
              <div className="relative mx-auto w-full max-w-4xl">
                {/* Monitor frame */}
                <div className="rounded-2xl border-8 border-gray-800 bg-gray-900 p-4 shadow-2xl">
                  {/* Screen */}
                  <div className="aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-gray-900 to-black">
                    <AnimatePresence mode="wait">
                      {monitorState === "idle" && (
                        <motion.div
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex h-full items-center justify-center"
                        >
                          <div className="text-center">
                            <div className="mb-4 text-6xl">💻</div>
                            <p className="font-mono text-green-400">
                              &gt; Click to boot system_
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {monitorState === "booting" && (
                        <motion.div
                          key="booting"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="p-8 font-mono text-sm text-green-400"
                        >
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ staggerChildren: 0.1 }}
                          >
                            {[
                              "Initializing portfolio.sys...",
                              "Loading creative_mode.dll...",
                              "Mounting /projects drive...",
                              "Starting design_engine...",
                              "System ready!",
                            ].map((line, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.3 }}
                              >
                                &gt; {line}
                              </motion.div>
                            ))}
                          </motion.div>
                        </motion.div>
                      )}

                      {monitorState === "ready" && (
                        <motion.div
                          key="ready"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 p-8"
                        >
                          <motion.h1
                            className="mb-4 text-center text-4xl font-bold md:text-6xl"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            Welcome! 👋
                          </motion.h1>
                          <p className="mb-6 text-center text-xl text-muted-foreground">
                            Click again to explore my work
                          </p>
                          <div className="flex gap-2">
                            {[1, 2, 3].map((i) => (
                              <motion.div
                                key={i}
                                className="h-3 w-3 rounded-full bg-primary"
                                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  delay: i * 0.2,
                                }}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                {/* Monitor stand */}
                <div className="mx-auto mt-2 h-8 w-32 bg-gray-700"></div>
                <div className="mx-auto h-4 w-48 rounded-b-lg bg-gray-800"></div>
              </div>
            </motion.div>

            {/* Desk Items Row */}
            <div className="flex items-end justify-between gap-4">
              {/* Left Side - Lamp */}
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex-shrink-0 cursor-pointer"
                onClick={() => {
                  setLampOn(!lampOn);
                  trackInteraction("lamp");
                }}
                whileHover={{ scale: 1.05 }}
                data-cursor-hover
              >
                <div className="relative">
                  {lampOn && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.3 }}
                      className="absolute -inset-20 rounded-full bg-yellow-400 blur-3xl"
                    />
                  )}
                  <div className="relative text-6xl md:text-8xl">
                    {lampOn ? "💡" : "🔦"}
                  </div>
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    Lamp
                  </p>
                </div>
              </motion.div>

              {/* Keyboard */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex-shrink cursor-pointer"
                whileHover={{ y: -5 }}
                onClick={() => {
                  trackInteraction("keyboard");
                  router.push("/about");
                }}
                data-cursor-hover
              >
                <div className="rounded-lg border-4 border-gray-700 bg-gray-800 p-4">
                  <div className="grid grid-cols-12 gap-1">
                    {[...Array(36)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="aspect-square rounded bg-gray-600"
                        whileHover={{ y: -2, backgroundColor: "#3b82f6" }}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  About Me
                </p>
              </motion.div>

              {/* Coffee Cup */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex-shrink-0 cursor-pointer"
                onClick={handleCoffeeClick}
                whileHover={{ rotate: [-5, 5, -5, 0] }}
                data-cursor-hover
              >
                <div className="relative">
                  <div className="text-6xl md:text-8xl">
                    {coffeeLevel > 2 ? "☕" : coffeeLevel > 0 ? "🥤" : "🪫"}
                  </div>
                  <motion.div
                    className="absolute -right-2 -top-2 text-2xl"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {coffeeLevel > 0 && "💨"}
                  </motion.div>
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    Fuel: {coffeeLevel}/3
                  </p>
                </div>
              </motion.div>

              {/* Notepad */}
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex-shrink-0 cursor-pointer"
                onClick={() => {
                  setNotepadOpen(!notepadOpen);
                  trackInteraction("notepad");
                }}
                whileHover={{ rotate: 5 }}
                data-cursor-hover
              >
                <div className="relative text-6xl md:text-8xl">
                  📔
                  {notepadOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute -top-32 right-0 w-48 rounded-lg border border-border bg-card p-4 text-sm font-handwriting shadow-2xl"
                    >
                      <p className="mb-2 font-bold">Quick Notes:</p>
                      <ul className="space-y-1 text-xs">
                        <li>✓ Build amazing things</li>
                        <li>✓ Stay curious</li>
                        <li>✓ Have fun!</li>
                        <li className="cursor-pointer text-primary hover:underline" onClick={(e) => {
                          e.stopPropagation();
                          router.push("/contact");
                        }}>
                          → Let's connect!
                        </li>
                      </ul>
                    </motion.div>
                  )}
                </div>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Notes
                </p>
              </motion.div>

              {/* Game Controller */}
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="flex-shrink-0 cursor-pointer"
                onClick={() => {
                  trackInteraction("controller");
                  router.push("/projects");
                }}
                whileHover={{ rotate: [0, -10, 10, 0] }}
                data-cursor-hover
              >
                <div className="text-6xl md:text-8xl">🎮</div>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Projects
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Floating Instructions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="mt-12 text-center"
          >
            <p className="font-mono text-sm text-muted-foreground">
              🖱️ Click around and explore my workspace...
            </p>
          </motion.div>

          {/* Time Display */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="absolute right-4 top-4 font-mono text-sm text-muted-foreground"
          >
            {time}
          </motion.div>
        </div>
      </div>
    </div>
  );
}





