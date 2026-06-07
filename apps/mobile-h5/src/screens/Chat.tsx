import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';

interface Media {
  kind: 'image' | 'audio' | 'video';
  name: string;
  locked: boolean;
}
interface Msg {
  id: number;
  role: 'user' | 'ai';
  text: string;
}

const KIND_LABEL: Record<Media['kind'], string> = { image: '图片', audio: '音频', video: '视频' };
const DEMO_MEDIA: Media[] = [
  { kind: 'image', name: '膳食配比图', locked: false },
  { kind: 'image', name: '血压监测记录表', locked: false },
  { kind: 'audio', name: '专家讲解 · 低钠饮食', locked: true },
  { kind: 'video', name: '示范 · 家庭血压测量', locked: true },
];
const DEMO_FOLLOWUPS = ['那运动方面要注意什么?', '可以喝咖啡吗?', '需要长期服药吗?'];
const ANSWER =
  '控制饮食的关键是低钠饮食,每日食盐摄入应小于 5g;同时增加钾的摄入,多吃新鲜蔬果,限制饱和脂肪与酒精。建议规律监测血压,并在医生指导下调整用药方案。';

const HISTORY = [
  { g: '今天', items: ['高血压饮食控制方案咨询', '射血分数保留型心衰用药选择'] },
  { g: '昨天', items: ['心梗早期信号有哪些'] },
  { g: '2026年5月', items: ['支架术后日常注意事项', '冠脉造影术前抗凝管理'] },
  { g: '2026年3月', items: ['本书第 4 章重点内容总结'] },
];

let _id = 1;

// 5/6 AI 会话（欢迎态 ↔ 对话态）
export function Chat() {
  const nav = useNavigate();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [ov, setOv] = useState<null | 'left' | 'src'>(null);
  const [pay, setPay] = useState<Media | null>(null);
  const [lbx, setLbx] = useState<{ items: Media[]; idx: number } | null>(null);
  const [input, setInput] = useState('');
  const [think, setThink] = useState(true);
  const [search, setSearch] = useState(false);
  const [voice, setVoice] = useState(false);
  const [fbk, setFbk] = useState<number | null>(null);
  const [react, setReact] = useState<Record<number, 'like' | 'dislike'>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollDown = () => setTimeout(() => scrollRef.current?.scrollTo({ top: 1e9, behavior: 'smooth' }), 60);

  const send = (q: string) => {
    const text = q.trim();
    if (!text) return;
    setMsgs((m) => [...m, { id: _id++, role: 'user', text }, { id: _id++, role: 'ai', text: ANSWER }]);
    setInput('');
    scrollDown();
  };

  const newChat = () => {
    if (msgs.length === 0) {
      toast('已经在新对话中');
      return;
    }
    setMsgs([]);
    setOv(null);
  };

  const like = (id: number) =>
    setReact((p) => {
      const n = { ...p };
      if (n[id] === 'like') delete n[id];
      else n[id] = 'like';
      return n;
    });
  const submitFeedback = (id: number) => {
    setReact((p) => ({ ...p, [id]: 'dislike' }));
    setFbk(null);
    toast('已记录反馈,感谢你的帮助');
  };

  // 短语音：按住 → 录音浮层；松手 → 转写并发送
  const startVoice = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      s.getTracks().forEach((t) => t.stop());
    } catch {
      /* 演示：忽略权限结果 */
    }
    setVoice(true);
  };
  const endVoice = (cancel?: boolean) => {
    if (!voice) return;
    setVoice(false);
    if (!cancel) send('高血压怎么控制饮食?');
  };

  const openLbx = (items: Media[], idx: number) => setLbx({ items, idx });

  return (
    <>
      <div className="h5">
        <div className="h5-top">
          <div className="ic tap" onClick={() => setOv('left')}>
            <Icon id="i-menu" w={22} h={22} />
          </div>
          <div className="center">
            <div className="ttl">AI 问书</div>
            <div className="sub">内容由 AI 生成</div>
          </div>
          <div className="grp">
            <div className="ic tap" onClick={() => nav('/call')}>
              <Icon id="i-phone" w={20} h={20} />
            </div>
            <div className="ic tap" onClick={newChat}>
              <Icon id="i-plus" w={20} h={20} />
            </div>
          </div>
        </div>

        <div className="h5-scroll" ref={scrollRef} style={{ overflowY: 'auto' }}>
          {msgs.length === 0 ? (
            <div className="welcome">
              <div className="agent-sticky">
                <div className="ring">
                  <div className="halo" />
                  <div className="orb float" style={{ width: 84, height: 84, position: 'relative' }} />
                </div>
              </div>
              <div className="hero-slogan">
                有问题,就<span className="grad tw">问 AI 问书</span>
              </div>
              <div className="hero-sub">
                答案有出处<span className="d" />知识更可信
              </div>
              <div className="ex-list">
                {['高血压怎么控制饮食?', '射血分数保留型心衰用药怎么选?', '本书第 4 章的重点是什么?'].map((q) => (
                  <div className="ex-q tap" key={q} onClick={() => send(q)}>
                    <span className="t">{q}</span>
                    <span className="sp">
                      <Icon id="i-spark" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="convo">
              {msgs.map((m) =>
                m.role === 'user' ? (
                  <div className="bubble-u" key={m.id}>
                    {m.text}
                  </div>
                ) : (
                  <AiMsg
                    key={m.id}
                    msg={m}
                    reaction={react[m.id]}
                    onLike={() => like(m.id)}
                    onDislike={() => setFbk(m.id)}
                    onSource={() => setOv('src')}
                    onOpen={openLbx}
                    onPay={setPay}
                    onFollow={send}
                  />
                ),
              )}
            </div>
          )}
        </div>

        <div className="composer">
          <div className="composer-box">
            <input
              className="ci-input"
              placeholder="发消息或按住右侧说话…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send(input)}
            />
            <div className="composer-row">
              <div className="composer-chips">
                <span className={'mini-chip' + (think ? ' on' : '')} onClick={() => setThink((v) => !v)}>
                  <Icon id="i-spark" />
                  深度思考
                </span>
                <span className={'mini-chip' + (search ? ' on' : ' grayed')} onClick={() => setSearch((v) => !v)}>
                  <Icon id="i-search" />
                  智能搜索
                </span>
              </div>
              {input.trim() ? (
                <div className="send-btn tap" onClick={() => send(input)}>
                  <Icon id="i-up" w={18} h={18} />
                </div>
              ) : (
                <div
                  className="voice-btn tap"
                  onPointerDown={startVoice}
                  onPointerUp={() => endVoice(false)}
                  onPointerLeave={() => endVoice(true)}
                >
                  <Icon id="i-mic" w={18} h={18} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 短语音输入浮层 */}
      {voice && (
        <div className="voice-ov">
          <div className="voice-hint">正在聆听…</div>
          <div className="voice-tip">松手发送,上滑取消</div>
          <div className="voice-wave">
            {Array.from({ length: 28 }).map((_, i) => (
              <span key={i} style={{ animationDelay: (i % 7) * 0.08 + 's' }} />
            ))}
          </div>
        </div>
      )}

      {/* 左抽屉：搜索 + 分组历史 + 页脚 */}
      <div className={'ov' + (ov === 'left' ? ' open' : '')}>
        <div className="scrim" onClick={() => setOv(null)} />
        <div className="ldrawer">
          <div className="ld-search">
            <Icon id="i-search" />
            搜索对话内容…
          </div>
          <div
            className="ld-new tap"
            onClick={() => {
              setOv(null);
              newChat();
            }}
          >
            <Icon id="i-plus" />
            新建会话
          </div>
          <div className="ld-hist">
            {HISTORY.map((grp) => (
              <div key={grp.g}>
                <div className="ld-grp">{grp.g}</div>
                {grp.items.map((h) => (
                  <div
                    className="hi tap"
                    key={h}
                    onClick={() => {
                      setMsgs([
                        { id: _id++, role: 'user', text: h },
                        { id: _id++, role: 'ai', text: ANSWER },
                      ]);
                      setOv(null);
                    }}
                  >
                    {h}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="ld-foot tap" onClick={() => nav('/me')}>
            <div className="av" />
            <div>
              <div className="nm">
                微信昵称A <span className="tag-s tag-amber">会员</span>
              </div>
              <div className="ph">138****8888</div>
            </div>
            <span className="more">
              <Icon id="i-chevR" />
            </span>
          </div>
        </div>
      </div>

      {/* 溯源抽屉 */}
      <div className={'ov' + (ov === 'src' ? ' open' : '')}>
        <div className="scrim" onClick={() => setOv(null)} />
        <div className="drawer">
          <div className="drawer-h">
            <div className="t">参考来源 (3)</div>
            <div className="s">按相关度降序 · 不显示数值</div>
          </div>
          <div className="src-item tap" onClick={() => toast('跳转纸书购买链接')}>
            <div className="src-cover">
              <span className="sp" />
            </div>
            <div className="src-meta">
              <div className="kp">心血管分册 · 第4版</div>
              <div className="fl">ch3-饮食管理.pdf · p.42</div>
            </div>
          </div>
          <div className="src-item tap" onClick={() => toast('无跳转链接')}>
            <div className="src-cover">
              <span className="sp" />
            </div>
            <div className="src-meta">
              <div className="kp">心血管分册 · 第4版</div>
              <div className="fl">ch5-药物治疗.pdf · p.88</div>
            </div>
          </div>
          <div className="src-item tap" onClick={() => toast('打开来源网页')}>
            <div className="src-cover web" />
            <div className="src-meta">
              <div className="kp">中华医学会 · 指南</div>
              <div className="fl">hypertension-2024 · web</div>
            </div>
          </div>
        </div>
      </div>

      {/* 永享付费墙 */}
      <div className={'ov' + (pay ? ' open' : '')}>
        <div className="scrim" onClick={() => setPay(null)} />
        <div className="pw">
          <div className="pw-h">
            <div className="lk">
              <Icon id="i-lock2" />
            </div>
            <div>
              <div className="t">{pay?.name} · 受限内容</div>
              <div className="s">开通会员畅享全部,或单独永久解锁此内容</div>
            </div>
          </div>
          <div className="pw-btns">
            <button className="btn btn-amber" onClick={() => { setPay(null); setLbx(null); nav('/member'); }}>
              开通会员 · 畅享全部
            </button>
            <button className="btn btn-ghost" onClick={() => { setPay(null); toast('微信支付 · 永享已解锁'); }}>
              ¥9.9 永久解锁此内容
            </button>
          </div>
        </div>
      </div>

      {/* 多模态 lightbox */}
      {lbx && (
        <Lightbox
          state={lbx}
          setIdx={(i) => setLbx({ ...lbx, idx: i })}
          onClose={() => setLbx(null)}
          onPay={(m) => setPay(m)}
        />
      )}

      {/* 反馈 sheet */}
      <div className={'ov' + (fbk != null ? ' open' : '')}>
        <div className="scrim" onClick={() => setFbk(null)} />
        <div className="pw">
          <div className="fbk-h">
            反馈
            <span className="x tap" onClick={() => setFbk(null)}>
              <Icon id="i-chevD" w={16} h={16} />
            </span>
          </div>
          <FeedbackBody onSubmit={() => fbk != null && submitFeedback(fbk)} />
        </div>
      </div>
    </>
  );
}

function AiMsg({
  msg,
  reaction,
  onLike,
  onDislike,
  onSource,
  onOpen,
  onPay,
  onFollow,
}: {
  msg: Msg;
  reaction?: 'like' | 'dislike';
  onLike: () => void;
  onDislike: () => void;
  onSource: () => void;
  onOpen: (items: Media[], idx: number) => void;
  onPay: (m: Media) => void;
  onFollow: (q: string) => void;
}) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i += 2;
      if (i >= msg.text.length) {
        setShown(msg.text.length);
        clearInterval(t);
      } else setShown(i);
    }, 22);
    return () => clearInterval(t);
  }, [msg.id, msg.text]);
  const done = shown >= msg.text.length;

  return (
    <div className="answer">
      <div className="ans-card">
        <div className="ans-text">
          {msg.text.slice(0, shown)}
          {!done && <span className="cursor" />}
        </div>
        {done && (
          <div className="media-zone">
            <div className="mz-k">
              <span>相关媒体资源</span>
              <span>按相关度排序</span>
            </div>
            <div className="media-strip" style={{ overflowX: 'auto' }}>
              {DEMO_MEDIA.map((m, i) =>
                m.locked ? (
                  <div className="media-thumb locked tap" key={i} onClick={() => onOpen(DEMO_MEDIA, i)}>
                    <div className="lk">
                      <Icon id="i-lock" />
                      <span className="pr">{KIND_LABEL[m.kind]}</span>
                    </div>
                  </div>
                ) : (
                  <div className="media-thumb tap" key={i} onClick={() => onOpen(DEMO_MEDIA, i)}>
                    <span className="ph">{m.name}</span>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </div>
      {done && (
        <>
          <div className="ans-actions">
            <div className="act-left">
              <div className="act-ic tap" onClick={() => toast('已复制答案')}>
                <Icon id="i-copy" />
              </div>
              <div className={'act-ic tap' + (reaction === 'like' ? ' on' : '')} onClick={onLike}>
                <Icon id="i-like" />
              </div>
              <div className={'act-ic tap' + (reaction === 'dislike' ? ' on' : '')} onClick={onDislike}>
                <Icon id="i-like" style={{ transform: 'rotate(180deg)' }} />
              </div>
            </div>
            <button className="src-btn" onClick={onSource}>
              参考 3 篇知识
              <Icon id="i-chevR" />
            </button>
          </div>
          <div className="followups">
            {DEMO_FOLLOWUPS.map((f) => (
              <div className="followup tap" key={f} onClick={() => onFollow(f)}>
                <span>{f}</span>
                <span className="ar">
                  <Icon id="i-chevR" />
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Lightbox({
  state,
  setIdx,
  onClose,
  onPay,
}: {
  state: { items: Media[]; idx: number };
  setIdx: (i: number) => void;
  onClose: () => void;
  onPay: (m: Media) => void;
}) {
  const { items, idx } = state;
  const m = items[idx];
  const go = (d: number) => setIdx((idx + d + items.length) % items.length);
  return (
    <div className="ov open" id="ovLbx">
      <div className="lbx">
        <div className="lbx-top">
          <span>
            <Icon id="i-shield" w={13} h={13} style={{ verticalAlign: -2 }} /> 因版权限制,暂不支持保存下载
          </span>
          <span className="x tap" onClick={onClose}>
            ✕
          </span>
        </div>
        <div className="lbx-main">
          <div className="lbx-nav l" onClick={() => go(-1)}>
            <Icon id="i-chevL" />
          </div>
          {m.locked ? (
            <div
              className="lbx-img"
              style={{ cursor: 'pointer', flexDirection: 'column', gap: 12 }}
              onClick={() => onPay(m)}
            >
              <Icon id="i-lock2" w={34} h={34} style={{ color: 'rgba(255,255,255,.85)' }} />
              <div>{m.name}</div>
              <div style={{ fontSize: 12, color: 'var(--amber-2)' }}>点击解锁此内容</div>
            </div>
          ) : (
            <div className="lbx-img" onClick={() => toast('因版权限制,暂不支持保存下载')}>
              {m.name} · 预览
            </div>
          )}
          <div className="lbx-nav r" onClick={() => go(1)}>
            <Icon id="i-chevR" />
          </div>
        </div>
        <div className="lbx-thumbs">
          {items.map((it, i) => (
            <div key={i} className={'t' + (i === idx ? ' on' : '')} onClick={() => setIdx(i)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FeedbackBody({ onSubmit }: { onSubmit: () => void }) {
  const [tag, setTag] = useState<number | null>(null);
  const TAGS = ['有害 / 不安全', '虚假信息', '没有帮助', '其他'];
  return (
    <>
      <div className="fbk-tags">
        {TAGS.map((t, i) => (
          <div key={t} className={'fbk-tag' + (tag === i ? ' on' : '')} onClick={() => setTag(i)}>
            {t}
          </div>
        ))}
      </div>
      <textarea className="fbk-ta" placeholder="我们想知道你对此回答不满意的原因,你认为更好的回答是什么?" />
      <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, marginTop: 14 }} onClick={onSubmit}>
        提交
      </button>
    </>
  );
}
