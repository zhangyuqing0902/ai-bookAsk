import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@aba/ui';

// 外部浏览器扫码授权页（open.weixin.qq.com 风格）：
// 展示动态二维码占位 → setTimeout 模拟「已扫码,请在手机上确认」→ 确认后跳绑定手机号
type Stage = 'wait' | 'scanned' | 'confirmed';

export function WechatScan() {
  const nav = useNavigate();
  const [stage, setStage] = useState<Stage>('wait');

  useEffect(() => {
    const t1 = setTimeout(() => setStage('scanned'), 2600);
    const t2 = setTimeout(() => {
      setStage('confirmed');
      setTimeout(() => nav('/login/wechat-bind'), 700);
    }, 5200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [nav]);

  return (
    <div className="wxscan">
      <div className="wxscan-bar">
        <span className="dot g" />
        open.weixin.qq.com
      </div>
      <div className="wxscan-body">
        <div className="wxscan-brand">
          <Icon id="i-msg" w={18} h={18} />
          微信登录
        </div>
        <div className="wxscan-qr">
          <div className={'wxscan-qrimg' + (stage !== 'wait' ? ' dim' : '')}>
            {/* 动态二维码占位 */}
            <div className="wxscan-qrgrid">
              {Array.from({ length: 49 }).map((_, i) => (
                <span key={i} className={(i * 7 + i * i) % 3 === 0 ? 'b' : ''} />
              ))}
            </div>
            <div className="wxscan-qr-mid orb float" />
          </div>

          {stage === 'scanned' && (
            <div className="wxscan-mask">
              <div className="wxscan-mask-ic">
                <Icon id="i-phone" w={26} h={26} />
              </div>
              <div className="wxscan-mask-t">已扫描</div>
              <div className="wxscan-mask-s">请在手机上点击确认</div>
            </div>
          )}
          {stage === 'confirmed' && (
            <div className="wxscan-mask ok">
              <div className="wxscan-mask-ic ok">
                <Icon id="i-check" w={26} h={26} />
              </div>
              <div className="wxscan-mask-t">已确认</div>
              <div className="wxscan-mask-s">正在登录…</div>
            </div>
          )}
        </div>
        <div className="wxscan-tip">
          {stage === 'wait' ? '请使用微信扫一扫登录' : '扫码成功'}
        </div>
        <div className="wxscan-back tap" onClick={() => nav('/')}>
          返回其他登录方式
        </div>
      </div>
    </div>
  );
}
