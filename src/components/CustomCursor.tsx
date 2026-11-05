"use client";

import React, { useEffect, useRef } from "react";

interface CustomCursorProps {
  hoverState: string | null; // e.g. "DRAG" | "VIEW" | "OPEN" | null
}

export const CustomCursor: React.FC<CustomCursorProps> = ({ hoverState }) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Check if fine pointer device
    const isFine = window.matchMedia("(pointer: fine)").matches;
    if (!isFine) return;

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      if (cursorRef.current && cursorRef.current.style.opacity !== "1") {
        cursorRef.current.style.opacity = "1";
      }
    };

    const onMouseLeave = () => {
      if (cursorRef.current) cursorRef.current.style.opacity = "0";
    };

    const onMouseEnter = () => {
      if (cursorRef.current) cursorRef.current.style.opacity = "1";
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    let rafId: number;
    // Buttery smooth lerp loop for the cursor without ANY React re-renders
    const loop = () => {
      rafId = requestAnimationFrame(loop);
      const lerp = 0.22;
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * lerp;
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * lerp;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0) translate(-50%, -50%)`;
      }
    };

    loop();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
    };
  }, []);

  const isExpanded = hoverState !== null;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="fixed top-0 left-0 z-50 pointer-events-none opacity-0 will-change-transform"
      style={{
        transform: "translate3d(-100px, -100px, 0) translate(-50%, -50%)",
      }}
    >
      <div
        ref={badgeRef}
        className={`grid place-items-center rounded-full transition-all duration-200 ease-out ${
          isExpanded
            ? "w-20 h-20 bg-[#ED1C24] text-paper shadow-2xl scale-100"
            : "w-3 h-3 bg-[#ED1C24] text-transparent scale-100 ring-4 ring-[#ED1C24]/30"
        }`}
      >
        {isExpanded && (
          <span
            className="font-mono text-[9px] font-bold tracking-widest uppercase select-none text-paper"
            style={{ letterSpacing: "0.16em" }}
          >
            {hoverState}
          </span>
        )}
      </div>
    </div>
  );
};
