export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const track = (event: string, payload?: Record<string, unknown>) => {
  // PRD 第 6 章埋点：原型用 console.log，评审打开 DevTools 即可看到漏斗
  // eslint-disable-next-line no-console
  console.log(`%c[track] ${event}`, 'color:#4f46e5;font-weight:600', payload || {});
};

export const genOrderId = (prefix: 'WX' | 'RD' = 'WX') => {
  const ts = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${ts}${rand}`;
};
