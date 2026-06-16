import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { useDemoStore, KPS } from '@aba/mock';
import { useChatStore } from '../chatStore';

// 我的纸书：扫线下纸书二维码解锁、获权益的知识 KP。
// 0613-2：文案精简一行、去永享标、点卡片进该 KP 会话、卡片重排(名称两行高+扫码时间钉底对齐)、右上角「扫一扫」调相机扫码进会话。
// 0614：右上角图标改「扫一扫」；扫码 / 点卡片进入该 KP 的「全新会话」(清空会话回到欢迎态)。
// 0615：去掉卡片 hover 放大高亮（仅保留可点击）；点卡片先在屏幕中上方弹 3 秒 toast「即将进入「KP 名」AI 会话」再进会话。
export function MyBooks() {
  const nav = useNavigate();
  const grants = useDemoStore((s) => s.user.bookGrants ?? []);
  const resetChat = useChatStore((s) => s.setMessages);
  const [q, setQ] = useState('');
  const [bookFilter, setBookFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const scanRef = useRef<HTMLInputElement>(null);

  // 进入指定纸书 / KP 的全新会话：先清空会话回到欢迎态，再进入 AI 会话。
  // 传入 KP 名则先弹 3 秒过渡提示（toast 跨路由仍显示，进入会话后用户仍可见）。
  const enterFresh = (kpName?: string) => {
    if (kpName) toast(`即将进入「${kpName}」AI 会话`, 3000);
    resetChat([]);
    nav('/chat');
  };

  const books = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return grants
      .map((g) => {
        const kp = KPS.find((k) => k.id === g.kpId);
        return kp ? { kp, scannedAt: g.scannedAt, unlocked: g.unlocked } : null;
      })
      .filter((b): b is NonNullable<typeof b> => !!b)
      .filter((b) => b.kp.name.toLowerCase().includes(kw))
      .filter((b) => bookFilter === 'all' || (bookFilter === 'unlocked') === b.unlocked);
  }, [grants, q, bookFilter]);

  return (
    <>
      <div className="h5-top">
        <div className="ic tap" onClick={() => nav(-1)}>
          <Icon id="i-chevL" w={22} h={22} />
        </div>
        <div className="center">
          <div className="ttl">我的纸书</div>
        </div>
        {/* 右上角扫一扫：调起手机相机扫码 → 进对应 KP 的全新会话 */}
        <div className="ic tap" onClick={() => scanRef.current?.click()}>
          <Icon id="i-scan" w={21} h={21} />
        </div>
        <input
          ref={scanRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={() => {
            toast('已识别纸书二维码 · 正在进入全新会话');
            setTimeout(() => enterFresh(), 700);
          }}
        />
      </div>
      <div className="pg">
        <div className="scrollY">
          <div className="h5srch">
            <Icon id="i-search" />
            <input placeholder="搜索纸书名称" value={q} onChange={(e) => setQ(e.target.value)} />
            {q && (
              <span className="h5srch-x tap" onClick={() => setQ('')}>
                ✕
              </span>
            )}
          </div>
          <div className="fchips">
            {([['all', '全部'], ['unlocked', '已解锁'], ['locked', '未解锁']] as const).map(([k, label]) => (
              <span key={k} className={'fchip' + (bookFilter === k ? ' on' : '')} onClick={() => setBookFilter(k)}>
                {label}
              </span>
            ))}
          </div>
          <div className="bk-tip">展示全部扫过纸书，首扫解锁相应权益</div>
          {books.length ? (
            <div className="yx-grid">
              {books.map((b) => (
                <div className="yx-card tap" key={b.kp.id} onClick={() => enterFresh(b.kp.name)}>
                  <div className="bk-cover">
                    <span className="bk-init">{b.kp.name.slice(0, 1)}</span>
                    {/* 3.3:首扫绑定显「已解锁」标(皇冠示意会员级权益);后扫未解锁不显状态(界面保持干净) */}
                    {b.unlocked && (
                      <span className="bk-unlocked">
                        <Icon id="i-crown" w={11} h={11} />
                        已解锁
                      </span>
                    )}
                  </div>
                  <div className="bk-meta">
                    <div className="bk-name">{b.kp.name}</div>
                    <div className="bk-date">扫码 · {b.scannedAt}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h5empty">
              没有匹配的纸书
              <br />
              点右上角「扫一扫」解锁纸书
            </div>
          )}
        </div>
      </div>
    </>
  );
}
