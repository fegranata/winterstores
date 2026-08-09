# WinterStores Action Plan — August 2026

Built from Google Search Console data pulled 2026-08-09 (12-month window).
Supersedes the priority order in `PLAN.md`. `LAUNCH.md` copy still applies,
but see §4 for revised timing.

---

## The diagnosis in one paragraph

The site is indexed but not competitive: **8.58K impressions, 5 clicks, 0.1% CTR,
average position 31.7** over ~4.5 months. The CTR is *normal* for position 31.7 —
this is not a titles/meta problem, and rewriting them would be wasted effort.
Two findings explain almost everything:

1. **Google is refusing to index 602 pages** ("Crawled – currently not indexed",
   and the trend is rising). Only 683 of 1,433 known URLs are indexed.
2. **100% of top queries are branded store-name lookups** — "bründl ischgl",
   "mazzo sports", "replay sports aspen". Zero generic queries, zero
   informational queries.

The cause of both: store pages are ~96% identical to each other. Measured on two
real pages (`br-ndl-sports-ischgl-zentrum-ischgl` vs `br-ndl-sports-ischgl-outlet-ischgl`):
288 vs 287 words, of which only **10 words differ**. Chains make this worse —
5 Christy Sports pages in Telluride, 5 evo pages in Whistler, 5 Telluride Sports
pages — each near-identical, differing only by street address.

Confirmed against the GSC drilldown: 9 of the 10 "crawled, not indexed" examples
are `/store/*` pages, first detected 3/10/26 and still climbing.

**And the Links report says external links: 0.** Not "few" — zero. Google knows
of no site anywhere that links to winterstores.co. That is the other half of the
explanation for position 31.7, and it is unfixable by any amount of on-page work.

So the site has two independent ceilings, and both must lift:

- **Zero authority** caps where the 683 indexed pages can rank. Only links fix this.
- **Duplicative content** stops the other 602 being indexed at all. Links do not
  fix this; Google has already crawled them and declined.

Neither is a titles/meta problem. Do not spend time there.

---

## GSC baseline (2026-08-09) — re-measure against this

| Metric | Value |
|---|---|
| Clicks (12mo) | 5 |
| Impressions (12mo) | 8,580 |
| CTR | 0.1% |
| Average position | 31.7 |
| Indexed pages | 683 |
| Not indexed | 750 |
| — Crawled, currently not indexed | 602 ← *the problem* |
| — Server error (5xx) | 39 |
| — Alternate page with proper canonical | 50 |
| — Discovered, currently not indexed | 25 |
| — noindex / redirects / 404s / other | 34 |
| Store pages in sitemap | 1,053 (now 1,377 — see §1.2) |
| **External backlinks** | **0** |
| Internal links | 4,924 — but see below |

Internal link distribution was badly lopsided. The five nav destinations (`/`,
`/best-ski-shops`, `/browse`, `/guides`, `/resorts`) each receive ~980 links
because they sit in the header on every page. Individual store pages receive
**4–6 each**, and no guide article appeared in the top-linked list at all — nav
chrome was soaking up all the internal equity while the pages that need to rank
got none.

**Addressed 2026-08-09.** Guides now carry `topics` tagged in the same
`SportType`/`ServiceType` vocabulary stores use, and `getGuidesForStore()`
scores them against a store's own services (weight 3) and sports (weight 1),
topping up with the newest guides so every page links out. `RelatedGuides`
renders on all 1,053 store pages and all 83 resort pages, matched on what the
shops nearby actually offer.

Effect: each guide goes from ~0 inbound internal links to hundreds of
*contextual* ones — and because the match is on services, the boot-fitting guide
is linked from boot-fitting shops rather than sitewide. Re-check the Links
report in ~4 weeks; guide articles should start appearing in "Top linked pages".

Note this changes nothing about **external** links, which remain 0 and are the
harder ceiling. Internal linking decides how equity is *distributed*; it cannot
create any.

---

## Phase 0 — Done (2026-08-09)

- [x] Store page ISR 1h → 24h (`6e5380f`) — fixed the Vercel ISR write overage
- [x] Homepage, browse, best-ski-shops, sitemap: force-dynamic → ISR (`295d89a`)
- [x] Homepage canonical added (`295d89a`) — was the only page without one
- [x] best-ski-shops country pages capped at top 30 (`fb2f40b`) — was a
      near-duplicate of /browse/[country]; /best-ski-shops/us went 1,097KB → 192KB

**Likely side effect to verify:** the 39 `Server error (5xx)` pages. The Postgres
pool is capped at `max: 5` (`src/lib/db/index.ts`), and every force-dynamic page
hit it per request. Crawler bursts plausibly exhausted the pool and returned 500s.
Phase 0 should have removed that pressure. Check GSC in ~2 weeks; if 5xx is still
climbing, the pool is the next thing to look at.

---

## API cost — what actually happened, and the rule that follows

Roughly **$260 in two days** ($200 of credit plus €60 out of pocket) went on
Google Places. The cause was not pricing and not the discovery pipeline:
`TTL.google` in `platform-cache.ts` was **30 minutes**, and the fetch path ran
*during page render*. With 1,053 store pages under continuous crawler traffic,
Googlebot was wired directly to the API bill with no ceiling.

Commit `fa26f39` responded by removing the fetch path from the render path
entirely. That stopped the bleeding but went further than intended — ratings
have been frozen since March 2026, and `getOrFetchPlatformRatings` still exists
in `store-search.ts` with **no callers**.

**The rule: a page render must never trigger a paid API call.** Traffic-coupled
spend has no ceiling, and crawlers are traffic.

Fixed 2026-08-09:

- [x] TTLs raised from 30min/6h/12h to 30 days across all three platforms. A
      star rating does not move measurably in half an hour.
- [x] `scripts/refresh-ratings.ts` — scheduled, capped refresh. Oldest-first so
      repeated capped runs eventually cover everything; dry run by default and
      prints the exact call count before `--commit`.
- [x] Render path stays read-only via `getPlatformRatings`. Keep it that way.

Cadence: monthly, e.g. `npx tsx scripts/refresh-ratings.ts --limit 300 --commit`.
A full pass over ~1,050 stores with a place ID is ~1,050 Place Details calls.

**For calibration: discovery was never the expensive part.** It costs 3 Google
Text Search calls per resort — a full 82-resort sweep is ~246 calls, well under
$10. Only the render-path refresh was capable of running away.

---

## Phase 0.5 — Confirmed bugs from the GSC issue detail (fixed 2026-08-09)

Working through each "why pages aren't indexed" bucket turned up three real bugs
and cleared four false alarms.

### Real: unknown URLs returned HTTP 200 instead of 404

Verified against production:

```
/store/zzz-does-not-exist-9999  -> 200   (should be 404)
/browse/zz                      -> 200   (should be 404)
/resorts/zzz-fake-resort        -> 404   (correct — the control)
```

Bogus store/browse URLs rendered a "Store Not Found" body with a 200 status.
Three consequences, the third being the expensive one:

1. Google had to bucket them itself (they show up under noindex/soft-404)
2. Unbounded crawlable URL space that always answers 200
3. **Every unique bogus URL a crawler probed became its own ISR cache entry —
   a billable write.** This is a direct contributor to the quota blowout that
   started this whole investigation.

Fixed with `dynamicParams = false` on **`/store/[slug]` only**. Safe because
`generateStaticParams` enumerates every store and nothing inserts into
`storesTable` at runtime — user suggestions land in `storeSuggestionsTable`, a
separate moderation queue. **Consequence to remember: stores added by the
discovery scripts will 404 until the next deploy.**

`/browse/[country]` was reverted to on-demand ISR — prerendering it times out at
the tail of the build (see "Known fragility" below), and `dynamicParams = false`
without `generateStaticParams` would 404 every country. So `/browse/zz` still
answers 200. That is the far less damaging half: `/store/*` is where crawlers
probe random slugs and mint ISR cache entries, and that is now closed. Paginating
`/browse/[country]` (§1.2 territory — it ships 1.1MB for `/browse/us`) would make
prerendering cheap enough to close this too.

### Real: 6 resort pages render with zero stores

`/resorts/sierra-nevada`, `baqueira-beret`, `kranjska-gora`, `trysil`,
`sunday-river`, `portillo` — all serve "Ski Shops Near X" with no shops, at any
radius. Google files these as soft 404s, correctly. Now `noindex, follow` when
the nearby-store count is zero; they stay usable for humans.

Fix them properly by running discovery for those regions (roadmap #9) — the
noindex then lifts itself automatically on the next build.

### Real: slug diacritics — generator fixed 2026-08-09, existing URLs left alone

`slugify` in both `scripts/discover-stores.ts` and `scripts/scrape/google-places.ts`
now transliterates (ä→ae, ü→ue, ß→ss) and NFD-normalises before stripping, so
new imports produce `bruendl-sports-ischgl`, `sportgeschaeft`, `brasov`,
`kitzbuehel` instead of `br-ndl`, `sportgesch-ft`, `bra-ov`, `kitzbuhel`.

**The existing 1,053 URLs were deliberately not migrated.** An earlier count of
"144 mangled slugs" conflated genuine diacritic damage with slugs that merely
predate the current naming scheme (`christy-sports-vail` →
`christy-sports-vail-bridge-street-vail`). Renaming live URLs needs 301s for
marginal gain on pages sitting at position 31. If store content is ever
regenerated wholesale, do it in that same pass — not as a standalone migration.

Note `src/lib/data/resorts.ts` already had a correct NFD-normalising slugify;
only the `scripts/` copies were broken.

### False alarms — no action needed

- **Alternate page with proper canonical (50)** — every example is a `www.`
  URL correctly resolving to the apex. Historical: the count fell from ~450 to
  ~50 right after the www redirect landed in `31fdd39`. Self-healing.
- **Page with redirect (12)** — `www.` and `http://` variants. Working as intended.
- **Redirect error (1)** — `www.winterstores.co/store/waves-furano`, last crawled
  Mar 30, pre-dates the www fix.
- **Excluded by noindex (11)** — mostly `/search?…`, which `PLAN.md` step 2.6
  deliberately noindexes. Correct. The two store URLs and `/browse/cz` in this
  bucket were the 200-instead-of-404 bug above.

### ~~Known fragility: the build is at its limit~~ — resolved 2026-08-09

**This was a query bug, not a capacity limit, and the original diagnosis was
wrong.** Adding `generateStaticParams` to the country-listing routes made them
hang past a 180s per-page timeout, and the failure followed whichever route ran
at the tail of the build. That looked like connection-pool saturation from sheer
page count. It wasn't.

`getStoresByCountry` and `getRegionsByCountry` compared `LOWER(country_code)`,
which defeats `idx_stores_country_code` and forces a sequential scan — and
neither they nor `getUniqueCountries` were `cache()`-wrapped, so browse and
best-ski-shops each ran the same full scans two or three times per render,
across 15 concurrent workers.

With the column compared directly and all three helpers cached, the same build
prerenders **1,227 pages in 11 seconds**. All three routes are now `●` SSG with
a 24h revalidate:

```
├ ● /best-ski-shops/[slug]      1d   1y
├ ● /browse/[country]           1d   1y
├ ● /browse/[country]/[page]    1d   1y
```

That unlocked the two items that were blocked on it: `dynamicParams = false` now
closes the soft-404 hole on `/browse/*`, and the routes are genuinely cached
rather than serving `no-store` on every request.

`/browse/[country]` is also paginated at 48 per page — **paginated, not capped**,
because this route is the main source of internal links into store pages (each
store has only 4–6). A top-N cap would have deleted most of them; splitting
keeps every store linked exactly once. Paginated URLs are in the sitemap, each
self-canonical, since every page lists a distinct set of stores.

A related symptom from the same cause: one build died with
`TypeError: Cannot read properties of undefined (reading 'toFixed')` on two
store pages that render perfectly in dev. A query returned empty mid-render
under pool pressure, so a score arrived `undefined`. Mitigated two ways —
`RatingStars` and the store page now tolerate a non-numeric rating, and the
pool went from `max: 5` to `max: 10` with explicit idle/connect timeouts. Almost
certainly the same root cause as the 39 GSC `Server error (5xx)`.

**This is the ceiling to watch.** ~1,200 DB-backed prerendered pages takes >10
minutes locally and is one growth spurt away from failing on Vercel too. The
lever is prerendering fewer pages — which §1.1's pruning delivers for free.
`staticPageGenerationTimeout` is raised to 180s for headroom in the meantime.

---

## Phase 1 — Make the pages worth indexing (blocks everything else)

This is the highest-leverage work on the list. Until it lands, links and content
elsewhere are pushing against a door Google is holding shut.

### 1.1 — The fate of the 602 — **done 2026-08-09**

Measuring the corpus killed the original plan. Pruning "pages with no unique
content" would have meant noindexing **1,021 of 1,053 pages**:

| Signal | Stores that have it |
|---|---|
| Any written description | **32** |
| Description ≥200 chars | **0** |
| Any photo | **0** |
| ≥3 services | 32 |
| ≥10 reviews | 988 |
| A website | 1,006 |
| No website *and* <5 reviews (true ghosts) | **12** |

There is no useful middle signal — a quality bar either keeps ~everything or
~nothing. So pruning alone could not have worked, and the chosen route was
**compose descriptions from data that already exists, and prune only the 12
genuine ghosts.**

- [x] `src/lib/store-description.ts` composes a factual summary from services,
      sports, price level, city/region, score, review count and distance to the
      nearest resort. A **render-time fallback, not a DB migration**: written
      descriptions still win, new stores are covered with no backfill, and it
      can be reverted in one commit rather than unpicked from 1,021 rows.
      Phrasing is chosen by a stable hash of the slug so two shops with
      near-identical facts still read differently.
- [x] The composed text also replaces the old meta description, which was
      identical boilerplate on every store page and made a poor snippet.
- [x] `isGhostStore()` drives `noindex, follow` on the 12, and removes them from
      the sitemap so the two signals agree (1,053 → 1,041 URLs).

**Measured effect** on the two Bründl Ischgl pages that motivated this:

| | Before | After |
|---|---|---|
| Page length | 288 words | 525 words |
| Distinguishing vocabulary between the two | **10** | **39** |

**Be honest about what this is.** Composed factual summaries are a large
improvement on ten-words-different, and they are what every legitimate
directory does — but they are not editorial content. If "Crawled – currently
not indexed" has not started falling in 4–6 weeks, the next lever is genuine
per-store copy for the shops that matter most, not more generation.

### 1.2 — Resort coverage: the discovery script cannot fill the gaps as-is

8 resorts have **zero** stores within 30km (Laax, Hakuba, Trysil, Sunday River,
Portillo, Sierra Nevada, Baqueira-Beret, Kranjska Gora) and 30 have fewer than
five — including Jackson Hole, Crested Butte, Åre, Nozawa and Thredbo at 1 each.
Meanwhile Chamonix has 40 and Lech 41. `LAUNCH.md` invites people to "check if
your local shop is listed", so these gaps are launch-visible.

**Resolved 2026-08-09 — 324 stores added, corpus 1,053 → 1,377.**

The first dry run over those 18 resorts found only 35 candidates, ~11 usable,
with 15 resorts returning nothing at all. Both causes were bugs in the script,
not thin terrain:

1. **Every query was throwing its results away.** `c.types.includes(...)` on a
   Google address component with no `types` field threw, and the `catch`
   returned `[]` — discarding every result collected before the bad one. Nothing
   was logged, so a crashed search looked exactly like a resort with no shops.
   Google was in fact returning 40–60 places per resort the whole time.
2. **The 50km radius was never enforced.** Google treats `locationBias` as a
   bias, not a filter. Portillo returned Santiago shops 70km away; Kranjska Gora
   reached 105km to an Adriatic beach town, surf shop included.

Also fixed: blacklist terms matched as substrings, so `"inn"` rejected
Intersport **Inn**sbruck and `"bar"` rejected **Bar**donecchia. Now whole-word.

Same 18 resorts after the fixes: **670 passed gates, 333 new after dedup, none
beyond 50km**, median distance 5.7km, 293 of 333 with websites. Portillo still
yields 0 — correctly, it genuinely has nothing within 50km.

Per-resort diagnostics now print raw/kept/gate-failures/out-of-radius plus top
rejection reasons and any API error, so silent zero-yield can't recur.

Cost: ~54 Google Text Search calls per full 18-resort run, about $2.

**Follow-up from the insert:** 9 stores whose names are entirely Japanese,
Korean or Chinese produced city-only slugs (`/store/hakuba`) because the ASCII
pass stripped the name to nothing. `slugify` now NFKC-normalises (folding
full-width Latin) and falls back to city + place-id suffix. The 9 rows were
repaired in place. This is also the likely explanation for the script reporting
336 inserts while the table grew by 324 — slug collisions.

**Watch this against Phase 1.** These 324 pages are new thin pages, in the
middle of fixing 602 that Google already declined. They do get composed
descriptions automatically, and they fill launch-visible gaps at famous resorts,
but if "Crawled – currently not indexed" climbs rather than falls at the next
check, this batch is the first thing to suspect.

### 1.3 — Break up chain near-duplicates

Five Christy Sports Telluride pages that differ by a street address will never
all get indexed, and they dilute each other.

- [ ] Identify chains: same name stem + same city, count > 1
- [ ] Either consolidate to one page per chain-per-town with locations listed,
      or ensure each location page carries genuinely distinct content
- [ ] Known clusters: Christy Sports Telluride (5), Telluride Sports (5),
      evo Whistler (5), Sport* Livigno (5), Skimium Les Deux Alpes (4),
      Intersport Crans-Montana (4), Breck Sports Breckenridge (4)

### 1.4 — Fix the slug diacritics bug

`slugify()` in `scripts/discover-stores.ts:386` lowercases then applies
`.replace(/[^a-z0-9]+/g, "-")`, which deletes every non-ASCII character instead
of transliterating it. `scripts/scrape/google-places.ts:76` has the same bug via
`[^\w\s-]`.

Result: `Bründl` → `br-ndl`, `Sportgeschäft` → `sportgesch-ft`, `Brașov` → `bra-ov`.
At least 17 live URLs are affected. It also weakens the term match for exactly the
branded queries the site currently ranks for ("bründl ischgl" is the #4 query at
46 impressions).

```ts
const TRANSLITERATE: Record<string, string> = {
  ä: "ae", ö: "oe", ü: "ue", ß: "ss", å: "a", æ: "ae", ø: "oe",
};

function slugify(name: string, city: string): string {
  return `${name}-${city}`
    .toLowerCase()
    .replace(/[äöüßåæø]/g, (c) => TRANSLITERATE[c] ?? c)
    .normalize("NFD")                 // separate accents from base letters
    .replace(/[̀-ͯ]/g, "")  // strip the accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
```

- [ ] Fix both `slugify` implementations
- [ ] Note: this only affects *future* inserts. Existing slugs live in the DB.
      Migrate them **as part of 1.1/1.2**, not as a separate step, and 301 the
      old URLs. There is little ranking equity to lose at position 31.

---

## Phase 2 — Build pages that can actually rank

Branded store-name queries are the worst query class available: the shop's own
site and its Google Business Profile will always outrank a directory, and the
searcher's intent is satisfied elsewhere. The site currently ranks for *nothing else*.

### 2.1 — Guides are the only winnable surface

Informational queries have no local pack and no incumbent brand. This is the one
place a new domain can rank. 9 published guides is far too few to matter.

- [ ] Target 25–30 guides by end of September
- [ ] Prioritise buyer-intent long-tail: boot fitting, ski vs snowboard rental
      cost, what to check before renting, season-pass comparisons, beginner gear
      checklists, "renting vs buying" — questions with no obvious Maps answer
- [ ] Interlink guides → relevant store/resort pages to pass authority inward

### 2.2 — Resort pages are the second-best surface

83 resort pages already exist. "ski shops in [resort]" is more winnable than
"[shop name]" and matches the actual trip-planning intent the site is built for.

- [ ] Audit whether resort pages have unique content or are the same template problem
- [ ] Make each resort page the definitive "where to rent/buy at [resort]" answer

---

## Phase 3 — Authority

Necessary, but it lifts the 683 indexed pages; it does not unlock the 602.
Run it in parallel with Phase 1–2, not instead of them.

### Now — audience-independent (do in August)
- [ ] Product Hunt launch. Maker audience, unaffected by ski season, and the
      listing gets syndicated across aggregators — that link value compounds
      over months, so delaying it costs the whole season.
- [ ] r/SideProject and r/indiehackers. Also maker audiences; these land the
      same in August as in November.
- [ ] Directory / "built with Next.js" showcase submissions

### Late October–November — audience-dependent
- [ ] r/skiing, then r/snowboarding a few hours later
- [ ] Write the two genuinely differently. `LAUNCH.md` currently has them as
      near-identical copy while its own checklist says not to cross-post.
- [ ] By then the Phase 2 guides have had 2–3 months to index and age

### Fix before anything is posted publicly
- [ ] `LAUNCH.md` claims "1,100+ stores" in 6 places; the real number is 1,053.
      Use "1,000+".
- [ ] The r/skiing and r/snowboarding drafts say "No ads, no paywalls." That is
      currently true — `AD_PROVIDER` resolves to `"none"` in production and no ad
      scripts render. If ads get switched on around launch, that line becomes a
      lie people will call out. Decide which way before posting.

---

## Phase 4 — Revenue, ready before the season

### 4.1 — Ads are on and working. Two earlier entries here were wrong.

**Current state, verified in a real browser on production:**
`NEXT_PUBLIC_AD_PROVIDER=adsterra` is set in Vercel, both Adsterra scripts load
(native `profitablecpmratenetwork` and rectangle `highperformanceformat`), the
`atOptions` inline script fires, the native container is populated with
Adsterra's own markup, and a 300×250 ad iframe is present. Favorites, share and
the report form all work; clicking favourite writes to localStorage.

**Nothing here needs fixing.** Two claims previously written in this file were
false and have been removed:

1. "Every ad unit ID is empty / monetization is structurally zero." Wrong. The
   AdSense and Media.net maps are empty, but Adsterra is fully configured.
   That conclusion came from curling HTML and grepping for ad script URLs —
   a method that could never detect Adsterra, which injects client-side.
2. "Ads are enabled but render nothing; `AdSlot` never hydrates; the Suspense
   boundary never resolves." Also wrong, and the reason matters.

**Why that second diagnosis was wrong — worth remembering.** It was produced
entirely inside the in-app preview browser, which does **not** complete React
19's streaming Suspense resolution. In that environment `/store/[slug]` appears
frozen: `<div hidden id="S:0">` never unhides, `<template id="B:0">` stays put,
the `loading.tsx` skeleton remains in `<main>`, no React fibers attach below the
boundary, and no client effect ever runs. Every one of those symptoms is an
artifact of the tool. In real Chrome the boundary resolves, fibers attach, and
ads render.

**Rule for future debugging: never diagnose hydration, Suspense, streaming or
client-side script injection in the in-app preview browser.** Use real Chrome.
The preview browser is fine for HTML/DOM structure and network inspection, not
for anything downstream of hydration.

- [x] `LAUNCH.md` copy fixed 2026-08-09 — the "No ads, no paywalls" line was an
      error (ads *are* live), replaced with an honest ad-supported line. Store
      count corrected from "1,100+" to "1,000+" (actual: 1,053). The
      r/snowboarding post is now genuinely different from r/skiing rather than a
      verbatim copy, which the checklist in that file already warned against.
- [ ] Revenue is now a question of traffic, not plumbing. With 5 clicks in 12
      months there is nothing to monitor yet; revisit once Phase 2 and 3 land.

### 4.2 — Affiliate programmes (researched 2026-08-09, nothing built yet)

Deliberately not scaffolded: which programmes accept you changes the design.

**The key finding is that gear retail is the wrong category to lead with.**
Traffic intent here is "find a rental shop near this resort", so rental booking
matches intent far better and should convert several times higher than sending
people to buy skis.

**Tier 1 — matches intent, start here**

| Programme | Terms | Why |
|---|---|---|
| Skiset (via Awin) | 30-day cookie; rate "varies by results" | 800 shops / 450+ resorts, heavy overlap with our listings |
| Snowrental (via Awin) | Per-booking commission | Same group as Skiset; 1,000 shops / 400 resorts |
| Ski-Lifts | up to 10% | Resort transfers — high-intent adjacent purchase |

Skiset and Snowrental are both Ski Company group and both on Awin, so one
application covers both.

**Tier 2 — gear, for pages with no rental angle**

Peter Glenn 9–12% with a **150-day cookie** (unusually long, worth having as the
fallback), OutdoorMaster 15%, Backcountry 4–12%, UtahSkis 10%, evo 5%, Burton up
to 6%, REI 5% but only a 15-day cookie.

**Tier 3 — highest margin, weakest fit**

Travel insurance pays 20–25% (Allianz) and converts well for adventure sports,
but it is a stretch from "which shop should I rent from". Guide pages only, not
store pages.

- [ ] Apply to Awin for Skiset + Snowrental. Approval takes weeks and some
      programmes vet publisher traffic — with 5 clicks in 12 months a decline is
      possible, which is exactly why applying early matters.
- [ ] Add Peter Glenn as the gear fallback, for the cookie length.
- [ ] Implementation once accepted is small: an env-driven config mirroring
      `ad-config.ts`, plus a CTA on store pages. Roughly half a day.

---

## Sequencing summary

| When | What | Why then |
|---|---|---|
| Aug wk 2–3 | Phase 1 (prune, chains, slugs) | Gates everything; Google is rejecting 57% of pages |
| Aug wk 2 → Sept | Phase 2.1 (guides to ~25–30) | Needs 2–3 months to index and age before the season |
| Aug wk 3 | Phase 3 "now" (PH, maker subs) | Link equity compounds; season-independent |
| Sept | Phase 2.2 (resort pages), Phase 4 | Revenue must precede traffic |
| Late Oct–Nov | Phase 3 "later" (skier subs) | Audience is only receptive in season |

## What to re-measure in 4 weeks

1. "Crawled – currently not indexed" — must be *falling*. This is the Phase 1 KPI.
2. Server error (5xx) — should be at zero after the ISR change.
3. Query mix — any non-branded query appearing at all is the Phase 2 leading indicator.
4. Average position — expect movement only after 1 and 3 improve.
