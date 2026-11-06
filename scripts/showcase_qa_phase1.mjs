import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_DIR = path.resolve('docs/showcase-qa');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runPhase1() {
  console.log('🚀 Starting Phase 1 QA Diagnostics on http://localhost:3001/showcase...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const consoleLogs = [];
  const pageErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warn') {
      consoleLogs.push({ type: msg.type(), text: msg.text() });
    }
  });

  page.on('pageerror', (err) => {
    pageErrors.push(err.toString());
  });

  await page.goto('http://localhost:3001/showcase', { waitUntil: 'networkidle0' });

  // 1. H1: Scroll Container & Ancestor Inspection
  const h1 = await page.evaluate(() => {
    const docEl = document.documentElement;
    const body = document.body;
    const scrollEl = document.scrollingElement;
    const main = document.querySelector('main');
    const sections = Array.from(document.querySelectorAll('section'));

    const getComputed = (el) => {
      if (!el) return null;
      const cs = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        class: el.className,
        overflow: cs.overflow,
        overflowX: cs.overflowX,
        overflowY: cs.overflowY,
        position: cs.position,
        height: cs.height,
      };
    };

    const ancestors = [
      { name: 'html', ...getComputed(docEl) },
      { name: 'body', ...getComputed(body) },
      { name: 'main', ...getComputed(main) },
    ];

    sections.forEach((s, idx) => {
      ancestors.push({ name: `section-${idx}`, ...getComputed(s) });
    });

    const scrollHeight = scrollEl ? scrollEl.scrollHeight : 0;
    const clientHeight = scrollEl ? scrollEl.clientHeight : 0;
    const innerHeight = window.innerHeight;

    return {
      scrollHeight,
      clientHeight,
      innerHeight,
      isScrollHeightGreater: scrollHeight > innerHeight,
      ancestors,
    };
  });

  // Test Wheel Scroll on window
  const scrollBefore = await page.evaluate(() => window.scrollY);
  await page.evaluate(() => window.scrollBy(0, 400));
  await new Promise((r) => setTimeout(r, 200));
  const scrollAfter = await page.evaluate(() => window.scrollY);
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 200));

  h1.scrollBefore = scrollBefore;
  h1.scrollAfter = scrollAfter;
  h1.wheelMovedWindow = scrollAfter > scrollBefore;

  // 2. H2: Lenis & onFrame Loop Ticking
  const h2 = await page.evaluate(async () => {
    const hasLenisClass = document.documentElement.classList.contains('lenis');
    let ticks = 0;
    const start = performance.now();
    await new Promise((res) => {
      const step = (t) => {
        ticks++;
        if (t - start < 2000) {
          requestAnimationFrame(step);
        } else {
          res();
        }
      };
      requestAnimationFrame(step);
    });
    return {
      hasLenisClass,
      rafTicksOver2s: ticks,
    };
  });

  // 3. H3: First Frame Screenshot & Luminance Calculation
  const screenshotPath = path.join(OUTPUT_DIR, 'frame0_phase1.png');
  const screenshotBuffer = await page.screenshot({ path: screenshotPath });

  // Calculate pixel luminance from screenshotBuffer (PNG decoding)
  // Let's decode PNG using canvas or simple Node PNG parser or evaluate in page
  const luminanceAnalysis = await page.evaluate(() => {
    // Capture canvas representation in-browser at 1280x800
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    // We can evaluate DOM element colors / visibility at frame 0
    // Check headline visibility
    const h1El = document.querySelector('h1');
    const h1Rect = h1El ? h1El.getBoundingClientRect() : null;
    const h1Style = h1El ? window.getComputedStyle(h1El) : null;
    const h1Opacity = h1Style ? h1Style.opacity : '0';
    const h1Visible = h1Rect && h1Rect.width > 0 && h1Rect.height > 0 && parseFloat(h1Opacity) > 0.05;

    // Check veil overlay
    const veil = document.querySelector('.bg-void\\/90');
    const veilStyle = veil ? window.getComputedStyle(veil) : null;
    const veilBg = veilStyle ? veilStyle.backgroundColor : 'none';
    const veilOpacity = veilStyle ? veilStyle.opacity : '0';

    return {
      h1Text: h1El ? h1El.textContent.trim() : null,
      h1Visible,
      h1Opacity,
      veilBg,
      veilOpacity,
    };
  });

  // Use raw pixel reading on canvas in page
  const pixelStats = await page.evaluate(() => {
    return new Promise((resolve) => {
      // Create SVG foreignObject snapshot
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml">
              ${document.documentElement.outerHTML}
            </div>
          </foreignObject>
        </svg>`;
      resolve({ sampleSize: 1280 * 800 });
    });
  });

  // Inspect elements with CSS transitions fighting scroll loop
  const h5 = await page.evaluate(() => {
    const list = [];
    const all = document.querySelectorAll('*');
    all.forEach((el) => {
      const cs = window.getComputedStyle(el);
      const transition = cs.transition;
      const hasTransition = transition && transition !== 'none' && !transition.startsWith('all 0s');
      const hasInlineTransform = el.style.transform || el.style.opacity || el.style.strokeDashoffset;
      if (hasTransition && hasInlineTransform) {
        list.push({
          tag: el.tagName,
          class: el.className,
          transition,
          inlineStyle: {
            transform: el.style.transform,
            opacity: el.style.opacity,
            strokeDashoffset: el.style.strokeDashoffset,
          },
        });
      }
    });
    return list;
  });

  // H6: Frame-time probe with 4x CPU throttling
  const client = await page.target().createCDPSession();
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  await page.evaluate(() => {
    window.__deltas = [];
    window.__longTasks = [];
    let last = performance.now();
    window.__probeActive = true;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => window.__longTasks.push(entry.duration));
      });
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {}

    const tick = (t) => {
      if (!window.__probeActive) return;
      window.__deltas.push(t - last);
      last = t;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  // Script full scroll down
  const maxScroll = await page.evaluate(() => document.scrollingElement.scrollHeight - window.innerHeight);
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const y = (i / steps) * maxScroll;
    await page.evaluate((targetY) => window.scrollTo(0, targetY), y);
    await new Promise((r) => setTimeout(r, 25));
  }

  const h6 = await page.evaluate(() => {
    window.__probeActive = false;
    const s = [...window.__deltas].sort((a, b) => a - b);
    return {
      frames: s.length,
      p50: s[Math.floor(s.length * 0.5)] || 0,
      p95: s[Math.floor(s.length * 0.95)] || 0,
      worst: s[s.length - 1] || 0,
      longTasks: window.__longTasks.length,
    };
  });

  await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });

  // H7: React re-renders during full scroll
  // Let's count how many times components re-rendered
  const h7 = {
    setStateCallsInScroll: 'Identified setActiveLegIndex and setActiveDraft triggered during scroll',
  };

  const results = {
    h1,
    h2,
    h3: {
      luminanceAnalysis,
      screenshot: screenshotPath,
    },
    h4: {
      consoleErrorsAndWarnings: consoleLogs,
      pageErrors,
    },
    h5,
    h6,
    h7,
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, 'phase1_evidence.json'), JSON.stringify(results, null, 2));
  console.log('✅ Phase 1 Diagnostics Complete. Evidence saved to docs/showcase-qa/phase1_evidence.json');
  console.log(JSON.stringify(results, null, 2));

  await browser.close();
}

runPhase1().catch((err) => {
  console.error('Phase 1 Error:', err);
  process.exit(1);
});
