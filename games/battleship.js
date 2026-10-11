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
  var CSS = `
.bs{--acc:#3aa0ff;max-width:940px;margin:0 auto;padding:10px 6px 28px;font-family:var(--font,inherit)}
.bs h3{margin:.2em 0 .1em;font-size:1.5rem;font-weight:800;letter-spacing:-.01em;background:linear-gradient(90deg,#8fd2ff,var(--acc));-webkit-background-clip:text;background-clip:text;color:transparent}
.bs .tip{color:var(--dim);margin:2px 0 8px;min-height:1.3em}
.bs .status{font-weight:800;font-size:1.15rem;text-align:center;padding:14px 16px;border-radius:16px;background:linear-gradient(150deg,var(--card2,#211f4a),var(--card,#171634));border:1px solid var(--line,rgba(255,255,255,.09));margin:8px 0;box-shadow:var(--shadow,0 10px 28px rgba(0,0,0,.4));transition:background .25s,box-shadow .25s}
.bs .status.mine{background:linear-gradient(135deg,#5fe3a1,#2fb86d);color:#06281a;border-color:transparent;text-transform:uppercase;letter-spacing:.06em;animation:bsPulse 1.4s ease-in-out infinite}
.bs .status.theirs{color:var(--dim,#a9a7d3)}
@keyframes bsPulse{0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,.55),0 10px 28px rgba(0,0,0,.35)}50%{box-shadow:0 0 0 9px rgba(74,222,128,0),0 0 34px rgba(74,222,128,.55)}}
.bs .log{text-align:center;color:var(--gold,#ffd166);min-height:1.5em;margin:6px 0 10px;font-weight:700}
.bs .boards{display:flex;flex-wrap:wrap;gap:22px;justify-content:center}
.bs .bcol{flex:1 1 340px;max-width:440px;min-width:0;padding:14px 16px 18px;border-radius:22px;background:linear-gradient(150deg,rgba(33,31,74,.85),rgba(23,22,52,.85));border:1px solid var(--line,rgba(255,255,255,.09));box-shadow:var(--shadow,0 12px 34px rgba(0,0,0,.4))}
.bs .bcol:first-child{border-color:rgba(58,160,255,.45);box-shadow:var(--shadow,0 12px 34px rgba(0,0,0,.4)),0 0 40px rgba(58,160,255,.14)}
.bs .lab{display:flex;justify-content:space-between;align-items:baseline;margin:0 2px 10px;gap:8px;flex-wrap:wrap}
.bs .lab b{font-size:1.05rem;font-weight:800}
.bs .lab .tip{margin:0;min-height:0;font-size:.85rem}
.bs .grid{max-width:420px;margin:0 auto;display:grid;grid-template-columns:repeat(10,1fr);gap:2px;padding:4px;border-radius:14px;width:100%;touch-action:manipulation;user-select:none;
  background:linear-gradient(120deg,#06294d,#0b4a85,#06294d,#0b4a85);background-size:300% 300%;animation:bsWave 9s ease-in-out infinite;box-shadow:inset 0 0 0 2px rgba(143,210,255,.25),inset 0 6px 24px rgba(0,0,0,.45)}
@keyframes bsWave{0%,100%{background-position:0 0}50%{background-position:100% 100%}}
.bs .cell{position:relative;aspect-ratio:1;min-width:0;padding:0;margin:0;border-radius:5px;border:0;display:block;font-size:0;box-shadow:none;overflow:visible;transition:background .2s,transform .12s,filter .12s}
.bs .cell:hover:not(:disabled){transform:none;filter:none}
.bs .cell.sea{background:linear-gradient(160deg,rgba(94,190,255,.55),rgba(30,115,200,.55))}
.bs .cell.sea.fire:hover{background:linear-gradient(160deg,rgba(150,225,255,.9),rgba(58,160,255,.8));transform:scale(1.07);z-index:2;box-shadow:0 0 12px rgba(143,210,255,.8)}
.bs .cell.sea.fire:active{transform:scale(.94)}
.bs .cell.sea.fire{cursor:crosshair}
.bs .cell.ship{background:linear-gradient(160deg,#c5ccd6,#7d8793);box-shadow:inset 0 0 0 2px rgba(60,68,80,.7),inset 0 3px 0 rgba(255,255,255,.4)}
.bs .cell.prev{background:linear-gradient(160deg,#7ff0a8,#2fb86d);box-shadow:0 0 10px rgba(74,222,128,.7)}
.bs .cell.bad{background:linear-gradient(160deg,#ff8c97,#e0414f);box-shadow:0 0 10px rgba(255,90,106,.7)}
.bs .cell.miss{background:linear-gradient(160deg,rgba(94,190,255,.35),rgba(30,115,200,.35))}
.bs .cell.miss::after{content:"";position:absolute;inset:34%;border-radius:50%;background:#fff;opacity:.92}
.bs .cell.miss::before{content:"";position:absolute;inset:20%;border-radius:50%;border:2px solid rgba(255,255,255,.8);animation:bsRipple .9s ease-out forwards}
@keyframes bsRipple{from{transform:scale(.3);opacity:1}to{transform:scale(1.9);opacity:0}}
.bs .cell.hit{background:radial-gradient(circle at 50% 40%,#ff7a3d,#d1222f 70%);box-shadow:0 0 12px rgba(255,80,60,.75),inset 0 0 0 2px rgba(120,0,10,.5)}
.bs .cell.hit::after{content:"🔥";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:clamp(11px,2.1vw,19px);line-height:1;animation:bsFlame .9s ease-in-out infinite alternate}
@keyframes bsFlame{from{transform:scale(.9) rotate(-6deg)}to{transform:scale(1.12) rotate(6deg)}}
.bs .cell.hit::before{content:"";position:absolute;inset:-6%;border-radius:50%;border:3px solid #ffd166;animation:bsBurst .6s ease-out forwards;pointer-events:none}
@keyframes bsBurst{from{transform:scale(.3);opacity:1}to{transform:scale(2.2);opacity:0}}
.bs .cell.sunk{background:linear-gradient(160deg,#4a2226,#1d0b0e);box-shadow:inset 0 0 0 2px #000,0 0 8px rgba(0,0,0,.6)}
.bs .cell.sunk::after{content:"☠";color:#d9d9e6;font-size:clamp(11px,2.1vw,19px);animation:none}
.bs .pl{max-width:480px;margin:0 auto;padding:18px;border-radius:22px;background:linear-gradient(150deg,rgba(33,31,74,.85),rgba(23,22,52,.85));border:1px solid var(--line,rgba(255,255,255,.09));box-shadow:var(--shadow,0 12px 34px rgba(0,0,0,.4))}
.bs .tray{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 14px}
.bs .tray button{flex:1 1 44%;min-height:50px;margin:0;padding:8px 12px;text-align:left;background:rgba(255,255,255,.07);color:var(--ink,#f6f5ff);border:2px solid var(--line,rgba(255,255,255,.09));box-shadow:none;font-weight:700;line-height:1.15}
.bs .tray button.sel{border-color:var(--gold,#ffd166);background:rgba(255,209,102,.14);box-shadow:0 0 16px rgba(255,209,102,.3)}
.bs .tray button.done{border-color:rgba(74,222,128,.7)}
.bs .tray button.done::after{content:" ✓";color:var(--good,#4ade80)}
.bs .tray small{display:block;font-weight:400;color:#9aa7b6;letter-spacing:.12em;font-size:.95rem;text-shadow:0 0 0 #9aa7b6;margin-top:2px}
.bs .tray button.sel small{color:#c5ccd6}
.bs .acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.bs .acts button{flex:1 1 30%;min-height:46px;margin:0}
.bs .acts button.alt{background:linear-gradient(135deg,#8ee0ff,#3aa0ff)}
.bs button.big{margin-top:10px}
.bs button.big.pink{background:linear-gradient(135deg,#6cc0ff,#3aa0ff);color:#04203d}
`;

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
