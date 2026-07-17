// 0714：答案反馈导出 spec（纯函数）——仅问答文本与必要元数据（不含媒体 / 溯源）。
import type { ExportSpec } from '@aba/ui-admin';
import { MY_ORG } from '../../../../packages/mock/src/data/adminOrders.ts';
import { nickOf, type FB } from '../data/feedback.ts';

export interface FeedbackExportInput {
  rows: FB[];
  q: string; // 关键词（问题 / 反馈人）
  tag: string; // 反馈标签筛选
  timeLabel: string; // 提交时间区间 label
}

export function buildFeedbackSpec({ rows, q, tag, timeLabel }: FeedbackExportInput): ExportSpec {
  return {
    context: {
      scope: MY_ORG,
      business: '答案反馈',
      filters: [
        ['关键词', q || '无'],
        ['反馈标签', tag],
        ['提交时间区间', timeLabel],
      ],
    },
    sheets: [
      {
        name: '反馈明细',
        title: '机构答案反馈',
        subtitle: '仅含问答文本与必要元数据，不含媒体 / 溯源',
        headers: ['反馈 ID', '问题', 'AI 答案', '反馈标签', '反馈人', '会员状态', '关联 KP', '提交时间'],
        rows: rows.map((r) => [r.id, r.q, r.answer, r.tag, nickOf(r.user), r.member ? '会员' : '非会员', r.kp, r.time]),
        widths: [16, 38, 72, 18, 18, 14, 28, 22],
      },
    ],
  };
}
