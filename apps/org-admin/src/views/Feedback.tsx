import { useState } from 'react';
import { Icon, toast } from '@aba/ui';
import { Search, Dropdown, RangePicker, DataGrid, FeedbackDetailModal, type Col, type MediaItem } from '@aba/ui-admin';

// 机构后台 · 答案反馈工作台（0613-2：从数据看板独立成「数据中心」一级菜单）
// 列表（分页 + 按标签/时间/问题搜）→ 详情（问题 + AI 答案，含当时推送的图/音/视多模态知识）；
// 反馈人标注会员；导出仅含问答文本（不含媒体 / 溯源）。
interface FB {
  id: string;
  q: string;
  answer: string;
  media: MediaItem[];
  tag: string;
  cls: string;
  user: string;
  member: boolean;
  kp: string;
  time: string;
}

const TAGS = ['全部', '没有帮助', '虚假信息', '有害 / 不安全', '其他'];

// 0614 反馈人直接显示昵称（去掉「微信用户·」前缀），是否会员另用标识
const nickOf = (u: string) => u.replace(/^微信用户·/, '');

const DATA: FB[] = [
  { id: 'FB2041', q: '高血压能不能喝咖啡？', answer: '一般而言，高血压患者可以适量饮用咖啡，但每日不宜超过 1–2 杯，且应避免空腹饮用。咖啡因可能引起短时血压升高，敏感人群更需谨慎。具体请结合个人血压控制情况并遵医嘱。', media: [{ kind: 'image', name: '咖啡因与血压关系示意图.png' }], tag: '没有帮助', cls: 'tag-line', user: '微信用户·阿橙', member: true, kp: '李医生 · 心血管分册', time: '2026-06-06 20:11' },
  { id: 'FB2040', q: '这个剂量是不是写错了？', answer: '经核对，该药物成人常规剂量为每次 5mg、每日一次，知识库中标注无误。若您看到的是其他来源信息，请以药品说明书与医师处方为准。', media: [{ kind: 'image', name: '药品说明书剂量页.png' }, { kind: 'video', name: '用药演示.mp4' }], tag: '虚假信息', cls: 'tag-amber', user: '微信用户·林医森', member: true, kp: '李医生 · 内科精要', time: '2026-06-06 15:42' },
  { id: 'FB2039', q: '回答太笼统了，没解决问题', answer: '抱歉未能解决您的问题。儿童发热护理需结合体温、精神状态与持续时间综合判断，建议补充孩子的年龄与具体症状，我可以给出更有针对性的建议。', media: [], tag: '没有帮助', cls: 'tag-line', user: '微信用户·小满妈妈', member: false, kp: '王老师 · 儿科学', time: '2026-06-05 11:23' },
  { id: 'FB2038', q: '这个建议有点危险', answer: '感谢提醒。涉及自行调整用药或剂量的内容存在风险，正确做法是在医师指导下进行。已对该回答进行安全降级处理。', media: [{ kind: 'audio', name: '安全用药提示.mp3' }], tag: '有害 / 不安全', cls: 'tag-amber', user: '微信用户·老周', member: true, kp: '李医生 · 外科学', time: '2026-06-05 09:08' },
  { id: 'FB2037', q: '答非所问', answer: '抱歉理解有偏差。请问您想了解的是术后护理还是康复训练？补充后我会重新作答。', media: [], tag: '其他', cls: 'tag-line', user: '微信用户·Cici', member: false, kp: '机构 Agent', time: '2026-06-04 17:50' },
  { id: 'FB2036', q: '心电图这个波形代表什么？', answer: '该图为正常窦性心律的心电波形，P-QRS-T 各波形态与间期均在正常范围。如有不适仍建议结合临床由医师判读。', media: [{ kind: 'image', name: '心电图示例.png' }], tag: '没有帮助', cls: 'tag-line', user: '微信用户·阿凯', member: true, kp: '李医生 · 心血管分册', time: '2026-06-04 10:15' },
  { id: 'FB2035', q: '这个能直接停药吗？', answer: '不建议自行停药。部分药物突然停用可能引起反跳，应在医师指导下逐步减量。', media: [], tag: '有害 / 不安全', cls: 'tag-amber', user: '微信用户·阿芬', member: false, kp: '李医生 · 内科精要', time: '2026-06-03 19:40' },
  { id: 'FB2034', q: '超声报告里的低回声是什么意思？', answer: '低回声通常指该区域反射的超声波较周围组织弱，可能为囊性或实性结节，需结合大小、边界与血流综合判断，建议由专科医师评估。', media: [{ kind: 'image', name: '超声低回声示例.png' }], tag: '没有帮助', cls: 'tag-line', user: '微信用户·豆豆', member: true, kp: '王老师 · 超声诊断', time: '2026-06-03 14:02' },
  { id: 'FB2033', q: '这个数据来源可靠吗？', answer: '该结论引用自知识库中的权威指南章节，并已标注来源。如需查看原文出处，可在答案下方点击溯源卡片。', media: [{ kind: 'image', name: '指南来源页.png' }], tag: '虚假信息', cls: 'tag-amber', user: '微信用户·南风', member: true, kp: '李医生 · 心血管分册', time: '2026-06-02 21:18' },
  { id: 'FB2032', q: '宝宝湿疹怎么护理？', answer: '日常以保湿为主，选择无香料的润肤霜，避免过热与刺激性衣物；若皮损渗出或加重，请及时就医。', media: [{ kind: 'image', name: '湿疹护理要点.png' }, { kind: 'audio', name: '护理语音说明.mp3' }], tag: '没有帮助', cls: 'tag-line', user: '微信用户·糖糖', member: false, kp: '王老师 · 儿科学', time: '2026-06-02 09:33' },
  { id: 'FB2031', q: '回答里的图看不清', answer: '抱歉给您带来不便。可点击图片放大查看，若仍不清晰，我可以为您提供文字版要点说明。', media: [{ kind: 'image', name: '解剖结构图.png' }], tag: '其他', cls: 'tag-line', user: '微信用户·阿树', member: true, kp: '李医生 · 外科学', time: '2026-06-01 16:27' },
  { id: 'FB2030', q: '这个说法和我查到的不一样', answer: '不同来源可能存在差异。本回答基于知识库内最新版指南，若您有更权威的出处，欢迎反馈，我们会复核更新。', media: [], tag: '虚假信息', cls: 'tag-amber', user: '微信用户·Mia', member: false, kp: '机构 Agent', time: '2026-06-01 08:50' },
  { id: 'FB2029', q: '失眠有什么非药物的办法？', answer: '可尝试固定作息、睡前减少屏幕使用、限制咖啡因与午睡时长，并通过放松训练改善。若长期失眠建议就医评估。', media: [{ kind: 'video', name: '放松训练演示.mp4' }], tag: '没有帮助', cls: 'tag-line', user: '微信用户·夜航', member: true, kp: '李医生 · 心理', time: '2026-05-31 23:05' },
  { id: 'FB2028', q: '这个建议适合孕妇吗？', answer: '部分内容不适用于孕期人群。涉及用药与检查时，孕妇应特别谨慎并咨询产科医师，已为该回答补充孕期提示。', media: [], tag: '有害 / 不安全', cls: 'tag-amber', user: '微信用户·小鹿', member: true, kp: '王老师 · 妇产科', time: '2026-05-31 13:48' },
];

export function Feedback() {
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('全部');
  const [detail, setDetail] = useState<FB | null>(null);

  const rows = DATA.filter((r) => (!q || r.q.includes(q) || r.user.includes(q)) && (tag === '全部' || r.tag === tag));

  // 导出：仅问答文本（不含媒体 / 溯源）
  const exportText = () => {
    const lines = rows.map((r) => `【${r.time}】${nickOf(r.user)}${r.member ? '（会员）' : ''} · ${r.tag}\nQ：${r.q}\nA：${r.answer}\n`);
    const blob = new Blob(['答案反馈导出（仅问答文本，不含媒体 / 溯源）\n\n' + lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '答案反馈_问答文本.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast('已导出问答文本（不含媒体 / 溯源）');
  };

  const columns: Col<FB>[] = [
    { header: '问题', cell: (r) => <span className="fb-q">{r.q}</span> },
    { header: '反馈标签', sortValue: (r) => r.tag, cell: (r) => <span className={'tag-s ' + r.cls}>{r.tag}</span> },
    {
      header: '反馈人',
      sortValue: (r) => nickOf(r.user),
      cell: (r) => (
        <span>
          {nickOf(r.user)}
          {r.member && <span className="tag-s tag-amber" style={{ marginLeft: 6 }}>会员</span>}
        </span>
      ),
    },
    { header: '提交时间', className: 'mono', cell: (r) => r.time, sortValue: (r) => r.time },
    { header: '操作', cell: (r) => <span className="op" onClick={() => setDetail(r)}>详情</span> },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">答案反馈</div>
          <div className="ps">前台答案点踩 / 反馈记录，供运营定位问题、迭代知识库</div>
        </div>
        <div className="pa">
          <button className="btn btn-ghost btn-sm" onClick={exportText}>
            <Icon id="i-dl" w={14} h={14} />
            导出问答文本
          </button>
        </div>
      </div>
      <div className="orders-filter">
        <Search placeholder="搜索问题 / 反馈人" minWidth={220} value={q} onChange={setQ} />
        <Dropdown label="反馈标签" options={TAGS} onSelect={setTag} />
        <RangePicker label="提交时间" />
      </div>
      <DataGrid columns={columns} rows={rows} empty={{ title: '没有匹配的反馈' }} minWidth={1040} pageUnit="条" />

      {/* 详情：问题 + AI 答案（含相关媒体资源）——与平台后台共用同一组件 */}
      <FeedbackDetailModal
        detail={detail && { ...detail, user: nickOf(detail.user) }}
        onClose={() => setDetail(null)}
      />
    </>
  );
}
