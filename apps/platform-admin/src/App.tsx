import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { IconSprite, ToastHost } from '@aba/ui';
import { AdminShell, AdminLogin, UserMenu, type NavGroup } from '@aba/ui-admin';
import { Dashboard } from './views/Dashboard';
import { OrgList } from './views/OrgList';
import { OrgDetail } from './views/OrgDetail';
import { Accounts } from './views/Accounts';
import { GlobalUsers } from './views/GlobalUsers';
import { GlobalOrders } from './views/GlobalOrders';
import { ModelUsage } from './views/ModelUsage';
import { DefaultLlm } from './views/DefaultLlm';
import { Roles } from './views/Roles';
import { Placeholder } from './views/Placeholder';

const NAV: NavGroup[] = [
  { items: [{ to: '/', label: '主控台', icon: 'i-grid' }] },
  {
    group: '机构管理',
    items: [
      { to: '/orgs', label: '机构列表', icon: 'i-building' },
      { to: '/accounts', label: '机构账户', icon: 'i-user' },
    ],
  },
  {
    group: '平台数据中心',
    items: [
      { to: '/users', label: '全域用户', icon: 'i-user' },
      { to: '/orders', label: '全域订单', icon: 'i-doc' },
      { to: '/model', label: '模型用量', icon: 'i-chip' },
    ],
  },
  {
    group: '全局策略',
    items: [
      { to: '/llm', label: '默认 LLM', icon: 'i-chip' },
      { to: '/roles', label: '角色权限', icon: 'i-key' },
    ],
  },
];

const TITLES: Record<string, string> = {
  '/': '主控台',
  '/orgs': '机构列表',
  '/orgs/': '机构详情',
  '/accounts': '机构账户',
  '/users': '全域用户',
  '/orders': '全域订单',
  '/model': '模型用量',
  '/llm': '默认 LLM 模型配置',
  '/roles': '角色权限',
};

function Shell() {
  return (
    <AdminShell
      brandSub="平台后台"
      nav={NAV}
      titleMap={TITLES}
      topRight={<UserMenu org="平台超管" name="超级管理员" avatar="超" />}
    >
      <Outlet />
    </AdminShell>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <IconSprite />
      <Routes>
        <Route path="/login" element={<AdminLogin title="登录 · 平台超管" />} />
        <Route element={<Shell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orgs" element={<OrgList />} />
          <Route path="/orgs/:id" element={<OrgDetail />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/users" element={<GlobalUsers />} />
          <Route path="/orders" element={<GlobalOrders />} />
          <Route path="/model" element={<ModelUsage />} />
          <Route path="/llm" element={<DefaultLlm />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="*" element={<Placeholder />} />
        </Route>
      </Routes>
      <ToastHost />
    </BrowserRouter>
  );
}
