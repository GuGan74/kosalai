import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let key = match[1].trim(), val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[key] = val;
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

const valid1 = 'https://res.cloudinary.com/dmdrjb2n5/image/upload/v1776218250/listing-images/yoolkxyq2jfwea5ybkxp.jpg';
const valid2 = 'https://res.cloudinary.com/dmdrjb2n5/image/upload/v1776277773/listing-images/zytc1fw84p9rkvnabgnp.jpg';
const valid3 = 'https://res.cloudinary.com/dmdrjb2n5/image/upload/v1778663939/listing-images/upkvktwnv69lcobkcc0p.jpg';

async function fixImages() {
  console.log('Fixing load test images...');
  
  const { data, error } = await supabase
    .from('listings')
    .update({ 
        image_url: valid1,
        image_urls: [valid1, valid2, valid3]
    })
    .like('title', 'Load Test%');
    
  if (error) {
    console.error('Error updating images:', error);
  } else {
    console.log('Images successfully fixed to valid Cloudinary URLs!');
  }
}

fixImages();
