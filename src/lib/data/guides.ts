export interface Guide {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  sections: { heading: string; content: string }[];
}

export const GUIDES: Guide[] = [
  {
    slug: "how-to-choose-ski-rental-shop",
    title: "How to Choose a Ski Rental Shop",
    description:
      "A practical guide to finding the right ski rental shop for your next trip. Learn what to look for in equipment quality, pricing, location, and service.",
    publishedAt: "2026-03-20",
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
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

export function getAllGuideSlugs(): string[] {
  return GUIDES.map((g) => g.slug);
}
