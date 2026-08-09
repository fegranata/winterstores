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
| Store pages in sitemap | 1,053 |
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

### Real: slug diacritics — see §1.3

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

### Known fragility: the build is at its limit

**The country-listing routes cannot be prerendered.** Adding
`generateStaticParams` to `/best-ski-shops/[slug]` made those 21 pages hang past
a 180s per-page timeout; removing it and adding the same to `/browse/[country]`
moved the identical failure there. It is not route-specific and not query cost —
it is whichever DB-heavy listing route runs at the *tail* of the build, after
~1,000 store pages have saturated the connection pool. Both now generate on
first request under ISR.

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

### 1.1 — Decide the fate of the 602

Two viable strategies. **Pick one, don't half-do both.**

**Option A — Enrich (better ceiling, more work).** Give each store page enough
unique content that it earns its index slot: a written description per store,
per-store service detail, opening hours, price context, nearby-resort context,
real reviews. Realistically needs generated-then-reviewed copy; ~1,053 stores is
too many to hand-write.

**Option B — Prune (faster, safer, lower ceiling).** `noindex` the store pages
that have no unique content — no description, no platform ratings, no photos —
and keep only the ones that stand up. They stay on the site and remain usable
for humans; they just leave the index. This concentrates crawl budget and removes
the sitewide quality drag.

**Recommendation: B first, then A on the survivors.** Pruning is a days-long job
with an immediate effect on the quality signal; enrichment is a months-long job.
Do the cheap structural fix, then invest in depth on the pages worth keeping.

- [ ] Add a `hasSubstantiveContent` check (description present AND ≥1 platform
      rating AND ≥3 services) driving `robots: { index: false }` in
      `generateMetadata` for store pages that fail it
- [ ] Exclude noindexed stores from `src/app/sitemap.ts`
- [ ] Record the before/after count — this number is the KPI for Phase 1

### 1.2 — Break up chain near-duplicates

Five Christy Sports Telluride pages that differ by a street address will never
all get indexed, and they dilute each other.

- [ ] Identify chains: same name stem + same city, count > 1
- [ ] Either consolidate to one page per chain-per-town with locations listed,
      or ensure each location page carries genuinely distinct content
- [ ] Known clusters: Christy Sports Telluride (5), Telluride Sports (5),
      evo Whistler (5), Sport* Livigno (5), Skimium Les Deux Alpes (4),
      Intersport Crans-Montana (4), Breck Sports Breckenridge (4)

### 1.3 — Fix the slug diacritics bug

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

- [ ] Affiliate booking CTAs (roadmap P0 #2). Must be live *before* the traffic
      arrives, not after — otherwise the season converts nothing.
- [ ] Decide the ads question. Right now monetization is structurally zero:
      `NEXT_PUBLIC_AD_PROVIDER` is unset or `none` in Vercel, and every ad unit
      ID in `AdSlot.tsx` is an empty string. "Monitor ad revenue" is not
      actionable until this is switched on.

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
