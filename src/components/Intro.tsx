/* القسم التعريفي بالصفحة الرئيسية.

   البطاقات ليست مستطيلات عامة: كل واحدة وجه مكعب مصغّر، وشبكته
   تحكي الحالة التي يصفها العنوان — مخلوط، ثم نصفه انحلّ، ثم
   انحلّ كاملاً. الترتيب من اليمين لليسار مثل القراءة، فيقرأ
   الزائر الرحلة بلمحة قبل أن يقرأ كلمة. */

const R = '#D32B18', O = '#E8862A', Y = '#F5C518', G = '#109B57', B = '#2F6FE0', W = '#FAFAFA';

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

        <p className="intro__lede">
          وجهتك الأولى للتميّز والذكاء. أول متجر إلكتروني يوفّر لك أحدث مكعبات
          روبيك الاحترافية وأرقى ألعاب التفكير، لتستمتع بتجربة تجمع بين المتعة
          والتحدي لتطوير مهاراتك الذهنية.
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
