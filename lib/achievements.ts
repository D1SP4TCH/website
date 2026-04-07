export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

const ACHIEVEMENTS_KEY = "portfolio-achievements";

export const achievements: Achievement[] = [
  {
    id: "first-visit",
    title: "Welcome!",
    description: "Visited the portfolio for the first time",
    icon: "👋",
    unlocked: false,
  },
  {
    id: "explorer",
    title: "Explorer",
    description: "Visited all pages",
    icon: "🗺️",
    unlocked: false,
  },
  {
    id: "curious",
    title: "Curious Mind",
    description: "Viewed 3 or more projects",
    icon: "🔍",
    unlocked: false,
  },
  {
    id: "konami-code",
    title: "Secret Code Master",
    description: "Entered the Konami code",
    icon: "🎮",
    unlocked: false,
  },
  {
    id: "speed-reader",
    title: "Speed Reader",
    description: "Scrolled through the entire site in under 2 minutes",
    icon: "⚡",
    unlocked: false,
  },
  {
    id: "night-owl",
    title: "Night Owl",
    description: "Visited between midnight and 6am",
    icon: "🦉",
    unlocked: false,
  },
];

export function getAchievements(): Achievement[] {
  if (typeof window === "undefined") return achievements;
  
  const stored = localStorage.getItem(ACHIEVEMENTS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return achievements;
}

export function unlockAchievement(id: string): Achievement | null {
  if (typeof window === "undefined") return null;
  
  const current = getAchievements();
  const achievement = current.find((a) => a.id === id);
  
  if (achievement && !achievement.unlocked) {
    achievement.unlocked = true;
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(current));
    return achievement;
  }
  
  return null;
}

export function resetAchievements(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACHIEVEMENTS_KEY);
}





