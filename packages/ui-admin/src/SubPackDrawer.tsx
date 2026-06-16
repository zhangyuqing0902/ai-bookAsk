import { useState } from 'react';
import { Icon, toast } from '@aba/ui';
import { Drawer } from './Drawer';
import { DataGrid, type Col } from './DataGrid';
import { TextInput } from './Fields';

// 0615-5：机构详情订阅记录 + 全域订阅订单 共用的「加油包」右抽屉。
// 用本地结构类型（不依赖 @aba/mock），与 OrderDetailView / KpDetailView 同样的解耦约定。
export interface SubPackLike {
  id: string;
  kp: string;
  storage: string;
  token: string;
  kpUsed?: string;
  storageUsed?: string;
  tokenUsed?: string;
  note?: string;
  status: string; // 生效 / 未生效
  createdAt: string;
  createdBy: string;
}
export interface SubParentLike {
  id: string;
  plan?: string;
  endDate: string;
}
export interface PackForm {
  kp: string;
  storage: string;
  token: string;
  note: string;
}

const ST_CLS: Record<string, string> = { 生效: 'ok', 未生效: 'none' };

// 0615-6：加油包额度——只显该加油包的额度（非零维度），不再显「已用 / 上限」
function packAmount(p: SubPackLike) {
  const parts: string[] = [];
  if (+p.kp) parts.push(`${p.kp} 个`);
  if (+p.storage) parts.push(`${p.storage} GB`);
  if (+p.token) parts.push(`${p.token} 亿`);
  return parts.join(' · ') || '—';
}

// 0615-6：加油包空态插画（贴合 AI 问书品牌：电光靛 + 朝霞橙 + 奶白；"加量包 + 加号"意象）
const PackEmptyIllust = (
  <svg width="98" height="76" viewBox="0 0 98 76" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="49" cy="68" rx="29" ry="4.5" fill="#4B57E8" opacity="0.07" />
    <rect x="27" y="24" width="44" height="38" rx="9" fill="#EEF0FB" stroke="#4B57E8" strokeWidth="2" />
    <path d="M27 35 H71" stroke="#4B57E8" strokeWidth="1.6" opacity="0.4" />
    <path d="M44 43 h10 M49 38 v10" stroke="#4B57E8" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
    <circle cx="66" cy="23" r="11" fill="#FF7A5C" />
    <path d="M66 18 v10 M61 23 h10" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M30 15 l1.3 2.7 2.7 1.3 -2.7 1.3 -1.3 2.7 -1.3 -2.7 -2.7 -1.3 2.7 -1.3z" fill="#4B57E8" opacity="0.5" />
  </svg>
);

export function SubPackDrawer({
  sub,
  packs,
  onClose,
  onAdd,
}: {
  /** 当前订阅（为 null 时抽屉关闭） */
  sub: SubParentLike | null;
  /** 该订阅名下的加油包 */
  packs: SubPackLike[];
  onClose: () => void;
  onAdd: (form: PackForm) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [pk, setPk] = useState({ kp: '0', storage: '0', token: '0' });
  const [note, setNote] = useState('');

  const reset = () => {
    setPk({ kp: '0', storage: '0', token: '0' });
    setNote('');
  };
  const close = () => {
    setAdding(false);
    reset();
    onClose();
  };
  const submit = () => {
    // 三项加量全为 0 → 不可创建
    if (!+pk.kp && !+pk.storage && !+pk.token) {
      toast('请至少为一项加量额度填写大于 0 的值');
      return;
    }
    onAdd({ ...pk, note: note.trim() });
    reset();
    setAdding(false);
    toast('已创建加油包（即时生效，额度累加）');
  };

  const cols: Col<SubPackLike>[] = [
    { header: '创建时间', className: 'mono', cell: (p) => p.createdAt, sortValue: (p) => p.createdAt },
    { header: '创建人', className: 'mono', cell: (p) => p.createdBy },
    { header: '加油包额度', className: 'mono', cell: (p) => packAmount(p) },
    { header: '备注', cell: (p) => (p.note ? p.note : <span className="muted">—</span>) },
    { header: '状态', sortValue: (p) => p.status, cell: (p) => <span className={'fstat ' + (ST_CLS[p.status] ?? 'none')}><span className="dt" />{p.status}</span> },
  ];

  return (
    <Drawer
      open={!!sub}
      onClose={close}
      width={760}
      title={
        sub ? (
          <span>
            加油包 · {sub.plan ?? '订阅'} <span className="dh-sub">（{sub.id}）</span>
          </span>
        ) : (
          '加油包'
        )
      }
    >
      {sub && (
        <>
          {/* 顶部：说明 + 新建按钮（#4：按钮放抽屉上方） */}
          <div className="pack-bar">
            <div className="pack-hint">
              加油包<b>即时生效、额度累加</b>，有效期跟随该订阅至 <b>{sub.endDate}</b> 止。
            </div>
            {!adding && (
              <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>
                <Icon id="i-plus" w={14} h={14} /> 新建加油包
              </button>
            )}
          </div>

          {/* 新建表单（#5：KP / 存储 / Token 同一行；三项全 0 不可创建） */}
          {adding && (
            <div className="pack-form">
              <div className="pf-row">
                <div className="pf-lab">加量额度</div>
                <div className="pf-fields">
                  <span className="pf-unit">
                    <TextInput value={pk.kp} onChange={(e) => setPk({ ...pk, kp: e.target.value })} style={{ width: 72 }} />
                    <i>个</i>
                  </span>
                  <span className="pf-unit">
                    <TextInput value={pk.storage} onChange={(e) => setPk({ ...pk, storage: e.target.value })} style={{ width: 72 }} />
                    <i>GB</i>
                  </span>
                  <span className="pf-unit">
                    <TextInput value={pk.token} onChange={(e) => setPk({ ...pk, token: e.target.value })} style={{ width: 72 }} />
                    <i>亿</i>
                  </span>
                </div>
              </div>
              <div className="pf-row">
                <div className="pf-lab">备注</div>
                <TextInput value={note} onChange={(e) => setNote(e.target.value)} placeholder="选填" style={{ flex: 1 }} />
              </div>
              <div className="pf-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => { setAdding(false); reset(); }}>取消</button>
                <button className="btn btn-primary btn-sm" onClick={submit}>确认创建</button>
              </div>
            </div>
          )}

          {/* 加油包列表（#5：列表展示，参考兑换码详情；空态走 DataGrid 标准空态） */}
          <DataGrid
            columns={cols}
            rows={packs}
            empty={{ illust: PackEmptyIllust, title: '暂无加油包', sub: '点击右上「新建加油包」为该订阅加量' }}
            minWidth={600}
            pageUnit="个"
          />
        </>
      )}
    </Drawer>
  );
}
