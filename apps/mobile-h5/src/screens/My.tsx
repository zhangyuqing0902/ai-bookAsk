import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { useDemoStore } from '@aba/mock';
import { ServiceSheet } from '../ServiceSheet';

// 13 我的主页（设置式分组白卡 + 灰色线性图标）+ 联系客服 sheet
// 0613：头部 / 手机号绑定态随 store 动态；新增「我的纸书」「个人资料」入口；未绑手机号显示「绑定手机号」。
export function My() {
  const nav = useNavigate();
  const [service, setService] = useState(false);
  const user = useDemoStore((s) => s.user);
  const phoneBound = useDemoStore((s) => s.phoneBound);

  const isMember = user.membership.state === 'active' || user.membership.state === 'grace';
  const bookCount = user.bookGrants?.length ?? 0;

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
          <div className="my-head tap" onClick={() => nav('/me/profile')}>
            <div
              className="av"
              style={
                user.avatar
                  ? { backgroundImage: `url(${user.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : undefined
              }
            />
            <div style={{ flex: 1 }}>
              <div className="nm">
                {user.nickname || '未设置昵称'}
                {isMember && <span className="tag-s tag-amber">会员</span>}
              </div>
              <div className="ph">{phoneBound && user.phone ? user.phone : '未绑定手机号'}</div>
            </div>
            <span className="mc">
              <Icon id="i-chevR" w={18} h={18} />
            </span>
          </div>

          <div className="my-sec">会员</div>
          <div className="mlist">
            <div className="mrow tap" onClick={() => nav('/member/center')}>
              <span className="mi">
                <Icon id="i-crownO" />
              </span>
              <span className="ml">会员中心</span>
              <span className="mv">{isMember ? '已开通' : '未开通'}</span>
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
              <span className="mv">6</span>
              <span className="mc">
                <Icon id="i-chevR" />
              </span>
            </div>
            <div className="mrow tap" onClick={() => nav('/me/books')}>
              <span className="mi">
                <Icon id="i-qr" />
              </span>
              <span className="ml">我的纸书</span>
              <span className="mv">{bookCount}</span>
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
            {phoneBound ? (
              <div className="mrow tap" onClick={() => nav('/account')}>
                <span className="mi">
                  <Icon id="i-phone" />
                </span>
                <span className="ml">换绑手机号</span>
                <span className="mc">
                  <Icon id="i-chevR" />
                </span>
              </div>
            ) : (
              <div className="mrow tap" onClick={() => nav('/login/wechat-bind?from=me')}>
                <span className="mi">
                  <Icon id="i-phone" />
                </span>
                <span className="ml">绑定手机号</span>
                <span className="mv" style={{ color: 'var(--terra)' }}>未绑定</span>
                <span className="mc">
                  <Icon id="i-chevR" />
                </span>
              </div>
            )}
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

          <div className="my-sec">评审工具</div>
          <div className="mlist">
            <div className="mrow tap" onClick={() => nav('/prototypes')}>
              <span className="mi">
                <Icon id="i-grid" />
              </span>
              <span className="ml">原型清单</span>
              <span className="mv">三端</span>
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

      {/* 联系客服 sheet（复用共享组件） */}
      <ServiceSheet open={service} onClose={() => setService(false)} />
    </>
  );
}
