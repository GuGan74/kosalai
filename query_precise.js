import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ulbrlhcelwoojwnvznrd.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_YWwkOCwcVoNUM0xnC3Wbiw_y1rX3Y4i';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data } = await supabase
    .from('listings')
    .select('title, price, created_at')
    .eq('for_adoption', true)
    .gt('price', 0)
    .order('created_at', { ascending: true });
    
  console.log("Total Count:", data.length);
  console.log("Oldest Row:", data[0]);
  console.log("Newest Row:", data[data.length - 1]);
}
run();
