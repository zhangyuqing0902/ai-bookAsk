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
  { t: '微信授权 / 手机号登录', s: '微信内授权弹窗 / 外部扫码 / 验证码', ac: 'a' }, '>',
  { t: '绑定手机号', s: '可「暂不绑定」，敏感操作前再校验' }, '>',
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
]) + `<div class="note"><b>权益即时性：</b>支付成功写入会员权益或永享授权后，返回的正是发起支付的那个会话（非新会话），同一张卡片锁标立即消失。<b>登录前置：</b>落地页须先完成微信授权或手机号登录方可进入会话提问，无游客匿名浏览态。</div>`, 1180);

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
    + `<div class="note"><b>说明：</b>「免费」内容对任意登录用户开放；「会员」内容仅 AI 会员可看；「永享」内容按知识产品 KP 维度买断、跨 KP 不通用。<b>会员与永享相互独立：</b>开通会员不解锁未买断的永享，购买永享也不解锁会员内容，二者互不替代。未满足条件即弹出对应付费墙引导购买。</div>`, W + 64);
})();

// ============ FIG 7：订单状态机 + 退款状态（双维度，退款状态与订单状态解耦）============
(function () {
  const W = 1120, H = 540;
  let b = '';
  // —— 上轨：订单状态（支付生命周期）——
  b += T(20, 40, '订单状态（支付生命周期）', { size: 13.5, weight: 800, fill: C.indigoDeep });
  b += node(40, 110, 170, 56, '待支付', 'pending', { accent: C.ink3, tcolor: C.ink2 });
  b += node(420, 64, 190, 56, '已支付 / 已核销', 'paid', { accent: C.jade, tcolor: C.jadeInk });
  b += node(420, 154, 170, 56, '已取消', 'canceled', { accent: C.ink3, tcolor: C.ink2 });
  b += node(420, 244, 170, 56, '支付失败', 'failed', { accent: C.amber, tcolor: C.amberInk });
  b += edge([[210, 124], [330, 92], [420, 92]], { mk: 'arrJ', color: C.jade }); b += lbl(322, 80, '支付成功', { fill: C.jadeInk });
  b += edge([[210, 138], [330, 182], [420, 182]], { mk: 'arrG', color: C.ink3 }); b += lbl(325, 170, '用户取消', { fill: C.ink3 });
  b += edge([[210, 152], [330, 272], [420, 272]], { mk: 'arrA', color: C.amber }); b += lbl(322, 260, '支付失败', { fill: C.amberInk });
  // —— 分隔 ——
  b += `<line x1="20" y1="335" x2="${W - 20}" y2="335" stroke="${C.line}" stroke-width="1.5" stroke-dasharray="6 5"/>`;
  // —— 下轨：退款状态（独立维度）——
  b += T(20, 362, '退款状态（独立维度 · 仅「已支付」订单可由机构后台发起 · 与订单状态解耦）', { size: 13.5, weight: 800, fill: C.amberInk });
  b += node(40, 398, 170, 56, '未退款', '默认态', { accent: C.ink3, tcolor: C.ink2 });
  b += node(340, 398, 170, 56, '退款中', '发起后处理中', { accent: C.indigo, tcolor: C.indigoDeep });
  b += node(720, 364, 200, 52, '部分退款', '退款额 < 实付', { accent: C.amber, tcolor: C.amberInk });
  b += node(720, 454, 200, 52, '全额退款', '退款额 = 实付', { accent: '#e5533b', tcolor: '#b3402c' });
  b += edge([[210, 426], [340, 426]], { mk: 'arr' }); b += lbl(275, 414, '机构发起退款', { fill: C.indigoDeep });
  b += edge([[510, 418], [640, 390], [720, 390]], { mk: 'arrA', color: C.amber }); b += lbl(620, 376, '部分退回', { fill: C.amberInk });
  b += edge([[510, 434], [640, 480], [720, 480]], { mk: 'arrA', color: '#e5533b' }); b += lbl(620, 466, '全额退回', { fill: '#b3402c' });
  figs[7] = page('图 7 · 业务规则：订单状态机 + 退款状态', '订单支付生命周期（上）与退款状态（下）为两个独立维度；退款状态独立成列、与订单状态解耦', svg(W, H, b)
    + `<div class="note"><b>订单状态：</b>待支付 →（支付成功）已支付（兑换码核销显示「已核销」）/（用户取消）已取消 /（失败）支付失败；终态不可逆，重新发起将创建新订单，支付成功即发放对应权益。<b>退款状态（独立列）：</b>仅金额 &gt; 0 且非「退款中 / 全额退款」的已支付订单，可由机构后台发起退款；支持<b>部分退款</b>（可退余额 = 实付 − 已退）；退款发起 → 退款中 →（成功）部分退款 / 全额退款，资金原路退回并记录退款时间线（发起人 / 金额 / 资金路径 / 时间）。兑换码订单金额计 0、不计入 GMV，亦不可退。</div>`, W + 64);
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

// ============ FIG 9：登录 · 微信授权 · 手机号绑定流程（0614c 重绘，去掉已废弃的「账号合并」） ============
(function () {
  const W = 1300, H = 924;
  let b = '';
  b += T(40, 40, '图 9 · 登录 · 微信授权 · 手机号绑定流程', { size: 21, weight: 800, fill: C.ink });
  b += T(40, 66, '微信内 / 外部浏览器两种授权交互汇聚；H5 公众号网页无法一键获取手机号 → 统一「手机号 + 验证码」绑定', { size: 13, fill: C.ink2 });

  // 落地页 + 两入口
  b += node(500, 92, 300, 52, '打开 H5 落地页', '链接带 KP 标识 · 登录后进入会话', { accent: C.indigo });
  b += node(180, 176, 280, 50, '① 微信授权登录', '', { accent: C.jade });
  b += node(860, 176, 300, 50, '② 手机号验证码登录', '', { accent: C.amber });
  b += edge([[650, 144], [650, 160], [320, 160], [320, 176]], { mk: 'arr' });
  b += edge([[650, 160], [1010, 160], [1010, 176]], { mk: 'arr' });

  // —— 微信授权 lane（center≈320）——
  b += edge([[320, 226], [320, 252]], { mk: 'arr' });
  b += diamond(320, 296, 210, 82, ['微信内置浏览器', '打开 ?']);
  b += edge([[215, 296], [120, 296], [120, 362]], { mk: 'arrJ', color: C.jade }); b += lbl(165, 290, '是 · 微信内', { fill: C.jadeInk });
  b += node(20, 362, 250, 60, '微信官方授权弹窗', '授权 昵称 / 头像 / 性别 / 地区', { accent: C.jade });
  b += edge([[425, 296], [510, 296], [510, 362]], { mk: 'arr' }); b += lbl(468, 290, '否 · 外部', { fill: C.indigoDeep });
  b += node(360, 362, 300, 60, '微信扫码授权页', 'open.weixin.qq.com 动态二维码 · 扫码确认', { accent: C.indigo });
  b += diamond(320, 488, 200, 74, ['允许授权 ?']);
  b += edge([[145, 422], [145, 488], [220, 488]], { mk: 'arrJ', color: C.jade });
  b += edge([[510, 422], [510, 488], [420, 488]], { mk: 'arr' });
  b += T(548, 462, '拒绝 → 留登录页', { size: 11.5, fill: C.ink3 });
  b += edge([[320, 525], [320, 566]], { mk: 'arr' }); b += lbl(320, 548, '允许 · 携 code 回调', { fill: C.indigoDeep });
  b += node(180, 566, 280, 58, '授权回调', '拉取头像 / 昵称 / 性别 / 地区写入资料', { accent: C.indigo });

  // —— 手机号 lane（center≈1010）——
  b += edge([[1010, 226], [1010, 254]], { mk: 'arrA', color: C.amber });
  b += node(880, 254, 260, 50, '输入手机号 + 验证码', '', { accent: C.amber });
  b += edge([[1010, 304], [1010, 336]], { mk: 'arrA', color: C.amber }); b += lbl(1010, 322, '校验通过', { fill: C.amberInk });
  b += node(870, 336, 280, 58, '登录成功', '不获取 / 绑定任何微信信息', { accent: C.amber });

  // —— 汇聚：已绑手机号 ? ——
  b += edge([[320, 624], [320, 660]], { mk: 'arr' });
  b += diamond(320, 706, 220, 82, ['已绑手机号 ?']);
  b += edge([[430, 706], [580, 706]], { mk: 'arrA', color: C.amber }); b += lbl(505, 700, '否', { fill: C.amberInk });
  b += node(580, 678, 330, 58, '引导绑定手机号', '可「暂不绑定」直接进 · 基础功能可用', { accent: C.amber, tcolor: C.amberInk });
  // 会话页（merge）
  b += node(500, 824, 300, 60, '进入 AI 会话页', '按 KP 拉取绑定 Agent · 登录态 30 天', { accent: C.jade, tcolor: C.jadeInk });
  b += edge([[320, 747], [320, 854], [500, 854]], { mk: 'arrJ', color: C.jade }); b += lbl(380, 840, '是', { fill: C.jadeInk });
  b += edge([[745, 736], [745, 794], [680, 794], [680, 824]], { mk: 'arrA', color: C.amber });
  b += edge([[1010, 394], [1010, 802], [790, 802], [790, 824]], { mk: 'arrA', color: C.amber });

  figs[9] = page('图 9 · 登录 · 微信授权 · 手机号绑定流程', ' ', svg(W, H, b), W + 64);
})();

// —— 图 10 · 机构订阅与加油包关系（B 端订阅体系）——
(() => {
  const tag = (t, bg, fg) => `<span style="font-size:11px;font-weight:700;padding:1px 9px;border-radius:20px;background:${bg};color:${fg};margin-left:7px">${esc(t)}</span>`;
  const box = (title, meta, o = {}) => `<div style="border:1.5px solid ${o.bd || C.line};border-left:5px solid ${o.ac || C.line};border-radius:12px;padding:11px 15px;background:${o.bg || '#fff'}">`
    + `<div style="font-weight:700;font-size:14px;color:${C.ink}">${esc(title)}${o.tag || ''}</div>`
    + (meta ? `<div style="font-size:11.5px;color:${C.ink2};margin-top:5px;line-height:1.55">${esc(meta)}</div>` : '') + `</div>`;
  const arrow = (t) => `<div style="text-align:center;color:#c2c7ee;font-size:18px;font-weight:800;margin:4px 0">↓${t ? `<span style="font-size:11px;color:${C.ink3};font-weight:600;margin-left:7px">${esc(t)}</span>` : ''}</div>`;
  const chev = `<div style="display:flex;align-items:center;color:#c2c7ee;font-size:18px;font-weight:800">→</div>`;
  const inner = `<div style="width:1116px">
    ${box('机构（租户）', '一个机构对应 1 — N 笔订阅订单；其“当前可用额度”由生效订阅 + 生效加油包决定，只读、不可手改。', { ac: C.indigo, bg: C.indigoSoft })}
    ${arrow('1 — N')}
    <div style="font-size:12.5px;font-weight:700;color:${C.indigoDeep};margin:6px 0 8px">订阅订单（常规 · 定套餐 + 有效期）</div>
    <div style="display:flex;align-items:stretch;gap:10px">
      <div style="flex:1">${box('订阅① 专业版', '2025-06 ~ 2026-05 · 首年签约', { ac: C.ink3, tag: tag('未生效', '#eceef3', C.ink3) })}</div>
      ${chev}
      <div style="flex:1.05">${box('订阅② 专业版', '2026-06 ~ 2027-05 · 续约（当前生效）', { ac: C.indigo, bd: C.indigo, bg: C.indigoSoft, tag: tag('生效', '#dfe3fb', C.indigoDeep) })}</div>
      ${chev}
      <div style="flex:1">${box('订阅③ …', '可提前预建下一期', { ac: C.ink3, tag: tag('未生效', '#eceef3', C.ink3) })}</div>
    </div>
    <div style="font-size:11.5px;color:${C.ink2};margin:9px 0 0;background:${C.soft};border-radius:8px;padding:9px 13px;line-height:1.6">同一机构同时只有一个【生效】订阅；续约 / 到期 = 新建并切换下一笔，历史订阅完整留痕（签约时间 / 套餐 / 商务负责人 / 有效期）。</div>
    ${arrow('生效订阅之下挂加油包')}
    <div style="font-size:12.5px;font-weight:700;color:${C.amberInk};margin:6px 0 8px">加油包（期中加量 · 即时生效 · 额度累加 · 不改套餐）</div>
    <div style="display:flex;gap:10px">
      <div style="flex:1">${box('加油包 A', '+0.5 亿 Token · 跟随订阅② 到期 2027-05', { ac: C.amber, bg: C.amberSoft, tag: tag('生效', '#ffe3d8', C.amberInk) })}</div>
      <div style="flex:1">${box('加油包 B', '+0.5 亿 Token · 跟随订阅② 到期 2027-05', { ac: C.amber, bg: C.amberSoft, tag: tag('生效', '#ffe3d8', C.amberInk) })}</div>
    </div>
    ${arrow('')}
    <div style="border:1.5px solid ${C.jade};border-radius:12px;background:${C.jadeSoft};padding:13px 16px">
      <div style="font-weight:800;font-size:14px;color:${C.jadeInk}">机构当前可用额度（总额度，含加油包）</div>
      <div style="font-size:12.5px;color:${C.ink};margin-top:6px;line-height:1.75">= 当前【生效】订阅基础额度 ＋ 该订阅下全部【生效】加油包累加<br>示例：KP 50＋0 = <b>50 个</b> · 存储 100＋0 = <b>100 GB</b> · Token 2＋0.5＋0.5 = <b>3 亿</b>（已用量同口径累加）</div>
    </div>
    <div style="display:flex;gap:12px;margin-top:18px">
      <div style="flex:1;border:1.5px solid ${C.line};border-radius:12px;padding:12px 15px;background:#fff">
        <div style="font-weight:700;font-size:13px;color:${C.indigoDeep}">B 端订阅订单（机构 → 平台）</div>
        <div style="font-size:11.5px;color:${C.ink2};margin-top:5px;line-height:1.6">商务 / 超管创建，决定机构配额额度；平台不经手资金（无合同金额字段）。本图即此体系。</div>
      </div>
      <div style="flex:1;border:1.5px solid ${C.line};border-radius:12px;padding:12px 15px;background:#fff">
        <div style="font-weight:700;font-size:13px;color:${C.ink}">C 端订单（终端用户 → 机构）</div>
        <div style="font-size:11.5px;color:${C.ink2};margin-top:5px;line-height:1.6">会员订阅 / 永享买断 / 兑换码核销，资金进机构商户号。与 B 端订阅订单两套体系，互不混淆。</div>
      </div>
    </div>
    <div style="margin-top:16px;font-size:12px;color:${C.ink2};display:flex;gap:22px">
      <span><span style="display:inline-block;width:11px;height:11px;border-radius:3px;background:${C.indigo};margin-right:6px;vertical-align:middle"></span>生效订阅</span>
      <span><span style="display:inline-block;width:11px;height:11px;border-radius:3px;background:${C.ink3};margin-right:6px;vertical-align:middle"></span>未生效订阅</span>
      <span><span style="display:inline-block;width:11px;height:11px;border-radius:3px;background:${C.amber};margin-right:6px;vertical-align:middle"></span>加油包</span>
    </div>
  </div>`;
  figs[10] = page('图 10 · 机构订阅与加油包关系', '机构 1—N 订阅，加油包挂在生效订阅下；当前可用额度 = 生效订阅 + 生效加油包累加', inner);
})();

// —— 图 11 · 订阅生命周期状态机（状态自动判定 + 创建/删除规则）——
(() => {
  const state = (name, bg, bd, fg, sub) => `<div style="flex:1;text-align:center;border:1.5px solid ${bd};border-radius:12px;padding:13px 10px;background:${bg}">`
    + `<div style="font-weight:800;font-size:15px;color:${fg}">${esc(name)}</div>`
    + `<div style="font-size:11px;color:${C.ink2};margin-top:4px;line-height:1.45">${sub}</div></div>`;
  const tran = (t) => `<div style="flex:0 0 116px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:${C.ink2}">`
    + `<div style="font-size:11px;font-weight:700;color:${C.indigoDeep}">${esc(t)}</div>`
    + `<div style="font-size:18px;color:#c2c7ee;font-weight:800;line-height:1">→</div>`
    + `<div style="font-size:10.5px;color:${C.ink3}">系统自动</div></div>`;
  const rule = (title, color, items) => `<div style="flex:1;border:1.5px solid ${C.line};border-left:5px solid ${color};border-radius:12px;padding:13px 16px;background:#fff">`
    + `<div style="font-weight:700;font-size:13.5px;color:${C.ink}">${esc(title)}</div>`
    + `<ul style="margin:8px 0 0;padding-left:18px;font-size:12px;color:${C.ink2};line-height:1.85">`
    + items.map((i) => `<li>${i}</li>`).join('') + `</ul></div>`;
  const inner = `<div style="width:1080px">
    <div style="display:flex;align-items:stretch;gap:0;margin-bottom:6px">
      ${state('未生效', '#fff', C.line, C.ink2, '今天 &lt; 生效日<br>预建的下一期、暂不计入额度')}
      ${tran('到生效日')}
      ${state('生效', C.indigoSoft, C.indigo, C.indigoDeep, '生效日 ≤ 今天 ≤ 到期日<br>决定机构当前可用额度')}
      ${tran('过到期日')}
      ${state('已过期', C.soft, C.line, C.ink3, '今天 &gt; 到期日<br>历史已结束的服务周期')}
    </div>
    <div style="font-size:11.5px;color:${C.ink2};background:${C.soft};border-radius:8px;padding:9px 13px;line-height:1.6">状态<b>完全由有效期自动判定</b>，无手动开关；同一机构同一时间段最多只有一个「生效」订阅。</div>
    <div style="display:flex;gap:12px;margin-top:18px">
      ${rule('创建规则（方案 A+C）', C.indigo, ['同一时间段只能有一个生效订阅', '有生效订阅时最多再预建 1 期「未生效」（续约）', '新建有效期不可与已有订阅重叠，否则拦截', '新建有效期默认从最晚订阅到期次日衔接一年'])}
      ${rule('删除规则（误建处理）', C.amber, ['可删 = 零用量 + 无加油包 + 非已过期（危险操作 + 二次确认、不可恢复）', '生效中且有用量消耗 → 不可删（保留服务 / 计费历史）', '已过期 → 不可删', '覆盖"机构第一笔生效订阅建错了"：刚建、还没消耗即可删'])}
    </div>
    <div style="margin-top:16px;font-size:12px;color:${C.ink2};display:flex;gap:22px">
      <span><span style="display:inline-block;width:11px;height:11px;border-radius:3px;background:${C.indigo};margin-right:6px;vertical-align:middle"></span>生效</span>
      <span><span style="display:inline-block;width:11px;height:11px;border-radius:3px;border:1.5px solid ${C.ink3};margin-right:6px;vertical-align:middle"></span>未生效 / 已过期</span>
    </div>
  </div>`;
  figs[11] = page('图 11 · 订阅生命周期状态机', '未生效 → 生效 → 已过期 由有效期自动判定；含 A+C 创建规则与误建删除规则', inner);
})();

// —— 图 12 · 免费 / 会员 / 永享 三场景权益流程（每个场景独立呈现全路径）——
(() => {
  const map = { i: [C.indigo, C.indigoSoft, C.indigoDeep], a: [C.amber, C.amberSoft, C.amberInk], j: [C.jade, C.jadeSoft, C.jadeInk], n: [C.line, '#fff', C.ink] };
  const sb = (t, s, kind) => {
    const [ac, bg, fg] = map[kind || 'n'];
    return `<div style="flex:0 0 auto;min-width:118px;max-width:184px;border:1.5px solid ${kind === 'n' ? C.line : ac};border-left:5px solid ${ac};border-radius:11px;padding:9px 13px;background:${bg}">`
      + `<div style="font-weight:700;font-size:13px;color:${fg};line-height:1.32">${esc(t)}</div>`
      + (s ? `<div style="font-size:11px;color:${C.ink2};margin-top:3px;line-height:1.45">${esc(s)}</div>` : '') + `</div>`;
  };
  const arr = `<div style="flex:0 0 auto;color:#c2c7ee;font-size:17px;font-weight:800;padding:0 5px">›</div>`;
  const br = `<div style="flex:0 0 100%;height:7px"></div>`;
  const lane = (no, title, color, steps) => `<div style="border:1.5px solid ${C.line};border-radius:13px;padding:13px 15px;margin-bottom:13px;background:#fff">`
    + `<div style="display:flex;align-items:center;gap:9px;margin-bottom:11px"><span style="flex:0 0 auto;font-size:12px;font-weight:800;color:#fff;background:${color};border-radius:20px;padding:3px 12px">${esc(no)}</span><span style="font-weight:800;font-size:14.5px;color:${color}">${esc(title)}</span></div>`
    + `<div style="display:flex;align-items:center;flex-wrap:wrap;gap:4px">${steps.join('')}</div></div>`;
  const inner = `<div style="width:1116px">
    ${lane('场景一', '点击「免费」内容', C.jadeInk, [
      sb('点击免费内容', 'word / pdf 或标「免费」的图音视', 'i'), arr,
      sb('判定：免费内容', '任意已登录用户', 'n'), arr,
      sb('✓ 直接解锁', '无需付费，直接查看 / 播放', 'j'),
    ])}
    ${lane('场景二', '点击「会员」内容', C.indigoDeep, [
      sb('点击会员内容', '标「会员」的图 / 音 / 视', 'i'), arr,
      sb('判定：是否 AI 会员？', '只看会员身份，与永享无关', 'n'), arr,
      sb('是 → ✓ 解锁', '直接查看 / 播放', 'j'), br,
      sb('否 → ✗ 会员付费墙', '引导开通 AI 会员', 'a'), arr,
      sb('开通会员（微信支付）', '返回原会话即解锁', 'a'), arr,
      sb('✓ 解锁全部会员内容', '会员有效期内通用', 'j'),
    ])}
    ${lane('场景三', '点击「永享」内容', C.amberInk, [
      sb('点击永享内容', '设了永享单价的图 / 音 / 视', 'i'), arr,
      sb('判定：是否已买断该 KP？', '按「用户 + KP」粒度，与会员无关', 'n'), arr,
      sb('是 → ✓ 解锁', '永久持有、可反复查看', 'j'), br,
      sb('否 → ✗ 永享付费墙', '按单价买断该单条内容', 'a'), arr,
      sb('买断该条（微信支付）', '返回原会话即解锁', 'a'), arr,
      sb('✓ 永久解锁该条', '跨 KP 不通用', 'j'),
    ])}
    <div style="font-size:12px;color:${C.ink2};background:${C.soft};border-radius:8px;padding:11px 14px;line-height:1.7"><b>两池独立（关键规则）：</b>「会员」与「永享」是两条相互独立、互不替代的解锁维度——开通会员<b>不会</b>解锁未买断的永享内容；购买永享<b>不会</b>解锁会员内容。例：会员用户点击永享内容仍需按单价买断；永享买断用户点击会员内容仍需开通会员。</div>
  </div>`;
  figs[12] = page('图 12 · 免费 / 会员 / 永享 三场景权益流程', '每个场景独立呈现「点击 → 判定 → 解锁 / 付费墙 → 购买 → 解锁」全路径；会员与永享两池独立', inner);
})();

// 写出
Object.entries(figs).forEach(([k, html]) => {
  fs.writeFileSync(path.join(OUT, `fig${k}.html`), html);
});
console.log('生成图页：', Object.keys(figs).map((k) => `fig${k}.html`).join(', '));
