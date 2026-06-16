import { useRef, useState } from 'react';
import { Icon, toast } from '@aba/ui';
import { Modal } from './Modal';
import { InfoDot } from './InfoDot';
import { TextInput } from './Fields';
import { PASSWORD_RULE } from './password';

// 个人中心落地页（机构后台 / 平台超管共用）。0615 新增。
// 账户信息平台统一管理、只读；仅头像可上传更新（相册选图 + 圆形裁剪，canvas 真裁剪输出小图）。
export interface AccountInfo {
  account: string; // 账户名称（登录账号）
  name: string; // 姓名
  orgName?: string; // 所属机构（平台超管无）
  parentOrgName?: string; // 上级机构（仅当所属机构有上级时传）
  roleName: string; // 角色
  phone?: string; // 联系方式 · 手机
  email?: string; // 联系方式 · 邮箱
  status: 'active' | 'disabled'; // 账户状态
  initial: string; // 头像首字兜底
}

export function AccountCenter({
  account,
  avatarImg,
  onAvatarChange,
  showHint = true,
}: {
  account: AccountInfo;
  avatarImg?: string;
  onAvatarChange: (dataUrl: string) => void;
  showHint?: boolean; // 0615-2：平台超管个人中心不展示「请联系平台管理员」灰字
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef({ on: false, sx: 0, sy: 0, ox: 0, oy: 0 });

  // 0615-3：修改登录密码（旧密码 1 次 + 新密码 2 次；忘记旧密码联系平台管理员）
  const [pwdModal, setPwdModal] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [newPwd2, setNewPwd2] = useState('');
  const openPwd = () => {
    setOldPwd('');
    setNewPwd('');
    setNewPwd2('');
    setPwdModal(true);
  };
  const submitPwd = () => {
    if (!oldPwd) return toast('请输入旧密码');
    if (newPwd.length < 8 || newPwd.length > 16 || !/[a-zA-Z]/.test(newPwd) || !/\d/.test(newPwd)) return toast('新密码不符合规则');
    if (newPwd !== newPwd2) return toast('两次新密码不一致');
    setPwdModal(false);
    toast('登录密码已修改');
  };

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      setCropSrc(r.result as string);
      setScale(1);
      setPos({ x: 0, y: 0 });
    };
    r.readAsDataURL(f);
    e.target.value = '';
  };
  const onDown = (e: React.PointerEvent) => {
    drag.current = { on: true, sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current.on) return;
    setPos({ x: drag.current.ox + (e.clientX - drag.current.sx), y: drag.current.oy + (e.clientY - drag.current.sy) });
  };
  const onUp = () => (drag.current.on = false);

  // 确定 = 把裁剪圈内画面渲染到 256px 方图（canvas），而非存原图——避免 base64 原图撑爆 localStorage。
  // 数学与前台个人资料一致：DISP=300（.acrop-stage img 宽）/ RING=260（裁剪圈）/ OUT=256（输出）。
  const confirmCrop = () => {
    if (!cropSrc) return;
    const src = cropSrc;
    const finish = (dataUrl: string) => {
      onAvatarChange(dataUrl);
      setCropSrc(null);
      toast('头像已更新');
    };
    const img = new Image();
    img.onload = () => {
      const DISP = 300;
      const RING = 260;
      const OUT = 256;
      const nW = img.naturalWidth || DISP;
      const nH = img.naturalHeight || DISP;
      const dispScale = DISP / nW;
      const dH = nH * dispScale;
      const srcSize = RING / scale / dispScale;
      const srcX = (DISP / 2 + (-RING / 2 - pos.x) / scale) / dispScale;
      const srcY = (dH / 2 + (-RING / 2 - pos.y) / scale) / dispScale;
      const cv = document.createElement('canvas');
      cv.width = OUT;
      cv.height = OUT;
      const ctx = cv.getContext('2d');
      if (!ctx) return finish(src);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, OUT, OUT);
      ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, OUT, OUT);
      finish(cv.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = () => finish(src);
    img.src = src;
  };

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: '账户名称', value: account.account },
    { label: '姓名', value: account.name },
    ...(account.orgName ? [{ label: '所属机构', value: account.orgName }] : []),
    ...(account.parentOrgName ? [{ label: '上级机构', value: account.parentOrgName }] : []),
    { label: '角色', value: account.roleName },
    ...(account.phone ? [{ label: '手机号', value: account.phone }] : []),
    ...(account.email ? [{ label: '邮箱', value: account.email }] : []),
    {
      label: '账户状态',
      value: (
        <span className={'pc-status ' + (account.status === 'active' ? 'on' : 'off')}>
          {account.status === 'active' ? '启用' : '已禁用'}
        </span>
      ),
    },
  ];

  const avStyle = avatarImg
    ? { backgroundImage: `url(${avatarImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : undefined;

  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">个人中心</div>
        </div>
      </div>

      <div className="pc-card">
        <div className="pc-head">
          <div className="pc-avatar" style={avStyle}>
            {!avatarImg && account.initial}
          </div>
          <div className="pc-head-main">
            <div className="pc-name">{account.name}</div>
            <div className="pc-role">{account.roleName}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>
            <Icon id="i-camera" w={14} h={14} />
            更换头像
          </button>
        </div>

        <div className="pc-fields">
          {rows.map((r) => (
            <div className="pc-row" key={r.label}>
              <span className="pc-label">{r.label}</span>
              <span className="pc-value">{r.value}</span>
            </div>
          ))}
          {/* 0615-3：安全 —— 修改登录密码 */}
          <div className="pc-row">
            <span className="pc-label">登录密码</span>
            <span className="pc-value">
              <button className="btn btn-ghost btn-sm" onClick={openPwd}>
                <Icon id="i-lock" w={14} h={14} />
                修改登录密码
              </button>
            </span>
          </div>
        </div>

        {showHint && (
          <div className="pc-hint">
            <Icon id="i-lock2" w={13} h={13} />
            账户信息由平台统一管理，仅头像可自助更新；若需更改其他账户信息，请联系平台管理员。
          </div>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickFile} />

      {/* 0615-3：修改登录密码弹窗（旧密码 1 次 + 新密码 2 次） */}
      <Modal
        title="修改登录密码"
        open={pwdModal}
        onClose={() => setPwdModal(false)}
        width={420}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setPwdModal(false)}>取消</button>
            <button className="btn btn-primary" onClick={submitPwd}>确认修改</button>
          </>
        }
      >
        <div className="fm-row" style={{ borderTop: 'none' }}>
          <div className="lab">
            旧密码
            <InfoDot text="若忘记旧密码，请联系平台管理员重置处理。" />
          </div>
          <div className="ctl"><TextInput type="password" value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} placeholder="请输入旧密码" style={{ maxWidth: 220 }} /></div>
        </div>
        <div className="fm-row">
          <div className="lab">新密码</div>
          <div className="ctl"><TextInput type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="请输入新密码" style={{ maxWidth: 220 }} /></div>
        </div>
        <div className="fm-row">
          <div className="lab">确认新密码</div>
          <div className="ctl"><TextInput type="password" value={newPwd2} onChange={(e) => setNewPwd2(e.target.value)} placeholder="再次输入新密码" style={{ maxWidth: 220 }} /></div>
        </div>
        <div className="sub-tip">密码规则：{PASSWORD_RULE}。</div>
      </Modal>

      {/* 头像圆形裁剪 overlay（居中弹层 + 缩放滑块 + 拖拽，canvas 真裁剪） */}
      {cropSrc && (
        <div className="acrop-ov" onClick={() => setCropSrc(null)}>
          <div className="acrop-panel" onClick={(e) => e.stopPropagation()}>
            <div className="acrop-h">调整头像</div>
            <div
              className="acrop-stage"
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerLeave={onUp}
            >
              <img
                src={cropSrc}
                alt=""
                draggable={false}
                style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})` }}
              />
              <div className="acrop-mask" />
            </div>
            <div className="acrop-zoom">
              <Icon id="i-search" w={14} h={14} />
              <input type="range" min={1} max={3} step={0.01} value={scale} onChange={(e) => setScale(+e.target.value)} />
            </div>
            <div className="acrop-tip">拖动图片调整位置，拖动滑块缩放</div>
            <div className="acrop-btns">
              <button className="btn btn-ghost" onClick={() => setCropSrc(null)}>
                取消
              </button>
              <button className="btn btn-primary" onClick={confirmCrop}>
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
