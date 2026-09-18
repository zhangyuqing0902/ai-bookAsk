// AI 问书 · 新机构入驻微信对接清单（docx-js 生成，可重复运行）。面向机构客户，言简意赅。
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel, BorderStyle,
  WidthType, ShadingType, VerticalAlign, PageNumber, ImageRun,
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
function cell(text, { w, head = false, fill, bold = false, rowSpan } = {}) {
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    rowSpan,
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
    // 单元格写法：字符串 / 数组（列表）/ { span: n, t: '文本' }（纵向合并 n 行，粗体）/ null（被上方合并占位，跳过）
    const fill = ri % 2 ? CLR.zebra : undefined;
    trs.push(new TableRow({ children: r.map((c, i) => {
      if (c === null) return null;
      if (Array.isArray(c)) return listCell(c, { w: widths[i], fill });
      if (typeof c === 'object') return cell(c.t, { w: widths[i], rowSpan: c.span, bold: true });
      return cell(c, { w: widths[i], fill });
    }).filter(Boolean) }));
  });
  return new Table({ width: { size: widths.reduce((a, x) => a + x, 0), type: WidthType.DXA }, columnWidths: widths, borders, rows: trs });
}

// 二级标题（附录内小节用）
const H2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 220, after: 110 }, children: [new TextRun({ text, bold: true, font: CJK, color: CLR.h2, size: 25 })] });
// 灰色小字提示
const NOTE = (text) => new Paragraph({ spacing: { after: 120, line: 300 }, children: runs(text, { size: 19, color: CLR.sub }) });
// 可复制的模板正文块（浅底 + 左强调线，提示"这段是拿去粘贴的"）
const TPL = (text) => new Paragraph({
  spacing: { after: 90, line: 320 },
  shading: { type: ShadingType.CLEAR, fill: 'F7F8FC' },
  border: { left: { style: BorderStyle.SINGLE, size: 12, color: CLR.h2, space: 8 } },
  indent: { left: 160, right: 160 },
  children: runs(text, { size: 21 }),
});

// 交互图示例：3 列图格（图 + 图注），images = [{file, cap}]
const SHOT_DIR = path.join(__dirname, '..', 'wechat-daikou', 'assets');
function shotGrid(images, cols = 3) {
  const IW = 118, IH = Math.round(IW * 1688 / 814); // 截图含机身外框，按原比例
  const W = Math.floor(9360 / cols);
  const b = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  const borders = { top: b, bottom: b, left: b, right: b, insideHorizontal: b, insideVertical: b };
  const rows = [];
  for (let i = 0; i < images.length; i += cols) {
    const group = images.slice(i, i + cols);
    while (group.length < cols) group.push(null);
    rows.push(new TableRow({
      children: group.map((g) => new TableCell({
        width: { size: W, type: WidthType.DXA },
        margins: { top: 60, bottom: 120, left: 60, right: 60 },
        verticalAlign: VerticalAlign.TOP,
        children: g ? [
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new ImageRun({ type: 'png', data: fs.readFileSync(path.join(SHOT_DIR, g.file)), transformation: { width: IW, height: IH } })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: runs(g.cap, { size: 17, color: CLR.sub }) }),
        ] : [new Paragraph({ children: [] })],
      })),
    }));
  }
  return new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: new Array(cols).fill(W), borders, rows });
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
      NOTE('本版按平台后台「机构配置 → 微信配置」最新字段更新（2026-09）：新增公众号名称、域名校验文件、APIv2 密钥、商户 API 私钥、微信支付公钥、委托代扣模板 ID；微信开放平台改为必需；微信外支付由 H5 支付改为 Native 扫码支付。'),

      // 一、需在微信完成的准备
      H1('一、需在微信完成的准备'),
      P('三个微信平台均需完成，缺任一项都会导致对应场景无法使用：'),
      table(
        ['微信平台', '需完成的事', '用于的场景'],
        [
          [
            '微信公众平台\n（服务号）',
            ['注册并完成微信认证的**服务号**（订阅号不支持）', '配置网页授权域名、JS 接口安全域名（填平台分配的 H5 域名）', '下载网页授权域名校验文件 MP_verify_xxx.txt，交平台放置到域名根目录'],
            '微信内登录 / 网页授权（获取头像、昵称）；JSAPI 支付',
          ],
          [
            '微信开放平台\n（网站应用）',
            ['注册开放平台账号并完成开发者资质认证', '创建「网站应用」并通过审核（与公众号是两个不同的 AppID）', '配置授权回调域（填平台分配的 H5 域名）'],
            '微信外浏览器（手机 / PC）扫码登录',
          ],
          [
            '微信支付商户平台\n（商户号）',
            ['申请商户号，完成结算账户与法人认证', '开通 **JSAPI 支付**与 **Native 支付**两项产品', '配置 JSAPI 支付授权目录（填平台分配的 H5 域名）', '将商户号与公众号 AppID 关联绑定', '在「账户中心 → API 安全」设置 APIv2 / APIv3 密钥、申请 API 证书、获取微信支付公钥', '**如需售卖「连续包月会员」（自动续费）**：另需开通「委托代扣」并申请签约模板，见第五节与附录 A'],
            '微信内 JSAPI 支付 / 微信外 Native 扫码支付；退款；自动续费扣款',
          ],
        ],
        [2100, 4860, 2400]
      ),

      // 二、需交付给平台的资料
      H1('二、需交付给 AI 问书的资料'),
      P('以下资料交付 AI 问书对接人，由平台在后台「机构配置 → 微信配置」录入。顺序与后台录入顺序一致，可逐项核对：'),
      table(
        ['所属平台', '资料', '在哪里获取', '是否必需'],
        [
          [{ span: 4, t: '微信公众号' }, '公众号名称', '公众平台 → 设置与开发 → 账号设置', '必需'],
          [null, '公众号 AppID、AppSecret', '公众平台 → 设置与开发 → 基本配置（AppSecret 仅生成 / 重置时可见，请当场保存）', '必需'],
          [null, '网页授权回调地址', '平台分配的完整 URL，双方核对与公众号后台配置一致', '必需'],
          [null, '域名校验文件 MP_verify_xxx.txt', '公众平台 → 网页授权域名设置处下载', '必需'],
          [{ span: 2, t: '微信开放平台' }, '网站应用 AppID、AppSecret', '开放平台 → 管理中心 → 网站应用', '必需'],
          [null, '授权回调地址', '平台分配的完整 URL，双方核对与网站应用配置一致', '必需'],
          [{ span: 6, t: '微信支付' }, '商户号 MchID', '商户平台 → 账户中心 → 商户信息', '必需'],
          [null, 'APIv2 密钥', '商户平台 → 账户中心 → API 安全（32 位）', '开通自动续费时必需'],
          [null, 'APIv3 密钥', '同上', '必需'],
          [null, '商户 API 证书 apiclient_cert.pem + 商户 API 私钥 apiclient_key.pem', 'API 安全 → 申请 API 证书（两个文件成对下载、成对交付）', '必需'],
          [null, '微信支付公钥 ID（PUB_KEY_ID_ 开头）+ 公钥文件 pub_key.pem', 'API 安全 → 微信支付公钥', '商户号已发放公钥时必需（2024 年起新注册商户默认发放）'],
          [null, '委托代扣包月模板 ID', '委托代扣签约模板审核通过后获取', '开通自动续费时必需'],
        ],
        [1500, 2860, 3300, 1700]
      ),
      NOTE('若商户号未发放微信支付公钥（部分存量商户仍为平台证书模式），公钥两项可不提供，由平台按证书模式对接。'),

      // 三、双场景
      H1('三、微信内 / 微信外 双场景说明'),
      P('同一个 H5，在微信内 / 外的登录与支付走不同通道，所需配置也不同：'),
      table(
        ['环节', '微信内打开', '微信外打开（手机 / PC 浏览器）'],
        [
          ['登录', '公众号网页授权，获取头像 / 昵称', '微信扫码登录（开放平台网站应用）'],
          ['手机号', ['两种方式都需用户「手机号 + 验证码」绑定（微信不向 H5 提供手机号）'], ['同左']],
          ['支付', 'JSAPI 支付，在微信内直接调起收银台', ['Native 扫码支付', '手机：保存二维码 → 微信扫一扫从相册识别', 'PC：直接用微信扫屏幕二维码']],
          ['依赖配置', '公众号（网页授权 + 域名校验文件）+ 商户号 JSAPI 支付授权目录', '开放平台网站应用 + 商户号已开通 Native 支付'],
        ],
        [1500, 3930, 3930]
      ),
      NOTE('微信外不使用「H5 支付（MWEB）」，贵机构无需申请该产品。支付二维码与订单同为 15 分钟有效，过期需重新下单。'),

      // 四、准备清单 + 注意事项
      H1('四、接入前准备清单与注意事项'),
      BULLET('**服务号**：必须是已微信认证的服务号（订阅号 / 个人号无网页授权与 JSAPI 支付）。'),
      BULLET('**开放平台**：网站应用需单独审核，建议与服务号认证、商户号申请并行办理，避免卡在最后一步。'),
      BULLET('**商户号**：完成结算账户与法人认证，与公众号 AppID 关联绑定，并确认 JSAPI、Native 两项支付产品都已开通，否则对应场景下单会失败。'),
      BULLET('**主体一致**：服务号、开放平台、商户号建议为同一主体；不同主体需额外办理授权绑定。'),
      BULLET('**域名**：H5 域名需 ICP 备案 + https；公众号网页授权域名、JS 接口安全域名、JSAPI 支付授权目录、开放平台授权回调域四处须与平台分配的 H5 域名一致。'),
      BULLET('**凭据安全**：AppSecret、APIv2 / APIv3 密钥、证书与私钥请通过安全渠道交付，不要在群聊明文发送。平台录入后加密存储、界面不回显；如需更换，重新提供新值即整体覆盖。'),
      BULLET('**变更同步**：在微信侧重置 AppSecret、密钥或更换证书后，须同步提供给平台，否则登录 / 支付 / 退款会中断；API 证书有到期日，请提前更换。'),

      // 五、委托代扣（自动续费）
      H1('五、开通「委托代扣」（自动续费）'),
      P('**仅当贵机构要售卖「连续包月会员」时才需要办理。** 若只售卖「单月会员」或「永享」一次性买断内容，跳过本节即可。'),
      P('「委托代扣」是微信支付的独立产品权限，需在商户号开通后**单独申请**，审核由微信支付完成（通常 1–3 个工作日）：'),
      BULLET('**申请入口**：微信支付商户平台 → 产品中心 → 产品大全 → 委托代扣 → 申请开通。'),
      BULLET('**需提交两部分材料**：① 申请理由（业务场景、产品名称、会员权益、会员价格、服务内容）；② 产品交互图（5 张指定页面截图）。材料模板与示例见 **附录 A**，照抄替换即可。'),
      BULLET('**两个最常见的驳回原因**：申请理由写得过于简单、交互图缺张（尤其缺「退订自动续费路径」截图）。被驳回后在原申请上逐条补充并「重新提交」，不要新建申请。'),
      BULLET('**权限开通后申请签约模板**：按月扣费；金额建议选「不高于」型、上限设为月度原价（首月优惠、降价时均按更低价扣款）。模板审核通过后微信分配**模板 ID**（plan_id），连同 **APIv2 密钥**一并交付平台录入，平台即为贵机构开启「连续包月」售卖入口。'),
      P('以下续费规则由平台统一执行，贵机构无需操作，了解即可（申请理由中已写入）：'),
      BULLET('**扣费日**＝会员到期日当天；扣费前 5 天短信提醒，扣费成功后短信告知。'),
      BULLET('**调价**：存量用户按「签约价与当前售价孰低」扣款——降价随之降，涨价不多扣。'),
      BULLET('**扣款失败**：自扣费日起每日重试一次、最多 3 次，均在到期后 72 小时缓冲期内；仍失败则停止扣款并主动解除签约，不跨周期补扣。'),
      BULLET('**机构停用**：停用当天平台会批量解除该机构全部自动续费签约，并短信告知用户。'),

      // 六、资金说明
      H1('六、资金说明'),
      BULLET('机构 C 端用户的支付资金，直接进入机构自己的微信支付商户号。'),
      BULLET('退款由机构在自己的商户号原路退回；平台仅记录订单与退款状态。'),
      BULLET('自动续费扣款同样进入机构自己的商户号，由机构商户号发起代扣。'),
      new Paragraph({ spacing: { before: 160 }, children: [new TextRun({ text: '如准备过程中遇到微信侧问题，请联系 AI 问书对接人协助。', font: CJK, size: 20, color: CLR.sub })] }),

      // ============ 附录 A ============
      new Paragraph({ pageBreakBefore: true, spacing: { after: 60 }, children: [new TextRun({ text: '附录 A', font: CJK, bold: true, size: 32, color: CLR.h1 })] }),
      new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: '「委托代扣」申请材料模板', font: CJK, bold: true, size: 26, color: CLR.ink })] }),
      new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: CLR.h2, space: 1 } }, spacing: { after: 140 }, children: [] }),
      P('各机构需各自向微信提交申请，但**材料内容基本一致**——C 端产品（AI 问书 H5）、会员权益与续费规则由平台统一提供。贵机构只需替换【】中的自有信息，并用**贵机构自己的 H5** 截取交互图。'),

      H2('A.1　申请理由（复制后替换【】内容）'),
      TPL('「AI 问书」是【机构名称】在微信服务号内以 H5 承载的知识问答服务。【机构名称】将其正版图书 / 专业知识库接入平台，读者扫描纸书或知识页上的二维码进入，即可就书中内容向 AI 提问，答案均标注知识出处。免费用户可进行基础文字问答；用户开通会员后，解锁图音视频深度精讲、实时电话即时问答、VIP 极速优先通道等增值服务。'),
      TPL('会员提供两种购买方式：**连续包月**——首月【首月折扣价】、次月起【月度价】/ 月，按月自动续费，扣费日为会员到期日当天；开通前须主动勾选同意《AI 会员服务与永享服务协议》与《自动续费协议》（默认不勾选），每次扣费前 5 天短信提醒、扣费成功后短信告知；调价时已签约用户按签约价与当前售价孰低扣款，不会因涨价多扣。用户可随时在「会员中心」一键取消自动续费，或在微信「我的 → 服务 → 钱包 → 支付设置 → 自动续费」中管理，取消后当期权益仍可用至期满。**单月会员**——【月度价】/ 1 个月，一次性购买，到期不扣款、不自动续期。两种会员到期后均赠送 72 小时缓冲使用期。'),
      TPL('本次申请委托代扣，仅用于「连续包月会员」到期当天的自动续费扣款；扣款失败时每日重试一次、最多 3 次，仍失败即停止扣款并主动解除签约，不跨周期补扣。全部为线上虚拟知识服务，不涉及实物发货。服务号：【服务号全称】；商户号：【MchID】；商户主体：【营业执照名称】。'),
      P('**需替换的占位共 6 处**：'),
      table(
        ['占位', '填什么', '从哪里取'],
        [
          ['【机构名称】', '贵机构对外品牌名 / 知识来源方名称', '与 C 端首页展示的「知识由 XX 提供」一致'],
          ['【首月折扣价】', '首月优惠价，如 ¥9.9', 'AI 问书机构后台 → 系统配置 → AI 会员价格'],
          ['【月度价】', '月度价，如 ¥19.9', '同上'],
          ['【服务号全称】', '已认证服务号全称', '微信公众平台'],
          ['【MchID】', '微信支付商户号', '微信支付商户平台'],
          ['【营业执照名称】', '商户主体全称', '营业执照'],
        ],
        [1900, 3730, 3730]
      ),
      NOTE('注意：价格务必与贵机构机构后台「系统配置 → AI 会员价格」的实际设置一致（平台默认首月 ¥9.9、月度 ¥19.9）。若两者不符，微信侧可能以「价格与实际不符」再次驳回。'),

      H2('A.2　产品交互图（5 张，缺一即驳回）'),
      table(
        ['#', '截图页面', '在 C 端的位置', '必须体现的要素'],
        [
          ['1', '应用首页', '登录后的 AI 问答主界面', '产品名称、知识来源机构'],
          ['2', '服务内容介绍', '任一问题的 AI 回答页', 'AI 答案 + 知识溯源 + 带「会员 / 永享」标识的媒体资源'],
          ['3', '会员权益完整页', '我的 → 会员中心（有效会员态）', '会员有效期、按月自动续费状态、「免费 vs 会员」全部权益逐项对比'],
          ['4', '价目表', '开通会员页', '连续包月与单月两档价格、自动续费标识、72 小时缓冲提示、协议勾选项（默认不勾选）'],
          ['5', '退订自动续费路径', '会员中心 → 取消自动续费', '退订入口 + 点击后的二次确认弹窗'],
        ],
        [560, 1900, 2400, 4500]
      ),
      new Paragraph({ spacing: { after: 100 }, children: [] }),
      P('**示例如下**（截自 AI 问书 C 端标准界面）：'),
      shotGrid([
        { file: '01-chat.png', cap: '图 A-1　应用首页' },
        { file: '02-chat-answer.png', cap: '图 A-2　服务内容介绍' },
        { file: '04-member-center.png', cap: '图 A-3　会员权益完整页' },
        { file: '03-member-pricing.png', cap: '图 A-4　价目表' },
        { file: '05-unsubscribe.png', cap: '图 A-5　退订自动续费路径' },
      ]),
      NOTE('上图仅为示例（示例中的知识来源为演示机构）。请在贵机构自己的 H5 域名下截取相同的 5 个页面：需含完整手机界面、保留顶部标题栏，不要裁切；截图中不得出现「测试 / 演示 / 未上线」等字样。'),

      H2('A.3　提交前自查'),
      BULLET('5 张交互图齐全，且均截自**贵机构自己的** H5 域名。'),
      BULLET('申请理由中的价格，与机构后台「系统配置 → AI 会员价格」的实际设置一致。'),
      BULLET('服务号主体、商户号主体、营业执照主体三者一致。'),
      BULLET('「退订自动续费路径」这张最容易漏，务必包含点击后的二次确认弹窗。'),
      BULLET('被驳回时在原申请上「重新提交」，逐条对应驳回原因补充，不要新建申请。'),
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
