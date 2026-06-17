import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://ulbrlhcelwoojwnvznrd.supabase.co';
const supabaseKey = 'sb_publishable_YWwkOCwcVoNUM0xnC3Wbiw_y1rX3Y4i';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRealInsert() {
  const email = `gugan.test.2.${Date.now()}@gmail.com`;
  const password = 'Password123!';
  
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  console.log('Session:', authData.session ? 'EXISTS' : 'NULL');
}
testRealInsert();
