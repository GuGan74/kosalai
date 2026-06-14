-- Fix existing dirty data where for_adoption is true but price is > 0
-- This ensures the 'Price Low' and 'Price High' sorting works perfectly in the UI.

UPDATE listings 
SET price = 0 
WHERE for_adoption = true AND price > 0;
