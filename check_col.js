import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  'https://ulbrlhcelwoojwnvznrd.supabase.co',
  'sb_publishable_YWwkOCwcVoNUM0xnC3Wbiw_y1rX3Y4i'
);
async function run() {
  const { data, error } = await supabase.from('profiles').select('is_profile_complete').limit(1);
  console.log(data, error);
}
run();
