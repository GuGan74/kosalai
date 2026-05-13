-- ═══════════════════════════════════════════════════════════════════════════
--  KOSALAI — PERFORMANCE INDEXING SCRIPT
--  Run this in your Supabase SQL Editor to speed up listing searches
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. INDEX FOR LISTING STATUS (Essential for Home Page)
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings (status);

-- 2. INDEX FOR CATEGORIES (Speeds up Cows/Buffalos/Pets filtering)
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings (category);

-- 3. INDEX FOR STATE/LOCATION (Speeds up location filtering)
CREATE INDEX IF NOT EXISTS idx_listings_state ON listings (state);

-- 4. INDEX FOR RECENT POSTS (Speeds up sorting by Date)
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings (created_at DESC);

-- 5. INDEX FOR PRICE (Speeds up High-to-Low and Low-to-High sorting)
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings (price);

-- 6. FULL TEXT SEARCH INDEX (Optional, for advanced keyword search)
-- CREATE INDEX IF NOT EXISTS idx_listings_title_search ON listings USING gin (to_tsvector('english', title));

-- ═══════════════════════════════════════════════════════════════════════════
-- DONE ✅
-- ═══════════════════════════════════════════════════════════════════════════
