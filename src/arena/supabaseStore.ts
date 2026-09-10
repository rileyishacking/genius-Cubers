import { supabase } from '../lib/supabase';
import type { ScoreStore, Solve } from './scores';

/* =========================================================
   تخزين الأوقات في Supabase: لوحة صدارة مشتركة بين كل اللاعبين.

   الصفوف يكتبها لاعبون آخرون، فتُعامَل كبيانات لا كأوامر.
   الحماية في قاعدة البيانات نفسها: RLS تسمح للجميع بالقراءة،
   ولا تسمح لأحد بكتابة وقت باسم غيره.
   ========================================================= */

/* الاسم المعروض يعيش في جدول profiles لا في auth.users، لأن
   بيانات auth غير مقروءة للعامة واللوحة تحتاج تعرض أسماء. */
type Row = { id: string; user_id: string; name: string | null; ms: number; moves: number; created_at: string };

const toSolve = (r: Row): Solve => ({
  id: r.id,
  name: r.name?.trim() || 'لاعب',
  userKey: r.user_id,
  ms: r.ms,
  moves: r.moves,
  at: r.created_at,
});

export const supabaseStore: ScoreStore = {
  async submit(s) {
    if (!supabase) throw new Error('Supabase غير مهيّأ');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('لا يمكن تسجيل وقت بلا حساب');

    const { data, error } = await supabase
      .from('solves')
      .insert({ user_id: user.id, ms: Math.round(s.ms), moves: s.moves })
      .select('id, user_id, ms, moves, created_at')
      .single();
    if (error) throw error;

    return toSolve({ ...(data as Omit<Row, 'name'>), name: s.name });
  },

  async topTimes(limit) {
    if (!supabase) return [];
    /* leaderboard عرض يعطي أفضل وقت لكل لاعب: صفّ واحد لكل
       حساب حتى لا يحتل شخص واحد اللوحة كلها. */
    const { data, error } = await supabase
      .from('leaderboard')
      .select('id, user_id, name, ms, moves, created_at')
      .order('ms', { ascending: true })
      .limit(limit);
    if (error) { console.error('[GENIUS] تعذّر جلب لوحة الصدارة', error.message); return []; }
    return (data as Row[]).map(toSolve);
  },

  async myTimes(_userId, limit) {
    if (!supabase) return [];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('solves')
      .select('id, user_id, ms, moves, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) { console.error('[GENIUS] تعذّر جلب سجلّك', error.message); return []; }
    return (data as Omit<Row, 'name'>[]).map(r => toSolve({ ...r, name: null }));
  },

  available() {
    return Boolean(supabase);
  },
};
