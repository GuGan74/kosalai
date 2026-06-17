import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  'https://ulbrlhcelwoojwnvznrd.supabase.co',
  'sb_publishable_YWwkOCwcVoNUM0xnC3Wbiw_y1rX3Y4i'
);
async function run() {
  console.time('fetchProfile');
  // Use the ID from the mock data or a known user
  const { data: profile, error: pErr } = await supabase.from('profiles').select('*').limit(1).single();
  console.timeEnd('fetchProfile');

  console.time('fetchListingsCount');
  const { data: c1 } = await supabase.from('listings').select('id', { count: 'exact', head: true }).eq('user_id', profile?.id || '');
  console.timeEnd('fetchListingsCount');

  console.time('fetchInquiriesCount');
  const { data: c2 } = await supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', profile?.id || '').eq('type', 'inquiry');
  console.timeEnd('fetchInquiriesCount');

  console.time('fetchSoldCount');
  const { data: c3 } = await supabase.from('listings').select('id', { count: 'exact', head: true }).eq('user_id', profile?.id || '').eq('status', 'sold');
  console.timeEnd('fetchSoldCount');
}
run();
