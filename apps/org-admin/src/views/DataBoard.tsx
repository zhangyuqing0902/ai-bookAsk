import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { LineChart, RangePicker, InfoDot, fmtCn, UNIT_NOTE } from '@aba/ui-admin';

// 0614 指标体系重划：去掉「总览」Tab（职责交主控台），数据看板专做分主题深钻。
// 四个主题域：用户分析 / 提问分析 / 营收分析 / 热门 KP（钱归钱、用户归用户、提问归提问、KP 归 KP）。
// 所有非实时指标按 今日 / 7 日 / 30 日 真联动；DAU/WAU/MAU 为固定窗口快照（tooltip 注明）。
const TABS = ['用户分析', '提问分析', '营收分析', '热门 KP'];

const I = 'var(--indigo)', J = 'var(--jade)', A = 'var(--amber)', T = 'var(--terra)', G = 'var(--ink-3)';
type Bar = { nm: string; pct: number; color: string; pv: string };
type KW = { w: string; s: number };

interface RangeData {
  // —— 用户域 ——
  newUsers: string; newDelta: string;
  retention: Bar[];
  saoma: number; // 扫码占比%（直接访问 = 100 - saoma）
  region: Bar[];
  gender: Bar[];
  // —— 提问域 ——
  askTrend: { x: string[]; v: number[] };
  totalAsk: string; perUser: string; rounds: string;
  likeRate: string; fbRate: string; // 答案质量摘要
  agent: Bar[];
  domain: Bar[];
  keywords: KW[];
  kwMult: number; // 词云 hover 数量 = s × kwMult（随区间）
  // —— 营收域 ——
  gmv: string; payUsers: string; payRate: string; arppu: string; renew: string;
  limit: string; // 受限内容触发率（漏斗入口）
  memberFunnel: Bar[];
  yxFunnel: Bar[];
  refundAmt: string; refundRate: string; refundOrders: string; netGmv: string;
  // —— 热门 KP：榜单数值随区间缩放 ——
  kpFactor: number;
}

const RANGE: Record<string, RangeData> = {
  '今日': {
    newUsers: '48', newDelta: '较昨日 +4%',
    retention: [{ nm: '次日', pct: 40, color: I, pv: '40%' }, { nm: '7 日', pct: 24, color: J, pv: '24%' }, { nm: '30 日', pct: 14, color: A, pv: '14%' }],
    saoma: 70,
    region: [{ nm: '上海', pct: 100, color: I, pv: '25%' }, { nm: '北京', pct: 80, color: I, pv: '20%' }, { nm: '广东', pct: 68, color: J, pv: '17%' }, { nm: '江浙', pct: 52, color: A, pv: '13%' }, { nm: '其他', pct: 96, color: G, pv: '25%' }],
    gender: [{ nm: '女', pct: 100, color: T, pv: '53%' }, { nm: '男', pct: 79, color: I, pv: '42%' }, { nm: '未知', pct: 10, color: G, pv: '5%' }],
    askTrend: { x: ['00时', '04时', '08时', '12时', '16时', '20时', '现在'], v: [120, 90, 260, 520, 610, 700, 540] },
    totalAsk: '1,180', perUser: '24.1', rounds: '3.2',
    likeRate: '95.2%', fbRate: '2.1%',
    agent: [{ nm: '李医生', pct: 92, color: I, pv: '46%' }, { nm: '王老师', pct: 58, color: J, pv: '29%' }, { nm: '机构 Agent', pct: 50, color: A, pv: '25%' }],
    domain: [{ nm: '心血管', pct: 100, color: I, pv: '28%' }, { nm: '脑科学 / 卒中', pct: 72, color: I, pv: '20%' }, { nm: '超声', pct: 60, color: J, pv: '17%' }, { nm: '心理', pct: 44, color: A, pv: '12%' }, { nm: '内分泌', pct: 33, color: A, pv: '9%' }, { nm: '其他', pct: 50, color: G, pv: '14%' }],
    keywords: [{ w: '高血压', s: 5 }, { w: '血糖偏高', s: 3 }, { w: '心电图', s: 4 }, { w: '用药剂量', s: 4 }, { w: '副作用', s: 3 }, { w: '复查', s: 2 }, { w: '头晕', s: 3 }, { w: '咖啡', s: 2 }, { w: '胸闷', s: 2 }, { w: '化验单', s: 3 }, { w: '心率', s: 2 }, { w: '失眠', s: 1 }],
    kwMult: 8,
    gmv: '¥1.1万', payUsers: '32', payRate: '5.8%', arppu: '¥98.4', renew: '36%',
    limit: '11%',
    memberFunnel: [{ nm: '看到会员页', pct: 100, color: I, pv: '100%' }, { nm: '点击购买', pct: 26, color: I, pv: '26%' }, { nm: '完成支付', pct: 15, color: J, pv: '15%' }],
    yxFunnel: [{ nm: '触发永享墙', pct: 100, color: A, pv: '100%' }, { nm: '完成购买', pct: 14, color: A, pv: '14%' }],
    refundAmt: '¥1,240', refundRate: '1.6%', refundOrders: '12', netGmv: '¥9,860',
    kpFactor: 0.04,
  },
  '7 日': {
    newUsers: '320', newDelta: '较上周 +6%',
    retention: [{ nm: '次日', pct: 42, color: I, pv: '42%' }, { nm: '7 日', pct: 25, color: J, pv: '25%' }, { nm: '30 日', pct: 15, color: A, pv: '15%' }],
    saoma: 68,
    region: [{ nm: '上海', pct: 100, color: I, pv: '24%' }, { nm: '北京', pct: 82, color: I, pv: '19%' }, { nm: '广东', pct: 70, color: J, pv: '17%' }, { nm: '江浙', pct: 58, color: A, pv: '14%' }, { nm: '其他', pct: 100, color: G, pv: '26%' }],
    gender: [{ nm: '女', pct: 100, color: T, pv: '54%' }, { nm: '男', pct: 78, color: I, pv: '41%' }, { nm: '未知', pct: 12, color: G, pv: '5%' }],
    askTrend: { x: ['05-25', '05-26', '05-27', '05-28', '05-29', '05-30', '05-31'], v: [3800, 4200, 4000, 4600, 4400, 4800, 5000] },
    totalAsk: '3.2万', perUser: '25.8', rounds: '3.4',
    likeRate: '94.6%', fbRate: '2.4%',
    agent: [{ nm: '李医生', pct: 90, color: I, pv: '45%' }, { nm: '王老师', pct: 60, color: J, pv: '30%' }, { nm: '机构 Agent', pct: 50, color: A, pv: '25%' }],
    domain: [{ nm: '心血管', pct: 100, color: I, pv: '28%' }, { nm: '脑科学 / 卒中', pct: 76, color: I, pv: '21%' }, { nm: '超声', pct: 58, color: J, pv: '16%' }, { nm: '心理', pct: 44, color: A, pv: '12%' }, { nm: '内分泌', pct: 33, color: A, pv: '9%' }, { nm: '其他', pct: 50, color: G, pv: '14%' }],
    keywords: [{ w: '高血压', s: 5 }, { w: '血糖', s: 4 }, { w: '心电图', s: 4 }, { w: '用药剂量', s: 5 }, { w: '副作用', s: 3 }, { w: '复查', s: 3 }, { w: '头晕', s: 2 }, { w: '咖啡', s: 2 }, { w: '胸闷', s: 3 }, { w: '化验单', s: 3 }, { w: '心率', s: 2 }, { w: '失眠', s: 2 }, { w: '饮食禁忌', s: 3 }, { w: '体检报告', s: 2 }],
    kwMult: 60,
    gmv: '¥25.6万', payUsers: '210', payRate: '6.6%', arppu: '¥99.6', renew: '38%',
    limit: '12%',
    memberFunnel: [{ nm: '看到会员页', pct: 100, color: I, pv: '100%' }, { nm: '点击购买', pct: 28, color: I, pv: '28%' }, { nm: '完成支付', pct: 17, color: J, pv: '17%' }],
    yxFunnel: [{ nm: '触发永享墙', pct: 100, color: A, pv: '100%' }, { nm: '完成购买', pct: 15, color: A, pv: '15%' }],
    refundAmt: '¥8,600', refundRate: '2.1%', refundOrders: '86', netGmv: '¥24.7万',
    kpFactor: 0.25,
  },
  '30 日': {
    newUsers: '1,280', newDelta: '较上月 +9%',
    retention: [{ nm: '次日', pct: 44, color: I, pv: '44%' }, { nm: '7 日', pct: 27, color: J, pv: '27%' }, { nm: '30 日', pct: 17, color: A, pv: '17%' }],
    saoma: 66,
    region: [{ nm: '上海', pct: 100, color: I, pv: '23%' }, { nm: '北京', pct: 84, color: I, pv: '19%' }, { nm: '广东', pct: 74, color: J, pv: '17%' }, { nm: '江浙', pct: 62, color: A, pv: '15%' }, { nm: '其他', pct: 100, color: G, pv: '26%' }],
    gender: [{ nm: '女', pct: 100, color: T, pv: '55%' }, { nm: '男', pct: 76, color: I, pv: '40%' }, { nm: '未知', pct: 12, color: G, pv: '5%' }],
    askTrend: { x: ['05-02', '05-07', '05-12', '05-17', '05-22', '05-27', '06-01'], v: [4200, 4500, 4800, 5200, 5600, 6000, 6400] },
    totalAsk: '12.8万', perUser: '28.4', rounds: '3.6',
    likeRate: '93.8%', fbRate: '2.8%',
    agent: [{ nm: '李医生', pct: 88, color: I, pv: '44%' }, { nm: '王老师', pct: 62, color: J, pv: '31%' }, { nm: '机构 Agent', pct: 50, color: A, pv: '25%' }],
    domain: [{ nm: '心血管', pct: 100, color: I, pv: '27%' }, { nm: '脑科学 / 卒中', pct: 80, color: I, pv: '22%' }, { nm: '超声', pct: 58, color: J, pv: '16%' }, { nm: '心理', pct: 44, color: A, pv: '12%' }, { nm: '内分泌', pct: 33, color: A, pv: '9%' }, { nm: '其他', pct: 52, color: G, pv: '14%' }],
    keywords: [{ w: '高血压', s: 5 }, { w: '血糖', s: 4 }, { w: '心电图', s: 4 }, { w: '用药剂量', s: 5 }, { w: '副作用', s: 4 }, { w: '复查', s: 3 }, { w: '头晕', s: 3 }, { w: '咖啡', s: 2 }, { w: '胸闷', s: 3 }, { w: '化验单', s: 4 }, { w: '心率', s: 3 }, { w: '失眠', s: 2 }, { w: '饮食禁忌', s: 3 }, { w: '体检报告', s: 3 }, { w: '血脂', s: 2 }, { w: '糖尿病', s: 4 }],
    kwMult: 240,
    gmv: '¥104.7万', payUsers: '860', payRate: '6.9%', arppu: '¥100.2', renew: '41%',
    limit: '13%',
    memberFunnel: [{ nm: '看到会员页', pct: 100, color: I, pv: '100%' }, { nm: '点击购买', pct: 30, color: I, pv: '30%' }, { nm: '完成支付', pct: 19, color: J, pv: '19%' }],
    yxFunnel: [{ nm: '触发永享墙', pct: 100, color: A, pv: '100%' }, { nm: '完成购买', pct: 16, color: A, pv: '16%' }],
    refundAmt: '¥3.4万', refundRate: '2.4%', refundOrders: '342', netGmv: '¥101.3万',
    kpFactor: 1,
  },
};

// 热门 KP 榜单（基准值 = 30 天量；按 kpFactor 缩放出今日 / 7 日，实现区间联动）
// 0614b：榜单数值统一中文万进制（fmtCn）
const fmtK = (n: number) => fmtCn(Math.round(n));
type KpRow = [string, number, number]; // [名称, 基准数值, KP id(用于下钻)]
const TOPKP: { t: string; info: string; pre: string; suf: string; rows: KpRow[] }[] = [
  {
    t: '被提问数 TOP10', info: '按 KP 被提问条数排序,反映实际被使用的内容。随所选区间联动。', pre: '', suf: ' 条',
    rows: [['心血管分册', 1200, 1], ['儿科学', 980, 2], ['内科精要', 760, 3], ['外科学', 540, 4], ['妇产科', 430, 5], ['神经内科', 380, 6], ['消化内科', 320, 7], ['呼吸科', 260, 8], ['内分泌', 210, 9], ['皮肤科', 160, 10]],
  },
  {
    t: '付费转化贡献 TOP10', info: '按经由该 KP 产生的会员 / 永享订单贡献排序。随所选区间联动。', pre: '¥', suf: '',
    rows: [['内科精要', 12000, 3], ['心血管分册', 9000, 1], ['外科学', 5000, 4], ['儿科学', 4200, 2], ['妇产科', 3600, 5], ['神经内科', 2900, 6], ['消化内科', 2100, 7], ['呼吸科', 1600, 8], ['内分泌', 1100, 9], ['皮肤科', 800, 10]],
  },
  {
    t: '永享购买 TOP10', info: '按该 KP 下永享买断订单数排序。随所选区间联动。', pre: '', suf: ' 单',
    rows: [['心血管分册', 320, 1], ['外科学', 210, 4], ['儿科学', 120, 2], ['内科精要', 96, 3], ['神经内科', 78, 6], ['妇产科', 64, 5], ['消化内科', 52, 7], ['呼吸科', 41, 8], ['内分泌', 33, 9], ['皮肤科', 22, 10]],
  },
];

function Kpi({ lab, val, unit, suf, delta, info }: { lab: string; val: string; unit?: string; suf?: string; delta?: string; info: string }) {
  return (
    <div className="kpi">
      <div className="lab">
        {lab}
        <InfoDot text={info} />
      </div>
      <div className="val">
        {unit && <span className="u">{unit}</span>}
        {val}
        {suf && <span className="uu">{suf}</span>}
      </div>
      {delta && (
        <div className="delta up">
          <Icon id="i-up" w={11} h={11} />
          {delta}
        </div>
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

function CardTitle({ t, info }: { t: string; info: string }) {
  return (
    <div className="chart-title" style={{ marginBottom: 14, display: 'inline-flex', alignItems: 'center' }}>
      {t}
      <InfoDot text={info} />
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
  const d = RANGE[rangeLabel] ?? RANGE['7 日'];

  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">数据看板</div>
        </div>
        <div className="pa">
          <RangePicker presets={['今日', '7 日', '30 日']} defaultActive={1} onChange={(r) => setRangeLabel(r.label)} />
          <button className="btn btn-ghost btn-sm" onClick={() => toast('导出整页')}>
            <Icon id="i-dl" w={14} h={14} />
            导出
          </button>
        </div>
      </div>
      <div className="tabbar">
        {TABS.map((t, i) => (
          <div key={t} className={'tab' + (tab === i ? ' on' : '')} onClick={() => setTab(i)}>
            {t}
          </div>
        ))}
      </div>

      {/* —— Tab 1 · 用户分析（用户域）—— */}
      {tab === 0 && (
        <>
          <div className="kpi-row">
            <Kpi lab="DAU（日活跃用户）" val="1,240" suf="人" info="当日去重活跃用户。固定窗口快照：自然日 0:00 至当前，不随时间区间变化。" />
            <Kpi lab="WAU（周活跃用户）" val="5,600" suf="人" info="近 7 个自然日去重活跃用户。固定窗口快照（近 7 天滚动），不随时间区间变化。" />
            <Kpi lab="MAU（月活跃用户）" val="1.2万" suf="人" info="近 30 个自然日去重活跃用户。固定窗口快照（近 30 天滚动），不随时间区间变化。" />
            <Kpi lab="新增用户" val={d.newUsers} suf="人" delta={d.newDelta} info="所选区间内首次注册的用户数。随时间区间联动。" />
          </div>
          <div className="grid2" style={{ marginTop: 16 }}>
            <div className="chart-card" style={{ margin: 0 }}>
              <CardTitle t="留存率" info="新增用户在第 N 日仍活跃的占比。次日 / 7 日 / 30 日。统计区间：所选区间的新增用户队列。" />
              <Bars data={d.retention} />
            </div>
            <div className="chart-card" style={{ margin: 0 }}>
              <CardTitle t="来源分布" info="C 端用户进入渠道占比(扫码进入 / 直接访问)。随时间区间联动。" />
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
          </div>
          <div className="grid2" style={{ marginTop: 16 }}>
            <div className="chart-card" style={{ margin: 0 }}>
              <CardTitle t="地区分布" info="C 端用户按地区（省 / 市）分组占比。随时间区间联动。" />
              <Bars data={d.region} />
            </div>
            <div className="chart-card" style={{ margin: 0 }}>
              <CardTitle t="性别分布" info="C 端用户按性别分组占比（微信授权带回，未授权归为「未知」）。随时间区间联动。" />
              <Bars data={d.gender} />
            </div>
          </div>
        </>
      )}

      {/* —— Tab 2 · 提问分析（提问域）—— */}
      {tab === 1 && (
        <>
          <div className="kpi-row">
            <Kpi lab="总提问" val={d.totalAsk} suf="条" info="C 端累计提问条数(含追问)。随时间区间联动。" />
            <Kpi lab="人均提问" val={d.perUser} suf="条/人" info="总提问 / 活跃用户数。随时间区间联动。" />
            <Kpi lab="平均会话轮次" val={d.rounds} suf="轮" info="总提问 / 总会话数,衡量对话深度。随时间区间联动。" />
            <Kpi lab="答案点赞率" val={d.likeRate} info="点赞数 ÷ 答案数,反映答案质量。明细见「数据中心 · 答案反馈」。随时间区间联动。" />
          </div>
          <div className="chart-card">
            <div className="chart-head">
              <CardTitle t={`提问量趋势 · ${rangeLabel}`} info="每日 C 端提问条数(含追问)。随上方时间区间联动。" />
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
              <CardTitle t="按 Agent 提问分布" info="各 Agent 承接提问量占比,反映路由与配置质量。随时间区间联动。" />
              <Bars data={d.agent} />
            </div>
            <div className="chart-card" style={{ margin: 0 }}>
              <CardTitle t="提问领域分布" info="按 KP / 领域聚合的提问占比，识别用户最关心的领域。随时间区间联动。" />
              <Bars data={d.domain} />
            </div>
          </div>
          {/* 提问关键词云：hover 显示当前区间该词提问数量 */}
          <div className="chart-card">
            <CardTitle t="提问关键词云" info="提问文本高频关键词，字号随出现频次；鼠标悬浮显示该词在当前所选区间的提问数量。随时间区间联动。" />
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
            <Kpi lab="区间 GMV" val={d.gmv} info="所选区间内已支付订单金额合计(会员 + 永享)。随时间区间联动。" />
            <Kpi lab="付费用户" val={d.payUsers} suf="人" info="所选区间内产生有效支付的去重用户数。随时间区间联动。" />
            <Kpi lab="付费转化率" val={d.payRate} info="区间付费用户 / 区间活跃用户。随时间区间联动。" />
            <Kpi lab="ARPPU（每付费用户均收入）" val={d.arppu} info="区间收入 / 区间付费用户数。随时间区间联动。" />
            <Kpi lab="续费率" val={d.renew} info="到期会员中完成续费的占比。统计区间：所选区间到期队列。随时间区间联动。" />
          </div>
          {/* 小节② 退款 */}
          <div className="dash-section-title" style={{ marginTop: 22 }}>
            退款
            <span className="dash-section-sub">· {rangeLabel}</span>
          </div>
          <div className="kpi-row">
            <Kpi lab="退款金额" val={d.refundAmt} info="所选区间内已成功退款的金额合计。随时间区间联动。" />
            <Kpi lab="退款率" val={d.refundRate} info="退款金额 / 区间 GMV。随时间区间联动。" />
            <Kpi lab="退款订单数" val={d.refundOrders} suf="单" info="所选区间内发生退款（含部分退款）的订单数。随时间区间联动。" />
            <Kpi lab="净 GMV（扣退款）" val={d.netGmv} info="区间 GMV − 退款金额，反映实际净收入。随时间区间联动。" />
          </div>
          {/* 小节③ 转化漏斗（0614：受限触发率为漏斗入口，与会员漏斗 / 永享转化同排，避免单指标孤行；
              作为该行首张卡片，其 InfoDot 默认向右展开，不再被左侧栏遮盖） */}
          <div className="dash-section-title" style={{ marginTop: 22 }}>
            转化漏斗
            <span className="dash-section-sub">· {rangeLabel}</span>
          </div>
          <div className="grid2" style={{ marginTop: 16, gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="chart-card" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
              <CardTitle t="受限内容触发率" info="触发付费墙次数 / 总提问数，是会员 / 永享转化的漏斗入口。随时间区间联动。" />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 7, paddingBottom: 4 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 32, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.1 }}>{d.limit}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.6 }}>触发付费墙 / 总提问 · 会员 · 永享转化的入口</div>
              </div>
            </div>
            <div className="chart-card" style={{ margin: 0 }}>
              <CardTitle t="会员漏斗" info="看到会员页 → 点击购买 → 完成支付 的转化漏斗。随时间区间联动。" />
              <Bars data={d.memberFunnel} />
            </div>
            <div className="chart-card" style={{ margin: 0 }}>
              <CardTitle t="永享转化" info="触发永享墙 → 完成购买 的转化。随时间区间联动。" />
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
              <CardTitle t={c.t} info={c.info} />
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
