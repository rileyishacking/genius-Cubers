import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/* =========================================================
   مكعب تفاعلي حقيقي: كل وجه يدور، والمكعب يعرف متى ينحل.
   ========================================================= */
const GAP = 1.045, TAU = Math.PI / 2, INNER = 0x17120d;
/* التوزيع القياسي المعتمد في المسابقات */
const C = { R: 0xd32b18, L: 0xe8862a, U: 0xfafafa, D: 0xf5c518, F: 0x109b57, B: 0x2f6fe0 };
const LOCAL = [
  new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0),
  new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1),
];
type Axis = 'x' | 'y' | 'z';

export default function CubePlayground() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const api = useRef<{ scramble: () => void; reset: () => void } | null>(null);
  const [moves, setMoves] = useState(0);
  const [faces, setFaces] = useState(6);
  const [solved, setSolved] = useState(false);
  const [hintGone, setHintGone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timer = useRef<{ id: number | null; t0: number }>({ id: null, t0: 0 });

  /* المؤقّت يبدأ بأول حركة من اللاعب، لا عند الخلط: الخلط مو جزء من محاولته */
  const startTimer = () => {
    if (timer.current.id !== null) return;
    timer.current.t0 = performance.now();
    timer.current.id = window.setInterval(() => setElapsed(performance.now() - timer.current.t0), 100);
  };
  const stopTimer = () => {
    if (timer.current.id !== null) { clearInterval(timer.current.id); timer.current.id = null; }
  };
  const resetTimer = () => { stopTimer(); setElapsed(0); };
  const clock = (ms: number) => {
    const t = Math.floor(ms / 1000);
    return String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
  };

  useEffect(() => {
    const stage = stageRef.current, canvas = canvasRef.current;
    if (!stage || !canvas) return;

    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
    catch { setFailed(true); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    const CAM = new THREE.Vector3(4.5, 3.8, 5.3);
    camera.position.copy(CAM); camera.lookAt(0, 0, 0);
    const root = new THREE.Group();
    root.rotation.set(-0.13, -0.5, 0);
    scene.add(root);

    const cubies: THREE.Mesh[] = [];
    const mat = (c: number) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.42, metalness: 0.04 });
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
      const cols = [x === 1 ? C.R : INNER, x === -1 ? C.L : INNER, y === 1 ? C.U : INNER, y === -1 ? C.D : INNER, z === 1 ? C.F : INNER, z === -1 ? C.B : INNER];
      const geo = new THREE.BoxGeometry(0.95, 0.95, 0.95);
      const m = new THREE.Mesh(geo, cols.map(mat));
      m.position.set(x * GAP, y * GAP, z * GAP);
      m.userData.colors = cols.slice();
      m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: 0x0f0c08 })));
      root.add(m); cubies.push(m);
    }
    /* three r155+ يستخدم وحدات إضاءة فيزيائية: القيم القديمة تُضرب بـ π حتى تعطي نفس السطوع */
    scene.add(new THREE.AmbientLight(0xffffff, 0.86 * Math.PI));
    const key = new THREE.DirectionalLight(0xffffff, 0.72 * Math.PI); key.position.set(6, 8, 5); scene.add(key);
    const fill = new THREE.DirectionalLight(0xf0b23c, 0.2 * Math.PI); fill.position.set(-5, -3, -4); scene.add(fill);
    const raycaster = new THREE.Raycaster();

    /* نبعّد الكاميرا بحيث يملأ المكعب البُعد الأضيق للمساحة، أياً كانت نسبتها */
    const resize = () => {
      const w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const vh = THREE.MathUtils.degToRad(camera.fov) / 2;
      const hh = Math.atan(Math.tan(vh) * camera.aspect);
      const dist = 2.3 / Math.tan(Math.min(vh, hh));
      camera.position.copy(CAM).normalize().multiplyScalar(dist); camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(stage);

    /* ---------- حالة الحل ---------- */
    let scrambled = false, animating = false, moveCount = 0;
    const stickerFacing = (c: THREE.Mesh, dir: THREE.Vector3) => {
      for (let i = 0; i < 6; i++) { const v = LOCAL[i].clone().applyQuaternion(c.quaternion); if (v.dot(dir) > 0.9) return (c.userData.colors as number[])[i]; }
      return null;
    };
    const solvedFaces = () => {
      let done = 0;
      for (let f = 0; f < 6; f++) {
        const d = LOCAL[f], axis: Axis = d.x ? 'x' : d.y ? 'y' : 'z', want = d.x + d.y + d.z;
        let first: number | null = null, ok = true;
        for (const c of cubies) {
          if (Math.round(c.position[axis] / GAP) !== want) continue;
          const col = stickerFacing(c, d);
          if (first === null) first = col; else if (col !== first) { ok = false; break; }
        }
        if (ok) done++;
      }
      return done;
    };
    const refresh = () => {
      const n = solvedFaces();
      setFaces(n); setSolved(n === 6 && scrambled);
      if (n === 6 && scrambled) stopTimer();
    };

    /* ---------- تدوير طبقة ---------- */
    const snap = (c: THREE.Mesh) => {
      c.position.set(Math.round(c.position.x / GAP) * GAP, Math.round(c.position.y / GAP) * GAP, Math.round(c.position.z / GAP) * GAP);
      const m = new THREE.Matrix4().makeRotationFromQuaternion(c.quaternion);
      for (let i = 0; i < 16; i++) m.elements[i] = Math.round(m.elements[i]);
      c.quaternion.setFromRotationMatrix(m);
    };
    let pendingFinish: (() => void) | null = null;
    const turn = (axis: Axis, layer: number, dir: number, ms: number, done?: () => void) => {
      if (animating) return false;
      animating = true;
      const pivot = new THREE.Group(); root.add(pivot);
      const picked = cubies.filter(c => Math.round(c.position[axis] / GAP) === layer);
      picked.forEach(c => pivot.attach(c));
      const target = dir * TAU; let ended = false;
      const finish = () => {
        if (ended) return; ended = true; pendingFinish = null;
        pivot.rotation[axis] = target; pivot.updateMatrixWorld(true);
        picked.forEach(c => { root.attach(c); snap(c); });
        root.remove(pivot); animating = false; refresh(); done?.();
      };
      /* requestAnimationFrame لا يعمل في تبويب مخفي، فننفّذ الدوران فوراً */
      if (document.hidden || !(ms > 0)) { finish(); return true; }
      pendingFinish = finish;
      const t0 = performance.now();
      const step = (now: number) => {
        if (ended) return;
        const p = Math.min(1, (now - t0) / ms);
        const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        pivot.rotation[axis] = target * e;
        if (p < 1) requestAnimationFrame(step); else finish();
      };
      step(performance.now());
      return true;
    };

    /* ---------- التحكم ---------- */
    let mode: 'turn' | 'orbit' | null = null, downX = 0, downY = 0, decided = false;
    let hitCubie: THREE.Mesh | null = null, hitNormal = new THREE.Vector3(), hitPoint = new THREE.Vector3();
    const toScreen = (v: THREE.Vector3) => { const p = v.clone().project(camera); return new THREE.Vector2(p.x * 0.5 * stage.clientWidth, -p.y * 0.5 * stage.clientHeight); };

    const onDown = (e: PointerEvent) => {
      if (animating) return;
      canvas.setPointerCapture(e.pointerId); canvas.classList.add('grabbing');
      downX = e.clientX; downY = e.clientY; decided = false;
      const r = canvas.getBoundingClientRect();
      raycaster.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
      const hits = raycaster.intersectObjects(cubies, false);
      if (hits.length && hits[0].face) {
        mode = 'turn'; hitCubie = hits[0].object as THREE.Mesh;
        const n = hits[0].face.normal.clone().applyQuaternion(hitCubie.quaternion);
        hitNormal = new THREE.Vector3(Math.round(n.x), Math.round(n.y), Math.round(n.z));
        hitPoint = root.worldToLocal(hits[0].point.clone());
      } else mode = 'orbit';
    };
    const onUp = (e: PointerEvent) => { canvas.classList.remove('grabbing'); mode = null; decided = false; if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      if (!mode) return;
      const dx = e.clientX - downX, dy = e.clientY - downY;
      if (mode === 'orbit') {
        root.rotation.y += dx * 0.008; root.rotation.x = Math.max(-1.2, Math.min(1.2, root.rotation.x + dy * 0.008));
        downX = e.clientX; downY = e.clientY; return;
      }
      if (decided || animating || !hitCubie) return;
      const drag = new THREE.Vector2(dx, dy);
      if (drag.length() < 9) return;
      decided = true;
      /* المحوران داخل الوجه المسحوب */
      const cands = LOCAL.filter(a => Math.abs(a.dot(hitNormal)) < 0.5);
      const base = root.localToWorld(hitPoint.clone());
      let best: THREE.Vector3 | null = null, bestScore = -Infinity;
      for (const a of cands) {
        const sd = toScreen(root.localToWorld(hitPoint.clone().add(a.clone().multiplyScalar(0.45)))).sub(toScreen(base));
        if (sd.length() < 0.001) continue;
        const score = sd.normalize().dot(drag.clone().normalize());
        if (score > bestScore) { bestScore = score; best = a; }
      }
      if (!best) return;
      /* السرعة عند نقطة على الوجه لدوران حول r هي r × n، فنختار r = n × move */
      const r = new THREE.Vector3().crossVectors(hitNormal, best);
      r.set(Math.round(r.x), Math.round(r.y), Math.round(r.z));
      const axis: Axis = Math.abs(r.x) ? 'x' : Math.abs(r.y) ? 'y' : 'z';
      const sign = r[axis] > 0 ? 1 : -1;
      const layer = Math.round(hitCubie.position[axis] / GAP);
      if (turn(axis, layer, sign, 190)) {
        moveCount++; scrambled = true; setMoves(moveCount); setHintGone(true);
        if (moveCount === 1) startTimer();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      const s = 0.16;
      if (e.key === 'ArrowLeft') root.rotation.y -= s; else if (e.key === 'ArrowRight') root.rotation.y += s;
      else if (e.key === 'ArrowUp') root.rotation.x -= s; else if (e.key === 'ArrowDown') root.rotation.x += s; else return;
      e.preventDefault();
    };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('keydown', onKey);

    /* ---------- الأزرار ---------- */
    const AX: Axis[] = ['x', 'y', 'z'];
    api.current = {
      scramble: () => {
        if (animating) return;
        setBusy(true); moveCount = 0; scrambled = true; setMoves(0); setSolved(false); setHintGone(true); resetTimer();
        const next = (i: number) => {
          if (i >= 22) { setBusy(false); return; }
          turn(AX[(Math.random() * 3) | 0], ((Math.random() * 3) | 0) - 1, Math.random() < 0.5 ? 1 : -1, 95, () => next(i + 1));
        };
        next(0);
      },
      reset: () => {
        if (animating) return;
        let i = 0;
        for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
          const c = cubies[i++]; c.position.set(x * GAP, y * GAP, z * GAP); c.quaternion.identity();
        }
        moveCount = 0; scrambled = false; setMoves(0); resetTimer(); refresh();
      },
    };

    /* ---------- الرسم ---------- */
    let alive = true, raf = 0;
    const onVis = () => { if (document.hidden && pendingFinish) pendingFinish(); alive = !document.hidden; if (alive) loop(); };
    const loop = () => {
      if (!alive) return;
      raf = requestAnimationFrame(loop);
      const w = stage.clientWidth, h = stage.clientHeight, dpr = renderer.getPixelRatio();
      if (w && h && (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr))) resize();
      renderer.render(scene, camera);
    };
    document.addEventListener('visibilitychange', onVis);
    refresh(); loop();

    return () => {
      alive = false; cancelAnimationFrame(raf); stopTimer();
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp); canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('keydown', onKey);
      ro.disconnect(); api.current = null;
      cubies.forEach(c => { c.geometry.dispose(); (c.material as THREE.Material[]).forEach(m => m.dispose()); });
      renderer.dispose();
    };
  }, []);

  return (
    <section className="playground" id="play">
      <div className="pg-frame">
        <div className="section-head">
          <h2 className="tint-cube">العب ويه أيهم</h2>
          <p>اسحب وجهاً لتديره، واسحب الخلفية لتدوير المكعب كله.</p>
        </div>
      </div>

      <div className="pg-frame">

        <div className={'pg-stage' + (failed ? ' failed' : '')} id="cubeStage" ref={stageRef}>
          <canvas id="cubeCanvas" ref={canvasRef} tabIndex={0} aria-label="مكعب ثلاثي الأبعاد تفاعلي" />
          <span className={'pg-flag' + (solved ? ' on' : '')} id="cubeFlag">محلول</span>
          <p className={'pg-hint' + (hintGone ? ' gone' : '')} id="cubeHint">اسحب وجهاً لتديره</p>
          <div className="pg-fallback">متصفحك ما يدعم العرض ثلاثي الأبعاد.<br />المكعب يشتغل على المتصفحات الحديثة.</div>
        </div>

        </div>

      <div className="wrap">
        <div className="pg-under">
          <div className="pg-stats">
            <div><b id="cubeMoves">{moves}</b><span>حركة</span></div>
            <div><b id="cubeFaces">{faces}</b><span>وجه مكتمل</span></div>
            <div><b id="cubeTime">{clock(elapsed)}</b><span>الوقت</span></div>
          </div>
          <div className="pg-controls">
            <button className="pg-btn pg-btn--gold" id="cubeScramble" type="button" disabled={busy} onClick={() => api.current?.scramble()}>اخلط المكعب</button>
            <button className="pg-btn" id="cubeReset" type="button" disabled={busy} onClick={() => api.current?.reset()}>أرجعه محلولاً</button>
          </div>
        </div>
      </div>
    </section>
  );
}
