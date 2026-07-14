import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../packages/mock/src/rules.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const module = { exports: {} };
vm.runInNewContext(`(function(exports,module){${js}\n})(module.exports,module)`, { module, console, Date, Set, Error });
const r = module.exports;

// 机构主数据 / 父子三态（platformOrgs.ts，自包含无外部 import）
const poSource = fs.readFileSync(new URL('../packages/mock/src/data/platformOrgs.ts', import.meta.url), 'utf8');
const poJs = ts.transpileModule(poSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const poModule = { exports: {} };
vm.runInNewContext(`(function(exports,module){${poJs}\n})(module.exports,module)`, { module: poModule, console, Set, Error });
const po = poModule.exports;

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('域名前缀会规范化并拼接二级域名', () => assert.equal(r.buildTenantDomain(' Test '), 'test-aba.一级域名.cn'));
test('域名前缀拒绝首尾连字符', () => assert.equal(r.validateDomainPrefix('-test').valid, false));
test('域名前缀按规范化结果判重', () => assert.equal(r.validateDomainPrefix('TEST', ['test']).valid, false));
test('本地环境域名后缀动态取 localhost', () => assert.equal(r.buildEnvironmentTenantDomain('test', 'localhost'), 'test-aba.localhost'));
test('线上环境域名后缀动态取当前根域名', () => {
  assert.equal(r.buildEnvironmentTenantDomain('test', 'admin.demo.example.cn'), 'test-aba.example.cn');
  assert.equal(r.buildEnvironmentTenantDomain('test', 'admin.demo.example.com.cn'), 'test-aba.example.com.cn');
});
test('机构列表只展示二级机构域名', () => assert.equal(r.secondaryTenantDomain(' Test '), 'test-aba'));
test('同域三端路由固定', () => assert.deepEqual({ ...r.buildTenantUrls('test', 'KP01') }, {
  h5: 'https://test-aba.一级域名.cn/', admin: 'https://test-aba.一级域名.cn/admin/', kp: 'https://test-aba.一级域名.cn/kp/KP01',
}));
test('今日上一周期取昨日相同已过时长', () => {
  const p = r.previousPeriod(new Date('2026-07-11T00:00:00+08:00'), new Date('2026-07-11T09:30:00+08:00'), 'today');
  assert.equal(p.start.toISOString(), '2026-07-09T16:00:00.000Z');
  assert.equal(p.end.toISOString(), '2026-07-10T01:30:00.000Z');
});
test('计数上期为零不伪造涨幅', () => assert.equal(r.compareMetric(10, 0, 'count').label, '上期为0，暂无可比增幅'));
test('留存率变化使用百分点', () => assert.equal(r.compareMetric(31.2, 29.7, 'rate').label, '+1.5 个百分点'));
test('精确机构默认不汇总下级', () => assert.deepEqual([...r.resolveOrgScope('p', false, [{ id: 'p' }, { id: 'c', parentId: 'p' }])], ['p']));
test('含下级显式扩展机构范围', () => assert.deepEqual([...r.resolveOrgScope('p', true, [{ id: 'p' }, { id: 'c', parentId: 'p' }])], ['p', 'c']));
test('停用父机构不级联子机构', () => assert.deepEqual({ ...r.suspensionImpact(true) }, {
  cascades: false,
  message: '停用父机构仅暂停该机构自身服务，不自动停用子机构；如需批量停用必须逐家确认影响。',
}));
test('上级机构不能选自身或后代', () => {
  const orgs = [{ id: 'p' }, { id: 'c', parentId: 'p' }, { id: 'g', parentId: 'c' }];
  assert.equal(r.parentEligibility('p', 'p', orgs).allowed, false);
  assert.equal(r.parentEligibility('g', 'p', orgs).allowed, false);
});
test('存在业务关系的 KP 只能归档', () => assert.equal(r.canPhysicallyDeleteKp({ orders: 1 }).action, 'archive'));
test('无关系 KP 可物理删除', () => assert.equal(r.canPhysicallyDeleteKp({}).action, 'delete'));
test('实时分享不占 KP/存储但消费接收方 Token', () => assert.deepEqual({ ...r.sharePolicy('realtime') }, {
  consumesKp: false, consumesStorage: false, consumesToken: true, editable: false, showQrShare: false,
}));
test('撤销后实时导入失效、快照保留', () => {
  assert.equal(r.shareAccessAfterRevocation('realtime'), 'revoked');
  assert.equal(r.shareAccessAfterRevocation('snapshot'), 'retained');
});
test('全额退款仅撤销订单唯一来源权益', () => {
  assert.equal(r.refundEntitlementDecision('full', true), 'revoke');
  assert.equal(r.refundEntitlementDecision('full', false), 'retain');
  assert.equal(r.refundEntitlementDecision('partial', true), 'retain');
});
test('新订阅保留占用、重置 Token 周期用量并阻止超额新增', () => assert.equal(
  JSON.stringify(r.applySubscriptionTransition({ kp: 30, storage: 62, token: 1.76 }, { kp: 10, storage: 20, token: 0.5 })),
  JSON.stringify({ usage: { kp: 30, storage: 62, token: 0 }, blocked: { kp: true, storage: true, token: false } }),
));
test('兑换码校验生效窗与机构状态', () => {
  const start = new Date('2026-07-01'); const end = new Date('2026-07-31');
  assert.equal(r.isRedeemable(new Date('2026-06-30'), start, end, true).allowed, false);
  assert.equal(r.isRedeemable(new Date('2026-07-11'), start, end, false).reason, '机构已停用');
});
test('会员续期从当前付费到期日叠加，不计过期后缓冲期', () => {
  const next = r.stackMembershipExpiry(new Date('2026-07-11'), new Date('2026-07-20'), 10 * 86400000);
  assert.equal(next.toISOString().slice(0, 10), '2026-07-30');
});
test('移动登录采用 7 天滑动有效期', () => {
  const last = new Date('2026-07-01T00:00:00Z');
  assert.equal(r.isSlidingSessionValid(last, new Date('2026-07-08T00:00:00Z')), true);
  assert.equal(r.isSlidingSessionValid(last, new Date('2026-07-08T00:00:01Z')), false);
});
test('上一周期灰字给出精确的紧邻等长区间', () => {
  assert.equal(r.comparisonPeriodLabel(7, new Date('2026-07-11T12:00:00+08:00')), '对比 06-28—07-04');
});
test('兑换码未生效提示包含可行动时间', () => {
  const redeem = fs.readFileSync(new URL('../apps/mobile-h5/src/screens/Redeem.tsx', import.meta.url), 'utf8');
  assert.match(redeem, /该兑换码尚未到生效时间，请于 .* 后再试/);
});
test('统一 XLSX 导出含标题、时间、深色表头、冻结与换行', () => {
  const exporter = fs.readFileSync(new URL('../packages/ui-admin/src/exportCsv.ts', import.meta.url), 'utf8');
  for (const token of ['exportWorkbook', 'FF3730A3', "state: 'frozen'", 'wrapText', 'exportedAt']) assert.ok(exporter.includes(token), `缺少 ${token}`);
});
test('PRD 与功能清单均包含关键 0711 变更', () => {
  const prd = fs.readFileSync(new URL('../docs/prd-build/build-prd.js', import.meta.url), 'utf8');
  const feature = fs.readFileSync(new URL('../docs/feature-list-build/gen.py', import.meta.url), 'utf8');
  for (const token of ['0711周六', '12 个明确导出文件', '未到生效时间', '停用父机构默认不级联']) assert.ok(prd.includes(token), `PRD 缺少 ${token}`);
  for (const token of ['0711周六', '未到生效时间', '不自动停用子机构', '全域用户 XLSX']) assert.ok(feature.includes(token), `功能清单缺少 ${token}`);
});

test('机构角色三态：有下级=父机构、有上级=子机构、独立=普通', () => {
  assert.equal(po.orgRoleByName('XX 出版集团'), 'parent');
  assert.equal(po.orgRoleByName('YY 教育'), 'child');
  assert.equal(po.orgRoleByName('EE 美术出版'), 'ordinary');
  assert.equal(po.orgRoleByName('未登记机构'), 'ordinary');
});
test('机构筛选选项标签仅父机构加后缀，子机构 / 普通机构 / 「全部」均不加', () => {
  assert.equal(po.orgOptionLabel('XX 出版集团'), 'XX 出版集团（父机构）');
  assert.equal(po.orgOptionLabel('YY 教育'), 'YY 教育'); // 子机构不加标签
  assert.equal(po.orgOptionLabel('EE 美术出版'), 'EE 美术出版');
  assert.equal(po.orgOptionLabel('全部机构'), '全部机构');
});
test('orgOptionValue 剥离父/子机构标签且与 label 往返一致，不再误剥离旧「副机构」', () => {
  for (const n of ['XX 出版集团', 'YY 教育', 'EE 美术出版']) assert.equal(po.orgOptionValue(po.orgOptionLabel(n)), n);
  assert.equal(po.orgOptionValue('某机构（副机构）'), '某机构（副机构）');
});
test('metricHelp 快照不追加环比、今日/区间追加对应周期与单位规则', () => {
  assert.match(r.metricHelp('定义。', 'snapshot'), /不与上一周期比较/);
  assert.match(r.metricHelp('定义。', 'today'), /今日按 00:00 至当前时刻统计/);
  assert.match(r.metricHelp('定义。', 'range', 'rate'), /百分点/);
  assert.match(r.metricHelp('定义。', 'range', 'duration'), /绝对时长差/);
});
test('compareMetric 率/时长上期为0仍给绝对差、计数类给零基线提示', () => {
  assert.equal(r.compareMetric(3.2, 0, 'rate').label, '+3.2 个百分点');
  assert.equal(r.compareMetric(1.5, 0, 'duration').label, '+1.5 秒');
  assert.equal(r.compareMetric(10, 0, 'count').comparable, false);
});
test('停用子机构提示不影响父机构或其他子机构（措辞已由「副机构」改为「子机构」）', () => {
  assert.match(r.suspensionImpact(false).message, /停用子机构/);
  assert.ok(!r.suspensionImpact(false).message.includes('副机构'));
});

let passed = 0;
for (const [name, fn] of tests) {
  try { fn(); passed += 1; console.log(`✓ ${name}`); }
  catch (error) { console.error(`✗ ${name}`); throw error; }
}
console.log(`\n${passed}/${tests.length} 条 V1.4 对抗性测试通过`);
