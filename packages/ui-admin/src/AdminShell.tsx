import { type ReactNode, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Icon, BRAND_LOGO } from '@aba/ui';

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
            {/* 0807：品牌位 = 纯图标 logo +「平台后台/机构后台」纯文字（0806-4 横版图文 logo 已撤）；折叠态只留图标 */}
            <img className="side-logo-icon" src={BRAND_LOGO} alt="AI 问书" />
            <div className="side-brandtext">
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
                    className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
                  >
                    <Icon id={it.icon} />
                    <span className="nav-label">{it.label}</span>
                    <span className="nav-tip">{it.label}</span>
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
