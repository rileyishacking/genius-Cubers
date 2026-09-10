import type { ReactNode } from 'react';

/* القسم التعريفي بالصفحة الرئيسية: يعرّف الزائر بالمتجر قبل
   أن ينزل إلى الأقسام. الفوائد الثلاث مأخوذة من نص التعريف
   نفسه، معروضة كبطاقات ليقرأها الزائر بلمحة. */

type Benefit = { id: string; title: string; body: string; tint: string; stroke: string; icon: ReactNode };

const BENEFITS: Benefit[] = [
  {
    id: 'focus',
    title: 'تطوّر التركيز',
    body: 'كل محاولة تشدّ انتباهك لخطوة واحدة، فيطول نفَسك على المهمة الواحدة.',
    tint: '#E8EFFC', stroke: '#2F6FE0',
    icon: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" /></>,
  },
  {
    id: 'solve',
    title: 'تُحسّن حل المشكلات',
    body: 'تتعلّم تقسيم اللخبطة إلى خطوات، وهذي مهارة تنفعك برّا المكعب هم.',
    tint: '#FDEDE6', stroke: '#DB4E1B',
    icon: <><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" /><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" /></>,
  },
  {
    id: 'joy',
    title: 'متعة الإنجاز',
    body: 'لحظة ما ينحل المكعب بين إيدك، تعرف إنك قدرت — وتريد التالي فوراً.',
    tint: '#E6F1EC', stroke: '#0F6B55',
    icon: <><path d="M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6.1L12 16.8 6.7 19.7l1.1-6.1L3.4 9.4l6-.8z" /></>,
  },
];

export default function Intro() {
  return (
    <section className="intro" id="intro" aria-labelledby="introTitle">
      <div className="wrap">
        <p className="intro__eyebrow">تعرّف علينا</p>

        <h2 className="intro__title" id="introTitle">
          مرحباً بكم في <span className="tint-gold">GENIUS</span>
        </h2>

        <p className="intro__lede">
          وجهتك الأولى للتميّز والذكاء. أول متجر إلكتروني يوفّر لك أحدث مكعبات
          روبيك الاحترافية وأرقى ألعاب التفكير، لتستمتع بتجربة تجمع بين المتعة
          والتحدي لتطوير مهاراتك الذهنية.
        </p>

        <p className="intro__turn">
          ألعاب الذكاء ليست مجرد تسلية، بل هي <b>تمرين يومي لعقلك</b>.
        </p>

        <div className="intro__grid">
          {BENEFITS.map(b => (
            <article className="ibox" key={b.id}>
              <span className="ibox__ico" style={{ background: b.tint }}>
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none"
                     stroke={b.stroke} strokeWidth="1.9" strokeLinejoin="round" aria-hidden="true">
                  {b.icon}
                </svg>
              </span>
              <h3>{b.title}</h3>
              <p>{b.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
