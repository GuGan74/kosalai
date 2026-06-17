import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ulbrlhcelwoojwnvznrd.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_YWwkOCwcVoNUM0xnC3Wbiw_y1rX3Y4i';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data, error } = await supabase.from('profiles').select('id, email, is_profile_complete').eq('is_profile_complete', false);
  console.log("False:", data);
  const { data: d2 } = await supabase.from('profiles').select('id, email, is_profile_complete').is('is_profile_complete', null);
  console.log("Null:", d2);
}
run();
