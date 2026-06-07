import type { Conversation, MessageBlock } from '../types';

const cardioAnswer = `STEMI 的判定核心是相邻两个导联 ST 段抬高 ≥ 0.1 mV，胸前导联抬高 ≥ 0.2 mV，并伴有相应导联的对应性 ST 段压低。临床上，应在 10 分钟内完成首份 12 导联心电图，并启动急性再灌注通道：

1. **首选 PCI（直接经皮冠脉介入）**：FMC（首次医疗接触）至导丝通过梗死血管 ≤ 90 分钟。
2. **溶栓**：若 90 分钟内无法 PCI，FMC 至溶栓 ≤ 30 分钟。
3. **抗栓**：阿司匹林 300 mg 嚼服 + P2Y12 受体拮抗剂负荷剂量。术前 3–5 天停华法林，**INR ≤ 1.5** 后造影。

注意鉴别诊断：心包炎、Brugada 综合征、左束支传导阻滞下的 STEMI 难判时优先按 STEMI 处理。`;

const cardioMsg: MessageBlock = {
  id: 'msg_001',
  role: 'ai',
  text: cardioAnswer,
  assets: [
    {
      id: 'asset_001',
      type: 'image',
      title: 'STEMI 12 导联心电图典型示例',
      meta: '原书 第 4 章 P88',
      tag: 'free',
    },
    {
      id: 'asset_002',
      type: 'video',
      title: '直接 PCI 操作流程演示',
      meta: '02:34 · 第 6 章配套视频',
      tag: 'member',
      price: 0,
    },
    {
      id: 'asset_003',
      type: 'audio',
      title: '主任查房：STEMI 急诊处理 30 分钟',
      meta: '00:42–25:18 · 临床查房录音',
      tag: 'forever',
      price: 4.9,
      kpId: 'kp_cardio',
    },
  ],
  sources: [
    { bookTitle: '中国医学临床百家 · 心血管分册（第 4 版）', chapter: '第 4 章 急性冠脉综合征', page: 88 },
    { bookTitle: '中国医学临床百家 · 心血管分册（第 4 版）', chapter: '第 6 章 冠脉介入', page: 142 },
    { bookTitle: '主任查房录音 · 急诊心内', videoTimestamp: 42 },
  ],
  followups: [
    'NSTEMI 与 STEMI 在再灌注策略上有什么差异？',
    'STEMI 患者合并出血风险时怎么权衡抗栓？',
    '溶栓后哪些指标提示再灌注成功？',
  ],
  extended: [
    {
      kpId: 'kp_cardio',
      title: '心血管分册 · 第 4 版 永享',
      price: 4.9,
      meta: '解锁全册视频/音频/图谱，永久持有',
    },
  ],
  createdAt: '2026-05-08T10:30:00Z',
};

const userMsg: MessageBlock = {
  id: 'msg_user_001',
  role: 'user',
  text: '冠脉造影术前抗凝怎么管？怎么判断 STEMI？',
  createdAt: '2026-05-08T10:29:00Z',
};

export const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_001',
    orgId: 'org_med',
    userId: 'user_demo',
    kpId: 'kp_cardio',
    title: '冠脉造影术前抗凝 / STEMI 判定',
    messages: [userMsg, cardioMsg],
    updatedAt: '2026-05-08T10:30:00Z',
  },
  {
    id: 'conv_002',
    orgId: 'org_med',
    userId: 'user_demo',
    kpId: 'kp_cardio',
    title: '心衰利尿剂选择',
    messages: [
      {
        id: 'msg_user_002',
        role: 'user',
        text: '射血分数保留型心衰一线利尿怎么选？',
        createdAt: '2026-05-06T14:20:00Z',
      },
      {
        id: 'msg_ai_002',
        role: 'ai',
        text: '射血分数保留型心衰（HFpEF）以容量管理为核心，一线利尿首选呋塞米 20–40mg q.d.，根据尿量与体重每日滴定。注意监测电解质（K⁺、Na⁺、Mg²⁺）与肾功能 …',
        sources: [
          { bookTitle: '心血管分册（第 4 版）', chapter: '第 8 章 心力衰竭', page: 196 },
        ],
        followups: ['HFpEF 与 HFrEF 在 SGLT2i 选择上有差异吗？', '使用呋塞米后低钾如何预防？'],
        createdAt: '2026-05-06T14:21:00Z',
      },
    ],
    updatedAt: '2026-05-06T14:21:00Z',
  },
  {
    id: 'conv_003',
    orgId: 'org_med',
    userId: 'user_demo',
    kpId: 'kp_cardio',
    title: '房颤抗凝 CHA₂DS₂-VASc 评分',
    messages: [],
    updatedAt: '2026-05-02T09:00:00Z',
  },
  {
    id: 'conv_004',
    orgId: 'org_med',
    userId: 'user_demo',
    kpId: 'kp_cardio',
    title: 'PCI 术后双抗持续多久',
    messages: [],
    updatedAt: '2026-04-22T16:30:00Z',
  },
  {
    id: 'conv_005',
    orgId: 'org_med',
    userId: 'user_demo',
    kpId: 'kp_cardio',
    title: '高血压急症静脉用药选择',
    messages: [],
    updatedAt: '2026-04-12T08:30:00Z',
  },
  {
    id: 'conv_006',
    orgId: 'org_med',
    userId: 'user_demo',
    kpId: 'kp_cardio',
    title: 'IABP 适应证',
    messages: [],
    updatedAt: '2026-03-28T14:00:00Z',
  },
  {
    id: 'conv_007',
    orgId: 'org_med',
    userId: 'user_demo',
    kpId: 'kp_cardio',
    title: '心源性休克升压药选择',
    messages: [],
    updatedAt: '2026-03-15T11:20:00Z',
  },
  {
    id: 'conv_008',
    orgId: 'org_med',
    userId: 'user_demo',
    kpId: 'kp_cardio',
    title: '心电图 V1-V3 的 ST 抬高怎么解读',
    messages: [],
    updatedAt: '2026-02-26T20:10:00Z',
  },
];
