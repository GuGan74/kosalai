import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ulbrlhcelwoojwnvznrd.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_YWwkOCwcVoNUM0xnC3Wbiw_y1rX3Y4i';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data } = await supabase.from('listings').select('*').eq('title', 'Country hens').limit(1);
  if (data && data.length > 0) {
      console.log('Country hens user_id:', data[0].user_id);
  }
}
run();
