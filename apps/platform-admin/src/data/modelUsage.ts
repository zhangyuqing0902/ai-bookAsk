// 全域模型用量 mock（0714 从 ModelUsage.tsx 视图下移，供视图与导出 spec 共用）。
// 本文件须保持 node 可运行（不 import react / .tsx / css / window；色值为 CSS 变量字符串，仅视图消费）。

const I = 'var(--indigo)', J = 'var(--jade)', A = 'var(--amber)', G = 'var(--ink-3)';

export type TopRow = { nm: string; pct: number; color: string; pv: string };

export interface MU {
  tokens: string; // 区间 tokens（万/亿）
  tkDelta: string;
  callVal: string;
  callUnit: string; // 单位后缀（次）
  callDelta: string;
  resp: string;
  respNote: string;
  x: string[];
  total: number[]; // 全平台总量趋势
  top: TopRow[]; // Top 机构 token 排行
  orgFactor: number; // 单机构趋势相对「近 7 天」基准的缩放
}

/** 实时总览（平台开通至今累计，不随时间筛选变化） */
export const MODEL_USAGE_TOTALS = { tokens: '1.28亿', calls: '362万' };

export const MODEL_USAGE_RANGE: Record<string, MU> = {
  '今日': {
    tokens: '62万', tkDelta: '↑ +12.4%',
    callVal: '1.8万', callUnit: '次', callDelta: '↑ +7.5%',
    resp: '1.7', respNote: '↓ 缩短 0.3 秒',
    x: ['00时', '04时', '08时', '12时', '16时', '20时', '现在'],
    total: [18, 14, 40, 78, 92, 105, 80],
    top: [
      { nm: 'XX 出版社', pct: 100, color: I, pv: '45万' },
      { nm: 'YY 教育', pct: 62, color: J, pv: '28万' },
      { nm: 'ZZ 少儿', pct: 42, color: A, pv: '19万' },
      { nm: 'AA 文化集团', pct: 29, color: G, pv: '13万' },
      { nm: 'BB 数字出版', pct: 20, color: G, pv: '9万' },
    ],
    orgFactor: 0.08,
  },
  '近 7 天': {
    tokens: '860万', tkDelta: '↑ +9.2%',
    callVal: '24万', callUnit: '次', callDelta: '↑ +6.1%',
    resp: '1.8', respNote: '↓ 缩短 0.2 秒',
    x: ['05-25', '05-26', '05-27', '05-28', '05-29', '05-30', '05-31'],
    total: [250, 305, 308, 357, 370, 423, 463],
    top: [
      { nm: 'XX 出版社', pct: 100, color: I, pv: '640万' },
      { nm: 'YY 教育', pct: 62, color: J, pv: '400万' },
      { nm: 'ZZ 少儿', pct: 44, color: A, pv: '280万' },
      { nm: 'AA 文化集团', pct: 30, color: G, pv: '190万' },
      { nm: 'BB 数字出版', pct: 22, color: G, pv: '140万' },
    ],
    orgFactor: 1,
  },
  '30 天': {
    tokens: '3,620万', tkDelta: '↑ +14.0%',
    callVal: '102万', callUnit: '次', callDelta: '↑ +8.8%',
    resp: '1.9', respNote: '↓ 缩短 0.1 秒',
    x: ['05-02', '05-07', '05-12', '05-17', '05-22', '05-27', '06-01'],
    total: [1050, 1180, 1260, 1380, 1520, 1660, 1820],
    top: [
      { nm: 'XX 出版社', pct: 100, color: I, pv: '2,600万' },
      { nm: 'YY 教育', pct: 65, color: J, pv: '1,700万' },
      { nm: 'ZZ 少儿', pct: 42, color: A, pv: '1,100万' },
      { nm: 'AA 文化集团', pct: 29, color: G, pv: '760万' },
      { nm: 'BB 数字出版', pct: 21, color: G, pv: '560万' },
    ],
    orgFactor: 4.2,
  },
};

/** 单机构趋势基准（近 7 天），其余区间按 orgFactor 缩放 */
export const MODEL_USAGE_ORG_BASE: Record<string, number[]> = {
  'XX 出版社': [120, 150, 140, 175, 165, 205, 225],
  'YY 教育': [80, 95, 100, 110, 120, 128, 140],
  'ZZ 少儿': [50, 60, 68, 72, 85, 90, 98],
};
