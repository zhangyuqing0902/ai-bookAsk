import { useState } from 'react';
import { Icon, toast } from '@aba/ui';
import { LineChart, RangePicker, Dropdown, InfoDot, fmtCn, UNIT_NOTE } from '@aba/ui-admin';
import { platformDaily, platformSnapshot, rangeMetrics } from '@aba/mock';

// 平台后台 · 主控台（0609 方案 1：实时总览 + 经营分析 分区）
// 0614b：数值统一中文万进制（fmtCn），KPI 显单位后缀，页脚加单位规范说明
export function Dashboard() {
  const [days, setDays] = useState(7);
  const [rangeLabel, setRangeLabel] = useState('近 7 天');
  const [org, setOrg] = useState('全部机构');
  const scope = org === '全部机构' ? '全平台' : org;
  const cur = rangeMetrics(platformDaily, days);
  const prev = rangeMetrics(platformDaily, days, days);
  const n = fmtCn;
  const chartSlice = days <= 1 ? platformDaily.slice(-7) : cur.slice;

  const Delta = ({ c, p }: { c: number; p: number }) => {
    const v = p > 0 ? ((c - p) / p) * 100 : 0;
    const up = v >= 0;
    return (
      <div className={'delta ' + (up ? 'up' : 'down')}>
        <span style={up ? undefined : { display: 'inline-flex', transform: 'rotate(180deg)' }}>
          <Icon id="i-up" w={11} h={11} />
        </span>
        {Math.abs(v).toFixed(1)}% 较上一周期
      </div>
    );
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">主控台</div>
        </div>
        <div className="pa">
          <Dropdown label="全部机构" options={['全部机构', 'XX 出版社', 'YY 教育', 'ZZ 少儿', 'AA 文化集团']} onSelect={setOrg} style={{ minWidth: 140 }} />
          <button className="btn btn-ghost btn-sm" onClick={() => toast('导出报表')}>
            <Icon id="i-dl" w={14} h={14} />
            导出
          </button>
        </div>
      </div>

      {/* 实时总览（累计 / 存量，不随时间筛选变化） */}
      <div className="dash-section-title">
        实时总览
        <span className="dash-realtime-tag">实时</span>
        <span className="dash-section-sub">· {scope}截至今日的累计 / 存量数据，不随下方时间筛选变化</span>
      </div>
      {/* 0614：单行 5 列（含净 GMV），避免末卡换行后向左展开的 tooltip 被裁切露出侧栏 */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
        <div className="kpi">
          <div className="lab">
            入驻机构数
            <InfoDot text="平台已创建且未删除的机构总数。统计口径：实时快照。" />
          </div>
          <div className="val">{n(platformSnapshot.orgs)}<span className="uu">家</span></div>
          <div className="ic" style={{ background: 'var(--indigo-soft)', color: 'var(--indigo-ink)' }}>
            <Icon id="i-building" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            累计用户
            <InfoDot text="全平台各机构 C 端去重注册用户数合计。统计区间：开通至今（实时快照）。" />
          </div>
          <div className="val">{n(platformSnapshot.totalUsers)}<span className="uu">人</span></div>
          <div className="ic" style={{ background: 'var(--jade-soft)', color: 'var(--jade)' }}>
            <Icon id="i-user" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            累计 GMV（成交总额）
            <InfoDot text="全平台各机构已支付订单金额合计。统计区间：开通至今（实时快照）。资金 100% 进入各机构账户。" />
          </div>
          <div className="val">
            <span className="u">¥</span>
            {n(platformSnapshot.totalGmv)}
          </div>
          <div className="ic" style={{ background: 'var(--amber-soft)', color: 'var(--amber-ink)' }}>
            <Icon id="i-chart" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            净 GMV（扣退款）
            <InfoDot text="全平台累计 GMV − 累计退款金额（约 ¥18,100 · 退款率 2.1%），即全平台各机构净收入合计（资金 100% 进入各机构账户，平台不参与分账）。统计区间：开通至今（实时快照）。" />
          </div>
          <div className="val">
            <span className="u">¥</span>
            {n(platformSnapshot.totalGmv - 18100)}
          </div>
          <div className="ic" style={{ background: 'var(--jade-soft)', color: 'var(--jade)' }}>
            <Icon id="i-chart" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            提问总量
            <InfoDot text="全平台 C 端历史累计提问条数合计。统计区间：开通至今（实时快照）。" />
          </div>
          <div className="val">{n(platformSnapshot.totalQuestions)}<span className="uu">条</span></div>
          <div className="ic" style={{ background: 'var(--indigo-soft)', color: 'var(--indigo-ink)' }}>
            <Icon id="i-msg" w={16} h={16} />
          </div>
        </div>
      </div>

      {/* 经营分析（随时间筛选联动） */}
      <div className="dash-section-head">
        <div className="dash-section-title" style={{ margin: 0 }}>
          经营分析
          <span className="dash-section-sub">· {scope} · {rangeLabel}</span>
        </div>
        <RangePicker
          presets={['今日', '近 7 天', '30 天']}
          presetDays={[1, 7, 30]}
          defaultActive={1}
          onChange={(r) => {
            setDays(r.days);
            setRangeLabel(r.label);
          }}
        />
      </div>
      <div className="kpi-row">
        <div className="kpi">
          <div className="lab">
            活跃用户
            <InfoDot text="所选区间内全平台有登录或提问行为的去重用户数（今日＝当日 DAU；区间为去重后近似）。随时间筛选变化。" />
          </div>
          <div className="val">{n(cur.activeUsers)}<span className="uu">人</span></div>
          <Delta c={cur.activeUsers} p={prev.activeUsers} />
          <div className="ic" style={{ background: 'var(--indigo-soft)', color: 'var(--indigo-ink)' }}>
            <Icon id="i-grid" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            新增会员
            <InfoDot text="所选区间内全平台新开通会员的去重用户数。随时间筛选变化。" />
          </div>
          <div className="val">{n(cur.newMembers)}<span className="uu">人</span></div>
          <Delta c={cur.newMembers} p={prev.newMembers} />
          <div className="ic" style={{ background: 'var(--amber-soft)', color: 'var(--amber-ink)' }}>
            <Icon id="i-user" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            区间 GMV
            <InfoDot text="所选区间内全平台已支付订单金额合计。随时间筛选变化。" />
          </div>
          <div className="val">
            <span className="u">¥</span>
            {n(cur.gmv)}
          </div>
          <Delta c={cur.gmv} p={prev.gmv} />
          <div className="ic" style={{ background: 'var(--jade-soft)', color: 'var(--jade)' }}>
            <Icon id="i-chart" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            区间提问数
            <InfoDot text="所选区间内全平台 C 端新增提问条数(含追问)。随时间筛选变化。" />
          </div>
          <div className="val">{n(cur.questions)}<span className="uu">条</span></div>
          <Delta c={cur.questions} p={prev.questions} />
          <div className="ic" style={{ background: 'var(--indigo-soft)', color: 'var(--indigo-ink)' }}>
            <Icon id="i-msg" w={16} h={16} />
          </div>
        </div>
      </div>
      <div className="chart-card">
        <div className="chart-head">
          <div className="chart-title">平台提问量趋势 · {days <= 1 ? '近 7 日' : rangeLabel}</div>
          <div className="legend">
            <span>
              <i style={{ background: 'var(--indigo)' }} />
              提问量
            </span>
          </div>
        </div>
        <LineChart
          cfg={{
            x: chartSlice.map((d) => d.mmdd),
            area: true,
            series: [{ name: '提问量', color: '#4B57E8', values: chartSlice.map((d) => d.questions) }],
          }}
        />
      </div>
      <div className="unit-note">{UNIT_NOTE}</div>
    </>
  );
}
