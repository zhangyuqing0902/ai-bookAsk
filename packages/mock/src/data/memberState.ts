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

// 详情页会员有效期文案：active＝有效期至；grace＝已到期·宽限期内；expired＝已到期；none＝无
export function memberExpireText(state: MemberState, expire?: string): string {
  if (state === 'active' && expire) return `有效期至 ${expire}`;
  if (state === 'grace' && expire) return `已于 ${expire} 到期 · 宽限期内`;
  if (state === 'expired' && expire) return `已于 ${expire} 到期`;
  return '';
}
