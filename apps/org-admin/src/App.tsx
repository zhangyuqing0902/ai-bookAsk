import { BrowserRouter, Routes, Route, Outlet, useNavigate } from 'react-router-dom';
import { IconSprite, ToastHost, PrototypeList } from '@aba/ui';
import { AdminShell, AdminLogin, UserMenu, type NavGroup } from '@aba/ui-admin';
import { Dashboard } from './views/Dashboard';
import { KpList } from './views/KpList';
import { KpDetail } from './views/KpDetail';
import { AgentList } from './views/AgentList';
import { AgentDetail } from './views/AgentDetail';
import { CUsers } from './views/CUsers';
import { CUserDetail } from './views/CUserDetail';
import { Orders } from './views/Orders';
import { OrderDetail } from './views/OrderDetail';
import { Codes } from './views/Codes';
import { DataBoard } from './views/DataBoard';
import { CsConfig } from './views/CsConfig';
import { SysConfig } from './views/SysConfig';
import { Placeholder } from './views/Placeholder';

const NAV: NavGroup[] = [
  { items: [{ to: '/', label: '主控台', icon: 'i-grid' }] },
  {
    group: '产品中心',
    items: [
      { to: '/kps', label: '知识产品 KP', icon: 'i-cube' },
      { to: '/agents', label: 'Agent 人设', icon: 'i-robot' },
    ],
  },
  {
    group: '运营中心',
    items: [
      { to: '/users', label: 'C 端用户', icon: 'i-user' },
      { to: '/orders', label: '订单管理', icon: 'i-doc' },
      { to: '/codes', label: '兑换码', icon: 'i-ticket' },
    ],
  },
  { group: '数据中心', items: [{ to: '/board', label: '数据看板', icon: 'i-chart' }] },
  {
    group: '系统设置',
    items: [
      { to: '/cs', label: '客服配置', icon: 'i-headset' },
      { to: '/sys', label: '系统配置', icon: 'i-gear' },
    ],
  },
  { group: '评审工具', items: [{ to: '/prototypes', label: '原型清单', icon: 'i-grid' }] },
];

const TITLES: Record<string, string> = {
  '/': '主控台',
  '/kps': '知识产品 KP',
  '/kps/': 'KP 详情',
  '/agents': 'Agent 人设',
  '/agents/': '编辑 Agent',
  '/users': 'C 端用户',
  '/users/': '用户详情',
  '/orders': '订单管理',
  '/orders/': '订单详情',
  '/codes': '兑换码',
  '/board': '数据看板',
  '/cs': '客服配置',
  '/sys': '系统配置',
  '/prototypes': '原型清单',
};

function Prototypes() {
  const nav = useNavigate();
  return <PrototypeList current="org" onSameApp={(p) => nav(p)} />;
}

function Shell() {
  return (
    <AdminShell
      brandSub="机构后台"
      nav={NAV}
      titleMap={TITLES}
      topRight={<UserMenu org="XX 出版社" name="张三 · 管理员" avatar="张" />}
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
        <Route path="/login" element={<AdminLogin title="登录 · 机构后台" />} />
        <Route element={<Shell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/kps" element={<KpList />} />
          <Route path="/kps/:id" element={<KpDetail />} />
          <Route path="/agents" element={<AgentList />} />
          <Route path="/agents/:id" element={<AgentDetail />} />
          <Route path="/users" element={<CUsers />} />
          <Route path="/users/:id" element={<CUserDetail />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/codes" element={<Codes />} />
          <Route path="/board" element={<DataBoard />} />
          <Route path="/cs" element={<CsConfig />} />
          <Route path="/sys" element={<SysConfig />} />
          <Route path="/prototypes" element={<Prototypes />} />
          <Route path="*" element={<Placeholder />} />
        </Route>
      </Routes>
      <ToastHost />
    </BrowserRouter>
  );
}
