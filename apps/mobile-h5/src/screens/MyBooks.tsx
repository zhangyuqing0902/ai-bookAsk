import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { useDemoStore, KPS } from '@aba/mock';

// 我的纸书：扫线下纸书二维码解锁、获权益的知识 KP。
// 0613-2：文案精简一行、去永享标、点卡片进该 KP 会话、卡片重排(名称两行高+扫码时间钉底对齐)、右上角「扫一扫」调相机扫码进会话。
export function MyBooks() {
  const nav = useNavigate();
  const grants = useDemoStore((s) => s.user.bookGrants ?? []);
  const [q, setQ] = useState('');
  const scanRef = useRef<HTMLInputElement>(null);

  const books = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return grants
      .map((g) => {
        const kp = KPS.find((k) => k.id === g.kpId);
        return kp ? { kp, scannedAt: g.scannedAt } : null;
      })
      .filter((b): b is NonNullable<typeof b> => !!b)
      .filter((b) => b.kp.name.toLowerCase().includes(kw));
  }, [grants, q]);

  return (
    <>
      <div className="h5-top">
        <div className="ic tap" onClick={() => nav(-1)}>
          <Icon id="i-chevL" w={22} h={22} />
        </div>
        <div className="center">
          <div className="ttl">我的纸书</div>
        </div>
        {/* 右上角扫一扫：调起手机相机扫码 → 进对应 KP 会话 */}
        <div className="ic tap" onClick={() => scanRef.current?.click()}>
          <Icon id="i-camera" w={21} h={21} />
        </div>
        <input
          ref={scanRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={() => {
            toast('已识别纸书二维码 · 正在进入');
            setTimeout(() => nav('/chat'), 700);
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
          <div className="bk-tip">微信扫码解锁纸书全部数字内容，永享内容另购</div>
          {books.length ? (
            <div className="yx-grid">
              {books.map((b) => (
                <div className="yx-card tap" key={b.kp.id} onClick={() => nav('/chat')}>
                  <div className="bk-cover">
                    <span className="bk-init">{b.kp.name.slice(0, 1)}</span>
                  </div>
                  <div className="bk-meta">
                    <div className="bk-name">{b.kp.name}</div>
                    <div className="bk-date">扫码解锁 · {b.scannedAt}</div>
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
