import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://ulbrlhcelwoojwnvznrd.supabase.co';
const supabaseKey = 'sb_publishable_YWwkOCwcVoNUM0xnC3Wbiw_y1rX3Y4i';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRealInsert() {
  const email = `gugan.test.${Date.now()}@gmail.com`;
  const password = 'Password123!';
  
  // 1. Sign up a new user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    console.error('SIGNUP ERROR:', authError);
    return;
  }
  console.log('Signed up user:', authData.user.id);

  // 2. Insert listing as this user
  const payload = {
    user_id: authData.user.id,
    title: 'Real Auth Test Listing',
    category: 'cow',
    breed: 'Other',
    custom_breed: 'Test Breed',
    gender: 'female',
    is_trained: false,
    is_neutered: false,
    age_years: 2,
    weight_kg: 200,
    milk_yield_liters: 10,
    is_vaccinated: true,
    is_pregnant: false,
    price: 1000,
    village: 'TestVillage',
    taluk: 'TestTaluk',
    location: 'TestCity',
    landmark: 'TestLandmark',
    state: 'Tamil Nadu',
    description: 'Testing insert from authenticated script',
    image_url: 'https://example.com/test.jpg',
    image_urls: ['https://example.com/test.jpg'],
    for_adoption: false,
    is_promoted: false,
    status: 'active',
    created_at: new Date().toISOString()
  };

  const { data: insertData, error: insertError } = await supabase.from('listings').insert(payload).select().single();
  if (insertError) {
    console.error('INSERT ERROR:', JSON.stringify(insertError, null, 2));
  } else {
    console.log('INSERT SUCCESS:', insertData.id);
  }
}
testRealInsert();
