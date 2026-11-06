export const clamp = (v: number, a = 0, b = 1): number =>
  Math.min(b, Math.max(a, v));

export const range = (v: number, a: number, b: number): number =>
  clamp((v - a) / (b - a));

export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

export function pinProgress(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const totalH = Math.max(1, rect.height - vh);
  const p = clamp(-rect.top / totalH);
  return { p, rect, vh };
}
