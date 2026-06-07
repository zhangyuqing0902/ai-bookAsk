import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@aba/ui';

const DOCS: Record<string, { title: string; body: string[] }> = {
  terms: {
    title: '用户协议',
    body: [
      '欢迎使用 AI 问书。在使用本服务前,请您仔细阅读并同意本协议的全部条款。',
      '一、服务说明：AI 问书基于机构上传的知识库为您提供问答服务,答案内容由 AI 生成,请结合专业判断使用。',
      '二、账户与登录：您可通过微信或手机号登录;请妥善保管账户信息。',
      '三、会员与永享：会员为订阅制,可随时退订,到期前 72 小时为宽限期;永享内容为一次性买断,永久解锁该单条内容。',
      '四、版权说明：知识库内的图、音、视等内容受版权保护,仅供在线预览,不支持保存与下载。',
    ],
  },
  privacy: {
    title: '隐私政策',
    body: [
      '我们重视并保护您的个人信息。本政策说明我们如何收集、使用与保护您的信息。',
      '一、收集范围：我们仅收集为提供服务所必需的信息,如登录标识、提问记录与订单信息。',
      '二、信息使用：用于会话连续性、权益核验与服务优化,不会用于与服务无关的用途。',
      '三、信息共享：除法律要求外,我们不会向第三方出售或披露您的个人信息。',
      '四、您的权利：您可随时联系客服查询、更正或注销您的账户信息。',
    ],
  },
};

// 用户协议 / 隐私政策（两个独立条目）
export function Agreement() {
  const nav = useNavigate();
  const { type } = useParams();
  const doc = DOCS[type || 'terms'] || DOCS.terms;
  return (
    <>
      <div className="h5-top">
        <div className="ic tap" onClick={() => nav(-1)}>
          <Icon id="i-chevL" w={22} h={22} />
        </div>
        <div className="center">
          <div className="ttl">{doc.title}</div>
        </div>
        <div className="grp" />
      </div>
      <div className="pg">
        <div className="scrollY" style={{ padding: '18px 20px' }}>
          {doc.body.map((p, i) => (
            <p key={i} style={{ fontSize: 13.5, lineHeight: 1.85, color: 'var(--ink-2)', margin: '0 0 14px' }}>
              {p}
            </p>
          ))}
          <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 8 }}>更新日期：2026-06-01</div>
        </div>
      </div>
    </>
  );
}
