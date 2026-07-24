import { sleep, track } from './util';
import { useDemoStore } from '../store';

export const wechatAuth = async () => {
  track('login_wechat_start');
  await sleep(1500); // 微信授权过场
  useDemoStore.getState().setRole('free');
  track('login_wechat_done');
};

// 0724：演示环境统一 6 位演示码，UI 常驻提示与校验共用此常量（语音码与短信码同码同校验）
export const DEMO_CODE = '123456';

export const verifyCode = async (_phone: string, code: string) => {
  await sleep(400);
  if (code !== DEMO_CODE) {
    track('otp_verify_fail');
    throw new Error('验证码错误，请重新输入');
  }
  track('otp_verify_ok');
  return { ok: true };
};

export const sendSms = async (_phone?: string) => {
  track('otp_sms_send');
  await sleep(400);
  return { ok: true };
};

export const callVoice = async (_phone?: string) => {
  track('otp_voice_call');
  await sleep(300);
  return { ok: true };
};

export const logout = async () => {
  await sleep(300);
  useDemoStore.getState().setRole('guest');
};
