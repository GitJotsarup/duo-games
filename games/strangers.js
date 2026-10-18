/* Closer Than Strangers - 2 players, a conversation card game for couples. Plugin for Duo Games.
   Three levels (First Impressions -> Under the Surface -> Heart to Heart), wildcards with small shared actions
   (including a tiny shared doodle pad) and a Closing Card where both messages are revealed together.
   All prompts are original. The host is the single authority for the game state; the guest sends requests
   and renders the snapshots it gets back, so the two screens can never diverge. */
(function(){
'use strict';

/* ---------- prompts ----------
   Cards are read out by the drawer to the partner, so "I/me" = the drawer and "you" = the person answering. */
var Q={1:[
"What do you think my go-to karaoke song is?",
"What was your first impression of me?",
"What do you think I was like in high school?",
"If I were a dessert, which one would I be, and why?",
"What do you think my most-used emoji is?",
"What do you think I'd order at a diner at 2 a.m.?",
"Guess my comfort movie. Bonus points if you can say why.",
"What job do you think I'd have if money didn't matter at all?",
"What do you think my hidden talent is?",
"What do you think I was scared of as a kid?",
"Which fictional character do you think I'd be best friends with?",
"What do you think I'd do with a completely free Saturday and no phone?",
"What do you think my love language is? Defend your answer.",
"If a theme song played every time I walked into a room, what would it be?",
"What do you think I'm secretly competitive about?",
"What smell do you think instantly reminds me of home?",
"What do you think I'd name a pet goldfish?",
"What do you think my \"I'm fine\" actually means most of the time?",
"Which season do you think matches my personality?",
"What do you think my dream holiday looks like?",
"If I went viral tomorrow, what do you think it would be for?",
"What do you think is the first thing I notice about people?",
"What do you think I'm most likely to be late for?",
"Which snack do you think I'd hide so you couldn't find it?",
"What do you think I'll be like as a grumpy 85-year-old?",
"What do you think I googled the most this month?",
"I can bring three things to a deserted island. What do you think I'd pick?",
"What do you think my morning routine looks like when nobody's watching?",
"What do you think I'd choose as my last meal?",
"Which decade do you think I secretly belong in?",
"Which friend do you think I'd call first in a real emergency, and which one in a funny emergency?",
"What do you think my most irrational pet peeve is?",
"What do you think I was thinking the first time we said goodbye?",
"What do you think my handwriting says about me?",
"If I suddenly got a surprise pile of money, what do you think I'd spend it on first?",
"If I opened a tiny shop, what do you think I'd sell?",
"What do you think my signature dance move is?",
"What do you think I'm like when I'm hangry? Do an impression.",
"Which compliment do you think I secretly love getting the most?",
"What do you think my favourite thing about myself is?",
"What job do you think I'd be hilariously terrible at?",
"What do you think I was like on my very first day of school?",
"If I were a houseplant, how would you have to take care of me?",
"What do you think is the most \"me\" thing I own?",
"Which reality show do you think I'd win, and which would I get kicked off first?",
"What do you think I'm proud of but rarely talk about?",
"What do you think my texting style says about me?",
"Which animal do you think I am before my first coffee or tea of the day?",
"What do you think I wrote in my head after our first proper conversation?",
"What do you think my perfect pizza looks like?",
"What do you think I'd claim is my biggest weakness in a job interview, and what is it really?",
"What do you think I'm like in a crisis?",
"What do you think my guilty-pleasure TV show is?",
"What song do you think I put on repeat after a bad day?",
"What did you imagine I did for fun before you really knew me?",
"What do you think made me laugh the hardest this year?"
],2:[
"What's a memory from your childhood that still makes you feel safe?",
"What's something you're still learning to forgive yourself for?",
"When do you feel most like yourself?",
"What's a belief you held tightly five years ago that you've since let go of?",
"What does \"home\" feel like to you, not look like?",
"Tell me about a moment you felt proud of yourself, even though no one else noticed.",
"What's something you wish people asked you about more often?",
"What's the kindest thing a stranger has ever done for you?",
"What's a fear you've never said out loud?",
"Which song carries a memory you don't talk about much?",
"Who shaped the way you love people, and how?",
"What's something you needed to hear as a teenager?",
"When was the last time you cried, and what brought it on?",
"Which part of yourself do you find hardest to show people?",
"What's a small ritual that keeps you grounded?",
"What's a dream you gave up on, and do you still miss it?",
"What does a perfect, completely ordinary day look like to you?",
"How do you like to be comforted when you're having a hard time?",
"What's a lesson you had to learn the hard way?",
"What are you quietly working on in yourself right now?",
"When do you feel the loneliest, and what helps?",
"What's a compliment from years ago that you still remember word for word?",
"What did your family do differently from other families when you were growing up?",
"What's something you're a little scared to want?",
"Which old version of yourself are you most proud of growing out of?",
"What makes you feel genuinely appreciated?",
"What's a risk you're really glad you took?",
"What always makes you feel like a kid again?",
"What's the hardest goodbye you've ever had to say?",
"What do you think you're still healing from?",
"What would your younger self be most surprised by in your life right now?",
"What's a tradition you'd love to keep forever, or one you'd love to start?",
"How do you recharge, and what does it give back to you?",
"What's a question you're afraid to know the answer to?",
"When did you last feel completely at peace?",
"Which of your habits do you think you picked up from your family?",
"What do you wish you could tell someone from your past?",
"What do you love about yourself that took you a long time to accept?",
"What's a place that changed you?",
"What does success honestly mean to you right now?",
"Tell me about a time you felt deeply understood by someone.",
"What topic could you talk about for hours, and why does it light you up?",
"What's something you've never told me because it felt too small to mention?",
"What makes you feel safe enough to be vulnerable?",
"Which moment from this past year would you love to live again?",
"What do you need more of in your life right now?",
"What's something you've been carrying alone that you'd like some help with?",
"What's a memory with a grandparent or an older relative that you treasure?",
"What does a really good apology look like to you?",
"What's the first thing you remember falling in love with: a place, a hobby, a song, anything?",
"Which part of your story do you wish more people knew?",
"What kind of friend are you on your best days?",
"When do you feel most creative?",
"What's something you've changed your mind about since we met?",
"What's a worry that keeps you up at night more than it deserves to?",
"What's a smell, taste or sound that instantly takes you back somewhere?"
],3:[
"What's something I do that makes you feel loved without me even realising?",
"What moment with me do you replay in your head when you miss me?",
"What have you learned about yourself since being with me?",
"What's one thing you'd love for us to do together in the next year?",
"When did you first feel completely comfortable around me?",
"What do you think we're really good at as a team?",
"What's something you're grateful I taught you, even by accident?",
"How can I love you better this month?",
"Which quality of mine do you hope rubs off on you?",
"When you daydream about our future, what do you see?",
"What's a hard moment we went through that made us stronger?",
"What's something you've wanted to thank me for but never said?",
"What's your favourite version of us: morning us, road-trip us, or late-night-call us?",
"What's one tradition you want us to build together?",
"What do you think I need to hear from you more often?",
"When do you feel closest to me, even when we're apart?",
"What's a worry you have about us, and how can I help with it?",
"What did you learn about me tonight that surprised you?",
"What's something about me you hope never changes?",
"How have I changed since you first met me?",
"What's a small moment with me that meant more than I'd guess?",
"What's one promise you'd like to make to me tonight?",
"Where do you see us in five years, honestly and hopefully?",
"What do you love about how we handle disagreements, and what could we do better?",
"Where's a place you'd love to take me, and why there?",
"If someone asked how we met, which part of our story would you tell them first?",
"What do you admire most about the way I treat other people?",
"When did you realise this was something special?",
"What's something you want to get better at, for us?",
"What's our most \"us\" inside joke, and why do you love it?",
"On a bad day, what does feeling supported by me look like?",
"Which dream of mine do you want to help me reach?",
"What's one thing you wish we did more often?",
"What are you most looking forward to in our future?",
"Which song feels like our relationship?",
"What do you think makes us work?",
"Tell me about a time I made you feel truly seen.",
"What's one thing you want me to always remember about how you feel about me?",
"If our relationship were a book, what would this chapter be called?",
"What's something hard you'd like us to be able to talk about more openly?",
"Which of my quirks did you fall for first?",
"How have I surprised you since we got together?",
"What would you want our home to feel like?",
"What does \"forever\" mean to you when you think about us?",
"Tell me about a moment you were proud to be with me.",
"What's one thing you'd like us to stop worrying about?",
"How do you want us to celebrate our next milestone?",
"What's something you've learned about love from being with me?",
"What do you think my favourite thing about you is? Then I'll tell you if you're right.",
"What's a goal you'd like us to work towards together?",
"What would you say to me on my hardest day?",
"What do you want to make sure we never lose, no matter how busy life gets?",
"If you could only keep one memory of us, which would you save?",
"How do you hope we'll be different a year from now?",
"What part of tonight's conversation do you think you'll remember most?",
"What's a little thing I could do tomorrow that would make your whole day?"
]};

/* Wildcards: [mode, text]. act = the drawer does it and the partner marks it done; both = both of you write,
   revealed at the same time; doodle = draw on the shared doodle pad. */
var WILD=[
['act',"Send your partner a voice note saying three things you love about them."],
['act',"Text your partner a photo of something near you that reminds you of them, and explain why."],
['act',"Give your partner a 30-second pep talk, as if they're about to walk on stage."],
['act',"Describe your partner like a nature documentary narrator who is clearly smitten."],
['act',"Send your partner a song that makes you think of them. Press play at the same time."],
['act',"Compliment your partner using only food words. Keep a straight face."],
['act',"Hum a song that reminds you of the two of you. Your partner gets three guesses."],
['act',"Tell your partner about a moment today when you thought of them."],
['act',"Do your best impression of your partner. They rate it out of 10."],
['act',"Show your partner the last photo in your camera roll and tell the story behind it."],
['act',"Give your partner a tiny camera tour of where you are, and show them one thing they've never seen."],
['act',"Make up a haiku about your partner (5-7-5 syllables) and say it out loud, right now."],
['act',"Plan your next date in 60 seconds flat. Your partner gets one veto."],
['act',"Name five things you appreciate about your partner in 20 seconds. Go!"],
['act',"Invent an award just for your partner and give a short, dramatic acceptance speech on their behalf."],
['act',"Hold eye contact on video for 30 seconds. First to laugh owes the other a compliment."],
['act',"Read your partner your favourite message they've ever sent you."],
['act',"Invent a secret word or gesture that only the two of you will ever use."],
['both',"Both write a one-line love letter. Reveal at the same time."],
['both',"Both finish the sentence: \"The moment I knew I liked you was...\""],
['both',"Both describe your perfect lazy Sunday together in one sentence. Do they match?"],
['both',"Both write the one thing you'd sneakily take home from your partner's place."],
['both',"Both write three words that describe this relationship."],
['both',"Both guess: what will we be doing exactly one year from today?"],
['both',"Both write the name you'd give a pet you adopt together."],
['both',"Both write the most underrated thing about your partner."],
['doodle',"Draw your partner a doodle in the box below. No erasing allowed, only love."],
['doodle',"Draw a tiny portrait of your partner. Accuracy optional, effort mandatory."],
['doodle',"Doodle your dream date. Your partner has to guess what it is."],
['doodle',"Draw the two of you as animals."],
['doodle',"Doodle something that made you smile this week. Your partner guesses what it is."]
];

var LVN=['','First Impressions','Under the Surface','Heart to Heart'];
var LVD=['','Guess, tease and see how well you read each other.','Memories, feelings and the stuff in between.','Gratitude, the future, and the two of you.'];
var LVI=['','👀','🌊','💗'];
var EMO=['❤️','😂','🥹','😮','🔥','🫶'];
var MAXPASS=3,WILD_EVERY=4,PAL=['#2b1016','#c0392b','#e67e22','#2f80ed','#27ae60'];
var CLOSING="Before you close the deck, write your partner a message: something you want them to keep. You'll both reveal at the same time.";

/* ---------- pure helpers ---------- */
function shufWith(arr,rnd){var a=arr.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(rnd()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
function range(n){var a=[];for(var i=0;i<n;i++)a.push(i);return a}
function oth(r){return r==='host'?'guest':'host'}
function clean(s,max){return String(s==null?'':s).replace(/\r/g,'').replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim().slice(0,max||600)}

/* ---------- host-side authoritative state machine ---------- */
function makeCore(seed,rngf){
  seed=seed|0;
  var qOrd={},qp={1:0,2:0,3:0},drawsIn={1:0,2:0,3:0},wp=0;
  for(var L=1;L<=3;L++)qOrd[L]=shufWith(range(Q[L].length),rngf(seed+101*L+13));
  var wOrd=shufWith(range(WILD.length),rngf(seed+977));
  var first=rngf(seed+5)()<.5?'host':'guest';
  var S={q:0,phase:'lobby',lvl:1,n:0,drawer:first,card:null,cv:0,ans:{host:null,guest:null},react:null,reactBy:null,
    ready:{host:false,guest:false},adv:{host:false,guest:false},passes:{host:0,guest:0},lvlCount:[0,0,0,0],
    doodle:[],log:[],closing:{host:null,guest:null},fin:{host:false,guest:false},start:{host:false,guest:false},note:null};

  function drawNext(L){
    var k=drawsIn[L]++;
    if(k%WILD_EVERY===WILD_EVERY-2){
      var wi=wOrd[wp%wOrd.length];wp++;
      return {id:'w'+wi,kind:'w',mode:WILD[wi][0],text:WILD[wi][1],lvl:L};
    }
    var o=qOrd[L],qi=o[qp[L]%o.length];qp[L]++;
    return {id:'q'+L+'-'+qi,kind:'q',mode:'say',text:Q[L][qi],lvl:L};
  }
  function freshRound(){
    S.card=null;S.ans={host:null,guest:null};S.react=null;S.reactBy=null;S.ready={host:false,guest:false};S.doodle=[];
  }
  function nextRound(){freshRound();S.n++;S.drawer=oth(S.drawer);S.phase='draw';S.note=null}
  function levelUp(){
    var fromReveal=S.phase==='reveal';
    S.adv={host:false,guest:false};
    if(S.lvl>=3){freshRound();S.n++;S.phase='closing';S.note={k:'closing'};return}
    freshRound();S.n++;S.lvl++;S.passes={host:0,guest:0};
    if(fromReveal)S.drawer=oth(S.drawer);
    S.phase='draw';S.note={k:'lvl',l:S.lvl};
  }
  function pushLog(){
    var c=S.card;
    S.log.push({lvl:S.lvl,n:S.n,kind:c.kind,mode:c.mode,text:c.text,drawer:S.drawer,
      ans:{host:S.ans.host,guest:S.ans.guest},react:null,reactBy:null,doodle:c.mode==='doodle'?S.doodle.slice():null});
    S.lvlCount[S.lvl]++;
  }
  function validStroke(s){
    if(!s||typeof s!=='object'||!Array.isArray(s.p))return null;
    var p=s.p.slice(0,400);if(p.length<2)return null;if(p.length%2)p.pop();
    for(var i=0;i<p.length;i++){var v=Math.round(+p[i]);if(!(v>=0))v=0;if(v>1000)v=1000;p[i]=v}
    var c=s.c|0;if(c<0||c>=PAL.length)c=0;
    return {id:String(s.id||'').slice(0,24),c:c,p:p};
  }
  /* returns true when the state changed */
  function apply(role,a){
    if(!a||typeof a!=='object'||(role!=='host'&&role!=='guest'))return false;
    var k=a.a,ph=S.phase,o=oth(role);
    if((a.r|0)!==S.n)return false; /* stale round */
    if(ph==='lobby'){
      if(k!=='start'||S.start[role])return false;
      S.start[role]=true;
      if(S.start.host&&S.start.guest){freshRound();S.phase='draw';S.note={k:'lvl',l:1}}
      return true;
    }
    if(k==='adv'){
      if(ph!=='draw'&&ph!=='reveal')return false;
      if(S.lvlCount[S.lvl]<1)return false;
      var v=!!a.v;if(S.adv[role]===v)return false;
      S.adv[role]=v;
      if(S.adv.host&&S.adv.guest)levelUp();
      return true;
    }
    if(k==='draw'){
      if(ph!=='draw'||role!==S.drawer)return false;
      freshRound();S.card=drawNext(S.lvl);S.cv++;S.phase='answer';S.note=null;return true;
    }
    var cvOk=(a.cv|0)===S.cv;
    if(k==='pass'){
      if(ph!=='answer'||!cvOk||S.passes[role]>=MAXPASS||S.ans.host||S.ans.guest)return false;
      S.passes[role]++;S.card=drawNext(S.lvl);S.cv++;S.doodle=[];S.note={k:'pass',by:role};return true;
    }
    if(k==='answer'){
      if(ph!=='answer'||!cvOk||S.ans[role])return false;
      var mode=S.card.mode,call=!!a.call,t=clean(a.text,600);
      if(mode==='both'){
        if(!call&&!t)return false;
      }else{
        if(role===S.drawer)return false;
        if(mode==='say'&&!call&&!t)return false;
      }
      S.ans[role]={t:t,call:call};
      if(mode!=='both'||(S.ans.host&&S.ans.guest)){S.phase='reveal';S.note=null;pushLog()}
      return true;
    }
    if(k==='stroke'||k==='clear'){
      if(ph!=='answer'||!cvOk||!S.card||S.card.mode!=='doodle')return false;
      if(k==='clear'){if(!S.doodle.length)return false;S.doodle=[];return true}
      var s=validStroke(a.s);if(!s||S.doodle.length>=150)return false;
      for(var i=0;i<S.doodle.length;i++)if(s.id&&S.doodle[i].id===s.id)return false; /* duplicate */
      S.doodle.push(s);return true;
    }
    if(k==='react'){
      if(ph!=='reveal'||!cvOk||EMO.indexOf(a.e)<0)return false;
      if(S.card.mode!=='both'&&role!==S.drawer)return false;
      if(S.react===a.e&&S.reactBy===role)return false;
      S.react=a.e;S.reactBy=role;
      var last=S.log[S.log.length-1];if(last){last.react=a.e;last.reactBy=role}
      return true;
    }
    if(k==='ready'){
      if(ph!=='reveal'||!cvOk||S.ready[role])return false;
      S.ready[role]=true;
      if(S.ready.host&&S.ready.guest)nextRound();
      return true;
    }
    if(k==='close'){
      if(ph!=='closing'||S.closing[role])return false;
      var ct=clean(a.text,1500);if(!ct)return false;
      S.closing[role]={t:ct};
      if(S.closing.host&&S.closing.guest){S.phase='final';S.note=null}
      return true;
    }
    if(k==='fin'){
      if(ph!=='final'||S.fin[role])return false;
      S.fin[role]=true;
      if(S.fin.host&&S.fin.guest)S.phase='over';
      return true;
    }
    return false;
  }
  function view(role){
    var v={},k,o=oth(role);
    for(k in S)v[k]=S[k];
    v.ans={host:S.ans.host,guest:S.ans.guest};
    if(S.phase==='answer'&&S.ans[o])v.ans[o]={hidden:true};
    v.closing={host:S.closing.host,guest:S.closing.guest};
    if(S.phase==='closing'&&S.closing[o])v.closing[o]={hidden:true};
    return v;
  }
  return {S:S,apply:apply,view:view,drawNext:drawNext};
}

/* ---------- Memory Lane as plain text ---------- */
function laneText(log,closing,nm){
  var out=['CLOSER THAN STRANGERS - Memory Lane',nm('host')+' & '+nm('guest'),new Date().toDateString(),''];
  var lv=0;
  (log||[]).forEach(function(e,i){
    if(e.lvl!==lv){lv=e.lvl;out.push('','== Level '+lv+' - '+LVN[lv]+' ==','')}
    var tag=e.kind==='w'?'[Wildcard] ':'';
    out.push((i+1)+'. '+tag+e.text);
    var ans=e.drawer==='host'?'guest':'host';
    function line(who,a,lead){
      if(!a)return;
      if(a.call)out.push('   '+lead+nm(who)+': (we talked about it on the call)'+(a.t?' - '+a.t:''));
      else if(a.t)out.push('   '+lead+nm(who)+': '+a.t.replace(/\n/g,'\n     '));
    }
    if(e.mode==='both'){line('host',e.ans.host,'');line('guest',e.ans.guest,'')}
    else if(e.mode==='say'){out.push('   '+nm(e.drawer)+' asked');line(ans,e.ans[ans],'')}
    else{
      out.push('   '+nm(e.drawer)+' did it'+(e.mode==='doodle'?' (a doodle)':'')+', '+nm(ans)+' marked it done');
      line(ans,e.ans[ans],'note from ');
    }
    if(e.react)out.push('   Reaction: '+e.react);
  });
  if(closing&&closing.host&&closing.guest&&closing.host.t&&closing.guest.t){
    out.push('','== Closing Card ==','');
    out.push('From '+nm('host')+' to '+nm('guest')+':',closing.host.t,'');
    out.push('From '+nm('guest')+' to '+nm('host')+':',closing.guest.t);
  }
  return out.join('\n')+'\n';
}

/* ---------- styles ---------- */
var CSS=[
'.cs{--l1a:#e0524f;--l1b:#9e1f2f;--l2a:#a8253f;--l2b:#5e0f22;--l3a:#6d1028;--l3b:#2e0510;--wa:#e88a5a;--wb:#a8324a;--cream:#fbf4e6;--cream2:#f3e6cc;--dk:#2b1016;--rose:#ff8fa3;',
'max-width:680px;margin:0 auto;padding:4px 0 30px;font-family:var(--font,inherit)}',
'.cs *{box-sizing:border-box}',
'.cs-hdr{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px}',
'.cs-title{font-weight:800;font-size:1.35rem;letter-spacing:.01em;background:linear-gradient(90deg,#ffb3a7,#ff5c7a,#c2185b);-webkit-background-clip:text;background-clip:text;color:transparent}',
'.cs-meta{display:flex;gap:6px;flex-wrap:wrap;font-weight:700;font-size:.85rem;color:var(--dim)}',
'.cs-pillm{background:rgba(255,255,255,.07);border:1px solid var(--line);border-radius:999px;padding:3px 11px}',
'.cs-passes{letter-spacing:.12em}',
/* journey */
'.cs-jour{position:relative;display:grid;grid-template-columns:repeat(4,1fr);margin:6px 0 14px;padding-top:4px}',
'.cs-jour::before{content:"";position:absolute;left:12.5%;right:12.5%;top:21px;height:4px;border-radius:4px;background:rgba(255,255,255,.1)}',
'.cs-jfill{position:absolute;left:12.5%;top:21px;height:4px;border-radius:4px;background:linear-gradient(90deg,var(--l1a),var(--l2a),var(--l3a),#ffd166);transition:width .6s cubic-bezier(.2,.8,.2,1);box-shadow:0 0 12px rgba(224,82,79,.6)}',
'.cs-stop{position:relative;text-align:center;z-index:1}',
'.cs-dot{width:36px;height:36px;margin:0 auto;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:800;background:#1d1733;border:2px solid rgba(255,255,255,.18);color:var(--dim);transition:all .3s}',
'.cs-stop.done .cs-dot{background:linear-gradient(135deg,var(--sa),var(--sb));border-color:transparent;color:#fff}',
'.cs-stop.cur .cs-dot{background:linear-gradient(135deg,var(--sa),var(--sb));border-color:#fff;color:#fff;box-shadow:0 0 0 5px rgba(255,143,163,.22),0 0 22px var(--sa);animation:cspulse 2s infinite}',
'.cs-stop small{display:block;margin-top:5px;font-size:.72rem;font-weight:700;color:var(--dim);line-height:1.2}',
'.cs-stop.cur small{color:var(--ink)}',
'.cs-stop .cnt{font-weight:600;opacity:.75}',
/* table + cards */
'.cs-table{border-radius:26px;padding:18px 16px 16px;background:radial-gradient(600px 300px at 50% 0%,rgba(224,82,79,.16),transparent 70%),linear-gradient(160deg,rgba(255,255,255,.04),rgba(255,255,255,.01));border:1px solid var(--line);box-shadow:0 14px 40px rgba(0,0,0,.4);text-align:center}',
'.cs-lead{color:var(--rose);font-weight:700;margin:0 0 12px;font-size:.98rem}',
'.cs-flip{perspective:1400px;max-width:430px;margin:0 auto}',
'.cs-inner{display:grid;transform-style:preserve-3d}',
'.cs-inner.anim{animation:csflip .8s cubic-bezier(.2,.75,.25,1)}',
'.cs-face,.cs-back{grid-area:1/1;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:22px;min-height:270px}',
'.cs-back{transform:rotateY(180deg)}',
'.cs-face{position:relative;background:linear-gradient(170deg,var(--cream),var(--cream2));color:var(--dk);padding:26px 24px 44px;display:flex;flex-direction:column;justify-content:center;box-shadow:0 18px 40px rgba(0,0,0,.45),inset 0 0 0 1px rgba(43,16,22,.08);text-align:left}',
'.cs-face::before{content:"";position:absolute;inset:9px;border:1.5px solid color-mix(in srgb,var(--ca) 45%,transparent);border-radius:16px;pointer-events:none}',
'.cs-chip{position:absolute;top:20px;left:22px;font-size:.68rem;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--ca)}',
'.cs-qt{font-size:1.5rem;line-height:1.32;font-weight:800;letter-spacing:-.01em;word-break:break-word;margin-top:14px}',
'.cs-brand{position:absolute;bottom:18px;left:22px;right:22px;display:flex;justify-content:space-between;font-size:.7rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(43,16,22,.45)}',
'.cs-back{position:relative;overflow:hidden;color:#fff;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;',
'background:repeating-linear-gradient(45deg,rgba(255,255,255,.06) 0 2px,transparent 2px 16px),repeating-linear-gradient(-45deg,rgba(255,255,255,.06) 0 2px,transparent 2px 16px),linear-gradient(150deg,var(--ca),var(--cb));box-shadow:0 18px 40px rgba(0,0,0,.45),inset 0 0 0 8px rgba(255,255,255,.07)}',
'.cs-back::before{content:"";position:absolute;inset:12px;border:1.5px solid rgba(255,255,255,.35);border-radius:15px}',
'.cs-back b{position:relative;font-size:1.65rem;font-weight:800;line-height:1.05;letter-spacing:-.01em;text-shadow:0 3px 16px rgba(0,0,0,.35)}',
'.cs-back span{position:relative;font-size:.74rem;letter-spacing:.2em;text-transform:uppercase;opacity:.85;font-weight:700}',
'.cs-back i{position:relative;font-style:normal;font-size:2rem}',
'.cs-c1{--ca:var(--l1a);--cb:var(--l1b)}.cs-c2{--ca:var(--l2a);--cb:var(--l2b)}.cs-c3{--ca:var(--l3a);--cb:var(--l3b)}.cs-cw{--ca:var(--wa);--cb:var(--wb)}.cs-cc{--ca:#c9973f;--cb:#7a1730}',
'.cs-c3 .cs-face::before{border-color:rgba(109,16,40,.4)}',
'.cs-stack{position:relative;max-width:430px;margin:0 auto 6px;cursor:default}',
'.cs-stack .cs-back{transform:none}',
'.cs-stack.can{cursor:pointer}.cs-stack.can:hover .cs-back{transform:translateY(-4px) rotate(-.6deg)}',
'.cs-stack .cs-back{transition:transform .2s;z-index:1}',
'.cs-stack::before,.cs-stack::after{content:"";position:absolute;inset:0;border-radius:22px;background:linear-gradient(150deg,var(--ca),var(--cb));opacity:.55;transform:translate(7px,7px) rotate(1.5deg)}',
'.cs-stack::after{opacity:.3;transform:translate(13px,12px) rotate(3deg)}',
'.cs-react{position:absolute;right:-10px;top:-14px;font-size:2.3rem;filter:drop-shadow(0 4px 10px rgba(0,0,0,.35));animation:csburst .6s}',
/* buttons and inputs */
'.cs button{margin:4px 0}',
'.cs-btn{background:linear-gradient(135deg,#ff6b81,#c2185b);color:#fff;border:0;border-radius:14px;box-shadow:0 6px 18px rgba(0,0,0,.35)}',
'.cs-btn.soft{background:rgba(255,255,255,.08);color:var(--ink);border:1px solid var(--line);box-shadow:none}',
'.cs-btn.gold{background:linear-gradient(135deg,#ffe08a,#ffb347);color:#2b1016}',
'.cs-btn.on{outline:3px solid rgba(255,255,255,.85)}',
'.cs-btn:disabled{opacity:.45}',
'.cs-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:8px}.cs-row>*{flex:1;min-width:140px}',
'.cs-ta{width:100%;min-height:92px;resize:vertical;font:inherit;font-size:1.02rem;line-height:1.4;padding:12px 14px;border-radius:14px;border:1.5px solid rgba(255,143,163,.35);background:rgba(12,6,20,.7);color:var(--ink);outline:none;margin-top:12px}',
'.cs-ta:focus{border-color:var(--rose);box-shadow:0 0 0 4px rgba(255,143,163,.2)}',
'.cs-sub{color:var(--dim);font-size:.93rem;margin:10px 0 0}',
'.cs-wait{color:var(--dim);font-style:italic;margin:14px 0 2px}',
'.cs-wait::after{content:"";display:inline-block;width:1.2em;text-align:left;animation:csdots 1.4s steps(4) infinite}',
'.cs-bub{background:rgba(255,255,255,.06);border:1px solid var(--line);border-left:4px solid var(--rose);border-radius:14px;padding:10px 14px;margin:10px 0 0;text-align:left;white-space:pre-wrap;word-break:break-word;animation:csslide .45s both}',
'.cs-bub small{display:block;color:var(--rose);font-size:.74rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-bottom:3px}',
'.cs-bub+.cs-bub{animation-delay:.18s}',
'.cs-emos{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:12px}',
'.cs-emo{font-size:1.45rem;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.07);border:1px solid var(--line);box-shadow:none;color:inherit}',
'.cs-emo.on{background:rgba(255,143,163,.25);border-color:var(--rose);transform:scale(1.12)}',
'.cs-note{text-align:center;color:#ffc2cc;font-size:.92rem;min-height:1.3em;margin:10px 0 0;font-style:italic}',
'.cs-note.big{font-style:normal;font-weight:800;font-size:1.05rem;color:#fff;animation:csburst .6s}',
'.cs-adv{margin-top:14px;padding:12px;border-radius:16px;border:1px dashed rgba(255,143,163,.4);background:rgba(255,143,163,.06);text-align:center}',
'.cs-adv p{margin:0 0 6px;font-size:.88rem;color:var(--dim)}',
'.cs-adv .cs-btn{width:100%}',
'.cs-foot{display:flex;gap:8px;justify-content:center;margin-top:14px}',
'.cs-foot button{font-size:.88rem;padding:9px 16px;border-radius:12px}',
/* doodle */
'.cs-pad{margin-top:12px}',
'.cs-pad canvas{width:100%;max-width:430px;aspect-ratio:5/3;display:block;margin:0 auto;border-radius:16px;background:var(--cream);touch-action:none;box-shadow:inset 0 0 0 2px rgba(43,16,22,.12),0 8px 22px rgba(0,0,0,.35)}',
'.cs-pad.live canvas{cursor:crosshair}',
'.cs-tools{display:flex;justify-content:center;align-items:center;gap:8px;margin-top:8px}.cs-tools[hidden]{display:none}',
'.cs-sw{width:28px;height:28px;border-radius:50%;padding:0;margin:0;border:2px solid rgba(255,255,255,.25);box-shadow:none}',
'.cs-sw.on{border-color:#fff;transform:scale(1.15)}',
'.cs-tools .cs-btn{padding:6px 12px;font-size:.82rem;margin:0}',
/* lobby, closing, lane */
'.cs-lv{display:grid;gap:10px;margin:14px 0;text-align:left}',
'.cs-lvi{display:flex;gap:12px;align-items:center;padding:12px 14px;border-radius:16px;background:linear-gradient(120deg,var(--ca),var(--cb));color:#fff;box-shadow:0 6px 16px rgba(0,0,0,.3)}',
'.cs-lvi i{font-style:normal;font-size:1.6rem}.cs-lvi b{display:block}.cs-lvi small{opacity:.85}',
'.cs-who{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:10px 0}',
'.cs-who span{padding:5px 12px;border-radius:999px;font-weight:700;font-size:.88rem;background:rgba(255,255,255,.07);border:1px solid var(--line)}',
'.cs-who span.ok{background:rgba(74,222,128,.15);border-color:rgba(74,222,128,.5)}',
'.cs-letters{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px;text-align:left}',
'.cs-letter{background:linear-gradient(170deg,var(--cream),var(--cream2));color:var(--dk);border-radius:18px;padding:18px 16px;white-space:pre-wrap;word-break:break-word;box-shadow:0 12px 28px rgba(0,0,0,.4);animation:csopen .7s both}',
'.cs-letter+.cs-letter{animation-delay:.25s}',
'.cs-letter small{display:block;font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;font-weight:800;color:#a8253f;margin-bottom:6px}',
'.cs-lane{margin-top:16px;text-align:left;border-radius:22px;padding:16px;background:rgba(0,0,0,.18);border:1px solid var(--line)}',
'.cs-lane h3{margin:0 0 4px;text-align:center}',
'.cs-lane h4{margin:14px 0 6px;font-size:.8rem;letter-spacing:.14em;text-transform:uppercase;color:var(--rose)}',
'.cs-ent{padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid var(--line);margin-bottom:8px}',
'.cs-ent .q{font-weight:800}.cs-ent .a{color:var(--dim);white-space:pre-wrap;word-break:break-word;margin-top:4px;font-size:.93rem}',
'.cs-ent canvas{width:150px;height:90px;border-radius:10px;background:var(--cream);display:block;margin-top:6px}',
'.cs-empty{color:var(--dim);text-align:center;font-style:italic}',
'@keyframes csflip{0%{transform:rotateY(180deg) translateY(-6px)}55%{transform:rotateY(-12deg) scale(1.03)}100%{transform:rotateY(0)}}',
'@keyframes csslide{0%{transform:translateY(8px);opacity:0}100%{transform:none;opacity:1}}',
'@keyframes csburst{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.25)}100%{transform:scale(1);opacity:1}}',
'@keyframes csopen{0%{transform:perspective(600px) rotateX(-80deg);transform-origin:top;opacity:0}100%{transform:none;opacity:1}}',
'@keyframes cspulse{0%,100%{box-shadow:0 0 0 5px rgba(255,143,163,.22),0 0 18px var(--sa)}50%{box-shadow:0 0 0 9px rgba(255,143,163,.08),0 0 30px var(--sa)}}',
'@keyframes csdots{0%{content:""}25%{content:"."}50%{content:".."}75%{content:"..."}}',
'@media (max-width:520px){.cs-qt{font-size:1.25rem}.cs-letters{grid-template-columns:1fr}.cs-stop small{font-size:.64rem}.cs-face,.cs-back{min-height:240px}}'
].join('');

/* ---------- UI ---------- */
function GAME_START(ctx){
  var me=ctx.me,isHost=!!ctx.isHost,partner=oth(me),names=ctx.names||{};
  var nm=function(r){return names[r]||(r==='host'?'Host':'Guest')};
  var root=ctx.root;root.innerHTML='';
  var st=document.createElement('style');st.textContent=CSS;root.appendChild(st);
  var wrap=document.createElement('div');wrap.className='cs';root.appendChild(wrap);
  var core=isHost?makeCore(ctx.seed,ctx.rng):null;
  var V=isHost?core.view('host'):null;
  var lastQ=-1,dead=false,ended=false,hiTimer=null,drafts={},lastFlip='',lastNote='',showLane=false,pad=null,penC=0;

  function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
  function btn(label,cls,fn,dis,actName){
    var b=el('button','cs-btn '+(cls||''),label);b.type='button';
    if(actName)b.setAttribute('data-act',actName);
    if(dis)b.disabled=true;
    b.onclick=function(){if(!dead&&!b.disabled)fn()};
    return b;
  }

  /* --- actions --- */
  function act(a){
    if(dead||!V)return;
    a.r=V.n;if(a.cv===undefined)a.cv=V.cv;
    if(isHost)hostDo('host',a);else ctx.send({k:'a',a:a});
  }
  function bcast(){ctx.send({k:'s',q:core.S.q,v:core.view('guest')})}
  function hostDo(role,a){
    if(!core.apply(role,a))return;
    core.S.q++;V=core.view('host');bcast();render();
  }

  /* --- clipboard / download --- */
  function copyText(t){
    function fallback(){
      try{var ta=document.createElement('textarea');ta.value=t;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();
        var ok=document.execCommand&&document.execCommand('copy');ta.remove();ctx.toast(ok?'Memory Lane copied 💌':'Could not copy, try Download instead')}
      catch(e){ctx.toast('Could not copy, try Download instead')}
    }
    try{
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(function(){ctx.toast('Memory Lane copied 💌')},fallback);
      else fallback();
    }catch(e){fallback()}
  }
  function download(t){
    try{
      var blob=new Blob([t],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob);
      var a=document.createElement('a');a.href=url;a.download='closer-than-strangers-memory-lane.txt';
      document.body.appendChild(a);a.click();
      setTimeout(function(){a.remove();URL.revokeObjectURL(url)},500);
    }catch(e){ctx.toast('Download failed, try Copy instead')}
  }

  /* --- doodle pad (the canvas element survives re-renders so strokes in progress are never lost) --- */
  function paint(c2d,w,h,strokes,lw){
    c2d.clearRect(0,0,w,h);c2d.fillStyle='#fbf4e6';c2d.fillRect(0,0,w,h);
    c2d.lineCap='round';c2d.lineJoin='round';c2d.lineWidth=lw;
    (strokes||[]).forEach(function(s){
      if(!s||!s.p||s.p.length<2)return;
      c2d.strokeStyle=PAL[s.c|0]||PAL[0];c2d.beginPath();
      c2d.moveTo(s.p[0]/1000*w,s.p[1]/1000*h);
      if(s.p.length===2)c2d.lineTo(s.p[0]/1000*w+.1,s.p[1]/1000*h+.1);
      for(var i=2;i<s.p.length;i+=2)c2d.lineTo(s.p[i]/1000*w,s.p[i+1]/1000*h);
      c2d.stroke();
    });
  }
  function getPad(){
    var key=V.n+':'+V.cv;
    if(pad&&pad.key===key)return pad;
    var P={key:key,live:false,cur:null,pending:[]};
    P.box=el('div','cs-pad');
    var cv=document.createElement('canvas');cv.width=600;cv.height=360;P.cv=cv;P.box.appendChild(cv);
    P.tools=el('div','cs-tools');
    P.sw=PAL.map(function(col,i){
      var s=el('button','cs-sw'+(i===penC?' on':''));s.type='button';s.style.background=col;s.title='Colour';
      s.onclick=function(){penC=i;P.sw.forEach(function(x,j){x.classList.toggle('on',j===i)})};
      P.tools.appendChild(s);return s;
    });
    var clr=el('button','cs-btn soft','Clear');clr.type='button';clr.setAttribute('data-act','clear');
    clr.onclick=function(){if(!dead&&P.live){P.pending=[];act({a:'clear'})}};
    P.tools.appendChild(clr);P.box.appendChild(P.tools);
    function pt(e){
      var r=cv.getBoundingClientRect(),w=r.width||1,h=r.height||1;
      return [Math.max(0,Math.min(1000,Math.round((e.clientX-r.left)/w*1000))),Math.max(0,Math.min(1000,Math.round((e.clientY-r.top)/h*1000)))];
    }
    cv.addEventListener('pointerdown',function(e){
      if(!P.live||dead)return;e.preventDefault();
      try{cv.setPointerCapture(e.pointerId)}catch(x){}
      var p=pt(e);P.cur={id:Math.random().toString(36).slice(2,12),c:penC,p:[p[0],p[1]]};repaint();
    });
    cv.addEventListener('pointermove',function(e){
      if(!P.cur)return;e.preventDefault();
      var p=pt(e),L=P.cur.p,dx=p[0]-L[L.length-2],dy=p[1]-L[L.length-1];
      if(dx*dx+dy*dy<36||L.length>=398)return;
      L.push(p[0],p[1]);repaint();
    });
    function up(){
      if(!P.cur)return;var s=P.cur;P.cur=null;
      if(!P.live)return repaint();
      P.pending.push(s);repaint();act({a:'stroke',s:s});
    }
    cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);cv.addEventListener('pointerleave',up);
    pad=P;return P;
  }
  function repaint(){
    if(!pad||!V)return;
    var have={};(V.doodle||[]).forEach(function(s){have[s.id]=1});
    pad.pending=pad.pending.filter(function(s){return !have[s.id]});
    var all=(V.doodle||[]).concat(pad.pending);if(pad.cur)all=all.concat([pad.cur]);
    try{paint(pad.cv.getContext('2d'),600,360,all,5)}catch(e){}
  }
  function padEl(live){
    var P=getPad();P.live=!!live;P.box.className='cs-pad'+(live?' live':'');P.tools.hidden=!live;
    if(!live)P.cur=null;
    repaint();return P.box;
  }

  /* --- small builders --- */
  function lvlCls(c){return c&&c.kind==='w'?'cs-cw':'cs-c'+((c&&c.lvl)||V.lvl)}
  function backEl(kind,lvl){
    var b=el('div','cs-back');
    if(kind==='w'){b.appendChild(el('i',null,'✦'));b.appendChild(el('b',null,'Wildcard'));b.appendChild(el('span',null,'Closer Than Strangers'))}
    else if(kind==='c'){b.appendChild(el('i',null,'✉️'));b.appendChild(el('b',null,'Closing Card'));b.appendChild(el('span',null,'Closer Than Strangers'))}
    else{b.appendChild(el('i',null,LVI[lvl]));var t=el('b');t.innerHTML='Closer<br>Than Strangers';b.appendChild(t);b.appendChild(el('span',null,'Level '+lvl+' · '+LVN[lvl]))}
    return b;
  }
  function cardEl(c,flipKey,extra){
    var f=el('div','cs-flip '+lvlCls(c));
    var inner=el('div','cs-inner');
    var face=el('div','cs-face');
    var chip=c.kind==='w'?'✦ Wildcard'+(c.mode==='both'?' · both of you':c.mode==='doodle'?' · doodle':''):'Level '+c.lvl+' · '+LVN[c.lvl];
    face.appendChild(el('div','cs-chip',chip));
    face.appendChild(el('div','cs-qt',c.text));
    var br=el('div','cs-brand');br.appendChild(el('span',null,'Closer Than Strangers'));br.appendChild(el('span',null,c.kind==='w'?'✦':LVI[c.lvl]));
    face.appendChild(br);
    if(extra)face.appendChild(extra);
    inner.appendChild(face);inner.appendChild(backEl(c.kind,c.lvl));
    f.appendChild(inner);
    if(flipKey&&flipKey!==lastFlip){lastFlip=flipKey;inner.classList.add('anim')}
    return f;
  }
  function closingCard(){
    var c={kind:'c',lvl:3,text:CLOSING};
    var f=el('div','cs-flip cs-cc'),inner=el('div','cs-inner'),face=el('div','cs-face');
    face.appendChild(el('div','cs-chip','✉ The Closing Card'));face.appendChild(el('div','cs-qt',c.text));
    var br=el('div','cs-brand');br.appendChild(el('span',null,'Closer Than Strangers'));br.appendChild(el('span',null,'✉'));face.appendChild(br);
    inner.appendChild(face);inner.appendChild(backEl('c',3));f.appendChild(inner);
    var key='closing:'+V.n;if(key!==lastFlip){lastFlip=key;inner.classList.add('anim')}
    return f;
  }
  function bubble(who,text){var b=el('div','cs-bub');b.appendChild(el('small',null,who));b.appendChild(document.createTextNode(text));return b}
  function wait(t){return el('p','cs-wait',t)}
  function textArea(name,ph,max,onChange){
    var key=name+':'+V.n+':'+V.cv;
    var ta=document.createElement('textarea');ta.className='cs-ta';ta.maxLength=max;ta.placeholder=ph;ta.setAttribute('data-name',name);
    ta.value=drafts[key]||'';
    ta.addEventListener('input',function(){drafts[key]=ta.value;if(onChange)onChange(ta.value)});
    return {ta:ta,key:key};
  }
  function ansText(a){
    if(!a)return '';
    if(a.call)return '📞 We talked about it on the call'+(a.t?'\n'+a.t:'');
    return a.t||'';
  }

  /* --- rendering --- */
  function render(){
    if(dead)return;
    var ae=document.activeElement,keepName=null,selS=0,selE=0;
    if(ae&&ae.getAttribute&&wrap.contains(ae)&&ae.getAttribute('data-name')){
      keepName=ae.getAttribute('data-name');
      try{selS=ae.selectionStart;selE=ae.selectionEnd}catch(e){}
    }
    wrap.innerHTML='';
    if(!V){
      wrap.appendChild(header());
      var w=el('div','cs-table');w.appendChild(wait('Connecting to '+nm('host')));wrap.appendChild(w);
      return;
    }
    wrap.setAttribute('data-phase',V.phase);
    wrap.setAttribute('data-lvl',String(V.lvl));
    wrap.setAttribute('data-count',String(V.lvlCount[V.lvl]||0));
    wrap.appendChild(header());
    wrap.appendChild(journey());
    var ph=V.phase;
    if(ph==='lobby')renderLobby();
    else if(ph==='draw'||ph==='answer'||ph==='reveal')renderRound();
    else if(ph==='closing')renderClosing();
    else renderFinal();
    if(ph!=='lobby'&&ph!=='final'&&ph!=='over'){
      var f=el('div','cs-foot');
      var lb=btn((showLane?'Hide':'📖 Memory Lane')+' ('+V.log.length+')','soft',function(){showLane=!showLane;render()});lb.id='cs-lanebtn';
      f.appendChild(lb);wrap.appendChild(f);
      if(showLane)wrap.appendChild(lane(false));
    }
    if(keepName){
      var inp=wrap.querySelector('[data-name="'+keepName+'"]');
      if(inp){try{inp.focus({preventScroll:true});inp.setSelectionRange(selS,selE)}catch(e){}}
    }
    if(ph==='over'&&!ended){
      ended=true;
      var n=V.log.length;
      ctx.end('Closer than ever 💞',n+' card'+(n===1?'':'s')+' shared across '+LVN[1]+', '+LVN[2]+' and '+LVN[3]+'. Your Memory Lane is waiting underneath.');
    }
  }
  function header(){
    var h=el('div','cs-hdr');
    h.appendChild(el('span','cs-title','💬 Closer Than Strangers'));
    var m=el('span','cs-meta');
    if(V&&(V.phase==='draw'||V.phase==='answer'||V.phase==='reveal')){
      m.appendChild(el('span','cs-pillm','Card '+((V.lvlCount[V.lvl]||0)+(V.phase==='reveal'?0:1))+' · Level '+V.lvl));
      var left=MAXPASS-V.passes[me];
      var p=el('span','cs-pillm cs-passes','Passes '+'●'.repeat(left)+'○'.repeat(MAXPASS-left));p.title='You can pass '+left+' more time'+(left===1?'':'s')+' this level';
      m.appendChild(p);
    }
    h.appendChild(m);return h;
  }
  function journey(){
    var j=el('div','cs-jour');
    var stage=V.phase==='lobby'?0:(V.phase==='closing'||V.phase==='final'||V.phase==='over')?4:V.lvl;
    var fill=el('div','cs-jfill');fill.style.width=(stage<=1?0:(stage-1)/3*75)+'%';j.appendChild(fill);
    var cols=[['#e0524f','#9e1f2f'],['#a8253f','#5e0f22'],['#6d1028','#2e0510'],['#ffd166','#c9973f']];
    for(var i=1;i<=4;i++){
      var s=el('div','cs-stop'+(i<stage?' done':i===stage?' cur':''));
      s.style.setProperty('--sa',cols[i-1][0]);s.style.setProperty('--sb',cols[i-1][1]);
      s.appendChild(el('div','cs-dot',i<stage?'✓':i===4?'✉':String(i)));
      var sm=el('small',null,i===4?'Closing Card':LVN[i]);
      if(i<4&&(V.lvlCount[i]||0)>0)sm.appendChild(el('span','cnt',' · '+V.lvlCount[i]));
      s.appendChild(sm);j.appendChild(s);
    }
    return j;
  }
  function renderLobby(){
    var t=el('div','cs-table');
    t.appendChild(el('h2',null,'A deck for the two of you'));
    t.appendChild(el('p','cs-sub','Take turns drawing. Whoever draws reads the card out loud and the other one answers. Type it, or just talk it through on your call. You get 3 passes per level, no explanations needed. Move on to the next level whenever you both feel ready.'));
    var lv=el('div','cs-lv');
    for(var l=1;l<=3;l++){
      var it=el('div','cs-lvi cs-c'+l);it.appendChild(el('i',null,LVI[l]));
      var d=el('div');d.appendChild(el('b',null,'Level '+l+' · '+LVN[l]));d.appendChild(el('small',null,LVD[l]));it.appendChild(d);lv.appendChild(it);
    }
    var wi=el('div','cs-lvi cs-cw');wi.appendChild(el('i',null,'✦'));
    var wd=el('div');wd.appendChild(el('b',null,'Wildcards'));wd.appendChild(el('small',null,'Little things to do over call or text: voice notes, love letters, doodles.'));wi.appendChild(wd);lv.appendChild(wi);
    t.appendChild(lv);
    var who=el('div','cs-who');
    ['host','guest'].forEach(function(r){who.appendChild(el('span',V.start[r]?'ok':'',(V.start[r]?'✓ ':'… ')+nm(r)+(V.start[r]?' is ready':'')))});
    t.appendChild(who);
    var mine=V.start[me];
    t.appendChild(btn(mine?'Waiting for '+nm(partner)+'…':'I\'m ready ✨','',function(){act({a:'start'})},mine,'start'));
    wrap.appendChild(t);
  }
  function noteEl(){
    var n=V.note,txt='',big=false;
    if(n&&n.k==='pass')txt=(n.by===me?'You':nm(n.by))+' passed. A fresh card is on the table.';
    else if(n&&n.k==='lvl'){txt=LVI[n.l]+' Level '+n.l+' · '+LVN[n.l];big=true}
    var key=JSON.stringify(n)+':'+V.cv;
    var e=el('p','cs-note'+(big?' big':''),txt);
    if(big&&key===lastNote)e.style.animation='none';
    lastNote=key;
    return e;
  }
  function renderRound(){
    var t=el('div','cs-table'),ph=V.phase,iDraw=V.drawer===me,ans=oth(V.drawer),c=V.card;
    if(ph==='draw'){
      t.appendChild(el('p','cs-lead',iDraw?'Your turn to draw':nm(V.drawer)+' is drawing a card'));
      var stack=el('div','cs-stack cs-c'+V.lvl+(iDraw?' can':''));stack.appendChild(backEl('q',V.lvl));
      if(iDraw)stack.onclick=function(){if(!dead)act({a:'draw'})};
      t.appendChild(stack);
      if(iDraw)t.appendChild(btn('Draw a card','',function(){act({a:'draw'})},false,'draw'));
      else t.appendChild(wait('Waiting for '+nm(V.drawer)));
      t.appendChild(noteEl());
      t.appendChild(advBox());
      wrap.appendChild(t);return;
    }
    var flipKey=V.n+':'+V.cv;
    var mode=c.mode;
    var lead='';
    if(mode==='both')lead=iDraw?'Wildcard! Read it out, then you both play':nm(V.drawer)+' drew a wildcard for both of you';
    else if(c.kind==='w')lead=iDraw?'Wildcard! Read it out, then do it':nm(V.drawer)+' drew a wildcard';
    else lead=iDraw?'Read this one to '+nm(ans)+' 👇':nm(V.drawer)+' drew a card for you';
    t.appendChild(el('p','cs-lead',lead));
    var rx=null;
    if(ph==='reveal'&&V.react){rx=el('div','cs-react',V.react);rx.title=nm(V.reactBy)+' reacted'}
    t.appendChild(cardEl(c,flipKey,rx));
    if(mode==='doodle')t.appendChild(padEl(ph==='answer'&&iDraw));
    if(ph==='answer'){
      if(mode==='both'){
        if(V.ans[me])t.appendChild(wait('Locked in 🔒 Waiting for '+nm(partner)));
        else{
          if(V.ans[partner])t.appendChild(el('p','cs-sub',nm(partner)+' has locked in an answer.'));
          t.appendChild(answerForm(true,'Your answer… (revealed when you\'ve both answered)'));
        }
      }else if(iDraw){
        if(mode==='say')t.appendChild(wait(nm(ans)+' is answering'));
        else if(mode==='doodle')t.appendChild(el('p','cs-sub','Draw in the box above. '+nm(ans)+' sees it live and marks it done.'));
        else t.appendChild(el('p','cs-sub','Your move! Do it over the call or by text, then '+nm(ans)+' marks it done.'));
      }else{
        if(mode==='say')t.appendChild(answerForm(true,'Type your answer… or just say it on the call'));
        else{
          t.appendChild(el('p','cs-sub',mode==='doodle'?nm(V.drawer)+' is doodling for you. Watch it appear above.':'Your partner\'s move. When '+nm(V.drawer)+' has done it, mark it done.'));
          t.appendChild(answerForm(false,'Add a note (optional)'));
        }
      }
      var left=MAXPASS-V.passes[me],canPass=left>0&&!V.ans.host&&!V.ans.guest;
      var pb=btn('Pass this card ('+left+' left)','soft',function(){act({a:'pass'})},!canPass,'pass');pb.title='Draw a new card. Nobody needs to know why.';
      var pr=el('div','cs-row');pr.appendChild(pb);t.appendChild(pr);
      t.appendChild(noteEl());
    }else{ /* reveal */
      if(mode==='both'){
        ['host','guest'].forEach(function(r){t.appendChild(bubble(r===me?'You':nm(r),ansText(V.ans[r])))});
        var a1=V.ans.host,a2=V.ans.guest;
        if(a1&&a2&&!a1.call&&!a2.call&&a1.t&&a1.t.toLowerCase()===a2.t.toLowerCase())t.appendChild(el('p','cs-note big','Same answer! 💞'));
      }else if(mode==='say'){
        t.appendChild(bubble((ans===me?'You':nm(ans))+' answered',ansText(V.ans[ans])));
      }else{
        var a=V.ans[ans],tx=a&&a.call?'📞 Done on the call':'✓ Done';
        if(a&&a.t)tx+='\n'+a.t;
        t.appendChild(bubble((ans===me?'You':nm(ans))+' marked it done',tx));
      }
      var canReact=mode==='both'||iDraw;
      if(canReact){
        var em=el('div','cs-emos');
        EMO.forEach(function(e){
          var b=btn(e,'cs-emo'+(V.react===e?' on':''),function(){act({a:'react',e:e})},false,'react');b.title='React';em.appendChild(b);
        });
        t.appendChild(em);
      }else if(!V.react)t.appendChild(el('p','cs-sub',nm(V.drawer)+' can react to your answer'));
      else t.appendChild(el('p','cs-sub',nm(V.reactBy)+' reacted '+V.react));
      var mine=V.ready[me];
      var nb=btn(mine?'Waiting for '+nm(partner)+'…':'Next card →','gold',function(){act({a:'ready'})},mine,'next');
      var nr=el('div','cs-row');nr.appendChild(nb);t.appendChild(nr);
      if(V.ready[partner]&&!mine)t.appendChild(el('p','cs-sub',nm(partner)+' is ready for the next card'));
      t.appendChild(advBox());
    }
    wrap.appendChild(t);
  }
  function answerForm(required,ph){
    var box=el('div');
    var send;
    var T=textArea('ans',ph,600,function(v){if(required)send.disabled=!v.trim()});
    box.appendChild(T.ta);
    var r=el('div','cs-row');
    send=btn(required?'Send answer':'Done ✓','',function(){
      var v=T.ta.value.trim();if(required&&!v)return;
      delete drafts[T.key];act({a:'answer',text:v});
    },required&&!T.ta.value.trim(),'send');
    var call=btn(required?'📞 We talked about it on the call':'📞 Did it on the call','soft',function(){
      var v=T.ta.value.trim();delete drafts[T.key];act({a:'answer',call:true,text:v});
    },false,'call');
    r.appendChild(send);r.appendChild(call);box.appendChild(r);
    return box;
  }
  function advBox(){
    var box=el('div','cs-adv');
    var cnt=V.lvlCount[V.lvl]||0;
    if(cnt<1){box.appendChild(el('p',null,'Tip: most couples enjoy 6 to 10 cards per level. Move on whenever it feels right.'));return box}
    var target=V.lvl<3?'Level '+(V.lvl+1)+' · '+LVN[V.lvl+1]:'the Closing Card ✉';
    var mine=V.adv[me],theirs=V.adv[partner];
    box.appendChild(el('p',null,mine?'You\'re ready for '+target+'.':theirs?nm(partner)+' is ready to move on to '+target+'.':'Feel ready to go deeper? You both need to agree.'));
    var label=mine?'Waiting for '+nm(partner)+' to agree (tap to cancel)':theirs?'Agree: on to '+target+' →':'I\'m ready for '+target+' →';
    var b=btn(label,mine?'soft on':'',function(){act({a:'adv',v:!mine})},false,'adv');
    b.setAttribute('data-on',mine?'1':'0');
    box.appendChild(b);
    return box;
  }
  function renderClosing(){
    var t=el('div','cs-table');
    t.appendChild(el('p','cs-lead','The last card is for both of you'));
    t.appendChild(closingCard());
    if(V.closing[me])t.appendChild(wait('Sealed 💌 Waiting for '+nm(partner)));
    else{
      if(V.closing[partner])t.appendChild(el('p','cs-sub',nm(partner)+' has sealed their message.'));
      var send;
      var T=textArea('close','Dear '+nm(partner)+',',1500,function(v){send.disabled=!v.trim()});
      t.appendChild(T.ta);
      send=btn('Seal my message 💌','',function(){
        var v=T.ta.value.trim();if(!v)return;delete drafts[T.key];act({a:'close',text:v});
      },!T.ta.value.trim(),'close');
      var r=el('div','cs-row');r.appendChild(send);t.appendChild(r);
    }
    t.appendChild(noteEl());
    wrap.appendChild(t);
  }
  function renderFinal(){
    var t=el('div','cs-table');
    t.appendChild(el('h2',null,V.phase==='over'?'Closer than ever 💞':'Open your letters 💌'));
    var L=el('div','cs-letters');
    [partner,me].forEach(function(r){
      var c=V.closing[r],d=el('div','cs-letter');
      d.appendChild(el('small',null,r===me?'You wrote to '+nm(partner):'From '+nm(r)+' to you'));
      d.appendChild(document.createTextNode((c&&c.t)||''));L.appendChild(d);
    });
    t.appendChild(L);
    if(V.phase==='final'){
      var mine=V.fin[me];
      t.appendChild(el('p','cs-sub','Save your Memory Lane below before you close the deck.'));
      var r=el('div','cs-row');
      r.appendChild(btn(mine?'Waiting for '+nm(partner)+'…':'Close the deck 💞','gold',function(){act({a:'fin'})},mine,'fin'));
      t.appendChild(r);
      if(V.fin[partner]&&!mine)t.appendChild(el('p','cs-sub',nm(partner)+' is ready to close the deck'));
    }
    wrap.appendChild(t);
    wrap.appendChild(lane(true));
  }
  function lane(withTools){
    var box=el('div','cs-lane');
    box.appendChild(el('h3',null,'📖 Memory Lane'));
    var txt=laneText(V.log,V.closing,nm);
    var r=el('div','cs-row');
    var cp=btn('Copy as text','soft',function(){copyText(txt)});cp.id='cs-copy';
    var dl=btn('Download .txt','soft',function(){download(txt)});dl.id='cs-dl';
    r.appendChild(cp);r.appendChild(dl);box.appendChild(r);
    if(!V.log.length){box.appendChild(el('p','cs-empty','Your answers will collect here as you play.'));return box}
    var lv=0;
    V.log.forEach(function(e){
      if(e.lvl!==lv){lv=e.lvl;box.appendChild(el('h4',null,LVI[lv]+' Level '+lv+' · '+LVN[lv]))}
      var d=el('div','cs-ent');
      d.appendChild(el('div','q',(e.kind==='w'?'✦ ':'')+e.text+(e.react?'  '+e.react:'')));
      var an=oth(e.drawer),lines=[];
      if(e.mode==='both')lines=[nm('host')+': '+ansText(e.ans.host),nm('guest')+': '+ansText(e.ans.guest)];
      else if(e.mode==='say')lines=[nm(an)+': '+ansText(e.ans[an])];
      else{var a=e.ans[an];lines=[nm(e.drawer)+' did it · '+nm(an)+(a&&a.call?' marked it done on the call':' marked it done')+(a&&a.t?': '+a.t:'')]}
      d.appendChild(el('div','a',lines.join('\n')));
      if(e.doodle&&e.doodle.length){
        var cv=document.createElement('canvas');cv.width=300;cv.height=180;
        try{paint(cv.getContext('2d'),300,180,e.doodle,3)}catch(x){}
        d.appendChild(cv);
      }
      box.appendChild(d);
    });
    return box;
  }

  /* --- incoming --- */
  function onMsg(d){
    if(dead||!d||typeof d!=='object')return;
    if(isHost){
      if(d.k==='a')hostDo('guest',d.a);
      else if(d.k==='hi')bcast();
    }else if(d.k==='s'){
      if(typeof d.q!=='number'||d.q<=lastQ||!d.v)return;
      lastQ=d.q;V=d.v;
      if(hiTimer){clearInterval(hiTimer);hiTimer=null}
      render();
    }
  }

  render();
  if(isHost)bcast();
  else{
    ctx.send({k:'hi'});
    hiTimer=setInterval(function(){if(dead||V){clearInterval(hiTimer);hiTimer=null;return}ctx.send({k:'hi'})},2000);
  }
  return {
    onMsg:onMsg,
    destroy:function(){dead=true;if(hiTimer){clearInterval(hiTimer);hiTimer=null}},
    _core:core
  };
}

registerGame({
  id:'strangers',icon:'💬',name:'Closer Than Strangers',
  blurb:'A conversation card game for couples: three levels from playful first impressions to heart-to-heart, wildcards, doodles and a closing letter.',
  start:GAME_START,
  _t:{Q:Q,WILD:WILD,makeCore:makeCore,shufWith:shufWith,laneText:laneText,MAXPASS:MAXPASS}
});
})();
