/* Gluten-Free Galaxy Kitchen - a co-op Overcooked-lite for two.
   Host-authoritative: the host simulates at 30 Hz and broadcasts compact JSON snapshots every 50 ms;
   the guest sends held input + Space events (same model as games/party.js).
   Test hooks: window.KITCHEN_BOTS = true  -> internal bot policy drives local input (both seats when KITCHEN_SPEED > 4)
               window.KITCHEN_SPEED = n    -> game time runs n x faster
               window.KITCHEN_SIM          -> pure simulation API (used by headless tests) */
(function () {
  'use strict';
  var W = 800, H = 500, TS = 48, GW = 12, GH = 9, OX = 8, OY = 58, SPD = 175, CRAD = 15;
  var COL = { host: '#ff5c8a', guest: '#58c7ff', gold: '#ffd166', good: '#4ade80', bad: '#ff5a6a', ink: '#f6f5ff', dim: '#a9a7d3', violet: '#9b6bff' };
  var FONT = 'Outfit,system-ui,sans-serif';
  var EF = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';

  /* ------------------------------------------------------------------ kitchen map
     '.' floor  '#' counter  crates (infinite): A acai R berries G GF-granola F froyo S sprinkles B banana
     P protein M milk N paneer W GF-wrap X wheat-wrap(!) T tea O mango
     D bowls  K chopping board  L tandoor grill  Z blender  H chai stove  E signature scent  Q sponge  U trash  V serve */
  var MAP = [
    '#ARGFS#DD#E#',
    'N..........#',
    'L..........V',
    'L..........V',
    '#...####...#',
    'W..........U',
    'X..........Q',
    '#..........#',
    '#BKK#POMTHZ#'];
  var CRATES = 'ARGFSBPMNWXTO';
  var PLATEABLE = 'AGRbFSWXn';      // things that can go in a bowl
  var RAWPLATE = 'ARGFSWX';         // crates you can scoop straight into a bowl
  var DX = [1, 0, -1, 0], DY = [0, 1, 0, -1];

  function T(c, r) { return (c < 0 || r < 0 || c >= GW || r >= GH) ? '#' : MAP[r].charAt(c); }
  function tc(id) { return id % GW; }
  function tr(id) { return Math.floor(id / GW); }
  function cxOf(c) { return OX + c * TS + TS / 2; }
  function cyOf(r) { return OY + r * TS + TS / 2; }
  var FLOOR = [], ADJ = {}, PLAIN = [], TB = {};
  (function () {
    for (var r = 0; r < GH; r++) for (var c = 0; c < GW; c++) {
      var t = T(c, r), id = r * GW + c;
      (TB[t] = TB[t] || []).push(id);
      if (t === '.') { FLOOR.push(id); continue; }
      var a = [];
      for (var d = 0; d < 4; d++) if (T(c + DX[d], r + DY[d]) === '.') a.push((r + DY[d]) * GW + c + DX[d]);
      ADJ[id] = a;
      if (t === '#' && a.length) PLAIN.push(id);
    }
  })();

  /* ------------------------------------------------------------------ content */
  var ING = {
    A: { e: '🍇', n: 'Acai' }, R: { e: '🍓', n: 'Berries' }, G: { e: '🌾', n: 'GF Granola' }, F: { e: '🍦', n: 'Froyo' },
    S: { e: '🍬', n: 'Sprinkles' }, B: { e: '🍌', n: 'Banana' }, b: { e: '🍌', n: 'Chopped banana' }, P: { e: '💪', n: 'Protein' },
    M: { e: '🥛', n: 'Milk' }, N: { e: '🧀', n: 'Paneer' }, n: { e: '🍢', n: 'Paneer tikka' }, z: { e: '🌑', n: 'Charcoal tikka' },
    W: { e: '🫓', n: 'GF Wrap' }, X: { e: '🥖', n: 'WHEAT wrap' }, T: { e: '🍃', n: 'Tea' }, O: { e: '🥭', n: 'Mango' }, '~': { e: '🧽', n: 'Sponge' }
  };
  var REC = {
    AGRb: { n: 'Acai Bowl', e: '🥣', d: 'Bowl + Acai + Berries + GF Granola + chopped Banana', x: 20 },
    FS: { n: 'Froyo + Sprinkles', e: '🍨', d: 'Bowl + Froyo + Sprinkles', x: 0 },
    FR: { n: 'Berry Froyo', e: '🍨', d: 'Bowl + Froyo + Berries', x: 0 },
    Wn: { n: 'Paneer Tikka Wrap', e: '🌯', d: 'Bowl + GF Wrap + Paneer grilled in the tandoor', x: 15 },
    '#S': { n: 'Protein Smoothie', e: '🥤', d: 'Blender: Banana + Protein, hold E', x: 5 },
    '#L': { n: 'Mango Lassi', e: '🍹', d: 'Blender: Mango + Milk, hold E', x: 5 },
    '#C': { n: 'Masala Chai', e: '☕', d: 'Stove: Tea + Milk, it brews itself', x: 5 }
  };
  var DRINKNEED = { '#S': 'BP', '#L': 'MO', '#C': 'MT' };
  var DRINKE = { '#S': '🥤', '#L': '🍹', '#C': '☕', '#X': '🤢' };

  var PERS = [
    /* 0-6 space */
    { e: '🟢', n: 'Master Yoghurta', fav: ['FS', 'FR'], l: ['Froyo, I desire. Sprinkles, it must have.', 'Gluten leads to bloating. Bloating leads to suffering.', 'Patient I am. ...Not very.'], ok: 'Delicious, this is. Hmmm!', mad: 'Gluten I sense! Leave, I must!' },
    { e: '🖖', n: 'Captain Pick-a-Flavour', fav: ['#C'], l: ['Chai. Masala. HOT!', 'Make it so, Number Two!', 'Froyo: the final frontier.'], ok: 'Engage... my taste buds!', mad: 'Red alert! GLUTEN on deck!' },
    { e: '⚔️', n: 'Jedi Gluten-Knight', fav: ['AGRb', '#S'], l: ['I swear my lightsaber is gluten-free.', 'These are not the crumbs you are looking for.', 'Use the Fork. Feel the Fork.'], ok: 'The Force is strong with this one.', mad: 'I have a bad feeling... NOT the gluten!!' },
    { e: '🤖', n: 'Boba Fettuccine', fav: ['AGRb', 'Wn'], l: ['Bounty hunter. Gluten-free bounties only.', 'Despite my name: NO pasta. No crumbs.', 'I want it warm. Like a carbonite nap.'], ok: 'Payment accepted. Respect.', mad: 'This contract is VOID.' },
    { e: '🦬', n: 'Appo the Sky Bison', fav: ['FS', 'FR'], l: ['*happy rumble* (only eats froyo)', 'Yip yip! Six stomachs, all empty.', 'Mrrrooo? (translation: extra berries)'], ok: '*joyful bison rumble*', mad: '*very sad bison groan*' },
    { e: '🐒', n: 'Momo the Lemur', fav: ['#S'], l: ['*steals a banana* ...was not me.', 'Eee! Eee! (smoothie please)', '*flaps ears at the blender*'], ok: '*does a triple backflip*', mad: '*throws the cup at you*' },
    { e: '🍵', n: 'Uncle Tea-roh', fav: ['#C'], l: ['Sharing chai with a stranger is a great joy.', 'Is it jasmine? No? Masala is fine, nephew.', 'Pride is not the opposite of crumbs. Wiping is.'], ok: 'Perfectly brewed. Like destiny.', mad: 'Even I cannot forgive this crumb.' },
    /* 7-12 bollywood */
    { e: '🚂', n: 'Raj & Simran', fav: ['#L', 'FS'], l: ['Waiting at the train station... for our order.', 'Come... fall in love... with this lassi.', 'Big kitchens, little crumbs, Senorita...'], ok: 'Ja, jee le apni froyo! 💞', mad: 'The train has LEFT. And so have we.' },
    { e: '🎸', n: 'Rahul (naam toh suna hoga?)', fav: ['#L'], l: ['Order toh suna hoga?', 'Arms out wide... for one Mango Lassi.', 'Pyaar dosti hai. Lassi bhi.'], ok: 'Kuch kuch tasty hota hai!', mad: 'Rahul is VERY disappointed.' },
    { e: '💅', n: 'Princess Phat-tastic', fav: ['AGRb', 'FR'], l: ['Who is she to judge my bowl?', 'PHAT! Now THAT is an acai bowl.', 'Pretty, pretty please. Zero gluten.'], ok: 'Iconic. Like me.', mad: 'Ew. Totally not phat. Bye.' },
    { e: '🧳', n: 'Chatterbox on the Train', fav: ['#C', '#S'], l: ['I am my own favourite customer!', 'I talk a LOT but I order fast: chai!', 'Plans are boring. Smoothie now!'], ok: 'Mast! Best day of my life. Again!', mad: 'Gluten?! I am getting off at the next station!' },
    { e: '🎬', n: 'Junior Artist Om', fav: ['Wn', 'AGRb'], l: ['One day I will be a star. Today: hungry.', 'Ek chutki gluten ki keemat tum kya jaano!', 'Picture abhi baaki hai, mere dost.'], ok: 'Picture HIT hai!', mad: 'One pinch of gluten... the price was TOO high!' },
    { e: '🌧️', n: 'Kal Ho Na Lassi', fav: ['#L'], l: ['Every moment is changing... like my order.', 'Smile, it is a lassi kind of day.', 'Tomorrow may never come. Lassi NOW.'], ok: 'Pretty woman... pretty lassi!', mad: 'This is the saddest scene in the movie.' },
    /* 13-17 stadium */
    { e: '⚽', n: 'Striker Celebratio', fav: ['Wn', '#S'], l: ['Every order is a GOAL!', 'Pass me the wrap. Through ball!', 'Siuuu... smoothie please.'], ok: 'GOOOOAAAAL!!! ⚽🎉', mad: 'RED CARD! That was gluten!' },
    { e: '🧑‍⚖️', n: 'VAR Referee', fav: ['AGRb', 'FS'], l: ['Checking for gluten... still checking...', 'I will review this bowl on the monitor.', 'Offside? No. Just hungry.'], ok: 'Decision: DELICIOUS. Play on!', mad: 'VAR confirms: GLUTEN. Penalty!' },
    { e: '🏋️', n: 'Gym Bro Brad', fav: ['#S'], l: ['Extra protein, bro. EXTRA.', 'Do you even blend, bro?', 'Leg day. Need gains. Smoothie.'], ok: 'GAINS! Let us gooo!', mad: 'Bro... gluten? I did not ask for a cheat day.' },
    { e: '💐', n: 'Perfume Influencer', fav: ['AGRb', 'FR'], l: ['Can you spritz my bowl? It is for the gram.', 'Top notes: mango. Base notes: NO gluten.', 'Does it come in eau de acai?'], ok: 'Obsessed. Link in bio.', mad: 'Unfollowing this kitchen.' },
    { e: '🧤', n: 'Goalie Safe-Hands', fav: ['#C'], l: ['I catch everything except gluten.', 'Clean sheet = clean counters.', 'Keeper needs chai at half-time.'], ok: 'Safe hands, happy belly!', mad: 'Own goal! GLUTEN!' },
    /* 18-20 anywhere */
    { e: '👑', n: 'The Celiac Queen', fav: ['AGRb', 'FR'], l: ['One crumb and I call my lawyer. Kidding. (Not kidding.)', 'Is that granola certified GF? Show me papers.', 'Gym at 6, acai at 7, judging you at 8.'], ok: 'Strictly gluten-free. You may live.', mad: 'NOT the gluten!! I trusted you!!' },
    { e: '🛫', n: 'Rom-Com Heroine', fav: ['AGRb', 'FS'], l: ['I ran through the whole airport for this bowl.', 'Just a girl, in front of a kitchen, asking for froyo.', 'We were on a break... from gluten.'], ok: 'This is my happy ending. 🥹', mad: 'Worst. Meet-cute. EVER.' },
    { e: '🛋️', n: 'Sitcom Friend', fav: ['#C', 'FS'], l: ['PIVOT! Pivot the tray!', 'Could this BE any more delayed?', 'How you doin\'... with my order?'], ok: 'Could this BE any more delicious?!', mad: 'Oh. My. GLUTEN.' }
  ];

  var LV = [
    { n: 'Space Station Cafe', e: '🚀', tag: 'Zero gravity. Zero gluten.', rec: ['FS', 'FR', 'AGRb', '#S', '#C'], dur: 180, spawn: 13, pat: 85, gr0: 30, gi: 45, gs: 0.9, th: [150, 300, 450], pers: [0, 1, 2, 3, 4, 5, 6, 18, 19, 20] },
    { n: 'Bollywood Film Set Diner', e: '🎬', tag: 'Lights, camera, LASSI!', rec: ['FS', 'AGRb', '#S', '#C', '#L', 'Wn'], dur: 180, spawn: 10.5, pat: 76, gr0: 25, gi: 34, gs: 1, th: [170, 340, 520], pers: [7, 8, 9, 10, 11, 12, 18, 19, 20, 4] },
    { n: 'Football Stadium Snack Bar', e: '🏟️', tag: 'Half-time rush. No gluten on the pitch!', rec: ['FS', 'FR', 'AGRb', '#S', '#C', '#L', 'Wn'], dur: 180, spawn: 8.5, pat: 68, gr0: 20, gi: 26, gs: 1.15, th: [190, 380, 570], pers: [13, 14, 15, 16, 17, 18, 19, 20, 2] }
  ];
  var ROMCOM = [
    'Tumhe dekha toh... order complete ho gaya 💞',
    'Kuch kuch hota hai... jab tum plate pass karte ho',
    'Ek tray, do dil, zero gluten',
    'Dil toh gluten-free hai ji 💕',
    'Turn around... turn around... she passed the plate!',
    'Two chefs, one blender, infinite feelings',
    'Mere sapnon ki rani... with extra granola',
    'Cue the violins! Cue the slow-mo! Cue the froyo!'
  ];

  /* ------------------------------------------------------------------ simulation (pure, JSON state) */
  function srt(s) { return s.split('').sort().join(''); }
  function subset(a, b) { for (var i = 0; i < a.length; i++) if (b.indexOf(a.charAt(i)) < 0) return false; return true; }
  function isDish(it) { return !!it && ((it.p && it.v.length > 0) || it.v.charAt(0) === '#'); }
  function dishCode(it) {
    if (!it) return '';
    if (it.v.charAt(0) === '#') return it.v;
    if (it.p) return srt(it.v.replace('X', 'W'));
    return '';
  }
  function chefTile(ch) { var c = Math.floor((ch.x - OX) / TS), r = Math.floor((ch.y - OY) / TS); return r * GW + c; }
  function facing(ch) {
    var x = ch.x + DX[ch.f] * 30, y = ch.y + DY[ch.f] * 30;
    var c = Math.floor((x - OX) / TS), r = Math.floor((y - OY) / TS);
    if (c < 0 || r < 0 || c >= GW || r >= GH) return -1;
    return r * GW + c;
  }
  function mkChef(c, r) { return { x: cxOf(c), y: cyOf(r), f: 1, h: null, cl: -1, wk: 0 }; }
  function newLevel(l, rnd) {
    var L = LV[l];
    return {
      lv: l, t: 0, tl: L.dur, co: 0, sv: 0, an: 0, gl: 0, it: {}, cr: {}, cu: [], nc: 1.2, cid: 1,
      ch: [mkChef(2, 4), mkChef(9, 4)], gr: null, ng: L.gr0, fx: [], fid: 1,
      rc: 0, rcb: 0, rcc: 0, rn: 0, lp: {}, ho: [-99, -99], ls: [-99, -99], sc: 0, cs: 0, done: 0, st: 0
    };
  }
  function fx(S, x, y, s, col, big, al) {
    var f = { i: S.fid++, x: Math.round(x), y: Math.round(y), s: String(s).slice(0, 64), c: col || '#fff', t: big ? 2.2 : 1.3 };
    if (big) f.b = 1; if (al) f.a = al;
    S.fx.push(f); if (S.fx.length > 10) S.fx.shift();
  }
  function fail(S, ch, msg) { fx(S, ch.x, ch.y - 40, msg, '#ffd166'); }
  function custY(i) { return OY + 30 + i * 106 + 50; }
  function romcom(S, rnd, why) {
    if (S.rcc > 0) return;
    S.rc = 3; S.rcc = 14; S.rn++; S.co += 25;
    S.rcb = Math.floor(rnd() * ROMCOM.length);
    fx(S, OX + GW * TS / 2, OY + 70, why + ' +25 🪙', '#ff8db0', true);
  }
  function addToPlate(S, ch, plate, c, g) {
    if (PLATEABLE.indexOf(c) < 0) {
      fail(S, ch, c === 'B' ? 'Chop it first! 🔪' : c === 'N' ? 'Grill it first! 🔥' : c === 'z' ? 'That is charcoal 💀' : 'That goes in a drink!');
      return false;
    }
    if (plate.v.indexOf(c) >= 0) { fail(S, ch, 'Already in there!'); return false; }
    if (plate.v.length >= 4) { fail(S, ch, 'Bowl is full!'); return false; }
    plate.v = srt(plate.v + c);
    if (g || c === 'X') { plate.g = 1; fx(S, ch.x, ch.y - 40, c === 'X' ? 'WHEAT?! ⚠️🥖' : 'Contaminated! ⚠️', '#ff5a6a'); }
    return true;
  }
  function placeItem(S, k, id, item) {
    var ch = S.ch[k];
    if (S.cr[id] !== undefined && !item.g && item.v !== '~') { item.g = 1; fx(S, cxOf(tc(id)), cyOf(tr(id)) - 20, 'Crumby counter! ⚠️🥖', '#ff5a6a'); }
    S.it[id] = item; ch.h = null; S.lp[id] = [k, S.t];
  }
  function pickUp(S, k, id, rnd) {
    var ch = S.ch[k], it = S.it[id];
    ch.h = it; delete S.it[id]; delete it.c;
    var lp = S.lp[id]; delete S.lp[id];
    if (lp && lp[0] !== k && S.t - lp[1] < 5 && isDish(it)) {
      S.ho[k] = S.t; fx(S, ch.x, ch.y - 40, 'Sweet pass! 💝', '#ff8db0');
      if (S.t - S.ho[1 - k] < 10) romcom(S, rnd, 'Rom-Com Moment 💞');
    }
  }
  function serve(S, k, rnd) {
    var ch = S.ch[k], h = ch.h;
    if (!h) return;
    var code = dishCode(h);
    if (!code || code === '#X') { fail(S, ch, h.v === '#X' ? 'Nobody wants sludge 🤢' : 'Not a finished dish!'); return; }
    var best = -1;
    for (var i = 0; i < S.cu.length; i++) if (S.cu[i].r === code && (best < 0 || S.cu[i].pt < S.cu[best].pt)) best = i;
    if (best < 0) { fail(S, ch, 'Nobody ordered that! 🤷'); return; }
    var cu = S.cu[best], P = PERS[cu.p];
    S.cu.splice(best, 1); ch.h = null;
    if (h.g) {
      S.co -= 15; S.gl++;
      fx(S, W - 14, custY(best), P.e + ' "' + P.mad + '"', '#ff5a6a', false, 'r');
      fx(S, ch.x, ch.y - 44, 'NOT the gluten!! 🥖🚫 -15', '#ff5a6a', true);
      return;
    }
    var pay = 20 + Math.round(12 * Math.max(0, cu.pt) / cu.pm) + (h.s ? 10 : 0);
    if (h.s) S.sc++;
    S.co += pay; S.sv++;
    fx(S, W - 14, custY(best), P.e + ' "' + P.ok + '"', '#4ade80', false, 'r');
    fx(S, ch.x, ch.y - 44, '+' + pay + ' 🪙' + (h.s ? ' ✨' : ''), '#ffd166', true);
    var other = S.ls[1 - k]; S.ls[k] = S.t;
    if (S.t - other < 1.6) romcom(S, rnd, 'Synchronised serve! Rom-Com Moment 💞');
  }
  function interact(S, k, rnd) {
    var ch = S.ch[k], id = facing(ch);
    if (id < 0) return;
    var t = T(tc(id), tr(id)), on = S.it[id], h = ch.h;
    if (t === '.') return;
    if (CRATES.indexOf(t) >= 0) {
      if (!h) { ch.h = { v: t }; if (t === 'X') { ch.h.g = 1; fail(S, ch, 'That is WHEAT! ⚠️'); } return; }
      if (h.p) { if (RAWPLATE.indexOf(t) >= 0) addToPlate(S, ch, h, t, t === 'X'); else addToPlate(S, ch, h, t, 0); return; }
      if (h.v === t) { ch.h = null; return; }
      fail(S, ch, 'Hands full!'); return;
    }
    if (t === 'D') {
      if (!h) { ch.h = { v: '', p: 1 }; return; }
      if (h.p && h.v === '' && !h.g) { ch.h = null; return; }
      if (!h.p && !h.m && h.v.length === 1 && PLATEABLE.indexOf(h.v) >= 0) { ch.h = { v: h.v, p: 1 }; if (h.g || h.v === 'X') ch.h.g = 1; return; }
      fail(S, ch, 'Hands full!'); return;
    }
    if (t === 'U') { if (h) { ch.h = null; fx(S, ch.x, ch.y - 40, h.v === '~' ? 'Sponge returned' : 'Binned 🗑️', '#a9a7d3'); } return; }
    if (t === 'Q') { if (!h) ch.h = { v: '~' }; else if (h.v === '~') ch.h = null; else fail(S, ch, 'Hands full!'); return; }
    if (t === 'V') { if (h) serve(S, k, rnd); return; }
    if (t === 'Z' || t === 'H') {
      var acc = t === 'Z' ? 'BbPMO' : 'TM';
      if (h) {
        if (h.p || h.m || h.v.length !== 1 || acc.indexOf(h.v) < 0) { fail(S, ch, t === 'Z' ? 'Blender takes fruit, milk, protein' : 'Chai needs tea + milk'); return; }
        if (on && on.v.charAt(0) === '#') { fail(S, ch, 'Take the drink out first!'); return; }
        var cur = on ? on.v : '';
        if (cur.indexOf(h.v) >= 0 || cur.length >= 3) { fail(S, ch, 'Already in there!'); return; }
        var mix = { v: srt(cur + h.v), m: 1 }; if ((on && on.g) || h.g) mix.g = 1;
        S.it[id] = mix; ch.h = null; return;
      }
      if (!on) return;
      if (on.v.charAt(0) === '#') { pickUp(S, k, id, rnd); return; }
      var last = on.v.charAt(on.v.length - 1);
      ch.h = { v: last }; if (on.g) ch.h.g = 1;
      if (on.v.length > 1) { on.v = on.v.slice(0, -1); delete on.c; } else delete S.it[id];
      return;
    }
    /* holders: plain counter, board, grill, perfume */
    if (!h) { if (on) pickUp(S, k, id, rnd); return; }
    if (!on) {
      if (t === 'K' && h.v !== 'B') { fail(S, ch, 'Only bananas get chopped here 🍌'); return; }
      if (t === 'L' && 'Nnz'.indexOf(h.v) < 0) { fail(S, ch, 'The tandoor is for paneer!'); return; }
      if (t === 'E' && !isDish(h)) { fail(S, ch, 'Spritz finished dishes only ✨'); return; }
      placeItem(S, k, id, h); return;
    }
    if (h.p && !on.p && !on.m && on.v.length === 1 && on.v !== '~') {
      if (addToPlate(S, ch, h, on.v, on.g)) delete S.it[id];
      return;
    }
    if (on.p && !h.p && !h.m && h.v.length === 1 && h.v !== '~') {
      if (addToPlate(S, ch, on, h.v, h.g)) ch.h = null;
      return;
    }
    fail(S, ch, 'No room!');
  }
  function work(S, k, d) {
    var ch = S.ch[k], id = facing(ch);
    if (id < 0) return 0;
    var t = T(tc(id), tr(id)), on = S.it[id];
    if (t === 'K' && on && on.v === 'B') {
      on.c = (on.c || 0) + d / 1.5;
      if (on.c >= 1) { on.v = 'b'; delete on.c; fx(S, cxOf(tc(id)), cyOf(tr(id)) - 22, 'Chop chop! 🔪', '#fff'); }
      return 1;
    }
    if (t === 'Z' && on && on.m && on.v.length >= 2) {
      on.c = (on.c || 0) + d / 2;
      if (on.c >= 1) {
        var res = (on.v === 'BP' || on.v === 'Pb') ? '#S' : on.v === 'MO' ? '#L' : '#X';
        S.it[id] = { v: res }; if (on.g) S.it[id].g = 1;
        fx(S, cxOf(tc(id)), cyOf(tr(id)) - 22, res === '#X' ? 'Ew, sludge 🤢' : 'Whirrr! ' + DRINKE[res], res === '#X' ? '#ff5a6a' : '#fff');
      }
      return 1;
    }
    if (t === 'E' && on && isDish(on) && !on.s) {
      on.c = (on.c || 0) + d / 1.2;
      if (on.c >= 1) { on.s = 1; delete on.c; fx(S, cxOf(tc(id)), cyOf(tr(id)) - 22, 'Signature Scent ✨ +10 tip', '#ff8db0'); }
      return 1;
    }
    if (ch.h && ch.h.v === '~' && S.cr[id] !== undefined) {
      S.cr[id] += d / 1.1;
      if (S.cr[id] >= 1) { delete S.cr[id]; fx(S, cxOf(tc(id)), cyOf(tr(id)) - 22, 'Sparkly clean ✨', '#4ade80'); }
      return 1;
    }
    return 0;
  }
  function collide(ch) {
    for (var it = 0; it < 2; it++) {
      var c0 = Math.floor((ch.x - OX) / TS), r0 = Math.floor((ch.y - OY) / TS);
      for (var dr = -1; dr <= 1; dr++) for (var dc = -1; dc <= 1; dc++) {
        var c = c0 + dc, r = r0 + dr;
        if (T(c, r) === '.') continue;
        var x0 = OX + c * TS, y0 = OY + r * TS;
        var px = Math.max(x0, Math.min(ch.x, x0 + TS)), py = Math.max(y0, Math.min(ch.y, y0 + TS));
        var dx = ch.x - px, dy = ch.y - py, dd = Math.hypot(dx, dy);
        if (dd < CRAD) {
          if (dd < 0.001) { var mx = x0 + TS / 2, my = y0 + TS / 2; dx = ch.x - mx; dy = ch.y - my; dd = Math.hypot(dx, dy) || 1; ch.x = mx + dx / dd * (TS / 2 + CRAD); ch.y = my + dy / dd * (TS / 2 + CRAD); }
          else { ch.x += dx / dd * (CRAD - dd); ch.y += dy / dd * (CRAD - dd); }
        }
      }
    }
  }
  function moveChef(ch, I, d) {
    var vx = (I.r ? 1 : 0) - (I.l ? 1 : 0), vy = (I.d ? 1 : 0) - (I.u ? 1 : 0);
    if (!vx && !vy) return;
    var hd = vx ? (vx > 0 ? 0 : 2) : -1, vd = vy ? (vy > 0 ? 1 : 3) : -1;
    if (hd >= 0 && vd >= 0) { if (ch.f !== hd && ch.f !== vd) ch.f = hd; }
    else ch.f = hd >= 0 ? hd : vd;
    var l = Math.hypot(vx, vy);
    ch.x += vx / l * SPD * d; ch.y += vy / l * SPD * d;
    collide(ch);
  }
  function spawnCust(S, rnd) {
    var L = LV[S.lv], pi = 0;
    for (var tries = 0; tries < 5; tries++) {
      pi = L.pers[Math.floor(rnd() * L.pers.length)];
      var dup = false; for (var j = 0; j < S.cu.length; j++) if (S.cu[j].p === pi) dup = true;
      if (!dup) break;
    }
    var P = PERS[pi], fav = P.fav.filter(function (r) { return L.rec.indexOf(r) >= 0; });
    var r = (fav.length && rnd() < 0.6) ? fav[Math.floor(rnd() * fav.length)] : L.rec[Math.floor(rnd() * L.rec.length)];
    var pm = L.pat + (REC[r].x || 0);
    S.cu.push({ i: S.cid++, p: pi, r: r, pt: pm, pm: pm, l: Math.floor(rnd() * P.l.length) });
  }
  function tickCustomers(S, d, rnd) {
    var L = LV[S.lv];
    for (var i = S.cu.length - 1; i >= 0; i--) {
      var c = S.cu[i]; c.pt -= d;
      if (c.pt <= 0) {
        S.cu.splice(i, 1); S.co -= 5; S.an++;
        fx(S, W - 14, custY(i), PERS[c.p].e + ' ' + PERS[c.p].n + ' stormed off 😤 -5', '#ff5a6a', false, 'r');
      }
    }
    if (S.cu.length === 0 && S.nc > 2.5) S.nc = 2.5;
    S.nc -= d;
    if (S.nc <= 0) {
      if (S.cu.length < 4) spawnCust(S, rnd);
      S.nc = S.cu.length < 2 ? 4 : L.spawn * (0.75 + 0.5 * rnd());
    }
  }
  function tickStations(S, d) {
    for (var key in S.it) {
      var id = +key, it = S.it[key], t = T(tc(id), tr(id));
      if (t === 'L') {
        if (it.v === 'N') { it.c = (it.c || 0) + d / 6; if (it.c >= 1) { it.v = 'n'; it.c = 0; fx(S, cxOf(tc(id)), cyOf(tr(id)) - 22, 'Sizzle! 🍢', '#ffd166'); } }
        else if (it.v === 'n') { it.c = (it.c || 0) + d / 12; if (it.c >= 1) { it.v = 'z'; delete it.c; fx(S, cxOf(tc(id)), cyOf(tr(id)) - 22, 'Burnt! 💨', '#ff5a6a'); } }
      } else if (t === 'H' && it.m && it.v === 'MT') {
        it.c = (it.c || 0) + d / 4;
        if (it.c >= 1) { var g = it.g; S.it[key] = { v: '#C' }; if (g) S.it[key].g = 1; fx(S, cxOf(tc(id)), cyOf(tr(id)) - 22, 'Chai is ready ☕', '#ffd166'); }
      }
    }
  }
  function gremlinTarget(S, rnd) {
    var c = PLAIN.filter(function (id) { return !S.it[id] && S.cr[id] === undefined; });
    return c.length ? c[Math.floor(rnd() * c.length)] : -1;
  }
  function tickGremlin(S, d, rnd) {
    var L = LV[S.lv], g = S.gr;
    if (!g) {
      S.ng -= d;
      if (S.ng <= 0) {
        var left = rnd() < 0.5, y = cyOf(1 + Math.floor(rnd() * 7)), x = left ? -22 : OX + GW * TS + 4;
        var tg = gremlinTarget(S, rnd);
        if (tg < 0) { S.ng = 8; return; }
        S.gr = { x: x, y: y, ex: x, ey: y, s: 0, n: 2 + Math.floor(rnd() * 2), tg: tg, w: 0 };
        fx(S, OX + GW * TS / 2, OY + 40, 'The Gluten Gremlin 👾 sneaks in! Chase it!', '#c4ff6a', true);
      }
      return;
    }
    if (g.s !== 1) {
      for (var k = 0; k < 2; k++) {
        if (Math.hypot(S.ch[k].x - g.x, S.ch[k].y - g.y) < 38) {
          g.s = 1; S.co += 3; S.cs++;
          fx(S, g.x, g.y - 30, 'Shoo, gremlin! 👋 +3', '#c4ff6a');
          break;
        }
      }
    }
    var tx, ty, sp;
    if (g.s === 0) { tx = cxOf(tc(g.tg)); ty = cyOf(tr(g.tg)); sp = 78 * L.gs; }
    else { tx = g.ex; ty = g.ey; sp = g.s === 1 ? 250 : 95; }
    var dx = tx - g.x, dy = ty - g.y, dd = Math.hypot(dx, dy);
    if (dd > 3) { var m = Math.min(dd, sp * d); g.x += dx / dd * m; g.y += dy / dd * m; }
    else if (g.s === 0) {
      g.w += d;
      if (g.w > 0.8) {
        g.w = 0;
        if (!S.it[g.tg]) { S.cr[g.tg] = 0; fx(S, tx, ty - 22, 'Crumbs! 🥖', '#ffb36b'); g.n--; }
        var nt = g.n > 0 && Object.keys(S.cr).length < 5 ? gremlinTarget(S, rnd) : -1;
        if (nt < 0) g.s = 2; else g.tg = nt;
      }
    } else { S.gr = null; S.ng = L.gi * (0.8 + 0.4 * rnd()); return; }
    g.x = Math.round(g.x * 10) / 10; g.y = Math.round(g.y * 10) / 10;
  }
  function stars(S) { var th = LV[S.lv].th; return S.co >= th[2] ? 3 : S.co >= th[1] ? 2 : S.co >= th[0] ? 1 : 0; }
  function step(S, dt, inp, ev, rnd) {
    if (S.done) return;
    S.rcc = Math.max(0, S.rcc - dt);
    var slow = S.rc > 0 ? 0.45 : 1;
    if (S.rc > 0) S.rc = Math.max(0, S.rc - dt);
    var d = dt * slow;
    S.t += d; S.tl -= d;
    for (var k = 0; k < 2; k++) {
      var who = k ? 'guest' : 'host', I = (inp && inp[who]) || {}, E = (ev && ev[who]) || [], ch = S.ch[k];
      if (typeof I.cl === 'number') ch.cl = I.cl;
      moveChef(ch, I, d);
      for (var e = 0; e < E.length && e < 6; e++) if (E[e] && E[e].t === 'a') interact(S, k, rnd);
      ch.wk = I.b ? work(S, k, d) : 0;
    }
    var a = S.ch[0], b = S.ch[1], sd = Math.hypot(a.x - b.x, a.y - b.y);
    if (sd < 26 && sd > 0.01) { var push = (26 - sd) / 4; a.x -= (b.x - a.x) / sd * push; a.y -= (b.y - a.y) / sd * push; b.x += (b.x - a.x) / sd * push; b.y += (b.y - a.y) / sd * push; collide(a); collide(b); }
    tickStations(S, d);
    tickCustomers(S, d, rnd);
    tickGremlin(S, d, rnd);
    for (var i = S.fx.length - 1; i >= 0; i--) { S.fx[i].t -= dt; if (S.fx[i].t <= 0) S.fx.splice(i, 1); }
    for (var key in S.lp) if (S.t - S.lp[key][1] > 6) delete S.lp[key];
    S.ch.forEach(function (c) { c.x = Math.round(c.x * 10) / 10; c.y = Math.round(c.y * 10) / 10; });
    if (S.tl <= 0) { S.tl = 0; S.done = 1; S.st = stars(S); }
  }
  function snap(S) { return JSON.stringify(S, function (k, v) { return typeof v === 'number' ? Math.round(v * 100) / 100 : v; }); }

  /* ------------------------------------------------------------------ bot policy (stateless planner + tiny memory) */
  function bfsFirst(from, goals) {
    if (goals.indexOf(from) >= 0) return from;
    var prev = {}, q = [from], seen = {}; seen[from] = 1;
    while (q.length) {
      var cur = q.shift();
      if (goals.indexOf(cur) >= 0) { var s = cur; while (prev[s] !== from && prev[s] !== undefined) s = prev[s]; return s; }
      var c = tc(cur), r = tr(cur);
      for (var d = 0; d < 4; d++) {
        var nc = c + DX[d], nr = r + DY[d], nid = nr * GW + nc;
        if (T(nc, nr) !== '.' || seen[nid]) continue;
        seen[nid] = 1; prev[nid] = cur; q.push(nid);
      }
    }
    return -1;
  }
  function mdist(ch, id) { return Math.abs(ch.x - cxOf(tc(id))) + Math.abs(ch.y - cyOf(tr(id))); }
  function nearest(ch, ids) { var b = -1, bd = 1e9; ids.forEach(function (id) { var d = mdist(ch, id); if (d < bd) { bd = d; b = id; } }); return b; }
  function near(ch, sym) { return nearest(ch, TB[sym] || []); }
  function itemTiles(S, pred) { var o = []; for (var k in S.it) if (pred(S.it[k], +k)) o.push(+k); return o; }
  function stationOf(r) { return r === '#S' || r === '#L' ? 'Z' : r === '#C' ? 'H' : r === 'Wn' ? 'L' : ''; }
  function chooseClaim(S, k) {
    var ch = S.ch[k], o = S.ch[1 - k], i, cu = null, ocu = null;
    for (i = 0; i < S.cu.length; i++) { if (S.cu[i].i === ch.cl) cu = S.cu[i]; if (S.cu[i].i === o.cl) ocu = S.cu[i]; }
    if (cu && !(k === 1 && o.cl === cu.i)) return cu;
    var ost = ocu ? stationOf(ocu.r) : '', best = null, bs = 1e9;
    for (i = 0; i < S.cu.length; i++) {
      var c = S.cu[i];
      if (ocu && c.i === ocu.i) continue;
      var st = stationOf(c.r);
      if (ost && st === ost) continue;
      var sc = c.pt + (c.r === 'AGRb' ? 8 : 0);
      if (sc < bs) { bs = sc; best = c; }
    }
    return best;
  }
  function wanted(S, it) { if (!isDish(it) || it.g) return false; var dc = dishCode(it); return S.cu.some(function (c) { return c.r === dc; }); }
  function freeCounter(S, ch) { return nearest(ch, PLAIN.filter(function (id) { return !S.it[id] && S.cr[id] === undefined; })); }
  function platePlan(S, k, R) {
    var ch = S.ch[k], h = ch.h, i;
    var plates = function () { return itemTiles(S, function (it, id) { return it.p && !it.g && T(tc(id), tr(id)) === '#' && subset(it.v, R); }); };
    if (h && !h.p) {
      if (h.v === 'B' && R.indexOf('b') >= 0) { var bd = nearest(ch, TB.K.filter(function (id) { return !S.it[id]; })); if (bd >= 0) return { t: bd, a: 'a' }; }
      if (h.v === 'N' && R.indexOf('n') >= 0) { var gl = nearest(ch, TB.L.filter(function (id) { return !S.it[id]; })); if (gl >= 0) return { t: gl, a: 'a' }; }
      if (PLATEABLE.indexOf(h.v) >= 0 && R.indexOf(h.v) >= 0 && h.v.length === 1) {
        var pl = nearest(ch, plates().filter(function (id) { return S.it[id].v.indexOf(h.v) < 0; }));
        return pl >= 0 ? { t: pl, a: 'a' } : { t: near(ch, 'D'), a: 'a' };
      }
      return { t: near(ch, 'U'), a: 'a' };
    }
    if (h && h.p) {
      if (!subset(h.v, R)) return { t: near(ch, 'U'), a: 'a' };
      var miss = R.split('').filter(function (c) { return h.v.indexOf(c) < 0; });
      var raw = miss.filter(function (c) { return c !== 'b' && c !== 'n'; });
      if (raw.length) return { t: nearest(ch, raw.map(function (c) { return TB[c][0]; })), a: 'a' };
      for (i = 0; i < miss.length; i++) {
        var c = miss[i];
        var av = nearest(ch, itemTiles(S, function (it) { return it.v === c && !it.g && !it.p; }));
        if (av >= 0) return { t: av, a: 'a' };
      }
      if (miss.indexOf('n') >= 0) { var ck = itemTiles(S, function (it, id) { return it.v === 'N' && T(tc(id), tr(id)) === 'L'; }); if (ck.length) return { t: ck[0], a: 'w' }; }
      var fc = freeCounter(S, ch);
      return fc >= 0 ? { t: fc, a: 'a' } : { t: near(ch, 'U'), a: 'a' };
    }
    /* empty hands */
    var pls = plates(), pl0 = nearest(ch, pls), inPlate = pl0 >= 0 ? S.it[pl0].v : '';
    if (R.indexOf('n') >= 0 && inPlate.indexOf('n') < 0) {
      var avn = itemTiles(S, function (it) { return it.v === 'n' && !it.g; }).length;
      var ckn = itemTiles(S, function (it, id) { return it.v === 'N' && T(tc(id), tr(id)) === 'L'; }).length;
      if (!avn && !ckn) {
        var burnt = itemTiles(S, function (it, id) { return T(tc(id), tr(id)) === 'L'; });
        if (burnt.length >= TB.L.length) return { t: burnt[0], a: 'a' };
        return { t: TB.N[0], a: 'a' };
      }
    }
    if (R.indexOf('b') >= 0 && inPlate.indexOf('b') < 0) {
      var avb = itemTiles(S, function (it) { return it.v === 'b' && !it.g; }).length;
      if (!avb) {
        var ch1 = nearest(ch, itemTiles(S, function (it, id) { return it.v === 'B' && T(tc(id), tr(id)) === 'K'; }));
        if (ch1 >= 0) return { t: ch1, a: 'b' };
        return { t: TB.B[0], a: 'a' };
      }
    }
    if (pl0 >= 0) return { t: pl0, a: 'a' };
    return { t: near(ch, 'D'), a: 'a' };
  }
  function drinkPlan(S, k, R) {
    var ch = S.ch[k], h = ch.h, st = R === '#C' ? TB.H[0] : TB.Z[0], need = DRINKNEED[R], on = S.it[st];
    if (h) {
      if (!h.p && !h.m && h.v.length === 1 && need.indexOf(h.v) >= 0 && !h.g &&
        (!on || (on.m && on.v.indexOf(h.v) < 0 && subset(on.v, need) && !on.g))) return { t: st, a: 'a' };
      return { t: near(ch, 'U'), a: 'a' };
    }
    if (on) {
      if (on.v.charAt(0) === '#') return { t: st, a: 'a' };
      if (!subset(on.v, need) || on.g) return { t: st, a: 'a' };
      if (on.v === need) return R === '#C' ? { t: st, a: 'w' } : { t: st, a: 'b' };
    }
    var have = on ? on.v : '', miss = need.split('').filter(function (c) { return have.indexOf(c) < 0; });
    return { t: nearest(ch, miss.map(function (c) { return TB[c][0]; })), a: 'a' };
  }
  function botPlan(S, k, cust) {
    var ch = S.ch[k], h = ch.h, R = cust ? cust.r : null, e = TB.E[0], ei = S.it[e];
    if (S.gr && S.gr.s !== 1 && (k === 1 || !R)) return { chase: 1 };
    if (h && h.v === '~') {
      var crs = Object.keys(S.cr).map(Number);
      if (crs.length) return { t: nearest(ch, crs), a: 'b' };
      return { t: near(ch, 'Q'), a: 'a' };
    }
    if (h && h.g) return { t: near(ch, 'U'), a: 'a' };
    if (h && isDish(h) && wanted(S, h)) {
      var dc = dishCode(h), mc = null;
      S.cu.forEach(function (c) { if (c.r === dc && (!mc || c.pt < mc.pt)) mc = c; });
      if (!h.s && !ei && mc.pt / mc.pm > 0.6) return { t: e, a: 'a' };
      return { t: near(ch, 'V'), a: 'a' };
    }
    if (!h) {
      if (ei && (!R || dishCode(ei) === R || !wanted(S, ei))) return (ei.s || !wanted(S, ei)) ? { t: e, a: 'a' } : { t: e, a: 'b' };
      if (k === 1 || !R) {
        if (Object.keys(S.cr).length) return { t: near(ch, 'Q'), a: 'a' };
        var junk = nearest(ch, itemTiles(S, function (it, id) { return (it.g || it.v === 'z') && T(tc(id), tr(id)) !== 'Z' && T(tc(id), tr(id)) !== 'H'; }));
        if (junk >= 0) return { t: junk, a: 'a' };
      }
    }
    if (!R) return h ? { t: near(ch, 'U'), a: 'a' } : null;
    return R.charAt(0) === '#' ? drinkPlan(S, k, R) : platePlan(S, k, R);
  }
  function emptyIn() { return { u: 0, d: 0, l: 0, r: 0, b: 0 }; }
  function steer(ch, x, y, out) {
    var dx = x - ch.x, dy = y - ch.y;
    if (Math.abs(dx) > 3) out[dx > 0 ? 'r' : 'l'] = 1;
    if (Math.abs(dy) > 3) out[dy > 0 ? 'd' : 'u'] = 1;
  }
  function botInput(S, who, mem) {
    var k = who === 'guest' ? 1 : 0, ch = S.ch[k], out = emptyIn(), evs = [];
    var cust = chooseClaim(S, k);
    out.cl = cust ? cust.i : -1;
    var plan = botPlan(S, k, cust);
    var cur = chefTile(ch);
    if (!plan) return { in: out, ev: evs };
    if (plan.chase) {
      var g = S.gr, best = -1, bd = 1e9;
      FLOOR.forEach(function (id) { var d = Math.abs(cxOf(tc(id)) - g.x) + Math.abs(cyOf(tr(id)) - g.y); if (d < bd) { bd = d; best = id; } });
      if (best === cur) steer(ch, g.x, g.y, out);
      else { var nx = bfsFirst(cur, [best]); if (nx >= 0) steer(ch, cxOf(tc(nx)), cyOf(tr(nx)), out); }
      return { in: out, ev: evs };
    }
    var goals = ADJ[plan.t];
    if (plan.t < 0 || !goals || !goals.length) return { in: out, ev: evs };
    if (goals.indexOf(cur) < 0) {
      var nxt = bfsFirst(cur, goals);
      if (nxt >= 0) steer(ch, cxOf(tc(nxt)), cyOf(tr(nxt)), out);
      else steer(ch, cxOf(tc(goals[0])), cyOf(tr(goals[0])), out);
      return { in: out, ev: evs };
    }
    var sc = tc(plan.t), sr = tr(plan.t), cc = tc(cur), cr = tr(cur);
    var dir = sc > cc ? 0 : sc < cc ? 2 : sr > cr ? 1 : 3, mx = cxOf(cc), my = cyOf(cr);
    if (dir === 0 || dir === 2) { if (Math.abs(ch.y - my) > 6) { out[ch.y > my ? 'u' : 'd'] = 1; return { in: out, ev: evs }; } }
    else if (Math.abs(ch.x - mx) > 6) { out[ch.x > mx ? 'l' : 'r'] = 1; return { in: out, ev: evs }; }
    out[['r', 'd', 'l', 'u'][dir]] = 1;
    if (ch.f === dir && facing(ch) === plan.t) {
      if (plan.a === 'a') { if (S.t - (mem.la || -9) > 0.3) { mem.la = S.t; evs.push({ t: 'a' }); } }
      else if (plan.a === 'b') out.b = 1;
    }
    return { in: out, ev: evs };
  }

  window.KITCHEN_SIM = {
    MAP: MAP, LV: LV, REC: REC, PERS: PERS, TB: TB, PLAIN: PLAIN, newLevel: newLevel, step: step, botInput: botInput,
    interact: interact, dishCode: dishCode, stars: stars, snap: snap, facing: facing, cxOf: cxOf, cyOf: cyOf
  };

  /* ------------------------------------------------------------------ drawing */
  function rrect(c, x, y, w, h, r, fill, stroke, lw) {
    c.beginPath();
    if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 2; c.stroke(); }
  }
  function text(c, t, x, y, size, col, align, weight) {
    c.font = (weight || 800) + ' ' + (size || 16) + 'px ' + FONT; c.textAlign = align || 'center'; c.textBaseline = 'middle';
    c.fillStyle = col || COL.ink; c.fillText(String(t), x, y);
  }
  function otext(c, t, x, y, size, col, align) {
    c.font = '800 ' + (size || 16) + 'px ' + FONT; c.textAlign = align || 'center'; c.textBaseline = 'middle';
    c.lineJoin = 'round'; c.lineWidth = Math.max(3, (size || 16) / 5); c.strokeStyle = 'rgba(10,6,30,.85)'; c.strokeText(String(t), x, y);
    c.fillStyle = col || COL.ink; c.fillText(String(t), x, y);
  }
  function emoji(c, e, x, y, size) { c.font = size + 'px ' + EF; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff'; c.fillText(e, x, y + size * 0.05); }
  function ring(c, x, y, r, frac, col) {
    c.lineWidth = 5; c.strokeStyle = 'rgba(0,0,0,.45)'; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = col; c.lineCap = 'round'; c.beginPath(); c.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0.02, Math.min(1, frac))); c.stroke(); c.lineCap = 'butt';
  }
  function wrap(c, s, maxW, size, weight) {
    c.font = (weight || 600) + ' ' + size + 'px ' + FONT;
    var words = String(s).split(' '), lines = [], line = '';
    words.forEach(function (w) { var t = line ? line + ' ' + w : w; if (c.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; });
    if (line) lines.push(line);
    return lines;
  }
  function hash(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  var THEME = [
    { bg0: '#0d0b2e', bg1: '#060516', f0: '#2b2766', f1: '#25215a', ct: '#7f93c9', cb: '#47557f', ce: '#2e3757', acc: '#58c7ff' },
    { bg0: '#3a0d1d', bg1: '#14040a', f0: '#7a1f30', f1: '#6a1828', ct: '#e7b45a', cb: '#a8772a', ce: '#6b4512', acc: '#ffd166' },
    { bg0: '#0f2d1a', bg1: '#06140b', f0: '#2f8f40', f1: '#2a8039', ct: '#f2f5fb', cb: '#b9c3d6', ce: '#6d7a96', acc: '#4ade80' }
  ];
  var STV = {
    A: ['🍇', 'ACAI', '#7b3fa8'], R: ['🍓', 'BERRY', '#c2304f'], G: ['🌾', 'GF GRANOLA', '#b58a3c'], F: ['🍦', 'FROYO', '#e58bb4'],
    S: ['🍬', 'SPRINKLE', '#d65db1'], B: ['🍌', 'BANANA', '#d8b42a'], P: ['💪', 'PROTEIN', '#5a6bd6'], M: ['🥛', 'MILK', '#8fb3d9'],
    N: ['🧀', 'PANEER', '#d9a441'], W: ['🫓', 'GF WRAP', '#4caf6a'], X: ['🥖', 'WHEAT!', '#c0392b'], T: ['🍃', 'TEA', '#3f9b5a'], O: ['🥭', 'MANGO', '#f39c34'],
    D: ['🍽️', 'BOWLS', '#e9eef7'], K: ['🔪', 'CHOP', '#9b6a3c'], L: ['🔥', 'TANDOOR', '#5b2d22'], Z: ['🌀', 'BLEND', '#5c6c8a'], H: ['🫖', 'CHAI', '#3c3c4c'],
    E: ['💐', 'SCENT', '#ff8db0'], Q: ['🧽', 'SPONGE', '#e8c547'], U: ['🗑️', 'TRASH', '#55596a'], V: ['🛎️', 'SERVE', '#ffd166']
  };

  function drawBanana(c, x, y, s) {
    for (var i = 0; i < 3; i++) {
      var px = x + (i - 1) * s * 0.32, py = y + (i === 1 ? -s * 0.12 : s * 0.08);
      c.fillStyle = '#fff3b0'; c.beginPath(); c.arc(px, py, s * 0.2, 0, 7); c.fill();
      c.strokeStyle = '#e0c25a'; c.lineWidth = 2; c.stroke();
      c.fillStyle = '#b08a3a'; c.beginPath(); c.arc(px, py, s * 0.05, 0, 7); c.fill();
    }
  }
  function drawItem(c, it, x, y, s, now) {
    if (!it) return;
    if (it.p) {
      c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(x, y + s * 0.18, s * 0.58, s * 0.3, 0, 0, 7); c.fill();
      var pg = c.createRadialGradient(x - s * 0.15, y - s * 0.1, 2, x, y, s * 0.6); pg.addColorStop(0, '#ffffff'); pg.addColorStop(1, '#cfd6e6');
      c.fillStyle = pg; c.beginPath(); c.ellipse(x, y, s * 0.56, s * 0.42, 0, 0, 7); c.fill();
      c.strokeStyle = '#9aa6bf'; c.lineWidth = 1.5; c.stroke();
      var code = dishCode(it);
      if (REC[code] && code.charAt(0) !== '#') emoji(c, REC[code].e, x, y - 2, s * 0.72);
      else {
        var n = it.v.length;
        for (var i = 0; i < n; i++) {
          var ang = n === 1 ? 0 : (i / n) * Math.PI * 2 - Math.PI / 2, rr = n === 1 ? 0 : s * 0.2;
          var ix = x + Math.cos(ang) * rr, iy = y + Math.sin(ang) * rr * 0.8;
          if (it.v.charAt(i) === 'b') drawBanana(c, ix, iy, s * 0.5); else emoji(c, ING[it.v.charAt(i)].e, ix, iy, s * 0.42);
        }
      }
    } else if (it.v.charAt(0) === '#') {
      emoji(c, DRINKE[it.v] || '🥤', x, y, s * 0.85);
    } else if (it.m) {
      var m = it.v.length;
      for (var j = 0; j < m; j++) emoji(c, ING[it.v.charAt(j)].e, x + (j - (m - 1) / 2) * s * 0.36, y, s * 0.46);
    } else if (it.v === 'b') drawBanana(c, x, y, s * 0.9);
    else {
      emoji(c, (ING[it.v] || { e: '❓' }).e, x, y, s * 0.78);
      if (it.v === 'z') { c.globalAlpha = 0.5 + 0.3 * Math.sin(now / 200); emoji(c, '💨', x + s * 0.2, y - s * 0.45, s * 0.4); c.globalAlpha = 1; }
    }
    if (it.s) { var tw = 0.6 + 0.4 * Math.sin(now / 150); c.globalAlpha = tw; emoji(c, '✨', x - s * 0.45, y - s * 0.4, s * 0.42); c.globalAlpha = 1; }
    if (it.g) {
      c.strokeStyle = 'rgba(255,90,106,' + (0.6 + 0.4 * Math.sin(now / 120)) + ')'; c.lineWidth = 3;
      c.beginPath(); c.arc(x, y, s * 0.62, 0, 7); c.stroke();
      emoji(c, '⚠️', x + s * 0.45, y - s * 0.42, s * 0.42);
    }
  }
  function drawChef(c, x, y, f, who, name, isMe, h, wk, now) {
    var col = COL[who];
    c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(x, y + 15, 17, 7, 0, 0, 7); c.fill();
    if (isMe) { c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 2.5; c.setLineDash([5, 4]); c.beginPath(); c.ellipse(x, y + 12, 22, 10, 0, 0, 7); c.stroke(); c.setLineDash([]); }
    var bob = wk ? Math.sin(now / 60) * 1.5 : 0;
    var hx = x + DX[f] * 17, hy = y + DY[f] * 13 + 2;
    if (h && f === 3) drawItem(c, h, hx, hy - 6, 24, now);
    var g = c.createRadialGradient(x - 6, y - 6 + bob, 2, x, y + bob, 18); g.addColorStop(0, '#fff'); g.addColorStop(0.25, col); g.addColorStop(1, who === 'host' ? '#c2335f' : '#2b8bc4');
    c.save(); c.shadowColor = col; c.shadowBlur = 14; c.fillStyle = g; c.beginPath(); c.arc(x, y + bob, 17, 0, 7); c.fill(); c.restore();
    /* apron */
    c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.arc(x, y + 4 + bob, 10, 0.1 * Math.PI, 0.9 * Math.PI); c.fill();
    /* eyes look where we face */
    var ex = DX[f] * 4, ey = DY[f] * 3;
    c.fillStyle = '#fff'; c.beginPath(); c.arc(x - 6 + ex, y - 3 + ey + bob, 4.2, 0, 7); c.arc(x + 6 + ex, y - 3 + ey + bob, 4.2, 0, 7); c.fill();
    c.fillStyle = '#1a1033'; c.beginPath(); c.arc(x - 6 + ex * 1.4, y - 3 + ey * 1.4 + bob, 2.2, 0, 7); c.arc(x + 6 + ex * 1.4, y - 3 + ey * 1.4 + bob, 2.2, 0, 7); c.fill();
    if (who === 'host') { c.fillStyle = 'rgba(255,120,160,.7)'; c.beginPath(); c.arc(x - 11, y + 3 + bob, 3, 0, 7); c.arc(x + 11, y + 3 + bob, 3, 0, 7); c.fill(); }
    /* chef hat */
    var hy0 = y - 17 + bob;
    c.fillStyle = '#fff'; c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 1;
    rrect(c, x - 10, hy0 - 4, 20, 8, 3, '#fff');
    rrect(c, x - 10, hy0 - 1, 20, 3, 1, col);
    c.fillStyle = '#fff';
    c.beginPath(); c.arc(x - 8, hy0 - 9, 7, 0, 7); c.arc(x + 8, hy0 - 9, 7, 0, 7); c.arc(x, hy0 - 13, 8.5, 0, 7); c.fill(); c.stroke();
    if (h && f !== 3) drawItem(c, h, hx, hy, 24, now);
    if (wk) { c.globalAlpha = 0.8; emoji(c, '💫', hx + 10, hy - 14 + Math.sin(now / 80) * 3, 13); c.globalAlpha = 1; }
    otext(c, name, x, y - 46, 12, '#fff');
  }
  function drawTile(c, id, t, th, S, now) {
    var x = OX + tc(id) * TS, y = OY + tr(id) * TS;
    rrect(c, x + 1, y + 3, TS - 2, TS - 2, 9, th.ce);
    rrect(c, x + 1, y + 1, TS - 2, TS - 5, 9, th.cb);
    rrect(c, x + 3, y + 2, TS - 6, TS - 10, 7, th.ct);
    var v = STV[t];
    if (!v) return;
    var cx = x + TS / 2, cy = y + TS / 2 - 3;
    var isCrate = CRATES.indexOf(t) >= 0;
    if (isCrate) {
      rrect(c, x + 5, y + 4, TS - 10, TS - 14, 6, v[2]);
      c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(x + 7, y + 6, TS - 14, 4);
      emoji(c, v[0], cx, cy - 2, 22);
      text(c, v[1], cx, y + TS - 9, v[1].length > 7 ? 7 : 8, t === 'X' ? '#ffeaea' : '#fff', 'center', 800);
      if (t === 'X') { c.strokeStyle = '#ff2d45'; c.lineWidth = 2; c.setLineDash([4, 3]); c.strokeRect(x + 4, y + 3, TS - 8, TS - 12); c.setLineDash([]); }
      return;
    }
    if (t === 'V') {
      var pulse = 0.5 + 0.5 * Math.sin(now / 300);
      rrect(c, x + 4, y + 3, TS - 8, TS - 12, 7, 'rgba(255,209,102,' + (0.55 + 0.35 * pulse) + ')');
      emoji(c, v[0], cx, cy - 2, 22); text(c, 'SERVE', cx, y + TS - 9, 8, '#3a2400');
      return;
    }
    if (t === 'L') { var gl = c.createRadialGradient(cx, cy, 2, cx, cy, 20); gl.addColorStop(0, 'rgba(255,120,40,.9)'); gl.addColorStop(1, 'rgba(90,30,20,.9)'); rrect(c, x + 4, y + 3, TS - 8, TS - 12, 8, gl); }
    else if (t === 'K') { rrect(c, x + 6, y + 6, TS - 12, TS - 16, 5, '#c9935a', '#8a5a2b'); }
    else if (t === 'E') { rrect(c, x + 4, y + 3, TS - 8, TS - 12, 8, 'rgba(255,141,176,.75)'); }
    else if (t !== '#') rrect(c, x + 5, y + 4, TS - 10, TS - 14, 7, v[2]);
    var occupied = !!S.it[id];
    if (occupied) { c.globalAlpha = 0.55; emoji(c, v[0], x + 10, y + 10, 11); c.globalAlpha = 1; }
    else { emoji(c, v[0], cx, cy - 2, t === 'D' ? 24 : 21); }
    if (!occupied || t !== '#') text(c, v[1], cx, y + TS - 9, 7.5, t === 'D' || t === 'Q' || t === 'V' ? '#2a2033' : '#fff');
  }
  function drawBackdrop(c, S, th, now) {
    var g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, th.bg0); g.addColorStop(1, th.bg1);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    var i;
    if (S.lv === 0) {
      for (i = 0; i < 70; i++) { var a = 0.3 + 0.7 * Math.abs(Math.sin(now / 900 + i)); c.fillStyle = 'rgba(255,255,255,' + a * 0.8 + ')'; c.fillRect(hash(i) * W, hash(i + 99) * H, 1.6, 1.6); }
      c.globalAlpha = 0.6; emoji(c, '🪐', 760, 470, 34); emoji(c, '🛸', 30 + ((now / 40) % 900) - 50, 30, 18); c.globalAlpha = 1;
    } else if (S.lv === 1) {
      for (i = 0; i < 26; i++) { var on = Math.floor(now / 250 + i) % 2; c.fillStyle = on ? '#ffe9a8' : '#a8772a'; c.beginPath(); c.arc(14 + i * 30.5, 6, 3, 0, 7); c.fill(); }
      c.globalAlpha = 0.18; c.fillStyle = '#ffd166'; c.beginPath(); c.moveTo(0, 0); c.lineTo(160, 0); c.lineTo(300, H); c.lineTo(120, H); c.fill();
      c.beginPath(); c.moveTo(W, 0); c.lineTo(W - 160, 0); c.lineTo(W - 300, H); c.lineTo(W - 120, H); c.fill(); c.globalAlpha = 1;
    } else {
      for (i = 0; i < 60; i++) { c.fillStyle = ['#ff5c8a', '#58c7ff', '#ffd166', '#ffffff', '#4ade80'][i % 5]; c.globalAlpha = 0.5; c.beginPath(); c.arc(hash(i) * W, 3 + hash(i + 7) * 8 + Math.abs(Math.sin(now / 200 + i)) * 2, 2.4, 0, 7); c.fill(); }
      c.globalAlpha = 0.12; c.fillStyle = '#fff'; c.beginPath(); c.moveTo(20, 0); c.lineTo(60, 0); c.lineTo(300, H); c.lineTo(180, H); c.fill(); c.beginPath(); c.moveTo(W - 20, 0); c.lineTo(W - 60, 0); c.lineTo(W - 300, H); c.lineTo(W - 180, H); c.fill(); c.globalAlpha = 1;
    }
  }
  function drawPanel(c, S, now) {
    var x = OX + GW * TS + 8, w = W - x - 6;
    rrect(c, x, OY, w, GH * TS, 14, 'rgba(10,8,30,.72)', 'rgba(255,255,255,.12)');
    text(c, '🧾 ORDERS', x + 12, OY + 15, 13, '#fff', 'left');
    text(c, S.cu.length + '/4', x + w - 12, OY + 15, 12, COL.dim, 'right', 700);
    for (var i = 0; i < 4; i++) {
      var y = OY + 30 + i * 106, cu = S.cu[i];
      if (!cu) { rrect(c, x + 6, y, w - 12, 98, 12, 'rgba(255,255,255,.03)', 'rgba(255,255,255,.06)'); continue; }
      var P = PERS[cu.p], fr = Math.max(0, cu.pt / cu.pm), R = REC[cu.r];
      var shake = fr < 0.25 ? Math.sin(now / 40 + i) * 1.6 : 0;
      var cx = x + 6 + shake;
      rrect(c, cx, y, w - 12, 98, 12, fr < 0.25 ? 'rgba(120,20,40,.55)' : 'rgba(255,255,255,.08)', fr < 0.25 ? 'rgba(255,90,106,.7)' : 'rgba(255,255,255,.14)');
      emoji(c, P.e, cx + 20, y + 22, 26);
      var nm = P.n.length > 19 ? P.n.slice(0, 18) + '…' : P.n;
      text(c, nm, cx + 38, y + 14, 11, '#fff', 'left', 800);
      text(c, R.n, cx + 38, y + 29, 10.5, COL.gold, 'left', 700);
      rrect(c, cx + w - 52, y + 6, 34, 34, 10, 'rgba(255,255,255,.12)');
      emoji(c, R.e, cx + w - 35, y + 23, 22);
      /* speech bubble */
      var lines = wrap(c, P.l[cu.l], w - 28, 9.5, 600).slice(0, 3);
      rrect(c, cx + 6, y + 42, w - 24, 38, 8, 'rgba(255,255,255,.92)');
      c.fillStyle = 'rgba(255,255,255,.92)'; c.beginPath(); c.moveTo(cx + 16, y + 42); c.lineTo(cx + 22, y + 36); c.lineTo(cx + 28, y + 42); c.fill();
      lines.forEach(function (ln, j) { text(c, ln, cx + 12, y + 50 + j * 11 + (lines.length < 3 ? 5 : 0) - (lines.length === 1 ? 0 : 0), 9.5, '#2a2040', 'left', 600); });
      var bc = fr > 0.5 ? COL.good : fr > 0.25 ? COL.gold : COL.bad;
      rrect(c, cx + 6, y + 85, w - 24, 8, 4, 'rgba(255,255,255,.12)');
      if (fr > 0) rrect(c, cx + 6, y + 85, Math.max(8, (w - 24) * fr), 8, 4, bc);
    }
  }
  function drawHud(c, S, names) {
    var L = LV[S.lv], th = L.th;
    rrect(c, 8, 8, 270, 42, 21, 'rgba(10,8,30,.7)', 'rgba(255,255,255,.12)');
    emoji(c, L.e, 30, 29, 20);
    text(c, L.n, 48, 29, 15, '#fff', 'left', 800);
    var tl = Math.max(0, Math.ceil(S.tl)), mm = Math.floor(tl / 60), ss = tl % 60;
    rrect(c, 290, 8, 92, 42, 21, tl <= 20 ? 'rgba(255,90,106,.35)' : 'rgba(10,8,30,.7)', 'rgba(255,255,255,.12)');
    text(c, '⏱ ' + mm + ':' + (ss < 10 ? '0' : '') + ss, 336, 29, 17, tl <= 20 ? '#fff' : '#fff');
    rrect(c, 392, 8, 110, 42, 21, 'rgba(10,8,30,.7)', 'rgba(255,209,102,.4)');
    text(c, '🪙 ' + S.co, 447, 29, 18, COL.gold);
    var bx = 516, bw = 270;
    rrect(c, bx, 8, bw, 42, 21, 'rgba(10,8,30,.7)', 'rgba(255,255,255,.12)');
    var fr = Math.max(0, Math.min(1, S.co / (th[2] * 1.08)));
    rrect(c, bx + 14, 25, bw - 28, 10, 5, 'rgba(255,255,255,.12)');
    if (fr > 0) rrect(c, bx + 14, 25, Math.max(10, (bw - 28) * fr), 10, 5, 'rgba(255,209,102,.9)');
    for (var i = 0; i < 3; i++) {
      var sx = bx + 14 + (bw - 28) * th[i] / (th[2] * 1.08);
      c.globalAlpha = S.co >= th[i] ? 1 : 0.45; emoji(c, '⭐', sx, 29, S.co >= th[i] ? 20 : 16); c.globalAlpha = 1;
    }
  }
  function drawGame(c, S, me, info) {
    var now = info.now, th = THEME[S.lv] || THEME[0], i;
    drawBackdrop(c, S, th, now);
    /* floor */
    rrect(c, OX - 4, OY - 4, GW * TS + 8, GH * TS + 8, 16, 'rgba(0,0,0,.45)');
    FLOOR.forEach(function (id) {
      var x = OX + tc(id) * TS, y = OY + tr(id) * TS;
      c.fillStyle = S.lv === 2 ? (tc(id) % 2 ? th.f0 : th.f1) : ((tc(id) + tr(id)) % 2 ? th.f0 : th.f1);
      c.fillRect(x, y, TS, TS);
    });
    if (S.lv === 2) { c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2; c.beginPath(); c.arc(OX + 6 * TS, OY + 4.5 * TS, 60, 0, 7); c.stroke(); c.beginPath(); c.moveTo(OX + 6 * TS, OY + TS); c.lineTo(OX + 6 * TS, OY + 8 * TS); c.stroke(); }
    if (S.lv === 1) { c.strokeStyle = 'rgba(255,209,102,.25)'; c.lineWidth = 2; c.strokeRect(OX + TS + 4, OY + TS + 4, 10 * TS - 8, 7 * TS - 8); }
    for (var r = 0; r < GH; r++) for (var cc = 0; cc < GW; cc++) { var t = T(cc, r); if (t !== '.') drawTile(c, r * GW + cc, t, th, S, now); }
    /* crumbs */
    for (var key in S.cr) {
      var id = +key, x = OX + tc(id) * TS, y = OY + tr(id) * TS;
      c.fillStyle = '#b07a3a';
      for (i = 0; i < 9; i++) { c.beginPath(); c.arc(x + 8 + hash(id * 13 + i) * 32, y + 6 + hash(id * 7 + i) * 28, 1.6 + hash(i + id) * 1.6, 0, 7); c.fill(); }
      emoji(c, '🥖', x + TS - 11, y + 10, 12);
      if (S.cr[key] > 0) ring(c, x + TS / 2, y + TS / 2 - 2, 19, S.cr[key], COL.good);
    }
    /* items + progress */
    for (var k2 in S.it) {
      var id2 = +k2, it = S.it[k2], ix = OX + tc(id2) * TS + TS / 2, iy = OY + tr(id2) * TS + TS / 2 - 4, t2 = T(tc(id2), tr(id2));
      drawItem(c, it, ix, iy, 30, now);
      if (it.c > 0) {
        var col = t2 === 'L' && it.v === 'n' ? (Math.floor(now / 150) % 2 ? COL.bad : '#ff9f43') : t2 === 'E' ? '#ff8db0' : COL.good;
        ring(c, ix, iy + 2, 20, it.c, col);
        if (t2 === 'L' && it.v === 'n' && it.c > 0.4) otext(c, '!', ix + 16, iy - 16, 18, COL.bad);
      }
    }
    /* my target highlight */
    var mine = S.ch[me === 'host' ? 0 : 1], ft = facing(mine);
    if (ft >= 0 && T(tc(ft), tr(ft)) !== '.') {
      c.strokeStyle = me === 'host' ? 'rgba(255,92,138,.95)' : 'rgba(88,199,255,.95)'; c.lineWidth = 3; c.setLineDash([6, 4]);
      c.lineDashOffset = -now / 40; rrect(c, OX + tc(ft) * TS + 2, OY + tr(ft) * TS + 2, TS - 4, TS - 6, 9, null, c.strokeStyle, 3); c.setLineDash([]); c.lineDashOffset = 0;
    }
    /* chefs */
    var order = [0, 1].sort(function (a, b) { return info.disp[a].y - info.disp[b].y; });
    order.forEach(function (k) {
      var ch = S.ch[k], who = k ? 'guest' : 'host';
      drawChef(c, info.disp[k].x, info.disp[k].y, ch.f, who, info.names[who], me === who, ch.h, ch.wk, now);
    });
    /* gremlin */
    if (S.gr) {
      var g = S.gr, bob = Math.sin(now / 120) * 4;
      c.save(); c.shadowColor = '#9cff4a'; c.shadowBlur = 18; emoji(c, '👾', g.x, g.y + bob, 30); c.restore();
      if (g.s === 1) { otext(c, '!!', g.x + 16, g.y - 22, 16, '#c4ff6a'); emoji(c, '💨', g.x - 22, g.y + 6, 16); }
      else emoji(c, '🥖', g.x + 14, g.y + 12 + bob, 12);
    }
    drawPanel(c, S, now);
    drawHud(c, S, info.names);
    /* pop text */
    S.fx.forEach(function (f) {
      var life = f.b ? 2.2 : 1.3, p = 1 - f.t / life, a = Math.min(1, f.t / 0.35);
      c.globalAlpha = Math.max(0, a);
      var sz = f.b ? 22 + (p < 0.15 ? (0.15 - p) * 60 : 0) : 13;
      if (f.a === 'r') { var lines = wrap(c, f.s, 300, 13, 800); lines.forEach(function (ln, j) { otext(c, ln, f.x, f.y - 12 - p * 30 + j * 16, 13, f.c, 'right'); }); }
      else otext(c, f.s, Math.max(110, Math.min(W - 110, f.x)), f.y - p * 34, sz, f.c);
      c.globalAlpha = 1;
    });
    /* rom-com moment */
    if (S.rc > 0) {
      var rp = S.rc / 3;
      c.fillStyle = 'rgba(255,92,138,' + (0.22 * Math.min(1, rp * 3)) + ')'; c.fillRect(0, 0, W, H);
      for (i = 0; i < 26; i++) {
        var hx = hash(i * 3) * W, hy = H - ((now / 9 + hash(i) * H) % (H + 40));
        c.globalAlpha = 0.85; emoji(c, i % 3 ? '💗' : '💞', hx + Math.sin(now / 300 + i) * 12, hy, 16 + hash(i + 5) * 16); c.globalAlpha = 1;
      }
      rrect(c, 60, 196, W - 120, 104, 22, 'rgba(40,6,30,.82)', '#ff8db0', 3);
      otext(c, '💞 ROM-COM MOMENT 💞', W / 2, 228, 30, '#ff8db0');
      otext(c, ROMCOM[S.rcb] || ROMCOM[0], W / 2, 266, 19, '#fff');
      text(c, '(slow-mo + 25 bonus coins)', W / 2, 288, 11, '#ffd1e0', 'center', 600);
    }
  }
  function drawCount(c, S, n, f) {
    c.fillStyle = 'rgba(7,6,20,.62)'; c.fillRect(0, 0, W, H);
    var L = LV[S.lv];
    emoji(c, L.e, W / 2, 120, 54);
    otext(c, L.n, W / 2, 180, 34, '#fff');
    otext(c, L.tag, W / 2, 216, 18, COL.gold);
    otext(c, n > 0 ? String(n) : 'COOK!', W / 2, 310, 90 + 40 * f, n > 0 ? COL.gold : COL.good);
    text(c, 'Move: WASD / arrows · Space: grab / drop / use · Hold E or Shift: chop, blend, spritz, wipe', W / 2, 420, 13, '#fff', 'center', 600);
  }
  function drawResult(c, res, t) {
    c.fillStyle = 'rgba(7,6,20,.72)'; c.fillRect(0, 0, W, H);
    var i;
    if (res.st === 3) {
      for (i = 0; i < 120; i++) {
        var x = hash(i) * W + Math.sin(t * 2 + i) * 20, y = ((hash(i + 50) * H + t * (80 + hash(i + 9) * 120)) % (H + 20)) - 10;
        c.save(); c.translate(x, y); c.rotate(t * 3 + i); c.fillStyle = ['#ff5c8a', '#58c7ff', '#ffd166', '#4ade80', '#9b6bff'][i % 5]; c.fillRect(-4, -2, 8, 4); c.restore();
      }
    }
    otext(c, LV[res.l].e + ' ' + LV[res.l].n, W / 2, 110, 26, '#fff');
    otext(c, res.st === 3 ? 'CHEF\'S KISS! 💋' : res.st === 2 ? 'Lovely service!' : res.st === 1 ? 'We survived!' : 'Chaos in the kitchen 😅', W / 2, 160, 36, COL.gold);
    for (i = 0; i < 3; i++) {
      var appear = Math.max(0, Math.min(1, (t - 0.3 - i * 0.35) * 4)), got = i < res.st;
      var sz = (got ? 70 : 54) * (got ? (appear < 1 ? 0.4 + appear * 0.8 : 1 + 0.04 * Math.sin(t * 4 + i)) : 1);
      c.globalAlpha = got ? appear : 0.25; emoji(c, '⭐', W / 2 + (i - 1) * 100, 260, sz); c.globalAlpha = 1;
    }
    otext(c, '🪙 ' + res.co + ' coins · ' + res.sv + ' served', W / 2, 350, 22, '#fff');
  }

  /* ------------------------------------------------------------------ plugin */
  var CSS = '' +
    '.kt{max-width:980px;margin:0 auto}' +
    '.kt-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;flex-wrap:wrap}' +
    '.kt-title{font-weight:800;font-size:1.45rem;background:linear-gradient(90deg,#ff5c8a,#ffd166,#58c7ff);-webkit-background-clip:text;background-clip:text;color:transparent}' +
    '.kt-pill{background:rgba(255,255,255,.07);border:1px solid var(--line);border-radius:999px;padding:6px 14px;font-weight:700}' +
    '.kt-top .ghost{padding:7px 14px;font-size:.9rem;margin:0}' +
    '.kt-panel{background:linear-gradient(150deg,var(--card2),var(--card));border:1px solid var(--line);border-radius:24px;padding:22px;box-shadow:var(--shadow);text-align:center}' +
    '.kt-panel h2{margin:.2em 0;font-size:2rem}' +
    '.kt-big{font-size:3.6rem;line-height:1;filter:drop-shadow(0 8px 20px rgba(0,0,0,.4))}' +
    '.kt-how{max-width:640px;margin:10px auto;line-height:1.5;color:var(--ink)}' +
    '.kt-lvls{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:16px 0}' +
    '.kt-lvl{background:rgba(255,255,255,.05);color:var(--ink);border:1.5px solid var(--line);border-radius:18px;padding:14px;box-shadow:none;text-align:left}' +
    '.kt-lvl b{display:block;font-size:2rem}.kt-lvl small{display:block;color:var(--dim);font-weight:500;margin-top:4px}' +
    '.kt-lvl.sel{background:rgba(255,209,102,.14);border-color:var(--gold);box-shadow:0 0 0 3px rgba(255,209,102,.25)}' +
    '.kt-lvl:disabled{opacity:.75}.kt-lvl.sel:disabled{opacity:1}' +
    '.kt-ctl{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:10px 0}' +
    '.kt-ctl span{background:rgba(255,209,102,.12);border:1px solid rgba(255,209,102,.35);color:var(--gold);border-radius:12px;padding:7px 12px;font-weight:700;font-size:.92rem}' +
    '.kt-ready{max-width:360px}' +
    '.kt-rdy{display:flex;justify-content:center;gap:12px;margin:12px 0;flex-wrap:wrap}' +
    '.kt-rd{border-radius:999px;padding:8px 16px;font-weight:700;border:1px solid var(--line);background:rgba(255,255,255,.05)}' +
    '.kt-rd.on{background:rgba(74,222,128,.18);border-color:rgba(74,222,128,.6);color:var(--good)}' +
    '.kt-cv{width:100%;display:block;border-radius:22px;border:1px solid var(--line);background:#12102c;box-shadow:var(--shadow),0 0 60px rgba(255,92,138,.12);touch-action:none;user-select:none}' +
    '.kt-book{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px;margin-top:10px}' +
    '.kt-rc{background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:14px;padding:8px 10px;text-align:left;font-size:.85rem;color:var(--dim)}' +
    '.kt-rc b{color:var(--ink);font-size:.95rem}' +
    '.kt-tip{text-align:center;color:var(--dim);margin-top:8px;font-size:.9rem}' +
    '.kt-stats{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:12px 0}' +
    '.kt-stat{background:rgba(255,255,255,.06);border:1px solid var(--line);border-radius:14px;padding:8px 14px;min-width:110px}' +
    '.kt-stat b{display:block;font-size:1.5rem}' +
    '.kt-stars{font-size:2.6rem;letter-spacing:.1em}' +
    '.kt-quote{font-size:1.2rem;font-style:italic;max-width:560px;margin:14px auto;line-height:1.5}' +
    '.kt-quote small{display:block;font-style:normal;color:var(--gold);margin-top:6px;font-weight:700}' +
    '.kt-next{max-width:360px}';

  function esc(s) { return String(s).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); }
  function rngFrom(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function starStr(n, of) { var s = ''; for (var i = 0; i < of; i++) s += i < n ? '⭐' : '☆'; return s; }
  function levelQuote(r) {
    if (r.gl > 0 && r.st < 2) return '"Someone served gluten. The Celiac Queen has filed a formal complaint."';
    if (r.st === 3) return '"Flawless. I would cross a galaxy (or wait at a train station) for this."';
    if (r.st === 2) return '"Fast, cute, crumb-conscious. One more acai bowl and it is love."';
    if (r.st === 1) return '"Some customers stormed off, but the vibes were immaculate."';
    return '"The froyo melted while the chefs were busy making eyes at each other."';
  }
  function critic(totalSt, maxSt, gl, rn) {
    var f = maxSt ? totalSt / maxSt : 0;
    if (f >= 0.99) return ['"Two chefs, one heart, zero crumbs. I wept into my acai bowl. Five galaxies out of five."', 'The Gluten-Free Gazette'];
    if (f >= 0.7) return ['"Charming chaos. The chai was hot, the romance hotter' + (rn ? ' (I counted ' + rn + ' rom-com moments)' : '') + '."', 'Michelin Starship Inspector'];
    if (f >= 0.4) return ['"I came for the froyo, I stayed for the banter. Would book a table for two again."', 'Captain Pick-a-Flavour, Food Log, Stardate Tonight'];
    if (gl > 0) return ['"I found a crumb, a gremlin and true love. Two of those were a problem."', 'Galactic Food Critic Zorg'];
    return ['"The service was slow, but they looked SO cute doing it. Three hearts, one star."', 'Appo the Sky Bison (translated)'];
  }

  registerGame({
    id: 'kitchen', icon: '🍨', name: 'Gluten-Free Galaxy Kitchen',
    blurb: 'Co-op chaos kitchen: cook strictly gluten-free, vegetarian orders for Jedi, Bollywood heroes and gym bros. Chase the Gluten Gremlin!',
    start: function (ctx) {
      var me = ctx.me, isHost = ctx.isHost, partner = me === 'host' ? 'guest' : 'host', names = ctx.names, root = ctx.root;
      var dead = false, ended = false, raf = 0, timers = [];
      var M = { ph: 'lobby', lv: 0, cur: 0, ready: { host: 0, guest: 0 }, res: [], quit: 0, v: 0 };
      var S = null, countLeft = 0, resT = 0;
      var myIn = emptyIn(), myEv = [], gIn = emptyIn(), gEv = [], hEv = [];
      var botMem = { host: {}, guest: {} }, lastSent = '', sendT = 0;
      var disp = [{ x: 0, y: 0 }, { x: 0, y: 0 }], dispInit = false;
      function speed() { var s = window.KITCHEN_SPEED; return (typeof s === 'number' && s > 0) ? Math.min(s, 400) : 1; }
      function bots() { return !!window.KITCHEN_BOTS; }

      var style = document.createElement('style'); style.textContent = CSS;
      root.innerHTML = '<div class="kt"></div>'; root.appendChild(style);
      var box = root.querySelector('.kt');

      /* ---------- networking ---------- */
      function pushMeta() { M.v++; ctx.send({ k: 'm', m: M }); render(); }
      function sendSnap() { ctx.send({ k: 's', j: snap(S), c: countLeft }); }
      function onMsg(d) {
        if (dead || !d) return;
        if (!isHost) {
          if (d.k === 'm' && d.m && d.m.v > M.v) {
            var oldPh = M.ph; M = d.m;
            if (M.ph === 'lobby') S = null;
            if (M.ph === 'result' && oldPh !== 'result') resT = 0;
            render();
            if (M.ph === 'final') endAll();
          } else if (d.k === 's' && typeof d.j === 'string' && (M.ph === 'play' || M.ph === 'count' || M.ph === 'result')) {
            try { S = JSON.parse(d.j); } catch (e) { }
            countLeft = d.c || 0;
          }
          return;
        }
        if (d.k === 'hi') { pushMeta(); if (S) sendSnap(); }
        else if (d.k === 'in') { if (d.i) gIn = d.i; if (d.ev && d.ev.length) gEv = gEv.concat(d.ev.slice(0, 20)); }
        else if (d.k === 'ready') hostReady('guest', d.ph, d.n);
        else if (d.k === 'quit') hostQuit();
      }

      /* ---------- host flow ---------- */
      function hostReady(who, ph, n) {
        if (ph !== M.ph || n !== M.res.length) return;
        if (M.ph !== 'lobby' && M.ph !== 'result') return;
        if (M.ready[who]) return;
        M.ready[who] = 1;
        if (M.ready.host && M.ready.guest) {
          if (M.ph === 'lobby') startLevel(M.lv);
          else if (M.cur + 1 < LV.length && !M.quit) startLevel(M.cur + 1);
          else { M.ph = 'final'; M.ready = { host: 0, guest: 0 }; pushMeta(); endAll(); }
        } else pushMeta();
      }
      function startLevel(l) {
        S = newLevel(l, rr); M.cur = l; M.ph = 'count'; countLeft = 3; M.ready = { host: 0, guest: 0 };
        gIn = emptyIn(); gEv = []; hEv = []; botMem = { host: {}, guest: {} }; dispInit = false;
        pushMeta(); sendSnap();
      }
      function finishLevel() {
        var r = { l: S.lv, co: S.co, sv: S.sv, an: S.an, gl: S.gl, st: S.st, rn: S.rn, cs: S.cs, sc: S.sc };
        M.res.push(r); M.ph = 'result'; M.ready = { host: 0, guest: 0 }; resT = 0;
        sendSnap(); pushMeta();
      }
      function hostQuit() {
        if (M.ph === 'final') return;
        M.quit = 1; M.ph = 'final'; M.ready = { host: 0, guest: 0 }; pushMeta(); endAll();
      }
      var rr = rngFrom(ctx.seed * 13 + 5), simT = 0;
      function hostTick(dt) {
        if (M.ph === 'count') {
          countLeft -= dt;
          if (countLeft <= 0) { countLeft = 0; M.ph = 'play'; hEv = []; gEv = []; pushMeta(); }
          return;
        }
        if (M.ph !== 'play' || !S) return;
        var evH = hEv; hEv = []; var evG = gEv; gEv = [];
        var inH = myIn, inG = gIn;
        if (bots()) {
          var bh = safeBot(S, 'host'); inH = bh.in; evH = bh.ev;
          if (speed() > 4) { var bg = safeBot(S, 'guest'); inG = bg.in; evG = bg.ev; }
        }
        try { step(S, dt, { host: inH, guest: inG }, { host: evH, guest: evG }, rr); }
        catch (e) { console.error('[kitchen] step error', e); S.done = 1; S.st = stars(S); }
        if (S.done) finishLevel();
      }
      function safeBot(st, who) {
        try { var b = botInput(st, who, botMem[who]); return { in: b.in || emptyIn(), ev: b.ev || [] }; }
        catch (e) { return { in: emptyIn(), ev: [] }; }
      }
      function endAll() {
        if (ended) return; ended = true;
        var tot = 0, co = 0, gl = 0, rn = 0, sv = 0;
        M.res.forEach(function (r) { tot += r.st; co += r.co; gl += r.gl; rn += r.rn; sv += r.sv; });
        var maxSt = M.res.length * 3, q = critic(tot, maxSt, gl, rn);
        ctx.end('Your kitchen review: ' + (maxSt ? starStr(tot, maxSt) : 'closed early'),
          q[0] + ' - ' + q[1] + ' | ' + sv + ' orders, ' + co + ' coins' + (rn ? ', ' + rn + ' rom-com moments 💞' : '') + (gl ? ', ' + gl + ' gluten incidents 🥖' : ', zero gluten served ✅'));
      }

      /* ---------- client actions ---------- */
      function sendReady() {
        if (M.ready[me]) return;
        if (isHost) hostReady('host', M.ph, M.res.length);
        else { M.ready[me] = 1; render(true); ctx.send({ k: 'ready', ph: M.ph, n: M.res.length }); }
      }
      function quit() { if (isHost) hostQuit(); else ctx.send({ k: 'quit' }); }

      /* ---------- main loop ---------- */
      var lastT = performance.now(), realB = 0;
      var loopId = setInterval(function () {
        if (dead) return;
        var now = performance.now(), real = Math.min(0.1, (now - lastT) / 1000), dt = real * speed(); lastT = now;
        if (M.ph === 'result') resT += real;
        if (isHost) {
          simT += dt; var n = 0;
          while (simT >= 1 / 30 && n < 1500) { simT -= 1 / 30; n++; hostTick(1 / 30); }
          if (n >= 1500) simT = 0;
          realB += real;
          if (realB >= 0.05 && S && (M.ph === 'play' || M.ph === 'count')) { realB = 0; sendSnap(); }
        } else if (M.ph === 'play' && S) {
          if (bots() && speed() <= 4) { var b = safeBot(S, 'guest'); myIn = b.in; myEv = myEv.concat(b.ev); }
          sendT += real;
          var js = JSON.stringify(myIn);
          if (myEv.length || (js !== lastSent && sendT > 0.03) || sendT > 0.5) { ctx.send({ k: 'in', i: myIn, ev: myEv }); myEv = []; lastSent = js; sendT = 0; }
        }
      }, 1000 / 60);
      timers.push(loopId);

      /* ---------- input ---------- */
      var KEYS = { arrowup: 'u', w: 'u', arrowdown: 'd', s: 'd', arrowleft: 'l', a: 'l', arrowright: 'r', d: 'r' };
      function active() { return !dead && (M.ph === 'play' || M.ph === 'count') && root.isConnected; }
      function onKey(e, down) {
        if (!active() || bots()) return;
        if (e.target && /input|textarea/i.test(e.target.tagName)) return;
        var k = (e.key || '').toLowerCase();
        if (KEYS[k]) { myIn[KEYS[k]] = down ? 1 : 0; e.preventDefault(); }
        if (k === ' ' || k === 'enter' || k === 'spacebar') { e.preventDefault(); if (down && !e.repeat && M.ph === 'play') { if (isHost) hEv.push({ t: 'a' }); else myEv.push({ t: 'a' }); } }
        if (k === 'e' || k === 'shift') { myIn.b = down ? 1 : 0; e.preventDefault(); }
      }
      function kd(e) { onKey(e, true); }
      function ku(e) { onKey(e, false); }
      function blur() { myIn = emptyIn(); }
      window.addEventListener('keydown', kd); window.addEventListener('keyup', ku); window.addEventListener('blur', blur);

      /* ---------- rendering ---------- */
      var cv = null, c2 = null, lastFrame = performance.now();
      function frame() {
        if (dead) return;
        raf = requestAnimationFrame(frame);
        var now = performance.now(), fdt = Math.min(0.1, (now - lastFrame) / 1000); lastFrame = now;
        if (!cv || !c2 || !S) return;
        for (var k = 0; k < 2; k++) {
          var ch = S.ch[k];
          if (!dispInit || isHost) { disp[k].x = ch.x; disp[k].y = ch.y; }
          else { var a = Math.min(1, fdt * 18); disp[k].x += (ch.x - disp[k].x) * a; disp[k].y += (ch.y - disp[k].y) * a; if (Math.abs(ch.x - disp[k].x) > 80 || Math.abs(ch.y - disp[k].y) > 80) { disp[k].x = ch.x; disp[k].y = ch.y; } }
        }
        dispInit = true;
        c2.save();
        try {
          drawGame(c2, S, me, { now: now, names: names, disp: disp });
          if (M.ph === 'count') drawCount(c2, S, Math.ceil(countLeft), countLeft - Math.floor(countLeft));
          if (M.ph === 'result' && M.res.length) drawResult(c2, M.res[M.res.length - 1], resT);
        } catch (e) { c2.fillStyle = '#12102c'; c2.fillRect(0, 0, W, H); text(c2, 'Render error: ' + e.message, W / 2, H / 2, 16); }
        c2.restore();
      }
      raf = requestAnimationFrame(frame);

      function readyRow() {
        return '<div class="kt-rdy"><span class="kt-rd' + (M.ready.host ? ' on' : '') + '">' + (M.ready.host ? '✅ ' : '⏳ ') + esc(names.host) + '</span>' +
          '<span class="kt-rd' + (M.ready.guest ? ' on' : '') + '">' + (M.ready.guest ? '✅ ' : '⏳ ') + esc(names.guest) + '</span></div>';
      }
      function totalCoins() { var t = 0; M.res.forEach(function (r) { t += r.co; }); return t; }
      function book(l) {
        return '<div class="kt-book">' + LV[l].rec.map(function (r) { return '<div class="kt-rc"><b>' + REC[r].e + ' ' + esc(REC[r].n) + '</b><br>' + esc(REC[r].d) + '</div>'; }).join('') +
          '<div class="kt-rc"><b>👾 Gluten Gremlin</b><br>Run into it to shoo it. Its 🥖 crumbs contaminate anything put down there: grab the 🧽 and hold E to wipe.</div>' +
          '<div class="kt-rc"><b>💞 Rom-Com Moment</b><br>Hand each other dishes over a counter (both ways) or serve at the same time. Bonus coins!</div>' +
          '<div class="kt-rc"><b>💐 Signature Scent</b><br>Put a finished dish on the scent station, hold E to spritz: +10 tip.</div></div>';
      }
      var lastKey = '';
      function render(force) {
        if (dead) return;
        var key = M.ph + '|' + M.cur + '|' + M.v;
        if (!force && key === lastKey) return;
        lastKey = key;
        var lvlPill = M.ph !== 'lobby' && M.ph !== 'final' ? '<span class="kt-pill">' + LV[M.cur].e + ' Level ' + (M.cur + 1) + ' / ' + LV.length + '</span>' : '';
        var h = '<div class="kt-top"><span class="kt-title">🍨 Gluten-Free Galaxy Kitchen</span>' + lvlPill +
          '<span class="kt-pill">🪙 ' + (totalCoins() + (S && (M.ph === 'play' || M.ph === 'count') ? 0 : 0)) + ' banked</span>' +
          (M.ph !== 'final' ? '<button class="ghost kt-quit">Close kitchen</button>' : '') + '</div>';
        if (M.ph === 'lobby') {
          h += '<div class="kt-panel"><div class="kt-big">👩‍🍳🍨👨‍🍳</div><h2>Welcome to the kitchen!</h2>' +
            '<p class="kt-how">Cook <b>vegetarian, strictly gluten-free</b> orders for a galaxy of very dramatic customers before their patience runs out. ' +
            'Grab ingredients from crates, chop, grill, blend and brew, then ring the 🛎️ to serve. ' +
            'Beware the <b>Gluten Gremlin 👾</b>: never serve anything with crumbs or wheat. One mistake and it is "NOT the gluten!!"</p>' +
            '<div class="kt-ctl"><span>Move: WASD / arrows</span><span>Space: grab / drop / use</span><span>Hold E or Shift: chop · blend · spritz · wipe</span></div>' +
            '<div class="kt-lvls">' + LV.map(function (L, i) {
              return '<button class="kt-lvl' + (M.lv === i ? ' sel' : '') + '" data-l="' + i + '"' + (isHost ? '' : ' disabled') + '><b>' + L.e + '</b>' + (i + 1) + '. ' + esc(L.n) +
                '<small>' + esc(L.tag) + (i ? ' Faster customers, sneakier gremlin.' : ' A gentle start.') + '</small></button>';
            }).join('') + '</div>' +
            '<p class="tip">' + (isHost ? 'Pick where to start (you play through to level 3).' : esc(names.host) + ' picks the starting level.') + ' Each level lasts about 3 minutes.</p>' +
            readyRow() + '<button class="big pink kt-ready"' + (M.ready[me] ? ' disabled' : '') + '>' + (M.ready[me] ? 'Waiting for ' + esc(names[partner]) + '…' : 'Ready to cook! 👩‍🍳') + '</button></div>';
        } else if (M.ph === 'count' || M.ph === 'play' || M.ph === 'result') {
          h += '<canvas class="kt-cv" width="' + W + '" height="' + H + '"></canvas>';
          if (M.ph === 'result') {
            var r = M.res[M.res.length - 1], last = M.cur + 1 >= LV.length || M.quit;
            h += '<div class="kt-panel" style="margin-top:14px"><div class="kt-stars">' + starStr(r.st, 3) + '</div>' +
              '<h2>' + esc(LV[r.l].n) + ' complete!</h2><p class="kt-quote">' + esc(levelQuote(r)) + '</p>' +
              '<div class="kt-stats"><div class="kt-stat"><b>🪙 ' + r.co + '</b>coins</div><div class="kt-stat"><b>🍽️ ' + r.sv + '</b>served</div>' +
              '<div class="kt-stat"><b>😤 ' + r.an + '</b>stormed off</div><div class="kt-stat"><b>🥖 ' + r.gl + '</b>gluten oopsies</div>' +
              '<div class="kt-stat"><b>💞 ' + r.rn + '</b>rom-com moments</div><div class="kt-stat"><b>👾 ' + r.cs + '</b>gremlins shooed</div></div>' +
              readyRow() + '<button class="big pink kt-next"' + (M.ready[me] ? ' disabled' : '') + '>' + (M.ready[me] ? 'Waiting for ' + esc(names[partner]) + '…' : (last ? 'See your kitchen review ✨' : 'Next level ➜ ' + LV[M.cur + 1].e)) + '</button></div>';
          } else {
            h += '<p class="kt-tip">🎮 WASD / arrows to move · Space grab/drop/use · hold E or Shift to chop, blend, spritz, wipe · Face a counter to target it (dashed outline)</p>' + book(M.cur);
          }
        } else if (M.ph === 'final') {
          var tot = 0, co = 0, gl = 0, rn = 0, sv = 0;
          M.res.forEach(function (x) { tot += x.st; co += x.co; gl += x.gl; rn += x.rn; sv += x.sv; });
          var q = critic(tot, M.res.length * 3, gl, rn);
          h += '<div class="kt-panel"><div class="kt-big">📰</div><h2>Your kitchen review</h2>' +
            '<div class="kt-stars">' + (M.res.length ? starStr(tot, M.res.length * 3) : 'Closed early') + '</div>' +
            '<p class="kt-quote">' + esc(q[0]) + '<small>— ' + esc(q[1]) + '</small></p>' +
            '<div class="kt-stats"><div class="kt-stat"><b>🪙 ' + co + '</b>coins</div><div class="kt-stat"><b>🍽️ ' + sv + '</b>orders</div><div class="kt-stat"><b>💞 ' + rn + '</b>rom-com moments</div><div class="kt-stat"><b>🥖 ' + gl + '</b>gluten oopsies</div></div>' +
            M.res.map(function (x) { return '<div class="tip">' + LV[x.l].e + ' ' + esc(LV[x.l].n) + ': ' + starStr(x.st, 3) + ' (' + x.co + ' coins)</div>'; }).join('') + '</div>';
        }
        box.innerHTML = h;
        cv = box.querySelector('.kt-cv'); c2 = cv ? cv.getContext('2d') : null;
        if (!cv) myIn = emptyIn();
      }
      box.addEventListener('click', function (e) {
        var t = e.target.closest('button'); if (!t || t.disabled) return;
        if (t.classList.contains('kt-ready') || t.classList.contains('kt-next')) { sendReady(); return; }
        if (t.classList.contains('kt-quit')) { quit(); return; }
        if (t.classList.contains('kt-lvl') && isHost && M.ph === 'lobby') { var l = +t.getAttribute('data-l'); if (l >= 0 && l < LV.length) { M.lv = l; M.ready = { host: 0, guest: 0 }; pushMeta(); } }
      });

      if (isHost) pushMeta(); else { render(); ctx.send({ k: 'hi' }); }

      return {
        onMsg: onMsg,
        destroy: function () {
          dead = true; timers.forEach(clearInterval); cancelAnimationFrame(raf);
          window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); window.removeEventListener('blur', blur);
          root.innerHTML = '';
        },
        _t: { M: function () { return M; }, S: function () { return S; } }
      };
    }
  });
})();
