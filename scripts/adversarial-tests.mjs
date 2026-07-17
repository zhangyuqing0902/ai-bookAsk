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
// 0716 二批 #1.1：无论有无业务关系均为物理删除；hasRelations 仅决定确认弹窗是否展示影响声明
test('有业务关系的 KP 也是物理删除（带影响声明）', () => {
  const v = r.canPhysicallyDeleteKp({ orders: 1 });
  assert.equal(v.action, 'delete');
  assert.equal(v.hasRelations, true);
});
test('无关系 KP 物理删除（无影响声明）', () => {
  const v = r.canPhysicallyDeleteKp({});
  assert.equal(v.action, 'delete');
  assert.equal(v.hasRelations, false);
});
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
test('PRD 与功能清单均包含关键 0716 变更（0714 旧标记已降级）', () => {
  const prd = fs.readFileSync(new URL('../docs/prd-build/build-prd.js', import.meta.url), 'utf8');
  const feature = fs.readFileSync(new URL('../docs/feature-list-build/gen.py', import.meta.url), 'utf8');
  for (const token of ['0716周四', 'v1.7', '注册时间', '注册后第', '退款/售后', '纸书扫码解锁', '物理删除', '导出上限', '已失效', '无权限操作']) assert.ok(prd.includes(token), `PRD 缺少 ${token}`);
  for (const token of ['0716周四', '按注册时间', '注册后第', '退款/售后', '纸书扫码解锁', '占用量', '物理删除', '导出上限', '已失效', '无权限操作']) assert.ok(feature.includes(token), `功能清单缺少 ${token}`);
  // 旧批次标记必须已降级（生成器里不再产生 0714/0711/0715 标记）
  assert.ok(!prd.includes('0714周二') && !prd.includes('0711周六'), 'PRD 残留旧批次标记');
  assert.ok(!feature.includes('0714周二') && !feature.includes('0711周六') && !feature.includes('0715周三'), '功能清单残留旧批次标记');
  // v1.5/v1.4 及更早批次的实质内容仍应作为常规规则保留（抽查）
  for (const token of ['数据导出.xlsx', '取消关联，转为独立机构', '已失效']) assert.ok(feature.includes(token), `功能清单丢失既有规则 ${token}`);
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

// ==================== 0714 批 ====================
const read = (p) => fs.readFileSync(new URL(p, import.meta.url), 'utf8');
const readDir = (dir, ext = /\.tsx?$/) => {
  const base = new URL(dir, import.meta.url).pathname;
  const out = [];
  const walk = (d) => {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const full = `${d}/${f.name}`;
      if (f.isDirectory()) walk(full);
      else if (ext.test(f.name)) out.push([full, fs.readFileSync(full, 'utf8')]);
    }
  };
  walk(base);
  return out;
};

test('0714/导出底座：文件名规范 + 头部三行（导出时间/实时统计/筛选条件）', () => {
  const exporter = read('../packages/ui-admin/src/exportCsv.ts');
  for (const token of ['exportFilename', 'AI问书_全域', '数据导出.xlsx', '导出时间：', '实时统计时间：', '筛选条件：', 'buildWorkbook']) {
    assert.ok(exporter.includes(token), `导出底座缺少 ${token}`);
  }
});
test('0714/命名统一：平台后台视图无「归属机构」「所属机构」label', () => {
  for (const [file, src] of readDir('../apps/platform-admin/src/views')) {
    const code = src
      .replace(/\/\/[^\n]*/g, '') // 行注释不计
      .replace(/\/\*[\s\S]*?\*\//g, '') // 块/JSX 注释不计
      .replaceAll('无所属机构', ''); // 「平台（无所属机构）」是语义短语（=无归属），非列名 label
    assert.ok(!code.includes('归属机构'), `${file} 残留「归属机构」`);
    assert.ok(!code.includes('所属机构'), `${file} 残留「所属机构」`);
  }
});
test('0714/#17 订阅删除护栏：已过期不可删 + 用量强警告 + 删除≠退款', () => {
  const src = read('../apps/platform-admin/src/views/OrgDetail.tsx');
  for (const token of ['已过期', '删除将立即中断机构服务', '删除≠退款', '加油包']) assert.ok(src.includes(token), `OrgDetail 删除护栏缺少 ${token}`);
});
test('0714/#1 子机构可改上级/取消关联', () => {
  const src = read('../apps/platform-admin/src/views/OrgDetail.tsx');
  assert.ok(src.includes('取消关联'), '缺少「取消关联」入口');
});
test('0714/#19 账户名称创建后不可修改（编辑态 disabled，文案已按二轮反馈删除）', () => {
  const src = read('../apps/platform-admin/src/views/Accounts.tsx');
  // 行为保留：编辑态账户名输入框 disabled；界面说明文案已删（二轮 #1）
  assert.ok(/账户名[\s\S]*?disabled=\{!!edit\}/.test(src) || src.includes('disabled={!!edit}'), '账户名编辑态未 disabled');
  assert.ok(!src.includes('账户名称创建后不可修改'), '说明文案应已删除');
});
test('0714/#5.1 主控台与模型用量：父机构汇总说明', () => {
  for (const p of ['../apps/platform-admin/src/views/Dashboard.tsx', '../apps/platform-admin/src/views/ModelUsage.tsx']) {
    assert.match(read(p), /含子机构|已汇总子机构/, `${p} 缺少子机构汇总说明`);
  }
});
test('0714/#10 用量看板卡片标题去「（实时快照）」', () => {
  const src = read('../apps/platform-admin/src/views/OrgDetail.tsx');
  assert.ok(!src.includes('内容存量（实时快照）') && !src.includes('用户存量（实时快照）'));
});
test('0714/#14 角色权限：功能权限标签 + 删除入口文案', () => {
  const src = read('../apps/platform-admin/src/views/Roles.tsx');
  const code = src.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.ok(code.includes('功能权限'), '缺少「功能权限」标签');
  assert.ok(!code.includes('由创建入口页签决定'), '残留「由创建入口页签决定」界面文案');
});
test('0714/#4 反馈导出按钮不再带 XLSX 字样', () => {
  for (const p of ['../apps/platform-admin/src/views/GlobalFeedback.tsx', '../apps/org-admin/src/views/Feedback.tsx']) {
    assert.ok(!/导出\s*XLSX/i.test(read(p)), `${p} 按钮仍是「导出 XLSX」`);
  }
});
test('0714/#3 全域订单三时间区间筛选', () => {
  const src = read('../apps/platform-admin/src/views/GlobalOrders.tsx');
  for (const token of ['下单时间', '支付时间', '兑换时间', 'orders-ranges']) assert.ok(src.includes(token), `GlobalOrders 缺少 ${token}`);
});
test('0714/#13 兑换码弹窗：日历不被裁 + 界面提示文案已删', () => {
  const src = read('../apps/org-admin/src/views/Codes.tsx');
  assert.ok(src.includes('modal-overflow-mark'), '缺少 modal-overflow-mark');
  assert.ok(!src.includes('尚未到生效时间'), '批量生成弹窗残留生效期提示文案');
});
test('0714/#11 导入分享 KP 提示三条结构化', () => {
  const src = read('../apps/org-admin/src/views/KpList.tsx');
  for (const token of ['导入限制', '实时同步', '独立快照', 'Token 消耗归属接收方']) assert.ok(src.includes(token), `导入提示缺少 ${token}`);
});
test('0714/#18 KP 状态机：unlisted 类型 + 详情真改状态 + 前台失效态', () => {
  assert.ok(read('../packages/mock/src/types.ts').includes("'unlisted'"), 'Kp.status 缺 unlisted');
  const detail = read('../packages/ui-admin/src/KpDetailView.tsx');
  for (const token of ['onKpStatusChange', '已购永享用户']) assert.ok(detail.includes(token), `KpDetailView 缺少 ${token}`);
  assert.ok(read('../apps/mobile-h5/src/screens/MyBooks.tsx').includes('已下架，若有问题请联系客服'), 'MyBooks 缺下架拦截');
  assert.match(read('../apps/mobile-h5/src/screens/Yongxiang.tsx'), /已失效/, 'Yongxiang 缺已失效态');
});
test('0714/#8#9 移动端退款视觉：减灰 + 说明去红框', () => {
  const css = read('../packages/tokens/src/design/mobile-app.css');
  assert.ok(!css.includes('#F3F5F8'), 'refund-strip 仍是硬编码深灰');
  const note = css.slice(css.indexOf('.refund-policy-note'));
  const block = note.slice(0, note.indexOf('}') + 1);
  assert.ok(!block.includes('terra'), 'refund-policy-note 仍带红色警示样式');
});
test('0714/#2 旧导出签名清零 + spec 注册齐全', () => {
  for (const [file, src] of [...readDir('../apps/org-admin/src/views'), ...readDir('../apps/platform-admin/src/views')]) {
    assert.ok(!/exportWorkbook\(\s*['"`]/.test(src), `${file} 残留旧 exportWorkbook(filename,...) 签名`);
  }
  const orgIdx = read('../apps/org-admin/src/exports/index.ts');
  const pfIdx = read('../apps/platform-admin/src/exports/index.ts');
  assert.ok(orgIdx.includes('TEMPLATE_SPECS') && pfIdx.includes('TEMPLATE_SPECS'));
});

// ==================== 0715 批 ====================
test('0715/#1 KPI 环比对比时间独占第二行（不被截断）', () => {
  const css = read('../packages/tokens/src/design/admin-app.css');
  const m = css.slice(css.indexOf('.period-compare{'));
  const block = m.slice(0, m.indexOf('}') + 1);
  assert.ok(/flex-basis\s*:\s*100%/.test(block), 'period-compare 未设 flex-basis:100% 换行');
});
test('0715/#10 留存率三段口径重构（数据结构 + 视图 + 导出）', () => {
  const data = read('../apps/org-admin/src/data/dataBoard.ts');
  // 新结构：每节点独立 rate/sample/cutoff/status；批次含 nodes/updatedAt
  for (const t of ['RetentionNode', 'nodes:', 'updatedAt', "status: '可统计'", '待成熟']) {
    assert.ok(data.includes(t), `dataBoard 缺 ${t}`);
  }
  assert.ok(!data.includes("'7 日': BATCH_LATEST"), '兼容键 7 日 应已移除');
  const view = read('../apps/org-admin/src/views/DataBoard.tsx');
  // 0716 #15：「注册批次」更名「注册时间」
  for (const t of ['用户留存', '按注册时间', '注册时间', '尚未到统计时间', '数据更新至']) {
    assert.ok(view.includes(t), `DataBoard 视图缺 ${t}`);
  }
  assert.ok(!view.includes('留存率除外'), '区间分析应已删「留存率除外」例外说明');
  const idx = read('../apps/org-admin/src/exports/index.ts');
  assert.ok(idx.includes("retentionRange: '最新可统计'"), '导出默认批次应为最新可统计');
});
test('0715/#3 兑换码可兑换时间列可排序', () => {
  const src = read('../apps/org-admin/src/views/Codes.tsx');
  assert.ok(/可兑换时间'[\s\S]{0,120}sortValue/.test(src) || /sortValue[\s\S]{0,40}validFrom/.test(src), '可兑换时间列未加 sortValue');
});
test('0715/#4 归档文案去赠送/审计 + 纸书用户统计', () => {
  const src = read('../packages/ui-admin/src/KpDetailView.tsx');
  assert.ok(src.includes('bookUsers'), '缺 bookUsers prop');
  assert.ok(src.includes('纸书'), '归档弹窗未统计纸书用户');
  // 归档弹窗那段不再含「赠送」「与审计」
  const arch = src.slice(src.indexOf('归档'), src.indexOf('归档') + 1200);
  assert.ok(!/订单 \/ 赠送 \/ 分享 \/ 导入/.test(src), '归档列表仍含「赠送」');
  assert.ok(!src.includes('与审计记录'), '仍含「与审计记录」');
});
test('0715/#5 Dropdown 父机构 tag flex 居中', () => {
  const src = read('../packages/ui-admin/src/Dropdown.tsx');
  const m = src.slice(src.indexOf('renderOpt'));
  assert.ok(/inline-flex[\s\S]{0,80}alignItems:\s*'center'/.test(m), 'renderOpt 未用 inline-flex 居中容器');
  assert.ok(!/父机构[\s\S]{0,60}verticalAlign/.test(m), 'tag 仍用 verticalAlign（应改 flex 居中）');
});
test('0715/#6 主控台机构筛选默认文案改回「全部机构」', () => {
  const src = read('../apps/platform-admin/src/views/Dashboard.tsx');
  assert.ok(src.includes('label="全部机构"'), '主控台下拉 label 应为「全部机构」');
});
test('0715/#7 移动端订单双维度筛选（类型 + 状态）', () => {
  const src = read('../apps/mobile-h5/src/screens/Orders.tsx');
  for (const t of ['statusGroup', '待支付', '退款/售后', 'STATUS_CHIPS', 'fchip']) {
    assert.ok(src.includes(t), `Orders 缺 ${t}`);
  }
  const data = read('../apps/mobile-h5/src/data/orders.ts');
  assert.ok(data.includes("'待支付'") || data.includes('待支付'), 'orders 数据缺待支付演示单');
});
test('0715/#8 额度步进器 QtyStepper + 卡片', () => {
  const qs = read('../packages/ui-admin/src/QtyStepper.tsx');
  assert.ok(qs.includes('export function QtyStepper') || qs.includes('export const QtyStepper'), 'QtyStepper 未导出');
  const idx = read('../packages/ui-admin/src/index.ts');
  assert.ok(idx.includes('QtyStepper'), 'index 未导出 QtyStepper');
  const org = read('../apps/platform-admin/src/views/OrgDetail.tsx');
  assert.ok(org.includes('QtyStepper'), 'OrgDetail 额度未用 QtyStepper');
  const drawer = read('../packages/ui-admin/src/SubPackDrawer.tsx');
  assert.ok(drawer.includes('QtyStepper'), 'SubPackDrawer 加量额度未用 QtyStepper');
});
test('0716/#7#8#8.1 权限 Prompt 嵌套子项 + KP 与 Agent 同行重排', () => {
  const src = read('../apps/platform-admin/src/views/Roles.tsx');
  // 0716 #8：Prompt 编辑仅当 Agent 人设 = 可操作时才显示（嵌套子项，非置灰锁定）
  assert.ok(/agent\.manage'\][\s\S]{0,40}===\s*'write'/.test(src) && src.includes('showPromptChild'), '缺 Prompt 子项按 Agent 人设=可操作显示的逻辑');
  // 0716 #8：嵌套子项带缩进连接线
  assert.ok(src.includes('perm-child-wrap'), '缺 Prompt 嵌套子项容器 perm-child-wrap');
  // 0716 #7/#8.1：KP 与 Agent 人设同行两列（不再独占整行）
  assert.ok(src.includes('perm-agent-col') && !src.includes("gridColumn: '1 / -1'"), 'KP 应与 Agent 人设同行、不再独占整行');
});

let passed = 0;
for (const [name, fn] of tests) {
  try { fn(); passed += 1; console.log(`✓ ${name}`); }
  catch (error) { console.error(`✗ ${name}`); throw error; }
}
console.log(`\n${passed}/${tests.length} 条对抗性测试通过（V1.4 基线 + 0714 批）`);
