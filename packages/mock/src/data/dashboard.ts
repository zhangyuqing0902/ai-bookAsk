// 主控台看板 mock：实时总览快照（不随时间变）+ 60 日日序列（供「经营分析」区间聚合与趋势图）。
export interface DailyPoint {
  date: string; // YYYY-MM-DD
  mmdd: string; // MM-DD
  dau: number;
  newMembers: number;
  gmv: number;
  questions: number;
  // 0722 会员三分口径：当日到期会员数 / 当日到期且完成续费数 / 当日回流开通数（过期后再开通）
  expired: number;
  renewed: number;
  reflow: number;
}

const DAY = 86400000;
// 原型基准「今天」= 2026-06-09，日序列截至昨日 2026-06-08
const END = new Date(2026, 5, 8);

function fmt(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return { date: `${d.getFullYear()}-${mm}-${dd}`, mmdd: `${mm}-${dd}` };
}

interface Cfg {
  dau: [number, number, number]; // [base, slope, amp]
  nm: [number, number, number];
  gmv: [number, number, number];
  q: [number, number, number];
  ex: [number, number, number]; // 当日到期会员
  rn: [number, number, number]; // 当日到期且完成续费
  rf: [number, number, number]; // 当日回流开通
}

function buildSeries(n: number, c: Cfg): DailyPoint[] {
  const out: DailyPoint[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(END.getTime() - i * DAY);
    const idx = n - 1 - i; // 0 = 最早，n-1 = 最近
    const wave = Math.sin((idx / 7) * Math.PI * 2); // 周内波动
    const calc = ([base, slope, amp]: [number, number, number]) =>
      Math.max(0, Math.round(base + slope * idx + wave * amp));
    out.push({
      ...fmt(d),
      dau: calc(c.dau),
      newMembers: calc(c.nm),
      gmv: calc(c.gmv),
      questions: calc(c.q),
      expired: calc(c.ex),
      renewed: calc(c.rn),
      reflow: calc(c.rf),
    });
  }
  return out;
}

export const orgDaily = buildSeries(60, {
  dau: [900, 6, 140],
  nm: [8, 0.3, 6],
  gmv: [900, 12, 320],
  q: [780, 7, 170],
  ex: [10, 0.1, 3],
  rn: [4, 0.05, 2],
  rf: [2, 0.03, 1],
});

export const platformDaily = buildSeries(60, {
  dau: [22000, 120, 3000],
  nm: [220, 4, 120],
  gmv: [22000, 260, 6000],
  q: [88000, 500, 9000],
  ex: [260, 3, 60],
  rn: [104, 1.5, 30],
  rf: [40, 0.6, 15],
});

// 实时总览快照（截至今日，不随时间筛选变化）
export const orgSnapshot = {
  totalRegistered: 12480,
  currentMembers: 860,
  totalGmv: 86200,
  totalQuestions: 32000,
};
export const platformSnapshot = {
  orgs: 36,
  totalUsers: 124000,
  totalGmv: 862000,
  totalQuestions: 3200000,
  // 0806-2：内容供给指标（实时总览第二行）——平台运营能力=机构规模×内容供给×用户消费×商业化
  kpTotal: 468,
  kpPublished: 402,
  kpDraft: 41,
  kpUnlisted: 25,
  kbFiles: 126000, // 知识库文件总数
  kbDoc: 82000,
  kbImage: 26000,
  kbAudio: 12000,
  kbVideo: 6000,
  kbStorageTb: 4.8, // 知识库存储总量（TB）
  kbMediaPct: 62, // 媒体资源（图/音/视）存储占比 %
};

export interface RangeMetrics {
  activeUsers: number;
  newMembers: number;
  gmv: number;
  questions: number;
  /** 0722：续费率（%）= 区间内到期且完成续费 ÷ 同区间到期会员 */
  renewRate: number;
  /** 0722：回流会员 = 区间内过期后重新开通的用户数（不算新增、不算续费） */
  reflow: number;
  slice: DailyPoint[];
}

// 区间聚合：days = 天数；offset = 向前平移天数（取上一周期做环比）
export function rangeMetrics(series: DailyPoint[], days: number, offset = 0): RangeMetrics {
  const n = series.length;
  const endIdx = Math.max(0, n - offset);
  const startIdx = Math.max(0, endIdx - days);
  const slice = series.slice(startIdx, endIdx);
  const sum = (k: 'dau' | 'newMembers' | 'gmv' | 'questions' | 'expired' | 'renewed' | 'reflow') => slice.reduce((a, b) => a + b[k], 0);
  const dauSum = sum('dau');
  // 区间去重活跃用户近似：今日＝当日 DAU；跨度越大去重后高于日均、低于简单累加
  const dedup = days <= 1 ? 1 : days <= 7 ? 0.62 : 0.42;
  const activeUsers = days <= 1 ? (slice[slice.length - 1]?.dau ?? 0) : Math.round(dauSum * dedup);
  const expiredSum = sum('expired');
  return {
    activeUsers,
    newMembers: sum('newMembers'),
    gmv: sum('gmv'),
    questions: sum('questions'),
    renewRate: expiredSum ? (sum('renewed') / expiredSum) * 100 : 0,
    reflow: sum('reflow'),
    slice,
  };
}
