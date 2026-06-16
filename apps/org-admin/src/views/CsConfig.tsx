import { Icon, toast } from '@aba/ui';
import { TextInput } from '@aba/ui-admin';

// 机构后台 · 客服配置
export function CsConfig() {
  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">客服配置</div>
        </div>
      </div>
      <div className="fm-card">
        <div className="fm-row">
          <div className="lab">客服二维码<span className="req">*</span></div>
          <div className="ctl">
            <div className="upbox" style={{ maxWidth: 160 }} onClick={() => toast('上传客服二维码')}>
              <Icon id="i-qr" />
              <div className="nowrap">上传企微 / 个微二维码</div>
            </div>
          </div>
        </div>
        <div className="fm-row">
          <div className="lab">客服电话</div>
          <div className="ctl">
            <TextInput placeholder="非必填,有则展示" style={{ maxWidth: 280 }} />
          </div>
        </div>
        <div className="fm-row">
          <div className="lab">客服邮箱</div>
          <div className="ctl">
            <TextInput placeholder="非必填,有则展示" style={{ maxWidth: 280 }} />
          </div>
        </div>
        <div className="fm-row" style={{ borderTop: 'none', paddingTop: 6 }}>
          <div className="lab" />
          <div className="ctl">
            <button className="btn btn-primary btn-sm" onClick={() => toast('已保存')}>
              保存
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
