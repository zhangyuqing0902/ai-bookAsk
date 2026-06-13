import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { TextInput, Modal, pickFile, ACCEPT } from '@aba/ui-admin';

// 机构后台 · Agent 详情编辑（id==='new' 为新建空表单,8.6）
export function AgentDetail() {
  const nav = useNavigate();
  const { id } = useParams();
  const isNew = id === 'new';
  // #16:Agent 类型为只读属性。用户创建/编辑的均为普通;机构 Agent 由平台初始化(此处演示普通)
  // 注:此处为 mock 固定值,真实场景由 agent.type 决定;用 string 避免字面量收窄导致比较告警
  const agentType: string = '普通';
  const [crop, setCrop] = useState<null | 'avatar'>(null);
  // 8.3:TTS 参考音 —— 未上传显示上传按钮,已上传显示播放条(本页默认演示已上传效果)
  const [ttsUploaded, setTtsUploaded] = useState(!isNew);
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const canEditPrompt = false; // agent.prompt.edit 权限受控

  return (
    <>
      <div className="kpd-head">
        <span className="kpd-back" onClick={() => nav('/agents')}>
          <Icon id="i-chevL" />
          返回
        </span>
        <span className="kpd-name">{isNew ? '新建 Agent' : '编辑 Agent · 李医生'}</span>
        <span className={'tag-s ' + (agentType === '机构' ? 'tag-indigo' : 'tag-line')}>{agentType}</span>
        <span className="kpd-status">
          <button className="btn btn-primary btn-sm" onClick={() => { toast(isNew ? '已创建 Agent' : '已保存'); if (isNew) nav('/agents'); }}>{isNew ? '创建' : '保存'}</button>
        </span>
      </div>
      <div className="agent-edit" style={{ marginTop: 18 }}>
        <div className="fm-card" style={{ margin: 0 }}>
          <div className="fm-row">
            <div className="lab">头像</div>
            <div className="ctl ae-up">
              <div className="ae-avatar" />
              <button className="btn btn-ghost btn-sm" onClick={() => pickFile(ACCEPT.image, () => setCrop('avatar'))}>
                <Icon id="i-up" w={14} h={14} />
                上传 png/gif/jpg
              </button>
            </div>
          </div>
          <div className="fm-row">
            <div className="lab">名称<span className="req">*</span></div>
            <div className="ctl"><TextInput defaultValue={isNew ? '' : '李医生'} placeholder="请输入 Agent 名称" style={{ maxWidth: 280 }} /></div>
          </div>
          <div className="fm-row">
            <div className="lab">类型</div>
            {/* #16:Agent 类型只读展示 —— 用户创建的均为「普通」;机构 Agent 由平台初始化,类型不可改 */}
            <div className="ctl" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className={'tag-s ' + (agentType === '机构' ? 'tag-indigo' : 'tag-line')}>{agentType}</span>
              <span className="hint" style={{ margin: 0 }}>
                {agentType === '机构' ? '机构 Agent 全机构唯一 · 由平台初始化,类型不可更改' : '普通 Agent · 类型不可更改'}
              </span>
            </div>
          </div>
          <div className="fm-row">
            <div className="lab">TTS 参考音</div>
            <div className="ctl ae-up">
              {/* 8.3:已上传→播放条(点击试听);未上传→上传按钮 */}
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
                  <span className="tts-reup" onClick={(e) => { e.stopPropagation(); pickFile(ACCEPT.audio, (n) => toast('已替换为 ' + n)); }}>重新上传</span>
                </div>
              ) : (
                <button className="btn btn-ghost btn-sm" onClick={() => pickFile(ACCEPT.audio, () => setTtsUploaded(true))}>
                  <Icon id="i-up" w={14} h={14} />
                  上传音频
                </button>
              )}
            </div>
          </div>
          <div className="fm-row">
            <div className="lab">回答 Prompt</div>
            <div className="ctl">
              {/* 8.4:权限文案 */}
              <div className="hint" style={{ marginTop: 0, marginBottom: 8 }}>
                受权限控制，若需编辑请联系平台管理员
              </div>
              <div className="ae-prompt" style={!canEditPrompt ? { background: '#F3F4F8', color: 'var(--ink-3)' } : undefined}>
                你是一位资深心血管科医生「李医生」。回答需严谨、有出处,优先引用知识库内容并标注来源;语气专业而亲切。遇到受限的图/音/视内容时,引导用户开通会员或单独永享解锁。涉及诊断与用药时提醒用户以线下医嘱为准。
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="card card-pad" style={{ marginBottom: 16 }}>
            <div className="block-t">关联 KP</div>
            <div className="ae-kp" style={{ cursor: 'pointer' }} onClick={() => nav('/kps/1')}>
              <span className="nm">心血管分册 · 第4版</span>
              <span className="go">
                前往 KP
                <Icon id="i-chevR" />
              </span>
            </div>
            <div className="ae-kp" style={{ cursor: 'pointer' }} onClick={() => nav('/kps/3')}>
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
