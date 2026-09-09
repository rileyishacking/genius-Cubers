import { useEffect, useRef } from 'react';

/* خلفية المكعبات المتساقطة، بألوان المنتجات، خافتة حتى ما تشوّش على النص. */
export default function FallingCubes() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const cx = cv.getContext('2d');
    if (!cx) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const COLORS = [[47, 111, 224], [219, 78, 27], [245, 197, 24], [15, 107, 85], [228, 60, 60], [150, 150, 158]];
    type Cube = { x: number; y: number; s: number; v: number; a: number; va: number; c: number[]; o: number };
    let cubes: Cube[] = [], W = 0, H = 0, raf: number | null = null, alive = true;

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = Math.floor(W * dpr); cv.height = Math.floor(H * dpr);
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const make = (top: boolean): Cube => {
      const s = 12 + Math.random() * 24;
      return { x: Math.random() * W, y: top ? -s * 2 : Math.random() * H, s, v: 0.22 + Math.random() * 0.55,
        a: Math.random() * Math.PI * 2, va: (Math.random() - 0.5) * 0.006,
        c: COLORS[(Math.random() * COLORS.length) | 0], o: 0.10 + Math.random() * 0.13 };
    };
    const build = () => { const n = Math.round(Math.min(38, Math.max(14, (W * H) / 42000))); cubes = []; for (let i = 0; i < n; i++) cubes.push(make(false)); };
    const draw = (c: Cube) => {
      const h = c.s * 0.5, k = c.s * 0.29, [r, g, b] = c.c;
      cx.save(); cx.translate(c.x, c.y); cx.rotate(c.a);
      cx.beginPath(); cx.moveTo(0, -h); cx.lineTo(h, -h + k); cx.lineTo(0, -h + 2 * k); cx.lineTo(-h, -h + k); cx.closePath();
      cx.fillStyle = `rgba(${r},${g},${b},${c.o * 1.25})`; cx.fill();
      cx.beginPath(); cx.moveTo(0, -h + 2 * k); cx.lineTo(h, -h + k); cx.lineTo(h, h - k); cx.lineTo(0, h); cx.closePath();
      cx.fillStyle = `rgba(${r * .72},${g * .72},${b * .72},${c.o})`; cx.fill();
      cx.beginPath(); cx.moveTo(0, -h + 2 * k); cx.lineTo(-h, -h + k); cx.lineTo(-h, h - k); cx.lineTo(0, h); cx.closePath();
      cx.fillStyle = `rgba(${r * .5},${g * .5},${b * .5},${c.o})`; cx.fill();
      cx.restore();
    };
    const still = () => { cx.clearRect(0, 0, W, H); cubes.forEach(draw); };
    const frame = () => {
      if (!alive) return;
      cx.clearRect(0, 0, W, H);
      for (let i = 0; i < cubes.length; i++) {
        const c = cubes[i]; c.y += c.v; c.a += c.va;
        if (c.y - c.s > H) cubes[i] = make(true);
        draw(cubes[i]);
      }
      raf = requestAnimationFrame(frame);
    };
    const start = () => { if (raf == null && !reduce && alive) raf = requestAnimationFrame(frame); };
    const stop = () => { if (raf != null) { cancelAnimationFrame(raf); raf = null; } };

    size(); build(); reduce ? still() : start();
    let t: number | undefined;
    const onResize = () => { clearTimeout(t); t = window.setTimeout(() => { size(); build(); if (reduce) still(); }, 180); };
    const onVis = () => { document.hidden ? stop() : start(); };
    addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVis);
    return () => { alive = false; stop(); removeEventListener('resize', onResize); document.removeEventListener('visibilitychange', onVis); };
  }, []);

  return <canvas id="fall" ref={ref} aria-hidden="true" />;
}
