import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@aba/ui';

// 顶栏右侧：机构 chip + 头像 + 姓名▾ 下拉（退出登录 = 红字浅红底警示 → /login）。
export function UserMenu({ org, name, avatar }: { org: string; name: string; avatar: string }) {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
      <span className="chip">{org}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => setOpen((o) => !o)}>
        <div className="admin-avatar">{avatar}</div>
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
            <div style={{ padding: '9px 12px', fontSize: 13, color: 'var(--ink-2)' }}>{name}</div>
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
