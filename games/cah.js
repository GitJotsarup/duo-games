/* Cards Against Us - 2 player (+ the House) party card game plugin for Duo Games */
(function () {
  'use strict';

  var WIN_SCORE = 7, MAX_ROUNDS = 14, HAND = 7, COUNTDOWN = 4;

  /* ---------- cards (original wording) ---------- */
  var DECKS = {
    dark: {
      name: 'Dark Humor',
      black: [
      "The meeting could have been an email, but instead it was ___.",
      "What's hiding in the back of the freezer? ___.",
      "I didn't plan on ___, but here we are.",
      "What's the worst thing to hear from your Uber driver? ___.",
      "Scientists have finally confirmed that ___ is the real cause of Mondays.",
      "My villain origin story begins with ___.",
      "Breaking news: local man arrested for ___.",
      "The DJ at my funeral will be playing ___.",
      "No one told me adulthood would involve so much ___.",
      "Why can't I sleep at night? ___.",
      "Our couple's costume this Halloween: ___.",
      "The group chat went silent after someone sent ___.",
      "Before you judge me, you should know that I'm really into ___.",
      "Dinner was ruined by ___.",
      "My sleep paralysis demon turned out to be ___.",
      "A great way to end a toast: 'To ___!'",
      "I'm not saying it's aliens, but it's definitely ___.",
      "My boss walked in on me with ___.",
      "The thing that makes our house haunted: ___.",
      "Only after three drinks do I admit my love of ___.",
      "The real reason the dinosaurs went extinct: ___.",
      "My toxic trait is believing that ___ counts as a personality.",
      "The one thing I'd bring to a deserted island: ___.",
      "Today's soup of the day is ___.",
      "Mom's new hobby is ___, and nobody knows how to react.",
      "Customer review: one star, would not recommend, too much ___.",
      "I got kicked out of the book club for bringing up ___.",
      "My last words will be ___.",
      "Experts warn that ___ is the next big thing in wellness.",
      "Whenever I'm nervous, I like to think about ___.",
      "The last thing you want to hear from a surgeon: 'Oops, ___.'",
      "I would happily give up my entire weekend for ___.",
      "Cancel my meetings. I'm busy with ___.",
      "I'm sorry, officer, but ___ was not my idea.",
      "My retirement plan relies entirely on ___.",
      "Nothing says 'I love you' like ___.",
      "The smell coming from the garage is definitely ___.",
      "Doctors hate him! One weird trick: ___.",
      "Why I was uninvited from Thanksgiving: ___.",
      "My neighbor's yard sale had one item I could not unsee: ___.",
      "I was fine until somebody mentioned ___.",
      "The HR department has opened an investigation into ___.",
      "The old wizard's final warning: 'Beware of ___.'",
      "What's the worst thing to bring to a funeral? ___.",
      "Sorry I'm late, I got held up by ___.",
      "Every great love story starts with ___.",
      "In my new buddy-cop movie, ___ teams up with ___.",
      "What did we argue about at 3 a.m.? ___ versus ___.",
      "My ideal Sunday involves ___ and a little bit of ___.",
      "Why we got banned from the buffet: ___ and ___.",
      "The next superhero duo: Captain ___ and the Amazing ___.",
      "I used to be into ___, but now it's all about ___.",
      "The ghost of my ancestors warned me about ___ and ___.",
      "Welcome to the museum of ___ and ___.",
      "My will states that ___ must be present at the reading.",
      "The coroner's report listed ___ as a contributing factor.",
      "Nothing puts life in perspective like ___.",
      "The last text my grandfather ever sent was about ___.",
      "On my deathbed, I will finally confess to ___.",
      "Rock bottom smells a lot like ___.",
      "The universe is vast, cold, and indifferent, but at least it has ___.",
      "At my funeral, please replace the flowers with ___.",
      "I've made peace with the fact that I'll die doing ___.",
      "The eulogy took a dark turn when someone brought up ___.",
      "In hell, the waiting room is decorated with ___.",
      "Plan B for my life is ___.",
      "Everything is meaningless, so I might as well try ___.",
      "What's the best coping mechanism? ___.",
      "The grim reaper showed up early because of ___.",
      "My obituary is sponsored by ___.",
      "The apocalypse started when somebody introduced ___.",
      "Bad decision number 47: ___.",
      "The last survivor of the apocalypse spent his days with ___.",
      "My emotional baggage now includes ___.",
      "Death is certain, but ___ is optional.",
      "The urn was accidentally filled with ___.",
      "Life is short, so I spent it on ___ and ___.",
      "My will leaves ___ to my enemies and ___ to my friends.",
      "The apocalypse survival kit: ___, ___, and nothing else.",
      "At the funeral, ___ got into a fistfight with ___."
      ],
      white: [
      "a haunted air fryer",
      "my ex's podcast",
      "a suspiciously warm toilet seat",
      "unsolicited feet pictures",
      "a very confident mediocre man",
      "a passive-aggressive sticky note",
      "a rave in a retirement home",
      "a bag of mystery meat",
      "a drunk wedding guest with a microphone",
      "an unstoppable case of the hiccups",
      "a cursed spreadsheet",
      "a sentient pile of laundry",
      "an off-brand Santa Claus",
      "daddy issues in a lovely trench coat",
      "a slow clap from the entire office",
      "licking a stranger's doorknob",
      "a wheel of suspicious cheese",
      "a long, loud, wet sneeze",
      "double-dipping at a funeral",
      "my emotional support cactus",
      "a confused clown at a bus stop",
      "a mascot with a grudge",
      "the sound of dial-up internet",
      "an overly honest fortune cookie",
      "a tragically misspelled tattoo",
      "a conspiracy about pigeons",
      "a dramatic gasp at the wrong moment",
      "a deeply disappointed horse",
      "karaoke night with my in-laws",
      "profound regret and a Tuesday",
      "microwaved fish in the break room",
      "a flirty garden gnome",
      "a mysterious stain on the ceiling",
      "an unlicensed fireworks display",
      "a scented candle called 'Divorce'",
      "falling asleep during the vows",
      "the last good bean",
      "sweating like a sinner in church",
      "an exorcism gone slightly wrong",
      "a yoga class for angry people",
      "a sneeze that won't quit",
      "doing my taxes in a hot tub",
      "my twin's evil twin",
      "a whole lot of passive aggression",
      "a dramatic exit through the wrong door",
      "a subscription box of mystery liquids",
      "the stuff under the couch cushions",
      "putting the 'fun' in funeral",
      "a rubber duck with abandonment issues",
      "a sad trombone",
      "peeing in the pool",
      "a grandfather clock full of bees",
      "a loud, confident karaoke rendition of nothing",
      "a mildly cursed family heirloom",
      "the audacity of a squirrel",
      "a disappointing sequel",
      "unsupervised access to a credit card",
      "a surprise colonoscopy",
      "a rooster with anger issues",
      "an intense staring contest with a cow",
      "a trampoline in the living room",
      "a spreadsheet of my enemies",
      "a very sweaty handshake",
      "taking a nap in the bread aisle",
      "a tragic breakdancing accident",
      "my browser's 47 open tabs",
      "a gym membership I never use",
      "a lumberjack with a gluten allergy",
      "a suspicious number of candles",
      "an aggressively scented body spray",
      "the dramatic reading of a grocery list",
      "an ancient curse and a Wi-Fi password",
      "a clown car full of lawyers",
      "a very clingy houseplant",
      "a stolen traffic cone",
      "a mime trapped in a box of regrets",
      "a pyramid scheme for scented candles",
      "a hat made entirely of cheese",
      "a haunted Roomba",
      "a mid-sentence existential crisis",
      "ten thousand tiny spiders",
      "a fanny pack full of snacks",
      "a minivan full of feral cousins",
      "a hostile takeover of the PTA",
      "a clingy ghost with a podcast",
      "being hungover at brunch",
      "a very persuasive telemarketer",
      "a lava lamp with feelings",
      "a spooky doll in a baby stroller",
      "my inner monologue, out loud",
      "a talking toaster with opinions",
      "a banana in the tailpipe",
      "a smug cat staring at me",
      "a hot mess in heels",
      "my cousin's pyramid scheme",
      "stealing a bridesmaid's bouquet",
      "an unflattering mirror in a fitting room",
      "a poem about my left foot",
      "free samples as dinner",
      "my neighbor's weird hot tub parties",
      "the world's longest handshake",
      "a lukewarm cup of regret",
      "a one-man Broadway musical about tax law",
      "a fanny pack full of bad ideas",
      "dancing like nobody's watching (everybody is)",
      "a whole bag of questionable herbs",
      "a chain email from 2003",
      "a three-hour conference call",
      "a conga line of bad decisions",
      "a sloppy kiss from a stranger's dog",
      "drunk dialing the wrong ex",
      "the thrill of a good nap",
      "a mild case of arson",
      "my sketchy uncle's van",
      "a very cursed baby monitor",
      "the thing my dog buried in the yard",
      "a pair of glittery crocs",
      "a midnight fridge raid",
      "a hungover mime",
      "a rogue shopping cart",
      "a one-way ticket to Nowhere, Nebraska",
      "a tragic accident involving glitter and a fan",
      "a dubious gas station sushi",
      "an uninvited plus-one",
      "a crowd of judgmental pigeons",
      "a very cuddly anaconda",
      "a hostage situation at a bake sale",
      "a ferret in a tiny tuxedo",
      "a surprise inspection by a very dramatic nun",
      "a lukewarm handshake from a king",
      "a voicemail from my past self",
      "a blindfolded game of darts",
      "a very enthusiastic mattress salesman",
      "a hand-me-down curse",
      "telling a cop about my feelings",
      "a late-night text that says 'u up?'",
      "an unreasonably long wedding speech",
      "a tragic mullet",
      "a dad joke that went too far",
      "a lifetime ban from the petting zoo",
      "a two-hour argument about the thermostat",
      "a cheese grater and a bad idea",
      "an enormous inflatable flamingo",
      "a mild case of mortality",
      "an open casket with a wink",
      "the heat death of the universe",
      "unpaid funeral flowers",
      "a coffin with Bluetooth speakers",
      "a will written on a napkin",
      "a ghost with unfinished paperwork",
      "the last bottle of wine in the bunker",
      "existential dread with sprinkles",
      "a cursed life insurance policy",
      "a hearse stuck in traffic",
      "drinking alone at a wake",
      "a bonsai tree of regret",
      "the inevitable collapse of everything",
      "thoughts and prayers in bulk",
      "a skeleton in the closet, literally",
      "my last will and testament, in emoji",
      "forgetting to write the eulogy",
      "a tombstone with a typo",
      "a midlife crisis with a shovel",
      "a reanimated houseplant",
      "burying the evidence",
      "the quiet hum of despair",
      "getting ghosted by an actual ghost",
      "a pyramid of unpaid bills",
      "an urn used as a cookie jar",
      "a long, slow decline",
      "a stale funeral sandwich",
      "trusting a stranger's mushroom guide",
      "arguing with a tombstone",
      "a plague doctor at brunch",
      "a very comfortable casket",
      "a cat that has judged me for years",
      "the soft sound of the void",
      "a haunted retirement home",
      "winning an argument with a skeleton",
      "an optimistic gravedigger",
      "a wake that turned into a rave",
      "the last cigarette of a lucky man",
      "a tiny cactus of despair",
      "a meteor with my name on it",
      "a mortgage that outlives me",
      "a sad piano in an empty church",
      "a crow staring at me",
      "therapy that is just screaming",
      "a life coach for the doomed",
      "an expired parachute",
      "a bucket list of terrible ideas",
      "my inheritance in beanie babies",
      "an eternal flame lit with a Bic",
      "laughing at the wrong moment in church",
      "a clearance sale at the cemetery",
      "a motivational poster in a morgue",
      "dancing on a very old grave",
      "a fortune teller who just says 'no'",
      "a cheerful hospice mascot",
      "the sweet release of a long weekend",
      "a lifetime of Sunday scaries",
      "an apocalypse bunker with bad Wi-Fi",
      "a vulture with a reservation"
      ]
    },
    dirty: {
      name: 'Dirty Stuff',
      black: [
      "My therapist says my biggest red flag is ___.",
      "Honey, we need to talk about ___.",
      "The secret ingredient in Grandma's famous casserole was ___.",
      "Nothing ruins a first date faster than ___.",
      "In a shocking twist, the tooth fairy now accepts ___.",
      "The new fitness craze sweeping the nation: ___.",
      "This year's most awkward wedding toast mentioned ___.",
      "Our relationship would improve instantly with more ___.",
      "What did I find in your browser history? ___.",
      "The airline lost my luggage but gave me ___.",
      "Step one of my morning routine: ___.",
      "What makes every road trip worse? ___.",
      "I knew it was true love when you tolerated ___.",
      "My memoir is called 'Confessions of ___'.",
      "The hotel minibar now contains ___.",
      "What's my love language? ___.",
      "Local zoo introduces new attraction: ___.",
      "According to my horoscope, today's lucky charm is ___.",
      "The government is secretly spending billions on ___.",
      "What's under the bed? ___.",
      "I can't believe our landlord allows ___.",
      "The worst thing to find in a hotel bed: ___.",
      "The next big streaming documentary: The Rise and Fall of ___.",
      "What would you smuggle through customs? ___.",
      "Each night before bed, I whisper a little prayer to ___.",
      "What's the best way to apologize? ___.",
      "Instead of flowers, I brought you ___.",
      "Forget the gym; I get my cardio from ___.",
      "The vows we wrote included a solemn promise of ___.",
      "Why is the dog barking? ___.",
      "The only thing worse than a Monday is a Monday with ___.",
      "What would make this sandwich better? ___.",
      "My dating profile says I'm looking for someone who loves ___.",
      "The secret to a long marriage is ___.",
      "Tonight's bedtime story is all about ___.",
      "The intern accidentally sent a company-wide email about ___.",
      "What did the neighbors complain about this time? ___.",
      "The grand prize winner at the county fair: ___.",
      "The school play was a disaster thanks to ___.",
      "Why did the chicken cross the road? To escape ___.",
      "Marriage counseling revealed that our biggest issue is ___.",
      "What gave the cat an existential crisis? ___.",
      "Tonight's special at the fusion bistro: ___ with a side of regret.",
      "I found my purpose the day I discovered ___.",
      "The sequel nobody asked for: Fast and Furious 12, now with ___.",
      "What do I keep in my glove compartment? ___.",
      "A warm hug from ___ is all I need right now.",
      "The real MVP of my childhood was ___.",
      "The next Olympic sport: competitive ___.",
      "I wanted ___, but I got ___ instead.",
      "Our wedding theme: ___ meets ___.",
      "Roses are red, violets are blue, I brought you ___ and also ___.",
      "Tonight's double feature: ___ followed by ___.",
      "The hot new startup is basically ___, but for ___.",
      "The prenup states that ___ goes to me and ___ goes to you.",
      "Breaking news: the mayor was caught mixing ___ with ___.",
      "A recipe for disaster: take ___, add ___, and stir.",
      "On the first day of Christmas, my true love gave to me ___ and ___.",
      "Dear diary, today I discovered ___. Then I regretted ___.",
      "Next on reality TV: ___ must survive ___.",
      "My guilty pleasure is combining ___ with ___.",
      "Couples therapy homework: replace ___ with ___.",
      "My safe word is ___.",
      "Tonight in the bedroom, I'm trying out ___.",
      "You can tell it was a good night when I wake up next to ___.",
      "The thing I'd never admit during pillow talk: ___.",
      "Our home movie is really just ___.",
      "The walk of shame was made worse by ___.",
      "Her dating profile said, 'I love long walks and ___.'",
      "The worst time to bring up ___ is during foreplay.",
      "I got a little too excited about ___.",
      "The neighbors can hear ___ through the wall.",
      "My kink is ___, and I'm not ashamed.",
      "Is that ___ in your pocket, or are you just happy to see me?",
      "What did the sexy librarian whisper? '___.'",
      "The honeymoon suite came complete with ___.",
      "What's in my nightstand drawer? ___.",
      "The most awkward thing to shout mid-moan: '___!'",
      "Netflix and ___.",
      "After the third date, I finally revealed ___.",
      "Foreplay with me includes ___.",
      "Candlelight, soft music, and ___.",
      "The best part of makeup sex is ___.",
      "What gets you in the mood? ___.",
      "I swiped right because of ___.",
      "My ex left behind ___ and a lifetime of trauma.",
      "I like my partner like I like my coffee: ___ and ___.",
      "Tonight's playlist: slow jams, ___, and ___.",
      "Things I can't explain to my mother: ___ and ___.",
      "Hot tip for the bedroom: pair ___ with ___.",
      "Last night I learned that ___ is surprisingly good with ___.",
      "The couple next door is arguing about ___ versus ___."
      ],
      white: [
      "an aggressively friendly goose",
      "twelve raccoons in a trench coat",
      "a motivational speech from a hamster",
      "the smell of old gym socks",
      "a tub of expired mayonnaise",
      "aggressively loud chewing",
      "an emotionally unavailable toaster",
      "my search history",
      "a lifetime supply of beige paint",
      "three raccoons stacked as a man",
      "a mildly threatening lullaby",
      "a self-help book written by a pigeon",
      "a very awkward group hug",
      "the last slice of pizza",
      "an inflatable boyfriend named Gary",
      "ordering dessert first",
      "wearing socks with sandals to court",
      "an unexpected tax audit",
      "reading my texts out loud",
      "a lukewarm bath of gravy",
      "a flock of angry swans",
      "a power nap that lasted six years",
      "somebody else's leftover lasagna",
      "walking in on grandma's book club",
      "a hot tub full of tapioca",
      "the world's smallest violin",
      "a chair that screams when you sit",
      "a bachelor party at a bakery",
      "a bottomless pit of student loans",
      "a stripper named Dennis the Cat",
      "throwing up in a potted plant",
      "a panic attack at the self-checkout",
      "the middle seat on a long flight",
      "a very loud whisper",
      "my mother-in-law's casserole of doom",
      "a lingering smell of onions",
      "a family-sized bag of regret",
      "a birthday cake shaped like my ex",
      "accidentally liking a photo from 2012",
      "licking the whole spoon",
      "a tiny hat for a large dog",
      "an uncomfortably long hug",
      "a vending machine that hates me",
      "forgetting my own safe word",
      "a questionable amount of glitter",
      "a goat in a business suit",
      "an ill-advised gender-reveal explosion",
      "a nap in the middle of a meeting",
      "the awkward silence after a joke bombs",
      "an unlabeled jar in the fridge",
      "a disco ball in a library",
      "a dentist who loves his work too much",
      "a guy named Chad with a ukulele",
      "wine from a juice box",
      "a midlife crisis in a convertible",
      "overly aggressive flossing",
      "a dead battery at the worst moment",
      "a nonstop parade of doorbell-ringing kids",
      "a Jenga tower of bad decisions",
      "a seagull stealing my fries",
      "an overpriced avocado",
      "a wizard who only does taxes",
      "an unexpected bagpipe solo",
      "the entire cast of a soap opera",
      "a glorious bowl of nachos",
      "calling my boss 'Mom'",
      "a drive-thru proposal",
      "a pirate with a food blog",
      "tripping over my own ego",
      "burping the alphabet",
      "a bad case of the Mondays",
      "an accidental reply-all",
      "grandpa's secret second family of ducks",
      "a lactose-intolerant ice cream truck",
      "a pair of fuzzy handcuffs",
      "bad karaoke and good tequila",
      "a weekend alone with my thoughts",
      "mandatory fun at work",
      "a fake mustache that fell off",
      "an unusually large zucchini",
      "a surprise visit from my in-laws",
      "a dazzling display of mediocrity",
      "a bridal shower for a goat",
      "wrestling a bear for the last donut",
      "a bidet with a mind of its own",
      "an urgent need for a bathroom",
      "a plate of cold spaghetti",
      "the sad little trombone of my life",
      "a dog wearing my clothes",
      "an overly ambitious Halloween costume",
      "naked yoga in the backyard",
      "sweatpants at a black-tie event",
      "pretending to understand cryptocurrency",
      "a very persistent mosquito",
      "someone chewing ice",
      "a rubber chicken with a law degree",
      "an unsolicited TED talk",
      "a half-eaten birthday cake",
      "a surprising amount of body hair",
      "an emergency trip to the all-night pharmacy",
      "an awkward high-five",
      "learning to love my own farts",
      "my secret stash of chocolate",
      "an ostrich with a briefcase",
      "a stern talking-to from a parrot",
      "a pop quiz on my love life",
      "a cheese platter with an attitude",
      "a gentle spanking from destiny",
      "an extra-large tub of lube-flavored yogurt",
      "a surprise party for the wrong person",
      "a missing sock's second life",
      "the mildly erotic lifestyle of a lobster",
      "a muffin top of shame",
      "a sweaty sock puppet show",
      "crying in the shower",
      "grandma's secret OnlyFans",
      "a tiny violin concert for my problems",
      "a singing telegram from my landlord",
      "a passionate argument about pineapple on pizza",
      "a spontaneous interpretive dance",
      "unlimited breadsticks",
      "a thousand-yard stare over cold coffee",
      "my future in a beanbag chair",
      "extreme couponing",
      "a bouncy castle with a questionable past",
      "a swamp of unanswered emails",
      "a wild night of board games",
      "the corner of my bed covered in laundry",
      "a motivational poster of a sloth",
      "my landlord's thong collection",
      "a loyalty card for a brothel of bees",
      "an open-mic night for divorcees",
      "chugging gravy for a dare",
      "a hot dog stand run by retired spies",
      "someone else's chin hair",
      "a pet rock with trust issues",
      "my hairy back and I",
      "an inexplicably moist towel",
      "twelve angry grandmothers",
      "a gift card to a store that closed",
      "a suspicious white van with candy",
      "an emu in the office",
      "a trust fall with a stranger",
      "a muscular opera singer",
      "pickle juice for breakfast",
      "a velvet blindfold",
      "a surprise hand on my thigh",
      "the world's most awkward moan",
      "a bottle of questionable massage oil",
      "a leather-clad accountant",
      "flavored body paint",
      "a nurse costume two sizes too small",
      "a feather duster used wrongly",
      "a nightstand full of regrets",
      "a very confident wink",
      "a spanking paddle named Gerald",
      "a tantric session gone wrong",
      "premature celebration",
      "an enthusiastic butt slap",
      "a hickey on my knee",
      "whispering dirty things in a foreign language",
      "a lube dispenser shaped like a swan",
      "a threesome of lonely socks",
      "roleplaying as strangers at the grocery store",
      "getting stuck in a sexy costume",
      "a whip made of licorice",
      "a stripper pole in the living room",
      "sending a nude to the family group chat",
      "an underwear drawer of mysteries",
      "a dramatic orgasm face",
      "a squeaky bed in a thin-walled apartment",
      "a clearance-rack thong",
      "edible underwear past its expiry",
      "a naked game of Twister",
      "a tickle fight that escalated",
      "chest hair like a shag carpet",
      "a long make-out in a movie theater",
      "a sexy voicemail left for the wrong person",
      "champagne in the bathtub",
      "bunny ears and nothing else",
      "a cowboy hat and a lot of confidence",
      "a mid-coital sneeze",
      "moaning the wrong name",
      "my partner's sultry pirate impression",
      "a butt plug used as a paperweight",
      "a sex swing in the garage",
      "a vibrator in the airport scanner",
      "dirty talk about spreadsheets",
      "the sound of a headboard knocking",
      "an overenthusiastic lap dance",
      "shaved legs and bad intentions",
      "a hot-wax accident",
      "skinny dipping at the family reunion",
      "a leg cramp at the climax",
      "a lingerie fashion show for one",
      "a very friendly masseuse",
      "a love bite shaped like Florida",
      "an exhibitionist squirrel",
      "a hairy-chested Santa",
      "boudoir photos with my cat",
      "a sultry saxophone solo",
      "a whispered 'harder' at the dentist",
      "a rented hotel room by the hour",
      "a very flexible yoga instructor",
      "fuzzy handcuffs and a bad memory"
      ]
    }
  };
  var DECK_IDS = ['dark', 'dirty'];
  var BLACK = [], WHITE = [], BD = [], WD = [];
  DECK_IDS.forEach(function (d) {
    DECKS[d].black.forEach(function (t) { BLACK.push(t); BD.push(d); });
    DECKS[d].white.forEach(function (t) { WHITE.push(t); WD.push(d); });
  });

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
    '.cau{max-width:800px;margin:0 auto;font-family:var(--font,inherit);--cau:#ff3b5c;--cau2:var(--violet,#9b6bff)}' +
    '.cau .hd{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px}' +
    '.cau .hd .tip{background:rgba(255,255,255,.07);border:1px solid var(--line);border-radius:999px;padding:6px 14px;font-weight:600}' +
    '.cau .sc{display:flex;gap:10px;flex-wrap:wrap}' +
    '.cau .pill{display:flex;align-items:center;gap:10px;background:linear-gradient(150deg,var(--card2),var(--card));border:1px solid var(--line);border-radius:999px;padding:6px 14px 6px 6px;box-shadow:var(--shadow)}' +
    '.cau .pill.jd{box-shadow:0 0 0 2px var(--gold),var(--shadow)}' +
    '.cau .av{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;color:#12081f;font-size:.95rem}' +
    '.cau .pill.h .av{background:linear-gradient(135deg,#ff9bb8,var(--host))}.cau .pill.g .av{background:linear-gradient(135deg,#a8e4ff,var(--guest))}' +
    '.cau .pill .nm{font-weight:700}' +
    '.cau .pips{display:flex;gap:3px}' +
    '.cau .pip{width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,.14)}' +
    '.cau .pill.h .pip.on{background:var(--host);box-shadow:0 0 8px var(--host)}.cau .pill.g .pip.on{background:var(--guest);box-shadow:0 0 8px var(--guest)}' +
    '.cau .jb{font-size:.7rem;background:var(--gold);color:#2a1a00;border-radius:999px;padding:2px 8px;font-weight:800;letter-spacing:.05em}' +
    '.cau .bc{position:relative;background:radial-gradient(500px 200px at 100% 0%,rgba(255,59,92,.22),transparent 60%),linear-gradient(160deg,#16151d,#050507);color:#fff;border:1px solid rgba(255,255,255,.14);border-radius:20px;padding:26px 26px 22px;font-size:clamp(1.3rem,3vw,1.8rem);font-weight:800;line-height:1.3;min-height:150px;margin:12px 0;box-shadow:0 18px 40px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.08);animation:caupop .35s}' +
    '.cau .bc em{display:block;font-style:normal;font-size:.62rem;letter-spacing:.2em;color:#9a98b8;font-weight:800;margin-bottom:12px}' +
    '.cau .bc em::before{content:\'\\1F5A4\';margin-right:6px}' +
    '.cau .bc small{display:block;margin-top:16px;font-size:.72rem;font-weight:700;color:var(--gold);letter-spacing:.12em}' +
    '.cau .cau-fill{text-decoration:underline;text-decoration-color:var(--cau);text-decoration-thickness:3px;text-underline-offset:5px}' +
    '.cau .cau-blank{color:var(--cau);opacity:.8}' +
    '.cau .hand{display:grid;grid-template-columns:repeat(auto-fill,minmax(165px,1fr));gap:14px;margin:16px 0 8px;padding-top:8px}' +
    '.cau .wc{background:linear-gradient(170deg,#fff,#ececf3);color:#101018;border-radius:14px;padding:16px;font-weight:700;line-height:1.3;cursor:pointer;border:3px solid transparent;position:relative;min-height:104px;user-select:none;box-shadow:0 8px 18px rgba(0,0,0,.4),0 1px 0 #fff inset;transition:transform .15s,box-shadow .15s,border-color .15s;animation:caudeal .35s backwards}' +
    '.cau .wc:nth-child(odd){transform:rotate(-1.2deg)}.cau .wc:nth-child(even){transform:rotate(1deg)}' +
    '.cau .wc:nth-child(2){animation-delay:.04s}.cau .wc:nth-child(3){animation-delay:.08s}.cau .wc:nth-child(4){animation-delay:.12s}.cau .wc:nth-child(5){animation-delay:.16s}.cau .wc:nth-child(6){animation-delay:.2s}.cau .wc:nth-child(7){animation-delay:.24s}' +
    '.cau .wc:hover{transform:translateY(-8px) rotate(0);box-shadow:0 16px 28px rgba(0,0,0,.5)}' +
    '.cau .wc.sel{border-color:var(--cau);transform:translateY(-12px) rotate(0);box-shadow:0 0 0 3px rgba(255,59,92,.35),0 18px 30px rgba(255,59,92,.3)}' +
    '.cau .wc i{position:absolute;top:-12px;right:-10px;background:linear-gradient(135deg,var(--cau),var(--cau2));color:#fff;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-style:normal;font-weight:800;font-size:.95rem;box-shadow:0 4px 10px rgba(0,0,0,.4)}' +
    '.cau .sub1{background:linear-gradient(170deg,#fff,#ececf3);color:#101018;border-radius:16px;padding:18px 20px;margin:12px 0;font-weight:700;line-height:1.45;border:3px solid transparent;box-shadow:0 10px 24px rgba(0,0,0,.4);animation:cauflip .55s backwards;transform-origin:50% 0}' +
    '.cau .sub1:nth-of-type(2){animation-delay:.25s}.cau .sub1:nth-of-type(3){animation-delay:.5s}' +
    '.cau .sub1 u{text-decoration-color:var(--cau);text-decoration-thickness:3px;text-underline-offset:4px}' +
    '.cau .sub1.win{border-color:var(--good);box-shadow:0 0 0 4px rgba(74,222,128,.25),0 0 40px rgba(74,222,128,.35);animation:cauflip .55s backwards,cauwin 1.4s .6s 2}' +
    '.cau .sub1 .who{display:block;margin-top:10px;font-size:.78rem;font-weight:800;color:#555;letter-spacing:.05em}' +
    '.cau .tg{display:inline-block;border-radius:999px;padding:3px 11px;margin-right:6px;color:#fff;background:#555;font-size:.74rem;letter-spacing:.05em}' +
    '.cau .tg.you{background:linear-gradient(135deg,var(--cau),var(--cau2))}.cau .tg.hs{background:linear-gradient(135deg,#555,#222)}.cau .tg.wn{background:var(--good);color:#06240f}' +
    '.cau .mid{text-align:center;padding:20px 0;color:var(--dim);font-size:1.15rem;font-weight:600}' +
    '.cau .dk{position:relative;display:flex;align-items:center;gap:14px;border:2px solid var(--line);border-radius:20px;padding:20px 22px;margin:14px 0;font-size:1.2rem;cursor:pointer;overflow:hidden;opacity:.55;filter:saturate(.6);transition:transform .15s,opacity .15s,filter .15s,border-color .15s;box-shadow:var(--shadow)}' +
    '.cau .dk.dk-dark{background:linear-gradient(135deg,#2a1457,#0b0716)}.cau .dk.dk-dirty{background:linear-gradient(135deg,#d6246e,#5a0a2a)}' +
    '.cau .dk.on{opacity:1;filter:none;border-color:rgba(255,255,255,.6)}' +
    '.cau .dk:hover{transform:translateY(-2px)}' +
    '.cau .dk .em{font-size:2.2rem}.cau .dk .bx{margin-left:auto;font-size:1.8rem}' +
    '.cau .dk .tip{display:block;color:rgba(255,255,255,.7);font-size:.85rem}' +
    '.cau .acts{display:flex;gap:10px;align-items:center;flex-wrap:wrap}' +
    '.cau .acts button{flex:0 0 auto}' +
    '.cau button[data-a="submit"],.cau button[data-a="start"],.cau button[data-a="next"]{background:linear-gradient(135deg,#ff6b86,#ff3b5c 50%,#9b6bff);color:#fff}' +
    '.cau button[data-a="pick"]{background:linear-gradient(135deg,#ff6b86,#ff3b5c);color:#fff}' +
    '@keyframes caupop{from{opacity:0;transform:scale(.96) translateY(8px)}to{opacity:1;transform:none}}' +
    '@keyframes caudeal{from{opacity:0;margin-top:-30px}to{opacity:1;margin-top:0}}' +
    '@keyframes cauflip{from{opacity:0;transform:perspective(600px) rotateX(-80deg)}to{opacity:1;transform:none}}' +
    '@keyframes cauwin{0%,100%{transform:scale(1)}50%{transform:scale(1.025)}}';

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
      var sel_decks = DECK_IDS.slice();   /* chosen decks (host controls, guest mirrors) */
      var pools = { host: [], guest: [], house: [] };
      var blackOrder = [0];

      var S = {
        r: 0, phase: 'setup', decks: [], judge: 'host', player: 'guest', black: 0, pickN: 1,
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

      function cleanDecks(list) {
        if (!Array.isArray(list)) return null;
        var out = DECK_IDS.filter(function (d) { return list.indexOf(d) >= 0; });
        return out.length ? out : null;
      }

      function beginGame(list) {
        var wIds = [], bIds = [];
        for (var i = 0; i < WHITE.length; i++) if (list.indexOf(WD[i]) >= 0) wIds.push(i);
        for (var j = 0; j < BLACK.length; j++) if (list.indexOf(BD[j]) >= 0) bIds.push(j);
        wIds = ctx.shuffle(wIds);
        blackOrder = ctx.shuffle(bIds);
        var third = Math.floor(wIds.length / 3);
        pools = { host: wIds.slice(0, third), guest: wIds.slice(third, 2 * third), house: wIds.slice(2 * third) };
        S.decks = list.slice();
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
      function doDecks(list) {
        if (me !== 'host' || S.phase !== 'setup') return false;
        var l = cleanDecks(list);
        if (!l) return false;
        sel_decks = l;
        ctx.send({ k: 'decks', d: l.slice() });
        render();
        return true;
      }
      function doStart() {
        if (me !== 'host' || S.phase !== 'setup') return false;
        var l = cleanDecks(sel_decks);
        if (!l) return false;
        ctx.send({ k: 'start', d: l.slice() });
        beginGame(l);
        render();
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
        if (d.k === 'decks') {
          if (S.phase !== 'setup' || partner !== 'host') return;
          var l1 = cleanDecks(d.d);
          if (l1) { sel_decks = l1; render(); }
        } else if (d.k === 'start') {
          if (S.phase !== 'setup' || partner !== 'host') return;
          var l2 = cleanDecks(d.d);
          if (l2) { sel_decks = l2; beginGame(l2); render(); }
        } else if (d.k === 'submit') {
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
      function who(sub) { return sub.who === 'house' ? '<span class="tg hs">&#127968; The House</span>' : '<span class="tg you">' + (S.player === me ? 'You' : nm(S.player)) + '</span>'; }
      function pill(p) {
        var pips = '';
        for (var i = 0; i < WIN_SCORE; i++) pips += '<span class="pip' + (i < S.score[p] ? ' on' : '') + '"></span>';
        var ini = esc(String(names[p] || '?').charAt(0).toUpperCase());
        return '<div class="pill ' + (p === 'host' ? 'h' : 'g') + (S.judge === p ? ' jd' : '') + '"><span class="av">' + ini + '</span>' +
          '<span class="nm">' + nm(p) + ' ' + S.score[p] + '</span><span class="pips">' + pips + '</span>' + (S.judge === p ? '<span class="jb">JUDGE</span>' : '') + '</div>';
      }

      function renderSetup() {
        var host = me === 'host';
        var h = '<div class="bc">CARDS AGAINST US<small>' + (host ? 'CHOOSE YOUR DECKS' : esc(names.host.toUpperCase()) + ' IS CHOOSING THE DECKS') + '</small></div>';
        DECK_IDS.forEach(function (d) {
          var on = sel_decks.indexOf(d) >= 0;
          h += '<div class="dk dk-' + d + (on ? ' on' : '') + '"' + (host ? ' data-a="deck" data-d="' + d + '"' : '') + ' role="checkbox" aria-checked="' + on + '">' +
            '<span class="em">' + (d === 'dark' ? '&#127761;' : '&#128139;') + '</span><span><b>' + esc(DECKS[d].name) + '</b>' +
            '<span class="tip">' + DECKS[d].black.length + ' prompts &middot; ' + DECKS[d].white.length + ' answers</span></span><span class="bx">' + (on ? '&#9745;' : '&#9744;') + '</span></div>';
        });
        if (host) h += '<div class="acts"><button data-a="start">Start game</button><span class="tip">At least one deck must stay selected.</span></div>';
        else h += '<div class="mid">Waiting for ' + nm('host') + ' to start&hellip;</div>';
        box.innerHTML = h;
      }

      function render() {
        if (!hasDom || destroyed || !box) return;
        if (S.phase === 'setup') { renderSetup(); return; }
        var dn = S.decks.map(function (d) { return DECKS[d].name; }).join(' + ');
        var h = '<div class="hd"><div class="tip">Round ' + (S.r + 1) + ' of ' + MAX_ROUNDS + ' &middot; first to ' + WIN_SCORE + ' &middot; ' + esc(dn) + '</div>' +
          '<div class="sc">' + pill('host') + pill('guest') + '</div></div>';
        var iJudge = me === S.judge;
        var role = iJudge ? 'You are the Judge' : names[S.judge] + ' is the Judge';
        h += '<div class="bc"><em>CARDS AGAINST US</em>' + blankText(S.black) +
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
              '<span class="who">' + (i === S.picked ? '<span class="tg wn">WINNER</span>' : '') + who(s) + '</span></div>';
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
        if (a === 'deck') {
          var dd = el.getAttribute('data-d'), cur = sel_decks.slice(), q = cur.indexOf(dd);
          if (q >= 0) cur.splice(q, 1); else cur.push(dd);
          doDecks(cur);
        } else if (a === 'start') {
          doStart();
        } else if (a === 'sel') {
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
              r: S.r, decks: S.decks, phase: S.phase, judge: S.judge, player: S.player, pickN: S.pickN, score: S.score,
              hand: S.hands[me], swapped: S.swapped, over: S.over, picked: S.picked, subs: S.subs,
              ptr: S.ptr, black: S.black
            }));
          },
          setDecks: doDecks, start: doStart, submit: doSubmit, pick: doPick, swap: doSwap, next: doNext
        }
      };
    }
  });

  if (typeof module !== 'undefined' && module.exports) module.exports = { BLACK: BLACK, WHITE: WHITE, DECKS: DECKS, BD: BD, WD: WD };
})();
