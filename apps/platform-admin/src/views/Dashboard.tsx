import { useState } from 'react';
import { Icon, toast } from '@aba/ui';
import { LineChart, RangePicker, MultiSelect, InfoDot, exportWorkbook, fmtCn, UNIT_NOTE } from '@aba/ui-admin';
import { compareMetric, comparisonPeriodLabel, metricHelp, PLATFORM_ORGS, platformDaily, platformSnapshot, platformOrgFactor, platformOrgCount, platformOrgRole, rangeMetrics } from '@aba/mock';
import { applyOrgOverrides, useOrgTree } from '../stores/orgTree';
import { buildDashboardSpec } from '../exports/dashboard';

// 平台后台 · 主控台（0609 方案 1：实时总览 + 经营分析 分区）
// 0614b：数值统一中文万进制（fmtCn），KPI 显单位后缀，页脚加单位规范说明
// 0714：#5.1 机构下拉改用机构主数据全量（父机构带后缀）；导出迁移到 exports/dashboard.ts spec 纯函数。
// 0806-3：机构筛选单选改多选（MultiSelect，回填 + 超宽省略）。
// 0806-4：多选联动全页数据——以各机构 Token 用量作活跃度权重代理（mock），绝对量按比例缩放、率类不缩放；
//       父机构含全部子机构、父子同选去重；全选 = 系数 1（原全平台数值）。汇总口径说明行按评审要求移除。
export function Dashboard() {
  const [days, setDays] = useState(7);
  const [rangeLabel, setRangeLabel] = useState('近 7 天');
  const [range, setRange] = useState<{ start?: Date; end?: Date }>({});
  // 机构主数据（应用「子机构改父 / 取消关联」层级覆盖），父机构口径与机构管理一致
  const overrides = useOrgTree((s) => s.parentOverrides);
  const orgs = applyOrgOverrides(PLATFORM_ORGS, overrides);
  // 下拉选项文案：父机构带「（父机构）」后缀（基于覆盖后的机构树实时判定）
  const orgLabel = (name: string) => {
    const o = orgs.find((x) => x.name === name);
    return o && platformOrgRole(o, orgs) === 'parent' ? `${name}（父机构）` : name;
  };
  // 0806-3：机构筛选单选改多选（默认全选＝全平台口径，与原「全部机构」一致）；选中项回填触发器、超宽省略
  const ALL_ORG_NAMES = orgs.map((o) => o.name);
  const [selOrgs, setSelOrgs] = useState<string[]>(ALL_ORG_NAMES);
  const allSelected = selOrgs.length === ALL_ORG_NAMES.length;
  // 0806-4：联动系数与缩放助手（全选 = 1，数值与此前全平台口径完全一致）
  const factor = allSelected ? 1 : platformOrgFactor(selOrgs, orgs);
  const orgCount = allSelected ? platformSnapshot.orgs : platformOrgCount(selOrgs, orgs);
  const sc = (v: number) => Math.round(v * factor);
  // 区段副标题的机构范围：超过 3 家收敛为「A、B、C 等 N 家」，避免一长串挤压标题行
  const scopeText = allSelected ? '全平台' : selOrgs.length <= 3 ? selOrgs.join('、') : `${selOrgs.slice(0, 3).join('、')} 等 ${selOrgs.length} 家`;
  const orgFilterLabel = allSelected ? '全部机构' : selOrgs.join('、');
  const cur = rangeMetrics(platformDaily, days);
  const prev = rangeMetrics(platformDaily, days, days);
  const n = fmtCn;
  const chartSlice = days <= 1 ? platformDaily.slice(-7) : cur.slice;
  const periodKind = days <= 1 ? 'today' as const : 'range' as const;
  // 存储总量按系数缩放（保留 1 位小数）；文档 / 媒体拆分沿用互补占比
  const storageTb = platformSnapshot.kbStorageTb * factor;

  // 0722：支持率值指标；0806-2：率类差值统一以 % 符号展示（语义为绝对差，tooltip 注明）；
  // 0806-5：环比改胶囊结构（对齐机构后台数据看板 dboard 视觉语言）——箭头+数值做成软底胶囊，说明文字降灰
  const Delta = ({ c, p, unit = 'count' }: { c: number; p: number; unit?: 'count' | 'rate' }) => {
    const comparison = compareMetric(c, p, unit);
    if (!comparison.comparable)
      return (
        <div className="delta">
          <span className="delta-txt">{comparison.label}</span>
          <span className="period-compare">{comparisonPeriodLabel(days)}</span>
        </div>
      );
    const v = comparison.value ?? 0;
    const up = v >= 0;
    return (
      <div className={'delta ' + (up ? 'up' : 'down')}>
        <span className="delta-pill">
          <span className="delta-arrow" style={up ? undefined : { display: 'inline-flex', transform: 'rotate(180deg)' }}>
            <Icon id="i-up" w={10} h={10} />
          </span>
          {/* 0806-2：率类差值统一 % 符号（语义为绝对差，tooltip 注明） */''}{Math.abs(v).toFixed(1)}%
        </span>
        <span className="delta-txt">较上一周期</span>
        <span className="period-compare">{comparisonPeriodLabel(days)}</span>
      </div>
    );
  };

  // 0806-4：分布副行小磁贴（替代原「A x（p%） · B y（p%）」长文行）——标签 / 数值 / 占比三段式，信息不变
  const DistTile = ({ lab, val, pct }: { lab: string; val: string; pct: string }) => (
    <div className="kd-item">
      <span className="kd-lab" title={lab}>{lab}</span>
      <span className="kd-val">
        {val}
        <span className="kd-pct">{pct}</span>
      </span>
    </div>
  );

  return (
    // 0806-5：pf-dash 作用域——整页 KPI / 环比 / 段标题 / 图表卡美化（对齐 dboard 视觉语言，见 admin-app.css 末尾）
    <div className="pf-dash">
      <div className="page-head">
        <div>
          <div className="pt">主控台</div>
        </div>
        <div className="pa">
          {/* 0806-3：机构筛选单选改多选——默认全选回填「全部机构」，部分选中顿号拼接回填、超宽省略 */}
          <MultiSelect label="机构" options={ALL_ORG_NAMES.map(orgLabel)} value={selOrgs} onChange={setSelOrgs} style={{ width: 240 }} />
          <button className="btn btn-ghost btn-sm" onClick={() => { void exportWorkbook(buildDashboardSpec({ org: orgFilterLabel, days, rangeLabel, start: range.start, end: range.end, factor, orgCount })); toast('正在导出 报表'); }}>
            <Icon id="i-dl" w={14} h={14} />
            导出
          </button>
        </div>
      </div>

      {/* 实时总览（累计 / 存量，不随时间筛选变化；0806-4 起随机构多选联动） */}
      <div className="dash-section-title">
        实时总览
        <span className="dash-realtime-tag">实时</span>
        <span className="dash-section-sub">· {scopeText}截至今日的累计 / 存量数据，不随下方时间筛选变化</span>
      </div>
      {/* 0614：单行 5 列（含净 GMV），避免末卡换行后向左展开的 tooltip 被裁切露出侧栏 */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
        <div className="kpi">
          <div className="lab">
            入驻机构数
            <InfoDot text={metricHelp('平台已创建且未删除的机构总数；机构筛选时显示所选机构（父机构含子机构）数量。', 'snapshot')} />
          </div>
          <div className="val">{n(orgCount)}<span className="uu">家</span></div>
          <div className="ic" style={{ background: 'var(--indigo-soft)', color: 'var(--indigo-ink)' }}>
            <Icon id="i-building" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            累计用户
            <InfoDot text={metricHelp('全平台各机构 C 端注册用户数合计。去重：按用户 ID 去重。', 'snapshot')} />
          </div>
          <div className="val">{n(sc(platformSnapshot.totalUsers))}<span className="uu">人</span></div>
          <div className="ic" style={{ background: 'var(--jade-soft)', color: 'var(--jade)' }}>
            <Icon id="i-user" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            累计 GMV（成交总额）
            <InfoDot text={metricHelp('全平台各机构已支付订单金额合计，资金 100% 进入各机构账户。', 'snapshot', 'money')} />
          </div>
          <div className="val">
            <span className="u">¥</span>
            {n(sc(platformSnapshot.totalGmv))}
          </div>
          <div className="ic" style={{ background: 'var(--amber-soft)', color: 'var(--amber-ink)' }}>
            <Icon id="i-chart" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            净 GMV（扣退款）
            <InfoDot text={metricHelp('全平台累计 GMV 减累计成功退款金额，即各机构净收入合计；平台不参与分账。', 'snapshot', 'money')} />
          </div>
          <div className="val">
            <span className="u">¥</span>
            {n(sc(platformSnapshot.totalGmv - 18100))}
          </div>
          <div className="ic" style={{ background: 'var(--jade-soft)', color: 'var(--jade)' }}>
            <Icon id="i-chart" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            提问总量
            <InfoDot text={metricHelp('全平台 C 端历史累计提问条数合计。', 'snapshot')} />
          </div>
          <div className="val">{n(sc(platformSnapshot.totalQuestions))}<span className="uu">条</span></div>
          <div className="ic" style={{ background: 'var(--indigo-soft)', color: 'var(--indigo-ink)' }}>
            <Icon id="i-msg" w={16} h={16} />
          </div>
        </div>
      </div>

      {/* 0806-2：实时总览第二行——内容供给三卡（KP 总数 / 知识库文件总数 / 存储总量），3 等分满行与首行左右对齐；
          0806-3：行距 16px 与经营分析多行卡片的 grid gap 一致；
          0806-4：分布副行长文行改小磁贴（标签 / 数值 / 占比三段式），数值随机构多选缩放、占比不变 */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginTop: 16 }}>
        <div className="kpi">
          <div className="lab">
            知识产品 KP 总数
            <InfoDot text={metricHelp('全平台各机构创建且未删除的知识产品总数（含草稿与已下架）。', 'snapshot')} />
          </div>
          <div className="val">{n(sc(platformSnapshot.kpTotal))}<span className="uu">个</span></div>
          <div className="kpi-dist" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
            <DistTile lab="已发布" val={n(sc(platformSnapshot.kpPublished))} pct={`${Math.round(platformSnapshot.kpPublished / platformSnapshot.kpTotal * 100)}%`} />
            <DistTile lab="草稿" val={n(sc(platformSnapshot.kpDraft))} pct={`${Math.round(platformSnapshot.kpDraft / platformSnapshot.kpTotal * 100)}%`} />
            <DistTile lab="已下架" val={n(sc(platformSnapshot.kpUnlisted))} pct={`${Math.round(platformSnapshot.kpUnlisted / platformSnapshot.kpTotal * 100)}%`} />
          </div>
          <div className="ic" style={{ background: 'var(--indigo-soft)', color: 'var(--indigo-ink)' }}>
            <Icon id="i-cube" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            知识库文件总数
            <InfoDot text={metricHelp('全平台各机构 KP 知识库内文件总数（不含已删除）；按类型拆分见卡内明细。', 'snapshot')} />
          </div>
          <div className="val">{n(sc(platformSnapshot.kbFiles))}<span className="uu">个</span></div>
          <div className="kpi-dist" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
            <DistTile lab="文档" val={n(sc(platformSnapshot.kbDoc))} pct={`${Math.round(platformSnapshot.kbDoc / platformSnapshot.kbFiles * 100)}%`} />
            <DistTile lab="图片" val={n(sc(platformSnapshot.kbImage))} pct={`${Math.round(platformSnapshot.kbImage / platformSnapshot.kbFiles * 100)}%`} />
            <DistTile lab="音频" val={n(sc(platformSnapshot.kbAudio))} pct={`${Math.round(platformSnapshot.kbAudio / platformSnapshot.kbFiles * 100)}%`} />
            <DistTile lab="视频" val={n(sc(platformSnapshot.kbVideo))} pct={`${Math.round(platformSnapshot.kbVideo / platformSnapshot.kbFiles * 100)}%`} />
          </div>
          <div className="ic" style={{ background: 'var(--jade-soft)', color: 'var(--jade)' }}>
            <Icon id="i-file" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            知识库存储总量
            <InfoDot text={metricHelp('全平台知识库文件占用的存储空间合计（原始文件，不含向量索引）。', 'snapshot')} />
          </div>
          <div className="val">{storageTb.toFixed(1)}<span className="uu">TB</span></div>
          {/* 文档 / 媒体两侧互补 100%，容量按占比折算保留 1 位小数 */}
          <div className="kpi-dist" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
            <DistTile lab="文档" val={`${(storageTb * (100 - platformSnapshot.kbMediaPct) / 100).toFixed(1)}TB`} pct={`${100 - platformSnapshot.kbMediaPct}%`} />
            <DistTile lab="媒体资源（图 / 音 / 视）" val={`${(storageTb * platformSnapshot.kbMediaPct / 100).toFixed(1)}TB`} pct={`${platformSnapshot.kbMediaPct}%`} />
          </div>
          <div className="ic" style={{ background: 'var(--amber-soft)', color: 'var(--amber-ink)' }}>
            <Icon id="i-grid" w={16} h={16} />
          </div>
        </div>
      </div>

      {/* 经营分析（随时间筛选联动；0806-4 起随机构多选联动） */}
      <div className="dash-section-head">
        <div className="dash-section-title" style={{ margin: 0 }}>
          经营分析
          <span className="dash-section-sub">· {scopeText} · {rangeLabel}</span>
        </div>
        <RangePicker
          presets={['今日', '近 7 天', '30 天']}
          presetDays={[1, 7, 30]}
          defaultActive={1}
          onChange={(r) => {
            setDays(r.days);
            setRangeLabel(r.label);
            setRange({ start: r.start, end: r.end });
          }}
        />
      </div>
      {/* 0722：6 张 KPI 改 3 列两行，避免 4+2 断行不齐 */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="kpi">
          <div className="lab">
            活跃用户
            <InfoDot text={metricHelp('所选区间内有登录或提问行为的用户数；今日为截至当前时刻的 DAU。去重：按用户 ID 去重，跨天重复只计 1 人。', periodKind)} />
          </div>
          <div className="val">{n(sc(cur.activeUsers))}<span className="uu">人</span></div>
          <Delta c={sc(cur.activeUsers)} p={sc(prev.activeUsers)} />
          <div className="ic" style={{ background: 'var(--indigo-soft)', color: 'var(--indigo-ink)' }}>
            <Icon id="i-grid" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            新增会员
            {/* 0722：口径定稿——历史首次开通；续费、回流均不计入 */}
            <InfoDot text={metricHelp('所选区间内历史首次开通会员的用户数；续费与回流不计入。去重：按用户 ID 去重。', periodKind)} />
          </div>
          <div className="val">{n(sc(cur.newMembers))}<span className="uu">人</span></div>
          <Delta c={sc(cur.newMembers)} p={sc(prev.newMembers)} />
          <div className="ic" style={{ background: 'var(--amber-soft)', color: 'var(--amber-ink)' }}>
            <Icon id="i-user" w={16} h={16} />
          </div>
        </div>
        {/* 0722：平台侧补齐会员三分口径——续费率 / 回流会员（与机构后台数据看板口径一致） */}
        <div className="kpi">
          <div className="lab">
            续费率
            <InfoDot text={metricHelp('所选区间内到期且完成续费的会员数 ÷ 同区间到期会员数。去重：分子分母均按会员（用户 ID）去重。', periodKind, 'rate')} />
          </div>
          <div className="val">{cur.renewRate.toFixed(1)}<span className="uu">%</span></div>
          <Delta c={cur.renewRate} p={prev.renewRate} unit="rate" />
          <div className="ic" style={{ background: 'var(--jade-soft)', color: 'var(--jade)' }}>
            <Icon id="i-refresh" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            回流会员
            <InfoDot text={metricHelp('所选区间内开通会员、且开通时会员状态为已过期的用户数；不计入新增会员与续费率。去重：按用户 ID 去重。', periodKind)} />
          </div>
          <div className="val">{n(sc(cur.reflow))}<span className="uu">人</span></div>
          <Delta c={sc(cur.reflow)} p={sc(prev.reflow)} />
          <div className="ic" style={{ background: 'var(--indigo-soft)', color: 'var(--indigo-ink)' }}>
            <Icon id="i-user" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            区间 GMV
            <InfoDot text={metricHelp('所选区间内全平台已支付订单金额合计；待支付、已失效订单不计入。', periodKind, 'money')} />
          </div>
          <div className="val">
            <span className="u">¥</span>
            {n(sc(cur.gmv))}
          </div>
          <Delta c={sc(cur.gmv)} p={sc(prev.gmv)} />
          <div className="ic" style={{ background: 'var(--jade-soft)', color: 'var(--jade)' }}>
            <Icon id="i-chart" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            区间提问数
            <InfoDot text={metricHelp('所选区间内全平台 C 端新增提问条数，包含追问。', periodKind)} />
          </div>
          <div className="val">{n(sc(cur.questions))}<span className="uu">条</span></div>
          <Delta c={sc(cur.questions)} p={sc(prev.questions)} />
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
            series: [{ name: '提问量', color: '#4B57E8', values: chartSlice.map((d) => sc(d.questions)) }],
          }}
        />
      </div>
      <div className="unit-note">{UNIT_NOTE}</div>
    </div>
  );
}
