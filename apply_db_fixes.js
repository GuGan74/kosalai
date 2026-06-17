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
  console.log('Fixing poultry images...');
  
  // Note: we're using REST API to run an update
  const { data, error } = await supabase
    .from('listings')
    .update({ image_url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=480' })
    .eq('category', 'poultry');
    
  if (error) {
    console.error('Error updating images:', error);
  } else {
    console.log('Images fixed successfully!');
  }
}
run();
