import { useNavigate, useParams } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { DataGrid, type Col } from '@aba/ui-admin';
import { BATCHES, batchCodes, type Code } from '../data/codes';

// 机构后台 · 兑换码批次详情
export function CodeBatchDetail() {
  const nav = useNavigate();
  const { id } = useParams();
  const batch = BATCHES.find((b) => b.id === id);
  const rows = batch ? batchCodes(batch) : [];

  const m = (v: string) => (v === '—' ? <span className="muted">—</span> : <span className="mono">{v}</span>);
  const columns: Col<Code>[] = [
    { header: '兑换码', className: 'mono strong', cell: (c) => c.code },
    { header: '权益', cell: () => '会员 · ' + (batch?.duration || '') },
    { header: '状态', cell: (c) => <span className={'tag-s ' + c.statusCls}>{c.status}</span> },
    { header: '兑换时间', cell: (c) => m(c.redeemAt), sortValue: (c) => c.redeemAt },
    { header: '兑换用户', cell: (c) => (c.user === '—' ? <span className="muted">—</span> : c.user) },
    { header: '手机号', cell: (c) => m(c.phone) },
    { header: '权益到期', cell: (c) => m(c.expire), sortValue: (c) => c.expire },
  ];

  return (
    <>
      <div className="kpd-head">
        <span className="kpd-back" onClick={() => nav(-1)}>
          <Icon id="i-chevL" />
          返回
        </span>
        <span className="kpd-name">{batch ? batch.name : '批次详情'}</span>
        {batch && <span className="tag-s tag-indigo">{batch.redeemed} / {batch.total} 已兑换</span>}
      </div>
      <div className="page-head" style={{ marginTop: 14 }}>
        <div>
          <div className="ps">权益：会员 · {batch?.duration} · 批次创建 {batch?.createdAt}</div>
        </div>
        <div className="pa">
          <button className="btn btn-ghost btn-sm" onClick={() => toast('导出本批次 Excel')}>
            <Icon id="i-dl" w={14} h={14} />
            导出本批次
          </button>
        </div>
      </div>
      <DataGrid columns={columns} rows={rows} empty={{ title: '本批次暂无兑换码' }} minWidth={820} />
    </>
  );
}
