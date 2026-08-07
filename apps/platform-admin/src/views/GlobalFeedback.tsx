import { useState } from 'react';
import { Icon, toast } from '@aba/ui';
import { Search, Dropdown, RangePicker, DataGrid, FeedbackDetailModal, exportWorkbook, type Col } from '@aba/ui-admin';
import { orgOptionLabel, orgOptionValue, type MemberState } from '@aba/mock';
import { FB_TAGS, GLOBAL_FEEDBACK, nickOf, type FB } from '../data/feedback';
import { buildGlobalFeedbackSpec } from '../exports/globalFeedback';

// 0806：反馈人会员标四态（短文案；未开通不挂标，与机构后台答案反馈同规则）
const FB_MEMBER: Partial<Record<MemberState, { label: string; tag: string }>> = {
  active: { label: '有效会员', tag: 'tag-jade' },
  grace: { label: '宽限期', tag: 'tag-amber' },
  expired: { label: '已过期', tag: 'tag-terra' },
};

// 平台超管 · 全域答案反馈（0614b 新增）：跨机构汇总全平台答案反馈，复用机构后台答案反馈工作台；
// 列表 + 详情多一列「机构」，顶部支持机构筛选。
// 0714：mock 数据下移 ../data/feedback；导出迁移到 exports/globalFeedback.ts spec，按钮文案改「导出」；
//       「归属机构」统一为「机构」。
export function GlobalFeedback() {
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('全部');
  const [org, setOrg] = useState('全部');
  const [detail, setDetail] = useState<FB | null>(null);
  const orgNames = [...new Set(GLOBAL_FEEDBACK.map((d) => d.org))];

  const rows = GLOBAL_FEEDBACK.filter(
    (r) => (!q || r.q.includes(q) || nickOf(r.user).includes(q)) && (tag === '全部' || r.tag === tag) && (org === '全部' || r.org === org),
  );

  const doExport = () => {
    void exportWorkbook(buildGlobalFeedbackSpec({
      rows,
      filters: [['关键词', q || '无'], ['机构', org], ['反馈标签', tag]],
    }));
    toast('正在导出');
  };

  const columns: Col<FB>[] = [
    { header: '问题', cell: (r) => <span className="fb-q">{r.q}</span> },
    { header: '机构', cell: (r) => r.org, sortValue: (r) => r.org },
    { header: '反馈标签', sortValue: (r) => r.tag, cell: (r) => <span className={'tag-s ' + r.cls}>{r.tag}</span> },
    {
      header: '反馈人',
      sortValue: (r) => nickOf(r.user),
      cell: (r) => (
        <span>
          {nickOf(r.user)}
          {FB_MEMBER[r.memberState] && <span className={'tag-s ' + FB_MEMBER[r.memberState]!.tag} style={{ marginLeft: 6 }}>{FB_MEMBER[r.memberState]!.label}</span>}
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
      </div>
      {/* 0714：导出按钮从页头下移到筛选行右侧（对齐全域用户 / 全域订单形态） */}
      <div className="orders-filter">
        <Search placeholder="搜索问题 / 反馈人" minWidth={220} value={q} onChange={setQ} />
        <Dropdown label="机构" options={['全部', ...orgNames.map(orgOptionLabel)]} onSelect={(v) => setOrg(orgOptionValue(v))} style={{ width: 190 }} />
        <Dropdown label="反馈标签" options={FB_TAGS} onSelect={setTag} />
        <RangePicker label="提交时间" />
        <div className="grow" />
        <button className="btn btn-ghost btn-sm" onClick={doExport}>
          <Icon id="i-dl" w={14} h={14} />
          导出
        </button>
      </div>
      <DataGrid columns={columns} rows={rows} empty={{ title: '没有匹配的反馈' }} minWidth={1040} pageUnit="条" />

      {/* 详情：与机构后台共用同一组件，平台视角多传 org（机构） */}
      <FeedbackDetailModal
        detail={detail && { ...detail, user: nickOf(detail.user) , memberLabel: FB_MEMBER[detail.memberState]?.label, memberTag: FB_MEMBER[detail.memberState]?.tag }}
        onClose={() => setDetail(null)}
      />
    </>
  );
}
