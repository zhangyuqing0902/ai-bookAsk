import { useRef, useState } from 'react';
import { Icon, toast } from '@aba/ui';
import { Modal, exportWorkbook } from '@aba/ui-admin';
import { ACCOUNT_IMPORT_LIMIT, planAccountImport, type AccountImportIssue, type AccountImportPlan, type AccountImportRow } from '@aba/mock';
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
// 0918-3：上传 → 预览（将新建 / 将更新 / 有误三数 + 有误明细）→ 确认导入 → 结果弹窗
//   （成功多少、哪些失败 + 原因，可下载失败明细与导入结果）。有误的行跳过、其余照常导入，不因单条错误整批失败。
//   整份级问题（非 xlsx / 缺表头 / 超 500 条）不进预览、直接提示，引导修正后重传。
type Stage =
  | { k: 'pick' }
  | { k: 'parsing'; file: string }
  | { k: 'fail'; file: string; msg: string }
  | { k: 'preview'; file: string; plan: AccountImportPlan }
  | { k: 'done'; file: string; total: number; created: number; updated: number; errors: AccountImportIssue[]; result: ImportResultRow[] };

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
      return setStage({ k: 'fail', file: f.name, msg: `文件共 ${plan.total} 条，超过单次上限 ${ACCOUNT_IMPORT_LIMIT} 条，本次未导入任何数据。请拆分为多个文件后分批导入。` });
    }
    setStage({ k: 'preview', file: f.name, plan });
  };

  const confirm = () => {
    if (stage.k !== 'preview') return;
    const { plan, file } = stage;
    const result = onApply(plan.creates, plan.updates);
    setStage({ k: 'done', file, total: plan.total, created: plan.creates.length, updated: plan.updates.length, errors: plan.errors, result });
  };

  const errorList = (errors: AccountImportIssue[], title: string) => (
    <>
      <div className="imp-err-h">
        <span>{title}</span>
        {/* 0918-3：下载入口做成按钮样式（原文字链看不出可点） */}
        <button className="btn btn-sm imp-dl" onClick={() => { void exportWorkbook(buildImportErrorSpec(errors)); toast(`正在下载${title}`); }}>
          <Icon id="i-dl" w={13} h={13} />
          下载{title}
        </button>
      </div>
      <div className="imp-err-list">
        {errors.slice(0, 50).map((e) => (
          <div className="imp-err" key={e.line}>
            <span className="mono ln">第 {e.line} 行</span>
            <span className="ac">{e.account}</span>
            <span className="rs">{e.reasons.join('；')}</span>
          </div>
        ))}
        {errors.length > 50 && <div className="imp-err muted">仅展示前 50 条，完整明细请下载</div>}
      </div>
    </>
  );

  const reupload = <button className="btn btn-ghost btn-sm" onClick={() => setStage({ k: 'pick' })}>重新上传</button>;

  const valid = stage.k === 'preview' ? stage.plan.creates.length + stage.plan.updates.length : 0;

  let footer;
  if (stage.k === 'preview') {
    footer = (
      <>
        {reupload}
        <button className={'btn btn-primary btn-sm' + (valid ? '' : ' off')} disabled={!valid} onClick={confirm}>
          确认导入 {valid} 条
        </button>
      </>
    );
  } else if (stage.k === 'done') {
    const ok = stage.created + stage.updated;
    footer = (
      <>
        {stage.errors.length > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={() => setStage({ k: 'pick' })}>修正后重新上传</button>
        )}
        {ok > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={() => { void exportWorkbook(buildImportResultSpec(stage.result)); toast('正在下载导入结果'); }}>
            <Icon id="i-dl" w={14} h={14} />
            下载导入结果
          </button>
        )}
        <button className="btn btn-primary btn-sm" onClick={close}>完成</button>
      </>
    );
  } else if (stage.k === 'fail') {
    footer = <>{reupload}</>;
  } else {
    footer = <button className="btn btn-ghost btn-sm" onClick={close}>取消</button>;
  }

  const doneTitle = (d: Extract<Stage, { k: 'done' }>) => {
    const ok = d.created + d.updated;
    if (!d.errors.length) return { t: '导入完成', cls: 'ok' };
    if (ok) return { t: '部分导入成功', cls: 'part' };
    return { t: '导入失败', cls: 'bad' };
  };

  return (
    <Modal title="批量导入机构账户" open={open} onClose={close} width={560} footer={footer}>
      {stage.k === 'pick' && (
        <>
          <div className="imp-step">
            <span className="imp-no">1</span>
            <span className="imp-step-t">下载模板并填写</span>
            <button className="btn btn-sm imp-dl" onClick={() => void downloadTemplate()}>
              <Icon id="i-dl" w={13} h={13} />
              下载导入模板
            </button>
          </div>
          <div className="imp-step">
            <span className="imp-no">2</span>
            <span className="imp-step-t">上传填好的文件，预览无误后导入</span>
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
          <div className="imp-res-h ok" style={{ marginBottom: 12 }}>
            <span className="t">导入预览</span>
            <span className="f">「{stage.file}」共 {stage.plan.total} 条</span>
          </div>
          <div className="imp-sum three">
            <div className="imp-card"><b>{stage.plan.creates.length}</b><span>将新建</span></div>
            <div className="imp-card"><b>{stage.plan.updates.length}</b><span>将更新</span></div>
            <div className={'imp-card' + (stage.plan.errors.length ? ' bad' : '')}><b>{stage.plan.errors.length}</b><span>有误 · 将跳过</span></div>
          </div>
          {stage.plan.errors.length > 0 && errorList(stage.plan.errors, '有误明细')}
          <div className="imp-note">
            {valid
              ? `确认后导入 ${valid} 条${stage.plan.errors.length ? `，有误的 ${stage.plan.errors.length} 条跳过，可修正后单独重传` : ''}；更新时留空的单元格不修改，填写了密码的已有账户将被重置为新密码。`
              : '没有可导入的数据，请修正后重新上传。'}
          </div>
        </>
      )}

      {stage.k === 'done' && (() => {
        const head = doneTitle(stage);
        return (
          <>
            <div className={'imp-res-h ' + head.cls}>
              <Icon id={head.cls === 'ok' ? 'i-check' : 'i-warn'} w={18} h={18} />
              <span className="t">{head.t}</span>
              <span className="f">「{stage.file}」共 {stage.total} 条</span>
            </div>
            <div className="imp-sum">
              <div className="imp-card"><b>{stage.created + stage.updated}</b><span>成功（新建 {stage.created} · 更新 {stage.updated}）</span></div>
              <div className={'imp-card' + (stage.errors.length ? ' bad' : '')}><b>{stage.errors.length}</b><span>失败 · 未导入</span></div>
            </div>
            {stage.errors.length > 0 && (
              <>
                {errorList(stage.errors, '失败明细')}
                <div className="imp-note">修正失败行后，可只把这些行重新上传（成功的行无需重复导入）。</div>
              </>
            )}
            {stage.created > 0 && <div className="imp-note">新建账户的密码（含系统生成的）见「下载导入结果」，含明文密码请妥善保管。</div>}
          </>
        );
      })()}
    </Modal>
  );
}
