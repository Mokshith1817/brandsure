"use client";

import React, { useEffect, useState } from "react";
import { Project } from "@/data/projects";

interface RingPanelProps {
  project: Project;
  totalCount: number;
  currentIndex: number;
  onViewProject: (project: Project) => void;
}

export const RingPanel: React.FC<RingPanelProps> = React.memo(({
  project,
  totalCount,
  currentIndex,
  onViewProject,
}) => {
  const [animating, setAnimating] = useState(false);

  // Trigger staggered text transition on index change
  useEffect(() => {
    setAnimating(true);
    const timer = setTimeout(() => setAnimating(false), 50);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const indexPad = String(currentIndex + 1).padStart(2, "0");
  const countPad = String(totalCount).padStart(2, "0");

  return (
    <div
      aria-live="polite"
      className="ring-panel absolute bottom-0 left-0 z-10 flex flex-col justify-end pointer-events-none"
      style={{
        padding: "clamp(1.5rem, 4vw, 3.2rem)",
        width: "min(44ch, 45vw)",
        top: 0,
        background:
          "linear-gradient(90deg, #142139 0%, rgba(20, 33, 57, 0.92) 58%, rgba(20, 33, 57, 0.4) 82%, transparent 100%)",
      }}
    >
      {/* 1. Kicker / Counter */}
      <div className="overflow-hidden">
        <p
          className={`font-mono text-xs md:text-sm tracking-widest uppercase text-paper opacity-80 m-0 transition-all duration-500 transform ${
            animating ? "translate-y-full opacity-0" : "translate-y-0 opacity-80"
          }`}
          style={{ letterSpacing: "0.14em" }}
        >
          {indexPad} / {countPad} — {project.kicker}
        </p>
      </div>

      {/* 2. Main Title */}
      <div className="overflow-hidden mt-1">
        <h2
          className={`font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-paper leading-[0.96] overflow-wrap-break-word transition-all duration-500 delay-75 transform ${
            animating ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          {project.title}
        </h2>
      </div>

      {/* 3. Timeline & Category */}
      <div className="overflow-hidden mt-2">
        <p
          className={`font-mono text-xs md:text-sm tracking-widest uppercase text-paper opacity-75 m-0 transition-all duration-500 delay-100 transform ${
            animating ? "translate-y-full opacity-0" : "translate-y-0 opacity-75"
          }`}
          style={{ letterSpacing: "0.14em" }}
        >
          {project.timeline} — {project.category}
        </p>
      </div>

      {/* 4. Editorial Summary */}
      <div className="overflow-hidden mt-4">
        <p
          className={`font-editorial text-base md:text-xl lg:text-2xl text-paper leading-relaxed opacity-90 transition-all duration-500 delay-150 transform ${
            animating ? "translate-y-full opacity-0" : "translate-y-0 opacity-90"
          }`}
          style={{ lineHeight: 1.45 }}
        >
          {project.summary}
        </p>
      </div>

      {/* 5. Metrics Pills */}
      <div className="overflow-hidden mt-4">
        <div
          className={`flex flex-wrap gap-2 transition-all duration-500 delay-200 transform ${
            animating ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          {project.metrics.map((m, i) => (
            <div
              key={i}
              className="px-2.5 py-1 rounded bg-[#10192A]/80 border border-white/10 font-mono text-[11px] text-paper flex items-center gap-1.5"
            >
              <span className="opacity-60">{m.label}:</span>
              <span className="text-[#ED1C24] font-semibold">{m.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. View Project Action Button */}
      <div className="overflow-hidden mt-6">
        <button
          onClick={() => onViewProject(project)}
          className={`group font-mono text-xs md:text-sm tracking-widest uppercase inline-flex items-center gap-2 text-paper no-underline border-b border-paper pb-1 pointer-events-auto hover:text-[#ED1C24] hover:border-[#ED1C24] transition-colors duration-300 transform ${
            animating ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
          }`}
          style={{ letterSpacing: "0.14em" }}
        >
          <span>View project</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
          >
            <path d="M2 15.5C6.5 15.5 12 13.5 20.5 8" />
            <path d="M14.5 8.5 20.8 7.8 20.2 14" />
          </svg>
        </button>
      </div>
    </div>
  );
});

RingPanel.displayName = "RingPanel";
