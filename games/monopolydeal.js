/* Monopoly Deal: NO MERCY (Hasbro 2026 edition) - 2-player plugin for Duo Games.
 *
 * ARCHITECTURE
 *  - MonopolyDealRules is a pure, DOM-free rules engine (tested in node with a stub registerGame).
 *  - The shuffled deck is identical on both clients (ctx.shuffle), so BOTH clients keep the FULL game state G
 *    (including both hands; the UI only hides the opponent's hand - trusted clients, friendly game).
 *  - Every move is a small JSON message m = {k:...}. The acting client runs reduce(G,m,me); only if it is legal
 *    is {md:m} sent to the partner, who runs the same reducer with by=opp. Same state + same message = same result.
 *  - Responses (Just Say No / accept / pay / keep) are messages too. G.pend holds the single pending action and
 *    pend.resp says who must answer, so nobody can act out of turn and double taps are rejected by the reducer.
 *
 * BOX: 120 cards = 115 playing cards + 5 reference cards (not used here), plus 15 debt chips (3 per player colour;
 * 2 players use 3 each). Playing cards (counts from the published component list):
 *  Money 18 (assumed split: 1M x5, 2M x4, 3M x3, 4M x3, 5M x2, 10M x1)
 *  Property 28 (brown 2, light blue 3, pink 3, orange 3, red 3, yellow 3, green 3, dark blue 2, railroad 4, utility 2)
 *  Wild property two colours 9 (classic split), wild property any colour 2
 *  Rent 5 (one per colour pair), Double Rent 5 (one per pair), Rent Any Colour 3, Double Rent Any Colour 3
 *  Deal Breaker 3, Forced Debt 3, Go Again 3, Heist 3, Just Say No 5, Market Crash 3, Pass Go Go Go! 4,
 *  Repossession 2, Shack 3, Super Sly Deal 3, Tax Collector 2, Tough Luck 3, Unfair Trade 2, Yoink! 3
 *
 * ASSUMPTIONS (details not stated by the sources; also listed in the in-game "How to play" panel):
 *  - Money split and the bank value of action/rent cards are guesses (Go Again = 1M is confirmed).
 *  - Set sizes and rent ladders are the classic ones. There are no Houses/Hotels; a Shack gives +5M rent to one set
 *    (max one Shack per set, any set incl. railroad/utility, complete or not). If a set loses its last property,
 *    its Shack drops into the owner's bank.
 *  - 2-player versions of multi-player cards: Repossession / Tax Collector send everything to the only other player;
 *    Heist and Market Crash take from the single opponent. Heist needs the opponent to have a bank card,
 *    Repossession needs them to have 2+ properties, Tax Collector 2+ bank cards (so the card does something).
 *  - Tough Luck "Action" includes rent cards. Super Sly Deal takes every opponent set of that colour plus any wild
 *    elsewhere that can be that colour.
 *  - Debt repayment cards are auto-placed for the receiver (money/action -> bank, property -> collection);
 *    a received action is not played for its effect. A player with an empty hand repays later.
 *  - Paying: rainbow (any-colour) wilds cannot be used to pay; Shacks can (3M). If your payable cards are worth
 *    less than the amount, you hand over all of them plus one debt chip (if you have one left).
 *  - Go Again ends your turn at once (discard to 7 first) and you start a new turn (draw 2 or 5).
 */
var MonopolyDealRules = (function () {
  'use strict';
  var COL = {
    brown: { n: 'Brown', size: 2, rent: [1, 2], css: '#8b5a2b', fg: '#fff', v: 1 },
    lblue: { n: 'Light Blue', size: 3, rent: [1, 2, 3], css: '#9bd8f5', fg: '#10202a', v: 1 },
    pink: { n: 'Pink', size: 3, rent: [1, 2, 4], css: '#e2459a', fg: '#fff', v: 2 },
    orange: { n: 'Orange', size: 3, rent: [1, 3, 5], css: '#f7931e', fg: '#2a1400', v: 2 },
    red: { n: 'Red', size: 3, rent: [2, 3, 6], css: '#e2262c', fg: '#fff', v: 3 },
    yellow: { n: 'Yellow', size: 3, rent: [2, 4, 6], css: '#ffe135', fg: '#2a2400', v: 3 },
    green: { n: 'Green', size: 3, rent: [2, 4, 7], css: '#1fa04a', fg: '#fff', v: 4 },
    dblue: { n: 'Dark Blue', size: 2, rent: [3, 8], css: '#1d4fb8', fg: '#fff', v: 4 },
    rail: { n: 'Railroad', size: 4, rent: [1, 2, 3, 4], css: '#222', fg: '#fff', v: 2 },
    util: { n: 'Utility', size: 2, rent: [1, 2], css: '#cfd8cf', fg: '#1a1a1a', v: 2 }
  };
  var COLKEYS = Object.keys(COL);
  var PNAMES = {
    brown: ['Mediterranean Ave', 'Baltic Ave'], lblue: ['Oriental Ave', 'Vermont Ave', 'Connecticut Ave'],
    pink: ['St. Charles Place', 'States Ave', 'Virginia Ave'], orange: ['St. James Place', 'Tennessee Ave', 'New York Ave'],
    red: ['Kentucky Ave', 'Indiana Ave', 'Illinois Ave'], yellow: ['Atlantic Ave', 'Ventnor Ave', 'Marvin Gardens'],
    green: ['Pacific Ave', 'North Carolina Ave', 'Pennsylvania Ave'], dblue: ['Park Place', 'Boardwalk'],
    rail: ['Reading Railroad', 'Pennsylvania Railroad', 'B. & O. Railroad', 'Short Line'], util: ['Electric Company', 'Water Works']
  };
  var ACT = {
    breaker: { n: 'Deal Breaker', v: 5, cnt: 3, ic: '🔨', bg: '#b0122a', txt: 'Steal one COMPLETE property set (with its Shack) from your opponent.' },
    jsn: { n: 'Just Say No!', v: 4, cnt: 5, ic: '🚫', bg: '#d6336c', txt: 'Cancel an action played against you. Your opponent may Just Say No back. Cannot stop a debt chip for being unable to pay.' },
    forceddebt: { n: 'Forced Debt', v: 3, cnt: 3, ic: '⛓️', bg: '#5b4636', txt: "Take one of your opponent's debt chips. On their next turn they must give you a card from their hand." },
    goagain: { n: 'Go Again', v: 1, cnt: 3, ic: '🔁', bg: '#0f9d8a', txt: 'Play as your LAST card: your turn ends and you immediately take another full turn.' },
    heist: { n: 'Heist', v: 3, cnt: 3, ic: '🦹', bg: '#3b3b98', txt: "Take one card of your choice from your opponent's bank." },
    crash: { n: 'Market Crash', v: 4, cnt: 3, ic: '📉', bg: '#8e44ad', txt: 'Take one property of your choice from your opponent, even from a complete set.' },
    passgo: { n: 'Pass Go, Go Go!', v: 1, cnt: 4, ic: '🏁', bg: '#27ae60', txt: 'Draw cards until you have 7 in your hand.' },
    repo: { n: 'Repossession', v: 5, cnt: 2, ic: '🚚', bg: '#a0522d', txt: 'Your opponent keeps ONE property of their choice and gives you all the rest (Shacks move with their sets).' },
    shack: { n: 'Shack', v: 3, cnt: 3, ic: '🛖', bg: '#7a5c2e', txt: 'Put on one of your property sets: that set charges +5M rent. It moves with the set.' },
    supersly: { n: 'Super Sly Deal', v: 4, cnt: 3, ic: '🥷', bg: '#2c3e50', txt: "Name a colour: take ALL your opponent's properties of that colour, even complete sets and matching wilds." },
    tax: { n: 'Tax Collector', v: 4, cnt: 2, ic: '🧾', bg: '#c0392b', txt: 'Your opponent keeps ONE bank card of their choice and gives you all the rest.' },
    toughluck: { n: 'Tough Luck', v: 3, cnt: 3, ic: '🎲', bg: '#d35400', txt: "Name Property, Money or Action: take every card of that type from your opponent's HAND." },
    unfair: { n: 'Unfair Trade', v: 4, cnt: 2, ic: '⚖️', bg: '#16a085', txt: "Swap your whole bank with your opponent's. You need at least 1 card in your bank." },
    yoink: { n: 'Yoink!', v: 3, cnt: 3, ic: '🫳', bg: '#e67e22', txt: 'Your opponent owes you 10M.' }
  };
  var PAIRS = [['brown', 'lblue'], ['pink', 'orange'], ['red', 'yellow'], ['green', 'dblue'], ['rail', 'util']];

  var CARDS = [];
  function add(o) { o.id = CARDS.length; CARDS.push(o); }
  (function build() {
    [[1, 5], [2, 4], [3, 3], [4, 3], [5, 2], [10, 1]].forEach(function (p) {
      for (var i = 0; i < p[1]; i++) add({ t: 'money', v: p[0], n: p[0] + 'M' });
    });
    COLKEYS.forEach(function (c) { PNAMES[c].forEach(function (n) { add({ t: 'prop', col: c, n: n, v: COL[c].v }); }); });
    [['dblue', 'green', 4], ['lblue', 'brown', 4], ['green', 'rail', 4], ['util', 'rail', 2], ['lblue', 'rail', 4],
      ['pink', 'orange', 2], ['pink', 'orange', 2], ['red', 'yellow', 3], ['red', 'yellow', 3]].forEach(function (w) {
      add({ t: 'wild', cols: [w[0], w[1]], v: w[2], n: 'Wild ' + COL[w[0]].n + '/' + COL[w[1]].n });
    });
    add({ t: 'wild', cols: null, v: 0, n: 'Rainbow Wild' }); add({ t: 'wild', cols: null, v: 0, n: 'Rainbow Wild' });
    Object.keys(ACT).forEach(function (a) { for (var i = 0; i < ACT[a].cnt; i++) add({ t: 'act', a: a, v: ACT[a].v, n: ACT[a].n }); });
    PAIRS.forEach(function (p) { add({ t: 'rent', cols: p, dbl: false, v: 1, n: 'Rent' }); });
    PAIRS.forEach(function (p) { add({ t: 'rent', cols: p, dbl: true, v: 2, n: 'Double Rent' }); });
    for (var i = 0; i < 3; i++) add({ t: 'rent', cols: null, dbl: false, v: 3, n: 'Rent Any Colour' });
    for (i = 0; i < 3; i++) add({ t: 'rent', cols: null, dbl: true, v: 4, n: 'Double Rent Any Colour' });
  })();

  function other(p) { return p === 'host' ? 'guest' : 'host'; }
  function has(a, c) { return a.indexOf(c) >= 0; }
  function cardCols(c) { var d = CARDS[c]; if (d.t === 'prop') return [d.col]; if (d.t === 'wild') return d.cols || COLKEYS; return []; }
  function isRainbow(c) { return CARDS[c].t === 'wild' && !CARDS[c].cols; }
  function isProp(c) { var t = CARDS[c].t; return t === 'prop' || t === 'wild'; }
  function isAct(c, a) { return CARDS[c].t === 'act' && CARDS[c].a === a; }
  function kindOf(c) { var t = CARDS[c].t; return t === 'money' ? 'money' : (t === 'prop' || t === 'wild') ? 'prop' : 'action'; }
  function isComplete(s) {
    return s.props.length >= COL[s.col].size && s.props.some(function (c) { return !isRainbow(c); });
  }
  function setRent(s) {
    var n = Math.min(s.props.length, COL[s.col].size);
    if (!n) return 0;
    return COL[s.col].rent[n - 1] + (s.shack != null ? 5 : 0);
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
  // where is card c on p's table? -> {kind:'bank'} | {kind:'prop'|'shack', set} | null
  function find(G, p, c) {
    if (has(G.bank[p], c)) return { kind: 'bank' };
    for (var i = 0; i < G.sets[p].length; i++) {
      var s = G.sets[p][i];
      if (has(s.props, c)) return { kind: 'prop', set: s };
      if (s.shack === c) return { kind: 'shack', set: s };
    }
    return null;
  }
  function allProps(G, p) { var o = []; G.sets[p].forEach(function (s) { o = o.concat(s.props); }); return o; }
  // cards p can pay with: bank, properties (not rainbow wilds) and shacks
  function payable(G, p) {
    var out = G.bank[p].slice();
    G.sets[p].forEach(function (s) {
      s.props.forEach(function (c) { if (!isRainbow(c)) out.push(c); });
      if (s.shack != null) out.push(s.shack);
    });
    return out;
  }
  function sumVal(ids) { return ids.reduce(function (a, c) { return a + CARDS[c].v; }, 0); }
  function bankTotal(G, p) { return sumVal(G.bank[p]); }
  // valid: distinct payable cards worth >= amount, OR every payable card (then the rest becomes a debt chip)
  function validPayment(G, p, sel, amount) {
    if (!Array.isArray(sel)) return false;
    var as = payable(G, p), seen = {};
    for (var i = 0; i < sel.length; i++) {
      if (typeof sel[i] !== 'number' || seen[sel[i]] || !has(as, sel[i])) return false;
      seen[sel[i]] = 1;
    }
    return sumVal(sel) >= amount || sel.length === as.length;
  }
  function supply(G, p) { return 3 - G.owe[p]; }
  // must p hand over repayment cards before doing anything else this turn?
  function mustRepay(G, p) { return G.turn === p && !G.pend && !G.winner && G.owe[p] > 0 && G.hand[p].length > 0 && G.plays > 0; }
  function rentSets(G, p, c) {
    var d = CARDS[c];
    return G.sets[p].filter(function (s) { return s.props.length > 0 && (!d.cols || has(d.cols, s.col)); });
  }
  function slyColors(G, p) {
    return COLKEYS.filter(function (col) {
      return G.sets[p].some(function (s) {
        return s.col === col || s.props.some(function (c) { return CARDS[c].t === 'wild' && has(cardCols(c), col); });
      });
    });
  }
  // '' if p may play action/rent card c right now, else a plain-English reason
  function canUse(G, p, c) {
    var d = CARDS[c], o = other(p);
    if (G.winner || G.turn !== p || G.pend) return 'Not your turn';
    if (mustRepay(G, p)) return 'Repay your debt first';
    if (G.plays < 1) return 'No plays left';
    if (d.t === 'rent') return rentSets(G, p, c).length ? '' : 'You have no property of these colours';
    if (d.t !== 'act') return 'Not an action';
    switch (d.a) {
      case 'jsn': return 'Only playable in response to an action against you';
      case 'forceddebt': return supply(G, o) > 0 ? '' : 'Opponent has no debt chips left';
      case 'heist': return G.bank[o].length ? '' : 'Opponent bank is empty';
      case 'crash': return allProps(G, o).length ? '' : 'Opponent has no properties';
      case 'breaker': return G.sets[o].some(isComplete) ? '' : 'Opponent has no complete set';
      case 'repo': return allProps(G, o).length >= 2 ? '' : 'Opponent needs 2+ properties';
      case 'supersly': return slyColors(G, o).length ? '' : 'Opponent has no properties';
      case 'tax': return G.bank[o].length >= 2 ? '' : 'Opponent needs 2+ bank cards';
      case 'unfair': return G.bank[p].length ? '' : 'Your bank is empty';
      case 'shack': return G.sets[p].some(function (s) { return s.shack == null; }) ? '' : 'No set without a Shack';
      default: return '';
    }
  }

  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function shuffleSeeded(arr, seed) {
    var r = mulberry(seed), a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  function log(G, ic, s) { G.log.push({ ic: ic, s: s }); if (G.log.length > 60) G.log.shift(); }
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
    var got = draw(G, p, G.hand[p].length === 0 ? 5 : 2);
    log(G, '🃏', nm(G, p) + ' draws ' + got + '.');
  }
  function newGame(order, names, seed) {
    var G = { deck: order.slice(), disc: [], hand: { host: [], guest: [] }, bank: { host: [], guest: [] },
      sets: { host: [], guest: [] }, owe: { host: 0, guest: 0 }, turn: 'host', plays: 3, pend: null, winner: null,
      log: [], nsid: 1, reshuf: 0, names: names, seed: seed | 0 };
    for (var i = 0; i < 5; i++) { draw(G, 'host', 1); draw(G, 'guest', 1); }
    log(G, '🎩', 'No Mercy! ' + nm(G, 'host') + ' goes first.');
    startTurn(G);
    return G;
  }

  function placeProp(G, p, c, col) {
    var s = null;
    for (var i = 0; i < G.sets[p].length; i++) if (G.sets[p][i].col === col && !isComplete(G.sets[p][i])) { s = G.sets[p][i]; break; }
    if (!s) { s = { sid: G.nsid++, col: col, props: [], shack: null }; G.sets[p].push(s); }
    s.props.push(c);
  }
  // auto-place a card that p receives as debt repayment
  function receiveCard(G, p, c) {
    var d = CARDS[c];
    if (d.t === 'prop') return placeProp(G, p, c, d.col);
    if (d.t !== 'wild') return G.bank[p].push(c);
    var cols = cardCols(c), best = null;
    G.sets[p].forEach(function (s) { if (has(cols, s.col) && !isComplete(s) && (!best || s.props.length > best.props.length)) best = s; });
    placeProp(G, p, c, best ? best.col : cols[0]);
  }
  // remove any card from p's table; a set that loses its last property drops its Shack into p's bank
  function removeFromTable(G, p, c) {
    var f = find(G, p, c); if (!f) return false;
    if (f.kind === 'bank') { G.bank[p].splice(G.bank[p].indexOf(c), 1); return true; }
    var s = f.set;
    if (f.kind === 'shack') { s.shack = null; return true; }
    s.props.splice(s.props.indexOf(c), 1);
    if (!s.props.length) {
      if (s.shack != null) G.bank[p].push(s.shack);
      G.sets[p].splice(G.sets[p].indexOf(s), 1);
    }
    return true;
  }
  function moveProp(G, from, to, c) { var f = find(G, from, c); if (!f || f.kind !== 'prop') return; var col = f.set.col; removeFromTable(G, from, c); placeProp(G, to, c, col); }
  function moveSet(G, from, to, s) { G.sets[from].splice(G.sets[from].indexOf(s), 1); G.sets[to].push(s); }
  function takeHand(G, p, c) { var i = G.hand[p].indexOf(c); if (i < 0) return false; G.hand[p].splice(i, 1); return true; }
  function discard(G, p, c) { if (takeHand(G, p, c)) { G.disc.push(c); return true; } return false; }
  function giveChip(G, p) {
    if (supply(G, p) > 0) { G.owe[p]++; log(G, '⛓️', nm(G, p) + ' hands over a debt chip!'); }
    else log(G, '⛓️', nm(G, p) + ' has no debt chips left - debt forgiven.');
  }

  var PEND_NAME = { breaker: 'Deal Breaker', forceddebt: 'Forced Debt', heist: 'Heist', crash: 'Market Crash', repo: 'Repossession',
    supersly: 'Super Sly Deal', tax: 'Tax Collector', toughluck: 'Tough Luck', unfair: 'Unfair Trade', yoink: 'Yoink!', rent: 'Rent' };

  // The action was not cancelled: carry it out (or move on to the target's choice / payment).
  function execute(G) {
    var P = G.pend, src = P.src, tgt = P.tgt, s, f;
    G.pend = null;
    switch (P.type) {
      case 'breaker':
        s = getSet(G, tgt, P.sid);
        if (s && isComplete(s)) { moveSet(G, tgt, src, s); log(G, '🔨', nm(G, src) + ' took the complete ' + COL[s.col].n + ' set!'); }
        break;
      case 'forceddebt':
        if (supply(G, tgt) > 0) { G.owe[tgt]++; log(G, '⛓️', nm(G, src) + ' takes a debt chip from ' + nm(G, tgt) + '.'); }
        break;
      case 'heist':
        if (has(G.bank[tgt], P.tc)) { removeFromTable(G, tgt, P.tc); G.bank[src].push(P.tc); log(G, '🦹', nm(G, src) + ' heisted ' + CARDS[P.tc].v + 'M from the bank.'); }
        break;
      case 'crash':
        f = find(G, tgt, P.tc);
        if (f && f.kind === 'prop') { moveProp(G, tgt, src, P.tc); log(G, '📉', nm(G, src) + ' grabbed ' + cn(P.tc) + '.'); }
        break;
      case 'supersly': {
        var col = P.col, n = 0;
        G.sets[tgt].filter(function (x) { return x.col === col; }).forEach(function (x) { n += x.props.length; moveSet(G, tgt, src, x); });
        allProps(G, tgt).forEach(function (c) {
          if (CARDS[c].t === 'wild' && has(cardCols(c), col)) { removeFromTable(G, tgt, c); placeProp(G, src, c, col); n++; }
        });
        log(G, '🥷', nm(G, src) + ' swept ' + n + ' ' + COL[col].n + ' card' + (n === 1 ? '' : 's') + '!');
        break;
      }
      case 'toughluck': {
        var got = G.hand[tgt].filter(function (c) { return kindOf(c) === P.kind; });
        got.forEach(function (c) { takeHand(G, tgt, c); G.hand[src].push(c); });
        log(G, '🎲', nm(G, src) + ' took ' + got.length + ' ' + P.kind + ' card' + (got.length === 1 ? '' : 's') + ' from ' + nm(G, tgt) + "'s hand.");
        break;
      }
      case 'unfair': {
        var t = G.bank[src]; G.bank[src] = G.bank[tgt]; G.bank[tgt] = t;
        log(G, '⚖️', 'Banks swapped!');
        break;
      }
      case 'repo':
        if (allProps(G, tgt).length >= 2) { P.stage = 'keep'; P.resp = tgt; G.pend = P; }
        break;
      case 'tax':
        if (G.bank[tgt].length >= 2) { P.stage = 'keep'; P.resp = tgt; G.pend = P; }
        break;
      default: // yoink / rent -> payment
        if (!payable(G, tgt).length) { log(G, '💸', nm(G, tgt) + ' cannot pay anything.'); giveChip(G, tgt); }
        else { P.stage = 'pay'; P.resp = tgt; G.pend = P; }
    }
  }

  function checkWin(G) {
    [G.turn, other(G.turn)].forEach(function (p) { if (!G.winner && completeColors(G, p).length >= 3) G.winner = p; });
    if (G.winner) log(G, '🏆', nm(G, G.winner) + ' has 3 complete sets!');
  }

  function validDisc(G, p, disc, extraOut) {
    if (!Array.isArray(disc)) return false;
    var seen = {};
    for (var i = 0; i < disc.length; i++) {
      if (typeof disc[i] !== 'number' || seen[disc[i]] || !has(G.hand[p], disc[i]) || disc[i] === extraOut) return false;
      seen[disc[i]] = 1;
    }
    return disc.length === Math.max(0, G.hand[p].length - (extraOut != null ? 1 : 0) - 7);
  }

  function step(G, m, by) {
    if (!m || typeof m !== 'object' || G.winner) return false;
    var opp = other(by), turnOk = G.turn === by && !G.pend, c = m.c, d, P, s, i;
    var ci = typeof c === 'number' && c >= 0 && c < CARDS.length;
    var playOk = turnOk && G.plays >= 1 && !mustRepay(G, by) && ci && has(G.hand[by], c);
    switch (m.k) {
      case 'repay':
        if (!mustRepay(G, by) || !ci || !has(G.hand[by], c)) return false;
        takeHand(G, by, c); receiveCard(G, opp, c); G.owe[by]--; G.plays--;
        log(G, '🤝', nm(G, by) + ' repaid a debt with ' + cn(c) + '.');
        return true;
      case 'bank':
        if (!playOk || isProp(c)) return false;
        takeHand(G, by, c); G.bank[by].push(c); G.plays--;
        log(G, '🏦', nm(G, by) + ' banked ' + CARDS[c].v + 'M' + (CARDS[c].t === 'money' ? '' : ' (' + cn(c) + ')') + '.');
        return true;
      case 'prop':
        if (!playOk || !isProp(c) || !has(cardCols(c), m.col)) return false;
        takeHand(G, by, c); placeProp(G, by, c, m.col); G.plays--;
        log(G, '🏠', nm(G, by) + ' played ' + cn(c) + (CARDS[c].t === 'wild' ? ' as ' + COL[m.col].n : '') + '.');
        return true;
      case 'move': { // free: re-assign one of your wild cards on the table
        if (!turnOk || !ci || CARDS[c].t !== 'wild') return false;
        var f = find(G, by, c);
        if (!f || f.kind !== 'prop' || !has(cardCols(c), m.col) || f.set.col === m.col) return false;
        removeFromTable(G, by, c); placeProp(G, by, c, m.col);
        log(G, '↔️', nm(G, by) + ' flipped a wild to ' + COL[m.col].n + '.');
        return true;
      }
      case 'shack':
        if (!playOk || !isAct(c, 'shack')) return false;
        s = getSet(G, by, m.sid); if (!s || s.shack != null) return false;
        takeHand(G, by, c); s.shack = c; G.plays--;
        log(G, '🛖', nm(G, by) + ' built a Shack on ' + COL[s.col].n + ' (+5M rent).');
        return true;
      case 'passgo':
        if (!playOk || !isAct(c, 'passgo')) return false;
        discard(G, by, c); G.plays--;
        var got = draw(G, by, Math.max(0, 7 - G.hand[by].length));
        log(G, '🏁', nm(G, by) + ' plays Pass Go, Go Go! and draws ' + got + '.');
        return true;
      case 'goagain':
        if (!playOk || !isAct(c, 'goagain') || !validDisc(G, by, m.disc, c)) return false;
        discard(G, by, c); m.disc.forEach(function (x) { discard(G, by, x); });
        log(G, '🔁', nm(G, by) + ' plays Go Again!');
        startTurn(G);
        return true;
      case 'act': { // actions aimed at the opponent -> pending (Just Say No window)
        if (!playOk) return false;
        d = CARDS[c];
        if (d.t !== 'act' && d.t !== 'rent') return false;
        if (canUse(G, by, c)) return false;
        P = { id: G.nsid++, type: d.t === 'rent' ? 'rent' : d.a, src: by, tgt: opp, resp: opp, jsn: 0, stage: 'jsn', amount: 0, tc: null, sid: null, col: null, kind: null };
        if (d.t === 'rent') {
          s = getSet(G, by, m.sid); if (!s || rentSets(G, by, c).indexOf(s) < 0) return false;
          P.sid = s.sid; P.col = s.col; P.amount = setRent(s) * (d.dbl ? 2 : 1);
        } else switch (d.a) {
          case 'breaker': s = getSet(G, opp, m.sid); if (!s || !isComplete(s)) return false; P.sid = s.sid; P.col = s.col; break;
          case 'heist': if (!has(G.bank[opp], m.tc)) return false; P.tc = m.tc; break;
          case 'crash': f = find(G, opp, m.tc); if (!f || f.kind !== 'prop') return false; P.tc = m.tc; break;
          case 'supersly': if (!has(slyColors(G, opp), m.col)) return false; P.col = m.col; break;
          case 'toughluck': if (['prop', 'money', 'action'].indexOf(m.kind) < 0) return false; P.kind = m.kind; break;
          case 'yoink': P.amount = 10; break;
          case 'forceddebt': case 'repo': case 'tax': case 'unfair': break;
          default: return false;
        }
        discard(G, by, c); G.plays--; G.pend = P;
        log(G, d.t === 'rent' ? '💰' : ACT[d.a].ic, nm(G, by) + ' plays ' + d.n + (P.amount ? ' (' + P.amount + 'M)' : '') +
          (P.col && d.t !== 'rent' && d.a === 'supersly' ? ' on ' + COL[P.col].n : '') + (P.kind ? ' (' + P.kind + ')' : '') + '.');
        return true;
      }
      case 'jsn':
        P = G.pend;
        if (!P || P.stage !== 'jsn' || P.resp !== by || !ci || !has(G.hand[by], c) || !isAct(c, 'jsn')) return false;
        discard(G, by, c); P.jsn++; P.resp = other(by);
        log(G, '🚫', nm(G, by) + ' says NO!');
        return true;
      case 'accept':
        P = G.pend;
        if (!P || P.stage !== 'jsn' || P.resp !== by) return false;
        if (P.jsn % 2 === 1) { log(G, '🚫', PEND_NAME[P.type] + ' was cancelled.'); G.pend = null; }
        else execute(G);
        return true;
      case 'keep': // Repossession / Tax Collector: target picks the one card it keeps
        P = G.pend;
        if (!P || P.stage !== 'keep' || P.tgt !== by || !ci) return false;
        if (P.type === 'repo') {
          f = find(G, by, c); if (!f || f.kind !== 'prop') return false;
          G.sets[by].slice().forEach(function (x) {
            if (x !== f.set) moveSet(G, by, P.src, x);
            else x.props.slice().forEach(function (y) { if (y !== c) moveProp(G, by, P.src, y); });
          });
          log(G, '🚚', nm(G, by) + ' keeps only ' + cn(c) + '!');
        } else {
          if (!has(G.bank[by], c)) return false;
          var rest = G.bank[by].filter(function (x) { return x !== c; });
          G.bank[by] = [c]; G.bank[P.src] = G.bank[P.src].concat(rest);
          log(G, '🧾', nm(G, by) + ' keeps ' + CARDS[c].v + 'M and hands over ' + sumVal(rest) + 'M.');
        }
        G.pend = null;
        return true;
      case 'pay': {
        P = G.pend;
        if (!P || P.stage !== 'pay' || P.tgt !== by || !validPayment(G, by, m.sel, P.amount)) return false;
        var colOf = {}, sel = m.sel.slice(), tot = sumVal(sel);
        sel.forEach(function (x) { var q = find(G, by, x); if (q && q.kind === 'prop') colOf[x] = q.set.col; });
        var rank = function (x) { var q = find(G, by, x); return q.kind === 'shack' ? 0 : q.kind === 'prop' ? 1 : 2; };
        sel.sort(function (a, b) { return rank(a) - rank(b); });
        sel.forEach(function (x) {
          if (!removeFromTable(G, by, x)) return;
          if (isProp(x)) placeProp(G, P.src, x, colOf[x]); else G.bank[P.src].push(x);
        });
        log(G, '💸', nm(G, by) + ' paid ' + tot + 'M (' + sel.length + ' card' + (sel.length === 1 ? '' : 's') + ').');
        G.pend = null;
        if (tot < P.amount) giveChip(G, by);
        return true;
      }
      case 'endturn':
        if (!turnOk || mustRepay(G, by) || !validDisc(G, by, m.disc, null)) return false;
        m.disc.forEach(function (x) { discard(G, by, x); });
        if (m.disc.length) log(G, '🗑️', nm(G, by) + ' discarded ' + m.disc.length + '.');
        G.turn = opp; startTurn(G);
        return true;
    }
    return false;
  }
  function reduce(G, m, by) { var ok = step(G, m, by); if (ok) checkWin(G); return ok; }

  return { COL: COL, COLKEYS: COLKEYS, CARDS: CARDS, ACT: ACT, PAIRS: PAIRS, other: other, cardCols: cardCols, isRainbow: isRainbow,
    isProp: isProp, isAct: isAct, kindOf: kindOf, isComplete: isComplete, setRent: setRent, completeColors: completeColors,
    getSet: getSet, find: find, payable: payable, allProps: allProps, sumVal: sumVal, bankTotal: bankTotal,
    validPayment: validPayment, supply: supply, mustRepay: mustRepay, rentSets: rentSets, slyColors: slyColors,
    canUse: canUse, newGame: newGame, reduce: reduce, draw: draw, shuffleSeeded: shuffleSeeded, placeProp: placeProp,
    PEND_NAME: PEND_NAME };
})();

/* ------------------------------ UI / plugin ------------------------------ */
registerGame({
  id: 'monopolydeal', icon: '🎩', name: 'Monopoly Deal: No Mercy',
  blurb: 'Ruthless property card battle: 3 full sets wins. Heists, debt chips, Just Say No!',
  start: function (ctx) {
    var R = MonopolyDealRules, COL = R.COL, CARDS = R.CARDS, ACT = R.ACT;
    var me = ctx.me, opp = R.other(me);
    var G = R.newGame(ctx.shuffle(CARDS.map(function (c) { return c.id; })), { host: ctx.names.host, guest: ctx.names.guest }, ctx.seed);
    // local UI mode: null | {m:'card'|'crash'|'heist'|'breaker'|'shack'|'rent'|'sly'|'tough'|'move'|'disc', c, after}
    var ui = null, paySel = [], discSel = [], payFor = -1, timers = [], dead = false, ended = false, autoKey = '';
    var helpOpen = false, prevLoc = null, curLoc = {};

    var RAINBOW = 'linear-gradient(90deg,#e2262c,#f7931e,#ffe135,#1fa04a,#1d4fb8,#e2459a)';
    var CSS = [
      '.md{max-width:1100px;margin:0 auto;font-size:14px;color:var(--ink);font-family:inherit;--acc:#2ecc71;position:relative}',
      '.md *{box-sizing:border-box}',
      '.md-top{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px}',
      '.md-title{font-weight:800;font-size:18px;letter-spacing:.02em}.md-title span{color:var(--bad);text-shadow:0 0 14px rgba(255,90,106,.6)}',
      '.md-top button{padding:8px 14px;font-size:13px;margin:0}',
      '.md-help{background:linear-gradient(150deg,var(--card2),var(--card));border:1px solid var(--line);border-radius:18px;padding:12px 18px;margin-bottom:12px;font-size:13px;line-height:1.5;box-shadow:var(--shadow)}',
      '.md-help h4{margin:6px 0;color:var(--acc)}.md-help ul{margin:4px 0 8px;padding-left:20px}',
      '.md-zone{position:relative;background:radial-gradient(120% 140% at 50% 0%,rgba(46,204,113,.10),transparent 60%),linear-gradient(150deg,var(--card2),var(--card));border:1.5px solid var(--line);border-radius:22px;padding:12px 16px;margin-bottom:10px;box-shadow:var(--shadow);transition:border-color .3s,opacity .3s}',
      '.md-zone.active{border-color:var(--gold);box-shadow:0 0 0 1px rgba(255,209,102,.4),0 0 28px rgba(255,209,102,.18),var(--shadow)}',
      '.md-zone.opp{opacity:.93}',
      '.md-zh{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px}',
      '.md-av{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;color:#111;flex:none}',
      '.md-who{font-weight:800;font-size:16px}.md-who small{display:block;color:var(--dim);font-weight:500;font-size:12px}',
      '.md-zh .grow{flex:1}',
      '.md-backs{display:flex;padding-left:10px}',
      '.md-back{width:22px;height:32px;border-radius:4px;margin-left:-10px;border:1.5px solid #fff;background:repeating-linear-gradient(45deg,#c62828 0 4px,#8e1c1c 4px 8px);box-shadow:1px 2px 4px rgba(0,0,0,.5)}',
      '.md-chips{display:flex;gap:4px;align-items:center;font-size:11px;color:var(--dim)}',
      '.md-chip{width:22px;height:22px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;color:#fff;border:2px dashed rgba(255,255,255,.75);box-shadow:0 2px 5px rgba(0,0,0,.5),inset 0 0 0 3px rgba(0,0,0,.18)}',
      '.md-chip.h{background:var(--host)}.md-chip.g{background:var(--guest)}.md-chip.gone{opacity:.18}',
      '.md-zb{display:flex;gap:16px;align-items:flex-start}',
      '.md-sets{display:flex;flex-wrap:wrap;gap:10px;flex:1;min-height:60px}',
      '.md-empty{color:var(--dim);font-size:13px;align-self:center}',
      '.md-set{width:136px;border-radius:12px;background:#f7f4ec;color:#161616;font-size:11.5px;box-shadow:0 6px 14px rgba(0,0,0,.45);border:2.5px solid transparent;transition:transform .2s,box-shadow .2s,border-color .2s;overflow:hidden}',
      '.md-set.done{border-color:var(--gold);box-shadow:0 0 0 2px rgba(255,209,102,.4),0 0 24px rgba(255,209,102,.6)}',
      '.md-set.pick,.md-pc.pick,.md-bk.pick{cursor:pointer;animation:mdglow 1.1s ease-in-out infinite}',
      '.md-set.pick{border-color:var(--acc)}',
      '@keyframes mdglow{0%,100%{box-shadow:0 0 0 2px var(--acc),0 0 10px rgba(46,204,113,.6)}50%{box-shadow:0 0 0 3px var(--acc),0 0 24px rgba(46,204,113,.95)}}',
      '.md-set.pick:hover{transform:translateY(-4px)}',
      '.md-sh{display:flex;justify-content:space-between;align-items:center;padding:6px 8px;font-weight:800;font-size:12px}',
      '.md-cnt{background:rgba(0,0,0,.35);color:#fff;border-radius:10px;padding:1px 7px;font-size:11px}',
      '.md-set.done .md-cnt{background:var(--gold);color:#3a2600}',
      '.md-pc{position:relative;display:flex;align-items:center;gap:6px;padding:5px 8px;border-top:1px solid rgba(0,0,0,.1);font-weight:600;cursor:default;transition:background .15s}',
      '.md-pc i{width:6px;align-self:stretch;border-radius:3px;flex:none}',
      '.md-pc span{flex:1;line-height:1.15}.md-pc b{background:#222;color:#fff;border-radius:9px;padding:0 6px;font-size:10.5px}',
      '.md-pc.pick{background:#c9f5d6;margin:2px;border-radius:6px}.md-pc.pick:hover{background:#9ceab4}',
      '.md-pc.sel{background:#ffe58a}.md-pc.mv{cursor:pointer}.md-pc.mv:hover{background:#ece6ff}.md-pc.mv span:after{content:" ↔";color:#7a52e0}',
      '.md-rent{padding:5px 8px;background:#ece7da;font-weight:800;font-size:11px;display:flex;justify-content:space-between}',
      '.md-bankbox{width:210px;flex:none}',
      '.md-banktot{font-weight:800;color:var(--acc);margin-bottom:6px;font-size:15px}',
      '.md-notes{display:flex;flex-wrap:wrap;padding-left:12px;min-height:40px}',
      '.md-bk{position:relative;margin-left:-12px;margin-bottom:6px;width:42px;height:58px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px;color:#123;border:2px solid rgba(0,0,0,.35);box-shadow:2px 3px 6px rgba(0,0,0,.5);transition:transform .15s}',
      '.md-bk:nth-child(odd){transform:rotate(-4deg)}.md-bk:nth-child(even){transform:rotate(3deg)}',
      '.md-bk.pick:hover{transform:translateY(-6px) rotate(0)}.md-bk.sel{transform:translateY(-8px);outline:3px solid var(--gold)}',
      '.md .m1{background:linear-gradient(160deg,#fff6c9,#f0de8a)}.md .m2{background:linear-gradient(160deg,#ffd9d9,#f3a3a3)}.md .m3{background:linear-gradient(160deg,#dcf5d2,#9fd98b)}',
      '.md .m4{background:linear-gradient(160deg,#d6ebff,#93c3f1)}.md .m5{background:linear-gradient(160deg,#ead9ff,#bb9bf0)}.md .m10{background:linear-gradient(160deg,#ffe1b3,#ffab4a)}',
      '.md .mact{background:linear-gradient(160deg,#ece4ff,#c5b2f7)}',
      '.md-center{display:grid;grid-template-columns:auto 1fr 1.1fr;gap:14px;align-items:center;margin-bottom:10px}',
      '.md-piles{display:flex;gap:12px;align-items:center}',
      '.md-pile{position:relative;text-align:center;font-size:11px;color:var(--dim)}',
      '.md-pile .stack{width:64px;height:90px;border-radius:9px;border:2px solid #fff;background:repeating-linear-gradient(45deg,#c62828 0 5px,#8e1c1c 5px 10px);box-shadow:2px 2px 0 #6b1414,4px 4px 0 #4a0e0e,6px 7px 12px rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:18px;color:#fff;text-shadow:0 2px 4px #000}',
      '.md-pile .none{width:64px;height:90px;border-radius:9px;border:2px dashed var(--line)}',
      '.md-banner{text-align:center;padding:12px;border-radius:18px;background:rgba(8,8,24,.5);border:1px solid var(--line)}',
      '.md-turn{display:inline-block;font-weight:800;font-size:17px;padding:7px 18px;border-radius:999px;background:var(--card2);border:1px solid var(--line)}',
      '.md-turn.mine{background:linear-gradient(135deg,#5df09a,#2ecc71);color:#06301a;animation:mdpulse 1.8s ease-in-out infinite}',
      '@keyframes mdpulse{0%,100%{box-shadow:0 0 0 0 rgba(46,204,113,.55)}50%{box-shadow:0 0 0 10px rgba(46,204,113,0)}}',
      '.md-pips{margin-top:8px;display:flex;justify-content:center;gap:7px;align-items:center;font-size:12px;color:var(--dim)}',
      '.md-pip{width:14px;height:14px;border-radius:50%;border:2px solid var(--acc)}.md-pip.on{background:var(--acc);box-shadow:0 0 10px var(--acc)}',
      '.md-status{margin-top:6px;font-size:12.5px;color:var(--dim)}',
      '.md-log{max-height:132px;overflow-y:auto;font-size:12.5px;background:rgba(8,8,24,.5);border:1px solid var(--line);border-radius:14px;padding:8px 10px;line-height:1.45}',
      '.md-log div{display:flex;gap:7px;padding:2px 0;color:var(--dim)}.md-log div:last-child{color:var(--ink);font-weight:600}',
      '.md-log em{font-style:normal;width:20px;text-align:center;flex:none}',
      '.md-low{position:sticky;bottom:0;z-index:4;background:linear-gradient(180deg,transparent,var(--bg) 22px);padding-top:18px}',
      '.md-prompt{display:flex;gap:14px;align-items:center;background:linear-gradient(150deg,var(--card2),var(--card));border:1.5px solid var(--violet);border-radius:18px;padding:12px 16px;margin-bottom:8px;box-shadow:var(--shadow);animation:mdin .25s ease-out}',
      '.md-prompt .txt{flex:1}.md-prompt p{margin:0 0 6px;font-weight:600}.md-prompt .why{color:var(--dim);font-size:12.5px;margin-bottom:8px;font-weight:400}',
      '.md-prompt button{margin:3px 8px 3px 0;padding:10px 16px;font-size:13.5px}',
      '.md-prompt button[disabled]{filter:grayscale(1)}',
      '.md-colbtn{color:#fff !important;text-shadow:0 1px 3px rgba(0,0,0,.8)}',
      '@keyframes mdin{from{transform:translateY(12px);opacity:0}to{transform:none;opacity:1}}',
      '.md-hand{display:flex;flex-wrap:wrap;padding:22px 10px 8px 40px;max-height:46vh;overflow-y:auto;background:rgba(10,30,20,.35);border:1px solid var(--line);border-radius:20px}',
      '.md-hand .mdc{margin-left:-30px;margin-bottom:6px;cursor:pointer}',
      '.md-hand .mdc:hover:not(.off){transform:translateY(-18px) scale(1.05);z-index:5;margin-right:26px}',
      '.md-hand .mdc.sel{transform:translateY(-22px);z-index:6;outline:3px solid var(--gold);box-shadow:0 0 26px rgba(255,209,102,.8)}',
      '.md-hand .mdc.off{cursor:default;filter:saturate(.75) brightness(.92)}',
      '.md-hand .md-empty{margin-left:-20px;padding:30px 0}',
      /* realistic card */
      '.mdc{position:relative;flex:none;width:7.6em;height:10.6em;border-radius:.8em;background:#fbf8f0;color:#141414;border:.18em solid #fff;box-shadow:0 .35em .9em rgba(0,0,0,.55),inset 0 0 0 1px rgba(0,0,0,.15);overflow:hidden;font-size:14px;transition:transform .18s,margin .18s,box-shadow .18s;user-select:none}',
      '.mdc.sm{font-size:9px}',
      '.mdc .band{margin:.45em .45em 0;border-radius:.35em;padding:.45em .3em .45em 1.9em;text-align:center;font-weight:900;font-size:.72em;line-height:1.1;text-transform:uppercase;min-height:3.1em;display:flex;align-items:center;justify-content:center;border:1px solid rgba(0,0,0,.25)}',
      '.mdc .badge{position:absolute;left:.3em;top:.3em;width:2.2em;height:2.2em;border-radius:50%;background:#fff;border:.15em solid #222;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:.7em;z-index:2}',
      '.mdc .lad{margin:.4em .6em 0;font-size:.66em}.mdc .lad div{display:flex;justify-content:space-between;border-bottom:1px dotted #bbb;padding:.12em 0}',
      '.mdc .lad span{letter-spacing:-.1em;color:#777}.mdc .foot{position:absolute;bottom:.35em;left:0;right:0;text-align:center;font-size:.58em;color:#666;font-weight:700}',
      '.mdc .ic{text-align:center;font-size:2.3em;line-height:1.15;margin-top:.12em;filter:drop-shadow(0 .08em .1em rgba(0,0,0,.35))}',
      '.mdc .an{text-align:center;font-weight:900;font-size:.78em;line-height:1.1;padding:0 .3em}',
      '.mdc .at{text-align:center;font-size:.52em;color:#555;padding:.25em .5em 0;line-height:1.2}',
      '.mdc.t-money{border-color:#fff}.mdc .mvb{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:2.6em;color:rgba(0,0,0,.72);text-shadow:0 2px 0 rgba(255,255,255,.6)}',
      '.mdc .mvb small{font-size:.45em;margin-left:.05em}.mdc .mring{position:absolute;inset:.6em;border:.12em dashed rgba(0,0,0,.25);border-radius:.5em}',
      '.mdc .cor{position:absolute;font-weight:900;font-size:.72em}.mdc .cor.tl{left:.5em;top:.4em}.mdc .cor.br{right:.5em;bottom:.4em;transform:rotate(180deg)}',
      '.mdc .wheel{width:3.6em;height:3.6em;border-radius:50%;margin:.35em auto 0;border:.2em solid #fff;box-shadow:0 0 0 .1em #222;display:flex;align-items:center;justify-content:center}',
      '.mdc .wheel b{background:#fff;border-radius:50%;width:1.9em;height:1.9em;display:flex;align-items:center;justify-content:center;font-size:.62em}',
      '.mdc.fresh{animation:mdpop .45s cubic-bezier(.2,1.4,.4,1)}',
      '.md-set.fresh,.md-pc.fresh,.md-bk.fresh{animation:mdpop .45s cubic-bezier(.2,1.4,.4,1)}',
      '@keyframes mdpop{0%{transform:scale(.5) translateY(-30px);opacity:0;filter:brightness(1.8)}100%{transform:none;opacity:1;filter:none}}',
      /* modal */
      '.md-modal{position:fixed;inset:0;z-index:30;background:rgba(6,6,18,.72);display:flex;align-items:center;justify-content:center;padding:18px;animation:mdfade .2s}',
      '@keyframes mdfade{from{opacity:0}to{opacity:1}}',
      '.md-box{width:100%;max-width:640px;max-height:90vh;overflow-y:auto;background:linear-gradient(150deg,var(--card2),var(--card));border:1.5px solid var(--line);border-radius:24px;padding:20px 22px;box-shadow:0 30px 80px rgba(0,0,0,.6);animation:mdin .25s ease-out}',
      '.md-box.alert{border-color:var(--bad);box-shadow:0 0 0 4px rgba(255,90,106,.18),0 30px 80px rgba(0,0,0,.6)}',
      '.md-box h3{margin:0 0 6px;font-size:22px}.md-box p{margin:4px 0 10px;color:var(--dim)}',
      '.md-box .big{font-size:40px;text-align:center}',
      '.md-meter{height:10px;border-radius:5px;background:rgba(255,255,255,.08);overflow:hidden;margin:8px 0 12px}.md-meter i{display:block;height:100%;background:linear-gradient(90deg,#ffb347,var(--acc));transition:width .25s}',
      '.md-opts{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0 14px}',
      '.md-opt{cursor:pointer;border-radius:12px;transition:transform .15s;position:relative}',
      '.md-opt:hover{transform:translateY(-4px)}.md-opt.sel{transform:translateY(-6px)}.md-opt.sel .mdc{outline:3px solid var(--gold);box-shadow:0 0 18px rgba(255,209,102,.8)}',
      '.md-opt.sel:after{content:"✓";position:absolute;right:-6px;top:-8px;width:22px;height:22px;border-radius:50%;background:var(--gold);color:#3a2600;font-weight:900;display:flex;align-items:center;justify-content:center;z-index:3}',
      '.md-optl{font-size:12px;color:var(--dim);margin-top:8px;font-weight:700;text-transform:uppercase;letter-spacing:.06em}',
      '.md-box button{margin:4px 8px 4px 0}',
      '@media (max-width:760px){.md-center{grid-template-columns:auto 1fr}.md-log{grid-column:1/-1}.md-zb{flex-direction:column}.md-bankbox{width:auto}.mdc{font-size:12px}.md-hand .mdc{margin-left:-26px}.md-set{width:122px}}'
    ].join('');
    var style = document.createElement('style'); style.textContent = CSS; ctx.root.appendChild(style);
    var box = document.createElement('div'); box.className = 'md'; ctx.root.appendChild(box);

    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function nm(p) { return esc(G.names[p]); }
    function two(cols) { return 'linear-gradient(90deg,' + COL[cols[0]].css + ' 50%,' + COL[cols[1]].css + ' 50%)'; }
    function cardBg(c) {
      var d = CARDS[c];
      if (d.t === 'prop') return COL[d.col].css;
      if (d.t === 'wild' || d.t === 'rent') return d.cols ? two(d.cols) : RAINBOW;
      return d.t === 'money' ? '#2ecc71' : ACT[d.a].bg;
    }
    function explain(c) {
      var d = CARDS[c];
      if (d.t === 'money') return d.v + 'M money. Bank it, then use it to pay your opponent.';
      if (d.t === 'prop') { var C = COL[d.col]; return C.n + ' property (worth ' + d.v + 'M). Set of ' + C.size + '. Rent: ' + C.rent.map(function (r, i) { return (i + 1) + ' card' + (i ? 's' : '') + ' = ' + r + 'M'; }).join(', ') + '.'; }
      if (d.t === 'wild') return d.cols ? 'Wild property: counts as ' + COL[d.cols[0]].n + ' or ' + COL[d.cols[1]].n + '. Flip it for free on your turn. Worth ' + d.v + 'M when paying.'
        : 'Rainbow wild: counts as ANY colour. Cannot complete a set on its own and cannot be used to pay.';
      if (d.t === 'rent') return (d.dbl ? 'DOUBLE rent: ' : 'Rent: ') + 'charge your opponent ' + (d.dbl ? 'twice ' : '') + 'the rent of one of your sets' + (d.cols ? ' (' + COL[d.cols[0]].n + ' or ' + COL[d.cols[1]].n + ')' : ' of any colour') + '. Or bank it for ' + d.v + 'M.';
      return ACT[d.a].txt + ' Or bank it for ' + d.v + 'M.';
    }
    // realistic card face
    function cardHtml(c, cls, attrs) {
      var d = CARDS[c], inner = '', tc = ' t-' + d.t;
      if (d.t === 'money') {
        tc += ' m' + d.v;
        inner = '<div class="mring"></div><div class="cor tl">' + d.v + 'M</div><div class="cor br">' + d.v + 'M</div><div class="mvb">' + d.v + '<small>M</small></div>';
      } else if (d.t === 'prop') {
        var C = COL[d.col];
        inner = '<div class="badge">' + d.v + 'M</div><div class="band" style="background:' + C.css + ';color:' + C.fg + '">' + esc(d.n) + '</div><div class="lad">' +
          C.rent.map(function (r, i) { return '<div><span>' + new Array(i + 2).join('▮') + '</span><b>' + r + 'M</b></div>'; }).join('') +
          '</div><div class="foot">' + C.n.toUpperCase() + ' · SET OF ' + C.size + '</div>';
      } else if (d.t === 'wild') {
        inner = '<div class="badge">' + d.v + 'M</div><div class="band" style="background:' + cardBg(c) + ';color:#fff;text-shadow:0 1px 3px #000">' + (d.cols ? 'Wild property' : 'Rainbow wild') + '</div>' +
          '<div class="ic">' + (d.cols ? '↔️' : '🌈') + '</div><div class="an">' + (d.cols ? COL[d.cols[0]].n + ' / ' + COL[d.cols[1]].n : 'Any colour') + '</div>' +
          '<div class="at">' + (d.cols ? 'Either colour' : "Can't pay or<br>complete alone") + '</div>';
      } else if (d.t === 'rent') {
        var wheel = d.cols ? 'conic-gradient(' + COL[d.cols[0]].css + ' 0 50%,' + COL[d.cols[1]].css + ' 50% 100%)' : 'conic-gradient(#e2262c,#f7931e,#ffe135,#1fa04a,#1d4fb8,#e2459a,#e2262c)';
        inner = '<div class="badge">' + d.v + 'M</div><div class="band" style="background:' + (d.dbl ? '#7a1020' : '#2b2b2b') + ';color:#fff">' + (d.dbl ? 'Double rent' : 'Rent') + '</div>' +
          '<div class="wheel" style="background:' + wheel + '"><b>' + (d.dbl ? 'x2' : '💰') + '</b></div><div class="at">' + (d.cols ? COL[d.cols[0]].n + ' / ' + COL[d.cols[1]].n : 'Any colour') + '</div>';
      } else {
        var A = ACT[d.a];
        inner = '<div class="badge">' + d.v + 'M</div><div class="band" style="background:' + A.bg + ';color:#fff">Action</div><div class="ic">' + A.ic + '</div><div class="an">' + esc(A.n) + '</div>';
      }
      return '<div class="mdc' + tc + (cls || '') + '" ' + (attrs || '') + ' title="' + esc(explain(c)) + '">' + inner + '</div>';
    }
    // animation: mark elements whose card changed place since the previous render
    function fx(c, loc) {
      curLoc[c] = loc;
      return prevLoc && prevLoc[c] !== loc ? ' fresh' : '';
    }

    // ---- state helpers
    function canPlay() { return !G.winner && G.turn === me && !G.pend && !R.mustRepay(G, me); }
    function payMode() { return !!G.pend && G.pend.stage === 'pay' && G.pend.tgt === me; }
    function jsnIn(p) { return G.hand[p].filter(function (c) { return R.isAct(c, 'jsn'); }); }

    function act(m) {
      if (dead) return false;
      if (!R.reduce(G, m, me)) return false;
      ctx.send({ md: m });
      afterChange();
      return true;
    }
    function afterChange() {
      if (ui && !canPlay()) { ui = null; discSel = []; }
      if (G.pend && G.pend.id !== payFor) { paySel = []; payFor = G.pend.id; }
      render();
      if (G.winner && !ended) {
        ended = true;
        var w = G.winner, sets = R.completeColors(G, w).map(function (c) { return COL[c].n; }).join(', ');
        ctx.end(w === me ? 'You win! 🎩' : G.names[w] + ' wins!', (w === me ? 'You' : G.names[w]) + ' completed 3 sets: ' + sets + '. No mercy!');
      }
    }

    // ---- rendering
    function pendDesc(P) {
      var s = nm(P.src);
      switch (P.type) {
        case 'breaker': return s + ' plays <b>Deal Breaker</b> to take your complete ' + COL[P.col].n + ' set!';
        case 'forceddebt': return s + ' plays <b>Forced Debt</b>: you will owe them a card from your hand next turn.';
        case 'heist': return s + ' plays <b>Heist</b> to take ' + CARDS[P.tc].v + 'M from your bank.';
        case 'crash': return s + ' plays <b>Market Crash</b> to take your ' + esc(CARDS[P.tc].n) + '.';
        case 'repo': return s + ' plays <b>Repossession</b>: you keep ONE property, they get the rest!';
        case 'supersly': return s + ' plays <b>Super Sly Deal</b> on ' + COL[P.col].n + ': every ' + COL[P.col].n + ' card you have goes to them.';
        case 'tax': return s + ' plays <b>Tax Collector</b>: you keep ONE bank card, they get the rest.';
        case 'toughluck': return s + ' plays <b>Tough Luck</b>: every ' + P.kind + ' card in your hand goes to them.';
        case 'unfair': return s + ' plays <b>Unfair Trade</b>: your banks get swapped (' + R.bankTotal(G, me) + 'M for ' + R.bankTotal(G, P.src) + 'M).';
        case 'yoink': return s + ' plays <b>Yoink!</b> You owe 10M.';
        default: return s + ' charges ' + COL[P.col].n + ' rent: you owe <b>' + P.amount + 'M</b>.';
      }
    }
    function setHtml(p, s) {
      var comp = R.isComplete(s), pick = false, C = COL[s.col];
      if (ui && p === me && ((ui.m === 'shack' && s.shack == null) || (ui.m === 'rent' && R.rentSets(G, me, ui.c).indexOf(s) >= 0))) pick = true;
      if (ui && p === opp && ui.m === 'breaker' && comp) pick = true;
      var h = '<div class="md-set' + (comp ? ' done' : '') + (pick ? ' pick' : '') + fx('s' + s.sid, p) + '" data-a="set" data-p="' + p + '" data-sid="' + s.sid + '" title="' + C.n + ': set of ' + C.size + ', rent ' + C.rent.join('/') + 'M' + (s.shack != null ? ' +5M Shack' : '') + '">' +
        '<div class="md-sh" style="background:' + C.css + ';color:' + C.fg + '"><span>' + C.n + '</span><span class="md-cnt">' + s.props.length + '/' + C.size + (comp ? ' ✓' : '') + '</span></div>';
      s.props.forEach(function (c) {
        var d = CARDS[c], cls = '';
        if (ui && ui.m === 'crash' && p === opp) cls += ' pick';
        else if (p === me && canPlay() && d.t === 'wild' && (!ui || ui.m === 'card')) cls += ' mv';
        if (ui && ui.m === 'move' && ui.c === c) cls += ' sel';
        h += '<div class="md-pc' + cls + fx(c, p + 's') + '" data-a="tc" data-p="' + p + '" data-c="' + c + '" title="' + esc(explain(c)) + '"><i style="background:' + cardBg(c) + '"></i><span>' +
          esc(d.t === 'wild' ? (d.cols ? 'Wild ' + COL[d.cols[0]].n + '/' + COL[d.cols[1]].n : 'Rainbow Wild') : d.n) + '</span><b>' + d.v + 'M</b></div>';
      });
      if (s.shack != null) h += '<div class="md-pc' + fx(s.shack, p + 's') + '" data-a="tc" data-p="' + p + '" data-c="' + s.shack + '"><i style="background:#7a5c2e"></i><span>🛖 Shack +5M</span><b>3M</b></div>';
      return h + '<div class="md-rent"><span>Rent</span><span>' + R.setRent(s) + 'M</span></div></div>';
    }
    function bankHtml(p) {
      var h = '<div class="md-bankbox"><div class="md-banktot">🏦 Bank ' + R.bankTotal(G, p) + 'M <span class="md-hint" style="color:var(--dim);font-size:12px;font-weight:500">(' + G.bank[p].length + ')</span></div><div class="md-notes">';
      G.bank[p].forEach(function (c) {
        var d = CARDS[c], cls = d.t === 'money' ? ' m' + d.v : ' mact';
        if (ui && ui.m === 'heist' && p === opp) cls += ' pick';
        h += '<div class="md-bk' + cls + fx(c, p + 'b') + '" data-a="tc" data-p="' + p + '" data-c="' + c + '" title="' + esc(d.n + ' - ' + d.v + 'M') + '">' + d.v + '</div>';
      });
      if (!G.bank[p].length) h += '<span class="md-empty" style="margin-left:-12px">Empty</span>';
      return h + '</div></div>';
    }
    function chipsHtml(p) {
      var o = R.other(p), cls = p === 'host' ? 'h' : 'g', ocls = o === 'host' ? 'h' : 'g', h = '<div class="md-chips" title="Debt chips: if you cannot pay in full you hand one over and must repay a card next turn.">';
      for (var i = 0; i < 3; i++) h += '<span class="md-chip ' + cls + (i < R.supply(G, p) ? '' : ' gone') + '">D</span>';
      if (G.owe[o]) { h += '<span style="margin-left:6px">holds</span>'; for (i = 0; i < G.owe[o]; i++) h += '<span class="md-chip ' + ocls + '">D</span>'; }
      return h + '</div>';
    }
    function zoneHtml(p) {
      var isMe = p === me, n = R.completeColors(G, p).length;
      var h = '<div class="md-zone ' + (isMe ? 'me' : 'opp') + (G.turn === p ? ' active' : '') + '"><div class="md-zh">' +
        '<div class="md-av" style="background:var(--' + p + ')">' + esc(String(G.names[p] || '?').charAt(0).toUpperCase()) + '</div>' +
        '<div class="md-who">' + nm(p) + (isMe ? ' (you)' : '') + '<small>' + n + '/3 complete sets' + (G.owe[p] ? ' · owes ' + G.owe[p] + ' card' + (G.owe[p] > 1 ? 's' : '') : '') + '</small></div>';
      if (!isMe) { h += '<div class="md-backs" title="Cards in hand">'; for (var i = 0; i < Math.min(G.hand[p].length, 14); i++) h += '<div class="md-back"></div>'; h += '</div><span class="md-hint" style="color:var(--dim)">' + G.hand[p].length + ' in hand</span>'; }
      h += '<div class="grow"></div>' + chipsHtml(p) + '</div><div class="md-zb"><div class="md-sets">' +
        (G.sets[p].length ? G.sets[p].map(function (s) { return setHtml(p, s); }).join('') : '<span class="md-empty">No properties yet</span>') + '</div>' + bankHtml(p) + '</div></div>';
      return h;
    }
    function centerHtml() {
      var top = G.disc.length ? G.disc[G.disc.length - 1] : null, mine = G.turn === me, P = G.pend, st;
      if (G.winner) st = 'Game over';
      else if (P) st = P.stage === 'pay' ? 'Waiting for ' + nm(P.tgt) + ' to pay ' + P.amount + 'M...' : P.stage === 'keep' ? 'Waiting for ' + nm(P.tgt) + ' to choose...' : 'Waiting for ' + nm(P.resp) + ' to respond...';
      else if (mine && R.mustRepay(G, me)) st = 'Repay your debt first';
      else if (mine) st = 'Play up to 3 cards, then End turn';
      else st = nm(G.turn) + ' is thinking...';
      var pips = ''; for (var i = 0; i < 3; i++) pips += '<span class="md-pip' + (i < G.plays ? ' on' : '') + '"></span>';
      return '<div class="md-center"><div class="md-piles"><div class="md-pile"><div class="stack">' + G.deck.length + '</div>Deck</div><div class="md-pile">' +
        (top != null ? cardHtml(top, ' sm' + fx(top, 'disc')) : '<div class="none"></div>') + 'Discard</div></div>' +
        '<div class="md-banner"><div class="md-turn' + (mine ? ' mine' : '') + '" data-plays="' + G.plays + '">' + (mine ? 'Your turn' : nm(G.turn) + "'s turn") + '</div>' +
        '<div class="md-pips">' + pips + '<span>' + G.plays + ' play' + (G.plays === 1 ? '' : 's') + ' left</span></div><div class="md-status">' + st + '</div></div>' +
        '<div class="md-log">' + G.log.slice(-8).map(function (e) { return '<div><em>' + e.ic + '</em><span>' + esc(e.s) + '</span></div>'; }).join('') + '</div></div>';
    }
    function helpHtml() {
      return '<div class="md-help"><h4>How to play - Monopoly Deal: No Mercy (2 players)</h4><ul>' +
        '<li><b>Goal:</b> be first to own <b>3 complete property sets of different colours</b>.</li>' +
        '<li><b>Your turn:</b> draw 2 (5 if your hand is empty), play up to <b>3 cards</b>, then discard down to 7.</li>' +
        '<li><b>Tap a card</b> to see what it can do: Bank it (money/actions), play it as property, or use the action. Valid targets glow green.</li>' +
        '<li><b>Wilds</b> on your table can be flipped for free on your turn (tap the ↔ card).</li>' +
        '<li><b>Paying:</b> you choose bank/property cards; no change is given. Cards in hand never pay. Rainbow wilds cannot pay.</li>' +
        '<li><b>Debt chips:</b> if you cannot pay in full you hand over everything payable plus a debt chip. Next turn, before anything else, give the holder one card from your hand per chip (uses a play) to get it back.</li>' +
        '<li><b>Just Say No!</b> cancels an action against you; it can be countered with another Just Say No. It cannot stop a debt chip for being unable to pay.</li>' +
        '</ul><h4>House assumptions</h4><ul>' +
        '<li>Box: 120 cards = 115 playing cards + 5 reference cards (unused). Money split 1Mx5, 2Mx4, 3Mx3, 4Mx3, 5Mx2, 10Mx1 and bank values of actions are best guesses.</li>' +
        '<li>Classic set sizes and rents. Shack: +5M rent on one set (max 1 per set, any set). An emptied set drops its Shack into its owner\'s bank.</li>' +
        '<li>Repossession / Tax Collector send everything to the only opponent. Heist needs a bank card to take, Repossession needs 2+ opponent properties, Tax Collector 2+ bank cards.</li>' +
        '<li>Tough Luck "Action" includes rent cards. Super Sly Deal takes every set of the colour plus wilds elsewhere that can be that colour.</li>' +
        '<li>Debt repayment cards are auto-placed for the receiver (property to collection, others to bank). Go Again ends your turn immediately and starts a new one.</li>' +
        '</ul></div>';
    }

    function modalHtml() {
      var P = G.pend, h, i;
      if (G.winner) return '';
      if (P && P.stage === 'jsn' && P.resp === me) {
        var n = jsnIn(me).length, counter = P.jsn > 0;
        h = '<div class="md-modal"><div class="md-box alert"><div class="big">' + (counter ? '🚫' : P.type === 'rent' ? '💰' : ACT[P.type].ic) + '</div>' +
          '<h3>' + (counter ? (P.src === me ? nm(opp) + ' said NO to your ' + R.PEND_NAME[P.type] + '!' : nm(opp) + ' says NO back!') : 'Incoming!') + '</h3><p>' + pendDesc(P) + '</p>';
        if (n) h += '<p><b>Play Just Say No?</b> You have ' + n + '.</p><button class="pink" data-a="btn" data-do="jsn">🚫 Yes, Just Say No!</button><button class="ghost" data-a="btn" data-do="accept">' + (P.jsn % 2 ? 'No, let it be cancelled' : 'No, accept') + '</button>';
        else h += '<p>You have no Just Say No card.</p><button data-a="btn" data-do="accept">OK</button>';
        return h + '</div></div>';
      }
      if (payMode()) {
        var all = R.payable(G, me), tot = R.sumVal(paySel), ok = R.validPayment(G, me, paySel, P.amount), worth = R.sumVal(all);
        h = '<div class="md-modal"><div class="md-box alert"><h3>Pay ' + P.amount + 'M</h3><p>' + pendDesc(P) + '</p>' +
          '<p>Tap cards to pay. No change is given' + (worth < P.amount ? '. <b style="color:var(--bad)">You can only cover ' + worth + 'M: select everything; you will also hand over a debt chip.</b>' : '.') + '</p>' +
          '<div style="font-weight:800;font-size:18px">Selected ' + tot + 'M / ' + P.amount + 'M</div><div class="md-meter"><i style="width:' + Math.min(100, Math.round(tot * 100 / Math.max(1, P.amount))) + '%"></i></div>';
        var bankC = all.filter(function (c) { return G.bank[me].indexOf(c) >= 0; }), tabC = all.filter(function (c) { return G.bank[me].indexOf(c) < 0; });
        [['From your bank', bankC], ['From your properties', tabC]].forEach(function (g) {
          if (!g[1].length) return;
          h += '<div class="md-optl">' + g[0] + '</div><div class="md-opts">';
          g[1].forEach(function (c) { h += '<div class="md-opt' + (paySel.indexOf(c) >= 0 ? ' sel' : '') + '" data-a="popt" data-c="' + c + '">' + (R.isAct(c, 'shack') ? cardHtml(c, ' sm') : cardHtml(c, ' sm')) + '</div>'; });
          h += '</div>';
        });
        return h + '<button data-a="btn" data-do="pay"' + (ok ? '' : ' disabled') + '>Pay ' + tot + 'M</button><button class="ghost" data-a="btn" data-do="payall">Select everything</button></div></div>';
      }
      if (P && P.stage === 'keep' && P.tgt === me) {
        var opts = P.type === 'repo' ? R.allProps(G, me) : G.bank[me];
        h = '<div class="md-modal"><div class="md-box alert"><div class="big">' + ACT[P.type].ic + '</div><h3>Choose ONE card to keep</h3><p>' + pendDesc(P) + ' Tap the card you keep; everything else goes to ' + nm(opp) + '.</p><div class="md-opts">';
        opts.forEach(function (c) { h += '<div class="md-opt" data-a="keep" data-c="' + c + '">' + cardHtml(c, ' sm') + '</div>'; });
        return h + '</div></div></div>';
      }
      if (R.mustRepay(G, me)) {
        h = '<div class="md-modal"><div class="md-box alert"><div class="big">⛓️</div><h3>Repay your debt</h3><p>' + nm(opp) + ' holds ' + G.owe[me] + ' of your debt chips. Give them one card from your hand per chip (any card, uses 1 play each) to get it back.</p><div class="md-opts">';
        G.hand[me].slice().sort(function (a, b) { return a - b; }).forEach(function (c) { h += '<div class="md-opt" data-a="repay" data-c="' + c + '">' + cardHtml(c, ' sm') + '</div>'; });
        return h + '</div></div></div>';
      }
      return '';
    }

    function colBtn(doo, col, label, dis) {
      return '<button class="md-colbtn" data-a="btn" data-do="' + doo + '" data-col="' + col + '" style="background:' + COL[col].css + '"' + (dis ? ' disabled' : '') + '>' + label + '</button>';
    }
    function promptHtml() {
      var P = G.pend;
      if (G.winner) return '<div class="md-prompt"><div class="txt"><p>Game over.</p></div></div>';
      if (P || G.turn !== me || R.mustRepay(G, me)) return '';
      var cancel = '<button class="ghost" data-a="btn" data-do="cancel">Cancel</button>';
      function bar(p, why, btns, c) {
        return '<div class="md-prompt">' + (c != null ? cardHtml(c, ' sm') : '') + '<div class="txt"><p>' + p + '</p>' + (why ? '<div class="why">' + why + '</div>' : '') + btns + '</div></div>';
      }
      if (ui && ui.m === 'disc') {
        var need = G.hand[me].length - (ui.after === 'goagain' ? 1 : 0) - 7;
        return bar('🗑️ Discard ' + need + ' card' + (need === 1 ? '' : 's') + ' (tap them in your hand) - selected ' + discSel.length + '/' + need, 'Hand limit is 7 at the end of your turn.',
          '<button data-a="btn" data-do="discok"' + (discSel.length === need ? '' : ' disabled') + '>' + (ui.after === 'goagain' ? 'Discard &amp; Go Again' : 'Discard &amp; end turn') + '</button>' + cancel);
      }
      if (ui) {
        var c = ui.c, d = CARDS[c];
        if (ui.m === 'crash') return bar('📉 Market Crash: tap any glowing property of ' + nm(opp) + '.', 'Complete sets are fair game.', cancel, c);
        if (ui.m === 'heist') return bar('🦹 Heist: tap a glowing card in ' + nm(opp) + "'s bank.", '', cancel, c);
        if (ui.m === 'breaker') return bar('🔨 Deal Breaker: tap a glowing complete set of ' + nm(opp) + '.', '', cancel, c);
        if (ui.m === 'shack') return bar('🛖 Shack: tap one of your glowing sets.', 'That set will charge +5M rent.', cancel, c);
        if (ui.m === 'rent') return bar('💰 ' + esc(d.n) + ': tap one of your glowing sets to charge for.', 'Rent shown at the bottom of each set' + (d.dbl ? ' will be doubled.' : '.'), cancel, c);
        if (ui.m === 'sly') {
          var cols = R.slyColors(G, opp), b = '';
          cols.forEach(function (col) { b += colBtn('sly', col, COL[col].n); });
          return bar('🥷 Super Sly Deal: name a colour.', 'You take every ' + nm(opp) + ' card of that colour.', b + cancel, c);
        }
        if (ui.m === 'tough') {
          return bar('🎲 Tough Luck: name a card type.', 'You take every card of that type from ' + nm(opp) + "'s hand (" + G.hand[opp].length + ' cards).',
            '<button data-a="btn" data-do="tough" data-kind="prop">🏠 Property</button><button class="alt" data-a="btn" data-do="tough" data-kind="money">💵 Money</button><button class="pink" data-a="btn" data-do="tough" data-kind="action">⚡ Action</button>' + cancel, c);
        }
        if (ui.m === 'move') {
          var cur = R.find(G, me, c).set.col, mb = '';
          R.cardCols(c).forEach(function (col) { if (col !== cur) mb += colBtn('move', col, COL[col].n); });
          return bar('↔️ Flip this wild to another colour (free).', explain(c), mb + cancel, c);
        }
        if (ui.m === 'card') {
          var can = G.plays > 0, dis = can ? '' : ' disabled', btns = '';
          if (d.t === 'money') btns = '<button data-a="btn" data-do="bank"' + dis + '>🏦 Bank it (' + d.v + 'M)</button>';
          else if (d.t === 'prop') btns = colBtn('prop', d.col, '🏠 Play as property', !can);
          else if (d.t === 'wild') R.cardCols(c).forEach(function (col) { btns += colBtn('prop', col, 'Play as ' + COL[col].n, !can); });
          else {
            var why = R.canUse(G, me, c);
            if (!(d.t === 'act' && d.a === 'jsn')) btns += '<button data-a="btn" data-do="use"' + (why ? ' disabled title="' + esc(why) + '"' : '') + '>⚡ Use ' + (d.t === 'rent' ? 'rent' : 'action') + (why ? ' (' + esc(why) + ')' : '') + '</button>';
            btns += '<button class="alt" data-a="btn" data-do="bank"' + dis + '>🏦 Bank it (' + d.v + 'M)</button>';
          }
          return bar(esc(d.n) + (can ? '' : ' - no plays left'), esc(explain(c)), btns + cancel, c);
        }
      }
      var over = G.hand[me].length > 7;
      return bar('Your turn: ' + G.plays + ' play' + (G.plays === 1 ? '' : 's') + ' left.', 'Tap a card in your hand to see what it does' + (G.sets[me].some(function (s) { return s.props.some(function (c) { return CARDS[c].t === 'wild'; }); }) ? ', or tap a ↔ wild on your table to flip it' : '') + '.',
        '<button class="' + (G.plays ? 'ghost' : '') + '" data-a="btn" data-do="end">' + (over ? 'End turn (discard ' + (G.hand[me].length - 7) + ')' : 'End turn') + '</button>');
    }

    function render() {
      if (dead) return;
      curLoc = {};
      var hand = G.hand[me].slice().sort(function (a, b) { return a - b; });
      var h = '<div class="md-top"><div class="md-title">🎩 Monopoly Deal: <span>No Mercy</span></div><button class="ghost" data-a="help">' + (helpOpen ? 'Hide rules' : '❓ How to play') + '</button></div>';
      if (helpOpen) h += helpHtml();
      h += zoneHtml(opp) + centerHtml() + zoneHtml(me);
      h += '<div class="md-low">' + promptHtml() + '<div class="md-hand">';
      hand.forEach(function (c) {
        var cls = ' hand';
        if (ui && ui.c === c && ui.m !== 'disc') cls += ' sel';
        if (ui && ui.m === 'disc' && discSel.indexOf(c) >= 0) cls += ' sel';
        var discOk = ui && ui.m === 'disc' && !(ui.after === 'goagain' && ui.c === c);
        if (!canPlay() && !discOk) cls += ' off';
        h += cardHtml(c, cls + fx(c, 'hand'), 'data-a="hand" data-c="' + c + '"');
      });
      if (!hand.length) h += '<span class="md-empty">Your hand is empty - you draw 5 next turn.</span>';
      h += '</div></div>' + modalHtml();
      var hs = box.querySelector('.md-hand'), sc = hs ? hs.scrollTop : 0;
      box.innerHTML = h;
      var hn = box.querySelector('.md-hand'); if (hn) hn.scrollTop = sc;
      var lg = box.querySelector('.md-log'); if (lg) lg.scrollTop = lg.scrollHeight;
      prevLoc = curLoc;
      autoRespond();
    }

    // No Just Say No in hand -> accept automatically after a short pause (the OK button does the same at once).
    function autoRespond() {
      var P = G.pend;
      if (!P || P.stage !== 'jsn' || P.resp !== me || jsnIn(me).length) return;
      var key = P.id + ':' + P.jsn;
      if (autoKey === key) return;
      autoKey = key;
      timers.push(setTimeout(function () {
        var Q = G.pend;
        if (dead || !Q || Q.id !== P.id || Q.jsn !== P.jsn || Q.stage !== 'jsn' || Q.resp !== me) return;
        act({ k: 'accept' });
      }, 1600));
    }

    // ---- input (event delegation; every action is re-validated by the reducer)
    function onClick(e) {
      var t = e.target.closest('[data-a]');
      if (!t || dead || !box.contains(t)) return;
      var a = t.dataset.a, c = t.dataset.c != null ? +t.dataset.c : null, p = t.dataset.p, f;
      if (a === 'help') { helpOpen = !helpOpen; render(); return; }
      if (a === 'popt') { if (payMode()) { var j = paySel.indexOf(c); if (j >= 0) paySel.splice(j, 1); else paySel.push(c); render(); } return; }
      if (a === 'keep') { act({ k: 'keep', c: c }); return; }
      if (a === 'repay') { act({ k: 'repay', c: c }); return; }
      if (a === 'btn' && !t.disabled) { // response buttons work outside your own turn
        var rd = t.dataset.do;
        if (rd === 'jsn') { var js = jsnIn(me); if (js.length) act({ k: 'jsn', c: js[0] }); return; }
        if (rd === 'accept') { act({ k: 'accept' }); return; }
        if (rd === 'payall') { if (payMode()) { paySel = R.payable(G, me); render(); } return; }
        if (rd === 'pay') { if (payMode() && act({ k: 'pay', sel: paySel.slice() })) paySel = []; return; }
      }
      if (a === 'hand') {
        if (ui && ui.m === 'disc') {
          if (ui.after === 'goagain' && ui.c === c) return;
          var need = G.hand[me].length - (ui.after === 'goagain' ? 1 : 0) - 7, k = discSel.indexOf(c);
          if (k >= 0) discSel.splice(k, 1); else if (discSel.length < need) discSel.push(c);
          render();
        } else if (canPlay()) { ui = (ui && ui.m === 'card' && ui.c === c) ? null : { m: 'card', c: c }; render(); }
        return;
      }
      if (!canPlay()) return;
      if (a === 'tc') {
        f = R.find(G, p, c);
        if (ui && ui.m === 'crash' && p === opp && f && f.kind === 'prop') { var u1 = ui; ui = null; act({ k: 'act', c: u1.c, tc: c }); render(); }
        else if (ui && ui.m === 'heist' && p === opp && f && f.kind === 'bank') { var u2 = ui; ui = null; act({ k: 'act', c: u2.c, tc: c }); render(); }
        else if ((!ui || ui.m === 'card' || ui.m === 'move') && p === me && f && f.kind === 'prop' && CARDS[c].t === 'wild') { ui = { m: 'move', c: c }; render(); }
        return;
      }
      if (a === 'set') {
        if (!ui) return;
        var s = R.getSet(G, p, +t.dataset.sid), u = ui; if (!s) return;
        if (u.m === 'breaker' && p === opp && R.isComplete(s)) { ui = null; act({ k: 'act', c: u.c, sid: s.sid }); render(); }
        else if (u.m === 'shack' && p === me && s.shack == null) { ui = null; act({ k: 'shack', c: u.c, sid: s.sid }); render(); }
        else if (u.m === 'rent' && p === me && R.rentSets(G, me, u.c).indexOf(s) >= 0) { ui = null; act({ k: 'act', c: u.c, sid: s.sid }); render(); }
        return;
      }
      if (a !== 'btn' || t.disabled) return;
      var dd = t.dataset.do;
      if (dd === 'cancel') { ui = null; discSel = []; render(); return; }
      if (dd === 'end') {
        if (G.hand[me].length > 7) { ui = { m: 'disc', after: 'end' }; discSel = []; render(); }
        else { ui = null; act({ k: 'endturn', disc: [] }); }
        return;
      }
      if (dd === 'discok') {
        var uu = ui; ui = null;
        if (uu && uu.after === 'goagain') act({ k: 'goagain', c: uu.c, disc: discSel.slice() });
        else act({ k: 'endturn', disc: discSel.slice() });
        discSel = []; render(); return;
      }
      if (!ui) return;
      var v = ui;
      if (dd === 'bank') { ui = null; act({ k: 'bank', c: v.c }); render(); }
      else if (dd === 'prop') { ui = null; act({ k: 'prop', c: v.c, col: t.dataset.col }); render(); }
      else if (dd === 'move') { ui = null; act({ k: 'move', c: v.c, col: t.dataset.col }); render(); }
      else if (dd === 'sly') { ui = null; act({ k: 'act', c: v.c, col: t.dataset.col }); render(); }
      else if (dd === 'tough') { ui = null; act({ k: 'act', c: v.c, kind: t.dataset.kind }); render(); }
      else if (dd === 'use') {
        var d = CARDS[v.c];
        if (d.t === 'rent') {
          var rs = R.rentSets(G, me, v.c);
          if (rs.length === 1) { ui = null; act({ k: 'act', c: v.c, sid: rs[0].sid }); }
          else ui = { m: 'rent', c: v.c };
        } else switch (d.a) {
          case 'passgo': ui = null; act({ k: 'passgo', c: v.c }); break;
          case 'goagain':
            if (G.hand[me].length - 1 > 7) { ui = { m: 'disc', after: 'goagain', c: v.c }; discSel = []; }
            else { ui = null; act({ k: 'goagain', c: v.c, disc: [] }); }
            break;
          case 'crash': case 'heist': case 'breaker': case 'shack': ui = { m: d.a, c: v.c }; break;
          case 'supersly': ui = { m: 'sly', c: v.c }; break;
          case 'toughluck': ui = { m: 'tough', c: v.c }; break;
          default: ui = null; act({ k: 'act', c: v.c });
        }
        render();
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
