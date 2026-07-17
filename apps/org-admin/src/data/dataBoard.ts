// 0714：数据看板 mock 从 DataBoard.tsx 下移为纯数据文件（导出 spec / 模板脚本需在 node 直接 import，
// 不能引 react / .tsx / css）。视图只管渲染，数据与口径（kwMult / kpFactor）都在这里。

export const I = 'var(--indigo)', J = 'var(--jade)', A = 'var(--amber)', T = 'var(--terra)', G = 'var(--ink-3)';
export type Bar = { nm: string; pct: number; color: string; pv: string };
export type KW = { w: string; s: number };

// 0714：各 KPI 补环比字段 xxxDelta:number（较上一周期百分比，正=上升绿↑ / 负=下降红↓），
// 与主控台 Delta 同款渲染；率类指标（退款率/反馈率）给负值更贴近真实（负面指标下降是好事）。
export interface RangeData {
  // —— 用户域 ——
  newUsers: string; newUsersDelta: number;
  saoma: number; // 扫码占比%（直接访问 = 100 - saoma）
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
  limit: string; // 受限内容触发率（漏斗入口）
  memberFunnel: Bar[];
  yxFunnel: Bar[];
  refundAmt: string; refundRate: string; refundOrders: string; netGmv: string;
  refundAmtDelta: number; refundRateDelta: number; refundOrdersDelta: number; netGmvDelta: number;
  // —— 热门 KP：榜单数值随区间缩放 ——
  kpFactor: number;
}

// DAU/WAU/MAU 固定窗口实时快照（不随区间联动；用户分析 Tab 与导出共用）
export const ACTIVE_SNAPSHOT = { dau: '1,240', wau: '5,600', mau: '1.2万' };

export const RANGE: Record<string, RangeData> = {
  '今日': {
    newUsers: '48', newUsersDelta: 4.0,
    saoma: 70,
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
    limit: '11%',
    memberFunnel: [{ nm: '看到会员页', pct: 100, color: I, pv: '100%' }, { nm: '点击购买', pct: 26, color: I, pv: '26%' }, { nm: '完成支付', pct: 15, color: J, pv: '15%' }],
    yxFunnel: [{ nm: '触发永享墙', pct: 100, color: A, pv: '100%' }, { nm: '完成购买', pct: 14, color: A, pv: '14%' }],
    refundAmt: '¥1,240', refundRate: '1.6%', refundOrders: '12', netGmv: '¥9,860',
    refundAmtDelta: -3.5, refundRateDelta: -0.8, refundOrdersDelta: -2.4, netGmvDelta: 5.6,
    kpFactor: 0.04,
  },
  '7 日': {
    newUsers: '320', newUsersDelta: 6.0,
    saoma: 68,
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
    limit: '12%',
    memberFunnel: [{ nm: '看到会员页', pct: 100, color: I, pv: '100%' }, { nm: '点击购买', pct: 28, color: I, pv: '28%' }, { nm: '完成支付', pct: 17, color: J, pv: '17%' }],
    yxFunnel: [{ nm: '触发永享墙', pct: 100, color: A, pv: '100%' }, { nm: '完成购买', pct: 15, color: A, pv: '15%' }],
    refundAmt: '¥8,600', refundRate: '2.1%', refundOrders: '86', netGmv: '¥24.7万',
    refundAmtDelta: -4.2, refundRateDelta: -1.5, refundOrdersDelta: -3.1, netGmvDelta: 8.1,
    kpFactor: 0.25,
  },
  '30 日': {
    newUsers: '1,280', newUsersDelta: 9.0,
    saoma: 66,
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
    limit: '13%',
    memberFunnel: [{ nm: '看到会员页', pct: 100, color: I, pv: '100%' }, { nm: '点击购买', pct: 30, color: I, pv: '30%' }, { nm: '完成支付', pct: 19, color: J, pv: '19%' }],
    yxFunnel: [{ nm: '触发永享墙', pct: 100, color: A, pv: '100%' }, { nm: '完成购买', pct: 16, color: A, pv: '16%' }],
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

const BATCH_LATEST: { nodes: RetentionNode[]; updatedAt: string } = {
  // 默认批次：只展示最新可统计结果；D+30 尚未到统计时间，演示未成熟态
  nodes: [
    { days: 1, label: 'D+1 次日留存', rate: '42%', sample: '1,126', cutoff: '统计至 7月14日注册用户', status: '可统计' },
    { days: 7, label: 'D+7 7日留存', rate: '25%', sample: '1,048', cutoff: '统计至 7月8日注册用户', status: '可统计' },
    { days: 30, label: 'D+30 30日留存', rate: null, sample: '968', cutoff: '需注册满 30 天', status: '待成熟', readyDate: '8月13日' },
  ],
  updatedAt: '2026-07-15 13:54',
};

export const RETENTION: Record<string, { nodes: RetentionNode[]; updatedAt: string }> = {
  '最新可统计': BATCH_LATEST,
  '近 7 个注册日': {
    nodes: [
      { days: 1, label: 'D+1 次日留存', rate: '41%', sample: '2,240', cutoff: '统计至 7月14日注册用户', status: '可统计' },
      { days: 7, label: 'D+7 7日留存', rate: '24%', sample: '2,105', cutoff: '统计至 7月8日注册用户', status: '可统计' },
      { days: 30, label: 'D+30 30日留存', rate: null, sample: '1,980', cutoff: '需注册满 30 天', status: '待成熟', readyDate: '8月13日' },
    ],
    updatedAt: '2026-07-15 13:54',
  },
  '近 30 个注册日': {
    // 三节点全可统计（这批用户注册已满 30 天）
    nodes: [
      { days: 1, label: 'D+1 次日留存', rate: '43%', sample: '8,420', cutoff: '统计至 7月14日注册用户', status: '可统计' },
      { days: 7, label: 'D+7 7日留存', rate: '27%', sample: '8,015', cutoff: '统计至 7月8日注册用户', status: '可统计' },
      { days: 30, label: 'D+30 30日留存', rate: '17%', sample: '6,540', cutoff: '统计至 6月15日注册用户', status: '可统计' },
    ],
    updatedAt: '2026-07-15 13:54',
  },
  '自定义日期': {
    nodes: [
      { days: 1, label: 'D+1 次日留存', rate: '40%', sample: '620', cutoff: '统计至 6月30日注册用户', status: '可统计' },
      { days: 7, label: 'D+7 7日留存', rate: '23%', sample: '590', cutoff: '统计至 6月24日注册用户', status: '可统计' },
      { days: 30, label: 'D+30 30日留存', rate: '15%', sample: '512', cutoff: '统计至 6月1日注册用户', status: '可统计' },
    ],
    updatedAt: '2026-07-15 13:54',
  },
};

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
