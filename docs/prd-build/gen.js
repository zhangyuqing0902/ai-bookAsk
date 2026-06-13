// 生成 PRD 配图：输出 figs/figN.html（独立页面，便于 Chrome 截图为 PNG）
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'figs');
fs.mkdirSync(OUT, { recursive: true });

const C = {
  indigo: '#4f46e5', indigoDeep: '#3730a3', indigoSoft: '#eef0fb', indigoSoft2: '#e3e6fb',
  amber: '#ff7a5c', amberSoft: '#fff1ec', amberInk: '#c2410c',
  jade: '#15b080', jadeSoft: '#e7f7f1', jadeInk: '#0f7a59',
  ink: '#14182a', ink2: '#5b6178', ink3: '#9aa0b4',
  line: '#e3e5ee', soft: '#f6f7fb', white: '#fff',
};
const FONT = "'PingFang SC','Noto Sans SC',system-ui,-apple-system,'Microsoft YaHei',sans-serif";
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const CSS = `
*{box-sizing:border-box}
body{margin:0;font-family:${FONT};background:#fff;color:${C.ink};-webkit-font-smoothing:antialiased}
.wrap{display:inline-block;padding:30px 32px;background:#fff;min-width:200px}
.fig-title{font-size:20px;font-weight:800;margin:0 0 4px;letter-spacing:.3px}
.fig-sub{font-size:13px;color:${C.ink3};margin:0 0 22px}
.layer{display:flex;align-items:stretch;gap:14px;margin-bottom:13px}
.layer-label{flex:0 0 104px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;font-size:13px;font-weight:700;color:${C.indigoDeep};background:${C.indigoSoft};border-radius:10px;padding:8px 6px;line-height:1.4}
.layer-body{flex:1;display:flex;gap:12px}
.lb-box{flex:1;border:1.5px solid ${C.line};border-radius:12px;padding:13px 15px;background:#fff}
.lb-box.full{flex:1}
.lb-box .t{font-weight:700;font-size:14.5px}
.lb-box .s{font-size:12px;color:${C.ink2};margin-top:5px;line-height:1.6}
.lb-box .port{font-size:11px;color:${C.indigo};font-weight:700;font-family:'DM Mono',ui-monospace,monospace;margin-left:6px}
.accent-i{border-left:5px solid ${C.indigo}!important}
.accent-a{border-left:5px solid ${C.amber}!important}
.accent-j{border-left:5px solid ${C.jade}!important}
.flow{display:flex;flex-wrap:wrap;align-items:stretch;gap:0;max-width:1110px}
.step{position:relative;border:1.5px solid ${C.line};border-radius:12px;padding:11px 13px;background:#fff;width:158px;margin:7px 0;display:flex;flex-direction:column;justify-content:center}
.step .st-t{font-weight:700;font-size:13.5px;line-height:1.35}
.step .st-s{font-size:11.5px;color:${C.ink2};margin-top:4px;line-height:1.5}
.conn{display:flex;align-items:center;color:#c2c7ee;font-size:20px;font-weight:800;padding:0 7px}
.legend{margin-top:20px;font-size:12px;color:${C.ink2};display:flex;gap:20px;flex-wrap:wrap;align-items:center}
.dot{display:inline-block;width:11px;height:11px;border-radius:3px;margin-right:7px;vertical-align:middle}
.note{margin-top:16px;font-size:12px;color:${C.ink2};background:${C.soft};border-radius:8px;padding:11px 13px;max-width:1040px;line-height:1.65}
.note b{color:${C.ink}}
.rel{margin-top:18px;font-size:12.5px;color:${C.ink2};line-height:1.95;max-width:1240px;columns:2;column-gap:40px}
.rel b{color:${C.indigoDeep}}
`;

function page(title, sub, inner, w) {
  return `<!doctype html><html lang="zh"><head><meta charset="utf-8"><style>${CSS}
  ${w ? `.wrap{width:${w}px}` : ''}</style></head><body><div class="wrap">
  <div class="fig-title">${esc(title)}</div><div class="fig-sub">${esc(sub)}</div>
  ${inner}</div></body></html>`;
}

// ---------- SVG 工具 ----------
function svg(w, h, body, defs = '') {
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" font-family="${FONT}"><defs>
  <marker id="arr" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 z" fill="${C.indigo}"/></marker>
  <marker id="arrG" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 z" fill="${C.ink3}"/></marker>
  <marker id="arrJ" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 z" fill="${C.jade}"/></marker>
  <marker id="arrA" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 z" fill="${C.amber}"/></marker>
  ${defs}</defs>${body}</svg>`;
}
function T(x, y, t, o = {}) {
  return `<text x="${x}" y="${y}" font-size="${o.size || 13}" fill="${o.fill || C.ink}" font-weight="${o.weight || 400}" text-anchor="${o.anchor || 'start'}">${esc(t)}</text>`;
}
function box(x, y, w, h, o = {}) {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r ?? 11}" fill="${o.fill || '#fff'}" stroke="${o.stroke || C.line}" stroke-width="${o.sw || 1.5}"/>`;
  if (o.accent) s += `<rect x="${x}" y="${y}" width="5" height="${h}" rx="2.5" fill="${o.accent}"/>`;
  return s;
}
function node(x, y, w, h, title, sub, o = {}) {
  let s = box(x, y, w, h, o);
  const cy = sub ? y + h / 2 - 4 : y + h / 2 + 5;
  s += T(x + w / 2, cy, title, { anchor: 'middle', size: o.size || 14, weight: 700, fill: o.tcolor || C.ink });
  if (sub) {
    const arr = Array.isArray(sub) ? sub : [sub];
    s += arr.map((l, i) => T(x + w / 2, y + h / 2 + 14 + i * 15, l, { anchor: 'middle', size: 11.5, fill: C.ink2 })).join('');
  }
  return s;
}
function diamond(cx, cy, w, h, label, o = {}) {
  const p = `${cx},${cy - h / 2} ${cx + w / 2},${cy} ${cx},${cy + h / 2} ${cx - w / 2},${cy}`;
  let s = `<polygon points="${p}" fill="${o.fill || C.indigoSoft}" stroke="${o.stroke || C.indigo}" stroke-width="1.5"/>`;
  const arr = Array.isArray(label) ? label : [label];
  const baseY = cy + 5 - (arr.length - 1) * 8;
  s += arr.map((l, i) => T(cx, baseY + i * 16, l, { anchor: 'middle', size: 12.5, weight: 600, fill: C.indigoDeep })).join('');
  return s;
}
function edge(pts, o = {}) {
  const d = 'M' + pts.map((p) => p.join(',')).join(' L');
  const mk = o.marker === false ? '' : `marker-end="url(#${o.mk || 'arr'})"`;
  const dash = o.dash ? `stroke-dasharray="${o.dash}"` : '';
  return `<path d="${d}" stroke="${o.color || C.indigo}" stroke-width="${o.w || 2}" fill="none" ${mk} ${dash}/>`;
}
function lbl(x, y, t, o = {}) {
  const w = [...String(t)].reduce((a, ch) => a + (/[\x00-\xff]/.test(ch) ? 7 : 13), 0) + 14;
  return `<rect x="${x - w / 2}" y="${y - 9}" width="${w}" height="17" rx="4" fill="#fff" opacity="0.92"/>` + T(x, y + 3.5, t, { anchor: 'middle', size: 11, weight: 700, fill: o.fill || C.ink3 });
}

const figs = {};

// ============ FIG 1：三端业务架构（业务视角，非技术工程） ============
figs[1] = page('图 1 · 三端业务架构', 'AI 问书 围绕「内容资产 → 知识变现」的三端业务全景', `
<div class="layer">
  <div class="layer-label">使用者</div>
  <div class="layer-body">
    <div class="lb-box accent-i"><div class="t">C 端读者</div><div class="s">扫书后封底二维码 / 链接进入，向书提问</div></div>
    <div class="lb-box accent-i"><div class="t">机构运营</div><div class="s">出版社编辑 / 运营 / 客服 / 财务</div></div>
    <div class="lb-box accent-i"><div class="t">平台超管</div><div class="s">平台运营方，统管机构与大模型</div></div>
  </div>
</div>
<div class="layer">
  <div class="layer-label">三端应用</div>
  <div class="layer-body">
    <div class="lb-box accent-j"><div class="t">机构前台 H5</div><div class="s">AI 问答 · 多模态答案 · 内容溯源 · 付费墙 · 会员 / 永享 · 实时语音</div></div>
    <div class="lb-box accent-j"><div class="t">机构后台</div><div class="s">内容 KP 化 · Agent 人设 · 知识库 · 定价权益 · 二维码 · 经营看板 · 用户管理</div></div>
    <div class="lb-box accent-j"><div class="t">平台超管</div><div class="s">机构管理 · 账户与角色 · 大模型配置 · 数据中心 · 全局策略</div></div>
  </div>
</div>
<div class="layer">
  <div class="layer-label">业务能力</div>
  <div class="layer-body">
    <div class="lb-box full"><div class="t">支撑三端的核心业务能力</div><div class="s">AI 智能问答　·　知识库检索与溯源　·　内容变现（会员订阅 / 永享买断 / 兑换码）　·　二维码触达与绑定　·　数据经营与看板　·　Agent 人设　·　多机构与上下级管理</div></div>
  </div>
</div>
<div class="layer">
  <div class="layer-label">业务闭环</div>
  <div class="layer-body">
    <div class="lb-box full accent-a"><div class="t">内容变现价值流</div><div class="s">内容资产　→　KP 化加工　→　二维码触达读者　→　AI 问答互动　→　触发付费转化　→　机构收益（资金直达机构账户）</div></div>
  </div>
</div>
<div class="layer">
  <div class="layer-label">外部协作</div>
  <div class="layer-body">
    <div class="lb-box"><div class="t">微信</div><div class="s">登录授权 · 微信支付</div></div>
    <div class="lb-box"><div class="t">大模型 LLM</div><div class="s">平台默认 / 机构自配</div></div>
    <div class="lb-box"><div class="t">联网检索</div><div class="s">受机构联网开关约束</div></div>
  </div>
</div>
`, 1180);

// ============ FIG 2：业务实体关系（中文，偏业务） ============
(function () {
  const W = 1200, H = 660;
  let b = '';
  b += `<rect x="20" y="60" width="${W - 40}" height="138" rx="14" fill="${C.indigoSoft}" opacity="0.5"/>`;
  b += `<rect x="20" y="214" width="${W - 40}" height="138" rx="14" fill="${C.jadeSoft}" opacity="0.55"/>`;
  b += `<rect x="20" y="368" width="${W - 40}" height="256" rx="14" fill="${C.amberSoft}" opacity="0.6"/>`;
  b += T(36, 84, '机构域', { size: 12, weight: 800, fill: C.indigoDeep });
  b += T(36, 238, '内容域', { size: 12, weight: 800, fill: C.jadeInk });
  b += T(36, 392, '读者与交易域', { size: 12, weight: 800, fill: C.amberInk });
  const ew = 200, eh = 56;
  const ent = (x, y, name, sub, ac) => { const s = node(x, y, ew, eh, name, sub, { accent: ac, r: 10 }); return { s, x, y, cx: x + ew / 2, cy: y + eh / 2, r: x + ew, b: y + eh }; };
  const Org = ent(50, 100, '机构', '出版机构 / 租户', C.indigo);
  const Acc = ent(370, 100, '机构账户', '后台登录账号', C.indigo);
  const Role = ent(690, 100, '角色 / 权限', '决定可操作范围', C.indigo);
  const KP = ent(50, 254, '知识产品 KP', '内容变现单元', C.jade);
  const File = ent(370, 254, '知识文件', '文档 / 图 / 音 / 视', C.jade);
  const Qr = ent(690, 254, '二维码包', '印书触达读者', C.jade);
  const User = ent(50, 410, '读者用户', '扫码进入的读者', C.amber);
  const Mem = ent(370, 410, '会员', '订阅权益', C.amber);
  const Grant = ent(690, 410, '永享授权', '按 KP 买断解锁', C.amber);
  const Order = ent(970, 410, '订单', '会员/永享/兑换码', C.amber);
  const Conv = ent(370, 540, '会话', '一次 AI 问答对话', C.amber);
  [Org, Acc, Role, KP, File, Qr, User, Mem, Grant, Order, Conv].forEach((e) => (b += e.s));
  // 机构域
  b += edge([[Org.r, Org.cy], [Acc.x, Acc.cy]], { w: 1.6 }); b += lbl((Org.r + Acc.x) / 2, Org.cy - 8, '一对多');
  b += edge([[Role.x, Role.cy], [Acc.r, Acc.cy]], { w: 1.6 }); b += lbl((Role.x + Acc.r) / 2, Role.cy - 8, '一对多');
  // 机构 → KP / 读者
  b += edge([[Org.cx, Org.b], [KP.cx, KP.y]], { w: 1.6, mk: 'arrJ', color: C.jade }); b += lbl(Org.cx, (Org.b + KP.y) / 2, '一对多');
  b += edge([[Org.x, Org.cy], [34, Org.cy], [34, User.cy], [User.x, User.cy]], { w: 1.6, mk: 'arrA', color: C.amber }); b += lbl(34, (Org.cy + User.cy) / 2, '一对多');
  // KP → 文件 / 二维码包
  b += edge([[KP.r, KP.cy], [File.x, File.cy]], { w: 1.6, mk: 'arrJ', color: C.jade }); b += lbl((KP.r + File.x) / 2, KP.cy - 8, '一对多');
  b += edge([[KP.cx, KP.b], [KP.cx, 332], [Qr.cx, 332], [Qr.cx, Qr.b]], { w: 1.6, mk: 'arrJ', color: C.jade }); b += lbl((KP.cx + Qr.cx) / 2, 332, '一对多');
  // 读者域
  b += edge([[User.r, User.cy], [Mem.x, Mem.cy]], { w: 1.6, mk: 'arrA', color: C.amber }); b += lbl((User.r + Mem.x) / 2, User.cy - 8, '一对一');
  b += edge([[190, User.b], [190, 492], [Grant.cx, 492], [Grant.cx, Grant.b]], { w: 1.6, mk: 'arrA', color: C.amber }); b += lbl(470, 492, '一对多 · 购买');
  b += edge([[Grant.cx, Grant.y], [Grant.cx, 360], [220, 360], [220, KP.b]], { w: 1.6, mk: 'arrJ', color: C.jade, dash: '5 4' }); b += lbl(Grant.cx, 395, '多对一 · 解锁');
  b += edge([[User.cx, User.y], [User.cx, 392], [Order.cx, 392], [Order.cx, Order.y]], { w: 1.6, mk: 'arrA', color: C.amber }); b += lbl(620, 392, '一对多');
  b += edge([[110, User.b], [110, Conv.cy], [Conv.x, Conv.cy]], { w: 1.6, mk: 'arrA', color: C.amber }); b += lbl(110, 510, '一对多');
  figs[2] = page('图 2 · 业务实体关系', '从业务视角呈现核心对象及其关系，按机构域 / 内容域 / 读者与交易域分组', svg(W, H, b)
    + `<div class="rel">
    <div>一个<b>机构</b>拥有多个<b>机构账户</b>，每个账户对应一种<b>角色 / 权限</b></div>
    <div>一个<b>机构</b>拥有多个<b>知识产品 KP</b> 与多个<b>读者用户</b></div>
    <div>一个<b>知识产品 KP</b> 包含多个<b>知识文件</b>、可生成多个<b>二维码包</b></div>
    <div>一个<b>读者用户</b>对应一份<b>会员</b>权益、可有多笔<b>订单</b>与多次<b>会话</b></div>
    <div>一个<b>读者用户</b>可购买多条<b>永享授权</b>，每条永享授权解锁某个<b>知识产品 KP</b></div>
    <div>资金来自读者的会员订阅 / 永享买断 / 兑换码核销，全部归属机构</div>
  </div>`, W + 64);
})();

// ============ FIG 3：C 端读者付费旅程 ============
function flowSteps(steps) {
  return '<div class="flow">' + steps.map((s) => {
    if (s === '>') return '<div class="conn">›</div>';
    if (s === '\\n') return '<div style="flex-basis:100%;height:0"></div>';
    const ac = s.ac ? ` accent-${s.ac}` : '';
    return `<div class="step${ac}"><div class="st-t">${esc(s.t)}</div>${s.s ? `<div class="st-s">${esc(s.s)}</div>` : ''}</div>`;
  }).join('') + '</div>';
}
figs[3] = page('图 3 · 关键旅程 A：C 端读者「扫码 → 提问 → 付费 → 解锁」', '前台 H5 金链条；决策点以橙色标注', flowSteps([
  { t: '扫码 / 链接进入', s: '带 KP 标识', ac: 'i' }, '>',
  { t: '落地页', s: 'icon + slogan + 登录' }, '>',
  { t: '微信授权 / 手机号登录', s: '游客可只读浏览', ac: 'a' }, '>',
  { t: '绑定 / 合并手机号', s: '可「暂不绑定」' }, '>',
  { t: 'AI 会话页', s: 'Agent 形象 + 3 条入门示例' }, '\\n',
  { t: '输入提问', s: '文字 / 语音；深度思考·智能搜索开关' }, '>',
  { t: '流式答案', s: '打字机 + 多模态卡 + 溯源 + 追问' }, '>',
  { t: '点受限内容锁', s: '会员视频 / 永享音频', ac: 'a' }, '>',
  { t: '付费墙', s: '会员 / 永享 / 兑换码', ac: 'a' }, '>',
  { t: '微信支付过场', s: '收银台确认' }, '\\n',
  { t: '支付成功页', s: '品牌质感对勾' }, '>',
  { t: '返回原会话 · 解锁', s: '锁标消失，权益即时生效', ac: 'j' }, '>',
  { t: '我的', s: '会员中心 / 永享 / 订单 / 历史' }, '>',
  { t: '实时电话语音', s: '会员专属', ac: 'i' },
]) + `<div class="note"><b>权益即时性：</b>支付成功写入会员权益或永享授权后，返回的正是发起支付的那个会话（非新会话），同一张卡片锁标立即消失。<b>游客补发：</b>未登录时输入的问题，登录成功后自动补发并触发回答。</div>`, 1180);

// ============ FIG 4：机构建 KP 旅程 ============
figs[4] = page('图 4 · 关键旅程 B：机构运营「建 KP → 上传 → 定价 → 发布」', '机构后台金链条；KP 检索生效需「已发布 ∧ 已向量化 ∧ 已上架」三条件叠加', flowSteps([
  { t: '新建 KP', s: '填名称等基础字段', ac: 'i' }, '>',
  { t: '基础信息', s: '封面9:16 / 简介 / 纸书链接 / 绑 Agent' }, '>',
  { t: '上传知识文件', s: '文档/图/音/视；设切片方式' }, '>',
  { t: '解析 · 向量化', s: '音视频先提字幕；失败可重试' }, '>',
  { t: '文件上架', s: '仅上架文件参与检索', ac: 'j' }, '\\n',
  { t: '定价与权益', s: '免费 ⇄ 会员（互斥）' }, '>',
  { t: '永享单价', s: '按图/音/视条目设价', ac: 'a' }, '>',
  { t: '生成二维码包', s: '无权益 / 首扫绑定后扫引导' }, '>',
  { t: '发布 KP', s: '前置：≥1 文件已向量化', ac: 'i' }, '>',
  { t: '前台检索生效', s: 'C 端问答可命中该 KP', ac: 'j' },
]) + `<div class="note"><b>向量化与发布解耦：</b>文件上传即向量化；KP「已发布」前置条件为至少一份文件「已向量化」，否则发布按钮置灰。<b>跨机构分享：</b>实时同步 / 独立快照两种模式，接收方对实时同步 KP 只读但可用于检索。</div>`, 1180);

// ============ FIG 5：平台开机构旅程 ============
figs[5] = page('图 5 · 关键旅程 C：平台超管「建机构 → 配参数 → 监测」', '平台超管金链条；上级机构仅允许一层（上级机构 → 下级机构）', flowSteps([
  { t: '新建机构', s: '名称 / 上级机构 / LLM 配置', ac: 'i' }, '>',
  { t: '选上级机构', s: '下拉仅列顶级机构', ac: 'a' }, '>',
  { t: 'LLM 配置', s: '平台默认 / 自配厂商' }, '>',
  { t: '联网配置', s: '总开关，约束前台智能搜索' }, '>',
  { t: '微信支付配置', s: '商户号 / 证书 / APIv3 密钥' }, '\\n',
  { t: '机构账户管理', s: '建账户，所属机构自动推断上级' }, '>',
  { t: '角色与权限', s: 'Agent 回答 Prompt 等权限点' }, '>',
  { t: '机构状态联动', s: '正常 / 停用（前后台拦截）', ac: 'a' }, '>',
  { t: '用量看板监测', s: '活跃/内容/商业化/LLM 用量', ac: 'j' },
]) + `<div class="note"><b>上级机构关系：</b>机构自带可空的「上级机构」字段（parentId 父级 ID 自引用），为空即顶级机构。仅允许一层：仅顶级机构可被选为上级；已有下级的机构不可再设上级；不可选自己——杜绝多层套娃与自环。<b>上级机构账户</b>登录后仅见「主控台」，对关联机构汇总查看 + 只读下钻。</div>`, 1180);

// ============ FIG 6：媒体资源权益判定（全中文） ============
(function () {
  const W = 1000, H = 560;
  let b = '';
  b += node(W / 2 - 160, 24, 320, 56, '用户点击媒体资源', '判断资源类型与用户权益', { accent: C.indigo });
  b += edge([[W / 2, 80], [W / 2, 112]]);
  const d1 = { cx: W / 2, cy: 150 };
  b += diamond(d1.cx, d1.cy, 240, 80, '是「免费」内容？');
  b += edge([[d1.cx + 120, d1.cy], [820, d1.cy]], { mk: 'arrJ', color: C.jade }); b += lbl(720, d1.cy - 10, '是', { fill: C.jadeInk });
  b += node(820, d1.cy - 26, 160, 52, '✓ 解锁', '任意用户可看', { accent: C.jade, tcolor: C.jadeInk });
  b += edge([[d1.cx, d1.cy + 40], [d1.cx, 232]]); b += lbl(d1.cx, 212, '否', { fill: C.ink3 });
  const d2 = { cx: W / 2, cy: 272 };
  b += diamond(d2.cx, d2.cy, 240, 80, '是「会员」内容？');
  b += edge([[d2.cx + 120, d2.cy], [d2.cx + 230, d2.cy]], { mk: 'arr' }); b += lbl(d2.cx + 175, d2.cy - 10, '是', { fill: C.indigoDeep });
  const d2b = { cx: 840, cy: 272 };
  b += diamond(d2b.cx, d2b.cy, 250, 88, ['用户当前是', 'AI 会员？']);
  b += edge([[d2b.cx, d2b.cy - 44], [d2b.cx, 190], [905, 190], [905, 179]], { mk: 'arrJ', color: C.jade }); b += lbl(d2b.cx, 214, '是 → ✓ 解锁', { fill: C.jadeInk });
  b += edge([[d2b.cx, d2b.cy + 44], [d2b.cx, 404]], { mk: 'arrA', color: C.amber }); b += lbl(d2b.cx, 384, '否', { fill: C.amberInk });
  b += node(d2b.cx - 115, 404, 230, 56, '✗ 会员付费墙', '引导开通 AI 会员', { accent: C.amber, tcolor: C.amberInk });
  b += edge([[d2.cx, d2.cy + 40], [d2.cx, 360]]); b += lbl(d2.cx, 338, '否（即「永享」内容）', { fill: C.ink3 });
  const d3 = { cx: W / 2, cy: 402 };
  b += diamond(d3.cx, d3.cy, 270, 82, ['已购买该 KP', '永享买断？']);
  b += edge([[d3.cx - 135, d3.cy], [120, d3.cy], [120, d1.cy], [d1.cx - 122, d1.cy]], { mk: 'arrJ', color: C.jade }); b += lbl(120, (d3.cy + d1.cy) / 2, '是 → ✓ 解锁', { fill: C.jadeInk });
  b += edge([[d3.cx, d3.cy + 41], [d3.cx, 494]], { mk: 'arrA', color: C.amber }); b += lbl(d3.cx, 474, '否', { fill: C.amberInk });
  b += node(d3.cx - 135, 494, 270, 52, '✗ 永享付费墙（按单价）', '永久解锁该单条内容', { accent: C.amber, tcolor: C.amberInk });
  figs[6] = page('图 6 · 业务规则：媒体资源权益判定', '前台每次点击受限媒体时执行；免费内容任意可看，会员内容看会员身份，永享内容看是否买断该 KP', svg(W, H, b)
    + `<div class="note"><b>说明：</b>「免费」内容对任意用户开放；「会员」内容仅 AI 会员可看；「永享」内容按知识产品 KP 维度买断，跨 KP 不通用。未满足条件即弹出对应付费墙引导购买。</div>`, W + 64);
})();

// ============ FIG 7：订单状态机 ============
(function () {
  const W = 1040, H = 380;
  let b = '';
  b += node(40, 162, 170, 56, 'pending', '待支付', { accent: C.ink3, tcolor: C.ink2 });
  const paid = node(420, 60, 170, 56, 'paid', '已支付', { accent: C.jade, tcolor: C.jadeInk });
  const canceled = node(420, 162, 170, 56, 'canceled', '已取消', { accent: C.ink3, tcolor: C.ink2 });
  const failed = node(420, 264, 170, 56, 'failed', '支付失败', { accent: C.amber, tcolor: C.amberInk });
  b += paid + canceled + failed;
  b += edge([[210, 178], [320, 90], [420, 90]], { mk: 'arrJ', color: C.jade }); b += lbl(300, 120, '支付成功', { fill: C.jadeInk });
  b += edge([[210, 190], [420, 190]], { mk: 'arrG', color: C.ink3 }); b += lbl(315, 180, '用户取消', { fill: C.ink3 });
  b += edge([[210, 202], [320, 292], [420, 292]], { mk: 'arrA', color: C.amber }); b += lbl(300, 270, '支付失败', { fill: C.amberInk });
  b += node(790, 60, 200, 56, 'refunded', '已退款（预留）', { accent: C.ink3, tcolor: C.ink3, stroke: '#d8dbe8' });
  b += edge([[590, 88], [790, 88]], { mk: 'arrG', color: C.ink3, dash: '6 4' }); b += lbl(690, 78, '暂不做', { fill: C.ink3 });
  figs[7] = page('图 7 · 业务规则：订单状态机', '三类订单（会员 / 永享 / 兑换码）通用；终态不可逆，需重新发起将创建新订单', svg(W, H, b)
    + `<div class="note"><b>状态枚举：</b>pending 待支付 · paid 已支付 · failed 支付失败 · canceled 已取消 · refunded 已退款（预留）。支付成功即创建订单并发放对应权益；终态不可逆，重新发起将创建新订单。暂不做退款工单；兑换码订单金额计 0、不计入 GMV（成交总额）。</div>`, W + 64);
})();

// ============ FIG 8：KP 检索生效条件 ============
figs[8] = page('图 8 · 业务规则：KP 内容纳入 C 端问答检索的条件', '三个条件「与」关系，全部满足才参与检索', `
<div style="display:flex;align-items:center;gap:0;flex-wrap:wrap;max-width:1000px">
  <div style="display:flex;flex-direction:column;gap:14px">
    <div class="step accent-i" style="width:240px"><div class="st-t">① KP 状态 = 已发布</div><div class="st-s">未发布 / 已下架 / 删除均不参与</div></div>
    <div class="step accent-i" style="width:240px"><div class="st-t">② 文件状态 = 已向量化</div><div class="st-s">向量化失败的文件不参与</div></div>
    <div class="step accent-i" style="width:240px"><div class="st-t">③ 文件开关 = 已上架</div><div class="st-s">下架文件不参与（失败文件显示「下架」）</div></div>
  </div>
  <div class="conn" style="font-size:34px;color:#c2c7ee">＋</div>
  <div class="step" style="width:120px;height:120px;justify-content:center;align-items:center;background:${C.indigoSoft};border-color:${C.indigo}"><div class="st-t" style="text-align:center;color:${C.indigoDeep};font-size:16px">同时满足<br>（与）</div></div>
  <div class="conn">›</div>
  <div class="step accent-j" style="width:220px;height:84px"><div class="st-t" style="color:${C.jadeInk}">✓ 纳入问答检索</div><div class="st-s">用户提问可命中该 KP 知识</div></div>
</div>
<div class="note"><b>叠加关系：</b>KP 维度「已发布」与文件维度「已上架」是两层独立开关，叠加生效——KP 已发布且文件已上架，该文件才被检索。<b>跨机构分享：</b>实时同步导入的 KP 在接收方机构同样可用于检索；独立快照为分享发起时刻的内容副本。<b>回答兜底策略</b>（系统配置三选一）：① 直接由大模型回答；② 告知「知识库暂无此资料」；③ 大模型回答并标注「非知识库检索」。</div>
`, 1020);

// ============ FIG 9：登录与授权流程 ============
(function () {
  const W = 1240, H = 760;
  let b = '';
  b += node(W / 2 - 160, 22, 320, 54, '打开 H5（链接带 KP 标识）', '', { accent: C.indigo });
  const colX = [180, 620, 1040];
  b += edge([[W / 2, 76], [W / 2, 96], [colX[0], 96], [colX[0], 120]], { marker: false });
  b += edge([[W / 2, 96], [colX[1], 96], [colX[1], 120]], { marker: false });
  b += edge([[W / 2, 96], [colX[2], 96], [colX[2], 120]], { marker: false });
  b += node(colX[0] - 130, 120, 260, 50, '微信内置浏览器', '主路径', { accent: C.jade });
  b += node(colX[1] - 130, 120, 260, 50, '外部浏览器', '', { accent: C.indigo });
  b += node(colX[2] - 120, 120, 240, 50, '手机号登录', '', { accent: C.amber });
  // 微信内
  b += edge([[colX[0], 170], [colX[0], 196]]);
  b += node(colX[0] - 140, 196, 280, 52, '专属授权弹窗', '昵称 / 头像权限', {});
  b += edge([[colX[0], 248], [colX[0], 274]]);
  b += diamond(colX[0], 312, 170, 70, '允许?');
  b += edge([[colX[0] - 85, 312], [60, 312], [60, 470]], { mk: 'arrG', color: C.ink3 }); b += lbl(60, 400, '拒绝·留登录页', { fill: C.ink3 });
  b += edge([[colX[0], 347], [colX[0], 470]]); b += lbl(colX[0], 420, '允许 · 携授权码回调', { fill: C.indigoDeep });
  // 外部浏览器
  b += edge([[colX[1], 170], [colX[1], 196]]);
  b += node(colX[1] - 150, 196, 300, 52, '微信扫码授权页', 'open.weixin.qq.com 动态二维码', {});
  b += edge([[colX[1], 248], [colX[1], 274]]);
  b += node(colX[1] - 140, 274, 280, 52, '手机端确认授权', '允许 / 拒绝', {});
  // 手机号
  b += edge([[colX[2], 170], [colX[2], 196]]);
  b += node(colX[2] - 130, 196, 260, 52, '手机号 + 验证码', '', {});
  b += edge([[colX[2], 248], [colX[2], 280]]);
  b += diamond(colX[2], 322, 250, 92, ['机构内手机号已存在', '且未绑微信 ?'], { fill: C.amberSoft, stroke: C.amber });
  b += edge([[colX[2], 368], [colX[2], 470]]); b += lbl(colX[2], 420, '是→验证合并 / 否→直接登录', { fill: C.amberInk });
  // 汇聚
  const my = 470;
  b += node(colX[0] - 90, my, 180, 48, '回调处理', '', { accent: C.indigo });
  b += diamond(W / 2, 560, 230, 84, ['已绑手机号 ?']);
  // 微信内 → 棱形左顶点（505,560），外部浏览器 → 棱形上顶点（620,518），均不越界
  b += edge([[colX[0], my + 48], [colX[0], 560], [W / 2 - 115, 560]], { mk: 'arr' });
  b += edge([[colX[1], 470], [colX[1], 516]], { mk: 'arr' });
  b += edge([[W / 2, 602], [W / 2, 648]]); b += lbl(W / 2, 628, '是', { fill: C.indigoDeep });
  b += node(W / 2 - 120, 648, 240, 54, 'AI 会话页', '按 KP 拉取绑定 Agent', { accent: C.jade, tcolor: C.jadeInk });
  b += edge([[W / 2 + 115, 560], [980, 560], [980, 675], [W / 2 + 124, 675]], { mk: 'arr' }); b += lbl(980, 620, '否', { fill: C.ink3 });
  b += node(W / 2 + 124, 648, 260, 54, '绑定手机号', '可「暂不绑定」跳过', { accent: C.amber, tcolor: C.amberInk });
  b += edge([[colX[2], my], [colX[2], 736], [W / 2, 736], [W / 2, 704]], { mk: 'arrA', color: C.amber, dash: '5 4' }); b += lbl(880, 736, '手机号登录 → 会话', { fill: C.amberInk });
  figs[9] = page('图 9 · 业务规则：登录与微信授权流程', '微信内 / 外部浏览器 / 手机号三入口；游客可只读，触发授权操作时引导登录并补发', svg(W, H, b)
    + `<div class="note"><b>游客模式：</b>未登录可浏览只读内容；创建会话、发送问题等需授权操作时引导登录，登录成功后自动补发游客态已输入问题。<b>登录态有效期</b> 30 天，每次操作自动重置。外部浏览器扫码授权由微信域名渲染动态二维码。</div>`, W + 64);
})();

// 写出
Object.entries(figs).forEach(([k, html]) => {
  fs.writeFileSync(path.join(OUT, `fig${k}.html`), html);
});
console.log('生成图页：', Object.keys(figs).map((k) => `fig${k}.html`).join(', '));
