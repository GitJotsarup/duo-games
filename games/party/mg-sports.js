/* Party Rush minigames: SPORTS / PARTY group.
   Penalty Shootout, Air Hockey, Mini Golf, Strike Zone, Fishing Frenzy, Pirate Pop, Treasure Dig. */
(function () {
  var P = window.PARTY, W = 800, H = 500, WHO = ['host', 'guest'];
  var COL = { host: '#ff5c8a', guest: '#58c7ff', gold: '#ffd166', good: '#4ade80', bad: '#ff5a6a', ink: '#f6f5ff', dim: '#a9a7d3' };

  /* ---------- shared helpers ---------- */
  function r1(v) { return Math.round(v * 10) / 10; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function fxPush(S, o) { S.fx.push(o); if (S.fx.length > 16) S.fx.shift(); }
  function pop(S, x, y, s, c, z) { fxPush(S, { x: Math.round(x), y: Math.round(y), s: s, c: c, z: z || 26, t: 0.95, l: 0.95 }); }
  function burst(S, x, y, c, n) { fxPush(S, { x: Math.round(x), y: Math.round(y), b: n || 12, c: c, t: 0.7, l: 0.7 }); }
  function tickFx(S, dt) {
    S.fx = S.fx.filter(function (f) { f.t = Math.round((f.t - dt) * 1000) / 1000; return f.t > 0; });
    if (S.sh > 0) S.sh = Math.max(0, Math.round((S.sh - dt) * 1000) / 1000);
  }
  function isHit(e) { return e.t === 'a' || e.t === 'tap'; }
  function pressed(evs) { for (var i = 0; i < evs.length; i++) if (isHit(evs[i])) return true; return false; }
  /* draw helpers (read-only) */
  function drawFx(c, S, D, mx, my) {
    S.fx.forEach(function (f) {
      var k = 1 - f.t / f.l, x = mx ? mx(f.x) : f.x, y = my ? my(f.y) : f.y;
      if (f.b) {
        c.save(); c.globalAlpha = Math.max(0, 1 - k); c.fillStyle = f.c; c.shadowColor = f.c; c.shadowBlur = 10;
        for (var i = 0; i < f.b; i++) {
          var a = i / f.b * 6.283 + f.x * 0.013, d = 8 + k * 75 * (0.55 + 0.45 * ((i * 7) % 5) / 4);
          c.beginPath(); c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d + k * k * 28, 5.5 * (1 - k) + 1.5, 0, 6.3); c.fill();
        }
        c.restore();
      } else {
        c.globalAlpha = Math.max(0, Math.min(1, f.t / f.l * 1.8));
        D.otext(c, f.s, x, y - k * 46, f.z * (k < 0.12 ? 0.6 + k * 3.3 : 1), f.c);
        c.globalAlpha = 1;
      }
    });
  }
  function shake(c, S) {
    if (S.sh > 0) { var t = performance.now(), m = Math.min(1, S.sh) * 12; c.translate(Math.sin(t * 0.09) * m, Math.cos(t * 0.113) * m); }
  }
  function ease(p) { p = clamp(p, 0, 1); return 1 - (1 - p) * (1 - p); }

  /* =====================================================================
     1. PENALTY SHOOTOUT
     ===================================================================== */
  var PK = { AIM: 2.5, FLY: 0.65, GAP: 1.1 };
  function pkChoice(k, evs, t) {
    for (var j = 0; j < evs.length; j++) {
      var e = evs[j];
      if (e.t === 'tap') return e.x < 267 ? 0 : e.x > 533 ? 2 : 1;
      if (e.t === 'key') { if (e.k === '1') return 0; if (e.k === '2') return 1; if (e.k === '3') return 2; }
      if (e.t === 'a') return 1;
    }
    if (t > 0.15) { if (k.left) return 0; if (k.right) return 2; if (k.up || k.down) return 1; }
    return -1;
  }
  function pkDecided(S) {
    var a = S.ks[0].length, b = S.ks[1].length, g = S.g;
    function w() { return { winner: g[0] > g[1] ? 'host' : g[1] > g[0] ? 'guest' : 'tie', text: g[0] + ' - ' + g[1] + ' goals' + (a > 5 ? ' (sudden death)' : '') }; }
    if (a <= 5 && b <= 5) {
      if (g[0] + (5 - a) < g[1] || g[1] + (5 - b) < g[0]) return w();
      if (a === 5 && b === 5 && g[0] !== g[1]) return w();
      return null;
    }
    if (a === b && (g[0] !== g[1] || a >= 8)) return w();
    return null;
  }
  P.add({
    id: 'penalty-kicks', name: 'Penalty Shootout', icon: '⚽', cat: 'Sports',
    howto: 'Take turns as shooter and keeper, 5 kicks each. Both secretly pick Left, Centre or Right within 2.5 s: different picks = GOAL, same pick = SAVE. Most goals wins, sudden death if tied!',
    controls: 'Pick: ← Left · ↑/↓/Space Centre · → Right (or click a third) · first pick locks',
    duration: 45,
    init: function (rnd) { return { k: 0, ph: 'aim', t: 0, ch: [-1, -1], g: [0, 0], ks: [[], []], score: [0, 0], o: null, fx: [], sh: 0 }; },
    step: function (S, dt, inp, ev, rnd) {
      S.t += dt; tickFx(S, dt);
      var sh = S.k % 2, kp = 1 - sh;
      if (S.ph === 'aim') {
        for (var i = 0; i < 2; i++) if (S.ch[i] < 0) S.ch[i] = pkChoice(inp[WHO[i]], ev[WHO[i]], S.t);
        if ((S.ch[0] >= 0 && S.ch[1] >= 0 && S.t > 0.4) || S.t >= PK.AIM) {
          var s = S.ch[sh], k = S.ch[kp];
          var goal = s >= 0 && s !== (k < 0 ? 1 : k);
          S.o = { s: s, k: k, g: goal ? 1 : 0 };
          S.ks[sh].push(goal ? 1 : 0); if (goal) S.g[sh]++;
          S.ph = 'fly'; S.t = 0;
        }
      } else if (S.ph === 'fly') {
        if (S.t >= PK.FLY) {
          S.ph = 'gap'; S.t = 0;
          var o = S.o, tx = o.s < 0 ? 400 : 400 + (o.s - 1) * 125;
          if (o.g) { pop(S, 400, 300, 'GOAL!', COL.gold, 70); burst(S, tx, 180, COL[WHO[sh]], 18); burst(S, tx, 180, COL.gold, 14); S.sh = 0.5; }
          else if (o.s < 0) pop(S, 400, 300, 'NO SHOT!', COL.bad, 52);
          else { pop(S, 400, 300, 'SAVED!', COL[WHO[kp]], 64); burst(S, tx, 190, COL[WHO[kp]], 16); S.sh = 0.3; }
        }
      } else if (S.ph === 'gap' && S.t >= PK.GAP) {
        var res = pkDecided(S);
        if (res) { S.result = res; S.score = S.g.slice(); return; }
        S.k++; S.ph = 'aim'; S.t = 0; S.ch = [-1, -1]; S.o = null;
      }
      S.score = S.g.slice();
    },
    timeout: function (S) { var g = S.g; return { winner: g[0] > g[1] ? 'host' : g[1] > g[0] ? 'guest' : 'tie', text: g[0] + ' - ' + g[1] + ' goals' }; },
    draw: function (c, S, me, D, info) {
      var mi = me === 'host' ? 0 : 1, sh = S.k % 2, kp = 1 - sh, t = performance.now() / 1000;
      c.save(); shake(c, S);
      var g = c.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#081233'); g.addColorStop(0.36, '#1c3274'); g.addColorStop(0.361, '#239146'); g.addColorStop(1, '#0d4d22');
      c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40);
      /* crowd */
      for (var row = 0; row < 4; row++) for (var x = 0; x < W + 20; x += 17) {
        var hue = (x * 7 + row * 53) % 360;
        c.fillStyle = 'hsla(' + hue + ',70%,' + (50 + 12 * Math.sin(t * 3 + x)) + '%,.55)';
        c.beginPath(); c.arc(x + (row % 2) * 8, 86 + row * 15 + Math.sin(t * 5 + x * 0.3) * (S.ph === 'gap' && S.o && S.o.g ? 4 : 1.2), 6, 0, 6.3); c.fill();
      }
      /* floodlights */
      [60, 740].forEach(function (lx) { var rg = c.createRadialGradient(lx, 70, 4, lx, 70, 140); rg.addColorStop(0, 'rgba(255,255,230,.55)'); rg.addColorStop(1, 'rgba(255,255,230,0)'); c.fillStyle = rg; c.fillRect(lx - 140, 0, 280, 220); });
      for (var s2 = 0; s2 < 6; s2++) { c.fillStyle = s2 % 2 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.07)'; c.fillRect(0, 180 + s2 * 55, W, 55); }
      c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(0, 270); c.lineTo(W, 270); c.moveTo(150, 270); c.lineTo(70, 500); c.moveTo(650, 270); c.lineTo(730, 500); c.stroke();
      c.beginPath(); c.ellipse(400, 420, 5, 3, 0, 0, 6.3); c.fillStyle = '#fff'; c.fill();
      /* goal net */
      c.fillStyle = 'rgba(255,255,255,.1)'; c.fillRect(230, 120, 340, 150);
      c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 1; c.beginPath();
      for (var nx = 230; nx <= 570; nx += 17) { c.moveTo(nx, 120); c.lineTo(nx, 270); }
      for (var ny = 120; ny <= 270; ny += 15) { c.moveTo(230, ny); c.lineTo(570, ny); }
      c.stroke();
      /* zones */
      var myRole = mi === sh ? 'shoot' : 'save';
      if (S.ph === 'aim') {
        for (var z = 0; z < 3; z++) {
          var zx = 232 + z * 113, mine = S.ch[mi] === z;
          c.fillStyle = mine ? (mi ? 'rgba(88,199,255,.35)' : 'rgba(255,92,138,.35)') : 'rgba(255,255,255,.05)';
          c.fillRect(zx, 122, 111, 146);
          D.otext(c, ['◀', '▲', '▶'][z], zx + 55, 195, 30, mine ? '#fff' : 'rgba(255,255,255,.45)');
        }
      }
      c.fillStyle = '#fff'; c.shadowColor = '#fff'; c.shadowBlur = 8;
      c.fillRect(224, 114, 8, 158); c.fillRect(568, 114, 8, 158); c.fillRect(224, 114, 352, 8); c.shadowBlur = 0;
      /* keeper */
      var o = S.o, kx = 400 + Math.sin(t * 3) * 10, ky = 222, kr = 0;
      if (o && S.ph !== 'aim') {
        var p = S.ph === 'fly' ? ease(S.t / 0.45) : 1, dir = o.k < 0 ? 1 : o.k;
        kx = 400 + (dir - 1) * 122 * p; ky = 222 - (dir === 1 && o.k >= 0 ? Math.sin(Math.min(1, p) * 3.14) * 28 : (dir !== 1 ? Math.sin(Math.min(1, p) * 3.14) * 18 : 0)); kr = (dir - 1) * 0.9 * p;
      }
      c.save(); c.translate(kx, ky); c.rotate(kr);
      D.circle(c, -40, -22, 12, '#fff8', 0); D.circle(c, 40, -22, 12, '#fff8', 0);
      D.circle(c, -40, -22, 10, COL.gold, 8); D.circle(c, 40, -22, 10, COL.gold, 8);
      c.restore();
      D.player(c, kx, ky, 30, WHO[kp], info.names[WHO[kp]] + ' 🧤', me === WHO[kp]);
      /* shooter + ball */
      var bx = 400, by = 420, br = 15;
      if (o && S.ph !== 'aim') {
        var q = S.ph === 'fly' ? ease(S.t / PK.FLY) : 1;
        if (o.s < 0) { bx = 400 + q * 14; by = 420 - q * 18; }
        else {
          var tx = 400 + (o.s - 1) * 125, ty = 180;
          if (!o.g && S.ph === 'gap') { tx = kx + (o.s - 1) * 20; ty = ky - 18; }
          bx = 400 + (tx - 400) * q; by = 420 + (ty - 420) * q - Math.sin(q * 3.14) * 40; br = 15 - 6 * q;
        }
      }
      var shx = S.ph === 'aim' ? 340 : 340 + Math.min(1, S.t * 4) * 30;
      D.player(c, shx, 462, 26, WHO[sh], info.names[WHO[sh]] + ' ⚽', me === WHO[sh]);
      c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(bx, Math.max(by, 0) + br * 0.9, br, br * 0.35, 0, 0, 6.3); c.fill();
      D.circle(c, bx, by, br, '#ffffff', 10);
      c.fillStyle = '#222'; c.beginPath(); c.arc(bx, by, br * 0.35, 0, 6.3); c.fill();
      for (var pp = 0; pp < 5; pp++) { var pa = pp * 1.2566 + t * (S.ph === 'fly' ? 12 : 0); c.beginPath(); c.arc(bx + Math.cos(pa) * br * 0.75, by + Math.sin(pa) * br * 0.75, br * 0.18, 0, 6.3); c.fill(); }
      /* banner */
      if (S.ph === 'aim') {
        var locked = S.ch[mi] >= 0;
        D.rrect(c, 230, 300, 340, 74, 18, 'rgba(8,10,30,.62)');
        D.otext(c, locked ? 'LOCKED IN! ' + ['LEFT', 'CENTRE', 'RIGHT'][S.ch[mi]] : myRole === 'shoot' ? 'YOU SHOOT! Pick a corner' : 'YOU SAVE! Pick a dive', 400, 322, locked ? 24 : 25, locked ? COL.good : COL[me]);
        D.bar(c, 260, 348, 280, 12, 1 - S.t / PK.AIM, S.t > 1.8 ? COL.bad : COL.gold);
        var other = 1 - mi;
        D.otext(c, S.ch[other] >= 0 ? info.names[WHO[other]] + ' locked ✓' : info.names[WHO[other]] + ' thinking…', mi === 0 ? 660 : 140, 330, 16, S.ch[other] >= 0 ? COL.good : COL.dim);
      }
      /* kick trackers */
      for (var pl = 0; pl < 2; pl++) {
        var ks = S.ks[pl], n = Math.max(5, ks.length + (pl === sh && S.ph === 'aim' ? 1 : 0)), base = pl === 0 ? 22 : W - 22 - (n - 1) * 22;
        for (var j = 0; j < n; j++) {
          var cx = base + j * 22, v = ks[j];
          D.circle(c, cx, 76, 9, v === undefined ? 'rgba(255,255,255,.18)' : v ? COL.good : COL.bad, v === undefined ? 0 : 8);
          if (v !== undefined) D.text(c, v ? '✓' : '✗', cx, 77, 11, '#102');
        }
      }
      drawFx(c, S, D);
      c.restore();
      D.hud(c, info, S.g[0], S.g[1], S.ks[0].length >= 5 && S.ks[1].length >= 5 ? 'SUDDEN DEATH' : 'Kick ' + (Math.floor(S.k / 2) + 1) + ' / 5');
    },
    bot: function (S, me, rnd) {
      var i = me === 'host' ? 0 : 1, inp = P.emptyIn();
      if (S.ph === 'aim' && S.ch[i] < 0 && S.t > 0.45 && rnd() < 0.12) {
        var r = rnd(), c = r < 0.38 ? 0 : r < 0.62 ? 1 : 2;
        if (c === 0) inp.left = 1; else if (c === 2) inp.right = 1; else inp.up = 1;
      }
      return { in: inp, ev: [] };
    }
  });

  /* =====================================================================
     2. AIR HOCKEY
     ===================================================================== */
  var AH = { X0: 250, X1: 550, Y0: 86, Y1: 490, MID: 288, PR: 14, MR: 25, GW: 140, WIN: 5 };
  function ahReset(S, puckY) {
    S.p = { x: 400, y: puckY, vx: 0, vy: 0 };
    S.m = [{ x: 400, y: AH.Y1 - 50, vx: 0, vy: 0 }, { x: 400, y: AH.Y0 + 50, vx: 0, vy: 0 }];
    S.tr = []; S.st = 0;
  }
  P.add({
    id: 'air-hockey', name: 'Air Hockey', icon: '🏒', cat: 'Sports',
    howto: 'Smack the puck into your opponent\'s goal at the far end of the table. Guard your own goal at the bottom. First to 5 goals wins! Leave the puck idle on your side too long and it goes to your rival.',
    controls: 'Move mallet: WASD / arrows, or hold & drag the mouse',
    duration: 45,
    init: function (rnd) {
      var S = { score: [0, 0], ph: 'play', t: 0, fx: [], sh: 0, fl: -1 };
      ahReset(S, AH.MID);
      S.p.vx = r1((rnd() - 0.5) * 120); S.p.vy = rnd() < 0.5 ? 110 : -110;
      return S;
    },
    step: function (S, dt, inp, ev, rnd) {
      S.t += dt; tickFx(S, dt);
      if (S.ph === 'goal') {
        if (S.t > 1.2) {
          if (S.score[0] >= AH.WIN || S.score[1] >= AH.WIN) { S.result = { winner: S.score[0] > S.score[1] ? 'host' : 'guest', text: S.score[0] + ' - ' + S.score[1] + ' goals' }; return; }
          ahReset(S, AH.MID + (S.fl === 0 ? -60 : 60)); S.ph = 'play'; S.t = 0; S.fl = -1;
        }
        return;
      }
      var old = [], nw = [];
      for (var i = 0; i < 2; i++) {
        var k = inp[WHO[i]], m = S.m[i], nx = m.x, ny = m.y;
        if (k.pd) {
          var tx = i ? 800 - k.px : k.px, ty = i ? (AH.Y0 + AH.Y1) - k.py : k.py;
          var dx = tx - m.x, dy = ty - m.y, d = Math.hypot(dx, dy);
          if (d > 0.5) { var mv = Math.min(d, 640 * dt); nx = m.x + dx / d * mv; ny = m.y + dy / d * mv; }
        } else {
          var vx = (k.right ? 1 : 0) - (k.left ? 1 : 0), vy = (k.down ? 1 : 0) - (k.up ? 1 : 0);
          if (i) { vx = -vx; vy = -vy; }
          var l = Math.hypot(vx, vy) || 1;
          nx = m.x + vx / l * 470 * dt; ny = m.y + vy / l * 470 * dt;
        }
        nx = clamp(nx, AH.X0 + AH.MR, AH.X1 - AH.MR);
        ny = i === 0 ? clamp(ny, AH.MID + AH.MR, AH.Y1 - AH.MR) : clamp(ny, AH.Y0 + AH.MR, AH.MID - AH.MR);
        old.push({ x: m.x, y: m.y }); nw.push({ x: nx, y: ny });
        m.vx = (nx - m.x) / dt; m.vy = (ny - m.y) / dt;
      }
      var p = S.p, N = 5, h = dt / N, R = AH.PR + AH.MR, scored = -1;
      for (var s = 1; s <= N && scored < 0; s++) {
        p.x += p.vx * h; p.y += p.vy * h;
        for (var j = 0; j < 2; j++) {
          var mx = old[j].x + (nw[j].x - old[j].x) * s / N, my = old[j].y + (nw[j].y - old[j].y) * s / N;
          var ddx = p.x - mx, ddy = p.y - my, dd = Math.hypot(ddx, ddy);
          if (dd < R) {
            if (dd < 0.01) { ddx = 0; ddy = j === 0 ? -1 : 1; dd = 1; }
            var ux = ddx / dd, uy = ddy / dd; p.x = mx + ux * R; p.y = my + uy * R;
            var rvx = p.vx - S.m[j].vx, rvy = p.vy - S.m[j].vy, vn = rvx * ux + rvy * uy;
            if (vn < 0) { p.vx -= 1.85 * vn * ux; p.vy -= 1.85 * vn * uy; if (-vn > 350) burst(S, p.x, p.y, COL[WHO[j]], 6); }
          }
        }
        if (p.x < AH.X0 + AH.PR) { p.x = AH.X0 + AH.PR; p.vx = Math.abs(p.vx) * 0.92; }
        if (p.x > AH.X1 - AH.PR) { p.x = AH.X1 - AH.PR; p.vx = -Math.abs(p.vx) * 0.92; }
        var inMouth = Math.abs(p.x - 400) < AH.GW / 2 - AH.PR * 0.3;
        if (p.y < AH.Y0 + AH.PR && !inMouth) { p.y = AH.Y0 + AH.PR; p.vy = Math.abs(p.vy) * 0.92; }
        if (p.y > AH.Y1 - AH.PR && !inMouth) { p.y = AH.Y1 - AH.PR; p.vy = -Math.abs(p.vy) * 0.92; }
        if (p.y < AH.Y0 - AH.PR) scored = 0;
        if (p.y > AH.Y1 + AH.PR) scored = 1;
      }
      S.m.forEach(function (m, i2) { m.x = r1(nw[i2].x); m.y = r1(nw[i2].y); m.vx = r1(m.vx); m.vy = r1(m.vy); });
      var sp = Math.hypot(p.vx, p.vy);
      if (sp > 1000) { p.vx *= 1000 / sp; p.vy *= 1000 / sp; }
      p.vx *= (1 - 0.3 * dt); p.vy *= (1 - 0.3 * dt);
      p.x = r1(p.x); p.y = r1(p.y); p.vx = r1(p.vx); p.vy = r1(p.vy);
      S.tr.push({ x: p.x, y: p.y }); if (S.tr.length > 7) S.tr.shift();
      if (scored >= 0) {
        S.score[scored]++; S.ph = 'goal'; S.t = 0; S.fl = scored; S.sh = 0.55;
        pop(S, 400, AH.MID, 'GOAL!', COL[WHO[scored]], 60);
        var gy = scored === 0 ? AH.Y0 : AH.Y1;
        burst(S, 400, gy, COL[WHO[scored]], 20); burst(S, 400, gy, COL.gold, 12);
        return;
      }
      if (sp < 40) S.st += dt; else S.st = 0;
      if (S.st > 2.5) {
        var side = p.y > AH.MID ? 0 : 1;
        pop(S, 400, AH.MID, 'Too slow! Puck to ' + (side ? 'Pink' : 'Blue'), COL.gold, 24);
        S.p = { x: 400, y: AH.MID + (side === 0 ? -60 : 60), vx: 0, vy: 0 }; S.st = 0; S.tr = [];
      }
    },
    timeout: function (S) { return { winner: S.score[0] > S.score[1] ? 'host' : S.score[1] > S.score[0] ? 'guest' : 'tie', text: S.score[0] + ' - ' + S.score[1] + ' goals' }; },
    draw: function (c, S, me, D, info) {
      var flip = me === 'guest', t = performance.now() / 1000;
      function sx(x) { return flip ? 800 - x : x; }
      function sy(y) { return flip ? (AH.Y0 + AH.Y1) - y : y; }
      var opp = flip ? 'host' : 'guest';
      D.bg(c, '#1a2350', '#060914');
      c.save(); shake(c, S);
      /* rim */
      c.save(); c.shadowColor = '#4cf0ff'; c.shadowBlur = 26;
      D.rrect(c, AH.X0 - 16, AH.Y0 - 12, AH.X1 - AH.X0 + 32, AH.Y1 - AH.Y0 + 24, 30, '#222c55'); c.restore();
      var sg = c.createLinearGradient(0, AH.Y0, 0, AH.Y1);
      sg.addColorStop(0, '#e8f7ff'); sg.addColorStop(0.5, '#cdeefe'); sg.addColorStop(1, '#e8f7ff');
      D.rrect(c, AH.X0, AH.Y0, AH.X1 - AH.X0, AH.Y1 - AH.Y0, 22, sg);
      c.fillStyle = 'rgba(40,90,140,.18)';
      for (var hx = AH.X0 + 18; hx < AH.X1; hx += 24) for (var hy = AH.Y0 + 18; hy < AH.Y1; hy += 24) c.fillRect(hx, hy, 2, 2);
      /* lines */
      c.strokeStyle = 'rgba(230,60,90,.7)'; c.lineWidth = 4; c.beginPath(); c.moveTo(AH.X0, AH.MID); c.lineTo(AH.X1, AH.MID); c.stroke();
      c.lineWidth = 3; c.beginPath(); c.arc(400, AH.MID, 46, 0, 6.3); c.stroke();
      /* creases + goals: bottom of screen is mine */
      [[AH.Y1, me, -1], [AH.Y0, opp, 1]].forEach(function (a) {
        var y = a[0], col = COL[a[1]], d = a[2];
        c.strokeStyle = col; c.lineWidth = 4; c.globalAlpha = 0.7;
        c.beginPath(); c.arc(400, y, 66, d < 0 ? Math.PI : 0, d < 0 ? 2 * Math.PI : Math.PI); c.stroke(); c.globalAlpha = 1;
        var glow = S.ph === 'goal' && sy(S.fl === 0 ? AH.Y0 : AH.Y1) === y;
        c.save(); c.shadowColor = col; c.shadowBlur = glow ? 40 + 20 * Math.sin(t * 20) : 16;
        D.rrect(c, 400 - AH.GW / 2, y - 7, AH.GW, 14, 7, glow ? '#fff' : '#101633'); c.restore();
        c.fillStyle = col; c.fillRect(400 - AH.GW / 2, y + (d < 0 ? 5 : -8), AH.GW, 3);
      });
      /* puck trail + puck */
      S.tr.forEach(function (q, i) { c.globalAlpha = (i + 1) / S.tr.length * 0.35; c.fillStyle = '#334'; c.beginPath(); c.arc(sx(q.x), sy(q.y), AH.PR * (0.5 + i / 14), 0, 6.3); c.fill(); });
      c.globalAlpha = 1;
      if (S.ph !== 'goal') {
        var px = sx(S.p.x), py = sy(S.p.y);
        c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.arc(px + 3, py + 4, AH.PR, 0, 6.3); c.fill();
        c.save(); c.shadowColor = '#000'; c.shadowBlur = 6; c.fillStyle = '#1b1b2e'; c.beginPath(); c.arc(px, py, AH.PR, 0, 6.3); c.fill(); c.restore();
        c.strokeStyle = COL.gold; c.lineWidth = 3; c.beginPath(); c.arc(px, py, AH.PR - 4, 0, 6.3); c.stroke();
      }
      /* mallets */
      for (var i = 0; i < 2; i++) {
        var m = S.m[i], mx = sx(m.x), my = sy(m.y);
        c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.arc(mx + 3, my + 5, AH.MR, 0, 6.3); c.fill();
        c.fillStyle = i ? '#1f6f99' : '#a02852'; c.beginPath(); c.arc(mx, my, AH.MR, 0, 6.3); c.fill();
        D.player(c, mx, my, AH.MR - 6, WHO[i], null, me === WHO[i]);
      }
      drawFx(c, S, D, sx, sy);
      c.restore();
      /* side panels */
      var mine = me === 'host' ? 0 : 1;
      D.otext(c, info.names[opp], 125, 150, 20, COL[opp]);
      D.otext(c, S.score[1 - mine], 125, 200, 64, COL[opp]);
      D.otext(c, 'YOU', 125, 380, 20, COL[me]);
      D.otext(c, S.score[mine], 125, 430, 64, COL[me]);
      D.otext(c, 'First to', 675, 260, 18, COL.dim); D.otext(c, AH.WIN, 675, 300, 48, COL.gold);
      D.otext(c, '▲ attack', 675, 160, 18, 'rgba(255,255,255,.55)');
      D.otext(c, '▼ defend', 675, 420, 18, 'rgba(255,255,255,.55)');
      D.hud(c, info, S.score[0], S.score[1]);
    },
    bot: function (S, me, rnd) {
      var i = me === 'host' ? 0 : 1, inp = P.emptyIn();
      if (S.ph !== 'play') return { in: inp, ev: [] };
      var p = S.p, m = S.m[i], o = S.m[1 - i], sg = i === 0 ? -1 : 1;
      var myGoalY = i === 0 ? AH.Y1 : AH.Y0, oppGoalY = i === 0 ? AH.Y0 : AH.Y1;
      var onMine = i === 0 ? p.y > AH.MID - 4 : p.y < AH.MID + 4, R = AH.PR + AH.MR, tx, ty;
      /* lead the puck slightly */
      var lx = p.x + p.vx * 0.06, ly = p.y + p.vy * 0.06;
      var comingFast = (p.vy * -sg) > 300;
      if (onMine) {
        var ax = 400 + (o.x > 400 ? -52 : 52);
        var ux = ax - lx, uy = oppGoalY - ly, ul = Math.hypot(ux, uy); ux /= ul; uy /= ul;
        var rx = m.x - lx, ry = m.y - ly, dot = rx * ux + ry * uy, lat = Math.abs(rx * uy - ry * ux);
        if (dot < -R * 0.5 && lat < 16) { tx = lx + ux * 60; ty = ly + uy * 60; }
        else if (dot > -8) {
          var side = (rx * uy - ry * ux) >= 0 ? 1 : -1;
          tx = lx + uy * side * (R + 16) - ux * 18; ty = ly - ux * side * (R + 16) - uy * 18;
        } else { tx = lx - ux * (R + 8); ty = ly - uy * (R + 8); }
        if (comingFast && Math.abs(p.y - myGoalY) < 160 && Math.sin(S.t * 2.3 + i) > -0.2) { tx = (p.x + 400) / 2; ty = myGoalY + sg * 45; }
      } else {
        tx = 400 + clamp(p.x - 400, -60, 60) * 0.5 + Math.sin(S.t * 1.7 + i * 2.1) * 38; ty = myGoalY + sg * (55 + Math.sin(S.t * 1.1 + i) * 25);
      }
      inp.pd = 1;
      inp.px = Math.round(i ? 800 - tx : tx); inp.py = Math.round(i ? (AH.Y0 + AH.Y1) - ty : ty);
      return { in: inp, ev: [] };
    }
  });

  /* =====================================================================
     3. MINI GOLF
     ===================================================================== */
  var GF = { CW: 360, CH: 380, OY: 100, BR: 8, CUP: 11, AST: 0.035, PMAX: 30, VMIN: 60, VMAX: 650 };
  var AI0 = Math.round(-Math.PI / 2 / GF.AST);
  var HOLES = [
    { par: 2, tee: [180, 330], cup: [180, 62], rects: [[90, 178, 180, 22]], circ: [], wp: [[45, 189], [315, 189]] },
    { par: 3, tee: [60, 330], cup: [300, 58], rects: [[120, 228, 240, 20], [0, 128, 240, 20]], circ: [], wp: [[60, 238], [300, 138]] },
    { par: 3, tee: [180, 340], cup: [180, 58], rects: [[0, 262, 95, 18], [265, 262, 95, 18]], circ: [[110, 205, 22], [250, 205, 22], [180, 135, 24]], wp: [[110, 135], [250, 135], [180, 262]] }
  ];
  function gox(i) { return 20 + i * 400; }
  function golfStep(b, hd, dt) {
    var N = 3, h = dt / N, R = GF.BR;
    for (var s = 0; s < N; s++) {
      b.x += b.vx * h; b.y += b.vy * h;
      if (b.x < R) { b.x = R; b.vx = Math.abs(b.vx) * 0.8; }
      if (b.x > GF.CW - R) { b.x = GF.CW - R; b.vx = -Math.abs(b.vx) * 0.8; }
      if (b.y < R) { b.y = R; b.vy = Math.abs(b.vy) * 0.8; }
      if (b.y > GF.CH - R) { b.y = GF.CH - R; b.vy = -Math.abs(b.vy) * 0.8; }
      for (var k = 0; k < hd.rects.length; k++) {
        var r = hd.rects[k], cx = clamp(b.x, r[0], r[0] + r[2]), cy = clamp(b.y, r[1], r[1] + r[3]);
        var dx = b.x - cx, dy = b.y - cy, d = Math.hypot(dx, dy);
        if (d < R) {
          if (d < 0.001) { /* centre inside: push out the shortest way */
            var dl = b.x - r[0], dr = r[0] + r[2] - b.x, du = b.y - r[1], dd = r[1] + r[3] - b.y, mn = Math.min(dl, dr, du, dd);
            if (mn === dl) { dx = -1; dy = 0; cx = r[0]; cy = b.y; } else if (mn === dr) { dx = 1; dy = 0; cx = r[0] + r[2]; cy = b.y; }
            else if (mn === du) { dx = 0; dy = -1; cx = b.x; cy = r[1]; } else { dx = 0; dy = 1; cx = b.x; cy = r[1] + r[3]; }
            d = 1;
          }
          var nx = dx / d, ny = dy / d; b.x = cx + nx * R; b.y = cy + ny * R;
          var vn = b.vx * nx + b.vy * ny; if (vn < 0) { b.vx -= 1.8 * vn * nx; b.vy -= 1.8 * vn * ny; }
        }
      }
      for (var q = 0; q < hd.circ.length; q++) {
        var ci = hd.circ[q], ex = b.x - ci[0], ey = b.y - ci[1], ed = Math.hypot(ex, ey), RR = ci[2] + R;
        if (ed < RR && ed > 0.001) {
          var ux = ex / ed, uy = ey / ed; b.x = ci[0] + ux * RR; b.y = ci[1] + uy * RR;
          var vn2 = b.vx * ux + b.vy * uy; if (vn2 < 0) { b.vx -= 2 * vn2 * ux; b.vy -= 2 * vn2 * uy; }
        }
      }
      var hx = hd.cup[0] - b.x, hy = hd.cup[1] - b.y, hdst = Math.hypot(hx, hy), sp = Math.hypot(b.vx, b.vy);
      if (hdst < GF.CUP && sp < 380) { b.x = hd.cup[0]; b.y = hd.cup[1]; b.vx = 0; b.vy = 0; return 1; }
      if (hdst < GF.CUP + 9 && sp < 220) { b.vx += hx * 40 * h; b.vy += hy * 40 * h; }
    }
    var s2 = Math.hypot(b.vx, b.vy), ns = s2 - (75 + 0.75 * s2) * dt;
    if (ns < 6) { b.vx = 0; b.vy = 0; } else { b.vx *= ns / s2; b.vy *= ns / s2; }
    b.x = r1(b.x); b.y = r1(b.y); b.vx = r1(b.vx); b.vy = r1(b.vy);
    return 0;
  }
  function golfBlocked(hd, x, y) {
    for (var k = 0; k < hd.rects.length; k++) { var r = hd.rects[k]; if (x > r[0] - 6 && x < r[0] + r[2] + 6 && y > r[1] - 6 && y < r[1] + r[3] + 6) return true; }
    for (var q = 0; q < hd.circ.length; q++) { var c = hd.circ[q]; if (Math.hypot(x - c[0], y - c[1]) < c[2] + 7) return true; }
    return false;
  }
  function golfVis(hd, ax, ay, bx, by) {
    var d = Math.hypot(bx - ax, by - ay), n = Math.ceil(d / 6);
    for (var k = 1; k < n; k++) if (golfBlocked(hd, ax + (bx - ax) * k / n, ay + (by - ay) * k / n)) return false;
    return true;
  }
  function golfWpCost(hd) {
    if (hd._wc) return hd._wc;
    var nodes = hd.wp, cost = nodes.map(function (w) { return golfVis(hd, w[0], w[1], hd.cup[0], hd.cup[1]) ? Math.hypot(w[0] - hd.cup[0], w[1] - hd.cup[1]) : 1e9; });
    for (var it = 0; it < nodes.length; it++) for (var a = 0; a < nodes.length; a++) for (var b = 0; b < nodes.length; b++) {
      if (a !== b && golfVis(hd, nodes[a][0], nodes[a][1], nodes[b][0], nodes[b][1])) cost[a] = Math.min(cost[a], cost[b] + Math.hypot(nodes[a][0] - nodes[b][0], nodes[a][1] - nodes[b][1]));
    }
    hd._wc = cost; return cost;
  }
  function golfCost(hd, x, y) {
    if (golfVis(hd, x, y, hd.cup[0], hd.cup[1])) return Math.hypot(x - hd.cup[0], y - hd.cup[1]);
    var wc = golfWpCost(hd), best = 1e9;
    for (var k = 0; k < hd.wp.length; k++) { var w = hd.wp[k]; if (golfVis(hd, x, y, w[0], w[1])) best = Math.min(best, Math.hypot(x - w[0], y - w[1]) + wc[k]); }
    return best < 1e9 ? best : 800;
  }
  function golfShot(ai, pk) { var a = ai * GF.AST, v = GF.VMIN + pk / GF.PMAX * (GF.VMAX - GF.VMIN); return { vx: r1(Math.cos(a) * v), vy: r1(Math.sin(a) * v) }; }
  var gcache = {}, gcount = 0;
  function golfPlan(S, i, rnd) {
    var b = S.g[i], hd = HOLES[b.h], key = S.id + ':' + i + ':' + b.h + ':' + b.st + ':' + b.x + ':' + b.y;
    if (gcache[key]) return gcache[key];
    if (++gcount > 400) { gcache = {}; gcount = 0; }
    var best = null;
    for (var da = -90; da < 90; da += 2) for (var pk = 2; pk <= GF.PMAX; pk += 2) {
      var ai = b.ai + da, v = golfShot(ai, pk), s = { x: b.x, y: b.y, vx: v.vx, vy: v.vy }, sunk = 0;
      for (var n = 0; n < 220 && (s.vx || s.vy); n++) if (golfStep(s, hd, 1 / 30)) { sunk = 1; break; }
      var cost = (sunk ? -200 : golfCost(hd, s.x, s.y)) + Math.abs(da) * 0.12 + (sunk ? pk * 0.5 : 0);
      if (!best || cost < best.c) best = { c: cost, ai: ai, pk: pk };
    }
    best = { c: best.c, ai: best.ai + Math.round((rnd() - 0.5) * 2.6), pk: clamp(best.pk + Math.round((rnd() - 0.5) * 2.2), 1, GF.PMAX) };
    gcache[key] = best; return best;
  }
  function golfTotal(b) { var s = 0; b.tot.forEach(function (v) { s += v; }); return s + (b.done ? 0 : b.st); }
  function golfFinal(b) { var s = 0; b.tot.forEach(function (v) { s += v; }); return s + (3 - b.tot.length) * 7; }
  function golfRes(S) {
    var a = golfFinal(S.g[0]), b = golfFinal(S.g[1]);
    return { winner: a < b ? 'host' : b < a ? 'guest' : 'tie', text: a + ' - ' + b + ' strokes' };
  }
  P.add({
    id: 'mini-golf', name: 'Mini Golf', icon: '⛳', cat: 'Sports',
    howto: 'Play 3 holes on your own course side by side. Aim, charge your putt and sink the ball in as few strokes as you can. Fewest total strokes wins (6 strokes max per hole, then it counts as 7).',
    controls: 'Aim: ←/→ · Hold Space to charge, release to putt (or hold mouse on your course)',
    duration: 45,
    init: function (rnd) {
      function mk() { var t = HOLES[0].tee; return { h: 0, x: t[0], y: t[1], vx: 0, vy: 0, ai: AI0, pk: 0, pd: 1, ch: 0, st: 0, tot: [], wt: 0, sk: 0, done: 0 }; }
      return { g: [mk(), mk()], score: [0, 0], fx: [], sh: 0, t: 0, id: Math.floor(rnd() * 1e6) };
    },
    step: function (S, dt, inp, ev, rnd) {
      S.t += dt; tickFx(S, dt);
      for (var i = 0; i < 2; i++) {
        var b = S.g[i], k = inp[WHO[i]];
        if (b.done) continue;
        var hd = HOLES[b.h];
        if (b.wt > 0) {
          b.wt -= dt;
          if (b.wt <= 0) {
            b.wt = 0; b.sk = 0; b.h++;
            if (b.h >= 3) { b.done = 1; b.h = 2; pop(S, gox(i) + 180, 280, 'Done! ' + golfTotal(b), COL[WHO[i]], 30); }
            else { var nh = HOLES[b.h]; b.x = nh.tee[0]; b.y = nh.tee[1]; b.st = 0; b.ai = AI0; b.vx = 0; b.vy = 0; b.pk = 0; b.ch = 0; }
          }
          continue;
        }
        if (b.vx || b.vy) {
          if (golfStep(b, hd, dt)) {
            b.tot.push(b.st); b.wt = 1.4; b.sk = 1;
            var d = b.st - hd.par, txt = b.st === 1 ? 'HOLE IN ONE!' : d <= -2 ? 'Eagle!' : d === -1 ? 'Birdie!' : d === 0 ? 'Par' : d === 1 ? 'Bogey' : '+' + d;
            pop(S, gox(i) + hd.cup[0], GF.OY + hd.cup[1] + 40, txt, b.st === 1 ? COL.gold : d < 0 ? COL.good : '#fff', b.st === 1 ? 34 : 28);
            burst(S, gox(i) + hd.cup[0], GF.OY + hd.cup[1], COL[WHO[i]], 16);
            if (d < 0) { burst(S, gox(i) + hd.cup[0], GF.OY + hd.cup[1], COL.gold, 12); }
          } else if (!b.vx && !b.vy && b.st >= 6) {
            b.tot.push(7); b.wt = 1.2; pop(S, gox(i) + b.x, GF.OY + b.y - 20, 'Picked up: 7', COL.bad, 24);
          }
          continue;
        }
        var px = k.px - gox(i), py = k.py - GF.OY, inBox = px >= 0 && px <= GF.CW && py >= 0 && py <= GF.CH;
        var usePtr = k.pd && inBox;
        if (usePtr) { if (Math.hypot(px - b.x, py - b.y) > 4) b.ai = Math.round(Math.atan2(py - b.y, px - b.x) / GF.AST); }
        else { if (k.left) b.ai--; if (k.right) b.ai++; }
        var charging = k.a || usePtr;
        if (charging) {
          if (!b.ch) { b.ch = 1; b.pk = 0; b.pd = 1; }
          else { b.pk += b.pd; if (b.pk >= GF.PMAX) { b.pk = GF.PMAX; b.pd = -1; } else if (b.pk <= 0) { b.pk = 0; b.pd = 1; } }
        } else if (b.ch) {
          b.ch = 0;
          if (b.pk > 0) { var v = golfShot(b.ai, b.pk); b.vx = v.vx; b.vy = v.vy; b.st++; }
          b.pk = 0;
        }
      }
      S.score = [golfTotal(S.g[0]), golfTotal(S.g[1])];
      if (S.g[0].done && S.g[1].done) S.result = golfRes(S);
    },
    timeout: function (S) { return golfRes(S); },
    draw: function (c, S, me, D, info) {
      var t = performance.now() / 1000;
      D.bg(c, '#1d4a5a', '#0a1e26');
      c.save(); shake(c, S);
      for (var i = 0; i < 2; i++) {
        var b = S.g[i], hd = HOLES[b.h], x0 = gox(i), y0 = GF.OY, who = WHO[i], isMe = me === who;
        c.save();
        if (isMe) { c.shadowColor = COL[who]; c.shadowBlur = 24; }
        D.rrect(c, x0 - 9, y0 - 9, GF.CW + 18, GF.CH + 18, 16, '#7a4a24'); c.restore();
        D.rrect(c, x0 - 9, y0 - 9, GF.CW + 18, GF.CH + 18, 16, null, isMe ? COL[who] : 'rgba(0,0,0,.4)');
        c.save(); c.beginPath(); c.rect(x0, y0, GF.CW, GF.CH); c.clip();
        for (var s = 0; s < GF.CH; s += 32) { c.fillStyle = (s / 32) % 2 ? '#3cae4f' : '#35a046'; c.fillRect(x0, y0 + s, GF.CW, 32); }
        /* tee */
        D.rrect(c, x0 + hd.tee[0] - 18, y0 + hd.tee[1] - 10, 36, 20, 6, 'rgba(255,255,255,.15)');
        /* obstacles */
        hd.rects.forEach(function (r) {
          D.rrect(c, x0 + r[0], y0 + r[1] + 4, r[2], r[3], 5, 'rgba(0,0,0,.25)');
          D.rrect(c, x0 + r[0], y0 + r[1], r[2], r[3], 5, '#9a6232');
          c.fillStyle = '#c58a4e'; c.fillRect(x0 + r[0] + 3, y0 + r[1] + 3, r[2] - 6, 4);
        });
        hd.circ.forEach(function (ci) {
          c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.arc(x0 + ci[0] + 3, y0 + ci[1] + 4, ci[2], 0, 6.3); c.fill();
          D.circle(c, x0 + ci[0], y0 + ci[1], ci[2], '#e8334a', 10);
          c.strokeStyle = '#fff'; c.lineWidth = 4; c.beginPath(); c.arc(x0 + ci[0], y0 + ci[1], ci[2] * 0.6, 0, 6.3); c.stroke();
        });
        /* cup + flag */
        var cx = x0 + hd.cup[0], cy = y0 + hd.cup[1];
        c.fillStyle = '#d9f5d2'; c.beginPath(); c.arc(cx, cy, GF.CUP + 3, 0, 6.3); c.fill();
        c.fillStyle = '#0b120b'; c.beginPath(); c.arc(cx, cy, GF.CUP, 0, 6.3); c.fill();
        c.strokeStyle = '#eee'; c.lineWidth = 3; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx, cy - 46); c.stroke();
        var wv = Math.sin(t * 4 + i) * 4;
        c.fillStyle = COL[who]; c.beginPath(); c.moveTo(cx, cy - 46); c.lineTo(cx + 28, cy - 39 + wv); c.lineTo(cx, cy - 30); c.fill();
        /* aim */
        var aiming = !b.done && !b.wt && !b.vx && !b.vy;
        if (aiming) {
          var a = b.ai * GF.AST, len = 34 + (b.ch ? b.pk / GF.PMAX : 0) * 90;
          c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 3; c.setLineDash([7, 6]);
          c.beginPath(); c.moveTo(x0 + b.x, y0 + b.y); c.lineTo(x0 + b.x + Math.cos(a) * len, y0 + b.y + Math.sin(a) * len); c.stroke(); c.setLineDash([]);
          var ex = x0 + b.x + Math.cos(a) * len, ey = y0 + b.y + Math.sin(a) * len;
          c.fillStyle = '#fff'; c.beginPath(); c.moveTo(ex + Math.cos(a) * 10, ey + Math.sin(a) * 10); c.lineTo(ex + Math.cos(a + 2.4) * 9, ey + Math.sin(a + 2.4) * 9); c.lineTo(ex + Math.cos(a - 2.4) * 9, ey + Math.sin(a - 2.4) * 9); c.fill();
        }
        /* ball */
        if (!(b.sk && b.wt > 0) && !b.done) {
          c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.arc(x0 + b.x + 2, y0 + b.y + 3, GF.BR, 0, 6.3); c.fill();
          D.circle(c, x0 + b.x, y0 + b.y, GF.BR, '#ffffff', 8);
          c.strokeStyle = COL[who]; c.lineWidth = 3; c.beginPath(); c.arc(x0 + b.x, y0 + b.y, GF.BR + 3, 0, 6.3); c.stroke();
        }
        if (b.done) {
          c.fillStyle = 'rgba(10,20,10,.55)'; c.fillRect(x0, y0, GF.CW, GF.CH);
          D.otext(c, 'FINISHED', x0 + 180, y0 + 160, 36, COL.gold);
          D.otext(c, golfTotal(b) + ' strokes', x0 + 180, y0 + 205, 28, '#fff');
        }
        c.restore();
        /* power bar */
        if (aiming && b.ch) {
          var f = b.pk / GF.PMAX;
          D.bar(c, x0 + 30, y0 + GF.CH - 22, GF.CW - 60, 12, f, f < 0.5 ? COL.good : f < 0.8 ? COL.gold : COL.bad, 'rgba(0,0,0,.35)');
        }
        /* label */
        D.player(c, x0 + 14, y0 - 26, 11, who, null, isMe);
        D.otext(c, (isMe ? 'YOU' : info.names[who]) + ' · Hole ' + (b.h + 1) + '/3 · ' + (b.done ? 'done' : b.st + ' stroke' + (b.st === 1 ? '' : 's')), x0 + 34, y0 - 26, 16, COL[who], 'left');
        D.otext(c, 'Par ' + hd.par, x0 + GF.CW, y0 - 26, 14, COL.dim, 'right');
      }
      drawFx(c, S, D);
      c.restore();
      D.hud(c, info, S.score[0], S.score[1]);
    },
    bot: function (S, me, rnd) {
      var i = me === 'host' ? 0 : 1, inp = P.emptyIn(), b = S.g[i];
      if (b.done || b.wt > 0 || b.vx || b.vy) return { in: inp, ev: [] };
      var pl = golfPlan(S, i, rnd);
      if (b.ch) { inp.a = b.pk === pl.pk ? 0 : 1; }
      else if (b.ai < pl.ai) inp.right = 1;
      else if (b.ai > pl.ai) inp.left = 1;
      else inp.a = 1;
      return { in: inp, ev: [] };
    }
  });

  /* =====================================================================
     4. STRIKE ZONE (bowling)
     ===================================================================== */
  var BW = { LW: 75, FOUL: 440, HP: 178, BR: 11, PR: 7, SPD: 470, CV: 190, SWING: 2.6, AMP: 0.3 };
  function lcx(i) { return 200 + i * 400; }
  function rackPins() { var a = []; for (var r = 0; r < 4; r++) for (var k = 0; k <= r; k++) a.push({ x: r1((k - r / 2) * 24), y: BW.HP - r * 21, vx: 0, vy: 0, h: 0, g: 0 }); return a; }
  function bowlNewBall(b) { b.ph = 'pos'; b.x = 0; b.y = BW.FOUL; b.vx = 0; b.vy = 0; b.cv = 0; b.at = 0; b.ang = 0; b.gt = 0; b.t = 0; }
  function bowlTotal(b) {
    var s = 0;
    b.fs.forEach(function (f) { var p = f[0] + (f[1] || 0); s += p; if (f[0] === 10) s += 5; else if (f.length > 1 && p === 10) s += 3; });
    return s;
  }
  function bowlBallPath(x, ang, at, y2) {
    var vx = Math.sin(ang) * BW.SPD, vy = -Math.cos(ang) * BW.SPD, cv = Math.cos(at * BW.SWING) * BW.CV, y = BW.FOUL, h = 1 / 90;
    for (var n = 0; n < 600 && y > y2; n++) { vx += cv * h; x += vx * h; y += vy * h; if (Math.abs(x) > BW.LW - 2) return 999; }
    return x;
  }
  function bowlPhys(S, i, dt, rnd) {
    var b = S.b[i], N = 3, h = dt / N, pins = b.pins, R = BW.BR + BW.PR;
    for (var s = 0; s < N; s++) {
      var roll = b.ph === 'roll';
      if (roll) {
        b.vx += b.cv * h; b.x += b.vx * h; b.y += b.vy * h;
        if (!b.gt && Math.abs(b.x) > BW.LW - 2) { b.gt = 1; b.vx = 0; b.cv = 0; b.x = (b.x > 0 ? 1 : -1) * (BW.LW + 9); pop(S, lcx(i), 300, 'Gutter!', COL.bad, 28); }
      }
      for (var k = 0; k < pins.length; k++) {
        var p = pins[k]; if (p.g) continue;
        p.x += p.vx * h; p.y += p.vy * h;
        if (Math.abs(p.x) > BW.LW) { p.h = 1; p.x = (p.x > 0 ? 1 : -1) * (BW.LW + 8); p.vx = 0; p.vy *= 0.6; }
        if (p.y < 92) { p.y = 92; p.vy = 0; p.h = 1; }
        if (roll && !b.gt) {
          var dx = p.x - b.x, dy = p.y - b.y, d = Math.hypot(dx, dy);
          if (d < R && d > 0.01) {
            var nx = dx / d, ny = dy / d; p.x = b.x + nx * R; p.y = b.y + ny * R;
            var vn = (p.vx - b.vx) * nx + (p.vy - b.vy) * ny;
            if (vn < 0) { var J = -1.8 * vn / (1 / 6 + 1); p.vx += J * nx + (rnd() - 0.5) * 90; p.vy += J * ny + (rnd() - 0.5) * 50; b.vx -= J / 6 * nx; b.vy -= J / 6 * ny; }
            if (!p.h) { p.h = 1; if (!b.hit) { b.hit = 1; S.sh = Math.max(S.sh, 0.25); } }
          }
        }
        for (var m = k + 1; m < pins.length; m++) {
          var q = pins[m]; if (q.g) continue;
          var ex = q.x - p.x, ey = q.y - p.y, ed = Math.hypot(ex, ey);
          if (ed < BW.PR * 2 && ed > 0.01) {
            var ux = ex / ed, uy = ey / ed, ov = (BW.PR * 2 - ed) / 2;
            p.x -= ux * ov; p.y -= uy * ov; q.x += ux * ov; q.y += uy * ov;
            var vn2 = (q.vx - p.vx) * ux + (q.vy - p.vy) * uy;
            if (vn2 < 0) {
              var j2 = -0.9 * vn2 * (0.85 + rnd() * 0.3); p.vx -= j2 * ux; p.vy -= j2 * uy; q.vx += j2 * ux; q.vy += j2 * uy;
              if (-vn2 > 25) { p.h = 1; q.h = 1; }
            }
          }
        }
      }
    }
    pins.forEach(function (p) { p.vx *= (1 - 2.6 * dt); p.vy *= (1 - 2.6 * dt); if (Math.abs(p.vx) < 2) p.vx = 0; if (Math.abs(p.vy) < 2) p.vy = 0; p.x = r1(p.x); p.y = r1(p.y); p.vx = r1(p.vx); p.vy = r1(p.vy); });
    b.x = r1(b.x); b.y = r1(b.y); b.vx = r1(b.vx); b.vy = r1(b.vy);
  }
  P.add({
    id: 'bowling', name: 'Strike Zone', icon: '🎳', cat: 'Sports',
    howto: '3 frames each on your own lane. Line up the ball, start the swinging aim arrow, then throw: the arrow\'s swing adds a hook! Strike = 10 + 5 bonus, spare = 10 + 3. Highest total wins.',
    controls: 'Move: ←/→ · Space: start aim, Space again: throw (or click your lane)',
    duration: 42,
    init: function (rnd) {
      function mk() { var b = { fr: 0, bl: 0, pins: rackPins(), fs: [], hit: 0 }; bowlNewBall(b); return b; }
      return { b: [mk(), mk()], score: [0, 0], fx: [], sh: 0 };
    },
    step: function (S, dt, inp, ev, rnd) {
      tickFx(S, dt);
      for (var i = 0; i < 2; i++) {
        var b = S.b[i], k = inp[WHO[i]], evs = ev[WHO[i]], go = false, cx = lcx(i);
        for (var e = 0; e < evs.length; e++) {
          if (evs[e].t === 'a') go = true;
          if (evs[e].t === 'tap' && Math.abs(evs[e].x - cx) < 110) { go = true; if (b.ph === 'pos') b.x = r1(clamp(evs[e].x - cx, -(BW.LW - BW.BR - 4), BW.LW - BW.BR - 4)); }
        }
        b.t += dt;
        if (b.ph === 'pos') {
          var dx = (k.right ? 1 : 0) - (k.left ? 1 : 0);
          b.x = r1(clamp(b.x + dx * 150 * dt, -(BW.LW - BW.BR - 4), BW.LW - BW.BR - 4));
          if (go) { b.ph = 'aim'; b.at = 0; b.ang = 0; }
        } else if (b.ph === 'aim') {
          if (go) {
            b.vx = r1(Math.sin(b.ang) * BW.SPD); b.vy = r1(-Math.cos(b.ang) * BW.SPD);
            b.cv = r1(Math.cos(b.at * BW.SWING) * BW.CV); b.ph = 'roll'; b.hit = 0; b.t = 0;
          } else { b.at = Math.round((b.at + dt) * 1000) / 1000; b.ang = Math.round(BW.AMP * Math.sin(b.at * BW.SWING) * 10000) / 10000; }
        } else if (b.ph === 'roll') {
          bowlPhys(S, i, dt, rnd);
          if (b.y < 70) { b.ph = 'settle'; b.t = 0; }
        } else if (b.ph === 'settle') {
          bowlPhys(S, i, dt, rnd);
          if (b.t > 0.9) {
            var n = 0; b.pins.forEach(function (p) { if (p.h && !p.g) { n++; p.g = 1; } });
            if (b.bl === 0) {
              b.fs.push([n]);
              if (n === 10) { pop(S, cx, 260, 'STRIKE!', COL.gold, 46); burst(S, cx, 150, COL.gold, 18); burst(S, cx, 150, COL[WHO[i]], 14); S.sh = 0.5; }
              else pop(S, cx, 260, n + (n === 1 ? ' pin' : ' pins'), '#fff', 30);
            } else {
              b.fs[b.fr].push(n);
              var tot = b.fs[b.fr][0] + n;
              if (tot === 10) { pop(S, cx, 260, 'SPARE!', COL.good, 42); burst(S, cx, 150, COL.good, 16); }
              else pop(S, cx, 260, '+' + n, '#fff', 30);
            }
            if (b.bl === 0 && n < 10) { b.bl = 1; bowlNewBall(b); }
            else {
              b.fr++; b.bl = 0;
              if (b.fr >= 3) { b.ph = 'done'; }
              else { b.pins = rackPins(); bowlNewBall(b); }
            }
          }
        }
      }
      S.score = [bowlTotal(S.b[0]), bowlTotal(S.b[1])];
      if (S.b[0].ph === 'done' && S.b[1].ph === 'done') {
        var a = S.score[0], c2 = S.score[1];
        S.result = { winner: a > c2 ? 'host' : c2 > a ? 'guest' : 'tie', text: a + ' - ' + c2 + ' points' };
      }
    },
    timeout: function (S) { var a = S.score[0], c2 = S.score[1]; return { winner: a > c2 ? 'host' : c2 > a ? 'guest' : 'tie', text: a + ' - ' + c2 + ' points' }; },
    draw: function (c, S, me, D, info) {
      var t = performance.now() / 1000;
      var bg = c.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#2a1145'); bg.addColorStop(1, '#0c0618'); c.fillStyle = bg; c.fillRect(0, 0, W, H);
      /* neon strip */
      for (var nx = 0; nx < W; nx += 40) { c.fillStyle = 'hsla(' + ((nx + t * 60) % 360) + ',90%,60%,.35)'; c.fillRect(nx, 78, 30, 4); }
      c.save(); shake(c, S);
      for (var i = 0; i < 2; i++) {
        var b = S.b[i], who = WHO[i], cx = lcx(i), isMe = me === who;
        /* gutters + lane */
        c.save(); if (isMe) { c.shadowColor = COL[who]; c.shadowBlur = 26; }
        D.rrect(c, cx - 96, 88, 192, 410, 14, '#1b1b26'); c.restore();
        var lg = c.createLinearGradient(cx - 75, 0, cx + 75, 0); lg.addColorStop(0, '#d39a52'); lg.addColorStop(0.5, '#f0c27f'); lg.addColorStop(1, '#d39a52');
        c.fillStyle = lg; c.fillRect(cx - BW.LW, 88, BW.LW * 2, 412);
        c.strokeStyle = 'rgba(120,70,20,.25)'; c.lineWidth = 1; c.beginPath();
        for (var bx = cx - BW.LW + 10; bx < cx + BW.LW; bx += 10) { c.moveTo(bx, 88); c.lineTo(bx, 500); } c.stroke();
        c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(cx - BW.LW, 88, BW.LW * 2, 130);
        for (var a = -2; a <= 2; a++) { var ax = cx + a * 22, ay = 350 + Math.abs(a) * 10; c.fillStyle = 'rgba(140,40,30,.6)'; c.beginPath(); c.moveTo(ax, ay - 9); c.lineTo(ax - 5, ay + 5); c.lineTo(ax + 5, ay + 5); c.fill(); }
        c.fillStyle = COL.bad; c.fillRect(cx - BW.LW, BW.FOUL - 22, BW.LW * 2, 3);
        /* pins */
        b.pins.forEach(function (p) {
          if (p.g) return;
          var px = cx + p.x, py = p.y;
          if (p.h) { c.save(); c.translate(px, py); c.rotate(p.x * 0.05 + 0.8); c.globalAlpha = 0.85; c.fillStyle = '#e8e8ee'; c.beginPath(); c.ellipse(0, 0, 13, 5, 0, 0, 6.3); c.fill(); c.fillStyle = COL.bad; c.fillRect(-3, -5, 3, 10); c.restore(); }
          else {
            c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.arc(px + 2, py + 3, BW.PR, 0, 6.3); c.fill();
            D.circle(c, px, py, BW.PR, '#ffffff', 6);
            c.strokeStyle = COL.bad; c.lineWidth = 2; c.beginPath(); c.arc(px, py, BW.PR - 2.5, 0, 6.3); c.stroke();
          }
        });
        /* ball */
        if (b.ph === 'pos' || b.ph === 'aim' || b.ph === 'roll') {
          var bxx = cx + b.x, byy = b.y;
          if (b.ph === 'aim') {
            var ang = b.ang, curve = Math.cos(b.at * BW.SWING);
            c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 4; c.beginPath(); c.moveTo(bxx, byy);
            var ex = bxx, ey = byy, vx = Math.sin(ang), vy = -Math.cos(ang);
            for (var sN = 0; sN < 14; sN++) { vx += curve * 0.025; ex += vx * 9; ey += vy * 9; c.lineTo(ex, ey); }
            c.stroke();
            D.circle(c, ex, ey, 6, '#fff', 10);
            D.otext(c, curve > 0.25 ? 'hook ↷' : curve < -0.25 ? '↶ hook' : 'straight', bxx, byy + 34, 14, '#fff');
          }
          if (b.ph === 'pos') { D.otext(c, '◀', bxx - 30, byy, 22, '#fff'); D.otext(c, '▶', bxx + 30, byy, 22, '#fff'); D.otext(c, isMe ? 'Space: aim' : '', bxx, byy + 34, 14, '#fff'); }
          c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.arc(bxx + 3, byy + 4, BW.BR, 0, 6.3); c.fill();
          D.circle(c, bxx, byy, BW.BR, COL[who], 14);
          var rot = b.ph === 'roll' ? b.y * 0.08 : 0;
          c.fillStyle = '#1a1033'; for (var hN = 0; hN < 3; hN++) { var ha = rot + hN * 0.7; c.beginPath(); c.arc(bxx + Math.cos(ha) * 4, byy - 3 + Math.sin(ha) * 3, 1.8, 0, 6.3); c.fill(); }
        }
        if (b.ph === 'done') { D.otext(c, 'DONE', cx, 300, 40, COL.gold); }
        /* score card */
        var sx = i === 0 ? 14 : W - 104;
        D.player(c, sx + 45, 120, 20, who, null, isMe);
        D.otext(c, isMe ? 'YOU' : info.names[who], sx + 45, 156, 16, COL[who]);
        for (var f = 0; f < 3; f++) {
          var fy = 176 + f * 62, fr = b.fs[f], cur = f === b.fr && b.ph !== 'done';
          D.rrect(c, sx, fy, 90, 54, 10, cur ? 'rgba(255,209,102,.18)' : 'rgba(255,255,255,.07)', cur ? COL.gold : 'rgba(255,255,255,.15)');
          D.text(c, 'F' + (f + 1), sx + 12, fy + 12, 11, COL.dim, 'left', 700);
          var txt = !fr ? '' : fr[0] === 10 ? 'X' : fr.length > 1 && fr[0] + fr[1] === 10 ? fr[0] + ' /' : fr[0] + ' ' + (fr.length > 1 ? fr[1] : '');
          D.text(c, txt, sx + 45, fy + 32, 22, txt === 'X' ? COL.gold : '#fff');
        }
        D.otext(c, S.score[i], sx + 45, 395, 40, COL[who]);
        D.text(c, 'points', sx + 45, 425, 13, COL.dim, 'center', 600);
      }
      drawFx(c, S, D);
      c.restore();
      D.hud(c, info, S.score[0], S.score[1], 'strike +5 · spare +3');
    },
    bot: function (S, me, rnd) {
      var i = me === 'host' ? 0 : 1, inp = P.emptyIn(), b = S.b[i], ev = [];
      var standing = b.pins.filter(function (p) { return !p.h && !p.g; });
      var target = 7, tx = 0;
      if (b.bl === 1 && standing.length) {
        var sx = 0, sy = 0; standing.forEach(function (p) { sx += p.x; sy += p.y; }); target = sx / standing.length;
        tx = clamp(target * 0.5, -40, 40);
      }
      if (b.ph === 'pos') {
        if (b.x < tx - 4) inp.right = 1; else if (b.x > tx + 4) inp.left = 1; else if (rnd() < 0.3) ev.push({ t: 'a' });
      } else if (b.ph === 'aim' && b.at > 0.3) {
        var x = bowlBallPath(b.x, b.ang, b.at, BW.HP + 12);
        if (Math.abs(x - (target + (rnd() - 0.5) * 16)) < 4) ev.push({ t: 'a' });
      }
      return { in: inp, ev: ev };
    }
  });

  /* =====================================================================
     5. FISHING FRENZY
     ===================================================================== */
  function fishZone(p) { var w = p.w || 1; return { c: 0.55 + 0.16 * Math.sin(p.t * 1.7), w: 0.17 - w * 0.007 }; }
  function fishMiss(S, i, msg) { var p = S.p[i]; p.ph = 'miss'; p.t = 0; pop(S, i ? 530 : 270, 250, msg, COL.bad, 26); }
  var FBX = [280, 520];
  P.add({
    id: 'fishing', name: 'Fishing Frenzy', icon: '🎣', cat: 'Sports',
    howto: 'Watch your bobber. Little nibbles are fakes - wait until it goes fully UNDER, then hook it! Then tap to keep the line tension in the green zone until the fish is reeled in. Most total kg in 35 s wins.',
    controls: 'Hook & reel: Space / click (tap to add tension)',
    duration: 35,
    init: function (rnd) {
      function mk() { return { ph: 'cast', t: 0, nx: 1, fk: 0, w: 0, tn: 0.5, pr: 0, tot: 0, n: 0, lw: 0 }; }
      return { p: [mk(), mk()], score: [0, 0], fx: [], sh: 0 };
    },
    step: function (S, dt, inp, ev, rnd) {
      tickFx(S, dt);
      for (var i = 0; i < 2; i++) {
        var p = S.p[i], evs = ev[WHO[i]], press = pressed(evs), taps = 0;
        evs.forEach(function (e) { if (isHit(e)) taps++; });
        p.t = Math.round((p.t + dt) * 1000) / 1000;
        if (p.ph === 'cast') {
          if (p.t > 0.7) { p.fk = Math.floor(rnd() * 3); p.ph = 'wait'; p.t = 0; p.nx = r1(0.6 + rnd() * 1.5); }
        } else if (p.ph === 'wait') {
          if (press) fishMiss(S, i, 'Too early!');
          else if (p.t >= p.nx) { p.ph = p.fk > 0 ? 'nib' : 'bite'; p.t = 0; }
        } else if (p.ph === 'nib') {
          if (press) fishMiss(S, i, 'Just a nibble!');
          else if (p.t > 0.42) { p.fk--; p.ph = 'wait'; p.t = 0; p.nx = r1(0.4 + rnd() * 1.1); }
        } else if (p.ph === 'bite') {
          if (press) { p.ph = 'reel'; p.t = 0; p.w = r1(0.6 + rnd() * rnd() * 9.4); p.tn = 0.55; p.pr = 0; pop(S, FBX[i], 240, 'HOOKED!', COL.gold, 30); burst(S, FBX[i], 300, '#bfefff', 10); }
          else if (p.t > 0.9) fishMiss(S, i, 'It got away!');
        } else if (p.ph === 'reel') {
          var z = fishZone(p);
          p.tn += taps * 0.11 - (0.36 + p.w * 0.05) * dt;
          if (rnd() < 0.035) p.tn -= 0.05 + p.w * 0.008;
          var inZ = Math.abs(p.tn - z.c) < z.w;
          p.pr = Math.max(0, p.pr + (inZ ? dt / (1.2 + p.w * 0.16) : -dt * 0.12));
          p.tn = Math.round(p.tn * 1000) / 1000; p.pr = Math.round(p.pr * 1000) / 1000;
          if (p.tn >= 1) { fishMiss(S, i, 'Line snapped!'); S.sh = 0.3; }
          else if (p.tn <= 0) fishMiss(S, i, 'It escaped!');
          else if (p.pr >= 1) {
            var wt = Math.round(p.w * 10); p.tot += wt; p.n++; p.lw = p.w; p.ph = 'got'; p.t = 0;
            pop(S, FBX[i], 200, '+' + p.w.toFixed(1) + ' kg', p.w > 5 ? COL.gold : COL[WHO[i]], p.w > 5 ? 38 : 30);
            burst(S, FBX[i], 290, '#bfefff', 16); burst(S, FBX[i], 290, COL[WHO[i]], 10);
            if (p.w > 5) S.sh = 0.3;
          }
        } else if (p.ph === 'got') {
          if (p.t > 1.2) { p.ph = 'cast'; p.t = 0; }
        } else if (p.ph === 'miss') {
          if (p.t > 1.0) { p.ph = 'cast'; p.t = 0; }
        }
      }
      S.score = [S.p[0].tot, S.p[1].tot];
    },
    timeout: function (S) {
      var a = S.p[0].tot, b = S.p[1].tot;
      return { winner: a > b ? 'host' : b > a ? 'guest' : 'tie', text: (a / 10).toFixed(1) + ' kg - ' + (b / 10).toFixed(1) + ' kg' };
    },
    draw: function (c, S, me, D, info) {
      var t = performance.now() / 1000;
      var sky = c.createLinearGradient(0, 0, 0, 240); sky.addColorStop(0, '#3b1d6e'); sky.addColorStop(0.6, '#e2577a'); sky.addColorStop(1, '#ffb36b');
      c.fillStyle = sky; c.fillRect(0, 0, W, 240);
      D.circle(c, 400, 225, 60, '#ffe08a', 40);
      var sea = c.createLinearGradient(0, 230, 0, H); sea.addColorStop(0, '#2d7fa6'); sea.addColorStop(1, '#0a2546');
      c.fillStyle = sea; c.fillRect(0, 230, W, H - 230);
      c.fillStyle = 'rgba(255,224,138,.25)'; for (var gy = 240; gy < 330; gy += 12) c.fillRect(400 - (gy - 230) * 0.9 + Math.sin(t * 2 + gy) * 8, gy, (gy - 230) * 1.8, 3);
      c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 2;
      for (var wy = 260; wy < H; wy += 34) { c.beginPath(); for (var wx = 0; wx <= W; wx += 20) c.lineTo(wx, wy + Math.sin(wx * 0.03 + t * 1.6 + wy) * 4); c.stroke(); }
      /* fish shadows */
      for (var f = 0; f < 4; f++) { var fx = ((t * (25 + f * 9) + f * 220) % 900) - 50, fy = 360 + f * 30; c.fillStyle = 'rgba(0,20,40,.3)'; c.beginPath(); c.ellipse(fx, fy, 22, 8, 0, 0, 6.3); c.fill(); c.beginPath(); c.moveTo(fx - 20, fy); c.lineTo(fx - 32, fy - 8); c.lineTo(fx - 32, fy + 8); c.fill(); }
      c.save(); shake(c, S);
      for (var i = 0; i < 2; i++) {
        var p = S.p[i], who = WHO[i], isMe = me === who, side = i ? -1 : 1, dockX = i ? W - 175 : 0;
        /* dock */
        c.fillStyle = '#6b4424'; c.fillRect(dockX, 222, 175, 22);
        c.fillStyle = '#4a2c14'; for (var pl = 0; pl < 4; pl++) c.fillRect(dockX + 12 + pl * 45, 244, 10, 60);
        c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1; for (var pk = 0; pk < 175; pk += 25) { c.beginPath(); c.moveTo(dockX + pk, 222); c.lineTo(dockX + pk, 244); c.stroke(); }
        var ax = i ? W - 130 : 130, ay = 194;
        D.player(c, ax, ay, 26, who, isMe ? 'YOU' : info.names[who], isMe);
        /* bobber position */
        var bx = FBX[i], by = 300, under = false, tug = 0;
        if (p.ph === 'cast') { var q = Math.min(1, p.t / 0.6); bx = ax + (FBX[i] - ax) * q; by = 140 + (300 - 140) * q - Math.sin(q * 3.14) * 80; }
        else if (p.ph === 'wait') by += Math.sin(t * 3 + i) * 2;
        else if (p.ph === 'nib') by += 5 + Math.sin(p.t * 40) * 3;
        else if (p.ph === 'bite') under = true;
        else if (p.ph === 'reel') { tug = Math.sin(t * 9) * 10; bx += tug; by += 4; under = true; }
        /* rod + line */
        var tipX = ax + side * 70, tipY = 120 - (p.ph === 'reel' ? 14 : 0);
        c.strokeStyle = '#3b2412'; c.lineWidth = 5; c.beginPath(); c.moveTo(ax + side * 10, ay + 6); c.lineTo(tipX, tipY); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(tipX, tipY);
        if (p.ph === 'reel') c.lineTo(bx, by); else c.quadraticCurveTo((tipX + bx) / 2, Math.max(tipY, by) + 30, bx, by);
        c.stroke();
        if (p.ph !== 'miss' && p.ph !== 'got') {
          if (!under) {
            c.fillStyle = '#fff'; c.beginPath(); c.arc(bx, by - 4, 8, Math.PI, 0); c.fill();
            c.fillStyle = '#ff3b3b'; c.beginPath(); c.arc(bx, by - 4, 8, 0, Math.PI); c.fill();
            c.fillStyle = '#fff'; c.fillRect(bx - 1.5, by - 20, 3, 10);
            c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 2; c.beginPath(); c.ellipse(bx, by + 4, 14 + (p.ph === 'nib' ? 6 : 0), 4, 0, 0, 6.3); c.stroke();
          } else {
            for (var rr = 0; rr < 3; rr++) { var rp = ((t * 1.5 + rr / 3) % 1); c.strokeStyle = 'rgba(255,255,255,' + (0.6 * (1 - rp)) + ')'; c.lineWidth = 3; c.beginPath(); c.ellipse(bx, by + 2, 10 + rp * 40, 4 + rp * 12, 0, 0, 6.3); c.stroke(); }
          }
        }
        if (p.ph === 'bite') D.otext(c, '!', bx, by - 50 + Math.sin(t * 20) * 3, 54, COL.gold);
        if (p.ph === 'wait' || p.ph === 'nib') D.otext(c, '…', bx, by - 40, 26, 'rgba(255,255,255,.6)');
        /* caught fish leaping */
        if (p.ph === 'got') {
          var gq = Math.min(1, p.t / 0.7), fxp = FBX[i] + (ax - FBX[i]) * gq, fyp = 300 - Math.sin(gq * 3.14) * 120 - gq * 40, sc = 0.7 + p.lw * 0.1;
          c.save(); c.translate(fxp, fyp); c.rotate(Math.sin(t * 12) * 0.3); c.scale(sc, sc);
          c.fillStyle = p.lw > 5 ? '#ffcf4a' : '#7fd6ff'; c.beginPath(); c.ellipse(0, 0, 22, 11, 0, 0, 6.3); c.fill();
          c.beginPath(); c.moveTo(-18, 0); c.lineTo(-34, -12); c.lineTo(-34, 12); c.fill();
          c.fillStyle = '#123'; c.beginPath(); c.arc(12, -3, 2.5, 0, 6.3); c.fill(); c.restore();
        }
        /* tension meter */
        if (p.ph === 'reel') {
          var mx = i ? W - 60 : 36, my = 268, mh = 200, z = fishZone(p);
          D.rrect(c, mx, my, 26, mh, 13, 'rgba(0,0,0,.5)', 'rgba(255,255,255,.4)');
          c.fillStyle = 'rgba(74,222,128,.75)'; c.fillRect(mx + 3, my + mh * (1 - (z.c + z.w)), 20, mh * z.w * 2);
          c.fillStyle = 'rgba(255,90,106,.6)'; c.fillRect(mx + 3, my + 3, 20, mh * 0.06);
          var ty = my + mh * (1 - clamp(p.tn, 0, 1));
          c.fillStyle = '#fff'; c.fillRect(mx - 6, ty - 3, 38, 6);
          D.otext(c, 'TENSION', mx + 13, my + mh + 14, 11, '#fff');
          /* progress ring around bobber */
          c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 7; c.beginPath(); c.arc(FBX[i], 300, 34, 0, 6.3); c.stroke();
          c.strokeStyle = COL.gold; c.beginPath(); c.arc(FBX[i], 300, 34, -Math.PI / 2, -Math.PI / 2 + p.pr * 6.283); c.stroke();
          if (isMe) D.otext(c, Math.abs(p.tn - z.c) < z.w ? 'Reeling!' : p.tn > z.c ? 'Ease off!' : 'TAP!', FBX[i], 360, 22, Math.abs(p.tn - z.c) < z.w ? COL.good : COL.gold);
        }
        D.otext(c, p.n + ' fish', i ? W - 88 : 88, 268, 16, 'rgba(255,255,255,.85)');
      }
      drawFx(c, S, D);
      c.restore();
      D.hud(c, info, (S.p[0].tot / 10).toFixed(1), (S.p[1].tot / 10).toFixed(1), 'total kg caught');
    },
    bot: function (S, me, rnd) {
      var i = me === 'host' ? 0 : 1, p = S.p[i], inp = P.emptyIn(), ev = [];
      if (p.ph === 'bite' && p.t > 0.2 + rnd() * 0.12) ev.push({ t: 'a' });
      if (p.ph === 'reel') { var z = fishZone(p); if (p.tn < z.c - z.w * 0.35 && rnd() < 0.8) ev.push({ t: 'a' }); }
      return { in: inp, ev: ev };
    }
  });

  /* =====================================================================
     6. PIRATE POP
     ===================================================================== */
  var PP = { CX: 400, TURN: 4.5 };
  function ppSlot(k) { return { x: PP.CX + (k % 5 - 2) * 50, y: 300 + Math.floor(k / 5) * 82 }; }
  function ppFree(S) { var a = []; for (var k = 0; k < 10; k++) if (S.sl[k] < 0) a.push(k); return a; }
  function ppNear(S, from) {
    var best = -1, bd = 99;
    for (var k = 0; k < 10; k++) if (S.sl[k] < 0) { var d = Math.abs(k - from); if (d < bd) { bd = d; best = k; } }
    return best < 0 ? 0 : best;
  }
  function ppInsert(S, k, i) {
    S.sl[k] = i; S.last = k; var s = ppSlot(k);
    if (k === S.bomb) {
      S.ph = 'pop'; S.t = 0; S.lo = i; S.wins[1 - i]++; S.sh = 0.9;
      burst(S, PP.CX, 200, COL.gold, 22); burst(S, PP.CX, 200, COL[WHO[i]], 16); burst(S, s.x, s.y, '#ffffff', 10);
      pop(S, PP.CX, 150, 'YO HO HO!', COL.gold, 48);
    } else {
      pop(S, s.x, s.y - 34, 'Phew!', COL[WHO[i]], 22); burst(S, s.x, s.y, COL[WHO[i]], 6);
      S.turn = 1 - i; S.tt = 0; S.sel[1 - i] = ppNear(S, S.sel[1 - i]);
    }
  }
  function ppRound(S, rnd) {
    S.sl = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1]; S.bomb = Math.floor(rnd() * 10); S.first = 1 - S.first; S.turn = S.first;
    S.tt = 0; S.ph = 'play'; S.t = 0; S.lo = -1; S.last = -1; S.rd++; S.sel = [2, 7];
  }
  P.add({
    id: 'cannon-pop', name: 'Pirate Pop', icon: '🏴‍☠️', cat: 'Luck', luck: true,
    howto: 'Take turns stabbing a sword into one of the 10 barrel slots. One secret slot launches the pirate - whoever pops him loses the round. Best of 3!',
    controls: 'Pick slot: number keys 0-9, click a slot, or arrows + Space',
    duration: 45,
    init: function (rnd) {
      var f = rnd() < 0.5 ? 0 : 1;
      return { rd: 0, wins: [0, 0], first: f, turn: f, sl: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1], bomb: Math.floor(rnd() * 10), ph: 'play', t: 0, tt: 0, sel: [2, 7], pv: [0, 0], lo: -1, last: -1, score: [0, 0], fx: [], sh: 0 };
    },
    step: function (S, dt, inp, ev, rnd) {
      S.t += dt; tickFx(S, dt);
      if (S.ph === 'play') {
        S.tt += dt;
        for (var i = 0; i < 2; i++) {
          var k = inp[WHO[i]], mask = (k.left ? 1 : 0) | (k.right ? 2 : 0) | (k.up ? 4 : 0) | (k.down ? 8 : 0), edge = mask & ~S.pv[i];
          S.pv[i] = mask;
          if (i !== S.turn || S.ph !== 'play') continue;
          var sel = S.sel[i];
          if (edge & 1) sel = (sel + 9) % 10; if (edge & 2) sel = (sel + 1) % 10;
          if (edge & 4) sel = (sel + 5) % 10; if (edge & 8) sel = (sel + 5) % 10;
          S.sel[i] = sel;
          var pick = -1, evs = ev[WHO[i]];
          for (var e = 0; e < evs.length && pick < 0; e++) {
            var E = evs[e];
            if (E.t === 'key' && /^[0-9]$/.test(E.k)) pick = +E.k;
            else if (E.t === 'a') pick = S.sel[i];
            else if (E.t === 'tap') { for (var q = 0; q < 10; q++) { var sp = ppSlot(q); if (Math.hypot(E.x - sp.x, E.y - sp.y) < 26) pick = q; } }
            if (pick >= 0 && S.sl[pick] >= 0) pick = -1;
          }
          if (pick >= 0) { S.sel[i] = pick; ppInsert(S, pick, i); break; }
        }
        if (S.ph === 'play' && S.tt > PP.TURN) {
          var fr = ppFree(S), kk = fr[Math.floor(rnd() * fr.length)];
          pop(S, PP.CX, 130, 'Too slow - random slot!', COL.dim, 22);
          ppInsert(S, kk, S.turn);
        }
      } else if (S.ph === 'pop' && S.t > 2.2) {
        if (S.wins[0] >= 2 || S.wins[1] >= 2) { S.result = { winner: S.wins[0] > S.wins[1] ? 'host' : 'guest', text: S.wins[0] + ' - ' + S.wins[1] + ' rounds' }; S.score = S.wins.slice(); return; }
        ppRound(S, rnd);
      }
      S.score = S.wins.slice();
    },
    timeout: function (S) { var w = S.wins; return { winner: w[0] > w[1] ? 'host' : w[1] > w[0] ? 'guest' : 'tie', text: w[0] + ' - ' + w[1] + ' rounds' }; },
    draw: function (c, S, me, D, info) {
      var t = performance.now() / 1000, mi = me === 'host' ? 0 : 1;
      var sky = c.createLinearGradient(0, 0, 0, 200); sky.addColorStop(0, '#1b2a5c'); sky.addColorStop(1, '#f08a5d');
      c.fillStyle = sky; c.fillRect(0, 0, W, 200);
      c.fillStyle = '#1d4f7a'; c.fillRect(0, 170, W, 60);
      c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 2;
      for (var wy = 180; wy < 230; wy += 14) { c.beginPath(); for (var wx = 0; wx <= W; wx += 16) c.lineTo(wx, wy + Math.sin(wx * 0.05 + t * 2 + wy) * 3); c.stroke(); }
      c.save(); shake(c, S);
      /* deck */
      var dk = c.createLinearGradient(0, 220, 0, H); dk.addColorStop(0, '#8a5a32'); dk.addColorStop(1, '#4a2c16');
      c.fillStyle = dk; c.fillRect(-20, 220, W + 40, H);
      c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 2;
      for (var py = 250; py < H; py += 36) { c.beginPath(); c.moveTo(0, py); c.lineTo(W, py); c.stroke(); }
      c.fillStyle = '#5a3418'; c.fillRect(0, 214, W, 12);
      for (var rx = 10; rx < W; rx += 60) c.fillRect(rx, 190, 8, 30);
      c.fillRect(0, 186, W, 8);
      /* pirate */
      var lift = 0, rot = 0;
      if (S.ph === 'pop') { var q = Math.min(1, S.t / 1.1); lift = Math.sin(q * 1.57) * 330 - (S.t > 1.1 ? (S.t - 1.1) * 0 : 0); rot = S.t * 9; }
      var hx = PP.CX, hy = 222 - lift + (S.ph === 'play' ? Math.sin(t * 3) * 3 : 0);
      c.save(); c.translate(hx, hy); c.rotate(rot);
      D.circle(c, 0, 0, 40, '#f2c29b', 0);
      c.fillStyle = '#d6263a'; c.beginPath(); c.arc(0, -6, 41, Math.PI * 1.05, Math.PI * 1.95); c.fill();
      c.fillStyle = '#fff'; for (var dd = -2; dd <= 2; dd++) { c.beginPath(); c.arc(dd * 14, -28 + Math.abs(dd) * 3, 3, 0, 6.3); c.fill(); }
      c.fillStyle = '#111'; c.beginPath(); c.arc(-14, -2, 8, 0, 6.3); c.fill(); c.fillRect(-40, -8, 80, 3);
      c.fillStyle = '#1a1033'; c.beginPath(); c.arc(14, -2, 4, 0, 6.3); c.fill();
      c.fillStyle = '#5a3418'; c.beginPath(); c.arc(0, 22, 22, 0.1, Math.PI - 0.1); c.fill();
      c.strokeStyle = '#1a1033'; c.lineWidth = 3; c.beginPath(); c.arc(0, 12, 10, 0.2, Math.PI - 0.2); c.stroke();
      c.restore();
      /* barrel */
      var bx0 = PP.CX - 145, by0 = 240, bw = 290, bh = 230;
      var bg = c.createLinearGradient(bx0, 0, bx0 + bw, 0); bg.addColorStop(0, '#5a3016'); bg.addColorStop(0.5, '#b0743c'); bg.addColorStop(1, '#5a3016');
      c.save(); c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 20; D.rrect(c, bx0, by0, bw, bh, 50, bg); c.restore();
      c.strokeStyle = 'rgba(40,20,5,.45)'; c.lineWidth = 2;
      for (var st = 1; st < 7; st++) { c.beginPath(); c.moveTo(bx0 + st * bw / 7, by0 + 6); c.lineTo(bx0 + st * bw / 7, by0 + bh - 6); c.stroke(); }
      [by0 + 22, by0 + bh - 26].forEach(function (yy) { D.rrect(c, bx0 - 4, yy, bw + 8, 12, 6, '#5b5f6b'); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(bx0, yy + 2, bw, 3); });
      /* slots */
      for (var k = 0; k < 10; k++) {
        var s = ppSlot(k), own = S.sl[k];
        c.fillStyle = '#1a0d04'; c.beginPath(); c.ellipse(s.x, s.y, 15, 11, 0, 0, 6.3); c.fill();
        D.text(c, k, s.x, s.y + 28, 15, 'rgba(255,240,200,.8)');
        if (own >= 0) {
          var boom = S.ph === 'pop' && k === S.last;
          c.save(); c.translate(s.x, s.y); c.rotate(own ? 0.5 : -0.5);
          c.fillStyle = '#c9ced8'; c.fillRect(-3, -6, 6, 8);
          c.fillStyle = COL.gold; c.fillRect(-12, -10, 24, 5);
          c.fillStyle = COL[WHO[own]]; c.shadowColor = COL[WHO[own]]; c.shadowBlur = boom ? 25 : 8; c.fillRect(-4, -32, 8, 22);
          D.circle(c, 0, -34, 5, COL.gold, 0); c.restore();
        }
      }
      if (S.ph === 'play') {
        var sl = ppSlot(S.sel[S.turn]), tc = COL[WHO[S.turn]];
        c.strokeStyle = tc; c.lineWidth = 4; c.shadowColor = tc; c.shadowBlur = 14;
        c.beginPath(); c.arc(sl.x, sl.y, 21 + Math.sin(t * 8) * 2, 0, 6.3); c.stroke(); c.shadowBlur = 0;
        var mine = S.turn === mi;
        D.rrect(c, 230, 92, 340, 54, 18, 'rgba(10,10,30,.6)');
        D.otext(c, mine ? 'YOUR TURN - pick a slot!' : info.names[WHO[S.turn]] + ' is choosing…', 400, 112, 22, mine ? COL[me] : '#fff');
        D.bar(c, 270, 132, 260, 8, 1 - S.tt / PP.TURN, S.tt > 3 ? COL.bad : COL.gold);
      } else {
        D.otext(c, (S.lo === mi ? 'You' : info.names[WHO[S.lo]]) + ' popped the pirate!', 400, 112, 26, COL[WHO[S.lo]]);
      }
      /* players */
      for (var pI = 0; pI < 2; pI++) {
        var x = pI ? 690 : 110, active = S.ph === 'play' && S.turn === pI;
        D.player(c, x, 330 + (active ? Math.sin(t * 6) * 4 : 0), active ? 36 : 30, WHO[pI], info.names[WHO[pI]], me === WHO[pI]);
        for (var wN = 0; wN < 2; wN++) D.circle(c, x - 16 + wN * 32, 400, 11, wN < S.wins[pI] ? COL.gold : 'rgba(255,255,255,.18)', wN < S.wins[pI] ? 12 : 0);
        if (S.ph === 'pop' && S.lo === pI) D.otext(c, '💥', x + 30, 290, 30);
      }
      drawFx(c, S, D);
      c.restore();
      D.hud(c, info, S.wins[0], S.wins[1], 'Round ' + (S.rd + 1) + ' · first to 2');
    },
    bot: function (S, me, rnd) {
      var i = me === 'host' ? 0 : 1, inp = P.emptyIn(), ev = [];
      if (S.ph === 'play' && S.turn === i && S.tt > 0.7 && rnd() < 0.15) {
        var fr = ppFree(S); if (fr.length) ev.push({ t: 'key', k: String(fr[Math.floor(rnd() * fr.length)]) });
      }
      return { in: inp, ev: ev };
    }
  });

  /* =====================================================================
     7. TREASURE DIG
     ===================================================================== */
  var TD = { N: 6, CS: 64, GX: 208, GY: 102 };
  var TVAL = [0, 3, 5, -2];
  function tdHeat(S, x, y) {
    var best = 99;
    for (var k = 0; k < 36; k++) if (S.d[k] < 0 && (S.c[k] === 1 || S.c[k] === 2)) best = Math.min(best, Math.max(Math.abs(k % 6 - x), Math.abs(Math.floor(k / 6) - y)));
    return best;
  }
  P.add({
    id: 'treasure-dig', name: 'Treasure Dig', icon: '🏝️', cat: 'Luck',
    howto: 'Move your shovel and dig - each tile takes 2 digs, and whoever finishes it gets what\'s inside! Gold = 3, gems = 5, crabs = -2 and pinch you. Your metal detector glows red when treasure is close. Most points when all treasure is found wins.',
    controls: 'Move: WASD / arrows · Dig: Space (or click a tile)',
    duration: 32,
    init: function (rnd) {
      var c = [], d = [], q = [], items = [1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 3], idx = [];
      for (var k = 0; k < 36; k++) { c.push(0); d.push(-1); q.push(0); idx.push(k); }
      for (var j = 35; j > 0; j--) { var r = Math.floor(rnd() * (j + 1)), tmp = idx[j]; idx[j] = idx[r]; idx[r] = tmp; }
      items.forEach(function (it, n) { c[idx[n]] = it; });
      return { c: c, d: d, q: q, cur: [{ x: 1, y: 5, cd: 0, st: 0, mv: -1 }, { x: 4, y: 5, cd: 0, st: 0, mv: -1 }], score: [0, 0], left: 9, fx: [], sh: 0, t: 0 };
    },
    step: function (S, dt, inp, ev, rnd) {
      S.t += dt; tickFx(S, dt);
      var dig = [-1, -1];
      for (var i = 0; i < 2; i++) {
        var cu = S.cur[i], k = inp[WHO[i]], evs = ev[WHO[i]];
        cu.cd = Math.max(0, Math.round((cu.cd - dt) * 1000) / 1000); cu.st = Math.max(0, Math.round((cu.st - dt) * 1000) / 1000);
        if (cu.st > 0) { cu.mv = -1; continue; }
        var dx = (k.right ? 1 : 0) - (k.left ? 1 : 0), dy = (k.down ? 1 : 0) - (k.up ? 1 : 0);
        if (dx || dy) {
          if (cu.mv < 0) { cu.x = clamp(cu.x + dx, 0, 5); cu.y = clamp(cu.y + dy, 0, 5); cu.mv = 0.22; }
          else { cu.mv = Math.round((cu.mv - dt) * 1000) / 1000; if (cu.mv <= 0) { cu.x = clamp(cu.x + dx, 0, 5); cu.y = clamp(cu.y + dy, 0, 5); cu.mv = 0.11; } }
        } else cu.mv = -1;
        var want = false;
        evs.forEach(function (e) {
          if (e.t === 'a') want = true;
          if (e.t === 'tap') {
            var gx = Math.floor((e.x - TD.GX) / TD.CS), gy = Math.floor((e.y - TD.GY) / TD.CS);
            if (gx >= 0 && gx < 6 && gy >= 0 && gy < 6) { cu.x = gx; cu.y = gy; want = true; }
          }
        });
        var cell = cu.y * 6 + cu.x;
        if (want && cu.cd <= 0 && S.d[cell] < 0) { dig[i] = cell; cu.cd = 0.3; }
      }
      if (dig[0] >= 0 && dig[0] === dig[1]) {
        var lose = rnd() < 0.5 ? 0 : 1;
        pop(S, TD.GX + (dig[0] % 6 + 0.5) * TD.CS, TD.GY + Math.floor(dig[0] / 6) * TD.CS, 'Too slow!', COL.dim, 18);
        dig[lose] = -1;
      }
      for (var p = 0; p < 2; p++) {
        if (dig[p] < 0) continue;
        var idx = dig[p], it = S.c[idx], x = TD.GX + (idx % 6 + 0.5) * TD.CS, y = TD.GY + (Math.floor(idx / 6) + 0.5) * TD.CS;
        if (!S.q[idx]) { S.q[idx] = 1; burst(S, x, y, '#e8c27a', 6); continue; }
        S.d[idx] = p; S.score[p] += TVAL[it];
        if (it === 1) { S.left--; pop(S, x, y - 20, '+3', COL.gold, 30); burst(S, x, y, COL.gold, 14); }
        else if (it === 2) { S.left--; pop(S, x, y - 20, '+5', '#7cf3ff', 36); burst(S, x, y, '#7cf3ff', 18); burst(S, x, y, COL[WHO[p]], 10); S.sh = 0.25; }
        else if (it === 3) { S.cur[p].st = 0.9; pop(S, x, y - 20, '-2 OUCH!', COL.bad, 28); burst(S, x, y, COL.bad, 10); S.sh = 0.35; }
        else burst(S, x, y, '#e8c27a', 8);
      }
      if (S.left <= 0) S.result = { winner: S.score[0] > S.score[1] ? 'host' : S.score[1] > S.score[0] ? 'guest' : 'tie', text: S.score[0] + ' - ' + S.score[1] + ' points' };
    },
    timeout: function (S) { return { winner: S.score[0] > S.score[1] ? 'host' : S.score[1] > S.score[0] ? 'guest' : 'tie', text: S.score[0] + ' - ' + S.score[1] + ' points' }; },
    draw: function (c, S, me, D, info) {
      var t = performance.now() / 1000;
      var sea = c.createLinearGradient(0, 0, 0, H); sea.addColorStop(0, '#1fb5d6'); sea.addColorStop(1, '#0b5c8c');
      c.fillStyle = sea; c.fillRect(0, 0, W, H);
      c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 2;
      for (var wy = 90; wy < H; wy += 30) { c.beginPath(); for (var wx = 0; wx <= W; wx += 16) c.lineTo(wx, wy + Math.sin(wx * 0.04 + t * 1.5 + wy) * 4); c.stroke(); }
      c.save(); shake(c, S);
      /* island */
      c.fillStyle = 'rgba(255,255,255,.5)'; D.rrect(c, TD.GX - 34 + Math.sin(t) * 2, TD.GY - 22, 6 * TD.CS + 68, 6 * TD.CS + 40, 60, 'rgba(255,255,255,.35)');
      D.rrect(c, TD.GX - 26, TD.GY - 16, 6 * TD.CS + 52, 6 * TD.CS + 28, 52, '#f4d58d');
      /* palms */
      [[150, 140], [650, 150]].forEach(function (pt, n) {
        c.strokeStyle = '#7a4f28'; c.lineWidth = 10; c.beginPath(); c.moveTo(pt[0], pt[1] + 90); c.quadraticCurveTo(pt[0] + (n ? -16 : 16), pt[1] + 40, pt[0], pt[1]); c.stroke();
        for (var l = 0; l < 5; l++) { var la = -2.6 + l * 0.55 + Math.sin(t * 1.5 + l) * 0.05; c.fillStyle = '#2f9e44'; c.beginPath(); c.ellipse(pt[0] + Math.cos(la) * 30, pt[1] + Math.sin(la) * 18, 34, 9, la, 0, 6.3); c.fill(); }
      });
      /* tiles */
      for (var k = 0; k < 36; k++) {
        var gx = TD.GX + (k % 6) * TD.CS, gy = TD.GY + Math.floor(k / 6) * TD.CS, dg = S.d[k];
        if (dg < 0) {
          D.rrect(c, gx + 2, gy + 2, TD.CS - 4, TD.CS - 4, 10, ((k * 7) % 3) ? '#eccb7e' : '#e6c272');
          c.fillStyle = 'rgba(150,100,40,.25)';
          for (var sp = 0; sp < 4; sp++) { c.beginPath(); c.arc(gx + 12 + ((k * 13 + sp * 17) % 40), gy + 12 + ((k * 29 + sp * 11) % 40), 2, 0, 6.3); c.fill(); }
          if (S.q[k]) { c.fillStyle = '#c99a55'; c.beginPath(); c.ellipse(gx + TD.CS / 2, gy + TD.CS / 2, 20, 14, 0, 0, 6.3); c.fill(); c.fillStyle = '#a97a3c'; c.beginPath(); c.ellipse(gx + TD.CS / 2, gy + TD.CS / 2 + 2, 13, 8, 0, 0, 6.3); c.fill(); }
        } else {
          D.rrect(c, gx + 2, gy + 2, TD.CS - 4, TD.CS - 4, 10, '#8c6233');
          D.rrect(c, gx + 8, gy + 8, TD.CS - 16, TD.CS - 16, 14, '#5e3d1b');
          var it = S.c[k];
          if (it) D.text(c, it === 1 ? '🪙' : it === 2 ? '💎' : '🦀', gx + TD.CS / 2, gy + TD.CS / 2 + 2, 30);
          c.fillStyle = COL[WHO[dg]]; c.fillRect(gx + 14, gy + TD.CS - 9, TD.CS - 28, 4);
        }
      }
      /* cursors */
      var heatCol = ['#ff3b3b', '#ff3b3b', '#ffa53b', '#58a6ff'];
      for (var i = 0; i < 2; i++) {
        var cu = S.cur[i], who = WHO[i], cx = TD.GX + cu.x * TD.CS, cy = TD.GY + cu.y * TD.CS, inset = i ? 9 : 3;
        var ht = tdHeat(S, cu.x, cu.y), hc = heatCol[Math.min(3, ht)];
        c.save(); c.shadowColor = hc; c.shadowBlur = ht <= 1 ? 26 + Math.sin(t * 10) * 8 : ht === 2 ? 16 : 8;
        c.strokeStyle = hc; c.lineWidth = 4; c.globalAlpha = 0.8;
        D.rrect(c, cx + inset - 3, cy + inset - 3, TD.CS - inset * 2 + 6, TD.CS - inset * 2 + 6, 12, null, null); c.stroke(); c.restore();
        D.rrect(c, cx + inset, cy + inset, TD.CS - inset * 2, TD.CS - inset * 2, 10, null, null);
        c.strokeStyle = COL[who]; c.lineWidth = 4; c.stroke();
        D.player(c, cx + (i ? TD.CS - 10 : 10), cy + 10, 10, who, null, me === who);
        if (cu.st > 0) D.text(c, '🦀', cx + TD.CS / 2, cy - 6, 22);
        /* side panel */
        var px = i ? 700 : 100;
        D.player(c, px, 300, 32, who, me === who ? 'YOU' : info.names[who], me === who);
        D.otext(c, S.score[i], px, 360, 40, COL[who]);
        D.rrect(c, px - 60, 390, 120, 40, 20, 'rgba(0,0,0,.35)');
        D.otext(c, ht <= 1 ? '🔥 HOT' : ht === 2 ? '♨ WARM' : '❄ COLD', px, 410, 18, hc);
      }
      drawFx(c, S, D);
      c.restore();
      D.hud(c, info, S.score[0], S.score[1], 'Treasure left: ' + S.left);
    },
    bot: function (S, me, rnd) {
      var i = me === 'host' ? 0 : 1, inp = P.emptyIn(), ev = [], cu = S.cur[i];
      if (cu.st > 0) return { in: inp, ev: ev };
      var best = -1, bs = 1e9;
      for (var k = 0; k < 36; k++) {
        if (S.d[k] >= 0) continue;
        var x = k % 6, y = Math.floor(k / 6), h = tdHeat(S, x, y), d = Math.abs(x - cu.x) + Math.abs(y - cu.y);
        var sc = d + (h <= 1 ? 0 : h === 2 ? 4 : 9) - (S.q[k] ? 1.5 : 0) + ((k * 7 + i * 3) % 5) * 0.1;
        if (sc < bs) { bs = sc; best = k; }
      }
      if (best < 0) return { in: inp, ev: ev };
      var tx = best % 6, ty = Math.floor(best / 6);
      if (tx > cu.x) inp.right = 1; else if (tx < cu.x) inp.left = 1;
      else if (ty > cu.y) inp.down = 1; else if (ty < cu.y) inp.up = 1;
      else if (cu.cd <= 0 && rnd() < 0.5) ev.push({ t: 'a' });
      return { in: inp, ev: ev };
    }
  });
})();
