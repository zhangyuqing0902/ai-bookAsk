// ─────────────────────────────────────────────────────────────
// Direction C — 黑灰白 · 极简
// 只用 ink / 灰阶 / 单一描边强调 + 一抹深红仅作"危险/挂断"
// 字体：Manrope（拉丁）+ 思源黑体（中文），全等线、强密度对比
// 个性靠：留白、刻线、字号差、关键数字加粗 — 不靠彩色
// ─────────────────────────────────────────────────────────────

const C = {
  bg: '#f8f6f2',           // 更暖的米白，多一点呼吸
  surface: '#ffffff',
  surface2: '#efece6',
  ink: '#1c1815',          // 温润的炭黑（不是绝对黑）
  ink2: '#322d28',
  muted: '#7a736b',
  subtle: '#b3aca3',
  hairline: 'rgba(28,24,21,0.10)',
  hairline2: 'rgba(28,24,21,0.06)',
  rule: '#1c1815',
  danger: '#b8442e',        // 调温的深红
  sans: '"Noto Sans SC", -apple-system, "PingFang SC", sans-serif',
  display: '"Manrope", "Noto Sans SC", sans-serif',
  mono: '"DM Mono", "SF Mono", monospace',
  shadow: '0 1px 0 rgba(28,24,21,.03), 0 12px 32px -12px rgba(28,24,21,.18)',
  ctaBg: 'linear-gradient(180deg, #2a2520 0%, #1c1815 60%, #100d0b 100%)',
  ctaShadow: '0 14px 40px -12px rgba(28,24,21,.55), 0 1px 0 rgba(255,255,255,.08) inset, 0 0 0 1px rgba(255,255,255,.04) inset',
  warmGlow: 'radial-gradient(120% 80% at 50% 0%, rgba(255,236,210,0.55) 0%, rgba(255,236,210,0) 55%)',
};

function CMark({ size = 40 }) {
  return <BrandMark size={size} mono />;
}

function CTag({ kind, children }) {
  // free → outlined; member → solid black; forever → solid white-on-ink with hairline
  const styles = {
    free:    { c: C.ink2, bg: 'transparent', border: `1px solid ${C.hairline}` },
    member:  { c: '#fff',  bg: C.ink, border: 'none' },
    forever: { c: C.ink,  bg: '#fff', border: `1px solid ${C.ink}` },
    muted:   { c: C.muted, bg: C.surface2, border: 'none' },
  }[kind] || { c: C.muted, bg: 'transparent', border: 'none' };
  return (
    <span style={{
      fontSize: 10.5, padding: '3px 8px', borderRadius: 4,
      fontWeight: kind === 'free' ? 500 : 600, letterSpacing: 0.5, whiteSpace: 'nowrap',
      ...styles, color: styles.c, background: styles.bg, border: styles.border,
    }}>{children}</span>
  );
}

function CDivider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.muted, fontSize: 10, fontFamily: C.mono, letterSpacing: 2, textTransform: 'uppercase' }}>
      <span style={{ flex: 1, height: 1, background: C.hairline2 }} />
      {label && <span>{label}</span>}
      <span style={{ flex: 1, height: 1, background: C.hairline2 }} />
    </div>
  );
}

// ──── C1 · 落地 / 微信授权 ────
function C_Landing() {
  return (
    <PhoneFrame bg={C.bg} fontFamily={C.sans}>
      {/* warm light from top */}
      <div style={{ position: 'absolute', inset: 0, background: C.warmGlow, pointerEvents: 'none' }} />
      {/* a single subtle horizontal rule structure */}
      <div style={{ position: 'absolute', top: 60, left: 24, right: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 18, height: 18, background: C.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>临</span>
          <span style={{ fontSize: 11, color: C.ink2, fontWeight: 500 }}>中国医学临床百家</span>
        </div>
      </div>

      <div style={{ position: 'absolute', top: 110, left: 24, right: 24, bottom: 200 }}>
        <CMark size={72} />

        <div style={{ marginTop: 28, fontFamily: C.display, fontSize: 38, fontWeight: 800, color: C.ink, letterSpacing: -1.2, lineHeight: 1.05 }}>
          你好，<br />
          我是这本书的<br />
          AI 版作者。
        </div>

        <div style={{ marginTop: 16, fontSize: 13, color: C.muted, lineHeight: 1.7, letterSpacing: 0.2 }}>
          《心血管分册》第 4 版<br />
          问你想问的，每一句都来自原书。
        </div>

        {/* feature line */}
        <div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
          {['不限次数', '章节溯源', '图音视频', '永享买断'].map((t, i, a) => (
            <span key={t} style={{ fontSize: 12, color: C.ink2, display: 'inline-flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>0{i + 1}</span>
              <span>{t}</span>
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ position: 'absolute', bottom: 28, left: 24, right: 24 }}>
        <button style={{
          width: '100%', height: 54, border: 'none', borderRadius: 14,
          background: C.ctaBg, boxShadow: C.ctaShadow,
          color: '#fff', fontSize: 14.5, fontWeight: 600, letterSpacing: 1.4,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          微信授权登录
          <span style={{ width: 28, height: 1, background: '#fff' }} />
          <Icon name="chevron" size={14} stroke="#fff" strokeWidth={2} />
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: 11.5, color: C.muted }}>
          <span>手机号登录</span>
          <span>使用兑换码</span>
        </div>
        <div style={{ marginTop: 10, fontSize: 10, color: C.muted, lineHeight: 1.7, fontFamily: C.mono }}>
          ☐ 已阅读并同意《用户协议》《隐私政策》
        </div>
      </div>
    </PhoneFrame>
  );
}

// ──── Multimodal asset card (mono) ────
function CCard({ kind, type, title, meta, locked, price }) {
  const isImage = type === 'image', isAudio = type === 'audio', isVideo = type === 'video';
  return (
    <div style={{
      flex: '0 0 154px', background: C.surface,
      border: `1px solid ${C.hairline2}`, position: 'relative',
    }}>
      <div style={{
        height: 92, position: 'relative', overflow: 'hidden',
        background: isImage ? '#1a1a1a' : isVideo ? '#0a0a0a' : C.surface2,
        borderBottom: `1px solid ${C.hairline2}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isImage && (
          <svg width="100%" height="100%" viewBox="0 0 154 92" preserveAspectRatio="none">
            <line x1="0" y1="20" x2="154" y2="20" stroke="#fff" strokeOpacity="0.2" />
            <line x1="0" y1="46" x2="154" y2="46" stroke="#fff" strokeOpacity="0.2" />
            <line x1="0" y1="72" x2="154" y2="72" stroke="#fff" strokeOpacity="0.2" />
            <circle cx="50" cy="48" r="22" fill="none" stroke="#fff" strokeOpacity="0.65" />
            <path d="M 80 60 Q 100 30, 120 50 T 154 40" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.5" />
          </svg>
        )}
        {isAudio && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 30 }}>
            {[8, 14, 22, 12, 26, 14, 20, 10, 22, 16].map((h, i) => (
              <span key={i} style={{ width: 2.5, height: h, background: C.ink, opacity: 0.8 }} />
            ))}
          </div>
        )}
        {isVideo && (
          <div style={{ width: 36, height: 36, borderRadius: 18, border: '1.5px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="play" size={14} fill="#fff" stroke="none" />
          </div>
        )}
        {locked && (
          <>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.55)' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 28, height: 28, borderRadius: 14, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="lock" size={13} stroke={C.ink} strokeWidth={2} />
            </div>
          </>
        )}
        <div style={{ position: 'absolute', top: 7, left: 7 }}>
          <CTag kind={kind === 'free' ? 'free' : kind === 'member' ? 'member' : 'forever'}>{kind === 'free' ? '免费' : kind === 'member' ? '会员' : '永享'}</CTag>
        </div>
        {meta && (
          <div style={{ position: 'absolute', bottom: 7, right: 7, fontSize: 9.5, fontFamily: C.mono, color: '#fff',
            background: 'rgba(10,10,10,0.65)', padding: '1.5px 5px', letterSpacing: 0.4 }}>{meta}</div>
        )}
      </div>
      <div style={{ padding: '10px 12px 12px' }}>
        <div style={{ fontSize: 12.5, fontWeight: 500, color: C.ink, lineHeight: 1.45,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 36 }}>
          {title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 7 }}>
          <span style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: 1, textTransform: 'uppercase' }}>
            {type}
          </span>
          {price && <span style={{ fontFamily: C.display, fontSize: 12, color: C.ink, fontWeight: 700 }}>¥{price}</span>}
        </div>
      </div>
    </div>
  );
}

// ──── C2 · 会话主页（核心）────
function C_Conversation() {
  return (
    <PhoneFrame bg={C.bg} fontFamily={C.sans}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 88, paddingTop: 50, padding: '52px 14px 0',
        background: C.bg + 'f4', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', gap: 8, zIndex: 5,
        borderBottom: `1px solid ${C.hairline2}` }}>
        <span style={{ width: 32, color: C.ink2, display: 'flex', alignItems: 'center' }}><Icon name="back" size={20} /></span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1, minWidth: 0 }}>
          <CMark size={28} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, lineHeight: 1.1 }}>心血管分册 · AI 版</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2, fontFamily: C.mono, letterSpacing: 0.5 }}>在线 · 深度思考</div>
          </div>
        </div>
        <span style={{ width: 32, height: 32, border: `1px solid ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="phone" size={15} stroke={C.ink} />
        </span>
        <span style={{ width: 28, color: C.ink2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}><Icon name="kebab" size={20} /></span>
      </div>

      <div style={{ position: 'absolute', top: 88, bottom: 96, left: 0, right: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          <div style={{ alignSelf: 'center', fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: 2 }}>
            05.08 · 09:41
          </div>

          {/* welcome */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <CMark size={26} />
            <div style={{ flex: 1, fontSize: 12.5, color: C.ink2, lineHeight: 1.7, paddingTop: 4 }}>
              你好。我是《心血管分册》的 AI 版。可以问我抗凝、心电图、PCI 时间窗这些临床细节 ——
            </div>
          </div>

          <div style={{ alignSelf: 'flex-end', maxWidth: '78%' }}>
            <div style={{ background: C.ctaBg, color: '#fff', padding: '12px 16px', fontSize: 13.5, lineHeight: 1.55, borderRadius: '14px 14px 4px 14px', boxShadow: '0 8px 20px -12px rgba(28,24,21,.45)' }}>
              冠脉造影术前的抗凝管理怎么做？患者长期服用华法林。
            </div>
          </div>

          {/* meta line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.muted, fontSize: 10.5, fontFamily: C.mono, letterSpacing: 1, textTransform: 'uppercase' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 7px', background: C.ink, color: '#fff' }}>
              <Icon name="sparkle" size={10} stroke="#fff" strokeWidth={2} /> Deep
            </span>
            <span style={{ flex: 1, height: 1, background: C.hairline2 }} />
            <span>4 ch · 1.8s</span>
          </div>

          {/* answer */}
          <div style={{ background: C.surface, border: `1px solid ${C.hairline2}`, padding: '18px 18px 20px', borderRadius: 14, boxShadow: C.shadow }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, lineHeight: 1.5, letterSpacing: 0.2 }}>
              双向评估出血与血栓风险，按风险分层处理。
            </div>
            <div style={{ marginTop: 10, fontSize: 13, color: C.ink2, lineHeight: 1.85 }}>
              · 长期口服华法林：术前 3–5 天停药，<u style={{ textUnderlineOffset: 3, textDecorationThickness: 1 }}>INR ≤ 1.5</u> 后行造影；<br />
              · 高血栓风险（机械瓣 / 近 3 月血栓）需<u style={{ textUnderlineOffset: 3 }}>低分子肝素桥接</u>；<br />
              · 经桡动脉路径的诊断性造影，<u style={{ textUnderlineOffset: 3 }}>INR &lt; 3.0 时可不停药</u><sup style={{ fontSize: 9, fontWeight: 700 }}>[3]</sup>。
            </div>
            <span style={{ display: 'inline-block', width: 6, height: 14, background: C.ink, marginLeft: 2, verticalAlign: '-3px' }} />
          </div>

          {/* multimodal */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 8 }}>
              <span style={{ fontSize: 10.5, color: C.muted }}>横滑 ›</span>
            </div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', margin: '0 -16px', padding: '0 16px 4px' }} className="ab-scroll">
              <CCard kind="free" type="audio" title="编者讲解 · 抗栓评估总思路" meta="2:48" />
              <CCard kind="member" type="image" title="冠脉解剖图谱 · 高清" meta="P12" locked />
              <CCard kind="forever" type="video" title="桡动脉造影手术示教" meta="14:22" locked price="29" />
            </div>
          </div>

          {/* sources */}
          <div style={{ background: C.surface, border: `1px solid ${C.hairline2}`, padding: '13px 16px', borderRadius: 12,
            display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: C.display, fontSize: 22, fontWeight: 800, color: C.ink, letterSpacing: -1, width: 30 }}>05</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: C.ink, fontWeight: 600 }}>处出处 · 来自第 4、7 章</div>
              <div style={{ fontSize: 10.5, color: C.muted, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                §4.2 抗栓药物围术期管理 · §7.1 桡动脉路径
              </div>
            </div>
            <Icon name="chevronDown" size={14} stroke={C.muted} />
          </div>

          {/* follow-up */}
          <div>
            <div style={{ fontSize: 12, color: C.ink2, fontWeight: 600, marginBottom: 8 }}>你也可以问</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                '支架植入后双抗 DAPT 持续多久？',
                '造影剂过敏的预案与抢救流程？',
                'INR > 3.0 急诊造影怎么办？',
              ].map((t, i, a) => (
                <div key={t} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 0', fontSize: 12.5, color: C.ink2,
                  borderBottom: i < a.length - 1 ? `1px solid ${C.hairline2}` : 'none',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>0{i + 1}</span>
                    {t}
                  </span>
                  <Icon name="chevron" size={12} stroke={C.muted} />
                </div>
              ))}
            </div>
          </div>

          {/* TTS */}
          <div style={{ border: `1px solid ${C.hairline}`, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 28, height: 28, background: C.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="play" size={11} fill="#fff" stroke="none" />
            </span>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.5, height: 14 }}>
              {Array.from({ length: 36 }).map((_, i) => {
                const h = 3 + Math.abs(Math.sin(i * 0.7)) * 11;
                return <span key={i} style={{ width: 2, height: h, background: i < 12 ? C.ink : C.subtle }} />;
              })}
            </div>
            <span style={{ fontSize: 10.5, color: C.muted, fontFamily: C.mono }}>0:08</span>
            <span style={{ fontSize: 10.5, color: C.ink, border: `1px solid ${C.hairline}`, padding: '2px 6px', fontFamily: C.mono }}>1.0×</span>
          </div>

          {/* actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 18, color: C.muted }}>
              <Icon name="copy" size={16} stroke={C.muted} />
              <Icon name="heart" size={16} stroke={C.muted} />
              <Icon name="bookmark" size={16} stroke={C.muted} />
              <Icon name="refresh" size={16} stroke={C.muted} />
            </div>
            <span style={{ fontSize: 10.5, color: C.muted, fontFamily: C.mono, letterSpacing: 1 }}>03 / 05</span>
          </div>

          {/* extension bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 12px',
            background: C.ink, color: '#fff' }}>
            <div style={{ width: 36, height: 36, border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="play" size={13} fill="#fff" stroke="none" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.55)', letterSpacing: 1, fontFamily: C.mono, textTransform: 'uppercase' }}>1 ITEM · 永享</div>
              <div style={{ fontSize: 12.5, fontWeight: 500, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                桡动脉造影示教视频包 · 14 段
              </div>
            </div>
            <button style={{ background: '#fff', color: C.ink, border: 'none', padding: '7px 13px',
              fontSize: 11.5, fontWeight: 700, fontFamily: C.display, letterSpacing: 0.5 }}>¥29 永享</button>
          </div>
        </div>
      </div>

      {/* input */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0,
        background: C.surface, borderTop: `1px solid ${C.hairline2}`,
        padding: '10px 14px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
          <span style={{ padding: '3px 7px', background: C.ink, color: '#fff' }}>DEEP</span>
          <span style={{ padding: '3px 7px', border: `1px solid ${C.hairline}` }}>WEB</span>
          <span style={{ flex: 1 }} />
          <span>500</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 36, height: 36, border: `1px solid ${C.hairline}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.ink2 }}>
            <Icon name="plus" size={18} />
          </span>
          <div style={{ flex: 1, height: 36, border: `1px solid ${C.hairline}`, display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 13, color: C.subtle }}>
            向 AI 提问 ……
          </div>
          <span style={{ width: 36, height: 36, background: C.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="mic" size={18} stroke="#fff" />
          </span>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ──── C3 · 锁标付费墙 ────
function C_Paywall() {
  return (
    <PhoneFrame bg={C.bg} fontFamily={C.sans}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.3 }}><C_Conversation /></div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.6)' }} />

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: C.bg, padding: '14px 20px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{ width: 36, height: 3, background: C.subtle }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: C.display, fontSize: 22, fontWeight: 800, color: C.ink, letterSpacing: -0.5, lineHeight: 1.2 }}>解锁这张<br />会员图谱</div>
          </div>
          <span style={{ width: 28, height: 28, border: `1px solid ${C.hairline}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted }}>
            <Icon name="close" size={13} />
          </span>
        </div>

        {/* asset */}
        <div style={{ display: 'flex', gap: 12, padding: '12px 0', borderTop: `1px solid ${C.hairline}`, borderBottom: `1px solid ${C.hairline}`, marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, background: C.ink, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="lock" size={14} stroke="#fff" strokeWidth={1.8} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink }}>冠脉解剖图谱 · 高清</div>
            <div style={{ fontSize: 10.5, color: C.muted, marginTop: 4, fontFamily: C.mono, letterSpacing: 0.4 }}>P12 · 4096 × 2730 px</div>
            <div style={{ marginTop: 6 }}><CTag kind="member">机构标注 · 会员素材</CTag></div>
          </div>
        </div>

        {/* paths — minimal table */}
        <div style={{ marginBottom: 14 }}>
          {/* member */}
          <div style={{ background: C.ctaBg, color: '#fff', padding: '18px', position: 'relative', borderRadius: '14px 14px 0 0', boxShadow: C.ctaShadow }}>
            <div style={{ position: 'absolute', top: 0, right: 0, background: '#fff', color: C.ink, fontSize: 9, fontWeight: 700, padding: '3px 8px', letterSpacing: 1 }}>RECOMMENDED</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 10, fontFamily: C.mono, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, marginBottom: 4 }}>01</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>升级 AI 会员</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 5 }}>解锁全部多模态 + 实时电话</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: C.display, fontSize: 28, fontWeight: 800, letterSpacing: -1 }}>¥9.9</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>首月</div>
              </div>
            </div>
          </div>

          {/* single */}
          <div style={{ border: `1px solid ${C.ink}`, borderTop: 'none', padding: '14px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 10, fontFamily: C.mono, color: C.muted, letterSpacing: 2, marginBottom: 4 }}>02</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>单品永享</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>只买这一张 · 永久收藏</div>
            </div>
            <div style={{ fontFamily: C.display, fontSize: 24, fontWeight: 800, color: C.ink, letterSpacing: -0.5 }}>¥6</div>
          </div>

          {/* code */}
          <div style={{ border: `1px solid ${C.ink}`, borderTop: 'none', padding: '13px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.surface2 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 12, color: C.ink2, fontSize: 13 }}>
              <span style={{ fontSize: 10, fontFamily: C.mono, color: C.muted, letterSpacing: 2 }}>03</span>
              使用兑换码
            </span>
            <Icon name="chevron" size={13} stroke={C.ink} />
          </div>
        </div>

        <div style={{ fontSize: 10, color: C.muted, textAlign: 'center', fontFamily: C.mono, letterSpacing: 1 }}>
          继续即代表同意《会员服务协议》
        </div>
      </div>
    </PhoneFrame>
  );
}

// ──── C4 · 会员订阅 ────
function C_Membership() {
  return (
    <PhoneFrame bg={C.bg} fontFamily={C.sans}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 88, padding: '52px 16px 0', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${C.hairline2}` }}>
        <span style={{ width: 32, color: C.ink, display: 'flex', alignItems: 'center' }}><Icon name="back" size={20} /></span>
        <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: C.ink, textAlign: 'center', letterSpacing: 1 }}>AI 会员</div>
        <span style={{ width: 32, color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}><Icon name="kebab" size={20} /></span>
      </div>

      <div style={{ position: 'absolute', top: 88, bottom: 100, left: 0, right: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 20px 16px' }}>

          {/* hero — strict typographic */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontFamily: C.display, fontSize: 32, fontWeight: 800, color: C.ink, letterSpacing: -1, lineHeight: 1.1 }}>
              解锁这本书的<br />全部声音与影像。
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: C.muted, lineHeight: 1.7 }}>
              文字答案永远免费 · 会员仅解锁多模态。
            </div>
          </div>

          {/* plans */}
          <div style={{ marginBottom: 22 }}>
            {[
              { name: '年度', sub: '日均 ¥0.46 · 省 ¥48', price: '168', orig: '216', period: 'YR', tag: 'BEST', best: true },
              { name: '月度', sub: '续期 ¥18 / 月', price: '9.9', orig: '18', period: 'MO', tag: '首月', best: false },
              { name: '季度', sub: '续期 ¥49 / 季', price: '49', orig: '54', period: 'QR', tag: null, best: false },
            ].map((p, i) => (
              <div key={i} style={{
                padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderTop: `${p.best ? 2 : 1}px solid ${p.best ? C.ink : C.hairline2}`,
                borderBottom: i === 2 ? `1px solid ${C.hairline2}` : 'none',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: C.display, fontSize: 17, fontWeight: 700, color: C.ink, letterSpacing: -0.3 }}>{p.name}</span>
                    {p.tag && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', background: p.best ? C.ink : 'transparent', color: p.best ? '#fff' : C.muted, border: p.best ? 'none' : `1px solid ${C.hairline}`, letterSpacing: 1 }}>{p.tag}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{p.sub}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontFamily: C.display, fontSize: 26, fontWeight: 800, color: C.ink, letterSpacing: -1 }}>¥{p.price}</span>
                  <span style={{ fontSize: 10, color: C.muted, marginLeft: 4, fontFamily: C.mono, letterSpacing: 1 }}>/{p.period}</span>
                  <div style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, textDecoration: 'line-through' }}>¥{p.orig}</div>
                </div>
              </div>
            ))}
          </div>

          {/* benefits */}
          <div style={{ marginBottom: 16 }}>
            {[
              ['01', '高清图谱', '1248 张医学插图'],
              ['02', '编者音频', '320 段讲解'],
              ['03', '电话语音', '不限时数字人对话'],
              ['04', '深度思考', '优先排队 · 更长上下文'],
            ].map(([n, t, sub]) => (
              <div key={n} style={{ display: 'flex', alignItems: 'baseline', gap: 14, padding: '12px 0', borderBottom: `1px solid ${C.hairline2}` }}>
                <span style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, letterSpacing: 1 }}>{n}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{t}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{sub}</div>
                </div>
                <Icon name="check" size={14} stroke={C.ink} strokeWidth={2} />
              </div>
            ))}
          </div>

          <div style={{ fontSize: 10.5, color: C.muted, lineHeight: 1.7 }}>
            随时在「我的 — 会员」取消，到期前 24 小时短信提醒。继续即同意《会员服务协议》。
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 18px 28px', background: `linear-gradient(180deg, transparent, ${C.bg} 30%)` }}>
        <button style={{ width: '100%', height: 54, border: 'none', borderRadius: 14, background: C.ctaBg, boxShadow: C.ctaShadow, color: '#fff', fontSize: 14.5, fontWeight: 600, letterSpacing: 1.4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          ¥168 · 开通年度会员
          <span style={{ width: 28, height: 1, background: '#fff' }} />
          <Icon name="chevron" size={14} stroke="#fff" strokeWidth={2} />
        </button>
      </div>
    </PhoneFrame>
  );
}

// ──── C5 · 实时语音 ────
function C_Call() {
  return (
    <PhoneFrame bg={C.ink} fontFamily={C.sans} dark statusColor="#fff">
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: `radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.06) 0%, transparent 50%), radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)`,
        backgroundSize: 'auto, 12px 12px' }} />

      <div style={{ position: 'absolute', top: 56, left: 0, right: 0, textAlign: 'center', color: '#fff' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: 4, fontFamily: C.mono }}>
          <Dot color={C.danger} size={6} /> LIVE · 通话中
        </div>
        <div style={{ fontFamily: C.display, fontSize: 18, fontWeight: 700, marginTop: 12, letterSpacing: -0.3 }}>心血管分册 · AI 版</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4, fontFamily: C.mono, letterSpacing: 4 }}>02 : 34</div>
      </div>

      {/* central waveform — pure mono */}
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, height: 280, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {[140, 110, 80].map((r, i) => (
          <div key={r} style={{ position: 'absolute', width: r * 2, height: r * 2, borderRadius: '50%',
            border: `1px solid rgba(255,255,255,${0.10 - i * 0.025})` }} />
        ))}
        <svg width="200" height="200" viewBox="-100 -100 200 200" style={{ position: 'absolute' }}>
          {Array.from({ length: 64 }).map((_, i) => {
            const a = (i / 64) * Math.PI * 2;
            const baseR = 86;
            const amp = 4 + Math.abs(Math.sin(i * 0.55 + 0.3)) * 18;
            const x1 = Math.cos(a) * baseR, y1 = Math.sin(a) * baseR;
            const x2 = Math.cos(a) * (baseR + amp), y2 = Math.sin(a) * (baseR + amp);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeOpacity={0.4 + (amp / 22) * 0.5} strokeWidth="1.5" strokeLinecap="round" />;
          })}
        </svg>
        <div style={{ width: 116, height: 116, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CMark size={84} />
        </div>
      </div>

      <div style={{ position: 'absolute', top: 504, left: 28, right: 28, textAlign: 'center', color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 1.7, fontFamily: C.sans }}>
        "造影后即可恢复华法林口服，<br />一般同日或次日恢复至原维持剂量……"
      </div>

      <div style={{ position: 'absolute', top: 596, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{ border: '1px solid rgba(255,255,255,0.18)', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'rgba(255,255,255,0.85)', fontFamily: C.mono, letterSpacing: 1 }}>
          <Dot color="#fff" size={5} />
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
            <span style={{ width: c.danger ? 64 : 56, height: c.danger ? 64 : 56, borderRadius: c.danger ? 32 : 28,
              background: c.danger ? `linear-gradient(180deg, #d96147, ${C.danger})` : 'rgba(255,255,255,0.06)',
              border: c.danger ? 'none' : '1px solid rgba(255,255,255,0.22)',
              boxShadow: c.danger ? '0 12px 30px -10px rgba(184,68,46,.6), 0 0 0 1px rgba(255,255,255,.06) inset' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: c.danger ? 'rotate(135deg)' : 'none' }}>
              <Icon name={c.ic} size={c.danger ? 26 : 22} stroke="#fff" strokeWidth={1.8} />
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontFamily: C.mono, letterSpacing: 1 }}>{c.label}</span>
          </div>
        ))}
      </div>
    </PhoneFrame>
  );
}

// ──── C6 · 我的 ────
function C_Profile() {
  return (
    <PhoneFrame bg={C.bg} fontFamily={C.sans}>
      <div style={{ position: 'absolute', top: 50, right: 16, display: 'flex', gap: 4 }}>
        <span style={{ width: 32, height: 32, color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="settings" size={17} /></span>
        <span style={{ width: 32, height: 32, color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="qr" size={17} /></span>
      </div>

      <div style={{ position: 'absolute', top: 60, left: 22, fontFamily: C.display, fontSize: 32, fontWeight: 800, color: C.ink, letterSpacing: -1.5 }}>我的</div>

      <div style={{ position: 'absolute', top: 110, bottom: 90, left: 0, right: 0, overflow: 'hidden' }}>
        <div style={{ padding: '0 20px 24px' }}>
          {/* identity */}
          <div style={{ padding: '18px 0', borderTop: `2px solid ${C.ink}`, borderBottom: `1px solid ${C.hairline}`, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 50, height: 50, background: C.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: C.display, fontSize: 22, fontWeight: 800 }}>陈</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: C.display, fontSize: 18, fontWeight: 700, color: C.ink, letterSpacing: -0.3 }}>陈医生</div>
              <div style={{ fontSize: 10.5, color: C.muted, marginTop: 3, fontFamily: C.mono, letterSpacing: 0.5 }}>+86 138 **** 4421</div>
            </div>
            <Icon name="chevron" size={14} stroke={C.muted} />
          </div>

          {/* institution */}
          <div style={{ padding: '12px 0', borderBottom: `1px solid ${C.hairline2}`, display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: C.ink2 }}>
            <span style={{ flex: 1, fontWeight: 500 }}>中国医学临床百家</span>
            <span style={{ fontSize: 11, color: C.ink, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 4 }}>切换</span>
          </div>

          {/* member status — sharp panel */}
          <div style={{ marginTop: 18, padding: '18px', background: C.ctaBg, color: '#fff', position: 'relative', borderRadius: 14, boxShadow: C.ctaShadow }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: C.display, fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>有效期至 2026.05.30</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>剩余 22 天 · 自动续费 ¥18</div>
              </div>
              <CMark size={36} />
            </div>
            <button style={{ marginTop: 14, background: '#fff', color: C.ink, border: 'none', borderRadius: 10, height: 36, padding: '0 16px', fontSize: 12, fontWeight: 700, letterSpacing: 1, boxShadow: '0 6px 18px -6px rgba(0,0,0,.4)' }}>续费 ¥9.9 →</button>
          </div>

          {/* numbers row */}
          <div style={{ marginTop: 16, display: 'flex', borderTop: `1px solid ${C.hairline}`, borderBottom: `1px solid ${C.hairline}` }}>
            {[
              ['12', '已永享'],
              ['28', '历史'],
              ['14', '收藏'],
            ].map(([n, l], i, a) => (
              <div key={l} style={{ flex: 1, padding: '14px 0', textAlign: 'center', borderRight: i < a.length - 1 ? `1px solid ${C.hairline2}` : 'none' }}>
                <div style={{ fontFamily: C.display, fontSize: 28, fontWeight: 800, color: C.ink, letterSpacing: -1, lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 6, fontFamily: C.mono, letterSpacing: 1, textTransform: 'uppercase' }}>{l}</div>
              </div>
            ))}
          </div>

          {/* menu — list with rule */}
          <div style={{ marginTop: 16 }}>
            {[
              ['永享列表', '12 项'],
              ['历史会话', '90 天 · 28 条'],
              ['我的收藏', '14 条'],
              ['订单中心', '会员 / 永享 / 兑换码'],
              ['联系客服', '机构企微 · 个微 · 电话'],
              ['账号设置', '手机号 · 隐私 · 通知'],
            ].map(([t, sub], i, a) => (
              <div key={t} style={{ padding: '14px 0', display: 'flex', alignItems: 'center', gap: 14, borderBottom: `1px solid ${C.hairline2}` }}>
                <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted, letterSpacing: 1, width: 16 }}>{String(i + 1).padStart(2, '0')}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: C.ink }}>{t}</div>
                  <div style={{ fontSize: 10.5, color: C.muted, marginTop: 2 }}>{sub}</div>
                </div>
                <Icon name="chevron" size={13} stroke={C.muted} />
              </div>
            ))}
          </div>


        </div>
      </div>

      {/* tabbar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 76, paddingBottom: 18, background: C.surface, borderTop: `1px solid ${C.hairline}`, display: 'flex' }}>
        {[
          ['chat', '问书', false],
          ['history', '历史', false],
          ['user', '我的', true],
        ].map(([ic, l, on]) => (
          <div key={l} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: on ? C.ink : C.muted, position: 'relative' }}>
            {on && <span style={{ position: 'absolute', top: 0, width: 24, height: 2, background: C.ink }} />}
            <Icon name={ic} size={19} stroke={on ? C.ink : C.muted} strokeWidth={on ? 2 : 1.5} />
            <span style={{ fontSize: 10, fontWeight: on ? 600 : 400, letterSpacing: 0.5 }}>{l}</span>
          </div>
        ))}
      </div>
    </PhoneFrame>
  );
}

// ──── C7 · 历史回看 ────
function C_History() {
  return (
    <PhoneFrame bg={C.bg} fontFamily={C.sans}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 88, padding: '50px 16px 0', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${C.hairline2}` }}>
        <span style={{ width: 32, color: C.ink, display: 'flex', alignItems: 'center' }}><Icon name="back" size={20} /></span>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, fontFamily: C.display, letterSpacing: 0.5 }}>2026.04.18 · 09:41</div>

        </div>
        <span style={{ width: 32, color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}><Icon name="share" size={18} /></span>
      </div>

      <div style={{ position: 'absolute', top: 88, bottom: 88, left: 0, right: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: '8px 0', borderTop: `1px dashed ${C.hairline}`, borderBottom: `1px dashed ${C.hairline}`, fontSize: 10.5, color: C.muted, textAlign: 'center', fontFamily: C.mono, letterSpacing: 1 }}>
            90 天内 · 共 3 条往返
          </div>

          <div style={{ alignSelf: 'flex-end', maxWidth: '78%' }}>
            <div style={{ background: C.ink, color: '#fff', padding: '11px 14px', fontSize: 13.5, lineHeight: 1.55 }}>
              心电图 ST 段抬高怎么快速判断是 STEMI？
            </div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 4, textAlign: 'right', fontFamily: C.mono }}>09:41</div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <CMark size={26} />
            <div style={{ flex: 1, fontSize: 13, lineHeight: 1.85, color: C.ink, padding: '4px 2px 0' }}>
              STEMI 的判定核心是相邻两个导联 ST 段抬高 ≥ 0.1 mV（V2-V3 男性 ≥ 0.2 mV，女性 ≥ 0.15 mV）<sup style={{ fontSize: 9 }}>[1]</sup>，并伴胸痛、动态心电图变化或心肌损伤标志物升高……
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                <CTag kind="muted">3 处出处</CTag>
                <CTag kind="free">编者讲解 · 已听</CTag>
              </div>
            </div>
          </div>

          <div style={{ alignSelf: 'flex-end', maxWidth: '78%' }}>
            <div style={{ background: C.ink, color: '#fff', padding: '11px 14px', fontSize: 13.5, lineHeight: 1.55 }}>
              直接 PCI 的时间窗是怎么定的？
            </div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 4, textAlign: 'right', fontFamily: C.mono }}>09:43</div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <CMark size={26} />
            <div style={{ flex: 1, fontSize: 13, lineHeight: 1.85, color: C.ink, padding: '4px 2px 0' }}>
              目标是首次医疗接触至导丝通过（FMC-to-Wire）<u style={{ textUnderlineOffset: 3 }}>≤ 90 分钟</u>。如果首诊于不能 PCI 的医院，120 分钟内能转诊到 PCI 中心则首选 PCI；否则启动溶栓……
              <div style={{ marginTop: 10, padding: '10px 12px', background: C.surface2, display: 'flex', alignItems: 'center', gap: 10, border: `1px solid ${C.hairline2}` }}>
                <span style={{ width: 28, height: 28, background: C.ink }} />
                <div style={{ flex: 1, fontSize: 11.5 }}>
                  <div style={{ color: C.ink, fontWeight: 500 }}>STEMI 救治时间窗示意图</div>
                  <div style={{ color: C.muted, fontSize: 10, marginTop: 2, fontFamily: C.mono, letterSpacing: 0.4 }}>已永享 · P 23</div>
                </div>
                <Icon name="chevron" size={12} stroke={C.muted} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px 24px', background: C.bg, borderTop: `1px solid ${C.hairline2}` }}>
        <button style={{ width: '100%', height: 48, border: `1.5px solid ${C.ink}`, borderRadius: 14, background: '#fff', color: C.ink, fontSize: 13, fontWeight: 600, letterSpacing: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 8px 20px -10px rgba(28,24,21,.25)' }}>
          基于这次对话继续追问
          <Icon name="chevron" size={14} stroke={C.ink} strokeWidth={2} />
        </button>
      </div>
    </PhoneFrame>
  );
}

// ──── C8 · 客服 ────
function C_Service() {
  return (
    <PhoneFrame bg={C.bg} fontFamily={C.sans}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.3 }}><C_Profile /></div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.55)' }} />

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: C.bg, padding: '14px 20px 30px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{ width: 36, height: 3, background: C.subtle }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: C.display, fontSize: 22, fontWeight: 800, color: C.ink, letterSpacing: -0.5 }}>联系客服</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>中国医学临床百家 · 客服中心</div>
          </div>
          <span style={{ width: 28, height: 28, border: `1px solid ${C.hairline}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted }}>
            <Icon name="close" size={13} />
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          {[
            { name: '企业微信', sub: '官方客服 · 工作日响应', label: '小张' },
            { name: '个人微信', sub: '订单 · 发票 · 售后', label: '小李' },
          ].map((q) => (
            <div key={q.name} style={{ flex: 1, border: `1px solid ${C.hairline}`, padding: '14px 12px', textAlign: 'center', background: C.surface }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                <FakeQR size={104} label={q.label} />
              </div>
              <div style={{ fontFamily: C.display, fontSize: 13, fontWeight: 700, color: C.ink, letterSpacing: -0.2 }}>{q.name}</div>
              <div style={{ fontSize: 10.5, color: C.muted, marginTop: 3 }}>{q.sub}</div>
              <div style={{ marginTop: 8, fontSize: 10, color: C.ink, fontWeight: 600, fontFamily: C.mono, letterSpacing: 1 }}>长按保存图片</div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: `1px solid ${C.hairline}`, borderBottom: `1px solid ${C.hairline}` }}>
          {[
            { label: '客服电话', value: '010 - 8888 6666' },
            { label: '客服邮箱', value: 'service@cmp-clinical.cn' },
          ].map((row, i, a) => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', padding: '14px 0', gap: 12, borderBottom: i < a.length - 1 ? `1px solid ${C.hairline2}` : 'none' }}>
              <span style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: 1.5, color: C.muted, width: 60, textTransform: 'uppercase' }}>{row.label}</span>
              <span style={{ flex: 1, fontFamily: C.mono, fontSize: 13, color: C.ink, letterSpacing: 0.4 }}>{row.value}</span>
              <Icon name="chevron" size={13} stroke={C.muted} />
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14, padding: '10px 0', display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: C.ink2, fontFamily: C.mono, letterSpacing: 1 }}>
          <Icon name="timer" size={13} stroke={C.ink2} />
          <span>周一至周五 · 09:00 — 18:00</span>
        </div>


      </div>
    </PhoneFrame>
  );
}

Object.assign(window, { C, CMark, CTag, CDivider, CCard, C_Landing, C_Conversation, C_Paywall, C_Membership, C_Call, C_Profile, C_History, C_Service });
