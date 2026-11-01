# Go-Live Checklist — September 2026

The working list for taking WinterStores from "deployed" to "launched", in
order. Built 2026-09-07 after two alert emails (Vercel ISR at 100%, GSC noindex
validation failed). Background lives in `ACTION_PLAN.md` and `HANDOVER.md`.

## 0b — Incident 2026-11-01: bot farm → /search → Supabase suspended

Found via the Vercel dashboards while investigating "traffic from Singapore":
- Vercel Analytics (7d): 1,102 visitors, **80% Singapore, 97% Windows
  desktop**, `/search` 264 visitors vs 8 on the homepage. Headless browsers
  (they run the analytics JS), not people.
- Vercel Firewall (24h): **22.2k of ~31k requests from Tencent Cloud**
  (AS "Tencent Building, Kejizhongyi Avenue"), one JA4 fingerprint
  (`t13d131000_f57a46bbacb6_e7c285222651`) = 18k requests, rotating fake
  Chrome user agents. Top path `/search` 5.0k/day. Bot Protection was
  inactive, zero custom rules.
- Supabase: egress **6.42 / 5 GB (128%)**, ~150–370 MB/day all cycle →
  **"All services restricted", REST/Auth answer 402** until the Nov 3
  reset. Direct Postgres (what the app uses) still works, so prerendered
  pages and SSR survive; Supabase Auth sign-in and anything via the REST
  API do not.
- Root cause in code: `searchStores` ran `SELECT *` with no LIMIT and
  filtered in JS — ~1MB egress per request. Fixed 2026-11-01: every filter,
  sort and page now runs in SQL; ~15KB per page; limit/page/query length
  clamped. Fourth instance of the HANDOVER.md multiplier rule.

- [x] Code fix shipped (`searchStores` in SQL).
- [x] **Vercel Firewall rules published 2026-11-01** (approved by Fernando):
      `Deny Tencent Cloud bot farm` (AS Number = 132203, action Deny),
      `Challenge bot-farm JA4 fingerprint` (JA4 Digest =
      `t13d131000_f57a46bbacb6_e7c285222651`, action Challenge), and Bot
      Protection set to Challenge. The "AI Bots" blocker in the same panel
      was deliberately left OFF — see the crawler policy in HANDOVER.md.
      Hobby plan allows 3 custom rules + 3 rate limits; one rule slot left.
      If the bot moves networks, the next lever is a rate limit on
      `/search` (per-IP, ~30 req/min).
      **Side effect to remember:** Bot Protection challenges every
      non-browser client, so `curl` health checks and scripts now get a 429
      challenge page instead of HTML. Verify the site in a real browser.
      Verified bots (Googlebot, Bingbot) and known AI crawlers pass; if GSC
      coverage ever drops after this date, switch Bot Protection to Log
      first before suspecting anything else.
- [ ] **Adsterra:** the bot executes JS, so it has been generating ad
      impressions for weeks. Check the publisher dashboard for an
      invalid-traffic warning before it becomes a suspension.
- [ ] Supabase: either wait for the Nov 3 reset (free) or upgrade to Pro to
      lift the 402 today. Sign-in is broken until one of those happens.
- [ ] After reset: confirm egress/day drops to single-digit MB.

## 0 — Stabilise (this week, blocks everything)

- [ ] **Push and deploy the ISR write fix** (`29bde11`). Listing routes went
      24h → 7d, sitemap 6h → 24h. Root cause of the "100% of ISR Writes" email
      is understood: Vercel bills writes in **8KB units** — one ~60–100KB
      page regeneration costs ~8–13 units, so ~1,550 regenerations/day read as
      ~12,000 units/day.
- [ ] **Dashboard verdict (checked 2026-09-07): the Aug 27 fix worked.**
      Writes fell from 11–16k/day to ~1–2k/day the day after `240eda7`
      deployed. Steady state is already under quota (~30–60k/month); this
      commit trims it further. The alarming 220k/200k readout was the rolling
      30-day graph window (pre-fix Aug 8–27 burn + one deploy spike); the
      billing cycle is calendar-month and September sits at ~20k — no pause
      risk, safe to deploy now.
- [ ] **New rule from the Sep 3 spike: a full deploy costs ~12–17k write
      units** (~1,400 prerendered pages × ~9 units) — **6–8% of the monthly
      free quota per deploy.** The Vercel edition of "rebuilding is not free"
      (`HANDOVER.md`). Batch changes into as few deploys as possible; don't
      redeploy casually. No Pro upgrade needed at current burn.
- [ ] **GSC noindex email: no action — do not "fix".** The failed validation
      for `Excluded by 'noindex' tag` covers pages that are noindexed **on
      purpose**: `/search`, `/login`, `/profile`, `/favorites`, ghost stores,
      and zero-store resort pages. Google validating that they still carry
      noindex is the system working. Don't re-run Validate Fix on that bucket.
- [ ] **Google OAuth keep-alive**: sign in once at winterstores.co/login and
      set a recurring (quarterly) reminder. Google deletes idle OAuth clients
      after 5 months + 30 days; deletion breaks sign-in, reviews and
      favourites-sync (runbook in `HANDOVER.md`).

## 1 — Launch, maker audiences (immediately after §0 deploy)

Copy is ready in `LAUNCH.md`. This is the only lever on the zero-backlink
ceiling and it was planned for August — it is already late.

- [x] Counts re-verified against the live DB 2026-09-07 — all exact. Also
      fixed a false claim: the copy said scores aggregate Google, Facebook
      and Foursquare, but the ratings are 100% Google. Copy now pitches the
      volume-weighted score without naming platforms (details in
      `LAUNCH.md` pre-launch section).
- [x] **Product Hunt launch posted 2026-09-07** — with Snow sports / Travel
      tags and shoutouts. First external backlinks ever for the domain.
- [x] **r/SideProject posted 2026-09-07.**
- [ ] r/indiehackers: blocked by a minimum-activity requirement — comment
      genuinely on a few threads over the coming days, then post. Meanwhile
      consider indiehackers.com itself (the forum, separate from the
      subreddit) — product pages and launch posts are its core content.
- [ ] Directory / "built with Next.js" showcase submissions.
- [ ] **Launch-day duty: respond to every PH and Reddit comment** — engagement
      drives both algorithms, and comments are feature requests in disguise.
- [ ] Watch quota dashboards during launch week — launch traffic is exactly
      the multiplier the three August quota fires were about. (Risk is much
      lower now: 7-day TTLs and full prerendering mean spikes hit the edge
      cache, not regeneration.)

## 2 — Revenue plumbing (parallel with §1, before season)

- [ ] Apply to **Awin for Skiset + Snowrental** (one network account covers
      both — same group). Step-by-step, verified 2026-09-07:
      1. Sign up at ui.awin.com/publisher-signup — user details, then
         publisher details: site URL `winterstores.co`, type "content /
         comparison site", and a promotion description (suggested: "Free
         directory of 1,300+ ski and snowboard shops near 83 resorts;
         review-weighted scores and service filters. Rental-booking CTAs
         will sit on store and resort pages matched to user intent.").
      2. Pay the ~$5/£5 verification deposit (card; refunded with the first
         commission payment). Applications are manually reviewed, usually
         within 1-2 working days.
      3. Verify the account from the confirmation email, then add payment
         details (Account > Payment Details) so approvals aren't blocked.
      4. In the platform: Advertisers > Join Programmes, search "Skiset" and
         apply; repeat for "Snowrental". Each advertiser approves separately
         — days to weeks, which is why this starts now.
      5. While waiting, optionally apply to Peter Glenn (gear fallback,
         150-day cookie — via its own network, see ACTION_PLAN.md §4.2).
      6. On acceptance: build the env-driven affiliate config mirroring
         `ad-config.ts` + store-page CTA (~half a day, Claude task).
      Rationale and programme tiers in `ACTION_PLAN.md` §4.2.
- [ ] Add Peter Glenn as the gear fallback (150-day cookie).
- [ ] Once accepted: env-driven affiliate config mirroring `ad-config.ts` +
      store-page CTA (~half a day). Nothing to build before acceptance.
- [ ] Ads: nothing to do — Adsterra is live and verified. Leave it alone.

## 3 — Content (September, needs 2–3 months to age before season)

- [x] **Guides 8 → 23 (2026-09-07).** Fifteen new buyer-intent guides:
      rental checklist, ski vs snowboard, snowboard gear + boot fit, custom
      footbeds, season passes, used gear, repairs, storage, adult lessons,
      kids' gear, flying with gear, cross-country, snowshoeing, sales
      calendar. Every service in the matching vocabulary now has a primary
      guide (custom-fitting, repairs, storage, used-gear were uncovered), and
      snowboarding/cross-country/snowshoeing get their first coverage.
- [x] Four more guides 2026-09-07 (helmet fit, goggle lenses, layering,
      altitude prep) — **27 total, inside the 25–30 target.**
- [x] Resort-page audit done 2026-09-07: they had the store-page template
      problem (zero prose, pages differing only by name). Fixed the same
      way — `resort-description.ts` composes intro paragraphs and the meta
      description from each resort's own store set (count, towns, service
      tallies, review evidence, top-rated shop).
- [x] **Services enrichment done 2026-09-07.** `scripts/enrich-services.ts`
      reads each store's own website and keyword-matches a multi-language
      service vocabulary (strong keywords tag on one hit, weak ones need
      two). Full pass: 1,174 sites read, **619 stores gained tags**
      (boot-fitting +226, waxing +215, repairs +390, storage +103,
      used-gear +99) — service coverage went from 2.3% to ~47% of the
      corpus. Merge-only: hand-set tags always survive. Re-runnable after
      future imports.
- [x] **Closure audit 2026-09-07** (are no-website / dead-site stores fake?):
      of 1,292 websites only 19 are truly dead; Google businessStatus on all
      104 suspects (19 dead + 85 no-website) says **98 OPERATIONAL** — the
      no-website stores are legitimate Google-only businesses, keep them.
      4 CLOSED_TEMPORARILY are off-season closures (TSAKIRIS Bansko, 1,429
      reviews — reopens in winter), keep. 1 FUTURE_OPENING, keep.
- [x] **Deleted `powe-snowboards-stowe`** (approved 2026-09-07) — the one
      CLOSED_PERMANENTLY store. Corpus: 1,377 → 1,376. Drops from the
      sitemap and build at the next deploy. `refresh-ratings.ts` now fetches
      `businessStatus` in its existing API call and lists non-operational
      shops at the end of every monthly run, so future closures surface
      automatically (never auto-deleted — human decision).
- [ ] Backlog: enrichment v2 for the ~554 sites read without evidence —
      crawl one level into service-ish subpages ("/services", "Skiservice",
      "atelier"), with a headless-Chrome fallback for JS-only sites. Expected
      to lift service coverage from ~47% toward 60–70%. Never force-tag:
      absence of evidence stays absence of a tag.
- [ ] **Scheduled: fill the 13 thin marquee resorts AFTER the mid-September
      GSC check** (kept out of the measurement window on purpose). Val
      d'Isère (2), Courchevel (3), Méribel (3), Tignes (2), La Plagne (3),
      Sölden (2), Niseko (2), Rusutsu (2), Madonna di Campiglio (3),
      Ruka (3), Valle Nevado (2), Yongpyong (4), Portillo (0 — genuinely).
      Runbook: `discover-stores.ts --resorts "..."` dry → `--auto-insert` →
      `verify-stores.ts` → `enrich-services.ts` → redeploy (~$2 total).
- [ ] **Reddit plan rewritten 2026-09-07** (`LAUNCH.md`): r/skiing rule 3
      bans blatant promo and r/snowboarding rule 7 bans app-developer posts
      outright. New plan: organic participation from September, a modmail-
      cleared original-content data post on r/skiing in late October (the
      265k-review analysis), no r/snowboarding post. Start the organic
      commenting habit now.
- [ ] Optional, lower priority: chain near-duplicate consolidation (§1.3 —
      Christy Sports Telluride ×5 etc.).

## 4 — Measure (mid-September)

- [ ] **GSC re-check against the 2026-08-09 baseline** (`ACTION_PLAN.md`).
      The KPI: "Crawled – currently not indexed" **falling from 602**. If it
      hasn't moved, composed descriptions weren't enough — next lever is real
      per-store copy for the shops that matter, not more generation. Also
      check: 5xx should be ~0, and any non-branded query appearing is the
      Phase 2 leading indicator.
- [ ] Monthly ratings refresh:
      `npx tsx scripts/refresh-ratings.ts --limit 300 --commit`
      (dry run first prints the exact call count; render path stays read-only).

## 5 — Season launch (late October, do not do early)

- [ ] r/skiing post, then r/snowboarding a few hours later — the two drafts in
      `LAUNCH.md` are deliberately different; keep them that way.
- [ ] By then §3 guides have had time to index; link the best ones in comments
      where relevant, don't spam.

---

**Standing rules that apply to everything above** (full text in `HANDOVER.md`):
never block crawlers to save quota; a page render must never trigger a paid
API call; anything per-render or per-build is multiplied by traffic you don't
control; discovery imports require `verify-stores.ts` and a redeploy; never
diagnose hydration/Suspense in the in-app preview browser.

## 6 — Cloud routines (set up 2026-11-01, run without this machine)

- **WinterStores — weekly guide** (Tuesdays 07:00 UTC = 08:00 Madrid in
  winter): takes the next `queued` row in `content/guide-queue.md`, writes
  the guide into `guides.ts`, typechecks, tests, pushes to main → deploys.
  Steer it by editing the queue file. Manage at claude.ai/code/routines.
- **WinterStores — monthly maintenance** (1st of month): ratings refresh
  (capped), service enrichment for new stores, discovery+verify for resorts
  under 5 shops (capped), push → deploy. Needs `DATABASE_URL` and
  `GOOGLE_PLACES_API_KEY` in the cloud environment.
- Both only push when `tsc` and `npm test` pass; otherwise they open a PR
  and stop. Each push is one deploy (~15k ISR units, ~37MB Supabase egress).
- Routine IDs: weekly guide `trig_01VyFym34Skeb2u8nNBY3G2F`, monthly
  maintenance `trig_01Nt7Mq8dLjKoLHWTUQ2qhKA` — both at
  https://claude.ai/code/routines. Connectors stripped from both (a content
  agent has no business holding Gmail/Slack access).
- The maintenance routine stops at a precondition check until
  `DATABASE_URL` and `GOOGLE_PLACES_API_KEY` exist in the cloud
  environment — Fernando adds those; secrets are never pasted by Claude.
- **Smoke-tested 2026-11-01.** Weekly guide: wrote the guide, tsc + 38
  tests passed, **push refused (403) — the Claude GitHub App is not
  installed on fegranata/winterstores.** Monthly maintenance: stopped
  correctly at the secrets check. Two prerequisites, both Fernando's:
  1. Install the Claude GitHub App on the repo with write access:
     https://github.com/apps/claude/installations/select_target (or
     reconnect GitHub at https://claude.ai/customize/connectors).
  2. Add `DATABASE_URL` and `GOOGLE_PLACES_API_KEY` to the Default cloud
     environment at claude.ai/code → Environments.
  Until (1) is done, the weekly routine writes a guide every Tuesday and
  loses it; nothing is published. Re-run the routine after installing to
  confirm.
- **Status 2026-11-01, later:** both prerequisites done. Claude GitHub App
  installed on the repo (weekly guide rerun pushed `b75b18e`, guide #28,
  straight to main). Dedicated cloud environment **`winterstores`**
  (`env_01XJkkjTQ1zQSnt8As8QPuZP`) created with full network access and the
  `.env.local` variables; the monthly maintenance routine now runs there
  (Default's network access is "Limited", which would block Supabase, Google
  Places and the shop-website fetches). The weekly guide routine stays on
  Default — it only needs npm and GitHub.
- **Correction, same day:** the Anthropic cloud sandbox cannot open a raw
  Postgres connection to the Supabase pooler (port 6543) even with network
  access set to Full — the maintenance routine's precondition timed out.
  The monthly maintenance job therefore lives in **GitHub Actions** instead:
  `.github/workflows/monthly-maintenance.yml` (1st of month 05:00 UTC, or
  Actions → "Monthly maintenance" → Run workflow). Same scripts, same caps,
  deterministic, commits the log entry that deploys new stores. Needs two
  repository secrets: `DATABASE_URL`, `GOOGLE_PLACES_API_KEY` (GitHub →
  Settings → Secrets and variables → Actions). The cloud routine
  `trig_01Nt7Mq8dLjKoLHWTUQ2qhKA` is disabled, not deleted. The weekly guide
  routine is unaffected (no DB).
- **First GitHub Actions maintenance run 2026-11-01 — green end to end**
  (run #2, ~25 min): coverage fill inserted and verified **65 stores** at
  Niseko, Rusutsu, Sölden, Tignes (Portillo correctly 0); enrichment +78
  stores; log committed and deployed (`eaf9376`). Corpus 1,376 → 1,441.
  Still thin for next month: Valle Nevado (2), Madonna di Campiglio (3),
  Ruka (3), Yongpyong (4), Portillo (0, genuine).
- **Bug found by that run:** `refresh-ratings.ts` had never worked with
  `--commit` — `ON CONFLICT (store_id, platform)` needs a unique constraint
  the table doesn't have (plain index only, plus ~1,020 duplicate rows from
  older code). All 294 writes failed; 300 Place Details calls (~$5) were
  spent for nothing. Fixed: delete-then-insert in a transaction (retires the
  duplicates one store at a time), and ratingless stores now get a null
  cache row so they stop sorting to the front of every monthly run.
  Verified with a live 8-store write.
- **Needs Fernando:** the run flagged 2 CLOSED_PERMANENTLY shops ("Ski +
  Bike", "Ski School Mayrhofen | Snowsports Mayrhofen") — delete or keep.
  The ~50 CLOSED_TEMPORARILY are off-season closures; ignore.
- **Closed shops deleted 2026-11-01** (approved): `ski-bike-h-chst` and
  `ski-school-mayrhofen-snowsports-mayrhofen-mayrhofen`, both
  CLOSED_PERMANENTLY per Google. Corpus 1,441 → 1,439.
- **Ratings refresh re-run with the fix 2026-11-01:** 299 of 300 written,
  1 failed, 0 ratingless (the ratingless ones were recorded by the 8-store
  test). 51 non-operational flagged: 50 CLOSED_TEMPORARILY (off-season) and
  1 FUTURE_OPENING — nothing to delete. Remaining ~1,100 stores rotate
  through the Dec 1 / Jan 1 / Feb 1 runs at 300 each.

## 7 — GSC check done 2026-11-01 (first since the 2026-08-09 baseline)

| Metric | 2026-08-09 | 2026-11-01 |
|---|---|---|
| Indexed pages | 683 | **418** |
| Crawled – currently not indexed | 602 | 557 |
| Discovered – currently not indexed | 25 | **562** |
| Server error (5xx) | 39 | 0 |
| External links | 0 | **0** |
| Clicks / impressions (3 mo) | 5 / 8.6K (12 mo) | 6 / 2.9K |
| Average position | 31.7 | 53.4 |
| Queries | ~all branded | 669, now incl. "banff snowboard shops", "ski repair breckenridge", "whistler snowboard shop" |

Reading: the composed descriptions did not unlock indexing (557 vs 602 is
noise), and the August expansion added ~560 pages Google has *discovered
but won't even crawl*. Indexed count fell by 40%. The one bright spot is
the query mix: non-branded "[service] in [resort]" queries now appear —
exactly the intent the resort pages serve — but at position ~50.
External links are still zero: Product Hunt and Reddit produced none that
Google counts. ACTION_PLAN.md predicted this fork: "composed descriptions
weren't enough → fewer, better pages, not more generation."

Store-page substance, measured 2026-11-01 (1,439 stores): 1,261 have ≥20
reviews; only 729 have more than the `rentals` tag; 32 have a written
description. **677** have ≥20 reviews *and* either multiple services or a
written description — the candidate "index these, noindex the rest" set.

Decisions pending (Fernando):
- [ ] **Noindex the ~760 store pages without distinguishing substance**
      (keep them for humans and as `follow` link hubs), concentrating crawl
      budget on 677 store pages + 83 resort pages + 28 guides. Reversible
      in one commit, same mechanism as the ghost rule.
- [ ] **Shop outreach for links** instead of Reddit: ~1,200 listed shops
      have websites; a "Listed on WinterStores" badge + a short email
      ("your shop is listed, here's your page, feel free to link it") is
      the standard directory link strategy. Even a 2% response rate is
      ~25 real links from topically perfect domains — more than any launch
      produced. Needs a badge asset, a mail-merge list, and Fernando's
      sending identity.
- [x] **Noindex rule shipped 2026-11-01** (`isIndexableStore` in
      `store-quality.ts`): a store page is indexable only with ≥20 reviews
      AND (a service tag beyond `rentals` OR a written description >50
      chars); everything else is `noindex, follow` and out of the sitemap.
      Browse pagination still counts every non-ghost store (that is what
      those pages render). Re-check GSC in 4–6 weeks: "Indexed" should
      stabilise near the indexable count and "Crawled – currently not
      indexed" should fall as Google drops the noindexed URLs.
- **Awin account activated 2026-11-01**, affiliate ID 3141407, promotion
  model "Directorio de tiendas" + "Contenido editorial", sectors
  Equipamiento deportivo + Turismo y atracciones. Next: complete profile /
  payment details, then apply to Skiset and Snowrental from the advertiser
  directory (each advertiser approves separately).
- **GSC live test 2026-11-01:** Googlebot fetches store pages normally with
  Bot Protection on ("URL is available to Google", breadcrumbs and review
  snippets valid) — verified bots pass. The same URL inspection showed a
  strong page (Matterhorn Sport, 324 reviews) **last crawled July 4** —
  Google has not recrawled it since before any August/September change.
  Crawl budget is the constraint the noindex rule targets. Cheap lever
  while waiting: "Request indexing" in URL Inspection for ~10 key pages a
  day (resort pages first, then top guides); it was done for that page.
- **Correction on deploy cost (2026-11-01):** 13 production deploys today
  produced ~1.5k ISR write units in total (dashboard: 55k/200k for the last
  30 days). The September note that "a deploy costs ~12–17k units" was
  wrong — the Sep 3 spike had some other cause. Deploy freely; the write
  budget is governed by TTLs and bot traffic, not by builds.
- **Shop outreach built 2026-11-01** (the link strategy that replaces
  Reddit): `/for-shops` is live with the "Listed on WinterStores" badge and
  embed snippet (footer link "For Shop Owners");
  `scripts/extract-contact-emails.ts` found **784 contact emails for 1,351
  shops with websites** (669 on homepages, 95 on contact/Impressum pages;
  133 sites unreachable) → `outreach/shop-contacts-2026-11-01.csv`,
  git-ignored. Templates in EN/DE/FR/IT:
  `content/outreach-email-template.md`. **Sending is Fernando's step:**
  start with the ~50 highest-reviewed shops from his own address, in the
  shop's language, and track replies in the CSV. A 2% link rate on 784
  contacts is ~15 real links; every one counts from zero.
