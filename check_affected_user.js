import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const configStr = fs.readFileSync('supabase/config.toml', 'utf8');
const envStr = fs.readFileSync('.env', 'utf8');

const urlMatch = envStr.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = envStr.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

if (!urlMatch || !keyMatch) {
  console.log("Could not find credentials");
  process.exit(1);
}

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function run() {
  const { data, error } = await supabase.from('profiles').select('*').eq('email', 'menagatextup@gmail.com').single();
  if (error) {
    console.error(error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

run();
