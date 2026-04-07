"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { unlockAchievement, type Achievement } from "@/lib/achievements";
import { AchievementToast } from "./achievement-toast";

export function AchievementsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentAchievement, setCurrentAchievement] =
    useState<Achievement | null>(null);
  const [visitedPages, setVisitedPages] = useState<Set<string>>(new Set());
  const pathname = usePathname();

  useEffect(() => {
    // First visit
    const achievement = unlockAchievement("first-visit");
    if (achievement) {
      setCurrentAchievement(achievement);
    }

    // Night owl (visited between midnight and 6am)
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 6) {
      const nightOwl = unlockAchievement("night-owl");
      if (nightOwl) {
        setTimeout(() => setCurrentAchievement(nightOwl), 1000);
      }
    }

    // Konami code listener
    let konamiCode = "";
    const konamiSequence = "ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba";

    const handleKeyDown = (e: KeyboardEvent) => {
      konamiCode += e.key;
      if (konamiCode.length > konamiSequence.length) {
        konamiCode = konamiCode.slice(-konamiSequence.length);
      }
      if (konamiCode === konamiSequence) {
        const achievement = unlockAchievement("konami-code");
        if (achievement) {
          setCurrentAchievement(achievement);
          // Add cool effect
          document.body.style.animation = "spin 1s ease-in-out";
          setTimeout(() => {
            document.body.style.animation = "";
          }, 1000);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    // Track visited pages
    const newVisitedPages = new Set(visitedPages);
    newVisitedPages.add(pathname);
    setVisitedPages(newVisitedPages);

    // Check for explorer achievement (visited all pages)
    const mainPages = ["/", "/projects", "/about", "/contact"];
    const allVisited = mainPages.every((page) => newVisitedPages.has(page));
    if (allVisited) {
      const achievement = unlockAchievement("explorer");
      if (achievement) {
        setCurrentAchievement(achievement);
      }
    }
  }, [pathname]);

  return (
    <>
      {children}
      <AchievementToast
        achievement={currentAchievement}
        onClose={() => setCurrentAchievement(null)}
      />
    </>
  );
}





