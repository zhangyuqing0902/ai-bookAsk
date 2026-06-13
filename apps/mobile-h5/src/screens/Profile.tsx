import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { useDemoStore } from '@aba/mock';
import type { Gender } from '@aba/mock';

// 个人资料：头像 / 昵称 / 性别 / 地区
// 0613：微信环境由授权自动带回（只读、标注「来自微信」）；非微信环境可上传头像、自填性别与地区。
const GENDERS: { k: Gender; label: string }[] = [
  { k: 'female', label: '女' },
  { k: 'male', label: '男' },
  { k: 'unknown', label: '保密' },
];

export function Profile() {
  const nav = useNavigate();
  const user = useDemoStore((s) => s.user);
  const wechatEnv = useDemoStore((s) => s.wechatEnv);
  const updateProfile = useDemoStore((s) => s.updateProfile);
  const [sheet, setSheet] = useState<null | 'gender' | 'region'>(null);
  const [region, setRegion] = useState(user.region ?? '');

  const genderLabel = GENDERS.find((g) => g.k === (user.gender ?? 'unknown'))?.label ?? '未设置';
  const fromWx = wechatEnv ? ' · 来自微信' : '';

  const tapAvatar = () =>
    wechatEnv ? toast('微信环境下头像取自微信，无需上传') : toast('调起相册 · 上传头像（演示）');
  const tapGender = () => (wechatEnv ? toast('微信环境下性别取自微信授权') : setSheet('gender'));
  const tapRegion = () => (wechatEnv ? toast('微信环境下地区取自微信授权') : setSheet('region'));

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
          <div className="bk-tip">
            {wechatEnv
              ? '微信环境：头像 / 昵称 / 性别 / 地区由微信授权自动带回'
              : '非微信环境：可上传头像、自行填写性别与地区'}
          </div>
          <div className="my-sec">资料</div>
          <div className="mlist">
            <div className="mrow tap" onClick={tapAvatar}>
              <span className="ml">头像</span>
              <span className="prof-av" />
              <span className="mc">
                <Icon id="i-chevR" />
              </span>
            </div>
            <div className="mrow">
              <span className="ml">昵称</span>
              <span className="mv">
                {user.nickname || '未设置'}
                {fromWx}
              </span>
            </div>
            <div className="mrow tap" onClick={tapGender}>
              <span className="ml">性别</span>
              <span className="mv">
                {genderLabel}
                {fromWx}
              </span>
              {!wechatEnv && (
                <span className="mc">
                  <Icon id="i-chevR" />
                </span>
              )}
            </div>
            <div className="mrow tap" onClick={tapRegion}>
              <span className="ml">地区</span>
              <span className="mv">
                {user.region || '未设置'}
                {fromWx}
              </span>
              {!wechatEnv && (
                <span className="mc">
                  <Icon id="i-chevR" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 性别选择 sheet（仅非微信环境） */}
      <div className={'ov' + (sheet === 'gender' ? ' open' : '')}>
        <div className="scrim" onClick={() => setSheet(null)} />
        <div className="pw">
          <div className="pw-h">
            <div className="t">选择性别</div>
          </div>
          <div className="pw-btns">
            {GENDERS.map((g) => (
              <button
                key={g.k}
                className="btn btn-ghost"
                onClick={() => {
                  updateProfile({ gender: g.k });
                  setSheet(null);
                  toast('已更新');
                }}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 地区填写 sheet（仅非微信环境） */}
      <div className={'ov' + (sheet === 'region' ? ' open' : '')}>
        <div className="scrim" onClick={() => setSheet(null)} />
        <div className="pw">
          <div className="pw-h">
            <div className="t">填写地区</div>
          </div>
          <div className="pf" style={{ margin: '10px 4px 0' }}>
            <div className="pin">
              <Icon id="i-building" />
              <input placeholder="如：上海市 · 浦东新区" value={region} onChange={(e) => setRegion(e.target.value)} />
            </div>
          </div>
          <div className="pw-btns">
            <button
              className="btn btn-primary"
              onClick={() => {
                updateProfile({ region });
                setSheet(null);
                toast('已更新');
              }}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
