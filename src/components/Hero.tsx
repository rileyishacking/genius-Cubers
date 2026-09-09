import { useEffect, useRef, useState } from 'react';

/* الـ hero: الفيديو يشتغل مرة وحدة عند الفتح ويثبت على آخر إطار. بلا تكرار، بلا صوت. */
export default function Hero() {
  const ref = useRef<HTMLVideoElement>(null);
  /* 4K للشاشات الكبيرة، ونسخة خفيفة للهاتف: التفاصيل ما تنشاف على شاشة صغيرة وتكلّف الزائر بياناته */
  const [src] = useState(() => (window.innerWidth >= 900 ? '/media/hero-4k.mp4' : '/media/hero-web.mp4'));

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      v.removeAttribute('autoplay');
      const settle = () => { v.currentTime = Math.max(0, v.duration - 0.05); };
      if (v.readyState >= 1) settle(); else v.addEventListener('loadedmetadata', settle, { once: true });
      return () => v.removeEventListener('loadedmetadata', settle);
    }
    const onEnded = () => v.pause();
    v.addEventListener('ended', onEnded);
    v.play().catch(() => {});
    return () => v.removeEventListener('ended', onEnded);
  }, []);

  return (
    <section className="hero">
      <video
        ref={ref}
        className="hero-vid"
        poster="/media/hero-poster.jpg"
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-label="أيهم في متجر GENIUS"
      >
        <source src={src} type="video/mp4" />
      </video>

      <div className="nav-holder">
        <div className="wrap">
          <nav className="nav">
            <a className="brand" href="/">
              <img src="/media/logo.svg" alt="" />
              GENIUS
            </a>
            <ul>
              <li className="on">الرئيسية</li>
              <li>المنتجات</li>
              <li>الحلبة</li>
              <li>الأكاديمية</li>
            </ul>
            <span className="spacer" />
            <div className="auth">
              <a className="btn btn-plain" href="#">تسجيل الدخول</a>
              <a className="btn btn-gold" href="#">إنشاء حساب</a>
            </div>
          </nav>
        </div>
      </div>
    </section>
  );
}
