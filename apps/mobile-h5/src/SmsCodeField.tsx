import { useEffect, useRef, useState } from 'react';
import { Icon, toast } from '@aba/ui';
import { DEMO_CODE, sendSms as apiSendSms, callVoice } from '@aba/mock';

// 0722：验证码输入行 + 语音验证码兜底（登录 / 绑定 / 换绑三处共用）。
// 交互：发送短信后 60s 重发倒计时；倒计时结束仍未输入 → 出现「接听语音电话」入口；
// 点击即拨打（点击本身即同意，不加确认弹窗），原地显示来电号段提示避免当骚扰电话拒接；
// 0724：拨打中卡片常驻「xx s 后可重拨」倒计时，归零后卡内出现「再次拨打」，重拨有 toast 反馈；
// 语音码与短信码走同一校验（演示码 123456，输入框下方常驻提示）。95013 为演示号段，实际以供应商分配为准。
export function SmsCodeField({ code, onCode, validPhone }: { code: string; onCode: (v: string) => void; validPhone: () => boolean }) {
  const [sent, setSent] = useState(false);
  const [smsCd, setSmsCd] = useState(0);
  const [voice, setVoice] = useState<'idle' | 'calling' | 'recall'>('idle');
  const [voiceCd, setVoiceCd] = useState(0);
  // 0724b：倒计时按「截止时间戳」计算剩余秒数——浏览器对后台标签页 / 锁屏会节流 setInterval，
  // 逐秒 -1 的写法在用户切去微信等验证码时会变慢数倍，语音入口迟迟不出现；deadline 制切回即校准。
  const smsDl = useRef(0);
  const voiceDl = useRef(0);
  const ticking = smsCd > 0 || voiceCd > 0;
  useEffect(() => {
    if (!ticking) return;
    const tick = () => {
      setSmsCd(Math.max(0, Math.ceil((smsDl.current - Date.now()) / 1000)));
      setVoiceCd(Math.max(0, Math.ceil((voiceDl.current - Date.now()) / 1000)));
    };
    const t = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [ticking]);
  useEffect(() => {
    if (voice === 'calling' && voiceCd === 0) setVoice('recall');
  }, [voice, voiceCd]);

  const sendSms = () => {
    if (smsCd > 0) return;
    if (!validPhone()) return toast('请输入正确的 11 位手机号');
    setSent(true);
    smsDl.current = Date.now() + 60_000;
    setSmsCd(60);
    apiSendSms();
    toast('验证码已发送');
  };
  const call = () => {
    setVoice('calling');
    voiceDl.current = Date.now() + 60_000;
    setVoiceCd(60);
    callVoice();
  };
  const recall = () => {
    toast('正在重新拨打，请留意来电');
    call();
  };
  const showVoiceEntry = sent && smsCd === 0 && !code && voice === 'idle';

  return (
    <div className="pf">
      <label>验证码</label>
      <div className="pin">
        <Icon id="i-lock" />
        <input inputMode="numeric" maxLength={6} placeholder="请输入验证码" value={code} onChange={(e) => onCode(e.target.value.replace(/\D/g, ''))} />
        <span className={'get' + (smsCd > 0 ? ' dim' : ' tap')} onClick={sendSms}>
          {smsCd > 0 ? `${smsCd}s 后重发` : sent ? '重新发送' : '获取验证码'}
        </span>
      </div>
      <div className="otp-demo-hint">演示码：{DEMO_CODE}</div>
      {showVoiceEntry && (
        <div className="voice-otp">
          <span className="link tap" onClick={call}>
            <Icon id="i-phone" w={13} h={13} />
            未收到短信验证码？接听语音电话获取
          </span>
        </div>
      )}
      {voice === 'calling' && (
        <div className="voice-otp">
          <div className="calling">
            <span className="v-ic">
              <Icon id="i-phone" w={14} h={14} />
            </span>
            <span className="v-txt">语音电话拨打中 · 来电以 <b>95013</b> 开头，请留意接听</span>
            <span className="cd">{voiceCd}s 后可重拨</span>
          </div>
        </div>
      )}
      {voice === 'recall' && (
        <div className="voice-otp">
          <div className="calling idle">
            <span className="v-ic">
              <Icon id="i-phone" w={14} h={14} />
            </span>
            <span className="v-txt">未接到电话？</span>
            <span className="retry tap" onClick={recall}>再次拨打</span>
          </div>
        </div>
      )}
    </div>
  );
}
