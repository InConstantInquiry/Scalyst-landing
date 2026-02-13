-- ============================================================
-- Corrected Waitlist RLS Setup
-- Paste this into the Supabase SQL Editor and run it.
-- ============================================================

-- 1. Drop existing policies (safe even if they don't exist)
DROP POLICY IF EXISTS "waitlist_insert_policy" ON waitlist;
DROP POLICY IF EXISTS "waitlist_select_policy" ON waitlist;

-- 2. Ensure RLS is enabled
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- 3. Grant INSERT to anon (idempotent — safe to re-run)
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON waitlist TO anon;

-- 4. INSERT policy — explicitly targets anon role
CREATE POLICY "waitlist_anon_insert"
  ON waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 5. SELECT policy — only authenticated users (e.g. admin dashboard)
CREATE POLICY "waitlist_authenticated_select"
  ON waitlist
  FOR SELECT
  TO authenticated
  USING (true);
