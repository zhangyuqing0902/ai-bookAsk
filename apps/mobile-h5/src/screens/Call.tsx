import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@aba/ui';

// 9 实时电话语音（会员专属）+ 字幕态
export function Call() {
  const nav = useNavigate();
  const [mute, setMute] = useState(false);
  const [cap, setCap] = useState(false);
  return (
    <div className={'call' + (cap ? ' cc-on' : '')}>
      <div className="call-top">
        <div className="call-name">AI 问书</div>
      </div>
      <div className="call-mid">
        <div className="call-orb">
          <div className="brand-orb" style={{ width: 150, height: 150 }}>
            <div className="ring r1" />
            <div className="ring r2" />
            <div className="orbit">
              <span className="dot" />
            </div>
            <div className="orb float core" />
          </div>
        </div>
      </div>
      <div className="call-talk">
        <div className="call-status">
          正在听
          <span className="ld">
            <i />
            <i />
            <i />
          </span>
        </div>
      </div>
      <div className="call-subs">
        <div className="sub-u">高血压怎么控制饮食?</div>
        <div className="sub-a">控制饮食的关键是低钠饮食,每日食盐摄入应小于 5 克,同时多吃新鲜蔬果、增加钾的摄入。</div>
        <div className="sub-u">那运动呢?</div>
        <div className="sub-a">建议每周 150 分钟中等强度有氧,如快走、游泳,避免突然剧烈运动。</div>
      </div>
      <div className="call-controls">
        <div className={'cc tap' + (mute ? ' on' : '')} onClick={() => setMute((m) => !m)}>
          <div className="cb">
            <Icon id={mute ? 'i-micoff' : 'i-mic'} />
          </div>
          <span>静音</span>
        </div>
        <div className="cc hang tap" onClick={() => nav(-1)}>
          <div className="cb">
            <Icon id="i-hangup" />
          </div>
          <span>挂断</span>
        </div>
        <div className={'cc tap' + (cap ? ' on' : '')} onClick={() => setCap((c) => !c)}>
          <div className="cb">
            <Icon id="i-cc" />
          </div>
          <span>字幕</span>
        </div>
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--ink-3)', textAlign: 'center', paddingBottom: 20 }}>内容由 AI 生成</div>
    </div>
  );
}
