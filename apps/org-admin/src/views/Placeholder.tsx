import { useLocation } from 'react-router-dom';

const NAMES: Record<string, string> = {
  '/agents': 'Agent 人设',
  '/users': 'C 端用户',
  '/orders': '订单管理',
  '/codes': '兑换码',
  '/board': '数据看板',
  '/cs': '客服配置',
  '/sys': '系统配置',
};

// 待铺开页占位（确认风格后按功能清单批量实现）
export function Placeholder() {
  const { pathname } = useLocation();
  const name = NAMES[pathname] || '页面';
  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">{name}</div>
        </div>
      </div>
      <div className="card card-pad" style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--ink-3)' }}>
        「{name}」将在风格确认后按功能清单铺开。
      </div>
    </>
  );
}
