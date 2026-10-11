/* Spicy Nights - 2 players, adult couples' dirty-talk game (Truth / Dare / Never Have I Ever / Would You Rather).
   Text and voice only. Plugin for Duo Games. The host is the single authority for the game state;
   the guest sends requests and renders the snapshots it gets back, so the two screens can never diverge. */
(function(){
'use strict';

/* ---------- card bank ----------
   {p} = the other player (truth/dare), "my partner" (never), "your partner" (would you rather).
   Would-you-rather cards are 'option A|option B'. */
var BANK={truth:{1:[],2:[],3:[]},dare:{1:[],2:[],3:[]},nhie:{1:[],2:[],3:[]},wyr:{1:[],2:[],3:[]}};
function add(t,l,arr){BANK[t][l]=arr}

add('truth',1,[
"What was the very first thing you noticed about {p}?",
"When did you first realize you were falling for {p}?",
"What do you love most about {p}'s smile?",
"Describe the best kiss you can remember with {p}.",
"What's a compliment you've been dying to give {p} but haven't yet?",
"What is it about {p}'s voice that gets to you?",
"Where is your favourite place to be kissed?",
"What's the most romantic thing you'd love {p} to do for you?",
"Which outfit of {p}'s makes your heart skip a beat?",
"Which song makes you think of {p}, and why?",
"What's your favourite way to cuddle with {p}?",
"What little thing does {p} do that secretly drives you wild?",
"Describe your dream date night with {p}, start to finish.",
"When did you last blush because of {p}?",
"What's the cheesiest pick-up line that would actually work on you?",
"What went through your head the first time you held {p}'s hand?",
"What of {p}'s would you happily steal and wear all day?",
"What does a perfect lazy morning in bed with {p} look like?",
"What's the most attractive thing about the way {p} moves?",
"Have you ever daydreamed about {p} at a totally inconvenient moment? What was it?",
"What's your favourite memory of the two of you being close?",
"What flirty text do you wish {p} would send you more often?",
"Which part of {p}'s face do you love looking at most?",
"If {p} were beside you right now, what would you want to be doing?",
"What pet name for {p} do you secretly love saying?",
"What's the most tempting thing about the way {p} smells?"]);
add('truth',2,[
"What's a turn-on of yours that you think {p} doesn't know about?",
"Describe the moment you first wanted {p} badly.",
"What's the sexiest thing {p} has ever whispered to you?",
"Where on your body do you most love {p}'s touch?",
"What's your favourite thing {p} has ever done in bed?",
"Tell {p} the dirtiest thought you've had about them this week.",
"If you had the whole night with {p}, what would you want them to do to you?",
"What's the most daring place you'd consider fooling around with {p}?",
"Which part of {p}'s body do you think about most?",
"What kind of kissing turns you on the most?",
"What's a fantasy about {p} that you haven't told them yet?",
"What do you love most about the way {p} undresses you?",
"What do you wish {p} would do more of in the bedroom?",
"When you're alone and thinking of {p}, what's the first image that comes to mind?",
"What's your favourite sound to hear {p} make?",
"What do you think of yourself wearing that drives {p} wild, and how do you want them to react?",
"What would your ideal slow, teasing evening with {p} involve?",
"What's the hottest dream you've ever had that starred {p}?",
"What would you love {p} to do to your neck?",
"What would you do if {p} walked in right now wearing only a towel?",
"How do you most like to be woken up by {p}?",
"When did {p} last turn you on without even touching you?",
"Which memory of the two of you makes you smile and squirm at the same time?",
"What's your favourite position with {p}, and what makes it so good?",
"What's a sexy word or phrase you'd love to hear {p} say?",
"What would you like {p} to tease you about tonight?"]);
add('truth',3,[
"Describe in detail your most explicit fantasy involving {p}.",
"What's the dirtiest thing you want {p} to say to you in bed?",
"If you had {p} all to yourself for one hour, with everything agreed in advance, what would you do first?",
"What kink are you curious to explore with {p}?",
"Tell {p} exactly how you like to be touched when you're desperate for it.",
"What's the filthiest thought you've ever had about {p}, and where were you when you had it?",
"What do you picture when you touch yourself and think of {p}?",
"Which of {p}'s habits instantly makes you want to rip their clothes off?",
"What's your wildest idea for a night with {p} that you've been too shy to say out loud?",
"Describe how you'd like {p} to take control of you.",
"Describe how you'd like to take control of {p}.",
"What word would drive you crazy if {p} said it in your ear?",
"What do you want to do to {p}'s body that you haven't done yet?",
"What's the most intense moment you've shared with {p}, and what exactly happened?",
"Which role-play scenario would you be up for with {p}?",
"How long would you want to tease {p} before finally giving them what they want?",
"Which of your moves do you think makes {p} lose all their composure?",
"Describe a fantasy where you and {p} are in a locked hotel room with thin walls.",
"What would you do to {p} with a blindfold and a feather?",
"What's the dirtiest compliment you could give {p} right now?",
"Tell {p} what you'd do to them in the shower, step by step.",
"What would you whisper to {p} just before you start?",
"What does {p} do in bed that you think about at really inappropriate times?",
"If {p} handed you complete control for the night, what's the first thing you'd tell them to do?",
"Which sound does {p} make that completely undoes you?",
"What's the one thing you'd love {p} to say to you tonight, word for word?"]);

add('dare',1,[
"Type out three things you adore about {p}, with a kiss emoji after each one.",
"Whisper a flirty compliment to {p} in your sexiest voice.",
"Describe your perfect kiss with {p} in exactly three sentences.",
"Deliver your best pick-up line to {p} with a completely straight face.",
"Write a two-line love poem about {p}'s eyes.",
"Tell {p} what you'd do if you two were cuddling on the sofa right now.",
"Invent a flirty nickname for {p} and use it in a sentence.",
"Describe {p}'s lips in the most romantic way you can.",
"Use the word “irresistible” in a sentence about {p}, as seductively as possible.",
"Type the good-morning text you'd send {p} if you'd just woken up thinking about them.",
"Name three places you'd like to kiss {p}, with a tiny reason for each.",
"Give {p} a slow, dramatic compliment like a movie star.",
"Describe the outfit you'd wear to seduce {p} on a fancy date.",
"Narrate the perfect goodnight kiss like a nature documentary host.",
"For the next 30 seconds, speak to {p} only in flirty questions.",
"Write {p} a list of “reasons I can't stop thinking about you” with at least four items.",
"Tell {p} which song you'd slow-dance to and exactly how you'd hold them.",
"Blow {p} a kiss in words: describe it so vividly they can feel it.",
"Describe how you'd greet {p} at the door after weeks apart.",
"Compliment {p}'s hands in a way that makes them blush.",
"Do your best sultry impression of saying {p}'s name.",
"Tell {p} what you'd whisper into their ear on a dance floor.",
"Describe your dream cuddle position with {p} and why it's perfect.",
"Type out the first line of a romance novel starring you and {p}.",
"Tell {p} one thing you'd love to do with them at sunrise.",
"Write a tiny flirty voicemail script for {p} and read it aloud with feeling."]);
add('dare',2,[
"Describe in detail how you'd kiss {p}'s neck if they were here right now.",
"Type out a steamy two-paragraph scene starring you and {p} in a hotel room.",
"Tell {p}, slowly and in your lowest voice, what you want to do to them tonight.",
"Describe your favourite part of {p}'s body and exactly what you'd do with it.",
"Narrate how you'd slowly undress {p}, one piece at a time.",
"Whisper three things you find sexy about {p}, ending each with their name.",
"Describe what you'd do if {p} pinned you against the wall right now.",
"Type your most seductive goodnight message, as steamy as a late-night radio host.",
"Describe the lingerie or underwear you wish you were wearing for {p} tonight, and what you'd hope they'd do about it.",
"Describe the massage you'd give {p}, starting at the shoulders and working lower.",
"Describe how you'd tease {p} for five full minutes before even kissing them.",
"Talk {p} through the best make-out session you can imagine.",
"Whisper a secret fantasy to {p} in under 60 seconds.",
"Describe, in sensory detail, how {p} tastes when you kiss them.",
"Type out what you and {p} would do on a rainy day with nowhere to be.",
"Use three food words in a seductive description of {p}.",
"Give {p} the dirtiest compliment you can think of without swearing.",
"Describe exactly how you'd like {p} to touch the small of your back.",
"Finish this sentence five different ways: “Tonight I want you to…”",
"Describe how you'd run your fingers through {p}'s hair, and what comes next.",
"Whisper what you'd do if {p} sat on your lap right now.",
"Describe the way you'd kiss {p} from their ear down to their collarbone.",
"Type a text that would make {p} want to leave work early.",
"Tell {p} in your best breathy voice what you've been fantasising about this week.",
"Describe a slow dance with {p} that ends up in the bedroom.",
"Play a sexy narrator: describe {p} walking into the room as the lead in a steamy film."]);
add('dare',3,[
"Describe in explicit detail what you'd do to {p} if they were in bed with you right now.",
"Type out a dirty, detailed paragraph about the best night the two of you could have.",
"Tell {p} in a low voice exactly where you want their hands and mouth, step by step.",
"Whisper the filthiest thing you want to hear {p} say back to you.",
"Narrate, minute by minute, a ten-minute fantasy where you take all the time in the world with {p}.",
"Describe how you'd like {p} to take the lead tonight, and what you'd say when they do.",
"Describe how you'd take the lead with {p}, and what you'd say to them.",
"Type out a dirty-talk monologue as if you were whispering into {p}'s ear.",
"Describe your favourite way to make {p} lose control, including every sound you'd love to hear.",
"Tell {p} a detailed fantasy involving a blindfold, ice and plenty of patience.",
"Talk {p} through your ideal foreplay-only evening, with absolutely no rush.",
"Describe exactly what you'd do with {p} in a hotel shower with no time limit.",
"Say the dirtiest thing you've ever wanted to say to {p}, in your sexiest voice.",
"Describe, with as much detail as you like, the position you'd choose tonight and why.",
"Write a steamy six-sentence story with {p} as the star and you as the narrator.",
"Tell {p} in detail what you'd do with your mouth if all they had to do was lie back.",
"Describe what you'd do if {p} told you, “tonight, you're in charge.”",
"Describe the rules and the safeword you'd agree on before {p} takes charge, then what happens next.",
"Describe a sexy role-play scenario in vivid detail: who you are, who {p} is, and how it begins.",
"Tell {p} three things you want to do to them tonight, each one filthier than the last.",
"Describe how you'd want to be woken up by {p}, in all the detail you can.",
"Narrate the moment you and {p} finally give in to each other after a whole day of teasing.",
"Type or whisper the most explicit compliment about {p}'s body that you can think of.",
"Describe the sounds you imagine {p} making and what causes each one.",
"Describe the aftercare you'd give {p} — cuddles, water, whispers — after the most intense night ever.",
"Make up a dirty bedtime story for {p} that ends with the two of you very, very happy."]);

add('nhie',1,[
"kissed someone in the rain.",
"sent a flirty text to the wrong person.",
"blushed because of a compliment from my partner.",
"fallen asleep on a call with someone I liked.",
"kissed someone on a first date.",
"written a love letter or romantic message that I never sent.",
"stared at a photo of my partner for far too long.",
"made out in a car.",
"flirted with someone just to see if it would work.",
"danced very close with someone I liked.",
"daydreamed about a stranger I spotted in a café.",
"been completely smitten after a single look.",
"kissed someone at midnight on New Year's Eve.",
"pretended to be busy so I could text someone I liked.",
"practised a pick-up line in the mirror.",
"gone on a date I was way too nervous for.",
"held hands at the cinema.",
"planned a whole outfit around impressing one person.",
"sung a love song to someone.",
"had a “just friends” moment that felt like much more.",
"stolen a hoodie from someone I liked.",
"secretly sniffed a piece of clothing because it reminded me of someone.",
"lost track of time while kissing.",
"flirted with my own reflection.",
"wanted to kiss my partner at a totally wrong moment.",
"read a flirty message twenty times."]);
add('nhie',2,[
"had a dream about my partner that I was too embarrassed to share.",
"sent a spicy text I instantly regretted.",
"made out somewhere I could have been seen.",
"worn something specifically to tempt someone.",
"been turned on by a voice alone.",
"been tipsy and extra honest about what I wanted.",
"been teased in a way that left me wanting much more.",
"had a favourite spot on my partner's body.",
"given a massage that got out of hand.",
"fantasised about my partner during a meeting.",
"left a mark on someone's neck.",
"invented an excuse to get closer to my partner.",
"had a crush on a character in a steamy show.",
"read or listened to something steamy and gotten flustered.",
"kissed someone until my lips were sore.",
"been caught staring at someone's body.",
"skipped plans to stay in bed with someone.",
"whispered something naughty in public.",
"practised a seductive move in the mirror.",
"tried a new bedroom idea after hearing about it.",
"had a hot encounter that I still think about.",
"sent a late-night “come over” text.",
"been too turned on to concentrate on anything else.",
"made the first move even though I was nervous.",
"flirted shamelessly to get a free drink.",
"forgotten where I was because of a kiss."]);
add('nhie',3,[
"been so turned on I couldn't speak properly.",
"dirty-talked someone over the phone.",
"had a steamy dream I couldn't tell anyone about.",
"tried a blindfold or a silk tie in the bedroom.",
"had a fantasy involving role-play.",
"wanted to be told exactly what to do in bed.",
"wanted to tell someone exactly what to do in bed.",
"stayed in bed all day with a lover.",
"been woken up in a very pleasant way.",
"gotten carried away somewhere not quite private.",
"written down a fantasy.",
"used a toy with a partner.",
"wished my partner was here for something very specific, right now.",
"practised dirty talk in the mirror.",
"had a sexy dream that left me restless all morning.",
"been teased until I could barely stand it.",
"made someone shiver with just a whisper.",
"planned an entire seduction in my head.",
"skipped dinner because dessert of a different kind was calling.",
"cut a date short to get to the bedroom.",
"imagined my partner doing something I'm too shy to ask for.",
"wanted someone's undivided attention in a very specific way.",
"gotten lost in a fantasy during a quiet moment.",
"used whipped cream in a not-so-innocent way.",
"said something filthy and immediately blushed.",
"thought about my partner in a way that would make my grandmother faint."]);

add('wyr',1,[
"Slow dance in the kitchen every night|Get a kiss on the forehead every morning",
"Get a love letter every week|Get a surprise date every month",
"Spend a weekend cuddling under blankets|Spend a weekend exploring a new city hand in hand",
"Kiss in the rain|Kiss under fireworks",
"Hear your partner sing to you|Hear your partner read you a story",
"Have breakfast in bed every Sunday|Have a candlelit dinner every Friday",
"Be called “gorgeous” every day|Be called “my favourite person” every day",
"Share one hoodie forever|Share one playlist forever",
"Hold hands everywhere you go|Kiss hello and goodbye every single time",
"Flirt by text all day long|Flirt face to face for one perfect evening",
"Stargaze together all night|Watch the sunrise together after an all-nighter",
"Get a surprise massage|Get a surprise bubble bath drawn for you",
"Always be the little spoon|Always be the big spoon",
"A romantic weekend in the mountains|A romantic weekend on a beach",
"Receive a perfect compliment every day|Receive a perfect hug every day",
"Dance with your partner in public|Dance with your partner in the living room",
"Be serenaded|Be written a poem",
"Make out in a movie theatre|Make out on a rooftop at night",
"Know exactly what your partner thinks about you|Hear them say it out loud",
"Recreate your first date|Plan a brand new first date",
"Have your partner cook you dinner|Cook your partner dinner while they watch you",
"Wake up to soft kisses|Fall asleep to soft whispers",
"Share a bubble bath|Share a picnic blanket",
"A long slow kiss every day|A long tight hug every day",
"Get flirty voice notes all day|Get flirty handwritten notes all day",
"A kiss on the neck|A kiss on the hand"]);
add('wyr',2,[
"Be teased all day, then satisfied at night|Get everything immediately, with no build-up",
"Whisper dirty things to your partner in public|Receive dirty whispers from your partner in public",
"Give a sensual massage|Receive a sensual massage",
"Lights on|Candles only",
"Make love slowly for hours|Have a passionate quickie",
"Be kissed slowly down your whole body|Be kissed all over your neck",
"Undress your partner slowly|Be undressed slowly by your partner",
"Spend a whole day in bed together|Go out dancing, then head straight home together",
"Have your partner wear your shirt|Wear your partner's shirt",
"A steamy shower together|A steamy bath together",
"Whisper exactly what you want|Be told exactly what your partner wants",
"Make the first move|Be seduced",
"Blindfold your partner|Be blindfolded by your partner",
"A sexy playlist for tonight|A sexy movie for tonight",
"Share chocolate-dipped strawberries|Share a bottle of wine in bed",
"Be teased with a feather|Be teased with an ice cube",
"Get a seductive voicemail|Leave your partner a seductive voicemail",
"Morning intimacy|Midnight intimacy",
"Dirty talk the whole time|Complete silence except for sighs",
"Hear your partner describe a fantasy|Describe one to them",
"Role-play as strangers meeting at a bar|Role-play as old flames reuniting",
"Wear something your partner picked out for you|Pick out something for your partner to wear for you",
"A slow dance that turns heated|A card game with spicy stakes",
"An hour of foreplay only|An hour of dirty talk only",
"Be playfully pinned against a door|Be playfully carried to the bed",
"Hear “I need you” whispered|Hear “I want you” growled"]);
add('wyr',3,[
"Take total control for a night, with a safeword|Hand total control to your partner for a night, with a safeword",
"Be teased to the edge for an hour|Tease your partner to the edge for an hour",
"Hear explicit dirty talk all night|Give explicit dirty talk all night",
"Try a blindfold and silk ties|Try ice and a feather",
"Have your partner narrate everything they're doing to you|Narrate everything you're doing to your partner",
"Make your partner wait a whole day for you|Be made to wait a whole day by your partner",
"A hotel night with absolutely no plans|A fantasy night following a script you both agreed on",
"Phone sex with your partner|An entire evening of sexting with your partner",
"Role-play rival executives|Role-play strangers on a night train",
"Spend a day only allowed to whisper dirty things|Spend a day only allowed to touch, never to talk",
"Trade fantasies and fulfil one of each|Write a fantasy together and act it out",
"Be told what to do step by step|Tell your partner what to do step by step",
"Be on your partner's mind all day|Keep your partner thinking about you all day with dirty texts",
"Try something completely new together|Revisit a favourite of yours together",
"Have an hour of being worshipped|Spend an hour worshipping your partner",
"Be woken up with a surprise|Wake your partner up with a surprise",
"One marathon night|Repeated quickies all day long",
"Be told you're irresistible all night|Tell your partner they're irresistible all night",
"A mirror beside the bed|Total darkness",
"Whipped cream|Chocolate sauce",
"Drive each other to the edge with only words|Drive each other to the edge with only touch",
"A secret dirty signal across a dinner table|Dirty texts under the table at dinner",
"Slow and teasing|Fast and desperate",
"Hear your partner's deepest fantasy|Share your own deepest fantasy first",
"A night where you can say anything with zero judgment|A night where you act out one thing you both agreed on",
"A dirty voicemail from your partner every morning|A dirty note in your pocket every morning"]);

var LV=['','Flirty','Spicy','Wild'],LVI=['','💋','🔥','😈'];
var PERIOD=6;

/* ---------- pure helpers ---------- */
function hash(s){var h=7;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h)}
function shufWith(arr,rnd){var a=arr.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(rnd()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
function range(n){var a=[];for(var i=0;i<n;i++)a.push(i);return a}
function levelFor(cfg,n){return Math.min(3,cfg.lvl+(cfg.esc?Math.floor(n/PERIOD):0))}
function fill(raw,type,n,names){
  var act=n%2===0?'host':'guest',oth=act==='host'?'guest':'host';
  var p=type==='td'?((names&&names[oth])||(oth==='host'?'Host':'Guest')):type==='nhie'?'my partner':'your partner';
  return String(raw).replace(/\{p\}/g,p);
}

/* ---------- host-side authoritative state machine ---------- */
function makeCore(seed,rngf){
  seed=seed|0;
  var S={q:0,phase:'lobby',cfg:{lvl:1,esc:false},n:0,type:null,lvl:1,maxLvl:1,choice:null,card:null,cv:0,tries:0,
    pick:{host:null,guest:null},more:null,reasons:{host:null,guest:null},ans:null,ready:{host:false,guest:false},note:'',done:0};
  var decks={},blocks=[],brng=rngf(seed+31);
  function typeFor(n){var b=Math.floor(n/3);while(blocks.length<=b)blocks.push(shufWith(['td','nhie','wyr'],brng));return blocks[b][n%3]}
  function draw(t,l){
    var k=t+l;
    if(!decks[k])decks[k]={o:shufWith(range(BANK[t][l].length),rngf(seed+101+hash(k))),p:0};
    var d=decks[k],i=d.o[d.p%d.o.length];d.p++;
    return {raw:BANK[t][l][i],lvl:l};
  }
  function actor(){return S.n%2===0?'host':'guest'}
  function cardType(){return S.type==='td'?S.choice:S.type}
  function resetRound(){
    S.choice=null;S.card=null;S.cv=0;S.tries=0;S.pick={host:null,guest:null};S.more=null;
    S.reasons={host:null,guest:null};S.ans=null;S.ready={host:false,guest:false};
  }
  function beginRound(){
    resetRound();
    S.type=typeFor(S.n);
    S.lvl=levelFor(S.cfg,S.n);
    if(S.lvl>S.maxLvl)S.maxLvl=S.lvl;
    if(S.type==='td')S.phase='choose';
    else{S.phase='pick';S.card=draw(S.type,S.lvl)}
  }
  function advance(){
    var before=levelFor(S.cfg,S.n);
    S.n++;S.done++;
    beginRound();
    S.note=(S.lvl>before)?'The heat is rising 🔥':'';
  }
  function txt(s,max){return String(s==null?'':s).replace(/\s+/g,' ').trim().slice(0,max||400)}
  /* returns true when state changed */
  function apply(role,a){
    if(!a||typeof a!=='object'||(role!=='host'&&role!=='guest'))return false;
    var k=a.a,other=role==='host'?'guest':'host';
    if(S.phase==='lobby'){
      if(role!=='host')return false;
      if(k==='cfg'){
        var ch=false;
        if(a.lvl===1||a.lvl===2||a.lvl===3){if(S.cfg.lvl!==a.lvl){S.cfg.lvl=a.lvl;ch=true}}
        if(typeof a.esc==='boolean'){if(S.cfg.esc!==a.esc){S.cfg.esc=a.esc;ch=true}}
        return ch;
      }
      if(k==='start'){S.n=0;S.done=0;S.maxLvl=S.cfg.lvl;S.note='';beginRound();return true}
      return false;
    }
    if(k==='cfg'||k==='start')return false;
    if((a.r|0)!==S.n)return false; /* stale round */
    var ph=S.phase;
    if(k==='skip'||k==='pause'){
      if(ph!=='choose'&&ph!=='respond'&&ph!=='judge'&&ph!=='pick')return false;
      if((a.cv|0)!==S.cv)return false; /* someone already swapped this card */
      if(k==='pause')S.lvl=S.lvl>1?S.lvl-1:1;
      if(ph==='choose'){
        if(k==='skip'){advance();S.note='Card swapped';return true}
        S.cv++;S.note='Card swapped';return true; /* the lowered heat applies when the card is drawn */
      }
      S.card=draw(cardType(),S.lvl);S.cv++;S.note='Card swapped';
      S.tries=0;S.ans=null;
      if(S.type==='td')S.phase='respond';
      else{S.pick={host:null,guest:null};S.phase='pick'}
      return true;
    }
    if(S.type==='td'){
      if(k==='choose'&&ph==='choose'&&role===actor()&&(a.c==='truth'||a.c==='dare')){
        S.choice=a.c;S.card=draw(a.c,S.lvl);S.phase='respond';S.cv++;S.note='';return true;
      }
      if((a.cv|0)!==S.cv&&(k==='answer'||k==='done'||k==='judge'))return false;
      if(k==='answer'&&ph==='respond'&&S.choice==='truth'&&role===actor()){
        var t=txt(a.text,500);if(!t)return false;S.ans=t;S.phase='done';return true;
      }
      if(k==='done'&&ph==='respond'&&S.choice==='dare'&&role===actor()){S.phase='judge';return true}
      if(k==='judge'&&ph==='judge'&&role===other_of_actor()){
        if(a.ok){S.phase='done'}else{S.tries++;S.phase='respond'}
        return true;
      }
    }else{
      if(k==='pick'&&ph==='pick'){
        if((a.cv|0)!==S.cv||S.pick[role]!==null)return false;
        var ok=S.type==='nhie'?(a.v==='have'||a.v==='not'):(a.v==='A'||a.v==='B');
        if(!ok)return false;
        S.pick[role]=a.v;
        if(S.pick[other]!==null)S.phase='reveal';
        return true;
      }
      if(k==='more'&&ph==='reveal'&&S.type==='nhie'&&!S.more&&S.pick[other]==='have'){
        S.more={ask:role,story:null};return true;
      }
      if(k==='story'&&ph==='reveal'&&S.more&&S.more.story===null&&role!==S.more.ask){
        var s=txt(a.text,600);if(!s)return false;S.more.story=s;return true;
      }
      if(k==='reason'&&ph==='reveal'&&S.type==='wyr'&&S.reasons[role]===null){
        var rs=txt(a.text,300);if(!rs)return false;S.reasons[role]=rs;return true;
      }
    }
    if(k==='ready'&&(ph==='done'||ph==='reveal')){
      if(S.ready[role])return false;
      S.ready[role]=true;
      if(S.ready.host&&S.ready.guest)advance();
      return true;
    }
    return false;
  }
  function other_of_actor(){return actor()==='host'?'guest':'host'}
  function view(role){
    var v={},k;
    for(k in S)v[k]=S[k];
    v.cfg={lvl:S.cfg.lvl,esc:S.cfg.esc};
    var o=role==='host'?'guest':'host';
    v.pick={host:S.pick.host,guest:S.pick.guest};
    if(S.phase!=='reveal'&&S.pick[o]!==null)v.pick[o]='?';
    return v;
  }
  return {S:S,apply:apply,view:view,draw:draw,typeFor:typeFor};
}

/* ---------- styles ---------- */
var CSS=[
'.sp{--a:#ff4d6d;--a2:#c9184a;--hc:#ff8fb1;--glow:rgba(255,77,109,.35);--ink2:#ffd9e4;max-width:700px;margin:0 auto;padding:6px 0 30px;font-family:var(--font,inherit)}',
'.sp *{box-sizing:border-box}',
'.sp-hdr{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap}',
'.sp-title{font-weight:800;font-size:1.35rem;letter-spacing:.02em;background:linear-gradient(90deg,#ff4d6d,#e0239b,#9b6bff);-webkit-background-clip:text;background-clip:text;color:transparent}',
'.sp-meta{display:flex;gap:8px;align-items:center;color:var(--dim);font-weight:700;font-size:.9rem}',
'.sp-round{background:rgba(255,255,255,.07);border:1px solid var(--line);border-radius:999px;padding:3px 12px}',
'.sp-heat{background:rgba(255,77,109,.14);color:var(--ink2);border:1px solid rgba(255,77,109,.45);border-radius:999px;padding:3px 12px;letter-spacing:.02em}',
'.sp-box{position:relative;border:1px solid transparent;border-radius:24px;padding:22px 18px;margin:12px 0;text-align:center;box-shadow:0 14px 40px rgba(0,0,0,.45),0 0 44px var(--glow);',
'background-image:linear-gradient(160deg,#2a0f2c,#150f2d 70%),linear-gradient(135deg,var(--hc),var(--a2),#9b6bff);background-origin:border-box;background-clip:padding-box,border-box}',
'.sp-box.h1{--hc:#ffb3cf;--a:#ff6f9f;--a2:#e85d8f;--glow:rgba(255,143,177,.28)}',
'.sp-box.h2{--hc:#ffb347;--a:#ff6a3d;--a2:#e03a1e;--glow:rgba(255,106,61,.34)}',
'.sp-box.h3{--hc:#ff2e63;--a:#d4145a;--a2:#7a1fa2;--glow:rgba(180,20,100,.48)}',
'.sp-chip{display:inline-block;font-size:.74rem;font-weight:800;letter-spacing:.16em;color:#fff;background:linear-gradient(135deg,var(--a),var(--a2));border-radius:999px;padding:4px 14px;margin-bottom:12px;box-shadow:0 4px 12px rgba(0,0,0,.3)}',
'.sp-text{font-size:1.45rem;line-height:1.4;font-weight:700;color:#fff;word-break:break-word;text-shadow:0 2px 14px rgba(0,0,0,.4)}',
'.sp-sub{color:var(--dim);margin:10px 0 0;font-size:.95rem}',
'.sp-turn{text-align:center;color:var(--ink2);font-weight:700;margin:8px 0 0}',
'.sp-row{display:flex;gap:10px;flex-wrap:wrap}.sp-row>*{flex:1;min-width:110px}',
'.sp button{margin:4px 0}',
'.sp-btn{background:linear-gradient(135deg,var(--a),var(--a2));color:#fff;border:0;border-radius:14px;box-shadow:0 6px 18px rgba(0,0,0,.35)}',
'.sp-btn.alt{background:linear-gradient(135deg,#9b6bff,#6d3fd1)}',
'.sp-btn.soft{background:rgba(255,255,255,.08);color:var(--ink2);border:1px solid var(--line);box-shadow:none}',
'.sp-btn.sel{background:linear-gradient(135deg,var(--a),var(--a2));color:#fff;outline:3px solid rgba(255,255,255,.85);box-shadow:0 0 26px var(--glow)}',
'.sp-btn:disabled{opacity:.45}',
'.sp-lvls{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}',
'.sp-lvls .sp-btn,.sp-lvls .sp-pill{padding:22px 8px;font-size:1.05rem;border-radius:18px}',
'.sp-lvls .on{background:linear-gradient(135deg,#ff4d6d,#c9184a);color:#fff;outline:3px solid rgba(255,255,255,.85);box-shadow:0 0 30px rgba(255,77,109,.45)}',
'.sp-lvls .off{background:rgba(255,255,255,.07);color:var(--ink2);border:1px solid var(--line);box-shadow:none}',
'.sp-pill{border-radius:14px;padding:14px 8px;font-weight:800;text-align:center}',
'.sp-opts{position:relative;display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}',
'.sp-opts::after{content:"vs";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:38px;height:38px;border-radius:50%;background:#10081c;color:var(--ink2);border:2px solid var(--a);font-weight:800;display:flex;align-items:center;justify-content:center;font-size:.85rem;text-transform:uppercase;z-index:2;box-shadow:0 0 14px var(--glow)}',
'.sp-opt{white-space:normal;line-height:1.35;padding:26px 14px;min-height:110px;font-size:1.05rem;border-radius:18px}',
'.sp-opt:disabled.sel{animation:spreveal .5s}',
'.sp-bubble{background:rgba(255,255,255,.06);border:1px solid var(--line);border-left:4px solid var(--a);border-radius:14px;padding:10px 14px;margin:8px 0;text-align:left;word-break:break-word;animation:spslide .35s}',
'.sp-bubble small{display:block;color:var(--hc);font-size:.75rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;margin-bottom:2px}',
'.sp-res{display:inline-block;font-size:1.3rem;font-weight:800;color:#fff;margin:12px 0 4px;padding:6px 18px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid var(--line);animation:spburst .6s}',
'.sp-form{display:flex;gap:8px;margin-top:12px}.sp-form input{flex:1;margin:0;border-radius:14px}.sp-form button{margin:0;flex:0 0 auto;padding:12px 18px}',
'.sp input{background:rgba(10,6,22,.7);border:1.5px solid rgba(255,77,109,.35);color:var(--ink)}',
'.sp input:focus{border-color:var(--a);box-shadow:0 0 0 4px var(--glow)}',
'.sp-foot{display:flex;gap:8px;flex-wrap:wrap;justify-content:space-between;margin-top:16px;padding-top:12px;border-top:1px solid var(--line)}',
'.sp-foot button{margin:0;flex:1;min-width:130px;font-size:.88rem;padding:10px;border-radius:12px}',
'.sp-note{text-align:center;color:#ffb3c6;font-size:.9rem;min-height:1.3em;font-style:italic}',
'.sp-conf{background:rgba(255,77,109,.1);border:1px solid rgba(255,77,109,.5);border-radius:16px;padding:14px;margin-top:10px;text-align:center;font-weight:700;animation:spslide .25s}',
'.sp-pop{animation:spflip .5s cubic-bezier(.2,.8,.2,1)}',
'@keyframes spflip{0%{transform:perspective(700px) rotateX(-70deg) translateY(-12px);opacity:0}100%{transform:perspective(700px) rotateX(0);opacity:1}}',
'@keyframes spslide{0%{transform:translateY(8px);opacity:0}100%{transform:none;opacity:1}}',
'@keyframes spburst{0%{transform:scale(.5);opacity:0}60%{transform:scale(1.18)}100%{transform:scale(1);opacity:1}}',
'@keyframes spreveal{0%{transform:scale(.92)}60%{transform:scale(1.05)}100%{transform:scale(1)}}',
'@media (max-width:480px){.sp-text{font-size:1.2rem}.sp-opts{gap:10px}}'
].join('');

/* ---------- UI ---------- */
function GAME_START(ctx){
  var me=ctx.me,isHost=!!ctx.isHost,partner=me==='host'?'guest':'host',names=ctx.names||{};
  var nm=function(r){return names[r]||(r==='host'?'Host':'Guest')};
  var root=ctx.root;root.innerHTML='';
  var st=document.createElement('style');st.textContent=CSS;root.appendChild(st);
  var wrap=document.createElement('div');wrap.className='sp';root.appendChild(wrap);
  var core=isHost?makeCore(ctx.seed,ctx.rng):null;
  var V=isHost?core.view('host'):null;
  var lastQ=-1,dead=false,ended=false,confirmEnd=false,hiTimer=null,drafts={},lastKey='';

  function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
  function btn(label,cls,fn,dis){
    var b=el('button','sp-btn '+(cls||''),label);b.type='button';
    if(dis)b.disabled=true;else b.onclick=function(){if(!dead)fn()};
    return b;
  }

  /* --- actions --- */
  function act(a){
    if(dead||!V)return;
    if(a.a!=='cfg'&&a.a!=='start'){a.r=V.n;if(a.cv===undefined)a.cv=V.cv}
    if(isHost)hostDo('host',a);else ctx.send({k:'a',a:a});
  }
  function bcast(){ctx.send({k:'s',q:core.S.q,v:core.view('guest')})}
  function hostDo(role,a){
    if(!core.apply(role,a))return;
    core.S.q++;V=core.view('host');bcast();render();
  }

  /* --- ending --- */
  function roundsPlayed(){
    if(!V||V.phase==='lobby')return 0;
    return V.n+((V.phase==='done'||V.phase==='reveal')?1:0);
  }
  function finish(rounds,heat){
    if(ended)return;ended=true;
    rounds=rounds|0;heat=(heat>=1&&heat<=3)?heat:1;
    ctx.end('Good night 😘',rounds+' round'+(rounds===1?'':'s')+', heat reached '+LV[heat]);
  }
  function doEnd(){
    if(ended)return;
    var rounds=roundsPlayed(),heat=V?V.maxLvl:1;
    ctx.send({k:'end',rounds:rounds,heat:heat});
    finish(rounds,heat);
  }

  /* --- drafts-aware text form --- */
  function form(name,placeholder,label,max,onSend){
    var key=name+':'+V.n+':'+V.cv;
    var f=document.createElement('form');f.className='sp-form';f.setAttribute('autocomplete','off');
    var inp=document.createElement('input');inp.type='text';inp.maxLength=max;inp.placeholder=placeholder;
    inp.setAttribute('data-name',name);inp.setAttribute('enterkeyhint','send');
    inp.value=drafts[key]||'';
    inp.addEventListener('input',function(){drafts[key]=inp.value});
    var b=el('button','sp-btn',label);b.type='submit';
    f.appendChild(inp);f.appendChild(b);
    f.addEventListener('submit',function(e){
      e.preventDefault();if(dead)return;
      var t=inp.value.trim();if(!t)return;
      delete drafts[key];inp.value='';onSend(t);
    });
    return f;
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
      var w=el('div','sp-box','Waiting for the game to start…');wrap.appendChild(w);
      return;
    }
    wrap.appendChild(header());
    if(V.phase==='lobby')renderLobby();else renderRound();
    if(V.phase!=='lobby')wrap.appendChild(footer());
    else wrap.appendChild(endOnly());
    if(keepName){
      var inp=wrap.querySelector('input[data-name="'+keepName+'"]');
      if(inp){try{inp.focus({preventScroll:true});inp.setSelectionRange(selS,selE)}catch(e){}}
    }
    var key=V.n+':'+V.phase+':'+V.cv;
    if(key!==lastKey){lastKey=key;var bx=wrap.querySelector('.sp-box');if(bx)bx.classList.add('sp-pop')}
  }
  function header(){
    var h=el('div','sp-hdr');
    h.appendChild(el('span','sp-title','🌶️ Spicy Nights'));
    var m=el('span','sp-meta');
    if(V&&V.phase!=='lobby'){
      m.appendChild(el('span','sp-round','Round '+(V.n+1)));
      m.appendChild(el('span','sp-heat',LVI[V.lvl]+' '+LV[V.lvl]+'  '+'🔥'.repeat(V.lvl)+'·'.repeat(3-V.lvl)));
    }
    h.appendChild(m);return h;
  }
  function renderLobby(){
    var c=el('div','sp-box');
    c.appendChild(el('h2',null,'Tonight’s heat'));
    c.appendChild(el('p','sp-sub','Truth, Dare, Never Have I Ever and Would You Rather — all just words, all optional, always consensual. Skip or ease off any card, anytime, no questions asked.'));
    var g=el('div','sp-lvls');
    for(var l=1;l<=3;l++)(function(l){
      var on=V.cfg.lvl===l,label=LVI[l]+' '+LV[l];
      if(isHost){g.appendChild(btn(label,on?'on':'off',function(){act({a:'cfg',lvl:l})}))}
      else g.appendChild(el('div','sp-pill '+(on?'on':'off'),label));
    })(l);
    c.appendChild(g);
    var escTxt='Escalate: '+(V.cfg.esc?'On':'Off');
    if(isHost)c.appendChild(btn(escTxt,V.cfg.esc?'sel':'soft',function(){act({a:'cfg',esc:!V.cfg.esc})}));
    else c.appendChild(el('div','sp-pill '+(V.cfg.esc?'on':'off'),escTxt));
    c.appendChild(el('p','sp-sub','Escalate: the heat goes up one level every '+PERIOD+' rounds, up to Wild.'));
    if(isHost)c.appendChild(btn('Start the night 😈','',function(){act({a:'start'})}));
    else c.appendChild(el('p','sp-turn','Waiting for '+nm('host')+' to start…'));
    wrap.appendChild(c);
  }
  function actor(){return V.n%2===0?'host':'guest'}
  function ftext(raw){return fill(raw,V.type,V.n,names)}
  function waiting(txt){return el('p','sp-sub',txt)}
  function bubble(who,text){var b=el('div','sp-bubble');b.appendChild(el('small',null,who));b.appendChild(document.createTextNode(text));return b}
  function readyBlock(c){
    var mine=V.ready[me];
    var b=btn(mine?'Waiting for '+nm(partner)+'…':'Ready for the next one 😈','',function(){act({a:'ready'})},mine);
    c.appendChild(b);
  }
  function renderRound(){
    var act0=actor(),iAct=act0===me;
    var c=el('div','sp-box h'+V.lvl);
    var ph=V.phase;
    if(V.type==='td'){
      if(ph==='choose'){
        c.appendChild(el('div','sp-chip','TRUTH OR DARE'));
        c.appendChild(el('div','sp-text',iAct?'Your turn. Truth or dare?':nm(act0)+' is choosing…'));
        if(iAct){
          var r=el('div','sp-row');
          r.appendChild(btn('Truth','sp-ch',function(){act({a:'choose',c:'truth'})}));
          r.appendChild(btn('Dare','sp-ch alt',function(){act({a:'choose',c:'dare'})}));
          c.appendChild(r);
        }
      }else{
        var isT=V.choice==='truth';
        c.appendChild(el('div','sp-chip',isT?'TRUTH':'DARE'));
        c.appendChild(el('div','sp-text',ftext(V.card.raw)));
        if(!isT&&V.tries>0)c.appendChild(el('p','sp-sub','Round '+(V.tries+1)+' of the same dare — make it better 😏'));
        if(ph==='respond'){
          if(isT){
            if(iAct)c.appendChild(form('truth','Type your answer…','Send answer',500,function(t){act({a:'answer',text:t})}));
            else c.appendChild(waiting(nm(act0)+' is typing an answer…'));
          }else{
            if(iAct){
              c.appendChild(el('p','sp-sub','Do it over your call, or type it out — then press Done.'));
              c.appendChild(btn('Done','',function(){act({a:'done'})}));
            }else c.appendChild(waiting(nm(act0)+' is working on it…'));
          }
        }else if(ph==='judge'){
          if(iAct)c.appendChild(waiting('Waiting for '+nm(partner)+'’s verdict…'));
          else{
            var jr=el('div','sp-row');
            jr.appendChild(btn('Loved it 😏','',function(){act({a:'judge',ok:true})}));
            jr.appendChild(btn('Do it again','soft',function(){act({a:'judge',ok:false})}));
            c.appendChild(jr);
          }
        }else if(ph==='done'){
          if(isT)c.appendChild(bubble(nm(act0),V.ans||''));
          else c.appendChild(el('div','sp-res','Loved it 😏'));
          readyBlock(c);
        }
      }
    }else if(V.type==='nhie'){
      c.appendChild(el('div','sp-chip','NEVER HAVE I EVER'));
      c.appendChild(el('div','sp-text','Never have I ever '+ftext(V.card.raw)));
      if(ph==='pick'){
        if(V.pick[me]===null){
          var pr=el('div','sp-row');
          pr.appendChild(btn('I have','sp-pk',function(){act({a:'pick',v:'have'})}));
          pr.appendChild(btn('I have not','sp-pk soft',function(){act({a:'pick',v:'not'})}));
          c.appendChild(pr);
          c.appendChild(waiting('Your answer stays secret until you both pick.'));
        }else c.appendChild(waiting('Locked in 🔒 — waiting for '+nm(partner)+'…'));
      }else{
        ['host','guest'].forEach(function(r){
          c.appendChild(bubble(nm(r),V.pick[r]==='have'?'✅ I have 😈':'✋ I have not 😇'));
        });
        var hb=V.pick.host==='have',gb=V.pick.guest==='have';
        c.appendChild(el('div','sp-res',hb&&gb?'Partners in crime 😈':(!hb&&!gb?'Clean slate… for now 😇':'Interesting… 👀')));
        if(!V.more){
          if(V.pick[partner]==='have')c.appendChild(btn('Tell me more','soft',function(){act({a:'more'})}));
        }else if(V.more.story===null){
          if(V.more.ask===me)c.appendChild(waiting(nm(partner)+' is typing the story…'));
          else{
            c.appendChild(waiting(nm(V.more.ask)+' wants to hear more. Tell the story:'));
            c.appendChild(form('story','Type the story…','Send story',600,function(t){act({a:'story',text:t})}));
          }
        }else c.appendChild(bubble(nm(V.more.ask===me?partner:me)+' tells more',V.more.story));
        readyBlock(c);
      }
    }else{ /* wyr */
      var opts=ftext(V.card.raw).split('|');
      c.appendChild(el('div','sp-chip','WOULD YOU RATHER'));
      var o=el('div','sp-opts');
      ['A','B'].forEach(function(L,i){
        var label=L+': '+opts[i];
        if(ph==='pick'&&V.pick[me]===null)o.appendChild(btn(label,'sp-opt '+(i?'alt':''),function(){act({a:'pick',v:L})}));
        else{
          var mineSel=V.pick[me]===L;
          o.appendChild(btn(label,'sp-opt '+(mineSel?'sel':'soft'),function(){},true));
        }
      });
      c.appendChild(o);
      if(ph==='pick'){
        if(V.pick[me]===null)c.appendChild(waiting('Your pick stays secret until you both choose.'));
        else c.appendChild(waiting('Locked in 🔒 — waiting for '+nm(partner)+'…'));
      }else{
        ['host','guest'].forEach(function(r){
          c.appendChild(bubble(nm(r),'picked '+V.pick[r]+(V.reasons[r]?' — “'+V.reasons[r]+'”':'')));
        });
        c.appendChild(el('div','sp-res',V.pick.host===V.pick.guest?'Match! 💞':'Opposites attract'));
        if(V.reasons[me]===null)c.appendChild(form('reason','One line on why…','Send reason',300,function(t){act({a:'reason',text:t})}));
        readyBlock(c);
      }
    }
    wrap.appendChild(c);
    var turn=V.type==='td'?(iAct?'Your turn':nm(act0)+'’s turn'):'Both of you answer';
    wrap.appendChild(el('div','sp-turn',turn));
    wrap.appendChild(el('div','sp-note',V.note||''));
  }
  function footer(){
    var f=el('div','sp-foot');
    var live=V.phase==='choose'||V.phase==='respond'||V.phase==='judge'||V.phase==='pick';
    var sk=btn('Skip (no penalty)','soft',function(){act({a:'skip'})},!live);sk.id='sp-skip';
    var pz=btn('Pause / too much','soft',function(){act({a:'pause'})},!live);pz.id='sp-pause';
    f.appendChild(sk);f.appendChild(pz);
    f.appendChild(endBtn());
    var w=el('div');w.style.width='100%';
    f.appendChild(w);
    if(confirmEnd)w.appendChild(endConfirm());
    return f;
  }
  function endBtn(){
    var e=btn('End the night','soft',function(){confirmEnd=true;render()});e.id='sp-end';return e;
  }
  function endConfirm(){
    var c=el('div','sp-conf');
    c.appendChild(el('div',null,'End the night for both of you?'));
    var r=el('div','sp-row');
    r.appendChild(btn('Yes, end the night','sp-yes',doEnd));
    r.appendChild(btn('Keep playing','soft',function(){confirmEnd=false;render()}));
    c.appendChild(r);return c;
  }
  function endOnly(){
    var f=el('div','sp-foot');f.appendChild(endBtn());
    if(confirmEnd){var w=el('div');w.style.width='100%';w.appendChild(endConfirm());f.appendChild(w)}
    return f;
  }

  /* --- incoming --- */
  function onMsg(d){
    if(dead||!d||typeof d!=='object')return;
    if(d.k==='end'){finish(d.rounds,d.heat);return}
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
  id:'spicy',icon:'🌶️',name:'Spicy Nights',
  blurb:'Flirty to wild truth, dare, never-have-I-ever and would-you-rather for couples. Words only, always consensual.',
  start:GAME_START,
  _t:{BANK:BANK,makeCore:makeCore,levelFor:levelFor,fill:fill,shufWith:shufWith}
});
})();
