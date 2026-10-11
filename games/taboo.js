/* Taboo - 2 players, typed clues. Plugin for Duo Games. */
(function(){
'use strict';
var DUR=60, ROUNDS=6, MAXSKIP=3;

/* ---------- cards: 'target|t1,t2,t3,t4,t5' ---------- */
var RAW=[
'pizza|cheese,pepperoni,slice,italian,crust','hamburger|bun,patty,beef,fries,ketchup','spaghetti|pasta,noodles,sauce,meatballs,italian',
'chocolate|candy,sweet,cocoa,bar,brown','ice cream|cone,scoop,cold,vanilla,dessert','pancake|syrup,breakfast,flip,batter,stack',
'sandwich|bread,lunch,ham,slices,fillings','popcorn|movie,kernel,butter,microwave,snack','banana|yellow,peel,monkey,fruit,split',
'apple|fruit,red,tree,pie,cider','watermelon|seeds,summer,green,juicy,slice','coffee|caffeine,cup,morning,espresso,beans',
'tea|cup,hot,bag,leaves,kettle','sushi|rice,fish,japanese,raw,roll','taco|mexican,shell,tortilla,salsa,beef',
'donut|hole,glazed,sprinkles,ring,bakery','cookie|chips,oven,dough,biscuit,milk','cake|birthday,frosting,candles,bake,slice',
'bacon|pig,breakfast,crispy,strips,eggs','egg|chicken,yolk,shell,breakfast,omelette','cheese|milk,cheddar,mouse,pizza,dairy',
'salad|lettuce,greens,vegetables,dressing,healthy','soup|bowl,spoon,hot,broth,tomato','french fries|potato,fried,ketchup,salty,mcdonalds',
'lemonade|lemon,sour,sweet,drink,summer','hot dog|bun,sausage,mustard,ballpark,frankfurter','pumpkin|halloween,orange,pie,jack,carve',
'strawberry|red,berry,seeds,jam,fruit','carrot|orange,rabbit,vegetable,bunny,crunchy','potato|fries,mashed,chips,spud,vegetable',
'chicken|hen,rooster,coop,eggs,nuggets','turkey|thanksgiving,gobble,bird,stuffing,november','honey|bee,sweet,hive,sticky,bear',
'beach|sand,ocean,waves,sun,swim','library|books,quiet,librarian,borrow,shelves','hospital|doctor,nurse,sick,patient,emergency',
'airport|plane,flight,luggage,terminal,security','school|teacher,students,class,homework,learn','museum|art,exhibit,history,artifacts,paintings',
'zoo|animals,cage,lions,visit,monkeys','farm|barn,cows,tractor,crops,animals','castle|king,queen,medieval,tower,moat',
'desert|sand,dry,camel,hot,cactus','island|water,beach,surrounded,palm,tropical','volcano|lava,erupt,mountain,ash,magma',
'waterfall|cliff,river,falling,niagara,mist','supermarket|groceries,cart,aisle,checkout,shopping','restaurant|menu,waiter,table,dinner,chef',
'bakery|bread,pastries,cakes,oven,flour','cinema|movie,screen,popcorn,tickets,theater','playground|swings,slide,kids,park,children',
'bridge|river,cross,span,golden,road','pyramid|egypt,pharaoh,triangle,ancient,tomb','lighthouse|beacon,coast,ships,tower,light',
'igloo|ice,snow,eskimo,arctic,house','jungle|trees,tarzan,rainforest,vines,wild','camping|tent,campfire,sleeping,woods,marshmallows',
'umbrella|rain,wet,open,handle,shade','toothbrush|teeth,paste,bathroom,brush,clean','scissors|cut,paper,blades,snip,haircut',
'telephone|call,ring,dial,cell,number','camera|photo,picture,lens,flash,selfie','clock|time,hands,tick,hour,wall',
'mirror|reflection,glass,look,bathroom,face','key|lock,door,open,turn,metal','backpack|school,bag,straps,carry,hiking',
'pillow|bed,sleep,soft,head,feather','blanket|bed,warm,cover,cozy,quilt','candle|wax,flame,wick,light,birthday',
'ladder|climb,rungs,steps,roof,painter','bicycle|pedals,wheels,ride,helmet,handlebars','guitar|strings,music,pick,acoustic,strum',
'piano|keys,music,grand,black,white','sunglasses|sun,eyes,shades,lenses,cool','wallet|money,cash,pocket,cards,leather',
'suitcase|luggage,travel,pack,trip,clothes','television|watch,screen,remote,channel,show','refrigerator|cold,food,fridge,freezer,kitchen',
'microwave|oven,heat,popcorn,kitchen,beep','broom|sweep,witch,floor,dust,bristles','hammer|nail,tool,thor,pound,carpenter',
'balloon|air,helium,party,pop,float','parachute|jump,skydiving,plane,fall,silk','globe|world,earth,map,round,spin',
'trophy|winner,cup,gold,award,prize','robot|machine,metal,android,artificial,mechanical','rocket|space,launch,nasa,moon,fuel',
'helicopter|propeller,fly,blades,chopper,pilot','submarine|underwater,ship,periscope,navy,sea','bathtub|bath,water,soap,bathroom,bubbles',
'toilet|bathroom,flush,seat,restroom,potty','vacuum|clean,carpet,suck,dust,hoover','swimming|pool,water,dive,stroke,laps',
'dancing|music,move,ballroom,disco,rhythm','sleeping|bed,dream,tired,night,snore','cooking|kitchen,chef,food,recipe,stove',
'painting|brush,canvas,artist,colors,picture','fishing|rod,hook,bait,lake,catch','skiing|snow,mountain,poles,slope,winter',
'running|jog,race,fast,marathon,legs','reading|book,words,pages,novel,eyes','singing|song,voice,microphone,karaoke,notes',
'laughing|funny,joke,giggle,smile,haha','hiking|trail,mountain,boots,walk,trek','shopping|mall,buy,store,cart,bags',
'sneeze|achoo,nose,cold,tissue,allergy','yawn|tired,sleepy,mouth,bored,open','whisper|quiet,secret,soft,ear,loud',
'juggling|balls,circus,throw,catch,clown','surfing|wave,board,ocean,beach,wetsuit','birthday|cake,party,candles,present,age',
'wedding|bride,groom,marry,ring,ceremony','vacation|holiday,trip,travel,beach,hotel','exercise|gym,workout,fitness,muscles,sweat',
'shower|water,bathroom,soap,clean,wash','elephant|trunk,big,tusks,africa,gray','giraffe|neck,tall,spots,africa,long',
'penguin|antarctica,ice,tuxedo,waddle,bird','dolphin|ocean,flipper,smart,porpoise,swim','kangaroo|australia,pouch,hop,joey,jump',
'shark|fin,ocean,jaws,teeth,fish','octopus|tentacles,eight,ocean,ink,legs','butterfly|caterpillar,wings,insect,flutter,colorful',
'spider|web,eight,legs,arachnid,tarantula','snake|slither,reptile,venom,hiss,scales','owl|night,hoot,bird,wise,feathers',
'bat|wings,cave,vampire,night,fly','lion|king,jungle,roar,mane,cat','tiger|stripes,cat,orange,jungle,roar',
'bear|polar,teddy,grizzly,honey,fur','monkey|banana,ape,tree,zoo,primate','frog|pond,hop,green,toad,ribbit',
'turtle|shell,slow,reptile,sea,ninja','horse|ride,saddle,gallop,farm,pony','cow|milk,moo,farm,bull,cattle',
'pig|oink,farm,pork,bacon,mud','sheep|wool,lamb,baa,farm,flock','duck|quack,pond,bird,waddle,feathers',
'goldfish|bowl,pet,swim,orange,aquarium','whale|ocean,big,blue,mammal,spout','bee|honey,sting,buzz,hive,flower',
'dinosaur|jurassic,extinct,fossil,prehistoric,bones','dragon|fire,breathing,wings,mythical,knight','unicorn|horse,horn,mythical,magical,rainbow',
'superhero|cape,powers,mask,comic,save','pirate|ship,treasure,parrot,eyepatch,sea','princess|prince,crown,castle,royal,disney',
'wizard|magic,wand,spell,beard,hogwarts','cowboy|horse,hat,western,boots,ranch','astronaut|space,moon,nasa,rocket,suit',
'ninja|japanese,martial,stealth,black,sword','zombie|undead,brain,walking,dead,apocalypse','vampire|blood,fangs,dracula,bat,garlic',
'ghost|haunted,spooky,boo,spirit,halloween','mermaid|tail,ocean,ariel,fish,half','detective|clues,mystery,sherlock,investigate,crime',
'cartoon|animated,tv,drawn,kids,disney','movie|film,cinema,actor,watch,popcorn','concert|music,band,stage,tickets,crowd',
'karaoke|sing,microphone,lyrics,song,machine','video game|console,play,controller,nintendo,screen','selfie|photo,phone,camera,picture,self',
'emoji|smiley,face,text,phone,icon','santa claus|christmas,reindeer,north,presents,red','snowman|snow,carrot,winter,frosty,build',
'christmas|santa,tree,december,presents,holiday','halloween|costume,candy,october,trick,pumpkin','fireworks|explode,july,sky,boom,celebration',
'magician|magic,trick,rabbit,hat,wand','clown|circus,nose,funny,makeup,red','circus|tent,clown,elephants,acrobats,ringmaster',
'basketball|hoop,dribble,nba,court,orange','soccer|goal,kick,football,ball,pitch','baseball|bat,pitcher,diamond,mlb,glove',
'tennis|racket,court,serve,net,wimbledon','golf|club,hole,green,tiger,course','boxing|gloves,ring,punch,fight,champion',
'bowling|pins,strike,alley,ball,lane','hockey|puck,ice,stick,goalie,nhl','volleyball|net,spike,beach,serve,ball',
'skateboard|wheels,ramp,tricks,deck,ride','gymnastics|flip,balance,olympics,beam,tumbling','archery|bow,arrow,target,shoot,aim',
'karate|martial,kick,belt,black,chop','olympics|games,medal,gold,athletes,rings','referee|whistle,rules,game,foul,umpire',
'marathon|running,race,miles,long,finish','rainbow|colors,rain,sky,arc,seven','snowflake|snow,winter,cold,ice,unique',
'thunder|lightning,storm,loud,rain,boom','tornado|wind,twister,storm,funnel,spinning','earthquake|shake,ground,tremor,richter,fault',
'mountain|climb,peak,high,hill,everest','river|water,flow,stream,bank,fish','ocean|sea,water,waves,blue,salt',
'forest|trees,woods,wild,animals,green','sunset|evening,sun,sky,orange,dusk','moon|night,sky,full,space,lunar',
'star|sky,night,twinkle,shine,galaxy','cloud|sky,rain,white,fluffy,weather','flower|petals,bloom,garden,rose,smell',
'cactus|desert,spikes,prickly,plant,thorns','tree|leaves,branches,forest,trunk,wood','grass|green,lawn,mow,field,blade',
'fire|flame,burn,hot,smoke,match','ice|cold,frozen,cube,water,melt','sun|sky,hot,bright,day,star',
'leaf|tree,green,autumn,fall,plant','alarm clock|wake,morning,beep,bed,time','homework|school,assignment,teacher,study,evening',
'traffic|cars,jam,road,rush,slow','laundry|clothes,wash,dirty,machine,dryer','dishwasher|dishes,kitchen,clean,plates,machine',
'neighbor|next,door,house,friendly,street','password|login,secret,account,type,computer','email|message,inbox,send,computer,internet',
'wifi|internet,router,connection,password,signal','smartphone|apps,mobile,touchscreen,iphone,call','elevator|lift,floors,button,building,up',
'escalator|stairs,moving,mall,steps,ride','haircut|barber,scissors,hair,salon,trim','dentist|teeth,drill,cavity,mouth,appointment',
'doctor|nurse,hospital,medicine,patient,stethoscope','teacher|school,class,students,lesson,chalkboard','firefighter|fire,truck,hose,rescue,ladder',
'police|officer,badge,arrest,siren,cop','passport|travel,airport,country,stamp,id','sunscreen|sun,lotion,burn,beach,spf',
'traffic light|red,green,yellow,stop,go','postcard|mail,stamp,vacation,send,picture','pajamas|sleep,bed,night,clothes,comfy',
'sneakers|shoes,running,laces,gym,nike','jacket|coat,warm,zipper,sleeves,winter','hat|head,cap,wear,brim,sun',
'necklace|neck,jewelry,chain,pendant,wear'
];
var CARDS=RAW.map(function(s){var p=s.split('|');return {w:p[0],t:p[1].split(',')}});

/* ---------- pure matchers ---------- */
function tokens(s){
  s=String(s||'').toLowerCase();
  try{s=s.normalize('NFD').replace(/[̀-ͯ]/g,'')}catch(e){}
  s=s.replace(/['’]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  return s?s.split(' '):[];
}
function sameWord(w,f){
  if(w===f||w+'s'===f||w===f+'s'||w+'es'===f||w===f+'es')return true;
  if(w.length>=4&&f.length>=4&&(w.indexOf(f)===0||f.indexOf(w)===0))return true;
  return false;
}
/* returns the offending forbidden phrase (string) or null */
function tabooHit(text,card){
  var typed=tokens(text);if(!typed.length)return null;
  var cand=typed.slice();
  for(var i=0;i+1<typed.length;i++)cand.push(typed[i]+typed[i+1]);
  var phrases=[card.w].concat(card.t);
  for(var p=0;p<phrases.length;p++){
    var toks=tokens(phrases[p]),forms=toks.slice();
    if(toks.length>1)forms.push(toks.join(''));
    for(var a=0;a<cand.length;a++)for(var b=0;b<forms.length;b++){
      if(sameWord(cand[a],forms[b]))return phrases[p];
    }
  }
  return null;
}
function lev(a,b){
  var m=a.length,n=b.length,d=[],i,j;
  for(i=0;i<=m;i++){d[i]=[i]}for(j=0;j<=n;j++)d[0][j]=j;
  for(i=1;i<=m;i++)for(j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
  return d[m][n];
}
function guessKey(s){return tokens(s).filter(function(w){return w!=='the'&&w!=='a'&&w!=='an'}).join('')}
function guessMatch(text,target){
  var g=guessKey(text),t=guessKey(target);
  if(!g||!t)return false;
  if(g===t||g+'s'===t||g===t+'s'||g+'es'===t||g===t+'es')return true;
  if(t.length>=7&&Math.abs(g.length-t.length)<=1&&lev(g,t)<=1)return true;
  return false;
}

/* ---------- styles ---------- */
var CSS=[
'.tb{--acc:#ff7a45;max-width:640px;margin:0 auto;padding:4px 0 28px;animation:tbpop .25s}',
'@keyframes tbpop{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
'.tb .card{background:linear-gradient(150deg,var(--card2),var(--card));border:1px solid var(--line);border-radius:22px;box-shadow:var(--shadow);padding:20px}',
'.tb .card h2{font-size:1.9rem;margin:.1em 0;background:linear-gradient(90deg,var(--acc),var(--gold));-webkit-background-clip:text;background-clip:text;color:transparent}',
'.tb .card button.big{background:linear-gradient(135deg,#ffa36b,var(--acc));color:#2a0f05;margin-top:12px}',
'.tb .card button.big:disabled{background:rgba(255,255,255,.1);color:var(--dim)}',
'.tb-hdr{display:flex;justify-content:space-between;align-items:center;gap:8px;color:var(--ink);font-weight:700;margin-bottom:10px}',
'.tb-hdr>span:not(.tb-time){background:rgba(255,255,255,.07);border:1px solid var(--line);border-radius:999px;padding:6px 14px;font-size:.92rem}',
'.tb-time{display:flex;align-items:center;justify-content:center;width:68px;height:68px;border-radius:50%;font:800 1.7rem var(--font,system-ui),sans-serif;color:var(--acc);background:radial-gradient(circle,var(--card) 62%,transparent 64%),conic-gradient(var(--acc),var(--gold),var(--acc));box-shadow:0 0 22px rgba(255,122,69,.35)}',
'.tb-time.low{color:var(--bad);background:radial-gradient(circle,var(--card) 62%,transparent 64%),conic-gradient(var(--bad),#ff9aa4,var(--bad));animation:tbpulse .6s infinite alternate;box-shadow:0 0 26px rgba(255,90,106,.6)}',
'@keyframes tbpulse{from{transform:scale(1)}to{transform:scale(1.12)}}',
'.tb-role{text-align:center;font-weight:800;font-size:.95rem;color:#2a0f05;background:linear-gradient(135deg,#ffa36b,var(--acc));border-radius:999px;padding:7px 14px;margin:0 auto 12px;width:fit-content;max-width:100%}',
'.tb-card{background:#fff6e0;border:4px solid #fff;border-radius:18px;padding:0 0 14px;text-align:center;overflow:hidden;box-shadow:var(--shadow),0 0 0 3px var(--acc)}',
'.tb-word{background:linear-gradient(180deg,#e63946,#b5202c);color:#fff;font-size:clamp(1.8rem,8vw,2.8rem);font-weight:800;line-height:1.1;text-transform:uppercase;letter-spacing:.04em;word-break:break-word;padding:16px 12px;text-shadow:0 3px 0 rgba(0,0,0,.25)}',
'.tb-forb{display:flex;flex-direction:column;align-items:stretch;gap:0;margin:10px 18px 0}',
'.tb-forb span{color:#b5202c;font-weight:800;font-size:1.05rem;letter-spacing:.06em;text-transform:uppercase;padding:6px 0;border-bottom:1px solid rgba(181,32,44,.25)}',
'.tb-forb span:last-child{border-bottom:0}',
'.tb-forb span::before{content:"\\26D4  ";font-size:.85em}',
'.tb-hidden{color:#6b3a2a;font-weight:800;font-size:1.1rem;padding:22px 16px 8px}',
'.tb-feed{background:rgba(8,8,24,.55);border:1px solid var(--line);border-radius:18px;padding:10px;margin:12px 0;height:34vh;min-height:180px;overflow-y:auto;display:flex;flex-direction:column;gap:7px}',
'.tb-msg{max-width:85%;padding:8px 13px;border-radius:16px;word-break:break-word;background:rgba(255,255,255,.1);animation:tbpop .2s}',
'.tb-msg small{display:block;opacity:.65;font-size:.7rem;font-weight:700;margin-bottom:1px}',
'.tb-msg.clue{align-self:flex-start;background:linear-gradient(135deg,rgba(255,122,69,.38),rgba(255,122,69,.18));border:1px solid rgba(255,122,69,.5);border-bottom-left-radius:4px}',
'.tb-msg.guess{align-self:flex-end;background:rgba(255,255,255,.1);color:var(--dim);border:1px solid var(--line);border-bottom-right-radius:4px}',
'.tb-msg.ok{align-self:center;max-width:95%;background:linear-gradient(135deg,#4ade80,#22c55e);color:#04210f;font-weight:800;animation:tbconf .6s}',
'@keyframes tbconf{0%{transform:scale(.6);opacity:0;box-shadow:0 0 0 0 rgba(74,222,128,.9)}50%{transform:scale(1.12);opacity:1}100%{transform:scale(1);box-shadow:0 0 0 22px rgba(74,222,128,0)}}',
'.tb-msg.sys{align-self:center;background:transparent;color:var(--dim);font-size:.82rem;padding:2px}',
'.tb-form{display:flex;gap:8px}.tb-form input{flex:1;margin:0}.tb-form button{margin:0;flex:0 0 auto;background:linear-gradient(135deg,#ffa36b,var(--acc));color:#2a0f05}',
'.tb-form input:focus{border-color:var(--acc);box-shadow:0 0 0 4px rgba(255,122,69,.25)}',
'.tb-err{color:var(--bad);font-weight:800;min-height:1.4em;margin:6px 2px 2px}',
'.tb-shake{animation:tbshake .4s}@keyframes tbshake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}',
'.tb-form input.tb-shake{border-color:var(--bad);box-shadow:0 0 0 4px rgba(255,90,106,.3)}',
'.tb-ctl{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:8px}',
'.tb-ctl button{margin:0}.tb-ctl .tip{background:rgba(255,255,255,.07);border:1px solid var(--line);border-radius:999px;padding:6px 14px}',
'.tb-list{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:12px 0;padding:0;list-style:none}',
'.tb-list li{padding:6px 14px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid var(--line);font-weight:700;text-transform:capitalize}',
'.tb-center{text-align:center}'
].join('');

function GAME_START(ctx){
  var SPD=(typeof window!=='undefined'&&typeof window.TABOO_SPEED==='number'&&window.TABOO_SPEED>1)?window.TABOO_SPEED:1,dur=DUR/SPD;
  var me=ctx.me,partner=me==='host'?'guest':'host',names=ctx.names||{};
  var nm=function(r){return names[r]||(r==='host'?'Host':'Guest')};
  var order=ctx.shuffle(CARDS.map(function(_,i){return i}));
  var round=0,phase='break',kind='intro',upcoming=0,pos=0,skips=0;
  var score=0,roundScore=0,results=[],roundLog=[],ready={},iReady=false;
  var t0=0,timer=null,dead=false,ended=false,feedEl=null,inputEl=null,errEl=null,cardEl=null,timeEl=null,hdrScore=null,countEl=null;

  var root=ctx.root;root.innerHTML='';
  var st=document.createElement('style');st.textContent=CSS;root.appendChild(st);
  var wrap=document.createElement('div');wrap.className='tb';root.appendChild(wrap);

  function giverOf(r){return r%2===0?'host':'guest'}
  function amGiver(){return giverOf(round)===me}
  function curCard(){return CARDS[order[pos%order.length]]}
  function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
  function focusInput(){if(inputEl){try{inputEl.focus({preventScroll:true})}catch(e){inputEl.focus()}}}
  function secsLeft(){return Math.max(0,Math.ceil((t0+dur*1000-Date.now())/1000))}
  function stopTimer(){if(timer){clearInterval(timer);timer=null}}

  function header(){
    var h=el('div','tb-hdr');
    h.appendChild(el('span',null,'Round '+Math.min(round+1,ROUNDS)+'/'+ROUNDS));
    timeEl=el('span','tb-time',phase==='play'?String(secsLeft()):String(Math.ceil(dur)));h.appendChild(timeEl);
    hdrScore=el('span',null,'Team '+score);h.appendChild(hdrScore);
    wrap.appendChild(h);
  }
  function updScore(){if(hdrScore)hdrScore.textContent='Team '+score}

  /* ----- break screens (intro / summary) ----- */
  function renderBreak(){
    stopTimer();wrap.innerHTML='';feedEl=inputEl=errEl=cardEl=timeEl=hdrScore=countEl=null;
    var c=el('div','card tb-center');
    var key=upcoming,last=key>=ROUNDS;
    if(kind==='intro'){
      c.appendChild(el('h2',null,'🤐 Taboo'));
      c.appendChild(el('p','tip','Take turns: one types clues WITHOUT using the secret word or the forbidden words, the other types guesses. 60 seconds a round, 6 rounds, one shared team score. Clues containing a forbidden word are blocked before they are sent.'));
    }else{
      c.appendChild(el('h2',null,'Round '+(round+1)+' summary'));
      c.appendChild(el('p','tip',nm(giverOf(round))+' gave clues • this round: '+roundScore+' • team: '+score));
      var ul=el('ul','tb-list');
      if(!results.length)ul.appendChild(el('li',null,'No cards played'));
      results.forEach(function(r){
        ul.appendChild(el('li',null,(r.r==='ok'?'✅ ':r.r==='skip'?'⏭️ ':'⌛ ')+r.w));
      });
      c.appendChild(ul);
      c.appendChild(el('p','tip','Rounds so far: '+roundLog.map(function(x,i){return (i+1)+':'+x}).join('  ')));
    }
    if(!last){
      var g=giverOf(key);
      c.appendChild(el('p',null,'Next: Round '+(key+1)+' — '+nm(g)+' gives clues, '+nm(g==='host'?'guest':'host')+' guesses'+(g===me?' (that is you!)':'')));
    }
    var btn=el('button','big '+(last?'':'alt'),last?'See final score':'Ready!');
    if(iReady){btn.disabled=true;btn.textContent='Waiting for '+nm(partner)+'…'}
    btn.onclick=function(){
      if(iReady||dead)return;iReady=true;
      (ready[key]=ready[key]||{})[me]=true;
      ctx.send({k:'ready',key:key});
      btn.disabled=true;btn.textContent='Waiting for '+nm(partner)+'…';
      checkReady(key);
    };
    c.appendChild(btn);
    wrap.appendChild(c);
  }
  function checkReady(key){
    var r=ready[key];
    if(!r||!r.host||!r.guest||key!==upcoming||phase!=='break')return;
    if(key>=ROUNDS){finish();return}
    round=key;iReady=false;
    if(amGiver())beginRound();
    else{phase='await';renderAwait()}
  }
  function renderAwait(){
    stopTimer();wrap.innerHTML='';feedEl=inputEl=errEl=cardEl=countEl=null;header();
    var c=el('div','card tb-center');
    c.appendChild(el('h3',null,'Get ready!'));
    c.appendChild(el('p','tip',nm(giverOf(round))+' is about to start giving clues…'));
    wrap.appendChild(c);
  }

  /* ----- play ----- */
  function beginRound(){
    phase='play';roundScore=0;results=[];skips=0;
    ctx.send({k:'start',r:round});
    ctx.send({k:'card',r:round,i:pos});
    startTimer();renderPlay();
  }
  function startTimer(){
    stopTimer();t0=Date.now();
    timer=setInterval(tick,200/SPD);
  }
  function tick(){
    if(dead||phase!=='play'){stopTimer();return}
    var s=secsLeft();
    if(timeEl){timeEl.textContent=String(s);timeEl.className='tb-time'+(s<=10?' low':'')}
    if(s<=0){
      stopTimer();
      if(amGiver())endRoundGiver();
      else{if(inputEl)inputEl.disabled=true;addFeed('sys',"Time's up! Waiting for results…")}
    }
  }
  function addFeed(cls,text,who){
    if(!feedEl)return;
    var m=el('div','tb-msg '+cls);
    if(who){m.appendChild(el('small',null,who))}
    m.appendChild(document.createTextNode(text));
    feedEl.appendChild(m);feedEl.scrollTop=feedEl.scrollHeight;
  }
  function renderPlay(){
    wrap.innerHTML='';header();
    var giver=amGiver();
    wrap.appendChild(el('div','tb-role',giver?'You give the clues — type them, never use the forbidden words':'You guess — '+nm(giverOf(round))+' is typing clues'));
    cardEl=el('div','tb-card');wrap.appendChild(cardEl);
    if(giver)drawCard();else drawHidden();
    feedEl=el('div','tb-feed');wrap.appendChild(feedEl);
    errEl=el('div','tb-err');wrap.appendChild(errEl);
    var form=document.createElement('form');form.className='tb-form';form.setAttribute('autocomplete','off');
    inputEl=document.createElement('input');inputEl.type='text';inputEl.maxLength=giver?140:60;
    inputEl.placeholder=giver?'Type a clue…':'Type your guess…';
    inputEl.setAttribute('enterkeyhint','send');inputEl.setAttribute('autocapitalize','off');inputEl.setAttribute('autocorrect','off');
    var sb=el('button','pink',giver?'Send':'Guess');sb.type='submit';
    form.appendChild(inputEl);form.appendChild(sb);wrap.appendChild(form);
    form.addEventListener('submit',function(e){e.preventDefault();if(giver)submitClue();else submitGuess()});
    if(giver){
      var ctl=el('div','tb-ctl');
      var sk=el('button','ghost','');sk.type='button';sk.id='tb-skip';
      sk.onclick=doSkip;ctl.appendChild(sk);
      countEl=el('span','tip','');ctl.appendChild(countEl);wrap.appendChild(ctl);
      updSkip();
    }
    focusInput();
  }
  function updSkip(){
    var sk=wrap.querySelector('#tb-skip');
    if(sk){sk.textContent='Skip ('+(MAXSKIP-skips)+' left)';sk.disabled=skips>=MAXSKIP||phase!=='play'}
    if(countEl)countEl.textContent='Guessed this round: '+roundScore;
  }
  function drawCard(){
    var c=curCard();cardEl.innerHTML='';
    cardEl.appendChild(el('div','tb-word',c.w));
    var f=el('div','tb-forb');c.t.forEach(function(w){f.appendChild(el('span',null,w))});cardEl.appendChild(f);
  }
  function drawHidden(){
    if(!cardEl)return;
    cardEl.innerHTML='';
    cardEl.appendChild(el('div','tb-hidden','Card #'+(pos+1)+' — '+nm(giverOf(round))+' sees the word, you guess it!'));
  }
  function showErr(msg){
    if(!errEl)return;
    errEl.textContent=msg;errEl.classList.remove('tb-shake');void errEl.offsetWidth;errEl.classList.add('tb-shake');
    if(inputEl){inputEl.classList.remove('tb-shake');void inputEl.offsetWidth;inputEl.classList.add('tb-shake')}
  }
  function submitClue(){
    if(phase!=='play'||!amGiver())return;
    var text=inputEl.value.trim();if(!text)return;
    if(tabooHit(text,curCard())){showErr("That's a taboo word!");focusInput();return}
    errEl.textContent='';
    addFeed('clue',text,'You');
    ctx.send({k:'clue',r:round,text:text});
    inputEl.value='';focusInput();
  }
  function submitGuess(){
    if(phase!=='play'||amGiver()||secsLeft()<=0)return;
    var text=inputEl.value.trim();if(!text)return;
    addFeed('guess',text,'You');
    ctx.send({k:'guess',r:round,text:text});
    inputEl.value='';focusInput();
  }
  function nextCard(){
    pos++;ctx.send({k:'card',r:round,i:pos});
    drawCard();updSkip();
  }
  function doSkip(){
    if(phase!=='play'||!amGiver()||skips>=MAXSKIP)return;
    skips++;results.push({w:curCard().w,r:'skip'});
    addFeed('sys','You skipped a card');
    ctx.send({k:'skip',r:round,left:MAXSKIP-skips});
    nextCard();focusInput();
  }
  function endRoundGiver(){
    if(phase!=='play')return;
    results.push({w:curCard().w,r:'time'});
    ctx.send({k:'time',r:round,results:results,score:score,rs:roundScore});
    toSummary();
  }
  function toSummary(){
    stopTimer();phase='break';kind='summary';roundLog[round]=roundScore;
    upcoming=round+1;iReady=false;
    renderBreak();
    checkReady(upcoming); /* partner may already be ready */
  }
  function finish(){
    if(ended)return;ended=true;
    var best=0;roundLog.forEach(function(s,i){if(s>roundLog[best])best=i});
    var n=roundLog[best]||0;
    ctx.end('Team score: '+score,'Best round: Round '+(best+1)+' ('+nm(giverOf(best))+' clued) with '+n+' word'+(n===1?'':'s'));
  }

  /* ----- incoming ----- */
  function onMsg(d){
    if(dead||!d||typeof d!=='object')return;
    switch(d.k){
      case 'ready':
        (ready[d.key]=ready[d.key]||{})[partner]=true;
        checkReady(d.key);break;
      case 'start':
        if(giverOf(d.r)===me||phase==='play')return; /* only the guesser reacts */
        round=d.r;phase='play';roundScore=0;results=[];
        startTimer();renderPlay();break;
      case 'card':
        if(phase!=='play'||d.r!==round||amGiver())return;
        pos=d.i|0;drawHidden();break;
      case 'clue':
        if(phase!=='play'||d.r!==round||amGiver())return;
        addFeed('clue',String(d.text||'').slice(0,200),nm(partner));break;
      case 'skip':
        if(phase!=='play'||d.r!==round||amGiver())return;
        addFeed('sys',nm(partner)+' skipped a card');break;
      case 'guess':
        if(phase!=='play'||d.r!==round||!amGiver())return;
        var g=String(d.text||'').slice(0,100);
        addFeed('guess',g,nm(partner));
        if(guessMatch(g,curCard().w)){
          score++;roundScore++;results.push({w:curCard().w,r:'ok'});
          addFeed('ok','✓ Correct: '+curCard().w);
          ctx.send({k:'right',r:round,guess:g,score:score,rs:roundScore});
          updScore();nextCard();
        }
        break;
      case 'right':
        if(phase!=='play'||d.r!==round||amGiver())return;
        score=d.score|0;roundScore=d.rs|0;updScore();
        addFeed('ok','✓ Correct! +1');break;
      case 'time':
        if(d.r!==round||amGiver()||phase!=='play')return;
        results=Array.isArray(d.results)?d.results:[];score=d.score|0;roundScore=d.rs|0;
        toSummary();break;
    }
  }

  renderBreak();
  return {
    onMsg:onMsg,
    destroy:function(){dead=true;stopTimer()}
  };
}

registerGame({
  id:'taboo',icon:'🤐',name:'Taboo',
  blurb:'Type clues without the forbidden words while your partner guesses. 6 rounds, one team score.',
  start:GAME_START,
  _test:{tokens:tokens,tabooHit:tabooHit,guessMatch:guessMatch,cards:CARDS}
});
})();
