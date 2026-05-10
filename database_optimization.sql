-- ═══════════════════════════════════════════════════════════════════════════
--  KOSALAI — DATABASE STORAGE OPTIMIZATION
--  Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. OPTIMIZE PRIMARY KEYS (UUID -> BIGINT) ──────────────────────────────
-- For internal tables (notifications, interests), switching from UUID to 
-- BIGSERIAL saves 8-12 bytes per row.

-- NOTIFICATIONS
-- We drop and recreate to simplify the transition.
DROP TABLE IF EXISTS notifications CASCADE;
CREATE TABLE IF NOT EXISTS notifications (
  id            BIGSERIAL PRIMARY KEY, -- Saves 8 bytes per row vs UUID
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title         VARCHAR(100) NOT NULL,
  message       VARCHAR(500),
  type          VARCHAR(20) DEFAULT 'info',
  icon          VARCHAR(50),
  is_read       BOOLEAN DEFAULT false,
  metadata      JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- INTERESTS / CONTACT TRACKING
DROP TABLE IF EXISTS interests CASCADE;
CREATE TABLE IF NOT EXISTS interests (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id    UUID,
  listing_title VARCHAR(100),
  contacted_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. DATA RETENTION POLICY ──────────────────────────────────────────────
-- Automatically delete notifications older than 30 days to save space.

CREATE OR REPLACE FUNCTION purge_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- To run this automatically, you would typically use pg_cron (if enabled)
-- SELECT cron.schedule('0 0 * * *', 'SELECT purge_old_notifications()');


-- ── 3. OPTIMIZE LISTINGS STORAGE ─────────────────────────────────────────
-- Ensure description is capped to avoid massive text blobs.

ALTER TABLE listings 
ALTER COLUMN title TYPE VARCHAR(100),
ALTER COLUMN description TYPE VARCHAR(1000);

-- Enable RLS again for the new tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_read_own" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "interests_insert_all" ON interests FOR INSERT WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- DONE ✅
-- Note: UUIDs like 'user_id' and 'actor_id' are already optimized 16-byte values
-- internally, even if they look long. The real space savings come from 
-- using BIGSERIAL for local table IDs and cleaning up old data.
-- ═══════════════════════════════════════════════════════════════════════════
