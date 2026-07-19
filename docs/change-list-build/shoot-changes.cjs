/* 改动清单配图：截取本次改动落地的页面 → docs/change-list-assets/*.png
   打线上已部署的三端（已是最新代码），无需起本地 dev server。
   run: node docs/change-list-build/shoot-changes.cjs */
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const OUT = path.resolve(__dirname, '../change-list-assets');
fs.mkdirSync(OUT, { recursive: true });
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const H5 = 'https://ai-book-ask-mobile-h5.zhangyuqing.top';
const ORG = 'https://ai-book-ask-org-admin.zhangyuqing.top';
const PLAT = 'https://ai-book-ask-platform-admin.zhangyuqing.top';

const M = { width: 375, height: 812, deviceScaleFactor: 2 };
const D = { width: 1440, height: 900, deviceScaleFactor: 2 };

async function go(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await sleep(2200); // 等 SPA 渲染
}
async function clickText(page, text, exact = false) {
  return page.evaluate((text, exact) => {
    const els = [...document.querySelectorAll('button,a,[role=tab],div,span,li,td')];
    const el = els.find((e) => {
      const t = (e.textContent || '').trim();
      return exact ? t === text : t.includes(text);
    });
    if (el) { (el.closest('button,a,[role=tab],tr') || el).click(); return true; }
    return false;
  }, text, exact);
}

// 页面清单：[文件名, 视口, url, 可选的进入后动作]
const SHOTS = [
  // ── 移动端 H5 ──
  ['h5-member.png',      M, `${H5}/member`],
  ['h5-books.png',       M, `${H5}/me/books`],
  ['h5-yongxiang.png',   M, `${H5}/me/yongxiang`],
  ['h5-kpgate-off.png',  M, `${H5}/kp/kp_anesthesia`],
  ['h5-kpgate-dead.png', M, `${H5}/kp/kp_ultrasound_old`],
  ['h5-orders.png',      M, `${H5}/me/orders`],
  ['h5-redeem.png',      M, `${H5}/me/redeem`],
  // ── 机构后台 ──
  ['org-kps.png',        D, `${ORG}/kps`],
  ['org-kpdetail.png',   D, `${ORG}/kps/1`],
  ['org-board.png',      D, `${ORG}/board`],
  ['org-sys.png',        D, `${ORG}/sys`],
  ['org-orders.png',     D, `${ORG}/orders`],
  ['org-codes.png',      D, `${ORG}/codes`],
  // ── 平台超管 ──
  ['plat-orgs.png',      D, `${PLAT}/orgs`],
  ['plat-orgdetail.png', D, `${PLAT}/orgs/1`],
  ['plat-globalkps.png', D, `${PLAT}/global-kps`],
  ['plat-roles.png',     D, `${PLAT}/roles`],
  ['plat-users.png',     D, `${PLAT}/global-users`],
];

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  let ok = 0, fail = 0;

  for (const [name, vp, url, after] of SHOTS) {
    const page = await browser.newPage();
    await page.setViewport(vp);
    try {
      await go(page, url);
      if (after) { await after(page); await sleep(900); }
      await page.screenshot({ path: path.join(OUT, name) });
      // 粗校验：截到登录页说明没进去
      const txt = await page.evaluate(() => document.body.innerText.slice(0, 120));
      const isLogin = /登录$|请输入手机号|账号登录/.test(txt.trim());
      console.log(isLogin ? `⚠ 疑似登录页 ${name}` : `OK   ${name}`);
      ok++;
    } catch (e) {
      console.log(`FAIL ${name} - ${e.message}`);
      fail++;
    }
    await page.close();
  }

  await browser.close();
  console.log(`\n完成：成功 ${ok} / 失败 ${fail} → ${OUT}`);
})();
