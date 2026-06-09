-- 1. Add new column to support multiple images
ALTER TABLE listings ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '[]'::jsonb;

-- 2. Migrate existing image_url data into the new image_urls array
-- We wrap the existing text string into a JSON array if it is not null
UPDATE listings 
SET image_urls = jsonb_build_array(image_url)
WHERE image_url IS NOT NULL 
AND image_url != ''
AND (image_urls IS NULL OR jsonb_array_length(image_urls) = 0);

-- NOTE: We intentionally keep the image_url column intact for backward compatibility
