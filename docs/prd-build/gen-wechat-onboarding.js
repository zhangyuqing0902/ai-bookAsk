// AI 问书 · 新机构入驻微信对接清单（docx-js 生成，可重复运行）。面向机构客户，言简意赅。
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel, BorderStyle,
  WidthType, ShadingType, VerticalAlign, PageNumber,
} = require('docx');

const OUT = path.join(__dirname, '..', 'AI问书-新机构入驻微信对接清单.docx');
const CLR = { ink: '1F2440', h1: '3730A3', h2: '4F46E5', sub: '6B7185', line: 'D9DCEA', th: '3730A3', zebra: 'F7F8FC' };
const CJK = { ascii: 'Arial', eastAsia: 'PingFang SC', hAnsi: 'Arial', cs: 'Arial' };

function runs(text, base = {}) {
  const out = [];
  for (const p of String(text).split(/(\*\*[^*]+\*\*)/g)) {
    if (!p) continue;
    if (p.startsWith('**') && p.endsWith('**')) out.push(new TextRun({ text: p.slice(2, -2), bold: true, font: CJK, ...base }));
    else out.push(new TextRun({ text: p, font: CJK, ...base }));
  }
  return out;
}
const P = (text, opts = {}) => new Paragraph({ spacing: { after: 120, line: 312 }, children: runs(text, opts.run || {}), ...opts });
const H1 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 150 }, children: [new TextRun({ text, bold: true, font: CJK, color: CLR.h1, size: 30 })] });
const BULLET = (text) => new Paragraph({ numbering: { reference: 'b', level: 0 }, spacing: { after: 70, line: 300 }, children: runs(text) });

// 表格单元格：单行文本
function cell(text, { w, head = false, fill, bold = false } = {}) {
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
    children: [new Paragraph({ spacing: { after: 0, line: 288 }, children: runs(text, head ? { bold: true, color: 'FFFFFF', size: 21 } : { bold, size: 21 }) })],
  });
}
// 表格单元格：多条 → 无序列表，垂直左对齐
function listCell(lines, { w, fill } = {}) {
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
    children: lines.map((ln) => new Paragraph({ numbering: { reference: 'tb', level: 0 }, spacing: { after: 50, line: 276 }, children: runs(ln, { size: 21 }) })),
  });
}
function table(headers, rows, widths) {
  const b = { style: BorderStyle.SINGLE, size: 1, color: CLR.line };
  const borders = { top: b, bottom: b, left: b, right: b, insideHorizontal: b, insideVertical: b };
  const trs = [new TableRow({ tableHeader: true, children: headers.map((h, i) => cell(h, { w: widths[i], head: true, fill: CLR.th })) })];
  rows.forEach((r, ri) => {
    trs.push(new TableRow({ children: r.map((c, i) => (Array.isArray(c) ? listCell(c, { w: widths[i], fill: ri % 2 ? CLR.zebra : undefined }) : cell(c, { w: widths[i], fill: ri % 2 ? CLR.zebra : undefined }))) }));
  });
  return new Table({ width: { size: widths.reduce((a, x) => a + x, 0), type: WidthType.DXA }, columnWidths: widths, borders, rows: trs });
}

const doc = new Document({
  styles: { default: { document: { run: { font: CJK, size: 22, color: CLR.ink } } } },
  numbering: {
    config: [
      { reference: 'b', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 460, hanging: 240 } } } }] },
      { reference: 'tb', levels: [{ level: 0, format: LevelFormat.BULLET, text: '·', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 220, hanging: 180 } } } }] },
    ],
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'AI 问书 · 新机构入驻微信对接清单', font: CJK, size: 16, color: CLR.sub })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '第 ', font: CJK, size: 16, color: CLR.sub }), new TextRun({ children: [PageNumber.CURRENT], font: CJK, size: 16, color: CLR.sub }), new TextRun({ text: ' 页', font: CJK, size: 16, color: CLR.sub })] })] }) },
    children: [
      new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: 'AI 问书 · 新机构入驻', font: CJK, bold: true, size: 40, color: CLR.h1 })] }),
      new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: '微信对接清单', font: CJK, bold: true, size: 32, color: CLR.ink })] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: '贵机构接入前需在微信完成的准备、需提供给平台的资料与注意事项', font: CJK, size: 21, color: CLR.sub })] }),
      new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: CLR.h2, space: 1 } }, spacing: { after: 140 }, children: [] }),

      P('AI 问书 C 端为微信生态 H5，支持「微信内」与「微信外」两种打开方式，均可完成登录与支付。机构 C 端用户的资金将直接进入机构自己的微信支付商户号。'),

      // 一、需准备的资质与资料（合并原"做什么"+"给什么数据"）
      H1('一、需在微信完成的准备与需提供的资料'),
      P('请按下表在对应微信平台完成注册 / 配置，并将「需提供」的资料交付 AI 问书对接人（平台后台「机构配置 → 微信配置」录入）：'),
      table(
        ['微信平台', '需完成的事 + 需提供给 AI 问书的资料', '用于的场景'],
        [
          [
            '微信公众平台\n（注册并认证服务号）',
            ['注册并完成微信认证的服务号（订阅号不支持）', '配置网页授权回调域名、JS 安全域名（填平台分配的 H5 域名）', '需提供：AppID、AppSecret、网页授权回调域名、JS 安全域名'],
            '用户微信登录 / 网页授权（获取头像、昵称、性别、地区）',
          ],
          [
            '微信支付商户平台\n（开通商户号）',
            ['申请微信支付商户号，完成结算账户与法人认证', '设置 APIv3 密钥、下载 API 证书', '配置支付授权目录（JSAPI）与 H5 支付域名（微信外）', '将商户号与公众号 AppID 绑定', '需提供：商户号 MchID、APIv3 密钥、API 证书（apiclient_cert.pem + apiclient_key.pem）、证书序列号'],
            '用户支付与退款（微信内 JSAPI / 微信外 H5）',
          ],
          [
            '微信开放平台\n（按需）',
            ['仅当需要「微信外浏览器扫码登录」时：注册开放平台并创建网站应用', '需提供：网站应用 AppID、AppSecret'],
            '微信外浏览器扫码登录',
          ],
        ],
        [2300, 4660, 2400]
      ),

      // 二、双场景
      H1('二、微信内 / 微信外 双场景说明'),
      P('同一个 H5，在微信内 / 外的登录与支付走不同通道，所需配置也不同：'),
      table(
        ['环节', '微信内打开', '微信外打开'],
        [
          ['登录', '公众号网页授权弹窗，获取头像 / 昵称', '微信扫码登录（开放平台网站应用）'],
          ['手机号', ['两种方式都需用户「手机号 + 验证码」绑定（微信不向 H5 提供手机号）'], ['同左']],
          ['支付', 'JSAPI 支付（公众号支付，应内直接调起）', 'H5 支付（跳转微信完成后返回）'],
          ['依赖配置', '公众号网页授权域名 + 商户号支付授权目录', '开放平台网站应用 + 商户号 H5 支付域名'],
        ],
        [1500, 3930, 3930]
      ),

      // 三、准备清单 + 注意事项（合并原五+六）
      H1('三、接入前准备清单与注意事项'),
      BULLET('**服务号**：必须是已微信认证的服务号（订阅号 / 个人号无网页授权与 JSAPI 支付）。'),
      BULLET('**商户号**：已开通微信支付商户号，完成结算账户与法人认证，并与公众号 AppID 绑定（同主体或授权），否则支付下单会失败。'),
      BULLET('**域名**：H5 域名需 ICP 备案 + https；网页授权回调域名、JS 安全域名、支付授权目录三处都要配置且与实际 H5 域名一致。'),
      BULLET('**微信外扫码登录**（如需）：已注册开放平台并创建网站应用。'),
      BULLET('**凭据安全**：APIv3 密钥与 API 证书请通过安全渠道交付，不要在群聊明文发送。'),
      BULLET('**证书有效期**：API 证书 / 密钥到期需更换并同步给平台，否则支付 / 退款会中断。'),
      BULLET('**资料齐备**：AppID / AppSecret / MchID / APIv3 密钥 / API 证书（及网站应用 AppID，如需）均备齐后交付平台录入。'),

      // 四、资金说明
      H1('四、资金说明'),
      BULLET('机构 C 端用户的支付资金，直接进入机构自己的微信支付商户号。'),
      BULLET('退款由机构在自己的商户号原路退回；平台仅记录订单与退款状态。'),
      new Paragraph({ spacing: { before: 160 }, children: [new TextRun({ text: '如准备过程中遇到微信侧问题，请联系 AI 问书对接人协助。', font: CJK, size: 20, color: CLR.sub })] }),
    ],
  }],
});

// 同时输出到平台后台 public/，供顶栏「下载清单」按钮直接下载（保持与本文档同步）
const PUB = path.join(__dirname, '..', '..', 'apps', 'platform-admin', 'public', 'wechat-onboarding.docx');
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  fs.mkdirSync(path.dirname(PUB), { recursive: true });
  fs.writeFileSync(PUB, buf);
  console.log('written:', OUT, '+', PUB, buf.length, 'bytes');
});
