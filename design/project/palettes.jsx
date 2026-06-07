// 4 palettes laid out side-by-side as small "swatch artboards" so the user
// can pick the color temperament that fits AI 问书.
//
// Each PaletteCard renders inside a 320×460 artboard slot. It shows: the name
// + Chinese descriptor, three big swatches (bg / ink / accent), the secondary
// support colors as small chips, and a tiny "preview" showing how the
// conversation header + a message bubble look in that palette.

const PALETTES = [
  {
    id: 'paper',
    name: 'A · 暖纸宣纸',
    descriptor: '沉静 · 学术 · 温润',
    keywords: '出版纸感 / 朱砂印章 / 衬线中文标题',
    bg: '#f4ede0',
    surface: '#faf5ea',
    ink: '#1c1814',
    muted: '#6b5e4f',
    accent: '#b04a32',
    accent2: '#c8a356',
    bubble: '#ffffff',
    you: '#1c1814',
    serif: true,
  },
  {
    id: 'mist',
    name: 'B · 雾蓝石青',
    descriptor: '冷静 · 专业 · 医学感',
    keywords: '临床蓝 / 高对比 / 数据可信',
    bg: '#eef2f6',
    surface: '#ffffff',
    ink: '#0f1a2a',
    muted: '#5a6b80',
    accent: '#1f5fa8',
    accent2: '#3aa37a',
    bubble: '#ffffff',
    you: '#0f1a2a',
    serif: false,
  },
  {
    id: 'jade',
    name: 'C · 月白竹青',
    descriptor: '中式 · 典雅 · 留白',
    keywords: '宋瓷月白 / 竹青点缀 / 楷书标题',
    bg: '#ebebe0',
    surface: '#f6f4ec',
    ink: '#1f2620',
    muted: '#6a7165',
    accent: '#3f6e5b',
    accent2: '#a87a4b',
    bubble: '#ffffff',
    you: '#1f2620',
    serif: true,
  },
  {
    id: 'cream',
    name: 'D · 奶白靛蓝',
    descriptor: '新潮 · 友好 · AI 工具感',
    keywords: '柔和奶白 / 电光靛蓝 / 圆润 sans',
    bg: '#f6f4f0',
    surface: '#ffffff',
    ink: '#1a1d29',
    muted: '#6a6e7a',
    accent: '#4f46e5',
    accent2: '#f0a04b',
    bubble: '#f1eee8',
    you: '#1a1d29',
    serif: false,
  },
];

function PaletteCard({ p }) {
  const titleFont = p.serif ? '"Noto Serif SC", serif' : '"Noto Sans SC", sans-serif';
  return (
    <div style={{
      width: 320, height: 460, background: p.bg,
      padding: '28px 24px 24px', display: 'flex', flexDirection: 'column',
      fontFamily: '"Noto Sans SC", sans-serif', color: p.ink,
    }}>
      {/* heading */}
      <div style={{ fontFamily: titleFont, fontSize: 22, fontWeight: 600, letterSpacing: 0.5 }}>{p.name}</div>
      <div style={{ fontSize: 13, color: p.muted, marginTop: 4, letterSpacing: 0.4 }}>{p.descriptor}</div>
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10.5, color: p.muted, marginTop: 8, opacity: 0.75 }}>{p.keywords}</div>

      {/* big swatches */}
      <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
        <Swatch hex={p.bg} label="底" muted={p.muted} ink={p.ink} />
        <Swatch hex={p.ink} label="墨" muted={p.muted} ink={p.bg} dark />
        <Swatch hex={p.accent} label="主色" muted={p.muted} ink="#fff" dark />
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <Swatch hex={p.surface} label="卡面" muted={p.muted} ink={p.ink} small />
        <Swatch hex={p.muted} label="次墨" muted={p.muted} ink="#fff" small dark />
        <Swatch hex={p.accent2} label="辅" muted={p.muted} ink="#fff" small dark />
      </div>

      {/* mini preview: a fragment of the conversation surface */}
      <div style={{
        marginTop: 'auto', background: p.surface, borderRadius: 12, padding: 14,
        boxShadow: '0 1px 0 rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.05)',
      }}>
        {/* avatar + book title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 15, background: p.accent,
            color: '#fff', fontFamily: titleFont, fontSize: 15, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            letterSpacing: 0,
          }}>问</div>
          <div>
            <div style={{ fontFamily: titleFont, fontSize: 13.5, fontWeight: 600, lineHeight: 1.2 }}>心血管分册 · AI</div>
            <div style={{ fontSize: 10.5, color: p.muted, marginTop: 1 }}>临床百家 · 第 4 版</div>
          </div>
        </div>
        {/* bubble */}
        <div style={{
          marginTop: 10, background: p.bubble, padding: '10px 12px', borderRadius: 10,
          fontSize: 12, lineHeight: 1.65, color: p.ink,
        }}>
          冠脉造影前需评估出血风险与抗栓需求…
        </div>
        {/* tag */}
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <Tag color={p.accent} bg={p.bubble}>溯源 5</Tag>
          <Tag color={p.accent2} bg={p.bubble}>会员图</Tag>
          <Tag muted={p.muted} bg={p.bubble}>永享视频</Tag>
        </div>
      </div>
    </div>
  );
}

function Swatch({ hex, label, ink, muted, dark, small }) {
  return (
    <div style={{
      flex: 1, height: small ? 56 : 86, background: hex, borderRadius: 8,
      padding: 8, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      color: ink, position: 'relative',
      boxShadow: dark ? 'none' : 'inset 0 0 0 1px rgba(0,0,0,0.05)',
    }}>
      <span style={{ fontFamily: '"Noto Serif SC", serif', fontSize: small ? 11 : 13, fontWeight: 600 }}>{label}</span>
      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: small ? 9 : 10, opacity: 0.75 }}>{hex.replace('#', '').toUpperCase()}</span>
    </div>
  );
}

function Tag({ children, color, muted, bg }) {
  const c = color || muted;
  return (
    <span style={{
      fontSize: 10, padding: '3px 7px', borderRadius: 99,
      color: c, background: bg, border: `1px solid ${c}33`,
      fontFamily: '"Noto Sans SC", sans-serif', fontWeight: 500, letterSpacing: 0.3,
    }}>{children}</span>
  );
}

Object.assign(window, { PALETTES, PaletteCard });
