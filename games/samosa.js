/* Samosa Llama Mango Disco Pizza - 2 player online slap card game for Duo Games.
   An original spin-off of the "chant and slap" card game genre, with its own words and action cards.
   The host is the single authority for the deck, hands and pile. Slaps are judged by reaction time that
   each client measures LOCALLY from the moment that card appeared on its own screen, so network lag
   never decides who was faster. window.SAMOSA_SPEED (>1) divides every timer for test runs. */
(function(){
'use strict';

/* ---------- cards ---------- */
var WORDS=['samosa','llama','mango','disco','pizza'];
var CARDS={
  samosa:{e:'🥟',w:'Samosa',c:'#f4a340'},
  llama:{e:'🦙',w:'Llama',c:'#c4936a'},
  mango:{e:'🥭',w:'Mango',c:'#ffbe2e'},
  disco:{e:'🪩',w:'Disco',c:'#a36bff'},
  pizza:{e:'🍕',w:'Pizza',c:'#ff5a4e'},
  bolly:{e:'💃',w:'Bollywood',c:'#ff3d9a',k:'B',verb:'do the pose',btn:'Pose'},
  chai:{e:'☕',w:'Chai Break',c:'#22b585',k:'C',verb:'sip the chai',btn:'Sip'},
  mic:{e:'🎤',w:'Mic Drop',c:'#3d8bff',k:'M',verb:'drop the mic',btn:'Drop'}
};
var ACTIONS=['bolly','chai','mic'];
var PER_WORD=11,PER_ACTION=3; /* 5*11 + 3*3 = 64 */
var WINDOW=2500,GRACE=600,AUTO=1200,AUTO_AFTER=2000,END_DELAY=700;
var TIE_MS=15,SLAP_GRACE=350; /* near-ties go to a seeded coin flip; after the first good slap the host waits for the other report */
function SPD(){var s=typeof window!=='undefined'?+window.SAMOSA_SPEED:0;return s>1?s:1}
function other(r){return r==='host'?'guest':'host'}

function buildDeck(){
  var d=[],i;
  WORDS.forEach(function(w){for(i=0;i<PER_WORD;i++)d.push(w)});
  ACTIONS.forEach(function(a){for(i=0;i<PER_ACTION;i++)d.push(a)});
  return d;
}
function shuffleWith(a,R){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(R()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
/* deterministic deal from ctx.rng(seed): alternate cards, host first */
function deal(seed,rngF){
  var R=rngF(seed|0),deck=shuffleWith(buildDeck(),R);
  return {host:deck.filter(function(_,i){return i%2===0}),guest:deck.filter(function(_,i){return i%2===1}),R:R};
}
/* is the top card slap-worthy? */
function validity(c,prev,chant){
  var need=CARDS[c]&&CARDS[c].k||null;
  if(need)return {valid:true,kind:'action',need:need};
  if(c===chant)return {valid:true,kind:'match',need:null};
  if(prev&&prev===c)return {valid:true,kind:'double',need:null};
  return {valid:false,kind:null,need:null};
}
/* Pure slap judge. top={c,prev,chant}; rep={host:{ms,action,at}?,guest:...}.
   Returns null while undecided, else {reason:'wrong'|'noaction'|'slow'|'missed',taker,winner}.
   A wrong slap (not valid, or action card without its action) loses at once.
   Two good slaps: lower locally-measured ms wins. If they are within TIE_MS of each other the winner is
   coin() (a seeded host coin flip returning 'host'|'guest'), never the order the reports arrived in. */
function judge(top,rep,final,coin){
  var v=validity(top.c,top.prev,top.chant);
  var roles=['host','guest'].filter(function(r){return rep&&rep[r]}).sort(function(a,b){return (rep[a].at||0)-(rep[b].at||0)});
  for(var i=0;i<roles.length;i++){
    var r=roles[i];
    if(!v.valid)return {reason:'wrong',taker:r,winner:null};
    if(v.need&&!rep[r].action)return {reason:'noaction',taker:r,winner:null};
  }
  if(!v.valid)return null;
  if(roles.length===2){
    var mh=+rep.host.ms,mg=+rep.guest.ms,first;
    if(Math.abs(mh-mg)<=TIE_MS)first=coin?coin():(mh<=mg?'host':'guest');
    else first=mh<mg?'host':'guest';
    return {reason:'slow',taker:other(first),winner:first};
  }
  if(!final)return null;
  if(roles.length===1)return {reason:'slow',taker:other(roles[0]),winner:roles[0]};
  return {reason:'missed',taker:null,winner:null};
}
function rot(i){return ((i*47)%23)-11}

/* ---------- host core (DOM free) ---------- */
function makeCore(seed,rngF){
  var d=deal(seed,rngF),R=d.R;
  var S={phase:'lobby',auto:true,ready:{host:false,guest:false},hands:{host:d.host,guest:d.guest},pile:[],idx:0,
    turn:R()<.5?'host':'guest',flipper:null,top:null,pend:null,done:0,rep:{},arr:0,res:null,rid:0,winner:null,note:'',q:0};
  function coin(){return R()<.5?'host':'guest'}
  function nextTurn(pref){return S.hands[pref].length?pref:S.hands[other(pref)].length?other(pref):null}
  function reshuffle(){
    var cards=shuffleWith(S.pile.map(function(p){return p.c}),R);
    S.pile=[];S.top=null;
    var f=R()<.5?'host':'guest';
    cards.forEach(function(c,i){S.hands[i%2?other(f):f].push(c)});
    S.turn=nextTurn(f);S.note='Nobody had cards left, so the pile was shuffled and dealt out again';
  }
  function setReady(role){
    if(S.phase!=='lobby'||S.ready[role])return false;
    S.ready[role]=true;
    if(S.ready.host&&S.ready.guest){S.phase='play';S.note=''}
    return true;
  }
  function setAuto(v){v=!!v;if(S.auto===v||S.phase==='over')return false;S.auto=v;return true}
  function flip(role,i){
    if(S.phase!=='play'||S.pend||role!==S.turn||i!==S.idx)return false;
    var h=S.hands[role];if(!h.length)return false;
    var c=h.shift(),prev=S.pile.length?S.pile[S.pile.length-1].c:null,chant=WORDS[S.idx%5];
    S.idx++;
    S.pile.push({c:c,r:rot(S.idx),i:S.idx,by:role});
    S.flipper=role;S.top={c:c,prev:prev,chant:chant};S.rep={};S.arr=0;S.note='';
    if(validity(c,prev,chant).valid)S.pend={idx:S.idx};
    S.turn=nextTurn(other(role));
    if(!S.turn&&!S.pend)reshuffle();
    return true;
  }
  function slap(role,m){
    if(S.phase!=='play'||!m||typeof m!=='object')return false;
    if((m.cardIndex|0)!==S.idx||!S.pile.length||S.done===S.idx||S.rep[role])return false;
    var ms=+m.ms;if(!isFinite(ms))ms=60000;ms=Math.max(0,Math.min(60000,ms));
    S.rep[role]={ms:ms,action:!!m.action,at:++S.arr};
    var out=judge(S.top,S.rep,false,coin);
    if(out)resolve(out);
    return true;
  }
  function timeout(idx){
    if(S.phase!=='play'||!S.pend||S.pend.idx!==idx||S.done===idx)return false;
    resolve(judge(S.top,S.rep,true,coin));return true;
  }
  function resolve(out){
    S.done=S.idx;S.pend=null;S.rid++;
    var n=S.pile.length,msr={host:S.rep.host?S.rep.host.ms:null,guest:S.rep.guest?S.rep.guest.ms:null};
    var base={id:S.rid,idx:S.idx,card:S.top.c,n:n,ms:msr,taker:out.taker,winner:out.winner};
    if(out.reason==='missed'){
      base.kind='missed';S.res=base;
      if(!S.turn)reshuffle();
      return;
    }
    if(out.winner&&S.hands[out.winner].length===0){
      base.kind='win';S.res=base;S.phase='over';S.winner=out.winner;S.turn=null;return;
    }
    base.kind=out.reason;S.res=base;
    S.hands[out.taker]=S.hands[out.taker].concat(S.pile.map(function(p){return p.c}));
    S.pile=[];S.top=null;S.turn=out.taker;
  }
  function view(){
    return {q:S.q,phase:S.phase,auto:S.auto,ready:{host:S.ready.host,guest:S.ready.guest},
      hands:{host:S.hands.host.length,guest:S.hands.guest.length},pile:S.pile.slice(-7),pileN:S.pile.length,
      idx:S.idx,turn:S.turn,flipper:S.flipper,top:S.top?{c:S.top.c,prev:S.top.prev,chant:S.top.chant}:null,
      nextChant:WORDS[S.idx%5],res:S.res,winner:S.winner,note:S.note};
  }
  /* the single role that has slapped the pending card so far (host must then wait a grace window), else null */
  function firstSlapper(){
    if(!S.pend||S.done===S.idx)return null;
    var k=Object.keys(S.rep);return k.length===1?k[0]:null;
  }
  return {S:S,firstSlapper:firstSlapper,setReady:setReady,setAuto:setAuto,flip:flip,slap:slap,timeout:timeout,view:view};
}

/* ---------- styles ---------- */
var CSS=[
'.sm-shell{position:relative;max-width:760px;margin:0 auto;font-family:var(--font,inherit);user-select:none;-webkit-user-select:none}',
'.sm{padding:4px 0 26px}.sm *{box-sizing:border-box}',
'.sm-hdr{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px}',
'.sm-title{font-weight:800;font-size:1.2rem;letter-spacing:.01em;background:linear-gradient(90deg,#ffbe2e,#ff5a4e,#ff3d9a,#a36bff);-webkit-background-clip:text;background-clip:text;color:transparent}',
'.sm-chips{display:flex;gap:6px;flex-wrap:wrap;align-items:center}',
'.sm-chip{border-radius:999px;padding:4px 12px;font-weight:800;font-size:.88rem;background:rgba(255,255,255,.07);border:1.5px solid var(--pc,var(--line));color:var(--ink)}',
'.sm-chip b{color:var(--pc,var(--gold))}',
'.sm button{margin:0}',
'.sm-mini{padding:5px 12px;font-size:.8rem;border-radius:999px;background:rgba(255,255,255,.08);color:var(--ink);border:1px solid var(--line);box-shadow:none}',
'.sm-mini.on{background:linear-gradient(135deg,#ffe08a,#ffb347);color:#1a1033}',
'.sm-box{background:linear-gradient(150deg,var(--card2,#211f4a),var(--card,#171634));border:1px solid var(--line);border-radius:22px;padding:20px;text-align:center;box-shadow:var(--shadow)}',
'.sm-art{font-size:2.4rem;letter-spacing:.12em;margin:4px 0 10px}',
'.sm-rules{text-align:left;color:var(--dim);line-height:1.5;margin:10px auto;max-width:520px;padding-left:20px}',
'.sm-rules b{color:var(--ink)}',
'.sm-kbd{display:inline-block;min-width:1.6em;padding:0 6px;border-radius:6px;background:rgba(255,255,255,.12);border:1px solid var(--line);color:var(--ink);font-weight:800;font-size:.85em;text-align:center}',
'.sm-big{width:100%;font-size:1.15rem;padding:16px;margin-top:10px!important}',
'.sm-ticker{display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin:2px 0 6px}',
'.sm-tk{padding:3px 10px;border-radius:999px;font-weight:800;font-size:.85rem;color:var(--dim);background:rgba(255,255,255,.05);border:1px solid var(--line);transition:all .15s}',
'.sm-tk.now{color:#1a1033;background:var(--pc);border-color:transparent;transform:scale(1.12);box-shadow:0 0 18px var(--pc)}',
'.sm-tk.next{border-color:var(--gold);color:var(--ink)}',
'.sm-chant{text-align:center;font-weight:800;font-size:clamp(2.4rem,9vw,4rem);line-height:1.05;color:var(--pc,var(--ink));text-shadow:0 4px 0 rgba(0,0,0,.35),0 0 30px var(--pc,transparent);letter-spacing:.02em;min-height:1.1em}',
'.sm-chant.pop{animation:smchant .35s cubic-bezier(.2,1.6,.4,1)}',
'.sm-table{display:grid;grid-template-columns:1fr 1.6fr 1fr;align-items:center;gap:8px;margin:8px 0}',
'.sm-pile{position:relative;height:250px}',
'.sm-deck{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;font-weight:800}',
'.sm-deck small{color:var(--dim);font-weight:600}',
'.sm-card{position:absolute;left:50%;top:50%;width:136px;height:190px;border-radius:18px;background:#fff8e7;border:4px solid #1d1530;box-shadow:0 6px 0 #1d1530,0 14px 28px rgba(0,0,0,.45);color:#1d1530;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:0 0 10px;overflow:hidden;transform:translate(calc(-50% + var(--dx,0px)),calc(-50% + var(--dy,0px))) rotate(var(--rot,0deg))}',
'.sm-card .band{width:100%;height:26px;background:var(--cc);border-bottom:4px solid #1d1530;display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:800;color:#fff;letter-spacing:.1em;text-shadow:0 1px 0 rgba(0,0,0,.4)}',
'.sm-card .emo{font-size:4.3rem;line-height:1;filter:drop-shadow(0 4px 0 rgba(0,0,0,.15))}',
'.sm-card .lbl{font-weight:800;font-size:1.15rem;text-transform:uppercase;letter-spacing:.02em;background:var(--cc);color:#fff;padding:2px 10px;border-radius:999px;border:3px solid #1d1530;text-shadow:0 1px 0 rgba(0,0,0,.35);white-space:nowrap}',
'.sm-card.under{filter:brightness(.82)}',
'.sm-card.in{animation:smin .28s cubic-bezier(.2,1.4,.4,1)}',
'.sm-empty{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:136px;height:190px;border-radius:18px;border:3px dashed var(--line);display:flex;align-items:center;justify-content:center;color:var(--dim);font-weight:700;padding:10px;text-align:center}',
'.sm-pilen{position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);font-weight:800;font-size:.85rem;color:var(--dim);white-space:nowrap}',
'.sm-back{width:84px;height:118px;border-radius:14px;border:4px solid #1d1530;box-shadow:0 5px 0 #1d1530,0 10px 20px rgba(0,0,0,.4);background:repeating-linear-gradient(45deg,var(--pc) 0 10px,color-mix(in srgb,var(--pc) 70%,#1d1530) 10px 20px);display:flex;align-items:center;justify-content:center;font-size:2.2rem;position:relative}',
'.sm-back::after{content:attr(data-n);position:absolute;bottom:-10px;right:-10px;background:#1d1530;color:#fff;border-radius:999px;font-size:.85rem;padding:2px 8px;border:2px solid var(--pc)}',
'.sm-back.none{opacity:.3}',
'.sm-flip{background:none;box-shadow:none;padding:6px;display:flex;flex-direction:column;align-items:center;gap:8px;color:var(--ink);font-weight:800}',
'.sm-flip:not(:disabled) .sm-back{animation:smbob 1s ease-in-out infinite;box-shadow:0 5px 0 #1d1530,0 0 0 4px var(--gold),0 0 26px var(--gold)}',
'.sm-flip:disabled{opacity:.75}',
'.sm-acts{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:6px 0}',
'.sm-act{background:rgba(255,255,255,.07);color:var(--ink);border:2px solid var(--line);box-shadow:none;padding:10px 6px;font-size:1rem}',
'.sm-act .e{font-size:1.5rem;display:block}',
'.sm-act.done{background:var(--cc);border-color:#fff;color:#fff;animation:smpose .35s}',
'.sm-slap{width:100%;font-size:1.6rem;padding:18px;border-radius:20px;background:linear-gradient(135deg,var(--pc),color-mix(in srgb,var(--pc) 60%,#1d1530));color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.35);box-shadow:0 8px 0 rgba(0,0,0,.35),0 14px 30px rgba(0,0,0,.35)}',
'.sm-slap small{display:block;font-size:.8rem;opacity:.85;font-weight:700}',
'.sm-slap:active:not(:disabled){transform:translateY(5px);box-shadow:0 3px 0 rgba(0,0,0,.35)}',
'.sm-turn{text-align:center;font-weight:700;margin:10px 0 0;color:var(--ink)}',
'.sm-note{text-align:center;color:var(--dim);font-size:.9rem;min-height:1.3em;margin-top:4px}',
'.sm-fx{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:5}',
'.sm-hand{position:absolute;left:50%;top:44%;font-size:8rem;line-height:1;animation:smslap .5s cubic-bezier(.3,1.5,.5,1) both;filter:drop-shadow(0 0 0 var(--wc)) drop-shadow(0 0 22px var(--wc)) drop-shadow(0 0 40px var(--wc))}',
'.sm-ring{position:absolute;left:50%;top:44%;width:60px;height:60px;border-radius:50%;border:8px solid var(--wc);transform:translate(-50%,-50%);animation:smring .6s .25s ease-out both}',
'.sm-bn{position:absolute;left:0;right:0;top:12%;text-align:center;animation:smbn 1.5s ease both}',
'.sm-bn h3{margin:0;font-size:clamp(2.2rem,8vw,3.6rem);font-weight:800;color:var(--wc);-webkit-text-stroke:2px #1d1530;text-shadow:0 5px 0 #1d1530,0 0 30px var(--wc);letter-spacing:.02em;transform:rotate(-4deg)}',
'.sm-bn p{margin:6px auto 0;display:inline-block;background:rgba(10,8,28,.88);border:1px solid var(--line);border-radius:999px;padding:6px 16px;font-weight:700}',
'.sm-over{font-size:2.4rem;font-weight:800;margin:6px 0;color:var(--pc)}',
'@keyframes smin{0%{transform:translate(-50%,-120%) rotate(-30deg) scale(1.2);opacity:0}100%{transform:translate(calc(-50% + var(--dx,0px)),calc(-50% + var(--dy,0px))) rotate(var(--rot,0deg));opacity:1}}',
'@keyframes smchant{0%{transform:scale(.6);opacity:.2}100%{transform:scale(1);opacity:1}}',
'@keyframes smbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}',
'@keyframes smpose{0%{transform:scale(.85) rotate(-6deg)}60%{transform:scale(1.1) rotate(4deg)}100%{transform:none}}',
'@keyframes smslap{0%{transform:translate(-50%,-240%) scale(1.7) rotate(-25deg);opacity:0}55%{transform:translate(-50%,-50%) scale(1) rotate(0);opacity:1}70%{transform:translate(-50%,-44%) scale(1.12,.86)}100%{transform:translate(-50%,-50%) scale(1);opacity:1}}',
'@keyframes smring{0%{width:40px;height:40px;opacity:1}100%{width:340px;height:340px;opacity:0}}',
'@keyframes smbn{0%{transform:scale(.4);opacity:0}15%{transform:scale(1.1);opacity:1}25%{transform:scale(1)}85%{opacity:1}100%{opacity:0}}',
'@media (max-width:520px){.sm-table{grid-template-columns:1fr 1.7fr 1fr}.sm-back{width:62px;height:88px;font-size:1.6rem}.sm-card{width:112px;height:158px}.sm-card .emo{font-size:3.4rem}.sm-card .lbl{font-size:.9rem}.sm-pile{height:210px}.sm-hand{font-size:6rem}}'
].join('');

/* ---------- UI ---------- */
function GAME_START(ctx){
  var me=ctx.me,isHost=!!ctx.isHost,partner=other(me),names=ctx.names||{};
  var root=ctx.root;root.innerHTML='';
  var st=document.createElement('style');st.textContent=CSS;root.appendChild(st);
  var shell=document.createElement('div');shell.className='sm-shell';root.appendChild(shell);
  var wrap=document.createElement('div');wrap.className='sm';shell.appendChild(wrap);
  var fx=document.createElement('div');fx.className='sm-fx';shell.appendChild(fx);
  var core=isHost?makeCore(ctx.seed,ctx.rng):null;
  var V=isHost?core.view():null;
  var rtt=0,pingT=null,graceT={},dead=false,ended=false,lastQ=-1,lastIdx=-1,lastRes=0,hiTimer=null,autoT=null,winT={},endT=null,fxT=null,fxTok=0;
  var shownAt={},slapped={},acts={};

  function nm(r){return names[r]||(r==='host'?'Host':'Guest')}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function pc(r){return r==='host'?'var(--host)':'var(--guest)'}

  /* --- host plumbing --- */
  function bcast(){ctx.send({k:'s',q:core.S.q,v:core.view()})}
  function changed(){
    core.S.q++;V=core.view();bcast();render();schedule();onSnapshot();
  }
  function schedule(){
    if(dead||!isHost)return;
    var S=core.S;
    if(S.pend&&!winT[S.pend.idx]){
      var idx=S.pend.idx;
      /* nobody slapped within the window: missed. If someone has slapped, the grace timer below rules. */
      winT[idx]=setTimeout(function(){if(!dead&&!Object.keys(core.S.rep).length&&core.timeout(idx))changed()},(WINDOW+GRACE)/SPD());
    }
    var fs=core.firstSlapper();
    if(fs&&!graceT[S.idx]){
      var gi=S.idx;
      /* Symmetric 350 ms margin: the guest's report needs a full round trip to reach us, so after a host-first
         slap wait 350+RTT; after a guest-first slap the host's own report is instant, so wait 350-RTT. */
      var w=fs==='host'?SLAP_GRACE+rtt:Math.max(0,SLAP_GRACE-rtt);
      graceT[gi]=setTimeout(function(){if(!dead&&core.timeout(gi))changed()},w/SPD());
    }
    if(autoT){clearTimeout(autoT);autoT=null}
    if(S.phase==='play'&&S.auto&&!S.pend&&S.turn){
      var wait=(S.res&&S.res.idx===S.idx?AUTO_AFTER:AUTO)/SPD(),t=S.turn,i=S.idx;
      autoT=setTimeout(function(){autoT=null;if(!dead&&core.flip(t,i))changed()},wait);
    }
  }
  function hostDo(role,m){
    if(!m||typeof m!=='object')return;
    var ok=false;
    if(m.k==='ready')ok=core.setReady(role);
    else if(m.k==='auto')ok=role==='host'&&core.setAuto(m.v);
    else if(m.k==='flip')ok=core.flip(role,m.i);
    else if(m.k==='slap')ok=core.slap(role,m);
    if(ok)changed();
  }
  function act(m){if(dead||!V)return;if(isHost)hostDo('host',m);else ctx.send(m)}

  /* --- player actions --- */
  function needKey(){return V&&V.top&&CARDS[V.top.c].k||null}
  function canSlap(){return V&&V.phase==='play'&&V.pileN>0&&!slapped[V.idx]&&!(V.res&&V.res.idx===V.idx)}
  function doFlip(){
    if(!V||V.phase!=='play'||V.turn!==me||!V.hands[me])return;
    act({k:'flip',i:V.idx});
  }
  function doSlap(){
    if(!canSlap())return;
    var i=V.idx,now=performance.now();
    slapped[i]=true;
    var ms=Math.round(Math.max(0,now-(shownAt[i]!=null?shownAt[i]:now))*10)/10;
    var nk=needKey(),a=!!(nk&&acts[i]&&acts[i][nk]);
    render();
    act({k:'slap',cardIndex:i,ms:ms,action:a});
  }
  function doAct(k){
    if(!V||V.phase!=='play'||!V.pileN)return;
    var i=V.idx;acts[i]=acts[i]||{};if(acts[i][k])return;
    acts[i][k]=true;render();
  }

  /* --- effects --- */
  function playFx(res){
    if(!res)return;
    var tok=++fxTok,col,title,sub;
    var msTxt=(res.ms.host!=null||res.ms.guest!=null)?' · '+['host','guest'].map(function(r){return esc(nm(r))+' '+(res.ms[r]!=null?Math.round(res.ms[r])+' ms':'no slap')}).join(' vs '):'';
    if(res.kind==='missed'){col='var(--gold)';title='MISSED IT!';sub='Nobody slapped, the pile keeps growing'}
    else if(res.kind==='win'){col=pc(res.winner);title=res.winner===me?'YOU WIN!':'GAME OVER!';sub=esc(nm(res.winner))+' emptied their hand and slapped first'+msTxt}
    else if(res.kind==='slow'){col=pc(res.winner);title='TOO SLOW!';sub=esc(nm(res.taker))+' takes '+res.n+' card'+(res.n===1?'':'s')+msTxt}
    else{col=pc(other(res.taker));title='WRONG SLAP!';
      sub=res.kind==='noaction'?esc(nm(res.taker))+' forgot to '+CARDS[res.card].verb+' ('+CARDS[res.card].k+') and takes '+res.n:esc(nm(res.taker))+' fake-flinched and takes '+res.n;}
    var h='<div class="sm-bn" style="--wc:'+col+'"><h3>'+title+'</h3><br><p>'+sub+'</p></div>';
    if(res.kind!=='missed')h+='<div class="sm-ring" style="--wc:'+col+'"></div><div class="sm-hand" style="--wc:'+col+'">🖐️</div>';
    fx.innerHTML=h;
    if(fxT)clearTimeout(fxT);
    fxT=setTimeout(function(){if(tok===fxTok)fx.innerHTML=''},1600);
  }
  function checkEnd(){
    if(ended||endT||!V||V.phase!=='over')return;
    endT=setTimeout(function(){
      if(ended)return;ended=true;
      var w=V.winner;
      ctx.end(w===me?'You win! 🥟🖐️':nm(w)+' wins! 🥟',nm(w)+' emptied their hand and made the winning slap. Final hands: '+nm('host')+' '+V.hands.host+', '+nm('guest')+' '+V.hands.guest+'.');
    },END_DELAY/SPD());
  }

  /* --- rendering --- */
  function cardHTML(c,extra,style){
    var C=CARDS[c];
    var band=C.k?'ACTION · PRESS '+C.k:'SLAP IF CHANTED';
    return '<div class="sm-card '+(extra||'')+'" style="--cc:'+C.c+';'+(style||'')+'"><div class="band">'+band+'</div><div class="emo">'+C.e+'</div><div class="lbl">'+C.w+'</div></div>';
  }
  function backHTML(r,n){return '<div class="sm-back'+(n?'':' none')+'" style="--pc:'+pc(r)+'" data-n="'+n+'">🥟</div>'}
  function header(){
    var h='<div class="sm-hdr"><span class="sm-title">🥟 Samosa Llama Mango Disco Pizza</span><span class="sm-chips">';
    if(V&&V.phase!=='lobby'){
      [me,partner].forEach(function(r){h+='<span class="sm-chip" style="--pc:'+pc(r)+'">'+esc(r===me?'You':nm(r))+' <b>'+V.hands[r]+'</b></span>'});
    }
    if(V&&V.phase==='play'){
      if(isHost)h+='<button type="button" class="sm-mini sm-auto'+(V.auto?' on':'')+'" data-do="auto">Auto-flip '+(V.auto?'on':'off')+'</button>';
      else h+='<span class="sm-chip">Auto-flip '+(V.auto?'on':'off')+'</span>';
    }
    return h+'</span></div>';
  }
  function render(){
    if(dead)return;
    var newCard=false;
    if(V&&V.idx!==lastIdx){lastIdx=V.idx;if(V.pileN&&shownAt[V.idx]==null){shownAt[V.idx]=performance.now();newCard=true}}
    if(!V){wrap.innerHTML=header()+'<div class="sm-box">Shuffling the deck…</div>';return}
    wrap.setAttribute('data-phase',V.phase);
    wrap.setAttribute('data-mine',V.hands[me]);wrap.setAttribute('data-theirs',V.hands[partner]);
    var h=header();
    if(V.phase==='lobby')h+=lobby();
    else h+=table(newCard);
    wrap.innerHTML=h;
  }
  function lobby(){
    var h='<div class="sm-box"><div class="sm-art">🥟🦙🥭🪩🍕</div><h2>Samosa Llama Mango Disco Pizza</h2>';
    h+='<ul class="sm-rules">'+
      '<li>Take turns flipping your top card while the chant runs <b>Samosa → Llama → Mango → Disco → Pizza</b> and repeats.</li>'+
      '<li><b>SLAP</b> when the card matches the chanted word, or when the <b>same card comes twice in a row</b> (Double!).</li>'+
      '<li>Action cards: 💃 <b>Bollywood</b> press <span class="sm-kbd">B</span> to pose, ☕ <b>Chai Break</b> press <span class="sm-kbd">C</span> to sip, 🎤 <b>Mic Drop</b> press <span class="sm-kbd">M</span>. Then slap.</li>'+
      '<li>The <b>slowest</b> hand takes the whole pile. A <b>fake flinch</b> (wrong slap) takes it straight away.</li>'+
      '<li>Speed is measured on your own screen, so lag never matters.</li>'+
      '<li>Empty your hand, then win the next slap, to win the game.</li>'+
      '<li>Keys: flip <span class="sm-kbd">F</span>/<span class="sm-kbd">Enter</span>, slap <span class="sm-kbd">Space</span>/<span class="sm-kbd">S</span>, actions <span class="sm-kbd">B</span> <span class="sm-kbd">C</span> <span class="sm-kbd">M</span>. Or tap.</li></ul>';
    if(isHost)h+='<button type="button" class="sm-mini sm-auto'+(V.auto?' on':'')+'" data-do="auto">Auto-flip after 1.2 s: '+(V.auto?'on':'off')+'</button>';
    else h+='<span class="sm-chip">Auto-flip: '+(V.auto?'on':'off')+'</span>';
    var mine=V.ready[me];
    h+='<button type="button" class="pink sm-big sm-ready" data-do="ready"'+(mine?' disabled':'')+'>'+(mine?'Waiting for '+esc(nm(partner))+'…':'I’m ready 🖐️')+'</button>';
    if(V.ready[partner]&&!mine)h+='<p class="sm-note">'+esc(nm(partner))+' is ready!</p>';
    return h+'</div>';
  }
  function table(newCard){
    var h='',top=V.top,fl=V.flipper||'host';
    var cur=top?top.chant:null,nxt=V.nextChant;
    h+='<div class="sm-ticker">'+WORDS.map(function(w){
      var cls=w===cur?'now':(V.phase==='play'&&w===nxt?'next':'');
      return '<span class="sm-tk '+cls+'" style="--pc:'+pc(fl)+'">'+CARDS[w].e+' '+CARDS[w].w+'</span>'}).join('')+'</div>';
    if(V.phase==='over'){
      h+='<div class="sm-box"><div class="sm-over" style="--pc:'+pc(V.winner)+'">'+(V.winner===me?'You win! 🖐️':esc(nm(V.winner))+' wins!')+'</div><p class="sm-note">Emptied their hand and slapped first.</p></div>';
      return h;
    }
    h+='<div class="sm-chant'+(newCard?' pop':'')+'" style="--pc:'+pc(fl)+'">'+(cur&&V.pileN?CARDS[cur].w+'!':'Next: '+CARDS[nxt].w)+'</div>';
    h+='<div class="sm-table">';
    h+='<div class="sm-deck">'+backHTML(partner,V.hands[partner])+'<span>'+esc(nm(partner))+'</span><small>'+(V.turn===partner?'flips next':'&nbsp;')+'</small></div>';
    h+='<div class="sm-pile">';
    if(!V.pileN)h+='<div class="sm-empty">'+(V.turn===me?'Your flip!':esc(nm(V.turn||partner))+' flips')+'</div>';
    V.pile.forEach(function(p,j){
      var last=j===V.pile.length-1;
      var s='--rot:'+p.r+'deg;--dx:'+(((p.i*29)%13)-6)+'px;--dy:'+(((p.i*17)%9)-4)+'px;z-index:'+(j+1);
      if(last)h+=cardHTML(p.c,'sm-top'+(newCard?' in':''),s).replace('class="sm-card','data-card="'+p.c+'" data-prev="'+(top&&top.prev||'')+'" data-chant="'+(top?top.chant:'')+'" data-idx="'+V.idx+'" class="sm-card');
      else h+=cardHTML(p.c,'under',s);
    });
    if(V.pileN)h+='<div class="sm-pilen">'+V.pileN+' in the pile</div>';
    h+='</div>';
    var myTurn=V.turn===me&&V.hands[me]>0;
    h+='<div class="sm-deck"><button type="button" class="sm-flip" data-do="flip"'+(myTurn?'':' disabled')+'>'+backHTML(me,V.hands[me])+'<span>'+(myTurn?'Flip (F)':'You')+'</span></button></div>';
    h+='</div>';
    var nk=needKey(),done=acts[V.idx]||{},live=V.pileN>0;
    h+='<div class="sm-acts">'+ACTIONS.map(function(a){
      var C=CARDS[a];
      return '<button type="button" class="sm-act'+(live&&done[C.k]?' done':'')+'" data-do="act" data-k="'+C.k+'" style="--cc:'+C.c+'"'+(live?'':' disabled')+'><span class="e">'+C.e+'</span>'+C.btn+' ('+C.k+')</button>'}).join('')+'</div>';
    h+='<button type="button" class="sm-slap" data-do="slap" style="--pc:'+pc(me)+'"'+(canSlap()?'':' disabled')+'>🖐️ SLAP!<small>Space / S</small></button>';
    var turnTxt=V.turn===me?'Your flip — press F or tap your deck':V.turn?esc(nm(V.turn))+' flips next':'';
    if(nk&&V.pileN)turnTxt=CARDS[V.top.c].w+'! '+CARDS[V.top.c].verb.charAt(0).toUpperCase()+CARDS[V.top.c].verb.slice(1)+' ('+nk+'), then slap!';
    h+='<p class="sm-turn">'+turnTxt+'</p><p class="sm-note">'+esc(V.note||'')+'</p>';
    return h;
  }

  /* --- input --- */
  wrap.addEventListener('click',function(e){
    if(dead)return;
    var b=e.target.closest&&e.target.closest('[data-do]');if(!b||b.disabled||!wrap.contains(b))return;
    var d=b.getAttribute('data-do');
    if(d==='ready'){if(V&&V.phase==='lobby'&&!V.ready[me])act({k:'ready'})}
    else if(d==='auto'){if(isHost&&V)act({k:'auto',v:!V.auto})}
    else if(d==='flip')doFlip();
    else if(d==='slap')doSlap();
    else if(d==='act')doAct(b.getAttribute('data-k'));
  });
  function onKey(e){
    if(dead||!V||e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;
    var t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;
    if(!root.isConnected)return;
    var k=(e.key||'').toLowerCase();
    if(V.phase!=='play')return;
    if(k===' '||e.code==='Space'){e.preventDefault();if(!V.pileN&&V.turn===me)doFlip();else doSlap()}
    else if(k==='s')doSlap();
    else if(k==='f'||k==='enter'){e.preventDefault();doFlip()}
    else if(k==='b'||k==='c'||k==='m')doAct(k.toUpperCase());
  }
  window.addEventListener('keydown',onKey);

  /* --- incoming --- */
  function onSnapshot(){
    if(V.res&&V.res.id!==lastRes){lastRes=V.res.id;playFx(V.res)}
    checkEnd();
  }
  function onMsg(d){
    if(dead||!d||typeof d!=='object')return;
    if(d.k==='ping'){ctx.send({k:'pong',t:d.t});return}
    if(d.k==='pong'){
      var s=performance.now()-(+d.t);
      if(isHost&&isFinite(s)&&s>=0&&s<5000)rtt=rtt?rtt*.7+s*.3:s;
      return;
    }
    if(isHost){
      if(d.k==='hi')bcast();
      else hostDo('guest',d);
    }else if(d.k==='s'){
      if(typeof d.q!=='number'||d.q<=lastQ||!d.v)return;
      lastQ=d.q;V=d.v;
      if(hiTimer){clearInterval(hiTimer);hiTimer=null}
      render();onSnapshot();
    }
  }
  render();
  if(isHost){
    bcast();
    var ping=function(){if(!dead)ctx.send({k:'ping',t:performance.now()})};
    ping();pingT=setInterval(ping,3000);
  }else{
    ctx.send({k:'hi'});
    hiTimer=setInterval(function(){if(dead||V){clearInterval(hiTimer);hiTimer=null;return}ctx.send({k:'hi'})},2000);
  }
  return {
    onMsg:onMsg,
    destroy:function(){
      dead=true;window.removeEventListener('keydown',onKey);
      if(hiTimer)clearInterval(hiTimer);if(autoT)clearTimeout(autoT);if(endT)clearTimeout(endT);if(fxT)clearTimeout(fxT);
      if(pingT)clearInterval(pingT);
      Object.keys(winT).forEach(function(k){clearTimeout(winT[k])});
      Object.keys(graceT).forEach(function(k){clearTimeout(graceT[k])});
    },
    _core:core
  };
}

registerGame({
  id:'samosa',icon:'🥟',name:'Samosa Llama Mango Disco Pizza',
  blurb:'Flip, chant and SLAP! Match the word, strike the Bollywood pose, sip chai, drop the mic. Slowest hand takes the pile.',
  start:GAME_START,
  _t:{WORDS:WORDS,CARDS:CARDS,ACTIONS:ACTIONS,buildDeck:buildDeck,deal:deal,validity:validity,judge:judge,makeCore:makeCore}
});
})();
