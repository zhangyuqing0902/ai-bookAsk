import { useState } from 'react';
import { Icon, toast } from '@aba/ui';
import { Search, Dropdown, Modal, TextInput, DataGrid, type Col } from '@aba/ui-admin';
import { BATCHES, batchCodes, type Batch, type Code } from '../data/codes';

// 机构后台 · 兑换码（按批次管理；点击「详情」在当前页右侧抽屉展示该批次全部兑换码）
export function Codes() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  // 0610:兑换码详情改为当前页右侧抽屉(交互对齐二维码码包)
  const [view, setView] = useState<Batch | null>(null);
  const [cStatus, setCStatus] = useState('全部');
  const [cUser, setCUser] = useState('');
  const [cPhone, setCPhone] = useState('');
  const openDetail = (b: Batch) => { setCStatus('全部'); setCUser(''); setCPhone(''); setView(b); };

  const rows = BATCHES.filter((b) => !q || b.name.includes(q));
  const columns: Col<Batch>[] = [
    { header: '批次名称', className: 'strong', cell: (b) => b.name },
    { header: '已兑换 / 生成', className: 'mono', cell: (b) => `${b.redeemed} / ${b.total}`, sortValue: (b) => b.redeemed },
    { header: '权益有效期', cell: (b) => '会员 · ' + b.duration },
    { header: '批次创建时间', className: 'mono', cell: (b) => b.createdAt, sortValue: (b) => b.createdAt },
    { header: '操作', cell: (b) => <div className="op-cell"><span className="op" onClick={() => openDetail(b)}>详情</span></div> },
  ];

  // 0610:抽屉内兑换码明细 —— 状态单选 + 兑换用户/手机号模糊匹配;状态、权益列支持排序
  const m = (v: string) => (v === '—' ? <span className="muted">—</span> : <span className="mono">{v}</span>);
  const codeRows = view
    ? batchCodes(view).filter(
        (c) => (cStatus === '全部' || c.status === cStatus) && (!cUser || c.user.includes(cUser)) && (!cPhone || c.phone.includes(cPhone)),
      )
    : [];
  const codeCols: Col<Code>[] = [
    { header: '兑换码', className: 'mono strong', cell: (c) => c.code },
    { header: '权益', cell: () => '会员 · ' + (view?.duration || ''), sortValue: () => view?.duration || '' },
    { header: '状态', cell: (c) => <span className={'tag-s ' + c.statusCls}>{c.status}</span>, sortValue: (c) => c.status },
    { header: '兑换时间', cell: (c) => m(c.redeemAt), sortValue: (c) => c.redeemAt },
    { header: '兑换用户', cell: (c) => (c.user === '—' ? <span className="muted">—</span> : c.user) },
    { header: '手机号', cell: (c) => m(c.phone) },
    { header: '权益到期', cell: (c) => m(c.expire), sortValue: (c) => c.expire },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">兑换码</div>
          <div className="ps">每次生成为一个批次,点击批次查看该批次全部兑换码</div>
        </div>
        <div className="pa">
          {/* 10:去掉列表的导出 Excel 按钮(导出保留在批次详情内) */}
          <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
            <Icon id="i-plus" w={14} h={14} />
            批量生成
          </button>
        </div>
      </div>
      <div className="filter">
        <Search placeholder="搜索批次名称" minWidth={220} value={q} onChange={setQ} />
      </div>
      <DataGrid columns={columns} rows={rows} empty={{ title: '还没有兑换码批次', sub: '点击「批量生成」创建第一个批次' }} pageUnit="批" />

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

      {/* 0610:兑换码批次详情抽屉(右侧滑入,交互/布局对齐二维码码包) */}
      {view && (
        <>
          <div className="drawer-scrim" onClick={() => setView(null)} />
          <div className="drawer">
            <div className="drawer-h">
              <div>
                <div className="dh-t">{view.name}</div>
                <div className="dh-s">已兑换 {view.redeemed} / {view.total} · 权益 会员 · {view.duration} · 批次创建 {view.createdAt}</div>
              </div>
              <span className="drawer-x" onClick={() => setView(null)}>✕</span>
            </div>
            <div className="drawer-b">
              <div className="filter">
                {/* 0610:兑换用户 / 手机号模糊匹配 + 状态单选筛选 + 导出 */}
                <Search placeholder="搜索兑换用户" minWidth={180} value={cUser} onChange={setCUser} />
                <Search placeholder="搜索手机号" minWidth={180} value={cPhone} onChange={setCPhone} />
                <Dropdown label="状态" options={['全部', '已兑换', '未兑换']} onSelect={setCStatus} />
                <div className="grow" />
                <button className="btn btn-ghost btn-sm" onClick={() => toast('导出本批次 Excel')}>
                  <Icon id="i-dl" w={14} h={14} />
                  导出
                </button>
              </div>
              <DataGrid columns={codeCols} rows={codeRows} empty={{ title: '没有匹配的兑换码' }} minWidth={760} pageUnit="个" />
            </div>
          </div>
        </>
      )}
    </>
  );
}
