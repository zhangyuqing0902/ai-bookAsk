/* AI 问书 · 项目提报 PPT 生成（pptxgenjs）
   配色严格取自设计规范 packages/tokens/src/design/styles.css
   图取自 docs/ppt-assets/*.png  →  输出 docs/AI问书-项目提报.pptx
   QA 模式：SLIDE=n OUTFILE=/path node build.cjs  → 只产该页单页 pptx */
const pptxgen = require('pptxgenjs');
const path = require('path');
const ST = (new pptxgen()).ShapeType;

const A = (f) => path.resolve(__dirname, '../ppt-assets', f);
const OUT = path.resolve(__dirname, '../AI问书-项目提报.pptx');

const C = {
  indigo: '4B57E8', indigoDeep: '3942C9', indigoSoft: 'ECEEFE', night: '262A63',
  coral: 'FF6F55', coralDeep: 'E04A2E', coralSoft: 'FFE9E3', coralLite: 'FF9D8A',
  ink: '171A21', ink2: '586072', ink3: '969DAC',
  paper: 'FBFCFE', canvas: 'EEF1F7', white: 'FFFFFF', line: 'E3E7F0', jade: '15B080',
};
const F = 'PingFang SC';
const SH = { type: 'outer', color: '8B93AE', blur: 7, offset: 3, angle: 90, opacity: 0.4 };
const RM = 375 / 812, RA = 900 / 1440;

const t = (s, o) => ({ text: s, options: { fontFace: F, ...o } });
const W = 13.333;
function mImg(s, f, x, y, h) { const w = h * RM; s.addImage({ path: A(f), x, y, w, h, shadow: SH }); return w; }
function aImg(s, f, x, y, w) { const h = w * RA; s.addImage({ path: A(f), x, y, w, h, shadow: SH }); return h; }
const AF = (f) => path.resolve(__dirname, '../ppt-assets/framed', f);
function fw(h) { return h * RM; }
function phone(s, file, x, y, h) { s.addImage({ path: AF(file), x, y, w: h * RM, h, shadow: SH }); }
function rr(s, x, y, w, h, fill, opt = {}) { s.addShape(ST.roundRect, { x, y, w, h, fill: { color: fill }, line: opt.line || { width: 0 }, rectRadius: opt.r ?? 0.1 }); }
function ell(s, x, y, w, h, fill, tr) { s.addShape(ST.ellipse, { x, y, w, h, fill: { color: fill, transparency: tr }, line: { width: 0 } }); }
function tx(s, str, o) { s.addText(str, { fontFace: F, ...o }); }
function dot(s, x, y, col = C.indigo) { s.addShape(ST.ellipse, { x, y, w: 0.16, h: 0.16, fill: { color: col }, line: { width: 0 } }); }
function iconRow(s, x, y, w, n, head, desc, circ) {
  s.addShape(ST.ellipse, { x, y: y + 0.04, w: 0.52, h: 0.52, fill: { color: circ.bg }, line: { width: 0 } });
  tx(s, n, { x, y: y + 0.04, w: 0.52, h: 0.52, align: 'center', valign: 'middle', fontSize: 17, bold: true, color: circ.fg });
  tx(s, head, { x: x + 0.7, y: y - 0.02, w: w - 0.7, h: 0.34, fontSize: 14.5, bold: true, color: C.ink });
  tx(s, desc, { x: x + 0.7, y: y + 0.32, w: w - 0.7, h: 0.5, fontSize: 11.5, color: C.ink2 });
}

const SLIDES = [];

/* 1 · 封面 */
SLIDES.push((pptx) => {
  const s = pptx.addSlide(); s.background = { color: C.night };
  ell(s, 7.4, -2.2, 8.4, 8.4, '6A5BF6', 62); ell(s, 9.6, 2.4, 7, 7, '9B7BF8', 70); ell(s, -2.2, 3.8, 6, 6, '3D6FF5', 66);
  phone(s, '01-chat-welcome.png', W - 0.85 - fw(6.3), 0.6, 6.3);
  s.addShape(ST.rect, { x: 0.85, y: 1.55, w: 0.32, h: 0.32, fill: { color: C.coral }, line: { width: 0 } });
  tx(s, 'AI 问书', { x: 0.85, y: 1.95, w: 7.5, h: 1.2, fontSize: 56, bold: true, color: C.white });
  tx(s, '让每一本书都能「对话」', { x: 0.88, y: 3.2, w: 7.5, h: 0.7, fontSize: 29, color: 'EDEFFC' });
  tx(s, '答案有出处 · 知识更可信', { x: 0.88, y: 4.15, w: 7.5, h: 0.5, fontSize: 20, bold: true, color: C.coralLite });
  tx(s, '基于出版社自有权威内容的 AI 知识问答平台', { x: 0.88, y: 5.0, w: 7.5, h: 0.45, fontSize: 15.5, color: 'B9BEEA' });
});

/* 2 · 为什么是现在 */
SLIDES.push((pptx) => {
  const s = pptx.addSlide(); s.background = { color: C.paper };
  dot(s, 0.7, 0.66); tx(s, '为什么是现在', { x: 1.0, y: 0.45, w: 9, h: 0.6, fontSize: 34, bold: true, color: C.ink });
  tx(s, '出版社手里有金矿，但读者读完书就走了', { x: 1.0, y: 1.16, w: 10, h: 0.4, fontSize: 15, color: C.ink2 });
  const card = (y, n, head, desc, circ) => {
    rr(s, 0.7, y, 6.4, 1.55, C.white, { line: { color: C.line, width: 1 }, r: 0.12 });
    s.addShape(ST.ellipse, { x: 0.95, y: y + 0.45, w: 0.62, h: 0.62, fill: { color: circ.bg }, line: { width: 0 } });
    tx(s, n, { x: 0.95, y: y + 0.45, w: 0.62, h: 0.62, align: 'center', valign: 'middle', fontSize: 22, bold: true, color: circ.fg });
    tx(s, head, { x: 1.8, y: y + 0.2, w: 5.1, h: 0.4, fontSize: 17, bold: true, color: C.ink });
    tx(s, desc, { x: 1.8, y: y + 0.62, w: 5.15, h: 0.85, fontSize: 12, color: C.ink2, lineSpacingMultiple: 1.05 });
  };
  card(1.78, '1', '内容是「死」的', '权威内容躺在纸书 / PDF 里，读者读完即走 —— 无法持续触达、无法二次利用、无法沉淀读者数据。', { bg: C.coralSoft, fg: C.coralDeep });
  card(3.5, '2', '读者习惯变了', '遇到问题先问 AI。但豆包、元宝答的是「全网拼凑」、会编造，且与你的书无关 —— 读者注意力正流失给别人。', { bg: C.indigoSoft, fg: C.indigoDeep });
  rr(s, 0.7, 5.35, 6.4, 1.25, C.indigoSoft, { r: 0.12 });
  tx(s, '机会', { x: 0.95, y: 5.55, w: 1.0, h: 0.4, fontSize: 15, bold: true, color: C.coralDeep });
  tx(s, '把权威内容变成可随时提问、能回答、还能持续经营的「活」的知识资产。', { x: 0.95, y: 5.9, w: 6.0, h: 0.6, fontSize: 13, bold: true, color: C.indigoDeep, lineSpacingMultiple: 1.05 });
  s.addShape(ST.rightArrow, { x: 7.4, y: 3.4, w: 1.3, h: 0.7, fill: { color: C.coralSoft }, line: { width: 0 } });
  phone(s, '02-chat-answer.png', 9.2 + (3.8 - fw(4.4)) / 2, 1.5, 4.4);
  tx(s, '内容活起来 · 可对话', { x: 9.2, y: 6.25, w: 3.8, h: 0.35, align: 'center', fontSize: 12, bold: true, color: C.indigoDeep });
});

/* 3 · 是什么 */
SLIDES.push((pptx) => {
  const s = pptx.addSlide(); s.background = { color: C.paper };
  dot(s, 0.7, 0.66); tx(s, 'AI 问书是什么', { x: 1.0, y: 0.45, w: 9, h: 0.6, fontSize: 34, bold: true, color: C.ink });
  rr(s, 0.7, 1.25, 11.95, 0.82, C.night, { r: 0.1 });
  tx(s, '把出版社的权威内容，做成  读者可对话 · 机构可运营 · 平台可管控  的 AI 知识问答平台', { x: 0.7, y: 1.25, w: 11.95, h: 0.82, align: 'center', valign: 'middle', fontSize: 16, bold: true, color: C.white });
  const cols = [{ x: 0.7, img: '01-chat-welcome.png', m: true, lab: '读者端 · 移动 H5', d: '扫码 / 链接进入，向「这本书」提问' },
  { x: 4.82, img: '06-org-dashboard.png', m: false, lab: '机构后台', d: '上传内容 · 配置 AI · 运营变现 · 看数据' },
  { x: 8.94, img: '11-plat-dashboard.png', m: false, lab: '平台超管', d: '多机构管理 · 订阅配额 · 全域监管' }];
  const CW = 3.7;
  cols.forEach((c) => {
    rr(s, c.x, 2.3, CW, 3.0, C.white, { line: { color: C.line, width: 1 }, r: 0.12 });
    if (c.m) { phone(s, c.img, c.x + (CW - fw(2.5)) / 2, 2.5, 2.5); }
    else { const w = 3.2; aImg(s, c.img, c.x + (CW - w) / 2, 2.8, w); }
    tx(s, c.lab, { x: c.x, y: 5.45, w: CW, h: 0.36, align: 'center', fontSize: 15, bold: true, color: C.indigoDeep });
    tx(s, c.d, { x: c.x - 0.1, y: 5.82, w: CW + 0.2, h: 0.4, align: 'center', fontSize: 11.5, color: C.ink2 });
  });
  rr(s, 0.7, 6.35, 11.95, 0.55, C.indigoSoft, { r: 0.12 });
  tx(s, '核心能力', { x: 1.0, y: 6.35, w: 1.5, h: 0.55, valign: 'middle', fontSize: 12, bold: true, color: C.coralDeep });
  tx(s, '知识产品库   ·   专属 AI 形象   ·   溯源问答   ·   图音视精讲   ·   纸书扫码   ·   实时语音', { x: 2.5, y: 6.35, w: 10.0, h: 0.55, valign: 'middle', fontSize: 13, bold: true, color: C.indigoDeep });
});

/* 产品演示（视频位） */
SLIDES.push((pptx) => {
  const s = pptx.addSlide(); s.background = { color: C.paper };
  dot(s, 0.7, 0.66); tx(s, '产品演示', { x: 1.0, y: 0.45, w: 9, h: 0.6, fontSize: 32, bold: true, color: C.ink });
  tx(s, '三端真实体验 · 现场可演示（视频位已留好，录制后插入即可）', { x: 1.0, y: 1.16, w: 11, h: 0.4, fontSize: 14, color: C.ink2 });
  const dv = [
    { x: 0.7, lab: '移动端演示', d: '读者扫码提问 · 溯源 · 图音视' },
    { x: 4.74, lab: '机构后台演示', d: '上传知识 · 配置 AI · 运营变现' },
    { x: 8.78, lab: '平台后台演示', d: '多机构管理 · 套餐配额 · 全域监管' },
  ];
  const DW = 3.85;
  dv.forEach((c) => {
    rr(s, c.x, 1.85, DW, 4.55, C.white, { line: { color: C.line, width: 1 }, r: 0.12 });
    rr(s, c.x + 0.25, 2.15, DW - 0.5, 2.95, C.canvas, { r: 0.1 });
    const cx = c.x + DW / 2, cy = 3.62;
    s.addShape(ST.ellipse, { x: cx - 0.45, y: cy - 0.45, w: 0.9, h: 0.9, fill: { color: C.indigo }, line: { width: 0 }, shadow: SH });
    tx(s, '▶', { x: cx - 0.4, y: cy - 0.44, w: 0.9, h: 0.9, align: 'center', valign: 'middle', fontSize: 24, color: C.white });
    tx(s, '此处插入演示视频', { x: c.x + 0.25, y: 4.5, w: DW - 0.5, h: 0.35, align: 'center', fontSize: 12, color: C.ink3 });
    tx(s, c.lab, { x: c.x, y: 5.3, w: DW, h: 0.4, align: 'center', fontSize: 17, bold: true, color: C.indigoDeep });
    tx(s, c.d, { x: c.x + 0.15, y: 5.75, w: DW - 0.3, h: 0.5, align: 'center', fontSize: 12, color: C.ink2 });
  });
});

/* 4 · 核心差异化 */
SLIDES.push((pptx) => {
  const s = pptx.addSlide(); s.background = { color: C.paper };
  dot(s, 0.7, 0.66); tx(s, '和豆包、元宝有什么不同', { x: 1.0, y: 0.45, w: 11, h: 0.6, fontSize: 31, bold: true, color: C.ink });
  tx(s, '通用 AI 什么都答一点；AI 问书只答你的书、答得可信、还帮你持续经营', { x: 1.0, y: 1.14, w: 11, h: 0.4, fontSize: 13.5, color: C.ink2 });
  const hC = { fontFace: F, fontSize: 13, bold: true, color: C.white, fill: { color: C.night }, valign: 'middle', align: 'center' };
  const c0 = { fontFace: F, fontSize: 12, bold: true, color: C.ink2, fill: { color: C.canvas }, valign: 'middle', align: 'center' };
  const c1 = { fontFace: F, fontSize: 11.5, color: C.ink3, fill: { color: C.white }, valign: 'middle' };
  const c2 = { fontFace: F, fontSize: 11.5, bold: true, color: C.indigoDeep, fill: { color: C.indigoSoft }, valign: 'middle' };
  const rows = [
    [t('维度', hC), t('通用 AI（豆包 / 元宝）', hC), t('AI 问书', hC)],
    [t('知识来源', c0), t('全网抓取、来源不明', c1), t('出版社自有权威知识库', c2)],
    [t('答案可信', c0), t('可能编造、无法核对', c1), t('每条答案标注出处，可溯源到章节页码', c2)],
    [t('合规可控', c0), t('不可控', c1), t('严谨模式：未命中只答「暂无资料」，绝不编造', c2)],
    [t('内容形态', c0), t('有图音视，但来自全网、良莠不齐', c1), t('图 / 音 / 视均为出版社权威高价值知识资产', c2)],
    [t('纸数联动', c0), t('无', c1), t('纸书扫码进入 AI 陪伴；溯源还能引导回购纸书', c2)],
    [t('内容变现', c0), t('与出版社无关', c1), t('内容资产的再运营、再商业化，收益沉淀出版社', c2)],
  ];
  s.addTable(rows, { x: 0.7, y: 1.65, w: 8.55, colW: [1.55, 3.1, 3.9], rowH: [0.42, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6], border: { type: 'solid', color: 'FFFFFF', pt: 2 }, margin: [3, 6, 3, 6], autoPage: false });
  phone(s, '03-chat-source.png', 9.55 + (3.2 - fw(3.95)) / 2, 1.65, 3.95);
  tx(s, '答案溯源到具体文件 · 页码', { x: 9.45, y: 5.95, w: 3.4, h: 0.35, align: 'center', fontSize: 11.5, bold: true, color: C.ink2 });
  rr(s, 0.7, 6.4, 11.95, 0.75, C.night, { r: 0.1 });
  tx(s, '通用 AI 帮用户离开你，AI 问书帮读者留在你的内容里。', { x: 0.7, y: 6.4, w: 11.95, h: 0.75, align: 'center', valign: 'middle', fontSize: 16, bold: true, color: C.white });
});

/* 5 · 面向机构 */
SLIDES.push((pptx) => {
  const s = pptx.addSlide(); s.background = { color: C.paper };
  dot(s, 0.7, 0.66); tx(s, '面向机构（出版社）的价值', { x: 1.0, y: 0.45, w: 8.6, h: 0.6, fontSize: 30, bold: true, color: C.ink });
  rr(s, 9.95, 0.5, 0.95, 0.5, C.coralSoft, { r: 0.12 }); tx(s, '重点', { x: 9.95, y: 0.5, w: 0.95, h: 0.5, align: 'center', valign: 'middle', fontSize: 13, bold: true, color: C.coralDeep });
  tx(s, '从「卖一次书」到「持续经营读者」', { x: 1.0, y: 1.16, w: 8, h: 0.4, fontSize: 14, color: C.ink2 });
  const iv = [
    ['1', '内容资产化（多模态）', '文字 · 图片 · 音频 · 视频 全部沉淀为可检索、可调用的知识资产', { bg: C.indigoSoft, fg: C.indigoDeep }],
    ['2', '多元变现', '会员订阅 + 永享内容买断，让沉睡的内容资产持续产生收益', { bg: C.coralSoft, fg: C.coralDeep }],
    ['3', '纸数融合 · 反哺纸书', '纸书印码激活存量；溯源引导回购纸书，为纸书开辟新销售渠道', { bg: C.indigoSoft, fg: C.indigoDeep }],
    ['4', '运营工具箱', '兑换码分发（地推 / 赠品 / 渠道）、品牌外观定制', { bg: C.coralSoft, fg: C.coralDeep }],
    ['5', '经营看得见', '用户画像、提问热词云、营收转化漏斗，反哺选题与运营', { bg: C.indigoSoft, fg: C.indigoDeep }],
    ['6', '质量闭环', '答案反馈工作台，持续迭代知识库，越用越准', { bg: C.coralSoft, fg: C.coralDeep }],
  ];
  iv.forEach((r, i) => iconRow(s, 0.72, 1.85 + i * 0.83, 6.6, r[0], r[1], r[2], r[3]));
  tx(s, '真实后台 · 主控台与数据看板', { x: 7.6, y: 1.5, w: 5.25, h: 0.3, align: 'center', fontSize: 11.5, bold: true, color: C.ink3 });
  aImg(s, '06-org-dashboard.png', 8.05, 1.9, 3.9);
  aImg(s, '07-org-keywords.png', 8.05, 4.5, 3.9);
});

/* 6 · 面向读者 */
SLIDES.push((pptx) => {
  const s = pptx.addSlide(); s.background = { color: C.paper };
  dot(s, 0.7, 0.66); tx(s, '面向读者的价值', { x: 1.0, y: 0.45, w: 9, h: 0.6, fontSize: 32, bold: true, color: C.ink });
  tx(s, '可信 · 沉浸 · 随身', { x: 1.0, y: 1.16, w: 8, h: 0.4, fontSize: 15, bold: true, color: C.coralDeep });
  const rc = [
    { x: 0.7, img: '03-chat-source.png', lab: '可信', d: '答案有出处、标注来源，不怕被误导' },
    { x: 4.74, img: '05-call.png', lab: '沉浸', d: '图音视深度精讲 + 实时语音问答' },
    { x: 8.78, img: '04-mybooks.png', lab: '随身', d: '纸书一扫，整本书随身可问，跨设备同步' },
  ];
  const RCW = 3.85;
  rc.forEach((c) => {
    rr(s, c.x, 1.75, RCW, 4.95, C.white, { line: { color: C.line, width: 1 }, r: 0.12 });
    phone(s, c.img, c.x + (RCW - fw(3.0)) / 2, 2.0, 3.0);
    tx(s, c.lab, { x: c.x, y: 5.35, w: RCW, h: 0.4, align: 'center', fontSize: 18, bold: true, color: C.indigoDeep });
    tx(s, c.d, { x: c.x + 0.2, y: 5.8, w: RCW - 0.4, h: 0.7, align: 'center', fontSize: 12, color: C.ink2, lineSpacingMultiple: 1.05 });
  });
});

/* 7 · 面向平台方 */
SLIDES.push((pptx) => {
  const s = pptx.addSlide(); s.background = { color: C.paper };
  dot(s, 0.7, 0.66); tx(s, '面向平台方的价值', { x: 1.0, y: 0.45, w: 9, h: 0.6, fontSize: 32, bold: true, color: C.ink });
  tx(s, '一套底座：管得住 · 看得清 · 扩得开', { x: 1.0, y: 1.16, w: 8, h: 0.4, fontSize: 14, color: C.ink2 });
  const pv = [
    ['1', '多机构统一管理', '一套后台管所有出版社 + 订阅配额体系', { bg: C.indigoSoft, fg: C.indigoDeep }],
    ['2', '全域监管', 'KP / 订单 / 用户 / 答案反馈 / 模型用量 全可见', { bg: C.coralSoft, fg: C.coralDeep }],
    ['3', '底层模型 + 权限', '统一管理基模 · 角色三态（无 / 只读 / 可操作）', { bg: C.indigoSoft, fg: C.indigoDeep }],
  ];
  pv.forEach((r, i) => iconRow(s, 0.72, 2.15 + i * 1.15, 5.5, r[0], r[1], r[2], r[3]));
  ['多租户', '可监管', '可扩展'].forEach((p, i) => { const x = 0.72 + i * 1.65; rr(s, x, 5.9, 1.5, 0.5, C.indigoSoft, { r: 0.12 }); tx(s, p, { x, y: 5.9, w: 1.5, h: 0.5, align: 'center', valign: 'middle', fontSize: 12.5, bold: true, color: C.indigoDeep }); });
  aImg(s, '09-plat-orgs.png', 6.7, 1.95, 6.0);
  tx(s, '平台超管 · 机构管理（多机构 · 集团-分社）', { x: 6.7, y: 5.85, w: 6.0, h: 0.35, align: 'center', fontSize: 11.5, bold: true, color: C.ink3 });
});

/* 后台核心能力 · 实拍 */
SLIDES.push((pptx) => {
  const s = pptx.addSlide(); s.background = { color: C.paper };
  dot(s, 0.7, 0.66); tx(s, '后台核心能力 · 实拍', { x: 1.0, y: 0.45, w: 11, h: 0.6, fontSize: 30, bold: true, color: C.ink });
  tx(s, '机构运营 + 平台管控，都是已经做出来、开箱即用的成熟能力', { x: 1.0, y: 1.16, w: 11, h: 0.4, fontSize: 14, color: C.ink2 });
  rr(s, 4.3, 1.95, 1.6, 0.42, C.indigoSoft, { r: 0.1 }); tx(s, '机构后台', { x: 4.3, y: 1.95, w: 1.6, h: 0.42, align: 'center', valign: 'middle', fontSize: 12, bold: true, color: C.indigoDeep });
  rr(s, 10.35, 1.95, 1.6, 0.42, C.coralSoft, { r: 0.1 }); tx(s, '平台后台', { x: 10.35, y: 1.95, w: 1.6, h: 0.42, align: 'center', valign: 'middle', fontSize: 12, bold: true, color: C.coralDeep });
  const sc = [
    { x: 0.6, img: '06-org-dashboard.png', lab: '主控台', d: '配额 · 营收 · 活跃一屏掌握', col: C.indigoDeep },
    { x: 3.65, img: '07-org-keywords.png', lab: '数据看板', d: '读者画像 + 提问热点反哺选题', col: C.indigoDeep },
    { x: 6.7, img: '15-org-kp-knowledge.png', lab: '知识 KP', d: '上传即向量化，书变可检索资产', col: C.indigoDeep },
    { x: 9.75, img: '12-plat-new-subscription.png', lab: '套餐配置', d: '为机构配 KP / 存储 / Token 配额', col: C.coralDeep },
  ];
  const IW = 2.8;
  sc.forEach((c) => {
    aImg(s, c.img, c.x, 2.5, IW);
    tx(s, c.lab, { x: c.x, y: 4.35, w: IW, h: 0.34, align: 'center', fontSize: 14, bold: true, color: c.col });
    tx(s, c.d, { x: c.x - 0.06, y: 4.7, w: IW + 0.12, h: 0.6, align: 'center', fontSize: 11, color: C.ink2, lineSpacingMultiple: 1.05 });
  });
  rr(s, 0.6, 5.65, 11.95, 1.05, C.indigoSoft, { r: 0.12 });
  tx(s, '这些不是 PPT 里的设想，而是已跑通的高保真后台 —— 机构上手即用、平台统一管控，落地风险低。', { x: 0.9, y: 5.65, w: 11.4, h: 1.05, valign: 'middle', fontSize: 13.5, bold: true, color: C.indigoDeep });
});

/* 8 · 商业模式 */
SLIDES.push((pptx) => {
  const s = pptx.addSlide(); s.background = { color: C.paper };
  dot(s, 0.7, 0.66); tx(s, '商业模式', { x: 1.0, y: 0.45, w: 9, h: 0.6, fontSize: 32, bold: true, color: C.ink });
  tx(s, '两层收入：出版社经营内容，平台经营订阅 —— 各赚各的、互不抢', { x: 1.0, y: 1.16, w: 11, h: 0.4, fontSize: 14, color: C.ink2 });
  rr(s, 0.7, 1.85, 6.6, 1.95, C.indigoSoft, { r: 0.12 });
  tx(s, 'B 端 · 机构 → 平台', { x: 0.95, y: 2.0, w: 4, h: 0.35, fontSize: 14, bold: true, color: C.indigoDeep });
  tx(s, '平台方收入', { x: 5.0, y: 2.02, w: 2.1, h: 0.32, align: 'right', fontSize: 12, bold: true, color: C.coralDeep });
  s.addText([t('按配额套餐订阅（体验 / 基础 / 专业 / 旗舰 / 定制 / 不限）', { fontSize: 12.5, color: C.ink, bullet: { code: '2022' }, breakLine: true }),
  t('用量不够买「加油包」即时加量', { fontSize: 12.5, color: C.ink, bullet: { code: '2022' } })], { x: 1.0, y: 2.5, w: 6.1, h: 1.1, lineSpacingMultiple: 1.15 });
  rr(s, 0.7, 4.0, 6.6, 1.95, C.coralSoft, { r: 0.12 });
  tx(s, 'C 端 · 读者 → 机构', { x: 0.95, y: 4.15, w: 4, h: 0.35, fontSize: 14, bold: true, color: C.coralDeep });
  tx(s, '出版社收入', { x: 5.0, y: 4.17, w: 2.1, h: 0.32, align: 'right', fontSize: 12, bold: true, color: C.indigoDeep });
  s.addText([t('会员订阅 + 永享内容买断', { fontSize: 12.5, color: C.ink, bullet: { code: '2022' }, breakLine: true }),
  t('兑换码作运营分发工具（地推 / 赠品 / 渠道）', { fontSize: 12.5, color: C.ink, bullet: { code: '2022' } })], { x: 1.0, y: 4.65, w: 6.1, h: 1.1, lineSpacingMultiple: 1.15 });
  rr(s, 0.7, 6.15, 6.6, 0.95, C.canvas, { r: 0.1 });
  tx(s, '定价逻辑：内容变现收益归属出版社，平台只收订阅服务费；读者侧收益完整沉淀在出版社自有经营体系内。', { x: 0.95, y: 6.2, w: 6.1, h: 0.85, valign: 'middle', fontSize: 11.5, color: C.ink2, lineSpacingMultiple: 1.05 });
  aImg(s, '12-plat-new-subscription.png', 7.55, 2.05, 5.3);
  tx(s, '平台为机构配置 6 档套餐 · KP / 存储 / Token', { x: 7.55, y: 5.5, w: 5.3, h: 0.35, align: 'center', fontSize: 11.5, bold: true, color: C.ink3 });
});

/* 9 · 开发计划 */
SLIDES.push((pptx) => {
  const s = pptx.addSlide(); s.background = { color: C.paper };
  dot(s, 0.7, 0.66); tx(s, '开发计划', { x: 1.0, y: 0.45, w: 9, h: 0.6, fontSize: 32, bold: true, color: C.ink });
  tx(s, '三端一次性整体开发上线（不分期）', { x: 1.0, y: 1.16, w: 9, h: 0.4, fontSize: 14, color: C.ink2 });
  const kC = { fontFace: F, fontSize: 14, bold: true, color: C.white, fill: { color: C.night }, valign: 'middle', align: 'center' };
  const vC = { fontFace: F, fontSize: 13.5, color: C.ink, fill: { color: C.white }, valign: 'middle' };
  const vT = { fontFace: F, fontSize: 13.5, bold: true, color: C.coralDeep, fill: { color: C.coralSoft }, valign: 'middle' };
  const krows = [
    [t('研发范围', kC), t('三端（移动 H5 + 机构后台 + 平台超管）一次性整体开发上线', vC)],
    [t('整体研发工期', kC), t('待补充', vT)],
    [t('计划上线日期', kC), t('待补充', vT)],
    [t('当前进度', kC), t('已完成完整 PRD + 三端高保真可交互原型', vC)],
  ];
  s.addTable(krows, { x: 0.7, y: 2.25, w: 12.0, colW: [2.6, 9.4], rowH: 0.5, border: { type: 'solid', color: 'FFFFFF', pt: 2.5 }, margin: [12, 14, 12, 14] });
  rr(s, 0.7, 4.85, 12.0, 1.35, C.indigoSoft, { r: 0.12 });
  tx(s, '本页留白', { x: 1.0, y: 5.02, w: 3, h: 0.4, fontSize: 16, bold: true, color: C.indigoDeep });
  tx(s, '由你补充：整体研发工期 · 计划上线日期 · 研发预算', { x: 1.0, y: 5.5, w: 11, h: 0.5, fontSize: 14, color: C.indigoDeep });
  tx(s, '评审通过即进入开发。', { x: 0.72, y: 6.5, w: 9, h: 0.4, fontSize: 13.5, bold: true, color: C.ink2 });
});

/* 10 · 结尾 */
SLIDES.push((pptx) => {
  const s = pptx.addSlide(); s.background = { color: C.night };
  ell(s, 8.5, -2.5, 8, 8, '6A5BF6', 66); ell(s, -2.5, 3.5, 6.5, 6.5, '3D6FF5', 70);
  tx(s, '原型已就绪，只差临门一脚', { x: 0.85, y: 0.85, w: 11.6, h: 0.9, fontSize: 36, bold: true, color: C.white });
  const cl = [
    ['已完成', '完整 PRD（V1.0.0 + 205 页清单）+ 三端高保真可交互原型'],
    ['回报逻辑', '内容 → 资产　·　一次性销售 → 持续变现　·　读者流失 → 读者留存'],
    ['下一步', '① 确认首批试点 KP　　② 启动开发　　③ 排定上线时间表'],
  ];
  cl.forEach((r, i) => {
    const y = 2.3 + i * 1.05;
    rr(s, 0.85, y, 1.85, 0.55, C.coral, { r: 0.1 });
    tx(s, r[0], { x: 0.85, y, w: 1.85, h: 0.55, align: 'center', valign: 'middle', fontSize: 15, bold: true, color: C.white });
    tx(s, r[1], { x: 2.95, y, w: 9.6, h: 0.55, valign: 'middle', fontSize: 14.5, color: 'E7E9FB' });
  });
  tx(s, '答案有出处 · 知识更可信', { x: 0.85, y: 6.2, w: 11.6, h: 0.6, align: 'center', fontSize: 26, bold: true, color: C.coralLite });
});

function makeDeck(indices) {
  const pptx = new pptxgen();
  pptx.defineLayout({ name: 'W', width: 13.333, height: 7.5 });
  pptx.layout = 'W';
  indices.forEach((i) => SLIDES[i](pptx));
  return pptx;
}

(async () => {
  if (process.env.SLIDE) {
    const i = (+process.env.SLIDE) - 1;
    await makeDeck([i]).writeFile({ fileName: process.env.OUTFILE });
    console.log('SLIDE', process.env.SLIDE, '→', process.env.OUTFILE);
  } else {
    await makeDeck([...Array(SLIDES.length).keys()]).writeFile({ fileName: OUT });
    console.log('SAVED →', OUT);
  }
})();
