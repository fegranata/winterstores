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

## 0c — Deployment Storage alert 2026-11-06 (75% of the Hobby 10 GB)

- **Cause:** not traffic. Deployment Storage is the build output Vercel keeps
  for every production deployment, ~300 MB each (≈1,500 prerendered pages +
  RSC payloads + function bundles), retained forever by default. 1 Nov alone
  pushed 19 deployments, most of them docs-only commits (GO_LIVE notes).
  28 retained deployments = 8.66 GB. Bots, Supabase egress and ISR writes
  are separate meters and were already fixed.
- [x] 2026-11-06: `vercel remove winterstores --safe --yes` deleted the 27
      non-aliased deployments; the live one (all five aliases) was kept.
      Storage back to ~0.3 GB. Old builds are reproducible from git.
- **Corrected 2026-11-10 (two holes in the rule below):** (1) the monthly
  maintenance commit touches only `content/maintenance-log.md`, and that
  commit is what deploys newly discovered stores, so the rule would have
  silently stopped them going live on 1 Dec; a change to that file now
  always builds. (2) The rule compared only `HEAD^..HEAD`, so a code commit
  followed by a docs commit in one push would have been skipped; it now
  compares against `$VERCEL_GIT_PREVIOUS_SHA` (the last deployed commit)
  and builds when that is empty or unreachable.
  The logic now lives in `scripts/vercel-ignore.sh`: vercel.json rejects an
  `ignoreCommand` over 256 characters, and an over-long one fails the
  deployment in seconds with no log (that cost one failed deploy today).
- [x] 2026-11-06: `vercel.json` `ignoreCommand` skips the build when a
      commit touches only `*.md`, `content/`, `outreach/`, `sql/`,
      `.github/` or `.claude/`. Tested against recent commits: docs-only
      → skip, code/merge → build. Guide publishing still deploys because it
      edits `src/lib/data/guides.ts`.
- [ ] **Monthly:** run the `vercel remove … --safe --yes` line above (the
      Vercel CLI is logged in on this machine as fegranata). Hobby has no
      retention-policy setting; to automate it in the GitHub Actions
      maintenance workflow a `VERCEL_TOKEN` secret would have to be added
      by Fernando. Watch the Deployment Storage chart under Team Usage.

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
- **Indexing requested via URL Inspection 2026-11-01** (confirmed "added to
  a priority crawl queue"): the Matterhorn Sport store page and the resort
  pages for Lech, Chamonix, Morzine, Les Gets, Avoriaz, Megève,
  Alta-Snowbird. Cortina d'Ampezzo, Courmayeur and Lake Tahoe were
  attempted but the tool timed out before confirming — redo those first
  next session, then continue down the resort list by store count
  (St. Anton, Saalbach, …), ~10 per day.

## 7b — Check 2026-11-10 (Awin, GSC, traffic)

| Metric | 2026-11-01 | 2026-11-10 (GSC data to 11/6) |
|---|---|---|
| Indexed pages | 418 | **295** |
| Crawled – currently not indexed | 557 | 680 |
| Discovered – currently not indexed | 562 | 325 |
| Excluded by noindex | – | 12 |
| External links | 0 | **0** |
| Clicks / impressions (28 d vs prev 28 d) | – | 5 / 364 vs 1 / 671 |
| Average position (28 d) | – | 46 |
| Sitemap | – | read 2026-11-09, Success, 856 URLs |

- **Crawl stats (90 d):** 1.01K requests total, only 28% HTML (~3 pages a
  day), purpose "Refresh" 100% — Google is doing no discovery crawling at
  all. Only 12 of the ~760 noindexed store pages have been recrawled, so
  the noindex rule has not taken effect yet; the indexed count is still
  the old decay, not the new rule. Nothing to change in code: the
  constraint is crawl demand, and crawl demand comes from links.
- **Queries:** 241 in 28 d, almost all "[service] [resort]" intent ("ski
  rentals winter park", "banff snowboard shops", "ski repair breckenridge",
  "ski butlers mammoth alternative") at positions 60–90. One real click
  at position 1 for "ski service innsbruck".
- **Traffic (Vercel Analytics):** 30 d shows 1,488 visitors, but 72%
  Singapore / 95% Windows desktop / `/search` = the bot farm before the
  1 Nov firewall rules. Last 7 d, post-firewall: **63 visitors, 66 page
  views**, 24 of them on `/search`, 3 from search engines. Real human
  traffic is roughly 5–9 visitors a day.
- **Firewall (24 h):** 1.9k allowed, 681 denied, 810 challenged; the
  Tencent rule now catches 13 a day (was 22k). The farm has gone.
- **Awin:** all eight applications still pending after 4 days (Snow Rental,
  SPORT2000 FR, Skiset DE, Skiset UK, NetSki, Head US, Burton US, Outdoor
  Master US). Only joined programme is PersonalHour (96347), not relevant.
- **Reading:** everything technical is healthy; the site has no authority.
  Zero external links → no crawl demand → indexing shrinks. The shop
  outreach emails (784 contacts, templates ready) are the one lever that
  moves this, and they are still unsent.

- **Content plan check 2026-11-10.** Publishing is on schedule: the weekly
  routine fired Tue 11-03 and Tue 11-10 at 07:07 UTC, each guide committed,
  built and live (32 guides; next run 11-17, damage-waiver guide; 21
  queued ≈ through early April). **Results: none yet.** GSC's indexed-page
  list (295 URLs) contains exactly one guide, `best-ski-resorts-beginners`
  (crawled Aug 16), plus `/guides` itself (last crawled Sep 11). The 15
  guides from 7 Sep and the 3 from November are not indexed; guides had
  3 search impressions in 28 days. Guides are in the sitemap and linked
  from store and resort pages, so this is crawl demand again, not a bug.
  Evidence the manual lever works: every resort page submitted through
  URL Inspection on 1 Nov was crawled that day and is indexed. Next: use
  the ~10/day Request Indexing quota on guides, newest and most
  rental-intent first.

## 8 — Email for the project (2026-11-01)

- **Bug fixed:** the contact page and the store Report form pointed at
  `hello@winterstores.com` / `corrections@winterstores.com` — a `.com`
  domain registered to someone else. Every contact or correction sent from
  the site has been lost. Both now use `@winterstores.co`.
- DNS is on Cloudflare and **Email Routing is already active** (MX →
  Cloudflare, SPF includes it). Fernando: Cloudflare → winterstores.co →
  Email → Email Routing → make sure `hello@` and `corrections@` exist as
  custom addresses (or a catch-all) forwarding to a mailbox you read.
- **Sending as hello@winterstores.co** (free path): Gmail → Settings →
  Accounts → "Send mail as" → add hello@winterstores.co via Gmail's SMTP
  (needs an app password on the Google account). Then add
  `include:_spf.google.com` to the SPF record and a DMARC record
  `_dmarc.winterstores.co TXT "v=DMARC1; p=none; rua=mailto:hello@winterstores.co"`.
  If a Google Workspace account can't add a non-Workspace alias, the paid
  alternative is a Workspace mailbox for winterstores.co (~€7/month), which
  also gives proper DKIM — the better choice if outreach volume grows.
- Warm the address up: 10–20 outreach emails a day the first week, then
  50. Cold mail from a brand-new sender at volume lands in spam.
- **Done in Cloudflare 2026-11-01:** routing rules `hello@winterstores.co`
  and `corrections@winterstores.co` → fernandogranata@gmail.com (Active),
  alongside the existing `hi@`. Cloudflare's own Email Sending needs the
  paid Workers plan — not used. Outbound = Gmail "Send mail as" (free).
- **Still to paste in Cloudflare DNS (Claude is not permitted to change DNS):**
  1. TXT  name `_dmarc`  content `v=DMARC1; p=none; rua=mailto:hello@winterstores.co`
  2. Edit the existing SPF TXT on `@` from
     `v=spf1 include:_spf.mx.cloudflare.net ~all` to
     `v=spf1 include:_spf.mx.cloudflare.net include:_spf.google.com ~all`
     (needed so mail sent via Gmail as hello@ passes SPF; Email Routing
     may show the record as locked — unlock it in Email Routing → Settings
     if the edit button is greyed).
- **Then in Gmail (free):** Settings → Accounts and Import → Send mail as →
  Add → hello@winterstores.co, SMTP smtp.gmail.com:587 with an app
  password from myaccount.google.com → Security → App passwords.

## 9 — Awin programmes (2026-11-06)

- Account live (ID 3141407). The PersonalHour invite (US Pilates equipment,
  5%) is an auto-invite with no relevance — leave the programme.
- Promotional regions: US was the only one; Fernando added the European
  winter-sports countries on 2026-11-06 (done).
- **Awin MCP connector** attached (read-only KPIs + link creation). It has
  no name search and no commission rates for programmes we have not
  joined, so advertiser IDs come from the directory UI (Europe filter):
  | Programme | Awin ID | Conv. rate | Approval | EPC | Cookie / validation | Note |
  |---|---|---|---|---|---|---|
  | **Snow Rental** (UK, GBP) | 5152 | 13.1% | 84% | £0.34 | 30 d / 46 d | Ski Company group (Skiset, Netski, Skimium): 1,000 shops, 400 resorts. Deep links on. Payment "Exposure Level 2" (slow payer). |
  | **SPORT2000 FR – Location de skis** (EUR) | 12056 | 4.2% | 63% | €0.49 | 30 d / 21 d | Season Nov–Apr, avg basket €126 ex-VAT. **Deep links OFF** (homepage links only). No brand bidding. Payment "Exposure Level 4" (worst). |
  | **Skiset DE** (EUR) | 44529 | 3.0% | 82% | €0.69 | — / 47 d | Deep links on. |
  | Skiset (UK, GBP) | 3779 | 0.2% | 33% | £0.02 | — / 1 d | Weak; apply anyway, same group. |
  | Intersport CH / DE, Gigasport CH, Bergfreunde DE | — | — | — | — | — | Tier 2 gear retail, later |
  Commission percentages are only visible after joining (Commission
  Manager). Snow Rental is the one to build the CTA around first: best
  conversion, deep links, English-language booking site.
- [x] 2026-11-06: applied to all four (Snow Rental, SPORT2000 FR, Skiset DE,
      Skiset UK) via the Awin UI with a short content-site pitch; MCP
      `awin_list_programmes relationship=pending` lists all four. Joining
      cannot be done through the MCP (read-only + link creation); approvals
      come by email from each advertiser, typically days to weeks.
- **North America (checked 2026-11-06):** Awin has no US/Canadian ski
  rental programme. Christy Sports, Ski Butlers, Black Tie, Epic/Ikon are
  not on Awin (they use Impact/AvantLink or run in-house). What Awin does
  have in the US, all gear retail rather than rental:
  | Programme | Awin ID | Conv. | Approval | EPC | Fit |
  |---|---|---|---|---|---|
  | Head (US) | 27978 | 2.9% | 86% | $0.77 | skis, boots, bindings — good match for gear guides |
  | Burton Snowboards US | 19106 | 2.2% | 95% | $0.48 | snowboard guides; 97-day payment |
  | Outdoor Master (US) | 26401 | 5.0% | 100% | $0.90 | goggles/helmets; 122-day validation |
  Also European: **NetSki** (UK, 20965, Ski Company group, 12.5% conv.,
  £0.29 EPC, 127-day payment).
- [x] 2026-11-06: applied to NetSki, Head (US), Burton Snowboards US and
      Outdoor Master (US) via the Awin UI, each with a tailored content-site
      pitch (rental CTAs for NetSki; guide-embedded gear recommendations for
      the US three; no brand bidding, no coupon/cashback). MCP
      `relationship=pending` now lists all eight programmes.
  For US rental a direct deal (or AvantLink/Impact account) would be a
  separate, later effort; for now US pages keep the Adsterra slots.
- [ ] On first approval: affiliate config mirroring `ad-config.ts` + a
      "Book rental gear" CTA on store and resort pages (~half a day).

## 10 — Reports: data-led link assets (2026-11-10)

Why: the guides are on schedule but not indexed (1 of 32), and nobody links
to the tenth-best explanation of DIN settings. The one thing this site has
that others do not is 273k reviews across 1,439 shops. `/reports` turns that
into something a blogger, journalist or tourism office can cite.

- [x] **`/reports/ski-shop-ratings-by-resort`** — 63 of 82 resorts ranked on
      187,742 reviews of 970 shops; key findings, full table, by area and
      country, method, limitations, CSV download
      (`/data/ski-shop-ratings-by-resort.csv`), Dataset JSON-LD, and a
      "use this data, credit with a link" block.
- [x] **`/reports/best-resorts-for-ski-shops`** — the top 10 as a readable
      piece (shops behind each score, services, best resort per area),
      Article + ItemList JSON-LD. Plus `/reports` as the index.
- [x] Linked from the footer ("Resort Rankings", sitewide), a banner on
      `/resorts`, and a rank line on each of the 63 ranked resort pages
      ("The shops closest to X average 4.86, 2nd of 63 resorts…"). All three
      are in the sitemap.
- **Method** (`src/lib/resort-ratings.ts`, unit-tested): each shop counts
  once, for the nearest resort within 25 km; needs ≥20 reviews; listings
  whose name is only a ski school are excluded (12); resort score =
  review-weighted mean with each shop's weight capped at 500; a resort needs
  ≥5 rated shops and ≥500 reviews to be ranked. 19 resorts are published as
  "not enough data" with no score — including Courchevel, Méribel, La
  Plagne, Megève, St. Moritz and Wengen, which is the coverage-fill list in
  another form.
- **No render-time cost.** Pages read a frozen snapshot
  (`src/lib/data/resort-ratings.json`); nothing queries the DB per page.
  Rebuild deliberately with `npx tsx scripts/build-resort-ratings.ts
  --commit` (runbook in HANDOVER.md) — before the season and at most once
  mid-season. A cited ranking should not move under the people citing it,
  so it is not in the monthly workflow.
- **Decisions left open for Fernando:** the data is offered under a plain
  "quote and republish with a link" line, not a formal CC BY licence
  (a licence cannot be taken back; say the word and it is one line plus a
  `license` field in the JSON-LD). No ad slots on the three report pages:
  credibility with the people we want links from matters more there.
- **Headline results:** 1 Crested Butte 4.87, 2 Bansko 4.86, 3 Fernie 4.85,
  4 Revelstoke 4.83, 5 Lech 4.83 … 63 Bariloche 4.38. Chamonix 41st,
  Zermatt 48th, Aspen 39th, Whistler 34th. Eastern Europe 4.78 leads
  by area; Scandinavia 4.41 trails.
- [x] **Indexing requested 2026-11-10** (URL Inspection, each confirmed
      "Indexing requested"): guides `pre-booking-ski-rentals-guide`,
      `ski-length-sizing-guide`, `ski-binding-din-settings-explained`,
      `questions-to-ask-before-renting-skis`, `how-to-choose-ski-rental-shop`,
      `renting-vs-buying-ski-equipment`, `boot-fitting-guide`,
      `first-ski-trip-guide`, then the two report pages after deploy.
      Inspection showed the newest guide as "URL is unknown to Google".
      Next days, ~10 per day: the remaining 22 guides, starting with
      `ski-trip-budget-guide`, `kids-ski-gear-rent-or-buy`,
      `flying-with-ski-gear-vs-renting`, `snowboard-gear-guide-beginners`.
- [ ] **Use the report as the outreach hook** (this replaces the weak
      "you are listed" pitch): (a) tourism offices of the top-10 and
      area-best resorts — "your resort ranked Nth of 63 for ski shop
      ratings"; (b) the ~30 shops named as top-rated on the top-10 page —
      "you are one of the three top-rated shops in X"; (c) ski blogs and
      regional press for Bansko / Poiana Brașov / Fernie / Revelstoke, where
      beating Zermatt and Chamonix is a local story. Sending is Fernando's.
- [ ] Next data pieces on the same snapshot pattern: best-rated shops for
      boot fitting by resort; ratings by country with year-on-year change
      once a second season exists.

