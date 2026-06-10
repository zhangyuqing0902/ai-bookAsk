import { create } from 'zustand';

// 当前实时会话的消息，放在内存 store 里（而非 Chat 本地 state），
// 这样跳到 开通会员 / 支付 / 实时电话 等页面再返回时，仍回到「同一个会话」，
// 而不是每次进 /chat 都开新会话。支撑 一-5(挂断回原会话) / 一-8(支付成功返回原会话) / 一-10(语音在当前会话)。
export interface ChatMsg {
  id: number;
  role: 'user' | 'ai';
  text: string;
}

let _id = 1;
export const nextMsgId = () => _id++;

interface ChatState {
  messages: ChatMsg[];
  /** 已播放过打字机动效的 AI 消息 id：再次挂载（如实时电话挂断返回会话）时直接整段显示，不重复打字 */
  animated: Record<number, boolean>;
  setMessages: (updater: ChatMsg[] | ((prev: ChatMsg[]) => ChatMsg[])) => void;
  markAnimated: (id: number) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  animated: {},
  setMessages: (updater) =>
    set((s) => ({ messages: typeof updater === 'function' ? updater(s.messages) : updater })),
  markAnimated: (id) => set((s) => (s.animated[id] ? s : { animated: { ...s.animated, [id]: true } })),
  reset: () => set({ messages: [], animated: {} }),
}));
