"use client";

import React from "react";
import { Project } from "@/data/projects";

interface RingFallbackProps {
  projects: Project[];
  focusedIndex: number;
  onCardClick: (index: number) => void;
}

export const RingFallback: React.FC<RingFallbackProps> = ({
  projects,
  focusedIndex,
  onCardClick,
}) => {
  const count = projects.length;

  return (
    <div
      aria-hidden="true"
      className="ring-fallback absolute inset-0 grid place-items-center overflow-hidden pointer-events-none"
      style={{ perspective: "1400px" }}
    >
      <div
        style={{
          position: "relative",
          transformStyle: "preserve-3d",
          width: 0,
          height: 0,
        }}
      >
        {projects.map((item, idx) => {
          let r = idx - focusedIndex;
          const half = count / 2;
          if (r > half) r -= count;
          if (r < -half) r += count;
          const s = Math.abs(r);

          // Only render nearby plates for performance
          if (s > 4) return null;

          return (
            <div
              key={item.id}
              onClick={() => onCardClick(idx)}
              className="ring-fallback-plate pointer-events-auto cursor-pointer"
              style={{
                position: "absolute",
                aspectRatio: "3 / 4",
                width: "min(38vw, 320px)",
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%) translateX(${62 * r}%) translateZ(${-(180 * s)}px) rotateY(${-22 * r}deg)`,
                filter: `saturate(${Math.max(0, 1 - 0.28 * s)}) brightness(${Math.max(0.45, 1 - 0.2 * s)})`,
                border: "1px solid rgba(243, 239, 229, 0.4)",
                backgroundColor: item.bg,
                color: item.fg,
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
                transition: "transform 0.4s ease, filter 0.4s ease",
              }}
            >
              <div>
                <div className="flex justify-between font-mono text-xs text-red-500 uppercase">
                  <span>{item.badge}</span>
                  <span>{item.category}</span>
                </div>
                <h3 className="font-display text-2xl font-bold uppercase mt-4">
                  {item.title}
                </h3>
              </div>
              <div className="font-mono text-xs opacity-70">
                <p>{item.timeline}</p>
                <p className="mt-1">{item.stack.slice(0, 3).join(" • ")}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
