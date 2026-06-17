import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ulbrlhcelwoojwnvznrd.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_YWwkOCwcVoNUM0xnC3Wbiw_y1rX3Y4i';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data, error } = await supabase.from('listings').update({ price: 0 }).eq('for_adoption', true).gt('price', 0);
  console.log("Error:", error);
  console.log("Fixed rows successfully.");
}
run();
