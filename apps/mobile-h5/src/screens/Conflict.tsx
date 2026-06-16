import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@aba/ui';
import { ServiceSheet } from '../ServiceSheet';

// 4 手机号已被占用提示（0613：删除「账号合并」逻辑，改为占用死胡同提示——不做合并）
// 场景：微信欲绑定的手机号在本机构已被其他账号 / 微信绑定；A、B 两微信绑同号亦走此提示。
export function Conflict() {
  const nav = useNavigate();
  const [service, setService] = useState(false);
  return (
    <>
      <div className="h5-top">
        <div className="ic tap" onClick={() => nav(-1)}>
          <Icon id="i-chevL" w={22} h={22} />
        </div>
        <div className="center">
          <div className="ttl">手机号已被占用</div>
        </div>
        <div className="grp" />
      </div>
      <div className="lg lg-auth">
        <div className="lg-form" style={{ textAlign: 'center' }}>
          <div className="occ-ic">
            <Icon id="i-phone" w={26} h={26} />
          </div>
          <div className="lg-h" style={{ marginTop: 14 }}>
            该手机号已被其他账号绑定
          </div>
          <div className="lg-s" style={{ marginBottom: 22 }}>
            手机号 <b style={{ color: 'var(--ink)', fontFamily: 'var(--mono)' }}>138****8888</b> 已被占用。
            <br />
            请更换其他手机号绑定，如有疑问请联系客服。
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14 }} onClick={() => nav(-1)}>
            更换手机号
          </button>
          <button
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'center', padding: 14, marginTop: 12 }}
            onClick={() => setService(true)}
          >
            联系客服
          </button>
        </div>
      </div>

      {/* 联系客服 sheet（复用「我的」同款，含客服二维码） */}
      <ServiceSheet open={service} onClose={() => setService(false)} />
    </>
  );
}
