# Guide queue — content plan for the weekly publishing routine

A cloud routine ("WinterStores — weekly guide") runs every Tuesday, takes the
first topic with status `queued`, writes it into `src/lib/data/guides.ts`,
flips the status to `published` with the date, runs typecheck + tests, and
pushes to `main` (which deploys). Humans edit this file to steer it: reorder
rows, add topics, or set a row to `hold`.

## Rules the routine follows (keep in sync with the routine prompt)

- One guide per run. Never two.
- House style = the existing guides in `guides.ts`: 6 sections, each one
  plain-text paragraph of ~100–130 words, headings that promise something
  concrete, no bullet lists inside content, no second-person hype, no
  invented statistics. Price ranges are fine; precise unsourced numbers are
  not. US and European perspectives both covered where relevant.
- `topics` uses only the `SportType` / `ServiceType` vocabulary from
  `src/types/store.ts`; set `primaryTopic` only when one service is the
  actual subject. The `declares every primaryTopic within its own topics`
  test enforces the pairing.
- Exactly one mention of WinterStores per guide, placed where it is a
  genuine next step for the reader (finding a shop), never as an ad.
- `publishedAt` = the run date (UTC). Slugs are kebab-case, unique, and
  must not collide with an existing slug.
- Do not reference specific store or resort data from the database — the
  content routine has no database access. Evergreen, general knowledge only.
- Never edit anything except `guides.ts` and this file.

## Queue

| Status | Slug | Working title | Angle / what makes it worth ranking for | Topics |
|---|---|---|---|---|
| published | ski-length-sizing-guide | How Long Should Your Skis Be? A Sizing Guide That Isn't Just Your Height | Height is the starting point, not the answer: weight, ability, ski type, and rocker profile all move the number. Table-free explanation. | skiing, rentals |
| queued | ski-binding-din-settings-explained | Ski Binding DIN Settings Explained (and Why You Shouldn't Set Them Yourself) | What DIN is, how shops calculate it, what each input changes, why "crank it up" is the classic injury path. | skiing, rentals, repairs |
| queued | pre-booking-ski-rentals-guide | Should You Pre-Book Ski Rentals Online? Discounts, Risks, and When to Walk In | Online discounts vs. fit quality; pickup-the-evening-before trick; cancellation terms. | rentals, skiing, snowboarding |
| queued | ski-rental-damage-waiver-explained | Ski Rental Damage Waivers and Insurance: What You're Actually Paying For | What waivers cover, what they don't (theft, loss), when they're worth it (early/late season rocks), card and travel-insurance overlap. | rentals, skiing, snowboarding |
| queued | first-snowboard-trip-guide | First Snowboard Trip Planning Guide | The snowboard twin of the first-ski-trip guide: resort choice for riders, lessons, protection, days one to three. | lessons, rentals, snowboarding |
| queued | kids-ski-lessons-age-guide | At What Age Can Kids Start Skiing? Lessons, Readiness, and What to Expect | Realistic ages per sport, kindergarten-style programs, how long a session should be, parent mistakes. | lessons, skiing, snowboarding |
| queued | rental-gear-hurts-mid-trip | Your Rental Boots Hurt. Now What? Fixing Fit Problems Mid-Trip | Swap rights, what a shop can adjust in ten minutes, pressure-point fixes, when to insist on a different boot. | boot-fitting, rentals, skiing, snowboarding |
| queued | how-to-demo-skis-before-buying | How to Demo Skis Before You Buy | Demo programs, what to test on which terrain, how many pairs per day, credit-toward-purchase deals. | rentals, used-gear, skiing |
| queued | ski-touring-rental-basics | Renting Ski Touring Gear for the First Time | Bindings, skins, boots differ; avalanche safety gear rental; why a guide or course comes first. | rentals, lessons, skiing |
| queued | ice-skating-rentals-beginners | Ice Skating for Beginners: Rentals, Skate Fit, and First-Session Tips | Rental skate fit (snug, no ankle wobble), figure vs hockey, warm-up, falling safely. | ice-skating, rentals |
| queued | cold-feet-skiing-solutions | Cold Feet While Skiing: Causes and Fixes That Actually Work | Boot fit and circulation first, then socks, heaters, liners; what shops can do. | boot-fitting, custom-fitting, skiing, snowboarding |
| queued | ski-terms-glossary-beginners | Ski Terms Explained: A Beginner's Glossary | Piste colors by country, lift types, snow conditions, gear words, in plain prose. | skiing, snowboarding, lessons |
| queued | how-to-read-ski-shop-reviews | How to Read Ski Shop Reviews (and Spot the Ones Not Worth Trusting) | Volume vs. score, seasonal review bursts, what complaints actually matter (fit, queues, swaps), why a 4.4 from 400 beats a 5.0 from 6. | rentals, boot-fitting, skiing |
| queued | sledding-tobogganing-family-guide | Sledding and Tobogganing with Kids: Gear, Safety, and Where to Go | Sled types, helmets, resort toboggan runs, rentals near resorts. | sledding, rentals |
| queued | ski-poles-sizing-and-choice | Ski Poles: How to Size Them and When They Actually Matter | The elbow rule, adjustable poles for touring, grips and straps, why beginners get the wrong length. | skiing, rentals |
| queued | snowboard-vs-ski-rental-costs | Ski vs Snowboard Rental Costs: What You'll Pay and Why | Package components, resort vs town, premium tiers, multi-day math, helmet add-ons. | rentals, skiing, snowboarding |
| queued | end-of-day-gear-care-on-a-trip | Looking After Rental Gear on a Trip: The Five-Minute Evening Routine | Drying boots, edges, overnight storage options, damage-waiver-relevant habits. | storage, rentals, skiing, snowboarding |
| queued | spring-skiing-gear-guide | Spring Skiing: How Gear and Wax Choices Change in Warm Snow | Warm wax, lens choice, layering down, timing the day, slush technique. | waxing, skiing, snowboarding |

## Published by the routine

(The routine appends a line here for each guide it publishes: date — slug.)

- 2026-11-01 — ski-length-sizing-guide
