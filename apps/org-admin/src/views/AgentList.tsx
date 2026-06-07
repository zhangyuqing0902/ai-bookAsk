import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';

const AGENTS = [
  { name: '李医生', type: '普通', cls: 'tag-line', kp: '3', voice: '已设音色', grad: '' },
  { name: '王老师', type: '普通', cls: 'tag-line', kp: '1', voice: '已设音色', grad: 'linear-gradient(155deg,#19c08c,#12996e)' },
  { name: '机构 Agent', type: '机构', cls: 'tag-indigo', kp: '8', voice: '默认音色', grad: 'linear-gradient(155deg,#7c8bf5,#5562d8)' },
];

// 机构后台 · Agent 人设列表（机构/普通 类型标签）
export function AgentList() {
  const nav = useNavigate();
  return (
    <div id="org-agent">
      <div className="page-head">
        <div>
          <div className="pt">Agent 人设</div>
        </div>
        <div className="pa">
          <button className="btn btn-primary btn-sm" onClick={() => toast('新建 Agent')}>
            <Icon id="i-plus" w={14} h={14} />
            新建 Agent
          </button>
        </div>
      </div>
      <div className="kp-grid">
        {AGENTS.map((a, i) => (
          <div className="kp-card" key={a.name} onClick={() => nav('/agents/' + (i + 1))}>
            <div className="kp-cover agent-cover" style={a.grad ? { background: a.grad } : undefined}>
              <div className="ic">
                <Icon id="i-robot" />
              </div>
            </div>
            <div className="kp-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between' }}>
                <span className="kp-name">{a.name}</span>
                <span className={'tag-s ' + a.cls}>{a.type}</span>
              </div>
              <div className="kp-agent">关联 KP · {a.kp}</div>
              <div className="kp-stat">
                <span>
                  <Icon id="i-sound" />
                  {a.voice}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
