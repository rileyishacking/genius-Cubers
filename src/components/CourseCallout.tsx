/* نداء يعترض الزائر قبل ما يبدي اللعب: أغلب اللي يدخل الحلبة
   ما يعرف يحل المكعب أصلاً، فينكسر خاطره ويطلع. هذا يمسكه
   ويوديه للكورس بدل ما يضيع. */

/* وجهة الزر: كورس الأساسيات داخل الأكاديمية.
   الأكاديمية لم تُبنَ بعد، فيؤشّر مؤقتاً على تعريفها في الصفحة
   الرئيسية بدل أن يقود الزائر إلى رابط ميت. حين تجهز الصفحة
   يصير السطر: '/academy#basics' ولا شيء غيره يتغيّر. */
const COURSE_HREF = '/#story';

export default function CourseCallout() {
  return (
    <aside className="callout" aria-labelledby="calloutTitle">
      <span className="callout__badge">مجاني</span>

      <p className="callout__stop" id="calloutTitle">
        اوكف قبل لا تلعب!
      </p>

      <p className="callout__body">
        عاجبك تحل المكعب بكل سهولة؟ سوّينالك <b>كورس أساسيات مجاني</b> من تحت الصفر.
      </p>

      <a className="callout__cta" href={COURSE_HREF}>
        ابدي الكورس مجاناً
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
      </a>
    </aside>
  );
}
