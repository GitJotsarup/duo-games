/* Wedding Planner - 2 players, a guided discussion for a couple planning their wedding. Plugin for Duo Games.
   One topic per screen, in order. Either partner can heart suggestions, add ideas, write shared notes and a decision,
   set a status and move between topics; both always see the same topic.
   Host-authoritative: the host keeps the plan (localStorage 'duo_wedding_plan_v1'), applies every action
   (guest actions arrive as {k:'a',a}) and broadcasts versioned snapshots {k:'s',q,v}. The guest keeps a copy. */
(function(){
'use strict';

var PLAN_KEY='duo_wedding_plan_v1',COLOR_KEY='duo_colorlab_v1';

function S_(raw){return raw.split('\n').map(function(l){return l.trim()}).filter(Boolean).map(function(l,i){var p=l.split('|');return {id:'s'+(i+1),e:p[0],t:p[1],d:p[2]||''}})}

var SHABADS=[
['Hum Ghar Saajan Aaye','Joy and gratitude that the Beloved has come home; a favourite at wedding celebrations.'],
['Mittar Pyare Nu','A tender message of longing to the Beloved Friend; deeply loved and often sung softly.'],
['Tu Thakur Tum Peh Ardaas','A humble prayer placing everything before Waheguru; calm and devotional.'],
['Koi Aan Milavai Mera Preetam Pyara','Longing for someone to bring the Beloved near; often heard at Sikh weddings.'],
['Visar Nahi Evad Data','A heartfelt plea never to forget the great Giver; gentle and reflective.'],
['Mera Man Lochai','Yearning for the Guru’s darshan; a moving piece about love and separation.'],
['Rakhe Rakhanhaar','Trust in Waheguru as the protector; uplifting and reassuring.'],
['Deh Shiva Bar Mohe','A resolve never to turn away from good deeds; stirring and often sung with energy.'],
['Jo Mange Thakur Apne Te','Faith that the longing of the devoted is fulfilled; hopeful and joyful.'],
['Viahu Hoa Mere Babula','The soul’s union with the Divine through the Guru; traditionally associated with weddings.'],
['Poota Mata Ki Asees','A mother’s loving blessing; a beautiful way to honour family.'],
['Dhan Dhan Ram Das Gur','Praise of Guru Ram Das Ji; joyful and much loved.'],
['Aisi Laal Tujh Bin','Wonder at the grace that uplifts the humble; warm and celebratory.'],
['Satgur Hoye Dayal','Gratitude for the True Guru’s kindness; joyful and hopeful.'],
['Thir Ghar Baiso Har Jan Pyare','Steadiness and peace at home under the Guru’s protection.']
].map(function(x,i){return {id:'s'+(i+1),e:'🙏',t:x[0],d:x[1],yt:true}});

var TOPICS=[
{id:'vibe',e:'💛',t:'Overall vibe & priorities',q:'What should our wedding feel like, and what matters most to us?',tip:'Each pick three words for the feeling you want, then compare. Agree on your top three priorities before any money talk.',s:S_(`
🌸|Intimate & meaningful|Fewer guests, more heart.
🎉|Big Punjabi celebration|Everyone invited, dhol all night.
🙏|Sikhi at the centre|The Anand Karaj is the heart; everything else is extra.
😌|Relaxed, not stressful|Simple plans and a happy couple.
👑|Royal & glamorous|Grand venues and gorgeous details.
🌿|Elegant & minimal|Clean, calm and classy.
👨‍👩‍👧|Family-focused|Time with both families matters most.
🍛|Food first|Guests leave full and happy.
📸|Amazing photos|Memories that last forever.
💸|Smart budget|Spend on what we love, save on the rest.
🏝️|Save for the honeymoon|Keep the day modest, go big on the trip.
🕺|Party energy|Dance floor full from start to finish.`)},
{id:'date',e:'📅',t:'Date, season & guest count',q:'When should we get married, and roughly how many guests?',tip:'Pick a season first, then check gurdwara and venue availability. Write your must-invite lists separately, then merge them.',s:S_(`
☀️|Summer wedding|Long days and outdoor photos.
🍂|Autumn wedding|Cosy colours and milder weather.
❄️|Winter wedding|Festive and glamorous indoors.
🌷|Spring wedding|Flowers everywhere, fresh vibes.
📅|Long weekend|Easier for guests to travel.
🗓️|Weekday savings|Venues are often cheaper midweek.
👥|Under 100 guests|Close family and friends.
👨‍👩‍👧‍👦|150 to 300 guests|The classic Punjabi range.
🏟️|300+ guests|Everyone and their cousins.
✈️|Destination wedding|A smaller group abroad.
📋|Different guest lists per function|Mehndi small, reception big.`)},
{id:'anand',e:'🛕',t:'The Anand Karaj morning',q:'Where and when is our Anand Karaj, and how do we want the morning to feel?',tip:'Speak to your gurdwara early about timings and protocol. Share what would make the ceremony feel most meaningful to each of you.',s:S_(`
🛕|Our family gurdwara|Where our families already belong.
🌅|Early, unhurried start|Calm and fresh, with time to breathe.
🕰️|Timings agreed with the gurdwara|Plan the day around their schedule.
📜|Ceremony guide for guests|A short card explaining the Anand Karaj and etiquette.
🧣|Head-covering basket|Rumals ready at the entrance for every guest.
📵|Unplugged ceremony|Phones away; the photographer captures it.
🙏|Ardaas at home before leaving|A quiet family moment.
🫖|Tea & snacks on arrival|With gluten-free options clearly labelled.
📺|Livestream for family abroad|With the gurdwara’s permission.
🤍|Simple, respectful decor|Check with the gurdwara first.
🧘|Ten quiet minutes together afterwards|Just us, before the photos start.`)},
{id:'shabad',e:'🙏',t:'Singing a shabad together',q:'Do we want to sing a shabad together, and which one?',tip:'Listen to a few together first and talk about what each means to you. Then confirm your choice and its meaning with your Granthi Singh or raagi jatha.',s:SHABADS,shabad:true},
{id:'outfits',e:'👗',t:'Anand Karaj outfits & colours',q:'What will we wear for the Anand Karaj, and which colours suit us both?',tip:'Look at your Couple Color Lab palettes together. Decide whether you want to match, complement or contrast.',s:S_(`
🔴|Classic bridal red|Timeless and traditional.
🌸|Soft pastel pink|Light and modern.
🍑|Peach & gold|Warm and glowing.
💚|Emerald or bottle green|Rich and regal.
🍷|Deep wine or maroon|Elegant and dramatic.
🤍|Ivory & gold|Minimal and graceful.
🧣|Matching pagg & chunni|Coordinated colours for us both.
🎨|Complementary, not matching|Colours that go together.
🧵|Phulkari dupatta|Heritage embroidery.
✂️|Custom-made outfits|Designed just for us.
👞|Comfortable footwear|We will be on our feet for hours.
🛍️|Outfit shopping day together|Make a fun day of it.`),colorlab:true},
{id:'kurmai',e:'💍',t:'Kurmai / engagement day',q:'Are we having a kurmai or engagement celebration, and what should it include?',tip:'Decide whether it is a small family event or a party, who hosts it, and roughly when.',s:S_(`
🙏|Ardaas at the gurdwara|A blessed start.
🏠|Small gathering at home|Close, warm and simple.
🎉|Engagement party|Friends, music and food.
🧣|Chunni ceremony|The groom’s family places a chunni over the bride.
🎁|Gift exchange between families|Sweets, clothes and blessings.
🍬|Mithai boxes|Share the happy news.
📸|Engagement photoshoot|Use the photos for the save-the-date.
👗|Coordinated outfits|Colours that go together.
🎶|Dholki in the evening|Songs and dancing.
💌|Announcement together|Share the news our way.`)},
{id:'mehndi',e:'🌿',t:'Mehndi',q:'What kind of mehndi do we want?',tip:'Big party or cosy family night? Talk about who is invited and what would make it fun for both sides.',s:S_(`
🌿|Natural henna artist|Organic henna with a deep stain.
🔍|His name hidden in her design|He has to find it!
🌼|Marigold curtains|Bright genda phool backdrops.
🪑|Floor seating with gaddas|Cushions, bolsters and rugs.
🪘|Dholki & boliyan|Aunties and cousins singing the classics.
💃|Giddha circle|Everyone joins in.
🍿|Chaat counter|With gluten-free puris for golgappe.
👩‍🎨|Quick designs for guests|A second artist for everyone.
💫|Bangle bar|Glass bangles to try on and take home.
🤚|A little mehndi for the groom|A small design for him too.
🎉|Joint mehndi for both sides|One big party.
🕯️|Intimate family-only night|Just close family and a dholki.`)},
{id:'sangeet',e:'🎶',t:'Sangeet & night function',q:'What do we want for the sangeet or night function?',tip:'Picture the best moment of the night. Who performs, what do guests eat, and when does it end?',s:S_(`
🎤|Boliyan battle|Bride’s side versus groom’s side.
💃|Family dance performances|Each side of the family performs.
👫|Our couple performance|We dance together.
🎭|Cousins’ comedy skit|Our love story, retold.
🌾|Pind theme|Charpais and village vibes.
🎛️|DJ + live dhol|Big energy all night.
🍢|Street-food stalls|Tikki and chaat, with gluten-free options.
🍦|Kulfi cart|Pistachio, mango and malai.
🕺|Bhangra lesson for guests|A pro teaches a short routine.
👵|Elders’ boliyan spotlight|Hand the mic to the nanis and dadis.
📽️|Childhood photo slideshow|Baby photos on the big screen.
🥁|Traditional ladies sangeet|Dholki, giddha and folk songs.`)},
{id:'entrances',e:'🚪',t:'Entrances for each function',q:'How do we make our entrances at each function?',tip:'Go function by function: who enters, to which song, and how big do we want it?',s:S_(`
🥁|Dhol-led entrance|Dholis lead us in.
🐎|Ghodi for the baraat|The groom arrives on a decorated mare.
🚗|Vintage car arrival|A classic car pulls up.
🌸|Phulkari canopy|Brothers and cousins carry a canopy over the bride.
💃|Choreographed couple entry|A rehearsed routine.
🕺|Bhangra crew escort|Dancers bring us in.
🎶|Surprise song|One of us sings to the other.
🎆|Cold pyro fountains|Safe indoor fountains on stage.
🌹|Rose-petal shower|Petals from above.
💨|Low fog for the first dance|Dreamy and romantic.
🎬|Movie-trailer intro|A 30-second trailer before we walk in.
🎠|Mehndi swing entrance|She arrives on a decorated jhoola.
👯|Bride’s squad entry|Her sisters and friends dance in first.
🕶️|Groom’s squad entry|Slow-motion swagger.`)},
{id:'traditions',e:'🌼',t:'Traditions to include',q:'Which traditions do we want to include, and how?',tip:'For each one, talk about what it means to your families and whether you want it big, small or not at all.',s:S_(`
🌼|Sehra bandi|The family ties the sehra on the groom’s turban.
🥁|Baraat with dhol|The groom’s side arrives dancing.
🤗|Milni|The families meet and exchange garlands and hugs.
🥹|Doli / vidaai|The bride’s farewell from her family home.
🧣|Chunni ceremony|The groom’s family welcomes the bride with a chunni.
🌿|Mehndi|Henna, songs and dholki.
🙏|Sehaj Path or Akhand Path|A complete reading before the wedding, ending with bhog.
🎶|Ladies sangeet|Folk songs and giddha.
🎁|Shagun from elders|Blessings and gifts for the couple.`)},
{id:'reception',e:'🥂',t:'Reception',q:'What do we want our reception to be like?',tip:'Think about the flow of the evening: arrival, food, speeches, dancing and the send-off.',s:S_(`
🥂|Signature mocktails|Two drinks named after us.
🕺|Grand entrance|A bold song as we walk in.
🎂|Gluten-free cake|With a fun cake-cutting moment.
💬|Short, sweet speeches|Three speeches, two minutes each.
💃|First dance into bhangra|Starts slow, then the dhol kicks in.
🎁|Shagun box|A beautiful, secure box for cards.
🪔|Diya-lined walkway|Warm light at the entrance.
🌙|Late-night snack drop|Chaat, fries and chai at 10pm.
🪑|Tables that mix both families|Everyone gets to know each other.
🛋️|Quiet lounge for elders|Comfy chairs and less noise.
🧁|Dessert table|A colourful spread.
🎤|An emcee who knows both families|Every name pronounced right.`)},
{id:'food',e:'🍛',t:'Food & desserts',q:'What food and desserts do we want? (all vegetarian, celiac-safe)',tip:'Agree on your must-have dishes, then plan how to keep her plate truly gluten-free: separate prep, clear labels and a tasting.',s:S_(`
🍛|Full Punjabi spread|Dal makhani, paneer and chole with gluten-free breads.
🫓|Makki di roti & sarson da saag|Maize roti is naturally gluten-free.
🌾|Gluten-free roti station|Made separately to avoid cross-contact.
🧀|Paneer tikka live grill|Naturally gluten-free.
🌮|Indo-Mexican tacos|Corn shells with paneer and salsa.
🍕|Wood-fired pizza|With a gluten-free base.
🍜|Indo-Chinese counter|Made with tamari instead of soy sauce.
🍦|Froyo bar|Frozen yoghurt with fruit, nuts and sauces.
🫐|Açaí bowl bar|Build-your-own bowls.
🍨|Kulfi falooda|A cold classic.
🍬|Mithai table|Label the gluten-free ones, like besan ladoo.
🏷️|Allergen labels on every dish|Clear and kind for all guests.
👩‍🍳|Tasting session|Try everything with the caterer first.
🍽️|A safe plate for her|Prepared in a dedicated gluten-free area.`)},
{id:'music',e:'🎵',t:'Music, DJ, dhol & performances',q:'What should the soundtrack and performances be?',tip:'Each write five must-play songs and one do-not-play song, then swap lists.',s:S_(`
🎛️|Punjabi + Bollywood DJ|Someone who reads the room.
🥁|Live dhol with the DJ|Big moments, bigger beats.
🎤|Live singer|For folk and romantic numbers.
🎻|String quartet covers|Punjabi hits, classical style.
📻|90s bhangra hour|The songs our parents loved.
🚫|Do-not-play list|Every couple needs one.
💃|Our first dance song|Something that is ours.
👨‍👩‍👧|Parents’ dance|A moment for both sets of parents.
🎙️|Karaoke corner|For the brave.
🎵|Flash-mob surprise|Guests break into a routine.
👵|Grandparents’ request slot|Their song, their moment.
🗒️|Song requests on the RSVP|Build the playlist with guests.`)},
{id:'decor',e:'🌺',t:'Decor & theme',q:'What theme, colours and decor do we love?',tip:'Each share three photos you love, then look for what they have in common.',s:S_(`
🌼|Marigold & magenta|Bright, joyful and Punjabi.
👑|Royal maroon & gold|Rich and timeless.
🤍|Ivory & gold minimal|Clean and calm.
🌿|Garden greenery|Lush leaves and white flowers.
🧵|Phulkari heritage|Embroidered textures everywhere.
🪔|Diyas & lanterns|Warm light for every function.
🏛️|Mughal arches & mirrors|Grand and dramatic.
🍑|Pastel peach & sage|Soft and romantic.
💙|Midnight blue & gold|Moody and luxurious.
🌺|Floral ceiling|Flowers hanging overhead.
🖼️|Family history wall|Old wedding photos of our elders.
💡|Neon sign with our names|A fun photo spot.`)},
{id:'photo',e:'📸',t:'Photo & video',q:'What style of photography do we want, and which shots must we get?',tip:'Look at a few photographers’ full galleries together and agree on a style before talking budget.',s:S_(`
📷|Candid documentary style|Real moments, minimal posing.
🎞️|Classic posed portraits|Timeless family photos.
✨|Editorial & glam|Magazine-style shots.
🎥|Cinematic highlight film|A short movie of the day.
👫|First-look shoot|A private moment before the day begins.
🖐️|Mehndi close-ups|Every detail of the henna.
🤗|Milni hugs|Families meeting.
👪|Big family group photo|Everyone together.
👴|Grandparents with us|A photo to treasure.
🌇|Golden-hour portraits|Soft, warm light.
🥹|Parents’ reactions|The tears and the smiles.
📷|Disposable cameras on tables|The guests’ point of view.`)},
{id:'video',e:'🎬',t:'A video from us?',q:'Do we make a video from us? If so, what kind?',tip:'Decide how much effort you want to put in, and whether a friend or a pro films it.',s:S_(`
💌|Save-the-date video|A short, fun announcement.
🎞️|Love-story montage|From the day we met until now.
🎥|Same-day edit|Morning highlights shown at the reception.
🙏|Thank-you video for guests|Sent after the wedding.
🗣️|How-we-met interviews|We each tell the story, cut together.
🎤|Lip-sync music video|To our favourite Punjabi track.
🤣|Blooper reel|All the outtakes.
👵|Messages from grandparents|Blessings on camera.
🔁|Then and now|Recreating old photos.
🎁|Surprise video for our parents|Played at the reception.
📱|Short reels for sharing|Quick clips for family groups.`)},
{id:'mhji',e:'💐',t:'Thank-you for Mhji’s family',q:'Are we doing a thank-you or anything like that for Mhji’s family?',tip:'Talk about what would feel most personal to them: words, a gift, time together or a gesture.',s:S_(`
✉️|Handwritten letter|A heartfelt thank-you in our words.
🎤|Thank-you in our speech|Named and thanked at the reception.
🎥|Short video message|Clips and thanks from us both.
🖼️|Framed photo|A beautiful print from the wedding.
🙏|Seva in their name|A donation or seva in the family’s name.
💐|Flowers delivered|The morning after the wedding.
🍽️|Thank-you dinner|A relaxed meal together afterwards.
💃|Surprise performance|A dance or song just for them.
🎁|Personal gift|Something chosen just for them.
☕|Tea morning together|A calm catch-up after the busy days.`)},
{id:'gifts',e:'🎁',t:'Gifts for both families',q:'What gifts do we want to give our families?',tip:'List who you want to thank (milni pairs, parents, siblings, helpers) and agree on a rough budget per person.',s:S_(`
🎁|Milni gifts|Thoughtful gifts for each milni pair.
🧣|Shawls for elders|Warm and traditional.
⌚|Engraved keepsakes for parents|With the wedding date.
📖|Family recipe book|Collected from both sides.
🏡|Weekend away for parents|A rest after all their hard work.
📚|Photo album for each family|Printed and personal.
👗|Outfits for siblings|A matching surprise.
🎈|Gifts for the little ones|The sarbala and flower kids.
💌|Cards for every helper|Everyone who made it happen.
🍬|Mithai boxes for relatives|Delivered personally.`)},
{id:'guests',e:'🎈',t:'Guest experience',q:'How do we make our guests feel welcome?',tip:'Imagine a guest’s day from arrival to the drive home. Where could a small touch make it better?',s:S_(`
🍬|Mithai favours|A classic sweet thank-you.
🌱|Seed or plant favours|Something that grows.
🧳|Welcome bags at the hotel|Snacks, water, a map and a note.
📸|Photo booth with props|Pagg props, glasses and signs.
🖼️|Polaroid guest book|Photos and wishes in one book.
🚐|Shuttle between venues|No parking worries.
🩴|Flip-flop basket for dancers|Sore feet saved.
🧒|Kids’ activity packs|Colouring, stickers and snacks.
👵|Comfortable seats for elders|Close to the action, away from the speakers.
🔤|Name pronunciation guide|For guests new to Punjabi names.
⏳|Time capsule letters|Opened on our first anniversary.
🌍|Livestream link|For family abroad.`)},
{id:'invites',e:'💌',t:'Invitations & save-the-dates',q:'How do we want to invite people?',tip:'Agree on the style first, then the timeline: save-the-dates, invitations and RSVP deadline.',s:S_(`
💌|Printed invitations|Classic and keepsake-worthy.
📱|Digital invitations|Quick, green and easy to share.
🎨|Illustrated couple art|A drawing of us on the cards.
🌐|Wedding website|All the details and RSVPs in one place.
🗓️|Save-the-dates 6+ months ahead|Especially for guests abroad.
🎥|Video invitation|A short clip from us.
🧵|Phulkari-inspired design|Heritage patterns.
🍬|Invites with mithai|Delivered by hand to elders.
🔤|Bilingual cards|Punjabi and English.
✅|Clear RSVP deadline|So planning stays calm.`)},
{id:'honeymoon',e:'🏝️',t:'Honeymoon',q:'Where should we go on our honeymoon?',tip:'Each pick a dream destination and a vibe, then find the overlap. Check vegetarian and gluten-free food options before booking.',s:S_(`
🇮🇹|Italy|Very celiac-aware; just ask for senza glutine.
🇬🇷|Greek islands|Veggie meze and many naturally gluten-free dishes.
🇲🇻|Maldives|Resorts prepare veg and gluten-free meals on request.
🇯🇵|Japan|Soy sauce has wheat, so carry tamari and a gluten-free card.
🇮🇩|Bali|Yoga, rice terraces and endless vegan cafés.
🇱🇰|Sri Lanka|Tea hills, safaris and rice and curry.
🇲🇽|Mexico|Corn tortillas are naturally gluten-free.
🇨🇭|Swiss Alps|Lakes and mountain trains.
🇲🇺|Mauritius|An island with strong Indian food culture.
🇦🇺|Australia|Beaches and excellent gluten-free menus.
🏖️|Beach and do nothing|Sun, books and naps.
🏔️|Adventure and hiking|Trails, views and early starts.`)},
{id:'else',e:'✨',t:'Anything else?',q:'Anything else on our minds?',tip:'Worries, dreams, things we have not said yet. No idea is too small.',s:S_(`
💸|Budget check-in|Where we are and what we are comfortable with.
😌|Keeping stress low|How we look after each other.
👪|Family expectations|What each family hopes for.
🗓️|Planning timeline|What to book first.
🤝|Who handles what|Split the to-dos fairly.
💌|Letters to each other on the day|Read before the ceremony.
🎁|A surprise for each other|Something small and sweet.
🏠|Life after the wedding|Where we live and what comes next.
📞|Regular planning dates|One call a week, just for this.`)}
];
var TB={};TOPICS.forEach(function(t){TB[t.id]=t});
var N=TOPICS.length;
var STATUS={d:'Decided ✅',l:'Talk later 🕒',s:'Skip ⏭'};

/* ---------- pure helpers ---------- */
function clean(s,max){return String(s==null?'':s).replace(/\r/g,'').replace(/[\u0000-\u0009\u000b-\u001f]/g,' ').replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim().slice(0,max||200)}
function oth(r){return r==='host'?'guest':'host'}
function isRole(r){return r==='host'||r==='guest'}
function num(v){v=+v;return isFinite(v)?v:0}
function emptyTopic(){return {hearts:{host:[],guest:[]},custom:[],notes:'',decision:'',status:''}}
function defaultPlan(){var p={v:2,updated:0,topics:{}};TOPICS.forEach(function(t){p.topics[t.id]=emptyTopic()});return p}
function sugOf(plan,tid,sid){
  var t=TB[tid];if(!t)return null;
  for(var i=0;i<t.s.length;i++)if(t.s[i].id===sid)return t.s[i];
  var c=plan&&plan.topics[tid]?plan.topics[tid].custom:[];
  for(i=0;i<c.length;i++)if(c[i].id===sid)return c[i];
  return null;
}
/* accepts any old/new/garbage object; unknown or old-format data is ignored */
function sanitizePlan(o){
  var p=defaultPlan();if(!o||typeof o!=='object'||!o.topics||typeof o.topics!=='object')return p;
  p.updated=Math.max(0,Math.floor(num(o.updated)));
  TOPICS.forEach(function(t){
    var x=o.topics[t.id];if(!x||typeof x!=='object')return;var y=p.topics[t.id];
    (Array.isArray(x.custom)?x.custom:[]).slice(0,40).forEach(function(c){
      if(!c||!/^c\d{1,4}$/.test(c.id)||y.custom.some(function(z){return z.id===c.id}))return;
      var tt=clean(c.t,80);if(tt)y.custom.push({id:c.id,e:'💡',t:tt,d:'',by:isRole(c.by)?c.by:'host'});
    });
    ['host','guest'].forEach(function(r){
      var h=x.hearts&&Array.isArray(x.hearts[r])?x.hearts[r]:[];
      h.forEach(function(id){if(typeof id==='string'&&sugOf(p,t.id,id)&&y.hearts[r].indexOf(id)<0)y.hearts[r].push(id)});
    });
    y.notes=clean(x.notes,2000);y.decision=clean(x.decision,600);y.status=/^[dls]$/.test(x.status)?x.status:'';
  });
  return p;
}
function progress(plan){
  var d=0,l=0,s=0;TOPICS.forEach(function(t){var st=plan.topics[t.id].status;if(st==='d')d++;else if(st==='l')l++;else if(st==='s')s++});
  return {decided:d,later:l,skipped:s,done:d+s,total:N,pct:(d+s)/N};
}
function sortedSugs(plan,tid){
  var t=TB[tid],tp=plan.topics[tid],all=t.s.concat(tp.custom);
  var score=function(s){var h=tp.hearts.host.indexOf(s.id)>=0,g=tp.hearts.guest.indexOf(s.id)>=0;return h&&g?0:h||g?1:2};
  return all.map(function(s,i){return [s,i]}).sort(function(a,b){return score(a[0])-score(b[0])||a[1]-b[1]}).map(function(x){return x[0]});
}
function bothLiked(plan,tid){var tp=plan.topics[tid];return tp.hearts.host.filter(function(id){return tp.hearts.guest.indexOf(id)>=0})}
function planText(plan,names){
  var nm=function(r){return (names&&names[r])||r},P=progress(plan),o=[];
  o.push('OUR WEDDING PLAN');o.push(nm('host')+' & '+nm('guest'));
  o.push(P.decided+' of '+N+' topics decided, '+P.later+' to talk about later, '+P.skipped+' skipped');
  o.push('Exported '+new Date().toDateString());o.push('');
  TOPICS.forEach(function(t,i){
    var tp=plan.topics[t.id];
    o.push((i+1)+'. '+t.t.toUpperCase()+(tp.status?'  ['+STATUS[tp.status].replace(/ .*/,'')+']':''));
    if(tp.decision)o.push('   Decision: '+tp.decision.replace(/\n/g,'\n             '));
    if(tp.notes)o.push('   Notes: '+tp.notes.replace(/\n/g,'\n          '));
    var b=bothLiked(plan,t.id);
    if(b.length)o.push('   We both like: '+b.map(function(id){var s=sugOf(plan,t.id,id);return s?s.t:id}).join('; '));
    ['host','guest'].forEach(function(r){var only=tp.hearts[r].filter(function(id){return b.indexOf(id)<0});if(only.length)o.push('   '+nm(r)+' also likes: '+only.map(function(id){var s=sugOf(plan,t.id,id);return s?s.t:id}).join('; '))});
    if(tp.custom.length)o.push('   Our own ideas: '+tp.custom.map(function(c){return c.t}).join('; '));
    if(t.shabad&&(b.length||tp.decision))o.push('   (Confirm the shabad and its meaning with our Granthi Singh / raagi jatha)');
    o.push('');
  });
  return o.join('\n');
}
function sanitizeColor(o){
  if(!o||typeof o!=='object')return null;var out={},any=false;
  ['host','guest','couple'].forEach(function(k){
    var v=o[k];if(!v||typeof v!=='object')return;var r={};
    Object.keys(v).slice(0,12).forEach(function(f){
      var x=v[f];
      if(Array.isArray(x)){var a=x.slice(0,24).map(function(s){return typeof s==='string'||typeof s==='number'?clean(s,40):(s&&typeof s==='object'?clean(s.name||s.hex||s.label||'',40):'')}).filter(Boolean);if(a.length)r[clean(f,24)]=a}
      else if(typeof x==='string'||typeof x==='number'){var s=clean(x,160);if(s)r[clean(f,24)]=s}
    });
    if(Object.keys(r).length){out[k]=r;any=true}
  });
  return any?out:null;
}

/* ---------- host core ---------- */
function makeCore(plan0){
  var S={q:0,at:-1,over:false,by:'',plan:sanitizePlan(plan0),last:{host:0,guest:0}};
  function touch(){S.plan.updated=Date.now()}
  function apply(role,a){
    if(!isRole(role)||!a||typeof a!=='object'||S.over)return false;
    if(typeof a.n==='number'){if(a.n<=S.last[role])return false;S.last[role]=a.n}
    var tp=TB[a.t]?S.plan.topics[a.t]:null;
    switch(a.a){
    case 'go':var i=a.i|0;if(i<-1||i>N||i===S.at)return false;S.at=i;return true;
    case 'heart':
      if(!tp||!sugOf(S.plan,a.t,a.s))return false;var h=tp.hearts[role],ix=h.indexOf(a.s);
      if(a.on){if(ix>=0)return false;h.push(a.s)}else{if(ix<0)return false;h.splice(ix,1)}
      touch();return true;
    case 'custom':
      if(!tp||tp.custom.length>=40)return false;var t=clean(a.text,80);if(!t)return false;
      if(tp.custom.some(function(c){return c.t.toLowerCase()===t.toLowerCase()}))return false;
      var id='c'+(tp.custom.reduce(function(m,c){return Math.max(m,+c.id.slice(1))},0)+1);
      tp.custom.push({id:id,e:'💡',t:t,d:'',by:role});tp.hearts[role].push(id);touch();return true;
    case 'delcustom':
      if(!tp)return false;for(var k=0;k<tp.custom.length;k++)if(tp.custom[k].id===a.s){
        tp.custom.splice(k,1);['host','guest'].forEach(function(r){tp.hearts[r]=tp.hearts[r].filter(function(x){return x!==a.s})});touch();return true}
      return false;
    case 'notes':if(!tp)return false;var nv=clean(a.v,2000);if(nv===tp.notes)return false;tp.notes=nv;touch();return true;
    case 'decision':if(!tp)return false;var dv=clean(a.v,600);if(dv===tp.decision)return false;tp.decision=dv;touch();return true;
    case 'status':if(!tp||!/^[dls]$/.test(a.v))return false;tp.status=tp.status===a.v?'':a.v;touch();return true;
    case 'import':if(!a.plan||typeof a.plan!=='object')return false;S.plan=sanitizePlan(a.plan);touch();S.at=-1;return true;
    case 'bye':S.over=true;S.by=role;return true;
    }
    return false;
  }
  function view(){return JSON.parse(JSON.stringify({q:S.q,at:S.at,over:S.over,by:S.by,plan:S.plan}))}
  return {S:S,apply:apply,view:view};
}

/* ---------- styles ---------- */
var CSS=[
'.wp,.wp-vars{--g2:#f7dd8c;--mg:#ff9f1c;--ink:#fff6e6;--dim:#e2c6ad;--line:rgba(247,221,140,.22);--hc:#ff8fb0;--gc:#8fd3ff;color:var(--ink)}',
'.wp{position:relative;max-width:900px;margin:0 auto 30px;padding:14px 16px 26px;border-radius:28px;font-family:inherit;overflow:hidden;background:radial-gradient(700px 380px at 50% -8%,rgba(247,221,140,.18),transparent 65%),radial-gradient(600px 400px at 100% 100%,rgba(255,159,28,.12),transparent 60%),linear-gradient(165deg,#5c1027,#33081a 60%,#22050f);box-shadow:0 18px 50px rgba(0,0,0,.5),inset 0 0 0 1px rgba(247,221,140,.18)}',
'.wp::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.5;background:repeating-conic-gradient(from 0deg at 50% 0,rgba(247,221,140,.035) 0 3deg,transparent 3deg 9deg)}',
'.wp *,.wp-vars *{box-sizing:border-box}',
'.wp button,.wp-vars button{font:inherit;cursor:pointer;border:0;transition:transform .12s,filter .12s,box-shadow .15s}',
'.wp button:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.08)}.wp button:disabled{opacity:.4;cursor:default}',
'.wp-b{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:11px 18px;border-radius:14px;font-weight:700;color:#3a1406;background:linear-gradient(135deg,#fbe7a1,#e5b450 55%,#c98d2c);box-shadow:0 6px 16px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.5);margin:3px}',
'.wp-b.gh{background:rgba(255,246,230,.07);color:var(--ink);border:1px solid var(--line);box-shadow:none}.wp-b.sm{padding:7px 12px;font-size:.85rem;border-radius:11px}',
'.wp-b.big{padding:15px 26px;font-size:1.08rem}.wp-b.mg{background:linear-gradient(135deg,#ffc15e,#ff9f1c);color:#3a1a00}',
'.wp-hdr{position:relative;display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px}',
'.wp-logo{font-size:1.8rem;filter:drop-shadow(0 3px 10px rgba(247,221,140,.5))}',
'.wp-foil{font-weight:800;background:linear-gradient(100deg,#a8741f 0%,#f9e7a6 22%,#c9973f 40%,#fff4c4 55%,#b8862b 75%,#f3d27a 100%);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:wpshine 7s linear infinite}',
'.wp-ttl{font-size:1.35rem;flex:1;min-width:150px}.wp-ttl small{display:block;font-size:.8rem;-webkit-text-fill-color:var(--dim);color:var(--dim);font-weight:600}',
'.wp-card{position:relative;background:linear-gradient(150deg,rgba(120,26,54,.88),rgba(56,9,24,.94));border:1px solid var(--line);border-radius:22px;padding:18px;margin:12px 0;box-shadow:0 12px 30px rgba(0,0,0,.35);animation:wppop .3s}',
'.wp-card::before,.wp-card::after{content:"";position:absolute;width:24px;height:24px;border:2px solid rgba(247,221,140,.45);pointer-events:none}',
'.wp-card::before{top:7px;left:7px;border-right:0;border-bottom:0;border-radius:10px 0 0 0}.wp-card::after{bottom:7px;right:7px;border-left:0;border-top:0;border-radius:0 0 10px 0}',
'.wp h2,.wp-vars h2{margin:.1em 0 .3em;font-size:1.45rem}.wp h3{margin:16px 0 8px;font-size:.78rem;letter-spacing:.16em;text-transform:uppercase;color:var(--g2)}',
'.wp-sub{color:var(--dim);font-size:.93rem;line-height:1.45;margin:4px 0 10px}',
'.wp-hero{position:relative;text-align:center;padding:30px 14px 22px;overflow:hidden}',
'.wp-mandala{position:absolute;left:50%;top:50%;width:440px;height:440px;margin:-220px 0 0 -220px;border-radius:50%;pointer-events:none;opacity:.55;background:repeating-radial-gradient(circle,rgba(247,221,140,.14) 0 1.5px,transparent 1.5px 16px),repeating-conic-gradient(rgba(247,221,140,.12) 0 4deg,transparent 4deg 15deg);-webkit-mask:radial-gradient(circle,#000 30%,transparent 70%);mask:radial-gradient(circle,#000 30%,transparent 70%);animation:wpspin 120s linear infinite}',
'.wp-hero h1{position:relative;font-size:clamp(1.8rem,5vw,2.6rem);margin:.1em 0}.wp-hero>*:not(.wp-mandala){position:relative}',
'.wp-prog{position:relative;display:flex;align-items:center;gap:10px;margin:4px 0 6px}.wp-bar{flex:1;height:8px;background:rgba(255,246,230,.1);border-radius:999px;overflow:hidden}.wp-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--mg),var(--g2));transition:width .3s}',
'.wp-dots{position:relative;display:flex;flex-wrap:wrap;gap:5px;margin:6px 0}',
'.wp-dot{width:26px;height:26px;border-radius:50%;padding:0;font-size:.72rem;font-weight:800;color:var(--ink);background:rgba(255,246,230,.08);border:1px solid var(--line)!important}',
'.wp-dot.d{background:#2f9e5a}.wp-dot.l{background:#c98d2c}.wp-dot.s{background:#6b5560}.wp-dot.cur{box-shadow:0 0 0 2px var(--g2);transform:scale(1.12)}',
'.wp-q{font-size:clamp(1.35rem,3.6vw,1.9rem);font-weight:800;line-height:1.3;margin:6px 0}',
'.wp-tip{display:flex;gap:8px;background:rgba(255,159,28,.1);border:1px dashed rgba(247,221,140,.35);border-radius:14px;padding:10px 12px;color:var(--dim);font-size:.92rem;line-height:1.4}',
'.wp-sugs{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px}',
'.wp-sug{position:relative;display:flex;gap:10px;align-items:flex-start;text-align:left;color:var(--ink);padding:12px;border-radius:16px;border:1px solid var(--line)!important;background:rgba(255,246,230,.05)}',
'.wp-sug .em{font-size:1.6rem;line-height:1}.wp-sug b{display:block;font-size:.98rem}.wp-sug small{display:block;color:var(--dim);font-size:.82rem;line-height:1.35;margin-top:2px}',
'.wp-sug .hs{display:flex;gap:4px;margin-top:6px;flex-wrap:wrap}.wp-sug .hs span{font-size:.72rem;font-weight:800;border-radius:999px;padding:2px 8px;color:#2a0610}',
'.wp-sug .hs .h{background:var(--hc)}.wp-sug .hs .g{background:var(--gc)}',
'.wp-sug.mine{border-color:rgba(255,215,110,.6)!important;background:rgba(255,215,110,.1)}',
'.wp-sug.both{border:1.5px solid var(--g2)!important;background:linear-gradient(150deg,rgba(255,159,28,.25),rgba(232,84,122,.2));box-shadow:0 0 22px rgba(247,221,140,.35)}',
'.wp-both{display:block;font-size:.78rem;font-weight:800;color:var(--g2);margin-top:4px}',
'.wp-sug .x{position:absolute;top:4px;right:6px;font-size:.75rem;color:var(--dim);background:none!important;padding:2px 4px}',
'.wp-a{color:var(--g2);font-weight:700;text-decoration:none;border:1px solid var(--line);border-radius:10px;padding:3px 8px;font-size:.78rem;display:inline-block;margin-top:6px}',
'.wp-in,.wp textarea{font:inherit;color:var(--ink);background:rgba(20,3,9,.55);border:1px solid var(--line);border-radius:12px;padding:10px 12px;outline:none;width:100%;font-size:.95rem}',
'.wp textarea{min-height:80px;resize:vertical;line-height:1.45}.wp-in:focus,.wp textarea:focus{border-color:var(--g2);box-shadow:0 0 0 3px rgba(247,221,140,.18)}',
'.wp-form{display:flex;gap:6px;margin-top:10px}.wp-form .wp-in{flex:1}',
'.wp-st{display:flex;gap:6px;flex-wrap:wrap}.wp-chip{padding:9px 14px;border-radius:999px;font-weight:700;background:rgba(255,246,230,.07);color:var(--ink);border:1px solid var(--line)!important}',
'.wp-chip.on{background:linear-gradient(135deg,#ffd76e,#ff9f1c);color:#3a1a00;border-color:transparent!important}',
'.wp-nav{display:flex;justify-content:space-between;gap:10px;margin-top:14px}.wp-nav .wp-b{flex:1;max-width:260px}',
'.wp-sw{display:inline-block;width:24px;height:24px;border-radius:7px;border:1px solid rgba(255,255,255,.35);margin:2px;vertical-align:middle}',
'.wp-tag{display:inline-block;font-size:.72rem;font-weight:800;letter-spacing:.1em;color:#3a1406;background:linear-gradient(135deg,#fbe7a1,#e5b450);border-radius:999px;padding:3px 10px}',
'.wp-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px;text-align:left;margin-top:12px}.wp-list button{text-align:left;padding:8px 10px;border-radius:12px;background:rgba(255,246,230,.06);color:var(--ink);border:1px solid var(--line)!important;font-size:.88rem}',
'.wp-sum h3{border-top:1px solid var(--line);padding-top:12px}.wp-sum p{margin:4px 0;line-height:1.45;white-space:pre-wrap}.wp-sum .k{color:var(--g2);font-weight:700}',
'.wp-ov{position:fixed;inset:0;z-index:40;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(20,3,9,.78);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}',
'.wp-ov .box{width:100%;max-width:420px;background:linear-gradient(150deg,#6e1631,#2a0610);border:1px solid var(--line);border-radius:24px;padding:22px;box-shadow:0 20px 50px rgba(0,0,0,.6);animation:wppop .25s}',
'.wp-fx{position:fixed;inset:0;pointer-events:none;z-index:45;overflow:hidden}.wp-fx i{position:absolute;top:-20px;width:9px;height:14px;border-radius:2px;animation:wpfall 2.6s cubic-bezier(.3,.6,.5,1) forwards}',
'@keyframes wpshine{to{background-position:200% center}}@keyframes wpspin{to{transform:rotate(360deg)}}',
'@keyframes wppop{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}@keyframes wpfall{to{transform:translateY(105vh) rotate(720deg)}}',
'@media(max-width:560px){.wp{padding:10px 10px 22px;border-radius:20px}.wp-sugs{grid-template-columns:1fr}.wp-dot{width:22px;height:22px;font-size:.65rem}}',
'@media print{body *{visibility:hidden!important}.wp-print,.wp-print *{visibility:visible!important;color:#2a0610!important;-webkit-text-fill-color:#2a0610!important;background:none!important;box-shadow:none!important;animation:none!important}.wp-print{position:absolute;left:0;top:0;width:100%;padding:20px}.wp-noprint{display:none!important}}'
].join('\n');

/* ---------- UI ---------- */
function GAME_START(ctx){
  var me=ctx.me,isHost=!!ctx.isHost,partner=oth(me),names=ctx.names||{};
  var nm=function(r){return names[r]||(r==='host'?'Host':'Guest')};
  var root=ctx.root;root.innerHTML='';
  var st=document.createElement('style');st.textContent=CSS;root.appendChild(st);
  var wrap=document.createElement('div');wrap.className='wp';root.appendChild(wrap);
  var ovBox=document.createElement('div');ovBox.className='wp-vars';root.appendChild(ovBox);
  var V=null,lastQ=-1,dead=false,ended=false,actN=0,lastAt=null,hiTimer=null,timers=[],core=null,savedAt=-1,showList=false;
  var drafts={},pend={};

  function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
  function btn(label,cls,fn,act){var b=el('button','wp-b '+(cls||''),label);b.type='button';if(act)b.setAttribute('data-act',act);b.onclick=function(e){if(!dead)fn(e)};return b}
  function ls(k,v){try{if(v===undefined){var s=localStorage.getItem(k);return s?JSON.parse(s):null}localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return null}}
  function savePlan(p){if(p&&p.updated!==savedAt){savedAt=p.updated;ls(PLAN_KEY,p)}}

  function act(a){
    if(dead||!V||V.over)return;
    if(a.a==='go'||a.a==='bye')flushAll();
    a.n=++actN;
    if(isHost)hostDo('host',a);else ctx.send({k:'a',a:a});
  }
  function bcast(){ctx.send({k:'s',q:core.S.q,v:core.view()})}
  function hostDo(role,a){if(!core.apply(role,a))return;core.S.q++;savePlan(core.S.plan);V=core.view();bcast();onView()}
  function onView(){
    var changed=V.at!==lastAt;lastAt=V.at;
    render();
    if(changed){if(V.at===N)confetti();try{if(window.scrollY>root.offsetTop)root.scrollIntoView({block:'start'})}catch(e){}}
    if(V.over&&!ended){
      ended=true;var P=progress(V.plan);
      ctx.end('Saved for now 💍',P.decided+' of '+N+' topics decided'+(P.later?', '+P.later+' to talk about later':'')+'. Your plan is saved — pick up where you left off next time!');
    }
  }
  function confetti(){
    var f=el('div','wp-fx'),cols=['#ff9f1c','#f7dd8c','#e8547a','#ffd76e','#c9973f','#fff4c4'];
    for(var i=0;i<40;i++){var c=el('i');c.style.left=(Math.random()*100)+'%';c.style.background=cols[i%cols.length];c.style.animationDelay=(Math.random()*.6)+'s';f.appendChild(c)}
    root.appendChild(f);var t=setTimeout(function(){f.remove()},3400);timers.push(t);
  }

  /* --- shared text fields: live-synced (debounced), my draft wins while I am typing --- */
  function commit(name){
    if(pend[name]){clearTimeout(pend[name].t);var p=pend[name];delete pend[name];act({a:p.f,t:p.tid,v:p.v})}
  }
  function flushAll(){Object.keys(pend).forEach(function(k){var p=pend[k];clearTimeout(p.t);delete pend[k];var a={a:p.f,t:p.tid,v:p.v,n:++actN};if(isHost)hostDo('host',a);else ctx.send({k:'a',a:a})})}
  function sharedBox(tid,f,val,ph,max,rows){
    var name=f+'-'+tid,ta=el('textarea');ta.setAttribute('data-name',name);ta.maxLength=max;ta.placeholder=ph;ta.rows=rows||3;
    ta.value=(name in drafts)?drafts[name]:val;
    ta.addEventListener('input',function(){drafts[name]=ta.value;if(pend[name])clearTimeout(pend[name].t);pend[name]={f:f,tid:tid,v:ta.value,t:setTimeout(function(){commit(name)},700)}});
    ta.addEventListener('change',function(){commit(name)});
    ta.addEventListener('blur',function(){commit(name);delete drafts[name]});
    return ta;
  }

  function modal(title,text,yes,fn){
    ovBox.innerHTML='';var o=el('div','wp-ov'),b=el('div','box');o.appendChild(b);
    o.addEventListener('click',function(e){if(e.target===o)ovBox.innerHTML=''});
    b.appendChild(el('h2','wp-foil',title));b.appendChild(el('p','wp-sub',text));
    b.appendChild(btn(yes,'',function(){ovBox.innerHTML='';fn()},'confirm'));b.appendChild(btn('Cancel','gh',function(){ovBox.innerHTML=''},'cancel'));
    ovBox.appendChild(o);
  }
  function download(name,text,mime){
    try{var blob=new Blob([text],{type:(mime||'text/plain')+';charset=utf-8'}),url=URL.createObjectURL(blob);
      var a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},1500)}catch(e){}
  }
  function importFile(file){
    if(!file)return;var fr=new FileReader();
    fr.onload=function(){
      var o=null;try{o=JSON.parse(String(fr.result))}catch(e){}
      if(o&&o.plan)o=o.plan;
      if(!o||typeof o!=='object'||!o.topics){ctx.toast('That file does not look like a wedding plan from this version');return}
      modal('Import plan?','This replaces the plan you both see now. Export first if you want a backup.','Replace plan',function(){act({a:'import',plan:sanitizePlan(o)})});
    };
    fr.readAsText(file);
  }

  /* --- render --- */
  function render(){
    if(dead)return;
    var ae=document.activeElement,keep=null,s0=0,s1=0;
    if(ae&&ae.getAttribute&&wrap.contains(ae)&&ae.getAttribute('data-name')){keep=ae.getAttribute('data-name');try{s0=ae.selectionStart;s1=ae.selectionEnd}catch(e){}}
    var h=wrap.offsetHeight;if(h)wrap.style.minHeight=h+'px';
    wrap.innerHTML='';
    wrap.appendChild(header());
    if(!V){wrap.appendChild(el('p','wp-sub','Opening the planner…'));wrap.style.minHeight='';return}
    wrap.setAttribute('data-at',String(V.at));
    if(V.at<0)rIntro();else if(V.at>=N)rSummary();else rTopic(V.at);
    wrap.style.minHeight='';
    if(keep){var inp=wrap.querySelector('[data-name="'+keep+'"]');if(inp){try{inp.focus({preventScroll:true});inp.setSelectionRange(s0,s1)}catch(e){}}}
  }
  function header(){
    var h=el('div','wp-hdr');h.appendChild(el('span','wp-logo','💍'));
    var t=el('div','wp-ttl wp-foil','Wedding Planner');t.appendChild(el('small',null,nm('host')+' & '+nm('guest')));h.appendChild(t);
    if(V&&!V.over)h.appendChild(btn('Done for now','gh sm',function(){
      var P=progress(V.plan);
      modal('Done for now? 🌙',P.decided+' of '+N+' topics decided so far. Everything is saved, so you can carry on next time. This ends the session for both of you.','Yes, done for now',function(){act({a:'bye'})});
    },'bye'));
    return h;
  }
  function progBar(cur){
    var P=progress(V.plan),box=el('div');
    var pr=el('div','wp-prog'),bar=el('div','wp-bar'),fi=el('i');fi.style.width=Math.round(P.pct*100)+'%';bar.appendChild(fi);
    pr.appendChild(el('span','wp-tag',cur>=0&&cur<N?'Topic '+(cur+1)+' / '+N:'Plan'));pr.appendChild(bar);pr.appendChild(el('small','wp-sub',P.decided+' decided'));box.appendChild(pr);
    var d=el('div','wp-dots');
    TOPICS.forEach(function(t,i){
      var s=V.plan.topics[t.id].status,b=el('button','wp-dot'+(s?' '+s:'')+(i===cur?' cur':''),String(i+1));b.type='button';b.title=t.t;b.setAttribute('data-act','dot');
      b.onclick=function(){if(!dead)act({a:'go',i:i})};d.appendChild(b);
    });
    var sb=el('button','wp-dot'+(cur===N?' cur':''),'📜');sb.type='button';sb.title='Our Wedding Plan';sb.onclick=function(){if(!dead)act({a:'go',i:N})};d.appendChild(sb);
    box.appendChild(d);return box;
  }
  function rIntro(){
    var c=el('div','wp-card'),hh=el('div','wp-hero');hh.appendChild(el('div','wp-mandala'));
    hh.appendChild(el('div',null,'💍')).style.fontSize='3rem';
    hh.appendChild(el('h1','wp-foil','Let’s plan our wedding'));
    hh.appendChild(el('p','wp-sub','One topic at a time. Talk it through on your call, tap ❤ on ideas you like, jot notes, and write down what you decide.'));
    var P=progress(V.plan);
    if(P.decided+P.later+P.skipped)hh.appendChild(el('p','wp-sub','Welcome back! '+P.decided+' of '+N+' topics decided so far.'));
    var first=0;for(var i=0;i<N;i++)if(!V.plan.topics[TOPICS[i].id].status){first=i;break}
    hh.appendChild(btn(P.decided+P.later+P.skipped?'Continue →':'Let’s begin →','big',function(){act({a:'go',i:P.decided+P.later+P.skipped?first:0})},'start'));
    c.appendChild(hh);
    var lg=el('p','wp-sub');lg.style.textAlign='center';lg.innerHTML='';
    var a=el('span',null,'❤ '+nm('host'));a.style.color='var(--hc)';var b=el('span',null,'❤ '+nm('guest'));b.style.color='var(--gc)';
    lg.appendChild(a);lg.appendChild(document.createTextNode('   ·   '));lg.appendChild(b);c.appendChild(lg);
    var l=el('div','wp-list');
    TOPICS.forEach(function(t,i){var s=V.plan.topics[t.id].status;var b2=el('button',null,(s==='d'?'✅ ':s==='l'?'🕒 ':s==='s'?'⏭ ':'')+(i+1)+'. '+t.e+' '+t.t);b2.type='button';b2.onclick=function(){if(!dead)act({a:'go',i:i})};l.appendChild(b2)});
    c.appendChild(l);
    var io=el('div','wp-nav');io.style.justifyContent='center';
    io.appendChild(btn('📜 Our Wedding Plan','gh sm',function(){act({a:'go',i:N})},'summary'));
    var fi=el('input');fi.type='file';fi.accept='.json,application/json';fi.style.display='none';fi.onchange=function(){importFile(fi.files&&fi.files[0]);fi.value=''};
    io.appendChild(btn('⬆ Import .json','gh sm',function(){fi.click()},'import'));io.appendChild(fi);
    c.appendChild(io);wrap.appendChild(c);
  }
  function colorBlock(){
    var data=sanitizeColor(ls(COLOR_KEY)),box=el('div','wp-card');
    box.appendChild(el('h3',null,'🎨 Couple Color Lab'));
    if(data){
      ['host','guest','couple'].forEach(function(k){
        var v=data[k];if(!v)return;
        var it=el('div');it.style.margin='6px 0';it.appendChild(el('b',null,k==='couple'?'💞 Together':(k===me?'You':nm(k))));
        Object.keys(v).forEach(function(f){
          var r=el('div');r.appendChild(el('small','wp-sub',f+': '));
          (Array.isArray(v[f])?v[f]:[v[f]]).forEach(function(s){
            if(/^#?[0-9a-f]{3}([0-9a-f]{3})?$/i.test(s)){var w=el('span','wp-sw');w.style.background=s.charAt(0)==='#'?s:'#'+s;w.title=s;r.appendChild(w)}
            else r.appendChild(el('span','wp-tag',s)).style.margin='2px';
          });
          it.appendChild(r);
        });
        box.appendChild(it);
      });
    }else box.appendChild(el('p','wp-sub','No Color Lab results on this device yet. Play it together to find your best colours!'));
    var go=el('button','wp-b mg','Open Couple Color Lab 🎨');go.type='button';go.setAttribute('data-game','colorlab');
    box.appendChild(go);box.appendChild(el('small','wp-sub',' This leaves the planner for both of you; everything is saved.'));
    return box;
  }
  function rTopic(i){
    var t=TOPICS[i],tp=V.plan.topics[t.id];
    wrap.appendChild(progBar(i));
    var c=el('div','wp-card');c.setAttribute('data-topic',t.id);
    c.appendChild(el('div','wp-tag',t.e+' '+t.t));
    c.appendChild(el('div','wp-q',t.q));
    var tip=el('div','wp-tip');tip.appendChild(el('span',null,'💬'));tip.appendChild(el('span',null,t.tip));c.appendChild(tip);
    c.appendChild(el('h3',null,'Ideas · tap ❤ the ones you like'));
    var g=el('div','wp-sugs');
    sortedSugs(V.plan,t.id).forEach(function(s){
      var h=tp.hearts.host.indexOf(s.id)>=0,gg=tp.hearts.guest.indexOf(s.id)>=0,mine=me==='host'?h:gg;
      var b=el('button','wp-sug'+(h&&gg?' both':mine?' mine':''));b.type='button';b.setAttribute('data-act','heart');b.setAttribute('data-on',mine?'1':'0');
      b.appendChild(el('span','em',s.e));
      var tx=el('div');tx.appendChild(el('b',null,s.t));if(s.d)tx.appendChild(el('small',null,s.d));
      if(/^c/.test(s.id))tx.appendChild(el('small',null,'Our own idea · added by '+(s.by===me?'you':nm(s.by))));
      var hs=el('div','hs');if(h)hs.appendChild(el('span','h','❤ '+(me==='host'?'You':nm('host'))));if(gg)hs.appendChild(el('span','g','❤ '+(me==='guest'?'You':nm('guest'))));
      if(!h&&!gg)hs.appendChild(el('small',null,'♡ tap to like'));
      tx.appendChild(hs);if(h&&gg)tx.appendChild(el('span','wp-both','You both like this 💞'));
      if(t.shabad){var a=el('a','wp-a','▶ Listen on YouTube');a.href='https://www.youtube.com/results?search_query='+encodeURIComponent(s.t+' shabad kirtan');a.target='_blank';a.rel='noopener noreferrer';a.onclick=function(e){e.stopPropagation()};tx.appendChild(a)}
      b.appendChild(tx);
      if(/^c/.test(s.id)){var x=el('span','x','✕');x.title='Remove';x.setAttribute('data-act','delcustom');x.onclick=function(e){e.stopPropagation();if(!dead)act({a:'delcustom',t:t.id,s:s.id})};b.appendChild(x)}
      b.onclick=function(){if(!dead)act({a:'heart',t:t.id,s:s.id,on:!mine})};
      g.appendChild(b);
    });
    c.appendChild(g);
    if(t.shabad)c.appendChild(el('p','wp-sub','Themes are short summaries, not translations. Please confirm your choice, its meaning and its place in the programme with your Granthi Singh or raagi jatha.'));
    var f=document.createElement('form');f.className='wp-form';f.setAttribute('autocomplete','off');
    var inp=el('input','wp-in');inp.placeholder='Add our own idea…';inp.maxLength=80;inp.setAttribute('data-name','idea-'+t.id);inp.value=drafts['idea-'+t.id]||'';
    inp.addEventListener('input',function(){drafts['idea-'+t.id]=inp.value});
    var ab=el('button','wp-b sm mg','Add');ab.type='submit';ab.setAttribute('data-act','addidea');f.appendChild(inp);f.appendChild(ab);
    f.addEventListener('submit',function(e){e.preventDefault();var v=clean(inp.value,80);delete drafts['idea-'+t.id];inp.value='';if(v)act({a:'custom',t:t.id,text:v})});
    c.appendChild(f);
    wrap.appendChild(c);
    if(t.colorlab)wrap.appendChild(colorBlock());
    var c2=el('div','wp-card');
    c2.appendChild(el('h3',null,'📝 Our notes'));
    c2.appendChild(sharedBox(t.id,'notes',tp.notes,'Jot down what you talk about (you both see this live)…',2000,3));
    c2.appendChild(el('h3',null,'✅ Our decision'));
    c2.appendChild(sharedBox(t.id,'decision',tp.decision,'What did we decide?',600,2));
    c2.appendChild(el('h3',null,'Status'));
    var sr=el('div','wp-st');
    ['d','l','s'].forEach(function(k){sr.appendChild(btn(STATUS[k],'wp-chip'+(tp.status===k?' on':''),function(){act({a:'status',t:t.id,v:k})},'status-'+k))});
    c2.appendChild(sr);wrap.appendChild(c2);
    var nav=el('div','wp-nav');
    nav.appendChild(btn('← Back','gh big',function(){act({a:'go',i:i-1})},'prev'));
    nav.appendChild(btn(i===N-1?'See our plan 📜':'Next →','big',function(){act({a:'go',i:i+1})},'next'));
    wrap.appendChild(nav);
  }
  function rSummary(){
    var pl=V.plan,P=progress(pl);
    wrap.appendChild(progBar(N));
    var s=el('div','wp-card wp-sum wp-print');
    var hh=el('div','wp-hero');hh.appendChild(el('div','wp-mandala'));hh.appendChild(el('h1','wp-foil','Our Wedding Plan'));
    hh.appendChild(el('p',null,nm('host')+' & '+nm('guest')));
    hh.appendChild(el('p','wp-sub',P.decided+' of '+N+' topics decided · '+P.later+' to talk about later · '+P.skipped+' skipped'));s.appendChild(hh);
    var tools=el('div','wp-nav wp-noprint');tools.style.justifyContent='center';
    tools.appendChild(btn('🖨 Print','gh sm',function(){try{window.print()}catch(e){}},'print'));
    tools.appendChild(btn('⬇ Export .txt','gh sm',function(){download('our-wedding-plan.txt',planText(pl,names))},'exptxt'));
    tools.appendChild(btn('⬇ Export .json','gh sm',function(){download('our-wedding-plan.json',JSON.stringify({app:'duo-wedding-planner',v:2,plan:pl},null,2),'application/json')},'expjson'));
    var fi=el('input');fi.type='file';fi.accept='.json,application/json';fi.style.display='none';fi.onchange=function(){importFile(fi.files&&fi.files[0]);fi.value=''};
    tools.appendChild(btn('⬆ Import .json','gh sm',function(){fi.click()},'import'));tools.appendChild(fi);
    s.appendChild(tools);
    TOPICS.forEach(function(t,i){
      var tp=pl.topics[t.id],b=bothLiked(pl,t.id);
      var h=el('h3',null,(i+1)+'. '+t.e+' '+t.t+(tp.status?'  ·  '+STATUS[tp.status]:''));h.style.cursor='pointer';h.onclick=function(){if(!dead)act({a:'go',i:i})};s.appendChild(h);
      var any=false,line=function(k,v){var p=el('p');p.appendChild(el('span','k',k+': '));p.appendChild(document.createTextNode(v));s.appendChild(p);any=true};
      if(tp.decision)line('Decision',tp.decision);
      if(tp.notes)line('Notes',tp.notes);
      if(b.length)line('We both like 💞',b.map(function(id){var x=sugOf(pl,t.id,id);return x?x.e+' '+x.t:id}).join(' · '));
      ['host','guest'].forEach(function(r){var only=tp.hearts[r].filter(function(id){return b.indexOf(id)<0});if(only.length)line(nm(r)+' also likes',only.map(function(id){var x=sugOf(pl,t.id,id);return x?x.t:id}).join(' · '))});
      if(tp.custom.length)line('Our own ideas',tp.custom.map(function(c){return c.t}).join(' · '));
      if(t.shabad&&(b.length||tp.decision))s.appendChild(el('p','wp-sub','Confirm the shabad and its meaning with our Granthi Singh / raagi jatha.'));
      if(!any)s.appendChild(el('p','wp-sub','Nothing yet.'));
    });
    wrap.appendChild(s);
    var nav=el('div','wp-nav wp-noprint');
    nav.appendChild(btn('← Back','gh big',function(){act({a:'go',i:N-1})},'prev'));
    nav.appendChild(btn('Done for now 🌙','big',function(){var Pp=progress(V.plan);modal('Done for now? 🌙',Pp.decided+' of '+N+' topics decided. Everything is saved. This ends the session for both of you.','Yes, done for now',function(){act({a:'bye'})})},'done'));
    wrap.appendChild(nav);
  }

  /* --- incoming --- */
  function onMsg(d){
    if(dead||!d||typeof d!=='object')return;
    if(isHost){
      if(d.k==='a')hostDo('guest',d.a);
      else if(d.k==='hi'){
        if(core.S.plan.updated===0&&d.plan&&typeof d.plan==='object'&&num(d.plan.updated)>0){
          var p=sanitizePlan(d.plan);if(p.updated>0){core.S.plan=p;core.S.q++;savePlan(p);V=core.view();onView()}
        }
        bcast();
      }
    }else if(d.k==='s'){
      if(typeof d.q!=='number'||d.q<=lastQ||!d.v)return;
      lastQ=d.q;V=d.v;if(hiTimer){clearInterval(hiTimer);hiTimer=null}
      savePlan(V.plan);onView();
    }
  }

  if(isHost){core=makeCore(ls(PLAN_KEY));V=core.view();lastAt=V.at;render();bcast()}
  else{
    render();
    var hi=function(){ctx.send({k:'hi',plan:ls(PLAN_KEY)})};hi();
    hiTimer=setInterval(function(){if(dead||V){clearInterval(hiTimer);hiTimer=null;return}hi()},2000);
  }
  return {
    onMsg:onMsg,
    destroy:function(){dead=true;if(hiTimer)clearInterval(hiTimer);timers.forEach(clearTimeout);Object.keys(pend).forEach(function(k){clearTimeout(pend[k].t)});ovBox.innerHTML=''},
    _core:core
  };
}

registerGame({
  id:'wedding',icon:'💍',name:'Wedding Planner',
  blurb:'Plan the big day together, one topic at a time: talk it through, heart ideas, and write down what you decide.',
  start:GAME_START,
  _t:{TOPICS:TOPICS,SHABADS:SHABADS,defaultPlan:defaultPlan,sanitizePlan:sanitizePlan,planText:planText,makeCore:makeCore,progress:progress,sortedSugs:sortedSugs,bothLiked:bothLiked}
});
})();
