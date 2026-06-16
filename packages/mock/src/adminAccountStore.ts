import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 后台「个人中心」头像（机构后台 / 平台超管各自 origin 的 localStorage 独立）。
// 0615：账户信息平台统一管理、只读；仅头像可自助上传更新，上传后顶栏 UserMenu 头像同步回显。
interface AdminAvatarStore {
  avatar: string; // dataURL；空串 = 顶栏 / 个人中心用姓名首字兜底
  setAvatar: (a: string) => void;
}

export const useAdminAvatar = create<AdminAvatarStore>()(
  persist((set) => ({ avatar: '', setAvatar: (avatar) => set({ avatar }) }), {
    name: 'aba-admin-avatar',
  })
);
