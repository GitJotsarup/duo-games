/* Crazy Mini Golf: a standalone Duo Games title (registered with PARTY.standalone).
   9 handcrafted holes, both balls on the same course at once. Course geometry lives in constant
   tables below; S only holds dynamic state. Physics: fixed 1/180 s substeps, circle vs segment/circle,
   per-surface friction, everything time-based is a pure function of the hole tick counter S.n so the
   bot can predict shots with the very same physics. */
(function () {
  'use strict';
  var P = window.PARTY, W = 800, H = 500, R = 8, TH = 5, SUB = 6, SDT = 1 / 180, PK = 36, PI = Math.PI, TAU = PI * 2;
  var HOLE_T = 60, HURRY = 20, CARD_T = 3.4, END_T = 1.2, MAXS = 8, WHO = ['host', 'guest'];
  var COL = { host: '#ff5c8a', guest: '#58c7ff', gold: '#ffd166', good: '#4ade80', bad: '#ff5a6a' };

  function r1(v) { return Math.round(v * 10) / 10; }
  function r3(v) { return Math.round(v * 1000) / 1000; }
  function box(x1, y1, x2, y2, c) { return [x1 + c, y1, x2 - c, y1, x2, y1 + c, x2, y2 - c, x2 - c, y2, x1 + c, y2, x1, y2 - c, x1, y1 + c]; }
  function nrm(x, y) { var l = Math.hypot(x, y); return [x / l, y / l]; }

  /* ------------------------------------------------------------------ course tables */
  var HOLES = [
    { name: 'Bumper Bash', par: 2, bd: box(40, 120, 760, 480, 36), tee: [[100, 282], [100, 318]], cup: [680, 300],
      bump: [[330, 205, 22], [330, 395, 22], [455, 300, 28], [575, 195, 20], [575, 405, 20]],
      zones: [{ k: 'sand', r: [716, 236, 34, 128] }] },
    { name: 'The Windmill', par: 3, bd: box(40, 120, 760, 480, 30), tee: [[95, 282], [95, 318]], cup: [690, 300],
      walls: [{ p: [400, 120, 400, 245] }, { p: [400, 335, 400, 480] }], mill: { x: 400, y: 200, l: 122, w: 1.5 },
      bump: [[560, 195, 18], [560, 405, 18]], zones: [{ k: 'sand', c: [250, 170, 34] }, { k: 'sand', c: [250, 430, 34] }] },
    { name: 'Ice Slide', par: 3, bd: [40, 330, 590, 330, 590, 120, 760, 120, 760, 480, 40, 480], tee: [[90, 387], [90, 423]], cup: [675, 178],
      walls: [{ p: [700, 480, 760, 420] }],
      zones: [{ k: 'ice', r: [170, 334, 330, 142] }, { k: 'sand', c: [675, 290, 36] }, { k: 'sand', c: [712, 445, 34] }] },
    { name: 'Lava Bridge', par: 3, bd: box(40, 120, 760, 480, 30), tee: [[95, 282], [95, 318]], cup: [688, 300],
      zones: [{ k: 'lava', r: [190, 120, 420, 138] }, { k: 'lava', r: [190, 342, 420, 138] }],
      slid: [{ p: [330, 280, 330, 320], a: [0, 30], w: 2.1, ph: 0 }, { p: [470, 280, 470, 320], a: [0, 30], w: 2.1, ph: PI }] },
    { name: 'Teleport Tango', par: 3, bd: box(40, 120, 760, 480, 30), tee: [[95, 282], [95, 318]], cup: [660, 190],
      walls: [{ p: [400, 120, 400, 405] }, { p: [520, 290, 690, 290] }],
      tel: [[300, 190, 470, 190, '#b46bff', [0, 1], [0, 1]], [300, 410, 700, 420, '#33e0c8', [0, -1], [-1, 0]]], zones: [{ k: 'sand', r: [420, 330, 90, 60] }], bump: [[568, 192, 17]] },
    { name: 'Conveyor Chaos', par: 3, bd: box(40, 120, 760, 480, 30), tee: [[95, 282], [95, 318]], cup: [680, 300], cm: [0, 110, 0.8], mag: [60, 150],
      zones: [{ k: 'belt', r: [215, 120, 70, 360], d: [0, -1] }, { k: 'belt', r: [365, 120, 70, 360], d: [0, 1] }, { k: 'belt', r: [515, 120, 70, 360], d: [0, -1] }] },
    { name: 'Ramp Rampage', par: 3, bd: box(40, 120, 760, 480, 30), tee: [[95, 242], [95, 278]], cup: [660, 260],
      zones: [{ k: 'water', r: [370, 120, 95, 282] }, { k: 'ramp', r: [262, 222, 56, 76], d: [1, 0] }, { k: 'sand', r: [335, 402, 165, 78] }],
      walls: [{ p: [618, 226, 618, 294] }], bump: [[575, 170, 18], [575, 360, 18]] },
    { name: 'Loop & Cannon', par: 4, bd: box(40, 120, 760, 480, 30), tee: [[90, 367], [90, 403]], cup: [150, 205],
      walls: [{ p: [40, 290, 640, 290], low: 1 }, { p: [222, 348, 338, 348, 338, 422, 222, 422], closed: 1 }],
      loop: { e: [190, 360, 22, 50], d: [1, 0], min: 300, o: [354, 385], t: 0.9 },
      can: { x: 530, y: 400, d: nrm(-330, -205), sp: 380, air: 0.85 },
      zones: [{ k: 'sand', r: [570, 124, 70, 162] }], bump: [[700, 205, 20]] },
    { name: 'Grand Finale', par: 4, bd: box(40, 120, 760, 480, 36), tee: [[90, 282], [90, 318]], cup: [685, 300], cm: [0, 75, 1.1], mag: [50, 130],
      walls: [{ p: [440, 120, 440, 250] }, { p: [440, 330, 440, 480] }], mill: { x: 440, y: 200, l: 122, w: -1.8 },
      tel: [[330, 145, 560, 450, '#b46bff', [1, 0], [0, -1]]],
      zones: [{ k: 'lava', c: [245, 180, 46] }, { k: 'lava', c: [245, 420, 46] }, { k: 'ice', r: [150, 250, 200, 100] }],
      bump: [[570, 190, 18], [610, 400, 16], [565, 300, 22]] }
  ];
  function poly(a, closed, low, out) {
    for (var i = 0; i + 3 < a.length; i += 2) out.push([a[i], a[i + 1], a[i + 2], a[i + 3], low ? 1 : 0]);
    if (closed) out.push([a[a.length - 2], a[a.length - 1], a[0], a[1], low ? 1 : 0]);
  }
  HOLES.forEach(function (h) {
    h.segs = []; poly(h.bd, true, 0, h.segs);
    (h.walls || []).forEach(function (w) { poly(w.p, w.closed, w.low, h.segs); });
    h.bump = h.bump || []; h.zones = h.zones || []; h.slid = h.slid || []; h.pads = [];
    (h.tel || []).forEach(function (t) { var i = h.pads.length; h.pads.push({ x: t[0], y: t[1], to: i + 1, c: t[4], d: t[5] }); h.pads.push({ x: t[2], y: t[3], to: i, c: t[4], d: t[6] }); });
  });
  /* decorative bushes / flowers around the course (constant) */
  var DECO = (function () { var a = [], s = 7; function rr() { s = (s * 16807) % 2147483647; return s / 2147483647; } for (var i = 0; i < 70; i++) a.push([Math.round(rr() * W), Math.round(80 + rr() * 430), Math.round(10 + rr() * 22), rr() < 0.3 ? 1 : 0]); return a; })();

  /* ------------------------------------------------------------------ physics (shared by step + bot) */
  function cupAt(h, T) { var m = h.cm; return m ? [h.cup[0] + m[0] * Math.sin(m[2] * T), h.cup[1] + m[1] * Math.sin(m[2] * T)] : h.cup; }
  function inZ(z, x, y) {
    if (z.r) return x >= z.r[0] && x <= z.r[0] + z.r[2] && y >= z.r[1] && y <= z.r[1] + z.r[3];
    var dx = x - z.c[0], dy = y - z.c[1]; return dx * dx + dy * dy <= z.c[2] * z.c[2];
  }
  function millSeg(m, T, i) { var an = m.w * T + i * PI / 2; return [m.x, m.y, m.x + Math.cos(an) * m.l, m.y + Math.sin(an) * m.l]; }
  function slidSeg(q, T) { var o = Math.sin(q.w * T + q.ph); return [q.p[0] + q.a[0] * o, q.p[1] + q.a[1] * o, q.p[2] + q.a[0] * o, q.p[3] + q.a[1] * o]; }
  /* circle (ball) vs thick segment. wall velocity = (wx,wy) + om x (q - hub). returns impact speed */
  function hit(b, x1, y1, x2, y2, th, wx, wy, om, hx, hy) {
    var dx = x2 - x1, dy = y2 - y1, L = dx * dx + dy * dy, t = L ? ((b.x - x1) * dx + (b.y - y1) * dy) / L : 0;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    var qx = x1 + dx * t, qy = y1 + dy * t, nx = b.x - qx, ny = b.y - qy, d2 = nx * nx + ny * ny, rr = R + th;
    if (d2 >= rr * rr) return 0;
    var d = Math.sqrt(d2);
    if (d < 1e-6) { nx = -dy; ny = dx; d = Math.sqrt(L) || 1; }
    nx /= d; ny /= d;
    b.x = qx + nx * rr; b.y = qy + ny * rr;
    var vx = wx - om * (qy - hy), vy = wy + om * (qx - hx);
    var rx = b.vx - vx, ry = b.vy - vy, vn = rx * nx + ry * ny;
    if (vn < 0) { var tx = rx - vn * nx, ty = ry - vn * ny; b.vx = tx * 0.95 - 0.72 * vn * nx + vx; b.vy = ty * 0.95 - 0.72 * vn * ny + vy; return -vn; }
    return 0;
  }
  /* moving obstacles only (also applied to resting balls so blades/sliders shove them) */
  function dyn(b, h, T) {
    var imp = 0, i, s;
    if (h.mill) for (i = 0; i < 4; i++) { s = millSeg(h.mill, T, i); imp += hit(b, s[0], s[1], s[2], s[3], 6, 0, 0, h.mill.w, h.mill.x, h.mill.y); }
    for (i = 0; i < h.slid.length; i++) {
      var q = h.slid[i], cv = Math.cos(q.w * T + q.ph) * q.w; s = slidSeg(q, T);
      imp += hit(b, s[0], s[1], s[2], s[3], 6, q.a[0] * cv, q.a[1] * cv, 0, 0, 0);
    }
    return imp;
  }
  /* one substep for a moving ball. returns 0 | 'stop' | 'in' | 'haz' */
  function sub(b, h, T, fx) {
    var i, q;
    if (b.st === 'loop') {
      b.k -= SDT;
      if (b.k <= 0) { var L = h.loop; b.st = 'roll'; b.k = 0; b.x = L.o[0]; b.y = L.o[1]; b.vx = L.d[0] * b.ls; b.vy = L.d[1] * b.ls; if (fx) fx('land', b.x, b.y); }
      return 0;
    }
    if (b.st === 'can') {
      b.k -= SDT;
      if (b.k <= 0) { var C = h.can; b.st = 'roll'; b.k = 0; b.vx = C.d[0] * C.sp; b.vy = C.d[1] * C.sp; b.z = b.az = C.air; b.x = C.x + C.d[0] * 24; b.y = C.y + C.d[1] * 24; if (fx) fx('boom', C.x + C.d[0] * 34, C.y + C.d[1] * 34); }
      return 0;
    }
    b.x += b.vx * SDT; b.y += b.vy * SDT; b.rt += SDT;
    var air = b.z > 0;
    if (air) { b.z -= SDT; if (b.z <= 0) { b.z = 0; if (fx) fx('land', b.x, b.y); } }
    var s = h.segs;
    for (i = 0; i < s.length; i++) { q = s[i]; if (air && q[4]) continue; hit(b, q[0], q[1], q[2], q[3], TH, 0, 0, 0, 0, 0); }
    dyn(b, h, T);
    for (i = 0; i < h.bump.length; i++) {
      q = h.bump[i];
      var ux = b.x - q[0], uy = b.y - q[1], ud = Math.sqrt(ux * ux + uy * uy), ur = R + q[2];
      if (ud < ur && ud > 0) {
        ux /= ud; uy /= ud; b.x = q[0] + ux * ur; b.y = q[1] + uy * ur;
        var vn = b.vx * ux + b.vy * uy;
        if (vn < 0) { b.vx += (-2 * vn + 190) * ux; b.vy += (-2 * vn + 190) * uy; if (fx) fx('bump', q[0], q[1]); }
      }
    }
    if (b.x < 20 || b.x > W - 20 || b.y < 90 || b.y > H) { b.hz = 'oob'; return 'haz'; }
    if (air) return 0;
    var k = 1.1, c = 55;
    for (i = 0; i < h.zones.length; i++) {
      q = h.zones[i]; if (!inZ(q, b.x, b.y)) continue;
      if (q.k === 'water' || q.k === 'lava') { b.hz = q.k; return 'haz'; }
      if (q.k === 'sand') { k = 3.5; c = 420; }
      else if (q.k === 'ice') { k = 0.15; c = 10; }
      else if (q.k === 'belt') { if (b.vx * q.d[0] + b.vy * q.d[1] < 170) { b.vx += q.d[0] * 320 * SDT; b.vy += q.d[1] * 320 * SDT; } }
      else if (q.k === 'ramp') {
        var dm = b.vx * q.d[0] + b.vy * q.d[1];
        if (dm > 230) { b.z = b.az = Math.min(0.75, Math.max(0.3, dm / 800)); b.vx *= 1.05; b.vy *= 1.05; if (fx) fx('jump', b.x, b.y); return 0; }
      }
    }
    var inP = -1;
    for (i = 0; i < h.pads.length; i++) { q = h.pads[i]; var ex = b.x - q.x, ey = b.y - q.y; if (ex * ex + ey * ey < 196) { inP = i; break; } }
    if (inP < 0) b.tp = -1;
    else if (inP !== b.tp) { var to = h.pads[h.pads[inP].to]; if (fx) { fx('tele', b.x, b.y); fx('tele', to.x, to.y); } b.x = to.x; b.y = to.y; b.tp = h.pads[inP].to; if (to.d) { var ts = Math.sqrt(b.vx * b.vx + b.vy * b.vy); b.vx = to.d[0] * ts; b.vy = to.d[1] * ts; } }
    if (h.can) { var cx = b.x - h.can.x, cy = b.y - h.can.y; if (cx * cx + cy * cy < 324) { b.st = 'can'; b.k = 0.55; b.x = h.can.x; b.y = h.can.y; b.vx = b.vy = 0; return 0; } }
    if (h.loop) {
      var LP = h.loop;
      if (b.x >= LP.e[0] && b.x <= LP.e[0] + LP.e[2] && b.y >= LP.e[1] && b.y <= LP.e[1] + LP.e[3] && b.vx * LP.d[0] + b.vy * LP.d[1] > LP.min) {
        b.st = 'loop'; b.k = LP.t; b.ls = Math.sqrt(b.vx * b.vx + b.vy * b.vy) * 0.92; b.vx = b.vy = 0; if (fx) fx('loop', b.x, b.y); return 0;
      }
    }
    var sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
    var cp = cupAt(h, T), gx = cp[0] - b.x, gy = cp[1] - b.y, gd = Math.sqrt(gx * gx + gy * gy);
    if (gd < 10 && sp < 250) return 'in';
    if (gd < 16 && gd > 0) { b.vx += gx / gd * 1000 * SDT; b.vy += gy / gd * 1000 * SDT; }
    if (h.mag && gd < h.mag[0] && gd > 0) { var f = h.mag[1] * (1 - gd / h.mag[0]) + 60; b.vx += gx / gd * f * SDT; b.vy += gy / gd * f * SDT; }
    var f2 = Math.max(0, 1 - k * SDT); b.vx *= f2; b.vy *= f2;
    sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
    if (sp > 0) { var ns = Math.max(0, sp - c * SDT); b.vx *= ns / sp; b.vy *= ns / sp; sp = ns; }
    if (sp < 7 || b.rt > 8) return 'stop';
    return 0;
  }
  function roundBall(b) { b.x = r1(b.x); b.y = r1(b.y); b.vx = r1(b.vx); b.vy = r1(b.vy); }
  function shotV(a, pk) { var v = 30 + 690 * pk / PK; return [r1(Math.cos(a) * v), r1(Math.sin(a) * v)]; }
  function moving(b) { return b.st === 'roll' || b.st === 'loop' || b.st === 'can'; }
  function solid(b) { return (b.st === 'roll' || b.st === 'aim') && !(b.z > 0); }

  /* ------------------------------------------------------------------ game flow */
  function newBall(t, cup) {
    return { x: t[0], y: t[1], vx: 0, vy: 0, a: r3(Math.atan2(cup[1] - t[1], cup[0] - t[0])), st: 'aim', s: 0, ch: 0, pk: 0, pd: 1,
      lx: t[0], ly: t[1], z: 0, az: 0, tp: -1, k: 0, ls: 0, rt: 0, hz: '' };
  }
  function setupHole(S) {
    var h = HOLES[S.h], sp = (S.h + S.sd) % 2; /* tee spots alternate seats every hole */
    S.b = [newBall(h.tee[sp], h.cup), newBall(h.tee[1 - sp], h.cup)];
    S.n = 0; S.lim = HOLE_T; S.ph = 'play'; S.tr = [[], []]; S.ew = -1;
  }
  function totals(S, live) {
    return [0, 1].map(function (i) {
      var t = 0;
      for (var j = 0; j < HOLES.length; j++) {
        var v = S.card[i][j];
        if (v == null) { if (live === 'all') v = (j === S.h && S.b[i].st === 'in') ? S.b[i].s : 9; else if (live && j === S.h && S.ph !== 'card') v = S.b[i].s; else v = 0; }
        t += v;
      }
      return t;
    });
  }
  function resultOf(S) {
    var t = totals(S, 'all');
    return { winner: t[0] < t[1] ? 'host' : t[1] < t[0] ? 'guest' : 'tie', text: t[0] + ' - ' + t[1] + ' strokes' };
  }
  function addPop(S, x, y, s, c, z) { S.pops.push({ x: Math.round(x), y: Math.round(y), s: s, c: c, z: z || 26, t: 0 }); if (S.pops.length > 6) S.pops.shift(); }
  function scoreName(s, par) {
    if (s === 1) return 'HOLE IN ONE!';
    var d = s - par;
    return d <= -3 ? 'Albatross!' : d === -2 ? 'Eagle!' : d === -1 ? 'Birdie!' : d === 0 ? 'Par' : d === 1 ? 'Bogey' : d === 2 ? 'Double Bogey' : '+' + d;
  }
  function settle(S, i, r, h, fx) {
    var b = S.b[i], c = COL[WHO[i]];
    if (r === 'stop') {
      b.vx = b.vy = 0; b.st = 'aim'; b.lx = b.x; b.ly = b.y; b.rt = 0;
      if (b.s >= MAXS) { b.st = 'done'; addPop(S, b.x, b.y - 20, 'Out of strokes', '#ffb36b', 20); }
    } else if (r === 'in') {
      var cp = cupAt(h, S.n / 30);
      b.st = 'in'; b.vx = b.vy = 0; b.x = r1(cp[0]); b.y = r1(cp[1]); b.z = 0;
      fx('sink', cp[0], cp[1]);
      addPop(S, cp[0], cp[1] - 34, scoreName(b.s, h.par), b.s === 1 ? COL.gold : c, b.s === 1 ? 38 : 28);
      var o = S.b[1 - i];
      if (o.st !== 'in' && o.st !== 'done') S.lim = Math.min(S.lim, Math.ceil(S.n / 30) + HURRY);
    } else if (r === 'haz') {
      b.st = 'haz'; b.k = 0.9; b.vx = b.vy = 0; b.z = 0; b.ch = 0; b.pk = 0;
      fx(b.hz === 'lava' ? 'fire' : 'splash', b.x, b.y);
      addPop(S, b.x, b.y - 26, b.hz === 'lava' ? 'Toasted! +1' : b.hz === 'water' ? 'Splash! +1' : 'Out! +1', b.hz === 'lava' ? '#ff9f43' : '#7fd3ff', 26);
    }
  }
  function collide(p, q, fx) {
    if (!solid(p) || !solid(q)) return false;
    var dx = q.x - p.x, dy = q.y - p.y, d2 = dx * dx + dy * dy;
    if (d2 >= 4 * R * R) return false;
    var d = Math.sqrt(d2); if (d < 1e-6) { dx = 1; dy = 0; d = 1; }
    var nx = dx / d, ny = dy / d, ov = (2 * R - d) / 2;
    p.x -= nx * ov; p.y -= ny * ov; q.x += nx * ov; q.y += ny * ov;
    var vr = (q.vx - p.vx) * nx + (q.vy - p.vy) * ny;
    if (vr < 0) {
      var j = -1.9 * vr / 2;
      p.vx -= j * nx; p.vy -= j * ny; q.vx += j * nx; q.vy += j * ny;
      wake(p); wake(q);
      if (j > 60) fx('clack', (p.x + q.x) / 2, (p.y + q.y) / 2);
    }
    return true;
  }
  function wake(b) { if (b.st === 'aim' && (b.vx || b.vy)) { b.st = 'roll'; b.ch = 0; b.pk = 0; b.rt = 0; } }
  function pushOut(b, h) { for (var i = 0; i < h.segs.length; i++) { var q = h.segs[i]; hit(b, q[0], q[1], q[2], q[3], TH, 0, 0, 0, 0, 0); } }
  function aimOf(b, px, py) { return r3(Math.atan2(py - b.y, px - b.x)); }

  function step(S, dt, inp, ev, rnd) {
    S.fx = S.fx.filter(function (f) { f.t = Math.round((f.t + dt) * 100) / 100; return f.t < 1; });
    S.pops = S.pops.filter(function (f) { f.t = Math.round((f.t + dt) * 100) / 100; return f.t < 1.5; });
    if (S.ph === 'card') {
      S.ct = Math.round((S.ct - dt) * 1000) / 1000;
      if (S.ct <= 0) { if (S.h >= HOLES.length - 1) S.result = resultOf(S); else { S.h++; setupHole(S); } }
      return;
    }
    var h = HOLES[S.h], i, b;
    var fx = function (k, x, y) { S.fx.push({ k: k, x: Math.round(x), y: Math.round(y), t: 0 }); if (S.fx.length > 12) S.fx.shift(); };
    /* ---- input ---- */
    for (i = 0; i < 2; i++) {
      b = S.b[i];
      var k = inp[WHO[i]] || P.emptyIn(), e = ev[WHO[i]] || [];
      var moved = k.px !== S.lp[i][0] || k.py !== S.lp[i][1];
      if (moved) S.lp[i] = [k.px, k.py];
      if (b.st !== 'aim') { b.ch = 0; b.pk = 0; continue; }
      if (moved) b.a = aimOf(b, k.px, k.py);
      var cancel = false;
      for (var j = 0; j < e.length; j++) { if (e[j].t === 'tap') b.a = aimOf(b, e[j].x, e[j].y); if (e[j].t === 'b') cancel = true; }
      var rot = (k.right ? 1 : 0) - (k.left ? 1 : 0) + ((k.down ? 1 : 0) - (k.up ? 1 : 0)) * 0.2;
      if (rot) b.a = r3(b.a + rot * 2.2 * dt);
      if (cancel) { b.ch = 0; b.pk = 0; }
      else if (k.a || k.pd) {
        if (!b.ch) { b.ch = 1; b.pk = 0; b.pd = 1; }
        b.pk += b.pd; if (b.pk >= PK) { b.pk = PK; b.pd = -1; } else if (b.pk <= 0) { b.pk = 0; b.pd = 1; }
      } else if (b.ch) {
        b.ch = 0;
        if (b.pk > 0) { var v = shotV(b.a, b.pk); b.vx = v[0]; b.vy = v[1]; b.st = 'roll'; b.s++; b.rt = 0; b.lx = b.x; b.ly = b.y; }
        b.pk = 0;
      }
    }
    /* ---- physics ---- */
    var T0 = S.n / 30;
    for (var u = 0; u < SUB; u++) {
      var T = T0 + u * SDT;
      for (i = 0; i < 2; i++) {
        b = S.b[i];
        if (moving(b)) { var r = sub(b, h, T, fx); if (r) settle(S, i, r, h, fx); }
        else if (b.st === 'aim' && (h.mill || h.slid.length)) { if (dyn(b, h, T) > 0) wake(b); }
      }
      if (collide(S.b[0], S.b[1], fx)) for (i = 0; i < 2; i++) if (S.b[i].st === 'aim') pushOut(S.b[i], h);
    }
    for (i = 0; i < 2; i++) {
      b = S.b[i];
      if (b.st === 'aim' && h.cm) { var cp = cupAt(h, T0); if (Math.hypot(cp[0] - b.x, cp[1] - b.y) < 8) settle(S, i, 'in', h, fx); }
      if (b.st === 'haz') {
        b.k = Math.round((b.k - dt) * 1000) / 1000;
        if (b.k <= 0) {
          b.s++; b.x = b.lx; b.y = b.ly; b.vx = b.vy = 0; b.z = 0; b.tp = -1; b.k = 0; b.st = 'aim';
          if (b.s >= MAXS) { b.st = 'done'; addPop(S, b.x, b.y - 20, 'Out of strokes', '#ffb36b', 20); }
        }
      }
      roundBall(b);
      var tr = S.tr[i];
      if (moving(b) && b.st === 'roll') { tr.push(Math.round(b.x), Math.round(b.y)); if (tr.length > 20) tr.splice(0, 2); }
      else if (tr.length) tr.splice(0, 2);
    }
    S.n++;
    var fin = S.b[0].st !== 'aim' && S.b[1].st !== 'aim' && !moving(S.b[0]) && !moving(S.b[1]) && S.b[0].st !== 'haz' && S.b[1].st !== 'haz';
    if (fin && S.ew < 0) S.ew = END_T;
    if (S.ew >= 0) S.ew = Math.round((S.ew - dt) * 1000) / 1000;
    if ((fin && S.ew <= 0) || S.n / 30 >= S.lim) {
      for (i = 0; i < 2; i++) S.card[i][S.h] = S.b[i].st === 'in' ? Math.min(9, S.b[i].s) : 9;
      S.ph = 'card'; S.ct = CARD_T;
    }
  }

  /* ------------------------------------------------------------------ bot: path field + shot search */
  var FLD = [], GC = 80, GR = 50;
  function inPoly(p, x, y) {
    var c = false;
    for (var i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
      var xi = p[i], yi = p[i + 1], xj = p[j], yj = p[j + 1];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  }
  function crosses(ax, ay, bx, by, s) {
    function o(px, py, qx, qy, rx, ry) { return (qx - px) * (ry - py) - (qy - py) * (rx - px); }
    var d1 = o(s[0], s[1], s[2], s[3], ax, ay), d2 = o(s[0], s[1], s[2], s[3], bx, by), d3 = o(ax, ay, bx, by, s[0], s[1]), d4 = o(ax, ay, bx, by, s[2], s[3]);
    return ((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0));
  }
  function cellOf(x, y) { return Math.max(0, Math.min(GR - 1, Math.floor(y / 10))) * GC + Math.max(0, Math.min(GC - 1, Math.floor(x / 10))); }
  function field(hi) {
    if (FLD[hi]) return FLD[hi];
    var h = HOLES[hi], N = GC * GR, dist = [], ok = [], j;
    for (j = 0; j < N; j++) {
      var x = (j % GC) * 10 + 5, y = Math.floor(j / GC) * 10 + 5;
      dist.push(1e9);
      ok.push(inPoly(h.bd, x, y) && !h.zones.some(function (z) { return (z.k === 'water' || z.k === 'lava') && inZ(z, x, y); }));
    }
    var pc = h.pads.map(function (p) { return cellOf(p.x, p.y); });
    var c0 = cellOf(h.cup[0], h.cup[1]); dist[c0] = 0; var bk = [[c0]];
    var NB = [[1, 0, 10], [-1, 0, 10], [0, 1, 10], [0, -1, 10], [1, 1, 14], [1, -1, 14], [-1, 1, 14], [-1, -1, 14]];
    function relax(nj, nd) { if (nd < dist[nj]) { dist[nj] = nd; (bk[nd] || (bk[nd] = [])).push(nj); } }
    for (var d = 0; d < bk.length; d++) {
      var L = bk[d]; if (!L) continue;
      for (var qi = 0; qi < L.length; qi++) {
        j = L[qi]; if (dist[j] !== d) continue;
        for (var p = 0; p < h.pads.length; p++) if (pc[h.pads[p].to] === j) relax(pc[p], d);
        var cx = j % GC, cy = Math.floor(j / GC);
        for (var n = 0; n < 8; n++) {
          var nx = cx + NB[n][0], ny = cy + NB[n][1]; if (nx < 0 || ny < 0 || nx >= GC || ny >= GR) continue;
          var nj = ny * GC + nx; if (!ok[nj] || dist[nj] <= d + NB[n][2]) continue;
          var ax = cx * 10 + 5, ay = cy * 10 + 5, bx = nx * 10 + 5, by = ny * 10 + 5, bl = false;
          for (var s = 0; s < h.segs.length && !bl; s++) bl = crosses(ax, ay, bx, by, h.segs[s]);
          if (!bl) relax(nj, d + NB[n][2]);
        }
      }
    }
    return (FLD[hi] = dist);
  }
  function fcost(hi, x, y) {
    var f = field(hi), h = HOLES[hi], j = cellOf(x, y), v = f[j];
    if (v < 60) return Math.hypot(x - h.cup[0], y - h.cup[1]);
    if (v >= 1e9) { v = 2000; var cx = j % GC, cy = Math.floor(j / GC); for (var a = -1; a <= 1; a++) for (var b = -1; b <= 1; b++) { var nx = cx + a, ny = cy + b; if (nx >= 0 && ny >= 0 && nx < GC && ny < GR) v = Math.min(v, f[ny * GC + nx] + 14); } }
    return v;
  }
  function sim(b0, h, n0, vx, vy) {
    var b = { x: b0.x, y: b0.y, vx: vx, vy: vy, st: 'roll', z: 0, az: 0, tp: b0.tp, k: 0, ls: 0, rt: 0, hz: '' };
    for (var n = n0; n < n0 + 250; n++) {
      for (var u = 0; u < SUB; u++) { var r = sub(b, h, n / 30 + u * SDT, null); if (r) return { r: r, x: b.x, y: b.y, n: n - n0 }; }
      roundBall(b);
    }
    return { r: 'stop', x: b.x, y: b.y, n: 250 };
  }
  function ptrFor(b, a, lp, rad) {
    var px = Math.round(b.x + Math.cos(a) * rad), py = Math.round(b.y + Math.sin(a) * rad);
    if (px === lp[0] && py === lp[1]) px++;
    return [px, py];
  }
  function plan(S, i, rnd) {
    var h = HOLES[S.h], hi = S.h, b = S.b[i], lp = S.lp[i], w = 4 + Math.floor(rnd() * 12), n0 = S.n + w;
    var base = fcost(hi, b.x, b.y);
    function evalShot(a, k) {
      var pt = ptrFor(b, a, lp, 400), aa = aimOf(b, pt[0], pt[1]), v = shotV(aa, k), r = sim(b, h, n0 + k, v[0], v[1]);
      var c = r.r === 'in' ? -1e4 + r.n : r.r === 'haz' ? base + 160 : fcost(hi, r.x, r.y) + r.n * 0.02;
      return { c: c, a: a, k: k };
    }
    var best = [], cand, a, k, j;
    function keep(o) { best.push(o); best.sort(function (p, q) { return p.c - q.c; }); if (best.length > 4) best.pop(); }
    var KS = [4, 8, 12, 17, 23, 29, 36];
    for (j = 0; j < 36; j++) { a = j * TAU / 36; for (k = 0; k < KS.length; k++) keep(evalShot(a, KS[k])); }
    var cp = cupAt(h, n0 / 30), ad = Math.atan2(cp[1] - b.y, cp[0] - b.x);
    for (k = 1; k <= PK; k += 1) keep(evalShot(ad, k));
    var seeds = best.slice();
    for (j = 0; j < seeds.length; j++) {
      cand = seeds[j];
      for (var da = -2; da <= 2; da++) for (var dk = -2; dk <= 2; dk++) {
        var kk = cand.k + dk * (cand.k > 12 ? 2 : 1); if (kk < 1 || kk > PK || (!da && !dk)) continue;
        keep(evalShot(cand.a + da * 0.03, kk));
      }
    }
    var top = best[0];
    var fa = top.a + (rnd() - 0.5) * 0.045, fk = Math.max(1, Math.min(PK, top.k + (rnd() < 0.35 ? (rnd() < 0.5 ? -1 : 1) : 0)));
    var pt = ptrFor(b, fa, lp, 400);
    return { at: n0, k: fk, px: pt[0], py: pt[1] };
  }
  var PLANS = {};
  function bot(S, me, rnd) {
    var o = P.emptyIn(), i = me === 'host' ? 0 : 1, b = S.b && S.b[i];
    if (S.lp) { o.px = S.lp[i][0]; o.py = S.lp[i][1]; }
    if (!b || S.ph !== 'play' || b.st !== 'aim') return { in: o, ev: [] };
    var key = S.sd + '/' + S.h + '/' + b.s + '/' + b.x + ',' + b.y, pl = PLANS[me];
    if (!pl || pl.key !== key) { pl = PLANS[me] = plan(S, i, rnd); pl.key = key; }
    if (S.n < pl.at && !b.ch) return { in: o, ev: [] };
    o.px = pl.px; o.py = pl.py;
    o.a = (!b.ch || b.pk < pl.k) ? 1 : 0;
    return { in: o, ev: [] };
  }

  /* ------------------------------------------------------------------ drawing (read-only) */
  function path(c, p) { c.beginPath(); c.moveTo(p[0], p[1]); for (var i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); c.closePath(); }
  function zpath(c, z, rad) {
    c.beginPath();
    if (z.r) { if (c.roundRect) c.roundRect(z.r[0], z.r[1], z.r[2], z.r[3], rad); else c.rect(z.r[0], z.r[1], z.r[2], z.r[3]); }
    else c.arc(z.c[0], z.c[1], z.c[2], 0, TAU);
  }
  function zbox(z) { return z.r ? z.r : [z.c[0] - z.c[2], z.c[1] - z.c[2], z.c[2] * 2, z.c[2] * 2]; }
  function hsh(n) { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); }
  function loopPt(L, u) {
    var x0 = L.e[0] + L.e[2], x1 = L.o[0], y0 = L.o[1];
    return [x0 + (x1 - x0) * u + 58 * Math.sin(TAU * u), y0 - 100 * (1 - Math.cos(TAU * u)) / 2, Math.sin(PI * u)];
  }
  function drawBackdrop(c, D, t) {
    var g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0f4a37'); g.addColorStop(1, '#06231a');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (var i = 0; i < DECO.length; i++) {
      var d = DECO[i];
      c.fillStyle = d[3] ? 'rgba(30,110,60,.55)' : 'rgba(20,80,45,.6)';
      c.beginPath(); c.arc(d[0], d[1], d[2], 0, TAU); c.arc(d[0] + d[2] * 0.7, d[1] + 4, d[2] * 0.7, 0, TAU); c.fill();
      if (d[3]) { c.fillStyle = ['#ffd166', '#ff7aa8', '#ffffff'][i % 3]; c.beginPath(); c.arc(d[0] - 3, d[1] - 4, 3, 0, TAU); c.arc(d[0] + 6, d[1] + 1, 2.5, 0, TAU); c.fill(); }
    }
  }
  function drawZone(c, z, t) {
    var bx = zbox(z);
    c.save();
    if (z.k === 'sand') {
      zpath(c, z, 22); c.fillStyle = '#e8cf8c'; c.fill(); c.clip();
      c.fillStyle = 'rgba(160,120,50,.35)';
      for (var x = bx[0]; x < bx[0] + bx[2]; x += 11) for (var y = bx[1]; y < bx[1] + bx[3]; y += 11) { var hh = hsh(x * 3.1 + y); c.fillRect(x + hh * 8, y + hsh(hh) * 8, 2, 2); }
      c.lineWidth = 6; c.strokeStyle = 'rgba(150,110,40,.35)'; zpath(c, z, 22); c.stroke();
    } else if (z.k === 'ice') {
      zpath(c, z, 16); var gi = c.createLinearGradient(bx[0], bx[1], bx[0] + bx[2], bx[1] + bx[3]); gi.addColorStop(0, '#d9f4ff'); gi.addColorStop(1, '#9fd8f5');
      c.fillStyle = gi; c.fill(); c.clip();
      c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 3;
      for (var k = 0; k < 6; k++) { var gx = bx[0] + ((k * 70 + t * 40) % (bx[2] + 80)) - 40; c.beginPath(); c.moveTo(gx, bx[1] + bx[3]); c.lineTo(gx + 40, bx[1]); c.stroke(); }
      c.strokeStyle = 'rgba(80,160,210,.5)'; c.lineWidth = 3; zpath(c, z, 16); c.stroke();
    } else if (z.k === 'water' || z.k === 'lava') {
      var lava = z.k === 'lava';
      c.shadowColor = lava ? '#ff6a00' : 'rgba(0,0,0,0)'; c.shadowBlur = lava ? 26 + Math.sin(t * 3) * 6 : 0;
      zpath(c, z, 18);
      var gw = c.createLinearGradient(bx[0], bx[1], bx[0], bx[1] + bx[3]);
      if (lava) { gw.addColorStop(0, '#ff7a1a'); gw.addColorStop(0.5, '#e8361c'); gw.addColorStop(1, '#ff9b2a'); }
      else { gw.addColorStop(0, '#2c8fe0'); gw.addColorStop(1, '#1a5fb0'); }
      c.fillStyle = gw; c.fill(); c.shadowBlur = 0; c.clip();
      if (lava) {
        for (var m = 0; m < 9; m++) {
          var lx = bx[0] + hsh(m) * bx[2], ly = bx[1] + hsh(m + 9) * bx[3], ph = t * 1.3 + m;
          c.fillStyle = 'rgba(255,220,90,' + (0.35 + 0.25 * Math.sin(ph * 2)) + ')';
          c.beginPath(); c.arc(lx + Math.sin(ph) * 12, ly + Math.cos(ph * 0.8) * 8, 10 + 6 * Math.sin(ph * 1.7), 0, TAU); c.fill();
        }
        c.fillStyle = 'rgba(90,10,0,.35)';
        for (var n2 = 0; n2 < 6; n2++) { var cx2 = bx[0] + hsh(n2 + 40) * bx[2], cy2 = bx[1] + hsh(n2 + 50) * bx[3]; c.beginPath(); c.ellipse(cx2, cy2, 22, 9, hsh(n2) * 3, 0, TAU); c.fill(); }
      } else {
        c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2;
        for (var q = 0; q < 7; q++) {
          var wx = bx[0] + hsh(q + 3) * bx[2], wy = bx[1] + hsh(q + 13) * bx[3], rr = ((t * 14 + q * 9) % 32);
          c.globalAlpha = 1 - rr / 32; c.beginPath(); c.ellipse(wx, wy, rr + 4, (rr + 4) * 0.45, 0, 0, TAU); c.stroke();
        }
        c.globalAlpha = 1;
      }
      c.strokeStyle = lava ? 'rgba(80,20,0,.6)' : 'rgba(10,40,90,.55)'; c.lineWidth = 5; zpath(c, z, 18); c.stroke();
    } else if (z.k === 'belt') {
      c.fillStyle = '#353a46'; c.fillRect(bx[0], bx[1], bx[2], bx[3]);
      c.beginPath(); c.rect(bx[0], bx[1], bx[2], bx[3]); c.clip();
      c.strokeStyle = 'rgba(255,209,102,.6)'; c.lineWidth = 5; c.lineJoin = 'round';
      var off = (t * 60) % 30, dy = z.d[1];
      for (var yy = -30; yy < bx[3] + 30; yy += 30) {
        var y0 = bx[1] + (dy < 0 ? yy - off : yy + off), cxm = bx[0] + bx[2] / 2;
        c.beginPath(); c.moveTo(bx[0] + 12, y0 - dy * 9); c.lineTo(cxm, y0 + dy * 6); c.lineTo(bx[0] + bx[2] - 12, y0 - dy * 9); c.stroke();
      }
      c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(bx[0], bx[1], 5, bx[3]); c.fillRect(bx[0] + bx[2] - 5, bx[1], 5, bx[3]);
    } else if (z.k === 'ramp') {
      c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(bx[0] + 6, bx[1] + 8, bx[2], bx[3]);
      var gr = c.createLinearGradient(bx[0], 0, bx[0] + bx[2], 0); gr.addColorStop(0, '#8a5427'); gr.addColorStop(1, '#e0a565');
      c.fillStyle = gr; c.fillRect(bx[0], bx[1], bx[2], bx[3]);
      c.strokeStyle = 'rgba(70,35,10,.5)'; c.lineWidth = 2;
      for (var s2 = 1; s2 < 5; s2++) { c.beginPath(); c.moveTo(bx[0] + s2 * bx[2] / 5, bx[1]); c.lineTo(bx[0] + s2 * bx[2] / 5, bx[1] + bx[3]); c.stroke(); }
      c.fillStyle = '#fff3c4'; var mx = bx[0] + bx[2] / 2, my = bx[1] + bx[3] / 2;
      c.beginPath(); c.moveTo(mx + 14, my); c.lineTo(mx - 8, my - 14); c.lineTo(mx - 8, my + 14); c.closePath(); c.fill();
    }
    c.restore();
  }
  function drawWalls(c, segs, low) {
    c.lineCap = 'round'; c.lineJoin = 'round';
    var pass = [[low ? 'rgba(0,0,0,.28)' : 'rgba(0,0,0,.35)', 13, 3, 5], [low ? '#2d7d3c' : '#9a5f2c', 11, 0, 0], [low ? '#4fb862' : '#d99b5c', 4, -1.5, -2]];
    pass.forEach(function (ps) {
      c.strokeStyle = ps[0]; c.lineWidth = ps[1]; c.beginPath();
      segs.forEach(function (q) { if (!!q[4] !== low) return; c.moveTo(q[0] + ps[2], q[1] + ps[3]); c.lineTo(q[2] + ps[2], q[3] + ps[3]); });
      c.stroke();
    });
    if (low) {
      c.fillStyle = 'rgba(120,210,120,.55)';
      segs.forEach(function (q) { if (!q[4]) return; var L = Math.hypot(q[2] - q[0], q[3] - q[1]); for (var d = 8; d < L; d += 16) { var f = d / L; c.beginPath(); c.arc(q[0] + (q[2] - q[0]) * f, q[1] + (q[3] - q[1]) * f - 2, 3, 0, TAU); c.fill(); } });
    }
  }
  function drawCourse(c, D, h, hi, T, t, fxList) {
    /* drop shadow + grass with mowing stripes */
    c.save(); c.translate(7, 9); path(c, h.bd); c.fillStyle = 'rgba(0,0,0,.4)'; c.fill(); c.restore();
    c.save(); path(c, h.bd);
    var g = c.createLinearGradient(0, 120, 0, 480); g.addColorStop(0, '#5cc463'); g.addColorStop(1, '#3f9d4b');
    c.fillStyle = g; c.fill(); c.clip();
    c.fillStyle = 'rgba(255,255,255,.07)';
    for (var x = -400; x < W + 400; x += 56) { c.beginPath(); c.moveTo(x, 80); c.lineTo(x + 28, 80); c.lineTo(x + 28 + 180, 500); c.lineTo(x + 180, 500); c.closePath(); c.fill(); }
    c.restore();
    h.zones.forEach(function (z) { if (z.k !== 'ramp') drawZone(c, z, t); });
    /* tee mat */
    var tm = [(h.tee[0][0] + h.tee[1][0]) / 2, (h.tee[0][1] + h.tee[1][1]) / 2];
    D.rrect(c, tm[0] - 22, tm[1] - 34, 44, 68, 10, 'rgba(20,90,40,.55)', 'rgba(255,255,255,.25)');
    /* teleporter pads */
    h.pads.forEach(function (p, i) {
      c.save(); c.translate(p.x, p.y);
      c.fillStyle = 'rgba(20,10,40,.65)'; c.beginPath(); c.arc(0, 0, 17, 0, TAU); c.fill();
      c.shadowColor = p.c; c.shadowBlur = 16; c.strokeStyle = p.c; c.lineWidth = 3;
      for (var r = 0; r < 3; r++) { c.beginPath(); c.arc(0, 0, 6 + r * 4.5, t * (3 - r) * (i % 2 ? -1 : 1) + r, t * (3 - r) * (i % 2 ? -1 : 1) + r + 4.2); c.stroke(); }
      if (p.d) { c.shadowBlur = 0; c.fillStyle = 'rgba(255,255,255,.85)'; c.rotate(Math.atan2(p.d[1], p.d[0])); c.beginPath(); c.moveTo(27, 0); c.lineTo(19, -6); c.lineTo(19, 6); c.closePath(); c.fill(); }
      c.restore();
    });
    /* bumpers */
    h.bump.forEach(function (q) {
      var lit = fxList.some(function (f) { return f.k === 'bump' && f.t < 0.3 && f.x === Math.round(q[0]) && f.y === Math.round(q[1]); });
      c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.arc(q[0] + 4, q[1] + 6, q[2], 0, TAU); c.fill();
      c.save(); if (lit) { c.shadowColor = '#fff36b'; c.shadowBlur = 30; }
      c.fillStyle = lit ? '#fff36b' : '#e8344e'; c.beginPath(); c.arc(q[0], q[1], q[2], 0, TAU); c.fill(); c.restore();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(q[0], q[1], q[2] * 0.62, 0, TAU); c.fill();
      c.fillStyle = lit ? '#ff8a00' : '#e8344e'; c.beginPath(); c.arc(q[0], q[1], q[2] * 0.36, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.arc(q[0] - q[2] * 0.4, q[1] - q[2] * 0.45, q[2] * 0.18, 0, TAU); c.fill();
    });
    /* loop structure (base) */
    if (h.loop) drawLoop(c, h.loop, false);
    drawWalls(c, h.segs, true);
    drawWalls(c, h.segs, false);
    h.zones.forEach(function (z) { if (z.k === 'ramp') drawZone(c, z, t); });
    /* sliders */
    h.slid.forEach(function (q) {
      var s = slidSeg(q, T); c.lineCap = 'round';
      c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 14; c.beginPath(); c.moveTo(s[0] + 3, s[1] + 5); c.lineTo(s[2] + 3, s[3] + 5); c.stroke();
      c.strokeStyle = '#8f99a8'; c.lineWidth = 14; c.beginPath(); c.moveTo(s[0], s[1]); c.lineTo(s[2], s[3]); c.stroke();
      c.strokeStyle = '#ffd166'; c.lineWidth = 6; c.setLineDash([6, 6]); c.beginPath(); c.moveTo(s[0], s[1]); c.lineTo(s[2], s[3]); c.stroke(); c.setLineDash([]);
    });
    /* cannon */
    if (h.can) {
      var C = h.can, an = Math.atan2(C.d[1], C.d[0]);
      c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.arc(C.x + 4, C.y + 6, 22, 0, TAU); c.fill();
      c.fillStyle = '#5b4636'; c.beginPath(); c.arc(C.x, C.y, 22, 0, TAU); c.fill();
      c.save(); c.translate(C.x, C.y); c.rotate(an);
      var gb = c.createLinearGradient(0, -10, 0, 10); gb.addColorStop(0, '#6b7280'); gb.addColorStop(0.5, '#cbd5e1'); gb.addColorStop(1, '#374151');
      c.fillStyle = gb; D.rrect(c, -6, -11, 42, 22, 6, null); c.fill();
      c.fillStyle = '#111'; c.beginPath(); c.ellipse(36, 0, 4, 9, 0, 0, TAU); c.fill();
      c.restore();
      c.fillStyle = '#2b2b2b'; c.beginPath(); c.arc(C.x, C.y, 11, 0, TAU); c.fill();
    }
    /* cup + magnet + flag */
    var cp = cupAt(h, T);
    if (h.mag) {
      c.strokeStyle = 'rgba(255,90,120,.35)'; c.lineWidth = 2;
      for (var mr = 0; mr < 3; mr++) { var rr2 = h.mag[0] - ((t * 30 + mr * h.mag[0] / 3) % h.mag[0]); c.globalAlpha = rr2 / h.mag[0]; c.beginPath(); c.arc(cp[0], cp[1], rr2, 0, TAU); c.stroke(); }
      c.globalAlpha = 1;
      if (h.cm) { c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 3; c.setLineDash([4, 8]); c.beginPath(); c.moveTo(h.cup[0] - h.cm[0], h.cup[1] - h.cm[1]); c.lineTo(h.cup[0] + h.cm[0], h.cup[1] + h.cm[1]); c.stroke(); c.setLineDash([]); }
    }
    c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.ellipse(cp[0], cp[1] + 1, 14, 12, 0, 0, TAU); c.fill();
    c.fillStyle = '#10200f'; c.beginPath(); c.ellipse(cp[0], cp[1], 11.5, 10.5, 0, 0, TAU); c.fill();
    c.fillStyle = '#000'; c.beginPath(); c.ellipse(cp[0], cp[1] + 2, 8, 6.5, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 3; c.beginPath(); c.moveTo(cp[0] + 2, cp[1]); c.lineTo(cp[0] + 18, cp[1] - 8); c.stroke();
    c.strokeStyle = '#f3f3f3'; c.lineWidth = 3; c.beginPath(); c.moveTo(cp[0], cp[1]); c.lineTo(cp[0], cp[1] - 50); c.stroke();
    var wv = Math.sin(t * 5) * 4;
    c.fillStyle = h.mag ? '#ff4f7b' : '#ffcf3f';
    c.beginPath(); c.moveTo(cp[0], cp[1] - 50); c.quadraticCurveTo(cp[0] + 16, cp[1] - 50 + wv, cp[0] + 32, cp[1] - 42 + wv); c.quadraticCurveTo(cp[0] + 16, cp[1] - 36 - wv, cp[0], cp[1] - 32); c.closePath(); c.fill();
    D.text(c, hi + 1, cp[0] + 12, cp[1] - 41, 11, '#3a2400');
  }
  function drawLoop(c, L, front) {
    var D0 = P.draw;
    var pts = [], u;
    for (u = 0; u <= 1.0001; u += 0.025) pts.push(loopPt(L, u));
    if (!front) {
      /* launch block */
      c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(226, 352, 116, 76);
      var g = c.createLinearGradient(0, 348, 0, 422); g.addColorStop(0, '#7c5cff'); g.addColorStop(1, '#4b2fbf');
      c.fillStyle = g; c.fillRect(222, 348, 116, 74);
      c.fillStyle = 'rgba(255,255,255,.12)'; for (var s = 0; s < 6; s++) c.fillRect(226 + s * 20, 348, 10, 74);
      /* entry arrow */
      c.fillStyle = 'rgba(255,209,102,.85)'; c.beginPath(); c.moveTo(212, 385); c.lineTo(196, 372); c.lineTo(196, 398); c.closePath(); c.fill();
      var tp = loopPt(L, 0.5); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 8; c.beginPath(); c.moveTo(tp[0] + 4, 352); c.lineTo(tp[0] + 4, tp[1] + 10); c.stroke();
      c.strokeStyle = '#9aa3b5'; c.lineWidth = 6; c.beginPath(); c.moveTo(tp[0], 350); c.lineTo(tp[0], tp[1] + 6); c.stroke();
      D0.otext(c, 'LOOP', 280, 400, 16, '#fff');
    }
    /* tube: back half (top of loop) darker, front half bright */
    c.lineCap = 'round';
    for (var pass = 0; pass < 2; pass++) {
      c.beginPath(); var started = false;
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i], uu = i / (pts.length - 1), isBack = uu > 0.25 && uu < 0.75;
        if (isBack === front) { started = false; continue; }
        if (!started) { c.moveTo(p[0], p[1]); started = true; } else c.lineTo(p[0], p[1]);
      }
      c.strokeStyle = pass ? (front ? '#ffd166' : '#b08a30') : 'rgba(30,10,60,.8)'; c.lineWidth = pass ? 9 : 17; c.stroke();
    }
  }
  function drawMill(c, m, T) {
    /* house */
    c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(m.x - 26, m.y - 26, 60, 66);
    var g = c.createLinearGradient(m.x - 30, 0, m.x + 30, 0); g.addColorStop(0, '#c2464f'); g.addColorStop(1, '#8e2a33');
    c.fillStyle = g; c.fillRect(m.x - 30, m.y - 30, 60, 64);
    c.fillStyle = '#5a2b16'; c.beginPath(); c.moveTo(m.x - 38, m.y - 28); c.lineTo(m.x, m.y - 62); c.lineTo(m.x + 38, m.y - 28); c.closePath(); c.fill();
    c.fillStyle = '#ffe9a8'; c.fillRect(m.x - 8, m.y + 12, 16, 22);
    /* sails */
    for (var i = 0; i < 4; i++) {
      var an = m.w * T + i * PI / 2;
      c.save(); c.translate(m.x, m.y); c.rotate(an);
      c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(14, 4, m.l - 12, 18);
      c.fillStyle = '#6b3d1e'; c.fillRect(0, -3, m.l, 6);
      c.fillStyle = 'rgba(255,248,230,.95)'; c.fillRect(16, -9, m.l - 18, 16);
      c.strokeStyle = '#8a5a30'; c.lineWidth = 1.5;
      for (var s = 16; s < m.l; s += 14) { c.beginPath(); c.moveTo(s, -9); c.lineTo(s, 7); c.stroke(); }
      c.strokeRect(16, -9, m.l - 18, 16);
      c.restore();
    }
    c.fillStyle = '#3a220f'; c.beginPath(); c.arc(m.x, m.y, 8, 0, TAU); c.fill();
    c.fillStyle = '#d4a15b'; c.beginPath(); c.arc(m.x, m.y, 4, 0, TAU); c.fill();
  }
  function drawFx(c, S, t) {
    S.fx.forEach(function (f, n) {
      var k = f.t, a = Math.max(0, 1 - k), i;
      c.save(); c.globalAlpha = a;
      if (f.k === 'splash') {
        c.strokeStyle = '#d8f1ff'; c.lineWidth = 3; c.beginPath(); c.ellipse(f.x, f.y, 10 + k * 40, 5 + k * 18, 0, 0, TAU); c.stroke();
        c.fillStyle = '#bfe6ff';
        for (i = 0; i < 12; i++) { var an = i / 12 * TAU, d = k * 55; c.beginPath(); c.arc(f.x + Math.cos(an) * d, f.y + Math.sin(an) * d * 0.6 - Math.sin(k * PI) * 30, 4 * a + 1, 0, TAU); c.fill(); }
      } else if (f.k === 'fire') {
        for (i = 0; i < 12; i++) {
          var fx = f.x + Math.sin(i * 2.3 + k * 6) * 14 * (0.4 + k), fy = f.y - k * (40 + (i % 4) * 18);
          c.fillStyle = i % 3 === 0 ? 'rgba(90,90,90,.7)' : i % 3 === 1 ? '#ffb02e' : '#ff5a1f';
          c.beginPath(); c.arc(fx, fy, (i % 3 === 0 ? 9 : 6) * (1 - k * 0.5), 0, TAU); c.fill();
        }
      } else if (f.k === 'bump' || f.k === 'tele' || f.k === 'land' || f.k === 'jump') {
        c.strokeStyle = f.k === 'tele' ? '#d6a8ff' : f.k === 'bump' ? '#fff36b' : 'rgba(255,240,200,.9)'; c.lineWidth = f.k === 'bump' ? 4 : 3;
        c.beginPath(); c.arc(f.x, f.y, (f.k === 'bump' ? 24 : 8) + k * 34, 0, TAU); c.stroke();
      } else if (f.k === 'boom') {
        c.fillStyle = '#ffd36b'; c.beginPath(); c.arc(f.x, f.y, 8 + k * 30, 0, TAU); c.fill();
        c.fillStyle = 'rgba(120,120,120,.7)'; for (i = 0; i < 6; i++) { c.beginPath(); c.arc(f.x + Math.cos(i) * k * 40, f.y + Math.sin(i) * k * 40, 10 * a + 2, 0, TAU); c.fill(); }
      } else if (f.k === 'sink') {
        c.strokeStyle = '#ffd166'; c.lineWidth = 3;
        for (i = 0; i < 12; i++) { var aa = i / 12 * TAU; c.beginPath(); c.moveTo(f.x + Math.cos(aa) * (6 + k * 20), f.y + Math.sin(aa) * (6 + k * 20)); c.lineTo(f.x + Math.cos(aa) * (14 + k * 46), f.y + Math.sin(aa) * (14 + k * 46)); c.stroke(); }
      } else if (f.k === 'clack') {
        c.fillStyle = '#fff'; for (i = 0; i < 8; i++) { var ac = i / 8 * TAU + n; c.beginPath(); c.arc(f.x + Math.cos(ac) * k * 30, f.y + Math.sin(ac) * k * 30, 3 * a + 1, 0, TAU); c.fill(); }
      }
      c.restore();
    });
  }
  /* raycast for the aim guide: march a probe ball, return first contact point + reflected dir */
  function probeHit(h, x, y, dx, dy, maxL, T) {
    var pb = { x: x, y: y, vx: 0, vy: 0 };
    for (var d = 4; d < maxL; d += 4) {
      pb.x = x + dx * d; pb.y = y + dy * d;
      var best = null;
      for (var i = 0; i < h.segs.length; i++) {
        var q = h.segs[i], sx = q[2] - q[0], sy = q[3] - q[1], L = sx * sx + sy * sy, tt = ((pb.x - q[0]) * sx + (pb.y - q[1]) * sy) / L;
        tt = tt < 0 ? 0 : tt > 1 ? 1 : tt;
        var nx = pb.x - (q[0] + sx * tt), ny = pb.y - (q[1] + sy * tt), dd = Math.hypot(nx, ny);
        if (dd < R + TH) { best = [nx / (dd || 1), ny / (dd || 1)]; break; }
      }
      if (!best) for (var j = 0; j < h.bump.length; j++) { var b = h.bump[j], bx = pb.x - b[0], by = pb.y - b[1], bd = Math.hypot(bx, by); if (bd < R + b[2]) { best = [bx / bd, by / bd]; break; } }
      if (best) { var vn = dx * best[0] + dy * best[1]; return { x: pb.x, y: pb.y, d: d, rx: dx - 2 * vn * best[0], ry: dy - 2 * vn * best[1] }; }
    }
    return { x: x + dx * maxL, y: y + dy * maxL, d: maxL, rx: 0, ry: 0 };
  }
  function dots(c, x1, y1, x2, y2, col, off) {
    var L = Math.hypot(x2 - x1, y2 - y1); c.fillStyle = col;
    for (var d = off; d < L; d += 14) { c.beginPath(); c.arc(x1 + (x2 - x1) * d / L, y1 + (y2 - y1) * d / L, 2.6, 0, TAU); c.fill(); }
  }
  function drawBall(c, D, S, h, i, me, info, t) {
    var b = S.b[i], who = WHO[i], col = COL[who], isMe = me === who, nm = info.names[who];
    if (b.st === 'in' || b.st === 'haz') return;
    if (b.st === 'can') { c.save(); c.shadowColor = col; c.shadowBlur = 20; c.fillStyle = col; c.beginPath(); c.arc(h.can.x, h.can.y, 8 + Math.sin(t * 20) * 2, 0, TAU); c.fill(); c.restore(); return; }
    var x = b.x, y = b.y, lift = 0, sc = 1;
    if (b.st === 'loop') { var lp = loopPt(h.loop, 1 - b.k / h.loop.t); x = lp[0]; y = lp[1]; sc = 1 - 0.25 * lp[2]; }
    if (b.z > 0 && b.az > 0) { var u = 1 - b.z / b.az; lift = Math.sin(PI * u) * 34 * b.az; sc = 1 + lift / 45; }
    c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(x + 3 + lift * 0.3, y + 5 + lift * 0.4, 9 * (1 - lift / 120), 6 * (1 - lift / 120), 0, 0, TAU); c.fill();
    if (b.st === 'done') { c.globalAlpha = 0.5; }
    D.player(c, x, y - lift, 9 * sc, who, nm, isMe);
    c.globalAlpha = 1;
    if (b.ch) {
      var f = b.pk / PK, bx = x + 20, by = y - 30;
      D.rrect(c, bx - 2, by - 2, 13, 58, 6, 'rgba(10,10,25,.85)', 'rgba(255,255,255,.6)');
      var gcol = f < 0.45 ? COL.good : f < 0.8 ? COL.gold : COL.bad;
      c.save(); c.shadowColor = gcol; c.shadowBlur = 10; D.rrect(c, bx + 1, by + 1 + 52 * (1 - f), 7, Math.max(3, 52 * f), 3, gcol); c.restore();
    }
  }
  function drawCard(c, D, S, info, t) {
    var x0 = 70, y0 = 108, w = 660, hh = 214, last = S.h >= HOLES.length - 1;
    D.rrect(c, x0, y0, w, hh, 20, 'rgba(10,14,30,.92)', 'rgba(255,209,102,.6)');
    D.otext(c, last ? 'Final Scorecard' : 'Hole ' + (S.h + 1) + ' complete!', W / 2, y0 + 28, 24, COL.gold);
    var cx = x0 + 160, cw = 46, rows = [y0 + 66, y0 + 100, y0 + 140, y0 + 180];
    D.text(c, 'Hole', x0 + 24, rows[0], 15, '#c9c6f0', 'left', 700);
    D.text(c, 'Par', x0 + 24, rows[1], 15, '#c9c6f0', 'left', 700);
    D.text(c, info.names.host, x0 + 24, rows[2], 17, COL.host, 'left', 800);
    D.text(c, info.names.guest, x0 + 24, rows[3], 17, COL.guest, 'left', 800);
    var tot = totals(S, false), ptot = 0;
    for (var j = 0; j < HOLES.length; j++) {
      var x = cx + j * cw + cw / 2;
      if (j === S.h) D.rrect(c, x - cw / 2 + 2, rows[0] - 16, cw - 4, rows[3] - rows[0] + 32, 10, 'rgba(255,209,102,.14)');
      D.text(c, j + 1, x, rows[0], 15, '#fff', 'center', 800);
      D.text(c, HOLES[j].par, x, rows[1], 15, '#c9c6f0', 'center', 600); ptot += HOLES[j].par;
      for (var i = 0; i < 2; i++) {
        var v = S.card[i][j];
        if (v == null) { D.text(c, '·', x, rows[2 + i], 18, '#666'); continue; }
        var p = HOLES[j].par, colr = v === 1 ? COL.gold : v < p ? COL.good : v === p ? '#fff' : v >= 9 ? COL.bad : '#ffb36b';
        if (v < p) { c.strokeStyle = colr; c.lineWidth = 2; c.beginPath(); c.arc(x, rows[2 + i], 13, 0, TAU); c.stroke(); }
        D.text(c, v, x, rows[2 + i], 18, colr, 'center', 800);
      }
    }
    var tx = cx + 9 * cw + 34;
    D.text(c, 'Tot', tx, rows[0], 15, '#fff', 'center', 800);
    D.text(c, ptot, tx, rows[1], 15, '#c9c6f0', 'center', 600);
    D.otext(c, tot[0], tx, rows[2], 22, COL.host); D.otext(c, tot[1], tx, rows[3], 22, COL.guest);
    c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 1; c.beginPath();
    [rows[0] + 17, rows[1] + 20, rows[2] + 20].forEach(function (y) { c.moveTo(x0 + 18, y); c.lineTo(x0 + w - 18, y); }); c.stroke();
    var lead = tot[0] === tot[1] ? 'All square!' : (tot[0] < tot[1] ? info.names.host : info.names.guest) + ' leads by ' + Math.abs(tot[0] - tot[1]);
    var nx = last ? null : HOLES[S.h + 1];
    D.rrect(c, W / 2 - 230, y0 + hh + 14, 460, 58, 18, 'rgba(10,14,30,.85)', 'rgba(255,255,255,.25)');
    D.text(c, nx ? 'Next: Hole ' + (S.h + 2) + ' · ' + nx.name + ' · Par ' + nx.par : (tot[0] === tot[1] ? 'Dead heat!' : (tot[0] < tot[1] ? info.names.host : info.names.guest) + ' wins!'), W / 2, y0 + hh + 34, 18, '#fff', 'center', 800);
    D.text(c, lead, W / 2, y0 + hh + 56, 13, '#c9c6f0', 'center', 600);
    D.bar(c, W / 2 - 200, y0 + hh + 80, 400, 8, 1 - S.ct / CARD_T, COL.gold);
  }
  function draw(c, S, me, D, info) {
    var t = performance.now() / 1000, card = S.ph === 'card';
    drawBackdrop(c, D, t);
    var hi = S.h, h = HOLES[hi], T = S.n / 30;
    if (card && S.ct < CARD_T - 1.2 && hi < HOLES.length - 1) {
      /* flyover of the next hole */
      var p = 1 - S.ct / (CARD_T - 1.2), sc = 1.3 - 0.3 * p, nh = HOLES[hi + 1];
      c.save(); c.translate(W / 2, 300); c.scale(sc, sc); c.translate(-W / 2 + (1 - p) * 120, -300);
      drawCourse(c, D, nh, hi + 1, 0, t, []); if (nh.mill) drawMill(c, nh.mill, t * nh.mill.w); if (nh.loop) drawLoop(c, nh.loop, true);
      c.restore();
      c.fillStyle = 'rgba(5,10,20,.35)'; c.fillRect(0, 0, W, H);
    } else {
      drawCourse(c, D, h, hi, T, t, S.fx);
      /* trails */
      for (var i = 0; i < 2; i++) {
        var tr = S.tr[i]; if (tr.length < 4) continue;
        c.lineCap = 'round';
        for (var j = 2; j < tr.length; j += 2) { c.strokeStyle = COL[WHO[i]]; c.globalAlpha = 0.08 + 0.5 * j / tr.length; c.lineWidth = 2 + 8 * j / tr.length; c.beginPath(); c.moveTo(tr[j - 2], tr[j - 1]); c.lineTo(tr[j], tr[j + 1]); c.stroke(); }
        c.globalAlpha = 1;
      }
      var mi = me === 'host' ? 0 : 1, mb = S.b[mi];
      /* aim guides */
      for (i = 0; i < 2; i++) {
        var b = S.b[i]; if (b.st !== 'aim' || card) continue;
        var dx = Math.cos(b.a), dy = Math.sin(b.a);
        if (i === mi) {
          var ph = (t * 30) % 14, hp = probeHit(h, b.x, b.y, dx, dy, 520, T);
          dots(c, b.x + dx * 12, b.y + dy * 12, hp.x, hp.y, 'rgba(255,255,255,.9)', ph);
          if (hp.rx || hp.ry) { var h2 = probeHit(h, hp.x, hp.y, hp.rx, hp.ry, 110, T); dots(c, hp.x, hp.y, h2.x, h2.y, 'rgba(255,255,255,.45)', ph); c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.arc(hp.x, hp.y, 6, 0, TAU); c.stroke(); }
        } else {
          c.strokeStyle = COL[WHO[i]]; c.globalAlpha = 0.55; c.lineWidth = 3; c.beginPath(); c.moveTo(b.x + dx * 14, b.y + dy * 14); c.lineTo(b.x + dx * 40, b.y + dy * 40); c.stroke(); c.globalAlpha = 1;
        }
      }
      if (h.loop) drawLoop(c, h.loop, true);
      /* balls: others first so mine is on top */
      drawBall(c, D, S, h, 1 - mi, me, info, t);
      drawBall(c, D, S, h, mi, me, info, t);
      if (h.mill) drawMill(c, h.mill, T);
      drawFx(c, S, t);
      S.pops.forEach(function (p) {
        var k = p.t / 1.5, s = p.z * (k < 0.12 ? 0.6 + k / 0.12 * 0.4 : 1);
        c.globalAlpha = Math.max(0, Math.min(1, (1.5 - p.t) / 0.4)); D.otext(c, p.s, p.x, p.y - k * 40, s, p.c); c.globalAlpha = 1;
      });
      if (card) { c.fillStyle = 'rgba(5,10,20,.45)'; c.fillRect(0, 0, W, H); }
    }
    /* HUD */
    var tot = totals(S, true), left = card ? S.ct : Math.max(0, S.lim - T);
    D.hud(c, { left: left, names: info.names }, tot[0], tot[1], 'Hole ' + (hi + 1) + '/9 · Par ' + h.par + ' · ' + h.name);
    if (!card) {
      for (var q = 0; q < 2; q++) {
        var bb = S.b[q], tx = q ? W - 91 : 91, lbl = bb.st === 'in' ? '✓ In: ' + bb.s : bb.st === 'done' ? '✗ ' + 9 : 'Strokes: ' + bb.s + '/' + MAXS;
        D.rrect(c, tx - 58, 62, 116, 22, 11, 'rgba(14,10,40,.75)');
        D.text(c, lbl, tx, 73, 13, bb.st === 'in' ? COL.good : '#fff', 'center', 700);
      }
      var one = (S.b[0].st === 'in' || S.b[0].st === 'done') !== (S.b[1].st === 'in' || S.b[1].st === 'done');
      if (one && S.lim - T <= HURRY) {
        var pulse = 0.75 + 0.25 * Math.sin(t * 8);
        D.rrect(c, W / 2 - 120, 452, 240, 34, 17, 'rgba(120,20,30,' + (0.75 * pulse) + ')');
        D.otext(c, '⏱ Hurry! ' + Math.ceil(S.lim - T) + 's left', W / 2, 469, 18, '#fff');
      }
      if (S.n < 75 && hi === 0 && !card) D.otext(c, 'Aim ←/→ or mouse · hold Space to power up', W / 2, 470, 16, '#fff');
    } else drawCard(c, D, S, info, t);
  }

  P.standalone({
    id: 'crazy-golf', name: 'Crazy Mini Golf', icon: '⛳', cat: 'Sports',
    blurb: '9 wild holes, both of you putting at once — bump each other into the lava.',
    howto: 'Play 9 crazy holes at the same time on the same course: sink your ball in as few strokes as you can. Fast balls lip out, water and lava cost +1 stroke, and you can knock your rival around. Lowest total wins!',
    controls: 'Aim: ←/→ or mouse · Power: hold Space or mouse button, release to putt · Shift: cancel',
    duration: 600,
    init: function (rnd) {
      var S = { h: 0, sd: Math.floor(rnd() * 1000), card: [[], []], lp: [[400, 250], [400, 250]], fx: [], pops: [] };
      setupHole(S);
      return S;
    },
    step: step,
    timeout: function (S) { return resultOf(S); },
    draw: draw,
    bot: bot
  });
})();
