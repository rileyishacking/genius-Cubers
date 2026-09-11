import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/* =========================================================
   صفحة الحساب: كل وضع له رابطه.
     ?mode=login   دخول
     ?mode=signup  حساب جديد
     ?mode=forgot  طلب رابط إعادة تعيين كلمة المرور
     ?mode=reset   وضع كلمة مرور جديدة (يصلها الزائر من رابط البريد)

   كلمة المرور تُرسل إلى Supabase Auth عبر HTTPS وتُخزَّن هناك مجزّأة،
   ولا تمرّ بأي تخزين محلي. الجلسة تبقى محفوظة تلقائياً.
   ========================================================= */

type Mode = 'login' | 'signup' | 'forgot' | 'reset';
const MODES: Mode[] = ['login', 'signup', 'forgot', 'reset'];

function Eye({ show }: { show: boolean }) {
  return show ? (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M3 3l18 18M10.6 10.7a2 2 0 002.8 2.8" />
      <path d="M6.7 6.9C4.6 8.2 3 10 2 12c2 3.6 5.6 6 10 6 1.7 0 3.2-.3 4.6-1M9.9 5.2A9.9 9.9 0 0112 5c4.4 0 8 2.4 10 7-.6 1.1-1.3 2.1-2.1 2.9" />
    </svg>
  ) : (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function Account() {
  const { user, ready, recovery, signIn, signUp, signInWithGoogle, sendReset, setNewPassword, signOut } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  /* الوضع يُقرأ من الرابط لا من حالة داخلية: التبديل بين الشاشات تنقّل حقيقي */
  const q = new URLSearchParams(loc.search).get('mode') as Mode | null;
  const mode: Mode = q && MODES.includes(q) ? q : 'login';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<'confirm' | 'reset' | null>(null);
  const [done, setDone] = useState(false);

  /* رابط البريد المنتهي أو المستعمل يرجع بخطأ في جزء # من العنوان */
  const linkError = new URLSearchParams(loc.hash.replace(/^#/, '')).get('error_description');

  useEffect(() => { setErr(''); setSent(null); }, [mode]);
  const go = (m: Mode) => nav(`/account?mode=${m}`);

  const emailOk = (m: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim(), m = email.trim();
    if (mode === 'signup' && n.length < 2) return setErr('اكتب اسمك.');
    if (!emailOk(m)) return setErr('البريد غير صحيح.');

    if (mode === 'forgot') {
      setErr(''); setBusy(true);
      const res = await sendReset(m);
      setBusy(false);
      if (!res.ok) return setErr(res.message);
      return setSent('reset');
    }

    if (pass.length < 8) return setErr('كلمة المرور لازم تكون ٨ أحرف على الأقل.');
    setErr(''); setBusy(true);
    const res = mode === 'signup' ? await signUp(n, m, pass) : await signIn(m, pass);
    setBusy(false);
    if (!res.ok) return setErr(res.message);

    /* تأكيد البريد مفعّل: لا جلسة بعد التسجيل، فنطلب من الزائر يفتح بريده */
    if (mode === 'signup' && res.needsConfirm) return setSent('confirm');
    nav('/arena');
  };

  const submitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pass.length < 8) return setErr('كلمة المرور لازم تكون ٨ أحرف على الأقل.');
    setErr(''); setBusy(true);
    const res = await setNewPassword(pass);
    setBusy(false);
    if (!res.ok) return setErr(res.message);
    setDone(true);
  };

  const passField = (label: string, autoComplete: string) => (
    <label className="fld">
      <span className="fld__k">{label} <i>*</i></span>
      <span className="fld__wrap">
        <input value={pass} onChange={e => setPass(e.target.value)}
               type={show ? 'text' : 'password'} dir="ltr" autoComplete={autoComplete} />
        <button type="button" className="fld__eye" onClick={() => setShow(s => !s)}
                aria-label={show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>
          <Eye show={show} />
        </button>
      </span>
    </label>
  );

  /* ---------- وضع كلمة مرور جديدة ---------- */
  if (mode === 'reset') {
    if (!ready) return <main className="acct"><div className="acct__card acct__card--done"><p className="acct__sub">لحظة…</p></div></main>;

    if (done) {
      return (
        <main className="acct">
          <div className="acct__card acct__card--done">
            <h1>تم تغيير كلمة المرور</h1>
            <p className="acct__sub">صارت كلمة المرور الجديدة هي اللي تدخل بيها من هسّه.</p>
            <Link className="acct__go" to="/arena">روح للحلبة</Link>
          </div>
        </main>
      );
    }

    if (linkError || !(user && recovery)) {
      return (
        <main className="acct">
          <div className="acct__card acct__card--done">
            <h1>الرابط ما يشتغل</h1>
            <p className="acct__sub">
              {linkError ? 'الرابط انتهت صلاحيته أو انستعمل قبل.' : 'افتح الرابط اللي وصلك على بريدك حتى تغيّر كلمة المرور.'}
            </p>
            <button type="button" className="acct__go" onClick={() => go('forgot')}>اطلب رابط جديد</button>
          </div>
        </main>
      );
    }

    return (
      <main className="acct">
        <div className="acct__card">
          <h1>كلمة مرور جديدة</h1>
          <p className="acct__sub">اكتب كلمة المرور اللي تريدها لحساب <b dir="ltr">{user.email}</b></p>
          <form onSubmit={submitNew} noValidate>
            {passField('كلمة المرور الجديدة', 'new-password')}
            {err && <p className="acct__err" role="alert">{err}</p>}
            <button type="submit" className="acct__go" disabled={busy}>
              {busy ? 'لحظة…' : 'احفظ كلمة المرور'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  /* ---------- مسجّل دخول ---------- */
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

  /* ---------- رسالة انتظار البريد ---------- */
  if (sent) {
    return (
      <main className="acct">
        <div className="acct__card acct__card--done">
          <h1>افحص بريدك</h1>
          <p className="acct__sub">
            {sent === 'confirm'
              ? <>دزّينالك رسالة تأكيد على <b dir="ltr">{email.trim()}</b>. افتحها واضغط الرابط، وبعدها تكدر تدخل.</>
              : <>إذا هذا البريد عنده حساب، راح يوصله رابط لتغيير كلمة المرور على <b dir="ltr">{email.trim()}</b>. إذا ما لكيته، شوف مجلد الرسائل المزعجة.</>}
          </p>
          <button type="button" className="acct__ghost" onClick={() => go('login')}>روح لتسجيل الدخول</button>
        </div>
      </main>
    );
  }

  const isNew = mode === 'signup';
  const isForgot = mode === 'forgot';

  return (
    <main className="acct">
      <div className="acct__card">
        <h1>{isForgot ? 'نسيت كلمة المرور' : isNew ? 'حساب جديد' : 'تسجيل الدخول'}</h1>
        <p className="acct__sub">
          {isForgot ? 'اكتب بريدك ونرسللك رابط تغيّر بيه كلمة المرور.' : 'املي معلوماتك'}
        </p>

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

          {!isForgot && passField('كلمة المرور', isNew ? 'new-password' : 'current-password')}

          {mode === 'login' && (
            <div className="acct__row">
              <button type="button" className="acct__link" onClick={() => go('forgot')}>نسيت كلمة المرور؟</button>
            </div>
          )}

          {err && <p className="acct__err" role="alert">{err}</p>}

          <button type="submit" className="acct__go" disabled={busy}>
            {busy ? 'لحظة…' : isForgot ? 'أرسل الرابط' : isNew ? 'أنشئ الحساب' : 'تسجيل الدخول'}
          </button>
        </form>

        {!isForgot && (
          <>
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
          </>
        )}

        <p className="acct__swap">
          {isForgot ? 'تذكّرتها؟ ' : isNew ? 'عندك حساب؟ ' : 'ما عندك حساب؟ '}
          <button type="button" onClick={() => go(isForgot || isNew ? 'login' : 'signup')}>
            {isForgot || isNew ? 'سجّل الدخول' : 'أنشئ واحداً'}
          </button>
        </p>
      </div>
    </main>
  );
}
