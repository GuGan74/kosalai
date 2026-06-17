import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { performance } from 'perf_hooks';

const envStr = fs.readFileSync('.env', 'utf8');
const urlMatch = envStr.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = envStr.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
const supabase = createClient(urlMatch[1], keyMatch[1]);
const UID = 'de691c02-abe5-41b8-bd57-cce4ab01e0c9';

async function run() {
  const t0 = performance.now();
  await supabase.from('profiles').select('*').eq('id', UID).single();
  const t1 = performance.now();
  
  const t2 = performance.now();
  await supabase.from('profiles').select('*').eq('id', UID).single();
  const t3 = performance.now();
  
  console.log(`First Query (Cold Network/SSL): ${(t1 - t0).toFixed(2)} ms`);
  console.log(`Second Query (Warm Network/DB): ${(t3 - t2).toFixed(2)} ms`);
}
run();
