/* 补截知识 KP 图 → docs/ppt-assets/14,15  (org dev server on 5184) */
const puppeteer = require('puppeteer-core');
const path = require('path');
const OUT = path.resolve(__dirname, '../ppt-assets');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const D = { width: 1440, height: 900, deviceScaleFactor: 2 };
async function go(p, u) { await p.goto(u, { waitUntil: 'domcontentloaded', timeout: 30000 }); await sleep(2200); }
async function clickText(p, txt) { return p.evaluate((txt) => { const e = [...document.querySelectorAll('button,[role=tab],div,span,a')].find((x) => x.textContent.trim() === txt); if (e) { (e.closest('button,[role=tab]') || e).click(); return true; } return false; }, txt); }
(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const base = 'http://localhost:5184';
  let p = await browser.newPage(); await p.setViewport(D);
  await go(p, base + '/kps');
  await p.screenshot({ path: path.join(OUT, '14-org-kp-list.png') }); console.log('OK 14 kp-list');
  await p.close();
  p = await browser.newPage(); await p.setViewport(D);
  await go(p, base + '/kps/kp_cardio');
  await clickText(p, '知识库'); await sleep(900);
  await p.screenshot({ path: path.join(OUT, '15-org-kp-knowledge.png') }); console.log('OK 15 kp-knowledge');
  await p.close();
  await browser.close();
})().catch((e) => { console.log('FAIL', e.message); process.exit(1); });
