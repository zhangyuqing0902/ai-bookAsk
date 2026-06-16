import { toast } from '@aba/ui';
import { Modal } from './Modal';

// 0615-3：账户凭证弹窗（创建账户 / 重置密码后弹出，明文展示一次，方便发给使用人）。
// 机构账户 + 平台账户共用。
export interface Credential {
  account: string;
  password: string;
  name?: string;
  org?: string;
  role?: string;
}

export function CredentialDialog({
  open,
  title = '账户凭证',
  cred,
  onClose,
}: {
  open: boolean;
  title?: string;
  cred: Credential | null;
  onClose: () => void;
}) {
  if (!cred) return null;
  const rows: [string, string][] = [
    ['账号', cred.account],
    ['密码', cred.password],
    ['姓名', cred.name || '—'],
    ['机构', cred.org || '—'],
    ['角色', cred.role || '—'],
  ];
  const copy = () => {
    const text = rows.map(([k, v]) => `${k}：${v}`).join('\n');
    navigator.clipboard?.writeText(text);
    toast('已复制账户凭证');
  };
  return (
    <Modal
      title={title}
      open={open}
      onClose={onClose}
      width={420}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>关闭</button>
          <button className="btn btn-primary" onClick={copy}>一键复制</button>
        </>
      }
    >
      <div className="cred-tip">请妥善保存并发送给账户使用人，密码仅此一次明文展示。</div>
      <div className="cred-box">
        {rows.map(([k, v]) => (
          <div className="cred-row" key={k}>
            <span className="cred-k">{k}</span>
            <span className={'cred-v' + (k === '密码' ? ' mono cred-pwd' : '')}>{v}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}
