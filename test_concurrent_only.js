import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ulbrlhcelwoojwnvznrd.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_YWwkOCwcVoNUM0xnC3Wbiw_y1rX3Y4i';
const MOCK_UID = '041d014e-9c56-4563-afb6-34f76890e56d';

async function testConcurrent() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  console.log('--- AFTER OPTIMIZATION (Concurrent Cold Start) ---');
  console.time('Total Ready Time (Concurrent)');
  
  console.time('getSession');
  const sessionPromise = supabase.auth.getSession().then(() => console.timeEnd('getSession'));
  
  console.time('loadProfile');
  const profilePromise = supabase.from('profiles').select('*').eq('id', MOCK_UID).single().then(() => console.timeEnd('loadProfile'));
  
  await Promise.all([sessionPromise, profilePromise]);
  console.timeEnd('Total Ready Time (Concurrent)');
}
testConcurrent();
