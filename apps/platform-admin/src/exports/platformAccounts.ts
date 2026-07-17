// 平台账户导出 spec（0714 新增）——纯函数，视图与模板生成共用（node 可运行，约束同 dashboard.ts）。
import type { ExportSpec } from '@aba/ui-admin';
import { PLATFORM_ACCOUNT_SEED, type PAccount } from '../data/platformAccounts.ts';

export interface PlatformAccountsExportArgs {
  rows?: PAccount[];
  filters?: Array<[string, string]>;
}

export function buildPlatformAccountsSpec(args: PlatformAccountsExportArgs = {}): ExportSpec {
  const {
    rows = PLATFORM_ACCOUNT_SEED,
    filters = [['关键词', '无'], ['角色', '全部'], ['状态', '全部']],
  } = args;

  return {
    context: { scope: '全域', business: '平台账户', filters },
    sheets: [
      {
        name: '账户明细',
        title: '平台账户',
        subtitle: '平台方人员账户（平台超管 / 运营 / 财务），平台级角色、无所属机构',
        headers: ['账户名称', '姓名', '角色', '联系方式', '状态', '创建时间'],
        rows: rows.map((a) => [a.account, a.name, a.role, a.phone, a.status, a.createdAt]),
        widths: [18, 14, 18, 18, 10, 22],
      },
    ],
  };
}
