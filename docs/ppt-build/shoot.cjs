/* 原型截图 → docs/ppt-assets/*.png（供 PPT 嵌图用）
   用系统 Chrome + puppeteer-core，命中本地三端 dev server（5173/5174/5175）。
   run: node docs/ppt-build/shoot.cjs */
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const OUT = path.resolve(__dirname, '../ppt-assets');
fs.mkdirSync(OUT, { recursive: true });
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const M = { width: 375, height: 812, deviceScaleFactor: 2 };
const D = { width: 1440, height: 900, deviceScaleFactor: 2 };

async function go(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(1800); // 等 SPA 渲染（Vite HMR 长连接会卡住 networkidle）
}
async function clickText(page, text, exact = true) {
  return page.evaluate((text, exact) => {
    const els = [...document.querySelectorAll('button,a,[role=tab],div,span,li')];
    const el = els.find((e) => {
      const t = e.textContent.trim();
      return exact ? t === text : t.includes(text);
    });
    if (el) { (el.closest('button,a,[role=tab]') || el).click(); return true; }
    return false;
  }, text, exact);
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });

  async function shot(name, vp, fn) {
    const page = await browser.newPage();
    await page.setViewport(vp);
    try {
      await fn(page);
      await page.screenshot({ path: path.join(OUT, name) });
      console.log('OK  ', name);
    } catch (e) {
      console.log('FAIL', name, '-', e.message);
    }
    await page.close();
  }

  // ---------- 移动端 H5 (5173) ----------
  await shot('01-chat-welcome.png', M, async (p) => { await go(p, 'http://localhost:5173/chat'); });

  // 02 对话态 + 03 溯源抽屉（同一会话内顺序产出）
  {
    const page = await browser.newPage();
    await page.setViewport(M);
    try {
      await go(page, 'http://localhost:5173/chat');
      await page.evaluate(() => { const q = document.querySelector('.ex-q'); if (q) q.click(); });
      await page.waitForFunction(() => document.querySelector('button.src-btn'), { timeout: 20000 });
      await sleep(700);
      await page.screenshot({ path: path.join(OUT, '02-chat-answer.png') });
      console.log('OK   02-chat-answer.png');
      await page.evaluate(() => { const b = document.querySelector('button.src-btn'); if (b) b.click(); });
      await sleep(800);
      await page.screenshot({ path: path.join(OUT, '03-chat-source.png') });
      console.log('OK   03-chat-source.png');
    } catch (e) { console.log('FAIL 02/03 -', e.message); }
    await page.close();
  }

  await shot('04-mybooks.png', M, async (p) => { await go(p, 'http://localhost:5173/me/books'); });
  await shot('05-call.png', M, async (p) => { await go(p, 'http://localhost:5173/call'); });

  // ---------- 机构后台 (5174) ----------
  await shot('06-org-dashboard.png', D, async (p) => { await go(p, 'http://localhost:5174/'); });
  await shot('07-org-keywords.png', D, async (p) => {
    await go(p, 'http://localhost:5174/board');
    await clickText(p, '提问分析');
    await sleep(700);
    await p.evaluate(() => { const t = [...document.querySelectorAll('*')].find((e) => /提问关键词云/.test(e.textContent) && e.textContent.length < 300); if (t) t.scrollIntoView({ block: 'center' }); });
    await sleep(700);
  });
  await shot('08-org-sysconfig.png', D, async (p) => { await go(p, 'http://localhost:5174/sys'); });

  // ---------- 平台超管 (5175) ----------
  await shot('09-plat-orgs.png', D, async (p) => { await go(p, 'http://localhost:5175/orgs'); });
  await shot('10-plat-subscriptions.png', D, async (p) => { await go(p, 'http://localhost:5175/subscriptions'); });
  await shot('11-plat-dashboard.png', D, async (p) => { await go(p, 'http://localhost:5175/'); });
  await shot('12-plat-new-subscription.png', D, async (p) => {
    await go(p, 'http://localhost:5175/orgs/ORG001');
    await clickText(p, '订阅配额');
    await sleep(700);
    await clickText(p, '新建订阅', false);
    await sleep(900);
  });

  await browser.close();
  console.log('\nDONE →', OUT);
})();
