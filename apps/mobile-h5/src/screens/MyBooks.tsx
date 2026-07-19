import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { useDemoStore, KPS } from '@aba/mock';
import { useChatStore } from '../chatStore';

// 我的纸书：扫线下纸书二维码解锁、获权益的知识 KP。
// 0613-2：文案精简一行、去永享标、点卡片进该 KP 会话、卡片重排(名称两行高+扫码时间钉底对齐)、右上角「扫一扫」调相机扫码进会话。
// 0614：右上角图标改「扫一扫」；扫码 / 点卡片进入该 KP 的「全新会话」(清空会话回到欢迎态)。
// 0615：去掉卡片 hover 放大高亮（仅保留可点击）；点卡片先在屏幕中上方弹 3 秒 toast「即将进入「KP 名」AI 会话」再进会话。
// 0717 #1.1/#1.4：下架＝运营临时禁访问（可重新上架），无论是否解锁一律拦截进会话——
//   unlisted＝「已下架」：点击提示联系客服；已解锁的并列保留「已解锁」标（权益不清除,重新上架自动恢复）；
//   deleted＝「已失效」：软删、内容下线，无论是否解锁均拦截并提示联系客服。

// 演示 grant：已下架未解锁 / 已下架已解锁（双标）/ 已删除（「已失效」拦截）。
// 初始 bookGrants 在 @aba/mock 的 store 里（不改 mock 包），组件侧拼接。
const DEMO_OFFSHELF_GRANTS = [
  { kpId: 'kp_anesthesia', scannedAt: '2026-06-20', unlocked: false },
  { kpId: 'kp_icu_manual', scannedAt: '2026-06-02', unlocked: true },
  { kpId: 'kp_ultrasound_old', scannedAt: '2026-05-18', unlocked: true },
];

export function MyBooks() {
  const nav = useNavigate();
  const storeGrants = useDemoStore((s) => s.user.bookGrants ?? []);
  // 避免每次 render 生成新数组引用导致 useMemo 失效
  const grants = useMemo(() => [...storeGrants, ...DEMO_OFFSHELF_GRANTS], [storeGrants]);
  const resetChat = useChatStore((s) => s.setMessages);
  const [q, setQ] = useState('');
  const [bookFilter, setBookFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const scanRef = useRef<HTMLInputElement>(null);
  // 扫码演示轮换计数(已发布/已下架/已失效三种 KP 状态循环演示)
  const scanCount = useRef(0);

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
        // offShelf＝已下架（可能保留权益）、dead＝已失效（删除,一律拦截）
        return kp ? { kp, scannedAt: g.scannedAt, unlocked: g.unlocked, offShelf: kp.status === 'unlisted', dead: kp.status === 'deleted' } : null;
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
          onChange={(e) => {
            // 0717 #1.3：扫码统一走 /kp/:id 入口判活(演示轮换:已发布→已下架→已失效,循环)
            const demoIds = ['kp_neuro', 'kp_anesthesia', 'kp_ultrasound_old'];
            const id = demoIds[scanCount.current % demoIds.length];
            scanCount.current += 1;
            e.target.value = '';
            toast('已识别知识 KP 二维码');
            setTimeout(() => nav(`/kp/${id}?src=qr`), 500);
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
          <div className="bk-tip">首扫永久解锁该 KP 当前及未来新增的全部内容</div>
          {books.length ? (
            <div className="yx-grid">
              {books.map((b) => (
                <div
                  className={'yx-card tap' + (b.dead || b.offShelf ? ' bk-dim' : '')}
                  key={b.kp.id}
                  onClick={() => {
                    // 0717 #1.1/二批 #3：已失效(软删)与已下架均一律拦截,提示不带 KP 名
                    if (b.dead) {
                      toast('该内容已失效，若有问题请联系客服');
                      return;
                    }
                    if (b.offShelf) {
                      toast('该内容已下架，若有问题请联系客服');
                      return;
                    }
                    enterFresh(b.kp.name);
                  }}
                >
                  <div className="bk-cover">
                    <span className="bk-init">{b.kp.name.slice(0, 1)}</span>
                  </div>
                  {/* 3.3:首扫绑定显「已解锁」标(皇冠示意会员级权益);后扫未解锁不显状态(界面保持干净)。
                      0718 #2：已下架/已失效整卡降透明度(bk-dim)、「已解锁」同步变淡；下架/失效标移到「扫码时间」后面(中性灰) */}
                  {b.unlocked && (
                    <span className="bk-tag bk-tag-unlock bk-tag-corner">
                      <Icon id="i-crown" w={10} h={10} />
                      已解锁
                    </span>
                  )}
                  <div className="bk-meta">
                    <div className="bk-name">{b.kp.name}</div>
                    <div className="bk-date">
                      扫码 · {b.scannedAt}
                      {b.dead ? <span className="bk-st">已失效</span> : b.offShelf ? <span className="bk-st">已下架</span> : null}
                    </div>
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
