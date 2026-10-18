/* Cards Against Us - 2 player (+ the House) party card game plugin for Duo Games */
(function () {
  'use strict';

  var WIN_SCORE = 7, MAX_ROUNDS = 14, HAND = 7, COUNTDOWN = 4;

  /* ---------- cards (original wording) ---------- */
  var DECKS = {
    dark: {
      name: 'Dark Humor',
      black: [
        "My will clearly states that my ashes must be scattered over ___.",
        "The eulogy took a dark turn when my brother brought up ___.",
        "The coroner listed the cause of death as ___.",
        "At my funeral, instead of flowers, please send ___.",
        "The last thing I want to see before I die is ___.",
        "My therapist quit after I told her about ___.",
        "The ghost haunting our attic is really upset about ___.",
        "After the apocalypse, all we had left in the bunker was ___.",
        "The hospital gift shop now sells ___.",
        "Grandma's dying wish was ___.",
        "The waiting room in Hell plays nothing but ___ on loop.",
        "The Grim Reaper showed up early because of ___.",
        "My obituary will politely leave out ___.",
        "What finally broke me? ___.",
        "Rock bottom has a basement, and it's full of ___.",
        "The life insurance company refused to pay out because of ___.",
        "My tombstone will simply read: 'Killed by ___.'",
        "The final item on my bucket list: ___.",
        "The doctor sat me down and said, 'I'm afraid it's ___.'",
        "The seance went wrong when we accidentally summoned ___.",
        "My inner demons are mostly just ___.",
        "The apocalypse officially began with ___.",
        "The fifth horseman of the apocalypse rides in on ___.",
        "My coping mechanism is ___ and a bottle of wine.",
        "In my will, my worst enemy gets ___.",
        "The funeral director upsold us on ___.",
        "My latest existential crisis was triggered by ___.",
        "The cemetery's newest attraction: ___.",
        "What's really in the urn? Honestly, probably ___.",
        "The haunted doll in my closet whispers about ___ every night.",
        "The zombies wouldn't touch my brain because of ___.",
        "Nothing says 'I've given up' quite like ___.",
        "My eternal punishment in the afterlife: ___.",
        "My last words were supposed to be profound, but I just said ___.",
        "The medium says Grandpa is trying to warn us about ___.",
        "Hospital food has hit a new low: ___.",
        "The mortician's secret hobby: ___.",
        "The last survivor on Earth spends his days with ___.",
        "My descent into nihilism started with ___.",
        "My plan for the end of the world: stockpile ___.",
        "The vulture circling above me is clearly interested in ___.",
        "What will archaeologists find in my grave? ___.",
        "My emotional baggage is mostly ___.",
        "My villain origin story begins with ___.",
        "What I'm leaving to science: ___.",
        "Death comes for us all, but first it stops for ___.",
        "I sold my soul for ___. Totally worth it.",
        "The devil offered me ___ in exchange for my soul.",
        "The poltergeist keeps rearranging the furniture to spell out ___.",
        "The sad clown at my funeral performed ___.",
        "Midlife crisis, day 400: ___.",
        "Every family has a dark secret. Ours is ___.",
        "My therapist's notes on me just say ___.",
        "My retirement plan is ___ and an early death.",
        "This is fine. Everything is fine. Except ___.",
        "The worst thing to find in your coffin: ___.",
        "Detectives were baffled to find my body next to ___.",
        "Grief counseling took a strange turn with ___.",
        "I'm not afraid of death. I'm afraid of ___.",
        "The asteroid hits tomorrow, so tonight I'm finally trying ___.",
        "The doomsday cult promised salvation through ___.",
        "My guardian angel quit after ___.",
        "Seven years of bad luck began with ___.",
        "The ghost in the guest room only appears for ___.",
        "A lifetime of bad decisions has led me to ___.",
        "Mom's last words: 'Don't forget about ___.'",
        "My cremation will be livestreamed alongside ___.",
        "The family crypt just got an upgrade: ___.",
        "During my near-death experience, I saw ___.",
        "The last thing on the shelf at the end of the world: ___.",
        "Reincarnation is real, and I came back as ___.",
        "Nobody cried at the funeral until they brought out ___.",
        "The universe will end not with a bang, but with ___.",
        "The reading of the will got awkward when the lawyer revealed ___.",
        "Even the undertaker was disturbed by ___.",
        "The exorcist charged extra because of ___.",
        "My personal hell is an eternity of ___.",
        "The only thing keeping me alive at this point is ___.",
        "The Ouija board spelled out a warning about ___.",
        "The survivors of the zombie outbreak elected ___ as their leader.",
        "What finally killed the vampire? ___.",
        "Satan's suggestion box is full of complaints about ___.",
        "My will leaves ___ to my children and ___ to the cat.",
        "The apocalypse survival kit: ___ and ___.",
        "At the funeral, ___ got into a fistfight with ___.",
        "I spent my final hours on ___ and ___.",
        "Heaven turned me away for ___. Hell turned me away for ___.",
        "Cause of death: ___, complicated by ___.",
        "My ghost will haunt you with ___ and ___.",
        "Life lesson: never mix ___ with ___.",
        "Tonight's seance: we contact ___ to ask about ___.",
        "The end of the world was caused by ___ and made worse by ___.",
        "Instead of a funeral, I want ___ and a lot of ___.",
        "My therapist diagnosed me with ___ caused by ___.",
        "The bunker is stocked with ___, ___, and crippling regret.",
        "My coffin will be lined with ___ and filled with ___.",
        "Rest in peace: beloved for ___, feared for ___.",
        "The zombie horde was finally stopped by ___ armed with ___.",
        "First comes ___, then comes ___, then comes death.",
        "My last will and testament: burn ___ and bury ___.",
        "The haunted house tour ended with ___ chasing ___.",
        "Dear diary, today I accepted ___. Tomorrow I'll accept ___."
      ],
      white: [
        "a coffin with cupholders",
        "my ex's ghost",
        "a will written in crayon",
        "the heat death of the universe",
        "a haunted Furby",
        "a mild case of mortality",
        "an open casket with a wink",
        "a suspiciously cheerful hearse",
        "unpaid funeral flowers",
        "a ghost with unfinished paperwork",
        "the last bottle of wine in the bunker",
        "existential dread with sprinkles",
        "a cursed life insurance policy",
        "drinking alone at a wake",
        "the inevitable collapse of everything",
        "thoughts and prayers in bulk",
        "a skeleton in the closet, literally",
        "a tombstone with a typo",
        "a midlife crisis with a shovel",
        "a reanimated houseplant",
        "the quiet hum of despair",
        "getting ghosted by an actual ghost",
        "an urn used as a cookie jar",
        "a stale funeral sandwich",
        "a stranger's mushroom guide",
        "a plague doctor at brunch",
        "a very comfortable casket",
        "the soft sound of the void",
        "an optimistic gravedigger",
        "a wake that turned into a rave",
        "a meteor with my name on it",
        "a mortgage that outlives me",
        "a crow that knows my name",
        "therapy that's mostly screaming",
        "an expired parachute",
        "a bucket list of terrible ideas",
        "my inheritance in Beanie Babies",
        "a clearance sale at the cemetery",
        "a motivational poster in a morgue",
        "a fortune teller who just says 'no'",
        "an apocalypse bunker with bad Wi-Fi",
        "a vulture with a reservation",
        "Grandpa's ashes in the spice rack",
        "a Ouija board with a potty mouth",
        "a demon who just wants to talk",
        "a suspiciously cheap funeral package",
        "a lifetime of Sunday scaries",
        "my personal brand of nihilism",
        "an ambulance chaser in a hearse",
        "the screaming void",
        "my body donated to a community college",
        "a cursed family heirloom",
        "an emotional support tombstone",
        "a coffin-shaped hot tub",
        "a death metal lullaby",
        "a mime's last words",
        "the ghost of Christmas leftovers",
        "a sinking feeling that never leaves",
        "a candlelight vigil for my career",
        "a suspicious mole and a WebMD tab",
        "a black cat with a grudge",
        "seven broken mirrors",
        "a surprise autopsy",
        "a zombie with table manners",
        "an apocalyptic amount of glitter",
        "the Four Horsemen's group chat",
        "a vampire with a blood sugar problem",
        "an unpaid exorcist",
        "a pet cemetery with a gift shop",
        "my last remaining brain cell",
        "a will that just says 'good luck'",
        "the slow, sweet embrace of the void",
        "a nursing home rave",
        "a chalk outline shaped like a starfish",
        "a hearse with flame decals",
        "a tragically short bucket list",
        "a doomsday prepper's spreadsheet",
        "a lifetime supply of canned beans",
        "the last working toilet on Earth",
        "a radioactive cockroach named Steve",
        "a haunted baby monitor",
        "a cursed VHS tape",
        "a grief counselor who cries more than I do",
        "an eternity of elevator music",
        "a demon possessing my Roomba",
        "a skeleton in a sun hat",
        "a casket with a snooze button",
        "my third midlife crisis",
        "the unbearable weight of existence",
        "a graveyard of single socks",
        "the gravediggers' union",
        "my therapist's therapist",
        "a funeral open bar",
        "an inheritance of crippling debt",
        "a mausoleum with a hot tub",
        "the smell of a hospital waiting room",
        "lukewarm hospital pudding",
        "an IV drip of pure espresso",
        "a doctor who googles everything",
        "a surgeon with the hiccups",
        "a bedpan full of regrets",
        "a body bag with a broken zipper",
        "a guardian angel on a smoke break",
        "Satan's customer service line",
        "a lukewarm afterlife",
        "a ghost who won't stop texting",
        "a possessed garden gnome",
        "bad decisions made at 3 a.m.",
        "one more shot of tequila",
        "a tattoo of my ex's name",
        "my life savings on a horse named Destiny",
        "a lifetime ban from the casino",
        "a timeshare in purgatory",
        "the slow death of my metabolism",
        "an existential crisis in the cereal aisle",
        "a nihilist's birthday party",
        "a sad clown with a shovel",
        "a suspiciously deep hole in the backyard",
        "a shallow grave and a deep regret",
        "a cursed amulet from eBay",
        "a demon with terrible handwriting",
        "a widow's very short mourning period",
        "an undertaker's dad jokes",
        "embalming fluid cocktails",
        "a hearse doing donuts",
        "Grandma's haunted rocking chair",
        "a ghost who hogs the bathroom",
        "the world's saddest pinata",
        "an eternity next to my in-laws",
        "a pyramid of unpaid medical bills",
        "a nuclear winter wonderland",
        "a mushroom cloud of regret",
        "a fallout shelter full of board games",
        "mutant raccoons with crossbows",
        "the last Twinkie on Earth",
        "a cannibal with a gluten intolerance",
        "a deeply disappointed Grim Reaper",
        "the Grim Reaper's day off",
        "a scythe with an extended warranty",
        "a skull used as a candy dish",
        "a funeral selfie",
        "an uncomfortably long moment of silence",
        "a eulogy written by a chatbot",
        "a dead goldfish flushed with full honors",
        "a burial at sea in a kiddie pool",
        "a coffin on clearance",
        "my organ donor card, fully redeemed",
        "a slow decline into madness",
        "a chain letter that actually worked",
        "a curse I picked up on vacation",
        "a cold, unfeeling universe",
        "the sun exploding mid-picnic",
        "an asteroid named Gerald",
        "the void staring back",
        "a seance with bad cell reception",
        "a necromancer at a pet store",
        "my dead plants' revenge",
        "a black hole in my bank account",
        "a deathbed confession about the lasagna",
        "the family's least favorite child",
        "an inheritance dispute over a toaster",
        "a lawyer reading the will in a clown voice",
        "a fight over Grandma's dentures",
        "a casserole for the grieving",
        "a sympathy card with a coupon",
        "a widow speed-dating at the wake",
        "a funeral procession through a drive-thru",
        "a hearse with a 'Just Married' sign",
        "a tragic misunderstanding with a bear",
        "a bear with a taste for hikers",
        "a shark with a vendetta",
        "an angry swan, nature's true apex predator",
        "a quicksand pit in the backyard",
        "the Bermuda Triangle of the laundry room",
        "my last cigarette, for the fourth time",
        "a liver held together by hope",
        "a slowly melting brain",
        "an ambulance stuck behind a parade",
        "my fifth near-death experience",
        "a tunnel of light that turns out to be a train",
        "the Pearly Gates with a bouncer",
        "Saint Peter checking my browser history",
        "a cloud with bad Wi-Fi",
        "harp lessons for all eternity",
        "the devil's group fitness class",
        "a lake of fire with a lifeguard",
        "a demon intern",
        "a haunted self-driving car",
        "a robot uprising led by my smart fridge",
        "the singularity, but stupid",
        "a plague of frogs in the kitchen",
        "a biblical flood in the basement",
        "locusts at the picnic",
        "a dark cloud that follows me personally",
        "the one friend who will identify my body",
        "a dramatic exit through the morgue window",
        "a coroner who loves his job too much",
        "a toe tag with my nickname",
        "an autopsy with a laugh track",
        "a body farm open house",
        "the worms' all-you-can-eat buffet",
        "a rotting jack-o'-lantern, just like me",
        "the circle of life, mostly the end bit",
        "a psych ward cafeteria",
        "a straitjacket in my size",
        "my therapist's fourth cancellation fee",
        "antidepressants and a dream",
        "a support group for haunted houses",
        "a bad omen shaped like a pigeon",
        "a fortune cookie that just says 'soon'",
        "a palm reader who gasps",
        "my horoscope's final warning",
        "a voodoo doll of my boss",
        "a cursed sweater from Aunt Linda",
        "my estranged twin's estranged twin",
        "a family tree with suspiciously few branches",
        "a ghost tour led by the ghost",
        "an exorcism priced by the hour",
        "holy water from a gas station",
        "the crucifix I keep for emergencies",
        "a demon allergic to garlic bread",
        "the Antichrist's retirement party",
        "an evil laugh I've been practicing",
        "a deal with the devil signed in glitter pen",
        "my soul, slightly used",
        "a soul with water damage",
        "a pentagram drawn in ketchup",
        "a sacrificial goat named Kevin",
        "a cult with a great dental plan",
        "a doomsday cult's group discount",
        "the ritual sacrifice of my weekends",
        "the funeral of my last brain cell",
        "drinking alone on a Tuesday",
        "a grave robber with a metal detector",
        "a skeleton that won't stop rattling",
        "a mummy with abandonment issues",
        "a ghost with commitment issues",
        "the afterlife's DMV",
        "a cardboard coffin",
        "Grandpa's prosthetic leg",
        "a funeral home loyalty card",
        "an eternity of reply-all emails"
      ]
    },
    dirty: {
      name: 'Dirty Stuff',
      black: [
        "My safe word is ___.",
        "Tonight in the bedroom, I'm finally trying ___.",
        "I woke up next to ___ and immediately regretted everything.",
        "The thing I'd never admit during pillow talk: ___.",
        "The walk of shame was made worse by ___.",
        "The worst thing to bring up during foreplay: ___.",
        "The neighbors complained about ___ through the wall.",
        "My secret kink is ___.",
        "Is that ___ in your pocket, or are you just happy to see me?",
        "The honeymoon suite came fully stocked with ___.",
        "What's in my nightstand drawer? ___.",
        "Netflix and ___.",
        "On the third date, I finally revealed ___.",
        "My idea of foreplay is ___.",
        "Candlelight, soft music, and ___.",
        "The best part of makeup sex is ___.",
        "What gets me in the mood? ___.",
        "I swiped right purely because of ___.",
        "My ex left behind ___, and I'm keeping it.",
        "My dating profile says I'm into long walks and ___.",
        "Sexting tip: always attach a photo of ___.",
        "The hotel maid found ___ under the bed and quit on the spot.",
        "The real reason the bed broke: ___.",
        "The adult store clerk winked and recommended ___.",
        "I faked it because of ___.",
        "Tonight's role-play scenario: ___.",
        "The hookup ended abruptly because of ___.",
        "My partner's moan sounds exactly like ___.",
        "The morning after, all I could remember was ___.",
        "Nobody warns you about ___ in the bedroom.",
        "First rule of the swingers' party: no ___.",
        "The strip club's new VIP special: ___.",
        "Wedding night surprise: ___.",
        "The bachelorette party got out of hand thanks to ___.",
        "The new vibrator setting is called ___.",
        "My dirty talk mostly consists of ___.",
        "The lost chapter of the Kama Sutra is all about ___.",
        "Wanna come upstairs for ___?",
        "The threesome was going great until ___ showed up.",
        "Spice up your marriage with ___!",
        "The real reason we got kicked out of the hot tub: ___.",
        "I knew the date was going well when she mentioned ___.",
        "What did I accidentally text my boss instead of my lover? ___.",
        "Nothing kills the mood like ___.",
        "Today's sex shop deal: buy one, get ___ free.",
        "My spicy subscription channel features exclusively ___.",
        "The romance novel's climax involved ___.",
        "She said, 'I like it rough,' so I brought ___.",
        "It's not a fetish, it's ___.",
        "The best lube substitute in an emergency: ___.",
        "The cheap motel had a vibrating bed and ___.",
        "Dating bio: six feet tall, loves ___.",
        "What happens in the bedroom stays in the bedroom, except ___.",
        "The booty call was cancelled because of ___.",
        "My partner's biggest turn-on: ___.",
        "My biggest turn-off: ___.",
        "My partner wants to try ___, and honestly, I'm curious.",
        "The couples' massage got awkward when ___ came up.",
        "The sex dungeon in my basement is mostly ___.",
        "Last night's dream was eight straight hours of ___.",
        "The safe-search filter blocked ___.",
        "I joined the mile-high club thanks to ___.",
        "The love hotel rents out ___ by the hour.",
        "My partner's pet name for me is ___.",
        "Every guy's secret fantasy involves ___.",
        "Our anniversary gift to each other: ___.",
        "The sex toy party went off the rails because of ___.",
        "The doctor said to avoid ___ for two weeks.",
        "The photo I most regret sending: ___.",
        "What really happened in the hot tub? ___.",
        "The cure for a long dry spell: ___.",
        "The worst thing to find in your partner's search history: ___.",
        "The thing that finally made my partner blush: ___.",
        "Tonight I'm wearing nothing but ___.",
        "What's under that trench coat? ___.",
        "Let's go somewhere private and discuss ___.",
        "My sex life is basically ___.",
        "The wildest part of the orgy: ___.",
        "That's what she said about ___.",
        "The sexiest thing a stranger has ever whispered to me: ___.",
        "Our first time together was ruined by ___.",
        "The kinky neighbors lent us ___.",
        "I like my partner like I like my coffee: ___ and ___.",
        "Tonight's playlist: slow jams, ___, and ___.",
        "Things I can't explain to my mother: ___ and ___.",
        "Hot bedroom tip: pair ___ with ___.",
        "Last night I learned that ___ goes surprisingly well with ___.",
        "The neighbors heard ___, then ___.",
        "My perfect date: ___ followed by ___.",
        "My toy box contains ___ and, inexplicably, ___.",
        "Dear advice column: my partner wants ___, but I only want ___.",
        "Tonight's role-play: ___ seduces ___.",
        "Our safe words are ___ for slow and ___ for stop.",
        "The sexting went wrong when I confused ___ with ___.",
        "First date: ___. Second date: ___.",
        "The hookup app matched me with ___ who's really into ___.",
        "What happened at the bachelor party: ___, ___, and a lot of regret.",
        "My sexual awakening came from ___ and ___.",
        "The honeymoon was ruined by ___ and ___.",
        "Top two items on my sex bucket list: ___ and ___.",
        "He brought ___ to bed, so I brought ___.",
        "The swingers' party had ___ in one room and ___ in the other."
      ],
      white: [
        "a velvet blindfold",
        "a surprise hand on my thigh",
        "the world's most awkward moan",
        "a bottle of questionable massage oil",
        "a leather-clad accountant",
        "flavored body paint",
        "a nurse costume two sizes too small",
        "a feather duster used creatively",
        "a spanking paddle named Gerald",
        "a tantric session gone wrong",
        "premature celebration",
        "an enthusiastic butt slap",
        "a hickey on my kneecap",
        "dirty talk in a fake French accent",
        "a lube dispenser shaped like a swan",
        "role-play as strangers in the cereal aisle",
        "a sexy costume I got stuck in",
        "a whip made of licorice",
        "a stripper pole in the living room",
        "a nude accidentally sent to the family group chat",
        "a dramatic orgasm face",
        "a squeaky bed in a thin-walled apartment",
        "a clearance-rack thong",
        "edible underwear past its expiry date",
        "a naked game of Twister",
        "a tickle fight that escalated",
        "chest hair like a shag carpet",
        "a sexy voicemail to the wrong number",
        "champagne in the bathtub",
        "bunny ears and nothing else",
        "a cowboy hat and a lot of confidence",
        "a mid-coital sneeze",
        "moaning the wrong name",
        "a sultry pirate impression",
        "a butt plug used as a paperweight",
        "a sex swing in the garage",
        "a vibrator going off at airport security",
        "dirty talk about spreadsheets",
        "a headboard knocking out Morse code",
        "an overenthusiastic lap dance",
        "shaved legs and bad intentions",
        "a hot-wax accident",
        "skinny dipping at the family reunion",
        "a leg cramp at the big moment",
        "a lingerie fashion show for one",
        "a very friendly masseuse",
        "a love bite shaped like Florida",
        "an exhibitionist squirrel",
        "boudoir photos with my cat watching",
        "a sultry saxophone solo",
        "a hotel room rented by the hour",
        "a very flexible yoga instructor",
        "fuzzy handcuffs and a lost key",
        "a waterbed with a slow leak",
        "a dungeon with mood lighting",
        "a gimp suit with a stuck zipper",
        "nipple clamps from the office supply closet",
        "a strap-on named Bruce",
        "a Bluetooth sex toy with anxiety",
        "a vibrator with a dying battery",
        "a dildo shaped like a national monument",
        "a ball gag that plays music",
        "a safe word nobody can pronounce",
        "an awkward morning-after breakfast",
        "a hangover and a mystery hickey",
        "someone else's underwear in my pocket",
        "a walk of shame in a ball gown",
        "a 3 a.m. booty call",
        "a 'u up?' text",
        "an unsolicited eggplant emoji",
        "a peach emoji and high hopes",
        "a dick pic with terrible lighting",
        "a nude selfie with Grandma's portrait in frame",
        "a sext autocorrected into a crime",
        "a lacy number from the back of the closet",
        "a body pillow with a face",
        "a blow-up doll with commitment issues",
        "a mustache ride",
        "a happy ending at the massage parlor",
        "handcuffs from the hardware store",
        "a 69 gone geometrically wrong",
        "doggy style with the actual dog watching",
        "missionary position and a sense of duty",
        "a reverse cowgirl in a rodeo hat",
        "a quickie in the supply closet",
        "a mile-high bathroom stall",
        "a backseat with fogged-up windows",
        "a sex tape filmed vertically",
        "a webcam left on by accident",
        "a sex dream about my dentist",
        "a crush on a cartoon fox",
        "a foot fetish and a pedicure budget",
        "a lingering smell of coconut lube",
        "terrible bedroom eyes",
        "a sensual cheese platter",
        "whipped cream in unexpected places",
        "chocolate syrup on the good sheets",
        "a strawberry in a very strange place",
        "a banana as a visual aid",
        "a cucumber with a backstory",
        "a hot tub with suspicious bubbles",
        "a jacuzzi of shame",
        "a hot tub full of strangers",
        "a sauna with no rules",
        "a nudist beach volleyball game",
        "tan lines in strange places",
        "a Brazilian wax gone wrong",
        "manscaping with a weed whacker",
        "a neatly trimmed landing strip",
        "carpet that matches the drapes",
        "a surprising amount of back hair",
        "a man-bun and a man-thong",
        "a bulge in skinny jeans",
        "a sock stuffed in a Speedo",
        "a firefighter calendar",
        "a pizza delivery guy with a plot",
        "a plumber who brought his own pipe",
        "a sexy librarian with overdue fees",
        "a cop costume with real handcuffs",
        "a French maid outfit and a dust allergy",
        "a seductive accountant doing my taxes",
        "a sexy Santa with a naughty list",
        "a lumberjack with very big wood",
        "protein-shake breath",
        "a yoga pants situation",
        "a sports bra and nothing else",
        "granny panties of shame",
        "a push-up bra with ambition",
        "boobs that are mostly padding",
        "a booty that won't quit",
        "a wardrobe malfunction",
        "a nip slip on live TV",
        "a sex position named after a pretzel",
        "a pulled hamstring mid-thrust",
        "rug burn in a weird place",
        "a charley horse during a quickie",
        "two minutes of glory",
        "an hour of foreplay and thirty seconds of everything else",
        "a finish line nobody crossed",
        "a performance review in bed",
        "a slow clap after sex",
        "a five-star review from my partner",
        "an awkward post-climax high five",
        "a post-coital cigarette and a pizza",
        "pillow talk about taxes",
        "spooning that turned into forking",
        "a cuddle with a hidden agenda",
        "morning breath and morning wood",
        "a tent in the sheets",
        "a very proud morning salute",
        "a raging case of blue balls",
        "a lonely Friday night with lotion",
        "a sock that can stand on its own",
        "a box of tissues by the computer",
        "private browsing mode",
        "a taped-over webcam",
        "a premium subscription to something embarrassing",
        "a sexting thread with a typo in every line",
        "a phone sex operator with a head cold",
        "a long-distance relationship and a webcam",
        "a sex robot with a mind of its own",
        "a dating app algorithm that hates me",
        "a first date who brought their mother",
        "a hookup with my ex's cousin",
        "a one-night stand who moved in",
        "a friend with benefits and a dental plan",
        "a crush on my barista",
        "the hot neighbor who mows shirtless",
        "a pool boy named Raoul",
        "a cougar at the wine bar",
        "a silver fox with a yacht",
        "a sugar daddy with a coupon book",
        "a wealthy widow with a pool",
        "a stripper with a philosophy degree",
        "a dollar bill in a G-string",
        "a lap dance from a mall Santa",
        "a bachelorette party's inflatable friend",
        "penis-shaped pasta",
        "a cake shaped like body parts",
        "a body shot off a stranger",
        "a tequila worm and a bad idea",
        "a strong pair of beer goggles",
        "last-call desperation",
        "a drunken confession of love",
        "a wet T-shirt contest",
        "a mechanical bull with romantic intentions",
        "a threesome that required a spreadsheet",
        "a polyamorous shared calendar",
        "an open relationship and a closed mind",
        "a swingers' bowl of car keys",
        "a sex club with a dress code",
        "a latex catsuit in July",
        "a leather harness under a business suit",
        "a dominatrix with a day job in HR",
        "a submissive named Chad",
        "a collar and leash for date night",
        "a very expensive chastity cage",
        "a sensory deprivation hood",
        "a drizzle of candle wax",
        "an ice cube in the wrong place",
        "a feather and a lot of patience",
        "rope tied with a sailor's knot",
        "being tied up and forgotten during a fire drill",
        "a love swing installed upside down",
        "a sex playlist of nothing but sea shanties",
        "a romance novel with a shirtless Viking",
        "a bodice that refuses to rip",
        "a heaving bosom",
        "a throbbing member of the HOA",
        "a hard bargain",
        "a sloppy kiss with way too much tongue",
        "tongue action like a washing machine",
        "a lip bite that drew blood",
        "a hair pull gone too far",
        "a butt slap that echoed",
        "an ass you could bounce a quarter off",
        "cheeks you could crack walnuts with",
        "a jiggle that registered on the Richter scale",
        "a squeaky sex toy at a quiet dinner party",
        "a vibrator in the dishwasher",
        "a sex toy found by my mother-in-law",
        "Grandma discovering the toy box",
        "a lingerie drawer the dog raided",
        "my roommate's suspicious noises",
        "a thin wall and a loud partner",
        "a moan that set off car alarms",
        "a fake orgasm with an encore",
        "an Oscar-worthy performance in bed",
        "a tragic lack of stamina",
        "a little blue pill",
        "a four-hour situation that needs a doctor",
        "a condom with a hole in it",
        "a glow-in-the-dark condom",
        "a condom past its expiry date",
        "a pack of novelty condoms",
        "a pregnancy scare and a nervous breakdown",
        "a walk-in closet with a walk-in surprise",
        "the hot tub's mysterious film",
        "a very satisfied sigh",
        "a sensual reading of furniture assembly instructions"
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
      if (i < parts.length - 1) {
        var w = String(WHITE[cards[i]]);
        if (/(^|[?.!]\s*)$/.test(parts[i])) w = w.charAt(0).toUpperCase() + w.slice(1);
        out += '<u class="cau-fill">' + esc(w) + '</u>';
      }
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
        /* no auto-advance: both players must press Next round */
        if (true) return;
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
              '<span class="tip">' + (S.ready[me] ? '' : 'waiting for both players to press Next') + '</span></div>';
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
