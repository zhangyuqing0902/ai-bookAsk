// 平台账户 mock（0714 从 PlatformAccounts.tsx 视图下移，供视图与导出 spec 共用）。
// 本文件须保持 node 可运行（不 import react / .tsx / css / window）。

export const PLAT_ROLES = ['平台超级管理员', '平台运营', '平台财务'];

export interface PAccount {
  id: string;
  account: string;
  name: string;
  role: string;
  phone: string;
  status: '启用' | '停用';
  createdAt: string;
}

export const PLATFORM_ACCOUNT_SEED: PAccount[] = [
  { id: 'p1', account: 'superadmin', name: '超级管理员', role: '平台超级管理员', phone: '18800000000', status: '启用', createdAt: '2025-12-01 09:00:00' },
  { id: 'p2', account: 'ops_lina', name: '李娜', role: '平台运营', phone: '13912345678', status: '启用', createdAt: '2026-01-20 10:12:30' },
  { id: 'p3', account: 'fin_wang', name: '王财务', role: '平台财务', phone: '13700222222', status: '停用', createdAt: '2026-02-15 14:30:05' },
];
