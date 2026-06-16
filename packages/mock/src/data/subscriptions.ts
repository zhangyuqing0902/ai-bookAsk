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

// 当前生效订阅卡视图模型（含其生效加油包累加后的「已用 / 上限」三项）；无生效订阅返回 null
export interface SubCardRow { k: string; used: number; limit: number; unit: string; info: string }
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
  const row = (k: string, bk: keyof Subscription, uk: keyof Subscription, unit: string): SubCardRow => {
    const b = parseFloat((base[bk] as string) ?? '0') || 0;
    const add = sumP(bk);
    const limit = tidy(b + add);
    const used = tidy((parseFloat((base[uk] as string) ?? '0') || 0) + sumP(uk));
    return { k, used, limit, unit, info: add > 0 ? `基础 ${b} ${unit} + 生效加油包 ${add} ${unit}，合计 ${limit} ${unit}` : `订阅额度 ${b} ${unit}` };
  };
  return {
    plan: base.plan,
    status: subStatus(base),
    packsCount: packs.length,
    startDate: base.startDate,
    endDate: base.endDate,
    owner: base.owner,
    rows: [row('KP 数', 'kp', 'kpUsed', '个'), row('存储', 'storage', 'storageUsed', 'GB'), row('本月 Token', 'token', 'tokenUsed', '亿')],
  };
}
