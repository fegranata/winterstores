# WinterStores Launch Plan

## Product Hunt

### Tagline (54 chars — PH limit is 60)
Compare ski shops near any resort by rating and service

Deliberately no store count here. The number moved three times in one day
(1,053 → 1,377), and the tagline is the line nobody remembers to update. Scale
lives in the descriptions below, which the pre-launch checklist tells you to
re-verify. "Near any resort" is the actual differentiator against Google Maps —
the site is organised around resorts, not just pins on a map.

Alternative if you want the scale signal up front:
`Compare 1,300+ ski shops by rating, service and resort` (54 chars)

### Short Description
WinterStores is a free directory of ski shops, snowboard stores, and winter gear retailers across 23 countries. We aggregate ratings from Google, Facebook, and Foursquare into a single score — 265,000+ reviews condensed into one number — so you can compare shops at a glance. Filter by sport type, services (rentals, boot fitting, repairs), price level, and location. Anyone can suggest a missing store, no account needed.

### Detailed Description (About section)
I couldn't find a single place to look up and compare winter sport stores near ski resorts. Google Maps shows you pins, but you can't filter by sport type, compare ratings across platforms, or see which shops offer boot fitting vs. rentals.

So I built WinterStores — a free directory covering 1,300+ stores across 23 countries and 387 towns, organised around the resorts people actually travel to. Each store gets a WinterStores Score that condenses 265,000+ Google, Facebook and Foursquare reviews into one comparable number, so a 4.8 from 12 reviews doesn't outrank a 4.4 from 400. Filter by skiing, snowboarding, cross-country, ice skating and more, or by the service you need — rentals, boot fitting, repairs, waxing.

This is the first version and I'd love your feedback. What's missing? What would make this useful for your next ski trip?

### Maker Comment (post immediately after launch)
Hey everyone! I'm the maker of WinterStores.

This started as a personal frustration — every time I planned a ski trip, I'd spend ages Googling rental shops, cross-referencing reviews on Google vs. TripAdvisor vs. Facebook, and still not knowing which ones actually had decent boot fitting.

So I built a directory that pulls it all together. Right now it covers 1,300+ stores in 23 countries with aggregated ratings, sport type filters, and service tags (rentals, repairs, waxing, etc.).

This is very much a v1 — I'd love to hear:
- Are there stores or regions missing that you'd want to see?
- What filters or features would be most useful?
- Any ski resorts where you struggled to find good shops?

You can also suggest stores directly on the site. Thanks for checking it out!

### Topics
Travel, Sports, Community, Directory

### Gallery Screenshots (1270x760, retake from live site)

| Order | Page | URL | What it shows |
|-------|------|-----|---------------|
| 1 | Homepage hero | winterstores.co | Search bar, tagline, sport type pills |
| 2 | Search results | winterstores.co/search?q=zermatt | Filters sidebar, store cards with ratings, map |
| 3 | Store detail | winterstores.co/store/christy-sports-vail | Aggregated rating, About, Google rating, details sidebar, online shop CTA |
| 4 | Browse by Country | winterstores.co/browse | 23 countries grid with store counts |
| 5 | Guide article | winterstores.co/guides/how-to-choose-ski-rental-shop | Table of contents, content, breadcrumbs |

Tips for retaking:
- Use a clean browser (incognito, no extensions)
- Dismiss the cookie banner first
- Window size: 1270x760
- Lead with the hero screenshot — it's the thumbnail

---

## Reddit Posts

### r/skiing

**Title:** I built a free directory to find and compare ski shops near any resort — would love your feedback

**Body:**
Hey r/skiing — I got tired of the Google Maps guessing game every time I needed to find a rental shop or get my boots fitted somewhere new. So I built [WinterStores](https://winterstores.co) — a free directory of 1,300+ winter sport stores across 23 countries.

Each store has an aggregated rating from Google, Facebook, and Foursquare, and you can filter by services (rentals, boot fitting, repairs, waxing), sport type, and price level.

This is the first version and I know there are gaps. I'd really appreciate it if you:
- Check if your local shop or favorite resort-area store is listed
- [Suggest a store](https://winterstores.co/suggest) if it's missing
- Tell me what would make this actually useful for you

Free to use and no sign-up required. There are banner ads to cover hosting — I'd rather that than put a directory behind a paywall.

### r/snowboarding

**Title:** I built a free directory to find and compare snowboard shops near any resort — would love your feedback

**Body:**
Hey r/snowboarding — planning a trip somewhere new always meant the same routine for me: open Google Maps, squint at a dozen shop pins, then cross-check reviews one by one to work out which ones actually carry boards rather than just skis. So I built [WinterStores](https://winterstores.co) — a directory of 1,300+ winter sport shops across 23 countries.

You can filter to snowboarding specifically, then narrow by service — rentals, repairs, waxing, boot fitting — and each shop carries an aggregated score pulled from Google, Facebook and Foursquare so you're not comparing a 4.8 from 12 reviews against a 4.3 from 400.

It's a first version and the gaps are real — coverage is much better in the Alps than in Japan or the Rockies right now. Genuinely useful to me if you'd:
- Check whether your home shop is on there
- [Add one](https://winterstores.co/suggest) if it's missing
- Tell me what would make you actually use this over Maps

Free to use and no sign-up required. There are banner ads to cover hosting — I'd rather that than put a directory behind a paywall.

### r/SideProject

**Title:** I built WinterStores — a free directory to find and compare winter sport shops worldwide

**Body:**
Been working on this side project for a while and it's finally at a point where I'd love feedback.

[WinterStores](https://winterstores.co) is a directory of 1,300+ ski/snowboard/winter sport stores across 23 countries. It aggregates ratings from Google, Facebook, and Foursquare into a single score, and lets you filter by sport type, services, and price level.

**Stack:** Next.js 16, Supabase, Tailwind CSS, Vercel

**What I'd love feedback on:**
- UX/design — does it feel intuitive?
- Missing features you'd expect from a directory
- SEO or performance suggestions

Happy to answer any questions about the build!

### r/indiehackers

**Title:** Launched v1 of WinterStores — a niche directory for winter sport shops. Here's what I learned building it.

**Body:**
Just shipped the first version of [WinterStores](https://winterstores.co), a free directory of 1,300+ winter sport stores in 23 countries.

**The problem:** There's no good way to find and compare ski/snowboard shops near a resort. You end up on Google Maps clicking through individual listings, cross-referencing reviews on different platforms.

**What it does:** Aggregates ratings from Google, Facebook, and Foursquare. Filter by sport type, services (rentals, boot fitting, repairs), and price level. Anyone can suggest a store.

**The build:** Next.js + Supabase + Vercel. Built a discovery pipeline that finds stores near ski resorts via Google Places and Foursquare APIs, with quality gates to filter out hotels and restaurants.

**Monetization plan:** Adsterra ads for now, affiliate rental CTAs next, AdSense once traffic grows.

**What I'm looking for:** Feedback on the product, ideas for growth in a seasonal niche, and whether this kind of directory has legs.

Would love to hear your thoughts!

---

## Launch Checklist

### Pre-launch
- [ ] **Re-check the store and country counts before posting.** Every claim
      below is a number that moves whenever discovery runs — it went from
      1,053/21 to 1,377/23 in a single afternoon. Understating is a wasted
      selling point; overstating is the kind of thing Reddit checks in one click.
      Current: **1,377 stores, 23 countries, 387 cities, 265,375 reviews.**
- [ ] Retake 5 gallery screenshots from live site at 1270x760 (clean browser, no cookie banner)
- [ ] Create/update Product Hunt maker profile (photo + bio)
- [ ] Verify OG image works: paste winterstores.co into opengraph.xyz or Twitter Card Validator
- [ ] Pick launch day: Tuesday, Wednesday, or Thursday

### Product Hunt — launch day
- [ ] Schedule launch for 12:01 AM PT (maximizes upvote window)
- [ ] Fill in listing: name, tagline, link, descriptions, gallery, topics
- [ ] Publish and immediately post the Maker Comment
- [ ] Share PH link on personal social media and relevant Discord/Slack groups

### Reddit — split by audience, NOT posted together

The four posts below are two different audiences with opposite seasonality.
Posting them on one day wastes the half that matters most.

**Now (August–September) — maker audiences, season-independent**
- [ ] r/SideProject — same day as Product Hunt
- [ ] r/indiehackers — the next day
- [ ] Respond to every comment — engagement matters

Nobody in these subs cares that it is August; they are evaluating a build, not
planning a ski trip. These land identically in August and November, so there is
no reason to wait — and the backlinks start ageing now, which matters because
Search Console currently reports **zero** external links to the domain.

**Late October–November — skier audiences, season-critical**
- [ ] r/skiing first (largest audience)
- [ ] r/snowboarding 2–3 hours later
- [ ] Respond to every comment

These are one-shot. Posted in August, r/skiing is not thinking about boot
fitting and the thread dies; posted when people are actually booking trips, the
same post lands. By then the guides written in Phase 2 have had two to three
months to index, so the traffic arrives at pages that can hold it.

### Post-launch (first 48 hours)
- [ ] Monitor and reply to all PH comments
- [ ] Monitor and reply to all Reddit comments
- [ ] Check Vercel Analytics for traffic spikes
- [ ] Track store suggestions and feature requests
- [ ] Fix any bugs that surface same-day

### Timing tips
- Best PH days: Tuesday, Wednesday, Thursday
- Best Reddit timing: Weekday mornings US time
- Don't cross-post on Reddit — write each post individually
