import { useNavigate } from 'react-router-dom';
import { Icon } from '@aba/ui';

// 7.3 支付结果 · 成功（品牌质感落地页；返回=回到掉起支付的那个会话）
export function PaySuccess() {
  const nav = useNavigate();
  return (
    <div className="lg pay-ok">
      <div className="pay-ok-badge">
        <span className="pay-ok-ring r1" />
        <span className="pay-ok-ring r2" />
        <span className="pay-ok-check">
          <Icon id="i-check" w={40} h={40} />
        </span>
      </div>
      <div className="pay-ok-t">支付成功</div>
      <div className="pay-ok-s">已为你解锁权益，回到刚才的对话继续探索</div>
      <button className="btn btn-primary pay-ok-btn" onClick={() => nav('/chat', { replace: true })}>
        返回会话
      </button>
      <div className="pay-ok-link" onClick={() => nav('/me/orders', { replace: true })}>
        查看订单
      </div>
    </div>
  );
}
