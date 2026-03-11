/**
 * Enable Row Level Security (RLS) on all Supabase tables.
 * Runs each statement individually to avoid SQL Editor timeouts.
 * Usage: npx tsx scripts/enable-rls.ts
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

interface Step {
  label: string;
  query: string;
}

const steps: Step[] = [
  // ── Step A: Drop old policies + Enable RLS ──
  { label: "Drop old stores policies (1/3)", query: `DROP POLICY IF EXISTS "Allow public read" ON public.stores` },
  { label: "Drop old stores policies (2/3)", query: `DROP POLICY IF EXISTS "Allow all" ON public.stores` },
  { label: "Drop old stores policies (3/3)", query: `DROP POLICY IF EXISTS "stores_all" ON public.stores` },
  { label: "Enable RLS on stores", query: `ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY` },

  { label: "Enable RLS on profiles", query: `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY` },

  { label: "Drop old reviews policies (1/3)", query: `DROP POLICY IF EXISTS "Allow public read" ON public.reviews` },
  { label: "Drop old reviews policies (2/3)", query: `DROP POLICY IF EXISTS "Allow all" ON public.reviews` },
  { label: "Drop old reviews policies (3/3)", query: `DROP POLICY IF EXISTS "reviews_all" ON public.reviews` },
  { label: "Enable RLS on reviews", query: `ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY` },

  { label: "Drop old prc policies (1/3)", query: `DROP POLICY IF EXISTS "Allow public read" ON public.platform_ratings_cache` },
  { label: "Drop old prc policies (2/3)", query: `DROP POLICY IF EXISTS "Allow all" ON public.platform_ratings_cache` },
  { label: "Drop old prc policies (3/3)", query: `DROP POLICY IF EXISTS "platform_ratings_cache_all" ON public.platform_ratings_cache` },
  { label: "Enable RLS on platform_ratings_cache", query: `ALTER TABLE public.platform_ratings_cache ENABLE ROW LEVEL SECURITY` },

  { label: "Enable RLS on user_favorites", query: `ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY` },
  { label: "Enable RLS on store_suggestions", query: `ALTER TABLE public.store_suggestions ENABLE ROW LEVEL SECURITY` },

  // ── Step B: Create proper policies ──
  { label: "Create stores_select policy", query: `CREATE POLICY "stores_select" ON public.stores FOR SELECT USING (true)` },

  { label: "Create profiles_select policy", query: `CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true)` },
  { label: "Create profiles_insert policy", query: `CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid()::text = id)` },
  { label: "Create profiles_update policy", query: `CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid()::text = id) WITH CHECK (auth.uid()::text = id)` },
  { label: "Create profiles_delete policy", query: `CREATE POLICY "profiles_delete" ON public.profiles FOR DELETE USING (auth.uid()::text = id)` },

  { label: "Create reviews_select policy", query: `CREATE POLICY "reviews_select" ON public.reviews FOR SELECT USING (true)` },
  { label: "Create reviews_insert policy", query: `CREATE POLICY "reviews_insert" ON public.reviews FOR INSERT WITH CHECK (auth.uid()::text = user_id)` },

  { label: "Create prc_select policy", query: `CREATE POLICY "prc_select" ON public.platform_ratings_cache FOR SELECT USING (true)` },

  { label: "Create favorites_select policy", query: `CREATE POLICY "favorites_select" ON public.user_favorites FOR SELECT USING (auth.uid()::text = user_id)` },
  { label: "Create favorites_insert policy", query: `CREATE POLICY "favorites_insert" ON public.user_favorites FOR INSERT WITH CHECK (auth.uid()::text = user_id)` },
  { label: "Create favorites_delete policy", query: `CREATE POLICY "favorites_delete" ON public.user_favorites FOR DELETE USING (auth.uid()::text = user_id)` },

  { label: "Create suggestions_insert policy", query: `CREATE POLICY "suggestions_insert" ON public.store_suggestions FOR INSERT WITH CHECK (true)` },
];

async function main() {
  let passed = 0;
  let failed = 0;

  for (const step of steps) {
    try {
      await sql.unsafe(step.query);
      console.log(`  ✓ ${step.label}`);
      passed++;
    } catch (err: any) {
      // "already exists" is fine — means it was already set up
      if (err.message?.includes("already exists")) {
        console.log(`  ✓ ${step.label} (already exists)`);
        passed++;
      } else {
        console.error(`  ✗ ${step.label}: ${err.message}`);
        failed++;
      }
    }
  }

  console.log(`\nDone: ${passed} passed, ${failed} failed out of ${steps.length} steps.`);
  await sql.end();

  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
