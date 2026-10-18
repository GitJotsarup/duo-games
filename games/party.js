/* Party Rush - 5-game minigame rush built on a small host-authoritative engine.
   Minigames live in games/party/mg-*.js and register with PARTY.add({...}).
   See the MINIGAME API comment below. */
(function () {
  'use strict';
  var W = 800, H = 500;
  var PARTY = window.PARTY = window.PARTY || { games: [], add: function (g) { this.games.push(g); } };

  /* ------------------------------------------------------------------
     MINIGAME API
     PARTY.add({
       id:'coin-grab', name:'Coin Grab', icon:'🪙', cat:'Action',
       howto:'One or two sentences on how to win.',
       controls:'Move: WASD / arrows',            // shown on the ready screen
       duration:30,                                // hard cap in seconds
       luck:false,                                 // true if a bot can't reliably beat an idle player
       init:function(rnd){ return state },         // host only; rnd() = seeded float in [0,1)
       step:function(S, dt, inp, ev, rnd){},        // host only, ~30x/sec.
           // inp.host / inp.guest = {up,down,left,right,a,b,px,py,pd} (held state; px/py pointer in 800x500 coords, pd = pointer down)
           // ev.host / ev.guest = array of events since last step: {t:'a'} {t:'b'} {t:'tap',x,y} {t:'key',k:'q'}
           // set S.result = {winner:'host'|'guest'|'tie', text:'5 - 3 coins'} to finish early.
       timeout:function(S){ return result },        // optional: called when duration runs out (default: compare S.score)
       draw:function(c, S, me, D, info){},          // both clients render from S. c = CanvasRenderingContext2D (800x500 logical),
           // me = 'host'|'guest', D = PARTY.draw helpers, info = {left: secondsLeft, names:{host,guest}}
       bot:function(S, me, rnd){ return {in:{...}, ev:[...]} }  // test bot: returns held input + events for player `me`
     });
     Rules: S must be plain JSON (no functions, no class instances), small (< 8 KB serialised),
     and step() must be deterministic given inputs + rnd. All game logic in step(); draw() is read-only.
  ------------------------------------------------------------------ */

  var COL = { host: '#ff5c8a', guest: '#58c7ff', gold: '#ffd166', good: '#4ade80', bad: '#ff5a6a', ink: '#f6f5ff', dim: '#a9a7d3', violet: '#9b6bff' };
  var FONT = 'Outfit,system-ui,sans-serif';
  var D = PARTY.draw = {
    W: W, H: H, COL: COL, FONT: FONT,
    /* themed background: radial gradient + faint grid */
    bg: function (c, a, b, grid) {
      var g = c.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, W * 0.7);
      g.addColorStop(0, a || '#1d1848'); g.addColorStop(1, b || '#0c0a22');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      if (grid !== false) {
        c.strokeStyle = 'rgba(255,255,255,.045)'; c.lineWidth = 1; c.beginPath();
        for (var x = 0; x <= W; x += 40) { c.moveTo(x, 0); c.lineTo(x, H); }
        for (var y = 0; y <= H; y += 40) { c.moveTo(0, y); c.lineTo(W, y); }
        c.stroke();
      }
    },
    text: function (c, t, x, y, size, col, align, weight) {
      c.font = (weight || 800) + ' ' + (size || 24) + 'px ' + FONT;
      c.textAlign = align || 'center'; c.textBaseline = 'middle';
      c.fillStyle = col || COL.ink; c.fillText(String(t), x, y);
    },
    /* text with dark outline for readability over busy scenes */
    otext: function (c, t, x, y, size, col, align) {
      c.font = '800 ' + (size || 24) + 'px ' + FONT; c.textAlign = align || 'center'; c.textBaseline = 'middle';
      c.lineWidth = Math.max(3, (size || 24) / 6); c.strokeStyle = 'rgba(0,0,0,.65)'; c.strokeText(String(t), x, y);
      c.fillStyle = col || COL.ink; c.fillText(String(t), x, y);
    },
    rrect: function (c, x, y, w, h, r, fill, stroke) {
      c.beginPath();
      if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h);
      if (fill) { c.fillStyle = fill; c.fill(); }
      if (stroke) { c.strokeStyle = stroke; c.lineWidth = 2; c.stroke(); }
    },
    circle: function (c, x, y, r, col, glow) {
      c.save();
      if (glow) { c.shadowColor = col; c.shadowBlur = glow; }
      var g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.22, col); g.addColorStop(1, col);
      c.fillStyle = g; c.beginPath(); c.arc(x, y, Math.max(0.1, r), 0, Math.PI * 2); c.fill(); c.restore();
    },
    /* standard player token: glowing ball with face + name tag. isMe adds a white ring. */
    player: function (c, x, y, r, who, name, isMe) {
      D.circle(c, x, y, r, COL[who], 18);
      if (isMe) { c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.arc(x, y, r + 4, 0, Math.PI * 2); c.stroke(); }
      c.fillStyle = '#1a1033';
      c.beginPath(); c.arc(x - r * 0.3, y - r * 0.15, r * 0.12, 0, 7); c.arc(x + r * 0.3, y - r * 0.15, r * 0.12, 0, 7); c.fill();
      c.strokeStyle = '#1a1033'; c.lineWidth = Math.max(1.5, r * 0.08); c.beginPath(); c.arc(x, y + r * 0.1, r * 0.35, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
      if (name) D.otext(c, name, x, y - r - 14, 14, '#fff');
    },
    bar: function (c, x, y, w, h, frac, col, back) {
      D.rrect(c, x, y, w, h, h / 2, back || 'rgba(255,255,255,.12)');
      if (frac > 0) D.rrect(c, x, y, Math.max(h, w * Math.min(1, frac)), h, h / 2, col);
    },
    /* top HUD: two score pills + timer */
    hud: function (c, info, sh, sg, label) {
      /* dark-backed pills so the HUD stays readable on bright scenes */
      D.rrect(c, 16, 12, 150, 44, 22, 'rgba(14,10,40,.82)', 'rgba(255,92,138,.75)');
      D.rrect(c, W - 166, 12, 150, 44, 22, 'rgba(14,10,40,.82)', 'rgba(88,199,255,.75)');
      D.text(c, info.names.host, 34, 34, 15, '#fff', 'left', 700);
      D.text(c, sh, 150, 34, 24, COL.host, 'right');
      D.text(c, info.names.guest, W - 148, 34, 15, '#fff', 'left', 700);
      D.text(c, sg, W - 32, 34, 24, COL.guest, 'right');
      var left = Math.max(0, Math.ceil(info.left));
      D.rrect(c, W / 2 - 40, 12, 80, 44, 22, 'rgba(14,10,40,.82)', 'rgba(255,255,255,.35)');
      D.text(c, left, W / 2, 34, 24, left <= 5 ? COL.bad : '#fff');
      if (label) {
        c.font = '600 13px ' + FONT; var lw = c.measureText(String(label)).width + 22;
        D.rrect(c, W / 2 - lw / 2, 61, lw, 20, 10, 'rgba(14,10,40,.7)');
        D.text(c, label, W / 2, 71, 13, '#d9d7f5', 'center', 600);
      }
    },
    clamp: function (v, a, b) { return v < a ? a : v > b ? b : v; },
    dist: function (ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }
  };

  function rngFrom(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function emptyIn() { return { up: 0, down: 0, left: 0, right: 0, a: 0, b: 0, px: W / 2, py: H / 2, pd: 0 }; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); }
  function byId(id) { for (var i = 0; i < PARTY.games.length; i++) if (PARTY.games[i].id === id) return PARTY.games[i]; return null; }
  function defaultTimeout(S) {
    var sc = S.score || [0, 0];
    return { winner: sc[0] > sc[1] ? 'host' : sc[1] > sc[0] ? 'guest' : 'tie', text: sc[0] + ' - ' + sc[1] };
  }
  PARTY.defaultTimeout = defaultTimeout;
  PARTY.rng = rngFrom;
  PARTY.emptyIn = emptyIn;

  var ROUNDS = 5, WIN_COINS = 10, TIE_COINS = 5;

  var CSS = '' +
    '.pr{max-width:960px;margin:0 auto}' +
    '.pr-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;flex-wrap:wrap}' +
    '.pr-title{font-weight:800;font-size:1.5rem;background:linear-gradient(90deg,#ff5c8a,#ffd166,#58c7ff);-webkit-background-clip:text;background-clip:text;color:transparent}' +
    '.pr-pill{background:rgba(255,255,255,.07);border:1px solid var(--line);border-radius:999px;padding:6px 14px;font-weight:700}' +
    '.pr-pill .h{color:var(--host)}.pr-pill .g{color:var(--guest)}' +
    '.pr-panel{background:linear-gradient(150deg,var(--card2),var(--card));border:1px solid var(--line);border-radius:24px;padding:24px;box-shadow:var(--shadow);text-align:center}' +
    '.pr-panel h2{margin:.2em 0;font-size:2rem}' +
    '.pr-big{font-size:4rem;line-height:1;filter:drop-shadow(0 8px 20px rgba(0,0,0,.4))}' +
    '.pr-how{font-size:1.15rem;max-width:560px;margin:10px auto;line-height:1.45}' +
    '.pr-ctl{display:inline-block;background:rgba(255,209,102,.12);border:1px solid rgba(255,209,102,.35);color:var(--gold);border-radius:12px;padding:8px 14px;font-weight:700;margin:6px 0 14px}' +
    '.pr-ready{display:flex;justify-content:center;gap:14px;margin:12px 0;flex-wrap:wrap}' +
    '.pr-rd{border-radius:999px;padding:8px 16px;font-weight:700;border:1px solid var(--line);background:rgba(255,255,255,.05)}' +
    '.pr-rd.on{background:rgba(74,222,128,.18);border-color:rgba(74,222,128,.6);color:var(--good)}' +
    '.pr-panel button.big{max-width:360px}' +
    '.pr-lineup{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin:14px 0}' +
    '.pr-lu{background:rgba(255,255,255,.06);border:1px solid var(--line);border-radius:16px;padding:10px 14px;min-width:120px}' +
    '.pr-lu b{display:block;font-size:1.8rem}' +
    '.pr-lu.cur{border-color:var(--gold);box-shadow:0 0 0 2px rgba(255,209,102,.35)}.pr-lu.done{opacity:.55}' +
    '.pr-modes{display:flex;gap:10px;justify-content:center;margin:10px 0}' +
    '.pr-modes button.sel{outline:3px solid #fff}' +
    '.pr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;margin-top:14px;text-align:left}' +
    '.pr-tile{background:rgba(255,255,255,.05);color:var(--ink);border:1px solid var(--line);border-radius:14px;padding:10px;box-shadow:none;font-weight:700;font-size:.92rem;position:relative}' +
    '.pr-tile span{display:block;font-size:1.6rem}' +
    '.pr-tile small{display:block;color:var(--dim);font-weight:500;font-size:.75rem}' +
    '.pr-tile.sel{background:rgba(255,209,102,.16);border-color:var(--gold)}' +
    '.pr-tile .n{position:absolute;top:6px;right:8px;background:var(--gold);color:#1a1033;border-radius:999px;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:.8rem}' +
    '.pr-stage{position:relative}' +
    '.pr-cv{width:100%;display:block;border-radius:22px;border:1px solid var(--line);background:#12102c;box-shadow:var(--shadow),0 0 60px rgba(155,107,255,.12);touch-action:none;user-select:none}' +
    '.pr-hint{text-align:center;color:var(--dim);margin-top:8px;font-size:.92rem}' +
    '.pr-win{font-size:2.6rem;font-weight:800;margin:.2em 0}' +
    '.pr-coins{display:flex;justify-content:center;gap:16px;margin:14px 0;flex-wrap:wrap}' +
    '.pr-coin{border-radius:20px;padding:14px 22px;border:1px solid var(--line);background:rgba(255,255,255,.05);min-width:170px}' +
    '.pr-coin b{display:block;font-size:2rem}.pr-coin.h b{color:var(--host)}.pr-coin.g b{color:var(--guest)}' +
    '.pr-coin.lead{box-shadow:0 0 0 2px var(--gold)}';

  registerGame({
    id: 'rush', icon: '🎉', name: 'Party Rush',
    blurb: 'A 5-game rush picked from 35 Mario-Party-style minigames. Both ready up before every game.',
    start: function (ctx) {
      var me = ctx.me, isHost = ctx.isHost, partner = me === 'host' ? 'guest' : 'host';
      var names = ctx.names, root = ctx.root;
      var rnd = rngFrom(ctx.seed ^ 0x51ed27);
      var speed = (typeof window.PARTY_SPEED === 'number' && window.PARTY_SPEED > 0) ? window.PARTY_SPEED : 1;
      var bots = !!window.PARTY_BOTS;
      var dead = false, timers = [], raf = 0;

      /* meta state: host-authoritative, mirrored to guest */
      var M = { ph: 'lobby', r: 0, mode: 'random', list: [], picks: [], sc: { host: 0, guest: 0 }, ready: { host: 0, guest: 0 }, res: null, hist: [], reroll: 0, v: 0 };
      var S = null, elapsed = 0, countLeft = 0;               // live minigame state (host computes, guest mirrors)
      var myIn = emptyIn(), myEv = [], gIn = emptyIn(), gEv = [], hEv = [];
      var lastSent = '', sendT = 0, botT = 0;

      var style = document.createElement('style'); style.textContent = CSS;
      root.innerHTML = '<div class="pr"></div>'; root.appendChild(style);
      var box = root.querySelector('.pr');

      function pickRandom() {
        var r = rngFrom(ctx.seed + 991 * (M.reroll + 1));
        var ids = PARTY.games.map(function (g) { return g.id; });
        for (var i = ids.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = ids[i]; ids[i] = ids[j]; ids[j] = t; }
        return ids.slice(0, ROUNDS);
      }
      if (isHost) M.list = pickRandom();

      /* ---------- networking ---------- */
      function pushMeta() { M.v++; ctx.send({ k: 'm', m: M }); render(); }
      function onMsg(d) {
        if (dead || !d) return;
        if (!isHost) {
          if (d.k === 'pi') { ctx.send({ k: 'po', t: d.t }); return; }
          if (d.k === 'm' && d.m && d.m.v > M.v) { var oldPh = M.ph, oldR = M.r; M = d.m; if (M.r !== oldR || (M.ph !== oldPh && (M.ph === 'howto' || M.ph === 'lobby'))) S = null; render(); if (M.ph === 'final') endAll(); }
          else if (d.k === 's' && (M.ph === 'play' || M.ph === 'count')) { S = d.s; elapsed = d.e; countLeft = d.c || 0; }
          return;
        }
        /* host receives guest requests */
        if (d.k === 'po') { var x = performance.now() - d.t; rtt = rtt ? rtt * 0.7 + x * 0.3 : x; lag = Math.min(250, rtt / 2 + 16); return; }
        if (d.k === 'in') { if (d.i) gIn = d.i; if (d.ev && d.ev.length) gEv = gEv.concat(d.ev.slice(0, 40)); }
        else if (d.k === 'ready') hostReady('guest', d.ph, d.r);
      }

      /* ---------- host flow ---------- */
      function hostReady(who, ph, r) {
        if (ph !== M.ph || r !== M.r) return;
        if (M.ph !== 'howto' && M.ph !== 'result') return;
        if (M.ready[who]) return;
        M.ready[who] = 1;
        if (M.ready.host && M.ready.guest) {
          if (M.ph === 'howto') beginCount(); else nextRound();
        } else pushMeta();
      }
      function hostStart() {
        if (M.ph !== 'lobby') return;
        if (M.mode === 'pick') { if (M.picks.length !== ROUNDS) return; M.list = M.picks.slice(); }
        M.ph = 'howto'; M.r = 0; M.ready = { host: 0, guest: 0 }; pushMeta();
      }
      function beginCount() {
        var g = byId(M.list[M.r]);
        S = g.init(rngFrom(ctx.seed * 31 + M.r * 7919 + 17));
        elapsed = 0; countLeft = 3;
        M.ph = 'count'; M.ready = { host: 0, guest: 0 }; pushMeta();
        gIn = emptyIn(); gEv = []; hEv = []; hostQ = []; snaps = []; delayedHostInput.last = null; myIn = emptyIn();
        ctx.send({ k: 's', s: S, e: 0, c: countLeft });
      }
      function finishGame(res) {
        res = res || { winner: 'tie', text: '' };
        if (res.winner !== 'host' && res.winner !== 'guest') res.winner = 'tie';
        if (res.winner === 'tie') { M.sc.host += TIE_COINS; M.sc.guest += TIE_COINS; }
        else M.sc[res.winner] += WIN_COINS;
        M.hist.push({ id: M.list[M.r], w: res.winner });
        M.res = { winner: res.winner, text: String(res.text || '') };
        M.ph = 'result'; M.ready = { host: 0, guest: 0 };
        ctx.send({ k: 's', s: S, e: elapsed, c: 0 });
        pushMeta();
      }
      function nextRound() {
        if (M.r + 1 >= M.list.length) { M.ph = 'final'; M.ready = { host: 0, guest: 0 }; pushMeta(); endAll(); return; }
        M.r++; M.ph = 'howto'; M.res = null; M.ready = { host: 0, guest: 0 }; S = null; pushMeta();
      }
      var simT = 0, bcastT = 0, rr = rngFrom(ctx.seed * 13 + 5);
      /* Latency equalisation: the guest sees state ~one-way-latency late and its inputs reach the host
         ~one-way-latency late. The host therefore applies its OWN inputs after the same delay and renders
         the snapshot from the same delay ago, so neither seat has an advantage. */
      var rtt = 0, lag = 0, hostQ = [], snaps = [];
      if (isHost) timers.push(setInterval(function () { if (!dead) ctx.send({ k: 'pi', t: performance.now() }); }, 1000));
      function delayedHostInput(now) {
        hostQ.push({ at: now, in: JSON.parse(JSON.stringify(myIn)), ev: hEv }); hEv = [];
        var use = null, ev = [];
        while (hostQ.length && hostQ[0].at <= now - lag) { var q = hostQ.shift(); use = q.in; ev = ev.concat(q.ev); }
        if (use) delayedHostInput.last = use;
        return { in: delayedHostInput.last || emptyIn(), ev: ev };
      }
      function hostTick(dt) {
        if (M.ph === 'count') {
          countLeft -= dt;
          bcastT += dt; if (bcastT > 0.1) { bcastT = 0; ctx.send({ k: 's', s: S, e: 0, c: countLeft }); }
          if (countLeft <= 0) { M.ph = 'play'; pushMeta(); hEv = []; gEv = []; }
          return;
        }
        if (M.ph !== 'play' || !S) return;
        var g = byId(M.list[M.r]);
        var evG = gEv; gEv = [];
        if (bots) { var bh = safeBot(g, viewState() || S, 'host'); myIn = bh.in; hEv = hEv.concat(bh.ev); }
        var hd = delayedHostInput(performance.now());
        var evH = hd.ev;
        var inp = { host: hd.in, guest: gIn };
        try { g.step(S, dt, inp, { host: evH, guest: evG }, rr); }
        catch (e) { console.error('[party] step error in', g.id, e); S.result = { winner: 'tie', text: 'Game error' }; }
        elapsed += dt;
        bcastT += dt;
        if (bcastT >= 1 / 31) {
          bcastT = 0; ctx.send({ k: 's', s: S, e: elapsed, c: 0 });
          snaps.push({ t: performance.now(), s: JSON.stringify(S), e: elapsed });
          while (snaps.length > 40) snaps.shift();
        }
        if (S.result) { finishGame(S.result); return; }
        if (elapsed >= g.duration) {
          var res; try { res = g.timeout ? g.timeout(S) : defaultTimeout(S); } catch (e) { res = { winner: 'tie', text: '' }; }
          finishGame(res);
        }
      }
      function safeBot(g, st, who) {
        try { var b = g.bot ? g.bot(st, who, Math.random) : null; return { in: (b && b.in) || emptyIn(), ev: (b && b.ev) || [] }; }
        catch (e) { return { in: emptyIn(), ev: [] }; }
      }
      var ended = false;
      function endAll() {
        if (ended) return; ended = true;
        var h = M.sc.host, gg = M.sc.guest;
        var t = h === gg ? 'Dead heat! 🤝' : ((h > gg ? 'host' : 'guest') === me ? 'You win Party Rush! 👑' : esc(names[h > gg ? 'host' : 'guest']) + ' wins Party Rush! 👑');
        var wins = { host: 0, guest: 0 }; M.hist.forEach(function (x) { if (x.w !== 'tie') wins[x.w]++; });
        ctx.end(t, names.host + ' ' + h + ' coins (' + wins.host + ' wins) - ' + names.guest + ' ' + gg + ' coins (' + wins.guest + ' wins)');
      }

      /* ---------- guest flow ---------- */
      function sendReady() {
        if (M.ready[me]) return;
        if (isHost) hostReady('host', M.ph, M.r);
        else { M.ready[me] = 1; render(); ctx.send({ k: 'ready', ph: M.ph, r: M.r }); }
      }

      /* ---------- main loop ---------- */
      var lastT = performance.now();
      var loopId = setInterval(function () {
        if (dead) return;
        var now = performance.now(); var dt = Math.min(0.1, (now - lastT) / 1000) * speed; lastT = now;
        if (isHost) { simT += dt; while (simT >= 1 / 30) { simT -= 1 / 30; hostTick(1 / 30); } }
        else if (M.ph === 'play') {
          /* test bots: decide at the same 30 Hz cadence as the host's bot so neither seat reacts faster */
          botT += dt;
          if (bots && S && botT >= 1 / 30) { botT = 0; var g = byId(M.list[M.r]); var b = safeBot(g, S, 'guest'); myIn = b.in; myEv = myEv.concat(b.ev); }
          sendT += dt;
          var js = JSON.stringify(myIn);
          if (myEv.length || (js !== lastSent && sendT > 0.03)) { ctx.send({ k: 'in', i: myIn, ev: myEv }); myEv = []; lastSent = js; sendT = 0; }
        }
      }, 1000 / 60);
      timers.push(loopId);

      function frame() {
        if (dead) return;
        raf = requestAnimationFrame(frame);
        drawCanvas();
      }
      raf = requestAnimationFrame(frame);

      /* ---------- input ---------- */
      var KEYS = { arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down', arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right' };
      function active() { return !dead && M.ph === 'play' && root.isConnected; }
      function pushEv(e) { if (isHost) hEv.push(e); else myEv.push(e); }
      function onKey(e, down) {
        if (!active() || bots) return;
        var k = (e.key || '').toLowerCase();
        if (e.target && /input|textarea/i.test(e.target.tagName)) return;
        if (KEYS[k]) { myIn[KEYS[k]] = down ? 1 : 0; e.preventDefault(); }
        if (k === ' ' || k === 'enter') { myIn.a = down ? 1 : 0; e.preventDefault(); if (down && !e.repeat) pushEv({ t: 'a' }); }
        if (k === 'shift' || k === 'e' || k === 'x') { myIn.b = down ? 1 : 0; if (down && !e.repeat) pushEv({ t: 'b' }); }
        if (down && !e.repeat && k.length <= 9) pushEv({ t: 'key', k: k });
      }
      function kd(e) { onKey(e, true); }
      function ku(e) { onKey(e, false); }
      window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
      function ptr(e, kind) {
        if (!active() || bots) return;
        var cv = e.currentTarget, r = cv.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width * W, y = (e.clientY - r.top) / r.height * H;
        myIn.px = Math.round(x); myIn.py = Math.round(y);
        if (kind === 'down') { myIn.pd = 1; pushEv({ t: 'tap', x: Math.round(x), y: Math.round(y) }); e.preventDefault(); }
        if (kind === 'up') myIn.pd = 0;
      }

      /* ---------- rendering ---------- */
      var cv = null, c2 = null;
      var snapCache = { raw: null, obj: null, e: 0 };
      function viewState() {
        if (!isHost || M.ph !== 'play' || !snaps.length) return null;
        var target = performance.now() - lag, pick = snaps[0];
        for (var i = 0; i < snaps.length; i++) if (snaps[i].t <= target) pick = snaps[i];
        if (snapCache.raw !== pick.s) { snapCache.raw = pick.s; snapCache.obj = JSON.parse(pick.s); snapCache.e = pick.e; }
        return snapCache.obj;
      }
      function drawCanvas() {
        if (!cv || !S) return;
        var g = byId(M.list[M.r]); if (!g) return;
        var VS = viewState() || S, ve = VS === S ? elapsed : snapCache.e;
        c2.save();
        try { g.draw(c2, VS, me, D, { left: g.duration - ve, names: names, count: countLeft }); }
        catch (e) { D.bg(c2); D.text(c2, 'Render error: ' + e.message, W / 2, H / 2, 16); }
        c2.restore();
        if (M.ph === 'count' && countLeft > 0) {
          c2.fillStyle = 'rgba(7,6,20,.55)'; c2.fillRect(0, 0, W, H);
          var n = Math.ceil(countLeft), f = countLeft - Math.floor(countLeft);
          D.otext(c2, n, W / 2, H / 2, 120 + 60 * f, COL.gold);
          D.otext(c2, g.name, W / 2, H / 2 + 110, 28, '#fff');
        }
        if (M.ph === 'result') { c2.fillStyle = 'rgba(7,6,20,.35)'; c2.fillRect(0, 0, W, H); }
      }
      function scorePill() {
        return '<span class="pr-pill"><span class="h">' + esc(names.host) + ' ' + M.sc.host + '🪙</span> &nbsp;·&nbsp; <span class="g">' + esc(names.guest) + ' ' + M.sc.guest + '🪙</span></span>';
      }
      function lineup() {
        return '<div class="pr-lineup">' + M.list.map(function (id, i) {
          var g = byId(id) || { icon: '?', name: id };
          var cls = 'pr-lu' + (i === M.r && M.ph !== 'lobby' ? ' cur' : '') + (i < M.r || (i === M.r && (M.ph === 'result' || M.ph === 'final')) ? ' done' : '');
          return '<div class="' + cls + '"><b>' + g.icon + '</b>' + esc(g.name) + '</div>';
        }).join('') + '</div>';
      }
      function readyRow() {
        return '<div class="pr-ready"><span class="pr-rd' + (M.ready.host ? ' on' : '') + '">' + (M.ready.host ? '✅ ' : '⏳ ') + esc(names.host) + '</span>' +
          '<span class="pr-rd' + (M.ready.guest ? ' on' : '') + '">' + (M.ready.guest ? '✅ ' : '⏳ ') + esc(names.guest) + '</span></div>';
      }
      var lastKey = '';
      function render() {
        if (dead) return;
        var key = M.ph + '|' + M.r + '|' + M.v;
        if (key === lastKey && (M.ph === 'play' || M.ph === 'count')) return;
        lastKey = key;
        var top = '<div class="pr-top"><span class="pr-title">🎉 Party Rush</span>' +
          (M.ph !== 'lobby' ? '<span class="pr-pill">Game ' + Math.min(M.r + 1, ROUNDS) + ' / ' + ROUNDS + '</span>' : '') + scorePill() + '</div>';
        var h = top;
        if (M.ph === 'lobby') {
          h += '<div class="pr-panel"><h2>Tonight\'s lineup</h2>' +
            '<p class="tip">Win a game: +' + WIN_COINS + ' coins · Tie: +' + TIE_COINS + ' each · Most coins after 5 games wins.</p>';
          if (isHost) {
            h += '<div class="pr-modes"><button class="pr-mode-random ' + (M.mode === 'random' ? 'sel' : 'ghost') + '">🎲 Random 5</button>' +
              '<button class="pr-mode-pick ' + (M.mode === 'pick' ? 'sel' : 'ghost') + '">✋ Pick 5</button></div>';
          }
          if (M.mode === 'random') {
            h += lineup() + (isHost ? '<button class="ghost pr-reroll">🔀 Reroll lineup</button><br>' : '');
          } else {
            h += '<p class="tip">' + (isHost ? 'Pick ' + ROUNDS + ' games (' + M.picks.length + '/' + ROUNDS + ')' : esc(names.host) + ' is picking games (' + M.picks.length + '/' + ROUNDS + ')') + '</p><div class="pr-grid">' +
              PARTY.games.map(function (g) {
                var i = M.picks.indexOf(g.id);
                return '<button class="pr-tile' + (i >= 0 ? ' sel' : '') + '" data-id="' + g.id + '"' + (isHost ? '' : ' disabled') + '><span>' + g.icon + '</span>' + esc(g.name) + '<small>' + esc(g.cat || '') + '</small>' + (i >= 0 ? '<i class="n">' + (i + 1) + '</i>' : '') + '</button>';
              }).join('') + '</div>';
          }
          h += isHost ? '<br><button class="big pink pr-start"' + (M.mode === 'pick' && M.picks.length !== ROUNDS ? ' disabled' : '') + '>Start Party Rush</button>'
            : '<p class="tip">Waiting for ' + esc(names.host) + ' to start…</p>';
          h += '</div>';
        } else if (M.ph === 'howto') {
          var g = byId(M.list[M.r]);
          h += lineup() + '<div class="pr-panel"><div class="pr-big">' + g.icon + '</div><h2>' + esc(g.name) + '</h2>' +
            '<p class="pr-how">' + esc(g.howto) + '</p><div class="pr-ctl">🎮 ' + esc(g.controls) + '</div>' + readyRow() +
            '<button class="big pink pr-ready-btn"' + (M.ready[me] ? ' disabled' : '') + '>' + (M.ready[me] ? 'Waiting for ' + esc(names[partner]) + '…' : "I'm ready!") + '</button></div>';
        } else if (M.ph === 'count' || M.ph === 'play' || M.ph === 'result') {
          var g2 = byId(M.list[M.r]);
          h += '<div class="pr-stage"><canvas class="pr-cv" width="' + W + '" height="' + H + '"></canvas></div><p class="pr-hint">🎮 ' + esc(g2.controls) + '</p>';
          if (M.ph === 'result') {
            var w = M.res.winner;
            var title = w === 'tie' ? "It's a tie! 🤝" : (w === me ? 'You win! 🎉' : esc(names[w]) + ' wins!');
            h += '<div class="pr-panel" style="margin-top:14px"><div class="pr-win">' + title + '</div><p class="tip">' + esc(M.res.text) + '</p>' +
              '<div class="pr-coins"><div class="pr-coin h' + (M.sc.host >= M.sc.guest ? ' lead' : '') + '">' + esc(names.host) + '<b>' + M.sc.host + ' 🪙</b></div>' +
              '<div class="pr-coin g' + (M.sc.guest >= M.sc.host ? ' lead' : '') + '">' + esc(names.guest) + '<b>' + M.sc.guest + ' 🪙</b></div></div>' + readyRow() +
              '<button class="big pink pr-next"' + (M.ready[me] ? ' disabled' : '') + '>' + (M.ready[me] ? 'Waiting for ' + esc(names[partner]) + '…' : (M.r + 1 >= M.list.length ? 'See final results' : 'Next game')) + '</button></div>';
          }
        } else if (M.ph === 'final') {
          h += lineup() + '<div class="pr-panel"><div class="pr-big">👑</div><h2>Party Rush complete!</h2>' +
            '<div class="pr-coins"><div class="pr-coin h">' + esc(names.host) + '<b>' + M.sc.host + ' 🪙</b></div><div class="pr-coin g">' + esc(names.guest) + '<b>' + M.sc.guest + ' 🪙</b></div></div></div>';
        }
        var hadCv = !!cv;
        box.innerHTML = h;
        cv = box.querySelector('.pr-cv'); c2 = cv ? cv.getContext('2d') : null;
        if (cv) {
          cv.addEventListener('pointerdown', function (e) { ptr(e, 'down'); });
          cv.addEventListener('pointermove', function (e) { ptr(e, 'move'); });
          cv.addEventListener('pointerup', function (e) { ptr(e, 'up'); });
          if (!hadCv) myIn = emptyIn();
        }
      }
      box.addEventListener('click', function (e) {
        var t = e.target.closest('button'); if (!t || t.disabled) return;
        if (t.classList.contains('pr-ready-btn') || t.classList.contains('pr-next')) { sendReady(); return; }
        if (!isHost) return;
        if (t.classList.contains('pr-start')) hostStart();
        else if (t.classList.contains('pr-mode-random')) { M.mode = 'random'; pushMeta(); }
        else if (t.classList.contains('pr-mode-pick')) { M.mode = 'pick'; pushMeta(); }
        else if (t.classList.contains('pr-reroll')) { M.reroll++; M.list = pickRandom(); pushMeta(); }
        else if (t.classList.contains('pr-tile')) {
          var id = t.getAttribute('data-id'), i = M.picks.indexOf(id);
          if (i >= 0) M.picks.splice(i, 1); else if (M.picks.length < ROUNDS) M.picks.push(id);
          pushMeta();
        }
      });

      if (isHost) pushMeta(); else render();
      if (!isHost) ctx.send({ k: 'hi' });

      return {
        onMsg: function (d) { if (isHost && d && d.k === 'hi') { pushMeta(); return; } onMsg(d); },
        destroy: function () {
          dead = true; timers.forEach(clearInterval); cancelAnimationFrame(raf);
          window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku);
          root.innerHTML = '';
        },
        _t: { M: function () { return M; }, S: function () { return S; } }
      };
    }
  });
})();
