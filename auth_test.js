import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let key = match[1].trim();
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[key] = val;
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const email = `test.mockdata${Date.now()}@example.com`;
  const password = 'mockpassword123';
  
  console.log("Signing up user...");
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (authError) {
    console.error("Auth Error:", authError);
    return;
  }
  
  console.log("Signed up:", authData.user?.id);
  
  // Let's create a profile for them just in case
  if (authData.user?.id) {
     const { error: profileError } = await supabase.from('profiles').upsert({
         id: authData.user.id,
         full_name: 'Auth Test User',
         role: 'animal-buyer'
     });
     if (profileError) console.error("Profile creation error:", profileError);
  }
  
  // Try inserting using the newly authenticated user
  const { data, error } = await supabase.from('listings').insert({
    user_id: authData.user?.id,
    title: 'Auth Test Listing',
    category: 'cow'
  });
  console.log("Insert result:", data, error);
}
run();
