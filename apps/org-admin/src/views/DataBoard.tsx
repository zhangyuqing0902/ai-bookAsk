import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { LineChart, RangePicker, InfoDot, exportWorkbook, fmtCn, UNIT_NOTE, Calendar, fmtD } from '@aba/ui-admin';
import { comparisonPeriodLabel, metricHelp, RANGE_SCOPE_NOTE, ACTIVE_WINDOW_NOTE } from '@aba/mock';
import { ACTIVE_SNAPSHOT, RANGE, retentionFor, scaleActiveSnapshot, scaleRangeData, TOPKP, type Bar, type KW, type RetentionNode } from '../data/dataBoard';
import { CURRENT_ORG, CHILD_ORGS, orgWeightOf } from '@aba/mock';
import { MultiSelect } from '@aba/ui-admin';
import { useOrgScope } from '../stores/orgScope';
import { buildDataBoardSpec } from '../exports/dataBoard';

// 0614 指标体系重划：去掉「总览」Tab（职责交主控台），数据看板专做分主题深钻。
// 四个主题域：用户分析 / 提问分析 / 营收分析 / 热门 KP（钱归钱、用户归用户、提问归提问、KP 归 KP）。
// 所有非实时指标按 今日 / 7 日 / 30 日 真联动；DAU/WAU/MAU 为页级常驻、不随区间筛选（tooltip 注明）。
// 0814：WAU/MAU 口径改为「截至昨日的完整自然日」，与区间档一致；DAU 保持今日实时。
// 0714：mock 数据下移 data/dataBoard.ts；导出走 spec 纯函数（exports/dataBoard.ts，7 Sheet 全量口径）。
const TABS = ['用户分析', '提问分析', '营收分析', '热门 KP'];

// 榜单数值统一中文万进制（fmtCn，0614b）
const fmtK = (n: number) => fmtCn(Math.round(n));

// 0717 美化：来源分布 SVG 环形图圆周（r=46，viewBox 120×120）
const DONUT_C = 2 * Math.PI * 46;

// deltaPct：较上一周期百分比。传入即按主控台 Delta 同款渲染（方向箭头 + 百分比 + 对比时间窗）；
// 正=上升绿↑、负=下降红↓（down 时箭头 rotate 180°）。未传 deltaPct 才回落到静态「上一周期」占位。
// 0724：infoRaw = 已组好完整句子的说明（固定窗口快照类指标用），跳过 metricHelp 的区间规则拼接
function Kpi({ lab, val, unit, suf, deltaPct, info, periodDays, infoRaw }: { lab: string; val: string; unit?: string; suf?: string; deltaPct?: number; info: string; periodDays?: number; infoRaw?: string }) {
  const infoText = infoRaw ?? (periodDays
    ? metricHelp(info, periodDays === 1 ? 'today' : 'range', info.includes('率') || lab.includes('率') ? 'rate' : 'count')
    : metricHelp(info, 'snapshot'));
  const up = (deltaPct ?? 0) >= 0;
  return (
    <div className="kpi">
      <div className="lab">
        {lab}
        <InfoDot text={infoText} />
      </div>
      <div className="val">
        {unit && <span className="u">{unit}</span>}
        {val}
        {suf && <span className="uu">{suf}</span>}
      </div>
      {deltaPct !== undefined ? (
        <div className={'delta ' + (up ? 'up' : 'down')}>
          <span className="delta-pill">
            <span className="delta-arrow" style={up ? undefined : { display: 'inline-flex', transform: 'rotate(180deg)' }}>
              <Icon id="i-up" w={10} h={10} />
            </span>
            {Math.abs(deltaPct).toFixed(1)}%
          </span>
          <span className="delta-txt">较上一周期</span>
          {periodDays && <span className="period-compare">{comparisonPeriodLabel(periodDays)}</span>}
        </div>
      ) : (
        periodDays && (
          <div className="delta">
            <span className="delta-txt">上一周期</span>
            <span className="period-compare">{comparisonPeriodLabel(periodDays)}</span>
          </div>
        )
      )}
    </div>
  );
}

function Bars({ data }: { data: Bar[] }) {
  return (
    <div className="bars">
      {data.map((d) => (
        <div className="bar-row" key={d.nm}>
          <span className="nm">{d.nm}</span>
          <span className="bar-track">
            <span className="bar-fill" style={{ width: d.pct + '%', background: d.color }} />
          </span>
          <span className="pv">{d.pv}</span>
        </div>
      ))}
    </div>
  );
}

// 0717 二批 #8.1：留存回归一行三张等宽指标卡（卡片式、与平台 KPI/图表卡同风格）。
// 标题行左＝节点名 + 口径问号，右＝状态标（已可统计=玉绿 / 待成熟=中性灰）；
// 卡身留存率大数字；底部单行灰字「样本 N 人 · 统计至 {日期}注册用户」。
// 待成熟不显示 0%/空进度条，改中性灰「尚未到统计时间」+ 预计可统计日期，避免误读为留存 0%。
function RetentionCard({ n }: { n: RetentionNode }) {
  const mature = n.status === '可统计' && !!n.rate;
  const formula = `第 ${n.days} 天留存率 = 该注册时间的用户中、注册后第 ${n.days} 天仍发生登录或提问的用户数 ÷ 该批用户总数。去重：分子分母均按用户 ID 去重（同批注册用户）。按注册时间统计，不受「区间分析」时间筛选影响。`;
  return (
    <div className={'chart-card ret-card' + (mature ? '' : ' ret-pending')} style={{ margin: 0 }}>
      <div className="ret-head">
        <span className="chart-title" style={{ display: 'inline-flex', alignItems: 'center', margin: 0 }}>
          {n.label}
          <InfoDot text={formula} />
        </span>
        {mature ? (
          <span className="tag-s tag-jade">已可统计</span>
        ) : (
          <span className="tag-s" style={{ background: 'var(--line)', color: 'var(--ink-3)' }}>待成熟</span>
        )}
      </div>
      {mature ? (
        <>
          <div className="ret-rate mono">{n.rate}</div>
          {/* 0717 美化：留存率下加一条同比例渐变细条,扫一眼即知高低 */}
          <div className="ret-track"><span style={{ width: n.rate ?? '0%' }} /></div>
          {/* 0718：截止文案白话化（数据层生成），不再套「样本 N 人 · 统计至 …」模板 */}
          <div className="ret-meta">{n.cutoff}</div>
        </>
      ) : (
        <>
          <div className="ret-rate-muted">尚未到统计时间</div>
          <div className="ret-meta">{n.cutoff}</div>
        </>
      )}
    </div>
  );
}

function CardTitle({ t, info, periodDays }: { t: string; info: string; periodDays?: number }) {
  return (
    <div className="chart-title" style={{ marginBottom: 14, display: 'inline-flex', alignItems: 'center' }}>
      {t}
      <InfoDot text={periodDays ? metricHelp(info, periodDays === 1 ? 'today' : 'range') : info} />
    </div>
  );
}

// 词云：字号/色深随频次（s:1~5）；0614 hover 显示当前所选区间下该词的提问数量
function KwCloud({ data, mult }: { data: KW[]; mult: number }) {
  return (
    <div className="kw-cloud">
      {data.map((k) => (
        <span key={k.w} className={'kw kw-' + k.s} data-c={(k.s * mult).toLocaleString('en-US') + ' 次'}>
          {k.w}
        </span>
      ))}
    </div>
  );
}

// 机构后台 · 数据看板（4 主题 Tab；非实时指标随时间区间联动）
export function DataBoard() {
  const nav = useNavigate();
  // 0718 #3：Tab 支持 ?tab=N 直达（便于演示与验收）
  const [tab, setTab] = useState(() => {
    const t = Number(new URLSearchParams(window.location.search).get('tab'));
    return t >= 0 && t < TABS.length ? t : 0;
  });
  // 0813-2：区间 state 由单一 label 改为完整载荷。
  //   旧写法只存 r.label，选「自定义」会拿到 "2026-06-01 至 2026-06-07" 这种字符串，
  //   落不到 RANGE 字典上 → 静默回落成 7 日数据与 7 日环比口径，用户完全无感（真 bug）。
  //   现按真实 days 就近取档并显式标注实际落用的档位。
  const [range, setRange] = useState<{ label: string; days: number; custom: boolean }>({ label: '7 日', days: 7, custom: false });
  const rangeLabel = range.label;
  // 0716 #15：留存按「注册时间」筛选（口径即注册日），与区间分析是两套口径：切区间不动留存，切注册时间只动留存段
  const [retentionBatch, setRetentionBatch] = useState('最新可统计');
  // 0716 #15：自定义注册时间——具体某一天（单日日期面板）
  const [retDay, setRetDay] = useState<Date | null>(null);
  const [retCalOpen, setRetCalOpen] = useState(false);
  // 0806：父机构视角——机构多选（默认全选＝现状数值）；绝对量按集合系数缩放、率类不缩放
  const orgType = useOrgScope((s) => s.orgType);
  const isParent = orgType === 'parent';
  const ALL_ORGS = [CURRENT_ORG, ...CHILD_ORGS];
  const [orgs, setOrgs] = useState<string[]>(ALL_ORGS);
  const w = isParent ? orgWeightOf(orgs) : 1;
  const active = scaleActiveSnapshot(w);
  // 0813-2：按真实天数就近取档（原型只有三张 mock 表，自定义区间落到最接近的一档，并在界面标明）
  const bucketLabel = range.days <= 1 ? '今日' : range.days <= 7 ? '7 日' : '30 日';
  const d = scaleRangeData(RANGE[bucketLabel], w);
  // 0718 #6：留存按真实日期联动推算——自定义注册日驱动节点状态/样本/截止文案，不再是写死的假数据
  const retention = retentionFor(retentionBatch, retDay);
  // 环比对比窗按真实天数算（自定义 3 天就对比前 3 天，不再固定按 7 天）
  const periodDays = range.days;
  // 0718 #5：留存筛选改「区间分析」同款分段控件；0724：批次精简为 最新可统计 + 自定义（删近 7 / 近 30 个注册日）
  const RETENTION_PRESETS = ['最新可统计'];
  const retLabel = retentionBatch === '自定义日期' && retDay ? fmtD(retDay) : retentionBatch;
  const pickRetDay = (day: Date) => { setRetDay(day); setRetentionBatch('自定义日期'); setRetCalOpen(false); };
  const resetRetDay = () => { setRetDay(null); setRetentionBatch('最新可统计'); setRetCalOpen(false); };

  // 0718 #3：Tab 切换防跳动——内容区记住历史最大高度，切回较矮 Tab 不再整体回缩
  const tabBodyRef = useRef<HTMLDivElement>(null);
  const [tabMinH, setTabMinH] = useState(0);
  useEffect(() => {
    const h = tabBodyRef.current?.offsetHeight ?? 0;
    if (h > tabMinH) setTabMinH(h);
  }, [tab, rangeLabel, tabMinH]);

  return (
    <div className="dboard">
      <div className="page-head">
        <div>
          <div className="pt">数据看板</div>
        </div>
        <div className="pa">
          {/* 0716 #14：区间选择器从页头移入「区间分析」区块就近（见下方 range-bar），页头只留导出 */}
          {/* 0806-2：父机构视角——「机构」多选筛选置页头导出左边（与主控台同位），联动页内全部指标 */}
          {isParent && <MultiSelect label="机构" options={[`${CURRENT_ORG}（父机构）`, ...CHILD_ORGS]} value={orgs} onChange={setOrgs} style={{ width: 240 }} />}
          {/* 0724：活跃概览改固定滚动窗口快照（ACTIVE_SNAPSHOT），不随区间联动，导出同源 */}
          <button className="btn btn-ghost btn-sm" onClick={() => { void exportWorkbook(buildDataBoardSpec({ rangeLabel, periodDays, d, retentionRange: retLabel, retention, active: { dau: active.dau, wau: active.wau, mau: active.mau }, topkp: TOPKP, orgs: isParent ? orgs : undefined })); toast('正在导出'); }}>
            <Icon id="i-dl" w={14} h={14} />
            导出
          </button>
        </div>
      </div>
      {/* 0724：活跃概览挪出「区间分析」——固定滚动窗口快照与留存同为页级常驻（两个非区间口径连在一起）。
          原因：WAU/MAU 定义自带固定窗口，与任意区间绑定无法自洽（选 30 天时「对应的 7 日窗口」没有唯一答案）。 */}
      <div className="dash-section-title" style={{ marginTop: 4, marginBottom: 10 }}>
        活跃概览
        <span className="dash-section-sub">· 日活实时 · 周活 / 月活按完整自然日（不含今日）· 不随下方时间筛选联动</span>
      </div>
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        {/* 0814：周活 / 月活由「含今日的滚动窗口」改为「截至昨日的完整自然日」，与区间档同口径。
            理由与 0813-2 改区间档一致——今天没过完，上午看和下午看不是一个数，截图对不上账。
            日活保持含今日（唯一实时口径）。周活与「近 7 天活跃用户」自此数值重合，是口径统一的必然结果。 */}
        <Kpi lab="日活（DAU）" val={active.dau} suf="人" deltaPct={active.dauDelta} periodDays={1} info="" infoRaw={`今日 00:00 至当前时刻的活跃用户，实时统计。去重：单日内按用户 ID 去重。环比对比昨日同已过时长。${ACTIVE_WINDOW_NOTE.dau}`} />
        <Kpi lab="周活（WAU）" val={active.wau} suf="人" deltaPct={active.wauDelta} periodDays={7} info="" infoRaw={`截至昨日 24:00 的 7 个完整自然日内的活跃用户（不含今日）。去重：窗口内按用户 ID 去重，跨天重复只计 1 人。环比对比紧邻此前的 7 个完整自然日。${ACTIVE_WINDOW_NOTE.wau}`} />
        <Kpi lab="月活（MAU）" val={active.mau} suf="人" deltaPct={active.mauDelta} periodDays={30} info="" infoRaw={`截至昨日 24:00 的 30 个完整自然日内的活跃用户（不含今日）。去重：窗口内按用户 ID 去重，跨天重复只计 1 人。环比对比紧邻此前的 30 个完整自然日。${ACTIVE_WINDOW_NOTE.mau}`} />
      </div>

      {/* 0717 二批 #8.1：用户留存页级常驻,一行三张等宽指标卡（按注册时间,独立于下方区间筛选） */}
      <div className="dash-section-head" style={{ marginTop: 22 }}>
        <div className="dash-section-title" style={{ margin: 0, display: 'inline-flex', alignItems: 'center' }}>
          用户留存
          <InfoDot text="留存按用户的注册时间统计——比如今天注册的用户，要等满 30 天才会有 30 日留存。因此它的时间口径独立于下方区间筛选，两者互不影响。「自定义日期」为某一个具体的注册日。观察注册用户在第 1 / 7 / 30 天是否仍然活跃。" />
          <span className="tag-s tag-indigo" style={{ marginLeft: 4 }}>按注册时间</span>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, position: 'relative' }}>
          {/* 0718 #5：留存筛选改「区间分析」同款灰底分段控件（原白色下拉视觉突兀）；
              自定义选定注册日后以 dr-applied chip 回显日期（0718 #2：chip 移到控件左侧，与 RangePicker 自定义回显位置一致），✕ 回到「最新可统计」 */}
          {retentionBatch === '自定义日期' && retDay && (
            <span className="dr-applied">
              {fmtD(retDay)}
              <i title="重选注册日" onClick={resetRetDay}>
                ✕
              </i>
            </span>
          )}
          <div className="seg seg-range">
            {RETENTION_PRESETS.map((b) => (
              <b key={b} className={retentionBatch === b ? 'on' : undefined} onClick={() => { setRetentionBatch(b); setRetDay(null); setRetCalOpen(false); }}>
                {b}
              </b>
            ))}
            <b className={retCalOpen || (retentionBatch === '自定义日期' && retDay) ? 'on' : undefined} onClick={() => setRetCalOpen((o) => !o)}>
              自定义
            </b>
          </div>
          {/* 0716 二批 #11：单日日历面板——视觉复用区间选择器的 calpop 样式，仅选具体某一天 */}
          {retCalOpen && (
            <div className="dr-pop calpop show" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 40 }}>
              <Calendar start={retDay} end={null} onPick={pickRetDay} />
              <div className="cal-f">
                <span className="cal-range">{retDay ? fmtD(retDay) : '选择注册日 · 具体某一天'}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setRetCalOpen(false)}>关闭</button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* 0717 二批 #8.3：留存段更新时间脚注已删除,不再显示 */}
      <div className="grid2" style={{ marginTop: 4, gridTemplateColumns: '1fr 1fr 1fr' }}>
        {retention.nodes.map((n) => (
          <RetentionCard key={n.days} n={n} />
        ))}
      </div>

      {/* 区间选择器条（0717 二批 #6/#8.4：撤销吸顶,回归轻量样式——左标题右筛选,无底框） */}
      <div className="board-rangebar">
        <div className="dash-section-title" style={{ margin: 0 }}>
          区间分析
          {/* 0813-2：区间口径写进区块副标题（只写一遍，不逐个 label 加长）；自定义时显式说明落到了哪一档 */}
          <span className="dash-section-sub">
            · {rangeLabel} · 下方各主题 Tab 指标随右侧时间筛选联动 · {range.days > 1 ? RANGE_SCOPE_NOTE : '今日为 00:00 至当前时刻'}
            {range.custom && <>（自定义 {range.days} 天，演示数据按「{bucketLabel}」档展示，环比按 {range.days} 天算）</>}
          </span>
        </div>
        <RangePicker presets={['今日', '7 日', '30 日']} defaultActive={1} onChange={(r) => setRange({ label: r.label, days: r.days || 7, custom: !['今日', '7 日', '30 日'].includes(r.label) })} />
      </div>

      {/* 四个主题 Tab */}
      <div className="tabbar">
        {TABS.map((t, i) => (
          <div key={t} className={'tab' + (tab === i ? ' on' : '')} onClick={() => setTab(i)}>
            {t}
          </div>
        ))}
      </div>

      {/* 0718 #3：Tab 内容区统一容器——min-height 取历史最大实测高度，切 Tab 不再上下跳动 */}
      <div ref={tabBodyRef} style={tabMinH ? { minHeight: tabMinH } : undefined}>
      {/* Tab 1 · 用户分析 —— 0724：活跃概览已挪至页首（快照口径），Tab 内两行布局：
          ① 新增用户(值+环比+迷你折线)+来源分布 ② 地区+性别 */}
      {tab === 0 && (
        <>
          <div className="grid2" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="chart-card" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
              <CardTitle t="新增用户" info="所选区间内首次注册的用户数。去重：按用户 ID 去重。" periodDays={periodDays} />
              {/* 0717 二批 #8.4：左=大数字+环比+对比窗口,右=随区间联动的迷你趋势折线 */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 18 }}>
                <div style={{ flex: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 34, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.1 }}>
                    {d.newUsers}
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-3)', marginLeft: 6 }}>人</span>
                  </div>
                  <div className={'delta ' + ((d.newUsersDelta ?? 0) >= 0 ? 'up' : 'down')}>
                    <span className="delta-pill">
                      <span className="delta-arrow" style={(d.newUsersDelta ?? 0) >= 0 ? undefined : { display: 'inline-flex', transform: 'rotate(180deg)' }}>
                        <Icon id="i-up" w={10} h={10} />
                      </span>
                      {Math.abs(d.newUsersDelta ?? 0).toFixed(1)}%
                    </span>
                    <span className="delta-txt">较上一周期</span>
                    <span className="period-compare">{comparisonPeriodLabel(periodDays)}</span>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <LineChart cfg={{ x: d.newTrend.x, area: true, series: [{ name: '新增用户', color: '#4B57E8', values: d.newTrend.v }] }} />
                </div>
              </div>
            </div>
            <div className="chart-card" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
              <CardTitle t="来源分布" info="C 端用户进入渠道占比：扫码进入＝链接带 KP 二维码参数，直接访问＝直链或无码进入。图例含人数；占比环比为百分点变化。" periodDays={periodDays} />
              <div className="donut-wrap" style={{ flex: 1 }}>
                {/* 0717 美化：SVG 圆头分段环形图（替代 conic-gradient 直角拼接），中心直接显示主渠道占比 */}
                <div className="db-donut">
                  <svg viewBox="0 0 120 120">
                    <defs>
                      <linearGradient id="db-donut-grad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#3D6FF5" />
                        <stop offset="1" stopColor="#8B6CF6" />
                      </linearGradient>
                    </defs>
                    <circle cx="60" cy="60" r="46" fill="none" stroke="#EEF0F6" strokeWidth="15" />
                    <circle cx="60" cy="60" r="46" fill="none" stroke="var(--amber)" strokeWidth="15" strokeDasharray={`${DONUT_C} ${DONUT_C}`} transform="rotate(-90 60 60)" />
                    <circle cx="60" cy="60" r="46" fill="none" stroke="url(#db-donut-grad)" strokeWidth="15" strokeLinecap="round" strokeDasharray={`${(d.saoma / 100) * DONUT_C} ${DONUT_C}`} transform="rotate(-90 60 60)" />
                  </svg>
                  <div className="db-donut-c">
                    <b>{d.saoma}%</b>
                    <span>扫码进入</span>
                  </div>
                </div>
                <div className="db-src-legend">
                  <div className="db-src-row">
                    <i style={{ background: 'linear-gradient(120deg,#3D6FF5,#8B6CF6)' }} />
                    <span className="nm">扫码进入</span>
                    <b>{d.saoma}%</b>
                    <span className="cnt">{d.saomaCnt} 人</span>
                  </div>
                  <div className="db-src-row">
                    <i style={{ background: 'var(--amber)' }} />
                    <span className="nm">直接访问</span>
                    <b>{100 - d.saoma}%</b>
                    <span className="cnt">{d.directCnt} 人</span>
                  </div>
                  {/* 0717 二批 #7：同期对比(占比环比,百分点)；0718 #4：文案与其他指标统一——去「pp」字样与「扫码占比」前缀 */}
                  <div className={'delta ' + (d.saomaDelta >= 0 ? 'up' : 'down')} style={{ marginTop: 2 }}>
                    <span className="delta-pill">
                      <span className="delta-arrow" style={d.saomaDelta >= 0 ? undefined : { display: 'inline-flex', transform: 'rotate(180deg)' }}>
                        <Icon id="i-up" w={10} h={10} />
                      </span>
                      {Math.abs(d.saomaDelta).toFixed(1)}%
                    </span>
                    <span className="delta-txt">较上一周期</span>
                    <span className="period-compare">{comparisonPeriodLabel(periodDays)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid2" style={{ marginTop: 16, gridTemplateColumns: '1fr 1fr' }}>
            <div className="chart-card" style={{ margin: 0 }}>
              <CardTitle t="地区分布" info="C 端用户按地区（省 / 市）分组占比（微信授权带回，未授权归为「未知」）。" periodDays={periodDays} />
              <Bars data={d.region} />
            </div>
            <div className="chart-card" style={{ margin: 0 }}>
              <CardTitle t="性别分布" info="C 端用户按性别分组占比（微信授权带回，未授权归为「未知」）。" periodDays={periodDays} />
              <Bars data={d.gender} />
            </div>
          </div>
        </>
      )}

      {/* —— Tab 2 · 提问分析（提问域）—— */}
      {tab === 1 && (
        <>
          <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
            <Kpi lab="总提问" val={d.totalAsk} suf="条" deltaPct={d.totalAskDelta} info="所选区间内 C 端提问条数（含追问）。去重：按条累计，不去重。" periodDays={periodDays} />
            <Kpi lab="人均提问" val={d.perUser} suf="条/人" deltaPct={d.perUserDelta} info="所选区间总提问 ÷ 同区间活跃用户数。去重：分母活跃用户按用户 ID 去重（跨天只计 1 人）。" periodDays={periodDays} />
            <Kpi lab="平均会话轮次" val={d.rounds} suf="轮" deltaPct={d.roundsDelta} info="所选区间总提问 ÷ 总会话数，衡量对话深度。" periodDays={periodDays} />
            <Kpi lab="答案点赞率" val={d.likeRate} deltaPct={d.likeRateDelta} info="所选区间点赞答案数 ÷ 已完成答案数；明细见答案反馈。" periodDays={periodDays} />
            <Kpi lab="答案反馈率" val={d.fbRate} deltaPct={d.fbRateDelta} info="所选区间收到用户反馈（点踩 / 举报 / 建议）的答案数 ÷ 已完成答案数；明细见答案反馈工作台。" periodDays={periodDays} />
          </div>
          <div className="chart-card">
            <div className="chart-head">
              <CardTitle t={`提问量趋势 · ${rangeLabel}`} info="C 端提问条数（含追问）的时间趋势。" periodDays={periodDays} />
              <div className="legend">
                <span>
                  <i style={{ background: 'var(--indigo)' }} />
                  提问量
                </span>
              </div>
            </div>
            <LineChart cfg={{ x: d.askTrend.x, area: true, series: [{ name: '提问量', color: '#4B57E8', values: d.askTrend.v }] }} />
          </div>
          {/* 按 Agent / 提问领域 左右并列 */}
          <div className="grid2" style={{ marginTop: 16 }}>
            <div className="chart-card" style={{ margin: 0 }}>
              <CardTitle t="按 Agent 提问分布" info="各 Agent 承接提问量占比，反映路由与配置质量。" periodDays={periodDays} />
              <Bars data={d.agent} />
            </div>
            <div className="chart-card" style={{ margin: 0 }}>
              <CardTitle t="提问领域分布" info="按 KP / 领域聚合的提问占比，识别用户最关心的领域。" periodDays={periodDays} />
              <Bars data={d.domain} />
            </div>
          </div>
          {/* 提问关键词云：hover 显示当前区间该词提问数量 */}
          <div className="chart-card">
            <CardTitle t="提问关键词云" info="提问文本高频关键词，字号与色深随出现频次变化；悬浮显示当前区间提问量。" periodDays={periodDays} />
            <KwCloud data={d.keywords} mult={d.kwMult} />
          </div>
        </>
      )}

      {/* —— Tab 3 · 营收分析（钱域 · 三小节）—— */}
      {tab === 2 && (
        <>
          {/* 小节① 收入与转化（全部随区间联动） */}
          <div className="dash-section-title">
            收入与转化
            <span className="dash-section-sub">· {rangeLabel}</span>
          </div>
          {/* 0722：补「回流会员」，行改 3 列两行避免 6 卡挤一行 */}
          <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
            <Kpi lab="区间 GMV" val={d.gmv} deltaPct={d.gmvDelta} info="所选区间内已支付订单金额合计（会员 + 永享）；待支付、已失效订单不计入。" periodDays={periodDays} />
            <Kpi lab="付费用户" val={d.payUsers} suf="人" deltaPct={d.payUsersDelta} info="所选区间内产生有效支付（已支付且金额 > 0）的用户数。去重：按用户 ID 去重，跨天重复只计 1 人。" periodDays={periodDays} />
            <Kpi lab="付费转化率" val={d.payRate} deltaPct={d.payRateDelta} info="区间付费用户 ÷ 区间活跃用户。去重：分子分母均按用户 ID 去重。" periodDays={periodDays} />
            <Kpi lab="ARPPU（每付费用户均收入）" val={d.arppu} deltaPct={d.arppuDelta} info="区间支付收入 ÷ 区间付费用户数。" periodDays={periodDays} />
            <Kpi lab="续费率" val={d.renew} deltaPct={d.renewDelta} info="所选区间内到期且完成续费的会员数 ÷ 同区间到期会员数。去重：分子分母均按会员（用户 ID）去重。" periodDays={periodDays} />
            <Kpi lab="回流会员" val={d.reflow} suf="人" deltaPct={d.reflowDelta} info="所选区间内开通会员、且开通时会员状态为已过期的用户数；不计入新增会员与续费率。去重：按用户 ID 去重。" periodDays={periodDays} />
          </div>
          {/* 小节② 退款 */}
          <div className="dash-section-title" style={{ marginTop: 22 }}>
            退款
            <span className="dash-section-sub">· {rangeLabel}</span>
          </div>
          <div className="kpi-row">
            <Kpi lab="退款金额" val={d.refundAmt} deltaPct={d.refundAmtDelta} info="所选区间内成功退款金额合计。" periodDays={periodDays} />
            <Kpi lab="退款率" val={d.refundRate} deltaPct={d.refundRateDelta} info="所选区间退款金额 ÷ 同区间 GMV。" periodDays={periodDays} />
            <Kpi lab="退款订单数" val={d.refundOrders} suf="单" deltaPct={d.refundOrdersDelta} info="所选区间内发生成功退款（含部分退款）的订单数。去重：按订单去重。" periodDays={periodDays} />
            <Kpi lab="净 GMV（扣退款）" val={d.netGmv} deltaPct={d.netGmvDelta} info="所选区间 GMV − 同区间成功退款金额。" periodDays={periodDays} />
          </div>
          {/* 小节③ 转化漏斗（0614：受限触发率为漏斗入口，与会员漏斗 / 永享转化同排，避免单指标孤行；
              作为该行首张卡片，其 InfoDot 默认向右展开，不再被左侧栏遮盖） */}
          <div className="dash-section-title" style={{ marginTop: 22 }}>
            转化漏斗
            <span className="dash-section-sub">· {rangeLabel}</span>
          </div>
          <div className="grid2" style={{ marginTop: 16, gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="chart-card" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
              <CardTitle t="受限内容触发率" info="触发付费墙次数 ÷ 总提问数，是会员 / 永享转化的漏斗入口。" periodDays={periodDays} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 7, paddingBottom: 4 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 32, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.1 }}>{d.limit}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.6 }}>触发付费墙 / 总提问 · 会员 · 永享转化的入口</div>
              </div>
            </div>
            <div className="chart-card" style={{ margin: 0 }}>
              <CardTitle t="会员漏斗" info="看到会员页 → 点击购买 → 完成支付的转化漏斗。" periodDays={periodDays} />
              <Bars data={d.memberFunnel} />
            </div>
            <div className="chart-card" style={{ margin: 0 }}>
              <CardTitle t="永享转化" info="触发永享墙 → 完成购买的转化。" periodDays={periodDays} />
              <Bars data={d.yxFunnel} />
            </div>
          </div>
        </>
      )}

      {/* —— Tab 4 · 热门 KP（KP 域，榜单随区间联动）—— */}
      {tab === 3 && (
        <div className="grid2" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
          {TOPKP.map((c) => (
            <div className="chart-card" style={{ margin: 0 }} key={c.t}>
              <CardTitle t={c.t} info={c.info} periodDays={periodDays} />
              {c.rows.map((r, i) => (
                <div key={i} className="rank-row" onClick={() => nav('/kps/' + r[2])} title={'查看「' + r[0] + '」详情'}>
                  <span className={'rank-no' + (i < 3 ? ' m' + (i + 1) : '')}>{i + 1}</span>
                  <span className="rank-nm">{r[0]}</span>
                  <span className="rank-pv">{c.pre + fmtK(r[1] * d.kpFactor) + c.suf}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      </div>
      <div className="unit-note">{UNIT_NOTE}</div>
    </div>
  );
}
