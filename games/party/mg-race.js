/* Party Rush minigames: RACE / MASH group.
   Tug of War, Turbo Sprint, Rocket Pump, Hammer Spin, Cliff Climb, Tower Stack, Sky Dive. */
(function () {
  var P = window.PARTY, W = 800, H = 500, WHO = ['host', 'guest'];
  var DK = { arrowleft: 'L', a: 'L', arrowright: 'R', d: 'R', arrowup: 'U', w: 'U', arrowdown: 'D', s: 'D' };
  var KN = { L: 'arrowleft', R: 'arrowright', U: 'arrowup', D: 'arrowdown' };
  var PINK = '#ff5c8a', BLUE = '#58c7ff', GOLD = '#ffd166';

  /* ---------- shared helpers ---------- */
  function dirs(list, tapMode) {
    var o = [];
    for (var i = 0; i < list.length; i++) {
      var e = list[i];
      if (e.t === 'key' && DK[e.k]) o.push(DK[e.k]);
      else if (e.t === 'tap' && tapMode) { var d = tapMode(e); if (d) o.push(d); }
    }
    return o;
  }
  function mash(list) { var n = 0; for (var i = 0; i < list.length; i++) if (list[i].t === 'a' || list[i].t === 'tap') n++; return n; }
  function r1(v) { return Math.round(v * 10) / 10; }
  function r2(v) { return Math.round(v * 1000) / 1000; }
  function addFx(S, o) { o.T = o.t; S.fx.push(o); if (S.fx.length > 22) S.fx.shift(); }
  function ageFx(S, dt) { S.fx = S.fx.filter(function (f) { f.t = r2(f.t - dt); return f.t > 0; }); }
  function kev(d) { return { t: 'key', k: KN[d] }; }
  function winner(a, b) { return a > b ? 'host' : b > a ? 'guest' : 'tie'; }
  function col(i) { return i ? BLUE : PINK; }
  function vgrad(c, y0, y1, a, b) { var g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; }
  function alpha(c, a) { c.globalAlpha = Math.max(0, Math.min(1, a)); }
  /* generic effects: txt (rising pop text), puff (expanding dust), burst (radial sparks) */
  function drawFx(c, S, D, oy) {
    oy = oy || 0;
    S.fx.forEach(function (f) {
      var p = 1 - f.t / f.T;
      if (f.k === 'txt') { alpha(c, f.t / f.T * 1.6); D.otext(c, f.s, f.x, f.y + oy - p * 46, f.z || 26, f.c || '#fff'); }
      else if (f.k === 'puff') { alpha(c, (1 - p) * 0.7); c.fillStyle = f.c || 'rgba(230,210,170,1)'; c.beginPath(); c.arc(f.x + (f.dx || 0) * p * 30, f.y + oy - p * 10, 6 + p * 18, 0, 7); c.fill(); }
      else if (f.k === 'burst') {
        alpha(c, 1 - p); c.strokeStyle = f.c || GOLD; c.lineWidth = 4;
        for (var a = 0; a < 10; a++) { var an = a / 10 * Math.PI * 2, r0 = 10 + p * 30, r1_ = 22 + p * 52; c.beginPath(); c.moveTo(f.x + Math.cos(an) * r0, f.y + oy + Math.sin(an) * r0); c.lineTo(f.x + Math.cos(an) * r1_, f.y + oy + Math.sin(an) * r1_); c.stroke(); }
      }
      c.globalAlpha = 1;
    });
  }
  function arrow(c, x, y, s, d, fill, stroke) {
    var rot = { R: 0, D: Math.PI / 2, L: Math.PI, U: -Math.PI / 2 }[d];
    c.save(); c.translate(x, y); c.rotate(rot); c.beginPath();
    c.moveTo(s * 0.55, 0); c.lineTo(0, -s * 0.5); c.lineTo(0, -s * 0.2); c.lineTo(-s * 0.5, -s * 0.2);
    c.lineTo(-s * 0.5, s * 0.2); c.lineTo(0, s * 0.2); c.lineTo(0, s * 0.5); c.closePath();
    c.fillStyle = fill; c.fill(); if (stroke) { c.lineWidth = 3; c.strokeStyle = stroke; c.stroke(); }
    c.restore();
  }
  function keyCap(c, D, x, y, w, label, on, accent) {
    D.rrect(c, x - w / 2, y - 26, w, 52, 12, on ? accent : 'rgba(255,255,255,.1)', on ? '#fff' : 'rgba(255,255,255,.25)');
    D.text(c, label, x, y + 1, 26, on ? '#1a1033' : 'rgba(255,255,255,.5)');
  }
  function banner(c, D, txt, colr, y) {
    D.rrect(c, W / 2 - 230, (y || 230) - 38, 460, 76, 22, 'rgba(10,8,30,.72)', colr);
    D.otext(c, txt, W / 2, y || 230, 40, colr);
  }

  /* =====================================================================
     1. TUG OF WAR
     ===================================================================== */
  var TUG_EDGE = 92;
  P.add({
    id: 'tug-of-war', name: 'Tug of War', icon: '🪢', cat: 'Race',
    howto: 'Mash Space to haul the rope your way. Drag your rival into the mud pit to win, or have the rope on your side when time runs out!',
    controls: 'Pull: mash Space (or click)',
    duration: 25,
    init: function (rnd) { return { p: 0, v: 0, bud: [2, 2], taps: [0, 0], rate: [0, 0], st: 'go', ot: 0, fall: -1, fx: [], score: [0, 0] }; },
    step: function (S, dt, inp, ev, rnd) {
      ageFx(S, dt);
      if (S.st === 'end') {
        S.ot = r2(S.ot + dt);
        if (S.ot > 1.1) S.result = { winner: S.fall ? 'host' : 'guest', text: 'Into the mud! ' + S.taps[0] + ' - ' + S.taps[1] + ' pulls' };
        return;
      }
      var n = [0, 0];
      for (var i = 0; i < 2; i++) {
        S.bud[i] = Math.min(2, S.bud[i] + 15 * dt);
        var k = mash(ev[WHO[i]]);
        while (k-- > 0 && S.bud[i] >= 1) { S.bud[i] -= 1; n[i]++; }
        S.bud[i] = r2(S.bud[i]);
        S.taps[i] += n[i];
        S.rate[i] = r1(S.rate[i] * 0.92 + n[i] * 30 * 0.08);
        if (n[i] && S.taps[i] % 4 === 0) addFx(S, { k: 'puff', x: i ? 560 + S.p + 30 : 240 + S.p - 30, y: 352, dx: i ? 1 : -1, t: 0.5 });
      }
      S.v += (n[1] - n[0]) * 6.5;
      S.v *= Math.exp(-3 * dt);
      S.p = r1(S.p + S.v * dt);
      S.v = r1(S.v);
      S.score = [S.taps[0], S.taps[1]];
      if (S.p >= TUG_EDGE || S.p <= -TUG_EDGE) {
        S.fall = S.p >= TUG_EDGE ? 0 : 1; S.st = 'end'; S.ot = 0;
        addFx(S, { k: 'burst', x: 400, y: 345, c: '#8a5a2b', t: 0.9 });
        addFx(S, { k: 'txt', x: 400, y: 260, s: 'SPLASH!', c: '#c58b4c', z: 46, t: 1.1 });
      }
    },
    timeout: function (S) {
      var w = Math.abs(S.p) < 1 ? 'tie' : S.p < 0 ? 'host' : 'guest';
      return { winner: w, text: w === 'tie' ? 'Dead even!' : 'Rope ' + Math.round(Math.abs(S.p) / TUG_EDGE * 100) + '% toward the mud' };
    },
    draw: function (c, S, me, D, info) {
      var t = performance.now() / 1000;
      c.fillStyle = vgrad(c, 0, 300, '#6fc3ff', '#c9ecff'); c.fillRect(0, 0, W, 300);
      /* hills */
      c.fillStyle = '#7fd36b'; c.beginPath(); c.moveTo(0, 300);
      for (var x = 0; x <= W; x += 20) c.lineTo(x, 270 - Math.sin(x / 120) * 25 - Math.sin(x / 47) * 6);
      c.lineTo(W, 300); c.fill();
      c.fillStyle = vgrad(c, 290, 500, '#4fb34a', '#2f7a2f'); c.fillRect(0, 295, W, 205);
      /* clouds */
      c.fillStyle = 'rgba(255,255,255,.85)';
      for (var k = 0; k < 4; k++) { var cx = ((k * 230 + t * 12) % 1000) - 100, cy = 100 + (k % 2) * 40; c.beginPath(); c.arc(cx, cy, 24, 0, 7); c.arc(cx + 26, cy - 10, 28, 0, 7); c.arc(cx + 54, cy, 22, 0, 7); c.fill(); }
      /* mud pit */
      c.fillStyle = '#5b3a1e'; c.beginPath(); c.ellipse(400, 360, 74, 26, 0, 0, 7); c.fill();
      c.fillStyle = '#7a4f28'; c.beginPath(); c.ellipse(400, 358, 62, 19, 0, 0, 7); c.fill();
      c.fillStyle = 'rgba(255,255,255,.25)'; for (var b = 0; b < 4; b++) { var bx = 370 + b * 20, br = 3 + 2 * Math.sin(t * 3 + b * 2); c.beginPath(); c.arc(bx, 356 + (b % 2) * 6, Math.max(1, br), 0, 7); c.fill(); }
      /* players */
      var hx = 250 + S.p, gx = 550 + S.p, py = 330;
      var hy = py, gy = py;
      if (S.st === 'end') { var sink = Math.min(1, S.ot / 0.6) * 22; if (S.fall === 0) { hx = Math.min(hx, 380); hy += sink; } else { gx = Math.max(gx, 420); gy += sink; } }
      var lean = D.clamp(S.rate[0] / 15, 0, 1) * 10, lean2 = D.clamp(S.rate[1] / 15, 0, 1) * 10;
      /* legs */
      c.strokeStyle = '#2a1a3a'; c.lineWidth = 6; c.lineCap = 'round';
      [[hx, hy, -1, lean], [gx, gy, 1, lean2]].forEach(function (a) {
        c.beginPath(); c.moveTo(a[0], a[1] + 20); c.lineTo(a[0] + a[2] * (14 + a[3]), a[1] + 44); c.moveTo(a[0], a[1] + 20); c.lineTo(a[0] - a[2] * 6, a[1] + 44); c.stroke();
      });
      /* rope with sag */
      var ry = 326, sag = 10 - Math.min(8, (S.rate[0] + S.rate[1]) / 3);
      c.strokeStyle = '#d9b07a'; c.lineWidth = 7; c.beginPath(); c.moveTo(hx + 18, hy - 2); c.quadraticCurveTo(400 + S.p, ry + sag, gx - 18, gy - 2); c.stroke();
      c.strokeStyle = 'rgba(120,80,40,.6)'; c.lineWidth = 2; c.setLineDash([5, 6]); c.beginPath(); c.moveTo(hx + 18, hy - 2); c.quadraticCurveTo(400 + S.p, ry + sag, gx - 18, gy - 2); c.stroke(); c.setLineDash([]);
      /* center flag */
      var fx = 400 + S.p, fy = ry + sag / 2;
      c.fillStyle = '#ff3b3b'; c.beginPath(); c.moveTo(fx, fy); c.lineTo(fx - 9, fy + 26); c.lineTo(fx + 9, fy + 26); c.fill();
      /* side markers */
      [400 - TUG_EDGE, 400 + TUG_EDGE].forEach(function (mx, i) { c.fillStyle = i ? 'rgba(88,199,255,.55)' : 'rgba(255,92,138,.55)'; c.fillRect(mx - 2, 300, 4, 100); });
      D.player(c, hx - (S.st === 'end' ? 0 : lean * 0.4), hy, 30, 'host', info.names.host, me === 'host');
      D.player(c, gx + (S.st === 'end' ? 0 : lean2 * 0.4), gy, 30, 'guest', info.names.guest, me === 'guest');
      if (S.st === 'end') { var lx = S.fall === 0 ? hx : gx; c.fillStyle = '#6b4423'; c.beginPath(); c.ellipse(lx, (S.fall === 0 ? hy : gy) + 18, 40, 14, 0, 0, 7); c.fill(); }
      drawFx(c, S, D);
      /* power meters */
      [0, 1].forEach(function (i) {
        var x = i ? 520 : 60;
        D.otext(c, 'PULL POWER', x + 110, 418, 15, '#fff');
        D.bar(c, x, 432, 220, 22, S.rate[i] / 15, col(i), 'rgba(0,0,0,.35)');
      });
      /* lead arrow */
      if (Math.abs(S.p) > 4 && S.st !== 'end') arrow(c, 400, 470, 40 + Math.min(20, Math.abs(S.p) / 4), S.p < 0 ? 'L' : 'R', S.p < 0 ? PINK : BLUE, '#fff');
      if (S.st !== 'end' && S.taps[0] + S.taps[1] < 6) D.otext(c, 'MASH SPACE!', 400, 200, 44, GOLD);
      D.hud(c, info, S.taps[0], S.taps[1], 'pulls');
    },
    bot: function (S, me, rnd) {
      return { in: P.emptyIn(), ev: rnd() < 0.36 + rnd() * 0.16 ? [{ t: 'a' }] : [] };
    }
  });

  /* =====================================================================
     2. TURBO SPRINT
     ===================================================================== */
  var SPR_X0 = 70, SPR_PX = 6.6;
  P.add({
    id: 'sprint-dash', name: 'Turbo Sprint', icon: '🏃', cat: 'Race',
    howto: '100 m dash! Alternate Left and Right as fast as you can to run. Hitting the same key twice makes you stumble. First across the line wins!',
    controls: 'Run: alternate ← → (or A / D) · tap left/right half',
    duration: 25,
    init: function (rnd) { return { t: 0, d: [0, 0], v: [0, 0], last: ['', ''], stum: [0, 0], bud: [2, 2], st: 'go', ot: 0, fin: [0, 0], fx: [], score: [0, 0] }; },
    step: function (S, dt, inp, ev, rnd) {
      ageFx(S, dt);
      if (S.st === 'end') {
        S.ot = r2(S.ot + dt);
        if (S.ot > 1.3) {
          var f = S.fin, w = f[0] && f[1] ? (Math.abs(f[0] - f[1]) < 1e-3 ? 'tie' : f[0] < f[1] ? 'host' : 'guest') : f[0] ? 'host' : 'guest';
          var wt = w === 'guest' ? f[1] : f[0];
          S.result = { winner: w, text: w === 'tie' ? 'Photo finish! ' + wt.toFixed(2) + ' s' : wt.toFixed(2) + ' s · rival at ' + Math.floor(S.d[w === 'host' ? 1 : 0]) + ' m' };
        }
        for (var j = 0; j < 2; j++) { S.v[j] = r1(S.v[j] * Math.exp(-2 * dt)); if (!S.fin[j]) S.d[j] = r1(Math.min(99.9, S.d[j] + S.v[j] * dt)); }
        return;
      }
      S.t = r2(S.t + dt);
      var cross = [0, 0];
      for (var i = 0; i < 2; i++) {
        S.bud[i] = r2(Math.min(2, S.bud[i] + 15 * dt));
        var ds = dirs(ev[WHO[i]], function (e) { return e.x < 400 ? 'L' : 'R'; });
        if (S.stum[i] > 0) S.stum[i] = r2(Math.max(0, S.stum[i] - dt));
        else for (var k = 0; k < ds.length; k++) {
          var d = ds[k]; if (d !== 'L' && d !== 'R') continue;
          if (S.bud[i] < 1) break;
          S.bud[i] -= 1;
          if (d === S.last[i]) {
            S.stum[i] = 0.6; S.v[i] *= 0.3; S.last[i] = '';
            addFx(S, { k: 'txt', x: SPR_X0 + S.d[i] * SPR_PX, y: i ? 330 : 200, s: 'OOPS!', c: '#ff9f43', t: 0.8 });
            break;
          }
          S.last[i] = d; S.v[i] = Math.min(11.8, S.v[i] + 1.2);
          if (Math.round(S.d[i]) % 3 === 0) addFx(S, { k: 'puff', x: SPR_X0 + S.d[i] * SPR_PX - 14, y: i ? 404 : 274, dx: -1, t: 0.4 });
        }
        S.v[i] = S.v[i] * Math.exp(-1.6 * dt);
        var nd = S.d[i] + S.v[i] * dt;
        if (nd >= 100 && S.v[i] > 0) cross[i] = S.t - dt + (100 - S.d[i]) / S.v[i];
        S.d[i] = r1(Math.min(100, nd)); S.v[i] = r2(S.v[i]);
      }
      S.score = [Math.floor(S.d[0]), Math.floor(S.d[1])];
      if (cross[0] || cross[1]) {
        S.fin = [cross[0] ? r2(cross[0]) : 0, cross[1] ? r2(cross[1]) : 0];
        S.st = 'end'; S.ot = 0;
        addFx(S, { k: 'burst', x: SPR_X0 + 100 * SPR_PX, y: cross[0] && !cross[1] ? 240 : !cross[0] ? 370 : 305, c: GOLD, t: 1 });
      }
    },
    timeout: function (S) { var w = winner(S.d[0], S.d[1]); return { winner: w, text: Math.floor(S.d[0]) + ' m - ' + Math.floor(S.d[1]) + ' m' }; },
    draw: function (c, S, me, D, info) {
      var t = performance.now() / 1000;
      c.fillStyle = vgrad(c, 0, 200, '#3b7bd9', '#9fd3ff'); c.fillRect(0, 0, W, 200);
      /* stands with crowd */
      c.fillStyle = '#3b2f5c'; c.fillRect(0, 110, W, 80);
      for (var cx = 6; cx < W; cx += 14) for (var row = 0; row < 3; row++) {
        var hue = (cx * 7 + row * 53) % 360, jump = Math.abs(Math.sin(t * 6 + cx * 0.3 + row)) * 4;
        c.fillStyle = 'hsl(' + hue + ',70%,65%)'; c.beginPath(); c.arc(cx + row * 4, 128 + row * 20 - jump, 5, 0, 7); c.fill();
      }
      c.fillStyle = '#2c9b4a'; c.fillRect(0, 190, W, 22);
      /* track */
      c.fillStyle = '#c4553a'; c.fillRect(0, 212, W, 228);
      c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 3;
      [212, 306, 440].forEach(function (y) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); });
      c.fillStyle = '#2c9b4a'; c.fillRect(0, 440, W, 60);
      /* distance markers */
      [25, 50, 75].forEach(function (m) { var x = SPR_X0 + m * SPR_PX; c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(x - 1, 212, 2, 228); D.otext(c, m + 'm', x, 456, 14, '#fff'); });
      c.fillStyle = '#fff'; c.fillRect(SPR_X0 - 2, 212, 4, 228);
      var fxl = SPR_X0 + 100 * SPR_PX;
      for (var y = 212; y < 440; y += 12) for (var q = 0; q < 2; q++) { c.fillStyle = ((y / 12 + q) % 2) < 1 ? '#fff' : '#111'; c.fillRect(fxl - 6 + q * 6, y, 6, 12); }
      D.otext(c, 'FINISH', fxl, 200, 16, GOLD);
      /* runners */
      [0, 1].forEach(function (i) {
        var who = WHO[i], x = SPR_X0 + S.d[i] * SPR_PX, ly = i ? 380 : 250, ph = S.d[i] * 2.4;
        var stum = S.stum[i] > 0, bob = stum ? 6 : Math.abs(Math.sin(ph)) * -8;
        if (S.v[i] > 5 && !stum) { c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 3; for (var s = 0; s < 3; s++) { c.beginPath(); c.moveTo(x - 34 - s * 6, ly - 14 + s * 12); c.lineTo(x - 34 - s * 6 - S.v[i] * 4, ly - 14 + s * 12); c.stroke(); } }
        c.strokeStyle = '#2a1a3a'; c.lineWidth = 6; c.lineCap = 'round';
        var sw = stum ? 0.2 : Math.sin(ph) * 0.9;
        c.beginPath(); c.moveTo(x, ly + 14 + bob); c.lineTo(x + Math.sin(sw) * 22, ly + 40); c.moveTo(x, ly + 14 + bob); c.lineTo(x - Math.sin(sw) * 22, ly + 40); c.stroke();
        c.save(); if (stum) { c.translate(x, ly + bob); c.rotate(0.5 * Math.sin(t * 20)); c.translate(-x, -ly - bob); }
        D.player(c, x, ly + bob, 24, who, info.names[who], me === who); c.restore();
        if (stum) for (var st = 0; st < 3; st++) { var a = t * 5 + st * 2.1; D.text(c, '★', x + Math.cos(a) * 26, ly - 30 + Math.sin(a) * 8, 16, GOLD); }
        if (S.fin[i]) D.otext(c, S.fin[i].toFixed(2) + ' s', fxl - 70, ly - 42, 22, GOLD);
      });
      drawFx(c, S, D);
      /* my key prompt */
      var mi = me === 'host' ? 0 : 1, nl = S.last[mi] === 'L' ? 'R' : S.last[mi] === 'R' ? 'L' : '';
      keyCap(c, D, 340, 474, 64, '←', nl !== 'R' && S.stum[mi] <= 0, col(mi));
      keyCap(c, D, 460, 474, 64, '→', nl !== 'L' && S.stum[mi] <= 0, col(mi));
      D.otext(c, Math.round(S.v[mi] * 3.6) + ' km/h', 400, 92, 18, '#fff');
      if (S.st === 'end') { var f = S.fin, w = f[0] && f[1] ? (Math.abs(f[0] - f[1]) < 1e-3 ? -1 : f[0] < f[1] ? 0 : 1) : f[0] ? 0 : 1; banner(c, D, w < 0 ? 'PHOTO FINISH!' : info.names[WHO[w]] + ' WINS!', w < 0 ? GOLD : col(w), 150); }
      D.hud(c, info, Math.floor(S.d[0]) + 'm', Math.floor(S.d[1]) + 'm');
    },
    bot: function (S, me, rnd) {
      var i = me === 'host' ? 0 : 1, inp = P.emptyIn();
      if (S.stum[i] > 0 || rnd() > 0.36 + rnd() * 0.12) return { in: inp, ev: [] };
      var nx = S.last[i] === 'L' ? 'R' : 'L';
      if (rnd() < 0.02 && S.last[i]) nx = S.last[i];
      return { in: inp, ev: [kev(nx)] };
    }
  });

  /* =====================================================================
     3. ROCKET PUMP
     ===================================================================== */
  var PUMP = 8, LAUNCH = 4.2, MPF = 24;
  P.add({
    id: 'rocket-pump', name: 'Rocket Pump', icon: '🚀', cat: 'Race',
    howto: 'Pump fuel into your rocket by alternating Up and Down for 8 seconds. Then it blasts off: more fuel means more height. Highest rocket wins!',
    controls: 'Pump: alternate ↑ ↓ (or W / S) · tap top/bottom half',
    duration: 20,
    init: function (rnd) { return { t: 0, ph: 'pump', fuel: [0, 0], last: ['', ''], bud: [2, 2], ht: [0, 0], alt: [0, 0], fx: [], score: [0, 0] }; },
    step: function (S, dt, inp, ev, rnd) {
      ageFx(S, dt);
      S.t = r2(S.t + dt);
      if (S.ph === 'pump') {
        for (var i = 0; i < 2; i++) {
          S.bud[i] = r2(Math.min(2, S.bud[i] + 15 * dt));
          var ds = dirs(ev[WHO[i]], function (e) { return e.y < 250 ? 'U' : 'D'; });
          for (var k = 0; k < ds.length; k++) {
            var d = ds[k]; if (d !== 'U' && d !== 'D') continue;
            if (S.bud[i] < 1) break;
            S.bud[i] -= 1;
            if (d !== S.last[i] && S.last[i]) {
              S.fuel[i] = Math.min(140, S.fuel[i] + 1);
              if (S.fuel[i] % 10 === 0) addFx(S, { k: 'txt', x: i ? 640 : 160, y: 300, s: '+' + S.fuel[i], c: col(i), z: 22, t: 0.6 });
            }
            S.last[i] = d;
          }
        }
        S.score = S.fuel.slice();
        if (S.t >= PUMP) {
          S.ph = 'launch';
          S.ht = [S.fuel[0] * MPF, S.fuel[1] * MPF];
          addFx(S, { k: 'txt', x: 400, y: 250, s: 'LIFT OFF!', c: GOLD, z: 54, t: 1.2 });
        }
      } else {
        var lt = S.t - PUMP;
        for (var j = 0; j < 2; j++) { var f = Math.min(1, Math.max(0, (lt - 0.3) / (LAUNCH - 1))); S.alt[j] = Math.round(S.ht[j] * (1 - Math.pow(1 - f, 3))); }
        S.score = S.alt.slice();
        if (lt >= LAUNCH + 0.8) S.result = { winner: winner(S.ht[0], S.ht[1]), text: S.ht[0] + ' m - ' + S.ht[1] + ' m' };
      }
    },
    timeout: function (S) { var a = S.fuel[0] * MPF, b = S.fuel[1] * MPF; return { winner: winner(a, b), text: a + ' m - ' + b + ' m' }; },
    draw: function (c, S, me, D, info) {
      var t = performance.now() / 1000, launch = S.ph === 'launch';
      var PXM = 0.16, maxA = Math.max(S.alt[0], S.alt[1]) * PXM, cam = Math.max(0, maxA - 230);
      var space = D.clamp(cam / 500, 0, 1);
      var top = space > 0.5 ? '#05041a' : '#2b6fd6', bot = space > 0.6 ? '#1a1450' : space > 0.2 ? '#4a6ee0' : '#9fd8ff';
      c.fillStyle = vgrad(c, 0, H, top, bot); c.fillRect(0, 0, W, H);
      if (space > 0) { alpha(c, space); c.fillStyle = '#fff'; for (var s = 0; s < 70; s++) { var sx = (s * 137) % W, sy = ((s * 89) + cam * 0.3) % H; c.fillRect(sx, sy, 2, 2); } c.globalAlpha = 1; }
      /* clouds parallax */
      c.fillStyle = 'rgba(255,255,255,.7)';
      for (var k = 0; k < 5; k++) { var cy = 140 + k * 160 + cam * 0.8 - Math.floor((140 + k * 160 + cam * 0.8) / 900) * 900, cx = (k * 211) % 700 + 40; c.beginPath(); c.arc(cx, cy, 26, 0, 7); c.arc(cx + 30, cy - 8, 32, 0, 7); c.arc(cx + 62, cy, 24, 0, 7); c.fill(); }
      var gy = 430 + cam;
      if (gy < H + 40) {
        c.fillStyle = '#3a8f3e'; c.fillRect(0, gy, W, H - gy + 40);
        c.fillStyle = '#6a6a7a'; c.fillRect(110, gy - 8, 100, 14); c.fillRect(590, gy - 8, 100, 14);
        /* launch towers */
        c.strokeStyle = '#8a8aa0'; c.lineWidth = 4;
        [120, 680].forEach(function (x) { c.beginPath(); c.moveTo(x, gy - 8); c.lineTo(x, gy - 170); c.stroke(); for (var yy = gy - 160; yy < gy - 8; yy += 20) { c.beginPath(); c.moveTo(x - 6, yy); c.lineTo(x + 6, yy + 20); c.stroke(); } });
      }
      [0, 1].forEach(function (i) {
        var x = i ? 640 : 160, ry = 360 - S.alt[i] * PXM + cam, cc = col(i), who = WHO[i];
        var vis = ry < H - 30, dry = vis ? ry : H - 60;
        if (launch && S.alt[i] < S.ht[i]) {
          /* smoke trail + flame */
          for (var p = 0; p < 9; p++) { var py = dry + 70 + p * 28, pr = 12 + p * 5 + Math.sin(t * 9 + p) * 3; alpha(c, 0.55 - p * 0.05); c.fillStyle = '#e8e4f0'; c.beginPath(); c.arc(x + Math.sin(t * 4 + p * 1.7) * 8, py, pr, 0, 7); c.fill(); }
          c.globalAlpha = 1;
          var fl = 40 + Math.sin(t * 40 + i) * 10;
          c.fillStyle = '#ff9f1c'; c.beginPath(); c.moveTo(x - 16, dry + 48); c.lineTo(x, dry + 48 + fl); c.lineTo(x + 16, dry + 48); c.fill();
          c.fillStyle = '#fff3a0'; c.beginPath(); c.moveTo(x - 8, dry + 48); c.lineTo(x, dry + 48 + fl * 0.6); c.lineTo(x + 8, dry + 48); c.fill();
        }
        if (vis) {
          var shake = !launch && S.fuel[i] > 0 ? Math.sin(t * 50) * Math.min(2, S.fuel[i] / 60) : 0;
          var x2 = x + shake;
          c.fillStyle = '#eceaf6'; D.rrect(c, x2 - 22, ry - 40, 44, 90, 16, '#eceaf6');
          c.fillStyle = cc; c.beginPath(); c.moveTo(x2 - 22, ry - 28); c.quadraticCurveTo(x2, ry - 90, x2 + 22, ry - 28); c.fill();
          c.beginPath(); c.moveTo(x2 - 22, ry + 20); c.lineTo(x2 - 40, ry + 52); c.lineTo(x2 - 22, ry + 44); c.fill();
          c.beginPath(); c.moveTo(x2 + 22, ry + 20); c.lineTo(x2 + 40, ry + 52); c.lineTo(x2 + 22, ry + 44); c.fill();
          D.circle(c, x2, ry - 6, 11, '#7fd4ff', 6); c.strokeStyle = '#555'; c.lineWidth = 3; c.beginPath(); c.arc(x2, ry - 6, 11, 0, 7); c.stroke();
          D.otext(c, info.names[who] + (me === who ? ' (you)' : ''), x2, ry - 84, 15, '#fff');
        } else {
          arrow(c, x, H - 40, 34, 'D', cc, '#fff');
        }
        if (launch) D.otext(c, S.alt[i] + ' m', x + (i ? -110 : 110), vis ? ry : H - 40, 26, cc);
      });
      if (!launch) {
        /* fuel gauges + pump */
        [0, 1].forEach(function (i) {
          var gx = i ? 520 : 252, frac = S.fuel[i] / 140, cc = col(i);
          D.rrect(c, gx, 150, 28, 260, 12, 'rgba(0,0,0,.4)', '#fff');
          if (frac > 0) D.rrect(c, gx + 3, 407 - 254 * frac, 22, 254 * frac, 10, cc);
          D.otext(c, S.fuel[i], gx + 14, 136, 22, cc);
          var down = S.last[i] === 'D', px = i ? 470 : 330;
          c.fillStyle = '#555'; c.fillRect(px - 16, 360, 32, 70);
          c.fillStyle = '#ddd'; c.fillRect(px - 3, down ? 330 : 290, 6, 70);
          D.rrect(c, px - 24, down ? 322 : 282, 48, 12, 6, cc);
        });
        var left = Math.max(0, PUMP - S.t);
        D.otext(c, 'PUMP!', 400, 150, 54, GOLD);
        D.otext(c, left.toFixed(1) + ' s', 400, 205, 30, left < 3 ? '#ff5a6a' : '#fff');
        var mi = me === 'host' ? 0 : 1, nx = S.last[mi] === 'U' ? 'D' : 'U';
        keyCap(c, D, 400, 280, 64, '↑', nx === 'U', col(mi)); keyCap(c, D, 400, 344, 64, '↓', nx === 'D', col(mi));
      } else if (S.alt[0] >= S.ht[0] && S.alt[1] >= S.ht[1] && S.t - PUMP > LAUNCH - 0.5) {
        var w = winner(S.ht[0], S.ht[1]);
        banner(c, D, w === 'tie' ? 'SAME HEIGHT!' : info.names[w] + ' HIGHEST!', w === 'tie' ? GOLD : w === 'host' ? PINK : BLUE, 250);
      }
      drawFx(c, S, D);
      D.hud(c, info, launch ? S.alt[0] + 'm' : S.fuel[0], launch ? S.alt[1] + 'm' : S.fuel[1], launch ? 'altitude' : 'fuel');
    },
    bot: function (S, me, rnd) {
      var i = me === 'host' ? 0 : 1;
      if (S.ph !== 'pump' || rnd() > 0.32 + rnd() * 0.14) return { in: P.emptyIn(), ev: [] };
      return { in: P.emptyIn(), ev: [kev(S.last[i] === 'U' ? 'D' : 'U')] };
    }
  });

  /* =====================================================================
     4. HAMMER SPIN
     ===================================================================== */
  var HT_TARGET = -Math.PI / 4, HM_PX = 6.4, HM_X0 = 175;
  function angDiff(a, b) { var d = (a - b) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; }
  P.add({
    id: 'hammer-throw', name: 'Hammer Spin', icon: '🔨', cat: 'Race',
    howto: 'Hold Space to spin up the hammer, then let go while it swings through the green zone. Faster spin and better timing throw further. Two throws each, best throw wins!',
    controls: 'Hold Space (or mouse) to spin · release in the green zone',
    duration: 30,
    init: function (rnd) {
      return { pl: [{ ph: 0, sp: 0, a: Math.PI / 2, ht: 0, arm: 0, n: 0, ft: 0, fd: 0 }, { ph: 0, sp: 0, a: Math.PI / 2, ht: 0, arm: 0, n: 0, ft: 0, fd: 0 }], th: [[], []], st: 'go', ot: 0, fx: [], score: [0, 0] };
    },
    step: function (S, dt, inp, ev, rnd) {
      ageFx(S, dt);
      if (S.st === 'end') { S.ot = r2(S.ot + dt); if (S.ot > 1) S.result = { winner: winner(S.score[0], S.score[1]), text: 'Best throws: ' + S.score[0].toFixed(1) + ' m - ' + S.score[1].toFixed(1) + ' m' }; return; }
      for (var i = 0; i < 2; i++) {
        var p = S.pl[i], k = inp[WHO[i]], held = !!(k.a || k.pd), ly = i ? 390 : 190;
        if (p.ph === 0) {
          if (!held) p.arm = 1;
          else if (p.arm) { p.ph = 1; p.sp = 0; p.ht = 0; p.arm = 0; }
        } else if (p.ph === 1) {
          if (held && p.ht < 4) {
            p.sp = Math.min(1, p.sp + 0.45 * dt);
            p.a = (p.a + (1.5 + 13 * p.sp) * dt) % (Math.PI * 2);
            p.ht = p.ht + dt;
          } else {
            var dz = p.ht >= 4, df = Math.abs(angDiff(p.a, HT_TARGET)), q = dz ? 0 : Math.pow(Math.max(0, Math.cos(df)), 3);
            var dist = q < 0.15 ? 0 : r1(88 * Math.pow(p.sp, 1.4) * q);
            S.th[i].push(dist); p.fd = dist; p.ft = 0; p.ph = 2; p.n++;
            addFx(S, { k: 'txt', x: dist ? HM_X0 + dist * HM_PX : 140, y: ly - 40, s: dz ? 'DIZZY! FOUL' : dist ? dist.toFixed(1) + ' m' : 'FOUL!', c: dist ? col(i) : '#ff5a6a', z: 28, t: 1.6 });
          }
        } else if (p.ph === 2) {
          p.ft = r2(p.ft + dt);
          if (p.ft >= 1.3) {
            if (p.fd > 0) addFx(S, { k: 'puff', x: HM_X0 + p.fd * HM_PX, y: ly + 30, c: 'rgba(140,100,60,1)', t: 0.6 });
            p.ph = p.n >= 2 ? 3 : 0; p.sp = 0; p.arm = 0;
          }
        }
        p.sp = r2(p.sp); p.a = r2(p.a); p.ht = r2(p.ht);
        S.score[i] = S.th[i].length ? Math.max.apply(null, S.th[i]) : 0;
      }
      if (S.pl[0].ph === 3 && S.pl[1].ph === 3) { S.st = 'end'; S.ot = 0; }
    },
    timeout: function (S) { var a = S.score[0], b = S.score[1]; return { winner: winner(a, b), text: 'Best throws: ' + a.toFixed(1) + ' m - ' + b.toFixed(1) + ' m' }; },
    draw: function (c, S, me, D, info) {
      var t = performance.now() / 1000;
      c.fillStyle = vgrad(c, 0, H, '#1d5a2c', '#123d1d'); c.fillRect(0, 0, W, H);
      c.fillStyle = 'rgba(255,255,255,.04)'; for (var sx = 0; sx < W; sx += 80) c.fillRect(sx, 80, 40, H);
      [0, 1].forEach(function (i) {
        var p = S.pl[i], who = WHO[i], ly = i ? 390 : 190, cc = col(i), cx = 100;
        /* lane field */
        c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(0, ly - 95, W, 190);
        c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2;
        [20, 40, 60, 80].forEach(function (m) { var x = HM_X0 + m * HM_PX; c.beginPath(); c.moveTo(x, ly - 80); c.lineTo(x, ly + 80); c.stroke(); D.text(c, m + 'm', x, ly + 86, 13, 'rgba(255,255,255,.55)'); });
        /* throw markers */
        S.th[i].forEach(function (d, n) {
          if (!d || (p.ph === 2 && n === S.th[i].length - 1)) return;
          var x = HM_X0 + d * HM_PX, best = d === S.score[i];
          c.fillStyle = '#fff'; c.fillRect(x - 1, ly - 10 + n * 30, 3, 34);
          c.fillStyle = best ? GOLD : cc; c.beginPath(); c.moveTo(x + 2, ly - 10 + n * 30); c.lineTo(x + 26, ly - 2 + n * 30); c.lineTo(x + 2, ly + 6 + n * 30); c.fill();
          D.otext(c, d.toFixed(1), x + 26, ly + 18 + n * 30, 14, best ? GOLD : '#fff');
        });
        /* cage + circle */
        c.strokeStyle = 'rgba(200,200,220,.35)'; c.lineWidth = 3; c.beginPath(); c.arc(cx, ly, 72, Math.PI * 0.25, Math.PI * 1.75); c.stroke();
        c.fillStyle = '#9a8b7a'; c.beginPath(); c.arc(cx, ly, 52, 0, 7); c.fill();
        c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.arc(cx, ly, 52, 0, 7); c.stroke();
        /* green release zone */
        c.strokeStyle = 'rgba(74,222,128,.85)'; c.lineWidth = 12; c.beginPath(); c.arc(cx, ly, 64, HT_TARGET - 0.35, HT_TARGET + 0.35); c.stroke();
        c.strokeStyle = 'rgba(255,209,102,.9)'; c.lineWidth = 12; c.beginPath(); c.arc(cx, ly, 64, HT_TARGET - 0.12, HT_TARGET + 0.12); c.stroke();
        /* hammer */
        if (p.ph !== 2 && p.ph !== 3) {
          var hx = cx + Math.cos(p.a) * 46, hy = ly + Math.sin(p.a) * 46;
          if (p.ph === 1 && p.sp > 0.2) { c.strokeStyle = 'rgba(255,255,255,' + (p.sp * 0.4) + ')'; c.lineWidth = 10; c.beginPath(); c.arc(cx, ly, 46, p.a - p.sp * 2, p.a); c.stroke(); }
          c.strokeStyle = '#ccc'; c.lineWidth = 3; c.beginPath(); c.moveTo(cx, ly); c.lineTo(hx, hy); c.stroke();
          D.circle(c, hx, hy, 11, '#666', 8);
        } else if (p.ph === 2) {
          var f = Math.min(1, p.ft / 1.2), d = p.fd || 10, x = cx + (HM_X0 + d * HM_PX - cx) * f, y = ly - Math.sin(Math.PI * f) * (60 + d), fl = p.ft >= 1.2;
          if (!fl) { c.strokeStyle = 'rgba(255,255,255,.35)'; c.setLineDash([4, 6]); c.lineWidth = 2; c.beginPath(); c.moveTo(cx, ly); for (var g = 0; g <= f; g += 0.05) c.lineTo(cx + (HM_X0 + d * HM_PX - cx) * g, ly - Math.sin(Math.PI * g) * (60 + d)); c.stroke(); c.setLineDash([]); }
          if (p.fd) D.circle(c, x, y, 11, '#666', 8);
        }
        D.player(c, cx, ly, 26, who, '', me === who);
        D.otext(c, info.names[who], cx, ly - 98 + 14, 15, '#fff');
        /* power meter */
        D.bar(c, 190, ly - 78, 170, 16, p.sp, p.sp > 0.85 ? GOLD : cc, 'rgba(0,0,0,.4)');
        D.text(c, 'SPEED', 200, ly - 70, 11, '#1a1033', 'left', 800);
        D.otext(c, 'Throw ' + Math.min(2, p.n + (p.ph === 0 || p.ph === 1 ? 1 : 0)) + '/2', 420, ly - 70, 15, '#fff', 'left');
        if (p.ph === 0 && p.n < 2) D.otext(c, me === who ? 'HOLD SPACE!' : 'ready…', 520, ly - 70, 18, GOLD, 'left');
        if (p.ph === 1 && p.ht > 3) D.otext(c, 'LET GO!', cx, ly + 66, 20, Math.sin(t * 20) > 0 ? '#ff5a6a' : '#fff');
        if (p.ph === 3) D.otext(c, 'Best ' + S.score[i].toFixed(1) + ' m', 560, ly - 70, 18, cc, 'left');
      });
      drawFx(c, S, D);
      if (S.st === 'end') { var w = winner(S.score[0], S.score[1]); banner(c, D, w === 'tie' ? 'TIED THROWS!' : info.names[w] + ' WINS!', w === 'tie' ? GOLD : w === 'host' ? PINK : BLUE, 290); }
      D.hud(c, info, S.score[0].toFixed(1), S.score[1].toFixed(1), 'best throw (m)');
    },
    bot: function (S, me, rnd) {
      var i = me === 'host' ? 0 : 1, p = S.pl[i], inp = P.emptyIn();
      if (p.ph === 0) { inp.a = p.arm ? 1 : 0; }
      else if (p.ph === 1) {
        var ready = p.sp >= 0.78 + rnd() * 0.2 || p.ht > 3.3;
        var ok = Math.abs(angDiff(p.a, HT_TARGET)) < 0.12 + rnd() * 0.3;
        inp.a = ready && ok ? 0 : 1;
      }
      return { in: inp, ev: [] };
    }
  });

  /* =====================================================================
     5. CLIFF CLIMB
     ===================================================================== */
  var CL_N = 40, CL_DIRS = 'LURD';
  P.add({
    id: 'cliff-climb', name: 'Cliff Climb', icon: '🧗', cat: 'Race',
    howto: 'Press the arrow shown next to your climber to grab the next hold. A wrong key makes you slip down. First to the summit wins!',
    controls: 'Climb: press the shown arrow (arrows / WASD)',
    duration: 30,
    init: function (rnd) {
      var seq = [];
      for (var i = 0; i < CL_N; i++) { var d; do { d = Math.floor(rnd() * 4); } while (i > 1 && d === seq[i - 1] && d === seq[i - 2]); seq.push(d); }
      return { seq: seq, idx: [0, 0], stun: [0, 0], bud: [1.5, 1.5], st: 'go', ot: 0, w: '', fx: [], score: [0, 0] };
    },
    step: function (S, dt, inp, ev, rnd) {
      ageFx(S, dt);
      if (S.st === 'end') { S.ot = r2(S.ot + dt); if (S.ot > 1.2) S.result = { winner: S.w, text: S.w === 'tie' ? 'Summit together!' : 'Summit! ' + S.idx[0] + ' - ' + S.idx[1] + ' holds' }; return; }
      var top = [0, 0];
      for (var i = 0; i < 2; i++) {
        S.bud[i] = r2(Math.min(1.5, S.bud[i] + 11 * dt));
        var ds = dirs(ev[WHO[i]], function (e) { var dx = e.x - (i ? 600 : 200), dy = e.y - 300; return Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'L' : 'R') : (dy < 0 ? 'U' : 'D'); });
        if (S.stun[i] > 0) { S.stun[i] = r2(Math.max(0, S.stun[i] - dt)); continue; }
        var x = i ? 600 : 200;
        for (var k = 0; k < ds.length; k++) {
          if (S.bud[i] < 1) break;
          S.bud[i] -= 1;
          var need = CL_DIRS[S.seq[S.idx[i]]];
          if (ds[k] === need) {
            S.idx[i]++;
            if (S.idx[i] % 5 === 0) addFx(S, { k: 'txt', x: x + 70, y: 460 - S.idx[i] * 8.6, s: S.idx[i] + '!', c: col(i), z: 22, t: 0.6 });
            if (S.idx[i] >= CL_N) { top[i] = 1; break; }
          } else {
            var y0 = 460 - S.idx[i] * 8.6;
            S.idx[i] = Math.max(0, S.idx[i] - 3); S.stun[i] = 0.5;
            addFx(S, { k: 'txt', x: x, y: y0 - 30, s: 'SLIP!', c: '#ff5a6a', z: 26, t: 0.8 });
            addFx(S, { k: 'puff', x: x, y: y0 + 10, c: 'rgba(160,140,120,1)', t: 0.6 });
            break;
          }
        }
      }
      S.score = S.idx.slice();
      if (top[0] || top[1]) {
        S.w = top[0] && top[1] ? 'tie' : top[0] ? 'host' : 'guest'; S.st = 'end'; S.ot = 0;
        if (top[0]) addFx(S, { k: 'burst', x: 200, y: 110, c: PINK, t: 1.1 });
        if (top[1]) addFx(S, { k: 'burst', x: 600, y: 110, c: BLUE, t: 1.1 });
      }
    },
    timeout: function (S) { return { winner: winner(S.idx[0], S.idx[1]), text: S.idx[0] + ' - ' + S.idx[1] + ' holds' }; },
    draw: function (c, S, me, D, info) {
      var t = performance.now() / 1000;
      c.fillStyle = vgrad(c, 0, H, '#ff9a6b', '#5a3a8a'); c.fillRect(0, 0, W, H);
      D.circle(c, 400, 150, 50, '#ffe08a', 40);
      c.fillStyle = '#4a2f6e'; c.beginPath(); c.moveTo(0, 500); c.lineTo(120, 260); c.lineTo(260, 380); c.lineTo(400, 200); c.lineTo(540, 360); c.lineTo(680, 250); c.lineTo(800, 400); c.lineTo(800, 500); c.fill();
      [0, 1].forEach(function (i) {
        var x = i ? 600 : 200, who = WHO[i], cc = col(i);
        /* cliff face */
        c.fillStyle = vgrad(c, 80, 500, '#8a7562', '#5e4a3a');
        c.beginPath(); c.moveTo(x - 110, 500); c.lineTo(x - 90, 110); c.lineTo(x - 20, 92); c.lineTo(x + 40, 96); c.lineTo(x + 100, 120); c.lineTo(x + 115, 500); c.fill();
        c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 3;
        for (var r = 0; r < 9; r++) { var yy = 140 + r * 40; c.beginPath(); c.moveTo(x - 90, yy + (r % 2) * 10); c.lineTo(x - 20, yy + 14); c.lineTo(x + 60, yy + 4 - (r % 3) * 6); c.lineTo(x + 100, yy + 12); c.stroke(); }
        /* holds */
        for (var h = 0; h < CL_N; h += 2) { var hy = 470 - h * 8.6, hx = x + ((h * 37) % 40) - 20; c.fillStyle = h < S.idx[i] ? 'rgba(255,255,255,.25)' : ['#ffd166', '#4ade80', '#ff7eb6', '#7fd4ff'][S.seq[h]]; c.beginPath(); c.arc(hx, hy, 5, 0, 7); c.fill(); }
        /* summit flag */
        c.fillStyle = '#ddd'; c.fillRect(x + 8, 60, 4, 40);
        c.fillStyle = cc; c.beginPath(); c.moveTo(x + 12, 60 + Math.sin(t * 6) * 2); c.lineTo(x + 44, 70); c.lineTo(x + 12, 80); c.fill();
        /* rope + climber */
        var cy = 460 - S.idx[i] * 8.6, stun = S.stun[i] > 0, wob = stun ? Math.sin(t * 30) * 6 : 0;
        c.strokeStyle = '#f2e6c9'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 10, 96); c.quadraticCurveTo(x + 30, (cy + 96) / 2, x + wob, cy); c.stroke();
        c.strokeStyle = '#2a1a3a'; c.lineWidth = 6; c.lineCap = 'round'; var reach = S.idx[i] % 2 ? 1 : -1;
        c.beginPath(); c.moveTo(x + wob - 14, cy - 6); c.lineTo(x + wob - 24, cy - 26 - reach * 6); c.moveTo(x + wob + 14, cy - 6); c.lineTo(x + wob + 24, cy - 26 + reach * 6);
        c.moveTo(x + wob - 8, cy + 16); c.lineTo(x + wob - 18, cy + 34 + reach * 4); c.moveTo(x + wob + 8, cy + 16); c.lineTo(x + wob + 18, cy + 34 - reach * 4); c.stroke();
        D.player(c, x + wob, cy, 20, who, '', me === who);
        /* upcoming arrows */
        if (S.idx[i] < CL_N && S.st !== 'end') {
          var bx = i ? x - 160 : x + 160 - 0, side = i ? -1 : 1;
          bx = x + side * 0 + (i ? 150 : -150);
          var by = D.clamp(cy, 205, 430);
          D.rrect(c, bx - 40, by - 40, 80, 80, 18, stun ? 'rgba(255,90,106,.6)' : cc, '#fff');
          arrow(c, bx, by, 56, CL_DIRS[S.seq[S.idx[i]]], '#fff', '#1a1033');
          for (var n = 1; n <= 3 && S.idx[i] + n < CL_N; n++) { alpha(c, 1 - n * 0.25); arrow(c, bx, by - 40 - n * 34, 26, CL_DIRS[S.seq[S.idx[i] + n]], '#fff', '#1a1033'); }
          c.globalAlpha = 1;
          D.otext(c, info.names[who] + (me === who ? ' (you)' : ''), bx, by + 56, 14, '#fff');
        }
        D.otext(c, Math.round(S.idx[i] / CL_N * 100) + '%', x, 480, 18, cc);
      });
      drawFx(c, S, D);
      if (S.st === 'end') banner(c, D, S.w === 'tie' ? 'SUMMIT TIE!' : info.names[S.w] + ' SUMMITS!', S.w === 'tie' ? GOLD : S.w === 'host' ? PINK : BLUE, 260);
      D.hud(c, info, S.idx[0], S.idx[1], 'holds · ' + CL_N + ' to summit');
    },
    bot: function (S, me, rnd) {
      var i = me === 'host' ? 0 : 1;
      if (S.st !== 'go' || S.stun[i] > 0 || rnd() > 0.17 + rnd() * 0.1) return { in: P.emptyIn(), ev: [] };
      var d = CL_DIRS[S.seq[S.idx[i]]];
      if (rnd() < 0.04) d = CL_DIRS[(S.seq[S.idx[i]] + 1) % 4];
      return { in: P.emptyIn(), ev: [kev(d)] };
    }
  });

  /* =====================================================================
     6. TOWER STACK
     ===================================================================== */
  var TS_CX = [200, 600], TS_W = 170, TS_RANGE = 165, TS_BH = 24, TS_BASE = 462;
  function tsSlider(S, i) { var dir = S.h[i] % 2 ? -1 : 1; S.sx[i] = TS_CX[i] - dir * TS_RANGE; S.sd[i] = dir; }
  P.add({
    id: 'block-stack', name: 'Tower Stack', icon: '🧱', cat: 'Race',
    howto: 'A block slides above your tower: press Space to drop it. Any overhang gets sliced off, so line it up! Miss completely and your tower is finished. Tallest tower wins.',
    controls: 'Drop: Space (or click)',
    duration: 30,
    init: function (rnd) {
      var S = { h: [0, 0], top: [[200, TS_W], [600, TS_W]], bl: [[[200, TS_W]], [[600, TS_W]]], sx: [0, 0], sd: [1, 1], out: [0, 0], streak: [0, 0], st: 'go', ot: 0, w: '', fx: [], score: [0, 0] };
      tsSlider(S, 0); tsSlider(S, 1); return S;
    },
    step: function (S, dt, inp, ev, rnd) {
      ageFx(S, dt);
      if (S.st === 'end') { S.ot = r2(S.ot + dt); if (S.ot > 1.2) S.result = { winner: S.w, text: S.h[0] + ' - ' + S.h[1] + ' blocks' }; return; }
      for (var i = 0; i < 2; i++) {
        if (S.out[i]) continue;
        var spd = Math.min(430, 170 + 13 * S.h[i]);
        S.sx[i] += S.sd[i] * spd * dt;
        if (S.sx[i] > TS_CX[i] + TS_RANGE) { S.sx[i] = TS_CX[i] + TS_RANGE; S.sd[i] = -1; }
        if (S.sx[i] < TS_CX[i] - TS_RANGE) { S.sx[i] = TS_CX[i] - TS_RANGE; S.sd[i] = 1; }
        S.sx[i] = r1(S.sx[i]);
        if (!mash(ev[WHO[i]])) continue;
        var top = S.top[i], w = top[1], x = S.sx[i];
        var L = Math.max(x - w / 2, top[0] - w / 2), R = Math.min(x + w / 2, top[0] + w / 2), ov = R - L;
        var vy = TS_BASE - (S.h[i] + 1) * TS_BH;
        if (ov <= 1) {
          S.out[i] = 1;
          addFx(S, { k: 'fall', x: x, w: w, y: vy, i: i, t: 0.9 });
          addFx(S, { k: 'txt', x: TS_CX[i], y: 200, s: 'MISSED!', c: '#ff5a6a', z: 36, t: 1.2 });
          continue;
        }
        var nb;
        if (Math.abs(x - top[0]) < 4) {
          S.streak[i]++;
          nb = [top[0], Math.min(TS_W, w + (S.streak[i] >= 3 ? 8 : 0))];
          addFx(S, { k: 'txt', x: TS_CX[i], y: 220, s: S.streak[i] >= 3 ? 'PERFECT x' + S.streak[i] + '!' : 'PERFECT!', c: GOLD, z: 30, t: 0.8 });
          addFx(S, { k: 'burst', x: top[0], y: vy, c: GOLD, t: 0.5 });
        } else {
          S.streak[i] = 0;
          nb = [r1((L + R) / 2), r1(ov)];
          var cutW = w - ov, cutX = x > top[0] ? R + cutW / 2 : L - cutW / 2;
          addFx(S, { k: 'fall', x: r1(cutX), w: r1(cutW), y: vy, i: i, t: 0.9 });
        }
        S.h[i]++; S.top[i] = nb; S.bl[i].push(nb); if (S.bl[i].length > 14) S.bl[i].shift();
        tsSlider(S, i);
      }
      S.score = S.h.slice();
      var o = S.out;
      if ((o[0] && o[1]) || (o[0] && S.h[1] > S.h[0]) || (o[1] && S.h[0] > S.h[1])) { S.w = winner(S.h[0], S.h[1]); S.st = 'end'; S.ot = 0; }
    },
    timeout: function (S) { return { winner: winner(S.h[0], S.h[1]), text: S.h[0] + ' - ' + S.h[1] + ' blocks' }; },
    draw: function (c, S, me, D, info) {
      var t = performance.now() / 1000;
      [0, 1].forEach(function (i) {
        var x0 = i * 400, cx = TS_CX[i], who = WHO[i];
        var cam = Math.max(0, S.h[i] - 8) * TS_BH;
        c.save(); c.beginPath(); c.rect(x0, 0, 400, H); c.clip();
        c.fillStyle = vgrad(c, 0, H, i ? '#1f3b7a' : '#6a1f5a', i ? '#5aa9e6' : '#ff8fa3'); c.fillRect(x0, 0, 400, H);
        /* skyline */
        c.fillStyle = 'rgba(10,8,30,.35)';
        for (var b = 0; b < 8; b++) { var bh = 60 + ((b * 53 + i * 31) % 90), by = 500 - bh + cam * 0.3; c.fillRect(x0 + b * 52, by, 44, bh + 200); }
        c.fillStyle = 'rgba(255,255,255,.6)'; for (var s = 0; s < 14; s++) c.fillRect(x0 + (s * 71) % 400, (s * 43 + 90) % 300 + 80 + cam * 0.15 - Math.floor(((s * 43 + 90) % 300 + 80 + cam * 0.15) / 500) * 420, 2, 2);
        /* base */
        var gy = TS_BASE + cam;
        c.fillStyle = '#2b2440'; c.fillRect(x0, gy, 400, 60);
        /* blocks */
        var n = S.bl[i].length;
        S.bl[i].forEach(function (bk, j) {
          var lvl = S.h[i] - (n - 1 - j), y = TS_BASE - lvl * TS_BH + cam;
          var hue = i ? (195 + lvl * 9) % 360 : (330 + lvl * 9) % 360;
          if (lvl === 0) { D.rrect(c, bk[0] - bk[1] / 2, y, bk[1], 30, 4, '#4b3f6b'); return; }
          D.rrect(c, bk[0] - bk[1] / 2, y, bk[1], TS_BH - 2, 5, 'hsl(' + hue + ',78%,60%)');
          c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(bk[0] - bk[1] / 2 + 3, y + 3, Math.max(0, bk[1] - 6), 5);
        });
        /* falling slices */
        S.fx.forEach(function (f) {
          if (f.k !== 'fall' || f.i !== i) return;
          var p = 1 - f.t / f.T, y = f.y + cam + p * p * 420, rot = p * (f.x > cx ? 1.2 : -1.2);
          c.save(); c.translate(f.x, y + TS_BH / 2); c.rotate(rot); alpha(c, 1 - p * 0.6);
          D.rrect(c, -f.w / 2, -TS_BH / 2, f.w, TS_BH - 2, 5, i ? '#8fd0ff' : '#ff9ab6'); c.restore(); c.globalAlpha = 1;
        });
        /* slider */
        if (!S.out[i] && S.st === 'go') {
          var tw = S.top[i][1], sy = TS_BASE - (S.h[i] + 1) * TS_BH + cam - 46 - Math.sin(t * 5) * 2;
          c.setLineDash([6, 6]); c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 2; c.beginPath();
          c.moveTo(S.sx[i] - tw / 2, sy + TS_BH); c.lineTo(S.sx[i] - tw / 2, sy + 46 + TS_BH); c.moveTo(S.sx[i] + tw / 2, sy + TS_BH); c.lineTo(S.sx[i] + tw / 2, sy + 46 + TS_BH); c.stroke(); c.setLineDash([]);
          var hue2 = i ? (195 + (S.h[i] + 1) * 9) % 360 : (330 + (S.h[i] + 1) * 9) % 360;
          c.save(); c.shadowColor = '#fff'; c.shadowBlur = 14;
          D.rrect(c, S.sx[i] - tw / 2, sy, tw, TS_BH - 2, 5, 'hsl(' + hue2 + ',85%,66%)', '#fff'); c.restore();
        }
        if (S.out[i]) { c.fillStyle = 'rgba(10,8,30,.45)'; c.fillRect(x0, 0, 400, H); D.otext(c, 'TOWER DONE', cx, 300, 30, '#ccc'); }
        c.restore();
        D.player(c, x0 + 46, 110, 20, who, '', me === who);
        D.otext(c, info.names[who] + (me === who ? ' (you)' : ''), x0 + 76, 110, 16, '#fff', 'left');
        D.otext(c, S.h[i], cx, 160, 56, i ? BLUE : PINK);
      });
      c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(398, 60, 4, H);
      drawFx(c, { fx: S.fx.filter(function (f) { return f.k !== 'fall'; }) }, D, 0);
      if (S.st === 'end') banner(c, D, S.w === 'tie' ? 'SAME HEIGHT!' : info.names[S.w] + ' TOWERS ABOVE!', S.w === 'tie' ? GOLD : S.w === 'host' ? PINK : BLUE, 260);
      D.hud(c, info, S.h[0], S.h[1], 'blocks');
    },
    bot: function (S, me, rnd) {
      var i = me === 'host' ? 0 : 1, top = S.top[i];
      if (S.out[i] || S.st !== 'go') return { in: P.emptyIn(), ev: [] };
      var tol = Math.min(top[1] * 0.35, 2 + rnd() * 10);
      return { in: P.emptyIn(), ev: Math.abs(S.sx[i] - top[0]) < tol ? [{ t: 'a' }] : [] };
    }
  });

  /* =====================================================================
     7. SKY DIVE
     ===================================================================== */
  var SD_V = 190, SD_T = 30, SD_Y = 170, SD_RX = 44;
  P.add({
    id: 'ring-dive', name: 'Sky Dive', icon: '🪂', cat: 'Race',
    howto: 'Freefall through the sky and steer through golden rings (+1 each). Birds and storm clouds knock you back. Most rings when you reach the ground wins!',
    controls: 'Steer: ← → / A D (or hold mouse)',
    duration: 32,
    init: function (rnd) {
      return { t: 0, d: [{ x: 300, y: SD_Y, vx: 0, vy: 0, st: 0 }, { x: 500, y: SD_Y, vx: 0, vy: 0, st: 0 }], rg: [], ob: [], id: 0, rs: 0.4, os: 1.6, fx: [], score: [0, 0] };
    },
    step: function (S, dt, inp, ev, rnd) {
      ageFx(S, dt);
      S.t = r2(S.t + dt);
      var spawnOk = S.t < SD_T - 2.2;
      /* spawns */
      S.rs -= dt; S.os -= dt;
      if (S.rs <= 0 && spawnOk) { S.rs = 0.5 + rnd() * 0.4; S.rg.push({ i: S.id++, x: Math.round(80 + rnd() * 640), y: 540, c: 0 }); }
      if (S.os <= 0 && spawnOk && S.t > 1.5) {
        S.os = 1.3 + rnd() * 1.1;
        var bird = rnd() < 0.65, dir = rnd() < 0.5 ? 1 : -1;
        S.ob.push(bird ? { i: S.id++, k: 'b', x: dir > 0 ? -30 : 830, y: 520 + Math.round(rnd() * 80), vx: dir * Math.round(70 + rnd() * 90), h: 0 } : { i: S.id++, k: 'c', x: Math.round(100 + rnd() * 600), y: 560, vx: 0, h: 0 });
      }
      S.rs = r2(S.rs); S.os = r2(S.os);
      /* divers */
      for (var i = 0; i < 2; i++) {
        var p = S.d[i], k = inp[WHO[i]], want = 0;
        if (p.st <= 0) {
          want = (k.right ? 1 : 0) - (k.left ? 1 : 0);
          if (!want && k.pd) want = D_clamp((k.px - p.x) / 60, -1, 1);
        }
        p.vx += (want * 320 - p.vx) * Math.min(1, 7 * dt);
        p.x = D_clamp(p.x + p.vx * dt, 40, 760);
        p.vy += ((SD_Y - p.y) * 5 - p.vy * 3) * dt;
        p.y += p.vy * dt;
        if (p.st > 0) p.st = Math.max(0, p.st - dt);
      }
      /* bump */
      var a = S.d[0], b = S.d[1], dx = b.x - a.x, dy = b.y - a.y;
      if (Math.abs(dx) < 46 && Math.abs(dy) < 46) {
        var push = (46 - Math.abs(dx)) / 2, s = dx > 0 ? 1 : dx < 0 ? -1 : (rnd() < 0.5 ? 1 : -1);
        a.x = D_clamp(a.x - s * push, 40, 760); b.x = D_clamp(b.x + s * push, 40, 760);
        var tv = a.vx; a.vx = b.vx * 0.6; b.vx = tv * 0.6;
      }
      /* rings */
      S.rg = S.rg.filter(function (r) {
        var oy = r.y; r.y = r1(r.y - SD_V * dt);
        if (!r.c) {
          var cand = [];
          for (var j = 0; j < 2; j++) { var q = S.d[j]; if (oy > q.y && r.y <= q.y && Math.abs(r.x - q.x) < SD_RX) cand.push(j); }
          if (cand.length) {
            var w;
            if (cand.length === 2) { var d0 = Math.abs(r.x - S.d[0].x), d1 = Math.abs(r.x - S.d[1].x); w = d0 < d1 - 0.5 ? 0 : d1 < d0 - 0.5 ? 1 : 2; }
            else w = cand[0];
            if (w === 2) { S.score[0]++; S.score[1]++; r.c = 3; } else { S.score[w]++; r.c = w + 1; }
            addFx(S, { k: 'txt', x: r.x, y: r.y - 20, s: w === 2 ? '+1 each' : '+1', c: w === 2 ? GOLD : col(w), z: 26, t: 0.7 });
            addFx(S, { k: 'burst', x: r.x, y: r.y, c: GOLD, t: 0.45 });
          }
        }
        return r.y > 50;
      });
      /* obstacles */
      S.ob = S.ob.filter(function (o) {
        o.y = r1(o.y - SD_V * dt * (o.k === 'c' ? 0.85 : 1)); o.x = r1(o.x + o.vx * dt);
        for (var j = 0; j < 2; j++) {
          var q = S.d[j]; if (o.h & (1 << j)) continue;
          var hit = o.k === 'b' ? Math.hypot(o.x - q.x, o.y - q.y) < 40 : Math.abs(o.x - q.x) < 66 && Math.abs(o.y - q.y) < 34;
          if (hit && q.st <= 0) {
            o.h |= 1 << j; q.st = 0.9; q.vy = -260; q.vx *= 0.2;
            addFx(S, { k: 'txt', x: q.x, y: q.y - 40, s: o.k === 'b' ? 'BONK!' : 'ZAP!', c: '#ff9f43', z: 26, t: 0.8 });
          }
        }
        return o.y > 40 && o.x > -60 && o.x < 860;
      });
      S.d.forEach(function (q) { q.x = r1(q.x); q.y = r1(q.y); q.vx = r1(q.vx); q.vy = r1(q.vy); q.st = r2(q.st); });
      if (S.t >= SD_T) S.result = { winner: winner(S.score[0], S.score[1]), text: S.score[0] + ' - ' + S.score[1] + ' rings' };
    },
    timeout: function (S) { return P.defaultTimeout(S); },
    draw: function (c, S, me, D, info) {
      var t = performance.now() / 1000, alt = Math.max(0, Math.round(3000 * (1 - S.t / SD_T)));
      var f = S.t / SD_T;
      c.fillStyle = vgrad(c, 0, H, f < 0.5 ? '#2a5bd7' : '#4b8de8', f < 0.5 ? '#8ec5ff' : '#c4e6ff'); c.fillRect(0, 0, W, H);
      /* speed streaks + parallax clouds */
      c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 2;
      for (var s = 0; s < 18; s++) { var sx = (s * 97) % W, sy = H - ((S.t * 520 + s * 131) % (H + 80)); c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx, sy + 40); c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,.35)';
      for (var k = 0; k < 6; k++) { var cy = H + 60 - ((S.t * 70 + k * 120) % (H + 160)), cx = (k * 173) % 720 + 40; c.beginPath(); c.arc(cx, cy, 30, 0, 7); c.arc(cx + 34, cy - 10, 36, 0, 7); c.arc(cx + 70, cy, 28, 0, 7); c.fill(); }
      /* ground */
      var gy = SD_Y + 40 + (SD_T - S.t) * SD_V;
      if (gy < H + 20) {
        c.fillStyle = '#4caf50'; c.fillRect(0, gy, W, H - gy + 20);
        c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(400, gy + 30, 120, 22, 0, 0, 7); c.fill();
        c.fillStyle = '#ff5a6a'; c.beginPath(); c.ellipse(400, gy + 30, 70, 13, 0, 0, 7); c.fill();
      }
      function ring(r, front) {
        var cl = r.c === 1 ? PINK : r.c === 2 ? BLUE : r.c === 3 ? '#fff' : GOLD;
        c.save(); c.lineWidth = 9; c.strokeStyle = cl; if (!r.c) { c.shadowColor = GOLD; c.shadowBlur = 14; }
        if (r.c) alpha(c, 0.5);
        c.beginPath(); c.ellipse(r.x, r.y, SD_RX, 14, 0, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2); c.stroke(); c.restore();
      }
      S.rg.forEach(function (r) { ring(r, false); });
      /* obstacles */
      S.ob.forEach(function (o) {
        if (o.k === 'b') {
          var flap = Math.sin(t * 14 + o.i) * 12, dir = o.vx > 0 ? 1 : -1;
          c.fillStyle = '#3b3b4f'; c.beginPath(); c.ellipse(o.x, o.y, 20, 12, 0, 0, 7); c.fill();
          c.beginPath(); c.moveTo(o.x - 6, o.y); c.lineTo(o.x - 26, o.y - 14 - flap); c.lineTo(o.x + 4, o.y - 2); c.fill();
          c.beginPath(); c.moveTo(o.x + 6, o.y); c.lineTo(o.x + 26, o.y - 14 - flap); c.lineTo(o.x - 4, o.y - 2); c.fill();
          c.fillStyle = '#ffb703'; c.beginPath(); c.moveTo(o.x + dir * 18, o.y - 3); c.lineTo(o.x + dir * 30, o.y); c.lineTo(o.x + dir * 18, o.y + 4); c.fill();
          c.fillStyle = '#fff'; c.beginPath(); c.arc(o.x + dir * 10, o.y - 4, 4, 0, 7); c.fill();
        } else {
          c.fillStyle = '#5b5f7a'; c.beginPath(); c.arc(o.x - 36, o.y, 26, 0, 7); c.arc(o.x, o.y - 12, 34, 0, 7); c.arc(o.x + 38, o.y, 26, 0, 7); c.fill();
          if (Math.sin(t * 8 + o.i) > 0.3) { c.strokeStyle = '#ffe14d'; c.lineWidth = 4; c.beginPath(); c.moveTo(o.x - 4, o.y + 14); c.lineTo(o.x - 12, o.y + 34); c.lineTo(o.x + 2, o.y + 32); c.lineTo(o.x - 6, o.y + 52); c.stroke(); }
        }
      });
      /* divers */
      [0, 1].forEach(function (i) {
        var q = S.d[i], who = WHO[i], tilt = D_clamp(q.vx / 320, -1, 1) * 0.4;
        if (S.t > SD_T - 1.6) {
          c.fillStyle = i ? BLUE : PINK; c.beginPath(); c.arc(q.x, q.y - 70, 46, Math.PI, 0); c.fill();
          c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(q.x - 46, q.y - 70); c.lineTo(q.x - 10, q.y - 10); c.moveTo(q.x + 46, q.y - 70); c.lineTo(q.x + 10, q.y - 10); c.stroke();
        }
        c.save(); c.translate(q.x, q.y); c.rotate(tilt + (q.st > 0 ? t * 12 : 0));
        c.strokeStyle = '#2a1a3a'; c.lineWidth = 6; c.lineCap = 'round';
        c.beginPath(); c.moveTo(-14, -8); c.lineTo(-34, -24); c.moveTo(14, -8); c.lineTo(34, -24); c.moveTo(-8, 14); c.lineTo(-22, 34); c.moveTo(8, 14); c.lineTo(22, 34); c.stroke();
        c.restore();
        D.player(c, q.x, q.y, 20, who, info.names[who], me === who);
        if (q.st > 0) for (var st = 0; st < 3; st++) { var an = t * 6 + st * 2.1; D.text(c, '★', q.x + Math.cos(an) * 28, q.y - 26 + Math.sin(an) * 8, 16, GOLD); }
      });
      S.rg.forEach(function (r) { ring(r, true); });
      drawFx(c, S, D);
      /* altimeter */
      D.rrect(c, W / 2 - 80, H - 46, 160, 34, 17, 'rgba(10,8,30,.6)');
      D.text(c, alt + ' m', W / 2, H - 29, 20, alt < 600 ? '#ff9f43' : '#fff');
      D.hud(c, info, S.score[0], S.score[1], 'rings');
    },
    bot: function (S, me, rnd) {
      var i = me === 'host' ? 0 : 1, p = S.d[i], inp = P.emptyIn(), tx = p.x, best = null;
      S.rg.forEach(function (r) {
        if (r.c || r.y < p.y + 12) return;
        var tt = (r.y - p.y) / SD_V; if (Math.abs(r.x - p.x) / 300 > tt + 0.05) return;
        if (!best || r.y < best.y) best = r;
      });
      if (best) tx = best.x;
      S.ob.forEach(function (o) {
        if (o.y < p.y - 10 || o.y > p.y + 110) return;
        var ox = o.x + o.vx * ((o.y - p.y) / SD_V), R = o.k === 'b' ? 50 : 80;
        if (Math.abs(ox - tx) < R) tx = ox + (tx >= ox ? R + 10 : -R - 10);
      });
      tx += (rnd() - 0.5) * 18;
      if (tx > p.x + 8) inp.right = 1; else if (tx < p.x - 8) inp.left = 1;
      if (rnd() < 0.06) { inp.left = 0; inp.right = 0; }
      return { in: inp, ev: [] };
    }
  });
  function D_clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
})();
