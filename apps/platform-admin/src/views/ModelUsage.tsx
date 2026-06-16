import { useState } from 'react';
import { Icon, toast } from '@aba/ui';
import { LineChart, RangePicker, Dropdown, InfoDot, UNIT_NOTE } from '@aba/ui-admin';

// 平台后台 · 模型用量（平台默认 LLM）。0610:两段式(实时总览 + 经营分析)。
// 0614:经营分析全部指标 + 总量趋势 + Top 机构排行 按 今日/近7天/30天 真联动；删「当期」硬编码，改按所选时间显示。
// 0614b:token / 调用 统一中文万进制（万/亿），并显单位（token / 次）。
const I = 'var(--indigo)', J = 'var(--jade)', A = 'var(--amber)', G = 'var(--ink-3)';
type TopRow = { nm: string; pct: number; color: string; pv: string };
interface MU {
  tokens: string; // 区间 tokens（万/亿）
  tkDelta: string;
  callVal: string;
  callUnit: string; // 单位后缀（次）
  callDelta: string;
  resp: string;
  respNote: string;
  x: string[];
  total: number[]; // 全平台总量趋势
  top: TopRow[]; // Top 机构 token 排行
  orgFactor: number; // 单机构趋势相对「近 7 天」基准的缩放
}

const RANGE: Record<string, MU> = {
  '今日': {
    tokens: '62万', tkDelta: '12.4% 较上一周期',
    callVal: '1.8万', callUnit: '次', callDelta: '7.5% 较上一周期',
    resp: '1.7', respNote: '优化 0.3s',
    x: ['00时', '04时', '08时', '12时', '16时', '20时', '现在'],
    total: [18, 14, 40, 78, 92, 105, 80],
    top: [
      { nm: 'XX 出版社', pct: 100, color: I, pv: '45万' },
      { nm: 'YY 教育', pct: 62, color: J, pv: '28万' },
      { nm: 'ZZ 少儿', pct: 42, color: A, pv: '19万' },
      { nm: 'AA 文化集团', pct: 29, color: G, pv: '13万' },
      { nm: 'BB 数字出版', pct: 20, color: G, pv: '9万' },
    ],
    orgFactor: 0.08,
  },
  '近 7 天': {
    tokens: '860万', tkDelta: '9.2% 较上一周期',
    callVal: '24万', callUnit: '次', callDelta: '6.1% 较上一周期',
    resp: '1.8', respNote: '优化 0.2s',
    x: ['05-25', '05-26', '05-27', '05-28', '05-29', '05-30', '05-31'],
    total: [250, 305, 308, 357, 370, 423, 463],
    top: [
      { nm: 'XX 出版社', pct: 100, color: I, pv: '640万' },
      { nm: 'YY 教育', pct: 62, color: J, pv: '400万' },
      { nm: 'ZZ 少儿', pct: 44, color: A, pv: '280万' },
      { nm: 'AA 文化集团', pct: 30, color: G, pv: '190万' },
      { nm: 'BB 数字出版', pct: 22, color: G, pv: '140万' },
    ],
    orgFactor: 1,
  },
  '30 天': {
    tokens: '3,620万', tkDelta: '14.0% 较上一周期',
    callVal: '102万', callUnit: '次', callDelta: '8.8% 较上一周期',
    resp: '1.9', respNote: '优化 0.1s',
    x: ['05-02', '05-07', '05-12', '05-17', '05-22', '05-27', '06-01'],
    total: [1050, 1180, 1260, 1380, 1520, 1660, 1820],
    top: [
      { nm: 'XX 出版社', pct: 100, color: I, pv: '2,600万' },
      { nm: 'YY 教育', pct: 65, color: J, pv: '1,700万' },
      { nm: 'ZZ 少儿', pct: 42, color: A, pv: '1,100万' },
      { nm: 'AA 文化集团', pct: 29, color: G, pv: '760万' },
      { nm: 'BB 数字出版', pct: 21, color: G, pv: '560万' },
    ],
    orgFactor: 4.2,
  },
};

// 单机构趋势基准（近 7 天），其余区间按 orgFactor 缩放
const ORG_BASE: Record<string, number[]> = {
  'XX 出版社': [120, 150, 140, 175, 165, 205, 225],
  'YY 教育': [80, 95, 100, 110, 120, 128, 140],
  'ZZ 少儿': [50, 60, 68, 72, 85, 90, 98],
};

export function ModelUsage() {
  const [rangeLabel, setRangeLabel] = useState('近 7 天');
  const [org, setOrg] = useState('全部');
  const d = RANGE[rangeLabel] ?? RANGE['近 7 天'];
  const orgSeries = (ORG_BASE[org] ?? ORG_BASE['XX 出版社']).map((v) => Math.max(1, Math.round(v * d.orgFactor)));

  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">全域模型用量</div>
        </div>
        <div className="pa">
          <Dropdown label="全部" options={['全部', 'XX 出版社', 'YY 教育', 'ZZ 少儿']} onSelect={setOrg} style={{ minWidth: 140 }} />
          <button className="btn btn-ghost btn-sm" onClick={() => toast('导出')}>
            <Icon id="i-dl" w={14} h={14} />
            导出
          </button>
        </div>
      </div>

      {/* 实时总览(平台开通至今累计,不随时间筛选变化) */}
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
            1.28亿<span className="uu">token</span>
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            累计调用次数
            <InfoDot text="平台默认 LLM 自开通至今被请求的总次数。统计口径：实时快照。" />
          </div>
          <div className="val">
            362万<span className="uu">次</span>
          </div>
        </div>
      </div>

      {/* 经营分析(随时间区间联动) */}
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
            <InfoDot text="平台默认 LLM 在所选机构 / 区间内消耗的总 token 数(输入+输出)。随上方时间区间变化。" />
          </div>
          <div className="val">
            {d.tokens}<span className="uu">token</span>
          </div>
          <div className="delta up">
            <Icon id="i-up" w={11} h={11} />
            {d.tkDelta}
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            区间调用次数
            <InfoDot text="平台默认 LLM 在所选区间内被请求的次数。随上方时间区间变化。" />
          </div>
          <div className="val">
            {d.callVal}<span className="uu">{d.callUnit}</span>
          </div>
          <div className="delta up">
            <Icon id="i-up" w={11} h={11} />
            {d.callDelta}
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            平均响应
            <InfoDot text="单次模型调用从请求到首字返回的平均耗时。随上方时间区间变化。" />
          </div>
          <div className="val">
            {d.resp}<span className="u">s</span>
          </div>
          <div className="delta up">
            <Icon id="i-up" w={11} h={11} />
            {d.respNote}
          </div>
        </div>
      </div>
      {/* 全部机构 → 总量趋势 + Top 机构排行（左右并列）；选中单机构 → 该机构趋势。均随时间区间联动 */}
      {org === '全部' ? (
        <div className="grid2" style={{ marginTop: 16, gridTemplateColumns: '1.4fr 1fr', alignItems: 'start' }}>
          <div className="chart-card" style={{ margin: 0 }}>
            <div className="chart-head">
              <div className="chart-title">全平台总量趋势 · {rangeLabel}</div>
              <div className="legend"><span><i style={{ background: 'var(--indigo)' }} />总 tokens</span></div>
            </div>
            <LineChart cfg={{ x: d.x, area: true, series: [{ name: '总tokens', color: '#4B57E8', values: d.total }] }} />
          </div>
          <div className="chart-card" style={{ margin: 0 }}>
            <div className="chart-title" style={{ marginBottom: 12 }}>Top 机构 token 排行 · {rangeLabel}</div>
            <div className="bars">
              {d.top.map((t) => (
                <div className="bar-row" key={t.nm}>
                  <span className="nm">{t.nm}</span>
                  <span className="bar-track"><span className="bar-fill" style={{ width: t.pct + '%', background: t.color }} /></span>
                  <span className="pv">{t.pv}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="chart-card">
          <div className="chart-head">
            <div className="chart-title">{org} · 用量趋势 · {rangeLabel}</div>
            <div className="legend"><span><i style={{ background: 'var(--indigo)' }} />{org}</span></div>
          </div>
          <LineChart cfg={{ x: d.x, area: true, series: [{ name: org, color: '#4B57E8', values: orgSeries }] }} />
        </div>
      )}
      <div className="unit-note">{UNIT_NOTE}</div>
    </>
  );
}
