import { type ReactNode, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Icon } from '@aba/ui';

export interface NavItem {
  to: string;
  label: string;
  icon: string;
}
export interface NavGroup {
  group?: string;
  items: NavItem[];
}

// 整屏真实后台框：浅色渐变毛玻璃侧栏（可折叠）+ 75px 顶栏。
export function AdminShell({
  brandSub,
  nav,
  titleMap,
  topRight,
  children,
}: {
  brandSub: string;
  nav: NavGroup[];
  titleMap: Record<string, string>;
  topRight: ReactNode;
  children: ReactNode;
}) {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  let title = titleMap[pathname];
  if (!title) {
    const keys = Object.keys(titleMap)
      .filter((k) => k !== '/' && pathname.startsWith(k))
      .sort((a, b) => b.length - a.length);
    title = keys.length ? titleMap[keys[0]] : '';
  }

  return (
    <div className={'adm-win' + (collapsed ? ' side-collapsed' : '')}>
      <div className="admin">
        <aside className="side">
          <div className="side-brand">
            <div className="orb" style={{ width: 30, height: 30 }} />
            <div className="side-brandtext">
              <div className="wm">
                AI <span className="grad">问书</span>
              </div>
              <div className="side-org">{brandSub}</div>
            </div>
          </div>
          <nav className="side-nav">
            {nav.map((g, gi) => (
              <div key={gi} style={{ display: 'contents' }}>
                {g.group && <div className="nav-group">{g.group}</div>}
                {g.items.map((it) => (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    end={it.to === '/'}
                    title={it.label}
                    className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
                  >
                    <Icon id={it.icon} />
                    <span className="nav-label">{it.label}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        <div className="admin-main">
          <div className="admin-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="side-toggle tap" onClick={() => setCollapsed((c) => !c)} title={collapsed ? '展开菜单' : '收起菜单'}>
                <Icon id="i-menu" />
              </div>
              <div className="admin-crumb">
                <b>{title}</b>
              </div>
            </div>
            <div className="admin-user">{topRight}</div>
          </div>
          <div className="admin-body">{children}</div>
        </div>
      </div>
    </div>
  );
}
