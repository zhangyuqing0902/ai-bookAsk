import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { Dropdown, TextInput, InfoDot, pickFile, ACCEPT } from '@aba/ui-admin';

const TABS = ['基本资料', '机构配置', '用量看板'];
const SUBTABS = ['LLM 配置', '联网配置', '微信支付'];

// 13.6:用量看板卡片(顶部色条 + 标题 + 指标行分隔 + 数值强调)
function UsageCard({ title, rows }: { title: string; rows: [string, string, string][] }) {
  return (
    <div className="usage-card">
      <div className="uc-title">
        <span className="uc-dot" />
        {title}
      </div>
      <div className="uc-rows">
        {rows.map(([k, v, info]) => (
          <div className="uc-row" key={k}>
            <span className="uc-k">
              {k}
              <InfoDot text={info} />
            </span>
            <span className="uc-v mono">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 平台后台 · 机构详情（基本资料 / 机构配置(二级Tab) / 用量看板）
export function OrgDetail() {
  const nav = useNavigate();
  const [tab, setTab] = useState(0);
  const [sub, setSub] = useState(0);
  const [net, setNet] = useState(true);

  return (
    <>
      <div className="kpd-head">
        <span className="kpd-back" onClick={() => nav('/orgs')}>
          <Icon id="i-chevL" />
          返回
        </span>
        <span className="kpd-name">XX 出版社</span>
        <span className="tag-s tag-jade">正常</span>
        {tab === 0 && (
          <span className="kpd-status">
            <button className="btn btn-primary btn-sm" onClick={() => toast('已保存')}>
              保存
            </button>
          </span>
        )}
      </div>
      <div className="kpd-tabs">
        {TABS.map((t, i) => (
          <div key={t} className={'kpd-tab' + (tab === i ? ' on' : '')} onClick={() => setTab(i)}>
            {t}
          </div>
        ))}
      </div>

      {tab === 0 && (
        <div className="fm-card">
          <div className="fm-row">
            <div className="lab">机构名称</div>
            <div className="ctl"><TextInput defaultValue="XX 出版社" style={{ maxWidth: 320 }} /></div>
          </div>
          <div className="fm-row">
            <div className="lab">上级机构</div>
            <div className="ctl"><Dropdown label="无" options={['无', 'XX 出版集团']} style={{ width: 200 }} /></div>
          </div>
          <div className="fm-row">
            <div className="lab">备注</div>
            <div className="ctl"><TextInput placeholder="选填" style={{ maxWidth: 420 }} /></div>
          </div>
          <div className="fm-row">
            <div className="lab">状态</div>
            <div className="ctl" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="tag-s tag-jade">正常</span>
              <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>状态变更请在机构列表的操作列进行</span>
            </div>
          </div>
        </div>
      )}

      {tab === 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 18 }}>
          <div className="card" style={{ padding: 8, alignSelf: 'start' }}>
            {/* 13.3:二级 Tab 选中态(靛蓝软底+靛蓝字),不再灰扑扑 */}
            {SUBTABS.map((s, i) => (
              <div
                key={s}
                className={'cfg-sub' + (sub === i ? ' on' : '')}
                onClick={() => setSub(i)}
              >
                {s}
              </div>
            ))}
          </div>
          <div className="fm-card" style={{ margin: 0 }}>
            {sub === 0 && (
              <>
                <div className="fh">LLM 配置</div>
                <div className="radio-list" style={{ padding: '6px 0 14px' }}>
                  <div className="radio-opt on">
                    <div className="rd" />
                    <div>
                      <div className="rt">平台默认</div>
                      <div className="rs">使用平台统一模型与额度</div>
                    </div>
                  </div>
                  <div className="radio-opt" style={{ opacity: 0.5, cursor: 'not-allowed' }} title="暂未开放">
                    <div className="rd" />
                    <div>
                      <div className="rt">自配厂商 · 暂未开放</div>
                      <div className="rs">机构自有 API Key 接入（敬请期待）</div>
                    </div>
                  </div>
                </div>
                <div>
                  <button className="btn btn-primary btn-sm" onClick={() => toast('已保存')}>
                    保存
                  </button>
                </div>
              </>
            )}
            {sub === 1 && (
              <>
                <div className="fh">联网配置</div>
                {/* 13.4:开关即时生效,去掉保存按钮 */}
                <div className="fm-row" style={{ borderTop: 'none' }}>
                  <div className="lab">允许联网检索</div>
                  <div className="ctl" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className={'switch' + (net ? ' on' : '')} onClick={() => { setNet((n) => !n); toast(net ? '已关闭联网检索' : '已开启联网检索'); }} />
                    <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>开启后,知识库未命中时可联网补充检索（标注来源）· 开关即时生效。</span>
                  </div>
                </div>
              </>
            )}
            {sub === 2 && (
              <>
                <div className="fh">
                  微信支付 <span style={{ fontWeight: 400, color: 'var(--ink-3)', fontSize: 13 }}>当前状态 </span>
                  <span className="tag-s tag-indigo">已配置</span>
                </div>
                <div className="fm-row">
                  <div className="lab">商户号</div>
                  <div className="ctl"><TextInput defaultValue="1900012345" style={{ maxWidth: 320 }} /></div>
                </div>
                <div className="fm-row">
                  <div className="lab">APIv3 密钥</div>
                  <div className="ctl"><TextInput defaultValue="••••••••••••3a7f" style={{ maxWidth: 320 }} /></div>
                </div>
                <div className="fm-row">
                  <div className="lab">证书</div>
                  <div className="ctl">
                    {/* 13.5:上传按钮加宽(文案不溢出)+ 保存按钮放其下方、与之左对齐 */}
                    <div className="upbox" style={{ maxWidth: 360 }} onClick={() => pickFile(ACCEPT.cert, (n) => toast('已选择 ' + n))}>
                      <Icon id="i-up" />
                      <div className="nowrap">apiclient_cert.pem（已上传 · 点击替换）</div>
                    </div>
                    <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => toast('已保存')}>
                      保存
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {tab === 2 && (
        <div className="kpi-row">
          <UsageCard
            title="活跃度"
            rows={[
              ['DAU', '1,240', '当日去重活跃用户(登录或提问)。统计区间：自然日 0:00 至当前。'],
              ['WAU', '5,600', '近 7 个自然日内去重活跃用户。统计区间：近 7 天滚动。'],
              ['MAU', '12,000', '近 30 个自然日内去重活跃用户。统计区间：近 30 天滚动。'],
              ['累计 C 端', '12,480', '该机构 C 端去重注册用户总数。统计区间：开通至今。'],
              ['新增 C 端', '320', '所选区间内首次注册的 C 端用户数。统计区间：随时间区间(默认今日)。'],
            ]}
          />
          <UsageCard
            title="内容"
            rows={[
              ['KP 总数', '40', '该机构已创建且未删除的 KP 总数(含已发/未发/已下架)。'],
              ['已发 / 未发 / 下架', '30 / 8 / 2', '按 KP 当前状态拆分。仅已发布参与 C 端检索。'],
              ['累计提问', '320k', 'C 端历史累计提问条数(含追问)。统计区间：开通至今。'],
            ]}
          />
          <UsageCard
            title="商业化"
            rows={[
              ['累计 GMV', '¥8.6w', '已支付订单金额合计(会员+永享)。统计区间：开通至今。'],
              ['当前会员', '860', '当前拥有有效会员权益的去重用户数。实时快照。'],
              ['永享订单', '540', '永享买断已支付订单数。统计区间：开通至今。'],
              ['付费转化', '6.9%', '付费用户 / 累计用户。统计区间：开通至今。'],
            ]}
          />
          <UsageCard
            title="LLM 用量（平台默认）"
            rows={[
              ['tokens', '1.2M', '该机构消耗的平台默认 LLM token 数。统计区间：近 7 天。'],
              ['调用次数', '32k', '模型被请求次数。统计区间：近 7 天。'],
              ['平均响应', '1.8s', '单次调用首字返回平均耗时。统计区间：近 7 天。'],
            ]}
          />
        </div>
      )}
    </>
  );
}
