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
// 0806-2：率类环比展示统一「%」符号（语义仍为绝对差），原「个百分点」文案废弃
test('留存率变化为绝对差并以 % 符号展示', () => assert.equal(r.compareMetric(31.2, 29.7, 'rate').label, '+1.5%'));
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
// 0717 #1.5：全平台删除统一为逻辑删除（软删）；hasRelations 仅决定确认弹窗是否展示影响声明
test('有业务关系的 KP 删除＝逻辑删除（带影响声明）', () => {
  const v = r.canDeleteKp({ orders: 1 });
  assert.equal(v.action, 'soft-delete');
  assert.equal(v.hasRelations, true);
});
test('无关系 KP 删除同为逻辑删除（无影响声明）', () => {
  const v = r.canDeleteKp({});
  assert.equal(v.action, 'soft-delete');
  assert.equal(v.hasRelations, false);
});
// 0812：实时分享改为占接收方 KP（存储仍不占、Token 仍归接收方）
test('实时分享占 KP、不占存储、消费接收方 Token', () => assert.deepEqual({ ...r.sharePolicy('realtime') }, {
  consumesKp: true, consumesStorage: false, consumesToken: true, editable: false, showQrShare: false,
}));
test('快照分享占 KP/存储、Token 归接收方', () => assert.deepEqual({ ...r.sharePolicy('snapshot') }, {
  consumesKp: true, consumesStorage: true, consumesToken: true, editable: true, showQrShare: true,
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
test('PRD 与功能清单均包含各自批次变更（版本号从生成器实读，不写死；旧标记已降级）', () => {
  const prd = fs.readFileSync(new URL('../docs/prd-build/build-prd.js', import.meta.url), 'utf8');
  const feature = fs.readFileSync(new URL('../docs/feature-list-build/gen.py', import.meta.url), 'utf8');
  const prdVer = (prd.match(/版本 (v[\d.]+)　/) || [])[1];
  assert.ok(prdVer, 'PRD 封面未能解析出版本号');
  for (const token of ['0717周五', prdVer, '逻辑删除', 'KP 状态 × 前台影响矩阵', '跳转规则①', '知识 KP 二维码', '已下架，若有问题请联系客服', '已失效，若有问题请联系客服', '重新上架自动恢复', '草稿 / 已发布 / 已下架', 'not-allowed', '二次确认', '吸顶']) assert.ok(prd.includes(token), `PRD 缺少 ${token}`);
  const featVer = (feature.match(/版本：(v[\d.]+) ·/) || [])[1];
  assert.ok(featVer, '功能清单未能解析出版本号');
  // 0806：本批变更标记锚从生成器实读 CHANGE_DATE（原写死「0718周六」——0722 批冻结旧标记后即失效的旧账，一并修正）
  const featChangeDate = (feature.match(/CHANGE_DATE = "([^"]+)"/) || [])[1];
  assert.ok(featChangeDate, '功能清单未能解析出 CHANGE_DATE');
  for (const token of [featChangeDate, featVer, '逻辑删除', 'KP 状态 × 前台影响矩阵', '跳转规则①', '知识 KP 二维码', '已下架，若有问题请联系客服', '已失效，若有问题请联系客服', '重新上架自动恢复', '按注册时间', '注册后第', '纸书扫码解锁', '无权限操作']) assert.ok(feature.includes(token), `功能清单缺少 ${token}`);
  // 「物理删除」只允许以「不出现『物理删除』」的否定句式存在（口径声明），不得作为规则本身
  const featPhysical = feature.split('物理删除').length - 1;
  assert.ok(featPhysical <= 1 && feature.includes('不出现「物理删除'), '功能清单仍把「物理删除」当规则描述');
  // 旧批次标记必须已降级（生成器里不再产生 0714/0715/0716 标记；PRD 摘要章按批次保留历史标记，仅清单校验）
  assert.ok(!feature.includes('0714周二') && !feature.includes('0715周三') && !feature.includes('0716周四') && !feature.includes('0717周五'), '功能清单残留旧批次标记');
  // 早批次的实质内容仍应作为常规规则保留（抽查）
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
  assert.equal(r.compareMetric(3.2, 0, 'rate').label, '+3.2%'); // 0806-2：率类差值统一 % 符号
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
  // 0718 #6：写死的 RETENTION 三档改为按真实日期联动推算（retentionForDay / retentionForPreset / retentionFor）
  for (const t of ['RetentionNode', 'retentionForDay', 'retentionForPreset', 'retentionFor', 'updatedAt', "status: '可统计'", '待成熟']) {
    assert.ok(data.includes(t), `dataBoard 缺 ${t}`);
  }
  assert.ok(!data.includes("'7 日': BATCH_LATEST"), '兼容键 7 日 应已移除');
  assert.ok(!data.includes('BATCH_LATEST'), '写死的批次假数据应已移除');
  const view = read('../apps/org-admin/src/views/DataBoard.tsx');
  // 0716 #15：「注册批次」更名「注册时间」
  // 0717 二批 #8.3：「数据更新至」脚注已删除,不再断言
  for (const t of ['用户留存', '按注册时间', '注册时间', '尚未到统计时间']) {
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
test('0715/#6 + 0806-3 主控台机构筛选：多选默认全选回填「全部机构」', () => {
  // 0806-3（并行会话改造）：平台主控台机构筛选由单选 Dropdown 改多选，全选回填「全部机构」与原口径一致
  const src = read('../apps/platform-admin/src/views/Dashboard.tsx');
  assert.ok(src.includes("allSelected ? '全部机构'"), '多选全选态应回填「全部机构」');
});
test('0715/#7 移动端订单双维度筛选（类型 + 状态）', () => {
  // 0812：statusGroup 单值映射改 matchesChip 双维谓词（一单可命中多个筛选）
  const src = read('../apps/mobile-h5/src/screens/Orders.tsx');
  for (const t of ['matchesChip', '待支付', '退款/售后', 'STATUS_CHIPS', 'fchip']) {
    assert.ok(src.includes(t), `Orders 缺 ${t}`);
  }
  const data = read('../apps/mobile-h5/src/data/orders.ts');
  assert.ok(data.includes("'待支付'") || data.includes('待支付'), 'orders 数据缺待支付演示单');
});
test('0812 订单双维谓词：已支付含退款态、退款/售后含退款中', () => {
  const src = read('../apps/mobile-h5/src/screens/Orders.tsx');
  assert.ok(/REFUNDISH = \['退款中', '部分退款', '全额退款'\]/.test(src), '缺退款态集合 REFUNDISH');
  assert.ok(src.includes("s === '已支付' || s === '已核销' || REFUNDISH.includes(s)"), '「已支付」谓词应含已支付/已核销/退款态');
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

// ==================== 0717 批 ====================
test('0717/#1.1 我的纸书：下架一律拦截 + 已下架/已解锁双标', () => {
  const src = read('../apps/mobile-h5/src/screens/MyBooks.tsx');
  assert.ok(src.includes('if (b.offShelf) {'), '下架未做一律拦截');
  assert.ok(!src.includes('b.offShelf && !b.unlocked'), '仍保留「已解锁放行」旧逻辑');
  // 0718 #1(v2)：双标同显——已解锁在封面右上(bk-tag-corner)，已下架/已失效在名称后(bk-st)
  assert.ok(src.includes('bk-tag-corner') && src.includes('bk-st'), '缺已下架/已失效+已解锁双标同显');
});
test('0717/#1.4 我的永享：下架同样拦截并标「已下架」', () => {
  const src = read('../apps/mobile-h5/src/screens/Yongxiang.tsx');
  for (const t of ["=== 'unlisted'", 'yx-off', '该内容已下架，若有问题请联系客服']) assert.ok(src.includes(t), `缺 ${t}`);
});
test('0717/#1.3/#1.6 KP 前台入口判活 + 跳转规则①', () => {
  const gate = read('../apps/mobile-h5/src/screens/KpGate.tsx');
  for (const t of ['已下架，若有问题请联系客服', '已失效，若有问题请联系客服', "status === 'published'", '3000', "role === 'guest'", '本机构暂无可进入的知识 KP']) assert.ok(gate.includes(t), `KpGate 缺 ${t}`);
  const app = read('../apps/mobile-h5/src/App.tsx');
  assert.ok(app.includes('/kp/:kpId'), '路由未注册 /kp/:kpId');
  const manifest = read('../packages/ui/src/manifest/data.ts');
  assert.ok(manifest.includes('/kp/:kpId'), '原型清单未登记 /kp/:kpId');
  const books = read('../apps/mobile-h5/src/screens/MyBooks.tsx');
  assert.ok(books.includes('已识别知识 KP 二维码') && books.includes('/kp/'), '扫一扫未接判活入口（且用词须为「知识 KP 二维码」）');
});
test('0717/#1.5 删除弹窗为逻辑删除口径（不再「彻底删除/不可恢复」）', () => {
  const src = read('../packages/ui-admin/src/KpDetailView.tssx'.replace('.tssx', '.tsx'));
  assert.ok(src.includes('逻辑删除'), '缺逻辑删除口径');
  assert.ok(!src.includes('彻底删除') && !src.includes('物理删除'), '弹窗仍有物理删除语义文案');
  assert.ok(src.includes('重新发布后自动恢复'), '下架弹窗未明示权益恢复');
});
test('0717/#2 状态命名统一「草稿/已发布/已下架」+ 按钮修订', () => {
  const view = read('../packages/ui-admin/src/KpDetailView.tsx');
  assert.ok(view.includes("draft: { label: '草稿'"), '详情 draft 标签未统一为草稿');
  assert.ok(view.includes("lifecycle === 'draft'") && view.includes('发布知识 KP'), '草稿缺「发布」按钮');
  const list = read('../apps/org-admin/src/views/KpList.tsx');
  assert.ok(list.includes("'草稿', '已发布', '已下架'"), '机构列表筛选未统一命名');
  assert.ok(!list.includes("'未发'"), '机构列表残留「未发」');
  const plat = read('../apps/platform-admin/src/data/kpStatus.ts');
  assert.ok(plat.includes('草稿'), '平台状态映射缺「草稿」');
});
test('0717/#2.3 机构列表与详情同源 + 实时分享双视角演示数据', () => {
  const data = read('../apps/org-admin/src/data/kps.ts');
  // 0806 修正旧账：0722 批清理 shareRole（sharer/consumer）死字段后，双视角改由 shareMode 表达（realtime=接收方只读 / snapshot=快照可编辑），断言同步
  for (const t of ["'draft'", "'published'", "'unlisted'", "'realtime'", "'snapshot'"]) assert.ok(data.includes(t), `机构 KP 数据缺 ${t}`);
  const list = read('../apps/org-admin/src/views/KpList.tsx');
  assert.ok(list.includes('ORG_KPS'), '列表未接同源数据');
  const detail = read('../apps/org-admin/src/views/KpDetail.tsx');
  assert.ok(detail.includes('ORG_KPS') && detail.includes('kpName={entry.name}'), '详情未接同源数据');
  const gkd = read('../apps/platform-admin/src/views/GlobalKpDetail.tsx');
  assert.ok(gkd.includes('KPS.find') && gkd.includes('kpName={kp.name}'), '平台详情未与列表同源');
});
test('0717/#4 实时分享消费者只读：表单禁用置灰 + 仅复制链接可操作', () => {
  const view = read('../packages/ui-admin/src/KpDetailView.tsx');
  assert.ok((view.match(/disabled=\{isRealtime\}/g) ?? []).length >= 4, '基础信息输入框/下拉未按 isRealtime 禁用');
  assert.ok(view.includes("(isRealtime ? ' off' : '')"), '定价单选未置灰');
  const css = read('../packages/tokens/src/design/proto-admin.css');
  for (const t of ['.inp2.disabled input', '.sel.sel-disabled', '.radio-list .radio-opt.off']) assert.ok(css.includes(t), `缺禁用样式 ${t}`);
  const fields = read('../packages/ui-admin/src/Fields.tsx');
  assert.ok(fields.includes("disabled ? ' disabled'"), 'TextInput 未挂 .disabled 外层样式');
});
test('0717/#5 基础权益切换二次确认后才生效', () => {
  const view = read('../packages/ui-admin/src/KpDetailView.tsx');
  assert.ok(view.includes('switchTier') && view.includes('确认切换'), '缺切换二次确认');
  assert.ok(view.includes('switchTier(0)') && view.includes('switchTier(1)'), '单选未走确认流');
});
test('0717/#6 权限子项去掉紫色背景块', () => {
  const css = read('../packages/tokens/src/design/proto-admin.css');
  const i = css.indexOf('.perm-item.perm-item-child{');
  const block = css.slice(i, css.indexOf('}', i) + 1);
  assert.ok(i >= 0 && !block.includes('indigo-soft') && !block.includes('background'), '子权限行仍有背景块');
});
test('0717/#7 调价须知标题与文案同一行（「：」衔接）', () => {
  const src = read('../apps/org-admin/src/views/SysConfig.tsx');
  assert.ok(src.includes('调价须知：'), '调价须知未合并同行');
});
test('0718/#5 留存筛选改分段控件 + 自定义注册日 chip 回显', () => {
  const board = read('../apps/org-admin/src/views/DataBoard.tsx');
  // 0718 #5：白色下拉废弃，改「区间分析」同款 seg 分段控件（预设三档 + 自定义弹单日日历）
  assert.ok(board.includes('RETENTION_PRESETS') && board.includes('seg seg-range'), '留存筛选未改分段控件');
  assert.ok(!board.includes('<Dropdown'), '留存筛选仍在用白色下拉 Dropdown');
  // 自定义选定后以 dr-applied chip 回显日期、可 ✕ 回到「最新可统计」（同 RangePicker 自定义回显）
  assert.ok(board.includes('dr-applied') && board.includes('fmtD(retDay)') && board.includes('resetRetDay'), '自定义注册日未以 chip 回显');
  // 0718 #2：日期回显 chip 在分段控件左侧（与 RangePicker 回显位置一致）
  const head = board.slice(board.indexOf('dash-section-head'), board.indexOf('retCalOpen &&'));
  assert.ok(head.indexOf('dr-applied') < head.indexOf('seg seg-range'), '回显 chip 未移到分段控件左侧');
});
test('0718/#6b 留存样本口径：单注册日批次三节点同一样本、多天批次保留差异', () => {
  const data = read('../apps/org-admin/src/data/dataBoard.ts');
  const dayFn = data.slice(data.indexOf('export function retentionForDay'), data.indexOf('export function retentionForPreset'));
  assert.ok(!dayFn.includes('1 - i *'), '单注册日批次不应按节点衰减样本（同一批人、分母相同）');
  const presetFn = data.slice(data.indexOf('export function retentionForPreset'), data.indexOf('export function retentionFor('));
  assert.ok(presetFn.includes('1 - i *'), '多天批次应保留节点样本差异（成熟截止日不同、对应不同人群）');
});
test('0718/#3 看板 Tab 切换防跳动（内容区历史最大高度）', () => {
  const board = read('../apps/org-admin/src/views/DataBoard.tsx');
  assert.ok(board.includes('tabBodyRef') && board.includes('tabMinH') && board.includes('minHeight: tabMinH'), 'Tab 内容区未接历史最大 min-height');
});
test('0718/#4 来源分布环比文案统一（去 pp / 去「扫码占比」前缀）', () => {
  const board = read('../apps/org-admin/src/views/DataBoard.tsx');
  assert.ok(!board.includes('}pp'), '来源分布环比仍带 pp 字样');
  assert.ok(!board.includes('扫码占比 较上一周期'), '来源分布环比仍带「扫码占比」前缀');
});
test('0717 二批/#6#8 + 0724 定稿：留存一行三卡 + 活跃概览页级常驻固定快照 + 撤吸顶 + 去脚注', () => {
  const board = read('../apps/org-admin/src/views/DataBoard.tsx');
  // 0724 定稿（0806 修正断言旧账）：活跃概览为页级常驻固定滚动窗口快照（ACTIVE_SNAPSHOT→scaleActiveSnapshot 消费），
  // 不再随区间联动（原 0717「入 Tab 随区间」口径已被 0724 推翻，此断言同步反转）
  for (const t of ['RetentionCard', 'ret-card', '日活（DAU）', 'deltaPct={active.dauDelta}', 'scaleActiveSnapshot', 'newTrend', 'saomaCnt']) assert.ok(board.includes(t), `DataBoard 缺 ${t}`);
  assert.ok(!board.includes('deltaPct={d.dauDelta}'), '活跃三卡不得再随区间数据 d 联动（0724 定稿固定快照）');
  // 吸顶交互与「数据更新至」脚注已撤销
  for (const t of ['board-sticky', 'IntersectionObserver', 'seg-panel', 'board-toprow', '数据更新至']) assert.ok(!board.includes(t), `DataBoard 残留 ${t}`);
  const css = read('../packages/tokens/src/design/admin-app.css');
  for (const t of ['.ret-card', '.ret-head', '.ret-rate']) assert.ok(css.includes(t), `CSS 缺 ${t}`);
  assert.ok(!css.includes('.board-sticky') && !css.includes('.board-toprow'), 'CSS 残留吸顶/合并面板样式');
  // 区间分析条回归轻量：无底色边框容器
  const i = css.indexOf('.board-rangebar {');
  const block = css.slice(i, css.indexOf('}', i) + 1);
  assert.ok(!/background|border/.test(block), '区间分析条仍有底框样式');
  // 数据层（0724 定稿）：活跃三指标在 ACTIVE_SNAPSHOT 固定快照（RangeData 已删 dau/wau/mau）+ 新增用户迷你趋势 + 来源人数/占比环比
  const data = read('../apps/org-admin/src/data/dataBoard.ts');
  for (const t of ['ACTIVE_SNAPSHOT', "dau: '", 'dauDelta', 'newTrend', 'saomaCnt', 'directCnt', 'saomaDelta']) assert.ok(data.includes(t), `dataBoard 缺 ${t}`);
  assert.ok(!/interface RangeData[\s\S]*?dau: string[\s\S]*?^}/m.test(data), 'RangeData 不得再含 dau（0724 移入固定快照）');
});
test('0718/#7 来源标签三态统一（自建/分享导入·实时/快照，两后台灰色）', () => {
  const view = read('../packages/ui-admin/src/KpDetailView.tsx');
  assert.ok(!view.includes('共享导入') && !view.includes('实时同步 · 只读'), '详情头残留旧标签');
  assert.ok(view.includes('KP_SOURCE_LABEL[importMode]'), '详情头来源标签未走 KP_SOURCE_LABEL 三态映射');
  assert.ok(!view.includes("importMode === 'own' ? '自建' : '共享'"), '详情头残留「自建/共享」二分法');
  // 平台超管查看实时导入 KP 不套用接收方只读（consumerReadonly=false 保留监管操作）
  assert.ok(view.includes('consumerReadonly'), 'KpDetailView 缺 consumerReadonly 开关');
  const gdetail = read('../apps/platform-admin/src/views/GlobalKpDetail.tsx');
  assert.ok(gdetail.includes('consumerReadonly={false}') && gdetail.includes("importMode={kp.shareMode ?? 'own'}"), '平台详情未传来源/监管开关');
  const list = read('../apps/org-admin/src/views/KpList.tsx');
  assert.ok(!list.includes('接收方</span>'), '列表残留「实时同步·接收方」标');
  // 0722 定稿（0806 修正断言旧账）：分享方不再显示分享标识，分享标识仅保留在接收方（分享导入·实时/快照）
  assert.ok(!list.includes('实时分享 · 分享方'), '0722 起分享方标签应已删除');
  assert.ok(list.includes('分享导入·实时') && list.includes('分享导入·快照'), '机构列表来源筛选未三分');
  const glist = read('../apps/platform-admin/src/views/GlobalKps.tsx');
  assert.ok(glist.includes("KP_SOURCE_LABEL[k.shareMode ?? 'own']"), '平台列表缺来源标签');
  const mock = read('../packages/mock/src/data/kps.ts');
  assert.ok(mock.includes('KP_SOURCE_LABEL') && mock.includes("realtime: '分享导入·实时'"), 'mock 缺 KP_SOURCE_LABEL 映射');
});
test('0717 二批/#3 我的纸书提示去 KP 名 + 0718 标签系统', () => {
  const src = read('../apps/mobile-h5/src/screens/MyBooks.tsx');
  for (const t of ['该内容已下架，若有问题请联系客服', '该内容已失效，若有问题请联系客服', 'bk-tag-corner', 'bk-tag-unlock', 'bk-st']) assert.ok(src.includes(t), `缺 ${t}`);
  assert.ok(!src.includes('当前「'), '提示仍带 KP 名');
  // 0718 #2(v3)：下架/失效整卡降透明度(bk-dim)、标签移到「扫码时间」后、封面右上角只留「已解锁」
  assert.ok(src.includes('bk-dim'), '下架/失效整卡未降透明度');
  assert.ok(!src.includes('bk-name-row') && !src.includes('bk-tags'), '标签不应挂在名称后或封面右上角');
  const css = read('../packages/tokens/src/design/mobile-app.css');
  for (const t of ['.yx-card.bk-dim', '.bk-tag-corner', '.bk-tag-unlock', '.bk-st']) assert.ok(css.includes(t), `CSS 缺 ${t}`);
  assert.ok(!css.includes('.bk-tag-off') && !css.includes('.bk-tag-dead') && !css.includes('.bk-cover.dim'), '残留旧的下架/失效样式');
});
test('0718/#1 系统配置会员价格按购买方式分组（首月/次月起/单月）', () => {
  const src = read('../apps/org-admin/src/views/SysConfig.tsx');
  for (const t of ['首月价格（首月特惠）', '次月起价格', '单月价格']) assert.ok(src.includes(t), `SysConfig 缺 ${t}`);
  assert.ok(!src.includes('首月折扣价') && !src.includes('月度价'), '残留含义不清的旧价格档位');
});
test('0718/#4 会员价格视觉清洗：两枚子面板 + 续费语义标 + 续费规则静态化', () => {
  const src = read('../apps/org-admin/src/views/SysConfig.tsx');
  for (const t of ['price-groups', 'price-panel', '自动续费', '一次性购买 · 不自动续费']) assert.ok(src.includes(t), `SysConfig 缺 ${t}`);
  assert.ok(!src.includes('fm-sub'), '残留旧的分组小节标题');
  assert.ok(!/inp2 disabled">支持随时退订/.test(src), '续费规则不应再用禁用输入框');
  // 0718 #5/#6：续费规则 + 调价须知合并为同一灰色说明块（纯文字，无「暂不可编辑」小标），保存按钮单独一行
  assert.ok(src.includes('price-note'), '续费规则与调价须知未合并为灰色说明块');
  assert.ok(!src.includes('暂不可编辑'), '「暂不可编辑」小标未去掉');
  const css = read('../packages/tokens/src/design/admin-app.css');
  for (const t of ['.price-groups', '.price-panel-t', '.price-panel-tag', '.price-note']) assert.ok(css.includes(t), `CSS 缺 ${t}`);
  assert.ok(!css.includes('.price-rule-tag'), 'CSS 残留 price-rule-tag');
});
test('0718/#3 系统配置：调价须知去加粗 + 价格保存/回答策略二次确认', () => {
  const src = read('../apps/org-admin/src/views/SysConfig.tsx');
  assert.ok(src.includes('ConfirmDialog'), '未接 ConfirmDialog 二次确认弹窗');
  for (const t of ['确认保存', '确认切换', '已切换回答策略']) assert.ok(src.includes(t), `SysConfig 缺 ${t}`);
  assert.ok(!src.includes('<b style={{ color: \'var(--ink)\' }}>调价须知'), '「调价须知：」仍加粗');
  assert.ok(src.includes('if (i === strategy) return'), '点当前已选策略不应触发确认弹窗');
});
test('0718/#3 平台全域 KP 去永享标 + 状态色两后台统一', () => {
  const glist = read('../apps/platform-admin/src/views/GlobalKps.tsx');
  assert.ok(!glist.includes('hasForever &&'), '平台 KP 卡片仍显示永享标');
  const css = read('../packages/tokens/src/design/proto-admin.css');
  const i = css.indexOf('.kp-tag-st.tag-jade{');
  const block = css.slice(i, css.indexOf('}', i) + 1);
  assert.ok(block.includes('var(--jade-soft)') && block.includes('var(--jade)'), '列表「已发布」未与详情统一为玉绿');
  assert.ok(css.includes('.kp-tag-st.tag-amber{'), '列表「已下架」缺琥珀色定义');
  const agents = read('../apps/platform-admin/src/views/GlobalAgents.tsx');
  assert.ok(agents.includes("a.type === '机构' ? 'tag-indigo' : 'tag-line'"), '平台 Agent「机构」类型标应改用 tag-indigo 保持原观感');
});
test('0717 二批/#5 禁用置灰统一为「前台访问地址」标准（实线,两后台共用）', () => {
  const css = read('../packages/tokens/src/design/proto-admin.css');
  const i = css.indexOf('.inp2.disabled{');
  const block = css.slice(i, css.indexOf('}', i) + 1);
  assert.ok(block.includes('var(--paper)') && block.includes('var(--line-2)') && !block.includes('dashed'), '禁用输入未统一为前台访问地址样式');
  const j = css.indexOf('.sel.sel-disabled{');
  const selBlock = css.slice(j, css.indexOf('}', j) + 1);
  assert.ok(selBlock.includes('var(--paper)') && !selBlock.includes('dashed'), '禁用下拉未统一');
});
test('0718/#8 会员开通页重构（先权益再套餐后协议 + 协议可点 + 续费语义 pill）', () => {
  const src = read('../apps/mobile-h5/src/screens/Member.tsx');
  // 套餐卡新结构：续费语义 pill + 权益速览 + 选中对勾；按钮/协议随方式联动（价格语义不变）
  for (const t of ['连续包月', '单月会员', '自动续费 · 可随时取消', '不自动续费', '到期自动失效不扣款', '¥9.9 开通连续包月', '¥19.9 购买单月会员', '《自动续费协议》', '《会员服务协议》', 'mb-perks', 'mb-plan', 'mb-plan-renew', 'mb-check', '请先阅读并同意相关协议']) assert.ok(src.includes(t), `Member 缺 ${t}`);
  assert.ok(!src.includes('按月自动续费'), '残留歧义文案「按月自动续费」');
  assert.ok(!src.includes('plan-corner'), '残留旧角标 plan-corner');
  // 0718 #4：按钮下方补充说明文案删除
  assert.ok(!src.includes('grace-note') && !src.includes('缓冲使用期'), '按钮下方说明文案未删除');
  const css = read('../packages/tokens/src/design/mobile-app.css');
  for (const t of ['.mb-perks', '.mb-plan.sel', '.mb-plan-renew', '.mb-check', '.bx.off']) assert.ok(css.includes(t), `CSS 缺 ${t}`);
});
test('0717 二批/#1 矩阵：二维码扫码规则与新会话完全相同（文档）', () => {
  const feature = fs.readFileSync(new URL('../docs/feature-list-build/gen.py', import.meta.url), 'utf8');
  assert.ok(feature.includes('规则与「新 AI 会话（前台地址进入）」完全相同'), '功能清单未写明扫码同新会话规则');
  const prd = fs.readFileSync(new URL('../docs/prd-build/build-prd.js', import.meta.url), 'utf8');
  assert.ok(prd.includes('规则同新会话：提示「已下架，若有问题请联系客服」3 秒 → 跳转规则①'), 'PRD 矩阵二维码行未同步');
});
test('0717 mock：已下架+已解锁演示 KP 存在（kp_icu_manual）', () => {
  const kps = read('../packages/mock/src/data/kps.ts');
  assert.ok(kps.includes('kp_icu_manual') && /kp_icu_manual[\s\S]{0,300}unlisted/.test(kps), '缺 kp_icu_manual(unlisted) 演示数据');
});

// ============================================================
// 0806 批：会员四态 / TTS 参考音文本 / 微信四参数 / 协议文档 Tab / 父子机构数据范围
// ============================================================

// vm 加载 0806 自包含模块（memberState / orgScope 均无外部依赖）
const loadTs = (rel, extraCtx = {}) => {
  const src2 = fs.readFileSync(new URL(rel, import.meta.url), 'utf8');
  const js2 = ts.transpileModule(src2, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const mod2 = { exports: {} };
  vm.runInNewContext(`(function(exports,module){${js2}\n})(module.exports,module)`, { module: mod2, console, Set, Error, Math, parseFloat, String, ...extraCtx });
  return mod2.exports;
};
const ms = loadTs('../packages/mock/src/data/memberState.ts');
const osc = loadTs('../packages/mock/src/data/orgScope.ts');
const oag = loadTs('../packages/mock/src/data/orgAgreements.ts');

test('0806/#1 会员四态互斥完整：四态 + 五档筛选 + label 唯一', () => {
  assert.equal(ms.MEMBER_STATES.length, 4);
  assert.deepEqual([...ms.MEMBER_STATES], ['active', 'grace', 'expired', 'none']);
  const labels = ms.MEMBER_STATES.map((s) => ms.MEMBER_STATE_LABEL[s]);
  assert.equal(new Set(labels).size, 4, '四态 label 必须互斥唯一');
  assert.deepEqual([...ms.MEMBER_FILTER_OPTIONS], ['全部', '有效会员', '宽限期（待续费）', '会员已过期', '未开通会员']);
});
test('0806/#1 筛选 label→state 往返一致；「全部」不参与过滤', () => {
  for (const s of ms.MEMBER_STATES) assert.equal(ms.memberStateByLabel(ms.MEMBER_STATE_LABEL[s]), s);
  assert.equal(ms.memberStateByLabel('全部'), null);
  assert.equal(ms.memberStateByLabel('会员'), null, '旧二分文案不得再命中任何状态');
  assert.equal(ms.memberStateByLabel('非会员'), null);
});
test('0806/#1 四态 badge 全复用既有语义色（零新增 CSS 类）', () => {
  assert.deepEqual({ ...ms.MEMBER_STATE_TAG }, { active: 'tag-jade', grace: 'tag-amber', expired: 'tag-terra', none: 'tag-line' });
  const css = read('../packages/tokens/src/design/styles.css');
  for (const c of ['.tag-jade', '.tag-amber', '.tag-terra', '.tag-line']) assert.ok(css.includes(c), `styles.css 缺 ${c}`);
});
test('0806/#1 到期时间文案按态区分（active 有效期至 / grace 宽限期内 / none 空）', () => {
  assert.equal(ms.memberExpireText('active', '2026-09-12'), '有效期至 2026-09-12');
  assert.equal(ms.memberExpireText('grace', '2026-08-01'), '已于 2026-08-01 到期 · 宽限期内');
  assert.equal(ms.memberExpireText('expired', '2026-06-10'), '已于 2026-06-10 到期');
  assert.equal(ms.memberExpireText('none'), '');
  assert.equal(ms.memberExpireText('active'), '', '无到期时间不硬造文案');
});
test('0806/#1 两后台用户 mock 四态全覆盖且同昵称同状态（跨端一致）', () => {
  const g = read('../apps/platform-admin/src/data/globalUsers.ts');
  const c = read('../apps/org-admin/src/data/cusers.ts');
  for (const src2 of [g, c]) for (const s of ['active', 'grace', 'expired', 'none']) assert.ok(src2.includes(`memberState: '${s}'`), `mock 缺 ${s} 态样本`);
  // 同昵称同状态抽查（A=active / C=grace / 5678=expired / B=none）
  for (const [nick, st] of [['微信昵称A', 'active'], ['微信昵称C', 'grace'], ['用户5678', 'expired'], ['微信昵称B', 'none']]) {
    for (const src2 of [g, c]) {
      const m = src2.match(new RegExp("nick: '" + nick + "'[^\\n]*memberState: '(\\w+)'"));
      assert.ok(m && m[1] === st, `${nick} 应为 ${st}`);
    }
  }
  assert.ok(!/member: (true|false)/.test(g) && !/member: (true|false)/.test(c), '不得残留 member 布尔字段');
});
test('0806/#1 两后台列表接五档筛选与四态标签；详情接行级数据', () => {
  const gu = read('../apps/platform-admin/src/views/GlobalUsers.tsx');
  const cu = read('../apps/org-admin/src/views/CUsers.tsx');
  for (const src2 of [gu, cu]) {
    assert.ok(src2.includes('MEMBER_FILTER_OPTIONS'), '筛选未接五档常量');
    assert.ok(src2.includes('MEMBER_STATE_TAG[') && src2.includes('MEMBER_STATE_LABEL['), '列渲染未接四态映射');
    assert.ok(!src2.includes("'会员' : '非会员'"), '残留二分渲染');
  }
  const cd = read('../apps/org-admin/src/views/CUserDetail.tsx');
  assert.ok(!cd.includes('微信昵称A <span'), 'CUserDetail 仍硬编码演示用户');
  assert.ok(cd.includes('loc.state') && cd.includes('memberExpireText'), 'CUserDetail 未接行级数据 / 到期文案');
  const gd = read('../apps/platform-admin/src/views/GlobalUserDetail.tsx');
  assert.ok(gd.includes('memberExpireText'), 'GlobalUserDetail 未显示到期文案');
});
test('0806/#1 反馈人会员标四态（未开通不挂标）+ 弹窗解耦 mock', () => {
  const fb = read('../apps/org-admin/src/views/Feedback.tsx');
  const gfb = read('../apps/platform-admin/src/views/GlobalFeedback.tsx');
  for (const src2 of [fb, gfb]) {
    assert.ok(src2.includes('FB_MEMBER'), '反馈人标未接四态');
    assert.ok(!src2.includes('r.member &&'), '残留布尔判断');
  }
  const modal = read('../packages/ui-admin/src/FeedbackDetailModal.tsx');
  assert.ok(modal.includes('memberLabel') && !modal.includes('member: boolean'), '弹窗未改传渲染值（ui-admin 不依赖 @aba/mock）');
});
test('0806/#1 移动端会员标（0806-3 定稿：C 端二分展示，运营四态语义只在后台）', () => {
  const my = read('../apps/mobile-h5/src/screens/My.tsx');
  // active/grace 权益在＝「会员」；expired/none＝无标；会员中心右值＝已开通/未开通
  assert.ok(my.includes("mState === 'active' || mState === 'grace'"), 'My 会员标应为 active/grace 二分');
  assert.ok(!my.includes('会员 · 待续费'), 'C 端不得再显「待续费」运营语义');
  assert.ok(!my.includes('宽限期（待续费）'), '会员中心右值不得再显宽限期');
  assert.ok(my.includes("grace: '已开通'") && my.includes("expired: '未开通'"), '会员中心右值应为 已开通/未开通 二分');
  const chat = read('../apps/mobile-h5/src/screens/Chat.tsx');
  assert.ok(!chat.includes('微信昵称A'), 'Chat 抽屉用户卡仍硬编码');
  assert.ok(!chat.includes('会员 · 待续费'), 'Chat 抽屉不得显「待续费」');
});
test('0806/#1 四份导出 spec 用四态 label', () => {
  for (const f of ['../apps/org-admin/src/exports/cusers.ts', '../apps/platform-admin/src/exports/globalUsers.ts', '../apps/org-admin/src/exports/feedback.ts', '../apps/platform-admin/src/exports/globalFeedback.ts']) {
    const src2 = read(f);
    assert.ok(src2.includes('MEMBER_STATE_LABEL'), `${f} 未接四态 label`);
    assert.ok(!src2.includes("? '会员' : '非会员'"), `${f} 残留二分导出`);
  }
});

test('0806/#2 TTS 参考音文本：必填 + 100 字上限 + 不限字符种类 + 实时字数', () => {
  const src2 = read('../packages/ui-admin/src/AgentDetailView.tsx');
  assert.ok(src2.includes('TTS 参考音文本<span className="req">*</span>'), '缺必填星标');
  assert.ok(src2.includes('TTS_TEXT_MAX = 100'), '上限常量非 100');
  assert.ok(src2.includes('maxLength={TTS_TEXT_MAX}'), '输入框未拦截超长');
  assert.ok(src2.includes("toast('请输入 TTS 参考音文本')"), '缺必填校验');
  // 0806-3：hint 文案定稿「参考音频内朗读的文本内容・100 字以内，用于 TTS 引擎将参考音与文本对齐」（置输入框上方）
  assert.ok(src2.includes('参考音频内朗读的文本内容・100 字以内'), 'hint 文案不符');
  assert.ok(src2.includes('ae-ttstext-count'), '缺实时字数计数');
  // 校验顺序：参考音在前、文本在后
  assert.ok(src2.indexOf("toast('请上传 TTS 参考音')") < src2.indexOf("toast('请输入 TTS 参考音文本')"), '校验顺序应为 参考音 → 文本');
});

test('0806/#3 微信支付四参数齐备且按接入用途排序', () => {
  const src2 = read('../apps/platform-admin/src/views/OrgDetail.tsx');
  for (const f of ['API v2 密钥', '支付公钥 ID', '支付公钥文件', '委托代扣包月模板 ID', 'pub_key.pem', 'PUB_KEY_ID_']) assert.ok(src2.includes(f), `缺 ${f}`);
  // 0806-2：v2 前置（密钥按版本号升序）
  const order = ['API v2 密钥', 'API v3 密钥', '商户证书', '商户 API 私钥', '支付公钥 ID', '支付公钥文件', '委托代扣包月模板 ID'];
  let last = -1;
  for (const f of order) {
    const i = src2.indexOf(`<div className="lab">${f}`);
    assert.ok(i > last, `字段顺序错误：${f}`);
    last = i;
  }
  assert.ok(src2.includes('两者并存不互斥'), 'wx-lim 缺 v2/v3 并存说明');
  assert.ok(src2.includes('公钥模式验签'), 'wx-lim 缺公钥模式说明');
});

test('0806/#4 机构资料 Tab 置末位 + 复用共享上传弹窗（0806-2 由协议文档更名）', () => {
  const src2 = read('../apps/platform-admin/src/views/OrgDetail.tsx');
  assert.ok(src2.includes("'品牌外观', '机构资料']"), 'TABS 第 6 项应为机构资料（末位）');
  assert.ok(src2.includes('AgreementsTab') && src2.includes('tab === 5'), '协议文档 Tab 未渲染');
  assert.ok(src2.includes('UploadModal') && src2.includes('ACCEPT.agreement'), '未复用共享上传弹窗 / accept 未限协议格式');
  assert.ok(src2.includes('AGREEMENT_SPEC'), '未接规格表');
  assert.ok(/下载/.test(src2) && src2.includes('op-danger" onClick={() => setDelTarget'), '缺下载 / 删除操作');
  assert.ok(src2.includes('删除后不可恢复'), '删除缺二次确认文案');
});
test('0806/#4 机构资料格式与大小规格（图 20 / 文 50；0806-2 去除 PPT）', () => {
  assert.deepEqual([...oag.AGREEMENT_TYPES], ['全部', '图片', '文档']);
  const spec = Object.fromEntries(oag.AGREEMENT_SPEC.map((r2) => [r2.k, r2.z]));
  assert.equal(spec['图片'], '≤ 20MB');
  assert.equal(spec['文档'], '≤ 50MB');
  assert.ok(!('演示文稿' in spec), '0806-2 起不支持 PPT，规格表不得再有演示文稿行');
  for (const f of oag.ORG_AGREEMENTS) assert.ok(['图片', '文档'].includes(f.type), `预置数据类型越界：${f.name}`);
  assert.ok(oag.ORG_AGREEMENTS.some((f) => f.name.includes('ICP 授权函')) && oag.ORG_AGREEMENTS.some((f) => f.name.includes('微信网站应用登记表')), '缺 ICP 授权函 / 微信登记表演示数据');
  const up = read('../packages/ui-admin/src/Upload.ts');
  assert.equal(up.match(/agreement: '([^']+)'/)?.[1], '.png,.jpg,.jpeg,.gif,.doc,.docx,.pdf', 'ACCEPT.agreement 扩展名清单不符（0806-2 无 ppt/pptx）');
});
test('0806/#4 上传弹窗抽为共享组件（KP 知识库改 import，零复制）', () => {
  const kp = read('../packages/ui-admin/src/KpDetailView.tsx');
  assert.ok(!kp.includes('function UploadModal'), 'KpDetailView 仍持有私有 UploadModal');
  assert.ok(kp.includes("from './UploadModal'"), 'KpDetailView 未改 import 共享组件');
  const um = read('../packages/ui-admin/src/UploadModal.tsx');
  assert.ok(um.includes('specRows') && um.includes('doneText') && um.includes('accept ='), '共享组件未参数化');
  // 0806-2：机构资料去 PPT 后 inferKind 回退（ppt/pptx 归文档，与 KP 知识库原口径一致），ppt 专属图标撤销
  assert.ok(!um.includes('演示文稿'), 'inferKind 不得再有演示文稿类型');
  const icon = read('../packages/ui/src/FileTypeIcon.tsx');
  assert.ok(!icon.includes("'ppt'"), 'FileTypeIcon 的 ppt kind 应已撤销');
});

test('0806/#5 机构类型三态与选项 / 后缀往返', () => {
  assert.deepEqual({ ...osc.ORG_TYPE_LABEL }, { parent: '父机构', child: '子机构', ordinary: '独立机构' });
  assert.deepEqual([...osc.orgScopeOptions()], ['全部机构', 'XX 出版社（父机构）', 'XX 少儿分社', 'XX 教辅分社']);
  assert.equal(osc.orgScopeValue('XX 出版社（父机构）'), 'XX 出版社');
  assert.equal(osc.orgScopeValue('XX 少儿分社'), 'XX 少儿分社');
});
test('0806/#5 可见范围：父=本+子；子/独立=仅本机构（保持现状）', () => {
  assert.deepEqual([...osc.visibleOrgs('parent')], ['XX 出版社', 'XX 少儿分社', 'XX 教辅分社']);
  assert.deepEqual([...osc.visibleOrgs('child')], ['XX 出版社']);
  assert.deepEqual([...osc.visibleOrgs('ordinary')], ['XX 出版社']);
});
test('0806/#5 机构系数：全选=1（现状数值不跳变）、空=0、部分单调', () => {
  assert.equal(osc.orgWeightOf(['XX 出版社', 'XX 少儿分社', 'XX 教辅分社']), 1);
  assert.equal(osc.orgWeightOf([]), 0);
  const w1 = osc.orgWeightOf(['XX 出版社']);
  const w2 = osc.orgWeightOf(['XX 出版社', 'XX 少儿分社']);
  assert.ok(w1 > 0 && w1 < w2 && w2 < 1, '部分选择系数应单调递增且 <1');
  assert.equal(osc.orgWeightOf(['不存在的机构']), 0, '未知机构不计权重');
});
test('0806/#5 看板缩放：绝对量 ×w、率值 / 时长不缩放、w=1 恒等', () => {
  const db = loadTs('../apps/org-admin/src/data/dataBoard.ts', { parseFloat });
  assert.equal(db.scaleCnNum('1,240', 0.5), '620');
  assert.equal(db.scaleCnNum('1.2万', 0.5), '6,000');
  assert.equal(db.scaleCnNum('¥25.6万', 0.5), '¥12.8万');
  assert.equal(db.scaleCnNum('6.6%', 0.5), '6.6%', '率值不得缩放');
  assert.equal(db.scaleCnNum('1.8s', 0.5), '1.8s', '时长不得缩放');
  assert.equal(db.scaleCnNum('1,240', 1), '1,240');
  const d0 = db.RANGE['7 日'];
  assert.equal(db.scaleRangeData(d0, 1), d0, 'w=1 应原样返回（引用相等）');
  const half = db.scaleRangeData(d0, 0.5);
  assert.equal(half.payRate, d0.payRate, '付费转化率不得缩放');
  assert.equal(half.perUser, d0.perUser, '人均提问不得缩放');
  assert.notEqual(half.gmv, d0.gmv, 'GMV 应缩放');
});
test('0806/#5 六页数据具备归属机构且含子机构演示行', () => {
  const checks = [
    ['../apps/org-admin/src/data/kps.ts', 'XX 少儿分社'],
    ['../apps/org-admin/src/data/cusers.ts', 'XX 教辅分社'],
    ['../apps/org-admin/src/data/codes.ts', 'XX 少儿分社'],
    ['../apps/org-admin/src/data/feedback.ts', 'XX 教辅分社'],
    ['../apps/org-admin/src/data/orders.ts', 'CHILD_ORG_ORDERS'],
    ['../apps/org-admin/src/views/AgentList.tsx', 'XX 少儿分社'],
  ];
  for (const [f, needle] of checks) assert.ok(read(f).includes(needle), `${f} 缺 ${needle}`);
  // 子机构订单不得进 @aba/mock（避免污染平台全域订单）
  assert.ok(!read('../packages/mock/src/data/adminOrders.ts').includes('XX 少儿分社'), '子机构订单不得写入共享 adminOrders');
});
test('0806/#5 六视图接机构筛选；子机构数据只读置灰', () => {
  for (const f of ['KpList', 'AgentList', 'CUsers', 'Orders', 'Codes', 'Feedback']) {
    const src2 = read(`../apps/org-admin/src/views/${f}.tsx`);
    assert.ok(src2.includes('useOrgScope') && src2.includes('visibleOrgs'), `${f} 未接机构范围`);
    assert.ok(src2.includes('orgScopeOptions'), `${f} 缺机构筛选下拉`);
  }
  const orders = read('../apps/org-admin/src/views/Orders.tsx');
  assert.ok(orders.includes('仅可操作本机构数据'), 'Orders 子机构退款未置灰提示');
  const kpd = read('../packages/ui-admin/src/KpDetailView.tsx');
  assert.ok(kpd.includes('readonlyBanner'), 'KP 详情缺子机构只读扩展');
  const agd = read('../packages/ui-admin/src/AgentDetailView.tsx');
  assert.ok(agd.includes('readonlyBanner') && agd.includes('denyRo'), 'Agent 详情缺只读态');
});
test('0806/#5 主控台 / 数据看板接机构多选联动', () => {
  for (const f of ['Dashboard', 'DataBoard']) {
    const src2 = read(`../apps/org-admin/src/views/${f}.tsx`);
    assert.ok(src2.includes('MultiSelect') && src2.includes('orgWeightOf'), `${f} 未接多选 / 系数`);
    assert.ok(src2.includes('isParent'), `${f} 未按机构类型分支`);
  }
  const app = read('../apps/org-admin/src/App.tsx');
  assert.ok(app.includes('org-type-seg') && app.includes('ORG_TYPE_LABEL'), '顶栏缺机构类型演示切换');
});
test('0806-2 内容供给三卡：快照字段齐备 + 三卡满行 + 导出同步', () => {
  const snap = read('../packages/mock/src/data/dashboard.ts');
  for (const k of ['kpTotal', 'kpPublished', 'kbFiles', 'kbDoc', 'kbImage', 'kbAudio', 'kbVideo', 'kbStorageTb', 'kbMediaPct']) assert.ok(snap.includes(k + ':'), `platformSnapshot 缺 ${k}`);
  const dash = read('../apps/platform-admin/src/views/Dashboard.tsx');
  // 副行呈现形式由并行会话持续美化（kpi-sub→kpi-dist 网格），断言只锁功能：三卡存在 + 3 等分 + 分布含占比
  for (const s2 of ['知识产品 KP 总数', '知识库文件总数', '知识库存储总量', "repeat(3,1fr)"]) assert.ok(dash.includes(s2), `平台主控台缺 ${s2}`);
  assert.ok(dash.includes('kpi-sub') || dash.includes('kpi-dist'), '三卡缺分布副行/明细区');
  assert.ok(!dash.includes('个百分点'), '平台主控台残留「个百分点」（0806-2 率类差值统一 %）');
  const exp = read('../apps/platform-admin/src/exports/dashboard.ts');
  for (const s2 of ['知识产品 KP 总数', '知识库文件总数', '知识库存储总量']) assert.ok(exp.includes(s2), `平台主控台导出缺 ${s2}`);
});
test('0806-2 机构多选定稿：自绘勾选 + 父机构标 + 回填省略 + 至少一家', () => {
  const ms = read('../packages/ui-admin/src/MultiSelect.tsx');
  for (const s2 of ['ms-box', 'PARENT_SUFFIX', 'ms-display', '至少选择一家机构', 'allLabel']) assert.ok(ms.includes(s2), `MultiSelect 缺 ${s2}`);
  assert.ok(!ms.includes('☑'), '不得再用字符勾选符');
  const css = read('../packages/tokens/src/design/admin-app.css');
  for (const s2 of ['.ms-box', '.ms-display', '.ms-divider', 'text-overflow:ellipsis']) assert.ok(css.includes(s2), `CSS 缺 ${s2}`);
  // 调用方传「（父机构）」后缀选项；数据看板多选在页头（导出左侧）
  for (const f of ['Dashboard', 'DataBoard']) {
    const v = read(`../apps/org-admin/src/views/${f}.tsx`);
    assert.ok(v.includes('（父机构）`'), `${f} 选项未带父机构后缀`);
  }
  const db = read('../apps/org-admin/src/views/DataBoard.tsx');
  assert.ok(db.indexOf('MultiSelect label="机构"') < db.indexOf('正在导出'), '数据看板多选应位于页头导出左侧');
});
test('0806-3 导出按页面栏目拆 Sheet；父机构仅注明范围（分机构明细已撤销）；订阅卡固定本机构', () => {
  for (const f of ['../apps/org-admin/src/exports/dashboard.ts', '../apps/org-admin/src/exports/dataBoard.ts']) {
    const s2 = read(f);
    assert.ok(s2.includes('机构范围'), `${f} 缺机构范围注明`);
    assert.ok(s2.includes('（父机构）'), `${f} scope 未标父机构`);
    // 0806-3：数据随机构多选联动（多选＝合并），不再单独产出分机构明细 Sheet
    assert.ok(!/name: '分机构明细'/.test(s2), `${f} 不得再产出分机构明细 Sheet`);
  }
  const dashSpec = read('../apps/org-admin/src/exports/dashboard.ts');
  for (const n2 of ["name: '当前订阅'", "name: '实时总览'", "name: '经营分析'"]) assert.ok(dashSpec.includes(n2), `主控台导出缺 ${n2}`);
  const boardSpec = read('../apps/org-admin/src/exports/dataBoard.ts');
  for (const n2 of ["name: '活跃概览'", "name: '用户留存'", "name: '区间分析'"]) assert.ok(boardSpec.includes(n2), `数据看板导出缺 ${n2}`);
  assert.ok(boardSpec.includes("'主题 Tab'"), '区间分析 Sheet 首列应为主题 Tab');
  const dash = read('../apps/org-admin/src/views/Dashboard.tsx');
  assert.ok(dash.includes('sub-scope-note') && dash.includes('不随机构筛选变化'), '订阅卡缺本机构注明');
});
test('0807-2 微信敏感项写后不回显（状态行+更新覆写，显隐眼睛移除）+ 落地页可滚动 + 内容供给副行占比', () => {
  const od = read('../apps/platform-admin/src/views/OrgDetail.tsx');
  assert.ok(!od.includes('SecretInput') && !od.includes('secret-eye'), '显隐眼睛（SecretInput/secret-eye）应已移除');
  assert.ok((od.match(/<SecretText /g) ?? []).length >= 5, '文本类敏感项未接 SecretText（应 ≥5 处：两 AppSecret + v2/v3 密钥 + 公钥 ID）');
  assert.ok((od.match(/<SecretFile /g) ?? []).length >= 4, '文件类敏感项未接 SecretFile（应 ≥4 处：校验文件/证书/私钥/公钥文件）');
  assert.ok(od.includes('已配置') && od.includes('不再回显'), '缺已配置状态行 / 不回显文案');
  // 0810：状态行收敛为「状态 + 操作」两段，尾号/文件名/更新时间全部移除
  assert.ok(!od.includes('尾号 ****') && !od.includes('SEC_AT'), '0810 后状态行不得再含尾号/更新时间');
  assert.ok(od.includes('重新上传并覆盖？') && od.includes('不提供下载与回显'), '文件重新上传缺二次确认弹窗');
  assert.ok(od.includes('保存并覆盖？') && od.includes('请先核对输入无误'), '文本保存缺二次确认弹窗（0807-2b）');
  assert.ok(od.includes('发邮件申请'), 'wx-lim 缺原值获取机制说明（联系技术发邮件申请）');
  assert.ok(od.includes('empty'), '支付公钥文件缺未上传空态演示');
  const sprite = read('../packages/ui/src/IconSprite.tsx');
  assert.ok(!sprite.includes('i-eye'), '眼睛 icon 应随显隐能力一并移除');
  const css = read('../packages/tokens/src/design/proto.css');
  assert.ok(css.includes('justify-content:safe center') && /lg-landing\{[^}]*overflow-y:auto/.test(css), '落地页未修复溢出滚动');
  assert.ok(css.includes('.lg-landing>*{flex:none;}'), '落地页子元素未禁 flex 压缩（brand-orb 会被压没）');
  const pd = read('../apps/platform-admin/src/views/Dashboard.tsx');
  assert.ok(pd.includes('marginTop: 16'), '内容供给行距未对齐');
  assert.ok((pd.match(/Math\.round\(platformSnapshot\.k/g) ?? []).length >= 4 || (pd.match(/platformSnapshot\.k\w+ \/ platformSnapshot\.k/g) ?? []).length >= 4, '副行缺占比计算');
  assert.ok(/\* \(100 - platformSnapshot\.kbMediaPct\) \/ 100\)\.toFixed\(1\)/.test(pd), '存储副行缺文档容量＋占比');
});
test('0806-2 C 端会员四态演示开关（登录落地页）', () => {
  const st = read('../packages/mock/src/store.ts');
  assert.ok(st.includes('setMemberState'), 'demo store 缺 setMemberState');
  const ld = read('../apps/mobile-h5/src/screens/Landing.tsx');
  for (const s2 of ["'none', '未开通'", "'grace', '宽限期'", 'setMemberState']) assert.ok(ld.includes(s2), `Landing 缺 ${s2}`);
});
test('0806-2 微信支付：API v2 前置于 API v3、命名统一带空格', () => {
  const src2 = read('../apps/platform-admin/src/views/OrgDetail.tsx');
  assert.ok(src2.indexOf('API v2 密钥') < src2.indexOf('API v3 密钥'), 'API v2 应在 API v3 之前');
  assert.ok(!src2.includes('APIv3'), '残留无空格「APIv3」');
});

test('0806 文档同步：清单 ≥v2.9 + PRD ≥v1.12 五项全落', () => {
  // 0812：版本断言改实读比较（原写死 v2.9 / v1.12，版本升级即失效的旧账，与「版本号从生成器实读」测试同原则）
  const geVer = (v, base) => {
    const [a1, a2] = v.split('.').map(Number); const [b1, b2] = base.split('.').map(Number);
    return a1 > b1 || (a1 === b1 && a2 >= b2);
  };
  const feature = read('../docs/feature-list-build/gen.py');
  const featVer = (feature.match(/版本：v([\d.]+) ·/) || [])[1];
  assert.ok(featVer && geVer(featVer, '2.9'), `清单版本 ${featVer} 应 ≥ v2.9`);
  for (const t2 of ['宽限期（待续费）', 'TTS 参考音文本', '委托代扣包月模板 ID', '机构资料', '机构类型切换']) assert.ok(feature.includes(t2), `清单缺 ${t2}`);
  const prd = read('../docs/prd-build/build-prd.js');
  const prdVer = (prd.match(/版本 v([\d.]+)　/) || [])[1];
  assert.ok(prdVer && geVer(prdVer, '1.12'), `PRD 版本 ${prdVer} 应 ≥ v1.12`);
  for (const t2 of ['宽限期（待续费）', 'TTS 参考音文本', '支付公钥 ID', '机构资料', '父子机构数据范围']) assert.ok(prd.includes(t2), `PRD 缺 ${t2}`);
  assert.ok(prd.includes('固定滚动窗口快照'), 'PRD 未补 0724 DAU 口径');
});


let passed = 0;
for (const [name, fn] of tests) {
  try { fn(); passed += 1; console.log(`✓ ${name}`); }
  catch (error) { console.error(`✗ ${name}`); throw error; }
}
console.log(`\n${passed}/${tests.length} 条对抗性测试通过（V1.4 基线 + 0714~0806 批）`);
