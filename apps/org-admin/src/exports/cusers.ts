// 0714：C 端用户导出 spec（纯函数）——rows 由调用方传入（页面传过滤后、模板传全量）。
import type { ExportSpec } from '@aba/ui-admin';
import { MY_ORG } from '../../../../packages/mock/src/data/adminOrders.ts';
import type { U } from '../data/cusers.ts';

export interface CUsersExportInput {
  rows: U[];
  q: string; // 关键词（手机号 / 微信号 / 昵称）
  member: string; // 会员状态筛选
}

export function buildCUsersSpec({ rows, q, member }: CUsersExportInput): ExportSpec {
  return {
    context: {
      scope: MY_ORG,
      business: 'C端用户',
      filters: [
        ['关键词', q || '无'],
        ['会员状态', member],
      ],
    },
    sheets: [
      {
        name: '用户明细',
        title: '机构 C 端用户',
        headers: ['昵称', '手机号', '微信号', '地区', '性别', '会员状态', '已购永享（个）', '累计 GMV', '最新登录', '注册时间'],
        rows: rows.map((u) => [u.nick, u.phone, u.wx, u.region, u.gender, u.member ? '会员' : '非会员', u.yx, `¥${u.gmv}`, u.lastLogin, u.regAt]),
        widths: [20, 16, 18, 22, 10, 14, 14, 16, 22, 22],
      },
    ],
  };
}
