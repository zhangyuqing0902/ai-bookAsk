/* 生成「AI 问书 · 微信支付委托代扣申请材料」Word 文档
   针对微信驳回原因 ①第1点(申请理由) 与 第2点(产品交互图) 补充。
   run: node docs/wechat-daikou/build-daikou.cjs */
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  ImageRun, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
} = require(require.resolve('docx', { paths: [path.join(__dirname, '../prd-build')] }));

const DIR = __dirname;
const ASSET = path.join(DIR, 'assets');
const img = (name) => fs.readFileSync(path.join(ASSET, name));

const INK = '1F2430';
const INDIGO = '4B4DED';
const TERRA = 'E5623C';
const GREY = '6B7280';

// ---------- 复用小工具 ----------
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 320, after: 140 }, children: [new TextRun({ text: t, bold: true, size: 30, color: INK })] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 220, after: 100 }, children: [new TextRun({ text: t, bold: true, size: 25, color: INDIGO })] });
const P = (runs, opt = {}) => new Paragraph({ spacing: { after: 90, line: 300 }, ...opt, children: Array.isArray(runs) ? runs : [new TextRun({ text: runs, size: 21, color: INK })] });
const T = (text, o = {}) => new TextRun({ text, size: 21, color: INK, ...o });
const bullet = (runs) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 60, line: 300 }, children: Array.isArray(runs) ? runs : [T(runs)] });

const rule = () => new Paragraph({ spacing: { before: 120, after: 120 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'D8DCE4' } }, children: [new TextRun({ text: '' })] });

// 图 + 图注 表格（图居中，下方灰色说明）
function figure(file, caption) {
  // 截图为含机身外框的手机视图（814×1688），按原比例缩放
  const IW = 180, IH = Math.round(IW * 1688 / 814);
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 40 },
      children: [new ImageRun({ type: 'png', data: img(file), transformation: { width: IW, height: IH } })],
    }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [new TextRun({ text: caption, size: 18, italics: true, color: GREY })] }),
  ];
}

// 键值信息行
const kv = (k, v, vColor) => new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: k + '：', bold: true, size: 21, color: INK }), new TextRun({ text: v, size: 21, color: vColor || INK })] });

// 权益对比表
function benefitTable() {
  const rows = [
    ['权益', '免费用户', '会员'],
    ['基础文字知识问答', '✓', '✓'],
    ['图音视频深度知识精讲', '—', '✓'],
    ['VIP 极速优先通道', '—', '✓'],
    ['实时电话即时问答', '—', '✓'],
    ['永享名家典藏知识', '单独购买', '单独购买'],
  ];
  const W = [4600, 2400, 2400];
  const cell = (txt, { head = false, i = 0 } = {}) => new TableCell({
    width: { size: W[i], type: WidthType.DXA },
    shading: head ? { type: ShadingType.CLEAR, fill: '25306B', color: 'auto' } : undefined,
    margins: { top: 60, bottom: 60, left: 90, right: 90 },
    children: [new Paragraph({ alignment: i === 0 ? AlignmentType.LEFT : AlignmentType.CENTER, children: [new TextRun({ text: txt, bold: head, size: 20, color: head ? 'FFFFFF' : INK })] })],
  });
  return new Table({
    width: { size: 9400, type: WidthType.DXA },
    columnWidths: W,
    rows: rows.map((r, ri) => new TableRow({ tableHeader: ri === 0, children: r.map((c, ci) => cell(c, { head: ri === 0, i: ci })) })),
  });
}

const doc = new Document({
  creator: 'AI 问书',
  styles: { default: { document: { run: { font: '微软雅黑' } } } },
  sections: [{
    properties: { page: { margin: { top: 1000, bottom: 1000, left: 1100, right: 1100 } } },
    children: [
      // 封面标题
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: 'AI 问书', bold: true, size: 40, color: INDIGO })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: '微信支付「委托代扣」申请补充材料', bold: true, size: 30, color: INK })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: '（针对驳回原因 ① 第 1 点「申请理由」、第 2 点「产品交互图」补充）', size: 20, color: GREY })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: '日期：2026-07-18', size: 18, color: GREY })] }),
      rule(),

      // ============ 一、申请理由 ============
      H1('一、申请理由（对应驳回原因 ① 第 1 点）'),
      P([T('提示：下方 1.1 为可直接复制到微信「申请理由」输入框的精简版；1.2–1.6 为完整业务说明，供审核人员核对，也可一并粘贴。', { color: TERRA })]),

      H2('1.1 申请理由（可直接复制粘贴版）'),
      P([T('AI 问书是一款在微信服务号内以 H5 承载的「知识问答」服务。合作出版机构将其正版图书 / 专业知识库接入平台，读者扫描纸书或知识页上的二维码进入，即可就书中内容向 AI 提问，答案均标注知识出处。免费用户可进行基础文字问答；用户开通「AI 问书会员·连续包月」后，解锁图音视频深度精讲、实时电话即时问答、VIP 极速优先通道等增值服务。连续包月首月 9.9 元（原价 19.9 元）、次月起 19.9 元 / 月，按月自动续费；开通前须勾选同意《会员服务协议》与《自动续费协议》，每次扣费前 3 天短信提醒，用户可随时在「会员中心」一键退订，退订后当期权益仍可用至期满。另设「单月会员」19.9 元 / 月，一次性购买、到期自动失效不扣款。本次申请委托代扣，即用于「连续包月会员」到期后的自动续费扣款。全部为线上虚拟知识服务，不涉及实物发货。')]),

      H2('1.2 业务场景与产品介绍'),
      P('AI 问书面向「图书 / 专业知识」的读者，解决"读完书仍有疑问、无处追问"的痛点。合作机构（出版社、专业内容方等）把正版内容接入平台并生成知识二维码，印在纸书或知识页上；读者在微信内扫码进入服务号 H5，用自然语言就该书 / 知识库的内容提问，AI 基于机构授权的知识库作答，并逐条标注答案出处（溯源），做到"答案有出处、知识更可信"。'),
      P('产品形态为微信服务号内的 H5 网页（公众号网页授权登录 + JSAPI 支付），用户全程在微信内完成扫码、问答、开通会员与管理续费。'),

      H2('1.3 接入的产品 / 应用名称'),
      kv('产品 / 应用名称', 'AI 问书'),
      kv('承载形态', '微信服务号内 H5（公众号网页）'),
      kv('微信服务号全称', '【请填写：已认证服务号全称】', TERRA),
      kv('商户号 / AppID', '【请填写】', TERRA),
      kv('商户主体（营业执照名称）', '【请填写】', TERRA),

      H2('1.4 会员权益内容'),
      P('会员权益以「免费 vs 会员」对比呈现（详见第二部分「会员权益完整页面」截图）：'),
      benefitTable(),
      new Paragraph({ spacing: { after: 120 }, children: [] }),

      H2('1.5 会员价格'),
      P('会员提供两种购买方式，仅「连续包月」涉及本次委托代扣：'),
      bullet([T('连续包月（自动续费 / 本次委托代扣对象）：', { bold: true }), T('首月 9.9 元（原价 19.9 元），次月起 19.9 元 / 月，按月自动续费，可随时退订，退订后当期权益仍可用至期满。')]),
      bullet([T('单月会员：', { bold: true }), T('19.9 元 / 1 个月，一次性购买，到期自动失效、不再扣款（不涉及代扣）。')]),

      H2('1.6 服务内容'),
      P('AI 问书提供的全部为线上虚拟知识服务，不涉及实物：'),
      bullet('基于合作机构正版知识库的 AI 文字问答，答案标注出处（免费 + 会员均可用）；'),
      bullet('配套图文 / 音频 / 视频深度精讲（会员权益）；'),
      bullet('实时电话（语音）即时问答、VIP 极速优先通道（会员权益）；'),
      bullet('「永享名家典藏知识」为单独购买的一次性买断内容。'),

      H2('1.7 自动续费与退订规则（合规要点）'),
      bullet('开通「连续包月」前，用户须主动勾选并同意《会员服务协议》与《自动续费协议》后方可开通；「单月会员」不涉及自动续费，不展示《自动续费协议》；'),
      bullet('扣费周期为「按月」，续费金额 19.9 元 / 月（首月 9.9 元）；'),
      bullet('每次扣费前（到期前 3 天）以短信提醒用户即将续费；'),
      bullet('退订后不再扣款，且当期已付费权益仍可正常使用至期满，不作中途截断；'),
      bullet([T('退订路径 ≤ 2 步：', { bold: true }), T('「我的 → 会员中心 → 取消自动续费」，并有二次确认，用户可随时关闭代扣（见第二部分退订路径截图）。')]),

      rule(),

      // ============ 二、产品交互图 ============
      H1('二、产品交互图（对应驳回原因 ① 第 2 点）'),
      P([T('以下按微信要求的 5 类截图逐一提供，均取自 AI 问书移动端（微信内 H5）真实界面。', {})]),

      H2('① 应用首页截图'),
      P('用户扫码 / 登录后进入的问答主界面，展示产品定位与知识来源、常见问题入口。'),
      ...figure('01-chat.png', '图 1　应用首页 —— AI 问答主界面'),

      H2('② 服务内容介绍页面截图'),
      P('AI 回答示例：作答内容标注「参考 N 篇知识」（溯源），并提供图文 / 音频 / 视频等相关媒体资源，其中带「会员 / 永享」角标的为付费解锁内容，直观体现服务内容与付费价值。'),
      ...figure('02-chat-answer.png', '图 2　服务内容 —— AI 作答 + 溯源 + 会员/永享媒体资源'),

      H2('③ 会员权益完整页面截图'),
      P('「会员中心」完整展示会员卡（有效期、续费状态）与「免费 vs 会员」权益逐项对比。'),
      ...figure('04-member-center.png', '图 3　会员权益完整页面 —— 免费 vs 会员 权益对比'),

      H2('④ 价目表截图'),
      P('「开通会员」页展示两档价格：连续包月（首月 9.9 元、次月起 19.9 元 / 月自动续费，标注「自动续费 · 可随时取消」「退订后当期仍可用至期满」）与单月会员（19.9 元 / 1 个月，标注「一次性购买 · 不自动续费」），开通前须勾选同意《会员服务协议》与《自动续费协议》。'),
      ...figure('03-member-pricing.png', '图 4　价目表 —— 连续包月自动续费 + 单月 + 自动续费协议'),

      H2('⑤ 指引用户退订自动续费路径截图'),
      P('在「会员中心」点击「取消自动续费」，弹出二次确认，用户确认后即关闭自动续费；页面底部常驻说明「自动续费将于到期前 3 天短信提醒，可随时取消」。退订路径清晰、可随时自助完成。'),
      ...figure('05-unsubscribe.png', '图 5　退订路径 —— 会员中心「取消自动续费」二次确认'),

      rule(),

      // ============ 三、提交前必读 ============
      H1('三、提交前必读（务必先处理）'),
      bullet([T('截图来源说明：', { bold: true, color: TERRA }), T('以上 5 张为 AI 问书移动端界面在 375×812 手机视图下的实拍截图（含机身外框与状态栏），与线上视觉一致，可直接用于本次补充提交；待服务号正式上线后，建议再用真机截图替换一次，效果更佳。')]),
      bullet([T('补全占位信息：', { bold: true, color: TERRA }), T('1.3 中的服务号全称、商户号 / AppID、商户主体三处占位需按实际资质填写，且须与微信支付商户主体一致。')]),
      bullet([T('资质前置：', { bold: true, color: TERRA }), T('委托代扣需「已认证服务号 + 微信支付商户号」；请确认《自动续费协议》已在开通页可点击查阅（当前为占位链接）。')]),
      bullet([T('多机构收款合规（如平台统一收款）：', { bold: true, color: TERRA }), T('若资金先进平台再分给合作机构，可能涉「二清」，建议走微信支付服务商模式（平台=服务商、机构=特约子商户）；此与代扣申请可并行，但架构需尽早确认。')]),
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  const out = path.join(DIR, 'AI问书-微信委托代扣申请材料.docx');
  fs.writeFileSync(out, buf);
  console.log('DONE →', out);
});
