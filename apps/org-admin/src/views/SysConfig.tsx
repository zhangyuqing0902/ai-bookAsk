import { useState, type ReactNode } from 'react';
import { toast } from '@aba/ui';
import { TextInput, ConfirmDialog } from '@aba/ui-admin';

// 机构后台 · 系统配置（会员价格 + 回答策略）
// 0718 #3：「保存价格」与「回答策略切换」均走二次确认弹窗（ConfirmDialog），确认后才生效
const STRATEGIES = [
  { t: '严谨模式', d: '仅用知识库，未检索到则回答「暂无相关资料」（医疗 / 合规敏感场景）' },
  { t: '透明兜底（默认）', d: '未命中时由大模型补充，并标注「此为大模型生成、非知识库」' },
  { t: '流畅模式', d: '未命中时由大模型直接补充，不额外标注来源' },
];

export function SysConfig() {
  const [strategy, setStrategy] = useState(1);
  const [confirm, setConfirm] = useState<null | { title: string; desc?: ReactNode; confirmText: string; onOk: () => void }>(null);
  // 保存价格 → 二次确认（说明影响范围）；0812：扣费口径改「就低不就高」（涨价保护存量签约用户）
  const askSavePrice = () =>
    setConfirm({
      title: '保存会员价格',
      desc: '保存后新开通用户按新价格签约；已开通自动续费的用户按「就低不就高」扣费——降价后按新价格扣款（扣费前短信告知），涨价后仍按其签约价扣款。',
      confirmText: '确认保存',
      onOk: () => toast('已保存价格'),
    });
  // 切换回答策略 → 二次确认（点当前已选项不触发）
  const askStrategy = (i: number) => {
    if (i === strategy) return;
    const o = STRATEGIES[i];
    setConfirm({
      title: '切换回答策略',
      desc: `将切换为「${o.t}」：${o.d}。切换立即生效，影响知识库未命中时的回答行为。`,
      confirmText: '确认切换',
      onOk: () => {
        setStrategy(i);
        toast('已切换回答策略');
      },
    });
  };
  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">系统配置</div>
        </div>
      </div>
      <div className="fm-card">
        <div className="fh">AI 会员价格</div>
        {/* 0718 #4：两组价格并排两枚子面板（续费语义标与前台套餐卡一致），每档＝标签+输入框+一行说明；
            续费规则改静态文本（只读信息不再伪装成表单控件） */}
        <div className="price-groups">
          <div className="price-panel">
            <div className="price-panel-t">
              连续包月
              <span className="price-panel-tag">自动续费</span>
            </div>
            <div className="price-row">
              <span className="price-lab">首月价格（首月特惠）</span>
              <TextInput defaultValue="¥ 9.9" style={{ maxWidth: 140 }} />
            </div>
            <div className="price-hint">仅首次开通连续包月的首月扣款；前台「连续包月」卡展示为「首月特惠 ¥9.9」</div>
            <div className="price-row">
              <span className="price-lab">次月起价格（/月）</span>
              <TextInput defaultValue="¥ 19.9" style={{ maxWidth: 140 }} />
            </div>
            <div className="price-hint">第 2 个月起每月按此价自动续费扣款，用户可随时退订</div>
          </div>
          <div className="price-panel">
            <div className="price-panel-t">
              单月
              <span className="price-panel-tag gray">一次性购买 · 不自动续费</span>
            </div>
            <div className="price-row">
              <span className="price-lab">单月价格（/1 个月）</span>
              <TextInput defaultValue="¥ 19.9" style={{ maxWidth: 140 }} />
            </div>
            <div className="price-hint">一次性扣款，有效期 1 个月，到期自动失效不再扣费；即前台「单月会员」卡价格</div>
          </div>
        </div>
        {/* 0716 #10：会员价变更警示——无序序号结构化，提醒运营确定后非必要不改，避免续费扣款争议
            0718 #5：续费规则 + 调价须知合并为同一灰色说明块，与「连续包月」面板左对齐（不再缩进表单标签列）；
            0718 #6：纯文字呈现——去掉编辑态标记与两行间分隔线；保存按钮单独一行、同样左对齐 */}
        {/* 0812：调价扣费口径定版「就低不就高」——自动扣费价 = min(签约价, 当前售价)；降价须扣费前告知（并入续费提醒短信） */}
        <div className="price-note" style={{ marginTop: 10 }}>
          <div className="price-note-row">续费规则：支持随时退订，到期赠 72 小时会员缓冲使用期</div>
          <div className="price-note-row">调价须知：会员价一经确定，非必要请勿修改；新用户始终按最新价格签约。</div>
          <div className="price-note-row">降价：已开通自动续费的用户按最新（更低）价格扣款，并在扣费前 5 天的续费提醒短信中一并告知降价信息。</div>
          <div className="price-note-row">涨价：已开通自动续费的用户仍按其签约价格扣款（就低不就高，保护存量用户），仅新签约用户按新价格执行。</div>
        </div>
        <div style={{ marginTop: 14 }}>
          <button className="btn btn-primary btn-sm" onClick={askSavePrice}>
            保存
          </button>
        </div>
      </div>
      <div className="fm-card">
        <div className="fh">
          回答策略 <span style={{ fontWeight: 400, color: 'var(--ink-3)', fontSize: 13 }}>知识库未检索到相关知识时</span>
        </div>
        {/* 0718 #3：切换走二次确认弹窗，确认后才生效（点当前已选项不触发） */}
        <div className="radio-list" style={{ padding: '6px 0 16px' }}>
          {STRATEGIES.map((o, i) => (
            <div key={i} className={'radio-opt' + (strategy === i ? ' on' : '')} onClick={() => askStrategy(i)}>
              <div className="rd" />
              <div>
                <div className="rt">{o.t}</div>
                <div className="rs" style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 2 }}>{o.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* 0718 #3：价格保存 / 回答策略切换共用的二次确认弹窗 */}
      {confirm && <ConfirmDialog open title={confirm.title} desc={confirm.desc} confirmText={confirm.confirmText} onConfirm={confirm.onOk} onClose={() => setConfirm(null)} />}
    </>
  );
}
