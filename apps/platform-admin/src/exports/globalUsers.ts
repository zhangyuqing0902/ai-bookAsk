// 全域 C 端用户导出 spec（0714）——纯函数，视图与模板生成共用（node 可运行，约束同 dashboard.ts）。
import type { ExportSpec } from '@aba/ui-admin';
import { GLOBAL_USERS, type GUser } from '../data/globalUsers.ts';

export interface GlobalUsersExportArgs {
  rows?: GUser[];
  filters?: Array<[string, string]>;
}

export function buildGlobalUsersSpec(args: GlobalUsersExportArgs = {}): ExportSpec {
  const {
    rows = GLOBAL_USERS,
    filters = [['关键词', '无'], ['机构', '全部'], ['会员状态', '全部']],
  } = args;

  return {
    context: { scope: '全域', business: 'C端用户', filters },
    sheets: [
      {
        name: '用户明细',
        title: '平台全域 C 端用户',
        headers: ['昵称', '微信号', '手机号', '机构', '会员状态', '已购永享（个）', '累计 GMV', '最新登录', '注册时间'],
        rows: rows.map((r) => [r.nick, r.wx, r.phone, r.org, r.member ? '会员' : '非会员', r.yx, `¥${r.gmv}`, r.lastLogin, r.regAt]),
        widths: [20, 18, 16, 22, 14, 14, 16, 22, 22],
      },
    ],
  };
}
