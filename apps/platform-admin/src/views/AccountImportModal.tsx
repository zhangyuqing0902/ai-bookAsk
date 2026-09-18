import { useRef, useState } from 'react';
import { Icon, toast } from '@aba/ui';
import { Modal, exportWorkbook } from '@aba/ui-admin';
import { ACCOUNT_IMPORT_LIMIT, planAccountImport, type AccountImportPlan, type AccountImportRow } from '@aba/mock';
import {
  ACCOUNT_IMPORT_ORGS,
  ACCOUNT_IMPORT_ROLES,
  ACCOUNT_IMPORT_TEMPLATE_NAME,
  ACCOUNT_IMPORT_TIPS,
  buildAccountImportTemplate,
  buildImportErrorSpec,
  buildImportResultSpec,
  parseAccountImportFile,
  type ImportResultRow,
} from '../exports/accountImport';

// 0918：平台后台 · 机构账户批量导入弹窗。
// 四步收在一个弹窗里：选文件（附模板下载）→ 解析校验预览（新建 / 更新 / 错误三数）→ 确认导入 → 结果（可下载含密码的导入结果）。
// 错误行跳过、其余照常导入；超 500 条整份拒绝，引导拆分。
type Stage =
  | { k: 'pick' }
  | { k: 'parsing'; file: string }
  | { k: 'fail'; file: string; msg: string }
  | { k: 'preview'; file: string; plan: AccountImportPlan }
  | { k: 'done'; created: number; updated: number; skipped: number; result: ImportResultRow[] };

export function AccountImportModal({
  open,
  existingAccounts,
  onClose,
  onApply,
}: {
  open: boolean;
  existingAccounts: string[];
  onClose: () => void;
  /** 落库：返回导入结果行（新建账户的系统生成密码在此回填） */
  onApply: (creates: AccountImportRow[], updates: AccountImportRow[]) => ImportResultRow[];
}) {
  const [stage, setStage] = useState<Stage>({ k: 'pick' });
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = () => { setStage({ k: 'pick' }); onClose(); };

  const downloadTemplate = async () => {
    const wb = await buildAccountImportTemplate();
    const buf = await wb.xlsx.writeBuffer();
    const url = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = ACCOUNT_IMPORT_TEMPLATE_NAME;
    a.click();
    URL.revokeObjectURL(url);
    toast('已下载导入模板');
  };

  const handleFile = async (f?: File | null) => {
    if (!f) return;
    if (!/\.xlsx$/i.test(f.name)) {
      setStage({ k: 'fail', file: f.name, msg: '仅支持 .xlsx 格式，请下载导入模板填写后上传' });
      return;
    }
    setStage({ k: 'parsing', file: f.name });
    const parsed = await parseAccountImportFile(await f.arrayBuffer());
    if (!parsed.ok) return setStage({ k: 'fail', file: f.name, msg: parsed.error });
    const plan = planAccountImport(parsed.rows, existingAccounts, { orgs: ACCOUNT_IMPORT_ORGS, roles: ACCOUNT_IMPORT_ROLES });
    if (plan.overLimit) {
      return setStage({ k: 'fail', file: f.name, msg: `文件共 ${plan.total} 条，超过单次上限 ${ACCOUNT_IMPORT_LIMIT} 条。请拆分为多个文件后分批导入。` });
    }
    setStage({ k: 'preview', file: f.name, plan });
  };

  const confirm = () => {
    if (stage.k !== 'preview') return;
    const { plan } = stage;
    const result = onApply(plan.creates, plan.updates);
    setStage({ k: 'done', created: plan.creates.length, updated: plan.updates.length, skipped: plan.errors.length, result });
  };

  const valid = stage.k === 'preview' ? stage.plan.creates.length + stage.plan.updates.length : 0;
  const reupload = <button className="btn btn-ghost btn-sm" onClick={() => setStage({ k: 'pick' })}>重新上传</button>;

  let footer;
  if (stage.k === 'preview') {
    footer = (
      <>
        {reupload}
        <button className={'btn btn-primary btn-sm' + (valid ? '' : ' off')} disabled={!valid} onClick={confirm}>
          {stage.plan.errors.length && valid ? `跳过错误行，导入 ${valid} 条` : `确认导入 ${valid} 条`}
        </button>
      </>
    );
  } else if (stage.k === 'done') {
    footer = (
      <>
        <button className="btn btn-ghost btn-sm" onClick={() => { void exportWorkbook(buildImportResultSpec(stage.result)); toast('正在下载导入结果'); }}>
          <Icon id="i-dl" w={14} h={14} />
          下载导入结果
        </button>
        <button className="btn btn-primary btn-sm" onClick={close}>完成</button>
      </>
    );
  } else if (stage.k === 'fail') {
    footer = <>{reupload}</>;
  } else {
    footer = <button className="btn btn-ghost btn-sm" onClick={close}>取消</button>;
  }

  return (
    <Modal title="批量导入机构账户" open={open} onClose={close} width={560} footer={footer}>
      {stage.k === 'pick' && (
        <>
          <div className="imp-step">
            <span className="imp-no">1</span>
            <span className="imp-step-t">下载模板并填写</span>
            <span className="op" onClick={() => void downloadTemplate()}>
              <Icon id="i-dl" w={13} h={13} /> 下载导入模板
            </span>
          </div>
          <div className="imp-step">
            <span className="imp-no">2</span>
            <span className="imp-step-t">上传填好的文件</span>
            <span className="muted" style={{ fontSize: 12 }}>「导出」的文件也可直接修改后上传</span>
          </div>
          <input ref={inputRef} type="file" accept=".xlsx" style={{ display: 'none' }} onChange={(e) => { void handleFile(e.target.files?.[0]); e.target.value = ''; }} />
          <div
            className={'up-drop' + (drag ? ' on' : '')}
            style={{ padding: '22px 18px' }}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); void handleFile(e.dataTransfer.files?.[0]); }}
          >
            <Icon id="i-up" w={26} h={26} />
            <div className="up-drop-t">点击选择 或 拖拽文件到此处</div>
            <div className="up-drop-s">仅支持 .xlsx，单次最多 {ACCOUNT_IMPORT_LIMIT} 条</div>
          </div>
          <div className="sub-tip">
            <ul>{ACCOUNT_IMPORT_TIPS.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
        </>
      )}

      {stage.k === 'parsing' && <div className="imp-center">正在解析「{stage.file}」…</div>}

      {stage.k === 'fail' && (
        <div className="imp-fail">
          <div className="imp-fail-t">无法导入「{stage.file}」</div>
          <div>{stage.msg}</div>
        </div>
      )}

      {stage.k === 'preview' && (
        <>
          <div className="imp-file">已解析「{stage.file}」，共 {stage.plan.total} 条</div>
          <div className="imp-sum">
            <div className="imp-card"><b>{stage.plan.creates.length}</b><span>将新建</span></div>
            <div className="imp-card"><b>{stage.plan.updates.length}</b><span>将更新</span></div>
            <div className={'imp-card' + (stage.plan.errors.length ? ' bad' : '')}><b>{stage.plan.errors.length}</b><span>有错误 · 将跳过</span></div>
          </div>
          {stage.plan.errors.length > 0 && (
            <>
              <div className="imp-err-h">
                <span>错误明细</span>
                <span className="op" onClick={() => { void exportWorkbook(buildImportErrorSpec(stage.plan.errors)); toast('正在下载错误明细'); }}>
                  下载错误明细
                </span>
              </div>
              <div className="imp-err-list">
                {stage.plan.errors.slice(0, 50).map((e) => (
                  <div className="imp-err" key={e.line}>
                    <span className="mono ln">第 {e.line} 行</span>
                    <span className="ac">{e.account}</span>
                    <span className="rs">{e.reasons.join('；')}</span>
                  </div>
                ))}
                {stage.plan.errors.length > 50 && <div className="imp-err muted">仅展示前 50 条，完整明细请下载</div>}
              </div>
            </>
          )}
          {stage.plan.updates.length > 0 && <div className="imp-note">更新时留空的单元格不修改；填写了密码的已存在账户将被重置为新密码。</div>}
        </>
      )}

      {stage.k === 'done' && (
        <div className="imp-done">
          <Icon id="i-check" w={28} h={28} />
          <div className="imp-done-t">导入完成</div>
          <div>新建 {stage.created} 个 · 更新 {stage.updated} 个{stage.skipped ? ` · 跳过错误 ${stage.skipped} 条` : ''}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>系统生成的初始密码见「下载导入结果」（含明文密码，请妥善保管）</div>
        </div>
      )}
    </Modal>
  );
}
