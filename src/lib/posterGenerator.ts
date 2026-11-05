import { Project } from "@/data/projects";

// In-memory cache so each poster canvas is rendered only once
const posterCache = new Map<string, HTMLCanvasElement>();

function createRng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generatePosterCanvas(project: Project): HTMLCanvasElement {
  if (posterCache.has(project.id)) {
    return posterCache.get(project.id)!;
  }

  const canvas = document.createElement("canvas");
  // 768x1024: extremely sharp 3:4 ratio with 44% lighter memory footprint
  canvas.width = 768;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return canvas;

  const rng = createRng(project.posterSeed);
  const bg = project.bg;
  const accent = project.accent;
  const fg = project.fg;

  // 1. Solid background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 768, 1024);

  // 2. Subtle dot matrix
  const step = 40;
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.16;
  for (let x = step; x < 768; x += step) {
    for (let y = step; y < 1024; y += step) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 3. Technical hatch lines
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.2;
  const hatchSize = 140;
  for (let i = -hatchSize; i < hatchSize; i += 16) {
    ctx.beginPath();
    ctx.moveTo(768 - hatchSize + i, 0);
    ctx.lineTo(768 + i, hatchSize);
    ctx.stroke();
  }

  // 4. Outer border & corner crosshairs
  ctx.globalAlpha = 0.75;
  ctx.strokeStyle = fg;
  ctx.lineWidth = 1.8;
  const pad = 36;
  ctx.strokeRect(pad, pad, 768 - pad * 2, 1024 - pad * 2);

  const cross = 12;
  const corners = [
    [pad, pad],
    [768 - pad, pad],
    [pad, 1024 - pad],
    [768 - pad, 1024 - pad],
  ];
  for (const [cx, cy] of corners) {
    ctx.beginPath();
    ctx.moveTo(cx - cross, cy);
    ctx.lineTo(cx + cross, cy);
    ctx.moveTo(cx, cy - cross);
    ctx.lineTo(cx, cy + cross);
    ctx.stroke();
  }

  // 5. Header info
  ctx.globalAlpha = 1.0;
  ctx.font = "600 20px monospace";
  ctx.fillStyle = accent;
  ctx.fillText(project.badge, pad + 20, pad + 38);

  ctx.font = "500 16px monospace";
  ctx.fillStyle = fg;
  ctx.globalAlpha = 0.85;
  ctx.textAlign = "right";
  ctx.fillText(project.category.toUpperCase(), 768 - pad - 20, pad + 38);
  ctx.textAlign = "left";

  // Separator
  ctx.strokeStyle = fg;
  ctx.globalAlpha = 0.22;
  ctx.beginPath();
  ctx.moveTo(pad + 20, pad + 56);
  ctx.lineTo(768 - pad - 20, pad + 56);
  ctx.stroke();

  // 6. Central Graphic
  ctx.save();
  ctx.translate(384, 430);
  const variant = Math.floor(rng() * 4);
  ctx.globalAlpha = 0.9;

  if (variant === 0) {
    for (let r = 60; r <= 240; r += 45) {
      ctx.strokeStyle = accent;
      ctx.lineWidth = r === 150 ? 4 : 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 195, -0.4, 1.2);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = fg;
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.moveTo(-90, 0);
    ctx.lineTo(90, 0);
    ctx.moveTo(0, -90);
    ctx.lineTo(0, 90);
    ctx.stroke();
  } else if (variant === 1) {
    ctx.lineWidth = 2.5;
    for (let i = -3; i <= 3; i++) {
      ctx.strokeStyle = i === 0 ? accent : fg;
      ctx.globalAlpha = i === 0 ? 0.95 : 0.35;
      const off = i * 32;
      ctx.strokeRect(-140 + off * 0.3, -130 + off, 280, 120);
    }
  } else if (variant === 2) {
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    for (let x = -210; x <= 210; x += 8) {
      const y = Math.sin(x * 0.025) * Math.cos(x * 0.01) * 120;
      if (x === -210) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.strokeStyle = fg;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    for (let x = -210; x <= 210; x += 8) {
      const y = Math.sin(x * 0.025 + 0.8) * 90 + 30;
      if (x === -210) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  } else {
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.25;
    ctx.fillRect(-170, -140, 340, 280);

    ctx.font = "800 180px 'Arial Narrow', sans-serif";
    ctx.fillStyle = fg;
    ctx.globalAlpha = 0.95;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(project.id, 0, 0);

    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    ctx.strokeRect(-185, -155, 370, 310);
  }

  ctx.restore();

  // 7. Large Poster Typography
  ctx.globalAlpha = 1.0;
  ctx.fillStyle = fg;
  const words = project.title.toUpperCase().split(" ");
  ctx.font = "800 52px 'Arial Narrow', sans-serif";
  let currY = 710;
  words.forEach((w) => {
    ctx.fillText(w, pad + 24, currY);
    currY += 56;
  });

  // 8. Monospace metadata
  ctx.fillStyle = accent;
  ctx.font = "600 16px monospace";
  ctx.fillText(project.timeline, pad + 24, 880);

  ctx.fillStyle = fg;
  ctx.globalAlpha = 0.7;
  ctx.font = "500 14px monospace";
  ctx.fillText(project.stack.slice(0, 4).join("  •  "), pad + 24, 910);

  // Barcode
  ctx.globalAlpha = 0.8;
  const bcX = 768 - pad - 150;
  const bcY = 930;
  ctx.fillStyle = fg;
  for (let b = 0; b < 20; b++) {
    const w = (b % 3 === 0 ? 4 : 2) + (b % 5 === 0 ? 1 : 0);
    ctx.fillRect(bcX + b * 6, bcY, w, 28);
  }
  ctx.font = "400 11px monospace";
  ctx.fillText(`SPEC-${project.id}.84`, bcX, bcY + 42);

  posterCache.set(project.id, canvas);
  return canvas;
}
