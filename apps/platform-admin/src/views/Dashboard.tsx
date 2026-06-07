import { Icon, toast } from '@aba/ui';
import { LineChart, RangePicker, InfoDot } from '@aba/ui-admin';

// 平台后台 · 主控台
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
            入驻机构数
            <InfoDot text="平台已创建且未删除的机构总数。统计口径：实时快照。" />
          </div>
          <div className="val">36</div>
          <div className="delta up">
            <Icon id="i-up" w={11} h={11} />
            +2 较上月
          </div>
          <div className="ic" style={{ background: 'var(--indigo-soft)', color: 'var(--indigo-ink)' }}>
            <Icon id="i-building" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            累计用户
            <InfoDot text="全平台各机构 C 端去重注册用户数合计。统计区间：开通至今。" />
          </div>
          <div className="val">
            12.4<span className="u">w</span>
          </div>
          <div className="delta up">
            <Icon id="i-up" w={11} h={11} />
            8.1% 较上周
          </div>
          <div className="ic" style={{ background: 'var(--jade-soft)', color: 'var(--jade)' }}>
            <Icon id="i-user" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            累计 GMV（成交总额）
            <InfoDot text="全平台各机构已支付订单金额合计。统计区间：开通至今。资金 100% 进入各机构账户。" />
          </div>
          <div className="val">
            <span className="u">¥</span>86.2<span className="u">w</span>
          </div>
          <div className="delta up">
            <Icon id="i-up" w={11} h={11} />
            6.5% 较上周
          </div>
          <div className="ic" style={{ background: 'var(--amber-soft)', color: 'var(--amber-ink)' }}>
            <Icon id="i-chart" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            提问总量
            <InfoDot text="全平台 C 端历史累计提问条数合计。统计区间：开通至今。" />
          </div>
          <div className="val">
            320<span className="u">w</span>
          </div>
          <div className="delta up">
            <Icon id="i-up" w={11} h={11} />
            4.0% 较上周
          </div>
          <div className="ic" style={{ background: 'var(--indigo-soft)', color: 'var(--indigo-ink)' }}>
            <Icon id="i-msg" w={16} h={16} />
          </div>
        </div>
      </div>
      <div className="chart-card">
        <div className="chart-head">
          <div className="chart-title">平台汇总提问量趋势 · 近 7 日</div>
          <div className="legend">
            <span>
              <i style={{ background: 'var(--indigo)' }} />
              提问量(万)
            </span>
          </div>
        </div>
        <LineChart
          cfg={{
            x: ['05-25', '05-26', '05-27', '05-28', '05-29', '05-30', '05-31'],
            area: true,
            series: [{ name: '提问量(万)', color: '#4B57E8', values: [260, 250, 290, 275, 300, 290, 320] }],
          }}
        />
      </div>
    </>
  );
}
