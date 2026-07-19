// 0717 #2.3：机构后台 KP 列表与详情的单一数据源（此前列表内联数据与详情硬编码互不相干）。
// 每个生命周期状态至少一条演示数据（草稿 / 已发布 / 已下架），
// 实时分享各一条：分享方（本机构分享出去）与接收方（外机构实时同步导入、只读）。
// 状态命名两后台统一（0717 #2.4）：draft=草稿 / published=已发布 / unlisted=已下架；删除＝逻辑删除，列表不展示。

export interface OrgKp {
  /** 路由 id（/kps/:id），与 kpLifecycle store 的 override key 一致 */
  id: string;
  name: string;
  cover: string;
  source: '自建' | '共享';
  /** 共享来源的导入方式：realtime = 实时同步（只读），snapshot = 独立快照（可编辑）；自建为 undefined */
  shareMode?: 'realtime' | 'snapshot';
  /** 实时分享角色：sharer=分享方（本机构把该 KP 实时分享给其他机构）；consumer=接收方（实时导入） */
  shareRole?: 'sharer' | 'consumer';
  status: 'draft' | 'published' | 'unlisted';
  agent: string;
  files: string;
  asks: string;
  /** 删除弹窗影响声明用：已购永享 / 纸书扫码解锁用户数；业务关系（全 0 走简化弹窗） */
  purchasedUsers: number;
  bookUsers: number;
  relations: { orders?: number; grants?: number; shares?: number; imports?: number };
}

export const ORG_KPS: OrgKp[] = [
  // 已发布 + 实时分享·分享方（分享 Tab 内可见分享链接记录）
  { id: '1', name: '心血管分册 · 第4版', cover: '', source: '自建', shareRole: 'sharer', status: 'published', agent: '李医生', files: '12', asks: '1.2k', purchasedUsers: 12, bookUsers: 8, relations: { orders: 1, shares: 1 } },
  // 草稿（无任何业务关系 → 删除走简化弹窗；显示「发布」按钮）
  { id: '2', name: '儿科学', cover: 'c2', source: '自建', status: 'draft', agent: '王老师', files: '8', asks: '340', purchasedUsers: 0, bookUsers: 0, relations: {} },
  // 已发布 + 实时分享·接收方（实时同步导入,详情只读、隐藏二维码/分享 Tab）
  { id: '3', name: '内科精要', cover: 'c3', source: '共享', shareMode: 'realtime', shareRole: 'consumer', status: 'published', agent: '—', files: '20', asks: '5k', purchasedUsers: 0, bookUsers: 0, relations: { imports: 1 } },
  // 已发布 + 独立快照导入（可编辑）
  { id: '4', name: '外科学-快照', cover: 'c4', source: '共享', shareMode: 'snapshot', status: 'published', agent: '赵', files: '6', asks: '88', purchasedUsers: 0, bookUsers: 0, relations: { imports: 1 } },
  // 已下架（详情显示「重新发布」按钮；前台各入口显「已下架」）
  { id: '5', name: '围手术期麻醉管理精要', cover: 'c2', source: '自建', status: 'unlisted', agent: '李医生', files: '9', asks: '760', purchasedUsers: 6, bookUsers: 15, relations: { orders: 1, grants: 1 } },
];

/** 两后台统一的状态标签（0717 #2.4：草稿 / 已发布 / 已下架 + 已删除仅作过滤依据） */
export const ORG_KP_STATUS_META: Record<'draft' | 'published' | 'unlisted' | 'deleted', { label: string; cls: string }> = {
  draft: { label: '草稿', cls: 'tag-line' },
  published: { label: '已发布', cls: 'tag-jade' },
  unlisted: { label: '已下架', cls: 'tag-amber' },
  deleted: { label: '已删除', cls: 'tag-terra' },
};
