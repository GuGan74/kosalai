import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://ulbrlhcelwoojwnvznrd.supabase.co';
const supabaseKey = 'sb_publishable_YWwkOCwcVoNUM0xnC3Wbiw_y1rX3Y4i';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkInsert() {
  const payload = {
    user_id: '041d014e-9c56-4563-afb6-34f76890e56d', // A valid user_id from load tests
    title: 'Constraint Test',
    category: 'cow',
    breed: 'Other',
    price: 1000,
    location: 'Test',
    state: 'Test',
    description: 'Test',
    village: 'test',
    taluk: 'test',
    status: 'active'
  };

  const { data, error } = await supabase.from('listings').insert(payload).select().single();
  if (error) {
    console.error('INSERT ERROR:', JSON.stringify(error, null, 2));
  } else {
    console.log('INSERT SUCCESS:', data.id);
  }
}
checkInsert();
