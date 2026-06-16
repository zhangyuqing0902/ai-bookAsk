import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemoStore } from '@aba/mock';

// 0613 三能力（支付下单 / 兑换码 / 充值会员）前置手机号绑定校验（合规）。
// 用法：const { guard, gate } = usePhoneGate();
//   把动作包成 guard(action) 作为 onClick；并在组件 JSX 中渲染 {gate}。
export function usePhoneGate() {
  const phoneBound = useDemoStore((s) => s.phoneBound);
  const nav = useNavigate();
  const [ask, setAsk] = useState(false);

  const guard = (action: () => void) => () => {
    if (phoneBound) action();
    else setAsk(true);
  };

  const gate = (
    <div className={'ov' + (ask ? ' open' : '')}>
      <div className="scrim" onClick={() => setAsk(false)} />
      <div className="pw">
        <div className="pw-h" style={{ textAlign: 'center' }}>
          <div className="t">请先绑定手机号</div>
          <div className="s">支付、开会员等操作需绑定手机号，来保障账户安全</div>
        </div>
        <div className="pw-btns">
          <button
            className="btn btn-primary"
            onClick={() => {
              setAsk(false);
              nav('/login/wechat-bind?from=gate');
            }}
          >
            去绑定手机号
          </button>
          <button className="btn btn-text-weak" onClick={() => setAsk(false)}>
            暂不绑定
          </button>
        </div>
      </div>
    </div>
  );

  return { guard, gate };
}
