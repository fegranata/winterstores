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
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

export function getAllGuideSlugs(): string[] {
  return GUIDES.map((g) => g.slug);
}
