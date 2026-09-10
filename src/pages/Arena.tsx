import { useCallback, useEffect, useRef, useState } from 'react';
import CubePlayground, { type SolveResult } from '../components/CubePlayground';
import CourseCallout from '../components/CourseCallout';
import { useAuth } from '../auth/AuthContext';
import { store, type Solve } from '../arena/scores';
import { clockCs, shortDate } from '../arena/format';

/* =========================================================
   الحلبة: يحل الزائر المكعب تحت مؤقّت، ووقته يدخل لوحة الصدارة.
   الترتيب بأفضل وقت مفرد، ووقت واحد لكل لاعب حتى لا يحتل
   شخص واحد اللوحة كلها.
   ========================================================= */

const TOP = 10;
const MINE = 5;

export default function Arena() {
  const { user, openAuth } = useAuth();
  const [top, setTop] = useState<Solve[]>([]);
  const [mine, setMine] = useState<Solve[]>([]);
  const [last, setLast] = useState<SolveResult | null>(null);
  const [saved, setSaved] = useState(false);
  const canSave = store.available();

  /* وقت أُنجز قبل تسجيل الدخول: يُحفظ في الذاكرة فقط. لو سجّل
     الزائر خلال نفس الجلسة نحفظه له، ولو غادر الصفحة ضاع. */
  const pending = useRef<SolveResult | null>(null);

  const load = useCallback(async () => {
    setTop(await store.topTimes(TOP));
    setMine(user ? await store.myTimes(user.email, MINE) : []);
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  const record = useCallback(async (r: SolveResult) => {
    if (!user) return false;
    await store.submit({ name: user.name, email: user.email, ms: r.ms, moves: r.moves, at: new Date().toISOString() });
    await load();
    return true;
  }, [user, load]);

  const onSolve = useCallback((r: SolveResult) => {
    setLast(r);
    if (!user) { pending.current = r; setSaved(false); return; }
    pending.current = null;
    void record(r).then(setSaved);
  }, [user, record]);

  /* سجّل الزائر بعد ما حلّ: نحفظ وقته المعلّق بدل ما يضيع */
  useEffect(() => {
    if (!user || !pending.current) return;
    const r = pending.current;
    pending.current = null;
    void record(r).then(setSaved);
  }, [user, record]);

  const best = mine.length ? Math.min(...mine.map(s => s.ms)) : null;

  return (
    <main className="arena">
      <div className="wrap">
        {/* خارج .section-head عمداً: قواعدها العامة على p تسرّبت
            إلى بطاقة النداء وتغلّبت على أنماطها. */}
        <h2 className="arena-title tint-gold">الحلبة</h2>
        <CourseCallout />
        <p className="arena-lede tint-cube">اخلط المكعب وحلّه بأسرع وقت. المؤقّت يبدأ بأول حركة منك، لا عند الخلط.</p>
      </div>

      <CubePlayground onSolve={onSolve} bare />

      <div className="wrap">
        {/* نتيجة آخر محاولة */}
        {last && (
          <div className={'arena-result' + (saved ? ' arena-result--saved' : '')} role="status">
            <p className="arena-result__time">{clockCs(last.ms)}</p>
            <p className="arena-result__meta">{last.moves} حركة</p>
            {user ? (
              <p className="arena-result__note">
                {saved ? 'انحفظ وقتك بلوحة الصدارة.' : 'ما قدرنا نحفظ الوقت. تخزين المتصفح مقفل.'}
              </p>
            ) : (
              <p className="arena-result__note">
                سجّل دخولك حتى ينحفظ وقتك بلوحة الصدارة.{' '}
                <button type="button" className="arena-link" onClick={() => openAuth('signup')}>
                  سجّل الآن
                </button>
              </p>
            )}
          </div>
        )}

        {!canSave && (
          <p className="arena-warn">
            تخزين المتصفح مقفل عندك، فالأوقات ما راح تنحفظ. تكدر تلعب عادي.
          </p>
        )}

        <div className="arena-grid">
          {/* سجلّك الشخصي */}
          {user && (
            <section className="arena-card" aria-labelledby="mineTitle">
              <h3 id="mineTitle">سجلّك</h3>
              {best !== null ? (
                <>
                  <p className="arena-best">
                    <span>أفضل وقت</span>
                    <b>{clockCs(best)}</b>
                  </p>
                  <ol className="arena-mine">
                    {mine.map(s => (
                      <li key={s.id}>
                        <b>{clockCs(s.ms)}</b>
                        <span>{s.moves} حركة</span>
                        <span className="arena-when">{shortDate(s.at)}</span>
                      </li>
                    ))}
                  </ol>
                </>
              ) : (
                <p className="arena-empty">ما عندك محاولات بعد. اخلط المكعب وابدي.</p>
              )}
            </section>
          )}

          {/* لوحة الصدارة */}
          <section className="arena-card" aria-labelledby="topTitle">
            <h3 id="topTitle">لوحة الصدارة</h3>
            {top.length ? (
              <ol className="arena-top">
                {top.map((s, i) => (
                  <li key={s.id} className={user && s.email === user.email ? 'me' : ''}>
                    <span className="arena-rank">{i + 1}</span>
                    <span className="arena-name">{s.name}</span>
                    <b>{clockCs(s.ms)}</b>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="arena-empty">
                اللوحة فارغة. أول واحد يحل المكعب يصير بالصدارة.
              </p>
            )}
            <p className="arena-note">
              الأوقات محفوظة بمتصفحك حالياً. لمّا نربط الحسابات راح تصير اللوحة مشتركة بين كل اللاعبين.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
