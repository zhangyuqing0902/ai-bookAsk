import { useRef, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { CUSTOM_PRESET_KEY, PROMPT_PRESETS, promptPresetOf } from '@aba/mock';
import { TextInput } from './Fields';
import { Modal } from './Modal';
import { pickFile, pickAudio, ACCEPT } from './Upload';

// 0716 #11：机构内现有 Agent 名（演示）——用于名称重复校验。
const EXISTING_AGENT_NAMES = ['李医生', '王护士', '康复助手'];

const DEFAULT_PROMPT =
  '你是一位资深心血管科医生「李医生」。回答需严谨、有出处,优先引用知识库内容并标注来源;语气专业而亲切。遇到受限的图/音/视内容时,引导用户开通会员或单独永享解锁。涉及诊断与用药时提醒用户以线下医嘱为准。';

// Agent 详情编辑（机构后台 + 平台后台共用，0614b 抽公共组件）。
// 0812：「回答 Prompt」升级为「人设风格」——七档平台预设 + 自定义。选预设时正文只读展示预设全文（可见不黑盒）；
//   选「自定义」时可编辑，并预填切换前文本作起点。后端仅存 preset_key，custom 才存 prompt 全文（最小改动）。
// 0812-e：权限语义随权限项定名「人设风格-自定义」对齐——**预设人人可切**（机构侧不再整块只读），
//   **仅「自定义」受权限控制**（customEditable=false 时该 chip 锁定、正文只读）。
// backTo / kpBase 适配两端不同路由。
export function AgentDetailView({
  backTo = '/agents',
  kpBase = '/kps',
  customEditable = false,
  readonlyBanner,
  headExtra,
}: {
  backTo?: string;
  kpBase?: string;
  /** 0812-e：是否具备「人设风格-自定义」权限（对应权限点 agent.prompt.edit）；预设切换不受此限制 */
  customEditable?: boolean;
  /** 0806：外部只读原因（父机构查看子机构 Agent）——传入即整页只读：输入禁用、上传与保存置灰，顶部显示该文案 */
  readonlyBanner?: string;
  /** 0812-f：页头右侧插槽（保存按钮之前）——机构后台放〔演示〕权限切换，上线后由角色权限决定、无此开关 */
  headExtra?: ReactNode;
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
  // 0812：人设风格——存量 Agent（李医生）视为自定义；新建默认「专业友好」预设
  const [presetKey, setPresetKey] = useState(isNew ? PROMPT_PRESETS[0].key : CUSTOM_PRESET_KEY);
  const [prompt, setPrompt] = useState(isNew ? PROMPT_PRESETS[0].text : DEFAULT_PROMPT);
  const isCustom = presetKey === CUSTOM_PRESET_KEY;
  // 0812-e：预设切换不受权限限制（仅跨机构只读时禁用）；「自定义」需 agent.prompt.edit 权限。
  // 权限锁的是「编辑」不是「查看」——无权限机构切到预设后仍可切回查看原有自定义文案（只读），
  // 否则一次切换就把原文案永久换掉、无权限再也写不回来，等于不可逆的数据丢失。
  const canEditCustom = customEditable && !ro;
  const savedCustom = useRef(isNew ? '' : DEFAULT_PROMPT); // 该 Agent 已保存的自定义文案（无权限时只读回看）
  const pickPreset = (k: string) => {
    if (ro) return denyRo();
    if (k === CUSTOM_PRESET_KEY && !canEditCustom && !savedCustom.current) {
      return toast('「自定义」需平台管理员授权（权限项：人设风格-自定义）');
    }
    if (k === presetKey) return;
    setPresetKey(k);
    if (k !== CUSTOM_PRESET_KEY) setPrompt(promptPresetOf(k)?.text ?? '');
    // 切到自定义：有权限＝保留当前文本作起点（降低从零编写门槛）；无权限＝恢复已保存的自定义文案供查看
    else if (!canEditCustom) setPrompt(savedCustom.current);
  };

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
    // 0812-f：人设风格空值拦截不区分权限——「自定义」态正文为空一律不可保存（人设风格是必填的生效配置，
    // 空文案会让 Agent 回落到无人设状态）；无自定义权限者按其可行动路径引导去选预设，而非提示他去改文本框
    if (isCustom && !prompt.trim()) {
      return toast(canEditCustom ? '自定义人设风格不能为空，可先选择一个预设作起点' : '人设风格不能为空，请选择一个平台预设后保存');
    }
    toast(isNew ? '已创建 Agent' : '已保存');
    if (isNew) nav(backTo);
  };

  return (
    <div className="agent-detail">
      <div className="kpd-head">
        <span className="kpd-back" onClick={() => nav(backTo)}>
          <Icon id="i-chevL" />
          返回
        </span>
        <span className="kpd-name">{isNew ? '新建 Agent' : '编辑 Agent · 李医生'}</span>
        <span className={'tag-s ' + (agentType === '机构' ? 'tag-indigo' : 'tag-line')}>{agentType}</span>
        <span className="kpd-status">
          {headExtra}
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
        <div className="fm-card ae-card">
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
          {/* 0812：「回答 Prompt」→「人设风格」——七档预设 chip + 自定义；预设全文可见（只读）
              0812-e：两端同一结构——预设人人可切；「自定义」按权限（人设风格-自定义）开关，无权限时 chip 锁定、正文只读。
              说明合并为一行置于输入区上方：既讲清「人设段只管身份语气」的分层边界，也讲清预设 / 自定义的用法 */}
          <div className="fm-row">
            <div className="lab">人设风格<span className="req">*</span></div>
            <div className="ctl">
              <div className="hint" style={{ marginTop: 0, marginBottom: 8 }}>
                {ro
                  ? '此处只定义身份与语气，事实与安全规则由系统统一控制；子机构 Agent 仅可查看'
                  : canEditCustom
                    ? '此处只定义身份与语气，事实与安全规则由系统统一控制；选预设即用即生效，「自定义」可自由改写'
                    : '此处只定义身份与语气，事实与安全规则由系统统一控制；可切换平台预设，「自定义」需平台授权'}
              </div>
              <div className="ae-preset-row">
                {PROMPT_PRESETS.map((p) => (
                  <button
                    key={p.key}
                    className={'ae-preset-chip' + (presetKey === p.key ? ' on' : '') + (ro ? ' is-locked' : '')}
                    onClick={() => pickPreset(p.key)}
                  >
                    {p.label}
                    {p.key === PROMPT_PRESETS[0].key && <span className="ae-preset-def">默认</span>}
                    {/* 适用场景提示：平台通用深色浮层（同 InfoDot 的 info-pop） */}
                    <span className="ae-preset-tip">{p.apply}</span>
                  </button>
                ))}
                <button
                  className={'ae-preset-chip' + (isCustom ? ' on' : '') + (canEditCustom ? '' : ' is-locked')}
                  onClick={() => pickPreset(CUSTOM_PRESET_KEY)}
                >
                  {!canEditCustom && <Icon id="i-lock" w={10} h={10} />}
                  自定义
                  <span className="ae-preset-tip">
                    {canEditCustom
                      ? '在预设基础上自行编写身份与语气描述'
                      : savedCustom.current
                        ? '可查看本 Agent 已保存的自定义文案；编辑需平台管理员授权（权限项：人设风格-自定义）'
                        : '需平台管理员授权（权限项：人设风格-自定义）'}
                  </span>
                </button>
              </div>
              {/* 0812-e：预设文案为结构化多行（风格 / 避免分段）；高度收窄，可手动拉高 */}
              <textarea
                className={'ae-prompt ae-prompt-edit' + (isCustom && canEditCustom ? '' : ' ae-prompt-preset')}
                value={prompt}
                readOnly={!(isCustom && canEditCustom)}
                onChange={(e) => isCustom && canEditCustom && setPrompt(e.target.value)}
                rows={10}
              />
            </div>
          </div>
        </div>
        <div>
          <div className="card card-pad ae-side" style={{ marginBottom: 16 }}>
            <div className="block-t">关联 KP<span className="ae-kp-n">2</span></div>
            <div className="ae-kp" style={{ cursor: 'pointer' }} onClick={() => nav(kpBase + '/1')}>
              <span className="ae-kp-ic"><Icon id="i-doc" w={15} h={15} /></span>
              <span className="nm">心血管分册 · 第4版</span>
              <span className="go">
                前往 KP
                <Icon id="i-chevR" />
              </span>
            </div>
            <div className="ae-kp" style={{ cursor: 'pointer' }} onClick={() => nav(kpBase + '/3')}>
              <span className="ae-kp-ic"><Icon id="i-doc" w={15} h={15} /></span>
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
    </div>
  );
}
