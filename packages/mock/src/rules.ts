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

export const PERIOD_RULE_HELP: Record<PeriodKind, string> = {
  snapshot: '累计/存量指标为截至当前的实时快照，不与上一周期比较。',
  today: '今日按 00:00 至当前时刻统计，并与昨日相同已过时长比较；趋势按小时展示。',
  range: '近 7 天、近 30 天和自定义区间，与紧邻此前的等长区间比较；趋势按自然日展示。',
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
    return { comparable: true, value, label: `${value >= 0 ? '+' : ''}${value.toFixed(1)} 个百分点` };
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

export function comparisonPeriodLabel(days: number, now = new Date()) {
  const end = new Date(now);
  if (days <= 1) {
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return `对比昨日 00:00-${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }
  const currentStart = new Date(end.getTime() - (days - 1) * 86400000);
  const previousEnd = new Date(currentStart.getTime() - 86400000);
  const previousStart = new Date(previousEnd.getTime() - (days - 1) * 86400000);
  return `对比 ${dateLabel(previousStart)}—${dateLabel(previousEnd)}`;
}

export function currentPeriodLabel(days: number, now = new Date()) {
  if (days <= 1) return `今日 00:00-${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const start = new Date(now.getTime() - (days - 1) * 86400000);
  return `${dateLabel(start)}—${dateLabel(now)}`;
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

export function canPhysicallyDeleteKp(relations: { orders?: number; grants?: number; shares?: number; imports?: number }) {
  const count = (relations.orders ?? 0) + (relations.grants ?? 0) + (relations.shares ?? 0) + (relations.imports ?? 0);
  return count === 0
    ? { allowed: true, action: 'delete' as const, reason: '' }
    : { allowed: false, action: 'archive' as const, reason: '存在订单、赠送、分享或导入关系，只能归档并保留审计记录' };
}

export function sharePolicy(mode: 'realtime' | 'snapshot') {
  return mode === 'realtime'
    ? { consumesKp: false, consumesStorage: false, consumesToken: true, editable: false, showQrShare: false }
    : { consumesKp: true, consumesStorage: true, consumesToken: false, editable: true, showQrShare: true };
}

export function shareAccessAfterRevocation(mode: 'realtime' | 'snapshot') {
  return mode === 'realtime' ? 'revoked' as const : 'retained' as const;
}

export function refundEntitlementDecision(kind: 'full' | 'partial', orderIsOnlySource: boolean) {
  return kind === 'full' && orderIsOnlySource ? 'revoke' as const : 'retain' as const;
}

export function applySubscriptionTransition(
  usage: { kp: number; storage: number; token: number },
  nextLimits: { kp: number; storage: number; token: number },
) {
  return {
    usage: { kp: usage.kp, storage: usage.storage, token: 0 },
    blocked: { kp: usage.kp >= nextLimits.kp, storage: usage.storage >= nextLimits.storage, token: false },
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
