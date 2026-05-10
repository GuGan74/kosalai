-- Add missing address columns to listings table
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS village VARCHAR(100),
ADD COLUMN IF NOT EXISTS taluk VARCHAR(100),
ADD COLUMN IF NOT EXISTS landmark VARCHAR(150);

-- Comment: These columns are used in SellPage.jsx to store address details separately from the city (location) field.
