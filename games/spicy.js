/* Spicy Nights - 2 players, adult couples' dirty-talk party game. Words only, always consensual.
   Styles: Truth, Never Have I Ever, Would You Rather, Hot Take, Guess My Answer, Finish the Sentence,
   This or That, Body Map, Fantasy Builder. Plugin for Duo Games.
   The host is the single authority for the game state; the guest sends requests and renders the
   snapshots it gets back, so the two screens can never diverge. */
(function(){
'use strict';

/* ---------- card bank (generated data) ----------
   {p} = the other player's name (truth), "my partner" (never have I ever), "your partner" elsewhere.
   wyr / tot = 'A|B'; guess = 'Question|o1|o2|o3|o4'; fset/fmood/frole = fantasy reels. */
var BANK={
"truth":{
1:[
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
"What's the most tempting thing about the way {p} smells?",
"What's one word you'd use to describe {p}'s kisses, and why that word?",
"Which of {p}'s laughs is your favourite: the giggle, the snort or the belly laugh?",
"What tiny habit of {p}'s would you miss most if it vanished tomorrow?",
"If you could relive one hug with {p}, which one would it be?",
"What nickname would you give {p} if you had to rename them today?",
"Where in the world would you most like to kiss {p} for the first time all over again?",
"What's something {p} says that always makes you melt a little?",
"Which of {p}'s hands do you prefer holding, left or right, and why?",
"What did you almost say to {p} early on but chickened out of?",
"If {p} were a dessert, which one would they be?",
"What's the sweetest message {p} has ever sent you?",
"Rate {p}'s cuddling skills out of ten and justify the score.",
"What's one thing about {p} that you brag about to yourself?",
"What were you wearing the day you realized {p} was trouble in the best way?",
"Which room in a house do you picture the two of you slow dancing in?",
"What's the most adorable face {p} makes without realizing it?",
"If you could plan a surprise picnic for {p}, what three things are in the basket?",
"What sound in {p}'s voice tells you they're in a playful mood?",
"What's a small promise you'd make to {p} right now?",
"Which film couple reminds you most of you and {p}?",
"What's the first thing you'd do if {p} showed up at your door unannounced?",
"Describe {p} using only three emojis, then explain your choices.",
"What's a memory of {p} that you replay when you need cheering up?",
"What's your favourite time of day to think about {p}?",
"Which compliment from {p} has stuck with you the longest?",
"What would your perfect rainy afternoon with {p} include?",
"What's the most charming mistake {p} has ever made in front of you?",
"Forehead kiss, cheek kiss or nose kiss from {p}: which wins?",
"What's one thing you find irresistibly cute when {p} is sleepy?",
"If you wrote {p} a love song, what would the title be?",
"What part of saying goodnight to {p} do you wish lasted longer?",
"What's a simple gesture from {p} that makes you feel completely safe?",
"If you could freeze one second of your time with {p}, which second would it be?",
"What's the flirtiest thing you've ever done to get {p}'s attention?",
"Which of {p}'s quirks did you fall for before you even knew it?",
"What would you write on a sticky note to leave on {p}'s pillow?"
],
2:[
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
"What would you like {p} to tease you about tonight?",
"What's the most tempting thing {p} could text you right now?",
"Which piece of {p}'s clothing do you most enjoy taking off them?",
"Describe the kiss that would instantly convince you to skip dinner.",
"Where would you leave a trail of kisses on {p}, starting from the top?",
"What's a turn-on of yours that surprised even you?",
"Which time of day do you find {p} most irresistible, and why?",
"What's the boldest thing you've ever wanted to say to {p} in public?",
"What would you love {p} to whisper while their lips brush your ear?",
"How do you know when {p} wants you, before they say a word?",
"What's your favourite thing to wear to bed when you want {p}'s attention?",
"Fast and urgent or slow and lingering: which do you crave from {p} tonight?",
"What's the most distracting thing {p} has ever done while you were trying to focus?",
"Which of your senses does {p} drive the wildest: touch, taste, smell or sound?",
"Describe the perfect make-out session with {p} on a sofa.",
"What line could {p} say that would have you blushing and grinning at once?",
"If {p} gave you a massage, where would you want their hands to wander?",
"What's a bedroom habit of {p}'s that you secretly adore?",
"What would you want {p} to find waiting for them in the bedroom?",
"Which of {p}'s expressions tells you they're about to be very naughty?",
"What's a fantasy location you'd love to share with {p} for a weekend?",
"What's the longest you've ever gone thinking about {p} without being able to stop?",
"How would you seduce {p} using only words, if you had one minute?",
"What's the most tempting way {p} could greet you after a long day?",
"Which sound do you make that you hope drives {p} a little crazy?",
"What's the hottest compliment {p} has ever given your body?",
"If you could set the mood for {p} tonight, what music would be playing?",
"What do you find sexiest about {p} when they're confident?",
"Describe the moment in a kiss with {p} when you stop thinking clearly.",
"What would you whisper to {p} to make them abandon whatever they were doing?",
"What's one thing you'd like to try that would make {p} blush?",
"Where's the most unexpected place {p}'s touch has ever given you goosebumps?",
"What's a slow, teasing thing you'd love {p} to do to you before bed?",
"Which of {p}'s features would you most like to kiss for a full minute?",
"What's something you love about the way {p} looks at you when you undress?",
"If tonight had a dress code chosen by you, what would {p} be wearing?",
"What's the sauciest thing you've ever imagined doing with {p} in a kitchen?"
],
3:[
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
"What's the one thing you'd love {p} to say to you tonight, word for word?",
"Describe, step by step, how you'd undress {p} if you had all the time in the world.",
"What's the most explicit thing you've ever wanted to type to {p} but held back?",
"Where exactly would you want {p}'s mouth first, and what would you want them to do?",
"What's a kink of yours that you'd love {p} to say yes to, and how would it start?",
"Describe the noises you'd want to pull out of {p} tonight.",
"What would you want {p} to call you when things get really heated?",
"If you could write the script for {p}'s dirty talk, what's the first line?",
"What's the most intense way {p} could tease you until you beg?",
"Describe the filthiest scenario you'd want to act out with {p}, with a safe word ready.",
"Which body part of {p}'s would you worship first, and how?",
"What's your favourite thing to hear {p} moan, word for word?",
"How rough or gentle do you want {p} to be with you tonight, honestly?",
"What would you do with {p}'s wrists if they asked you to take charge?",
"What's the naughtiest thing you'd want {p} to do with ice?",
"Describe how you'd want {p} to wake you up if they had permission to be very bad.",
"What's a forbidden-feeling fantasy you'd only ever share with {p}?",
"Tell {p} the exact pace you want them to set, from start to finish.",
"What's the most explicit memory of {p} that still makes you breathless?",
"If {p} pinned you against a wall, what would you want to happen next?",
"What would you want {p} to make you promise before they let you finish?",
"Which naughty toy would you most like to try with {p}, and how?",
"Describe a tease-and-deny game you'd love to play with {p}.",
"What's the filthiest thing you'd want to whisper while {p} is on top of you?",
"What's the one move that would make you completely lose control with {p}?",
"If you were giving {p} orders in bed, what would your first three be?",
"What part of your body is begging for {p}'s attention right now?",
"Describe how you'd want {p} to tie you up, knot by knot.",
"What would you want to hear {p} confess they want to do to you?",
"How would you make {p} wait, and what would they have to say to earn it?",
"What's the dirtiest place on your body you want {p} to kiss?",
"Describe a fantasy where you and {p} take turns being in charge.",
"What's the most explicit text you'd send {p} if you knew they were alone right now?",
"Describe the perfect finale to a night of {p} teasing you for hours.",
"What dirty phrase from {p} would get you there faster than anything else?",
"What's a position you're dying to try with {p}, and what makes it so hot to you?",
"What's the wickedest thing you'd do to {p} with a silk scarf and an hour to spare?"
]
},
"nhie":{
1:[
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
"read a flirty message twenty times.",
"kept a sweet message from my partner just to reread it on bad days.",
"smiled at my phone so much that someone asked who I was texting.",
"saved my partner's voice note to listen to before bed.",
"practised saying I love you before saying it for real.",
"written my partner's name in the margins of a notebook.",
"picked a song just because it reminded me of my partner.",
"rehearsed a whole conversation before calling my partner.",
"blown a kiss through the screen at the end of a call.",
"fallen for someone's handwriting.",
"counted down the hours until I could see my partner again.",
"stayed up way too late just to keep talking to my partner.",
"felt butterflies from a single heart emoji.",
"worn my partner's scent on purpose.",
"cooked something special just to impress my partner.",
"forgotten what I was saying because my partner smiled at me.",
"planned a surprise for my partner and nearly spoiled it.",
"replayed a first kiss in my head for days.",
"named a playlist after my partner.",
"stolen the last bite of something just to get a reaction from my partner.",
"held a hug longer than I meant to.",
"said goodnight three times before actually hanging up.",
"gotten jealous of a pillow my partner was cuddling.",
"pretended to be cold just to get a cuddle.",
"sent a good morning text before even getting out of bed.",
"laughed so hard on a date that I snorted.",
"been so nervous before a date that I changed outfits five times.",
"tripped over my words while trying to flirt.",
"kept a little souvenir from a special date.",
"asked for a kiss with just a look.",
"fallen asleep holding hands.",
"imagined what my partner was doing while we were apart.",
"typed a flirty message and deleted it before sending.",
"wanted a slow dance in the middle of the supermarket.",
"written a cheesy poem about my partner.",
"reread our first messages just to feel those first-date nerves again.",
"stared at my partner's lips in the middle of a conversation."
],
2:[
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
"forgotten where I was because of a kiss.",
"worn nothing but my partner's shirt around the house.",
"counted the minutes until I could get my partner alone.",
"made the bedroom extra cosy hoping it would lead somewhere.",
"let a kiss goodbye turn into being very late.",
"sent a message so suggestive I had to put my phone face down.",
"wanted to pull my partner into a quiet corner at a party.",
"bitten my lip on purpose to tempt someone.",
"been distracted by the thought of my partner's hands.",
"played footsie under a dinner table.",
"gotten flustered by a single raised eyebrow.",
"deliberately brushed against my partner to get a reaction.",
"started a pillow fight that ended very differently.",
"fantasised about my partner in the shower.",
"chosen underwear with someone specific in mind.",
"felt my heart race from a whisper in my ear.",
"turned a back rub into something far more interesting.",
"replayed a steamy moment in my head while trying to work.",
"described my perfect night out loud to tempt someone.",
"been kissed so well my knees went weak.",
"dropped a hint so obvious it was basically a request.",
"turned up the heat with a text in the middle of the day.",
"let a cuddle on the sofa turn into a make-out session.",
"been told I look good and decided to prove it.",
"had a steamy daydream on public transport.",
"put on a song specifically to set the mood.",
"wished a movie would end early so we could get to the bedroom.",
"hidden a grin because I was thinking something naughty.",
"kissed my partner's neck just to watch them squirm.",
"blushed reading something my partner wrote to me.",
"wanted to be pinned down during a play fight.",
"invented a reason to go to bed early.",
"fallen asleep thinking about what I'd do to my partner the next day.",
"rated my partner's kisses in my head.",
"teased my partner until they gave in first.",
"pretended not to be in the mood just to make it more fun.",
"felt a jolt of heat from my partner saying my name a certain way."
],
3:[
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
"thought about my partner in a way that would make my grandmother faint.",
"begged my partner not to stop.",
"described exactly what I wanted my partner to do to me, in detail.",
"been the one giving orders and loved every second.",
"been the one following orders and loved it even more.",
"used a safe word.",
"lost track of how many times in one night.",
"had my partner tease me until I was shaking.",
"been loud enough to worry about the neighbours.",
"thought about my partner's mouth and had to stop what I was doing.",
"made a list of things I want to try in bed.",
"woken my partner up because I couldn't wait until morning.",
"sent a message so explicit I double-checked who it was going to.",
"fantasised about being tied up.",
"fantasised about tying my partner up.",
"whispered something so dirty I shocked myself.",
"been edged until I could barely think.",
"gotten turned on just from hearing my partner describe a fantasy.",
"tried a new position and immediately wanted to try it again.",
"played a game where losing meant doing whatever my partner said.",
"asked for it harder.",
"asked for it slower, just to make it last.",
"been kissed somewhere that made me forget my own name.",
"role-played as strangers meeting for the first time.",
"taken things to the bedroom in the middle of an argument about nothing.",
"had a fantasy about getting caught without actually getting caught.",
"spent a whole call describing what I'd do to my partner.",
"used ice to make someone gasp.",
"pulled someone's hair because they asked me to.",
"been so desperate I couldn't finish my sentence.",
"left marks I was secretly proud of.",
"had my partner describe what they'd do to me until I couldn't take it.",
"read an erotic story out loud.",
"tried a toy for the first time and wondered why I waited.",
"made my partner say please before giving them what they wanted.",
"been completely blindfolded and loved not knowing what was next.",
"gone for round two before catching my breath."
]
},
"wyr":{
1:[
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
"A kiss on the neck|A kiss on the hand",
"Get a good morning text every day|Get a goodnight call every single night",
"Have a secret nickname only you two know|Have a song that is officially yours",
"Go on a picnic at sunset|Go on a midnight drive with the windows down",
"Be complimented on your smile|Be complimented on your laugh",
"Get a playlist made just for you|Get a scrapbook of your memories together",
"Have your partner remember every tiny detail you say|Have your partner plan every surprise perfectly",
"Steal a kiss in a crowded room|Steal a kiss in an empty elevator",
"Kiss at the top of a Ferris wheel|Kiss on a little boat at dusk",
"Spend a rainy day building a blanket fort|Spend a sunny day in a hammock built for two",
"Be flirted with in a new language|Be flirted with using the cheesiest pickup lines",
"Get a long hug from behind|Get a sweet kiss on the cheek out of nowhere",
"Write your partner a love song|Have your partner write a love song about you",
"Have matching pajamas|Have matching rings",
"Hear a sweet compliment whispered just for you|Hear your partner brag about you to the world",
"Be the one who blushes|Be the one who makes your partner blush",
"Travel the world together on a tiny budget|Take one dream luxury trip together",
"Have a lazy evening by the fireplace with cocoa|Have a cozy evening on a balcony under the stars",
"Gaze into each other's eyes for five minutes|Hold hands in silence for five minutes",
"Get a playful wink across the room|Get a slow smile across the room",
"Relive the moment you first met|Fast forward to your ten-year anniversary",
"Feed each other dessert|Share one milkshake with two straws",
"Be literally swept off your feet|Be swept off your feet with words",
"Get a surprise flower delivery|Get a surprise visit at your door",
"Fall asleep on a call together|Wake up to a sweet voice note from your partner",
"Have a tickle fight|Have a pillow fight",
"Have a cozy movie marathon|Have a game night where the loser owes kisses",
"Have your first kiss all over again|Have the best kiss of your life tonight",
"Have your partner play with your hair|Play with your partner's hair",
"Dance barefoot on the beach|Dance in socks on a wooden floor",
"Find a love note hidden in your bag|Find a love note written on the bathroom mirror",
"Be your partner's biggest cheerleader|Have your partner be your biggest cheerleader",
"Spend a day with your phones off together|Spend a day texting sweet nothings nonstop",
"Have a cabin weekend in the snow|Have a lazy weekend at a lake house",
"Be kissed on the nose|Be kissed on the eyelids",
"Share a slow dance at a wedding|Share a slow dance on a rooftop at midnight",
"Hear the moment your partner fell for you|Describe the moment you fell for your partner"
],
2:[
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
"Hear “I need you” whispered|Hear “I want you” growled",
"Get a teasing text during a boring meeting|Get a teasing text right before you fall asleep",
"Have your partner whisper a secret turn-on|Have to guess your partner's secret turn-on",
"Be kissed up against a wall|Be kissed while sitting on the kitchen counter",
"Wear nothing but a robe all evening|Wear something lacy under everyday clothes all day",
"Get a slow lap dance|Give a slow lap dance",
"Have your earlobe nibbled|Have your inner thighs kissed",
"Hear your partner describe your body in detail|Describe your partner's body in detail",
"Play strip poker|Play truth or dare in the bedroom",
"Be tied up with a silk scarf|Tie your partner up with a silk scarf",
"Have a steamy make out in a parked car|Have a steamy make out in a hidden corner at a party",
"Have kisses trail down your back|Have kisses trail down your stomach",
"Hear what your partner was thinking during your hottest night|Tell your partner what you were thinking that night",
"Spend a night where only kissing is allowed|Spend a night where only hands are allowed",
"Hear your partner's favourite thing to do to you|Confess your favourite thing your partner does to you",
"Be told you look irresistible in something|Be told you look irresistible in nothing at all",
"Make out on the couch for an hour with no rush|Go straight to the bedroom with no detours",
"Bite your partner's lip|Have your lip bitten",
"Be the loud one|Be the quiet one",
"Get a list of everything your partner wants to do to you|Write a list of everything you want to do to your partner",
"Dress up in a sexy costume|Have your partner dress up in a sexy costume for you",
"Have your hair pulled gently|Have your back scratched slowly",
"Be massaged with warm oil|Be stroked with feather-light fingertips",
"Be seduced with a slow striptease|Be seduced with a single heated look",
"Hear your partner moan your name|Hear your partner ask for more",
"Have a secret code word that means take me home now|Have a secret emoji that means I want you",
"Set a timer for five kiss-only minutes|Set a timer and see who cracks first",
"Be complimented on how you kiss|Be complimented on how you touch",
"Spend the night in a fancy hotel suite|Spend the night in a tent, skin to skin under the stars",
"Hear a sexy bedtime story|Tell a sexy bedtime story",
"Make out in a hot tub|Make out in front of a crackling fireplace",
"Be the one who sets the pace|Let your partner set the pace",
"Recreate your steamiest memory together|Invent a brand new steamy memory together",
"Give a hickey|Get a hickey",
"Flirt shamelessly at a party all night|Sneak away from the party early together",
"Kiss with your eyes closed|Kiss with your eyes wide open",
"Spend a lazy morning tangled up in bed|Spend a late night in bed talking dirty"
],
3:[
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
"A dirty voicemail from your partner every morning|A dirty note in your pocket every morning",
"Be on top all night|Be underneath all night",
"Receive oral for an hour|Give oral for an hour",
"Be playfully spanked|Do the playful spanking",
"Try a new toy together|Try a new position together",
"Be restrained with soft cuffs|Restrain your partner with soft cuffs",
"Hear exactly how turned on you make your partner|Tell your partner exactly how turned on they make you",
"Edge for a whole evening|Climax as many times as possible in one night",
"Be ordered to stay perfectly still|Be ordered not to make a single sound",
"Have sex in every room of the house|Have sex in one room all night long",
"Have a quickie in the laundry room|Take a whole slow night in a luxury suite",
"Be called a dirty pet name|Call your partner a dirty pet name",
"Use a vibrator on your partner|Have your partner use a vibrator on you",
"Be pinned down by the wrists|Be held firmly by the hips",
"Hear your partner describe exactly how they'd take you|Describe exactly how you'd take your partner",
"Write an erotic story starring you both|Read an erotic story aloud to each other",
"Give your partner a slow striptease|Watch your partner give you a slow striptease",
"Role-play a flirty massage that turns explicit|Role-play strangers at a masquerade ball",
"Have it from behind|Have it face to face, eyes locked",
"Be kissed everywhere except where you want it most|Kiss your partner everywhere except where they want it",
"Hear your partner playfully beg|Playfully beg your partner",
"Wear a remote toy at home while your partner holds the remote|Hold the remote while your partner wears the toy",
"Have a lingerie fashion show at home|Have a slow undressing contest",
"Get a slow full-body tongue tour|Give a slow full-body tongue tour",
"Climax together|Take turns climaxing, one after the other",
"Hear filthy words in your ear the whole time|Hear nothing but heavy breathing",
"Use only your mouth for a night|Use only your hands for a night",
"Try a sex swing|Try a bondage tape set",
"Spend a whole weekend naked indoors together|Spend a whole weekend in sexy outfits",
"Count your partner's orgasms out loud|Have your partner count yours",
"Play a dice game that picks positions|Play a card game that picks kinks",
"Start the morning with oral|End the night with oral",
"Describe your dirtiest dream in detail|Act out your partner's dirtiest dream",
"Hear your partner moan into your ear|Feel your partner grip the sheets",
"Have a rough night with a safeword ready|Have a tender, slow, deep night",
"Try sixty-nine|Try a slow, lazy spooning position",
"Pick a new toy to try together|Pick a new kink to talk through together"
]
},
"guess":{
1:[
"What's your ideal first-date activity?|Candlelit dinner|Long walk at night|Arcade and pizza|Cooking together",
"Which compliment makes you blush the most?|You look amazing|You're so funny|You smell incredible|I can't stop thinking about you",
"What's your favorite way to be woken up?|Soft kisses|Breakfast in bed|Gentle cuddles|A sweet good morning text",
"What's your go-to flirting move?|Lingering eye contact|Playful teasing|Sweet compliments|Light touches",
"Which song vibe fits our relationship best?|Slow love ballad|Upbeat pop anthem|Moody R&B|Feel-good indie",
"What's the most romantic time of day for you?|Sunrise|Golden hour|Midnight|Lazy Sunday afternoon",
"How do you prefer to say I miss you?|A long voice note|A cute text|A surprise call|Planning the next visit",
"What's your favorite kind of hug?|Bear hug|Hug from behind|Slow swaying hug|Lifted off the ground",
"Which little gesture melts you the most?|Forehead kisses|Holding hands in public|Being tucked in|A handwritten note",
"What would you choose for a cozy night in?|Movie marathon|Board games|Cooking a fancy meal|Talking for hours",
"Which nickname would you secretly love?|Babe|Gorgeous|Trouble|Sunshine",
"What's your favorite thing to do on a rainy day together?|Cuddle under blankets|Bake something|Watch the rain|Nap together",
"Where would you love a surprise getaway?|Beach bungalow|Mountain cabin|Big city hotel|Countryside cottage",
"What makes you feel most loved?|Words of affirmation|Quality time|Physical touch|Thoughtful gifts",
"What's your favorite way to flirt over text?|Cheeky emojis|Sweet compliments|Inside jokes|Late-night confessions",
"What first caught your attention about your partner?|Their smile|Their eyes|Their voice|Their sense of humor",
"Which date would you rather plan?|Picnic in the park|Stargazing|Dance class|Dessert tasting tour",
"How do you like to be comforted after a long day?|A long hug|A back rub|A listening ear|Being made to laugh",
"What's your sweetest weakness?|Kisses on the cheek|Being called beautiful|Surprise snacks|Someone playing with my hair",
"Which kiss is your favorite?|Quick peck|Slow and lingering|Playful nibble|Kiss on the forehead",
"What would you wear to leave your partner speechless?|Little black outfit|Their favorite color|Something tailored|Cozy oversized sweater",
"What's the cutest thing your partner does without noticing?|Their laugh|The way they say your name|Their sleepy voice|Fidgeting when nervous",
"If we slow-danced, what music would you pick?|Jazz standard|Classic love song|Modern pop ballad|Something silly",
"What's your perfect cuddle position?|Big spoon|Little spoon|Head on chest|Legs tangled",
"When do you feel most attractive?|Freshly showered|Dressed up|After a workout|In my pajamas",
"Which flirty message would make your day?|I can't stop smiling at you|You looked so good today|Counting down to seeing you|Thinking about your lips",
"How would you spend a lazy morning together?|Sleeping in|Making pancakes|Morning walk|Talking in bed",
"Which romantic movie cliche do you secretly love?|Running through the airport|Kiss in the rain|Grand speech|Slow-motion first look",
"How long could you go without a kiss from me?|An hour|A day|A week|Don't even joke about it",
"Which part of a date do you look forward to most?|Getting ready|The first hello|The conversation|The goodnight kiss",
"What's your secret soft spot?|Puppy eyes|Being sung to|Shy compliments|Being held tight",
"Which would you rather receive from your partner?|A love letter|A playlist|A surprise visit|A voice note at midnight",
"What makes you blush instantly?|Being stared at|Getting complimented|Hearing I love you|A flirty wink",
"What would be your dream anniversary?|Fancy dinner|Weekend away|Recreating our first date|Quiet night at home",
"Which of your partner's features do you think about most?|Eyes|Smile|Hands|Voice",
"What's your favorite pet name to give?|Love|Honey|Baby|Darling",
"Who do you think fell first?|Me|You|Both at once|Still deciding",
"How would you describe your flirting style?|Bold and direct|Shy and sweet|Funny and teasing|Mysterious",
"What would you do if we were stuck in an elevator together?|Make jokes|Sneak a kiss|Have a deep talk|Play twenty questions",
"Which romantic gesture would you plan for me?|Rose petals|Surprise picnic|Love notes everywhere|Fancy reservation",
"What's your favorite thing about our late-night calls?|Sleepy voices|Laughing together|Deep talks|Never wanting to hang up",
"How do you react when you get a compliment from me?|Blush and smile|Deny it|Flirt right back|Say thank you shyly",
"What's your dream Valentine's Day?|All-out romance|Low-key cozy night|Adventure day|Skip it, we celebrate daily",
"Which is sweetest to you?|Morning texts|Goodnight calls|Midday check-ins|Random I love yous",
"What's the best spot for a first kiss?|Under the stars|At a doorstep|In the rain|On a ferris wheel",
"How would you describe our chemistry?|Electric|Comfortable|Playful|Magnetic",
"What do you daydream about most when we're apart?|Our next date|Cuddling|Kissing|Our future",
"Which would you rather do on a beach date?|Walk at sunset|Build sandcastles|Swim together|Nap in the sun",
"What's the most attractive trait to you?|Confidence|Kindness|Humor|Intelligence",
"How do you like to hold hands?|Fingers laced|Pinky hold|Palm in palm|Arm around the waist instead",
"What's your favorite way to make up after a small fight?|Long hug|Talk it out|Silly apology|Kiss and forget",
"If you wrote me a love note, how would it start?|Hey gorgeous|My love|I was just thinking...|You won't believe this",
"Where would you most like a surprise kiss?|Neck|Lips|Hand|Forehead",
"Which flirty dare would you accept first?|Sing a love song|Describe our best kiss|Whisper something sweet|Name three things you adore",
"What's the most romantic word to you?|Forever|Always|Mine|Home",
"Which season feels the most romantic to you?|Spring|Summer|Autumn|Winter",
"What would you love to hear me say right now?|I miss you|You're adorable|Come here|I'm all yours",
"How would you spend a whole day in bed together?|Movies and snacks|Talking and laughing|Napping in each other's arms|Eating every meal there",
"What's your favorite way to say goodnight?|Sweet dreams text|Call until we fall asleep|A string of kiss emojis|A whispered I love you",
"Which surprise would make you swoon?|Flowers for no reason|A favorite snack delivered|A planned date night|A long sweet message",
"What's your favorite thing to do while cuddling?|Talk about nothing|Play with hair|Trace shapes on skin|Fall asleep",
"What's your idea of a perfect kiss length?|Two seconds|Ten seconds|A full minute|Until we're breathless"
],
2:[
"What turns you on the fastest?|A whisper in my ear|A lingering look|A slow touch|Hearing my name breathed",
"Where do you most want to be kissed tonight?|Neck|Collarbone|Inner thighs|Lower back",
"What's your favorite kind of foreplay?|Slow kissing|Teasing touches|Dirty talk|A sensual massage",
"Which outfit would drive you wild on your partner?|Lingerie|Just a towel|Only your shirt|A sharp suit",
"What's your secret turn-on?|Being bossed around a little|Gentle hair pulling|Being looked at with desire|Hearing what you want to do",
"What time of day are you most in the mood?|Morning|Afternoon|Late night|Literally anytime",
"What would you rather receive?|A full-body massage|A striptease described in detail|A long makeout|Breakfast after a wild night",
"Which fantasy location tempts you most?|A hotel balcony|A secluded beach|A steamy shower|A cabin by the fire",
"How do you like to be teased?|Slowly|Playfully|With words|Until I beg",
"What's your favorite kind of kiss when things heat up?|Deep and hungry|Slow and teasing|Biting lips|Kisses down the neck",
"What's the sexiest thing I could whisper?|I want you|Come to bed|I've thought about you all day|You're in trouble tonight",
"Which do you find hotter?|Taking charge|Being taken charge of|Switching it up|Equal and slow",
"How do you prefer to get in the mood?|Flirty texts all day|A long shower together|Slow dancing|A sensual massage",
"What's your favorite body part of mine?|Lips|Hands|Neck|Back",
"What's the boldest thing you'd do on a date?|Footsie under the table|Whisper something filthy|Leave early to get home|Sneak a heated kiss",
"Which scent gets you going?|Fresh from the shower|Cologne or perfume|Vanilla|Your natural scent",
"What makes a makeout session perfect?|No rush at all|Hands everywhere|Pressed against a wall|Breathless pauses",
"What's your favorite sexy sound?|A soft moan|Heavy breathing|My name whispered|A low laugh",
"Which would you rather try tonight?|Blindfold|Ice cubes|Massage oil|Feathers",
"How long do you like foreplay to last?|A few minutes|Fifteen minutes|Half an hour|As long as possible",
"What's your ideal sexy movie night?|We never finish the movie|Cuddling turns into more|A steamy movie on purpose|Pausing every ten minutes",
"What would make you blush the hardest?|Hearing my fantasy out loud|A very detailed compliment|Being reminded of last time|A dirty joke at dinner",
"Where would you love to be touched more?|Neck|Lower back|Thighs|Ears",
"What's your favorite kind of lingerie or underwear?|Lace|Silk|Sporty and simple|Nothing at all",
"What's your sexiest daydream setting?|A shower|A road trip|An office after hours|A hotel bed",
"How do you feel about dirty talk?|Love it both ways|Love hearing it|Love saying it|Still warming up",
"What would you want first when we're finally alone?|A hard kiss|Being undressed slowly|Pushed onto the bed|Hearing my plans",
"What gets your heart racing?|A long stare|A slow touch on the thigh|Kisses on the neck|Being called sexy",
"What's your favorite way to get undressed?|Slowly, piece by piece|Clothes flying in a hurry|Undressing each other|With music playing",
"Which fantasy have you thought about most?|A spontaneous quickie|A whole weekend in bed|Roleplay as strangers|Shower time together",
"What do you notice first when I'm dressed up?|The fit|The neckline|My legs|My scent",
"How do you like to be kissed on the neck?|Feather light|Slow and wet|With a nibble|With whispers in between",
"Which bedroom vibe do you prefer?|Candles and music|Lights off|Lights on|Morning sunlight",
"What's your favorite sexy text to receive?|What are you wearing?|I need you|Come over|Guess what I'm thinking",
"What would make a sexy surprise for you?|Lingerie under clothes|A planned seduction|A spicy message mid-day|Being pulled into a kiss",
"Which spot is your weak spot?|Ears|Neck|Inner wrists|Hips",
"What's your favorite thing to hear afterward?|That was amazing|Again?|You're incredible|Nothing, just cuddles",
"Which flirty move gets you every time?|A lip bite|Fingers through my hair|Being pulled close by the waist|A whisper in my ear",
"How do you feel about morning sex?|The best|Only after coffee|Only after brushing teeth|Lazy and perfect",
"What's the sexiest piece of clothing on anyone?|A fitted shirt|Thigh-high socks|Grey sweatpants|A silky robe",
"What's your favorite way to tease me over text?|Hinting at what I'll do|Describing my outfit|Making you wait|Saying I'm in bed thinking of you",
"What would you rather do in a hot tub?|Make out|Trade massages|Talk about fantasies|Much more than that",
"What's your secret fantasy role?|The seducer|The seduced|The mysterious stranger|The one in control",
"Where would you rather fool around at home?|Couch|Kitchen counter|Shower|Staircase",
"Which would you rather I describe?|What I'm wearing|What I'm thinking|What I want to do|How I want you to touch me",
"What's your idea of a sexy weekend?|Never leaving bed|Hotel getaway|Lots of teasing first|Trying something new",
"How do you like to be held during a makeout?|Hands on my face|Hands on my hips|Hands in my hair|Pinned down gently",
"What do you find sexiest in a voice?|Low and slow|Breathy|Confident|Playful",
"What's your favorite massage spot?|Shoulders|Lower back|Thighs|Feet",
"What makes you feel sexiest?|New lingerie|A bold compliment|Being wanted|A great hair day",
"What would you rather play?|Strip poker|Sexy truth or dare|Slow dance in underwear|Taking turns giving orders",
"How often do you think about me in a naughty way?|Once a day|A few times a day|Every hour|Right now",
"Which tease would make you crack fastest?|Kisses that stop short|Fingers tracing my thigh|Whispered promises|Waiting hours for a reply",
"What's the hottest compliment you could get?|You're irresistible|You drive me crazy|I can't keep my hands off you|You look edible",
"What's your favorite way to cuddle naked?|Spooning|Face to face|Lying on top|Legs tangled",
"What's the cheekiest place you'd sneak a kiss?|Back row of a movie|An empty elevator|A restaurant booth|A crowded party",
"What would you rather wake up to?|Kisses down your body|Being pulled closer|A whispered request|Wandering hands",
"What part of foreplay is your favorite?|Kissing|Undressing|Touching|The anticipation",
"What's your favorite way to set the mood?|Music|Candles|Flirty texts|A shower together",
"Which would you choose for a sexy night?|Roleplay|Massage oils|Blindfold|A big mirror",
"What do you crave most after a long week apart?|Kissing for hours|Tearing clothes off|Slow reconnection|Sleeping wrapped up together",
"Which tease would you love to try on me?|A slow lap dance|Kissing everywhere but lips|A no-touching rule|Whispering all night"
],
3:[
"What's your favorite position?|Missionary|On top|From behind|Spooning",
"How loud do you like to get?|Silent and intense|Soft moans|Pretty loud|The neighbors know my name",
"What's a kink you'd love to explore?|Light bondage|Spanking|Edging|Roleplay",
"How do you like to be dominated?|Pinned down|Told what to do|Teased until begging|I'd rather lead",
"Where would you most want sex besides the bed?|Shower|Kitchen counter|Against a wall|On the floor by the fire",
"What's your favorite thing to hear during sex?|Don't stop|You feel amazing|Harder|My name",
"How do you feel about spanking?|Love it|Light only|Curious|Hard pass",
"Which toy would you try first?|Vibrator|Handcuffs|Blindfold|Massage wand",
"How rough do you like it?|Gentle|A little rough|Rough|Depends on my mood",
"What's your favorite kind of oral?|Giving|Receiving|Both at once|Taking turns",
"How long do you want a session to last?|Quick and intense|Thirty minutes|An hour|All night",
"What's your biggest turn-on during sex?|Eye contact|Dirty talk|Hair pulling|Hearing you moan",
"Which pace do you prefer?|Slow and deep|Fast and hard|Teasing rhythm|A mix of everything",
"What's your favorite way to finish?|Together|Me first|You first|Over and over",
"How do you feel about being tied up?|Yes please|Only my wrists|I'd rather do the tying|Not my thing",
"What do you love most about edging?|The build-up|The begging|The release|Haven't tried it yet",
"Which roleplay would you jump into?|Strangers at a bar|Rival coworkers|Masseuse and client|Royal and bodyguard",
"What's your favorite thing for me to do with my mouth?|Kiss your neck|Bite your lips|Go down on you|Whisper filthy things",
"What gets you aroused fastest?|Dirty texts|Being touched slowly|Watching you undress|Hearing your fantasy",
"What's your favorite thing to grab during sex?|Hair|Hips|Sheets|Thighs",
"How many rounds is your ideal night?|One amazing one|Two|Three|Until sunrise",
"What's your favorite kind of dirty talk?|Being told what to do|Begging|Describing every move|Praise",
"Which lighting do you prefer during sex?|Lights on|Lights off|Candles|Daylight",
"How do you feel about praise during sex?|Love receiving it|Love giving it|It makes me melt|I prefer filth",
"What's the kinkiest thing you've fantasized about?|Being blindfolded and teased|Tying you up|Sex in front of a mirror|A whole day of edging",
"How would you like to be woken up for sex?|Kisses down my body|Oral|Being pulled on top|Hands between my legs",
"How do you like clothes handled when we're desperate?|Torn off|Pushed aside|Left half on|Folded, I'm patient",
"Which word do you want to hear me moan?|Yes|More|Please|Your name",
"What's your favorite position for eye contact?|Missionary|Me on top|Sitting in your lap|Side by side",
"How do you feel about toys in the bedroom?|The more the better|One at a time|Curious|Prefer just us",
"What's your favorite type of quickie?|Against the wall|Bent over the counter|In the shower|Half-dressed on the couch",
"Which do you crave more?|Being pleasured|Pleasuring you|Equal give and take|Being teased",
"What do you want more of in bed?|Dirty talk|Oral|Kissing|Experimenting",
"What role do you naturally take in bed?|Dominant|Submissive|Switch|Depends on the night",
"Which sensation do you want to try?|Warm wax|Ice|Feathers|Light biting",
"What's your favorite thing to do after sex?|Cuddle|Go again|Snack run|Shower together",
"How do you feel about sex in the shower?|So hot|Slippery but worth it|Prefer the bed|Only foreplay there",
"What's the best part of make-up sex?|The passion|The roughness|The tenderness|The apologies",
"Where do you love being kissed during sex?|Neck|Nipples|Inner thighs|Ears",
"How do you want to be teased before sex?|Slow undressing|Touched everywhere but there|Whispered filth|Made to wait all day",
"What's your favorite bondage gear?|Silk ties|Handcuffs|Rope|Just your hands",
"How bossy do you want me in bed?|Not at all|A little|Very|Totally in charge",
"What's your go-to move to seduce me?|A filthy text|Sitting in your lap|Kissing your neck|Wandering hands",
"Which do you enjoy more?|Teasing|Being teased|Both equally|Skip it, straight to it",
"Which fantasy would you want to act out?|Strangers hooking up|Snowed in at a cabin|A massage that goes further|A room service surprise",
"How do you feel about mirrors during sex?|Love watching us|Turned on but shy|Never tried|Not for me",
"What's the best thing to say right before?|I need you now|Take me|Don't hold back|I'm all yours",
"How do you want me to beg?|With words|With my body|Softly|Desperately",
"What turns you on most about my body?|Hands|Mouth|Hips|Thighs",
"What's your favorite rhythm?|Slow grind|Steady and deep|Fast and wild|Constantly changing",
"Which do you prefer giving?|Oral|A massage|Spankings|Orders",
"What part of you is most sensitive?|Neck|Ears|Inner thighs|Nipples",
"How do you feel about sexting?|Love it|Love reading it|Love writing it|Need practice",
"What would you do with me tied to the bed?|Tease you for hours|Kiss every inch|Use toys|Make you beg",
"How do you like to be pinned?|Wrists above my head|Against the wall|Face down|Not pinned at all",
"What kind of sex do you crave most often?|Romantic lovemaking|Wild and rough|Playful and giggly|Slow and tantric",
"Which would you choose for a dirty night?|A full night of edging|Roleplay|Bondage|A marathon session",
"What's your favorite way to get me off?|With my hands|With my mouth|Riding you|Toys",
"What would you love me to call you in bed?|Good girl or good boy|Dirty|Mine|Naughty",
"How do you feel about weekend morning marathons?|Yes, every weekend|Once in a while|Prefer nights|Ask me after coffee",
"What's your favorite noise I make?|Moans|Gasps|Growls|Saying your name",
"What's the first thing you'd do to me in a locked hotel room?|Pin you to the door|Strip you slowly|Drop to my knees|Throw you on the bed"
]
},
"body":{
1:[
"Where do you most want to be kissed right now?",
"Where should a slow trail of kisses start?",
"Where do you love being touched while cuddling?",
"Which spot do you love having stroked when you're sleepy?",
"Where would you put your hand when we slow dance?",
"Where do you feel butterflies when I look at you?",
"Which spot would you kiss first if I were right next to you?",
"Where would a surprise tickle get the biggest reaction?",
"Where would you rest your head on me?",
"Where do you love a gentle massage after a long day?",
"Which spot is the most ticklish on you?",
"Where would you leave a lipstick mark if you could?",
"Where do you want my hand to rest during a movie?",
"Which spot do you think about when you miss my touch?",
"Where should a good morning kiss land?",
"Where would you trace little circles with your fingers?",
"Where do you feel most relaxed when touched?",
"Where would a goodnight kiss mean the most?",
"Which spot do you secretly love being complimented on?",
"Where would you hold me when we walk together?",
"Where do you want a soft kiss after a hard day?",
"Which spot gives you goosebumps the fastest?",
"Where would you put a warm hand to comfort me?",
"Where should I tap you to get your attention flirtily?",
"Where do you feel my love the most when we hug?"
],
2:[
"Where should a slow trail of kisses end?",
"Where do you want to be touched to get you in the mood?",
"Which spot would make you weak if I bit it gently?",
"Where do you most want my breath against your skin?",
"Where should massage oil be poured first?",
"Where would you want my hands when we make out?",
"Which spot makes you shiver when kissed?",
"Where would you want an ice cube traced first?",
"Where would you leave a love bite on me?",
"Where do you want my fingertips to wander first?",
"Which spot drives you wild when I nibble it?",
"Where should I whisper while kissing you?",
"Where do you want me to grab you when I pull you close?",
"Which spot do you want kissed while you're blindfolded?",
"Where would you love a slow, teasing lick?",
"Where do you love feeling my hands while we kiss against a wall?",
"Where should my lips linger the longest?",
"Which spot is most sensitive on you when you're turned on?",
"Where would a feather feel best?",
"Where would you want my hand under the table?",
"Where should I start undressing you with kisses?",
"Which spot do you most want to kiss on me tonight?",
"Where should my hands go when you're sitting in my lap?",
"Where would a warm massage turn into something more?",
"Where do you crave being touched after a long week apart?"
],
3:[
"Where do you want me to leave marks?",
"Where should I grip you when things get rough?",
"Where do you want to be bitten hard?",
"Where would you want to be tied?",
"Where do you want me to spank you?",
"Where should I drip warm wax first?",
"Where do you want my mouth while I tease you until you beg?",
"Where should I pin you down?",
"Where do you want to feel my nails?",
"Where would you want me to kiss right before going lower?",
"Where do you want my hands while you ride me?",
"Where should I hold you when I take you from behind?",
"Where do you want my teeth when you finish?",
"Which spot makes you moan the loudest?",
"Where should a blindfolded tease begin?",
"Where do you want to be licked slowly until you're desperate?",
"Where should my hands squeeze when I'm deep inside you?",
"Where do you want to feel my breath when I talk dirty?",
"Where would you tie a silk scarf on me?",
"Where should I start an all-night edging session?",
"Where do you want me to kiss you while you're tied up?",
"Where do you want to be grabbed when I pull you onto the bed?",
"Where do you want me to trail ice before using my tongue?",
"Where do you want to feel me most when we finish together?",
"Where should I hold you down while I tease you?"
]
},
"fset":{
1:[
"a rainy cabin in the woods",
"a candlelit rooftop at sunset",
"a quiet bookshop after closing",
"a cozy ski lodge by the fire",
"a moonlit beach with one big blanket",
"a wildflower field on a summer afternoon",
"a tiny corner cafe in paris",
"a lantern festival by the river",
"a houseboat drifting at dawn",
"a treehouse strung with fairy lights",
"a vintage train sleeper car",
"a greenhouse full of roses",
"a ferris wheel stuck at the top",
"a snowy mountain village",
"a lakeside dock at midnight",
"an old observatory under the stars"
],
2:[
"a rooftop hotel suite",
"a private hot tub under the stars",
"a steamy rainforest shower",
"a velvet-draped jazz lounge",
"a luxury yacht cabin",
"a desert glamping tent",
"a secluded villa with an infinity pool",
"a sauna in a snowy chalet",
"a dimly lit art gallery after hours",
"a roadside motel with buzzing neon lights",
"a penthouse with floor-to-ceiling windows",
"a candlelit massage studio",
"a private cinema with one oversized couch",
"a tropical island bungalow",
"a balcony during a summer thunderstorm",
"a lavender farm guesthouse"
],
3:[
"a hotel room with the do-not-disturb sign up",
"a bedroom lined with mirrors",
"a private playroom stocked with restraints",
"a soundproof penthouse",
"a masquerade afterparty suite",
"a secluded cabin with no neighbors for miles",
"a king bed with black silk sheets",
"a steamy private bathhouse",
"a velvet room in an exclusive members' club",
"an empty corner office after hours with the door locked",
"a moonlit hot spring all to yourselves",
"a luxury train compartment with the blinds drawn",
"a candlelit room with a four-poster bed and silk ties",
"a hidden library alcove with a locked door",
"a rain-lashed car inside a private garage",
"a bed scattered with toys and blindfolds"
]
},
"fmood":{
1:[
"slow and tender",
"playfully competitive",
"giggly and shy",
"sweet and nostalgic",
"dreamy and romantic",
"nervous first-date butterflies",
"cozy and lazy",
"teasing and cheeky",
"warm and affectionate",
"spontaneous and silly",
"starry-eyed",
"gentle and patient",
"flirty and bright",
"hopelessly smitten",
"lighthearted and adventurous",
"soft-spoken and intimate"
],
2:[
"smoldering and slow",
"breathless anticipation",
"teasing and withholding",
"hungry and impatient",
"sultry and confident",
"secretive and daring",
"heated and flirtatious",
"sensual and unhurried",
"playfully seductive",
"crackling with tension",
"mischievous and bold",
"steamy and lingering",
"whispered and intimate",
"reckless with desire",
"tempting and coy",
"magnetic and intense"
],
3:[
"raw and desperate",
"dominant and commanding",
"submissive and eager",
"rough and passionate",
"filthy-mouthed and shameless",
"edging all night long",
"primal and wild",
"worshipful and devoted",
"bratty and defiant",
"greedy and insatiable",
"tied up and teased",
"ruthlessly teasing",
"sweaty and relentless",
"obedient and begging",
"intense power play with a safeword",
"unrestrained and loud"
]
},
"frole":{
1:[
"strangers at a masked ball",
"pen pals meeting for the first time",
"two travelers sharing one umbrella",
"rival bakers at a county fair",
"partners at a ballroom dance lesson",
"neighbors who keep bumping into each other",
"a florist and a regular customer",
"two painters sharing a studio",
"seatmates on a long overnight flight",
"stargazers at the same campsite",
"old flames reuniting at a friend's wedding",
"a street musician and their biggest fan",
"a tour guide and a curious traveler",
"rival chefs after closing time",
"two bookworms reaching for the same book",
"a lighthouse keeper and a stranded sailor"
],
2:[
"a barista and the last customer of the night",
"a massage therapist and a tense client",
"a spy and the target they fell for",
"a painter and their muse",
"rival lawyers after a heated case",
"a rock star and a backstage guest",
"two strangers in a stalled elevator",
"a dance instructor and a private client",
"a royal and their loyal bodyguard",
"a thief and the detective chasing them",
"a personal trainer and a flirty gym regular",
"vacationers sharing a hotel balcony",
"a pilot and a passenger on a long layover",
"a fortune teller and a skeptical visitor",
"two exes snowed in together",
"a superhero and the villain who tempts them"
],
3:[
"a dominant and a willing submissive",
"a strict mistress and her eager pet",
"two strangers who agreed to one wild night",
"a dominatrix and a client who knows the safeword",
"a brat and the tamer who loves the challenge",
"a seductive vampire and a willing midnight visitor",
"a bodyguard and the client who orders them to bed",
"a dancer and the guest of a private show",
"two rivals settling a bet in bed",
"a sculptor and a model who loves being looked at",
"a gentle dom and a nervous first-time sub",
"a queen and her chosen consort",
"a boutique toy-shop owner and a curious customer",
"a handler and a willing pet",
"a tantric guide and a devoted partner",
"a pleasure-house host and an eager guest"
]
},
"hot":{
1:[
"Forehead kisses are more intimate than lip kisses.",
"A good morning text is the best way to start the day.",
"Holding hands in public never gets old.",
"Slow dancing in the kitchen is peak romance.",
"Pet names make everything sweeter.",
"A handwritten love note beats any gift.",
"Cuddling is better than a fancy dinner date.",
"Flirting over text is an art form.",
"A long hug can fix almost anything.",
"Compliments about my smile hit harder than compliments about my body.",
"Stealing your partner's hoodie is a love language.",
"Eye contact across a room can be sexier than a kiss.",
"Inside jokes are the glue of a relationship.",
"Falling asleep on a call together is adorable.",
"Surprise kisses are better than planned ones.",
"Neck kisses are underrated.",
"A partner who cooks for you is instantly more attractive.",
"Butterflies should never fully go away.",
"Being called gorgeous out of nowhere makes my whole day.",
"Playful teasing is the best kind of flirting.",
"Rainy days are made for staying in together.",
"Matching outfits are cute, not cringe.",
"The first kiss of the day matters most.",
"Voice notes are more romantic than texts.",
"Breakfast in bed is the ultimate romantic gesture.",
"A little jealousy can be flattering.",
"Kissing in the rain belongs on every bucket list.",
"Hearing I miss you never gets old.",
"Lazy Sunday mornings beat any night out.",
"Time apart makes the reunions sweeter.",
"A wink is a criminally underrated flirt move.",
"Back hugs are better than front hugs.",
"Writing love letters should make a comeback.",
"Your partner's laugh is the best sound in the world.",
"A partner's scent on a pillow is comforting.",
"Spontaneous date nights beat planned ones.",
"Saying I love you first is brave, not risky.",
"Sharing dessert is more romantic than ordering two.",
"Playing with your partner's hair is relaxing for both people.",
"Stargazing together is the perfect date.",
"Getting dressed up for each other at home is fun.",
"Kisses on the hand are classy and charming.",
"Good night calls should be a daily ritual.",
"Confidence is the most attractive trait a partner can have.",
"Love songs are better when you think of someone specific.",
"Couples should have a secret signal in public.",
"Recreating our first date would be romantic.",
"Leaving cute notes around the house is sweet.",
"Nose kisses are adorable.",
"Being the little spoon is better than being the big spoon.",
"A sense of humour is sexier than a six-pack.",
"Taking the long way home together is romantic.",
"Massages are the best gift you can give a partner.",
"Flirting with your partner after years together is essential.",
"Blushing is cute, not embarrassing.",
"Slow kisses beat quick pecks every time.",
"A partner who remembers tiny details is irresistible.",
"Picnics are the most romantic kind of date.",
"Whispering sweet nothings is never cheesy.",
"Cheesy pick-up lines are secretly charming.",
"Planning a future together is romantic in itself.",
"Kissing during a movie is better than watching the movie."
],
2:[
"Morning sex beats midnight sex.",
"Being blindfolded sounds thrilling.",
"Dirty talk is a must in the bedroom.",
"Teasing for a long time makes the payoff better.",
"Make-up sex is the best kind.",
"Lingerie is more for the wearer than the watcher.",
"Shower sex is overrated.",
"A deep voice whispering in my ear is an instant turn-on.",
"Sexting during the workday is exciting.",
"Neck biting is a top-tier turn-on.",
"Being pinned against a wall sounds hot.",
"Slow undressing is sexier than ripping clothes off.",
"A hotel room makes everything spicier.",
"Gentle hair pulling is a yes for me.",
"Role-play could be really fun to try.",
"Sharing fantasies out loud is a turn-on in itself.",
"Massage oil should be in every bedroom.",
"Quickies are just as good as long sessions.",
"Being told exactly what my partner wants is hot.",
"Silk sheets make sex better.",
"Kissing down the body is the best kind of foreplay.",
"Ice cubes have a place in the bedroom.",
"Candles and music set the perfect mood.",
"Sex with the lights on beats lights off.",
"Being the one in control sounds fun.",
"Giving up control to your partner sounds fun.",
"Moaning is the best compliment.",
"A sexy surprise outfit is a great idea.",
"Thinking about your partner naughtily at work is a regular thing.",
"Falling asleep naked together is underrated.",
"Inner thigh kisses are torture in the best way.",
"Phone sex can be just as hot as the real thing.",
"A little spanking sounds fun.",
"Waking your partner up with kisses is the best alarm.",
"Trying a new position every month should be a rule.",
"Lip biting during a kiss drives me wild.",
"Bedroom eyes from across a room are irresistible.",
"Couples should have a sexy bucket list.",
"Having something naughty whispered to me in public is thrilling.",
"Strip games are a great way to spice up a night.",
"Sex on vacation is always better.",
"Grinding while kissing is hotter than it sounds.",
"Hearing your partner say what they love about my body is hot.",
"Sensual massages should always lead somewhere.",
"A bath for two is the ultimate spicy date.",
"Getting interrupted mid-makeout builds delicious tension.",
"Being told to wait is a turn-on.",
"Feathers are underrated bedroom toys.",
"Sex in the kitchen is a fantasy worth trying.",
"Talking about sex openly makes it better.",
"Love bites in hidden places are a fun secret.",
"Having a safe word makes trying new things easier.",
"A long makeout session can be better than sex.",
"Ear nibbling is an instant yes.",
"Anticipation all day is the best foreplay.",
"Being undressed by your partner beats undressing myself.",
"A sexy playlist should be ready at all times.",
"Rough kisses beat soft kisses.",
"Watching your partner get turned on is the hottest part.",
"Making out in a parked car feels thrilling.",
"Spending a whole day in bed together is the dream.",
"Leaving a little mystery makes things hotter."
],
3:[
"Being tied up sounds incredibly hot.",
"Oral sex is the best part of sex.",
"Giving oral is as hot as receiving it.",
"Being edged until I beg is a fantasy of mine.",
"Hearing your partner beg is a huge turn-on.",
"Sex toys make everything better.",
"A remote-controlled toy would be fun to try.",
"Being dominated, with clear consent, is a fantasy I'd explore.",
"Being the dominant one sounds very appealing.",
"Rough sex, with clear boundaries, is a yes for me.",
"Multiple rounds in one night should be the goal.",
"Sex all over the house beats sex in bed.",
"A spanking with a little sting, safeword agreed, sounds hot.",
"Handcuffs belong in every couple's drawer.",
"Being told exactly how to touch myself is hot.",
"Mutual masturbation over a call is underrated.",
"Describing every detail of what I'd do to your partner is a turn-on.",
"Orgasm control games sound thrilling.",
"Sixty-nine is the best position.",
"Doggy style is the best position.",
"Being on top is where I feel sexiest.",
"Anal play is something worth exploring.",
"Sex in front of a mirror is incredibly hot.",
"Being praised during sex is the biggest turn-on.",
"Wax play sounds like the right kind of intense.",
"Visiting a sex shop together would be a blast.",
"Being woken up with oral is the dream.",
"Being loud during sex is a must.",
"Cuffs and a blindfold together are the perfect combo.",
"Being teased with a toy for an hour sounds amazing.",
"Writing an erotic story together would be hot.",
"Tasting your partner is the best part of oral.",
"Dirty talk is better when it gets really explicit.",
"Nipple play deserves more attention.",
"Being pinned down and kissed everywhere sounds perfect.",
"A strap-on could be fun to explore.",
"Using a vibrator together beats using one alone.",
"Coming at the same time is the ultimate goal.",
"Being made to wait for an orgasm makes it better.",
"Face-sitting sounds like heaven.",
"Aftercare is just as important as the kink.",
"Feet are surprisingly sexy.",
"Spit is hot in the right moment.",
"Being bent over the bed is the hottest place to be.",
"Leather and latex are a turn-on.",
"Being told I'm not allowed to come yet is hot.",
"Sensory deprivation with a blindfold and earplugs sounds intense.",
"A strangers-at-a-bar role-play with your partner sounds hot.",
"Being the one who begs is hot.",
"Sex morning, noon and night in one day sounds achievable.",
"Marking each other with hickeys everywhere is hot.",
"A sex swing would be worth trying.",
"Hearing my name moaned is the best sound.",
"Long, slow sex beats fast and hard.",
"Getting thrown on the bed is a guaranteed yes.",
"A detailed, explicit voice note would drive me wild.",
"Ordering your partner around in bed sounds fun.",
"Trying tantric sex sounds intriguing.",
"Pegging is worth an open conversation.",
"Ruined sheets are a sign of a good night.",
"Sex while still half-dressed, too impatient to undress, is hot.",
"Biting during sex is a yes for me."
]
},
"finish":{
1:[
"The first thing I'd do if you walked in right now is...",
"My favourite thing to hear you whisper is...",
"The moment I knew I liked you was...",
"My favourite thing about your smile is...",
"If we had a perfect date tonight, it would start with...",
"The pet name I secretly love most is...",
"Something you do that makes me blush is...",
"My favourite memory of us is...",
"When I miss you, I usually...",
"The best kiss we ever had was...",
"I fell for you a little more when you...",
"If I could kiss you anywhere right now, it would be...",
"The song that reminds me of you is...",
"My favourite outfit on you is...",
"The cutest thing you do without realizing is...",
"If I wrote you a love note, it would start with...",
"A little thing you do that makes my day is...",
"The place I'd love to take you on a trip is...",
"When you laugh, I feel...",
"My ideal lazy day with you looks like...",
"The thing I'd cook for you on a special night is...",
"If we were slow dancing right now, I'd whisper...",
"The first time I saw you, I thought...",
"You're most attractive when you...",
"My favourite way to cuddle with you is...",
"Something I've always wanted to tell you is...",
"The way you look at me makes me...",
"If I could relive one day with you, it would be...",
"A compliment I don't say enough is...",
"My favourite way to wake up with you is...",
"If you were here right now, we'd be...",
"The sweetest thing you've ever said to me is...",
"My favourite part of your face is...",
"I get butterflies when you...",
"Our love story would make a movie called...",
"The thing I'd whisper to you before falling asleep is...",
"A tiny habit of yours I adore is...",
"If I could steal one thing of yours, it would be...",
"The romantic gesture I'd love to try for you is...",
"You make me feel safe when you...",
"My dream weekend getaway with you includes...",
"A flirty text I'd love to get from you is...",
"My favourite place to hold your hand is...",
"The best hug you ever gave me was when...",
"I knew you were special when...",
"The thing I find irresistible about your voice is...",
"If I planned a surprise for you, it would be...",
"My favourite thing to do together on a rainy day is...",
"One word that describes how you make me feel is...",
"I'd love to kiss you slowly while...",
"The moment with you I want to replay forever is...",
"If you dedicated a love song to me tonight, I'd want it to be...",
"Something about you I secretly brag about is...",
"The way you say my name makes me...",
"If we had a secret signal, it would mean...",
"My favourite thing about falling asleep next to you is...",
"The best date we've ever been on was...",
"I could listen to you talk about...",
"A promise I'd love to make you is...",
"Our perfect anniversary would include...",
"When I think about our future, I picture...",
"You looked so good the time you..."
],
2:[
"The outfit I'd love to see you in tonight is...",
"The place I most want to be kissed by you is...",
"A fantasy I've had about you is...",
"If we had the whole night to ourselves, I'd start by...",
"The sexiest thing you've ever done is...",
"My biggest turn-on is when you...",
"If I could undress you slowly, I'd start with...",
"The spot on my body that drives me wild is...",
"When you kiss my neck, I want to...",
"A naughty thought I had about you today was...",
"The sexiest sound you make is...",
"If you were in bed next to me right now, I'd...",
"A place I've always wanted to make out with you is...",
"The thing I'd whisper to tease you all night is...",
"My favourite part of your body to touch is...",
"Something I want to try with you in the bedroom is...",
"The hottest memory I have of us is...",
"If I gave you a massage, I'd end up...",
"You drive me crazy when you...",
"The way I'd wake you up tomorrow is...",
"I can't stop thinking about the time you...",
"If I could leave you one spicy message, it would say...",
"The sexiest thing about your voice is...",
"My ideal hotel night with you includes...",
"If we shared a bath, I'd...",
"One thing I'd love you to say to me in bed is...",
"I get turned on just thinking about...",
"The role-play scenario I'd try with you is...",
"If you blindfolded me, I'd want you to...",
"My secret weakness when you touch me is...",
"A place on your body I want to kiss for ages is...",
"The look you give me that makes me melt is...",
"If I wore something sexy for you, it would be...",
"The slowest, most teasing thing I'd do to you is...",
"I'd love to pin you down and...",
"Your hands on me feel like...",
"The perfect soundtrack for a spicy night with us is...",
"If we played a strip game, I'd want to lose...",
"A sexy surprise I'd plan for you is...",
"What I really want when I say goodnight is...",
"The first thing I'd take off you is...",
"If you whispered in my ear right now, I'd want to hear...",
"My favourite way to tease you is...",
"After a long day apart, I want you to...",
"The most tempting thing about you is...",
"I want to kiss my way from your lips to...",
"If I could be in control for one night, I'd make you...",
"If you were in control for one night, I'd hope you...",
"The kiss that would make my knees weak is...",
"The spiciest dream I've had about you was...",
"A word that turns me on when you say it is...",
"I love it when you grab my...",
"If we had five minutes alone right now, we'd...",
"My favourite thing to feel against my skin is your...",
"The sexiest thing you could text me right now is...",
"The bedroom rule I'd make for us is...",
"I'd love to spend a whole day in bed with you doing...",
"Something about you that's secretly very sexy is...",
"The moment I want you most is when...",
"If I sat in your lap right now, I'd...",
"My favourite cuddle position that turns into more is...",
"The thing I'd do with an ice cube on you is..."
],
3:[
"The filthiest thing I want to whisper to you is...",
"If I tied you up, the first thing I'd do is...",
"My wildest fantasy about you involves...",
"The way I want you to make me come is...",
"The first thing I'd do with my mouth on you is...",
"My favourite position with you is... because...",
"I want to taste you until...",
"If you edged me all night, I'd beg you to...",
"A kink I've been too shy to mention is...",
"The toy I'd love to use on you is...",
"The most explicit thing I'd love to hear you say is...",
"If I were in charge tonight, I'd order you to...",
"If you were in charge tonight, I'd let you...",
"The loudest you've ever made me moan was when...",
"I want you to tell me exactly how you'd...",
"The way I'd use a blindfold and cuffs on you is...",
"The hottest moment we've ever had in bed was...",
"I'd love to describe touching myself while thinking about...",
"What I want to do to you on the kitchen counter is...",
"If I could make you come in only one way, it would be...",
"The most explicit text I'd send you right now is...",
"I'd love for you to spank me while...",
"If we tried a new kink tonight, I'd pick...",
"My favourite way to go down on you is...",
"The sound you make right before you come makes me...",
"I want to pin your wrists and...",
"Round two would start with me...",
"I'd tease you with a vibrator until...",
"The place I want you to leave marks on me is...",
"If you begged me, I'd finally...",
"The intense thing I'd trust you with, safe word ready, is...",
"The rough thing I'd love to try with you is...",
"If I described our sex in three explicit words, they'd be...",
"When you're on top of me, I want to...",
"The scene I'd want to role-play with you, in full detail, is...",
"I'd love to wake you up by...",
"The way I'd tease you over the phone until you finish is...",
"What I'd do with my hands while you're blindfolded is...",
"Nothing turns me on more than when you...",
"I'd love for you to take control and make me...",
"The kinkiest thing I've ever thought about doing with you is...",
"If we had a whole weekend of sex, day one would start with...",
"My body reacts the most when you...",
"The thing I want to do to you in front of a mirror is...",
"I'd love to feel you grab my hair and...",
"If I made you wait to come, I'd...",
"The thing I want you to do with your tongue is...",
"My favourite thing to do right after you finish is...",
"If I described my perfect orgasm with you, it would be...",
"I'd beg you to keep going if you...",
"The wildest place in our home I want to have you is...",
"I want you to tell me what to do while I touch myself, starting with...",
"Wax, ice, or feathers on you, I'd pick... because...",
"The way I want you to bend me over is...",
"I'd love to use my mouth on you until...",
"The naughtiest thing I'd want to hear you moan is...",
"If you gave me full permission tonight, I'd...",
"The aftercare I'd want after a wild night is...",
"The most explicit fantasy I've touched myself to about you is...",
"If I could only use my fingers on you tonight, I'd...",
"I want you to whisper exactly what you'll do to me, beginning with...",
"The thing that would make me lose all control is..."
]
},
"tot":{
1:[
"Sunrise|Sunset",
"Beach date|Mountain date",
"Love letter|Love song",
"Forehead kiss|Cheek kiss",
"Big spoon|Little spoon",
"Holding hands|Arm in arm",
"Wink|Smile",
"Candlelight|Fairy lights",
"Cozy night in|Fancy night out",
"Morning cuddles|Night cuddles",
"Sweet talk|Playful teasing",
"Roses|Chocolates",
"Slow dance|Silly dance",
"Pet names|Real names",
"Texting|Calling",
"Picnic|Rooftop dinner",
"Hoodie|Pajamas",
"Movie night|Game night",
"Butterfly kisses|Eskimo kisses",
"Back hug|Front hug",
"Coffee date|Dessert date",
"Stargazing|Cloud watching",
"Compliments|Surprises",
"Rain|Snow",
"Breakfast in bed|Dinner by candlelight",
"Flirty glance|Flirty note",
"Romcom|Thriller",
"Bubble bath|Hot tub",
"Road trip|Weekend getaway",
"Kiss hello|Kiss goodbye",
"Sweetheart|Babe",
"Playlist|Mixtape",
"Fireplace|Balcony",
"Lips|Neck",
"Hair stroking|Back rubs",
"Shy|Bold",
"Blushing|Making them blush",
"Long hug|Quick kiss",
"Voice note|Handwritten note",
"Cuddle|Dance",
"Blanket fort|Hammock",
"Strawberries|Cherries",
"Tea night|Cocoa night",
"Paris|Venice",
"Flowers|Jewelry",
"Gentle|Playful",
"Eye contact|Whispers",
"Lazy Sunday|Adventure Saturday",
"Sweet|Cheeky",
"First kiss|Latest kiss",
"Matching outfits|Matching tattoos",
"Kiss on the hand|Kiss on the shoulder",
"Dimples|Freckles",
"Teasing|Tickling",
"Serenade|Poem",
"Morning person|Night owl",
"Sunflowers|Tulips",
"Late night talks|Early morning walks",
"Spontaneous|Planned",
"Cheesy lines|Smooth lines",
"Ice cream|Popcorn",
"Nose kiss|Ear kiss"
],
2:[
"Slow|Fast",
"Lights on|Lights off",
"Whisper|Moan",
"Lace|Silk",
"Shower|Bath",
"Morning|Midnight",
"Neck kisses|Collarbone kisses",
"Tease|Please",
"Blindfold|Eye contact",
"Bed|Couch",
"Nibble|Lick",
"Massage|Make out",
"Lingerie|Nothing",
"Sexting|Dirty voice note",
"Give|Receive",
"Hair pull|Back scratch",
"Quickie|All night",
"Pinned|Carried",
"Silk sheets|Fur rug",
"Ice cube|Warm breath",
"Striptease|Lap dance",
"Hands|Lips",
"Dirty talk|Silent stare",
"Bra|No bra",
"Boxers|Briefs",
"Loud|Quiet",
"Surprise seduction|Planned seduction",
"Thighs|Hips",
"Ear nibble|Neck bite",
"Candles|Moonlight",
"Role-play|Real you",
"Hickeys|No marks",
"Kitchen counter|Against the wall",
"Undress me|Undress you",
"Sexy playlist|Total silence",
"Feather|Fingertips",
"Cuddle after|Round two",
"Seduce|Be seduced",
"Bedroom eyes|Wicked grin",
"Hotel room|Your place",
"Lazy morning|Wild night",
"Heels|Barefoot",
"Tie|Scarf",
"Shirt off|Pants off",
"Hot tub|Sauna",
"Sweet nothings|Dirty somethings",
"Slow strip|Rip it off",
"Lip bite|Lip lick",
"Truth|Dare",
"Body oil|Whipped cream",
"Grind|Sway",
"Kiss lower|Kiss higher",
"Bossy|Bratty",
"Sheets on|Sheets off",
"Tight hug|Firm grip",
"Deep kiss|Soft kiss",
"Pillow talk|Pillow fight",
"Floor|Desk",
"Wrists|Waist",
"Tempt|Tease more",
"Naughty|Nice",
"Breathless|Weak knees"
],
3:[
"Top|Bottom",
"Dominant|Submissive",
"Riding|Missionary",
"From behind|Face to face",
"Hands|Mouth",
"Spank|Be spanked",
"Cuffs|Rope",
"Fingers|Lips",
"Edging|Release",
"Begging|Teasing",
"Hot wax|Ice",
"Biting|Scratching",
"Tongue|Teeth",
"Blindfold|Restraints",
"Dirty talk|Moaning",
"Order|Obey",
"Giving oral|Receiving oral",
"Sixty-nine|Taking turns",
"Rough|Tender",
"Quickie|Marathon",
"Screaming|Biting the pillow",
"Hair pulling|Wrist pinning",
"Sex swing|Sex wedge",
"Lube|Massage oil",
"Collar|Leash",
"Paddle|Bare hand",
"Nipple clamps|Gentle nibbles",
"Role-play|Real names",
"Multiple orgasms|One huge orgasm",
"Fast and hard|Slow and deep",
"Shower sex|Bed sex",
"Lingerie on|Fully naked",
"Praise kink|Brat taming",
"Anal play|Vanilla night",
"Strap-on|Double-ended toy",
"Morning sex|Midnight sex",
"Moan my name|Say please",
"Keep me waiting|Give it now",
"Kneel|Lie back",
"Tie up|Get tied",
"Eye contact|Eyes closed",
"Grip hips|Grip sheets",
"Sexting all day|One filthy call",
"Thigh kisses|Neck bites",
"Boss|Brat",
"Edible body paint|Flavored lube",
"Against the door|Bent over the bed",
"Masquerade|Uniform fantasy",
"Remote vibe|Magic wand",
"Feather|Flogger",
"Sensory deprivation|Sensory overload",
"Count orgasms|Lose count",
"Squirm|Shiver",
"Aftercare cuddles|Aftercare bath",
"Command|Request",
"Pin me|Pin you",
"On your lap|On the floor",
"Yes list|Maybe list",
"Tease till dawn|Ravish right now",
"Finish together|Finish first",
"Silk ties|Leather straps",
"Filthy whisper|Loud moan"
]
}
};

var STYLES=['truth','nhie','wyr','hot','guess','finish','tot','body','fantasy'];
var SNAME={truth:'Truth',nhie:'Never Have I Ever',wyr:'Would You Rather',hot:'Hot Take',guess:'Guess My Answer',finish:'Finish the Sentence',tot:'This or That',body:'Body Map',fantasy:'Fantasy Builder'};
var SICON={truth:'🗝️',nhie:'🙈',wyr:'⚖️',hot:'🌡️',guess:'🔮',finish:'✍️',tot:'⚡',body:'📍',fantasy:'🎲'};
var LV=['','Flirty','Spicy','Wild'],LVI=['','💋','🔥','😈'];
var PERIOD=6,TOT_N=5,TOT_SECS=15,REELS=['setting','mood','role'],RNAME={setting:'Setting',mood:'Mood',role:'You are'};
/* body map zones: s = f(ront) / b(ack); x,y in a 200x400 viewBox */
var ZONES=[
{id:'forehead',l:'Forehead',s:'f',x:100,y:26},{id:'ears',l:'Ears',s:'f',x:125,y:44},{id:'lips',l:'Lips',s:'f',x:100,y:56},
{id:'neck',l:'Neck',s:'f',x:100,y:76},{id:'collarbone',l:'Collarbone',s:'f',x:100,y:95},{id:'shoulders',l:'Shoulders',s:'f',x:141,y:100},
{id:'heart',l:'Over the heart',s:'f',x:84,y:120},{id:'stomach',l:'Stomach',s:'f',x:100,y:162},{id:'hips',l:'Hips',s:'f',x:128,y:208},
{id:'wrists',l:'Inner wrists',s:'f',x:157,y:188},{id:'hands',l:'Hands',s:'f',x:160,y:220},{id:'thighs',l:'Thighs',s:'f',x:86,y:262},
{id:'knees',l:'Knees',s:'f',x:115,y:302},{id:'ankles',l:'Ankles',s:'f',x:86,y:368},
{id:'nape',l:'Nape of the neck',s:'b',x:100,y:76},{id:'upperback',l:'Upper back',s:'b',x:100,y:104},{id:'blades',l:'Shoulder blades',s:'b',x:76,y:124},
{id:'spine',l:'Spine',s:'b',x:100,y:150},{id:'lowerback',l:'Lower back',s:'b',x:100,y:196},{id:'bthighs',l:'Back of the thighs',s:'b',x:114,y:262},
{id:'bknees',l:'Back of the knees',s:'b',x:86,y:304},{id:'calves',l:'Calves',s:'b',x:114,y:336},{id:'feet',l:'Feet',s:'b',x:86,y:386}];
var ZMAP={};ZONES.forEach(function(z){ZMAP[z.id]=z});

/* ---------- pure helpers ---------- */
function hash(s){var h=7;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h)}
function shufWith(arr,rnd){var a=arr.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(rnd()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
function range(n){var a=[];for(var i=0;i<n;i++)a.push(i);return a}
function levelFor(cfg,n){return Math.min(3,cfg.lvl+(cfg.esc?Math.floor(n/PERIOD):0))}
function fill(raw,type,n,names){
  var act=n%2===0?'host':'guest',oth=act==='host'?'guest':'host';
  var p=type==='truth'?((names&&names[oth])||(oth==='host'?'Host':'Guest')):type==='nhie'?'my partner':'your partner';
  return String(raw).replace(/\{p\}/g,p);
}
function clip(s,max){return String(s==null?'':s).replace(/\s+/g,' ').trim().slice(0,max||400)}
/* normalise a pick for a style; undefined = invalid */
function validPick(type,v){
  switch(type){
    case 'nhie':return (v==='have'||v==='not')?v:undefined;
    case 'wyr':return (v==='A'||v==='B')?v:undefined;
    case 'hot':return (typeof v==='number'&&v%1===0&&v>=1&&v<=10)?v:undefined;
    case 'guess':return (typeof v==='number'&&v%1===0&&v>=0&&v<=3)?v:undefined;
    case 'finish':{var t=clip(v,200);return t?t:undefined}
    case 'tot':{
      if(!Array.isArray(v)||v.length!==TOT_N)return undefined;
      var o=[];for(var i=0;i<TOT_N;i++){if(v[i]!=='A'&&v[i]!=='B'&&v[i]!==null)return undefined;o.push(v[i])}
      return o;
    }
    case 'body':return (typeof v==='string'&&ZMAP.hasOwnProperty(v))?v:undefined;
    case 'fantasy':{
      if(!v||typeof v!=='object')return undefined;
      var f={};for(var k=0;k<REELS.length;k++){var x=v[REELS[k]];if(typeof x!=='number'||x%1!==0||x<0||x>2)return undefined;f[REELS[k]]=x}
      return f;
    }
  }
  return undefined;
}

/* ---------- host-side authoritative state machine ---------- */
function makeCore(seed,rngf){
  seed=seed|0;
  var S={q:0,phase:'lobby',cfg:{lvl:1,esc:false,sty:STYLES.slice()},n:0,type:null,lvl:1,maxLvl:1,card:null,cv:0,
    pick:{host:null,guest:null},more:null,reasons:{host:null,guest:null},ans:null,res:null,ready:{host:false,guest:false},
    note:'',sync:0,moments:[],counts:{}};
  var decks={},blocks=[],brng=rngf(seed+31),crng=rngf(seed+77);
  function typeFor(n){
    var b=Math.floor(n/S.cfg.sty.length);
    while(blocks.length<=b)blocks.push(shufWith(S.cfg.sty,brng));
    return blocks[b][n%S.cfg.sty.length];
  }
  function draw(t,l){
    var k=t+l;
    if(!decks[k])decks[k]={o:shufWith(range(BANK[t][l].length),rngf(seed+101+hash(k))),p:0};
    var d=decks[k],i=d.o[d.p%d.o.length];d.p++;
    return BANK[t][l][i];
  }
  function drawN(t,l,n){var a=[];for(var i=0;i<n;i++)a.push(draw(t,l));return a}
  function newCard(){
    var t=S.type,l=S.lvl;
    if(t==='tot')return {lvl:l,items:drawN('tot',l,TOT_N)};
    if(t==='fantasy')return {lvl:l,reels:{setting:drawN('fset',l,3),mood:drawN('fmood',l,3),role:drawN('frole',l,3)}};
    return {lvl:l,raw:draw(t,l)};
  }
  function actor(){return S.n%2===0?'host':'guest'}
  function clearAnswers(){
    S.pick={host:null,guest:null};S.more=null;S.reasons={host:null,guest:null};S.ans=null;S.res=null;
    S.ready={host:false,guest:false};
  }
  function beginRound(){
    clearAnswers();S.cv=0;
    S.type=typeFor(S.n);
    S.lvl=levelFor(S.cfg,S.n);
    if(S.lvl>S.maxLvl)S.maxLvl=S.lvl;
    S.counts[S.type]=(S.counts[S.type]||0)+1;
    S.card=newCard();
    S.phase=S.type==='truth'?'respond':'pick';
  }
  function advance(){
    var before=levelFor(S.cfg,S.n);
    S.n++;
    beginRound();
    S.note=(S.lvl>before)?'The heat is rising 🔥':'';
  }
  function moment(k,who,x){S.moments.push({k:k,w:who||null,x:clip(x,180)});if(S.moments.length>60)S.moments.shift()}
  function resolve(){
    var a=actor(),o=a==='host'?'guest':'host',P=S.pick;
    S.phase='reveal';
    switch(S.type){
      case 'wyr':
        if(P.host===P.guest){S.sync++;moment('m',null,'Both would rather: '+fill(S.card.raw,'wyr').split('|')[P.host==='A'?0:1])}
        break;
      case 'hot':{
        var gap=Math.abs(P.host-P.guest);S.res={gap:gap};
        if(gap<=1)S.sync++;
        if(gap===0)moment('m',null,'Perfectly in sync ('+P.host+'/10) on: '+fill(S.card.raw,'hot'));
        break;
      }
      case 'guess':{
        var ok=P[a]===P[o];S.res={ok:ok};
        if(ok){S.sync++;var g=S.card.raw.split('|');moment('m',o,'read your mind: '+g[0]+' → '+g[1+P[a]])}
        break;
      }
      case 'finish':
        moment('t',a,fill(S.card.raw,'finish').replace(/\.\.\.$|…$/,'')+' '+P[a]);
        break;
      case 'tot':{
        var m=0;for(var i=0;i<TOT_N;i++)if(P.host[i]&&P.host[i]===P.guest[i])m++;
        S.res={m:m};S.sync+=m;
        if(m===TOT_N)moment('m',null,'Perfect This-or-That: '+m+'/'+TOT_N);
        break;
      }
      case 'body':{
        var hit=P[a]===P[o];S.res={ok:hit};
        if(hit){S.sync++;moment('m',o,'found the spot: '+ZMAP[P[a]].l)}
        break;
      }
      case 'fantasy':{
        var res={matched:0};
        REELS.forEach(function(r){
          var h=P.host[r],gs=P.guest[r],i;
          if(h===gs){i=h;res.matched++;res[r+'M']=true}
          else i=crng()<.5?h:gs;
          res[r]=S.card.reels[r][i];
        });
        S.sync+=res.matched;S.res=res;S.phase='respond';
        break;
      }
    }
  }
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
        if(typeof a.sty==='string'&&STYLES.indexOf(a.sty)>=0){
          var on=S.cfg.sty.indexOf(a.sty)>=0;
          if(on&&S.cfg.sty.length>1){S.cfg.sty=S.cfg.sty.filter(function(x){return x!==a.sty});ch=true}
          else if(!on){S.cfg.sty=STYLES.filter(function(x){return x===a.sty||S.cfg.sty.indexOf(x)>=0});ch=true}
        }
        return ch;
      }
      if(k==='start'){S.n=0;S.maxLvl=S.cfg.lvl;S.note='';S.sync=0;S.moments=[];S.counts={};beginRound();return true}
      return false;
    }
    if(k==='cfg'||k==='start')return false;
    if((a.r|0)!==S.n)return false; /* stale round */
    var ph=S.phase,act=actor();
    if(k==='skip'||k==='pause'){
      if(ph!=='pick'&&ph!=='respond')return false;
      if((a.cv|0)!==S.cv)return false; /* someone already swapped this card */
      if(k==='pause')S.lvl=S.lvl>1?S.lvl-1:1;
      clearAnswers();S.card=newCard();S.cv++;S.note='Card swapped';
      S.phase=S.type==='truth'?'respond':'pick';
      return true;
    }
    if(k==='answer'&&ph==='respond'&&role===act&&(a.cv|0)===S.cv&&(S.type==='truth'||S.type==='fantasy')){
      var t=clip(a.text,S.type==='fantasy'?900:500);if(!t)return false;
      S.ans=t;S.phase='done';
      if(S.type==='truth')moment('t',act,t);else moment('t',act,'told a fantasy: '+t);
      return true;
    }
    if(k==='pick'&&ph==='pick'){
      if((a.cv|0)!==S.cv||S.pick[role]!==null)return false;
      var v=validPick(S.type,a.v);if(v===undefined)return false;
      S.pick[role]=v;
      if(S.pick[other]!==null)resolve();
      return true;
    }
    if(ph==='reveal'){
      if(k==='more'&&S.type==='nhie'&&!S.more&&S.pick[other]==='have'){S.more={ask:role,story:null};return true}
      if(k==='story'&&S.type==='nhie'&&S.more&&S.more.story===null&&role!==S.more.ask){
        var s=clip(a.text,600);if(!s)return false;S.more.story=s;return true;
      }
      if(k==='reason'&&S.type==='wyr'&&S.reasons[role]===null){
        var rs=clip(a.text,300);if(!rs)return false;S.reasons[role]=rs;return true;
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
  function view(role){
    var v={},k;
    for(k in S)v[k]=S[k];
    v.cfg={lvl:S.cfg.lvl,esc:S.cfg.esc,sty:S.cfg.sty.slice()};
    var o=role==='host'?'guest':'host';
    v.pick={host:S.pick.host,guest:S.pick.guest};
    if(S.phase==='pick'&&S.pick[o]!==null)v.pick[o]='?';
    return v;
  }
  return {S:S,apply:apply,view:view,draw:draw,typeFor:typeFor};
}

/* ---------- styles ---------- */
var CSS=[
'.sp{--a:#ff4d6d;--a2:#c9184a;--hc:#ff8fb1;--glow:rgba(255,77,109,.35);--ink2:#ffd9e4;max-width:720px;margin:0 auto;padding:6px 0 30px;font-family:var(--font,inherit)}',
'.sp *{box-sizing:border-box}',
'.sp-hdr{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap}',
'.sp-title{font-weight:800;font-size:1.35rem;letter-spacing:.02em;background:linear-gradient(90deg,#ff4d6d,#e0239b,#9b6bff);-webkit-background-clip:text;background-clip:text;color:transparent}',
'.sp-meta{display:flex;gap:8px;align-items:center;color:var(--dim);font-weight:700;font-size:.88rem;flex-wrap:wrap}',
'.sp-round,.sp-sync{background:rgba(255,255,255,.07);border:1px solid var(--line);border-radius:999px;padding:3px 12px}',
'.sp-sync{color:#ffc2d4}',
'.sp-heat{background:rgba(255,77,109,.14);color:var(--ink2);border:1px solid rgba(255,77,109,.45);border-radius:999px;padding:3px 12px;letter-spacing:.02em}',
'.sp-box{position:relative;border:1px solid transparent;border-radius:24px;padding:22px 18px;margin:12px 0;text-align:center;box-shadow:0 14px 40px rgba(0,0,0,.45),0 0 44px var(--glow);',
'background-image:linear-gradient(160deg,#2a0f2c,#150f2d 70%),linear-gradient(135deg,var(--hc),var(--a2),#9b6bff);background-origin:border-box;background-clip:padding-box,border-box}',
'.sp-box.h1{--hc:#ffb3cf;--a:#ff6f9f;--a2:#e85d8f;--glow:rgba(255,143,177,.28)}',
'.sp-box.h2{--hc:#ffb347;--a:#ff6a3d;--a2:#e03a1e;--glow:rgba(255,106,61,.34)}',
'.sp-box.h3{--hc:#ff2e63;--a:#d4145a;--a2:#7a1fa2;--glow:rgba(180,20,100,.48)}',
'.sp-chip{display:inline-block;font-size:.74rem;font-weight:800;letter-spacing:.16em;color:#fff;background:linear-gradient(135deg,var(--a),var(--a2));border-radius:999px;padding:4px 14px;margin-bottom:12px;box-shadow:0 4px 12px rgba(0,0,0,.3);text-transform:uppercase}',
'.sp-text{font-size:1.45rem;line-height:1.4;font-weight:700;color:#fff;word-break:break-word;text-shadow:0 2px 14px rgba(0,0,0,.4)}',
'.sp-sub{color:var(--dim);margin:10px 0 0;font-size:.95rem}',
'.sp-turn{text-align:center;color:var(--ink2);font-weight:700;margin:8px 0 0}',
'.sp-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}.sp-row>*{flex:1;min-width:110px}',
'.sp button{margin:4px 0}',
'.sp-btn{background:linear-gradient(135deg,var(--a),var(--a2));color:#fff;border:0;border-radius:14px;box-shadow:0 6px 18px rgba(0,0,0,.35)}',
'.sp-btn.alt{background:linear-gradient(135deg,#9b6bff,#6d3fd1)}',
'.sp-btn.soft{background:rgba(255,255,255,.08);color:var(--ink2);border:1px solid var(--line);box-shadow:none}',
'.sp-btn.sel{background:linear-gradient(135deg,var(--a),var(--a2));color:#fff;outline:3px solid rgba(255,255,255,.85);box-shadow:0 0 26px var(--glow)}',
'.sp-btn:disabled{opacity:.45}',
'.sp-lvls{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}',
'.sp-lvls .sp-btn,.sp-lvls .sp-pill{padding:22px 8px;font-size:1.05rem;border-radius:18px}',
'.sp .on{background:linear-gradient(135deg,#ff4d6d,#c9184a);color:#fff;outline:2px solid rgba(255,255,255,.85);box-shadow:0 0 24px rgba(255,77,109,.4)}',
'.sp .off{background:rgba(255,255,255,.07);color:var(--ink2);border:1px solid var(--line);box-shadow:none;opacity:.75}',
'.sp-stys{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:8px;margin:10px 0}',
'.sp-stys .sp-btn,.sp-stys .sp-pill{padding:10px 8px;font-size:.9rem;border-radius:12px}',
'.sp-pill{border-radius:14px;padding:14px 8px;font-weight:800;text-align:center}',
'.sp-h{margin:14px 0 2px;font-size:1rem;color:var(--ink2);text-align:left}',
'.sp-opts{position:relative;display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}',
'.sp-opts::after{content:"vs";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:38px;height:38px;border-radius:50%;background:#10081c;color:var(--ink2);border:2px solid var(--a);font-weight:800;display:flex;align-items:center;justify-content:center;font-size:.85rem;text-transform:uppercase;z-index:2;box-shadow:0 0 14px var(--glow);pointer-events:none}',
'.sp-opt{white-space:normal;line-height:1.35;padding:26px 14px;min-height:110px;font-size:1.05rem;border-radius:18px}',
'.sp-opt:disabled.sel{animation:spreveal .5s}',
'.sp-ga-list{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}',
'.sp-ga{white-space:normal;padding:16px 10px}',
'.sp-bubble{background:rgba(255,255,255,.06);border:1px solid var(--line);border-left:4px solid var(--a);border-radius:14px;padding:10px 14px;margin:8px 0;text-align:left;word-break:break-word;animation:spslide .35s}',
'.sp-bubble small{display:block;color:var(--hc);font-size:.75rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;margin-bottom:2px}',
'.sp-res{display:inline-block;font-size:1.3rem;font-weight:800;color:#fff;margin:12px 0 4px;padding:6px 18px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid var(--line);animation:spburst .6s}',
'.sp-form{display:flex;gap:8px;margin-top:12px}.sp-form input{flex:1;margin:0;border-radius:14px}.sp-form button{margin:0;flex:0 0 auto;padding:12px 18px}',
'.sp input[type=text]{background:rgba(10,6,22,.7);border:1.5px solid rgba(255,77,109,.35);color:var(--ink)}',
'.sp input[type=text]:focus{border-color:var(--a);box-shadow:0 0 0 4px var(--glow)}',
'.sp-slider{margin:16px 0 4px}',
'.sp-range{width:100%;accent-color:var(--a);margin:6px 0;padding:0;border:0;background:transparent}',
'.sp-rv{font-size:2.6rem;font-weight:800;color:#fff;text-shadow:0 0 20px var(--glow)}',
'.sp-scale{display:flex;justify-content:space-between;color:var(--dim);font-size:.8rem}',
'.sp-bars{display:grid;grid-template-columns:auto 1fr auto;gap:8px 10px;align-items:center;margin:12px 0;text-align:left}',
'.sp-bar{height:12px;border-radius:6px;background:rgba(255,255,255,.08);overflow:hidden}',
'.sp-bar i{display:block;height:100%;border-radius:6px;background:linear-gradient(90deg,var(--hc),var(--a));animation:spgrow .7s}',
'.sp-gap{font-weight:800;color:var(--ink2)}',
'.sp-tt-time{font:800 1.6rem ui-monospace,monospace;color:var(--hc)}',
'.sp-tt-pair{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px}',
'.sp-tt{padding:22px 10px;font-size:1.2rem;border-radius:18px}',
'.sp-tt-rows{margin:10px 0;text-align:left}',
'.sp-tt-row{display:flex;justify-content:space-between;gap:8px;padding:7px 10px;border-bottom:1px solid var(--line);font-weight:600}',
'.sp-tt-row.ok{color:#ffd1e3;background:rgba(255,77,109,.1);border-radius:8px}',
'.sp-body{position:relative;width:220px;max-width:100%;margin:12px auto 0;aspect-ratio:1/2}',
'.sp-body svg{position:absolute;inset:0;width:100%;height:100%}',
'.sp-zone{position:absolute;width:24px;height:24px;margin:0;padding:0;border-radius:50%;transform:translate(-50%,-50%);background:rgba(255,143,177,.25);border:2px solid rgba(255,190,210,.7);box-shadow:none;cursor:pointer}',
'.sp-zone span{position:absolute;left:50%;bottom:120%;transform:translateX(-50%);white-space:nowrap;font-size:.72rem;font-weight:700;color:#fff;background:#1a0c22;border:1px solid var(--line);border-radius:8px;padding:2px 7px;opacity:0;pointer-events:none;transition:opacity .15s}',
'.sp-zone:hover span,.sp-zone.sel span,.sp-zone.pin-a span,.sp-zone.pin-b span{opacity:1}',
'.sp-zone.sel{background:var(--a);border-color:#fff;box-shadow:0 0 0 6px var(--glow)}',
'.sp-zone.pin-a{background:#ff2e63;border-color:#fff;box-shadow:0 0 0 8px rgba(255,46,99,.35),0 0 30px #ff2e63;animation:sppulse 1.4s infinite;opacity:1}',
'.sp-zone.pin-b{background:#9b6bff;border-color:#fff;box-shadow:0 0 0 8px rgba(155,107,255,.35),0 0 30px #9b6bff;opacity:1}',
'.sp-zone.pin-a.pin-b{background:linear-gradient(90deg,#ff2e63 50%,#9b6bff 50%)}',
'.sp-zone:disabled{cursor:default;opacity:.35}',
'.sp-legend{display:flex;gap:14px;justify-content:center;font-size:.85rem;color:var(--ink2);margin-top:8px}',
'.sp-legend b{display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:5px;vertical-align:-1px}',
'.sp-reels{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px}',
'.sp-reel{background:rgba(0,0,0,.25);border:1px solid var(--line);border-radius:16px;padding:8px}',
'.sp-reel h4{margin:2px 0 6px;font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:var(--hc)}',
'.sp-reel-opt{display:block;width:100%;white-space:normal;padding:10px 6px;font-size:.88rem;line-height:1.25;border-radius:12px}',
'.sp-story{font-size:1.15rem;line-height:1.5;color:#fff;margin:6px 0}.sp-story b{color:var(--hc)}',
'.sp-foot{display:flex;gap:8px;flex-wrap:wrap;justify-content:space-between;margin-top:16px;padding-top:12px;border-top:1px solid var(--line)}',
'.sp-foot button{margin:0;flex:1;min-width:130px;font-size:.88rem;padding:10px;border-radius:12px}',
'.sp-note{text-align:center;color:#ffb3c6;font-size:.9rem;min-height:1.3em;font-style:italic}',
'.sp-conf{background:rgba(255,77,109,.1);border:1px solid rgba(255,77,109,.5);border-radius:16px;padding:14px;margin-top:10px;text-align:center;font-weight:700;animation:spslide .25s}',
'.sp-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}',
'.sp-stat{background:rgba(255,255,255,.06);border:1px solid var(--line);border-radius:16px;padding:12px}',
'.sp-stat b{display:block;font-size:1.6rem;color:#fff}.sp-stat small{color:var(--dim)}',
'.sp-pop{animation:spflip .5s cubic-bezier(.2,.8,.2,1)}',
'@keyframes spflip{0%{transform:perspective(700px) rotateX(-70deg) translateY(-12px);opacity:0}100%{transform:perspective(700px) rotateX(0);opacity:1}}',
'@keyframes spslide{0%{transform:translateY(8px);opacity:0}100%{transform:none;opacity:1}}',
'@keyframes spburst{0%{transform:scale(.5);opacity:0}60%{transform:scale(1.18)}100%{transform:scale(1);opacity:1}}',
'@keyframes spreveal{0%{transform:scale(.92)}60%{transform:scale(1.05)}100%{transform:scale(1)}}',
'@keyframes spgrow{0%{width:0}}',
'@keyframes sppulse{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.2)}}',
'@media (max-width:520px){.sp-text{font-size:1.2rem}.sp-opts,.sp-ga-list{gap:10px}.sp-reels{grid-template-columns:1fr}.sp-stats{grid-template-columns:1fr 1fr}}'
].join('');

var SILHOUETTE='<svg viewBox="0 0 200 400" aria-hidden="true"><defs><linearGradient id="spg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a1d47"/><stop offset="1" stop-color="#2a1236"/></linearGradient></defs>'+
'<g fill="url(#spg)" stroke="rgba(255,160,200,.55)" stroke-width="1.5" stroke-linejoin="round">'+
'<path d="M57 104 Q42 150 40 196 Q39 214 42 226" fill="none" stroke="url(#spg)" stroke-width="15" stroke-linecap="round"/>'+
'<path d="M143 104 Q158 150 160 196 Q161 214 158 226" fill="none" stroke="url(#spg)" stroke-width="15" stroke-linecap="round"/>'+
'<path d="M86 220 Q80 300 86 390" fill="none" stroke="url(#spg)" stroke-width="24" stroke-linecap="round"/>'+
'<path d="M114 220 Q120 300 114 390" fill="none" stroke="url(#spg)" stroke-width="24" stroke-linecap="round"/>'+
'<path d="M72 90 Q100 82 128 90 Q146 94 147 108 Q146 138 138 152 Q130 178 133 200 Q138 220 128 232 L72 232 Q62 220 67 200 Q70 178 62 152 Q54 138 53 108 Q54 94 72 90 Z"/>'+
'<rect x="90" y="62" width="20" height="26" rx="8"/>'+
'<ellipse cx="100" cy="42" rx="21" ry="26"/></g></svg>';

/* ---------- UI ---------- */
function GAME_START(ctx){
  var me=ctx.me,isHost=!!ctx.isHost,partner=me==='host'?'guest':'host',names=ctx.names||{};
  var nm=function(r){return names[r]||(r==='host'?'Host':'Guest')};
  var root=ctx.root;root.innerHTML='';
  var st=document.createElement('style');st.textContent=CSS;root.appendChild(st);
  var wrap=document.createElement('div');wrap.className='sp';root.appendChild(wrap);
  var core=isHost?makeCore(ctx.seed,ctx.rng):null;
  var V=isHost?core.view('host'):null;
  var lastQ=-1,dead=false,ended=false,confirmEnd=false,hiTimer=null,totTimer=null,drafts={},lastKey='';
  var loc={key:''}; /* local, unsent UI state for the current card */

  function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
  function btn(label,cls,fn,dis){
    var b=el('button','sp-btn '+(cls||''),label);b.type='button';
    if(dis)b.disabled=true;else b.onclick=function(){if(!dead&&!ended)fn()};
    return b;
  }
  function curLoc(){
    var k=V.n+':'+V.cv;
    if(loc.key!==k)loc={key:k,hot:5,zone:null,side:'front',tot:[],fant:{},totStart:0,sent:false,revSide:false};
    return loc;
  }

  /* --- actions --- */
  function act(a){
    if(dead||ended||!V)return;
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
  function finish(rounds,heat,sync){
    if(ended)return;ended=true;stopTot();
    rounds=rounds|0;heat=(heat>=1&&heat<=3)?heat:1;sync=sync|0;
    renderSummary(rounds,heat,sync);
    ctx.end('Good night 😘',rounds+' round'+(rounds===1?'':'s')+', heat reached '+LV[heat]+' · Synced: '+sync+' match'+(sync===1?'':'es'));
  }
  function doEnd(){
    if(ended)return;
    var rounds=roundsPlayed(),heat=V?V.maxLvl:1,sync=V?V.sync:0;
    ctx.send({k:'end',rounds:rounds,heat:heat,sync:sync});
    finish(rounds,heat,sync);
  }
  function bestMoments(){
    var ms=(V&&V.moments)||[];
    var m=ms.filter(function(x){return x.k==='m'}),t=ms.filter(function(x){return x.k!=='m'});
    return m.slice(-4).concat(t.slice(-(6-Math.min(4,m.length)))).slice(0,6);
  }
  function momentText(x){return (x.w?nm(x.w)+' ':'')+x.x}
  function renderSummary(rounds,heat,sync){
    wrap.innerHTML='';
    var c=el('div','sp-box h'+heat);
    c.appendChild(el('div','sp-chip','OUR NIGHT 🌙'));
    c.appendChild(el('div','sp-text','Good night, '+nm('host')+' & '+nm('guest')+' 😘'));
    var s=el('div','sp-stats');
    [[rounds,'rounds'],[LVI[heat]+' '+LV[heat],'heat reached'],[sync,'synced matches']].forEach(function(p){
      var d=el('div','sp-stat');d.appendChild(el('b',null,String(p[0])));d.appendChild(el('small',null,p[1]));s.appendChild(d);
    });
    c.appendChild(s);
    var counts=(V&&V.counts)||{},parts=[];
    STYLES.forEach(function(k){if(counts[k])parts.push(SICON[k]+' '+SNAME[k]+' ×'+counts[k])});
    if(parts.length)c.appendChild(el('p','sp-sub',parts.join('  ·  ')));
    var best=bestMoments();
    if(best.length){
      c.appendChild(el('h3','sp-h','Best moments'));
      best.forEach(function(x){c.appendChild(bubble(x.k==='m'?'💞 match':'🔥 confession',momentText(x)))});
    }
    wrap.appendChild(c);
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
      e.preventDefault();if(dead||ended)return;
      var t=inp.value.trim();if(!t)return;
      delete drafts[key];inp.value='';onSend(t);
    });
    return f;
  }

  /* --- rendering --- */
  function render(){
    if(dead||ended)return;
    var ae=document.activeElement,keepName=null,selS=0,selE=0;
    if(ae&&ae.getAttribute&&wrap.contains(ae)&&ae.getAttribute('data-name')){
      keepName=ae.getAttribute('data-name');
      try{selS=ae.selectionStart;selE=ae.selectionEnd}catch(e){}
    }
    wrap.innerHTML='';
    wrap.appendChild(header());
    if(!V){wrap.appendChild(el('div','sp-box','Waiting for the game to start…'));return}
    if(V.phase==='lobby'){renderLobby();wrap.appendChild(endOnly())}
    else{renderRound();wrap.appendChild(footer())}
    syncTot();
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
      m.appendChild(el('span','sp-sync','💞 Synced: '+V.sync+' match'+(V.sync===1?'':'es')));
      m.appendChild(el('span','sp-heat',LVI[V.lvl]+' '+LV[V.lvl]+'  '+'🔥'.repeat(V.lvl)+'·'.repeat(3-V.lvl)));
    }
    h.appendChild(m);return h;
  }
  function renderLobby(){
    var c=el('div','sp-box');
    c.appendChild(el('h2',null,'Tonight’s heat'));
    c.appendChild(el('p','sp-sub','Nine ways to talk dirty — all just words, all optional, always consensual. Skip or ease off any card, anytime, no questions asked.'));
    var g=el('div','sp-lvls');
    for(var l=1;l<=3;l++)(function(l){
      var on=V.cfg.lvl===l,label=LVI[l]+' '+LV[l];
      if(isHost)g.appendChild(btn(label,on?'on':'off',function(){act({a:'cfg',lvl:l})}));
      else g.appendChild(el('div','sp-pill '+(on?'on':'off'),label));
    })(l);
    c.appendChild(g);
    var escTxt='Escalate: '+(V.cfg.esc?'On':'Off');
    if(isHost)c.appendChild(btn(escTxt,V.cfg.esc?'sel':'soft',function(){act({a:'cfg',esc:!V.cfg.esc})}));
    else c.appendChild(el('div','sp-pill '+(V.cfg.esc?'on':'off'),escTxt));
    c.appendChild(el('p','sp-sub','Escalate: the heat goes up one level every '+PERIOD+' rounds, up to Wild.'));
    c.appendChild(el('h3','sp-h','Games in play'));
    var sg=el('div','sp-stys');
    STYLES.forEach(function(k){
      var on=V.cfg.sty.indexOf(k)>=0,label=SICON[k]+' '+SNAME[k];
      if(isHost){var b=btn(label,'sp-sty '+(on?'on':'off'),function(){act({a:'cfg',sty:k})});b.setAttribute('aria-pressed',on?'true':'false');b.setAttribute('data-sty',k);sg.appendChild(b)}
      else sg.appendChild(el('div','sp-pill '+(on?'on':'off'),label));
    });
    c.appendChild(sg);
    if(isHost)c.appendChild(btn('Start the night 😈','sp-start',function(){act({a:'start'})}));
    else c.appendChild(el('p','sp-turn','Waiting for '+nm('host')+' to start…'));
    wrap.appendChild(c);
  }
  function actor(){return V.n%2===0?'host':'guest'}
  function ftext(raw){return fill(raw,V.type,V.n,names)}
  function waiting(txt){return el('p','sp-sub',txt)}
  function locked(){return waiting('Locked in 🔒 — waiting for '+nm(partner)+'…')}
  function bubble(who,text){var b=el('div','sp-bubble');b.appendChild(el('small',null,who));b.appendChild(document.createTextNode(text));return b}
  function readyBlock(c){
    var mine=V.ready[me];
    c.appendChild(btn(mine?'Waiting for '+nm(partner)+'…':'Ready for the next one 😈','sp-ready',function(){act({a:'ready'})},mine));
  }
  function iPicked(){return V.pick[me]!==null}

  function renderRound(){
    var A=actor(),O=A==='host'?'guest':'host',iAct=A===me,ph=V.phase,L=curLoc();
    var c=el('div','sp-box h'+V.lvl);
    c.appendChild(el('div','sp-chip',SICON[V.type]+' '+SNAME[V.type]));
    var turn='Both of you answer';
    switch(V.type){
      case 'truth':
        turn=iAct?'Your turn':nm(A)+'’s turn';
        c.appendChild(el('div','sp-text',ftext(V.card.raw)));
        if(ph==='respond'){
          if(iAct)c.appendChild(form('truth','Type your answer…','Send answer',500,function(t){act({a:'answer',text:t})}));
          else c.appendChild(waiting(nm(A)+' is typing an answer…'));
        }else{c.appendChild(bubble(nm(A),V.ans||''));readyBlock(c)}
        break;
      case 'nhie':
        c.appendChild(el('div','sp-text','Never have I ever '+ftext(V.card.raw)));
        if(ph==='pick'){
          if(!iPicked()){
            var pr=el('div','sp-row');
            pr.appendChild(btn('✅ I have','sp-pk',function(){act({a:'pick',v:'have'})}));
            pr.appendChild(btn('✋ I have not','sp-pk soft',function(){act({a:'pick',v:'not'})}));
            c.appendChild(pr);c.appendChild(waiting('Your answer stays secret until you both pick.'));
          }else c.appendChild(locked());
        }else{
          ['host','guest'].forEach(function(r){c.appendChild(bubble(nm(r),V.pick[r]==='have'?'✅ I have 😈':'✋ I have not 😇'))});
          var hb=V.pick.host==='have',gb=V.pick.guest==='have';
          c.appendChild(el('div','sp-res',hb&&gb?'Partners in crime 😈':(!hb&&!gb?'Clean slate… for now 😇':'Interesting… 👀')));
          if(!V.more){
            if(V.pick[partner]==='have')c.appendChild(btn('Tell me more','soft sp-more',function(){act({a:'more'})}));
          }else if(V.more.story===null){
            if(V.more.ask===me)c.appendChild(waiting(nm(partner)+' is typing the story…'));
            else{
              c.appendChild(waiting(nm(V.more.ask)+' wants to hear more. Tell the story:'));
              c.appendChild(form('story','Type the story…','Send story',600,function(t){act({a:'story',text:t})}));
            }
          }else c.appendChild(bubble(nm(V.more.ask===me?partner:me)+' tells more',V.more.story));
          readyBlock(c);
        }
        break;
      case 'wyr':{
        var opts=ftext(V.card.raw).split('|'),o=el('div','sp-opts');
        ['A','B'].forEach(function(K,i){
          var label=K+': '+opts[i];
          if(ph==='pick'&&!iPicked())o.appendChild(btn(label,'sp-opt '+(i?'alt':''),function(){act({a:'pick',v:K})}));
          else o.appendChild(btn(label,'sp-opt '+(V.pick[me]===K?'sel':'soft'),null,true));
        });
        c.appendChild(o);
        if(ph==='pick')c.appendChild(iPicked()?locked():waiting('Your pick stays secret until you both choose.'));
        else{
          ['host','guest'].forEach(function(r){c.appendChild(bubble(nm(r),'picked '+V.pick[r]+(V.reasons[r]?' — “'+V.reasons[r]+'”':'')))});
          c.appendChild(el('div','sp-res',V.pick.host===V.pick.guest?'Match! 💞':'Opposites attract'));
          if(V.reasons[me]===null)c.appendChild(form('reason','One line on why…','Send reason',300,function(t){act({a:'reason',text:t})}));
          readyBlock(c);
        }
        break;
      }
      case 'hot':
        c.appendChild(el('div','sp-text','“'+ftext(V.card.raw)+'”'));
        if(ph==='pick'){
          if(!iPicked()){
            var sl=el('div','sp-slider'),rv=el('div','sp-rv',String(L.hot));
            var rg=document.createElement('input');rg.type='range';rg.min='1';rg.max='10';rg.step='1';rg.value=String(L.hot);rg.className='sp-range';
            rg.addEventListener('input',function(){L.hot=Math.max(1,Math.min(10,parseInt(rg.value,10)||5));rv.textContent=String(L.hot)});
            sl.appendChild(rv);sl.appendChild(rg);
            var sc=el('div','sp-scale');sc.appendChild(el('span',null,'1 · not for me'));sc.appendChild(el('span',null,'10 · yes please'));sl.appendChild(sc);
            c.appendChild(sl);
            c.appendChild(btn('Lock in my rating','sp-lock',function(){act({a:'pick',v:L.hot})}));
          }else c.appendChild(locked());
        }else{
          var bars=el('div','sp-bars');
          ['host','guest'].forEach(function(r){
            bars.appendChild(el('b',null,nm(r)));
            var bar=el('div','sp-bar'),i=el('i');i.style.width=(V.pick[r]*10)+'%';bar.appendChild(i);bars.appendChild(bar);
            bars.appendChild(el('b',null,V.pick[r]+'/10'));
          });
          c.appendChild(bars);
          var gap=V.res?V.res.gap:Math.abs(V.pick.host-V.pick.guest);
          c.appendChild(el('div','sp-gap','Gap: '+gap+(gap===0?' — same wavelength':'')));
          c.appendChild(el('div','sp-res',gap===0?'Perfect sync! 💞':gap<=1?'So in sync 💞':gap<=4?'Close enough 😏':'Let’s talk about that 👀'));
          readyBlock(c);
        }
        break;
      case 'guess':{
        var g=V.card.raw.split('|');
        turn=iAct?'You answer, '+nm(O)+' guesses':nm(A)+' answers, you guess';
        c.appendChild(el('div','sp-text',g[0]));
        if(ph==='pick'){
          if(!iPicked()){
            c.appendChild(waiting(iAct?'Answer honestly — '+nm(O)+' will try to guess.':'Guess what '+nm(A)+' picked.'));
            var gl=el('div','sp-ga-list');
            for(var gi=0;gi<4;gi++)(function(gi){gl.appendChild(btn(g[gi+1],'sp-ga '+(gi%2?'alt':''),function(){act({a:'pick',v:gi})}))})(gi);
            c.appendChild(gl);
          }else c.appendChild(locked());
        }else{
          c.appendChild(bubble(nm(A)+' answered',g[1+V.pick[A]]));
          c.appendChild(bubble(nm(O)+' guessed',g[1+V.pick[O]]));
          c.appendChild(el('div','sp-res',V.pick[A]===V.pick[O]?'Mind reader! 🔮 +1':'Not quite 😏'));
          readyBlock(c);
        }
        break;
      }
      case 'finish':{
        var starter=ftext(V.card.raw);
        c.appendChild(el('div','sp-text',starter));
        if(ph==='pick'){
          if(!iPicked())c.appendChild(form('finish','Finish it…','Send',200,function(t){act({a:'pick',v:t})}));
          else c.appendChild(locked());
        }else{
          var base=starter.replace(/\.\.\.$|…$/,'');
          ['host','guest'].forEach(function(r){c.appendChild(bubble(nm(r),base+' '+V.pick[r]))});
          readyBlock(c);
        }
        break;
      }
      case 'tot':{
        var items=V.card.items;
        if(ph==='pick'){
          if(!iPicked()&&!L.sent){
            var idx=L.tot.length,pair=items[idx].split('|');
            c.appendChild(el('div','sp-tt-time',secsLeft(L)+'s'));
            c.appendChild(waiting('Quick! '+(idx+1)+' of '+TOT_N));
            var pp=el('div','sp-tt-pair');
            ['A','B'].forEach(function(K,i){pp.appendChild(btn(pair[i],'sp-tt '+(i?'alt':''),function(){totPick(K)}))});
            c.appendChild(pp);
          }else c.appendChild(locked());
        }else{
          var rows=el('div','sp-tt-rows');
          items.forEach(function(it,i){
            var p=it.split('|'),h=V.pick.host[i],gq=V.pick.guest[i],ok=h&&h===gq;
            var row=el('div','sp-tt-row'+(ok?' ok':''));
            row.appendChild(el('span',null,p[0]+' / '+p[1]));
            var lab=function(v){return v?p[v==='A'?0:1]:'⏱️'};
            row.appendChild(el('span',null,nm('host')+': '+lab(h)+' · '+nm('guest')+': '+lab(gq)+(ok?' 💞':'')));
            rows.appendChild(row);
          });
          c.appendChild(rows);
          var m=V.res?V.res.m:0;
          c.appendChild(el('div','sp-res','Synced '+m+'/'+TOT_N+(m===TOT_N?' — soulmates 💞':'')));
          readyBlock(c);
        }
        break;
      }
      case 'body':
        turn=iAct?'You tap, '+nm(O)+' guesses':nm(A)+' taps, you guess';
        c.appendChild(el('div','sp-text',ftext(V.card.raw)));
        renderBody(c,A,O,iAct,L);
        break;
      case 'fantasy':
        turn=nm(A)+' narrates this one';
        renderFantasy(c,A,iAct,L);
        break;
    }
    wrap.appendChild(c);
    wrap.appendChild(el('div','sp-turn',turn));
    wrap.appendChild(el('div','sp-note',V.note||''));
  }

  function renderBody(c,A,O,iAct,L){
    var ph=V.phase,pickMode=ph==='pick'&&!iPicked();
    if(ph==='reveal'&&!L.revSide){L.revSide=true;var tz=ZMAP[V.pick[A]];if(tz)L.side=tz.s==='f'?'front':'back'}
    if(ph==='pick')c.appendChild(waiting(pickMode?(iAct?'Tap your answer secretly — '+nm(O)+' will guess.':'Where did '+nm(A)+' tap? Make your guess.'):''));
    var fig=el('div','sp-body');fig.innerHTML=SILHOUETTE;
    var side=L.side==='back'?'b':'f';
    ZONES.forEach(function(z){
      var b=el('button','sp-zone');b.type='button';b.setAttribute('data-zone',z.id);b.setAttribute('aria-label',z.l);b.title=z.l;
      b.appendChild(el('span',null,z.l));
      b.style.left=(z.x/2)+'%';b.style.top=(z.y/4)+'%';
      if(z.s!==side)b.hidden=true;
      if(pickMode){
        if(L.zone===z.id)b.className+=' sel';
        b.onclick=function(){if(dead||ended)return;L.zone=z.id;render()};
      }else{
        b.disabled=true;
        if(ph!=='pick'){if(V.pick[A]===z.id)b.className+=' pin-a';if(V.pick[O]===z.id)b.className+=' pin-b'}
        else if(V.pick[me]===z.id)b.className+=' sel';
      }
      fig.appendChild(b);
    });
    c.appendChild(fig);
    c.appendChild(btn(L.side==='back'?'↻ Show front':'↻ Turn around','soft sp-flip',function(){L.side=L.side==='back'?'front':'back';render()}));
    if(ph==='pick'){
      if(pickMode)c.appendChild(btn(L.zone?'Lock in: '+ZMAP[L.zone].l+' 📍':'Tap a spot first','sp-lock',function(){act({a:'pick',v:L.zone})},!L.zone));
      else c.appendChild(locked());
    }else{
      var lg=el('div','sp-legend');
      var la=el('span');la.appendChild(el('b'));la.firstChild.style.background='#ff2e63';la.appendChild(document.createTextNode(nm(A)+': '+ZMAP[V.pick[A]].l));
      var lb=el('span');lb.appendChild(el('b'));lb.firstChild.style.background='#9b6bff';lb.appendChild(document.createTextNode(nm(O)+' guessed: '+ZMAP[V.pick[O]].l));
      lg.appendChild(la);lg.appendChild(lb);c.appendChild(lg);
      c.appendChild(el('div','sp-res',V.pick[A]===V.pick[O]?'Found the spot! 💞 +1':'So close… now you know 😏'));
      readyBlock(c);
    }
  }
  function renderFantasy(c,A,iAct,L){
    var ph=V.phase,R=V.card.reels;
    if(ph==='pick'){
      if(!iPicked()){
        c.appendChild(el('div','sp-text','Build tonight’s fantasy'));
        c.appendChild(waiting('Secretly pick one from each reel. Where you agree, it’s locked in ✨ — otherwise fate decides.'));
        var rs=el('div','sp-reels');
        REELS.forEach(function(r){
          var col=el('div','sp-reel');col.appendChild(el('h4',null,RNAME[r]));
          R[r].forEach(function(txt,i){
            var b=btn(txt,'sp-reel-opt '+(L.fant[r]===i?'sel':'soft'),function(){L.fant[r]=i;render()});
            b.setAttribute('data-reel',r);col.appendChild(b);
          });
          rs.appendChild(col);
        });
        c.appendChild(rs);
        var row=el('div','sp-row');
        row.appendChild(btn('Surprise me 🎲','soft sp-roll',function(){
          REELS.forEach(function(r){if(L.fant[r]===undefined)L.fant[r]=Math.floor(Math.random()*3)});render();
        }));
        var full=REELS.every(function(r){return L.fant[r]!==undefined});
        row.appendChild(btn('Lock in my fantasy','sp-lock',function(){act({a:'pick',v:{setting:L.fant.setting,mood:L.fant.mood,role:L.fant.role}})},!full));
        c.appendChild(row);
      }else{c.appendChild(el('div','sp-text','Fantasy reels spinning…'));c.appendChild(locked())}
      return;
    }
    var res=V.res||{};
    var story=el('div','sp-story');
    REELS.forEach(function(r){
      var line=el('div');line.appendChild(el('b',null,RNAME[r]+': '));line.appendChild(document.createTextNode(res[r]+(res[r+'M']?' ✨':'')));story.appendChild(line);
    });
    c.appendChild(story);
    c.appendChild(waiting('Matched reels: '+(res.matched||0)+'/3'));
    if(ph==='respond'){
      if(iAct){
        c.appendChild(waiting('Your turn to narrate — type the opening of this fantasy, as hot as tonight’s heat.'));
        c.appendChild(form('fantasy','Once upon a very naughty time…','Tell it',900,function(t){act({a:'answer',text:t})}));
      }else c.appendChild(waiting(nm(A)+' is writing your fantasy…'));
    }else{c.appendChild(bubble(nm(A)+' narrates',V.ans||''));readyBlock(c)}
  }

  /* --- this-or-that local timer --- */
  function secsLeft(L){if(!L.totStart)L.totStart=Date.now();return Math.max(0,Math.ceil(TOT_SECS-(Date.now()-L.totStart)/1000))}
  function totPick(K){
    var L=curLoc();if(L.sent)return;
    L.tot.push(K);
    if(L.tot.length>=TOT_N)submitTot();else render();
  }
  function submitTot(){
    var L=curLoc();if(L.sent)return;L.sent=true;
    var arr=[];for(var i=0;i<TOT_N;i++)arr.push(L.tot[i]||null);
    stopTot();act({a:'pick',v:arr});render();
  }
  function stopTot(){if(totTimer){clearInterval(totTimer);totTimer=null}}
  function syncTot(){
    var need=V&&V.type==='tot'&&V.phase==='pick'&&!iPicked()&&!curLoc().sent;
    if(!need){stopTot();return}
    if(totTimer)return;
    totTimer=setInterval(function(){
      if(dead||ended||!V||V.type!=='tot'||V.phase!=='pick'){stopTot();return}
      var L=curLoc(),s=secsLeft(L),t=wrap.querySelector('.sp-tt-time');
      if(t)t.textContent=s+'s';
      if(s<=0)submitTot();
    },250);
  }

  function footer(){
    var f=el('div','sp-foot');
    var live=V.phase==='pick'||V.phase==='respond';
    var sk=btn('Skip (no penalty)','soft',function(){act({a:'skip'})},!live);sk.id='sp-skip';
    var pz=btn('Pause / too much','soft',function(){act({a:'pause'})},!live);pz.id='sp-pause';
    f.appendChild(sk);f.appendChild(pz);f.appendChild(endBtn());
    var w=el('div');w.style.width='100%';f.appendChild(w);
    if(confirmEnd)w.appendChild(endConfirm());
    return f;
  }
  function endBtn(){var e=btn('End the night','soft',function(){confirmEnd=true;render()});e.id='sp-end';return e}
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
    if(d.k==='end'){finish(d.rounds,d.heat,d.sync);return}
    if(ended)return;
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
    destroy:function(){dead=true;stopTot();if(hiTimer){clearInterval(hiTimer);hiTimer=null}},
    _core:core
  };
}

registerGame({
  id:'spicy',icon:'🌶️',name:'Spicy Nights',
  blurb:'Nine flirty-to-wild couples’ games: truths, hot takes, body map, fantasy builder and more. Words only, always consensual.',
  start:GAME_START,
  _t:{BANK:BANK,makeCore:makeCore,levelFor:levelFor,fill:fill,validPick:validPick,ZONES:ZONES,STYLES:STYLES,TOT_N:TOT_N}
});
})();
