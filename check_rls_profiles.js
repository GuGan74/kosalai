import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  'https://ulbrlhcelwoojwnvznrd.supabase.co',
  'sb_publishable_YWwkOCwcVoNUM0xnC3Wbiw_y1rX3Y4i'
);
async function check() {
  const start = Date.now();
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  console.log('Query took:', Date.now() - start, 'ms');
  console.log('Error:', error);
}
check();
