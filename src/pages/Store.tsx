import PuzzleCube, { type Scheme, STANDARD } from '../components/PuzzleCube';
import Pyraminx from '../components/Pyraminx';
import AddToCart from '../cart/AddToCart';
import ChooseHelp from '../components/ChooseHelp';

type Item = {
  id: string;
  name: string;
  en: string;
  scheme: Scheme;
  face?: 'plain' | 'studs';
  body?: number;
  logo?: 'gan' | null;
  tags?: string[];
  /** سطر واحد يقول ليش تختاره */
  lede?: string;
  /** جدول المواصفات: العنوان ثم الشرح */
  specs?: { k: string; v: string }[];
  shape?: 'twist' | 'axis';
  /** السعر بالدينار. غير محدّد = يُطلب بالتواصل */
  price?: number;
  /** 'pyraminx' يستعمل محرّك الهرم بدل محرّك المكعب */
  engine?: 'pyraminx';
  /** آليته الحقيقية ليست ٣×٣، فالمعروض تقريب مؤقت */
  approx?: string;
};

const ITEMS: Item[] = [
  {
    id: 'gan',
    name: 'مكعب GAN المغناطيسي',
    en: 'GAN 3x3 M',
    scheme: STANDARD,
    logo: 'gan',
    tags: ['احترافي', 'مسابقات'],
    lede: 'العلامة الأولى عالمياً في مكعبات المسابقات، ويعتمدها أغلب أبطال العالم.',
    specs: [
      { k: 'نوابض GES Pro+', v: 'اثنا عشر إعداداً للتعديل، تضبط شدّة الدوران على يدك بالضبط.' },
      { k: 'مغانط Turbo', v: 'أربعون مغناطيساً مخفياً تعطي تثبيتاً حاسماً عند نهاية كل دورة.' },
      { k: 'زيت داخلي', v: 'يمنح نعومة وسلاسة أطول عمراً، فيقلّ الاحتياج للصيانة المتكرّرة.' },
      { k: 'نواة جناحية ٢٫٠', v: 'ثبات أعلى ومقاومة أفضل لانحشار القطع أثناء السرعة.' },
      { k: 'السطح', v: 'بدون ملصقات — الألوان من خامة القطعة نفسها فلا تتقشّر.' },
    ],
  },
  {
    id: 'warrior', name: 'مكعب ٣×٣ المغناطيسي', en: 'QiYi Warrior M · Magnetic Version',
    scheme: STANDARD,
    tags: ['٤٨ مغناطيس', 'بدون ملصقات', 'أفضل قيمة'],
    lede: 'مبتدئ إلى متقدم. أفضل قيمة مقابل سعر في فئة المكعبات المغناطيسية.',
    specs: [
      { k: '٤٨ مغناطيساً', v: 'موزّعة على الحواف والزوايا لتثبيت دقيق وإحساس احترافي.' },
      { k: 'محاذاة الحواف والزوايا', v: 'نظام يحاذي الطبقات تلقائياً ويقلل الأخطاء أثناء السرعة.' },
      { k: 'خفيف وسريع', v: 'خفيف الوزن وسريع الاستجابة، مريح للاستعمال الطويل.' },
      { k: 'بدون ملصقات', v: 'ألوان ثابتة لا تتقشّر مع الوقت.' },
      { k: 'يصلح للاثنين', v: 'للتعلّم وللسرعة معاً، فما تحتاج تبدّله لمّا تتطوّر.' },
    ],
  },
  {
    id: 'lego', name: 'مكعب الليغو', en: 'LEGO Cube · Building Block 3x3',
    scheme: { R: 0xe23b2e, L: 0xf5a623, U: 0xf2f2f2, D: 0xf7d117, F: 0x3aa757, B: 0x2a7fd4 },
    face: 'studs', body: 0x1b1b1b,
    tags: ['أطفال', 'هدايا'],
    lede: 'مكعب ٣×٣ مغطّى بقطع بنائية بدل الملصقات. يدور ويُحل كأي مكعب عادي.',
    specs: [
      { k: 'القطع البارزة', v: 'تعطي إحساساً ملموساً مميّزاً، وتمنع انزلاقه من اليد أثناء الحل.' },
      { k: 'قابل للفك', v: 'تنزع القطع وتعيد ترتيبها بألوان مختلفة حسب رغبتك.' },
      { k: 'قطع إضافية', v: 'تأتي معه لبناء مجسمات صغيرة مثل العقرب وأشكال أخرى.' },
      { k: 'منتجان في واحد', v: 'لعبة تركيب ومكعب روبيك — الأنسب للأطفال وكهدية.' },
      { k: 'العمر', v: 'ست سنوات فأكثر.' },
    ],
  },
  {
    id: 'axis', name: 'مكعب المحاور', en: 'QiYi Axis Cube · Black-base & Stickerless',
    scheme: { R: 0xe23b2e, L: 0xffffff, U: 0xffffff, D: 0xf5c518, F: 0x3fa9f5, B: 0x2f6fe0 },
    shape: 'axis', body: 0x141414,
    tags: ['٣×٣ معدّل', 'مقاومة انحشار', 'نسختان'],
    lede: 'متوسط إلى صعب. يفقد شكله عند الخلط، فيجب إعادة الشكل واللون معاً.',
    specs: [
      { k: 'قطع مائلة بأحجام مختلفة', v: 'تفقد المكعب شكله عند الخلط، فالتحدي بصري لا حسابي.' },
      { k: 'نفس آلية ٣×٣', v: 'ونفس الخوارزميات — تحدٍّ جديد بلا ما تتعلّم نظاماً جديداً.' },
      { k: 'نسختان', v: 'خلفية سوداء بالملصقات، ونسخة بدون ملصقات.' },
      { k: 'دوران سلس', v: 'مع قص زوايا جيد يقلّل الانحشار أثناء السرعة.' },
    ],
  },
  {
    id: 'skewb', name: 'مكعب سكيوب الملتوي', en: 'FanXin Twisted Skewb · Shape Mod',
    scheme: { R: 0xe23b2e, L: 0x3fa9f5, U: 0xf5c518, D: 0xffffff, F: 0x1fb35a, B: 0xf07f2a },
    shape: 'twist', body: 0x141414,
    tags: ['شكل نادر', 'بدون ملصقات', 'دوران قطري'],
    lede: 'متوسط · شكل معدّل. تصميم ملتوي غير اعتيادي يتغيّر بالكامل عند الخلط.',
    specs: [
      { k: 'تصميم ملتوي', v: 'يتغيّر شكله بالكامل عند الخلط ويعود منتظماً عند الحل.' },
      { k: 'آلية سكيوب', v: 'بدوران مائل من الزوايا بدل الطبقات التقليدية — إحساس مختلف تماماً.' },
      { k: 'بدون ملصقات', v: 'بلاستيك ملوّن بالكامل ومقاوم للخدش.' },
      { k: 'قطعة ديكور ولعبة', v: 'شكله لافت للنظر على الرف أو المكتب.' },
      { k: 'آلية بسيطة', v: 'لكن الشكل يربك العين — تحدٍّ ممتع بدون تعقيد زائد.' },
    ],
  },
  {
    id: 'pyraminx', name: 'مكعب الهرم المغناطيسي', en: 'QiYi MP Pyraminx · Magnetic',
    scheme: STANDARD, engine: 'pyraminx',
    tags: ['مغناطيسي', 'بدون ملصقات', '٤ أوجه', 'علبة عرض'],
    lede: 'مبتدئ · هرم. الأسهل في المجموعة، يُحل بخطوات أقل بكثير من مكعب ٣×٣.',
    specs: [
      { k: 'آلية مغناطيسية', v: 'في كل طبقة، تعطي إحساس تثبيت واضح عند كل حركة وتمنع الانحراف.' },
      { k: 'بدون ملصقات', v: 'الألوان من البلاستيك نفسه، لا تنزع ولا يبهت لونها مع الاستعمال.' },
      { k: 'دوران خفيف وسريع', v: 'مناسب لمحاولات تحسين الوقت وللمسابقات.' },
      { k: 'قاعدة وعلبة عرض', v: 'شفافة ضمن المنتج، فيصلح كهدية جاهزة بدون تغليف إضافي.' },
      { k: 'الأسهل في المجموعة', v: 'يُحل بخطوات أقل بكثير من مكعب ٣×٣، فهو المدخل المثالي.' },
    ],
  },
];

export default function Store() {
  return (
    <main className="store">
      <header className="sbanner">
        <picture>
          <source media="(max-width: 900px)" srcSet="/media/store-hero-m.jpg" />
          <img src="/media/store-hero.jpg" alt="رفوف متجر GENIUS تحت اللافتة الذهبية" />
        </picture>
      </header>

      <div className="wrap">
        <h1 className="sbanner__title">
          <span className="c1">تعال</span>{' '}
          <span className="c2">نختارلك</span>{' '}
          <span className="c3">مكعب</span>
        </h1>

        <p className="store__lede">
          كل مكعب تقدر تلعب بيه قبل ما تشتريه. اسحب وجهاً لتديره، واسحب الخلفية لتدوير المكعب كله.
        </p>

        <div className="pgrid">
          {ITEMS.map((it) => (
            <article className="pitem" id={it.id} key={it.id}>
              <div className="pitem__play">
                {it.engine === 'pyraminx' ? (
                  <Pyraminx label={it.name} />
                ) : (
                  <PuzzleCube scheme={it.scheme} face={it.face} body={it.body} logo={it.logo} shape={it.shape} label={it.name} />
                )}
                <AddToCart id={it.id} name={it.name} price={it.price} />
              </div>

              <div className="pitem__info">
                <h2>{it.name}</h2>
                <p className="pitem__en">{it.en}</p>
                {it.tags && (
                  <p className="ptags">{it.tags.map((g) => <span key={g}>{g}</span>)}</p>
                )}
                {it.lede && <p className="pitem__lede">{it.lede}</p>}

                {it.specs ? (
                  <dl className="pspecs">
                    {it.specs.map((s) => (
                      <div key={s.k}>
                        <dt>{s.k}</dt>
                        <dd>{s.v}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="pitem__pending">المواصفات قيد الإضافة.</p>
                )}

                {it.approx && <p className="pitem__note">{it.approx}</p>}
              </div>
            </article>
          ))}
        </div>

        <ChooseHelp />
      </div>
    </main>
  );
}
