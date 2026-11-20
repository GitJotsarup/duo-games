/* Pong Royale - standalone game: Pong meets Breakout.
   Simulation: field FW x FL, host paddle near y=FL (bottom), guest near y=0 (top).
   Each goal is guarded by a 3x11 brick fortress. Guest renders the field rotated 180 degrees. */
(function () {
  var P = window.PARTY;
  var FX = 180, FY = 68, FW = 440, FL = 424, BW = 40, BH = 12, NC = 11, NR = 3, NB = NC * NR;
  var PY = [FL - 60, 60], PT = 5, R = 6, SP0 = 280, SPMAX = 560, SPCAP = 660, WIN = 5;
  /* power-up types: W wide, M multi, F fire, L laser, R rebuild, S shield, K shrink(att), V reverse(att), U speed(att) */
  var TYPES = 'WMFLRSKVU';
  var PU = {
    W: { i: '↔', l: 'WIDE', c: '#4ade80' }, M: { i: '⁂', l: 'MULTI', c: '#ffd166' }, F: { i: '🔥', l: 'FIRE', c: '#ff8c2a' },
    L: { i: '⚡', l: 'LASER', c: '#ff4d6d' }, R: { i: '🧱', l: 'REBUILD', c: '#e0b07a' }, S: { i: '🛡', l: 'SHIELD', c: '#5ef0e0' },
    K: { i: '🔻', l: 'SHRINK', c: '#b26bff' }, V: { i: '🔄', l: 'REVERSE', c: '#b26bff' }, U: { i: '⏩', l: 'SPEED', c: '#b26bff' }
  };
  var ROWC = [['#ff3d7f', '#ff74a6', '#d46bff'], ['#2fb8ff', '#6fd8ff', '#7a8bff']];

  function r1(v) { return Math.round(v * 10) / 10; }
  function mirIdx(k) { var r = Math.floor(k / NC), c = k % NC; return r * NC + (NC - 1 - c); }
  function setCh(s, k, ch) { return s.substring(0, k) + ch + s.substring(k + 1); }
  function pw(S, i) { var e = S.e[i]; return e[0] > 0 && e[3] <= 0 ? 128 : e[3] > 0 && e[0] <= 0 ? 52 : 84; }
  function brickRect(s, k) { /* sim rect [x0,y0,x1,y1] of brick k on side s (row 0 touches the goal line) */
    var r = Math.floor(k / NC), c = k % NC;
    return s === 0 ? [c * BW, FL - BH * (r + 1), c * BW + BW, FL - BH * r] : [c * BW, BH * r, c * BW + BW, BH * (r + 1)];
  }
  function count(s) { var n = 0; for (var k = 0; k < NB; k++) if (s[k] !== '.') n++; return n; }
  function hsh(n) { n = Math.imul((n | 0) ^ 0x9e3779b9, 0x85ebca6b); n ^= n >>> 13; n = Math.imul(n, 0xc2b2ae35); n ^= n >>> 16; return (n >>> 0) / 4294967296; }

  function burst(S, x, y, s) { S.px.push({ x: r1(x), y: r1(y), s: s, t: 0.5 }); while (S.px.length > 16) S.px.shift(); }
  function pop(S, x, y, txt, w) { S.pp.push({ x: r1(x), y: r1(y), s: txt, w: w, t: 1.1 }); while (S.pp.length > 5) S.pp.shift(); }

  function breakBrick(S, s, k) {
    var ch = S.bk[s][k], q = brickRect(s, k), cx = (q[0] + q[2]) / 2, cy = (q[1] + q[3]) / 2;
    S.bk[s] = setCh(S.bk[s], k, '.');
    burst(S, cx, cy, ch === 'o' ? s : 2);
    if (ch !== 'o' && S.cap.length < 6) S.cap.push({ x: r1(cx), y: r1(cy), k: ch, to: 1 - s });
  }
  function hitBrick(S, b, fire) { /* returns true if the ball bounced */
    var s = b.y < FL / 2 ? 1 : 0;
    if (s === 0 && b.y + R < FL - BH * NR) return false;
    if (s === 1 && b.y - R > BH * NR) return false;
    var best = -1, bd = 1e9, bnx = 0, bny = 0;
    var c0 = Math.max(0, Math.floor((b.x - R) / BW)), c1 = Math.min(NC - 1, Math.floor((b.x + R) / BW));
    for (var r = 0; r < NR; r++) for (var c = c0; c <= c1; c++) {
      var k = r * NC + c; if (S.bk[s][k] === '.') continue;
      var q = brickRect(s, k), nx = Math.max(q[0], Math.min(b.x, q[2])), ny = Math.max(q[1], Math.min(b.y, q[3]));
      var d = (b.x - nx) * (b.x - nx) + (b.y - ny) * (b.y - ny);
      if (d < R * R && d < bd) { bd = d; best = k; bnx = nx; bny = ny; }
    }
    if (best < 0) return false;
    breakBrick(S, s, best);
    if (fire) return false;
    var dx = b.x - bnx, dy = b.y - bny;
    if (Math.abs(dx) > Math.abs(dy)) b.vx = (dx > 0 ? 1 : -1) * Math.abs(b.vx);
    else if (dy !== 0) b.vy = (dy > 0 ? 1 : -1) * Math.abs(b.vy);
    else b.vy = (s === 0 ? -1 : 1) * Math.abs(b.vy);
    return true;
  }
  function paddleHit(S, b, i) {
    var px = S.p[i], half = pw(S, i) / 2, py = PY[i], dir = i === 0 ? 1 : -1; /* dir = direction toward this player's goal */
    if (b.vy * dir <= 0) return false;
    if (Math.abs(b.y - py) > PT + R || (b.y - py) * dir > 0) return false;
    if (Math.abs(b.x - px) > half + R) return false;
    var o = Math.max(-1, Math.min(1, (b.x - px) / (half + R))), a = o * 1.05;
    var sp = Math.min(SPMAX, Math.max(SP0, Math.hypot(b.vx, b.vy)) + 14);
    b.vx = sp * Math.sin(a); b.vy = -dir * sp * Math.cos(a); b.o = i;
    b.y = py - dir * (PT + R);
    S.hc++;
    return true;
  }
  function launch(S, rnd) {
    var i = S.sv.w, dir = i === 0 ? -1 : 1, a = (rnd() - 0.5) * 0.7;
    S.b.push({ x: S.p[i], y: PY[i] + dir * (PT + R + 1), vx: r1(SP0 * Math.sin(a)), vy: r1(dir * SP0 * Math.cos(a)), o: i });
    S.sv = null;
  }
  function goal(S, scorer) {
    S.score[scorer]++;
    S.gl = { t: 1.5, w: scorer };
    S.b = []; S.cap = []; S.lz = [];
    if (S.score[scorer] >= WIN) S.fin = 1.4;
    else S.sv = { w: 1 - scorer, t: 3.2 }; /* the conceding player serves */
  }
  function apply(S, i, k, rnd) {
    var j = 1 - i, e = S.e;
    if (k === 'W') e[i][0] = 10;
    else if (k === 'F') e[i][1] = 7;
    else if (k === 'L') e[i][2] = 8;
    else if (k === 'S') e[i][5] = 1;
    else if (k === 'K') e[j][3] = 8;
    else if (k === 'V') e[j][4] = 3;
    else if (k === 'M') {
      var dir = i === 0 ? -1 : 1;
      for (var n = 0; n < 2 && S.b.length < 5; n++) {
        var a = n ? 0.5 : -0.5;
        S.b.push({ x: S.p[i], y: PY[i] + dir * (PT + R + 2), vx: r1(320 * Math.sin(a)), vy: r1(dir * 320 * Math.cos(a)), o: i });
      }
    } else if (k === 'R') {
      var emp = []; for (var q = 0; q < NB; q++) if (S.bk[i][q] === '.') emp.push(q);
      for (var m = 0; m < 4 && emp.length; m++) { var z = Math.floor(rnd() * emp.length); S.bk[i] = setCh(S.bk[i], emp[z], 'o'); emp.splice(z, 1); }
    } else if (k === 'U') {
      S.b.forEach(function (b) {
        if (b.vy * (j === 0 ? 1 : -1) > 0) { var sp = Math.hypot(b.vx, b.vy), ns = Math.min(SPCAP, sp * 1.35); b.vx *= ns / sp; b.vy *= ns / sp; }
      });
    }
    pop(S, S.p[i], PY[i] + (i === 0 ? -26 : 26), PU[k].l + '!', i);
  }

  P.standalone({
    id: 'pong-royale', name: 'Pong Royale', icon: '🏓', cat: 'Action',
    blurb: 'Pong meets Breakout: smash through their brick fortress, grab power-ups, first to 5 goals.',
    howto: 'Bounce the ball past your rival: it has to smash through their brick fortress before it can score. Break glowing bricks and catch the capsules that fly to you for power-ups and attacks. First to 5 goals wins!',
    controls: 'Move: ←/→, A/D or mouse · Serve / fire lasers: Space or click',
    duration: 240,
    init: function (rnd) {
      var h = '';
      for (var k = 0; k < NB; k++) h += 'o';
      for (var n = 0; n < 6; n++) {
        var idx = Math.floor(rnd() * NB), tries = 0;
        while (h[idx] !== 'o' && tries++ < 20) idx = Math.floor(rnd() * NB);
        h = setCh(h, idx, TYPES[Math.floor(rnd() * TYPES.length)]);
      }
      var g = ''; for (var q = 0; q < NB; q++) g += h[mirIdx(q)];
      return {
        score: [0, 0], p: [FW / 2, FW / 2], bk: [h, g], b: [], cap: [], lz: [],
        e: [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]], lc: [0, 0], mp: [400, 400], mm: [0, 0],
        sv: { w: rnd() < 0.5 ? 0 : 1, t: 2.2 }, hc: 0, bs: Math.floor(rnd() * 100000), pt: 18,
        px: [], pp: [], gl: null, fin: 0
      };
    },
    step: function (S, dt, inp, ev, rnd) {
      if (S.result) return;
      var i, n;
      S.px = S.px.filter(function (p) { p.t = Math.round((p.t - dt) * 100) / 100; return p.t > 0; });
      S.pp = S.pp.filter(function (p) { p.t = Math.round((p.t - dt) * 100) / 100; return p.t > 0; });
      if (S.gl) { S.gl.t = Math.round((S.gl.t - dt) * 100) / 100; if (S.gl.t <= 0) S.gl = null; }
      if (S.fin > 0) {
        S.fin -= dt;
        if (S.fin <= 0) S.result = { winner: S.score[0] > S.score[1] ? 'host' : 'guest', text: S.score[0] + ' - ' + S.score[1] + ' goals' };
        return;
      }
      for (i = 0; i < 2; i++) for (n = 0; n < 5; n++) if (S.e[i][n] > 0) S.e[i][n] = Math.max(0, Math.round((S.e[i][n] - dt) * 100) / 100);
      /* paddles + actions */
      for (i = 0; i < 2; i++) {
        var who = i ? 'guest' : 'host', k = inp[who] || P.emptyIn(), evs = ev[who] || [];
        var rev = S.e[i][4] > 0, half = pw(S, i) / 2;
        if (typeof k.px === 'number' && k.px !== S.mp[i]) { S.mp[i] = k.px; S.mm[i] = 1; }
        var dir = (k.right ? 1 : 0) - (k.left ? 1 : 0);
        if (dir) S.mm[i] = 0;
        if (i === 1) dir = -dir;           /* guest sees the field rotated */
        if (rev) dir = -dir;
        if (S.mm[i]) {
          var tx = i ? FX + FW - S.mp[i] : S.mp[i] - FX;
          if (rev) tx = FW - tx;
          var d = tx - S.p[i], mx = 900 * dt;
          S.p[i] += Math.max(-mx, Math.min(mx, d));
        } else S.p[i] += dir * 420 * dt;
        S.p[i] = r1(Math.max(half, Math.min(FW - half, S.p[i])));
        if (S.lc[i] > 0) S.lc[i] = Math.max(0, Math.round((S.lc[i] - dt) * 100) / 100);
        var act = evs.some(function (x) { return x.t === 'a' || x.t === 'tap'; });
        if (act) {
          if (S.sv && S.sv.w === i) { if (S.sv.t < 2.2) launch(S, rnd); }
          else if (S.e[i][2] > 0 && S.lc[i] <= 0 && S.lz.length < 10) {
            var ly = PY[i] + (i === 0 ? -PT : PT), lv = i === 0 ? -1 : 1;
            S.lz.push({ x: r1(S.p[i] - half + 6), y: ly, d: lv }, { x: r1(S.p[i] + half - 6), y: ly, d: lv });
            S.lc[i] = 0.35;
          }
        }
      }
      if (S.sv) { S.sv.t = Math.round((S.sv.t - dt) * 100) / 100; if (S.sv.t <= 0) launch(S, rnd); }
      /* balls: fixed-step with small swept sub-steps (<= 4 px) so nothing tunnels */
      var scored = -1;
      for (var bi = 0; bi < S.b.length && scored < 0; bi++) {
        var b = S.b[bi], fire = S.e[b.o][1] > 0;
        var steps = Math.max(1, Math.ceil(Math.hypot(b.vx, b.vy) * dt / 4)), sdt = dt / steps;
        for (n = 0; n < steps; n++) {
          b.x += b.vx * sdt; b.y += b.vy * sdt;
          if (b.x < R) { b.x = R; b.vx = Math.abs(b.vx); }
          if (b.x > FW - R) { b.x = FW - R; b.vx = -Math.abs(b.vx); }
          if (paddleHit(S, b, 0) || paddleHit(S, b, 1)) continue;
          hitBrick(S, b, fire);
          if (b.vy > 0 && b.y + R >= FL && S.e[0][5]) { S.e[0][5] = 0; b.y = FL - R; b.vy = -Math.abs(b.vy); burst(S, b.x, FL, 3); }
          if (b.vy < 0 && b.y - R <= 0 && S.e[1][5]) { S.e[1][5] = 0; b.y = R; b.vy = Math.abs(b.vy); burst(S, b.x, 0, 3); }
          if (b.y > FL + R) { scored = 1; break; }
          if (b.y < -R) { scored = 0; break; }
        }
      }
      if (scored >= 0) goal(S, scored);
      /* lasers */
      S.lz = S.lz.filter(function (z) {
        var tgt = z.d < 0 ? 1 : 0;
        for (var m = 0; m < 4; m++) {
          z.y += z.d * 150 * dt;
          if (z.y < 0 || z.y > FL) return false;
          var c = Math.floor(z.x / BW), r = tgt === 1 ? Math.floor(z.y / BH) : Math.floor((FL - z.y) / BH);
          if (c >= 0 && c < NC && r >= 0 && r < NR && S.bk[tgt][r * NC + c] !== '.') { breakBrick(S, tgt, r * NC + c); return false; }
        }
        z.y = r1(z.y); return true;
      });
      /* capsules travel toward the player who broke the brick */
      S.cap = S.cap.filter(function (c) {
        var to = c.to, dir = to === 0 ? 1 : -1;
        c.y = r1(c.y + dir * 170 * dt);
        if (Math.abs(c.y - PY[to]) < 12 && Math.abs(c.x - S.p[to]) < pw(S, to) / 2 + 14) { apply(S, to, c.k, rnd); return false; }
        return c.y > -10 && c.y < FL + 10;
      });
      /* every ~18 s a mirrored pair of bricks turns into power-ups */
      S.pt -= dt;
      if (S.pt <= 0) {
        S.pt = 18;
        for (var tr = 0; tr < 12; tr++) {
          var q = Math.floor(rnd() * NB), mq = mirIdx(q);
          if (S.bk[0][q] === 'o' && S.bk[1][mq] === 'o') { var ty = TYPES[Math.floor(rnd() * TYPES.length)]; S.bk[0] = setCh(S.bk[0], q, ty); S.bk[1] = setCh(S.bk[1], mq, ty); break; }
        }
      }
      S.pt = Math.round(S.pt * 100) / 100;
      S.b.forEach(function (b) { b.x = r1(b.x); b.y = r1(b.y); b.vx = r1(b.vx); b.vy = r1(b.vy); });
    },
    timeout: function (S) {
      var a = S.score[0], g = S.score[1];
      return { winner: a > g ? 'host' : g > a ? 'guest' : 'tie', text: a + ' - ' + g + ' goals' };
    },
    draw: function (c, S, me, D, info) {
      var mi = me === 'guest' ? 1 : 0, gst = mi === 1, now = performance.now() / 1000, COL = D.COL;
      var PC = [COL.host, COL.guest];
      function X(x) { return gst ? FX + FW - x : FX + x; }
      function Y(y) { return gst ? FY + FL - y : FY + y; }
      function RR(x0, y0, x1, y1, rad, fill, stroke) {
        var a = X(x0), b = X(x1), p = Y(y0), q = Y(y1);
        D.rrect(c, Math.min(a, b), Math.min(p, q), Math.abs(b - a), Math.abs(q - p), rad, fill, stroke);
      }
      D.bg(c, '#1a1146', '#05041a');
      c.save();
      if (S.gl && S.gl.t > 0.9) { var sh = (S.gl.t - 0.9) * 14; c.translate(Math.sin(now * 90) * sh, Math.cos(now * 70) * sh); }
      /* field */
      c.save(); c.shadowColor = '#9b6bff'; c.shadowBlur = 24;
      D.rrect(c, FX - 6, FY - 6, FW + 12, FL + 12, 14, 'rgba(6,4,24,.92)', 'rgba(155,107,255,.8)');
      c.restore();
      c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = 2; c.setLineDash([10, 10]);
      c.beginPath(); c.moveTo(FX, FY + FL / 2); c.lineTo(FX + FW, FY + FL / 2); c.stroke(); c.setLineDash([]);
      c.strokeStyle = 'rgba(255,255,255,.08)'; c.beginPath(); c.arc(FX + FW / 2, FY + FL / 2, 46, 0, 7); c.stroke();
      /* goal lines (glow in the defender's colour) + shields */
      for (var s = 0; s < 2; s++) {
        var gy = Y(s === 0 ? FL : 0);
        c.save(); c.shadowColor = PC[s]; c.shadowBlur = 18; c.strokeStyle = PC[s]; c.lineWidth = 3;
        c.beginPath(); c.moveTo(FX, gy); c.lineTo(FX + FW, gy); c.stroke(); c.restore();
        if (S.e[s][5]) {
          var sy = Y(s === 0 ? FL - 2 : 2);
          c.save(); c.shadowColor = '#5ef0e0'; c.shadowBlur = 20; c.strokeStyle = 'rgba(94,240,224,' + (0.7 + 0.3 * Math.sin(now * 8)) + ')'; c.lineWidth = 5;
          c.beginPath(); c.moveTo(FX, sy); c.lineTo(FX + FW, sy); c.stroke(); c.restore();
        }
      }
      /* bricks */
      for (s = 0; s < 2; s++) for (var k = 0; k < NB; k++) {
        var ch = S.bk[s][k]; if (ch === '.') continue;
        var q = brickRect(s, k), row = Math.floor(k / NC);
        if (ch === 'o') {
          RR(q[0] + 1.5, q[1] + 1.5, q[2] - 1.5, q[3] - 1.5, 3, ROWC[s][row]);
          RR(q[0] + 4, q[1] + 3.5, q[2] - 4, q[3] - 7.5 > q[1] + 3.5 ? q[3] - 7.5 : q[1] + 5, 2, 'rgba(255,255,255,.35)');
        } else {
          var pu = PU[ch], gl = 10 + 8 * Math.sin(now * 6 + k);
          c.save(); c.shadowColor = pu.c; c.shadowBlur = gl;
          RR(q[0] + 1.5, q[1] + 1.5, q[2] - 1.5, q[3] - 1.5, 3, '#2a1d4a', pu.c);
          c.restore();
          D.text(c, pu.i, X((q[0] + q[2]) / 2), Y((q[1] + q[3]) / 2) + 1, 11, pu.c);
        }
      }
      /* particles */
      S.px.forEach(function (p, pi) {
        var f = 1 - p.t / 0.5, col = p.s === 2 ? '#ffd166' : p.s === 3 ? '#5ef0e0' : ROWC[p.s][1];
        c.globalAlpha = Math.max(0, p.t / 0.5); c.fillStyle = col;
        for (var a = 0; a < 8; a++) {
          var an = a * 0.785 + pi, dd = 6 + f * 46;
          c.fillRect(X(p.x) + Math.cos(an) * dd - 2.5, Y(p.y) + Math.sin(an) * dd - 2.5, 5, 5);
        }
        c.globalAlpha = 1;
      });
      /* lasers */
      S.lz.forEach(function (z) {
        c.save(); c.shadowColor = '#ff4d6d'; c.shadowBlur = 12; c.strokeStyle = '#ffb3c1'; c.lineWidth = 3;
        c.beginPath(); c.moveTo(X(z.x), Y(z.y)); c.lineTo(X(z.x), Y(z.y - z.d * 14)); c.stroke(); c.restore();
      });
      /* capsules */
      S.cap.forEach(function (cp) {
        var pu = PU[cp.k], cx = X(cp.x), cy = Y(cp.y);
        c.save(); c.shadowColor = pu.c; c.shadowBlur = 16;
        D.rrect(c, cx - 38, cy - 11, 76, 22, 11, 'rgba(20,12,44,.95)', pu.c); c.restore();
        D.text(c, pu.i, cx - 25, cy + 1, 12, pu.c);
        D.text(c, pu.l, cx + 7, cy + 1, 11, '#fff', 'center', 800);
      });
      /* paddles */
      for (s = 0; s < 2; s++) {
        var half = pw(S, s) / 2, pxx = S.p[s];
        c.save(); c.shadowColor = PC[s]; c.shadowBlur = 22;
        RR(pxx - half, PY[s] - PT, pxx + half, PY[s] + PT, 5, PC[s], s === mi ? '#ffffff' : null);
        c.restore();
        RR(pxx - half + 6, PY[s] - 1.5, pxx + half - 6, PY[s] + 1.5, 1.5, 'rgba(255,255,255,.55)');
        if (S.e[s][2] > 0) {
          var dd = s === 0 ? -1 : 1;
          RR(pxx - half + 2, PY[s] + dd * PT, pxx - half + 10, PY[s] + dd * (PT + 7), 2, '#ff4d6d');
          RR(pxx + half - 10, PY[s] + dd * PT, pxx + half - 2, PY[s] + dd * (PT + 7), 2, '#ff4d6d');
        }
        if (S.e[s][4] > 0) D.otext(c, '🔄', X(pxx), Y(PY[s] + (s === 0 ? 20 : -20)), 16, '#b26bff');
      }
      /* balls with trails */
      var balls = S.b.slice();
      if (S.sv) balls = [{ x: S.p[S.sv.w], y: PY[S.sv.w] + (S.sv.w === 0 ? -(PT + R + 1) : PT + R + 1), vx: 0, vy: 0, o: S.sv.w }];
      balls.forEach(function (b) {
        var fire = S.e[b.o][1] > 0, col = fire ? '#ff8c2a' : '#ffffff';
        for (var t = 6; t >= 1; t--) {
          c.globalAlpha = 0.09 * (7 - t); c.fillStyle = fire ? '#ffb347' : PC[b.o];
          c.beginPath(); c.arc(X(b.x - b.vx * t * 0.011), Y(b.y - b.vy * t * 0.011), R * (1 - t * 0.09), 0, 7); c.fill();
        }
        c.globalAlpha = 1;
        D.circle(c, X(b.x), Y(b.y), R + 1, col, 18);
      });
      /* pops */
      S.pp.forEach(function (p) {
        c.globalAlpha = Math.min(1, p.t * 2); D.otext(c, p.s, X(p.x), Y(p.y) - (1.1 - p.t) * 30, 20, PC[p.w]); c.globalAlpha = 1;
      });
      c.restore();
      /* serve prompt */
      if (S.sv && !S.gl) {
        var mine = S.sv.w === mi;
        D.otext(c, mine ? 'Press SPACE to serve' : 'Waiting for ' + info.names[S.sv.w ? 'guest' : 'host'] + '...', FX + FW / 2, FY + FL / 2 + (mine ? 60 : -60), 20, mine ? COL.gold : COL.dim);
      }
      if (S.e[mi][4] > 0) D.otext(c, 'CONTROLS REVERSED!', FX + FW / 2, FY + FL / 2 + 30, 22, '#c99bff');
      if (S.gl) {
        var gt = S.gl.t, sc = 1 + Math.max(0, gt - 1.2) * 2;
        c.globalAlpha = Math.min(1, gt * 2);
        D.otext(c, 'GOAL!', FX + FW / 2, FY + FL / 2 - 10, 72 * sc, PC[S.gl.w]);
        D.otext(c, info.names[S.gl.w ? 'guest' : 'host'] + ' scores  ' + S.score[0] + ' - ' + S.score[1], FX + FW / 2, FY + FL / 2 + 46, 20, '#fff');
        c.globalAlpha = 1;
      }
      /* side panels: host left, guest right (matching the HUD) */
      for (s = 0; s < 2; s++) {
        var x0 = s === 0 ? 16 : 634, x1 = x0 + 150;
        D.rrect(c, x0, 76, 150, 416, 18, 'rgba(14,10,40,.8)', s === 0 ? 'rgba(255,92,138,.5)' : 'rgba(88,199,255,.5)');
        D.text(c, s === mi ? 'YOU · bottom' : 'RIVAL · top', x0 + 75, 96, 13, s === mi ? '#fff' : COL.dim, 'center', 700);
        D.text(c, 'GOALS', x0 + 75, 120, 12, COL.dim, 'center', 700);
        for (var g = 0; g < WIN; g++) {
          var gx = x0 + 27 + g * 24;
          if (g < S.score[s]) D.circle(c, gx, 142, 9, PC[s], 12);
          else { c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 2; c.beginPath(); c.arc(gx, 142, 8, 0, 7); c.stroke(); }
        }
        var nb = count(S.bk[s]);
        D.text(c, 'FORTRESS ' + nb + '/' + NB, x0 + 75, 172, 12, COL.dim, 'center', 700);
        D.bar(c, x0 + 14, 182, 122, 10, nb / NB, nb > 10 ? PC[s] : COL.bad);
        var yy = 214, list = [[0, 'W', 10], [1, 'F', 7], [2, 'L', 8], [5, 'S', 1], [3, 'K', 8], [4, 'V', 3]];
        list.forEach(function (it) {
          var v = S.e[s][it[0]]; if (!(v > 0)) return;
          var pu = PU[it[1]];
          D.rrect(c, x0 + 10, yy - 14, 130, 40, 10, 'rgba(255,255,255,.06)', pu.c);
          D.text(c, pu.i, x0 + 26, yy + 1, 16, pu.c);
          D.text(c, it[0] === 3 ? 'SHRUNK' : it[0] === 4 ? 'REVERSED' : pu.l, x0 + 44, yy - 2, 13, '#fff', 'left', 800);
          if (it[0] === 5) D.text(c, 'ready', x0 + 44, yy + 14, 11, COL.dim, 'left', 600);
          else D.bar(c, x0 + 44, yy + 11, 86, 6, v / it[2], pu.c);
          yy += 46;
        });
        if (s === mi && S.e[s][2] > 0) D.otext(c, 'SPACE = fire!', x0 + 75, 476, 14, '#ff8ea1');
        else D.text(c, 'First to ' + WIN, x0 + 75, 476, 12, COL.dim, 'center', 600);
      }
      D.hud(c, info, S.score[0], S.score[1]);
    },
    bot: function (S, me, rnd) {
      var i = me === 'host' ? 0 : 1, inp = P.emptyIn(), ev = [], py = PY[i], dg = i === 0 ? 1 : -1;
      var half = pw(S, i) / 2, cur = S.p[i], tx = FW / 2, bestT = 1e9, best = null;
      if (S.sv && S.sv.w === i && S.sv.t < 1.6) ev.push({ t: 'a' });
      S.b.forEach(function (b) {
        if (b.vy * dg <= 0 || (py - b.y) * dg < 0) return;
        var t = (py - b.y) / b.vy; if (t < bestT) { bestT = t; best = b; }
      });
      if (best) {
        var x = best.x + best.vx * bestT, span = FW - 2 * R;
        x = ((x - R) % (2 * span) + 2 * span) % (2 * span); x = x > span ? 2 * span - x : x; x += R;
        var sp = Math.hypot(best.vx, best.vy), seed = S.hc * 31 + i * 7 + S.bs;
        var err = (hsh(seed) - 0.5) * 2 * (24 + Math.max(0, sp - 280) * 0.24);
        var aim = (hsh(seed + 99) - 0.5) * 1.2 * half;
        tx = x - aim + err;
      } else if (S.b.length) tx = (S.b[0].x + FW / 2) / 2;
      /* catch capsules if they arrive before the next ball */
      S.cap.forEach(function (cp) {
        if (cp.to !== i) return;
        var t = (py - cp.y) / (dg * 170);
        if (t > 0 && t < bestT - 0.5 && Math.abs(cp.x - cur) < 420 * t + half) tx = cp.x;
      });
      if (S.e[i][2] > 0 && !S.sv) ev.push({ t: 'a' });
      var d = tx - cur;
      if (Math.abs(d) > 5) {
        var dir = d > 0 ? 1 : -1;
        if (i === 1) dir = -dir;
        if (S.e[i][4] > 0 && rnd() < 0.8) dir = -dir;
        if (dir > 0) inp.right = 1; else inp.left = 1;
      }
      return { in: inp, ev: ev };
    }
  });
})();
