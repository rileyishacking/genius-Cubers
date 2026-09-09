import { useRef, useState, type ReactNode, type MouseEvent } from 'react';

type Section = {
  id: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  soon?: boolean;
  tint: string;
  stroke: string;
  icon: ReactNode;
};

const SECTIONS: Section[] = [
  {
    id: 'store',
    title: 'المتجر',
    body: 'مكعبات أصلية واحترافية، بمستويات من المبتدئ إلى الاحترافي.',
    href: '/store',
    cta: 'تصفّح المكعبات',
    tint: '#FDF4E2',
    stroke: '#8A5D0C',
    icon: <><path d="M3 7l9-4 9 4-9 4z" /><path d="M3 7v10l9 4 9-4V7" /><path d="M12 11v10" /></>,
  },
  {
    id: 'arena',
    title: 'الحلبة',
    body: 'العب ويّه محترفين، وخلّي اسمك الأول عليهم.',
    href: '#play',
    cta: 'ادخل الحلبة',
    tint: '#FDEDE6',
    stroke: '#DB4E1B',
    icon: <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l3 2M9 2h6" /></>,
  },
  {
    id: 'academy',
    title: 'الأكاديمية',
    body: 'دروس من كابتن ولاعب منتخب دولي يعلمك من تحت الصفر إلى المتقدّم.',
    href: '/academy',
    cta: 'احجز مقعدك',
    soon: true,
    tint: '#E6F1EC',
    stroke: '#0F6B55',
    icon: <><path d="M3 7l9-4 9 4-9 4z" /><path d="M7 10v5c0 1.7 2.2 3 5 3s5-1.3 5-3v-5" /></>,
  },
];

/* فيديو القصة: تشغيل بالضغط، بالصوت، وأدوات التحكم تظهر بعد أول تشغيل. */
export default function Story() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const play = () => {
    const v = ref.current;
    if (!v) return;
    v.controls = true;
    setPlaying(true);
    v.play().catch(() => setPlaying(false));
  };
  const ended = () => {
    const v = ref.current;
    if (!v) return;
    v.controls = false;
    v.currentTime = 0;
    setPlaying(false);
  };

  /* الروابط الداخلية تمرّر بنعومة بدل قفزة مفاجئة */
  const go = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith('#')) return;
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="story" id="story">
      <div className="wrap">
        <div className="section-head">
          <h2 className="story-h2">
            <span className="tint-cube">هذا</span> هو <span className="tint-gold">GENIUS</span>
          </h2>
        </div>
      </div>

      {/* الفيديو يخرج من حدود العمود ويأخذ عرض الشاشة */}
      <div className="story-stage">
        <div className={'story-video' + (playing ? ' playing' : '')} id="storyBox">
          <video ref={ref} id="storyVid" poster="/media/feat-poster.jpg" preload="metadata" playsInline onEnded={ended}>
            <source src="/media/feat-full.mp4" type="video/mp4" />
          </video>
          <button className="story-play" id="storyPlay" type="button" aria-label="تشغيل الفيديو" onClick={play}>
            <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
            <span>شغّل</span>
          </button>
        </div>
      </div>

      <div className="wrap">
        {/* النكتة تنقلب لموقف: مو مجرد بائع مكعبات */}
        <div className="turn">
          <p className="turn__joke">شفتوا شلون يتعاركون على مكعب واحد؟</p>
          <p className="turn__cta">تعالوا استكشفوا الأقسام وياّنا</p>
        </div>

        <div className="feat-grid">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              className={'feat' + (s.soon ? ' feat--soon' : '')}
              href={s.href}
              onClick={(e) => go(e, s.href)}
            >
              {s.soon && <span className="feat__chip">قريباً</span>}
              <span className="feat__ico" style={{ background: s.tint }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={s.stroke} strokeWidth="2">{s.icon}</svg>
              </span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              <span className="feat__go">
                {s.cta}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="M19 12H5M11 18l-6-6 6-6" />
                </svg>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
