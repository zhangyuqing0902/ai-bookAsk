import type { CustomRole, OrgAccount, Permission } from '../types';

/** 全局权限点（按业务模块分组） */
export const PERMISSIONS: Permission[] = [
  // 知识产品
  { key: 'kp.view', group: '知识产品', label: '查看 KP 列表' },
  { key: 'kp.create', group: '知识产品', label: '创建 KP' },
  { key: 'kp.edit', group: '知识产品', label: '编辑 KP 基本信息' },
  { key: 'kp.publish', group: '知识产品', label: '发布 / 归档 KP' },
  { key: 'kp.delete', group: '知识产品', label: '删除 KP' },
  // 知识库（文件 / 切片）
  { key: 'kb.upload', group: '知识库', label: '上传文件' },
  { key: 'kb.slice.edit', group: '知识库', label: '编辑切片' },
  { key: 'kb.slice.delete', group: '知识库', label: '删除切片' },
  // 二维码
  { key: 'qr.create', group: '二维码', label: '生成码包' },
  { key: 'qr.download', group: '二维码', label: '下载码包' },
  { key: 'qr.revoke', group: '二维码', label: '停用码包' },
  // 定价 / 兑换码
  { key: 'pricing.edit', group: '定价', label: '修改定价' },
  { key: 'pricing.redeem', group: '定价', label: '生成兑换码' },
  // Agent
  { key: 'agent.edit', group: 'Agent', label: '编辑 Agent 人设' },
  // 订单 / 用户
  { key: 'order.view', group: '订单', label: '查看订单' },
  { key: 'order.refund', group: '订单', label: '审批退款' },
  { key: 'user.view', group: '用户', label: '查看 C 端用户' },
  { key: 'user.disable', group: '用户', label: '禁用 C 端用户' },
  // 数据
  { key: 'analytics.view', group: '数据', label: '查看数据看板' },
  { key: 'analytics.export', group: '数据', label: '导出数据' },
  // 客服
  { key: 'service.edit', group: '客服', label: '编辑客服配置' },
  { key: 'service.ticket', group: '客服', label: '处理工单' },
];

const allKeys = (...prefixes: string[]) =>
  PERMISSIONS.filter((p) => prefixes.some((px) => p.key.startsWith(px))).map((p) => p.key);

/** 系统内置角色（不可删，只可只读） */
export const ROLES: CustomRole[] = [
  {
    id: 'role_org_admin',
    name: '机构管理员',
    desc: '本机构内全部数据可见可操作',
    permissions: PERMISSIONS.map((p) => p.key),
    builtin: true,
  },
  {
    id: 'role_org_op',
    name: '运营',
    desc: '上传切片 + 配 Agent + 操作订单（部分写）',
    permissions: [
      ...allKeys('kp.', 'kb.', 'qr.', 'agent.', 'analytics.'),
      'order.view',
      'pricing.edit',
      'user.view',
    ],
    builtin: true,
  },
  {
    id: 'role_org_cs',
    name: '客服',
    desc: '订单只读 + 工单读写',
    permissions: ['order.view', 'service.ticket', 'user.view'],
    builtin: true,
  },
  // 自定义角色示例
  {
    id: 'role_org_finance',
    name: '财务（自定义）',
    desc: '仅看订单与数据，不可修改任何业务',
    permissions: ['order.view', 'analytics.view', 'analytics.export'],
  },
];

export const ORG_ACCOUNTS: OrgAccount[] = [
  {
    id: 'acc_001',
    orgId: 'org_med',
    account: 'admin@org_med',
    name: '姐姐',
    phone: '138****1234',
    email: 'jiejie@med-clinic.cn',
    roleId: 'role_org_admin',
    status: 'active',
    createdAt: '2026-01-10',
    lastLoginAt: '2026-05-08 09:32',
  },
  {
    id: 'acc_002',
    orgId: 'org_med',
    account: 'op_zhang@org_med',
    name: '张运营',
    phone: '139****5678',
    email: 'zhang@med-clinic.cn',
    roleId: 'role_org_op',
    status: 'active',
    createdAt: '2026-02-04',
    lastLoginAt: '2026-05-07 22:08',
  },
  {
    id: 'acc_003',
    orgId: 'org_med',
    account: 'cs_li@org_med',
    name: '李客服',
    phone: '136****0001',
    email: 'cs@med-clinic.cn',
    roleId: 'role_org_cs',
    status: 'active',
    createdAt: '2026-03-12',
    lastLoginAt: '2026-05-08 11:50',
  },
  {
    id: 'acc_004',
    orgId: 'org_fin',
    account: 'admin@org_fin',
    name: '王主编',
    phone: '135****2222',
    email: 'wang@fin-press.cn',
    roleId: 'role_org_admin',
    status: 'active',
    createdAt: '2026-02-01',
  },
  {
    id: 'acc_005',
    orgId: 'org_lit',
    account: 'admin@org_lit',
    name: '十月编辑',
    roleId: 'role_org_admin',
    status: 'disabled',
    createdAt: '2026-04-05',
  },
];
