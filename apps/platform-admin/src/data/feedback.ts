// 全域答案反馈 mock（0714 从 GlobalFeedback.tsx 视图下移，供视图与导出 spec 共用）。
// 本文件须保持 node 可运行（不 import react / .tsx / css / window；MediaItem 为 type-only import，剥离后无运行时依赖）。
import type { MediaItem } from '@aba/ui-admin';

export interface FB {
  id: string;
  org: string;
  q: string;
  answer: string;
  media: MediaItem[];
  tag: string;
  cls: string;
  user: string;
  /** 0806：反馈人会员状态四态（原 member: boolean 二分） */
  memberState: 'active' | 'grace' | 'expired' | 'none';
  time: string;
}

export const FB_TAGS = ['全部', '没有帮助', '虚假信息', '有害 / 不安全', '其他'];

export const nickOf = (u: string) => u.replace(/^微信用户·/, '');

export const GLOBAL_FEEDBACK: FB[] = [
  { id: 'FB3041', org: 'XX 出版社', q: '高血压能不能喝咖啡？', answer: '一般而言，高血压患者可适量饮用咖啡，每日不宜超过 1–2 杯，且避免空腹饮用。具体请结合个人血压控制情况并遵医嘱。', media: [{ kind: 'image', name: '咖啡因与血压关系示意图.png' }], tag: '没有帮助', cls: 'tag-line', user: '微信用户·阿橙', memberState: 'active', time: '2026-06-06 20:11' },
  { id: 'FB3040', org: 'XX 出版社', q: '这个剂量是不是写错了？', answer: '经核对，该药物成人常规剂量为每次 5mg、每日一次，知识库标注无误。请以药品说明书与医师处方为准。', media: [{ kind: 'image', name: '药品说明书剂量页.png' }, { kind: 'video', name: '用药演示.mp4' }], tag: '虚假信息', cls: 'tag-amber', user: '微信用户·林医森', memberState: 'grace', time: '2026-06-06 15:42' },
  { id: 'FB3039', org: 'YY 教育', q: '这道题的解法太笼统了', answer: '抱歉未能讲清。该题可用因式分解法分三步求解，建议补充年级与教材版本，我可给出更贴合的步骤。', media: [], tag: '没有帮助', cls: 'tag-line', user: '微信用户·小满', memberState: 'none', time: '2026-06-05 11:23' },
  { id: 'FB3038', org: 'YY 教育', q: '这个知识点和课本不一致', answer: '不同版本教材表述可能有差异。本回答基于知识库最新教材，如有更权威出处欢迎反馈，我们会复核更新。', media: [{ kind: 'audio', name: '知识点讲解.mp3' }], tag: '虚假信息', cls: 'tag-amber', user: '微信用户·航仔', memberState: 'active', time: '2026-06-05 09:08' },
  { id: 'FB3037', org: 'ZZ 少儿', q: '推荐的绘本适合几岁？', answer: '该绘本适合 3–6 岁亲子共读。如需按年龄细分推荐，可告诉我孩子的具体月龄。', media: [{ kind: 'image', name: '绘本分龄表.png' }], tag: '其他', cls: 'tag-line', user: '微信用户·糖糖妈', memberState: 'expired', time: '2026-06-04 17:50' },
  { id: 'FB3036', org: 'ZZ 少儿', q: '这个建议对孩子安全吗？', answer: '感谢提醒。涉及儿童用药 / 操作存在风险，正确做法是在监护与医师指导下进行，已对该回答做安全降级。', media: [], tag: '有害 / 不安全', cls: 'tag-amber', user: '微信用户·豆豆', memberState: 'grace', time: '2026-06-04 10:15' },
  { id: 'FB3035', org: 'AA 文化集团', q: '答非所问', answer: '抱歉理解有偏差。请问您想了解的是作品背景还是赏析方法？补充后我会重新作答。', media: [], tag: '其他', cls: 'tag-line', user: '微信用户·Cici', memberState: 'none', time: '2026-06-03 19:40' },
  { id: 'FB3034', org: 'AA 文化集团', q: '这个数据来源可靠吗？', answer: '该结论引用自知识库权威章节并已标注来源，可在答案下方点击溯源卡片查看原文出处。', media: [{ kind: 'image', name: '来源页.png' }], tag: '虚假信息', cls: 'tag-amber', user: '微信用户·南风', memberState: 'active', time: '2026-06-03 14:02' },
  { id: 'FB3033', org: 'BB 数字出版', q: '回答里的图看不清', answer: '抱歉给您带来不便。可点击图片放大查看，若仍不清晰，我可提供文字版要点说明。', media: [{ kind: 'image', name: '结构图.png' }], tag: '没有帮助', cls: 'tag-line', user: '微信用户·阿树', memberState: 'grace', time: '2026-06-02 21:18' },
  { id: 'FB3032', org: 'BB 数字出版', q: '这个说法有点危险', answer: '感谢反馈。涉及自行操作的内容存在风险，应在专业指导下进行，已对该回答补充安全提示。', media: [{ kind: 'audio', name: '安全提示.mp3' }], tag: '有害 / 不安全', cls: 'tag-amber', user: '微信用户·老周', memberState: 'expired', time: '2026-06-02 09:33' },
  { id: 'FB3031', org: 'XX 出版社', q: '心电图这个波形代表什么？', answer: '该图为正常窦性心律波形，P-QRS-T 各波形态与间期均在正常范围。如有不适仍建议由医师判读。', media: [{ kind: 'image', name: '心电图示例.png' }], tag: '没有帮助', cls: 'tag-line', user: '微信用户·阿凯', memberState: 'active', time: '2026-06-01 16:27' },
  { id: 'FB3030', org: 'YY 教育', q: '这个结论和我查到的不一样', answer: '不同来源可能存在差异。本回答基于知识库内最新资料，若您有更权威出处，欢迎反馈，我们会复核更新。', media: [], tag: '虚假信息', cls: 'tag-amber', user: '微信用户·Mia', memberState: 'none', time: '2026-06-01 08:50' },
];
