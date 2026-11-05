"use client";

import React, { useEffect, useState } from "react";

interface IntroLoaderProps {
  onComplete?: () => void;
}

export const IntroLoader: React.FC<IntroLoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Check session storage so return visits are faster
    try {
      const seen = sessionStorage.getItem("portfolio_loader_seen");
      if (seen) {
        setHidden(true);
        onComplete?.();
        return;
      }
    } catch {
      // ignore
    }

    // Number counting ticker
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 8) + 4;
      if (current >= 100) {
        current = 100;
        setProgress(100);
        clearInterval(interval);

        setTimeout(() => {
          setExiting(true);
          try {
            sessionStorage.setItem("portfolio_loader_seen", "1");
          } catch {
            // ignore
          }
          setTimeout(() => {
            setHidden(true);
            onComplete?.();
          }, 900);
        }, 300);
      } else {
        setProgress(current);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  if (hidden) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-50 pointer-events-none overflow-hidden select-none"
    >
      {/* 6 Vertical wiping columns */}
      <div className="absolute inset-0 flex">
        {[0, 1, 2, 3, 4, 5].map((col) => (
          <div
            key={col}
            className={`flex-1 bg-[#142139] transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] ${
              exiting ? "-translate-y-full" : "translate-y-0"
            }`}
            style={{
              transitionDelay: `${col * 55}ms`,
            }}
          />
        ))}
      </div>

      {/* Central Monogram Logo during load */}
      <div
        className={`absolute inset-0 grid place-items-center transition-opacity duration-300 ${
          exiting ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-sm bg-[#ED1C24] flex items-center justify-center text-paper font-mono font-bold text-3xl shadow-2xl">
            <span>W</span>
          </div>
          <span className="font-display text-2xl font-bold tracking-widest text-paper uppercase">
            MOKSHITH // PORTFOLIO
          </span>
        </div>
      </div>

      {/* Bottom Counter & Culture Tagline */}
      <div
        className={`absolute left-4 md:left-12 right-4 md:right-12 bottom-6 md:bottom-10 flex justify-between items-end text-[#ED1C24] font-mono transition-opacity duration-300 ${
          exiting ? "opacity-0" : "opacity-100"
        }`}
      >
        <span className="text-4xl md:text-6xl font-bold tabular-nums leading-none">
          {String(progress).padStart(2, "0")}
        </span>
        <span className="text-[10px] md:text-xs tracking-[0.2em] uppercase opacity-80 pb-1">
          INDEPENDENT BUILDER CULTURE — SELECTED WORKS 2024–2026
        </span>
      </div>
    </div>
  );
};
