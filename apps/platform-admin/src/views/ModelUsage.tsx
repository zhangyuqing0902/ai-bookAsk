import { useState } from 'react';
import { Icon, toast } from '@aba/ui';
import { LineChart, RangePicker, Dropdown, InfoDot } from '@aba/ui-admin';

// 平台后台 · 模型用量（平台默认 LLM）—— 0610:复用主控台两段式(实时总览 + 经营分析)
const ORG_SERIES: Record<string, number[]> = {
  'XX 出版社': [120, 150, 140, 175, 165, 205, 225],
  'YY 教育': [80, 95, 100, 110, 120, 128, 140],
  'ZZ 少儿': [50, 60, 68, 72, 85, 90, 98],
};

export function ModelUsage() {
  const x = ['05-25', '05-26', '05-27', '05-28', '05-29', '05-30', '05-31'];
  const [rangeLabel, setRangeLabel] = useState('近 7 天');
  const [org, setOrg] = useState('全部');
  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">模型用量</div>
        </div>
        <div className="pa">
          <Dropdown label="全部" options={['全部', 'XX 出版社', 'YY 教育', 'ZZ 少儿']} onSelect={setOrg} style={{ minWidth: 140 }} />
          <button className="btn btn-ghost btn-sm" onClick={() => toast('导出')}>
            <Icon id="i-dl" w={14} h={14} />
            导出
          </button>
        </div>
      </div>

      {/* 0610:实时总览(平台开通至今累计,不随时间筛选变化) */}
      <div className="dash-section-title">
        实时总览
        <span className="dash-realtime-tag">实时</span>
        <span className="dash-section-sub">· 平台开通至今的累计用量，不随下方时间筛选变化</span>
      </div>
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
        <div className="kpi">
          <div className="lab">
            累计 tokens
            <InfoDot text="平台默认 LLM 自开通至今消耗的总 token 数(输入+输出)。统计口径：实时快照。" />
          </div>
          <div className="val">
            128.4<span className="u">M</span>
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            累计调用次数
            <InfoDot text="平台默认 LLM 自开通至今被请求的总次数。统计口径：实时快照。" />
          </div>
          <div className="val">
            3.62<span className="u">M</span>
          </div>
        </div>
      </div>

      {/* 0610:经营分析(随时间区间联动) */}
      <div className="dash-section-head">
        <div className="dash-section-title" style={{ margin: 0 }}>
          经营分析
          <span className="dash-section-sub">· {rangeLabel}</span>
        </div>
        <RangePicker presets={['今日', '近 7 天', '30 天']} defaultActive={1} onChange={(r) => setRangeLabel(r.label)} />
      </div>
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="kpi">
          <div className="lab">
            区间 tokens
            <InfoDot text="平台默认 LLM 在所选机构/区间内消耗的总 token 数(输入+输出)。随上方时间区间变化。" />
          </div>
          <div className="val">
            8.6<span className="u">M</span>
          </div>
          <div className="delta up">
            <Icon id="i-up" w={11} h={11} />
            9.2% 较上一周期
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            区间调用次数
            <InfoDot text="平台默认 LLM 在所选区间内被请求的次数。随上方时间区间变化。" />
          </div>
          <div className="val">
            240<span className="u">k</span>
          </div>
          <div className="delta up">
            <Icon id="i-up" w={11} h={11} />
            6.1% 较上一周期
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            平均响应
            <InfoDot text="单次模型调用从请求到首字返回的平均耗时。随上方时间区间变化。" />
          </div>
          <div className="val">
            1.8<span className="u">s</span>
          </div>
          <div className="delta up">
            <Icon id="i-up" w={11} h={11} />
            优化 0.2s
          </div>
        </div>
      </div>
      {/* 0613：全部机构 → 总量趋势 + Top 机构排行（弃多折线，适配数十至上百机构）；选中单机构 → 该机构趋势 */}
      {org === '全部' ? (
        <>
          <div className="chart-card">
            <div className="chart-head">
              <div className="chart-title">全平台总量趋势 · {rangeLabel}</div>
              <div className="legend"><span><i style={{ background: 'var(--indigo)' }} />总 tokens</span></div>
            </div>
            <LineChart cfg={{ x, area: true, series: [{ name: '总tokens', color: '#4B57E8', values: [250, 305, 308, 357, 370, 423, 463] }] }} />
          </div>
          <div className="chart-card">
            <div className="chart-title" style={{ marginBottom: 12 }}>Top 机构 token 排行 · 当期</div>
            <div className="bars">
              {[
                { nm: 'XX 出版社', pct: 100, color: 'var(--indigo)', pv: '6.4M' },
                { nm: 'YY 教育', pct: 62, color: 'var(--jade)', pv: '4.0M' },
                { nm: 'ZZ 少儿', pct: 44, color: 'var(--amber)', pv: '2.8M' },
                { nm: 'AA 文化集团', pct: 30, color: 'var(--ink-3)', pv: '1.9M' },
                { nm: 'BB 数字出版', pct: 22, color: 'var(--ink-3)', pv: '1.4M' },
              ].map((t) => (
                <div className="bar-row" key={t.nm}>
                  <span className="nm">{t.nm}</span>
                  <span className="bar-track"><span className="bar-fill" style={{ width: t.pct + '%', background: t.color }} /></span>
                  <span className="pv">{t.pv}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="chart-card">
          <div className="chart-head">
            <div className="chart-title">{org} · 用量趋势 · {rangeLabel}</div>
            <div className="legend"><span><i style={{ background: 'var(--indigo)' }} />{org}</span></div>
          </div>
          <LineChart cfg={{ x, area: true, series: [{ name: org, color: '#4B57E8', values: ORG_SERIES[org] ?? [120, 150, 140, 175, 165, 205, 225] }] }} />
        </div>
      )}
    </>
  );
}
