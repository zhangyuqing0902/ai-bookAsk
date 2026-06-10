import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@aba/ui';
import { MediaPreview, type PreviewItem } from '@aba/ui-mobile';
import { ORDERS } from '../data/orders';

// 我的订单 · 订单详情
export function OrderDetail() {
  const nav = useNavigate();
  const { id } = useParams();
  const [preview, setPreview] = useState<PreviewItem | null>(null);
  const o = ORDERS.find((x) => x.id === id);

  if (!o) {
    return (
      <>
        <div className="h5-top">
          <div className="ic tap" onClick={() => nav(-1)}>
            <Icon id="i-chevL" w={22} h={22} />
          </div>
          <div className="center">
            <div className="ttl">订单详情</div>
          </div>
          <div className="grp" />
        </div>
        <div className="pg">
          <div style={{ textAlign: 'center', color: 'var(--ink-3)', padding: '60px 24px' }}>订单不存在</div>
        </div>
      </>
    );
  }

  const isCode = o.type === '兑换码';

  // 兑换码：不叫「订单详情」，叫「详情」；不展示金额/订单编号/支付方式/下单付款时间
  if (isCode) {
    return (
      <>
        <div className="h5-top">
          <div className="ic tap" onClick={() => nav(-1)}>
            <Icon id="i-chevL" w={22} h={22} />
          </div>
          <div className="center">
            <div className="ttl">详情</div>
          </div>
          <div className="grp" />
        </div>
        <div className="pg">
          <div className="scrollY">
            <div className="od-card" style={{ marginTop: 18 }}>
              <div className="od-row">
                <span className="k">类型</span>
                <span className="v">兑换码核销</span>
              </div>
              <div className="od-row">
                <span className="k">兑换码</span>
                <span className="v" style={{ color: 'var(--ink)', fontWeight: 600, fontFamily: 'var(--mono)' }}>{o.code}</span>
              </div>
              <div className="od-row">
                <span className="k">兑换时间</span>
                <span className="v">{o.redeemTime}</span>
              </div>
            </div>
            <div className="od-card">
              <div className="od-h">兑换权益</div>
              <div className="od-row">
                <span className="k">权益</span>
                <span className="v">{o.title}</span>
              </div>
              <div className="od-row">
                <span className="k">会员时间区间</span>
                <span className="v">{o.memberFrom} 至 {o.memberTo}</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="h5-top">
        <div className="ic tap" onClick={() => nav(-1)}>
          <Icon id="i-chevL" w={22} h={22} />
        </div>
        <div className="center">
          <div className="ttl">订单详情</div>
        </div>
        <div className="grp" />
      </div>
      <div className="pg">
        <div className="scrollY">
          <div style={{ textAlign: 'center', padding: '22px 0 6px' }}>
            <span className={'tag-s ' + o.tag}>{o.type}</span>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 26, fontWeight: 500, marginTop: 10 }}>{o.amount}</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 4 }}>{o.title} · {o.status}</div>
          </div>

          <div className="od-card">
            <div className="od-h">基础信息</div>
            <div className="od-row">
              <span className="k">订单编号</span>
              <span className="v">{o.id}</span>
            </div>
            <div className="od-row">
              <span className="k">支付方式</span>
              <span className="v">{o.payMethod}</span>
            </div>
            {o.type === '会员' && (
              <div className="od-row">
                <span className="k">续费方式</span>
                <span className="v">{o.autoRenew ? '自动续费' : '手动支付'}</span>
              </div>
            )}
            <div className="od-row">
              <span className="k">下单时间</span>
              <span className="v">{o.orderTime}</span>
            </div>
            <div className="od-row">
              <span className="k">付款时间</span>
              <span className="v">{o.payTime}</span>
            </div>
          </div>

          {o.type === '会员' && (
            <div className="od-card">
              <div className="od-h">会员权益</div>
              <div className="od-row">
                <span className="k">会员有效期</span>
                <span className="v">{o.memberFrom} 至 {o.memberTo}</span>
              </div>
            </div>
          )}

          {o.type === '永享' && o.media && (
            <div className="od-card">
              <div className="od-h">永享内容</div>
              {/* 整行可点(封面或右侧区域)直接预览,不再单独「点击封面预览」文字按钮 */}
              <div className="od-yx tap" onClick={() => setPreview(o.media!)}>
                <div className="od-cover">
                  <Icon id={o.media.kind === 'image' ? 'i-image' : 'i-play'} w={26} h={26} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{o.media.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>关联知识产品 · {o.kp}</div>
                </div>
                <Icon id="i-chevR" w={18} h={18} style={{ marginLeft: 'auto', color: 'var(--ink-3)' }} />
              </div>
            </div>
          )}
        </div>
      </div>
      <MediaPreview item={preview} onClose={() => setPreview(null)} />
    </>
  );
}
