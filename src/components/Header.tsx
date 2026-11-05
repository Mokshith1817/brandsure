"use client";

import React, { useState } from "react";
import { Volume2, VolumeX, Menu, X } from "lucide-react";

interface HeaderProps {
  onOpenAbout: () => void;
  onOpenContact: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAbout,
  onOpenContact,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Web Audio click generator for tactile feedback
  const playClick = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // AudioContext unavailable
    }
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      setTimeout(playClick, 50);
    }
  };

  return (
    <>
      {/* Top scrim gradient */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 h-28 pointer-events-none z-30"
        style={{
          background:
            "linear-gradient(to bottom, rgba(20, 33, 57, 0.95), rgba(20, 33, 57, 0.4) 60%, transparent)",
        }}
      />

      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 sm:px-8 py-5 md:py-7 text-paper pointer-events-none">
        {/* Logo / Monogram */}
        <div className="pointer-events-auto flex items-center gap-3">
          <a
            href="/"
            onClick={playClick}
            className="group flex items-center gap-2.5 text-paper no-underline"
          >
            {/* Geometric architectural logo glyph */}
            <div className="w-8 h-8 rounded-sm bg-[#ED1C24] flex items-center justify-center text-paper font-mono font-bold text-sm tracking-tighter shadow-md transition-transform group-hover:scale-105">
              <span>W</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold tracking-wider uppercase leading-none">
                MOKSHITH
              </span>
              <span className="font-mono text-[9px] tracking-[0.2em] text-[#ED1C24] uppercase mt-0.5">
                ENGINEERING / PORTFOLIO
              </span>
            </div>
          </a>
        </div>

        {/* Center / Right Navigation Links */}
        <div className="hidden md:flex items-center gap-8 font-mono text-xs tracking-widest uppercase pointer-events-auto">
          <a
            href="#projects"
            onClick={playClick}
            className="flex items-center gap-1.5 text-paper opacity-80 hover:opacity-100 hover:text-[#ED1C24] transition-all"
          >
            <span className="text-[#ED1C24] font-semibold">01</span>
            <span>Projects</span>
          </a>

          <button
            onClick={() => {
              playClick();
              onOpenAbout();
            }}
            className="flex items-center gap-1.5 text-paper opacity-80 hover:opacity-100 hover:text-[#ED1C24] transition-all bg-transparent border-none cursor-pointer p-0"
          >
            <span className="text-[#ED1C24] font-semibold">02</span>
            <span>Manifesto</span>
          </button>

          <button
            onClick={() => {
              playClick();
              onOpenContact();
            }}
            className="flex items-center gap-1.5 text-paper opacity-80 hover:opacity-100 hover:text-[#ED1C24] transition-all bg-transparent border-none cursor-pointer p-0"
          >
            <span className="text-[#ED1C24] font-semibold">03</span>
            <span>Contact</span>
          </button>

          {/* Sound Synthesizer Toggle */}
          <button
            onClick={toggleSound}
            aria-label="Toggle tactile UI audio"
            className="flex items-center gap-1.5 text-paper opacity-60 hover:opacity-100 transition-opacity bg-transparent border-none cursor-pointer p-1"
            title={soundEnabled ? "Audio Muted" : "Enable Tactile Clicks"}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-[#ED1C24]" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
            <span className="text-[10px]">{soundEnabled ? "SFX ON" : "SFX"}</span>
          </button>

          {/* Status Badge with Pulsing Dot */}
          <div className="flex items-center gap-2 bg-[#ED1C24] text-paper font-display text-xs font-bold tracking-wider px-3.5 py-1.5 rounded-full shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-paper animate-ping" />
            <span>AVAILABLE FOR CONTRACT</span>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden pointer-events-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#ED1C24] text-paper font-display text-[11px] font-bold tracking-wider px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-paper animate-pulse" />
            <span>OPEN</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-paper bg-[#10192A] border border-white/20 rounded-md"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#142139]/95 backdrop-blur-md flex flex-col justify-center px-8 py-12 md:hidden">
          <div className="flex justify-between items-center mb-10">
            <span className="font-mono text-xs text-[#ED1C24] tracking-widest uppercase">
              INDEX // NAVIGATION
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-paper"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex flex-col gap-6 font-display text-3xl font-bold uppercase">
            <a
              href="#projects"
              onClick={() => setMobileMenuOpen(false)}
              className="text-paper hover:text-[#ED1C24]"
            >
              01 — Projects
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAbout();
              }}
              className="text-left text-paper hover:text-[#ED1C24] bg-transparent border-none p-0 font-display text-3xl font-bold uppercase"
            >
              02 — Manifesto
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenContact();
              }}
              className="text-left text-paper hover:text-[#ED1C24] bg-transparent border-none p-0 font-display text-3xl font-bold uppercase"
            >
              03 — Contact
            </button>
          </nav>

          <div className="mt-12 pt-6 border-t border-white/10 flex justify-between items-center font-mono text-xs text-paper/60">
            <span>AVAILABLE WORLDWIDE</span>
            <button
              onClick={toggleSound}
              className="text-[#ED1C24] flex items-center gap-1"
            >
              {soundEnabled ? "SFX: ACTIVE" : "SFX: MUTED"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
