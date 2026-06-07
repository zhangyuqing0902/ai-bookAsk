// ─────────────────────────────────────────────────────────────
// AI 问书 · H5 终端读者侧 设计探索
// 平铺画布 · 横滑分组对比
// ─────────────────────────────────────────────────────────────

const PHONE_W = 375;
const PHONE_H = 812;
const TOKEN_W = 720;
const TOKEN_H = 700;
const PAL_W = 320;
const PAL_H = 380;

function Notes({ children }) {
  return (
    <div style={{
      width: 360, padding: '24px 22px', background: '#fbf9f4',
      borderRadius: 14, fontFamily: '"Noto Sans SC", sans-serif',
      color: '#2c2620', fontSize: 13, lineHeight: 1.85,
      border: '1px solid rgba(28,24,20,0.08)',
    }}>
      {children}
    </div>
  );
}

function Cover() {
  return (
    <div style={{
      width: 720, padding: '36px 36px 32px',
      background: 'linear-gradient(135deg, #fbf6ec 0%, #f6f0e2 60%, #ecdec4 100%)',
      borderRadius: 18, fontFamily: '"Noto Sans SC", sans-serif',
      position: 'relative', overflow: 'hidden',
      border: '1px solid rgba(28,24,20,.08)',
    }}>
      <svg width="220" height="220" viewBox="0 0 220 220" style={{ position: 'absolute', top: -30, right: -30, opacity: 0.18 }}>
        <circle cx="110" cy="110" r="100" fill="#b04a32" />
      </svg>
      <div style={{ fontFamily: '"DM Mono", monospace', fontSize: 11, letterSpacing: 4, color: '#9a6d3a', marginBottom: 14 }}>· DESIGN EXPLORATION · v0.1 ·</div>
      <div style={{ fontFamily: '"Noto Serif SC", serif', fontSize: 38, fontWeight: 700, color: '#1c1814', letterSpacing: 1.5, lineHeight: 1.15 }}>
        AI 问书 · 终端读者侧
      </div>
      <div style={{ fontSize: 14, color: '#6f5f50', marginTop: 12, lineHeight: 1.7, maxWidth: 440 }}>
        以"中国医学临床百家《心血管分册》"为故事原型，铺出 8 张核心页面 ×
        2 套视觉方向，配 4 套色彩气质 + 设计 Token，整体放在画布上对比。
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
        {[
          ['8 页', '核心主线'],
          ['2 套', '视觉方向'],
          ['4 套', '色彩气质'],
          ['Tokens', '色 / 字 / 组件'],
        ].map(([n, l]) => (
          <div key={l} style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(6px)', borderRadius: 10, padding: '8px 14px', border: '1px solid rgba(28,24,20,0.06)' }}>
            <div style={{ fontFamily: '"Noto Serif SC", serif', fontSize: 18, fontWeight: 700, color: '#1c1814' }}>{n}</div>
            <div style={{ fontSize: 10, color: '#867563', letterSpacing: 1, marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 22, fontSize: 11.5, color: '#6f5f50', lineHeight: 1.8 }}>
        主线流程 ：扫码进入 → 微信授权 → 欢迎语 → 首问 → 流式答案
        → 文字 / 图音视频 / 出处 三件套 → 锁标 → 解锁三选一 ……
        <br />
        <span style={{ color: '#b04a32' }}>↓ 一直往下滚动，对比每一组</span>
      </div>
    </div>
  );
}

const App = () => (
  <DesignCanvas>
    <DCSection id="cover" title="封面" subtitle="一页 brief">
      <DCArtboard id="cover" label="封面 · 设计 brief" width={720} height={420}>
        <Cover />
      </DCArtboard>
      <DCArtboard id="map" label="主线地图" width={360} height={420}>
        <Notes>
          <div style={{ fontFamily: '"Noto Serif SC", serif', fontSize: 17, fontWeight: 700, color: '#1c1814', marginBottom: 12 }}>· 主线 8 页</div>
          <ol style={{ paddingLeft: 18, margin: 0, color: '#3d3530' }}>
            <li>落地页 / 微信授权</li>
            <li>AI 会话主页（含三件套）</li>
            <li>付费墙弹窗（多模态锁标）</li>
            <li>AI 会员订阅页</li>
            <li>实时电话式语音页</li>
            <li>我的主页</li>
            <li>历史会话详情（回看）</li>
            <li>客服弹窗</li>
          </ol>
          <div style={{ marginTop: 14, padding: 12, background: '#fff', borderRadius: 8, fontSize: 11.5, color: '#6f5f50', lineHeight: 1.7 }}>
            两套方向 · 同一份页面骨架，便于横向对比。
            色彩气质先单独看 4 套，再看落到产品里的样子。
          </div>
        </Notes>
      </DCArtboard>
    </DCSection>

    <DCSection id="palettes" title="色彩气质 · 4 套" subtitle="每套色板配一段对话页缩略，先选你最有感觉的">
      {PALETTES.map((p, i) => (
        <DCArtboard key={p.id} id={p.id} label={`${String.fromCharCode(65 + i)} · ${p.name}`} width={PAL_W} height={PAL_H}>
          <PaletteCard p={p} />
        </DCArtboard>
      ))}
    </DCSection>

    <DCSection id="tokens" title="Token / 视觉系统" subtitle="把两个方向的色 / 字 / Tag / 按钮 / 气泡 / 输入框一起铺出来">
      <DCArtboard id="tokens-a" label="方向 A · 沉静学术暖色" width={TOKEN_W} height={TOKEN_H}>
        <TokensA />
      </DCArtboard>
      <DCArtboard id="tokens-b" label="方向 B · 新潮 AI 工具冷色" width={TOKEN_W} height={TOKEN_H}>
        <TokensB />
      </DCArtboard>
    </DCSection>

    <DCSection id="dir-a" title="方向 A · 沉静学术暖色" subtitle="思源宋 + 朱印红古铜金 · 像一本可以对话的临床专著">
      <DCArtboard id="a-landing"  label="A1 · 落地 / 微信授权" width={PHONE_W} height={PHONE_H}><A_Landing /></DCArtboard>
      <DCArtboard id="a-conv"     label="A2 · 会话主页 · 三件套" width={PHONE_W} height={PHONE_H}><A_Conversation /></DCArtboard>
      <DCArtboard id="a-paywall"  label="A3 · 锁标付费墙" width={PHONE_W} height={PHONE_H}><A_Paywall /></DCArtboard>
      <DCArtboard id="a-member"   label="A4 · AI 会员订阅" width={PHONE_W} height={PHONE_H}><A_Membership /></DCArtboard>
      <DCArtboard id="a-call"     label="A5 · 实时电话语音" width={PHONE_W} height={PHONE_H}><A_Call /></DCArtboard>
      <DCArtboard id="a-profile"  label="A6 · 我的" width={PHONE_W} height={PHONE_H}><A_Profile /></DCArtboard>
      <DCArtboard id="a-history"  label="A7 · 历史会话回看" width={PHONE_W} height={PHONE_H}><A_History /></DCArtboard>
      <DCArtboard id="a-service"  label="A8 · 客服弹窗" width={PHONE_W} height={PHONE_H}><A_Service /></DCArtboard>
    </DCSection>

    <DCSection id="dir-b" title="方向 B · 新潮 AI 工具冷色" subtitle="Manrope + 思源黑 · 电光靛 + 朝霞橙 · 像一款好用的 AI 工具">
      <DCArtboard id="b-landing"  label="B1 · 落地 / 微信授权" width={PHONE_W} height={PHONE_H}><B_Landing /></DCArtboard>
      <DCArtboard id="b-conv"     label="B2 · 会话主页 · 三件套" width={PHONE_W} height={PHONE_H}><B_Conversation /></DCArtboard>
      <DCArtboard id="b-paywall"  label="B3 · 锁标付费墙" width={PHONE_W} height={PHONE_H}><B_Paywall /></DCArtboard>
      <DCArtboard id="b-member"   label="B4 · AI 会员订阅" width={PHONE_W} height={PHONE_H}><B_Membership /></DCArtboard>
      <DCArtboard id="b-call"     label="B5 · 实时电话语音" width={PHONE_W} height={PHONE_H}><B_Call /></DCArtboard>
      <DCArtboard id="b-profile"  label="B6 · 我的" width={PHONE_W} height={PHONE_H}><B_Profile /></DCArtboard>
      <DCArtboard id="b-history"  label="B7 · 历史会话回看" width={PHONE_W} height={PHONE_H}><B_History /></DCArtboard>
      <DCArtboard id="b-service"  label="B8 · 客服弹窗" width={PHONE_W} height={PHONE_H}><B_Service /></DCArtboard>
    </DCSection>

    <DCSection id="dir-c" title="方向 C · 极简瑞士黑白纸" subtitle="纯黑白 + 极小一点深红 · Söhne / Manrope + 思源宋 + 等宽编号 · 像一份装帧考究的临床期刊">
      <DCArtboard id="c-landing"  label="C1 · 落地 / 微信授权" width={PHONE_W} height={PHONE_H}><C_Landing /></DCArtboard>
      <DCArtboard id="c-conv"     label="C2 · 会话主页 · 三件套" width={PHONE_W} height={PHONE_H}><C_Conversation /></DCArtboard>
      <DCArtboard id="c-paywall"  label="C3 · 锁标付费墙" width={PHONE_W} height={PHONE_H}><C_Paywall /></DCArtboard>
      <DCArtboard id="c-member"   label="C4 · AI 会员订阅" width={PHONE_W} height={PHONE_H}><C_Membership /></DCArtboard>
      <DCArtboard id="c-call"     label="C5 · 实时电话语音" width={PHONE_W} height={PHONE_H}><C_Call /></DCArtboard>
      <DCArtboard id="c-profile"  label="C6 · 我的" width={PHONE_W} height={PHONE_H}><C_Profile /></DCArtboard>
      <DCArtboard id="c-history"  label="C7 · 历史会话回看" width={PHONE_W} height={PHONE_H}><C_History /></DCArtboard>
      <DCArtboard id="c-service"  label="C8 · 客服弹窗" width={PHONE_W} height={PHONE_H}><C_Service /></DCArtboard>
    </DCSection>
  </DesignCanvas>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
