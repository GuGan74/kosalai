import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ulbrlhcelwoojwnvznrd.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_YWwkOCwcVoNUM0xnC3Wbiw_y1rX3Y4i';

async function run() {
  const customFetch = async (url, options) => {
    const res = await fetch(url, options);
    if (options.method === 'DELETE') {
      const clone = res.clone();
      const body = await clone.text();
      console.log('\n--- NETWORK REQUEST LOG ---');
      console.log('REQUEST URL:', url);
      console.log('QUERY PARAMETERS:', url.split('?')[1]);
      console.log('REQUEST PAYLOAD:', options.body || 'none');
      console.log('RESPONSE JSON:', body);
      console.log('RESPONSE HEADERS:', Object.fromEntries(res.headers.entries()));
      console.log('---------------------------\n');
    }
    return res;
  };

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    global: { fetch: customFetch }
  });

  console.log("Signing up test user...");
  const email = `testuser_${Date.now()}@gmail.com`;
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: 'securepassword123'
  });

  if (authError) {
      console.error("Sign up failed:", authError);
      return;
  }

  console.log("Inserting profile...");
  await supabase.from('profiles').insert({
    id: authData.user.id,
    full_name: 'Test',
    phone: '1234567890',
    district: 'Test District',
    is_profile_complete: true
  });

  console.log("Test user created. Inserting mock listing...");
  const { data: insertData, error: insertError } = await supabase.from('listings').insert({
    title: 'Trigger Test Listing',
    description: 'Testing the delete trigger',
    price: 100,
    category: 'poultry',
    user_id: authData.user.id
  }).select().single();

  if (insertError) {
      console.error("Insert failed:", insertError);
      return;
  }

  const id = insertData.id;
  console.log("Mock listing inserted. ID:", id);

  console.log("\n=== EXECUTING deleteListing() ===");
  console.log("DELETE ID:", id);
  console.log("DELETE TYPE:", typeof id);

  const result = await supabase
    .from("listings")
    .delete()
    .eq("id", id)
    .select();

  console.log("DELETE RESULT:", result);
}

run();
