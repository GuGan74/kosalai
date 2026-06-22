-- Create support_requests table
CREATE TABLE IF NOT EXISTS public.support_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Allow anonymous users to insert requests
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for everyone"
    ON public.support_requests FOR INSERT
    WITH CHECK (true);

-- Only admins can view requests (or nobody via API if managed from Supabase dashboard directly)
CREATE POLICY "Enable read access for authenticated users only"
    ON public.support_requests FOR SELECT
    USING (auth.role() = 'authenticated');
