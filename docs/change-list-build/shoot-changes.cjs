/* 改动清单配图：按「功能点」截取对应的交互态 → docs/change-list-assets/*.png
   要点：截的不是整页，而是这个改动**实际长什么样**——弹窗就截弹窗、标签就截标签区域。
   打线上已部署的三端（已是最新代码），无需起本地 dev server。
   run: NODE_PATH=<装了 puppeteer-core 的目录>/node_modules node docs/change-list-build/shoot-changes.cjs */
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
  await sleep(2200);
}

/** 按可见文字点击（button/a/div/span/td 等都试） */
async function click(page, text, exact = false, scope = '') {
  const ok = await page.evaluate((text, exact, scope) => {
    const root = scope ? document.querySelector(scope) : document;
    if (!root) return false;
    const els = [...root.querySelectorAll('button,a,[role=tab],div,span,li,td,label')];
    const el = els.reverse().find((e) => {
      const t = (e.textContent || '').trim();
      const own = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.includes(text));
      return (exact ? t === text : t.includes(text)) && (own || e.children.length === 0);
    });
    if (el) { (el.closest('button,a,[role=tab],tr,label') || el).click(); return true; }
    return false;
  }, text, exact, scope);
  if (!ok) throw new Error(`点不到「${text}」${scope ? ' @' + scope : ''}`);
  await sleep(1000);
}

/** 按 CSS 选择器点击（文字有歧义时用），可再按包含文字过滤 */
async function clickSel(page, sel, contains = '') {
  const ok = await page.evaluate((sel, contains) => {
    const list = [...document.querySelectorAll(sel)];
    const el = contains ? list.find((e) => (e.textContent || '').includes(contains)) : list[0];
    if (el) { el.click(); return true; }
    return false;
  }, sel, contains);
  if (!ok) throw new Error(`点不到选择器 ${sel}${contains ? ' 含「' + contains + '」' : ''}`);
  await sleep(1000);
}

/** 截某个元素（带留白）；找不到就整页截 */
async function shotEl(page, sel, file, pad = 16) {
  const box = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  }, sel);
  if (!box || box.w < 10) { await page.screenshot({ path: path.join(OUT, file) }); return 'full'; }
  const vp = page.viewport();
  const clip = {
    x: Math.max(0, box.x - pad),
    y: Math.max(0, box.y - pad),
    width: Math.min(vp.width - Math.max(0, box.x - pad), box.w + pad * 2),
    height: Math.min(vp.height - Math.max(0, box.y - pad), box.h + pad * 2),
  };
  await page.screenshot({ path: path.join(OUT, file), clip });
  return 'clip';
}

// ── 任务清单：[文件名, 视口, 步骤函数] ───────────────────────────────
const TASKS = [
  // ═══ 知识产品 KP ═══
  ['kp-unlist-modal.png', D, async (p) => {          // 下架二次确认弹窗
    await go(p, `${ORG}/kps/1`); await click(p, '下架', false, '.kpd-status'); await shotEl(p, '.modal-card', 'kp-unlist-modal.png');
  }],
  ['kp-delete-modal.png', D, async (p) => {          // 删除弹窗（有业务关系，带人数）
    await go(p, `${ORG}/kps/1`); await click(p, '删除', false, '.kpd-status'); await shotEl(p, '.modal-card', 'kp-delete-modal.png');
  }],
  ['kp-publish-modal.png', D, async (p) => {         // 草稿的发布确认
    await go(p, `${ORG}/kps/2`); await click(p, '发布', false, '.kpd-status'); await shotEl(p, '.modal-card', 'kp-publish-modal.png');
  }],
  ['kp-list-status.png', D, async (p) => { await go(p, `${ORG}/kps`); }],   // 列表状态标+来源标
  ['kp-detail-unlisted.png', D, async (p) => { await go(p, `${ORG}/kps/5`); }], // 已下架态+重新发布
  ['h5-books-tags.png', M, async (p) => { await go(p, `${H5}/me/books`); }],     // 纸书下架/失效标签
  ['h5-books-toast.png', M, async (p) => {           // 点已下架纸书 → 拦截提示
    await go(p, `${H5}/me/books`); await click(p, '围手术期麻醉管理精要'); await sleep(400);
  }],
  ['h5-yongxiang-dead.png', M, async (p) => { await go(p, `${H5}/me/yongxiang`); }],
  ['h5-kpgate-off.png', M, async (p) => { await go(p, `${H5}/kp/kp_anesthesia`); }],
  ['h5-kpgate-dead.png', M, async (p) => { await go(p, `${H5}/kp/kp_ultrasound_old`); }],

  // ═══ 会员与付费 ═══
  ['h5-member.png', M, async (p) => { await go(p, `${H5}/member`); }],
  ['h5-member-block.png', M, async (p) => {          // 未勾协议点开通 → 拦截提示
    await go(p, `${H5}/member`); await click(p, '开通连续包月'); await sleep(400);
  }],
  ['org-sys-price.png', D, async (p) => { await go(p, `${ORG}/sys`); }],

  // ═══ 订单与退款 ═══
  ['h5-orders-filter.png', M, async (p) => { await go(p, `${H5}/me/orders`); }],
  ['h5-order-refund.png', M, async (p) => {          // 订单详情的退款记录卡片
    await go(p, `${H5}/me/orders`); await clickSel(p, '.order.tap', '退款中');
  }],
  ['org-orders-range.png', D, async (p) => { await go(p, `${ORG}/orders`); }],

  // ═══ 数据看板 ═══
  ['org-board-retention.png', D, async (p) => {      // 留存三卡区域
    await go(p, `${ORG}/board`); await shotEl(p, '.ret-track', 'org-board-retention.png', 999);
  }],
  ['org-board-active.png', D, async (p) => {         // 日活/周活/月活 + 环比
    await go(p, `${ORG}/board`);
    await p.evaluate(() => window.scrollTo(0, 520)); await sleep(700);
  }],

  // ═══ 机构与订阅 ═══
  ['plat-orgs-tag.png', D, async (p) => { await go(p, `${PLAT}/orgs`); }],
  ['plat-org-parent.png', D, async (p) => { await go(p, `${PLAT}/orgs/2`); }],  // 子机构的上级机构字段
  ['plat-sub-delete-modal.png', D, async (p) => {    // 订阅删除确认（带红色强警告）
    await go(p, `${PLAT}/orgs/1`); await click(p, '订阅配额'); await sleep(800);
    await click(p, '删除'); await shotEl(p, '.modal-card', 'plat-sub-delete-modal.png');
  }],
  ['plat-quota-cards.png', D, async (p) => {         // 额度卡：占用量 / 消耗量
    await go(p, `${PLAT}/orgs/1`); await click(p, '订阅配额'); await sleep(800);
    await shotEl(p, '.quota-card', 'plat-quota-cards.png', 999);
  }],

  // ═══ 权限与角色 ═══
  ['plat-roles-nested.png', D, async (p) => {        // Prompt 编辑作为嵌套子项
    await go(p, `${PLAT}/roles`);
    await shotEl(p, '.perm-child-wrap', 'plat-roles-nested.png', 999);
  }],

  // ═══ 导出与兑换码 ═══
  ['plat-export-limit.png', D, async (p) => {        // 导出超限拦截弹窗
    await go(p, `${PLAT}/users`); await clickSel(p, 'button.btn-ghost', '导出'); await sleep(1500);
  }],
  ['org-codes-time.png', D, async (p) => { await go(p, `${ORG}/codes`); }],
  ['h5-redeem-fail.png', M, async (p) => {           // 兑换失败弹窗
    await go(p, `${H5}/me/redeem`);
    await p.evaluate(() => {
      const i = document.querySelector('input');
      if (i) {
        const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        set.call(i, 'EXPIRED');
        i.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await sleep(400); await click(p, '立即兑换'); await sleep(600);
  }],
];

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  let ok = 0; const failed = [];
  for (const [name, vp, run] of TASKS) {
    const page = await browser.newPage();
    await page.setViewport(vp);
    try {
      const before = fs.existsSync(path.join(OUT, name)) ? fs.statSync(path.join(OUT, name)).mtimeMs : 0;
      await run(page);
      // 步骤里没自己截的，兜底整页截
      const after = fs.existsSync(path.join(OUT, name)) ? fs.statSync(path.join(OUT, name)).mtimeMs : 0;
      if (after === before) await page.screenshot({ path: path.join(OUT, name) });
      console.log(`OK   ${name}`);
      ok++;
    } catch (e) {
      console.log(`FAIL ${name} — ${e.message}`);
      failed.push(name);
    }
    await page.close();
  }
  await browser.close();
  console.log(`\n成功 ${ok} / 失败 ${failed.length}${failed.length ? '：' + failed.join(', ') : ''}`);
})();
