import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { Search, Modal, TextInput, DataGrid, type Col } from '@aba/ui-admin';
import { BATCHES, type Batch } from '../data/codes';

// 机构后台 · 兑换码（按批次管理；点击进批次详情）
export function Codes() {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  const rows = BATCHES.filter((b) => !q || b.name.includes(q));
  const columns: Col<Batch>[] = [
    { header: '批次名称', className: 'strong', cell: (b) => b.name },
    { header: '已兑换 / 生成', className: 'mono', cell: (b) => `${b.redeemed} / ${b.total}`, sortValue: (b) => b.redeemed },
    { header: '权益有效期', cell: (b) => '会员 · ' + b.duration },
    { header: '批次创建时间', className: 'mono', cell: (b) => b.createdAt, sortValue: (b) => b.createdAt },
    { header: '操作', cell: (b) => <span className="op" onClick={() => nav('/codes/' + b.id)}>详情</span> },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">兑换码</div>
          <div className="ps">每次生成为一个批次,点击批次查看该批次全部兑换码</div>
        </div>
        <div className="pa">
          <button className="btn btn-ghost btn-sm" onClick={() => toast('导出 Excel')}>
            <Icon id="i-dl" w={14} h={14} />
            导出 Excel
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
            <Icon id="i-plus" w={14} h={14} />
            批量生成
          </button>
        </div>
      </div>
      <div className="filter">
        <Search placeholder="搜索批次名称" minWidth={220} value={q} onChange={setQ} />
      </div>
      <DataGrid columns={columns} rows={rows} empty={{ title: '还没有兑换码批次', sub: '点击「批量生成」创建第一个批次' }} />

      <Modal
        title="批量生成兑换码"
        open={open}
        onClose={() => setOpen(false)}
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>取消</button>
            <button className="btn btn-primary btn-sm" onClick={() => { setOpen(false); toast('已生成批次 · 500 个兑换码'); }}>生成</button>
          </>
        }
      >
        <div className="fm-row" style={{ borderTop: 'none', paddingTop: 4 }}>
          <div className="lab">批次名称<span className="req">*</span></div>
          <div className="ctl"><TextInput placeholder="如 2026 数博会活动" /></div>
        </div>
        <div className="fm-row">
          <div className="lab">权益类型</div>
          <div className="ctl"><span className="tag-s tag-amber">会员</span></div>
        </div>
        <div className="fm-row">
          <div className="lab">权益有效期</div>
          <div className="ctl" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TextInput defaultValue="3" style={{ maxWidth: 90 }} />
            <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>个月（1–12,兑换起算）</span>
          </div>
        </div>
        <div className="fm-row">
          <div className="lab">生成数量</div>
          <div className="ctl"><TextInput defaultValue="500" style={{ maxWidth: 120 }} /></div>
        </div>
      </Modal>
    </>
  );
}
