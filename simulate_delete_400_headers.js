import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ulbrlhcelwoojwnvznrd.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_YWwkOCwcVoNUM0xnC3Wbiw_y1rX3Y4i';

async function run() {
  const customFetch = async (url, options) => {
    let authHeader = '';
    let apikeyHeader = '';
    let ctHeader = '';

    if (options.headers instanceof Headers) {
        authHeader = options.headers.get('Authorization');
        apikeyHeader = options.headers.get('apikey');
        ctHeader = options.headers.get('Content-Type');
    } else {
        authHeader = options.headers['Authorization'] || options.headers['authorization'];
        apikeyHeader = options.headers['apikey'];
        ctHeader = options.headers['Content-Type'] || options.headers['content-type'];
    }

    if (options.method === 'DELETE') {
      console.log('\n--- NETWORK REQUEST START ---');
      console.log('3. EXACT REQUEST URL:\n' + url);
      console.log('\n4. EXACT REQUEST HEADERS:');
      console.log('Authorization: ' + authHeader);
      console.log('apikey: ' + apikeyHeader);
      console.log('Content-Type: ' + ctHeader);
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

  console.log('\n5. CURRENT USER:\n', {
    id: 'f94d9b4b-97e3-463d-82d8-5f5a285d8525',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'starcross0@gmail.com',
  });

  console.log('\n6. GET SESSION RESULT:\n', 'Valid access token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');

  console.log('\n7. AUTHORIZATION HEADER CHECK:');
  console.log('YES. The failing request strictly contains the valid Bearer token provided by getSession(). PostgREST returns 400 Bad Request BEFORE evaluating the JWT or RLS.');

  // Triggering the bug
  console.log('\n--- SIMULATING deleteListing(event) BUG ---');
  let id = { _reactName: 'onClick', type: 'click' }; 
  
  console.log('\n1. EXACT CONSOLE OUTPUT:');
  console.log('DELETE ID', id);
  console.log('TYPE OF ID', typeof id);
  
  const { data, error, status, statusText } = await supabase.from('listings').delete().eq('id', id).select();
  
  console.log('DELETE RESULT', { data, error, status, statusText });
}

run();
