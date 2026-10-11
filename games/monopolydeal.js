/* Monopoly Deal (2 players) - plugin for Duo Games.
 *
 * ARCHITECTURE
 *  - MonopolyDealRules is a pure, DOM-free rules engine (testable in node).
 *  - The shuffled deck is identical on both clients (ctx.shuffle), so BOTH clients keep the FULL game state G
 *    (including both hands; the UI just hides the opponent's hand - trusted clients, friendly game).
 *  - Every move is a small message m = {k:...}. The acting client runs reduce(G,m,me); if it is legal it
 *    sends {md:m} to the partner, who runs the same reducer with by=opp. Same state + same message = same result.
 *  - Responses (Just Say No / accept / pay) are messages too; G.pend holds the one pending action and says who
 *    has to answer (pend.resp). Nobody can act out of turn because the reducer checks turn/pend/resp.
 *
 * DECK (106 cards)
 *  Money 20: 1M x6, 2M x5, 3M x3, 4M x3, 5M x2, 10M x1
 *  Properties 28: brown 2, light blue 3, pink 3, orange 3, red 3, yellow 3, green 3, dark blue 2, railroad 4, utility 2
 *  Property wilds 11: dkblue/green, ltblue/brown, green/rail, util/rail, ltblue/rail, pink/orange x2, red/yellow x2, rainbow x2
 *  Actions 34: Deal Breaker 2, Just Say No 3, Sly Deal 3, Forced Deal 3, Debt Collector 3, It's My Birthday 3,
 *              Pass Go 10, Double the Rent 2, House 3, Hotel 2
 *  Rent 13: colour-pair rent x2 for each of 5 pairs (10), wild rent x3
 *
 * SIMPLIFICATIONS: a set made only of rainbow wilds is not complete; when a set stops being complete its
 * House/Hotel drops into its owner's bank; received properties auto-join an incomplete set of their colour (or
 * start a new one) and wilds can be moved afterwards; Deal Breaker / Sly / Forced cannot touch wilds' houses
 * separately; 3 complete sets must be of 3 different colours.
 */
var MonopolyDealRules = (function () {
  'use strict';
  var COL = {
    brown: { n: 'Brown', size: 2, rent: [1, 2], css: '#8b5a2b', v: 1, house: true },
    lblue: { n: 'Light Blue', size: 3, rent: [1, 2, 3], css: '#8fd3f4', v: 1, house: true },
    pink: { n: 'Pink', size: 3, rent: [1, 2, 4], css: '#ff7eb6', v: 2, house: true },
    orange: { n: 'Orange', size: 3, rent: [1, 3, 5], css: '#ff9f1c', v: 2, house: true },
    red: { n: 'Red', size: 3, rent: [2, 3, 6], css: '#e63946', v: 3, house: true },
    yellow: { n: 'Yellow', size: 3, rent: [2, 4, 6], css: '#ffd93d', v: 3, house: true },
    green: { n: 'Green', size: 3, rent: [2, 4, 7], css: '#2e9e4f', v: 4, house: true },
    dblue: { n: 'Dark Blue', size: 2, rent: [3, 8], css: '#2b4fb8', v: 4, house: true },
    rail: { n: 'Railroad', size: 4, rent: [1, 2, 3, 4], css: '#444', v: 2, house: false },
    util: { n: 'Utility', size: 2, rent: [1, 2], css: '#bdbdbd', v: 2, house: false }
  };
  var COLKEYS = Object.keys(COL);
  var PNAMES = {
    brown: ['Mediterranean Ave', 'Baltic Ave'], lblue: ['Oriental Ave', 'Vermont Ave', 'Connecticut Ave'],
    pink: ['St. Charles Pl', 'States Ave', 'Virginia Ave'], orange: ['St. James Pl', 'Tennessee Ave', 'New York Ave'],
    red: ['Kentucky Ave', 'Indiana Ave', 'Illinois Ave'], yellow: ['Atlantic Ave', 'Ventnor Ave', 'Marvin Gdns'],
    green: ['Pacific Ave', 'N. Carolina Ave', 'Penn. Ave'], dblue: ['Park Place', 'Boardwalk'],
    rail: ['Reading RR', 'Penn. RR', 'B&O RR', 'Short Line'], util: ['Electric Co.', 'Water Works']
  };
  var ACT = {
    breaker: { n: 'Deal Breaker', v: 5, cnt: 2 }, jsn: { n: 'Just Say No', v: 4, cnt: 3 },
    sly: { n: 'Sly Deal', v: 3, cnt: 3 }, forced: { n: 'Forced Deal', v: 3, cnt: 3 },
    debt: { n: 'Debt Collector', v: 3, cnt: 3 }, birthday: { n: "It's My Birthday", v: 2, cnt: 3 },
    passgo: { n: 'Pass Go', v: 1, cnt: 10 }, dtr: { n: 'Double the Rent', v: 1, cnt: 2 },
    house: { n: 'House', v: 3, cnt: 3 }, hotel: { n: 'Hotel', v: 4, cnt: 2 }
  };

  var CARDS = [];
  function add(o) { o.id = CARDS.length; CARDS.push(o); }
  (function build() {
    [[1, 6], [2, 5], [3, 3], [4, 3], [5, 2], [10, 1]].forEach(function (p) {
      for (var i = 0; i < p[1]; i++) add({ t: 'money', v: p[0], n: p[0] + 'M' });
    });
    COLKEYS.forEach(function (c) { PNAMES[c].forEach(function (n) { add({ t: 'prop', col: c, n: n, v: COL[c].v }); }); });
    [['dblue', 'green', 4], ['lblue', 'brown', 4], ['green', 'rail', 4], ['util', 'rail', 2], ['lblue', 'rail', 4],
      ['pink', 'orange', 2], ['pink', 'orange', 2], ['red', 'yellow', 3], ['red', 'yellow', 3]].forEach(function (w) {
      add({ t: 'wild', cols: [w[0], w[1]], v: w[2], n: 'Wild ' + COL[w[0]].n + '/' + COL[w[1]].n });
    });
    add({ t: 'wild', cols: null, v: 0, n: 'Rainbow Wild' }); add({ t: 'wild', cols: null, v: 0, n: 'Rainbow Wild' });
    Object.keys(ACT).forEach(function (a) { for (var i = 0; i < ACT[a].cnt; i++) add({ t: 'act', a: a, v: ACT[a].v, n: ACT[a].n }); });
    [['brown', 'lblue'], ['pink', 'orange'], ['red', 'yellow'], ['green', 'dblue'], ['rail', 'util']].forEach(function (p) {
      for (var i = 0; i < 2; i++) add({ t: 'rent', cols: p, v: 1, n: 'Rent ' + COL[p[0]].n + '/' + COL[p[1]].n });
    });
    for (var i = 0; i < 3; i++) add({ t: 'rent', cols: null, v: 3, n: 'Wild Rent' });
  })();

  function other(p) { return p === 'host' ? 'guest' : 'host'; }
  function has(a, c) { return a.indexOf(c) >= 0; }
  function cardCols(c) { var d = CARDS[c]; if (d.t === 'prop') return [d.col]; if (d.t === 'wild') return d.cols || COLKEYS; return []; }
  function isRainbow(c) { return CARDS[c].t === 'wild' && !CARDS[c].cols; }
  function isProp(c) { var t = CARDS[c].t; return t === 'prop' || t === 'wild'; }
  function isAct(c, a) { return CARDS[c].t === 'act' && CARDS[c].a === a; }
  function isComplete(s) {
    return s.props.length >= COL[s.col].size && s.props.some(function (c) { return !isRainbow(c); });
  }
  function setRent(s) {
    var n = Math.min(s.props.length, COL[s.col].size);
    if (!n) return 0;
    var r = COL[s.col].rent[n - 1];
    if (isComplete(s)) { if (s.house) r += 3; if (s.hotel) r += 4; }
    return r;
  }
  function completeColors(G, p) {
    var o = {};
    G.sets[p].forEach(function (s) { if (isComplete(s)) o[s.col] = 1; });
    return Object.keys(o);
  }
  function getSet(G, p, sid) {
    for (var i = 0; i < G.sets[p].length; i++) if (G.sets[p][i].sid === sid) return G.sets[p][i];
    return null;
  }
  // where is card c on p's table? -> {kind:'bank'} | {kind:'prop'|'house'|'hotel', set} | null
  function find(G, p, c) {
    if (has(G.bank[p], c)) return { kind: 'bank' };
    for (var i = 0; i < G.sets[p].length; i++) {
      var s = G.sets[p][i];
      if (has(s.props, c)) return { kind: 'prop', set: s };
      if (s.house === c) return { kind: 'house', set: s };
      if (s.hotel === c) return { kind: 'hotel', set: s };
    }
    return null;
  }
  function assets(G, p) {
    var out = G.bank[p].slice();
    G.sets[p].forEach(function (s) {
      out = out.concat(s.props); if (s.house != null) out.push(s.house); if (s.hotel != null) out.push(s.hotel);
    });
    return out;
  }
  function sumVal(ids) { return ids.reduce(function (a, c) { return a + CARDS[c].v; }, 0); }
  function bankTotal(G, p) { return sumVal(G.bank[p]); }
  // Payment is valid if cards are distinct assets of p worth >= amount, or ALL assets (no change given).
  function validPayment(G, p, sel, amount) {
    if (!Array.isArray(sel)) return false;
    var as = assets(G, p), seen = {};
    for (var i = 0; i < sel.length; i++) {
      if (typeof sel[i] !== 'number' || seen[sel[i]] || !has(as, sel[i])) return false;
      seen[sel[i]] = 1;
    }
    return sumVal(sel) >= amount || sel.length === as.length;
  }
  // property cards in incomplete sets (what Sly/Forced Deal may touch)
  function stealable(G, p) {
    var out = [];
    G.sets[p].forEach(function (s) { if (!isComplete(s)) out = out.concat(s.props); });
    return out;
  }
  function rentSets(G, p, c) {
    var d = CARDS[c];
    return G.sets[p].filter(function (s) { return s.props.length > 0 && (!d.cols || has(d.cols, s.col)); });
  }
  function houseSets(G, p, a) {
    return G.sets[p].filter(function (s) {
      if (!isComplete(s) || !COL[s.col].house) return false;
      return a === 'house' ? s.house == null : (s.house != null && s.hotel == null);
    });
  }

  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function shuffleSeeded(arr, seed) {
    var r = mulberry(seed), a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  function log(G, s) { G.log.push(s); if (G.log.length > 40) G.log.shift(); }
  function nm(G, p) { return G.names[p]; }
  function cn(c) { return CARDS[c].n; }

  function draw(G, p, n) {
    var got = 0;
    for (var i = 0; i < n; i++) {
      if (!G.deck.length) {
        if (!G.disc.length) break;
        G.deck = shuffleSeeded(G.disc, G.seed * 31 + (++G.reshuf)); G.disc = [];
      }
      G.hand[p].push(G.deck.shift()); got++;
    }
    return got;
  }
  function startTurn(G) {
    var p = G.turn; G.plays = 3;
    var n = G.hand[p].length === 0 ? 5 : 2;
    var got = draw(G, p, n);
    log(G, nm(G, p) + ' draws ' + got + '.');
  }
  function newGame(order, names, seed) {
    var G = { deck: order.slice(), disc: [], hand: { host: [], guest: [] }, bank: { host: [], guest: [] },
      sets: { host: [], guest: [] }, turn: 'host', plays: 3, pend: null, winner: null, log: [], nsid: 1,
      reshuf: 0, names: names, seed: seed | 0 };
    for (var i = 0; i < 5; i++) { draw(G, 'host', 1); draw(G, 'guest', 1); }
    log(G, 'Game on! ' + nm(G, 'host') + ' goes first.');
    startTurn(G);
    return G;
  }

  function placeProp(G, p, c, col) {
    var s = null;
    for (var i = 0; i < G.sets[p].length; i++) if (G.sets[p][i].col === col && !isComplete(G.sets[p][i])) { s = G.sets[p][i]; break; }
    if (!s) { s = { sid: G.nsid++, col: col, props: [], house: null, hotel: null }; G.sets[p].push(s); }
    s.props.push(c);
  }
  // remove any card from p's table; houses/hotels of a set that stops being complete fall into p's bank
  function removeFromTable(G, p, c) {
    var f = find(G, p, c); if (!f) return false;
    if (f.kind === 'bank') { G.bank[p].splice(G.bank[p].indexOf(c), 1); return true; }
    var s = f.set;
    if (f.kind === 'hotel') s.hotel = null;
    else if (f.kind === 'house') { s.house = null; if (s.hotel != null) { G.bank[p].push(s.hotel); s.hotel = null; } }
    else {
      s.props.splice(s.props.indexOf(c), 1);
      if (!isComplete(s)) {
        if (s.house != null) { G.bank[p].push(s.house); s.house = null; }
        if (s.hotel != null) { G.bank[p].push(s.hotel); s.hotel = null; }
      }
      if (!s.props.length) G.sets[p].splice(G.sets[p].indexOf(s), 1);
    }
    return true;
  }
  function takeHand(G, p, c) { var i = G.hand[p].indexOf(c); if (i < 0) return false; G.hand[p].splice(i, 1); return true; }
  function discard(G, p, c) { if (takeHand(G, p, c)) { G.disc.push(c); return true; } return false; }

  var PEND_NAME = { sly: 'Sly Deal', forced: 'Forced Deal', breaker: 'Deal Breaker', debt: 'Debt Collector', birthday: "It's My Birthday", rent: 'Rent' };

  // The action was not cancelled: carry it out.
  function execute(G) {
    var P = G.pend, src = P.src, tgt = P.tgt, f;
    if (P.type === 'sly') {
      f = find(G, tgt, P.tc);
      if (f && f.kind === 'prop' && !isComplete(f.set)) {
        var col = f.set.col; removeFromTable(G, tgt, P.tc); placeProp(G, src, P.tc, col);
        log(G, nm(G, src) + ' stole ' + cn(P.tc) + '!');
      }
      G.pend = null;
    } else if (P.type === 'forced') {
      var fa = find(G, src, P.mc), fb = find(G, tgt, P.tc);
      if (fa && fb && fa.kind === 'prop' && fb.kind === 'prop' && !isComplete(fa.set) && !isComplete(fb.set)) {
        var ca = fa.set.col, cb = fb.set.col;
        removeFromTable(G, src, P.mc); removeFromTable(G, tgt, P.tc);
        placeProp(G, tgt, P.mc, ca); placeProp(G, src, P.tc, cb);
        log(G, nm(G, src) + ' swapped ' + cn(P.mc) + ' for ' + cn(P.tc) + '.');
      }
      G.pend = null;
    } else if (P.type === 'breaker') {
      var s = getSet(G, tgt, P.sid);
      if (s && isComplete(s)) {
        G.sets[tgt].splice(G.sets[tgt].indexOf(s), 1); G.sets[src].push(s);
        log(G, nm(G, src) + ' took the complete ' + COL[s.col].n + ' set!');
      }
      G.pend = null;
    } else { // debt / birthday / rent -> payment stage
      if (!assets(G, tgt).length) { log(G, nm(G, tgt) + ' has nothing to pay.'); G.pend = null; }
      else { P.stage = 'pay'; P.resp = tgt; }
    }
  }

  function checkWin(G) {
    [G.turn, other(G.turn)].forEach(function (p) {
      if (!G.winner && completeColors(G, p).length >= 3) G.winner = p;
    });
    if (G.winner) log(G, nm(G, G.winner) + ' has 3 complete sets!');
  }

  function step(G, m, by) {
    if (!m || G.winner) return false;
    var opp = other(by), turnOk = G.turn === by && !G.pend, c = m.c, d, P, s, i;
    var ci = typeof c === 'number' && c >= 0 && c < CARDS.length;
    switch (m.k) {
      case 'bank':
        if (!turnOk || G.plays < 1 || !ci || !has(G.hand[by], c)) return false;
        d = CARDS[c]; if (d.t === 'prop' || d.t === 'wild') return false;
        takeHand(G, by, c); G.bank[by].push(c); G.plays--;
        log(G, nm(G, by) + ' banked ' + (d.t === 'money' ? d.v + 'M' : 'a card (' + d.v + 'M)') + '.');
        return true;
      case 'prop':
        if (!turnOk || G.plays < 1 || !ci || !has(G.hand[by], c) || !isProp(c)) return false;
        if (!has(cardCols(c), m.col)) return false;
        takeHand(G, by, c); placeProp(G, by, c, m.col); G.plays--;
        log(G, nm(G, by) + ' played ' + cn(c) + ' (' + COL[m.col].n + ').');
        return true;
      case 'move': // free: re-assign one of your wild cards on the table
        if (!turnOk || !ci || CARDS[c].t !== 'wild') return false;
        var f = find(G, by, c);
        if (!f || f.kind !== 'prop' || !has(cardCols(c), m.col) || f.set.col === m.col) return false;
        removeFromTable(G, by, c); placeProp(G, by, c, m.col);
        log(G, nm(G, by) + ' moved a wild to ' + COL[m.col].n + '.');
        return true;
      case 'house': case 'hotel':
        if (!turnOk || G.plays < 1 || !ci || !has(G.hand[by], c) || !isAct(c, m.k)) return false;
        s = getSet(G, by, m.sid);
        if (!s || houseSets(G, by, m.k).indexOf(s) < 0) return false;
        takeHand(G, by, c); s[m.k] = c; G.plays--;
        log(G, nm(G, by) + ' built a ' + m.k + ' on ' + COL[s.col].n + '.');
        return true;
      case 'passgo':
        if (!turnOk || G.plays < 1 || !ci || !has(G.hand[by], c) || !isAct(c, 'passgo')) return false;
        discard(G, by, c); G.plays--; draw(G, by, 2);
        log(G, nm(G, by) + ' plays Pass Go (draws 2).');
        return true;
      case 'act': { // targeted / payment actions -> start a pending action
        if (!turnOk || G.plays < 1 || !ci || !has(G.hand[by], c)) return false;
        d = CARDS[c];
        P = { id: G.nsid++, type: null, src: by, tgt: opp, resp: opp, jsn: 0, stage: 'jsn', amount: 0, tc: null, mc: null, sid: null, col: null };
        var used = [c], cost = 1, fa, fb;
        if (d.t === 'act') {
          P.type = d.a;
          if (d.a === 'sly') {
            fb = find(G, opp, m.tc); if (!fb || fb.kind !== 'prop' || isComplete(fb.set)) return false; P.tc = m.tc;
          } else if (d.a === 'forced') {
            fa = find(G, by, m.mc); fb = find(G, opp, m.tc);
            if (!fa || !fb || fa.kind !== 'prop' || fb.kind !== 'prop' || isComplete(fa.set) || isComplete(fb.set)) return false;
            P.mc = m.mc; P.tc = m.tc;
          } else if (d.a === 'breaker') {
            s = getSet(G, opp, m.sid); if (!s || !isComplete(s)) return false; P.sid = m.sid; P.col = s.col;
          } else if (d.a === 'debt') P.amount = 5;
          else if (d.a === 'birthday') P.amount = 2;
          else return false;
        } else if (d.t === 'rent') {
          s = getSet(G, by, m.sid);
          if (!s || rentSets(G, by, c).indexOf(s) < 0) return false;
          var dtr = Array.isArray(m.dtr) ? m.dtr : [];
          if (dtr.length > 2 || G.plays < 1 + dtr.length) return false;
          for (i = 0; i < dtr.length; i++) {
            if (typeof dtr[i] !== 'number' || !has(G.hand[by], dtr[i]) || !isAct(dtr[i], 'dtr') || has(used, dtr[i])) return false;
            used.push(dtr[i]);
          }
          cost = 1 + dtr.length; P.type = 'rent'; P.sid = m.sid; P.col = s.col;
          P.amount = setRent(s) * Math.pow(2, dtr.length);
        } else return false;
        used.forEach(function (u) { discard(G, by, u); });
        G.plays -= cost; G.pend = P;
        log(G, nm(G, by) + ' plays ' + PEND_NAME[P.type] + (P.amount ? ' (' + P.amount + 'M)' : '') + '.');
        return true;
      }
      case 'jsn':
        P = G.pend;
        if (!P || P.stage !== 'jsn' || P.resp !== by || !ci || !has(G.hand[by], c) || !isAct(c, 'jsn')) return false;
        discard(G, by, c); P.jsn++; P.resp = other(by);
        log(G, nm(G, by) + ' plays Just Say No!');
        return true;
      case 'accept':
        P = G.pend;
        if (!P || P.stage !== 'jsn' || P.resp !== by) return false;
        if (P.jsn % 2 === 1) { log(G, PEND_NAME[P.type] + ' was cancelled.'); G.pend = null; }
        else execute(G);
        return true;
      case 'pay':
        P = G.pend;
        if (!P || P.stage !== 'pay' || P.tgt !== by || !validPayment(G, by, m.sel, P.amount)) return false;
        var colOf = {}, sel = m.sel.slice();
        sel.forEach(function (x) { var q = find(G, by, x); if (q && q.kind === 'prop') colOf[x] = q.set.col; });
        var rank = function (x) { return isAct(x, 'hotel') ? 0 : isAct(x, 'house') ? 1 : 2; };
        sel.sort(function (a, b) { return rank(a) - rank(b); });
        sel.forEach(function (x) {
          if (!removeFromTable(G, by, x)) return;
          if (isProp(x)) placeProp(G, P.src, x, colOf[x]); else G.bank[P.src].push(x);
        });
        log(G, nm(G, by) + ' paid ' + sumVal(m.sel) + 'M (' + sel.length + ' card' + (sel.length === 1 ? '' : 's') + ').');
        G.pend = null;
        return true;
      case 'endturn': {
        if (!turnOk) return false;
        var disc = Array.isArray(m.disc) ? m.disc : [], seen = {};
        for (i = 0; i < disc.length; i++) {
          if (typeof disc[i] !== 'number' || seen[disc[i]] || !has(G.hand[by], disc[i])) return false;
          seen[disc[i]] = 1;
        }
        var need = Math.max(0, G.hand[by].length - 7);
        if (disc.length !== need) return false;
        disc.forEach(function (x) { discard(G, by, x); });
        if (need) log(G, nm(G, by) + ' discarded ' + need + '.');
        G.turn = opp; startTurn(G);
        return true;
      }
    }
    return false;
  }
  function reduce(G, m, by) { var ok = step(G, m, by); if (ok) checkWin(G); return ok; }

  return { COL: COL, COLKEYS: COLKEYS, CARDS: CARDS, ACT: ACT, other: other, cardCols: cardCols, isRainbow: isRainbow,
    isProp: isProp, isAct: isAct, isComplete: isComplete, setRent: setRent, completeColors: completeColors, getSet: getSet,
    find: find, assets: assets, sumVal: sumVal, bankTotal: bankTotal, validPayment: validPayment, stealable: stealable,
    rentSets: rentSets, houseSets: houseSets, newGame: newGame, reduce: reduce, draw: draw, shuffleSeeded: shuffleSeeded,
    placeProp: placeProp, PEND_NAME: PEND_NAME };
})();

/* ------------------------------ UI / plugin ------------------------------ */
registerGame({
  id: 'monopolydeal', icon: '🎩', name: 'Monopoly Deal',
  blurb: 'Card battle: collect 3 full property sets. Charge rent, steal, Just Say No!',
  start: function (ctx) {
    var R = MonopolyDealRules, COL = R.COL, CARDS = R.CARDS;
    var me = ctx.me, opp = R.other(me), names = ctx.names;
    var G = R.newGame(ctx.shuffle(CARDS.map(function (c) { return c.id; })), { host: names.host, guest: names.guest }, ctx.seed);
    var ui = null;          // local UI mode: {m:'card'|'sly'|'forced1'|'forced2'|'breaker'|'house'|'rent1'|'rent2'|'move'|'disc', ...}
    var paySel = [], discSel = [], payFor = -1, timers = [], dead = false, ended = false, autoKey = '';

    var CSS = '.md{max-width:860px;margin:0 auto;font-size:14px;color:var(--ink)}' +
      '.md-top{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;font-weight:700;margin-bottom:6px}' +
      '.md-turn{padding:5px 12px;border-radius:14px;background:#2d2d55}.md-turn.mine{background:var(--good);color:#10102a}' +
      '.md-log{font-size:12px;color:var(--dim);background:#14142b;border-radius:10px;padding:6px 10px;margin-bottom:8px;line-height:1.45}' +
      '.md-sec{background:var(--card);border-radius:14px;padding:10px;margin-bottom:8px;border:2px solid #2d2d55}' +
      '.md-sec h4{margin:0 0 6px;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:14px}' +
      '.md-sets{display:flex;flex-wrap:wrap;gap:8px;min-height:26px;margin-bottom:6px}' +
      '.md-set{width:118px;border:2px solid #2d2d55;border-radius:8px;overflow:hidden;background:#10102a;font-size:11px}' +
      '.md-set.done{border-color:var(--gold)}.md-set.pick{border-color:var(--good);box-shadow:0 0 0 2px var(--good);cursor:pointer}' +
      '.md-sh{padding:3px 5px;font-weight:800;color:#fff;text-shadow:0 0 3px #000,0 0 2px #000}' +
      '.md-pc{display:flex;justify-content:space-between;gap:4px;padding:4px 5px;border-top:1px solid #2d2d55;cursor:default}' +
      '.md-pc b{color:var(--gold)}.md-pc.pick{background:#1d4d2a;cursor:pointer}.md-pc.sel{background:#6b5200}.md-pc.mv{cursor:pointer}' +
      '.md-bank{display:flex;flex-wrap:wrap;gap:4px;align-items:center}' +
      '.md-bk{padding:4px 8px;border-radius:7px;background:#3a7d44;font-weight:800;font-size:12px;border:2px solid transparent}' +
      '.md-bk.act{background:#6a4bb8}.md-bk.pick{cursor:pointer;border-color:#fff}.md-bk.sel{border-color:var(--gold);background:#9a7a00}' +
      '.md-low{position:sticky;bottom:0;background:var(--bg);padding:6px 0 4px;z-index:3;border-top:2px solid #2d2d55}' +
      '.md-prompt{background:#23234a;border-radius:12px;padding:8px 10px;margin-bottom:6px;font-weight:600}' +
      '.md-prompt.alert{background:#5a2a3a}.md-prompt p{margin:2px 0 6px}' +
      '.md-prompt button{margin:3px 6px 3px 0;padding:9px 12px;font-size:13px}' +
      '.md-hand{display:flex;flex-wrap:wrap;gap:6px;max-height:34vh;overflow-y:auto;padding:3px}' +
      '.md-mc{position:relative;width:72px;height:98px;border-radius:9px;background:#f4f1e8;color:#111;overflow:hidden;cursor:pointer;flex:none;border:2px solid #000;user-select:none}' +
      '.md-mc i{display:block;height:24px}.md-mc .nm{display:block;font-size:10px;font-weight:800;line-height:1.1;padding:3px 3px 0}' +
      '.md-mc small{display:block;font-size:8px;color:#444;padding:0 3px;line-height:1.1}' +
      '.md-mc b{position:absolute;right:3px;bottom:2px;background:#111;color:#fff;border-radius:8px;padding:0 5px;font-size:11px}' +
      '.md-mc.sel{outline:3px solid var(--gold);transform:translateY(-4px)}.md-mc.off{opacity:.55;cursor:default}' +
      '.md-hint{color:var(--dim);font-size:12px;font-weight:400}';
    var style = document.createElement('style'); style.textContent = CSS; ctx.root.appendChild(style);
    var box = document.createElement('div'); box.className = 'md'; ctx.root.appendChild(box);

    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    var RAINBOW = 'linear-gradient(90deg,#e63946,#ff9f1c,#ffd93d,#2e9e4f,#2b4fb8,#ff7eb6)';
    function bgOf(d) {
      if (d.t === 'prop') return COL[d.col].css;
      if (d.t === 'wild' || d.t === 'rent') {
        if (!d.cols) return RAINBOW;
        return 'linear-gradient(90deg,' + COL[d.cols[0]].css + ' 50%,' + COL[d.cols[1]].css + ' 50%)';
      }
      return d.t === 'money' ? '#3a7d44' : '#6a4bb8';
    }
    function label(d) {
      if (d.t === 'money') return 'Money';
      if (d.t === 'wild') return d.cols ? 'Wild' : 'Rainbow Wild';
      if (d.t === 'rent') return d.cols ? 'Rent' : 'Wild Rent';
      return d.n;
    }
    function sub(d) {
      if (d.t === 'wild' && d.cols) return COL[d.cols[0]].n + ' / ' + COL[d.cols[1]].n;
      if (d.t === 'rent' && d.cols) return COL[d.cols[0]].n + ' / ' + COL[d.cols[1]].n;
      if (d.t === 'rent') return 'any set';
      if (d.t === 'act') return 'Action';
      return '';
    }
    function handCardHtml(c, cls) {
      var d = CARDS[c];
      return '<div class="md-mc' + (cls || '') + '" data-a="hand" data-c="' + c + '"><i style="background:' + bgOf(d) + '"></i><span class="nm">' +
        esc(d.t === 'prop' ? d.n : label(d)) + '</span><small>' + esc(d.t === 'prop' ? COL[d.col].n : sub(d)) + '</small><b>' + d.v + 'M</b></div>';
    }

    // ---- state helpers
    function canPlay() { return !G.winner && G.turn === me && !G.pend; }
    function payMode() { return !!G.pend && G.pend.stage === 'pay' && G.pend.tgt === me; }
    function jsnIn(p) { return G.hand[p].filter(function (c) { return R.isAct(c, 'jsn'); }); }
    function dtrIn(p) { return G.hand[p].filter(function (c) { return R.isAct(c, 'dtr'); }); }
    function cardName(c) { return CARDS[c].n; }

    function act(m) {
      if (dead) return false;
      if (!R.reduce(G, m, me)) return false;
      ctx.send({ md: m });
      afterChange();
      return true;
    }

    function afterChange() {
      // drop UI modes that no longer make sense
      if (ui && ui.m === 'disc') { if (!(canPlay())) ui = null; }
      else if (ui && !canPlay()) ui = null;
      if (G.pend && G.pend.id !== payFor) { paySel = []; payFor = G.pend.id; }
      render();
      if (G.winner && !ended) {
        ended = true;
        var w = G.winner, sets = R.completeColors(G, w).map(function (c) { return COL[c].n; }).join(', ');
        ctx.end(w === me ? 'You win! 🎩' : G.names[w] + ' wins!', (w === me ? 'You' : G.names[w]) + ' completed 3 sets: ' + sets + '.');
      }
    }

    // ---- rendering
    function pendDesc(P) {
      var s = G.names[P.src];
      switch (P.type) {
        case 'sly': return s + ' plays Sly Deal to steal your ' + esc(cardName(P.tc)) + '.';
        case 'forced': return s + ' plays Forced Deal: your ' + esc(cardName(P.tc)) + ' for their ' + esc(cardName(P.mc)) + '.';
        case 'breaker': return s + ' plays Deal Breaker on your complete ' + COL[P.col].n + ' set!';
        case 'debt': return s + ' plays Debt Collector: you owe 5M.';
        case 'birthday': return s + ': It\'s my birthday! You owe 2M.';
        default: return s + ' charges ' + COL[P.col].n + ' rent: you owe ' + P.amount + 'M.';
      }
    }
    function setHtml(p, s) {
      var comp = R.isComplete(s), pick = false;
      if (ui && p === me && ((ui.m === 'house' && R.houseSets(G, me, ui.a).indexOf(s) >= 0) ||
        (ui.m === 'rent1' && R.rentSets(G, me, ui.c).indexOf(s) >= 0))) pick = true;
      if (ui && p === opp && ui.m === 'breaker' && comp) pick = true;
      var h = '<div class="md-set' + (comp ? ' done' : '') + (pick ? ' pick' : '') + '" data-a="set" data-p="' + p + '" data-sid="' + s.sid + '">' +
        '<div class="md-sh" style="background:' + COL[s.col].css + '">' + COL[s.col].n + ' ' + s.props.length + '/' + COL[s.col].size + (comp ? ' ✓' : '') + ' · ' + R.setRent(s) + 'M</div>';
      var steal = ui && ((ui.m === 'sly' && p === opp) || (ui.m === 'forced2' && p === opp) || (ui.m === 'forced1' && p === me)) && !comp;
      s.props.forEach(function (c) {
        var cls = '', d = CARDS[c];
        if (steal) cls += ' pick';
        if (payMode() && p === me) cls += paySel.indexOf(c) >= 0 ? ' sel pick' : ' pick';
        else if (p === me && canPlay() && d.t === 'wild' && !ui) cls += ' mv';
        if (ui && ui.m === 'move' && ui.c === c) cls += ' sel';
        h += '<div class="md-pc' + cls + '" data-a="tc" data-p="' + p + '" data-c="' + c + '"><span>' + esc(d.t === 'wild' ? (d.cols ? 'Wild ' + COL[d.cols[0]].n + '/' + COL[d.cols[1]].n : 'Rainbow Wild') : d.n) +
          (d.t === 'wild' ? ' ↔' : '') + '</span><b>' + d.v + '</b></div>';
      });
      [['house', '🏠 House'], ['hotel', '🏨 Hotel']].forEach(function (x) {
        var c = s[x[0]]; if (c == null) return;
        var cls = payMode() && p === me ? (paySel.indexOf(c) >= 0 ? ' sel pick' : ' pick') : '';
        h += '<div class="md-pc' + cls + '" data-a="tc" data-p="' + p + '" data-c="' + c + '"><span>' + x[1] + '</span><b>' + CARDS[c].v + '</b></div>';
      });
      return h + '</div>';
    }
    function bankHtml(p) {
      var h = '<div class="md-bank"><span class="md-hint">Bank ' + R.bankTotal(G, p) + 'M:</span>';
      G.bank[p].forEach(function (c) {
        var cls = CARDS[c].t === 'money' ? '' : ' act';
        if (payMode() && p === me) cls += paySel.indexOf(c) >= 0 ? ' sel pick' : ' pick';
        h += '<span class="md-bk' + cls + '" data-a="tc" data-p="' + p + '" data-c="' + c + '">' + CARDS[c].v + 'M</span>';
      });
      return h + '</div>';
    }
    function secHtml(p) {
      var isMe = p === me, n = R.completeColors(G, p).length;
      var h = '<div class="md-sec" style="border-color:' + (G.turn === p ? 'var(--gold)' : '#2d2d55') + '"><h4><span style="color:' + (p === 'host' ? 'var(--host)' : 'var(--guest)') + '">' +
        esc(G.names[p]) + (isMe ? ' (you)' : '') + '</span><span class="md-hint">' + (isMe ? '' : 'Hand: ' + G.hand[p].length + ' cards · ') + 'Complete sets: ' + n + '/3</span></h4>';
      h += '<div class="md-sets">' + (G.sets[p].length ? G.sets[p].map(function (s) { return setHtml(p, s); }).join('') : '<span class="md-hint">No properties yet</span>') + '</div>';
      return h + bankHtml(p) + '</div>';
    }

    function promptHtml() {
      var P = G.pend, h = '', i;
      if (G.winner) return '<div class="md-prompt">Game over.</div>';
      // --- responses owed by me
      if (P && P.stage === 'jsn' && P.resp === me) {
        var n = jsnIn(me).length;
        var head = P.jsn > 0 ? '<b>' + esc(G.names[opp]) + ' played Just Say No!</b> ' : '';
        if (n) return '<div class="md-prompt alert"><p>' + head + esc(pendDesc(P)) + '</p><p>Play Just Say No?</p>' +
          '<button class="ghost" data-a="btn" data-do="jsn">Yes - Just Say No (' + n + ')</button><button data-a="btn" data-do="accept">No' + (P.jsn % 2 ? ' (accept cancel)' : '') + '</button></div>';
        return '<div class="md-prompt alert"><p>' + head + esc(pendDesc(P)) + '</p><button data-a="btn" data-do="accept">OK</button> <span class="md-hint">(no Just Say No in hand)</span></div>';
      }
      if (payMode()) {
        var tot = R.sumVal(paySel), all = R.assets(G, me).length, ok = R.validPayment(G, me, paySel, P.amount);
        return '<div class="md-prompt alert"><p>' + esc(pendDesc(P)) + '</p><p>Pick cards worth at least ' + P.amount + 'M to pay (no change given). Tap your bank and properties above. Selected: <b>' + tot + 'M</b></p>' +
          '<button data-a="btn" data-do="pay"' + (ok ? '' : ' disabled') + '>Pay ' + tot + 'M</button>' +
          '<button class="ghost" data-a="btn" data-do="payall">Select everything (' + all + ')</button></div>';
      }
      if (P) {
        var who = P.stage === 'pay' ? P.tgt : P.resp;
        return '<div class="md-prompt">Waiting for ' + esc(G.names[who]) + (P.stage === 'pay' ? ' to pay ' + P.amount + 'M' : ' to respond') + '...</div>';
      }
      if (G.turn !== me) return '<div class="md-prompt">' + esc(G.names[opp]) + ' is playing...</div>';
      // --- my turn, nothing pending
      if (ui && ui.m === 'disc') {
        var need = G.hand[me].length - 7;
        return '<div class="md-prompt"><p>Discard ' + need + ' card' + (need === 1 ? '' : 's') + ' (tap in your hand): selected ' + discSel.length + '/' + need + '</p>' +
          '<button data-a="btn" data-do="discok"' + (discSel.length === need ? '' : ' disabled') + '>Discard &amp; end turn</button><button class="ghost" data-a="btn" data-do="cancel">Back</button></div>';
      }
      if (ui) {
        var cancel = '<button class="ghost" data-a="btn" data-do="cancel">Cancel</button>';
        var d = ui.c != null ? CARDS[ui.c] : null;
        if (ui.m === 'sly') return '<div class="md-prompt"><p>Sly Deal: tap an opponent property (not from a complete set).</p>' + cancel + '</div>';
        if (ui.m === 'forced1') return '<div class="md-prompt"><p>Forced Deal: first tap one of YOUR properties (not from a complete set) to give.</p>' + cancel + '</div>';
        if (ui.m === 'forced2') return '<div class="md-prompt"><p>Forced Deal: now tap the opponent property you want.</p>' + cancel + '</div>';
        if (ui.m === 'breaker') return '<div class="md-prompt"><p>Deal Breaker: tap an opponent COMPLETE set to take.</p>' + cancel + '</div>';
        if (ui.m === 'house') return '<div class="md-prompt"><p>Tap one of your highlighted complete sets to add the ' + ui.a + '.</p>' + cancel + '</div>';
        if (ui.m === 'rent1') return '<div class="md-prompt"><p>Tap one of your highlighted sets to charge rent for.</p>' + cancel + '</div>';
        if (ui.m === 'rent2') {
          var s = R.getSet(G, me, ui.sid), r = R.setRent(s), dt = dtrIn(me).length, left = G.plays - 1;
          h = '<div class="md-prompt"><p>Rent on ' + COL[s.col].n + ': ' + r + 'M. Double the Rent?</p><button data-a="btn" data-do="rent" data-n="0">Charge ' + r + 'M</button>';
          if (dt >= 1 && left >= 1) h += '<button class="alt" data-a="btn" data-do="rent" data-n="1">Use 1 Double the Rent: ' + r * 2 + 'M</button>';
          if (dt >= 2 && left >= 2) h += '<button class="pink" data-a="btn" data-do="rent" data-n="2">Use 2: ' + r * 4 + 'M</button>';
          return h + cancel + '</div>';
        }
        if (ui.m === 'move') {
          var cols = R.cardCols(ui.c), cur = R.find(G, me, ui.c).set.col;
          h = '<div class="md-prompt"><p>Move ' + esc(d.n) + ' to... (free)</p>';
          cols.forEach(function (c) { if (c !== cur) h += '<button data-a="btn" data-do="move" data-col="' + c + '" style="background:' + COL[c].css + ';color:#fff;text-shadow:0 0 3px #000">' + COL[c].n + '</button>'; });
          return h + cancel + '</div>';
        }
        if (ui.m === 'card' && d) {
          var left2 = G.plays, can = left2 > 0, pl = can ? '' : ' disabled';
          h = '<div class="md-prompt"><p>' + esc(d.n) + (can ? '' : ' (no plays left)') + '</p>';
          if (d.t === 'money') h += '<button data-a="btn" data-do="bank"' + pl + '>Bank ' + d.v + 'M</button>';
          else if (d.t === 'prop') h += '<button data-a="btn" data-do="prop" data-col="' + d.col + '"' + pl + '>Play to my properties</button>';
          else if (d.t === 'wild') R.cardCols(ui.c).forEach(function (c) { h += '<button data-a="btn" data-do="prop" data-col="' + c + '"' + pl + ' style="background:' + COL[c].css + ';color:#fff;text-shadow:0 0 3px #000">As ' + COL[c].n + '</button>'; });
          else {
            var bk = '<button class="alt" data-a="btn" data-do="bank"' + pl + '>Bank as ' + d.v + 'M</button>', a = d.a, playBtn = '';
            var oppSteal = R.stealable(G, opp).length > 0, mySteal = R.stealable(G, me).length > 0;
            if (d.t === 'rent') playBtn = '<button data-a="btn" data-do="rent1"' + (can && R.rentSets(G, me, ui.c).length ? '' : ' disabled') + '>Charge rent</button>';
            else if (a === 'passgo') playBtn = '<button data-a="btn" data-do="passgo"' + pl + '>Pass Go (draw 2)</button>';
            else if (a === 'debt') playBtn = '<button data-a="btn" data-do="plain"' + pl + '>Collect 5M</button>';
            else if (a === 'birthday') playBtn = '<button data-a="btn" data-do="plain"' + pl + '>Birthday! Collect 2M</button>';
            else if (a === 'sly') playBtn = '<button data-a="btn" data-do="sly"' + (can && oppSteal ? '' : ' disabled') + '>Steal a property</button>';
            else if (a === 'forced') playBtn = '<button data-a="btn" data-do="forced"' + (can && oppSteal && mySteal ? '' : ' disabled') + '>Swap properties</button>';
            else if (a === 'breaker') playBtn = '<button data-a="btn" data-do="breaker"' + (can && G.sets[opp].some(R.isComplete) ? '' : ' disabled') + '>Steal a complete set</button>';
            else if (a === 'house' || a === 'hotel') playBtn = '<button data-a="btn" data-do="house"' + (can && R.houseSets(G, me, a).length ? '' : ' disabled') + '>Build ' + a + '</button>';
            else if (a === 'jsn') playBtn = '<span class="md-hint">Reaction card - keep it to cancel an action against you.</span><br>';
            else if (a === 'dtr') playBtn = '<span class="md-hint">Play it together with a Rent card.</span><br>';
            h += playBtn + bk;
          }
          return h + '<button class="ghost" data-a="btn" data-do="cancel">Cancel</button></div>';
        }
      }
      var over = G.hand[me].length > 7;
      return '<div class="md-prompt"><p>Your turn - ' + G.plays + ' play' + (G.plays === 1 ? '' : 's') + ' left. Tap a card in your hand' + (G.sets[me].some(function (s) { return s.props.some(function (c) { return CARDS[c].t === 'wild'; }); }) ? ', or tap a wild (↔) on the table to move it' : '') + '.</p>' +
        '<button class="' + (G.plays ? 'ghost' : '') + '" data-a="btn" data-do="end">' + (over ? 'End turn (discard ' + (G.hand[me].length - 7) + ')' : 'End turn') + '</button></div>';
    }

    function render() {
      if (dead) return;
      var hand = G.hand[me].slice().sort(function (a, b) { return a - b; });
      var pips = ''; for (var i = 0; i < 3; i++) pips += i < G.plays ? '●' : '○';
      var h = '<div class="md-top"><span class="md-turn' + (G.turn === me ? ' mine' : '') + '">' + (G.turn === me ? 'Your turn' : esc(G.names[G.turn]) + "'s turn") +
        ' ' + pips + '</span><span class="md-hint">Deck ' + G.deck.length + ' · Discard ' + G.disc.length + '</span></div>';
      h += '<div class="md-log">' + G.log.slice(-4).map(esc).join('<br>') + '</div>';
      h += secHtml(opp) + secHtml(me);
      h += '<div class="md-low">' + promptHtml() + '<div class="md-hand">';
      hand.forEach(function (c) {
        var cls = '';
        if (ui && ui.c === c && ui.m !== 'disc') cls += ' sel';
        if (ui && ui.m === 'disc' && discSel.indexOf(c) >= 0) cls += ' sel';
        if (!canPlay() && !(ui && ui.m === 'disc')) cls += ' off';
        h += handCardHtml(c, cls);
      });
      h += hand.length ? '' : '<span class="md-hint">Your hand is empty (you will draw 5 next turn).</span>';
      box.innerHTML = h + '</div></div>';
      autoRespond();
    }

    // If I have no Just Say No to answer an action against me, accept automatically after a short pause.
    function autoRespond() {
      var P = G.pend;
      if (!P || P.stage !== 'jsn' || P.resp !== me || jsnIn(me).length) return;
      var key = P.id + ':' + P.jsn;
      if (autoKey === key) return;
      autoKey = key;
      var t = setTimeout(function () {
        var Q = G.pend;
        if (dead || !Q || Q.id !== P.id || Q.jsn !== P.jsn || Q.stage !== 'jsn' || Q.resp !== me) return;
        act({ k: 'accept' });
      }, 900);
      timers.push(t);
    }

    // ---- input
    function onClick(e) {
      var t = e.target.closest('[data-a]');
      if (!t || dead || !box.contains(t)) return;
      var a = t.dataset.a, c = t.dataset.c != null ? +t.dataset.c : null, p = t.dataset.p;
      if (a === 'hand') {
        if (ui && ui.m === 'disc') { var k = discSel.indexOf(c); if (k >= 0) discSel.splice(k, 1); else if (discSel.length < G.hand[me].length - 7) discSel.push(c); render(); }
        else if (canPlay()) { ui = { m: 'card', c: c }; render(); }
        return;
      }
      if (a === 'tc') {
        if (payMode()) {
          if (p === me) { var j = paySel.indexOf(c); if (j >= 0) paySel.splice(j, 1); else paySel.push(c); render(); }
          return;
        }
        if (!canPlay()) return;
        var f = R.find(G, p, c);
        if (!ui) {
          if (p === me && f && f.kind === 'prop' && CARDS[c].t === 'wild') { ui = { m: 'move', c: c }; render(); }
        } else if (ui.m === 'sly' && p === opp && f && f.kind === 'prop' && !R.isComplete(f.set)) {
          act({ k: 'act', c: ui.c, tc: c }); ui = null; render();
        } else if (ui.m === 'forced1' && p === me && f && f.kind === 'prop' && !R.isComplete(f.set)) {
          ui = { m: 'forced2', c: ui.c, mc: c }; render();
        } else if (ui.m === 'forced2' && p === opp && f && f.kind === 'prop' && !R.isComplete(f.set)) {
          act({ k: 'act', c: ui.c, mc: ui.mc, tc: c }); ui = null; render();
        } else if (ui.m === 'move' || ui.m === 'card') {
          if (p === me && f && f.kind === 'prop' && CARDS[c].t === 'wild') { ui = { m: 'move', c: c }; render(); }
        }
        return;
      }
      if (a === 'set') {
        if (!canPlay() || !ui) return;
        var s = R.getSet(G, p, +t.dataset.sid); if (!s) return;
        if (ui.m === 'breaker' && p === opp && R.isComplete(s)) { act({ k: 'act', c: ui.c, sid: s.sid }); ui = null; render(); }
        else if (ui.m === 'house' && p === me && R.houseSets(G, me, ui.a).indexOf(s) >= 0) { act({ k: ui.a, c: ui.c, sid: s.sid }); ui = null; render(); }
        else if (ui.m === 'rent1' && p === me && R.rentSets(G, me, ui.c).indexOf(s) >= 0) {
          if (dtrIn(me).length && G.plays >= 2) { ui = { m: 'rent2', c: ui.c, sid: s.sid }; render(); }
          else { act({ k: 'act', c: ui.c, sid: s.sid, dtr: [] }); ui = null; render(); }
        }
        return;
      }
      if (a === 'btn') {
        var d = t.dataset.do;
        if (t.disabled) return;
        if (d === 'cancel') { ui = null; discSel = []; render(); return; }
        if (d === 'jsn') { var js = jsnIn(me); if (js.length) act({ k: 'jsn', c: js[0] }); return; }
        if (d === 'accept') { act({ k: 'accept' }); return; }
        if (d === 'payall') { paySel = R.assets(G, me); render(); return; }
        if (d === 'pay') { if (payMode() && act({ k: 'pay', sel: paySel.slice() })) paySel = []; return; }
        if (!canPlay()) return;
        if (d === 'end') {
          if (G.hand[me].length > 7) { ui = { m: 'disc' }; discSel = []; render(); }
          else { ui = null; act({ k: 'endturn', disc: [] }); }
          return;
        }
        if (d === 'discok') { act({ k: 'endturn', disc: discSel.slice() }); ui = null; discSel = []; render(); return; }
        if (!ui) return;
        var u = ui;
        if (d === 'bank') { ui = null; act({ k: 'bank', c: u.c }); render(); }
        else if (d === 'prop') { ui = null; act({ k: 'prop', c: u.c, col: t.dataset.col }); render(); }
        else if (d === 'move') { ui = null; act({ k: 'move', c: u.c, col: t.dataset.col }); render(); }
        else if (d === 'passgo') { ui = null; act({ k: 'passgo', c: u.c }); render(); }
        else if (d === 'plain') { ui = null; act({ k: 'act', c: u.c }); render(); }
        else if (d === 'sly') { ui = { m: 'sly', c: u.c }; render(); }
        else if (d === 'forced') { ui = { m: 'forced1', c: u.c }; render(); }
        else if (d === 'breaker') { ui = { m: 'breaker', c: u.c }; render(); }
        else if (d === 'house') { ui = { m: 'house', c: u.c, a: CARDS[u.c].a }; render(); }
        else if (d === 'rent1') { ui = { m: 'rent1', c: u.c }; render(); }
        else if (d === 'rent') {
          var n = +t.dataset.n; ui = null;
          act({ k: 'act', c: u.c, sid: u.sid, dtr: dtrIn(me).slice(0, n) }); render();
        }
      }
    }
    box.addEventListener('click', onClick);

    afterChange();

    return {
      onMsg: function (d) {
        if (dead || !d || !d.md) return;
        if (!R.reduce(G, d.md, opp)) { ctx.toast('Out-of-sync move ignored'); return; }
        afterChange();
      },
      destroy: function () {
        dead = true;
        timers.forEach(clearTimeout); timers = [];
        box.removeEventListener('click', onClick);
        ctx.root.innerHTML = '';
      }
    };
  }
});
