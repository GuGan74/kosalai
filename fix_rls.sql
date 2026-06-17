-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "listings_insert_all" ON public.listings;
DROP POLICY IF EXISTS "listings_insert_own" ON public.listings;

-- Create a fresh policy allowing authenticated users to insert rows they own
CREATE POLICY "listings_insert_own" 
ON public.listings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Just in case, allow reading all listings
DROP POLICY IF EXISTS "listings_read_all" ON public.listings;
CREATE POLICY "listings_read_all" 
ON public.listings FOR SELECT 
USING (true);
