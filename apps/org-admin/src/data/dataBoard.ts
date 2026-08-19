// 0714：数据看板 mock 从 DataBoard.tsx 下移为纯数据文件（导出 spec / 模板脚本需在 node 直接 import，
// 不能引 react / .tsx / css）。视图只管渲染，数据与口径（kwMult / kpFactor）都在这里。

export const I = 'var(--indigo)', J = 'var(--jade)', A = 'var(--amber)', T = 'var(--terra)', G = 'var(--ink-3)';
export type Bar = { nm: string; pct: number; color: string; pv: string };

// 0819：转化漏斗重构——原「纯百分比横条」升级为标准漏斗结构。
// 三条第一性原理决策（详见 docs/feature-list.md 指标口径附表）：
//   ① 起点前移：会员漏斗由 3 步（看到会员页起）改 4 步（可转化用户起）。原起点默认「曝光已发生」，
//      把「七成可转化用户根本没打开过会员页」这个最大漏点藏在了漏斗之外，导致优化资源被导向错误环节。
//   ② 分母为「可转化人群」：剔除区间内全程有效会员——他们没有「要不要开通」的决策可做，
//      留在分母只会稀释；且机构会员占比越高被污染越重，形成反向激励。
//      注意：区间内到期的会员不剔除，他们那一刻重新面临续费决策，属可转化人群。
//   ③ 永享统计单元＝「用户 × KP」对，不是用户。永享按 KP 买断，一个用户撞 3 本墙只买 1 本时，
//      按用户去重会把他记成「转化成功」（66.7%），而真实转化是 33.3%——且用户越重度高估越厉害。
//      会员是账号级唯一的，按用户去重天然正确；两个漏斗单元不同，是因为售卖单元本来就不同。
// 闭合漏斗（closed funnel）：后一步人群必须是前一步的严格子集，故各步单调不增、永不出现 >100%。
export type FunnelStep = {
  nm: string;
  cnt: number;      // 绝对量（人 / 对），随机构集合缩放
  step?: string;    // 步间转化率 = 本步 ÷ 上一步；第一步无
  cum: string;      // 累计转化率 = 本步 ÷ 第一步；同时用作条宽
  color: string;
};
// foot：卡底副指标，均为绝对量、随机构集合缩放。
// （0819 二版删去「人均购买」后不再有比值型副指标，原区分缩放与否的 scale 字段随之移除——
//   留一个恒为 true 的字段和一条永不执行的分支只会误导后来人。）
export type FunnelFoot = { lab: string; val: number; suf: string };
export type Funnel = {
  unit: string;     // 统计单元后缀：'人' / '对'
  steps: FunnelStep[];
  overall: string;  // 整体转化率 = 末步 ÷ 首步
  foot: FunnelFoot[];
};
export type KW = { w: string; s: number };

// 0714：各 KPI 补环比字段 xxxDelta:number（较上一周期百分比，正=上升绿↑ / 负=下降红↓），
// 与主控台 Delta 同款渲染；率类指标（退款率/反馈率）给负值更贴近真实（负面指标下降是好事）。
// 0724：活跃概览（DAU/WAU/MAU）为页级常驻区块，不随区间筛选联动（推翻 0717 二批联动口径）。
// 0814：WAU/MAU 由「含今日的滚动窗口」改为「截至昨日 24:00 的 7/30 个完整自然日」，与区间档同口径；
//   DAU 保持今日 00:00 至当前时刻（环比昨日同已过时长），是三卡里唯一含今日的实时口径。
//   周活与区间档「近 7 天活跃用户」自此数值重合——这是口径统一的必然结果，不是重复统计。
export const ACTIVE_SNAPSHOT = {
  dau: '1,240', dauDelta: 2.4,
  wau: '5,600', wauDelta: 2.2,
  mau: '1.2万', mauDelta: 3.4,
};

export interface RangeData {
  // —— 用户域 ——
  newUsers: string; newUsersDelta: number;
  // 0717 二批 #8.4：新增用户迷你趋势折线（随区间联动）
  newTrend: { x: string[]; v: number[] };
  saoma: number; // 扫码占比%（直接访问 = 100 - saoma）
  // 0717 二批 #7：来源分布补人数与占比环比（较上一周期,百分点）
  saomaCnt: string; directCnt: string; saomaDelta: number;
  region: Bar[];
  gender: Bar[];
  // —— 提问域 ——
  askTrend: { x: string[]; v: number[] };
  totalAsk: string; perUser: string; rounds: string;
  likeRate: string; fbRate: string; // 答案质量摘要
  totalAskDelta: number; perUserDelta: number; roundsDelta: number;
  likeRateDelta: number; fbRateDelta: number;
  agent: Bar[];
  domain: Bar[];
  keywords: KW[];
  kwMult: number; // 词云 hover 数量 = s × kwMult（随区间）
  // —— 营收域 ——
  gmv: string; payUsers: string; payRate: string; arppu: string; renew: string;
  gmvDelta: number; payUsersDelta: number; payRateDelta: number; arppuDelta: number; renewDelta: number;
  // 0722：回流会员（过期后重新开通；不算新增、不算续费）
  reflow: string; reflowDelta: number;
  limit: string; // 受限内容触发率（漏斗入口，按「次」计）
  // 0819：触发率的分子分母显性化——同排另两张卡已给绝对量，只有它是光秃秃一个百分比，
  // 且它按「次」计、右侧两个漏斗按「人 / 用户×KP 对」计，把两个绝对数摆出来才看得出单位差异。
  limitHits: number; // 分子：区间内触发付费墙次数
  limitBase: number; // 分母：同区间总提问数（＝ totalAsk 的精确值；提问分析 Tab 的 KPI 仍按万进制展示）
  memberFunnel: Funnel;
  yxFunnel: Funnel;
  refundAmt: string; refundRate: string; refundOrders: string; netGmv: string;
  refundAmtDelta: number; refundRateDelta: number; refundOrdersDelta: number; netGmvDelta: number;
  // —— 热门 KP：榜单数值随区间缩放 ——
  kpFactor: number;
}


// 0806：父机构视角多选机构——绝对量按所选机构集合系数缩放（w=1 时原样返回，保证子/独立视角零变化）。
// 规则：计数/金额类字符串（'48' '1,240' '1.2万' '¥25.6万'）解析后 ×w 重新格式化；率值/人均/时长/占比不缩放。
export function scaleCnNum(v: string, w: number): string {
  if (w === 1) return v;
  const m = v.match(/^(¥?)([\d,.]+)(万?)$/);
  if (!m) return v;
  const num = parseFloat(m[2].replace(/,/g, '')) * (m[3] ? 10000 : 1) * w;
  const fmt = num >= 10000 ? String(Math.round(num / 1000) / 10) + '万' : Math.round(num).toLocaleString('en-US');
  return m[1] + fmt;
}

/** 0819：漏斗缩放——绝对量（步骤人数/对数、foot 各项）×w；转化率是比值，不缩放。 */
function scaleFunnel(f: Funnel, w: number): Funnel {
  return {
    ...f,
    steps: f.steps.map((st) => ({ ...st, cnt: Math.max(0, Math.round(st.cnt * w)) })),
    foot: f.foot.map((ft) => ({ ...ft, val: Math.max(0, Math.round(ft.val * w)) })),
  };
}

export function scaleRangeData(d: RangeData, w: number): RangeData {
  if (w === 1) return d;
  const s = (v: string) => scaleCnNum(v, w);
  return {
    ...d,
    newUsers: s(d.newUsers),
    saomaCnt: s(d.saomaCnt),
    directCnt: s(d.directCnt),
    newTrend: { x: d.newTrend.x, v: d.newTrend.v.map((x) => Math.max(0, Math.round(x * w))) },
    askTrend: { x: d.askTrend.x, v: d.askTrend.v.map((x) => Math.max(0, Math.round(x * w))) },
    totalAsk: s(d.totalAsk),
    gmv: s(d.gmv),
    payUsers: s(d.payUsers),
    reflow: s(d.reflow),
    refundAmt: s(d.refundAmt),
    refundOrders: s(d.refundOrders),
    netGmv: s(d.netGmv),
    limitHits: Math.max(0, Math.round(d.limitHits * w)),
    limitBase: Math.max(0, Math.round(d.limitBase * w)),
    memberFunnel: scaleFunnel(d.memberFunnel, w),
    yxFunnel: scaleFunnel(d.yxFunnel, w),
    kwMult: d.kwMult * w,
    kpFactor: d.kpFactor * w,
  };
}

/** 0806：活跃概览快照缩放（DAU/WAU/MAU 绝对量 ×w，环比率不变） */
export function scaleActiveSnapshot(w: number): typeof ACTIVE_SNAPSHOT {
  if (w === 1) return ACTIVE_SNAPSHOT;
  return {
    ...ACTIVE_SNAPSHOT,
    dau: scaleCnNum(ACTIVE_SNAPSHOT.dau, w),
    wau: scaleCnNum(ACTIVE_SNAPSHOT.wau, w),
    mau: scaleCnNum(ACTIVE_SNAPSHOT.mau, w),
  };
}

export const RANGE: Record<string, RangeData> = {
  '今日': {
    newUsers: '48', newUsersDelta: 4.0,
    newTrend: { x: ['00时', '04时', '08时', '12时', '16时', '20时', '现在'], v: [3, 2, 7, 11, 9, 10, 6] },
    saoma: 70, saomaCnt: '34', directCnt: '14', saomaDelta: 1.2,
    region: [{ nm: '上海', pct: 100, color: I, pv: '25%' }, { nm: '北京', pct: 80, color: I, pv: '20%' }, { nm: '广东', pct: 68, color: J, pv: '17%' }, { nm: '江浙', pct: 52, color: A, pv: '13%' }, { nm: '其他', pct: 96, color: G, pv: '25%' }],
    gender: [{ nm: '女', pct: 100, color: T, pv: '53%' }, { nm: '男', pct: 79, color: I, pv: '42%' }, { nm: '未知', pct: 10, color: G, pv: '5%' }],
    askTrend: { x: ['00时', '04时', '08时', '12时', '16时', '20时', '现在'], v: [120, 90, 260, 520, 610, 700, 540] },
    totalAsk: '1,180', perUser: '24.1', rounds: '3.2',
    likeRate: '95.2%', fbRate: '2.1%',
    totalAskDelta: 3.2, perUserDelta: 1.5, roundsDelta: 0.8, likeRateDelta: 0.4, fbRateDelta: -0.6,
    agent: [{ nm: '李医生', pct: 92, color: I, pv: '46%' }, { nm: '王老师', pct: 58, color: J, pv: '29%' }, { nm: '机构 Agent', pct: 50, color: A, pv: '25%' }],
    domain: [{ nm: '心血管', pct: 100, color: I, pv: '28%' }, { nm: '脑科学 / 卒中', pct: 72, color: I, pv: '20%' }, { nm: '超声', pct: 60, color: J, pv: '17%' }, { nm: '心理', pct: 44, color: A, pv: '12%' }, { nm: '内分泌', pct: 33, color: A, pv: '9%' }, { nm: '其他', pct: 50, color: G, pv: '14%' }],
    keywords: [{ w: '高血压', s: 5 }, { w: '血糖偏高', s: 3 }, { w: '心电图', s: 4 }, { w: '用药剂量', s: 4 }, { w: '副作用', s: 3 }, { w: '复查', s: 2 }, { w: '头晕', s: 3 }, { w: '咖啡', s: 2 }, { w: '胸闷', s: 2 }, { w: '化验单', s: 3 }, { w: '心率', s: 2 }, { w: '失眠', s: 1 }],
    kwMult: 8,
    gmv: '¥1.1万', payUsers: '32', payRate: '5.8%', arppu: '¥98.4', renew: '36%',
    gmvDelta: 5.2, payUsersDelta: 4.1, payRateDelta: 0.9, arppuDelta: 1.2, renewDelta: 2.0,
    reflow: '5', reflowDelta: 3.2,
    limit: '11%', limitHits: 130, limitBase: 1180,
    memberFunnel: {
      unit: '人',
      steps: [
        { nm: '可转化用户', cnt: 760, cum: '100%', color: I },
        { nm: '看到会员页', cnt: 185, step: '24.3%', cum: '24.3%', color: I },
        { nm: '点击购买', cnt: 44, step: '23.8%', cum: '5.8%', color: I },
        { nm: '完成支付', cnt: 26, step: '59.1%', cum: '3.4%', color: J },
      ],
      overall: '3.4%',
      foot: [
        { lab: '区间活跃用户', val: 1240, suf: '人' },
        { lab: '已排除全程有效会员', val: 480, suf: '人' },
      ],
    },
    yxFunnel: {
      unit: '对',
      steps: [
        { nm: '触发永享墙', cnt: 71, cum: '100%', color: A },
        { nm: '点击购买', cnt: 20, step: '28.2%', cum: '28.2%', color: A },
        { nm: '完成支付', cnt: 10, step: '50.0%', cum: '14.1%', color: J },
      ],
      overall: '14.1%',
      foot: [
        { lab: '触发人数', val: 41, suf: '人' },
        { lab: '购买人数', val: 8, suf: '人' },
      ],
    },
    refundAmt: '¥1,240', refundRate: '1.6%', refundOrders: '12', netGmv: '¥9,860',
    refundAmtDelta: -3.5, refundRateDelta: -0.8, refundOrdersDelta: -2.4, netGmvDelta: 5.6,
    kpFactor: 0.04,
  },
  '7 日': {
    newUsers: '320', newUsersDelta: 6.0,
    newTrend: { x: ['07-09', '07-10', '07-11', '07-12', '07-13', '07-14', '07-15'], v: [38, 42, 45, 50, 44, 48, 53] },
    saoma: 68, saomaCnt: '216', directCnt: '104', saomaDelta: 2.1,
    region: [{ nm: '上海', pct: 100, color: I, pv: '24%' }, { nm: '北京', pct: 82, color: I, pv: '19%' }, { nm: '广东', pct: 70, color: J, pv: '17%' }, { nm: '江浙', pct: 58, color: A, pv: '14%' }, { nm: '其他', pct: 100, color: G, pv: '26%' }],
    gender: [{ nm: '女', pct: 100, color: T, pv: '54%' }, { nm: '男', pct: 78, color: I, pv: '41%' }, { nm: '未知', pct: 12, color: G, pv: '5%' }],
    askTrend: { x: ['05-25', '05-26', '05-27', '05-28', '05-29', '05-30', '05-31'], v: [3800, 4200, 4000, 4600, 4400, 4800, 5000] },
    totalAsk: '3.2万', perUser: '25.8', rounds: '3.4',
    likeRate: '94.6%', fbRate: '2.4%',
    totalAskDelta: 6.4, perUserDelta: 2.1, roundsDelta: 1.1, likeRateDelta: 0.6, fbRateDelta: -1.2,
    agent: [{ nm: '李医生', pct: 90, color: I, pv: '45%' }, { nm: '王老师', pct: 60, color: J, pv: '30%' }, { nm: '机构 Agent', pct: 50, color: A, pv: '25%' }],
    domain: [{ nm: '心血管', pct: 100, color: I, pv: '28%' }, { nm: '脑科学 / 卒中', pct: 76, color: I, pv: '21%' }, { nm: '超声', pct: 58, color: J, pv: '16%' }, { nm: '心理', pct: 44, color: A, pv: '12%' }, { nm: '内分泌', pct: 33, color: A, pv: '9%' }, { nm: '其他', pct: 50, color: G, pv: '14%' }],
    keywords: [{ w: '高血压', s: 5 }, { w: '血糖', s: 4 }, { w: '心电图', s: 4 }, { w: '用药剂量', s: 5 }, { w: '副作用', s: 3 }, { w: '复查', s: 3 }, { w: '头晕', s: 2 }, { w: '咖啡', s: 2 }, { w: '胸闷', s: 3 }, { w: '化验单', s: 3 }, { w: '心率', s: 2 }, { w: '失眠', s: 2 }, { w: '饮食禁忌', s: 3 }, { w: '体检报告', s: 2 }],
    kwMult: 60,
    gmv: '¥25.6万', payUsers: '210', payRate: '6.6%', arppu: '¥99.6', renew: '38%',
    gmvDelta: 7.8, payUsersDelta: 6.6, payRateDelta: 1.3, arppuDelta: 1.8, renewDelta: 3.0,
    reflow: '38', reflowDelta: 4.5,
    limit: '12%', limitHits: 3840, limitBase: 32000,
    memberFunnel: {
      unit: '人',
      steps: [
        { nm: '可转化用户', cnt: 3900, cum: '100%', color: I },
        { nm: '看到会员页', cnt: 1050, step: '26.9%', cum: '26.9%', color: I },
        { nm: '点击购买', cnt: 294, step: '28.0%', cum: '7.5%', color: I },
        { nm: '完成支付', cnt: 180, step: '61.2%', cum: '4.6%', color: J },
      ],
      overall: '4.6%',
      foot: [
        { lab: '区间活跃用户', val: 5600, suf: '人' },
        { lab: '已排除全程有效会员', val: 1700, suf: '人' },
      ],
    },
    yxFunnel: {
      unit: '对',
      steps: [
        { nm: '触发永享墙', cnt: 370, cum: '100%', color: A },
        { nm: '点击购买', cnt: 104, step: '28.1%', cum: '28.1%', color: A },
        { nm: '完成支付', cnt: 55, step: '52.9%', cum: '14.9%', color: J },
      ],
      overall: '14.9%',
      foot: [
        { lab: '触发人数', val: 205, suf: '人' },
        { lab: '购买人数', val: 42, suf: '人' },
      ],
    },
    refundAmt: '¥8,600', refundRate: '2.1%', refundOrders: '86', netGmv: '¥24.7万',
    refundAmtDelta: -4.2, refundRateDelta: -1.5, refundOrdersDelta: -3.1, netGmvDelta: 8.1,
    kpFactor: 0.25,
  },
  '30 日': {
    newUsers: '1,280', newUsersDelta: 9.0,
    newTrend: { x: ['06-16', '06-21', '06-26', '07-01', '07-06', '07-11', '07-15'], v: [220, 260, 290, 310, 330, 360, 400] },
    saoma: 66, saomaCnt: '845', directCnt: '435', saomaDelta: -0.8,
    region: [{ nm: '上海', pct: 100, color: I, pv: '23%' }, { nm: '北京', pct: 84, color: I, pv: '19%' }, { nm: '广东', pct: 74, color: J, pv: '17%' }, { nm: '江浙', pct: 62, color: A, pv: '15%' }, { nm: '其他', pct: 100, color: G, pv: '26%' }],
    gender: [{ nm: '女', pct: 100, color: T, pv: '55%' }, { nm: '男', pct: 76, color: I, pv: '40%' }, { nm: '未知', pct: 12, color: G, pv: '5%' }],
    askTrend: { x: ['05-02', '05-07', '05-12', '05-17', '05-22', '05-27', '06-01'], v: [4200, 4500, 4800, 5200, 5600, 6000, 6400] },
    totalAsk: '12.8万', perUser: '28.4', rounds: '3.6',
    likeRate: '93.8%', fbRate: '2.8%',
    totalAskDelta: 9.2, perUserDelta: 3.4, roundsDelta: 1.6, likeRateDelta: 0.9, fbRateDelta: -1.8,
    agent: [{ nm: '李医生', pct: 88, color: I, pv: '44%' }, { nm: '王老师', pct: 62, color: J, pv: '31%' }, { nm: '机构 Agent', pct: 50, color: A, pv: '25%' }],
    domain: [{ nm: '心血管', pct: 100, color: I, pv: '27%' }, { nm: '脑科学 / 卒中', pct: 80, color: I, pv: '22%' }, { nm: '超声', pct: 58, color: J, pv: '16%' }, { nm: '心理', pct: 44, color: A, pv: '12%' }, { nm: '内分泌', pct: 33, color: A, pv: '9%' }, { nm: '其他', pct: 52, color: G, pv: '14%' }],
    keywords: [{ w: '高血压', s: 5 }, { w: '血糖', s: 4 }, { w: '心电图', s: 4 }, { w: '用药剂量', s: 5 }, { w: '副作用', s: 4 }, { w: '复查', s: 3 }, { w: '头晕', s: 3 }, { w: '咖啡', s: 2 }, { w: '胸闷', s: 3 }, { w: '化验单', s: 4 }, { w: '心率', s: 3 }, { w: '失眠', s: 2 }, { w: '饮食禁忌', s: 3 }, { w: '体检报告', s: 3 }, { w: '血脂', s: 2 }, { w: '糖尿病', s: 4 }],
    kwMult: 240,
    gmv: '¥104.7万', payUsers: '860', payRate: '6.9%', arppu: '¥100.2', renew: '41%',
    gmvDelta: 11.4, payUsersDelta: 9.1, payRateDelta: 1.7, arppuDelta: 2.2, renewDelta: 4.1,
    reflow: '124', reflowDelta: 6.8,
    limit: '13%', limitHits: 16640, limitBase: 128000,
    memberFunnel: {
      unit: '人',
      steps: [
        { nm: '可转化用户', cnt: 10100, cum: '100%', color: I },
        { nm: '看到会员页', cnt: 2970, step: '29.4%', cum: '29.4%', color: I },
        { nm: '点击购买', cnt: 890, step: '30.0%', cum: '8.8%', color: I },
        { nm: '完成支付', cnt: 560, step: '62.9%', cum: '5.5%', color: J },
      ],
      overall: '5.5%',
      foot: [
        { lab: '区间活跃用户', val: 12000, suf: '人' },
        { lab: '已排除全程有效会员', val: 1900, suf: '人' },
      ],
    },
    yxFunnel: {
      unit: '对',
      steps: [
        { nm: '触发永享墙', cnt: 2600, cum: '100%', color: A },
        { nm: '点击购买', cnt: 780, step: '30.0%', cum: '30.0%', color: A },
        { nm: '完成支付', cnt: 416, step: '53.3%', cum: '16.0%', color: J },
      ],
      overall: '16.0%',
      foot: [
        { lab: '触发人数', val: 1450, suf: '人' },
        { lab: '购买人数', val: 320, suf: '人' },
      ],
    },
    refundAmt: '¥3.4万', refundRate: '2.4%', refundOrders: '342', netGmv: '¥101.3万',
    refundAmtDelta: -5.6, refundRateDelta: -2.1, refundOrdersDelta: -3.8, netGmvDelta: 11.9,
    kpFactor: 1,
  },
};

// 留存率：第三种时间口径——按「注册批次」观察用户注册后第 N 天是否回来，
// 与「实时快照」「区间分析」都不同，故独立成段、独立筛选。
// 每个节点独立提供留存率/样本数/注册批次截止日/状态/预计可统计日期：
//   - 可统计：已注册满该节点观察期，有留存率与样本；
//   - 待成熟：这批用户还没到第 N 天，不显示 0%/空条，改中性灰状态 + 预计可统计日期；
//   - 无样本：该批次尚无满足条件的注册用户（演示未使用，保留完整性）。
// 给业务人员看的白话，不用「成熟队列/cohort」等术语。
export type RetentionStatus = '可统计' | '待成熟' | '无样本';
export type RetentionNode = {
  days: 1 | 7 | 30;
  label: string; // 卡片标题，如「D+1 次日留存」
  rate: string | null; // 留存率，如「42%」；待成熟/无样本为 null（不显示 0%）
  sample: string; // 可统计样本人数（已满该节点观察期的注册用户），如「1,126」
  cutoff: string; // 注册批次截止日说明，如「统计至 7月14日注册用户」
  status: RetentionStatus;
  readyDate?: string; // 待成熟节点预计可统计日期，如「8月13日」
};

export type RetentionBatch = { nodes: RetentionNode[]; updatedAt: string };

// 0718 #6：留存 mock 按真实日期联动推算（此前「自定义日期」档写死 6月30日，与所选注册日脱节）。
// 语义（与功能清单 §7.1 一致）：D+N 留存观察「注册日 D 起、第 N 天仍活跃」的用户占比；
// 节点可统计 ⇔ 注册日 + N ≤ 今天，否则待成熟（预计可统计日期＝注册日 + N）。
const DAY_MS = 86400000;
const at0 = (d: Date) => {
  const t = new Date(d);
  t.setHours(0, 0, 0, 0);
  return t;
};
const plus = (d: Date, n: number) => new Date(at0(d).getTime() + n * DAY_MS);
export const fmtMD = (d: Date) => `${d.getMonth() + 1}月${d.getDate()}日`;
const pad2 = (n: number) => String(n).padStart(2, '0');
const stampNow = () => {
  const t = new Date();
  return `${t.getFullYear()}-${pad2(t.getMonth() + 1)}-${pad2(t.getDate())} ${pad2(t.getHours())}:${pad2(t.getMinutes())}`;
};
// 稳定伪随机（同一注册日/批次每次渲染数值一致，不闪烁）
const seedOf = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const NODE_SPECS: { days: 1 | 7 | 30; label: string; obs: string; rateBase: number; rateSpan: number }[] = [
  { days: 1, label: 'D+1 次日留存', obs: '次日', rateBase: 37, rateSpan: 9 }, // 37%–45%
  { days: 7, label: 'D+7 7日留存', obs: '第 7 天', rateBase: 21, rateSpan: 8 }, // 21%–28%
  { days: 30, label: 'D+30 30日留存', obs: '第 30 天', rateBase: 13, rateSpan: 6 }, // 13%–18%
];

const isoDay = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

// 单一注册日批次：截止文案即该注册日；各节点按「注册日 + N ≤ 今天」判定可统计
// 0718：截止文案白话化（原「统计至 {日期}注册用户」不易懂）——直接说「统计哪天注册的人、看他们哪天回不回来」
// 0718：同一注册日＝同一批人，三个节点共用同一样本（分母相同）；样本随节点递减仅适用于多天批次（retentionForPreset）
export function retentionForDay(day: Date, today: Date = new Date()): RetentionBatch {
  const d0 = at0(day);
  const t0 = at0(today);
  const sampleBase = 420 + (seedOf(`day-${isoDay(d0)}`) % 380); // 单日注册量 420–799
  const nodes = NODE_SPECS.map((spec) => {
    const nodeSeed = seedOf(`day-${isoDay(d0)}-d${spec.days}`);
    const sample = sampleBase.toLocaleString('en-US');
    if (plus(d0, spec.days) > t0) {
      return { days: spec.days, label: spec.label, rate: null, sample, cutoff: `${fmtMD(d0)}注册的用户 · 等满 ${spec.days} 天（${fmtMD(plus(d0, spec.days))}）后可统计`, status: '待成熟' as const, readyDate: fmtMD(plus(d0, spec.days)) };
    }
    return {
      days: spec.days,
      label: spec.label,
      rate: `${spec.rateBase + (nodeSeed % spec.rateSpan)}%`,
      sample,
      cutoff: `统计 ${fmtMD(d0)}注册的 ${sample} 人 · ${spec.obs}是否回来`,
      status: '可统计' as const,
    };
  });
  return { nodes, updatedAt: stampNow() };
}

// 预设批次：最新可统计 / 近 7 个注册日 / 近 30 个注册日——
// 各节点截止日＝今天 − N（最新已满观察期的注册日），样本随批次窗口放大
export function retentionForPreset(batch: string, today: Date = new Date()): RetentionBatch {
  const t0 = at0(today);
  const sampleBase = batch === '近 30 个注册日' ? 8000 : batch === '近 7 个注册日' ? 2100 : 1050;
  const nodes = NODE_SPECS.map((spec, i) => {
    const nodeSeed = seedOf(`batch-${batch}-d${spec.days}-${isoDay(t0)}`);
    const sample = Math.round(sampleBase * (1 - i * 0.07)).toLocaleString('en-US');
    return {
      days: spec.days,
      label: spec.label,
      rate: `${spec.rateBase + 2 + (nodeSeed % spec.rateSpan)}%`,
      sample,
      cutoff: `统计 ${fmtMD(plus(t0, -spec.days))}注册的 ${sample} 人 · ${spec.obs}是否回来`,
      status: '可统计' as const,
    };
  });
  return { nodes, updatedAt: stampNow() };
}

// 页面/导出统一入口：自定义日期带具体注册日，其余走预设批次
export function retentionFor(batch: string, customDay: Date | null, today: Date = new Date()): RetentionBatch {
  if (batch === '自定义日期' && customDay) return retentionForDay(customDay, today);
  return retentionForPreset(batch, today);
}

// 热门 KP 榜单（基准值 = 30 天量；按 kpFactor 缩放出今日 / 7 日，实现区间联动）
export type KpRow = [string, number, number]; // [名称, 基准数值, KP id(用于下钻)]
export const TOPKP: { t: string; info: string; pre: string; suf: string; rows: KpRow[] }[] = [
  {
    t: '被提问数 TOP10', info: '按 KP 被提问条数排序,反映实际被使用的内容。随所选区间联动。', pre: '', suf: ' 条',
    rows: [['心血管分册', 1200, 1], ['儿科学', 980, 2], ['内科精要', 760, 3], ['外科学', 540, 4], ['妇产科', 430, 5], ['神经内科', 380, 6], ['消化内科', 320, 7], ['呼吸科', 260, 8], ['内分泌', 210, 9], ['皮肤科', 160, 10]],
  },
  {
    t: '付费转化贡献 TOP10', info: '按经由该 KP 产生的会员 / 永享订单贡献排序。随所选区间联动。', pre: '¥', suf: '',
    rows: [['内科精要', 12000, 3], ['心血管分册', 9000, 1], ['外科学', 5000, 4], ['儿科学', 4200, 2], ['妇产科', 3600, 5], ['神经内科', 2900, 6], ['消化内科', 2100, 7], ['呼吸科', 1600, 8], ['内分泌', 1100, 9], ['皮肤科', 800, 10]],
  },
  {
    t: '永享购买 TOP10', info: '按该 KP 下永享买断订单数排序。随所选区间联动。', pre: '', suf: ' 单',
    rows: [['心血管分册', 320, 1], ['外科学', 210, 4], ['儿科学', 120, 2], ['内科精要', 96, 3], ['神经内科', 78, 6], ['妇产科', 64, 5], ['消化内科', 52, 7], ['呼吸科', 41, 8], ['内分泌', 33, 9], ['皮肤科', 22, 10]],
  },
];
