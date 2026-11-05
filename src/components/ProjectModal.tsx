"use client";

import React, { useEffect } from "react";
import { Project } from "@/data/projects";
import { X, ExternalLink, GitBranch, Terminal, CheckCircle2, Cpu } from "lucide-react";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (project) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-[#0A101C]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#142139] border border-white/15 text-paper rounded-none shadow-2xl p-6 sm:p-10 md:p-12 custom-scrollbar"
        style={{
          boxShadow: "0 30px 90px rgba(0,0,0,0.8)",
        }}
      >
        {/* Top Header Bar */}
        <div className="flex justify-between items-start border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3 font-mono text-xs text-[#ED1C24] uppercase tracking-widest">
              <span>{project.badge}</span>
              <span>—</span>
              <span>{project.kicker}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-bold uppercase tracking-tight mt-2 text-paper">
              {project.title}
            </h1>
            <p className="font-mono text-xs text-paper/60 uppercase mt-1 tracking-wider">
              {project.timeline} • {project.category}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-paper hover:text-[#ED1C24] bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Links */}
        <div className="flex flex-wrap gap-4 mt-6">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ED1C24] text-paper font-mono text-xs font-semibold uppercase tracking-wider hover:bg-[#d61820] transition-colors"
            >
              <span>Launch Live System</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 text-paper font-mono text-xs font-semibold uppercase tracking-wider hover:bg-white/20 transition-colors border border-white/15"
            >
              <span>Inspect Source</span>
              <GitBranch className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
          {project.metrics.map((metric, i) => (
            <div
              key={i}
              className="p-4 bg-[#10192A] border border-white/10 flex flex-col justify-between"
            >
              <span className="font-mono text-xs text-paper/60 uppercase tracking-widest">
                {metric.label}
              </span>
              <span className="font-display text-2xl font-bold text-[#ED1C24] mt-2">
                {metric.value}
              </span>
            </div>
          ))}
        </div>

        {/* System Description */}
        <div className="mt-8">
          <h3 className="font-mono text-xs text-[#ED1C24] uppercase tracking-widest flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            <span>Architecture & Philosophy</span>
          </h3>
          <p className="font-editorial text-xl sm:text-2xl text-paper leading-relaxed mt-3 opacity-90">
            {project.description}
          </p>
        </div>

        {/* Key Engineering Challenges & Solutions */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <h3 className="font-mono text-xs text-[#ED1C24] uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Core Technical Breakthroughs</span>
          </h3>
          <ul className="mt-4 space-y-3 font-mono text-xs sm:text-sm text-paper/80">
            {project.challenges.map((c, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-[#ED1C24] font-bold">0{i + 1}</span>
                <span className="leading-relaxed">{c}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tech Stack Breakdown */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <h3 className="font-mono text-xs text-[#ED1C24] uppercase tracking-widest flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            <span>Substrate & Toolchain</span>
          </h3>
          <div className="flex flex-wrap gap-2 mt-3">
            {project.stack.map((s, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-[#10192A] border border-white/15 font-mono text-xs text-paper"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-10 pt-6 border-t border-white/10 flex justify-between items-center font-mono text-[11px] text-paper/50">
          <span>PRESS ESC OR CLICK OUTSIDE TO CLOSE</span>
          <span>SPECIFICATION ID // {project.id}.REV4</span>
        </div>
      </div>
    </div>
  );
};
