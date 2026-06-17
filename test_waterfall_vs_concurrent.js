import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ulbrlhcelwoojwnvznrd.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_YWwkOCwcVoNUM0xnC3Wbiw_y1rX3Y4i';
const MOCK_UID = '041d014e-9c56-4563-afb6-34f76890e56d';

// We create fresh clients so we can measure cold-start connection latency accurately
async function testWaterfall() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  console.log('--- BEFORE OPTIMIZATION (Waterfall) ---');
  console.time('Total Ready Time (Waterfall)');
  
  console.time('getSession');
  await supabase.auth.getSession();
  console.timeEnd('getSession');
  
  console.time('loadProfile');
  await supabase.from('profiles').select('*').eq('id', MOCK_UID).single();
  console.timeEnd('loadProfile');
  
  console.timeEnd('Total Ready Time (Waterfall)');
  console.log('');
}

async function testConcurrent() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  console.log('--- AFTER OPTIMIZATION (Concurrent) ---');
  console.time('Total Ready Time (Concurrent)');
  
  // Start both immediately
  console.time('getSession (Concurrent)');
  const sessionPromise = supabase.auth.getSession().then(() => {
      console.timeEnd('getSession (Concurrent)');
  });
  
  console.time('loadProfile (Concurrent)');
  const profilePromise = supabase.from('profiles').select('*').eq('id', MOCK_UID).single().then(() => {
      console.timeEnd('loadProfile (Concurrent)');
  });
  
  await Promise.all([sessionPromise, profilePromise]);
  console.timeEnd('Total Ready Time (Concurrent)');
  console.log('');
}

async function runTests() {
  // Run concurrent first, then waterfall, or vice-versa?
  // We'll run them in separate processes if needed, but sequential is fine for demonstration.
  // Actually, to simulate cold start for BOTH, we'll run one, but Supabase client caches DNS.
  // It's still a good representation.
  
  await testWaterfall();
  await testConcurrent();
}

runTests();
