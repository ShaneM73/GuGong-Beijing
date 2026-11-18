import * as THREE from 'three';
import { mergeGeometries } from '../node_modules/three/examples/jsm/utils/BufferGeometryUtils.js';

export const DEG = Math.PI / 180;
let seed = 20260;
const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

/* ---------- textures & materials ---------- */
function cv(w, h, fn) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function tileTex(base, dark, light) {
  const t = cv(64, 64, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2; i++) { const x = i * 32; g.fillStyle = dark; g.fillRect(x, 0, 8, h); g.fillStyle = light; g.fillRect(x + 15, 0, 9, h); }
    g.fillStyle = 'rgba(0,0,0,.16)'; for (let y = 0; y < h; y += 16) g.fillRect(0, y, w, 2);
  });
  t.repeat.set(1 / 1.1, 1 / 1.6); return t;
}
const TEX = {
  arrow: () => { const t = cv(64, 64, (g, w, h) => { g.fillStyle = '#8c8e8d'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(40,40,40,.25)'; for (let y = 0; y < h; y += 8) { g.beginPath(); g.moveTo(0, y + .5); g.lineTo(w, y + .5); g.stroke(); } g.fillStyle = '#b3382a'; g.fillRect(22, 18, 20, 26); g.fillStyle = '#1c1512'; g.fillRect(25, 21, 14, 20); }); t.repeat.set(1 / 4, 1 / 2.9); return t; },
  facade: () => { const t = cv(64, 128, (g, w, h) => { g.fillStyle = '#e7dbbd'; g.fillRect(0, 0, w, h); g.fillStyle = '#6d7480'; for (let y = 14; y < h - 22; y += 26) g.fillRect(20, y, 24, 17); g.fillStyle = '#d6c8a4'; g.fillRect(0, 0, 6, h); g.fillRect(w - 6, 0, 6, h); g.fillStyle = '#cdbf9a'; g.fillRect(0, h - 12, w, 12); }); t.repeat.set(1 / 5.2, 1); return t; },
  soil5: () => { const t = cv(128, 128, (g, w) => { const q = (c, pts) => { g.fillStyle = c; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0] * w, p[1] * w) : g.moveTo(p[0] * w, p[1] * w)); g.fill(); };
    q('#2b2b2e', [[0, 0], [1, 0], [.5, .5]]); q('#3f79b8', [[1, 0], [1, 1], [.5, .5]]); q('#b8412e', [[1, 1], [0, 1], [.5, .5]]); q('#ece8dc', [[0, 1], [0, 0], [.5, .5]]); q('#d9b23c', [[.3, .3], [.7, .3], [.7, .7], [.3, .7]]); }); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t; },
  flag: () => { const t = cv(96, 64, (g, w, h) => { g.fillStyle = '#d7261c'; g.fillRect(0, 0, w, h); g.fillStyle = '#f7d83a'; const st = (x, y, r) => { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .4 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.fill(); }; st(16, 16, 9); st(32, 6, 3); st(38, 13, 3); st(38, 22, 3); st(32, 29, 3); }); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t; },
  lattice: () => { const t = cv(64, 128, (g, w, h) => {
    g.fillStyle = '#9e2b1c'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#7c1f14'; g.fillRect(0, 0, 3, h); g.fillRect(w - 3, 0, 3, h);
    g.strokeStyle = '#d9b25a'; g.lineWidth = 1.2;
    for (let y = 8; y < 86; y += 6) { g.beginPath(); g.moveTo(6, y); g.lineTo(w - 6, y); g.stroke(); }
    for (let x = 6; x <= w - 6; x += 6.5) { g.beginPath(); g.moveTo(x, 8); g.lineTo(x, 86); g.stroke(); }
    g.lineWidth = 2; g.strokeRect(7, 96, w - 14, 26); g.fillStyle = '#d9b25a'; g.fillRect(w / 2 - 5, 105, 10, 8);
    g.fillStyle = '#c9a04a'; g.fillRect(4, 88, w - 8, 3);
  }); t.repeat.set(1 / 1.3, 1); return t; },
  caihua: () => { const t = cv(128, 32, (g, w, h) => {
    g.fillStyle = '#1f4f8f'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#1f7a55'; g.fillRect(0, 0, 64, 14); g.fillRect(64, 14, 64, 18);
    g.fillStyle = '#143a70'; g.fillRect(64, 0, 64, 14);
    g.fillStyle = '#e2b84f'; g.fillRect(0, 13, w, 2); g.fillRect(0, 0, w, 2); g.fillRect(62, 0, 3, 14); g.fillRect(126, 0, 2, 14);
    for (let x = 4; x < w; x += 16) { g.fillStyle = (x / 16 | 0) % 2 ? '#2a8c63' : '#2c62ad'; g.fillRect(x, 18, 9, 11); g.fillStyle = '#e2b84f'; g.fillRect(x + 3, 21, 3, 5); }
    g.fillStyle = '#e2b84f'; g.beginPath(); g.arc(32, 7, 3.5, 0, 7); g.arc(96, 7, 3.5, 0, 7); g.fill();
  }); t.repeat.set(1 / 3, 1); return t; },
  paving: () => { const t = cv(64, 64, (g, w, h) => {
    g.fillStyle = '#a8a59b'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${rnd() > .5 ? 255 : 0},${rnd() > .5 ? 255 : 0},${rnd() > .5 ? 240 : 0},.035)`; g.fillRect((rnd() * 4 | 0) * 16, (rnd() * 8 | 0) * 8, 16, 8); }
    g.strokeStyle = 'rgba(60,58,50,.35)'; g.lineWidth = 1;
    for (let y = 0; y < h; y += 8) { g.beginPath(); g.moveTo(0, y + .5); g.lineTo(w, y + .5); g.stroke(); for (let x = (y / 8 % 2) * 8; x < w; x += 16) { g.beginPath(); g.moveTo(x + .5, y); g.lineTo(x + .5, y + 8); g.stroke(); } }
  }); t.repeat.set(1 / 4, 1 / 4); return t; },
  stairs: () => { const t = cv(8, 16, (g, w, h) => { g.fillStyle = '#e4e0d4'; g.fillRect(0, 0, w, h); g.fillStyle = '#a9a495'; g.fillRect(0, 0, w, 5); }); t.repeat.set(1, 1 / .45); return t; },
  carved: () => { const t = cv(32, 32, (g, w, h) => { g.fillStyle = '#cfcabc'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8f8a7c'; g.lineWidth = 2; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(8 + (i % 2) * 16, 8 + (i >> 1) * 16, 5, 0, 7); g.stroke(); } }); t.repeat.set(1 / 1.5, 1 / 1.5); return t; },
  ceiling: () => { const t = cv(64, 64, (g, w, h) => {
    g.fillStyle = '#1d6b4c'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d9b25a'; g.lineWidth = 5; g.strokeRect(0, 0, w, h);
    g.fillStyle = '#1c4c93'; g.beginPath(); g.arc(32, 32, 20, 0, 7); g.fill(); g.strokeStyle = '#e6c15a'; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#e6c15a'; g.beginPath(); g.arc(32, 32, 8, 0, 7); g.fill();
  }); t.repeat.set(1 / 1.6, 1 / 1.6); return t; },
  floor: () => { const t = cv(32, 32, (g, w, h) => { g.fillStyle = '#3d3a36'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a2826'; g.lineWidth = 1.5; g.strokeRect(0, 0, w, h); }); t.repeat.set(1 / .9, 1 / .9); return t; },
  dragon: () => cv(512, 64, (g, w, h) => {
    g.fillStyle = '#1e5aa0'; g.fillRect(0, 0, w, h); g.fillStyle = '#1b7d5e'; g.fillRect(0, h - 14, w, 14);
    g.fillStyle = '#d7a528'; g.fillRect(0, 0, w, 5);
    const cols = ['#e3b62e', '#3d9be0', '#e9e4d0', '#7b3fa0', '#e08a2c', '#e3b62e', '#e9e4d0', '#3d9be0', '#e08a2c'];
    for (let i = 0; i < 9; i++) { const cx = 30 + i * 56.5; g.strokeStyle = cols[i]; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath();
      for (let k = 0; k <= 20; k++) { const a = k / 20 * Math.PI * 2.6; const x = cx + Math.cos(a) * (16 - k * .5), y = 30 + Math.sin(a) * (14 - k * .4); k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
      g.fillStyle = '#f3ead0'; g.beginPath(); g.arc(cx, 30, 3, 0, 7); g.fill(); }
  }),
};
function plaqueTex(text) {
  return cv(64 * text.length + 48, 96, (g, w, h) => {
    g.fillStyle = '#c9a23c'; g.fillRect(0, 0, w, h); g.fillStyle = '#12306e'; g.fillRect(7, 7, w - 14, h - 14);
    g.fillStyle = '#f0cf6a'; g.font = 'bold 54px "Songti SC","STSong","Noto Serif CJK SC","Noto Serif SC","SimSun",serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    [...text].forEach((ch, i) => g.fillText(ch, 24 + 32 + i * 64, h / 2 + 3));
  });
}
const L = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });
const S = (o) => new THREE.MeshStandardMaterial(o);
const DS = THREE.DoubleSide;
const MATS = {};
const MATDEF = {
  tileY: () => S({ map: tileTex('#dc9f20', '#a8720f', '#f6c851'), roughness: .42, metalness: .18, side: DS }),
  tileG: () => S({ map: tileTex('#3f8a56', '#27603a', '#63b27a'), roughness: .45, metalness: .15, side: DS }),
  tileK: () => S({ map: tileTex('#3b3f45', '#23262b', '#5a6068'), roughness: .5, metalness: .15, side: DS }),
  ridgeY: () => L(0xc98a18), ridgeG: () => L(0x2f6e44), ridgeK: () => L(0x2f7a55),
  red: () => L(0xa63323), wallRed: () => L(0x94301f), col: () => L(0xb3301c), gable: () => L(0x9a2f20, { side: DS }),
  lattice: () => L(0xffffff, { map: TEX.lattice() }), caihua: () => L(0xffffff, { map: TEX.caihua() }),
  marble: () => L(0xe9e5d9), stone: () => L(0xc9c4b6), stairs: () => L(0xffffff, { map: TEX.stairs() }), carved: () => L(0xffffff, { map: TEX.carved() }),
  paving: () => L(0xffffff, { map: TEX.paving() }), city: () => L(0x8d9486), grass: () => L(0x5d7f4a), rock: () => L(0x8a8780),
  water: () => S({ color: 0x3f6f73, roughness: .25, metalness: .3 }), dark: () => L(0x1a1210),
  gold: () => S({ color: 0xe0b040, roughness: .35, metalness: .75, emissive: 0x3a2800 }), screen: () => S({ color: 0xb88a2c, roughness: .5, metalness: .6, emissive: 0x2a1c00 }),
  wood: () => L(0x6e2a1a), bronze: () => S({ color: 0x5a4a32, roughness: .6, metalness: .6 }), blue: () => L(0x1b3a86), yellow: () => L(0xe6c040),
  ceiling: () => L(0xffffff, { map: TEX.ceiling(), side: DS }), floor: () => L(0xffffff, { map: TEX.floor() }),
  dragon: () => L(0xffffff, { map: TEX.dragon(), side: DS }),
  tileB: () => S({ map: tileTex('#2a57ad', '#1a3a7c', '#4f80d6'), roughness: .4, metalness: .2, side: DS }), ridgeB: () => L(0x1d3f86),
  brick: () => L(0x8c8e8d), cream: () => L(0xe6d9b8), granite: () => L(0x7c4038), granL: () => L(0xddd3bf), road: () => L(0x64676a), stoneRoad: () => L(0xb7b2a4), plaza: () => L(0xc6c2b6), roofFlat: () => L(0x9c968a), white: () => L(0xf4f2ea), wBlue: () => L(0x2a57ad), soilPlot: () => L(0x8a6a44),
  latticeDS: () => L(0xffffff, { map: TEX.lattice(), side: DS }), caihuaDS: () => L(0xffffff, { map: TEX.caihua(), side: DS }), marbleDS: () => L(0xe9e5d9, { side: DS }),
  arrow: () => L(0xffffff, { map: TEX.arrow() }), facade: () => L(0xffffff, { map: TEX.facade() }), soil5: () => L(0xffffff, { map: TEX.soil5() }), flag: () => L(0xffffff, { map: TEX.flag(), side: DS }),
};
function mat(k) {
  if (!MATS[k]) MATS[k] = k.startsWith('plq:') ? L(0xffffff, { map: plaqueTex(k.slice(4)), side: DS }) : MATDEF[k]();
  return MATS[k];
}

/* ---------- geometry helpers ---------- */
const batches = {};
function push(m, geo, M, layer = 'base') { if (geo.index) geo = geo.toNonIndexed(); if (M) geo.applyMatrix4(M); (batches[m + '|' + layer] ||= []).push(geo); }
const T = (x, y, z, ry = 0) => new THREE.Matrix4().makeRotationY(ry).setPosition(x, y, z);
const mul = (M, x, y, z, ry = 0) => M.clone().multiply(T(x, y, z, ry));
function box(w, h, d, fit) {
  const g = new THREE.BoxGeometry(w, h, d); g.translate(0, h / 2, 0);
  const p = g.attributes.position, nm = g.attributes.normal, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const nx = nm.getX(i), ny = nm.getY(i); let u, v;
    if (Math.abs(ny) > .5) { u = p.getX(i); v = p.getZ(i); } else if (Math.abs(nx) > .5) { u = p.getZ(i); v = p.getY(i); } else { u = p.getX(i); v = p.getY(i); }
    if (fit && Math.abs(ny) < .5) v = v / h; uv.setXY(i, u, v);
  }
  return g;
}
const cyl = (r, h, seg = 8) => { const g = new THREE.CylinderGeometry(r, r, h, seg); g.translate(0, h / 2, 0); return g; };
function tri(pos, uvs) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g.computeVertexNormals(); return g; }
function prism(pts, h) { // pts in [x, n]
  const s = new THREE.Shape(pts.map(p => new THREE.Vector2(p[0], p[1]))); const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false }); g.rotateX(-Math.PI / 2); return g;
}
function wedge(w, run, rise) {
  const a = [-w / 2, 0, run], b = [w / 2, 0, run], c = [w / 2, rise, 0], d = [-w / 2, rise, 0], e = [-w / 2, 0, 0], f = [w / 2, 0, 0], sl = Math.hypot(run, rise);
  return tri([...a, ...b, ...c, ...a, ...c, ...d, ...a, ...d, ...e, ...b, ...f, ...c], [a[0], 0, b[0], 0, c[0], sl, a[0], 0, c[0], sl, d[0], sl, run, 0, 0, rise, 0, 0, run, 0, 0, 0, 0, rise]);
}
function stairs(M, w, run, rise, carved, m = 'stairs') { push(m, wedge(w, run, rise), M); if (carved) push('carved', wedge(w * .3, run + .15, rise + .12), M); }
function seg(m, a, b, th, M, layer = 'roof') {
  const len = a.distanceTo(b); if (len < .01) return; const g = box(th, th, len); const o = new THREE.Object3D(); o.position.copy(a).add(b).multiplyScalar(.5); o.lookAt(b); o.updateMatrix();
  push(m, g, M.clone().multiply(o.matrix), layer);
}
function railPoly(M, y, pts) { // pts local [x,z]
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], dx = x1 - x0, dz = z1 - z0, len = Math.hypot(dx, dz); if (len < .2) continue;
    const a = Math.atan2(-dz, dx); push('marble', box(len, .75, .18), mul(M, (x0 + x1) / 2, y, (z0 + z1) / 2, a));
    const np = Math.max(1, Math.round(len / 2.4)); for (let k = 0; k <= np; k++) push('marble', box(.3, 1.2, .3), mul(M, x0 + dx * k / np, y, z0 + dz * k / np, a));
  }
}
function railRect(M, y, hw, hd, gapF = 0, gapB = 0) {
  if (!gapB) railPoly(M, y, [[gapF, hd], [hw, hd], [hw, -hd], [-hw, -hd], [-hw, hd], [-gapF, hd]].slice(gapF ? 0 : 1).concat(gapF ? [] : [[hw, hd]]));
  else { railPoly(M, y, [[gapF, hd], [hw, hd], [hw, -hd], [gapB, -hd]]); railPoly(M, y, [[-gapB, -hd], [-hw, -hd], [-hw, hd], [-gapF, hd]]); }
}

/* ---------- Chinese roofs ---------- */
function roofGeo(ax, az, bx, bz, h, o = {}) {
  const nt = o.nt || 5, ns = o.ns || 4, tg = o.tg ?? 1, lift = o.lift ?? Math.min(ax, az) * .1;
  const hx = t => tg >= 1 ? ax + (bx - ax) * t : (t < tg ? ax + (bx - ax) * t / tg : bx), hz = t => az + (bz - az) * t, hy = t => h * (.45 * t + .55 * t * t);
  const sl = Math.hypot(h, az - bz);
  const pt = (u, v, t) => [u * hx(t), hy(t) + Math.pow(Math.abs(u * v), 4) * lift * (1 - t) * (1 - t), v * hz(t)];
  const pos = [], uv = [];
  const side = (fixed, sgn, tmax) => {
    for (let i = 0; i < ns; i++) for (let k = 0; k < nt; k++) {
      const s0 = -1 + 2 * i / ns, s1 = -1 + 2 * (i + 1) / ns, t0 = tmax * k / nt, t1 = tmax * (k + 1) / nt;
      const P = (s, t) => fixed === 'v' ? pt(s, sgn, t) : pt(sgn, s, t), U = (p, t) => [fixed === 'v' ? p[0] : p[2], t * sl];
      const a = P(s0, t0), b = P(s1, t0), c = P(s1, t1), d = P(s0, t1);
      pos.push(...a, ...b, ...c, ...a, ...c, ...d); uv.push(...U(a, t0), ...U(b, t0), ...U(c, t1), ...U(a, t0), ...U(c, t1), ...U(d, t1));
    }
  };
  side('v', 1, 1); side('v', -1, 1); const tm = tg < 1 ? tg : 1; side('u', 1, tm); side('u', -1, tm);
  let gable = null;
  if (tg < 1) {
    const gp = [], gu = [], n = 5;
    for (const s of [1, -1]) { const x = s * bx * .985, c = [x, hy(tg), 0];
      for (const v of [1, -1]) for (let k = 0; k < n; k++) { const t0 = tg + (1 - tg) * k / n, t1 = tg + (1 - tg) * (k + 1) / n; const a = [x, hy(t0), v * hz(t0)], b = [x, hy(t1), v * hz(t1)]; gp.push(...c, ...a, ...b); gu.push(0, c[1], a[2], a[1], b[2], b[1]); } }
    gable = tri(gp, gu);
  }
  return { roof: tri(pos, uv), gable, pt, hy, hz, tm };
}
function addRoof(M, y, ax, az, type, rh, o = {}) {
  const m = o.mat || 'tileY'; let bx, tg = 1;
  if (type === 'hip') bx = Math.max(ax - az * .82, ax * .1); else if (type === 'xie') { bx = Math.max(ax - az * .55, ax * .3); tg = .42; } else if (type === 'gable') { bx = ax - .01; tg = .02; } else bx = 0;
  const r = roofGeo(ax, az, bx, 0, rh, { tg, lift: o.lift, ns: o.detail ? 6 : 3, nt: o.detail ? 6 : 4 });
  const My = mul(M, 0, y, 0);
  push(m, r.roof, My, 'roof'); if (r.gable) push('gable', r.gable, My, 'roof');
  const rk = ridgeOf(m), rs = o.rs || Math.max(.3, Math.min(.85, az * .06));
  if (type === 'pyr') {
    push('gold', new THREE.SphereGeometry(rs * 1.7, 10, 8), mul(My, 0, rh + rs * 1.6, 0), 'roof'); push('gold', cyl(rs * 1.1, rs * 1.2), mul(My, 0, rh - rs * .3, 0), 'roof');
  } else {
    push(rk, box(2 * bx + rs, rs * 1.3, rs * .7), mul(My, 0, rh - rs * .4, 0), 'roof');
    for (const s of [1, -1]) push(rk, box(rs * .8, rs * 2.6, rs * .9), mul(My, s * bx, rh - rs * .4, 0), 'roof');
  }
  if (o.detail) for (const u of [1, -1]) for (const v of [1, -1]) {
    let prev = null; const n = 6;
    for (let k = 0; k <= n; k++) { const p = new THREE.Vector3(...r.pt(u, v, r.tm * k / n)); if (prev) seg(rk, prev, p, rs * .5, My); prev = p; }
    if (type === 'xie') { prev = null; for (let k = 0; k <= 4; k++) { const t = tg + (1 - tg) * k / 4, p = new THREE.Vector3(u * bx, r.hy(t), v * r.hz(t)); if (prev) seg(rk, prev, p, rs * .5, My); prev = p; } }
  }
  return rh + rs * 2;
}
function roofs(M, y, w, d, o) {
  const type = o.type || 'xie', ov = o.ov ?? Math.max(1.1, Math.min(3.4, o.hc * .3)), m = o.mat || 'tileY', det = o.detail, ne = o.eaves || (o.dbl ? 2 : 1);
  let cw = w, cd = d, yy = y;
  for (let e = 1; e < ne; e++) {
    const ix = o.ix ?? Math.min(cw, cd) * .12, hs = o.hs ?? o.hc * .28, hu = o.hu ?? o.hc * .24;
    const s = roofGeo(cw / 2 + ov, cd / 2 + ov, cw / 2 - ix, cd / 2 - ix, hs, { ns: det ? 6 : 3, nt: 3, lift: o.lift });
    const My = mul(M, 0, yy, 0); push(m, s.roof, My, 'roof');
    if (det) { const rk = ridgeOf(m); for (const u of [1, -1]) for (const v of [1, -1]) { let prev = null; for (let k = 0; k <= 3; k++) { const p = new THREE.Vector3(...s.pt(u, v, k / 3)); if (prev) seg(rk, prev, p, .4, My); prev = p; } } }
    push(o.upper || 'caihua', box(cw - 2 * ix, hu + hs * .4, cd - 2 * ix, true), mul(M, 0, yy + hs * .6, 0), 'roof');
    if (o.sign && e === ne - 1) { push('gold', box(2.6, hu * .9 + .2, .25), mul(M, 0, yy + hs + hu * .02, cd / 2 - ix + .05), 'roof'); push('blue', box(2.2, hu * .9 - .2, .3), mul(M, 0, yy + hs + hu * .02 + .2, cd / 2 - ix + .08), 'roof'); }
    yy += hs + hu; cw -= 2 * ix; cd -= 2 * ix;
  }
  const k = ne > 1 ? .9 : 1, rh = o.rh ?? (cd / 2 + ov) * (type === 'pyr' ? (ne > 1 ? .8 : .75) : .62);
  return yy + addRoof(M, yy, cw / 2 + ov * k, cd / 2 + ov * k, type, rh, o);
}

/* ---------- registry ---------- */
export const sites = [];
function reg(o) { const r = Math.abs((o.rot || 0) % 180) === 90; sites.push({ ...o, hw: (r ? o.d : o.w) / 2, hd: (r ? o.w : o.d) / 2 }); }

/* ---------- detailed hall with real column grid + interior ---------- */
function hall(o) {
  const { x, n, w, d, hc } = o, nbx = o.bx, nbz = o.bz, y0 = o.y || 0;
  const M = T(x, y0, -n, (o.rot || 0) * DEG), bh = o.base ?? 1.2, bm = o.bm ?? Math.max(1.5, hc * .3);
  if (bh > 0) {
    push('marble', box(w + 2 * bm, bh, d + 2 * bm), M);
    const sw = Math.min(w * .3, 9);
    if (bh >= .8 && !o.nostair) { stairs(mul(M, 0, 0, d / 2 + bm), sw, bh * 2.2, bh, o.rail); if (o.gate || o.backStair) stairs(mul(M, 0, 0, -d / 2 - bm, Math.PI), sw, bh * 2.2, bh, o.rail); }
    if (o.rail) railRect(M, bh, w / 2 + bm - .3, d / 2 + bm - .3, sw / 2 + .3, (o.gate || o.backStair) ? sw / 2 + .3 : 0);
  }
  const Mf = mul(M, 0, bh, 0);
  const c = (nbx - 1) / 2, cw = o.cbay ?? 1.3, unit = w / (nbx - 1 + cw), xs = [-w / 2];
  for (let i = 0; i < nbx; i++) xs.push(xs[i] + (i === c ? cw : 1) * unit);
  const zs = []; for (let j = 0; j <= nbz; j++) zs.push(d / 2 - j * d / nbz);
  const cr = o.cr ?? Math.max(.2, Math.min(.55, hc * .045)), g = o.gallery ? 1 : 0, fr = o.porch ? 1 : g, br = nbz - g;
  for (let i = 0; i <= nbx; i++) for (let j = 0; j <= nbz; j++) {
    const gold = o.gold && (i === c || i === c + 1) && j > fr && j < br;
    push(gold ? 'gold' : 'col', cyl(gold ? cr * 1.05 : cr, hc), mul(Mf, xs[i], 0, zs[j]));
  }
  const xL = xs[g], xR = xs[nbx - g], zf = zs[fr], zb = zs[br], th = .45, open = o.open ?? 1;
  const panel = (i, z) => { const bw = xs[i + 1] - xs[i], xm = (xs[i] + xs[i + 1]) / 2; if (Math.abs(i - c) <= open) push('lattice', box(bw, hc * .2, .25, true), mul(Mf, xm, hc * .8, z)); else push('lattice', box(bw, hc, .25, true), mul(Mf, xm, 0, z)); };
  if (o.gate) {
    const zm = zs[Math.round(nbz / 2)]; for (let i = 0; i < nbx; i++) panel(i, zm);
    for (const xx of [xs[0], xs[nbx]]) push('red', box(th, hc, d), mul(Mf, xx, 0, 0));
  } else {
    for (let i = g; i < nbx - g; i++) panel(i, zf);
    if (o.backDoor) { push('red', box(xs[c] - xL, hc, th), mul(Mf, (xL + xs[c]) / 2, 0, zb)); push('red', box(xR - xs[c + 1], hc, th), mul(Mf, (xR + xs[c + 1]) / 2, 0, zb)); push('lattice', box(xs[c + 1] - xs[c], hc * .2, .25, true), mul(Mf, 0, hc * .8, zb)); }
    else push('red', box(xR - xL, hc, th), mul(Mf, (xL + xR) / 2, 0, zb));
    for (const xx of [xL, xR]) push('red', box(th, hc, zf - zb), mul(Mf, xx, 0, (zf + zb) / 2));
  }
  const band = o.band ?? Math.max(.6, hc * .13);
  for (const s of [1, -1]) { push('caihua', box(w + .9, band, .9, true), mul(Mf, 0, hc, s * d / 2)); push('caihua', box(.9, band, d - .9, true), mul(Mf, s * w / 2, hc, 0)); }
  push('ceiling', box(w - .2, .12, d - .2), mul(Mf, 0, hc + band - .15, 0), 'roof');
  push('floor', box(w + .6, .06, d + .6), Mf);
  const top = roofs(Mf, hc + band, w, d, { ix: Math.min(unit, d / nbz) * .75, ...o, hc });
  let inside = null;
  if (o.throne || o.interior) {
    const s = o.ts || 1, zc = zb + Math.min((zf - zb) * .36, 6 * s) + 1, Mt = mul(Mf, 0, 0, zc);
    if (o.throne) {
      push('wood', box(7 * s, .45 * s, 5.6 * s), Mt); push('wood', box(6.2 * s, .9 * s, 4.8 * s), Mt); push('gold', box(5.4 * s, 1.3 * s, 4 * s), Mt);
      stairs(mul(Mt, 0, 0, 2 * s), 1.8 * s, 1.6 * s, 1.3 * s, false, 'wood');
      for (const sx of [1, -1]) stairs(mul(Mt, sx * 2.7 * s, 0, 0, sx * Math.PI / 2), 1.4 * s, 1.4 * s, 1.3 * s, false, 'wood');
      const ty = 1.3 * s;
      push('gold', box(1.7 * s, .55 * s, 1.1 * s), mul(Mt, 0, ty, -.2 * s)); push('yellow', box(1.45 * s, .12 * s, .9 * s), mul(Mt, 0, ty + .55 * s, -.2 * s));
      push('gold', box(1.9 * s, 1.55 * s, .18 * s), mul(Mt, 0, ty, -.78 * s));
      for (const sx of [1, -1]) push('gold', box(.15 * s, 1 * s, 1.1 * s), mul(Mt, sx * .88 * s, ty, -.2 * s));
      push('screen', box(4.8 * s, 3.4 * s, .25 * s), mul(Mt, 0, ty, -1.6 * s));
      for (const sx of [1, -1]) push('screen', box(1.3 * s, 3 * s, .25 * s), mul(Mt, sx * 2.6 * s, ty, -1.3 * s, sx * -.5));
      for (const sx of [1, -1]) for (const dz of [1.2, 3.6]) { push('bronze', cyl(.38 * s, 1.1 * s), mul(Mt, sx * 3.9 * s, 0, 2.2 * s + dz * s)); push('gold', cyl(.2 * s, .5 * s), mul(Mt, sx * 3.9 * s, 1.1 * s, 2.2 * s + dz * s)); }
      if (o.plaque) push('plq:' + o.plaque, new THREE.PlaneGeometry((o.plaque.length * .95 + .7) * 1.25 * s, 1.75 * s), mul(Mt, 0, Math.min(hc - 1.2 * s, ty + 3.4 * s + 1.5 * s), -1.42 * s));
    }
    const zt = Math.min(zc + 3.5 * s, zf - 3.5), eye = Math.min(hc * .42, 4.2), R = Math.max(2.5, Math.min(zf - zt - .8, 12));
    inside = { t: new THREE.Vector3(0, eye, zt).applyMatrix4(Mf), c: new THREE.Vector3(0, eye * .8, zt + R).applyMatrix4(Mf), R };
  }
  if (!o.noReg) reg({ ...o, w: w + 2 * bm, d: d + 2 * bm, y0, h: bh + top, inside });
  return { M, Mf, top: bh + top, inside };
}

/* ---------- simple building ---------- */
function sb(o) {
  const { x, n, w, d } = o, h = o.h ?? 4, y0 = o.y || 0, bh = o.base ?? .5, M = T(x, y0, -n, (o.rot || 0) * DEG);
  if (bh > 0) push('stone', box(w + 1.4, bh, d + 1.4), M);
  const Mf = mul(M, 0, bh, 0);
  if (o.pav) { const r = Math.max(.15, h * .05); for (const sx of [1, -1]) for (const sz of [1, -1]) push('col', cyl(r, h, 6), mul(Mf, sx * (w / 2 - r), 0, sz * (d / 2 - r))); }
  else { push(o.wall || 'red', box(w, h, d), Mf); if (!o.plain) { push('lattice', box(w * .88, h * .86, .14, true), mul(Mf, 0, 0, d / 2)); if (o.both) push('lattice', box(w * .88, h * .86, .14, true), mul(Mf, 0, 0, -d / 2)); } }
  const band = h * .13; push('caihua', box(w + .3, band, d + .3, true), mul(Mf, 0, h, 0), 'roof');
  const top = roofs(Mf, h + band, w, d, { type: 'gable', ...o, hc: h });
  if (o.name) reg({ ...o, w: w + 1.4, d: d + 1.4, y0, h: bh + top });
  return bh + top;
}
function wallLine(x0, n0, x1, n1, h = 4.5, t = .7, m = 'wallRed', cap = 'ridgeY') {
  const len = Math.hypot(x1 - x0, n1 - n0), hz = Math.abs(x1 - x0) > Math.abs(n1 - n0), M = T((x0 + x1) / 2, 0, -(n0 + n1) / 2);
  push(m, hz ? box(len + t, h, t) : box(t, h, len + t), M); push(cap, hz ? box(len + t, .35, t + .5) : box(t + .5, .35, len + t), mul(M, 0, h, 0));
}
function rectWall(x0, n0, x1, n1, h, t, m, c) { wallLine(x0, n0, x1, n0, h, t, m, c); wallLine(x0, n1, x1, n1, h, t, m, c); wallLine(x0, n0, x0, n1, h, t, m, c); wallLine(x1, n0, x1, n1, h, t, m, c); }
function court(cx, cn, name, info, o = {}) {
  const w = o.w || 46, dn = o.dn || 50, m = o.mat;
  rectWall(cx - w / 2, cn - dn / 2, cx + w / 2, cn + dn / 2, 4);
  sb({ x: cx, n: cn - dn / 2, w: 7, d: 4, h: 3.6, type: 'xie', both: 1, mat: m });
  sb({ x: cx, n: cn - 3, w: 26, d: 11, h: 5.2, type: 'xie', name, info, rank: 2, kind: o.kind || '内廷 · 后妃寝宫', mat: m, detail: 1 });
  sb({ x: cx, n: cn + dn / 2 - 7, w: 26, d: 9, h: 4.4, mat: m });
  for (const s of [1, -1]) { sb({ x: cx + s * (w / 2 - 5.5), n: cn - 5, w: 13, d: 6.5, h: 3.7, rot: -s * 90, mat: m }); sb({ x: cx + s * (w / 2 - 5.5), n: cn + 13, w: 11, d: 6, h: 3.4, rot: -s * 90, mat: m }); }
}
function gateTower(o) {
  const M = T(o.x, 0, -o.n, (o.rot || 0) * DEG);
  push(o.wallMat || 'wallRed', box(o.pw, o.ph, o.pd), M); push('stone', box(o.pw + .6, 1.4, o.pd + .6), M);
  for (const f of o.gates || [0, -.27, .27]) for (const s of [1, -1]) push('dark', box(f ? 4.4 : 5.4, f ? 6.2 : 7.2, .6), mul(M, f * o.pw, 0, s * (o.pd / 2 + .08)));
  const r = hall({ x: o.x, n: o.n, rot: o.rot, y: o.ph, w: o.tw, d: o.td, bx: o.bx || 7, bz: 3, hc: o.hc || 7, dbl: 1, eaves: o.eaves, type: o.type || 'hip', mat: o.mat, rh: o.rh, base: .8, bm: 2.2, gallery: 1, nostair: 1, noReg: 1, detail: 1, sign: 1, rail: 1 });
  reg({ ...o, w: o.pw, d: o.pd, y0: 0, h: o.ph + r.top });
}
function cornerTower(x, n, name) {
  const M = T(x, 10, -n); push('marble', box(17, 1, 17), M); railRect(M, 1, 8.2, 8.2);
  push('lattice', box(9, 5.5, 9, true), mul(M, 0, 1, 0));
  for (const r of [0, 90, 180, 270]) { const Mr = mul(M, 0, 1, 0, r * DEG); push('lattice', box(6, 4.6, 3.4, true), mul(Mr, 0, 0, 5.6)); addRoof(mul(Mr, 0, 0, 5.4, Math.PI / 2), 4.9, 3.6, 4.4, 'xie', 2.3, { detail: 1, rs: .3 }); }
  const sk = (y, a, b, h) => push('tileY', roofGeo(a, a, b, b, h, { ns: 4, nt: 3 }).roof, mul(M, 0, y, 0), 'roof');
  sk(6.5, 7.4, 4.4, 2.2); push('lattice', box(8.4, 3, 8.4, true), mul(M, 0, 7.8, 0), 'roof');
  sk(10.6, 6.3, 3.6, 2); push('caihua', box(6.6, 2.8, 6.6, true), mul(M, 0, 11.8, 0), 'roof');
  addRoof(M, 14.4, 5.2, 3.9, 'xie', 3.3, { detail: 1, rs: .35 }); addRoof(mul(M, 0, 0, 0, Math.PI / 2), 14.4, 5.2, 3.9, 'xie', 3.3, { detail: 1, rs: .35 });
  push('gold', new THREE.SphereGeometry(.75, 10, 8), mul(M, 0, 18.4, 0), 'roof'); push('gold', cyl(.35, 1), mul(M, 0, 17.4, 0), 'roof');
  reg({ name, x, n, w: 17, d: 17, y0: 10, h: 19, rank: 2, kind: '城防 · 角楼', dims: '通高约 27.5 m（含城墙）', info: '紫禁城四隅各一座。三重檐、十字脊、四面亮山，民间称“九梁十八柱七十二条脊”，是故宫最精巧的木构之一。' });
}

/* ================= LAYOUT (x = east, n = north, metres; origin = palace centre) ================= */
const HW = 376.5, HN = 480.5, TER = 8.13;
function terraceOutline(s) {
  const P = 42 - s, A = 65 - s, W = 55 - s, S0 = -150 + s, S1 = -128 + s, W0 = -48 - s, W1 = 2 + s, N0 = 82 - s;
  return [[-P, S0], [P, S0], [P, S1], [A, S1], [A, W0], [W, W0], [W, W1], [A, W1], [A, N0], [-A, N0], [-A, W1], [-W, W1], [-W, W0], [-A, W0], [-A, S1], [-P, S1]];
}
const riverN = x => -402 + 30 * (x / 104) ** 2;

function buildAll() {
  /* ground, moat, walls */
  push('water', box(1500, .5, 1700), T(0, -2.2, 0));
  push('paving', box(2 * (HW + 20), 3, 2 * (HN + 20)), T(0, -3, 0));
  const MO = 52, ox = HW + 20 + MO, on = HN + 20 + MO, F = 1400;
  const XF = 3600, NN = 3700, NS = 5900;
  push('city', box(2 * XF, 3, NN - on), T(0, -3, -(on + (NN - on) / 2))); push('city', box(2 * XF, 3, NS - on), T(0, -3, on + (NS - on) / 2));
  push('city', box(XF - ox, 3, 2 * on), T(ox + (XF - ox) / 2, -3, 0)); push('city', box(XF - ox, 3, 2 * on), T(-ox - (XF - ox) / 2, -3, 0));
  push('paving', box(200, 3, MO + 100), T(0, -3, HN + 20 + (MO + 100) / 2 - 1)); // Wumen plaza across the moat line
  push('stone', box(22, 3, MO + 2), T(0, -3, -(HN + 20 + MO / 2)));              // bridge to Jingshan
  for (const s of [1, -1]) push('stone', box(MO + 2, 3, 20), T(s * (HW + 20 + MO / 2), -3, 325));
  rectWall(-HW, -HN, HW, HN, 10, 8);
  // crenellated parapet hint
  for (const s of [1, -1]) { push('stone', box(2 * HW + 8, .9, .5), T(0, 10.3, s * (HN + 3.7))); push('stone', box(.5, .9, 2 * HN + 8), T(s * (HW + 3.7), 10.3, 0)); }

  /* ---- 午门 ---- */
  push('wallRed', prism([[-63.5, -452], [63.5, -452], [63.5, -545], [38.5, -545], [38.5, -487], [-38.5, -487], [-38.5, -545], [-63.5, -545]], 12));
  for (const dx of [0, -13, 13]) push('dark', box(dx ? 4.6 : 5.6, dx ? 7 : 8, .6), T(dx, 0, 487.1));
  for (const dx of [0, -13, 13, -27, 27]) push('dark', box(Math.abs(dx) > 20 ? 4 : 5, Math.abs(dx) > 20 ? 6 : 7.5, .6), T(dx, 0, 451.9));
  for (const s of [1, -1]) push('dark', box(.6, 6, 4), T(s * 38.4, 0, 493));
  const wm = hall({ x: 0, n: -469.5, y: 12, w: 56, d: 19, bx: 9, bz: 3, hc: 9.2, dbl: 1, type: 'hip', base: 1, bm: 2.5, gallery: 1, nostair: 1, noReg: 1, detail: 1, sign: 1, rh: 8.2, interior: 1 });
  for (const s of [1, -1]) {
    for (const nn of [-469.5, -537]) hall({ x: s * 51, n: nn, y: 12, w: 10, d: 10, bx: 3, bz: 3, hc: 6.2, dbl: 1, type: 'pyr', base: .8, bm: 1.2, nostair: 1, noReg: 1, detail: 1, cbay: 1 });
    sb({ x: s * 51, n: -503, y: 12, w: 52, d: 8.5, h: 5.2, rot: -s * 90, type: 'hip', both: 1, detail: 1 });
    sb({ x: s * 37.5, n: -469.5, y: 12, w: 13, d: 8.5, h: 5.2, type: 'gable', both: 1 });
  }
  reg({ name: '午门', x: 0, n: -498, w: 127, d: 93, y0: 0, h: 38, rank: 1, kind: '宫城正门 · 阙门', dims: '城台高 12 m · 通高 37.95 m · 正楼面阔 9 间', inside: wm.inside,
    info: '紫禁城正门，平面呈“凹”字形。城台上正楼为重檐庑殿顶，两翼雁翅楼各十三间，四隅各有重檐攒尖阙亭，合称“五凤楼”。中门为皇帝专用。' });

  /* ---- 内金水河 + 五桥 ---- */
  { const pos = [], uv = [], N = 26; let pl = null, pr = null;
    for (let i = 0; i <= N; i++) { const x = -104 + 208 * i / N, n = riverN(x), sl = 60 * x / (104 * 104), k = Math.hypot(1, sl), nx = -sl / k * 4.2, nn = 1 / k * 4.2;
      const a = [x - nx, .3, -(n - nn)], b = [x + nx, .3, -(n + nn)];
      if (pl) { pos.push(...pl, ...a, ...b, ...pl, ...b, ...pr); uv.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
        seg('marble', new THREE.Vector3(...pl).setY(.3), new THREE.Vector3(...a).setY(.3), .9, new THREE.Matrix4(), 'base'); seg('marble', new THREE.Vector3(...pr).setY(.3), new THREE.Vector3(...b).setY(.3), .9, new THREE.Matrix4(), 'base'); }
      pl = a; pr = b; }
    push('water', tri(pos, uv));
    for (const [bx, bw] of [[0, 6], [-10.5, 4.8], [10.5, 4.8], [-21, 4.4], [21, 4.4]]) { const M = T(bx, 0, -riverN(bx)); push('marble', box(bw, 1.1, 15), M); push('stairs', wedge(bw, 4, 1.1), mul(M, 0, 0, 7.5)); push('stairs', wedge(bw, 4, 1.1), mul(M, 0, 0, -7.5, Math.PI)); railPoly(M, 1.1, [[bw / 2 - .1, -7.5], [bw / 2 - .1, 7.5]]); railPoly(M, 1.1, [[-bw / 2 + .1, -7.5], [-bw / 2 + .1, 7.5]]); }
    reg({ name: '内金水桥', x: 0, n: -400, w: 50, d: 18, y0: 0, h: 3, rank: 2, kind: '外朝 · 桥梁', dims: '五座汉白玉拱桥', info: '内金水河呈弓形横贯太和门广场，其上五座汉白玉石桥，正中御路桥为皇帝专用。' });
    // schematic canal continuation (west source / east outlet)
    push('water', box(230, .2, 5), T(-219, .12, 372)); push('water', box(5, .2, 800), T(-334, .12, -28)); push('water', box(220, .2, 5), T(214, .12, 372)); push('water', box(5, .2, 80), T(324, .12, 412));
  }

  /* ---- 太和门广场 ---- */
  hall({ name: '太和门', x: 0, n: -300, w: 50, d: 18, bx: 9, bz: 4, hc: 8.2, dbl: 1, type: 'xie', base: 3.44, bm: 4, gate: 1, rail: 1, detail: 1, sign: 1, rank: 1, kind: '外朝 · 宫门', dims: '面阔 9 间 · 进深 3 间 · 高 23.8 m', interior: 1,
    info: '外朝正门，紫禁城内最大的宫门，重檐歇山顶，坐落于汉白玉须弥座上。明代皇帝曾在此“御门听政”。现存建筑为清光绪十五年（1889）重建。' });
  for (const s of [1, -1]) {
    sb({ name: s > 0 ? '昭德门' : '贞度门', x: s * 62, n: -300, w: 22, d: 10, h: 5.5, type: 'xie', both: 1, base: 1.5, kind: '外朝 · 侧门' });
    sb({ x: s * 88, n: -300, w: 28, d: 8, h: 4.6, both: 1 });
    sb({ x: s * 105, n: -355, w: 96, d: 9, h: 4.8, rot: -s * 90, base: 1.2 }); sb({ x: s * 105, n: -436, w: 30, d: 9, h: 4.8, rot: -s * 90, base: 1.2 });
    sb({ name: s > 0 ? '协和门' : '熙和门', x: s * 105, n: -412, w: 22, d: 11, h: 5.6, rot: -s * 90, type: 'xie', both: 1, base: 1.5, kind: '外朝 · 侧门', detail: 1 });
    /* 太和殿广场两厢 */
    sb({ name: s > 0 ? '体仁阁' : '弘义阁', x: s * 105, n: -190, w: 44, d: 15, h: 6, rot: -s * 90, type: 'hip', dbl: 1, base: 2.2, detail: 1, rank: 2, kind: '外朝 · 楼阁', dims: '面阔 9 间 · 高约 25 m', info: s > 0 ? '太和殿广场东侧二层楼阁，明称文楼。清康熙年间曾在此举行博学鸿词科考试，后作缎库。' : '太和殿广场西侧二层楼阁，明称武楼，清代为内务府银库。' });
    sb({ x: s * 105, n: -250, w: 62, d: 9, h: 4.8, rot: -s * 90, base: 1.2 }); sb({ x: s * 105, n: -122, w: 80, d: 9, h: 4.8, rot: -s * 90, base: 1.2 });
    sb({ x: s * 105, n: 20, w: 150, d: 9, h: 4.8, rot: -s * 90, base: 1.2 });
    sb({ x: s * 105, n: -292, w: 14, d: 14, h: 6, type: 'xie', dbl: 1, base: 1.5 }); sb({ x: s * 105, n: 100, w: 14, d: 14, h: 6, type: 'xie', dbl: 1, base: 1.5 });
    sb({ name: s > 0 ? '中左门' : '中右门', x: s * 82, n: -80, w: 16, d: 9, h: 5, type: 'xie', both: 1, base: 1.2 }); wallLine(s * 65, -80, s * 74, -80, 6); wallLine(s * 90, -80, s * 100, -80, 6);
    sb({ name: s > 0 ? '后左门' : '后右门', x: s * 82, n: 42, w: 16, d: 9, h: 5, type: 'xie', both: 1, base: 1.2 }); wallLine(s * 65, 42, s * 74, 42, 6); wallLine(s * 90, 42, s * 100, 42, 6);
    sb({ x: s * 55, n: 100, w: 84, d: 8, h: 4.6, both: 1 });
  }

  /* ---- 三台 ---- */
  for (let i = 0; i < 3; i++) { const o = terraceOutline(i * 4.2), y = TER * (i + 1) / 3; push('marble', prism(o, y)); const r = terraceOutline(i * 4.2 + .35).map(p => [p[0], -p[1]]); r.push(r[0]); railPoly(T(0, 0, 0), y, r); }
  for (const dx of [0, -15, 15]) stairs(T(dx, 0, 141.4), dx ? 5 : 7, 26, TER, !dx);
  for (const dx of [0, -15, 15]) stairs(T(dx, 0, -73.4, Math.PI), dx ? 5 : 7, 26, TER, !dx);
  for (const s of [1, -1]) for (const nn of [-88, 38]) stairs(T(s * 56.4, 0, -nn, s * Math.PI / 2), 6, 24, TER);
  reg({ name: '三台', x: 0, n: -34, w: 130, d: 232, y0: 0, h: TER, kind: '外朝 · 台基', dims: '高 8.13 m · 三层汉白玉须弥座 · “工”字形', info: '三大殿共同的台基，三层重叠，周围环以栏板、望柱与一千余个螭首（排水龙头），雨天可见“千龙吐水”。' });

  hall({ name: '太和殿', x: 0, n: -88, y: TER, w: 60, d: 33.3, bx: 11, bz: 5, hc: 11.4, band: 1.4, hs: 3, hu: 2.3, rh: 8.6, cr: .53, dbl: 1, type: 'hip', base: .9, bm: 2, porch: 1, gold: 1, throne: 1, ts: 1.25, plaque: '建极绥猷', detail: 1, sign: 1, rank: 1, backDoor: 1, backStair: 1,
    kind: '外朝 · 三大殿之首', dims: '面阔 11 间 64 m · 进深 5 间 37 m · 高 26.92 m（连台基 35.05 m）· 72 柱',
    info: '俗称“金銮殿”，中国现存最大的木构大殿，重檐庑殿顶为最高等级。皇帝登基、大婚、册立皇后、命将出征及元旦、冬至、万寿三大节在此行礼。殿内六根蟠龙金柱环绕髹金漆云龙宝座，上悬乾隆御笔“建极绥猷”匾。现存建筑为康熙三十四年（1695）重建。' });
  hall({ name: '中和殿', x: 0, n: -22, y: TER, w: 21, d: 21, bx: 5, bz: 5, hc: 7.2, type: 'pyr', base: .8, bm: 1.6, gallery: 1, throne: 1, ts: .8, plaque: '允执厥中', detail: 1, rank: 1, rh: 9.5, cbay: 1.2, backDoor: 1, backStair: 1,
    kind: '外朝 · 三大殿', dims: '平面正方 · 边长 24.15 m · 高约 19 m', info: '单檐四角攒尖顶，鎏金宝顶。皇帝赴太和殿大典前在此小憩、接受执事官员朝拜，也在此审阅祭文。殿内悬乾隆御笔“允执厥中”匾。' });
  hall({ name: '保和殿', x: 0, n: 38, y: TER, w: 46, d: 21.5, bx: 9, bz: 5, hc: 9.2, dbl: 1, type: 'xie', base: .9, bm: 2, porch: 1, throne: 1, ts: 1.05, plaque: '皇建有极', detail: 1, sign: 1, rank: 1, backDoor: 1, backStair: 1,
    kind: '外朝 · 三大殿', dims: '面阔 9 间 49.68 m · 进深 5 间 24.97 m · 高约 21.6 m', info: '重檐歇山顶。清代每年除夕、元宵在此宴请外藩王公；乾隆后期起殿试在此举行。殿后的云龙大石雕长 16.57 米、重二百余吨，是宫中最大的石雕。' });

  /* ---- 乾清门 & 后三宫 ---- */
  hall({ name: '乾清门', x: 0, n: 124, w: 25, d: 11, bx: 5, bz: 2, hc: 6, type: 'xie', base: 1.5, bm: 2.5, gate: 1, rail: 1, detail: 1, rank: 1, kind: '内廷 · 正门', dims: '面阔 5 间 · 高约 16 m', interior: 1,
    info: '内廷正门，外朝与内廷的分界。清代康熙等帝在此“御门听政”。门前有鎏金铜狮一对，两侧为八字琉璃影壁。' });
  for (const s of [1, -1]) { wallLine(s * 16, 124, s * 59, 124, 6); sb({ name: s > 0 ? '景运门' : '隆宗门', x: s * 100, n: 104, w: 18, d: 9, h: 5, rot: -s * 90, type: 'xie', both: 1, base: 1.2, kind: '内廷 · 侧门' }); }
  sb({ name: '军机处', x: -78, n: 112, w: 28, d: 6, h: 3.4, kind: '内廷 · 值房', info: '清雍正年间设立，辅佐皇帝处理军政要务的中枢机构，值房紧邻隆宗门与养心殿，建筑极为朴素。' });
  wallLine(-59, 124, -59, 338, 5); wallLine(59, 124, 59, 338, 5); wallLine(-59, 338, 59, 338, 5);
  for (const s of [1, -1]) { sb({ x: s * 55, n: 185, w: 100, d: 7, h: 4.2, rot: -s * 90 }); sb({ x: s * 55, n: 290, w: 80, d: 7, h: 4.2, rot: -s * 90 }); sb({ name: s > 0 ? '日精门' : '月华门', x: s * 55, n: 241, w: 12, d: 8, h: 4.6, rot: -s * 90, type: 'xie', both: 1 }); }
  push('marble', prism([[-5, 130], [5, 130], [5, 152], [22, 152], [22, 163], [32, 163], [32, 222], [14, 222], [14, 252], [31, 252], [31, 300], [-31, 300], [-31, 252], [-14, 252], [-14, 222], [-32, 222], [-32, 163], [-22, 163], [-22, 152], [-5, 152]], 2.4));
  railPoly(T(0, 0, 0), 2.4, [[5, -130], [5, -152], [22, -152], [22, -163], [32, -163], [32, -222], [14, -222], [14, -252], [31, -252], [31, -300], [4, -300]]);
  railPoly(T(0, 0, 0), 2.4, [[-5, -130], [-5, -152], [-22, -152], [-22, -163], [-32, -163], [-32, -222], [-14, -222], [-14, -252], [-31, -252], [-31, -300], [-4, -300]]);
  stairs(T(0, 0, -130.01), 10, 2, 2.4); stairs(T(0, 0, -300, Math.PI), 8, 6, 2.4);
  hall({ name: '乾清宫', x: 0, n: 190, y: 2.4, w: 40, d: 20, bx: 9, bz: 5, hc: 8.6, dbl: 1, type: 'hip', base: .7, bm: 2, porch: 1, throne: 1, plaque: '正大光明', detail: 1, sign: 1, rank: 1, gold: 1, backDoor: 1, nostair: 1,
    kind: '内廷 · 后三宫之首', dims: '面阔 9 间 · 进深 5 间 · 高约 20 m', info: '明代及清初皇帝的寝宫，雍正移居养心殿后改为听政、召见、筵宴之所。宝座上方悬顺治御笔“正大光明”匾，清代秘密建储的匣子即藏于匾后。' });
  for (const s of [1, -1]) sb({ name: s > 0 ? '昭仁殿' : '弘德殿', x: s * 41, n: 190, w: 13, d: 9, h: 4.4, type: 'xie', kind: '内廷 · 配殿' });
  hall({ name: '交泰殿', x: 0, n: 237, y: 2.4, w: 15, d: 15, bx: 3, bz: 3, hc: 6, type: 'pyr', base: .6, bm: 1.4, throne: 1, ts: .7, plaque: '无为', detail: 1, rank: 1, cbay: 1.25, rh: 7.2, backDoor: 1, nostair: 1,
    kind: '内廷 · 后三宫', dims: '平面正方 · 面阔进深各 3 间', info: '取“天地交泰”之意，形制似中和殿而略小。皇后千秋节在此受贺；乾隆十三年起清代二十五方宝玺收存于此。殿内悬康熙御笔“无为”匾，并陈设铜壶滴漏与大自鸣钟。' });
  hall({ name: '坤宁宫', x: 0, n: 279, y: 2.4, w: 38, d: 18, bx: 9, bz: 4, hc: 8, dbl: 1, type: 'hip', base: .7, bm: 2, porch: 1, interior: 1, detail: 1, sign: 1, rank: 1, backDoor: 1, nostair: 1,
    kind: '内廷 · 后三宫', dims: '面阔 9 间 · 进深 3 间 · 重檐庑殿顶', info: '明代皇后寝宫。清代按满族习俗改建，西侧为萨满祭神之所，东暖阁为皇帝大婚洞房，康熙、同治、光绪均在此成婚。' });
  sb({ name: '坤宁门', x: 0, n: 336, w: 14, d: 8, h: 4.6, type: 'xie', both: 1, kind: '内廷 · 宫门' });

  /* ---- 御花园 ---- */
  push('grass', box(140, .25, 86), T(0, 0, -386)); rectWall(-72, 342, 72, 432, 4.5);
  hall({ name: '钦安殿', x: 0, n: 392, w: 20, d: 12, bx: 5, bz: 3, hc: 6, dbl: 1, type: 'hip', base: 1.6, bm: 3, rail: 1, detail: 1, rank: 2, interior: 1, kind: '御花园 · 道教殿宇', dims: '面阔 5 间 · 重檐盝顶', info: '御花园的中心建筑，供奉玄天上帝（真武大帝）。明代原构，屋顶为少见的重檐盝顶，上安鎏金宝顶。' });
  rectWall(-20, 376, 20, 408, 3.6); sb({ name: '天一门', x: 0, n: 376, w: 7, d: 3, h: 3.8, type: 'xie', both: 1, wall: 'stone' });
  for (const s of [1, -1]) {
    hall({ name: s > 0 ? '万春亭' : '千秋亭', x: s * 47, n: 386, w: 8, d: 8, bx: 3, bz: 3, hc: 4.2, dbl: 1, type: 'pyr', base: .9, bm: 1.8, rail: 1, detail: 1, cbay: 1, rank: 2, kind: '御花园 · 亭', info: '四出抱厦、上圆下方的重檐亭，取“天圆地方”之意，万春、千秋东西相对，象征春与秋。' });
    sb({ name: s > 0 ? '浮碧亭' : '澄瑞亭', x: s * 47, n: 414, w: 8, d: 8, h: 3.6, type: 'pyr', pav: 1, base: 1, kind: '御花园 · 亭' });
    sb({ name: s > 0 ? '绛雪轩' : '养性斋', x: s * 58, n: 356, w: 20, d: 8, h: 4, rot: -s * 90, type: 'xie', dbl: s < 0, kind: '御花园 · 轩斋' });
    sb({ x: s * 62, n: 420, w: 14, d: 7, h: 3.6, rot: -s * 90 });
  }
  for (let i = 0; i < 14; i++) { const r = 3 + rnd() * 5; const g = new THREE.SphereGeometry(r, 6, 5); push('rock', g, new THREE.Matrix4().makeScale(1, .8 + rnd() * .9, 1).setPosition(28 + (rnd() - .5) * 14, 0, -424 + (rnd() - .5) * 8)); }
  sb({ x: 28, n: 424, y: 9, w: 5, d: 5, h: 3, type: 'pyr', pav: 1, base: .5 });
  reg({ name: '堆秀山 · 御景亭', x: 28, n: 424, w: 22, d: 14, y0: 0, h: 16, kind: '御花园 · 假山', dims: '高约 10 m', info: '太湖石叠成的假山，山顶御景亭为帝后重阳登高之处，可俯瞰宫苑、远眺景山。' });
  sb({ name: '延晖阁', x: -28, n: 425, w: 16, d: 8, h: 4.4, type: 'xie', dbl: 1, kind: '御花园 · 楼阁' });
  reg({ name: '御花园', x: 0, n: 387, w: 140, d: 88, y0: 0, h: 2, rank: 1, pickLow: 1, kind: '内廷 · 宫苑', dims: '东西约 135 m · 南北约 89 m · 约 12 000 m²', info: '明永乐年间始建，位于中轴线北端。以钦安殿为中心，亭台楼阁二十余座对称布置，间以古柏、藤萝、奇石与石子路画。' });
  sb({ name: '顺贞门', x: 0, n: 441, w: 18, d: 6, h: 5, type: 'xie', both: 1, wall: 'wallRed', kind: '内廷 · 宫门' }); wallLine(-150, 441, -10, 441, 6); wallLine(10, 441, 150, 441, 6);

  /* ---- 城门 & 角楼 ---- */
  gateTower({ name: '神武门', x: 0, n: 477, pw: 46, pd: 22, ph: 11, tw: 30, td: 12, rank: 1, kind: '宫城北门', dims: '通高约 31 m · 城楼面阔 5 间带围廊', info: '紫禁城北门，明称玄武门，清避康熙帝讳改“神武门”。城楼上设钟鼓，用以起更报时；清代选秀女由此门出入。今为故宫博物院出口，正对景山。' });
  gateTower({ name: '东华门', x: 373, n: -325, rot: 90, pw: 44, pd: 22, ph: 11, tw: 29, td: 12, rank: 2, kind: '宫城东门', dims: '通高约 28 m', info: '紫禁城东门。门钉为八路九颗共七十二枚，与其余三门九路九颗不同。清代大行皇帝、皇后梓宫由此门出。' });
  gateTower({ name: '西华门', x: -373, n: -325, rot: -90, pw: 44, pd: 22, ph: 11, tw: 29, td: 12, rank: 2, kind: '宫城西门', dims: '通高约 28 m', info: '紫禁城西门，形制与东华门相同。清代帝后去西苑、圆明园多由此门出入。' });
  cornerTower(HW - 1, HN - 1, '东北角楼'); cornerTower(-HW + 1, HN - 1, '西北角楼'); cornerTower(HW - 1, -HN + 1, '东南角楼'); cornerTower(-HW + 1, -HN + 1, '西南角楼');

  /* ---- 外朝东西路 ---- */
  rectWall(180, -332, 252, -212, 4.5);
  sb({ x: 216, n: -332, w: 16, d: 7, h: 4.4, type: 'xie', both: 1 });
  hall({ name: '文华殿', x: 216, n: -298, w: 26, d: 13, bx: 5, bz: 3, hc: 6, type: 'xie', base: 1.4, bm: 3, detail: 1, rank: 2, throne: 1, ts: .75, plaque: '文华殿', kind: '外朝东路', dims: '面阔 5 间 · 单檐歇山', info: '明代曾为太子视事之所，后为皇帝经筵（讲学）之地。殿后有文渊阁。今为故宫博物院陶瓷馆。' });
  sb({ x: 216, n: -272, w: 24, d: 10, h: 5, type: 'xie' }); sb({ x: 216, n: -285, w: 6, d: 14, h: 4 });
  for (const s of [1, -1]) sb({ x: 216 + s * 27, n: -298, w: 22, d: 8, h: 4.2, rot: -s * 90 });
  sb({ name: '文渊阁', x: 216, n: -236, w: 33, d: 14, h: 6.5, type: 'xie', dbl: 1, mat: 'tileK', base: 1.2, detail: 1, rank: 2, kind: '外朝东路 · 藏书楼', dims: '面阔 6 间 · 外观 2 层内 3 层', info: '乾隆年间仿宁波天一阁而建，专藏《四库全书》。黑琉璃瓦绿剪边，取“水克火”之意，是宫中少见的冷色调建筑。' });
  rectWall(-262, -332, -190, -240, 4.5); sb({ x: -226, n: -332, w: 16, d: 7, h: 4.4, type: 'xie', both: 1 });
  hall({ name: '武英殿', x: -226, n: -298, w: 26, d: 13, bx: 5, bz: 3, hc: 6, type: 'xie', base: 1.4, bm: 3, detail: 1, rank: 2, interior: 1, kind: '外朝西路', dims: '面阔 5 间 · 单檐歇山', info: '与文华殿东西对称。李自成曾在此称帝；清康熙起为内府修书、刻书之所，“殿本”即出于此。' });
  sb({ x: -226, n: -272, w: 24, d: 10, h: 5, type: 'xie' }); sb({ x: -226, n: -285, w: 6, d: 14, h: 4 });
  for (const s of [1, -1]) sb({ x: -226 + s * 27, n: -298, w: 22, d: 8, h: 4.2, rot: -s * 90 });
  sb({ name: '南薰殿', x: -250, n: -385, w: 18, d: 9, h: 4.4, type: 'xie', kind: '外朝西路', info: '明代遗构，清代用以收藏历代帝后圣贤画像。' });
  sb({ name: '内阁大堂', x: 165, n: -400, w: 30, d: 10, h: 4.2, kind: '外朝东路 · 衙署' }); sb({ x: 215, n: -400, w: 40, d: 9, h: 4 }); sb({ x: 165, n: -430, w: 60, d: 9, h: 4 });
  sb({ name: '箭亭', x: 160, n: -95, w: 24, d: 13, h: 5.4, type: 'xie', pav: 1, base: 1, detail: 1, kind: '外朝东路', info: '清代皇帝及子弟练习骑射之处，四面出廊、不设墙壁。' });
  for (const dx of [-30, 0, 30]) { rectWall(215 + dx - 13, -205, 215 + dx + 13, -120, 4); for (const nn of [-190, -165, -138]) sb({ x: 215 + dx, n: nn, w: 20, d: 8, h: 4.2, type: nn === -165 ? 'xie' : 'gable', mat: 'tileG' }); }
  reg({ name: '南三所', x: 215, n: -162, w: 86, d: 86, y0: 0, h: 9, rank: 2, kind: '外朝东路 · 皇子居所', info: '俗称“阿哥所”，三座并列的三进院落，为清代皇子居所。屋顶覆绿琉璃瓦，五行属木、主生长。' });
  for (const [x, n, w, d, r] of [[-250, -130, 60, 9, 0], [-250, -100, 60, 9, 0], [-300, -160, 40, 8, 90], [-215, -175, 46, 9, 0], [-290, -60, 50, 9, 0], [-170, -130, 40, 8, 90], [300, -420, 50, 9, 0], [300, -380, 50, 9, 0], [310, -120, 60, 9, 90], [300, -40, 44, 9, 0], [-300, -420, 60, 9, 0], [-150, -430, 50, 9, 0]]) sb({ x, n, w, d, h: 4, rot: r, wall: 'red' });

  /* ---- 养心殿 & 西六宫 ---- */
  rectWall(-136, 128, -70, 182, 4.5);
  hall({ name: '养心殿', x: -103, n: 152, w: 24, d: 12, bx: 3, bz: 3, hc: 5.6, type: 'xie', base: 1, bm: 2, porch: 1, throne: 1, ts: .75, plaque: '中正仁和', detail: 1, rank: 1, cbay: 1.15, backDoor: 1,
    kind: '内廷 · 皇帝寝宫', dims: '“工”字形殿 · 前殿面阔 3 间（通面阔 36 m）', info: '自雍正起，清代八位皇帝在此居住并处理日常政务，是清中后期实际的权力中心。明间悬雍正御笔“中正仁和”匾；西暖阁有“三希堂”；东暖阁为慈禧、慈安“垂帘听政”处。' });
  sb({ x: -103, n: 170, w: 24, d: 9, h: 4.6, type: 'xie' }); sb({ x: -103, n: 162, w: 6, d: 8, h: 4 });
  for (const s of [1, -1]) sb({ x: -103 + s * 25, n: 150, w: 16, d: 6, h: 3.6, rot: -s * 90 });
  const W6 = [[-98, 206, '永寿宫', '西六宫之一，离养心殿最近。明清多位妃嫔居此。'], [-98, 257, '翊坤宫', '西六宫之一。晚清与储秀宫打通成四进院，慈禧曾在此接受朝贺。'], [-98, 308, '储秀宫', '西六宫之一。慈禧入宫初期居此并生同治帝；五十寿辰时斥巨资重修，装修为六宫之冠。'],
    [-150, 206, '太极殿', '西六宫之一，明称启祥宫，清晚期与长春宫连通。'], [-150, 257, '长春宫', '西六宫之一。乾隆孝贤皇后、慈禧太后曾居此，廊下有《红楼梦》题材壁画。'], [-150, 308, '咸福宫', '西六宫之一，前殿为庑殿顶，等级高于他宫。']];
  const E6 = [[98, 206, '景仁宫', '东六宫之一，康熙帝出生于此。今为捐献文物陈列馆。'], [98, 257, '承乾宫', '东六宫之一，顺治帝宠妃董鄂氏居所。'], [98, 308, '钟粹宫', '东六宫之一，慈安太后长期居此。'],
    [150, 206, '延禧宫', '东六宫之一。屡遭火灾，宣统元年起建西洋式“水晶宫”（灵沼轩），未竣工。'], [150, 257, '永和宫', '东六宫之一，雍正生母孝恭仁皇后曾居此。'], [150, 308, '景阳宫', '东六宫之一，庑殿顶。清代改作收贮图书之所。']];
  for (const [x, n, nm, info] of [...W6, ...E6]) court(x, n, nm, info);
  for (const s of [1, -1]) for (const dx of [0, 30, 60, 90, 120]) { const x = s * (88 + dx); rectWall(x - 13, 348, x + 13, 432, 3.8); for (const nn of [362, 390, 418]) sb({ x, n: nn, w: 18, d: 7.5, h: 3.8 }); }
  reg({ name: '乾东五所', x: 148, n: 390, w: 150, d: 86, y0: 0, h: 8, kind: '内廷 · 皇子居所', info: '东六宫以北五座并列院落，明清时为皇子居所，后改作库房、如意馆等。' });
  reg({ name: '重华宫 · 乾西五所', x: -148, n: 390, w: 150, d: 86, y0: 0, h: 8, rank: 2, kind: '内廷', info: '乾隆帝为皇子时的潜邸（乾西二所），登基后升为重华宫，新年在此举行茶宴联句。' });

  /* ---- 东路：斋宫、奉先殿 ---- */
  court(98, 152, '斋宫', '雍正九年建，皇帝祭天地前在此斋戒。', { dn: 48, kind: '内廷 · 斋戒之所' });
  rectWall(128, 122, 205, 182, 4.5);
  hall({ name: '奉先殿', x: 166, n: 146, w: 34, d: 14, bx: 9, bz: 3, hc: 6.6, dbl: 1, type: 'hip', base: 1.8, bm: 3, rail: 1, detail: 1, rank: 2, interior: 1, kind: '内廷 · 家庙', dims: '面阔 9 间 · “工”字形', info: '明清皇室祭祀祖先的家庙，前殿后寝以穿堂相连。今为故宫博物院钟表馆。' });
  sb({ x: 166, n: 172, w: 34, d: 10, h: 5, type: 'xie' }); sb({ x: 166, n: 160, w: 8, d: 12, h: 4.4 });

  /* ---- 宁寿宫区（外东路） ---- */
  rectWall(232, 78, 336, 446, 6);
  push('dragon', new THREE.PlaneGeometry(29.4, 3.5), T(284, 2.6, -71.5, Math.PI)); push('stone', box(31, .9, 2), T(284, 0, -71)); push('wallRed', box(30, 4.4, .9), T(284, 0, -71)); push('tileY', box(31, .5, 2.4), T(284, 4.4, -71));
  reg({ name: '九龙壁', x: 284, n: 70, w: 31, d: 4, y0: 0, h: 5, rank: 2, kind: '宁寿宫区 · 琉璃影壁', dims: '长 29.4 m · 高 3.5 m', info: '乾隆三十七年（1772）建，270 块琉璃塑块拼成九条蟠龙。左起第三条白龙腹部有一块为木雕补配，相传为工匠急中生智之作。' });
  sb({ name: '皇极门', x: 284, n: 80, w: 22, d: 4, h: 6, type: 'xie', both: 1, wall: 'wallRed', kind: '宁寿宫区 · 宫门' });
  sb({ name: '宁寿门', x: 284, n: 122, w: 20, d: 9, h: 5, type: 'xie', both: 1, base: 1.4, kind: '宁寿宫区 · 宫门' }); wallLine(232, 122, 272, 122, 5); wallLine(296, 122, 336, 122, 5);
  push('marble', box(52, 1.8, 86), T(284, 0, -178)); railRect(T(284, 0, -178), 1.8, 25.7, 42.7, 5, 4);
  stairs(T(284, 0, -135), 9, 4, 1.8, true);
  hall({ name: '皇极殿', x: 284, n: 162, y: 1.8, w: 38, d: 18, bx: 9, bz: 4, hc: 8, dbl: 1, type: 'hip', base: .6, bm: 1.6, porch: 1, throne: 1, plaque: '仁德大隆', detail: 1, sign: 1, rank: 1, nostair: 1,
    kind: '宁寿宫区 · 正殿', dims: '面阔 9 间 · 重檐庑殿顶', info: '乾隆帝为自己归政后预建的“太上皇宫殿”正殿，仿乾清宫规制。乾隆、慈禧均曾在此受贺。今为珍宝馆的一部分。' });
  sb({ name: '宁寿宫', x: 284, n: 204, y: 1.8, w: 32, d: 14, h: 6, type: 'xie', base: .5, detail: 1, kind: '宁寿宫区', info: '皇极殿后殿，单檐歇山顶，仿坤宁宫规制，设有祭神之所。' });
  sb({ name: '养性门', x: 284, n: 240, w: 14, d: 7, h: 4.4, type: 'xie', both: 1 }); wallLine(256, 240, 277, 240, 5); wallLine(291, 240, 336, 240, 5); wallLine(256, 240, 256, 446, 5);
  sb({ name: '养性殿', x: 284, n: 262, w: 26, d: 12, h: 5.2, type: 'xie', detail: 1, kind: '宁寿宫区', info: '仿养心殿而建，为乾隆拟定的太上皇寝宫。' });
  sb({ name: '乐寿堂', x: 284, n: 305, w: 30, d: 16, h: 6, type: 'xie', detail: 1, rank: 2, kind: '宁寿宫区', info: '仿长春园淳化轩。慈禧六十寿辰后曾居此。堂内陈设“大禹治水图”玉山，重逾五吨。' });
  sb({ name: '颐和轩', x: 284, n: 345, w: 28, d: 12, h: 5.2, type: 'xie', kind: '宁寿宫区' }); sb({ name: '景祺阁', x: 284, n: 388, w: 28, d: 10, h: 5, type: 'xie', dbl: 1, kind: '宁寿宫区' });
  { const M = T(318, 0, -272); push('marble', box(20, 1.2, 20), M); let y = 1.2; for (const [w, h] of [[17, 6], [15, 5.4], [13, 5]]) { for (const sx of [1, -1]) for (const sz of [1, -1]) push('col', cyl(.3, h), mul(M, sx * (w / 2 - .4), y, sz * (w / 2 - .4))); push('lattice', box(w - 4, h, w - 4, true), mul(M, 0, y, 0)); push('caihua', box(w, .8, w, true), mul(M, 0, y + h - .8, 0)); if (w > 13) { push('tileG', roofGeo(w / 2 + 2, w / 2 + 2, w / 2 - 1.2, w / 2 - 1.2, 1.8, { ns: 4, nt: 3 }).roof, mul(M, 0, y + h, 0), 'roof'); y += h + 1; } else addRoof(M, y + h, w / 2 + 2, w / 2 + 2, 'xie', 4.2, { mat: 'tileG', detail: 1 }); }
    reg({ name: '畅音阁', x: 318, n: 272, w: 20, d: 20, y0: 0, h: 24, rank: 2, kind: '宁寿宫区 · 戏楼', dims: '三层 · 通高 20.71 m', info: '宫中最大的戏台，上中下三层称福台、禄台、寿台，设天井、地井与机关，可演神仙升降的大戏。对面阅是楼为帝后看戏之所。' }); }
  sb({ name: '阅是楼', x: 318, n: 302, w: 22, d: 9, h: 4.6, type: 'xie', dbl: 1, rot: 180, kind: '宁寿宫区' });
  push('grass', box(22, .25, 190), T(244, 0, -345));
  for (const [n, w, d, t, nm] of [[262, 12, 9, 'xie', '古华轩'], [300, 16, 9, 'xie', '遂初堂'], [345, 12, 12, 'pyr', '碧螺亭'], [396, 16, 16, 'pyr', '符望阁']]) sb({ name: nm, x: 244, n, w, d, h: nm === '符望阁' ? 6 : 4, type: t, dbl: nm === '符望阁', pav: t === 'pyr' && nm !== '符望阁', kind: '宁寿宫花园（乾隆花园）' });
  reg({ name: '乾隆花园', x: 244, n: 345, w: 24, d: 190, y0: 0, h: 2, rank: 2, pickLow: 1, kind: '宁寿宫区 · 花园', dims: '南北约 160 m · 东西约 37 m', info: '宁寿宫花园，四进院落在狭长地带中层层展开，古华轩前有“禊赏亭”流杯渠。' });

  /* ---- 外西路：慈宁宫等 ---- */
  rectWall(-232, 18, -150, 100, 5);
  sb({ name: '慈宁门', x: -191, n: 18, w: 18, d: 8, h: 4.8, type: 'xie', both: 1, base: 1.4 });
  hall({ name: '慈宁宫', x: -191, n: 56, w: 34, d: 15, bx: 7, bz: 3, hc: 7, dbl: 1, type: 'xie', base: 1.6, bm: 3, rail: 1, detail: 1, sign: 1, rank: 2, interior: 1, kind: '外西路 · 太后宫', dims: '面阔 7 间 · 重檐歇山', info: '明清皇太后、太妃的居所与受贺之处，孝庄文皇后曾长居于此。今为故宫博物院雕塑馆。' });
  sb({ name: '大佛堂', x: -191, n: 88, w: 30, d: 11, h: 5.2, type: 'xie' });
  push('grass', box(56, .25, 110), T(-191, 0, 45)); rectWall(-219, -102, -163, 10, 4);
  sb({ name: '咸若馆', x: -191, n: -8, w: 20, d: 10, h: 4.6, type: 'xie' }); sb({ name: '临溪亭', x: -191, n: -50, w: 8, d: 8, h: 3.6, type: 'pyr', pav: 1, base: 1 });
  reg({ name: '慈宁宫花园', x: -191, n: -46, w: 56, d: 110, y0: 0, h: 2, rank: 2, pickLow: 1, kind: '外西路 · 花园', info: '太后、太妃游憩礼佛的花园，布局疏朗，以咸若馆为主体，临溪亭跨池而建。' });
  court(-262, 60, '寿康宫', '乾隆为生母崇庆皇太后所建，此后为历代太后、太妃居所。', { w: 50, dn: 70, kind: '外西路 · 太后宫' });
  court(-272, 285, '寿安宫', '明称咸熙宫，乾隆时为太后祝寿改建，曾设三层大戏台。', { w: 56, dn: 80, kind: '外西路' });
  { const M = T(-212, 0, -238); rectWall(-232, 205, -192, 320, 4.5); let y = 1; push('marble', box(18, 1, 18), M);
    for (const [w, h, m] of [[15, 5, 'tileG'], [12, 4, 'tileY'], [9, 3.6, 'tileK']]) { push('lattice', box(w - 3, h, w - 3, true), mul(M, 0, y, 0)); push('tileY' === m ? 'tileY' : m, roofGeo(w / 2 + 1.6, w / 2 + 1.6, w / 2 - 1.4, w / 2 - 1.4, 1.6, { ns: 4, nt: 3 }).roof, mul(M, 0, y + h, 0), 'roof'); y += h + .9; }
    push('lattice', box(6, 3, 6, true), mul(M, 0, y, 0)); addRoof(M, y + 3, 5, 5, 'pyr', 4.2, { mat: 'tileY', detail: 1, rs: .45 });
    reg({ name: '雨花阁', x: -212, n: 238, w: 18, d: 18, y0: 0, h: 26, rank: 2, kind: '外西路 · 藏传佛教殿阁', dims: '外观 3 层 · 内 4 层', info: '乾隆年间仿西藏托林寺坛城殿而建，是宫中唯一的汉藏合璧密宗佛楼。顶层为鎏金铜瓦四角攒尖顶，四条垂脊上各有一条鎏金铜龙。' });
    sb({ x: -212, n: 270, w: 20, d: 9, h: 4.4, type: 'xie' }); sb({ name: '中正殿', x: -212, n: 300, w: 22, d: 10, h: 4.8, type: 'xie', kind: '外西路 · 佛堂' }); }
  court(-210, 372, '建福宫', '乾隆初年建，其西为建福宫花园（西花园），1923 年毁于大火，2005 年复建完成。', { w: 60, dn: 90, kind: '外西路' });
  rectWall(-290, 372, -232, 440, 4.5);
  sb({ name: '英华殿', x: -261, n: 412, w: 26, d: 12, h: 5.4, type: 'hip', base: 1.6, detail: 1, kind: '外西路 · 佛堂', info: '明代建筑，供太后、太妃礼佛。院内有万历生母李太后手植的菩提树。' });
  sb({ x: -261, n: 382, w: 12, d: 6, h: 4, type: 'xie', both: 1 });

  /* ---- 景山（宫城以北） ---- */
  push('grass', box(430, .3, 430), T(0, 0, -785)); rectWall(-215, 570, 215, 1000, 4);
  const peaks = [[0, 45, 95, 70], [-85, 36, 75, 60], [85, 36, 75, 60], [-158, 27, 65, 52], [158, 27, 65, 52]];
  for (const [px, ph, rx, rz] of peaks) { const g = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2); push('grass', g, new THREE.Matrix4().makeScale(rx, ph, rz).setPosition(px, 0, -770)); }
  hall({ name: '景山 · 万春亭', x: 0, n: 770, y: 44, w: 13, d: 13, bx: 3, bz: 3, hc: 5.4, dbl: 1, type: 'pyr', base: 1.2, bm: 2.5, gallery: 1, detail: 1, cbay: 1, rank: 1, far: 2, rail: 1, kind: '宫城以北 · 景山', dims: '山高约 45.7 m · 中轴线制高点', info: '景山为明永乐年间用开挖护城河与拆除元宫的土方堆成，是紫禁城的“镇山”与北面屏障。中峰万春亭位于北京中轴线上，是俯瞰故宫全景的最佳位置。' });
  for (const [px, ph] of [[-85, 36], [85, 36], [-158, 27], [158, 27]]) sb({ x: px, n: 770, y: ph - 1.5, w: 8, d: 8, h: 4, type: 'pyr', pav: 1, base: 1, dbl: Math.abs(px) < 100, mat: Math.abs(px) < 100 ? 'tileG' : 'tileK' });
  sb({ x: 0, n: 590, w: 30, d: 12, h: 5.5, type: 'xie', both: 1, base: 1.4 }); sb({ name: '寿皇殿', x: 0, n: 940, w: 40, d: 18, h: 7, type: 'hip', dbl: 1, base: 2, detail: 1, kind: '景山 · 祭祖殿宇' });
  buildAxis();
  return peaks;
}

/* ================= BEIJING CENTRAL AXIS beyond the palace ================= */
const bulk = [], EX = [];
const ridgeOf = m => ({ tileY: 'ridgeY', tileG: 'ridgeG', tileB: 'ridgeB' }[m] || 'ridgeK');
function grove(x0, n0, x1, n1, cnt, avoid) { for (let i = 0; i < cnt; i++) { const x = x0 + rnd() * (x1 - x0), n = n0 + rnd() * (n1 - n0); if (avoid && avoid(x, n)) continue; bulk.push([x, 0, n, 5.5 + rnd() * 3.5]); } }
function coneGeo(r0, r1, h, sg = 40, nt = 4) {
  const pos = [], uv = [], sl = Math.hypot(h, r0 - r1), R = t => r0 + (r1 - r0) * t, Y = t => h * (.45 * t + .55 * t * t);
  for (let i = 0; i < sg; i++) for (let k = 0; k < nt; k++) {
    const a0 = i / sg * Math.PI * 2, a1 = (i + 1) / sg * Math.PI * 2, t0 = k / nt, t1 = (k + 1) / nt, P = (a, t) => [Math.sin(a) * R(t), Y(t), Math.cos(a) * R(t)], um = (r0 + r1) / 2 + 2;
    const a = P(a0, t0), b = P(a1, t0), c = P(a1, t1), d = P(a0, t1);
    pos.push(...a, ...b, ...c, ...a, ...c, ...d); uv.push(a0 * um, t0 * sl, a1 * um, t0 * sl, a1 * um, t1 * sl, a0 * um, t0 * sl, a1 * um, t1 * sl, a0 * um, t1 * sl);
  }
  return tri(pos, uv);
}
function cylUV(r, h, sg = 40) { const g = new THREE.CylinderGeometry(r, r, h, sg, 1, true); g.translate(0, h / 2, 0); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * 2 * Math.PI * r); return g; }
const ringPts = (n, r) => Array.from({ length: n + 1 }, (_, i) => [Math.cos(i / n * Math.PI * 2) * r, Math.sin(i / n * Math.PI * 2) * r]);
function ringWall(M, r, h, m, cap, sg = 44, t = .9) { const p = ringPts(sg, r); for (let i = 0; i < sg; i++) { const dx = p[i + 1][0] - p[i][0], dz = p[i + 1][1] - p[i][1], len = Math.hypot(dx, dz), a = Math.atan2(-dz, dx), Mm = mul(M, (p[i][0] + p[i + 1][0]) / 2, 0, (p[i][1] + p[i + 1][1]) / 2, a); push(m, box(len + .15, h, t), Mm); push(cap, box(len + .2, .35, t + .5), mul(Mm, 0, h, 0)); } }
function roundTerrace(M, tiers, stairW, carved) {
  for (const [r, h] of tiers) { push('marble', cyl(r, h, 56), M); railPoly(M, h, ringPts(Math.max(24, Math.round(r * 1.3)), r - .35)); }
  const [rt, ht] = tiers[tiers.length - 1], run = tiers[0][0] - rt + ht * 1.6;
  for (let a = 0; a < 4; a++) stairs(mul(M, Math.sin(a * Math.PI / 2) * (rt - .2), 0, Math.cos(a * Math.PI / 2) * (rt - .2), a * Math.PI / 2), stairW, run, ht, carved && a % 2 === 0);
}
const road = (x, n, w, d, m = 'road') => push(m, box(w, .3, d), T(x, 0, -n));
const lake = (x, n, rx, rn, rot = 0) => { push('water', cyl(1, .5, 40), new THREE.Matrix4().makeRotationY(rot).multiply(new THREE.Matrix4().makeScale(rx, 1, rn)).setPosition(x, 0, -n)); EX.push([x - rx, n - rn, x + rx, n + rn]); };
function pailou(x, n, w, bays = 5) {
  const M = T(x, 0, -n), bw = w / bays;
  for (let i = 0; i <= bays; i++) { const hh = 8 + (bays / 2 - Math.abs(i - bays / 2)) * .9; push('col', box(.7, hh, .7), mul(M, -w / 2 + i * bw, 0, 0)); push('stone', box(1.3, 1.6, 1.6), mul(M, -w / 2 + i * bw, 0, 0)); }
  for (let i = 0; i < bays; i++) { const xm = -w / 2 + (i + .5) * bw, hh = 7 + (bays / 2 - Math.abs(i + .5 - bays / 2)) * 1.1; push('caihua', box(bw, 1.6, .5, true), mul(M, xm, hh - 1.4, 0)); addRoof(M.clone().multiply(T(xm, 0, 0)), hh + .2, bw / 2 + .5, 1.6, 'hip', 1.3, { mat: 'tileK', rs: .25 }); }
}

function buildAxis() {
  /* ---------- roads & water context ---------- */
  road(0, -3555, 30, 2850, 'stoneRoad');           // 中轴线南段道路（永定门内大街—前门大街）
  road(0, -1185, 3200, 55); road(0, -2040, 1600, 40); road(0, -2950, 3000, 46); road(0, -5052, 3000, 40);
  for (const s of [1, -1]) road(s * 195, -1590, 110, 760);
  road(0, 1020, 900, 26); road(0, 1830, 12, 1600, 'stoneRoad'); road(0, 1850, 3000, 40); road(0, 2590, 1800, 28); road(0, 2745, 34, 110, 'plaza');
  push('plaza', box(280, .42, 749), T(0, 0, 1587.5));
  push('paving', box(200, .36, 440), T(0, 0, 871));
  lake(-880, -790, 250, 215); lake(-850, -170, 175, 430); lake(-830, 1060, 215, 400); lake(-330, 2420, 290, 115, -.35);
  push('water', box(3000, .5, 34), T(0, 0, 5095)); push('stone', box(34, .5, 40), T(0, 0, 5095));
  EX.push([-470, -575, 470, 575], [-225, 560, 225, 1012], [-420, -1075, 420, -575], [-470, -2135, 500, -1075], [-1500, -1222, 1500, -1150], [-1500, -2064, 1500, -2016], [-1500, -2978, 1500, -2922], [-1500, 1826, 1500, 1874], [-1500, 2572, 1500, 2608],
    [140, -5010, 1870, -3310], [-1270, -5010, -140, -3970], [-60, 2600, 60, 2910], [-70, 2255, 120, 2310], [-1500, -5200, 1500, -5010]);
  // 琼华岛白塔（北海，轴线西侧地标）
  { const M = T(-740, 0, -770); push('grass', cyl(105, 1, 32), M); const g = new THREE.SphereGeometry(1, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2); push('grass', g, new THREE.Matrix4().makeScale(80, 30, 70).setPosition(-740, 0, -770));
    const W = mul(M, 0, 29, 0); push('white', box(18, 5, 18), W); push('white', cyl(7.5, 4, 20), mul(W, 0, 5, 0)); const d = new THREE.SphereGeometry(7, 20, 12); push('white', d, new THREE.Matrix4().makeScale(1, 1.1, 1).setPosition(-740, 29 + 15.5, -770));
    const sp = new THREE.CylinderGeometry(.8, 2.6, 11, 12); sp.translate(0, 5.5, 0); push('white', sp, mul(W, 0, 22, 0)); push('gold', cyl(2.2, .6, 12), mul(W, 0, 33, 0)); push('gold', new THREE.SphereGeometry(1, 8, 6), mul(W, 0, 35, 0));
    grove(-830, 690, -650, 850, 120, (x, n) => Math.hypot(x + 740, n - 770) < 14 || Math.hypot((x + 740) / 100, (n - 770) / 78) > 1);
    bulk.slice(-120).forEach(p => { p[1] = 28 * Math.sqrt(Math.max(0, 1 - ((p[0] + 740) / 80) ** 2 - ((p[2] - 770) / 70) ** 2)); });
    reg({ name: '北海白塔', x: -740, n: 770, w: 40, d: 40, y0: 28, h: 38, rank: 2, far: 1, kind: '轴线西侧 · 西苑三海', dims: '塔高 35.9 m', info: '琼华岛山顶的藏式白塔，建于清顺治八年（1651）。北海与中海、南海合称“三海”，位于中轴线西侧，此处仅作环境示意。' }); }

  /* ---------- 永定门 ---------- */
  gateTower({ name: '永定门', x: 0, n: -5000, pw: 36, pd: 14, ph: 8, tw: 20, td: 9, bx: 5, hc: 5, eaves: 3, type: 'xie', mat: 'tileK', wallMat: 'brick', gates: [0], rank: 1, far: 2, kind: '中轴线南端 · 外城正南门', dims: '城楼通高约 26 m · 面阔 5 间 · 重檐歇山三滴水',
    info: '北京外城的正南门，中轴线的南端点。始建于明嘉靖三十二年（1553），是外城七门中规制最高的一座。1957 年拆除，2004 年在原址按历史资料复建城楼，瓮城以地面标识展示。' });
  for (const s of [1, -1]) { push('brick', box(70, 7, 9), T(s * 53, 0, 5000)); push('stone', box(70, .8, .6), T(s * 53, 7, 5004.2)); }

  /* ---------- 天坛 ---------- */
  const TX = 1150;
  rectWall(150, -4990, 1850, -3330, 5, 1.2, 'wallRed', 'ridgeG'); rectWall(520, -4850, 1720, -3480, 4.5, 1, 'wallRed', 'ridgeG');
  push('grass', box(1700, .28, 1660), T(1000, 0, 4160));
  road(TX, -4085, 30, 410, 'stone'); road(650, -3990, 1000, 10, 'stone'); road(TX, -3600, 12, 240, 'stone');
  // 祈谷坛 · 祈年殿
  { const n = -3750, M = T(TX, 0, -n);
    push('stone', box(170, 1.2, 190), T(TX, 0, -(n + 5)));
    rectWall(TX - 86, n - 105, TX + 86, n + 110, 4.2, .9, 'wallRed', 'ridgeB');
    roundTerrace(mul(M, 0, 1.2, 0), [[45.5, 1.9], [40, 3.75], [34, 5.6]], 9, true);
    const F = mul(M, 0, 6.8, 0); push('marble', cyl(17.6, .7, 48), F); const G = mul(F, 0, .7, 0); push('floor', cyl(17.2, .06, 48), G);
    for (let i = 0; i < 12; i++) { const a = (i + .5) / 12 * Math.PI * 2; push('col', cyl(.45, 6.4), mul(G, Math.sin(a) * 15.6, 0, Math.cos(a) * 15.6)); push('col', cyl(.52, 12.2), mul(G, Math.sin(a) * 10.6, 0, Math.cos(a) * 10.6)); }
    for (let i = 0; i < 4; i++) { const a = Math.PI / 4 + i * Math.PI / 2; push('gold', cyl(.6, 19.2), mul(G, Math.sin(a) * 5.4, 0, Math.cos(a) * 5.4)); }
    push('latticeDS', cylUV(15.6, 6.4, 48), G); push('caihua', cylUV(15.95, 1, 48), mul(G, 0, 6.2, 0));
    push('wood', cyl(3.2, .9, 24), mul(G, 0, 0, -7.5)); push('gold', box(2.2, 2.6, .5), mul(G, 0, .9, -8));
    push('tileB', coneGeo(19.8, 12.3, 3.1), mul(G, 0, 7.2, 0), 'roof'); push('caihuaDS', cylUV(12.1, 4.6), mul(G, 0, 8.6, 0), 'roof');
    push('tileB', coneGeo(15.9, 8.8, 3.1), mul(G, 0, 13, 0), 'roof'); push('caihuaDS', cylUV(8.6, 4.6), mul(G, 0, 14.4, 0), 'roof');
    push('tileB', coneGeo(12.4, 0, 8.6, 40, 6), mul(G, 0, 18.8, 0), 'roof');
    push('gold', cyl(1.1, 1.3, 12), mul(G, 0, 27, 0), 'roof'); push('gold', new THREE.SphereGeometry(1.5, 12, 10), mul(G, 0, 29.4, 0), 'roof');
    push('gold', box(2.9, 3.4, .3), mul(G, 0, 14.6, 8.75), 'roof'); push('blue', box(2.4, 2.9, .4), mul(G, 0, 14.85, 8.78), 'roof');
    const t = new THREE.Vector3(0, 4, 2).applyMatrix4(G), c = new THREE.Vector3(0, 3.2, 11.5).applyMatrix4(G);
    reg({ name: '祈年殿', x: TX, n, w: 92, d: 92, y0: 0, h: 39, rank: 1, far: 2, inside: { t, c, R: 9.5 }, kind: '天坛 · 祈谷坛', dims: '殿高 38 m · 直径 32.7 m · 坛三层高 5.6 m（直径 91 / 80 / 68 m）· 28 柱',
      info: '明清皇帝孟春祈谷之所，三重檐圆形攒尖顶，蓝瓦象天、鎏金宝顶。全殿不用大梁长檩，由 28 根楠木柱承重：中央 4 根龙井柱象征四季，中圈 12 根金柱象征十二月，外圈 12 根檐柱象征十二时辰。现存建筑为光绪年间雷火焚毁后按原样重建。' });
    hall({ name: '祈年门', x: TX, n: n - 105, w: 24, d: 10, bx: 5, bz: 2, hc: 5.6, type: 'hip', mat: 'tileB', base: 1.6, bm: 2.5, gate: 1, rail: 1, detail: 1, kind: '天坛 · 祈谷坛' });
    sb({ name: '皇乾殿', x: TX, n: n + 135, w: 26, d: 12, h: 5.6, type: 'hip', mat: 'tileB', base: 1.8, detail: 1, kind: '天坛 · 祈谷坛', info: '祈年殿以北的神库，平日供奉“皇天上帝”及皇帝列祖神牌。' }); rectWall(TX - 40, n + 112, TX + 40, n + 152, 3.6, .8, 'wallRed', 'ridgeB');
    for (const s of [1, -1]) sb({ x: TX + s * 66, n: n - 20, w: 46, d: 10, h: 5, rot: -s * 90, type: 'xie', mat: 'tileB', base: 1.2 });
    sb({ name: '长廊 · 神厨', x: TX + 190, n: n + 20, w: 190, d: 5, h: 3.4, type: 'gable', mat: 'tileG', pav: 1, base: .6, kind: '天坛' });
  }
  // 丹陛桥
  push('stone', box(29.4, 3.2, 360), T(TX, 0, 4062)); for (const s of [1, -1]) railPoly(T(TX, 0, 0), 3.2, [[s * 14.4, 3882], [s * 14.4, 4242]]);
  reg({ name: '丹陛桥', x: TX, n: -4062, w: 30, d: 360, y0: 0, h: 4, rank: 2, far: 1, pickLow: 1, kind: '天坛 · 神道', dims: '长 360 m · 宽 29.4 m · 北高南低', info: '连接圜丘坛与祈谷坛的砖砌高甬道，又称海墁大道，由南向北逐渐升高，寓意步步登天。' });
  // 皇穹宇 · 回音壁
  { const n = -4318, M = T(TX, 0, -n); ringWall(M, 30.75, 3.72, 'brick', 'ridgeB', 48);
    push('marble', cyl(11, 2.6, 40), M); railPoly(M, 2.6, ringPts(28, 10.6)); stairs(mul(M, 0, 0, 10.8), 5, 5, 2.6, true);
    const G = mul(M, 0, 2.6, 0); for (let i = 0; i < 8; i++) { const a = (i + .5) / 8 * Math.PI * 2; push('col', cyl(.35, 6.6), mul(G, Math.sin(a) * 7.8, 0, Math.cos(a) * 7.8)); }
    push('latticeDS', cylUV(7.8, 6.6, 40), G); push('caihua', cylUV(8, 1, 40), mul(G, 0, 6.2, 0));
    push('tileB', coneGeo(10.6, 0, 7.6, 40, 6), mul(G, 0, 7.2, 0), 'roof'); push('gold', new THREE.SphereGeometry(1.1, 12, 10), mul(G, 0, 15.8, 0), 'roof'); push('gold', cyl(.8, 1, 10), mul(G, 0, 14.4, 0), 'roof');
    for (const s of [1, -1]) sb({ x: TX + s * 19, n: n - 4, w: 16, d: 7, h: 4.2, rot: -s * 90, type: 'xie', mat: 'tileB', base: .8 });
    sb({ x: TX, n: n - 31, w: 12, d: 3, h: 4.5, type: 'xie', mat: 'tileB', both: 1, wall: 'brick' });
    reg({ name: '皇穹宇 · 回音壁', x: TX, n, w: 63, d: 63, y0: 0, h: 20, rank: 1, far: 1, kind: '天坛 · 圜丘坛', dims: '殿高 19.5 m · 回音壁直径 61.5 m、高 3.72 m', info: '存放圜丘祭天神牌的圆殿，单檐攒尖蓝瓦金顶。环绕它的圆形围墙即回音壁，磨砖对缝的墙面可沿弧线传声。' }); }
  // 圜丘
  { const n = -4470, M = T(TX, 0, -n); roundTerrace(M, [[27.45, 1.7], [19.65, 3.4], [11.8, 5.17]], 5, false);
    ringWall(M, 51, 1.8, 'wallRed', 'ridgeB', 56); rectWall(TX - 84, n - 84, TX + 84, n + 84, 1.8, .9, 'wallRed', 'ridgeB');
    for (let a = 0; a < 4; a++) for (const r of [51, 84]) for (const dx of [-5, 0, 5]) { const Mg = mul(M, Math.sin(a * Math.PI / 2) * r, 0, Math.cos(a * Math.PI / 2) * r, a * Math.PI / 2); push('marble', box(.6, 4.2, .6), mul(Mg, dx - 1.6, 0, 0)); push('marble', box(.6, 4.2, .6), mul(Mg, dx + 1.6, 0, 0)); push('marble', box(4.2, .5, .5), mul(Mg, dx, 3.2, 0)); }
    reg({ name: '圜丘', x: TX, n, w: 170, d: 170, y0: 0, h: 6, rank: 1, far: 1, kind: '天坛 · 祭天台', dims: '三层圆台 · 直径约 54.9 / 39.3 / 23.6 m · 高约 5.2 m', info: '明嘉靖九年（1530）建，清乾隆年间扩建，是皇帝冬至祭天的露天圆坛。台面、栏板、台阶数目皆用九或九的倍数；外方内圆两重矮墙象征“天圆地方”。' }); }
  // 斋宫
  { const x = 800, n = -4060; push('water', box(190, .14, 190), T(x, 0, -n)); push('stone', box(170, .3, 170), T(x, 0, -n)); rectWall(x - 80, n - 80, x + 80, n + 80, 4.5, 1, 'wallRed', 'ridgeG');
    sb({ name: '斋宫', x, n, w: 46, d: 17, h: 6.5, rot: 90, type: 'hip', mat: 'tileG', base: 2, detail: 1, rank: 2, far: 1, kind: '天坛 · 斋戒之所', info: '皇帝祭天前斋戒的“小皇宫”，坐西朝东，绿琉璃瓦，以示在天帝面前称臣。正殿为砖拱无梁殿，外有两重御沟。' });
    sb({ x: x - 40, n, w: 40, d: 10, h: 4.4, rot: 90, mat: 'tileG' }); sb({ x: x + 62, n: n + 55, w: 8, d: 8, h: 6, type: 'xie', dbl: 1, mat: 'tileG' }); }
  sb({ name: '神乐署', x: 330, n: -4250, w: 40, d: 16, h: 6, rot: 90, type: 'xie', mat: 'tileK', base: 1.2, kind: '天坛 · 礼乐机构', info: '明清演习祭祀礼乐的场所。' }); rectWall(270, -4330, 420, -4170, 4, .8, 'wallRed', 'ridgeK');
  sb({ name: '天坛西门', x: 150, n: -4160, w: 26, d: 9, h: 6, rot: -90, type: 'xie', mat: 'tileG', both: 1, wall: 'wallRed', kind: '天坛 · 坛门' }); sb({ x: 520, n: -4060, w: 24, d: 8, h: 6, rot: -90, type: 'xie', mat: 'tileG', both: 1, wall: 'wallRed' });
  const inT = (x, n) => (Math.abs(x - TX) < 95 && n > -4570 && n < -3600) || (Math.abs(x - 800) < 100 && Math.abs(n + 4060) < 100) || (x > 260 && x < 430 && n > -4340 && n < -4160) || Math.abs(n + 3990) < 9;
  grove(165, -4975, 1835, -3345, 2300, inT);
  reg({ name: '天坛', x: 1000, n: -4160, w: 1700, d: 1660, y0: 0, h: 2, rank: 1, far: 2, minD: 5200, pickLow: 1, noPick: 1, kind: '中轴线东侧 · 皇家祭坛', dims: '占地约 273 公顷 · 内外两重坛墙', info: '明清皇帝祭天、祈谷之所，始建于明永乐十八年（1420）。坛内主轴偏东，自南向北为圜丘、皇穹宇、丹陛桥、祈年殿，四周遍植古柏。与西侧的先农坛隔中轴线相对。' });

  /* ---------- 先农坛 ---------- */
  rectWall(-1250, -4990, -150, -3990, 4.5, 1, 'wallRed', 'ridgeK'); push('grass', box(1100, .28, 1000), T(-700, 0, 4490));
  { const x = -640; rectWall(x - 62, -4455, x + 62, -4300, 4.5, .8, 'wallRed', 'ridgeK');
    hall({ name: '太岁殿', x, n: -4325, w: 48, d: 22, bx: 7, bz: 3, hc: 8, type: 'xie', mat: 'tileK', base: 1.6, bm: 3, detail: 1, interior: 1, rank: 1, far: 1, kind: '先农坛 · 祭祀殿宇', dims: '面阔 7 间 · 单檐歇山 · 黑琉璃瓦绿剪边', info: '祭祀太岁及十二月将神的大殿，明代官式建筑的代表。今为北京古代建筑博物馆主展厅。' });
    sb({ name: '拜殿', x, n: -4430, w: 48, d: 16, h: 6.6, type: 'xie', mat: 'tileK', base: 1.4, both: 1, detail: 1, kind: '先农坛' });
    for (const s of [1, -1]) sb({ x: x + s * 52, n: -4378, w: 56, d: 9, h: 4.6, rot: -s * 90, mat: 'tileK' });
    push('marble', box(15, 1.5, 15), T(x, 0, 4530)); for (let a = 0; a < 4; a++) stairs(mul(T(x, 0, 4530), Math.sin(a * Math.PI / 2) * 7.5, 0, Math.cos(a * Math.PI / 2) * 7.5, a * Math.PI / 2), 3, 2.6, 1.5);
    reg({ name: '先农神坛', x, n: -4530, w: 20, d: 20, y0: 0, h: 2, rank: 2, far: 1, kind: '先农坛 · 祭坛', dims: '方 15 m · 高 1.5 m', info: '砖石砌筑的一层方坛，皇帝在此祭祀先农神（神农氏）。' });
    sb({ name: '神厨 · 宰牲亭', x: x - 110, n: -4380, w: 26, d: 11, h: 5, type: 'xie', mat: 'tileK', kind: '先农坛' }); rectWall(x - 150, -4430, x - 75, -4330, 4, .8, 'wallRed', 'ridgeK');
    rectWall(-580, -4420, -500, -4310, 4, .8, 'wallRed', 'ridgeK'); push('lattice', cyl(4.5, 5, 16), T(-540, 1, 4350)); push('tileK', coneGeo(6.5, 0, 4, 20, 4), T(-540, 6, 4350), 'roof'); push('gold', new THREE.SphereGeometry(.6, 8, 6), T(-540, 10.3, 4350), 'roof');
    sb({ x: -540, n: -4395, w: 18, d: 8, h: 4.2, mat: 'tileK' });
    reg({ name: '神仓', x: -540, n: -4365, w: 80, d: 110, y0: 0, h: 10, rank: 2, kind: '先农坛 · 仓储', info: '贮藏皇帝亲耕籍田所获谷物的院落，中央为圆形仓房，所藏供京城各坛庙祭祀使用。' });
    push('marble', box(16, 1.9, 16), T(-430, 0, 4500)); railRect(T(-430, 0, 4500), 1.9, 7.7, 7.7); for (const a of [0, 1, 3]) stairs(mul(T(-430, 0, 4500), Math.sin(a * Math.PI / 2) * 8, 0, Math.cos(a * Math.PI / 2) * 8, a * Math.PI / 2), 3.4, 3.4, 1.9);
    push('soilPlot', box(90, .12, 60), T(-430, 0, 4550));
    reg({ name: '观耕台 · 一亩三分地', x: -430, n: -4520, w: 90, d: 100, y0: 0, h: 3, rank: 2, far: 1, kind: '先农坛 · 亲耕礼', dims: '台方 16 m · 高 1.9 m', info: '皇帝每年仲春在台南的籍田“一亩三分地”扶犁亲耕，礼毕登台观看王公大臣耕作。' });
    sb({ name: '具服殿', x: -430, n: -4462, w: 24, d: 11, h: 5, type: 'xie', mat: 'tileG', base: 1.5, kind: '先农坛', info: '皇帝亲耕前更换礼服之处。' });
    rectWall(-390, -4310, -270, -4190, 4.5, .9, 'wallRed', 'ridgeG');
    sb({ name: '庆成宫', x: -330, n: -4255, w: 30, d: 14, h: 6, type: 'hip', mat: 'tileG', base: 1.8, detail: 1, rank: 2, kind: '先农坛 · 斋宫', info: '明天顺年间建，初为斋宫，清代改为亲耕礼成后皇帝行庆贺礼、犒劳百官之处。' }); sb({ x: -330, n: -4222, w: 30, d: 11, h: 5, type: 'hip', mat: 'tileG', base: 1 });
    for (const nn of [-4800, -4860]) push('marble', box(nn === -4800 ? 17 : 33, 1.4, nn === -4800 ? 17 : 21), T(-620, 0, -nn));
    reg({ name: '天神地祇坛', x: -620, n: -4830, w: 60, d: 110, y0: 0, h: 2, kind: '先农坛 · 祭坛（遗址示意）', info: '祭祀风云雷雨、山岳海渎诸神的两座方坛，现仅存部分遗迹，此处为位置示意。' });
    grove(-1235, -4975, -165, -4005, 900, (xx, nn) => (Math.abs(xx - x) < 160 && nn > -4560 && nn < -4290) || (xx > -590 && xx < -260 && nn > -4590 && nn < -4180) || (Math.abs(xx + 620) < 40 && Math.abs(nn + 4830) < 60));
    reg({ name: '先农坛', x: -700, n: -4490, w: 1100, d: 1000, y0: 0, h: 2, rank: 1, far: 2, minD: 5200, pickLow: 1, noPick: 1, kind: '中轴线西侧 · 皇家祭坛', dims: '明永乐十八年（1420）始建', info: '明清皇帝祭祀先农并行亲耕礼的场所，与天坛东西对称。现存太岁殿院落、神厨、神仓、观耕台、庆成宫等，外坛范围内后世建有体育场与居民区，此处外坛仅以林地示意。' }); }

  /* ---------- 南段道路 · 天桥 · 前门大街 ---------- */
  push('marble', box(10, 1.2, 22), T(0, 0, 3650)); for (const s of [1, -1]) { railPoly(T(0, 0, 3650), 1.2, [[s * 4.8, -11], [s * 4.8, 11]]); push('stairs', wedge(10, 5, 1.2), T(0, 0, 3650 + s * 11, s > 0 ? 0 : Math.PI)); }
  reg({ name: '天桥', x: 0, n: -3650, w: 14, d: 34, y0: 0, h: 3, rank: 2, far: 1, kind: '中轴线南段 · 景观桥', info: '明清皇帝往天坛、先农坛祭祀时经过的石桥，故名“天桥”，原桥 1934 年拆除，现为按史料复建的景观桥，位置略有调整。' });
  reg({ name: '南段道路遗存', x: 0, n: -4350, w: 30, d: 900, y0: 0, h: 1, rank: 1, far: 1, pickLow: 1, kind: '中轴线 · 居中道路', dims: '永定门—正阳门 约 3 km', info: '明清时期自永定门通往正阳门的御道。考古发掘出土了不同时期叠压的路面与排水沟，印证了中轴线南段道路数百年位置不变。' });
  pailou(0, -2175, 30, 5);
  reg({ name: '前门五牌楼', x: 0, n: -2175, w: 32, d: 6, y0: 0, h: 12, rank: 2, kind: '前门大街 · 牌楼', info: '正阳门外的五间六柱冲天牌楼，为京城牌楼之冠，2008 年按原样复建。' });

  /* ---------- 正阳门 ---------- */
  { const M = T(0, 0, 2095); push('brick', box(62, 12, 30), M); push('stone', box(62.6, 1.5, 30.6), M); push('dark', box(7, 8.5, .6), mul(M, 0, 0, 15.1)); push('dark', box(7, 8.5, .6), mul(M, 0, 0, -15.1));
    push('brick', box(64, 1.2, 1), mul(M, 0, 12, 14.6)); push('brick', box(64, 1.2, 1), mul(M, 0, 12, -14.6));
    const top = sb({ x: 0, n: -2098, y: 12, w: 52, d: 15, h: 11.5, wall: 'arrow', plain: 1, dbl: 1, type: 'xie', mat: 'tileK', base: .6, hs: 2.8, hu: 3, rh: 6, detail: 1 });
    sb({ x: 0, n: -2086, y: 12, w: 40, d: 9, h: 9, wall: 'brick', both: 1, type: 'gable', mat: 'tileK', base: .6 });
    reg({ name: '正阳门箭楼', x: 0, n: -2095, w: 62, d: 30, y0: 0, h: 12 + top, rank: 1, far: 1, kind: '正阳门 · 箭楼', dims: '通高约 38 m · 城台高 12 m · 箭窗 94 孔', info: '正阳门瓮城南端的防御性箭楼，灰砖砌筑、四层箭窗，是北京各城门箭楼中最高大的一座。瓮城于 1915 年拆除，箭楼经改建保留。' }); }
  gateTower({ name: '正阳门', x: 0, n: -1985, pw: 95, pd: 30, ph: 13.2, tw: 37, td: 17, bx: 7, hc: 9.5, rh: 6.5, eaves: 3, type: 'xie', mat: 'tileK', wallMat: 'brick', gates: [0], rank: 1, far: 2, kind: '内城正南门 · 城楼', dims: '通高 43.65 m · 城台高 13.2 m · 面阔 7 间',
    info: '俗称“前门”，明清北京内城的正南门，建成于明正统四年（1439），是北京所有城门中最高大的一座。城楼为重檐歇山三滴水，灰筒瓦绿琉璃剪边。' });

  /* ---------- 天安门广场及建筑群 ---------- */
  reg({ name: '天安门广场', x: 0, n: -1587, w: 280, d: 749, y0: 0, h: 1, rank: 1, far: 2, minD: 1500, pickLow: 1, noPick: 1, kind: '国家礼仪与公共建筑群', dims: '南北 762 m · 东西 280 m · 约 21.4 公顷', info: '明清时为宫廷前的“T”形广场（千步廊），20 世纪中叶扩建为今日格局。人民英雄纪念碑、毛主席纪念堂居中轴，人民大会堂与国家博物馆东西对称，延续了中轴线均衡对称的原则。' });
  { const M = T(0, 0, 1790); push('granite', box(132, 1.6, 132), M); push('granite', box(120, 4, 120), M); railRect(M, 4, 59.5, 59.5, 12, 12); railRect(M, 1.6, 65.5, 65.5, 14, 14);
    stairs(mul(M, 0, 0, 60), 24, 9, 4, true); stairs(mul(M, 0, 0, -60, Math.PI), 24, 9, 4, true);
    push('facade', box(78, 22, 78, true), mul(M, 0, 4, 0)); for (let i = 0; i < 12; i++) for (const s of [1, -1]) { const p = -48.4 + i * 8.8; push('granL', box(1.6, 17.5, 1.6), mul(M, p, 4, s * 48.4)); if (i > 0 && i < 11) push('granL', box(1.6, 17.5, 1.6), mul(M, s * 48.4, 4, p)); }
    push('granL', box(105.5, 3.6, 105.5), mul(M, 0, 21.5, 0), 'roof'); push('yellow', box(107, 1, 107), mul(M, 0, 25.1, 0), 'roof'); push('granL', box(94, 5.2, 94), mul(M, 0, 26.1, 0), 'roof'); push('yellow', box(96, 1.1, 96), mul(M, 0, 31.3, 0), 'roof'); push('roofFlat', box(90, 1.2, 90), mul(M, 0, 32.4, 0), 'roof');
    reg({ name: '毛主席纪念堂', x: 0, n: -1790, w: 132, d: 132, y0: 0, h: 33.6, rank: 1, far: 1, kind: '天安门广场建筑群', dims: '平面 105.5 m 见方 · 高 33.6 m · 44 根花岗岩廊柱', info: '1977 年建成，位于原中华门旧址。重檐平顶，檐部饰金黄色琉璃板，下为两层枣红色花岗岩台基。' }); }
  { const M = T(0, 0, 1553); push('marble', box(61.5, 1.5, 50.4), M); railRect(M, 1.5, 30.2, 24.7, 5, 5); push('marble', box(48, 3.2, 38), M); railRect(M, 3.2, 23.5, 18.5, 4, 4);
    for (let a = 0; a < 4; a++) stairs(mul(M, Math.sin(a * Math.PI / 2) * (a % 2 ? 24 : 0), 0, Math.cos(a * Math.PI / 2) * (a % 2 ? 0 : 19), a * Math.PI / 2), 7, 6.5, 3.2);
    push('carved', box(13, 4.6, 8.5), mul(M, 0, 3.2, 0)); push('marble', box(14, .6, 9.5), mul(M, 0, 7.8, 0)); push('marble', box(8.5, 3, 5.2), mul(M, 0, 8.4, 0)); push('granL', box(4.6, 22.6, 2.6), mul(M, 0, 11.4, 0));
    push('marble', box(6, 1, 3.8), mul(M, 0, 34, 0)); push('marbleDS', roofGeo(3.3, 2.2, 1.6, .1, 2.6, { ns: 2, nt: 2, lift: .3 }).roof, mul(M, 0, 35, 0));
    reg({ name: '人民英雄纪念碑', x: 0, n: -1553, w: 62, d: 51, y0: 0, h: 37.94, rank: 1, far: 1, kind: '天安门广场建筑群', dims: '通高 37.94 m · 碑心石高 14.7 m', info: '1958 年落成，位于广场中心、中轴线上。碑身北面镌“人民英雄永垂不朽”，须弥座四周嵌八幅汉白玉浮雕，碑顶为庑殿式石顶。' }); }
  { const M = T(0, 0, 1232); push('marble', box(9, .8, 9), M); railRect(M, .8, 4.3, 4.3); push('marble', cyl(.17, 30, 8), mul(M, 0, .8, 0)); push('flag', new THREE.PlaneGeometry(5, 3.3), mul(M, 2.65, 28.6, 0));
    reg({ name: '国旗杆', x: 0, n: -1232, w: 10, d: 10, y0: 0, h: 31, kind: '天安门广场', dims: '旗杆高约 30 m', info: '位于广场北端中轴线上，每日随日出日落举行升降旗仪式。' }); }
  // 人民大会堂（西）
  { const x = -353, n = -1480, M = T(x, 0, -n); push('granL', box(214, 2.5, 344), M);
    const blk = (w, h, d, dx, dn) => { push('facade', box(w, h, d, true), mul(M, dx, 2.5, -dn)); push('yellow', box(w + 2.4, 1.3, d + 2.4), mul(M, dx, 2.5 + h, -dn), 'roof'); push('roofFlat', box(w - 3, 1, d - 3), mul(M, dx, 3.8 + h, -dn), 'roof'); };
    blk(188, 29, 336, -6, 0); blk(200, 38, 132, 0, 0); blk(120, 43, 96, -30, 0); blk(196, 33, 60, -2, 138); blk(196, 33, 60, -2, -138);
    for (let i = 0; i < 12; i++) push('granL', cyl(1.1, 25, 12), mul(M, 104, 2.5, -(i - 5.5) * 7.6)); push('yellow', box(6, 1.3, 96), mul(M, 103, 27.5, 0), 'roof'); push('facade', box(7, 9, 94, true), mul(M, 103, 28.8, 0), 'roof');
    stairs(mul(M, 107, 0, 0, Math.PI / 2), 90, 8, 2.5); for (const s of [1, -1]) for (let i = 0; i < 6; i++) push('granL', cyl(.9, 20, 10), mul(M, (i - 2.5) * 7 - 2, 2.5, s * 169));
    reg({ name: '人民大会堂', x, n, w: 214, d: 344, y0: 0, h: 46.5, rank: 1, far: 1, kind: '天安门广场建筑群 · 西侧', dims: '南北 336 m · 东西 206 m · 最高处 46.5 m', info: '1959 年建成，国庆十周年“十大建筑”之一。东立面正门有 12 根 25 米高的灰色大理石门柱，檐部饰黄绿琉璃。与东侧国家博物馆隔广场对称。' }); }
  // 中国国家博物馆（东）
  { const x = 345, n = -1480, M = T(x, 0, -n); push('granL', box(196, 2, 320), M);
    const blk = (w, h, d, dx, dn) => { push('facade', box(w, h, d, true), mul(M, dx, 2, -dn)); push('yellow', box(w + 2.4, 1.2, d + 2.4), mul(M, dx, 2 + h, -dn), 'roof'); push('roofFlat', box(w - 3, 1, d - 3), mul(M, dx, 3.2 + h, -dn), 'roof'); };
    blk(150, 26, 92, -18, 110.5); blk(150, 26, 92, -18, -110.5); blk(84, 30, 313, 50, 0); blk(40, 26, 130, -73, 0);
    for (let i = 0; i < 12; i++) for (const dx of [-95, -88]) push('granL', box(1.8, 32, 1.8), mul(M, dx, 2, -(i - 5.5) * 8.6)); push('granL', box(12, 5, 104), mul(M, -91.5, 34, 0), 'roof'); push('yellow', box(13.5, 1.2, 106), mul(M, -91.5, 39, 0), 'roof');
    stairs(mul(M, -97, 0, 0, -Math.PI / 2), 100, 6, 2);
    reg({ name: '中国国家博物馆', x, n, w: 196, d: 320, y0: 0, h: 40, rank: 1, far: 1, kind: '天安门广场建筑群 · 东侧', dims: '西立面南北长 313 m · 柱廊高约 40 m', info: '1959 年建成（原中国革命博物馆、中国历史博物馆），“十大建筑”之一，2011 年向东扩建。西门为 24 根方柱组成的空廊，与人民大会堂遥相呼应。' }); }

  /* ---------- 外金水桥 · 天安门 · 端门 ---------- */
  push('water', box(520, .2, 14), T(0, .1, 1140)); for (const s of [1, -1]) push('marble', box(520, .9, .8), T(0, 0, 1140 + s * 7.4));
  for (const [bx_, bw] of [[0, 8.6], [-13, 5.8], [13, 5.8], [-25, 4.6], [25, 4.6], [-92, 6], [92, 6]]) { const M = T(bx_, 0, 1140); push('marble', box(bw, 1.3, 20), M); for (const s of [1, -1]) { push('stairs', wedge(bw, 5, 1.3), mul(M, 0, 0, s * 10, s > 0 ? 0 : Math.PI)); railPoly(M, 1.3, [[s * (bw / 2 - .1), -10], [s * (bw / 2 - .1), 10]]); } }
  for (const [hx_, hn] of [[36, -1160], [-36, -1160], [36, -1058], [-36, -1058]]) { const M = T(hx_, 0, -hn); push('marble', box(2.6, 1.2, 2.6), M); push('marble', cyl(.5, 8, 10), mul(M, 0, 1.2, 0)); push('marble', box(3, .35, .5), mul(M, 0, 7.4, 0)); push('marble', cyl(.75, .5, 10), mul(M, 0, 9.2, 0)); }
  reg({ name: '外金水桥', x: 0, n: -1140, w: 190, d: 26, y0: 0, h: 3, rank: 1, far: 1, kind: '天安门前 · 桥梁', dims: '七座三孔汉白玉拱桥（中五座正对天安门五门洞）', info: '跨外金水河而建。正中御路桥最宽，为皇帝专用；两侧依次为王公桥、品级桥，最外侧两座公生桥分别通向太庙与社稷坛。桥南北各立华表一对。' });
  gateTower({ name: '天安门', x: 0, n: -1092, pw: 120, pd: 40, ph: 13, tw: 57, td: 25, bx: 9, hc: 8.6, type: 'xie', gates: [0, -.11, .11, -.22, .22], rank: 1, far: 2, kind: '皇城正门', dims: '通高约 34.7 m · 城楼面阔 9 间、进深 5 间 · 五阙',
    info: '明清皇城的正门，始建于明永乐十五年（1417），初名承天门，清顺治八年（1651）改今名。城楼面阔九间、进深五间，取“九五之尊”；重檐歇山黄琉璃瓦。国家颁诏的“金凤颁诏”礼在此举行。' });
  for (const s of [1, -1]) { wallLine(s * 60, -1092, s * 1400, -1092, 6, 1); wallLine(s * 80, -1072, s * 80, -905, 6, .9); wallLine(s * 60, -890, s * 80, -890, 6, .9);
    sb({ name: s > 0 ? '太庙街门' : '社稷街门', x: s * 80, n: -990, w: 18, d: 6, h: 5, rot: -s * 90, type: 'xie', both: 1, wall: 'wallRed', kind: '皇城 · 门' });
    sb({ x: s * 80, n: -800, w: 130, d: 8, h: 4.6, rot: -s * 90, base: .8 }); sb({ x: s * 80, n: -650, w: 105, d: 8, h: 4.6, rot: -s * 90, base: .8 });
    sb({ name: s > 0 ? '阙左门' : '阙右门', x: s * 80, n: -722, w: 20, d: 8, h: 5.4, rot: -s * 90, type: 'xie', both: 1, wall: 'wallRed', kind: '皇城 · 门' }); }
  gateTower({ name: '端门', x: 0, n: -890, pw: 120, pd: 40, ph: 13, tw: 57, td: 25, bx: 9, hc: 8.6, type: 'xie', gates: [0, -.11, .11, -.22, .22], rank: 1, far: 1, kind: '皇城 · 礼仪之门', dims: '形制与天安门相同 · 通高约 34 m', info: '位于天安门与午门之间，建成于明永乐十八年（1420），建筑形制与天安门基本相同。明清时用于存放皇帝仪仗，是进入紫禁城前整肃仪容的过渡空间。' });

  /* ---------- 太庙（东） ---------- */
  { const x = 262; rectWall(125, -1062, 400, -600, 5.5, 1); rectWall(x - 78, -975, x + 78, -705, 5, .9); wallLine(x - 78, -763, x + 78, -763, 4.5, .8);
    push('water', box(150, .14, 7), T(x, .05, 962)); for (const dx of [-16, -8, 0, 8, 16]) { push('marble', box(4.2, .9, 11), T(x + dx, 0, 962)); railPoly(T(x + dx, 0, 962), .9, [[2, -5.5], [2, 5.5]]); railPoly(T(x + dx, 0, 962), .9, [[-2, -5.5], [-2, 5.5]]); }
    sb({ x, n: -975, w: 24, d: 4, h: 5.4, type: 'xie', both: 1, wall: 'wallRed' });
    hall({ name: '太庙戟门', x, n: -940, w: 26, d: 10, bx: 5, bz: 2, hc: 6, type: 'hip', base: 1.7, bm: 2.5, gate: 1, rail: 1, detail: 1, kind: '太庙 · 礼仪之门', info: '太庙正殿院落的大门，明代原构，门内外原列戟 120 枝。' });
    for (let i = 0; i < 3; i++) { const h = 3.46 * (i + 1) / 3, w = 92 - i * 7, d = 62 - i * 7; push('marble', box(w, h, d), T(x, 0, 852)); railRect(T(x, 0, 852), h, w / 2 - .4, d / 2 - .4, 6, 6); }
    push('marble', box(40, 3.46, 46), T(x, 0, 806)); stairs(T(x, 0, 852 + 24), 10, 12, 3.46, true); stairs(T(x, 0, 783, Math.PI), 8, 6, 3.46);
    hall({ name: '太庙享殿', x, n: -852, y: 3.46, w: 62, d: 26, bx: 11, bz: 4, hc: 10.4, dbl: 1, type: 'hip', base: .7, bm: 1.6, porch: 1, interior: 1, detail: 1, sign: 1, rh: 8, nostair: 1, backDoor: 1, rank: 1, far: 1,
      kind: '太庙 · 前殿', dims: '面阔 11 间 · 重檐庑殿顶 · 三层须弥座高 3.46 m · 通高约 32.5 m', info: '明清皇帝祭祀祖先的正殿，“左祖右社”中的“祖”。体量与太和殿相仿，梁柱多用整根金丝楠木，是明代官式建筑的珍贵实物。1950 年辟为北京市劳动人民文化宫。' });
    hall({ name: '太庙寝殿', x, n: -795, y: 3.46, w: 56, d: 18, bx: 9, bz: 3, hc: 7.6, type: 'hip', base: .5, bm: 1.2, detail: 1, nostair: 1, kind: '太庙 · 中殿', info: '平日供奉历代帝后神牌之处，祭祀时将神牌移至享殿。' });
    hall({ name: '太庙祧庙', x, n: -735, w: 56, d: 18, bx: 9, bz: 3, hc: 7.6, type: 'hip', base: 1.8, bm: 2.5, rail: 1, detail: 1, kind: '太庙 · 后殿', info: '供奉皇帝远祖神牌的殿宇，自成一院。' });
    for (const s of [1, -1]) { sb({ x: x + s * 66, n: -852, w: 78, d: 9, h: 5, rot: -s * 90, type: 'xie', base: 1 }); sb({ x: x + s * 66, n: -795, w: 26, d: 8, h: 4.4, rot: -s * 90 }); sb({ x: x + s * 66, n: -735, w: 26, d: 8, h: 4.4, rot: -s * 90 }); }
    grove(130, -1056, 395, -606, 330, (xx, nn) => Math.abs(xx - x) < 84 && nn > -985 && nn < -700);
    reg({ name: '太庙', x, n: -831, w: 275, d: 462, y0: 0, h: 2, rank: 1, far: 2, minD: 5200, pickLow: 1, noPick: 1, kind: '中轴线东侧 · 皇家祖庙', dims: '南北约 475 m · 东西约 294 m', info: '明清两代皇室的祖庙，始建于明永乐十八年（1420），位于天安门与午门之间的东侧。三重围墙内前、中、后三殿沿南北轴线排列，院内古柏成林。' }); }

  /* ---------- 社稷坛（西） ---------- */
  { const x = -262, n = -850, M = T(x, 0, -n); rectWall(-400, -1062, -125, -600, 5.5, 1); rectWall(x - 100, -965, x + 100, -720, 4.5, .9);
    for (const [w, h] of [[17.8, .36], [16.8, .72], [15, 1.08]]) push('marble', box(w, h, w), M); for (let a = 0; a < 4; a++) stairs(mul(M, Math.sin(a * Math.PI / 2) * 7.5, 0, Math.cos(a * Math.PI / 2) * 7.5, a * Math.PI / 2), 3, 2, 1.08);
    const g = new THREE.PlaneGeometry(14.6, 14.6); g.rotateX(-Math.PI / 2); push('soil5', g, mul(M, 0, 1.1, 0)); push('stone', box(.5, .9, .5), mul(M, 0, 1.1, 0));
    const wl = (m, x0, z0, x1, z1) => { const len = Math.hypot(x1 - x0, z1 - z0), hz = Math.abs(x1 - x0) > 1, Mm = mul(M, (x0 + x1) / 2, 0, (z0 + z1) / 2); push(m, hz ? box(len, 1.7, .7) : box(.7, 1.7, len), Mm); };
    for (const [m, s, hz] of [['wBlue', 1, 0], ['white', -1, 0], ['wallRed', 1, 1], ['dark', -1, 1]]) for (const t of [1, -1]) { if (hz) wl(m, t * 3, s * 31, t * 31, s * 31); else wl(m, s * 31, t * 3, s * 31, t * 31); }
    for (let a = 0; a < 4; a++) { const Mg = mul(M, Math.sin(a * Math.PI / 2) * 31, 0, Math.cos(a * Math.PI / 2) * 31, a * Math.PI / 2); for (const dx of [-2.6, 2.6]) push('marble', box(.6, 4, .6), mul(Mg, dx, 0, 0)); push('marble', box(6.4, .5, .5), mul(Mg, 0, 3, 0)); }
    reg({ name: '社稷坛 · 五色土', x, n, w: 64, d: 64, y0: 0, h: 4, rank: 1, far: 1, kind: '社稷坛 · 祭坛', dims: '三层方台 · 上层边长约 15 m · 高约 1 m', info: '明清皇帝祭祀太社（土神）、太稷（谷神）之处，“左祖右社”中的“社”。坛面按方位铺五色土：东青、南红、西白、北黑、中黄，象征“普天之下，莫非王土”；四面矮墙琉璃砖颜色与之对应。' });
    hall({ name: '中山堂（拜殿）', x, n: -790, w: 30, d: 14, bx: 5, bz: 3, hc: 6.6, type: 'xie', base: 1.3, bm: 2.5, detail: 1, interior: 1, rank: 2, far: 1, rot: 180, kind: '社稷坛 · 拜殿', dims: '面阔 5 间 · 单檐歇山', info: '皇帝祭社稷遇雨时在此行礼，明代原构。1925 年孙中山灵柩曾停放于此，后改名中山堂。社稷坛祭祀自北向南行礼，故殿在坛北。' });
    hall({ name: '社稷坛戟门', x, n: -748, w: 30, d: 12, bx: 5, bz: 2, hc: 6, type: 'xie', base: 1.2, bm: 2, gate: 1, detail: 1, kind: '社稷坛' });
    grove(-395, -1056, -130, -606, 330, (xx, nn) => Math.abs(xx - x) < 44 && nn > -895 && nn < -735);
    reg({ name: '社稷坛', x, n: -831, w: 275, d: 462, y0: 0, h: 2, rank: 1, far: 2, minD: 5200, pickLow: 1, noPick: 1, kind: '中轴线西侧 · 皇家祭坛', dims: '今中山公园', info: '始建于明永乐十八年（1420），与太庙隔中轴线对称。1914 年辟为中央公园，1928 年改称中山公园。' }); }

  /* ---------- 故宫 far label ---------- */
  reg({ name: '故宫', x: 0, n: 0, w: 753, d: 961, y0: 0, h: 2, rank: 1, far: 2, minD: 2600, pickLow: 1, noPick: 1, kind: '明清皇宫 · 紫禁城', dims: '南北 961 m · 东西 753 m · 城墙高 10 m · 护城河宽 52 m', info: '明清两代的皇宫，中轴线的核心。外朝三大殿与内廷后三宫沿轴线依次排列。靠近后可点选其中各座宫殿。' });

  /* ---------- 地安门 · 万宁桥 ---------- */
  for (const s of [1, -1]) sb({ name: s > 0 ? '地安门雁翅楼（东）' : '地安门雁翅楼（西）', x: s * 40, n: 1795, w: 58, d: 9, h: 5, rot: -s * 90, type: 'gable', dbl: 1, base: .8, wall: 'wallRed', rank: s > 0 ? 2 : 0, far: s > 0 ? 1 : 0, kind: '地安门旧址', info: '地安门是皇城北门，与天安门南北相对，1954 年拆除。门内两侧的雁翅楼于 2014 年前后按原貌复建，标示出皇城北缘。' });
  push('water', box(700, .14, 16), T(310, .03, -2283)); push('marble', box(17, 1.6, 34), T(0, 0, -2283)); for (const s of [1, -1]) { railPoly(T(0, 0, -2283), 1.6, [[s * 8.2, -17], [s * 8.2, 17]]); push('stairs', wedge(17, 9, 1.6), T(0, 0, -2283 + s * 17, s > 0 ? 0 : Math.PI)); }
  reg({ name: '万宁桥', x: 0, n: 2283, w: 20, d: 52, y0: 0, h: 3, rank: 1, far: 2, kind: '中轴线北段 · 元代古桥', dims: '单孔石拱桥 · 长约 34.6 m · 宽约 17 m', info: '始建于元至元二十二年（1285），是中轴线上最古老的桥，俗称后门桥。它跨越什刹海通往通惠河的玉河河道，为元大都漕运入城的咽喉，桥下两岸有石雕镇水兽。' });
  sb({ name: '火德真君庙', x: -45, n: 2330, w: 20, d: 10, h: 4.6, type: 'xie', mat: 'tileG', kind: '万宁桥畔 · 道观' });

  /* ---------- 鼓楼 · 钟楼 ---------- */
  { const n = 2650, M = T(0, 0, -n); push('stone', box(58, 3.2, 36), M); push('wallRed', box(50, 26, 28), mul(M, 0, 3.2, 0));
    for (const dx of [0, -15, 15]) for (const s of [1, -1]) push('dark', box(5, 8, .6), mul(M, dx, 3.2, s * 14.05)); for (const s of [1, -1]) push('dark', box(.6, 8, 5), mul(M, s * 25.05, 3.2, 0));
    stairs(mul(M, 0, 0, 18), 20, 6, 3.2); stairs(mul(M, 0, 0, -18, Math.PI), 20, 6, 3.2);
    const r = hall({ x: 0, n, y: 29.2, w: 36, d: 15, bx: 5, bz: 3, hc: 5.4, eaves: 3, type: 'xie', mat: 'tileK', base: .6, bm: 2.4, gallery: 1, nostair: 1, noReg: 1, detail: 1, sign: 1, rail: 1, rh: 4.4, interior: 1 });
    reg({ name: '鼓楼', x: 0, n, w: 58, d: 36, y0: 0, h: 29.2 + r.top, rank: 1, far: 1, inside: r.inside, kind: '中轴线北端 · 报时中心', dims: '通高 46.7 m · 面阔 5 间 · 重檐三滴水歇山顶', info: '元明清三代都城的报时中心，现存建筑建于明永乐十八年（1420）。下为砖砌城台，上为木构楼阁，楼上原置更鼓 25 面（主鼓 1、群鼓 24，对应二十四节气），“暮鼓晨钟”由此而来。' }); }
  { const n = 2840, M = T(0, 0, -n); push('brick', box(34, 6, 34), M); railRect(M, 6, 16.6, 16.6, 4, 4); stairs(mul(M, 0, 0, 17), 7, 9, 6); stairs(mul(M, 0, 0, -17, Math.PI), 7, 9, 6);
    const top = sb({ x: 0, n, y: 6, w: 24, d: 20, h: 21, wall: 'brick', plain: 1, dbl: 1, type: 'xie', mat: 'tileK', base: 1, hs: 3, hu: 5.4, rh: 6.2, detail: 1 });
    for (let a = 0; a < 4; a++) { const Mg = mul(M, 0, 7, 0, a * Math.PI / 2), r = a % 2 ? 12.05 : 10.05; push('dark', box(5, 9, .5), mul(Mg, 0, 0, r)); push('dark', box(4, 4, .5), mul(Mg, 0, 26, r - 1.4), 'roof'); }
    reg({ name: '钟楼', x: 0, n, w: 34, d: 34, y0: 0, h: 6 + top, rank: 1, far: 1, kind: '中轴线北端点', dims: '通高 47.9 m · 全砖石结构 · 重檐歇山黑琉璃瓦绿剪边', info: '中轴线的北端点，位于鼓楼以北约百米。现存建筑为清乾隆十年（1745）重建，为防火改用全砖石无梁拱券结构。楼内悬明永乐年间铸造的铜钟，重约 63 吨，是中国现存最重的古钟。' }); }
  reg({ name: '钟鼓楼', x: 0, n: 2745, w: 60, d: 230, y0: 0, h: 2, rank: 1, far: 2, minD: 5200, pickLow: 1, noPick: 1, kind: '中轴线北端 · 古代城市管理设施', dims: '两楼南北相距约百米', info: '鼓楼在南、钟楼在北，共同构成中轴线的北端。击鼓定更、撞钟报时的制度一直延续到 1924 年。' });
}

/* generic low-rise city fabric (schematic context only) */
function fabric() {
  const b = new THREE.BoxGeometry(1, 1, 1).toNonIndexed(); b.translate(0, .5, 0);
  const r = tri([-.55, 1, .58, .55, 1, .58, .55, 1.42, 0, -.55, 1, .58, .55, 1.42, 0, -.55, 1.42, 0, .55, 1, -.58, -.55, 1, -.58, -.55, 1.42, 0, .55, 1, -.58, -.55, 1.42, 0, .55, 1.42, 0, -.5, 1, .5, -.5, 1.42, 0, -.5, 1, -.5, .5, 1, -.5, .5, 1.42, 0, .5, 1, .5], new Array(36).fill(0));
  const col = (g, c) => { const a = new Float32Array(g.attributes.position.count * 3); for (let i = 0; i < a.length; i += 3) { a[i] = c[0]; a[i + 1] = c[1]; a[i + 2] = c[2]; } g.setAttribute('color', new THREE.BufferAttribute(a, 3)); };
  col(b, [.8, .78, .74]); col(r, [.42, .44, .47]); const g = mergeGeometries([b, r], false);
  const pts = []; const ex = (x, n) => EX.some(e => x > e[0] - 22 && x < e[2] + 22 && n > e[1] - 8 && n < e[3] + 8);
  for (let n = -4990; n < 3100; n += 31) for (let x = -1470; x < 1470; x += 60) { const xx = x + rnd() * 12, nn = n + rnd() * 6, rot = rnd() < .22; if (Math.abs(xx) < 46 || rnd() < .1 || ex(xx, nn)) continue; pts.push([xx, nn, rot]); }
  const im = new THREE.InstancedMesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, side: DS }), pts.length), M = new THREE.Matrix4(), S = new THREE.Matrix4(), c = new THREE.Color();
  pts.forEach(([x, n, rot], i) => { const south = n < -2100, tall = south && rnd() < .25; M.makeRotationY(rot ? Math.PI / 2 : 0); S.makeScale(rot ? 22 + rnd() * 6 : 44 + rnd() * 10, tall ? 9 + rnd() * 8 : 3.6 + rnd() * 1.4, 9 + rnd() * 4); M.multiply(S).setPosition(x, 0, -n); im.setMatrixAt(i, M); const v = .82 + rnd() * .22; c.setRGB(v, v, v * (tall ? 1.02 : .98)); im.setColorAt(i, c); });
  return im;
}

/* ---------- trees ---------- */
function trees(peaks) {
  const pts = [];
  const free = (x, n) => !sites.some(s => !s.pickLow && s.y0 < 5 && Math.abs(x - s.x) < s.hw + 2 && Math.abs(n - s.n) < s.hd + 2 && s.name !== '三台');
  const area = (x0, n0, x1, n1, cnt, s = 1) => { for (let i = 0; i < cnt; i++) { const x = x0 + rnd() * (x1 - x0), n = n0 + rnd() * (n1 - n0); if (free(x, n)) pts.push([x, 0, n, (3 + rnd() * 2.5) * s]); } };
  area(-68, 346, 68, 430, 90); area(-216, -98, -166, 8, 40); area(235, 252, 254, 440, 40); area(-360, -440, -120, -350, 30); area(125, -450, 360, -350, 30);
  area(-360, 330, -300, 460, 26); area(-360, -220, -270, -10, 30); area(270, -330, 360, 60, 40); area(-130, -240, -118, 80, 14, .8); area(118, -240, 130, 80, 14, .8);
  const mh = (x, n) => { let h = 0; for (const [px, ph, rx, rz] of peaks) { const q = 1 - ((x - px) / rx) ** 2 - ((n - 770) / rz) ** 2; if (q > 0) h = Math.max(h, ph * Math.sqrt(q)); } return h; };
  for (let i = 0; i < 420; i++) { const x = -210 + rnd() * 420, n = 600 + rnd() * 395; if (Math.hypot(x, n - 770) < 9 || (Math.abs(x) < 24 && n > 915)) continue; pts.push([x, mh(x, n), n, 4 + rnd() * 3]); }
  for (const s of [1, -1]) { for (let n = -540; n <= 540; n += 16) pts.push([s * (HW + 80 + rnd() * 3), 0, n, 5]); for (let x = -440; x <= 440; x += 16) { pts.push([x, 0, s > 0 ? HN + 80 : -HN - 82, 5]); } }
  for (let n = -470; n <= 470; n += 22) for (const s of [1, -1]) pts.push([s * (HW + 12), 0, n, 3.6]);
  const g = new THREE.IcosahedronGeometry(1, 1), m = new THREE.MeshLambertMaterial({ color: 0xffffff }), im = new THREE.InstancedMesh(g, m, pts.length), M = new THREE.Matrix4(), c = new THREE.Color();
  const tg = new THREE.CylinderGeometry(.12, .16, 1, 5), tm = new THREE.InstancedMesh(tg, new THREE.MeshLambertMaterial({ color: 0x5a4636 }), pts.length);
  pts.forEach(([x, y, n, r], i) => {
    if (Math.abs(x) < 105 && n < -552) r = 0;
    M.makeScale(r, r * 1.15, r).setPosition(x, y + r * 1.5, -n); im.setMatrixAt(i, M); c.setHSL(.27 + rnd() * .08, .32 + rnd() * .15, .26 + rnd() * .1); im.setColorAt(i, c);
    M.makeScale(r, r * 1.2, r).setPosition(x, y + r * .6, -n); tm.setMatrixAt(i, M);
  });
  const bg = new THREE.IcosahedronGeometry(1, 0), bm = new THREE.InstancedMesh(bg, new THREE.MeshLambertMaterial({ color: 0xffffff }), bulk.length);
  bulk.forEach(([x, y, n, r], i) => { M.makeScale(r, r * 1.5, r).setPosition(x, y + r * 1.2, -n); bm.setMatrixAt(i, M); c.setHSL(.29 + rnd() * .07, .3 + rnd() * .15, .2 + rnd() * .09); bm.setColorAt(i, c); });
  return [im, tm, bm];
}

export function buildModel() {
  const peaks = buildAll();
  const base = new THREE.Group(), roof = new THREE.Group();
  let tris = 0;
  for (const k in batches) {
    const [m, layer] = k.split('|'); const g = mergeGeometries(batches[k], false); batches[k].forEach(x => x.dispose()); delete batches[k];
    tris += g.attributes.position.count / 3; const mesh = new THREE.Mesh(g, mat(m)); mesh.userData.k = m; (layer === 'roof' ? roof : base).add(mesh);
  }
  const tr = trees(peaks); tr.forEach(t => base.add(t)); base.add(fabric());
  return { base, roof, tris, sites };
}
