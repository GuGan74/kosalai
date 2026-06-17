import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let key = match[1].trim(), val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[key] = val;
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('listings')
    .select('id,category')
    .eq('status', 'active')
    .eq('category', 'poultry')
    .order('created_at', { ascending: false })
    .limit(1000);
    
  console.log('Recent count:', data ? data.length : 0, error || '');

  const { data: data2, error: error2 } = await supabase.from('listings')
    .select('id,category')
    .eq('status', 'active')
    .eq('category', 'poultry')
    .order('price', { ascending: true })
    .limit(1000);
    
  console.log('Price low count:', data2 ? data2.length : 0, error2 || '');
}
run();
