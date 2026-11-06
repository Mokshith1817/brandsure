import Lenis from 'lenis';

export type Tick = (time: number) => void;

const subs = new Set<Tick>();
let lenis: Lenis | null = null;
let running = false;
let rafId = 0;

export function startScroll(reduced = false): () => void {
  if (typeof window === 'undefined') return () => {};

  if (!reduced) {
    lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      syncTouch: false,
    });
  }

  running = true;

  const loop = (t: number) => {
    if (!running) return;
    lenis?.raf(t);
    subs.forEach((fn) => {
      try {
        fn(t);
      } catch (e) {
        console.error('Error in onFrame subscriber:', e);
      }
    });
    rafId = requestAnimationFrame(loop);
  };

  rafId = requestAnimationFrame(loop);
  document.documentElement.classList.add('js-ready');

  return () => {
    // Stops the loop only; never clears subs (survives React Strict Mode double-mounting)
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    lenis?.destroy();
    lenis = null;
    document.documentElement.classList.remove('js-ready');
  };
}

export function onFrame(fn: Tick): () => void {
  subs.add(fn);
  // Execute immediately once on subscribe
  if (typeof window !== 'undefined') {
    fn(performance.now());
  }
  return () => {
    subs.delete(fn);
  };
}

export function scrollTo(target: string | number | HTMLElement) {
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.2 });
  } else if (typeof window !== 'undefined') {
    if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: 'smooth' });
    } else if (typeof target === 'string') {
      const el = document.querySelector(target);
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
