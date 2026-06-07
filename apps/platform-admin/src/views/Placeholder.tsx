import { useLocation } from 'react-router-dom';

const NAMES: Record<string, string> = {
  '/accounts': '机构账户',
  '/users': '全域用户',
  '/orders': '全域订单',
  '/model': '模型用量',
  '/llm': '默认 LLM 模型配置',
  '/roles': '角色权限',
};

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
