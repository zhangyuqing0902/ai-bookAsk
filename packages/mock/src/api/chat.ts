import type { MessageBlock } from '../types';
import { sleep, track } from './util';

export interface StreamHandle {
  promise: Promise<MessageBlock>;
  cancel: () => void;
}

const SAMPLE_REPLY = `你好。关于你刚问到的问题，根据本书的核心观点：

1. **第一要点**：先把概念厘清，避免后续讨论中混淆。
2. **第二要点**：结合临床/行业数据，证据链应该完整、可追溯。
3. **第三要点**：决策时优先考虑边际成本与可逆性，再考虑长期收益。

**实践建议**：先做最小可行的尝试，再按反馈迭代。具体执行细节请见下方多模态卡片与回答溯源。`;

export const askQuestion = (
  question: string,
  onChunk: (msg: MessageBlock) => void,
): StreamHandle => {
  track('chat_msg_submit', { input_type: 'text', length: question.length });
  let canceled = false;
  const id = `msg_${Date.now()}`;

  const promise = (async () => {
    let acc = '';
    // 首字延迟（模拟 P95 ≤ 1500ms）
    await sleep(420);
    if (canceled) throw new Error('canceled');
    const chars = SAMPLE_REPLY.split('');
    for (const c of chars) {
      if (canceled) break;
      acc += c;
      onChunk({
        id,
        role: 'ai',
        text: acc,
        streaming: true,
        createdAt: new Date().toISOString(),
      });
      await sleep(18);
    }
    // 流式完成 → 补齐 assets/sources/followups
    const full: MessageBlock = {
      id,
      role: 'ai',
      text: acc,
      streaming: false,
      assets: [
        {
          id: `${id}_a1`,
          type: 'image',
          title: '示意图：核心概念可视化',
          meta: '原书 P102',
          tag: 'free',
        },
        {
          id: `${id}_a2`,
          type: 'video',
          title: '配套讲解视频（02:34）',
          meta: '第 5 章 配套视频',
          tag: 'member',
        },
        {
          id: `${id}_a3`,
          type: 'audio',
          title: '主任查房 · 实战案例 30 分钟',
          meta: '00:00–28:42',
          tag: 'forever',
          price: 4.9,
          kpId: 'kp_cardio',
        },
      ],
      sources: [
        { bookTitle: '中国医学临床百家 · 心血管分册（第 4 版）', chapter: '第 4 章', page: 102 },
        { bookTitle: '中国医学临床百家 · 心血管分册（第 4 版）', chapter: '第 5 章', page: 138 },
      ],
      followups: [
        '能展开讲讲第二要点的具体场景吗？',
        '第三要点在不同行业怎么落地？',
        '有没有反例或者常见误区？',
      ],
      extended: [
        {
          kpId: 'kp_cardio',
          title: '心血管分册 · 永享买断',
          price: 4.9,
          meta: '解锁全册视频/音频/图谱',
        },
      ],
      createdAt: new Date().toISOString(),
    };
    onChunk(full);
    track('chat_msg_done', { len: acc.length });
    return full;
  })();

  return {
    promise,
    cancel: () => {
      canceled = true;
      track('chat_msg_cancel');
    },
  };
};

export const transcribeVoice = async (durationSec: number) => {
  track('asr_start', { duration_sec: durationSec });
  await sleep(900);
  track('asr_done');
  return '冠脉造影术前抗凝怎么管？';
};
