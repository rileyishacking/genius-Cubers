import { useEffect, useRef, useState } from 'react';

/* الـ hero: الفيديو يشتغل مستمراً بلا توقف، بلا صوت. */
/* الأشكال الأربعة تتبادل الصعود والنزول، فاللوغو يتنفّس بدل ما يكون ساكناً */

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
    /* المتصفح يوقف الفيديو أحياناً عند الرجوع للتبويب، فنعيد تشغيله */
    const resume = () => { if (!document.hidden && v.paused) v.play().catch(() => {}); };
    document.addEventListener('visibilitychange', resume);
    v.addEventListener('pause', resume);
    v.play().catch(() => {});
    return () => {
      document.removeEventListener('visibilitychange', resume);
      v.removeEventListener('pause', resume);
    };
  }, []);

  return (
    <section className="hero">
      <video
        ref={ref}
        className="hero-vid"
        poster="/media/hero-poster.jpg"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-label="أيهم في متجر GENIUS"
      >
        <source src={src} type="video/mp4" />
      </video>

    </section>
  );
}
