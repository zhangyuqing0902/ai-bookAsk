import { useEffect, useState } from 'react';
import { Icon } from '@aba/ui';

export interface MediaItem {
  kind: 'image' | 'audio' | 'video';
  name: string;
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const SPEEDS = [1, 1.5, 2, 0.5];

function usePlayback(dur: number) {
  const [playing, setPlaying] = useState(false);
  const [pct, setPct] = useState(0);
  const [speed, setSpeed] = useState(1);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setPct((p) => {
      const n = p + (100 / (dur * 10)) * speed;
      if (n >= 100) { clearInterval(id); setPlaying(false); return 100; }
      return n;
    }), 100);
    return () => clearInterval(id);
  }, [playing, dur, speed]);
  return { playing, setPlaying, pct, setPct, speed, setSpeed };
}
const seek = (e: React.MouseEvent<HTMLDivElement>, set: (p: number) => void) => {
  const r = e.currentTarget.getBoundingClientRect();
  set(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)));
};

// 后台媒体预览(图缩放 / 视频含倍速 / 音频音浪)。9.3:按后台 UI 规范 —— 居中白窗,非全屏黑底。
export function MediaView({ item, onClose }: { item: MediaItem | null; onClose: () => void }) {
  if (!item) return null;
  // 8.1:图片预览弹窗整体缩小(更窄的卡片);版权提示在图片态贴近缩放百分比
  const isImg = item.kind === 'image';
  return (
    <div className="mv-scrim" onClick={onClose}>
      <div className={'mv-card' + (isImg ? ' mv-card-img' : '')} onClick={(e) => e.stopPropagation()}>
        <div className="mv-head">
          <span className="mv-title">{item.name}</span>
          <span className="mv-x" onClick={onClose}>✕</span>
        </div>
        <div className="mv-body">
          {item.kind === 'image' && <ImageView name={item.name} />}
          {item.kind === 'video' && <VideoView name={item.name} />}
          {item.kind === 'audio' && <AudioView name={item.name} />}
        </div>
        <div className={'mv-foot' + (isImg ? ' mv-foot-tight' : '')}>
          <Icon id="i-lock" w={12} h={12} style={{ verticalAlign: -2 }} /> 因版权限制，暂不支持保存下载
        </div>
      </div>
    </div>
  );
}

function SpeedBtn({ speed, onCycle }: { speed: number; onCycle: () => void }) {
  return (
    <span className="mv-speed" onClick={onCycle} title="倍速播放">
      {speed}x
    </span>
  );
}

function ImageView({ name }: { name: string }) {
  const [s, setS] = useState(1);
  return (
    <div className="mv-image">
      <div className="mv-stage" style={{ aspectRatio: '4 / 3' }}>
        <div className="mv-imgph" style={{ transform: `scale(${s})` }}>{name}</div>
      </div>
      <div className="mv-bar mv-bar-center">
        <span className="mv-zoom" onClick={() => setS((v) => Math.max(0.5, +(v - 0.25).toFixed(2)))}>−</span>
        <span className="mv-zoom-val mono">{Math.round(s * 100)}%</span>
        <span className="mv-zoom" onClick={() => setS((v) => Math.min(3, +(v + 0.25).toFixed(2)))}>＋</span>
      </div>
    </div>
  );
}

function VideoView({ name }: { name: string }) {
  const dur = 96;
  const { playing, setPlaying, pct, setPct, speed, setSpeed } = usePlayback(dur);
  const started = playing || pct > 0;
  const cycle = () => setSpeed((sp) => SPEEDS[(SPEEDS.indexOf(sp) + 1) % SPEEDS.length]);
  return (
    <div>
      <div className="mv-stage mv-video" style={{ aspectRatio: '16 / 10' }}>
        {!started ? (
          <div className="mv-playbtn" onClick={() => setPlaying(true)}>
            <Icon id="i-play" w={28} h={28} style={{ marginLeft: 3 }} />
          </div>
        ) : (
          <span className="mv-vname mono">{name}</span>
        )}
      </div>
      <div className="mv-bar">
        <span className="mv-pp" onClick={() => setPlaying((v) => !v)}>
          <Icon id={playing ? 'i-pause' : 'i-play'} w={18} h={18} />
        </span>
        <div className="mv-track" onClick={(e) => seek(e, setPct)}>
          <i style={{ width: pct + '%' }} />
        </div>
        <span className="mv-time mono">{fmt((pct / 100) * dur)} / {fmt(dur)}</span>
        <SpeedBtn speed={speed} onCycle={cycle} />
      </div>
    </div>
  );
}

function AudioView({ name }: { name: string }) {
  const dur = 312;
  const { playing, setPlaying, pct, setPct, speed, setSpeed } = usePlayback(dur);
  const bars = 56;
  const heights = Array.from({ length: bars }, (_, i) => 6 + Math.abs(Math.sin(i * 1.3)) * 26);
  const playedTo = (pct / 100) * bars;
  const cycle = () => setSpeed((sp) => SPEEDS[(SPEEDS.indexOf(sp) + 1) % SPEEDS.length]);
  return (
    <div className="mv-audio">
      <div className="mv-audio-cover">
        <Icon id="i-sound" w={40} h={40} />
      </div>
      <div className="mv-audio-name">{name}</div>
      {/* 8.2:进度条与音轨(波形)合为一体 —— 点击波形即 seek,播放进度直接体现在波形上 */}
      <div className="mv-bar">
        <span className="mv-pp" onClick={() => setPlaying((v) => !v)}>
          <Icon id={playing ? 'i-pause' : 'i-play'} w={18} h={18} />
        </span>
        <div className="mv-wave-track" onClick={(e) => seek(e, setPct)}>
          {heights.map((h, i) => (
            <span key={i} className={i <= playedTo ? 'on' : undefined} style={{ height: h }} />
          ))}
        </div>
        <span className="mv-time mono">{fmt((pct / 100) * dur)} / {fmt(dur)}</span>
        <SpeedBtn speed={speed} onCycle={cycle} />
      </div>
    </div>
  );
}
