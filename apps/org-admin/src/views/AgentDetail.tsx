import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { TextInput, Modal, pickFile, ACCEPT } from '@aba/ui-admin';

// 机构后台 · Agent 详情编辑
export function AgentDetail() {
  const nav = useNavigate();
  const [type, setType] = useState(0);
  const [crop, setCrop] = useState<null | 'avatar' | 'form'>(null);
  const canEditPrompt = true; // agent.prompt.edit 权限(演示为有权限)

  return (
    <>
      <div className="kpd-head">
        <span className="kpd-back" onClick={() => nav('/agents')}>
          <Icon id="i-chevL" />
          返回
        </span>
        <span className="kpd-name">编辑 Agent · 李医生</span>
        <span className="tag-s tag-line">普通</span>
        <span className="kpd-status">
          <button className="btn btn-primary btn-sm" onClick={() => toast('已保存')}>保存</button>
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
            <div className="lab">形象图 9:16</div>
            <div className="ctl ae-up">
              <div className="ae-form9" />
              <button className="btn btn-ghost btn-sm" onClick={() => pickFile(ACCEPT.image, () => setCrop('form'))}>
                <Icon id="i-up" w={14} h={14} />
                上传形象图
              </button>
            </div>
          </div>
          <div className="fm-row">
            <div className="lab">名称<span className="req">*</span></div>
            <div className="ctl"><TextInput defaultValue="李医生" style={{ maxWidth: 280 }} /></div>
          </div>
          <div className="fm-row">
            <div className="lab">类型</div>
            <div className="ctl">
              <div className="seg">
                <b className={type === 0 ? 'on' : undefined} onClick={() => setType(0)}>普通</b>
                <b className={type === 1 ? 'on' : undefined} onClick={() => setType(1)}>机构</b>
              </div>
              <div className="hint">机构 Agent 全机构唯一 · 内置</div>
            </div>
          </div>
          <div className="fm-row">
            <div className="lab">TTS 参考音</div>
            <div className="ctl ae-up">
              <button className="btn btn-ghost btn-sm" onClick={() => pickFile(ACCEPT.audio, (n) => toast('已选择 ' + n))}>
                <Icon id="i-up" w={14} h={14} />
                上传音频
              </button>
              <span className="tts-play" onClick={() => toast('试听中…')}>
                <Icon id="i-play" />
                试听
              </span>
            </div>
          </div>
          <div className="fm-row">
            <div className="lab">回答 Prompt</div>
            <div className="ctl">
              <div className="hint" style={{ marginTop: 0, marginBottom: 8 }}>
                受 agent.prompt.edit 权限控制{canEditPrompt ? '' : ' · 当前无权限,仅可查看'}
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
          <div className="card card-pad">
            <div className="block-t">
              AI 会话引导问题示例 <span style={{ fontWeight: 400, color: 'var(--ink-3)', fontSize: 13 }}>系统按关联 KP 动态展示</span>
            </div>
            <div style={{ lineHeight: 2, fontSize: 13, color: 'var(--ink-2)' }}>
              · 冠脉造影前抗凝怎么管?
              <br />· 心衰一线利尿怎么选?
              <br />· 第 4 章重点是什么?
            </div>
          </div>
        </div>
      </div>

      <Modal
        title={crop === 'avatar' ? '裁剪头像' : '裁剪形象图（9:16）'}
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
          <div className="frame" style={crop === 'avatar' ? { inset: '40px 110px', borderRadius: '50%' } : undefined} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', textAlign: 'center' }}>
          拖动调整裁剪区域 · {crop === 'avatar' ? '输出圆形头像' : '输出 9:16 形象图'}
        </div>
      </Modal>
    </>
  );
}
