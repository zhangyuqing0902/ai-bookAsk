// ─────────────────────────────────────────────────────────────
// Direction A — 沉静 · 学术 · 暖纸印章
//
// AI 问书 / 中国医学临床百家 · 心血管分册（第 4 版）
//
// Visual DNA:
//  · 暖纸底 #f4ede0 · 墨黑 #1c1814 · 朱砂印章红 #b04a32 · 古金 #c8a356
//  · 思源宋体（Noto Serif SC）做标题与权威元素，思源黑体（Noto Sans SC）做正文与 UI
//  · Agent 形象 = 圆形朱砂印章 + 白底"问"字，传递"作者授权"与"权威来源"的视觉气质
//  · 答卡背面 = 米白宣纸；溯源条像图书馆藏书票；多模态卡像版画藏品图录
//  · 付费引导一律用纸条/书签隐喻，避免商业化打扰阅读
// ─────────────────────────────────────────────────────────────

const A = {
  bg: '#f4ede0',
  paper: '#faf5ea',
  card: '#ffffff',
  ink: '#1c1814',
  ink2: '#3a302a',
  muted: '#6b5e4f',
  subtle: '#b8a890',
  hairline: 'rgba(28,24,20,0.10)',
  hairline2: 'rgba(28,24,20,0.06)',
  seal: '#b04a32',
  sealDeep: '#8a3a26',
  sealSoft: '#d8927e',
  gold: '#c8a356',
  goldSoft: '#e9d8b1',
  jade: '#6b8a5e',
  shadow: '0 1px 0 rgba(28,24,20,.04), 0 8px 32px rgba(28,24,20,.06)',
  serif: '"Noto Serif SC", "Songti SC", serif',
  sans: '"Noto Sans SC", -apple-system, "PingFang SC", sans-serif',
  mono: '"DM Mono", "SF Mono", "Cascadia Mono", monospace',
};

// Brand mark — circular vermilion seal with the character 问 cut out in white.
function ASeal({ size = 44, char = '问', deco = true }) {
  const s = size;
  const r = s / 2;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ display: 'block' }}>
      {deco && <circle cx={r} cy={r} r={r - 0.5} fill="none" stroke={A.sealDeep} strokeWidth="0.6" strokeDasharray="1.5 1.5" opacity="0.6" />}
      <circle cx={r} cy={r} r={r - 2.5} fill={A.seal} />
      {deco && <circle cx={r} cy={r} r={r - 4.5} fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="0.6" />}
      <text x={r} y={r + s * 0.085} textAnchor="middle"
        fontFamily={A.serif} fontSize={s * 0.52} fontWeight="700" fill="#fff"
        style={{ letterSpacing: 0 }}>{char}</text>
    </svg>
  );
}

// Wordmark — "AI 问书"  (serif, with seal)
function AWordmark({ size = 18 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6, fontFamily: A.serif, color: A.ink }}>
      <span style={{ fontSize: size * 0.7, fontWeight: 500, letterSpacing: 1.5, color: A.muted, fontFamily: A.mono }}>AI</span>
      <span style={{ fontSize: size, fontWeight: 600, letterSpacing: 4 }}>问书</span>
    </span>
  );
}

// Soft "free / 会员 / 永享" lock tag.
function ATag({ kind, children }) {
  const map = {
    free: { c: A.jade, bg: 'rgba(107,138,94,0.10)' },
    member: { c: A.gold, bg: 'rgba(200,163,86,0.14)' },
    forever: { c: A.seal, bg: 'rgba(176,74,50,0.10)' },
    muted: { c: A.muted, bg: 'rgba(28,24,20,0.05)' },
  };
  const { c, bg } = map[kind] || map.muted;
  return (
    <span style={{
      fontSize: 11, padding: '3px 8px', borderRadius: 99,
      color: c, background: bg, fontWeight: 500, letterSpacing: 0.3,
      whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

// Generic small icon button (transparent bg, ink color).
function AIconBtn({ name, size = 22, onClick, color }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 36, height: 36, borderRadius: 18, color: color || A.ink2,
    }}>
      <Icon name={name} size={size} />
    </span>
  );
}

// Header row used across most screens.
function AHeader({ left, title, subtitle, right, transparent, accent }) {
  return (
    <div style={{
      paddingTop: 44, height: 96, padding: '50px 16px 0',
      display: 'flex', alignItems: 'center', gap: 8,
      background: transparent ? 'transparent' : A.bg,
      position: 'relative',
    }}>
      {left}
      <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
        <div style={{ fontFamily: A.serif, fontSize: 17, fontWeight: 600, color: A.ink, letterSpacing: 0.5, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: A.muted, marginTop: 2, letterSpacing: 0.4 }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 1 — 落地页 / 微信授权
// ─────────────────────────────────────────────────────────────
function A_Landing() {
  return (
    <PhoneFrame bg={A.bg} fontFamily={A.sans} statusColor={A.ink}>
      {/* paper texture / subtle vertical rule lines */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none',
        backgroundImage: `repeating-linear-gradient(0deg, transparent 0 39px, rgba(28,24,20,.025) 39px 40px)`,
      }} />
      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', padding: '52px 28px 40px' }}>
        {/* publisher mark + spine number */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 24, height: 24, border: `1.2px solid ${A.ink2}`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: A.serif, fontSize: 14, fontWeight: 700, color: A.ink }}>临</span>
            </div>
            <div>
              <div style={{ fontFamily: A.serif, fontSize: 12, color: A.ink, fontWeight: 500, letterSpacing: 1 }}>中国医学临床百家</div>
              <div style={{ fontSize: 9, color: A.muted, letterSpacing: 1.5, fontFamily: A.mono }}>CN-CMP · OFFICIAL</div>
            </div>
          </div>
          <span style={{ fontSize: 11, color: A.muted, fontFamily: A.mono }}>v.4 · 2026</span>
        </div>

        {/* big seal — entrance vibe */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
          <div style={{ position: 'relative', alignSelf: 'center', marginBottom: 28 }}>
            {/* subtle aura behind seal */}
            <div style={{ position: 'absolute', inset: -22, borderRadius: '50%',
              background: `radial-gradient(closest-side, ${A.sealSoft}33, transparent 70%)` }} />
            <ASeal size={108} />
          </div>

          <div style={{ alignSelf: 'center', textAlign: 'center' }}>
            <div style={{ fontFamily: A.mono, fontSize: 11, color: A.seal, letterSpacing: 3, marginBottom: 12 }}>AI · 问 · 书</div>
            <div style={{ fontFamily: A.serif, fontSize: 30, fontWeight: 700, color: A.ink, letterSpacing: 2, lineHeight: 1.25 }}>
              心血管分册
            </div>
            <div style={{ fontFamily: A.serif, fontSize: 14, color: A.muted, marginTop: 6, letterSpacing: 1 }}>
              ——  能问 · 能答 · 能听 · 能看的 AI 版作者
            </div>
          </div>

          {/* three benefit lines */}
          <div style={{ alignSelf: 'stretch', marginTop: 36, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              ['每条答案都带原书章节 / 页码 / 视频时间码', 'sources'],
              ['文字问答永远免费，不限次数、不打码', 'check'],
              ['图片 / 音频 / 视频片段可单独购买永享', 'bookmark'],
            ].map(([t, ic]) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: A.ink2, lineHeight: 1.6 }}>
                <span style={{ width: 28, height: 28, borderRadius: 14, background: A.paper, color: A.seal, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
                  <Icon name={ic} size={14} strokeWidth={1.8} />
                </span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div>
          <button style={{
            width: '100%', height: 50, border: 'none', borderRadius: 8,
            background: A.ink, color: A.bg, fontFamily: A.sans, fontSize: 15, fontWeight: 600, letterSpacing: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: A.shadow, cursor: 'pointer',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 4C5.4 4 2 6.7 2 10.1c0 1.9 1 3.5 2.7 4.7l-.7 2.3 2.6-1.4c.7.2 1.5.3 2.3.3a8.6 8.6 0 0 0 1.5-.1A6 6 0 0 1 10 14c0-3.5 3.4-6.3 7.5-6.3.4 0 .7 0 1 .1A6.7 6.7 0 0 0 12 4.6 7.6 7.6 0 0 0 9.5 4zM7 7.5a.9.9 0 1 1 0 1.7.9.9 0 0 1 0-1.7zm5 0a.9.9 0 1 1 0 1.7.9.9 0 0 1 0-1.7z"/></svg>
            微信一键授权进入
          </button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 18 }}>
            <button style={{ background: 'none', border: 'none', color: A.ink2, fontFamily: A.sans, fontSize: 13, letterSpacing: 1 }}>手机号登录</button>
            <span style={{ width: 1, height: 12, background: A.hairline }} />
            <button style={{ background: 'none', border: 'none', color: A.ink2, fontFamily: A.sans, fontSize: 13, letterSpacing: 1 }}>使用兑换码</button>
          </div>
          <div style={{ marginTop: 22, fontSize: 10, color: A.muted, textAlign: 'center', lineHeight: 1.7 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 14, height: 14, borderRadius: 3, border: `1.3px solid ${A.seal}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="check" size={9} stroke={A.seal} strokeWidth={2.4} />
              </span>
              已阅读并同意 <span style={{ color: A.seal }}>《用户协议》</span> 与 <span style={{ color: A.seal }}>《隐私政策》</span>
            </span>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 2 — AI 会话主页面（最重要）
//   header + welcome peek + user 提问 + AI 流式回答 + 三件套 +
//   延伸视图小条 + 输入区
// ─────────────────────────────────────────────────────────────

// Multimodal asset card. Mode: free | member | forever-locked | forever-owned.
function AModalCard({ kind, type, title, meta, locked, owned, price, thumbHue }) {
  const isImage = type === 'image', isAudio = type === 'audio', isVideo = type === 'video';
  const tagText = kind === 'free' ? '免费' : kind === 'member' ? '会员' : '永享';
  return (
    <div style={{
      flex: '0 0 152px', background: A.card, borderRadius: 10,
      border: `1px solid ${A.hairline2}`, overflow: 'hidden',
      boxShadow: '0 1px 0 rgba(28,24,20,.04)',
      position: 'relative',
    }}>
      {/* visual */}
      <div style={{
        height: 92, position: 'relative',
        background: isImage ? `linear-gradient(135deg, ${A.goldSoft}, ${A.sealSoft})`
          : isVideo ? `linear-gradient(160deg, #2a241e, ${A.ink2})`
          : `linear-gradient(180deg, ${A.paper}, #ede1cd)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* type-specific glyph */}
        {isImage && (
          <svg width="100%" height="100%" viewBox="0 0 152 92" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, opacity: 0.55, mixBlendMode: 'multiply' }}>
            <path d="M0 70 Q 40 40, 76 60 T 152 50 L 152 92 L 0 92 Z" fill={A.sealDeep} opacity="0.4" />
            <circle cx="116" cy="28" r="14" fill={A.gold} opacity="0.55" />
          </svg>
        )}
        {isAudio && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 36 }}>
            {[12, 20, 8, 28, 18, 32, 14, 24, 10, 26, 16, 22].map((h, i) => (
              <span key={i} style={{ width: 3, height: h, borderRadius: 1.5, background: A.seal, opacity: 0.4 + (i % 3) * 0.2 }} />
            ))}
          </div>
        )}
        {isVideo && (
          <div style={{ width: 38, height: 38, borderRadius: 19, background: 'rgba(255,255,255,.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="play" size={18} fill={A.ink} stroke="none" />
          </div>
        )}
        {locked && (
          <>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,24,20,0.42)', backdropFilter: 'blur(2px)' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 30, height: 30, borderRadius: 15, background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="lock" size={14} stroke={A.ink} strokeWidth={1.8} />
              </div>
            </div>
          </>
        )}
        {/* tag */}
        <div style={{ position: 'absolute', top: 7, left: 7 }}>
          <ATag kind={kind === 'free' ? 'free' : kind === 'member' ? 'member' : 'forever'}>{tagText}</ATag>
        </div>
        {/* duration / pages on top right */}
        {meta && (
          <div style={{ position: 'absolute', top: 7, right: 7, fontSize: 10, fontFamily: A.mono, color: '#fff',
            background: 'rgba(28,24,20,.65)', padding: '2px 6px', borderRadius: 4, letterSpacing: 0.5 }}>
            {meta}
          </div>
        )}
      </div>
      {/* caption */}
      <div style={{ padding: '10px 11px 11px' }}>
        <div style={{ fontSize: 12.5, fontWeight: 500, color: A.ink, lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 10.5, color: A.muted, fontFamily: A.mono, letterSpacing: 0.3 }}>
            {type === 'image' ? '图谱' : type === 'audio' ? '音频' : '视频'}
          </span>
          {price && <span style={{ fontSize: 11, color: A.seal, fontFamily: A.serif, fontWeight: 600 }}>¥{price}</span>}
          {owned && <span style={{ fontSize: 10, color: A.jade, fontWeight: 500 }}>已永享 ✓</span>}
        </div>
      </div>
    </div>
  );
}

function A_Conversation() {
  return (
    <PhoneFrame bg={A.bg} fontFamily={A.sans}>
      {/* sticky-ish header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 96,
        paddingTop: 50, padding: '52px 12px 0',
        background: A.bg + 'f0', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', gap: 6, zIndex: 5,
        borderBottom: `1px solid ${A.hairline2}`,
      }}>
        <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: A.ink2 }}>
          <Icon name="back" size={22} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1, minWidth: 0 }}>
          <ASeal size={32} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: A.serif, fontSize: 14.5, fontWeight: 600, color: A.ink, letterSpacing: 0.5, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              心血管分册 · AI 版
            </div>
            <div style={{ fontSize: 10, color: A.muted, marginTop: 1, letterSpacing: 0.3 }}>
              <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: 3, background: A.jade, marginRight: 5, verticalAlign: 'middle' }} />
              已就绪 · 第 4 版 · 收录 1248 节
            </div>
          </div>
        </div>
        <AIconBtn name="phone" size={20} />
        <AIconBtn name="kebab" size={20} />
      </div>

      {/* scroll area */}
      <div style={{ position: 'absolute', top: 96, bottom: 102, left: 0, right: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* date stamp */}
          <div style={{ alignSelf: 'center', fontSize: 10.5, color: A.muted, letterSpacing: 1, fontFamily: A.mono }}>
            ── 2026.05.08  上午 09:41 ──
          </div>

          {/* welcome bubble (compact) */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <ASeal size={28} />
            <div style={{ flex: 1, background: A.paper, borderRadius: '4px 14px 14px 14px',
              padding: '10px 12px', fontSize: 12.5, color: A.ink2, lineHeight: 1.65, border: `1px solid ${A.hairline2}` }}>
              <span style={{ fontFamily: A.serif, fontWeight: 600, color: A.ink }}>欢迎，我是「心血管分册」的 AI 版作者团队</span>
              <span style={{ display: 'block', marginTop: 3 }}>每一条回答都来自原书。试着问问"造影前后的抗凝怎么管理"。</span>
            </div>
          </div>

          {/* user question */}
          <div style={{ alignSelf: 'flex-end', maxWidth: '78%' }}>
            <div style={{ background: A.ink, color: A.bg, borderRadius: '14px 4px 14px 14px',
              padding: '10px 14px', fontSize: 13.5, lineHeight: 1.55, fontWeight: 400 }}>
              冠脉造影术前的抗凝管理怎么做？患者长期服用华法林。
            </div>
          </div>

          {/* AI answer block */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* thinking trail */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: A.muted, fontSize: 11 }}>
              <Icon name="sparkle" size={12} stroke={A.seal} strokeWidth={1.7} />
              <span style={{ fontFamily: A.mono, letterSpacing: 0.3 }}>已检索 4 章 · 引用 7 处 · 用时 1.8s</span>
            </div>

            {/* text answer (streaming) */}
            <div style={{ background: A.card, borderRadius: 14, padding: '14px 14px 12px',
              border: `1px solid ${A.hairline2}`, boxShadow: A.shadow }}>
              <div style={{ fontSize: 13.5, lineHeight: 1.85, color: A.ink, letterSpacing: 0.2 }}>
                术前的抗凝管理需要根据 <span style={{ color: A.seal, fontWeight: 500 }}>出血风险</span> 与 <span style={{ color: A.seal, fontWeight: 500 }}>血栓风险</span> 双向评估：
                <div style={{ marginTop: 6 }}>
                  · 长期口服华法林者，建议术前 3–5 天停药，待 INR ≤ 1.5 后再行造影；
                </div>
                <div>· 高血栓风险（机械瓣、近 3 个月血栓事件）需 <span style={{ color: A.seal, fontWeight: 500 }}>低分子肝素桥接</span>；</div>
                <div>· 一般经桡动脉路径的诊断性造影，可不停华法林（INR &lt; 3.0 时安全可行<span style={{ verticalAlign: 'super', fontSize: 9, color: A.seal, fontWeight: 600, marginLeft: 1 }}>[3]</span>）。</div>
                {/* cursor */}
                <span style={{ display: 'inline-block', width: 7, height: 14, background: A.ink, marginLeft: 2, verticalAlign: '-3px', animation: 'none' }} />
              </div>
            </div>

            {/* 三件套 — 多模态卡片 */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7, padding: '0 2px' }}>
                <span style={{ fontFamily: A.serif, fontSize: 12, fontWeight: 600, color: A.ink, letterSpacing: 0.5 }}>· 配套素材</span>
                <span style={{ fontSize: 10.5, color: A.muted, fontFamily: A.mono }}>3 / 5  ›</span>
              </div>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', margin: '0 -16px', padding: '0 16px 4px' }} className="ab-scroll">
                <AModalCard kind="free" type="audio" title="编者导读：抗栓评估的总思路" meta="2:48" />
                <AModalCard kind="member" type="image" title="冠脉解剖图谱 · 高清" meta="第 12 页" locked />
                <AModalCard kind="forever" type="video" title="桡动脉造影手术示教（带解说）" meta="14:22" locked price="29" />
              </div>
            </div>

            {/* 三件套 — 回答溯源（默认收起） */}
            <div style={{ background: A.paper, borderRadius: 10, padding: '11px 13px',
              border: `1px dashed ${A.hairline}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="sources" size={16} stroke={A.seal} strokeWidth={1.6} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: A.ink, letterSpacing: 0.3 }}>
                  <span style={{ fontFamily: A.serif }}>5 处出处</span> · 来自第 4 章 / 第 7 章
                </div>
                <div style={{ fontSize: 10.5, color: A.muted, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  §4.2 抗栓药物围术期管理 · §7.1 桡动脉路径 …
                </div>
              </div>
              <Icon name="chevronDown" size={14} stroke={A.muted} />
            </div>

            {/* 三件套 — 推荐追问 */}
            <div>
              <div style={{ fontFamily: A.serif, fontSize: 12, fontWeight: 600, color: A.ink, marginBottom: 7, padding: '0 2px', letterSpacing: 0.5 }}>· 你也可以问</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  '支架植入后双抗 DAPT 持续多久？',
                  '造影剂过敏的预案与抢救流程？',
                  'INR > 3.0 急诊造影怎么办？',
                ].map((t) => (
                  <div key={t} style={{ background: A.card, border: `1px solid ${A.hairline2}`, borderRadius: 22,
                    padding: '8px 13px', fontSize: 12.5, color: A.ink2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{t}</span>
                    <Icon name="chevron" size={12} stroke={A.muted} />
                  </div>
                ))}
              </div>
            </div>

            {/* TTS bar */}
            <div style={{ background: A.card, border: `1px solid ${A.hairline2}`, borderRadius: 10,
              padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 28, height: 28, borderRadius: 14, background: A.seal, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="play" size={11} fill="#fff" stroke="none" />
              </span>
              {/* progress bar with waveform */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.5, height: 18 }}>
                {Array.from({ length: 36 }).map((_, i) => {
                  const h = 4 + Math.abs(Math.sin(i * 0.7)) * 13;
                  return <span key={i} style={{ width: 2, height: h, borderRadius: 1, background: i < 12 ? A.seal : A.subtle, opacity: i < 12 ? 0.85 : 0.5 }} />;
                })}
              </div>
              <span style={{ fontSize: 10.5, color: A.muted, fontFamily: A.mono }}>0:08 / 0:42</span>
              <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: A.paper, color: A.ink2, fontFamily: A.mono }}>1.0×</span>
            </div>

            {/* action row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
              <div style={{ display: 'flex', gap: 18, color: A.muted }}>
                <Icon name="copy" size={16} />
                <Icon name="heart" size={16} />
                <Icon name="bookmark" size={16} />
                <Icon name="refresh" size={16} />
              </div>
              <div style={{ fontSize: 10.5, color: A.muted, fontFamily: A.mono }}>3 / 5 答案</div>
            </div>

            {/* 延伸视图 mini bar — 永享购买入口 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px',
              background: `linear-gradient(95deg, #f9efd8, ${A.paper})`, borderRadius: 10,
              border: `1px solid ${A.goldSoft}` }}>
              <div style={{ width: 36, height: 36, borderRadius: 6,
                background: `linear-gradient(160deg, #2a241e, ${A.ink2})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: A.gold }}>
                <Icon name="play" size={14} fill={A.gold} stroke="none" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: A.muted, letterSpacing: 0.3 }}>本回答提到了 <span style={{ color: A.seal, fontWeight: 600 }}>1 项永享</span></div>
                <div style={{ fontSize: 12.5, color: A.ink, fontWeight: 500, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  桡动脉造影手术示教视频包 · 14 段
                </div>
              </div>
              <button style={{ background: A.ink, color: A.bg, border: 'none', borderRadius: 99,
                padding: '6px 12px', fontSize: 11.5, fontWeight: 500, fontFamily: A.sans, letterSpacing: 0.3, whiteSpace: 'nowrap' }}>
                ¥29 永享
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* input area */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0,
        background: A.paper, borderTop: `1px solid ${A.hairline2}`,
        padding: '10px 14px 28px' }}>
        {/* tools row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: A.muted, fontSize: 11, marginBottom: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: A.seal }}>
            <Icon name="sparkle" size={12} stroke={A.seal} /> 深度
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: 3, background: A.jade }} /> 联网
          </span>
          <span style={{ flex: 1 }} />
          <span>500 字以内</span>
        </div>
        {/* input row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 38, height: 38, borderRadius: 19, background: A.card, border: `1px solid ${A.hairline2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: A.ink2 }}>
            <Icon name="plus" size={18} />
          </span>
          <div style={{ flex: 1, height: 38, background: A.card, borderRadius: 19, border: `1px solid ${A.hairline2}`,
            display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 13, color: A.subtle }}>
            向 AI 提问，最多 500 字
          </div>
          <span style={{ width: 38, height: 38, borderRadius: 19, background: A.ink, color: A.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="mic" size={18} stroke={A.bg} />
          </span>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 3 — 多模态卡片锁标 → 付费墙弹窗
//   背景：会话页 dimmed；前景：底部抽屉，"升级会员 / 单品永享 / 兑换码"三选一
// ─────────────────────────────────────────────────────────────
function A_Paywall() {
  return (
    <PhoneFrame bg={A.bg} fontFamily={A.sans}>
      {/* dimmed conversation peek */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
        <A_Conversation />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,24,20,0.55)', backdropFilter: 'blur(2px)' }} />

      {/* bottom sheet */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0,
        background: A.bg, borderRadius: '20px 20px 0 0', padding: '14px 18px 28px',
        boxShadow: '0 -8px 32px rgba(0,0,0,.18)', maxHeight: '88%', overflow: 'hidden' }}>
        {/* drag handle + close */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: A.subtle }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: A.serif, fontSize: 18, fontWeight: 600, color: A.ink, letterSpacing: 0.5 }}>
              这是机构标注的<span style={{ color: A.seal }}>会员素材</span>
            </div>
            <div style={{ fontSize: 11.5, color: A.muted, marginTop: 4 }}>选一种方式解锁，下面三种都可以</div>
          </div>
          <span style={{ width: 28, height: 28, borderRadius: 14, background: A.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', color: A.muted }}>
            <Icon name="close" size={14} />
          </span>
        </div>

        {/* asset preview */}
        <div style={{ display: 'flex', gap: 12, padding: 12, background: A.paper, borderRadius: 10, marginBottom: 16,
          border: `1px solid ${A.hairline2}` }}>
          <div style={{ width: 60, height: 60, borderRadius: 6, background: `linear-gradient(135deg, ${A.goldSoft}, ${A.sealSoft})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <svg width="60" height="60" viewBox="0 0 60 60" style={{ position: 'absolute', opacity: 0.5 }}>
              <path d="M5 50 Q 25 25, 40 38 T 60 35 L60 60 L0 60 Z" fill={A.sealDeep} opacity="0.5" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,24,20,.3)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="lock" size={16} stroke="#fff" />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: A.ink, fontFamily: A.serif }}>冠脉解剖图谱 · 高清</div>
            <div style={{ fontSize: 11, color: A.muted, marginTop: 4, lineHeight: 1.6 }}>来自《心血管分册》第 12 页 · 1 张图 · 4096×2730px</div>
            <div style={{ marginTop: 6 }}><ATag kind="member">机构标注 · 会员素材</ATag></div>
          </div>
        </div>

        {/* path 1 — member (recommended) */}
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <div style={{ position: 'absolute', top: -1, right: 12, background: A.seal, color: '#fff', fontSize: 9.5, fontWeight: 600, padding: '2px 8px', borderRadius: '0 0 4px 4px', letterSpacing: 0.5 }}>性价比推荐</div>
          <div style={{ background: A.card, border: `1.5px solid ${A.seal}`, borderRadius: 12, padding: '16px 16px 14px', boxShadow: A.shadow }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ width: 30, height: 30, borderRadius: 6, background: A.seal, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="crown" size={16} fill="#fff" stroke="#fff" />
                </span>
                <span style={{ fontFamily: A.serif, fontSize: 15.5, fontWeight: 600, color: A.ink }}>升级 AI 会员</span>
              </div>
              <div>
                <span style={{ fontFamily: A.serif, fontSize: 22, fontWeight: 700, color: A.seal }}>¥9.9</span>
                <span style={{ fontSize: 11, color: A.muted, marginLeft: 4 }}>首月</span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: A.ink2, marginTop: 8, lineHeight: 1.7 }}>
              · 解锁本机构全部<span style={{ color: A.seal, fontWeight: 500 }}>会员图 / 音 / 视频</span><br />
              · 实时电话语音 + 数字人对话<br />
              · 续期 ¥18 / 月，可随时取消
            </div>
          </div>
        </div>

        {/* path 2 — single forever */}
        <div style={{ background: A.card, border: `1px solid ${A.hairline2}`, borderRadius: 12, padding: '14px 16px', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ width: 30, height: 30, borderRadius: 6, background: A.paper, color: A.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="bookmark" size={15} stroke={A.gold} />
              </span>
              <div>
                <div style={{ fontFamily: A.serif, fontSize: 15, fontWeight: 600, color: A.ink }}>单品永享</div>
                <div style={{ fontSize: 10.5, color: A.muted, marginTop: 1 }}>只买这一张图 · 永久收藏</div>
              </div>
            </div>
            <div>
              <span style={{ fontFamily: A.serif, fontSize: 19, fontWeight: 700, color: A.ink }}>¥6</span>
            </div>
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: A.jade, background: 'rgba(107,138,94,.08)', padding: '6px 9px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="check" size={11} stroke={A.jade} strokeWidth={2.2} />
            买断不过期，会员到期也能继续看
          </div>
        </div>

        {/* path 3 — code */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: A.paper, borderRadius: 10, marginBottom: 14 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: A.ink2 }}>
            <span style={{ width: 26, height: 26, borderRadius: 13, background: A.card, color: A.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="qr" size={13} />
            </span>
            有兑换码？
          </span>
          <span style={{ fontSize: 12, color: A.seal, fontWeight: 500 }}>立即兑换 ›</span>
        </div>

        <div style={{ fontSize: 10.5, color: A.muted, textAlign: 'center', lineHeight: 1.7 }}>
          点击解锁即代表同意 <span style={{ color: A.seal }}>《会员服务协议》</span> · 微信支付
        </div>
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 4 — AI 会员订阅页
// ─────────────────────────────────────────────────────────────
function A_Membership() {
  return (
    <PhoneFrame bg={A.bg} fontFamily={A.sans}>
      <AHeader
        left={<AIconBtn name="back" />}
        title="AI 会员"
        right={<AIconBtn name="more" />}
      />
      <div style={{ position: 'absolute', top: 96, bottom: 100, left: 0, right: 0, overflow: 'hidden' }}>
        <div style={{ padding: '8px 18px 16px' }}>
          {/* hero */}
          <div style={{
            background: `linear-gradient(155deg, ${A.ink} 0%, #2a241e 100%)`,
            borderRadius: 16, padding: '20px 18px',
            color: A.bg, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 150, height: 150,
              borderRadius: '50%', background: `radial-gradient(circle, ${A.seal}66, transparent 70%)` }} />
            <div style={{ position: 'absolute', top: 16, right: 16 }}>
              <ASeal size={36} />
            </div>
            <div style={{ fontFamily: A.mono, fontSize: 11, color: A.gold, letterSpacing: 4, marginBottom: 10 }}>AI · MEMBER</div>
            <div style={{ fontFamily: A.serif, fontSize: 24, fontWeight: 600, letterSpacing: 1 }}>解锁这本书的全部声音与影像</div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.7)', marginTop: 8, lineHeight: 1.7 }}>
              文字答案永远免费 · 会员仅解锁多模态素材与实时语音
            </div>
          </div>

          {/* plans */}
          <div style={{ marginTop: 18, fontFamily: A.serif, fontSize: 13, fontWeight: 600, color: A.ink, letterSpacing: 0.5, marginBottom: 10 }}>· 选择套餐</div>
          {[
            { tag: '首月特惠', name: '月度会员', sub: '续期 ¥18 / 月', price: '9.9', orig: '18', period: '月', best: false },
            { tag: '推荐', name: '年度会员', sub: '日均 ¥0.46 · 省 ¥48', price: '168', orig: '216', period: '年', best: true },
            { tag: null, name: '季度会员', sub: '续期 ¥49 / 季', price: '49', orig: '54', period: '季', best: false },
          ].map((p, i) => (
            <div key={i} style={{
              background: p.best ? A.card : A.paper,
              border: `${p.best ? 1.5 : 1}px solid ${p.best ? A.seal : A.hairline2}`,
              borderRadius: 12, padding: '14px 16px', marginBottom: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              position: 'relative', boxShadow: p.best ? A.shadow : 'none',
            }}>
              {p.tag && (
                <span style={{ position: 'absolute', top: -9, left: 14, background: p.best ? A.seal : A.gold, color: '#fff',
                  fontSize: 9.5, padding: '2px 8px', borderRadius: 4, fontWeight: 600, letterSpacing: 0.5 }}>{p.tag}</span>
              )}
              <div>
                <div style={{ fontFamily: A.serif, fontSize: 15, fontWeight: 600, color: A.ink }}>{p.name}</div>
                <div style={{ fontSize: 11, color: A.muted, marginTop: 3 }}>{p.sub}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>
                  <span style={{ fontFamily: A.serif, fontSize: 22, fontWeight: 700, color: p.best ? A.seal : A.ink }}>¥{p.price}</span>
                  <span style={{ fontSize: 11, color: A.muted, marginLeft: 3 }}>/{p.period}</span>
                </div>
                <div style={{ fontSize: 10, color: A.muted, textDecoration: 'line-through', fontFamily: A.mono }}>¥{p.orig}</div>
              </div>
            </div>
          ))}

          {/* benefits */}
          <div style={{ marginTop: 18, fontFamily: A.serif, fontSize: 13, fontWeight: 600, color: A.ink, letterSpacing: 0.5, marginBottom: 10 }}>· 会员权益</div>
          <div style={{ background: A.paper, borderRadius: 12, border: `1px solid ${A.hairline2}` }}>
            {[
              ['image', '解锁全部会员图谱', '1248 张高清医学插图'],
              ['headphones', '解锁全部会员音频', '编者讲解 · 临床录音'],
              ['phone', '实时电话式语音对话', '可与数字人持续对话'],
              ['sparkle', '深度思考优先排队', '更长上下文 · 更稳定'],
            ].map(([ic, t, sub], i, a) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px',
                borderBottom: i < a.length - 1 ? `1px solid ${A.hairline2}` : 'none' }}>
                <span style={{ width: 32, height: 32, borderRadius: 8, background: A.card, color: A.seal,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={ic} size={16} stroke={A.seal} />
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: A.ink }}>{t}</div>
                  <div style={{ fontSize: 10.5, color: A.muted, marginTop: 1 }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 10.5, color: A.muted, marginTop: 14, lineHeight: 1.7, padding: '0 2px' }}>
            自动续费可随时在「我的 — 会员中心」取消，到期前 24 小时短信提醒。
            付款代表同意 <span style={{ color: A.seal }}>《会员服务协议》《自动续费协议》</span>。
          </div>
        </div>
      </div>

      {/* bottom CTA bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px 28px',
        background: A.bg, borderTop: `1px solid ${A.hairline2}` }}>
        <button style={{ width: '100%', height: 48, border: 'none', borderRadius: 8, background: A.seal, color: '#fff',
          fontSize: 15, fontWeight: 600, fontFamily: A.sans, letterSpacing: 1, boxShadow: '0 4px 16px rgba(176,74,50,.3)' }}>
          ¥168 开通年度会员
        </button>
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 5 — 实时电话式语音页
// ─────────────────────────────────────────────────────────────
function A_Call() {
  const ringRadii = [60, 80, 100, 124];
  return (
    <PhoneFrame bg={A.ink} fontFamily={A.sans} dark statusColor="#fff">
      {/* warm radial glow */}
      <div style={{ position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 50% 36%, ${A.seal}33 0%, transparent 55%), radial-gradient(circle at 80% 80%, ${A.gold}22, transparent 60%)` }} />

      {/* top meta */}
      <div style={{ position: 'absolute', top: 56, left: 0, right: 0, textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, fontFamily: A.mono }}>· 实时通话中 ·</div>
        <div style={{ fontFamily: A.serif, fontSize: 19, fontWeight: 600, marginTop: 8, letterSpacing: 1 }}>心血管分册 · AI 版作者</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4, fontFamily: A.mono, letterSpacing: 2 }}>
          02 : 34
        </div>
      </div>

      {/* hero — pulsing seal */}
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 270 }}>
        {ringRadii.map((r, i) => (
          <div key={r} style={{
            position: 'absolute', width: r * 2, height: r * 2, borderRadius: '50%',
            border: `1px solid ${A.seal}`, opacity: 0.55 - i * 0.12,
          }} />
        ))}
        {/* waveform ring */}
        <svg width="180" height="180" viewBox="-90 -90 180 180" style={{ position: 'absolute' }}>
          {Array.from({ length: 60 }).map((_, i) => {
            const a = (i / 60) * Math.PI * 2;
            const baseR = 78;
            const amp = 6 + Math.abs(Math.sin(i * 0.42 + 1)) * 14;
            const x1 = Math.cos(a) * baseR, y1 = Math.sin(a) * baseR;
            const x2 = Math.cos(a) * (baseR + amp), y2 = Math.sin(a) * (baseR + amp);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={A.gold} strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" />;
          })}
        </svg>
        <ASeal size={108} deco />
      </div>

      {/* live transcript snippet */}
      <div style={{ position: 'absolute', top: 500, left: 32, right: 32, textAlign: 'center', color: 'rgba(255,255,255,0.85)', fontSize: 13.5, lineHeight: 1.7, fontFamily: A.serif, letterSpacing: 0.5 }}>
        "造影后即可恢复华法林口服，<br />一般同日或次日恢复至原维持剂量……"
      </div>

      {/* status pill */}
      <div style={{ position: 'absolute', top: 600, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 99,
          padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>
          <Dot color={A.gold} size={6} />
          AI 在说话 · 你可以随时插话
        </div>
      </div>

      {/* controls */}
      <div style={{ position: 'absolute', bottom: 70, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '0 30px' }}>
        {[
          { ic: 'audio', label: '切音色', sub: '清越男声' },
          { ic: 'mic', label: '静音', sub: null, dim: true },
          { ic: 'phone', label: '挂断', sub: null, danger: true },
        ].map((c, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
            <span style={{ width: c.danger ? 64 : 56, height: c.danger ? 64 : 56, borderRadius: c.danger ? 32 : 28,
              background: c.danger ? A.seal : 'rgba(255,255,255,0.08)',
              border: c.danger ? 'none' : '1px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: c.danger ? 'rotate(135deg)' : 'none' }}>
              <Icon name={c.ic} size={c.danger ? 26 : 22} stroke="#fff" strokeWidth={1.6} />
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', letterSpacing: 0.5 }}>{c.label}</span>
          </div>
        ))}
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 6 — 我的主页
// ─────────────────────────────────────────────────────────────
function A_Profile() {
  return (
    <PhoneFrame bg={A.bg} fontFamily={A.sans}>
      {/* warm hero header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 280,
        background: `linear-gradient(170deg, #ecdec4 0%, ${A.bg} 75%)`,
      }}>
        <svg width="375" height="280" viewBox="0 0 375 280" style={{ position: 'absolute', inset: 0, opacity: 0.18 }}>
          <circle cx="320" cy="40" r="60" fill={A.seal} />
          <circle cx="60" cy="200" r="80" fill={A.gold} />
        </svg>
      </div>

      <AHeader transparent
        left={null}
        title=""
        right={<div style={{ display: 'flex', gap: 4 }}><AIconBtn name="settings" /><AIconBtn name="qr" /></div>}
      />

      <div style={{ position: 'absolute', top: 64, left: 22, fontFamily: A.serif, fontSize: 26, fontWeight: 700, color: A.ink, letterSpacing: 1 }}>
        我的
      </div>

      <div style={{ position: 'absolute', top: 110, left: 0, right: 0, bottom: 24, overflow: 'hidden' }}>
        <div style={{ padding: '0 18px 24px' }}>
          {/* profile card */}
          <div style={{ background: A.card, borderRadius: 16, padding: '18px 16px', boxShadow: A.shadow, border: `1px solid ${A.hairline2}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: 26, background: A.paper,
                border: `2px solid ${A.gold}`, position: 'relative', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: A.serif, fontSize: 22, fontWeight: 600, color: A.ink2 }}>陈</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: A.serif, fontSize: 17, fontWeight: 600, color: A.ink }}>陈医生</div>
                <div style={{ fontSize: 11, color: A.muted, marginTop: 3, fontFamily: A.mono, letterSpacing: 0.5 }}>+86  138 ****  4421</div>
              </div>
              <Icon name="chevron" size={14} stroke={A.muted} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '8px 10px', background: A.paper, borderRadius: 8, fontSize: 11.5, color: A.ink2 }}>
              <Icon name="book" size={13} stroke={A.seal} strokeWidth={1.6} />
              <span style={{ flex: 1 }}>当前机构 · <span style={{ fontWeight: 600 }}>中国医学临床百家</span></span>
              <span style={{ fontSize: 11, color: A.seal }}>切换 ›</span>
            </div>
          </div>

          {/* member card */}
          <div style={{ marginTop: 14, background: `linear-gradient(150deg, ${A.ink} 0%, #2a241e 100%)`,
            borderRadius: 14, padding: '14px 16px', color: A.bg, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.4 }}>
              <ASeal size={68} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="crown" size={14} fill={A.gold} stroke={A.gold} />
              <span style={{ fontFamily: A.serif, fontSize: 14, fontWeight: 600, letterSpacing: 0.5 }}>AI 会员 · 月度</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginTop: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>有效期至</div>
                <div style={{ fontFamily: A.mono, fontSize: 16, color: A.gold, marginTop: 2, letterSpacing: 1 }}>2026.05.30</div>
              </div>
              <div style={{ flex: 1 }} />
              <button style={{ background: A.gold, color: A.ink, border: 'none', padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, fontFamily: A.sans }}>
                续费 ¥9.9
              </button>
            </div>
          </div>

          {/* stats — 永享 / 历史 / 收藏 */}
          <div style={{ marginTop: 14, background: A.card, borderRadius: 14, border: `1px solid ${A.hairline2}`,
            display: 'flex' }}>
            {[
              ['12', '已永享'],
              ['28', '历史会话'],
              ['14', '我的收藏'],
            ].map(([n, l], i, a) => (
              <div key={l} style={{ flex: 1, padding: '14px 0', textAlign: 'center',
                borderRight: i < a.length - 1 ? `1px solid ${A.hairline2}` : 'none' }}>
                <div style={{ fontFamily: A.serif, fontSize: 22, fontWeight: 700, color: A.ink, lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 11, color: A.muted, marginTop: 4, letterSpacing: 0.5 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* menu list */}
          <div style={{ marginTop: 14, background: A.card, borderRadius: 14, border: `1px solid ${A.hairline2}`, overflow: 'hidden' }}>
            {[
              ['bookmark', '永享列表', '12 项 · 7 张图 · 4 段视频 · 1 段音频'],
              ['history', '历史会话', '90 天内 · 28 条会话'],
              ['heart', '我的收藏', '14 条答案'],
              ['pdf', '订单中心', '会员 / 永享 / 兑换码'],
              ['phone', '联系客服', '机构企微 · 个微 · 电话'],
              ['settings', '账号设置', '手机号 · 隐私 · 通知'],
            ].map(([ic, t, sub], i, a) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                borderBottom: i < a.length - 1 ? `1px solid ${A.hairline2}` : 'none' }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, background: A.paper, color: A.seal,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={ic} size={15} stroke={A.seal} strokeWidth={1.6} />
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, color: A.ink, fontWeight: 500 }}>{t}</div>
                  <div style={{ fontSize: 10.5, color: A.muted, marginTop: 1 }}>{sub}</div>
                </div>
                <Icon name="chevron" size={13} stroke={A.subtle} />
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, fontSize: 10, color: A.subtle, textAlign: 'center', fontFamily: A.mono, letterSpacing: 1 }}>
            AI 问书 · v 4.0.2 · 中国医学临床百家
          </div>
        </div>
      </div>

      {/* tabbar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 76, paddingBottom: 18,
        background: A.paper + 'f8', backdropFilter: 'blur(8px)', borderTop: `1px solid ${A.hairline2}`,
        display: 'flex' }}>
        {[
          ['chat', '问书', false],
          ['history', '历史', false],
          ['user', '我的', true],
        ].map(([ic, l, on]) => (
          <div key={l} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, color: on ? A.seal : A.muted }}>
            <Icon name={ic} size={20} stroke={on ? A.seal : A.muted} strokeWidth={on ? 1.9 : 1.5} />
            <span style={{ fontSize: 10.5, fontWeight: on ? 600 : 400, letterSpacing: 0.5 }}>{l}</span>
          </div>
        ))}
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 7 — 历史会话详情页（回看）
// ─────────────────────────────────────────────────────────────
function A_History() {
  return (
    <PhoneFrame bg={A.bg} fontFamily={A.sans}>
      <AHeader
        left={<AIconBtn name="back" />}
        title="2026.04.18  09:41"
        subtitle="历史会话 · 回看模式"
        right={<div style={{ display: 'flex', gap: 0 }}><AIconBtn name="share" /><AIconBtn name="more" /></div>}
      />

      <div style={{ position: 'absolute', top: 96, bottom: 88, left: 0, right: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* read-only banner */}
          <div style={{ background: A.paper, border: `1px dashed ${A.hairline}`, borderRadius: 8,
            padding: '8px 12px', fontSize: 11, color: A.muted, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Icon name="history" size={12} stroke={A.muted} />
            历史回看 · 90 天内可访问 · 含 3 条往返
          </div>

          {/* Q1 */}
          <div style={{ alignSelf: 'flex-end', maxWidth: '78%' }}>
            <div style={{ background: A.ink, color: A.bg, borderRadius: '14px 4px 14px 14px',
              padding: '10px 14px', fontSize: 13.5, lineHeight: 1.55 }}>
              心电图 ST 段抬高怎么快速判断是 STEMI？
            </div>
            <div style={{ fontSize: 10, color: A.muted, marginTop: 4, textAlign: 'right' }}>09:41</div>
          </div>

          {/* A1 */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <ASeal size={26} />
            <div style={{ flex: 1, background: A.card, border: `1px solid ${A.hairline2}`, borderRadius: 12,
              padding: '12px 14px' }}>
              <div style={{ fontSize: 13, lineHeight: 1.8, color: A.ink, letterSpacing: 0.2 }}>
                STEMI 的判定核心是相邻两个导联 ST 段抬高 ≥ 0.1 mV（V2-V3 男性 ≥ 0.2 mV，女性 ≥ 0.15 mV）<span style={{ verticalAlign: 'super', fontSize: 9, color: A.seal }}>[1]</span>，并伴胸痛、动态心电图变化或心肌损伤标志物升高……
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <ATag kind="muted">📑 3 处出处</ATag>
                <ATag kind="free">🎧 编者讲解 · 已听</ATag>
              </div>
            </div>
          </div>

          {/* Q2 */}
          <div style={{ alignSelf: 'flex-end', maxWidth: '78%' }}>
            <div style={{ background: A.ink, color: A.bg, borderRadius: '14px 4px 14px 14px',
              padding: '10px 14px', fontSize: 13.5, lineHeight: 1.55 }}>
              直接 PCI 的时间窗是怎么定的？
            </div>
            <div style={{ fontSize: 10, color: A.muted, marginTop: 4, textAlign: 'right' }}>09:43</div>
          </div>

          {/* A2 (truncated preview) */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <ASeal size={26} />
            <div style={{ flex: 1, background: A.card, border: `1px solid ${A.hairline2}`, borderRadius: 12,
              padding: '12px 14px' }}>
              <div style={{ fontSize: 13, lineHeight: 1.8, color: A.ink }}>
                目标是首次医疗接触至导丝通过（FMC-to-Wire）≤ 90 分钟。如果患者首诊于不能 PCI 的医院，120 分钟内能转到 PCI 中心则首选 PCI；否则启动溶栓……
              </div>
              <div style={{ marginTop: 10, padding: '8px 10px', background: A.paper, borderRadius: 8,
                display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${A.hairline2}` }}>
                <span style={{ width: 28, height: 28, borderRadius: 4, background: `linear-gradient(135deg, ${A.goldSoft}, ${A.sealSoft})` }} />
                <div style={{ flex: 1, fontSize: 11.5 }}>
                  <div style={{ color: A.ink, fontWeight: 500 }}>STEMI 救治时间窗示意图</div>
                  <div style={{ color: A.muted, fontSize: 10, marginTop: 1 }}>已永享 · 第 23 页</div>
                </div>
                <Icon name="chevron" size={12} stroke={A.muted} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* "继续追问" sticky */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px 24px',
        background: A.bg, borderTop: `1px solid ${A.hairline2}` }}>
        <button style={{ width: '100%', height: 44, border: `1.5px solid ${A.ink}`, borderRadius: 22, background: A.bg,
          color: A.ink, fontSize: 14, fontWeight: 500, fontFamily: A.sans, letterSpacing: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="chat" size={16} stroke={A.ink} />
          基于这次对话继续追问
        </button>
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 8 — 客服入口弹窗
// ─────────────────────────────────────────────────────────────
function FakeQR({ size = 96, label }) {
  // hand-drawn-feeling QR. NOT a scannable code — just a visual placeholder.
  const cells = 11;
  const seed = label || 'qr';
  const filled = (i, j) => {
    const k = (i * 31 + j * 17 + seed.charCodeAt(seed.length % 7) * 7) % 10;
    if (i < 3 && j < 3) return false; // finder corner
    if (i < 3 && j > cells - 4) return false;
    if (i > cells - 4 && j < 3) return false;
    return k > 5;
  };
  const c = size / cells;
  return (
    <div style={{ width: size, height: size, background: '#fff', padding: 4, borderRadius: 6, position: 'relative', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.08)' }}>
      <svg width={size - 8} height={size - 8} viewBox={`0 0 ${size - 8} ${size - 8}`}>
        {[[0, 0], [0, cells - 3], [cells - 3, 0]].map(([i, j], k) => (
          <g key={k}>
            <rect x={j * c} y={i * c} width={c * 3} height={c * 3} fill={A.ink} />
            <rect x={j * c + c * 0.5} y={i * c + c * 0.5} width={c * 2} height={c * 2} fill="#fff" />
            <rect x={j * c + c} y={i * c + c} width={c} height={c} fill={A.ink} />
          </g>
        ))}
        {Array.from({ length: cells }).flatMap((_, i) =>
          Array.from({ length: cells }).map((__, j) =>
            filled(i, j) ? <rect key={`${i}-${j}`} x={j * c} y={i * c} width={c * 0.92} height={c * 0.92} fill={A.ink} /> : null
          )
        )}
      </svg>
    </div>
  );
}

function A_Service() {
  return (
    <PhoneFrame bg={A.bg} fontFamily={A.sans}>
      {/* dimmed bg */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.4 }}><A_Profile /></div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,24,20,0.55)' }} />

      {/* sheet */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0,
        background: A.bg, borderRadius: '20px 20px 0 0', padding: '14px 18px 30px',
        boxShadow: '0 -8px 32px rgba(0,0,0,.18)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: A.subtle }} />
        </div>

        {/* head */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: A.serif, fontSize: 20, fontWeight: 600, color: A.ink, letterSpacing: 0.5 }}>联系客服</div>
            <div style={{ fontSize: 11.5, color: A.muted, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="book" size={11} stroke={A.muted} /> 中国医学临床百家 · 客服中心
            </div>
          </div>
          <span style={{ width: 30, height: 30, borderRadius: 15, background: A.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', color: A.muted }}>
            <Icon name="close" size={14} />
          </span>
        </div>

        {/* QR cards */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          {[
            { name: '企业微信', sub: '官方客服 · 工作日响应', label: '小张' },
            { name: '个人微信', sub: '订单 · 发票 · 售后', label: '小李' },
          ].map((q) => (
            <div key={q.name} style={{ flex: 1, background: A.card, borderRadius: 12, padding: '14px 12px', border: `1px solid ${A.hairline2}`, textAlign: 'center', boxShadow: A.shadow }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                <FakeQR size={104} label={q.label} />
              </div>
              <div style={{ fontFamily: A.serif, fontSize: 13, fontWeight: 600, color: A.ink }}>{q.name}</div>
              <div style={{ fontSize: 10.5, color: A.muted, marginTop: 3, lineHeight: 1.5 }}>{q.sub}</div>
              <div style={{ marginTop: 8, fontSize: 10.5, color: A.seal, fontWeight: 500 }}>长按保存图片</div>
            </div>
          ))}
        </div>

        {/* phone & email */}
        <div style={{ background: A.paper, borderRadius: 12, padding: '4px 0', border: `1px solid ${A.hairline2}` }}>
          {[
            { ic: 'phone', label: '客服电话', value: '010 - 8888 6666', accent: A.seal },
            { ic: 'sources', label: '客服邮箱', value: 'service@cmp-clinical.cn', accent: A.gold },
          ].map((row, i, a) => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', gap: 12,
              borderBottom: i < a.length - 1 ? `1px solid ${A.hairline2}` : 'none' }}>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: A.card, color: row.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={row.ic} size={15} stroke={row.accent} />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: A.muted }}>{row.label}</div>
                <div style={{ fontSize: 14, color: A.ink, fontFamily: A.mono, marginTop: 2, letterSpacing: 0.4 }}>{row.value}</div>
              </div>
              <Icon name="chevron" size={13} stroke={A.muted} />
            </div>
          ))}
        </div>

        {/* hours */}
        <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(107,138,94,0.08)',
          borderRadius: 8, fontSize: 11.5, color: A.jade, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="timer" size={13} stroke={A.jade} />
          <span>工作时间 · 周一至周五 09:00 — 18:00</span>
        </div>

        <div style={{ marginTop: 14, fontSize: 10.5, color: A.muted, textAlign: 'center', lineHeight: 1.7 }}>
          所有客服信息由「中国医学临床百家」机构方提供
        </div>
      </div>
    </PhoneFrame>
  );
}

Object.assign(window, { A_Paywall, A_Membership, A_Call, A_Profile, A_History, A_Service, FakeQR });
