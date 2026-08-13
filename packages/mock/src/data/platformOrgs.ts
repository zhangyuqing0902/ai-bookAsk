// 平台后台机构主数据（单一事实源）——机构列表 OrgList 与机构详情 OrgDetail 共用，
// 消灭「列表一份、详情硬编码一份」的双份真相。所有父/子/普通机构判定都从这棵真实机构树推导。
// 机构层级只允许两层（父机构 → 子机构）；既无上级也无下级者为「普通机构」，不加任何标签。

export interface PlatformOrg {
  i: number;
  id: string;
  name: string;
  domainPrefix: string;
  status: string;
  statusCls: string;
  /** 上级机构 ID；null = 顶级机构（两层制：父机构 → 子机构） */
  parentId: string | null;
  llm: string;
  pay: string;
  payCls: string;
  /** 套餐 + 三项配额「已用」（上限由套餐推断；定制版上限单列） */
  plan: '基础版' | '专业版' | '旗舰版' | '定制版';
  kpUsed: number;
  stUsed: number; // 存储 GB
  tkUsed: number; // 当前订阅周期 Token，单位亿
  /** 定制版上限（其余套餐由 PLAN_Q 推断） */
  custom?: { kp: number; storage: number; token: number };
  /** 0813-2：机构主体全称（营业执照名称）——创建机构时录入，注入 C 端四份协议文本的主体变量；
   *  可与其他机构重复（同一主体可运营多个机构）。未录入时详情页回落为「{机构名}有限公司」演示值。 */
  legalName?: string;
}

export const PLATFORM_ORGS: PlatformOrg[] = [
  { i: 1, id: 'ORG001', name: 'XX 出版集团', domainPrefix: 'xx-group', status: '正常', statusCls: 'tag-jade', parentId: null, llm: '平台默认', pay: '已配置', payCls: 'tag-indigo', plan: '专业版', kpUsed: 30, stUsed: 62, tkUsed: 1.76 },
  { i: 2, id: 'ORG002', name: 'YY 教育', domainPrefix: 'yy-edu', status: '停用', statusCls: 'tag-terra', parentId: 'ORG001', llm: '自配 · 通义', pay: '未配置', payCls: 'tag-line', plan: '基础版', kpUsed: 8, stUsed: 15, tkUsed: 0.32 },
  { i: 3, id: 'ORG003', name: 'ZZ 少儿', domainPrefix: 'zz-kids', status: '正常', statusCls: 'tag-jade', parentId: 'ORG001', llm: '平台默认', pay: '已配置', payCls: 'tag-indigo', plan: '专业版', kpUsed: 22, stUsed: 40, tkUsed: 1.1 },
  { i: 4, id: 'ORG004', name: 'AA 文化集团', domainPrefix: 'aa-group', status: '正常', statusCls: 'tag-jade', parentId: null, llm: '平台默认', pay: '已配置', payCls: 'tag-indigo', plan: '旗舰版', kpUsed: 120, stUsed: 300, tkUsed: 6.4 },
  { i: 5, id: 'ORG005', name: 'AA 少儿分社', domainPrefix: 'aa-kids', status: '正常', statusCls: 'tag-jade', parentId: 'ORG004', llm: '平台默认', pay: '未配置', payCls: 'tag-line', plan: '基础版', kpUsed: 6, stUsed: 12, tkUsed: 0.28 },
  { i: 6, id: 'ORG006', name: 'AA 教辅分社', domainPrefix: 'aa-edu', status: '停用', statusCls: 'tag-terra', parentId: 'ORG004', llm: '自配 · 通义', pay: '已配置', payCls: 'tag-indigo', plan: '专业版', kpUsed: 35, stUsed: 70, tkUsed: 1.5 },
  { i: 7, id: 'ORG007', name: 'BB 数字出版', domainPrefix: 'bb-digital', status: '正常', statusCls: 'tag-jade', parentId: null, llm: '平台默认', pay: '已配置', payCls: 'tag-indigo', plan: '旗舰版', kpUsed: 90, stUsed: 220, tkUsed: 4.8 },
  { i: 8, id: 'ORG008', name: 'BB 期刊中心', domainPrefix: 'bb-journal', status: '正常', statusCls: 'tag-jade', parentId: 'ORG007', llm: '平台默认', pay: '已配置', payCls: 'tag-indigo', plan: '基础版', kpUsed: 9, stUsed: 18, tkUsed: 0.46 },
  { i: 9, id: 'ORG009', name: 'CC 科技出版', domainPrefix: 'cc-tech', status: '正常', statusCls: 'tag-jade', parentId: null, llm: '自配 · 通义', pay: '未配置', payCls: 'tag-line', plan: '定制版', kpUsed: 60, stUsed: 250, tkUsed: 3.6, custom: { kp: 80, storage: 300, token: 5 } },
  { i: 10, id: 'ORG010', name: 'CC 医学分社', domainPrefix: 'cc-med', status: '正常', statusCls: 'tag-jade', parentId: 'ORG009', llm: '平台默认', pay: '已配置', payCls: 'tag-indigo', plan: '专业版', kpUsed: 44, stUsed: 88, tkUsed: 1.9 },
  { i: 11, id: 'ORG011', name: 'DD 教育研究院', domainPrefix: 'dd-research', status: '停用', statusCls: 'tag-terra', parentId: null, llm: '平台默认', pay: '未配置', payCls: 'tag-line', plan: '基础版', kpUsed: 5, stUsed: 10, tkUsed: 0.2 },
  // 0813-2：「降档超额」演示机构（OVER_QUOTA_DEMO_ORG_ID）——上一期 10 KP + 加油包 2 用满 12 个，
  //   本期降到定制版 5 KP / 5 GB，存量超 7 个 KP、5 GB。列表两列均标红「超额」，供商务催收与续费谈判。
  { i: 12, id: 'ORG012', name: 'DD 考试中心', domainPrefix: 'dd-exam', status: '正常', statusCls: 'tag-jade', parentId: 'ORG011', llm: '平台默认', pay: '已配置', payCls: 'tag-indigo', plan: '定制版', kpUsed: 12, stUsed: 10, tkUsed: 0.21, custom: { kp: 5, storage: 5, token: 0.5 } },
  { i: 13, id: 'ORG013', name: 'EE 美术出版', domainPrefix: 'ee-art', status: '正常', statusCls: 'tag-jade', parentId: null, llm: '平台默认', pay: '已配置', payCls: 'tag-indigo', plan: '旗舰版', kpUsed: 75, stUsed: 180, tkUsed: 3.2 },
];

export type OrgRole = 'parent' | 'child' | 'ordinary';

/** 从机构树推导角色：有下级 = 父机构；有上级 = 子机构；两者皆无 = 普通机构（不加标签）。 */
export function platformOrgRole(org: PlatformOrg, all: PlatformOrg[] = PLATFORM_ORGS): OrgRole {
  if (all.some((x) => x.parentId === org.id)) return 'parent';
  if (org.parentId) return 'child';
  return 'ordinary';
}

/** 按机构名查角色（供跨端筛选下拉使用；名字不在主数据里的机构一律按普通机构处理、不加标签）。 */
export function orgRoleByName(name: string, all: PlatformOrg[] = PLATFORM_ORGS): OrgRole {
  const org = all.find((o) => o.name === name);
  return org ? platformOrgRole(org, all) : 'ordinary';
}

// 仅父机构加标签（有下级、涉及"含下级"汇总，需要标注提醒）；子机构已由「上级机构」列体现、
// 普通机构无从属关系，均不加标签，避免冗余噪音。
const ROLE_TAG: Record<OrgRole, string> = { parent: '父机构', child: '', ordinary: '' };

/**
 * 平台各筛选下拉的机构选项文案：父机构 →「（父机构）」；子机构与普通机构不加后缀。
 * 「全部…」等重置项原样返回。与 orgOptionValue 成对使用（下拉选中后剥离标签取回真实机构名）。
 */
export function orgOptionLabel(name: string): string {
  if (name.startsWith('全部')) return name;
  const tag = ROLE_TAG[orgRoleByName(name)];
  return tag ? `${name}（${tag}）` : name;
}

export function orgOptionValue(label: string): string {
  return label.replace(/（(?:父机构|子机构)）$/, '');
}

// ---- 0806-4：平台主控台机构多选联动 ----

/** 展开所选机构为机构 ID 集：父机构含其全部子机构；父子同选时去重，避免重复计量。 */
function expandOrgIds(selected: string[], all: PlatformOrg[]): Set<string> {
  const ids = new Set<string>();
  for (const o of all) {
    if (!selected.includes(o.name)) continue;
    ids.add(o.id);
    all.filter((x) => x.parentId === o.id).forEach((x) => ids.add(x.id));
  }
  return ids;
}

/**
 * 主控台机构多选联动系数（0~1]：以各机构当前周期 Token 用量（tkUsed）作为活跃度权重代理（mock 近似），
 * 返回所选机构集合（父机构含子机构）占全平台的比例。绝对量指标按比例缩放；率类（续费率等）不缩放。
 */
export function platformOrgFactor(selected: string[], all: PlatformOrg[] = PLATFORM_ORGS): number {
  const total = all.reduce((s, o) => s + o.tkUsed, 0);
  if (!total) return 1;
  const ids = expandOrgIds(selected, all);
  const sel = all.filter((o) => ids.has(o.id)).reduce((s, o) => s + o.tkUsed, 0);
  return sel / total;
}

/** 所选机构集合展开后的机构数（父机构含全部子机构、去重）；全选时请改用 platformSnapshot.orgs 的全平台口径。 */
export function platformOrgCount(selected: string[], all: PlatformOrg[] = PLATFORM_ORGS): number {
  return expandOrgIds(selected, all).size;
}
