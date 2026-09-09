import { useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

/* نافذة تسجيل الدخول / إنشاء الحساب */
export default function AuthModal() {
  const { ask, closeAuth, signIn, openAuth } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ask) return;
    setErr('');
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAuth(); };
    document.addEventListener('keydown', onKey);
    box.current?.querySelector('input')?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [ask, closeAuth]);

  if (!ask) return null;
  const isNew = ask === 'signup';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim(), m = email.trim();
    if (isNew && n.length < 2) return setErr('اكتب اسمك.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m)) return setErr('البريد غير صحيح.');
    signIn(isNew ? n : (n || m.split('@')[0]), m);
  };

  return (
    <div className="amodal" role="dialog" aria-modal="true" aria-label={isNew ? 'إنشاء حساب' : 'تسجيل الدخول'}>
      <div className="amodal__veil" onClick={closeAuth} />
      <div className="amodal__box" ref={box}>
        <button type="button" className="amodal__x" onClick={closeAuth} aria-label="إغلاق">✕</button>

        <h2>{isNew ? 'إنشاء حساب' : 'تسجيل الدخول'}</h2>
        <p className="amodal__sub">
          {isNew ? 'دقيقة واحدة، وتفتح لك الحلبة كاملة.' : 'أهلاً بعودتك — دخولك يحفظ أوقاتك وترتيبك.'}
        </p>

        <form onSubmit={submit}>
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

          {err && <p className="amodal__err">{err}</p>}
          <button type="submit" className="btn btn-gold amodal__go">{isNew ? 'أنشئ الحساب وادخل' : 'دخول'}</button>
        </form>

        <p className="amodal__swap">
          {isNew ? 'عندك حساب؟ ' : 'ما عندك حساب؟ '}
          <button type="button" onClick={() => openAuth(isNew ? 'login' : 'signup')}>
            {isNew ? 'سجّل الدخول' : 'أنشئ واحداً'}
          </button>
        </p>

        <p className="amodal__note">
          نسخة تجريبية: الحساب محفوظ على جهازك فقط بلا كلمة سر. الحسابات الكاملة
          ولوحة الصدارة المشتركة تُفعَّل عند ربط قاعدة البيانات.
        </p>
      </div>
    </div>
  );
}
