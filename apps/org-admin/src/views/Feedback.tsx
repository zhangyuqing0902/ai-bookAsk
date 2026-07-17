import { useState } from 'react';
import { Icon, toast } from '@aba/ui';
import { Search, Dropdown, RangePicker, DataGrid, FeedbackDetailModal, exportWorkbook, type Col } from '@aba/ui-admin';
import { FEEDBACKS, FB_TAGS, nickOf, type FB } from '../data/feedback';
import { buildFeedbackSpec } from '../exports/feedback';

// 机构后台 · 答案反馈工作台（0613-2：从数据看板独立成「数据中心」一级菜单）
// 列表（分页 + 按标签/时间/问题搜）→ 详情（问题 + AI 答案，含当时推送的图/音/视多模态知识）；
// 反馈人标注会员；导出仅含问答文本（不含媒体 / 溯源）。
// 0714：mock 数据下移 data/feedback.ts；导出走 spec 纯函数并移入筛选行右侧，文案统一「导出」。
export function Feedback() {
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('全部');
  const [timeLabel, setTimeLabel] = useState('近 7 天'); // 提交时间区间 label（导出筛选条件回显）
  const [detail, setDetail] = useState<FB | null>(null);

  const rows = FEEDBACKS.filter((r) => (!q || r.q.includes(q) || r.user.includes(q)) && (tag === '全部' || r.tag === tag));

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
      </div>
      <div className="orders-filter">
        <Search placeholder="搜索问题 / 反馈人" minWidth={220} value={q} onChange={setQ} />
        <Dropdown label="反馈标签" options={FB_TAGS} onSelect={setTag} />
        <RangePicker label="提交时间" onChange={(r) => setTimeLabel(r.label)} />
        <div className="grow" />
        {/* 0714：导出按钮从页头移到筛选行右侧（对齐订单 / 用户页），走 spec 纯函数 */}
        <button className="btn btn-ghost btn-sm" onClick={() => { void exportWorkbook(buildFeedbackSpec({ rows, q, tag, timeLabel })); toast('正在导出'); }}>
          <Icon id="i-dl" w={14} h={14} />
          导出
        </button>
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
