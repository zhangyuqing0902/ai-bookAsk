// 全域答案反馈导出 spec（0714）——纯函数，视图与模板生成共用（node 可运行，约束同 dashboard.ts）。
import type { ExportSpec } from '@aba/ui-admin';
import { MEMBER_STATE_LABEL } from '../../../../packages/mock/src/data/memberState.ts';
import { GLOBAL_FEEDBACK, nickOf, type FB } from '../data/feedback.ts';

export interface GlobalFeedbackExportArgs {
  rows?: FB[];
  filters?: Array<[string, string]>;
}

export function buildGlobalFeedbackSpec(args: GlobalFeedbackExportArgs = {}): ExportSpec {
  const {
    rows = GLOBAL_FEEDBACK,
    filters = [['关键词', '无'], ['机构', '全部'], ['反馈标签', '全部']],
  } = args;

  return {
    context: { scope: '全域', business: '答案反馈', filters },
    sheets: [
      {
        name: '反馈明细',
        title: '平台全域答案反馈',
        subtitle: '仅含问答文本与必要元数据，不含媒体 / 溯源',
        headers: ['反馈 ID', '机构', '问题', 'AI 答案', '反馈标签', '反馈人', '会员状态', '提交时间'],
        rows: rows.map((r) => [r.id, r.org, r.q, r.answer, r.tag, nickOf(r.user), MEMBER_STATE_LABEL[r.memberState], r.time]),
        widths: [16, 22, 38, 72, 18, 18, 14, 22],
      },
    ],
  };
}
