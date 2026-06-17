import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ulbrlhcelwoojwnvznrd.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_YWwkOCwcVoNUM0xnC3Wbiw_y1rX3Y4i';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data, error } = await supabase.from('listings').select('id, title').eq('title', 'Country hens').limit(1);
  if (data && data.length > 0) {
      console.log('Country hens ID:', data[0].id);
      
      console.log('Testing delete with this exact ID...');
      const { data: dData, error: dErr, status } = await supabase.from('listings').delete().eq('id', data[0].id).select();
      console.log('Delete status:', status);
      console.log('Delete error:', dErr);
  } else {
      console.log('Country hens not found in DB!');
  }
}
run();
