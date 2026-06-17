import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ulbrlhcelwoojwnvznrd.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_YWwkOCwcVoNUM0xnC3Wbiw_y1rX3Y4i';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data, error, status, statusText } = await supabase.from('listings').delete().eq('id', '[object Object]');
  console.log("Response with [object Object]:", { status, error });

  const res2 = await supabase.from('listings').delete().eq('id', 'undefined');
  console.log("Response with 'undefined':", { status: res2.status, error: res2.error });

  const res3 = await supabase.from('listings').delete().eq('id', null);
  console.log("Response with null:", { status: res3.status, error: res3.error });
}
run();
