import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { performance } from 'perf_hooks';

const envStr = fs.readFileSync('.env', 'utf8');
const urlMatch = envStr.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = envStr.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
const supabase = createClient(urlMatch[1], keyMatch[1]);
const UID = 'de691c02-abe5-41b8-bd57-cce4ab01e0c9'; // MENAGA TEX

async function run() {
  const t0 = performance.now();
  
  // 1. Profile fetch
  const tProfile0 = performance.now();
  await supabase.from('profiles').select('*').eq('id', UID).single();
  const tProfile1 = performance.now();
  
  // 2. Stats (parallel)
  const tStats0 = performance.now();
  await Promise.all([
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('user_id', UID),
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('user_id', UID).eq('status', 'sold')
  ]);
  const tStats1 = performance.now();
  
  // 3. Favorites
  const tFav0 = performance.now();
  await supabase.from('favorites').select(`listing_id, listings (*)`).eq('user_id', UID);
  const tFav1 = performance.now();

  console.log(`Profile fetch: ${(tProfile1 - tProfile0).toFixed(2)} ms`);
  console.log(`Stats fetch (2 queries parallel): ${(tStats1 - tStats0).toFixed(2)} ms`);
  console.log(`Favorites fetch: ${(tFav1 - tFav0).toFixed(2)} ms`);
  console.log(`Total sequential time: ${(tFav1 - tProfile0).toFixed(2)} ms`);
  
  // 4. Everything parallel
  const tAll0 = performance.now();
  await Promise.all([
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('user_id', UID),
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('user_id', UID).eq('status', 'sold'),
      supabase.from('favorites').select(`listing_id, listings (*)`).eq('user_id', UID)
  ]);
  const tAll1 = performance.now();
  console.log(`Total parallel time (Stats + Fav): ${(tAll1 - tAll0).toFixed(2)} ms`);
}
run();
