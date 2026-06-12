import { useNavigate } from 'react-router-dom';
import { PrototypeList } from '@aba/ui';

// 原型清单（脱手机框、电脑端全宽渲染，详见 App.tsx 的 Shell 判断）
export function Prototypes() {
  const nav = useNavigate();
  return <PrototypeList current="mobile" onSameApp={(p) => nav(p)} onBack={() => nav(-1)} />;
}
