-- Run these in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Set admin role for mail.kosalai@gmail.com
UPDATE profiles SET role = 'admin' WHERE email = 'mail.kosalai@gmail.com';

-- 2. Add report_type column to reports table (buyer vs seller)
ALTER TABLE reports ADD COLUMN IF NOT EXISTS report_type text DEFAULT 'buyer';

-- 3. Verify admin role
SELECT id, email, role FROM profiles WHERE email = 'mail.kosalai@gmail.com';

-- 4. Verify report_type column
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'reports' AND column_name = 'report_type';
