import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { useDemoStore } from '@aba/mock';
import type { Gender } from '@aba/mock';
import { REGIONS } from '../data/regionData';

// 个人资料：头像 / 昵称 / 性别 / 地区，全部可编辑
// 0613-2：删顶部说明；头像走真实相册 + 圆形裁剪 overlay；昵称/性别/地区均用居中弹窗；性别仅男/女；地区为省/市/区三级级联（真实数据）。
const GENDERS: { k: Gender; label: string }[] = [
  { k: 'male', label: '男' },
  { k: 'female', label: '女' },
];

// 地区文案：相邻重名（直辖市 省=市）去重后用 · 连接
function joinRegion(parts: string[]): string {
  const out: string[] = [];
  for (const p of parts) if (p && p !== out[out.length - 1]) out.push(p);
  return out.join(' · ');
}

export function Profile() {
  const nav = useNavigate();
  const user = useDemoStore((s) => s.user);
  const updateProfile = useDemoStore((s) => s.updateProfile);

  const [modal, setModal] = useState<null | 'nickname' | 'gender' | 'region'>(null);
  const genderLabel = GENDERS.find((g) => g.k === user.gender)?.label ?? '未设置';

  // —— 头像：相册选择 + 圆形裁剪 ——
  const fileRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef<{ on: boolean; sx: number; sy: number; ox: number; oy: number }>({
    on: false, sx: 0, sy: 0, ox: 0, oy: 0,
  });

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      setCropSrc(r.result as string);
      setScale(1);
      setPos({ x: 0, y: 0 });
    };
    r.readAsDataURL(f);
    e.target.value = '';
  };
  const onDown = (e: React.PointerEvent) => {
    drag.current = { on: true, sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current.on) return;
    setPos({ x: drag.current.ox + (e.clientX - drag.current.sx), y: drag.current.oy + (e.clientY - drag.current.sy) });
  };
  const onUp = () => (drag.current.on = false);
  // 0614：确定 = 把裁剪圈内的画面真正渲染到 canvas（256px 方图），而不是存原图。
  // 原实现把整张原图 base64 写进 persist 存储，几 MB 直接撑爆 localStorage 配额导致「确定无效果」。
  const confirmCrop = () => {
    if (!cropSrc) return;
    const src = cropSrc;
    const finish = (dataUrl: string) => {
      updateProfile({ avatar: dataUrl });
      setCropSrc(null);
      toast('头像上传成功');
    };
    const img = new Image();
    img.onload = () => {
      const DISP = 300; // 与 .crop-stage img 的 CSS 宽度一致
      const RING = 260; // 裁剪圈直径（与 .crop-mask 一致）
      const OUT = 256; // 输出方图边长
      const nW = img.naturalWidth || DISP;
      const nH = img.naturalHeight || DISP;
      const dispScale = DISP / nW; // natural → 屏幕显示
      const dH = nH * dispScale;
      // 裁剪圈以 stage 中心为心、边长 RING 的正方形，反解出对应的原图像素区域
      const srcSize = RING / scale / dispScale;
      const srcX = (DISP / 2 + (-RING / 2 - pos.x) / scale) / dispScale;
      const srcY = (dH / 2 + (-RING / 2 - pos.y) / scale) / dispScale;
      const cv = document.createElement('canvas');
      cv.width = OUT;
      cv.height = OUT;
      const ctx = cv.getContext('2d');
      if (!ctx) return finish(src);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, OUT, OUT);
      ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, OUT, OUT);
      finish(cv.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = () => finish(src);
    img.src = src;
  };

  // —— 昵称 ——
  const [nick, setNick] = useState('');
  const openNick = () => {
    setNick(user.nickname || '');
    setModal('nickname');
  };

  // —— 地区级联 ——
  const [step, setStep] = useState(0); // 0 省 1 市 2 区
  const [pIdx, setPIdx] = useState(-1);
  const [cIdx, setCIdx] = useState(-1);
  const openRegion = () => {
    setStep(0);
    setPIdx(-1);
    setCIdx(-1);
    setModal('region');
  };
  const prov = pIdx >= 0 ? REGIONS[pIdx] : null;
  const city = prov && cIdx >= 0 ? prov.children?.[cIdx] : null;
  const list = step === 0 ? REGIONS : step === 1 ? prov?.children ?? [] : city?.children ?? [];

  const avStyle = user.avatar
    ? { backgroundImage: `url(${user.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : undefined;

  return (
    <>
      <div className="h5-top">
        <div className="ic tap" onClick={() => nav(-1)}>
          <Icon id="i-chevL" w={22} h={22} />
        </div>
        <div className="center">
          <div className="ttl">个人资料</div>
        </div>
        <div className="grp" />
      </div>
      <div className="pg">
        <div className="scrollY">
          <div className="my-sec" style={{ paddingTop: 14 }}>资料</div>
          <div className="mlist">
            <div className="mrow tap" onClick={() => fileRef.current?.click()}>
              <span className="ml">头像</span>
              <span className="prof-av" style={avStyle} />
              <span className="mc">
                <Icon id="i-chevR" />
              </span>
            </div>
            <div className="mrow tap" onClick={openNick}>
              <span className="ml">昵称</span>
              <span className="mv">{user.nickname || '未设置'}</span>
              <span className="mc">
                <Icon id="i-chevR" />
              </span>
            </div>
            <div className="mrow tap" onClick={() => setModal('gender')}>
              <span className="ml">性别</span>
              <span className="mv">{genderLabel}</span>
              <span className="mc">
                <Icon id="i-chevR" />
              </span>
            </div>
            <div className="mrow tap" onClick={openRegion}>
              <span className="ml">地区</span>
              <span className="mv">{user.region || '未设置'}</span>
              <span className="mc">
                <Icon id="i-chevR" />
              </span>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickFile} />
        </div>
      </div>

      {/* 昵称：居中弹窗 */}
      <div className={'cm-wrap' + (modal === 'nickname' ? ' open' : '')}>
        <div className="scrim" onClick={() => setModal(null)} />
        <div className="cm">
          <div className="cm-h">修改昵称</div>
          <div className="pf" style={{ marginBottom: 0 }}>
            <div className="pin">
              <Icon id="i-user" />
              <input autoFocus maxLength={20} placeholder="请输入昵称" value={nick} onChange={(e) => setNick(e.target.value)} />
            </div>
          </div>
          <div className="cm-btns">
            <button className="btn btn-ghost" onClick={() => setModal(null)}>取消</button>
            <button
              className="btn btn-primary"
              onClick={() => {
                updateProfile({ nickname: nick.trim() });
                setModal(null);
                toast('已更新');
              }}
            >
              保存
            </button>
          </div>
        </div>
      </div>

      {/* 性别：居中弹窗（仅男/女） */}
      <div className={'cm-wrap' + (modal === 'gender' ? ' open' : '')}>
        <div className="scrim" onClick={() => setModal(null)} />
        <div className="cm">
          <div className="cm-h">选择性别</div>
          <div className="cm-opts">
            {GENDERS.map((g) => (
              <button
                key={g.k}
                className={'cm-opt' + (user.gender === g.k ? ' on' : '')}
                onClick={() => {
                  updateProfile({ gender: g.k });
                  setModal(null);
                  toast('已更新');
                }}
              >
                {g.label}
                {user.gender === g.k && <Icon id="i-check" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 地区：居中弹窗 · 省/市/区三级级联 */}
      <div className={'cm-wrap' + (modal === 'region' ? ' open' : '')}>
        <div className="scrim" onClick={() => setModal(null)} />
        <div className="cm cm-tall">
          <div className="cm-h">选择地区</div>
          <div className="rgn-tabs">
            <span className={'rgn-tab' + (step === 0 ? ' on' : '')} onClick={() => setStep(0)}>
              {prov ? prov.name : '请选择'}
            </span>
            {pIdx >= 0 && (
              <span className={'rgn-tab' + (step === 1 ? ' on' : '')} onClick={() => setStep(1)}>
                {city ? city.name : '请选择'}
              </span>
            )}
            {cIdx >= 0 && <span className={'rgn-tab' + (step === 2 ? ' on' : '')}>请选择</span>}
          </div>
          <div className="rgn-list">
            {list.map((node, i) => {
              const active =
                (step === 0 && i === pIdx) || (step === 1 && i === cIdx);
              return (
                <div
                  key={node.name}
                  className={'rgn-item' + (active ? ' on' : '')}
                  onClick={() => {
                    if (step === 0) {
                      setPIdx(i);
                      setCIdx(-1);
                      setStep(1);
                    } else if (step === 1) {
                      setCIdx(i);
                      setStep(2);
                    } else {
                      const text = joinRegion([prov!.name, city!.name, node.name]);
                      updateProfile({ region: text });
                      setModal(null);
                      toast('已更新');
                    }
                  }}
                >
                  <span>{node.name}</span>
                  {active && <Icon id="i-check" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 头像圆形裁剪 overlay（0614：套用前台主视觉、去缩放拖拽条、确定回显并提示上传成功、取消留在本页） */}
      {cropSrc && (
        <div className="crop-ov">
          <div className="crop-top">
            <button className="crop-cancel" onClick={() => setCropSrc(null)}>取消</button>
            <span className="t">调整头像</span>
            <button className="crop-done" onClick={confirmCrop}>确定</button>
          </div>
          <div
            className="crop-stage"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerLeave={onUp}
          >
            <img
              src={cropSrc}
              alt=""
              draggable={false}
              style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})` }}
            />
            <div className="crop-mask" />
          </div>
          <div className="crop-hint">拖动图片调整位置</div>
        </div>
      )}
    </>
  );
}
