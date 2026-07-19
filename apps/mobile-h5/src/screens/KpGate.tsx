import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { KPS, useDemoStore } from '@aba/mock';
import { useChatStore } from '../chatStore';

// 0717 #1.3/#1.6：知识 KP 前台入口中转页（前台地址直达与二维码扫码/首扫权益核销共用）。
// - 已发布：过渡提示后进入该 KP 全新 AI 会话；
// - 已下架：提示「已下架，若有问题请联系客服」3 秒 → 跳转规则①；
// - 已删除(软删)/不存在：提示「已失效，若有问题请联系客服」3 秒 → 跳转规则①。
// 跳转规则①：目标＝本 KP 同机构下「最新创建且已发布」的 KP 会话；
//   未登录(guest)则先进登录界面（仅当存在目标时）；机构无满足条件的 KP 则不跳转、停留本页。
// 注意用词：兑换码的权益是会员，与 KP 绑定的是「知识 KP 二维码」。

const TIP: Record<'off' | 'dead', string> = {
  off: '已下架，若有问题请联系客服',
  dead: '已失效，若有问题请联系客服',
};

export function KpGate() {
  const nav = useNavigate();
  const { kpId } = useParams();
  const [sp] = useSearchParams();
  const fromQr = sp.get('src') === 'qr';
  const role = useDemoStore((s) => s.role);
  const resetChat = useChatStore((s) => s.setMessages);
  const fired = useRef(false);

  const kp = useMemo(() => KPS.find((k) => k.id === kpId), [kpId]);
  // 已删除的 KP 数据库留存但三端不可见,前台等同「已失效」;未知 id 同样按已失效处理
  const state: 'ok' | 'off' | 'dead' = !kp || kp.status === 'deleted' || kp.status === 'draft' ? 'dead' : kp.status === 'unlisted' ? 'off' : 'ok';

  // 跳转规则①的目标:同机构最新创建且已发布(createdAt 为 YYYY-MM-DD,字符串倒序即时间倒序)
  const fallbackKp = useMemo(() => {
    if (state === 'ok' || !kp) return null;
    return (
      KPS.filter((k) => k.orgId === kp.orgId && k.status === 'published')
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0] ?? null
    );
  }, [state, kp]);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    if (state === 'ok' && kp) {
      toast(`${fromQr ? '已识别知识 KP 二维码 · ' : ''}即将进入「${kp.name}」AI 会话`, 3000);
      resetChat([]);
      nav('/chat', { replace: true });
      return;
    }
    // 已下架/已失效:停留 3 秒展示提示,再按规则①处理
    const t = setTimeout(() => {
      if (!fallbackKp) return; // 无满足条件的 KP:不跳转,也不进登录界面
      if (role === 'guest') {
        toast(`登录后为你进入「${fallbackKp.name}」AI 会话`, 3000);
        nav('/', { replace: true });
        return;
      }
      toast(`即将进入「${fallbackKp.name}」AI 会话`, 3000);
      resetChat([]);
      nav('/chat', { replace: true });
    }, 3000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === 'ok') return null;

  return (
    <div className="pg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '0 28px' }}>
        <div
          style={{
            width: 64, height: 64, margin: '0 auto 14px', borderRadius: 20,
            background: state === 'off' ? 'var(--amber-soft,#FDF3E3)' : 'var(--terra-soft,#FDEBE7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: state === 'off' ? 'var(--amber,#B7791F)' : 'var(--terra,#E0533D)',
          }}
        >
          <Icon id="i-warn" w={30} h={30} />
        </div>
        {kp && <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{kp.name}</div>}
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
          {fromQr ? '该知识 KP ' : '该知识 KP '}
          {TIP[state]}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.7 }}>
          {fallbackKp
            ? role === 'guest'
              ? `3 秒后前往登录，登录后进入本机构「${fallbackKp.name}」AI 会话`
              : `3 秒后为你进入本机构「${fallbackKp.name}」AI 会话`
            : '本机构暂无可进入的知识 KP'}
        </div>
      </div>
    </div>
  );
}
