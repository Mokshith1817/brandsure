export const clamp = (v: number, min = 0, max = 1): number =>
  Math.min(max, Math.max(min, v));

export const norm = (v: number, a: number, b: number): number =>
  clamp((v - a) / (b - a));

export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

export const smoothstep = (min: number, max: number, v: number): number => {
  const x = clamp((v - min) / (max - min));
  return x * x * (3 - 2 * x);
};

export const damp = (current: number, target: number, lambda: number, dt: number): number => {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
};
