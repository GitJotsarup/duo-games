/* Desire Match - 2 players, adult couples' "swipe in private, reveal only the overlaps" game. Plugin for Duo Games.
   Each player answers the same shuffled stack of ideas (Yes / Maybe / No). Answers are only sent to the partner once
   a player has finished; the reveal shows ONLY cards where neither said No. Nothing about a No is ever rendered. */
(function(){
'use strict';

/* ---------- idea bank: CATS x 3 heat levels ---------- */
var CATS=[
 {id:'sweet',name:'Sweet & Sensual',icon:'🕯️'},
 {id:'talk',name:'Dirty Talk',icon:'👄'},
 {id:'role',name:'Roleplay',icon:'🎭'},
 {id:'play',name:'Playful Games',icon:'🎲'},
 {id:'place',name:'Places & Settings',icon:'🏨'},
 {id:'far',name:'Long-distance & Texting',icon:'📱'},
 {id:'pos',name:'Positions',icon:'🛏️'}
];
var LV=['','Flirty','Spicy','Wild'],LVI=['','💋','🔥','😈'];
var RAW={
sweet:{
1:["I'd love to share a long, slow kiss with no hurry at all.",
"Try slow dancing with {p} in the living room, just us.",
"I'd love to be cuddled for an hour with nothing else planned.",
"Try kissing {p} softly all along the neck and shoulders.",
"I'd love a lazy back-and-forth shoulder massage.",
"Try holding each other in silence and just breathing together.",
"I'd love to be woken with gentle kisses.",
"Try feeding each other strawberries by candlelight.",
"I'd love to trace slow patterns on {p}'s skin with my fingertips."],
2:["I'd love a full-body massage with warm oil, no rush.",
"Try showering together and washing each other slowly.",
"I'd love to undress {p} one button at a time.",
"Try making out for a long time before anything else happens.",
"I'd love to be kissed slowly from the ear down to the collarbone.",
"Try a candlelit bath together with music playing.",
"I'd love to spend an evening focused only on {p}'s pleasure.",
"Try kissing every part of {p}'s body except the obvious ones, first.",
"I'd love to be pinned gently against the wall for a deep kiss."],
3:["I'd love an entire evening of slow, tender foreplay with a very long build-up.",
"Try worshipping {p}'s body with my mouth for as long as they like.",
"I'd love for {p} to spend an hour focusing only on pleasing me.",
"Try an oil massage that gets steadily more intimate, all the way to the end.",
"I'd love to be kissed all over until I'm begging for more.",
"Try making love slowly and eye-to-eye, with no words at all.",
"I'd love a shower together that turns into something much hotter.",
"Try taking turns pleasing each other for as long as each of us wants.",
"I'd love to fall asleep skin to skin after the most intense night ever."]},
talk:{
1:["I'd love to whisper something flirty in {p}'s ear in public.",
"Try telling {p} three things I find irresistible about them.",
"I'd love to hear {p} say what they like about my body.",
"Try complimenting {p} in a low, slow voice.",
"I'd love to be told exactly what {p} thought when they first saw me.",
"Try whispering good morning in the sexiest voice I have.",
"I'd love to share what turns me on, one thing each, taking turns.",
"Try giving {p} a pet name that only we use.",
"I'd love to hear {p} say my name like they mean it."],
2:["I'd love to hear {p} describe what they want to do to me tonight.",
"Try whispering what I want from {p} while we're out at dinner.",
"I'd love to tell {p} in detail what I love about the way they touch me.",
"Try narrating what I'm doing to {p} as I do it.",
"I'd love to be teased with words until I can't wait any more.",
"Try telling {p} my favourite fantasy in a low voice.",
"I'd love to hear {p} say how much they need me.",
"Try naming three of my biggest turn-ons out loud, honestly.",
"I'd love for {p} to describe, in detail, how they'd undress me."],
3:["I'd love to hear {p} talk dirty to me the whole time.",
"Try telling {p} exactly what I want them to do, step by step.",
"I'd love to be told exactly what to do, in a commanding voice.",
"Try begging {p} playfully for what I want.",
"I'd love to hear {p} beg me, playfully, for what they want.",
"Try describing to {p} what I'd do if I had them for a whole hour.",
"I'd love to say filthy things out loud that I'm usually too shy to say.",
"Try a game where we only communicate in explicit whispers.",
"I'd love to hear {p} moan my name while telling me what feels good."]},
role:{
1:["I'd love to pretend we're strangers meeting at a hotel bar.",
"Try a first-date roleplay, where we flirt like we've just met.",
"I'd love to play a charming stranger who chats {p} up on a train.",
"Try pretending we're on a secret romantic getaway.",
"I'd love to dress up for a fancy fake date as someone else.",
"Try a mystery-admirer game, with notes left around the house.",
"I'd love to play old flames meeting again after years apart.",
"Try a movie-star and fan scenario with lots of flirting.",
"I'd love to invent fake names and a backstory for one evening."],
2:["I'd love a boss-and-assistant after-hours scenario, adults only.",
"Try a massage therapist scenario that goes beyond professional.",
"I'd love to be seduced by a stranger at a bar who won't give up.",
"Try a hotel-guest and room-service fantasy.",
"I'd love a teacher-and-night-class-student scenario, both clearly adults.",
"Try a scenario where we pretend to be on a first date that gets steamy.",
"I'd love to play rival colleagues who finally give in to the tension.",
"Try a bodyguard-and-client roleplay with lots of slow tension.",
"I'd love to play a mysterious stranger who takes control of the evening."],
3:["I'd love to act out a detailed fantasy scene we've agreed on in advance.",
"Try a strict-boss scenario with a clear safeword and clear limits.",
"I'd love to write a script for a steamy scene together and then perform it.",
"Try swapping who is in charge halfway through a roleplay.",
"I'd love to play a seductive stranger who takes over the whole night.",
"Try a captive-and-captor fantasy where we both choose and control every part.",
"I'd love a hotel fantasy with costumes, a script and a safeword.",
"Try a scenario where one of us is in charge and the other must follow orders, by agreement.",
"I'd love to try a rock-star and backstage-fan scene, fully explicit."]},
play:{
1:["I'd love to play a game where each wrong answer means a kiss.",
"Try a card game where the loser gives a massage.",
"I'd love to play truth-or-dare with only flirty questions.",
"Try a staring contest that ends in a make-out.",
"I'd love to try a spicy scavenger hunt around the house.",
"Try blindfolding {p} and feeding them surprise snacks.",
"I'd love to play a game of rolling dice for kisses.",
"Try a tickle-and-tease game with no losers.",
"I'd love to write our own dares on slips of paper and draw them."],
2:["I'd love to play strip poker, or any strip game.",
"Try a dice game with an action on one die and a body part on the other.",
"I'd love a truth-or-dare in bed with turn-on questions.",
"Try a blindfold game where {p} has to guess where I'm kissing.",
"I'd love to be teased with an ice cube along my skin.",
"Try a game where whoever speaks first loses and has to obey.",
"I'd love a game of 'who can resist longest' with no touching allowed.",
"Try a hot-and-cold game where I guide {p} with whispers.",
"I'd love to play a spicy board game with a forfeit for every lost turn."],
3:["I'd love to play an edging game where the winner decides when it ends.",
"Try tying {p}'s wrists loosely with a silk scarf, by agreement.",
"I'd love to try a game where one of us has to stay completely still.",
"Try a dice game of explicit actions with a safeword on the table.",
"I'd love to try wax play with proper safe candles.",
"Try a teasing game with a feather, ice and lips, blindfolded.",
"I'd love a game where the loser has to follow every command for ten minutes.",
"Try a toy-based game that we both agreed on in advance.",
"I'd love to try a game of denial, where the build-up is the whole point."]},
place:{
1:["I'd love to cuddle on the couch during a movie we won't watch.",
"Try a candlelit dinner at home, just the two of us.",
"I'd love to kiss under the stars somewhere quiet.",
"Try an evening in a hotel, just for the two of us.",
"I'd love to share a kiss in the kitchen while cooking together.",
"Try a picnic blanket on a private bit of lawn.",
"I'd love to spend a rainy day under the covers.",
"Try kissing in the car before we go inside.",
"I'd love a weekend away with no plans but each other."],
2:["I'd love to spend a whole day in bed together.",
"Try a steamy session in the kitchen, with the dinner burning.",
"I'd love to make out in the car like teenagers.",
"Try a mirror in the bedroom, so we can watch each other.",
"I'd love a hotel room with a view and the curtains open a bit.",
"Try a private spot outdoors, just us, nobody around.",
"I'd love to fool around on the living room floor.",
"Try the shower, with the water running hot.",
"I'd love a night in a fancy hotel suite with room service."],
3:["I'd love to have a hotel weekend where we never leave the room.",
"Try a mirror-facing session, where we watch every detail.",
"I'd love an outdoor adventure in a place that is completely private.",
"Try the kitchen counter, no clothes and no plans.",
"I'd love to spend an entire weekend in bed, only getting up for food.",
"Try a late-night drive to somewhere secluded and private.",
"I'd love to try a different room of the house every night for a week.",
"Try a private hot tub or sauna session, very much unclothed.",
"I'd love a night where every room of the house is fair game."]},
far:{
1:["I'd love to get a good-morning voice note that makes me smile.",
"Try sending {p} a flirty selfie with no dress code.",
"I'd love to get a handwritten love letter in the mail.",
"Try a video call where we cook the same meal together.",
"I'd love to get random 'thinking of you' texts all day.",
"Try watching a film together over a call, with lots of commentary.",
"I'd love to share a playlist that reminds me of {p}.",
"Try sending a postcard with something a little cheeky on the back.",
"I'd love to get a text that just says what {p} would do if they were here."],
2:["I'd love a steamy text conversation in the middle of the day.",
"Try sending {p} a voice note whispered in my sexiest voice.",
"I'd love to read a steamy letter or email from {p}.",
"Try a scheduled video call with only flirty talk, nobody has to show anything.",
"I'd love to describe my day in the sexiest way possible, over a call.",
"Try a teasing text countdown to when we next see each other.",
"I'd love to get a message telling me exactly what I'm in for next time.",
"Try writing a short steamy story for {p}, with them as the star.",
"I'd love to hear {p} describe what they're wearing, or not, over the phone."],
3:["I'd love phone sex, with a long, slow build-up.",
"Try a sexting session that goes on for hours, as explicit as we like.",
"I'd love to send {p} a voice note describing what I'd do to them in detail.",
"Try a video call where we guide each other with words only.",
"I'd love an explicit steamy email that arrives right before a date.",
"Try a long-distance game where we take turns giving each other orders, to follow in private.",
"I'd love a scheduled late-night call where anything goes, and each can say stop.",
"Try writing an explicit fantasy together by text, a line at a time.",
"I'd love to try a video call where we both do whatever we're comfortable with."]}
};

/* more ideas: aftercare & cuddles, foreplay, toys, games & challenges, mornings/showers/quickies,
   long-distance, dirty-talk lines and light kinks (always agreed in advance, with a safeword). Appended per level. */
var MORE={
sweet:{
1:["I'd love a long cuddle with our legs tangled after a long day.",
"Try a morning in bed with coffee, kisses and no alarms.",
"I'd love to brush {p}'s hair slowly while we talk.",
"Try a foot rub on the couch while we catch up.",
"I'd love to fall asleep spooning {p}.",
"Try a lazy kiss in the doorway before one of us leaves.",
"I'd love to read to each other in bed by lamplight.",
"Try a warm bath where we just hold each other.",
"I'd love a slow forehead-to-forehead moment with our eyes closed.",
"Try kissing {p}'s hands and wrists, one finger at a time.",
"I'd love to hug {p} from behind while they're cooking."],
2:["I'd love to be kissed awake and pulled back under the covers.",
"Try an extra-long foreplay session with a strict no-rushing rule.",
"I'd love a massage with warm oil that ends wherever we like.",
"Try a sensual shower where we take turns soaping each other.",
"I'd love to kiss slowly all the way down {p}'s spine.",
"Try lingering kisses on the inner thighs before anything else.",
"I'd love to feel {p}'s breath on my neck while we cuddle.",
"Try a quiet, slow morning session before getting up.",
"I'd love to undress each other by candlelight with music on.",
"Try a long aftercare cuddle with water, snacks and soft talk.",
"I'd love a sensual dance that slowly loses the clothes."],
3:["I'd love a slow morning quickie before the alarm goes off.",
"Try an all-evening tease with oil and kisses, and no finish until we both say so.",
"I'd love to be pleasured slowly with lips and hands until I melt.",
"Try a shower quickie against the cool tiles.",
"I'd love to take turns being completely pampered and pleasured, twenty minutes each.",
"Try slow oral foreplay with no time limit at all.",
"I'd love a full aftercare ritual after a wild night: bath, cuddles, whispered praise.",
"Try a massage-oil night that covers absolutely every inch.",
"I'd love to stay joined and still for a while, just feeling each other.",
"Try a slow, intimate night with a vibrator added for extra pleasure.",
"I'd love to be held tightly and told how good I was afterwards."]},
talk:{
1:["I'd love to hear {p} tell me what they daydream about.",
"Try telling {p} one thing I'd love to do with them this weekend.",
"I'd love to whisper 'I want you' when {p} least expects it.",
"Try a compliment battle: whoever runs out first owes a kiss.",
"I'd love to hear what {p} finds sexiest about my voice.",
"Try saying 'come here' in a way that leaves no doubt.",
"I'd love to tell {p} which outfit of theirs drives me crazy.",
"Try describing our best kiss ever to each other.",
"I'd love to share my favourite swoon-worthy memory of {p}.",
"Try a slow, flirty phone call where we only say nice things.",
"I'd love to hear {p} tell me I look good, out of nowhere."],
2:["I'd love to whisper 'I can't stop thinking about tonight' at dinner.",
"Try describing exactly where I want to be kissed next.",
"I'd love to hear {p} say 'don't stop' and mean it.",
"Try telling {p} what I was imagining the last time I zoned out.",
"I'd love to talk through a fantasy while we cuddle in bed.",
"Try a rule where we have to say out loud what feels good.",
"I'd love to hear {p} tell me what they want, in their best low voice.",
"Try reading a list of 'things I want to do to you' aloud.",
"I'd love to whisper teasing promises all evening at a party.",
"Try describing how {p} looked the last time they really turned me on.",
"I'd love to hear {p} admit their most secret turn-on."],
3:["I'd love to hear {p} tell me exactly how good I feel, in explicit words.",
"Try giving {p} instructions in a firm voice, with a safeword agreed.",
"I'd love to be called something naughty that we've agreed on beforehand.",
"Try narrating a filthy fantasy while we touch.",
"I'd love to hear {p} describe what they're going to do to me, then do it.",
"Try praise talk: telling each other how good we are, in detail.",
"I'd love to say exactly what I want without blushing.",
"Try a 'yes, please' game where the only allowed answers are enthusiastic ones.",
"I'd love to hear {p} count me down to the finish.",
"Try describing our wildest night together while it happens again.",
"I'd love to whisper my filthiest fantasy right before we start."]},
role:{
1:["I'd love to play waiter and diner at a candlelit dinner at home.",
"Try a secret-agent date where we pass coded flirty notes.",
"I'd love to pretend we're on our honeymoon for a night.",
"Try playing tourists who meet at a café and fall for each other.",
"I'd love to dress up in matching costumes for a cheeky night in.",
"Try a pirate-steals-a-heart game, all flirting and no plot needed.",
"I'd love to play a shy bookworm being charmed by {p}.",
"Try a meet-cute do-over where we pretend it's our first meeting.",
"I'd love a masquerade night at home with masks and slow dancing.",
"Try role-playing a celebrity interview that gets flirty.",
"I'd love to play a lifeguard who rescues {p}, very dramatically."],
2:["I'd love a costume night with outfits we choose for each other.",
"Try a photographer-and-model scenario with lots of posing.",
"I'd love a doctor's check-up roleplay between two consenting adults.",
"Try a police-officer-and-suspect game with fluffy handcuffs and a safeword.",
"I'd love a pool-cleaner or housekeeper scenario with a cheeky twist.",
"Try a dance-teacher-and-student scenario that gets very hands-on.",
"I'd love to play a royal and their devoted servant for an evening.",
"Try a strangers-on-a-blind-date scenario that ends at home.",
"I'd love a late-night intruder fantasy that's all flirting, fully scripted and agreed beforehand.",
"Try a cowboy or cowgirl night with hats and plenty of swagger.",
"I'd love to play a seductive spy interrogating {p} with kisses."],
3:["I'd love to try a dominant/submissive scene with agreed limits and a safeword.",
"Try light spanking as part of a roleplay we both agreed on.",
"I'd love to wear a costume {p} chose and stay in character all night.",
"Try a 'yes, sir / yes, ma'am' scene with clear check-ins.",
"I'd love a master-and-servant fantasy with every rule agreed in advance.",
"Try a scene where one partner is restrained with soft cuffs and fully pampered.",
"I'd love to be ordered around in bed, with a safeword I can use anytime.",
"Try a strip-tease audition where the 'judge' gives explicit feedback.",
"I'd love a pleasure-servant roleplay where my only job is pleasing {p}.",
"Try a scene where the roles switch on a code word.",
"I'd love a fully explicit fantasy with costumes, props and a script we wrote together."]},
play:{
1:["I'd love to play twenty questions where every answer earns a kiss.",
"Try a kissing challenge: who can kiss the longest without laughing.",
"I'd love a pillow fight that turns into a make-out.",
"Try a game of never-have-I-ever with only cheeky questions.",
"I'd love a game of hide and seek with a kiss for the finder.",
"Try a slow-dance challenge where each song we get a little closer.",
"I'd love to play spin the bottle, just the two of us.",
"Try a compliment jar that we pick from every night.",
"I'd love a cheeky would-you-rather session in bed.",
"Try massage roulette: spin to choose which body part gets attention.",
"I'd love to draw a new dare card every night for a week."],
2:["I'd love to try massage oil and a set of warm massage stones.",
"Try a vibrator during foreplay, controlled by {p}.",
"I'd love a game of Simon Says with steamy commands.",
"Try a dare jar filled only with spicy dares.",
"I'd love a card game where every lost round removes a layer.",
"Try a 'don't make a sound' challenge while the other one teases.",
"I'd love to be blindfolded and guess what flavour {p} is kissing me with.",
"Try a timed make-out with a hands-behind-your-back rule.",
"I'd love a sexy coupon book we can redeem whenever we like.",
"Try a remote-controlled toy on a date night at home.",
"I'd love a game where we rate each other's moves out loud."],
3:["I'd love to try a couples' vibrator together.",
"Try soft restraints and a feather for a slow teasing session.",
"I'd love to try a toy {p} chooses for me, with a stop word on hand.",
"Try an orgasm-control game with clear rules and lots of check-ins.",
"I'd love to try light spanking to see if we like it.",
"Try a 'first to finish loses' challenge.",
"I'd love a toy-shopping trip together, then trying out the haul.",
"Try a quiz where every wrong answer earns a gentle swat, by agreement.",
"I'd love to tease {p} with a wand toy while they try to stay still.",
"Try a blindfold, a vibrator and agreed signals for 'more' and 'stop'.",
"I'd love a night of taking turns with every toy we own."]},
place:{
1:["I'd love a sunset kiss on a balcony.",
"Try a blanket fort in the living room with fairy lights.",
"I'd love a cosy cabin weekend with a fireplace.",
"Try kissing in a photo booth.",
"I'd love a rooftop date with wine and a view.",
"Try a slow dance in the garden at night.",
"I'd love to cuddle in a hammock together.",
"Try a dinner date at home with a dress code.",
"I'd love a lazy Sunday morning in bed with pastries.",
"Try a candlelit bath with rose petals.",
"I'd love a stolen kiss in a quiet corner at a party."],
2:["I'd love to fool around on the couch with the lights off.",
"Try a cabin weekend spent mostly in front of the fire.",
"I'd love a steamy session on a balcony that is completely private.",
"Try the bathtub, with bubbles and no rush.",
"I'd love to make out in a private hot tub.",
"Try the dining table after dessert.",
"I'd love a quickie before we head out to a party.",
"Try the stairs, carefully and laughing.",
"I'd love a tent under the stars, somewhere secluded and private.",
"Try a staycation in a themed hotel room.",
"I'd love a morning quickie before work, short and sweet."],
3:["I'd love to try the desk or work table at home.",
"Try a full-length mirror and the lights on bright.",
"I'd love a shower session with a detachable showerhead.",
"Try sitting on the washing machine on its spin cycle.",
"I'd love a weekend in a cabin with a private hot tub and no clothes.",
"Try a sneaky quickie in a locked bathroom at our own house party.",
"I'd love a poolside session at a completely private holiday villa.",
"Try a beach-house getaway where we christen every room.",
"I'd love an armchair session with {p} on my lap.",
"Try the hallway, against the wall, the second we get home.",
"I'd love a candlelit floor session on a pile of cushions and blankets."]},
far:{
1:["I'd love a goodnight voice note every night we're apart.",
"Try a long-distance date where we watch the same sunset on a call.",
"I'd love a care package with something that smells like {p}.",
"Try writing each other old-fashioned love letters.",
"I'd love a surprise flirty text in the middle of a boring meeting.",
"Try playing an online game together, with flirty stakes.",
"I'd love to fall asleep on a call together.",
"Try a countdown calendar to our next visit.",
"I'd love a playlist swap with notes about each song.",
"Try sending a photo of something that reminded me of {p}.",
"I'd love a 'what are you wearing?' text, just for fun."],
2:["I'd love a late-night text conversation that gets steamier as it goes.",
"Try a voice note describing the last time we were together.",
"I'd love a steamy text right before I fall asleep.",
"Try a sexting game where each message has to be bolder than the last.",
"I'd love to hear {p}'s voice whispering on the phone in the dark.",
"Try a long-distance date with matching outfits and flirty talk only.",
"I'd love a teasing email with the subject line 'Read this alone'.",
"Try sending a list of things I'll do on our next visit.",
"I'd love a voice note of {p} reading a steamy passage from a book.",
"Try a flirty texting rule: one compliment every hour, all day.",
"I'd love an outfit-reveal call where we each choose what to show, or nothing at all."],
3:["I'd love to try an app-controlled toy that {p} controls from afar.",
"Try an explicit voice note for me to listen to in private.",
"I'd love a mutual-pleasure call where we talk each other through it.",
"Try an erotic story written just for me and sent at midnight.",
"I'd love to send {p} explicit instructions to follow before our call.",
"Try a sexting session about exactly what happens on our next visit.",
"I'd love to hear {p} finish over the phone.",
"Try a long-distance tease: messages all day, a call at night.",
"I'd love to record a steamy audio of what I'd whisper in {p}'s ear.",
"Try writing our next-visit fantasy together in a shared document.",
"I'd love a call where we each describe our fantasy in detail, no camera needed."]}
};

/* Positions: 'Name|one-line, non-graphic setup|tags'. Text only. */
RAW.pos={
1:["Missionary|Face to face, one partner on top; close, simple and easy to kiss.|intimate,eye-contact",
"Spooning|Both on your sides, one behind the other; cosy, slow and relaxed.|lazy-day,intimate",
"Cowgirl / Cowboy|One partner on top, sitting upright and setting the pace.|eye-contact",
"Lotus|Face to face and seated, legs wrapped around each other; slow and intimate.|intimate,eye-contact",
"Face-to-Face Side-Lying|Lying on your sides facing each other; gentle, unhurried and close.|lazy-day,eye-contact,intimate",
"Coital Alignment|Missionary with the top partner shifted higher, grinding rather than thrusting; a slow, close rhythm.|intimate,eye-contact",
"Lap Dance|One partner seated on a chair, the other on their lap facing them; close and flirty.|eye-contact,intimate",
"Pillow-Propped Missionary|Missionary with a pillow under the hips for a better angle; comfy and easy.|intimate,lazy-day",
"Cuddle Cowgirl|On top but leaning forward chest to chest; lots of kissing and slow grinding.|intimate,eye-contact",
"Edge-of-Bed Straddle|One partner sits on the edge of the bed, the other straddles them; easy and close.|eye-contact",
"The Hug|Standing face to face, holding each other close; tender and slow, best near a wall.|intimate",
"Morning Glory|Spooning slowly, half-awake under the covers.|lazy-day,intimate",
"Tummy-to-Tummy Recline|One partner reclines on pillows, the other lies on top facing them; lazy and warm.|lazy-day,eye-contact",
"Side Scissors|Lying on your sides with legs interlaced; slow, relaxed and grindy.|lazy-day",
"Sofa Snuggle|One partner reclines on the sofa, the other nestles between their legs facing them.|intimate,lazy-day",
"Rocking Horse|One partner sits cross-legged, the other on their lap; rock together slowly.|intimate,eye-contact"],
2:["Doggy Style|One partner on hands and knees, the other kneeling behind; a classic with plenty of rhythm.|athletic",
"Reverse Cowgirl / Cowboy|On top but facing away; a great view and lots of control for the top.|",
"Butterfly|One partner lies at the edge of the bed with hips on a pillow, the other stands; an easy, deep angle.|eye-contact",
"Legs on Shoulders|Missionary with the bottom partner's legs resting on the other's shoulders; deep and intense.|eye-contact,athletic",
"Standing From Behind|Both standing, one behind the other, leaning on a counter; quick and steamy.|athletic",
"Kneeling at the Edge|The bottom partner lies at the edge of the bed, the other kneels on the floor; good angle, easy pace.|eye-contact",
"Lazy Doggy|Doggy style but lying flat on the stomach; relaxed and very close.|lazy-day",
"The Pretzel|Side-lying with one partner kneeling and legs intertwined; a great angle with eye contact.|eye-contact",
"Chairman|One partner seated, the other on their lap facing away; hands free to roam.|",
"Shower Stand|Standing in the shower, one partner braced against the wall, the other behind.|athletic",
"Kneeling Embrace|Both kneeling face to face, bodies pressed together; slow and passionate.|intimate,eye-contact",
"Countertop|One partner sits on the kitchen counter, the other stands between their legs.|eye-contact",
"Spork|Spooning, but the front partner rolls partly onto their back; deeper than a regular spoon.|lazy-day",
"Bridge Lift|The bottom partner lifts their hips into a bridge while the other kneels between; playful and a bit athletic.|athletic,eye-contact",
"Spin Cycle|One partner sits on a running washing machine, the other stands in front; the vibration is the point.|",
"69|Head to toe, pleasuring each other with your mouths at the same time; a playful favourite.|intimate"],
3:["Standing Carry|One partner lifts and holds the other, legs wrapped around; intense and very athletic.|athletic,eye-contact",
"Wheelbarrow|One partner holds the other's legs while they balance on their hands; playful and athletic.|athletic",
"Against the Wall|Standing face to face, one pressed gently to the wall; urgent and passionate.|athletic,eye-contact",
"Deep Fold|The bottom partner on their back with knees drawn toward the chest; deep and intense.|eye-contact",
"Over the Table|One partner bends over a sturdy table while the other stands behind.|athletic",
"Stair Climb|On the stairs, one partner kneels a few steps up, the other behind; mind the carpet.|athletic",
"Face-Sitting|One partner kneels over the other's face for oral, holding the headboard and setting the pace.|",
"Full Bridge|One partner arches into a full bridge while the other kneels; for the flexible only.|athletic",
"Blindfolded Cowgirl|On top, while the bottom partner wears a blindfold and can only feel.|intimate",
"Tied-Wrist Missionary|Missionary with the bottom partner's wrists loosely tied above their head, by agreement.|eye-contact,intimate",
"Standing 69|One partner holds the other upside down for mutual oral; very athletic, try it beside a bed.|athletic",
"Spread Eagle|The bottom partner lies with arms and legs spread, maybe in soft restraints, while the other takes their time.|",
"Mirror Doggy|Doggy style in front of a mirror, so you can watch each other's faces.|eye-contact",
"Vibrating Spoon|Spooning with a vibrator held in front; slow with an extra buzz.|lazy-day,intimate",
"Kneeling From Behind|Both kneeling upright, one behind the other, the back partner's hands roaming freely.|intimate",
"The Squat|The top partner squats instead of kneeling and sets a bouncy pace; for strong thighs.|athletic",
"Hanging Edge|The bottom partner lies with head and shoulders off the edge of the bed; a heady rush, keep it short.|"]
};

/* flat, stably ordered list: id = index. Same file = same order on both clients. */
var ALL=[];
(function(){
  CATS.forEach(function(c){
    for(var l=1;l<=3;l++){
      var list=RAW[c.id][l].concat(MORE[c.id]?MORE[c.id][l]:[]);
      list.forEach(function(t){
        var o={id:ALL.length,cat:c.id,lvl:l,text:t};
        if(c.id==='pos'){var p=t.split('|');o.text=p[0];o.desc=p[1]||'';o.tags=(p[2]||'').split(',').filter(Boolean)}
        ALL.push(o);
      });
    }
  });
})();
var CATIDS=CATS.map(function(c){return c.id});
function catInfo(id){for(var i=0;i<CATS.length;i++)if(CATS[i].id===id)return CATS[i];return CATS[0]}

/* ---------- pure helpers ---------- */
var SIZES=[20,30,50];
function cleanCfg(c){
  c=c||{};
  var lv=[],cats=[],i;
  for(i=1;i<=3;i++)if(Array.isArray(c.lv)&&c.lv.indexOf(i)>=0)lv.push(i);
  for(i=0;i<CATIDS.length;i++)if(Array.isArray(c.cats)&&c.cats.indexOf(CATIDS[i])>=0)cats.push(CATIDS[i]);
  if(!lv.length)lv=[1];
  if(!cats.length)cats=CATIDS.slice();
  var n=SIZES.indexOf(c.n)>=0?c.n:20;
  return {lv:lv,cats:cats,n:n};
}
function pool(cfg){
  cfg=cleanCfg(cfg);
  return ALL.filter(function(c){return cfg.lv.indexOf(c.lvl)>=0&&cfg.cats.indexOf(c.cat)>=0});
}
function buildStack(seed,cfg,rngf){
  cfg=cleanCfg(cfg);
  var a=pool(cfg).map(function(c){return c.id}),r=rngf((seed|0)+11);
  for(var i=a.length-1;i>0;i--){var j=Math.floor(r()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}
  return a.slice(0,Math.min(cfg.n,a.length));
}
/* mine/theirs: strings of y/m/n per stack position. Returns ids; either side 'n' (or anything unknown) is excluded. */
function overlaps(stack,mine,theirs){
  var both=[],worth=[];
  for(var i=0;i<stack.length;i++){
    var a=mine.charAt(i),b=theirs.charAt(i);
    if((a!=='y'&&a!=='m')||(b!=='y'&&b!=='m'))continue;
    if(a==='y'&&b==='y')both.push(stack[i]);else worth.push(stack[i]);
  }
  return {both:both,worth:worth};
}
function validAns(s,n){return typeof s==='string'&&s.length===n&&/^[ymn]*$/.test(s)}
function fillText(t,name){return String(t).replace(/\{p\}/g,name||'your partner')}

/* ---------- styles ---------- */
var CSS=".dm{--a:#c04dff;--a2:#ff4fa3;--glow:rgba(192,77,255,.32);--ink2:#f1dcff;max-width:720px;margin:0 auto;padding:6px 0 34px;font-family:inherit}\n.dm *{box-sizing:border-box}\n.dm button{font:inherit;font-weight:700;border:0;border-radius:14px;cursor:pointer;transition:transform .12s,filter .12s,box-shadow .15s}\n.dm button:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.1)}\n.dm button:active:not(:disabled){transform:scale(.97)}\n.dm button:disabled{opacity:.35;cursor:default}\n.dm-title{font-weight:800;font-size:1.55rem;letter-spacing:.02em;text-align:center;background:linear-gradient(90deg,#ff4fa3,#c04dff,#8f6bff);-webkit-background-clip:text;background-clip:text;color:transparent;margin:2px 0 10px;filter:drop-shadow(0 4px 14px rgba(192,77,255,.45))}\n.dm-box{position:relative;background:linear-gradient(150deg,var(--card2),var(--card));border:1px solid var(--line);border-radius:24px;padding:22px;margin:12px 0;box-shadow:var(--shadow),0 0 50px rgba(192,77,255,.12);animation:dmpop .3s}\n.dm-box h2{margin:.1em 0;font-size:1.5rem}\n.dm-sub{color:var(--dim);font-size:.95rem;margin:6px 0 10px;line-height:1.45}\n.dm h3{margin:18px 0 8px;color:var(--ink2);font-size:.82rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase}\n.dm-chips{display:flex;flex-wrap:wrap;gap:10px}\n.dm-chip{padding:10px 18px;border-radius:999px;border:1.5px solid var(--line);background:rgba(255,255,255,.06);color:var(--ink);font-weight:700;font-size:.95rem;margin:0;width:auto;box-shadow:none}\n.dm-chip.on{background:linear-gradient(135deg,var(--a),var(--a2));color:#fff;border-color:transparent;box-shadow:0 6px 20px var(--glow)}\nspan.dm-chip{display:inline-block}\n.dm-n{min-width:92px;padding:16px 18px;border-radius:18px;font-size:1.05rem;text-align:center}\n.dm-big{display:block;width:100%;background:linear-gradient(135deg,var(--a2),var(--a));color:#fff;margin:18px 0 0;padding:16px;font-size:1.12rem;box-shadow:0 10px 28px var(--glow)}\n.dm-prog{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:.9rem;font-weight:700;color:var(--dim)}\n.dm-prog span{background:rgba(255,255,255,.07);border:1px solid var(--line);border-radius:999px;padding:5px 14px}\n.dm-bar{position:relative;height:12px;background:rgba(255,255,255,.08);border-radius:999px;margin:10px 0 18px;overflow:visible}\n.dm-bar>i{position:relative;display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,var(--a2),var(--a));transition:width .3s;box-shadow:0 0 14px var(--glow)}\n.dm-bar>i::after{content:\"\\2764\\FE0F\";position:absolute;right:-9px;top:-7px;font-size:1.05rem;animation:dmbeat 1s infinite}\n.dm-card{position:relative;text-align:center;min-height:250px;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:16px;padding:30px 24px;margin:6px 14px 22px;border:2px solid transparent;border-radius:28px;background:linear-gradient(150deg,var(--card2),var(--card)) padding-box,linear-gradient(135deg,var(--a2),var(--a),var(--guest)) border-box;box-shadow:0 18px 44px rgba(0,0,0,.45),0 0 44px var(--glow),0 14px 0 -6px var(--card2),0 28px 0 -12px var(--card);animation:dmcard .35s cubic-bezier(.2,.9,.3,1.2)}\n.dm-tag{font-size:.78rem;font-weight:800;letter-spacing:.1em;color:#fff;background:linear-gradient(135deg,var(--a),var(--a2));border-radius:999px;padding:5px 14px}\n.dm-text{font-size:1.6rem;line-height:1.38;font-weight:700;color:#fff;word-break:break-word;text-shadow:0 2px 18px rgba(192,77,255,.4)}\n.dm-ans{display:flex;justify-content:center;gap:22px;margin-top:4px}\n.dm-ans button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;width:96px;height:96px;border-radius:50%;padding:0;margin:0;font-size:.95rem;font-weight:800;color:#fff;box-shadow:0 8px 24px rgba(0,0,0,.4)}\n.dm-ans button::before{font-size:1.9rem;line-height:1}\n.dm-yes{background:linear-gradient(135deg,#34d399,#16a34a)}.dm-yes::before{content:\"\\2705\"}.dm-yes:hover:not(:disabled){box-shadow:0 0 34px rgba(74,222,128,.7)}\n.dm-maybe{background:linear-gradient(135deg,#ffd166,#f59e0b);color:#3a2400!important}.dm-maybe::before{content:\"\\1F914\"}.dm-maybe:hover:not(:disabled){box-shadow:0 0 34px rgba(255,209,102,.7)}\n.dm-no{background:linear-gradient(135deg,#ff6b7a,#be1e3c)}.dm-no::before{content:\"\\274C\"}.dm-no:hover:not(:disabled){box-shadow:0 0 34px rgba(255,90,106,.7)}\n.dm-sec{display:flex;gap:10px;justify-content:center;margin-top:20px}\n.dm-sec button{margin:0;background:rgba(255,255,255,.07);color:var(--ink);border:1px solid var(--line);font-size:.9rem;padding:9px 16px;box-shadow:none}\n.dm-keys{color:var(--dim);font-size:.8rem;text-align:center;margin-top:12px;opacity:.85}\n.dm-empty{text-align:center;color:var(--ink2);padding:34px 14px;font-size:1.1rem}\n.dm-empty>div:first-child::before{content:\"\\1F496\";display:block;font-size:3.4rem;margin-bottom:8px;animation:dmbeat 1.1s infinite}\n.dm-hero{text-align:center;position:relative;overflow:hidden;padding:10px 0 6px}\n.dm-hero h2{font-size:2.2rem;background:linear-gradient(90deg,#ff4fa3,var(--gold),var(--a));-webkit-background-clip:text;background-clip:text;color:transparent}\n.dm-hearts{position:absolute;inset:0;pointer-events:none;overflow:hidden}\n.dm-hearts i{position:absolute;bottom:-20px;font-style:normal;font-size:1.3rem;opacity:0;animation:dmfloat 4.5s infinite}\n.dm-grp{margin-top:22px}\n.dm-grp>h2{font-size:1.25rem;margin:0 0 10px;color:#fff}\n.dm-item{background:linear-gradient(150deg,rgba(192,77,255,.14),rgba(255,209,102,.07));border:1px solid rgba(255,209,102,.28);border-radius:18px;padding:16px;margin:12px 0}\n.dm-item.hot{background:linear-gradient(150deg,rgba(255,79,163,.28),rgba(192,77,255,.2));border-color:var(--a2);box-shadow:0 0 26px rgba(255,79,163,.3)}\n.dm-meta{color:var(--dim);font-size:.78rem;font-weight:700;margin-bottom:6px}\n.dm-it{font-size:1.12rem;font-weight:700;color:#fff;word-break:break-word}\n.dm-form{display:flex;gap:8px;margin-top:12px;background:rgba(8,8,24,.55);border:1px solid var(--line);border-radius:999px;padding:4px}\n.dm-form input{flex:1;margin:0;border:0;background:transparent;box-shadow:none;padding:9px 14px;border-radius:999px;color:var(--ink);font:inherit;outline:none}\n.dm-form button{margin:0;flex:0 0 auto;background:linear-gradient(135deg,var(--a2),var(--a));color:#fff;border-radius:999px;padding:9px 18px}\n.dm-notes>div{background:rgba(255,255,255,.07);border-radius:16px 16px 16px 4px;padding:7px 12px;margin-top:8px;font-size:.93rem;word-break:break-word;width:fit-content;max-width:90%}\n.dm-notes small{color:var(--a2);margin-right:6px;font-weight:800}\n.dm-foot{margin-top:22px;text-align:center}\n.dm-desc{color:var(--ink2);font-size:1rem;line-height:1.45;margin-top:6px;max-width:520px}\n.dm-card .dm-desc{margin:0 auto}\n.dm-ptags{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}\n.dm-card .dm-ptags{justify-content:center}\n.dm-ptags span{font-size:.75rem;font-weight:700;color:var(--ink2);background:rgba(192,77,255,.18);border:1px solid rgba(192,77,255,.4);border-radius:999px;padding:3px 10px}\n@keyframes dmpop{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}\n@keyframes dmcard{from{opacity:0;transform:translateX(40px) rotate(4deg)}to{opacity:1;transform:none}}\n@keyframes dmbeat{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}\n@keyframes dmfloat{0%{transform:translateY(0) rotate(0);opacity:0}15%{opacity:.9}100%{transform:translateY(-190px) rotate(25deg);opacity:0}}\n@media(max-width:520px){.dm-ans{gap:12px}.dm-ans button{width:82px;height:82px}.dm-text{font-size:1.3rem}.dm-card{margin-left:4px;margin-right:4px}}";

/* ---------- UI ---------- */
function GAME_START(ctx){
  var me=ctx.me,isHost=!!ctx.isHost,partner=me==='host'?'guest':'host',names=ctx.names||{};
  var nm=function(r){return names[r]||(r==='host'?'Host':'Guest')};
  var root=ctx.root;root.innerHTML='';
  var st=document.createElement('style');st.textContent=CSS;root.appendChild(st);
  var wrap=document.createElement('div');wrap.className='dm';root.appendChild(wrap);

  var phase='lobby',dead=false,ended=false;
  var cfg=cleanCfg({lv:[1,2],cats:CATIDS.slice(),n:20});
  var stack=[],mine=[],mineDone=false,theirs=null,theirProg=0,rev=null;
  var notes={},noteEls={},drafts={},timers=[];

  function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
  function btn(label,cls,fn){
    var b=el('button',cls||'',label);b.type='button';
    b.onclick=function(){if(!dead)fn()};return b;
  }
  function has(arr,v){return arr.indexOf(v)>=0}
  function toggled(arr,v,order){
    var a=has(arr,v)?arr.filter(function(x){return x!==v}):arr.concat([v]);
    return order.filter(function(x){return has(a,x)});
  }

  /* --- lobby --- */
  function sendCfg(){ctx.send({k:'cfg',cfg:cfg})}
  function setCfg(c){cfg=cleanCfg(c);sendCfg();render()}
  function renderLobby(){
    var b=el('div','dm-box');
    b.appendChild(el('div',null,'Swipe in private. Only mutual interest is ever revealed — a No stays your secret, always. Skip anything, anytime.')).className='dm-sub';
    b.appendChild(el('h3',null,'Heat'));
    var r=el('div','dm-chips');
    for(var l=1;l<=3;l++)(function(l){
      var on=has(cfg.lv,l),lab=LVI[l]+' '+LV[l];
      if(isHost){
        var bt=btn(lab,'dm-chip dm-lv'+(on?' on':''),function(){
          var nl=toggled(cfg.lv,l,[1,2,3]);if(!nl.length)return;setCfg({lv:nl,cats:cfg.cats,n:cfg.n});
        });r.appendChild(bt);
      }else r.appendChild(el('span','dm-chip'+(on?' on':''),lab));
    })(l);
    b.appendChild(r);
    b.appendChild(el('h3',null,'Categories'));
    var rc=el('div','dm-chips');
    CATS.forEach(function(c){
      var on=has(cfg.cats,c.id),lab=c.icon+' '+c.name;
      if(isHost){
        rc.appendChild(btn(lab,'dm-chip dm-cat'+(on?' on':''),function(){
          var nc=toggled(cfg.cats,c.id,CATIDS);if(!nc.length)return;setCfg({lv:cfg.lv,cats:nc,n:cfg.n});
        }));
      }else rc.appendChild(el('span','dm-chip'+(on?' on':''),lab));
    });
    b.appendChild(rc);
    b.appendChild(el('h3',null,'Stack size'));
    var rn=el('div','dm-chips');
    SIZES.forEach(function(n){
      var on=cfg.n===n,lab=n+' cards';
      if(isHost)rn.appendChild(btn(lab,'dm-chip dm-n'+(on?' on':''),function(){setCfg({lv:cfg.lv,cats:cfg.cats,n:n})}));
      else rn.appendChild(el('span','dm-chip'+(on?' on':''),lab));
    });
    b.appendChild(rn);
    var avail=pool(cfg).length;
    b.appendChild(el('p','dm-sub',(avail<cfg.n?'Only '+avail+' ideas match these filters — you will get all of them. ':'')+'Your answers stay on your device until you both finish.'));
    if(isHost)b.appendChild(btn('Start','dm-big dm-start',hostStart));
    else b.appendChild(el('p','dm-sub','Waiting for '+nm('host')+' to start…'));
    wrap.appendChild(b);
  }
  function hostStart(){
    if(phase!=='lobby')return;
    ctx.send({k:'start',cfg:cfg});
    beginPlay(cfg);
  }
  function beginPlay(c){
    cfg=cleanCfg(c);
    stack=buildStack(ctx.seed,cfg,ctx.rng);
    mine=[];mineDone=false;theirs=null;theirProg=0;rev=null;notes={};noteEls={};drafts={};
    phase='play';render();
  }

  /* --- play --- */
  function answer(v){
    if(dead||phase!=='play'||mineDone||mine.length>=stack.length)return;
    mine.push(v);
    ctx.send({k:'prog',n:mine.length});
    if(mine.length>=stack.length){
      mineDone=true;
      ctx.send({k:'done',a:mine.join('')});
      phase='wait';
      maybeReveal();
    }
    render();
  }
  function undo(){
    if(dead||phase!=='play'||!mine.length)return;
    mine.pop();ctx.send({k:'prog',n:mine.length});render();
  }
  function renderPlay(){
    var n=stack.length,i=mine.length,card=ALL[stack[i]];
    var pr=el('div','dm-prog');
    pr.appendChild(el('span','dm-mine','Card '+(i+1)+' / '+n));
    pr.appendChild(el('span','dm-theirs',nm(partner)+': '+theirProg+'/'+n+' cards'));
    wrap.appendChild(pr);
    var bar=el('div','dm-bar'),fi=el('i');fi.style.width=Math.round(i/n*100)+'%';bar.appendChild(fi);wrap.appendChild(bar);
    var c=el('div','dm-box dm-card');
    var ci=catInfo(card.cat);
    c.appendChild(el('span','dm-tag',ci.icon+' '+ci.name.toUpperCase()+' · '+LVI[card.lvl]+' '+LV[card.lvl].toUpperCase()));
    c.appendChild(el('div','dm-text',(card.cat==='pos'?'Try: ':'')+fillText(card.text,nm(partner))));
    posExtra(c,card);
    wrap.appendChild(c);
    var a=el('div','dm-ans');
    a.appendChild(btn('Yes','dm-yes',function(){answer('y')}));
    a.appendChild(btn('Maybe','dm-maybe',function(){answer('m')}));
    a.appendChild(btn('No','dm-no',function(){answer('n')}));
    wrap.appendChild(a);
    var s=el('div','dm-sec');
    var u=btn('Undo last','dm-undo',undo);if(!i)u.disabled=true;
    s.appendChild(u);
    s.appendChild(btn('Skip','dm-skip',function(){answer('n')}));
    wrap.appendChild(s);
    wrap.appendChild(el('div','dm-keys','Keys: Y = Yes, M = Maybe, N = No, S = Skip, U = Undo. Skip means “not comfortable” and is simply a No.'));
  }
  function renderWait(){
    var n=stack.length;
    var b=el('div','dm-box dm-empty');
    b.appendChild(el('div',null,'Waiting for '+nm(partner)+'…'));
    b.appendChild(el('p','dm-sub dm-theirs',nm(partner)+': '+theirProg+'/'+n+' cards'));
    wrap.appendChild(b);
  }

  /* --- reveal --- */
  function maybeReveal(){
    if(phase!=='wait'||!mineDone||theirs===null)return;
    rev=overlaps(stack,mine.join(''),theirs);
    theirs=null;mine=[]; /* drop all non-overlap data now that the overlaps are computed */
    phase='reveal';render();
  }
  function noteBox(id){
    var box=el('div','dm-notes');noteEls[id]=box;paintNotes(id);return box;
  }
  function paintNotes(id){
    var box=noteEls[id];if(!box)return;
    box.innerHTML='';
    var n=notes[id]||{};
    ['host','guest'].forEach(function(r){
      if(!n[r])return;
      var d=el('div');d.appendChild(el('small',null,r===me?'You':nm(r)));d.appendChild(document.createTextNode(n[r]));box.appendChild(d);
    });
  }
  function noteForm(id){
    var f=document.createElement('form');f.className='dm-form';f.setAttribute('autocomplete','off');
    var inp=document.createElement('input');inp.type='text';inp.maxLength=140;inp.placeholder='Talk about it…';
    inp.setAttribute('data-name','note'+id);inp.value=drafts[id]||'';
    inp.addEventListener('input',function(){drafts[id]=inp.value});
    var b=el('button','',' Send');b.type='submit';b.textContent='Send';
    f.appendChild(inp);f.appendChild(b);
    f.addEventListener('submit',function(e){
      e.preventDefault();if(dead||phase!=='reveal')return;
      var t=inp.value.replace(/\s+/g,' ').trim().slice(0,140);if(!t)return;
      inp.value='';delete drafts[id];
      (notes[id]=notes[id]||{})[me]=t;paintNotes(id);
      ctx.send({k:'note',id:id,t:t});
    });
    return f;
  }
  /* positions: one-line setup + optional tags (text only) */
  function posExtra(parent,c){
    if(c.cat!=='pos')return;
    if(c.desc)parent.appendChild(el('div','dm-desc',fillText(c.desc,nm(partner))));
    if(c.tags&&c.tags.length){
      var t=el('div','dm-ptags');
      c.tags.forEach(function(x){t.appendChild(el('span',null,x))});
      parent.appendChild(t);
    }
  }
  function item(id,hot){
    var c=ALL[id],ci=catInfo(c.cat);
    var d=el('div','dm-item'+(hot?' hot':''));
    d.appendChild(el('div','dm-meta',ci.icon+' '+ci.name+' · '+LVI[c.lvl]+' '+LV[c.lvl]));
    d.appendChild(el('div','dm-it',fillText(c.text,nm(partner))));
    posExtra(d,c);
    d.appendChild(noteForm(id));
    d.appendChild(noteBox(id));
    return d;
  }
  function renderReveal(){
    noteEls={};
    var b=el('div','dm-box');
    var hero=el('div','dm-hero'),hs=el('div','dm-hearts');hs.setAttribute('aria-hidden','true');
    for(var hi=0;hi<10;hi++){var h=el('i',null,hi%3?'💘':'🔥');h.style.left=(5+hi*10)+'%';h.style.animationDelay=(hi*0.45)+'s';hs.appendChild(h)}
    hero.appendChild(hs);hero.appendChild(el('h2',null,'It\u2019s a match! 💘'));b.appendChild(hero);
    b.appendChild(el('p','dm-sub','Only the ideas you both showed interest in are shown. Everything else stays private.'));
    if(!rev.both.length&&!rev.worth.length){
      b.appendChild(el('div','dm-empty','No overlaps this time — and that is completely fine. Chemistry grows by talking, so try another stack later. 💜'));
    }
    if(rev.both.length){
      var g=el('div','dm-grp');g.appendChild(el('h2',null,'💘 Both said YES ('+rev.both.length+')'));
      rev.both.forEach(function(id){g.appendChild(item(id,true))});b.appendChild(g);
    }
    if(rev.worth.length){
      var w=el('div','dm-grp');w.appendChild(el('h2',null,'🔥 Worth exploring ('+rev.worth.length+')'));
      rev.worth.forEach(function(id){w.appendChild(item(id,false))});b.appendChild(w);
    }
    var f=el('div','dm-foot');
    var fb=btn('Finish','dm-big',doEnd);fb.id='dm-finish';f.appendChild(fb);
    b.appendChild(f);
    wrap.appendChild(b);
  }

  /* --- ending --- */
  function finish(){
    if(ended)return;ended=true;
    var m=rev?rev.both.length:0,w=rev?rev.worth.length:0;
    ctx.end('Matched!',m+' match'+(m===1?'':'es')+', '+w+' worth exploring');
  }
  function doEnd(){
    if(ended||dead)return;
    ctx.send({k:'end'});finish();
  }

  /* --- rendering --- */
  function render(){
    if(dead)return;
    var ae=document.activeElement,keep=null,s0=0,s1=0;
    if(ae&&ae.getAttribute&&wrap.contains(ae)&&ae.getAttribute('data-name')){
      keep=ae.getAttribute('data-name');try{s0=ae.selectionStart;s1=ae.selectionEnd}catch(e){}
    }
    wrap.innerHTML='';
    wrap.appendChild(el('div','dm-title','💘 Desire Match'));
    if(phase==='lobby')renderLobby();
    else if(phase==='play')renderPlay();
    else if(phase==='wait')renderWait();
    else if(phase==='reveal')renderReveal();
    if(keep){
      var inp=wrap.querySelector('input[data-name="'+keep+'"]');
      if(inp){try{inp.focus({preventScroll:true});inp.setSelectionRange(s0,s1)}catch(e){}}
    }
  }

  /* --- keyboard (play phase only; ignored while typing) --- */
  function onKey(e){
    if(dead||phase!=='play'||e.ctrlKey||e.metaKey||e.altKey)return;
    var t=e.target;
    if(t&&t.tagName&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))return;
    var k=e.key;if(!k)return;
    var m={y:'y',ArrowRight:'y',m:'m',ArrowUp:'m',n:'n',ArrowLeft:'n',s:'n',ArrowDown:'n'}[k.length===1?k.toLowerCase():k];
    if(m){e.preventDefault();answer(m)}
    else if(k==='u'||k==='U'||k==='Backspace'){e.preventDefault();undo()}
  }
  document.addEventListener('keydown',onKey);

  /* --- incoming --- */
  function onMsg(d){
    if(dead||!d||typeof d!=='object')return;
    var k=d.k;
    if(k==='end'){if(phase==='reveal')finish();return}
    if(k==='cfg'){
      if(!isHost&&phase==='lobby'){cfg=cleanCfg(d.cfg);render()}
      return;
    }
    if(k==='start'){
      if(!isHost&&phase==='lobby')beginPlay(d.cfg);
      return;
    }
    if(k==='prog'){
      if((phase==='play'||phase==='wait')&&typeof d.n==='number'&&d.n>=0&&d.n<=stack.length){
        theirProg=d.n|0;
        var t=wrap.querySelectorAll('.dm-theirs');
        for(var i=0;i<t.length;i++)t[i].textContent=nm(partner)+': '+theirProg+'/'+stack.length+' cards';
      }
      return;
    }
    if(k==='done'){
      if((phase==='play'||phase==='wait')&&theirs===null&&validAns(d.a,stack.length)){
        theirs=d.a;theirProg=stack.length;
        if(phase==='wait')maybeReveal();
      }
      return;
    }
    if(k==='note'){
      if(phase!=='reveal'||!rev)return;
      var id=d.id|0;
      if(!has(rev.both,id)&&!has(rev.worth,id))return;
      var tx=String(d.t==null?'':d.t).replace(/\s+/g,' ').trim().slice(0,140);if(!tx)return;
      (notes[id]=notes[id]||{})[partner]=tx;paintNotes(id);
    }
  }

  render();
  return {
    onMsg:onMsg,
    destroy:function(){dead=true;document.removeEventListener('keydown',onKey);timers.forEach(clearTimeout)}
  };
}

registerGame({
  id:'match',icon:'💘',name:'Desire Match',
  blurb:'Swipe Yes / Maybe / No on flirty to wild ideas in private. Only what you both want gets revealed.',
  start:GAME_START,
  _t:{CATS:CATS,ALL:ALL,RAW:RAW,cleanCfg:cleanCfg,pool:pool,buildStack:buildStack,overlaps:overlaps,validAns:validAns}
});
})();
