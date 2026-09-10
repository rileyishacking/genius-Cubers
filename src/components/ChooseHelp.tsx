/* قسم ختامي بصفحة المنتجات: الزائر اللي ما يعرف شيختار
   ينطيه مخرجين — فيديو يشرح الأنواع، أو تواصل مباشر بالواتساب. */

/* رابط الفيديو (يوتيوب أو انستغرام). لحد ما ينحط، المربع
   يظهر «قريباً» وما ينضغط بدل ما يودّي الزائر لرابط ميت. */
const VIDEO_URL = '';

/* +964 773 735 9910 — واتساب يريد الرقم بلا + وبلا فراغات */
const WHATSAPP = 'https://wa.me/9647737359910';
const WHATSAPP_TEXT = 'مرحباً، أريد استشارة باختيار مكعب يناسبني.';

export default function ChooseHelp() {
  const videoReady = VIDEO_URL.length > 0;

  return (
    <section className="help" id="help" aria-labelledby="helpTitle">
      <div className="turn">
        <p className="turn__joke" id="helpTitle">
          دايخ بالمكعبات وحاير شتاخذ يا نوع يناسبك؟
        </p>
        <p className="turn__cta">اختر الطريقة اللي تريحك</p>
      </div>

      <div className="feat-grid feat-grid--two">
        {/* ١ — فيديو يشرح الأنواع */}
        {videoReady ? (
          <a className="feat" href={VIDEO_URL} target="_blank" rel="noopener noreferrer">
            <span className="feat__ico" style={{ background: '#FDEDE6' }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#DB4E1B" strokeWidth="2" aria-hidden="true">
                <rect x="2" y="4" width="14" height="16" rx="2.5" />
                <path d="M22 7.5v9l-6-3.2v-2.6z" />
              </svg>
            </span>
            <h3>شاهد شرح المكعبات</h3>
            <p>فيديو قصير يمشّيك على الأنواع والفرق بينها، حتى تعرف أي واحد يناسب مستواك.</p>
            <span className="feat__go">
              شغّل الفيديو
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M19 12H5M11 18l-6-6 6-6" />
              </svg>
            </span>
          </a>
        ) : (
          <div className="feat feat--soon" aria-disabled="true">
            <span className="feat__chip">قريباً</span>
            <span className="feat__ico" style={{ background: '#FDEDE6' }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#DB4E1B" strokeWidth="2" aria-hidden="true">
                <rect x="2" y="4" width="14" height="16" rx="2.5" />
                <path d="M22 7.5v9l-6-3.2v-2.6z" />
              </svg>
            </span>
            <h3>شاهد شرح المكعبات</h3>
            <p>فيديو قصير يمشّيك على الأنواع والفرق بينها، حتى تعرف أي واحد يناسب مستواك.</p>
            <span className="feat__go feat__go--off">قيد التحضير</span>
          </div>
        )}

        {/* ٢ — تواصل مباشر */}
        <a
          className="feat feat--wa"
          href={`${WHATSAPP}?text=${encodeURIComponent(WHATSAPP_TEXT)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="feat__ico" style={{ background: '#E6F1EC' }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="#0F6B55" aria-hidden="true">
              <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.94L2 22l5.34-1.4a9.8 9.8 0 004.7 1.2h.01c5.43 0 9.84-4.4 9.84-9.84C21.89 6.4 17.48 2 12.04 2zm0 17.98h-.01a8.2 8.2 0 01-4.16-1.14l-.3-.18-3.17.83.85-3.09-.2-.32a8.13 8.13 0 01-1.25-4.34c0-4.52 3.68-8.19 8.2-8.19a8.19 8.19 0 018.18 8.2c0 4.51-3.67 8.19-8.14 8.19zm4.49-6.13c-.24-.12-1.45-.72-1.68-.8-.22-.08-.39-.12-.55.12s-.63.8-.77.96-.28.18-.52.06a6.7 6.7 0 01-1.97-1.22 7.4 7.4 0 01-1.37-1.7c-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.15.16-.25.24-.41.08-.17.04-.31-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.47-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.3-.22.24-.85.83-.85 2.03s.87 2.35.99 2.51c.12.16 1.71 2.61 4.15 3.66.58.25 1.03.4 1.39.51.58.19 1.11.16 1.53.1.47-.07 1.45-.59 1.65-1.17.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28z" />
            </svg>
          </span>
          <h3>تواصل ويانه</h3>
          <p>احچي وياّنا بالواتساب ونساعدك تختار المكعب المناسب إلك، بدون لف ودوران.</p>
          <span className="feat__go">
            راسلنا بالواتساب
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
          </span>
        </a>
      </div>
    </section>
  );
}
