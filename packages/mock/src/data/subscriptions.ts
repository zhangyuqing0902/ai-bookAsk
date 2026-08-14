import type { Subscription, SubStatus } from '../types';

// 0615-2：机构订阅订单 mock（全域「订阅订单」页 + 机构详情订阅记录共用）。
// 类型：订阅（常规，定套餐+有效期）/ 加油包（期中加量、即时生效、额度累加）；状态：生效 / 未生效。
export const SUBSCRIPTIONS: Subscription[] = [
  // —— 中国医学临床百家（org_med）：专业版，续了一期；期中加过一个加油包 ——
  { id: 'SUB202505201038-MED', orgId: 'org_med', orgName: '中国医学临床百家', type: '订阅', plan: '专业版', kp: '50', storage: '100', token: '2', kpUsed: '0', storageUsed: '0', tokenUsed: '0', startDate: '2025-06-01', endDate: '2026-05-31', owner: '王磊', note: '首年签约', status: '未生效', createdAt: '2025-05-20 10:38:12', createdBy: 'wanglei@aba-platform' },
  { id: 'SUB202605181620-MED', orgId: 'org_med', orgName: '中国医学临床百家', type: '订阅', plan: '专业版', kp: '50', storage: '100', token: '2', kpUsed: '30', storageUsed: '62', tokenUsed: '1.76', startDate: '2026-06-01', endDate: '2027-05-31', owner: '王磊', note: '续约一年', status: '生效', createdAt: '2026-05-18 16:20:45', createdBy: 'wanglei@aba-platform' },
  { id: 'SUB202609021109-MED', orgId: 'org_med', orgName: '中国医学临床百家', type: '加油包', parentId: 'SUB202605181620-MED', kp: '0', storage: '0', token: '0.5', kpUsed: '0', storageUsed: '0', tokenUsed: '0.12', startDate: '2026-09-02', endDate: '2027-05-31', owner: '王磊', note: 'Token 临时不足，加 0.5 亿', status: '生效', createdAt: '2026-09-02 11:09:30', createdBy: 'wanglei@aba-platform' },

  // —— 财经出版社（org_fin）：基础版，临近到期 ——
  { id: 'SUB202507250915-FIN', orgId: 'org_fin', orgName: '财经出版社', type: '订阅', plan: '基础版', kp: '10', storage: '20', token: '0.5', kpUsed: '7', storageUsed: '12', tokenUsed: '0.32', startDate: '2025-08-01', endDate: '2026-07-31', owner: '李娜', note: '', status: '生效', createdAt: '2025-07-25 09:15:03', createdBy: 'lina@aba-platform' },

  // —— 十月文学（org_lit）：旗舰版生效中 ——
  { id: 'SUB202603301742-LIT', orgId: 'org_lit', orgName: '十月文学', type: '订阅', plan: '旗舰版', kp: '200', storage: '500', token: '10', kpUsed: '88', storageUsed: '210', tokenUsed: '4.1', startDate: '2026-04-05', endDate: '2027-04-04', owner: '赵敏', note: '', status: '生效', createdAt: '2026-03-30 17:42:55', createdBy: 'zhaomin@aba-platform' },
];

// 0615-7：本地日期串 YYYY-MM-DD
export const todayStr = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
// 「订阅」状态由有效期自动判定（未生效 / 生效 / 已过期）；「加油包」沿用存储状态
export function subStatus(s: Subscription, today: string = todayStr()): SubStatus {
  if (s.type !== '订阅') return s.status;
  if (today < s.startDate) return '未生效';
  if (today > s.endDate) return '已过期';
  return '生效';
}

/** 机构当前生效的「订阅」（常规）记录，决定其基础额度 */
export const activeSub = (orgId: string): Subscription | undefined =>
  SUBSCRIPTIONS.find((s) => s.orgId === orgId && s.type === '订阅' && subStatus(s) === '生效');

// 0615-6：当前机构（演示：XX 出版社）订阅快照 —— 平台机构详情 + 机构后台主控台共用。
// 平台机构详情订阅 Tab 以此为初始 state（可本地新增）；机构后台主控台直接读此静态快照展示当前订阅卡。
export const MY_ORG_SUBS: Subscription[] = [
  { id: 'SUB202505201038-XX', orgId: 'xx', orgName: 'XX 出版社', type: '订阅', plan: '专业版', kp: '50', storage: '100', token: '2', kpUsed: '0', storageUsed: '0', tokenUsed: '0', startDate: '2025-06-01', endDate: '2026-05-31', owner: '王磊', note: '首年签约', status: '未生效', createdAt: '2025-05-20 10:38:12', createdBy: 'wanglei@aba-platform' },
  { id: 'SUB202605181620-XX', orgId: 'xx', orgName: 'XX 出版社', type: '订阅', plan: '专业版', kp: '50', storage: '100', token: '2', kpUsed: '30', storageUsed: '62', tokenUsed: '1.76', startDate: '2026-06-01', endDate: '2027-05-31', owner: '王磊', note: '续约一年', status: '生效', createdAt: '2026-05-18 16:20:45', createdBy: 'wanglei@aba-platform' },
  { id: 'PKG202609021109-XX', orgId: 'xx', orgName: 'XX 出版社', type: '加油包', parentId: 'SUB202605181620-XX', kp: '0', storage: '0', token: '0.5', kpUsed: '0', storageUsed: '0', tokenUsed: '0.12', startDate: '2026-09-02', endDate: '2027-05-31', owner: '王磊', note: 'Token 临时不足，加 0.5 亿', status: '生效', createdAt: '2026-09-02 11:09:30', createdBy: 'wanglei@aba-platform' },
];

// 0812：全过期演示快照——机构后台主控台「演示 · 订阅状态」开关 + 平台机构详情演示机构（EE 美术出版）共用。
// 状态字段仅存储值，「订阅」实际状态由 subStatus 按有效期判定：两条均早于今日 → 全部过期。
export const MY_ORG_SUBS_EXPIRED: Subscription[] = [
  { id: 'SUB202405201038-EXP', orgId: 'xx', orgName: 'XX 出版社', type: '订阅', plan: '专业版', kp: '50', storage: '100', token: '2', kpUsed: '30', storageUsed: '62', tokenUsed: '1.92', startDate: '2024-06-01', endDate: '2025-05-31', owner: '王磊', note: '首年签约', status: '生效', createdAt: '2024-05-20 10:38:12', createdBy: 'wanglei@aba-platform' },
  { id: 'SUB202505181620-EXP', orgId: 'xx', orgName: 'XX 出版社', type: '订阅', plan: '专业版', kp: '50', storage: '100', token: '2', kpUsed: '30', storageUsed: '62', tokenUsed: '1.76', startDate: '2025-06-01', endDate: '2026-07-15', owner: '王磊', note: '续约一年', status: '生效', createdAt: '2025-05-18 16:20:45', createdBy: 'wanglei@aba-platform' },
];

/** 0812：平台后台全过期演示机构（EE 美术出版）——机构详情打开时订阅记录取 MY_ORG_SUBS_EXPIRED */
export const EXPIRED_DEMO_ORG_ID = 'ORG013';

/** 0812-b：平台后台「从未开通」演示机构（AA 少儿分社，新入驻未订阅故事线）——机构详情打开时订阅记录为空 */
export const NEVER_SUB_DEMO_ORG_ID = 'ORG005';

// 0812-g：「不限版」演示快照——深度合作机构三项额度均不限（定制版亦可只设某一项不限，故视图按行判定）。
// 不限项不设上限、不做超限阻断；配套加油包对不限项无意义，此处仅保留 Token 加油包演示「不限 + 加油包」不叠加。
/** 0812-g：平台后台「不限版」演示机构（BB 数字出版）——机构详情打开时订阅记录取 MY_ORG_SUBS_UNLIMITED */
export const UNLIMITED_DEMO_ORG_ID = 'ORG007';

export const MY_ORG_SUBS_UNLIMITED: Subscription[] = [
  { id: 'SUB202606011200-UNL', orgId: 'xx', orgName: 'XX 出版社', type: '订阅', plan: '不限版', kp: '不限', storage: '不限', token: '不限', kpUsed: '128', storageUsed: '356', tokenUsed: '7.4', startDate: '2026-06-01', endDate: '2027-05-31', owner: '王磊', note: '深度合作 · 三项额度不限', status: '生效', createdAt: '2026-06-01 12:00:00', createdBy: 'wanglei@aba-platform' },
];

// 0813-2：「降档超额」演示快照——精确复刻真实场景：
//   上一期基础版 10 个 KP 全部建满，期中买加油包 +2 → 12 个；到期续约时降到 5 个 KP / 5 GB，存量双双超额。
//   处理原则（既存不适格，取自城市规划的 legal nonconforming use —— 容积率调低后不拆既有楼）：
//     ① 既有 12 个 KP 与全部文件永久有效，C 端读者问答与已购权益完全无感，平台永不删除机构数据；
//     ② 超额期间冻结增量（新建 KP / 上传文件），保证超额量只减不增；
//     ③ 棘轮：删到 6 个仍 6>=5 继续阻断，必须回落到 4 个才能再建到 5 —— 删一个 ≠ 能建一个；
//     ④ 存储超出的部分是平台在持续掏钱，故降档时「套餐降档说明」必填，成本承担关系落到白纸黑字。
/** 0813-2：平台后台「降档超额」演示机构（DD 考试中心）——机构详情打开时订阅记录取 MY_ORG_SUBS_OVER */
export const OVER_QUOTA_DEMO_ORG_ID = 'ORG012';

export const MY_ORG_SUBS_OVER: Subscription[] = [
  // 上一期：基础版 10 个 KP，期中加油包 +2 → 合计 12 个额度，全部用满（加油包不结转，随父订阅一起到期）
  { id: 'SUB202505200938-OVR', orgId: 'xx', orgName: 'XX 出版社', type: '订阅', plan: '基础版', kp: '10', storage: '20', token: '0.5', kpUsed: '12', storageUsed: '10', tokenUsed: '0.48', startDate: '2025-06-01', endDate: '2026-05-31', owner: '王磊', note: '首年签约', status: '生效', createdAt: '2025-05-20 09:38:12', createdBy: 'wanglei@aba-platform' },
  { id: 'PKG202511140930-OVR', orgId: 'xx', orgName: 'XX 出版社', type: '加油包', parentId: 'SUB202505200938-OVR', kp: '2', storage: '0', token: '0', kpUsed: '2', storageUsed: '0', tokenUsed: '0', startDate: '2025-11-14', endDate: '2026-05-31', owner: '王磊', note: 'KP 数不够，加 2 个', status: '生效', createdAt: '2025-11-14 09:30:11', createdBy: 'wanglei@aba-platform' },
  // 本期：预算缩减降到 5 个 KP / 5 GB —— 存量 12 个 KP、10 GB 双双超额（超 7 个、超 5 GB）
  { id: 'SUB202605281430-OVR', orgId: 'xx', orgName: 'XX 出版社', type: '订阅', plan: '定制版', kp: '5', storage: '5', token: '0.5', kpUsed: '12', storageUsed: '10', tokenUsed: '0.21', startDate: '2026-06-01', endDate: '2027-05-31', owner: '王磊', note: '续约一年', downgradeNote: '客户 2026 年预算缩减，本期主动降至 5 个 KP / 5 GB。', status: '生效', createdAt: '2026-05-28 14:30:07', createdBy: 'wanglei@aba-platform' },
];

/** 0812：最近一条已过期「订阅」（按到期日取最晚），供空态卡展示「上一套餐 · 到期日」；无过期史返回 null */
export function lastExpiredSub(subs: Subscription[]): { plan?: string; endDate: string } | null {
  const ex = subs.filter((s) => s.type === '订阅' && subStatus(s) === '已过期');
  if (!ex.length) return null;
  const last = ex.reduce((a, b) => (a.endDate >= b.endDate ? a : b));
  return { plan: last.plan, endDate: last.endDate };
}

// 当前生效订阅卡视图模型（含其生效加油包累加后的「已用 / 上限」三项）；无生效订阅返回 null
// 0812-g：额度支持「不限」（不限版套餐 / 定制版单项不限）——unlimited=true 时 limit 无意义（置 0），
// 视图不画百分比进度条（无上限就没有「还剩多少」，画一条恒 0% 的条只会误导）。
export interface SubCardRow { k: string; used: number; limit: number; unit: string; kind: 'occupancy' | 'consumption'; info: string; unlimited?: boolean }
export interface SubCardVM {
  plan?: string;
  status: string;
  packsCount: number;
  startDate: string;
  endDate: string;
  owner?: string;
  rows: SubCardRow[];
}
export function currentSubCard(subs: Subscription[]): SubCardVM | null {
  const base = subs.find((s) => s.type === '订阅' && subStatus(s) === '生效');
  if (!base) return null;
  const packs = subs.filter((s) => s.type === '加油包' && s.status === '生效' && s.parentId === base.id);
  const tidy = (n: number) => Number(n.toFixed(2));
  const sumP = (k: keyof Subscription) => packs.reduce((n, p) => n + (parseFloat((p[k] as string) ?? '0') || 0), 0);
  const row = (k: string, bk: keyof Subscription, uk: keyof Subscription, unit: string, kind: 'occupancy' | 'consumption'): SubCardRow => {
    // 0812-g：「不限」逐项判定（定制版可只有某一项不限）；不限 + 加油包仍是不限
    const unlimited = String(base[bk] ?? '').trim() === '不限';
    const b = parseFloat((base[bk] as string) ?? '0') || 0;
    const add = sumP(bk);
    const limit = unlimited ? 0 : tidy(b + add);
    const used = tidy((parseFloat((base[uk] as string) ?? '0') || 0) + sumP(uk));
    const basis = kind === 'occupancy'
      ? '“当前占用”按机构真实内容实时统计并跨订阅延续；删除可释放。'
      : '“本周期消耗”绑定当前订阅周期且不可回收；新订阅生效时归零，旧额度不结转。';
    const cap = unlimited
      ? `本项按当前订阅设为「不限」：不设上限、不做超限阻断，仅统计当前用量；加油包对不限项无意义。`
      : add > 0
        ? `基础 ${b} ${unit} + 生效加油包 ${add} ${unit}，当前上限 ${limit} ${unit}。`
        : `当前订阅上限 ${b} ${unit}。`;
    // 0814：tooltip 补「着色阈值 + 超限处理」——原先只讲上限怎么算、不讲到线了会发生什么，
    //   而这两件事恰恰是机构最需要提前知道的（进度条变红意味着什么、还能不能继续建 / 传）。
    //   不限项没有阈值也没有阻断，因此不拼这段。
    const threshold = unlimited
      ? ''
      : kind === 'occupancy'
        ? `进度条着色：＜70% 青 / 70%~90% 橙 / ≥90% 珊瑚红。已用 ≥ 上限时冻结${k === 'KP 数' ? '新建与导入 KP' : '知识文件上传'}，既有内容永久保留、C 端读者完全无感；回落到上限以内即自动恢复。`
        : `进度条着色：＜70% 青 / 70%~90% 橙 / ≥90% 珊瑚红。本周期消耗率达 70% / 80% / 90% / 95% 各向机构联系人发一次短信预警（同周期同阈值不重复）；达上限后 C 端问答被拦截，需扩容或等下一周期归零。`;
    return { k, used, limit, unit, kind, unlimited, info: `${cap}${basis}${threshold}` };
  };
  return {
    plan: base.plan,
    status: subStatus(base),
    packsCount: packs.length,
    startDate: base.startDate,
    endDate: base.endDate,
    owner: base.owner,
    rows: [row('KP 数', 'kp', 'kpUsed', '个', 'occupancy'), row('存储', 'storage', 'storageUsed', 'GB', 'occupancy'), row('Token', 'token', 'tokenUsed', '亿', 'consumption')],
  };
}
