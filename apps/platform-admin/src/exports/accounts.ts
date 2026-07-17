// 机构账户导出 spec（0714 新增）——纯函数，视图与模板生成共用（node 可运行，约束同 dashboard.ts）。
import type { ExportSpec } from '@aba/ui-admin';
import { ACCOUNT_ROWS, type Acct } from '../data/accounts.ts';
import { revealPhone } from '../../../../packages/mock/src/rules.ts';

export interface AccountsExportArgs {
  rows?: Acct[];
  filters?: Array<[string, string]>;
}

export function buildAccountsSpec(args: AccountsExportArgs = {}): ExportSpec {
  const {
    rows = ACCOUNT_ROWS,
    filters = [['关键词', '无'], ['机构', '全部'], ['上级机构', '全部'], ['角色', '全部'], ['状态', '全部']],
  } = args;

  return {
    context: { scope: '全域', business: '机构账户', filters },
    sheets: [
      {
        name: '账户明细',
        title: '平台机构账户',
        headers: ['账户 ID', '账户名', '姓名', '机构', '上级机构', '角色', '状态', '联系电话'],
        rows: rows.map((r) => [r.id, r.name, r.person, r.org, r.parent, r.role, r.status, r.contact === '—' ? '—' : revealPhone(r.contact)]),
        widths: [12, 16, 12, 22, 22, 12, 10, 18],
      },
    ],
  };
}
