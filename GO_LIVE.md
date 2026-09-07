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

- [ ] Re-verify the store/resort/review counts in `LAUNCH.md` against the live
      DB (they were correct at 1,377 / 83 / 265k on Aug 27, but they move).
- [ ] Product Hunt launch (weekday, early PT morning).
- [ ] r/SideProject post (same day or next).
- [ ] r/indiehackers post.
- [ ] Directory / "built with Next.js" showcase submissions.
- [ ] Watch quota dashboards during launch week — launch traffic is exactly
      the multiplier the three August quota fires were about.

## 2 — Revenue plumbing (parallel with §1, before season)

- [ ] Apply to **Awin for Skiset + Snowrental** (one application covers both —
      same group). Approval takes weeks and may vet traffic; apply now so a
      decline arrives while there's time to react. Rationale in
      `ACTION_PLAN.md` §4.2.
- [ ] Add Peter Glenn as the gear fallback (150-day cookie).
- [ ] Once accepted: env-driven affiliate config mirroring `ad-config.ts` +
      store-page CTA (~half a day). Nothing to build before acceptance.
- [ ] Ads: nothing to do — Adsterra is live and verified. Leave it alone.

## 3 — Content (September, needs 2–3 months to age before season)

- [ ] **Guides 9 → 25–30.** The most behind-schedule item. Buyer-intent
      long-tail: boot fitting, rental vs buying costs, what to check before
      renting, season-pass comparisons, beginner checklists. The only surface
      a zero-authority domain can rank on.
- [ ] Resort-page audit (`ACTION_PLAN.md` §2.2): make each the definitive
      "where to rent at [resort]" page rather than a template.
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
