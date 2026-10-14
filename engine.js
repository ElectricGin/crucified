/* ==========================================================================
   CRUCIFIED: ENGINE
   You normally don't need to edit this file. All the words are in story.js,
   and art goes in the assets/ folder (see README.md).
   ========================================================================== */
(function () {
  'use strict';

  const S = window.STORY;
  const SET = S.settings;
  const W = 320, H = 180;
  const $ = (id) => document.getElementById(id);
  const stage = $('stage');
  const cv = $('scene');
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const TOPICS = ['demon', 'night'];
  const APPROACHES = ['kind', 'direct', 'intimidate'];
  const MOODS = ['neutral', 'scared', 'angry', 'sad'];
  const SUSPECTS = Object.keys(S.characters).filter((id) => !S.characters[id].noInterview);

  /* ---------------- storage (always optional) ---------------- */
  const SAVE_KEY = 'crucified_save_v1';
  const PREF_KEY = 'crucified_prefs_v1';
  function load(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  function wipe(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  const prefs = Object.assign({ muted: false }, load(PREF_KEY) || {});
  function savePrefs() { store(PREF_KEY, prefs); }

  let state = null;
  function freshState() {
    return {
      phase: 'intro', day: 1, hours: SET.hoursPerDay,
      hyst: SET.floors.day1, floor: SET.floors.day1,
      evidence: [], reported: [], asked: {}, chart: {}, met: {}, notified: {},
      calm: 0, fear: 0, crossed: {}
    };
  }
  function save() { if (state) store(SAVE_KEY, state); }

  /* ---------------- helpers ---------------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cap = (t) => String(t).replace(/\b\w/g, (c) => c.toUpperCase());
  const fill = (t, vars) => String(t).replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] != null ? vars[k] : m));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  function getEv(id) {
    if (S.evidence[id]) return S.evidence[id];
    if (S.inferences[id]) return { type: 'inference', from: 'Your reasoning', text: S.inferences[id].text };
    return { type: 'fact', from: '?', text: id };
  }
  function typeLabel(ev) { return ev.type === 'inference' ? 'CONNECTION' : ev.type.toUpperCase(); }
  function nameOf(id) {
    if (id === 'narrator') return '';
    if (id === 'crowd') return 'The Crowd';
    return S.characters[id] ? S.characters[id].name : id;
  }

  /* ---------------- optional art in assets/ ---------------- */
  const IMG = {};
  const BGS = ['town_day', 'town_night', 'title', 'memory', 'church', 'inn', 'farm', 'square', 'house', 'cottage',
    'shack', 'clearing', 'study', 'barn', 'courtroom', 'jail', 'street', 'parsonage', 'nama'];
  function loadImg(name) {
    return new Promise((res) => {
      const im = new Image();
      const t = setTimeout(res, 2500);
      im.onload = () => { clearTimeout(t); IMG[name] = im; res(); };
      im.onerror = () => { clearTimeout(t); res(); };
      im.src = 'assets/' + name + '.png';
    });
  }
  function preload() {
    const names = BGS.map((b) => 'bg_' + b);
    Object.keys(S.characters).forEach((id) => MOODS.forEach((m) => names.push('char_' + id + '_' + m)));
    names.push('detective');
    return Promise.all(names.map(loadImg));
  }

  /* ---------------- pixel drawing ---------------- */
  function R(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
  function disc(cx, cy, r, c) {
    ctx.fillStyle = c;
    for (let dy = -r; dy <= r; dy++) {
      const dx = Math.floor(Math.sqrt(r * r - dy * dy));
      ctx.fillRect(Math.round(cx - dx), Math.round(cy + dy), dx * 2 + 1, 1);
    }
  }
  function bands(cols, y0, y1) { const h = (y1 - y0) / cols.length; cols.forEach((c, i) => R(0, y0 + i * h, W, Math.ceil(h) + 1, c)); }
  function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const f = (v) => Math.max(0, Math.min(255, Math.round(v * (1 + amt))));
    return 'rgb(' + f(n >> 16) + ',' + f((n >> 8) & 255) + ',' + f(n & 255) + ')';
  }
  function bld(cx, cy, w, h, wall, roof, win) {
    const x = cx - w / 2, y = cy - h / 2;
    R(x, y, w, h, wall);
    R(x - 1, y - 4, w + 2, Math.ceil(h * 0.55), roof);
    R(x - 1, y - 5 + Math.ceil(h * 0.55), w + 2, 1, '#00000055');
    R(cx - 1.5, y + h - 5, 3, 5, '#1c1410');
    if (win) { R(x + 3, y + h - 7, 3, 3, win); R(x + w - 6, y + h - 7, 3, 3, win); }
  }
  function tree(x, y, c1, c2) { disc(x, y, 7, c1); disc(x - 2, y - 2, 4, c2); }
  function interior(wall, wall2, floor, floor2) {
    R(0, 0, W, 120, wall);
    for (let x = 0; x < W; x += 18) R(x, 0, 1, 120, wall2);
    R(0, 114, W, 6, wall2);
    R(0, 120, W, 60, floor);
    for (let y = 126; y < H; y += 8) R(0, y, W, 1, floor2);
  }
  function win(x, y, w, h, glass, frame) {
    R(x, y, w, h, frame); R(x + 2, y + 2, w - 4, h - 4, glass);
    R(x + w / 2 - 0.5, y + 2, 1, h - 4, frame); R(x + 2, y + h / 2, w - 4, 1, frame);
  }
  function fire(x, y, w, t) {
    const f = Math.floor(t / 160) % 3;
    R(x, y - 10 - f, w, 10 + f, '#d9622a'); R(x + w * 0.25, y - 7, w * 0.5, 7, '#f2c04a');
  }
  function glow(x, y, r, rgb) { for (let i = 3; i >= 1; i--) disc(x, y, Math.round(r * i / 3), 'rgba(' + rgb + ',0.07)'); }

  function drawMap(night, t) {
    const P = night
      ? { g: '#1b2029', g2: '#20262f', path: '#34303a', wall: '#3a3846', roof: '#24202a', tree: '#0f1616', tree2: '#141d1c', win: '#0b0b10', field: '#26261e' }
      : { g: '#6f7d4c', g2: '#67754a', path: '#a58e60', wall: '#c2ab84', roof: '#7a3f2c', tree: '#2f4a2a', tree2: '#3d5c35', win: '#3a2e22', field: '#8a7a3a' };
    R(0, 0, W, H, P.g);
    const r = rng(7);
    for (let i = 0; i < 220; i++) R(Math.floor(r() * W), Math.floor(r() * H), 2, 1, P.g2);
    // roads
    R(30, 103, 270, 6, P.path); R(157, 62, 6, 42, P.path); R(227, 62, 6, 42, P.path);
    R(61, 92, 6, 12, P.path); R(42, 52, 6, 52, P.path); R(259, 96, 6, 8, P.path);
    for (let i = 0; i < 7; i++) R(38 - i * 3, 46 - i * 3, 3, 3, P.path);
    // fields by the farm
    for (let i = 0; i < 6; i++) R(238, 116 + i * 6, 64, 2, P.field);
    // town square + well
    disc(144, 120, 10, P.path); disc(144, 120, 3, night ? '#2a2a33' : '#7d8a99');
    // woods
    [[6, 8], [18, 4], [30, 12], [8, 30], [34, 26], [4, 46], [22, 40], [44, 4], [60, 8], [300, 10], [312, 26], [290, 4],
      [118, 8], [100, 4], [196, 6], [306, 150], [8, 160], [22, 172], [294, 172], [110, 156], [200, 164], [80, 170]]
      .forEach(([x, y]) => tree(x, y, P.tree, P.tree2));
    // buildings
    bld(160, 54, 24, 16, P.wall, P.roof, P.win);
    R(157, 30, 6, 18, P.wall); R(156, 26, 8, 5, P.roof);
    R(159, 18, 2, 8, night ? '#6a6458' : '#e8e0c4'); R(157, 20, 6, 2, night ? '#6a6458' : '#e8e0c4');
    bld(230, 54, 30, 16, P.wall, P.roof, P.win);
    bld(45, 44, 14, 10, P.wall, P.roof, P.win);
    bld(64, 86, 26, 14, P.wall, P.roof, P.win); R(79, 88, 5, 3, night ? '#3a3020' : '#c99a3a');
    bld(262, 90, 22, 14, night ? '#3a2228' : '#8a3a2c', P.roof, P.win);
    bld(110, 80, 14, 10, P.wall, P.roof, P.win); bld(200, 84, 14, 10, P.wall, P.roof, P.win);
    bld(100, 128, 16, 10, P.wall, P.roof, P.win); bld(190, 134, 16, 10, P.wall, P.roof, P.win);
    // the shack, swallowed by vines
    bld(20, 24, 13, 9, night ? '#2a2420' : '#5a4a36', night ? '#16201a' : '#2e4a26', null);
    R(14, 22, 2, 7, P.tree2); R(25, 21, 2, 8, P.tree2); R(18, 19, 5, 2, P.tree2);
    if (night) {
      glow(19, 26, 12, '255,30,30');
      R(17, 25, 3, 2, (Math.floor(t / 900) % 2) ? '#ff3a3a' : '#c42a2a');
      for (let i = 0; i < 5; i++) {
        const x = ((i * 67 + t * 0.018 * (i % 2 ? 1 : -1)) % W + W) % W;
        R(x, 98 + ((i * 13) % 60), 3, 2, '#000000');
      }
    } else {
      R(17, 25, 3, 2, '#1a1a1a');
      const cols = ['#3a4a5a', '#5a3550', '#4a3a2a', '#556b4a'];
      for (let i = 0; i < 4; i++) {
        const x = 40 + ((i * 71 + t * 0.008) % 240);
        R(x, 104 + (i % 2) * 2, 2, 3, cols[i]);
      }
    }
  }

  const BG = {
    // photo backgrounds (assets/bg_street.png etc.) fall back to these drawings if the file is missing
    street: (t) => BG.square(t),
    parsonage: (t) => BG.house(t),
    nama: (t) => BG.house(t),
    town_day: (t) => drawMap(false, t),
    town_night: (t) => drawMap(true, t),
    title: (t) => { drawMap(true, t); R(0, 0, W, H, 'rgba(6,4,12,0.35)'); },
    memory: () => {
      R(0, 0, W, H, '#0b0507');
      for (let i = 0; i < 6; i++) disc(160, 90, 150 - i * 22, 'rgba(110,0,10,0.08)');
      ghost(240, 40, 1.1, 0.85);
    },
    church: () => {
      interior('#4a3a2c', '#3e3024', '#3a2c20', '#30241a');
      win(36, 18, 22, 52, '#b8c4cf', '#2e241a'); win(262, 18, 22, 52, '#b8c4cf', '#2e241a');
      R(158, 16, 4, 34, '#c9b98a'); R(149, 25, 22, 4, '#c9b98a');
      for (let i = 0; i < 3; i++) { R(14, 132 + i * 15, 116, 6, '#5a3a22'); R(190, 132 + i * 15, 116, 6, '#5a3a22'); }
      R(262, 88, 30, 32, '#5a3a22'); R(258, 84, 38, 5, '#6a4a2a');
    },
    inn: (t) => {
      interior('#6a4a32', '#5a3e2a', '#4a3524', '#3e2c1e');
      R(16, 58, 64, 62, '#5c5a58'); R(28, 80, 40, 40, '#1a1210'); fire(36, 120, 24, t);
      R(10, 54, 76, 6, '#4a4846');
      R(110, 128, 50, 6, '#7a5232'); R(114, 134, 4, 20, '#5a3a22'); R(152, 134, 4, 20, '#5a3a22');
      R(206, 128, 50, 6, '#7a5232'); R(210, 134, 4, 20, '#5a3a22'); R(248, 134, 4, 20, '#5a3a22');
      for (let i = 0; i < 2; i++) { R(282, 92 + i * 0, 26, 28, '#6a4428'); R(282, 98, 26, 2, '#3a2a1a'); R(282, 112, 26, 2, '#3a2a1a'); }
      R(158, 26, 6, 9, '#f2c04a'); glow(161, 30, 16, '242,192,74');
    },
    farm: () => {
      bands(['#9fb0bd', '#aebcc4', '#bcc6c8', '#c9cec8'], 0, 92);
      disc(60, 120, 50, '#6a7848'); disc(220, 126, 70, '#66744a');
      R(0, 100, W, 80, '#7d6a42');
      for (let y = 106; y < H; y += 7) R(0, y, W, 2, '#6a5836');
      R(200, 46, 84, 70, '#8a3a2c'); R(194, 36, 96, 14, '#4a2a20'); R(232, 76, 20, 40, '#4a2a20'); R(241, 76, 2, 40, '#2a1a14');
      for (let x = 0; x < 190; x += 12) R(x, 112, 2, 14, '#5a4a32');
      R(0, 115, 190, 2, '#5a4a32');
    },
    square: () => {
      bands(['#a9b6bf', '#b6c0c4', '#c3c9c6'], 0, 60);
      const cols = ['#b9a27c', '#a89270', '#c2ab84', '#9e8a6a', '#b39c78', '#a8936f'];
      for (let i = 0; i < 6; i++) {
        const x = i * 54 - 4;
        R(x, 40 + (i % 2) * 6, 52, 80, cols[i]); R(x - 2, 32 + (i % 2) * 6, 56, 10, '#7a3f2c');
        R(x + 10, 60, 10, 12, '#3a2e22'); R(x + 32, 60, 10, 12, '#3a2e22'); R(x + 20, 96, 12, 24, '#3a2a1e');
      }
      R(0, 120, W, 60, '#7d7468');
      for (let y = 124; y < H; y += 6) for (let x = (y % 12); x < W; x += 12) R(x, y, 8, 1, '#6a6258');
      R(136, 100, 48, 24, '#77777e'); R(136, 100, 48, 3, '#8a8a92'); R(138, 70, 3, 30, '#4a3a2a'); R(179, 70, 3, 30, '#4a3a2a'); R(134, 66, 52, 5, '#5a3a22');
    },
    house: (t) => {
      interior('#5a4448', '#4c383c', '#3e2e26', '#33251e');
      R(80, 140, 160, 30, '#7a2a2a'); R(84, 144, 152, 22, '#8e3a34');
      R(140, 22, 40, 48, '#3a2a14'); R(144, 26, 32, 40, '#6a5a4a'); disc(160, 40, 7, '#c8a888'); R(150, 50, 20, 16, '#2a2a33');
      win(250, 26, 40, 44, '#9fb0bd', '#3a2a1e');
      R(24, 118, 56, 6, '#5a3a22'); R(50, 106, 3, 12, '#efe6cc'); R(50, 103 - (Math.floor(t / 200) % 2), 3, 3, '#f2c04a');
    },
    cottage: (t) => {
      interior('#6a5638', '#5c4a30', '#4e3e2a', '#423422');
      R(222, 58, 72, 62, '#6a6460'); R(234, 80, 48, 40, '#1a1210'); fire(244, 120, 28, t);
      for (let i = 0; i < 11; i++) { const l = 14 + ((i * 7) % 10); R(18 + i * 16, 0, 1, l, '#3a2a1a'); R(15 + i * 16, l, 7, 9, i % 2 ? '#5a7a3a' : '#7a8a4a'); }
      R(20, 70, 70, 4, '#4a3a22'); for (let i = 0; i < 5; i++) R(24 + i * 13, 60, 8, 10, ['#7a9a8a', '#a07a5a', '#8a8a5a', '#9a6a6a', '#6a8aa0'][i]);
      R(120, 118, 34, 6, '#5a3a22'); R(122, 124, 4, 22, '#4a2e1a'); R(148, 124, 4, 22, '#4a2e1a');
    },
    shack: (t) => {
      interior('#2a2018', '#221a14', '#1e1812', '#18130e');
      for (let i = 0; i < 14; i++) { const l = 12 + ((i * 5) % 14); R(10 + i * 22, 0, 1, l, '#1a120c'); R(7 + i * 22, l, 7, 10, '#2f4426'); }
      R(36, 116, 90, 8, '#3a2a1c'); R(40, 124, 4, 30, '#2a1e14'); R(118, 124, 4, 30, '#2a1e14'); R(60, 110, 20, 6, '#d8cfa8');
      R(192, 52, 12, 16, '#2a1a14'); R(194, 55, 8, 10, (Math.floor(t / 700) % 2) ? '#ff3a3a' : '#e02a2a'); glow(198, 60, 48, '255,40,40');
    },
    clearing: (t) => {
      bands(['#07080e', '#0b0d16', '#10121c', '#141624'], 0, 120);
      disc(262, 24, 8, '#d8d4c4'); disc(259, 22, 8, '#10121c');
      for (let i = 0; i < 9; i++) { const x = i * 40 + (i % 2) * 12; R(x + 8, 30, 6, 100, '#05070a'); disc(x + 11, 34, 16, '#05070a'); }
      R(0, 118, W, 62, '#121410');
      disc(160, 150, 26, '#2a2622'); disc(160, 150, 18, '#1a1612');
      R(180, 138, 16, 12, '#2a2a2e'); R(182, 138, 12, 2, '#5a1a1a');
      if (Math.floor(t / 500) % 3 === 0) R(158, 146, 2, 2, '#7a2a1a');
    },
    study: (t) => {
      interior('#2a2230', '#221c28', '#1c1820', '#16131a');
      R(18, 18, 74, 100, '#3a2a1e');
      for (let s = 0; s < 4; s++) for (let b = 0; b < 9; b++) R(22 + b * 7, 22 + s * 24, 5, 18, ['#5a2a2a', '#2a3a5a', '#4a4a2a', '#3a2a4a'][(b + s) % 4]);
      R(150, 110, 130, 10, '#3a2a1c'); R(156, 120, 4, 34, '#2a1e14'); R(270, 120, 4, 34, '#2a1e14');
      R(168, 104, 16, 6, '#d8d0b8'); R(188, 105, 14, 5, '#cfc6ac'); R(206, 103, 16, 7, '#d8d0b8');
      R(250, 98, 3, 12, '#efe6cc'); R(250, 95 - (Math.floor(t / 220) % 2), 3, 3, '#f2c04a'); glow(251, 98, 30, '242,192,74');
    },
    barn: () => {
      interior('#2a1e18', '#221812', '#1e1a10', '#18140c');
      R(0, 28, W, 5, '#1a120c'); R(0, 70, W, 4, '#1a120c');
      win(140, 34, 32, 26, '#0b0d16', '#1a120c'); disc(150, 42, 3, '#d8d4c4');
      disc(56, 146, 32, '#4a3e1c'); disc(266, 152, 38, '#4a3e1c'); disc(60, 140, 22, '#5a4a22');
    },
    courtroom: () => {
      interior('#3a2620', '#30201a', '#2a1e18', '#221812');
      R(98, 62, 124, 58, '#4a2e20'); R(94, 58, 132, 6, '#5a3a26');
      disc(160, 34, 13, '#8a6a2a'); disc(160, 34, 10, '#4a2e20'); R(158, 26, 4, 16, '#8a6a2a');
      for (let x = 6; x < W; x += 14) disc(x, 132 + (x % 3), 6, '#120c0a');
      R(0, 140, W, 4, '#5a3a26'); for (let x = 0; x < W; x += 20) R(x, 144, 3, 36, '#5a3a26');
    },
    jail: () => {
      R(0, 0, W, 130, '#3a3a40');
      for (let y = 0; y < 130; y += 12) { R(0, y, W, 1, '#2a2a30'); for (let x = (y / 12) % 2 ? 0 : 12; x < W; x += 24) R(x, y, 1, 12, '#2a2a30'); }
      R(0, 130, W, 50, '#2a2622');
      win(150, 20, 22, 18, '#0b0d16', '#1a1a1e');
    }
  };

  /* ---------------- characters (placeholder pixel art) ---------------- */
  function hair(cx, top, L) {
    const c = L.hair, d = shade(L.hair, -0.3);
    switch (L.style) {
      case 'hat':
        R(cx - 9, top, 18, 3, c); R(cx - 10, top + 3, 2, 6, c); R(cx + 8, top + 3, 2, 6, c);
        R(cx - 15, top - 2, 30, 3, '#121014'); R(cx - 9, top - 13, 18, 12, '#121014'); R(cx - 9, top - 5, 18, 2, '#3a3226');
        break;
      case 'bonnet':
        R(cx - 11, top - 3, 22, 7, c); R(cx - 11, top + 4, 3, 12, c); R(cx + 8, top + 4, 3, 12, c); R(cx - 11, top - 3, 22, 1, d);
        break;
      case 'long':
        R(cx - 10, top - 2, 20, 6, c); R(cx - 11, top + 2, 4, 26, c); R(cx + 7, top + 2, 4, 26, c); R(cx - 9, top + 4, 7, 2, c);
        break;
      case 'short':
        R(cx - 10, top - 2, 20, 5, c); R(cx - 10, top + 3, 2, 5, c); R(cx + 8, top + 3, 2, 5, c);
        break;
      case 'wrap':
        R(cx - 11, top - 10, 22, 12, c); R(cx - 6, top - 14, 12, 5, c); R(cx - 11, top - 3, 22, 2, d); R(cx + 5, top - 14, 6, 5, d);
        break;
      case 'wig':
        R(cx - 12, top - 3, 24, 6, c);
        for (let i = 0; i < 4; i++) { R(cx - 14, top + 2 + i * 5, 5, 5, c); R(cx + 9, top + 2 + i * 5, 5, 5, c); }
        R(cx - 12, top - 3, 24, 1, d);
        break;
    }
  }
  function face(cx, top, mood) {
    const E = '#1a1414', ey = top + 8;
    if (mood === 'scared') {
      R(cx - 6, ey - 1, 4, 4, '#f4f0e8'); R(cx + 2, ey - 1, 4, 4, '#f4f0e8');
      R(cx - 5, ey, 2, 2, E); R(cx + 3, ey, 2, 2, E);
      R(cx - 1, top + 13, 3, 3, E); R(cx + 10, top + 2, 2, 3, '#9ad0ff');
    } else if (mood === 'angry') {
      R(cx - 7, ey - 3, 2, 1, E); R(cx - 5, ey - 2, 2, 1, E); R(cx + 5, ey - 3, 2, 1, E); R(cx + 3, ey - 2, 2, 1, E);
      R(cx - 5, ey, 2, 2, E); R(cx + 3, ey, 2, 2, E); R(cx - 3, top + 14, 6, 1, E);
    } else if (mood === 'sad') {
      R(cx - 6, ey - 2, 2, 1, E); R(cx - 4, ey - 3, 2, 1, E); R(cx + 2, ey - 3, 2, 1, E); R(cx + 4, ey - 2, 2, 1, E);
      R(cx - 5, ey + 1, 2, 1, E); R(cx + 3, ey + 1, 2, 1, E);
      R(cx - 2, top + 14, 4, 1, E); R(cx - 3, top + 15, 1, 1, E); R(cx + 2, top + 15, 1, 1, E);
    } else {
      R(cx - 5, ey, 2, 2, E); R(cx + 3, ey, 2, 2, E); R(cx - 2, top + 14, 4, 1, '#7a3a30');
    }
  }
  function person(cx, L, mood, id) {
    const top = 62, dark = shade(L.robe, -0.4);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(cx - 26, H - 4, 52, 4);
    R(cx - 10, top - 1, 20, 20, '#0a0808');
    for (let r = 0; r <= H - (top + 20); r++) { const w = Math.round(24 + r * 0.32) + 2; R(cx - w / 2, top + 20 + r, w, 1, '#0a0808'); }
    for (let r = 0; r <= H - (top + 20); r++) {
      const w = Math.round(24 + r * 0.32);
      R(cx - w / 2, top + 20 + r, w, 1, L.robe); R(cx + w / 2 - 3, top + 20 + r, 3, 1, dark);
    }
    R(cx - 15, top + 28, 3, 36, dark); R(cx + 12, top + 28, 3, 36, dark);
    R(cx - 16, top + 62, 4, 4, L.skin); R(cx + 12, top + 62, 4, 4, L.skin);
    if (L.style !== 'wrap') R(cx - 7, top + 20, 14, 5, '#ece6d6');
    if (id === 'detective') { R(cx - 1, top + 28, 2, 8, '#d4b04a'); R(cx - 3, top + 30, 6, 2, '#d4b04a'); }
    R(cx - 3, top + 17, 6, 4, shade(L.skin, -0.15));
    R(cx - 9, top, 18, 18, L.skin);
    hair(cx, top, L);
    face(cx, top, mood);
  }
  function drawChar(id, cx, mood, dim) {
    const ch = S.characters[id];
    if (!ch) return;
    if (dim) ctx.filter = 'brightness(0.45)';
    const img = IMG['char_' + id + '_' + mood] || IMG['char_' + id + '_neutral'] || (id === 'detective' ? IMG.detective : null);
    if (img) {
      const h = 130, w = img.width * (h / img.height);
      ctx.drawImage(img, Math.round(cx - w / 2), H - h, Math.round(w), h);
    } else {
      person(cx, ch.look, mood, id);
    }
    ctx.filter = 'none';
  }
  // The detective's hallucination: a horned silhouette
  function ghost(cx, top, scale, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(cx, top); ctx.scale(scale, scale);
    const c = '#000000';
    for (let r = 0; r < 110; r++) { const w = Math.round(22 + r * 0.3); R(-w / 2, 20 + r, w, 1, c); }
    R(-9, 0, 18, 20, c);
    R(-9, -6, 3, 6, c); R(-11, -11, 3, 6, c); R(6, -6, 3, 6, c); R(8, -11, 3, 6, c);
    R(-5, 8, 2, 1, '#ff2a2a'); R(3, 8, 2, 1, '#ff2a2a');
    ctx.restore();
  }

  /* ---------------- scene view + effects ---------------- */
  const view = { bg: 'title', show: [], moods: {}, speaking: null };
  const fx = { shadow: 0, red: 0, toss: null };

  function render(t) {
    ctx.filter = 'none'; ctx.globalAlpha = 1;
    // Photo backgrounds sit in a full-resolution <img> behind the canvas, so they keep their own detail and colors.
    const bgImg = IMG['bg_' + view.bg];
    const bgEl = $('bgimg');
    if (bgImg && bgEl) {
      if (bgEl.dataset.k !== view.bg) { bgEl.src = bgImg.src; bgEl.dataset.k = view.bg; }
      bgEl.hidden = false;
      ctx.clearRect(0, 0, W, H);
    } else {
      if (bgEl) bgEl.hidden = true;
      if (bgImg) ctx.drawImage(bgImg, 0, 0, W, H); else (BG[view.bg] || BG.town_day)(t);
    }

    const n = view.show.length;
    const xs = n === 1 ? [160] : n === 2 ? [100, 220] : [70, 160, 250];
    view.show.forEach((id, i) => {
      const dim = view.speaking && view.speaking !== 'narrator' && view.speaking !== id;
      drawChar(id, xs[i] || 160, view.moods[id] || 'neutral', dim);
    });

    // atmosphere: drifting dust/embers + vignette
    const night = /night|clearing|shack|memory|study|barn|title/.test(view.bg);
    for (let i = 0; i < 18; i++) {
      const px = (i * 53 + t * (0.006 + (i % 3) * 0.004)) % W;
      const py = (i * 37 + Math.sin(t / 900 + i) * 6 + (night ? 0 : t * 0.003)) % H;
      R(px, py, 1, 1, night ? 'rgba(255,90,60,0.35)' : 'rgba(255,240,200,0.25)');
    }
    for (let i = 0; i < 6; i++) {
      const a = 0.05 + i * 0.025;
      ctx.fillStyle = 'rgba(0,0,0,' + a + ')';
      ctx.fillRect(0, i * 2, W, 2); ctx.fillRect(0, H - (i + 1) * 2, W, 2);
      ctx.fillRect(i * 3, 0, 3, H); ctx.fillRect(W - (i + 1) * 3, 0, 3, H);
    }
    if (state && state.hyst >= 70 && !/title|memory/.test(view.bg)) {
      R(0, 0, W, H, 'rgba(120,0,10,' + (0.04 + 0.03 * Math.sin(t / 400)).toFixed(3) + ')');
    }

    if (view.bg === 'jail') {
      for (let x = 8; x < W; x += 24) R(x, 0, 4, H, '#141418');
      R(0, 18, W, 4, '#141418'); R(0, 150, W, 4, '#141418');
    }

    if (fx.shadow) {
      const e = t - fx.shadow;
      const on = reduceMotion ? e < 700 : (e < 260 || (e > 520 && e < 860));
      if (on) {
        if (view.bg === 'town_night') ghost(34, 14, 0.32, 0.95);
        else if (view.bg === 'town_day') ghost(178, 84, 0.3, 0.9);
        else ghost(250, 50, 0.9, 0.9);
      }
      if (e > 900) fx.shadow = 0;
    }
    if (fx.red) {
      const a = Math.max(0, 0.55 * (1 - (t - fx.red) / 900));
      R(0, 0, W, H, 'rgba(150,10,20,' + a.toFixed(3) + ')');
      if (a <= 0) fx.red = 0;
    }
    if (fx.toss) {
      const e = (t - fx.toss.start) / 1000;
      fx.toss.papers.forEach((p) => {
        const x = p.x + p.vx * e, y = p.y + p.vy * e + 140 * e * e;
        if (y < H + 10) { R(x, y, 7, 9, '#ece4cc'); R(x + 1, y + 2, 5, 1, '#8a8070'); R(x + 1, y + 5, 4, 1, '#8a8070'); }
      });
      if (e > 2.6) fx.toss = null;
    }
    requestAnimationFrame(render);
  }

  function runFx(name) {
    const now = performance.now();
    if (name === 'shadow') { fx.shadow = now; return sleep(950); }
    if (name === 'red') { fx.red = now; return sleep(reduceMotion ? 200 : 700); }
    if (name === 'shake') {
      if (!reduceMotion) { stage.classList.add('shake'); setTimeout(() => stage.classList.remove('shake'), 420); }
      return sleep(300);
    }
    if (name === 'toss') {
      const r = rng(Math.floor(now) % 1000 + 3);
      const papers = [];
      for (let i = 0; i < 16; i++) papers.push({ x: 160, y: 96, vx: -40 + r() * 140, vy: -120 - r() * 90 });
      fx.toss = { start: now, papers };
      return sleep(2400);
    }
    return Promise.resolve();
  }

  /* ---------------- music: files in assets/ win, otherwise a tiny synth ---------------- */
  const PATTERNS = {
    day:    { notes: [57, null, 60, 64, null, 62, 60, null, 64, 67, null, 64], ms: 430, wave: 'sine', vol: 0.05 },
    night:  { notes: [45, null, null, 52, null, 55, null, null, 52, null, 48, null], ms: 460, wave: 'triangle', vol: 0.06 },
    trial:  { notes: [38, null, 38, null, 41, null, 38, null, 45, null, 44, null], ms: 400, wave: 'triangle', vol: 0.07 },
    ending: { notes: [60, 64, 67, 72, 67, 64, 65, 69, 72, 77, 72, 69], ms: 190, wave: 'square', vol: 0.025 }
  };
  const Music = {
    ac: null, master: null, mode: null, detune: false, timer: null, el: null, step: 0,
    unlock() {
      try {
        if (!this.ac) {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (!AC) return;
          this.ac = new AC();
          this.master = this.ac.createGain();
          this.master.gain.value = prefs.muted ? 0 : 1;
          this.master.connect(this.ac.destination);
        }
        if (this.ac.state === 'suspended') this.ac.resume();
      } catch (e) { /* no audio */ }
    },
    set(mode) {
      if (mode === 'detune') { this.detune = true; return; }
      if (mode === this.mode) return;
      this.detune = false;
      this.stop();
      this.mode = mode;
      if (!mode) return;
      this.startSynth(mode);
      try {
        const el = new Audio('assets/music_' + mode + '.mp3');
        el.loop = true; el.volume = prefs.muted ? 0 : 0.6;
        el.play().then(() => {
          if (this.mode !== mode) { el.pause(); return; }
          clearInterval(this.timer); this.timer = null; this.el = el;
        }).catch(() => { /* no file: keep the synth */ });
      } catch (e) { /* ignore */ }
    },
    stop() {
      clearInterval(this.timer); this.timer = null;
      if (this.el) { this.el.pause(); this.el = null; }
    },
    startSynth(mode) {
      const P = PATTERNS[mode];
      if (!P || !this.ac) return;
      this.step = 0;
      const tick = () => {
        const n = P.notes[this.step % P.notes.length];
        this.step++;
        if (n != null && !prefs.muted) this.note(n, P);
      };
      tick();
      this.timer = setInterval(tick, P.ms);
    },
    note(midi, P) {
      try {
        const ac = this.ac, t = ac.currentTime, len = P.ms / 1000;
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = P.wave;
        o.frequency.value = 440 * Math.pow(2, (midi - 69) / 12);
        if (this.detune && this.step % 2 === 0) o.detune.value = 48; // the out-of-tune moment
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(P.vol, t + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, t + len * 1.6);
        o.connect(g); g.connect(this.master);
        o.start(t); o.stop(t + len * 1.7);
      } catch (e) { /* ignore */ }
    },
    setMuted(m) {
      if (this.master) this.master.gain.value = m ? 0 : 1;
      if (this.el) this.el.volume = m ? 0 : 0.6;
    }
  };

  /* ---------------- UI primitives ---------------- */
  let advance = null;      // called when the player clicks / presses Space
  let choiceKeys = null;   // number-key handler while choices are showing
  let journalClose = null;

  function say(spk, text, mood, quoteKey) {
    return new Promise((resolve) => {
      const dlg = $('dialog');
      dlg.hidden = false;
      const name = spk === 'detective' ? 'You' : nameOf(spk);
      $('speaker').textContent = name;
      $('speaker').hidden = !name;
      dlg.className = spk === 'narrator' ? 'narrator' : '';
      const q = quoteKey && S.quotes[quoteKey];
      if (q) dlg.classList.add('quote');
      $('cite').textContent = q ? '— The Crucible, ' + q.cite : '';
      $('cite').hidden = !q;
      if (S.characters[spk] && view.show.includes(spk)) view.moods[spk] = mood || 'neutral';
      view.speaking = spk;

      const tEl = $('text');
      const full = String(text);
      let i = 0, done = false, timer = null;
      $('more').hidden = true;
      const finish = () => { clearInterval(timer); tEl.textContent = full; done = true; $('more').hidden = false; };
      if (reduceMotion || !SET.textSpeed) finish();
      else {
        tEl.textContent = '';
        timer = setInterval(() => { i += 1; tEl.textContent = full.slice(0, i); if (i >= full.length) finish(); }, SET.textSpeed);
      }
      advance = () => { if (!done) { finish(); return; } advance = null; resolve(); };
    });
  }

  function choose(opts, grid) {
    return new Promise((res) => {
      const box = $('choices');
      box.innerHTML = '';
      box.classList.toggle('grid', !!grid);
      box.hidden = false;
      const pick = (i) => { box.hidden = true; box.innerHTML = ''; choiceKeys = null; res(i); };
      opts.forEach((o, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'choice ' + (o.cls || '');
        b.disabled = !!o.disabled;
        b.innerHTML = '<span class="key">' + (i < 9 ? i + 1 : '') + '</span><span class="lbl">' + esc(o.label) +
          (o.sub ? '<span class="sub">' + esc(o.sub) + '</span>' : '') + '</span>';
        b.addEventListener('click', (e) => { e.stopPropagation(); pick(i); });
        box.appendChild(b);
      });
      choiceKeys = (k) => { const i = parseInt(k, 10) - 1; if (i >= 0 && i < opts.length && !opts[i].disabled) pick(i); };
    });
  }

  function card(c) {
    return new Promise((res) => {
      const el = $('card');
      const q = c.quote && S.quotes[c.quote];
      el.innerHTML = '<div class="card-inner"><h2 class="card-title">' + esc(c.title) + '</h2>' +
        (q ? '<blockquote>“' + esc(q.text) + '”</blockquote><p class="cite">— <i>The Crucible</i>, ' + esc(q.cite) + '</p>' : '') +
        '<p class="hint">Click or press Space</p></div>';
      $('dialog').hidden = true;
      el.hidden = false;
      const done = () => { el.hidden = true; el.onclick = null; advance = null; res(); };
      el.onclick = (e) => { e.stopPropagation(); done(); };
      advance = done;
    });
  }

  function charCard(id) {
    return new Promise((res) => {
      const ch = S.characters[id], el = $('charcard');
      el.innerHTML = '<div class="panel cc">' +
        '<p class="eyebrow">New person</p><h2>' + esc(ch.name) + '</h2>' +
        (ch.basedOn ? '<p class="based">Based on ' + esc(ch.basedOn) + '</p>' : '') +
        '<div class="chips">' + ch.themes.map((t) => '<span class="chip">' + esc(t) + '</span>').join('') + '</div>' +
        '<dl><dt>Personality</dt><dd>' + esc(ch.card.personality) + '</dd>' +
        '<dt>Motive</dt><dd>' + esc(ch.card.motive) + '</dd>' +
        '<dt>Relationships</dt><dd>' + esc(ch.card.relationships) + '</dd>' +
        (ch.card.approach ? '<dt>Town gossip</dt><dd>' + esc(ch.card.approach) + '</dd>' : '') + '</dl>' +
        '<button type="button" class="btn primary" id="cc-go">Talk to ' + esc(ch.name.split(' ')[0]) + '</button></div>';
      $('dialog').hidden = true;
      el.hidden = false;
      const done = () => { el.hidden = true; advance = null; res(); };
      $('cc-go').addEventListener('click', (e) => { e.stopPropagation(); done(); });
      $('cc-go').focus({ preventScroll: true });
      advance = done;
    });
  }

  function effBanner(eff) {
    return new Promise((res) => {
      const el = $('eff');
      el.textContent = S.effectiveness[eff] || eff;
      el.className = 'eff-' + eff;
      el.hidden = false;
      let closed = false;
      const done = () => { if (closed) return; closed = true; el.hidden = true; advance = null; res(); };
      advance = done;
      setTimeout(done, 1600);
    });
  }

  function toast(html) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = html;
    $('toasts').appendChild(t);
    setTimeout(() => t.classList.add('out'), 3000);
    setTimeout(() => t.remove(), 3500);
  }

  // Presenter notes were removed (they gave the game away); calls are kept as no-ops.
  function note() {}

  /* ---------------- game state changes ---------------- */
  function updateHUD() {
    if (!state) return;
    const labels = { intro: 'ARRIVAL', day: 'DAY ' + state.day, meeting: 'TOWN MEETING', night: 'NIGHT', trial: 'THE TRIAL', end: 'THE END' };
    $('hud-day').textContent = labels[state.phase] || '';
    $('hud-hours').textContent = state.phase === 'day' ? state.hours + (state.hours === 1 ? ' hour left' : ' hours left') : '';
    $('meter-fill').style.width = state.hyst + '%';
    $('meter-floor').style.left = state.floor + '%';
    $('meter-pct').textContent = state.hyst + '%';
    $('meter').setAttribute('aria-valuenow', state.hyst);
    const avail = availableConnections().length;
    $('btn-journal').classList.toggle('pulse', avail > 0);
    $('btn-journal').textContent = avail > 0 ? 'Journal (' + avail + ' new)' : 'Journal';
  }
  function setHyst(v, quiet) {
    const before = state.hyst;
    const want = Math.round(v) - before;
    if (!quiet && want > 0) state.fear += want;
    if (!quiet && want < 0) state.calm += -want;
    state.hyst = Math.max(state.floor, Math.min(100, Math.round(v)));
    if (!quiet && want !== 0) {
      const applied = state.hyst - before;
      toast('<span class="tag ' + (want > 0 ? 't-testimony shocking' : 't-fact') + '">HYSTERIA ' + (want > 0 ? '+' : '') + want + '%</span> ' +
        (want < 0 && applied === 0 ? 'You calmed some people, but the panic has a floor.' : (want > 0 ? 'Rumors spread.' : 'A few people breathe easier.')));
    }
    (SET.thresholds || []).forEach(([lvl, msg]) => {
      if (state.hyst >= lvl && !state.crossed[lvl]) { state.crossed[lvl] = true; toast('<span class="tag shocking">TOWN</span> ' + esc(msg)); }
    });
    if (state.hyst !== before) {
      const m = $('meter');
      m.classList.remove('up', 'down');
      void m.offsetWidth;
      m.classList.add(state.hyst > before ? 'up' : 'down');
    }
    updateHUD();
  }
  function raiseFloor(f) { state.floor = Math.max(state.floor, f); setHyst(state.hyst, true); }

  function availableConnections() {
    if (!state) return [];
    return Object.keys(S.inferences).filter((id) =>
      !state.evidence.includes(id) &&
      S.inferences[id].needs.every((group) => group.some((e) => state.evidence.includes(e))));
  }
  function addEvidence(id) {
    if (state.evidence.includes(id)) return;
    state.evidence.push(id);
    const ev = getEv(id);
    toast('<span class="tag t-' + ev.type + (ev.shocking ? ' shocking' : '') + '">' + typeLabel(ev) + '</span> ' + esc(ev.text));
    availableConnections().forEach((inf) => {
      if (state.notified[inf]) return;
      state.notified[inf] = true;
      toast('<span class="tag t-inference">IDEA</span> Two clues fit together. Open your Journal (J) to connect them.');
    });
    updateHUD();
  }
  function reportFor(id) {
    const ev = getEv(id);
    const base = ev.type === 'inference' ? S.defaultReport.inference
      : ev.shocking ? S.defaultReport.shocking : S.defaultReport[ev.type];
    const o = ev.report || {};
    return { d: o.d != null ? o.d : base.d, line: o.line || base.line };
  }

  async function run(steps, vars) {
    for (const st of steps) {
      if (st.bg) view.bg = st.bg;
      if (st.show) { view.show = st.show.slice(); view.moods = {}; view.speaking = null; }
      if (st.music) Music.set(st.music);
      if (st.fx) await runFx(st.fx);
      if (st.evidence) addEvidence(st.evidence);
      if (st.hyst != null) setHyst(state.hyst + st.hyst);
      if (st.hystTo != null) { raiseFloor(st.hystTo); setHyst(st.hystTo, true); }
      if (st.note) note(st.note);
      if (st.card) await card(st.card);
      if (st.t) await say(st.s || 'narrator', fill(st.t, vars), st.mood, st.quote);
    }
  }

  /* ---------------- journal ---------------- */
  function openJournal(startTab) {
    return new Promise((res) => {
      const j = $('journal');
      let tab = startTab || (availableConnections().length ? 'connect' : 'evidence');
      note('journal');
      const close = () => { j.hidden = true; journalClose = null; res(); updateHUD(); };
      journalClose = close;
      const evItem = (id) => {
        const ev = getEv(id);
        return '<li><span class="tag t-' + ev.type + (ev.shocking ? ' shocking' : '') + '">' + typeLabel(ev) + '</span>' +
          '<span class="ev-text">' + esc(ev.text) + '</span><span class="from">' + esc(ev.from) +
          (state.reported.includes(id) ? ' · reported' : '') + '</span></li>';
      };
      const draw = () => {
        let body = '';
        if (tab === 'evidence') {
          const groups = [['fact', 'Facts'], ['testimony', 'Testimony (could be lies)'], ['inference', 'Connections']];
          body = groups.map(([type, title]) => {
            const ids = state.evidence.filter((id) => getEv(id).type === type);
            return '<h3>' + title + ' <span class="count">' + ids.length + '</span></h3>' +
              (ids.length ? '<ul class="ev">' + ids.map(evItem).join('') + '</ul>' : '<p class="empty">Nothing yet.</p>');
          }).join('');
        } else if (tab === 'connect') {
          const avail = availableConnections();
          body = '<p class="lede">When two clues fit together, connect them to form an inference. Reporting a connection calms the town more than anything else.</p>';
          body += avail.length ? avail.map((id) => {
            const parts = S.inferences[id].needs.map((g) => getEv(g.find((e) => state.evidence.includes(e))).text);
            return '<div class="connect"><p class="pair">' + parts.map((p) => '“' + esc(p) + '”').join('<b> + </b>') + '</p>' +
              '<button type="button" class="btn primary" data-inf="' + id + '">Connect these</button></div>';
          }).join('') : '<p class="empty">No clues fit together yet. Keep asking questions.</p>';
          const made = state.evidence.filter((id) => S.inferences[id]);
          if (made.length) body += '<h3>Made <span class="count">' + made.length + ' of ' + Object.keys(S.inferences).length + '</span></h3><ul class="ev">' + made.map(evItem).join('') + '</ul>';
        } else {
          const met = SUSPECTS.filter((id) => state.met[id]);
          body = met.length ? met.map((id) => {
            const ch = S.characters[id], chart = state.chart[id] || {};
            return '<div class="person"><h3>' + esc(ch.name) + ' <span class="based">' + esc(ch.basedOn) + '</span></h3>' +
              '<div class="chips">' + ch.themes.map((t) => '<span class="chip">' + esc(t) + '</span>').join('') + '</div>' +
              '<p>' + esc(ch.card.motive) + '</p>' + (ch.card.approach ? '<p><i>Gossip: ' + esc(ch.card.approach) + '</i></p>' : '') + '<div class="typechart">' +
              APPROACHES.map((a) => '<span class="tc ' + (chart[a] ? 'eff-' + chart[a] : '') + '">' + S.approaches[a].label + ': ' +
                (chart[a] ? chart[a].replace('false', 'super?') : '?') + '</span>').join('') + '</div></div>';
          }).join('') : '<p class="empty">You haven’t met anyone yet.</p>';
        }
        const nConn = availableConnections().length;
        j.innerHTML = '<div class="panel journal-panel" role="dialog" aria-label="Journal">' +
          '<div class="jhead"><h2>Journal</h2><button type="button" class="btn" id="j-close">Close (J)</button></div>' +
          '<div class="tabs">' +
          '<button type="button" class="tab' + (tab === 'evidence' ? ' on' : '') + '" data-tab="evidence">Evidence</button>' +
          '<button type="button" class="tab' + (tab === 'connect' ? ' on' : '') + '" data-tab="connect">Connect' + (nConn ? ' (' + nConn + ')' : '') + '</button>' +
          '<button type="button" class="tab' + (tab === 'people' ? ' on' : '') + '" data-tab="people">People</button></div>' +
          '<div class="jbody">' + body + '</div></div>';
        $('j-close').onclick = (e) => { e.stopPropagation(); close(); };
        j.querySelectorAll('[data-tab]').forEach((b) => { b.onclick = (e) => { e.stopPropagation(); tab = b.dataset.tab; draw(); }; });
        j.querySelectorAll('[data-inf]').forEach((b) => { b.onclick = (e) => { e.stopPropagation(); addEvidence(b.dataset.inf); save(); draw(); }; });
      };
      draw();
      j.hidden = false;
    });
  }

  /* ---------------- phases ---------------- */
  async function phaseIntro() {
    state.phase = 'intro'; save(); updateHUD();
    await run(S.scenes.intro);
    await startDay(1, true);
  }

  async function startDay(n, playIntro) {
    state.phase = 'day'; state.day = n; state.hours = SET.hoursPerDay;
    raiseFloor(n === 1 ? SET.floors.day1 : SET.floors.day2);
    save(); updateHUD();
    if (n === 2 && playIntro) await run(S.scenes.day2Intro);
    await mapLoop();
  }

  const topicsLeft = (id) => TOPICS.filter((tp) => !state.asked[id + ':' + tp]);

  function mapPick() {
    return new Promise((res) => {
      const m = $('map');
      $('dialog').hidden = true;
      m.innerHTML = '<p class="map-hint">Choose where to go. Each question costs one hour.</p>';
      S.locations.forEach((loc) => {
        const open = loc.people.some((id) => topicsLeft(id).length > 0);
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'loc';
        b.style.left = loc.x + '%';
        b.style.top = loc.y + '%';
        b.disabled = !open;
        b.innerHTML = esc(loc.name) + '<span class="sub">' +
          loc.people.map((id) => (state.met[id] ? esc(S.characters[id].name.split(' ').pop()) : '???')).join(' · ') + '</span>';
        b.addEventListener('click', (e) => { e.stopPropagation(); m.hidden = true; res(loc); });
        m.appendChild(b);
      });
      m.hidden = false;
    });
  }

  async function mapLoop() {
    note('map');
    while (state.hours > 0) {
      save(); updateHUD();
      view.bg = 'town_day'; view.show = []; view.speaking = null;
      const loc = await mapPick();
      await visit(loc);
    }
    view.show = [];
    await say('narrator', state.day === 1
      ? 'The sun drops behind the church steeple. Your time is up for today.'
      : 'The last light goes. The judge rides in at dawn.');
    await meeting();
  }

  async function visit(loc) {
    view.bg = loc.bg; view.show = [];
    let who = loc.people[0];
    if (loc.people.length > 1) {
      const opts = loc.people.map((id) => ({
        label: state.met[id] ? S.characters[id].name : 'Someone you haven’t met',
        sub: topicsLeft(id).length ? topicsLeft(id).length + ' question' + (topicsLeft(id).length > 1 ? 's' : '') + ' left' : 'Nothing more to ask',
        disabled: topicsLeft(id).length === 0
      }));
      opts.push({ label: 'Leave', sub: 'Back to the map' });
      $('dialog').hidden = true;
      const i = await choose(opts);
      if (i === loc.people.length) return;
      who = loc.people[i];
    }
    await interview(who);
  }

  async function interview(id) {
    const ch = S.characters[id];
    view.show = [id]; view.moods = {}; view.speaking = null;
    if (state.met[id]) await say(id, ch.greeting, 'neutral');
    else await say('narrator', 'A stranger watches you, saying nothing. Ask a question (1 hour) to find out who they are.');
    while (state.hours > 0) {
      const left = topicsLeft(id);
      if (!left.length) { await say('narrator', ch.name + ' has nothing more to tell you.'); break; }
      const opts = left.map((tp) => ({ label: S.topics[tp].label, sub: 'Costs 1 hour · ' + state.hours + ' left' }));
      opts.push({ label: 'Leave', sub: 'Back to the map' });
      const ti = await choose(opts);
      if (ti === left.length) break;
      const topic = left[ti];

      note('approach');
      const known = state.chart[id] || {};
      const ai = await choose(APPROACHES.map((a) => ({
        label: S.approaches[a].label,
        sub: known[a] ? 'You know: ' + (S.effectiveness[known[a]] || known[a]) : 'How will they react?',
        cls: 'ap-' + a
      })));
      const a = APPROACHES[ai];
      const resp = ch.topics[topic][a];

      state.hours -= 1;
      state.asked[id + ':' + topic] = a;
      updateHUD();
      if (!state.met[id]) { state.met[id] = true; save(); await charCard(id); await say(id, ch.greeting, 'neutral'); }
      await say('detective', resp.ask || S.topics[topic].ask[a]);
      for (let i = 0; i < resp.lines.length; i++) {
        const last = i === resp.lines.length - 1;
        await say(id, resp.lines[i], resp.mood, last ? resp.quote : null);
      }
      state.chart[id] = Object.assign({}, state.chart[id], { [a]: resp.eff });
      await effBanner(resp.eff);
      (resp.evidence || []).forEach(addEvidence);
      const IH = SET.interviewHyst || {};
      let dh = 0;
      if (resp.eff === 'false') dh += IH.false || 0;
      if ((resp.evidence || []).some((e) => getEv(e).shocking)) dh += IH.shocking || 0;
      if (a === 'kind' && resp.eff === 'effective') dh += IH.gentle || 0;
      if (dh) setHyst(state.hyst + dh);
      save();
    }
  }

  function meetingPick() {
    return new Promise((res) => {
      const m = $('meeting');
      const max = SET.maxReportsPerMeeting;
      const avail = state.evidence.filter((id) => !state.reported.includes(id));
      const sel = [];
      const draw = () => {
        m.innerHTML = '<div class="panel meeting-panel"><h2>Town meeting</h2>' +
          '<p class="lede">Choose up to ' + max + ' things to tell the town. Calm facts can slow the panic. Shocking claims feed it.</p>' +
          '<ul class="pick">' + avail.map((id) => {
            const ev = getEv(id);
            return '<li><button type="button" class="pickbtn' + (sel.includes(id) ? ' on' : '') + '" data-id="' + id + '" aria-pressed="' + sel.includes(id) + '">' +
              '<span class="tag t-' + ev.type + (ev.shocking ? ' shocking' : '') + '">' + typeLabel(ev) + '</span> ' + esc(ev.text) + '</button></li>';
          }).join('') + '</ul>' +
          '<div class="meeting-foot"><span>' + sel.length + ' / ' + max + ' chosen</span>' +
          '<button type="button" class="btn primary" id="m-go">' + (sel.length ? 'Tell the town' : 'Say nothing') + '</button></div></div>';
        m.querySelectorAll('.pickbtn').forEach((b) => {
          b.onclick = (e) => {
            e.stopPropagation();
            const id = b.dataset.id, k = sel.indexOf(id);
            if (k >= 0) sel.splice(k, 1); else if (sel.length < max) sel.push(id);
            draw();
          };
        });
        $('m-go').onclick = (e) => { e.stopPropagation(); m.hidden = true; res(sel.slice()); };
      };
      draw();
      $('dialog').hidden = true;
      m.hidden = false;
    });
  }

  async function meeting() {
    state.phase = 'meeting'; save(); updateHUD();
    await run(S.scenes.meetingIntro);
    const picks = await meetingPick();
    if (!picks.length) await run(S.scenes.meetingSilence);
    for (const id of picks) {
      const ev = getEv(id), rep = reportFor(id);
      state.reported.push(id);
      await say('detective', 'I can tell you this: ' + ev.text);
      if (rep.d >= 12) await runFx('shake');
      setHyst(state.hyst + rep.d);
      await say('narrator', rep.line);
    }
    const floor = state.day === 1 ? SET.floors.meeting1 : SET.floors.meeting2;
    if (state.hyst < floor) {
      raiseFloor(floor);
      await say('narrator', 'It doesn’t matter what you said. On the way home, every family tells the story a little scarier than they heard it.');
    } else {
      raiseFloor(floor);
    }
    if (state.day === 1) await night(); else await trial();
  }

  async function night() {
    state.phase = 'night'; raiseFloor(SET.floors.night); save(); updateHUD();
    $('dialog').hidden = true;
    await run(S.scenes.nightIntro);
    const places = S.scenes.nightPlaces;
    const i = await choose(places.map((p) => ({ label: p.name })));
    view.bg = places[i].bg; view.show = [];
    await run(places[i].steps);
    await say('narrator', 'Dawn comes too fast.');
    await startDay(2, true);
  }

  async function trial() {
    state.phase = 'trial'; save(); updateHUD();
    await run(S.scenes.trialIntro);
    for (;;) {
      view.show = ['fanforth']; view.speaking = null;
      const opts = SUSPECTS.map((id) => ({ label: S.characters[id].name, sub: state.met[id] ? S.characters[id].themes.map(cap).join(', ') : 'You never spoke to them' }));
      opts.push({ label: 'Check your journal first', sub: 'Look over what you know' });
      opts.push({ label: 'There is no demon.', sub: 'Refuse to name anyone', cls: 'special' });
      const i = await choose(opts, true);
      if (i === SUSPECTS.length) { await openJournal('evidence'); continue; }
      if (i === SUSPECTS.length + 1) {
        const c = await choose([{ label: 'Yes. There is no demon.' }, { label: 'Wait. Let me think again.' }]);
        if (c === 0) return endingNoDemon();
        continue;
      }
      const id = SUSPECTS[i];
      view.show = ['fanforth', id]; view.moods = { [id]: 'scared' };
      const c = await choose([{ label: 'Yes. ' + S.characters[id].name + ' is the demon.' }, { label: 'Wait. Let me think again.' }]);
      if (c === 0) return endingAccuse(id);
    }
  }

  async function endingAccuse(id) {
    const ch = S.characters[id], E = S.scenes.endingAccuse;
    const vars = { name: ch.name, truth: ch.truth };
    await run(E.steps, vars);
    const extra = S.scenes.accuseExtras[id];
    if (extra) await run(extra, vars);
    await run(E.epilogue, vars);
    if (state.calm >= state.fear && E.calmCoda) await run(E.calmCoda, vars);
    else if (E.fearCoda) await run(E.fearCoda, vars);
    note('ending');
    await card({ title: E.title, quote: E.quote });
    endScreen(E.title, ch.name);
  }

  async function endingNoDemon() {
    const E = S.scenes.endingNoDemon;
    const made = state.evidence.filter((id) => S.inferences[id]);
    if (made.length >= 3) {
      await say('detective', S.scenes.truthSpeech.intro);
      for (const id of made.slice(0, 3)) await say('detective', S.inferences[id].text);
      await say('fanforth', S.scenes.truthSpeech.reply);
    }
    await run(E.steps);
    const calmWin = state.calm >= state.fear && made.length >= 3 && E.calmCoda;
    if (calmWin) await run(E.calmCoda);
    const title = calmWin ? E.calmTitle : E.title;
    await card({ title: title, quote: calmWin ? E.calmQuote : E.quote });
    endScreen(title, null);
  }

  function endScreen(title, accused) {
    state.phase = 'end'; updateHUD();
    wipe(SAVE_KEY);
    $('dialog').hidden = true;
    const intimidated = Object.keys(state.asked).filter((k) => state.asked[k] === 'intimidate').length;
    const nInf = state.evidence.filter((id) => S.inferences[id]).length;
    const el = $('end');
    el.innerHTML = '<div class="panel end-panel"><p class="eyebrow">' + (accused ? 'You named ' + esc(accused) : 'You named no one') + '</p>' +
      '<h2>' + esc(title) + '</h2>' +
      '<div class="stats"><div><b>100%</b><span>final hysteria</span></div>' +
      '<div><b>' + state.calm + ' / ' + state.fear + '</b><span>calm you spread / fear you spread</span></div>' +
      '<div><b>' + state.evidence.length + '</b><span>pieces of evidence</span></div>' +
      '<div><b>' + nInf + '/' + Object.keys(S.inferences).length + '</b><span>connections made</span></div>' +
      '<div><b>' + intimidated + '</b><span>people intimidated</span></div></div>' +
      '<h3>How the game argues</h3><table class="rhet"><tbody>' +
      S.rhetoric.map(([m, w]) => '<tr><th>' + esc(m) + '</th><td>' + esc(w) + '</td></tr>').join('') + '</tbody></table>' +
      '<div class="row"><button type="button" class="btn primary" id="end-again">Play again</button>' +
      '<button type="button" class="btn" id="end-title">Title screen</button></div></div>';
    el.hidden = false;
    $('end-again').onclick = (e) => { e.stopPropagation(); el.hidden = true; newGame(); };
    $('end-title').onclick = (e) => { e.stopPropagation(); el.hidden = true; showTitle(); };
  }

  /* ---------------- title ---------------- */
  function showTitle() {
    Music.set(null);
    view.bg = 'title'; view.show = []; view.speaking = null;
    ['hud', 'dialog', 'choices', 'map', 'eff', 'meeting', 'journal', 'charcard', 'card', 'end'].forEach((x) => { $(x).hidden = true; });
    const saved = load(SAVE_KEY);
    const t = $('title');
    t.innerHTML = '<div class="title-inner"><h1>' + esc(S.title) + '</h1><p class="subtitle">' + esc(S.subtitle) + '</p>' +
      '<div class="title-menu">' +
      '<button type="button" class="btn primary" id="t-new">New game</button>' +
      (saved && saved.phase && saved.phase !== 'end' ? '<button type="button" class="btn" id="t-cont">Continue</button>' : '') +
      '<button type="button" class="btn" id="t-sound" aria-pressed="' + !prefs.muted + '">Sound: ' + (prefs.muted ? 'OFF' : 'ON') + '</button>' +
      '</div><p class="hint">About 15 minutes. Click or Space to advance, number keys to choose, J for journal.</p></div>';
    t.hidden = false;
    $('t-new').onclick = (e) => { e.stopPropagation(); newGame(); };
    if ($('t-cont')) $('t-cont').onclick = (e) => { e.stopPropagation(); continueGame(saved); };
    $('t-sound').onclick = (e) => { e.stopPropagation(); toggleSound(); showTitle(); };
    $('t-new').focus({ preventScroll: true });
  }

  function begin() {
    Music.unlock();
    $('title').hidden = true;
    $('hud').hidden = false;
    updateHUD();
  }
  function newGame() {
    wipe(SAVE_KEY);
    state = freshState();
    begin();
    phaseIntro();
  }
  function continueGame(saved) {
    state = Object.assign(freshState(), saved);
    begin();
    switch (state.phase) {
      case 'day': Music.set('day'); mapLoop(); break;
      case 'meeting': meeting(); break;
      case 'night': night(); break;
      case 'trial': trial(); break;
      default: phaseIntro();
    }
  }
  function toggleSound() {
    prefs.muted = !prefs.muted; savePrefs();
    Music.setMuted(prefs.muted);
    $('btn-sound').textContent = 'Sound: ' + (prefs.muted ? 'off' : 'on');
  }

  /* ---------------- input + layout ---------------- */
  stage.addEventListener('click', (e) => {
    if (e.target.closest('button, .overlay, #choices, #map')) return;
    if (advance) advance();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && journalClose) { journalClose(); return; }
    if ((e.key === 'j' || e.key === 'J') && state && !$('hud').hidden) {
      if (journalClose) journalClose();
      else if ($('meeting').hidden && $('end').hidden) openJournal();
      return;
    }
    if (journalClose) return;
    if ((e.key === ' ' || e.key === 'Enter') && advance && $('choices').hidden) {
      e.preventDefault(); advance(); return;
    }
    if (choiceKeys && /^[1-9]$/.test(e.key)) { e.preventDefault(); choiceKeys(e.key); }
  });
  $('btn-journal').addEventListener('click', (e) => { e.stopPropagation(); if (!journalClose) openJournal(); });
  $('btn-sound').addEventListener('click', (e) => { e.stopPropagation(); Music.unlock(); toggleSound(); });

  function fit() {
    const pad = window.innerWidth < 700 ? 32 : 0;
    const aw = window.innerWidth - pad, ah = window.innerHeight;
    let w = aw, h = (w * 9) / 16;
    if (h > ah) { h = ah; w = (h * 16) / 9; }
    stage.style.width = Math.floor(w) + 'px';
    stage.style.height = Math.floor(h) + 'px';
    stage.style.setProperty('--px', String(w / W));
  }
  window.addEventListener('resize', fit);
  fit();

  $('btn-sound').textContent = 'Sound: ' + (prefs.muted ? 'off' : 'on');
  requestAnimationFrame(render);
  preload().then(showTitle);
})();

