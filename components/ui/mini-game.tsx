"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Position {
  x: number;
  y: number;
}

export function MiniGame() {
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 50, y: 80 });
  const [targets, setTargets] = useState<Position[]>([]);
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameActive) return;

    const interval = setInterval(() => {
      setTargets((prev) => [
        ...prev.filter((t) => t.y < 100),
        {
          x: Math.random() * 90 + 5,
          y: 0,
        },
      ]);
    }, 1500);

    const moveInterval = setInterval(() => {
      setTargets((prev) =>
        prev.map((t) => ({
          ...t,
          y: t.y + 2,
        }))
      );
    }, 50);

    return () => {
      clearInterval(interval);
      clearInterval(moveInterval);
    };
  }, [gameActive]);

  useEffect(() => {
    if (!gameActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      setPlayerPos((prev) => {
        if (e.key === "ArrowLeft") {
          return { ...prev, x: Math.max(0, prev.x - 5) };
        }
        if (e.key === "ArrowRight") {
          return { ...prev, x: Math.min(90, prev.x + 5) };
        }
        return prev;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameActive]);

  useEffect(() => {
    if (!gameActive) return;

    targets.forEach((target, index) => {
      const distance = Math.sqrt(
        Math.pow(target.x - playerPos.x, 2) + Math.pow(target.y - playerPos.y, 2)
      );
      if (distance < 8) {
        setScore((s) => s + 1);
        setTargets((prev) => prev.filter((_, i) => i !== index));
      }
    });
  }, [targets, playerPos, gameActive]);

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setTargets([]);
    setPlayerPos({ x: 50, y: 80 });
  };

  const endGame = () => {
    setGameActive(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-auto max-w-2xl"
    >
      <div className="overflow-hidden rounded-3xl border border-border bg-card p-8">
        <h3 className="mb-4 text-2xl font-bold">Mini Game: Catch the Stars</h3>
        <p className="mb-6 text-muted-foreground">
          Use arrow keys to move left and right. Catch the falling stars!
        </p>

        <div className="mb-4 flex items-center justify-between">
          <div className="text-lg font-semibold">Score: {score}</div>
          {!gameActive ? (
            <button
              onClick={startGame}
              className="rounded-full bg-primary px-6 py-2 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              data-cursor-hover
            >
              Start Game
            </button>
          ) : (
            <button
              onClick={endGame}
              className="rounded-full border border-border px-6 py-2 font-semibold transition-colors hover:bg-muted"
              data-cursor-hover
            >
              End Game
            </button>
          )}
        </div>

        <div
          ref={gameRef}
          className="relative h-96 overflow-hidden rounded-2xl bg-gradient-to-b from-primary/10 to-secondary/10"
        >
          {gameActive && (
            <>
              {/* Player */}
              <motion.div
                className="absolute h-8 w-8 text-2xl"
                style={{ left: `${playerPos.x}%`, top: `${playerPos.y}%` }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                🚀
              </motion.div>

              {/* Targets */}
              {targets.map((target, index) => (
                <motion.div
                  key={index}
                  className="absolute text-2xl"
                  style={{ left: `${target.x}%`, top: `${target.y}%` }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ duration: 0.3 }}
                >
                  ⭐
                </motion.div>
              ))}
            </>
          )}

          {!gameActive && (
            <div className="flex h-full items-center justify-center text-6xl opacity-20">
              🎮
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}





