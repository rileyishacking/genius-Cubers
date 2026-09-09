import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

/* =========================================================
   حساب المستخدم.

   ملاحظة مهمة: هذه نسخة محلية مؤقتة — الجلسة محفوظة في متصفح
   الزائر فقط، بلا خادم وبلا كلمة سر. الغرض منها أن تشتغل بوابة
   الحلبة الآن. الحسابات الحقيقية (كلمة سر، تحقّق بريد، لوحة
   صدارة مشتركة) تحتاج ربط Supabase، وعندها نبدّل هذا الملف
   وحده ويبقى باقي الموقع كما هو.
   ========================================================= */
export type User = { name: string; email: string; since: string };

type Ctx = {
  user: User | null;
  ready: boolean;
  /** الشاشة المطلوبة: null = مغلقة */
  ask: 'login' | 'signup' | null;
  openAuth: (m: 'login' | 'signup') => void;
  closeAuth: () => void;
  signIn: (name: string, email: string) => void;
  signOut: () => void;
};

const KEY = 'genius-user-v1';
const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [ask, setAsk] = useState<'login' | 'signup' | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const u = JSON.parse(raw);
        if (u && typeof u.name === 'string' && typeof u.email === 'string') setUser(u);
      }
    } catch { /* تخزين معطّل: نبدأ بلا حساب */ }
    setReady(true);
  }, []);

  const signIn = useCallback((name: string, email: string) => {
    const u: User = { name: name.trim(), email: email.trim().toLowerCase(), since: new Date().toISOString() };
    setUser(u);
    setAsk(null);
    try { localStorage.setItem(KEY, JSON.stringify(u)); } catch { /* لا شيء */ }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    try { localStorage.removeItem(KEY); } catch { /* لا شيء */ }
  }, []);

  const value = useMemo<Ctx>(() => ({
    user, ready, ask,
    openAuth: m => setAsk(m),
    closeAuth: () => setAsk(null),
    signIn, signOut,
  }), [user, ready, ask, signIn, signOut]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const c = useContext(AuthCtx);
  if (!c) throw new Error('useAuth خارج AuthProvider');
  return c;
}
