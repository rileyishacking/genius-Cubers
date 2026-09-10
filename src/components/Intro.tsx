/* القسم التعريفي بالصفحة الرئيسية.

   البطاقات ليست مستطيلات عامة: كل واحدة وجه مكعب مصغّر، وشبكته
   تحكي الحالة التي يصفها العنوان — مخلوط، ثم نصفه انحلّ، ثم
   انحلّ كاملاً. الترتيب من اليمين لليسار مثل القراءة، فيقرأ
   الزائر الرحلة بلمحة قبل أن يقرأ كلمة. */

import { useEffect, useState } from 'react';

const R = '#D32B18', O = '#E8862A', Y = '#F5C518', G = '#109B57', B = '#2F6FE0', W = '#FAFAFA';

/* الكلمة تنقلب مثل ما ينقلب وجه المكعب: نفس حركة المنتج،
   مطبّقة على الخط. عنصر واحد يتحرك في القسم كله، فيمسك العين
   بدل أن يبقى النص ساكناً. */
const TURNS = [
  { w: 'للتميّز', c: '#8A5D0C' },
  { w: 'للذكاء', c: B },
  { w: 'للتحدي', c: R },
  { w: 'للإتقان', c: G },
];

function WordTurn() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    /* المؤقّت يقف مع التبويب المخفي: لا فائدة من تدوير كلمة لا يراها أحد */
    let id = 0;
    const tick = () => setI(n => (n + 1) % TURNS.length);
    const start = () => { if (!id) id = window.setInterval(tick, 2300); };
    const stop = () => { if (id) { clearInterval(id); id = 0; } };
    const onVis = () => (document.hidden ? stop() : start());
    start();
    document.addEventListener('visibilitychange', onVis);
    return () => { stop(); document.removeEventListener('visibilitychange', onVis); };
  }, []);

  return (
    <span className="turnw">
      {/* المفتاح يعيد تركيب العنصر فتُعاد الحركة مع كل كلمة */}
      <span className="turnw__in" key={i} style={{ color: TURNS[i].c }}>
        {TURNS[i].w}
      </span>
      {/* قارئ الشاشة يقرأ الجملة كاملة مرة واحدة بدل أن تتبدّل تحته */}
      <span className="sr-only">للتميّز والذكاء والتحدي والإتقان</span>
    </span>
  );
}

type Face = { id: string; title: string; body: string; grid: string[] };

const FACES: Face[] = [
  {
    id: 'focus',
    title: 'تطوّر التركيز',
    body: 'كل محاولة تشدّ انتباهك لخطوة واحدة، فيطول نفَسك على المهمة الواحدة.',
    grid: [R, B, Y, G, R, W, B, Y, G],           /* مخلوط */
  },
  {
    id: 'solve',
    title: 'تُحسّن حل المشكلات',
    body: 'تتعلّم تقسيم اللخبطة إلى خطوات، وهذي مهارة تنفعك برّا المكعب هم.',
    grid: [O, O, O, O, O, O, B, G, Y],           /* صفّان انتظما */
  },
  {
    id: 'joy',
    title: 'متعة الإنجاز',
    body: 'لحظة ما ينحل المكعب بين إيدك، تعرف إنك قدرت — وتريد التالي فوراً.',
    grid: [G, G, G, G, G, G, G, G, G],           /* انحلّ */
  },
];

export default function Intro() {
  return (
    <section className="intro" id="intro" aria-labelledby="introTitle">
      <div className="wrap">
        <h2 className="intro__title" id="introTitle">
          مرحباً بكم في <span className="tint-gold">GENIUS</span>
        </h2>

        <p className="intro__hook">
          وجهتك الأولى <WordTurn />
        </p>

        <p className="intro__lede">
          أول متجر إلكتروني يوفّر لك أحدث مكعبات روبيك الاحترافية وأرقى ألعاب
          التفكير، لتستمتع بتجربة تجمع بين المتعة والتحدي لتطوير مهاراتك الذهنية.
        </p>

        <p className="intro__turn">
          ألعاب الذكاء ليست مجرد تسلية. هي تمرين يومي لعقلك.
        </p>

        <div className="faces">
          {FACES.map(f => (
            <article className="face" key={f.id}>
              <div className="face__grid" aria-hidden="true">
                {f.grid.map((c, i) => (
                  <span key={i} style={{ background: c }} />
                ))}
              </div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
