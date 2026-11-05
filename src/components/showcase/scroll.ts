export type ScrollCallback = (scrollY: number, velocity: number) => void;

class ScrollController {
  private callbacks: Set<ScrollCallback> = new Set();
  private rafId: number = 0;
  private currentY: number = 0;
  private targetY: number = 0;
  private lastTime: number = 0;
  private isInitialized = false;

  init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    this.currentY = window.scrollY;
    this.targetY = window.scrollY;
    this.lastTime = performance.now();

    const onScroll = () => {
      this.targetY = window.scrollY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    const tick = (time: number) => {
      const dt = Math.min(0.1, (time - this.lastTime) / 1000);
      this.lastTime = time;

      // Smooth damp interpolation towards target scroll
      const diff = this.targetY - this.currentY;
      const velocity = dt > 0 ? diff / dt : 0;
      
      // Update current position (smooth lerp if needed, or sync directly)
      this.currentY += diff * 0.25;
      if (Math.abs(diff) < 0.1) {
        this.currentY = this.targetY;
      }

      const activeY = window.scrollY;
      this.callbacks.forEach((cb) => cb(activeY, velocity));

      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  subscribe(cb: ScrollCallback): () => void {
    this.callbacks.add(cb);
    if (typeof window !== 'undefined') {
      cb(window.scrollY, 0);
    }
    return () => {
      this.callbacks.delete(cb);
    };
  }

  scrollTo(target: string | number | HTMLElement) {
    if (typeof window === 'undefined') return;

    if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: 'smooth' });
    } else if (typeof target === 'string') {
      const el = document.querySelector(target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.callbacks.clear();
    this.isInitialized = false;
  }
}

export const scrollManager = new ScrollController();
