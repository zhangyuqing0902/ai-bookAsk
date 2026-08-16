// 0806：会员状态四态口径（三端与导出统一的单一数据源）。
// 有效会员 active / 宽限期（待续费）grace / 会员已过期 expired / 未开通会员 none——任一时刻互斥。
// grace＝权益已到期、处于续费宽限窗口内（对应委托代扣扣款失败后的挽留窗口），权益暂保留并引导续费。
// 本文件须保持 node 可运行（不 import react / .tsx / css / window）。

export type MemberState = 'active' | 'grace' | 'expired' | 'none';

export const MEMBER_STATES: MemberState[] = ['active', 'grace', 'expired', 'none'];

export const MEMBER_STATE_LABEL: Record<MemberState, string> = {
  active: '有效会员',
  grace: '宽限期（待续费）',
  expired: '会员已过期',
  none: '未开通会员',
};

// badge 复用既有语义色（零新增 CSS）：健康＝玉绿 / 待行动＝琥珀 / 已流失＝赤陶 / 空＝灰描边
export const MEMBER_STATE_TAG: Record<MemberState, string> = {
  active: 'tag-jade',
  grace: 'tag-amber',
  expired: 'tag-terra',
  none: 'tag-line',
};

// 列表「会员状态」列排序权重（有效 > 宽限 > 过期 > 未开通）
export const MEMBER_STATE_ORDER: Record<MemberState, number> = {
  active: 3,
  grace: 2,
  expired: 1,
  none: 0,
};

// 筛选五档＝全部＋四态（下拉 options 直接用）
export const MEMBER_FILTER_OPTIONS: string[] = ['全部', ...MEMBER_STATES.map((s) => MEMBER_STATE_LABEL[s])];

// 筛选 label → state（「全部」与未知返回 null＝不过滤）
export function memberStateByLabel(label: string): MemberState | null {
  const hit = MEMBER_STATES.find((s) => MEMBER_STATE_LABEL[s] === label);
  return hit ?? null;
}

// ── 0814-2：宽限期（＝到期后 72 小时会员缓冲使用期）时长口径 ──────────────────
// 口径定版见 PRD 4.4.5 与交接说明 3.10：缓冲期不计入付费时长，也不参与续订顺延起点计算；
// 缓冲期内权益仍生效，故 grace 计入「当前会员数」。原「到期前 72 小时宽限期」口径已废弃。
export const GRACE_HOURS = 72;

// 缓冲期截止时刻＝到期时刻 + 72h。expiresAt 为日期串（YYYY-MM-DD）时按当日 23:59:59 到期计。
export function graceEndAt(expiresAt: string): Date {
  const base =
    expiresAt.length <= 10
      ? new Date(`${expiresAt}T23:59:59`)
      : new Date(expiresAt.replace(' ', 'T'));
  return new Date(base.getTime() + GRACE_HOURS * 3600 * 1000);
}

// 缓冲期剩余小时（向上取整；已出窗口返回 0）。
// 上限钳到 GRACE_HOURS：若后端在到期时刻之前就下发了 grace，向上取整会算出 73，
// 界面显示「剩 73 小时」与对外承诺的 72 小时自相矛盾——展示值不应超过承诺窗口。
export function graceRemainHours(expiresAt: string, now: Date = new Date()): number {
  const ms = graceEndAt(expiresAt).getTime() - now.getTime();
  if (ms <= 0) return 0;
  return Math.min(GRACE_HOURS, Math.ceil(ms / 3600000));
}

// C 端倒计时文案。C 端刻意不出现「宽限期」这一状态名词——不让用户先理解一个状态再推断后果，
// 直接讲他能感知的事实「还能用多久」。运营四态语义只在两个后台使用。
// 全程小时制：72h 尺度下换算成「2 天 23 小时」会读成「还早」，反而削弱紧迫感。
export function graceRemainText(hours: number): string {
  if (hours <= 0) return '缓冲期已结束';
  if (hours <= 1) return '不足 1 小时';
  return `剩 ${hours} 小时`;
}

// 详情页会员有效期文案：active＝有效期至；grace＝已到期·宽限期内；expired＝已到期；none＝无
export function memberExpireText(state: MemberState, expire?: string): string {
  if (state === 'active' && expire) return `有效期至 ${expire}`;
  if (state === 'grace' && expire) return `已于 ${expire} 到期 · 宽限期内`;
  if (state === 'expired' && expire) return `已于 ${expire} 到期`;
  return '';
}
