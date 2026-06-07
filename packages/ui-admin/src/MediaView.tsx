import { useEffect, useState } from 'react';
import { Icon } from '@aba/ui';

export interface MediaItem {
  kind: 'image' | 'audio' | 'video';
  name: string;
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

function usePlayback(dur: number) {
  const [playing, setPlaying] = useState(false);
  const [pct, setPct] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setPct((p) => {
      const n = p + 100 / (dur * 10);
      if (n >= 100) { clearInterval(id); setPlaying(false); return 100; }
      return n;
    }), 100);
    return () => clearInterval(id);
  }, [playing, dur]);
  return { playing, setPlaying, pct, setPct };
}
const seek = (e: React.MouseEvent<HTMLDivElement>, set: (p: number) => void) => {
  const r = e.currentTarget.getBoundingClientRect();
  set(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)));
};

const trackStyle: React.CSSProperties = { flex: 1, height: 4, borderRadius: 3, background: 'rgba(255,255,255,.25)', position: 'relative', cursor: 'pointer' };
const fillStyle = (pct: number): React.CSSProperties => ({ position: 'absolute', left: 0, top: 0, bottom: 0, width: pct + '%', borderRadius: 3, background: 'var(--indigo)' });

// 后台媒体预览（图缩放 / 视频封面→播放 / 音频播客音浪）。全内联样式,机构后台/平台后台通用。
export function MediaView({ item, onClose }: { item: MediaItem | null; onClose: () => void }) {
  if (!item) return null;
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(13,12,16,.94)', display: 'flex', flexDirection: 'column' }}
      onClick={onClose}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', color: 'rgba(255,255,255,.8)', fontSize: 12.5 }}>
        <span>
          <Icon id="i-lock" w={13} h={13} style={{ verticalAlign: -2 }} /> 因版权限制,暂不支持保存下载
        </span>
        <span style={{ cursor: 'pointer', fontSize: 16 }} onClick={onClose}>✕</span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 40px 50px' }} onClick={(e) => e.stopPropagation()}>
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
      <div
        style={{
          width: 420, maxWidth: '70vw', aspectRatio: '4 / 3', borderRadius: 12,
          background: 'repeating-linear-gradient(135deg,#2a2c38 0 14px,#23242e 14px 28px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.5)',
          fontFamily: 'var(--mono)', fontSize: 13, transform: `scale(${s})`, transition: 'transform .15s',
        }}
      >
        {name}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, color: '#fff' }}>
        <span style={{ cursor: 'pointer', fontSize: 22 }} onClick={() => setS((v) => Math.max(0.5, +(v - 0.25).toFixed(2)))}>−</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 13, minWidth: 52, textAlign: 'center' }}>{Math.round(s * 100)}%</span>
        <span style={{ cursor: 'pointer', fontSize: 20 }} onClick={() => setS((v) => Math.min(3, +(v + 0.25).toFixed(2)))}>＋</span>
      </div>
    </div>
  );
}

function VideoView({ name }: { name: string }) {
  const dur = 96;
  const { playing, setPlaying, pct, setPct } = usePlayback(dur);
  const started = playing || pct > 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 560, maxWidth: '74vw', aspectRatio: '16 / 10', borderRadius: 12, background: 'linear-gradient(155deg,#3a3d4d,#23242e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!started ? (
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--ink)' }} onClick={() => setPlaying(true)}>
            <Icon id="i-play" w={28} h={28} style={{ marginLeft: 3 }} />
          </div>
        ) : (
          <span style={{ color: 'rgba(255,255,255,.6)', fontFamily: 'var(--mono)', fontSize: 12 }}>{name}</span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 560, maxWidth: '74vw', color: '#fff' }}>
        <span style={{ cursor: 'pointer', display: 'flex' }} onClick={() => setPlaying((v) => !v)}>
          <Icon id={playing ? 'i-mic' : 'i-play'} w={20} h={20} />
        </span>
        <div style={trackStyle} onClick={(e) => seek(e, setPct)}>
          <i style={fillStyle(pct)} />
        </div>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'rgba(255,255,255,.7)', minWidth: 84, textAlign: 'right' }}>
          {fmt((pct / 100) * dur)} / {fmt(dur)}
        </span>
      </div>
    </div>
  );
}

function AudioView({ name }: { name: string }) {
  const dur = 312;
  const { playing, setPlaying, pct, setPct } = usePlayback(dur);
  const bars = 60;
  const heights = Array.from({ length: bars }, (_, i) => 8 + Math.abs(Math.sin(i * 1.3)) * 34);
  const playedTo = (pct / 100) * bars;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
      <div style={{ width: 150, height: 150, borderRadius: 20, background: 'linear-gradient(150deg,#5b73f2,#4b57e8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.9)' }}>
        <Icon id="i-sound" w={48} h={48} />
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{name}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 40, cursor: 'pointer' }} onClick={(e) => seek(e, setPct)}>
        {heights.map((h, i) => (
          <span key={i} style={{ width: 3, height: h, borderRadius: 2, background: i <= playedTo ? 'var(--indigo)' : 'rgba(255,255,255,.5)' }} />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 420, maxWidth: '70vw', color: '#fff' }}>
        <span style={{ cursor: 'pointer', display: 'flex' }} onClick={() => setPlaying((v) => !v)}>
          <Icon id={playing ? 'i-mic' : 'i-play'} w={20} h={20} />
        </span>
        <div style={trackStyle} onClick={(e) => seek(e, setPct)}>
          <i style={fillStyle(pct)} />
        </div>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'rgba(255,255,255,.7)', minWidth: 84, textAlign: 'right' }}>
          {fmt((pct / 100) * dur)} / {fmt(dur)}
        </span>
      </div>
    </div>
  );
}
