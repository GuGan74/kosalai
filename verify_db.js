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
  console.log('\n🔍 KOSALAI DB VERIFICATION REPORT\n' + '='.repeat(40));

  // 1. Total listings count
  const { count: total } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true });
  console.log(`\n📊 Total listings: ${total}`);

  // 2. Count per category
  const categories = ['cow','buffalo','goat','sheep','poultry','dog','cat','bird','horse'];
  const { data: catData } = await supabase
    .from('listings')
    .select('category')
    .eq('status', 'active');
  
  const catMap = {};
  (catData || []).forEach(l => {
    catMap[l.category] = (catMap[l.category] || 0) + 1;
  });
  
  console.log('\n📋 Listings per category:');
  categories.forEach(cat => {
    const count = catMap[cat] || 0;
    const bar = '█'.repeat(Math.min(count, 30));
    const status = count >= 50 ? '✅' : count > 0 ? '⚠️ ' : '❌';
    console.log(`  ${status} ${cat.padEnd(10)} ${String(count).padStart(3)}  ${bar}`);
  });

  // 3. Check image URLs
  const { data: withImages } = await supabase
    .from('listings')
    .select('category, image_url')
    .not('image_url', 'is', null)
    .limit(1);
  
  const { count: imageCount } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .not('image_url', 'is', null);
  
  const { count: unsplashCount } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .like('image_url', '%unsplash%');

  console.log(`\n🖼️  Image check:`);
  console.log(`  Listings WITH image_url:    ${imageCount}`);
  console.log(`  Listings using Unsplash:    ${unsplashCount}`);
  
  // Sample one image URL
  if (withImages && withImages[0]) {
    console.log(`  Sample URL: ${withImages[0].image_url?.substring(0, 60)}...`);
  }

  // 4. Check if index exists
  const { data: indexes } = await supabase.rpc('version');
  console.log(`\n🗄️  Supabase connected: ${indexes ? '✅' : '❌'}`);

  // 5. Active listings
  const { count: activeCount } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');
  console.log(`\n✅ Active listings: ${activeCount}`);

  console.log('\n' + '='.repeat(40));
  
  if (total >= 400) {
    console.log('🎉 All 400 test listings inserted correctly!');
  } else {
    console.log(`⚠️  Expected ~400 listings but found ${total}. mock_data_inserts.sql may not have run.`);
  }

  if (unsplashCount > 0) {
    console.log('🖼️  Images fixed with Unsplash URLs!');
  } else {
    console.log('⚠️  No Unsplash images found. fix_images.sql may not have run.');
  }
}

run();
// run as separate check
