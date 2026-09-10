import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/* =========================================================
   حساب المستخدم — عبر Supabase Auth.

   كلمة المرور حقيقية الآن: تُرسل إلى Supabase وتُخزَّن مجزّأة
   هناك، ولا تمر بأي تخزين محلي. الاسم المعروض يعيش في جدول
   profiles لأن بيانات auth غير مقروءة للعامة، ولوحة الصدارة
   تحتاج تعرض أسماء اللاعبين.
   ========================================================= */
export type User = { id: string; name: string; email: string; since: string };

/* needsConfirm: سُجّل الحساب لكن لا جلسة بعد، لأن تأكيد البريد
   مفعّل. الصفحة تطلب من الزائر يفتح بريده بدل أن تنقله لصفحة
   لا تعرفه فيها. */
type Res = { ok: true; needsConfirm?: boolean } | { ok: false; message: string };

type Ctx = {
  user: User | null;
  ready: boolean;
  ask: 'login' | 'signup' | null;
  openAuth: (m: 'login' | 'signup') => void;
  closeAuth: () => void;
  signUp: (name: string, email: string, pass: string) => Promise<Res>;
  signIn: (email: string, pass: string) => Promise<Res>;
  signOut: () => void;
};

const AuthCtx = createContext<Ctx | null>(null);

/* رسائل Supabase إنجليزية وتقنية، فنترجم المتكرّر منها */
const arabize = (m: string): string => {
  const t = m.toLowerCase();
  if (t.includes('invalid login credentials')) return 'البريد أو كلمة المرور غلط.';
  if (t.includes('already registered') || t.includes('already been registered')) return 'هذا البريد عنده حساب. سجّل دخولك.';
  if (t.includes('password should be')) return 'كلمة المرور قصيرة. لازم ٨ أحرف على الأقل.';
  if (t.includes('unable to validate email') || t.includes('invalid email')) return 'البريد غير صحيح.';
  if (t.includes('email not confirmed')) return 'لازم تأكّد بريدك أول. شوف رسالة التأكيد.';
  if (t.includes('rate limit') || t.includes('too many')) return 'محاولات كثيرة. انتظر شوية وجرّب مرة ثانية.';
  if (t.includes('failed to fetch') || t.includes('network')) return 'ما وصلنا للخادم. تأكد من اتصالك بالإنترنت.';
  return 'صار خطأ. جرّب مرة ثانية.';
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [ask, setAsk] = useState<'login' | 'signup' | null>(null);

  /* الاسم من profiles، وإن غاب الصف نرجع لبريد الحساب */
  const hydrate = useCallback(async (id: string, email: string, created: string) => {
    let name = email.split('@')[0];
    if (supabase) {
      const { data } = await supabase.from('profiles').select('name').eq('id', id).maybeSingle();
      if (data?.name) name = data.name;
    }
    setUser({ id, name, email, since: created });
  }, []);

  useEffect(() => {
    if (!supabase) { setReady(true); return; }

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user;
      if (u) void hydrate(u.id, u.email ?? '', u.created_at ?? new Date().toISOString());
      setReady(true);
    });

    /* الجلسة تتغيّر من تبويب آخر أو عند انتهاء الرمز، فنتابعها */
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user;
      if (u) void hydrate(u.id, u.email ?? '', u.created_at ?? new Date().toISOString());
      else setUser(null);
    });
    return () => sub.subscription.unsubscribe();
  }, [hydrate]);

  const signUp = useCallback(async (name: string, email: string, pass: string): Promise<Res> => {
    if (!supabase) return { ok: false, message: 'الحسابات غير مهيّأة على هذه النسخة.' };
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password: pass });
    if (error) return { ok: false, message: arabize(error.message) };

    /* لو كان تأكيد البريد مفعّلاً فلا جلسة بعد، ويُكتب الملف عند أول دخول */
    if (data.session && data.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, name: name.trim() });
      await hydrate(data.user.id, data.user.email ?? '', data.user.created_at);
      setAsk(null);
      return { ok: true };
    }
    setAsk(null);
    return { ok: true, needsConfirm: true };
  }, [hydrate]);

  const signIn = useCallback(async (email: string, pass: string): Promise<Res> => {
    if (!supabase) return { ok: false, message: 'الحسابات غير مهيّأة على هذه النسخة.' };
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pass });
    if (error) return { ok: false, message: arabize(error.message) };

    /* ضمان وجود الملف: بدونه لا يظهر اللاعب في لوحة الصدارة */
    if (data.user) {
      const fallback = (data.user.email ?? '').split('@')[0];
      const { data: prof } = await supabase.from('profiles').select('id').eq('id', data.user.id).maybeSingle();
      if (!prof) await supabase.from('profiles').upsert({ id: data.user.id, name: fallback });
      await hydrate(data.user.id, data.user.email ?? '', data.user.created_at);
    }
    setAsk(null);
    return { ok: true };
  }, [hydrate]);

  const signOut = useCallback(() => {
    void supabase?.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo<Ctx>(() => ({
    user, ready, ask,
    openAuth: m => setAsk(m),
    closeAuth: () => setAsk(null),
    signUp, signIn, signOut,
  }), [user, ready, ask, signUp, signIn, signOut]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const c = useContext(AuthCtx);
  if (!c) throw new Error('useAuth خارج AuthProvider');
  return c;
}
