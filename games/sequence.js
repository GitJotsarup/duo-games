/* Sequence - 2 player plugin for Duo Games */
(function () {
  'use strict';

  /* ---------- pure game logic ---------- */
  var LAYOUT = [
    'F 2S 3S 4S 5S 6S 7S 8S 9S F',
    '6C 5C 4C 3C 2C AH KH QH 10H 10S',
    '7C AS 2D 3D 4D 5D 6D 7D 9H QS',
    '8C KS 6C 5C 4C 3C 2C 8D 8H KS',
    '9C QS 7C 6H 5H 4H AH 9D 7H AS',
    '10C 10S 8C 7H 2H 3H KH 10D 6H 2D',
    'QC 9S 9C 8H 9H 10H QH QD 5H 3D',
    'KC 8S 10C QC KC AC AD KD 4H 4D',
    'AC 7S 6S 5S 4S 3S 2S 2H 3H 5D',
    'F AD KD QD 10D 9D 8D 7D 6D F'
  ];
  var BOARD = [];
  LAYOUT.forEach(function (row) { row.split(' ').forEach(function (c) { BOARD.push(c); }); });
  var RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  var SUITS = ['S', 'H', 'D', 'C'];
  var SYM = { S: '♠', H: '♥', D: '♦', C: '♣' };

  function fullDeck() {
    var d = [];
    for (var k = 0; k < 2; k++) SUITS.forEach(function (s) { RANKS.forEach(function (r) { d.push(r + s); }); });
    return d;
  }
  function isCorner(i) { return BOARD[i] === 'F'; }
  function isTwoEyed(c) { return c === 'JD' || c === 'JC'; }
  function isOneEyed(c) { return c === 'JH' || c === 'JS'; }
  function isJack(c) { return c[0] === 'J'; }
  function other(p) { return p === 'host' ? 'guest' : 'host'; }
  function cellsFor(card) {
    var r = [];
    for (var i = 0; i < 100; i++) if (BOARD[i] === card) r.push(i);
    return r;
  }

  var WINDOWS = (function () {
    var w = [], dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (var r = 0; r < 10; r++) for (var c = 0; c < 10; c++) dirs.forEach(function (d) {
      var er = r + 4 * d[0], ec = c + 4 * d[1];
      if (er < 0 || er > 9 || ec < 0 || ec > 9) return;
      var cells = [];
      for (var k = 0; k < 5; k++) cells.push((r + k * d[0]) * 10 + c + k * d[1]);
      w.push(cells);
    });
    return w;
  })();

  /* new sequences for player p created by a chip at idx; seqs = existing [{p,cells}] */
  function findNewSeqs(chips, seqs, p, idx) {
    var out = [];
    var mine = seqs.filter(function (s) { return s.p === p; }).map(function (s) { return s.cells; });
    WINDOWS.forEach(function (w) {
      if (w.indexOf(idx) < 0) return;
      for (var k = 0; k < 5; k++) if (!(chips[w[k]] === p || isCorner(w[k]))) return;
      for (var j = 0; j < mine.length; j++) {
        var sh = 0;
        for (var m = 0; m < 5; m++) if (mine[j].indexOf(w[m]) >= 0) sh++;
        if (sh > 1) return;
      }
      mine.push(w);
      out.push({ p: p, cells: w.slice() });
    });
    return out;
  }
  function lockedSet(seqs) {
    var s = {};
    seqs.forEach(function (q) { q.cells.forEach(function (i) { s[i] = true; }); });
    return s;
  }
  function seqCount(st, p) { return st.seqs.filter(function (s) { return s.p === p; }).length; }

  function newState(deck) {
    return {
      deck: deck, ptr: 14,
      hands: { host: deck.slice(0, 7), guest: deck.slice(7, 14) },
      chips: new Array(100).fill(null), seqs: [], turn: 'host',
      deadUsed: false, winner: null, last: null, passes: 0, drawn: false
    };
  }
  function isDead(st, card) {
    if (isJack(card)) return false;
    var cs = cellsFor(card);
    return cs.length > 0 && cs.every(function (i) { return st.chips[i]; });
  }
  /* returns error string or null */
  function checkPlay(st, who, card, idx) {
    if (st.winner || st.drawn) return 'game over';
    if (st.turn !== who) return 'not your turn';
    if (st.hands[who].indexOf(card) < 0) return 'card not in hand';
    if (!(idx >= 0 && idx < 100 && idx % 1 === 0)) return 'bad cell';
    if (isCorner(idx)) return 'corner';
    if (isTwoEyed(card)) return st.chips[idx] ? 'occupied' : null;
    if (isOneEyed(card)) {
      if (!st.chips[idx] || st.chips[idx] === who) return 'no enemy chip';
      if (lockedSet(st.seqs)[idx]) return 'locked';
      return null;
    }
    if (BOARD[idx] !== card) return 'wrong space';
    if (st.chips[idx]) return 'occupied';
    return null;
  }
  function draw(st, who) {
    if (st.ptr < st.deck.length) st.hands[who].push(st.deck[st.ptr++]);
  }
  function removeCard(st, who, card) {
    st.hands[who].splice(st.hands[who].indexOf(card), 1);
  }
  function applyPlay(st, who, card, idx) {
    var err = checkPlay(st, who, card, idx);
    if (err) return { ok: false, err: err };
    var res = { ok: true, removed: false, newSeqs: [] };
    removeCard(st, who, card);
    if (isOneEyed(card)) { st.chips[idx] = null; res.removed = true; }
    else {
      st.chips[idx] = who;
      res.newSeqs = findNewSeqs(st.chips, st.seqs, who, idx);
      res.newSeqs.forEach(function (s) { st.seqs.push(s); });
    }
    draw(st, who);
    st.last = { who: who, card: card, idx: idx, removed: res.removed, dead: false };
    st.passes = 0;
    if (seqCount(st, who) >= 2) st.winner = who;
    st.turn = other(who);
    st.deadUsed = false;
    return res;
  }
  function applyDead(st, who, card) {
    if (st.winner || st.drawn) return { ok: false, err: 'game over' };
    if (st.turn !== who) return { ok: false, err: 'not your turn' };
    if (st.deadUsed) return { ok: false, err: 'already swapped' };
    if (st.hands[who].indexOf(card) < 0) return { ok: false, err: 'card not in hand' };
    if (!isDead(st, card)) return { ok: false, err: 'not dead' };
    removeCard(st, who, card);
    draw(st, who);
    st.deadUsed = true;
    st.passes = 0;
    st.last = { who: who, card: card, idx: -1, removed: false, dead: true };
    return { ok: true };
  }

  /* true if who has any legal play or an available dead-card swap */
  function hasMove(st, who) {
    if (st.winner || st.drawn || st.turn !== who) return false;
    var hand = st.hands[who];
    for (var k = 0; k < hand.length; k++) {
      if (!st.deadUsed && isDead(st, hand[k])) return true;
      for (var i = 0; i < 100; i++) if (!checkPlay(st, who, hand[k], i)) return true;
    }
    return false;
  }
  function applyPass(st, who) {
    if (st.winner || st.drawn) return { ok: false, err: 'game over' };
    if (st.turn !== who) return { ok: false, err: 'not your turn' };
    if (hasMove(st, who)) return { ok: false, err: 'you have a move' };
    st.passes++;
    st.last = { who: who, card: '', idx: -1, removed: false, dead: false, pass: true };
    if (st.passes >= 2) st.drawn = true;
    st.turn = other(who);
    st.deadUsed = false;
    return { ok: true };
  }

  /* ---------- UI ---------- */
  var CSS = [
    '.sq{max-width:580px;margin:0 auto}',
    '.sq-bar{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px;font-weight:700}',
    '.sq-turn{padding:4px 12px;border-radius:12px;color:#10102a}',
    '.sq-info{color:var(--dim);font-size:.85rem;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:6px}',
    '.sq-board{display:grid;grid-template-columns:repeat(10,1fr);gap:1px;background:#3a3a1a;padding:2px;border-radius:8px;width:100%}',
    '.sq-c{position:relative;aspect-ratio:1;background:#f1ead4;color:#111;display:flex;flex-direction:column;align-items:center;justify-content:center;font:700 clamp(8px,2vw,15px)/1 system-ui,sans-serif;cursor:pointer;user-select:none;border-radius:2px;min-width:0;overflow:hidden}',
    '.sq-c.r{color:#c0102a}',
    '.sq-c.f{background:#d9c46a;color:#4a3a00}',
    '.sq-c .s{font-size:1.1em}',
    '.sq-chip{position:absolute;inset:14%;border-radius:50%;border:2px solid #0006;box-shadow:inset 0 0 0 2px #fff5}',
    '.sq-chip.host{background:var(--host)}.sq-chip.guest{background:var(--guest)}',
    '.sq-c.seq .sq-chip{box-shadow:0 0 0 2px var(--gold),0 0 6px 2px var(--gold);border-color:var(--gold)}',
    '.sq-c.hl{outline:3px solid var(--good);outline-offset:-3px;animation:sqp 1s infinite}',
    '.sq-c.hlx{outline:3px solid var(--bad);outline-offset:-3px;animation:sqp 1s infinite}',
    '.sq-c.last{box-shadow:inset 0 0 0 3px #7a5cff}',
    '@keyframes sqp{50%{filter:brightness(.8)}}',
    '.sq-hand{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0;justify-content:center}',
    '.sq-h{background:#f1ead4;color:#111;border-radius:8px;min-width:46px;padding:8px 6px;margin:0;font:800 1.05rem system-ui;text-align:center;border:3px solid transparent;cursor:pointer}',
    '.sq-h.r{color:#c0102a}',
    '.sq-h.sel{border-color:var(--gold);transform:translateY(-4px)}',
    '.sq-h.dead{opacity:.55;background:#bbb}',
    '.sq-h small{display:block;font-size:.55rem;font-weight:600;color:#555}',
    '.sq-last{min-height:1.3em;color:var(--dim);font-size:.9rem;text-align:center}'
  ].join('');

  function cardLabel(c) {
    var s = c[c.length - 1];
    return c.slice(0, -1) + SYM[s];
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function start(ctx) {
    var st = newState(ctx.shuffle(fullDeck()));
    var me = ctx.me, opp = other(me);
    var sel = null, ended = false, destroyed = false;
    var root = ctx.root;
    var styleEl = document.createElement('style');
    styleEl.textContent = CSS;
    root.appendChild(styleEl);
    var wrap = document.createElement('div');
    wrap.className = 'sq';
    root.appendChild(wrap);

    function nm(p) { return esc(ctx.names[p] || p); }
    function describeLast() {
      var l = st.last;
      if (!l) return 'Host goes first.';
      var who = l.who === me ? 'You' : esc(ctx.names[l.who]);
      if (l.pass) return who + ' passed (no legal move).';
      if (l.dead) return who + ' swapped a dead ' + cardLabel(l.card) + '.';
      if (l.removed) return who + ' removed a chip with ' + cardLabel(l.card) + '.';
      return who + ' played ' + cardLabel(l.card) + '.';
    }
    function targets() {
      var t = [];
      if (!sel || st.turn !== me || st.winner) return { cells: t, kind: '' };
      for (var i = 0; i < 100; i++) if (!checkPlay(st, me, sel, i)) t.push(i);
      return { cells: t, kind: isOneEyed(sel) ? 'x' : 'o' };
    }

    function render() {
      if (destroyed) return;
      var myTurn = st.turn === me && !st.winner;
      var lock = lockedSet(st.seqs);
      var tg = targets(), tset = {};
      tg.cells.forEach(function (i) { tset[i] = true; });
      var h = '<div class="sq-bar"><span class="sq-turn" style="background:' +
        (st.turn === 'host' ? 'var(--host)' : 'var(--guest)') + '">' +
        (st.winner || st.drawn ? 'Game over' : myTurn ? 'Your turn' : nm(st.turn) + "'s turn") + '</span>' +
        '<span><b style="color:var(--host)">' + nm('host') + ' ' + seqCount(st, 'host') + '/2</b> &middot; ' +
        '<b style="color:var(--guest)">' + nm('guest') + ' ' + seqCount(st, 'guest') + '/2</b></span></div>';
      h += '<div class="sq-info"><span>Deck: ' + (st.deck.length - st.ptr) + '</span><span>' + nm(opp) + ' holds ' + st.hands[opp].length + ' cards</span></div>';
      h += '<div class="sq-board">';
      for (var i = 0; i < 100; i++) {
        var b = BOARD[i], cls = 'sq-c';
        if (b === 'F') cls += ' f';
        else if (b[b.length - 1] === 'H' || b[b.length - 1] === 'D') cls += ' r';
        if (lock[i]) cls += ' seq';
        if (tset[i]) cls += tg.kind === 'x' ? ' hlx' : ' hl';
        if (st.last && st.last.idx === i) cls += ' last';
        h += '<div class="' + cls + '" data-i="' + i + '">' +
          (b === 'F' ? '<span>★</span>' : '<span>' + esc(b.slice(0, -1)) + '</span><span class="s">' + SYM[b[b.length - 1]] + '</span>') +
          (st.chips[i] ? '<div class="sq-chip ' + st.chips[i] + '"></div>' : '') + '</div>';
      }
      h += '</div><div class="sq-last">' + describeLast() + '</div><div class="sq-hand">';
      st.hands[me].forEach(function (c) {
        var cls = 'sq-h';
        var red = c[c.length - 1] === 'H' || c[c.length - 1] === 'D';
        if (red) cls += ' r';
        if (sel === c) cls += ' sel';
        var dead = isDead(st, c);
        if (dead) cls += ' dead';
        var tag = dead ? 'dead' : isTwoEyed(c) ? 'wild' : isOneEyed(c) ? 'remove' : '';
        h += '<button class="' + cls + '" data-card="' + c + '">' + cardLabel(c) + '<small>' + tag + '</small></button>';
      });
      h += '</div>';
      if (myTurn) h += '<button class="big ghost" data-act="pass"' + (hasMove(st, me) ? ' disabled' : '') + '>Pass turn (no legal move)</button>';
      if (myTurn && sel && isDead(st, sel) && !st.deadUsed) h += '<button class="big alt" data-act="dead">Swap dead card</button>';
      else if (myTurn && !sel) h += '<p class="tip" style="text-align:center">Tap a card, then a highlighted space.</p>';
      else if (myTurn && sel && !tg.cells.length) h += '<p class="tip" style="text-align:center">No legal space for that card.</p>';
      wrap.innerHTML = h;
    }

    function checkEnd() {
      if (st.drawn && !ended) { ended = true; ctx.end('Draw', 'Neither player has a legal move.'); return; }
      if (st.winner && !ended) {
        ended = true;
        if (st.winner === me) ctx.end('You win! 🎉', 'You completed 2 sequences.');
        else ctx.end('You lose', ctx.names[st.winner] + ' completed 2 sequences.');
      }
    }

    function onClick(e) {
      if (destroyed || ended) return;
      var t = e.target;
      var el = t.closest ? t.closest('[data-card],[data-act],[data-i]') : null;
      if (!el || !wrap.contains(el)) return;
      var myTurn = st.turn === me && !st.winner && !st.drawn;
      if (el.hasAttribute('data-card')) {
        var c = el.getAttribute('data-card');
        sel = sel === c ? null : c;
        render();
      } else if (el.getAttribute('data-act') === 'pass') {
        if (!myTurn) return;
        var pr = applyPass(st, me);
        if (!pr.ok) { ctx.toast('Cannot pass: ' + pr.err); return; }
        ctx.send({ k: 'pass' });
        sel = null;
        render();
        checkEnd();
      } else if (el.getAttribute('data-act') === 'dead') {
        if (!myTurn || !sel) return;
        var card = sel;
        var r = applyDead(st, me, card);
        if (!r.ok) { ctx.toast('Cannot swap: ' + r.err); return; }
        ctx.send({ k: 'dead', card: card });
        sel = null;
        render();
      } else if (el.hasAttribute('data-i')) {
        if (!myTurn) { if (!st.winner) ctx.toast('Not your turn'); return; }
        if (!sel) { ctx.toast('Pick a card first'); return; }
        var idx = +el.getAttribute('data-i');
        var card2 = sel;
        var res = applyPlay(st, me, card2, idx);
        if (!res.ok) { ctx.toast('Illegal move: ' + res.err); return; }
        ctx.send({ k: 'play', card: card2, r: Math.floor(idx / 10), c: idx % 10 });
        sel = null;
        render();
        checkEnd();
      }
    }
    wrap.addEventListener('click', onClick);

    render();
    return {
      onMsg: function (d) {
        if (destroyed || ended || !d) return;
        var r;
        if (d.k === 'play') {
          if (typeof d.card !== 'string' || !(d.r >= 0 && d.r < 10 && d.c >= 0 && d.c < 10) || d.r % 1 || d.c % 1) return;
          r = applyPlay(st, opp, d.card, d.r * 10 + d.c);
        } else if (d.k === 'dead') {
          if (typeof d.card !== 'string') return;
          r = applyDead(st, opp, d.card);
        } else if (d.k === 'pass') {
          r = applyPass(st, opp);
        } else return;
        if (!r.ok) return;
        if (sel && st.hands[me].indexOf(sel) < 0) sel = null;
        render();
        checkEnd();
      },
      destroy: function () {
        destroyed = true;
        wrap.removeEventListener('click', onClick);
        root.innerHTML = '';
      }
    };
  }

  registerGame({
    id: 'sequence', icon: '🃏', name: 'Sequence',
    blurb: 'Place chips on the board to make 2 rows of 5. Jacks are wild or cut-throat.',
    start: start,
    _t: { BOARD: BOARD, WINDOWS: WINDOWS, fullDeck: fullDeck, newState: newState, checkPlay: checkPlay,
      applyPlay: applyPlay, applyDead: applyDead, applyPass: applyPass, hasMove: hasMove, findNewSeqs: findNewSeqs, isDead: isDead, seqCount: seqCount }
  });
})();
