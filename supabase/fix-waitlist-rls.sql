-- ============================================================
-- Corrected Waitlist RLS Setup
-- Paste this ENTIRE block into the Supabase SQL Editor and run it.
-- ============================================================

-- 1. Nuke ALL existing policies on waitlist (catches any stale/unknown policies)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname FROM pg_policies WHERE tablename = 'waitlist'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON waitlist', pol.policyname);
    END LOOP;
END $$;

-- 2. Ensure RLS is enabled (not FORCE — owner bypass is fine)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- 3. Revoke everything first, then grant exactly what's needed
REVOKE ALL ON waitlist FROM anon;
REVOKE ALL ON waitlist FROM authenticated;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON waitlist TO anon;
GRANT SELECT ON waitlist TO authenticated;

-- 4. INSERT policy — anon can insert any row
CREATE POLICY "waitlist_anon_insert"
  ON waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 5. SELECT policy — only authenticated (admin/dashboard)
CREATE POLICY "waitlist_authenticated_select"
  ON waitlist
  FOR SELECT
  TO authenticated
  USING (true);

-- 6. CRITICAL: Force PostgREST to reload its schema cache
--    Without this, PostgREST keeps using stale grants/policies.
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
