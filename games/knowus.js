/* Who Knows Us Better? - 2 players, a TV quiz show for couples. Plugin for Duo Games.
   Five round types: Guess My Answer, Who's More Likely To..., Fact or Fiction, Speed Round and the Final Wager.
   The host runs the only copy of the game state. Secret answers live in a private store on the host that is never
   part of the shared state: each player's screen gets a view that only contains their own locked answers until
   the reveal, and the host's own screen renders from the same filtered view, so neither side can see early.
   Every round gives both players exactly the same number of chances, the hot seat alternates, the player who goes
   first alternates per round (first one picked by a seeded coin flip), and all question order comes from ctx.rng(seed).
   All questions are original. */
(function(){
'use strict';

/* ---------- question bank ----------
   'cat|question|option|option|...'. No options = short typed answer. Questions are asked to the hot-seat player ("you");
   the partner sees the same question and predicts what the hot-seat player will say. */
var BANK=[
/* food & cravings */
"food|What's your ultimate comfort food after a long day?|Pizza|Noodles or ramen|Something cheesy and baked|Home cooking from family",
"food|Pick your midnight snack.|Crisps|Ice cream|Leftovers straight from the fridge|Toast",
"food|How do you like your eggs?|Scrambled|Fried with a runny yolk|Boiled|Not an egg person",
"food|What's your go-to pizza topping?|Pepperoni|Extra cheese|Loaded veggie|Pineapple, unapologetically",
"food|How much spice can you actually handle?|Mild please|Medium, a little kick|Hot, bring it on|Make me cry",
"food|Name one food you could eat every day for a month.",
"food|What do you always get at the cinema?|Salted popcorn|Sweet popcorn|Nachos|Nothing, I smuggle snacks in",
"food|Which dessert wins?|Chocolate cake|Cheesecake|Ice cream sundae|Gulab jamun",
"food|What's your hot drink order?|Chai, always|Black coffee|Something sweet and fancy|Hot chocolate",
"food|Which food do you secretly not like but eat to be polite?",
"food|At a buffet you head straight for...|The mains|Desserts first|The salad, to be good|Whatever I've never tried",
"food|What's your fast-food weakness?|Burgers|Fried chicken|Wraps and burritos|Fries, just fries",
"food|How do you eat a KitKat?|Snap off one finger at a time|Bite straight across|Nibble the chocolate off first|Not a KitKat fan",
"food|Your toast is best with...|Just butter|Jam|Peanut butter|Something savoury on top",
"food|How dangerous are you when hungry?|Totally chill|A bit snappy|Do not talk to me|Full villain mode",
"food|In the kitchen you are...|The head chef|The one who chops|The taste-tester|The one ordering takeaway",
"food|Which cuisine would you pick for your birthday dinner?|Indian|Italian|Chinese or Thai|Mexican",
"food|What's the weirdest food combo you secretly enjoy?",
"food|How do you feel about leftovers?|Better the next day|Fine, I guess|Only certain dishes|Fresh food only",
"food|Pick a crisp flavour.|Ready salted|Salt and vinegar|Cheese and onion|Something spicy",
"food|What do you order to drink on a night out?|A mocktail|A fizzy drink|Something fruity|Water, I'm driving",
"food|What's your relationship with breakfast?|Most important meal|A coffee counts|Weekends only|Brunch or nothing",
"food|What snack is almost always in your bag or car?",
"food|Pancakes or waffles?|Pancakes|Waffles|Both, stacked high|Neither, French toast",
"food|Which fruit do you grab from the bowl first?|Mango|Strawberries|Banana|Grapes",
"food|How do you like your samosa?|With chutney|With ketchup|Plain and hot|Chaat style, fully loaded",
"food|Sweet or savoury breakfast?|Sweet|Savoury|Depends on my mood|Parathas forever",
"food|What's your take on pineapple on pizza?|Love it|Hate it|Never tried it|Pineapple belongs everywhere",
/* habits */
"habit|How many alarms do you set in the morning?|Just one|Two or three|Five or more|None, I wake up naturally",
"habit|How do you squeeze the toothpaste?|Neatly from the bottom|From the middle, chaos|Rolled up like a pro|Whatever, I just squeeze",
"habit|Your phone battery usually sits at...|Above 80%|Around half|In the red zone|It's dead right now",
"habit|How many browser tabs do you have open right now?|1 to 5|6 to 15|16 to 40|I'm scared to count",
"habit|How do you leave the bed in the morning?|Made perfectly|Duvet pulled up roughly|Exactly how I left it|Depends who's coming over",
"habit|When are you most productive?|Early morning|Mid-morning|Afternoon|Late at night",
"habit|How do you sleep?|On my back|On my side|On my front|Starfish, taking all the space",
"habit|Socks in bed?|Always|Never|Only in winter|They come off during the night",
"habit|How do you deal with unread notifications?|Always cleared to zero|A few hanging around|Hundreds|What notifications?",
"habit|How long are your showers?|Under 5 minutes|About 10 minutes|20 minutes|A full concert with singing",
"habit|Where are your keys right now?|On the same hook as always|Somewhere in a bag|Wherever I dropped them|Honestly, no idea",
"habit|A free Sunday looks like...|Busy and social|Chores and errands|Staying in bed|Family and good food",
"habit|When do you pack for a trip?|Days ahead with a list|The night before|An hour before|Throwing stuff in a bag at the door",
"habit|What do you do first when you wake up?|Check my phone|Bathroom dash|Drink some water|Hit snooze",
"habit|How punctual are you?|Always early|Right on time|5 to 10 minutes late|Time is a social construct",
"habit|What do you do when you can't fall asleep?",
"habit|Your clean laundry is usually...|Folded and put away|Piled on a chair|In the basket for days|Worn straight from the dryer",
"habit|What's your texting style?|Long paragraphs|Short quick replies|Voice notes|Memes and emojis",
"habit|Do you read the instructions?|Every word|I skim them|Only when I'm stuck|What instructions?",
"habit|What's your exercise routine really like?|Regular and serious|Bursts of motivation|Walks count, right?|Thinking about it counts",
"habit|What's your most-used app?",
"habit|How do you handle a long queue?|Patiently|Phone out, scrolling|Silently judging everyone|Leave and come back later",
"habit|How do you cut a sandwich?|Diagonally|Straight down the middle|I don't cut it|Crusts off, please",
"habit|What's your fidget habit?|Biting my nails|Bouncing my leg|Playing with my hair|Clicking pens",
"habit|First ten minutes after getting home?|Change into comfy clothes|Raid the snacks|Collapse on the sofa|Call someone",
"habit|How often does your room or car get a proper clean?|Every week|When it gets bad|When guests are coming|It's a lifestyle, not a mess",
"habit|How do you answer an unknown number?|Pick up straight away|Let it ring out|Google the number first|Never, ever",
"habit|How many photos are in your camera roll?|Under 1,000|1,000 to 5,000|5,000 to 20,000|My phone is full",
/* childhood */
"kid|What were you like as a kid?|A total angel|A cheeky troublemaker|Shy and quiet|The class clown",
"kid|What did you want to be when you grew up?",
"kid|What was your favourite subject at school?|Maths|Art|PE|Lunch",
"kid|Which cartoon did you never miss?",
"kid|What got you in trouble most as a kid?|Talking in class|Fighting with siblings or cousins|Sneaking sweets|Breaking things",
"kid|Your go-to playground game?|Tag|Hide and seek|Football or cricket|Making up pretend worlds",
"kid|Were you a picky eater?|Very picky|A little|I ate everything|I lived on one food",
"kid|What nickname did your family call you?",
"kid|What scared you most as a kid?|The dark|Monsters under the bed|Dogs|Injections",
"kid|What was your favourite toy?",
"kid|How did you spend the summer holidays?|Visiting family|Outside all day|TV and games|Classes and clubs",
"kid|Were you the teacher's pet?|Absolutely|Sometimes|Definitely not|More like the teacher's nightmare",
"kid|What did you have for school lunch?|Packed lunch from home|School dinners|Bought from the shop|Whatever I could trade for",
"kid|What was your first phone?|A brick that never broke|A flip phone|A smartphone|A family hand-me-down",
"kid|What did you collect as a kid?|Stickers|Trading cards|Stones or shells|Nothing, I was a minimalist",
"kid|Which hobby or sport did you quit as a kid?",
"kid|What did you do on a sick day at home?|TV all day|Slept|Played games|Milked it for extra days",
"kid|How often did you fight with your siblings?|Never, we were angels|Now and then|Every single day|I'm an only child",
"kid|What was bedtime like?|Strict and early|Pretty flexible|I stayed up secretly|I fell asleep anywhere",
"kid|Your dream birthday party as a kid?|A big party with friends|A family dinner|A day out somewhere fun|Just cake and presents",
"kid|Who was your first celebrity crush?",
"kid|How long did you believe in the tooth fairy?|Until I was quite old|A few years|Never believed|I still believe",
"kid|How were your school reports?|Top of the class|Pretty good|Average|Let's not talk about it",
"kid|Your favourite thing from the sweet shop?|Chocolate bars|Sour sweets|Lollipops|Bubblegum",
"kid|How did you get to school?|Walked|Bus|Got driven|Bike or scooter",
"kid|What were you famous for in your family as a kid?",
"kid|What was your hiding spot as a kid?|Under the bed|In a wardrobe|Behind the curtains|Outside somewhere",
/* travel */
"travel|Window or aisle seat?|Window|Aisle|Middle, I'm a saint|Whatever is cheapest",
"travel|Your dream holiday style?|Beach and do nothing|City break|Adventure and hiking|Road trip",
"travel|Which country would you move to tomorrow?",
"travel|How early do you get to the airport?|Three hours or more|Two hours|Just in time|Sprinting through the terminal",
"travel|What do you always forget to pack?|Charger|Toothbrush|Socks|Nothing, I'm perfect",
"travel|Hotel or rented flat?|Hotel with room service|Flat with a kitchen|Camping|Staying with family",
"travel|Your role on a trip is...|The planner|The navigator|The photographer|The snack supplier",
"travel|Road trip soundtrack?|My playlist only|The radio|Podcasts|Singalong chaos",
"travel|Your souvenir of choice?|Fridge magnets|Clothes|Local food|Photos only",
"travel|How do you survive a long flight?|Sleep the whole way|Movie marathon|Snacks and chatting|Restless the entire time",
"travel|Which would you rather visit?|Japan|Italy|Iceland|The Maldives",
"travel|Ideal holiday length?|A weekend|One week|Two weeks|A month or more",
"travel|First thing you do in a hotel room?|Jump on the bed|Inspect the bathroom|Unpack everything|Find the Wi-Fi password",
"travel|Your beach day essential?|Sunscreen|A good book|Snacks|A speaker",
"travel|Do you try the local food?|Everything, adventurously|A few things|I look for familiar food|I pack my own",
"travel|What's the best trip you've ever been on?",
"travel|Getting lost in a new city is...|A fun adventure|Mild panic|Impossible, I have maps|A chance to chat to strangers",
"travel|How heavy do you pack?|Carry-on only|One suitcase|Two suitcases|Overweight fees every time",
"travel|Mountains or sea?|Mountains|Sea|Both together|Neither, give me a city",
"travel|On holiday you are...|Ticking off every attraction|Wandering like a local|A mix of both|By the pool all week",
"travel|Where would you go for a dream anniversary trip?",
"travel|Train, plane or car?|Train|Plane|Car|Boat",
"travel|What time do you get up on holiday?|Sunrise|Around 9|Lunchtime|Whenever I wake up",
"travel|Which holiday disaster sounds most like you?|Missing the flight|Getting sunburnt|Losing the passport|Eating something dodgy",
"travel|Theme park personality?|Biggest rollercoaster first|Medium rides only|Holding everyone's bags|Here for the snacks",
"travel|Which city would you love to explore together?",
"travel|What's your airport routine?|Coffee and people-watching|Duty-free shopping|Straight to the gate|Nap on the chairs",
/* movies & tv */
"screen|Your pick on movie night?|Comedy|Horror|Romance|Action",
"screen|How do you watch horror films?|Eyes wide open|Behind a cushion|I refuse to watch|Laughing at them",
"screen|Do you cry at films?|Every single time|Sometimes|Rarely|Never, I'm made of stone",
"screen|Which show could you rewatch forever?",
"screen|What's your binge style?|A whole season in one night|An episode a day|Fall asleep halfway|Start and never finish",
"screen|How do you feel about spoilers?|I hate them|I don't mind|I read them on purpose|I spoil things for others",
"screen|Bollywood or Hollywood?|Bollywood|Hollywood|Both equally|K-dramas, actually",
"screen|Which film character are you most like?",
"screen|Talking during films?|Never|Small comments|Running commentary|I'm on my phone",
"screen|Which TV contest would you win?|A baking show|A survival show|A dating show|A cooking show",
"screen|Subtitles on or off?|Always on|Only for foreign films|Off|Depends on my mood",
"screen|What's your favourite animated film?",
"screen|Which superhero do you prefer?|Spider-Man|Iron Man|Wonder Woman|Batman",
"screen|Where do you sit in the cinema?|Back row|Dead centre|Near the front|Aisle, for quick escapes",
"screen|How long do you scroll before choosing what to watch?|Under 5 minutes|15 minutes|Half an hour|We give up and rewatch something",
"screen|What kind of ending do you want?|Happy ever after|A big twist|An open ending|Tragic and dramatic",
"screen|Would you watch a scary film alone at night?|Easily|Only with the lights on|No way|I did once and regret it",
"screen|Which TV family would you join?|The Simpsons|The Friends gang|A big Bollywood family|The Modern Family crew",
"screen|Your guilty-pleasure TV is...|Reality TV|Soap operas|Cartoons|Cooking shows",
"screen|Which film can you quote the most?",
"screen|Pick a sitcom.|Friends|The Office|Brooklyn Nine-Nine|How I Met Your Mother",
"screen|Documentaries are...|My favourite|Fine sometimes|Great for falling asleep|Something I never watch",
"screen|Which fantasy world would you live in?|Hogwarts|Middle-earth|Narnia|The Marvel universe",
"screen|Who would play you in a film about your life?",
"screen|Watching sport on TV?|Huge fan|Big games only|Only with friends|It's background noise",
"screen|Romcoms?|Love them|Secretly love them|Only if forced|Can't stand them",
"screen|What's your movie snack style?|Sweet|Salty|Both mixed together|Proper dinner on my lap",
/* music */
"music|What's your karaoke song?",
"music|How do you sing in the shower?|Full concert|Humming|Silence|Dramatic ballads only",
"music|What do you play on a long drive?|Punjabi and bhangra|Pop|Hip hop|Old classics",
"music|How loud do you play your music?|Quiet background|Normal|Loud|The neighbours complain",
"music|Can you dance?|Like a pro|Pretty decent|Only when nobody's watching|Two left feet",
"music|The dhol starts at a wedding. You...|Hit the dance floor first|Join after a song or two|Watch and clap|Hide near the food",
"music|What's your ringtone?|The default|A favourite song|Always on silent|Vibrate only",
"music|At a concert you are...|Front row, screaming|Singing along in the middle|Filming everything|At the back with a drink",
"music|Which instrument would you love to play?|Guitar|Piano|Dhol or drums|Violin",
"music|Which song hypes you up instantly?",
"music|Old songs or new songs?|Old classics|New hits|Both|Whatever's playing",
"music|Do you know the lyrics to your favourite songs?|Every word|Mostly|Just the chorus|I make up my own",
"music|Album or shuffle?|Full albums|Shuffle|The same playlist forever|The radio",
"music|What do you listen to when you're sad?|Sad songs, to cry it out|Happy songs, to cheer up|Silence|Something calm and peaceful",
"music|Which singer would you love to meet?",
"music|Headphones in public?|Always|Sometimes|Rarely|Speaker out, sorry everyone",
"music|What's your signature dance move?|Bhangra shoulders|The side-to-side sway|The robot|Hands in the air",
"music|How do you sing in the car?|Like a rock star|Quietly|Only when alone|I don't",
"music|Would you go on a singing show?|Yes, and I'd win|Only for fun|Never|Only as a judge",
"music|Which song would you pick for our first dance?",
"music|How embarrassing would your year-in-music summary be?|Very|A bit|Not at all|I'd never show anyone",
"music|Your music taste in one word?|Chill|Party|Emotional|All over the place",
"music|What helps you concentrate?|Lo-fi beats|Pop|Total silence|Podcasts",
"music|Which decade has the best music?|The 70s|The 80s and 90s|The 2000s|Right now",
"music|Which song is stuck in your head the most lately?",
"music|At a party, you control the music by...|Taking over the speaker|Requesting songs|Letting others choose|Complaining quietly",
/* romance */
"love|What's your love language?|Words of affirmation|Quality time|Physical touch|Acts of service",
"love|Your perfect date night?|Fancy dinner|Film night in|Outdoor adventure|Long drive and chai",
"love|Your ideal anniversary gift?|Jewellery|A trip or experience|A handwritten letter|A surprise party",
"love|What was the first thing you noticed about me?|My smile|My eyes|My voice|My laugh",
"love|How do you show you're upset?|I go quiet|I talk it out straight away|Sarcasm|I pretend everything's fine",
"love|What's your idea of romantic?|Grand gestures|Small everyday things|Surprises|Deep late-night talks",
"love|Which song reminds you of us?",
"love|How cheesy are you in love?|Extremely|A bit|Secretly very|Not at all",
"love|Honestly, who's the better cook between us?|Me|You|We're equal|Neither, takeaway wins",
"love|What's your favourite thing that I do?",
"love|Breakfast in bed or dinner out?|Breakfast in bed|Dinner out|Both, please|Cooking together",
"love|The ideal rainy day together?|Films and blankets|Cooking something new|Board games|A long nap",
"love|How do you like to be comforted?|Hugs|Kind words|Some space|Food",
"love|What's your flirting style?|Teasing|Compliments|Eye contact|Awkward but cute",
"love|Valentine's Day is...|Very important|Nice but no big deal|Overrated|Every day should be like that",
"love|What would you name our future pet?",
"love|How do you feel about holding hands in public?|Always|Sometimes|Not really my thing|Arms linked instead",
"love|What's your favourite memory of us so far?",
"love|Pick a date.|Picnic in the park|Cooking class|Stargazing|Karaoke night",
"love|How do you say sorry?|Say it straight away|Bring food|A big hug|Act normal and hope it passes",
"love|Love letter or voice note?|Love letter|Voice note|A video|A long text",
"love|When did you know you liked me?|First conversation|First date|A few weeks in|I'm still deciding (joking)",
"love|Who usually apologises first after a silly argument?|Me|You|Whoever was wrong|We both do at once",
"love|Which nickname do you secretly love being called?",
"love|The perfect surprise from me would be...|Flowers|Your favourite food delivered|A surprise visit|A handwritten note",
"love|What's one word you'd use to describe us?",
"love|How do you like to celebrate your birthday?|Big party|Quiet dinner|A trip away|Pretend it isn't happening",
/* embarrassing moments */
"oops|Ever waved back at someone who wasn't waving at you?|Many times|Once or twice|Never|Today, actually",
"oops|Where have you fallen over most embarrassingly?|On a busy street|In front of a crush|On a stage|At school",
"oops|Ever sent a message to the wrong person?|Yes, catastrophically|Yes, mildly|Never|Almost, saved it just in time",
"oops|What do you do when you trip in public?|Pretend it was on purpose|Laugh it off|Walk away fast|Glare at the ground",
"oops|Ever called a teacher Mum or Dad?|Yes|No|Something even worse|Not yet",
"oops|What was your worst hairstyle era?|The bowl cut|A DIY fringe|Way too much gel|I've never had a bad one",
"oops|What's the most embarrassing thing on your phone?|Old selfies|My search history|Dramatic notes|Voice memos of me singing",
"oops|Ever been caught dancing or singing alone?|Many times|Once|Never|I wanted to be caught",
"oops|Your biggest kitchen disaster?|Burnt something badly|Set off the smoke alarm|Salt instead of sugar|Never cook, never fail",
"oops|Ever got stuck somewhere embarrassing?|Locked in a toilet|Stuck in a lift|Stuck in clothes in a changing room|Never",
"oops|Describe your most embarrassing moment in three words.",
"oops|Ever laughed at a really wrong moment?|At a serious event|In class or a meeting|In the middle of an argument|Never",
"oops|Ever walked into a glass door?|Yes|Almost|Never|A lamppost instead",
"oops|How bad are your autocorrect fails?|Daily disasters|Occasional|Never|I don't proofread anything",
"oops|Ever forgotten someone's name mid-conversation?|All the time|Sometimes|Rarely|I call everyone 'mate'",
"oops|Ever accidentally liked a really old photo?|Yes, the horror|Nearly|Never|I do it on purpose",
"oops|Worst thing that's happened to you on a video call?|Forgot I was unmuted|Camera came on by surprise|Someone walked in|Froze on a funny face",
"oops|Which family member has the most embarrassing story about you?",
"oops|Ever pushed a door that said pull?|Constantly|Sometimes|Never|While someone watched",
"oops|Cringiest thing you've done for a crush?|Wrote a poem|Changed my route to bump into them|Learned their favourite song|Stalked their playlists",
"oops|Ever fallen asleep somewhere you really shouldn't?|In class or at work|On public transport|At a party|During a long speech",
"oops|Ever worn something inside out all day?|Yes|Just socks|Never|Maybe right now",
"oops|Which music do you secretly love but would never admit to?",
"oops|Ever sung completely wrong lyrics out loud?|All the time|Once, very publicly|Never|My lyrics are better",
"oops|Ever been told off by a stranger?|Yes|Never|By an aunty at a wedding|By a librarian",
"oops|Rate your clumsiness.|Graceful swan|Occasional oops|Daily bruises|Walking disaster",
"oops|What's the most embarrassing thing you've said to a waiter?|'You too' after 'enjoy your meal'|Ordered something I couldn't pronounce|Called them by the wrong name|Waved them over by accident",
/* future dreams */
"future|Where do you see yourself living in ten years?|A big city|Quiet countryside|By the sea|Another country",
"future|Your dream house must have...|A huge kitchen|A big garden|A home cinema|A library",
"future|How many kids would you like?|None|One|Two|Three or more",
"future|What's your dream car?",
"future|What would you do first with a lottery win?|Buy a house|Travel the world|Give lots of it away|Invest it all",
"future|Your retirement plan?|Beach house|Travel nonstop|Grow vegetables|Never retire",
"future|Which skill do you want to learn this year?",
"future|What would your dream job be?",
"future|Future pets?|A dog|A cat|Something unusual|No pets",
"future|Your dream wedding style?|A huge celebration|Small and intimate|Destination wedding|Run away and elope",
"future|What would you name a boat if you owned one?",
"future|At 80 you'll be...|Still dancing|Gardening|Telling very long stories|Grumpy but cute",
"future|Which bucket-list item is a must?|Skydiving|Seeing the northern lights|A safari|Running a marathon",
"future|A whole free year would be spent...|Travelling|Learning something new|Starting a business|Resting properly",
"future|Which would you rather own?|A café|A bookshop|A bakery|A farm",
"future|What's your big five-year goal?",
"future|Where would you love a holiday home?|Back where my family is from|Somewhere sunny in Europe|In the mountains|Somewhere totally new",
"future|Which family tradition would you start?|Sunday dinners|A yearly trip|Game nights|Volunteering together",
"future|Who would be your dream dinner guest, alive or not?",
"future|Would you go to space if you could?|First in line|Just to orbit|No way|Only with you",
"future|Our perfect weekend in five years?|Lazy at home|Out adventuring|Busy with family and friends|Away on a trip",
"future|Which skill would you master instantly?|A new language|An instrument|Cooking|Coding",
"future|If you wrote a book, what would it be about?",
"future|What would you invent?|A teleporter|A time machine|A self-cleaning house|A mug that keeps chai hot forever",
"future|How do you want to celebrate turning 40?|Huge party|Quiet dinner|A trip away|Pretend it never happened",
"future|How many hours of sleep would future you get?|6|8|10|Unlimited",
"future|What's one thing you'd love to be known for one day?",
/* would you rather */
"wyr|Would you rather fly or be invisible?|Fly|Be invisible",
"wyr|Would you rather give up chocolate or cheese forever?|Chocolate|Cheese",
"wyr|Would you rather always be 10 minutes late or 20 minutes early?|10 minutes late|20 minutes early",
"wyr|Would you rather live without music or without films?|Without music|Without films",
"wyr|Would you rather have a rewind button or a pause button for life?|Rewind|Pause",
"wyr|Would you rather be famous or rich?|Famous|Rich",
"wyr|Would you rather talk to animals or speak every language?|Talk to animals|Speak every language",
"wyr|Would you rather quit social media or quit TV forever?|Quit social media|Quit TV",
"wyr|Would you rather be a bit too hot or a bit too cold?|Too hot|Too cold",
"wyr|Would you rather eat only sweet or only savoury food for a year?|Only sweet|Only savoury",
"wyr|Would you rather live in the past or the future?|The past|The future",
"wyr|Would you rather have breakfast for dinner or dinner for breakfast?|Breakfast for dinner|Dinner for breakfast",
"wyr|Would you rather have a personal chef or a personal driver?|Personal chef|Personal driver",
"wyr|Would you rather be a famous singer or a famous actor?|Singer|Actor",
"wyr|Would you rather lose your phone or your wallet?|My phone|My wallet",
"wyr|Would you rather explore space or the deep ocean?|Space|The deep ocean",
"wyr|Would you rather have free flights for life or free food for life?|Free flights|Free food",
"wyr|Would you rather win a dance-off or a rap battle?|Dance-off|Rap battle",
"wyr|Would you rather live in a treehouse or on a houseboat?|Treehouse|Houseboat",
"wyr|Would you rather only whisper or only shout for a day?|Whisper|Shout",
"wyr|Would you rather have a pet dragon or be a dragon?|Have a dragon|Be a dragon",
"wyr|Would you rather never sit in traffic again or never catch a cold again?|No traffic|No colds",
"wyr|Would you rather read minds or see the future?|Read minds|See the future",
"wyr|Would you rather spend a day at a theme park or a spa?|Theme park|Spa",
"wyr|Would you rather be the funniest or the smartest person in the room?|Funniest|Smartest",
"wyr|Would you rather have a cosy rainy day in or a sunny day out?|Rainy day in|Sunny day out",
"wyr|Would you rather headline a festival or write a hit song for someone else?|Headline a festival|Write the hit",
"wyr|Would you rather have a house by the beach or in the mountains?|Beach|Mountains",
/* pet peeves */
"peeve|What annoys you the most?|Loud chewing|People being late|Slow walkers|Speakerphone in public",
"peeve|Biggest texting pet peeve?|A reply of just 'k'|Being left on read|Five-minute voice notes|Way too many emojis",
"peeve|What makes you rage on the road?|No indicators|Tailgaters|Slow drivers in the fast lane|Terrible parking",
"peeve|Which household crime is the worst?|Empty carton back in the fridge|Wet towel on the bed|Dishes left in the sink|Toilet roll not replaced",
"peeve|Worst thing in a cinema?|Glowing phones|People talking|Seat kicking|Loud crunchy snacks",
"peeve|Which noise drives you mad?|Nails on a board|Alarm snoozing over and over|A dripping tap|Loud typing",
"peeve|Restaurant pet peeve?|Slow service|The wrong order|Someone stealing off my plate|Splitting-the-bill drama",
"peeve|What tiny thing annoys you way more than it should?",
"peeve|When someone jumps the queue you...|Say something|Glare silently|Don't care|Complain about it later",
"peeve|What ruins a good mood fastest?|Being hungry|Being tired|Rude people|Bad Wi-Fi",
"peeve|Most annoying phone habit in other people?|Videos without headphones|Checking their phone mid-chat|Never replying|Keyboard click sounds on",
"peeve|Which grammar crime hurts you most?|Your vs you're|Their, there and they're|Random capital letters|I genuinely don't care",
"peeve|What's the worst kind of guest?|The one who overstays|The one who shows up early|Shoes on indoors|Arrives empty-handed",
"peeve|Which chore do you hate most?|Washing dishes|Laundry|Hoovering|Taking the bins out",
"peeve|Biggest social pet peeve?|Interrupting|One-upping every story|Name-dropping|Always on their phone",
"peeve|Which weather is the worst?|Endless rain|Snow and ice|A heatwave|Strong wind",
"peeve|Worst way to be woken up?|An alarm|Loud neighbours|Someone shaking me|Sunlight in my face",
"peeve|Which is worse?|Cold food that should be hot|Warm drinks that should be cold|Soggy chips|Stale bread",
"peeve|Online shopping pet peeve?|Late delivery|Wrong size|Missed-delivery card|Mountains of packaging",
"peeve|What can't you stand at work or school?|Pointless meetings|Group projects|Reply-all emails|Noisy people nearby",
"peeve|Worst sound when you're trying to sleep?|Snoring|A ticking clock|A buzzing phone|A mosquito",
"peeve|What do you hate about public transport?|The crowds|Delays|Loud music|Strange smells",
"peeve|Which phrase annoys you the most?|'Calm down'|'No offence, but'|'It is what it is'|'Per my last message'",
"peeve|Someone eats your leftovers. You...|Plan revenge|Sulk|Let it go|Label everything from now on",
"peeve|Which food smell can you not stand?",
"peeve|What do you do when someone chews loudly near you?|Move away|Put headphones in|Say something|Suffer in silence",
/* what would I do if... */
"whatif|You find a wallet full of cash. What do you do?|Hand it in|Track down the owner myself|Keep it (just kidding)|Post online to find them",
"whatif|You win a surprise trip leaving tomorrow. You...|Go, no questions|Plan it carefully first|Give it to family|Try to swap the dates",
"whatif|If you were invisible for a day, you would...|Pull pranks|Sneak into a concert|Raid a bakery|Quietly listen to what people say about me",
"whatif|If you got stuck in a lift with a celebrity, who would you want it to be?",
"whatif|A spider lands on you. You...|Scream|Calmly brush it off|Run|Move house",
"whatif|If you were a superhero, your power would be...|Teleportation|Super strength|Mind reading|Freezing time",
"whatif|You see a ghost. You...|Run|Try to chat to it|Film it|Faint",
"whatif|If you could only eat one meal forever, what would it be?",
"whatif|Everyone is safe, but the house is on fire. What do you grab?|My phone|Photo albums|Something with sentimental value|My laptop",
"whatif|Day one of a zombie apocalypse, you are...|Leading the survivors|Hiding in the loft|The first to go|Raiding the supermarket",
"whatif|If you could swap lives with anyone for a day, who would it be?",
"whatif|If you were a kitchen appliance, you'd be...|A toaster|A kettle|A microwave|A blender",
"whatif|If you were an animal, which would you be?|A cat|A dog|An owl|A sloth",
"whatif|A whole day with no phone. You...|Read a book|Go outside|Sleep|Panic",
"whatif|If you could time-travel once, where would you go?|Way back to meet my ancestors|The far future|A famous moment in history|Last week, to fix a mistake",
"whatif|If you were on a game show, which kind would you win?|Quiz|Physical challenges|Cooking|Singing",
"whatif|If you met royalty, you would...|Bow perfectly|Crack a joke|Freeze|Ask for a selfie",
"whatif|If you had to get a tattoo tomorrow, it would be...|Something meaningful|Something tiny|A matching one with you|Nothing, I'd run",
"whatif|A genie gives you one wish. What is it?",
"whatif|You get lost in a forest. You...|Navigate out calmly|Climb a tree to look|Cry a bit|Build a shelter and live there",
"whatif|Which fictional character would you be for a day?",
"whatif|If you opened a restaurant, what would you serve?|Home-style desi food|Fusion experiments|Desserts only|Breakfast all day",
"whatif|You bump into your ex at a party. You...|Say hi|Avoid them|Leave|Introduce them to me",
"whatif|If you had to live in one room forever?|Kitchen|Bedroom|Living room|Bathroom, weirdly",
"whatif|You have to give a speech with one minute's notice. You...|Smash it confidently|Make it all jokes|Shake the whole time|Fake an emergency",
"whatif|If you suddenly had a million, what's the first thing you'd buy?",
"whatif|If you could have any job for just one day, what would it be?"
];

/* harder questions for the Final Wager */
var HARD=[
"hard|What's your biggest fear in life?|Losing the people I love|Failing at something big|Being alone|Something physical, like heights",
"hard|What are you most proud of so far?",
"hard|What's one thing you'd change about your past?",
"hard|Which family member are you most like?|My mum|My dad|A grandparent|A sibling or cousin",
"hard|What would you title your autobiography?",
"hard|What's your most treasured possession?",
"hard|What time did you fall asleep last night?|Before 10|10 to midnight|Midnight to 2|After 2",
"hard|What's the last thing that made you cry?",
"hard|How many unread emails do you have right now?|Under 10|10 to 100|100 to 1,000|Over 1,000",
"hard|What's a dream you rarely say out loud?",
"hard|Which of your traits do you like least?|Stubbornness|Overthinking|Impatience|Procrastination",
"hard|What would your friends say is your most annoying habit?",
"hard|What's the one food you refuse to eat?",
"hard|What was the first concert or live show you went to?",
"hard|Who was your very first best friend?",
"hard|If you could change your first name, what would it be?",
"hard|What's your shoe size?",
"hard|Which colour do you wear the most?|Black|White or grey|Blue|Bright colours",
"hard|What's your biggest regret from school?",
"hard|Which job would you be worst at?|Teacher|Chef|Surgeon|Stand-up comedian",
"hard|What's your phone wallpaper right now?",
"hard|What was the last thing you bought online?",
"hard|What's the first thing you'd do as leader of the country for a day?",
"hard|How tidy are you, honestly?|Messy|A bit messy|Mostly tidy|Spotless",
"hard|What's the fanciest meal you've ever had?|A nice local place|A posh restaurant|A wedding feast|Nothing beats home food",
"hard|Which friend would survive longest in a zombie apocalypse?",
"hard|What's your most-played song this month?",
"hard|What age do you feel inside?|Under 18|18 to 25|26 to 40|An ancient soul",
"hard|What's the worst present you've ever received?",
"hard|Which smell reminds you of home?",
"hard|What was your first ever job or way of earning money?",
"hard|What's the bravest thing you've ever done?",
"hard|Which compliment do you remember most?",
"hard|What do you do first when you're really stressed?|Go quiet|Eat|Talk to someone|Clean or organise",
"hard|Which teacher had the biggest influence on you?",
"hard|What were you doing at exactly this time last year?|Working or studying|Out with friends or family|At home relaxing|No idea at all"
];

/* Who's more likely to... (completed by the prompt) */
var LIKELY=[
"forget an anniversary","cry during a film","get lost even with GPS on","eat the last slice without asking","start an argument about nothing",
"win a dance-off","fall asleep first on film night","become famous","spend all their money on food","adopt a stray animal",
"laugh at the wrong moment","burn the toast","chat to total strangers","survive a zombie apocalypse","get a tattoo on a whim",
"be late to their own wedding","burst into song in public","cancel plans to stay in bed","spend an hour choosing a film","apologise first",
"forget where they parked","binge a whole series in a day","reply to a text instantly","lose their keys this week","plan a big surprise",
"eat dessert before dinner","cry at someone else's wedding","become best friends with the waiter","take 100 selfies on holiday","scream during a horror film",
"go viral online","become a morning person","win a TV quiz show","talk in their sleep","steal all the blanket",
"make a new friend in a queue","leave the dishes 'to soak'","forget someone's name straight after hearing it","try every free sample","overpack for a weekend away",
"get sunburnt on the first day","accidentally like an old photo","follow the five-second rule","give up first in a workout","kill a houseplant",
"cry happy tears","argue with the sat-nav","say 'I told you so'","fall for a prank","pull an elaborate prank",
"sulk after losing a board game","cheat at a board game","set off the smoke alarm while cooking","become a millionaire","sleep through their alarm",
"buy something useless online at 2 a.m.","hide snacks around the house","eat the other's leftovers","charm the in-laws","remember every birthday",
"tell an embarrassing story at a family party","snort while laughing","win an argument","take the longest shower","sing the wrong lyrics confidently",
"get lost in a shopping centre","talk their way out of trouble","make friends with a celebrity","stay up all night talking","fall over on the dance floor",
"forget to reply for a week","get emotional at an advert","try a ridiculous new diet","wake up grumpy","order the same thing every time",
"refuse to ask for directions","end up with three cats","eat cold pizza for breakfast","make the bed every morning","sign up for a reality show",
"announce 'I'm hungry' first","pretend to know a song","jump into a freezing lake","run out of phone battery","dance in the supermarket aisle",
"write a love letter","get chased by a goose","scream on a rollercoaster","bring home a souvenir nobody needs","start a video channel",
"lose their voice from singing","nod off in a meeting","mispronounce a fancy dish","overreact to a spider","cry at a puppy video",
"say 'five more minutes' and mean an hour","forget why they walked into a room","plan the next holiday","win at rock-paper-scissors","laugh at their own joke",
"secretly watch the next episode alone","start a car singalong","do a spot-on impression of the other","be called the fun one at a party","make everyone late",
"take ages getting ready","end up on the big screen at a match","forgive first","spend a fortune on a hobby","keep a gift receipt 'just in case'",
"become a regular at a café","learn a new language for fun","know all the neighbours' names","binge-buy plants","talk to the dog more than to people"
];

/* Speed Round either/or questions about the hot-seat player */
var SPEED=[
["Tea","Coffee"],["Beach","Mountains"],["Early bird","Night owl"],["Cats","Dogs"],["Sweet","Salty"],["Summer","Winter"],
["Text","Call"],["Pizza","Burger"],["Book","Film"],["City","Countryside"],["Morning shower","Night shower"],["Sunrise","Sunset"],
["Staying in","Going out"],["Chocolate","Crisps"],["Comedy","Horror"],["Window seat","Aisle seat"],["Shoes off","Shoes on"],["Big party","Small dinner"],
["Spicy","Mild"],["Plan ahead","Go with the flow"],["Hugs","Kisses"],["Rain","Sunshine"],["Pen","Pencil"],["Bath","Shower"],
["Heels","Trainers"],["Sofa","Bed"],["Silver","Gold"],["Lift","Stairs"],["Netflix","YouTube"],["Ice cream","Cake"],
["Left side of the bed","Right side of the bed"],["Pancakes","Waffles"],["Road trip","Flight"],["Dance","Sing"],["Sunglasses","Hat"],["Breakfast","Dinner"],
["Car","Bike"],["Ketchup","Mayo"],["Hoodie","Jacket"],["Fruit","Sweets"],["Fast","Slow"],["Poster","Fairy lights"],
["Stars","Moon"],["Hot chocolate","Milkshake"],["Theme park","Museum"],["Video call","Voice call"],["Gym","Yoga"],["Thunderstorm","Snowfall"],
["Cook","Order in"],["Jeans","Joggers"],["Lazy Sunday","Busy Saturday"],["Phone left","Phone right pocket"],["Ocean","Pool"],["Mango","Strawberry"],
["Noodles","Rice"],["Backpack","Handbag"],["Puzzles","Video games"],["Photos","Videos"],["Board games","Card games"],["Old films","New films"],
["Socks","Barefoot"],["Front seat","Back seat"],["Sleep in","Wake up early"],["Forest","Desert"],["Candles","Bright lights"],["Spontaneous","Organised"],
["Popcorn","Nachos"],["Samosa","Pakora"],["Garlic bread","Chips"],["Halloween","New Year's Eve"],["Aeroplane","Train"],["Cheese","Chocolate"],
["Roses","Sunflowers"],["Podcast","Music"],["Window open","Window shut"],["Paper map","GPS"],["Hot weather","Cold weather"],["Smooth","Crunchy peanut butter"]
];

/* Fact or Fiction sentence starters */
var STARTERS=["I've never...","I once...","When I was little I...","I secretly...","I'm scared of...","I can...","I've been to...","My first...","I hate...","I've met..."];

var CATS={food:['🍕','Food & cravings'],habit:['⏰','Habits'],kid:['🧸','Childhood'],travel:['✈️','Travel'],screen:['🎬','Movies & TV'],music:['🎵','Music'],
  love:['💘','Romance'],oops:['🙈','Embarrassing moments'],future:['🔮','Future dreams'],wyr:['⚖️','Would you rather'],peeve:['😤','Pet peeves'],
  whatif:['🤔','What would I do if...'],hard:['🔥','Tough one'],custom:['✍️','Your own question']};

var RT={
  gma:{n:'Guess My Answer',i:'🎯',d:"One of you sits in the hot seat and secretly answers a question about yourself. The other secretly predicts that answer. Guess right and the guesser scores +1. Seats swap every question."},
  likely:{n:"Who's More Likely To...",i:'👉',d:"You both secretly point at one of you. Point at the same person and you're in sync: +1 each!"},
  fof:{n:'Fact or Fiction',i:'🕵️',d:"The hot-seat player writes a statement about themself that is true or totally made up. The partner calls it. Right call = +1 to the guesser, a successful bluff = +1 to the bluffer."},
  speed:{n:'Speed Round',i:'⚡',d:"Six lightning either/or questions, 5 seconds each. The hot-seat player answers for real while the partner predicts at the same time. Every match = +1 for the guesser. Seats swap every question."},
  final:{n:'Final Wager',i:'💰',d:"Bet 0 to 5 of your points in secret. Then, at the same time, answer one tough question about yourself and predict your partner's answer to theirs. Right = win your bet. Wrong = lose it."}
};
var GMA_N={quick:4,classic:6},LIKELY_N=6,FOF_N=4,SPEED_N=6,SPEED_MS=5000,SPEED_GRACE=800,MAXCUSTOM=24;

function oth(r){return r==='host'?'guest':'host'}
function parseQ(s,i,pre){var p=s.split('|');return {id:pre+i,cat:p[0],t:p[1],o:p.length>2?p.slice(2):null}}
function kindOf(q){return !q.o?'typed':q.o.length===2?'two':'multi'}
function clean(s,max){return String(s==null?'':s).replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max)}
function norm(s){return String(s||'').toLowerCase().replace(/[^a-z0-9À-￿]+/g,' ').replace(/\b(the|a|an|my|of)\b/g,' ').replace(/\s+/g,' ').trim()}
function L(i){return 'ABCD'.charAt(i)}
/* a Fact or Fiction statement must be more than a bare sentence starter */
function okStmt(t){t=clean(t,140);if(t.length<8)return false;var n=norm(t);return !STARTERS.some(function(s){return norm(s)===n})}

/* ---------- authoritative core (host only) ---------- */
function makeCore(seed,rngf){
  var R=rngf(((seed|0)^0x51f15e)|0);
  function shuf(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(R()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
  var all=BANK.map(function(s,i){return parseQ(s,i,'b')}),hard=HARD.map(function(s,i){return parseQ(s,i,'h')});
  var deck={typed:shuf(all.filter(function(q){return !q.o})),two:shuf(all.filter(function(q){return q.o&&q.o.length===2})),
    multi:shuf(all.filter(function(q){return q.o&&q.o.length>2})),htyped:shuf(hard.filter(function(q){return !q.o})),hmulti:shuf(hard.filter(function(q){return q.o})),
    likely:shuf(LIKELY),speed:shuf(SPEED)};
  var ptr={};
  function draw(k){var d=deck[k];ptr[k]=(ptr[k]||0);var x=d[ptr[k]%d.length];ptr[k]++;return x}
  var first=R()<.5?'host':'guest';                     /* seeded coin flip for the very first hot seat */
  var mid=['likely','fof','speed'][Math.floor(R()*3)];  /* the Quick game's middle round */
  var S={q:0,sid:0,phase:'lobby',len:'quick',ready:{host:false,guest:false},custom:[],
    lineup:{quick:['gma',mid,'final'],classic:['gma','likely','fof','speed','final']},
    rounds:null,ri:-1,first:first,lead:null,score:{host:0,guest:0},rpts:{host:0,guest:0},ropp:{host:0,guest:0},
    T:null,ti:0,tn:0,log:[]};
  var PLAN=[],H=null,cid=0;  /* PLAN and H are private: upcoming questions and hidden answers never leave the host */

  function bump(){S.sid++;S.ready={host:false,guest:false}}
  function award(r,n){S.score[r]+=n;S.rpts[r]+=n}
  function useCustoms(n){
    var free=shuf(S.custom.filter(function(c){return !c.used})).slice(0,Math.floor(n/2));
    free.forEach(function(c){c.used=true});
    return free.map(function(c){return {id:'c'+c.id,cat:'custom',t:c.t,o:c.o?c.o.slice():null,by:c.by}});
  }
  function gmaPlan(n,lead){
    /* questions come in pairs (one per player) of the same kind, so both players face equally hard odds */
    var cu=useCustoms(n),pairs=[],i;
    for(i=0;i<n/2;i++){
      var a=null,b=null;
      if(cu.length){a=cu.shift();b=cu.length?cu.shift():null}
      var kind=a?kindOf(a):(function(){var x=R();return x<.25?'typed':x<.4?'two':'multi'})();
      if(!a)a=draw(kind);
      if(!b)b=draw(kind);
      pairs.push(R()<.5?[a,b]:[b,a]);
    }
    var out=[];
    pairs.forEach(function(p){out.push({type:'gma',subj:lead,q:p[0]});out.push({type:'gma',subj:oth(lead),q:p[1]})});
    return out;
  }
  function startRound(){
    var type=S.rounds[S.ri],lead=S.ri%2===0?S.first:oth(S.first),i;
    S.lead=lead;S.rpts={host:0,guest:0};S.ropp={host:0,guest:0};PLAN=[];
    if(type==='gma')PLAN=gmaPlan(GMA_N[S.len],lead);
    else if(type==='likely')for(i=0;i<LIKELY_N;i++)PLAN.push({type:'likely',p:draw('likely')});
    else if(type==='fof')for(i=0;i<FOF_N;i++)PLAN.push({type:'fof',subj:i%2?oth(lead):lead});
    else if(type==='speed'){var it=[];for(i=0;i<SPEED_N;i++)it.push({subj:i%2?oth(lead):lead,a:draw('speed').slice()});PLAN.push({type:'speed',items:it})}
    else if(type==='final'){var k=R()<.5?'htyped':'hmulti';PLAN.push({type:'final',qs:{host:draw(k),guest:draw(k)}})}
    S.ti=0;S.tn=PLAN.length;beginTurn();
  }
  function beginTurn(){
    var p=PLAN[S.ti],T={type:p.type,lock:{host:false,guest:false},rev:null};
    if(p.type==='gma'){T.subj=p.subj;T.q=p.q;T.tp='answer';T.res=null;T.auto=false;H={};S.ropp[oth(p.subj)]++}
    else if(p.type==='likely'){T.p=p.p;T.tp='answer';T.synced=null;H={};S.ropp.host++;S.ropp.guest++}
    else if(p.type==='fof'){T.subj=p.subj;T.tp='write';T.stmt=null;T.res=null;H={};S.ropp.host++;S.ropp.guest++}
    else if(p.type==='speed'){T.items=p.items;T.k=0;T.tp='answer';T.res=null;H={host:[],guest:[]};
      p.items.forEach(function(it){S.ropp[oth(it.subj)]++})}
    else if(p.type==='final'){T.qs=p.qs;T.tp='wager';T.res={host:null,guest:null};T.applied=false;
      T.max={host:Math.max(0,Math.min(5,S.score.host)),guest:Math.max(0,Math.min(5,S.score.guest))};
      H={wager:{},self:{},guess:{}};S.ropp.host++;S.ropp.guest++}
    S.T=T;S.phase='play';bump();
  }
  function resolved(){
    var T=S.T;if(!T)return false;
    if(T.type==='gma')return T.tp==='reveal'&&T.res!==null;
    if(T.type==='final')return T.applied;
    return T.tp==='reveal';
  }
  function endRound(){
    S.log.push({type:S.rounds[S.ri],pts:{host:S.rpts.host,guest:S.rpts.guest},opp:{host:S.ropp.host,guest:S.ropp.guest},lead:S.lead});
    S.T=null;
    if(S.ri>=S.rounds.length-1)S.phase='over';
    else S.phase='between';
    bump();
  }
  function advance(){
    if(S.phase==='lobby'){S.rounds=S.lineup[S.len].slice();S.ri=0;S.phase='title';bump();return}
    if(S.phase==='title'){startRound();return}
    if(S.phase==='between'){S.ri++;S.phase='title';bump();return}
    if(S.phase==='play'){S.ti++;if(S.ti<S.tn)beginTurn();else endRound()}
  }
  function validAns(q,v){
    if(!q)return null;
    if(q.o){var n=+v;return (n===Math.floor(n)&&n>=0&&n<q.o.length)?n:null}
    var t=clean(v,60);return t?t:null;
  }
  function same(q,a,b){if(a==null||b==null)return false;return q.o?a===b:norm(a)===norm(b)&&norm(a)!==''}
  function gmaReveal(){
    var T=S.T,g=oth(T.subj);
    T.rev={subj:H[T.subj],guess:H[g]};T.tp='reveal';
    if(T.q.o){T.res=H[T.subj]===H[g]}
    else if(same(T.q,H[T.subj],H[g])){T.res=true;T.auto=true}
    else T.res=null;
    if(T.res)award(g,1);
    bump();
  }
  function speedNext(){
    var T=S.T;T.k++;T.lock={host:false,guest:false};
    if(T.k>=T.items.length){
      T.tp='reveal';T.rev={host:H.host.slice(),guest:H.guest.slice()};
      T.res=T.items.map(function(it,i){var s=H[it.subj][i],g=H[oth(it.subj)][i];return s!=null&&s===g});
      T.res.forEach(function(ok,i){if(ok)award(oth(T.items[i].subj),1)});
      for(var i=0;i<T.items.length;i++){if(T.rev.host[i]===undefined)T.rev.host[i]=null;if(T.rev.guest[i]===undefined)T.rev.guest[i]=null}
    }
    bump();
  }
  function finalReveal(){
    var T=S.T;T.tp='reveal';
    T.rev={wager:{host:H.wager.host,guest:H.wager.guest},self:{host:H.self.host,guest:H.self.guest},guess:{host:H.guess.host,guest:H.guess.guest}};
    T.auto={host:false,guest:false};
    ['host','guest'].forEach(function(x){
      var q=T.qs[x],a=H.self[x],g=H.guess[oth(x)];
      if(q.o)T.res[x]=a===g;
      else if(same(q,a,g)){T.res[x]=true;T.auto[x]=true}
      else T.res[x]=null;
    });
    finalApply();bump();
  }
  function finalApply(){
    var T=S.T;if(T.applied||T.res.host===null||T.res.guest===null)return;
    ['host','guest'].forEach(function(x){var y=oth(x),w=T.rev.wager[y]|0;award(y,T.res[x]?w:-w)});
    T.applied=true;
  }
  /* returns true when the state changed */
  function apply(role,a){
    if(!a||typeof a!=='object'||(role!=='host'&&role!=='guest'))return false;
    var k=a.a,ph=S.phase,T=S.T,o=oth(role);
    if(ph==='lobby'){
      if(k==='len'){
        if(role!=='host'||(a.v!=='quick'&&a.v!=='classic')||a.v===S.len)return false;
        S.len=a.v;bump();return true;  /* changing the length cancels both Ready votes */
      }
      if(k==='add'){
        var t=clean(a.t,140);if(!t||S.custom.length>=MAXCUSTOM)return false;
        if(S.custom.some(function(c){return norm(c.t)===norm(t)}))return false;
        var op=null;
        if(Array.isArray(a.o)){op=[];a.o.slice(0,4).forEach(function(x){x=clean(x,40);if(x&&op.indexOf(x)<0)op.push(x)});if(op.length<2)op=null}
        S.custom.push({id:++cid,by:role,t:t,o:op,used:false});return true;
      }
      if(k==='del'){
        for(var i=0;i<S.custom.length;i++)if(S.custom[i].id===a.id&&S.custom[i].by===role){S.custom.splice(i,1);return true}
        return false;
      }
    }
    if((a.sid|0)!==S.sid)return false; /* stale or duplicate */
    if(k==='ready'){
      if(S.ready[role])return false;
      if(ph==='play'&&!resolved())return false;
      if(ph!=='lobby'&&ph!=='title'&&ph!=='between'&&ph!=='play')return false;
      S.ready[role]=true;
      if(S.ready.host&&S.ready.guest)advance();
      return true;
    }
    if(ph!=='play'||!T)return false;
    if(T.type==='gma'){
      if(k==='ans'){
        if(T.tp!=='answer'||T.lock[role])return false;
        var v=validAns(T.q,a.v);if(v===null)return false;
        H[role]=v;T.lock[role]=true;
        if(T.lock.host&&T.lock.guest)gmaReveal();
        return true;
      }
      if(k==='judge'){
        if(T.tp!=='reveal'||T.res!==null||role!==T.subj)return false;
        T.res=!!a.v;if(T.res)award(o,1);return true;
      }
      return false;
    }
    if(T.type==='likely'){
      if(k!=='ans'||T.tp!=='answer'||T.lock[role]||(a.v!=='host'&&a.v!=='guest'))return false;
      H[role]=a.v;T.lock[role]=true;
      if(T.lock.host&&T.lock.guest){
        T.rev={host:H.host,guest:H.guest};T.synced=H.host===H.guest;T.tp='reveal';
        if(T.synced){award('host',1);award('guest',1)}
        bump();
      }
      return true;
    }
    if(T.type==='fof'){
      if(k==='stmt'){
        if(T.tp!=='write'||role!==T.subj)return false;
        var st=clean(a.text,140);if(!okStmt(st)||typeof a.truth!=='boolean')return false;
        T.stmt=st;H.truth=a.truth;T.lock[role]=true;T.tp='guess';bump();return true;
      }
      if(k==='ans'){
        if(T.tp!=='guess'||role===T.subj||typeof a.v!=='boolean')return false;
        H.guess=a.v;T.lock[role]=true;T.rev={truth:H.truth,guess:H.guess};T.res=H.guess===H.truth;T.tp='reveal';
        award(T.res?role:T.subj,1);bump();return true;
      }
      return false;
    }
    if(T.type==='speed'){
      if(k!=='ans'||T.tp!=='answer'||a.k!==T.k||T.lock[role]||(a.v!==0&&a.v!==1))return false;
      H[role][T.k]=a.v;T.lock[role]=true;
      if(T.lock.host&&T.lock.guest)speedNext();
      return true;
    }
    if(T.type==='final'){
      if(k==='wager'){
        var w=+a.v;if(T.tp!=='wager'||T.lock[role]||w!==Math.floor(w)||w<0||w>T.max[role])return false;
        H.wager[role]=w;T.lock[role]=true;
        if(T.lock.host&&T.lock.guest){T.tp='answer';T.lock={host:false,guest:false};bump()}
        return true;
      }
      if(k==='ans'){
        if(T.tp!=='answer'||T.lock[role])return false;
        var sv=validAns(T.qs[role],a.self),gv=validAns(T.qs[o],a.guess);
        if(sv===null||gv===null)return false;
        H.self[role]=sv;H.guess[role]=gv;T.lock[role]=true;
        if(T.lock.host&&T.lock.guest)finalReveal();
        return true;
      }
      if(k==='judge'){
        if(T.tp!=='reveal'||T.res[role]!==null)return false;
        T.res[role]=!!a.v;finalApply();return true;
      }
    }
    return false;
  }
  /* a speed question ran out of time: missing answers count as no match */
  function timeout(k){
    var T=S.T;if(S.phase!=='play'||!T||T.type!=='speed'||T.tp!=='answer'||T.k!==k)return false;
    speedNext();return true;
  }
  /* what one player is allowed to see: the shared state plus only their own hidden answers */
  function view(role){
    var v=JSON.parse(JSON.stringify(S)),T=S.T,m=null;
    if(T&&H&&S.phase==='play'){
      if(T.type==='gma'||T.type==='likely'){if(T.tp==='answer'&&H[role]!==undefined)m=H[role]}
      else if(T.type==='fof'){if(role===T.subj&&T.tp!=='reveal'&&H.truth!==undefined)m={truth:H.truth}}
      else if(T.type==='speed'){if(T.tp==='answer')m=H[role].slice()}
      else if(T.type==='final'){if(T.tp!=='reveal')m={wager:H.wager[role],self:H.self[role],guess:H.guess[role]}}
    }
    v.mine=m===undefined?null:m;
    return v;
  }
  return {S:S,apply:apply,view:view,timeout:timeout,_plan:function(){return PLAN}};
}

/* ---------- styles ---------- */
var CSS=[
'.kw{--pk:#ff5c8a;--pkd:#b3164f;--bl:#58c7ff;--bld:#1664a8;--gd:#ffd166;--ok:#4ade80;--no:#ff5a6a;max-width:780px;margin:0 auto;padding:2px 0 30px;font-family:var(--font,inherit);color:var(--ink,#f6f5ff)}',
'.kw *{box-sizing:border-box}',
'.kw button{margin:0;font-family:inherit}',
'.kw-stage{position:relative;overflow:hidden;border-radius:30px;padding:18px 14px 0;isolation:isolate;',
'background:radial-gradient(120% 60% at 50% 112%,rgba(155,107,255,.55),transparent 60%),radial-gradient(70% 50% at 50% -10%,rgba(255,209,102,.16),transparent 70%),linear-gradient(180deg,#120a33,#080617 70%);',
'border:1px solid rgba(255,255,255,.1);box-shadow:0 20px 50px rgba(0,0,0,.55),inset 0 0 80px rgba(0,0,0,.6)}',
'.kw-bulbs{position:absolute;inset:7px;border-radius:24px;border:4px dotted rgba(255,209,102,.75);pointer-events:none;z-index:0;animation:kwbulb 1.1s steps(2) infinite}',
'.kw-spot{position:absolute;top:-6%;width:58%;height:118%;pointer-events:none;z-index:0;mix-blend-mode:screen;opacity:.55;transform-origin:50% 0;clip-path:polygon(46% 0,54% 0,100% 100%,0 100%)}',
'.kw-spot.l{left:-14%;background:linear-gradient(180deg,rgba(255,92,138,.7),rgba(255,92,138,0) 80%);animation:kwswayl 7s ease-in-out infinite alternate}',
'.kw-spot.r{right:-14%;background:linear-gradient(180deg,rgba(88,199,255,.7),rgba(88,199,255,0) 80%);animation:kwswayr 8s ease-in-out infinite alternate}',
'.kw-stage>*:not(.kw-spot):not(.kw-bulbs):not(.kw-conf){position:relative;z-index:2}',
/* logo + top bar */
'.kw-logo{text-align:center;line-height:.92;font-weight:800;text-transform:uppercase;letter-spacing:.02em;margin:6px 0 2px;user-select:none}',
'.kw-logo .a{display:block;font-size:clamp(1.3rem,4.6vw,2.1rem);color:#fff;text-shadow:0 0 4px #fff,0 0 14px var(--pk),0 0 32px var(--pk);animation:kwflicker 5s infinite}',
'.kw-logo .b{display:block;font-size:clamp(2rem,8vw,3.6rem);background:linear-gradient(180deg,#fff3c4,#ffd166 40%,#ff9a3c);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 12px rgba(255,170,60,.65)) drop-shadow(0 3px 0 #7a2d00)}',
'.kw-logo .m{display:block;font-size:1.6rem;margin-bottom:2px;filter:drop-shadow(0 0 10px rgba(255,209,102,.6))}',
'.kw-logo.sm{margin:0}.kw-logo.sm .a{font-size:.82rem;letter-spacing:.08em}.kw-logo.sm .b{font-size:1.25rem}.kw-logo.sm .m{display:none}',
'.kw-top{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;padding:0 10px}',
'.kw-pills{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}',
'.kw-pill{background:rgba(0,0,0,.35);border:1px solid rgba(255,209,102,.35);color:#ffe6a6;border-radius:999px;padding:4px 11px;font-weight:700;font-size:.8rem;white-space:nowrap}',
'.kw-snd{background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.15);color:#fff;border-radius:999px;padding:4px 9px;font-size:.85rem;box-shadow:none}',
/* main screen */
'.kw-screen{margin:12px auto 0;max-width:620px;border-radius:24px;padding:18px 16px 18px;text-align:center;',
'background:linear-gradient(165deg,rgba(46,28,110,.94),rgba(14,10,42,.96));border:1.5px solid rgba(155,107,255,.55);',
'box-shadow:0 0 0 5px rgba(155,107,255,.1),0 0 40px rgba(155,107,255,.25),0 18px 40px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.1)}',
'.kw-tag{color:#d8d5ff;margin:4px 0 12px;font-size:.98rem}',
'.kw-cat{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:4px 12px;font-size:.78rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;background:rgba(255,209,102,.12);color:var(--gd);border:1px solid rgba(255,209,102,.35)}',
'.kw-role{margin:10px auto 0;font-weight:800;font-size:.95rem;border-radius:12px;padding:7px 12px;display:table}',
'.kw-role.hot{background:rgba(255,209,102,.14);color:#ffe08a}.kw-role.guess{background:rgba(155,107,255,.18);color:#d9c8ff}',
'.kw-about{margin-top:12px;font-size:.72rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#a9a7d3}',
'.kw-qt{font-size:clamp(1.25rem,4vw,1.6rem);line-height:1.28;font-weight:800;margin:6px 0 4px;letter-spacing:-.01em;text-wrap:balance;word-break:break-word}',
'.kw-sub{color:#b9b6e6;font-size:.92rem;margin:8px 0 0}',
'.kw-wait{color:#b9b6e6;font-style:italic;margin:14px 0 2px}',
'.kw-wait::after{content:"";display:inline-block;width:1.2em;text-align:left;animation:kwdots 1.4s steps(4) infinite}',
'.kw-locked{display:inline-flex;align-items:center;gap:8px;margin-top:14px;padding:10px 16px;border-radius:14px;background:rgba(74,222,128,.12);border:1.5px solid rgba(74,222,128,.45);font-weight:700}',
/* answer lozenges */
'.kw-opts{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}',
'.kw-opt{position:relative;display:flex;align-items:center;gap:10px;text-align:left;padding:12px 16px 12px 10px;color:#fff;font-weight:700;font-size:1rem;line-height:1.2;',
'background:linear-gradient(180deg,#2d2c86,#17165a);border:2px solid rgba(130,170,255,.6);border-radius:999px;box-shadow:0 0 14px rgba(88,140,255,.28),inset 0 1px 0 rgba(255,255,255,.18)}',
'.kw-opt>b{flex:0 0 auto;width:30px;height:30px;border-radius:50%;background:var(--gd);color:#2a1600;display:flex;align-items:center;justify-content:center;font-size:.9rem}',
'.kw-opt.on{background:linear-gradient(180deg,#ffc061,#ff8a00);color:#2a1600;border-color:#ffe9a8;box-shadow:0 0 24px rgba(255,180,60,.7)}',
'.kw-opt.on>b{background:#2a1600;color:var(--gd)}',
'.kw-opt:disabled{opacity:.55}',
'.kw-in{width:100%;margin:14px 0 0;padding:13px 16px;font:inherit;font-size:1.08rem;border-radius:14px;border:2px solid rgba(130,170,255,.5);background:rgba(5,4,20,.7);color:#fff;outline:none}',
'.kw-in:focus{border-color:var(--gd);box-shadow:0 0 0 4px rgba(255,209,102,.18)}',
'.kw-btn{display:inline-block;padding:13px 22px;border:0;border-radius:14px;font-weight:800;font-size:1.02rem;color:#2a1600;background:linear-gradient(135deg,#ffe08a,#ffb347);box-shadow:0 6px 18px rgba(0,0,0,.35),0 0 18px rgba(255,190,80,.25)}',
'.kw-btn.wide{width:100%;margin-top:14px}',
'.kw-btn.pink{background:linear-gradient(135deg,#ff8db0,#ff4d84);color:#2a0a1a}',
'.kw-btn.blue{background:linear-gradient(135deg,#8ee0ff,#4aa8ff);color:#06213a}',
'.kw-btn.soft{background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.16);box-shadow:none}',
'.kw-btn:disabled{opacity:.45}',
'.kw-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}.kw-row>*{flex:1;min-width:130px}',
'.kw-rdy{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:10px}',
'.kw-rdy span{font-size:.82rem;font-weight:700;padding:4px 11px;border-radius:999px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);color:#c9c6f2}',
'.kw-rdy span.ok{background:rgba(74,222,128,.15);border-color:rgba(74,222,128,.5);color:#d6ffe4}',
/* reveal */
'.kw-revs{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px;perspective:900px}',
'.kw-rev{--pc:var(--pk);border-radius:18px;padding:12px 12px 14px;background:linear-gradient(180deg,color-mix(in srgb,var(--pc) 22%,#120d36),#0e0b2a);border:2px solid var(--pc);box-shadow:0 0 20px color-mix(in srgb,var(--pc) 35%,transparent)}',
'.kw-rev.guest{--pc:var(--bl)}',
'.kw-rev small{display:block;font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;color:var(--pc);font-weight:800}',
'.kw-rev .v{font-size:1.12rem;font-weight:800;margin-top:6px;word-break:break-word}',
'.kw-rev.dim{opacity:.6}',
'.kw-burst{font-size:clamp(2rem,7vw,2.8rem);font-weight:800;letter-spacing:.04em;margin:14px 0 0;line-height:1}',
'.kw-burst.ding{color:var(--ok);text-shadow:0 0 8px rgba(74,222,128,.9),0 0 30px rgba(74,222,128,.6)}',
'.kw-burst.buzz{color:var(--no);text-shadow:0 0 8px rgba(255,90,106,.9),0 0 30px rgba(255,90,106,.6)}',
'.kw-burst+.kw-sub{font-weight:700;color:#fff}',
'.kw-judge{margin-top:12px;padding:12px;border-radius:16px;border:1.5px dashed rgba(255,209,102,.5);background:rgba(255,209,102,.06)}',
'.kw-judge p{margin:0 0 4px;font-weight:800}',
/* title card */
'.kw-tc .rn{letter-spacing:.32em;text-transform:uppercase;color:var(--gd);font-weight:800;font-size:.8rem}',
'.kw-tc .ic{font-size:4.2rem;line-height:1.1;margin:6px 0 0;filter:drop-shadow(0 6px 22px rgba(255,209,102,.55))}',
'.kw-tc h2{font-size:clamp(1.7rem,6vw,2.4rem);margin:4px 0 6px;font-weight:800;background:linear-gradient(90deg,#ff8db0,#ffd166,#8ee0ff);-webkit-background-clip:text;background-clip:text;color:transparent}',
'.kw-tc p{color:#d6d3ff;margin:6px auto;max-width:470px;line-height:1.45}',
'.kw-first{display:inline-block;margin-top:8px;padding:6px 14px;border-radius:999px;background:rgba(255,209,102,.14);border:1px solid rgba(255,209,102,.4);color:#ffe7a8;font-weight:800;font-size:.9rem}',
/* lobby */
'.kw-len{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px}',
'.kw-tile{display:flex;flex-direction:column;align-items:center;gap:2px;padding:14px 10px;border-radius:18px;color:#fff;background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.02));border:2px solid rgba(255,255,255,.14);box-shadow:none}',
'.kw-tile i{font-style:normal;font-size:1.8rem}.kw-tile b{font-size:1.1rem}.kw-tile small{color:#b9b6e6;font-weight:600}',
'.kw-tile.on{border-color:var(--gd);background:linear-gradient(180deg,rgba(255,209,102,.24),rgba(255,154,60,.08));box-shadow:0 0 22px rgba(255,209,102,.35)}',
'.kw-tile:disabled{opacity:.5}.kw-tile.on:disabled{opacity:1}',
'.kw-lineup{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:12px 0 4px}',
'.kw-lineup span{font-size:.78rem;font-weight:700;padding:4px 10px;border-radius:999px;background:rgba(155,107,255,.2);border:1px solid rgba(155,107,255,.4)}',
'.kw-cbox{margin-top:16px;padding:14px;border-radius:18px;background:rgba(0,0,0,.22);border:1px dashed rgba(255,255,255,.2);text-align:left}',
'.kw-cbox h4{margin:0 0 2px;font-size:1rem}.kw-cbox p{margin:0;color:#b9b6e6;font-size:.86rem}',
'.kw-cbox .kw-in{font-size:.98rem;padding:11px 14px;margin-top:8px}',
'.kw-cbox .kw-btn{margin-top:8px;padding:10px 16px;font-size:.92rem}',
'.kw-cl{list-style:none;margin:10px 0 0;padding:0;display:grid;gap:6px}',
'.kw-cl li{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:12px;background:rgba(255,255,255,.05);border-left:4px solid var(--pk);font-size:.9rem}',
'.kw-cl li.guest{border-left-color:var(--bl)}.kw-cl li span{flex:1;word-break:break-word}.kw-cl li em{color:#b9b6e6;font-style:normal;font-size:.8rem}',
'.kw-cl li button{padding:3px 9px;border-radius:8px;background:rgba(255,255,255,.1);color:#fff;box-shadow:none;font-size:.8rem}',
/* likely */
'.kw-who{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}',
'.kw-wc{--pc:var(--pk);--pd:var(--pkd);position:relative;padding:18px 10px 14px;border-radius:22px;color:#fff;font-size:1.25rem;font-weight:800;background:linear-gradient(165deg,var(--pc),var(--pd));border:3px solid transparent;box-shadow:0 10px 28px color-mix(in srgb,var(--pc) 45%,transparent)}',
'.kw-wc.guest{--pc:var(--bl);--pd:var(--bld)}',
'.kw-wc .em{display:block;font-size:2.4rem;line-height:1.1;margin-bottom:4px}',
'.kw-wc.on{border-color:#fff;box-shadow:0 0 0 4px rgba(255,255,255,.25),0 10px 28px color-mix(in srgb,var(--pc) 55%,transparent)}',
'.kw-wc:disabled{opacity:1}',
'.kw-wc .pts{display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin-top:8px;min-height:1.7em}',
'.kw-wc .pts span{background:rgba(0,0,0,.32);border-radius:999px;padding:3px 10px;font-size:.82rem}',
'.kw-wc.miss{filter:saturate(.35) brightness(.7)}',
/* fact or fiction */
'.kw-ev{position:relative;margin:14px auto 0;max-width:470px;padding:22px 20px 18px;border-radius:6px;background:linear-gradient(180deg,#fff8e4,#f1e3bf);color:#2b1a08;text-align:left;font-family:"Courier New",ui-monospace,monospace;font-size:1.15rem;font-weight:700;line-height:1.35;box-shadow:0 14px 30px rgba(0,0,0,.5);transform:rotate(-1deg)}',
'.kw-ev::before{content:"CASE FILE";position:absolute;top:6px;left:12px;font-size:.62rem;letter-spacing:.24em;color:#a05a1a;font-family:inherit}',
'.kw-stamp{position:absolute;right:10px;bottom:-14px;padding:4px 14px;border:4px solid currentColor;border-radius:10px;font-family:Outfit,system-ui,sans-serif;font-weight:800;font-size:1.6rem;letter-spacing:.08em;transform:rotate(-10deg);background:rgba(255,248,228,.85)}',
'.kw-stamp.t{color:#13893f}.kw-stamp.f{color:#c81d3a}',
'.kw-chips{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:12px}',
'.kw-chip{padding:7px 12px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);color:#fff;font-size:.85rem;font-weight:700;box-shadow:none}',
'.kw-tf{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}',
'.kw-tfb{padding:16px 10px;border-radius:18px;font-size:1.25rem;font-weight:800;color:#fff;border:3px solid transparent}',
'.kw-tfb.t{background:linear-gradient(165deg,#34d27a,#11804a);box-shadow:0 8px 24px rgba(52,210,122,.35)}',
'.kw-tfb.f{background:linear-gradient(165deg,#ff6b81,#b3163a);box-shadow:0 8px 24px rgba(255,107,129,.35)}',
'.kw-tfb.on{border-color:#fff}',
'.kw-sleuth{font-size:3rem;margin:10px 0 0;display:inline-block;animation:kwsearch 2.4s ease-in-out infinite}',
/* speed */
'.kw-dots{display:flex;gap:7px;justify-content:center;margin:10px 0 8px}',
'.kw-dots i{width:12px;height:12px;border-radius:50%;background:rgba(255,255,255,.14)}',
'.kw-dots i.done{background:var(--gd)}.kw-dots i.cur{background:#fff;box-shadow:0 0 10px #fff}',
'.kw-timer{height:12px;border-radius:99px;background:rgba(255,255,255,.1);overflow:hidden;margin:6px 0 4px;box-shadow:inset 0 1px 3px rgba(0,0,0,.5)}',
'.kw-timer i{display:block;height:100%;width:100%;border-radius:99px;background:linear-gradient(90deg,#ff5a6a,#ffd166 45%,#4ade80);transform-origin:left;animation:kwtime 5s linear forwards}',
'.kw-eo{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center;margin-top:14px}',
'.kw-eo .or{font-weight:800;color:var(--gd);text-shadow:0 0 10px rgba(255,209,102,.6)}',
'.kw-eob{padding:20px 10px;border-radius:20px;font-size:1.2rem;font-weight:800;color:#fff;background:linear-gradient(165deg,#7a5cff,#3b1fb3);border:3px solid transparent;box-shadow:0 8px 22px rgba(122,92,255,.4)}',
'.kw-eob.b{background:linear-gradient(165deg,#ff9a3c,#c2410c);box-shadow:0 8px 22px rgba(255,154,60,.35)}',
'.kw-eob.on{border-color:#fff}',
'.kw-sl{display:grid;gap:8px;margin-top:14px;text-align:left}',
'.kw-sr{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:9px 12px;border-radius:14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)}',
'.kw-sr .q{font-weight:800;font-size:.95rem}.kw-sr .a{font-size:.82rem;color:#c9c6f2;margin-top:2px}',
'.kw-sr .mk{font-size:1.4rem}.kw-sr.ok{border-color:rgba(74,222,128,.5);background:rgba(74,222,128,.09)}',
'.kw-av{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.85rem;color:#fff;background:var(--pk)}.kw-av.guest{background:var(--bl);color:#06213a}',
/* final */
'.kw-fq{margin-top:14px;padding:14px;border-radius:18px;background:rgba(0,0,0,.22);border:1.5px solid rgba(255,255,255,.12);text-align:left}',
'.kw-fq h4{margin:0 0 4px;font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:var(--gd)}',
'.kw-fq .kw-qt{font-size:1.15rem;margin:2px 0 0}',
'.kw-fq .kw-opts{margin-top:10px}.kw-fq .kw-opt{font-size:.92rem;padding:10px 14px 10px 8px}',
'.kw-coins{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:14px}',
'.kw-coin{width:56px;height:56px;border-radius:50%;font-size:1.35rem;font-weight:800;color:#5a3300;background:radial-gradient(circle at 35% 30%,#fff5c9,#ffd166 45%,#d99a1e);border:3px solid #b9790f;box-shadow:0 6px 14px rgba(0,0,0,.4),inset 0 -3px 0 rgba(0,0,0,.15)}',
'.kw-coin.on{transform:translateY(-6px) scale(1.08);box-shadow:0 0 0 4px #fff,0 0 24px rgba(255,209,102,.8)}',
'.kw-fr{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}',
'.kw-fr .kw-rev .q{font-size:.86rem;color:#d6d3ff;font-weight:600;margin-top:4px}',
'.kw-fr .kw-rev .line{margin-top:8px;font-size:.92rem}.kw-fr .kw-rev .line b{display:block;font-size:1.02rem;word-break:break-word}',
'.kw-fr .res{margin-top:10px;font-weight:800;font-size:1.25rem}.kw-fr .res.ok{color:var(--ok)}.kw-fr .res.no{color:var(--no)}',
/* podiums */
'.kw-pods{display:grid;grid-template-columns:1fr auto 1fr;align-items:end;gap:10px;margin:18px auto 0;max-width:620px;padding:0 4px}',
'.kw-pods::before{content:"";position:absolute;left:-10%;right:-10%;bottom:-30px;height:70px;background:radial-gradient(50% 50% at 50% 50%,rgba(155,107,255,.45),transparent 70%);z-index:-1}',
'.kw-pod{--pc:var(--pk);--pd:var(--pkd);position:relative;text-align:center;transition:transform .4s}',
'.kw-pod.guest{--pc:var(--bl);--pd:var(--bld)}',
'.kw-pod .top{position:relative;border-radius:16px 16px 4px 4px;padding:8px 8px 7px;background:linear-gradient(180deg,var(--pc),var(--pd));color:#fff;font-weight:800;box-shadow:0 0 26px color-mix(in srgb,var(--pc) 60%,transparent),inset 0 2px 0 rgba(255,255,255,.35)}',
'.kw-pod .nm{font-size:1.02rem;text-shadow:0 2px 6px rgba(0,0,0,.3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
'.kw-pod .you{font-size:.58rem;letter-spacing:.14em;background:rgba(0,0,0,.28);border-radius:6px;padding:1px 6px;margin-left:5px;vertical-align:middle}',
'.kw-pod .face{margin:0 7%;padding:10px 8px 14px;clip-path:polygon(0 0,100% 0,93% 100%,7% 100%);background:linear-gradient(180deg,#221c56,#0b0922);border-top:3px solid var(--pc)}',
'.kw-pod .sc{display:inline-block;min-width:2.3em;font-size:2.1rem;font-weight:800;line-height:1.15;font-variant-numeric:tabular-nums;color:var(--pc);background:#04030d;border-radius:10px;padding:2px 12px;box-shadow:inset 0 0 12px rgba(0,0,0,.9),0 0 14px color-mix(in srgb,var(--pc) 40%,transparent);text-shadow:0 0 12px var(--pc)}',
'.kw-pod .st{font-size:.76rem;color:#d4d1fa;margin-top:7px;min-height:1.25em;font-weight:600}',
'.kw-pod.hot .top::after{content:"🎤";position:absolute;right:-8px;top:-14px;font-size:1.5rem;filter:drop-shadow(0 3px 6px rgba(0,0,0,.5));animation:kwbob 1.6s ease-in-out infinite}',
'.kw-pod.hot .face{box-shadow:inset 0 0 30px color-mix(in srgb,var(--pc) 30%,transparent)}',
'.kw-pod.win{transform:translateY(-14px)}',
'.kw-pod.win .top::before{content:"👑";position:absolute;left:50%;top:-30px;transform:translateX(-50%);font-size:1.8rem;animation:kwbob 1.4s ease-in-out infinite}',
'.kw-pod.pointed .top{animation:kwjelly .9s}',
'.kw-delta{position:absolute;left:50%;top:-4px;font-weight:800;font-size:1.5rem;color:var(--ok);text-shadow:0 0 10px rgba(74,222,128,.8);pointer-events:none;transform:translateX(-50%);opacity:0}',
'.kw-delta.neg{color:var(--no);text-shadow:0 0 10px rgba(255,90,106,.8)}',
'.kw-vs{font-weight:800;font-size:1.1rem;color:var(--gd);text-shadow:0 0 12px rgba(255,209,102,.7);padding-bottom:38px}',
/* over */
'.kw-over h2{font-size:clamp(1.6rem,6vw,2.3rem);margin:6px 0;font-weight:800;background:linear-gradient(90deg,#ffd166,#ff8db0);-webkit-background-clip:text;background-clip:text;color:transparent}',
'.kw-over .big{font-size:4rem;line-height:1.1;filter:drop-shadow(0 8px 24px rgba(255,209,102,.6))}',
'.kw-tbl{width:100%;border-collapse:separate;border-spacing:0 6px;margin-top:12px;font-size:.92rem}',
'.kw-tbl td,.kw-tbl th{padding:7px 10px;text-align:center}.kw-tbl td:first-child,.kw-tbl th:first-child{text-align:left}',
'.kw-tbl th{font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:#b9b6e6}',
'.kw-tbl tbody td{background:rgba(255,255,255,.05)}.kw-tbl tbody td:first-child{border-radius:10px 0 0 10px}.kw-tbl tbody td:last-child{border-radius:0 10px 10px 0}',
'.kw-tbl .h{color:var(--pk);font-weight:800}.kw-tbl .g{color:var(--bl);font-weight:800}',
'.kw-conf{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:5}',
'.kw-conf i{position:absolute;top:-20px;width:9px;height:14px;border-radius:2px;opacity:.95;animation:kwfall linear infinite}',
'.kw-foot{text-align:center;color:#8f8cc0;font-size:.78rem;padding:16px 0 12px}',
/* animations */
'@keyframes kwbulb{0%{border-color:rgba(255,209,102,.85)}100%{border-color:rgba(255,154,60,.35)}}',
'@keyframes kwswayl{0%{transform:rotate(-30deg)}100%{transform:rotate(-8deg)}}',
'@keyframes kwswayr{0%{transform:rotate(30deg)}100%{transform:rotate(8deg)}}',
'@keyframes kwflicker{0%,18%,22%,62%,64%,100%{opacity:1}20%,63%{opacity:.55}}',
'@keyframes kwdots{0%{content:""}25%{content:"."}50%{content:".."}75%{content:"..."}}',
'@keyframes kwpop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.06);opacity:1}100%{transform:none;opacity:1}}',
'@keyframes kwrise{0%{transform:translateY(14px);opacity:0}100%{transform:none;opacity:1}}',
'@keyframes kwflip{0%{transform:rotateX(90deg);opacity:0}60%{transform:rotateX(-12deg);opacity:1}100%{transform:none;opacity:1}}',
'@keyframes kwding{0%{transform:scale(.2) rotate(-8deg);opacity:0}55%{transform:scale(1.3) rotate(3deg);opacity:1}100%{transform:none;opacity:1}}',
'@keyframes kwbuzz{0%{transform:scale(1.5);opacity:0}30%{transform:scale(1);opacity:1}40%,60%,80%{transform:translateX(-9px)}50%,70%,90%{transform:translateX(9px)}100%{transform:none;opacity:1}}',
'@keyframes kwstamp{0%{transform:rotate(-10deg) scale(3);opacity:0}70%{transform:rotate(-10deg) scale(.9);opacity:1}100%{transform:rotate(-10deg) scale(1);opacity:1}}',
'@keyframes kwjelly{0%,100%{transform:none}25%{transform:scale(1.12,.88)}50%{transform:scale(.92,1.1)}75%{transform:scale(1.04,.97)}}',
'@keyframes kwfloat{0%{transform:translate(-50%,10px);opacity:0}20%{opacity:1}100%{transform:translate(-50%,-46px);opacity:0}}',
'@keyframes kwbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}',
'@keyframes kwtime{from{transform:scaleX(1)}to{transform:scaleX(0)}}',
'@keyframes kwsearch{0%,100%{transform:translateX(-16px) rotate(-10deg)}50%{transform:translateX(16px) rotate(10deg)}}',
'@keyframes kwfall{0%{transform:translateY(0) rotate(0)}100%{transform:translateY(900px) rotate(720deg)}}',
'@media (max-width:540px){.kw-opts{grid-template-columns:1fr}.kw-revs,.kw-fr{grid-template-columns:1fr}.kw-stage{padding:14px 8px 0;border-radius:24px}.kw-screen{padding:16px 12px}.kw-pod .sc{font-size:1.7rem}.kw-vs{padding-bottom:30px}.kw-wc{font-size:1.05rem}}',
'@media (prefers-reduced-motion:reduce){.kw-spot,.kw-bulbs,.kw-logo .a,.kw-conf{animation:none!important}}'
].join('');

/* ---------- UI ---------- */
function GAME_START(ctx){
  var me=ctx.me,isHost=!!ctx.isHost,pt=oth(me),names=ctx.names||{};
  function nm(r){return names[r]||(r==='host'?'Player 1':'Player 2')}
  var root=ctx.root;root.innerHTML='';
  var st=document.createElement('style');st.textContent=CSS;root.appendChild(st);
  var wrap=document.createElement('div');wrap.className='kw';root.appendChild(wrap);
  var core=isHost?makeCore(ctx.seed,ctx.rng):null;
  var V=isHost?core.view('host'):null;
  var lastQ=-1,dead=false,ended=false,hiTimer=null,tm=null,tKey=null;
  var drafts={},sel={},seenAt={},played={},prevScore=null,bumps={},sound=true,ac=null,confEl=null,lockCheck=null;
  try{sound=localStorage.getItem('kw_snd')!=='0'}catch(e){}

  function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
  function btn(label,cls,fn,o){
    o=o||{};var b=el('button',cls,label);b.type='button';
    if(o.act)b.setAttribute('data-act',o.act);
    if(o.v!=null)b.setAttribute('data-v',String(o.v));
    if(o.dis)b.disabled=true;
    b.onclick=function(){if(!dead&&!b.disabled)fn()};
    return b;
  }
  /* keyed one-shot animations that survive re-renders (they continue instead of restarting) */
  function age(key){var t=Date.now();if(!(key in seenAt))seenAt[key]=t;return t-seenAt[key]}
  function anim(e,key,name,ms,ease,delay){
    var a=age(key)-(delay||0);
    if(a<ms){e.style.animation=name+' '+ms+'ms '+(ease||'cubic-bezier(.2,.8,.3,1.2)')+' both';e.style.animationDelay=(-a)+'ms'}
  }
  function once(key){if(played[key])return false;played[key]=1;return true}

  /* --- little game-show sounds (WebAudio, only after the player has touched the page) --- */
  root.addEventListener('pointerdown',function(){if(!ac){try{var A=window.AudioContext||window.webkitAudioContext;if(A)ac=new A()}catch(e){}}});
  function tone(f,t0,d,type,vol){
    var o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;
    g.gain.setValueAtTime(0,ac.currentTime+t0);g.gain.linearRampToValueAtTime(vol,ac.currentTime+t0+.01);
    g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+t0+d);o.connect(g);g.connect(ac.destination);
    o.start(ac.currentTime+t0);o.stop(ac.currentTime+t0+d+.05);
  }
  function sfx(kind){
    if(!sound||!ac)return;
    try{
      if(kind==='ding'){tone(1318,0,.5,'sine',.25);tone(1760,.12,.7,'sine',.22)}
      else if(kind==='buzz'){tone(110,0,.55,'sawtooth',.18);tone(116,0,.55,'square',.08)}
      else if(kind==='lock'){tone(660,0,.12,'triangle',.18)}
      else if(kind==='fanfare'){[523,659,784,1046].forEach(function(f,i){tone(f,i*.13,.45,'triangle',.2)})}
    }catch(e){}
  }

  /* --- actions --- */
  function act(a){
    if(dead||!V)return;
    if(a.sid===undefined)a.sid=V.sid;
    if(isHost)hostDo('host',a);else ctx.send({k:'a',a:a});
  }
  function bcast(){ctx.send({k:'s',q:core.S.q,v:core.view('guest')})}
  function hostDo(role,a){if(!core.apply(role,a))return;changed()}
  function changed(){core.S.q++;V=core.view('host');bcast();armTimer();render()}
  function armTimer(){
    var S=core.S,T=S.T,key=(S.phase==='play'&&T&&T.type==='speed'&&T.tp==='answer')?S.sid:null;
    if(key===tKey)return;
    if(tm){clearTimeout(tm);tm=null}
    tKey=key;
    if(key!==null){var k=T.k;tm=setTimeout(function(){tm=null;if(dead)return;if(core.timeout(k))changed()},SPEED_MS+SPEED_GRACE)}
  }

  /* --- small building blocks --- */
  function fmt(q,v){
    if(v==null)return '⏰ No answer';
    if(q&&q.o)return L(v)+'. '+q.o[v];
    return '“'+v+'”';
  }
  function catChip(q){var c=CATS[q.cat]||CATS.custom;var s=el('span','kw-cat',c[0]+' '+c[1]+(q.by?' · by '+nm(q.by):''));return s}
  function waitLine(t){return el('p','kw-wait',t)}
  function readyRow(label,cls){
    var box=el('div');
    var mine=V.ready[me];
    var b=btn(mine?'Waiting for '+nm(pt)+'…':label,'kw-btn wide '+(cls||''),function(){sfx('lock');act({a:'ready'})},{act:'ready',dis:mine});
    box.appendChild(b);
    var r=el('div','kw-rdy');
    ['host','guest'].forEach(function(x){r.appendChild(el('span',V.ready[x]?'ok':'',(V.ready[x]?'✅ ':'⏳ ')+nm(x)))});
    box.appendChild(r);return box;
  }
  function burst(key,ok,big,small){
    var f=document.createDocumentFragment();
    var b=el('div','kw-burst '+(ok?'ding':'buzz'),big);anim(b,key,ok?'kwding':'kwbuzz',ok?700:800,ok?null:'ease-out');f.appendChild(b);
    if(small){var s=el('p','kw-sub',small);anim(s,key+'s','kwrise',500,'ease-out',300);f.appendChild(s)}
    if(once(key))sfx(ok?'ding':'buzz');
    return f;
  }
  function revPanel(role,label,val,key,delay){
    var p=el('div','kw-rev '+role);p.appendChild(el('small',null,label));p.appendChild(el('div','v',val));
    anim(p,key,'kwflip',650,'cubic-bezier(.2,.8,.3,1.1)',delay||0);return p;
  }
  /* choice area for a question: option lozenges or a short text box; get() returns the value or null */
  function choiceArea(q,name){
    var key=name+':'+V.sid,box=el('div');
    if(q.o){
      var g=el('div','kw-opts');
      q.o.forEach(function(o,i){
        var b=btn('','kw-opt'+(sel[key]===i?' on':''),function(){sel[key]=i;render()},{act:'pick',v:i});
        b.setAttribute('data-f',name);b.appendChild(el('b',null,L(i)));b.appendChild(el('span',null,o));g.appendChild(b);
      });
      box.appendChild(g);
      return {node:box,get:function(){return sel[key]==null?null:sel[key]}};
    }
    var inp=el('input','kw-in');inp.maxLength=60;inp.placeholder=name==='fguess'||name==='ans'&&me!==V.T.subj?'Type your prediction…':'Type your answer…';
    inp.setAttribute('data-name',name);inp.autocomplete='off';inp.value=drafts[key]||'';
    inp.addEventListener('input',function(){drafts[key]=inp.value;if(lockCheck)lockCheck()});
    inp.addEventListener('keydown',function(e){if(e.key==='Enter'){var lb=wrap.querySelector('[data-act="lock"]');if(lb&&!lb.disabled)lb.click()}});
    box.appendChild(inp);
    return {node:box,get:function(){var t=clean(drafts[key],60);return t?t:null}};
  }
  function lockButton(label,ready,onLock){
    var b=btn(label,'kw-btn wide',function(){if(ready()){sfx('lock');onLock()}},{act:'lock',dis:!ready()});
    lockCheck=function(){b.disabled=!ready()};
    return b;
  }

  /* --- rendering --- */
  function render(){
    if(dead)return;
    var ae=document.activeElement,keep=null,ss=0,se=0;
    if(ae&&ae.getAttribute&&wrap.contains(ae)&&ae.getAttribute('data-name')){keep=ae.getAttribute('data-name');try{ss=ae.selectionStart;se=ae.selectionEnd}catch(e){}}
    wrap.innerHTML='';lockCheck=null;
    var stage=el('div','kw-stage');wrap.appendChild(stage);
    stage.appendChild(el('div','kw-spot l'));stage.appendChild(el('div','kw-spot r'));stage.appendChild(el('div','kw-bulbs'));
    if(!V){
      stage.appendChild(logo(false));
      var w=el('div','kw-screen');w.appendChild(waitLine('Connecting to '+nm('host')));stage.appendChild(w);
      stage.appendChild(el('div','kw-foot',''));
      return;
    }
    var T=V.T,ph=V.phase;
    wrap.setAttribute('data-phase',ph);
    wrap.setAttribute('data-type',ph==='play'&&T?T.type:(V.rounds&&V.ri>=0?V.rounds[V.ri]:''));
    wrap.setAttribute('data-tp',ph==='play'&&T?T.tp:'');
    stage.appendChild(topBar());
    var scr=el('div','kw-screen');stage.appendChild(scr);
    if(ph==='lobby')renderLobby(scr);
    else if(ph==='title')renderTitle(scr);
    else if(ph==='between')renderBetween(scr);
    else if(ph==='over')renderOver(scr);
    else if(T){
      if(T.type==='gma')renderGma(scr,T);
      else if(T.type==='likely')renderLikely(scr,T);
      else if(T.type==='fof')renderFof(scr,T);
      else if(T.type==='speed')renderSpeed(scr,T);
      else if(T.type==='final')renderFinal(scr,T);
    }
    stage.appendChild(podiums());
    stage.appendChild(el('div','kw-foot',ph==='lobby'?'Tip: stay on a call so you can hear each other gasp at the reveals.':''));
    if(ph==='over'){
      if(!confEl){confEl=el('div','kw-conf');var cols=['#ff5c8a','#58c7ff','#ffd166','#4ade80','#9b6bff','#fff'];
        for(var i=0;i<80;i++){var c=el('i');c.style.left=(Math.random()*100)+'%';c.style.background=cols[i%cols.length];
          c.style.animationDuration=(2.6+Math.random()*2.8)+'s';c.style.animationDelay=(-Math.random()*4)+'s';
          c.style.width=(6+Math.random()*7)+'px';if(i%3===0)c.style.borderRadius='50%';confEl.appendChild(c)}}
      stage.appendChild(confEl);
    }
    if(keep){var inp=wrap.querySelector('[data-name="'+keep+'"]');if(inp){try{inp.focus({preventScroll:true});inp.setSelectionRange(ss,se)}catch(e){}}}
    if(ph==='over'&&!ended){
      ended=true;
      var s=V.score,w2=s.host>s.guest?'host':s.guest>s.host?'guest':null;
      if(once('fanfare'))sfx('fanfare');
      ctx.end(w2?nm(w2)+' knows you better! 🏆':'Perfectly matched! 💞',nm('host')+' '+s.host+' – '+s.guest+' '+nm('guest'));
    }
  }
  function logo(small){
    var d=el('div','kw-logo'+(small?' sm':''));
    d.appendChild(el('span','m','🎤'));d.appendChild(el('span','a','Who knows'));d.appendChild(el('span','b','us better?'));
    return d;
  }
  function topBar(){
    var ph=V.phase,T=V.T;
    if(ph==='lobby'||ph==='over'){
      var big=el('div');big.appendChild(logo(false));
      if(ph==='lobby'){var sb=soundBtn();sb.style.position='absolute';sb.style.right='10px';sb.style.top='0';big.appendChild(sb)}
      return big;
    }
    var t=el('div','kw-top');t.appendChild(logo(true));
    var p=el('div','kw-pills');
    if(V.rounds){
      var type=V.rounds[V.ri];
      p.appendChild(el('span','kw-pill','Round '+(V.ri+1)+'/'+V.rounds.length+' · '+RT[type].i+' '+RT[type].n));
      if(ph==='play'&&T){
        var c=null;
        if(T.type==='gma'||T.type==='likely')c='Q '+(V.ti+1)+'/'+V.tn;
        else if(T.type==='fof')c='Turn '+(V.ti+1)+'/'+V.tn;
        else if(T.type==='speed')c=T.tp==='reveal'?'Results':'Q '+(T.k+1)+'/'+T.items.length;
        if(c)p.appendChild(el('span','kw-pill',c));
      }
    }
    p.appendChild(soundBtn());
    t.appendChild(p);return t;
  }
  function soundBtn(){
    return btn(sound?'🔊':'🔇','kw-snd',function(){sound=!sound;try{localStorage.setItem('kw_snd',sound?'1':'0')}catch(e){}render()},{act:'sound'});
  }
  function podStatus(r){
    var ph=V.phase,T=V.T;
    if(ph==='lobby'||ph==='title'||ph==='between')return V.ready[r]?'✅ Ready':'⏳ Getting ready';
    if(ph==='over'){var s=V.score;return s[r]>s[oth(r)]?'🏆 Champion!':s[r]===s[oth(r)]?'💞 Perfect match':'🥈 So close'}
    if(!T)return '';
    var lk=T.lock[r];
    if(T.type==='gma'){
      var role=r===T.subj?'🎤 Hot seat':'🔮 Guessing';
      if(T.tp==='answer')return role+' · '+(lk?'🔒 Locked':'🤔 Thinking');
      if(T.res===null)return r===T.subj?'⚖️ Judging':'🙏 Hoping';
      return V.ready[r]?'✅ Ready':role;
    }
    if(T.type==='likely')return T.tp==='answer'?(lk?'🔒 Pointed':'🤔 Deciding'):(V.ready[r]?'✅ Ready':'👀 Revealed');
    if(T.type==='fof'){
      if(T.tp==='write')return r===T.subj?'✍️ Writing':'⏳ Waiting';
      if(T.tp==='guess')return r===T.subj?'😐 Poker face':'🕵️ Deciding';
      return V.ready[r]?'✅ Ready':(r===T.subj?'🎤 Hot seat':'🕵️ Detective');
    }
    if(T.type==='speed'){
      if(T.tp==='reveal')return V.ready[r]?'✅ Ready':'⚡ Done';
      var it=T.items[T.k];return (it.subj===r?'🎤 ':'🔮 ')+(lk?'🔒 Locked':'⚡ Go!');
    }
    if(T.type==='final'){
      if(T.tp==='wager')return lk?'💰 Bet placed':'💭 Betting';
      if(T.tp==='answer')return lk?'🔒 Locked':'🤔 Thinking';
      if(!T.applied)return T.res[r]===null?'⚖️ Judging':'⏳ Waiting';
      return V.ready[r]?'✅ Ready':'💰 '+(T.rev.wager[r]|0)+' on the line';
    }
    return '';
  }
  function podiums(){
    var now=Date.now();
    if(prevScore){['host','guest'].forEach(function(r){var d=V.score[r]-prevScore[r];if(d)bumps[r]={d:d,at:now}})}
    prevScore={host:V.score.host,guest:V.score.guest};
    var T=V.T,ph=V.phase,g=el('div','kw-pods');
    var hot=null;
    if(ph==='play'&&T){if(T.type==='gma'||T.type==='fof')hot=T.subj;else if(T.type==='speed'&&T.tp==='answer')hot=T.items[T.k].subj}
    var win=ph==='over'?(V.score.host>V.score.guest?'host':V.score.guest>V.score.host?'guest':'both'):null;
    function pod(r){
      var cls='kw-pod '+r+(hot===r?' hot':'')+(win===r||win==='both'?' win':'');
      if(ph==='play'&&T&&T.type==='likely'&&T.tp==='reveal'&&(T.rev.host===r||T.rev.guest===r))cls+=' pointed';
      var p=el('div',cls);
      var top=el('div','top');var n=el('div','nm',nm(r));if(r===me)n.appendChild(el('span','you','YOU'));top.appendChild(n);p.appendChild(top);
      var f=el('div','face');var sc=el('span','sc',String(V.score[r]));f.appendChild(sc);f.appendChild(el('div','st',podStatus(r)));p.appendChild(f);
      var b=bumps[r];
      if(b&&now-b.at<1500){
        var d=el('div','kw-delta'+(b.d<0?' neg':''),(b.d>0?'+':'')+b.d);d.style.animation='kwfloat 1500ms ease-out both';d.style.animationDelay=(-(now-b.at))+'ms';p.appendChild(d);
        sc.style.animation='kwjelly 700ms both';sc.style.animationDelay=(-(now-b.at))+'ms';
      }
      return p;
    }
    g.appendChild(pod('host'));g.appendChild(el('div','kw-vs','VS'));g.appendChild(pod('guest'));
    return g;
  }

  function renderLobby(scr){
    scr.appendChild(el('p','kw-tag','The game show where the prize is proving you know each other best.'));
    var lg=el('div','kw-len');
    [['quick','⚡','Quick','3 rounds'],['classic','🏆','Classic','5 rounds']].forEach(function(x){
      var b=btn('','kw-tile'+(V.len===x[0]?' on':''),function(){act({a:'len',v:x[0]})},{act:'len',v:x[0],dis:!isHost});
      b.appendChild(el('i',null,x[1]));b.appendChild(el('b',null,x[2]));b.appendChild(el('small',null,x[3]));lg.appendChild(b);
    });
    scr.appendChild(lg);
    scr.appendChild(el('p','kw-sub',isHost?'You pick the length. Changing it resets both Ready buttons.':nm('host')+' picks the length.'));
    var lu=el('div','kw-lineup');
    V.lineup[V.len].forEach(function(t,i){lu.appendChild(el('span',null,(i+1)+'. '+RT[t].i+' '+RT[t].n))});
    scr.appendChild(lu);
    /* custom questions */
    var cb=el('div','kw-cbox');
    cb.appendChild(el('h4',null,'✍️ Add our own questions'));
    cb.appendChild(el('p',null,'They get mixed into Guess My Answer. Write them to the hot-seat player, e.g. “What would you rescue first from our flat?”. Add 2 to 4 choices separated by commas, or leave choices empty for a typed answer.'));
    var qi=el('input','kw-in');qi.maxLength=140;qi.placeholder='Your question…';qi.setAttribute('data-name','cq');qi.autocomplete='off';qi.value=drafts.cq||'';
    qi.addEventListener('input',function(){drafts.cq=qi.value});
    var oi=el('input','kw-in');oi.maxLength=170;oi.placeholder='Choices (optional): Pizza, Curry, Tacos';oi.setAttribute('data-name','co');oi.autocomplete='off';oi.value=drafts.co||'';
    oi.addEventListener('input',function(){drafts.co=oi.value});
    function add(){
      var t=clean(qi.value,140);if(!t){ctx.toast('Type a question first');return}
      if(V.custom.length>=MAXCUSTOM){ctx.toast('That is plenty of questions!');return}
      var o=String(oi.value||'').split(',').map(function(x){return clean(x,40)}).filter(Boolean);
      act({a:'add',t:t,o:o.length>=2?o.slice(0,4):null});drafts.cq='';drafts.co='';qi.value='';oi.value='';
    }
    qi.addEventListener('keydown',function(e){if(e.key==='Enter')add()});
    oi.addEventListener('keydown',function(e){if(e.key==='Enter')add()});
    cb.appendChild(qi);cb.appendChild(oi);
    cb.appendChild(btn('➕ Add question','kw-btn',add,{act:'add'}));
    if(V.custom.length){
      var ul=el('ul','kw-cl');
      V.custom.forEach(function(c){
        var li=el('li',c.by);li.appendChild(el('span',null,c.t));
        li.appendChild(el('em',null,(c.o?c.o.length+' choices · ':'typed · ')+nm(c.by)));
        if(c.by===me)li.appendChild(btn('✕','',function(){act({a:'del',id:c.id})},{act:'del',v:c.id}));
        ul.appendChild(li);
      });
      cb.appendChild(ul);
    }
    scr.appendChild(cb);
    scr.appendChild(readyRow("I'm ready! 🎤",'pink'));
  }
  function renderTitle(scr){
    var type=V.rounds[V.ri],r=RT[type],tc=el('div','kw-tc');
    var k='title'+V.ri;
    var rn=el('div','rn','Round '+(V.ri+1)+' of '+V.rounds.length);anim(rn,k+'a','kwrise',500,'ease-out');tc.appendChild(rn);
    var ic=el('div','ic',r.i);anim(ic,k+'b','kwpop',800,null,120);tc.appendChild(ic);
    var h=el('h2',null,r.n);anim(h,k+'c','kwpop',700,null,260);tc.appendChild(h);
    var d=el('p',null,r.d);anim(d,k+'d','kwrise',600,'ease-out',420);tc.appendChild(d);
    var lead=V.ri%2===0?V.first:oth(V.first);
    if(type==='gma'||type==='fof'||type==='speed')tc.appendChild(el('span','kw-first','🎤 First in the hot seat: '+(lead===me?'you':nm(lead))));
    if(type==='final')tc.appendChild(el('span','kw-first','💰 You can bet up to '+Math.max(0,Math.min(5,V.score[me]))+' point'+(Math.min(5,V.score[me])===1?'':'s')));
    if(type==='likely')tc.appendChild(el('span','kw-first','👉 '+LIKELY_N+' prompts · point at '+nm('host')+' or '+nm('guest')));
    scr.appendChild(tc);
    if(once(k))sfx('fanfare');
    scr.appendChild(readyRow('Ready! ▶'));
  }
  function renderBetween(scr){
    var lg=V.log[V.log.length-1],r=RT[lg.type];
    var tc=el('div','kw-tc');
    tc.appendChild(el('div','rn','Round '+(V.ri+1)+' complete'));
    var ic=el('div','ic',r.i);anim(ic,'btw'+V.ri,'kwpop',700);tc.appendChild(ic);
    tc.appendChild(el('h2',null,r.n));
    tc.appendChild(el('p',null,nm('host')+' +'+lg.pts.host+'   ·   '+nm('guest')+' +'+lg.pts.guest));
    var s=V.score,lead=s.host>s.guest?'host':s.guest>s.host?'guest':null;
    tc.appendChild(el('span','kw-first',lead?(lead===me?'You lead':nm(lead)+' leads')+' '+Math.max(s.host,s.guest)+' – '+Math.min(s.host,s.guest):'Neck and neck at '+s.host+' – '+s.guest+'!'));
    var nx=V.rounds[V.ri+1];if(nx)tc.appendChild(el('p',null,'Up next: '+RT[nx].i+' '+RT[nx].n));
    scr.appendChild(tc);
    scr.appendChild(readyRow('Next round ▶'));
  }
  function renderOver(scr){
    var s=V.score,w=s.host>s.guest?'host':s.guest>s.host?'guest':null,o=el('div','kw-over');
    var b=el('div','big',w?'🏆':'💞');anim(b,'overb','kwpop',900);o.appendChild(b);
    o.appendChild(el('h2',null,w?nm(w)+' knows you better!':'Perfectly matched!'));
    o.appendChild(el('p','kw-sub',w?(w===me?'You read '+nm(pt)+' like an open book.':nm(w)+' read you like an open book.')+' Final score '+Math.max(s.host,s.guest)+' – '+Math.min(s.host,s.guest)+'.':'A dead heat at '+s.host+' – '+s.guest+'. You two are on the same wavelength.'));
    var tb=el('table','kw-tbl'),th=el('thead'),tr=el('tr');
    tr.appendChild(el('th',null,'Round'));tr.appendChild(el('th',null,nm('host')));tr.appendChild(el('th',null,nm('guest')));th.appendChild(tr);tb.appendChild(th);
    var bd=el('tbody');
    V.log.forEach(function(l){var r=el('tr');r.appendChild(el('td',null,RT[l.type].i+' '+RT[l.type].n));
      r.appendChild(el('td','h',(l.pts.host>=0?'+':'')+l.pts.host));r.appendChild(el('td','g',(l.pts.guest>=0?'+':'')+l.pts.guest));bd.appendChild(r)});
    var tt=el('tr');tt.appendChild(el('td',null,'Total'));tt.appendChild(el('td','h',String(s.host)));tt.appendChild(el('td','g',String(s.guest)));bd.appendChild(tt);
    tb.appendChild(bd);o.appendChild(tb);
    scr.appendChild(o);
  }

  /* Round 1 / Final style question about the hot-seat player */
  function renderGma(scr,T){
    var subj=T.subj,g=oth(subj),hot=me===subj,key='g'+V.ri+'.'+V.ti;
    scr.appendChild(catChip(T.q));
    if(T.tp==='answer')scr.appendChild(el('div','kw-role '+(hot?'hot':'guess'),hot?"🎤 You're in the hot seat. Answer honestly!":'🔮 Predict what '+nm(subj)+' will answer!'));
    scr.appendChild(el('div','kw-about','About '+(hot?'you':nm(subj))));
    var qt=el('div','kw-qt',T.q.t);anim(qt,key,'kwpop',600);scr.appendChild(qt);
    if(T.tp==='answer'){
      if(T.lock[me]){
        scr.appendChild(el('div','kw-locked','🔒 '+(hot?'Your answer: ':'Your guess: ')+fmt(T.q,V.mine)));
        scr.appendChild(waitLine(T.lock[pt]?'Revealing':'Waiting for '+nm(pt)));
      }else{
        var ca=choiceArea(T.q,'ans');scr.appendChild(ca.node);
        scr.appendChild(lockButton(hot?'Lock in my answer 🔒':'Lock in my guess 🔒',ca.get,function(){act({a:'ans',v:ca.get()})}));
        if(T.lock[pt])scr.appendChild(el('p','kw-sub',nm(pt)+' has locked in. Your turn!'));
      }
      return;
    }
    var rv=el('div','kw-revs');
    rv.appendChild(revPanel(subj,(hot?'You':nm(subj))+' answered',fmt(T.q,T.rev.subj),key+'r1',0));
    rv.appendChild(revPanel(g,(g===me?'You':nm(g))+' guessed',fmt(T.q,T.rev.guess),key+'r2',350));
    scr.appendChild(rv);
    if(T.res===null){
      if(hot){
        var j=el('div','kw-judge');j.appendChild(el('p',null,'⚖️ Is '+nm(g)+"'s guess close enough?"));
        j.appendChild(el('p','kw-sub','Be fair. Same meaning counts!'));
        var row=el('div','kw-row');
        row.appendChild(btn('✅ Close enough!','kw-btn',function(){act({a:'judge',v:true})},{act:'judge',v:1}));
        row.appendChild(btn('❌ Nope','kw-btn soft',function(){act({a:'judge',v:false})},{act:'judge',v:0}));
        j.appendChild(row);scr.appendChild(j);
      }else scr.appendChild(waitLine(nm(subj)+' is judging your guess'));
      return;
    }
    scr.appendChild(burst(key+'b',T.res,T.res?'DING! ✅':'BZZZT! ❌',T.res?'+1 '+(g===me?'for you':nm(g))+(T.auto?' · exact match':''):'No point this time'));
    scr.appendChild(readyRow(V.ti+1<V.tn?'Next question ▶':'Finish round ▶'));
  }
  function renderLikely(scr,T){
    var key='l'+V.ri+'.'+V.ti;
    scr.appendChild(el('span','kw-cat','👉 Who\'s more likely to…'));
    var qt=el('div','kw-qt',T.p.charAt(0).toUpperCase()+T.p.slice(1)+'?');anim(qt,key,'kwpop',600);scr.appendChild(qt);
    var wg=el('div','kw-who'),rev=T.tp==='reveal';
    ['host','guest'].forEach(function(r){
      var on=!rev&&V.mine===r;
      var cls='kw-wc '+r+(on?' on':'');
      if(rev){cls+=(T.rev.host===r||T.rev.guest===r)?'':' miss'}
      var b=btn('',cls,function(){sfx('lock');act({a:'ans',v:r})},{act:'who',v:r,dis:rev||T.lock[me]});
      b.appendChild(el('span','em',r===me?'🙋':'👈'));b.appendChild(el('span',null,r===me?'Me ('+nm(r)+')':nm(r)));
      var pts=el('div','pts');
      if(rev){['host','guest'].forEach(function(x,i){if(T.rev[x]===r){var c=el('span',null,'👉 '+(x===me?'You':nm(x)));anim(c,key+'p'+x,'kwpop',600,null,250+i*250);pts.appendChild(c)}});
        if(T.rev.host===r||T.rev.guest===r)anim(b,key+'j'+r,'kwjelly',900,'ease-in-out',150)}
      b.appendChild(pts);wg.appendChild(b);
    });
    scr.appendChild(wg);
    if(!rev){
      if(T.lock[me])scr.appendChild(waitLine('You pointed at '+(V.mine===me?'yourself':nm(V.mine))+'. Waiting for '+nm(pt)));
      else scr.appendChild(el('p','kw-sub',T.lock[pt]?nm(pt)+' has pointed. Your turn!':'Tap a podium to point. Match your partner to score.'));
      return;
    }
    scr.appendChild(burst(key+'b',T.synced,T.synced?'SYNCED! 💞':'SPLIT! 🙈',T.synced?'+1 each. Great minds!':'You see it differently. No points.'));
    scr.appendChild(readyRow(V.ti+1<V.tn?'Next prompt ▶':'Finish round ▶'));
  }
  function renderFof(scr,T){
    var subj=T.subj,g=oth(subj),hot=me===subj,key='f'+V.ri+'.'+V.ti;
    scr.appendChild(el('span','kw-cat','🕵️ Fact or Fiction'));
    if(T.tp==='write'){
      if(hot){
        scr.appendChild(el('div','kw-role hot','🎤 Your turn to bluff (or not)!'));
        scr.appendChild(el('p','kw-sub','Write something about yourself that is either TRUE or totally MADE UP. '+nm(g)+' has to call it.'));
        var sk='stmt:'+V.sid,tk='truth:'+V.sid;
        var ch=el('div','kw-chips');
        STARTERS.forEach(function(s){ch.appendChild(btn(s,'kw-chip',function(){drafts[sk]=s.replace(/\.\.\.$/,' ');render();var i=wrap.querySelector('[data-name="stmt"]');if(i){try{i.focus();i.setSelectionRange(i.value.length,i.value.length)}catch(e){}}},{act:'starter'}))});
        scr.appendChild(ch);
        var inp=el('input','kw-in');inp.maxLength=140;inp.placeholder="e.g. I've never seen snow";inp.setAttribute('data-name','stmt');inp.autocomplete='off';inp.value=drafts[sk]||'';
        inp.addEventListener('input',function(){drafts[sk]=inp.value;if(lockCheck)lockCheck()});
        scr.appendChild(inp);
        var tf=el('div','kw-tf');
        tf.appendChild(btn("It's a FACT ✅",'kw-tfb t'+(sel[tk]===true?' on':''),function(){sel[tk]=true;render()},{act:'pick',v:1}));
        tf.appendChild(btn("It's FICTION 🎭",'kw-tfb f'+(sel[tk]===false?' on':''),function(){sel[tk]=false;render()},{act:'pick',v:0}));
        scr.appendChild(tf);
        var ready=function(){return okStmt(drafts[sk])&&typeof sel[tk]==='boolean'};
        scr.appendChild(lockButton('Lock it in 🔒',ready,function(){act({a:'stmt',text:clean(drafts[sk],140),truth:sel[tk]})}));
      }else{
        scr.appendChild(el('div','kw-role guess','🕵️ '+nm(subj)+' is cooking up a statement'));
        scr.appendChild(el('div','kw-sleuth','🔍'));
        scr.appendChild(el('p','kw-sub','Get ready to read their poker face. Fact or fiction?'));
      }
      return;
    }
    var ev=el('div','kw-ev','“'+T.stmt+'”');anim(ev,key+'e','kwpop',600);
    if(T.tp==='reveal'){var sp=el('span','kw-stamp '+(T.rev.truth?'t':'f'),T.rev.truth?'FACT':'FICTION');anim(sp,key+'s','kwstamp',600,'cubic-bezier(.3,.7,.4,1)',200);ev.appendChild(sp)}
    scr.appendChild(el('div','kw-about','Statement by '+(hot?'you':nm(subj))));
    scr.appendChild(ev);
    if(T.tp==='guess'){
      if(hot){
        scr.appendChild(el('div','kw-locked','🔒 You said it\'s '+(V.mine&&V.mine.truth?'a FACT ✅':'FICTION 🎭')));
        scr.appendChild(waitLine('Keep a straight face. '+nm(g)+' is deciding'));
      }else{
        scr.appendChild(el('div','kw-role guess','🕵️ Is '+nm(subj)+' telling the truth?'));
        var tf2=el('div','kw-tf');
        tf2.appendChild(btn('FACT ✅','kw-tfb t',function(){sfx('lock');act({a:'ans',v:true})},{act:'tf',v:1}));
        tf2.appendChild(btn('FICTION 🎭','kw-tfb f',function(){sfx('lock');act({a:'ans',v:false})},{act:'tf',v:0}));
        scr.appendChild(tf2);
      }
      return;
    }
    scr.appendChild(el('p','kw-sub',(g===me?'You':nm(g))+' called it '+(T.rev.guess?'FACT':'FICTION')+'.'));
    scr.appendChild(burst(key+'b',T.res,T.res?'DING! Busted! 🕵️':'BZZZT! Fooled! 🎭',T.res?'+1 '+(g===me?'for you':nm(g)):'+1 '+(hot?'for you, master of disguise':nm(subj)+' for the bluff')));
    scr.appendChild(readyRow(V.ti+1<V.tn?'Next turn ▶':'Finish round ▶'));
  }
  function renderSpeed(scr,T){
    if(T.tp==='answer'){
      var it=T.items[T.k],hot=it.subj===me,key='s'+V.sid;
      var dots=el('div','kw-dots');T.items.forEach(function(x,i){dots.appendChild(el('i',i<T.k?'done':i===T.k?'cur':''))});scr.appendChild(dots);
      var tb=el('div','kw-timer'),bar=el('i');var a=age(key+'t');bar.style.animationDelay=(-Math.min(a,SPEED_MS))+'ms';tb.appendChild(bar);scr.appendChild(tb);
      scr.appendChild(el('div','kw-role '+(hot?'hot':'guess'),hot?'🎤 About YOU':'🔮 What would '+nm(it.subj)+' pick?'));
      var qt=el('div','kw-qt',it.a[0]+' or '+it.a[1]+'?');anim(qt,key,'kwpop',350);scr.appendChild(qt);
      var mine=V.mine?V.mine[T.k]:null;
      var eo=el('div','kw-eo');
      eo.appendChild(btn(it.a[0],'kw-eob a'+(mine===0?' on':''),function(){sfx('lock');act({a:'ans',k:T.k,v:0})},{act:'sp',v:0,dis:T.lock[me]}));
      eo.appendChild(el('span','or','OR'));
      eo.appendChild(btn(it.a[1],'kw-eob b'+(mine===1?' on':''),function(){sfx('lock');act({a:'ans',k:T.k,v:1})},{act:'sp',v:1,dis:T.lock[me]}));
      scr.appendChild(eo);
      scr.appendChild(T.lock[me]?waitLine('Locked! Waiting for '+nm(pt)):el('p','kw-sub','Quick! 5 seconds. No time to overthink it.'));
      return;
    }
    var sl=el('div','kw-sl'),got={host:0,guest:0};
    T.items.forEach(function(x,i){
      var g=oth(x.subj),ok=T.res[i];if(ok)got[g]++;
      var r=el('div','kw-sr'+(ok?' ok':''));
      r.appendChild(el('div','kw-av '+x.subj,nm(x.subj).charAt(0).toUpperCase()));
      var mid=el('div');mid.appendChild(el('div','q',x.a[0]+' or '+x.a[1]+'?'));
      var sa=T.rev[x.subj][i],ga=T.rev[g][i];
      mid.appendChild(el('div','a',(x.subj===me?'You':nm(x.subj))+': '+(sa==null?'⏰ no answer':x.a[sa])+'  ·  '+(g===me?'you':nm(g))+' guessed: '+(ga==null?'⏰ no answer':x.a[ga])));
      r.appendChild(mid);r.appendChild(el('div','mk',ok?'✅':'❌'));
      anim(r,'sr'+V.ri+'.'+i,'kwrise',450,'ease-out',i*260);
      sl.appendChild(r);
    });
    scr.appendChild(el('span','kw-cat','⚡ Speed Round results'));
    scr.appendChild(sl);
    var tot=got.host+got.guest;
    scr.appendChild(burst('sb'+V.ri,tot>0,tot>=4?'ON FIRE! 🔥':tot>0?'DING x'+tot+'!':'BZZZT! 🫠',nm('host')+' +'+got.host+' · '+nm('guest')+' +'+got.guest));
    scr.appendChild(readyRow('Finish round ▶'));
  }
  function renderFinal(scr,T){
    var key='w'+V.ri;
    if(T.tp==='wager'){
      scr.appendChild(el('span','kw-cat','💰 Place your bet'));
      if(T.lock[me]){
        scr.appendChild(el('div','kw-locked','🔒 Bet locked: '+V.mine.wager+' point'+(V.mine.wager===1?'':'s')+' 💰'));
        scr.appendChild(waitLine(T.lock[pt]?'Here come the questions':'Waiting for '+nm(pt)+' to bet'));
        return;
      }
      var mx=T.max[me],c=CATS[T.qs[pt].cat]||CATS.hard;
      scr.appendChild(el('div','kw-qt','How well do you know '+nm(pt)+'?'));
      scr.appendChild(el('p','kw-sub','You have '+V.score[me]+' point'+(V.score[me]===1?'':'s')+'. Bet up to '+mx+'. You\'ll predict '+nm(pt)+'\'s answer to a '+c[1].toLowerCase()+' question. Right = +bet, wrong = −bet.'));
      var wk='wager:'+V.sid,cs=el('div','kw-coins');
      for(var i=0;i<=mx;i++)(function(n){cs.appendChild(btn(String(n),'kw-coin'+(sel[wk]===n?' on':''),function(){sel[wk]=n;render()},{act:'pick',v:n}))})(i);
      scr.appendChild(cs);
      scr.appendChild(lockButton('Lock in my bet 🔒',function(){return typeof sel[wk]==='number'},function(){act({a:'wager',v:sel[wk]})}));
      return;
    }
    if(T.tp==='answer'){
      scr.appendChild(el('span','kw-cat','🔥 The final questions'));
      if(T.lock[me]){
        scr.appendChild(el('div','kw-locked','🔒 You: '+fmt(T.qs[me],V.mine.self)));
        scr.appendChild(el('div','kw-locked','🔮 Your guess for '+nm(pt)+': '+fmt(T.qs[pt],V.mine.guess)));
        scr.appendChild(waitLine('Waiting for '+nm(pt)));
        return;
      }
      var a=el('div','kw-fq');a.appendChild(el('h4',null,'🎤 About you: answer honestly'));a.appendChild(el('div','kw-qt',T.qs[me].t));
      var ca=choiceArea(T.qs[me],'fself');a.appendChild(ca.node);scr.appendChild(a);
      var b=el('div','kw-fq');b.appendChild(el('h4',null,'🔮 About '+nm(pt)+': predict their answer'));b.appendChild(el('div','kw-qt',T.qs[pt].t));
      var cg=choiceArea(T.qs[pt],'fguess');b.appendChild(cg.node);scr.appendChild(b);
      scr.appendChild(lockButton('Lock both in 🔒',function(){return ca.get()!==null&&cg.get()!==null},function(){act({a:'ans',self:ca.get(),guess:cg.get()})}));
      if(T.lock[pt])scr.appendChild(el('p','kw-sub',nm(pt)+' has locked in. Your turn!'));
      return;
    }
    scr.appendChild(el('span','kw-cat','💰 The big reveal'));
    var fr=el('div','kw-fr');
    ['host','guest'].forEach(function(x,i){
      var y=oth(x),q=T.qs[x],res=T.res[x],w=T.rev.wager[y]|0;
      var p=el('div','kw-rev '+y);
      p.appendChild(el('small',null,(y===me?'Your':nm(y)+"'s")+' bet: '+w));
      p.appendChild(el('div','q',q.t));
      var l1=el('div','line',(x===me?'You':nm(x))+' answered');l1.appendChild(el('b',null,fmt(q,T.rev.self[x])));p.appendChild(l1);
      var l2=el('div','line',(y===me?'You':nm(y))+' guessed');l2.appendChild(el('b',null,fmt(q,T.rev.guess[y])));p.appendChild(l2);
      if(res===null){
        if(x===me){
          var j=el('div','kw-judge');j.appendChild(el('p',null,'⚖️ Close enough?'));
          var row=el('div','kw-row');
          row.appendChild(btn('✅ Yes','kw-btn',function(){act({a:'judge',v:true})},{act:'judge',v:1}));
          row.appendChild(btn('❌ No','kw-btn soft',function(){act({a:'judge',v:false})},{act:'judge',v:0}));
          j.appendChild(row);p.appendChild(j);
        }else p.appendChild(waitLine(nm(x)+' is judging'));
      }else{
        var rs=el('div','res '+(res?'ok':'no'),res?'DING! +'+w:'BZZZT! −'+w);
        if(T.applied){anim(rs,key+'r'+x,res?'kwding':'kwbuzz',700,null,i*500);if(once(key+'snd'+x))setTimeout(function(){sfx(res?'ding':'buzz')},i*500)}
        p.appendChild(rs);
      }
      anim(p,key+'p'+x,'kwflip',650,null,i*300);
      fr.appendChild(p);
    });
    scr.appendChild(fr);
    if(!T.applied){scr.appendChild(el('p','kw-sub','Scores update once both answers are judged.'));return}
    scr.appendChild(readyRow('See final results 🏁','pink'));
  }

  /* --- incoming --- */
  function onMsg(d){
    if(dead||!d||typeof d!=='object')return;
    if(isHost){
      if(d.k==='a')hostDo('guest',d.a);
      else if(d.k==='hi')bcast();
    }else if(d.k==='s'){
      if(typeof d.q!=='number'||d.q<=lastQ||!d.v)return; /* stale or duplicate snapshot */
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
    destroy:function(){dead=true;if(hiTimer){clearInterval(hiTimer);hiTimer=null}if(tm){clearTimeout(tm);tm=null}try{if(ac&&ac.close)ac.close()}catch(e){}},
    _core:core
  };
}

var API={makeCore:makeCore,BANK:BANK,HARD:HARD,LIKELY:LIKELY,SPEED:SPEED,STARTERS:STARTERS,CATS:CATS,norm:norm,parseQ:parseQ,GMA_N:GMA_N};
if(typeof registerGame==='function')registerGame({
  id:'knowus',icon:'🎤',name:'Who Knows Us Better?',
  blurb:'A TV quiz show for couples: guess each other\'s answers, point at who\'s more likely, spot the bluff, beat the clock and bet it all in the Final Wager.',
  start:GAME_START,_t:API
});
if(typeof module==='object'&&module&&module.exports)module.exports=API;
})();
