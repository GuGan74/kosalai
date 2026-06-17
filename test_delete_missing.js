import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ulbrlhcelwoojwnvznrd.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_YWwkOCwcVoNUM0xnC3Wbiw_y1rX3Y4i';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
async function run() {
  const result = await supabase.from('listings').delete().eq('id', 'ae21d8da-7291-4760-8709-830f6e85597a').select();
  console.log("Delete non-existent row:", result.status, result.error);
}
run();
