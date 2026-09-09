import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/* =========================================================
   مكعب ٣×٣ تفاعلي قابل لإعادة الاستعمال.
   اسحب وجهاً لتدير طبقته، واسحب الخلفية لتدوير المكعب كله.

   قرار أداء مهم: الصفحة فيها عدة مكعبات، وكل واحد سياق WebGL
   مستقل. لذلك لا يرسم أي مكعب إلا وهو داخل الشاشة.
   ========================================================= */
const GAP = 1.045, TAU = Math.PI / 2;
const LOCAL = [
  new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0),
  new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1),
];
type Axis = 'x' | 'y' | 'z';

export type Scheme = { R: number; L: number; U: number; D: number; F: number; B: number };

/* التوزيع القياسي المعتمد في المسابقات */
export const STANDARD: Scheme = { R: 0xd32b18, L: 0xe8862a, U: 0xfafafa, D: 0xf5c518, F: 0x109b57, B: 0x2f6fe0 };

type Props = {
  /** يُستدعى بعد كل حركة، لعرض عدّاد خارجي إن لزم */
  onMove?: (n: number) => void;
  scheme?: Scheme;
  /** حواف الحجر: 'plain' عادي، 'studs' بأزرار ليغو */
  face?: 'plain' | 'studs';
  /** لون الجسم بين الأحجار */
  body?: number;
  /** شعار يُرسم على مركز الوجه العلوي، مثل الحجر المركزي في المكعب الحقيقي */
  logo?: 'gan' | null;
  /** تعديل شكل: 'twist' سكيوب ملتوي، 'axis' قطع مائلة */
  shape?: 'twist' | 'axis' | null;
  label?: string;
};

/* الشعار يُرسم على canvas ويصير خامة، فيدور مع الحجر ولا ينفصل عنه */
function logoTexture(kind: string, bg: number) {
  const S = 256;
  const c = document.createElement('canvas'); c.width = S; c.height = S;
  const x = c.getContext('2d')!;
  x.fillStyle = '#' + bg.toString(16).padStart(6, '0');
  x.fillRect(0, 0, S, S);
  if (kind === 'gan') {
    x.fillStyle = '#1B4F9C';
    x.font = 'bold 74px system-ui, sans-serif';
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('GAN', S / 2, S / 2 + 4);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export default function PuzzleCube({ scheme = STANDARD, face = 'plain', body = 0x17120d, logo = null, shape = null, label = 'مكعب تفاعلي' }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const api = useRef<{ scramble: () => void; reset: () => void } | null>(null);
  const [moves, setMoves] = useState(0);
  const [solvedAll, setSolvedAll] = useState(false);
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
    const CAM = new THREE.Vector3(4.5, 3.8, 5.3);
    camera.position.copy(CAM); camera.lookAt(0, 0, 0);
    const root = new THREE.Group();
    root.rotation.set(-0.16, -0.62, 0);
    scene.add(root);

    const cubies: THREE.Mesh[] = [];
    const mat = (c: number) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.42, metalness: 0.04 });
    /* أزرار ليغو: أربعة على كل وجه (شبكة ٢×٢) بدل زر واحد، وأطول وأوضح */
    const studGeo = face === 'studs' ? new THREE.CylinderGeometry(0.13, 0.135, 0.13, 20) : null;
    const STUD_GRID = [[-0.21, -0.21], [0.21, -0.21], [-0.21, 0.21], [0.21, 0.21]];

    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
      const cols = [
        x === 1 ? scheme.R : body, x === -1 ? scheme.L : body,
        y === 1 ? scheme.U : body, y === -1 ? scheme.D : body,
        z === 1 ? scheme.F : body, z === -1 ? scheme.B : body,
      ];
      const geo = face === 'studs'
        ? new THREE.BoxGeometry(1.0, 1.0, 1.0)
        : new THREE.BoxGeometry(shape ? 1.0 : 0.95, shape ? 1.0 : 0.95, shape ? 1.0 : 0.95);

      /* الشكل يُخبز في الهندسة وهي بوضع الحل: الالتواء يُحسب من موقع
         الرأس داخل المكعب كله، فتبقى القطع متلاصقة. وعند الخلط
         تتفكك الأشكال تماماً كما يحصل في المنتج الحقيقي. */
      if (shape) {
        const p = geo.attributes.position as THREE.BufferAttribute;
        const v = new THREE.Vector3();
        for (let vi = 0; vi < p.count; vi++) {
          v.fromBufferAttribute(p, vi);
          const wx = v.x + x * GAP, wy = v.y + y * GAP, wz = v.z + z * GAP;
          let nx = wx, ny = wy, nz = wz;
          if (shape === 'twist') {
            const a = wy * 0.42;                       // زاوية اللف تتناسب مع الارتفاع
            nx = wx * Math.cos(a) - wz * Math.sin(a);
            nz = wx * Math.sin(a) + wz * Math.cos(a);
          } else {
            const a = Math.PI / 4;                     // قطع مائلة ٤٥ درجة
            nx = wx * Math.cos(a) - wz * Math.sin(a);
            nz = wx * Math.sin(a) + wz * Math.cos(a);
            ny = wy + (nx - wx) * 0.16;
          }
          p.setXYZ(vi, nx - x * GAP, ny - y * GAP, nz - z * GAP);
        }
        p.needsUpdate = true;
        geo.computeVertexNormals();
      }
      const mats = cols.map(mat);
      /* الحجر المركزي للوجه العلوي يحمل الشعار */
      if (logo && x === 0 && z === 0 && y === 1) {
        mats[2] = new THREE.MeshStandardMaterial({ map: logoTexture(logo, scheme.U), roughness: 0.42, metalness: 0.04 });
      }
      const m = new THREE.Mesh(geo, mats);
      m.position.set(x * GAP, y * GAP, z * GAP);
      m.userData.colors = cols.slice();
      m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: 0x0f0c08 })));

      /* أزرار الليغو: شبكة ٢×٢ على كل وجه خارجي */
      if (studGeo) {
        const outward: [number, THREE.Euler, number][] = [
          [x, new THREE.Euler(0, 0, -Math.PI / 2), 0], [y, new THREE.Euler(0, 0, 0), 1], [z, new THREE.Euler(Math.PI / 2, 0, 0), 2],
        ];
        outward.forEach(([coord, rot, axisIdx]) => {
          if (coord === 0) return;
          const col = axisIdx === 0 ? (x === 1 ? scheme.R : scheme.L)
                    : axisIdx === 1 ? (y === 1 ? scheme.U : scheme.D)
                                    : (z === 1 ? scheme.F : scheme.B);
          const off = 0.53;
          STUD_GRID.forEach(([u, v]) => {
            const st = new THREE.Mesh(studGeo, mat(col));
            st.rotation.copy(rot);
            if (axisIdx === 0) st.position.set(coord * off, u, v);
            else if (axisIdx === 1) st.position.set(u, coord * off, v);
            else st.position.set(u, v, coord * off);
            m.add(st);
          });
        });
      }
      root.add(m); cubies.push(m);
    }

    /* three r155+ بوحدات إضاءة فيزيائية: القيم القديمة تُضرب بـ π */
    scene.add(new THREE.AmbientLight(0xffffff, 0.86 * Math.PI));
    const key = new THREE.DirectionalLight(0xffffff, 0.72 * Math.PI); key.position.set(6, 8, 5); scene.add(key);
    const fill = new THREE.DirectionalLight(0xf0b23c, 0.2 * Math.PI); fill.position.set(-5, -3, -4); scene.add(fill);
    const raycaster = new THREE.Raycaster();

    const resize = () => {
      const w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const vh = THREE.MathUtils.degToRad(camera.fov) / 2;
      const hh = Math.atan(Math.tan(vh) * camera.aspect);
      camera.position.copy(CAM).normalize().multiplyScalar(2.95 / Math.tan(Math.min(vh, hh)));
      camera.lookAt(0, 0, 0); camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(stage);

    /* ---------- حالة الحل ---------- */
    let scrambled = false, animating = false, moveCount = 0;
    const stickerFacing = (c: THREE.Mesh, dir: THREE.Vector3) => {
      for (let i = 0; i < 6; i++) {
        const v = LOCAL[i].clone().applyQuaternion(c.quaternion);
        if (v.dot(dir) > 0.9) return (c.userData.colors as number[])[i];
      }
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
    const refresh = () => { const n = solvedFaces(); setSolvedAll(n === 6 && scrambled); };

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
      /* التبويب المخفي يجمّد rAF، فننفّذ فوراً بدل ما يعلق */
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
    const toScreen = (v: THREE.Vector3) => {
      const p = v.clone().project(camera);
      return new THREE.Vector2(p.x * 0.5 * stage.clientWidth, -p.y * 0.5 * stage.clientHeight);
    };
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
    const onUp = (e: PointerEvent) => {
      canvas.classList.remove('grabbing'); mode = null; decided = false;
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!mode) return;
      const dx = e.clientX - downX, dy = e.clientY - downY;
      if (mode === 'orbit') {
        root.rotation.y += dx * 0.008;
        root.rotation.x = Math.max(-1.2, Math.min(1.2, root.rotation.x + dy * 0.008));
        downX = e.clientX; downY = e.clientY; return;
      }
      if (decided || animating || !hitCubie) return;
      const drag = new THREE.Vector2(dx, dy);
      if (drag.length() < 9) return;
      decided = true;
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
      if (turn(axis, Math.round(hitCubie.position[axis] / GAP), r[axis] > 0 ? 1 : -1, 190)) {
        moveCount++; scrambled = true; setMoves(moveCount);
      }
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('pointermove', onMove);

    const AX: Axis[] = ['x', 'y', 'z'];
    api.current = {
      scramble: () => {
        if (animating) return;
        setBusy(true); moveCount = 0; scrambled = true; setMoves(0); setSolvedAll(false);
        const next = (i: number) => {
          if (i >= 20) { setBusy(false); return; }
          turn(AX[(Math.random() * 3) | 0], ((Math.random() * 3) | 0) - 1, Math.random() < 0.5 ? 1 : -1, 90, () => next(i + 1));
        };
        next(0);
      },
      reset: () => {
        if (animating) return;
        let i = 0;
        for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
          const c = cubies[i++]; c.position.set(x * GAP, y * GAP, z * GAP); c.quaternion.identity();
        }
        moveCount = 0; scrambled = false; setMoves(0); refresh();
      },
    };

    /* ---------- الرسم: فقط وهو داخل الشاشة ---------- */
    let visible = false, alive = true, raf = 0;
    const loop = () => {
      if (!alive || !visible) { raf = 0; return; }
      raf = requestAnimationFrame(loop);
      const w = stage.clientWidth, h = stage.clientHeight, dpr = renderer.getPixelRatio();
      if (w && h && (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr))) resize();
      renderer.render(scene, camera);
    };
    const start = () => { if (!raf && alive && visible) raf = requestAnimationFrame(loop); };
    const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; visible ? start() : null; }, { rootMargin: '150px' });
    io.observe(stage);
    const onVis = () => { if (document.hidden && pendingFinish) pendingFinish(); start(); };
    document.addEventListener('visibilitychange', onVis);
    refresh(); renderer.render(scene, camera);

    return () => {
      alive = false; if (raf) cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('pointermove', onMove);
      cubies.forEach(c => { c.geometry.dispose(); (c.material as THREE.Material[]).forEach(m => m.dispose()); });
      studGeo?.dispose();
      renderer.dispose();
      api.current = null;
    };
  }, [scheme, face, body, logo, shape]);

  return (
    <div className="pcube">
      <div className={'pcube__stage' + (failed ? ' failed' : '')} ref={stageRef}>
        <canvas ref={canvasRef} tabIndex={0} aria-label={label} />
        {solvedAll && <span className="pcube__flag">محلول</span>}
        <div className="pcube__fallback">متصفحك ما يدعم العرض ثلاثي الأبعاد.</div>
      </div>
      <div className="pcube__bar">
        <button type="button" disabled={busy} onClick={() => api.current?.scramble()}>اخلط</button>
        <button type="button" disabled={busy} onClick={() => api.current?.reset()}>أرجعه</button>
      </div>
    </div>
  );
}
