import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { LineChart, RangePicker, Dropdown, InfoDot, exportWorkbook, fmtCn, UNIT_NOTE, Calendar, fmtD } from '@aba/ui-admin';
import { comparisonPeriodLabel, metricHelp } from '@aba/mock';
import { RANGE, RETENTION, TOPKP, ACTIVE_SNAPSHOT, type Bar, type KW, type RetentionNode } from '../data/dataBoard';
import { buildDataBoardSpec } from '../exports/dataBoard';

// 0614 指标体系重划：去掉「总览」Tab（职责交主控台），数据看板专做分主题深钻。
// 四个主题域：用户分析 / 提问分析 / 营收分析 / 热门 KP（钱归钱、用户归用户、提问归提问、KP 归 KP）。
// 所有非实时指标按 今日 / 7 日 / 30 日 真联动；DAU/WAU/MAU 为固定窗口快照（tooltip 注明）。
// 0714：mock 数据下移 data/dataBoard.ts；导出走 spec 纯函数（exports/dataBoard.ts，7 Sheet 全量口径）。
const TABS = ['用户分析', '提问分析', '营收分析', '热门 KP'];

// 榜单数值统一中文万进制（fmtCn，0614b）
const fmtK = (n: number) => fmtCn(Math.round(n));

// deltaPct：较上一周期百分比。传入即按主控台 Delta 同款渲染（方向箭头 + 百分比 + 对比时间窗）；
// 正=上升绿↑、负=下降红↓（down 时箭头 rotate 180°）。未传 deltaPct 才回落到静态「上一周期」占位。
function Kpi({ lab, val, unit, suf, deltaPct, info, periodDays }: { lab: string; val: string; unit?: string; suf?: string; deltaPct?: number; info: string; periodDays?: number }) {
  const infoText = periodDays
    ? metricHelp(info, periodDays === 1 ? 'today' : 'range', info.includes('率') || lab.includes('率') ? 'rate' : 'count')
    : metricHelp(info, 'snapshot');
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
          <span style={up ? undefined : { display: 'inline-flex', transform: 'rotate(180deg)' }}>
            <Icon id="i-up" w={11} h={11} />
          </span>
          {Math.abs(deltaPct).toFixed(1)}% 较上一周期{periodDays && <span className="period-compare">{comparisonPeriodLabel(periodDays)}</span>}
        </div>
      ) : (
        periodDays && <div className="delta">上一周期 <span className="period-compare">{comparisonPeriodLabel(periodDays)}</span></div>
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

// 留存指标卡：一节点一卡（D+1 / D+7 / D+30），等宽排列。
// 可统计 → 留存率大数字 + 样本 + 注册截止日 + 绿色「已可统计」；
// 待成熟 → 不显示 0%/空进度条，改中性灰状态文案（尚未到统计时间 + 预计可统计日期），
//         状态用文字表达、中性灰、不用红色，避免误读为留存 0%。
// 关键口径常驻卡面，问号 InfoDot 仅补充完整公式。
function RetentionCard({ n }: { n: RetentionNode }) {
  const mature = n.status === '可统计' && !!n.rate;
  const formula = `第 ${n.days} 天留存率 = 该注册时间的用户中、注册后第 ${n.days} 天仍发生登录或提问的用户数 ÷ 该批用户总数。按注册时间统计，不受「区间分析」时间筛选影响。`;
  return (
    <div className="chart-card" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
      <div className="chart-title" style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 14 }}>
        {n.label}
        <InfoDot text={formula} />
      </div>
      {mature ? (
        <>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 32, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.1 }}>{n.rate}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 10, lineHeight: 1.7, flex: 1 }}>
            样本 {n.sample} 人
            <br />
            {n.cutoff}
          </div>
          <div style={{ marginTop: 10 }}>
            <span className="tag-s tag-jade">已可统计</span>
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-3)', lineHeight: 1.3 }}>尚未到统计时间</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 10, lineHeight: 1.7, flex: 1 }}>
            该批用户最早于 {n.readyDate} 产生 {n.days} 日留存
            <br />
            {n.cutoff}
          </div>
          <div style={{ marginTop: 10 }}>
            <span className="tag-s" style={{ background: 'var(--line)', color: 'var(--ink-3)' }}>待成熟</span>
          </div>
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
  const [tab, setTab] = useState(0);
  const [rangeLabel, setRangeLabel] = useState('7 日');
  // 0716 #15：留存按「注册时间」筛选（口径即注册日），与区间分析是两套口径：切区间不动留存，切注册时间只动留存段
  const [retentionBatch, setRetentionBatch] = useState('最新可统计');
  // 0716 #15：自定义注册时间——具体某一天（单日日期面板）
  const [retDay, setRetDay] = useState<Date | null>(null);
  const [retCalOpen, setRetCalOpen] = useState(false);
  const d = RANGE[rangeLabel] ?? RANGE['7 日'];
  const retention = RETENTION[retentionBatch] ?? RETENTION['最新可统计'];
  const periodDays = rangeLabel === '今日' ? 1 : rangeLabel === '30 日' ? 30 : 7;
  const RETENTION_BATCHES = ['最新可统计', '近 7 个注册日', '近 30 个注册日', '自定义日期'];
  const retLabel = retentionBatch === '自定义日期' && retDay ? fmtD(retDay) : retentionBatch;
  const onRetSelect = (v: string) => {
    if (v === '自定义日期') { setRetCalOpen(true); }
    else { setRetentionBatch(v); setRetDay(null); setRetCalOpen(false); }
  };
  const pickRetDay = (day: Date) => { setRetDay(day); setRetentionBatch('自定义日期'); setRetCalOpen(false); };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">数据看板</div>
        </div>
        <div className="pa">
          {/* 0716 #14：区间选择器从页头移入「区间分析」区块就近（见下方 range-bar），页头只留导出 */}
          <button className="btn btn-ghost btn-sm" onClick={() => { void exportWorkbook(buildDataBoardSpec({ rangeLabel, periodDays, d, retentionRange: retLabel, retention, active: ACTIVE_SNAPSHOT, topkp: TOPKP })); toast('正在导出'); }}>
            <Icon id="i-dl" w={14} h={14} />
            导出
          </button>
        </div>
      </div>
      {/* 0716 二批 #12：布局重构——① 实时活跃概览 ② 用户留存 为页级常驻两行（不再归属用户分析 Tab）；
          ③ 统一区间选择器条位于四个主题 Tab 之上；④ 四个主题 Tab 全部内容随区间联动。 */}
      <div className="dash-section-title" style={{ marginTop: 4 }}>
        实时活跃概览
        <span className="dash-realtime-tag">实时</span>
        <span className="dash-section-sub">· 固定窗口去重活跃用户，不随下方时间筛选变化</span>
      </div>
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <Kpi lab="DAU（日活跃用户）" val={ACTIVE_SNAPSHOT.dau} suf="人" info="当日去重活跃用户。固定窗口快照：自然日 0:00 至当前，不随时间区间变化。" />
        <Kpi lab="WAU（周活跃用户）" val={ACTIVE_SNAPSHOT.wau} suf="人" info="近 7 个自然日去重活跃用户。固定窗口快照（近 7 天滚动），不随时间区间变化。" />
        <Kpi lab="MAU（月活跃用户）" val={ACTIVE_SNAPSHOT.mau} suf="人" info="近 30 个自然日去重活跃用户。固定窗口快照（近 30 天滚动），不随时间区间变化。" />
      </div>

      {/* 用户留存：按注册时间（口径即注册日），页级常驻；0716 二批 #11 口径问号紧跟标题 */}
      <div className="dash-section-head" style={{ marginTop: 22 }}>
        <div className="dash-section-title" style={{ margin: 0, display: 'inline-flex', alignItems: 'center' }}>
          用户留存
          <InfoDot text="留存按用户的注册时间统计——比如今天注册的用户，要等满 30 天才会有 30 日留存。因此它的时间口径独立于下方区间筛选，两者互不影响。「自定义日期」为某一个具体的注册日。" />
          <span className="tag-s tag-indigo" style={{ marginLeft: 4 }}>按注册时间</span>
          <span className="dash-section-sub" style={{ marginLeft: 8 }}>· 观察注册用户在第 1 / 7 / 30 天是否仍然活跃，不受下方区间筛选影响</span>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, position: 'relative' }}>
          <Dropdown label={`注册时间：${retLabel}`} options={RETENTION_BATCHES} onSelect={onRetSelect} style={{ minWidth: 200 }} />
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
      <div className="grid2" style={{ marginTop: 4, gridTemplateColumns: '1fr 1fr 1fr' }}>
        {retention.nodes.map((n) => (
          <RetentionCard key={n.days} n={n} />
        ))}
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 12, lineHeight: 1.7 }}>
        数据更新至 {retention.updatedAt} · 活跃口径：注册后第 N 天发生登录或提问行为
      </div>

      {/* ③ 统一区间选择器条：驱动下方全部主题 Tab 的区间指标 */}
      <div className="board-rangebar">
        <div className="dash-section-title" style={{ margin: 0 }}>
          区间分析
          <span className="dash-section-sub">· {rangeLabel} · 下方各主题 Tab 指标随右侧时间筛选联动</span>
        </div>
        <RangePicker presets={['今日', '7 日', '30 日']} defaultActive={1} onChange={(r) => setRangeLabel(r.label)} />
      </div>

      {/* ④ 四个主题 Tab */}
      <div className="tabbar">
        {TABS.map((t, i) => (
          <div key={t} className={'tab' + (tab === i ? ' on' : '')} onClick={() => setTab(i)}>
            {t}
          </div>
        ))}
      </div>

      {/* Tab 1 · 用户分析 —— 区间部分（新增用户 + 来源/地区/性别分布） */}
      {tab === 0 && (
        <>
          <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
            <Kpi lab="新增用户" val={d.newUsers} suf="人" deltaPct={d.newUsersDelta} periodDays={periodDays} info="所选区间内首次注册的用户数，按用户 ID 精确去重。" />
          </div>
          {/* 分布三图随顶部时间筛选联动 */}
          <div className="grid2" style={{ marginTop: 16, gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="chart-card" style={{ margin: 0 }}>
              <CardTitle t="来源分布" info="C 端用户进入渠道占比(扫码进入 / 直接访问)。" periodDays={periodDays} />
              <div className="donut-wrap">
                <div style={{ width: 96, height: 96, borderRadius: '50%', flex: 'none', background: `conic-gradient(var(--indigo) 0 ${d.saoma}%,var(--amber) ${d.saoma}% 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 500 }}>100%</div>
                </div>
                <div style={{ fontSize: 13, lineHeight: 2.1 }}>
                  <div>
                    <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 3, background: 'var(--indigo)', marginRight: 8 }} />
                    扫码进入 · {d.saoma}%
                  </div>
                  <div>
                    <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 3, background: 'var(--amber)', marginRight: 8 }} />
                    直接访问 · {100 - d.saoma}%
                  </div>
                </div>
              </div>
            </div>
            <div className="chart-card" style={{ margin: 0 }}>
              <CardTitle t="地区分布" info="C 端用户按地区（省 / 市）分组占比。" periodDays={periodDays} />
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
            <Kpi lab="总提问" val={d.totalAsk} suf="条" deltaPct={d.totalAskDelta} info="所选区间内 C 端提问条数（含追问）。" periodDays={periodDays} />
            <Kpi lab="人均提问" val={d.perUser} suf="条/人" deltaPct={d.perUserDelta} info="所选区间总提问 ÷ 同区间活跃用户数。" periodDays={periodDays} />
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
            <CardTitle t="提问关键词云" info="提问文本高频关键词，字号随出现频次；悬浮显示当前区间提问量。" periodDays={periodDays} />
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
          <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
            <Kpi lab="区间 GMV" val={d.gmv} deltaPct={d.gmvDelta} info="所选区间内已支付订单金额合计（会员 + 永享）。" periodDays={periodDays} />
            <Kpi lab="付费用户" val={d.payUsers} suf="人" deltaPct={d.payUsersDelta} info="所选区间内产生有效支付的去重用户数。" periodDays={periodDays} />
            <Kpi lab="付费转化率" val={d.payRate} deltaPct={d.payRateDelta} info="区间付费用户 ÷ 区间活跃用户。" periodDays={periodDays} />
            <Kpi lab="ARPPU（每付费用户均收入）" val={d.arppu} deltaPct={d.arppuDelta} info="区间支付收入 ÷ 区间付费用户数。" periodDays={periodDays} />
            <Kpi lab="续费率" val={d.renew} deltaPct={d.renewDelta} info="所选区间内到期且完成续费的会员数 ÷ 同区间到期会员数。" periodDays={periodDays} />
          </div>
          {/* 小节② 退款 */}
          <div className="dash-section-title" style={{ marginTop: 22 }}>
            退款
            <span className="dash-section-sub">· {rangeLabel}</span>
          </div>
          <div className="kpi-row">
            <Kpi lab="退款金额" val={d.refundAmt} deltaPct={d.refundAmtDelta} info="所选区间内成功退款金额合计。" periodDays={periodDays} />
            <Kpi lab="退款率" val={d.refundRate} deltaPct={d.refundRateDelta} info="所选区间退款金额 ÷ 同区间 GMV。" periodDays={periodDays} />
            <Kpi lab="退款订单数" val={d.refundOrders} suf="单" deltaPct={d.refundOrdersDelta} info="所选区间内发生成功退款（含部分退款）的去重订单数。" periodDays={periodDays} />
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
      <div className="unit-note">{UNIT_NOTE}</div>
    </>
  );
}
