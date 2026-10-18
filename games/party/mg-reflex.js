/* Party Rush minigames: REFLEX / TIMING group.
   Stop the Clock, Beat Bash, Target Blitz, Balloon Pop, Flag Frenzy, Mole Mash. */
(function () {
  var P = window.PARTY, W = 800, H = 500, WHO = ['host', 'guest'];
  var PINK = '#ff5c8a', BLUE = '#58c7ff', GOLD = '#ffd166', GOOD = '#4ade80', BAD = '#ff5a6a';
  var PCOL = [PINK, BLUE];

  function r1(v) { return Math.round(v * 10) / 10; }
  function r3(v) { return Math.round(v * 1000) / 1000; }
  function fxPush(S, o, max) { S.fx.push(o); while (S.fx.length > (max || 22)) S.fx.shift(); }
  function fxStep(S, dt) { S.fx = S.fx.filter(function (f) { f.t = r3(f.t - dt); return f.t > 0; }); }
  function isA(e) { return e.t === 'a' || e.t === 'tap'; }
  function winnerBy(a, b, lowWins) {
    if (a === b) return 'tie';
    return (lowWins ? a < b : a > b) ? 'host' : 'guest';
  }
  /* particle burst drawn from a short-lived fx (p = 0..1 progress) */
  function burst(c, x, y, p, col, n, spd, size, seed) {
    c.save(); c.globalAlpha = Math.max(0, 1 - p); c.fillStyle = col;
    for (var i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2 + (seed || 0), d = p * spd * (0.7 + 0.3 * ((i * 7) % 3) / 2);
      c.beginPath(); c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, Math.max(0.5, size * (1 - p)), 0, 7); c.fill();
    }
    c.restore();
  }
  function popText(c, D, txt, x, y, p, col, size) {
    c.save(); c.globalAlpha = Math.max(0, Math.min(1, (1 - p) * 1.6));
    D.otext(c, txt, x, y - p * 50, (size || 26) * (p < 0.15 ? 0.7 + p * 2 : 1), col); c.restore();
  }
  function star(c, x, y, r, col) {
    c.beginPath();
    for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    c.closePath(); c.fillStyle = col; c.fill();
  }
  function bomb(c, D, x, y, r, t) {
    D.circle(c, x, y, r, '#2a2638', 10);
    c.strokeStyle = '#8a6a3a'; c.lineWidth = 4; c.beginPath(); c.moveTo(x + r * 0.5, y - r * 0.8); c.quadraticCurveTo(x + r * 0.9, y - r * 1.4, x + r * 0.4, y - r * 1.5); c.stroke();
    var s = 5 + Math.sin(t * 30) * 2; star(c, x + r * 0.4, y - r * 1.5, s + 3, '#ffb03a'); star(c, x + r * 0.4, y - r * 1.5, s, '#fff6b0');
    D.text(c, '✕✕', x, y - 2, r * 0.6, BAD);
  }

  /* ===================================================================
     1. STOP THE CLOCK
     =================================================================== */
  var SC_CAP = 12, SC_TGT = 10;
  function scErrs(S) {
    var e = S.err.slice();
    if (S.st === 'run') for (var i = 0; i < 2; i++) e[i] = r3(e[i] + (S.stp[i] >= 0 ? Math.abs(S.stp[i] - SC_TGT) : SC_CAP - SC_TGT));
    return e;
  }
  function fmtS(v) { return v.toFixed(2) + 's'; }
  P.add({
    id: 'stop-the-clock', name: 'Stop the Clock', icon: '⏱️', cat: 'Reflex',
    howto: 'A stopwatch starts at 0 and vanishes after 3 seconds. Press Space to stop YOUR clock as close to exactly 10.00 s as you can. 3 rounds: the lowest total error wins!',
    controls: 'Stop the clock: Space / click',
    duration: 45,
    init: function (rnd) { return { rd: 0, st: 'run', t: 0, stp: [-1, -1], err: [0, 0], last: [0, 0], hist: [], rt: 0, fx: [] }; },
    step: function (S, dt, inp, ev, rnd) {
      fxStep(S, dt);
      if (S.st === 'run') {
        for (var i = 0; i < 2; i++) if (S.stp[i] < 0 && ev[WHO[i]].some(isA)) { S.stp[i] = S.t; fxPush(S, { k: 's', w: i, t: 0.7 }); }
        S.t = r3(S.t + dt);
        if ((S.stp[0] >= 0 && S.stp[1] >= 0) || S.t >= SC_CAP) {
          var e = [0, 0];
          for (var j = 0; j < 2; j++) { if (S.stp[j] < 0) S.stp[j] = SC_CAP; e[j] = r3(Math.abs(S.stp[j] - SC_TGT)); S.err[j] = r3(S.err[j] + e[j]); }
          S.last = e; S.hist.push(e); S.st = 'reveal'; S.rt = 0;
        }
      } else if (S.st === 'reveal') {
        S.rt = r3(S.rt + dt);
        if (S.rt >= 2.6) {
          S.rd++;
          if (S.rd >= 3) { S.result = { winner: winnerBy(S.err[0], S.err[1], true), text: 'Total error ' + fmtS(S.err[0]) + ' vs ' + fmtS(S.err[1]) }; return; }
          S.st = 'ready'; S.rt = 0;
        }
      } else if (S.st === 'ready') {
        S.rt = r3(S.rt + dt);
        if (S.rt >= 0.8) { S.st = 'run'; S.t = 0; S.stp = [-1, -1]; }
      }
    },
    timeout: function (S) { var e = scErrs(S); return { winner: winnerBy(e[0], e[1], true), text: 'Total error ' + fmtS(e[0]) + ' vs ' + fmtS(e[1]) }; },
    draw: function (c, S, me, D, info) {
      var now = performance.now() / 1000;
      D.bg(c, '#2c2066', '#0b0920');
      var cx = 400, cy = 268, R = 118;
      /* stopwatch body */
      c.save();
      var shake = 0; S.fx.forEach(function (f) { if (f.k === 's' && f.t > 0.5) shake = 4; });
      c.translate(Math.sin(now * 60) * shake, 0);
      D.rrect(c, cx - 22, cy - R - 34, 44, 26, 8, '#c9c6e8'); D.rrect(c, cx - 30, cy - R - 44, 60, 14, 6, '#ff5a6a');
      c.save(); c.shadowColor = '#9b6bff'; c.shadowBlur = 40; D.circle(c, cx, cy, R + 14, '#b7b3dc'); c.restore();
      D.circle(c, cx, cy, R, '#1a1640');
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 3;
      for (var k = 0; k < 60; k += 5) { var a = k / 60 * Math.PI * 2; c.beginPath(); c.moveTo(cx + Math.sin(a) * (R - 6), cy - Math.cos(a) * (R - 6)); c.lineTo(cx + Math.sin(a) * (R - (k % 15 ? 14 : 22)), cy - Math.cos(a) * (R - (k % 15 ? 14 : 22))); c.stroke(); }
      if (S.st === 'run') {
        var vis = S.t < 2.6 ? 1 : S.t < 3 ? (3 - S.t) / 0.4 : 0;
        if (vis > 0) {
          c.globalAlpha = vis;
          var ha = S.t / 10 * Math.PI * 2;
          c.strokeStyle = GOLD; c.lineWidth = 5; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.sin(ha) * (R - 26), cy - Math.cos(ha) * (R - 26)); c.stroke();
          D.otext(c, S.t.toFixed(2), cx, cy + 40, 46, '#fff');
          c.globalAlpha = 1;
        }
        if (vis < 1) {
          c.globalAlpha = 1 - vis;
          var fog = c.createRadialGradient(cx, cy, 10, cx, cy, R); fog.addColorStop(0, '#4b3a9a'); fog.addColorStop(1, '#231a55');
          c.fillStyle = fog; c.beginPath(); c.arc(cx, cy, R - 4, 0, 7); c.fill();
          D.otext(c, '?', cx + Math.sin(now * 3) * 4, cy - 14, 92 + Math.sin(now * 4) * 6, GOLD);
          D.otext(c, '??.??', cx, cy + 56, 30, '#d9d3ff');
          c.globalAlpha = 1;
        }
        D.circle(c, cx, cy, 8, GOLD);
      } else if (S.st === 'reveal') {
        D.otext(c, 'TARGET', cx, cy - 30, 22, '#d9d3ff');
        D.otext(c, '10.00', cx, cy + 18, 54, GOLD);
      } else {
        D.otext(c, 'Round ' + (S.rd + 1), cx, cy - 18, 40, '#fff');
        D.otext(c, 'Get ready…', cx, cy + 30, 24, GOLD);
      }
      c.restore();
      /* players */
      [0, 1].forEach(function (i) {
        var x = i ? 672 : 128, y = 210, who = WHO[i];
        D.player(c, x, y, 40, who, info.names[who], me === who);
        S.fx.forEach(function (f) { if (f.k === 's' && f.w === i) { var p = 1 - f.t / 0.7; c.strokeStyle = PCOL[i]; c.globalAlpha = 1 - p; c.lineWidth = 6; c.beginPath(); c.arc(x, y, 44 + p * 60, 0, 7); c.stroke(); c.globalAlpha = 1; } });
        if (S.st === 'run') {
          var stopped = S.stp[i] >= 0;
          D.rrect(c, x - 82, 280, 164, 50, 25, stopped ? 'rgba(74,222,128,.25)' : 'rgba(255,255,255,.08)', stopped ? GOOD : null);
          D.otext(c, stopped ? 'STOPPED ✋' : 'counting' + '...'.slice(0, 1 + Math.floor(now * 3) % 3), x, 305, stopped ? 22 : 18, stopped ? GOOD : '#d9d3ff');
        } else if (S.st === 'reveal') {
          var p = Math.min(1, S.rt / 1.2), shown = S.stp[i] * (1 - Math.pow(1 - p, 3));
          D.rrect(c, x - 90, 270, 180, 70, 22, 'rgba(0,0,0,.35)', PCOL[i]);
          D.otext(c, shown.toFixed(2), x, 305, 40, p < 1 ? '#fff' : PCOL[i]);
          if (S.rt > 1.25) {
            var e = S.last[i], col = e < 0.1 ? GOOD : e < 0.35 ? GOLD : BAD;
            var dir = S.stp[i] >= SC_TGT ? '+' : '−';
            D.otext(c, dir + e.toFixed(2) + 's off', x, 362, 24, col);
            if (S.rt > 1.6 && S.last[i] < S.last[1 - i]) { D.otext(c, '👑', x, 140 + Math.sin(now * 6) * 4, 40); D.otext(c, 'CLOSER!', x, 400, 26, GOLD); }
            if (S.rt > 1.6 && S.last[i] === S.last[1 - i]) D.otext(c, 'DEAD EVEN', x, 400, 22, '#fff');
          }
        }
        /* history */
        for (var r = 0; r < 3; r++) {
          var hx = x - 54 + r * 54, hy = 452, h = S.hist[r];
          var revealed = h && !(S.st === 'reveal' && r === S.hist.length - 1 && S.rt < 1.25);
          D.rrect(c, hx - 24, hy - 16, 48, 32, 10, revealed ? (h[i] <= h[1 - i] ? 'rgba(255,209,102,.3)' : 'rgba(255,255,255,.08)') : 'rgba(255,255,255,.05)');
          D.text(c, revealed ? h[i].toFixed(2) : 'R' + (r + 1), hx, hy, 14, revealed ? '#fff' : '#77739f', 'center', 700);
        }
      });
      var e = S.err.slice();
      if (S.st === 'reveal' && S.rt < 1.25) { e[0] = r3(e[0] - S.last[0]); e[1] = r3(e[1] - S.last[1]); }
      D.hud(c, info, fmtS(e[0]), fmtS(e[1]), 'Round ' + Math.min(3, S.rd + 1) + '/3 · stop at 10.00 s · lowest total error wins');
    },
    bot: function (S, me, rnd) {
      var i = me === 'host' ? 0 : 1, inp = P.emptyIn();
      if (S.st === 'run' && S.stp[i] < 0 && S.t >= 9.84 && rnd() < 0.3) return { in: inp, ev: [{ t: 'a' }] };
      return { in: inp, ev: [] };
    }
  });

  /* ===================================================================
     2. BEAT BASH
     =================================================================== */
  var BB_TRAVEL = 1.4, BB_HY = 420, BB_TOP = 88, BB_HX = [130, 450], BB_LW = 55, BB_END = 27.5;
  var BB_KEYS = { d: 0, f: 1, j: 2, k: 3, arrowleft: 0, arrowdown: 1, arrowup: 2, arrowright: 3 };
  var BB_COL = ['#ff7b54', '#ffd166', '#7ee081', '#b28dff'];
  var BB_LBL = ['D ←', 'F ↓', 'J ↑', 'K →'];
  function bbLane(e) {
    if (e.t === 'key' && BB_KEYS[e.k] !== undefined) return BB_KEYS[e.k];
    if (e.t === 'tap') for (var h = 0; h < 2; h++) if (e.x >= BB_HX[h] && e.x < BB_HX[h] + BB_LW * 4) return Math.floor((e.x - BB_HX[h]) / BB_LW);
    return -1;
  }
  P.add({
    id: 'rhythm-tap', name: 'Beat Bash', icon: '🥁', cat: 'Reflex',
    howto: 'Notes fall down 4 lanes on your own highway. Hit each one exactly as it crosses the line for PERFECT (100) or GOOD (50) plus combo bonus. Wild key mashing breaks your combo. Highest score wins!',
    controls: 'Lanes: D F J K or ← ↓ ↑ → · or click the lane',
    duration: 32,
    init: function (rnd) { return { t: 0, nx: 1.5, pl: -1, notes: [], id: 0, sc: [0, 0], cb: [0, 0], bc: [0, 0], jd: [null, null], lf: [[0, 0, 0, 0], [0, 0, 0, 0]], score: [0, 0], fx: [], hits: [[0, 0, 0], [0, 0, 0]] }; },
    step: function (S, dt, inp, ev, rnd) {
      fxStep(S, dt);
      /* chart generation (eighth notes at 120 BPM, density rises) */
      while (S.nx <= S.t + BB_TRAVEL + 0.05 && S.nx <= BB_END) {
        var p = 0.32 + 0.33 * (S.nx / BB_END) + ((S.nx * 2) % 1 === 0 ? 0.22 : -0.08);
        if (rnd() < p) {
          var l = Math.floor(rnd() * 4); if (l === S.pl && rnd() < 0.6) l = (l + 1 + Math.floor(rnd() * 3)) % 4;
          S.notes.push({ i: S.id++, l: l, tm: S.nx, j: [0, 0] }); S.pl = l;
          if (S.nx > 6 && rnd() < 0.12) S.notes.push({ i: S.id++, l: (l + 2) % 4, tm: S.nx, j: [0, 0] });
        }
        S.nx += 0.25;
      }
      var t = S.t;
      for (var i = 0; i < 2; i++) {
        var lanes = [];
        ev[WHO[i]].forEach(function (e) { var l = bbLane(e); if (l >= 0 && lanes.indexOf(l) < 0) lanes.push(l); });
        lanes.forEach(function (l) {
          var best = null, bd = 9;
          S.notes.forEach(function (n) { if (n.l === l && n.j[i] === 0) { var d = Math.abs(n.tm - t); if (d <= 0.15 && d < bd) { bd = d; best = n; } } });
          S.lf[i][l] = 0.2;
          if (best) {
            var perf = bd <= 0.055;
            best.j[i] = perf ? 1 : 2; S.cb[i]++; S.bc[i] = Math.max(S.bc[i], S.cb[i]);
            S.sc[i] += (perf ? 100 : 50) + Math.min(S.cb[i], 20) * 5;
            S.hits[i][perf ? 0 : 1]++;
            S.jd[i] = { k: perf ? 0 : 1, t: 0.5 };
            fxPush(S, { k: 'h', w: i, l: l, c: perf ? 1 : 0, t: 0.4 });
          } else {
            S.cb[i] = 0; S.sc[i] = Math.max(0, S.sc[i] - 10); S.jd[i] = { k: 3, t: 0.4 };
          }
        });
      }
      S.notes.forEach(function (n) {
        for (var i = 0; i < 2; i++) if (n.j[i] === 0 && t > n.tm + 0.15) { n.j[i] = 3; S.cb[i] = 0; S.jd[i] = { k: 2, t: 0.45 }; S.hits[i][2]++; }
      });
      S.notes = S.notes.filter(function (n) { return t < n.tm + 0.6 && !(n.j[0] && n.j[1] && t > n.tm + 0.35); });
      for (var q = 0; q < 2; q++) {
        for (var l2 = 0; l2 < 4; l2++) S.lf[q][l2] = Math.max(0, r3(S.lf[q][l2] - dt));
        if (S.jd[q]) { S.jd[q].t = r3(S.jd[q].t - dt); if (S.jd[q].t <= 0) S.jd[q] = null; }
      }
      S.score = S.sc.slice();
      S.t = r3(S.t + dt);
      if (S.nx > BB_END && !S.notes.length && S.t > BB_END + 0.8) S.result = { winner: winnerBy(S.sc[0], S.sc[1]), text: S.sc[0] + ' - ' + S.sc[1] + ' points' };
    },
    draw: function (c, S, me, D, info) {
      var now = performance.now() / 1000, beat = (S.t % 0.5) / 0.5;
      D.bg(c, '#2a1450', '#09061a', false);
      /* pulsing light beams */
      c.save(); c.globalAlpha = 0.10 + 0.12 * (1 - beat);
      for (var b = 0; b < 6; b++) { var bx = 60 + b * 136; var g = c.createLinearGradient(bx, 0, bx, H); g.addColorStop(0, BB_COL[b % 4]); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(bx - 10, 0); c.lineTo(bx + 10, 0); c.lineTo(bx + 60 * Math.sin(now + b), H); c.lineTo(bx - 60 + 60 * Math.sin(now + b), H); c.fill(); }
      c.restore();
      c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(398, 80, 4, 420);
      for (var i = 0; i < 2; i++) {
        var x0 = BB_HX[i], who = WHO[i], hw = BB_LW * 4, mine = me === who;
        c.save(); c.shadowColor = PCOL[i]; c.shadowBlur = mine ? 26 : 10;
        var hg = c.createLinearGradient(0, BB_TOP, 0, 480); hg.addColorStop(0, 'rgba(20,12,40,.4)'); hg.addColorStop(1, 'rgba(30,18,60,.95)');
        D.rrect(c, x0, BB_TOP - 4, hw, 480 - BB_TOP, 14, hg); c.restore();
        D.rrect(c, x0, BB_TOP - 4, hw, 480 - BB_TOP, 14, null, PCOL[i]);
        for (var l = 0; l < 4; l++) {
          var lx = x0 + l * BB_LW + BB_LW / 2;
          if (l) { c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(x0 + l * BB_LW - 1, BB_TOP, 2, 390); }
          if (S.lf[i][l] > 0) { c.save(); c.globalAlpha = S.lf[i][l] / 0.2 * 0.35; var lg = c.createLinearGradient(0, BB_HY, 0, BB_TOP); lg.addColorStop(0, BB_COL[l]); lg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = lg; c.fillRect(x0 + l * BB_LW + 2, BB_TOP, BB_LW - 4, BB_HY - BB_TOP); c.restore(); }
          /* receptor */
          c.strokeStyle = BB_COL[l]; c.lineWidth = 4; c.beginPath(); c.arc(lx, BB_HY, 21 + (S.lf[i][l] > 0 ? 3 : 0), 0, 7); c.stroke();
          if (S.lf[i][l] > 0) D.circle(c, lx, BB_HY, 16, BB_COL[l], 20);
          D.text(c, BB_LBL[l], lx, 458, 14, BB_COL[l], 'center', 800);
        }
        c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x0 + 6, BB_HY - 1, hw - 12, 2);
        /* notes */
        S.notes.forEach(function (n) {
          var st = n.j[i]; if (st === 1 || st === 2) return;
          var y = BB_HY - (n.tm - S.t) / BB_TRAVEL * (BB_HY - BB_TOP);
          if (y < BB_TOP || y > 490) return;
          var lx2 = x0 + n.l * BB_LW + BB_LW / 2;
          if (st === 3) { c.globalAlpha = 0.35; D.circle(c, lx2, y, 15, '#666'); c.globalAlpha = 1; return; }
          D.circle(c, lx2, y, 18, BB_COL[n.l], 14);
          c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(lx2, y, 7, 0, 7); c.fill();
        });
        S.fx.forEach(function (f) {
          if (f.k !== 'h' || f.w !== i) return;
          var p = 1 - f.t / 0.4, fx = x0 + f.l * BB_LW + BB_LW / 2;
          burst(c, fx, BB_HY, p, f.c ? GOLD : BB_COL[f.l], 10, 60, 5, f.l);
          c.strokeStyle = BB_COL[f.l]; c.globalAlpha = 1 - p; c.lineWidth = 3; c.beginPath(); c.arc(fx, BB_HY, 22 + p * 30, 0, 7); c.stroke(); c.globalAlpha = 1;
        });
        /* judgement + combo */
        var jd = S.jd[i];
        if (jd) {
          var jp = 1 - jd.t / 0.5, sz = 34 * (jp < 0.2 ? 0.8 + jp : 1);
          c.save(); c.globalAlpha = Math.min(1, jd.t * 4);
          D.otext(c, ['PERFECT!', 'GOOD', 'MISS', 'OOPS'][jd.k], x0 + hw / 2, 250 - jp * 14, sz, [GOLD, GOOD, BAD, '#aaa'][jd.k]);
          c.restore();
        }
        if (S.cb[i] >= 3) D.otext(c, S.cb[i] + ' COMBO', x0 + hw / 2, 292, 20 + Math.min(10, S.cb[i] / 3), '#fff');
        var ax = i ? 735 : 65;
        D.player(c, ax, 200 + Math.sin(now * 6 + i) * (S.cb[i] >= 5 ? 6 : 1), 28, who, info.names[who], mine);
        D.otext(c, 'best', ax, 262, 13, '#bdb8e8'); D.otext(c, 'x' + S.bc[i], ax, 284, 22, PCOL[i]);
        D.otext(c, '✦' + S.hits[i][0], ax, 330, 16, GOLD); D.otext(c, '✓' + S.hits[i][1], ax, 354, 16, GOOD); D.otext(c, '✕' + S.hits[i][2], ax, 378, 16, BAD);
      }
      D.hud(c, info, S.sc[0], S.sc[1], 'Hit the notes on the line · D F J K or ← ↓ ↑ →');
    },
    bot: function (S, me, rnd) {
      var i = me === 'host' ? 0 : 1, ev = [];
      var keys = ['d', 'f', 'j', 'k'];
      S.notes.forEach(function (n) {
        if (n.j[i] !== 0) return;
        var d = n.tm - S.t;
        if (d <= 0.02 + rnd() * 0.03 && d > -0.14 && rnd() < 0.72 && !ev.some(function (e) { return e.k === keys[n.l]; })) ev.push({ t: 'key', k: keys[n.l] });
      });
      return { in: P.emptyIn(), ev: ev };
    }
  });

  /* ===================================================================
     3. TARGET BLITZ
     =================================================================== */
  var TB_KIND = [{ v: 1, r: 30, life: 1.8 }, { v: 3, r: 21, life: 1.2 }, { v: -3, r: 28, life: 2.2 }];
  P.add({
    id: 'target-blitz', name: 'Target Blitz', icon: '🎯', cat: 'Reflex',
    howto: 'Targets pop up for a moment. Shoot them first: red targets +1, gold stars +3, but bombs cost you 3! Each target can only be claimed once. Most points in 30 seconds wins.',
    controls: 'Click targets · or aim: WASD/arrows + shoot: Space',
    duration: 30,
    init: function (rnd) { return { cx: [[250, 300], [550, 300]], tg: [], id: 0, sp: 0.4, score: [0, 0], fx: [], cd: [0, 0], sh: [0, 0] }; },
    step: function (S, dt, inp, ev, rnd) {
      fxStep(S, dt);
      S.sp -= dt;
      if (S.sp <= 0 && S.tg.length < 6) {
        S.sp = 0.3 + rnd() * 0.35;
        var u = rnd(), k = u < 0.15 ? 1 : u < 0.37 ? 2 : 0, x = 0, y = 0;
        for (var tries = 0; tries < 6; tries++) {
          x = Math.round(70 + rnd() * 660); y = Math.round(115 + rnd() * 305);
          var ok = S.tg.every(function (t) { return Math.hypot(t.x - x, t.y - y) > 80; });
          if (ok) break;
        }
        S.tg.push({ i: S.id++, x: x, y: y, k: k, t: 0, life: TB_KIND[k].life });
      }
      var claims = {};
      for (var i = 0; i < 2; i++) {
        var k2 = inp[WHO[i]], p = S.cx[i];
        var vx = (k2.right ? 1 : 0) - (k2.left ? 1 : 0), vy = (k2.down ? 1 : 0) - (k2.up ? 1 : 0), l = Math.hypot(vx, vy) || 1;
        p[0] = r1(Math.max(20, Math.min(W - 20, p[0] + vx / l * 430 * dt)));
        p[1] = r1(Math.max(90, Math.min(H - 20, p[1] + vy / l * 430 * dt)));
        S.cd[i] = Math.max(0, r3(S.cd[i] - dt)); S.sh[i] = Math.max(0, r3(S.sh[i] - dt));
        var shots = [];
        ev[WHO[i]].forEach(function (e) {
          if (e.t === 'tap') { p[0] = r1(e.x); p[1] = r1(Math.max(90, e.y)); shots.push([e.x, e.y]); }
          else if (e.t === 'a' && S.cd[i] <= 0) { shots.push([p[0], p[1]]); S.cd[i] = 0.12; }
        });
        shots.slice(0, 3).forEach(function (s) {
          S.sh[i] = 0.12;
          var best = null, bd = 1e9;
          S.tg.forEach(function (t) { var d = Math.hypot(t.x - s[0], t.y - s[1]); if (d <= TB_KIND[t.k].r + 5 && d < bd) { bd = d; best = t; } });
          if (best) { var c = claims[best.i] = claims[best.i] || [1e9, 1e9]; c[i] = Math.min(c[i], bd); }
          else fxPush(S, { k: 'm', x: r1(s[0]), y: r1(s[1]), w: i, t: 0.3 });
        });
      }
      S.tg = S.tg.filter(function (t) {
        var c = claims[t.i];
        if (c) {
          var w = c[0] < c[1] ? 0 : c[1] < c[0] ? 1 : (rnd() < 0.5 ? 0 : 1);
          var v = TB_KIND[t.k].v; S.score[w] += v;
          fxPush(S, { k: t.k === 2 ? 'b' : 'h', x: t.x, y: t.y, w: w, v: v, t: t.k === 2 ? 0.8 : 0.6 });
          return false;
        }
        t.t = r3(t.t + dt);
        return t.t < t.life;
      });
    },
    timeout: function (S) { return P.defaultTimeout(S); },
    draw: function (c, S, me, D, info) {
      var now = performance.now() / 1000;
      c.save();
      var shake = 0; S.fx.forEach(function (f) { if (f.k === 'b' && f.t > 0.55) shake = 7; });
      if (shake) c.translate(Math.sin(now * 70) * shake, Math.cos(now * 55) * shake);
      D.bg(c, '#174a5a', '#061820');
      /* gallery backdrop: curtains + rails */
      for (var x = 0; x < W; x += 50) { c.fillStyle = x % 100 ? 'rgba(255,90,106,.10)' : 'rgba(255,209,102,.07)'; c.fillRect(x, 70, 50, 400); }
      c.fillStyle = '#5a3a1e'; c.fillRect(0, 440, W, 60); c.fillStyle = '#7a5230'; c.fillRect(0, 440, W, 8);
      for (var b = 0; b < W; b += 40) { c.fillStyle = b % 80 ? '#ff5a6a' : '#fff'; c.beginPath(); c.moveTo(b, 70); c.lineTo(b + 40, 70); c.lineTo(b + 20, 92); c.fill(); }
      S.tg.forEach(function (t) {
        var K = TB_KIND[t.k], s = Math.min(1, t.t / 0.14), left = t.life - t.t;
        if (left < 0.45 && Math.floor(now * 14) % 2) c.globalAlpha = 0.55;
        var r = K.r * (s < 1 ? s * 1.15 : 1);
        c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(t.x, t.y + r + 8, r * 0.8, 6, 0, 0, 7); c.fill();
        if (t.k === 0) {
          D.circle(c, t.x, t.y, r, '#e8384f', 10); c.fillStyle = '#fff'; c.beginPath(); c.arc(t.x, t.y, r * 0.68, 0, 7); c.fill();
          c.fillStyle = '#e8384f'; c.beginPath(); c.arc(t.x, t.y, r * 0.4, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(t.x, t.y, r * 0.14, 0, 7); c.fill();
        } else if (t.k === 1) {
          c.save(); c.translate(t.x, t.y); c.rotate(now * 2); c.shadowColor = GOLD; c.shadowBlur = 24; star(c, 0, 0, r * 1.25, GOLD); c.restore();
          D.text(c, '3', t.x, t.y + 1, 18, '#5a3a00');
        } else bomb(c, D, t.x, t.y, r, now);
        c.strokeStyle = t.k === 2 ? 'rgba(255,90,106,.8)' : 'rgba(255,255,255,.8)'; c.lineWidth = 3;
        c.beginPath(); c.arc(t.x, t.y, r + 7, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0, left / t.life)); c.stroke();
        c.globalAlpha = 1;
      });
      S.fx.forEach(function (f) {
        if (f.k === 'h') { var p = 1 - f.t / 0.6; burst(c, f.x, f.y, p, PCOL[f.w], 12, 70, 6, f.x); burst(c, f.x, f.y, p, '#fff', 6, 40, 4, f.y); popText(c, D, '+' + f.v, f.x, f.y - 20, p, PCOL[f.w], f.v > 1 ? 34 : 26); }
        else if (f.k === 'b') { var pb = 1 - f.t / 0.8; c.globalAlpha = Math.max(0, 1 - pb); D.circle(c, f.x, f.y, 20 + pb * 70, '#ff9f43', 30); c.globalAlpha = 1; burst(c, f.x, f.y, pb, '#ffd166', 16, 110, 7, 0.3); popText(c, D, f.v + '', f.x, f.y - 30, pb, BAD, 34); }
        else if (f.k === 'm') { var pm = 1 - f.t / 0.3; c.strokeStyle = 'rgba(255,255,255,' + (0.6 * (1 - pm)) + ')'; c.lineWidth = 2; c.beginPath(); c.arc(f.x, f.y, 6 + pm * 14, 0, 7); c.stroke(); }
      });
      [0, 1].forEach(function (i) {
        var p = S.cx[i], col = PCOL[i], mine = me === WHO[i], rr = 18 + (S.sh[i] > 0 ? 6 * S.sh[i] / 0.12 : 0);
        c.save(); c.shadowColor = col; c.shadowBlur = 12;
        c.strokeStyle = mine ? '#fff' : col; c.lineWidth = mine ? 5 : 3; c.beginPath(); c.arc(p[0], p[1], rr, 0, 7); c.stroke();
        if (mine) { c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.arc(p[0], p[1], rr, 0, 7); c.stroke(); }
        c.beginPath(); c.moveTo(p[0] - rr - 8, p[1]); c.lineTo(p[0] - 6, p[1]); c.moveTo(p[0] + 6, p[1]); c.lineTo(p[0] + rr + 8, p[1]);
        c.moveTo(p[0], p[1] - rr - 8); c.lineTo(p[0], p[1] - 6); c.moveTo(p[0], p[1] + 6); c.lineTo(p[0], p[1] + rr + 8); c.stroke(); c.restore();
        D.otext(c, info.names[WHO[i]], p[0], p[1] + rr + 20, 12, col);
      });
      D.player(c, 48, 470, 20, 'host', '', me === 'host'); D.player(c, 752, 470, 20, 'guest', '', me === 'guest');
      D.otext(c, '🎯 +1   ⭐ +3   💣 −3', 400, 470, 18, '#ffe9c2');
      c.restore();
      D.hud(c, info, S.score[0], S.score[1], 'First shot claims it · avoid bombs!');
    },
    bot: function (S, me, rnd) {
      var i = me === 'host' ? 0 : 1, p = S.cx[i], inp = P.emptyIn(), ev = [], best = null, bv = -1;
      S.tg.forEach(function (t) {
        if (t.k === 2) return;
        var d = Math.hypot(t.x - p[0], t.y - p[1]), eta = d / 430 + 0.1;
        if (eta > t.life - t.t) return;
        var v = TB_KIND[t.k].v / (d + 90); if (v > bv) { bv = v; best = t; }
      });
      if (best) {
        if (best.x > p[0] + 5) inp.right = 1; if (best.x < p[0] - 5) inp.left = 1;
        if (best.y > p[1] + 5) inp.down = 1; if (best.y < p[1] - 5) inp.up = 1;
        var d2 = Math.hypot(best.x - p[0], best.y - p[1]);
        var nearBomb = S.tg.some(function (t) { return t.k === 2 && Math.hypot(t.x - p[0], t.y - p[1]) <= TB_KIND[2].r + 8; });
        if (d2 < TB_KIND[best.k].r * 0.75 && !nearBomb && S.cd[i] <= 0 && rnd() < 0.7) ev.push({ t: 'a' });
      }
      return { in: inp, ev: ev };
    }
  });

  /* ===================================================================
     4. BALLOON POP
     =================================================================== */
  var BP_ROUND = 9, BP_GAP = 2.2;
  function bpBank(S, i) { if (S.s[i] === 0 && S.n[i] > 0) { S.s[i] = 1; S.bt[i] = S.rt; S.tot[i] += S.n[i]; fxPush(S, { k: 'k', w: i, v: S.n[i], t: 0.9 }); } }
  P.add({
    id: 'balloon-pump', name: 'Balloon Pop', icon: '🎈', cat: 'Reflex',
    howto: 'Pump your balloon to make it bigger, then BANK its size before it pops! Every balloon has a secret breaking point. A popped balloon scores 0. Biggest total over 3 rounds wins.',
    controls: 'Pump: Space / click · Bank: B or Shift (or click BANK)',
    duration: 36,
    init: function (rnd) {
      return { rd: 0, st: 'pump', rt: 0, gt: 0, n: [0, 0], k: [6 + Math.floor(rnd() * 19), 6 + Math.floor(rnd() * 19)], s: [0, 0], bt: [0, 0], tot: [0, 0], cd: [0, 0], pt: [9, 9], score: [0, 0], fx: [], hist: [] };
    },
    step: function (S, dt, inp, ev, rnd) {
      fxStep(S, dt);
      if (S.st === 'pump') {
        for (var i = 0; i < 2; i++) {
          S.cd[i] = Math.max(0, r3(S.cd[i] - dt)); S.pt[i] = Math.min(9, r3(S.pt[i] + dt));
          if (S.s[i] !== 0) continue;
          var es = ev[WHO[i]];
          var bank = es.some(function (e) { return e.t === 'b' || (e.t === 'key' && e.k === 'b') || (e.t === 'tap' && e.y > 425); });
          if (bank && S.n[i] > 0) { bpBank(S, i); continue; }
          var pump = es.some(function (e) { return e.t === 'a' || (e.t === 'tap' && e.y <= 425); });
          if (pump && S.cd[i] <= 0) {
            S.cd[i] = 0.08; S.pt[i] = 0; S.n[i]++;
            if (S.n[i] >= S.k[i]) { S.s[i] = 2; S.bt[i] = S.rt; fxPush(S, { k: 'p', w: i, t: 0.9 }); }
          }
        }
        S.rt = r3(S.rt + dt);
        if (S.rt >= BP_ROUND) for (var j = 0; j < 2; j++) bpBank(S, j);
        if ((S.s[0] !== 0 && S.s[1] !== 0) || S.rt >= BP_ROUND) {
          for (var q = 0; q < 2; q++) if (S.s[q] === 0) S.s[q] = 1;
          S.hist.push([S.s[0] === 2 ? -1 : S.n[0], S.s[1] === 2 ? -1 : S.n[1]]);
          S.st = 'gap'; S.gt = 0;
        }
      } else {
        S.gt = r3(S.gt + dt);
        if (S.gt >= BP_GAP) {
          S.rd++;
          if (S.rd >= 3) { S.result = { winner: winnerBy(S.tot[0], S.tot[1]), text: S.tot[0] + ' - ' + S.tot[1] + ' pumps banked' }; return; }
          S.st = 'pump'; S.rt = 0; S.n = [0, 0]; S.s = [0, 0]; S.pt = [9, 9];
          S.k = [6 + Math.floor(rnd() * 19), 6 + Math.floor(rnd() * 19)];
        }
      }
      S.score = S.tot.slice();
    },
    timeout: function (S) { return P.defaultTimeout(S); },
    draw: function (c, S, me, D, info) {
      var now = performance.now() / 1000;
      D.bg(c, '#3d2c86', '#120c2e', false);
      /* bunting + stars */
      for (var s = 0; s < 30; s++) { c.fillStyle = 'rgba(255,255,255,' + (0.2 + 0.2 * Math.sin(now * 2 + s)) + ')'; c.fillRect((s * 137) % W, 90 + (s * 59) % 300, 3, 3); }
      c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 74); c.quadraticCurveTo(400, 110, 800, 74); c.stroke();
      for (var f = 0; f < 16; f++) { var fx = 25 + f * 50, fy = 74 + 36 * (1 - Math.pow((fx - 400) / 400, 2)) * 0.9; c.fillStyle = ['#ff5c8a', '#ffd166', '#58c7ff', '#4ade80'][f % 4]; c.beginPath(); c.moveTo(fx - 14, fy); c.lineTo(fx + 14, fy); c.lineTo(fx, fy + 22); c.fill(); }
      c.fillStyle = '#2a1e5a'; c.fillRect(0, 440, W, 60);
      c.fillStyle = 'rgba(255,255,255,.1)'; c.fillRect(398, 110, 4, 330);
      [0, 1].forEach(function (i) {
        var bx = i ? 600 : 200, base = 372, n = S.n[i], st = S.s[i], col = PCOL[i], who = WHO[i];
        /* pump */
        var down = S.pt[i] < 0.1 ? 1 : 0;
        D.rrect(c, bx - 36, 400, 72, 40, 10, '#6b6890'); D.rrect(c, bx - 30, 404, 60, 8, 4, 'rgba(255,255,255,.25)');
        c.fillStyle = '#9b98c8'; c.fillRect(bx - 4, 372 + down * 16, 8, 30);
        D.rrect(c, bx - 30, 364 + down * 16, 60, 12, 6, col);
        c.strokeStyle = '#d9d3ff'; c.lineWidth = 3; c.beginPath(); c.moveTo(bx + 36, 425); c.quadraticCurveTo(bx + 70, 430, bx + 52, base); c.stroke();
        var r = 24 + Math.min(n, 24) * 3.8, sq = 1 + 0.08 * Math.max(0, 1 - S.pt[i] / 0.15);
        var lift = st === 1 ? Math.min(46, (S.st === 'gap' ? BP_ROUND : S.rt - S.bt[i]) * 90) : 0;
        if (st === 1 && S.st === 'gap') lift = 46;
        var cy = base - lift - r * 1.08 * sq, cx = bx + 52 + Math.sin(now * (2 + n * 0.25) + i) * (st === 0 ? n * 0.25 : 3);
        if (st !== 2) {
          c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(cx, cy + r * 1.1 * sq); c.quadraticCurveTo(cx - 10, base - lift / 2 + 6, bx + 52, base + 4); c.stroke();
          c.save(); c.shadowColor = col; c.shadowBlur = 30;
          var g = c.createRadialGradient(cx - r * 0.35, cy - r * 0.45, r * 0.1, cx, cy, r * 1.15);
          g.addColorStop(0, '#ffffff'); g.addColorStop(0.18, col); g.addColorStop(1, i ? '#1f6c9a' : '#a8204e');
          c.fillStyle = g; c.beginPath(); c.ellipse(cx, cy, r / sq, r * 1.1 * sq, 0, 0, 7); c.fill(); c.restore();
          c.fillStyle = i ? '#1f6c9a' : '#a8204e'; c.beginPath(); c.moveTo(cx, cy + r * 1.1 * sq - 2); c.lineTo(cx - 7, cy + r * 1.1 * sq + 10); c.lineTo(cx + 7, cy + r * 1.1 * sq + 10); c.fill();
          c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.ellipse(cx - r * 0.4, cy - r * 0.5, r * 0.14, r * 0.26, -0.5, 0, 7); c.fill();
          D.otext(c, n, cx, cy, Math.min(64, 22 + n * 2), '#fff');
          if (st === 1) { var ly = Math.max(100, cy - r * 1.1 - 32); D.rrect(c, cx - 64, ly - 18, 128, 36, 18, 'rgba(74,222,128,.9)'); D.text(c, 'BANKED +' + n, cx, ly, 18, '#06331a'); }
        } else {
          c.fillStyle = i ? '#1f6c9a' : '#a8204e'; c.beginPath(); c.moveTo(bx + 52, base + 4); c.quadraticCurveTo(bx + 40, base - 20, bx + 58, base - 30); c.quadraticCurveTo(bx + 66, base - 14, bx + 52, base + 4); c.fill();
          D.otext(c, 'POPPED · 0', bx + 52, 250, 26, BAD);
        }
        S.fx.forEach(function (e) {
          if (e.w !== i) return;
          if (e.k === 'p') { var p = 1 - e.t / 0.9; burst(c, bx + 52, 220, p, col, 16, 180, 9, 0.2); burst(c, bx + 52, 220, p, '#fff', 8, 120, 5, 1); popText(c, D, 'POP!', bx + 52, 200, p, '#fff', 64); }
          if (e.k === 'k') { var pk = 1 - e.t / 0.9; burst(c, bx + 52, 160, pk, GOLD, 12, 120, 5, 0.5); }
        });
        /* bank button + avatar */
        var can = S.st === 'pump' && st === 0;
        D.rrect(c, bx - 130, 448, 92, 38, 19, can ? 'rgba(74,222,128,.85)' : 'rgba(255,255,255,.1)');
        D.text(c, 'BANK', bx - 84, 467, 18, can ? '#06331a' : '#77739f');
        D.player(c, bx - 120, 360, 26, who, info.names[who], me === who);
        for (var rr = 0; rr < 3; rr++) {
          var h = S.hist[rr], hx = bx + 10 + rr * 50;
          D.rrect(c, hx - 21, 451, 42, 32, 10, h ? (h[i] < 0 ? 'rgba(255,90,106,.35)' : 'rgba(255,209,102,.3)') : 'rgba(255,255,255,.06)');
          D.text(c, h ? (h[i] < 0 ? '💥' : h[i]) : 'R' + (rr + 1), hx, 467, 15, h ? '#fff' : '#77739f', 'center', 700);
        }
      });
      if (S.st === 'pump') D.bar(c, 300, 94, 200, 10, 1 - S.rt / BP_ROUND, S.rt > BP_ROUND - 2.5 ? BAD : GOLD);
      else D.otext(c, S.rd >= 2 ? 'Final round done!' : 'Round ' + (S.rd + 1) + ' done!', 400, 120, 28, GOLD);
      D.hud(c, info, S.tot[0], S.tot[1], 'Round ' + Math.min(3, S.rd + 1) + '/3 · pump, then bank before it pops');
    },
    bot: function (S, me, rnd) {
      var i = me === 'host' ? 0 : 1, inp = P.emptyIn();
      if (S.st !== 'pump' || S.s[i] !== 0) return { in: inp, ev: [] };
      if (S.n[i] >= 8 && rnd() < 0.22) return { in: inp, ev: [{ t: 'b' }] };
      if (S.cd[i] <= 0 && rnd() < 0.6) return { in: inp, ev: [{ t: 'a' }] };
      return { in: inp, ev: [] };
    }
  });

  /* ===================================================================
     5. FLAG FRENZY
     =================================================================== */
  var FF_NAME = ['RED', 'WHITE'], FF_GOAL = 7;
  function ffNew(S, rnd) {
    var cs = S.tg.slice(), tg = cs.slice(), u = rnd(), f = rnd() < 0.5 ? 0 : 1, tx;
    S.tr = 0;
    if (u < 0.24 && S.n > 0) {
      tx = cs[f] ? "DON'T lower " + FF_NAME[f] + '!' : "DON'T raise " + FF_NAME[f] + '!'; S.tr = 1;
    } else if (u < 0.42) {
      tg = [1 - cs[0], 1 - cs[1]];
      tx = cs[0] === cs[1] ? (cs[0] ? 'BOTH DOWN!' : 'BOTH UP!') : 'RED ' + (tg[0] ? 'UP' : 'DOWN') + ', WHITE ' + (tg[1] ? 'UP' : 'DOWN') + '!';
    } else {
      tg[f] = 1 - cs[f]; tx = FF_NAME[f] + (tg[f] ? ' UP!' : ' DOWN!');
    }
    S.tg = tg; S.tx = tx; S.fl = [cs.slice(), cs.slice()]; S.lk = [0, 0]; S.lt = [0, 0];
    S.st = 'call'; S.ct = 0; S.win = r3(Math.max(0.9, 1.7 - S.n * 0.05)); S.n++;
  }
  function ffFlag(e) {
    if (e.t === 'key' && (e.k === 'a' || e.k === 'arrowleft')) return 0;
    if (e.t === 'key' && (e.k === 'd' || e.k === 'arrowright')) return 1;
    if (e.t === 'tap') return (e.x % 400) < 200 ? 0 : 1;
    return -1;
  }
  P.add({
    id: 'flag-flip', name: 'Flag Frenzy', icon: '🚩', cat: 'Reflex',
    howto: 'Obey the referee! Flip your RED and WHITE flags to match each call before time runs out, but watch for tricks like "DON\'T raise RED!". Each correct call scores; wrong or slow scores nothing. First to 7 wins.',
    controls: 'Red flag: A / ← · White flag: D / → (each press flips up/down)',
    duration: 45,
    init: function (rnd) { return { st: 'gap', gt: 0.4, ct: 0, win: 1.7, tg: [0, 0], tx: 'Get ready!', tr: 0, fl: [[0, 0], [0, 0]], lk: [0, 0], lt: [0, 0], n: 0, score: [0, 0], fx: [] }; },
    step: function (S, dt, inp, ev, rnd) {
      fxStep(S, dt);
      if (S.st === 'gap') {
        S.gt = r3(S.gt + dt);
        if (S.gt >= 0.8) ffNew(S, rnd);
        return;
      }
      for (var i = 0; i < 2; i++) {
        ev[WHO[i]].forEach(function (e) {
          if (S.lk[i]) return;
          var f = ffFlag(e); if (f < 0) return;
          S.fl[i][f] ^= 1;
          if (S.fl[i][f] !== S.tg[f]) { S.lk[i] = 2; S.lt[i] = S.ct; fxPush(S, { k: 'x', w: i, t: 0.6 }); }
          else if (!S.tr && S.fl[i][0] === S.tg[0] && S.fl[i][1] === S.tg[1]) { S.lk[i] = 1; S.lt[i] = S.ct; fxPush(S, { k: 'o', w: i, t: 0.6 }); }
        });
      }
      S.ct = r3(S.ct + dt);
      var done = S.ct >= S.win || (!S.tr && S.lk[0] && S.lk[1]);
      if (done) {
        for (var j = 0; j < 2; j++) {
          if (!S.lk[j]) { S.lk[j] = S.tr ? 1 : 2; S.lt[j] = S.ct; fxPush(S, { k: S.tr ? 'o' : 'x', w: j, t: 0.6 }); }
          if (S.lk[j] === 1) S.score[j]++;
        }
        S.st = 'gap'; S.gt = 0;
        var a = S.score[0], b = S.score[1];
        if ((a >= FF_GOAL || b >= FF_GOAL) && a !== b) S.result = { winner: a > b ? 'host' : 'guest', text: a + ' - ' + b + ' calls' };
      }
    },
    timeout: function (S) { return P.defaultTimeout(S); },
    draw: function (c, S, me, D, info) {
      var now = performance.now() / 1000;
      var g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#16315a'); g.addColorStop(0.45, '#1b5a3a'); g.addColorStop(1, '#0d2e1d');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      for (var s = 0; s < 8; s++) { c.fillStyle = s % 2 ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.06)'; c.fillRect(0, 230 + s * 34, W, 34); }
      /* crowd dots */
      for (var k = 0; k < 40; k++) { c.fillStyle = ['#ff5c8a', '#58c7ff', '#ffd166', '#fff'][k % 4]; c.globalAlpha = 0.25; c.beginPath(); c.arc(10 + k * 20, 210 + Math.sin(now * 5 + k) * 3 * (S.st === 'gap' ? 2 : 0.5), 7, 0, 7); c.fill(); }
      c.globalAlpha = 1;
      /* referee */
      var rx = 400, ry = 300;
      c.fillStyle = '#111'; c.fillRect(rx - 34, ry, 68, 80);
      for (var st = 0; st < 4; st++) { c.fillStyle = '#eee'; c.fillRect(rx - 34 + st * 17, ry, 8, 80); }
      D.circle(c, rx, ry - 24, 30, '#f2c79b');
      c.fillStyle = '#1a1033'; c.beginPath(); c.arc(rx - 10, ry - 28, 3.5, 0, 7); c.arc(rx + 10, ry - 28, 3.5, 0, 7); c.fill();
      D.rrect(c, rx - 6, ry - 14, 18, 9, 4, '#c0c0c8'); c.fillStyle = '#222'; c.fillRect(rx - 34, ry - 58, 68, 10);
      /* speech bubble */
      var calling = S.st === 'call', bw = 520, bh = 96, by = 96;
      var pulse = calling ? 1 + 0.05 * Math.max(0, 1 - S.ct / 0.15) : 1;
      c.save(); c.translate(400, by + bh / 2); c.scale(pulse, pulse);
      c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 20;
      D.rrect(c, -bw / 2, -bh / 2, bw, bh, 26, calling ? '#fffbea' : 'rgba(255,255,255,.75)');
      c.shadowBlur = 0; c.fillStyle = calling ? '#fffbea' : 'rgba(255,255,255,.75)'; c.beginPath(); c.moveTo(-14, bh / 2 - 2); c.lineTo(14, bh / 2 - 2); c.lineTo(0, bh / 2 + 22); c.fill();
      var txt = calling ? S.tx : S.n ? '…' : 'Get ready!';
      D.text(c, txt, 0, -4, txt.length > 15 ? 34 : 44, '#1a1033');
      c.restore();
      if (calling) D.bar(c, 260, by + bh + 34, 280, 10, 1 - S.ct / S.win, S.ct / S.win > 0.7 ? BAD : GOLD);
      /* players */
      [0, 1].forEach(function (i) {
        var px = i ? 640 : 160, py = 330, who = WHO[i], fl = S.fl[i];
        for (var f = 0; f < 2; f++) {
          var side = f ? 1 : -1, sx = px + side * 40, sy = py + 8;
          var ang = fl[f] ? -Math.PI / 2 + side * 0.35 : Math.PI / 2 - side * 0.55;
          var ex = sx + Math.cos(ang) * 84, ey = sy + Math.sin(ang) * 84;
          c.strokeStyle = '#d8b07a'; c.lineWidth = 6; c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.stroke();
          var wave = Math.sin(now * 9 + f * 2) * 5, dir = side;
          c.fillStyle = f ? '#ffffff' : '#ff3b4f'; c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 2;
          c.beginPath(); c.moveTo(ex, ey); c.quadraticCurveTo(ex + dir * 24, ey - 8 + wave, ex + dir * 48, ey + wave);
          c.lineTo(ex + dir * 48, ey + 32 + wave); c.quadraticCurveTo(ex + dir * 24, ey + 26 + wave, ex, ey + 32); c.closePath(); c.fill(); c.stroke();
          D.circle(c, sx, sy, 9, PCOL[i]);
          D.text(c, f ? 'D / →' : 'A / ←', px + side * 92, 452, 14, f ? '#fff' : '#ff8a96', 'center', 800);
        }
        D.player(c, px, py, 36, who, info.names[who], me === who);
        var lk = S.lk[i];
        if (lk && (S.st === 'call' || S.n)) {
          var fxp = 0; S.fx.forEach(function (e) { if (e.w === i && (e.k === 'o' || e.k === 'x')) fxp = 1 - e.t / 0.6; });
          var sz = 36 * (fxp > 0 && fxp < 0.25 ? 1 + (0.25 - fxp) * 2 : 1);
          D.circle(c, px, py - 92, sz, lk === 1 ? GOOD : BAD, 18);
          D.text(c, lk === 1 ? '✓' : '✕', px, py - 90, sz * 1.1, '#fff');
          if (lk === 1 && fxp > 0) burst(c, px, py - 92, fxp, GOLD, 12, 70, 5, 0);
        }
        for (var p = 0; p < FF_GOAL; p++) D.circle(c, px - 66 + p * 22, 482, 8, p < S.score[i] ? PCOL[i] : 'rgba(255,255,255,.15)', p < S.score[i] ? 10 : 0);
      });
      var sd = S.score[0] >= FF_GOAL - 1 && S.score[0] === S.score[1] && S.score[0] >= FF_GOAL;
      D.hud(c, info, S.score[0], S.score[1], sd ? 'SUDDEN DEATH! Next correct call wins' : 'First to ' + FF_GOAL + ' · obey the referee (beware tricks!)');
    },
    bot: function (S, me, rnd) {
      var i = me === 'host' ? 0 : 1, inp = P.emptyIn();
      if (S.st !== 'call' || S.lk[i]) return { in: inp, ev: [] };
      var keys = ['a', 'd'];
      if (S.tr) {
        if (S.ct > 0.2 && S.ct < 0.7 && rnd() < 0.012) return { in: inp, ev: [{ t: 'key', k: keys[rnd() < 0.5 ? 0 : 1] }] };
        return { in: inp, ev: [] };
      }
      if (S.ct > 0.28 && rnd() < 0.4) {
        var f = S.fl[i][0] !== S.tg[0] ? 0 : 1;
        if (rnd() < 0.06) f = 1 - f;
        return { in: inp, ev: [{ t: 'key', k: keys[f] }] };
      }
      return { in: inp, ev: [] };
    }
  });

  /* ===================================================================
     6. MOLE MASH
     =================================================================== */
  var MM_KIND = [{ v: 1, life: 1.1 }, { v: 3, life: 0.8 }, { v: -2, life: 1.5 }];
  function mmXY(h) { return [400 + (h % 3 - 1) * 160, 178 + Math.floor(h / 3) * 112]; }
  function mmKeyHole(k) { var n = +k; if (!(n >= 1 && n <= 9) || String(n) !== k) return -1; return (2 - Math.floor((n - 1) / 3)) * 3 + (n - 1) % 3; }
  function mmHoleKey(h) { return String((2 - Math.floor(h / 3)) * 3 + h % 3 + 1); }
  P.add({
    id: 'whack-a-mole', name: 'Mole Mash', icon: '🔨', cat: 'Reflex',
    howto: 'Moles pop out of 9 shared holes. Whack them first: brown +1, golden +3, but bombs cost 2 and stun you! Whacking an empty hole stuns you briefly. Most points wins.',
    controls: 'Whack: number keys 1-9 (numpad layout) · or click a hole',
    duration: 30,
    init: function (rnd) { return { t: 0, m: [], sp: 0.5, id: 0, score: [0, 0], stn: [0, 0], hm: [[-1, 0], [-1, 0]], fx: [] }; },
    step: function (S, dt, inp, ev, rnd) {
      fxStep(S, dt);
      S.t = r3(S.t + dt);
      S.sp -= dt;
      if (S.sp <= 0 && S.m.length < 4) {
        S.sp = Math.max(0.22, 0.5 - S.t * 0.008) + rnd() * 0.25;
        var free = []; for (var h = 0; h < 9; h++) if (!S.m.some(function (m) { return m.h === h; })) free.push(h);
        if (free.length) {
          var u = rnd(), k = u < 0.13 ? 1 : u < 0.31 ? 2 : 0;
          S.m.push({ i: S.id++, h: free[Math.floor(rnd() * free.length)], k: k, t: 0, life: r3(MM_KIND[k].life * (1 - S.t / 90)) });
        }
      }
      var claims = {}, empties = [[], []];
      for (var i = 0; i < 2; i++) {
        S.stn[i] = Math.max(0, r3(S.stn[i] - dt));
        if (S.hm[i][1] > 0) S.hm[i][1] = Math.max(0, r3(S.hm[i][1] - dt));
        if (S.stn[i] > 0) continue;
        var holes = [];
        ev[WHO[i]].forEach(function (e) {
          var hh = -1;
          if (e.t === 'key') hh = mmKeyHole(e.k);
          else if (e.t === 'tap') for (var q = 0; q < 9; q++) { var p = mmXY(q); if (Math.abs(e.x - p[0]) < 70 && Math.abs(e.y - p[1] + 25) < 55) hh = q; }
          if (hh >= 0 && holes.indexOf(hh) < 0) holes.push(hh);
        });
        holes.slice(0, 2).forEach(function (hh) {
          S.hm[i] = [hh, 0.25];
          var mole = null; S.m.forEach(function (m) { if (m.h === hh) mole = m; });
          if (mole) (claims[mole.i] = claims[mole.i] || [0, 0])[i] = 1;
          else empties[i].push(hh);
        });
      }
      for (var e2 = 0; e2 < 2; e2++) if (empties[e2].length) { S.stn[e2] = 0.4; fxPush(S, { k: 'e', h: empties[e2][0], w: e2, t: 0.4 }); }
      S.m = S.m.filter(function (m) {
        var c = claims[m.i];
        if (c) {
          var w = c[0] && c[1] ? (rnd() < 0.5 ? 0 : 1) : c[0] ? 0 : 1;
          var v = MM_KIND[m.k].v; S.score[w] += v;
          if (m.k === 2) S.stn[w] = 0.9;
          fxPush(S, { k: m.k === 2 ? 'b' : 'w', h: m.h, w: w, v: v, g: m.k, t: 0.7 });
          return false;
        }
        m.t = r3(m.t + dt);
        return m.t < m.life;
      });
    },
    timeout: function (S) { return P.defaultTimeout(S); },
    draw: function (c, S, me, D, info) {
      var now = performance.now() / 1000;
      c.save();
      var shake = 0; S.fx.forEach(function (f) { if (f.k === 'b' && f.t > 0.5) shake = 6; });
      if (shake) c.translate(Math.sin(now * 70) * shake, Math.cos(now * 50) * shake);
      var g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2f7d3a'); g.addColorStop(1, '#174d22');
      c.fillStyle = g; c.fillRect(-10, -10, W + 20, H + 20);
      for (var s = 0; s < 14; s++) { c.fillStyle = s % 2 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.04)'; c.fillRect(s * 60, 0, 60, H); }
      for (var t = 0; t < 60; t++) { var tx = (t * 131) % W, ty = 80 + (t * 71) % 410; c.strokeStyle = 'rgba(120,220,120,.35)'; c.lineWidth = 2; c.beginPath(); c.moveTo(tx, ty); c.lineTo(tx - 3, ty - 9); c.moveTo(tx + 4, ty); c.lineTo(tx + 6, ty - 8); c.stroke(); }
      for (var h = 0; h < 9; h++) {
        var p = mmXY(h), x = p[0], y = p[1];
        c.fillStyle = '#6b4423'; c.beginPath(); c.ellipse(x, y + 4, 64, 24, 0, 0, 7); c.fill();
        c.fillStyle = '#1e1208'; c.beginPath(); c.ellipse(x, y, 52, 17, 0, 0, 7); c.fill();
        var mole = null; S.m.forEach(function (m) { if (m.h === h) mole = m; });
        if (mole) {
          var up = Math.min(1, mole.t / 0.1, (mole.life - mole.t) / 0.12), my = y - 10 + (1 - up) * 70;
          c.save(); c.beginPath(); c.rect(x - 70, y - 130, 140, 130); c.clip();
          if (mole.k === 2) bomb(c, D, x, my - 26, 30, now);
          else {
            var body = mole.k === 1 ? '#f5b31f' : '#8a5a34';
            if (mole.k === 1) { c.shadowColor = GOLD; c.shadowBlur = 30; }
            D.rrect(c, x - 34, my - 62, 68, 90, 32, body); c.shadowBlur = 0;
            D.rrect(c, x - 20, my - 30, 40, 40, 18, mole.k === 1 ? '#ffe6a0' : '#c99b72');
            c.fillStyle = '#1a1033'; c.beginPath(); c.arc(x - 12, my - 40, 5, 0, 7); c.arc(x + 12, my - 40, 5, 0, 7); c.fill();
            c.fillStyle = '#fff'; c.beginPath(); c.arc(x - 10, my - 42, 2, 0, 7); c.arc(x + 14, my - 42, 2, 0, 7); c.fill();
            c.fillStyle = '#ff8fa8'; c.beginPath(); c.ellipse(x, my - 26, 8, 6, 0, 0, 7); c.fill();
            c.fillStyle = '#fff'; c.fillRect(x - 6, my - 18, 5, 7); c.fillRect(x + 1, my - 18, 5, 7);
            if (mole.k === 1) { star(c, x, my - 72, 14, '#fff6b0'); D.otext(c, '3', x, my - 70, 14, '#7a4a00'); }
          }
          c.restore();
        }
        c.strokeStyle = '#8a5a30'; c.lineWidth = 6; c.beginPath(); c.ellipse(x, y + 2, 56, 19, 0, 0.05 * Math.PI, 0.95 * Math.PI); c.stroke();
        D.circle(c, x + 58, y + 22, 13, 'rgba(255,255,255,.85)');
        D.text(c, mmHoleKey(h), x + 58, y + 23, 15, '#1a3a1a');
      }
      S.fx.forEach(function (f) {
        var p = mmXY(f.h), x = p[0], y = p[1] - 40;
        if (f.k === 'w') { var q = 1 - f.t / 0.7; burst(c, x, y, q, f.g === 1 ? GOLD : '#fff', 10, 80, 6, f.h); star(c, x, y, 26 * (1 - q), 'rgba(255,255,255,' + (1 - q) + ')'); popText(c, D, '+' + f.v, x, y - 20, q, PCOL[f.w], f.v > 1 ? 36 : 28); }
        if (f.k === 'b') { var qb = 1 - f.t / 0.7; c.globalAlpha = Math.max(0, 1 - qb); D.circle(c, x, y, 20 + qb * 70, '#ff9f43', 30); c.globalAlpha = 1; burst(c, x, y, qb, GOLD, 14, 110, 7, 0.2); popText(c, D, f.v + '', x, y - 30, qb, BAD, 36); }
        if (f.k === 'e') { var qe = 1 - f.t / 0.4; c.globalAlpha = 1 - qe; D.otext(c, 'miss!', x, y + 20 - qe * 20, 18, '#d9d3ff'); c.globalAlpha = 1; }
      });
      /* hammers */
      [0, 1].forEach(function (i) {
        var hm = S.hm[i]; if (hm[0] < 0 || hm[1] <= 0) return;
        var p = mmXY(hm[0]), q = hm[1] / 0.25, side = i ? 1 : -1;
        c.save(); c.translate(p[0] + side * 40, p[1] - 40); c.rotate(side * (0.2 + q * 1.1));
        c.fillStyle = '#c99b5a'; c.fillRect(-4, -60, 8, 60);
        D.rrect(c, -26, -78, 52, 30, 8, PCOL[i], '#fff');
        c.restore();
      });
      [0, 1].forEach(function (i) {
        var ax = i ? 718 : 82, ay = 290, who = WHO[i];
        D.player(c, ax, ay, 34, who, info.names[who], me === who);
        if (S.stn[i] > 0) {
          for (var k = 0; k < 3; k++) { var a = now * 6 + k * 2.1; star(c, ax + Math.cos(a) * 30, ay - 46 + Math.sin(a) * 8, 9, GOLD); }
          D.otext(c, 'STUNNED', ax, ay + 56, 16, BAD);
        }
      });
      c.restore();
      D.hud(c, info, S.score[0], S.score[1], 'Brown +1 · Golden +3 · Bomb −2 · keys 1-9 like a numpad');
    },
    bot: function (S, me, rnd) {
      var i = me === 'host' ? 0 : 1, inp = P.emptyIn();
      if (S.stn[i] > 0) return { in: inp, ev: [] };
      var best = null;
      S.m.forEach(function (m) { if (m.k !== 2 && m.t > 0.18 && m.t < m.life - 0.04 && (!best || m.k === 1)) best = m; });
      if (best && rnd() < 0.35) return { in: inp, ev: [{ t: 'key', k: mmHoleKey(best.h) }] };
      return { in: inp, ev: [] };
    }
  });
})();
