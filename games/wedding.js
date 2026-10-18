/* Wedding Planner - 2 players, co-op planning hub for a Punjabi Sikh wedding. Plugin for Duo Games.
   Host-authoritative: the host keeps the PLAN (localStorage 'duo_wedding_plan_v1') and the live session state,
   applies every action (guest actions arrive as {k:'a',a}) and broadcasts versioned snapshots {k:'s',q,v}.
   Secret answers (deck swipes, votes, budget coins) stay hidden until both players have answered.
   Private planner notes live only in the localStorage of the device that unlocked them. */
(function(){
'use strict';

/* =====================================================================================
   CONTENT
   ===================================================================================== */
var PLAN_KEY='duo_wedding_plan_v1',COLOR_KEY='duo_colorlab_v1';
var K_PIN='duo_wp_k1',K_NOTES='duo_wp_n1',K_PICS='duo_wp_p1';
var BATCH=10,MAX_PICS=20;

function lines(s){return s.split('\n').map(function(l){return l.trim()}).filter(Boolean).map(function(l){var p=l.split('|');return {e:p[0],t:p[1],d:p[2]||''}})}

var DECKS=[
{id:'day',e:'🌅',name:'Wedding Day',blurb:'Anand Karaj morning and the reception',raw:`
🌅|A calm, unhurried morning|Tea, ardaas at home and a little breathing room before heading to the gurdwara.
📜|Anand Karaj guide for guests|A small printed card explaining the ceremony, head coverings and etiquette for guests new to it.
🧣|Rumal basket at the door|Colour-matched head scarves ready at the entrance so every guest feels welcome.
👟|Shoe-care station|Labelled cubbies or volunteers so nobody hunts for their shoes afterwards.
🫖|Chai & pakora welcome|Hot chai and besan pakoras (naturally gluten-free) as guests arrive.
🌸|Simple, respectful florals|Fresh flowers at the entrance and stage area, kept simple; check with the gurdwara first.
📵|Unplugged ceremony|Ask guests to keep phones away and let the photographer capture the moment.
🕰️|Run-of-day card for helpers|A clear timetable for family helpers so the morning flows on time.
🧒|Quiet kids' corner|Colouring books and soft toys near the back so little ones stay happy.
🥛|Refreshments after the milni|Thandai or rose milk ready for the baraat right after the milni.
🎶|Live shehnai as the baraat arrives|Gentle shehnai or flute to welcome everyone.
🧵|Phulkari photo backdrop|A heritage phulkari wall for family photos between the ceremony and the reception.
🚌|Guest shuttle|A coach between gurdwara, hotel and reception so nobody worries about parking.
🥗|Clearly labelled langar|Gluten-free items labelled, or a separately prepared plate for her.
🍽️|Ten minutes just for us|A private moment to eat and soak it all in after the ceremony.
👗|Outfit change reveal|A second look for the reception with a mini reveal moment.
🎤|An emcee who knows both families|A cousin or pro MC who can pronounce every name and keep things moving.
🥂|Signature mocktails|Two drinks named after us, served as guests arrive at the reception.
🕺|Grand reception entry|A bold entrance song for the newlyweds (more in the Entrances deck).
🎂|Cake moment|A gluten-free cake with a sparkler send-off.
💬|Short, sweet speeches|Three speeches max, two minutes each, plus one surprise speaker.
💃|First dance that turns into bhangra|Starts slow and romantic, drops into dhol halfway.
🎁|Shagun box|A beautiful, secure box for cards and envelopes.
🪔|Diya-lined walkway|Candles or LED diyas lining the reception entrance.
🌙|Late-night snack drop|Surprise chaat, fries and chai at 10pm for the dancers.
🪑|Tables that mix both families|Seating that helps everyone get to know each other.
🎆|Cold-sparkler finale|Safe indoor sparklers for the last dance of the night.
🧺|Bathroom baskets|Safety pins, plasters, mints, bindis and hair ties.
🛋️|Quiet lounge for elders|Comfy chairs, tea and less noise.
🪧|Bilingual welcome sign|Punjabi and English welcome signs at both venues.
📺|Livestream for family abroad|A simple stream of the ceremony, with the gurdwara's permission.
🧁|Dessert table|A colourful dessert spread alongside (or instead of) cake.
🥞|Morning-after brunch|A relaxed brunch for close family and out-of-towners.`},
{id:'mehndi',e:'🌿',name:'Mehndi',blurb:'Henna, dholki, colour and chaat',raw:`
🌿|Natural henna artist|Organic henna with a deep stain; no black henna.
🔍|Hidden name in her mehndi|The artist hides his name in her design and he has to find it.
💚|Green & marigold theme|Leafy greens, bright marigolds and pops of pink.
🪑|Floor seating with gaddas|Low cushions, bolsters and rugs for a cosy, traditional feel.
🪘|Dholki & boliyan|Aunties and cousins with a dholki singing all the classics.
💃|Giddha circle|An open giddha circle where everyone joins in.
🌼|Marigold curtains|Strings of genda phool as backdrops and doorways.
🍋|Nimbu pani bar|Fresh lime soda, shikanji and jaljeera.
🥭|Mango lassi shots|Tiny glasses of mango lassi passed around.
🍿|Chaat counter|Golgappe (with gluten-free puris), aloo tikki and papdi chaat.
🍪|Mehndi-design biscuits|Gluten-free iced biscuits decorated like henna.
🎁|Mini henna cones as favours|Guests take a cone home to practise.
👩‍🎨|Express designs for guests|A second artist doing quick designs for everyone.
🏮|Lanterns & fairy lights|Warm, glowing light for the evening.
🌈|Colourful parandi favours|Tasselled parandis for the girls to wear and keep.
📷|Polaroid guest book|Snap, stick and write a wish.
🛺|Rickshaw photo prop|A painted rickshaw for silly group photos.
🎤|Punjabi classics karaoke|The old songs everyone's parents know by heart.
💫|Bangle bar|Glass bangles to try on and take home.
🧴|Mehndi aftercare kit|Lemon-sugar spray, cotton and tissues on every table.
❓|How-well-do-you-know-the-couple quiz|A cheeky quiz while the henna dries.
🌺|Fresh-flower jewellery|Floral jewellery for the bride instead of gold.
👩‍👧|Mother-daughter dance|A sweet surprise performance.
🎸|Acoustic set|Live sitar or acoustic covers of Punjabi songs.
☕|Masala chai station|Cardamom, ginger and plenty of refills.
🍯|Live jalebi counter|Ask the halwai about a gluten-free batch for her.
🪭|Hand fans for guests|Colourful fans that double as favours.
🧸|Kids' craft table|Paper henna hands, stickers and bangles for little ones.
🕯️|Intimate family-only mehndi|Just close family on the floor with a dholki.
🎉|Joint mehndi for both sides|One big party for both families.
🤚|A little mehndi for the groom|A small design for him (and his friends).
💌|Find-the-word game|Guests guess the hidden words in her design.`},
{id:'night',e:'🪔',name:'Sangeet & Jago',blurb:'Night functions, boliyan and dancing',raw:`
🏺|Classic jago with the gaagar|A decorated pot of diyas carried with boliyan through the street.
🪘|Live dhol team|Two dholis who keep the energy sky high.
🎤|Boliyan battle|Bride's side versus groom's side, judged by the elders.
💃|Family dance performances|Each branch of the family performs a short routine.
👫|Our couple performance|We perform a duet dance together.
🎭|Cousins' comedy skit|A funny skit retelling our love story.
🌟|Bollywood meets bhangra night|Glam outfits and full filmi energy.
🌾|Pind theme|Charpais, a hand pump, and village vibes.
🚜|Tractor photo prop|Because every Punjabi party needs one.
🪩|Disco ball and dhol fusion|Mirror balls over phulkari drapes.
✨|Sparklers for the jago walk|Cold sparklers to light the procession.
🧢|Matching pagg colours for the boys|One colour for the groom's squad.
🧣|Phulkari dupattas for the ladies|Bright dupattas for every woman in the family.
🍢|Street-food stalls|Tikki, pav bhaji and chole with gluten-free breads.
🍦|Kulfi cart|Pistachio, mango and malai on sticks.
🥤|Mocktail bar|Mango mojitos and rose coolers.
🎵|Live Punjabi singer|A singer for the big folk numbers.
🎛️|DJ and dhol mashup|A DJ set with live dhol over the top.
🕺|Bhangra lesson for guests|A pro teaches everyone a short routine.
👵|Elders' boliyan spotlight|Hand the mic to the nanis and dadis.
🎲|Couple trivia on stage|Who knows who better?
📽️|Childhood photo slideshow|Baby photos on the big screen.
💡|Fairy-light canopy|A ceiling of warm lights.
🌌|Under the stars|An outdoor night function, weather permitting.
🔥|Fire-pit chill zone|Somewhere warm to sit and chat.
🎙️|Open mic for wishes|Friends and family share blessings.
🥁|Dholki-only ladies sangeet|Traditional and intimate: just songs and claps.
👯|Giddha group performance|A rehearsed giddha by the girls.
🕶️|Groom's squad surprise dance|His friends rehearse in secret.
🌈|Glow-stick favours|For the late-night dancing.
☕|Late-night chai & snacks|Gluten-free snacks clearly labelled.
🎨|Caricature artist|Fun portraits for guests to take home.`},
{id:'entrance',e:'🚪',name:'Entrances',blurb:'Big arrivals for every function',raw:`
🥁|Dhol-led entrance|Dholis lead us in with a thundering beat.
🐎|Ghodi for the baraat|The groom arrives on a decorated mare.
🚗|Vintage car arrival|A classic car pulling up to the venue.
🏍️|Motorbike arrival|A Royal Enfield entrance for the groom.
🛺|Decorated tuk-tuk|Bright, fun and very photogenic.
🚜|Tractor entrance for the jago|Pure Punjabi swag.
🌸|Phulkari canopy walk|Brothers and cousins carry a phulkari or floral canopy over the bride.
✨|Sparkler tunnel|Guests line up with sparklers for us to walk through.
💃|Choreographed couple entry|A rehearsed routine as we walk in.
🕺|Bhangra crew escort|A bhangra team dances us into the reception.
🎶|Surprise song from him|He sings a few lines as she walks in.
🎤|Surprise song from her|She sings to him instead.
🎻|String quartet playing a Punjabi hit|Elegant with a twist.
🎺|Brass band|A full band baaja for the baraat.
🌹|Rose-petal shower|Petals from the balcony as we enter.
💨|Low-fog dance-floor entry|Dreamy fog for the first dance.
🎆|Cold pyro on stage|Sparkle fountains as we take our seats.
👯|Bride's squad entry|Her sisters and friends dance in first.
🕶️|Groom's squad with sunglasses|Slow-motion swagger.
🧒|Flower kids leading the way|Little ones scatter petals.
🎬|Movie-trailer intro|A 30-second trailer plays before we walk in.
🔦|Spotlight silhouette reveal|Lights down, spotlight on, big reveal.
💡|LED dance-floor reveal|The floor lights up as we step on.
🪔|Diya-lit pathway|A walkway of glowing diyas.
🎠|Mehndi swing entrance|She arrives on a decorated jhoola.
🌼|Doli-style mehndi entrance|Carried in on a decorated doli by cousins.
🎊|Confetti cannon finish|Boom, confetti everywhere.
📢|MC hype intro with nicknames|Embarrassing childhood nicknames included.
🎵|Family favourites mashup|A mix of both families' favourite songs.
🥳|Whole-family conga line|Everyone dances in behind us.
🚁|Drone shot of the baraat|Aerial footage of the procession.
🏮|Lantern walk for the night function|Guests carry lanterns as we arrive.`},
{id:'video',e:'🎬',name:'Couple Video',blurb:'Do we make a video from us?',raw:`
💌|Save-the-date video|A short, fun clip announcing the date.
🎞️|Love-story montage|Photos and clips from the day we met until now.
🎥|Same-day edit|Highlights from the morning shown at the reception.
🙏|Thank-you video for guests|Sent to everyone after the wedding.
👵|Messages from grandparents|Blessings recorded on camera.
🧒|Childhood photo morph|Baby photos morphing into today.
📍|Where-we-met recreation|Back to the spot where it all began.
🎤|Lip-sync music video|To our favourite Punjabi track.
🗺️|Travel diaries montage|All our trips in two minutes.
🗣️|How-we-met interviews|Each of us tells the story separately, cut together.
🤣|Blooper reel|All the outtakes, unfiltered.
❓|How well do we know each other|A quick-fire quiz on camera.
🎬|Bollywood poster parody|A dramatic filmi-style trailer.
🏙️|Cinematic city walk|Golden hour in our favourite city.
🌾|Farm or village shoot|Mustard fields if we can find them.
🏠|Get-ready-with-us vlog|The chaos of the morning.
⏳|Countdown teaser series|A tiny clip every week before the wedding.
👨‍👩‍👧|Meet the families|Introductions for guests who don't know everyone.
🐾|Pet cameo|Every good video needs one.
🎶|Our own song|Written and sung by us (or a friend).
🎨|Animated invitation|Illustrated versions of us.
📱|Vertical reels|Short clips made for sharing.
✉️|Letter-reading video|We read letters to each other on camera.
🌅|Sunrise drone shoot|Big, sweeping and dreamy.
🎉|Guest dance compilation|Every guest's best move.
📼|Retro VHS edit|Grainy, nostalgic and fun.
🍳|Cooking together|Making our favourite gluten-free dish.
🚗|Road-trip vlog|A day out, just us two.
🎁|Surprise video for our parents|Played at the reception.
🎙️|Podcast-style chat|Talking about the wedding plans honestly.
🔁|Then and now|Recreating old photos.
🌟|Highlight trailer|The full wedding in three minutes.`},
{id:'honeymoon',e:'🏝️',name:'Honeymoon',blurb:'Destinations, vibes and activities (veg & celiac-friendly notes)',raw:`
🇮🇹|Amalfi Coast, Italy|Lemon groves and sea views; Italy is very celiac-aware, just ask for senza glutine.
🇬🇷|Greek islands|Santorini sunsets; veggie meze and lots of naturally gluten-free dishes.
🇲🇻|Maldives overwater villa|Pure relaxation; resorts prepare veg and gluten-free meals on request.
🇯🇵|Japan|Temples, gardens and tech; soy sauce contains wheat, so carry a gluten-free card and tamari.
🇹🇭|Thai beaches|Rice-based and veg-friendly; ask about soy and oyster sauce.
🇮🇩|Bali|Yoga, rice terraces and endless vegan cafés.
🇱🇰|Sri Lanka|Tea hills, safaris and beaches; rice and curry heaven.
🇵🇹|Portugal|Lisbon trams and the Douro valley; a growing veg scene.
🇪🇸|Spain|Tapas like patatas bravas and tortilla; many gluten-free-aware restaurants.
🇨🇭|Swiss Alps|Lakes and mountain trains; check fondue for flour thickeners.
🇫🇷|Paris & Provence|Lavender fields, markets and macarons (naturally gluten-free).
🇮🇸|Iceland|Northern lights, waterfalls and hot springs.
🇳🇴|Norwegian fjords|Cabins, hikes and dramatic views.
🇲🇽|Tulum, Mexico|Cenotes and beaches; corn tortillas are naturally gluten-free.
🇨🇷|Costa Rica|Rainforests, volcanoes and rice and beans everywhere.
🇿🇦|Cape Town & safari|Mountains, wine country and the big five.
🇰🇪|Kenya safari|Sunrise game drives and starry camps.
🇦🇪|Dubai & Abu Dhabi|Luxury, desert dunes and Indian vegetarian food everywhere.
🇲🇺|Mauritius|An island resort with strong Indian food culture.
🇸🇨|Seychelles|Granite beaches and turquoise water.
🇳🇿|New Zealand road trip|Lakes, mountains and campervans.
🇦🇺|Australia|Beaches, reefs and some of the best gluten-free menus anywhere.
🇨🇦|Banff & the Rockies|Turquoise lakes and cosy lodges.
🇺🇸|California coast|Big Sur drives and gluten-free options everywhere.
🇻🇳|Vietnam|Rice noodles galore; ask for no soy sauce.
🇹🇷|Cappadocia|Hot-air balloons at sunrise and cave hotels.
🏖️|Vibe: beach and do nothing|Sun, books and naps.
🏔️|Vibe: adventure and hiking|Trails, views and early starts.
🏙️|Vibe: city and food crawl|Markets, museums and restaurants.
🛳️|Vibe: cruise|A new port every day, no packing.
🧘|Vibe: wellness retreat|Spa days, yoga and clean eating.
🚂|Activity: scenic train journey|Mountains and valleys through big windows.
🤿|Activity: snorkelling or diving|Coral reefs and turtles.
👩‍🍳|Activity: vegetarian cooking class|Pick one that can cook gluten-free.
🧳|Mini-moon now, big trip later|A short escape after the wedding, the dream trip later.`},
{id:'decor',e:'🌺',name:'Decor & Themes',blurb:'Colours, florals and atmosphere',raw:`
🌼|Marigold & magenta|Bright, joyful and very Punjabi.
👑|Royal maroon & gold|Rich, regal and timeless.
🤍|Ivory & gold minimal|Clean, elegant and calm.
🌿|Garden greenery|Lush leaves and white flowers.
🧵|Phulkari heritage theme|Embroidered textures everywhere.
🪔|Diya & lantern glow|Warm candlelight for every function.
🏛️|Mughal arches & mirrors|Grand arches and mirrored panels.
🍑|Pastel peach & sage|Soft, romantic and modern.
💙|Midnight blue & gold|Moody, starry and luxurious.
🌺|Floral ceiling installation|Flowers hanging overhead.
🪞|Sheesh mahal mirror work|Tiny mirrors catching every light.
⛺|Tent with chandeliers|Outdoor glamour.
🎪|Colourful shamiana|A traditional printed canopy.
🛋️|Lounge seating areas|Sofas and rugs for chatting.
🌾|Rustic Punjab|Hay bales, charpais and brass pots.
🪷|Lotus & water features|Floating flowers and candles.
🕯️|Candle walls|Hundreds of flickering candles.
✒️|Calligraphy signage|Hand-lettered signs in gold.
🖼️|Family history wall|Old wedding photos of parents and grandparents.
🔔|Hanging bells & tassels|Movement and gentle sound.
🎨|Rangoli at the entrance|Colourful and welcoming.
💐|Tall centrepieces|Dramatic and elegant.
🍃|Low, lush centrepieces|Easy for conversation across the table.
🎀|Draped fabric ceilings|Soft and romantic.
✨|Fairy-light curtains|A glowing backdrop for photos.
🧿|Mirror-work cushions|Colourful bolsters and cushions.
🌙|Moon & stars night theme|Perfect for the sangeet.
🪴|Potted plants to gift after|Sustainable decor guests take home.
🏮|Paper lanterns|Strings of colourful lanterns.
🖌️|Hand-painted backdrops|Custom art by a local artist.
🪑|Velvet chairs|Plush, jewel-toned seating.
💡|Neon sign with our names|A fun photo spot.`},
{id:'food',e:'🍛',name:'Food',blurb:'Vegetarian, gluten-free friendly menus & dessert bars',raw:`
🍛|Full Punjabi spread|Dal makhani, paneer and chole, with gluten-free breads.
🫓|Makki di roti & sarson da saag|Maize roti is naturally gluten-free.
🌾|Gluten-free roti station|Fresh rotis made separately to avoid cross-contact.
🧀|Paneer tikka live grill|Smoky, marinated and naturally gluten-free.
🥗|Chaat counter|With gluten-free puris for golgappe.
🍚|Veg biryani & pulao|Fragrant rice dishes everyone loves.
🌮|Indo-Mexican tacos|Corn shells with paneer and salsa.
🍕|Wood-fired pizza|With a gluten-free base option.
🍝|Pasta bar|Gluten-free pasta and fresh sauces.
🥟|Veg momos|Gluten-free wrappers or rice paper.
🍜|Indo-Chinese counter|Made with tamari instead of soy sauce.
🥙|Mediterranean mezze|Hummus, falafel and grilled veg.
🧆|Falafel & hummus bar|Check the falafel is made without flour.
🍟|Late-night masala fries|For the dance floor crowd.
🍦|Froyo bar|Frozen yoghurt with fruit, nuts and sauces.
🫐|Açaí bowl bar|Build-your-own bowls with fresh fruit.
🍨|Kulfi falooda|A cold classic.
🥕|Gajar halwa|Warm and comforting.
🍬|Mithai table|Label the gluten-free ones, like besan ladoo and barfi.
🍩|Gluten-free doughnut wall|Fun and photogenic.
🍫|Chocolate fountain|With fruit and marshmallows.
🍓|Fresh fruit display|Colourful and light.
☕|Chai & coffee bar|Masala chai and good coffee.
🥤|Mocktail menu|Named after our love story.
🥥|Coconut water stand|Refreshing and fun.
🍋|Shikanji stand|Lemon, salt and a little masala.
🎂|Gluten-free tiered cake|Nobody will know the difference.
🧁|Cupcake tower|Easy to grab and go.
🍿|Popcorn cart|Masala, caramel and cheese.
🏷️|Allergen labels on every dish|Clear and kind for all guests.
👩‍🍳|Tasting session|Try everything with the caterer first.
🥘|Grandma's signature dish|A family recipe on the menu, credited on a sign.
🍽️|A safe plate for her|The caterer prepares the couple's plates in a dedicated gluten-free area.`},
{id:'music',e:'🎵',name:'Music & DJ',blurb:'Soundtrack for every moment',raw:`
🎛️|Punjabi + Bollywood DJ|A DJ who reads the room.
🥁|Dhol with the DJ|Live dhol over the big tracks.
🎤|Live singer at the reception|For the folk and romantic numbers.
🎻|String quartet covers|Punjabi hits, classical style.
🌹|Sufi evening|Soulful qawwali-style music.
📻|90s bhangra hour|The songs our parents danced to.
📝|Request cards on tables|Guests write their must-play song.
🚫|Do-not-play list|Every couple needs one.
💿|Our song list|The tracks that tell our story.
💃|Couple dance song|Our first dance pick.
👨‍👩‍👧|Parents' dance song|A moment for both sets of parents.
🕺|Boliyan mashup|Traditional boliyan remixed.
🎹|Pianist during dinner|Soft and elegant.
🎸|Acoustic cocktail hour|Gentle covers while guests mingle.
🌍|Global hits segment|Something for every guest.
🎧|Silent disco|Late-night fun without the noise.
🎼|Shehnai at the doli|A soft, emotional send-off.
🎙️|Karaoke corner|For the brave.
🪘|Dholki session|At the mehndi.
📣|Hype MC|Keeps the dance floor full.
🎂|Cake-cutting song|Something cheesy and fun.
🕯️|Slow-dance set|For the couples.
👵|Grandparents' request slot|Their favourite song, their moment.
🎵|Flash-mob surprise|Guests break into a routine.
🥳|Last song of the night|Everyone in a big circle.
💡|Light show synced to music|Big drops, big lights.
🗒️|Song request on the RSVP|Build the playlist from guests.
🪕|Live tumbi player|A classic Punjabi sound.
🎺|Brass band at the baraat|Loud and joyful.
🎶|Couple singing a duet|Brave and adorable.
🌙|After-party DJ set|For the night owls.
🔉|Quiet zone for elders|Somewhere to chat away from the speakers.`},
{id:'guest',e:'🎁',name:'Guest Experience',blurb:'Favours, photo booth, welcome bags',raw:`
🍬|Mithai box favours|A classic sweet thank-you.
🌱|Seed or plant favours|Something that grows.
🧳|Welcome bags at the hotel|Snacks, water, map and a note.
📸|Photo booth with props|Pagg props, glasses and signs.
🔄|360° video booth|Fun clips to share.
🖼️|Polaroid guest book|Photos and wishes in one book.
🗺️|Local guide for out-of-towners|Food, sights and gurdwaras nearby.
🚐|Shuttle service|Between venues and hotels.
🧣|Shawls for cold evenings|Cosy and useful.
🩴|Flip-flop basket for dancers|Sore feet saved.
🧒|Kids' activity packs|Colouring, stickers and snacks.
👵|Comfortable seating for elders|Close to the action, away from speakers.
💧|Water stations|Everyone stays hydrated.
☂️|Umbrellas just in case|For the unpredictable weather.
🧾|Personalised menus|With allergen info.
🪧|Seating chart display|Beautiful and easy to read.
📱|Wedding website & RSVPs|All the info in one place.
#️⃣|Couple hashtag|Collect everyone's photos.
🎨|Live painter|A painting of the event created live.
✏️|Caricature artist|Fun takeaway portraits.
💌|Handwritten thank-you notes|At every place setting.
🧁|Take-home dessert boxes|For the drive home.
🕯️|Candle favours|Scented with something we love.
🌶️|Family masala blend favours|A taste of home.
🍫|Personalised chocolates|With our initials.
🪔|Diya favours|A little light to take home.
🧿|Nazar keychains|A playful, colourful keepsake.
🧺|Bathroom baskets|Everything a guest might forget.
⏳|Time capsule|Guests write letters for our first anniversary.
🧩|Table games|Quizzes and puzzles at dinner.
🌍|Livestream link|For family abroad.
🔤|Name pronunciation guide|In the invitation for non-Punjabi guests.`},
{id:'photo',e:'📸',name:'Photography',blurb:'Shots we must not miss',raw:`
👫|First-look shoot|A private moment before the day begins.
🖐️|Mehndi close-ups|Every detail of the henna.
🔴|Choora ceremony candids|Emotional and colourful.
💛|Maiyan action shots|Turmeric everywhere.
🏺|Jago night with diyas|Glowing faces and dancing.
🐎|Groom on the ghodi|The baraat in full swing.
🤝|Milni hugs|Families meeting with garlands.
🙏|Respectful wide shot of the ceremony|From the back, following the gurdwara's guidelines.
👪|Big family group photo|Everyone, all together.
👴|Grandparents with the couple|A photo to treasure forever.
👭|Bride with sisters and cousins|Laughs and tears.
🕶️|Groom with his squad|Swagger shots.
🧵|Phulkari portrait|Heritage meets modern.
🌇|Golden-hour portraits|Soft, warm light.
🎇|Night sparkler portraits|Dreamy and magical.
🚗|Getaway car shot|Waving goodbye.
😢|Doli candids|The emotional farewell.
🎂|Cake-cutting|Sweet and fun.
💃|Dance-floor energy|Everyone going wild.
💄|Getting-ready candids|The calm before the storm.
💎|Outfit and jewellery flat-lay|Every detail styled.
💌|Invitation flat-lay|For the album cover.
🧒|Kids' candids|Pure joy.
🏠|Home ceremony candids|Maiyan, gharoli and family moments.
🛕|Gurdwara exterior portrait|Respectful shots outside.
🥹|Parents' reactions|The tears and the smiles.
📷|Disposable cameras on tables|Guests' point of view.
⚫|Black & white emotional set|Timeless moments.
🚁|Drone wide shots|The whole celebration from above.
🤳|Phone content creator|Behind-the-scenes clips the same day.
🪞|Mirror reflection shot|Artistic and unique.
🖋️|Signing the guest book|A small but sweet moment.`},
{id:'thanks',e:'💐',name:'Family Thank-yous',blurb:"Thank-yous, gifts and speeches for both families",raw:`
🎁|Milni gifts|Thoughtful gifts (shawls, kara, blankets) for each milni pair.
🎤|Thank-you speech at the reception|A heartfelt few minutes for both families.
🎥|Surprise video for parents|Childhood clips and a message from us.
🖼️|Framed family photo|A beautiful print from the wedding.
✉️|Handwritten letters|A letter to each parent.
🙏|Seva in the family's name|Langar seva or a donation in the family's name.
💃|Surprise performance|A dance or song just for the families.
💐|Flowers for both mums|Delivered the morning after.
⌚|Engraved watch for dads|With the wedding date.
📖|Family recipe book|Collected from both sides.
🧣|Phulkari for grandmothers|A treasured keepsake.
🏡|Weekend away for parents|A rest after all their hard work.
🍽️|Thank-you dinner|A relaxed meal after the wedding.
🎶|Song dedication|At the sangeet or reception.
🌳|Family-tree artwork|Both families joined in one piece.
🧹|Help with the clean-up day|Show up and help after the wedding.
📚|Photo album for each family|Printed and personal.
🎂|Parents' anniversary cake|A surprise at the reception.
💌|Cards for helpers and sevadars|Everyone who made it happen.
🌱|Plant a tree in the families' names|A lasting thank-you.
🙌|Shout-outs for every helper|Named in the speeches.
🍬|Mithai boxes for relatives|Delivered personally.
🎈|Gifts for the sarbala and flower kids|Something fun for the little ones.
👗|Outfits for siblings|A matching surprise.
🏆|Funny family awards|Best dancer, most emotional, loudest laugh.
🕯️|Honouring loved ones who aren't with us|A photo table or a moment of remembrance.
✨|A special thank-you for Mhji's family|Something just for them.
🪧|Thank-you sign at the reception|A big, warm message.
☕|Tea morning with both families|A calm catch-up after the chaos.
🥂|Toast to both mums|Raise a glass (of mango lassi).
📞|Thank-you calls to elders abroad|A personal call to everyone who couldn't come.
🎨|Commissioned painting|A painting of the family home or village.`}
];
var DK={};DECKS.forEach(function(d){d.cards=lines(d.raw).map(function(c,i){c.id='i'+i;return c});delete d.raw;DK[d.id]=d});
var IDEA_DECKS=DECKS.filter(function(d){return d.id!=='thanks'}).map(function(d){return d.id});

var SHABADS=[
{id:'s1',t:'Hum Ghar Saajan Aaye',th:'Joy and gratitude that the Beloved has come home; a favourite at wedding celebrations.'},
{id:'s2',t:'Mittar Pyare Nu',th:'A tender message of longing to the Beloved Friend; deeply loved and often sung softly.'},
{id:'s3',t:'Tu Thakur Tum Peh Ardaas',th:'A humble prayer placing everything before Waheguru; calm and devotional.'},
{id:'s4',t:'Koi Aan Milavai Mera Preetam Pyara',th:'Longing for someone to bring the Beloved near; often heard at Sikh weddings.'},
{id:'s5',t:'Visar Nahi Evad Data',th:'A heartfelt plea never to forget the great Giver; gentle and reflective.'},
{id:'s6',t:'Mera Man Lochai',th:'Yearning for the Guru\u2019s darshan; a moving piece about love and separation.'},
{id:'s7',t:'Rakhe Rakhanhaar',th:'Trust in Waheguru as the protector; uplifting and reassuring.'},
{id:'s8',t:'Deh Shiva Bar Mohe',th:'A resolve never to turn away from good deeds; stirring and often sung with energy.'},
{id:'s9',t:'Jo Mange Thakur Apne Te',th:'Faith that the longing of the devoted is fulfilled; hopeful and joyful.'},
{id:'s10',t:'Viahu Hoa Mere Babula',th:'The soul\u2019s union with the Divine through the Guru; traditionally associated with weddings.'},
{id:'s11',t:'Poota Mata Ki Asees',th:'A mother\u2019s loving blessing; a beautiful way to honour family.'},
{id:'s12',t:'Dhan Dhan Ram Das Gur',th:'Praise of Guru Ram Das Ji; joyful and much loved.'},
{id:'s13',t:'Aisi Laal Tujh Bin',th:'Wonder at the grace that uplifts the humble; warm and celebratory.'},
{id:'s14',t:'Satgur Hoye Dayal',th:'Gratitude for the True Guru\u2019s kindness; joyful and hopeful.'},
{id:'s15',t:'Thir Ghar Baiso Har Jan Pyare',th:'Steadiness and peace at home under the Guru\u2019s protection.'}
];
var SHB={};SHABADS.forEach(function(s){SHB[s.id]=s});

var EVENTS=[
{id:'roka',e:'🤝',t:'Roka',d:'The first informal commitment between the families: blessings, sweets and small gifts. The match is officially "booked".'},
{id:'kurmai',e:'💛',t:'Kurmai / Mangni',d:'The formal betrothal ceremony, often with an ardaas at the gurdwara; the families exchange blessings, gifts and sweets.'},
{id:'chunni',e:'🧣',t:'Chunni Chadauni',d:'The groom\u2019s family places a red chunni (often a phulkari) over the bride\u2019s head and gifts her jewellery and an outfit.'},
{id:'saha',e:'📜',t:'Saahe Chitthi',d:'The wedding date is fixed and shared with the family in a formal letter.'},
{id:'path',e:'🙏',t:'Akhand Path / Sehaj Path',d:'A complete reading of Sri Guru Granth Sahib Ji at home or the gurdwara before the wedding, ending with bhog and ardaas.'},
{id:'gaana',e:'🧶',t:'Gaana',d:'A sacred thread with a few small charms tied on the wrists of the bride and groom before the maiyan.'},
{id:'maiyan',e:'💛',t:'Maiyan / Vatna',d:'A paste of turmeric, flour and oil rubbed on by family. Tip: a besan (gram flour) vatna keeps it gluten-free.'},
{id:'mehndi',e:'🌿',t:'Mehndi',d:'Henna for the bride and the women of the family, with songs, dholki and dancing.'},
{id:'jago',e:'🏺',t:'Jago',d:'The night before the wedding: a decorated gaagar with diyas is carried through the streets with boliyan and dancing.'},
{id:'sangeet',e:'🎶',t:'Ladies Sangeet / Giddha',d:'An evening of folk songs, giddha, boliyan and dholki with the women of the family.'},
{id:'choora',e:'🔴',t:'Choora',d:'The bride\u2019s mama (maternal uncle) gives her the red and white wedding bangles, often in a small family ceremony.'},
{id:'kaleere',e:'✨',t:'Kaleere',d:'Golden ornaments tied to the choora. She shakes them over unmarried friends; whoever they fall on is said to marry next!'},
{id:'gharoli',e:'🏺',t:'Gharoli',d:'The groom\u2019s sister or bhabi fills a decorated pitcher with water for his ceremonial bath.'},
{id:'sehra',e:'🌼',t:'Sehra Bandi',d:'The family ties the sehra on the groom\u2019s turban, often with a young sarbala by his side, and gives shagan.'},
{id:'baraat',e:'🐎',t:'Baraat',d:'The groom\u2019s family and friends travel to the gurdwara with dhol and bhangra.'},
{id:'milni',e:'🤗',t:'Milni',d:'The families formally meet: relatives of matching relation exchange garlands, hugs and gifts after an ardaas.'},
{id:'anand',e:'🛕',t:'Anand Karaj',d:'The sacred Sikh wedding ceremony in the presence of Sri Guru Granth Sahib Ji, centred on the four Laavan. Plan timings and protocol with your gurdwara and Granthi Singh.'},
{id:'langar',e:'🍲',t:'Langar',d:'The community meal served after the ceremony.'},
{id:'doli',e:'🥹',t:'Doli / Vidaai',d:'The bride\u2019s emotional farewell from her family home.'},
{id:'reception',e:'🎉',t:'Reception',d:'The evening celebration with dinner, speeches and dancing.'},
{id:'paani',e:'💧',t:'Paani Vaarna',d:'The groom\u2019s mother welcomes the couple home by circling a glass of water over their heads.'},
{id:'games',e:'🎲',t:'Couple games',d:'Playful games after arriving home, like untying the gaana knots or finding a ring in a bowl of milky water.'},
{id:'phera',e:'🏡',t:'Phera Pauna',d:'The couple visits the bride\u2019s family home a day or two after the wedding.'}
];
var EVB={};EVENTS.forEach(function(e){EVB[e.id]=e});

var CHECK=[
['venue','🏛️','Reception venue booked'],['gurdwara','🛕','Gurdwara booked for the Anand Karaj'],['granthi','🙏','Granthi Singh & raagi jatha confirmed'],
['rumalla','🧵','Rumalla Sahib arranged'],['date','📅','Dates confirmed with both families'],['guests','📋','Guest list drafted'],
['invites','💌','Invitations designed & sent'],['rsvp','✅','RSVPs collected'],['outfits','👗','Wedding outfits ordered'],
['pagg','🧣','Turban & chunni colours chosen'],['jewellery','💎','Jewellery chosen'],['photo','📸','Photographer & videographer booked'],
['dj','🎛️','DJ booked'],['dhol','🥁','Dhol players booked'],['makeup','💄','Hair & makeup artist booked'],
['mehndiart','🌿','Mehndi artist booked'],['caterer','🍛','Caterer booked (GF & veg tasting done)'],['cake','🎂','Gluten-free cake ordered'],
['decor','🌺','Decorator booked'],['transport','🚗','Transport arranged (car / ghodi / coach)'],['hotel','🏨','Guest accommodation blocked'],
['rings','💫','Wedding bands sorted'],['milnigifts','🎁','Milni gifts bought'],['favours','🍬','Guest favours ready'],
['music','🎵','Playlist & do-not-play list done'],['speeches','🎤','Speeches & MC planned'],['budget','🪙','Budget agreed'],
['honeymoon','🏝️','Honeymoon booked'],['docs','📄','Marriage registration paperwork'],['emergency','🧰','Wedding-day emergency kit']
].map(function(a){return {id:a[0],e:a[1],t:a[2]}});
var CKB={};CHECK.forEach(function(c){CKB[c.id]=c});

var BUD=[['venue','🏛️','Venue'],['food','🍛','Food'],['outfits','👗','Outfits'],['decor','🌺','Decor'],['photo','📸','Photo & video'],
['ent','🎶','Entertainment'],['honeymoon','🏝️','Honeymoon'],['jewellery','💎','Jewellery'],['gifts','🎁','Gifts'],['misc','🧾','Misc']].map(function(a){return {id:a[0],e:a[1],t:a[2]}});

var SECTIONS=[
{id:'decks',e:'🎉',t:'Functions & Ideas',d:'Swipe decks for every function: wedding day, mehndi, sangeet, entrances, food and more.'},
{id:'shabad',e:'🙏',t:'Shabad',d:'Do we want to sing a shabad together, and which one?'},
{id:'thanks',e:'💐',t:'Family Thank-yous',d:'Are we doing a thank-you or anything like that for Mhji\u2019s family?'},
{id:'budget',e:'🪙',t:'Budget Battle',d:'Split 100 coins in secret, then compare.'},
{id:'timeline',e:'📅',t:'Timeline & Checklist',d:'Every ceremony from roka to phera pauna, plus the big to-do list.'},
{id:'colors',e:'🎨',t:'Outfit Colours',d:'Bring in your Couple Color Lab palettes.'},
{id:'sparkle',e:'✨',t:'Sparkle Showdown',d:'Jewellery & accents for our wedding looks.'}
];

/* gems for Sparkle Showdown: friendly colour names (shown to both) + stone hint (planner notes only) */
var GEMS=[
{id:'royal',n:'Royal Blue',s:'Blue sapphire (royal)',hex:'#1d3a9e'},
{id:'corn',n:'Cornflower',s:'Blue sapphire (cornflower)',hex:'#5b80e0'},
{id:'teal',n:'Ocean Teal',s:'Teal sapphire',hex:'#0f7f84'},
{id:'green',n:'Forest Green',s:'Green sapphire',hex:'#2c7a49'},
{id:'mint',n:'Seafoam Mint',s:'Mint / seafoam sapphire',hex:'#79cfb2'},
{id:'purple',n:'Royal Purple',s:'Purple spinel',hex:'#6a2c91'},
{id:'lav',n:'Lavender',s:'Lavender spinel',hex:'#b39be2'},
{id:'hotpink',n:'Hot Pink',s:'Hot pink spinel',hex:'#e0287a'},
{id:'red',n:'Ruby Red',s:'Red spinel',hex:'#be1830'},
{id:'pink',n:'Blush Pink',s:'Pink sapphire',hex:'#f08bb4'},
{id:'peach',n:'Sunset Peach',s:'Peach / padparadscha sapphire',hex:'#f4a07c'},
{id:'yellow',n:'Golden Yellow',s:'Yellow sapphire',hex:'#f0c232'},
{id:'grey',n:'Misty Steel',s:'Grey spinel',hex:'#7d8aa2'},
{id:'cobalt',n:'Electric Cobalt',s:'Cobalt blue spinel',hex:'#2347e6'},
{id:'white',n:'Classic White',s:'White / colourless',hex:'#e6edf6'}
];
var CUTS=[{id:'oval',n:'Oval'},{id:'cushion',n:'Cushion'},{id:'emerald',n:'Emerald-cut'},{id:'pear',n:'Pear'},{id:'round',n:'Round'},{id:'radiant',n:'Radiant'}];
var SPQ=[
{id:'tone',q:'Which jewel tone for the sangeet accents?',o:['Sapphire blue','Emerald & teal','Ruby & pink','Amethyst purple','Citrine & gold','Peachy blush']},
{id:'metal',q:'Gold or platinum vibe?',o:['Yellow gold','Rose gold','White gold / platinum','Mix it up']},
{id:'bold',q:'Bold or delicate?',r:['Delicate & dainty','Big & bold']},
{id:'halo',q:'Halo or solitaire for a cocktail ring?',o:['Solitaire','Halo','Three-stone','Cluster']},
{id:'size',q:'Statement stone size for the reception look?',o:['Petite sparkle','Medium & elegant','Showstopper']},
{id:'shape',q:'Favourite shape for earrings or a pendant?',o:['Oval','Pear','Round','Cushion','Emerald-cut','Radiant']},
{id:'intense',q:'Colour intensity?',r:['Soft pastel','Deep & vivid']},
{id:'era',q:'Vintage or modern?',r:['Vintage heirloom','Sleek modern']},
{id:'daily',q:'Which would you wear every day?',o:['A coloured stone','Classic white sparkle','Pearls','Plain gold']},
{id:'setting',q:'Which setting style do you like?',o:['Classic prongs','Smooth bezel rim','Hidden halo','Sideways (east-west)']},
{id:'band',q:'Which band style catches your eye for stacking?',o:['Thin & plain','Pav\u00e9 sparkle','Twisted','Vintage milgrain']},
{id:'pop',q:'Reception look: colour pop or all-white sparkle?',r:['All-white sparkle','Colour pop']}
];

/* =====================================================================================
   PURE HELPERS (exported via _t for node tests)
   ===================================================================================== */
function rngF(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hashStr(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function shufR(a,r){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(r()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
function oth(r){return r==='host'?'guest':'host'}
function clean(s,max){return String(s==null?'':s).replace(/[\u0000-\u001f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max||200)}
function isRole(r){return r==='host'||r==='guest'}
function num(v,d){v=+v;return isFinite(v)?v:(d||0)}

function defaultPlan(){
  var p={v:1,updated:0,date:'',decks:{},shabad:{vote:{host:'',guest:''},short:{host:[],guest:[]},pick:''},gifts:[],budget:null,budTotal:'',tl:{},ck:{},ckCustom:[],color:null,spk:{rounds:0}};
  DECKS.forEach(function(d){p.decks[d.id]={res:{},star:{},custom:[]}});
  return p;
}
function cardOf(plan,deckId,cid){
  var d=DK[deckId];if(!d)return null;
  var m=/^i(\d+)$/.exec(cid);if(m)return d.cards[+m[1]]||null;
  var cs=plan&&plan.decks&&plan.decks[deckId]?plan.decks[deckId].custom:[];
  for(var i=0;i<cs.length;i++)if(cs[i].id===cid)return cs[i];
  return null;
}
function validAlloc(a){
  if(!Array.isArray(a)||a.length!==BUD.length)return null;
  var s=0,o=[];for(var i=0;i<a.length;i++){var v=Math.round(+a[i]);if(!(v>=0&&v<=100))return null;s+=v;o.push(v)}
  return s===100?o:null;
}
function compromise(a,b){
  var raw=a.map(function(x,i){return (x+b[i])/2}),fl=raw.map(Math.floor),left=100-fl.reduce(function(s,x){return s+x},0);
  var ord=raw.map(function(x,i){return [x-Math.floor(x),i]}).sort(function(p,q){return q[0]-p[0]||p[1]-q[1]});
  for(var k=0;k<left;k++)fl[ord[k][1]]++;
  return fl;
}
function sanitizeColor(o){
  if(!o||typeof o!=='object')return null;
  var out={},any=false;
  function arr(x){return Array.isArray(x)?x.slice(0,24).map(function(s){return typeof s==='string'||typeof s==='number'?clean(s,40):(s&&typeof s==='object'?clean(s.name||s.hex||s.label||JSON.stringify(s),40):'')}).filter(Boolean):[]}
  ['host','guest','couple'].forEach(function(k){
    var v=o[k];if(!v||typeof v!=='object')return;
    var r={};
    Object.keys(v).slice(0,12).forEach(function(f){
      var x=v[f];if(Array.isArray(x)){var a=arr(x);if(a.length)r[clean(f,24)]=a}
      else if(typeof x==='string'||typeof x==='number'){var s=clean(x,160);if(s)r[clean(f,24)]=s}
    });
    if(Object.keys(r).length){out[k]=r;any=true}
  });
  return any?out:null;
}
function sanitizePlan(o){
  var p=defaultPlan();if(!o||typeof o!=='object')return p;
  p.updated=Math.max(0,Math.floor(num(o.updated)));
  p.date=typeof o.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(o.date)?o.date:'';
  var od=o.decks&&typeof o.decks==='object'?o.decks:{};
  DECKS.forEach(function(d){
    var s=od[d.id];if(!s||typeof s!=='object')return;
    var t=p.decks[d.id];
    (Array.isArray(s.custom)?s.custom:[]).slice(0,60).forEach(function(c){
      if(!c||!/^c\d{1,4}$/.test(c.id)||t.custom.some(function(x){return x.id===c.id}))return;
      var tt=clean(c.t,80);if(!tt)return;
      t.custom.push({id:c.id,e:clean(c.e,8)||'💡',t:tt,d:clean(c.d,140),by:isRole(c.by)?c.by:'host'});
    });
    var res=s.res&&typeof s.res==='object'?s.res:{};
    Object.keys(res).forEach(function(k){if(cardOf(p,d.id,k)&&/^[bwx]$/.test(res[k]))t.res[k]=res[k]});
    var st=s.star&&typeof s.star==='object'?s.star:{};
    Object.keys(st).forEach(function(k){if(cardOf(p,d.id,k))t.star[k]=clean(st[k],200)});
  });
  var sh=o.shabad||{};
  ['host','guest'].forEach(function(r){
    var v=sh.vote&&sh.vote[r];p.shabad.vote[r]=/^[ymn]$/.test(v)?v:'';
    var a=sh.short&&Array.isArray(sh.short[r])?sh.short[r]:[];
    a.forEach(function(id){if(SHB[id]&&p.shabad.short[r].indexOf(id)<0)p.shabad.short[r].push(id)});
  });
  p.shabad.pick=SHB[sh.pick]?sh.pick:'';
  (Array.isArray(o.gifts)?o.gifts:[]).slice(0,100).forEach(function(g){
    if(!g||typeof g!=='object')return;var w=clean(g.what,100),who=clean(g.who,60);if(!w&&!who)return;
    p.gifts.push({id:clean(g.id,16)||('g'+p.gifts.length),who:who,what:w,budget:clean(g.budget,20),done:!!g.done});
  });
  if(o.budget&&typeof o.budget==='object'){
    var h=validAlloc(o.budget.host),gu=validAlloc(o.budget.guest);
    if(h&&gu)p.budget={host:h,guest:gu,avg:compromise(h,gu)};
  }
  p.budTotal=clean(o.budTotal,20);
  var tl=o.tl&&typeof o.tl==='object'?o.tl:{};
  EVENTS.forEach(function(e){
    var x=tl[e.id];if(!x||typeof x!=='object')return;
    var y={d:/^[ymn]$/.test(x.d)?x.d:'',date:typeof x.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x.date)?x.date:'',own:/^(host|guest|both|family)$/.test(x.own)?x.own:'',notes:clean(x.notes,200),done:!!x.done};
    if(y.d||y.date||y.own||y.notes||y.done)p.tl[e.id]=y;
  });
  (Array.isArray(o.ckCustom)?o.ckCustom:[]).slice(0,60).forEach(function(c){
    if(c&&/^x\d{1,4}$/.test(c.id)&&!p.ckCustom.some(function(z){return z.id===c.id})){var t=clean(c.t,80);if(t)p.ckCustom.push({id:c.id,t:t})}
  });
  var ck=o.ck&&typeof o.ck==='object'?o.ck:{};
  Object.keys(ck).forEach(function(k){
    if(!CKB[k]&&!p.ckCustom.some(function(c){return c.id===k}))return;
    var x=ck[k]||{};var y={own:/^(host|guest|both|family)$/.test(x.own)?x.own:'',done:!!x.done};
    if(y.own||y.done)p.ck[k]=y;
  });
  p.color=sanitizeColor(o.color);
  p.spk={rounds:Math.max(0,Math.floor(num(o.spk&&o.spk.rounds)))};
  return p;
}
function deckOrder(id){var d=DK[id];return shufR(d.cards.map(function(c){return c.id}),rngF(hashStr('wp-'+id)))}
function deckCards(plan,id){return deckOrder(id).concat(plan.decks[id].custom.map(function(c){return c.id}))}
function nextBatch(plan,id,n){
  var res=plan.decks[id].res,out=[];
  plan.decks[id].custom.forEach(function(c){if(!res[c.id]&&out.length<n)out.push(c.id)});
  deckOrder(id).forEach(function(c){if(!res[c]&&out.length<n)out.push(c)});
  return out;
}
function overlaps(cards,a,b){
  var both=[],worth=[];
  for(var i=0;i<cards.length;i++){
    var x=a.charAt(i),y=b.charAt(i);
    if((x!=='y'&&x!=='m')||(y!=='y'&&y!=='m'))continue;
    if(x==='y'&&y==='y')both.push(cards[i]);else worth.push(cards[i]);
  }
  return {both:both,worth:worth};
}
function deckProg(plan,id){var all=deckCards(plan,id),r=plan.decks[id].res,n=0;all.forEach(function(c){if(r[c])n++});return all.length?n/all.length:0}
function progress(plan){
  var P={};
  P.decks=IDEA_DECKS.reduce(function(s,id){return s+deckProg(plan,id)},0)/IDEA_DECKS.length;
  var g=plan.gifts,gp=g.length?.5+.5*g.filter(function(x){return x.done}).length/g.length:0;
  P.thanks=(deckProg(plan,'thanks')+gp)/2;
  var v=plan.shabad.vote,sp=0;
  if(v.host&&v.guest){sp=.34;if(v.host==='n'&&v.guest==='n')sp=1;else{if(plan.shabad.short.host.length||plan.shabad.short.guest.length)sp=.67;if(plan.shabad.pick)sp=1}}
  P.shabad=sp;
  P.budget=plan.budget?1:0;
  var dec=0,yes=0,dn=0;EVENTS.forEach(function(e){var x=plan.tl[e.id];if(x&&x.d){dec++;if(x.d!=='n'){yes++;if(x.done)dn++}}});
  var cks=CHECK.map(function(c){return c.id}).concat(plan.ckCustom.map(function(c){return c.id})),ckd=cks.filter(function(k){return plan.ck[k]&&plan.ck[k].done}).length;
  P.timeline=.4*dec/EVENTS.length+.3*(yes?dn/yes:0)+.3*ckd/cks.length;
  P.colors=plan.color?1:0;
  P.sparkle=Math.min(1,plan.spk.rounds/2);
  var ks=SECTIONS.map(function(s){return s.id});
  P.total=ks.reduce(function(s,k){return s+P[k]},0)/ks.length;
  return P;
}
function nextUp(plan){
  var c=EVENTS.filter(function(e){var x=plan.tl[e.id];return x&&(x.d==='y'||x.d==='m')&&!x.done});
  var dated=c.filter(function(e){return plan.tl[e.id].date}).sort(function(a,b){return plan.tl[a.id].date<plan.tl[b.id].date?-1:1});
  if(dated.length)return dated[0];
  if(c.length)return c[0];
  return EVENTS.filter(function(e){return !plan.tl[e.id]||!plan.tl[e.id].d})[0]||null;
}
function daysTo(date,now){if(!date)return null;var t=Date.parse(date+'T00:00:00');if(!isFinite(t))return null;var d=new Date(now||Date.now());d.setHours(0,0,0,0);return Math.round((t-d.getTime())/86400000)}
function budgetTalk(b,nm){
  if(!b)return [];
  var a=b.host,c=b.guest,out=[];
  var ta=a.indexOf(Math.max.apply(null,a)),tc=c.indexOf(Math.max.apply(null,c));
  if(ta===tc)out.push('You both put '+BUD[ta].t+' first. Power couple, same priorities! '+BUD[ta].e);
  else out.push(nm('host')+' is all about '+BUD[ta].t+' '+BUD[ta].e+', while '+nm('guest')+' is dreaming of '+BUD[tc].t+' '+BUD[tc].e+'.');
  var gi=0,gv=-1,agree=0;a.forEach(function(x,i){var d=Math.abs(x-c[i]);if(d>gv){gv=d;gi=i}if(d<=3)agree++});
  if(gv>=8)out.push('Biggest debate: '+BUD[gi].t+' ('+a[gi]+' vs '+c[gi]+' coins). Chai and a chat needed \u2615');
  out.push('You agreed (within 3 coins) on '+agree+' of '+BUD.length+' categories'+(agree>=7?'. Basically telepathic! 🔮':agree>=4?'. Nice teamwork! 🤝':'. Opposites attract, right? 😄'));
  if(a[6]>=15&&c[6]>=15)out.push('The honeymoon is clearly sacred to you both 🏝️');
  if(a[1]>=15&&c[1]>=15)out.push('Food first: a true Punjabi wedding 🍛');
  if(a[7]+c[7]>=40)out.push('Somebody is thinking about sparkle\u2026 💎');
  return out;
}

/* ---- ranking: Elo (sequential) and Bradley-Terry (MM with a light prior) ---- */
/* multi-pass Elo with a decaying K: far less sensitive to the order of the match-ups than a single pass */
function elo(matches,K,passes){
  K=K||32;passes=passes||12;var R={};
  for(var p=0;p<passes;p++){
    var k=K/(1+p*.5);
    matches.forEach(function(m){var w=m[0],l=m[1];if(!(w in R))R[w]=1000;if(!(l in R))R[l]=1000;var ew=1/(1+Math.pow(10,(R[l]-R[w])/400));R[w]+=k*(1-ew);R[l]-=k*(1-ew)});
  }
  return R;
}
function bt(matches,iters){
  iters=iters||200;var keys=[],W={},N={},p={};
  matches.forEach(function(m){m.forEach(function(k){if(!(k in p)){p[k]=1;W[k]=.5;N[k]={};keys.push(k)}})});
  matches.forEach(function(m){W[m[0]]+=1;N[m[0]][m[1]]=(N[m[0]][m[1]]||0)+1;N[m[1]][m[0]]=(N[m[1]][m[0]]||0)+1});
  for(var it=0;it<iters;it++){
    var np={},lg=0;
    keys.forEach(function(i){var den=1/(p[i]+1);for(var j in N[i])den+=N[i][j]/(p[i]+p[j]);np[i]=W[i]/den});
    keys.forEach(function(i){lg+=Math.log(np[i])});var gm=Math.exp(lg/(keys.length||1));
    keys.forEach(function(i){p[i]=np[i]/gm});
  }
  return p;
}
function ranking(matches){
  var b=bt(matches),e=elo(matches),st={};
  matches.forEach(function(m){(st[m[0]]=st[m[0]]||{w:0,l:0}).w++;(st[m[1]]=st[m[1]]||{w:0,l:0}).l++});
  return Object.keys(b).map(function(k){return {k:k,bt:b[k],elo:Math.round(e[k]),w:st[k].w,l:st[k].l}}).sort(function(x,y){return y.bt-x.bt||y.elo-x.elo||(x.k<y.k?-1:1)});
}

/* ---- Sparkle Showdown rounds ---- */
function gemK(g){return g.ph?'p:'+g.ph:'g:'+g.c+':'+g.u}
function spkItems(r,seed,photos){
  var R=rngF(((seed|0)*31+r*977+5)|0),sh=function(a){return shufR(a,R)};
  var ci=sh(GEMS.map(function(_,i){return i})),pairs=[],np=photos.length;
  var nP=np>=2?4:np===1?2:0,ph=sh(photos);
  var rc=function(){return Math.floor(R()*GEMS.length)},ru=function(){return Math.floor(R()*CUTS.length)};
  for(var k=0;k<nP;k++){
    var a={ph:ph[(2*k)%np]},b;
    if(np>=2&&k%2===0){b={ph:ph[(2*k+1)%np]};if(b.ph===a.ph)b={c:rc(),u:ru()}}else b={c:rc(),u:ru()};
    pairs.push([a,b]);
  }
  var off=(r*6)%GEMS.length,nc=nP?5:7;
  for(k=0;k<nc;k++){var u=ru();pairs.push([{c:ci[(off+2*k)%GEMS.length],u:u},{c:ci[(off+2*k+1)%GEMS.length],u:u}])}
  for(k=0;k<(nP?2:3);k++){var c=rc(),cu=sh(CUTS.map(function(_,i){return i}));pairs.push([{c:c,u:cu[0]},{c:c,u:cu[1]}])}
  for(k=0;k<(nP?1:2);k++){var c1=rc(),c2=(c1+1+Math.floor(R()*(GEMS.length-1)))%GEMS.length,u1=ru(),u2=(u1+1+Math.floor(R()*(CUTS.length-1)))%CUTS.length;pairs.push([{c:c1,u:u1},{c:c2,u:u2}])}
  pairs=sh(pairs).map(function(p){return R()<.5?{t:'p',a:p[0],b:p[1]}:{t:'p',a:p[1],b:p[0]}});
  var items=[],qs=[0,1,2,3].map(function(k){return (r*4+k)%SPQ.length}),qi=0;
  pairs.forEach(function(p,i){items.push(p);if((i===2||i===5||i===8||i===10)&&qi<4)items.push({t:'q',q:qs[qi++]})});
  while(qi<4)items.push({t:'q',q:qs[qi++]});
  return items;
}
function validSpk(item,v){
  if(!item)return false;
  if(item.t==='p')return v===0||v===1;
  var q=SPQ[item.q];if(!q)return false;
  if(q.o)return v===(v|0)&&v>=0&&v<q.o.length;
  return v===(v|0)&&v>=0&&v<=100;
}
function collect(items,ans){
  var out={col:[],cut:[],all:[],q:[],ms:[]};
  (ans||[]).forEach(function(a,i){
    var it=items[i];if(!it||!a)return;
    if(it.t==='q'){out.q.push({q:it.q,v:a.v,ms:a.ms});return}
    var W=a.v===0?it.a:it.b,L=a.v===0?it.b:it.a;
    out.ms.push({w:gemK(W),l:gemK(L),ms:a.ms});
    if(W.ph||L.ph){out.all.push([W.ph?'p:'+W.ph:'c:'+GEMS[W.c].id,L.ph?'p:'+L.ph:'c:'+GEMS[L.c].id]);return}
    if(W.c!==L.c){out.col.push([GEMS[W.c].id,GEMS[L.c].id]);out.all.push(['c:'+GEMS[W.c].id,'c:'+GEMS[L.c].id])}
    if(W.u!==L.u)out.cut.push([CUTS[W.u].id,CUTS[L.u].id]);
  });
  return out;
}
function mergeCol(list){var o={col:[],cut:[],all:[],q:[],ms:[]};list.forEach(function(c){['col','cut','all','q','ms'].forEach(function(k){o[k]=o[k].concat(c[k])})});return o}
function styleText(c){
  var parts=[],rc=ranking(c.col),ru=ranking(c.cut),qa={};
  c.q.forEach(function(x){qa[SPQ[x.q].id]=x.v});
  var gn=function(id){for(var i=0;i<GEMS.length;i++)if(GEMS[i].id===id)return GEMS[i].n;return id};
  if(rc.length)parts.push(gn(rc[0].k)+(rc[1]?' & '+gn(rc[1].k):'')+' lover');
  if(ru.length){var cu=CUTS.filter(function(x){return x.id===ru[0].k})[0];parts.push((cu?cu.n:ru[0].k)+' shapes')}
  if('metal' in qa)parts.push(['Yellow-gold glow','Rose-gold romance','Cool platinum shine','Mixed-metal magic'][qa.metal]);
  if('bold' in qa)parts.push(qa.bold<40?'Delicate & dainty':qa.bold>60?'Big & bold':'Perfectly balanced');
  if('era' in qa)parts.push(qa.era<40?'Vintage soul':qa.era>60?'Modern minimalist':'Timeless');
  return parts.length?parts.join(' \u00b7 '):'Still discovering your sparkle';
}

/* ---- export ---- */
function planText(plan,names){
  var nm=function(r){return r==='both'?'Both':r==='family'?'Family':((names&&names[r])||r)};
  var o=[],P=progress(plan);
  o.push('OUR WEDDING PLAN');o.push(nm('host')+' & '+nm('guest'));
  if(plan.date)o.push('Wedding date: '+plan.date);
  o.push('Overall progress: '+Math.round(P.total*100)+'%');o.push('Exported '+new Date().toDateString());o.push('');
  DECKS.forEach(function(d){
    var dd=plan.decks[d.id],st=Object.keys(dd.star),both=Object.keys(dd.res).filter(function(k){return dd.res[k]==='b'&&!(k in dd.star)}),worth=Object.keys(dd.res).filter(function(k){return dd.res[k]==='w'&&!(k in dd.star)});
    if(!st.length&&!both.length&&!worth.length)return;
    o.push('== '+d.name.toUpperCase()+' ==');
    st.forEach(function(k){var c=cardOf(plan,d.id,k);if(c)o.push('  * '+c.t+(dd.star[k]?'  ('+dd.star[k]+')':''))});
    if(both.length)o.push('  Both loved: '+both.map(function(k){var c=cardOf(plan,d.id,k);return c?c.t:k}).join('; '));
    if(worth.length)o.push('  Worth discussing: '+worth.map(function(k){var c=cardOf(plan,d.id,k);return c?c.t:k}).join('; '));
    o.push('');
  });
  var sv=plan.shabad;
  o.push('== SHABAD ==');
  if(!sv.vote.host||!sv.vote.guest)o.push('  Not decided yet');
  else if(sv.vote.host==='n'&&sv.vote.guest==='n')o.push('  We decided not to sing one together');
  else{
    if(sv.pick)o.push('  Our pick: '+SHB[sv.pick].t);
    var sl=uniq(sv.short.host.concat(sv.short.guest));if(sl.length)o.push('  Shortlist: '+sl.map(function(id){return SHB[id].t}).join('; '));
    o.push('  (Confirm choice and meaning with our Granthi Singh / raagi jatha)');
  }
  o.push('');
  if(plan.gifts.length){o.push('== THANK-YOU GIFTS ==');plan.gifts.forEach(function(g){o.push('  ['+(g.done?'x':' ')+'] '+g.who+': '+g.what+(g.budget?' ('+g.budget+')':''))});o.push('')}
  if(plan.budget){
    o.push('== BUDGET (coins out of 100: '+nm('host')+' / '+nm('guest')+' / compromise) ==');
    BUD.forEach(function(c,i){o.push('  '+c.t+': '+plan.budget.host[i]+' / '+plan.budget.guest[i]+' / '+plan.budget.avg[i]+(plan.budTotal&&num(plan.budTotal.replace(/[^\d.]/g,''))?'  (~'+Math.round(num(plan.budTotal.replace(/[^\d.]/g,''))*plan.budget.avg[i]/100)+')':''))});
    o.push('');
  }
  var ev=EVENTS.filter(function(e){return plan.tl[e.id]});
  if(ev.length){
    o.push('== TIMELINE ==');
    ev.forEach(function(e){var x=plan.tl[e.id];o.push('  ['+(x.done?'x':' ')+'] '+e.t+' - '+({y:'Yes',m:'Maybe',n:'No','':'?'}[x.d])+(x.date?' - '+x.date:'')+(x.own?' - '+nm(x.own):'')+(x.notes?' - '+x.notes:''))});
    o.push('');
  }
  o.push('== CHECKLIST ==');
  CHECK.concat(plan.ckCustom).forEach(function(c){var x=plan.ck[c.id]||{};o.push('  ['+(x.done?'x':' ')+'] '+c.t+(x.own?' ('+nm(x.own)+')':''))});
  o.push('');
  if(plan.color){
    o.push('== OUTFIT COLOURS (Couple Color Lab) ==');
    ['host','guest','couple'].forEach(function(k){var v=plan.color[k];if(!v)return;o.push('  '+(k==='couple'?'Together':nm(k))+':');Object.keys(v).forEach(function(f){o.push('    '+f+': '+(Array.isArray(v[f])?v[f].join(', '):v[f]))})});
    o.push('');
  }
  o.push('Sparkle Showdown rounds played: '+plan.spk.rounds);
  return o.join('\n');
}
function uniq(a){var o=[];a.forEach(function(x){if(o.indexOf(x)<0)o.push(x)});return o}

/* =====================================================================================
   HOST CORE
   ===================================================================================== */
var SCREENS=['board','decks','deck','shabad','thanks','budget','timeline','colors','sparkle','summary'];
function makeCore(seed,plan0,rngf){
  rngf=rngf||rngF;
  var R=rngf(((seed|0)+4242)|0);
  var S={q:0,at:'board',over:false,fx:0,plan:sanitizePlan(plan0),deck:null,bn:0,svote:{host:'',guest:''},br:null,
    bud:{open:false,lock:{host:null,guest:null}},spk:null,spkR:0,spkHist:[],styles:{host:'',guest:''},last:{host:0,guest:0},seen:{}};
  S.bud.open=!S.plan.budget;
  function touch(){S.plan.updated=Date.now()}
  function newBatch(id){
    var cards=nextBatch(S.plan,id,BATCH);
    S.deck={id:id,b:++S.bn,cards:cards,ans:{host:'',guest:''},ph:cards.length?'swipe':'complete',rev:null,ready:{host:false,guest:false}};
  }
  function ensureDeck(id){if(!S.deck||S.deck.id!==id||(S.deck.ph==='complete'&&nextBatch(S.plan,id,1).length))newBatch(id)}
  function brAdvance(){
    var b=S.br;
    for(var guard=0;guard<64;guard++){
      if(b.i>=b.list.length){
        if(b.next.length===1){S.plan.shabad.pick=b.next[0];b.champ=b.next[0];touch();S.fx++;return}
        b.list=b.next;b.next=[];b.i=0;b.round++;continue;
      }
      if(b.i+1>=b.list.length){b.next.push(b.list[b.i]);b.i+=2;continue}
      return;
    }
  }
  function brStart(){
    var sh=S.plan.shabad,cnt={};
    sh.short.host.concat(sh.short.guest).forEach(function(id){cnt[id]=(cnt[id]||0)+1});
    var list=SHABADS.map(function(s){return s.id}).filter(function(id){return cnt[id]}).sort(function(a,b){return cnt[b]-cnt[a]}).slice(0,8);
    if(list.length<2)return false;
    S.br={list:list,i:0,next:[],round:1,v:{host:'',guest:''},talk:false,m:0,champ:'',coin:''};
    return true;
  }
  function spkStartRound(){
    var phs=S.spk.photos.map(function(p){return p.id});
    S.spk.items=spkItems(S.spk.r,seed,phs);S.spk.ans={host:[],guest:[]};S.spk.ph='play';
  }
  function surprise(){
    var P=progress(S.plan),opts=SECTIONS.filter(function(s){return P[s.id]<1}).map(function(s){return s.id});
    if(!opts.length)opts=SECTIONS.map(function(s){return s.id});
    var pick=opts[Math.floor(R()*opts.length)];
    if(pick==='decks'){
      var ds=IDEA_DECKS.filter(function(id){return nextBatch(S.plan,id,1).length});
      if(ds.length){var d=ds[Math.floor(R()*ds.length)];ensureDeck(d);S.at='deck';return}
    }
    S.at=pick;
  }
  function apply(role,a){
    if(!isRole(role)||!a||typeof a!=='object'||S.over)return false;
    if(typeof a.n==='number'){if(a.n<=S.last[role])return false;S.last[role]=a.n}
    var k=a.a,o=oth(role),pl=S.plan,i,d;
    switch(k){
    case 'go':
      if(SCREENS.indexOf(a.to)<0)return false;
      if(a.to==='deck'){if(!DK[a.d])return false;ensureDeck(a.d)}
      if(a.to==='sparkle'&&!S.spk){S.spk={r:++S.spkR,ph:'intro',ready:{host:false,guest:false},items:[],ans:{host:[],guest:[]},photos:[]}}
      if(a.to==='budget'&&!pl.budget)S.bud.open=true;
      S.at=a.to;return true;
    case 'surprise':surprise();return true;
    case 'date':var dt=String(a.v||'');if(dt&&!/^\d{4}-\d{2}-\d{2}$/.test(dt))return false;pl.date=dt;touch();return true;
    /* --- decks --- */
    case 'sw':
      d=S.deck;if(!d||d.ph!=='swipe'||a.b!==d.b||!/^[ymn]$/.test(a.v))return false;
      if((a.i|0)!==d.ans[role].length||d.ans[role].length>=d.cards.length)return false;
      d.ans[role]+=a.v;
      if(d.ans.host.length===d.cards.length&&d.ans.guest.length===d.cards.length){
        d.rev=overlaps(d.cards,d.ans.host,d.ans.guest);
        var dr=pl.decks[d.id].res;
        d.cards.forEach(function(c){dr[c]=d.rev.both.indexOf(c)>=0?'b':d.rev.worth.indexOf(c)>=0?'w':'x'});
        d.ans={host:'',guest:''};d.ph='reveal';touch();if(d.rev.both.length)S.fx++;
      }
      return true;
    case 'undo':
      d=S.deck;if(!d||d.ph!=='swipe'||a.b!==d.b||!d.ans[role].length)return false;
      d.ans[role]=d.ans[role].slice(0,-1);return true;
    case 'next':
      d=S.deck;if(!d||d.ph!=='reveal'||a.b!==d.b||d.ready[role])return false;
      d.ready[role]=true;if(d.ready.host&&d.ready.guest)newBatch(d.id);return true;
    case 'star':
      if(!DK[a.d]||!cardOf(pl,a.d,a.c))return false;
      var dk=pl.decks[a.d];if(!/^[bw]$/.test(dk.res[a.c]||''))return false;
      if(a.on){if(a.c in dk.star)return false;dk.star[a.c]='';S.fx++}else{if(!(a.c in dk.star))return false;delete dk.star[a.c]}
      touch();return true;
    case 'note':
      if(!DK[a.d]||!cardOf(pl,a.d,a.c))return false;
      dk=pl.decks[a.d];if(!/^[bw]$/.test(dk.res[a.c]||''))return false;
      if(!(a.c in dk.star))S.fx++;
      dk.star[a.c]=clean(a.t,200);touch();return true;
    case 'custom':
      if(!DK[a.d])return false;dk=pl.decks[a.d];if(dk.custom.length>=60)return false;
      var tt=clean(a.t,80);if(!tt)return false;
      var cid='c'+(dk.custom.reduce(function(m,c){return Math.max(m,+c.id.slice(1))},0)+1);
      dk.custom.push({id:cid,e:clean(a.e,8)||'💡',t:tt,d:clean(a.desc,140),by:role});touch();
      if(S.deck&&S.deck.id===a.d&&S.deck.ph==='complete')newBatch(a.d);
      return true;
    /* --- shabad --- */
    case 'svote':
      if(!/^[ymn]$/.test(a.v)||(pl.shabad.vote.host&&pl.shabad.vote.guest)||S.svote[role])return false;
      S.svote[role]=a.v;
      if(S.svote.host&&S.svote.guest){pl.shabad.vote={host:S.svote.host,guest:S.svote.guest};S.svote={host:'',guest:''};touch()}
      return true;
    case 'sreset':
      pl.shabad.vote={host:'',guest:''};S.svote={host:'',guest:''};S.br=null;touch();return true;
    case 'short':
      if(!SHB[a.id])return false;var arr=pl.shabad.short[role],ix=arr.indexOf(a.id);
      if(a.on){if(ix>=0)return false;arr.push(a.id)}else{if(ix<0)return false;arr.splice(ix,1)}
      touch();return true;
    case 'brStart':if(S.br&&!S.br.champ)return false;return brStart();
    case 'brStop':if(!S.br)return false;S.br=null;return true;
    case 'bv':
      var b=S.br;if(!b||b.champ||a.m!==b.m||(a.v!=='a'&&a.v!=='b')||b.v[role]||b.talk)return false;
      b.v[role]=a.v;
      if(b.v.host&&b.v.guest){
        if(b.v.host===b.v.guest){b.next.push(b.list[b.i+(b.v.host==='a'?0:1)]);b.i+=2;b.m++;b.v={host:'',guest:''};b.coin='';brAdvance()}
        else b.talk=true;
      }
      return true;
    case 'brevote':b=S.br;if(!b||!b.talk)return false;b.talk=false;b.v={host:'',guest:''};return true;
    case 'bcoin':
      b=S.br;if(!b||!b.talk)return false;
      var w=R()<.5?0:1;b.coin=b.list[b.i+w];b.next.push(b.coin);b.i+=2;b.m++;b.v={host:'',guest:''};b.talk=false;brAdvance();return true;
    case 'pick':if(!SHB[a.id])return false;pl.shabad.pick=a.id;touch();S.fx++;return true;
    case 'unpick':if(!pl.shabad.pick)return false;pl.shabad.pick='';if(S.br)S.br=null;touch();return true;
    /* --- gifts --- */
    case 'gift':
      if(a.op==='add'){
        var gw=clean(a.what,100),gwho=clean(a.who,60);if((!gw&&!gwho)||pl.gifts.length>=100)return false;
        pl.gifts.push({id:'g'+Date.now().toString(36)+Math.floor(R()*1e4).toString(36),who:gwho,what:gw,budget:clean(a.budget,20),done:false});touch();return true;
      }
      for(i=0;i<pl.gifts.length;i++)if(pl.gifts[i].id===a.id){
        if(a.op==='done'){pl.gifts[i].done=!pl.gifts[i].done;if(pl.gifts[i].done)S.fx++}
        else if(a.op==='del')pl.gifts.splice(i,1);else return false;
        touch();return true;
      }
      return false;
    /* --- budget --- */
    case 'bud':
      var al=validAlloc(a.alloc);if(!al||!S.bud.open||S.bud.lock[role])return false;
      S.bud.lock[role]=al;
      if(S.bud.lock.host&&S.bud.lock.guest){pl.budget={host:S.bud.lock.host,guest:S.bud.lock.guest,avg:compromise(S.bud.lock.host,S.bud.lock.guest)};S.bud={open:false,lock:{host:null,guest:null}};touch();S.fx++}
      return true;
    case 'budUnlock':if(!S.bud.open||!S.bud.lock[role])return false;S.bud.lock[role]=null;return true;
    case 'budRedo':if(S.bud.open)return false;S.bud={open:true,lock:{host:null,guest:null}};return true;
    case 'budCancel':if(!S.bud.open||!pl.budget)return false;S.bud={open:false,lock:{host:null,guest:null}};return true;
    case 'budTotal':pl.budTotal=clean(a.v,20);touch();return true;
    /* --- timeline & checklist --- */
    case 'tl':
      if(!EVB[a.id])return false;var x=pl.tl[a.id]||{d:'',date:'',own:'',notes:'',done:false},v=a.v;
      if(a.f==='d'){if(!/^[ymn]?$/.test(v))return false;x.d=x.d===v?'':v}
      else if(a.f==='date'){v=String(v||'');if(v&&!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;x.date=v}
      else if(a.f==='own'){if(!/^(host|guest|both|family)?$/.test(v))return false;x.own=v}
      else if(a.f==='notes')x.notes=clean(v,200);
      else if(a.f==='done'){x.done=!x.done;if(x.done){S.fx++;if(!x.d)x.d='y'}}
      else return false;
      pl.tl[a.id]=x;touch();return true;
    case 'ck':
      if(!CKB[a.id]&&!pl.ckCustom.some(function(c){return c.id===a.id}))return false;
      var y=pl.ck[a.id]||{own:'',done:false};
      if(a.f==='own'){if(!/^(host|guest|both|family)?$/.test(a.v))return false;y.own=a.v}
      else if(a.f==='done'){y.done=!y.done;if(y.done)S.fx++}else return false;
      pl.ck[a.id]=y;touch();return true;
    case 'ckAdd':
      var ct=clean(a.t,80);if(!ct||pl.ckCustom.length>=60)return false;
      pl.ckCustom.push({id:'x'+(pl.ckCustom.reduce(function(m,c){return Math.max(m,+c.id.slice(1))},0)+1),t:ct});touch();return true;
    case 'ckDel':
      for(i=0;i<pl.ckCustom.length;i++)if(pl.ckCustom[i].id===a.id){pl.ckCustom.splice(i,1);delete pl.ck[a.id];touch();return true}
      return false;
    /* --- colours --- */
    case 'color':var cd=sanitizeColor(a.data);if(!cd)return false;pl.color=cd;touch();return true;
    /* --- sparkle --- */
    case 'spkReady':
      var sp=S.spk;if(!sp||sp.ph!=='intro'||sp.ready[role])return false;
      (Array.isArray(a.photos)?a.photos:[]).slice(0,MAX_PICS).forEach(function(pid){
        pid=clean(pid,24);if(pid&&!sp.photos.some(function(p){return p.id===pid}))sp.photos.push({id:pid});
      });
      sp.ready[role]=true;if(sp.ready.host&&sp.ready.guest)spkStartRound();return true;
    case 'spkAns':
      sp=S.spk;if(!sp||sp.ph!=='play'||a.r!==sp.r)return false;
      var mine=sp.ans[role];if((a.i|0)!==mine.length||mine.length>=sp.items.length||!validSpk(sp.items[mine.length],a.v))return false;
      mine.push({v:a.v,ms:Math.max(0,Math.min(600000,Math.round(num(a.ms))))});
      if(sp.ans.host.length===sp.items.length&&sp.ans.guest.length===sp.items.length){
        sp.ph='done';pl.spk.rounds++;touch();S.fx++;
        ['host','guest'].forEach(function(rr){S.styles[rr]=styleText(collect(sp.items,sp.ans[rr]))});
      }
      return true;
    case 'spkAgain':
      sp=S.spk;if(!sp||sp.ph!=='done')return false;
      S.spkHist.push(sp);if(S.spkHist.length>8)S.spkHist.shift();
      S.spk={r:++S.spkR,ph:'intro',ready:{host:false,guest:false},items:[],ans:{host:[],guest:[]},photos:[]};return true;
    /* --- misc --- */
    case 'import':
      if(!a.plan||typeof a.plan!=='object')return false;
      S.plan=sanitizePlan(a.plan);S.plan.updated=Date.now();S.deck=null;S.br=null;S.svote={host:'',guest:''};S.bud={open:!S.plan.budget,lock:{host:null,guest:null}};S.at='board';return true;
    case 'bye':S.over=true;S.by=role;return true;
    }
    return false;
  }
  function view(role){
    var o=oth(role),v={q:S.q,at:S.at,over:S.over,by:S.by||'',fx:S.fx,plan:S.plan,style:S.styles[role]};
    if(S.deck){var d=S.deck;v.deck={id:d.id,b:d.b,cards:d.cards,ph:d.ph,rev:d.rev,ready:d.ready,n:{host:d.ans.host.length,guest:d.ans.guest.length},mine:d.ans[role]}}
    v.svote={mine:S.svote[role],other:S.svote[o]?'?':''};
    if(S.br){var b=S.br,vv={};vv[role]=b.v[role];vv[o]=b.talk?b.v[o]:(b.v[o]?'?':'');v.br={list:b.list,i:b.i,next:b.next,round:b.round,v:vv,talk:b.talk,m:b.m,champ:b.champ,coin:b.coin}}
    v.bud={open:S.bud.open,lock:{host:!!S.bud.lock.host,guest:!!S.bud.lock.guest},mine:S.bud.lock[role]};
    v.spk=S.spk;v.spkHist=S.spkHist;
    return JSON.parse(JSON.stringify(v));
  }
  return {S:S,apply:apply,view:view};
}

/* =====================================================================================
   GEM ART (faceted SVG)
   ===================================================================================== */
function hexRgb(h){h=h.replace('#','');return [parseInt(h.substr(0,2),16),parseInt(h.substr(2,2),16),parseInt(h.substr(4,2),16)]}
function mix(h,t,amt){var a=hexRgb(h),b=t==='w'?[255,255,255]:[0,0,0];return 'rgb('+a.map(function(x,i){return Math.round(x+(b[i]-x)*amt)}).join(',')+')'}
function shade(h,s){return s>=0?mix(h,'w',Math.min(.85,s)):mix(h,'k',Math.min(.8,-s))}
function outline(cut){
  var P=[],i,t,N=16;
  if(cut==='round'||cut==='oval'||cut==='cushion'){
    var rx=cut==='oval'?31:40,ry=cut==='oval'?43:40;
    for(i=0;i<N;i++){t=i/N*Math.PI*2-Math.PI/2;var c=Math.cos(t),s=Math.sin(t),k=1;
      if(cut==='cushion'){var n=3.2;k=Math.pow(Math.pow(Math.abs(c),n)+Math.pow(Math.abs(s),n),-1/n)*.93}
      P.push([50+rx*c*k,50+ry*s*k])}
  }else if(cut==='pear'){
    for(i=0;i<N;i++){t=i/N*Math.PI*2;P.push([50+44*Math.sin(t)*Math.pow(Math.sin(t/2),1.2),46-42*Math.cos(t)+(Math.cos(t)<0?4*-Math.cos(t):0)])}
  }else{
    var w=cut==='emerald'?30:33,h=cut==='emerald'?42:41,cc=cut==='emerald'?10:7;
    var o=[[-w+cc,-h],[w-cc,-h],[w,-h+cc],[w,h-cc],[w-cc,h],[-w+cc,h],[-w,h-cc],[-w,-h+cc]];
    if(cut==='emerald')return o.map(function(p){return [50+p[0],50+p[1]]});
    o.forEach(function(p,j){var q=o[(j+1)%8];P.push([50+p[0],50+p[1]]);P.push([50+(p[0]+q[0])/2,50+(p[1]+q[1])/2])});
  }
  return P;
}
var gemUid=0;
function gemSVG(hex,cut){
  var id='wpg'+(++gemUid),P=outline(cut),N=P.length,cx=50,cy=50;
  var sx=0,sy=0;P.forEach(function(p){sx+=p[0];sy+=p[1]});cx=sx/N;cy=sy/N;
  var sc=function(p,f){return [cx+(p[0]-cx)*f,cy+(p[1]-cy)*f]};
  var pt=function(a){return a.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1)}).join(' ')};
  var lit=function(p){var ang=Math.atan2(p[1]-cy,p[0]-cx);return Math.cos(ang+2.3)};
  var s=['<svg viewBox="0 0 100 100" class="wp-gemsvg" aria-hidden="true"><defs><radialGradient id="'+id+'t" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="'+shade(hex,.7)+'"/><stop offset=".45" stop-color="'+shade(hex,.15)+'"/><stop offset="1" stop-color="'+shade(hex,-.35)+'"/></radialGradient></defs>'];
  s.push('<polygon points="'+pt(P)+'" fill="'+shade(hex,-.45)+'" stroke="rgba(255,240,200,.55)" stroke-width="1.2"/>');
  var poly=function(a,f){s.push('<polygon points="'+pt(a)+'" fill="'+f+'" stroke="rgba(255,255,255,.22)" stroke-width=".5"/>')};
  var i;
  if(cut==='emerald'){
    var rings=[1,.8,.62,.45];
    for(var r=0;r<3;r++)for(i=0;i<N;i++){var j=(i+1)%N,m=[(P[i][0]+P[j][0])/2,(P[i][1]+P[j][1])/2],L=lit(m);
      poly([sc(P[i],rings[r]),sc(P[j],rings[r]),sc(P[j],rings[r+1]),sc(P[i],rings[r+1])],shade(hex,L*.45+(r%2?.12:-.12)))}
    s.push('<polygon points="'+pt(P.map(function(p){return sc(p,.45)}))+'" fill="url(#'+id+'t)" stroke="rgba(255,255,255,.3)" stroke-width=".5"/>');
  }else{
    var M=[],T=[];
    for(i=0;i<N;i++){var q=P[(i+1)%N];M.push(sc([(P[i][0]+q[0])/2,(P[i][1]+q[1])/2],.74));T.push(sc(P[i],.46))}
    for(i=0;i<N;i++){
      var j2=(i+1)%N,pm=(i+N-1)%N;
      poly([P[i],P[j2],M[i]],shade(hex,lit(M[i])*.5+(i%2?-.18:.05)));
      poly([M[pm],P[i],M[i],T[i]],shade(hex,lit(P[i])*.55+(i%2?.12:-.08)));
      poly([T[i],M[i],T[j2]],shade(hex,lit(M[i])*.35+.18));
    }
    s.push('<polygon points="'+pt(T)+'" fill="url(#'+id+'t)" stroke="rgba(255,255,255,.3)" stroke-width=".5"/>');
  }
  s.push('<path class="wp-tw" d="M32 28l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6z" fill="#fff"/><path class="wp-tw wp-tw2" d="M64 60l1 2.8 2.8 1-2.8 1-1 2.8-1-2.8-2.8-1 2.8-1z" fill="#fff"/></svg>');
  return s.join('');
}

/* =====================================================================================
   PRIVATE NOTES (device-local)
   ===================================================================================== */
function ls(k,v){try{if(v===undefined){var s=localStorage.getItem(k);return s?JSON.parse(s):null}if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return v===undefined?null:false}}
function h53(str,seed){var h1=0xdeadbeef^(seed||0),h2=0x41c6ce57^(seed||0);for(var i=0,ch;i<str.length;i++){ch=str.charCodeAt(i);h1=Math.imul(h1^ch,2654435761);h2=Math.imul(h2^ch,1597334677)}h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return (4294967296*(2097151&h2)+(h1>>>0)).toString(36)}
function pinHash(pin,salt){var h=pin;for(var i=0;i<500;i++)h=h53(salt+':'+h+':'+i,i);return h}

/* =====================================================================================
   STYLES
   ===================================================================================== */
var PAISLEY="<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'><g fill='none' stroke='#f7dd8c' stroke-opacity='.09' stroke-width='1.3'><path d='M26 62c-12 0-17-13-9-23 7-9 21-9 26-20 5 13 2 30-6 38-3 3-7 5-11 5z'/><path d='M27 55c-6 0-9-7-5-12 4-5 11-6 14-12 2 7 1 15-3 20-2 3-4 4-6 4z'/><circle cx='26' cy='50' r='2'/><path d='M74 88c-8 0-11-9-6-15 4-6 13-6 17-13 3 9 1 19-4 24-2 3-5 4-7 4z'/><circle cx='74' cy='80' r='1.6'/><path d='M70 18l3 6 6 3-6 3-3 6-3-6-6-3 6-3z'/></g></svg>";
var CSS=[
'.wp,.wp-vars{--m0:#2a0610;--m1:#4a0d1e;--m2:#6e1631;--g1:#c9973f;--g2:#f7dd8c;--mg:#ff9f1c;--rose:#e8547a;--ink:#fff6e6;--dim:#e2c6ad;--line:rgba(247,221,140,.22);color:var(--ink)}',
'.wp{position:relative;max-width:980px;margin:0 auto 30px;padding:14px 16px 28px;border-radius:28px;color:var(--ink);font-family:inherit;overflow:hidden;',
'background:url("data:image/svg+xml,'+PAISLEY.replace(/#/g,'%23').replace(/"/g,"'").replace(/</g,'%3C').replace(/>/g,'%3E')+'"),radial-gradient(700px 380px at 50% -8%,rgba(247,221,140,.18),transparent 65%),radial-gradient(600px 400px at 100% 100%,rgba(255,159,28,.12),transparent 60%),linear-gradient(165deg,#5c1027,#33081a 60%,#22050f);box-shadow:0 18px 50px rgba(0,0,0,.5),inset 0 0 0 1px rgba(247,221,140,.18)}',
'.wp *,.wp-vars *{box-sizing:border-box}',
'.wp button,.wp-vars button{font:inherit;cursor:pointer;border:0;transition:transform .12s,filter .12s,box-shadow .15s}',
'.wp button:hover:not(:disabled),.wp-vars button:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.08)}.wp button:active:not(:disabled){transform:scale(.97)}.wp button:disabled,.wp-vars button:disabled{opacity:.4;cursor:default}',
'.wp-b{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:11px 18px;border-radius:14px;font-weight:700;color:#3a1406;background:linear-gradient(135deg,#fbe7a1,#e5b450 55%,#c98d2c);box-shadow:0 6px 16px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.5);margin:3px}',
'.wp-b.gh{background:rgba(255,246,230,.07);color:var(--ink);border:1px solid var(--line);box-shadow:none}',
'.wp-b.mg{background:linear-gradient(135deg,#ffc15e,#ff9f1c);color:#3a1a00}.wp-b.rose{background:linear-gradient(135deg,#ff8fb0,#e8547a);color:#3a0716}',
'.wp-b.sm{padding:7px 12px;font-size:.85rem;border-radius:11px}.wp-b.big{width:100%;padding:15px;font-size:1.08rem;margin:10px 0 0}',
'.wp-b.on{background:linear-gradient(135deg,#ffd76e,#ff9f1c);color:#3a1a00;box-shadow:0 0 0 2px #fff3c4,0 6px 18px rgba(255,159,28,.4)}',
'.wp-hdr{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px}',
'.wp-logo{font-size:1.9rem;user-select:none;-webkit-user-select:none;filter:drop-shadow(0 3px 10px rgba(247,221,140,.5));touch-action:manipulation}',
'.wp-foil{font-weight:800;background:linear-gradient(100deg,#a8741f 0%,#f9e7a6 22%,#c9973f 40%,#fff4c4 55%,#b8862b 75%,#f3d27a 100%);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:wpshine 7s linear infinite}',
'.wp-ttl{font-size:1.45rem;letter-spacing:.02em;flex:1;min-width:150px}.wp-ttl small{display:block;font-size:.8rem;-webkit-text-fill-color:var(--dim);color:var(--dim);font-weight:600;letter-spacing:.06em}',
'.wp-card{position:relative;background:linear-gradient(150deg,rgba(120,26,54,.88),rgba(56,9,24,.94));border:1px solid var(--line);border-radius:22px;padding:18px;margin:12px 0;box-shadow:0 12px 30px rgba(0,0,0,.35);animation:wppop .3s}',
'.wp-card::before,.wp-card::after{content:"";position:absolute;width:26px;height:26px;border:2px solid rgba(247,221,140,.45);pointer-events:none}',
'.wp-card::before{top:7px;left:7px;border-right:0;border-bottom:0;border-radius:10px 0 0 0}.wp-card::after{bottom:7px;right:7px;border-left:0;border-top:0;border-radius:0 0 10px 0}',
'.wp h2,.wp-vars h2{margin:.1em 0 .3em;font-size:1.5rem}.wp h3,.wp-vars h3{margin:16px 0 8px;font-size:.8rem;letter-spacing:.16em;text-transform:uppercase;color:var(--g2)}',
'.wp-sub{color:var(--dim);font-size:.93rem;line-height:1.45;margin:4px 0 10px}',
'.wp-hero{position:relative;text-align:center;padding:26px 14px 18px;overflow:hidden;border-radius:24px;background:radial-gradient(circle at 50% 40%,rgba(255,159,28,.18),transparent 60%)}',
'.wp-mandala{position:absolute;left:50%;top:50%;width:420px;height:420px;margin:-210px 0 0 -210px;border-radius:50%;pointer-events:none;opacity:.55;background:repeating-radial-gradient(circle,rgba(247,221,140,.14) 0 1.5px,transparent 1.5px 16px),repeating-conic-gradient(rgba(247,221,140,.12) 0 4deg,transparent 4deg 15deg);-webkit-mask:radial-gradient(circle,#000 30%,transparent 70%);mask:radial-gradient(circle,#000 30%,transparent 70%);animation:wpspin 120s linear infinite}',
'.wp-hero h1{position:relative;font-size:clamp(1.8rem,5vw,2.6rem);margin:.1em 0}.wp-hero p{position:relative;margin:4px 0}',
'.wp-count{position:relative;display:inline-flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:8px}',
'.wp-pill{display:inline-block;background:rgba(255,246,230,.08);border:1px solid var(--line);border-radius:999px;padding:5px 13px;font-weight:700;font-size:.88rem}',
'.wp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}',
'.wp-tile{position:relative;display:flex;gap:14px;align-items:center;text-align:left;color:var(--ink);background:linear-gradient(150deg,rgba(130,30,60,.85),rgba(60,10,26,.95));border:1px solid var(--line)!important;border-radius:20px;padding:14px;min-height:96px;box-shadow:0 10px 24px rgba(0,0,0,.3)}',
'.wp-tile:hover:not(:disabled){box-shadow:0 0 0 1.5px var(--g2),0 14px 30px rgba(0,0,0,.4)}',
'.wp-tile b{display:block;font-size:1.06rem}.wp-tile small{display:block;color:var(--dim);font-size:.82rem;line-height:1.35;margin-top:3px;font-weight:500}',
'.wp-ring{--p:0;flex:0 0 auto;position:relative;width:58px;height:58px;border-radius:50%;background:conic-gradient(var(--mg) 0,var(--g2) calc(var(--p)*1%),rgba(255,246,230,.1) 0);display:flex;align-items:center;justify-content:center}',
'.wp-ring::before{content:"";position:absolute;inset:5px;border-radius:50%;background:#3d0b1c}',
'.wp-ring span{position:relative;font-size:1.25rem;line-height:1}.wp-ring em{position:absolute;bottom:-6px;right:-6px;font-style:normal;font-size:.66rem;font-weight:800;background:var(--g2);color:#3a1406;border-radius:999px;padding:1px 5px}',
'.wp-ring.lg{width:96px;height:96px}.wp-ring.lg::before{inset:8px}.wp-ring.lg span{font-size:1.4rem;font-weight:800}',
'.wp-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}',
'.wp-in,.wp select,.wp-vars select,.wp textarea{font:inherit;color:var(--ink);background:rgba(20,3,9,.55);border:1px solid var(--line);border-radius:12px;padding:9px 12px;outline:none;margin:3px 0;width:auto;font-size:.95rem}',
'.wp-in:focus,.wp select:focus{border-color:var(--g2);box-shadow:0 0 0 3px rgba(247,221,140,.18)}.wp select option,.wp-vars select option{background:#3d0b1c}',
'.wp-in[type=date]{color-scheme:dark}',
'.wp-form{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:8px}.wp-form .wp-in{flex:1;min-width:120px}',
'.wp-swipe{text-align:center;min-height:260px;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:10px;padding:28px 20px;border:2px solid transparent;border-radius:28px;background:linear-gradient(150deg,#7d1a3a,#3c0a1b) padding-box,linear-gradient(135deg,#f7dd8c,#ff9f1c,#e8547a,#f7dd8c) border-box;box-shadow:0 18px 40px rgba(0,0,0,.45),0 14px 0 -6px #5a1229,0 26px 0 -12px #3c0a1b;animation:wpcard .35s cubic-bezier(.2,.9,.3,1.2);margin:8px 10px 26px}',
'.wp-swipe .em{font-size:3.6rem;filter:drop-shadow(0 6px 14px rgba(0,0,0,.4))}.wp-swipe .tt{font-size:1.5rem;font-weight:800}.wp-swipe .dd{color:var(--dim);max-width:460px;line-height:1.45}',
'.wp-tag{font-size:.72rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#3a1406;background:linear-gradient(135deg,#fbe7a1,#e5b450);border-radius:999px;padding:4px 12px}',
'.wp-ans{display:flex;justify-content:center;gap:16px;flex-wrap:wrap}',
'.wp-ans button{width:96px;height:96px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:800;font-size:.9rem;color:#fff;box-shadow:0 8px 22px rgba(0,0,0,.4)}',
'.wp-ans button i{font-style:normal;font-size:1.8rem;line-height:1.1}',
'.wp-love{background:linear-gradient(135deg,#ff7aa2,#c81d5a)}.wp-maybe{background:linear-gradient(135deg,#ffd166,#f59e0b);color:#3a2400!important}.wp-nope{background:linear-gradient(135deg,#8a6f7a,#4a2f3a)}',
'.wp-bar{height:10px;background:rgba(255,246,230,.1);border-radius:999px;overflow:hidden;margin:8px 0 12px}.wp-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--mg),var(--g2));border-radius:999px;transition:width .3s}',
'.wp-item{background:linear-gradient(150deg,rgba(255,159,28,.1),rgba(247,221,140,.05));border:1px solid var(--line);border-radius:16px;padding:12px 14px;margin:10px 0}',
'.wp-item.hot{border-color:rgba(255,143,176,.6);background:linear-gradient(150deg,rgba(232,84,122,.22),rgba(255,159,28,.08))}',
'.wp-item.new{box-shadow:0 0 0 1.5px var(--g2)}.wp-item .it{font-weight:700;font-size:1.04rem}.wp-item .ds{color:var(--dim);font-size:.88rem;margin-top:2px}',
'.wp-item .nt{margin-top:6px;font-size:.9rem;background:rgba(255,246,230,.07);border-radius:12px 12px 12px 4px;padding:6px 10px;width:fit-content;max-width:100%}',
'.wp-star{background:rgba(255,246,230,.08)!important;color:var(--ink)!important;border:1px solid var(--line)!important;box-shadow:none!important}.wp-star.on{background:linear-gradient(135deg,#ffd76e,#ff9f1c)!important;color:#3a1a00!important}',
'.wp-hint{color:var(--dim);font-size:.82rem;text-align:center;margin-top:8px}',
'.wp-wait{text-align:center;padding:30px 10px;color:var(--dim);font-size:1.05rem}.wp-wait::before{content:"🪔";display:block;font-size:2.6rem;margin-bottom:6px;animation:wpbeat 1.4s infinite}',
'.wp-sh{display:flex;gap:10px;align-items:flex-start;padding:12px;border-radius:16px;border:1px solid var(--line);background:rgba(255,246,230,.04);margin:8px 0}',
'.wp-sh .tx{flex:1}.wp-sh b{display:block}.wp-sh small{color:var(--dim)}',
'.wp-a{color:var(--g2);font-weight:700;text-decoration:none;border:1px solid var(--line);border-radius:10px;padding:6px 10px;font-size:.85rem;white-space:nowrap;display:inline-block;margin:3px}',
'.wp-vs{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:stretch}.wp-vs>div.x{align-self:center;font-weight:800;color:var(--g2);font-size:1.3rem}',
'.wp-opt{padding:16px;border-radius:18px;border:1.5px solid var(--line)!important;background:rgba(255,246,230,.06);color:var(--ink);font-weight:700;text-align:center;min-height:90px}',
'.wp-opt.on{background:linear-gradient(135deg,rgba(255,215,110,.35),rgba(255,159,28,.25));border-color:var(--g2)!important}',
'.wp-bud{display:grid;grid-template-columns:minmax(110px,1.2fr) auto 1.5fr;gap:6px 10px;align-items:center}',
'.wp-coins{font-weight:800;min-width:34px;text-align:center}.wp-hbar{height:12px;border-radius:999px;background:rgba(255,246,230,.08);overflow:hidden}.wp-hbar i{display:block;height:100%;background:linear-gradient(90deg,#ffd76e,#ff9f1c)}',
'.wp-cmp{display:grid;grid-template-columns:minmax(100px,1fr) 2fr;gap:4px 10px;align-items:center;font-size:.9rem}',
'.wp-cmp .bars{display:flex;flex-direction:column;gap:3px}.wp-cmp .bars i{display:block;height:9px;border-radius:999px}.wp-cmp .bars i.h{background:#ff8fb0}.wp-cmp .bars i.g{background:#8fd3ff}.wp-cmp .bars i.c{background:linear-gradient(90deg,#ffd76e,#ff9f1c)}',
'.wp-legend{display:flex;gap:12px;flex-wrap:wrap;font-size:.82rem;color:var(--dim);margin:6px 0}.wp-legend i{display:inline-block;width:12px;height:12px;border-radius:4px;margin-right:4px;vertical-align:-1px}',
'.wp-ev{border:1px solid var(--line);border-radius:16px;padding:12px;margin:8px 0;background:rgba(255,246,230,.04)}.wp-ev.dn{opacity:.75;background:rgba(120,200,120,.07)}.wp-ev.no{opacity:.5}',
'.wp-ev .h{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.wp-ev .h b{flex:1;min-width:140px}.wp-ev p{margin:6px 0;color:var(--dim);font-size:.88rem;line-height:1.4}',
'.wp-chip{box-shadow:none;padding:6px 11px;border-radius:999px;font-size:.82rem;font-weight:700;background:rgba(255,246,230,.07);color:var(--ink);border:1px solid var(--line)!important;margin:2px}',
'.wp-chip.on{background:linear-gradient(135deg,#ffd76e,#ff9f1c);color:#3a1a00;border-color:transparent!important}',
'.wp-chip.dn.on{background:linear-gradient(135deg,#86efac,#22c55e);color:#062a12}',
'.wp-tabs{display:flex;gap:6px;margin:6px 0 10px}',
'.wp-sw{display:inline-block;width:26px;height:26px;border-radius:8px;border:1px solid rgba(255,255,255,.35);margin:2px;vertical-align:middle}',
'.wp-gems{display:grid;grid-template-columns:1fr 1fr;gap:14px}',
'.wp-gem{display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 10px;border-radius:22px;border:1.5px solid var(--line)!important;background:radial-gradient(circle at 50% 35%,rgba(255,246,230,.12),rgba(20,3,9,.45));color:var(--ink);font-weight:700}',
'.wp-gem:hover:not(:disabled){box-shadow:0 0 0 2px var(--g2),0 0 30px rgba(247,221,140,.25)}',
'.wp-gemsvg{width:min(150px,34vw);height:min(150px,34vw);filter:drop-shadow(0 10px 16px rgba(0,0,0,.45))}',
'.wp-gem img{width:min(150px,34vw);height:min(150px,34vw);object-fit:cover;border-radius:18px;border:2px solid rgba(247,221,140,.5)}',
'.wp-gem small{color:var(--dim);font-weight:600}',
'.wp-tw{animation:wptw 2.4s ease-in-out infinite;transform-origin:center;transform-box:fill-box}.wp-tw2{animation-delay:1.1s}',
'.wp-range{width:100%;accent-color:#ff9f1c}',
'.wp-style{font-size:1.25rem;font-weight:800;text-align:center;padding:12px;line-height:1.5}',
'.wp-ov{position:fixed;inset:0;z-index:40;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(20,3,9,.78);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}',
'.wp-ov .box{width:100%;max-width:420px;max-height:92vh;overflow:auto;background:linear-gradient(150deg,#6e1631,#2a0610);border:1px solid var(--line);border-radius:24px;padding:22px;box-shadow:0 20px 50px rgba(0,0,0,.6);animation:wppop .25s;color:var(--ink)}',
'.wp-ov .box.wide{max-width:860px}',
'.wp-fx{position:fixed;inset:0;pointer-events:none;z-index:45;overflow:hidden}.wp-fx i{position:absolute;top:-20px;width:9px;height:14px;border-radius:2px;animation:wpfall 2.6s cubic-bezier(.3,.6,.5,1) forwards}',
'.wp-sum h2{border-bottom:1px solid var(--line);padding-bottom:4px;margin-top:20px}.wp-sum ul{margin:6px 0;padding-left:20px}.wp-sum li{margin:4px 0;line-height:1.4}',
'.wp-shake{animation:wpshake .35s}',
'.wp-sec h3{color:#f7dd8c}.wp-rk{display:grid;grid-template-columns:24px 30px 1fr 90px;gap:6px;align-items:center;font-size:.9rem;margin:3px 0}.wp-rk .bb{height:8px;border-radius:999px;background:linear-gradient(90deg,#ffd76e,#ff9f1c)}',
'.wp-thumbs{display:flex;flex-wrap:wrap;gap:8px}.wp-thumbs div{width:110px;text-align:center;font-size:.75rem}.wp-thumbs img{width:110px;height:110px;object-fit:cover;border-radius:12px;border:1px solid var(--line)}',
'@keyframes wpshine{to{background-position:200% center}}@keyframes wpspin{to{transform:rotate(360deg)}}',
'@keyframes wppop{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}',
'@keyframes wpcard{from{opacity:0;transform:translateX(40px) rotate(4deg)}to{opacity:1;transform:none}}',
'@keyframes wpbeat{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}@keyframes wptw{0%,100%{opacity:0;transform:scale(.4)}50%{opacity:1;transform:scale(1)}}',
'@keyframes wpfall{to{transform:translateY(105vh) rotate(720deg);opacity:.9}}@keyframes wpshake{25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}',
'@media(max-width:560px){.wp{padding:10px 10px 22px;border-radius:20px}.wp-ans button{width:80px;height:80px}.wp-bud{grid-template-columns:1fr auto;}.wp-bud .wp-hbar{grid-column:1/-1}.wp-swipe{margin:6px 2px 22px}.wp-vs{grid-template-columns:1fr}.wp-vs>div.x{text-align:center}}',
'@media print{body *{visibility:hidden!important}.wp-print,.wp-print *{visibility:visible!important;color:#2a0610!important;-webkit-text-fill-color:#2a0610!important;background:none!important;box-shadow:none!important;animation:none!important}.wp-print{position:absolute;left:0;top:0;width:100%;padding:20px}.wp-print .wp-noprint{display:none!important}.wp-print .wp-sw{border:1px solid #888}}'
].join('\n');

/* =====================================================================================
   UI
   ===================================================================================== */
function GAME_START(ctx){
  var me=ctx.me,isHost=!!ctx.isHost,partner=oth(me),names=ctx.names||{};
  var nm=function(r){return r==='both'?'Both':r==='family'?'Family':(names[r]||(r==='host'?'Host':'Guest'))};
  var root=ctx.root;root.innerHTML='';
  var st=document.createElement('style');st.textContent=CSS;root.appendChild(st);
  var wrap=document.createElement('div');wrap.className='wp';root.appendChild(wrap);
  var ovBox=document.createElement('div');ovBox.className='wp-vars';root.appendChild(ovBox);
  var secBox=document.createElement('div');secBox.className='wp-vars';root.appendChild(secBox);
  var V=null,lastQ=-1,dead=false,ended=false,actN=0,lastAt=null,lastFx=null,hiTimer=null,timers=[];
  var L={drafts:{},tlTab:'ev',alloc:null,allocKey:'',shown:{},spkVal:{},addOpen:false,savedPlanAt:-1};
  var phCache={};
  var core=null;

  function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
  function btn(label,cls,fn,act){var b=el('button','wp-b '+(cls||''),label);b.type='button';if(act)b.setAttribute('data-act',act);b.onclick=function(e){if(!dead)fn(e)};return b}
  function add(p){for(var i=1;i<arguments.length;i++)if(arguments[i])p.appendChild(arguments[i]);return p}
  function ring(p,icon,lg){var r=el('div','wp-ring'+(lg?' lg':''));r.style.setProperty('--p',Math.round(p*100));r.appendChild(el('span',null,icon));if(!lg)r.appendChild(el('em',null,Math.round(p*100)+'%'));return r}
  function later(f,ms){var t=setTimeout(function(){if(!dead)f()},ms);timers.push(t);return t}

  /* --- plan storage --- */
  function loadPlan(){return ls(PLAN_KEY)}
  function savePlan(p){if(!p)return;if(p.updated===L.savedPlanAt)return;L.savedPlanAt=p.updated;ls(PLAN_KEY,p)}
  function localColor(){return sanitizeColor(ls(COLOR_KEY))}

  /* --- networking --- */
  function act(a){
    if(dead||!V||V.over)return;
    a.n=++actN;
    if(isHost)hostDo('host',a);else ctx.send({k:'a',a:a});
  }
  function bcast(){ctx.send({k:'s',q:core.S.q,v:core.view('guest')})}
  function hostDo(role,a){
    if(!core.apply(role,a))return;
    core.S.q++;savePlan(core.S.plan);V=core.view('host');bcast();onView();
  }
  function sendPhotos(ids){
    var pics=ls(K_PICS)||[];
    pics.forEach(function(p){if(ids.indexOf(p.id)>=0&&typeof p.url==='string'){phCache[p.id]=p.url;ctx.send({k:'ph',id:p.id,url:p.url})}});
  }

  /* --- view handling --- */
  function onView(){
    if(!V)return;
    var atKey=V.at+(V.deck&&V.at==='deck'?':'+V.deck.id:'');
    var changed=atKey!==lastAt;lastAt=atKey;
    render();
    if(changed){try{if(root.scrollIntoView&&window.scrollY>root.offsetTop)root.scrollIntoView({block:'start'})}catch(e){}}
    if(lastFx!==null&&V.fx>lastFx)confetti();
    lastFx=V.fx;
    recordNotes();
    if(V.over&&!ended){
      ended=true;var P=progress(V.plan),saved=0;
      DECKS.forEach(function(d){saved+=Object.keys(V.plan.decks[d.id].star).length});
      var nu=nextUp(V.plan);
      ctx.end('Saved for today 💍','Plan '+Math.round(P.total*100)+'% complete \u00b7 '+saved+' idea'+(saved===1?'':'s')+' in the plan'+(nu?' \u00b7 next up: '+nu.t:'')+'. See you next planning date!');
    }
  }

  /* --- confetti --- */
  function confetti(){
    var f=el('div','wp-fx'),cols=['#ff9f1c','#f7dd8c','#e8547a','#ffd76e','#c9973f','#ff6b9a','#fff4c4'];
    for(var i=0;i<46;i++){var c=el('i');c.style.left=(Math.random()*100)+'%';c.style.background=cols[i%cols.length];c.style.animationDelay=(Math.random()*.6)+'s';c.style.transform='rotate('+(Math.random()*360)+'deg)';if(i%4===0){c.style.borderRadius='50%';c.style.width='10px';c.style.height='10px'}f.appendChild(c)}
    root.appendChild(f);later(function(){f.remove()},3400);
  }

  /* --- inputs with drafts (survive re-renders) --- */
  function txtIn(name,val,ph,max,onCommit,type){
    var i=el('input','wp-in');i.type=type||'text';if(type!=='date')i.maxLength=max||120;i.placeholder=ph||'';i.setAttribute('data-name',name);
    i.value=(name in L.drafts)?L.drafts[name]:(val||'');
    i.addEventListener('input',function(){L.drafts[name]=i.value});
    if(onCommit){
      var c=function(){if(!(name in L.drafts))return;var v=L.drafts[name];delete L.drafts[name];if(v!==(val||''))onCommit(v)};
      i.addEventListener('change',c);i.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();c()}});
    }
    return i;
  }
  function formOf(fields,label,cls,onSubmit,act){
    var f=document.createElement('form');f.className='wp-form';f.setAttribute('autocomplete','off');
    fields.forEach(function(x){f.appendChild(x)});
    var b=el('button','wp-b sm '+(cls||''),label);b.type='submit';if(act)b.setAttribute('data-act',act);f.appendChild(b);
    f.addEventListener('submit',function(e){e.preventDefault();if(dead)return;onSubmit()});
    return f;
  }
  function draftVal(name){var v=L.drafts[name];delete L.drafts[name];return v==null?'':String(v)}
  function selectOf(name,val,opts,onChange){
    var s=el('select');s.setAttribute('data-name',name);
    opts.forEach(function(o){var op=el('option',null,o[1]);op.value=o[0];s.appendChild(op)});
    s.value=val||'';s.addEventListener('change',function(){onChange(s.value)});return s;
  }
  var OWN=function(){return [['','Owner\u2026'],['host',nm('host')],['guest',nm('guest')],['both','Both'],['family','Family']]};

  /* --- modals (local only) --- */
  function modal(build,wide){
    ovBox.innerHTML='';var o=el('div','wp-ov'),b=el('div','box'+(wide?' wide':''));o.appendChild(b);
    o.addEventListener('click',function(e){if(e.target===o)closeModal()});
    build(b);ovBox.appendChild(o);
  }
  function closeModal(){ovBox.innerHTML=''}
  function confirmBox(title,text,yes,fn,act){
    modal(function(b){
      add(b,el('h2','wp-foil',title),el('p','wp-sub',text));
      var r=el('div','wp-row');r.appendChild(btn(yes,'',function(){closeModal();fn()},act||'confirm'));r.appendChild(btn('Cancel','gh',closeModal,'cancel'));b.appendChild(r);
    });
  }

  /* --- downloads / import --- */
  function download(name,text,mime){
    try{var blob=new Blob([text],{type:(mime||'text/plain')+';charset=utf-8'}),url=URL.createObjectURL(blob);
      var a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},1500)}catch(e){}
  }
  function exportTxt(){download('our-wedding-plan.txt',planText(V.plan,names))}
  function exportJson(){var p=JSON.parse(JSON.stringify(V.plan));download('our-wedding-plan.json',JSON.stringify({app:'duo-wedding-planner',v:1,plan:p},null,2),'application/json')}
  function importFile(file){
    if(!file)return;var fr=new FileReader();
    fr.onload=function(){
      var o=null;try{o=JSON.parse(String(fr.result))}catch(e){}
      if(o&&o.plan)o=o.plan;
      if(!o||typeof o!=='object'||!o.decks){ctx.toast('That file does not look like a wedding plan');return}
      confirmBox('Import plan?','This replaces the plan you both see right now with the one in the file. Export first if you want a backup.','Replace plan',function(){act({a:'import',plan:sanitizePlan(o)})});
    };
    fr.readAsText(file);
  }

  /* =====================================================================
     RENDER
     ===================================================================== */
  function render(){
    if(dead)return;
    var ae=document.activeElement,keep=null,s0=0,s1=0;
    if(ae&&ae.getAttribute&&wrap.contains(ae)&&ae.getAttribute('data-name')){keep=ae.getAttribute('data-name');try{s0=ae.selectionStart;s1=ae.selectionEnd}catch(e){}}
    var h=wrap.offsetHeight;if(h)wrap.style.minHeight=h+'px';
    wrap.innerHTML='';
    if(!V){wrap.appendChild(header());wrap.appendChild(el('div','wp-wait','Opening the planner\u2026'));wrap.style.minHeight='';return}
    wrap.setAttribute('data-at',V.at);
    wrap.appendChild(header());
    var at=V.at;
    ({board:rBoard,decks:rDecks,deck:rDeck,shabad:rShabad,thanks:rThanks,budget:rBudget,timeline:rTimeline,colors:rColors,sparkle:rSparkle,summary:rSummary}[at]||rBoard)();
    wrap.style.minHeight='';
    if(keep){var inp=wrap.querySelector('[data-name="'+keep+'"]');if(inp){try{inp.focus({preventScroll:true});if(inp.setSelectionRange&&inp.type==='text')inp.setSelectionRange(s0,s1)}catch(e){}}}
  }
  var taps=[];
  function header(){
    var h=el('div','wp-hdr');
    var lg=el('span','wp-logo','💍');
    lg.addEventListener('click',function(){
      var now=Date.now();taps=taps.filter(function(t){return now-t<3000});taps.push(now);
      if(taps.length>=5){taps=[];openPin()}
    });
    h.appendChild(lg);
    var t=el('div','wp-ttl wp-foil','Wedding Planner');t.appendChild(el('small',null,nm('host')+' & '+nm('guest')));h.appendChild(t);
    if(V&&V.at!=='board')h.appendChild(btn('🏠 Board','gh sm',function(){act({a:'go',to:'board'})},'home'));
    if(V&&!V.over)h.appendChild(btn('Done for today','gh sm',function(){
      var P=progress(V.plan);
      confirmBox('Done for today? 🌙','Your plan is '+Math.round(P.total*100)+'% complete and saved on '+(isHost?'this device':nm('host')+'\u2019s device (with a copy here)')+'. This ends the session for both of you.','Yes, done for today',function(){act({a:'bye'})},'bye-yes');
    },'bye'));
    return h;
  }
  function back(){var r=el('div','wp-row');r.style.marginTop='14px';r.appendChild(btn('\u2190 Back to the board','gh',function(){act({a:'go',to:'board'})},'back'));return r}

  /* --- board --- */
  function rBoard(){
    var pl=V.plan,P=progress(pl);
    var hero=el('div','wp-hero');hero.appendChild(el('div','wp-mandala'));
    hero.appendChild(el('h1','wp-foil','Our Wedding Planning Board'));
    hero.appendChild(el('p','wp-sub','Every decision you make together lands in your shared plan. ✨'));
    var c=el('div','wp-count');
    c.appendChild(ring(P.total,Math.round(P.total*100)+'%',true));
    var dl=daysTo(pl.date);
    var dd=el('div');dd.style.textAlign='left';
    dd.appendChild(el('div','wp-pill',pl.date?(dl>0?dl+' days to go 💍':dl===0?'Today is the day! 💍':'Married! 💍'):'Set our wedding date'));
    var di=txtIn('date',pl.date,'','',function(v){act({a:'date',v:v})},'date');dd.appendChild(di);
    c.appendChild(dd);hero.appendChild(c);
    var nu=nextUp(pl);
    if(nu){var n=el('p','wp-sub');n.style.position='relative';n.textContent='Next up: '+nu.e+' '+nu.t+(pl.tl[nu.id]&&pl.tl[nu.id].date?' on '+pl.tl[nu.id].date:'');hero.appendChild(n)}
    var sr=el('div','wp-row');sr.style.cssText='justify-content:center;position:relative';
    sr.appendChild(btn('🎲 Surprise me','mg',function(){act({a:'surprise'})},'surprise'));
    sr.appendChild(btn('📜 Our Wedding Plan','',function(){act({a:'go',to:'summary'})},'summary'));
    hero.appendChild(sr);
    wrap.appendChild(hero);
    var g=el('div','wp-grid');
    SECTIONS.forEach(function(s){
      var b=el('button','wp-tile');b.type='button';b.setAttribute('data-sec',s.id);b.setAttribute('data-p',String(Math.round(P[s.id]*100)));
      b.appendChild(ring(P[s.id],s.e));
      var tx=el('div');tx.appendChild(el('b',null,s.t));tx.appendChild(el('small',null,s.d));b.appendChild(tx);
      b.onclick=function(){if(!dead)act({a:'go',to:s.id})};
      g.appendChild(b);
    });
    wrap.appendChild(g);
    var io=el('div','wp-card');
    io.appendChild(el('h3',null,'Keep your plan safe'));
    io.appendChild(el('p','wp-sub','The plan lives on '+(isHost?'this device':nm('host')+'\u2019s device')+' and a copy is saved on the other. Export a backup any time.'));
    var r=el('div','wp-row');
    r.appendChild(btn('⬇ Export .txt','gh sm',exportTxt,'exptxt'));
    r.appendChild(btn('⬇ Export .json','gh sm',exportJson,'expjson'));
    var fi=el('input');fi.type='file';fi.accept='.json,application/json';fi.style.display='none';fi.onchange=function(){importFile(fi.files&&fi.files[0]);fi.value=''};
    r.appendChild(btn('⬆ Import .json','gh sm',function(){fi.click()},'import'));r.appendChild(fi);
    io.appendChild(r);wrap.appendChild(io);
  }

  /* --- decks hub --- */
  function rDecks(){
    var c=el('div','wp-card');
    c.appendChild(el('h2','wp-foil','🎉 Functions & Ideas'));
    c.appendChild(el('p','wp-sub','Pick a deck. You both swipe Love / Maybe / Nope in secret, '+BATCH+' cards at a time. Only the overlaps are revealed, and you can star the best ones into your plan.'));
    var g=el('div','wp-grid');
    IDEA_DECKS.forEach(function(id){
      var d=DK[id],p=deckProg(V.plan,id),dd=V.plan.decks[id],nb=0,ns=Object.keys(dd.star).length;
      Object.keys(dd.res).forEach(function(k){if(dd.res[k]==='b')nb++});
      var b=el('button','wp-tile');b.type='button';b.setAttribute('data-deck',id);
      b.appendChild(ring(p,d.e));
      var tx=el('div');tx.appendChild(el('b',null,d.name));tx.appendChild(el('small',null,d.blurb));
      tx.appendChild(el('small',null,'💞 '+nb+' both loved \u00b7 ⭐ '+ns+' in plan'));b.appendChild(tx);
      b.onclick=function(){if(!dead)act({a:'go',to:'deck',d:id})};g.appendChild(b);
    });
    c.appendChild(g);wrap.appendChild(c);wrap.appendChild(back());
  }

  /* --- deck --- */
  function overlapItem(deckId,cid,isNew){
    var pl=V.plan,c=cardOf(pl,deckId,cid);if(!c)return null;
    var dk=pl.decks[deckId],res=dk.res[cid],starred=cid in dk.star;
    var d=el('div','wp-item'+(res==='b'?' hot':'')+(isNew?' new':''));
    var top=el('div','wp-row');
    var t=el('div');t.style.flex='1';t.appendChild(el('div','it',c.e+' '+c.t));if(c.d)t.appendChild(el('div','ds',c.d));top.appendChild(t);
    top.appendChild(btn(starred?'⭐ In our plan':'☆ Add to plan','sm wp-star'+(starred?' on':''),function(){act({a:'star',d:deckId,c:cid,on:!starred})},'star'));
    d.appendChild(top);
    if(starred&&dk.star[cid])d.appendChild(el('div','nt','📝 '+dk.star[cid]));
    var nmk='note-'+deckId+'-'+cid,inp=txtIn(nmk,'','Add a note (who, when, budget\u2026)',200);
    d.appendChild(formOf([inp],'Save note','',function(){var v=clean(draftVal(nmk),200);if(v)act({a:'note',d:deckId,c:cid,t:v})},'note'));
    return d;
  }
  function addIdeaForm(deckId){
    var box=el('div','wp-card');
    box.appendChild(el('h3',null,'➕ Add our own idea'));
    var e=txtIn('cust-e-'+deckId,'','🙂',4),t=txtIn('cust-t-'+deckId,'','Our idea\u2026',80),ds=txtIn('cust-d-'+deckId,'','One-line description (optional)',140);
    e.style.width='64px';e.style.flex='0 0 64px';e.style.minWidth='0';
    box.appendChild(formOf([e,t,ds],'Add card','mg',function(){
      var tt=clean(draftVal('cust-t-'+deckId),80),ee=clean(draftVal('cust-e-'+deckId),8),dd=clean(draftVal('cust-d-'+deckId),140);
      if(!tt){ctx.toast('Type your idea first');return}
      act({a:'custom',d:deckId,t:tt,e:ee,desc:dd});ctx.toast('Added! It will show up for both of you in the next batch');
    },'addidea'));
    return box;
  }
  function allOverlaps(deckId,newOnes){
    var dk=V.plan.decks[deckId],ids=deckCards(V.plan,deckId).filter(function(c){return dk.res[c]==='b'||dk.res[c]==='w'});
    ids.sort(function(a,b){return (dk.res[a]==='b'?0:1)-(dk.res[b]==='b'?0:1)});
    return ids.filter(function(c){return !newOnes||newOnes.indexOf(c)<0});
  }
  function rDeck(){
    var D=V.deck;if(!D){rDecks();return}
    var d=DK[D.id],pl=V.plan,p=deckProg(pl,D.id);
    var head=el('div','wp-card');
    var hr=el('div','wp-row');hr.appendChild(ring(p,d.e));var ht=el('div');ht.style.flex='1';ht.appendChild(el('h2','wp-foil',d.name));ht.appendChild(el('div','wp-sub',d.blurb));hr.appendChild(ht);
    head.appendChild(hr);
    if(D.id==='thanks')head.appendChild(el('p','wp-sub','Are we doing a thank-you or anything like that for Mhji\u2019s family? Swipe the ideas, then add gifts to the list in Family Thank-yous.'));
    wrap.appendChild(head);
    if(D.ph==='swipe'){
      var n=D.cards.length,i=D.mine.length;
      if(i>=n){
        wrap.appendChild(el('div','wp-card wp-wait','All swiped! Waiting for '+nm(partner)+' ('+D.n[partner]+'/'+n+')\u2026'));
        var ub=btn('Undo my last','gh sm',function(){act({a:'undo',b:D.b})},'undo');var rr=el('div','wp-row');rr.style.justifyContent='center';rr.appendChild(ub);wrap.appendChild(rr);
      }else{
        var c=cardOf(pl,D.id,D.cards[i]);
        var pr=el('div','wp-row');pr.style.justifyContent='space-between';
        pr.appendChild(el('span','wp-pill','Card '+(i+1)+' / '+n));pr.appendChild(el('span','wp-pill',nm(partner)+': '+D.n[partner]+'/'+n));
        wrap.appendChild(pr);
        var bar=el('div','wp-bar'),fi=el('i');fi.style.width=Math.round(i/n*100)+'%';bar.appendChild(fi);wrap.appendChild(bar);
        var sc=el('div','wp-swipe');
        sc.appendChild(el('span','wp-tag',d.e+' '+d.name+(/^c/.test(c.id)?' \u00b7 our own idea':'')));
        sc.appendChild(el('div','em',c.e));sc.appendChild(el('div','tt',c.t));if(c.d)sc.appendChild(el('div','dd',c.d));
        wrap.appendChild(sc);
        var an=el('div','wp-ans');
        [['y','💖','Love','wp-love'],['m','🤔','Maybe','wp-maybe'],['n','🙅','Nope','wp-nope']].forEach(function(x){
          var b=el('button',x[3]);b.type='button';b.setAttribute('data-act','sw-'+x[0]);b.appendChild(el('i',null,x[1]));b.appendChild(document.createTextNode(x[2]));
          b.onclick=function(){if(!dead)act({a:'sw',b:D.b,i:i,v:x[0]})};an.appendChild(b);
        });
        wrap.appendChild(an);
        var sr=el('div','wp-row');sr.style.cssText='justify-content:center;margin-top:12px';
        var u=btn('↶ Undo','gh sm',function(){act({a:'undo',b:D.b})},'undo');if(!i)u.disabled=true;sr.appendChild(u);wrap.appendChild(sr);
        wrap.appendChild(el('div','wp-hint','Your swipes stay secret. Only cards you both like get revealed. Keys: L / M / N, U to undo.'));
      }
    }else if(D.ph==='reveal'){
      var rv=D.rev,box=el('div','wp-card');
      var hh=el('div','wp-hero');hh.appendChild(el('div','wp-mandala'));hh.appendChild(el('h1','wp-foil',rv.both.length?'It\u2019s a match! 💞':rv.worth.length?'Worth a chat ☕':'Fresh start next batch 🌸'));
      hh.appendChild(el('p','wp-sub',rv.both.length+' both loved \u00b7 '+rv.worth.length+' worth discussing. Everything else stays private.'));box.appendChild(hh);
      if(rv.both.length){box.appendChild(el('h3',null,'💞 Both loved'));rv.both.forEach(function(cid){add(box,overlapItem(D.id,cid,true))})}
      if(rv.worth.length){box.appendChild(el('h3',null,'☕ Worth discussing'));rv.worth.forEach(function(cid){add(box,overlapItem(D.id,cid,true))})}
      var older=allOverlaps(D.id,rv.both.concat(rv.worth));
      if(older.length){var det=el('details');if(L.det)det.open=true;det.addEventListener('toggle',function(){L.det=det.open});det.appendChild(el('summary','wp-sub','Earlier overlaps in this deck ('+older.length+')'));older.forEach(function(cid){add(det,overlapItem(D.id,cid,false))});box.appendChild(det)}
      var more=nextBatch(pl,D.id,1).length,mine=D.ready[me];
      var nb=btn(mine?'Waiting for '+nm(partner)+'\u2026':more?'Next batch \u2192':'Finish deck \u2192','big',function(){act({a:'next',b:D.b})},'next');if(mine)nb.disabled=true;
      box.appendChild(nb);
      if(D.ready[partner]&&!mine)box.appendChild(el('p','wp-hint',nm(partner)+' is ready for the next batch'));
      wrap.appendChild(box);
    }else{
      var cb=el('div','wp-card');
      cb.appendChild(el('h2','wp-foil','Deck complete! 🎉'));
      cb.appendChild(el('p','wp-sub','You have swiped every card in this deck. Here are all your overlaps. Add your own ideas below to keep going.'));
      var all=allOverlaps(D.id);
      if(!all.length)cb.appendChild(el('p','wp-sub','No overlaps here, and that is fine. Try adding your own ideas!'));
      all.forEach(function(cid){add(cb,overlapItem(D.id,cid,false))});
      wrap.appendChild(cb);
    }
    wrap.appendChild(addIdeaForm(D.id));
    var bk=back();
    if(D.id==='thanks')bk.appendChild(btn('💐 Gift list','gh',function(){act({a:'go',to:'thanks'})},'gifts'));
    else bk.appendChild(btn('🎉 All decks','gh',function(){act({a:'go',to:'decks'})},'alldecks'));
    wrap.appendChild(bk);
  }

  /* --- shabad --- */
  function ytUrl(t){return 'https://www.youtube.com/results?search_query='+encodeURIComponent(t+' shabad kirtan')}
  function rShabad(){
    var pl=V.plan,sv=pl.shabad,c=el('div','wp-card');
    c.appendChild(el('h2','wp-foil','🙏 A shabad together?'));
    c.appendChild(el('p','wp-sub','Do we want to sing a shabad together, and which one?'));
    var voted=sv.vote.host&&sv.vote.guest;
    if(!voted){
      c.appendChild(el('h3',null,'Quick vote (secret until you both answer)'));
      var r=el('div','wp-row'),mine=V.svote.mine;
      [['y','🙏 Yes, let\u2019s'],['m','🤔 Maybe'],['n','🙂 Not for us']].forEach(function(x){
        var b=btn(x[1],'chip-v'+(mine===x[0]?' on':''),function(){act({a:'svote',v:x[0]})},'svote-'+x[0]);if(mine)b.disabled=true;r.appendChild(b);
      });
      c.appendChild(r);
      c.appendChild(el('p','wp-hint',mine?(V.svote.other?'Both voted!':'Waiting for '+nm(partner)+'\u2026'):(V.svote.other?nm(partner)+' has voted.':'')));
      wrap.appendChild(c);wrap.appendChild(back());return;
    }
    var lab={y:'Yes 🙏',m:'Maybe 🤔',n:'Not for us 🙂'};
    c.appendChild(el('p',null,nm('host')+': '+lab[sv.vote.host]+' \u00b7 '+nm('guest')+': '+lab[sv.vote.guest]));
    var rv=el('div','wp-row');rv.appendChild(btn('Vote again','gh sm',function(){act({a:'sreset'})},'sreset'));c.appendChild(rv);
    if(sv.vote.host==='n'&&sv.vote.guest==='n'){
      c.appendChild(el('p','wp-sub','You both said not this time, and that is a perfectly good decision. 💛'));
      wrap.appendChild(c);wrap.appendChild(back());return;
    }
    wrap.appendChild(c);
    var B=V.br;
    if(B&&!B.champ){wrap.appendChild(bracketCard(B));wrap.appendChild(back());return}
    if(sv.pick){
      var pc=el('div','wp-card');var s=SHB[sv.pick];
      var hh=el('div','wp-hero');hh.appendChild(el('div','wp-mandala'));hh.appendChild(el('p','wp-sub','Our shabad'));hh.appendChild(el('h1','wp-foil',s.t));hh.appendChild(el('p','wp-sub',s.th));pc.appendChild(hh);
      var a=el('a','wp-a','▶ Listen on YouTube');a.href=ytUrl(s.t);a.target='_blank';a.rel='noopener noreferrer';
      var rr=el('div','wp-row');rr.style.justifyContent='center';rr.appendChild(a);rr.appendChild(btn('Change our pick','gh sm',function(){act({a:'unpick'})},'unpick'));pc.appendChild(rr);
      pc.appendChild(el('p','wp-hint','Please confirm the shabad, its meaning and its place in the programme with your Granthi Singh or raagi jatha.'));
      wrap.appendChild(pc);
    }
    var lc=el('div','wp-card');
    lc.appendChild(el('h3',null,'Shabads often sung at weddings & kirtan'));
    lc.appendChild(el('p','wp-sub','Tap ♡ to shortlist. Themes are short summaries only, not translations. Please confirm the choice and meaning with your Granthi Singh or raagi jatha.'));
    var my=sv.short[me],their=sv.short[partner];
    SHABADS.forEach(function(s){
      var row=el('div','wp-sh'),on=my.indexOf(s.id)>=0,po=their.indexOf(s.id)>=0;
      var hb=btn(on?'♥':'♡','sm wp-star'+(on?' on':''),function(){act({a:'short',id:s.id,on:!on})},'short');hb.setAttribute('data-id',s.id);row.appendChild(hb);
      var tx=el('div','tx');tx.appendChild(el('b',null,s.t));tx.appendChild(el('small',null,s.th));
      if(po||on)tx.appendChild(el('div','wp-hint',(on&&po?'💞 You both shortlisted this':on?'You shortlisted this':nm(partner)+' shortlisted this')));
      tx.style.textAlign='left';row.appendChild(tx);
      var a=el('a','wp-a','▶ Listen');a.href=ytUrl(s.t);a.target='_blank';a.rel='noopener noreferrer';row.appendChild(a);
      lc.appendChild(row);
    });
    var un=uniq(my.concat(their));
    if(un.length>=2)lc.appendChild(btn('🏆 Start the shabad bracket ('+Math.min(8,un.length)+')','big',function(){act({a:'brStart'})},'brstart'));
    else if(un.length===1)lc.appendChild(btn('Make it our pick: '+SHB[un[0]].t,'big',function(){act({a:'pick',id:un[0]})},'pickone'));
    else lc.appendChild(el('p','wp-hint','Shortlist two or more for a head-to-head bracket.'));
    wrap.appendChild(lc);wrap.appendChild(back());
  }
  function bracketCard(B){
    var c=el('div','wp-card'),a=SHB[B.list[B.i]],b=SHB[B.list[B.i+1]];
    var remain=B.list.length;
    c.appendChild(el('h2','wp-foil','🏆 Shabad bracket \u00b7 '+(remain<=2?'Final':'Round '+B.round)));
    c.appendChild(el('p','wp-sub','Both pick in secret. If you agree it goes through; if not, talk it out.'));
    if(!a||!b){wrap.appendChild(c);return c}
    var vs=el('div','wp-vs'),mine=B.v[me];
    [['a',a],['b',b]].forEach(function(x,k){
      var o=el('button','wp-opt'+(mine===x[0]?' on':''));o.type='button';o.setAttribute('data-act','bv-'+x[0]);
      o.appendChild(el('div',null,x[1].t));var sm=el('small','wp-sub',x[1].th);sm.style.display='block';o.appendChild(sm);
      if(B.talk){o.appendChild(el('div','wp-hint',[me,partner].filter(function(r){return B.v[r]===x[0]}).map(function(r){return r===me?'You':nm(r)}).join(' & ')+' picked this'))}
      o.disabled=!!mine||B.talk;o.onclick=function(){if(!dead)act({a:'bv',m:B.m,v:x[0]})};
      vs.appendChild(o);if(k===0)vs.appendChild(el('div','x','vs'));
    });
    c.appendChild(vs);
    if(B.talk){
      var t=el('div','wp-card');t.style.textAlign='center';
      t.appendChild(el('h2',null,'Talk it out 💬'));t.appendChild(el('p','wp-sub','You picked differently. Share why you love yours, then vote again, or let a coin decide if you both want.'));
      var r=el('div','wp-row');r.style.justifyContent='center';
      r.appendChild(btn('Vote again','',function(){act({a:'brevote'})},'brevote'));r.appendChild(btn('🪙 Let the coin decide','gh',function(){act({a:'bcoin'})},'bcoin'));
      t.appendChild(r);c.appendChild(t);
    }else c.appendChild(el('p','wp-hint',mine?(B.v[partner]?'':'Waiting for '+nm(partner)+'\u2026'):(B.v[partner]?nm(partner)+' has picked.':'')));
    if(B.coin)c.appendChild(el('p','wp-hint','🪙 The coin picked '+SHB[B.coin].t));
    c.appendChild(btn('Stop bracket','gh sm',function(){act({a:'brStop'})},'brstop'));
    return c;
  }

  /* --- thanks --- */
  function rThanks(){
    var pl=V.plan,c=el('div','wp-card');
    c.appendChild(el('h2','wp-foil','💐 Family Thank-yous'));
    c.appendChild(el('p','wp-sub','Are we doing a thank-you or anything like that for Mhji\u2019s family? And for both families who are making this happen?'));
    var p=deckProg(pl,'thanks'),r=el('div','wp-row');r.appendChild(ring(p,'💐'));
    r.appendChild(btn(p>=1?'See our thank-you ideas':'Swipe thank-you ideas \u2192','mg',function(){act({a:'go',to:'deck',d:'thanks'})},'thanksdeck'));
    c.appendChild(r);
    var st=Object.keys(pl.decks.thanks.star);
    if(st.length){c.appendChild(el('h3',null,'⭐ In our plan'));var ul=el('ul');st.forEach(function(k){var cc=cardOf(pl,'thanks',k);if(cc)ul.appendChild(el('li',null,cc.e+' '+cc.t+(pl.decks.thanks.star[k]?' \u2014 '+pl.decks.thanks.star[k]:'')))});c.appendChild(ul)}
    wrap.appendChild(c);
    var g=el('div','wp-card');
    g.appendChild(el('h3',null,'🎁 Gift & thank-you list'));
    if(!pl.gifts.length)g.appendChild(el('p','wp-sub','Nothing yet. Add who you want to thank and how.'));
    var tot=0;
    pl.gifts.forEach(function(x){
      var row=el('div','wp-ev'+(x.done?' dn':'')),h=el('div','h');
      h.appendChild(el('b',null,(x.who||'Someone')+' \u2014 '+(x.what||'?')));
      if(x.budget){h.appendChild(el('span','wp-pill',x.budget));var nv=num(String(x.budget).replace(/[^\d.]/g,''));tot+=nv}
      h.appendChild(btn(x.done?'✓ Done':'Mark done','wp-chip dn'+(x.done?' on':''),function(){act({a:'gift',op:'done',id:x.id})},'giftdone'));
      h.appendChild(btn('✕','wp-chip',function(){act({a:'gift',op:'del',id:x.id})},'giftdel'));
      row.appendChild(h);g.appendChild(row);
    });
    if(tot)g.appendChild(el('p','wp-sub','Total budget so far: ~'+Math.round(tot)));
    var w1=txtIn('gift-who','','Who (e.g. Mhji\u2019s family)',60),w2=txtIn('gift-what','','What (e.g. framed photo)',100),w3=txtIn('gift-bud','','Budget',20);w3.style.maxWidth='110px';
    g.appendChild(formOf([w1,w2,w3],'Add','mg',function(){var who=draftVal('gift-who'),what=draftVal('gift-what'),bu=draftVal('gift-bud');if(!clean(who)&&!clean(what))return;act({a:'gift',op:'add',who:who,what:what,budget:bu})},'giftadd'));
    wrap.appendChild(g);wrap.appendChild(back());
  }

  /* --- budget --- */
  function rBudget(){
    var pl=V.plan,B=V.bud,c=el('div','wp-card');
    c.appendChild(el('h2','wp-foil','🪙 Budget Battle'));
    if(B.open){
      c.appendChild(el('p','wp-sub','You each have 100 coins. Split them across what matters most to you, in secret. Then reveal side by side!'));
      var key='b'+(pl.budget?pl.budget.avg.join(','):'none');
      if(!L.alloc||L.allocKey!==key){L.alloc=B.mine?B.mine.slice():BUD.map(function(){return 10});L.allocKey=key}
      if(B.lock[me]){
        c.appendChild(el('div','wp-wait','Locked in! Waiting for '+nm(partner)+'\u2026'));
        c.appendChild(btn('Unlock & change','gh sm',function(){act({a:'budUnlock'})},'budunlock'));
      }else{
        var sum=L.alloc.reduce(function(s,x){return s+x},0);
        var sp=el('div','wp-row');sp.style.justifyContent='space-between';
        sp.appendChild(el('span','wp-pill','Coins left: '+(100-sum)));sp.appendChild(el('span','wp-pill',B.lock[partner]?nm(partner)+' has locked in':nm(partner)+' is still deciding'));
        c.appendChild(sp);
        var g=el('div','wp-bud');
        BUD.forEach(function(cat,i){
          g.appendChild(el('div',null,cat.e+' '+cat.t));
          var ctl=el('div','wp-row');ctl.style.flexWrap='nowrap';
          var mi=btn('\u2212','gh sm',function(){L.alloc[i]=Math.max(0,L.alloc[i]-5);render()},'bud-minus');if(L.alloc[i]<=0)mi.disabled=true;
          var pi=btn('+','gh sm',function(){var s=L.alloc.reduce(function(a,x){return a+x},0);L.alloc[i]=Math.min(100,L.alloc[i]+Math.min(5,100-s));render()},'bud-plus');if(sum>=100)pi.disabled=true;
          ctl.appendChild(mi);ctl.appendChild(el('span','wp-coins',String(L.alloc[i])));ctl.appendChild(pi);g.appendChild(ctl);
          var hb=el('div','wp-hbar'),hi=el('i');hi.style.width=L.alloc[i]+'%';hb.appendChild(hi);g.appendChild(hb);
        });
        c.appendChild(g);
        var lk=btn(sum===100?'🔒 Lock in my coins':'Use exactly 100 coins ('+sum+')','big',function(){act({a:'bud',alloc:L.alloc.slice()})},'budlock');if(sum!==100)lk.disabled=true;
        c.appendChild(lk);
      }
      if(pl.budget)c.appendChild(btn('Cancel the rematch','gh sm',function(){act({a:'budCancel'})},'budcancel'));
    }else if(pl.budget){
      var b=pl.budget;
      c.appendChild(el('p','wp-sub','The coins are out! Here is how you each split 100, plus the compromise in the middle.'));
      var lg=el('div','wp-legend');
      [['#ff8fb0',nm('host')],['#8fd3ff',nm('guest')],['linear-gradient(90deg,#ffd76e,#ff9f1c)','Compromise']].forEach(function(x){var s=el('span'),i=el('i');i.style.background=x[0];s.appendChild(i);s.appendChild(document.createTextNode(x[1]));lg.appendChild(s)});
      c.appendChild(lg);
      var cm=el('div','wp-cmp'),tot=num(String(pl.budTotal||'').replace(/[^\d.]/g,''));
      BUD.forEach(function(cat,i){
        var l=el('div');l.appendChild(el('div',null,cat.e+' '+cat.t));l.appendChild(el('small','wp-hint',b.host[i]+' / '+b.guest[i]+' \u2192 '+b.avg[i]+(tot?' (~'+Math.round(tot*b.avg[i]/100)+')':'')));cm.appendChild(l);
        var bars=el('div','bars');var mx=50;
        [['h',b.host[i]],['g',b.guest[i]],['c',b.avg[i]]].forEach(function(x){var ii=el('i',x[0]);ii.style.width=Math.min(100,x[1]/mx*100)+'%';bars.appendChild(ii)});
        cm.appendChild(bars);
      });
      c.appendChild(cm);
      var tk=el('div','wp-card');tk.appendChild(el('h3',null,'🎙️ Commentary'));budgetTalk(b,nm).forEach(function(t){tk.appendChild(el('p',null,t))});c.appendChild(tk);
      var tr=el('div','wp-row');tr.appendChild(el('span','wp-sub','Total budget (optional):'));
      tr.appendChild(txtIn('budtotal',pl.budTotal,'e.g. 40000',20,function(v){act({a:'budTotal',v:v})}));c.appendChild(tr);
      c.appendChild(btn('⚔️ Battle again','gh',function(){act({a:'budRedo'})},'budredo'));
    }
    wrap.appendChild(c);wrap.appendChild(back());
  }

  /* --- timeline & checklist --- */
  function rTimeline(){
    var pl=V.plan,P=progress(pl);
    var c=el('div','wp-card');
    var hr=el('div','wp-row');hr.appendChild(ring(P.timeline,'📅'));var ht=el('div');ht.style.flex='1';ht.appendChild(el('h2','wp-foil','Timeline & Checklist'));ht.appendChild(el('div','wp-sub','Every ceremony, who owns it, and what is done.'));hr.appendChild(ht);c.appendChild(hr);
    var nu=nextUp(pl);
    if(nu){var n=el('div','wp-item hot');n.appendChild(el('div','wp-tag','Next up'));n.appendChild(el('div','it',nu.e+' '+nu.t+(pl.tl[nu.id]&&pl.tl[nu.id].date?' \u00b7 '+pl.tl[nu.id].date:'')));n.appendChild(el('div','ds',nu.d));c.appendChild(n)}
    var tabs=el('div','wp-tabs');
    tabs.appendChild(btn('📅 Ceremonies','wp-chip'+(L.tlTab==='ev'?' on':''),function(){L.tlTab='ev';render()},'tab-ev'));
    tabs.appendChild(btn('✅ Checklist','wp-chip'+(L.tlTab==='ck'?' on':''),function(){L.tlTab='ck';render()},'tab-ck'));
    c.appendChild(tabs);
    if(L.tlTab==='ev'){
      EVENTS.forEach(function(e){
        var x=pl.tl[e.id]||{d:'',date:'',own:'',notes:'',done:false};
        var row=el('div','wp-ev'+(x.done?' dn':'')+(x.d==='n'?' no':''));row.setAttribute('data-ev',e.id);
        var h=el('div','h');h.appendChild(el('b',null,e.e+' '+e.t));
        [['y','Doing it'],['m','Maybe'],['n','Skip']].forEach(function(o){h.appendChild(btn(o[1],'wp-chip'+(x.d===o[0]?' on':''),function(){act({a:'tl',id:e.id,f:'d',v:o[0]})},'tl-d'))});
        h.appendChild(btn(x.done?'✓ Done':'Done?','wp-chip dn'+(x.done?' on':''),function(){act({a:'tl',id:e.id,f:'done'})},'tl-done'));
        row.appendChild(h);row.appendChild(el('p',null,e.d));
        var f=el('div','wp-row');
        f.appendChild(txtIn('tl-date-'+e.id,x.date,'','',function(v){act({a:'tl',id:e.id,f:'date',v:v})},'date'));
        f.appendChild(selectOf('tl-own-'+e.id,x.own,OWN(),function(v){act({a:'tl',id:e.id,f:'own',v:v})}));
        var ni=txtIn('tl-notes-'+e.id,x.notes,'Notes\u2026',200,function(v){act({a:'tl',id:e.id,f:'notes',v:v})});ni.style.flex='1';f.appendChild(ni);
        row.appendChild(f);c.appendChild(row);
      });
    }else{
      var items=CHECK.concat(pl.ckCustom.map(function(z){return {id:z.id,e:'📌',t:z.t,custom:true}}));
      var dn=items.filter(function(i){return pl.ck[i.id]&&pl.ck[i.id].done}).length;
      c.appendChild(el('p','wp-sub',dn+' of '+items.length+' done'));
      var bar=el('div','wp-bar'),fi=el('i');fi.style.width=Math.round(dn/items.length*100)+'%';bar.appendChild(fi);c.appendChild(bar);
      items.forEach(function(it){
        var y=pl.ck[it.id]||{own:'',done:false},row=el('div','wp-ev'+(y.done?' dn':'')),h=el('div','h');
        h.appendChild(btn(y.done?'✓':'○','wp-chip dn'+(y.done?' on':''),function(){act({a:'ck',id:it.id,f:'done'})},'ck-done'));
        h.appendChild(el('b',null,it.e+' '+it.t));
        h.appendChild(selectOf('ck-own-'+it.id,y.own,OWN(),function(v){act({a:'ck',id:it.id,f:'own',v:v})}));
        if(it.custom)h.appendChild(btn('✕','wp-chip',function(){act({a:'ckDel',id:it.id})},'ck-del'));
        row.appendChild(h);c.appendChild(row);
      });
      var ci=txtIn('ck-new','','Add a to-do\u2026',80);
      c.appendChild(formOf([ci],'Add','mg',function(){var v=clean(draftVal('ck-new'),80);if(v)act({a:'ckAdd',t:v})},'ck-add'));
    }
    wrap.appendChild(c);wrap.appendChild(back());
  }

  /* --- colours --- */
  function swatchOrChip(s){
    if(/^#?[0-9a-f]{3}([0-9a-f]{3})?$/i.test(s)){var w=el('span','wp-sw');w.style.background=s.charAt(0)==='#'?s:'#'+s;w.title=s;return w}
    return el('span','wp-chip',s);
  }
  function colorBlock(data){
    var box=el('div');
    ['host','guest','couple'].forEach(function(k){
      var v=data[k];if(!v)return;
      var it=el('div','wp-item');it.appendChild(el('div','it',k==='couple'?'💞 Together':(k===me?'You':nm(k))));
      Object.keys(v).forEach(function(f){
        var r=el('div','wp-row');r.appendChild(el('small','wp-hint',f+':'));
        if(Array.isArray(v[f]))v[f].forEach(function(s){r.appendChild(swatchOrChip(s))});else r.appendChild(el('span',null,v[f]));
        it.appendChild(r);
      });
      box.appendChild(it);
    });
    return box;
  }
  function rColors(){
    var pl=V.plan,c=el('div','wp-card'),loc=localColor();
    c.appendChild(el('h2','wp-foil','🎨 Outfit Colours'));
    c.appendChild(el('p','wp-sub','Find the colours that make you both glow, then plan outfits for each function around them.'));
    if(pl.color){
      c.appendChild(colorBlock(pl.color));
      if(loc)c.appendChild(btn('↻ Refresh from this device','gh sm',function(){act({a:'color',data:loc})},'colorsync'));
    }else if(loc){
      c.appendChild(el('p','wp-sub','Found Color Lab results on this device.'));
      c.appendChild(btn('Add our Color Lab results to the plan','big',function(){act({a:'color',data:loc})},'colorsync'));
    }else{
      c.appendChild(el('div','wp-wait','No Color Lab results yet. Play Couple Color Lab together, then come back here!'));
    }
    var go=el('button','wp-b big mg','Open Couple Color Lab 🎨');go.type='button';go.setAttribute('data-game','colorlab');go.setAttribute('data-act','colorlab');
    c.appendChild(go);
    c.appendChild(el('p','wp-hint','This leaves the planner for both of you. Your plan is saved, so just come back afterwards.'));
    wrap.appendChild(c);wrap.appendChild(back());
  }

  /* --- sparkle showdown --- */
  function gemFace(g){
    var b=el('div');b.style.display='contents';
    if(g.ph){
      var url=phCache[g.ph];
      if(url){var im=document.createElement('img');im.src=url;im.alt='Inspiration';b.appendChild(im)}
      else b.innerHTML=gemSVG('#e6edf6','radiant');
      var idx=V.spk.photos.map(function(p){return p.id}).indexOf(g.ph);
      b.appendChild(el('small',null,'Inspo #'+(idx+1)));
    }else{
      b.innerHTML=gemSVG(GEMS[g.c].hex,CUTS[g.u].id);
      b.appendChild(el('small',null,GEMS[g.c].n+' \u00b7 '+CUTS[g.u].n));
    }
    return b;
  }
  function rSparkle(){
    var sp=V.spk,c=el('div','wp-card');
    c.appendChild(el('h2','wp-foil','Sparkle Showdown ✨'));
    c.appendChild(el('p','wp-sub','Jewellery & accents for our wedding looks. Pick the sparkle you love more in each match-up, plus a few quick style questions.'));
    if(!sp){wrap.appendChild(c);wrap.appendChild(back());return}
    if(sp.ph==='intro'){
      var hh=el('div','wp-hero');hh.appendChild(el('div','wp-mandala'));
      var gr=el('div','wp-row');gr.style.cssText='justify-content:center;position:relative';
      [[2,0],[7,3],[11,5]].forEach(function(x){var s=el('span');s.innerHTML=gemSVG(GEMS[x[0]].hex,CUTS[x[1]].id);gr.appendChild(s)});
      hh.appendChild(gr);c.appendChild(hh);
      c.appendChild(el('p','wp-sub','Round '+sp.r+'. Both of you play; there are no wrong answers. At the end you each get your sparkle style.'));
      var mine=sp.ready[me];
      var rb=btn(mine?'Waiting for '+nm(partner)+'\u2026':'I\u2019m ready ✨','big',function(){
        var pics=ls(ls(K_PIN)?K_PICS:'__none__')||[],ids=pics.map(function(p){return p.id}).slice(0,MAX_PICS);
        if(ids.length)sendPhotos(ids);
        act({a:'spkReady',photos:ids});
      },'spkready');if(mine)rb.disabled=true;
      c.appendChild(rb);
      if(sp.ready[partner]&&!mine)c.appendChild(el('p','wp-hint',nm(partner)+' is ready!'));
    }else if(sp.ph==='play'){
      var ans=sp.ans[me],n=sp.items.length,i=ans.length;
      if(i>=n){c.appendChild(el('div','wp-wait','Your picks are in! Waiting for '+nm(partner)+' ('+sp.ans[partner].length+'/'+n+')\u2026'))}
      else{
        var it=sp.items[i],key=sp.r+':'+i;if(!L.shown[key])L.shown[key]=Date.now();
        var ms=function(){return Date.now()-L.shown[key]};
        var pr=el('div','wp-row');pr.style.justifyContent='space-between';
        pr.appendChild(el('span','wp-pill',(i+1)+' / '+n));pr.appendChild(el('span','wp-pill',nm(partner)+': '+sp.ans[partner].length+'/'+n));c.appendChild(pr);
        var bar=el('div','wp-bar'),fi=el('i');fi.style.width=Math.round(i/n*100)+'%';bar.appendChild(fi);c.appendChild(bar);
        if(it.t==='p'){
          c.appendChild(el('h3',null,'This or that?'));
          var gg=el('div','wp-gems');
          [it.a,it.b].forEach(function(g,k){
            var b=el('button','wp-gem');b.type='button';b.setAttribute('data-act','gem-'+k);
            b.appendChild(gemFace(g));b.onclick=function(){if(!dead)act({a:'spkAns',r:sp.r,i:i,v:k,ms:ms()})};gg.appendChild(b);
          });
          c.appendChild(gg);
        }else{
          var q=SPQ[it.q];c.appendChild(el('h3',null,'Quick question'));c.appendChild(el('h2',null,q.q));
          if(q.o){
            var og=el('div','wp-row');
            q.o.forEach(function(o,k){og.appendChild(btn(o,'gh',function(){act({a:'spkAns',r:sp.r,i:i,v:k,ms:ms()})},'q-opt'))});
            c.appendChild(og);
          }else{
            var val=key in L.spkVal?L.spkVal[key]:50;
            var lr=el('div','wp-row');lr.style.justifyContent='space-between';lr.appendChild(el('small','wp-hint',q.r[0]));lr.appendChild(el('small','wp-hint',q.r[1]));c.appendChild(lr);
            var rg=el('input','wp-range');rg.type='range';rg.min='0';rg.max='100';rg.value=String(val);rg.setAttribute('data-name','rng-'+key);
            rg.addEventListener('input',function(){L.spkVal[key]=+rg.value});c.appendChild(rg);
            c.appendChild(btn('Lock it in','',function(){var v=key in L.spkVal?L.spkVal[key]:+rg.value;act({a:'spkAns',r:sp.r,i:i,v:Math.round(v),ms:ms()})},'q-range'));
          }
        }
      }
    }else{
      var hh2=el('div','wp-hero');hh2.appendChild(el('div','wp-mandala'));hh2.appendChild(el('p','wp-sub','Your sparkle style'));
      hh2.appendChild(el('div','wp-style wp-foil',V.style||'Still discovering your sparkle'));c.appendChild(hh2);
      c.appendChild(el('p','wp-sub','Use it for jewellery, dupatta embroidery, pagg pins and decor accents. The more rounds you play, the sharper it gets. ('+V.plan.spk.rounds+' round'+(V.plan.spk.rounds===1?'':'s')+' played)'));
      c.appendChild(btn('Play another round ✨','big',function(){act({a:'spkAgain'})},'spkagain'));
    }
    wrap.appendChild(c);wrap.appendChild(back());
  }

  /* --- summary --- */
  function rSummary(){
    var pl=V.plan,P=progress(pl),s=el('div','wp-card wp-sum wp-print');
    var hh=el('div','wp-hero');hh.appendChild(el('div','wp-mandala'));hh.appendChild(el('h1','wp-foil','Our Wedding Plan'));
    hh.appendChild(el('p',null,nm('host')+' & '+nm('guest')+(pl.date?' \u00b7 '+pl.date:'')));
    hh.appendChild(el('p','wp-sub',Math.round(P.total*100)+'% planned'));s.appendChild(hh);
    var tools=el('div','wp-row wp-noprint');tools.style.justifyContent='center';
    tools.appendChild(btn('🖨 Print','gh sm',function(){try{window.print()}catch(e){}},'print'));
    tools.appendChild(btn('⬇ .txt','gh sm',exportTxt,'exptxt'));tools.appendChild(btn('⬇ .json','gh sm',exportJson,'expjson'));
    s.appendChild(tools);
    var anyDeck=false;
    DECKS.forEach(function(d){
      var dk=pl.decks[d.id],st=Object.keys(dk.star),both=Object.keys(dk.res).filter(function(k){return dk.res[k]==='b'&&!(k in dk.star)});
      if(!st.length&&!both.length)return;anyDeck=true;
      s.appendChild(el('h2',null,d.e+' '+d.name));var ul=el('ul');
      st.forEach(function(k){var c=cardOf(pl,d.id,k);if(c)ul.appendChild(el('li',null,'⭐ '+c.e+' '+c.t+(dk.star[k]?' \u2014 '+dk.star[k]:'')))});
      both.forEach(function(k){var c=cardOf(pl,d.id,k);if(c)ul.appendChild(el('li',null,'💞 '+c.e+' '+c.t))});
      s.appendChild(ul);
    });
    if(!anyDeck){s.appendChild(el('h2',null,'🎉 Ideas'));s.appendChild(el('p','wp-sub','Swipe some decks to fill this in!'))}
    s.appendChild(el('h2',null,'🙏 Shabad'));var sv=pl.shabad;
    s.appendChild(el('p',null,!sv.vote.host||!sv.vote.guest?'Not decided yet.':(sv.vote.host==='n'&&sv.vote.guest==='n')?'We decided not to sing one together.':sv.pick?'Our pick: '+SHB[sv.pick].t+' (confirm with our Granthi Singh / raagi jatha)':'Still choosing'+(uniq(sv.short.host.concat(sv.short.guest)).length?': '+uniq(sv.short.host.concat(sv.short.guest)).map(function(id){return SHB[id].t}).join(', '):'.')));
    if(pl.gifts.length){s.appendChild(el('h2',null,'💐 Thank-yous & gifts'));var gu=el('ul');pl.gifts.forEach(function(g){gu.appendChild(el('li',null,(g.done?'✅ ':'⬜ ')+g.who+': '+g.what+(g.budget?' ('+g.budget+')':'')))});s.appendChild(gu)}
    if(pl.budget){s.appendChild(el('h2',null,'🪙 Budget compromise'));var bu=el('ul');BUD.forEach(function(c,i){bu.appendChild(el('li',null,c.e+' '+c.t+': '+pl.budget.avg[i]+'%'))});s.appendChild(bu)}
    var ev=EVENTS.filter(function(e){return pl.tl[e.id]&&pl.tl[e.id].d!=='n'&&pl.tl[e.id].d});
    if(ev.length){s.appendChild(el('h2',null,'📅 Our functions'));var eu=el('ul');ev.forEach(function(e){var x=pl.tl[e.id];eu.appendChild(el('li',null,(x.done?'✅ ':'⬜ ')+e.e+' '+e.t+(x.d==='m'?' (maybe)':'')+(x.date?' \u00b7 '+x.date:'')+(x.own?' \u00b7 '+nm(x.own):'')+(x.notes?' \u00b7 '+x.notes:'')))});s.appendChild(eu)}
    var items=CHECK.concat(pl.ckCustom.map(function(z){return {id:z.id,e:'📌',t:z.t}}));
    s.appendChild(el('h2',null,'✅ Checklist'));var cu=el('ul');
    items.forEach(function(it){var y=pl.ck[it.id];if(y&&(y.done||y.own))cu.appendChild(el('li',null,(y.done?'✅ ':'⬜ ')+it.e+' '+it.t+(y.own?' \u00b7 '+nm(y.own):'')))});
    if(!cu.children.length)cu.appendChild(el('li',null,'Nothing ticked off yet.'));s.appendChild(cu);
    if(pl.color){s.appendChild(el('h2',null,'🎨 Outfit colours'));s.appendChild(colorBlock(pl.color))}
    s.appendChild(el('h2',null,'✨ Sparkle Showdown'));
    s.appendChild(el('p',null,pl.spk.rounds+' round'+(pl.spk.rounds===1?'':'s')+' played'+(V.style?' \u00b7 Your sparkle style: '+V.style:'')));
    wrap.appendChild(s);wrap.appendChild(back());
  }

  /* =====================================================================
     PRIVATE PLANNER NOTES (only on a device with a PIN; never rendered otherwise)
     ===================================================================== */
  var secOpen=false;
  function openPin(){
    if(secOpen)return;
    var stored=ls(K_PIN),tries=0;
    secBox.innerHTML='';
    var o=el('div','wp-ov'),b=el('div','box');o.appendChild(b);secBox.appendChild(o);
    var cls=function(){secBox.innerHTML=''};
    o.addEventListener('click',function(e){if(e.target===o)cls()});
    b.appendChild(el('h2',null,'🔒'));
    var i1=el('input','wp-in');i1.type='password';i1.inputMode='numeric';i1.maxLength=4;i1.placeholder=stored?'PIN':'New 4-digit PIN';i1.autocomplete='off';i1.style.width='100%';
    b.appendChild(i1);
    var i2=null;if(!stored){i2=el('input','wp-in');i2.type='password';i2.inputMode='numeric';i2.maxLength=4;i2.placeholder='Repeat PIN';i2.autocomplete='off';i2.style.width='100%';b.appendChild(i2)}
    var go=function(){
      var p=i1.value.trim();
      if(!/^\d{4}$/.test(p)){b.classList.remove('wp-shake');void b.offsetWidth;b.classList.add('wp-shake');return}
      if(!stored){
        if(!i2||i2.value.trim()!==p){b.classList.remove('wp-shake');void b.offsetWidth;b.classList.add('wp-shake');return}
        var salt=Math.random().toString(36).slice(2,10);ls(K_PIN,{s:salt,h:pinHash(p,salt)});cls();openSecret();return;
      }
      if(pinHash(p,stored.s)===stored.h){cls();openSecret();return}
      tries++;i1.value='';b.classList.remove('wp-shake');void b.offsetWidth;b.classList.add('wp-shake');if(tries>=5)cls();
    };
    [i1,i2].forEach(function(x){if(x)x.addEventListener('keydown',function(e){if(e.key==='Enter')go();if(e.key==='Escape')cls()})});
    var r=el('div','wp-row');r.appendChild(btn('OK','',go));r.appendChild(btn('Cancel','gh',cls));b.appendChild(r);
    setTimeout(function(){try{i1.focus()}catch(e){}},30);
  }
  function recordNotes(){
    if(!V||!ls(K_PIN))return;
    var N=ls(K_NOTES)||{sessions:[]},dirty=false;
    if(!Array.isArray(N.sessions))N.sessions=[];
    (V.spkHist||[]).concat(V.spk?[V.spk]:[]).forEach(function(sp){if(sp&&sp.items&&sp.items.length&&recOne(N,sp))dirty=true});
    if(!dirty)return;
    if(N.sessions.length>60)N.sessions=N.sessions.slice(-60);
    ls(K_NOTES,N);
    if(secOpen)drawSecret();
  }
  function recOne(N,sp){
    var sid=ctx.seed+':'+sp.r;
    var rec={sid:sid,t:Date.now(),who:nm(partner),items:sp.items,mine:sp.ans[me],theirs:sp.ans[partner],photos:sp.photos.map(function(p){return p.id})};
    var ix=-1;N.sessions.forEach(function(s,i){if(s.sid===sid)ix=i});
    if(ix>=0){var old=N.sessions[ix];if(old.mine.length===rec.mine.length&&old.theirs.length===rec.theirs.length)return false;rec.t=old.t;N.sessions[ix]=rec}
    else N.sessions.push(rec);
    return true;
  }
  function notesData(){
    var N=ls(K_NOTES)||{sessions:[]},them=[],mine=[];
    (N.sessions||[]).forEach(function(s){them.push(collect(s.items,s.theirs));mine.push(collect(s.items,s.mine))});
    return {N:N,them:mergeCol(them),mine:mergeCol(mine)};
  }
  function gemName(id){for(var i=0;i<GEMS.length;i++)if(GEMS[i].id===id)return GEMS[i];return null}
  function rankRows(box,list,kind,pics){
    if(!list.length){box.appendChild(el('p','wp-sub','No data yet.'));return}
    var mx=Math.max.apply(null,list.map(function(x){return x.bt}));
    list.forEach(function(x,i){
      var row=el('div','wp-rk');row.appendChild(el('span',null,String(i+1)));
      var sw=el('span');
      var label=x.k;
      if(kind==='col'||/^c:/.test(x.k)){var g=gemName(x.k.replace(/^c:/,''));if(g){var s=el('span','wp-sw');s.style.background=g.hex;sw.appendChild(s);label=g.n+' ('+g.s+')'}}
      else if(kind==='cut'){var cu=CUTS.filter(function(c){return c.id===x.k})[0];label=cu?cu.n:x.k;sw.textContent='💠'}
      if(/^p:/.test(x.k)){var pid=x.k.slice(2),pp=pics.filter(function(p){return p.id===pid})[0];if(pp){var im=document.createElement('img');im.src=pp.url;im.style.cssText='width:28px;height:28px;object-fit:cover;border-radius:6px';sw.appendChild(im);label='📷 '+(pp.label||'Photo')}else label='📷 (photo removed)'}
      row.appendChild(sw);
      var t=el('div');t.appendChild(el('div',null,label));var bb=el('div','bb');bb.style.width=Math.round(x.bt/mx*100)+'%';t.appendChild(bb);row.appendChild(t);
      row.appendChild(el('small','wp-hint',x.w+'W '+x.l+'L \u00b7 '+x.elo));
      box.appendChild(row);
    });
  }
  function qSummary(box,q){
    if(!q.length){box.appendChild(el('p','wp-sub','No answers yet.'));return}
    var by={};q.forEach(function(x){(by[x.q]=by[x.q]||[]).push(x)});
    Object.keys(by).forEach(function(k){
      var Q=SPQ[k],arr=by[k],last=arr[arr.length-1];
      var txt=Q.o?Q.o[last.v]:(last.v+'/100 ('+(last.v<40?Q.r[0]:last.v>60?Q.r[1]:'in between')+')');
      var p=el('p',null,Q.q+' \u2192 ');p.appendChild(el('b',null,txt));p.appendChild(el('small','wp-hint',' \u00b7 '+(last.ms/1000).toFixed(1)+'s'+(arr.length>1?' \u00b7 answered '+arr.length+'x':'')));box.appendChild(p);
    });
  }
  function timeSummary(box,ms){
    if(!ms.length)return;
    var avg=ms.reduce(function(s,x){return s+x.ms},0)/ms.length;
    box.appendChild(el('p','wp-sub','Average decision time: '+(avg/1000).toFixed(1)+'s over '+ms.length+' match-ups.'));
    var fast=ms.filter(function(x){return x.ms<Math.min(1800,avg*.6)}).slice(-8);
    if(fast.length){
      box.appendChild(el('p','wp-sub','⚡ Instant picks (strong preference):'));
      var ul=el('ul');fast.forEach(function(x){ul.appendChild(el('li',null,keyName(x.w)+'  over  '+keyName(x.l)+' ('+(x.ms/1000).toFixed(1)+'s)'))});box.appendChild(ul);
    }
  }
  function keyName(k){
    if(/^p:/.test(k)){var pics=ls(K_PICS)||[],pp=pics.filter(function(p){return p.id===k.slice(2)})[0];return '📷 '+(pp&&pp.label||'Photo')}
    var m=/^g:(\d+):(\d+)$/.exec(k);if(m)return GEMS[+m[1]].n+' '+CUTS[+m[2]].n;return k;
  }
  function openSecret(){secOpen=true;recordNotes();drawSecret()}
  function closeSecret(){secOpen=false;secBox.innerHTML=''}
  function drawSecret(){
    if(!secOpen)return;
    var keepScroll=secBox.querySelector('.box');var sy=keepScroll?keepScroll.scrollTop:0;
    secBox.innerHTML='';
    var o=el('div','wp-ov'),b=el('div','box wide wp-sec');o.appendChild(b);secBox.appendChild(o);
    var hd=el('div','wp-row');var ht=el('h2','wp-foil','Planner notes 🔒');ht.style.flex='1';hd.appendChild(ht);hd.appendChild(btn('Close','gh sm',closeSecret));b.appendChild(hd);
    b.appendChild(el('p','wp-sub','Only on this device. Nothing here is ever shown on the other screen. Results come from Sparkle Showdown rounds played while this device had a PIN.'));
    var D=notesData(),pics=ls(K_PICS)||[];
    b.appendChild(el('p','wp-sub','Sessions recorded: '+D.N.sessions.length+' \u00b7 '+nm(partner)+'\u2019s match-ups: '+D.them.ms.length));
    b.appendChild(el('h3',null,'💖 '+nm(partner)+' \u2014 colour ranking'));rankRows(b,ranking(D.them.col),'col',pics);
    b.appendChild(el('h3',null,'💠 '+nm(partner)+' \u2014 shape ranking'));rankRows(b,ranking(D.them.cut),'cut',pics);
    if(D.them.all.some(function(m){return /^p:/.test(m[0])||/^p:/.test(m[1])})){b.appendChild(el('h3',null,'📷 '+nm(partner)+' \u2014 photos & colours combined'));rankRows(b,ranking(D.them.all),'all',pics)}
    b.appendChild(el('h3',null,'🎚️ '+nm(partner)+' \u2014 style answers'));qSummary(b,D.them.q);
    b.appendChild(el('h3',null,'⏱️ '+nm(partner)+' \u2014 decision times'));timeSummary(b,D.them.ms);
    var cmp=el('details');cmp.appendChild(el('summary','wp-sub','Your own picks, for comparison'));
    cmp.appendChild(el('h3',null,'Colours'));rankRows(cmp,ranking(D.mine.col).slice(0,8),'col',pics);
    cmp.appendChild(el('h3',null,'Shapes'));rankRows(cmp,ranking(D.mine.cut),'cut',pics);
    cmp.appendChild(el('h3',null,'Style answers'));qSummary(cmp,D.mine.q);b.appendChild(cmp);
    /* photos */
    b.appendChild(el('h3',null,'📷 Stone photos ('+pics.length+'/'+MAX_PICS+')'));
    b.appendChild(el('p','wp-sub','They are mixed into the next Sparkle Showdown round as \u201cInspo\u201d cards. Labels stay on this device.'));
    var th=el('div','wp-thumbs');
    pics.forEach(function(p){
      var d=el('div'),im=document.createElement('img');im.src=p.url;d.appendChild(im);
      var li=el('input','wp-in');li.value=p.label||'';li.placeholder='Label';li.maxLength=40;li.style.width='100%';
      li.addEventListener('change',function(){var all=ls(K_PICS)||[];all.forEach(function(x){if(x.id===p.id)x.label=clean(li.value,40)});ls(K_PICS,all)});
      d.appendChild(li);
      d.appendChild(btn('Remove','gh sm',function(){ls(K_PICS,(ls(K_PICS)||[]).filter(function(x){return x.id!==p.id}));drawSecret()}));
      th.appendChild(d);
    });
    b.appendChild(th);
    if(pics.length<MAX_PICS){
      var fi=el('input');fi.type='file';fi.accept='image/*';fi.multiple=true;fi.style.margin='8px 0';
      fi.onchange=function(){addPics(Array.prototype.slice.call(fi.files||[]))};b.appendChild(fi);
    }
    var r=el('div','wp-row');r.style.marginTop='12px';
    r.appendChild(btn('⬇ Download results','',function(){download('planner-notes.txt',secretText(),'text/plain')}));
    r.appendChild(btn('Clear recorded results','gh sm',function(e){if(b.getAttribute('data-c')==='1'){ls(K_NOTES,null);drawSecret()}else{b.setAttribute('data-c','1');e.currentTarget.textContent='Tap again to clear'}}));
    r.appendChild(btn('Remove PIN & all notes','gh sm',function(e){if(b.getAttribute('data-r')==='1'){ls(K_NOTES,null);ls(K_PICS,null);ls(K_PIN,null);closeSecret()}else{b.setAttribute('data-r','1');e.currentTarget.textContent='Tap again to remove everything'}}));
    r.appendChild(btn('Lock & close','gh sm',closeSecret));
    b.appendChild(r);
    var nb=secBox.querySelector('.box');if(nb)nb.scrollTop=sy;
  }
  function addPics(files){
    var pics=ls(K_PICS)||[];
    files=files.filter(function(f){return /^image\//.test(f.type)}).slice(0,Math.max(0,MAX_PICS-pics.length));
    var left=files.length;if(!left)return;
    files.forEach(function(f){
      var fr=new FileReader();
      fr.onload=function(){
        var im=new Image();
        im.onload=function(){
          try{
            var s=Math.min(1,600/Math.max(im.width,im.height)),cv=document.createElement('canvas');cv.width=Math.round(im.width*s);cv.height=Math.round(im.height*s);
            cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);
            var url=cv.toDataURL('image/jpeg',0.8),all=ls(K_PICS)||[];
            if(all.length<MAX_PICS){all.push({id:'q'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),url:url,label:clean(f.name.replace(/\.[^.]+$/,''),40),t:Date.now()});if(!ls(K_PICS,all))alertBox('Storage is full. Remove a photo and try again.')}
          }catch(e){}
          if(--left===0)drawSecret();
        };
        im.onerror=function(){if(--left===0)drawSecret()};
        im.src=String(fr.result);
      };
      fr.readAsDataURL(f);
    });
  }
  function alertBox(t){var p=secBox.querySelector('.box');if(p)p.insertBefore(el('p','wp-hint',t),p.firstChild)}
  function secretText(){
    var D=notesData(),pics=ls(K_PICS)||[],o=['PLANNER NOTES','Exported '+new Date().toString(),'Partner: '+nm(partner),'Sessions: '+D.N.sessions.length,''];
    var dump=function(title,list,fmt){o.push('== '+title+' ==');if(!list.length)o.push('  (no data)');list.forEach(function(x,i){o.push('  '+(i+1)+'. '+fmt(x.k)+'  ['+x.w+'W '+x.l+'L, elo '+x.elo+', bt '+x.bt.toFixed(2)+']')});o.push('')};
    var col=function(k){var g=gemName(k.replace(/^c:/,''));if(g)return g.n+' ('+g.s+')';if(/^p:/.test(k)){var pp=pics.filter(function(p){return p.id===k.slice(2)})[0];return 'Photo: '+(pp&&pp.label||k)}return k};
    var cut=function(k){var c=CUTS.filter(function(x){return x.id===k})[0];return c?c.n:k};
    [['PARTNER',D.them],['ME',D.mine]].forEach(function(z){
      dump(z[0]+' - COLOURS',ranking(z[1].col),col);dump(z[0]+' - SHAPES',ranking(z[1].cut),cut);
      if(z[1].all.length)dump(z[0]+' - PHOTOS & COLOURS',ranking(z[1].all),col);
      o.push('== '+z[0]+' - STYLE ANSWERS ==');
      z[1].q.forEach(function(x){var Q=SPQ[x.q];o.push('  '+Q.q+' -> '+(Q.o?Q.o[x.v]:x.v+'/100 ('+Q.r[0]+' 0 .. 100 '+Q.r[1]+')')+'  ['+(x.ms/1000).toFixed(1)+'s]')});
      o.push('','== '+z[0]+' - EVERY MATCH-UP ==');
      z[1].ms.forEach(function(x){o.push('  '+keyName(x.w)+' > '+keyName(x.l)+'  ['+(x.ms/1000).toFixed(1)+'s]')});o.push('');
    });
    o.push('RAW JSON');o.push(JSON.stringify(D.N));
    return o.join('\n');
  }

  /* --- keyboard for swiping --- */
  function onKey(e){
    if(dead||!V||V.at!=='deck'||!V.deck||V.deck.ph!=='swipe'||e.ctrlKey||e.metaKey||e.altKey||secOpen||ovBox.firstChild)return;
    var t=e.target;if(t&&t.tagName&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))return;
    var D=V.deck,i=D.mine.length;if(i>=D.cards.length)return;
    var k=(e.key||'').toLowerCase(),m={l:'y',arrowright:'y',m:'m',arrowup:'m',n:'n',arrowleft:'n'}[k];
    if(m){e.preventDefault();act({a:'sw',b:D.b,i:i,v:m})}
    else if(k==='u'){e.preventDefault();act({a:'undo',b:D.b})}
  }
  document.addEventListener('keydown',onKey);

  /* --- incoming --- */
  function onMsg(d){
    if(dead||!d||typeof d!=='object')return;
    if(d.k==='ph'){if(typeof d.id==='string'&&typeof d.url==='string'&&/^data:image\//.test(d.url)&&d.url.length<900000){phCache[d.id]=d.url;if(V&&V.at==='sparkle')render()}return}
    if(isHost){
      if(d.k==='a')hostDo('guest',d.a);
      else if(d.k==='hi'){
        var changed=false;
        if(core.S.plan.updated===0&&d.plan&&typeof d.plan==='object'&&num(d.plan.updated)>0){core.S.plan=sanitizePlan(d.plan);core.S.bud.open=!core.S.plan.budget;changed=true}
        if(!core.S.plan.color&&d.color){var cd=sanitizeColor(d.color);if(cd){core.S.plan.color=cd;changed=true}}
        if(changed){core.S.q++;savePlan(core.S.plan);V=core.view('host');onView()}
        bcast();
      }
    }else if(d.k==='s'){
      if(typeof d.q!=='number'||d.q<=lastQ||!d.v)return;
      lastQ=d.q;V=d.v;
      if(hiTimer){clearInterval(hiTimer);hiTimer=null}
      savePlan(V.plan);onView();
    }
  }

  /* --- boot --- */
  if(isHost){
    core=makeCore(ctx.seed,loadPlan(),ctx.rng||rngF);
    var lc=localColor();if(lc)core.S.plan.color=lc;
    V=core.view('host');render();lastFx=V.fx;bcast();
  }else{
    render();
    var hi=function(){ctx.send({k:'hi',plan:loadPlan(),color:localColor()})};hi();
    hiTimer=setInterval(function(){if(dead||V){clearInterval(hiTimer);hiTimer=null;return}hi()},2000);
  }
  return {
    onMsg:onMsg,
    destroy:function(){dead=true;document.removeEventListener('keydown',onKey);if(hiTimer)clearInterval(hiTimer);timers.forEach(clearTimeout);secBox.innerHTML='';ovBox.innerHTML=''},
    _core:core
  };
}

registerGame({
  id:'wedding',icon:'💍',name:'Wedding Planner',
  blurb:'Plan the big day together: swipe ideas for every function, pick a shabad, budget battle, timeline, outfit colours and more.',
  start:GAME_START,
  _t:{DECKS:DECKS,DK:DK,SHABADS:SHABADS,EVENTS:EVENTS,CHECK:CHECK,BUD:BUD,GEMS:GEMS,CUTS:CUTS,SPQ:SPQ,defaultPlan:defaultPlan,sanitizePlan:sanitizePlan,planText:planText,
    elo:elo,bt:bt,ranking:ranking,spkItems:spkItems,collect:collect,styleText:styleText,makeCore:makeCore,progress:progress,compromise:compromise,nextBatch:nextBatch,overlaps:overlaps,cardOf:cardOf,rngF:rngF,gemSVG:gemSVG,validSpk:validSpk}
});
})();
