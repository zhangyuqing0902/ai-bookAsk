// ─────────────────────────────────────────────────────────────
// Direction B — 新潮 · 友好 · 奶白靛蓝
//
// AI 问书 / 中国医学临床百家 · 心血管分册（第 4 版）
//
// Visual DNA:
//  · 奶白底 #f6f4f0 · 深墨蓝 #14182a · 电光靛 #4f46e5 · 朝霞橙 #ff7a5c
//  · 思源黑体（Noto Sans SC）做全部排版，圆润可读；DM Serif 做大数字
//  · Agent 形象 = 圆润气泡 + "问"字，多模态卡片走"工具感 + 渐变光"
//  · 多模态、付费、电话语音都更有"AI 工具"的当下感（参照豆包 / Kimi 的语言）
// ─────────────────────────────────────────────────────────────

const B = {
  bg: '#f6f4f0',
  surface: '#ffffff',
  surface2: '#fbf9f4',
  ink: '#14182a',
  ink2: '#2c3046',
  muted: '#797d8c',
  subtle: '#c1c3cc',
  hairline: 'rgba(20,24,42,0.10)',
  hairline2: 'rgba(20,24,42,0.06)',
  indigo: '#4f46e5',
  indigoDeep: '#3730a3',
  indigoSoft: '#e7e8ff',
  coral: '#ff7a5c',
  coralSoft: '#ffe4dd',
  // ⚠ amber/green retired in v2 — mapped onto neutral or coral / indigo for visual consistency
  amber: '#ff7a5c',
  amberSoft: '#ffe4dd',
  green: '#797d8c',
  greenSoft: 'rgba(20,24,42,0.05)',
  neutralChip: 'rgba(20,24,42,0.05)',
  shadow: '0 1px 0 rgba(20,24,42,.04), 0 8px 28px rgba(20,24,42,.07)',
  glow: '0 6px 28px rgba(79,70,229,.28)',
  sans: '"Noto Sans SC", -apple-system, "PingFang SC", sans-serif',
  display: '"Manrope", "Noto Sans SC", sans-serif',
  mono: '"DM Mono", "SF Mono", monospace',
};

function BBubble({ size = 44, glow }) {
  return (
    <div style={{ filter: glow ? 'drop-shadow(0 8px 18px rgba(37,99,235,.35))' : undefined, lineHeight: 0 }}>
      <BrandMark size={size} />
    </div>
  );
}

function BTag({ kind, children, size = 11 }) {
  const map = {
    free:    { c: B.muted,  bg: 'rgba(20,24,42,0.05)' },
    member:  { c: B.indigo, bg: B.indigoSoft },
    forever: { c: B.coral,  bg: B.coralSoft },
    muted:   { c: B.muted,  bg: 'rgba(20,24,42,0.05)' },
  };
  const { c, bg } = map[kind] || map.muted;
  return (
    <span style={{
      fontSize: size, padding: '3px 8px', borderRadius: 99,
      color: c, background: bg, fontWeight: 500, letterSpacing: 0.2, whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

function BIcon({ name, size = 20, color = B.ink2 }) {
  return <Icon name={name} size={size} stroke={color} strokeWidth={1.7} />;
}

function BHeader({ left, title, sub, right, transparent }) {
  return (
    <div style={{
      paddingTop: 44, height: 92, padding: '50px 16px 0',
      display: 'flex', alignItems: 'center', gap: 8,
      background: transparent ? 'transparent' : B.bg, position: 'relative',
    }}>
      {left}
      <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
        <div style={{ fontFamily: B.sans, fontSize: 16, fontWeight: 600, color: B.ink, letterSpacing: 0.3, lineHeight: 1.1 }}>{title}</div>
        {sub && <div style={{ fontSize: 11, color: B.muted, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// B1 — 落地页 / 微信授权
// ─────────────────────────────────────────────────────────────
function B_Landing() {
  return (
    <PhoneFrame bg={B.bg} fontFamily={B.sans}>
      {/* top decorative gradient */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 360,
        background: `radial-gradient(ellipse at 50% 0%, ${B.indigoSoft}, transparent 70%), radial-gradient(ellipse at 100% 30%, ${B.coralSoft}88, transparent 60%)`, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', padding: '60px 24px 32px' }}>
        {/* publisher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 22, height: 22, borderRadius: 11, background: B.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>临</span>
          <span style={{ fontSize: 12, color: B.ink2, fontWeight: 500, letterSpacing: 0.5 }}>中国医学临床百家</span>
        </div>

        {/* hero */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 32 }}>
          <div style={{ alignSelf: 'flex-start' }}>
            <BBubble size={84} glow />
          </div>

          <div>
            <div style={{ fontFamily: B.display, fontSize: 36, fontWeight: 700, color: B.ink, letterSpacing: -0.5, lineHeight: 1.1 }}>
              你好 ， 我是<br />
              <span style={{ background: `linear-gradient(95deg, ${B.indigo}, ${B.coral})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>这本书的 AI 版作者</span>
            </div>
            <div style={{ fontSize: 14, color: B.muted, marginTop: 14, lineHeight: 1.7 }}>
              心血管分册 · 第 4 版<br />
              问你想问的，每一句都来自原书。
            </div>
          </div>

          {/* feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[
              '不限次数', '章节溯源', '图音视频', '永享买断',
            ].map((t) => { const c = B.indigo; return (
              <span key={t} style={{ fontSize: 12, padding: '6px 12px', borderRadius: 99,
                background: '#fff', border: `1px solid ${c}33`, color: c, fontWeight: 500 }}>· {t}</span>
            ); })}
          </div>
        </div>

        {/* CTA */}
        <div>
          <button style={{
            width: '100%', height: 52, border: 'none', borderRadius: 14,
            background: `linear-gradient(95deg, ${B.indigo}, ${B.indigoDeep})`,
            color: '#fff', fontSize: 15, fontWeight: 600, letterSpacing: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: B.glow, cursor: 'pointer',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 4C5.4 4 2 6.7 2 10.1c0 1.9 1 3.5 2.7 4.7l-.7 2.3 2.6-1.4c.7.2 1.5.3 2.3.3a8.6 8.6 0 0 0 1.5-.1A6 6 0 0 1 10 14c0-3.5 3.4-6.3 7.5-6.3.4 0 .7 0 1 .1A6.7 6.7 0 0 0 12 4.6 7.6 7.6 0 0 0 9.5 4z"/></svg>
            微信授权登录
          </button>
          <button style={{ width: '100%', height: 44, marginTop: 8, border: 'none', background: 'transparent',
            color: B.ink2, fontSize: 13.5, fontWeight: 500 }}>
            手机号登录  ·  使用兑换码
          </button>
          <div style={{ marginTop: 8, fontSize: 10.5, color: B.muted, textAlign: 'center', lineHeight: 1.7 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 13, height: 13, borderRadius: 3, background: B.indigo, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="check" size={9} stroke="#fff" strokeWidth={2.6} />
              </span>
              已阅读并同意<span style={{ color: B.indigo }}>《用户协议》</span>与<span style={{ color: B.indigo }}>《隐私政策》</span>
            </span>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// B Multimodal asset card — clean, iOS-tool feel
// ─────────────────────────────────────────────────────────────
function BModalCard({ kind, type, title, meta, locked, price }) {
  const isImage = type === 'image', isAudio = type === 'audio', isVideo = type === 'video';
  return (
    <div style={{
      flex: '0 0 154px', background: B.surface, borderRadius: 14,
      boxShadow: '0 1px 0 rgba(20,24,42,.04), 0 4px 14px rgba(20,24,42,.05)',
      overflow: 'hidden', position: 'relative',
    }}>
      <div style={{
        height: 96, position: 'relative', overflow: 'hidden',
        background: isImage ? `linear-gradient(135deg, ${B.indigoSoft}, ${B.coralSoft})`
          : isVideo ? `linear-gradient(160deg, #0f172a, #1e293b)`
          : `linear-gradient(135deg, ${B.indigoSoft}, #c5d0ff)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isImage && (
          <svg width="100%" height="100%" viewBox="0 0 154 96" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, opacity: 0.55 }}>
            <circle cx="32" cy="56" r="20" fill={B.indigo} opacity="0.6" />
            <circle cx="100" cy="40" r="28" fill={B.coral} opacity="0.55" />
            <circle cx="120" cy="78" r="14" fill={B.ink2} opacity="0.35" />
          </svg>
        )}
        {isAudio && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 32 }}>
            {[10, 18, 26, 14, 28, 16, 22, 12, 24, 18].map((h, i) => (
              <span key={i} style={{ width: 3, height: h, borderRadius: 2, background: B.indigo, opacity: 0.5 + (i % 3) * 0.15 }} />
            ))}
          </div>
        )}
        {isVideo && (
          <div style={{ width: 38, height: 38, borderRadius: 19, background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,.3)' }}>
            <Icon name="play" size={16} fill={B.ink} stroke="none" />
          </div>
        )}
        {locked && (
          <>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,24,42,0.42)', backdropFilter: 'blur(3px)' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 32, height: 32, borderRadius: 16, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="lock" size={14} stroke={B.ink} strokeWidth={1.8} />
            </div>
          </>
        )}
        <div style={{ position: 'absolute', top: 8, left: 8 }}>
          <BTag kind={kind === 'free' ? 'free' : kind === 'member' ? 'member' : 'forever'}>{kind === 'free' ? '免费' : kind === 'member' ? '会员' : '永享'}</BTag>
        </div>
        {meta && (
          <div style={{ position: 'absolute', bottom: 7, right: 7, fontSize: 10, fontFamily: B.mono, color: '#fff',
            background: 'rgba(20,24,42,.7)', padding: '2px 6px', borderRadius: 4, letterSpacing: 0.3 }}>{meta}</div>
        )}
      </div>
      <div style={{ padding: '10px 12px 12px' }}>
        <div style={{ fontSize: 12.5, fontWeight: 500, color: B.ink, lineHeight: 1.45,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 36 }}>
          {title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 10.5, color: B.muted, letterSpacing: 0.3 }}>
            {type === 'image' ? '图谱' : type === 'audio' ? '音频' : '视频'}
          </span>
          {price && <span style={{ fontSize: 11.5, color: B.indigo, fontWeight: 700, fontFamily: B.display }}>¥{price}</span>}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// B2 — AI 会话主页面
// ─────────────────────────────────────────────────────────────
function B_Conversation() {
  return (
    <PhoneFrame bg={B.bg} fontFamily={B.sans}>
      {/* header */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 92, paddingTop: 50, padding: '52px 12px 0',
        background: B.bg + 'f0', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 6, zIndex: 5,
        borderBottom: `1px solid ${B.hairline2}` }}>
        <span style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: B.ink2 }}>
          <Icon name="back" size={22} />
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1, minWidth: 0 }}>
          <BBubble size={32} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: B.ink, lineHeight: 1.15 }}>
              心血管分册 · AI 版
            </div>
            <div style={{ fontSize: 10, color: B.muted, marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: 3, background: B.indigo }} /> 在线 · 思考速度 · 深度
            </div>
          </div>
        </div>
        <span style={{ width: 36, height: 36, borderRadius: 18, background: `linear-gradient(135deg, ${B.indigo}, ${B.indigoDeep})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(79,70,229,.3)' }}>
          <Icon name="phone" size={16} stroke="#fff" />
        </span>
        <span style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: B.ink2 }}>
          <Icon name="kebab" size={20} />
        </span>
      </div>

      <div style={{ position: 'absolute', top: 92, bottom: 96, left: 0, right: 0, overflow: 'hidden' }}>
        {/* aurora glow */}
        <div style={{ position: 'absolute', top: -40, left: -40, right: -40, height: 280, pointerEvents: 'none',
          background: `radial-gradient(60% 70% at 25% 30%, ${B.indigoSoft} 0%, transparent 60%), radial-gradient(50% 60% at 90% 10%, ${B.coralSoft} 0%, transparent 65%)`,
          opacity: 0.7, filter: 'blur(2px)' }} />
        <div style={{ padding: '20px 18px 20px', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative' }}>

          <div style={{ alignSelf: 'center', fontSize: 10.5, color: B.muted, fontFamily: B.mono, letterSpacing: 0.5 }}>
            05.08  09:41
          </div>

          {/* welcome */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <BBubble size={28} />
            <div style={{ flex: 1, background: `linear-gradient(135deg, ${B.indigoSoft}, #f0eefe)`, borderRadius: '4px 16px 16px 16px',
              padding: '11px 13px', fontSize: 12.5, color: B.ink, lineHeight: 1.7 }}>
              你好 👋 我是《心血管分册》的 AI 版。可以问我抗凝、心电图、PCI 时间窗这些临床细节 ——
            </div>
          </div>

          {/* user q */}
          <div style={{ alignSelf: 'flex-end', maxWidth: '78%' }}>
            <div style={{ background: B.ink, color: '#fff', borderRadius: '16px 4px 16px 16px',
              padding: '11px 14px', fontSize: 13.5, lineHeight: 1.55 }}>
              冠脉造影术前的抗凝管理怎么做？患者长期服用华法林。
            </div>
          </div>

          {/* AI block */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: B.muted, fontSize: 11 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 99, background: B.indigoSoft, color: B.indigo, fontWeight: 500 }}>
                <Icon name="sparkle" size={11} stroke={B.indigo} strokeWidth={2} /> 深度思考
              </span>
              <span style={{ fontFamily: B.mono }}>· 检索 4 章 · 1.8s</span>
            </div>

            <div style={{ background: B.surface, borderRadius: 16, padding: '14px',
              boxShadow: B.shadow }}>
              <div style={{ fontSize: 13.5, lineHeight: 1.85, color: B.ink, letterSpacing: 0.1 }}>
                <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 6, background: B.coralSoft, color: B.coral, fontSize: 11, fontWeight: 600, marginBottom: 8 }}>核心结论</span>
                <div style={{ marginTop: 6, fontWeight: 500 }}>双向评估出血与血栓风险，按风险分层处理。</div>
                <div style={{ marginTop: 8, color: B.ink2 }}>
                  · 长期口服华法林：术前 3–5 天停药，<span style={{ color: B.indigo, fontWeight: 500 }}>INR ≤ 1.5</span> 后行造影；<br />
                  · 高血栓风险（机械瓣 / 近 3 月血栓）需 <span style={{ color: B.indigo, fontWeight: 500 }}>低分子肝素桥接</span>；<br />
                  · 经桡动脉路径的诊断性造影，<span style={{ color: B.indigo, fontWeight: 500 }}>INR &lt; 3.0 时可不停药</span><span style={{ verticalAlign: 'super', fontSize: 9, color: B.indigo, fontWeight: 600, marginLeft: 1 }}>[3]</span>。
                </div>
                <span style={{ display: 'inline-block', width: 6, height: 14, background: B.indigo, marginLeft: 2, verticalAlign: '-3px' }} />
              </div>
            </div>

            {/* multimodal cards */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: B.ink }}>📎 配套素材 · 3</span>
                <span style={{ fontSize: 10.5, color: B.muted }}>横滑查看 ›</span>
              </div>
              <div style={{ display: 'flex', gap: 9, overflowX: 'auto', margin: '0 -14px', padding: '0 14px 4px' }} className="ab-scroll">
                <BModalCard kind="free" type="audio" title="编者讲解 · 抗栓评估总思路" meta="2:48" />
                <BModalCard kind="member" type="image" title="冠脉解剖图谱 · 高清" meta="P12" locked />
                <BModalCard kind="forever" type="video" title="桡动脉造影手术示教" meta="14:22" locked price="29" />
              </div>
            </div>

            {/* sources */}
            <div style={{ background: B.surface, borderRadius: 12, padding: '11px 13px',
              border: `1px solid ${B.hairline2}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 28, height: 28, borderRadius: 8, background: B.indigoSoft, color: B.indigo, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="sources" size={14} stroke={B.indigo} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: B.ink }}>5 处出处 · 来自第 4、7 章</div>
                <div style={{ fontSize: 10.5, color: B.muted, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  §4.2 抗栓药物围术期管理 · §7.1 桡动脉路径
                </div>
              </div>
              <Icon name="chevronDown" size={14} stroke={B.muted} />
            </div>

            {/* follow-ups */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: B.ink, marginBottom: 7 }}>💡 你也可以问</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  ['支架植入后双抗 DAPT 持续多久？', B.indigo],
                  ['造影剂过敏的预案与抢救流程？', B.indigo],
                  ['INR &gt; 3.0 急诊造影怎么办？', B.coral],
                ].map(([t, c]) => (
                  <div key={t} style={{ background: B.surface, border: `1px solid ${B.hairline2}`,
                    borderLeft: `3px solid ${c}`, borderRadius: 10,
                    padding: '9px 12px', fontSize: 12.5, color: B.ink2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span dangerouslySetInnerHTML={{ __html: t }} />
                    <Icon name="chevron" size={12} stroke={c} />
                  </div>
                ))}
              </div>
            </div>

            {/* TTS bar */}
            <div style={{ background: B.surface, borderRadius: 14, padding: '8px 10px',
              display: 'flex', alignItems: 'center', gap: 10, boxShadow: B.shadow }}>
              <span style={{ width: 30, height: 30, borderRadius: 15, background: B.indigo, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="play" size={12} fill="#fff" stroke="none" />
              </span>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.5, height: 18 }}>
                {Array.from({ length: 32 }).map((_, i) => {
                  const h = 4 + Math.abs(Math.sin(i * 0.7)) * 12;
                  return <span key={i} style={{ width: 2.5, height: h, borderRadius: 1.5, background: i < 11 ? B.indigo : B.subtle }} />;
                })}
              </div>
              <span style={{ fontSize: 10.5, color: B.muted, fontFamily: B.mono }}>0:08</span>
              <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: B.bg, color: B.ink2, fontWeight: 500 }}>1.0×</span>
            </div>

            {/* actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
              <div style={{ display: 'flex', gap: 18, color: B.muted }}>
                <Icon name="copy" size={16} stroke={B.muted} />
                <Icon name="heart" size={16} stroke={B.muted} />
                <Icon name="bookmark" size={16} stroke={B.muted} />
                <Icon name="refresh" size={16} stroke={B.muted} />
              </div>
              <span style={{ fontSize: 10.5, color: B.muted, fontFamily: B.mono }}>3 / 5</span>
            </div>

            {/* extension bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px',
              background: `linear-gradient(95deg, ${B.indigoSoft}, ${B.coralSoft})`,
              borderRadius: 12, position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: '#0f172a',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="play" size={14} fill={B.coral} stroke="none" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10.5, color: B.muted }}>本回答含 <span style={{ color: B.indigo, fontWeight: 600 }}>1 项永享</span></div>
                <div style={{ fontSize: 12.5, color: B.ink, fontWeight: 500, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  桡动脉造影示教视频包 · 14 段
                </div>
              </div>
              <button style={{ background: B.ink, color: '#fff', border: 'none', borderRadius: 99,
                padding: '7px 13px', fontSize: 11.5, fontWeight: 600, fontFamily: B.display }}>¥29 永享</button>
            </div>
          </div>
        </div>
      </div>

      {/* input */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0,
        background: B.surface, borderTop: `1px solid ${B.hairline2}`,
        padding: '10px 12px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: B.muted, marginBottom: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: B.indigoSoft, color: B.indigo, fontWeight: 500 }}>
            <Icon name="sparkle" size={11} stroke={B.indigo} /> 深度
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: B.neutralChip, color: B.muted, fontWeight: 500 }}>
            <Dot color={B.muted} size={5} /> 联网
          </span>
          <span style={{ flex: 1 }} />
          <span>500 字</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 38, height: 38, borderRadius: 19, background: B.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: B.ink2 }}>
            <Icon name="plus" size={18} />
          </span>
          <div style={{ flex: 1, height: 38, background: B.bg, borderRadius: 19, display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 13, color: B.subtle }}>
            向 AI 提问 ……
          </div>
          <span style={{ width: 38, height: 38, borderRadius: 19, background: B.indigo, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(79,70,229,.3)' }}>
            <Icon name="mic" size={18} stroke="#fff" />
          </span>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// B3 — 多模态卡片锁标 → 付费墙弹窗（底部抽屉）
// ─────────────────────────────────────────────────────────────
function B_Paywall() {
  return (
    <PhoneFrame bg={B.bg} fontFamily={B.sans}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.35 }}><B_Conversation /></div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,24,42,0.55)', backdropFilter: 'blur(2px)' }} />

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0,
        background: B.bg, borderRadius: '24px 24px 0 0', padding: '14px 18px 28px',
        boxShadow: '0 -10px 40px rgba(0,0,0,.18)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: B.subtle }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, background: B.indigoSoft, color: B.indigo, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="lock" size={17} stroke={B.indigo} strokeWidth={2} />
            </span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: B.ink }}>解锁这张<span style={{ color: B.indigo }}>会员图谱</span></div>
              <div style={{ fontSize: 11, color: B.muted, marginTop: 2 }}>选一种方式 · 都能立刻看到</div>
            </div>
          </div>
          <span style={{ width: 30, height: 30, borderRadius: 15, background: B.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', color: B.muted }}>
            <Icon name="close" size={14} />
          </span>
        </div>

        {/* asset preview */}
        <div style={{ display: 'flex', gap: 10, padding: 10, background: B.surface, borderRadius: 12, marginBottom: 14, boxShadow: B.shadow }}>
          <div style={{ width: 56, height: 56, borderRadius: 8, background: `linear-gradient(135deg, ${B.indigoSoft}, ${B.coralSoft})`, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,24,42,.4)', backdropFilter: 'blur(2px)' }} />
            <Icon name="lock" size={14} stroke="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: B.ink }}>冠脉解剖图谱 · 高清</div>
            <div style={{ fontSize: 10.5, color: B.muted, marginTop: 3 }}>《心血管分册》P12 · 4096×2730px</div>
            <div style={{ marginTop: 5 }}><BTag kind="member">机构标注 · 会员素材</BTag></div>
          </div>
        </div>

        {/* path 1 — member */}
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <div style={{ position: 'absolute', top: -8, left: 14, background: `linear-gradient(95deg, ${B.indigo}, ${B.indigoDeep})`, color: '#fff', fontSize: 9.5, fontWeight: 600, padding: '3px 9px', borderRadius: 6, letterSpacing: 0.5, boxShadow: '0 2px 6px rgba(79,70,229,.3)' }}>性价比推荐 ✨</div>
          <div style={{ background: B.surface, border: `1.5px solid ${B.indigo}`, borderRadius: 14, padding: '18px 16px 14px', boxShadow: B.glow }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Icon name="crown" size={18} fill={B.coral} stroke={B.coral} />
                <span style={{ fontSize: 15, fontWeight: 600, color: B.ink }}>升级 AI 会员</span>
              </div>
              <div>
                <span style={{ fontFamily: B.display, fontSize: 24, fontWeight: 800, color: B.indigo, letterSpacing: -0.5 }}>¥9.9</span>
                <span style={{ fontSize: 11, color: B.muted, marginLeft: 4 }}>首月</span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: B.ink2, marginTop: 8, lineHeight: 1.7 }}>
              · 解锁本机构全部<span style={{ color: B.indigo, fontWeight: 500 }}>会员图 / 音 / 视频</span><br />
              · 实时电话语音 + 数字人不限时<br />
              · 续期 ¥18/月 · 随时取消
            </div>
          </div>
        </div>

        {/* path 2 — single */}
        <div style={{ background: B.surface, border: `1px solid ${B.hairline2}`, borderRadius: 14, padding: '14px 16px', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <Icon name="bookmark" size={17} stroke={B.coral} strokeWidth={2} />
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: B.ink }}>单品永享</div>
                <div style={{ fontSize: 10.5, color: B.muted, marginTop: 2 }}>只买这一张图 · 永久收藏</div>
              </div>
            </div>
            <span style={{ fontFamily: B.display, fontSize: 21, fontWeight: 800, color: B.ink }}>¥6</span>
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: B.coral, background: B.coralSoft, padding: '6px 10px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="check" size={11} stroke={B.coral} strokeWidth={2.4} />
            买断永久 · 会员到期也能看
          </div>
        </div>

        {/* path 3 — code */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: B.surface, borderRadius: 14, marginBottom: 14, border: `1px solid ${B.hairline2}` }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: B.ink2 }}>
            <Icon name="qr" size={14} stroke={B.muted} />
            机构发了兑换码？
          </span>
          <span style={{ fontSize: 12, color: B.indigo, fontWeight: 600 }}>立即兑换 ›</span>
        </div>

        <div style={{ fontSize: 10.5, color: B.muted, textAlign: 'center', lineHeight: 1.7 }}>
          继续即代表同意<span style={{ color: B.indigo }}>《会员服务协议》</span> · 微信支付
        </div>
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// B4 — AI 会员订阅页
// ─────────────────────────────────────────────────────────────
function B_Membership() {
  return (
    <PhoneFrame bg={B.bg} fontFamily={B.sans}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 280,
        background: `linear-gradient(160deg, #4f46e5 0%, #6366f1 50%, ${B.bg} 95%)` }} />

      <BHeader transparent
        left={<span style={{ width: 36, height: 36, borderRadius: 18, background: 'rgba(255,255,255,.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="back" size={18} stroke="#fff" /></span>}
        title={<span style={{ color: '#fff' }}>AI 会员</span>}
        right={<span style={{ width: 36, height: 36, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="kebab" size={18} stroke="#fff" /></span>}
      />

      <div style={{ position: 'absolute', top: 96, bottom: 100, left: 0, right: 0, overflow: 'hidden' }}>
        <div style={{ padding: '0 18px 16px' }}>

          <div style={{ color: '#fff', textAlign: 'center', marginTop: 8, marginBottom: 24 }}>
            <BBubble size={56} glow />
            <div style={{ fontFamily: B.display, fontSize: 26, fontWeight: 700, marginTop: 14, letterSpacing: -0.3 }}>解锁这本书的<br />全部声音与影像</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.75)', marginTop: 8 }}>文字答案永远免费 · 会员仅解锁多模态</div>
          </div>

          {/* plans */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { tag: '推荐 · 省 ¥48', name: '年度会员', sub: '日均 ¥0.46', price: '168', orig: '216', period: '年', best: true },
              { tag: '首月特惠', name: '月度会员', sub: '续期 ¥18/月', price: '9.9', orig: '18', period: '月', best: false },
              { tag: null, name: '季度会员', sub: '续期 ¥49/季', price: '49', orig: '54', period: '季', best: false },
            ].map((p, i) => (
              <div key={i} style={{
                background: B.surface, borderRadius: 16,
                border: `${p.best ? 1.5 : 1}px solid ${p.best ? B.indigo : B.hairline2}`,
                padding: '14px 16px', position: 'relative',
                boxShadow: p.best ? B.glow : B.shadow,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                {p.tag && (
                  <span style={{ position: 'absolute', top: -10, left: 14, background: p.best ? B.coral : B.ink, color: '#fff', fontSize: 9.5, padding: '3px 9px', borderRadius: 6, fontWeight: 600, letterSpacing: 0.3 }}>{p.tag}</span>
                )}
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: B.ink }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: B.muted, marginTop: 3 }}>{p.sub}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div>
                    <span style={{ fontFamily: B.display, fontSize: 24, fontWeight: 800, color: p.best ? B.indigo : B.ink, letterSpacing: -0.5 }}>¥{p.price}</span>
                    <span style={{ fontSize: 11, color: B.muted, marginLeft: 3 }}>/{p.period}</span>
                  </div>
                  <div style={{ fontSize: 10, color: B.muted, textDecoration: 'line-through', fontFamily: B.mono }}>¥{p.orig}</div>
                </div>
              </div>
            ))}
          </div>

          {/* benefits grid */}
          <div style={{ marginTop: 20, fontSize: 13, fontWeight: 600, color: B.ink, marginBottom: 12 }}>会员权益 ✨</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              ['image', '高清图谱', '1248 张', B.indigo],
              ['headphones', '编者音频', '320 段', B.indigo],
              ['phone', '电话语音', '不限时', B.coral],
              ['sparkle', '深度思考', '优先排队', B.indigo],
            ].map(([ic, t, sub, c]) => (
              <div key={t} style={{ background: B.surface, borderRadius: 14, padding: '12px 14px', boxShadow: B.shadow }}>
                <span style={{ width: 32, height: 32, borderRadius: 8, background: c + '22', color: c, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={ic} size={16} stroke={c} strokeWidth={1.8} />
                </span>
                <div style={{ fontSize: 13, fontWeight: 600, color: B.ink, marginTop: 9 }}>{t}</div>
                <div style={{ fontSize: 10.5, color: B.muted, marginTop: 2 }}>{sub}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 10.5, color: B.muted, marginTop: 16, lineHeight: 1.7, padding: '0 2px' }}>
            随时在「我的 — 会员」取消，到期前 24 小时短信提醒。继续即同意<span style={{ color: B.indigo }}>《会员服务协议》</span>。
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px 28px', background: B.bg }}>
        <button style={{ width: '100%', height: 50, border: 'none', borderRadius: 14,
          background: `linear-gradient(95deg, ${B.indigo}, ${B.indigoDeep})`, color: '#fff',
          fontSize: 15, fontWeight: 600, letterSpacing: 1, boxShadow: B.glow }}>
          ¥168 开通年度会员
        </button>
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// B5 — 实时电话式语音页
// ─────────────────────────────────────────────────────────────
function B_Call() {
  return (
    <PhoneFrame bg="#0f0f1c" fontFamily={B.sans} dark statusColor="#fff">
      <div style={{ position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 50% 40%, rgba(99,102,241,.45) 0%, transparent 55%), radial-gradient(circle at 80% 80%, rgba(255,122,92,.25), transparent 55%)` }} />

      <div style={{ position: 'absolute', top: 60, left: 0, right: 0, textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: 3, fontFamily: B.mono }}>· LIVE · 电话中 ·</div>
        <div style={{ fontSize: 18, fontWeight: 600, marginTop: 10 }}>心血管分册 · AI 版</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4, fontFamily: B.mono, letterSpacing: 2 }}>02 : 34</div>
      </div>

      {/* central avatar with rings */}
      <div style={{ position: 'absolute', top: 196, left: 0, right: 0, height: 280, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {[140, 110, 80].map((r, i) => (
          <div key={r} style={{ position: 'absolute', width: r * 2, height: r * 2, borderRadius: '50%',
            border: `1.5px solid rgba(255,255,255,${0.12 - i * 0.03})`, background: `radial-gradient(circle, rgba(99,102,241,${0.05 + i * 0.04}), transparent 70%)` }} />
        ))}
        {/* waveform circle */}
        <svg width="200" height="200" viewBox="-100 -100 200 200" style={{ position: 'absolute' }}>
          {Array.from({ length: 64 }).map((_, i) => {
            const a = (i / 64) * Math.PI * 2;
            const baseR = 86;
            const amp = 4 + Math.abs(Math.sin(i * 0.55 + 0.3)) * 18;
            const x1 = Math.cos(a) * baseR, y1 = Math.sin(a) * baseR;
            const x2 = Math.cos(a) * (baseR + amp), y2 = Math.sin(a) * (baseR + amp);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={i < 22 ? B.coral : '#a5b4fc'} strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.8" />;
          })}
        </svg>
        <BBubble size={120} glow />
      </div>

      {/* live transcript */}
      <div style={{ position: 'absolute', top: 504, left: 28, right: 28, textAlign: 'center', color: 'rgba(255,255,255,0.92)', fontSize: 14, lineHeight: 1.7 }}>
        "造影后即可恢复华法林口服，<br />一般同日或次日恢复至原维持剂量……"
      </div>

      {/* status pill */}
      <div style={{ position: 'absolute', top: 596, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 99,
          padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}>
          <Dot color={B.coral} size={6} />
          AI 在说话 · 你可以随时插话
        </div>
      </div>

      {/* controls */}
      <div style={{ position: 'absolute', bottom: 70, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '0 30px' }}>
        {[
          { ic: 'audio', label: '切音色' },
          { ic: 'mic', label: '静音' },
          { ic: 'phone', label: '挂断', danger: true },
        ].map((c, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ width: c.danger ? 64 : 56, height: c.danger ? 64 : 56,
              borderRadius: c.danger ? 32 : 28,
              background: c.danger ? B.coral : 'rgba(255,255,255,0.10)',
              border: c.danger ? 'none' : '1px solid rgba(255,255,255,0.15)',
              boxShadow: c.danger ? '0 6px 24px rgba(255,122,92,.45)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: c.danger ? 'rotate(135deg)' : 'none' }}>
              <Icon name={c.ic} size={c.danger ? 26 : 22} stroke="#fff" strokeWidth={1.8} />
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>{c.label}</span>
          </div>
        ))}
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// B6 — 我的主页
// ─────────────────────────────────────────────────────────────
function B_Profile() {
  return (
    <PhoneFrame bg={B.bg} fontFamily={B.sans}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 240,
        background: `radial-gradient(ellipse at 30% 0%, ${B.indigoSoft} 0%, transparent 60%), radial-gradient(ellipse at 100% 30%, ${B.coralSoft}66, transparent 70%)` }} />

      <div style={{ position: 'absolute', top: 50, right: 16, display: 'flex', gap: 6 }}>
        <span style={{ width: 34, height: 34, borderRadius: 17, background: 'rgba(255,255,255,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
          <Icon name="settings" size={16} stroke={B.ink2} />
        </span>
        <span style={{ width: 34, height: 34, borderRadius: 17, background: 'rgba(255,255,255,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
          <Icon name="qr" size={16} stroke={B.ink2} />
        </span>
      </div>

      <div style={{ position: 'absolute', top: 60, left: 22, fontFamily: B.display, fontSize: 28, fontWeight: 700, color: B.ink, letterSpacing: -0.5 }}>
        我的
      </div>

      <div style={{ position: 'absolute', top: 110, bottom: 90, left: 0, right: 0, overflow: 'hidden' }}>
        <div style={{ padding: '0 18px 24px' }}>

          {/* profile card */}
          <div style={{ background: B.surface, borderRadius: 18, padding: '16px', boxShadow: B.shadow }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg, ${B.indigo}, ${B.coral})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, fontFamily: B.display }}>陈</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 600, color: B.ink }}>陈医生</div>
                <div style={{ fontSize: 11, color: B.muted, marginTop: 3, fontFamily: B.mono }}>+86 138 **** 4421</div>
              </div>
              <Icon name="chevron" size={14} stroke={B.muted} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '9px 11px', background: B.bg, borderRadius: 10, fontSize: 11.5, color: B.ink2 }}>
              <Icon name="book" size={13} stroke={B.indigo} strokeWidth={1.8} />
              <span style={{ flex: 1 }}>当前机构 · <span style={{ fontWeight: 600 }}>中国医学临床百家</span></span>
              <span style={{ fontSize: 11, color: B.indigo, fontWeight: 500 }}>切换 ›</span>
            </div>
          </div>

          {/* member card */}
          <div style={{ marginTop: 12, borderRadius: 18, padding: '16px', position: 'relative', overflow: 'hidden',
            background: `linear-gradient(135deg, ${B.indigo} 0%, ${B.indigoDeep} 100%)`, color: '#fff', boxShadow: B.glow }}>
            <div style={{ position: 'absolute', top: -20, right: -10, width: 140, height: 140, borderRadius: '50%', background: `radial-gradient(circle, ${B.coral}55, transparent 70%)` }} />
            <div style={{ position: 'absolute', top: 12, right: 14, opacity: 0.6 }}>
              <BBubble size={36} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="crown" size={15} fill={B.coral} stroke={B.coral} />
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.5 }}>AI 会员 · 月度</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginTop: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.65)' }}>有效期至</div>
                <div style={{ fontFamily: B.display, fontSize: 18, fontWeight: 700, marginTop: 2, letterSpacing: 0.5 }}>2026.05.30</div>
              </div>
              <div style={{ flex: 1 }} />
              <button style={{ background: '#fff', color: B.indigo, border: 'none', padding: '7px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>续费 ¥9.9</button>
            </div>
          </div>

          {/* stats */}
          <div style={{ marginTop: 12, background: B.surface, borderRadius: 16, display: 'flex', boxShadow: B.shadow }}>
            {[
              ['12', '已永享', B.coral],
              ['28', '历史会话', B.ink],
              ['14', '我的收藏', B.ink],
            ].map(([n, l, c], i, a) => (
              <div key={l} style={{ flex: 1, padding: '14px 0', textAlign: 'center',
                borderRight: i < a.length - 1 ? `1px solid ${B.hairline2}` : 'none' }}>
                <div style={{ fontFamily: B.display, fontSize: 22, fontWeight: 800, color: c, lineHeight: 1, letterSpacing: -0.5 }}>{n}</div>
                <div style={{ fontSize: 11, color: B.muted, marginTop: 5 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* menu */}
          <div style={{ marginTop: 12, background: B.surface, borderRadius: 16, overflow: 'hidden', boxShadow: B.shadow }}>
            {[
              ['bookmark', '永享列表', '12 项 · 7 张图 · 4 段视频 · 1 段音频', B.coral],
              ['history', '历史会话', '90 天 · 28 条', B.ink2],
              ['heart', '我的收藏', '14 条答案', B.ink2],
              ['pdf', '订单中心', '会员 / 永享 / 兑换码', B.ink2],
              ['phone', '联系客服', '机构企微 · 个微 · 电话', B.indigo],
              ['settings', '账号设置', '手机号 · 隐私 · 通知', B.muted],
            ].map(([ic, t, sub, c], i, a) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px',
                borderBottom: i < a.length - 1 ? `1px solid ${B.hairline2}` : 'none' }}>
                <span style={{ width: 32, height: 32, borderRadius: 9, background: c + '1a', color: c,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={ic} size={15} stroke={c} strokeWidth={1.8} />
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, color: B.ink, fontWeight: 500 }}>{t}</div>
                  <div style={{ fontSize: 10.5, color: B.muted, marginTop: 1 }}>{sub}</div>
                </div>
                <Icon name="chevron" size={13} stroke={B.subtle} />
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, fontSize: 10, color: B.subtle, textAlign: 'center', fontFamily: B.mono, letterSpacing: 1 }}>
            AI 问书  v 4.0.2
          </div>
        </div>
      </div>

      {/* tabbar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 76, paddingBottom: 18,
        background: B.surface + 'f0', backdropFilter: 'blur(12px)', borderTop: `1px solid ${B.hairline2}`,
        display: 'flex' }}>
        {[
          ['chat', '问书', false],
          ['history', '历史', false],
          ['user', '我的', true],
        ].map(([ic, l, on]) => (
          <div key={l} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, color: on ? B.indigo : B.muted }}>
            <Icon name={ic} size={20} stroke={on ? B.indigo : B.muted} strokeWidth={on ? 2 : 1.6} />
            <span style={{ fontSize: 10.5, fontWeight: on ? 600 : 400 }}>{l}</span>
          </div>
        ))}
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// B7 — 历史会话详情（回看）
// ─────────────────────────────────────────────────────────────
function B_History() {
  return (
    <PhoneFrame bg={B.bg} fontFamily={B.sans}>
      <BHeader
        left={<span style={{ width: 36, height: 36, color: B.ink2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="back" size={20} /></span>}
        title="2026.04.18  09:41"
        sub="历史会话 · 回看模式"
        right={<span style={{ width: 36, height: 36, color: B.ink2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="share" size={18} /></span>}
      />

      <div style={{ position: 'absolute', top: 92, bottom: 88, left: 0, right: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 14px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: B.indigoSoft, borderRadius: 10, padding: '8px 12px', fontSize: 11, color: B.indigo, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Icon name="history" size={12} stroke={B.indigo} />
            历史回看 · 90 天内可访问 · 含 3 条往返
          </div>

          <div style={{ alignSelf: 'flex-end', maxWidth: '78%' }}>
            <div style={{ background: B.ink, color: '#fff', borderRadius: '16px 4px 16px 16px', padding: '11px 14px', fontSize: 13.5, lineHeight: 1.55 }}>
              心电图 ST 段抬高怎么快速判断是 STEMI？
            </div>
            <div style={{ fontSize: 10, color: B.muted, marginTop: 4, textAlign: 'right' }}>09:41</div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <BBubble size={28} />
            <div style={{ flex: 1, background: B.surface, borderRadius: '4px 16px 16px 16px', padding: '12px 14px', boxShadow: B.shadow }}>
              <div style={{ fontSize: 13, lineHeight: 1.85, color: B.ink }}>
                STEMI 的判定核心是相邻两个导联 ST 段抬高 ≥ 0.1 mV（V2-V3 男性 ≥ 0.2 mV，女性 ≥ 0.15 mV）<span style={{ verticalAlign: 'super', fontSize: 9, color: B.indigo }}>[1]</span>，并伴胸痛、动态心电图变化或心肌损伤标志物升高……
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                <BTag kind="muted">📑 3 处出处</BTag>
                <BTag kind="free">🎧 编者讲解 · 已听</BTag>
              </div>
            </div>
          </div>

          <div style={{ alignSelf: 'flex-end', maxWidth: '78%' }}>
            <div style={{ background: B.ink, color: '#fff', borderRadius: '16px 4px 16px 16px', padding: '11px 14px', fontSize: 13.5, lineHeight: 1.55 }}>
              直接 PCI 的时间窗是怎么定的？
            </div>
            <div style={{ fontSize: 10, color: B.muted, marginTop: 4, textAlign: 'right' }}>09:43</div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <BBubble size={28} />
            <div style={{ flex: 1, background: B.surface, borderRadius: '4px 16px 16px 16px', padding: '12px 14px', boxShadow: B.shadow }}>
              <div style={{ fontSize: 13, lineHeight: 1.85, color: B.ink }}>
                目标是首次医疗接触至导丝通过（FMC-to-Wire）<span style={{ color: B.indigo, fontWeight: 600 }}>≤ 90 分钟</span>。如果首诊于不能 PCI 的医院，120 分钟内能转诊到 PCI 中心则首选 PCI；否则启动溶栓……
              </div>
              <div style={{ marginTop: 10, padding: '9px 11px', background: B.bg, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ width: 30, height: 30, borderRadius: 7, background: `linear-gradient(135deg, ${B.indigoSoft}, ${B.coralSoft})` }} />
                <div style={{ flex: 1, fontSize: 11.5 }}>
                  <div style={{ color: B.ink, fontWeight: 500 }}>STEMI 救治时间窗示意图</div>
                  <div style={{ color: B.muted, fontSize: 10, marginTop: 2 }}>已永享 · 第 23 页</div>
                </div>
                <Icon name="chevron" size={12} stroke={B.muted} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px 24px', background: B.bg, borderTop: `1px solid ${B.hairline2}` }}>
        <button style={{ width: '100%', height: 46, border: 'none', borderRadius: 23,
          background: `linear-gradient(95deg, ${B.indigo}, ${B.indigoDeep})`,
          color: '#fff', fontSize: 14, fontWeight: 600, letterSpacing: 0.5,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: B.glow }}>
          <Icon name="chat" size={16} stroke="#fff" />
          基于这次对话继续追问
        </button>
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// B8 — 客服弹窗
// ─────────────────────────────────────────────────────────────
function B_Service() {
  return (
    <PhoneFrame bg={B.bg} fontFamily={B.sans}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.35 }}><B_Profile /></div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,24,42,0.5)', backdropFilter: 'blur(2px)' }} />

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0,
        background: B.bg, borderRadius: '24px 24px 0 0', padding: '14px 18px 30px',
        boxShadow: '0 -10px 40px rgba(0,0,0,.18)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: B.subtle }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 19, fontWeight: 700, color: B.ink, fontFamily: B.display }}>联系客服</div>
            <div style={{ fontSize: 11.5, color: B.muted, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="book" size={11} stroke={B.muted} /> 中国医学临床百家 · 客服中心
            </div>
          </div>
          <span style={{ width: 30, height: 30, borderRadius: 15, background: B.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', color: B.muted }}>
            <Icon name="close" size={14} />
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          {[
            { name: '企业微信', sub: '官方客服 · 工作日响应', label: '小张', accent: B.indigo },
            { name: '个人微信', sub: '订单 · 发票 · 售后', label: '小李', accent: B.coral },
          ].map((q) => (
            <div key={q.name} style={{ flex: 1, background: B.surface, borderRadius: 14, padding: '14px 12px', textAlign: 'center', boxShadow: B.shadow }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                <FakeQR size={104} label={q.label} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: B.ink }}>{q.name}</div>
              <div style={{ fontSize: 10.5, color: B.muted, marginTop: 3, lineHeight: 1.5 }}>{q.sub}</div>
              <div style={{ marginTop: 8, fontSize: 10.5, color: q.accent, fontWeight: 600 }}>长按保存图片</div>
            </div>
          ))}
        </div>

        <div style={{ background: B.surface, borderRadius: 14, padding: '4px 0', boxShadow: B.shadow }}>
          {[
            { ic: 'phone', label: '客服电话', value: '010 - 8888 6666', accent: B.indigo },
            { ic: 'sources', label: '客服邮箱', value: 'service@cmp-clinical.cn', accent: B.coral },
          ].map((row, i, a) => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', padding: '13px 14px', gap: 12,
              borderBottom: i < a.length - 1 ? `1px solid ${B.hairline2}` : 'none' }}>
              <span style={{ width: 32, height: 32, borderRadius: 9, background: row.accent + '1a', color: row.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={row.ic} size={15} stroke={row.accent} strokeWidth={1.8} />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: B.muted }}>{row.label}</div>
                <div style={{ fontSize: 14, color: B.ink, fontFamily: B.mono, marginTop: 2, letterSpacing: 0.4 }}>{row.value}</div>
              </div>
              <Icon name="chevron" size={13} stroke={B.muted} />
            </div>
          ))}
        </div>

        <div style={{ marginTop: 12, padding: '10px 12px', background: B.neutralChip, borderRadius: 10, fontSize: 11.5, color: B.muted, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="timer" size={13} stroke={B.muted} />
          <span>工作时间 · 周一至周五 09:00 — 18:00</span>
        </div>

        <div style={{ marginTop: 14, fontSize: 10.5, color: B.muted, textAlign: 'center' }}>
          所有客服信息由「中国医学临床百家」机构方提供
        </div>
      </div>
    </PhoneFrame>
  );
}

Object.assign(window, { B, BBubble, BTag, BIcon, BHeader, B_Landing, B_Conversation, BModalCard, B_Paywall, B_Membership, B_Call, B_Profile, B_History, B_Service });
