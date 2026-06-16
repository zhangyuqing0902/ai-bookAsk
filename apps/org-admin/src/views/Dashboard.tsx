import { useState } from 'react';
import { Icon, toast } from '@aba/ui';
import { LineChart, RangePicker, InfoDot, CurrentSubCard, fmtCn, UNIT_NOTE } from '@aba/ui-admin';
import { orgDaily, orgSnapshot, rangeMetrics, MY_ORG_SUBS, currentSubCard } from '@aba/mock';

// 机构后台 · 主控台（0609 方案 1：实时总览 + 经营分析 分区）
// 0614b：数值统一中文万进制（fmtCn），KPI 显单位后缀，页脚加单位规范说明
export function Dashboard() {
  const [days, setDays] = useState(7);
  const [rangeLabel, setRangeLabel] = useState('近 7 天');
  const cur = rangeMetrics(orgDaily, days);
  const prev = rangeMetrics(orgDaily, days, days);
  const n = fmtCn;
  const chartSlice = days <= 1 ? orgDaily.slice(-7) : cur.slice;

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
          <button className="btn btn-ghost btn-sm" onClick={() => toast('导出报表')}>
            <Icon id="i-dl" w={14} h={14} />
            导出
          </button>
        </div>
      </div>

      {/* 0615 / 0615-6：机构配额前置——进后台先看「当前订阅 + 额度是否吃紧」，再看经营数据；
          复用平台机构详情同款「当前生效订阅卡」（机构侧只读：不显商务负责人 / 不显新建订阅按钮） */}
      <CurrentSubCard data={currentSubCard(MY_ORG_SUBS)} showOwner={false} />

      {/* 实时总览（累计 / 存量，不随时间筛选变化） */}
      <div className="dash-section-title">
        实时总览
        <span className="dash-realtime-tag">实时</span>
        <span className="dash-section-sub">· 截至今日的累计 / 存量数据，不随下方时间筛选变化</span>
      </div>
      {/* 0614：实时总览聚焦「钱 + 规模」——钱(累计GMV / 累计退款 / 净GMV) 连在一起，再规模(会员 / 注册)；去掉累计提问(归数据看板·提问分析)。
          单行 5 列：避免 5 卡换行后末卡落到第二行左列、其向左展开的 tooltip 被 admin-body 横向裁切而露出侧栏（修复累计退款 tooltip 遮挡） */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
        <div className="kpi">
          <div className="lab">
            累计 GMV（成交总额）
            <InfoDot text="历史累计已支付订单金额合计(会员+永享;兑换码计 0)。统计区间：开通至今（实时快照）。" />
          </div>
          <div className="val">
            <span className="u">¥</span>
            {n(orgSnapshot.totalGmv)}
          </div>
          <div className="ic" style={{ background: 'var(--jade-soft)', color: 'var(--jade)' }}>
            <Icon id="i-chart" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            累计退款 / 退款率
            <InfoDot text="历史累计已成功退款金额；退款率 = 退款金额 ÷ GMV。统计区间：开通至今。" />
          </div>
          <div className="val">
            <span className="u">¥</span>
            {n(1860)}
            <span style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 400, marginLeft: 6 }}>· 2.1%</span>
          </div>
          <div className="ic" style={{ background: 'rgba(229,83,59,.12)', color: 'var(--terra)' }}>
            <Icon id="i-dl" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            净 GMV（扣退款）
            <InfoDot text="累计 GMV − 累计退款金额，反映实际到账净收入。统计区间：开通至今（实时快照）。" />
          </div>
          <div className="val">
            <span className="u">¥</span>
            {n(orgSnapshot.totalGmv - 1860)}
          </div>
          <div className="ic" style={{ background: 'var(--jade-soft)', color: 'var(--jade)' }}>
            <Icon id="i-chart" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            当前会员数
            <InfoDot text="当前拥有有效会员权益的去重用户数。统计口径：实时快照。" />
          </div>
          <div className="val">{n(orgSnapshot.currentMembers)}<span className="uu">人</span></div>
          <div className="ic" style={{ background: 'var(--amber-soft)', color: 'var(--amber-ink)' }}>
            <Icon id="i-user" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            累计注册用户
            <InfoDot text="本机构 C 端去重注册用户数。统计区间：开通至今（实时快照）。" />
          </div>
          <div className="val">{n(orgSnapshot.totalRegistered)}<span className="uu">人</span></div>
          <div className="ic" style={{ background: 'var(--jade-soft)', color: 'var(--jade)' }}>
            <Icon id="i-user" w={16} h={16} />
          </div>
        </div>
      </div>

      {/* 经营分析（随时间筛选联动） */}
      <div className="dash-section-head">
        <div className="dash-section-title" style={{ margin: 0 }}>
          经营分析
          <span className="dash-section-sub">· {rangeLabel}</span>
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
            <InfoDot text="所选区间内有登录或提问行为的去重用户数（今日＝当日 DAU；区间为去重后近似）。随时间筛选变化。" />
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
            <InfoDot text="所选区间内新开通会员的去重用户数。随时间筛选变化。" />
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
            <InfoDot text="所选区间内已支付订单金额合计(会员+永享)。随时间筛选变化。" />
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
            <InfoDot text="所选区间内 C 端新增提问条数(含追问)。随时间筛选变化。" />
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
          <div className="chart-title">活跃与会员趋势 · {days <= 1 ? '近 7 日' : rangeLabel}</div>
          <div className="legend">
            <span>
              <i style={{ background: 'var(--indigo)' }} />
              DAU
            </span>
            <span>
              <i style={{ background: 'var(--amber)' }} />
              新增会员
            </span>
          </div>
        </div>
        <LineChart
          cfg={{
            x: chartSlice.map((d) => d.mmdd),
            area: true,
            series: [
              { name: 'DAU', color: '#4B57E8', values: chartSlice.map((d) => d.dau) },
              { name: '新增会员', color: '#FF6F55', dash: true, values: chartSlice.map((d) => d.newMembers) },
            ],
          }}
        />
      </div>
      <div className="unit-note">{UNIT_NOTE}</div>
    </>
  );
}
