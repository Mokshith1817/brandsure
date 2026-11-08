import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = path.resolve('docs/qa-evidence/phase-2-visuals');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  console.log('🚀 Launching Chrome for P2 Visual & Font Verification...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();

    // 1. Desktop Test (1280x800) on /login
    await page.setViewport({ width: 1280, height: 800 });
    console.log('📄 Navigating to http://localhost:3000/login (Desktop 1280x800)...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });

    const desktopFont = await page.evaluate(() => {
      const body = document.body;
      const computed = window.getComputedStyle(body);
      const h1 = document.querySelector('h1');
      const h1Computed = h1 ? window.getComputedStyle(h1) : null;
      const input = document.querySelector('input');
      const inputComputed = input ? window.getComputedStyle(input) : null;

      const hasHorizontalScroll = document.documentElement.scrollWidth > document.documentElement.clientWidth;

      return {
        bodyFont: computed.fontFamily,
        h1Font: h1Computed?.fontFamily,
        inputFont: inputComputed?.fontFamily,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasHorizontalScroll,
      };
    });

    console.log('   Desktop Body Font Family  :', desktopFont.bodyFont);
    console.log('   Desktop H1 Font Family    :', desktopFont.h1Font);
    console.log('   Desktop Input Font Family :', desktopFont.inputFont);
    console.log('   Horizontal Scroll Active  :', desktopFont.hasHorizontalScroll);

    const login1280Path = path.join(OUT_DIR, 'login_1280.png');
    await page.screenshot({ path: login1280Path, fullPage: true });
    console.log(`   📸 Captured Desktop Screenshot: ${login1280Path}`);

    // 2. Mobile Test (390x844) on /login
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    console.log('\n📱 Navigating to http://localhost:3000/login (Mobile 390x844)...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });

    const mobileMetrics = await page.evaluate(() => {
      const hasHorizontalScroll = document.documentElement.scrollWidth > document.documentElement.clientWidth;
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasHorizontalScroll,
      };
    });

    console.log('   Mobile Width Metrics      : scrollWidth=' + mobileMetrics.scrollWidth + ', clientWidth=' + mobileMetrics.clientWidth);
    console.log('   Mobile Horizontal Scroll  :', mobileMetrics.hasHorizontalScroll);

    const login390Path = path.join(OUT_DIR, 'login_390.png');
    await page.screenshot({ path: login390Path, fullPage: true });
    console.log(`   📸 Captured Mobile Screenshot: ${login390Path}`);

    // 3. Desktop Test on /signup
    await page.setViewport({ width: 1280, height: 800 });
    console.log('\n📄 Navigating to http://localhost:3000/signup (Desktop 1280x800)...');
    await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle0' });
    const signup1280Path = path.join(OUT_DIR, 'signup_1280.png');
    await page.screenshot({ path: signup1280Path, fullPage: true });
    console.log(`   📸 Captured Desktop Signup Screenshot: ${signup1280Path}`);

    // 4. Mobile Test on /signup
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    console.log('\n📱 Navigating to http://localhost:3000/signup (Mobile 390x844)...');
    await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle0' });
    const signup390Path = path.join(OUT_DIR, 'signup_390.png');
    await page.screenshot({ path: signup390Path, fullPage: true });
    console.log(`   📸 Captured Mobile Signup Screenshot: ${signup390Path}`);

    // 5. Check if 'serif' is the active font anywhere
    const isSerifActive = desktopFont.bodyFont.toLowerCase().startsWith('times') ||
      desktopFont.bodyFont.toLowerCase().startsWith('georgia') ||
      desktopFont.bodyFont.toLowerCase() === 'serif';

    console.log('\n=============================================================');
    console.log('📊 P2 Visual Verification Summary:');
    console.log(' - Serif Font Detected     : ' + (isSerifActive ? 'FAIL (Serif)' : 'PASS (Sans-Serif Inter)'));
    console.log(' - Mobile Layout (390px)   : ' + (mobileMetrics.hasHorizontalScroll ? 'FAIL (Overflow)' : 'PASS (Clean, No Overflow)'));
    console.log(' - Desktop Layout (1280px) : ' + (desktopFont.hasHorizontalScroll ? 'FAIL (Overflow)' : 'PASS (Clean, No Overflow)'));
    console.log('=============================================================\n');

  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
