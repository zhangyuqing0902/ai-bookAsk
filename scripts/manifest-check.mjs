// 原型清单校验：扫描三端 App.tsx 真实 <Route path>，与 packages/ui/src/manifest/data.ts 的 PAGES 比对。
// 用法：node scripts/manifest-check.mjs   —— 输出「新增未登记 / 已删残留」，全部一致则退出码 0。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APPS = { mobile: 'apps/mobile-h5', org: 'apps/org-admin', platform: 'apps/platform-admin' };
const IGNORE = new Set(['*', '/prototypes']); // 兜底路由 + 清单页自身

// 真实路由：从各 App.tsx 提取 path="..."
function realRoutes(appKey) {
  const txt = fs.readFileSync(path.join(ROOT, APPS[appKey], 'src/App.tsx'), 'utf8');
  const set = new Set();
  for (const m of txt.matchAll(/path="([^"]+)"/g)) if (!IGNORE.has(m[1])) set.add(m[1]);
  return set;
}

// 清单：从 data.ts 的 PAGES 提取 { app, path }
function manifestRoutes() {
  const txt = fs.readFileSync(path.join(ROOT, 'packages/ui/src/manifest/data.ts'), 'utf8');
  const map = { mobile: new Set(), org: new Set(), platform: new Set() };
  for (const m of txt.matchAll(/app:\s*'(mobile|org|platform)'[\s\S]*?path:\s*'([^']+)'/g)) {
    map[m[1]].add(m[2]);
  }
  return map;
}

const man = manifestRoutes();
let problems = 0;
for (const app of Object.keys(APPS)) {
  const real = realRoutes(app);
  const listed = man[app];
  const missing = [...real].filter((p) => !listed.has(p)); // 代码有、清单无
  const stale = [...listed].filter((p) => !real.has(p)); // 清单有、代码无
  const ok = !missing.length && !stale.length;
  console.log(`\n[${app}] 真实路由 ${real.size} · 清单 ${listed.size} ${ok ? '✓ 一致' : '✗ 有差异'}`);
  if (missing.length) {
    problems += missing.length;
    console.log('  新增未登记（请补进 data.ts）：', missing.join('  '));
  }
  if (stale.length) {
    problems += stale.length;
    console.log('  已删残留（请从 data.ts 移除）：', stale.join('  '));
  }
}
console.log(problems ? `\n共 ${problems} 处需同步。` : '\n全部一致，无需同步。');
process.exit(problems ? 1 : 0);
