import { useEffect, useState } from 'react';
import { Icon } from '@aba/ui';

export interface PreviewItem {
  kind: 'image' | 'audio' | 'video';
  name: string;
}

const fmt = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

function usePlayback(durationSec: number) {
  const [playing, setPlaying] = useState(false);
  const [pct, setPct] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPct((p) => {
        const n = p + 100 / (durationSec * 10);
        if (n >= 100) {
          clearInterval(id);
          setPlaying(false);
          return 100;
        }
        return n;
      });
    }, 100);
    return () => clearInterval(id);
  }, [playing, durationSec]);
  return { playing, setPlaying, pct, setPct };
}

function seek(e: React.MouseEvent<HTMLDivElement>, set: (p: number) => void) {
  const r = e.currentTarget.getBoundingClientRect();
  set(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)));
}

// 我的永享 / 订单永享内容预览：图片(缩放) / 视频(封面→播放) / 音频(播客音浪)
export function MediaPreview({ item, onClose }: { item: PreviewItem | null; onClose: () => void }) {
  if (!item) return null;
  return (
    <div className="ov open" id="ovLbx">
      <div className="lbx">
        <div className="lbx-top">
          <span>
            <Icon id="i-shield" w={13} h={13} style={{ verticalAlign: -2 }} /> 因版权限制,暂不支持保存下载
          </span>
          <span className="x tap" onClick={onClose}>
            ✕
          </span>
        </div>
        {item.kind === 'image' && <ImageView name={item.name} />}
        {item.kind === 'video' && <VideoView name={item.name} />}
        {item.kind === 'audio' && <AudioView name={item.name} />}
      </div>
    </div>
  );
}

function ImageView({ name }: { name: string }) {
  const [s, setS] = useState(1);
  return (
    <>
      <div className="mp-img">
        <div className="ph" style={{ transform: `scale(${s})` }}>
          {name}
        </div>
      </div>
      <div className="mp-bar" style={{ justifyContent: 'center', gap: 20, paddingBottom: 26 }}>
        <span className="pp" style={{ fontSize: 22, lineHeight: 1 }} onClick={() => setS((v) => Math.max(0.5, +(v - 0.25).toFixed(2)))}>
          −
        </span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#fff', minWidth: 52, textAlign: 'center' }}>
          {Math.round(s * 100)}%
        </span>
        <span className="pp" style={{ fontSize: 20, lineHeight: 1 }} onClick={() => setS((v) => Math.min(3, +(v + 0.25).toFixed(2)))}>
          ＋
        </span>
      </div>
    </>
  );
}

function VideoView({ name }: { name: string }) {
  const dur = 96;
  const { playing, setPlaying, pct, setPct } = usePlayback(dur);
  const [landscape, setLandscape] = useState(false);
  const started = playing || pct > 0;
  const skip = (sec: number) => setPct((p) => Math.max(0, Math.min(100, p + (sec / dur) * 100)));
  return (
    <div className={'mp-video-wrap' + (landscape ? ' landscape' : '')}>
      <div className="mp-video">
        <div className="frame">
          {!started ? (
            <div className="playbtn" onClick={() => setPlaying(true)}>
              <Icon id="i-play" />
            </div>
          ) : (
            <div style={{ color: 'rgba(255,255,255,.6)', fontFamily: 'var(--mono)', fontSize: 12 }}>{name}</div>
          )}
        </div>
        {/* 控件紧贴视频下方(而非页面最底) */}
        <div className="mp-bar mp-bar-video">
          <span className="pp" onClick={() => setPlaying((v) => !v)}>
            <Icon id={playing ? 'i-pause' : 'i-play'} />
          </span>
          <span className="pp sm" onClick={() => skip(-15)} title="后退 15 秒">
            <Icon id="i-forward" style={{ transform: 'rotate(180deg)' }} />
          </span>
          <div className="mp-track" onClick={(e) => seek(e, setPct)}>
            <i style={{ width: pct + '%' }} />
          </div>
          <span className="pp sm" onClick={() => skip(15)} title="快进 15 秒">
            <Icon id="i-forward" />
          </span>
          <span className="mp-time">
            {fmt((pct / 100) * dur)} / {fmt(dur)}
          </span>
          <span className="pp sm" onClick={() => setLandscape((v) => !v)} title="横竖屏切换">
            <Icon id="i-fullscreen" />
          </span>
        </div>
      </div>
    </div>
  );
}

function AudioView({ name }: { name: string }) {
  const dur = 312;
  const { playing, setPlaying, pct, setPct } = usePlayback(dur);
  const bars = 56;
  const heights = Array.from({ length: bars }, (_, i) => 8 + Math.abs(Math.sin(i * 1.3)) * 30);
  const playedTo = (pct / 100) * bars;
  return (
    <div className="mp-audio">
      <div className="cover">
        <Icon id="i-sound" />
      </div>
      <div className="title">{name}</div>
      <div className="mp-bars" onClick={(e) => seek(e, setPct)} style={{ cursor: 'pointer' }}>
        {heights.map((h, i) => (
          <span key={i} className={i <= playedTo ? 'on' : undefined} style={{ height: h }} />
        ))}
      </div>
      <div className="mp-bar" style={{ width: '100%' }}>
        <span className="pp" onClick={() => setPlaying((v) => !v)}>
          <Icon id={playing ? 'i-pause' : 'i-play'} />
        </span>
        <div className="mp-track" onClick={(e) => seek(e, setPct)}>
          <i style={{ width: pct + '%' }} />
        </div>
        <span className="mp-time">
          {fmt((pct / 100) * dur)} / {fmt(dur)}
        </span>
      </div>
    </div>
  );
}
