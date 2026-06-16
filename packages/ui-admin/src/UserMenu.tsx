import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@aba/ui';

// 顶栏右侧：机构 chip + 头像 + ▾ 下拉。
// 0615：下拉原「姓名 · 角色」只读项改为「个人中心」入口（点击进落地页），保留「退出登录」；头像支持上传后回显（avatarImg）。
export function UserMenu({
  org,
  avatar,
  avatarImg,
  profilePath = '/profile',
}: {
  org: string;
  avatar: string; // 头像首字兜底
  avatarImg?: string; // 上传后的头像图（dataURL），优先于首字
  profilePath?: string;
}) {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const avStyle = avatarImg
    ? { backgroundImage: `url(${avatarImg})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' }
    : undefined;
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
      <span className="chip">{org}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => setOpen((o) => !o)}>
        <div className="admin-avatar" style={avStyle}>
          {!avatarImg && avatar}
        </div>
        <Icon id="i-chevD" w={14} h={14} style={{ color: 'var(--ink-3)' }} />
      </div>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 70 }} onClick={() => setOpen(false)} />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 12px)',
              right: 0,
              zIndex: 80,
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 12,
              boxShadow: 'var(--sh-md)',
              minWidth: 172,
              padding: 6,
            }}
          >
            <div
              className="menu-row"
              onClick={() => {
                setOpen(false);
                nav(profilePath);
              }}
            >
              <Icon id="i-user" w={16} h={16} />
              个人中心
            </div>
            <div style={{ height: 1, background: 'var(--line-2)', margin: '2px 0' }} />
            <div
              className="logout-row"
              onClick={() => {
                setOpen(false);
                nav('/login');
              }}
            >
              <Icon id="i-logout" w={16} h={16} />
              退出登录
            </div>
          </div>
        </>
      )}
    </div>
  );
}
