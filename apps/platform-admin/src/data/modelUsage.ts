// 全域模型用量 mock（0714 从 ModelUsage.tsx 视图下移，供视图与导出 spec 共用）。
// 本文件须保持 node 可运行（不 import react / .tsx / css / window；色值为 CSS 变量字符串，仅视图消费）。

const I = 'var(--indigo)', J = 'var(--jade)', A = 'var(--amber)', G = 'var(--ink-3)';

export type TopRow = { nm: string; color: string; pv: number };

export interface MU {
  // 0814-3：机构筛选改多选后，区间绝对量需按所选机构累加缩放——原先是预格式化字符串（'860万'）无法参与运算，
  // 改存原始数值，展示一律走 fmtCn（与平台主控台同一套口径）。
  tokensRaw: number; // 区间 tokens 原始值
  tkDelta: string;
  callsRaw: number; // 区间调用次数原始值
  callDelta: string;
  resp: string;
  respNote: string;
  x: string[];
  total: number[]; // 全平台总量趋势
  top: TopRow[]; // Top 机构 token 排行（pv 为原始值，占比由视图按当前所选机构重算）
  orgFactor: number; // 单机构趋势相对「近 7 天」基准的缩放
}

/** 实时总览（平台开通至今累计，不随时间筛选变化） */
export const MODEL_USAGE_TOTALS = { tokens: 128_000_000, calls: 3_620_000 };

export const MODEL_USAGE_RANGE: Record<string, MU> = {
  '今日': {
    tokensRaw: 620_000, tkDelta: '↑ +12.4%',
    callsRaw: 18_000, callDelta: '↑ +7.5%',
    resp: '1.7', respNote: '↓ 缩短 0.3 秒',
    x: ['00时', '04时', '08时', '12时', '16时', '20时', '现在'],
    total: [18, 14, 40, 78, 92, 105, 80],
    top: [
      { nm: 'XX 出版集团', color: I, pv: 450000 },
      { nm: 'YY 教育', color: J, pv: 280000 },
      { nm: 'ZZ 少儿', color: A, pv: 190000 },
      { nm: 'AA 文化集团', color: G, pv: 130000 },
      { nm: 'BB 数字出版', color: G, pv: 90000 },
    ],
    orgFactor: 0.08,
  },
  '近 7 天': {
    tokensRaw: 8_600_000, tkDelta: '↑ +9.2%',
    callsRaw: 240_000, callDelta: '↑ +6.1%',
    resp: '1.8', respNote: '↓ 缩短 0.2 秒',
    x: ['05-25', '05-26', '05-27', '05-28', '05-29', '05-30', '05-31'],
    total: [250, 305, 308, 357, 370, 423, 463],
    top: [
      { nm: 'XX 出版集团', color: I, pv: 6400000 },
      { nm: 'YY 教育', color: J, pv: 4000000 },
      { nm: 'ZZ 少儿', color: A, pv: 2800000 },
      { nm: 'AA 文化集团', color: G, pv: 1900000 },
      { nm: 'BB 数字出版', color: G, pv: 1400000 },
    ],
    orgFactor: 1,
  },
  '30 天': {
    tokensRaw: 36_200_000, tkDelta: '↑ +14.0%',
    callsRaw: 1_020_000, callDelta: '↑ +8.8%',
    resp: '1.9', respNote: '↓ 缩短 0.1 秒',
    x: ['05-02', '05-07', '05-12', '05-17', '05-22', '05-27', '06-01'],
    total: [1050, 1180, 1260, 1380, 1520, 1660, 1820],
    top: [
      { nm: 'XX 出版集团', color: I, pv: 26000000 },
      { nm: 'YY 教育', color: J, pv: 17000000 },
      { nm: 'ZZ 少儿', color: A, pv: 11000000 },
      { nm: 'AA 文化集团', color: G, pv: 7600000 },
      { nm: 'BB 数字出版', color: G, pv: 5600000 },
    ],
    orgFactor: 4.2,
  },
};
