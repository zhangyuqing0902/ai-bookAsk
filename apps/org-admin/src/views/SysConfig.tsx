import { useState } from 'react';
import { toast } from '@aba/ui';
import { TextInput } from '@aba/ui-admin';

// 机构后台 · 系统配置（会员价格 + 回答策略）
export function SysConfig() {
  const [strategy, setStrategy] = useState(1);
  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">系统配置</div>
        </div>
      </div>
      <div className="fm-card">
        <div className="fh">AI 会员价格</div>
        <div className="fm-row">
          <div className="lab">首月折扣价</div>
          <div className="ctl">
            <TextInput defaultValue="¥ 9.9" style={{ maxWidth: 160 }} />
          </div>
        </div>
        <div className="fm-row">
          <div className="lab">月度价</div>
          <div className="ctl">
            <TextInput defaultValue="¥ 19.9" style={{ maxWidth: 160 }} />
          </div>
        </div>
        <div className="fm-row">
          <div className="lab">续费规则</div>
          <div className="ctl">
            <div className="inp2 disabled">支持随时退订，到期赠 72 小时会员缓冲使用期 · 暂不可编辑</div>
          </div>
        </div>
        {/* 0716 #10：会员价变更警示——无序序号结构化，提醒运营确定后非必要不改，避免续费扣款争议 */}
        <div className="fm-row" style={{ borderTop: 'none', paddingTop: 4 }}>
          <div className="lab" />
          <div className="ctl">
            {/* 0716 二批 #9：精简为单行（前两点合并，删后两点） */}
            <div style={{ background: 'var(--surface-warm, #FBF7F0)', border: '1px solid var(--line)', borderLeft: '3px solid var(--amber)', borderRadius: 10, padding: '11px 14px', maxWidth: 620 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>调价须知</div>
              <div style={{ fontSize: 12.5, lineHeight: 1.8, color: 'var(--ink-2)' }}>会员价一经确定，非必要请勿修改；已开通自动续费的用户，下一扣费周期将按修改后的价格扣款。</div>
            </div>
          </div>
        </div>
        <div className="fm-row" style={{ borderTop: 'none', paddingTop: 6 }}>
          <div className="lab" />
          <div className="ctl">
            <button className="btn btn-primary btn-sm" onClick={() => toast('已保存价格')}>
              保存
            </button>
          </div>
        </div>
      </div>
      <div className="fm-card">
        <div className="fh">
          回答策略 <span style={{ fontWeight: 400, color: 'var(--ink-3)', fontSize: 13 }}>知识库未检索到相关知识时</span>
        </div>
        <div className="radio-list" style={{ padding: '6px 0 16px' }}>
          {[
            { t: '严谨模式', d: '仅用知识库，未检索到则回答「暂无相关资料」（医疗 / 合规敏感场景）' },
            { t: '透明兜底（默认）', d: '未命中时由大模型补充，并标注「此为大模型生成、非知识库」' },
            { t: '流畅模式', d: '未命中时由大模型直接补充，不额外标注来源' },
          ].map((o, i) => (
            <div key={i} className={'radio-opt' + (strategy === i ? ' on' : '')} onClick={() => setStrategy(i)}>
              <div className="rd" />
              <div>
                <div className="rt">{o.t}</div>
                <div className="rs" style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 2 }}>{o.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
