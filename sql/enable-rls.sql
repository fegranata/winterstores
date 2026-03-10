-- ============================================================
-- WinterStores — Enable Row Level Security (RLS)
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================
-- Run PART 1 first, then PART 2 as separate queries.
-- The app uses Drizzle ORM via DATABASE_URL (postgres role),
-- which bypasses RLS. These policies protect against direct
-- access via the Supabase anon key / client API.
-- ============================================================


-- ▸▸▸ PART 1: Enable RLS and drop old policies ◂◂◂
-- Copy everything below until "PART 2" and run it first.

-- 1. STORES
DROP POLICY IF EXISTS "Allow public read" ON public.stores;
DROP POLICY IF EXISTS "Allow all" ON public.stores;
DROP POLICY IF EXISTS "stores_all" ON public.stores;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- 2. PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. REVIEWS
DROP POLICY IF EXISTS "Allow public read" ON public.reviews;
DROP POLICY IF EXISTS "Allow all" ON public.reviews;
DROP POLICY IF EXISTS "reviews_all" ON public.reviews;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 4. PLATFORM_RATINGS_CACHE
DROP POLICY IF EXISTS "Allow public read" ON public.platform_ratings_cache;
DROP POLICY IF EXISTS "Allow all" ON public.platform_ratings_cache;
DROP POLICY IF EXISTS "platform_ratings_cache_all" ON public.platform_ratings_cache;
ALTER TABLE public.platform_ratings_cache ENABLE ROW LEVEL SECURITY;

-- 5. USER_FAVORITES
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- 6. STORE_SUGGESTIONS
ALTER TABLE public.store_suggestions ENABLE ROW LEVEL SECURITY;


-- ▸▸▸ PART 2: Create new policies ◂◂◂
-- Copy everything below and run it as a second query.

-- STORES — public read-only
CREATE POLICY "stores_select"
  ON public.stores FOR SELECT
  USING (true);

-- PROFILES — public read, owner write
CREATE POLICY "profiles_select"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_insert"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid()::text = id);

CREATE POLICY "profiles_update"
  ON public.profiles FOR UPDATE
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

CREATE POLICY "profiles_delete"
  ON public.profiles FOR DELETE
  USING (auth.uid()::text = id);

-- REVIEWS — public read, authenticated users insert own
CREATE POLICY "reviews_select"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "reviews_insert"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- PLATFORM_RATINGS_CACHE — public read-only
CREATE POLICY "prc_select"
  ON public.platform_ratings_cache FOR SELECT
  USING (true);

-- USER_FAVORITES — owner-only access
CREATE POLICY "favorites_select"
  ON public.user_favorites FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "favorites_insert"
  ON public.user_favorites FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "favorites_delete"
  ON public.user_favorites FOR DELETE
  USING (auth.uid()::text = user_id);

-- STORE_SUGGESTIONS — public insert only (contains emails)
CREATE POLICY "suggestions_insert"
  ON public.store_suggestions FOR INSERT
  WITH CHECK (true);
