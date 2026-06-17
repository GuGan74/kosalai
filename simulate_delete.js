import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ulbrlhcelwoojwnvznrd.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_YWwkOCwcVoNUM0xnC3Wbiw_y1rX3Y4i';

async function run() {
  const customFetch = async (url, options) => {
    if (options.method === 'DELETE') {
      console.log('\n--- NETWORK REQUEST START ---');
      console.log('3. EXACT REQUEST URL:\n' + url);
      console.log('\n4. EXACT REQUEST HEADERS:');
      console.log('Authorization: ' + options.headers['Authorization']);
      console.log('apikey: ' + options.headers['apikey']);
      console.log('Content-Type: ' + options.headers['Content-Type']);
    }

    const res = await fetch(url, options);
    
    if (options.method === 'DELETE') {
      const clone = res.clone();
      const body = await clone.text();
      console.log('\n2. EXACT NETWORK RESPONSE BODY:\n' + body);
      console.log('--- NETWORK REQUEST END ---\n');
    }
    return res;
  };

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    global: { fetch: customFetch }
  });

  // Login
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'password123'
  });

  if (authErr) {
    console.log("Login failed:", authErr);
    return;
  }

  const currentUser = authData.user;
  console.log('\n5. CURRENT USER:\n', currentUser);

  const { data: sessionData } = await supabase.auth.getSession();
  console.log('\n6. GET SESSION RESULT:\n', sessionData.session ? `Valid access token: ${sessionData.session.access_token.substring(0, 15)}...` : 'No session');

  console.log('\n7. AUTHORIZATION HEADER CHECK:');
  console.log('The token from getSession will match the Authorization header Bearer token printed above.');

  // Fetch a listing to delete
  const { data: listings } = await supabase.from('listings').select('*').eq('user_id', currentUser.id).limit(1);
  if (!listings || listings.length === 0) {
    console.log("No listings found for this user.");
    return;
  }
  
  const l = listings[0];
  
  // Simulate deleteListing exactly as in MyListingsPage.jsx
  console.log('\n--- SIMULATING deleteListing(l.id) ---');
  let id = l.id;
  
  console.log('1. EXACT CONSOLE OUTPUT:');
  console.log('DELETE ID', id);
  console.log('TYPE OF ID', typeof id);
  
  const { data, error, status, statusText } = await supabase.from('listings').delete().eq('id', id).select();
  
  console.log('DELETE RESULT', { data, error, status, statusText });
}

run();
