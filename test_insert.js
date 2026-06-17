import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://ulbrlhcelwoojwnvznrd.supabase.co';
const supabaseKey = 'sb_publishable_YWwkOCwcVoNUM0xnC3Wbiw_y1rX3Y4i';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const payload = {
    title: 'Test Listing Script',
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
    description: 'Testing insert from script',
    image_url: 'https://example.com/test.jpg',
    image_urls: ['https://example.com/test.jpg'],
    for_adoption: false,
    is_promoted: false,
    status: 'active',
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from('listings').insert(payload).select().single();
  if (error) {
    console.error('INSERT ERROR:', JSON.stringify(error, null, 2));
  } else {
    console.log('INSERT SUCCESS:', data.id);
  }
}
testInsert();
