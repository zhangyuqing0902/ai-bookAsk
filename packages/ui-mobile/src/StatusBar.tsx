// iOS 状态条（矢量信号/wifi/电量，非 emoji；移植自 proto-app.js 的 SB）
export function StatusBar() {
  return (
    <div className="statusbar">
      <span>9:41</span>
      <span className="r sbi">
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
          <rect x="0" y="7" width="3" height="4" rx="1" />
          <rect x="4.7" y="5" width="3" height="6" rx="1" />
          <rect x="9.4" y="2.5" width="3" height="8.5" rx="1" />
          <rect x="14" y="0" width="3" height="11" rx="1" />
        </svg>
        <svg width="16" height="11" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
          <path d="M1 3.6a10 10 0 0 1 14 0M3.4 6a6.5 6.5 0 0 1 9.2 0M5.8 8.4a3 3 0 0 1 4.4 0" />
          <circle cx="8" cy="10.4" r=".8" fill="currentColor" stroke="none" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none" stroke="currentColor">
          <rect x="1" y="1.4" width="20" height="9.2" rx="2.6" opacity=".4" />
          <rect x="2.8" y="3.1" width="13" height="5.8" rx="1.4" fill="currentColor" stroke="none" />
          <rect x="22.2" y="4" width="1.8" height="4" rx="1" fill="currentColor" stroke="none" />
        </svg>
      </span>
    </div>
  );
}
