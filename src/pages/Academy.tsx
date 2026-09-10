import { waLink } from '../data/contact';

/* =========================================================
   الأكاديمية.

   الترتيب مقصود: الاستشارة أولاً لأن أغلب الزائرين لا يعرفون
   أي مسار يناسبهم، فسؤالهم قبل عرض الأسعار يمنع الاختيار
   الخاطئ. ثم الكورسان، ثم التدريب الشخصي لمن يريد متابعة
   مباشرة.
   ========================================================= */

/* صورة كورس الاحتراف. الأصل كان ٧ ميغابايت بعرض ٢٧٥٢، فصُغِّر
   إلى ١٦٠٠ و٢٩٤ كيلوبايت: العرض على الصفحة أقل من نصف ذلك. */
const PRO_IMG = '/media/course-pro.jpg';

const BASICS = [
  'تتعرّف على المكعب: أجزاءه، ورموز الحركات، وشلون تمسكه صح.',
  'تحل الطبقة الأولى خطوة خطوة، وتفهم ليش تشتغل كل حركة.',
  'الطبقة الوسطى، وأول إحساس إنك تسيطر على المكعب.',
  'الطبقة الأخيرة، وتوصل لأول حل كامل بإيدك.',
  'تمارين تثبّت الحل حتى ما تنساه بعد أسبوع.',
];

const PRO = [
  'طريقة CFOP كاملة: الأساس اللي يعتمده أغلب المحترفين.',
  'F2L: تبني طبقتين سوا بدل وحدة، وهنا ينزل وقتك بشكل كبير.',
  'OLL و PLL: خوارزميات الطبقة الأخيرة وشلون تحفظها بلا لخبطة.',
  'تدريب الأصابع: حركات أسرع بجهد أقل.',
  'النظر المسبق: تشوف حركتك الجاية وإنت تسوي الحالية.',
  'الخلطات الرسمية وشلون تتدرّب مثل المسابقات.',
];

const STEPS = [
  { k: 'نقيّم مستواك', v: 'جلسة قصيرة نشوف بيها وين إنت هسّه: تحل ولا لا، وشقد وقتك، ووين تتعثّر بالضبط.' },
  { k: 'نبني خطة إلك', v: 'على ضوء التقييم نحدّد هدفك وكم جلسة تحتاج، وشنو نشتغل عليه بالترتيب.' },
  { k: 'جلسات مباشرة', v: 'وجهاً لوجه أو أونلاين. تحل قدام أيهم، ويصحّحلك حركاتك بلحظتها بدل ما تكرّر الغلط شهر.' },
  { k: 'تمارين بين الجلسات', v: 'كل جلسة تطلع بيها بواجب محدد، حتى الوقت بين الجلسات يشتغل إلك مو عليك.' },
  { k: 'نتابع وقتك', v: 'نسجّل أوقاتك بالحلبة ونقارنها، فتشوف تقدّمك بالأرقام مو بالإحساس.' },
];

export default function Academy() {
  return (
    <main className="acad">
      <div className="wrap">
        <h1 className="acad__title tint-gold">الأكاديمية</h1>
        <p className="acad__lede">
          من أول مرة تمسك بيها مكعب، لحد ما تنافس على الوقت. اختر مسارك، وإذا
          محتار وين تبدي — احچي وياّنا قبل ما تقرر.
        </p>

        {/* ١ — الاستشارة: قبل الأسعار، لأن الاختيار الغلط يضيّع وقت الزائر */}
        <section className="cons" aria-labelledby="consT">
          <div className="cons__body">
            <span className="cons__chip">مجاناً وبلا التزام</span>
            <h2 id="consT">محتار أي كورس يناسبك؟</h2>
            <p>
              احچي وياّنا قبل ما تختار. نسألك شقد تعرف عن المكعب، وشنو هدفك،
              وكم وقت تكدر تعطي بالأسبوع — وبعدها ننصحك بالمسار الصح. حتى لو
              طلع إن ما تحتاج كورس، نكلك.
            </p>
            <a className="cons__cta" href={waLink('مرحباً، أريد استشارة قبل ما أختار كورس بالأكاديمية.')}
               target="_blank" rel="noopener noreferrer">
              احجز استشارتك بالواتساب
            </a>
          </div>
        </section>

        {/* ٢ — الكورسان */}
        <div className="courses">
          <article className="course" id="basics">
            <div className="course__shot">
              {/* بلا lazy: الصورة قريبة من أعلى الصفحة، وتأجيلها يؤخّر
                  أول ما يراه الزائر بلا مكسب */}
              <img src="/media/hero-poster.jpg" alt="أيهم داخل متجر GENIUS" />
              <span className="course__tag course__tag--free">مجاني</span>
            </div>
            <div className="course__body">
              <p className="course__lvl">من الصفر</p>
              <h2>كورس الأساسيات</h2>
              <p className="course__sub">
                للي ما حل مكعب بحياته. ما تحتاج أي خلفية، بس مكعب وشوية صبر.
              </p>
              <ul className="course__list">
                {BASICS.map(t => <li key={t}>{t}</li>)}
              </ul>
              <a className="course__cta" href={waLink('مرحباً، أريد أبدي بكورس الأساسيات.')}
                 target="_blank" rel="noopener noreferrer">
                ابدي الكورس مجاناً
              </a>
            </div>
          </article>

          <article className="course" id="pro">
            <div className="course__shot">
              {PRO_IMG ? (
                <img src={PRO_IMG} alt="كورس الاحتراف" />
              ) : (
                <div className="course__slot">صورة كورس الاحتراف</div>
              )}
              <span className="course__tag">متقدّم</span>
            </div>
            <div className="course__body">
              <p className="course__lvl">تحل بس تريد أسرع</p>
              <h2>كورس الاحتراف</h2>
              <p className="course__sub">
                للي يحل المكعب ويريد ينزّل وقته. الهدف: تحت الدقيقة، وبعدها تحت الثلاثين ثانية.
              </p>
              <ul className="course__list">
                {PRO.map(t => <li key={t}>{t}</li>)}
              </ul>
              <a className="course__cta" href={waLink('مرحباً، أريد أستفسر عن كورس الاحتراف.')}
                 target="_blank" rel="noopener noreferrer">
                استفسر عن الكورس
              </a>
            </div>
          </article>
        </div>

        {/* ٣ — التدريب الشخصي: الخطوات تسلسل حقيقي، فترقيمها يفيد */}
        <section className="ptr" aria-labelledby="ptrT">
          <div className="ptr__head">
            <h2 id="ptrT">تدريب شخصي مع أيهم</h2>
            <p>
              مو كورس مسجّل. جلسات إلك وحدك، على مستواك وهدفك ووقتك. هذي شلون
              تمشي من أول جلسة:
            </p>
          </div>

          <ol className="ptr__steps">
            {STEPS.map((s, i) => (
              <li key={s.k}>
                <span className="ptr__n">{i + 1}</span>
                <div>
                  <h3>{s.k}</h3>
                  <p>{s.v}</p>
                </div>
              </li>
            ))}
          </ol>

          <a className="ptr__cta" href={waLink('مرحباً، أريد أستفسر عن التدريب الشخصي.')}
             target="_blank" rel="noopener noreferrer">
            احجز جلستك الأولى
          </a>
        </section>
      </div>
    </main>
  );
}
