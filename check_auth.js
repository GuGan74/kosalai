import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://ulbrlhcelwoojwnvznrd.supabase.co';
const supabaseKey = 'sb_publishable_YWwkOCwcVoNUM0xnC3Wbiw_y1rX3Y4i';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  console.log('Session from getSession():', session ? 'EXISTS' : 'NULL');
}
testSession();
