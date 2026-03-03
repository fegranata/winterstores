# Implementation Plan: SEO, UX Polish, Performance, and User Features

## Overview

~30 file operations across 6 phases. Each phase is self-contained and buildable — you can run `next build` after any phase without breaking the app. **No new npm packages needed.**

---

## Phase 1: Foundation — Hooks, Toast System, DB Indexes

### Step 1.1: Add DB indexes to Drizzle schema
**Modify:** `src/lib/db/schema.ts`
- Add indexes: `slug` (unique), `country_code`, `composite_rating`, `has_online_shop`, `price_level`, `city`
- Add index on `reviews.store_id`

### Step 1.2: Create localStorage hook
**New:** `src/hooks/use-local-storage.ts`
- Generic `useLocalStorage<T>` with SSR safety, JSON error handling, cross-tab sync

### Step 1.3: Create favorites hook
**New:** `src/hooks/use-favorites.ts`
- Stores array of store slugs, provides `isFavorite()` and `toggleFavorite()`

### Step 1.4: Create recently-viewed hook
**New:** `src/hooks/use-recently-viewed.ts`
- Last 10 viewed store slugs, deduplicates, most recent first

### Step 1.5: Create toast notification system
**New:** `src/components/ui/Toast.tsx`
- React context-based, auto-dismiss (3s), types: success/info/error
- Fixed bottom-right position, slide-in animation

**New:** `src/components/ui/Providers.tsx`
- Client-side wrapper for ToastProvider (keeps layout as server component)

---

## Phase 2: SEO & Discoverability

### Step 2.1: robots.ts
**New:** `src/app/robots.ts` — Allow all, disallow `/api/`, include sitemap URL

### Step 2.2: Dynamic sitemap
**New:** `src/app/sitemap.ts` — Queries DB for all stores and countries, generates full sitemap

### Step 2.3: Web app manifest
**New:** `src/app/manifest.ts` — PWA manifest (name, icons, theme color)

### Step 2.4: OpenGraph + Twitter metadata in root layout
**Modify:** `src/app/layout.tsx` — Add OG, Twitter Card, keywords, metadataBase, title template

### Step 2.5: Dynamic OG for store pages
**Modify:** `src/app/store/[slug]/page.tsx` — Expand `generateMetadata` with OG, Twitter, canonical

### Step 2.6: Search page metadata
**Modify:** `src/app/search/page.tsx` — Add `generateMetadata` with dynamic title, `robots: noindex`

### Step 2.7: Canonical URLs for browse pages
**Modify:** `src/app/browse/page.tsx` and `src/app/browse/[country]/page.tsx` — Add canonical alternates

---

## Phase 3: Performance

### Step 3.1: Autocomplete API (lightweight)
**New:** `src/app/api/stores/suggest/route.ts`
- Returns `{ slug, name, city, country, compositeRating }`, LIKE search, limit 8, cache headers

### Step 3.2: Cache headers on main API
**Modify:** `src/app/api/stores/route.ts` — Add `Cache-Control: public, max-age=60, stale-while-revalidate=300`

### Step 3.3: ISR for static pages
**Modify:** Homepage, browse, browse/[country], store/[slug] — Add `export const revalidate = 3600`

### Step 3.4: Optimize getNearbyStores with bounding box
**Modify:** `src/lib/store-search.ts` — Pre-filter with ~100km lat/lng box before haversine

### Step 3.5: Configure next/image domains
**Modify:** `next.config.ts` — Add `images.remotePatterns` for Unsplash, Google

---

## Phase 4: UX Polish — Skeletons, Autocomplete, Error States

### Step 4.1: Skeleton components
**New:** `src/components/ui/Skeleton.tsx`
- `Skeleton` base, `StoreCardSkeleton`, `SearchResultsSkeleton`

### Step 4.2: loading.tsx files
**New:** `src/app/search/loading.tsx`, `src/app/store/[slug]/loading.tsx`, `src/app/browse/loading.tsx`

### Step 4.3: Error boundary + 404
**New:** `src/app/error.tsx` — Snowflake emoji, error message, retry button
**New:** `src/app/not-found.tsx` — Mountain emoji, "Page not found", go home link

### Step 4.4: Search autocomplete
**Modify:** `src/components/search/SearchBar.tsx`
- Debounced fetch (300ms) to `/api/stores/suggest`
- Dropdown with keyboard navigation (ArrowUp/Down/Enter/Escape)
- Click-outside dismissal
- Show: name, city, country, rating per suggestion

### Step 4.5: Better empty state
**Modify:** `src/components/search/SearchResults.tsx`
- Illustration, helpful message, "Clear all filters" and "Browse by country" links

---

## Phase 5: User Features — Favorites, Share, Report

### Step 5.1: FavoriteButton component
**New:** `src/components/store/FavoriteButton.tsx`
- Heart icon toggle, uses `useFavorites` + `useToast`, sm/md sizes

### Step 5.2: Add FavoriteButton to StoreCard
**Modify:** `src/components/store/StoreCard.tsx` — Convert to client component, add heart button

### Step 5.3: StoreActions toolbar for detail page
**New:** `src/components/store/StoreActions.tsx` — Combines FavoriteButton + ShareButton

### Step 5.4: ShareButton component
**New:** `src/components/store/ShareButton.tsx` — Web Share API with clipboard fallback

### Step 5.5: RecentlyViewedTracker
**New:** `src/components/store/RecentlyViewedTracker.tsx` — Invisible component, records view on mount

### Step 5.6: Favorites page
**New:** `src/app/favorites/page.tsx` — Client page, fetches stores by slugs from API
**New:** `src/app/api/stores/by-slugs/route.ts` — Batch store lookup by slugs
**Modify:** `src/lib/store-search.ts` — Export `rowToStore`

### Step 5.7: Add Favorites to nav
**Modify:** `src/components/layout/Header.tsx` — Add "Favorites" link (desktop + mobile)

### Step 5.8: ReportForm
**New:** `src/components/store/ReportForm.tsx` — Collapsible form, mailto submission

### Step 5.9: PhotoGallery (ready for when photos are added)
**New:** `src/components/store/PhotoGallery.tsx` — next/image gallery with thumbnails, hidden when no photos

---

## Phase 6: Integration & Wiring

### Step 6.1: Wire Providers into layout
**Modify:** `src/app/layout.tsx` — Wrap with Providers (ToastProvider)

### Step 6.2: Add toast to GeolocationButton
**Modify:** `src/components/search/GeolocationButton.tsx` — Toast on location found

### Step 6.3: Toast animation CSS
**Modify:** `src/app/globals.css` — Add `toast-slide-in` keyframe

### Step 6.4: Wire all components into store detail page
**Modify:** `src/app/store/[slug]/page.tsx` — Add PhotoGallery, StoreActions, RecentlyViewedTracker, ReportForm

---

## File Summary

**17 new files** | **13 modified files** | **0 new npm packages**

### Static assets needed in `public/`:
- `og-default.png` (1200x630) — Default OpenGraph image
- `icon-192.png` + `icon-512.png` — PWA icons
