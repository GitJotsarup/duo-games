/* Secret Allegiance - 2 player plugin for Duo Games */
(function () {
  'use strict';

  var COL = { C: 'Crimson', A: 'Azure' };
  var NEED = 5;
  var POWERS = { 1: 'inv', 3: 'peek', 5: 'purge' };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function otherOf(p) { return p === 'host' ? 'guest' : 'host'; }

  var CSS = '' +
    '.al{max-width:760px;margin:0 auto}' +
    '.al .hd{display:flex;justify-content:space-between;align-items:center;color:var(--dim);font-weight:600;flex-wrap:wrap;gap:6px}' +
    '.al .trk{display:flex;align-items:center;gap:8px;margin:8px 0}' +
    '.al .trk b{width:78px;font-size:.95rem}' +
    '.al .slot{width:46px;height:62px;border-radius:8px;border:2px dashed #3a3a66;display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:800;color:#fff}' +
    '.al .slot.f{border-style:solid;border-color:transparent}' +
    '.al .slot.fC,.al .pc.C{background:#d62f4b}.al .slot.fA,.al .pc.A{background:#2f7fe8}' +
    '.al .pc{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;width:92px;height:128px;border-radius:12px;color:#fff;font-weight:800;margin:4px 6px;border:3px solid transparent;padding:0}' +
    '.al .pc span{font-size:2rem}.al .pc small{font-size:.8rem;font-weight:600}' +
    '.al .pc.sel{opacity:.35;border-style:dashed;border-color:#fff}' +
    '.al .pc.sm{width:44px;height:60px;margin:2px;font-size:1.2rem}' +
    '.al .stat{display:flex;gap:18px;flex-wrap:wrap;color:var(--dim)}' +
    '.al .stat b{color:var(--ink)}' +
    '.al .chaos{letter-spacing:.2em;color:var(--bad);font-size:1.1rem}' +
    '.al .me{font-weight:800;padding:2px 10px;border-radius:8px;background:#2d2d55;min-width:90px;display:inline-block;text-align:center}' +
    '.al .me.C{background:#d62f4b;color:#fff}.al .me.A{background:#2f7fe8;color:#fff}' +
    '.al .bubble{background:#fff;color:#14142b;border-radius:14px;padding:10px 14px;margin:8px 0;position:relative;font-weight:600}' +
    '.al .bubble small{display:block;color:#666;font-weight:600}' +
    '.al .prompt{font-weight:700;color:var(--gold);margin-bottom:6px}' +
    '.al .log{max-height:180px;overflow:auto;font-size:.92rem;color:var(--dim)}' +
    '.al .log div{padding:2px 0;border-bottom:1px solid #2d2d55}' +
    '.al .note{background:#10102a;border-left:4px solid var(--gold);padding:6px 10px;margin:6px 0;border-radius:6px;font-size:.95rem}' +
    '.al .cl{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}.al .cl button{padding:6px 10px;font-size:.85rem}' +
    '.al details summary{cursor:pointer;font-weight:700}' +
    '.al details li{margin:4px 0}' +
    '.al .fin .m{margin:4px 0}';

  var RULES = '' +
    '<ul>' +
    '<li><b>Goal.</b> Each player is secretly <b>Crimson</b> or <b>Azure</b> (independent coin flips: you may match or differ, and you do not know your partner\'s colour). The first colour to enact <b>5</b> policies wins for everyone of that colour. If both share it, it is a Shared victory.</li>' +
    '<li><b>Deck.</b> 18 policies: 9 Crimson, 9 Azure. When fewer than 3 remain, the discards are reshuffled in.</li>' +
    '<li><b>Rounds.</b> Players alternate as <b>Speaker</b> (host first); the other is the <b>Enactor</b>. The Speaker draws 3, secretly discards 1, and passes 2. They may then state one public claim (true or not: bluffing is allowed and unverifiable).</li>' +
    '<li><b>Enacting.</b> The Enactor enacts one of the 2 policies; the other is discarded unseen. Once <b>4</b> policies are enacted in total, the Enactor may instead call a <b>Veto</b>: the Speaker must accept, both cards are discarded and <b>Chaos</b> rises by 1.</li>' +
    '<li><b>Chaos.</b> At 3 Chaos the game ends: the player whose colour has fewer enacted policies loses (equal: both lose).</li>' +
    '<li><b>Powers</b> (used by the round\'s Speaker right after a policy is enacted): after the 1st enacted policy <b>Investigate</b> (privately learn the Enactor\'s colour; the Enactor is told only that you investigated); after the 3rd <b>Peek</b> (privately see the top 3 policies); after the 5th <b>Purge</b> (the Enactor skips being Speaker next round, so you speak again).</li>' +
    '</ul>';

  registerGame({
    id: 'allegiance',
    icon: '🕵️',
    name: 'Secret Allegiance',
    blurb: 'Hidden council loyalties: pass policies, bluff, and work out who is on your side.',
    start: function (ctx) {
      var seed = ctx.seed | 0;
      var ME = ctx.me, OP = otherOf(ME);
      var names = ctx.names || { host: 'Host', guest: 'Guest' };
      var root = ctx.root;
      var timers = [];

      /* ----- deterministic setup ----- */
      function shuf(arr, sd) {
        var r = ctx.rng(sd), a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
          var j = Math.floor(r() * (i + 1));
          var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
      }
      var base = [];
      for (var i = 0; i < 9; i++) base.push('C', 'A');
      var alleg = {};
      ['host', 'guest'].forEach(function (p, idx) {
        var r = ctx.rng(seed + 9001 + idx);
        r(); r();
        alleg[p] = r() < 0.5 ? 'C' : 'A';
      });

      var S = {
        r: 1, speaker: 'host', phase: 'draw',
        en: { C: 0, A: 0 }, total: 0, chaos: 0,
        deck: ctx.shuffle(base), dp: 0, disc: [], reshuf: 0,
        draw: [], passed: [], claim: null, power: null, purge: false,
        over: false, final: null, log: [], dead: false, ended: false
      };
      var notes = []; /* private to me */
      var ui = { sel: null, claimText: '', reveal: false, revealT: null, rulesOpen: false };

      function nm(p) { return names[p] || p; }
      function logp(t) { S.log.push(t); }

      function ensure() {
        if (S.deck.length - S.dp < 3) {
          var rest = S.deck.slice(S.dp);
          S.reshuf++;
          S.deck = rest.concat(shuf(S.disc, seed + S.reshuf));
          S.disc = [];
          S.dp = 0;
        }
      }
      function startRound() {
        ensure();
        S.draw = S.deck.slice(S.dp, S.dp + 3);
        S.dp += 3;
        S.phase = 'draw';
        S.passed = [];
        S.claim = null;
        S.power = null;
        ui.sel = null;
        ui.claimText = '';
      }
      function endRound() {
        if (!S.purge) S.speaker = otherOf(S.speaker);
        S.purge = false;
        S.r++;
        startRound();
      }
      function finish(info) {
        S.over = true;
        S.phase = 'over';
        var win = { host: false, guest: false }, why;
        if (info.reason === 'policies') {
          ['host', 'guest'].forEach(function (p) { win[p] = alleg[p] === info.color; });
          why = COL[info.color] + ' enacted ' + NEED + ' policies.';
        } else {
          var nh = S.en[alleg.host], ng = S.en[alleg.guest];
          if (nh < ng) win.guest = true;
          else if (ng < nh) win.host = true;
          why = 'Chaos reached 3. Crimson ' + S.en.C + ' - Azure ' + S.en.A + '.';
        }
        S.final = { reason: info.reason, win: win, why: why };
        logp('Game over: ' + why);
        var delay = typeof ctx.endDelay === 'number' ? ctx.endDelay : (typeof window !== 'undefined' && window.ALLEGIANCE_FAST ? 0 : 1800);
        timers.push(setTimeout(function () {
          if (S.dead || S.ended) return;
          S.ended = true;
          var w = win[ME], o = win[OP];
          var title = w && o ? 'Shared victory' : w ? 'Victory' : o ? 'Defeat' : 'The council collapses';
          var text = why + ' ' + nm('host') + ' was ' + COL[alleg.host] + ', ' + nm('guest') + ' was ' + COL[alleg.guest] + '.';
          ctx.end(title, text);
        }, delay));
      }

      /* ----- the single deterministic reducer (local and remote actions) ----- */
      function act(m, from) {
        if (S.over || S.dead || !m || typeof m !== 'object' || m.r !== S.r) return false;
        if (from !== 'host' && from !== 'guest') return false;
        var spk = S.speaker, enc = otherOf(spk), text, c, i;
        switch (m.k) {
          case 'claim':
            if (from !== spk || S.phase !== 'draw' || S.claim !== null) return false;
            text = String(m.text == null ? '' : m.text).replace(/\s+/g, ' ').trim().slice(0, 80);
            if (!text) return false;
            S.claim = text;
            logp('R' + S.r + ' ' + nm(spk) + ' claims: "' + text + '"');
            return true;
          case 'pass':
            if (from !== spk || S.phase !== 'draw') return false;
            if (!Array.isArray(m.cards) || m.cards.length !== 2) return false;
            if (m.disc !== 'C' && m.disc !== 'A') return false;
            if (m.cards.some(function (x) { return x !== 'C' && x !== 'A'; })) return false;
            if (m.cards.concat([m.disc]).sort().join('') !== S.draw.slice().sort().join('')) return false;
            S.disc.push(m.disc);
            S.passed = [m.cards[0], m.cards[1]];
            S.phase = 'enact';
            logp('R' + S.r + ' ' + nm(spk) + ' (Speaker) passed 2 policies to ' + nm(enc) + '.');
            return true;
          case 'veto':
            if (from !== enc || S.phase !== 'enact' || S.total < 4) return false;
            S.phase = 'veto';
            logp('R' + S.r + ' ' + nm(enc) + ' calls a Veto.');
            return true;
          case 'vetoAccept':
            if (from !== spk || S.phase !== 'veto') return false;
            S.disc.push(S.passed[0], S.passed[1]);
            S.chaos++;
            logp('R' + S.r + ' Veto accepted. Chaos ' + S.chaos + '/3.');
            if (S.chaos >= 3) { S.passed = []; finish({ reason: 'chaos' }); return true; }
            endRound();
            return true;
          case 'enact':
            if (from !== enc || S.phase !== 'enact') return false;
            i = m.i;
            if (i !== 0 && i !== 1) return false;
            c = S.passed[i];
            S.disc.push(S.passed[1 - i]);
            S.passed = [];
            S.en[c]++;
            S.total++;
            logp('R' + S.r + ' ' + nm(enc) + ' enacted a ' + COL[c] + ' policy (' + S.total + ' total).');
            if (S.en[c] >= NEED) { finish({ reason: 'policies', color: c }); return true; }
            if (POWERS[S.total]) { S.power = POWERS[S.total]; S.phase = 'power'; }
            else endRound();
            return true;
          case 'power':
            if (from !== spk || S.phase !== 'power' || m.p !== S.power) return false;
            if (S.power === 'inv') {
              logp('R' + S.r + ' ' + nm(spk) + ' investigated ' + nm(enc) + '.');
              if (spk === ME) notes.push('Investigation: ' + nm(enc) + ' is ' + COL[alleg[enc]] + '.');
              else notes.push(nm(spk) + ' investigated you.');
            } else if (S.power === 'peek') {
              ensure();
              logp('R' + S.r + ' ' + nm(spk) + ' peeked at the top of the deck.');
              if (spk === ME) notes.push('Peek: the next 3 policies are ' + S.deck.slice(S.dp, S.dp + 3).map(function (x) { return COL[x]; }).join(', ') + '.');
              else notes.push(nm(spk) + ' peeked at the deck.');
            } else {
              S.purge = true;
              logp('R' + S.r + ' ' + nm(spk) + ' purged ' + nm(enc) + ': ' + nm(spk) + ' speaks again.');
            }
            endRound();
            return true;
        }
        return false;
      }

      function local(m) {
        m.r = S.r;
        if (!act(m, ME)) return false;
        ctx.send(m);
        render();
        return true;
      }
      function doPass(discIdx, claimText) {
        if (S.over || S.phase !== 'draw' || S.speaker !== ME) return false;
        if (discIdx !== 0 && discIdx !== 1 && discIdx !== 2) return false;
        var cards = S.draw.filter(function (x, k) { return k !== discIdx; });
        var disc = S.draw[discIdx];
        if (claimText && String(claimText).trim() && S.claim === null) local({ k: 'claim', text: claimText });
        return local({ k: 'pass', cards: cards, disc: disc });
      }

      /* ----- UI ----- */
      root.innerHTML = '<style>' + CSS + '</style><div class="al">' +
        '<div class="card"><div class="hd"><span id="al-turn"></span><span>You: <span id="al-me" class="me">hidden</span> <button class="ghost" data-a="reveal" style="padding:6px 12px">Show / hide</button></span></div>' +
        '<div id="al-tracks"></div><div class="stat" id="al-stat"></div></div>' +
        '<div class="card" id="al-act"></div>' +
        '<div class="card"><b>Event log</b><div class="log" id="al-log"></div></div>' +
        '<div class="card"><details id="al-rules"><summary>How to play</summary>' + RULES + '</details></div></div>';

      function q(sel) { return root.querySelector(sel); }
      function pcard(c, extra, attrs) {
        return '<button class="pc ' + c + ' ' + (extra || '') + '" ' + (attrs || '') + '><span>' + (c === 'C' ? 'C' : 'A') + '</span><small>' + COL[c] + '</small></button>';
      }
      function claimBubble() {
        return S.claim ? '<div class="bubble"><small>' + esc(nm(S.speaker)) + ' says</small>' + esc(S.claim) + '</div>' : '';
      }
      function notesHtml() {
        return notes.map(function (n) { return '<div class="note">' + esc(n) + '</div>'; }).join('');
      }

      function renderAct() {
        var h = '', spk = S.speaker === ME, i;
        if (S.over) {
          var f = S.final, o = f.win;
          h += '<div class="fin"><div class="prompt">Game over</div><div class="m">' + esc(f.why) + '</div>';
          ['host', 'guest'].forEach(function (p) {
            h += '<div class="m">' + esc(nm(p)) + ': <span class="me ' + alleg[p] + '">' + COL[alleg[p]] + '</span> ' + (o[p] ? '(wins)' : '(loses)') + '</div>';
          });
          h += '</div>' + notesHtml();
          return h;
        }
        h += '<div class="prompt">';
        if (S.phase === 'draw') {
          h += spk ? 'Speaker: discard one policy, then pass the other two' : esc(nm(S.speaker)) + ' (Speaker) is choosing what to pass...';
        } else if (S.phase === 'enact') {
          h += spk ? 'Waiting for ' + esc(nm(OP)) + ' to enact or veto...' : 'Enactor: choose a policy to enact';
        } else if (S.phase === 'veto') {
          h += spk ? 'Enactor called a Veto: you must accept' : 'Veto called. Waiting for ' + esc(nm(S.speaker)) + ' to accept...';
        } else if (S.phase === 'power') {
          var pn = { inv: 'Investigate', peek: 'Peek', purge: 'Purge' }[S.power];
          h += spk ? 'Speaker: use your power, ' + pn : esc(nm(S.speaker)) + ' is using ' + pn + '...';
        }
        h += '</div>';
        if (S.phase === 'draw' && spk) {
          h += '<div>';
          for (i = 0; i < 3; i++) h += pcard(S.draw[i], ui.sel === i ? 'sel' : '', 'data-a="disc" data-i="' + i + '"');
          h += '</div>';
          if (ui.sel !== null) {
            h += '<div class="tip">Public claim (optional, bluffing is fine):</div><div class="cl">';
            ['CCC', 'CCA', 'CAA', 'AAA'].forEach(function (x) {
              h += '<button class="ghost" data-a="quick" data-t="I drew ' + x + '">I drew ' + x + '</button>';
            });
            h += '</div><input id="al-claim" maxlength="80" placeholder="e.g. I drew CCA, passed CA" value="' + esc(ui.claimText) + '">';
            h += '<button class="big" data-a="pass">Pass the other two</button>';
          } else {
            h += '<div class="tip">Click the policy you want to discard.</div>';
          }
        } else if (S.phase === 'enact' && !spk) {
          h += claimBubble() + '<div>';
          for (i = 0; i < 2; i++) h += pcard(S.passed[i], '', 'data-a="enact" data-i="' + i + '"');
          h += '</div>';
          h += S.total >= 4
            ? '<button class="pink" data-a="veto">Call Veto (+1 Chaos)</button>'
            : '<div class="tip">Veto unlocks after 4 enacted policies (' + S.total + ' so far).</div>';
        } else if (S.phase === 'veto' && spk) {
          h += claimBubble() + '<button class="big pink" data-a="vetoAccept">Accept Veto (+1 Chaos)</button>';
        } else if (S.phase === 'power' && spk) {
          var lab = { inv: 'Investigate ' + esc(nm(OP)) + '\'s allegiance', peek: 'Peek at the top 3 policies', purge: 'Purge: ' + esc(nm(OP)) + ' skips being Speaker next round' }[S.power];
          h += '<button class="big alt" data-a="power">' + lab + '</button>';
        } else {
          h += claimBubble();
        }
        h += notesHtml();
        return h;
      }

      function render() {
        if (S.dead) return;
        var tr = '';
        ['C', 'A'].forEach(function (c) {
          tr += '<div class="trk"><b>' + COL[c] + '</b>';
          for (var k = 0; k < NEED; k++) tr += '<div class="slot' + (k < S.en[c] ? ' f f' + c : '') + '">' + (k < S.en[c] ? c : '') + '</div>';
          tr += '</div>';
        });
        q('#al-tracks').innerHTML = tr;
        q('#al-turn').textContent = S.over ? 'Game over' : 'Round ' + S.r + ' | Speaker: ' + nm(S.speaker) + ' | Enactor: ' + nm(otherOf(S.speaker));
        var rem = S.deck.length - S.dp;
        q('#al-stat').innerHTML = '<span>Deck <b>' + rem + '</b></span><span>Discard <b>' + S.disc.length + '</b></span>' +
          '<span>Enacted <b>' + S.total + '</b></span><span>Chaos <span class="chaos">' +
          [0, 1, 2].map(function (k) { return k < S.chaos ? '●' : '○'; }).join('') + '</span></span>';
        var me = q('#al-me');
        var show = ui.reveal || S.over;
        me.textContent = show ? COL[alleg[ME]] : 'hidden';
        me.className = 'me' + (show ? ' ' + alleg[ME] : '');
        q('#al-act').innerHTML = renderAct();
        q('#al-log').innerHTML = S.log.slice().reverse().map(function (t) { return '<div>' + esc(t) + '</div>'; }).join('');
      }

      function onClick(e) {
        var t = e.target && e.target.closest ? e.target.closest('[data-a]') : null;
        if (!t || S.dead) return;
        var a = t.getAttribute('data-a'), i = parseInt(t.getAttribute('data-i'), 10);
        if (a === 'reveal') {
          ui.reveal = !ui.reveal;
          if (ui.revealT) clearTimeout(ui.revealT);
          if (ui.reveal) {
            ui.revealT = setTimeout(function () { ui.reveal = false; render(); }, 5000);
            timers.push(ui.revealT);
          }
          render();
        } else if (a === 'disc') {
          if (S.phase === 'draw' && S.speaker === ME) { ui.sel = i; render(); }
        } else if (a === 'quick') {
          ui.claimText = t.getAttribute('data-t') || '';
          var inp = q('#al-claim'); if (inp) inp.value = ui.claimText;
        } else if (a === 'pass') {
          if (ui.sel !== null) { var inp2 = q('#al-claim'); doPass(ui.sel, inp2 ? inp2.value : ui.claimText); }
        } else if (a === 'enact') { local({ k: 'enact', i: i }); }
        else if (a === 'veto') { local({ k: 'veto' }); }
        else if (a === 'vetoAccept') { local({ k: 'vetoAccept' }); }
        else if (a === 'power') { local({ k: 'power', p: S.power }); }
      }
      function onInput(e) {
        if (e.target && e.target.id === 'al-claim') ui.claimText = e.target.value;
      }
      root.addEventListener('click', onClick);
      root.addEventListener('input', onInput);

      startRound();
      render();

      /* ----- random legal-move driver used by tests ----- */
      function step(rnd) {
        if (S.over || S.dead) return false;
        var spk = S.speaker === ME;
        if (S.phase === 'draw' && spk) {
          return doPass(Math.floor(rnd() * 3), rnd() < 0.5 ? 'I drew ' + S.draw.join('') : '');
        }
        if (S.phase === 'enact' && !spk) {
          if (S.total >= 4 && rnd() < 0.3) return local({ k: 'veto' });
          return local({ k: 'enact', i: rnd() < 0.5 ? 0 : 1 });
        }
        if (S.phase === 'veto' && spk) return local({ k: 'vetoAccept' });
        if (S.phase === 'power' && spk) return local({ k: 'power', p: S.power });
        return false;
      }

      return {
        onMsg: function (d) {
          if (S.dead || !d || typeof d !== 'object') return;
          if (act(d, OP)) render();
        },
        destroy: function () {
          S.dead = true;
          timers.forEach(clearTimeout);
          timers = [];
          root.removeEventListener('click', onClick);
          root.removeEventListener('input', onInput);
          root.innerHTML = '';
        },
        _t: {
          step: step,
          act: act,
          snap: function () {
            return JSON.stringify({
              r: S.r, speaker: S.speaker, phase: S.phase, en: S.en, total: S.total, chaos: S.chaos,
              dp: S.dp, deck: S.deck.join(''), disc: S.disc.join(''), reshuf: S.reshuf,
              draw: S.draw.join(''), over: S.over, final: S.final && S.final.win
            });
          },
          state: function () { return S; },
          alleg: alleg
        }
      };
    }
  });
})();
