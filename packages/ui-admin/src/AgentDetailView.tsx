import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { TextInput } from './Fields';
import { Modal } from './Modal';
import { pickFile, pickAudio, ACCEPT } from './Upload';

// 0716 #11：机构内现有 Agent 名（演示）——用于名称重复校验。
const EXISTING_AGENT_NAMES = ['李医生', '王护士', '康复助手'];

const DEFAULT_PROMPT =
  '你是一位资深心血管科医生「李医生」。回答需严谨、有出处,优先引用知识库内容并标注来源;语气专业而亲切。遇到受限的图/音/视内容时,引导用户开通会员或单独永享解锁。涉及诊断与用药时提醒用户以线下医嘱为准。';

// Agent 详情编辑（机构后台 + 平台后台共用，0614b 抽公共组件）。
// promptEditable=true 时「回答 Prompt」对超管开放编辑（不受权限限制，可改可存）；
// backTo / kpBase 适配两端不同路由。
export function AgentDetailView({
  backTo = '/agents',
  kpBase = '/kps',
  promptEditable = false,
  readonlyBanner,
}: {
  backTo?: string;
  kpBase?: string;
  promptEditable?: boolean;
  /** 0806：外部只读原因（父机构查看子机构 Agent）——传入即整页只读：输入禁用、上传与保存置灰，顶部显示该文案 */
  readonlyBanner?: string;
}) {
  const nav = useNavigate();
  const { id } = useParams();
  const isNew = id === 'new';
  const ro = !!readonlyBanner;
  const denyRo = () => toast('仅可操作本机构数据 · 子机构 Agent 请在其后台编辑');
  const agentType: string = '普通';
  const originalName = isNew ? '' : '李医生';
  const [crop, setCrop] = useState<null | 'avatar'>(null);
  const [name, setName] = useState(originalName);
  const [ttsUploaded, setTtsUploaded] = useState(!isNew);
  const [ttsPlaying, setTtsPlaying] = useState(false);
  // 0806：TTS 参考音文本（必填，≤100 字，不限字符种类）——参考音频内朗读的文本内容，供 TTS 引擎对齐
  const TTS_TEXT_MAX = 100;
  const [ttsText, setTtsText] = useState(isNew ? '' : '大家好，我是李医生。健康路上有疑问，随时问我，我会结合权威医学知识为你解答。');
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);

  // 0716 #11：保存前校验——名称非空 + 机构内唯一；TTS 参考音必填（格式/时长在上传时已校验）
  // 0806：TTS 参考音文本必填 + 100 字上限（输入框已按 maxLength 拦截，此处兜底）
  const save = () => {
    if (ro) return denyRo();
    const nm = name.trim();
    if (!nm) return toast('请输入 Agent 名称');
    const otherNames = EXISTING_AGENT_NAMES.filter((n) => n !== originalName);
    if (otherNames.includes(nm)) return toast('该 Agent 名称在机构内已存在，请更换');
    if (!ttsUploaded) return toast('请上传 TTS 参考音');
    if (!ttsText.trim()) return toast('请输入 TTS 参考音文本');
    if (ttsText.length > TTS_TEXT_MAX) return toast(`TTS 参考音文本不能超过 ${TTS_TEXT_MAX} 字`);
    toast(isNew ? '已创建 Agent' : promptEditable ? '已保存（含回答 Prompt）' : '已保存');
    if (isNew) nav(backTo);
  };

  return (
    <>
      <div className="kpd-head">
        <span className="kpd-back" onClick={() => nav(backTo)}>
          <Icon id="i-chevL" />
          返回
        </span>
        <span className="kpd-name">{isNew ? '新建 Agent' : '编辑 Agent · 李医生'}</span>
        <span className={'tag-s ' + (agentType === '机构' ? 'tag-indigo' : 'tag-line')}>{agentType}</span>
        <span className="kpd-status">
          <button className={'btn btn-primary btn-sm' + (ro ? ' off' : '')} onClick={save}>{isNew ? '创建' : '保存'}</button>
        </span>
      </div>
      {/* 0806：子机构 Agent 只读横幅（复用 KP 只读横幅样式） */}
      {ro && (
        <div className="kp-readonly-banner" style={{ marginTop: 12 }}>
          <Icon id="i-lock" w={14} h={14} />
          <span>{readonlyBanner}</span>
        </div>
      )}
      <div className="agent-edit" style={{ marginTop: 18 }}>
        <div className="fm-card" style={{ margin: 0 }}>
          <div className="fm-row">
            <div className="lab">头像<span className="req">*</span></div>
            <div className="ctl ae-up">
              <div className="ae-avatar" />
              <button className={'btn btn-ghost btn-sm' + (ro ? ' off' : '')} onClick={ro ? denyRo : () => pickFile(ACCEPT.image, () => setCrop('avatar'))}>
                <Icon id="i-up" w={14} h={14} />
                上传 png/gif/jpg
              </button>
            </div>
          </div>
          <div className="fm-row">
            <div className="lab">名称<span className="req">*</span></div>
            {/* 0806-2：hint 移到输入框同行右侧（原在下方） */}
            <div className="ctl" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="请输入 Agent 名称" style={{ width: 280, flex: 'none' }} disabled={ro} />
              <span className="hint" style={{ margin: 0 }}>名称在机构内不可重复</span>
            </div>
          </div>
          <div className="fm-row">
            <div className="lab">类型</div>
            <div className="ctl" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className={'tag-s ' + (agentType === '机构' ? 'tag-indigo' : 'tag-line')}>{agentType}</span>
              <span className="hint" style={{ margin: 0 }}>
                {agentType === '机构' ? '机构 Agent 全机构唯一 · 由平台初始化,类型不可更改' : '普通 Agent · 类型不可更改'}
              </span>
            </div>
          </div>
          <div className="fm-row">
            <div className="lab">TTS 参考音<span className="req">*</span></div>
            <div className="ctl ae-up">
              {ttsUploaded ? (
                <div className="tts-bar" onClick={() => setTtsPlaying((p) => !p)}>
                  <span className="tts-pp">
                    <Icon id={ttsPlaying ? 'i-pause' : 'i-play'} w={14} h={14} />
                  </span>
                  <span className="tts-wave">
                    {Array.from({ length: 22 }).map((_, i) => (
                      <i key={i} className={ttsPlaying ? 'on' : undefined} style={{ height: 5 + Math.abs(Math.sin(i * 1.4)) * 13 }} />
                    ))}
                  </span>
                  <span className="tts-dur mono">0:08</span>
                  <span className="tts-reup" onClick={(e) => { e.stopPropagation(); if (ro) return denyRo(); pickAudio((n) => toast('已替换为 ' + n), (r) => toast(r)); }}>重新上传</span>
                </div>
              ) : (
                <button className={'btn btn-ghost btn-sm' + (ro ? ' off' : '')} onClick={ro ? denyRo : () => pickAudio(() => setTtsUploaded(true), (r) => toast(r))}>
                  <Icon id="i-up" w={14} h={14} />
                  上传音频
                </button>
              )}
              <div className="hint" style={{ marginTop: 6 }}>格式 MP3 / WAV · 时长 3~10 秒</div>
            </div>
          </div>
          {/* 0806：TTS 参考音文本（必填）——参考音频内朗读的文本内容，两后台同一组件同步生效 */}
          <div className="fm-row">
            <div className="lab">TTS 参考音文本<span className="req">*</span></div>
            {/* 0806-3：说明定稿放输入框上方 */}
            <div className="ctl">
              <div className="hint" style={{ marginTop: 0, marginBottom: 8 }}>参考音频内朗读的文本内容・100 字以内，用于 TTS 引擎将参考音与文本对齐</div>
              <div className="ae-ttstext">
                <textarea
                  className="ae-ttstext-input"
                  value={ttsText}
                  maxLength={TTS_TEXT_MAX}
                  rows={3}
                  placeholder="请输入 TTS 参考音频内朗读的文本内容"
                  disabled={ro}
                  onChange={(e) => setTtsText(e.target.value.slice(0, TTS_TEXT_MAX))}
                />
                <span className={'ae-ttstext-count mono' + (ttsText.length >= TTS_TEXT_MAX ? ' full' : '')}>{ttsText.length} / {TTS_TEXT_MAX}</span>
              </div>
            </div>
          </div>
          <div className="fm-row">
            <div className="lab">回答 Prompt</div>
            <div className="ctl">
              {/* 平台超管：不受权限限制，可针对任意机构 / 任意 Agent 编辑并保存回答 Prompt */}
              <div className="hint" style={{ marginTop: 0, marginBottom: 8 }}>
                {promptEditable ? '平台超管可编辑全平台任意 Agent 的回答 Prompt，保存后即时生效' : '受权限控制，若需编辑请联系平台管理员'}
              </div>
              {promptEditable ? (
                <textarea
                  className="ae-prompt ae-prompt-edit"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={5}
                />
              ) : (
                <div className="ae-prompt" style={{ background: '#F3F4F8', color: 'var(--ink-3)' }}>
                  {prompt}
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          <div className="card card-pad" style={{ marginBottom: 16 }}>
            <div className="block-t">关联 KP</div>
            <div className="ae-kp" style={{ cursor: 'pointer' }} onClick={() => nav(kpBase + '/1')}>
              <span className="nm">心血管分册 · 第4版</span>
              <span className="go">
                前往 KP
                <Icon id="i-chevR" />
              </span>
            </div>
            <div className="ae-kp" style={{ cursor: 'pointer' }} onClick={() => nav(kpBase + '/3')}>
              <span className="nm">内科精要</span>
              <span className="go">
                前往 KP
                <Icon id="i-chevR" />
              </span>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title="裁剪头像"
        open={!!crop}
        onClose={() => setCrop(null)}
        width={420}
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setCrop(null)}>取消</button>
            <button className="btn btn-primary btn-sm" onClick={() => { setCrop(null); toast('已更新'); }}>确定</button>
          </>
        }
      >
        <div className="crop-box">
          <div className="frame" style={{ inset: '40px 110px', borderRadius: '50%' }} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', textAlign: 'center' }}>
          拖动调整裁剪区域 · 输出圆形头像
        </div>
      </Modal>
    </>
  );
}
