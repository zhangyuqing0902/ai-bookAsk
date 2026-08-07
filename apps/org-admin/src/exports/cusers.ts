// 0714：C 端用户导出 spec（纯函数）——rows 由调用方传入（页面传过滤后、模板传全量）。
import type { ExportSpec } from '@aba/ui-admin';
import { MY_ORG } from '../../../../packages/mock/src/data/adminOrders.ts';
import { MEMBER_STATE_LABEL } from '../../../../packages/mock/src/data/memberState.ts';
import type { U } from '../data/cusers.ts';

export interface CUsersExportInput {
  rows: U[];
  q: string; // 关键词（手机号 / 微信号 / 昵称）
  member: string; // 会员状态筛选（0806：五档＝全部＋四态）
  org?: string; // 0806：父机构视角的机构筛选（子 / 独立视角不传）
}

export function buildCUsersSpec({ rows, q, member, org }: CUsersExportInput): ExportSpec {
  return {
    context: {
      scope: MY_ORG,
      business: 'C端用户',
      filters: [
        ['关键词', q || '无'],
        ...(org ? [['机构', org] as [string, string]] : []),
        ['会员状态', member],
      ],
    },
    sheets: [
      {
        name: '用户明细',
        title: '机构 C 端用户',
        headers: ['昵称', '手机号', '微信号', '归属机构', '地区', '性别', '会员状态', '已购永享（个）', '累计 GMV', '最新登录', '注册时间'],
        rows: rows.map((u) => [u.nick, u.phone, u.wx, u.org, u.region, u.gender, MEMBER_STATE_LABEL[u.memberState], u.yx, `¥${u.gmv}`, u.lastLogin, u.regAt]),
        widths: [20, 16, 18, 18, 22, 10, 18, 14, 16, 22, 22],
      },
    ],
  };
}
