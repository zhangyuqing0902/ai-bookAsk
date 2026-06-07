import { sleep, track } from './util';
import { useDemoStore } from '../store';

export const wechatAuth = async () => {
  track('login_wechat_start');
  await sleep(1500); // 微信授权过场
  useDemoStore.getState().setRole('free');
  track('login_wechat_done');
};

export const bindPhone = async (phone: string, code: string) => {
  track('phone_bind_submit', { phone });
  await sleep(800);
  if (code !== '1234' && code !== '0000') {
    throw new Error('验证码错误，请输入 1234');
  }
  return { ok: true };
};

export const sendSms = async (_phone: string) => {
  await sleep(400);
  return { ok: true };
};

export const logout = async () => {
  await sleep(300);
  useDemoStore.getState().setRole('guest');
};
