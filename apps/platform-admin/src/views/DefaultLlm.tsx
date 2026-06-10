import { useState } from 'react';
import { Icon, toast } from '@aba/ui';
import { AdminTable, Modal, ConfirmDialog, TextInput, Dropdown, Pager } from '@aba/ui-admin';

interface Model {
  name: string;
  vendor: string;
  ver: string;
  listed: boolean; // 已上架
  def: boolean; // 默认基模
}
const INIT: Model[] = [
  { name: 'Qwen 3.5 27B', vendor: '通义', ver: '3.5-27B', listed: true, def: true },
  { name: 'DeepSeek V3', vendor: 'DeepSeek', ver: 'V3', listed: false, def: false },
  { name: 'Qwen 2.5 72B', vendor: '通义', ver: '2.5-72B', listed: true, def: false },
];

type Confirm = { title: string; desc: string; danger?: boolean; confirmText?: string; onOk: () => void };

// 平台后台 · 默认 LLM 模型配置（未上架/已上架；仅已上架可设为默认基模）
export function DefaultLlm() {
  const [rows, setRows] = useState<Model[]>(INIT);
  const [modal, setModal] = useState<{ mode: 'new' | 'edit'; idx: number } | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [name, setName] = useState('');

  const setDefault = (i: number) => setRows((rs) => rs.map((m, j) => ({ ...m, def: j === i })));
  const toggleListed = (i: number) =>
    setRows((rs) => rs.map((m, j) => (j === i ? { ...m, listed: !m.listed, def: m.listed ? false : m.def } : m)));

  // 19:模型名称唯一校验
  const dupName = (val: string) => rows.some((m, j) => m.name === val.trim() && j !== (modal?.idx ?? -1));
  const saveModel = () => {
    const v = name.trim();
    if (!v) return toast('请填写模型名称');
    if (dupName(v)) return toast('模型名称已存在，请使用唯一名称');
    setModal(null);
    toast('已保存模型');
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">默认 LLM 模型配置</div>
          <div className="ps">仅「已上架」的模型可被设为所有机构底层的默认基模</div>
        </div>
        <div className="pa">
          <button className="btn btn-primary btn-sm" onClick={() => { setName(''); setModal({ mode: 'new', idx: -1 }); }}>
            <Icon id="i-plus" w={14} h={14} />
            新建模型
          </button>
        </div>
      </div>
      <AdminTable>
        <table className="tbl">
          <thead>
            <tr>
              <th>模型名称</th>
              <th>厂商</th>
              <th>版本号</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m, i) => (
              <tr key={m.name}>
                <td className="strong">
                  <Icon id="i-chip" w={15} h={15} style={{ verticalAlign: -3, color: 'var(--indigo-ink)' }} /> {m.name}
                </td>
                <td>{m.vendor}</td>
                <td className="mono">{m.ver}</td>
                <td>
                  {/* 18:默认标识放在上架状态「后面」 */}
                  <span className={'tag-s ' + (m.listed ? 'tag-jade' : 'tag-line')}>{m.listed ? '已上架' : '未上架'}</span>{' '}
                  {m.def && <span className="tag-s tag-indigo">默认</span>}
                </td>
                <td>
                  <div className="op-cell">
                    <span className="op" onClick={() => { setName(m.name); setModal({ mode: 'edit', idx: i }); }}>
                      编辑
                    </span>
                    {/* 18:上下架二次确认 */}
                    <span className="op" onClick={() => setConfirm({
                      title: m.listed ? '下架模型' : '上架模型',
                      desc: m.listed
                        ? `下架「${m.name}」后，机构将无法选用该模型；若其为默认基模会同时取消默认。`
                        : `上架「${m.name}」后，可将其设为默认基模供所有机构使用。`,
                      danger: m.listed,
                      confirmText: m.listed ? '确认下架' : '确认上架',
                      onOk: () => { toggleListed(i); toast(m.listed ? '已下架' : '已上架'); },
                    })}>
                      {m.listed ? '下架' : '上架'}
                    </span>
                    {/* 18:标记默认二次确认 */}
                    <span
                      className={'op' + (m.listed && !m.def ? '' : ' off')}
                      onClick={() => m.listed && !m.def && setConfirm({
                        title: '设为默认基模',
                        desc: `将「${m.name}」设为所有机构的默认基模？原默认模型将被替换，立即生效。`,
                        confirmText: '确认设为默认',
                        onOk: () => { setDefault(i); toast('已设为默认基模'); },
                      })}
                    >
                      设为默认
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTable>
      {rows.length > 10 && <Pager total={rows.length} unit="个" />}

      <Modal
        title={modal?.mode === 'edit' ? '编辑模型' : '新建模型'}
        open={!!modal}
        onClose={() => setModal(null)}
        width={460}
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setModal(null)}>
              取消
            </button>
            <button className="btn btn-primary btn-sm" onClick={saveModel}>
              保存
            </button>
          </>
        }
      >
        <div className="fm-row" style={{ borderTop: 'none', paddingTop: 4 }}>
          <div className="lab">模型名称<span className="req">*</span></div>
          <div className="ctl">
            <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="如 Qwen 3.5 27B" />
            {name.trim() !== '' && dupName(name) && (
              <div className="hint" style={{ color: 'var(--terra)' }}>该模型名称已存在，请使用全平台唯一的名称</div>
            )}
          </div>
        </div>
        <div className="fm-row">
          <div className="lab">厂商</div>
          <div className="ctl"><Dropdown label={modal?.mode === 'edit' ? rows[modal.idx]?.vendor : '选择厂商'} options={['通义', 'DeepSeek', '智谱', '百川']} style={{ width: 180 }} /></div>
        </div>
        <div className="fm-row">
          <div className="lab">版本号<span className="req">*</span></div>
          <div className="ctl"><TextInput defaultValue={modal?.mode === 'edit' ? rows[modal.idx]?.ver : ''} placeholder="如 3.5-27B" style={{ maxWidth: 240 }} /></div>
        </div>
        <div className="fm-row">
          <div className="lab">状态</div>
          {/* 18:编辑页状态仅展示文字标签,不用左右开关(避免误解可点) */}
          <div className="ctl">
            {modal?.mode === 'edit' ? (
              <span className={'tag-s ' + (rows[modal.idx]?.listed ? 'tag-jade' : 'tag-line')}>{rows[modal.idx]?.listed ? '已上架' : '未上架'}</span>
            ) : (
              <span className="tag-s tag-line">未上架</span>
            )}
            <span style={{ fontSize: 12, color: 'var(--ink-3)', marginLeft: 10 }}>上下架请在列表操作列进行</span>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirm !== null}
        title={confirm?.title ?? ''}
        desc={confirm?.desc}
        danger={confirm?.danger}
        confirmText={confirm?.confirmText}
        onConfirm={() => confirm?.onOk()}
        onClose={() => setConfirm(null)}
      />
    </>
  );
}
