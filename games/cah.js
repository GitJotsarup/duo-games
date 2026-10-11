/* Cards Against Us - 2 player (+ the House) party card game plugin for Duo Games */
(function () {
  'use strict';

  var WIN_SCORE = 7, MAX_ROUNDS = 14, HAND = 7, COUNTDOWN = 4;

  /* ---------- cards (original wording) ---------- */
  var BLACK = [
    "The meeting could have been an email, but instead it was ___.",
    "My therapist says my biggest red flag is ___.",
    "What's hiding in the back of the freezer? ___.",
    "Honey, we need to talk about ___.",
    "The secret ingredient in Grandma's famous casserole was ___.",
    "I didn't plan on ___, but here we are.",
    "Nothing ruins a first date faster than ___.",
    "In a shocking twist, the tooth fairy now accepts ___.",
    "What's the worst thing to hear from your Uber driver? ___.",
    "The new fitness craze sweeping the nation: ___.",
    "Scientists have finally confirmed that ___ is the real cause of Mondays.",
    "My villain origin story begins with ___.",
    "This year's most awkward wedding toast mentioned ___.",
    "Our relationship would improve instantly with more ___.",
    "What did I find in your browser history? ___.",
    "The airline lost my luggage but gave me ___.",
    "Breaking news: local man arrested for ___.",
    "The DJ at my funeral will be playing ___.",
    "Step one of my morning routine: ___.",
    "No one told me adulthood would involve so much ___.",
    "What makes every road trip worse? ___.",
    "I knew it was true love when you tolerated ___.",
    "Why can't I sleep at night? ___.",
    "My memoir is called 'Confessions of ___'.",
    "The hotel minibar now contains ___.",
    "Our couple's costume this Halloween: ___.",
    "What's my love language? ___.",
    "Local zoo introduces new attraction: ___.",
    "The group chat went silent after someone sent ___.",
    "According to my horoscope, today's lucky charm is ___.",
    "Before you judge me, you should know that I'm really into ___.",
    "The government is secretly spending billions on ___.",
    "What's under the bed? ___.",
    "Dinner was ruined by ___.",
    "I can't believe our landlord allows ___.",
    "My sleep paralysis demon turned out to be ___.",
    "The worst thing to find in a hotel bed: ___.",
    "A great way to end a toast: 'To ___!'",
    "The next big streaming documentary: The Rise and Fall of ___.",
    "I'm not saying it's aliens, but it's definitely ___.",
    "What would you smuggle through customs? ___.",
    "My boss walked in on me with ___.",
    "Each night before bed, I whisper a little prayer to ___.",
    "The thing that makes our house haunted: ___.",
    "Only after three drinks do I admit my love of ___.",
    "The real reason the dinosaurs went extinct: ___.",
    "What's the best way to apologize? ___.",
    "My toxic trait is believing that ___ counts as a personality.",
    "Instead of flowers, I brought you ___.",
    "The one thing I'd bring to a deserted island: ___.",
    "Forget the gym; I get my cardio from ___.",
    "Today's soup of the day is ___.",
    "The vows we wrote included a solemn promise of ___.",
    "Why is the dog barking? ___.",
    "Mom's new hobby is ___, and nobody knows how to react.",
    "The only thing worse than a Monday is a Monday with ___.",
    "Customer review: one star, would not recommend, too much ___.",
    "What would make this sandwich better? ___.",
    "I got kicked out of the book club for bringing up ___.",
    "My dating profile says I'm looking for someone who loves ___.",
    "The secret to a long marriage is ___.",
    "My last words will be ___.",
    "Tonight's bedtime story is all about ___.",
    "The intern accidentally sent a company-wide email about ___.",
    "Experts warn that ___ is the next big thing in wellness.",
    "Whenever I'm nervous, I like to think about ___.",
    "What did the neighbors complain about this time? ___.",
    "The last thing you want to hear from a surgeon: 'Oops, ___.'",
    "I would happily give up my entire weekend for ___.",
    "The grand prize winner at the county fair: ___.",
    "Cancel my meetings. I'm busy with ___.",
    "The school play was a disaster thanks to ___.",
    "I'm sorry, officer, but ___ was not my idea.",
    "Why did the chicken cross the road? To escape ___.",
    "Marriage counseling revealed that our biggest issue is ___.",
    "My retirement plan relies entirely on ___.",
    "Nothing says 'I love you' like ___.",
    "What gave the cat an existential crisis? ___.",
    "The smell coming from the garage is definitely ___.",
    "Tonight's special at the fusion bistro: ___ with a side of regret.",
    "Doctors hate him! One weird trick: ___.",
    "I found my purpose the day I discovered ___.",
    "Why I was uninvited from Thanksgiving: ___.",
    "The sequel nobody asked for: Fast and Furious 12, now with ___.",
    "My neighbor's yard sale had one item I could not unsee: ___.",
    "What do I keep in my glove compartment? ___.",
    "I was fine until somebody mentioned ___.",
    "A warm hug from ___ is all I need right now.",
    "The HR department has opened an investigation into ___.",
    "The old wizard's final warning: 'Beware of ___.'",
    "What's the worst thing to bring to a funeral? ___.",
    "The real MVP of my childhood was ___.",
    "Sorry I'm late, I got held up by ___.",
    "The next Olympic sport: competitive ___.",
    "Every great love story starts with ___.",
    /* pick 2 */
    "I wanted ___, but I got ___ instead.",
    "Our wedding theme: ___ meets ___.",
    "In my new buddy-cop movie, ___ teams up with ___.",
    "Roses are red, violets are blue, I brought you ___ and also ___.",
    "Tonight's double feature: ___ followed by ___.",
    "What did we argue about at 3 a.m.? ___ versus ___.",
    "The hot new startup is basically ___, but for ___.",
    "My ideal Sunday involves ___ and a little bit of ___.",
    "The prenup states that ___ goes to me and ___ goes to you.",
    "Breaking news: the mayor was caught mixing ___ with ___.",
    "Why we got banned from the buffet: ___ and ___.",
    "A recipe for disaster: take ___, add ___, and stir.",
    "On the first day of Christmas, my true love gave to me ___ and ___.",
    "The next superhero duo: Captain ___ and the Amazing ___.",
    "Dear diary, today I discovered ___. Then I regretted ___.",
    "I used to be into ___, but now it's all about ___.",
    "Next on reality TV: ___ must survive ___.",
    "My guilty pleasure is combining ___ with ___.",
    "The ghost of my ancestors warned me about ___ and ___.",
    "Welcome to the museum of ___ and ___.",
    "Couples therapy homework: replace ___ with ___."
  ];

  var WHITE = [
    "a haunted air fryer", "my ex's podcast", "an aggressively friendly goose", "a suspiciously warm toilet seat",
    "twelve raccoons in a trench coat", "unsolicited feet pictures", "a motivational speech from a hamster",
    "a very confident mediocre man", "the smell of old gym socks", "a passive-aggressive sticky note",
    "a tub of expired mayonnaise", "a rave in a retirement home", "aggressively loud chewing",
    "a bag of mystery meat", "an emotionally unavailable toaster", "a drunk wedding guest with a microphone",
    "my search history", "an unstoppable case of the hiccups", "a lifetime supply of beige paint",
    "a cursed spreadsheet", "a sentient pile of laundry", "three raccoons stacked as a man",
    "an off-brand Santa Claus", "a mildly threatening lullaby", "daddy issues in a lovely trench coat",
    "a self-help book written by a pigeon", "a slow clap from the entire office", "a very awkward group hug",
    "licking a stranger's doorknob", "the last slice of pizza", "a wheel of suspicious cheese",
    "an inflatable boyfriend named Gary", "ordering dessert first", "a long, loud, wet sneeze",
    "double-dipping at a funeral", "wearing socks with sandals to court", "my emotional support cactus",
    "an unexpected tax audit", "a confused clown at a bus stop", "reading my texts out loud",
    "a mascot with a grudge", "a lukewarm bath of gravy", "the sound of dial-up internet",
    "a flock of angry swans", "an overly honest fortune cookie", "a power nap that lasted six years",
    "a tragically misspelled tattoo", "somebody else's leftover lasagna", "a conspiracy about pigeons",
    "walking in on grandma's book club", "a dramatic gasp at the wrong moment", "a hot tub full of tapioca",
    "a deeply disappointed horse", "the world's smallest violin", "karaoke night with my in-laws",
    "a chair that screams when you sit", "a bachelor party at a bakery", "profound regret and a Tuesday",
    "a bottomless pit of student loans", "a stripper named Dennis the Cat", "microwaved fish in the break room",
    "throwing up in a potted plant", "a flirty garden gnome", "a panic attack at the self-checkout",
    "a mysterious stain on the ceiling", "the middle seat on a long flight", "an unlicensed fireworks display",
    "a very loud whisper", "a scented candle called 'Divorce'", "my mother-in-law's casserole of doom",
    "falling asleep during the vows", "a lingering smell of onions", "the last good bean",
    "a family-sized bag of regret", "sweating like a sinner in church", "an exorcism gone slightly wrong",
    "a yoga class for angry people", "a birthday cake shaped like my ex", "a sneeze that won't quit",
    "accidentally liking a photo from 2012", "doing my taxes in a hot tub", "licking the whole spoon",
    "my twin's evil twin", "a tiny hat for a large dog", "a whole lot of passive aggression",
    "an uncomfortably long hug", "a dramatic exit through the wrong door", "a vending machine that hates me",
    "forgetting my own safe word", "a subscription box of mystery liquids", "a questionable amount of glitter",
    "the stuff under the couch cushions", "a goat in a business suit", "putting the 'fun' in funeral",
    "a rubber duck with abandonment issues", "an ill-advised gender-reveal explosion", "a sad trombone",
    "a nap in the middle of a meeting", "peeing in the pool", "the awkward silence after a joke bombs",
    "a grandfather clock full of bees", "an unlabeled jar in the fridge", "a loud, confident karaoke rendition of nothing",
    "a mildly cursed family heirloom", "a disco ball in a library", "the audacity of a squirrel",
    "a dentist who loves his work too much", "a disappointing sequel", "a guy named Chad with a ukulele",
    "unsupervised access to a credit card", "wine from a juice box", "a surprise colonoscopy",
    "a midlife crisis in a convertible", "a rooster with anger issues", "overly aggressive flossing",
    "an intense staring contest with a cow", "a dead battery at the worst moment", "a trampoline in the living room",
    "a nonstop parade of doorbell-ringing kids", "a spreadsheet of my enemies", "a Jenga tower of bad decisions",
    "a very sweaty handshake", "a seagull stealing my fries", "taking a nap in the bread aisle",
    "an overpriced avocado", "a tragic breakdancing accident", "a wizard who only does taxes",
    "my browser's 47 open tabs", "an unexpected bagpipe solo", "a gym membership I never use",
    "the entire cast of a soap opera", "a lumberjack with a gluten allergy", "a glorious bowl of nachos",
    "a suspicious number of candles", "calling my boss 'Mom'", "an aggressively scented body spray",
    "a drive-thru proposal", "the dramatic reading of a grocery list", "an ancient curse and a Wi-Fi password",
    "a pirate with a food blog", "a clown car full of lawyers", "tripping over my own ego",
    "a very clingy houseplant", "burping the alphabet", "a stolen traffic cone",
    "a bad case of the Mondays", "a mime trapped in a box of regrets", "an accidental reply-all",
    "a pyramid scheme for scented candles", "grandpa's secret second family of ducks", "a hat made entirely of cheese",
    "a lactose-intolerant ice cream truck", "a haunted Roomba", "a pair of fuzzy handcuffs",
    "a mid-sentence existential crisis", "ten thousand tiny spiders", "bad karaoke and good tequila",
    "a fanny pack full of snacks", "a weekend alone with my thoughts", "a minivan full of feral cousins",
    "mandatory fun at work", "a fake mustache that fell off", "a hostile takeover of the PTA",
    "an unusually large zucchini", "a clingy ghost with a podcast", "being hungover at brunch",
    "a surprise visit from my in-laws", "a very persuasive telemarketer", "a dazzling display of mediocrity",
    "a lava lamp with feelings", "a bridal shower for a goat", "wrestling a bear for the last donut",
    "a bidet with a mind of its own", "a spooky doll in a baby stroller", "an urgent need for a bathroom",
    "my inner monologue, out loud", "a plate of cold spaghetti", "a talking toaster with opinions",
    "the sad little trombone of my life", "a banana in the tailpipe", "a dog wearing my clothes",
    "a smug cat staring at me", "an overly ambitious Halloween costume", "a hot mess in heels",
    "naked yoga in the backyard", "sweatpants at a black-tie event", "my cousin's pyramid scheme",
    "pretending to understand cryptocurrency", "stealing a bridesmaid's bouquet", "a very persistent mosquito",
    "an unflattering mirror in a fitting room", "someone chewing ice", "a poem about my left foot",
    "a rubber chicken with a law degree", "free samples as dinner", "an unsolicited TED talk",
    "my neighbor's weird hot tub parties", "a half-eaten birthday cake", "the world's longest handshake",
    "a surprising amount of body hair", "an emergency trip to the all-night pharmacy", "a lukewarm cup of regret",
    "an awkward high-five", "a one-man Broadway musical about tax law", "learning to love my own farts",
    "my secret stash of chocolate", "a fanny pack full of bad ideas", "an ostrich with a briefcase",
    "dancing like nobody's watching (everybody is)", "a stern talking-to from a parrot", "a whole bag of questionable herbs",
    "a pop quiz on my love life", "a chain email from 2003", "a cheese platter with an attitude",
    "a gentle spanking from destiny", "a three-hour conference call", "an extra-large tub of lube-flavored yogurt",
    "a surprise party for the wrong person", "a conga line of bad decisions", "a missing sock's second life",
    "the mildly erotic lifestyle of a lobster", "a sloppy kiss from a stranger's dog", "a muffin top of shame",
    "drunk dialing the wrong ex", "a sweaty sock puppet show", "the thrill of a good nap",
    "a mild case of arson", "crying in the shower", "grandma's secret OnlyFans",
    "my sketchy uncle's van", "a very cursed baby monitor", "a tiny violin concert for my problems",
    "the thing my dog buried in the yard", "a singing telegram from my landlord", "a pair of glittery crocs",
    "a passionate argument about pineapple on pizza", "a midnight fridge raid",
    "a spontaneous interpretive dance", "a hungover mime", "unlimited breadsticks",
    "a rogue shopping cart", "a thousand-yard stare over cold coffee", "a one-way ticket to Nowhere, Nebraska",
    "my future in a beanbag chair", "a tragic accident involving glitter and a fan", "extreme couponing",
    "a dubious gas station sushi", "a bouncy castle with a questionable past", "an uninvited plus-one",
    "a swamp of unanswered emails", "a crowd of judgmental pigeons", "a wild night of board games",
    "a very cuddly anaconda", "the corner of my bed covered in laundry", "a hostage situation at a bake sale",
    "a motivational poster of a sloth", "my landlord's thong collection", "a ferret in a tiny tuxedo",
    "a surprise inspection by a very dramatic nun", "a loyalty card for a brothel of bees", "an open-mic night for divorcees",
    "a lukewarm handshake from a king", "chugging gravy for a dare", "a voicemail from my past self",
    "a hot dog stand run by retired spies", "a blindfolded game of darts", "someone else's chin hair",
    "a very enthusiastic mattress salesman", "a hand-me-down curse", "a pet rock with trust issues",
    "telling a cop about my feelings", "my hairy back and I", "an inexplicably moist towel",
    "a late-night text that says 'u up?'", "twelve angry grandmothers", "an unreasonably long wedding speech",
    "a gift card to a store that closed", "a tragic mullet", "a suspicious white van with candy",
    "a dad joke that went too far", "an emu in the office", "a lifetime ban from the petting zoo",
    "a trust fall with a stranger", "a two-hour argument about the thermostat", "a muscular opera singer",
    "a cheese grater and a bad idea", "pickle juice for breakfast", "an enormous inflatable flamingo"
  ];

  /* ---------- helpers ---------- */
  function other(p) { return p === 'host' ? 'guest' : 'host'; }
  function blanks(i) { return BLACK[i].split('___').length - 1; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fill(blackIdx, cards) {
    var parts = BLACK[blackIdx].split('___'), out = '';
    for (var i = 0; i < parts.length; i++) {
      out += esc(parts[i]);
      if (i < parts.length - 1) out += '<u class="cau-fill">' + esc(WHITE[cards[i]]) + '</u>';
    }
    return out;
  }
  function blankText(blackIdx) {
    return esc(BLACK[blackIdx]).split('___').join('<span class="cau-blank">_____</span>');
  }
  function isInt(x, lo, hi) { return typeof x === 'number' && x === Math.floor(x) && x >= lo && x < hi; }

  var CSS = '' +
    '.cau{max-width:760px;margin:0 auto}' +
    '.cau .hd{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px}' +
    '.cau .sc b{font-size:1.4rem}.cau .sc span{margin-right:18px}' +
    '.cau .bc{background:#000;color:#fff;border:2px solid #fff;border-radius:14px;padding:22px;font-size:1.45rem;font-weight:800;line-height:1.35;min-height:110px;margin:10px 0}' +
    '.cau .bc small{display:block;margin-top:12px;font-size:.75rem;font-weight:600;color:#aaa;letter-spacing:.08em}' +
    '.cau .cau-fill{text-decoration:underline;text-underline-offset:4px;color:#fff}' +
    '.cau .cau-blank{color:#888}' +
    '.cau .hand{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px;margin:10px 0}' +
    '.cau .wc{background:#fff;color:#000;border-radius:12px;padding:14px;font-weight:700;cursor:pointer;border:4px solid transparent;position:relative;min-height:84px;user-select:none}' +
    '.cau .wc.sel{border-color:var(--gold);transform:translateY(-3px)}' +
    '.cau .wc i{position:absolute;top:-10px;right:-10px;background:var(--gold);color:#000;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:.9rem}' +
    '.cau .sub1{background:#fff;color:#000;border-radius:12px;padding:16px;margin:10px 0;font-weight:700;line-height:1.4;border:4px solid transparent}' +
    '.cau .sub1 u{color:#000}' +
    '.cau .sub1.win{border-color:var(--good)}' +
    '.cau .sub1 .who{display:block;font-size:.8rem;font-weight:700;margin-top:8px;color:#555;letter-spacing:.04em}' +
    '.cau .mid{text-align:center;padding:18px 0;color:var(--dim);font-size:1.1rem}' +
    '.cau .acts{display:flex;gap:10px;align-items:center;flex-wrap:wrap}' +
    '.cau .acts button{flex:0 0 auto}';

  /* ---------- the plugin ---------- */
  registerGame({
    id: 'cah',
    icon: '🖤',
    name: 'Cards Against Us',
    blurb: 'Dark-humour fill-in-the-blank party game. One judges, one plays, and the House sneaks in fakes.',
    start: function (ctx) {
      var me = ctx.me, partner = other(me);
      var names = ctx.names || { host: 'Host', guest: 'Guest' };
      var root = ctx.root;
      var hasDom = !!(root && typeof document !== 'undefined');
      var destroyed = false, ended = false, timer = null, cd = 0;
      var sel = [];
      var box = null;

      /* --- deterministic shared setup --- */
      var wIds = [], bIds = [];
      for (var i = 0; i < WHITE.length; i++) wIds.push(i);
      for (var j = 0; j < BLACK.length; j++) bIds.push(j);
      wIds = ctx.shuffle(wIds);
      var blackOrder = ctx.shuffle(bIds);
      var third = Math.floor(wIds.length / 3);
      var pools = { host: wIds.slice(0, third), guest: wIds.slice(third, 2 * third), house: wIds.slice(2 * third) };

      var S = {
        r: 0, phase: 'submit', judge: 'host', player: 'guest', black: 0, pickN: 1,
        score: { host: 0, guest: 0 }, hands: { host: [], guest: [] }, ptr: { host: 0, guest: 0, house: 0 },
        swapped: { host: false, guest: false }, ready: { host: false, guest: false },
        house: [], subs: null, picked: -1, over: false, result: null
      };

      function draw(who) { var p = pools[who]; return p[S.ptr[who]++ % p.length]; }

      function startRound() {
        S.judge = S.r % 2 === 0 ? 'host' : 'guest';
        S.player = other(S.judge);
        S.black = blackOrder[S.r % blackOrder.length];
        S.pickN = blanks(S.black);
        S.house = [];
        for (var k = 0; k < 2; k++) {
          var c = [];
          for (var m = 0; m < S.pickN; m++) c.push(draw('house'));
          S.house.push(c);
        }
        S.subs = null; S.picked = -1; S.result = null;
        S.ready = { host: false, guest: false };
        S.phase = 'submit';
        sel = [];
      }

      function init() {
        for (var k = 0; k < HAND; k++) { S.hands.host.push(draw('host')); S.hands.guest.push(draw('guest')); }
        startRound();
      }

      /* --- state transitions (identical on both clients) --- */
      function applySubmit(who, cards) {
        if (S.over || S.phase !== 'submit' || who !== S.player) return false;
        if (!Array.isArray(cards) || cards.length !== S.pickN) return false;
        var hand = S.hands[who], seen = {};
        for (var i = 0; i < cards.length; i++) {
          if (!isInt(cards[i], 0, WHITE.length) || seen[cards[i]] || hand.indexOf(cards[i]) < 0) return false;
          seen[cards[i]] = 1;
        }
        S.hands[who] = hand.filter(function (c) { return !seen[c]; });
        while (S.hands[who].length < HAND) S.hands[who].push(draw(who));
        var subs = [{ who: 'player', cards: cards.slice() }, { who: 'house', cards: S.house[0] }, { who: 'house', cards: S.house[1] }];
        var rnd = ctx.rng(ctx.seed * 131 + S.r * 7 + 5);
        for (var a = subs.length - 1; a > 0; a--) {
          var b = Math.floor(rnd() * (a + 1)), t = subs[a]; subs[a] = subs[b]; subs[b] = t;
        }
        S.subs = subs;
        S.phase = 'judge';
        sel = [];
        return true;
      }

      function applyPick(who, idx) {
        if (S.over || S.phase !== 'judge' || who !== S.judge || !isInt(idx, 0, 3)) return false;
        S.picked = idx;
        var w = S.subs[idx].who;
        var gets = w === 'player' ? S.player : S.judge;
        S.score[gets]++;
        S.result = { winner: gets, byHouse: w === 'house' };
        S.phase = 'reveal';
        if (S.score.host >= WIN_SCORE || S.score.guest >= WIN_SCORE || S.r + 1 >= MAX_ROUNDS) S.over = true;
        return true;
      }

      function applySwap(who) {
        if (S.over || S.swapped[who]) return false;
        S.swapped[who] = true;
        S.hands[who] = [];
        for (var k = 0; k < HAND; k++) S.hands[who].push(draw(who));
        if (who === me) sel = [];
        return true;
      }

      function tryAdvance() {
        if (S.phase !== 'reveal' || !S.ready.host || !S.ready.guest) return;
        stopTimer();
        if (S.over) { finish(); return; }
        S.r++;
        startRound();
        render();
      }

      function finish() {
        S.phase = 'over';
        render();
        if (ended) return;
        ended = true;
        var h = S.score.host, g = S.score.guest;
        var sc = names.host + ' ' + h + ' - ' + g + ' ' + names.guest;
        if (h === g) ctx.end('A tie!', 'Perfectly matched sense of humour. ' + sc);
        else ctx.end((h > g ? names.host : names.guest) + ' wins!', sc + (h >= WIN_SCORE || g >= WIN_SCORE ? '' : ' after ' + MAX_ROUNDS + ' rounds'));
      }

      /* --- local actions --- */
      function doSubmit(cards) {
        if (me !== S.player || !applySubmit(me, cards)) return false;
        ctx.send({ k: 'submit', r: S.r, cards: cards.slice() });
        render();
        return true;
      }
      function doPick(idx) {
        if (me !== S.judge || !applyPick(me, idx)) return false;
        ctx.send({ k: 'pick', r: S.r, idx: idx });
        render(); startTimer();
        return true;
      }
      function doSwap() {
        if (!applySwap(me)) return false;
        ctx.send({ k: 'swap' });
        render();
        return true;
      }
      function doNext() {
        if (S.phase !== 'reveal' || S.ready[me]) return false;
        S.ready[me] = true;
        ctx.send({ k: 'next', r: S.r });
        tryAdvance();
        render();
        return true;
      }

      /* --- messages --- */
      function onMsg(d) {
        if (destroyed || !d || typeof d !== 'object') return;
        if (d.k === 'submit') {
          if (d.r !== S.r || partner !== S.player) return;
          if (applySubmit(partner, d.cards)) render();
        } else if (d.k === 'pick') {
          if (d.r !== S.r || partner !== S.judge) return;
          if (applyPick(partner, d.idx)) { render(); startTimer(); }
        } else if (d.k === 'swap') {
          if (applySwap(partner)) render();
        } else if (d.k === 'next') {
          if (d.r !== S.r || S.phase !== 'reveal') return;
          S.ready[partner] = true;
          tryAdvance();
          render();
        }
      }

      /* --- countdown --- */
      function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
      function startTimer() {
        if (!hasDom) return;
        stopTimer();
        cd = COUNTDOWN;
        timer = setInterval(function () {
          if (S.phase !== 'reveal') { stopTimer(); return; }
          cd--;
          if (cd <= 0) { stopTimer(); doNext(); } else render();
        }, 1000);
      }

      /* --- UI --- */
      function nm(p) { return esc(names[p]); }
      function who(sub) { return sub.who === 'house' ? 'The House' : nm(S.player); }
      function render() {
        if (!hasDom || destroyed || !box) return;
        var h = '<div class="hd"><div class="tip">Round ' + (S.r + 1) + ' of ' + MAX_ROUNDS + ' &middot; first to ' + WIN_SCORE + '</div>' +
          '<div class="sc"><span style="color:var(--host)">' + nm('host') + ' <b>' + S.score.host + '</b></span>' +
          '<span style="color:var(--guest)">' + nm('guest') + ' <b>' + S.score.guest + '</b></span></div></div>';
        var iJudge = me === S.judge;
        var role = iJudge ? 'You are the Judge' : names[S.judge] + ' is the Judge';
        h += '<div class="bc">' + blankText(S.black) +
          '<small>' + esc(role.toUpperCase()) + (S.pickN === 2 ? ' &middot; PICK 2, IN ORDER' : '') + '</small></div>';

        if (S.phase === 'submit') {
          if (iJudge) {
            h += '<div class="mid">Waiting for ' + nm(S.player) + ' to play a card&hellip;</div>';
          } else {
            h += '<p class="tip">Pick ' + S.pickN + ' card' + (S.pickN > 1 ? 's (order matters)' : '') + ' from your hand. The House will slip in two fakes.</p><div class="hand">';
            S.hands[me].forEach(function (c) {
              var k = sel.indexOf(c);
              h += '<div class="wc' + (k >= 0 ? ' sel' : '') + '" data-a="sel" data-id="' + c + '">' + esc(WHITE[c]) + (k >= 0 && S.pickN > 1 ? '<i>' + (k + 1) + '</i>' : '') + '</div>';
            });
            h += '</div><div class="acts"><button data-a="submit"' + (sel.length === S.pickN ? '' : ' disabled') + '>Submit</button></div>';
          }
        } else if (S.phase === 'judge') {
          if (iJudge) {
            h += '<p class="tip">Anonymous submissions. Pick the funniest. If you pick a House card, you score for good taste instead.</p>';
            S.subs.forEach(function (s, i) {
              h += '<div class="sub1">' + fill(S.black, s.cards) + '<span class="who"><button data-a="pick" data-i="' + i + '">This one</button></span></div>';
            });
          } else {
            var mine = null;
            S.subs.forEach(function (s) { if (s.who === 'player') mine = s; });
            h += '<div class="mid">Judge is choosing&hellip;</div>';
            if (mine) h += '<div class="sub1">' + fill(S.black, mine.cards) + '<span class="who">YOUR ANSWER</span></div>';
          }
        } else if (S.phase === 'reveal' || S.phase === 'over') {
          S.subs.forEach(function (s, i) {
            h += '<div class="sub1' + (i === S.picked ? ' win' : '') + '">' + fill(S.black, s.cards) +
              '<span class="who">' + (i === S.picked ? 'WINNER &middot; ' : '') + who(s).toUpperCase() + '</span></div>';
          });
          var res = S.result;
          if (res) {
            h += '<div class="mid" style="color:var(--ink)">' + (res.byHouse ? nm(S.judge) + ' picked a House card: good taste, +1 for ' + nm(res.winner) + '.' : nm(res.winner) + ' wrote the winner: +1.') + '</div>';
          }
          if (S.phase === 'reveal') {
            h += '<div class="acts"><button data-a="next"' + (S.ready[me] ? ' disabled' : '') + '>' + (S.ready[me] ? 'Waiting for ' + nm(partner) + '&hellip;' : (S.over ? 'Finish' : 'Next round')) + '</button>' +
              '<span class="tip">' + (S.ready[me] ? '' : 'auto in ' + cd + 's') + '</span></div>';
          }
        }
        if (!S.swapped[me] && !S.over && S.phase !== 'over') {
          h += '<div class="acts" style="margin-top:14px"><button class="ghost" data-a="swap">Swap my hand (once per game)</button></div>';
        }
        box.innerHTML = h;
      }

      function onClick(e) {
        var el = e.target && e.target.closest ? e.target.closest('[data-a]') : null;
        if (!el || destroyed) return;
        var a = el.getAttribute('data-a');
        if (a === 'sel') {
          if (S.phase !== 'submit' || me !== S.player) return;
          var id = parseInt(el.getAttribute('data-id'), 10), k = sel.indexOf(id);
          if (k >= 0) sel.splice(k, 1);
          else if (sel.length < S.pickN) sel.push(id);
          else if (S.pickN === 1) sel = [id];
          render();
        } else if (a === 'submit') {
          if (sel.length === S.pickN) doSubmit(sel);
        } else if (a === 'pick') {
          doPick(parseInt(el.getAttribute('data-i'), 10));
        } else if (a === 'swap') {
          doSwap();
        } else if (a === 'next') {
          doNext();
        }
      }

      init();
      if (hasDom) {
        var st = document.createElement('style');
        st.textContent = CSS;
        root.appendChild(st);
        box = document.createElement('div');
        box.className = 'cau';
        root.appendChild(box);
        box.addEventListener('click', onClick);
        render();
      }

      return {
        onMsg: onMsg,
        destroy: function () { destroyed = true; stopTimer(); if (box && box.removeEventListener) box.removeEventListener('click', onClick); },
        _t: {
          state: function () {
            return JSON.parse(JSON.stringify({
              r: S.r, phase: S.phase, judge: S.judge, player: S.player, pickN: S.pickN, score: S.score,
              hand: S.hands[me], swapped: S.swapped, over: S.over, picked: S.picked, subs: S.subs,
              ptr: S.ptr, black: S.black
            }));
          },
          submit: doSubmit, pick: doPick, swap: doSwap, next: doNext
        }
      };
    }
  });

  if (typeof module !== 'undefined' && module.exports) module.exports = { BLACK: BLACK, WHITE: WHITE };
})();
