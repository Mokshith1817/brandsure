"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { PROJECTS, Project } from "@/data/projects";
import { RingCanvas } from "@/components/RingCanvas";
import { RingFallback } from "@/components/RingFallback";
import { RingPanel } from "@/components/RingPanel";
import { Header } from "@/components/Header";
import { CustomCursor } from "@/components/CustomCursor";
import { IntroLoader } from "@/components/IntroLoader";
import { ProjectModal } from "@/components/ProjectModal";
import { AboutModal } from "@/components/AboutModal";

export default function EventsPortfolioPage() {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [isInside, setIsInside] = useState(false);

  // Check WebGL availability once
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");
      if (!gl) {
        setUseFallback(true);
      }
    } catch {
      setUseFallback(true);
    }
  }, []);

  const handleFocusChange = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

  const handleCardClick = useCallback((index: number) => {
    setFocusedIndex(index);
    setSelectedProject(PROJECTS[index]);
  }, []);

  const handleHoverCard = useCallback((index: number | null) => {
    setHoveredCard(index);
  }, []);

  const currentProject = PROJECTS[focusedIndex] || PROJECTS[0];

  // Cursor state: when inside, always show "OPEN" in the center ring, or when hovering cards
  const cursorLabel = useMemo(() => {
    if (isInside) {
      return hoveredCard !== null ? "OPEN" : "EXPLORE";
    }
    if (hoveredCard === null) return null;
    return hoveredCard === focusedIndex ? "OPEN" : "DRAG";
  }, [hoveredCard, focusedIndex, isInside]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#142139] text-paper select-none">
      {/* Noise Grain Texture */}
      <div className="grain-overlay" />

      {/* Intro 6-Column Loader */}
      <IntroLoader />

      {/* Top Navigation Header */}
      <Header
        onOpenAbout={() => setAboutOpen(true)}
        onOpenContact={() => setAboutOpen(true)}
      />

      {/* Top Right "DRAG OR SCROLL" Indicator */}
      <div
        className="fixed top-0 right-0 z-30 font-mono text-xs tracking-widest uppercase text-paper opacity-70 pointer-events-none flex items-center gap-2"
        style={{
          padding:
            "calc(clamp(1rem, 2.2vw, 1.8rem) + 3.8rem) clamp(1.25rem, 4vw, 3rem) 0",
          letterSpacing: "0.14em",
        }}
      >
        <span>Drag or scroll</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3.5 h-3.5 inline-block text-[#ED1C24]"
        >
          <path d="M2 15.5C6.5 15.5 12 13.5 20.5 8" />
          <path d="M14.5 8.5 20.8 7.8 20.2 14" />
        </svg>
      </div>

      {/* Main 3D Cylinder Ring or CSS Fallback */}
      <div className="relative w-full h-full">
        {!useFallback ? (
          <RingCanvas
            projects={PROJECTS}
            focusedIndex={focusedIndex}
            onFocusChange={handleFocusChange}
            onCardClick={handleCardClick}
            onHoverCard={handleHoverCard}
            isInside={isInside}
            onInsideChange={setIsInside}
          />
        ) : (
          <RingFallback
            projects={PROJECTS}
            focusedIndex={focusedIndex}
            onCardClick={handleCardClick}
          />
        )}
      </div>

      {/* Left Ring Panel: Editorial Details & View Project Action */}
      <RingPanel
        project={currentProject}
        totalCount={PROJECTS.length}
        currentIndex={focusedIndex}
        onViewProject={setSelectedProject}
      />

      {/* Bottom Right Controls / Index Ticker */}
      <div className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-20 flex items-center gap-3 font-mono text-xs text-paper/70 pointer-events-auto">
        {/* Inside/Outside 3D Circle Dive Toggle */}
        <button
          onClick={() => setIsInside(!isInside)}
          className={`flex items-center gap-2 px-3 py-1.5 border text-[11px] font-mono uppercase tracking-wider transition-all duration-300 ${
            isInside
              ? "bg-[#ED1C24] text-paper border-[#ED1C24] shadow-lg shadow-red-500/30"
              : "bg-[#10192A]/80 border-white/15 text-paper/80 hover:border-white/40"
          }`}
          title="Toggle inside 3D circle panoramic view (Shortcut: key 'I')"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isInside ? "bg-white animate-pulse" : "bg-[#ED1C24]"
            }`}
          />
          <span>{isInside ? "Inside 3D View" : "3D Panorama [I]"}</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#10192A]/80 border border-white/10 text-[11px]">
          <span>NAV:</span>
          <span className="text-[#ED1C24] font-semibold">← / →</span>
          <span>OR</span>
          <span className="text-[#ED1C24] font-semibold">SCROLL</span>
        </div>

        {/* Quick jump carousel pagination pills */}
        <div className="flex items-center gap-1.5 bg-[#10192A]/80 border border-white/10 p-2">
          {PROJECTS.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setFocusedIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === focusedIndex
                  ? "bg-[#ED1C24] w-5"
                  : "bg-white/20 hover:bg-white/50 w-2"
              }`}
              title={`Jump to ${p.title}`}
              aria-label={`Jump to project ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Interactive Custom Cursor */}
      <CustomCursor hoverState={cursorLabel} />

      {/* Project Deep Dive Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      {/* About & Manifesto Modal */}
      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
    </main>
  );
}
