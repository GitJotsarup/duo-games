/* Party Rush minigames: BRAIN group
   Memory Match, Math Rush, Critter Count, Odd One Out, Color Clash, Pattern Party, Maze Race. */
(function () {
  var P = window.PARTY, W = 800, H = 500;
  var WHO = ['host', 'guest'];
  var HC = ['#ff5c8a', '#58c7ff'];
  var KD = { arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down', arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right' };
  var DV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

  /* ---------- shared helpers ---------- */
  function dirOf(e) { return e && e.t === 'key' ? (KD[e.k] || null) : null; }
  function r3(v) { return Math.round(v * 1000) / 1000; }
  function r1(v) { return Math.round(v * 10) / 10; }
  function hsh(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function shuffle(a, rnd) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick(a, rnd) { return a[Math.floor(rnd() * a.length)]; }
  function inR(x, y, b) { return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h; }
  function addFx(S, k, x, y, c, s, m, z) {
    S.fx.push({ k: k, x: Math.round(x), y: Math.round(y), c: c, s: s || '', t: m || 0.8, m: m || 0.8, z: z || 26 });
    if (S.fx.length > 14) S.fx.shift();
  }
  function tickFx(S, dt) {
    S.fx = S.fx.filter(function (f) { f.t = r3(f.t - dt); return f.t > 0; });
    if (S.sh > 0) S.sh = Math.max(0, r3(S.sh - dt));
  }
  function drawFx(c, S, D) {
    S.fx.forEach(function (f) {
      var a = Math.max(0, f.t / f.m), q = 1 - a;
      c.save();
      if (f.k === 'b') {
        c.globalAlpha = a;
        for (var j = 0; j < 12; j++) {
          var an = j / 12 * 6.283 + (f.x % 7) * 0.3, rr = 12 + q * 75;
          c.fillStyle = j % 3 === 0 ? '#ffd166' : f.c;
          c.beginPath(); c.arc(f.x + Math.cos(an) * rr, f.y + Math.sin(an) * rr, 6 * a + 1.5, 0, 7); c.fill();
        }
        c.strokeStyle = f.c; c.lineWidth = 5 * a; c.beginPath(); c.arc(f.x, f.y, 10 + q * 60, 0, 7); c.stroke();
      } else {
        c.globalAlpha = Math.min(1, a * 1.6);
        var pop = 1 + 0.35 * Math.max(0, 1 - q * 5);
        D.otext(c, f.s, f.x, f.y - q * 42, f.z * pop, f.c);
      }
      c.restore();
    });
  }
  function shakeOn(c, S) {
    if (S.sh > 0) { var t = performance.now() / 1000; c.translate(Math.sin(t * 90) * S.sh * 22, Math.cos(t * 70) * S.sh * 14); }
  }
  function byScore(S, unit) {
    var a = S.score[0], b = S.score[1];
    return { winner: a > b ? 'host' : b > a ? 'guest' : 'tie', text: a + ' - ' + b + (unit ? ' ' + unit : '') };
  }
  function winnerByScore(S, target, unit) {
    if (S.score[0] >= target || S.score[1] >= target) { S.result = byScore(S, unit); return true; }
    return false;
  }
  function strokeRR(c, D, x, y, w, h, r, col, lw) { D.rrect(c, x, y, w, h, r); c.strokeStyle = col; c.lineWidth = lw; c.stroke(); }
  function pips(c, D, x, y, n, have, col) {
    for (var k = 0; k < n; k++) D.circle(c, x + (k - (n - 1) / 2) * 22, y, 8, k < have ? col : 'rgba(255,255,255,.14)', k < have ? 10 : 0);
  }

  /* ================================================================
     1. MEMORY MATCH
     ================================================================ */
  var MM_E = ['🍓', '🍋', '🍇', '🥝', '🍉', '🍒', '🍑', '🍍'];
  var MM = { cw: 85, ch: 92, oy: 116, ox: [30, 430] };
  function mmCell(i, k) { return { x: MM.ox[i] + (k % 4) * MM.cw + MM.cw / 2, y: MM.oy + Math.floor(k / 4) * MM.ch + MM.ch / 2 }; }
  function mmFlip(S, i, k) {
    var pl = S.p[i];
    if ((pl.mt >> k) & 1) return;
    if (pl.wt > 0) { pl.wt = 0; pl.open = []; }
    if (pl.open.indexOf(k) >= 0) return;
    pl.open.push(k); pl.seen |= 1 << k;
    if (pl.open.length === 2) {
      var a = pl.open[0], b = pl.open[1];
      if (S.cards[a] === S.cards[b]) {
        pl.mt |= (1 << a) | (1 << b); pl.pairs++; pl.open = [];
        var c1 = mmCell(i, a), c2 = mmCell(i, b);
        addFx(S, 'b', c1.x, c1.y, HC[i], '', 0.6); addFx(S, 'b', c2.x, c2.y, HC[i], '', 0.6);
        addFx(S, 't', (c1.x + c2.x) / 2, (c1.y + c2.y) / 2, '#ffd166', pl.pairs === 8 ? 'CLEAR!' : 'PAIR!', 0.8, 30);
      } else pl.wt = 0.6;
    }
  }
  P.add({
    id: 'memory-match', name: 'Memory Match', icon: '🃏', cat: 'Brain',
    howto: 'You each get the same 16 face-down cards. Flip two at a time to find matching pairs - mismatches flip back. First to clear the whole board (or most pairs at the buzzer) wins!',
    controls: 'Click cards · or move: arrows/WASD, flip: Space',
    duration: 45,
    init: function (rnd) {
      var cards = []; for (var k = 0; k < 8; k++) cards.push(k, k);
      shuffle(cards, rnd);
      function pl() { return { cur: 5, open: [], mt: 0, seen: 0, wt: 0, pairs: 0 }; }
      return { cards: cards, p: [pl(), pl()], score: [0, 0], fx: [], sh: 0, t: 0 };
    },
    step: function (S, dt, inp, ev, rnd) {
      S.t = r3(S.t + dt); tickFx(S, dt);
      for (var i = 0; i < 2; i++) {
        var pl = S.p[i];
        if (pl.wt > 0) { pl.wt = r3(pl.wt - dt); if (pl.wt <= 0) { pl.wt = 0; pl.open = []; } }
        ev[WHO[i]].forEach(function (e) {
          var d = dirOf(e);
          if (d) {
            var cx = pl.cur % 4 + DV[d][0], cy = Math.floor(pl.cur / 4) + DV[d][1];
            if (cx >= 0 && cx < 4 && cy >= 0 && cy < 4) pl.cur = cy * 4 + cx;
          } else if (e.t === 'a') mmFlip(S, i, pl.cur);
          else if (e.t === 'tap') {
            var lx = e.x < 400 ? e.x - MM.ox[0] : e.x - MM.ox[1], ly = e.y - MM.oy;
            var tx = Math.floor(lx / MM.cw), ty = Math.floor(ly / MM.ch);
            if (tx >= 0 && tx < 4 && ty >= 0 && ty < 4) { pl.cur = ty * 4 + tx; mmFlip(S, i, pl.cur); }
          }
        });
      }
      S.score = [S.p[0].pairs, S.p[1].pairs];
      var d0 = S.p[0].pairs === 8, d1 = S.p[1].pairs === 8;
      if (d0 || d1) S.result = { winner: d0 && d1 ? 'tie' : d0 ? 'host' : 'guest', text: d0 && d1 ? 'Both cleared at the same moment!' : 'Board cleared! ' + S.score[0] + ' - ' + S.score[1] + ' pairs' };
    },
    timeout: function (S) { return byScore(S, 'pairs'); },
    draw: function (c, S, me, D, info) {
      D.bg(c, '#1b3d5c', '#081627');
      var now = performance.now() / 1000;
      c.save(); shakeOn(c, S);
      for (var i = 0; i < 2; i++) {
        var pl = S.p[i], who = WHO[i], col = HC[i], ox = MM.ox[i];
        D.rrect(c, ox - 10, 82, 360, 412, 20, i ? 'rgba(88,199,255,.10)' : 'rgba(255,92,138,.10)', i ? 'rgba(88,199,255,.45)' : 'rgba(255,92,138,.45)');
        D.player(c, ox + 14, 99, 11, who, null, me === who);
        D.otext(c, info.names[who] + (me === who ? ' (you)' : ''), ox + 34, 99, 15, '#fff', 'left');
        D.bar(c, ox + 196, 92, 144, 14, pl.pairs / 8, col);
        for (var k = 0; k < 16; k++) {
          var p = mmCell(i, k), x = p.x - MM.cw / 2 + 5, y = p.y - MM.ch / 2 + 5, w = MM.cw - 10, h = MM.ch - 10;
          var mt = (pl.mt >> k) & 1, op = pl.open.indexOf(k) >= 0;
          if (mt || op) {
            var bad = op && pl.wt > 0;
            c.save();
            if (mt) { c.shadowColor = col; c.shadowBlur = 14; }
            D.rrect(c, x, y, w, h, 12, mt ? 'rgba(255,255,255,.78)' : '#fffdf5');
            c.restore();
            if (mt) strokeRR(c, D, x, y, w, h, 12, col, 3);
            if (bad) strokeRR(c, D, x, y, w, h, 12, '#ff5a6a', 4);
            var bob = op && !bad ? Math.sin(now * 10 + k) * 2 : 0;
            c.globalAlpha = mt ? 0.75 : 1;
            D.text(c, MM_E[S.cards[k]], p.x, p.y + 2 + bob, 42);
            c.globalAlpha = 1;
          } else {
            var g = c.createLinearGradient(x, y, x + w, y + h);
            g.addColorStop(0, i ? '#3a86e8' : '#e2457d'); g.addColorStop(1, i ? '#1b3f8a' : '#7a1a45');
            D.rrect(c, x, y, w, h, 12, g);
            D.rrect(c, x + 6, y + 6, w - 12, h - 12, 8, null, 'rgba(255,255,255,.22)');
            D.text(c, '?', p.x, p.y + 2, 34, 'rgba(255,255,255,.5)');
          }
          if (k === pl.cur) strokeRR(c, D, x - 4, y - 4, w + 8, h + 8, 14, me === who ? '#fff' : col, 3 + Math.sin(now * 8) * 1.2);
        }
      }
      drawFx(c, S, D);
      c.restore();
      D.hud(c, info, S.score[0], S.score[1], 'Pairs found · clear all 8 to win');
    },
    bot: function (S, me, rnd) {
      var i = me === 'host' ? 0 : 1, pl = S.p[i], none = { in: P.emptyIn(), ev: [] };
      if (rnd() > 0.07) return none;
      var open = pl.wt > 0 ? [] : pl.open, cand = [];
      for (var k = 0; k < 16; k++) if (!((pl.mt >> k) & 1) && open.indexOf(k) < 0) cand.push(k);
      if (!cand.length) return none;
      var seenU = cand.filter(function (k) { return (pl.seen >> k) & 1; });
      var unseen = cand.filter(function (k) { return !((pl.seen >> k) & 1); });
      var target = -1;
      if (open.length === 1) {
        seenU.forEach(function (k) { if (S.cards[k] === S.cards[open[0]]) target = k; });
      } else {
        for (var x = 0; x < seenU.length && target < 0; x++)
          for (var y = x + 1; y < seenU.length; y++) if (S.cards[seenU[x]] === S.cards[seenU[y]]) { target = seenU[x]; break; }
      }
      if (target < 0 || rnd() < 0.08) target = unseen.length ? pick(unseen, rnd) : pick(cand, rnd);
      var p = mmCell(i, target);
      return { in: P.emptyIn(), ev: [{ t: 'tap', x: Math.round(p.x), y: Math.round(p.y) }] };
    }
  });

  /* ================================================================
     2. MATH RUSH
     ================================================================ */
  var MR_COL = [['#ff8a3d', '#c4501a'], ['#2fd391', '#138a5a'], ['#ffc93c', '#c48a10'], ['#b06bff', '#6a32c4']];
  function mrBtn(j) { return { x: j % 2 ? 405 : 145, y: j < 2 ? 290 : 385, w: 250, h: 80 }; }
  function mrQ(rnd, n) {
    var lvl = Math.min(n, 8), op = Math.floor(rnd() * 3), a, b, ans, txt;
    if (op === 0) { a = 3 + Math.floor(rnd() * (10 + lvl * 4)); b = 3 + Math.floor(rnd() * (10 + lvl * 4)); ans = a + b; txt = a + ' + ' + b; }
    else if (op === 1) { a = 8 + Math.floor(rnd() * (12 + lvl * 4)); b = 2 + Math.floor(rnd() * (a - 3)); ans = a - b; txt = a + ' − ' + b; }
    else { a = 2 + Math.floor(rnd() * (6 + Math.min(4, lvl))); b = 2 + Math.floor(rnd() * 8); ans = a * b; txt = a + ' × ' + b; }
    var ch = [ans], offs = shuffle(op === 2 ? [a, -a, b, -b, 1, -1, 2, -2, 10] : [1, -1, 2, -2, 10, -10, 3, -3], rnd);
    for (var j = 0; j < offs.length && ch.length < 4; j++) { var v = ans + offs[j]; if (v >= 0 && ch.indexOf(v) < 0) ch.push(v); }
    var extra = 4; while (ch.length < 4) { if (ch.indexOf(ans + extra) < 0) ch.push(ans + extra); extra += 3; }
    shuffle(ch, rnd);
    return { t: txt, ch: ch, c: ch.indexOf(ans), ans: ans };
  }
  function mrChoice(e) {
    if (e.t === 'key' && /^[1-4]$/.test(e.k)) return +e.k - 1;
    if (e.t === 'tap') for (var j = 0; j < 4; j++) if (inR(e.x, e.y, mrBtn(j))) return j;
    return -1;
  }
  P.add({
    id: 'math-rush', name: 'Math Rush', icon: '➕', cat: 'Brain',
    howto: 'Solve the sum and hit the right answer first to score. A wrong answer locks you out of that question! First to 7 points wins.',
    controls: 'Answer: keys 1-4 or click',
    duration: 45,
    init: function (rnd) { return { q: mrQ(rnd, 0), st: 'q', t: 0, lk: [0, 0], pk: [-1, -1], win: -1, n: 0, score: [0, 0], fx: [], sh: 0 }; },
    step: function (S, dt, inp, ev, rnd) {
      S.t = r3(S.t + dt); tickFx(S, dt);
      if (S.st === 'q') {
        var got = [-1, -1];
        for (var i = 0; i < 2; i++) {
          if (S.lk[i]) continue;
          var evs = ev[WHO[i]];
          for (var e = 0; e < evs.length && got[i] < 0; e++) got[i] = mrChoice(evs[e]);
        }
        var ok = [got[0] === S.q.c, got[1] === S.q.c];
        for (i = 0; i < 2; i++) if (got[i] >= 0 && !ok[i]) {
          S.lk[i] = 1; S.pk[i] = got[i]; S.sh = 0.25;
          var b = mrBtn(got[i]); addFx(S, 't', b.x + b.w / 2, b.y + b.h / 2, '#ff5a6a', '✗', 0.7, 44);
          addFx(S, 't', i ? 730 : 70, 270, '#ff5a6a', 'LOCKED', 0.9, 20);
        }
        var w = ok[0] && ok[1] ? (rnd() < 0.5 ? 0 : 1) : ok[0] ? 0 : ok[1] ? 1 : -1;
        if (w >= 0) {
          S.score[w]++; S.win = w; S.st = 'rev'; S.t = 0;
          var bb = mrBtn(S.q.c); addFx(S, 'b', bb.x + bb.w / 2, bb.y + bb.h / 2, HC[w], '', 0.7);
          addFx(S, 't', w ? 730 : 70, 270, '#ffd166', '+1', 0.9, 34);
        } else if ((S.lk[0] && S.lk[1]) || S.t > 8) { S.win = -1; S.st = 'rev'; S.t = 0; }
      } else if (S.st === 'rev' && S.t > 1.1) {
        if (winnerByScore(S, 7, 'points')) return;
        S.n++; S.q = mrQ(rnd, S.n); S.st = 'q'; S.t = 0; S.lk = [0, 0]; S.pk = [-1, -1]; S.win = -1;
      }
    },
    timeout: function (S) { return byScore(S, 'points'); },
    draw: function (c, S, me, D, info) {
      D.bg(c, '#2a1b5e', '#0e0828');
      var now = performance.now() / 1000, rev = S.st === 'rev';
      c.save(); shakeOn(c, S);
      D.rrect(c, 150, 92, 500, 172, 28, 'rgba(255,255,255,.08)', 'rgba(255,255,255,.22)');
      D.otext(c, S.q.t + ' = ' + (rev ? S.q.ans : '?'), 400, 172, 72, rev ? '#4ade80' : '#fff');
      if (!rev) D.bar(c, 180, 236, 440, 10, 1 - S.t / 8, '#ffd166');
      else D.otext(c, S.win < 0 ? 'Nobody got it!' : info.names[WHO[S.win]] + ' scores!', 400, 240, 22, S.win < 0 ? '#a9a7d3' : HC[S.win]);
      for (var j = 0; j < 4; j++) {
        var b = mrBtn(j), right = rev && j === S.q.c, dim = rev && !right;
        c.save(); c.globalAlpha = dim ? 0.35 : 1;
        if (right) { c.shadowColor = '#4ade80'; c.shadowBlur = 26; }
        var g = c.createLinearGradient(0, b.y, 0, b.y + b.h);
        g.addColorStop(0, right ? '#4ade80' : MR_COL[j][0]); g.addColorStop(1, right ? '#15803d' : MR_COL[j][1]);
        D.rrect(c, b.x, b.y + 5, b.w, b.h, 18, 'rgba(0,0,0,.35)');
        D.rrect(c, b.x, b.y, b.w, b.h, 18, g);
        c.restore();
        c.globalAlpha = dim ? 0.4 : 1;
        D.otext(c, S.q.ch[j], b.x + b.w / 2, b.y + b.h / 2 + 2, 40, '#fff');
        D.circle(c, b.x + 22, b.y + 22, 14, 'rgba(0,0,0,.35)');
        D.text(c, j + 1, b.x + 22, b.y + 23, 16, '#fff');
        c.globalAlpha = 1;
        for (var i = 0; i < 2; i++) if (S.pk[i] === j) {
          var bx = i ? b.x + b.w - 22 : b.x + b.w - 52;
          D.circle(c, bx, b.y + b.h - 18, 13, HC[i], 8); D.text(c, '✗', bx, b.y + b.h - 17, 16, '#fff');
        }
        if (right && S.win >= 0) strokeRR(c, D, b.x - 5, b.y - 5, b.w + 10, b.h + 10, 22, HC[S.win], 5);
      }
      for (var p = 0; p < 2; p++) {
        var who = WHO[p], x = p ? 730 : 70, y = 340 - (rev && S.win === p ? Math.abs(Math.sin(now * 9)) * 14 : 0);
        D.player(c, x, y, 30, who, info.names[who], me === who);
        if (S.lk[p] && !rev) D.otext(c, '🔒', x, y + 52, 26);
      }
      drawFx(c, S, D);
      c.restore();
      D.hud(c, info, S.score[0], S.score[1], 'First to 7 · wrong answer = locked out');
    },
    bot: function (S, me, rnd) {
      var i = me === 'host' ? 0 : 1, none = { in: P.emptyIn(), ev: [] };
      if (S.st !== 'q' || S.lk[i] || S.t < 0.6 || rnd() > 0.07) return none;
      var ch = S.q.c;
      if (rnd() < 0.08) ch = (ch + 1 + Math.floor(rnd() * 3)) % 4;
      return { in: P.emptyIn(), ev: [{ t: 'key', k: String(ch + 1) }] };
    }
  });

  /* ================================================================
     3. CRITTER COUNT
     ================================================================ */
  var CC_T = ['🐟', '🐡', '🦑'];
  var CC_SWIM = 6, CC_ASK = 6, CC_REV = 2.4;
  var CC_DN = { x: 95, y: 310 }, CC_UP = { x: 305, y: 310 }, CC_LK = { x: 120, y: 400, w: 160, h: 50 };
  function ccRound(S, rnd) {
    var tg = Math.floor(rnd() * 3), fish = [], counts = [0, 0, 0];
    for (var t = 0; t < 3; t++) counts[t] = t === tg ? 4 + Math.floor(rnd() * 8) : 3 + Math.floor(rnd() * 7);
    var lanes = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], rnd), li = 0;
    for (t = 0; t < 3; t++) for (var n = 0; n < counts[t]; n++) {
      var v = r1(2.0 + rnd() * 1.6), s = r1(rnd() * (CC_SWIM - 0.3 - v));
      fish.push({ e: t, y: Math.round(122 + lanes[li++ % 10] * 34 + rnd() * 8), d: rnd() < 0.5 ? 1 : -1, s: s, v: v });
    }
    S.fish = fish; S.tg = tg; S.cnt = counts[tg]; S.st = 'swim'; S.t = 0; S.val = [0, 0]; S.lk = [0, 0]; S.hurry = -1;
  }
  function ccReveal(S) {
    S.lk = [1, 1];
    var dd = [Math.abs(S.val[0] - S.cnt), Math.abs(S.val[1] - S.cnt)], pts = [0, 0];
    if (dd[0] <= dd[1]) pts[0]++;
    if (dd[1] <= dd[0]) pts[1]++;
    for (var i = 0; i < 2; i++) {
      if (dd[i] === 0) pts[i]++;
      S.score[i] += pts[i];
      addFx(S, 't', i ? 600 : 200, 360, pts[i] === 2 ? '#ffd166' : pts[i] ? '#4ade80' : '#a9a7d3', pts[i] === 2 ? 'EXACT! +2' : pts[i] ? 'Closest +1' : 'Too far', 1.4, 26);
      if (pts[i] === 2) addFx(S, 'b', i ? 600 : 200, 300, HC[i], '', 0.9);
    }
    S.last = { d: dd, p: pts }; S.st = 'rev'; S.t = 0;
  }
  P.add({
    id: 'critter-count', name: 'Critter Count', icon: '🐟', cat: 'Brain',
    howto: 'Fish, pufferfish and squid swim past for 6 seconds - count them all! Then answer "how many?" for one kind. Closest guess scores, an exact count scores double. 3 rounds.',
    controls: 'Adjust: Up/Down · Lock in: Space · or click ▲▼',
    duration: 45,
    init: function (rnd) {
      var S = { r: 0, score: [0, 0], fx: [], sh: 0, last: null, key: Math.floor(rnd() * 100000) };
      ccRound(S, rnd);
      return S;
    },
    step: function (S, dt, inp, ev, rnd) {
      S.t = r3(S.t + dt); tickFx(S, dt);
      if (S.st === 'swim') { if (S.t >= CC_SWIM) { S.st = 'ask'; S.t = 0; } return; }
      if (S.st === 'ask') {
        for (var i = 0; i < 2; i++) {
          ev[WHO[i]].forEach(function (e) {
            if (S.lk[i]) return;
            var d = dirOf(e), delta = 0, lock = false;
            if (d === 'up' || d === 'right') delta = 1;
            else if (d === 'down' || d === 'left') delta = -1;
            else if (e.t === 'a') lock = true;
            else if (e.t === 'tap') {
              var lx = e.x < 400 ? e.x : e.x - 400;
              if (Math.hypot(lx - CC_UP.x, e.y - CC_UP.y) < 44) delta = 1;
              else if (Math.hypot(lx - CC_DN.x, e.y - CC_DN.y) < 44) delta = -1;
              else if (inR(lx, e.y, CC_LK)) lock = true;
            }
            if (delta) S.val[i] = Math.max(0, Math.min(30, S.val[i] + delta));
            if (lock) { S.lk[i] = 1; addFx(S, 't', i ? 600 : 200, 250, HC[i], 'LOCKED IN!', 0.8, 22); }
          });
        }
        if ((S.lk[0] || S.lk[1]) && S.hurry < 0) S.hurry = r3(S.t + 3);
        if ((S.lk[0] && S.lk[1]) || S.t >= CC_ASK || (S.hurry >= 0 && S.t >= S.hurry)) ccReveal(S);
        return;
      }
      if (S.st === 'rev' && S.t >= CC_REV) {
        S.r++;
        if (S.r >= 3) { S.result = byScore(S, 'points'); return; }
        ccRound(S, rnd);
      }
    },
    timeout: function (S) { return byScore(S, 'points'); },
    draw: function (c, S, me, D, info) {
      var now = performance.now() / 1000;
      var g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0e6fa0'); g.addColorStop(1, '#03203a');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.save(); c.globalAlpha = 0.07; c.fillStyle = '#fff';
      for (var k = 0; k < 5; k++) { var rx = 80 + k * 170 + Math.sin(now * 0.4 + k) * 30; c.beginPath(); c.moveTo(rx, 0); c.lineTo(rx + 60, 0); c.lineTo(rx + 150, H); c.lineTo(rx + 40, H); c.fill(); }
      c.restore();
      c.fillStyle = 'rgba(255,255,255,.18)';
      for (k = 0; k < 14; k++) { var by = H - ((now * 40 + k * 67) % (H - 80)); c.beginPath(); c.arc((k * 97) % W + Math.sin(now * 2 + k) * 8, by, 3 + k % 4, 0, 7); c.fill(); }
      c.fillStyle = '#c9a66b'; c.beginPath(); c.moveTo(0, H); c.lineTo(0, 478);
      for (var sx = 0; sx <= W; sx += 40) c.lineTo(sx, 476 + Math.sin(sx * 0.03) * 6); c.lineTo(W, H); c.fill();
      c.save(); shakeOn(c, S);
      if (S.st === 'swim') {
        S.fish.forEach(function (f, n) {
          var p = (S.t - f.s) / f.v; if (p < 0 || p > 1) return;
          var x = f.d > 0 ? -40 + p * 880 : 840 - p * 880, y = f.y + Math.sin(now * 4 + n) * 5;
          c.save(); c.translate(x, y); if (f.d > 0) c.scale(-1, 1);
          D.text(c, CC_T[f.e], 0, 0, 40); c.restore();
        });
        D.rrect(c, 260, 76, 280, 36, 18, 'rgba(0,0,0,.35)');
        D.otext(c, 'Count them all! ' + Math.max(0, Math.ceil(CC_SWIM - S.t)), 400, 94, 22, '#ffd166');
      } else {
        D.rrect(c, 200, 84, 400, 70, 24, 'rgba(0,0,0,.35)', 'rgba(255,255,255,.25)');
        D.otext(c, S.st === 'rev' ? 'There were ' + S.cnt + ' ' + CC_T[S.tg] : 'How many ' + CC_T[S.tg] + ' ?', 400, 120, 36, '#fff');
        if (S.st === 'ask') {
          var end = S.hurry >= 0 ? Math.min(S.hurry, CC_ASK) : CC_ASK;
          D.bar(c, 220, 160, 360, 8, 1 - S.t / end, S.hurry >= 0 ? '#ff5a6a' : '#ffd166');
        } else {
          var cols = Math.min(S.cnt, 14);
          for (var q = 0; q < S.cnt; q++) {
            var pop = Math.min(1, Math.max(0, (S.t - q * 0.06) * 5));
            if (pop > 0) D.text(c, CC_T[S.tg], 400 + ((q % 14) - (cols - 1) / 2) * 30, 172 + Math.floor(q / 14) * 26, 24 * pop);
          }
        }
        for (var i = 0; i < 2; i++) {
          var who = WHO[i], ox = i * 400, mine = me === who, lk = S.lk[i];
          D.rrect(c, ox + 50, 200, 300, 262, 26, i ? 'rgba(88,199,255,.16)' : 'rgba(255,92,138,.16)', HC[i]);
          D.player(c, ox + 82, 232, 16, who, null, mine);
          D.otext(c, info.names[who] + (mine ? ' (you)' : ''), ox + 106, 232, 16, '#fff', 'left');
          var show = mine || S.st === 'rev';
          D.otext(c, show ? S.val[i] : (lk ? '🔒' : '🤔'), ox + 200, 312, show ? 84 : 60, '#fff');
          if (S.st === 'ask' && mine && !lk) {
            D.circle(c, ox + CC_DN.x, CC_DN.y, 34, 'rgba(255,255,255,.25)'); D.text(c, '▼', ox + CC_DN.x, CC_DN.y + 2, 30, '#fff');
            D.circle(c, ox + CC_UP.x, CC_UP.y, 34, 'rgba(255,255,255,.25)'); D.text(c, '▲', ox + CC_UP.x, CC_UP.y, 30, '#fff');
            D.rrect(c, ox + CC_LK.x, CC_LK.y, CC_LK.w, CC_LK.h, 25, '#ffd166');
            D.text(c, 'LOCK IN', ox + 200, CC_LK.y + 26, 22, '#3a2600');
          } else if (S.st === 'ask') {
            D.otext(c, lk ? 'Locked in!' : 'Counting…', ox + 200, 425, 22, lk ? '#4ade80' : '#a9a7d3');
          } else if (S.last) {
            D.otext(c, S.last.d[i] === 0 ? 'Spot on!' : 'Off by ' + S.last.d[i], ox + 200, 425, 22, S.last.p[i] ? '#4ade80' : '#a9a7d3');
          }
        }
      }
      drawFx(c, S, D);
      c.restore();
      D.hud(c, info, S.score[0], S.score[1], 'Round ' + Math.min(S.r + 1, 3) + ' / 3 · closest +1 · exact +2');
    },
    bot: function (S, me, rnd) {
      var i = me === 'host' ? 0 : 1, none = { in: P.emptyIn(), ev: [] };
      if (S.st !== 'ask' || S.lk[i] || S.t < 0.7 || rnd() > 0.3) return none;
      var h = hsh(S.key + S.r * 7 + i * 3), tgt = Math.max(0, S.cnt + (h < 0.55 ? 0 : h < 0.78 ? 1 : -1));
      if (S.val[i] < tgt) return { in: P.emptyIn(), ev: [{ t: 'key', k: 'arrowup' }] };
      if (S.val[i] > tgt) return { in: P.emptyIn(), ev: [{ t: 'key', k: 'arrowdown' }] };
      if (S.t > 1.2) return { in: P.emptyIn(), ev: [{ t: 'a' }] };
      return none;
    }
  });

  /* ================================================================
     4. ODD ONE OUT
     ================================================================ */
  var OO_PAIRS = [['🐱', '🐯'], ['🍎', '🍅'], ['😃', '😄'], ['🌲', '🌳'], ['🐭', '🐹'], ['🍪', '🍩'], ['🌕', '🌝'], ['🐻', '🐼'], ['🍋', '🍌'], ['🌸', '🌺'], ['⚽', '🏀'], ['😺', '😸']];
  var OO_ROT = ['🦆', '🐟', '🚗', '👉', '🍌', '🐌', '🎸', '🦒', '🐘', '🚀', '🐢', '🦜'];
  var OO_SZ = [4, 4, 5, 5, 6, 6, 7, 7, 8];
  var OO_G = { x: 205, y: 96, s: 390 };
  function ooRound(S, rnd) {
    var n = OO_SZ[Math.min(S.r, 8)];
    S.n = n; S.oi = Math.floor(rnd() * n * n); S.kind = Math.floor(rnd() * 3);
    if (S.kind === 0) { var pr = pick(OO_PAIRS, rnd), sw = rnd() < 0.5; S.a = sw ? pr[1] : pr[0]; S.b = sw ? pr[0] : pr[1]; }
    else if (S.kind === 1) { S.a = pick(OO_ROT, rnd); S.b = rnd() < 0.6 ? 'm' : 'f'; }
    else { S.a = Math.floor(rnd() * 360); S.b = Math.max(16, 42 - S.r * 4) * (rnd() < 0.5 ? 1 : -1); }
    var mid = Math.floor(n / 2);
    S.cur = [{ x: 0, y: mid }, { x: n - 1, y: mid }]; S.lk = [0, 0]; S.st = 'go'; S.t = 0; S.win = -1;
  }
  function ooCell(S, k) { var cs = OO_G.s / S.n; return { x: OO_G.x + (k % S.n) * cs + cs / 2, y: OO_G.y + Math.floor(k / S.n) * cs + cs / 2, cs: cs }; }
  P.add({
    id: 'odd-one-out', name: 'Odd One Out', icon: '🔍', cat: 'Brain',
    howto: 'One tile in the grid is slightly different - a different emoji, flipped, or a shade off. Find it first to win the round! Wrong picks freeze you for a second. First to 5.',
    controls: 'Click it · or move: arrows/WASD, pick: Space',
    duration: 45,
    init: function (rnd) { var S = { r: 0, score: [0, 0], fx: [], sh: 0 }; ooRound(S, rnd); return S; },
    step: function (S, dt, inp, ev, rnd) {
      S.t = r3(S.t + dt); tickFx(S, dt);
      if (S.st === 'go') {
        var hit = [false, false];
        for (var i = 0; i < 2; i++) {
          if (S.lk[i] > 0) { S.lk[i] = Math.max(0, r3(S.lk[i] - dt)); continue; }
          ev[WHO[i]].forEach(function (e) {
            if (hit[i] || S.lk[i] > 0) return;
            var cu = S.cur[i], d = dirOf(e), sel = -1;
            if (d) { cu.x = Math.max(0, Math.min(S.n - 1, cu.x + DV[d][0])); cu.y = Math.max(0, Math.min(S.n - 1, cu.y + DV[d][1])); }
            else if (e.t === 'a') sel = cu.y * S.n + cu.x;
            else if (e.t === 'tap') {
              var cs = OO_G.s / S.n, tx = Math.floor((e.x - OO_G.x) / cs), ty = Math.floor((e.y - OO_G.y) / cs);
              if (tx >= 0 && tx < S.n && ty >= 0 && ty < S.n) { cu.x = tx; cu.y = ty; sel = ty * S.n + tx; }
            }
            if (sel < 0) return;
            if (sel === S.oi) hit[i] = true;
            else { S.lk[i] = 1; S.sh = 0.2; var p = ooCell(S, sel); addFx(S, 't', p.x, p.y, HC[i], '✗', 0.7, 40); }
          });
        }
        var w = hit[0] && hit[1] ? (rnd() < 0.5 ? 0 : 1) : hit[0] ? 0 : hit[1] ? 1 : -1;
        if (w >= 0) {
          S.score[w]++; S.win = w; S.st = 'rev'; S.t = 0;
          var c = ooCell(S, S.oi); addFx(S, 'b', c.x, c.y, HC[w], '', 0.8); addFx(S, 't', w ? 700 : 100, 230, '#ffd166', '+1', 0.9, 34);
        } else if (S.t > 15) { S.win = -1; S.st = 'rev'; S.t = 0; }
      } else if (S.st === 'rev' && S.t > 1.4) {
        if (winnerByScore(S, 5, 'rounds')) return;
        S.r++; ooRound(S, rnd);
      }
    },
    timeout: function (S) { return byScore(S, 'rounds'); },
    draw: function (c, S, me, D, info) {
      D.bg(c, '#3b2266', '#140a2a');
      var now = performance.now() / 1000, rev = S.st === 'rev';
      c.save(); shakeOn(c, S);
      D.rrect(c, OO_G.x - 12, OO_G.y - 12, OO_G.s + 24, OO_G.s + 24, 24, 'rgba(255,255,255,.07)', 'rgba(255,255,255,.2)');
      for (var k = 0; k < S.n * S.n; k++) {
        var p = ooCell(S, k), odd = k === S.oi, cs = p.cs;
        c.save();
        c.globalAlpha = rev && !odd ? 0.3 : 1;
        D.rrect(c, p.x - cs / 2 + 3, p.y - cs / 2 + 3, cs - 6, cs - 6, cs * 0.2, 'rgba(255,255,255,.06)');
        c.translate(p.x, p.y);
        if (rev && odd) c.scale(1.15 + Math.sin(now * 10) * 0.08, 1.15 + Math.sin(now * 10) * 0.08);
        if (S.kind === 0) D.text(c, odd ? S.b : S.a, 0, 2, cs * 0.6);
        else if (S.kind === 1) {
          if (odd) { if (S.b === 'm') c.scale(-1, 1); else c.rotate(Math.PI); }
          D.text(c, S.a, 0, 2, cs * 0.6);
        } else D.circle(c, 0, 0, cs * 0.34, 'hsl(' + ((S.a + (odd ? S.b : 0) + 360) % 360) + ',78%,58%)', 0);
        c.restore();
        if (rev && odd) strokeRR(c, D, p.x - cs / 2, p.y - cs / 2, cs, cs, cs * 0.22, '#ffd166', 4);
      }
      if (!rev) for (var i = 0; i < 2; i++) {
        var cu = S.cur[i], cs2 = OO_G.s / S.n, inset = (i && S.cur[0].x === cu.x && S.cur[0].y === cu.y) ? 6 : 0;
        var x = OO_G.x + cu.x * cs2 + inset, y = OO_G.y + cu.y * cs2 + inset;
        strokeRR(c, D, x + 1, y + 1, cs2 - 2 - inset * 2, cs2 - 2 - inset * 2, cs2 * 0.22, S.lk[i] > 0 ? '#777' : HC[i], WHO[i] === me ? 5 : 3);
      }
      for (i = 0; i < 2; i++) {
        var who = WHO[i], ax = i ? 700 : 100, ay = 290 - (rev && S.win === i ? Math.abs(Math.sin(now * 9)) * 14 : 0);
        D.player(c, ax, ay, 34, who, info.names[who], me === who);
        pips(c, D, ax, 352, 5, S.score[i], HC[i]);
        if (S.lk[i] > 0) D.otext(c, 'Oops! ' + S.lk[i].toFixed(1) + 's', ax, 390, 18, '#ff5a6a');
      }
      if (rev) D.otext(c, S.win < 0 ? 'Too slow!' : info.names[WHO[S.win]] + ' spotted it!', 400, 470, 22, S.win < 0 ? '#a9a7d3' : HC[S.win]);
      drawFx(c, S, D);
      c.restore();
      D.hud(c, info, S.score[0], S.score[1], 'Round ' + (S.r + 1) + ' · ' + S.n + '×' + S.n + ' · first to 5');
    },
    bot: function (S, me, rnd) {
      var i = me === 'host' ? 0 : 1, none = { in: P.emptyIn(), ev: [] };
      if (S.st !== 'go' || S.lk[i] > 0 || S.t < 0.35 + S.n * 0.13 || rnd() > 0.45) return none;
      var cu = S.cur[i], tx = S.oi % S.n, ty = Math.floor(S.oi / S.n), k = null;
      if (cu.x < tx) k = 'arrowright'; else if (cu.x > tx) k = 'arrowleft'; else if (cu.y < ty) k = 'arrowdown'; else if (cu.y > ty) k = 'arrowup';
      return { in: P.emptyIn(), ev: [k ? { t: 'key', k: k } : { t: 'a' }] };
    }
  });

  /* ================================================================
     5. COLOR CLASH (stroop)
     ================================================================ */
  var CL = [{ n: 'RED', c: '#ff4d5e', d: '#a8182a', k: 'r' }, { n: 'GREEN', c: '#3ddc84', d: '#14874a', k: 'g' }, { n: 'BLUE', c: '#4d8dff', d: '#1e4fb8', k: 'b' }, { n: 'YELLOW', c: '#ffd23f', d: '#b88a0a', k: 'y' }];
  function clBtn(j) { return { x: 400 + (j - 1.5) * 180 - 80, y: 385, w: 160, h: 80 }; }
  function clWord(S, rnd) {
    S.w = Math.floor(rnd() * 4); S.ink = (S.w + 1 + Math.floor(rnd() * 3)) % 4;
    S.st = 'go'; S.t = 0; S.lk = [0, 0]; S.pk = [-1, -1]; S.win = -1; S.tw = r1(rnd() * 2 - 1); S.n++;
  }
  function clChoice(e) {
    if (e.t === 'key') for (var j = 0; j < 4; j++) if (CL[j].k === e.k) return j;
    if (e.t === 'tap') for (j = 0; j < 4; j++) if (inR(e.x, e.y, clBtn(j))) return j;
    return -1;
  }
  P.add({
    id: 'stroop-dash', name: 'Color Clash', icon: '🎨', cat: 'Brain',
    howto: 'A colour word appears painted in a DIFFERENT colour. Hit the colour of the INK, not the word! First correct answer scores, a wrong answer costs a point. First to 8.',
    controls: 'Ink colour: R / G / B / Y keys or click',
    duration: 45,
    init: function (rnd) { var S = { n: 0, score: [0, 0], fx: [], sh: 0 }; clWord(S, rnd); return S; },
    step: function (S, dt, inp, ev, rnd) {
      S.t = r3(S.t + dt); tickFx(S, dt);
      if (S.st === 'go') {
        var got = [-1, -1];
        for (var i = 0; i < 2; i++) {
          if (S.lk[i]) continue;
          var evs = ev[WHO[i]];
          for (var e = 0; e < evs.length && got[i] < 0; e++) got[i] = clChoice(evs[e]);
        }
        var ok = [got[0] === S.ink, got[1] === S.ink];
        for (i = 0; i < 2; i++) if (got[i] >= 0 && !ok[i]) {
          S.lk[i] = 1; S.pk[i] = got[i]; S.sh = 0.25; S.score[i] = Math.max(0, S.score[i] - 1);
          addFx(S, 't', i ? 715 : 85, 160, '#ff5a6a', '-1', 0.9, 34);
        }
        var w = ok[0] && ok[1] ? (rnd() < 0.5 ? 0 : 1) : ok[0] ? 0 : ok[1] ? 1 : -1;
        if (w >= 0) {
          S.score[w]++; S.win = w; S.st = 'rev'; S.t = 0;
          addFx(S, 'b', 400, 225, CL[S.ink].c, '', 0.7); addFx(S, 't', w ? 715 : 85, 160, '#ffd166', '+1', 0.9, 34);
        } else if ((S.lk[0] && S.lk[1]) || S.t > 4) { S.win = -1; S.st = 'rev'; S.t = 0; }
      } else if (S.st === 'rev' && S.t > 0.75) {
        if (winnerByScore(S, 8, 'points')) return;
        clWord(S, rnd);
      }
    },
    timeout: function (S) { return byScore(S, 'points'); },
    draw: function (c, S, me, D, info) {
      D.bg(c, '#24203f', '#0b0a18');
      var now = performance.now() / 1000, rev = S.st === 'rev';
      c.save(); shakeOn(c, S);
      c.save(); c.globalAlpha = 0.12;
      for (var k = 0; k < 4; k++) D.circle(c, 120 + k * 190, 120 + (k % 2) * 260, 60 + Math.sin(now + k) * 8, CL[k].c, 0);
      c.restore();
      D.rrect(c, 160, 110, 480, 230, 34, 'rgba(255,255,255,.92)');
      c.save(); c.translate(400, 222); c.rotate(S.tw * 0.06);
      var sc = rev ? 1 : 1 + Math.sin(now * 6) * 0.03 + Math.max(0, 0.25 - S.t) * 1.2;
      c.scale(sc, sc);
      c.font = '900 108px ' + D.FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = CL[S.ink].c; c.lineWidth = 6; c.strokeStyle = 'rgba(0,0,0,.25)';
      c.strokeText(CL[S.w].n, 0, 0); c.fillText(CL[S.w].n, 0, 0);
      c.restore();
      if (rev) D.otext(c, S.win < 0 ? 'The ink was ' + CL[S.ink].n : info.names[WHO[S.win]] + ' scores!', 400, 312, 22, S.win < 0 ? '#555' : HC[S.win]);
      else D.bar(c, 220, 316, 360, 8, 1 - S.t / 4, '#9b6bff');
      for (var j = 0; j < 4; j++) {
        var b = clBtn(j), right = rev && j === S.ink;
        c.save(); c.globalAlpha = rev && !right ? 0.35 : 1;
        if (right) { c.shadowColor = CL[j].c; c.shadowBlur = 30; }
        D.rrect(c, b.x, b.y + 6, b.w, b.h, 20, CL[j].d);
        D.rrect(c, b.x, b.y, b.w, b.h, 20, CL[j].c);
        c.restore();
        D.otext(c, CL[j].k.toUpperCase(), b.x + b.w / 2, b.y + b.h / 2 + 2, 40, '#fff');
        for (var i = 0; i < 2; i++) if (S.pk[i] === j) {
          var bx = i ? b.x + b.w - 18 : b.x + 18;
          D.circle(c, bx, b.y + 16, 12, HC[i], 8); D.text(c, '✗', bx, b.y + 17, 15, '#fff');
        }
      }
      for (i = 0; i < 2; i++) {
        var who = WHO[i], ax = i ? 715 : 85, ay = 225 - (rev && S.win === i ? Math.abs(Math.sin(now * 9)) * 14 : 0);
        D.player(c, ax, ay, 32, who, info.names[who], me === who);
        if (S.lk[i] && !rev) D.otext(c, '🔒', ax, ay + 52, 24);
      }
      drawFx(c, S, D);
      c.restore();
      D.hud(c, info, S.score[0], S.score[1], 'Press the INK colour · first to 8');
    },
    bot: function (S, me, rnd) {
      var i = me === 'host' ? 0 : 1, none = { in: P.emptyIn(), ev: [] };
      if (S.st !== 'go' || S.lk[i] || S.t < 0.55 || rnd() > 0.08) return none;
      var ch = S.ink;
      if (rnd() < 0.07) ch = (ch + 1 + Math.floor(rnd() * 3)) % 4;
      return { in: P.emptyIn(), ev: [{ t: 'key', k: CL[ch].k }] };
    }
  });

  /* ================================================================
     6. PATTERN PARTY (Simon)
     ================================================================ */
  var PP_C = [['#3ddc84', '#0f4a2c'], ['#ff4d5e', '#4f121a'], ['#ffd23f', '#4f3d08'], ['#4d8dff', '#122a57']];
  var PP_O = [[0, -1], [1, 0], [0, 1], [-1, 0]], PP_G = ['▲', '▶', '▼', '◀'];
  var PP_K = ['arrowup', 'arrowright', 'arrowdown', 'arrowleft'], PP_D = { up: 0, right: 1, down: 2, left: 3 };
  var PP_CX = [200, 600], PP_CY = 282, PP_R = 46, PP_DST = 92, PP_MAX = 12;
  function ppSd(r) { return Math.max(0.3, 0.52 - r * 0.02); }
  function ppLimit(r) { return 2.2 + r * 0.65; }
  function ppMk() { return { al: 1, k: 0, dn: 0, tt: 0, lit: -1, lt: 0 }; }
  function ppJudge(S) {
    var a = S.p[0], b = S.p[1];
    if (a.al !== b.al) return { winner: a.al ? 'host' : 'guest', text: 'Last one standing · round ' + S.r };
    if (S.score[0] !== S.score[1]) return byScore(S, 'rounds');
    if (a.k !== b.k) return { winner: a.k > b.k ? 'host' : 'guest', text: 'Got further: ' + a.k + ' vs ' + b.k + ' steps' };
    if (a.al && Math.abs(a.tt - b.tt) > 0.05) return { winner: a.tt < b.tt ? 'host' : 'guest', text: 'Faster: ' + a.tt.toFixed(1) + 's vs ' + b.tt.toFixed(1) + 's' };
    return { winner: 'tie', text: 'Perfectly matched!' };
  }
  P.add({
    id: 'simon-says', name: 'Pattern Party', icon: '🔆', cat: 'Brain',
    howto: 'Watch the pads light up, then repeat the pattern. Each round adds one more step. One mistake (or too slow) and you are OUT - last one standing wins!',
    controls: 'Pads: arrow keys / WASD · or click the pads',
    duration: 45,
    init: function (rnd) {
      var seq = []; for (var k = 0; k < PP_MAX; k++) seq.push(Math.floor(rnd() * 4));
      return { seq: seq, r: 1, st: 'show', t: 0, p: [ppMk(), ppMk()], score: [0, 0], fx: [], sh: 0 };
    },
    step: function (S, dt, inp, ev, rnd) {
      S.t = r3(S.t + dt); tickFx(S, dt);
      S.p.forEach(function (p) { if (p.lt > 0) { p.lt = Math.max(0, r3(p.lt - dt)); if (!p.lt) p.lit = -1; } });
      if (S.st === 'show') {
        if (S.t >= 0.5 + S.r * ppSd(S.r) + 0.1) { S.st = 'in'; S.t = 0; S.p.forEach(function (p) { if (p.al) { p.k = 0; p.dn = 0; } }); }
        return;
      }
      if (S.st === 'gap') { if (S.t > 0.8) { S.st = 'show'; S.t = 0; } return; }
      if (S.st !== 'in') return;
      for (var i = 0; i < 2; i++) {
        var p = S.p[i];
        if (!p.al || p.dn) continue;
        p.tt = r3(p.tt + dt);
        ev[WHO[i]].forEach(function (e) {
          if (!p.al || p.dn) return;
          var pad = -1, d = dirOf(e);
          if (d) pad = PP_D[d];
          else if (e.t === 'tap') {
            var lx = e.x - (e.x < 400 ? PP_CX[0] : PP_CX[1]), ly = e.y - PP_CY;
            for (var q = 0; q < 4; q++) if (Math.hypot(lx - PP_O[q][0] * PP_DST, ly - PP_O[q][1] * PP_DST) < PP_R + 8) pad = q;
          }
          if (pad < 0) return;
          p.lit = pad; p.lt = 0.22;
          if (pad === S.seq[p.k]) {
            p.k++;
            if (p.k >= S.r) { p.dn = 1; S.score[i] = S.r; addFx(S, 't', PP_CX[i], PP_CY - 150, '#4ade80', 'Nailed it!', 0.9, 24); }
          } else {
            p.al = 0; S.sh = 0.35;
            addFx(S, 'b', PP_CX[i], PP_CY, '#ff5a6a', '', 0.7); addFx(S, 't', PP_CX[i], PP_CY - 150, '#ff5a6a', 'OUT!', 1.2, 36);
          }
        });
      }
      if (S.t > ppLimit(S.r)) for (i = 0; i < 2; i++) if (S.p[i].al && !S.p[i].dn) { S.p[i].al = 0; S.sh = 0.3; addFx(S, 't', PP_CX[i], PP_CY - 150, '#ff5a6a', 'Too slow!', 1.2, 30); }
      var pending = S.p.some(function (q) { return q.al && !q.dn; });
      if (pending) return;
      var a0 = S.p[0].al, a1 = S.p[1].al;
      if (a0 && a1 && S.r < PP_MAX) { S.r++; S.st = 'gap'; S.t = 0; return; }
      S.result = ppJudge(S);
    },
    timeout: function (S) { return ppJudge(S); },
    draw: function (c, S, me, D, info) {
      D.bg(c, '#1c1240', '#07051a');
      var now = performance.now() / 1000, sd = ppSd(S.r), showLit = -1;
      if (S.st === 'show') {
        var idx = Math.floor((S.t - 0.5) / sd);
        if (S.t >= 0.5 && idx < S.r && (S.t - 0.5 - idx * sd) < sd * 0.68) showLit = S.seq[idx];
      }
      c.save(); shakeOn(c, S);
      for (var i = 0; i < 2; i++) {
        var p = S.p[i], who = WHO[i], cx = PP_CX[i], cy = PP_CY, out = !p.al;
        D.circle(c, cx, cy, 150, i ? 'rgba(88,199,255,.10)' : 'rgba(255,92,138,.10)', 0);
        for (var q = 0; q < 4; q++) {
          var x = cx + PP_O[q][0] * PP_DST, y = cy + PP_O[q][1] * PP_DST;
          var lit = S.st === 'show' ? showLit === q : (p.lit === q && p.lt > 0);
          c.save();
          if (out) c.globalAlpha = 0.3;
          if (lit) { c.shadowColor = PP_C[q][0]; c.shadowBlur = 40; }
          D.rrect(c, x - PP_R, y - PP_R, PP_R * 2, PP_R * 2, 22, lit ? PP_C[q][0] : PP_C[q][1], PP_C[q][0]);
          c.restore();
          D.text(c, PP_G[q], x, y + 2, 30, lit ? '#fff' : PP_C[q][0]);
        }
        D.player(c, cx, cy, 26, who, null, me === who);
        D.otext(c, info.names[who] + (me === who ? ' (you)' : ''), cx, 112, 18, HC[i]);
        if (out) { D.otext(c, '✗', cx, cy, 120, '#ff5a6a'); D.otext(c, 'OUT', cx, 432, 26, '#ff5a6a'); }
        else if (S.st === 'in') {
          D.otext(c, p.dn ? '✓ Done!' : 'Your turn!', cx, 432, 22, p.dn ? '#4ade80' : '#ffd166');
          var n = S.r, sp = Math.min(22, 260 / n);
          for (var k = 0; k < n; k++) D.circle(c, cx + (k - (n - 1) / 2) * sp, 466, Math.min(8, sp / 2.6), k < p.k ? HC[i] : 'rgba(255,255,255,.18)', 0);
        } else D.otext(c, 'Watch…', cx, 432, 22, '#a9a7d3');
      }
      var lbl = S.st === 'show' ? 'WATCH' : S.st === 'in' ? 'GO!' : 'NEXT';
      D.otext(c, lbl, 400, 250, 34, S.st === 'in' ? '#4ade80' : '#ffd166');
      D.otext(c, S.r + (S.r === 1 ? ' step' : ' steps'), 400, 292, 18, '#fff');
      if (S.st === 'in') D.bar(c, 350, 320, 100, 8, 1 - S.t / ppLimit(S.r), '#ffd166');
      drawFx(c, S, D);
      c.restore();
      D.hud(c, info, S.score[0], S.score[1], 'Round ' + S.r + ' / ' + PP_MAX + ' · one mistake and you are out');
    },
    bot: function (S, me, rnd) {
      var i = me === 'host' ? 0 : 1, p = S.p[i], none = { in: P.emptyIn(), ev: [] };
      if (S.st !== 'in' || !p.al || p.dn || S.t < 0.35 || rnd() > 0.2) return none;
      var pad = S.seq[p.k];
      if (rnd() < 0.006 * S.r) pad = (pad + 1 + Math.floor(rnd() * 3)) % 4;
      return { in: P.emptyIn(), ev: [{ t: 'key', k: PP_K[pad] }] };
    }
  });

  /* ================================================================
     7. MAZE RACE
     ================================================================ */
  var MZ = { C: 15, R: 9, cs: 45, ox: 62, oy: 86, gx: 7, gy: 4 };
  function mzGen(rnd) {
    var C = MZ.C, R = MZ.R, HW = 8, g = [], vis = [], k;
    for (k = 0; k < C * R; k++) g.push(0);
    for (k = 0; k < HW * R; k++) vis.push(0);
    function open(cx, cy, dir) {
      if (dir === 0) { g[cy * C + cx] |= 1; g[cy * C + (13 - cx)] |= 1; }
      else { g[cy * C + cx] |= 2; g[cy * C + (14 - cx)] |= 2; }
    }
    var st = [[Math.floor(rnd() * HW), Math.floor(rnd() * R)]];
    vis[st[0][1] * HW + st[0][0]] = 1;
    while (st.length) {
      var cur = st[st.length - 1], x = cur[0], y = cur[1], nb = [];
      if (x + 1 < HW && !vis[y * HW + x + 1]) nb.push([x + 1, y, x, y, 0]);
      if (x > 0 && !vis[y * HW + x - 1]) nb.push([x - 1, y, x - 1, y, 0]);
      if (y + 1 < R && !vis[(y + 1) * HW + x]) nb.push([x, y + 1, x, y, 1]);
      if (y > 0 && !vis[(y - 1) * HW + x]) nb.push([x, y - 1, x, y - 1, 1]);
      if (!nb.length) { st.pop(); continue; }
      var n = pick(nb, rnd);
      open(n[2], n[3], n[4]); vis[n[1] * HW + n[0]] = 1; st.push([n[0], n[1]]);
    }
    for (k = 0; k < 5; k++) {
      var ex = Math.floor(rnd() * HW), ey = Math.floor(rnd() * R), ed = rnd() < 0.5 ? 0 : 1;
      if ((ed === 0 && ex < HW - 1) || (ed === 1 && ey < R - 1)) open(ex, ey, ed);
    }
    return g.join('');
  }
  function mzCan(m, x, y, d) {
    var C = MZ.C;
    if (d === 'right') return x < C - 1 && (+m[y * C + x] & 1);
    if (d === 'left') return x > 0 && (+m[y * C + x - 1] & 1);
    if (d === 'down') return y < MZ.R - 1 && (+m[y * C + x] & 2);
    if (d === 'up') return y > 0 && (+m[(y - 1) * C + x] & 2);
    return false;
  }
  function mzReset(S, rnd) {
    S.m = mzGen(rnd);
    S.p = [{ x: 0, y: 0, pd: '', mt: 0, cd: 0, bz: 0 }, { x: MZ.C - 1, y: 0, pd: '', mt: 0, cd: 0, bz: 0 }];
    S.tr = [[], []]; S.st = 'go'; S.t = 0; S.win = -1;
  }
  P.add({
    id: 'maze-race', name: 'Maze Race', icon: '🌀', cat: 'Brain',
    howto: 'You start in opposite top corners of the same mirrored maze. Race to the trophy in the middle - first there wins the race. First to 2 trophies wins!',
    controls: 'Move: arrows / WASD (hold to run) · or hold the mouse',
    duration: 45,
    init: function (rnd) { var S = { score: [0, 0], race: 1, fx: [], sh: 0 }; mzReset(S, rnd); return S; },
    step: function (S, dt, inp, ev, rnd) {
      S.t = r3(S.t + dt); tickFx(S, dt);
      if (S.st === 'rev') {
        if (S.t > 1.8) { if (winnerByScore(S, 2, 'trophies')) return; S.race++; mzReset(S, rnd); }
        return;
      }
      for (var i = 0; i < 2; i++) {
        var p = S.p[i], k = inp[WHO[i]];
        if (p.cd > 0) p.cd = Math.max(0, r3(p.cd - dt));
        if (p.bz > 0) p.bz = Math.max(0, r3(p.bz - dt));
        var d = k.up ? 'up' : k.down ? 'down' : k.left ? 'left' : k.right ? 'right' : '';
        if (!d && k.pd) {
          var dx = k.px - (MZ.ox + p.x * MZ.cs + MZ.cs / 2), dy = k.py - (MZ.oy + p.y * MZ.cs + MZ.cs / 2);
          if (Math.abs(dx) > 18 || Math.abs(dy) > 18) d = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        }
        if (!d) { p.pd = ''; p.mt = 0; continue; }
        var go = false;
        if (d !== p.pd) { p.pd = d; p.mt = 0.18; go = true; }
        else { p.mt = r3(p.mt - dt); if (p.mt <= 0) { p.mt = 0.09; go = true; } }
        if (go && p.cd <= 0) {
          if (mzCan(S.m, p.x, p.y, d)) {
            S.tr[i].push(p.y * MZ.C + p.x); if (S.tr[i].length > 24) S.tr[i].shift();
            p.x += DV[d][0]; p.y += DV[d][1]; p.cd = 0.07;
          } else p.bz = 0.15;
        }
      }
      var at = [S.p[0].x === MZ.gx && S.p[0].y === MZ.gy, S.p[1].x === MZ.gx && S.p[1].y === MZ.gy];
      if (at[0] || at[1]) {
        var cx = MZ.ox + MZ.gx * MZ.cs + MZ.cs / 2, cy = MZ.oy + MZ.gy * MZ.cs + MZ.cs / 2;
        S.st = 'rev'; S.t = 0;
        if (at[0] && at[1]) { S.win = -1; addFx(S, 't', cx, cy - 40, '#fff', 'Dead heat!', 1.4, 34); }
        else { S.win = at[0] ? 0 : 1; S.score[S.win]++; addFx(S, 'b', cx, cy, HC[S.win], '', 1); addFx(S, 'b', cx, cy, '#ffd166', '', 0.7); }
      }
    },
    timeout: function (S) { return byScore(S, 'trophies'); },
    draw: function (c, S, me, D, info) {
      D.bg(c, '#123b3f', '#04181a', false);
      var now = performance.now() / 1000, C = MZ.C, R = MZ.R, cs = MZ.cs, ox = MZ.ox, oy = MZ.oy;
      c.save(); shakeOn(c, S);
      D.rrect(c, ox - 6, oy - 6, C * cs + 12, R * cs + 12, 14, 'rgba(0,0,0,.35)');
      for (var y = 0; y < R; y++) for (var x = 0; x < C; x++) if ((x + y) % 2) { c.fillStyle = 'rgba(255,255,255,.035)'; c.fillRect(ox + x * cs, oy + y * cs, cs, cs); }
      c.fillStyle = 'rgba(255,92,138,.25)'; c.fillRect(ox, oy, cs, cs);
      c.fillStyle = 'rgba(88,199,255,.25)'; c.fillRect(ox + (C - 1) * cs, oy, cs, cs);
      for (var i = 0; i < 2; i++) S.tr[i].forEach(function (t, n) {
        c.globalAlpha = 0.15 + 0.5 * n / S.tr[i].length;
        D.circle(c, ox + (t % C) * cs + cs / 2 + (i ? 4 : -4), oy + Math.floor(t / C) * cs + cs / 2, 5, HC[i], 0);
      });
      c.globalAlpha = 1;
      var gx = ox + MZ.gx * cs + cs / 2, gy = oy + MZ.gy * cs + cs / 2;
      D.circle(c, gx, gy, 20 + Math.sin(now * 5) * 3, 'rgba(255,209,102,.45)', 30);
      D.text(c, '🏆', gx, gy + 2, 30 + Math.sin(now * 5) * 2);
      c.save();
      c.strokeStyle = '#a58bff'; c.lineWidth = 6; c.lineCap = 'round'; c.shadowColor = '#7c5cff'; c.shadowBlur = 12;
      c.beginPath();
      for (y = 0; y < R; y++) for (x = 0; x < C; x++) {
        var v = +S.m[y * C + x], X = ox + x * cs, Y = oy + y * cs;
        if (x < C - 1 && !(v & 1)) { c.moveTo(X + cs, Y); c.lineTo(X + cs, Y + cs); }
        if (y < R - 1 && !(v & 2)) { c.moveTo(X, Y + cs); c.lineTo(X + cs, Y + cs); }
      }
      c.rect(ox, oy, C * cs, R * cs);
      c.stroke(); c.restore();
      var same = S.p[0].x === S.p[1].x && S.p[0].y === S.p[1].y;
      for (i = 0; i < 2; i++) {
        var p = S.p[i], px = ox + p.x * cs + cs / 2 + (same ? (i ? 8 : -8) : 0) + (p.bz > 0 ? Math.sin(now * 80) * 3 : 0);
        D.player(c, px, oy + p.y * cs + cs / 2, 15, WHO[i], null, me === WHO[i]);
      }
      if (S.st === 'rev') {
        D.rrect(c, 230, 220, 340, 70, 24, 'rgba(0,0,0,.6)');
        D.otext(c, S.win < 0 ? 'Dead heat!' : info.names[WHO[S.win]] + ' grabs it!', 400, 255, 32, S.win < 0 ? '#fff' : HC[S.win]);
      }
      drawFx(c, S, D);
      c.restore();
      D.hud(c, info, S.score[0], S.score[1], 'Race ' + S.race + ' · first to 2 trophies');
    },
    bot: function (S, me, rnd) {
      var i = me === 'host' ? 0 : 1, p = S.p[i], inp = P.emptyIn();
      if (S.st !== 'go' || rnd() < 0.15) return { in: inp, ev: [] };
      var C = MZ.C, N = C * MZ.R, dist = [], q = [MZ.gy * C + MZ.gx], k;
      for (k = 0; k < N; k++) dist.push(-1);
      dist[q[0]] = 0;
      var dirs = ['up', 'down', 'left', 'right'];
      for (var h = 0; h < q.length; h++) {
        var cx = q[h] % C, cy = Math.floor(q[h] / C);
        for (k = 0; k < 4; k++) if (mzCan(S.m, cx, cy, dirs[k])) {
          var nx = cx + DV[dirs[k]][0], ny = cy + DV[dirs[k]][1], ni = ny * C + nx;
          if (dist[ni] < 0) { dist[ni] = dist[q[h]] + 1; q.push(ni); }
        }
      }
      var here = dist[p.y * C + p.x];
      for (k = 0; k < 4; k++) if (mzCan(S.m, p.x, p.y, dirs[k])) {
        var ti = (p.y + DV[dirs[k]][1]) * C + p.x + DV[dirs[k]][0];
        if (dist[ti] === here - 1) { inp[dirs[k]] = 1; break; }
      }
      return { in: inp, ev: [] };
    }
  });
})();
