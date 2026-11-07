import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3000';
const OUT_DIR = path.resolve('docs/qa-evidence/phase-1');

async function testPage(mode) {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Set demo persona cookie
  await page.setCookie({
    name: 'brandsure_demo_session',
    value: JSON.stringify({ email: 'creator@paynest.demo', role: 'creator', full_name: 'PayNest Creator' }),
    domain: 'localhost',
    path: '/'
  });

  await page.goto(`${BASE_URL}/drafts`, { waitUntil: 'networkidle0' });

  const content = await page.evaluate(() => {
    return {
      bodyText: document.body.innerText,
      hasDbNotConfigured: document.body.innerText.includes('Database not configured'),
      hasDemoBanner: document.body.innerText.includes('Demo mode: data is temporary and resets'),
      hasFooterStoreLabel: document.body.innerText.includes('Data store:'),
    };
  });

  const shotPath = path.join(OUT_DIR, `${mode}_screenshot.png`);
  await page.screenshot({ path: shotPath });

  console.log(`[Mode: ${mode}]`, content);
  console.log(`Saved screenshot to ${shotPath}`);

  await browser.close();
  return content;
}

const mode = process.argv[2] || 'production_refusal';
testPage(mode).catch(err => {
  console.error(err);
  process.exit(1);
});
