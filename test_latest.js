import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://ulbrlhcelwoojwnvznrd.supabase.co';
const supabaseKey = 'sb_publishable_YWwkOCwcVoNUM0xnC3Wbiw_y1rX3Y4i';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLatest() {
  const { data, error } = await supabase.from('listings').select('id, title, created_at, status').order('created_at', { ascending: false }).limit(5);
  if (error) {
    console.error('SELECT ERROR:', error);
  } else {
    console.log('LATEST LISTINGS:', data);
  }
}
checkLatest();
