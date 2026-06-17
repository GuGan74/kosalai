import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ulbrlhcelwoojwnvznrd.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_YWwkOCwcVoNUM0xnC3Wbiw_y1rX3Y4i';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .limit(1);

  if (error) console.error(error);
  if (data && data.length > 0) {
    console.log("Full listing object:", data[0]);
    console.log("Has listing_code?", 'listing_code' in data[0]);
  }
}
run();
