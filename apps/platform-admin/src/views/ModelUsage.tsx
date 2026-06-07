import { Icon, toast } from '@aba/ui';
import { LineChart, RangePicker, Dropdown, InfoDot } from '@aba/ui-admin';

// 平台后台 · 模型用量（平台默认 LLM）
export function ModelUsage() {
  const x = ['05-25', '05-26', '05-27', '05-28', '05-29', '05-30', '05-31'];
  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">模型用量</div>
        </div>
        <div className="pa">
          <Dropdown label="全部" options={['全部', 'XX 出版社', 'YY 教育', 'ZZ 少儿']} style={{ minWidth: 140 }} />
          <RangePicker presets={['今日', '近 7 天', '30 天']} defaultActive={1} />
          <button className="btn btn-ghost btn-sm" onClick={() => toast('导出')}>
            <Icon id="i-dl" w={14} h={14} />
            导出
          </button>
        </div>
      </div>
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="kpi">
          <div className="lab">
            总 tokens
            <InfoDot text="平台默认 LLM 在所选机构/区间内消耗的总 token 数(输入+输出)。统计区间：随上方时间区间。" />
          </div>
          <div className="val">
            8.6<span className="u">M</span>
          </div>
          <div className="delta up">
            <Icon id="i-up" w={11} h={11} />
            9.2% 较上周
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            调用次数
            <InfoDot text="平台默认 LLM 被请求的总次数。统计区间：随上方时间区间。" />
          </div>
          <div className="val">
            240<span className="u">k</span>
          </div>
          <div className="delta up">
            <Icon id="i-up" w={11} h={11} />
            6.1% 较上周
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            平均响应
            <InfoDot text="单次模型调用从请求到首字返回的平均耗时。统计区间：随上方时间区间。" />
          </div>
          <div className="val">
            1.8<span className="u">s</span>
          </div>
          <div className="delta up">
            <Icon id="i-up" w={11} h={11} />
            优化 0.2s
          </div>
        </div>
      </div>
      <div className="chart-card">
        <div className="chart-head">
          <div className="chart-title">各机构用量趋势 · 多折线</div>
          <div className="legend">
            <span>
              <i style={{ background: 'var(--indigo)' }} />
              XX
            </span>
            <span>
              <i style={{ background: 'var(--jade)' }} />
              YY
            </span>
            <span>
              <i style={{ background: 'var(--amber)' }} />
              ZZ
            </span>
          </div>
        </div>
        <LineChart
          cfg={{
            x,
            series: [
              { name: 'XX', color: '#4B57E8', values: [120, 150, 140, 175, 165, 205, 225] },
              { name: 'YY', color: '#15B080', values: [80, 95, 100, 110, 120, 128, 140] },
              { name: 'ZZ', color: '#FF6F55', values: [50, 60, 68, 72, 85, 90, 98] },
            ],
          }}
        />
      </div>
    </>
  );
}
