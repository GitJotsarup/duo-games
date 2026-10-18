/* Party Rush minigames: reference examples (Coin Grab, Reaction Duel).
   Copy this structure for new minigames. */
(function () {
  var P = window.PARTY, W = 800, H = 500;

  /* ---------------- Coin Grab ---------------- */
  P.add({
    id: 'coin-grab', name: 'Coin Grab', icon: '🪙', cat: 'Action',
    howto: 'Coins rain onto the arena. Run them over to collect them. Gold coins are worth 1, rare rainbow coins are worth 3. Most coins in 25 seconds wins!',
    controls: 'Move: WASD / arrow keys',
    duration: 25,
    init: function (rnd) {
      return { p: [{ x: 160, y: 260 }, { x: 640, y: 260 }], coins: [], score: [0, 0], sp: 0.3, id: 0, pops: [] };
    },
    step: function (S, dt, inp, ev, rnd) {
      ['host', 'guest'].forEach(function (who, i) {
        var k = inp[who], p = S.p[i];
        var vx = (k.right ? 1 : 0) - (k.left ? 1 : 0), vy = (k.down ? 1 : 0) - (k.up ? 1 : 0);
        var l = Math.hypot(vx, vy) || 1;
        p.x = Math.max(22, Math.min(W - 22, p.x + vx / l * 260 * dt));
        p.y = Math.max(92, Math.min(H - 22, p.y + vy / l * 260 * dt));
      });
      S.sp -= dt;
      if (S.sp <= 0 && S.coins.length < 7) {
        S.sp = 0.35 + rnd() * 0.45;
        S.coins.push({ i: S.id++, x: Math.round(40 + rnd() * (W - 80)), y: Math.round(110 + rnd() * (H - 150)), v: rnd() < 0.12 ? 3 : 1, t: 0 });
      }
      S.coins = S.coins.filter(function (c) {
        c.t += dt;
        var d0 = Math.hypot(c.x - S.p[0].x, c.y - S.p[0].y), d1 = Math.hypot(c.x - S.p[1].x, c.y - S.p[1].y);
        if (d0 < 34 || d1 < 34) {
          /* fair pickup: closer player gets it; exact tie is a coin flip */
          var i = d0 < d1 ? 0 : d1 < d0 ? 1 : (rnd() < 0.5 ? 0 : 1);
          S.score[i] += c.v; S.pops.push({ x: c.x, y: c.y, v: c.v, t: 0.6, w: i }); return false;
        }
        return c.t < 7;
      });
      S.pops = S.pops.filter(function (p) { p.t -= dt; return p.t > 0; });
      S.p.forEach(function (p) { p.x = Math.round(p.x * 10) / 10; p.y = Math.round(p.y * 10) / 10; });
    },
    timeout: function (S) { return P.defaultTimeout(S); },
    draw: function (c, S, me, D, info) {
      D.bg(c, '#1f1a4f', '#0d0b26');
      var t = performance.now() / 1000;
      S.coins.forEach(function (k) {
        var r = 13 + Math.sin(t * 6 + k.i) * 1.5;
        if (k.v === 3) { c.save(); c.shadowColor = '#fff'; c.shadowBlur = 24; var g = c.createLinearGradient(k.x - r, k.y - r, k.x + r, k.y + r); ['#ff5c8a', '#ffd166', '#4ade80', '#58c7ff', '#9b6bff'].forEach(function (col, i) { g.addColorStop(i / 4, col); }); c.fillStyle = g; c.beginPath(); c.arc(k.x, k.y, r + 3, 0, 7); c.fill(); c.restore(); }
        else D.circle(c, k.x, k.y, r, '#f5b31f', 16);
        D.text(c, k.v === 3 ? '3' : '$', k.x, k.y + 1, 13, '#5a3a00');
      });
      S.pops.forEach(function (p) { c.globalAlpha = Math.max(0, p.t / 0.6); D.otext(c, '+' + p.v, p.x, p.y - (0.6 - p.t) * 60, 22, p.w ? D.COL.guest : D.COL.host); c.globalAlpha = 1; });
      D.player(c, S.p[0].x, S.p[0].y, 22, 'host', info.names.host, me === 'host');
      D.player(c, S.p[1].x, S.p[1].y, 22, 'guest', info.names.guest, me === 'guest');
      D.hud(c, info, S.score[0], S.score[1]);
    },
    bot: function (S, me, rnd) {
      var i = me === 'host' ? 0 : 1, p = S.p[i], best = null, bd = 1e9;
      S.coins.forEach(function (k) { var d = Math.hypot(k.x - p.x, k.y - p.y) / k.v; if (d < bd) { bd = d; best = k; } });
      var inp = P.emptyIn();
      if (best) { if (best.x > p.x + 6) inp.right = 1; if (best.x < p.x - 6) inp.left = 1; if (best.y > p.y + 6) inp.down = 1; if (best.y < p.y - 6) inp.up = 1; }
      return { in: inp, ev: [] };
    }
  });

  /* ---------------- Reaction Duel ---------------- */
  P.add({
    id: 'reaction', name: 'Quick Draw', icon: '🤠', cat: 'Reflex',
    howto: 'Best of 3 duels. Wait until the sign says DRAW!, then fire first. Fire early and you lose the duel. Watch out for fake-outs!',
    controls: 'Fire: Space / click',
    duration: 40,
    init: function (rnd) { return { round: 0, wins: [0, 0], st: 'wait', t: 0, at: 1.8 + rnd() * 2.5, fake: rnd() < 0.4 ? 0.9 + rnd() * 0.8 : -1, msg: '', score: [0, 0], ms: [0, 0] }; },
    step: function (S, dt, inp, ev, rnd) {
      S.t += dt;
      var fire = [ev.host.some(isFire), ev.guest.some(isFire)];
      if (S.st === 'wait') {
        for (var i = 0; i < 2; i++) if (fire[i]) { win(S, 1 - i, (i ? 'Blue' : 'Pink') + ' fired too early!', rnd); return; }
        if (S.t >= S.at) { S.st = 'go'; S.t = 0; }
      } else if (S.st === 'go') {
        if (fire[0] && fire[1]) { win(S, -1, 'Simultaneous shot!', rnd); return; }
        if (fire[0] || fire[1]) { var w = fire[0] ? 0 : 1; S.ms[w] = Math.round(S.t * 1000); win(S, w, Math.round(S.t * 1000) + ' ms', rnd); return; }
        if (S.t > 3) win(S, -1, 'Nobody fired', rnd);
      } else if (S.st === 'gap') {
        if (S.t > 1.6) {
          if (S.wins[0] >= 2 || S.wins[1] >= 2 || S.round >= 5) { S.result = { winner: S.wins[0] > S.wins[1] ? 'host' : S.wins[1] > S.wins[0] ? 'guest' : 'tie', text: S.wins[0] + ' - ' + S.wins[1] + ' duels' }; return; }
          S.st = 'wait'; S.t = 0; S.at = 1.8 + rnd() * 2.5; S.fake = rnd() < 0.4 ? 0.9 + rnd() * 0.8 : -1; S.msg = '';
        }
      }
      S.score = S.wins.slice();
    },
    draw: function (c, S, me, D, info) {
      var go = S.st === 'go';
      D.bg(c, go ? '#1c7a45' : '#5a2a1a', go ? '#0b3a20' : '#1d0d08', false);
      c.fillStyle = '#3a2412'; c.fillRect(0, 380, W, 120);
      c.fillStyle = 'rgba(0,0,0,.25)'; for (var x = 0; x < W; x += 60) c.fillRect(x, 380, 30, 120);
      var fakeNow = S.st === 'wait' && S.fake > 0 && S.t > S.fake && S.t < S.fake + 0.45;
      D.rrect(c, W / 2 - 150, 120, 300, 110, 18, go ? '#ffd166' : fakeNow ? '#ff9f43' : '#2b1a10', '#000');
      D.text(c, go ? 'DRAW!' : fakeNow ? 'DRAAA...no' : S.st === 'gap' ? S.msg : 'Wait for it…', W / 2, 175, go ? 64 : fakeNow ? 34 : S.st === 'gap' ? 26 : 34, go ? '#1a1033' : '#fff');
      [['host', 170], ['guest', 630]].forEach(function (a, i) {
        var x = a[1], y = 330;
        D.player(c, x, y, 34, a[0], info.names[a[0]], me === a[0]);
        c.fillStyle = '#333'; c.fillRect(i ? x - 70 : x + 30, y + 2, 40, 10);
        for (var k = 0; k < 2; k++) D.circle(c, x - 18 + k * 36, 440, 12, k < S.wins[i] ? '#ffd166' : 'rgba(255,255,255,.15)', k < S.wins[i] ? 14 : 0);
      });
      D.hud(c, info, S.wins[0], S.wins[1], 'Duel ' + Math.min(S.round + 1, 5) + ' · first to 2');
    },
    bot: function (S, me, rnd) {
      var inp = P.emptyIn();
      if (S.st === 'go' && S.t > 0.22 + rnd() * 0.15) return { in: inp, ev: [{ t: 'a' }] };
      return { in: inp, ev: [] };
    }
  });
  function isFire(e) { return e.t === 'a' || e.t === 'tap'; }
  function win(S, w, msg, rnd) {
    if (w >= 0) S.wins[w]++;
    S.round++; S.st = 'gap'; S.t = 0; S.msg = msg; S.score = S.wins.slice();
  }
})();
