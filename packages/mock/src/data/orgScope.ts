// 0806：机构后台父子机构数据范围——演示锚点与口径（单一数据源）。
// 概念：父机构＝下辖 N 个机构；子机构＝有父机构；独立机构＝无父无子。
// 机构后台当前登录机构固定为「XX 出版社」（与 adminOrders.MY_ORG 一致，订单过滤 / 导出 / 域名前缀均锚定它），
// 演示开关只切「机构类型」三态：父机构态追加两家分社的数据行（子 / 独立态自动隐藏，保证界面保持现状）。
// 本文件须保持 node 可运行（不 import react / .tsx / css / window）。

export type OrgType = 'parent' | 'child' | 'ordinary';

export const ORG_TYPE_LABEL: Record<OrgType, string> = {
  parent: '父机构',
  child: '子机构',
  ordinary: '独立机构',
};

/** 机构后台当前登录机构（= adminOrders.MY_ORG，勿改名） */
export const CURRENT_ORG = 'XX 出版社';

/** 父机构态下辖的子机构（演示数据，沿「集团 → 分社」故事线） */
export const CHILD_ORGS = ['XX 少儿分社', 'XX 教辅分社'];

/** 子机构态展示的上级机构（个人中心用） */
export const PARENT_ORG_NAME = 'XX 出版集团';

/** 六列表页「机构」单选筛选的重置项 */
export const ORG_FILTER_ALL = '全部机构';

/** 单选筛选选项：全部机构（默认）/ 本机构（带父机构标，Dropdown 自动渲染）/ 各子机构 */
export function orgScopeOptions(): string[] {
  return [ORG_FILTER_ALL, `${CURRENT_ORG}（父机构）`, ...CHILD_ORGS];
}

/** 剥掉「（父机构）」后缀还原机构名（与 orgOptionValue 同规则，本地自包含避免耦合平台机构树） */
export function orgScopeValue(label: string): string {
  return label.replace(/（父机构）$/, '');
}

/** 父机构视角下可见的机构全集（本机构 + 全部子机构） */
export function visibleOrgs(orgType: OrgType): string[] {
  return orgType === 'parent' ? [CURRENT_ORG, ...CHILD_ORGS] : [CURRENT_ORG];
}

// ---- 主控台 / 数据看板多选联动：机构指标系数 ----
// 全选＝系数和＝1＝现状数值（保证子 / 独立态与父机构全选态数字一致，演示不跳变）；
// 口径：计数 / 金额类绝对量 × 系数（四舍五入），率值 / 时长 / 占比不乘（视为集合整体口径）。
export const ORG_WEIGHT: Record<string, number> = {
  [CURRENT_ORG]: 0.62,
  'XX 少儿分社': 0.23,
  'XX 教辅分社': 0.15,
};

/** 所选机构集合的合成系数（空集＝0；全选浮点误差收敛为 1） */
export function orgWeightOf(selected: string[]): number {
  if (!selected.length) return 0;
  const w = selected.reduce((s, o) => s + (ORG_WEIGHT[o] ?? 0), 0);
  return w >= 0.999 ? 1 : w;
}
