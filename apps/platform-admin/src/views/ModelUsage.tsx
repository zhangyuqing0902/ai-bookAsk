import { useState } from 'react';
import { Icon, toast } from '@aba/ui';
import { LineChart, RangePicker, MultiSelect, InfoDot, exportWorkbook, fmtCn, UNIT_NOTE } from '@aba/ui-admin';
import { comparisonPeriodLabel, metricHelp, PLATFORM_ORGS, platformChildrenOf, platformOrgFactorExact, platformOrgRole, RANGE_SCOPE_NOTE } from '@aba/mock';
import { MODEL_USAGE_RANGE, MODEL_USAGE_TOTALS } from '../data/modelUsage';
import { buildModelUsageSpec } from '../exports/modelUsage';
import { applyOrgOverrides, useOrgTree } from '../stores/orgTree';

// 平台后台 · 模型用量（平台默认 LLM）。0610:两段式(实时总览 + 经营分析)。
// 0614:经营分析全部指标 + 总量趋势 + Top 机构排行 按 今日/近7天/30天 真联动；删「当期」硬编码，改按所选时间显示。
// 0614b:token / 调用 统一中文万进制（万/亿），并显单位（token / 次）。
// 0714：mock 数据下移 ../data/modelUsage；#5.1 机构下拉改机构主数据全量（父机构带后缀 + 汇总口径说明行）；
//       导出迁移到 exports/modelUsage.ts spec 纯函数（实时 / 区间 Sheet 分别标注）。

export function ModelUsage() {
  const [rangeLabel, setRangeLabel] = useState('近 7 天');
  const [rangeDays, setRangeDays] = useState(7); // 0813-2：口径说明按真实天数切换（今日 vs 完整自然日）
  const d = MODEL_USAGE_RANGE[rangeLabel] ?? MODEL_USAGE_RANGE['近 7 天'];
  const periodKind = rangeLabel === '今日' ? 'today' as const : 'range' as const;
  const periodDays = rangeLabel === '今日' ? 1 : rangeLabel === '30 天' ? 30 : 7;
  // 0714 #5.1：机构下拉 = 机构主数据全量（应用层级覆盖），父机构带后缀
  const overrides = useOrgTree((s) => s.parentOverrides);
  const orgs = applyOrgOverrides(PLATFORM_ORGS, overrides);
  const orgLabel = (name: string) => {
    const o = orgs.find((x) => x.name === name);
    return o && platformOrgRole(o, orgs) === 'parent' ? `${name}（父机构）` : name;
  };
  // 0814-3：机构筛选由单选改多选，口径与平台主控台完全一致——默认全选＝全平台，多选即累加。
  // 0814-4：升级为层级多选——父机构成组、子机构缩进；勾父＝整组一并勾上，子也可单独勾（父呈半选）。
  //   系数改用 Exact 版按选中集合精确求和：界面已显式勾选子机构，若仍做父→子展开，
  //   「勾父后取消某个子」（＝只看本部 / 本部+部分分社）会被强行加回来，用户表达不出来。
  //   绝对量按所选机构占比缩放，率类（平均响应）不缩放。
  const ALL_ORG_NAMES = orgs.map((o) => o.name);
  const childrenOf = platformChildrenOf(orgs);
  const [selOrgs, setSelOrgs] = useState<string[]>(ALL_ORG_NAMES);
  const allSelected = selOrgs.length === ALL_ORG_NAMES.length;
  const factor = allSelected ? 1 : platformOrgFactorExact(selOrgs, orgs);
  const sc = (v: number) => Math.round(v * factor);
  const scopeText = allSelected ? '全平台' : selOrgs.length <= 3 ? selOrgs.join('、') : `${selOrgs.slice(0, 3).join('、')} 等 ${selOrgs.length} 家`;
  const orgFilterLabel = allSelected ? '全部机构' : selOrgs.join('、');
  // 趋势：全选＝全平台原值；部分选中＝按累加占比缩放（与主控台绝对量口径同法）
  const trend = allSelected ? d.total : d.total.map((v) => Math.max(1, sc(v)));
  // Top 排行：按所选机构过滤（层级模式下选中集合即真实集合），占比相对当前榜首重算；为空时整卡隐藏
  const pickedNames = allSelected ? null : new Set(selOrgs);
  const topRows = (pickedNames ? d.top.filter((t) => pickedNames.has(t.nm)) : d.top);
  const topMax = topRows.length ? Math.max(...topRows.map((t) => t.pv)) : 1;

  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">全域模型用量</div>
        </div>
        <div className="pa">
          {/* 0814-4：与主控台同一个层级 MultiSelect——父机构成组、子机构缩进；勾父＝整组，子可单独勾 */}
          <MultiSelect label="机构" options={ALL_ORG_NAMES.map(orgLabel)} value={selOrgs} onChange={setSelOrgs} childrenOf={childrenOf} style={{ width: 240 }} />
          <button className="btn btn-ghost btn-sm" onClick={() => { void exportWorkbook(buildModelUsageSpec({ org: orgFilterLabel, rangeLabel, factor })); toast('正在导出'); }}>
            <Icon id="i-dl" w={14} h={14} />
            导出
          </button>
        </div>
      </div>

      {/* 实时总览(平台开通至今累计,不随时间筛选变化；0814-3 起随机构多选累加联动) */}
      <div className="dash-section-title">
        实时总览
        <span className="dash-realtime-tag">实时</span>
        <span className="dash-section-sub">· {scopeText} · 平台开通至今的累计用量，不随下方时间筛选变化</span>
      </div>
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
        <div className="kpi">
          <div className="lab">
            累计 tokens
            <InfoDot text={metricHelp('所选机构自开通至今，平台默认 LLM 消耗的输入与输出 token 总数；多选即累加。勾选父机构＝其自身与全部子机构一并选中，也可只勾其中某一家子机构。', 'snapshot')} />
          </div>
          <div className="val">
            {fmtCn(sc(MODEL_USAGE_TOTALS.tokens))}<span className="uu">token</span>
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            累计调用次数
            <InfoDot text={metricHelp('所选机构自开通至今，平台默认 LLM 被请求的总次数；多选即累加。', 'snapshot')} />
          </div>
          <div className="val">
            {fmtCn(sc(MODEL_USAGE_TOTALS.calls))}<span className="uu">次</span>
          </div>
        </div>
      </div>

      {/* 经营分析(随时间区间联动) */}
      <div className="dash-section-head">
        <div className="dash-section-title" style={{ margin: 0 }}>
          经营分析
          {/* 0813-2：区间口径写进副标题——今日为实时，近 N 天为截至昨日的完整自然日 */}
          <span className="dash-section-sub">· {scopeText} · {rangeLabel} · {rangeDays > 1 ? RANGE_SCOPE_NOTE : '今日为 00:00 至当前时刻，对比昨日同时段'}</span>
        </div>
        <RangePicker presets={['今日', '近 7 天', '30 天']} defaultActive={1} onChange={(r) => { setRangeLabel(r.label); setRangeDays(r.days || 7); }} />
      </div>
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="kpi">
          <div className="lab">
            区间 tokens
            <InfoDot text={metricHelp('平台默认 LLM 在所选机构和区间内消耗的输入与输出 token 总数；机构多选即累加。', periodKind)} />
          </div>
          <div className="val">
            {fmtCn(sc(d.tokensRaw))}<span className="uu">token</span>
          </div>
          {/* 0716 #12：去掉重复的 JSX 箭头图标，仅保留数据串内嵌的方向箭头（↑/↓），避免双箭头；导出复用同一数据串需保留方向。 */}
          <div className="delta up">
            {d.tkDelta}<span className="period-compare">{comparisonPeriodLabel(periodDays)}</span>
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            区间调用次数
            <InfoDot text={metricHelp('平台默认 LLM 在所选机构和区间内被请求的次数；机构多选即累加。', periodKind)} />
          </div>
          <div className="val">
            {fmtCn(sc(d.callsRaw))}<span className="uu">次</span>
          </div>
          <div className="delta up">
            {d.callDelta}<span className="period-compare">{comparisonPeriodLabel(periodDays)}</span>
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            平均响应
            <InfoDot text={metricHelp('所选机构和区间内，单次模型调用从请求到首字返回的平均耗时。本项为均值类指标，机构多选时不做累加。', periodKind, 'duration')} />
          </div>
          <div className="val">
            {d.resp}<span className="u">s</span>
          </div>
          <div className="delta up">
            {d.respNote}<span className="period-compare">{comparisonPeriodLabel(periodDays)}</span>
          </div>
        </div>
      </div>
      {/* 0814-3：趋势恒为「所选机构累加」，不再按单选/全选切换两套布局；
          Top 排行按所选机构过滤、占比相对当前榜首重算；榜单为空（所选机构均不在榜）时趋势独占整行 */}
      <div className="grid2" style={{ marginTop: 16, gridTemplateColumns: topRows.length ? '1.4fr 1fr' : '1fr', alignItems: 'start' }}>
        <div className="chart-card" style={{ margin: 0 }}>
          <div className="chart-head">
            <div className="chart-title">{allSelected ? '全平台' : scopeText} 总量趋势 · {rangeLabel}</div>
            <div className="legend"><span><i style={{ background: 'var(--indigo)' }} />总 tokens</span></div>
          </div>
          <LineChart cfg={{ x: d.x, area: true, series: [{ name: '总tokens', color: '#4B57E8', values: trend }] }} />
        </div>
        {topRows.length > 0 && (
          <div className="chart-card" style={{ margin: 0 }}>
            <div className="chart-title" style={{ marginBottom: 12 }}>Top 机构 token 排行 · {rangeLabel}</div>
            <div className="bars">
              {topRows.map((t) => (
                <div className="bar-row" key={t.nm}>
                  <span className="nm">{t.nm}</span>
                  <span className="bar-track"><span className="bar-fill" style={{ width: Math.round((t.pv / topMax) * 100) + '%', background: t.color }} /></span>
                  <span className="pv">{fmtCn(t.pv)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="unit-note">{UNIT_NOTE}</div>
    </>
  );
}
