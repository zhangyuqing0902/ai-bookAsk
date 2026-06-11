import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { LineChart, RangePicker, InfoDot } from '@aba/ui-admin';

const TABS = ['总览', '用户分析', '提问分析', '转化分析', '热门 KP'];

function Kpi({ lab, val, unit, delta, info }: { lab: string; val: string; unit?: string; delta?: string; info: string }) {
  return (
    <div className="kpi">
      <div className="lab">
        {lab}
        <InfoDot text={info} />
      </div>
      <div className="val">
        {unit && <span className="u">{unit}</span>}
        {val}
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

function Bars({ data }: { data: { nm: string; pct: number; color: string; pv: string }[] }) {
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

// 机构后台 · 数据看板（5 Tab；每个指标含说明+统计区间，指标名带中英文）
export function DataBoard() {
  const nav = useNavigate();
  const [tab, setTab] = useState(0);
  const [rangeLabel, setRangeLabel] = useState('7 日');
  const x = ['05-25', '05-26', '05-27', '05-28', '05-29', '05-30', '05-31'];
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

      {tab === 0 && (
        <>
          {/* 0610:实时总览(存量/累计指标,不随时间筛选变化) */}
          <div className="dash-section-title">
            实时总览
            <span className="dash-realtime-tag">实时</span>
            <span className="dash-section-sub">· 截至今日的累计 / 存量数据，不随上方时间筛选变化</span>
          </div>
          <div className="kpi-row">
            <Kpi lab="累计注册（注册用户）" val="12,480" info="历史累计去重注册 C 端用户数。统计区间：开通至今（实时快照）。" />
            <Kpi lab="当前会员" val="860" info="当前拥有有效会员权益的去重用户数。统计口径：实时快照。" />
            <Kpi lab="累计 GMV（成交总额）" val="86,200" unit="¥" info="已支付订单金额合计(会员+永享)。统计区间：开通至今（实时快照）。" />
            <Kpi lab="当日 DAU（日活跃用户）" val="1,240" info="当日去重活跃用户(登录或提问)。统计区间：自然日 0:00 至当前。" />
          </div>
          {/* 0610:经营分析(随上方时间区间联动的趋势指标) */}
          <div className="dash-section-title" style={{ marginTop: 22 }}>
            经营分析
            <span className="dash-section-sub">· {rangeLabel}</span>
          </div>
          <div className="chart-card" style={{ marginTop: 0 }}>
            <div className="chart-head">
              <CardTitle t="提问量趋势 · 近 7 日" info="每日 C 端提问条数(含追问)。随上方时间区间联动。" />
              <div className="legend">
                <span>
                  <i style={{ background: 'var(--indigo)' }} />
                  提问量
                </span>
              </div>
            </div>
            <LineChart cfg={{ x, area: true, series: [{ name: '提问量', color: '#4B57E8', values: [3800, 4200, 4000, 4600, 4400, 4800, 5000] }] }} />
          </div>
        </>
      )}

      {tab === 1 && (
        <>
          <div className="kpi-row">
            <Kpi lab="DAU（日活跃用户）" val="1,240" info="当日去重活跃用户。统计区间：自然日 0:00 至当前。" />
            <Kpi lab="WAU（周活跃用户）" val="5,600" info="近 7 个自然日去重活跃用户。近 7 天滚动。" />
            <Kpi lab="MAU（月活跃用户）" val="12,000" info="近 30 个自然日去重活跃用户。近 30 天滚动。" />
            <Kpi lab="新增用户" val="320" delta="较上周 +6%" info="所选区间内首次注册的用户数。随时间区间。" />
          </div>
          <div className="grid2" style={{ marginTop: 16 }}>
            <div className="chart-card" style={{ margin: 0 }}>
              <CardTitle t="留存率" info="新增用户在第 N 日仍活跃的占比。次日/7日/30日。统计区间：所选区间的新增用户队列。" />
              <Bars
                data={[
                  { nm: '次日', pct: 42, color: 'var(--indigo)', pv: '42%' },
                  { nm: '7 日', pct: 25, color: 'var(--jade)', pv: '25%' },
                  { nm: '30 日', pct: 15, color: 'var(--amber)', pv: '15%' },
                ]}
              />
            </div>
            <div className="chart-card" style={{ margin: 0 }}>
              <CardTitle t="来源分布" info="C 端用户进入渠道占比(扫码进入 / 直接访问)。统计区间：随时间区间。" />
              <div className="donut-wrap">
                <div style={{ width: 96, height: 96, borderRadius: '50%', flex: 'none', background: 'conic-gradient(var(--indigo) 0 68%,var(--amber) 68% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 500 }}>100%</div>
                </div>
                <div style={{ fontSize: 13, lineHeight: 2.1 }}>
                  <div>
                    <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 3, background: 'var(--indigo)', marginRight: 8 }} />
                    扫码进入 · 68%
                  </div>
                  <div>
                    <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 3, background: 'var(--amber)', marginRight: 8 }} />
                    直接访问 · 32%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 2 && (
        <>
          <div className="kpi-row">
            <Kpi lab="总提问" val="32,000" info="C 端累计提问条数(含追问)。统计区间：随时间区间。" />
            <Kpi lab="人均提问" val="25.8" info="总提问 / 活跃用户数。统计区间：随时间区间。" />
            <Kpi lab="平均会话轮次" val="3.4" info="总提问 / 总会话数,衡量对话深度。统计区间：随时间区间。" />
            <Kpi lab="受限内容触发率" val="12%" info="触发付费墙次数 / 总提问数。统计区间：随时间区间。" />
          </div>
          <div className="chart-card">
            <CardTitle t="按 Agent 提问分布" info="各 Agent 承接提问量占比,反映路由与配置质量。统计区间：随时间区间。" />
            <Bars
              data={[
                { nm: '李医生', pct: 90, color: 'var(--indigo)', pv: '45%' },
                { nm: '王老师', pct: 60, color: 'var(--jade)', pv: '30%' },
                { nm: '机构 Agent', pct: 50, color: 'var(--amber)', pv: '25%' },
              ]}
            />
          </div>
        </>
      )}

      {tab === 3 && (
        <>
          <div className="kpi-row">
            <Kpi lab="付费用户" val="860" info="累计产生过有效支付的去重用户数。统计区间：开通至今。" />
            <Kpi lab="付费转化率" val="6.9%" info="付费用户 / 累计用户。统计区间：开通至今。" />
            <Kpi lab="ARPPU（每付费用户均收入）" val="100.2" unit="¥" info="总收入 / 付费用户数。统计区间：开通至今。" />
            <Kpi lab="续费率" val="38%" info="到期会员中完成续费的占比。统计区间：所选区间到期队列。" />
          </div>
          <div className="grid2" style={{ marginTop: 16 }}>
            <div className="chart-card" style={{ margin: 0 }}>
              <CardTitle t="会员漏斗" info="看到会员页 → 点击购买 → 完成支付 的转化漏斗。统计区间：随时间区间。" />
              <Bars
                data={[
                  { nm: '看到会员页', pct: 100, color: 'var(--indigo)', pv: '5,000' },
                  { nm: '点击购买', pct: 28, color: 'var(--indigo)', pv: '1,400' },
                  { nm: '完成支付', pct: 17, color: 'var(--jade)', pv: '860' },
                ]}
              />
            </div>
            <div className="chart-card" style={{ margin: 0 }}>
              <CardTitle t="永享转化" info="触发永享墙 → 完成购买 的转化。统计区间：随时间区间。" />
              <Bars
                data={[
                  { nm: '触发永享墙', pct: 100, color: 'var(--amber)', pv: '1,200' },
                  { nm: '完成购买', pct: 15, color: 'var(--amber)', pv: '180' },
                ]}
              />
            </div>
          </div>
        </>
      )}

      {tab === 4 && (
        <div className="grid2" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
          {[
            {
              t: '提问数 TOP10',
              info: '按 KP 被提问条数排序,反映实际被使用的内容。',
              // 11.1:补足 top10
              rows: [
                ['心血管分册', '1.2k', 1], ['儿科学', '980', 2], ['内科精要', '760', 3], ['外科学', '540', 4],
                ['妇产科', '430', 5], ['神经内科', '380', 6], ['消化内科', '320', 7], ['呼吸科', '260', 8],
                ['内分泌', '210', 9], ['皮肤科', '160', 10],
              ] as [string, string, number][],
            },
            {
              t: '付费转化贡献 TOP10',
              info: '按经由该 KP 产生的会员/永享订单贡献排序。',
              rows: [
                ['内科精要', '¥12k', 3], ['心血管分册', '¥9k', 1], ['外科学', '¥5k', 4], ['儿科学', '¥4.2k', 2],
                ['妇产科', '¥3.6k', 5], ['神经内科', '¥2.9k', 6], ['消化内科', '¥2.1k', 7], ['呼吸科', '¥1.6k', 8],
                ['内分泌', '¥1.1k', 9], ['皮肤科', '¥0.8k', 10],
              ] as [string, string, number][],
            },
            {
              t: '永享购买 TOP10',
              info: '按该 KP 下永享买断订单数排序。',
              rows: [
                ['心血管分册', '320 单', 1], ['外科学', '210 单', 4], ['儿科学', '120 单', 2], ['内科精要', '96 单', 3],
                ['神经内科', '78 单', 6], ['妇产科', '64 单', 5], ['消化内科', '52 单', 7], ['呼吸科', '41 单', 8],
                ['内分泌', '33 单', 9], ['皮肤科', '22 单', 10],
              ] as [string, string, number][],
            },
          ].map((c) => (
            <div className="chart-card" style={{ margin: 0 }} key={c.t}>
              <CardTitle t={c.t} info={c.info} />
              {/* 11.2:每个 KP 条目可点进 KP 详情,悬浮高亮;11.1:前 3 名奖牌色突出 */}
              {c.rows.map((r, i) => (
                <div key={i} className="rank-row" onClick={() => nav('/kps/' + r[2])} title={'查看「' + r[0] + '」详情'}>
                  <span className={'rank-no' + (i < 3 ? ' m' + (i + 1) : '')}>{i + 1}</span>
                  <span className="rank-nm">{r[0]}</span>
                  <span className="rank-pv">{r[1]}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
