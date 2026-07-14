/* 给移动端截图套真·iPhone 样机（刘海+圆角屏+细边框），透明底 PNG → ppt-assets/framed/ */
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const ASSETS = path.resolve(__dirname, '../ppt-assets');
const OUT = path.resolve(ASSETS, 'framed');
fs.mkdirSync(OUT, { recursive: true });
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const files = ['01-chat-welcome', '02-chat-answer', '03-chat-source', '04-mybooks', '05-call'];
const html = (src) => `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{background:transparent}
.device{width:375px;height:812px;background:#1b1b1f;border-radius:62px;padding:14px;position:relative;
  box-shadow: inset 0 0 0 2px #34343a, inset 0 0 0 14px #1b1b1f;}
.screen{width:100%;height:100%;border-radius:48px;overflow:hidden;position:relative;background:#000}
.screen img{width:100%;height:100%;object-fit:cover;display:block}
.notch{position:absolute;top:14px;left:50%;transform:translateX(-50%);width:150px;height:30px;
  background:#1b1b1f;border-bottom-left-radius:18px;border-bottom-right-radius:18px;z-index:3}
</style></head><body>
<div class="device"><div class="screen"><img src="${src}"></div><div class="notch"></div></div>
</body></html>`;
(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  for (const f of files) {
    const p = await b.newPage();
    await p.setViewport({ width: 440, height: 900, deviceScaleFactor: 3 });
    const b64 = 'data:image/png;base64,' + fs.readFileSync(path.join(ASSETS, f + '.png')).toString('base64');
    await p.setContent(html(b64), { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 300));
    const el = await p.$('.device');
    await el.screenshot({ path: path.join(OUT, f + '.png'), omitBackground: true });
    console.log('framed', f);
    await p.close();
  }
  await b.close();
})().catch((e) => { console.log('FAIL', e.message); process.exit(1); });
