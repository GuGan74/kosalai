import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ulbrlhcelwoojwnvznrd.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_YWwkOCwcVoNUM0xnC3Wbiw_y1rX3Y4i';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const cases = [
    { name: 'undefined', val: undefined },
    { name: 'null', val: null },
    { name: 'empty string', val: '' },
    { name: 'object', val: {} },
    { name: 'event mock', val: { _reactName: 'onClick', type: 'click' } },
  ];

  for (let c of cases) {
    console.log(`\n--- testing: ${c.name} ---`);
    const { data, error, status, statusText } = await supabase.from('listings').delete().eq('id', c.val);
    console.log(`status: ${status}, error:`, error);
  }
}
run();
