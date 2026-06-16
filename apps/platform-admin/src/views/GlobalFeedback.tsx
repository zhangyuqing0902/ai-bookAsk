import { useState } from 'react';
import { Icon, toast } from '@aba/ui';
import { Search, Dropdown, RangePicker, DataGrid, FeedbackDetailModal, type Col, type MediaItem } from '@aba/ui-admin';

// 平台超管 · 全域答案反馈（0614b 新增）：跨机构汇总全平台答案反馈，复用机构后台答案反馈工作台；
// 列表 + 详情多一列「归属机构」，顶部支持机构筛选。
interface FB {
  id: string;
  org: string;
  q: string;
  answer: string;
  media: MediaItem[];
  tag: string;
  cls: string;
  user: string;
  member: boolean;
  time: string;
}
const TAGS = ['全部', '没有帮助', '虚假信息', '有害 / 不安全', '其他'];
const nickOf = (u: string) => u.replace(/^微信用户·/, '');

const DATA: FB[] = [
  { id: 'FB3041', org: 'XX 出版社', q: '高血压能不能喝咖啡？', answer: '一般而言，高血压患者可适量饮用咖啡，每日不宜超过 1–2 杯，且避免空腹饮用。具体请结合个人血压控制情况并遵医嘱。', media: [{ kind: 'image', name: '咖啡因与血压关系示意图.png' }], tag: '没有帮助', cls: 'tag-line', user: '微信用户·阿橙', member: true, time: '2026-06-06 20:11' },
  { id: 'FB3040', org: 'XX 出版社', q: '这个剂量是不是写错了？', answer: '经核对，该药物成人常规剂量为每次 5mg、每日一次，知识库标注无误。请以药品说明书与医师处方为准。', media: [{ kind: 'image', name: '药品说明书剂量页.png' }, { kind: 'video', name: '用药演示.mp4' }], tag: '虚假信息', cls: 'tag-amber', user: '微信用户·林医森', member: true, time: '2026-06-06 15:42' },
  { id: 'FB3039', org: 'YY 教育', q: '这道题的解法太笼统了', answer: '抱歉未能讲清。该题可用因式分解法分三步求解，建议补充年级与教材版本，我可给出更贴合的步骤。', media: [], tag: '没有帮助', cls: 'tag-line', user: '微信用户·小满', member: false, time: '2026-06-05 11:23' },
  { id: 'FB3038', org: 'YY 教育', q: '这个知识点和课本不一致', answer: '不同版本教材表述可能有差异。本回答基于知识库最新教材，如有更权威出处欢迎反馈，我们会复核更新。', media: [{ kind: 'audio', name: '知识点讲解.mp3' }], tag: '虚假信息', cls: 'tag-amber', user: '微信用户·航仔', member: true, time: '2026-06-05 09:08' },
  { id: 'FB3037', org: 'ZZ 少儿', q: '推荐的绘本适合几岁？', answer: '该绘本适合 3–6 岁亲子共读。如需按年龄细分推荐，可告诉我孩子的具体月龄。', media: [{ kind: 'image', name: '绘本分龄表.png' }], tag: '其他', cls: 'tag-line', user: '微信用户·糖糖妈', member: false, time: '2026-06-04 17:50' },
  { id: 'FB3036', org: 'ZZ 少儿', q: '这个建议对孩子安全吗？', answer: '感谢提醒。涉及儿童用药 / 操作存在风险，正确做法是在监护与医师指导下进行，已对该回答做安全降级。', media: [], tag: '有害 / 不安全', cls: 'tag-amber', user: '微信用户·豆豆', member: true, time: '2026-06-04 10:15' },
  { id: 'FB3035', org: 'AA 文化集团', q: '答非所问', answer: '抱歉理解有偏差。请问您想了解的是作品背景还是赏析方法？补充后我会重新作答。', media: [], tag: '其他', cls: 'tag-line', user: '微信用户·Cici', member: false, time: '2026-06-03 19:40' },
  { id: 'FB3034', org: 'AA 文化集团', q: '这个数据来源可靠吗？', answer: '该结论引用自知识库权威章节并已标注来源，可在答案下方点击溯源卡片查看原文出处。', media: [{ kind: 'image', name: '来源页.png' }], tag: '虚假信息', cls: 'tag-amber', user: '微信用户·南风', member: true, time: '2026-06-03 14:02' },
  { id: 'FB3033', org: 'BB 数字出版', q: '回答里的图看不清', answer: '抱歉给您带来不便。可点击图片放大查看，若仍不清晰，我可提供文字版要点说明。', media: [{ kind: 'image', name: '结构图.png' }], tag: '没有帮助', cls: 'tag-line', user: '微信用户·阿树', member: true, time: '2026-06-02 21:18' },
  { id: 'FB3032', org: 'BB 数字出版', q: '这个说法有点危险', answer: '感谢反馈。涉及自行操作的内容存在风险，应在专业指导下进行，已对该回答补充安全提示。', media: [{ kind: 'audio', name: '安全提示.mp3' }], tag: '有害 / 不安全', cls: 'tag-amber', user: '微信用户·老周', member: false, time: '2026-06-02 09:33' },
  { id: 'FB3031', org: 'XX 出版社', q: '心电图这个波形代表什么？', answer: '该图为正常窦性心律波形，P-QRS-T 各波形态与间期均在正常范围。如有不适仍建议由医师判读。', media: [{ kind: 'image', name: '心电图示例.png' }], tag: '没有帮助', cls: 'tag-line', user: '微信用户·阿凯', member: true, time: '2026-06-01 16:27' },
  { id: 'FB3030', org: 'YY 教育', q: '这个结论和我查到的不一样', answer: '不同来源可能存在差异。本回答基于知识库内最新资料，若您有更权威出处，欢迎反馈，我们会复核更新。', media: [], tag: '虚假信息', cls: 'tag-amber', user: '微信用户·Mia', member: false, time: '2026-06-01 08:50' },
];

export function GlobalFeedback() {
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('全部');
  const [org, setOrg] = useState('全部');
  const [detail, setDetail] = useState<FB | null>(null);
  const orgNames = [...new Set(DATA.map((d) => d.org))];

  const rows = DATA.filter(
    (r) => (!q || r.q.includes(q) || nickOf(r.user).includes(q)) && (tag === '全部' || r.tag === tag) && (org === '全部' || r.org === org),
  );

  const exportText = () => {
    const lines = rows.map((r) => `【${r.time}】${r.org} · ${nickOf(r.user)}${r.member ? '（会员）' : ''} · ${r.tag}\nQ：${r.q}\nA：${r.answer}\n`);
    const blob = new Blob(['全域答案反馈导出（仅问答文本，不含媒体 / 溯源）\n\n' + lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '全域答案反馈_问答文本.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast('已导出问答文本（不含媒体 / 溯源）');
  };

  const columns: Col<FB>[] = [
    { header: '问题', cell: (r) => <span className="fb-q">{r.q}</span> },
    { header: '归属机构', cell: (r) => r.org, sortValue: (r) => r.org },
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
          <div className="pt">全域答案反馈</div>
          <div className="ps">全平台各机构 C 端答案点踩 / 反馈汇总，便于平台监管与质量分析</div>
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
        <Dropdown label="机构" options={['全部', ...orgNames]} onSelect={setOrg} style={{ width: 160 }} />
        <Dropdown label="反馈标签" options={TAGS} onSelect={setTag} />
        <RangePicker label="提交时间" />
      </div>
      <DataGrid columns={columns} rows={rows} empty={{ title: '没有匹配的反馈' }} minWidth={1040} pageUnit="条" />

      {/* 详情：与机构后台共用同一组件，平台视角多传 org（归属机构） */}
      <FeedbackDetailModal
        detail={detail && { ...detail, user: nickOf(detail.user) }}
        onClose={() => setDetail(null)}
      />
    </>
  );
}
