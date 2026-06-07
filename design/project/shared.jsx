// Shared atoms for the AI 问书 design canvas.
// Phone frame (375×812 with iOS-style status bar + home indicator),
// generic icons, and tiny utility components used by both directions.

const SHARED_PHONE_W = 375;
const SHARED_PHONE_H = 812;

function PhoneFrame({ children, bg = '#fff', dark = false, fontFamily, statusColor }) {
  return (
    <div style={{
      width: SHARED_PHONE_W, height: SHARED_PHONE_H,
      background: bg, fontFamily,
      position: 'relative', overflow: 'hidden',
      color: dark ? '#fff' : '#1a1614',
    }}>
      <StatusBar color={statusColor || (dark ? '#fff' : '#1a1614')} />
      {children}
      <HomeIndicator color={dark ? 'rgba(255,255,255,0.85)' : 'rgba(20,16,14,0.65)'} />
    </div>
  );
}

function StatusBar({ color }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      height: 44, padding: '14px 24px 0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontSize: 15, fontWeight: 600, color, letterSpacing: 0.2,
      zIndex: 9,
      pointerEvents: 'none',
      fontFamily: '-apple-system, "SF Pro Text", "Helvetica Neue", sans-serif',
      fontVariantNumeric: 'tabular-nums',
    }}>
      <span>9:41</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <svg width="17" height="11" viewBox="0 0 17 11" fill={color}>
          <rect x="0" y="7" width="3" height="4" rx="0.5" /><rect x="5" y="5" width="3" height="6" rx="0.5" />
          <rect x="10" y="2.5" width="3" height="8.5" rx="0.5" /><rect x="14" y="0" width="3" height="11" rx="0.5" />
        </svg>
        <svg width="15" height="11" viewBox="0 0 15 11" fill={color}>
          <path d="M7.5 11L4.5 8a4.5 4.5 0 0 1 6 0L7.5 11zM7.5 6.6a2.2 2.2 0 0 0-1.55.65L7.5 8.8l1.55-1.55A2.2 2.2 0 0 0 7.5 6.6zM2.2 5.7a7.5 7.5 0 0 1 10.6 0l-1.4 1.4a5.5 5.5 0 0 0-7.8 0L2.2 5.7zM0 3.5a10.5 10.5 0 0 1 15 0l-1.4 1.4a8.5 8.5 0 0 0-12.2 0L0 3.5z" />
        </svg>
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none">
          <rect x="0.5" y="0.5" width="22" height="11" rx="2.5" stroke={color} strokeOpacity="0.4" />
          <rect x="24" y="3.5" width="1.5" height="5" rx="0.6" fill={color} fillOpacity="0.4" />
          <rect x="2" y="2" width="19" height="8" rx="1.5" fill={color} />
        </svg>
      </span>
    </div>
  );
}

function HomeIndicator({ color }) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 8,
      display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 9,
    }}>
      <div style={{ width: 134, height: 5, borderRadius: 3, background: color }} />
    </div>
  );
}

// Tiny, monochrome icon set used by both directions. Each icon is 24×24.
function Icon({ name, size = 20, stroke = 'currentColor', fill = 'none', strokeWidth = 1.6 }) {
  const paths = {
    back: 'M15 4 L7 12 L15 20',
    close: 'M5 5 L19 19 M19 5 L5 19',
    menu: 'M4 7h16 M4 12h16 M4 17h16',
    more: 'M6 12h.01 M12 12h.01 M18 12h.01',
    send: 'M3 12 L21 4 L13 21 L11 13 L3 12 Z',
    mic: 'M12 3 a3 3 0 0 0-3 3v6 a3 3 0 0 0 6 0 V6 a3 3 0 0 0-3-3z M5 11 a7 7 0 0 0 14 0 M12 18 v3',
    phone: 'M5 4h4 l2 5 -2.5 1.5 a11 11 0 0 0 5 5 L15 13 l5 2 v4 a2 2 0 0 1-2 2 A16 16 0 0 1 3 6 a2 2 0 0 1 2-2z',
    history: 'M3 12 a9 9 0 1 0 3-6.7 M3 4 v4 h4 M12 7 v5 l3 2',
    user: 'M12 12 a4 4 0 1 0-.01-8 A4 4 0 0 0 12 12z M4 21 a8 8 0 0 1 16 0',
    plus: 'M12 5 v14 M5 12 h14',
    chevron: 'M9 6 l6 6 -6 6',
    chevronDown: 'M6 9 l6 6 6-6',
    lock: 'M6 11 V8 a6 6 0 0 1 12 0 v3 M5 11h14 v10 H5 z',
    check: 'M5 12 l5 5 L20 6',
    play: 'M7 5 v14 l12-7 z',
    pause: 'M7 5h4v14H7z M13 5h4v14h-4z',
    headphones: 'M4 14 V12 a8 8 0 0 1 16 0 v2 M4 14 v4 a2 2 0 0 0 2 2 h2 v-6 H4z M20 14 v4 a2 2 0 0 1-2 2 h-2 v-6 h4 z',
    book: 'M4 5 a2 2 0 0 1 2-2 h12 v18 H6 a2 2 0 0 1-2-2 z M4 5 v12 a2 2 0 0 1 2-2 h12',
    quote: 'M7 7 h4 v4 a4 4 0 0 1-4 4 M14 7 h4 v4 a4 4 0 0 1-4 4',
    copy: 'M9 4 h9 v13 H9 z M5 8 v12 h10',
    heart: 'M12 20 C 4 14 4 7 8.5 7 a3.5 3.5 0 0 1 3.5 2 a3.5 3.5 0 0 1 3.5-2 C 20 7 20 14 12 20 z',
    bookmark: 'M6 4 h12 v17 l-6-4 -6 4 z',
    refresh: 'M4 12 a8 8 0 0 1 14-5 M18 4 v3 h-3 M20 12 a8 8 0 0 1-14 5 M6 20 v-3 h3',
    sparkle: 'M12 3 l1.8 5.2 L19 10 l-5.2 1.8 L12 17 l-1.8-5.2 L5 10 l5.2-1.8 z',
    image: 'M4 5 h16 v14 H4z M4 16 l4-4 5 5 M14 12 l3-3 3 3 M17 9 a1 1 0 1 0 .01 0',
    audio: 'M9 18 V6 l9-3 v15 M9 14 a3 3 0 1 0-.01 0z M18 13 a3 3 0 1 0-.01 0z',
    video: 'M3 6 h12 v12 H3z M15 10 l6-3 v10 l-6-3 z',
    qr: 'M3 3 h7 v7 H3z M14 3 h7 v7 h-7z M3 14 h7 v7 H3z M14 14 h3 v3 h-3z M14 18 h3 M18 14 v3 M18 18 h3 v3 h-3z',
    share: 'M5 12 a3 3 0 1 0 6 0 a3 3 0 1 0-6 0z M13 6 a3 3 0 1 0 6 0 a3 3 0 1 0-6 0z M13 18 a3 3 0 1 0 6 0 a3 3 0 1 0-6 0z M8 11 l8-3 M8 13 l8 3',
    settings: 'M12 15 a3 3 0 1 0-.01 0z M19.4 12.6 l-1-1 a8 8 0 0 0 0-3 l1-1-2-3.4-1.4.6 a8 8 0 0 0-2.5-1.5 l-.5-1.3 h-3l-.5 1.3 a8 8 0 0 0-2.5 1.5 l-1.4-.6 -2 3.4 1 1 a8 8 0 0 0 0 3 l-1 1 2 3.4 1.4-.6 a8 8 0 0 0 2.5 1.5 l.5 1.3 h3 l.5-1.3 a8 8 0 0 0 2.5-1.5 l1.4 .6 z',
    chat: 'M4 5 a2 2 0 0 1 2-2 h12 a2 2 0 0 1 2 2 v9 a2 2 0 0 1-2 2 H10 l-5 4 v-4 H6 a2 2 0 0 1-2-2 z',
    crown: 'M4 8 l3 5 L12 7 l5 6 3-5 L18 19 H6 z',
    sources: 'M5 3 h11 l3 3 v15 H5 z M16 3 v3 h3 M8 11 h8 M8 14 h8 M8 17 h6',
    wave: 'M3 12 h2 M7 9 v6 M11 6 v12 M15 9 v6 M19 12 h2',
    pause2: 'M9 5 v14 M15 5 v14',
    kebab: 'M12 6 h.01 M12 12 h.01 M12 18 h.01',
    pdf: 'M6 3 h9 l3 3 v15 H6 z M15 3 v3 h3 M9 13 h6 M9 16 h6 M9 19 h4',
    timer: 'M12 13 m-8 0 a8 8 0 1 0 16 0 a8 8 0 1 0-16 0z M12 13 v-4 M9 3 h6',
  };
  const d = paths[name];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

// Filled circle indicator (record dot, etc.)
function Dot({ size = 8, color = '#c83a3a' }) {
  return <span style={{ display: 'inline-block', width: size, height: size, borderRadius: size / 2, background: color }} />;
}

// Section divider used inside long screens (e.g. paywall comparisons).
function Divider({ color = 'rgba(0,0,0,0.06)', vertical, length = '100%' }) {
  return vertical
    ? <div style={{ width: 1, height: length, background: color }} />
    : <div style={{ height: 1, width: length, background: color }} />;
}

Object.assign(window, { PhoneFrame, StatusBar, HomeIndicator, Icon, Dot, Divider, SHARED_PHONE_W, SHARED_PHONE_H });
