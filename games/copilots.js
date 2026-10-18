/* Co-Pilots - cooperative 2 player landing game plugin for Duo Games.
   An original co-op dice game inspired by the idea behind Sky Team: two pilots
   secretly roll dice and silently share them out across the cockpit to land a plane.
   Host-authoritative: the host owns the full state and rolls every die; the guest only
   ever receives its own unplaced dice (the Captain's unplaced dice are masked). */
(function () {
  'use strict';

  /* ================= pure rules (exposed as _t for tests) ================= */
  var ROUNDS = 7, MAXC = 3, CRASH_TILT = 3;
  var DIFFS = {
    train: { id: 'train', name: 'Training flight', icon: '🌤️', N: 5, traffic: 3, cap: 2, tol: 1, coffee: 1,
      blurb: '5 spaces to the runway, light traffic, 1 coffee to start, land within 1 of level.' },
    storm: { id: 'storm', name: 'Stormy approach', icon: '⛈️', N: 6, traffic: 7, cap: 3, tol: 0, coffee: 0,
      blurb: '6 spaces, heavy traffic, no starting coffee, wings must be perfectly level.' }
  };
  var GEAR = [[1, 2], [3, 4], [5, 6]];
  var FLAP = [[1, 2], [2, 3], [4, 5], [5, 6]];
  var BRAKE = [2, 4, 6];
  var SLOTS = ['axis', 'eng', 'radio', 'coffee', 'gear0', 'gear1', 'gear2', 'flap', 'brake'];
  var ROLE = { host: 'Captain', guest: 'First Officer' };
  var LBL = { axis: 'Axis', eng: 'Engines', radio: 'Radio', coffee: 'Coffee', gear0: 'Gear 1-2', gear1: 'Gear 3-4', gear2: 'Gear 5-6', flap: 'Flaps', brake: 'Brakes' };

  function mul(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function oth(p) { return p === 'host' ? 'guest' : 'host'; }
  function cnt(a) { var n = 0; for (var i = 0; i < a.length; i++) if (a[i]) n++; return n; }
  function alt(r) { return Math.max(0, (ROUNDS - r) * 1000); }
  function lohi(S) { return [4 + cnt(S.gear), 8 + cnt(S.flaps)]; }
  function speedFor(S, sum) { var t = lohi(S); return sum <= t[0] ? 0 : sum > t[1] ? 2 : 1; }
  function brakeVal(S) { return S.brakes.length ? S.brakes[S.brakes.length - 1] : 0; }
  function inR(v, a) { return v >= a[0] && v <= a[1]; }
  function fmtTilt(t) { return t === 0 ? 'level' : Math.abs(t) + (t > 0 ? ' right' : ' left'); }
  function emptyRS() { return { axis: { host: 0, guest: 0 }, eng: { host: 0, guest: 0 }, radio: { host: [0], guest: [0, 0] }, coffee: [] }; }
  function logp(S, t) { S.log.push(t); if (S.log.length > 80) S.log.shift(); }

  function newGame(diff, seed, mk) {
    mk = mk || mul;
    var D = DIFFS[diff] || DIFFS.train, r = mk((seed | 0) + 4242), traffic = [], i, placed = 0, guard = 0;
    for (i = 0; i <= D.N; i++) traffic.push(0);
    while (placed < D.traffic && guard++ < 1000) {
      i = 1 + Math.floor(r() * D.N);
      if (traffic[i] < D.cap) { traffic[i]++; placed++; }
    }
    return {
      seed: seed | 0, diff: D.id, N: D.N, r: 1, phase: 'brief', pos: 0, traffic: traffic, traffic0: traffic.slice(),
      tilt: 0, gear: [0, 0, 0], flaps: [0, 0, 0, 0], brakes: [], coffee: D.coffee,
      dice: { host: [], guest: [] }, rs: emptyRS(), turn: 'host', placed: 0, speed: 0, adv: null,
      ready: { host: false, guest: false }, log: ['Cleared for approach: ' + D.name + '. ' + placed + ' aircraft in the pattern.'],
      result: null, prev: null, last: null
    };
  }
  function startRound(S, mk) {
    mk = mk || mul;
    var r = mk((S.seed | 0) + S.r * 7919 + 13);
    ['host', 'guest'].forEach(function (p) {
      S.dice[p] = [0, 1, 2, 3].map(function () { return { v: 1 + Math.floor(r() * 6), used: false, at: null, pv: 0 }; });
    });
    S.rs = emptyRS(); S.turn = 'host'; S.phase = 'place'; S.placed = 0; S.speed = 0; S.adv = null;
    S.ready = { host: false, guest: false };
    logp(S, (S.r === ROUNDS ? 'FINAL APPROACH. ' : '') + 'Round ' + S.r + ' at ' + alt(S.r) + ' ft: dice rolled.');
  }
  function mandLeft(S, who) { return (S.rs.axis[who] ? 0 : 1) + (S.rs.eng[who] ? 0 : 1); }
  function canPlace(S, who, d, s, t) {
    if (!S || S.phase !== 'place' || S.turn !== who) return false;
    var hand = S.dice[who], die = hand && hand[d];
    if (!die || die.used || !die.v) return false;
    t = t | 0;
    if (Math.abs(t) > S.coffee) return false;
    var v = die.v + t;
    if (v < 1 || v > 6) return false;
    var left = 0;
    for (var i = 0; i < hand.length; i++) if (!hand[i].used) left++;
    if (left <= mandLeft(S, who) && s !== 'axis' && s !== 'eng') return false;
    switch (s) {
      case 'axis': return !S.rs.axis[who];
      case 'eng': return !S.rs.eng[who];
      case 'radio': return S.rs.radio[who].indexOf(0) >= 0;
      case 'coffee': return t === 0 && S.rs.coffee.length < 3;
      case 'gear0': case 'gear1': case 'gear2':
        var g = +s.charAt(4);
        return who === 'host' && !S.gear[g] && inR(v, GEAR[g]);
      case 'flap':
        var f = S.flaps.indexOf(0);
        return who === 'guest' && f >= 0 && inR(v, FLAP[f]);
      case 'brake':
        var b = S.brakes.length;
        return who === 'host' && b < 3 && v === BRAKE[b];
    }
    return false;
  }
  function legal(S, who) {
    var out = [];
    if (!S || S.phase !== 'place' || S.turn !== who) return out;
    S.dice[who].forEach(function (die, d) {
      if (die.used) return;
      for (var t = -S.coffee; t <= S.coffee; t++) {
        SLOTS.forEach(function (s) { if (canPlace(S, who, d, s, t)) out.push({ d: d, s: s, t: t }); });
      }
    });
    return out;
  }
  function crash(S, why, detail) {
    S.phase = 'over';
    S.result = { win: false, why: why, detail: detail || '' };
    logp(S, 'CRASH: ' + why + (detail ? ' (' + detail + ')' : ''));
  }
  function advance(S, n) {
    for (var k = 0; k < n; k++) {
      if (S.traffic[S.pos] > 0) {
        crash(S, 'Mid-air collision with traffic', S.traffic[S.pos] + ' aircraft still in your airspace when the engines pushed you on');
        return false;
      }
      S.pos++;
      if (S.pos > S.N) {
        S.pos = S.N + 1;
        crash(S, 'Overshot the runway: approach too fast', 'the engines carried you past the airport');
        return false;
      }
    }
    return true;
  }
  function place(S, who, mv) {
    if (!mv || !canPlace(S, who, mv.d | 0, mv.s, mv.t | 0)) return false;
    var t = mv.t | 0, d = mv.d | 0, s = mv.s, die = S.dice[who][d], v = die.v + t, rs = S.rs, idx = 0;
    S.coffee -= Math.abs(t);
    die.used = true; die.at = s; die.pv = v;
    var msg = ROLE[who] + ' placed ' + v + (t ? ' (' + die.v + (t > 0 ? '+' : '') + t + ' coffee)' : '') + ' on ' + LBL[s];
    var after = null;
    if (s === 'axis') {
      rs.axis[who] = v;
      if (rs.axis.host && rs.axis.guest) {
        var dt = rs.axis.guest - rs.axis.host;
        S.tilt += dt;
        msg += dt ? '. The plane banks ' + Math.abs(dt) + ' ' + (dt > 0 ? 'right' : 'left') + ' (now ' + fmtTilt(S.tilt) + ')' : '. Axis balanced (' + fmtTilt(S.tilt) + ')';
        if (Math.abs(S.tilt) >= CRASH_TILT) after = ['Lost control: the plane banked too far', 'axis reached ' + fmtTilt(S.tilt)];
      }
    } else if (s === 'eng') {
      rs.eng[who] = v;
      if (rs.eng.host && rs.eng.guest) {
        var sum = rs.eng.host + rs.eng.guest;
        S.speed = sum;
        if (S.r >= ROUNDS) {
          msg += '. Touchdown speed ' + sum + ' (brakes ' + brakeVal(S) + ')';
        } else {
          var a = speedFor(S, sum);
          S.adv = a;
          msg += '. Speed ' + sum + ': ' + (a === 0 ? 'holding position' : 'advance ' + a);
          logp(S, msg); msg = null;
          if (!advance(S, a)) return true;
        }
      }
    } else if (s === 'radio') {
      idx = rs.radio[who].indexOf(0);
      rs.radio[who][idx] = v;
      var tg = S.pos + v - 1;
      if (tg <= S.N && S.traffic[tg] > 0) {
        S.traffic[tg]--;
        msg += '. Traffic ' + (v === 1 ? 'in your space' : (v - 1) + ' ahead') + ' cleared';
      } else msg += '. No traffic at that distance';
    } else if (s === 'coffee') {
      rs.coffee.push({ v: v, who: who });
      var before = S.coffee;
      S.coffee = Math.min(MAXC, S.coffee + 1);
      msg += S.coffee > before ? '. +1 coffee' : '. (coffee already full)';
    } else if (s.indexOf('gear') === 0) {
      S.gear[+s.charAt(4)] = v; msg += '. Gear ' + cnt(S.gear) + '/3 down';
    } else if (s === 'flap') {
      S.flaps[S.flaps.indexOf(0)] = v; msg += '. Flaps ' + cnt(S.flaps) + '/4';
    } else if (s === 'brake') {
      S.brakes.push(v); msg += '. Brakes armed at ' + v;
    }
    if (msg) logp(S, msg);
    S.last = { who: who, s: s, v: v, n: (S.last ? S.last.n : 0) + 1 };
    if (after) { crash(S, after[0], after[1]); return true; }
    S.placed++;
    if (S.placed >= 8) endRound(S);
    else S.turn = oth(who);
    return true;
  }
  function endRound(S) {
    S.prev = {
      r: S.r,
      dice: { host: S.dice.host.map(function (x) { return [x.v, x.pv, x.at]; }), guest: S.dice.guest.map(function (x) { return [x.v, x.pv, x.at]; }) },
      speed: S.speed, adv: S.adv, tilt: S.tilt, pos: S.pos
    };
    if (S.r >= ROUNDS) { landing(S); return; }
    if (S.r === ROUNDS - 1 && S.pos < S.N) {
      crash(S, 'Ran out of altitude short of the runway', (S.N - S.pos) + ' approach space' + (S.N - S.pos > 1 ? 's' : '') + ' still to fly');
      return;
    }
    S.r++;
    S.phase = 'brief';
    S.ready = { host: false, guest: false };
    logp(S, 'Descending through ' + alt(S.r) + ' ft.');
  }
  function landingProblems(S) {
    var D = DIFFS[S.diff], p = [];
    if (S.pos !== S.N) p.push('Not at the runway');
    if (S.traffic[S.N] > 0) p.push('Traffic still on the runway');
    if (Math.abs(S.tilt) > D.tol) p.push('Wings not level on touchdown');
    if (cnt(S.gear) < 3) p.push('Landing gear not fully down');
    if (cnt(S.flaps) < 4) p.push('Flaps not fully extended');
    if (S.speed >= brakeVal(S)) p.push('Overran the runway: too fast for the brakes');
    return p;
  }
  function landing(S) {
    var p = landingProblems(S), D = DIFFS[S.diff];
    if (p.length) {
      var det = { 'Traffic still on the runway': S.traffic[S.N] + ' aircraft on the runway',
        'Wings not level on touchdown': 'axis ' + fmtTilt(S.tilt) + ', allowed ' + (D.tol ? '1' : '0'),
        'Landing gear not fully down': cnt(S.gear) + '/3 gear',
        'Flaps not fully extended': cnt(S.flaps) + '/4 flaps',
        'Overran the runway: too fast for the brakes': 'speed ' + S.speed + ' vs brakes ' + brakeVal(S) };
      crash(S, p[0], (det[p[0]] || '') + (p.length > 1 ? '; also: ' + p.slice(1).join(', ').toLowerCase() : ''));
      return;
    }
    S.phase = 'over';
    S.result = { win: true, why: 'Smooth landing', detail: 'Speed ' + S.speed + ' under brakes ' + brakeVal(S) + ', axis ' + fmtTilt(S.tilt) };
    logp(S, 'Touchdown! Smooth landing.');
  }
  function ready(S, who, mk) {
    if (!S || S.phase !== 'brief' || S.ready[who]) return false;
    S.ready[who] = true;
    if (S.ready.host && S.ready.guest) startRound(S, mk);
    return true;
  }

  /* ================= presentation ================= */
  var EMO = ['👍', '😬', '🙏', '✈️', '☕', '🎯'];
  var CALL = ['Clear the traffic', 'Gear and flaps', 'Watch our speed', 'Keep her level', 'Save the coffee'];
  var PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function pips(v) {
    var h = '', on = PIPS[v] || [];
    for (var i = 0; i < 9; i++) h += '<i' + (on.indexOf(i) >= 0 ? ' class="p"' : '') + '></i>';
    return h;
  }
  function dieHtml(v, who, extra, attrs, tag) {
    tag = tag || 'span';
    return '<' + tag + ' class="cp-die ' + (who === 'host' ? 'cap' : 'fo') + ' ' + (extra || '') + '" ' + (attrs || '') + '>' + pips(v) + '</' + tag + '>';
  }
  function pol(cx, cy, r, deg) { var a = (deg - 90) * Math.PI / 180; return (cx + r * Math.cos(a)).toFixed(1) + ' ' + (cy + r * Math.sin(a)).toFixed(1); }
  function arcD(cx, cy, r, a0, a1) { return 'M' + pol(cx, cy, r, a0) + ' A' + r + ' ' + r + ' 0 ' + (a1 - a0 > 180 ? 1 : 0) + ' 1 ' + pol(cx, cy, r, a1); }
  function spdAng(v) { return -120 + (Math.max(2, Math.min(12, v)) - 2) * 24; }

  var CSS = '' +
    '.cp{--cap:#3d9bff;--fo:#ff9a3c;--glow:#5dffb0;--panel:#0b1020;--metal:#151c30;max-width:980px;margin:0 auto;position:relative;font-family:var(--font,system-ui)}' +
    '.cp::before{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;background:radial-gradient(800px 420px at 50% -10%,rgba(61,155,255,.22),transparent 60%),radial-gradient(600px 360px at 100% 100%,rgba(255,154,60,.14),transparent 60%)}' +
    '.cp.final::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:1;box-shadow:inset 0 0 120px rgba(255,60,60,.35);animation:cppulse 1.6s ease-in-out infinite}' +
    '@keyframes cppulse{50%{box-shadow:inset 0 0 60px rgba(255,60,60,.15)}}' +
    '.cp .pnl{background:linear-gradient(180deg,#121a30,#0a0f1d);border:1px solid rgba(120,160,255,.16);border-radius:20px;padding:14px;margin:10px 0;box-shadow:0 14px 34px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.06),inset 0 0 0 3px rgba(0,0,0,.25);position:relative}' +
    '.cp .pnl::before,.cp .pnl::after{content:"";position:absolute;top:8px;width:6px;height:6px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#8d97b3,#2a3149);box-shadow:0 1px 1px rgba(0,0,0,.6)}.cp .pnl::before{left:8px}.cp .pnl::after{right:8px}' +
    '.cp .top{display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:space-between}' +
    '.cp .altm{font-family:ui-monospace,Consolas,monospace;font-size:1.7rem;font-weight:800;color:var(--glow);text-shadow:0 0 12px rgba(93,255,176,.7);background:#03060c;border:1px solid #1d2a44;border-radius:12px;padding:4px 14px;letter-spacing:.06em}' +
    '.cp .altm small{font-size:.75rem;color:#4ea883;margin-left:4px}' +
    '.cp .rdots{display:flex;gap:5px;align-items:center}.cp .rdots i{width:12px;height:12px;border-radius:50%;background:#1a2340;border:1px solid #2c3a60}.cp .rdots i.d{background:#2b6e57}.cp .rdots i.c{background:var(--glow);box-shadow:0 0 10px var(--glow)}.cp .rdots i.f{border-color:#ff5a5a}.cp .rdots i.f.c{background:#ff5a5a;box-shadow:0 0 12px #ff5a5a}' +
    '.cp .badge{border-radius:999px;padding:5px 12px;font-weight:700;font-size:.85rem;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12)}' +
    '.cp .turn{font-weight:800;padding:7px 16px;border-radius:999px;background:#0a1222;border:1px solid #233457;letter-spacing:.02em}' +
    '.cp .turn.me{color:#06140d;background:linear-gradient(135deg,#9dffcf,#2fd88a);box-shadow:0 0 18px rgba(47,216,138,.55);animation:cpbeat 1.4s ease-in-out infinite}' +
    '.cp .turn.fa{color:#fff;background:linear-gradient(135deg,#ff6b6b,#b3122a);box-shadow:0 0 18px rgba(255,80,80,.6)}' +
    '@keyframes cpbeat{50%{transform:scale(1.04)}}' +
    '.cp .crew{display:flex;justify-content:space-between;gap:10px;margin-top:10px}' +
    '.cp .cm{flex:1;display:flex;align-items:center;gap:8px;padding:7px 12px;border-radius:14px;background:#0a1020;border:1px solid #1f2b47;position:relative;min-width:0}' +
    '.cp .cm.host{border-left:4px solid var(--cap)}.cp .cm.guest{border-right:4px solid var(--fo);flex-direction:row-reverse;text-align:right}' +
    '.cp .cm b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cp .cm small{color:var(--dim);display:block;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase}' +
    '.cp .cm.on{box-shadow:0 0 0 2px rgba(93,255,176,.45),0 0 18px rgba(93,255,176,.25)}' +
    '.cp .cap-t{color:var(--cap)}.cp .fo-t{color:var(--fo)}' +
    '.cp .bub{position:absolute;top:-16px;font-size:1.5rem;background:#fff;color:#111;border-radius:16px;padding:2px 10px;box-shadow:0 6px 16px rgba(0,0,0,.5);animation:cpbub 2.6s ease-out forwards;white-space:nowrap;font-size:1.1rem;font-weight:700;z-index:3}' +
    '.cp .cm.host .bub{left:40%}.cp .cm.guest .bub{right:40%}' +
    '@keyframes cpbub{0%{transform:translateY(10px) scale(.6);opacity:0}12%{transform:none;opacity:1}80%{opacity:1}100%{transform:translateY(-14px);opacity:0}}' +
    /* approach map */
    '.cp .map{position:relative;padding:8px 6px 4px}' +
    '.cp .map h4{margin:0 0 6px;font-size:.78rem;letter-spacing:.16em;text-transform:uppercase;color:#7f8fb8}' +
    '.cp .trk{position:relative;display:grid;gap:4px}' +
    '.cp .sp{height:58px;border-radius:10px;background:repeating-linear-gradient(90deg,#0d1a30 0 10px,#0b1628 10px 20px);border:1px solid #1d2c4c;display:flex;align-items:center;justify-content:center;gap:2px;position:relative;flex-wrap:wrap}' +
    '.cp .sp.past{opacity:.35}' +
    '.cp .sp.ap{background:linear-gradient(90deg,#1a1f2b,#262b38);border-color:#5b6684}' +
    '.cp .sp.ap::before{content:"";position:absolute;left:8%;right:8%;top:50%;border-top:3px dashed rgba(255,255,255,.55)}' +
    '.cp .sp.ap::after{content:"RWY";position:absolute;bottom:2px;right:6px;font-size:.6rem;color:#aab3cc;letter-spacing:.1em}' +
    '.cp .tf{font-size:1.15rem;display:inline-block;transform:rotate(225deg);filter:drop-shadow(0 0 6px rgba(255,90,90,.9)) hue-rotate(-30deg);position:relative;z-index:1}' +
    '.cp .tf.gone{animation:cpgone .9s ease-in forwards}' +
    '@keyframes cpgone{to{transform:rotate(225deg) translate(-30px,-30px) scale(.2);opacity:0}}' +
    '.cp .rl{display:grid;gap:4px;margin-top:3px}.cp .rl span{font-size:.68rem;text-align:center;color:#6f80a8}.cp .rl span b{color:#b9c6ea}' +
    '.cp .me-pl{position:absolute;top:29px;transform:translate(-50%,-50%) rotate(45deg);font-size:1.9rem;transition:left 1s cubic-bezier(.4,1.3,.5,1);filter:drop-shadow(0 0 10px rgba(93,255,176,.9));z-index:2;pointer-events:none}' +
    '.cp .me-pl.boom{filter:drop-shadow(0 0 14px #ff4d4d);font-size:2.3rem}' +
    /* dashboard */
    '.cp .dash{display:grid;grid-template-columns:1fr 1.5fr 1fr;gap:10px}' +
    '@media (max-width:760px){.cp .dash{grid-template-columns:1fr 1fr}.cp .dash .mid{grid-column:1/-1;order:-1}}' +
    '.cp .col{border-radius:16px;padding:10px;background:#090e1b;border:1px solid #1b2643}' +
    '.cp .col.c{box-shadow:inset 0 3px 0 var(--cap)}.cp .col.f{box-shadow:inset 0 3px 0 var(--fo)}' +
    '.cp .grp{margin:4px 0 10px}.cp .grp>small{display:block;font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;color:#7f8fb8;margin-bottom:5px}' +
    '.cp .sl{display:flex;gap:6px;flex-wrap:wrap;align-items:flex-end}' +
    '.cp button.slot{min-width:48px;height:48px;border-radius:12px;border:2px dashed rgba(140,190,255,.22);background:rgba(0,0,0,.45);color:#71809f;font-size:.72rem;font-weight:700;padding:3px;margin:0;box-shadow:inset 0 2px 8px rgba(0,0,0,.7);display:inline-flex;align-items:center;justify-content:center;transition:box-shadow .2s,border-color .2s}' +
    '.cp button.slot:disabled{opacity:1;cursor:default}' +
    '.cp button.slot.ok{border-style:solid;border-color:var(--glow);color:var(--glow);box-shadow:0 0 0 3px rgba(93,255,176,.12),0 0 16px rgba(93,255,176,.5);animation:cpglow 1s ease-in-out infinite alternate}' +
    '@keyframes cpglow{to{box-shadow:0 0 0 5px rgba(93,255,176,.2),0 0 24px rgba(93,255,176,.8)}}' +
    '.cp button.slot.full{border-style:solid;border-color:rgba(255,255,255,.08);padding:0;background:rgba(0,0,0,.25)}' +
    '.cp button.slot.mine{border-color:rgba(255,255,255,.18)}' +
    '.cp .swb{display:flex;flex-direction:column;align-items:center;gap:4px}' +
    '.cp .sw{width:22px;height:40px;border-radius:12px;background:#03050a;border:1px solid #2a3350;position:relative;box-shadow:inset 0 2px 6px rgba(0,0,0,.8)}' +
    '.cp .sw b{position:absolute;left:3px;right:3px;top:3px;height:16px;border-radius:8px;background:linear-gradient(#d4dbea,#6f7a90);box-shadow:0 2px 3px rgba(0,0,0,.6)}' +
    '.cp .sw.on b{top:19px;background:linear-gradient(#b4ffdc,#25c27c);box-shadow:0 0 12px #2fd88a}' +
    '.cp .sw.flip b{animation:cpflip .55s cubic-bezier(.3,1.6,.5,1)}' +
    '@keyframes cpflip{0%{top:3px;background:linear-gradient(#d4dbea,#6f7a90)}100%{top:19px}}' +
    '.cp .led{width:15px;height:15px;border-radius:50%;background:#2a0c0e;border:1px solid #4a1a1e;box-shadow:inset 0 2px 4px rgba(0,0,0,.8)}' +
    '.cp .led.on{background:radial-gradient(circle at 40% 35%,#ffd0d0,#ff2d3d 60%);box-shadow:0 0 14px #ff2d3d;animation:cpled .5s ease-out}' +
    '@keyframes cpled{0%{transform:scale(1.8)}}' +
    '.cp .mid{display:flex;flex-direction:column;gap:8px;align-items:stretch}' +
    '.cp .gauge{display:flex;align-items:center;justify-content:center;gap:8px}' +
    '.cp .gauge svg{width:150px;max-width:44vw;height:auto;filter:drop-shadow(0 0 14px rgba(61,155,255,.25))}' +
    '.cp .gl{font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;color:#7f8fb8;text-align:center}' +
    '.cp .zl{display:flex;justify-content:center;gap:6px;flex-wrap:wrap;font-size:.72rem;margin-top:2px}.cp .zl span{padding:2px 7px;border-radius:999px;background:#0a1222;border:1px solid #1f2b47}' +
    '.cp .cups{display:flex;align-items:center;gap:8px;justify-content:center;flex-wrap:wrap}' +
    '.cp .tok{display:flex;gap:4px}.cp .tok i{width:20px;height:20px;border-radius:50%;background:#1b1410;border:1px solid #3d2c1f;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:.75rem}.cp .tok i.on{background:radial-gradient(circle at 35% 30%,#ffe2b0,#b5651d);box-shadow:0 0 10px rgba(255,170,80,.6)}' +
    /* dice */
    '.cp .cp-die{width:56px;height:56px;border-radius:13px;padding:7px;display:inline-grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:1px;margin:6px;border:0;vertical-align:middle;position:relative;transition:transform .18s,box-shadow .18s}' +
    '.cp .cp-die i{display:block;border-radius:50%;margin:1px}.cp .cp-die i.p{background:radial-gradient(circle at 35% 30%,#56607a,#0b1020 65%);box-shadow:inset 0 1px 2px rgba(0,0,0,.7),0 1px 0 rgba(255,255,255,.5)}' +
    '.cp .cp-die.cap{background:linear-gradient(145deg,#e6f2ff 0%,#9dccff 45%,#3d8ef0 100%);box-shadow:inset -4px -5px 0 rgba(0,0,0,.16),inset 3px 3px 0 rgba(255,255,255,.7),0 5px 0 #1d4f99,0 10px 18px rgba(0,0,0,.55)}' +
    '.cp .cp-die.fo{background:linear-gradient(145deg,#fff2e2 0%,#ffcf96 45%,#f5861d 100%);box-shadow:inset -4px -5px 0 rgba(0,0,0,.16),inset 3px 3px 0 rgba(255,255,255,.7),0 5px 0 #a8560c,0 10px 18px rgba(0,0,0,.55)}' +
    '.cp button.cp-die:hover:not(:disabled){transform:translateY(-4px) rotate(-3deg)}' +
    '.cp button.cp-die:disabled{opacity:.55}' +
    '.cp .cp-die.sel{transform:translateY(-10px) scale(1.08)!important;outline:3px solid #fff;outline-offset:2px}' +
    '.cp .cp-die.sel::after{content:"";position:absolute;inset:-8px;border-radius:18px;box-shadow:0 0 22px rgba(93,255,176,.8);pointer-events:none}' +
    '.cp .cp-die.roll{animation:cproll .8s cubic-bezier(.2,.9,.3,1.25) both}' +
    '.cp .cp-die.roll:nth-child(2){animation-delay:.08s}.cp .cp-die.roll:nth-child(3){animation-delay:.16s}.cp .cp-die.roll:nth-child(4){animation-delay:.24s}' +
    '@keyframes cproll{0%{transform:translate(-60px,-50px) rotate(-320deg) scale(.5);opacity:0}70%{transform:translateY(4px) rotate(8deg)}100%{transform:none;opacity:1}}' +
    '.cp .cp-die.mini{width:38px;height:38px;padding:4px;border-radius:9px;margin:0}' +
    '.cp .cp-die.mini i.p{box-shadow:none}' +
    '.cp .cp-die.drop{animation:cpdrop .5s cubic-bezier(.3,1.6,.5,1)}' +
    '@keyframes cpdrop{0%{transform:translateY(-26px) scale(1.4);opacity:0}100%{transform:none;opacity:1}}' +
    '.cp .cp-die.back{background:repeating-linear-gradient(45deg,#24304f 0 6px,#1a2440 6px 12px);box-shadow:inset 0 0 0 2px rgba(255,255,255,.1),0 4px 0 #0c1224,0 8px 14px rgba(0,0,0,.5)}' +
    '.cp .cp-die.back::before{content:"?";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#5e6f9a;font-weight:800;font-size:1.4rem}' +
    '.cp .cp-die.back.mini::before{font-size:1rem}' +
    '.cp .cp-die.spent{opacity:.18}' +
    '.cp .tray{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}' +
    '.cp .hand{display:flex;align-items:center;flex-wrap:wrap}' +
    '.cp .adj{display:flex;align-items:center;gap:6px;background:#100c08;border:1px solid #3d2c1f;border-radius:14px;padding:6px 10px}' +
    '.cp .adj button{padding:6px 12px;margin:0;background:linear-gradient(135deg,#ffd9a3,#d9822b)}' +
    '.cp .prompt{text-align:center;font-weight:800;padding:10px 12px;border-radius:12px;color:var(--glow);background:linear-gradient(90deg,transparent,rgba(93,255,176,.1),transparent);border:1px solid rgba(93,255,176,.3);margin-bottom:8px}' +
    '.cp .prompt.wait{color:#9fb0d9;border-color:#25365c;background:none}' +
    '.cp .prompt small{display:block;font-weight:600;color:#9fb0d9;margin-top:2px}' +
    '.cp .emo{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:6px}' +
    '.cp .emo button{padding:6px 12px;margin:0;font-size:1.15rem;background:#121a30;color:#fff;border:1px solid #26365c;box-shadow:none}' +
    '.cp .emo button.call{font-size:.82rem}' +
    '.cp .chk{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:6px;margin-top:6px}' +
    '.cp .chk span{font-size:.82rem;padding:6px 10px;border-radius:10px;background:#0a1020;border:1px solid #1f2b47;color:#a9b7da}' +
    '.cp .chk span.ok{border-color:rgba(93,255,176,.45);color:var(--glow)}.cp .chk span.bad{border-color:rgba(255,90,90,.5);color:#ff8a8a}' +
    '.cp .chk span::before{content:"\\25CB  "}.cp .chk span.ok::before{content:"\\2714  "}.cp .chk span.bad::before{content:"\\26A0  "}' +
    '.cp .brief{text-align:center}.cp .brief h3{font-size:1.5rem;margin:.2em 0}' +
    '.cp .brief.fa h3{font-size:2.2rem;color:#ff6b6b;letter-spacing:.12em;text-shadow:0 0 18px rgba(255,80,80,.8);animation:cpfa 1s ease-in-out infinite alternate}' +
    '@keyframes cpfa{to{text-shadow:0 0 34px rgba(255,80,80,1);transform:scale(1.04)}}' +
    '.cp .rev{display:flex;justify-content:center;gap:18px;flex-wrap:wrap;margin:8px 0}.cp .rev>div{background:#0a1020;border:1px solid #1f2b47;border-radius:14px;padding:6px 10px}.cp .rev small{display:block;color:var(--dim)}' +
    '.cp .diffs{display:grid;grid-template-columns:1fr 1fr;gap:12px}@media (max-width:560px){.cp .diffs{grid-template-columns:1fr}}' +
    '.cp .diffs button{text-align:left;padding:16px;border-radius:16px;color:#fff;background:linear-gradient(150deg,#1a2a4c,#0d1630);border:1px solid #2c4170}' +
    '.cp .diffs button.storm{background:linear-gradient(150deg,#3a1630,#170a1d);border-color:#6b2a55}' +
    '.cp .diffs button b{display:block;font-size:1.2rem}.cp .diffs button small{color:#b5c0de;font-weight:500}' +
    '.cp .log{max-height:150px;overflow:auto;font-family:ui-monospace,Consolas,monospace;font-size:.78rem;color:#7cf2b9;background:#020509;border-radius:10px;padding:8px 10px;border:1px solid #13213a}' +
    '.cp .log div{padding:2px 0;border-bottom:1px dotted #11233a}' +
    '.cp details summary{cursor:pointer;font-weight:800;color:var(--gold,#ffd166)}' +
    '.cp .rules p,.cp .rules li{color:#b6c1de;line-height:1.45;font-size:.93rem}.cp .rules b{color:#fff}' +
    '.cp .rg{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:10px}' +
    '.cp .rg>div{background:#0a1020;border:1px solid #1f2b47;border-radius:14px;padding:10px 12px}' +
    '.cp .rg h4{margin:0 0 6px;color:#fff}' +
    '.cp .zbar{display:flex;border-radius:8px;overflow:hidden;font-size:.72rem;font-weight:700;text-align:center;margin:6px 0}.cp .zbar span{padding:6px 2px}' +
    '.cp .mrow{display:flex;gap:3px;margin:6px 0}.cp .mrow span{flex:1;height:34px;border-radius:6px;background:#0d1a30;border:1px solid #1d2c4c;display:flex;align-items:center;justify-content:center;font-size:.9rem}' +
    '.cp .mlab{display:flex;gap:3px}.cp .mlab span{flex:1;text-align:center;font-size:.7rem;color:#8ea0c8}' +
    '.cp .chip{display:inline-block;padding:2px 8px;border-radius:8px;margin:2px;font-size:.78rem;font-weight:700;background:#16213b;border:1px solid #2b3b63}' +
    /* cinematic */
    '.cp .cine{position:fixed;inset:0;z-index:8;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;overflow:hidden;padding:20px;animation:fade .4s}' +
    '.cp .cine.win{background:linear-gradient(180deg,#0b2a5c 0%,#3e7fd0 45%,#f6b073 72%,#2a3a24 72%,#16200f 100%)}' +
    '.cp .cine.crash{background:radial-gradient(circle at 50% 60%,#5a1010,#140405 70%);animation:cpshake .45s 3}' +
    '.cp .cine .rw{position:absolute;left:50%;bottom:0;width:70vw;max-width:700px;height:30%;transform:translateX(-50%);background:linear-gradient(#3a3f4a,#22252c);clip-path:polygon(44% 0,56% 0,100% 100%,0 100%)}' +
    '.cp .cine .rw::after{content:"";position:absolute;left:49.4%;width:1.2%;top:0;bottom:0;background:repeating-linear-gradient(#fff 0 18px,transparent 18px 38px)}' +
    '.cp .cine .pl{position:absolute;font-size:5rem;left:50%;top:60%;transform:translate(-50%,-50%) rotate(45deg);animation:cpland 3.2s cubic-bezier(.3,.6,.4,1) both;filter:drop-shadow(0 12px 18px rgba(0,0,0,.5))}' +
    '@keyframes cpland{0%{left:-10%;top:5%;transform:translate(-50%,-50%) rotate(60deg) scale(.35)}70%{transform:translate(-50%,-50%) rotate(50deg) scale(1)}100%{left:50%;top:72%;transform:translate(-50%,-50%) rotate(45deg) scale(1.15)}}' +
    '.cp .cine.crash .pl{animation:cpfall 1.6s cubic-bezier(.5,0,.9,.5) both}' +
    '@keyframes cpfall{0%{left:10%;top:0;transform:translate(-50%,-50%) rotate(60deg)}100%{left:50%;top:62%;transform:translate(-50%,-50%) rotate(560deg) scale(.6)}}' +
    '.cp .cine .boom{position:absolute;left:50%;top:62%;font-size:9rem;transform:translate(-50%,-50%) scale(0);animation:cpboom 1.2s 1.5s cubic-bezier(.2,1.4,.4,1) forwards}' +
    '@keyframes cpboom{0%{transform:translate(-50%,-50%) scale(0);opacity:1}60%{transform:translate(-50%,-50%) scale(1.4)}100%{transform:translate(-50%,-50%) scale(1.1);opacity:.9}}' +
    '.cp .cine .msg{position:relative;z-index:2;background:rgba(5,8,18,.78);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.15);border-radius:22px;padding:18px 22px;max-width:460px;animation:pop .5s 1.8s both;box-shadow:0 20px 50px rgba(0,0,0,.6)}' +
    '.cp .cine.win .msg{animation-delay:2.8s}' +
    '.cp .cine h2{font-size:2.2rem;margin:.1em 0}.cp .cine.win h2{color:#9dffcf;text-shadow:0 0 22px rgba(93,255,176,.7)}.cp .cine.crash h2{color:#ff7b7b;text-shadow:0 0 22px rgba(255,60,60,.8)}' +
    '.cp .cine p{color:#d5dcef;margin:.4em 0}' +
    '@keyframes cpshake{0%,100%{transform:none}25%{transform:translate(-6px,3px) rotate(-.5deg)}50%{transform:translate(5px,-4px)}75%{transform:translate(-3px,5px) rotate(.5deg)}}' +
    '@media (prefers-reduced-motion:reduce){.cp *,.cp .cine{animation:none!important;transition:none!important}}';

  var RULES = '' +
    '<div class="rules">' +
    '<p><b>Mission.</b> You are the <b class="cap-t">Captain</b> (host, blue) and the <b class="fo-t">First Officer</b> (guest, orange). Land the plane together in <b>7 rounds</b>, descending 1000 ft per round from 6000 ft to touchdown. You win or crash as a crew.</p>' +
    '<p><b>Silent cockpit.</b> Each round you both secretly roll <b>4 dice</b>. Only you see yours. Then, starting with the Captain, you take turns placing <b>one die at a time</b> on the dashboard. While dice are on the table you may not discuss values: the only talk allowed is the pilot emotes. Between rounds (briefing) you may use the short strategy callouts.</p>' +
    '<div class="rg">' +
    '<div><h4>⚖️ Axis (both, every round)</h4><p>Each pilot must put one die on their side of the Axis. The plane banks toward the higher die by the difference. At <b>3</b> either way you lose control and crash.</p>' +
    '<svg viewBox="0 0 220 80" width="100%"><circle cx="110" cy="40" r="34" fill="#0b4fa8"/><g transform="rotate(-30 110 40)"><rect x="60" y="40" width="100" height="40" fill="#7a4a22"/><line x1="60" y1="40" x2="160" y2="40" stroke="#fff" stroke-width="2"/></g><circle cx="110" cy="40" r="34" fill="none" stroke="#2b3350" stroke-width="4"/><polyline points="88,40 102,40 106,46 110,40 114,46 118,40 132,40" fill="none" stroke="#ffb347" stroke-width="3"/>' +
    '<rect x="8" y="24" width="32" height="32" rx="7" fill="#7db8ff"/><text x="24" y="46" text-anchor="middle" font-size="18" font-weight="800" fill="#0b1020">2</text>' +
    '<rect x="180" y="24" width="32" height="32" rx="7" fill="#ffb366"/><text x="196" y="46" text-anchor="middle" font-size="18" font-weight="800" fill="#0b1020">4</text></svg>' +
    '<p>Captain 2, First Officer 4: the plane banks 2 to the right.</p></div>' +
    '<div><h4>🔥 Engines (both, every round)</h4><p>Each pilot also puts one die on Engines. When both are in, the <b>sum</b> sets your speed and the plane moves along the approach immediately:</p>' +
    '<div class="zbar"><span style="flex:3;background:#20345c">2-4 hold</span><span style="flex:4;background:#1f6b4c">5-8 advance 1</span><span style="flex:4;background:#8a4a14">9-12 advance 2</span></div>' +
    '<p>Every landing gear lowered widens the <b>hold</b> zone by 1; every flap extended widens the <b>advance 1</b> zone by 1. Leaving a space that still has traffic in it is a collision. Moving past the runway is an overshoot. In the final round the engines do not move you: their sum is your touchdown speed.</p></div>' +
    '<div><h4>📻 Radio and traffic</h4><p>The map shows aircraft in your approach path. A Radio die clears one aircraft at distance <b>value - 1</b> from you (1 = your own space). The Captain has 1 radio slot, the First Officer 2.</p>' +
    '<div class="mrow"><span>✈️</span><span>🛩️</span><span></span><span>🛩️</span><span>🛬</span></div><div class="mlab"><span>die 1</span><span>die 2</span><span>die 3</span><span>die 4</span><span>die 5</span></div></div>' +
    '<div><h4>🛞 Gear, flaps and brakes</h4><p><b class="cap-t">Landing gear</b> (Captain): three switches needing <span class="chip">1-2</span><span class="chip">3-4</span><span class="chip">5-6</span>, any order.</p>' +
    '<p><b class="fo-t">Flaps</b> (First Officer): four switches, top to bottom: <span class="chip">1-2</span>→<span class="chip">2-3</span>→<span class="chip">4-5</span>→<span class="chip">5-6</span>.</p>' +
    '<p><b class="cap-t">Brakes</b> (Captain): exactly <span class="chip">2</span>→<span class="chip">4</span>→<span class="chip">6</span> in order. Your brake value is the highest one armed.</p></div>' +
    '<div><h4>☕ Coffee</h4><p>Put any die on a coffee cup (3 per round) to brew a token (max 3, shared). Before placing a die you may spend tokens to change its value by 1 each (never below 1 or above 6).</p></div>' +
    '<div><h4>🛬 Touchdown checklist</h4><p>After the round-6 descent you must be <b>at the runway</b>. At the end of round 7 you land if: the runway is clear of traffic, the axis is level (Training: within 1, Stormy: exactly level), all <b>3 gear</b> and <b>4 flaps</b> are out and the engine speed is <b>lower than</b> your brakes. Anything else is a crash.</p></div>' +
    '</div>' +
    '<p><b>Must place rule.</b> You always have to fill your Axis and Engine slots each round, so once your remaining dice equal your unfilled Axis/Engine slots, those dice must go there.</p>' +
    '</div>';

  function buildHorizon(id) {
    var ticks = '';
    for (var k = -3; k <= 3; k++) {
      var a = k * 15;
      ticks += '<line x1="70" y1="4" x2="70" y2="' + (k === 0 ? 14 : 11) + '" stroke="' + (Math.abs(k) === 3 ? '#ff4d4d' : '#cfd8ee') + '" stroke-width="' + (Math.abs(k) === 3 ? 3 : 2) + '" transform="rotate(' + a + ' 70 70)"/>';
    }
    return '<svg viewBox="0 0 140 140" aria-label="Artificial horizon"><defs>' +
      '<clipPath id="cpc' + id + '"><circle cx="70" cy="70" r="56"/></clipPath>' +
      '<linearGradient id="cps' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a3f8f"/><stop offset="1" stop-color="#58b4ff"/></linearGradient>' +
      '<linearGradient id="cpg' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a6630"/><stop offset="1" stop-color="#3a210c"/></linearGradient>' +
      '<radialGradient id="cpr' + id + '"><stop offset=".8" stop-color="#1a2136"/><stop offset="1" stop-color="#05070d"/></radialGradient></defs>' +
      '<circle cx="70" cy="70" r="68" fill="url(#cpr' + id + ')" stroke="#2b3556" stroke-width="2"/>' +
      '<g clip-path="url(#cpc' + id + ')"><g class="hzg" style="transform-origin:70px 70px;transition:transform 1s cubic-bezier(.3,1.5,.5,1)">' +
      '<rect x="-60" y="-60" width="260" height="130" fill="url(#cps' + id + ')"/><rect x="-60" y="70" width="260" height="130" fill="url(#cpg' + id + ')"/>' +
      '<line x1="-60" y1="70" x2="200" y2="70" stroke="#fff" stroke-width="2"/>' +
      '<g stroke="#fff" stroke-width="1.5" opacity=".75"><line x1="58" y1="55" x2="82" y2="55"/><line x1="62" y1="62" x2="78" y2="62"/><line x1="62" y1="78" x2="78" y2="78"/><line x1="58" y1="85" x2="82" y2="85"/></g>' +
      '</g></g>' + ticks +
      '<polygon class="hzp" points="70,16 65,25 75,25" fill="#ffd166" style="transform-origin:70px 70px;transition:transform 1s cubic-bezier(.3,1.5,.5,1)"/>' +
      '<polyline points="34,70 56,70 63,79 70,70 77,79 84,70 106,70" fill="none" stroke="#ffb347" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="70" cy="70" r="3" fill="#ffb347"/>' +
      '<text class="hzt" x="70" y="122" text-anchor="middle" font-size="11" font-weight="800" fill="#9dffcf" font-family="monospace">LEVEL</text></svg>';
  }
  function buildSpeed() {
    var ticks = '';
    for (var v = 2; v <= 12; v++) {
      var a = spdAng(v);
      ticks += '<line x1="70" y1="20" x2="70" y2="' + (v % 2 ? 25 : 28) + '" stroke="#9fb0d9" stroke-width="1.5" transform="rotate(' + a + ' 70 72)"/>';
      if (v % 2 === 0) { var p = pol(70, 72, 38, a).split(' '); ticks += '<text x="' + p[0] + '" y="' + (+p[1] + 4) + '" text-anchor="middle" font-size="9" fill="#9fb0d9" font-family="monospace">' + v + '</text>'; }
    }
    return '<svg viewBox="0 0 140 112" aria-label="Speed"><circle cx="70" cy="72" r="64" fill="#060a14" stroke="#2b3556" stroke-width="2"/>' +
      '<path class="z0" fill="none" stroke="#3d6fd1" stroke-width="7"/><path class="z1" fill="none" stroke="#2fd88a" stroke-width="7"/><path class="z2" fill="none" stroke="#ff9a3c" stroke-width="7"/>' +
      ticks +
      '<g class="ndl" style="transform-origin:70px 72px;transition:transform .9s cubic-bezier(.3,1.5,.5,1);transform:rotate(-135deg)"><line x1="70" y1="78" x2="70" y2="24" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g>' +
      '<circle cx="70" cy="72" r="5" fill="#cfd8ee"/><text class="spv" x="70" y="100" text-anchor="middle" font-size="13" font-weight="800" fill="#9dffcf" font-family="monospace">--</text></svg>';
  }

  registerGame({
    id: 'copilots',
    icon: '✈️',
    name: 'Co-Pilots',
    blurb: 'Co-op landing: secretly roll dice and silently share them across the cockpit to bring the plane down safely.',
    _t: {
      DIFFS: DIFFS, ROUNDS: ROUNDS, GEAR: GEAR, FLAP: FLAP, BRAKE: BRAKE, SLOTS: SLOTS,
      newGame: newGame, startRound: startRound, canPlace: canPlace, legal: legal, place: place, ready: ready,
      speedFor: speedFor, lohi: lohi, brakeVal: brakeVal, landingProblems: landingProblems, alt: alt, mul: mul
    },
    start: function (ctx) {
      var ME = ctx.me, OP = oth(ME), H = ctx.isHost;
      var names = ctx.names || { host: 'Captain', guest: 'First Officer' };
      var root = ctx.root, timers = [], dead = false, ended = false;
      var mk = ctx.rng || mul;
      /* host-only secret salt so the guest cannot recompute the Captain's dice from the shared seed */
      var secret = H ? ((ctx.seed | 0) ^ Math.floor(Math.random() * 2147483647)) : 0;
      var S = H ? { phase: 'setup', r: 0 } : null;
      var ver = 0, lastN = 0, seq = 0;
      var ui = { sel: null, t: 0, pending: false, rolledR: -1, seen: null, lastN: 0, cine: false, emoT: 0, builtN: -1 };
      function nm(p) { return names[p] || ROLE[p]; }
      function q(s) { return root.querySelector(s); }
      function later(fn, ms) { var id = setTimeout(function () { if (!dead) fn(); }, ms); timers.push(id); return id; }

      /* ---------- networking ---------- */
      function masked() {
        var c = JSON.parse(JSON.stringify(S));
        delete c.seed;
        if (c.dice && c.phase !== 'over') c.dice.host = c.dice.host.map(function (d) { return { v: d.used ? d.v : 0, used: d.used, at: d.at, pv: d.pv }; });
        return c;
      }
      function broadcast() { if (H) ctx.send({ k: 'st', v: ++ver, s: masked() }); }
      function hostApply(who, a) {
        if (!a || typeof a !== 'object') return false;
        if (a.type === 'diff') {
          if (who !== 'host' || S.phase !== 'setup' || !DIFFS[a.diff]) return false;
          S = newGame(a.diff, secret, mk);
          return true;
        }
        if (a.type === 'ready') return ready(S, who, mk);
        if (a.type === 'place') return place(S, who, { d: a.d | 0, s: String(a.s), t: a.t | 0 });
        return false;
      }
      function act(a) {
        if (dead || !S) return;
        if (H) {
          if (hostApply('host', a)) { afterChange(); broadcast(); }
        } else {
          if (ui.pending) return;
          ui.pending = true;
          ctx.send({ k: 'act', r: S.r, n: ++seq, a: a });
          later(function () { if (ui.pending) { ui.pending = false; ctx.send({ k: 'hi' }); render(); } }, 4000);
          render();
        }
      }
      function afterChange() { ui.sel = null; ui.t = 0; render(); }
      function onMsg(d) {
        if (dead || !d || typeof d !== 'object') return;
        if (d.k === 'emo') { showEmote(OP, d); return; }
        if (H) {
          if (d.k === 'hi') { broadcast(); return; }
          if (d.k !== 'act' || typeof d.n !== 'number' || d.n <= lastN) return;
          lastN = d.n;
          if (d.r !== S.r) { broadcast(); return; }
          var ok = hostApply('guest', d.a);
          if (ok) render();
          broadcast();
        } else {
          if (d.k !== 'st' || typeof d.v !== 'number' || d.v <= ver || !d.s) return;
          ver = d.v; S = d.s; ui.pending = false;
          if (ui.sel !== null && (!S.dice || !S.dice[ME] || !S.dice[ME][ui.sel] || S.dice[ME][ui.sel].used || S.turn !== ME)) { ui.sel = null; ui.t = 0; }
          render();
        }
      }

      /* ---------- emotes ---------- */
      function showEmote(who, d) {
        var txt = d.c ? CALL[d.i] : EMO[d.i];
        if (typeof txt !== 'string') return;
        var host = q('.cm.' + who);
        if (!host) return;
        var old = host.querySelector('.bub'); if (old) old.remove();
        var b = document.createElement('span');
        b.className = 'bub'; b.textContent = txt;
        host.appendChild(b);
        later(function () { if (b.parentNode) b.remove(); }, 2700);
      }
      function sendEmote(i, c) {
        var now = Date.now();
        if (now - ui.emoT < 700) return;
        if (c && (!S || S.phase === 'place')) return; /* no talk while dice are on the table */
        ui.emoT = now;
        var d = { k: 'emo', i: i, c: !!c };
        ctx.send(d); showEmote(ME, d);
      }

      /* ---------- end ---------- */
      function finish() {
        if (ended || dead || !S || !S.result) return;
        ended = true;
        var D = DIFFS[S.diff] || DIFFS.train;
        var crew = 'Captain ' + nm('host') + ' & First Officer ' + nm('guest') + ' · ' + D.name + '.';
        if (S.result.win) ctx.end('Smooth landing! ✈️', crew + ' ' + S.result.detail + '.');
        else ctx.end('Crash landing 💥 — ' + S.result.why, crew + ' ' + (S.result.detail ? S.result.detail.charAt(0).toUpperCase() + S.result.detail.slice(1) + '.' : ''));
      }

      /* ---------- skeleton ---------- */
      root.innerHTML = '<style>' + CSS + '</style><div class="cp">' +
        '<div class="pnl"><div class="top" id="cp-top"></div>' +
        '<div class="crew"><div class="cm host"><span style="font-size:1.4rem">👨‍✈️</span><div><small class="cap-t">Captain</small><b>' + esc(nm('host')) + (ME === 'host' ? ' (you)' : '') + '</b></div></div>' +
        '<div class="cm guest"><span style="font-size:1.4rem">🧑‍✈️</span><div><small class="fo-t">First Officer</small><b>' + esc(nm('guest')) + (ME === 'guest' ? ' (you)' : '') + '</b></div></div></div></div>' +
        '<div class="pnl map" id="cp-map"></div>' +
        '<div class="pnl" id="cp-dashp"><div class="dash">' +
        '<div class="col c" id="cp-cap"></div>' +
        '<div class="mid"><div class="col"><div class="gl">Axis</div><div class="gauge"><div id="cp-ax-h"></div><div id="cp-hz">' + buildHorizon(ME) + '</div><div id="cp-ax-g"></div></div></div>' +
        '<div class="col"><div class="gl">Engines</div><div class="gauge"><div id="cp-en-h"></div><div id="cp-sp">' + buildSpeed() + '</div><div id="cp-en-g"></div></div><div class="zl" id="cp-zl"></div></div>' +
        '<div class="col"><div class="gl">Coffee</div><div class="cups" id="cp-cof"></div></div></div>' +
        '<div class="col f" id="cp-fo"></div>' +
        '</div><div class="chk" id="cp-chk"></div></div>' +
        '<div class="pnl" id="cp-act"></div>' +
        '<div class="pnl"><b style="font-size:.8rem;letter-spacing:.16em;color:#7f8fb8">FLIGHT RECORDER</b><div class="log" id="cp-log"></div></div>' +
        '<div class="pnl"><details><summary>How to play</summary>' + RULES + '</details></div>' +
        '<div id="cp-cine"></div></div>';

      /* ---------- render helpers ---------- */
      function selOk(s) {
        return S && S.phase === 'place' && S.turn === ME && !ui.pending && ui.sel !== null && canPlace(S, ME, ui.sel, s, ui.t);
      }
      function slotBtn(s, fill, who, label, isLast, enabled) {
        if (fill) return '<button class="slot full" disabled>' + dieHtml(fill, who, 'mini' + (isLast ? ' drop' : '')) + '</button>';
        var ok = enabled !== false && selOk(s);
        return '<button class="slot' + (ok ? ' ok' : '') + (who === ME ? ' mine' : '') + '" data-a="slot" data-s="' + s + '"' + (ok ? '' : ' disabled') + '>' + label + '</button>';
      }
      function isLast(who, s) { return S.last && S.last.n !== ui.lastN && S.last.who === who && S.last.s === s; }

      function renderTop() {
        var D = DIFFS[S.diff], h = '';
        if (S.phase === 'setup') { q('#cp-top').innerHTML = '<span class="altm">PRE-FLIGHT</span><span class="turn">Choose the conditions</span>'; return; }
        h += '<span class="altm">' + (S.phase === 'over' && S.result && S.result.win ? '0' : alt(S.r)) + '<small>FT</small></span>';
        h += '<span class="rdots">';
        for (var i = 1; i <= ROUNDS; i++) h += '<i class="' + (i < S.r ? 'd' : i === S.r ? 'c' : '') + (i === ROUNDS ? ' f' : '') + '" title="Round ' + i + '"></i>';
        h += '</span><span class="badge">' + D.icon + ' ' + D.name + '</span>';
        var t = '', cls = 'turn';
        if (S.phase === 'over') t = S.result.win ? 'Landed' : 'Crashed';
        else if (S.phase === 'brief') { t = S.r === ROUNDS ? 'Final approach briefing' : 'Briefing: round ' + S.r; if (S.r === ROUNDS) cls += ' fa'; }
        else if (S.turn === ME) { t = (S.r === ROUNDS ? 'FINAL APPROACH · ' : '') + 'Your move'; cls += ' me'; }
        else { t = nm(S.turn) + ' is placing...'; if (S.r === ROUNDS) cls += ' fa'; }
        h += '<span class="' + cls + '">' + esc(t) + '</span>';
        q('#cp-top').innerHTML = h;
        var cmH = q('.cm.host'), cmG = q('.cm.guest');
        cmH.classList.toggle('on', S.phase === 'place' && S.turn === 'host');
        cmG.classList.toggle('on', S.phase === 'place' && S.turn === 'guest');
      }
      function renderMap() {
        var map = q('#cp-map');
        if (S.phase === 'setup') { map.innerHTML = '<h4>Approach</h4><div class="tip">Waiting for clearance...</div>'; ui.builtN = -1; return; }
        var N = S.N, cols = 'grid-template-columns:repeat(' + (N + 1) + ',1fr)';
        if (ui.builtN !== N) {
          map.innerHTML = '<h4>Approach · traffic ahead <span id="cp-tfc"></span></h4><div style="position:relative"><div class="trk" id="cp-trk" style="' + cols + '"></div><div class="me-pl" id="cp-me">✈️</div></div><div class="rl" id="cp-rl" style="' + cols + '"></div>';
          ui.builtN = N;
        }
        var seenT = ui.seen ? ui.seen.traffic : null, h = '', rl = '', i, k, total = 0;
        for (i = 0; i <= N; i++) {
          var n = S.traffic[i]; total += i >= S.pos ? n : 0;
          h += '<div class="sp' + (i === N ? ' ap' : '') + (i < S.pos ? ' past' : '') + '">';
          for (k = 0; k < n; k++) h += '<span class="tf">✈️</span>';
          var gone = seenT && seenT[i] > n ? seenT[i] - n : 0;
          for (k = 0; k < gone; k++) h += '<span class="tf gone">✈️</span>';
          h += '</div>';
          var dv = i - S.pos + 1;
          rl += '<span>' + (i === N ? '🛬 ' : '') + (dv >= 1 && dv <= 6 ? '📻 <b>' + dv + '</b>' : '&nbsp;') + '</span>';
        }
        q('#cp-trk').innerHTML = h; q('#cp-rl').innerHTML = rl;
        q('#cp-tfc').textContent = '(' + total + ')';
        var me = q('#cp-me'), p = Math.min(S.pos, N + 0.6);
        me.style.left = (100 * (p + 0.5) / (N + 1)).toFixed(2) + '%';
        me.className = 'me-pl' + (S.phase === 'over' && !S.result.win ? ' boom' : '');
        me.textContent = S.phase === 'over' && !S.result.win ? '💥' : '✈️';
      }
      function renderDash() {
        var dp = q('#cp-dashp');
        dp.hidden = S.phase === 'setup';
        if (S.phase === 'setup') return;
        var rs = S.rs, sw = ui.seen, h, i;
        var place = S.phase === 'place';
        /* captain column */
        h = '<div class="grp"><small>📻 Radio</small><div class="sl">' + slotBtn('radio', place && rs.radio.host[0], 'host', 'RADIO', isLast('host', 'radio')) + '</div></div>';
        h += '<div class="grp"><small>🛞 Landing gear ' + cnt(S.gear) + '/3</small><div class="sl">';
        for (i = 0; i < 3; i++) {
          var fl = sw && !sw.gear[i] && S.gear[i];
          h += '<div class="swb"><div class="sw' + (S.gear[i] ? ' on' : '') + (fl ? ' flip' : '') + '"><b></b></div>' + slotBtn('gear' + i, S.gear[i], 'host', GEAR[i].join('-'), isLast('host', 'gear' + i)) + '</div>';
        }
        h += '</div></div><div class="grp"><small>🛑 Brakes ' + (brakeVal(S) ? '(' + brakeVal(S) + ')' : '') + '</small><div class="sl">';
        for (i = 0; i < 3; i++) {
          var nextB = i === S.brakes.length;
          h += '<div class="swb"><div class="led' + (S.brakes[i] ? ' on' : '') + '"></div>' + slotBtn('brake', S.brakes[i], 'host', String(BRAKE[i]), isLast('host', 'brake') && i === S.brakes.length - 1, nextB) + '</div>';
        }
        h += '</div></div>';
        q('#cp-cap').innerHTML = h;
        /* first officer column */
        h = '<div class="grp"><small>📻 Radio</small><div class="sl">';
        var firstFree = rs.radio.guest.indexOf(0);
        for (i = 0; i < 2; i++) h += slotBtn('radio', place && rs.radio.guest[i], 'guest', 'RADIO', isLast('guest', 'radio') && (firstFree < 0 ? i === 1 : i === firstFree - 1), i === firstFree);
        h += '</div></div><div class="grp"><small>🪽 Flaps ' + cnt(S.flaps) + '/4</small><div class="sl">';
        var nf = S.flaps.indexOf(0);
        for (i = 0; i < 4; i++) {
          var ff = sw && !sw.flaps[i] && S.flaps[i];
          h += '<div class="swb"><div class="sw' + (S.flaps[i] ? ' on' : '') + (ff ? ' flip' : '') + '"><b></b></div>' + slotBtn('flap', S.flaps[i], 'guest', FLAP[i].join('-'), isLast('guest', 'flap') && i === (nf < 0 ? 3 : nf - 1), i === nf) + '</div>';
        }
        h += '</div></div>';
        q('#cp-fo').innerHTML = h;
        /* axis + engines */
        q('#cp-ax-h').innerHTML = slotBtn('axis', place && rs.axis.host, 'host', 'CPT', isLast('host', 'axis'));
        q('#cp-ax-g').innerHTML = slotBtn('axis', place && rs.axis.guest, 'guest', 'F/O', isLast('guest', 'axis'));
        q('#cp-en-h').innerHTML = slotBtn('eng', place && rs.eng.host, 'host', 'CPT', isLast('host', 'eng'));
        q('#cp-en-g').innerHTML = slotBtn('eng', place && rs.eng.guest, 'guest', 'F/O', isLast('guest', 'eng'));
        /* horizon */
        var crashed = S.phase === 'over' && !S.result.win;
        var ang = -S.tilt * 15 + (crashed && Math.abs(S.tilt) >= CRASH_TILT ? -S.tilt * 12 : 0);
        var g = q('#cp-hz .hzg'); if (g) g.style.transform = 'rotate(' + ang + 'deg)';
        var pp = q('#cp-hz .hzp'); if (pp) pp.style.transform = 'rotate(' + (S.tilt * 15) + 'deg)';
        var ht = q('#cp-hz .hzt');
        if (ht) { ht.textContent = S.tilt ? 'TILT ' + Math.abs(S.tilt) + (S.tilt > 0 ? ' R' : ' L') : 'LEVEL'; ht.setAttribute('fill', Math.abs(S.tilt) >= 2 ? '#ff6b6b' : Math.abs(S.tilt) === 1 ? '#ffd166' : '#9dffcf'); }
        /* speed gauge */
        var lh = lohi(S), fin = S.r >= ROUNDS;
        var z0 = q('#cp-sp .z0'), z1 = q('#cp-sp .z1'), z2 = q('#cp-sp .z2');
        if (fin) {
          var bv = brakeVal(S);
          z0.setAttribute('d', bv > 2 ? arcD(70, 72, 56, spdAng(2) - 6, spdAng(bv - 0.5)) : '');
          z0.setAttribute('stroke', '#2fd88a');
          z1.setAttribute('d', ''); z2.setAttribute('d', arcD(70, 72, 56, spdAng(Math.max(2, bv - 0.5)), spdAng(12) + 6)); z2.setAttribute('stroke', '#ff4d4d');
        } else {
          z0.setAttribute('stroke', '#3d6fd1'); z2.setAttribute('stroke', '#ff9a3c');
          z0.setAttribute('d', arcD(70, 72, 56, spdAng(2) - 6, spdAng(lh[0] + 0.5)));
          z1.setAttribute('d', arcD(70, 72, 56, spdAng(lh[0] + 0.5), spdAng(lh[1] + 0.5)));
          z2.setAttribute('d', lh[1] < 12 ? arcD(70, 72, 56, spdAng(lh[1] + 0.5), spdAng(12) + 6) : '');
        }
        var sum = place ? (rs.eng.host || 0) + (rs.eng.guest || 0) : 0;
        var nd = q('#cp-sp .ndl'); if (nd) nd.style.transform = 'rotate(' + (sum >= 2 ? spdAng(sum) : sum === 1 ? spdAng(1.5) : -135) + 'deg)';
        q('#cp-sp .spv').textContent = sum ? String(sum) : '--';
        q('#cp-zl').innerHTML = fin
          ? '<span style="color:#9dffcf">Touchdown: speed &lt; brakes (' + brakeVal(S) + ')</span>'
          : '<span style="color:#8fb2ff">≤' + lh[0] + ' hold</span><span style="color:#9dffcf">' + (lh[0] + 1) + '-' + lh[1] + ' +1</span><span style="color:#ffbe7d">≥' + (lh[1] + 1) + ' +2</span>';
        /* coffee */
        h = '';
        var cf = place ? rs.coffee : [];
        var cofLast = S.last && S.last.n !== ui.lastN && S.last.s === 'coffee';
        for (i = 0; i < 3; i++) {
          var c = cf[i];
          h += c ? slotBtn('coffee', c.v, c.who, '', cofLast && i === cf.length - 1) : slotBtn('coffee', 0, null, '☕', false, i === cf.length);
        }
        h += '<span class="tok" title="Coffee tokens">';
        for (i = 0; i < MAXC; i++) h += '<i class="' + (i < S.coffee ? 'on' : '') + '">' + (i < S.coffee ? '☕' : '') + '</i>';
        h += '</span>';
        q('#cp-cof').innerHTML = h;
        /* checklist */
        var D = DIFFS[S.diff], ahead = 0;
        for (i = S.pos; i <= S.N; i++) ahead += S.traffic[i];
        var mv = Math.max(0, ROUNDS - 1 - S.r + (S.phase === 'place' && S.adv === null && S.r < ROUNDS ? 1 : 0));
        var dist = Math.max(0, S.N - S.pos);
        var items = [
          [dist ? dist + ' space' + (dist > 1 ? 's' : '') + ' to runway' : 'At the runway', dist === 0 ? 'ok' : dist > 2 * mv ? 'bad' : ''],
          [mv + ' moving round' + (mv === 1 ? '' : 's') + ' left', ''],
          ['Traffic ahead: ' + ahead, ahead ? '' : 'ok'],
          ['Axis ' + fmtTilt(S.tilt) + ' (land ≤' + D.tol + ')', Math.abs(S.tilt) <= D.tol ? 'ok' : Math.abs(S.tilt) >= 2 ? 'bad' : ''],
          ['Gear ' + cnt(S.gear) + '/3', cnt(S.gear) === 3 ? 'ok' : ''],
          ['Flaps ' + cnt(S.flaps) + '/4', cnt(S.flaps) === 4 ? 'ok' : ''],
          ['Brakes ' + (brakeVal(S) || 'off'), brakeVal(S) >= 4 ? 'ok' : '']
        ];
        q('#cp-chk').innerHTML = items.map(function (x) { return '<span class="' + x[1] + '">' + esc(x[0]) + '</span>'; }).join('');
      }
      function emoteBar() {
        var h = '<div class="emo">';
        EMO.forEach(function (e, i) { h += '<button data-a="emo" data-i="' + i + '" title="Pilot emote">' + e + '</button>'; });
        if (S && S.phase === 'brief') CALL.forEach(function (c, i) { h += '<button class="call" data-a="emo" data-c="1" data-i="' + i + '">' + esc(c) + '</button>'; });
        return h + '</div>';
      }
      function revealHtml(prev) {
        if (!prev) return '';
        var h = '<div class="rev">';
        ['host', 'guest'].forEach(function (p) {
          h += '<div><small class="' + (p === 'host' ? 'cap-t' : 'fo-t') + '">' + esc(nm(p)) + ' rolled</small>';
          prev.dice[p].forEach(function (x) { h += dieHtml(x[0], p, 'mini', 'title="' + (x[2] ? LBL[x[2]] + (x[1] !== x[0] ? ' as ' + x[1] : '') : 'unplaced') + '" style="margin:3px"'); });
          h += '</div>';
        });
        return h + '</div>';
      }
      function renderAct() {
        var el = q('#cp-act'), h = '';
        if (S.phase === 'setup') {
          if (H) {
            h = '<div class="prompt">Captain, choose today\'s conditions</div><div class="diffs">' +
              ['train', 'storm'].map(function (k) { var D = DIFFS[k]; return '<button class="' + k + '" data-a="diff" data-d="' + k + '"><b>' + D.icon + ' ' + D.name + '</b><small>' + D.blurb + '</small></button>'; }).join('') + '</div>';
          } else h = '<div class="prompt wait">Waiting for Captain ' + esc(nm('host')) + ' to choose the conditions...</div>';
          h += emoteBar();
          el.innerHTML = h; return;
        }
        if (S.phase === 'brief') {
          var fa = S.r === ROUNDS;
          h = '<div class="brief' + (fa ? ' fa' : '') + '"><div class="tip">Round ' + S.r + ' of ' + ROUNDS + ' · ' + alt(S.r) + ' ft</div><h3>' + (fa ? 'FINAL APPROACH' : 'Pre-round briefing') + '</h3>';
          if (fa) h += '<p>No more moving: engines now set touchdown speed. Clear the runway, level the wings, finish gear and flaps, and keep speed under the brakes.</p>';
          else if (S.r === 1) h += '<p>Plan together now. Once the dice are rolled, the cockpit goes silent: emotes only.</p>';
          if (S.prev) h += '<div class="tip">Last round, revealed:</div>' + revealHtml(S.prev);
          h += S.ready[ME] ? '<div class="prompt wait">Waiting for ' + esc(nm(OP)) + '...</div>' : '<button class="big" data-a="ready"' + (ui.pending ? ' disabled' : '') + '>' + (fa ? 'Begin final approach' : 'Ready: roll the dice') + '</button>';
          h += '</div>' + emoteBar();
          el.innerHTML = h; return;
        }
        if (S.phase === 'over') {
          h = '<div class="brief"><h3>' + (S.result.win ? 'Smooth landing! ✈️' : 'Crash landing 💥') + '</h3><p>' + esc(S.result.win ? S.result.detail : S.result.why + (S.result.detail ? ': ' + S.result.detail : '')) + '</p>' + revealHtml(S.prev && S.prev.r === S.r ? S.prev : null);
          if (!S.prev || S.prev.r !== S.r) {
            h += '<div class="rev">';
            ['host', 'guest'].forEach(function (p) {
              h += '<div><small class="' + (p === 'host' ? 'cap-t' : 'fo-t') + '">' + esc(nm(p)) + '</small>';
              (S.dice[p] || []).forEach(function (x) { h += x.v ? dieHtml(x.v, p, 'mini' + (x.used ? ' spent' : ''), 'style="margin:3px"') : dieHtml(1, p, 'mini back', 'style="margin:3px"'); });
              h += '</div>';
            });
            h += '</div>';
          }
          el.innerHTML = h + '</div>'; return;
        }
        /* placement */
        var mine = S.dice[ME] || [], theirs = S.dice[OP] || [], myTurn = S.turn === ME && !ui.pending;
        var ml = mandLeft(S, ME), left = mine.filter(function (x) { return !x.used; }).length;
        if (myTurn) {
          h += '<div class="prompt">' + (ui.sel === null ? 'Your move: pick one of your dice' : 'Now tap a glowing slot') +
            (left && left <= ml ? '<small>Must place now: ' + [S.rs.axis[ME] ? '' : 'Axis', S.rs.eng[ME] ? '' : 'Engines'].filter(Boolean).join(' and ') + '</small>' : ml ? '<small>Still owed this round: ' + [S.rs.axis[ME] ? '' : 'Axis', S.rs.eng[ME] ? '' : 'Engines'].filter(Boolean).join(', ') + '</small>' : '') + '</div>';
        } else if (ui.pending) h += '<div class="prompt wait">Radioing the Captain...</div>';
        else h += '<div class="prompt wait">' + esc(nm(OP)) + ' is placing a die. No talking about numbers!</div>';
        var roll = ui.rolledR !== S.r;
        h += '<div class="tray"><div><div class="gl" style="text-align:left">Your dice</div><div class="hand">';
        mine.forEach(function (d, i) {
          if (d.used) { h += dieHtml(d.pv || d.v, ME, 'spent', '', 'span'); return; }
          var v = ui.sel === i ? d.v + ui.t : d.v;
          h += dieHtml(v, ME, (ui.sel === i ? 'sel' : '') + (roll ? ' roll' : ''), 'data-a="die" data-i="' + i + '"' + (myTurn ? '' : ' disabled'), 'button');
        });
        h += '</div></div>';
        if (myTurn && ui.sel !== null && S.coffee > 0) {
          var base = mine[ui.sel].v;
          h += '<div class="adj"><button data-a="adj" data-d="-1"' + (ui.t <= -S.coffee || base + ui.t <= 1 ? ' disabled' : '') + '>−1</button><span>☕ ' + (ui.t ? (ui.t > 0 ? '+' : '') + ui.t + ' → ' + (base + ui.t) : 'adjust') + '</span><button data-a="adj" data-d="1"' + (ui.t >= S.coffee || base + ui.t >= 6 ? ' disabled' : '') + '>+1</button></div>';
        }
        h += '<div><div class="gl" style="text-align:right">' + esc(nm(OP)) + '\'s dice</div><div class="hand" style="justify-content:flex-end">';
        theirs.forEach(function (d) { h += d.used ? dieHtml(d.pv || d.v || 1, OP, 'mini spent', 'style="margin:3px"') : dieHtml(1, OP, 'mini back', 'style="margin:3px"'); });
        h += '</div></div></div>' + emoteBar();
        if (roll) ui.rolledR = S.r;
        el.innerHTML = h;
      }
      function renderCine() {
        var el = q('#cp-cine');
        if (S.phase !== 'over') { el.innerHTML = ''; return; }
        if (ui.cine) return;
        ui.cine = true;
        var w = S.result.win;
        el.innerHTML = '<div class="cine ' + (w ? 'win' : 'crash') + '">' + (w ? '<div class="rw"></div>' : '') + '<div class="pl">✈️</div>' + (w ? '' : '<div class="boom">💥</div>') +
          '<div class="msg"><h2>' + (w ? 'Smooth landing! ✈️' : 'Crash landing 💥') + '</h2><p>' + esc(w ? 'Captain ' + nm('host') + ' and First Officer ' + nm('guest') + ' brought her home.' : S.result.why) + '</p><p class="tip">' + esc(S.result.detail || '') + '</p>' +
          '<button class="big" data-a="fin">Continue</button></div></div>';
        later(finish, typeof ctx.endDelay === 'number' ? ctx.endDelay : 7000);
      }
      function render() {
        if (dead) return;
        if (!S) { q('#cp-top').innerHTML = '<span class="altm">----</span><span class="turn">Connecting to the flight deck...</span>'; q('#cp-dashp').hidden = true; q('#cp-act').innerHTML = ''; return; }
        root.querySelector('.cp').classList.toggle('final', S.phase !== 'setup' && S.phase !== 'over' && S.r === ROUNDS);
        renderTop(); renderMap(); renderDash(); renderAct();
        q('#cp-log').innerHTML = (S.log || []).slice().reverse().map(function (t) { return '<div>' + esc(t) + '</div>'; }).join('');
        renderCine();
        if (S.phase !== 'setup') {
          ui.seen = { gear: S.gear.slice(), flaps: S.flaps.slice(), traffic: S.traffic.slice() };
          if (S.last) ui.lastN = S.last.n;
        }
      }

      function onClick(e) {
        var t = e.target && e.target.closest ? e.target.closest('[data-a]') : null;
        if (!t || dead || t.disabled) return;
        var a = t.getAttribute('data-a');
        if (a === 'emo') { sendEmote(parseInt(t.getAttribute('data-i'), 10) || 0, t.getAttribute('data-c') === '1'); return; }
        if (a === 'fin') { finish(); return; }
        if (!S) return;
        if (a === 'diff') act({ type: 'diff', diff: t.getAttribute('data-d') });
        else if (a === 'ready') act({ type: 'ready' });
        else if (a === 'die') {
          var i = parseInt(t.getAttribute('data-i'), 10);
          if (S.phase !== 'place' || S.turn !== ME) return;
          ui.sel = ui.sel === i ? null : i; ui.t = 0; render();
        } else if (a === 'adj') {
          var d = parseInt(t.getAttribute('data-d'), 10), nt = ui.t + d;
          if (ui.sel === null || Math.abs(nt) > S.coffee) return;
          var v = S.dice[ME][ui.sel].v + nt;
          if (v < 1 || v > 6) return;
          ui.t = nt; render();
        } else if (a === 'slot') {
          if (ui.sel === null) return;
          act({ type: 'place', d: ui.sel, s: t.getAttribute('data-s'), t: ui.t });
          if (!H) { ui.sel = null; ui.t = 0; }
        }
      }
      root.addEventListener('click', onClick);

      render();
      if (H) broadcast(); else ctx.send({ k: 'hi' });

      return {
        onMsg: onMsg,
        destroy: function () {
          dead = true;
          timers.forEach(clearTimeout); timers = [];
          root.removeEventListener('click', onClick);
          root.innerHTML = '';
        },
        _t: { state: function () { return S; } }
      };
    }
  });
})();
