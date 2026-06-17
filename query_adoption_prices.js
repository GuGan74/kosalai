import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ulbrlhcelwoojwnvznrd.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_YWwkOCwcVoNUM0xnC3Wbiw_y1rX3Y4i';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data, count, error } = await supabase
    .from('listings')
    .select('*', { count: 'exact' })
    .eq('for_adoption', true)
    .gt('price', 0)
    .order('created_at', { ascending: true });
    
  if (error) {
    console.error("Error:", error);
    return;
  }
  
  console.log("Total Count:", count);
  console.log("Oldest Row:", data[0]);
  console.log("Newest Row:", data[data.length - 1]);
  console.log("Sample 20 Rows:", data.slice(0, 20).map(r => ({ title: r.title, price: r.price, created_at: r.created_at })));
  
  // Check origins
  const nonLoadTest = data.filter(r => !r.title.startsWith('Load Test'));
  console.log("Non-'Load Test' listings:", nonLoadTest.length);
  if (nonLoadTest.length > 0) {
    console.log("Sample non-Load Test:", nonLoadTest.slice(0, 5));
  }
}
run();
