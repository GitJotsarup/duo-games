/* Party Rush minigames: ARENA group (real-time action).
   Bumper Balls, Hot Potato, Snowball Showdown, Crumbling Floor, Chomp Chase, Light Cycles. */
(function () {
  var P = window.PARTY, W = 800, H = 500, WHO = ['host', 'guest'];

  /* ---------------- shared helpers ---------------- */
  function r1(v) { return Math.round(v * 10) / 10; }
  function r2(v) { return Math.round(v * 100) / 100; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function hyp(x, y) { return Math.sqrt(x * x + y * y); }
  function axes(k) { var vx = (k.right ? 1 : 0) - (k.left ? 1 : 0), vy = (k.down ? 1 : 0) - (k.up ? 1 : 0), l = hyp(vx, vy); return l ? [vx / l, vy / l] : [0, 0]; }
  function pressed(e, t) { for (var i = 0; i < e.length; i++) if (e[i].t === t) return e[i]; return null; }
  function addFx(S, k, x, y, d, o) { var f = { k: k, x: r1(x), y: r1(y), t: d, d: d }; if (o) for (var q in o) f[q] = o[q]; S.fx.push(f); if (S.fx.length > 18) S.fx.shift(); }
  function tickFx(S, dt) {
    var out = [];
    for (var i = 0; i < S.fx.length; i++) { var f = S.fx[i]; f.t = r2(f.t - dt); if (f.t > 0) out.push(f); }
    S.fx = out; if (S.shk > 0) S.shk = r2(Math.max(0, S.shk - dt));
  }
  function aim(inp, dx, dy) {
    var l = hyp(dx, dy); if (l < 3) return inp; dx /= l; dy /= l;
    if (dx > 0.38) inp.right = 1; if (dx < -0.38) inp.left = 1; if (dy > 0.38) inp.down = 1; if (dy < -0.38) inp.up = 1; return inp;
  }
  function now() { return performance.now() / 1000; }
  function shake(c, S) { if (S.shk > 0) { var t = now(), a = Math.min(1, S.shk) * 16; c.translate(Math.sin(t * 97) * a, Math.cos(t * 83) * a); } }
  function hash(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function colOf(i) { return i ? '#58c7ff' : '#ff5c8a'; }
  function drawFx(c, S, D) {
    S.fx.forEach(function (f, n) {
      var p = 1 - f.t / f.d, col = f.c || '#fff';
      if (f.k === 'txt') { c.globalAlpha = Math.min(1, f.t / f.d * 2.5); D.otext(c, f.s, f.x, f.y - p * 46, f.z || 26, col); c.globalAlpha = 1; }
      else if (f.k === 'burst' || f.k === 'boom') {
        var big = f.k === 'boom', nP = big ? 24 : 12, dist = (big ? 160 : 62) * (1 - Math.pow(1 - p, 2.2));
        if (big) {
          c.globalAlpha = Math.max(0, 1 - p * 1.5);
          var g = c.createRadialGradient(f.x, f.y, 0, f.x, f.y, 40 + 150 * p);
          g.addColorStop(0, '#fff7c2'); g.addColorStop(0.35, '#ffb02e'); g.addColorStop(1, 'rgba(255,60,20,0)');
          c.fillStyle = g; c.beginPath(); c.arc(f.x, f.y, 40 + 150 * p, 0, 7); c.fill(); c.globalAlpha = 1;
        }
        for (var i = 0; i < nP; i++) {
          var a = i / nP * 6.283 + hash(i + n * 7 + f.x) * 0.6, dd = dist * (0.6 + hash(i * 3 + f.y) * 0.6);
          c.globalAlpha = Math.max(0, 1 - p); c.fillStyle = i % 3 === 0 ? '#fff' : col;
          c.beginPath(); c.arc(f.x + Math.cos(a) * dd, f.y + Math.sin(a) * dd + (big ? 0 : p * p * 30), (big ? 8 : 5) * (1 - p * 0.7), 0, 7); c.fill();
        }
        c.globalAlpha = 1;
      } else if (f.k === 'ring') {
        c.globalAlpha = Math.max(0, 1 - p); c.strokeStyle = col; c.lineWidth = 7 * (1 - p) + 1;
        c.beginPath(); c.arc(f.x, f.y, 10 + (f.r || 60) * p, 0, 7); c.stroke(); c.globalAlpha = 1;
      }
    });
  }
  function banner(c, D, big, small, col) {
    c.fillStyle = 'rgba(8,6,24,.5)'; c.fillRect(0, H / 2 - 60, W, 120);
    D.otext(c, big, W / 2, H / 2 - (small ? 12 : 0), 58, col || D.COL.gold);
    if (small) D.otext(c, small, W / 2, H / 2 + 36, 22, '#fff');
  }
  function pips(c, D, x, y, n, of, col) { for (var k = 0; k < of; k++) D.circle(c, x + k * 26, y, 9, k < n ? col : 'rgba(255,255,255,.22)', k < n ? 12 : 0); }
  function winPips(c, D, S, of) { pips(c, D, 40, 76, S.wins[0], of, D.COL.host); pips(c, D, W - 40 - (of - 1) * 26, 76, S.wins[1], of, D.COL.guest); }
  /* round flow for best-of-3 games */
  function roundWin(S, w) { if (w >= 0) S.wins[w]++; S.score = S.wins.slice(); S.lw = w; S.st = 'gap'; S.t = 0; }
  function winsResult(S) { return { winner: S.wins[0] > S.wins[1] ? 'host' : S.wins[1] > S.wins[0] ? 'guest' : 'tie', text: S.wins[0] + ' - ' + S.wins[1] + ' rounds' }; }
  function roundGap(S, maxR) {
    if (S.t < 1.5) return false;
    if (S.wins[0] >= 2 || S.wins[1] >= 2 || S.rd >= maxR) { S.result = winsResult(S); return false; }
    S.rd++; return true;
  }
  function roundBanner(c, D, S, info, tieTxt, winTxt) {
    if (S.st === 'ready') banner(c, D, S.t < 0.8 ? 'Round ' + S.rd : 'GO!', S.t < 0.8 ? 'First to 2 wins' : '', S.t < 0.8 ? D.COL.gold : D.COL.good);
    else if (S.st === 'gap') {
      if (S.lw < 0) banner(c, D, tieTxt, 'No point this round', '#fff');
      else banner(c, D, info.names[WHO[S.lw]] + ' scores!', winTxt, colOf(S.lw));
    }
  }
  var AX0 = 40, AX1 = 760, AY0 = 100, AY1 = 480, PR = 22;
  function separate(A, B, r) {
    var dx = B.x - A.x, dy = B.y - A.y, d = hyp(dx, dy);
    if (d < r && d > 0.001) { var o = (r - d) / 2, nx = dx / d, ny = dy / d; A.x -= nx * o; A.y -= ny * o; B.x += nx * o; B.y += ny * o; return true; }
    return false;
  }
  function arenaClamp(p) { p.x = clamp(p.x, AX0 + PR, AX1 - PR); p.y = clamp(p.y, AY0 + PR, AY1 - PR); }

  /* =====================================================================
     1. BUMPER BALLS
     ===================================================================== */
  var BX = 400, BY = 296, BR = 186, BRM = 96, BPR = 24;
  function bbReset(S) {
    S.p = [{ x: BX - 105, y: BY, vx: 0, vy: 0, cd: 0, dz: 0, f: 0 }, { x: BX + 105, y: BY, vx: 0, vy: 0, cd: 0, dz: 0, f: 0 }];
    S.R = BR; S.st = 'ready'; S.t = 0; S.rt = 0;
  }
  P.add({
    id: 'bumper-balls', name: 'Bumper Balls', icon: '🔴', cat: 'Action',
    howto: 'Sumo on a platform floating over lava! Ram your rival to knock them off the edge, and the platform shrinks as the round goes on. First to 2 knock-outs wins.',
    controls: 'Move: WASD / arrows · Dash: Space',
    duration: 45,
    init: function (rnd) { var S = { wins: [0, 0], score: [0, 0], rd: 1, fx: [], shk: 0, lw: -1 }; bbReset(S); return S; },
    step: function (S, dt, inp, ev, rnd) {
      S.t += dt; tickFx(S, dt);
      if (S.st === 'ready') { if (S.t >= 1.1) { S.st = 'play'; S.t = 0; } return; }
      if (S.st === 'gap') { if (roundGap(S, 5)) { bbReset(S); return; } }
      if (S.st === 'play') { S.rt += dt; S.R = r1(Math.max(BRM, BR - Math.max(0, S.rt - 1.5) * 8)); }
      var ps = S.p;
      WHO.forEach(function (who, i) {
        var p = ps[i]; p.cd = Math.max(0, p.cd - dt); p.dz = Math.max(0, p.dz - dt);
        if (p.f > 0) p.f += dt;
        else if (S.st === 'play') {
          var a = axes(inp[who]);
          p.vx += a[0] * 820 * dt; p.vy += a[1] * 820 * dt;
          if (pressed(ev[who], 'a') && p.cd <= 0) {
            var dx = a[0], dy = a[1];
            if (!dx && !dy) { var o = ps[1 - i]; dx = o.x - p.x; dy = o.y - p.y; var l = hyp(dx, dy) || 1; dx /= l; dy /= l; }
            p.vx += dx * 400; p.vy += dy * 400; p.cd = 1.5; p.dz = 0.25;
            addFx(S, 'ring', p.x, p.y, 0.35, { c: colOf(i), r: 40 });
          }
        }
        var damp = Math.exp(-1.5 * dt); p.vx *= damp; p.vy *= damp;
        var sp = hyp(p.vx, p.vy), cap = p.dz > 0 ? 640 : 330;
        if (sp > cap) { p.vx *= cap / sp; p.vy *= cap / sp; }
        p.x += p.vx * dt; p.y += p.vy * dt;
      });
      var A = ps[0], B = ps[1];
      if (!A.f && !B.f) {
        var dx = B.x - A.x, dy = B.y - A.y, d = hyp(dx, dy);
        if (d < BPR * 2 && d > 0.001) {
          var nx = dx / d, ny = dy / d, rel = (A.vx - B.vx) * nx + (A.vy - B.vy) * ny;
          separate(A, B, BPR * 2);
          if (rel > 0) {
            var j = rel + 70;
            A.vx -= nx * j; A.vy -= ny * j; B.vx += nx * j; B.vy += ny * j;
            addFx(S, 'burst', (A.x + B.x) / 2, (A.y + B.y) / 2, 0.45, { c: '#ffd166' });
            if (rel > 260) { addFx(S, 'txt', (A.x + B.x) / 2, (A.y + B.y) / 2 - 30, 0.7, { s: 'BONK!', c: '#ffd166', z: 30 }); S.shk = Math.max(S.shk, 0.25); }
          }
        }
      }
      if (S.st === 'play') {
        var fell = [0, 0];
        ps.forEach(function (p, i) {
          if (!p.f && hyp(p.x - BX, p.y - BY) > S.R) { p.f = 0.01; fell[i] = 1; addFx(S, 'burst', p.x, p.y, 0.8, { c: '#ff8a1f' }); addFx(S, 'txt', p.x, p.y - 34, 1, { s: 'AAAH!', c: '#ffd166' }); }
        });
        if (fell[0] || fell[1]) { S.shk = 0.45; roundWin(S, fell[0] && fell[1] ? -1 : fell[0] ? 1 : 0); }
      }
      ps.forEach(function (p) { p.x = r1(p.x); p.y = r1(p.y); p.vx = r1(p.vx); p.vy = r1(p.vy); p.cd = r2(p.cd); p.dz = r2(p.dz); p.f = r2(p.f); });
    },
    timeout: winsResult,
    draw: function (c, S, me, D, info) {
      var t = now(), k;
      var g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a0a12'); g.addColorStop(0.45, '#6b1608'); g.addColorStop(1, '#c2410c');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      for (k = 0; k < 7; k++) {
        c.fillStyle = 'rgba(255,' + (80 + k * 20) + ',30,' + (0.08 + k * 0.03) + ')'; c.beginPath(); c.moveTo(0, H);
        for (var x = 0; x <= W; x += 20) c.lineTo(x, 110 + k * 55 + Math.sin(x / 70 + t * (1 + k * 0.2) + k) * 10);
        c.lineTo(W, H); c.fill();
      }
      for (k = 0; k < 14; k++) { var ph = (t * 0.4 + hash(k)) % 1; c.globalAlpha = Math.sin(ph * Math.PI) * 0.8; D.circle(c, hash(k + 9) * W, 130 + hash(k + 3) * 350, 4 + ph * 10, '#ffb347', 14); }
      c.globalAlpha = 1;
      c.save(); shake(c, S);
      c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(BX + 12, BY + 36, S.R + 8, S.R * 0.95, 0, 0, 7); c.fill();
      c.fillStyle = '#2f3358'; c.beginPath(); c.arc(BX, BY + 16, S.R, 0, 7); c.fill();
      var pg = c.createRadialGradient(BX - 50, BY - 60, 20, BX, BY, S.R); pg.addColorStop(0, '#b6c1ff'); pg.addColorStop(1, '#5560a8');
      c.fillStyle = pg; c.beginPath(); c.arc(BX, BY, S.R, 0, 7); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.16)'; c.lineWidth = 3; for (k = 1; k < 4; k++) { c.beginPath(); c.arc(BX, BY, S.R * k / 4, 0, 7); c.stroke(); }
      c.lineWidth = 8; c.setLineDash([18, 14]); c.lineDashOffset = -t * 30; c.strokeStyle = S.R < 140 ? '#ff5a6a' : '#ffd166';
      c.beginPath(); c.arc(BX, BY, S.R - 4, 0, 7); c.stroke(); c.setLineDash([]);
      if (S.R < BR) { c.strokeStyle = 'rgba(255,160,80,.35)'; c.lineWidth = 2; c.beginPath(); c.arc(BX, BY, BR, 0, 7); c.stroke(); }
      function drawP(i) {
        var p = S.p[i], who = WHO[i], s = p.f ? Math.max(0.05, 1 - p.f / 1.1) : 1, sp = hyp(p.vx, p.vy);
        if (p.f) c.globalAlpha = s;
        if (!p.f && sp > 230) for (var q = 3; q >= 1; q--) { c.globalAlpha = 0.14 * (4 - q); D.circle(c, p.x - p.vx * 0.025 * q, p.y - p.vy * 0.025 * q, BPR * (1 - q * 0.08), colOf(i)); }
        c.globalAlpha = p.f ? s : 1;
        D.player(c, p.x, p.y, BPR * s, who, p.f ? '' : info.names[who], me === who);
        if (!p.f && me === who && p.cd > 0) { c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 4; c.beginPath(); c.arc(p.x, p.y, BPR + 10, -1.57, -1.57 + 6.283 * (1 - p.cd / 1.5)); c.stroke(); }
        c.globalAlpha = 1;
      }
      [0, 1].forEach(function (i) { if (S.p[i].f) drawP(i); });
      [0, 1].forEach(function (i) { if (!S.p[i].f) drawP(i); });
      drawFx(c, S, D);
      c.restore();
      if (S.st === 'play' && S.rt > 1.5 && S.R > BRM) D.otext(c, 'Platform shrinking!', W / 2, H - 22, 18, '#ffd166');
      D.hud(c, info, S.wins[0], S.wins[1], 'Round ' + S.rd + ' · first to 2 KOs');
      winPips(c, D, S, 2);
      roundBanner(c, D, S, info, 'Double KO!', 'Into the lava!');
    },
    bot: function (S, me, rnd) {
      var inp = P.emptyIn(), i = me === 'host' ? 0 : 1, p = S.p[i], o = S.p[1 - i], ev = [];
      if (S.st !== 'play' || p.f) return { in: inp, ev: ev };
      var R = S.R, px = p.x + p.vx * 0.32, py = p.y + p.vy * 0.32;
      if (hyp(px - BX, py - BY) > R * 0.72 || o.f) { aim(inp, BX - px, BY - py); return { in: inp, ev: ev }; }
      var ox = o.x - BX, oy = o.y - BY, ol = hyp(ox, oy) || 1, myd = hyp(p.x - BX, p.y - BY), dx, dy;
      if (myd > ol + 8) { dx = o.x - ox / ol * 40 - p.x; dy = o.y - oy / ol * 40 - p.y; }
      else { dx = o.x + ox / ol * 20 - p.x; dy = o.y + oy / ol * 20 - p.y; }
      dx += (rnd() - 0.5) * 40; dy += (rnd() - 0.5) * 40;
      aim(inp, dx, dy);
      var d = hyp(o.x - p.x, o.y - p.y);
      if (p.cd <= 0 && d < 130 && myd < ol + 4 && myd < R * 0.55 && rnd() < 0.2) ev.push({ t: 'a' });
      return { in: inp, ev: ev };
    }
  });

  /* =====================================================================
     2. HOT POTATO
     ===================================================================== */
  function hpReset(S, rnd) {
    S.p = [{ x: 200, y: 290, cd: 0, dz: 0 }, { x: 600, y: 290, cd: 0, dz: 0 }];
    S.b = rnd() < 0.5 ? 0 : 1; S.fz = r2(S.rd >= 3 ? 6 + rnd() * 3 : 8 + rnd() * 6); S.fuse = S.fz; S.pc = 1; S.st = 'ready'; S.t = 0;
  }
  P.add({
    id: 'hot-potato', name: 'Hot Potato', icon: '💣', cat: 'Action',
    howto: 'A lit bomb is stuck to one player. Touch your rival to pass it on before the hidden fuse runs out. Whoever is holding it when it blows loses the round. Best of 3.',
    controls: 'Move: WASD / arrows · Dash: Space',
    duration: 45,
    init: function (rnd) { var S = { wins: [0, 0], score: [0, 0], rd: 1, fx: [], shk: 0, lw: -1, bx: 0, by: 0 }; hpReset(S, rnd); return S; },
    step: function (S, dt, inp, ev, rnd) {
      S.t += dt; tickFx(S, dt);
      if (S.st === 'ready') { if (S.t >= 1) { S.st = 'play'; S.t = 0; } return; }
      if (S.st === 'gap') { if (roundGap(S, 3)) hpReset(S, rnd); return; }
      var ps = S.p;
      WHO.forEach(function (who, i) {
        var p = ps[i], a = axes(inp[who]);
        p.cd = r2(Math.max(0, p.cd - dt)); p.dz = r2(Math.max(0, p.dz - dt));
        if (pressed(ev[who], 'a') && p.cd <= 0 && (a[0] || a[1])) { p.cd = 2; p.dz = 0.2; addFx(S, 'ring', p.x, p.y, 0.3, { c: colOf(i), r: 36 }); }
        var sp = (i === S.b ? 278 : 250) * (p.dz > 0 ? 2.3 : 1);
        p.x += a[0] * sp * dt; p.y += a[1] * sp * dt; arenaClamp(p);
      });
      separate(ps[0], ps[1], PR * 2);
      S.pc = r2(Math.max(0, S.pc - dt)); S.fuse = r2(S.fuse - dt);
      var d = hyp(ps[0].x - ps[1].x, ps[0].y - ps[1].y);
      if (S.pc <= 0 && d < PR * 2 + 8) {
        S.b = 1 - S.b; S.pc = 0.9;
        var h = ps[S.b]; addFx(S, 'txt', h.x, h.y - 50, 0.7, { s: 'PASS!', c: '#ffd166' }); addFx(S, 'burst', (ps[0].x + ps[1].x) / 2, (ps[0].y + ps[1].y) / 2, 0.4, { c: '#ffb02e' });
        S.shk = Math.max(S.shk, 0.12);
      }
      if (S.fuse <= 0) {
        var hb = ps[S.b]; S.bx = hb.x; S.by = hb.y;
        addFx(S, 'boom', hb.x, hb.y, 1.1, { c: '#ff8a1f' }); addFx(S, 'txt', hb.x, hb.y - 40, 1.2, { s: 'KABOOM!', c: '#ffd166', z: 40 });
        S.shk = 0.7; roundWin(S, 1 - S.b);
      }
      ps.forEach(function (p) { p.x = r1(p.x); p.y = r1(p.y); });
    },
    timeout: winsResult,
    draw: function (c, S, me, D, info) {
      var t = now(), x, y;
      D.bg(c, '#3a1d0e', '#160904', false);
      c.save(); shake(c, S);
      D.rrect(c, AX0 - 8, AY0 - 8, AX1 - AX0 + 16, AY1 - AY0 + 16, 22, '#5b2d12');
      c.save(); c.beginPath(); if (c.roundRect) c.roundRect(AX0, AY0, AX1 - AX0, AY1 - AY0, 16); else c.rect(AX0, AY0, AX1 - AX0, AY1 - AY0); c.clip();
      for (x = 0; x < 18; x++) for (y = 0; y < 10; y++) { c.fillStyle = (x + y) % 2 ? '#f4c27a' : '#e8a95b'; c.fillRect(AX0 + x * 40, AY0 + y * 38, 40, 38); }
      c.restore();
      var danger = S.st === 'play' && S.fuse < 3;
      if (danger) { c.fillStyle = 'rgba(255,40,40,' + (0.08 + 0.08 * Math.sin(t * 18)) + ')'; c.fillRect(0, 0, W, H); }
      S.p.forEach(function (p, i) {
        var who = WHO[i], hold = S.b === i && S.st !== 'gap';
        c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(p.x, p.y + 20, 22, 8, 0, 0, 7); c.fill();
        if (S.st === 'gap' && S.lw !== i) return;
        if (hold) { c.strokeStyle = 'rgba(255,70,40,' + (0.5 + 0.4 * Math.sin(t * 10)) + ')'; c.lineWidth = 5; c.beginPath(); c.arc(p.x, p.y, PR + 12, 0, 7); c.stroke(); }
        if (!hold && S.pc > 0 && S.st === 'play') { c.strokeStyle = 'rgba(255,255,255,.6)'; c.setLineDash([6, 6]); c.lineWidth = 3; c.beginPath(); c.arc(p.x, p.y, PR + 10, 0, 7); c.stroke(); c.setLineDash([]); }
        if (p.dz > 0) { c.globalAlpha = 0.3; D.circle(c, p.x, p.y, PR + 6, colOf(i)); c.globalAlpha = 1; }
        D.player(c, p.x, p.y, PR, who, info.names[who], me === who);
        if (hold) {
          var wob = S.fuse < 3 ? Math.sin(t * 40) * 3 : 0, bx = p.x + 16 + wob, by = p.y - 30;
          var len = 8 + 30 * clamp(S.fuse / 14, 0, 1);
          c.strokeStyle = '#c9a26b'; c.lineWidth = 4; c.beginPath(); c.moveTo(bx + 6, by - 12);
          var ex = bx + 6 + len * 0.6, ey = by - 12 - len * 0.8; c.quadraticCurveTo(bx + 6 + len * 0.1, by - 12 - len * 0.6, ex, ey); c.stroke();
          D.circle(c, bx, by, 16, '#2b2b3a', danger ? 20 : 6);
          c.fillStyle = '#555'; c.fillRect(bx + 2, by - 17, 8, 7);
          for (var k = 0; k < 7; k++) {
            var a = t * 9 + k * 0.9, rr = 5 + 9 * hash(k + Math.floor(t * 20));
            c.strokeStyle = k % 2 ? '#ffd166' : '#ff7a1a'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex + Math.cos(a) * rr, ey + Math.sin(a) * rr); c.stroke();
          }
          D.circle(c, ex, ey, 4, '#fff6b0', 14);
          if (me === who) D.otext(c, 'PASS IT!', p.x, p.y + 42, 16, '#ffd166');
        }
      });
      drawFx(c, S, D);
      c.restore();
      D.hud(c, info, S.wins[0], S.wins[1], S.rd >= 3 ? 'Deciding round · SHORT FUSE!' : 'Round ' + S.rd + ' · touch to pass the bomb');
      winPips(c, D, S, 2);
      if (S.st === 'gap') { if (S.lw >= 0) banner(c, D, info.names[WHO[S.lw]] + ' survives!', info.names[WHO[1 - S.lw]] + ' got blown up', colOf(S.lw)); }
      else roundBanner(c, D, S, info, '', '');
    },
    bot: function (S, me, rnd) {
      var inp = P.emptyIn(), i = me === 'host' ? 0 : 1, p = S.p[i], o = S.p[1 - i], ev = [];
      if (S.st !== 'play') return { in: inp, ev: ev };
      var dx = o.x - p.x, dy = o.y - p.y, d = hyp(dx, dy) || 1;
      if (S.b === i) {
        aim(inp, dx + (rnd() - 0.5) * 30, dy + (rnd() - 0.5) * 30);
        if (p.cd <= 0 && d < 160 && S.pc < 0.15 && rnd() < 0.3) ev.push({ t: 'a' });
      } else {
        var fx = -dx / d, fy = -dy / d, m = 130;
        if (p.x - AX0 < m) fx += (m - (p.x - AX0)) / m * 1.8; if (AX1 - p.x < m) fx -= (m - (AX1 - p.x)) / m * 1.8;
        if (p.y - AY0 < m) fy += (m - (p.y - AY0)) / m * 1.8; if (AY1 - p.y < m) fy -= (m - (AY1 - p.y)) / m * 1.8;
        fx += (400 - p.x) / 900; fy += (290 - p.y) / 900;
        aim(inp, fx * 100 + (rnd() - 0.5) * 30, fy * 100 + (rnd() - 0.5) * 30);
        if (p.cd <= 0 && d < 90 && S.pc <= 0 && rnd() < 0.4) ev.push({ t: 'a' });
      }
      return { in: inp, ev: ev };
    }
  });

  /* =====================================================================
     3. SNOWBALL SHOWDOWN
     ===================================================================== */
  var SWALLS = [[385, 215, 30, 150, 6], [230, 140, 30, 70, 4], [540, 140, 30, 70, 4], [230, 370, 30, 70, 4], [540, 370, 30, 70, 4]];
  function inWall(S, x, y, m) {
    for (var k = 0; k < S.w.length; k++) { var w = S.w[k]; if (w.hp > 0 && x > w.x - m && x < w.x + w.w + m && y > w.y - m && y < w.y + w.h + m) return w; }
    return null;
  }
  function clearLine(S, x1, y1, x2, y2, m) {
    var d = hyp(x2 - x1, y2 - y1), n = Math.ceil(d / 12);
    for (var k = 1; k < n; k++) { var f = k / n; if (inWall(S, x1 + (x2 - x1) * f, y1 + (y2 - y1) * f, m)) return false; }
    return true;
  }
  function slideAim(S, inp, p, dx, dy) {
    var l = hyp(dx, dy); if (l < 3) return inp; dx /= l; dy /= l;
    var opts = [];
    for (var k = 0; k < 8; k++) { var a = k * Math.PI / 4, ux = Math.round(Math.cos(a)), uy = Math.round(Math.sin(a)), n = hyp(ux, uy); opts.push([ux, uy, (ux * dx + uy * dy) / n]); }
    opts.sort(function (a, b) { return b[2] - a[2]; });
    for (k = 0; k < 8; k++) {
      var o = opts[k]; if (o[2] < -0.2) break;
      var n2 = hyp(o[0], o[1]), tx = p.x + o[0] / n2 * 10, ty = p.y + o[1] / n2 * 10;
      if (tx < AX0 + PR || tx > AX1 - PR || ty < AY0 + PR || ty > AY1 - PR || inWall(S, tx, ty, PR - 4)) continue;
      if (o[0] > 0) inp.right = 1; if (o[0] < 0) inp.left = 1; if (o[1] > 0) inp.down = 1; if (o[1] < 0) inp.up = 1;
      return inp;
    }
    return aim(inp, dx, dy);
  }
  P.add({
    id: 'snowball-fight', name: 'Snowball Showdown', icon: '❄️', cat: 'Action',
    howto: 'Duck behind the snow walls and pelt your rival with snowballs. Walls crumble after a few hits. First to land 3 hits wins!',
    controls: 'Move: WASD / arrows · Throw: Space (facing) or click to aim',
    duration: 40,
    init: function (rnd) {
      return {
        p: [{ x: 110, y: 290, fx: 1, fy: 0, rl: 0, hf: 0 }, { x: 690, y: 290, fx: -1, fy: 0, rl: 0, hf: 0 }],
        w: SWALLS.map(function (a) { return { x: a[0], y: a[1], w: a[2], h: a[3], hp: a[4], m: a[4] }; }),
        b: [], score: [0, 0], fx: [], shk: 0, t: 0
      };
    },
    step: function (S, dt, inp, ev, rnd) {
      S.t = r2(S.t + dt); tickFx(S, dt);
      var ps = S.p;
      WHO.forEach(function (who, i) {
        var p = ps[i], a = axes(inp[who]);
        p.rl = r2(Math.max(0, p.rl - dt)); p.hf = r2(Math.max(0, p.hf - dt));
        var sp = 230 * (p.hf > 0 ? 0.5 : 1);
        if (a[0] || a[1]) { p.fx = r2(a[0]); p.fy = r2(a[1]); }
        var nx = clamp(p.x + a[0] * sp * dt, AX0 + PR, AX1 - PR); if (!inWall(S, nx, p.y, PR - 4)) p.x = nx;
        var ny = clamp(p.y + a[1] * sp * dt, AY0 + PR, AY1 - PR); if (!inWall(S, p.x, ny, PR - 4)) p.y = ny;
        if (p.rl <= 0) {
          var e = null, dx = 0, dy = 0;
          for (var k = 0; k < ev[who].length; k++) if (ev[who][k].t === 'a' || ev[who][k].t === 'tap') { e = ev[who][k]; break; }
          if (e) {
            if (e.t === 'tap') { dx = e.x - p.x; dy = e.y - p.y; } else { dx = p.fx; dy = p.fy; }
            var l = hyp(dx, dy);
            if (l > 0.01) {
              dx /= l; dy /= l; p.fx = r2(dx); p.fy = r2(dy); p.rl = 0.55;
              if (S.b.length < 12) S.b.push({ x: r1(p.x + dx * 26), y: r1(p.y + dy * 26), vx: r1(dx * 560), vy: r1(dy * 560), o: i });
            }
          }
        }
      });
      if (separate(ps[0], ps[1], PR * 2)) ps.forEach(arenaClamp);
      var keep = [];
      S.b.forEach(function (b) {
        var alive = true;
        for (var s = 0; s < 2 && alive; s++) {
          b.x += b.vx * dt / 2; b.y += b.vy * dt / 2;
          if (b.x < AX0 || b.x > AX1 || b.y < AY0 || b.y > AY1) { alive = false; addFx(S, 'burst', clamp(b.x, AX0, AX1), clamp(b.y, AY0, AY1), 0.35, { c: '#dff1ff' }); break; }
          var w = inWall(S, b.x, b.y, 4);
          if (w) { w.hp--; alive = false; addFx(S, 'burst', b.x, b.y, w.hp > 0 ? 0.4 : 0.8, { c: '#ffffff' }); if (w.hp <= 0) addFx(S, 'txt', w.x + w.w / 2, w.y + w.h / 2, 0.8, { s: 'CRUMBLE!', c: '#dff1ff', z: 20 }); break; }
          var o = ps[1 - b.o];
          if (hyp(o.x - b.x, o.y - b.y) < PR + 8) {
            alive = false; S.score[b.o]++; o.hf = 0.5;
            var sp2 = hyp(b.vx, b.vy) || 1, kx = clamp(o.x + b.vx / sp2 * 18, AX0 + PR, AX1 - PR), ky = clamp(o.y + b.vy / sp2 * 18, AY0 + PR, AY1 - PR);
            if (!inWall(S, kx, ky, PR - 4)) { o.x = kx; o.y = ky; }
            addFx(S, 'burst', b.x, b.y, 0.6, { c: colOf(b.o) }); addFx(S, 'txt', o.x, o.y - 40, 0.8, { s: 'SPLAT!', c: '#fff', z: 28 }); S.shk = Math.max(S.shk, 0.25);
          }
        }
        if (alive) { b.x = r1(b.x); b.y = r1(b.y); keep.push(b); }
      });
      S.b = keep;
      S.w = S.w.filter(function (w) { return w.hp > 0; });
      ps.forEach(function (p) { p.x = r1(p.x); p.y = r1(p.y); });
      if (S.score[0] >= 3 || S.score[1] >= 3) S.result = { winner: S.score[0] > S.score[1] ? 'host' : S.score[1] > S.score[0] ? 'guest' : 'tie', text: S.score[0] + ' - ' + S.score[1] + ' hits' };
    },
    timeout: function (S) { return P.defaultTimeout(S); },
    draw: function (c, S, me, D, info) {
      var t = now(), k;
      D.bg(c, '#4f74b3', '#1c2a52', false);
      c.save(); shake(c, S);
      D.rrect(c, AX0 - 10, AY0 - 10, AX1 - AX0 + 20, AY1 - AY0 + 20, 26, '#e9f4ff');
      var g = c.createLinearGradient(0, AY0, 0, AY1); g.addColorStop(0, '#cfe3fa'); g.addColorStop(1, '#a9c8ec');
      D.rrect(c, AX0, AY0, AX1 - AX0, AY1 - AY0, 18, g);
      for (k = 0; k < 40; k++) { c.fillStyle = 'rgba(255,255,255,' + (0.4 + 0.4 * Math.sin(t * 3 + k)) + ')'; c.fillRect(AX0 + hash(k) * (AX1 - AX0), AY0 + hash(k + 50) * (AY1 - AY0), 3, 3); }
      c.strokeStyle = 'rgba(80,120,180,.25)'; c.setLineDash([10, 10]); c.lineWidth = 3; c.beginPath(); c.moveTo(400, AY0 + 6); c.lineTo(400, AY1 - 6); c.stroke(); c.setLineDash([]);
      S.p.forEach(function (p) { c.fillStyle = 'rgba(30,50,90,.25)'; c.beginPath(); c.ellipse(p.x, p.y + 20, 22, 8, 0, 0, 7); c.fill(); });
      S.w.forEach(function (w, n) {
        c.fillStyle = 'rgba(30,50,90,.25)'; c.fillRect(w.x + 6, w.y + 8, w.w, w.h);
        D.rrect(c, w.x, w.y, w.w, w.h, 10, '#ffffff', '#8fb3dd');
        c.strokeStyle = '#8fb3dd'; c.lineWidth = 2;
        for (var q = 0; q < w.m - w.hp; q++) { var yy = w.y + (q + 0.5) * w.h / w.m; c.beginPath(); c.moveTo(w.x + 4, yy); c.lineTo(w.x + w.w / 2, yy + 6); c.lineTo(w.x + w.w - 4, yy - 3); c.stroke(); }
      });
      S.b.forEach(function (b) {
        c.fillStyle = 'rgba(30,50,90,.25)'; c.beginPath(); c.arc(b.x + 4, b.y + 10, 6, 0, 7); c.fill();
        D.circle(c, b.x, b.y, 8, '#ffffff', 8);
        c.strokeStyle = colOf(b.o); c.lineWidth = 2.5; c.beginPath(); c.arc(b.x, b.y, 8, 0, 7); c.stroke();
      });
      S.p.forEach(function (p, i) {
        var who = WHO[i];
        D.player(c, p.x, p.y, PR, who, info.names[who], me === who);
        var hx = p.x + p.fx * 32, hy = p.y + p.fy * 32;
        if (p.rl <= 0) D.circle(c, hx, hy, 7, '#ffffff', 6); else { c.globalAlpha = 0.4; D.circle(c, hx, hy, 5, '#ffffff'); c.globalAlpha = 1; }
        if (p.hf > 0) { c.globalAlpha = p.hf / 0.5 * 0.8; D.circle(c, p.x, p.y, PR + 4, '#ffffff'); c.globalAlpha = 1; }
        if (me === who && p.rl > 0) D.bar(c, p.x - 22, p.y + 30, 44, 6, 1 - p.rl / 0.55, '#ffffff');
        for (var h = 0; h < 3; h++) { var lost = h < S.score[1 - i]; D.text(c, lost ? '♡' : '♥', p.x - 16 + h * 16, p.y + 46, 16, lost ? 'rgba(255,255,255,.5)' : colOf(i)); }
      });
      drawFx(c, S, D);
      c.restore();
      for (k = 0; k < 30; k++) { var sx = (hash(k) * W + Math.sin(t + k) * 20) % W, sy = ((hash(k + 7) * H) + t * (30 + hash(k + 3) * 40)) % H; c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(sx, sy, 2 + hash(k + 1) * 2, 0, 7); c.fill(); }
      D.hud(c, info, S.score[0], S.score[1], 'First to 3 hits');
    },
    bot: function (S, me, rnd) {
      var inp = P.emptyIn(), i = me === 'host' ? 0 : 1, p = S.p[i], o = S.p[1 - i], ev = [];
      var dodge = null;
      S.b.forEach(function (b) {
        if (b.o === i) return;
        var rx = p.x - b.x, ry = p.y - b.y, sp = hyp(b.vx, b.vy) || 1, along = (rx * b.vx + ry * b.vy) / sp;
        if (along < 0 || along > 230) return;
        var perp = (rx * b.vy - ry * b.vx) / sp;
        if (Math.abs(perp) < 36) { var s = perp >= 0 ? 1 : -1; dodge = [b.vy / sp * s, -b.vx / sp * s]; }
      });
      var los = clearLine(S, p.x, p.y, o.x, o.y, 7);
      if (los && p.rl <= 0 && rnd() < 0.5) ev.push({ t: 'tap', x: Math.round(o.x + (rnd() - 0.5) * 34), y: Math.round(o.y + (rnd() - 0.5) * 34) });
      if (dodge && rnd() < 0.85) { slideAim(S, inp, p, dodge[0] * 100, dodge[1] * 100); return { in: inp, ev: ev }; }
      var d = hyp(o.x - p.x, o.y - p.y) || 1;
      if (los) {
        var ux = (o.x - p.x) / d, uy = (o.y - p.y) / d, kk = d > 330 ? 1 : d < 210 ? -1 : 0, s2 = Math.sin(S.t * 1.3 + i * 2.1) > 0 ? 1 : -1;
        slideAim(S, inp, p, (ux * kk - uy * s2 * 0.7) * 100, (uy * kk + ux * s2 * 0.7) * 100);
      } else {
        var best = null, bs = 1e9;
        for (var x = 70; x <= 730; x += 55) for (var y = 125; y <= 455; y += 55) {
          if (inWall(S, x, y, PR + 2)) continue;
          var dm = hyp(x - p.x, y - p.y), sc = dm + Math.abs(hyp(x - o.x, y - o.y) - 280) * 0.5;
          if (sc >= bs) continue;
          if (!clearLine(S, x, y, o.x, o.y, 7) || !clearLine(S, p.x, p.y, x, y, PR - 2)) continue;
          bs = sc; best = [x, y];
        }
        if (best) slideAim(S, inp, p, best[0] - p.x, best[1] - p.y); else slideAim(S, inp, p, o.x - p.x, o.y - p.y);
      }
      return { in: inp, ev: ev };
    }
  });

  /* =====================================================================
     4. CRUMBLING FLOOR
     ===================================================================== */
  var CGc = 9, CGr = 6, CGs = 62, CGx = 121, CGy = 106, CRT = 0.75;
  function tileAt(x, y) { var cx = Math.floor((x - CGx) / CGs), cy = Math.floor((y - CGy) / CGs); if (cx < 0 || cy < 0 || cx >= CGc || cy >= CGr) return -1; return cy * CGc + cx; }
  function tcx(k) { return CGx + (k % CGc + 0.5) * CGs; }
  function tcy(k) { return CGy + (Math.floor(k / CGc) + 0.5) * CGs; }
  function overHole(S, p) {
    for (var a = -1; a <= 1; a += 2) for (var b = -1; b <= 1; b += 2) { var k = tileAt(p.x + a * 8, p.y + b * 8); if (k >= 0 && S.tl[k] !== -1) return false; }
    return true;
  }
  function solid(v) { return v >= 0 && v < 1; }
  P.add({
    id: 'crumble-floor', name: 'Crumbling Floor', icon: '🧱', cat: 'Action',
    howto: 'Tiles crack while you stand on them and then drop into the pit, and random tiles crumble too. Keep moving to fresh tiles and hop gaps. Last one standing wins!',
    controls: 'Move: WASD / arrows · Jump: Space',
    duration: 40,
    init: function (rnd) {
      var tl = []; for (var k = 0; k < CGc * CGr; k++) tl.push(0);
      var a = 2 * CGc + 2, b = 3 * CGc + 6;
      return { tl: tl, p: [{ x: tcx(a), y: tcy(a), j: 0, jc: 0, f: 0, l: a }, { x: tcx(b), y: tcy(b), j: 0, jc: 0, f: 0, l: b }], t: 0, sp: 1, fx: [], shk: 0, st: 'play', et: 0, pend: null, score: [1, 1] };
    },
    step: function (S, dt, inp, ev, rnd) {
      S.t = r2(S.t + dt); tickFx(S, dt);
      var ps = S.p, k;
      ps.forEach(function (p) { if (p.f) p.f = r2(p.f + dt); });
      if (S.st === 'end') { S.et = r2(S.et + dt); if (S.et > 1.3) S.result = S.pend; return; }
      for (k = 0; k < S.tl.length; k++) {
        var v = S.tl[k];
        if (v >= 1) { v += dt / CRT; if (v >= 2) { v = -1; addFx(S, 'burst', tcx(k), tcy(k), 0.5, { c: '#b08968' }); } S.tl[k] = r2(v); }
      }
      S.sp = r2(S.sp - dt);
      if (S.sp <= 0 && S.t > 2) {
        S.sp = r2(Math.max(0.26, 1.0 - S.t * 0.022));
        var pick = -1;
        if (rnd() < Math.min(0.35, S.t / 80)) { var pt = ps[rnd() < 0.5 ? 0 : 1], kk = tileAt(pt.x, pt.y); if (kk >= 0 && solid(S.tl[kk])) pick = kk; }
        if (pick < 0) { var sol = []; for (k = 0; k < S.tl.length; k++) if (solid(S.tl[k])) sol.push(k); if (sol.length) pick = sol[Math.floor(rnd() * sol.length)]; }
        if (pick >= 0) S.tl[pick] = 1;
      }
      WHO.forEach(function (who, i) {
        var p = ps[i]; if (p.f) return;
        var a = axes(inp[who]);
        p.j = r2(Math.max(0, p.j - dt)); p.jc = r2(Math.max(0, p.jc - dt));
        if (pressed(ev[who], 'a') && p.j <= 0 && p.jc <= 0) { p.j = 0.55; p.jc = 1.3; addFx(S, 'ring', p.x, p.y, 0.3, { c: '#ffffff', r: 30 }); }
        p.x = clamp(p.x + a[0] * 210 * dt, CGx + 6, CGx + CGc * CGs - 6); p.y = clamp(p.y + a[1] * 210 * dt, CGy + 6, CGy + CGr * CGs - 6);
      });
      if (!ps[0].f && !ps[1].f) separate(ps[0], ps[1], 40);
      var fell = [0, 0];
      ps.forEach(function (p, i) {
        if (p.f) return;
        p.x = r1(clamp(p.x, CGx + 6, CGx + CGc * CGs - 6)); p.y = r1(clamp(p.y, CGy + 6, CGy + CGr * CGs - 6));
        if (p.j > 0) return;
        var t0 = tileAt(p.x, p.y);
        if (t0 >= 0 && t0 !== p.l) { p.l = t0; if (solid(S.tl[t0])) S.tl[t0] = r2(Math.min(1, S.tl[t0] + 0.3)); }
        if (t0 >= 0 && solid(S.tl[t0]) && S.t > 1.5) S.tl[t0] = r2(Math.min(1, S.tl[t0] + 0.75 * dt));
        if (t0 >= 0 && S.tl[t0] > 0.995 && S.tl[t0] < 1) S.tl[t0] = 1;
        if (overHole(S, p)) { p.f = 0.01; fell[i] = 1; addFx(S, 'txt', p.x, p.y - 34, 1, { s: 'WAAH!', c: '#ffd166' }); }
      });
      if (fell[0] || fell[1]) {
        S.st = 'end'; S.et = 0; S.shk = 0.4;
        S.score = [fell[0] ? 0 : 1, fell[1] ? 0 : 1];
        S.pend = fell[0] && fell[1] ? { winner: 'tie', text: 'Both fell at once!' } : { winner: fell[0] ? 'guest' : 'host', text: 'Last one standing after ' + Math.round(S.t) + ' s' };
      }
    },
    timeout: function (S) { return { winner: 'tie', text: 'Both survived!' }; },
    draw: function (c, S, me, D, info) {
      var t = now(), k;
      D.bg(c, '#24324a', '#03050a', false);
      var pg = c.createRadialGradient(W / 2, 300, 20, W / 2, 300, 360); pg.addColorStop(0, 'rgba(255,90,30,.35)'); pg.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = pg; c.fillRect(0, 0, W, H);
      c.save(); shake(c, S);
      S.p.forEach(function (p, i) { if (p.f) { var s = Math.max(0.05, 1 - p.f / 1.2); c.globalAlpha = s; D.player(c, p.x, p.y + p.f * 30, PR * s, WHO[i], '', false); c.globalAlpha = 1; } });
      for (k = 0; k < S.tl.length; k++) {
        var v = S.tl[k]; if (v === -1) continue;
        var x = CGx + (k % CGc) * CGs, y = CGy + Math.floor(k / CGc) * CGs, ox = 0, oy = 0;
        if (v >= 1) { ox = Math.sin(t * 50 + k) * 2.5 * (v - 0.6); oy = Math.cos(t * 43 + k) * 2.5 * (v - 0.6); }
        c.fillStyle = '#3d2b1f'; c.fillRect(x + 3 + ox, y + 10 + oy, CGs - 6, CGs - 6);
        var light = v >= 1 ? 'hsl(' + (20 - (v - 1) * 20) + ',70%,' + (55 - (v - 1) * 15) + '%)' : 'hsl(' + (35 - v * 15) + ',' + (35 + v * 25) + '%,' + (68 - v * 14) + '%)';
        D.rrect(c, x + 3 + ox, y + 3 + oy, CGs - 6, CGs - 6, 8, light);
        c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 9 + ox, y + 8 + oy); c.lineTo(x + CGs - 12 + ox, y + 8 + oy); c.stroke();
        var cracks = v >= 1 ? 5 : Math.floor(v * 5);
        c.strokeStyle = 'rgba(40,20,10,.75)'; c.lineWidth = 2.5;
        for (var q = 0; q < cracks; q++) {
          var cx0 = x + CGs / 2 + ox, cy0 = y + CGs / 2 + oy, a = hash(k * 5 + q) * 6.28, l1 = 10 + hash(k + q * 3) * 14;
          c.beginPath(); c.moveTo(cx0, cy0); var mx = cx0 + Math.cos(a) * l1, my = cy0 + Math.sin(a) * l1; c.lineTo(mx, my); c.lineTo(mx + Math.cos(a + 0.6) * 9, my + Math.sin(a + 0.6) * 9); c.stroke();
        }
      }
      S.p.forEach(function (p, i) {
        if (p.f) return;
        var who = WHO[i], lift = p.j > 0 ? Math.sin((1 - p.j / 0.55) * Math.PI) * 26 : 0;
        c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(p.x, p.y + 18, 20 - lift * 0.3, 7 - lift * 0.1, 0, 0, 7); c.fill();
        D.player(c, p.x, p.y - lift, PR, who, info.names[who], me === who);
        if (me === who && p.jc > 0) D.bar(c, p.x - 20, p.y + 28, 40, 5, 1 - p.jc / 1.3, '#ffffff');
      });
      drawFx(c, S, D);
      c.restore();
      D.hud(c, info, S.p[0].f ? 'OUT' : 'OK', S.p[1].f ? 'OUT' : 'OK', S.t < 1.5 ? 'Get ready to move!' : 'Last one standing wins');
      if (S.st === 'end' && S.pend) banner(c, D, S.pend.winner === 'tie' ? 'Both fell!' : info.names[S.pend.winner] + ' survives!', '', S.pend.winner === 'tie' ? '#fff' : colOf(S.pend.winner === 'guest' ? 1 : 0));
    },
    bot: function (S, me, rnd) {
      var inp = P.emptyIn(), i = me === 'host' ? 0 : 1, p = S.p[i], o = S.p[1 - i], ev = [];
      if (S.st !== 'play' || p.f) return { in: inp, ev: ev };
      var cur = tileAt(p.x, p.y), v = cur >= 0 ? S.tl[cur] : -1;
      var tx, ty;
      if (v >= 0 && v < 0.55 && p.j <= 0) { tx = tcx(cur); ty = tcy(cur); if (hyp(tx - p.x, ty - p.y) > 5) aim(inp, tx - p.x, ty - p.y); return { in: inp, ev: ev }; }
      var cc = cur % CGc, cr = Math.floor(cur / CGc), best = -1, bs = 1e9, bd = 0;
      for (var dr = -2; dr <= 2; dr++) for (var dc = -2; dc <= 2; dc++) {
        if (!dr && !dc) continue;
        var nc = cc + dc, nr = cr + dr; if (nc < 0 || nr < 0 || nc >= CGc || nr >= CGr) continue;
        var idx = nr * CGc + nc, v2 = S.tl[idx]; if (!solid(v2)) continue;
        var dist = Math.max(Math.abs(dc), Math.abs(dr)), nb = 0;
        for (var a = -1; a <= 1; a++) for (var b = -1; b <= 1; b++) { var ac = nc + a, ar = nr + b; if ((a || b) && ac >= 0 && ar >= 0 && ac < CGc && ar < CGr && solid(S.tl[ar * CGc + ac])) nb++; }
        var sc = v2 * 2 + dist * 0.3 - nb * 0.12 + (dist === 2 && p.jc > 0 ? 3 : 0) + (hyp(tcx(idx) - o.x, tcy(idx) - o.y) < 70 ? 0.4 : 0) + rnd() * 0.05;
        if (sc < bs) { bs = sc; best = idx; bd = dist; }
      }
      if (best < 0) return { in: inp, ev: ev };
      tx = tcx(best); ty = tcy(best); aim(inp, tx - p.x, ty - p.y);
      var dx = tx - p.x, dy = ty - p.y, l = hyp(dx, dy) || 1, ah = tileAt(p.x + dx / l * 30, p.y + dy / l * 30);
      if (p.j <= 0 && p.jc <= 0 && ((ah >= 0 && (S.tl[ah] === -1 || S.tl[ah] > 1.75)) || (v >= 1.8))) ev.push({ t: 'a' });
      return { in: inp, ev: ev };
    }
  });

  /* =====================================================================
     5. CHOMP CHASE
     ===================================================================== */
  var CPX = 400, CPY = 292, CL = 245, CHR = 34;
  P.add({
    id: 'chomp-chase', name: 'Chomp Chase', icon: '🐶', cat: 'Action',
    howto: 'Grab the stars while a chained chomp hunts whoever is closer. It winds up and lunges, and a bite stuns you and knocks a star loose. Most stars after 30 seconds wins!',
    controls: 'Move: WASD / arrows',
    duration: 30,
    init: function (rnd) {
      return {
        p: [{ x: 120, y: CPY, st: 0, iv: 0 }, { x: 680, y: CPY, st: 0, iv: 0 }],
        ch: { x: CPX, y: CPY, m: 'chase', t: 0, nx: r2(1.6 + rnd()), dx: 0, dy: 0, tg: 0, fa: 0 },
        s: [], score: [0, 0], fx: [], shk: 0, sp: 0.4, id: 0
      };
    },
    step: function (S, dt, inp, ev, rnd) {
      tickFx(S, dt);
      var ps = S.p, ch = S.ch;
      WHO.forEach(function (who, i) {
        var p = ps[i]; p.st = r2(Math.max(0, p.st - dt)); p.iv = r2(Math.max(0, p.iv - dt));
        if (p.st > 0) return;
        var a = axes(inp[who]); p.x += a[0] * 240 * dt; p.y += a[1] * 240 * dt; arenaClamp(p);
      });
      separate(ps[0], ps[1], PR * 2);
      var d0 = hyp(ps[0].x - ch.x, ps[0].y - ch.y), d1 = hyp(ps[1].x - ch.x, ps[1].y - ch.y);
      if (ch.m === 'chase') ch.tg = d0 < d1 ? 0 : d1 < d0 ? 1 : (rnd() < 0.5 ? 0 : 1);
      var tg = ps[ch.tg], tx = tg.x - ch.x, ty = tg.y - ch.y, tl = hyp(tx, ty) || 1;
      ch.t = r2(ch.t + dt);
      if (ch.m === 'chase') {
        ch.x += tx / tl * 118 * dt; ch.y += ty / tl * 118 * dt; ch.fa = r2(Math.atan2(ty, tx));
        if (ch.t >= ch.nx) { ch.m = 'wind'; ch.t = 0; }
      } else if (ch.m === 'wind') {
        ch.fa = r2(Math.atan2(ty, tx));
        if (ch.t >= 0.55) { ch.m = 'lunge'; ch.t = 0; ch.dx = r2(tx / tl); ch.dy = r2(ty / tl); addFx(S, 'txt', ch.x, ch.y - 50, 0.5, { s: 'GRRR!', c: '#ff5a6a', z: 22 }); }
      } else if (ch.m === 'lunge') {
        ch.x += ch.dx * 600 * dt; ch.y += ch.dy * 600 * dt;
        if (ch.t >= 0.42) { ch.m = 'rest'; ch.t = 0; }
      } else if (ch.m === 'rest') {
        if (ch.t >= 0.7) { ch.m = 'chase'; ch.t = 0; ch.nx = r2(1.3 + rnd() * 1.0); }
      }
      var cdx = ch.x - CPX, cdy = ch.y - CPY, cd = hyp(cdx, cdy);
      if (cd > CL) { ch.x = CPX + cdx / cd * CL; ch.y = CPY + cdy / cd * CL; if (ch.m === 'lunge') { ch.m = 'rest'; ch.t = 0; S.shk = Math.max(S.shk, 0.12); } }
      var bit = false;
      ps.forEach(function (p, i) {
        if (p.iv > 0 || hyp(p.x - ch.x, p.y - ch.y) > CHR + PR - 6) return;
        bit = true; p.st = 1; p.iv = 2.2;
        addFx(S, 'burst', p.x, p.y, 0.6, { c: '#ff5a6a' }); addFx(S, 'txt', p.x, p.y - 40, 0.9, { s: 'CHOMP!', c: '#ff5a6a', z: 30 });
        S.shk = 0.4;
        if (S.score[i] > 0) {
          S.score[i]--;
          var ax = p.x - ch.x, ay = p.y - ch.y, al = hyp(ax, ay) || 1;
          if (S.s.length < 7) S.s.push({ x: r1(clamp(p.x + ax / al * 70, AX0 + 20, AX1 - 20)), y: r1(clamp(p.y + ay / al * 70, AY0 + 20, AY1 - 20)), i: S.id++, t: 0 });
        }
      });
      if (bit) { ch.m = 'rest'; ch.t = 0; }
      S.sp = r2(S.sp - dt);
      if (S.sp <= 0 && S.s.length < 5) { S.sp = r2(0.7 + rnd() * 0.6); S.s.push({ x: Math.round(AX0 + 30 + rnd() * (AX1 - AX0 - 60)), y: Math.round(AY0 + 30 + rnd() * (AY1 - AY0 - 60)), i: S.id++, t: 0 }); }
      S.s = S.s.filter(function (s) {
        s.t = r2(s.t + dt);
        var e0 = ps[0].st > 0 ? 1e9 : hyp(s.x - ps[0].x, s.y - ps[0].y), e1 = ps[1].st > 0 ? 1e9 : hyp(s.x - ps[1].x, s.y - ps[1].y);
        if (e0 < PR + 16 || e1 < PR + 16) {
          var w = e0 < e1 ? 0 : e1 < e0 ? 1 : (rnd() < 0.5 ? 0 : 1);
          S.score[w]++; addFx(S, 'txt', s.x, s.y - 10, 0.6, { s: '+1', c: '#ffd166' }); addFx(S, 'burst', s.x, s.y, 0.4, { c: '#ffd166' });
          return false;
        }
        return s.t < 9;
      });
      ch.x = r1(ch.x); ch.y = r1(ch.y);
      ps.forEach(function (p) { p.x = r1(p.x); p.y = r1(p.y); });
    },
    timeout: function (S) { var r = P.defaultTimeout(S); r.text += ' stars'; return r; },
    draw: function (c, S, me, D, info) {
      var t = now(), ch = S.ch, k;
      D.bg(c, '#3d8a47', '#163a1c');
      c.save(); shake(c, S);
      D.rrect(c, AX0, AY0, AX1 - AX0, AY1 - AY0, 20, 'rgba(255,255,255,.05)', 'rgba(255,255,255,.25)');
      for (k = 0; k < 24; k++) { c.fillStyle = 'rgba(160,230,120,.25)'; var gx = AX0 + hash(k) * (AX1 - AX0), gy = AY0 + hash(k + 40) * (AY1 - AY0); c.fillRect(gx, gy, 3, 9); c.fillRect(gx + 5, gy + 2, 3, 7); }
      c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.arc(CPX, CPY, CL + CHR, 0, 7); c.fill();
      c.strokeStyle = 'rgba(255,90,106,.35)'; c.setLineDash([12, 10]); c.lineWidth = 3; c.beginPath(); c.arc(CPX, CPY, CL + CHR, 0, 7); c.stroke(); c.setLineDash([]);
      S.s.forEach(function (s) {
        var r = 15 + Math.sin(t * 6 + s.i) * 2, fade = s.t > 7 ? 0.4 + 0.6 * Math.abs(Math.sin(t * 12)) : 1;
        c.save(); c.globalAlpha = fade; c.translate(s.x, s.y); c.rotate(t * 1.5 + s.i); c.shadowColor = '#ffd166'; c.shadowBlur = 16; c.fillStyle = '#ffd166';
        c.beginPath(); for (var q = 0; q < 10; q++) { var rr = q % 2 ? r * 0.45 : r, a = q * Math.PI / 5 - Math.PI / 2; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } c.closePath(); c.fill(); c.restore();
      });
      D.rrect(c, CPX - 9, CPY - 22, 18, 30, 5, '#8d6e63', '#3e2723');
      for (k = 1; k <= 9; k++) { var f = k / 10; c.strokeStyle = '#555b66'; c.lineWidth = 4; c.beginPath(); c.ellipse(CPX + (ch.x - CPX) * f, CPY + (ch.y - CPY) * f, 7, 5, Math.atan2(ch.y - CPY, ch.x - CPX), 0, 7); c.stroke(); }
      S.p.forEach(function (p, i) {
        var who = WHO[i];
        c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(p.x, p.y + 20, 22, 8, 0, 0, 7); c.fill();
        c.globalAlpha = p.iv > 0 && p.st <= 0 ? (Math.sin(t * 30) > 0 ? 0.45 : 1) : 1;
        D.player(c, p.x, p.y, PR, who, info.names[who], me === who);
        c.globalAlpha = 1;
        if (p.st > 0) for (var q = 0; q < 3; q++) { var a = t * 6 + q * 2.09; D.text(c, '★', p.x + Math.cos(a) * 20, p.y - 30 + Math.sin(a) * 6, 16, '#ffd166'); }
      });
      var wind = ch.m === 'wind', jx = wind ? Math.sin(t * 60) * 3 : 0;
      c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(ch.x, ch.y + 30, 32, 10, 0, 0, 7); c.fill();
      D.circle(c, ch.x + jx, ch.y, CHR, wind ? '#3a1018' : '#22222e', wind ? 30 : 10);
      var open = ch.m === 'lunge' || wind ? 0.55 : 0.18 + 0.12 * Math.sin(t * 10), fa = ch.fa;
      c.save(); c.translate(ch.x + jx, ch.y); c.rotate(fa);
      c.fillStyle = '#b3123a'; c.beginPath(); c.moveTo(4, 0); c.arc(4, 0, CHR - 4, -open, open); c.closePath(); c.fill();
      c.fillStyle = '#fff'; for (var q2 = -2; q2 <= 2; q2++) { var aa = q2 / 2.5 * open; c.beginPath(); c.moveTo(Math.cos(aa) * (CHR - 4), Math.sin(aa) * (CHR - 4)); c.lineTo(Math.cos(aa) * (CHR - 14), Math.sin(aa) * (CHR - 14) + 3); c.lineTo(Math.cos(aa + 0.15) * (CHR - 4), Math.sin(aa + 0.15) * (CHR - 4)); c.fill(); }
      c.restore();
      var ex = ch.x + jx + Math.cos(fa - 0.9) * 16, ey = ch.y + Math.sin(fa - 0.9) * 16;
      D.circle(c, ex, ey, 9, '#ffffff'); c.fillStyle = '#111'; c.beginPath(); c.arc(ex + Math.cos(fa) * 3, ey + Math.sin(fa) * 3, 4, 0, 7); c.fill();
      if (wind) D.otext(c, '!', ch.x, ch.y - 52, 34, '#ff5a6a');
      var tgP = S.p[ch.tg]; if (ch.m !== 'rest') { c.strokeStyle = 'rgba(255,90,106,.55)'; c.lineWidth = 3; c.beginPath(); c.arc(tgP.x, tgP.y, PR + 9 + Math.sin(t * 8) * 2, 0, 7); c.stroke(); }
      drawFx(c, S, D);
      c.restore();
      D.hud(c, info, S.score[0], S.score[1], 'Grab stars · dodge the chomp');
    },
    bot: function (S, me, rnd) {
      var inp = P.emptyIn(), i = me === 'host' ? 0 : 1, p = S.p[i], o = S.p[1 - i], ch = S.ch;
      if (p.st > 0) return { in: inp, ev: [] };
      var dx = p.x - ch.x, dy = p.y - ch.y, dd = hyp(dx, dy) || 1;
      var targeted = ch.tg === i || dd <= hyp(o.x - ch.x, o.y - ch.y);
      var threat = (targeted && (ch.m === 'wind' || ch.m === 'lunge') && dd < 340) || (dd < 115 && p.iv < 0.3);
      var best = null, bs = 1e9;
      S.s.forEach(function (s) { var sc = hyp(s.x - p.x, s.y - p.y) + (hyp(s.x - ch.x, s.y - ch.y) < 110 ? 400 : 0) - (hyp(s.x - o.x, s.y - o.y) < hyp(s.x - p.x, s.y - p.y) - 60 ? -150 : 0); if (sc < bs) { bs = sc; best = s; } });
      if (threat) {
        var lx = ch.m === 'lunge' ? ch.dx : dx / dd, ly = ch.m === 'lunge' ? ch.dy : dy / dd;
        var px = -ly, py = lx; if ((400 - p.x) * px + (290 - p.y) * py < 0) { px = -px; py = -py; }
        aim(inp, (dx / dd * 0.6 + px) * 100, (dy / dd * 0.6 + py) * 100);
      } else if (best) aim(inp, best.x - p.x + (rnd() - 0.5) * 10, best.y - p.y + (rnd() - 0.5) * 10);
      else { var ax = p.x - CPX, ay = p.y - CPY, al = hyp(ax, ay) || 1; aim(inp, CPX + ax / al * (CL + 90) - p.x, CPY + ay / al * (CL + 90) - p.y); }
      return { in: inp, ev: [] };
    }
  });

  /* =====================================================================
     6. LIGHT CYCLES
     ===================================================================== */
  var GW = 54, GHt = 26, CS = 14, GX = 22, GY = 104, DXS = [0, 1, 0, -1], DYS = [-1, 0, 1, 0];
  var ZERO = new Array(GW * GHt + 1).join('0');
  function gset(g, k, ch) { return g.substring(0, k) + ch + g.substring(k + 1); }
  function lcReset(S) {
    S.p = [{ x: 8, y: 13, d: 1, q: -1, dd: 0 }, { x: GW - 9, y: 13, d: 3, q: -1, dd: 0 }];
    S.g = gset(gset(ZERO, 13 * GW + 8, '1'), 13 * GW + GW - 9, '2');
    S.acc = 0; S.st = 'ready'; S.t = 0; S.rt = 0;
  }
  var KEYDIR = { arrowup: 0, w: 0, arrowright: 1, d: 1, arrowdown: 2, s: 2, arrowleft: 3, a: 3 };
  function lcFlood(g, sx, sy, limit, extra) {
    var seen = new Uint8Array(GW * GHt), q = [sx + sy * GW], n = 0;
    seen[q[0]] = 1; if (extra >= 0) seen[extra] = 1;
    while (q.length && n < limit) {
      var k = q.pop(); n++;
      var x = k % GW, y = (k - x) / GW;
      for (var d = 0; d < 4; d++) {
        var nx = x + DXS[d], ny = y + DYS[d]; if (nx < 0 || ny < 0 || nx >= GW || ny >= GHt) continue;
        var nk = ny * GW + nx; if (seen[nk] || g.charCodeAt(nk) !== 48) continue; seen[nk] = 1; q.push(nk);
      }
    }
    return n;
  }
  P.add({
    id: 'light-cycles', name: 'Light Cycles', icon: '🏍️', cat: 'Action',
    howto: 'You never stop riding and you leave a wall of light behind you. Turn to make your rival crash into a wall or a trail. Best of 3 rounds.',
    controls: 'Turn: WASD / arrow keys',
    duration: 45,
    init: function (rnd) { var S = { wins: [0, 0], score: [0, 0], rd: 1, fx: [], shk: 0, lw: -1 }; lcReset(S); return S; },
    step: function (S, dt, inp, ev, rnd) {
      S.t += dt; tickFx(S, dt);
      if (S.st === 'ready') { if (S.t >= 1.2) { S.st = 'play'; S.t = 0; } return; }
      if (S.st === 'gap') { if (roundGap(S, 5)) lcReset(S); return; }
      WHO.forEach(function (who, i) {
        var p = S.p[i], k = inp[who], want = [];
        ev[who].forEach(function (e) { if (e.t === 'key' && KEYDIR[e.k] !== undefined) want.push(KEYDIR[e.k]); });
        if (k.up) want.push(0); if (k.right) want.push(1); if (k.down) want.push(2); if (k.left) want.push(3);
        for (var n = 0; n < want.length; n++) {
          if (want[n] === p.d) { if (!ev[who].length) p.q = -1; break; }
          if ((want[n] + 2) % 4 !== p.d) { p.q = want[n]; break; }
        }
      });
      S.rt = r2(S.rt + dt); S.acc += dt;
      var iv = Math.max(0.045, 0.082 - S.rt * 0.0025);
      while (S.acc >= iv && S.st === 'play') {
        S.acc -= iv;
        var nx = [], crash = [0, 0];
        S.p.forEach(function (p, i) {
          if (p.q >= 0 && (p.q + 2) % 4 !== p.d) p.d = p.q; p.q = -1;
          var x = p.x + DXS[p.d], y = p.y + DYS[p.d]; nx.push([x, y]);
          if (x < 0 || y < 0 || x >= GW || y >= GHt || S.g.charAt(y * GW + x) !== '0') crash[i] = 1;
        });
        if (!crash[0] && !crash[1] && nx[0][0] === nx[1][0] && nx[0][1] === nx[1][1]) crash = [1, 1];
        if (crash[0] || crash[1]) {
          S.p.forEach(function (p, i) { if (crash[i]) { p.dd = 1; var px = GX + (p.x + 0.5) * CS, py = GY + (p.y + 0.5) * CS; addFx(S, 'boom', px, py, 0.9, { c: colOf(i) }); addFx(S, 'txt', px, py - 30, 1, { s: 'CRASH!', c: colOf(i), z: 30 }); } });
          S.shk = 0.5; roundWin(S, crash[0] && crash[1] ? -1 : crash[0] ? 1 : 0);
          break;
        }
        S.p.forEach(function (p, i) { p.x = nx[i][0]; p.y = nx[i][1]; S.g = gset(S.g, p.y * GW + p.x, i ? '2' : '1'); });
      }
      S.acc = r2(S.acc);
    },
    timeout: winsResult,
    draw: function (c, S, me, D, info) {
      var t = now(), k, x, y;
      c.fillStyle = '#04050d'; c.fillRect(0, 0, W, H);
      var hz = c.createLinearGradient(0, 0, 0, H); hz.addColorStop(0, 'rgba(155,107,255,.18)'); hz.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = hz; c.fillRect(0, 0, W, H);
      c.save(); shake(c, S);
      c.fillStyle = '#080b1c'; c.fillRect(GX, GY, GW * CS, GHt * CS);
      c.strokeStyle = 'rgba(120,160,255,.09)'; c.lineWidth = 1; c.beginPath();
      for (x = 0; x <= GW; x++) { c.moveTo(GX + x * CS, GY); c.lineTo(GX + x * CS, GY + GHt * CS); }
      for (y = 0; y <= GHt; y++) { c.moveTo(GX, GY + y * CS); c.lineTo(GX + GW * CS, GY + y * CS); }
      c.stroke();
      c.save(); c.shadowColor = '#9b6bff'; c.shadowBlur = 14; c.strokeStyle = '#b89bff'; c.lineWidth = 3; c.strokeRect(GX - 2, GY - 2, GW * CS + 4, GHt * CS + 4); c.restore();
      ['1', '2'].forEach(function (chr, i) {
        c.save(); c.shadowColor = colOf(i); c.shadowBlur = 10; c.fillStyle = colOf(i); c.beginPath();
        for (k = 0; k < S.g.length; k++) if (S.g.charAt(k) === chr) { var gx = k % GW, gy = (k - gx) / GW; c.rect(GX + gx * CS + 2, GY + gy * CS + 2, CS - 4, CS - 4); }
        c.fill(); c.restore();
      });
      S.p.forEach(function (p, i) {
        var who = WHO[i], px = GX + (p.x + 0.5) * CS, py = GY + (p.y + 0.5) * CS;
        if (p.dd) return;
        c.save(); c.globalAlpha = 0.35 + 0.15 * Math.sin(t * 12); D.circle(c, px, py, 20, colOf(i), 24); c.restore();
        D.player(c, px, py, 12, who, info.names[who], me === who);
        if (S.st === 'ready') { var ax = px + DXS[p.d] * 30, ay = py + DYS[p.d] * 30; D.otext(c, ['▲', '▶', '▼', '◀'][p.d], ax, ay, 20, colOf(i)); }
      });
      drawFx(c, S, D);
      c.restore();
      D.hud(c, info, S.wins[0], S.wins[1], 'Round ' + S.rd + ' · first to 2');
      winPips(c, D, S, 2);
      roundBanner(c, D, S, info, 'Double crash!', 'Derezzed!');
    },
    bot: function (S, me, rnd) {
      var inp = P.emptyIn(), i = me === 'host' ? 0 : 1, p = S.p[i], o = S.p[1 - i];
      if (S.st !== 'play') return { in: inp, ev: [] };
      var best = p.d, bs = -1e9, names = ['up', 'right', 'down', 'left'];
      for (var d = 0; d < 4; d++) {
        if ((d + 2) % 4 === p.d) continue;
        var x = p.x + DXS[d], y = p.y + DYS[d];
        if (x < 0 || y < 0 || x >= GW || y >= GHt || S.g.charAt(y * GW + x) !== '0') continue;
        var sp = lcFlood(S.g, x, y, 90, -1), sc = sp + (d === p.d ? 2 : 0) + rnd() * 5;
        var near = Math.abs(x - (o.x + DXS[o.d])) + Math.abs(y - (o.y + DYS[o.d]));
        if (near === 0) sc -= 120; else if (near === 1) sc -= 8;
        if (sc > bs) { bs = sc; best = d; }
      }
      inp[names[best]] = 1;
      return { in: inp, ev: [] };
    }
  });
})();
