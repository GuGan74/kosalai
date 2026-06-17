import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ulbrlhcelwoojwnvznrd.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_YWwkOCwcVoNUM0xnC3Wbiw_y1rX3Y4i';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data, count, error } = await supabase
    .from('listings')
    .select('title, price, created_at', { count: 'exact' })
    .eq('for_adoption', true)
    .gt('price', 0)
    .order('created_at', { ascending: true });
    
  console.log("Total Count:", count);
  console.log("Oldest Row:", data[0]);
  console.log("Newest Row:", data[data.length - 1]);
  console.log("Sample 20 Rows:", data.slice(0, 20));
  
  const nonLoadTest = data.filter(r => !r.title.startsWith('Load Test'));
  const loadTest = data.filter(r => r.title.startsWith('Load Test'));
  const testItems = data.filter(r => r.title.startsWith('Test '));
  
  console.log("Breakdown:");
  console.log("- 'Load Test':", loadTest.length);
  console.log("- 'Test ' (Mock data):", testItems.length);
  console.log("- Real user (neither):", data.length - loadTest.length - testItems.length);
  
  const realUsers = data.filter(r => !r.title.startsWith('Load Test') && !r.title.startsWith('Test '));
  if (realUsers.length > 0) {
    console.log("Real user samples:", realUsers.slice(0, 5));
  }
}
run();
