"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    reducedMotion: false,
    highContrast: false,
    largeText: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);

    // Apply settings
    if (key === "reducedMotion") {
      document.documentElement.style.setProperty(
        "--animation-duration",
        newSettings.reducedMotion ? "0.01ms" : "1s"
      );
    }
    if (key === "highContrast") {
      document.documentElement.classList.toggle("high-contrast", newSettings.highContrast);
    }
    if (key === "largeText") {
      document.documentElement.classList.toggle("large-text", newSettings.largeText);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl text-primary-foreground shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Accessibility settings"
        data-cursor-hover
      >
        ♿
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-20 left-4 z-[9999] w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-card px-7 py-6 shadow-2xl"
          >
            <h3 className="mb-4 text-lg font-bold">Accessibility Settings</h3>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span>Reduce Motion</span>
                <input
                  type="checkbox"
                  checked={settings.reducedMotion}
                  onChange={() => toggleSetting("reducedMotion")}
                  className="h-5 w-5 rounded border-border"
                />
              </label>

              <label className="flex items-center justify-between">
                <span>High Contrast</span>
                <input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={() => toggleSetting("highContrast")}
                  className="h-5 w-5 rounded border-border"
                />
              </label>

              <label className="flex items-center justify-between">
                <span>Large Text</span>
                <input
                  type="checkbox"
                  checked={settings.largeText}
                  onChange={() => toggleSetting("largeText")}
                  className="h-5 w-5 rounded border-border"
                />
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}





