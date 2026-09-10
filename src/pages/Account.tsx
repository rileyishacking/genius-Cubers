import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/* =========================================================
   صفحة الحساب: شاشتان منفصلتان، دخول وحساب جديد.

   لا تبويبات: التبويب أعلى الصفحة ورابط التبديل أسفلها كانا
   يؤدّيان الوظيفة نفسها، فيتردّد الزائر بينهما. صار لكل وضع
   رابطه، والتبديل من مكان واحد أسفل النموذج.

   كلمة المرور تُطلب وتُتحقّق لكنها لا تُخزَّن ولا تُرسل: لا خادم
   يتحقق منها بعد.
   ========================================================= */

type Mode = 'login' | 'signup';

export default function Account() {
  const { user, signIn, signUp, signInWithGoogle, signOut } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  /* الوضع يُقرأ من الرابط لا من حالة داخلية: الدخول وإنشاء الحساب
     شاشتان منفصلتان، والتبديل بينهما تنقّل حقيقي. */
  const mode: Mode = new URLSearchParams(loc.search).get('mode') === 'signup' ? 'signup' : 'login';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const isNew = mode === 'signup';

  useEffect(() => { setErr(''); }, [mode]);
  const swap = () => nav(`/account?mode=${isNew ? 'login' : 'signup'}`);

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

    /* إن كان تأكيد البريد مفعّلاً فلا جلسة بعد التسجيل: نطلب
       من الزائر يفتح بريده بدل ما نوديه لصفحة ما راح تعرفه. */
    if (isNew && res.needsConfirm) { setSent(true); return; }
    nav('/arena');
  };

  if (user) {
    return (
      <main className="acct">
        <div className="acct__card acct__card--done">
          <h1>أهلاً {user.name}</h1>
          <p className="acct__sub">حسابك شغّال. أوقاتك تنحفظ بلوحة الصدارة.</p>
          <Link className="acct__go" to="/arena">روح للحلبة</Link>
          <button type="button" className="acct__ghost" onClick={signOut}>تسجيل الخروج</button>
        </div>
      </main>
    );
  }

  if (sent) {
    return (
      <main className="acct">
        <div className="acct__card acct__card--done">
          <h1>افحص بريدك</h1>
          <p className="acct__sub">
            دزّينالك رسالة تأكيد على <b dir="ltr">{email.trim()}</b>. افتحها واضغط
            الرابط، وبعدها ارجع وسجّل دخولك.
          </p>
          <button type="button" className="acct__ghost" onClick={() => { setSent(false); swap(); }}>
            روح لتسجيل الدخول
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="acct">
      <div className="acct__card">
        <h1>{isNew ? 'حساب جديد' : 'تسجيل الدخول'}</h1>
        <p className="acct__sub">املي معلوماتك</p>

        <form onSubmit={submit} noValidate>
          {isNew && (
            <label className="fld">
              <span className="fld__k">الاسم <i>*</i></span>
              <input value={name} onChange={e => setName(e.target.value)}
                     autoComplete="name" placeholder="أيهم" />
            </label>
          )}

          <label className="fld">
            <span className="fld__k">البريد الإلكتروني <i>*</i></span>
            <input value={email} onChange={e => setEmail(e.target.value)}
                   type="email" inputMode="email" dir="ltr"
                   autoComplete="email" placeholder="you@example.com" />
          </label>

          <label className="fld">
            <span className="fld__k">كلمة المرور <i>*</i></span>
            <span className="fld__wrap">
              <input value={pass} onChange={e => setPass(e.target.value)}
                     type={show ? 'text' : 'password'} dir="ltr"
                     autoComplete={isNew ? 'new-password' : 'current-password'} />
              <button type="button" className="fld__eye" onClick={() => setShow(s => !s)}
                      aria-label={show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>
                {show ? (
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                    <path d="M3 3l18 18M10.6 10.7a2 2 0 002.8 2.8" />
                    <path d="M6.7 6.9C4.6 8.2 3 10 2 12c2 3.6 5.6 6 10 6 1.7 0 3.2-.3 4.6-1M9.9 5.2A9.9 9.9 0 0112 5c4.4 0 8 2.4 10 7-.6 1.1-1.3 2.1-2.1 2.9" />
                  </svg>
                ) : (
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </span>
          </label>

          {!isNew && (
            <div className="acct__row">
              <label className="acct__rem">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                <span>تذكرني</span>
              </label>
              <span className="acct__soon" title="يحتاج ربط الخادم">نسيت كلمة المرور؟ قريباً</span>
            </div>
          )}

          {err && <p className="acct__err" role="alert">{err}</p>}

          <button type="submit" className="acct__go" disabled={busy}>
            {busy ? 'لحظة…' : isNew ? 'أنشئ الحساب' : 'تسجيل الدخول'}
          </button>
        </form>

        <p className="acct__or"><span>أو</span></p>

        <button type="button" className="acct__google" disabled={busy}
                onClick={async () => {
                  setErr(''); setBusy(true);
                  const r = await signInWithGoogle();
                  if (!r.ok) { setBusy(false); setErr(r.message); }
                  /* عند النجاح المتصفح ينتقل إلى Google، فلا نُطفئ busy */
                }}>
          <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M21.6 12.2c0-.7-.06-1.4-.18-2H12v3.8h5.4a4.6 4.6 0 01-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"/>
            <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0012 22z"/>
            <path fill="#FBBC05" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 000 9.2z"/>
            <path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 003.1 7.4L6.4 10c.8-2.3 3-4 5.6-4z"/>
          </svg>
          المتابعة بحساب Google
        </button>

        <p className="acct__swap">
          {isNew ? 'عندك حساب؟ ' : 'ما عندك حساب؟ '}
          <button type="button" onClick={swap}>
            {isNew ? 'سجّل الدخول' : 'أنشئ واحداً'}
          </button>
        </p>

      </div>
    </main>
  );
}
