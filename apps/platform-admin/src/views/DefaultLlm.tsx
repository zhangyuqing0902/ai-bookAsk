import { useState } from 'react';
import { Icon, toast } from '@aba/ui';
import { AdminTable, Modal, TextInput, Dropdown } from '@aba/ui-admin';

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

// 平台后台 · 默认 LLM 模型配置（未上架/已上架；仅已上架可设为默认基模）
export function DefaultLlm() {
  const [rows, setRows] = useState<Model[]>(INIT);
  const [modal, setModal] = useState<{ mode: 'new' | 'edit'; idx: number } | null>(null);

  const setDefault = (i: number) => {
    setRows((rs) => rs.map((m, j) => ({ ...m, def: j === i })));
    toast('已设为默认基模');
  };
  const toggleListed = (i: number) => {
    setRows((rs) => rs.map((m, j) => (j === i ? { ...m, listed: !m.listed, def: m.listed ? false : m.def } : m)));
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">默认 LLM 模型配置</div>
          <div className="ps">仅「已上架」的模型可被设为所有机构底层的默认基模</div>
        </div>
        <div className="pa">
          <button className="btn btn-primary btn-sm" onClick={() => setModal({ mode: 'new', idx: -1 })}>
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
                  {m.def && <span className="tag-s tag-indigo">默认</span>}{' '}
                  <span className={'tag-s ' + (m.listed ? 'tag-jade' : 'tag-line')}>{m.listed ? '已上架' : '未上架'}</span>
                </td>
                <td>
                  <span className="op" onClick={() => setModal({ mode: 'edit', idx: i })}>
                    编辑
                  </span>
                  <span className="op" onClick={() => toggleListed(i)}>
                    {m.listed ? '下架' : '上架'}
                  </span>
                  <span
                    className={'op' + (m.listed && !m.def ? '' : ' off')}
                    onClick={() => m.listed && !m.def && setDefault(i)}
                  >
                    设为默认
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTable>

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
            <button className="btn btn-primary btn-sm" onClick={() => { setModal(null); toast('已保存模型'); }}>
              保存
            </button>
          </>
        }
      >
        <div className="fm-row" style={{ borderTop: 'none', paddingTop: 4 }}>
          <div className="lab">模型名称<span className="req">*</span></div>
          <div className="ctl"><TextInput defaultValue={modal?.mode === 'edit' ? rows[modal.idx]?.name : ''} placeholder="如 Qwen 3.5 27B" /></div>
        </div>
        <div className="fm-row">
          <div className="lab">厂商</div>
          <div className="ctl"><Dropdown label={modal?.mode === 'edit' ? rows[modal.idx]?.vendor : '选择厂商'} options={['通义', 'DeepSeek', '智谱', '百川']} style={{ maxWidth: 240 }} /></div>
        </div>
        <div className="fm-row">
          <div className="lab">版本号<span className="req">*</span></div>
          <div className="ctl"><TextInput defaultValue={modal?.mode === 'edit' ? rows[modal.idx]?.ver : ''} placeholder="如 3.5-27B" style={{ maxWidth: 240 }} /></div>
        </div>
        <div className="fm-row">
          <div className="lab">状态</div>
          <div className="ctl">
            <div className="seg">
              <b className={modal?.mode === 'edit' && !rows[modal.idx]?.listed ? 'on' : undefined}>未上架</b>
              <b className={modal?.mode !== 'edit' || rows[modal.idx]?.listed ? 'on' : undefined}>已上架</b>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
