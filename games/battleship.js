/* Battleship plugin for Duo Games. Plain browser JS, no deps. */
(function () {
  'use strict';
  var N = 10;
  var SHIPS = [
    { name: 'Carrier', len: 5 },
    { name: 'Battleship', len: 4 },
    { name: 'Cruiser', len: 3 },
    { name: 'Submarine', len: 3 },
    { name: 'Destroyer', len: 2 }
  ];

  /* ---------- pure logic ---------- */
  function shipCells(r, c, len, horiz) {
    var out = [];
    for (var i = 0; i < len; i++) out.push(horiz ? [r, c + i] : [r + i, c]);
    return out;
  }
  // fleet: array (indexed like SHIPS) of null | {name,len,cells}
  function occupancy(fleet, ignoreIdx) {
    var g = [];
    for (var r = 0; r < N; r++) { g.push([]); for (var c = 0; c < N; c++) g[r].push(-1); }
    fleet.forEach(function (s, i) {
      if (!s || i === ignoreIdx) return;
      s.cells.forEach(function (p) { g[p[0]][p[1]] = i; });
    });
    return g;
  }
  function canPlace(fleet, idx, r, c, horiz) {
    var len = SHIPS[idx].len;
    var cells = shipCells(r, c, len, horiz);
    var occ = occupancy(fleet, idx);
    for (var i = 0; i < cells.length; i++) {
      var p = cells[i];
      if (p[0] < 0 || p[1] < 0 || p[0] >= N || p[1] >= N) return false;
      if (occ[p[0]][p[1]] !== -1) return false;
    }
    return true;
  }
  function place(fleet, idx, r, c, horiz) {
    if (!canPlace(fleet, idx, r, c, horiz)) return false;
    fleet[idx] = { name: SHIPS[idx].name, len: SHIPS[idx].len, cells: shipCells(r, c, SHIPS[idx].len, horiz) };
    return true;
  }
  function randomFleet(rnd) {
    rnd = rnd || Math.random;
    for (var attempt = 0; attempt < 1000; attempt++) {
      var fleet = SHIPS.map(function () { return null; });
      var ok = true;
      for (var i = 0; i < SHIPS.length && ok; i++) {
        var done = false;
        for (var t = 0; t < 200 && !done; t++) {
          var h = rnd() < 0.5;
          var r = Math.floor(rnd() * N), c = Math.floor(rnd() * N);
          done = place(fleet, i, r, c, h);
        }
        ok = done;
      }
      if (ok) return fleet;
    }
    throw new Error('could not place fleet');
  }
  function emptyGrid() {
    var g = [];
    for (var r = 0; r < N; r++) { g.push([]); for (var c = 0; c < N; c++) g[r].push(0); }
    return g;
  }
  // inc: grid 0 none, 1 miss, 2 hit. Returns null if already fired / out of range.
  function resolveShot(fleet, inc, r, c) {
    if (!(r >= 0 && r < N && c >= 0 && c < N) || r % 1 || c % 1) return null;
    if (inc[r][c]) return null;
    var hitShip = null;
    fleet.forEach(function (s) {
      if (s && s.cells.some(function (p) { return p[0] === r && p[1] === c; })) hitShip = s;
    });
    if (!hitShip) { inc[r][c] = 1; return { hit: false, sunk: null }; }
    inc[r][c] = 2;
    var dead = hitShip.cells.every(function (p) { return inc[p[0]][p[1]] === 2; });
    return { hit: true, sunk: dead ? { name: hitShip.name, cells: hitShip.cells.map(function (p) { return [p[0], p[1]]; }) } : null };
  }
  function nextTurn(shooter, opp, hit) { return hit ? shooter : opp; }
  function allSunk(fleet, inc) {
    return fleet.every(function (s) { return s && s.cells.every(function (p) { return inc[p[0]][p[1]] === 2; }); });
  }

  var logic = { N: N, SHIPS: SHIPS, shipCells: shipCells, canPlace: canPlace, place: place, randomFleet: randomFleet, emptyGrid: emptyGrid, resolveShot: resolveShot, nextTurn: nextTurn, allSunk: allSunk };
  if (typeof module !== 'undefined' && module.exports) module.exports = logic;
  if (typeof registerGame !== 'function') return;

  /* ---------- UI ---------- */
  var CSS = [
    '.bs{max-width:900px;margin:0 auto;padding:12px 12px 28px}',
    '.bs h3{margin:.2em 0}',
    '.bs .status{font-weight:800;text-align:center;padding:10px;border-radius:12px;background:var(--card);margin:8px 0}',
    '.bs .status.mine{background:var(--good);color:#10102a}',
    '.bs .status.theirs{background:#2d2d55}',
    '.bs .log{text-align:center;color:var(--gold);min-height:1.4em;margin:6px 0;font-weight:600}',
    '.bs .stats{display:flex;justify-content:space-between;color:var(--dim);font-size:.9rem;margin:4px 2px}',
    '.bs .grid{max-width:400px;margin:0 auto;display:grid;grid-template-columns:repeat(10,1fr);gap:2px;background:#0a3a63;padding:3px;border-radius:10px;width:100%;touch-action:manipulation;user-select:none}',
    '.bs .cell{position:relative;aspect-ratio:1;min-width:0;padding:0;margin:0;border-radius:4px;background:#2a8fd6;border:0;display:block;font-size:0}',
    '.bs .cell.sea{background:#2a8fd6}',
    '.bs .cell.ship{background:#8a929c;box-shadow:inset 0 0 0 2px #6b727b}',
    '.bs .cell.prev{background:#4cd964;opacity:.85}',
    '.bs .cell.bad{background:var(--bad);opacity:.7}',
    '.bs .cell.miss::after{content:"";position:absolute;inset:32%;border-radius:50%;background:#fff}',
    '.bs .cell.hit{background:#e5383b}',
    '.bs .cell.hit::after{content:"";position:absolute;inset:28%;border-radius:50%;background:#ffd93d;box-shadow:0 0 6px #ff9500}',
    '.bs .cell.sunk{background:#7a1d1f;box-shadow:inset 0 0 0 2px #000}',
    '.bs .cell.sunk::after{background:#555;box-shadow:none}',
    '.bs .cell.fire{cursor:pointer}',
    '.bs .cell.fire:active{filter:brightness(1.3)}',
    '.bs .boards{display:flex;flex-wrap:wrap;gap:20px;justify-content:center}',
    '.bs .bcol{flex:1 1 340px;max-width:400px;min-width:0}',
    '.bs .pl{max-width:440px;margin:0 auto}',
    '.bs .own .cell{border-radius:3px}',
    '.bs .tray{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}',
    '.bs .tray button{flex:1 1 40%;min-height:44px;margin:0;text-align:left;background:#2d2d55;color:var(--ink);border:2px solid transparent}',
    '.bs .tray button.sel{border-color:var(--gold)}',
    '.bs .tray button.done{border-color:var(--good)}',
    '.bs .tray small{display:block;font-weight:400;color:var(--dim)}',
    '.bs .acts{display:flex;gap:8px;flex-wrap:wrap}',
    '.bs .acts button{flex:1 1 30%;min-height:44px;margin:0}',
    '.bs .lab{display:flex;justify-content:space-between;align-items:baseline;margin:10px 2px 4px}'
  ].join('\n');

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function buildGrid(onTap) {
    var g = el('div', 'grid'), cells = [];
    for (var r = 0; r < N; r++) {
      cells.push([]);
      for (var c = 0; c < N; c++) {
        var b = el('button', 'cell sea');
        b.type = 'button';
        b.setAttribute('aria-label', String.fromCharCode(65 + c) + (r + 1));
        if (onTap) (function (rr, cc) { b.onclick = function () { onTap(rr, cc); }; })(r, c);
        g.appendChild(b);
        cells[r].push(b);
      }
    }
    return { el: g, cells: cells };
  }

  registerGame({
    id: 'battleship', icon: '🚢', name: 'Battleship',
    blurb: 'Hide your fleet, sink theirs. Classic 10x10 naval duel.',
    start: function (ctx) {
      var root = ctx.root;
      var oppKey = ctx.isHost ? 'guest' : 'host';
      var oppName = (ctx.names && ctx.names[oppKey]) || 'Opponent';
      var style = el('style'); style.textContent = CSS; root.appendChild(style);
      var wrap = el('div', 'bs'); root.appendChild(wrap);

      var destroyed = false, ended = false;
      var phase = 'place'; // place | battle | over
      var fleet = SHIPS.map(function () { return null; });
      var sel = 0, horiz = true;
      var myReady = false, oppReady = false;
      var inc = emptyGrid();            // shots received on my board
      var out = emptyGrid();            // my shots: 1 miss, 2 hit, 3 sunk
      var turn = 'host';
      var waiting = false;              // my shot in flight
      var shots = 0, hits = 0, logMsg = '';
      var ui = {};

      function finish(title, text) {
        if (ended || destroyed) return;
        ended = true; phase = 'over'; waiting = true;
        refreshBattle();
        ctx.end(title, text);
      }

      /* ----- placement ----- */
      function firstFree() {
        for (var i = 0; i < SHIPS.length; i++) if (!fleet[i]) return i;
        return -1;
      }
      function onPlaceTap(r, c) {
        if (myReady) return;
        var occ = occupancy(fleet, -1);
        if (sel < 0 || (sel >= 0 && fleet[sel])) {
          // nothing to place: tapping a ship picks it up
          if (occ[r][c] !== -1) { sel = occ[r][c]; fleet[sel] = null; renderPlace(); }
          else ctx.toast('Pick a ship from the list first');
          return;
        }
        var rr = r, cc = c;
        if (horiz) cc = Math.min(cc, N - SHIPS[sel].len); else rr = Math.min(rr, N - SHIPS[sel].len);
        if (!place(fleet, sel, rr, cc, horiz)) { ctx.toast("Ships can't overlap"); return; }
        sel = firstFree();
        renderPlace();
      }
      function renderPlace() {
        var occ = occupancy(fleet, -1);
        for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
          ui.cells[r][c].className = 'cell ' + (occ[r][c] !== -1 ? 'ship' : 'sea');
        }
        ui.tray.forEach(function (b, i) {
          b.className = (i === sel ? 'sel ' : '') + (fleet[i] ? 'done' : '');
          b.disabled = myReady;
        });
        var all = firstFree() === -1;
        ui.ready.disabled = !all || myReady;
        ui.rot.disabled = myReady;
        ui.rand.disabled = myReady;
        ui.rot.textContent = 'Rotate (' + (horiz ? 'horizontal' : 'vertical') + ')';
        ui.ready.textContent = myReady ? 'Waiting for ' + oppName + '...' : 'Ready!';
        ui.hint.textContent = myReady ? 'Fleet locked in. Waiting for ' + oppName + ' to finish placing.'
          : all ? 'Fleet placed. Tap a ship (list or board) to move it, or press Ready.'
          : sel >= 0 ? 'Tap a cell to place the ' + SHIPS[sel].name + ' (' + SHIPS[sel].len + ').' : 'Pick a ship.';
      }
      function buildPlace() {
        wrap.innerHTML = '';
        var pl = el('div', 'pl'); wrap.appendChild(pl);
        var wrap0 = wrap; wrap = pl;
        wrap.appendChild(el('h3', null, 'Place your fleet'));
        ui.hint = el('div', 'tip');
        wrap.appendChild(ui.hint);
        ui.tray = [];
        var tray = el('div', 'tray');
        SHIPS.forEach(function (s, i) {
          var b = el('button');
          b.type = 'button';
          b.innerHTML = '';
          b.appendChild(document.createTextNode(s.name));
          b.appendChild(el('small', null, '■'.repeat(s.len)));
          b.onclick = function () {
            if (myReady) return;
            if (fleet[i]) fleet[i] = null;
            sel = i; renderPlace();
          };
          tray.appendChild(b); ui.tray.push(b);
        });
        wrap.appendChild(tray);
        var g = buildGrid(onPlaceTap);
        ui.cells = g.cells; wrap.appendChild(g.el);
        var acts = el('div', 'acts');
        ui.rot = el('button', 'alt'); ui.rot.type = 'button';
        ui.rot.onclick = function () { horiz = !horiz; renderPlace(); };
        ui.rand = el('button', 'ghost', 'Randomize'); ui.rand.type = 'button';
        ui.rand.onclick = function () { fleet = randomFleet(Math.random); sel = -1; renderPlace(); };
        acts.appendChild(ui.rot); acts.appendChild(ui.rand);
        wrap.appendChild(acts);
        ui.ready = el('button', 'big pink'); ui.ready.type = 'button';
        ui.ready.onclick = function () {
          if (myReady || firstFree() !== -1) return;
          myReady = true;
          ctx.send({ k: 'ready' });
          renderPlace();
          maybeStart();
        };
        wrap.appendChild(ui.ready);
        wrap = wrap0;
        renderPlace();
      }
      function maybeStart() {
        if (phase === 'place' && myReady && oppReady) {
          phase = 'battle'; turn = 'host'; wrap.innerHTML = ''; buildBattle();
        }
      }

      /* ----- battle ----- */
      function myTurn() { return phase === 'battle' && turn === ctx.me && !waiting; }
      function fireAt(r, c) {
        if (!myTurn() || out[r][c]) return;
        waiting = true;
        shots++;
        refreshBattle();
        ctx.send({ k: 'fire', r: r, c: c });
      }
      function refreshBattle() {
        if (!ui.enemy) return;
        var mine = myTurn();
        for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
          var o = out[r][c], e = ui.enemy[r][c];
          e.className = 'cell ' + (o === 3 ? 'hit sunk' : o === 2 ? 'hit' : o === 1 ? 'miss' : 'sea') + (mine && !o ? ' fire' : '');
          var i = inc[r][c], m = ui.own[r][c];
          var sunkCell = i === 2 && ownSunk[r + ',' + c];
          m.className = 'cell ' + (i === 2 ? 'hit' + (sunkCell ? ' sunk' : '') : i === 1 ? 'miss' : ownOcc[r][c] !== -1 ? 'ship' : 'sea');
        }
        if (phase === 'over') {
          ui.status.className = 'status theirs';
          ui.status.textContent = 'Game over';
        } else if (mine) {
          ui.status.className = 'status mine';
          ui.status.textContent = (lastHit ? 'Hit! Fire again' : 'Your turn') + ' - tap enemy waters to fire!';
        } else {
          ui.status.className = 'status theirs';
          ui.status.textContent = waiting && turn === ctx.me ? 'Shot fired...' : oppName + "'s turn...";
        }
        ui.log.textContent = logMsg;
        ui.stats.textContent = 'Shots: ' + shots + '  |  Hits: ' + hits + (shots ? ' (' + Math.round(hits * 100 / shots) + '%)' : '');
        ui.left.textContent = 'Your ships afloat: ' + fleet.filter(function (s) { return !s.cells.every(function (p) { return inc[p[0]][p[1]] === 2; }); }).length + '/' + SHIPS.length;
      }
      var lastHit = false, ownOcc = null, ownSunk = {};
      function buildBattle() {
        ownOcc = occupancy(fleet, -1); ownSunk = {};
        wrap.innerHTML = '';
        ui.status = el('div', 'status'); wrap.appendChild(ui.status);
        ui.log = el('div', 'log'); wrap.appendChild(ui.log);
        var boards = el('div', 'boards'); wrap.appendChild(boards);
        var col1 = el('div', 'bcol'), col2 = el('div', 'bcol'); boards.appendChild(col1); boards.appendChild(col2);
        var lab = el('div', 'lab'); lab.appendChild(el('b', null, "Enemy waters (" + oppName + ")"));
        ui.stats = el('span', 'tip'); lab.appendChild(ui.stats); col1.appendChild(lab);
        var eg = buildGrid(fireAt); ui.enemy = eg.cells; col1.appendChild(eg.el);
        var lab2 = el('div', 'lab'); lab2.appendChild(el('b', null, 'Your fleet'));
        ui.left = el('span', 'tip'); lab2.appendChild(ui.left); col2.appendChild(lab2);
        var og = buildGrid(null); 
        og.el.querySelectorAll('button').forEach(function (b) { b.disabled = true; b.style.opacity = 1; });
        ui.own = og.cells; col2.appendChild(og.el);
        logMsg = ctx.isHost ? 'Battle begins - you fire first!' : 'Battle begins - ' + oppName + ' fires first.';
        refreshBattle();
      }

      function onFire(d) {
        if (phase !== 'battle' || turn !== oppKey) return;
        var r = d.r, c = d.c;
        var res = resolveShot(fleet, inc, r, c);
        if (!res) return; // invalid or duplicate: ignore
        var over = allSunk(fleet, inc);
        if (res.sunk) res.sunk.cells.forEach(function (p) { ownSunk[p[0] + ',' + p[1]] = true; });
        var coord = String.fromCharCode(65 + c) + (r + 1);
        logMsg = res.sunk ? oppName + ' sank your ' + res.sunk.name + ' and fires again!' : res.hit ? oppName + ' hit your ship at ' + coord + ' and fires again!' : oppName + ' missed at ' + coord + '.';
        var msg = { k: 'res', r: r, c: c, hit: res.hit, sunk: res.sunk };
        if (over) msg.over = true;
        ctx.send(msg);
        turn = nextTurn(oppKey, ctx.me, res.hit);
        refreshBattle();
        if (over) finish('You lose', oppName + ' sank your whole fleet.');
      }
      function onRes(d) {
        if (phase !== 'battle' || !waiting || turn !== ctx.me) return;
        var r = d.r, c = d.c;
        if (!(r >= 0 && r < N && c >= 0 && c < N)) return;
        waiting = false;
        out[r][c] = d.hit ? 2 : 1;
        if (d.hit) hits++;
        var coord = String.fromCharCode(65 + c) + (r + 1);
        if (d.sunk) {
          d.sunk.cells.forEach(function (p) { out[p[0]][p[1]] = 3; });
          logMsg = 'You sank their ' + d.sunk.name + '! Fire again.';
        } else logMsg = d.hit ? 'Hit at ' + coord + '! Fire again.' : 'Miss at ' + coord + '.';
        lastHit = !!d.hit;
        turn = nextTurn(ctx.me, oppKey, d.hit);
        refreshBattle();
        if (d.over) finish('You win! 🎉', 'You sank ' + oppName + "'s entire fleet in " + shots + ' shots.');
      }

      buildPlace();

      return {
        onMsg: function (d) {
          if (destroyed || !d) return;
          if (d.k === 'ready') { oppReady = true; maybeStart(); }
          else if (d.k === 'fire') onFire(d);
          else if (d.k === 'res') onRes(d);
        },
        destroy: function () { destroyed = true; root.innerHTML = ''; }
      };
    }
  });
})();
