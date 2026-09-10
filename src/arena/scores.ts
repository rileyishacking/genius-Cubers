/* =========================================================
   تخزين أزمنة الحل.

   ملاحظة مهمة: هذه نسخة محلية مؤقتة — الأوقات محفوظة في متصفح
   الزائر فقط، فكل واحد يشوف لوحته هو. لوحة صدارة مشتركة حقيقية
   تحتاج ربط Supabase، وعندها نكتب تنفيذاً ثانياً لنفس الواجهة
   ونبدّل السطر الأخير في هذا الملف وحده. الصفحة لا تتغيّر.

   نفس نمط src/auth/AuthContext.tsx.
   ========================================================= */

export type Solve = {
  id: string;
  name: string;
  email: string;
  ms: number;
  moves: number;
  at: string;
};

export interface ScoreStore {
  submit(s: Omit<Solve, 'id'>): Promise<Solve>;
  topTimes(limit: number): Promise<Solve[]>;
  myTimes(email: string, limit: number): Promise<Solve[]>;
  /** هل التخزين متاح فعلاً؟ الصفحة تنبّه الزائر إذا لا */
  available(): boolean;
}

const KEY = 'genius-solves-v1';

const isSolve = (v: unknown): v is Solve => {
  if (typeof v !== 'object' || v === null) return false;
  const s = v as Record<string, unknown>;
  return typeof s.id === 'string' && typeof s.name === 'string' && typeof s.email === 'string'
    && typeof s.ms === 'number' && Number.isFinite(s.ms) && s.ms > 0
    && typeof s.moves === 'number' && typeof s.at === 'string';
};

/* التخزين قد يكون معطّلاً (تصفّح خاص، أو إعدادات تمنع بيانات المواقع)،
   فكل قراءة وكتابة داخل try والصفحة تشتغل حتى لو فشلت. */
const read = (): Solve[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isSolve) : [];
  } catch {
    return [];                       /* بيانات تالفة أو تخزين مقفل: نبدأ فارغين */
  }
};

const write = (rows: Solve[]): boolean => {
  try { localStorage.setItem(KEY, JSON.stringify(rows)); return true; }
  catch { return false; }
};

const newId = () => {
  try { return crypto.randomUUID(); }
  catch { return `s_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`; }
};

export const localStore: ScoreStore = {
  async submit(s) {
    const row: Solve = { ...s, id: newId() };
    const rows = read();
    rows.push(row);
    write(rows);                     /* الفشل لا يمنع عرض الوقت للزائر */
    return row;
  },

  async topTimes(limit) {
    /* أفضل وقت مفرد لكل لاعب، حتى لا يحتل شخص واحد اللوحة كلها */
    const best = new Map<string, Solve>();
    for (const r of read()) {
      const cur = best.get(r.email);
      if (!cur || r.ms < cur.ms) best.set(r.email, r);
    }
    return [...best.values()].sort((a, b) => a.ms - b.ms).slice(0, limit);
  },

  async myTimes(email, limit) {
    return read()
      .filter(r => r.email === email)
      .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
      .slice(0, limit);
  },

  available() {
    try {
      const probe = '__genius_probe__';
      localStorage.setItem(probe, '1');
      localStorage.removeItem(probe);
      return true;
    } catch { return false; }
  },
};

/* ← السطر الوحيد الذي يتغيّر عند الانتقال إلى Supabase */
export const store: ScoreStore = localStore;
