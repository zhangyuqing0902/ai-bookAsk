// AI 问书 · 研发同步 · 0806 修订说明（Word）
// 复用 docs/prd-build 本地 docx 库；产物写入 docs/
const path = require('path');
const fs = require('fs');
const ROOT = '/Users/ziye/Documents/codes/ai-bookAsk';
const docx = require('docx');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, ShadingType, LevelFormat, PageBreak,
} = docx;

const CJK = 'PingFang SC';
const CLR = { ink: '2B2622', sub: '7A736C', accent: '4B57E8', soft: 'EEF0FE', line: 'E5E1DB', warn: 'E04A2E', jade: '15B080', head: 'F7F5F1' };

const kids = [];
const push = (...els) => kids.push(...els);

const P = (text, opt = {}) => new Paragraph({
  spacing: { before: opt.before ?? 60, after: opt.after ?? 60, line: 300 },
  children: parseBold(text, { size: opt.size ?? 21, color: opt.color ?? CLR.ink }),
});
// **bold** 解析
function parseBold(text, base) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((p) => p.startsWith('**')
    ? new TextRun({ text: p.slice(2, -2), bold: true, font: CJK, size: base.size, color: base.color })
    : new TextRun({ text: p, font: CJK, size: base.size, color: base.color }));
}
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 320, after: 120 }, children: [new TextRun({ text: t, bold: true, size: 30, color: CLR.accent, font: CJK })] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 260, after: 100 }, children: [new TextRun({ text: t, bold: true, size: 25, color: CLR.ink, font: CJK })] });
const BUL = (items) => items.map((t) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  spacing: { before: 30, after: 30, line: 296 },
  children: parseBold(t, { size: 21, color: CLR.ink }),
}));

const CELL_M = { top: 60, bottom: 60, left: 110, right: 110 };
function TBL(headers, rows, widths) {
  const total = widths.reduce((a, b) => a + b, 0);
  const mk = (txt, isHead, w) => new TableCell({
    width: { size: w, type: WidthType.DXA },
    margins: CELL_M,
    shading: isHead ? { type: ShadingType.CLEAR, fill: CLR.head } : undefined,
    children: [new Paragraph({ spacing: { before: 0, after: 0, line: 276 }, children: parseBold(txt, { size: 19, color: isHead ? CLR.sub : CLR.ink }).map((r) => { if (isHead) r.root[1].root.push(); return r; }) })],
  });
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: widths,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: CLR.line }, bottom: { style: BorderStyle.SINGLE, size: 4, color: CLR.line },
      left: { style: BorderStyle.SINGLE, size: 4, color: CLR.line }, right: { style: BorderStyle.SINGLE, size: 4, color: CLR.line },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: CLR.line }, insideVertical: { style: BorderStyle.SINGLE, size: 4, color: CLR.line },
    },
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((h, i) => mk(h, true, widths[i])) }),
      ...rows.map((r) => new TableRow({ children: r.map((c, i) => mk(c, false, widths[i])) })),
    ],
  });
}

// ================= 封面区 =================
push(
  new Paragraph({ spacing: { before: 500, after: 0 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'AI 问书 · 研发同步', bold: true, size: 44, color: CLR.accent, font: CJK })] }),
  new Paragraph({ spacing: { before: 120, after: 0 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: '0806 修订说明（会员四态 / TTS 参考音文本 / 微信支付参数 / 协议文档 / 父子机构）', bold: true, size: 26, color: CLR.ink, font: CJK })] }),
  new Paragraph({ spacing: { before: 100, after: 0 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: '日期 2026-08-06　|　配套：功能清单 v2.9 · PRD v1.12 · 品牌色影响清单 111 条　|　密级：内部', size: 19, color: CLR.sub, font: CJK })] }),
  new Paragraph({ spacing: { before: 80, after: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: '用途：研发期间反馈问题的修订汇总，供研发按本文档逐项核对口径与规格；原型已同步实现，可对照本地原型验收。', size: 19, color: CLR.sub, font: CJK })] }),
);

// ================= 一、修订总览 =================
push(H1('一、修订总览（5 项）'));
push(TBL(['#', '修订项', '涉及端', '核心变化'], [
  ['1', '会员状态四态五档', '两后台 + C 端 H5 + 导出', '「会员 / 非会员」二分 → 有效会员 / 宽限期（待续费）/ 会员已过期 / 未开通会员 四态；筛选五档；全库展示点与导出同步'],
  ['2', 'TTS 参考音文本', '两后台（同一组件）', 'Agent 编辑 / 详情在「TTS 参考音」下新增必填字段，100 字以内、不限字符种类'],
  ['3', '微信支付新增四参数', '平台后台', 'API v2 密钥 / 支付公钥 ID / 支付公钥文件 / 委托代扣包月模板 ID，按接入用途排序落位微信支付卡片'],
  ['4', '机构详情「协议文档」Tab', '平台后台', '新增第 6 个 Tab（末位）：批量上传 + 逐文件进度条 + 下载 / 删除；复用 KP 知识库上传组件，研发零新增'],
  ['5', '父子机构数据范围', '机构后台', '父机构视角：六业务页机构单选筛选 + 归属展示、主控台 / 看板机构多选联动；子机构数据仅可查看；顶栏〔演示〕三态切换'],
], [500, 2000, 2000, 4860]));

// ================= 二、逐项说明 =================
push(H1('二、逐项说明'));

push(H2('1. 会员状态：二分改生命周期四态（三端及导出统一口径）'));
push(P('**本质**：会员状态是用户权益的生命周期阶段，四态覆盖全周期、任一时刻互斥。判定与到期时间由后端下发，前端只做展示映射。'));
push(TBL(['状态', '判定口径', '列表标签色', '详情补充展示'], [
  ['有效会员（active）', '会员权益生效中（含连续包月期内未到期）', '玉绿 .tag-jade', '「有效期至 {日期}」'],
  ['宽限期（待续费）（grace）', '权益已到期、处于续费宽限窗口内，权益暂保留并引导续费——对应委托代扣扣款失败后的挽留窗口', '琥珀 .tag-amber', '「已于 {日期} 到期 · 宽限期内」'],
  ['会员已过期（expired）', '权益终止且已出宽限窗口', '赤陶 .tag-terra', '「已于 {日期} 到期」'],
  ['未开通会员（none）', '从未开通过会员', '灰描边 .tag-line', '—'],
], [1900, 3760, 1600, 2100]));
push(...BUL([
  '**筛选五档**＝全部 ＋ 四态，平台后台「全域用户」与机构后台「C 端用户」一致；导出（xlsx）同步四态文案。',
  '**同步生效面**：两后台用户列表 / 用户详情（详情补显到期时间）、答案反馈「反馈人」会员标（未开通不挂标，短文案：有效会员 / 宽限期 / 已过期）、反馈详情弹窗、C 端「我的」用户卡（有效显「会员」、宽限显「会员 · 待续费」、其余不显标）与「会员中心」右值（已开通 / 宽限期（待续费）/ 已过期 / 未开通）、AI 会话抽屉用户卡。',
  '**数据契约建议**：用户实体给 memberState（枚举四值）＋ memberExpire（日期，active＝有效期至；grace / expired＝到期日）两字段；原型单一口径源在 packages/mock/src/data/memberState.ts，label / 标签色 / 排序权重 / 筛选选项 / 到期文案均从此文件取，研发可照抄映射。',
  '**顺手修**：机构后台用户详情原为整页硬编码演示数据，本批改为随列表所点行真实渲染。',
]));

push(H2('2. Agent 新增「TTS 参考音文本」（必填）'));
push(P('TTS 参考音频内朗读的文本内容，用于 TTS 引擎将参考音与文本对齐（声音克隆场景参考音 + 参考文本成对提供）。'));
push(TBL(['规格项', '值'], [
  ['位置', '「TTS 参考音」字段之下、「回答 Prompt」之上；两后台同一组件（AgentDetailView）自动同步'],
  ['控件', '多行输入框（3 行起，可拉伸），右下角实时字数「N / 100」，达上限字数转红'],
  ['必填', '是；为空保存拦截 toast「请输入 TTS 参考音文本」'],
  ['长度', '上限 100 字，按字符数计；输入框 maxLength 直接拦截，保存兜底校验 toast「TTS 参考音文本不能超过 100 字」'],
  ['字符', '不限制字符种类——中英文 / 数字 / 标点 / 符号均可'],
  ['校验顺序', '名称非空 → 名称唯一 → TTS 参考音已上传 → TTS 参考音文本非空 → 长度（与既有 toast 校验链衔接）'],
], [1600, 7760]));

push(H2('3. 微信支付配置新增四参数（机构详情 · 机构配置 · 微信配置）'));
push(P('四个参数均落位**微信支付卡片**，不涉及公众号 / 开放平台卡片。字段顺序按「请求签名 → 证书 / 私钥 → 应答验签 → 业务参数」的接入用途组织，落位与理由如下：'));
push(TBL(['参数', '控件', '落位', '用途（为什么放这里）'], [
  ['API v2 密钥', '掩码文本（32 位）', 'APIv3 密钥之后', '微信支付 v2 版接口签名密钥（商户平台「账户中心-API 安全」设置）。委托代扣（自动续费）的签约 / 扣款接口体系仍走 v2 签名——配置连续包月必需；与 APIv3 密钥并存不互斥，故与 v3 密钥相邻成「密钥组」'],
  ['支付公钥 ID', '文本（PUB_KEY_ID_ 开头）', '商户 API 私钥之后', '微信支付「公钥模式」验签标识。2024 年起新注册商户默认发放微信支付公钥（替代平台证书轮换机制），验签时按回调头 Wechatpay-Serial 匹配此 ID——属应答验签组，紧跟证书 / 私钥'],
  ['支付公钥文件', '上传 pub_key.pem', '支付公钥 ID 之后', '与公钥 ID 配套的公钥文件（商户平台下载），验证微信支付应答与回调签名。新商户公钥验签、存量商户平台证书验签，按商户号实际发放形态二选一'],
  ['委托代扣包月模板 ID', '文本', '卡片末尾', '委托代扣「签约模板」经微信审核通过后分配的模板 ID（plan_id），C 端用户签约连续包月扣费时传入——业务参数，置安全参数之后'],
], [1700, 1500, 1500, 4660]));
push(P('卡片底部限制说明区已同步补充三条：v2 / v3 密钥并存说明、公钥模式验签说明（与平台证书二选一）、代扣模板用途说明。', { color: CLR.sub, size: 19 }));

push(H2('4. 平台机构详情新增 Tab 6「协议文档」（置 Tab 栏末位）'));
push(P('归档平台与该机构的合作与资质文件：ICP 授权函、微信网站应用登记表、产品截图、合作协议等。**复用知识产品 KP 知识库的上传弹窗组件**（本批已将其抽为共享组件 UploadModal 并参数化标题 / 格式 / 规格表 / 按钮文案），研发侧零新增组件。'));
push(TBL(['类别', '支持格式', '单文件上限（非单次合计）'], [
  ['图片', 'PNG、JPG、GIF', '≤ 20MB'],
  ['文档', 'DOC / DOCX、PDF', '≤ 50MB'],
  ['演示文稿', 'PPT / PPTX', '≤ 100MB'],
], [1600, 3760, 4000]));
push(...BUL([
  '**批量上传**：多选 + 拖拽入框，每个文件独立进度条，全部完成后方可点「完成上传」；其余格式选择时拦截。',
  '**文件列表**：文件名（类型彩色图标，PPT 新增专属橙色图标）/ 类型 / 大小 / 上传时间，各列可排序；按文件名搜索 + 类型筛选。',
  '**操作**：下载；删除走二次确认「删除后不可恢复，确认删除「{文件名}」？」。',
  '**预置演示数据** 7 条：ICP 授权函.pdf / 微信网站应用登记表.docx / 产品截图 ×2 / 合作协议.pdf / 产品介绍.pptx / 品牌演示.gif（packages/mock/src/data/orgAgreements.ts）。',
]));

push(H2('5. 父子机构数据范围（机构后台）'));
push(P('**概念**：父机构＝本机构下辖 N 个机构；子机构＝有父机构的机构；独立机构＝无父无子。上线后由登录账号所属机构在机构主数据中的父子关系决定；原型在机构后台顶栏提供〔演示〕三态切换（虚线边样式，明示非上线功能），便于评审预览三类机构的界面差异。'));
push(TBL(['页面组', '父机构视角', '子机构 / 独立机构视角'], [
  ['知识产品 KP · Agent 人设 · C 端用户 · 订单管理 · 兑换码 · 答案反馈（六页）', '筛选区新增「机构」**单选**下拉（全部机构（默认）/ 本机构（带父机构标）/ 各子机构）联动列表；列表 / 卡片展示**数据归属机构名称**', '保持现状：无机构筛选、无归属列'],
  ['主控台 · 数据看板（两页）', '新增「机构」**多选**筛选（默认全选、支持跨机构任意组合勾选），全部指标随所选机构集合联动——计数 / 金额类绝对量按集合聚合，率类指标按集合整体口径重算（非简单相加）；导出沿用当前机构集合', '保持现状：无机构筛选'],
], [3060, 3760, 2540]));
push(...BUL([
  '**数据权限（与平台侧角色权限口径一致，角色权限页三态图例已补说明）**：平台后台角色的「可操作」＝可跨机构操作全平台数据；机构后台角色的「可操作」＝仅针对本机构数据——父机构可见下属子机构数据（列表可筛、看板可汇总），但对子机构数据**仅可查看**：列表操作置灰（如子机构订单退款）并提示「仅可操作本机构数据」，KP / Agent 详情进入整页只读态（顶部锁形横幅说明归属与原因）。',
  '**订单页放宽说明**：原「仅显本机构订单」在父机构视角放宽为「本机构＋全部子机构订单」，新增归属机构列（订单号后）。',
  '**原型 mock 口径（仅供联调对照，非上线逻辑）**：子机构演示数据仅父机构视角可见（子 / 独立视角自动隐藏，保证界面与现状一致）；看板联动用机构系数表（本机构 0.62 / 少儿分社 0.23 / 教辅分社 0.15，全选＝1＝现状数值），绝对量 × 系数、率值 / 人均 / 时长不缩放——真实实现应按机构维度聚合查询。',
  '**个人中心**：子机构视角展示「上级机构」行，父 / 独立视角不展示。',
]));

// ================= 三、文档与验证 =================
push(new Paragraph({ children: [new PageBreak()] }));
push(H1('三、配套文档版本'));
push(TBL(['文档', '版本变化', '本批要点'], [
  ['功能清单（md + xlsx 同源生成）', 'v2.8 → v2.9', '五项修订全部落条目（红标「0806 修订 / 新增」）；上批 0722/0724 标记已冻结为正文常规规则'],
  ['产品 PRD（docx）', 'v1.11 → v1.12', '新增 v1.12 增量摘要章；同时补录 0724 批四项修订（DAU/WAU/MAU 固定滚动窗口快照定稿、用量看板内容存量板块移除、留存两档、活跃概览页级常驻）——0724 当时未写回 PRD 的欠账本批一并补齐'],
  ['品牌色影响清单（xlsx）', '100 → 111 条', '新增 0806 批 11 条：会员四态标 / TTS 字数计数 / 机构类型切换 / 多选下拉 / 归属机构行 / PPT 图标 / 协议文档上传等，均标注复用来源与文件行号'],
], [2660, 1700, 5000]));

push(H1('四、验证结果与体验路径'));
push(...BUL([
  '**对抗性测试**：104 / 104 通过（新增 0806 断言 19 条：四态互斥与往返、跨端同人同状态、TTS 规格、微信参数顺序、协议文档规格、机构系数全选＝1、缩放不碰率值等；同时修正 4 条历史批次口径反转后未更新的旧断言）。',
  '**导出 spec 测试**：271 / 271 通过（顺手修复存量缺陷：平台主控台续费率环比缺方向标识）。',
  '**三端构建**：mobile-h5 / org-admin / platform-admin 全部通过，页面路由清单校验一致。',
]));
push(P('**本地体验路径**（npm run dev 后）：', { before: 120 }));
push(TBL(['修订项', '入口'], [
  ['会员四态', '平台后台 5175「全域用户」（列表 / 筛选 / 详情）；机构后台 5174「C 端用户」；两后台「答案反馈」反馈人标；H5 5170「我的」'],
  ['TTS 参考音文本', '机构后台「Agent 人设」任一卡片进编辑；平台后台「全域 Agent」任一卡片'],
  ['微信支付四参数', '平台后台「机构管理」任一机构详情 → 机构配置 → 微信配置 → 微信支付卡片'],
  ['协议文档 Tab', '平台后台机构详情 → 最后一个 Tab「协议文档」（上传 / 下载 / 删除）'],
  ['父子机构', '机构后台 5174 顶栏「演示 · 机构类型」切到**父机构**：六页看机构筛选与归属、点子机构 KP / Agent 看只读态、订单看退款置灰、主控台 / 数据看板看机构多选联动；切回子机构 / 独立机构确认界面与现状一致'],
], [2000, 7360]));

// ================= 组装 =================
const doc = new Document({
  numbering: { config: [{ reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '·', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 200 } }, run: { font: CJK } } }] }] },
  styles: { default: { document: { run: { font: CJK, size: 21, color: CLR.ink } } } },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1200, bottom: 1200, left: 1300, right: 1300 } } },
    children: kids,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  const out = path.join(ROOT, 'docs/AI问书-研发同步-0806修订说明.docx');
  fs.writeFileSync(out, buf);
  console.log('✅', out, (buf.length / 1024).toFixed(0) + ' KB');
});
