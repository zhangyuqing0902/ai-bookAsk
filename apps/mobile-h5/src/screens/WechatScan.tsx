import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@aba/ui';
import { useDemoStore } from '@aba/mock';

// 非微信浏览器扫码登录页。0613-2：内嵌二维码（WxLogin）= 整页为 AI 问书自有页面、可自由美化，
// 仅二维码图由微信生成；二维码中央不放 AI 问书 Logo（二维码属微信、避免误导）。
type Stage = 'wait' | 'scanned' | 'confirmed';

export function WechatScan() {
  const nav = useNavigate();
  const wechatLogin = useDemoStore((s) => s.wechatLogin);
  const [stage, setStage] = useState<Stage>('wait');

  useEffect(() => {
    const t1 = setTimeout(() => setStage('scanned'), 2600);
    const t2 = setTimeout(() => {
      setStage('confirmed');
      setTimeout(() => {
        wechatLogin();
        nav('/login/wechat-bind');
      }, 700);
    }, 5200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [nav, wechatLogin]);

  return (
    <>
      <div className="h5-top">
        <div className="ic tap" onClick={() => nav('/')}>
          <Icon id="i-chevL" w={22} h={22} />
        </div>
        <div className="center">
          <div className="ttl">微信扫码登录</div>
        </div>
        <div className="grp" />
      </div>
      <div className="wxscan2">
        <div className="wxscan2-orb orb float" />
        <div className="wxscan2-name">
          AI <span className="grad">问书</span>
        </div>
        <div className="wxscan2-sub">打开微信「扫一扫」，扫码即可登录</div>

        <div className="wxscan2-qrwrap">
          <div className={'wxscan2-frame' + (stage !== 'wait' ? ' dim' : '')}>
            <div className="wxscan-qrgrid">
              {Array.from({ length: 49 }).map((_, i) => (
                <span key={i} className={(i * 7 + i * i) % 3 === 0 ? 'b' : ''} />
              ))}
            </div>
            <i className="cnr tl" />
            <i className="cnr tr" />
            <i className="cnr bl" />
            <i className="cnr br" />
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

        <div className="wxscan2-tip">{stage === 'wait' ? '请使用微信扫一扫扫描上方二维码' : '扫码成功，正在登录…'}</div>
        <div className="wxscan2-back tap" onClick={() => nav('/')}>
          返回其他登录方式
        </div>
      </div>
    </>
  );
}
