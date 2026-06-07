// ─────────────────────────────────────────────────────────────
// Tokens / 关键组件说明卡
// 把两个方向的色板、字体、Tag、按钮、消息气泡 一并铺出来对比
// ─────────────────────────────────────────────────────────────

function TokenSheet({ dir, title, sub, S, mark }) {
  const fontStack = dir === 'A' ? S.serif : S.display;
  const swatches = dir === 'A'
    ? [
        ['#fbf6ec', 'paper-bg'], ['#f6f0e2', 'paper-2'],
        [S.ink, 'ink'], [S.muted, 'muted'],
        [S.seal, 'seal · 强调'], [S.gold, 'gold · 永享'], [S.jade, 'jade · 免费'],
      ]
    : [
        ['#f6f4f0', 'cream-bg'], ['#ffffff', 'surface'],
        [S.ink, 'ink'], [S.muted, 'muted'],
        [S.indigo, 'indigo · 主'], [S.coral, 'coral · 永享'],
        [S.amber, 'amber · 会员'], [S.green, 'green · 免费'],
      ];

  return (
    <div style={{
      width: 720, padding: 28, background: dir === 'A' ? S.bg : S.bg,
      borderRadius: 16, fontFamily: dir === 'A' ? S.sans : S.sans, color: S.ink,
      border: `1px solid ${dir === 'A' ? S.hairline2 : S.hairline2}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        {mark}
        <div>
          <div style={{ fontFamily: fontStack, fontSize: 20, fontWeight: 700, letterSpacing: 0.5 }}>{title}</div>
          <div style={{ fontSize: 12, color: S.muted, marginTop: 3 }}>{sub}</div>
        </div>
      </div>

      {/* swatches */}
      <div style={{ fontSize: 11, color: S.muted, letterSpacing: 1, marginBottom: 8 }}>· COLORS</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 18 }}>
        {swatches.map(([c, l]) => (
          <div key={l}>
            <div style={{ height: 42, borderRadius: 8, background: c, border: c === '#ffffff' || c === '#fbf6ec' || c === '#f6f4f0' ? `1px solid ${S.hairline2}` : 'none' }} />
            <div style={{ fontSize: 10, color: S.ink2, marginTop: 5, fontWeight: 500 }}>{l}</div>
            <div style={{ fontSize: 9, color: S.muted, fontFamily: S.mono }}>{c.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* type */}
      <div style={{ fontSize: 11, color: S.muted, letterSpacing: 1, marginBottom: 8 }}>· TYPE</div>
      <div style={{ background: dir === 'A' ? S.paper : S.surface, borderRadius: 12, padding: 16, marginBottom: 18, border: `1px solid ${S.hairline2}` }}>
        <div style={{ fontFamily: fontStack, fontSize: 28, fontWeight: 700, letterSpacing: dir === 'A' ? 1 : -0.5, lineHeight: 1.2 }}>
          {dir === 'A' ? '问书 · 心血管分册' : 'AI 问书 / 心血管'}
        </div>
        <div style={{ fontSize: 13.5, color: S.ink2, marginTop: 8, lineHeight: 1.7 }}>
          STEMI 的判定核心是相邻两个导联 ST 段抬高 ≥ 0.1 mV……
        </div>
        <div style={{ fontSize: 11, color: S.muted, marginTop: 10, fontFamily: S.mono, letterSpacing: 0.4 }}>
          ¥168.00  ·  2026.05.30  ·  INR ≤ 1.5
        </div>
      </div>

      {/* tags + buttons + bubble */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: S.muted, letterSpacing: 1, marginBottom: 8 }}>· TAGS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {dir === 'A'
              ? <>
                  <ATag kind="free">免费</ATag>
                  <ATag kind="member">会员</ATag>
                  <ATag kind="forever">永享 ¥6</ATag>
                  <ATag kind="muted">3 处出处</ATag>
                </>
              : <>
                  <BTag kind="free">免费</BTag>
                  <BTag kind="member">会员</BTag>
                  <BTag kind="forever">永享 ¥6</BTag>
                  <BTag kind="muted">3 处出处</BTag>
                </>
            }
          </div>

          <div style={{ fontSize: 11, color: S.muted, letterSpacing: 1, marginTop: 16, marginBottom: 8 }}>· BUTTONS</div>
          {dir === 'A' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button style={{ height: 40, border: 'none', borderRadius: 8, background: S.seal, color: '#fff', fontFamily: S.sans, fontSize: 13, fontWeight: 600, letterSpacing: 1 }}>主操作 · 开通会员</button>
              <button style={{ height: 40, border: `1.5px solid ${S.ink}`, borderRadius: 8, background: 'transparent', color: S.ink, fontSize: 13, fontWeight: 500, letterSpacing: 0.5 }}>次要 · 继续追问</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button style={{ height: 42, border: 'none', borderRadius: 12, background: `linear-gradient(95deg, ${S.indigo}, ${S.indigoDeep})`, color: '#fff', fontFamily: S.sans, fontSize: 13, fontWeight: 600, letterSpacing: 0.5, boxShadow: S.glow }}>主操作 · 开通会员</button>
              <button style={{ height: 42, border: 'none', borderRadius: 12, background: S.surface, color: S.ink, fontSize: 13, fontWeight: 500, boxShadow: S.shadow }}>次要 · 继续追问</button>
            </div>
          )}
        </div>

        <div>
          <div style={{ fontSize: 11, color: S.muted, letterSpacing: 1, marginBottom: 8 }}>· BUBBLE</div>
          {/* user bubble */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
            <div style={{ background: S.ink, color: dir === 'A' ? S.bg : '#fff', borderRadius: dir === 'A' ? '14px 4px 14px 14px' : '14px 4px 14px 14px', padding: '9px 13px', fontSize: 12.5 }}>
              冠脉造影术前抗凝怎么管？
            </div>
          </div>
          {/* AI bubble */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            {mark}
            <div style={{ flex: 1, background: dir === 'A' ? S.card : S.surface, borderRadius: dir === 'A' ? 12 : '4px 14px 14px 14px', padding: '10px 12px', fontSize: 12.5, lineHeight: 1.7, border: dir === 'A' ? `1px solid ${S.hairline2}` : 'none', boxShadow: dir === 'A' ? 'none' : S.shadow, color: S.ink }}>
              术前 3–5 天停华法林，<span style={{ color: dir === 'A' ? S.seal : S.indigo, fontWeight: 500 }}>INR ≤ 1.5</span> 后造影。
            </div>
          </div>

          <div style={{ fontSize: 11, color: S.muted, letterSpacing: 1, marginTop: 16, marginBottom: 8 }}>· INPUT</div>
          <div style={{ height: 40, background: dir === 'A' ? S.paper : S.bg, borderRadius: dir === 'A' ? 8 : 20, display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 12.5, color: S.muted, border: dir === 'A' ? `1px solid ${S.hairline2}` : 'none' }}>
            向 AI 提问 ……
          </div>
        </div>
      </div>
    </div>
  );
}

function TokensA() {
  return <TokenSheet dir="A" S={A}
    title="方向 A · 沉静学术暖色"
    sub="思源宋体 + 思源黑体 · 朱印红 + 古铜金 · 在书页质地里讲专业"
    mark={<ASeal size={42} />}
  />;
}

function TokensB() {
  return <TokenSheet dir="B" S={B}
    title="方向 B · 新潮 AI 工具冷色"
    sub="Manrope + 思源黑体 · 电光靛 + 朝霞橙 · 像一款现代 AI 工具"
    mark={<BBubble size={42} glow />}
  />;
}

Object.assign(window, { TokensA, TokensB });
