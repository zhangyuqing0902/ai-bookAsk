export const TENANT_DOMAIN_SUFFIX = '-aba.一级域名.cn';

export function resolveTenantRootDomain(hostname: string) {
  const host = hostname.trim().toLowerCase().split(':')[0];
  if (!host || host === 'localhost' || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return host || 'localhost';
  const parts = host.split('.').filter(Boolean);
  const compoundSuffix = new Set(['com.cn', 'net.cn', 'org.cn', 'gov.cn', 'co.uk']);
  const lastTwo = parts.slice(-2).join('.');
  return compoundSuffix.has(lastTwo) && parts.length >= 3 ? parts.slice(-3).join('.') : lastTwo;
}

export function tenantDomainSuffix(hostname: string) {
  return `-aba.${resolveTenantRootDomain(hostname)}`;
}

export function normalizeDomainPrefix(input: string) {
  return input.trim().toLowerCase();
}

export function validateDomainPrefix(input: string, existing: string[] = []) {
  const normalized = normalizeDomainPrefix(input);
  if (!normalized) return { valid: false, normalized, error: '请输入域名前缀' };
  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(normalized)) {
    return { valid: false, normalized, error: '仅支持小写字母、数字和连字符，且不能以连字符开头或结尾' };
  }
  if (existing.map(normalizeDomainPrefix).includes(normalized)) {
    return { valid: false, normalized, error: '该域名前缀已被其他机构使用' };
  }
  return { valid: true, normalized, error: '' };
}

export function buildTenantDomain(prefix: string, rootDomain = '一级域名.cn') {
  return `${normalizeDomainPrefix(prefix)}-aba.${rootDomain}`;
}

export function buildEnvironmentTenantDomain(prefix: string, hostname: string) {
  return `${normalizeDomainPrefix(prefix)}${tenantDomainSuffix(hostname)}`;
}

export function secondaryTenantDomain(prefix: string) {
  return `${normalizeDomainPrefix(prefix)}-aba`;
}

export function buildTenantUrls(prefix: string, kpId = ':id', rootDomain = '一级域名.cn') {
  const origin = `https://${buildTenantDomain(prefix, rootDomain)}`;
  return { h5: `${origin}/`, admin: `${origin}/admin/`, kp: `${origin}/kp/${kpId}` };
}

export type PeriodKind = 'snapshot' | 'today' | 'range';
export type MetricUnit = 'count' | 'money' | 'rate' | 'duration';

// 0813-2：区间口径定版——「等长」不够，必须「等长且等完整度」。
//   旧口径把近 N 天的终点设成今天 23:59:59（含今日一整天），而对比区间是 N 个完整日，
//   今日只跑了半天 → 环比系统性偏负，且同一天早晚看到的数不一样、截图对不上账。
//   现统一为：区间只统计完整自然日（截至昨日 24:00，不含今日），今日单独成档。
export const PERIOD_RULE_HELP: Record<PeriodKind, string> = {
  snapshot: '累计/存量指标为截至当前的实时快照，不与上一周期比较。',
  today: '今日按 00:00 至当前时刻统计，并与昨日相同已过时长比较；趋势按小时展示。',
  range: '近 7 天、近 30 天和自定义区间按完整自然日统计（截至昨日 24:00，不含今日，避免用未过完的今天拉低对比），与紧邻此前的等长完整日区间比较；趋势按自然日展示。今日数据见「今日」档。',
};

export function metricHelp(definition: string, kind: PeriodKind, unit: MetricUnit = 'count') {
  const unitRule = unit === 'rate'
    ? '比率类变化显示百分点。'
    : unit === 'duration'
      ? '时长类变化显示绝对时长差。'
      : '计数/金额类变化显示相对百分比；上期为 0 时显示“上期为0，暂无可比增幅”。';
  return `${definition} ${PERIOD_RULE_HELP[kind]} ${kind === 'snapshot' ? '' : unitRule}`.trim();
}

export function previousPeriod(start: Date, end: Date, kind: Exclude<PeriodKind, 'snapshot'>) {
  if (end.getTime() < start.getTime()) throw new Error('统计区间结束时间不能早于开始时间');
  if (kind === 'today') {
    const yesterdayStart = new Date(start.getTime() - 24 * 60 * 60 * 1000);
    return { start: yesterdayStart, end: new Date(yesterdayStart.getTime() + (end.getTime() - start.getTime())) };
  }
  const duration = end.getTime() - start.getTime();
  return { start: new Date(start.getTime() - duration), end: new Date(start.getTime()) };
}

export function compareMetric(current: number, previous: number, unit: MetricUnit) {
  if (unit === 'rate') {
    const value = current - previous;
    // 0806-2：率类环比展示统一为「%」符号（与计数类视觉一致；语义仍为绝对差·百分点，各指标 tooltip 已注明差值口径）
    return { comparable: true, value, label: `${value >= 0 ? '+' : ''}${value.toFixed(1)}%` };
  }
  if (unit === 'duration') {
    const value = current - previous;
    return { comparable: true, value, label: `${value >= 0 ? '+' : ''}${value.toFixed(1)} 秒` };
  }
  if (previous === 0) return { comparable: false, value: null, label: '上期为0，暂无可比增幅' };
  const value = ((current - previous) / previous) * 100;
  return { comparable: true, value, label: `${value >= 0 ? '+' : ''}${value.toFixed(1)}% 较上一周期` };
}

const dateLabel = (d: Date) => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** 0813-2：区间统计终点＝昨日（今日未过完不参与区间统计） */
const rangeEnd = (now: Date) => new Date(now.getTime() - 86400000);

export function comparisonPeriodLabel(days: number, now = new Date()) {
  if (days <= 1) {
    return `对比昨日 00:00-${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }
  // 当前区间 = [T-days, T-1]，对比区间 = [T-2*days, T-days-1]，两段均为完整自然日且等长
  const currentEnd = rangeEnd(now);
  const currentStart = new Date(currentEnd.getTime() - (days - 1) * 86400000);
  const previousEnd = new Date(currentStart.getTime() - 86400000);
  const previousStart = new Date(previousEnd.getTime() - (days - 1) * 86400000);
  return `对比 ${dateLabel(previousStart)}—${dateLabel(previousEnd)}`;
}

export function currentPeriodLabel(days: number, now = new Date()) {
  if (days <= 1) return `今日 00:00-${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const end = rangeEnd(now);
  const start = new Date(end.getTime() - (days - 1) * 86400000);
  return `${dateLabel(start)}—${dateLabel(end)}`;
}

/** 0813-2：区间统计说明——四处看板区块副标题与自定义面板共用，口径只写一遍 */
export const RANGE_SCOPE_NOTE = '统计截至昨日 24:00（不含今日），今日数据见「今日」档';

// 0814：周活 / 月活口径反转——0813-2 曾把 WAU/MAU 定为「含今日的滚动窗口」，
//   并在 tooltip 里解释它和区间档对不齐。但「今天没过完」这条理由对活跃指标同样成立：
//   上午看 WAU 天然偏低、下午又变高，同一天两次截图对不上账，跟区间档当初的病一模一样。
//   现统一为：周活 / 月活＝截至昨日 24:00 的 7 / 30 个完整自然日，与区间档同口径。
//   日活保持「今日 00:00 至当前时刻」不变——它是三卡里唯一的实时脉搏，也是唯一含今日的口径。
//   代价：周活与区间档「近 7 天活跃用户」数值重合，这是刻意的（口径一致的必然结果），不是 bug。
export const ACTIVE_WINDOW_NOTE = {
  dau: '不随下方时间筛选联动。本卡是三卡中唯一含今日的实时口径。',
  wau: '不随下方时间筛选联动。统计截至昨日 24:00 的完整自然日，与下方「7 日」区间同口径。',
  mau: '不随下方时间筛选联动。统计截至昨日 24:00 的完整自然日，与下方「30 日」区间同口径。',
};

/** 0813-2：自定义区间可选范围——结束日最晚昨日，起始日最早近 3 年 */
export const CUSTOM_RANGE_YEARS = 3;
export function customRangeBounds(now = new Date()) {
  const max = rangeEnd(now); max.setHours(0, 0, 0, 0);
  const min = new Date(max); min.setFullYear(min.getFullYear() - CUSTOM_RANGE_YEARS);
  return { min, max };
}

export interface OrgNode { id: string; parentId?: string | null }

function descendantIds(id: string, orgs: OrgNode[]) {
  const result = new Set<string>();
  const visit = (parentId: string) => orgs.filter((org) => org.parentId === parentId).forEach((org) => {
    if (!result.has(org.id)) { result.add(org.id); visit(org.id); }
  });
  visit(id);
  return result;
}

export function parentEligibility(candidateId: string, currentId: string, orgs: OrgNode[]) {
  if (candidateId === currentId) return { allowed: false, reason: '不能选择当前机构作为上级' };
  if (descendantIds(currentId, orgs).has(candidateId)) return { allowed: false, reason: '不能选择当前机构的下级作为上级' };
  return { allowed: true, reason: '' };
}

export function resolveOrgScope(selectedId: string | null, includeDescendants: boolean, orgs: OrgNode[]) {
  if (!selectedId) return orgs.map((org) => org.id);
  return includeDescendants ? [selectedId, ...descendantIds(selectedId, orgs)] : [selectedId];
}

export function suspensionImpact(isParent: boolean) {
  return isParent
    ? { cascades: false, message: '停用父机构仅暂停该机构自身服务，不自动停用子机构；如需批量停用必须逐家确认影响。' }
    : { cascades: false, message: '停用子机构仅暂停该机构自身服务，不影响父机构或其他子机构。' };
}

export function revealPhone(phone: string) {
  return phone.replace(/^(\d{3})\*{4}(\d{4})$/, (_, head: string, tail: string) => `${head}0013${tail}`);
}

// orgOptionLabel / orgOptionValue 已迁至 data/platformOrgs.ts（从真实机构树按名推导父/子/普通三态），
// 不再用与实际机构名对不上的硬编码名单。

// 0717 #1.5：全平台删除统一为逻辑删除（软删除）——删除后三端界面均不再展示，
//   数据库保留全部数据（订单 / 权益 / 文件 / 向量 / 二维码 / 分享记录）；
//   C 端各入口（我的纸书 / 我的永享 / 新会话 / 扫码）统一标「已失效」。
//   relations 仅决定删除确认弹窗是否展示影响声明，不改变删除方式（不存在物理删除）。
export function canDeleteKp(relations: { orders?: number; grants?: number; shares?: number; imports?: number }) {
  const count = (relations.orders ?? 0) + (relations.grants ?? 0) + (relations.shares ?? 0) + (relations.imports ?? 0);
  return {
    allowed: true,
    action: 'soft-delete' as const,
    hasRelations: count > 0,
    reason: count > 0 ? '存在订单、权益、分享或导入关系，删除前需确认对 C 端用户的影响（历史凭证保留并标「已失效」）' : '',
  };
}

// 0812：实时分享改为占用接收方 KP 数（存储仍不占，文件实体在源机构）；两种模式 Token 均归属接收方
export function sharePolicy(mode: 'realtime' | 'snapshot') {
  return mode === 'realtime'
    ? { consumesKp: true, consumesStorage: false, consumesToken: true, editable: false, showQrShare: false }
    : { consumesKp: true, consumesStorage: true, consumesToken: true, editable: true, showQrShare: true };
}

export function shareAccessAfterRevocation(mode: 'realtime' | 'snapshot') {
  return mode === 'realtime' ? 'revoked' as const : 'retained' as const;
}

export function refundEntitlementDecision(kind: 'full' | 'partial', orderIsOnlySource: boolean) {
  return kind === 'full' && orderIsOnlySource ? 'revoke' as const : 'retain' as const;
}

// 0813-2：降档超额沿用「既存不适格」（城市规划 legal nonconforming use）——
//   既有存量永久有效（不删机构资产、C 端完全无感）、超额期间冻结增量、只能向合规方向回落。
//   注意 blocked 用的是 >= 而非 >，这是刻意的「棘轮」：12 个 KP 降到 5 个额度后，
//   删到 6 个仍 6>=5 继续阻断，必须回落到 4 个才能再建到 5 —— 删一个 ≠ 能建一个。请勿「修正」成 >。
export function applySubscriptionTransition(
  usage: { kp: number; storage: number; token: number },
  nextLimits: { kp: number; storage: number; token: number },
) {
  return {
    usage: { kp: usage.kp, storage: usage.storage, token: 0 },
    blocked: { kp: usage.kp >= nextLimits.kp, storage: usage.storage >= nextLimits.storage, token: false },
  };
}

// 0813-2：占用型额度统一判定（KP 数 / 存储共用；三端替代各页硬编码常量）。
//   三个额度性质不同，只有占用型才会有「超额存量」：
//     KP 数 —— 占用型，超额无额外硬成本（只是商务分档标尺）→ 棘轮冻结新建即可
//     存储  —— 占用型，超额是平台持续掏钱 → 棘轮冻结上传 + 降档必填说明 + 平台侧可见可催收
//     Token —— 消耗型，每期归零，不存在超额存量 → 沿用阈值预警，不进本函数
export type QuotaLevel = 'ok' | 'warn' | 'near' | 'over';
export interface QuotaState {
  unlimited: boolean; used: number; limit: number;
  over: boolean; overBy: number; canAdd: boolean; level: QuotaLevel; reason: string;
}
export function quotaState(used: number, limit: number, unlimited = false, kind: 'kp' | 'storage' = 'kp'): QuotaState {
  const unit = kind === 'kp' ? '个' : 'GB';
  const noun = kind === 'kp' ? 'KP' : '存储';
  // 不限版 / 定制版单项不限：不设上限、不做超限阻断（与 0812-g 一致）
  if (unlimited) {
    return { unlimited: true, used, limit: 0, over: false, overBy: 0, canAdd: true, level: 'ok', reason: '' };
  }
  const over = used >= limit; // 棘轮：等于上限即视为已满，不可再增
  const overBy = Math.max(0, Number((used - limit).toFixed(2)));
  const pct = limit > 0 ? (used / limit) * 100 : 100;
  const level: QuotaLevel = over ? 'over' : pct >= 90 ? 'near' : pct >= 70 ? 'warn' : 'ok';
  const action = kind === 'kp'
    ? `需删除至 ${limit} ${unit}以内、或联系平台扩容后才能新建 KP。`
    : `需删除文件至 ${limit} ${unit} 以内、或联系平台扩容后才能上传。`;
  const reason = over
    ? `${noun}已用 ${used} ${unit}，当前订阅上限 ${limit} ${unit}${overBy > 0 ? `（超额 ${overBy} ${unit}）` : ''}。既有内容与 C 端权益不受影响；${action}`
    : '';
  return { unlimited: false, used, limit, over, overBy, canAdd: !over, level, reason };
}

/** 0813-2：新订阅是否构成「降档」——任一占用型额度低于机构当前实际占用即触发（Token 每期归零，不触发） */
export function downgradeCheck(
  usage: { kp: number; storage: number },
  nextLimits: { kp: number | '不限'; storage: number | '不限' },
) {
  const under = (limit: number | '不限', used: number) => limit !== '不限' && limit < used;
  const kp = under(nextLimits.kp, usage.kp);
  const storage = under(nextLimits.storage, usage.storage);
  const kpOver = kp ? usage.kp - (nextLimits.kp as number) : 0;
  const storageOver = storage ? Number((usage.storage - (nextLimits.storage as number)).toFixed(2)) : 0;
  const parts: string[] = [];
  if (kp) parts.push(`KP ${kpOver} 个`);
  if (storage) parts.push(`存储 ${storageOver} GB`);
  return {
    isDowngrade: kp || storage,
    kp, storage,
    // 分项超出量：文案里直接给数字，不让填写人自己去减
    kpOver, storageOver,
    overText: parts.join('、'),
    requiresNote: kp || storage,
  };
}

export function isRedeemable(now: Date, start: Date, end: Date, orgEnabled: boolean) {
  if (!orgEnabled) return { allowed: false, reason: '机构已停用' };
  if (now < start) return { allowed: false, reason: '兑换码尚未到生效时间' };
  if (now > end) return { allowed: false, reason: '兑换码已过期' };
  return { allowed: true, reason: '' };
}

export function stackMembershipExpiry(now: Date, currentPaidExpiry: Date | null, durationMs: number) {
  const base = currentPaidExpiry && currentPaidExpiry > now ? currentPaidExpiry : now;
  return new Date(base.getTime() + durationMs);
}

export function isSlidingSessionValid(lastActiveAt: Date, now: Date, days = 7) {
  return now.getTime() - lastActiveAt.getTime() <= days * 24 * 60 * 60 * 1000;
}
