import type { ServiceType, SportType } from "@/types/store";

/**
 * What a guide is about, expressed in the same vocabulary stores use.
 * Reusing SportType/ServiceType (rather than free-text tags) means a guide
 * can be matched against a store's own services and sports, and a typo or a
 * renamed service breaks the build instead of silently killing the match.
 */
export type GuideTopic = SportType | ServiceType;

export interface Guide {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  /**
   * The one thing this guide is chiefly about, if it has one. General-interest
   * guides leave it undefined. Must also appear in `topics`; it is not a
   * separate tag, just a pointer at which topic is the subject rather than a
   * supporting mention.
   */
  primaryTopic?: GuideTopic;
  topics: GuideTopic[];
  sections: { heading: string; content: string }[];
}

export const GUIDES: Guide[] = [
  {
    slug: "how-to-choose-ski-rental-shop",
    title: "How to Choose a Ski Rental Shop",
    description:
      "A practical guide to finding the right ski rental shop for your next trip. Learn what to look for in equipment quality, pricing, location, and service.",
    publishedAt: "2026-03-20",
    primaryTopic: "rentals",
    topics: ["rentals", "skiing", "snowboarding"],
    sections: [
      {
        heading: "Why Your Rental Shop Choice Matters",
        content:
          "The ski rental shop you choose can make or break your day on the mountain. A good shop ensures properly fitted boots, well-maintained skis, and quick service so you spend more time on the slopes. A bad one leaves you with blisters, chattering skis, and wasted vacation time standing in line.",
      },
      {
        heading: "Location: Convenience vs. Price",
        content:
          "Shops at the base of the ski area charge a premium for convenience — you can walk straight to the lifts. Town-based shops further from the slopes are typically 20-30% cheaper and often have better selection. If you have a car or shuttle access, the savings add up quickly over a multi-day rental. Consider shops that offer overnight storage at the base area, giving you the best of both worlds.",
      },
      {
        heading: "Equipment Quality and Maintenance",
        content:
          "Ask when the skis were last tuned and waxed. Quality shops tune their fleet regularly — look for shops that advertise hot-wax service and edge sharpening as part of their rental process. Avoid shops where the bases look dried out or edges are visibly rusty. Demo-level equipment (current-season models) costs more but delivers a noticeably better experience, especially for intermediate to advanced skiers.",
      },
      {
        heading: "Boot Fitting: The Most Important Factor",
        content:
          "Boots account for 80% of your comfort and control. A good rental shop spends time fitting boots properly — they should feel snug but not painful, with no heel lift when you flex forward. Shops with dedicated boot-fitting specialists or heat-moldable liners are worth the extra cost. If a shop hands you boots without asking about your ability level, foot shape, or any problem areas, walk out.",
      },
      {
        heading: "Pricing: What to Expect",
        content:
          "Standard adult ski packages (skis, boots, poles) typically range from $30-60/day at resort-area shops and $20-40/day in town. Multi-day rentals always offer better per-day rates. Online pre-booking often saves 10-20% compared to walk-in prices. Watch for hidden charges: some shops charge extra for helmet rental, damage waiver, or late returns.",
      },
      {
        heading: "Read Reviews and Check Ratings",
        content:
          "Before committing, check Google reviews and the shop's WinterStores Score. Pay attention to recent reviews mentioning wait times, equipment condition, and staff helpfulness. A shop with 4.5 stars and hundreds of reviews is a safer bet than one with 5 stars and only three reviews. Use WinterStores to compare multiple shops in the same area side by side.",
      },
    ],
  },
  {
    slug: "boot-fitting-guide",
    title: "What to Look for in a Ski Boot Fitting",
    description:
      "Everything you need to know about getting a proper ski boot fitting. From shell sizing to custom insoles, this guide helps you find the perfect fit.",
    publishedAt: "2026-03-22",
    primaryTopic: "boot-fitting",
    topics: ["boot-fitting", "custom-fitting", "skiing"],
    sections: [
      {
        heading: "Why Boot Fitting Matters More Than Skis",
        content:
          "You can have the best skis in the world, but if your boots don't fit, you won't be able to control them. Ski boots are the direct connection between your body and your equipment. A proper fit means better control, less fatigue, warmer feet, and no pain. Most skiing discomfort — shin bang, numb toes, heel blisters — comes from poorly fitted boots, not from the mountain.",
      },
      {
        heading: "Shell Sizing: The Foundation",
        content:
          "A proper fitting starts with shell sizing. The fitter removes the liner and has you step into the bare shell. Your toes should lightly touch the front when standing upright. When you flex forward into a ski stance, your toes should pull back slightly — about one finger's width of space behind your heel. If the shop skips this step and just asks your shoe size, they're not doing a real fitting.",
      },
      {
        heading: "Flex Rating: Match It to Your Skiing",
        content:
          "Flex rating measures how stiff the boot is. Beginners need a softer flex (60-80) for comfort and easy turn initiation. Intermediate skiers do well with 80-100. Advanced and expert skiers want 100-130 for precision and response. Your weight matters too — heavier skiers generally need a stiffer flex. A good fitter considers both your ability and body type.",
      },
      {
        heading: "Custom Insoles and Footbeds",
        content:
          "The stock insoles that come with rental or new boots are flat and generic. Custom footbeds support your arch, align your ankle, and dramatically improve fit and performance. They range from $40 for heat-moldable options to $200+ for fully custom orthotic footbeds. If you ski more than a few days per year, custom footbeds are the single best upgrade you can make.",
      },
      {
        heading: "Heat Molding and Shell Modifications",
        content:
          "Modern boot liners can be heat-molded to match your foot shape. The process takes 10-15 minutes and makes a huge difference in comfort. For persistent pressure points, a skilled fitter can also punch out or grind the boot shell itself. Look for shops that advertise boot-fitting services with a heated liner oven — this is standard at quality shops.",
      },
      {
        heading: "Red Flags in a Boot Fitting",
        content:
          "Be cautious if the fitter: doesn't measure both feet (they're usually different sizes), doesn't ask about your skiing ability, suggests a boot based only on color or brand preference, rushes the process in under 10 minutes, or doesn't have you walk around and flex in the boots before finalizing. A good fitting takes 20-45 minutes. Your feet deserve the time.",
      },
    ],
  },
  {
    slug: "renting-vs-buying-ski-equipment",
    title: "Renting vs. Buying Ski Equipment: Which Is Right for You?",
    description:
      "Should you rent or buy your ski gear? A cost breakdown and practical comparison to help you decide based on how often you ski and your experience level.",
    publishedAt: "2026-03-25",
    primaryTopic: "used-gear",
    topics: ["rentals", "used-gear", "skiing"],
    sections: [
      {
        heading: "The Break-Even Point",
        content:
          "The math is straightforward. A quality ski package (skis, bindings, boots, poles) costs $800-1,500 for mid-range gear. Rental averages $40-60/day at resort shops. If you ski 7-10 days per season, buying starts to make financial sense within 2-3 seasons. Below that, renting is almost always cheaper — especially when you factor in storage, maintenance, and travel costs for your own gear.",
      },
      {
        heading: "When Renting Makes Sense",
        content:
          "Rent if you ski fewer than 7 days per year, are still improving rapidly (your ideal equipment changes as you progress), travel by air frequently (avoiding bag fees and hassle), want to try different ski types without committing, or are skiing with kids who outgrow gear every season. Renting also lets you ski different equipment for different conditions — powder skis one day, carving skis the next.",
      },
      {
        heading: "When Buying Makes Sense",
        content:
          "Buy if you ski 10+ days per season, have a consistent ability level, drive to the mountain (no airline gear fees), want equipment perfectly tuned to your preferences, or are tired of rental shop lines on busy mornings. Owning your boots is especially worthwhile — a custom-fitted boot that you've broken in will always outperform a rental boot, even a good one.",
      },
      {
        heading: "The Hybrid Approach: Own Boots, Rent Skis",
        content:
          "Many experienced skiers own their boots but rent skis. Boots are personal — fit matters enormously and doesn't change year to year. Skis, however, are bulky to travel with, expensive to maintain, and technology evolves. Renting demo-level skis lets you always ride current models without the depreciation. This approach gives you the best comfort with the most flexibility.",
      },
      {
        heading: "Hidden Costs of Ownership",
        content:
          "Beyond the purchase price, owning gear means: annual tuning and waxing ($40-80/season), binding checks and DIN adjustments ($20-40), boot sole replacement every few years ($50-100), storage space, travel bags ($80-150), and airline gear fees ($35-75 each way). These add $150-400/year to the true cost of ownership. Factor them into your break-even calculation.",
      },
      {
        heading: "Buying Smart: Where to Save",
        content:
          "End-of-season sales (March-April) offer 30-50% off current models. Previous-year models at the start of the season are another sweet spot. Demo sales at ski shops — where they sell off their rental fleet — offer well-maintained gear at steep discounts. For boots specifically, never buy online without trying them on. The savings aren't worth the fit risk. Find a shop with a good boot fitter and buy there, even if it costs slightly more.",
      },
    ],
  },
  {
    slug: "ski-gear-checklist",
    title: "Essential Ski Gear Checklist: What You Need for Your First Season",
    description:
      "A complete checklist of ski gear for beginners. Know exactly what to buy, what to rent, and what to skip so you stay warm, safe, and within budget.",
    publishedAt: "2026-03-28",
    topics: ["skiing", "snowboarding", "rentals"],
    sections: [
      {
        heading: "Base Layers: Your First Line of Defense",
        content:
          "Start with moisture-wicking base layers made from merino wool or synthetic fabric. Cotton is the worst choice — it absorbs sweat and leaves you cold. You need a top and bottom layer that fits snugly without restricting movement. Expect to spend $40-80 for a quality set. One good base layer set is enough for your first season — you can wash it between ski days.",
      },
      {
        heading: "Ski Jacket and Pants",
        content:
          "Look for waterproof and breathable outerwear rated at least 10,000mm waterproofing and 10,000g breathability. Insulated jackets are simpler for beginners — no need to layer a separate mid-layer. Key features to look for: powder skirt, wrist gaiters, pit zips for ventilation, and plenty of pockets. Budget $150-300 for a jacket and $100-200 for pants. End-of-season sales can cut these prices in half.",
      },
      {
        heading: "Helmet: Non-Negotiable Safety Gear",
        content:
          "Always wear a helmet. Modern ski helmets are lightweight, warm, and comfortable — there is no good reason to skip one. Make sure it fits snugly without pressure points and is compatible with your goggles (no gap between the helmet brim and goggle frame). Budget $60-120 for a solid helmet with adjustable venting. Replace it after any significant impact, even if there is no visible damage.",
      },
      {
        heading: "Goggles: See the Mountain Clearly",
        content:
          "Goggles protect your eyes from wind, snow, and UV radiation at altitude. For your first pair, choose a lens with good all-conditions visibility — a mid-tone amber or rose lens works in both sunny and overcast conditions. Anti-fog coating and double-pane lenses are worth the upgrade. Budget $50-100. Make sure they seal comfortably against your face and fit under your helmet brim.",
      },
      {
        heading: "Gloves and Socks",
        content:
          "Waterproof insulated gloves with a long cuff keep snow from getting in. Mittens are warmer than gloves if you run cold. Budget $40-80. For socks, buy ski-specific socks that are thin, moisture-wicking, and reach mid-calf. Thick socks actually make your feet colder by reducing circulation inside the boot. One or two pairs of quality ski socks ($15-25 each) will last for years.",
      },
      {
        heading: "Boots, Skis, and Poles: Rent These First",
        content:
          "For your first season, rent your boots, skis, and poles. Rental lets you try different equipment as your skills develop, avoids a large upfront cost, and saves you from traveling with bulky gear. Use WinterStores to find well-reviewed rental shops near your resort. Once you know your ability level and preferences after a season or two, then consider buying — starting with boots, which benefit most from a custom fit.",
      },
      {
        heading: "What to Skip Your First Season",
        content:
          "You do not need: a backpack (use jacket pockets), hand and toe warmers (unless you get cold easily), neck warmers or balaclavas (a simple buff works), expensive name-brand everything (performance matters more than labels), or a GoPro (focus on learning, not filming). Keep your first-season investment focused on the essentials. You can always add accessories as you figure out what you actually need on the mountain.",
      },
    ],
  },
  {
    slug: "first-ski-trip-guide",
    title: "First Ski Trip Planning Guide: Everything You Need to Know",
    description:
      "Planning your first ski trip? This step-by-step guide covers choosing a resort, booking, lessons, gear, packing, and budgeting so nothing catches you off guard.",
    publishedAt: "2026-03-30",
    primaryTopic: "lessons",
    topics: ["lessons", "rentals", "skiing"],
    sections: [
      {
        heading: "Choosing the Right Resort",
        content:
          "For your first trip, pick a resort known for beginner terrain and good ski schools. Look for resorts with a high percentage of green (easy) runs, gentle learning areas separate from main traffic, and a reputation for quality instruction. Smaller resorts are often better for beginners — shorter lift lines, less intimidating, and cheaper. Avoid resorts famous for expert terrain unless they also have a dedicated beginner zone.",
      },
      {
        heading: "When to Book and When to Go",
        content:
          "Book accommodation 2-3 months in advance for the best rates. The cheapest times to ski are early season (December before holidays) and late season (March-April). Avoid Christmas week, Presidents Day weekend, and school holidays — prices double and crowds triple. Midweek skiing (Tuesday-Thursday) offers the shortest lift lines and often lower accommodation rates. A 3-4 day trip is ideal for a first visit.",
      },
      {
        heading: "Lessons: Invest in at Least One Day",
        content:
          "Take a lesson your first day, even if a friend offers to teach you. Professional instructors know how to build proper technique from the start, and learning bad habits early is hard to undo later. Group lessons are cost-effective ($60-120/day) and let you learn alongside others at your level. Private lessons ($300-600/day) are worth it if you want faster progress or have specific anxieties about learning. Book lessons in advance as popular time slots fill up.",
      },
      {
        heading: "Gear: What to Rent vs. Bring",
        content:
          "Rent skis, boots, and poles from a shop near the resort. Bring your own outerwear (jacket, pants, base layers), helmet, goggles, gloves, and ski socks. Pre-book your rentals online to save 10-20% and skip the morning line. Pick up your gear the evening before your first ski day if the shop allows it. Use WinterStores to compare rental shops by rating, services, and price level before you arrive.",
      },
      {
        heading: "What to Pack",
        content:
          "Beyond ski-specific gear, pack: sunscreen (SPF 30+ — the sun is intense at altitude), lip balm with SPF, a small backpack for the car, snacks and water for the mountain, comfortable shoes for evenings, casual warm clothing for after skiing, any personal medications, and your health insurance card. Leave valuables at home or in the hotel safe — do not bring expensive jewelry or electronics to the slopes.",
      },
      {
        heading: "Budget Breakdown for a 3-Day Trip",
        content:
          "For two people sharing costs on a 3-day trip: lift tickets $150-300/person, gear rental $90-150/person, one group lesson $60-120/person, accommodation $150-400/night (split), food $40-80/day/person, travel varies by distance. Total budget estimate: $800-1,500 per person for a weekend trip, $1,200-2,500 for a full week. The biggest variable is accommodation — staying in a nearby town rather than at the resort base can save 30-50%.",
      },
      {
        heading: "Common First-Timer Mistakes",
        content:
          "Avoid these: skipping lessons to save money (you will waste the day falling), wearing cotton base layers (you will be cold and wet), not applying sunscreen (altitude sunburn is real), trying to keep up with experienced friends (ski at your own pace), not staying hydrated (altitude and cold mask dehydration), and buying a full-week lift pass before knowing if you like skiing (start with a 2-3 day pass).",
      },
    ],
  },
  {
    slug: "best-ski-resorts-beginners",
    title: "Best Ski Resorts for Beginners in 2026",
    description:
      "The top beginner-friendly ski resorts in the US, Europe, and Japan. Chosen for gentle terrain, quality ski schools, and welcoming atmospheres for first-timers.",
    publishedAt: "2026-04-01",
    primaryTopic: "lessons",
    topics: ["lessons", "skiing", "snowboarding"],
    sections: [
      {
        heading: "What Makes a Resort Beginner-Friendly",
        content:
          "The best resorts for beginners share a few traits: a large proportion of green and blue runs, dedicated learning zones away from fast traffic, highly rated ski schools with small class sizes, gentle and wide groomed trails for building confidence, easy-to-navigate lift systems (gondolas and magic carpets rather than steep chairlifts), and affordable beginner-specific packages that bundle lessons, lifts, and rentals.",
      },
      {
        heading: "Top US Resorts for Beginners",
        content:
          "Deer Valley, Utah stands out for its groomed-to-perfection trails and no-snowboard policy that keeps slopes calmer. Keystone, Colorado offers a huge learning area and night skiing to extend your practice time. Bretton Woods, New Hampshire is the largest ski area in the eastern US with wide, gentle cruisers. Northstar at Tahoe, California has an excellent ski school and a separate beginner zone at mid-mountain. All four have strong rental shop options — check WinterStores for the best-rated shops near each.",
      },
      {
        heading: "Top European Resorts for Beginners",
        content:
          "Obergurgl, Austria is a high-altitude, snow-sure resort with gentle slopes and very few crowds. Avoriaz, France (part of the Portes du Soleil) has an excellent ski school area and a car-free village. Cervinia, Italy sits beneath the Matterhorn and offers some of the longest, widest beginner runs in the Alps. Soldeu, Andorra (Grandvalira) combines great instruction, duty-free shopping, and lower prices than the big Alpine resorts.",
      },
      {
        heading: "Top Japanese Resorts for Beginners",
        content:
          "Niseko, Hokkaido is famous for powder snow but also has excellent beginner terrain and English-speaking instructors. Hakuba Goryu, Nagano has a gentle lower mountain perfect for first-timers, plus stunning views. Furano, Hokkaido offers uncrowded slopes, quality ski schools, and some of the lightest snow on Earth. Japanese resorts in general offer exceptional value — lift tickets, food, and accommodation cost far less than comparable European resorts.",
      },
      {
        heading: "Ski School Quality: What to Look For",
        content:
          "A good ski school makes all the difference for beginners. Look for schools with certified instructors (PSIA in the US, BASI in the UK, ESF or ESI in France), small class sizes (6-8 students maximum), and progression-based programs. Many resorts offer multi-day beginner packages where the same instructor takes you from your first day to your first blue run. Read recent reviews to gauge instructor quality — a resort's ski school can change significantly from year to year.",
      },
      {
        heading: "Family-Friendly Features",
        content:
          "If you are bringing kids or mixed-ability groups, look for: kids' clubs and childcare options, family-specific lesson packages, easy village layouts where beginners and advanced skiers can meet for lunch, on-mountain restaurants with views (so non-skiers can enjoy the day too), and sledding, tubing, or snowshoeing alternatives for rest days. The best beginner resorts make the whole experience enjoyable — not just the skiing itself.",
      },
    ],
  },
  {
    slug: "how-to-wax-tune-skis",
    title: "How to Wax and Tune Your Skis at Home",
    description:
      "A step-by-step guide to waxing and tuning your skis at home. Save money, improve performance, and learn when it is better to let a shop handle it.",
    publishedAt: "2026-04-02",
    primaryTopic: "waxing",
    topics: ["waxing", "repairs", "skiing"],
    sections: [
      {
        heading: "Why Waxing Matters",
        content:
          "Wax reduces friction between your ski base and the snow, making you faster and improving control. Un-waxed skis feel sticky and sluggish, especially in wet or warm snow. Fresh wax also protects the base material from drying out and oxidizing. How often you need to wax depends on how much you ski — every 3-5 days of skiing is a good rule of thumb. You can tell your skis need wax when the bases look chalky white instead of a consistent dark color.",
      },
      {
        heading: "Tools You Will Need",
        content:
          "For a basic home wax setup you need: an iron (a dedicated wax iron is best, but an old household iron set to low works in a pinch — never use it for clothes again), all-temperature ski wax ($10-15 per bar), a plastic scraper ($5-10), a nylon brush ($10-15), a sturdy table or workbench, and ski vises or clamps to hold the ski steady. The total startup cost is $40-70. A wax kit bundle often saves money over buying pieces separately.",
      },
      {
        heading: "Hot Wax Step-by-Step",
        content:
          "Clamp the ski base-up and clean any dirt with a nylon brush. Set your iron to the temperature recommended on the wax bar (usually 120-140 degrees Celsius). Hold the wax against the iron and drip it along the base in a zigzag pattern. Then glide the iron slowly from tip to tail, spreading the wax into a thin, even layer. Keep the iron moving — never let it sit in one spot, as this can damage the base. Let the wax cool completely (20-30 minutes). Scrape off the excess with the plastic scraper, working tip to tail. Finish by brushing tip to tail with the nylon brush to expose the base structure.",
      },
      {
        heading: "Edge Tuning Basics",
        content:
          "Sharp edges grip on hard snow and ice. For basic edge maintenance, you need a diamond stone or edge file and an edge guide set to 88-89 degrees for the side edge. Hold the guide against the edge and run the file along it in smooth strokes from tip to tail. Remove any burrs with a gummy stone. Side-edge tuning is manageable at home with practice. Base-edge tuning (the angle of the edge on the bottom of the ski) is more precise and is better left to a shop — an incorrect base-edge angle can ruin your ski's handling.",
      },
      {
        heading: "When to Take Your Skis to a Shop",
        content:
          "Some jobs require professional equipment: deep base scratches or gouges that need P-Tex repair, base grinding to flatten a warped or concave base, significant edge damage or rust, binding mounting or adjustment (always have this done by a certified technician), and end-of-season stone grinding to reset the base structure. A full shop tune typically costs $40-80 and is worth it once or twice per season. Use WinterStores to find shops near you that offer tuning services.",
      },
      {
        heading: "Seasonal Maintenance Schedule",
        content:
          "Before the season: full shop tune with stone grind and edge sharpening. During the season: hot wax every 3-5 days of skiing, quick edge touch-up every 5-7 days. End of season: clean and hot wax the bases with a thick storage coat (do not scrape — leave the wax on to protect during summer). Store skis in a cool, dry place with bindings released. This routine keeps your equipment performing well for years and reduces long-term repair costs.",
      },
    ],
  },
  {
    slug: "ski-trip-budget-guide",
    title: "Ski Trip Budget Guide: How Much Does a Ski Vacation Really Cost?",
    description:
      "A realistic cost breakdown for ski vacations at every budget level. Learn where the money goes and practical tips to save without sacrificing the experience.",
    publishedAt: "2026-04-03",
    topics: ["rentals", "storage", "skiing"],
    sections: [
      {
        heading: "Lift Tickets: The Biggest Daily Expense",
        content:
          "Single-day lift tickets at major resorts range from $80-250 depending on the resort and time of year. Multi-day passes save 10-20% per day. Season passes like Ikon ($950-1,050) and Epic ($910-1,040) pay for themselves in 4-6 days of skiing and include access to dozens of resorts. If you plan to ski 5+ days this season, a season pass is almost always the best deal. Smaller independent resorts offer tickets for $40-80, which is a great budget option for beginners who do not need massive terrain.",
      },
      {
        heading: "Accommodation: Where You Stay Defines Your Budget",
        content:
          "Slopeside hotels at major resorts can run $300-800/night. Staying in a nearby town (10-20 minutes drive) cuts that to $100-250/night. Vacation rentals split between a group of friends can bring per-person costs down to $30-70/night. Hostels near ski towns in Europe and Japan offer dorm beds for $25-50/night. The sweet spot for most travelers is a rental property in a nearby town with a kitchen — cooking breakfast and lunch saves $30-50/day per person compared to eating everything on the mountain.",
      },
      {
        heading: "Gear Rental and Equipment",
        content:
          "Standard ski rental packages (skis, boots, poles) cost $30-60/day at resort shops and $20-40/day at town shops. Demo or premium packages run $50-90/day. Helmet rental adds $8-15/day. Pre-booking online saves 10-20%. For a 5-day trip, budget $150-300 per person for rental gear. If you own your gear, factor in travel costs — airline ski bag fees are $35-75 each way on most carriers. Driving eliminates this entirely.",
      },
      {
        heading: "Food and Drink",
        content:
          "On-mountain dining is expensive — a burger and drink easily costs $25-35. Brown-bagging lunch from your accommodation saves significantly. Budget $15-25/day if you eat breakfast and lunch at home and dine out for dinner, or $40-80/day if you eat every meal out. European resorts often have mountain huts with more reasonable prices than US resort cafeterias. In Japan, on-mountain ramen and curry cost $8-12 — one of many reasons Japan offers incredible value.",
      },
      {
        heading: "Lessons and Extras",
        content:
          "Group lessons cost $60-120/day at most resorts. Private lessons run $300-600 for a half day. Kids' programs are typically $100-150/day including lunch and supervision. Other potential costs: parking ($10-30/day at some resorts), ski storage lockers ($5-10/day), hot springs or spa entry ($15-40), and evening activities. Not all of these are necessary — prioritize lessons if you are still learning, and skip the extras if budget is tight.",
      },
      {
        heading: "Budget vs. Mid-Range vs. Luxury: Total Trip Cost",
        content:
          "For two adults on a 5-day ski trip (all costs included): Budget option ($1,500-2,500 total) — drive to a smaller resort, stay in a rental, cook most meals, rent basic gear, use a multi-day pass. Mid-range ($3,000-5,000 total) — fly to a major resort, hotel in town, eat out for dinner, demo-level rentals, one lesson. Luxury ($6,000-12,000+ total) — slopeside lodge, private lessons, premium gear, dining out every meal, spa visits. The biggest savings come from accommodation choice and cooking your own meals.",
      },
      {
        heading: "Money-Saving Tips",
        content:
          "Buy season passes in the spring when next year's passes are cheapest. Book accommodation midweek, not Saturday to Saturday. Rent gear in town, not at the resort base. Bring snacks and water to the mountain. Ski in January or March instead of February (lower prices, same snow). Look for beginner packages that bundle lift, lesson, and rental at a discount. Share a vacation rental with friends. Use WinterStores to compare rental shop prices before committing. And if you are flexible on destination, smaller resorts offer 80% of the experience at 50% of the cost.",
      },
    ],
  },
  {
    slug: "questions-to-ask-before-renting-skis",
    title: "10 Things to Check Before Renting Skis",
    description:
      "A pre-rental checklist that takes five minutes and saves your whole trip: what to inspect on the gear, what to ask the shop, and the fine print worth reading.",
    publishedAt: "2026-08-14",
    primaryTopic: "rentals",
    topics: ["rentals", "skiing", "snowboarding"],
    sections: [
      {
        heading: "Check the Base and Edges Before You Leave",
        content:
          "Flip the skis over before you walk out. The base should be a consistent dark color with a faint sheen of wax — chalky white patches mean the base is dried out and the ski will feel sticky. Run a fingernail lightly along the edges: they should feel sharp and smooth, without rust spots or dings. Deep gouges in the base are grounds to ask for a different pair. A shop that tunes its fleet regularly will not mind you looking; a shop that gets defensive about it is telling you something.",
      },
      {
        heading: "Confirm the Binding Settings Are Yours",
        content:
          "Bindings release your boot in a fall, and the release force (the DIN setting) is calculated from your weight, height, age, boot sole length, and ability level. The technician should ask you for all of these — honestly answering slightly conservative on ability is safer than flattering yourself. Watch that they actually adjust the binding and test your boot in it, rather than handing you skis pre-set from the last customer. Wrong DIN settings cause the two classic rental injuries: a binding that releases mid-turn, or one that fails to release when you crash.",
      },
      {
        heading: "Try Both Boots On, Buckled, for Five Minutes",
        content:
          "Do not accept boots after a ten-second toe wiggle. Buckle them fully, stand up, flex forward into a ski stance, and walk around the shop for a few minutes. Snug everywhere with no single pressure point is the goal; your toes should brush the front when standing and pull back when you flex. Pain in the shop becomes agony on the mountain — rental boots never get more comfortable at altitude. Swapping boots takes two minutes now and is impossible at the top of a lift.",
      },
      {
        heading: "Ask What Happens if Something Breaks",
        content:
          "Equipment fails: edges catch rocks, a buckle snaps, a pole bends. Ask whether the shop swaps damaged gear free, whether there is a partner shop on the mountain for mid-day swaps, and what the damage policy actually covers. Damage waivers typically add a few dollars a day and cover normal wear and rock damage but not loss or theft. If you are skiing early or late season when thin cover exposes rocks, the waiver is usually worth it.",
      },
      {
        heading: "Get the Return Rules in Writing",
        content:
          "The three fine-print items that generate surcharges: return time (some shops count a late-afternoon return as an extra day), return location (can you drop gear at a partner shop or your hotel, or must it come back to the original counter), and overnight storage (some shops store your rental gear at the base area free, which spares you carrying skis on a shuttle twice a day). Photograph your rental receipt and the gear itself — thirty seconds of photos ends most damage disputes before they start.",
      },
      {
        heading: "Compare Shops Before You Arrive, Not in Line",
        content:
          "The worst place to choose a rental shop is standing in one at 8:45 on a powder morning. Compare shops near your resort in advance on ratings, services, and price level — WinterStores lists them side by side with review scores — then pre-book online, which typically saves 10-20% and lets you skip the morning queue at pickup. If your dates are flexible within the trip, fit boots the evening you arrive: shops are quiet after 4pm and fitters have time to do the job properly.",
      },
    ],
  },
  {
    slug: "ski-vs-snowboard-beginners",
    title: "Skiing vs. Snowboarding: Which Should You Learn First?",
    description:
      "An honest comparison for first-timers: learning curves, day-three reality, costs, injury patterns, and how to choose the one you will actually stick with.",
    publishedAt: "2026-08-16",
    topics: ["lessons", "rentals", "skiing", "snowboarding"],
    sections: [
      {
        heading: "The Cliche Is Mostly True",
        content:
          "The old line — skiing is easier to learn but harder to master, snowboarding is harder to learn but easier to progress — holds up reasonably well. On day one, most ski students ride a lift and link snowplow turns; most snowboard students spend the day falling as they learn to balance on one edge. By day four or five the picture flips: snowboarders who survive the first two days often progress quickly to linked turns on blue runs, while skiers plateau at the snowplow and need real technique work to advance. Neither path is wrong; they just front-load the pain differently.",
      },
      {
        heading: "The First Three Days, Honestly",
        content:
          "Expect a skiing day one of cautious success: separate legs give you a stable stance, facing forward feels natural, and the snowplow gives you a brake from the first hour. Expect a snowboarding day one of repeated falls onto wrists and tailbone — padded shorts and wrist guards are not a joke, they are the difference between a sore evening and a trip-ending sprain. Snowboard days two and three reward persistence: once you can hold an edge traverse, turning follows fast. Budget your expectations accordingly and book lessons for at least the first two days of either sport.",
      },
      {
        heading: "Cost Differences Are Small",
        content:
          "Rental packages price within a few dollars of each other — snowboard setups (board and boots) often run slightly cheaper than ski packages because there are no poles and the boots are simpler. Lessons cost the same. Lift tickets obviously do not care what is on your feet. The one real cost difference is gear ownership later: a full snowboard setup is usually a few hundred dollars cheaper than an equivalent ski setup, and soft snowboard boots are far more forgiving to buy than ski boots. Do not choose a sport over a $5-a-day rental difference.",
      },
      {
        heading: "Injury Patterns Differ More Than Rates",
        content:
          "Overall injury rates for beginners are broadly similar, but the injuries differ. Beginner snowboarders lead in wrist, shoulder, and tailbone injuries from falls onto outstretched hands; wrist guards measurably reduce the worst of it. Beginner skiers lead in knee ligament strains, because legs can twist independently and bindings do not always release. Helmets matter equally for both. If you have a pre-existing weakness — bad wrists or a history of knee trouble — that alone is a sensible reason to pick one sport over the other.",
      },
      {
        heading: "Practical Tiebreakers",
        content:
          "Choose skiing if: you want to enjoy your very first day, you are going with a mixed group and need to keep up on easy terrain immediately, you dislike falling, or the resort involves lots of flat traverses and drag lifts, which are miserable on a snowboard. Choose snowboarding if: your friends ride, you skate or surf and already trust a sideways stance, or you are willing to trade two rough days for faster progression. And the honest tiebreaker — pick the one your regular ski partners do; you will learn faster with people to follow and a reason to keep showing up.",
      },
      {
        heading: "You Can Switch Later, and Renting Makes It Cheap",
        content:
          "Nothing about your first choice is permanent, and plenty of people ride both. This is the strongest argument for renting through your first seasons rather than buying: trying the other sport costs one rental day, not a new quiver. Take a lesson when you switch — the skills transfer less than people hope, and one hour of instruction beats a day of bad guessing. Whichever you pick, book a shop with well-reviewed boot service; comfortable feet decide your first impression of either sport more than the sport itself does.",
      },
    ],
  },
  {
    slug: "snowboard-gear-guide-beginners",
    title: "Snowboard Gear for Beginners: What to Rent, Buy, and Skip",
    description:
      "The snowboard-specific gear guide: board profiles and sizing, why boots matter most, bindings, outerwear differences, and the protection that saves your first week.",
    publishedAt: "2026-08-18",
    primaryTopic: "snowboarding",
    topics: ["snowboarding", "rentals", "boot-fitting"],
    sections: [
      {
        heading: "Boots First, Board Last",
        content:
          "Beginners obsess over boards and ignore boots, which is exactly backwards. A snowboard boot that fits — snug heel, toes just brushing the end, no pressure points — matters more to your first week than anything strapped underneath it. Boots are also the first thing worth owning: they mold to your feet, rental boots are packed out by hundreds of previous feet, and a good pair costs $150-300 against $400-700 for a board and bindings. Rent the board for a season or two; buy boots as soon as you know you are hooked.",
      },
      {
        heading: "Board Size and Shape, Simply",
        content:
          "Old shop wisdom said the board should reach your chin; modern sizing goes by weight, and every manufacturer publishes a weight range per length. Beginners should sit in the middle or slightly below their range — shorter boards turn more easily. Width matters if your boots are US 11+ or larger: too-narrow boards let your toes drag in turns, so look for wide versions. For shape, ask for a soft-flexing, twin or directional-twin board with a forgiving rocker or hybrid profile. Skip anything described as aggressive, stiff, or camber-dominant for now.",
      },
      {
        heading: "Bindings: Fit the Boot, Not the Brand",
        content:
          "Bindings translate your movements to the board, and for beginners the requirements are simple: they must match your boot size, mount on your board's pattern, and flex softly. Straps should center over the boot without the ratchets digging in. If you rent, the shop handles all of this — but tell them your stance (regular or goofy, left or right foot forward) if you know it, and let them set a neutral beginner stance if you do not. A shop that asks about your stance and adjusts the angles is doing it properly.",
      },
      {
        heading: "Outerwear: Snowboarding Is Wetter",
        content:
          "Beginner snowboarders spend far more time sitting and kneeling in snow than skiers, so waterproofing matters more. Look for pants rated at least 10,000mm — 15,000-20,000mm is better — with a reinforced seat, and a jacket long enough to cover your lower back when seated. Mittens survive beginner week better than gloves, and buying them with built-in wrist guard compatibility solves two problems at once. Everything else from the general ski checklist applies unchanged: wicking base layers, no cotton, one good pair of sport-specific socks.",
      },
      {
        heading: "The Protection That Actually Earns Its Keep",
        content:
          "Three items pay for themselves in your first week: wrist guards ($20-40), because falling onto outstretched hands is the classic beginner snowboard injury; padded impact shorts ($40-70), because your tailbone will meet hard snow repeatedly while you learn heelside turns; and a helmet, which is simply non-negotiable. Knee pads help people who learn toeside falls the hard way. None of this is overkill for the first five days — most of it can be dropped once falling becomes rare.",
      },
      {
        heading: "A Sensible First-Season Budget",
        content:
          "A workable split: buy boots ($150-300 on sale), helmet ($60-120), outerwear and layers ($250-450 if starting from nothing), and protection ($60-110); rent the board and bindings ($25-45/day, less pre-booked online for multiple days). That puts a committed first season around $520-980 of purchases plus rentals — against $900-1,500+ going all-in on ownership before you know your preferences. Use WinterStores to find snowboard shops with strong boot-fitting reviews; a shop that fits snowboard boots seriously is worth a detour.",
      },
    ],
  },
  {
    slug: "snowboard-boot-fitting-guide",
    title: "How Snowboard Boots Should Fit",
    description:
      "Snowboard boots are not sneakers and not ski boots. How to size them, judge heel hold, use heat molding, and avoid the fit mistakes that ruin riding days.",
    publishedAt: "2026-08-20",
    primaryTopic: "boot-fitting",
    topics: ["boot-fitting", "custom-fitting", "snowboarding"],
    sections: [
      {
        heading: "The Sneaker-Size Trap",
        content:
          "The most common snowboard boot mistake is buying your sneaker size, which usually means buying a full size too big. A correctly sized snowboard boot feels alarmingly snug in the shop: toes touching the end when standing upright, pulling just clear when you bend your knees into a riding stance. Liners pack out — they compress a quarter to a half size within a week or two of riding — so a boot that feels perfectly comfortable on the carpet will feel sloppy on snow by day five. Snug now is right later.",
      },
      {
        heading: "Heel Hold Is the Whole Game",
        content:
          "Lift your heel inside the boot and you lose the toeside edge — the boot moves and the board does not. Test it in the shop: lace the boot fully, then rise onto your toes and flex forward hard. Your heel should stay planted with only a few millimeters of lift. If it pulls up, try a different model rather than a smaller size; brands build on different foot shapes, and a narrow-heeled rider in a wide-heeled boot cannot fix it with tighter lacing. J-bars and ankle harnesses can rescue marginal heel hold, but a boot that fits your heel beats every accessory.",
      },
      {
        heading: "Flex: Softer Than You Think",
        content:
          "Snowboard boot flex runs roughly 1-10. Beginners want 2-4: a soft boot forgives sloppy movements, makes flexing into turns easy, and hurts less to walk in. Intermediate all-mountain riders sit around 4-6. Stiff boots (7+) are for riders who charge fast and drive big boards — in a beginner's hands they just transmit every mistake at full volume. If you are between flexes, go softer; nobody ever quit snowboarding because their boots were too comfortable.",
      },
      {
        heading: "Lacing Systems: Pick What You Will Actually Adjust",
        content:
          "Traditional laces give the finest zone-by-zone control and cost least, but need re-tightening and are miserable in gloves. Boa dials tighten with a twist, work with gloves on, and hold tension well; double-Boa systems adjust the upper and lower zones separately, which mostly closes the control gap. Speed-lace pull systems split the difference. None of them is wrong — but a system you find annoying is one you will leave too loose, and a loose boot undoes everything the fitting got right.",
      },
      {
        heading: "Heat Molding and Footbeds Work Here Too",
        content:
          "Most quality snowboard boot liners are heat-moldable: the shop bakes the liner, you stand in the boot for ten minutes, and it takes your foot's shape. This is worth doing at purchase — it accelerates break-in and resolves most minor pressure points before they become bruises. Flat stock insoles deserve the same upgrade as in ski boots: a supportive footbed ($40-60 heat-molded, more for fully custom) reduces foot fatigue and the arch cramp that plagues riders who spend all day flexed against the toeside edge.",
      },
      {
        heading: "When to Involve a Professional Fitter",
        content:
          "Seek out a shop with a real fitting bench if: your feet are notably wide, narrow, or different sizes; you get numb toes or arch cramps regardless of boot; heel lift persists across brands; or you are buying your first owned pair after seasons of rentals. A good fitter measures both feet, watches you flex, and chooses candidates by foot shape rather than what is on sale. Shops listed on WinterStores with boot-fitting among their services and strong reviews are the right starting point — the service is mostly marketed to skiers, but the benches work just as well for riders.",
      },
    ],
  },
  {
    slug: "custom-footbeds-worth-it",
    title: "Custom Ski Boot Footbeds: What They Cost and Whether You Need Them",
    description:
      "Trim-to-fit, heat-molded, or fully custom? What footbeds actually change inside a ski boot, realistic prices, and who genuinely benefits from each level.",
    publishedAt: "2026-08-22",
    primaryTopic: "custom-fitting",
    topics: ["custom-fitting", "boot-fitting", "skiing", "snowboarding"],
    sections: [
      {
        heading: "What a Footbed Actually Does",
        content:
          "The insole that ships in every ski boot is a flat piece of foam, and a foot standing on flat foam collapses inward as it loads — the arch flattens, the knee tracks in, and your leg's steering movements arrive at the boot late and mushy. A supportive footbed holds the foot in a neutral position so leg rotation transfers to the boot immediately. Riders and skiers describe the result the same way: quicker edge engagement, less foot fatigue, and the end of the arch cramp that flat insoles produce by mid-afternoon.",
      },
      {
        heading: "The Three Levels, and What They Cost",
        content:
          "Trim-to-fit supportive insoles ($30-60) come in arch-height variants, cut to size with scissors — a genuine upgrade over stock foam. Heat-molded footbeds ($60-120) are warmed and shaped to your foot under load at a shop bench in about twenty minutes, capturing your actual arch shape. Fully custom orthotic footbeds ($150-250+) are built by a fitter from a cast or 3D scan of your unloaded foot, with posting corrections for alignment problems. Each level fits more precisely and lasts longer — customs routinely outlive several pairs of boots.",
      },
      {
        heading: "Who Gets the Most From an Upgrade",
        content:
          "The strongest cases: anyone with arch cramps, burning soles, or numb toes despite a correctly sized boot; skiers with flat feet or high arches, which stock insoles serve worst; anyone whose knees visibly track inward in a flexed stance; and skiers past roughly ten days a season, for whom the per-day cost becomes trivial. The weakest case is a first-timer in rental boots — solve boot fit first, then think about footbeds. A footbed cannot rescue a boot that is the wrong size or shape.",
      },
      {
        heading: "The Fitting Process, So You Can Judge It",
        content:
          "A proper footbed fitting starts with questions about your problems and days on snow, then a look at your feet — arch height, how they behave when loaded, any old injuries. For molded footbeds you stand or sit in a specific posture while the material sets; for full customs the fitter casts or scans the foot unweighted, which is the point — it captures the shape your foot should hold, not the collapsed shape it takes under load. If the whole process is a warm insole and thirty seconds of standing wherever, you are buying the cheap version at the expensive price.",
      },
      {
        heading: "Footbeds in Rental and Snowboard Boots",
        content:
          "Footbeds are personal gear that travels between boots: skiers who rent can carry their own footbeds and swap them into rental boots in thirty seconds, which is the single biggest comfort upgrade available to a renter. They move between ski and snowboard boots too, and the case for them in snowboard boots — all-day flex against the toeside edge — is arguably stronger. If you own one piece of hard-goods equipment before anything else, a good pair of footbeds is a defensible choice ahead of the boots themselves.",
      },
      {
        heading: "Finding a Shop That Does This Well",
        content:
          "Footbed quality is fitter quality. Look for shops that list custom fitting or boot fitting among their services and whose reviews mention fit problems actually solved, not just friendly staff. Ask what systems they carry and whether they post-correct customs — vague answers mean basic heat molding only, which is fine if that is the level you want and priced accordingly. WinterStores lets you filter shops by custom-fitting service and compare their review scores, which narrows a resort town to the one or two benches worth your money in a few minutes.",
      },
    ],
  },
  {
    slug: "ski-season-pass-comparison",
    title: "Epic, Ikon, Indy, or Local: Choosing a Ski Season Pass",
    description:
      "How the multi-resort mega passes compare with independent and local season passes, the break-even math, and which pass fits which kind of skier.",
    publishedAt: "2026-08-25",
    topics: ["skiing", "snowboarding", "lessons"],
    sections: [
      {
        heading: "The Break-Even Math Comes First",
        content:
          "Every pass decision reduces to one number: days you will honestly ski this season. Full multi-resort passes cost roughly $900-1,100 when bought early, against single-day window rates of $150-280 at the same destination resorts — so the break-even sits around 4-7 days. Ski fewer than four days and almost no pass beats buying days as you go, especially pre-purchased online where day tickets run meaningfully cheaper than the window price. Count your realistic days before comparing brochures, and be honest: the average pass holder overestimates.",
      },
      {
        heading: "The Mega Passes in One Paragraph Each",
        content:
          "Epic (Vail Resorts) covers the Vail-owned mountains — Vail, Whistler Blackcomb, Park City, Breckenridge among them — plus partner access in Europe and Japan, with cheaper restricted variants like the Local version. Ikon (Alterra) counters with Palisades Tahoe, Mammoth, Jackson Hole, Aspen and dozens of partners worldwide, in full and base tiers, the base tier blacking out peak holidays at marquee mountains. Both sell cheapest in spring, rise through fall, and stop selling mid-season. Their real product is flexibility: many mountains, one purchase.",
      },
      {
        heading: "The Anti-Mega-Pass Options",
        content:
          "The Indy Pass takes the opposite bet: two days each at a long roster of small independent resorts for a few hundred dollars — superb for road-trippers and families who prefer quiet hills to famous ones. Mountain Collective offers two days each at a shortlist of iconic destinations, aimed at travelers planning one or two big trips. And the humble local season pass at your nearest hill — often $300-600 — beats everything if most of your days happen within an hour of home. Loyalty to one small mountain is the cheapest skiing there is.",
      },
      {
        heading: "Match the Pass to Your Season, Not the Marketing",
        content:
          "One destination trip plus scattered local weekends: local pass plus pre-bought day tickets, or Mountain Collective if the trip is to one of its resorts. A dedicated week at a Vail or Alterra flagship: the matching mega pass often costs less than six window-rate days alone. Family with young kids: check kids-pass pricing before anything else — both major passes sell cheap child passes that can swing the family total by hundreds. Weekday-flexible skiers should price the restricted tiers; the blackout dates they exclude are days worth avoiding anyway.",
      },
      {
        heading: "The Fine Print That Bites",
        content:
          "Blackout dates on cheaper tiers cluster exactly when most people can ski: Christmas week, New Year, and the February holiday weekends. Partner resorts often mean a limited number of days, not unlimited access — read the per-resort allocation. Passes are non-refundable once used, so the included or add-on insurance matters if injury is a plausible risk. And pass prices step up on published deadlines through the fall: the same product costs $100-200 more in November than in April. If you know you are skiing next season, the spring launch price is the whole game.",
      },
      {
        heading: "Do Not Forget the Non-Lift Costs",
        content:
          "A pass solves lift access and nothing else. Rental gear, lessons, and parking at the big-name resorts can add more per day than the amortized pass itself — several destination mountains now charge $20-40 to park a car on a weekend. Some passes bundle discounts on rentals, lessons, food, and lodging that are worth actually using; ten percent off a week of demo rentals is real money. If you are renting all season anyway, compare a season-long rental from a local shop against daily rates — season leases are the gear-side equivalent of a pass, and shops on WinterStores frequently offer them.",
      },
    ],
  },
  {
    slug: "buying-used-ski-gear",
    title: "How to Buy Used Ski Gear Without Getting Burned",
    description:
      "Where to find quality second-hand skis, boards, and boots, what damage to walk away from, fair price benchmarks, and why ex-rental sales are the sleeper deal.",
    publishedAt: "2026-08-27",
    primaryTopic: "used-gear",
    topics: ["used-gear", "repairs", "skiing", "snowboarding"],
    sections: [
      {
        heading: "Why Used Is the Smart Second Purchase",
        content:
          "Ski gear depreciates like a car driven off the lot: skis that sold for $700 two seasons ago trade hands at $200-350 with most of their life left. Ski technology moves slowly — a three-year-old mid-range ski differs from this year's mostly in graphics — so the used market is where value lives for anyone past the rental stage but not yet chasing marginal performance. The catch is that used gear carries no warranty and no return counter, so the burden of inspection is entirely on you. That inspection is learnable in ten minutes, and it is the rest of this guide.",
      },
      {
        heading: "Inspecting Skis and Boards: The Walk-Away List",
        content:
          "Deal-breakers first: any crack in the edge or edge pulling away from the ski, topsheet delamination you can flex open, a base gouge deep enough to show the core, or a visible bend or twist sighted down the length. All of these are structural and not economically repairable. Acceptable and priceable: shallow base scratches (a $10 P-Tex repair), rusty edges (a $30-50 tune removes light rust), and worn topsheets, which are cosmetic. Press the camber flat by hand and let it spring back — a ski that stays flat is dead, no matter how clean it looks.",
      },
      {
        heading: "Bindings Are the One Genuinely Risky Component",
        content:
          "Every binding manufacturer publishes an indemnified list of models their shops may legally service; bindings age off this list after ten to fifteen years, and a shop will refuse to adjust or test one that has. Before buying any used ski with bindings, search the model against the current indemnified list — an off-list binding makes the ski worth base-and-edges only. On-list bindings still need a shop inspection, adjustment to your boot, and a release-force test ($20-40 total). Never skip this. A binding of unknown history at an unknown setting is the one used-gear risk with real consequences.",
      },
      {
        heading: "Used Boots: Mostly No, With One Exception",
        content:
          "Boots are the item to buy new, because the liner molds to its first owner and packs out toward their foot, not yours. A used liner is a memory-foam mattress that remembers someone else. The exception: lightly used shells with fresh or replaceable liners — replacement liners cost $100-200, and a barely worn $400 shell plus a new liner can beat a new mid-range boot on both fit and price if the shell matches your foot. Check shell soles for wear at toe and heel; ground-down sole blocks compromise binding release and rule the boot out unless the blocks are replaceable.",
      },
      {
        heading: "Where to Buy: Ranked by Risk",
        content:
          "Lowest risk: ski shop ex-rental and demo sales, usually late season — the fleet is professionally maintained, the shop stands behind it, and demo skis are current models at 40-60% off. Low risk: ski swaps run by clubs and schools, where volunteer techs often pre-screen the racks. Medium: consignment corners in gear shops. Highest: online marketplaces, where photos hide edge cracks and binding ages — insist on in-person inspection or detailed photos of base, edges, and binding model before traveling. Shops that sell used gear are listed with that service on WinterStores, which is the fastest way to find the ex-rental sales near you.",
      },
      {
        heading: "Fair Prices and the Total Cost of a Used Setup",
        content:
          "Rules of thumb: one season old, 50-65% of retail; two to three seasons, 30-45%; four or more, under 30% and falling fast. Add the mandatory extras to any used purchase: binding inspection and adjustment ($20-40), a fresh tune ($40-80 for wax, edges, and minor base work), and replacement parts if straps or buckles are tired. A complete used adult setup in honest condition — skis or board, bindings, tuned and safety-checked — should land between $250 and $500. If the math climbs past 70% of a new end-of-season sale price, buy new instead.",
      },
    ],
  },
  {
    slug: "ski-snowboard-repair-guide",
    title: "Ski and Snowboard Repairs: What Can Be Fixed and What It Costs",
    description:
      "From core shots to bent edges and delamination — which damage a shop can genuinely repair, typical prices, what is worth doing yourself, and when to retire the gear.",
    publishedAt: "2026-08-29",
    primaryTopic: "repairs",
    topics: ["repairs", "waxing", "skiing", "snowboarding"],
    sections: [
      {
        heading: "Triage: Cosmetic, Repairable, or Terminal",
        content:
          "Most damage sorts cleanly into three buckets. Cosmetic — topsheet chips, shallow base scratches, light edge rust — affects nothing but resale photos and can wait for the next tune. Repairable — base gouges, core shots, minor edge cracks, small delaminations, worn-out bases — is what repair benches exist for, at prices far below replacement. Terminal — a broken or creased core, edge torn out along a real length, delamination across the ski's width, a board that has lost its camber — means the gear is done, and money spent on it is wasted. When in doubt, a shop will triage for free in thirty seconds.",
      },
      {
        heading: "Base Damage: Gouges and Core Shots",
        content:
          "Scratches that catch a fingernail but stay in the black base material are routine: melted P-Tex fills them for $10-25, or a few dollars of DIY candle. A core shot — damage deep enough to expose the wood or composite core — needs prompt professional attention, because a wet core swells and delaminates the ski from inside. Shops cut back to clean material and weld in new base, typically $20-50 per shot depending on size. Ride a core shot in wet snow for a week and a $30 repair becomes a dead ski; tape over it and get it to a bench.",
      },
      {
        heading: "Edge Damage: Burrs, Cracks, and Blowouts",
        content:
          "Burrs and dings from rocks feel like the ski catching randomly; a shop removes them with a stone and file in minutes, usually inside a standard tune. A cracked edge that remains seated can often be stabilized and skied for seasons. An edge blowout — a section torn away from the ski — is the judgment call: short sections away from the contact zone can be repaired with epoxy and screws or a section replacement ($40-90), while long tears or damage underfoot where edge grip lives usually are not worth it. Bent edges from rail or rock impacts can frequently be coaxed back if the base beneath is intact.",
      },
      {
        heading: "Delamination and Water Damage",
        content:
          "When topsheet or base layers separate — often at the tip or tail after a hard impact, or anywhere water has crept in — the fix window is early. A small, dry delamination gets injected with epoxy and clamped overnight ($25-60) and holds for years. A large one, or one that squelches when squeezed, has water in the core, and gluing wet layers merely postpones the funeral. Prevention costs nothing: dry your gear indoors after wet days, fix base and edge breaches promptly, and never store skis in a bag with wet bases against wet bindings all summer.",
      },
      {
        heading: "The Full Shop Tune, Decoded",
        content:
          "A standard machine tune ($40-80) covers base grind to flatten and refresh structure, edge sharpening to a set bevel, minor P-Tex fills, and hot wax — effectively a reset to near-new running condition, worth doing once or twice a season for gear that gets used. Stone grinding adds precise structure for wet or cold snow. Binding work is priced separately: adjustment to a new boot ($15-30), full inspection and release test ($25-50), and remounting for a new hole pattern ($40-70 plus plugs). Turnaround runs same-day midweek to several days at peak; drop gear off before the trip, not the night lifts open.",
      },
      {
        heading: "DIY Versus the Bench, and When to Retire Gear",
        content:
          "Sensible home jobs: waxing, P-Tex on small clean gouges, edge deburring with a diamond stone, and side-edge touch-ups with a guide. Leave to the shop: anything touching the core, base grinds, edge replacement, structural epoxy work, and all binding mounting and testing — the tools and the liability both live there. Retire skis or boards when repair costs cross half the price of equivalent used replacements, when the camber is gone, or when the same failure keeps returning. Shops offering repair services are filterable on WinterStores, and reviews reliably reveal which bench in town does honest triage versus upselling.",
      },
    ],
  },
  {
    slug: "ski-gear-storage-guide",
    title: "How to Store Ski Gear: Off-Season Care and In-Resort Storage",
    description:
      "The end-of-season routine that keeps gear alive, the storage mistakes that quietly ruin it, and when paying for shop or slope-side storage is worth the money.",
    publishedAt: "2026-09-01",
    primaryTopic: "storage",
    topics: ["storage", "waxing", "repairs", "skiing", "snowboarding"],
    sections: [
      {
        heading: "The Twenty-Minute End-of-Season Routine",
        content:
          "Five steps in April protect the gear until December. Dry everything completely indoors for a day or two — trapped moisture is the number one killer. Wipe edges clean and run a lightly oiled cloth along them to hold off rust. Fix any base or edge damage now, not in November when every bench in town has a two-week queue. Apply a thick storage coat of wax over base and edges and leave it unscraped as a seal against air and moisture. Finally, back the binding tension screws off per the manufacturer's guidance so the springs spend summer relaxed.",
      },
      {
        heading: "Where Gear Should and Should Not Live",
        content:
          "The right spot is cool, dry, and dark: an indoor closet, under a bed, a dry basement. The classic wrong spots all have a mechanism: a garage or attic cycles heat that degrades base material and plastics; a damp cellar rusts edges inside a season; a car trunk does both while adding UV through the windows; and a sealed ski bag with any residual moisture becomes a greenhouse for rust and mildew. Store skis and boards flat or on their tails, strapped loosely — hanging by the tips or clamping brakes tight against the base serves no purpose.",
      },
      {
        heading: "Boots Are the Item Storage Actually Ruins",
        content:
          "More boots die in closets than on mountains. Buckle them closed on the loosest catch before storing — shells left open all summer take a splayed set that never quite closes right again. Pull the liners if they are damp, dry both parts fully, and park the boots upright somewhere temperature-stable; a hot attic softens and warps shells. Check footbeds for compression and liners for packed-out heels while you are at it: discovering a dead liner in September beats discovering it in a lift line. Gloves, layers, and helmets just need to be clean and bone dry before the bin.",
      },
      {
        heading: "In-Resort Storage: The Underrated Convenience",
        content:
          "Overnight ski storage at the base area — offered by many rental shops and slope-side lockers for roughly $5-15 a day — means walking to the lift empty-handed instead of hauling skis on a shuttle twice daily in ski boots. Over a week, especially with kids, it can be the best money of the trip. Many rental shops include free overnight storage with their own gear, which quietly changes the rent-versus-bring math: a town shop with base-area storage beats carrying your own skis from a cheaper hotel. Ask about it when comparing shops; it rarely appears on the price list.",
      },
      {
        heading: "Seasonal Storage and Season Leases",
        content:
          "Shops in ski towns increasingly offer summer storage: they take your gear in spring, store it properly, apply the storage service, and hand it back tuned in autumn — typically $50-100 including the tune, which is close to the tune's standalone price. For travelers who ski one destination repeatedly, some shops will store your gear between trips so you fly with a boot bag only. And the season lease — one payment for gear kept all winter — bundles the storage problem away entirely for families. Shops listing storage among their services on WinterStores are the ones to ask.",
      },
      {
        heading: "The First Day Back",
        content:
          "Storage care pays out in December. Scrape the storage wax, brush the base, and check edges for any rust that snuck through — light surface rust polishes off with a gummy stone in minutes. Re-check binding settings against your current weight and boot, ideally as a quick shop visit that doubles as a release test. Try the boots on at home, buckled fully, for ten minutes; feet change, liners settle, and the living room is a better place to learn this than the parking lot. Gear that went to sleep properly wakes up needing fifteen minutes, not a repair ticket.",
      },
    ],
  },
  {
    slug: "adult-ski-lessons-guide",
    title: "Ski Lessons as an Adult: What to Expect and How to Choose",
    description:
      "It is never too late to learn. Group versus private, what a first lesson actually looks like, costs, how to pick a good instructor, and progressing past the plateau.",
    publishedAt: "2026-09-03",
    primaryTopic: "lessons",
    topics: ["lessons", "rentals", "skiing", "snowboarding"],
    sections: [
      {
        heading: "Adults Learn Differently, Not Worse",
        content:
          "Adult beginners consistently underrate themselves. Adults learn through understanding — told why a movement works, they acquire it faster than children who simply mimic — and a reasonably fit adult typically reaches confident green-run skiing within three to five lesson days. What adults carry that children do not is fear management and self-consciousness, which is precisely why instruction beats a patient spouse: instructors sequence terrain so you are never somewhere that scares you, and a class of fellow adult beginners dissolves the embarrassment fast. The fastest learners are usually the ones who book the most lessons, not the youngest.",
      },
      {
        heading: "What the First Lesson Actually Looks Like",
        content:
          "Expect no lifts for a while. A first lesson starts on flat ground: walking in skis, sliding, falling and standing up on purpose, then gentle straight runs on a barely tilted slope with a snowplow stop. Most schools use magic-carpet conveyor lifts in the learning area before any chairlift. By the end of day one most adults ride the carpet and link snowplow turns; by day two or three, the first green run and first chairlift. Wear everything you would for a ski day, arrive with boots already fitted, and eat breakfast — learning to ski is genuinely athletic work.",
      },
      {
        heading: "Group Versus Private, Priced Honestly",
        content:
          "Group lessons ($60-140 for a half or full day) suit most beginners: instruction is largely generic at this stage, classmates normalize the falling, and rest comes built in while others take their turns. Private lessons ($300-600+ per half day) earn their price in three cases — you want maximum progress in minimum days, you have specific fear or a past bad experience to work through, or two or three friends split one private, which brings per-person cost near group rates with none of the waiting. The frequent sweet spot: group lessons for days one and two, then one private to fix whatever stuck.",
      },
      {
        heading: "How to Pick a School and an Instructor",
        content:
          "Certification tells you the floor: PSIA-AASI in the US, CSIA in Canada, BASI for British instructors, national systems like the ESF across the Alps. Class size tells you more — eight or fewer for adult beginners is good, and schools that split groups by ability after a morning assessment beat ones that sort by whoever showed up. Book morning slots (fresher legs, better snow, and the option of an afternoon practicing what you learned), and if an instructor clicks, ask for them by name next time; continuity across days compounds. Recent reviews mentioning adult beginners specifically are worth more than a school's own marketing.",
      },
      {
        heading: "The Intermediate Plateau Is a Lessons Problem",
        content:
          "The most common skier in the world is the self-taught intermediate stuck for a decade: parallel-ish on groomed blues, surviving rather than skiing anything harder, improving zero percent per season. The plateau is technical — usually a defensive backseat stance and turns steered by the shoulders — and it does not fix itself with mileage, because every run rehearses the habit. One or two targeted lessons a season breaks it; say exactly this to the instructor ('I have been stuck at this level for years') and you will get drills, not a guided tour. Lessons are not just for beginners; they are cheapest per unit of improvement for exactly this skier.",
      },
      {
        heading: "Booking Logistics and the Package Trick",
        content:
          "Book lessons before the trip, not at the desk — beginner slots at good schools sell out for weekends and holidays weeks ahead. Look hard at beginner packages: most resorts bundle lesson, rental, and a learning-area lift ticket for less than the pieces separately, sometimes dramatically so, and some sweeten multi-day beginner packages with a discounted first season pass. Tell the rental shop you are taking a lesson; they will set beginner-appropriate gear without the upsell. WinterStores lists which shops near each resort offer lessons alongside rentals, which is the one-stop version of this errand.",
      },
    ],
  },
  {
    slug: "kids-ski-gear-rent-or-buy",
    title: "Kids' Ski Gear: Rent, Buy, or Season Lease?",
    description:
      "Children outgrow ski gear yearly, which changes all the usual math. When daily rental, buying used, and season lease programs each win — plus what must fit properly.",
    publishedAt: "2026-09-05",
    primaryTopic: "rentals",
    topics: ["rentals", "used-gear", "lessons", "skiing", "snowboarding"],
    sections: [
      {
        heading: "The Outgrowing Problem Changes Everything",
        content:
          "Adult gear decisions amortize over five to ten seasons; a growing child gets one, maybe two, from any boot or ski. That single fact demotes buying new from default to special case. A seven-year-old's feet can grow two sizes in a year, and skis sized to height follow right behind. The industry's answer is the season lease, covered below, which most families with school-age kids have not heard of and almost all of them should use. The exceptions at either end: toddlers who ski five days a year (daily rental) and teenagers who have stopped growing (the adult rules apply again).",
      },
      {
        heading: "Daily Rental: Right for Short Trips",
        content:
          "For the family that skis one trip a year, daily rental remains correct: kids' packages run $15-35 a day, shops swap sizes mid-trip free if something pinches, and nothing needs storing or hauling home. Two upgrades make it painless. First, pre-book online and fit the kids the afternoon you arrive rather than the first morning — a tired child in a 9am rental queue is nobody's holiday. Second, ask for the shop's kids-ski-free or multi-day family deals; many shops discount or waive child rentals alongside adult packages and never advertise it.",
      },
      {
        heading: "The Season Lease: The Best Deal in Family Skiing",
        content:
          "A season lease hands you a full kids' setup — skis, boots, poles, often a helmet — from November to April for roughly $100-200, about the price of four or five rental days. Outgrow something in January and the shop swaps sizes free; that mid-season swap clause is the whole product, so confirm it before paying. Everything arrives tuned, and returns happen in spring with no summer storage. Local shops near your home hill run these programs (reserve in September and October — fleets run out), and it means school-holiday mornings start in your hallway, not a rental line.",
      },
      {
        heading: "Buying Used Works, With Two Rules",
        content:
          "Ski swaps and shop consignment racks are full of barely used kids' gear at 20-40% of retail, precisely because everyone's children outgrow everything. Two rules keep it safe. Boots must actually fit now — a finger's width behind the heel, no more; kids ski badly and coldly in boots bought two sizes up to grow into, which defeats the savings. And any binding must go to a shop for adjustment and a release check against the current boot ($15-30) — kid-sized DIN settings matter more, not less. Resell in the same channel next year and the season's true cost approaches lease territory.",
      },
      {
        heading: "What Must Fit Properly Versus What Can Be Approximate",
        content:
          "Spend the fitting attention where it counts: boots (control, warmth, and whether the child enjoys any of this), helmet (snug, no wobble, goggle-compatible — always bought or rented, never borrowed after an unknown impact history), and goggles that seal to the small face rather than the parent's spare. Skis can be approximate — chin-to-nose height, shorter is friendlier, and no child needs anything but soft forgiving skis. Mittens beat gloves to about age ten (warmer, and small fingers cannot work glove fingers anyway), and one-piece suits solve the snow-down-the-back problem for the smallest skiers better than any tucked jacket.",
      },
      {
        heading: "Coordinate Gear With Lessons",
        content:
          "Kids' gear and kids' lessons are one errand, not two. Ski school beginner packages usually bundle rental with instruction at a real discount, the school's partner shop knows exactly what its instructors want on a first-timer's feet, and dropping gear and child at the same building at 8:50 is a logistical mercy. Book both together, tell the shop the child's ability honestly, and label everything — one Sharpie mark inside a boot cuff prevents the daily identical-black-boot mixup at ski school pickup. Shops offering both rentals and lessons are filterable on WinterStores, one search per resort.",
      },
    ],
  },
  {
    slug: "flying-with-ski-gear-vs-renting",
    title: "Flying with Ski Gear vs. Renting at the Resort",
    description:
      "Airline ski bag fees, the packing rules that matter, door-to-door hassle, and the honest math on when bringing your own gear beats renting at the destination.",
    publishedAt: "2026-09-06",
    topics: ["rentals", "storage", "skiing", "snowboarding"],
    sections: [
      {
        heading: "The Fee Math Is Only the Start",
        content:
          "Most major airlines treat a ski or snowboard bag plus a boot bag as one checked item, so the marginal cost is a standard checked-bag fee — roughly $35-75 each way on North American carriers, often free within Europe on airlines with generous sports-equipment policies, occasionally punitive on budget carriers that charge sports equipment separately. Call it $70-150 round trip as a planning number, against $150-300 for a week of quality rental. On fees alone, bringing gear usually wins for a week. The rest of this guide is about everything the fee math leaves out.",
      },
      {
        heading: "What the Fee Math Leaves Out",
        content:
          "Count the hidden columns. Hassle: hauling a ski bag through airports, rental car counters, and hotel lobbies, twice. Risk: airlines occasionally delay or misroute oversized bags, and a delayed ski bag at a rental-shop-free hour means renting anyway. Transfer costs: some shuttles and compact rental cars simply do not fit a ski bag, forcing a larger car. Storage at the other end: a hotel room shared with a wet 190cm bag. Against all that, your own gear means your own boots — and boots, as ever, are the item that decides comfort. Which suggests the real answer below.",
      },
      {
        heading: "The Standard Answer: Fly Boots, Rent Skis",
        content:
          "Experienced travelers converge on the same setup: boots fly, skis rent. Boots are the personal, fit-critical, irreplaceable item — and a boot bag travels as a carry-on on most airlines, immune to checked-bag roulette. Skis are the bulky, fee-attracting, replaceable item — and renting them at the destination means current demo models matched to the local snow, swappable mid-week if conditions change. This splits the difference almost perfectly: your comfort travels with you, the logistics stay light, and a week of ski-only rental (without boots) runs meaningfully cheaper than the full package.",
      },
      {
        heading: "If You Do Fly the Full Bag",
        content:
          "Pack like the bag will be thrown, because it will be. Padded double bags with wheels carry two pairs for one fee shared between travelers. Cushion tips and tails with clothing — soft goods packed around skis save a second checked bag and act as padding, which is the frequent-flyer trick hiding in plain sight. Strap skis together base to base with brakes interlocked, buckle boots closed in the boot bag, and photograph everything before check-in for the claims process you will probably never need. Confirm the airline's length limit; a 190cm bag exceeds some carriers' standard allowance and triggers oversize fees.",
      },
      {
        heading: "When Renting at the Destination Simply Wins",
        content:
          "Rent when any of these hold: the trip is short (three days of rental costs less than round-trip fees plus hassle), the itinerary chains flights or trains where a ski bag multiplies every transfer, you are flying a budget carrier with hostile equipment fees, conditions at the destination differ from your gear (your carving skis, their powder week), or your own gear is due for replacement anyway and a week of demos doubles as a buying test. Pre-book the rental online for the 10-20% discount and reserve boots too if you must — but read the boot sections of this site first and consider the carry-on boot bag once more.",
      },
      {
        heading: "Book the Destination Shop Like You Booked the Flight",
        content:
          "The travelers who rent well treat the shop as part of the itinerary: compare shops near the resort in advance, check reviews for mentions of fit care and queue times, pre-book for the discount, and fit gear the evening of arrival so the first morning starts on snow. Shops with overnight storage at the base area let you skip the daily carry entirely — the single best amenity for a flying trip. WinterStores exists for exactly this comparison: shops near each resort, side by side, with scores, services, and price levels visible before you commit.",
      },
    ],
  },
  {
    slug: "cross-country-skiing-beginners",
    title: "Getting Started with Cross-Country Skiing",
    description:
      "The affordable, learn-in-a-day side of skiing: classic versus skate technique, what gear costs, where to go, and why nordic is the easiest winter sport to try.",
    publishedAt: "2026-09-06",
    topics: ["cross-country", "rentals", "lessons", "waxing"],
    sections: [
      {
        heading: "The Low Barrier Nobody Mentions",
        content:
          "Cross-country skiing is the cheapest and least intimidating way onto snow. Trail passes at nordic centers run $10-30 against $100+ downhill lift tickets, a full rental package costs $15-30 a day, falls happen at walking speed onto flat ground, and a reasonably fit beginner shuffles along comfortably within the first hour. There are no lifts to manage, no steeps to fear, and the fitness carryover is enormous — nordic skiing works more muscle groups than nearly any other common sport. If downhill skiing's cost or fear factor has kept someone off snow, this is the door.",
      },
      {
        heading: "Classic or Skate: Start Classic",
        content:
          "The two techniques use different gear and different trails. Classic skiing moves in a straight-ahead stride along machine-cut parallel tracks — the motion resembles gliding walk, and beginners do it acceptably on day one. Skate skiing pushes off angled edges like an ice skater on a wide groomed lane — it is faster, more athletic, and genuinely technical, with a first day closer to comedy. Start classic; add skate later if the speed appeals. Rental shops at nordic centers stock both and will not let you leave with mismatched gear if you tell them which trails you are heading for.",
      },
      {
        heading: "Gear, Translated from Downhill",
        content:
          "Everything is lighter and cheaper. Skis are skinny and attach only at the toe, leaving the heel free — that free heel is the defining fact of nordic technique. Boots feel like sturdy trainers rather than plastic casts, sized like comfortable shoes with wiggle room, and modern bindings click in like a downhill toe-piece. Poles are longer: armpit height for classic, chin height for skate. Most classic rental skis today are waxless — fish-scale or skin bases that grip without kick wax — which removes the traditional dark art of waxing from a beginner's first seasons entirely.",
      },
      {
        heading: "Dress Like a Runner, Not a Downhill Skier",
        content:
          "The most common first-timer mistake is arriving in downhill kit and overheating within a kilometer. Nordic skiing is aerobic exercise; dress for winter running: wicking base layer, light fleece or softshell, wind-resistant outer, thin gloves, headband or light hat. No insulated parka, no snow pants unless it is genuinely storming. Carry a small pack with water, a snack, and a spare layer for the rest stops. You should feel slightly cold standing in the parking lot — two minutes of striding fixes it, and the alternative is skiing soaked in sweat.",
      },
      {
        heading: "Where to Go and What It Costs",
        content:
          "Dedicated nordic centers are the right first venue: groomed tracks, marked loops by difficulty, warm huts, rentals and lessons on site. Many alpine resorts run a nordic center at the base or in the valley — a fact worth knowing for mixed groups where not everyone wants lift tickets. A first outing with rental, trail pass, and a group lesson lands around $50-90 total. The lesson is worth it even for the naturally coordinated: an hour of instruction on weight transfer and the gentle art of stopping downhill sections converts shuffling into actual gliding, which is where the sport's pleasure lives.",
      },
      {
        heading: "Buying In, Eventually",
        content:
          "Nordic gear ownership is kind to the wallet: a complete quality classic setup — skis, boots, bindings, poles — costs $300-600 new, roughly the price of downhill boots alone, and entry-level packages dip lower in end-of-season sales. Waxless skis keep maintenance to an occasional glide wax on the tips and tails. Since fit stakes are lower than downhill, used nordic gear is also a fair beginner market, boots included. Shops serving cross-country skiers — often the same shops that rent and wax alpine gear in ski towns — are listed with their services on WinterStores.",
      },
    ],
  },
  {
    slug: "snowshoeing-beginners-guide",
    title: "Snowshoeing for Beginners: Gear, Where to Go, and What It Costs",
    description:
      "If you can walk, you can snowshoe. Choosing and renting snowshoes, dressing right, trail etiquette, safety basics, and why this is winter's most accessible sport.",
    publishedAt: "2026-09-07",
    topics: ["snowshoeing", "rentals", "storage"],
    sections: [
      {
        heading: "The Sport With No Learning Curve",
        content:
          "Snowshoeing's pitch is honest: if you can walk, you can snowshoe, today, with no lessons. Modern snowshoes are compact aluminum or composite frames that strap over winter boots, spreading your weight so you float instead of post-holing to the knee. The technique is walking with a slightly wider stance. That makes it the ideal winter sport for mixed groups, non-skiing partners on ski trips, anyone rehabbing away from impact sports, and winter hikers who want their summer trails back. Fitness scales with you — a flat stroll is easy company, breaking trail uphill in fresh snow is a serious workout.",
      },
      {
        heading: "Renting Is Cheap and the Right First Move",
        content:
          "Snowshoe rentals cost $10-25 a day from outdoor shops, nordic centers, and many resort rental shops — often the same counter that rents skis, which matters for ski-trip rest days. Rent two or three times before buying: you will learn whether you prefer flat rambles or steep terrain, which changes what to buy. Many nordic centers bundle snowshoe rental with trail access, and guided snowshoe outings (commonly $30-60 with gear) are less instruction than a sociable introduction to the local trails. Poles with snow baskets are usually included; take them, they help more than they look like they should.",
      },
      {
        heading: "If You Buy: Three Things That Matter",
        content:
          "Recreational snowshoes for groomed and rolling terrain cost $100-200 and suit most people; mountain models with aggressive crampons and heel-lift bars for steep climbs run $200-300+. Sizing follows total weight — you plus clothing plus pack — against the manufacturer's chart; more surface for deep-powder regions, less for packed trails where smaller shoes walk more naturally. Bindings matter most in practice: try them with the gloves you will actually wear, because a binding you cannot ratchet with cold hands is a daily argument. Running-shoe brands' trail-crampon hybrids are a different tool; for real snow depth, you want actual snowshoes.",
      },
      {
        heading: "Dress in Layers, Expect to Shed One",
        content:
          "Snowshoeing runs warmer than people expect — closer to hiking than to standing on a lift. Waterproof boots (winter hikers or insulated boots both work; the snowshoe adapts to either), gaiters or snow pants to keep snow out of the boot tops, wicking layers with a shell over, and a pack with water, snacks, and the layer you shed after ten minutes. Sunglasses and sunscreen on bright days: snow reflects UV from below, and a sunny snowfield delivers a double dose. The only specialized purchases are the shoes themselves; everything else, most winter hikers already own.",
      },
      {
        heading: "Trail Etiquette and Safety Basics",
        content:
          "Two etiquette rules keep the peace: never walk on groomed ski tracks (snowshoe prints ruin the set classic tracks nordic skiers pay to use — stay to the side or on designated snowshoe trails), and yield to skiers, who maneuver less easily than you. Safety is winter-hiking safety: tell someone your route, start with marked trails at nordic centers or ranger-managed areas, watch daylight (winter afternoons end abruptly), and stay off slopes steep enough to slide unless you carry avalanche training and gear. Deep-snow travel burns roughly twice the energy of bare-ground hiking; halve your usual distance estimates the first few times out.",
      },
      {
        heading: "Where It Fits in a Ski Trip",
        content:
          "For ski-trip planners, snowshoeing is the answer to three recurring problems: the rest day when legs are done but the scenery is not, the group member who does not ski, and the storm day when lifts are on wind hold but the forest is magical. Most ski resorts maintain marked snowshoe trails, and evening guided outings — full-moon walks, fondue hikes — book out at the same desks as ski school. Rental shops near resorts that carry snowshoes alongside ski gear show up on WinterStores; one search covers both errands for the trip.",
      },
    ],
  },
  {
    slug: "best-time-to-buy-ski-gear",
    title: "The Best Time to Buy Ski Gear: A Season-by-Season Sales Calendar",
    description:
      "Ski gear prices follow a predictable annual cycle. When each category actually goes on sale, how deep the discounts run, and the two windows worth planning around.",
    publishedAt: "2026-09-07",
    primaryTopic: "used-gear",
    topics: ["used-gear", "rentals", "skiing", "snowboarding"],
    sections: [
      {
        heading: "The Price Cycle in One Paragraph",
        content:
          "Ski gear pricing follows the same loop every year. New models arrive in shops in September and October at full price and mostly stay there through the holidays. Small dips appear around Black Friday, mainly on outerwear and accessories. Prices hold through the heart of the season, then break in March: end-of-season clearances of 30-50% as shops flush inventory before summer. Spring also opens season-pass sales at their lowest prices and shop demo-fleet sales. Summer is the dead zone with thin stock, and September brings last year's leftovers at their final markdowns just as the new stock lands. Two windows do most of the work: March-April and the preseason sales in September-November.",
      },
      {
        heading: "March and April: The Main Event",
        content:
          "End-of-season clearance is the best broad window of the year: current-season skis, boards, boots, and outerwear at 30-50% off from shops that would rather sell than store. Selection is the trade-off — popular sizes and models thin out fast, so buyers who know their size and needs win. This is also demo-sale season, covered below, and the moment shops discount services: buying boots in April often includes the fitting attention that January's queue could not spare. The discipline required: buying in April means gear sits in a closet until December, which is only a problem if your size might change or your commitment might.",
      },
      {
        heading: "Demo and Ex-Rental Sales: The Sleeper Deal",
        content:
          "When shops sell off their demo and rental fleets in spring, current-year mid-to-high-end skis and boards go for 40-60% off — professionally maintained all season, tuned before sale, and often better specced than what the same money buys new. The catches are minor: mounting holes from previous bindings (a shop plugs and remounts routinely), cosmetic wear, and first-come selection. For intermediate skiers stepping up from rentals, an ex-demo ski with a fresh tune is arguably the best value in the entire market. Ask shops in February when their fleet sale starts; the good ones have waiting lists. Shops selling used and ex-rental gear are filterable on WinterStores.",
      },
      {
        heading: "Preseason: Where Boots and Passes Are Bought",
        content:
          "September through November is not the cheapest window, but it is the right one for two categories. Boots: buy them preseason at a proper fitting bench — fitters have time, the full size run is in stock, and you get the break-in period plus free adjustment visits before the season starts, which no January discount compensates for. Season passes: spring launch prices are the floor, but early-fall deadlines still beat the November price steps by $100-200. Preseason ski swaps — club and school fundraisers every October — are also the year's best used-gear concentration, one room of inspected inventory priced to move in a weekend.",
      },
      {
        heading: "Black Friday and Holiday Sales, Rated Honestly",
        content:
          "November sales are real but narrow. Expect genuine discounts on outerwear, layers, helmets, goggles, and accessories — 20-40% at the big online retailers — and last season's ski and board models at another step down. Do not expect current-year hardgoods to move much; demand is peaking and shops know it. The holiday trap to skip: buying boots online because a size chart and a discount aligned. Boots bought unfitted are the most-returned, most-regretted item in the sport, and the January boot-fitter queue is full of people wearing December's bargains. Soft goods online, hardgoods in spring, boots at a bench.",
      },
      {
        heading: "A One-Year Buying Plan",
        content:
          "Put it together and a patient buyer's calendar looks like this. Spring: season pass at launch price; skis or board at clearance or the demo sale; next winter's outerwear at 40% off. Summer: nothing — enjoy the other sports. September-October: boots, fitted properly, at a bench with time to do it right; the local ski swap for kids' gear and second setups. November: fill accessory gaps in the Black Friday sales. December-February: buy nothing but wax and lift tickets, and note what you covet for the spring sales. Renters can run the same logic on services: book season leases in early fall and next year's rentals online before the holiday price bump.",
      },
    ],
  },
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

export function getAllGuideSlugs(): string[] {
  return GUIDES.map((g) => g.slug);
}

/**
 * How much a service tells you about a shop.
 *
 * Nearly every store rents gear, so a rentals match is weak evidence and a poor
 * reason to pick one guide over another. A boot-fitting bench or a used-gear
 * rack is a deliberate investment that genuinely characterises the shop. Scoring
 * every service equally let a guide that incidentally matched two weak services
 * outrank the guide actually about what the shop is known for.
 */
const SERVICE_WEIGHT: Record<ServiceType, number> = {
  rentals: 1,
  repairs: 2,
  waxing: 2,
  storage: 2,
  lessons: 3,
  "used-gear": 3,
  "custom-fitting": 4,
  "boot-fitting": 4,
};

/** A guide's own subject matching a store's service is worth far more than a passing mention. */
const PRIMARY_TOPIC_MULTIPLIER = 5;

/**
 * Guides worth showing next to a given store, best match first.
 *
 * Search Console shows guide articles receiving essentially no internal links
 * while the five header destinations soak up ~980 each. Surfacing matched
 * guides on store pages is the cheapest way to route equity to the pages that
 * can realistically rank, since store pages are by far the most numerous type.
 *
 * Scoring, strongest signal first:
 *   - the guide's primary subject is a service this shop offers, weighted by how
 *     distinctive that service is (so boot-fitting beats rentals)
 *   - a supporting topic matches a service, same weighting
 *   - a topic matches one of the shop's sports (weak — nearly all stores ski)
 *
 * Ties break on recency, and the list tops up with the newest guides so a
 * sparsely-tagged store still links out rather than rendering nothing.
 */
export function getGuidesForStore(
  store: { services: ServiceType[]; sportTypes: SportType[] },
  limit = 3
): Guide[] {
  const services = new Set<string>(store.services);
  const sports = new Set<string>(store.sportTypes);

  const scored = GUIDES.map((guide) => {
    let score = 0;
    for (const topic of guide.topics) {
      if (services.has(topic)) {
        const weight = SERVICE_WEIGHT[topic as ServiceType] ?? 2;
        score +=
          topic === guide.primaryTopic
            ? weight * PRIMARY_TOPIC_MULTIPLIER
            : weight;
      } else if (sports.has(topic)) {
        score += 1;
      }
    }
    return { guide, score };
  })
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.guide.publishedAt.localeCompare(a.guide.publishedAt)
    )
    .map((entry) => entry.guide);

  if (scored.length >= limit) return scored.slice(0, limit);

  // Top up with the newest guides the store didn't already match.
  const chosen = new Set(scored.map((g) => g.slug));
  const filler = [...GUIDES]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .filter((g) => !chosen.has(g.slug));

  return [...scored, ...filler].slice(0, limit);
}
