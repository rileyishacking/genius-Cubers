import { useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

/* نافذة سريعة داخل الصفحة. وجودها إلى جانب /account مقصود:
   اللاعب الذي حلّ توّه ولم يسجّل بعد يخسر وقته لو نقلناه لصفحة
   أخرى، فنسأله هنا ويبقى مكانه. */
export default function AuthModal() {
  const { ask, closeAuth, signIn, signUp, openAuth } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ask) return;
    setErr(''); setSent(false);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAuth(); };
    document.addEventListener('keydown', onKey);
    box.current?.querySelector('input')?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [ask, closeAuth]);

  if (!ask) return null;
  const isNew = ask === 'signup';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim(), m = email.trim();
    if (isNew && n.length < 2) return setErr('اكتب اسمك.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m)) return setErr('البريد غير صحيح.');
    if (pass.length < 8) return setErr('كلمة المرور لازم تكون ٨ أحرف على الأقل.');

    setErr(''); setBusy(true);
    const res = isNew ? await signUp(n, m, pass) : await signIn(m, pass);
    setBusy(false);
    if (!res.ok) return setErr(res.message);
    if (isNew && res.needsConfirm) setSent(true);
    /* عند النجاح مع جلسة، AuthContext يغلق النافذة بنفسه */
  };

  return (
    <div className="amodal" role="dialog" aria-modal="true" aria-label={isNew ? 'إنشاء حساب' : 'تسجيل الدخول'}>
      <div className="amodal__veil" onClick={closeAuth} />
      <div className="amodal__box" ref={box}>
        <button type="button" className="amodal__x" onClick={closeAuth} aria-label="إغلاق">✕</button>

        {sent ? (
          <>
            <h2>افحص بريدك</h2>
            <p className="amodal__sub">
              دزّينالك رسالة تأكيد على <b dir="ltr">{email.trim()}</b>. افتحها واضغط الرابط،
              وبعدها ارجع وسجّل دخولك.
            </p>
          </>
        ) : (
          <>
            <h2>{isNew ? 'إنشاء حساب' : 'تسجيل الدخول'}</h2>
            <p className="amodal__sub">
              {isNew ? 'دقيقة وحدة، وينحفظ وقتك بلوحة الصدارة.' : 'أهلاً بعودتك — دخولك يحفظ أوقاتك وترتيبك.'}
            </p>

            <form onSubmit={submit} noValidate>
              {isNew && (
                <label>
                  <span>الاسم</span>
                  <input value={name} onChange={e => setName(e.target.value)} autoComplete="name" placeholder="أيهم" />
                </label>
              )}
              <label>
                <span>البريد الإلكتروني</span>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" inputMode="email"
                       autoComplete="email" dir="ltr" placeholder="you@example.com" />
              </label>
              <label>
                <span>كلمة المرور</span>
                <input value={pass} onChange={e => setPass(e.target.value)} type="password" dir="ltr"
                       autoComplete={isNew ? 'new-password' : 'current-password'} />
              </label>

              {err && <p className="amodal__err" role="alert">{err}</p>}
              <button type="submit" className="btn btn-gold amodal__go" disabled={busy}>
                {busy ? 'لحظة…' : isNew ? 'أنشئ الحساب وادخل' : 'دخول'}
              </button>
            </form>

            <p className="amodal__swap">
              {isNew ? 'عندك حساب؟ ' : 'ما عندك حساب؟ '}
              <button type="button" onClick={() => openAuth(isNew ? 'login' : 'signup')}>
                {isNew ? 'سجّل الدخول' : 'أنشئ واحداً'}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
