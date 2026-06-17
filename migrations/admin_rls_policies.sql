-- ═══════════════════════════════════════════════════════════════════
-- KOSALAI ADMIN RLS POLICIES
-- Run this in Supabase SQL Editor AFTER admin_dashboard_setup.sql
-- ═══════════════════════════════════════════════════════════════════

-- Helper function: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
    AND email = 'mail.kosalai@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══ LISTINGS TABLE ═════════════════════════════════════════════

-- Allow admin to delete ANY listing (not just their own)
CREATE POLICY "Admin can delete any listing"
  ON listings FOR DELETE
  USING (
    auth.uid() = user_id  -- owners can delete their own
    OR is_admin()          -- admin can delete any
  );

-- Allow admin to update ANY listing (for hide/unhide/moderation)
CREATE POLICY "Admin can update any listing"
  ON listings FOR UPDATE
  USING (
    auth.uid() = user_id  -- owners can update their own
    OR is_admin()          -- admin can update any
  );

-- ═══ REPORTS TABLE ══════════════════════════════════════════════

-- Enable RLS on reports table
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can insert a report
CREATE POLICY "Authenticated users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Only admin can view all reports
CREATE POLICY "Admin can view all reports"
  ON reports FOR SELECT
  USING (
    auth.uid() = reporter_id  -- users can see their own reports
    OR is_admin()              -- admin sees all
  );

-- Only admin can update report status
CREATE POLICY "Admin can update reports"
  ON reports FOR UPDATE
  USING (is_admin());

-- Only admin can delete reports
CREATE POLICY "Admin can delete reports"
  ON reports FOR DELETE
  USING (is_admin());

-- ═══ VERIFICATION ═══════════════════════════════════════════════
-- Run this to verify:
-- SELECT * FROM pg_policies WHERE tablename IN ('listings', 'reports');
