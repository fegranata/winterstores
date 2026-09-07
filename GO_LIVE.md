# Go-Live Checklist — September 2026

The working list for taking WinterStores from "deployed" to "launched", in
order. Built 2026-09-07 after two alert emails (Vercel ISR at 100%, GSC noindex
validation failed). Background lives in `ACTION_PLAN.md` and `HANDOVER.md`.

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
- [ ] Product Hunt launch (weekday, early PT morning).
- [ ] r/SideProject post (same day or next).
- [ ] r/indiehackers post.
- [ ] Directory / "built with Next.js" showcase submissions.
- [ ] Watch quota dashboards during launch week — launch traffic is exactly
      the multiplier the three August quota fires were about.

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
- [ ] Follow-up surfaced by the resort intros: **services data is sparse** —
      e.g. only 1 of Chamonix's 40 shops is tagged boot-fitting. The
      composed copy is honest but thin because the underlying tags are.
      A services-enrichment pass (from Google Places types/attributes or
      website scraping) would improve store pages, resort intros, and
      guide matching all at once.
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
