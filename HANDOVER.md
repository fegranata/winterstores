# WinterStores — Handover

Written 2026-08-27, so nothing important lives only in a Claude account that is
about to change. Everything here previously existed either in assistant memory
(machine-local, lost on account change) or only in a session transcript.

**Where the source of truth lives now:**

| Document | Contents |
|---|---|
| `ACTION_PLAN.md` | Live plan. SEO/indexing diagnosis, GSC baseline to measure against, phased priorities. Read this first. |
| `LAUNCH.md` | Product Hunt + Reddit copy, gallery targets, phased launch checklist. |
| `HANDOVER.md` (this file) | Standing decisions, runbooks, and the mistakes worth not repeating. |
| `PLAN.md` | Historical implementation plan. Superseded by `ACTION_PLAN.md`. |

---

## The one lesson that cost the most

**Three separate quotas were blown in a single day, and all three were the same
mistake: a per-page cost multiplied by a number nobody was tracking.**

| Quota | Per-page cost | Multiplier | Damage |
|---|---|---|---|
| Vercel ISR Writes (200k/mo) | 1 write per page | 1-hour TTL × 1,053 pages | 100% of free tier |
| Google Places | 1 API call per render | 30-minute cache TTL | **$260 in two days** |
| Supabase egress (5.5GB) | **71 DB rows per page** | 1-hour TTL × 1,053 pages | ~26 GB/month |

**The rule: anything that runs per page render or per build is multiplied by
traffic you do not control, and crawlers are traffic.** Check the multiplier
before shipping the query, not after the email arrives.

Two corollaries learned the hard way:

- **A page render must never trigger a paid API call.** Traffic-coupled spend
  has no ceiling.
- **Rebuilding is not free either.** ~18 full builds in one day cost ~0.67GB of
  Supabase egress. Batch changes on a corpus this DB-heavy.

---

## Standing decisions — do not quietly reverse these

### Never block crawlers to save quota

`src/app/robots.ts` allows all user agents **on purpose**. Do not propose
blocking GPTBot, ClaudeBot, OAI-SearchBot, Claude-SearchBot, PerplexityBot,
ChatGPT-User or Claude-User to reduce Vercel usage.

Crawler traffic *was* the driver of the ISR overage, but the cause was the TTL,
not the bots. Blocking them would sacrifice AI-answer citability and SEO reach
for savings that TTL tuning already delivered. If usage spikes again the levers
are, in order: ISR TTL, on-demand `revalidatePath` after import scripts,
`dynamicParams`. Only `AhrefsBot`/`SemrushBot`/`MJ12bot`/`DotBot` (pure backlink
databases, no upside) are fair game, and only as a last resort.

### Google is the only sign-in provider

`src/app/login/page.tsx` calls `signInWithOAuth({ provider: "google" })` with no
email/password fallback. **If the Google OAuth client is deleted, sign-in,
reviews and favourites-sync all break.** Google deletes OAuth clients after 5
months of inactivity — see the runbook below.

### Ads are live and working

`NEXT_PUBLIC_AD_PROVIDER=adsterra` is set in Vercel and the Adsterra
integration is complete (leaderboard, mobile, rectangle, native keys hardcoded
in `AdSlot.tsx`). Verified rendering in a real browser. Revenue is a traffic
problem, not a plumbing problem.

`LAUNCH.md` no longer claims "no ads" — that was an error in the original copy
and would have been disprovable in one click on Reddit.

### Discovery quality gates exist now

The pipeline originally had none, and imported hotels, bars and ski schools at a
~2.1% bad rate. `discover-stores.ts` now has: Google Places `types` rejection, a
whole-word name blacklist, a name/type whitelist, website-domain rejection, and
a hard distance filter. Do not remove these.

---

## Runbooks

### Keep the Google OAuth client alive

Google emails "[Action Advised] Manage your unused OAuth clients" after 5 months
of inactivity, then deletes in 30 days. Deletion breaks sign-in entirely.

**Fix:** sign in with Google once at <https://winterstores.co/login>. A single
successful sign-in resets the clock. Set a recurring reminder — with the current
traffic (5 clicks in 12 months) no real user will do it for you.

### Add store coverage for a resort

Costs ~3 Google Text Search calls per resort (~$0.10). **All three steps
required** — discovery alone leaves stores rendering "0.0" with no reviews.

```bash
npx tsx scripts/discover-stores.ts --resorts "Laax,Hakuba"              # dry run, review output
npx tsx scripts/discover-stores.ts --resorts "Laax,Hakuba" --auto-insert
npx tsx scripts/verify-stores.ts                                        # REQUIRED — fetches ratings
```

Per-resort diagnostics print raw/kept/gate-failures/out-of-radius. A resort
yielding zero should say why; if it goes silent again, that is a regression.

### Refresh platform ratings (monthly)

```bash
npx tsx scripts/refresh-ratings.ts --limit 300            # dry run, prints exact call count
npx tsx scripts/refresh-ratings.ts --limit 300 --commit
```

Oldest-first, so repeated capped runs eventually cover everything. **The render
path must stay read-only** (`getPlatformRatings`, never
`getOrFetchPlatformRatings`) — that coupling is what cost $260.

Note `verify-stores.ts --dry-run` **still makes the API calls**; it previews the
writes, not the spend. Budget one pass, not two.

---

## Debugging gotchas that produced wrong conclusions

Both of these caused confidently-wrong diagnoses in the session that produced
this file. Worth knowing before repeating them.

**Never diagnose hydration, Suspense, streaming or client-side script injection
in the in-app preview browser.** It does not complete React 19 streaming
Suspense resolution. Store pages appear completely broken there — `div hidden
id="S:0"` never unhides, the `loading.tsx` skeleton stays in `<main>`, no React
fibers attach, no client effect runs, no ad script injects. **All of it is an
artifact.** Real Chrome resolves normally. This led to reporting a fabricated
site-wide outage.

**Do not grep server HTML for client-injected scripts.** Adsterra injects via
`useEffect`, so it never appears in server HTML whether enabled or not. This led
to reporting monetization as "structurally zero" when ads were live.

**Check the right exit code.** `npm run build | tail` returns *tail's* status.
`grep -c` exits 1 when the count is zero, so a chain ending in `grep -c` reports
failure on a clean run. Both produced false readings — one hid two failed
deploys, the other reported a green build as failed.

---

## State as of 2026-08-27

**Data:** 1,377 stores, 23 countries, 387 towns, 265,375 aggregated reviews,
83 resorts, 9 guides. 25 stores are `noindex` ghosts (no website, <5 reviews).

**Rendering:** every route prerendered (`●`) with a 24h revalidate except
`/search` (noindex, dynamic by design). `/store/[slug]` has
`dynamicParams = false`, so **stores added by scripts 404 until the next
deploy** — always redeploy after an import.

**The two ceilings on traffic, both still in place:**

1. **External backlinks: 0.** Google knows of no site linking to
   winterstores.co. Caps where the indexed pages can rank. Only links fix it.
2. **602 pages "Crawled – currently not indexed."** Store pages were ~96%
   identical; composed descriptions (`src/lib/store-description.ts`) were the
   fix, and the KPI is whether that 602 falls.

Average position 31.7 with 0.1% CTR is *normal for that position*. It is not a
titles/meta problem — do not spend time rewriting them.

---

## Highest-value open items

1. **Product Hunt + r/SideProject + r/indiehackers now.** Maker audiences,
   season-independent, and the only lever on the zero-backlink ceiling. Copy is
   ready in `LAUNCH.md`; re-verify the store counts first, they move.
2. **r/skiing + r/snowboarding late October.** One-shot, season-critical. Copy
   ready and deliberately differentiated.
3. **More guides.** 9 is too few. The only page type that can rank for queries
   with no local pack and no incumbent brand.
4. **Affiliate programmes.** Apply to Awin for Skiset + Snowrental (one
   application, best intent match — rental booking beats gear retail for this
   traffic). Research and rationale in `ACTION_PLAN.md` §4.2.
5. **Re-check GSC in mid-September.** "Crawled – currently not indexed" falling
   from 602 is the single metric that says whether the content work worked.
