// 原型清单 · 三端共用全宽组件（电脑端铺满，便于评审）
import { Icon } from '../Icon';
import { APP_META, PAGES, pagesByApp, type AppKey } from './data';
import { appBase } from './appBase';

const ORDER: AppKey[] = ['mobile', 'org', 'platform'];
const FONT = "'PingFang SC','Noto Sans SC',system-ui,-apple-system,'Microsoft YaHei',sans-serif";

const CSS = `
.pl-wrap *{box-sizing:border-box}
.pl-wrap{width:100%;min-height:100vh;background:#f6f4f0;font-family:${FONT};color:#14182a}
.pl-inner{max-width:1240px;margin:0 auto;padding:28px 28px 64px}
.pl-top{display:flex;align-items:center;gap:14px;margin-bottom:6px}
.pl-back{display:inline-flex;align-items:center;gap:4px;height:34px;padding:0 12px;border:1px solid #e3e5ee;border-radius:9px;background:#fff;color:#5b6178;font-size:13px;cursor:pointer}
.pl-back:hover{border-color:#c7ccf0;color:#3730a3}
.pl-h1{font-size:22px;font-weight:800;letter-spacing:.3px}
.pl-sub{font-size:13px;color:#9aa0b4;margin:2px 0 22px}
.pl-app{margin-top:26px}
.pl-apphead{display:flex;align-items:center;gap:10px;margin-bottom:13px}
.pl-dot{width:12px;height:12px;border-radius:4px;flex:none}
.pl-applabel{font-size:16px;font-weight:800}
.pl-count{font-size:12px;color:#9aa0b4;font-weight:600}
.pl-cur{font-size:11px;font-weight:700;color:#fff;border-radius:6px;padding:2px 7px}
.pl-host{margin-left:auto;font-size:11px;color:#9aa0b4;font-family:ui-monospace,monospace}
.pl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:14px}
.pl-card{border:1.5px solid #e7e8f0;border-radius:14px;background:#fff;overflow:hidden}
.pl-cardhd{display:flex;align-items:center;justify-content:space-between;padding:11px 14px;border-bottom:1px solid #f0f1f6}
.pl-mod{font-size:13.5px;font-weight:700}
.pl-modn{font-size:11px;color:#9aa0b4;font-weight:600}
.pl-row{display:flex;align-items:center;gap:10px;padding:9px 14px;cursor:pointer;border-top:1px solid #f6f7fb;transition:background .12s}
.pl-row:first-of-type{border-top:none}
.pl-row:hover{background:#f4f5ff}
.pl-name{font-size:13px;font-weight:600;color:#1f2440}
.pl-path{margin-left:auto;font-size:11.5px;color:#8b91a7;font-family:ui-monospace,monospace}
.pl-row:hover .pl-path{color:#4f46e5}
.pl-arr{display:inline-flex;color:#c2c7ee;flex:none}
.pl-row:hover .pl-arr{color:#4f46e5}
.pl-ext{font-size:10.5px;color:#b6bbcb;font-weight:700;flex:none}
`;

export function PrototypeList({
  current,
  onSameApp,
  onBack,
}: {
  current: AppKey;
  onSameApp: (path: string) => void;
  onBack?: () => void;
}) {
  const open = (e: { app: AppKey; path: string; linkPath?: string }) => {
    const dest = e.linkPath || e.path;
    if (e.app === current) onSameApp(dest);
    else window.open(appBase(e.app) + dest, '_blank', 'noopener');
  };

  return (
    <div className="pl-wrap">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="pl-inner">
        <div className="pl-top">
          {onBack && (
            <button className="pl-back" onClick={onBack}>
              <Icon id="i-chevL" w={16} h={16} />
              返回
            </button>
          )}
          <div className="pl-h1">原型清单 · 三端页面总览</div>
        </div>
        <div className="pl-sub">
          共 {PAGES.length} 个页面，覆盖三端全部原型。点击任一页面：本端直达，跨端新标签打开（本地按端口、线上按域名自动跳转）。
        </div>

        {ORDER.map((app) => {
          const meta = APP_META[app];
          const groups = pagesByApp(app);
          const count = groups.reduce((n, g) => n + g.items.length, 0);
          return (
            <div className="pl-app" key={app}>
              <div className="pl-apphead">
                <span className="pl-dot" style={{ background: meta.accent }} />
                <span className="pl-applabel">{meta.label}</span>
                <span className="pl-count">{count} 页</span>
                {app === current && (
                  <span className="pl-cur" style={{ background: meta.accent }}>
                    当前
                  </span>
                )}
                <span className="pl-host">:{meta.devPort}</span>
              </div>
              <div className="pl-grid">
                {groups.map((g) => (
                  <div className="pl-card" key={g.module}>
                    <div className="pl-cardhd">
                      <span className="pl-mod">{g.module}</span>
                      <span className="pl-modn">{g.items.length}</span>
                    </div>
                    {g.items.map((e) => {
                      const cross = e.app !== current;
                      return (
                        <div className="pl-row" key={e.path} onClick={() => open(e)} title={cross ? '跨端 · 新标签打开' : '本端跳转'}>
                          <span className="pl-name">{e.name}</span>
                          <span className="pl-path">{e.path}</span>
                          {cross ? <span className="pl-ext">↗</span> : (
                            <span className="pl-arr">
                              <Icon id="i-chevR" w={15} h={15} />
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
