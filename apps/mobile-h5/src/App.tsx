import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { IconSprite } from '@aba/ui';
import { PhoneStage } from '@aba/ui-mobile';
import { Landing } from './screens/Landing';
import { PhoneLogin } from './screens/PhoneLogin';
import { WechatBind } from './screens/WechatBind';
import { WechatAuth } from './screens/WechatAuth';
import { WechatScan } from './screens/WechatScan';
import { Conflict } from './screens/Conflict';
import { Chat } from './screens/Chat';
import { Call } from './screens/Call';
import { Member } from './screens/Member';
import { MemberCenter } from './screens/MemberCenter';
import { My } from './screens/My';
import { Yongxiang } from './screens/Yongxiang';
import { Redeem } from './screens/Redeem';
import { Orders } from './screens/Orders';
import { OrderDetail } from './screens/OrderDetail';
import { WechatPay } from './screens/WechatPay';
import { PaySuccess } from './screens/PaySuccess';
import { PayFail } from './screens/PayFail';
import { QrInvalid } from './screens/QrInvalid';
import { Agreement } from './screens/Agreement';
import { AccountRebind } from './screens/AccountRebind';

export function App() {
  return (
    <BrowserRouter>
      <IconSprite />
      <PhoneStage>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login/phone" element={<PhoneLogin />} />
          <Route path="/login/wechat-bind" element={<WechatBind />} />
          <Route path="/login/wechat-auth" element={<WechatAuth />} />
          <Route path="/login/wechat-scan" element={<WechatScan />} />
          <Route path="/login/conflict" element={<Conflict />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/call" element={<Call />} />
          <Route path="/member" element={<Member />} />
          <Route path="/member/center" element={<MemberCenter />} />
          <Route path="/me" element={<My />} />
          <Route path="/me/yongxiang" element={<Yongxiang />} />
          <Route path="/me/redeem" element={<Redeem />} />
          <Route path="/me/orders" element={<Orders />} />
          <Route path="/me/orders/:id" element={<OrderDetail />} />
          <Route path="/account" element={<AccountRebind />} />
          <Route path="/pay/wechat" element={<WechatPay />} />
          <Route path="/pay/success" element={<PaySuccess />} />
          <Route path="/pay/fail" element={<PayFail />} />
          <Route path="/qr-invalid" element={<QrInvalid />} />
          <Route path="/agreement/:type" element={<Agreement />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PhoneStage>
    </BrowserRouter>
  );
}
