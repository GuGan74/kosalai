-- Fix Image URLs for all listings
-- Wikipedia Commons often blocks images on localhost due to referer policies.
-- This script replaces them with reliable Unsplash placeholder images.

UPDATE listings 
SET image_url = 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=480'
WHERE category = 'cow';

UPDATE listings 
SET image_url = 'https://images.unsplash.com/photo-1590432298711-20921ecfb25f?auto=format&fit=crop&q=80&w=480'
WHERE category = 'buffalo';

UPDATE listings 
SET image_url = 'https://images.unsplash.com/photo-1528318269466-5122e2bb97f7?auto=format&fit=crop&q=80&w=480'
WHERE category = 'goat';

UPDATE listings 
SET image_url = 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&q=80&w=480'
WHERE category = 'sheep';

UPDATE listings SET image_url = 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=480' WHERE category = 'poultry';

UPDATE listings 
SET image_url = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=480'
WHERE category = 'dog';

UPDATE listings 
SET image_url = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=480'
WHERE category = 'cat';

UPDATE listings 
SET image_url = 'https://images.unsplash.com/photo-1444464666168-49b626f86641?auto=format&fit=crop&q=80&w=480'
WHERE category = 'bird';
