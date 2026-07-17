import { useState } from 'react';
import { Icon, toast } from '@aba/ui';
import { LineChart, RangePicker, Dropdown, InfoDot, exportWorkbook, UNIT_NOTE } from '@aba/ui-admin';
import { comparisonPeriodLabel, metricHelp, orgOptionValue, PLATFORM_ORGS, platformOrgRole } from '@aba/mock';
import { MODEL_USAGE_ORG_BASE, MODEL_USAGE_RANGE, MODEL_USAGE_TOTALS } from '../data/modelUsage';
import { buildModelUsageSpec } from '../exports/modelUsage';
import { applyOrgOverrides, useOrgTree } from '../stores/orgTree';

// 平台后台 · 模型用量（平台默认 LLM）。0610:两段式(实时总览 + 经营分析)。
// 0614:经营分析全部指标 + 总量趋势 + Top 机构排行 按 今日/近7天/30天 真联动；删「当期」硬编码，改按所选时间显示。
// 0614b:token / 调用 统一中文万进制（万/亿），并显单位（token / 次）。
// 0714：mock 数据下移 ../data/modelUsage；#5.1 机构下拉改机构主数据全量（父机构带后缀 + 汇总口径说明行）；
//       导出迁移到 exports/modelUsage.ts spec 纯函数（实时 / 区间 Sheet 分别标注）。

export function ModelUsage() {
  const [rangeLabel, setRangeLabel] = useState('近 7 天');
  const [org, setOrg] = useState('全部');
  const d = MODEL_USAGE_RANGE[rangeLabel] ?? MODEL_USAGE_RANGE['近 7 天'];
  const periodKind = rangeLabel === '今日' ? 'today' as const : 'range' as const;
  const periodDays = rangeLabel === '今日' ? 1 : rangeLabel === '30 天' ? 30 : 7;
  const orgSeries = (MODEL_USAGE_ORG_BASE[org] ?? MODEL_USAGE_ORG_BASE['XX 出版社']).map((v) => Math.max(1, Math.round(v * d.orgFactor)));
  // 0714 #5.1：机构下拉 = 机构主数据全量（应用层级覆盖），父机构带后缀；选中父机构显示汇总口径说明
  const overrides = useOrgTree((s) => s.parentOverrides);
  const orgs = applyOrgOverrides(PLATFORM_ORGS, overrides);
  const orgLabel = (name: string) => {
    const o = orgs.find((x) => x.name === name);
    return o && platformOrgRole(o, orgs) === 'parent' ? `${name}（父机构）` : name;
  };
  const selected = orgs.find((o) => o.name === org);
  const childNames = selected && platformOrgRole(selected, orgs) === 'parent' ? orgs.filter((o) => o.parentId === selected.id).map((o) => o.name) : [];

  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">全域模型用量</div>
        </div>
        <div className="pa">
          <Dropdown label="全部" options={['全部', ...orgs.map((o) => orgLabel(o.name))]} onSelect={(v) => setOrg(orgOptionValue(v))} style={{ minWidth: 190 }} />
          <button className="btn btn-ghost btn-sm" onClick={() => { void exportWorkbook(buildModelUsageSpec({ org, rangeLabel })); toast('正在导出'); }}>
            <Icon id="i-dl" w={14} h={14} />
            导出
          </button>
        </div>
      </div>

      {/* 0714 #5.1：选中父机构时显示汇总口径说明（父机构自身 + 全部子机构） */}
      {childNames.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 12px', padding: '8px 12px', background: 'var(--indigo-soft)', border: '1px solid var(--line)', borderRadius: 10, fontSize: 12.5, color: 'var(--indigo-ink)' }}>
          <Icon id="i-building" w={14} h={14} />
          <span>「{org}」为父机构，以下用量已汇总子机构：{childNames.join('、')}（口径 = 父机构自身 + 全部子机构）</span>
        </div>
      )}

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
            <InfoDot text={metricHelp('平台默认 LLM 自开通至今消耗的输入与输出 token 总数。', 'snapshot')} />
          </div>
          <div className="val">
            {MODEL_USAGE_TOTALS.tokens}<span className="uu">token</span>
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            累计调用次数
            <InfoDot text={metricHelp('平台默认 LLM 自开通至今被请求的总次数。', 'snapshot')} />
          </div>
          <div className="val">
            {MODEL_USAGE_TOTALS.calls}<span className="uu">次</span>
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
            <InfoDot text={metricHelp('平台默认 LLM 在所选机构和区间内消耗的输入与输出 token 总数。', periodKind)} />
          </div>
          <div className="val">
            {d.tokens}<span className="uu">token</span>
          </div>
          {/* 0716 #12：去掉重复的 JSX 箭头图标，仅保留数据串内嵌的方向箭头（↑/↓），避免双箭头；导出复用同一数据串需保留方向。 */}
          <div className="delta up">
            {d.tkDelta}<span className="period-compare">{comparisonPeriodLabel(periodDays)}</span>
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            区间调用次数
            <InfoDot text={metricHelp('平台默认 LLM 在所选机构和区间内被请求的次数。', periodKind)} />
          </div>
          <div className="val">
            {d.callVal}<span className="uu">{d.callUnit}</span>
          </div>
          <div className="delta up">
            {d.callDelta}<span className="period-compare">{comparisonPeriodLabel(periodDays)}</span>
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            平均响应
            <InfoDot text={metricHelp('所选机构和区间内，单次模型调用从请求到首字返回的平均耗时。', periodKind, 'duration')} />
          </div>
          <div className="val">
            {d.resp}<span className="u">s</span>
          </div>
          <div className="delta up">
            {d.respNote}<span className="period-compare">{comparisonPeriodLabel(periodDays)}</span>
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
