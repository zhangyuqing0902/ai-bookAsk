import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';

// 13 我的主页（设置式分组白卡 + 灰色线性图标）+ 联系客服 sheet
export function My() {
  const nav = useNavigate();
  const [service, setService] = useState(false);
  return (
    <>
      <div className="h5-top">
        <div className="ic tap" onClick={() => nav(-1)}>
          <Icon id="i-chevL" w={22} h={22} />
        </div>
        <div className="center">
          <div className="ttl">我的</div>
        </div>
        <div className="grp" />
      </div>
      <div className="pg">
        <div className="scrollY">
          <div className="my-head">
            <div className="av" />
            <div>
              <div className="nm">
                微信昵称A <span className="tag-s tag-amber">会员</span>
              </div>
              <div className="ph">138****8888</div>
            </div>
          </div>

          <div className="my-sec">会员</div>
          <div className="mlist">
            <div className="mrow tap" onClick={() => nav('/member/center')}>
              <span className="mi">
                <Icon id="i-crownO" />
              </span>
              <span className="ml">会员中心</span>
              <span className="mv">已开通</span>
              <span className="mc">
                <Icon id="i-chevR" />
              </span>
            </div>
          </div>

          <div className="my-sec">我的</div>
          <div className="mlist">
            <div className="mrow tap" onClick={() => nav('/me/yongxiang')}>
              <span className="mi">
                <Icon id="i-lock" />
              </span>
              <span className="ml">我的永享</span>
              <span className="mv">3</span>
              <span className="mc">
                <Icon id="i-chevR" />
              </span>
            </div>
            <div className="mrow tap" onClick={() => nav('/me/orders')}>
              <span className="mi">
                <Icon id="i-doc" />
              </span>
              <span className="ml">我的订单</span>
              <span className="mc">
                <Icon id="i-chevR" />
              </span>
            </div>
            <div className="mrow tap" onClick={() => nav('/me/redeem')}>
              <span className="mi">
                <Icon id="i-ticket" />
              </span>
              <span className="ml">兑换码</span>
              <span className="mc">
                <Icon id="i-chevR" />
              </span>
            </div>
          </div>

          <div className="my-sec">账户与帮助</div>
          <div className="mlist">
            <div className="mrow tap" onClick={() => nav('/account')}>
              <span className="mi">
                <Icon id="i-phone" />
              </span>
              <span className="ml">换绑手机号</span>
              <span className="mc">
                <Icon id="i-chevR" />
              </span>
            </div>
            <div className="mrow tap" onClick={() => setService(true)}>
              <span className="mi">
                <Icon id="i-headset" />
              </span>
              <span className="ml">联系客服</span>
              <span className="mc">
                <Icon id="i-chevR" />
              </span>
            </div>
            <div className="mrow tap" onClick={() => nav('/agreement/terms')}>
              <span className="mi">
                <Icon id="i-file2" />
              </span>
              <span className="ml">用户协议</span>
              <span className="mc">
                <Icon id="i-chevR" />
              </span>
            </div>
            <div className="mrow tap" onClick={() => nav('/agreement/privacy')}>
              <span className="mi">
                <Icon id="i-shield" />
              </span>
              <span className="ml">隐私政策</span>
              <span className="mc">
                <Icon id="i-chevR" />
              </span>
            </div>
          </div>

          <div className="mlist" style={{ marginTop: 18 }}>
            <div
              className="mrow tap"
              onClick={() => {
                toast('已退出登录');
                setTimeout(() => nav('/'), 700);
              }}
            >
              <span className="mi">
                <Icon id="i-logout" />
              </span>
              <span className="ml">退出登录</span>
            </div>
          </div>

          <div className="my-foot">
            内容由 AI 生成,请仔细甄别并合法使用
            <br />
            AI 问书 · v1.0
          </div>
        </div>
      </div>

      {/* 联系客服 sheet */}
      <div className={'ov' + (service ? ' open' : '')}>
        <div className="scrim" onClick={() => setService(false)} />
        <div className="pw">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--serif-cjk)', fontWeight: 700, fontSize: 16 }}>联系客服</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 6 }}>扫码添加客服企微,或电话 / 邮件联系</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '20px 0 8px' }}>
            <div
              style={{
                width: 150,
                height: 150,
                borderRadius: 14,
                background: 'repeating-linear-gradient(135deg,#E7EAF2 0 8px,#EEF1F7 8px 16px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ink-3)',
              }}
            >
              <Icon id="i-qr" w={40} h={40} />
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>客服电话 400-800-8888</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>客服邮箱 help@aiwenshu.com</div>
          </div>
        </div>
      </div>
    </>
  );
}
