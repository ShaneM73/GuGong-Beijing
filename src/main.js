import * as THREE from 'three';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { buildModel, DEG } from './model.js';

const $ = s => document.querySelector(s);
const app = $('#app'), canvas = $('#c'), veil = $('#veil');
const AXIS = 2.17, LAT0 = 39.9163, LON0 = 116.3907;
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches, coarse = matchMedia('(pointer:coarse)').matches;

function start() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, coarse ? 1.75 : 2));
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  { const c = document.createElement('canvas'); c.width = 4; c.height = 256; const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, '#6f9bd1'); gr.addColorStop(.55, '#b9d0e6'); gr.addColorStop(1, '#e4e6df'); g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; scene.background = t; }
  scene.fog = new THREE.Fog(0xd5dde0, 5000, 30000);
  const camera = new THREE.PerspectiveCamera(42, 1, 2, 40000);
  scene.add(new THREE.HemisphereLight(0xe6efff, 0xa39a86, 1.55));
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.5); sun.position.set(520, 700, 620); scene.add(sun, sun.target);
  Object.assign(sun.shadow.camera, { left: -1000, right: 1000, top: 1000, bottom: -1000, near: 100, far: 2600 }); sun.shadow.mapSize.set(coarse ? 2048 : 4096, coarse ? 2048 : 4096); sun.shadow.bias = -0.0006; sun.shadow.normalBias = .6;
  const lamp = new THREE.PointLight(0xffd7a0, 0, 80, 1); scene.add(lamp);

  const { base, roof, sites, tris } = buildModel();
  scene.add(base, roof);
  const setShadow = on => { renderer.shadowMap.enabled = on; sun.castShadow = on; [base, roof].forEach(g => g.children.forEach(m => { m.castShadow = on && m.userData.k !== 'water'; m.receiveShadow = on; if (m.material) m.material.needsUpdate = true; })); dirty = true; };

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = !calm; controls.dampingFactor = .09; controls.zoomSpeed = 1.1; controls.rotateSpeed = .6; controls.screenSpacePanning = false;
  let dirty = true, mode = 'out', cur = null, fly = null, showLabels = true;
  controls.addEventListener('change', () => dirty = true);
  const outLimits = () => { controls.minDistance = 14; controls.maxDistance = 15000; controls.minPolarAngle = 0; controls.maxPolarAngle = Math.PI / 2 - .04; controls.enablePan = true; camera.near = 2; camera.fov = 42; camera.updateProjectionMatrix(); };
  outLimits();
  const sph = (t, az, pol, dist) => new THREE.Vector3(Math.sin(az) * Math.sin(pol), Math.cos(pol), Math.cos(az) * Math.sin(pol)).multiplyScalar(dist).add(t);
  const homeView = () => { const t = new THREE.Vector3(0, 0, 1050); return [sph(t, -24 * DEG, 56 * DEG, camera.aspect < 1 ? 12500 : 8200), t]; };
  const viewOf = s => { const t = new THREE.Vector3(s.x, s.y0 + s.h * .4, -s.n), d = Math.min(3600, Math.max(48, Math.max(s.hw, s.hd) * (camera.aspect < 1 ? 4.2 : 2.6) + s.h * 1.6)); return [sph(t, controls.getAzimuthalAngle(), 60 * DEG, d), t]; };
  function flyTo([p, t], done) { fly = { p0: camera.position.clone(), t0: controls.target.clone(), p1: p, t1: t, s: performance.now(), dur: calm ? 1 : 1300, done }; controls.enabled = false; }

  /* ---- labels ---- */
  const labelsEl = $('#labels'), labs = sites.filter(s => s.rank).map(s => { const e = document.createElement('span'); e.textContent = s.name; e.className = 'lab r' + s.rank; labelsEl.appendChild(e); return { s, e, on: false }; });
  const v = new THREE.Vector3();
  function updateLabels() {
    const w = app.clientWidth, h = app.clientHeight, show = showLabels && mode === 'out';
    for (const l of labs) {
      const s = l.s; v.set(s.x, s.y0 + s.h + 4, -s.n); const dist = v.distanceTo(camera.position); v.project(camera);
      const on = show && v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05 && dist < (s.far === 2 ? 60000 : s.far === 1 ? 5200 : s.rank === 1 ? 2600 : 560) && dist > (s.minD || 0) && s !== cur;
      if (on) l.e.style.transform = `translate(-50%,-100%) translate(${((v.x + 1) / 2 * w).toFixed(1)}px,${((1 - v.y) / 2 * h).toFixed(1)}px)`;
      if (on !== l.on) { l.e.style.opacity = on ? 1 : 0; l.on = on; }
    }
    $('#needle').style.transform = `rotate(${(controls.getAzimuthalAngle() / DEG + AXIS).toFixed(1)}deg)`;
  }

  /* ---- selection ---- */
  const hl = new THREE.Box3Helper(new THREE.Box3(), 0xffd76a); hl.visible = false; hl.material.depthTest = false; hl.material.transparent = true; hl.material.opacity = .8; scene.add(hl);
  const card = $('#card');
  function geo(s) {
    const a = AXIS * DEG, E = s.x * Math.cos(a) - s.n * Math.sin(a), N = s.x * Math.sin(a) + s.n * Math.cos(a);
    const lat = LAT0 + N / 111320, lon = LON0 + E / (111320 * Math.cos(LAT0 * DEG));
    const off = Math.abs(s.x) < 1 ? '位于中轴线上' : `中轴线以${s.x > 0 ? '东' : '西'} ${Math.abs(s.x).toFixed(0)} m`;
    return `约 ${lat.toFixed(4)}°N，${lon.toFixed(4)}°E · ${off}`;
  }
  function select(s, move = true) {
    cur = s; card.hidden = false; $('#hint').classList.add('gone');
    $('#cKind').textContent = s.kind || '宫殿建筑'; $('#cName').textContent = s.name; $('#cDims').textContent = s.dims || ''; $('#cDims').hidden = !s.dims;
    $('#cInfo').textContent = s.info || ''; $('#cInfo').hidden = !s.info; $('#cGeo').textContent = geo(s); $('#bIn').hidden = !s.inside;
    hl.box.set(new THREE.Vector3(s.x - s.hw, s.y0, -s.n - s.hd), new THREE.Vector3(s.x + s.hw, s.y0 + s.h, -s.n + s.hd)); hl.visible = mode === 'out';
    document.querySelectorAll('#chips button').forEach(b => b.setAttribute('aria-pressed', b.dataset.n === s.name));
    if (move) flyTo(viewOf(s)); dirty = true;
  }
  function deselect() { cur = null; card.hidden = true; hl.visible = false; document.querySelectorAll('#chips button').forEach(b => b.setAttribute('aria-pressed', 'false')); dirty = true; }
  function enter(s) {
    mode = 'in'; app.dataset.mode = 'in'; hl.visible = false; card.hidden = true; $('#inName').textContent = s.name + ' · 殿内';
    camera.near = .25; camera.fov = camera.aspect < 1 ? 82 : 62; camera.updateProjectionMatrix(); controls.enablePan = false;
    controls.minDistance = 1.2; controls.maxDistance = s.inside.R + .4; controls.minPolarAngle = Math.PI / 2 - .55; controls.maxPolarAngle = Math.PI / 2 + .45;
    lamp.position.copy(s.inside.t); lamp.position.y += 2.5; lamp.intensity = 16;
    flyTo([s.inside.c.clone(), s.inside.t.clone()]);
  }
  function leave() { mode = 'out'; app.dataset.mode = 'out'; lamp.intensity = 0; outLimits(); if (cur) { select(cur); } else flyTo(homeView()); }

  const ray = new THREE.Raycaster(), bx = new THREE.Box3(), hit = new THREE.Vector3();
  function pick(cx, cy) {
    const r = canvas.getBoundingClientRect(); ray.setFromCamera(new THREE.Vector2((cx - r.left) / r.width * 2 - 1, -(cy - r.top) / r.height * 2 + 1), camera);
    let best = null, bd = 1e9, low = null, ld = 1e9;
    for (const s of sites) {
      if (s.noPick) continue;
      bx.min.set(s.x - s.hw, s.y0, -s.n - s.hd); bx.max.set(s.x + s.hw, s.y0 + s.h, -s.n + s.hd);
      if (ray.ray.intersectBox(bx, hit)) { const d = hit.distanceTo(camera.position); if (s.pickLow) { if (d < ld) { ld = d; low = s; } } else if (d < bd) { bd = d; best = s; } }
    }
    const s = best || low; if (s) select(s, false); else deselect();
  }
  let pd = null;
  canvas.addEventListener('pointerdown', e => { pd = { x: e.clientX, y: e.clientY, t: performance.now() }; $('#hint').classList.add('gone'); });
  canvas.addEventListener('pointerup', e => { if (pd && mode === 'out' && !fly && Math.hypot(e.clientX - pd.x, e.clientY - pd.y) < 7 && performance.now() - pd.t < 450) pick(e.clientX, e.clientY); pd = null; });

  /* ---- UI ---- */
  const order = ['永定门', '先农坛', '太岁殿', '天坛', '圜丘', '皇穹宇 · 回音壁', '祈年殿', '南段道路遗存', '正阳门箭楼', '正阳门', '天安门广场', '毛主席纪念堂', '人民英雄纪念碑', '人民大会堂', '中国国家博物馆', '外金水桥', '天安门', '社稷坛 · 五色土', '太庙享殿', '端门', '故宫', '午门', '内金水桥', '太和门', '太和殿', '中和殿', '保和殿', '乾清门', '乾清宫', '交泰殿', '坤宁宫', '御花园', '神武门', '景山 · 万春亭', '万宁桥', '鼓楼', '钟楼', '养心殿', '储秀宫', '皇极殿', '九龙壁', '畅音阁', '文华殿', '文渊阁', '武英殿', '慈宁宫', '雨花阁', '西北角楼', '东华门'];
  const chips = $('#chips');
  for (const nme of order) { const s = sites.find(x => x.name === nme); if (!s) continue; const b = document.createElement('button'); b.type = 'button'; b.textContent = nme.replace('景山 · ', '').replace(' · 回音壁', '').replace(' · 五色土', '').replace('太庙享殿', '太庙').replace('南段道路遗存', '南段道路'); b.dataset.n = nme; b.setAttribute('aria-pressed', 'false'); if (s.inside) b.classList.add('has-in'); b.onclick = () => { if (mode === 'in') { mode = 'out'; app.dataset.mode = 'out'; lamp.intensity = 0; outLimits(); } select(s); }; chips.appendChild(b); }
  const tog = (id, fn, init) => { const b = $(id); let on = init; b.setAttribute('aria-pressed', on); b.onclick = () => { on = !on; b.setAttribute('aria-pressed', on); fn(on); dirty = true; }; fn(on); };
  tog('#bCut', on => { roof.visible = !on; }, false);
  tog('#bLab', on => { showLabels = on; }, true);
  tog('#bSh', on => setShadow(on), !coarse);
  $('#bHome').onclick = () => { if (mode === 'in') { mode = 'out'; app.dataset.mode = 'out'; lamp.intensity = 0; outLimits(); } deselect(); flyTo(homeView()); };
  $('#bFC').onclick = () => { const s = sites.find(x => x.name === '故宫'); if (mode === 'in') { mode = 'out'; app.dataset.mode = 'out'; lamp.intensity = 0; outLimits(); } deselect(); flyTo(viewOf(s)); };
  $('#bIn').onclick = () => cur && cur.inside && enter(cur);
  $('#bFly').onclick = () => cur && flyTo(viewOf(cur));
  $('#bClose').onclick = deselect; $('#bOut').onclick = leave;
  $('#stat').textContent = `${sites.length} 处可点选建筑 · ${(tris / 1000).toFixed(0)}k 三角面`;

  function resize() { const w = app.clientWidth, h = app.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); dirty = true; }
  new ResizeObserver(resize).observe(app); resize();
  { const [p, t] = homeView(); camera.position.copy(p); controls.target.copy(t); controls.update(); }
  const q = new URLSearchParams(location.search);
  if (q.get('s')) { const s = sites.find(x => x.name === q.get('s')); if (s) { select(s, false); const [p, t] = q.get('in') ? [s.inside.c, s.inside.t] : viewOf(s); if (q.get('in')) enter(s); if (q.get('cut')) roof.visible = false; fly = null; controls.enabled = true; camera.position.copy(p); controls.target.copy(t); controls.update(); } }

  function loop(now) {
    requestAnimationFrame(loop);
    if (fly) { const k = Math.min(1, (now - fly.s) / fly.dur), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; camera.position.lerpVectors(fly.p0, fly.p1, e); controls.target.lerpVectors(fly.t0, fly.t1, e); camera.lookAt(controls.target); dirty = true; if (k >= 1) { const d = fly.done; fly = null; controls.enabled = true; controls.update(); d && d(); } }
    else controls.update();
    if (dirty) { dirty = false;
      if (mode === 'out') { const nr = Math.min(400, Math.max(2, camera.position.y * .07)); if (Math.abs(nr - camera.near) > camera.near * .15) { camera.near = nr; camera.updateProjectionMatrix(); } }
      const tx = Math.round(controls.target.x / 60) * 60, tz = Math.round(controls.target.z / 60) * 60; sun.target.position.set(tx, 0, tz); sun.position.set(tx + 520, 700, tz + 620);
      renderer.render(scene, camera); updateLabels(); }
  }
  requestAnimationFrame(loop);
  veil.classList.add('gone'); window.__ready = true;
}
requestAnimationFrame(() => setTimeout(() => { try { start(); } catch (e) { console.error(e); veil.textContent = '模型加载失败：此设备或浏览器可能不支持 WebGL。请换用较新的浏览器再试。'; window.__err = String(e && e.stack || e); } }, 30));
