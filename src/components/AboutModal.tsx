"use client";

import React, { useEffect } from "react";
import { X, Mail, MapPin, Code2, Globe, Send } from "lucide-react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-[#0A101C]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#142139] border border-white/15 text-paper rounded-none shadow-2xl p-6 sm:p-10 md:p-12 custom-scrollbar"
        style={{
          boxShadow: "0 30px 90px rgba(0,0,0,0.8)",
        }}
      >
        <div className="flex justify-between items-start border-b border-white/10 pb-6">
          <div>
            <span className="font-mono text-xs text-[#ED1C24] uppercase tracking-widest">
              MANIFESTO // ETHOS
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-tight text-paper mt-1">
              BUILDER CULTURE
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-paper hover:text-[#ED1C24] bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
            aria-label="Close manifesto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-8 space-y-6 font-editorial text-xl sm:text-2xl leading-relaxed text-paper/90">
          <p>
            Software is not a PowerPoint presentation. It is an artifact of applied
            intellect, mechanical sympathy with silicon, and uncompromising craftsmanship.
          </p>
          <p>
            We operate at the convergence of graphics programming, distributed systems,
            and autonomous agentic pipelines. Every piece of work shown in this ring
            was planned, built, benchmarked, and delivered to production standards.
          </p>
          <p className="text-lg font-mono text-paper/70 leading-normal">
            PRINCIPLES:
            <br />
            1. Zero unnecessary abstraction layers.
            <br />
            2. Real-time deterministic latency over superficial glitter.
            <br />
            3. Open protocols over walled corporate gardens.
          </p>
        </div>

        {/* Contact Coordinates */}
        <div className="mt-10 pt-8 border-t border-white/10">
          <span className="font-mono text-xs text-[#ED1C24] uppercase tracking-widest">
            COMMUNICATION CHANNELS
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 font-mono text-xs">
            <a
              href="mailto:contact@wecodecoders.in"
              className="p-4 bg-[#10192A] border border-white/10 flex items-center gap-3 text-paper hover:border-[#ED1C24] transition-colors"
            >
              <Mail className="w-4 h-4 text-[#ED1C24]" />
              <span>mokshith@example.com</span>
            </a>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-[#10192A] border border-white/10 flex items-center gap-3 text-paper hover:border-[#ED1C24] transition-colors"
            >
              <Globe className="w-4 h-4 text-[#ED1C24]" />
              <span>github.com/mokshith</span>
            </a>

            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-[#10192A] border border-white/10 flex items-center gap-3 text-paper hover:border-[#ED1C24] transition-colors"
            >
              <Send className="w-4 h-4 text-[#ED1C24]" />
              <span>@mokshith_dev</span>
            </a>

            <div className="p-4 bg-[#10192A] border border-white/10 flex items-center gap-3 text-paper">
              <MapPin className="w-4 h-4 text-[#ED1C24]" />
              <span>Bengaluru & Worldwide (UTC+5:30)</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between font-mono text-[11px] text-paper/50">
          <span className="flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-[#ED1C24]" />
            BUILT WITH WEBGPU & THREE.JS
          </span>
          <span>© 2026 MOKSHITH</span>
        </div>
      </div>
    </div>
  );
};
