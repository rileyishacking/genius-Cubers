import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/* =========================================================
   هرم تفاعلي — رباعي الأوجه بأربعة محاور. ليس مكعباً.

   نمذجة بالقشرة: الهرم الحقيقي لا يُظهر إلا سطحه، فنبني
   ٤ أوجه × ٩ مثلثات = ٣٦ ملصقاً، فوق جسم داكن مصمت.
   الدوران حول محور يمرّ من رأس إلى مركز الوجه المقابل،
   بزاوية ١٢٠ درجة، وهو يطابق الهرم على نفسه.
   ========================================================= */

const R = 1.85;
/* قاعدة أفقية ورأس للأعلى: هذا ما تُظهره صورة المنتج.
   ثلاثة رؤوس على دائرة القاعدة بزوايا ١٢٠ درجة، والرابع فوق المركز. */
const V = (() => {
  const yb = -R / 3, rb = R * Math.SQRT2 * 2 / 3;
  return [
    new THREE.Vector3(0, R, 0),                                            // القمة
    new THREE.Vector3(rb, yb, 0),
    new THREE.Vector3(rb * Math.cos(2.094), yb, rb * Math.sin(2.094)),
    new THREE.Vector3(rb * Math.cos(4.189), yb, rb * Math.sin(4.189)),
  ];
})();

/* كل وجه = الرؤوس الثلاثة عدا الرأس المقابل، بترتيب يجعل الناظم للخارج */
const FACES: [number, number, number][] = [[1, 2, 3], [0, 3, 2], [0, 1, 3], [0, 2, 1]];
const N = 3;

type Props = { colors?: [number, number, number, number]; label?: string };

export default function Pyraminx({
  colors = [0xf5c518, 0x1fb35a, 0xe23b2e, 0x2f6fe0],
  label = 'هرم تفاعلي',
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const api = useRef<{ scramble: () => void; reset: () => void } | null>(null);
  const [moves, setMoves] = useState(0);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const stage = stageRef.current, canvas = canvasRef.current;
    if (!stage || !canvas) return;

    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
    catch { setFailed(true); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    /* ننظر على حرف بين وجهين لا على وجه واحد، وإلا طلع مثلثاً مسطّحاً */
    const CAM = new THREE.Vector3(0, 0.34, 1).normalize();
    const root = new THREE.Group();
    root.rotation.set(0, -Math.PI / 2 + 0.18, 0);
    scene.add(root);

    /* الجسم الداكن: يملأ ما بين الملصقات فتبدو خطوطاً سوداء */
    const solid = new THREE.BufferGeometry();
    const sp: number[] = [];
    FACES.forEach(([a, b, c]) => {
      const s = 0.965;
      [V[a], V[b], V[c]].forEach(v => sp.push(v.x * s, v.y * s, v.z * s));
    });
    solid.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    solid.computeVertexNormals();
    root.add(new THREE.Mesh(solid, new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.75 })));

    /* ---------- الملصقات ---------- */
    type Tile = { mesh: THREE.Mesh; home: { p: THREE.Vector3; q: THREE.Quaternion } };
    const tiles: Tile[] = [];
    const AXES = V.map(v => v.clone().normalize());

    FACES.forEach(([ia, ib, ic], fi) => {
      const A = V[ia], B = V[ib], C = V[ic];
      const P = (a: number, b: number, c: number) =>
        new THREE.Vector3()
          .addScaledVector(A, a / N).addScaledVector(B, b / N).addScaledVector(C, c / N);

      const addTri = (p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3) => {
        /* تصغير نحو المركز يترك فاصلاً أسود بين الملصقات */
        const cen = new THREE.Vector3().add(p1).add(p2).add(p3).divideScalar(3);
        const k = 0.93;
        const q = [p1, p2, p3].map(v => v.clone().sub(cen).multiplyScalar(k).add(cen));
        /* دفع للخارج قليلاً حتى لا يتداخل مع الجسم */
        const nrm = new THREE.Vector3().crossVectors(
          new THREE.Vector3().subVectors(q[1], q[0]),
          new THREE.Vector3().subVectors(q[2], q[0]),
        ).normalize();
        q.forEach(v => v.addScaledVector(nrm, 0.012));

        /* منشور رقيق: الوجه الخارجي ملوّن، والجوانب سوداء فيبيّن السُمك */
        const inner = q.map(v => v.clone().addScaledVector(nrm, -0.075));
        const P = [...q, ...inner];
        const tri = (a: number, b: number, c: number) => [a, b, c];
        const idx = [
          ...tri(0, 1, 2),            // الوجه الخارجي
          ...tri(5, 4, 3),            // الوجه الداخلي
          ...tri(0, 3, 4), ...tri(0, 4, 1),
          ...tri(1, 4, 5), ...tri(1, 5, 2),
          ...tri(2, 5, 3), ...tri(2, 3, 0),
        ];
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(
          P.flatMap(v => [v.x, v.y, v.z]), 3));
        g.setIndex(idx);
        g.computeVertexNormals();
        /* مجموعتان: الوجه الخارجي بلون الوجه، والباقي أسود */
        g.addGroup(0, 3, 0);
        g.addGroup(3, idx.length - 3, 1);
        const m = new THREE.Mesh(g, [
          new THREE.MeshStandardMaterial({ color: colors[fi], roughness: 0.4, metalness: 0.02 }),
          new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.8 }),
        ]);
        root.add(m);
        tiles.push({ mesh: m, home: { p: m.position.clone(), q: m.quaternion.clone() } });
      };

      /* ٦ مثلثات صاعدة + ٣ نازلة = ٩ لكل وجه */
      for (let i = 0; i + 1 <= N; i++)
        for (let j = 0; i + j + 1 <= N; j++) {
          const k = N - 1 - i - j;
          if (k < 0) continue;
          addTri(P(i + 1, j, k), P(i, j + 1, k), P(i, j, k + 1));
        }
      for (let i = 0; i + 2 <= N; i++)
        for (let j = 0; i + j + 2 <= N; j++) {
          const k = N - 2 - i - j;
          if (k < 0) continue;
          addTri(P(i + 1, j + 1, k), P(i, j + 1, k + 1), P(i + 1, j, k + 1));
        }
    });

    scene.add(new THREE.AmbientLight(0xffffff, 0.92 * Math.PI));
    const key = new THREE.DirectionalLight(0xffffff, 0.66 * Math.PI); key.position.set(4, 8, 7); scene.add(key);
    const fill = new THREE.DirectionalLight(0xf0b23c, 0.16 * Math.PI); fill.position.set(-5, -3, -4); scene.add(fill);
    const raycaster = new THREE.Raycaster();

    const resize = () => {
      const w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const vh = THREE.MathUtils.degToRad(camera.fov) / 2;
      const hh = Math.atan(Math.tan(vh) * camera.aspect);
      camera.position.copy(CAM).multiplyScalar(2.6 / Math.tan(Math.min(vh, hh)));
      camera.lookAt(0, 0, 0); camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(stage);

    /* ---------- الدوران ---------- */
    let animating = false, moveCount = 0;
    let pendingFinish: (() => void) | null = null;
    const centroid = (m: THREE.Mesh) => {
      const p = m.geometry.attributes.position as THREE.BufferAttribute;
      const v = new THREE.Vector3(), s = new THREE.Vector3();
      for (let i = 0; i < p.count; i++) s.add(v.fromBufferAttribute(p, i));
      return s.divideScalar(p.count).applyMatrix4(m.matrixWorld).applyMatrix4(
        new THREE.Matrix4().copy(root.matrixWorld).invert());
    };

    const turn = (axisIdx: number, deep: boolean, dir: number, ms: number, done?: () => void) => {
      if (animating) return false;
      animating = true;
      root.updateMatrixWorld(true);
      const axis = AXES[axisIdx];
      /* القمة وحدها، أو القمة مع الطبقة التالية */
      const cut = deep ? R * 0.02 : R * 0.46;
      const picked = tiles.filter(t => centroid(t.mesh).dot(axis) > cut);
      const pivot = new THREE.Group(); root.add(pivot);
      picked.forEach(t => pivot.attach(t.mesh));
      const target = dir * (2 * Math.PI / 3);
      let ended = false;
      const finish = () => {
        if (ended) return; ended = true; pendingFinish = null;
        pivot.setRotationFromAxisAngle(axis, target); pivot.updateMatrixWorld(true);
        picked.forEach(t => root.attach(t.mesh));
        root.remove(pivot); animating = false; done?.();
      };
      if (document.hidden || !(ms > 0)) { finish(); return true; }
      pendingFinish = finish;
      const t0 = performance.now();
      const step = (now: number) => {
        if (ended) return;
        const t = Math.min(1, (now - t0) / ms);
        const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        pivot.setRotationFromAxisAngle(axis, target * e);
        if (t < 1) requestAnimationFrame(step); else finish();
      };
      step(performance.now());
      return true;
    };

    /* ---------- التحكم ---------- */
    let mode: 'turn' | 'orbit' | null = null, downX = 0, downY = 0, decided = false;
    let hitAxis = 0, hitDeep = false;
    const onDown = (e: PointerEvent) => {
      if (animating) return;
      canvas.setPointerCapture(e.pointerId); canvas.classList.add('grabbing');
      downX = e.clientX; downY = e.clientY; decided = false;
      const r = canvas.getBoundingClientRect();
      raycaster.setFromCamera(
        new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
      const hits = raycaster.intersectObjects(tiles.map(t => t.mesh), false);
      if (hits.length) {
        const local = root.worldToLocal(hits[0].point.clone());
        let best = 0, bestD = -Infinity;
        AXES.forEach((a, i) => { const d = local.dot(a); if (d > bestD) { bestD = d; best = i; } });
        hitAxis = best; hitDeep = bestD < R * 0.50; mode = 'turn';
      } else mode = 'orbit';
    };
    const onUp = (e: PointerEvent) => {
      canvas.classList.remove('grabbing'); mode = null; decided = false;
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!mode) return;
      const dx = e.clientX - downX, dy = e.clientY - downY;
      if (mode === 'orbit') {
        root.rotation.y += dx * 0.008;
        root.rotation.x = Math.max(-1.1, Math.min(1.1, root.rotation.x + dy * 0.008));
        downX = e.clientX; downY = e.clientY; return;
      }
      if (decided || animating) return;
      if (Math.hypot(dx, dy) < 10) return;
      decided = true;
      if (turn(hitAxis, hitDeep, dx + dy > 0 ? 1 : -1, 200)) { moveCount++; setMoves(moveCount); }
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('pointermove', onMove);

    api.current = {
      scramble: () => {
        if (animating) return;
        setBusy(true); moveCount = 0; setMoves(0);
        const next = (i: number) => {
          if (i >= 14) { setBusy(false); return; }
          turn((Math.random() * 4) | 0, Math.random() < 0.5, Math.random() < 0.5 ? 1 : -1, 100, () => next(i + 1));
        };
        next(0);
      },
      reset: () => {
        if (animating) return;
        tiles.forEach(t => { t.mesh.position.copy(t.home.p); t.mesh.quaternion.copy(t.home.q); });
        moveCount = 0; setMoves(0);
      },
    };

    let visible = false, alive = true, raf = 0;
    const loop = () => {
      if (!alive || !visible) { raf = 0; return; }
      raf = requestAnimationFrame(loop);
      const w = stage.clientWidth, h = stage.clientHeight, dpr = renderer.getPixelRatio();
      if (w && h && (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr))) resize();
      renderer.render(scene, camera);
    };
    const start = () => { if (!raf && alive && visible) raf = requestAnimationFrame(loop); };
    const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) start(); }, { rootMargin: '150px' });
    io.observe(stage);
    const onVis = () => { if (document.hidden && pendingFinish) pendingFinish(); start(); };
    document.addEventListener('visibilitychange', onVis);
    renderer.render(scene, camera);

    return () => {
      alive = false; if (raf) cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('pointermove', onMove);
      tiles.forEach(t => { t.mesh.geometry.dispose(); (t.mesh.material as THREE.Material).dispose(); });
      solid.dispose(); renderer.dispose(); api.current = null;
    };
  }, [colors]);

  return (
    <div className="pcube">
      <div className={'pcube__stage' + (failed ? ' failed' : '')} ref={stageRef}>
        <canvas ref={canvasRef} tabIndex={0} aria-label={label} />
        <div className="pcube__fallback">متصفحك ما يدعم العرض ثلاثي الأبعاد.</div>
      </div>
      <div className="pcube__bar">
        <button type="button" disabled={busy} onClick={() => api.current?.scramble()}>اخلط</button>
        <button type="button" disabled={busy} onClick={() => api.current?.reset()}>أرجعه</button>
      </div>
    </div>
  );
}
