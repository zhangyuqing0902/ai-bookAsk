import { useNavigate } from 'react-router-dom';
import { Icon } from '@aba/ui';

// 微信内置浏览器授权场景：模拟微信 App 官方授权弹窗（底部 sheet 盖在模糊背景上）
// 允许 → 模拟回调，原型默认当作新用户跳绑定手机号；拒绝 → 返回登录落地页
export function WechatAuth() {
  const nav = useNavigate();
  return (
    <div className="wxauth">
      {/* 模糊的微信背景占位（聊天列表态） */}
      <div className="wxauth-bg">
        <div className="wxauth-bg-bar">
          <span>微信</span>
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div className="wxauth-bg-row" key={i}>
            <span className="av" />
            <span className="ln" />
          </div>
        ))}
      </div>

      <div className="wxauth-scrim" onClick={() => nav('/')} />

      {/* 微信官方授权弹窗 */}
      <div className="wxauth-sheet">
        <div className="wxauth-head">
          <div className="wxauth-logo orb float" />
          <div className="wxauth-app">AI 问书 申请使用</div>
        </div>
        <div className="wxauth-perm">
          <Icon id="i-user" w={16} h={16} />
          获取你的昵称、头像
        </div>
        <div className="wxauth-tip">授权后，你可使用微信账号快捷登录</div>
        <div className="wxauth-btns">
          <button className="wxauth-allow" onClick={() => nav('/login/wechat-bind')}>
            允许
          </button>
          <button className="wxauth-deny" onClick={() => nav('/')}>
            拒绝
          </button>
        </div>
      </div>
    </div>
  );
}
