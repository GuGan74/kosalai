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
  const { data, error } = await supabase.from('profiles').select('*').eq('id', UID).single();
  const t1 = performance.now();
  
  console.log(`Supabase Client Query Time: ${(t1 - t0).toFixed(2)} ms`);
}
run();
