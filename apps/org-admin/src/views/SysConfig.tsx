import { useState } from 'react';
import { toast } from '@aba/ui';
import { TextInput } from '@aba/ui-admin';

// 机构后台 · 系统配置（会员价格 + 回答策略）
export function SysConfig() {
  const [strategy, setStrategy] = useState(2);
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
            <div className="inp2 disabled">按月自动续费,到期前 72h 宽限期 · 暂不可编辑</div>
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
            '直接由大模型回答',
            '直接告知「知识库暂无此资料」相关话术',
            '大模型回答并告知「此为大模型生成、非 AI 问书知识库内容」相关话术',
          ].map((t, i) => (
            <div key={i} className={'radio-opt' + (strategy === i ? ' on' : '')} onClick={() => setStrategy(i)}>
              <div className="rd" />
              <div>
                <div className="rt">{t}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
