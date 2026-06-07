import { Icon, toast } from '@aba/ui';
import { LineChart, RangePicker, InfoDot } from '@aba/ui-admin';

// 机构后台 · 主控台
export function Dashboard() {
  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">主控台</div>
        </div>
        <div className="pa">
          <RangePicker presets={['今日', '近 7 天', '30 天']} defaultActive={1} />
          <button className="btn btn-ghost btn-sm" onClick={() => toast('导出报表')}>
            <Icon id="i-dl" w={14} h={14} />
            导出
          </button>
        </div>
      </div>
      <div className="kpi-row">
        <div className="kpi">
          <div className="lab">
            当日 DAU（日活跃用户）
            <InfoDot text="当日去重活跃用户数(登录或提问任一即计)。统计区间：自然日 0:00 至当前。" />
          </div>
          <div className="val">1,240</div>
          <div className="delta up">
            <Icon id="i-up" w={11} h={11} />
            1.4% 较昨日
          </div>
          <div className="ic" style={{ background: 'var(--indigo-soft)', color: 'var(--indigo-ink)' }}>
            <Icon id="i-grid" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            当前会员数
            <InfoDot text="当前拥有有效会员权益的去重用户数。统计口径：实时快照。" />
          </div>
          <div className="val">860</div>
          <div className="delta up">
            <Icon id="i-up" w={11} h={11} />
            5.8% 较上周
          </div>
          <div className="ic" style={{ background: 'var(--amber-soft)', color: 'var(--amber-ink)' }}>
            <Icon id="i-user" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            累计 GMV（成交总额）
            <InfoDot text="历史累计已支付订单金额合计(会员+永享;兑换码计 0)。统计区间：开通至今。" />
          </div>
          <div className="val">
            <span className="u">¥</span>86,200
          </div>
          <div className="delta up">
            <Icon id="i-up" w={11} h={11} />
            7.1% 较上周
          </div>
          <div className="ic" style={{ background: 'var(--jade-soft)', color: 'var(--jade)' }}>
            <Icon id="i-chart" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            累计提问数
            <InfoDot text="C 端用户历史累计提问条数(含追问)。统计区间：开通至今。" />
          </div>
          <div className="val">32,000</div>
          <div className="delta up">
            <Icon id="i-up" w={11} h={11} />
            3.2% 较上周
          </div>
          <div className="ic" style={{ background: 'var(--indigo-soft)', color: 'var(--indigo-ink)' }}>
            <Icon id="i-msg" w={16} h={16} />
          </div>
        </div>
      </div>
      <div className="chart-card">
        <div className="chart-head">
          <div className="chart-title">活跃与会员趋势 · 近 7 日</div>
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
            x: ['05-25', '05-26', '05-27', '05-28', '05-29', '05-30', '05-31'],
            area: true,
            series: [
              { name: 'DAU', color: '#4B57E8', values: [980, 1120, 1040, 1180, 1100, 1210, 1240] },
              { name: '新增会员', color: '#FF6F55', dash: true, values: [20, 42, 38, 55, 60, 82, 96] },
            ],
          }}
        />
      </div>
    </>
  );
}
