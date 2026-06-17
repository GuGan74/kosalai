import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Parse .env.local
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

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TEST_USER_ID = 'eeb2f38c-bdc0-4eb6-a7dc-51b6a38cb6f1';

const CATEGORIES = ['cow', 'buffalo', 'goat', 'sheep', 'poultry', 'dog', 'cat', 'bird'];

const LOCATIONS = ['Coimbatore', 'Chennai', 'Madurai', 'Trichy', 'Salem', 'Erode', 'Tiruppur', 'Vellore'];
const STATES = ['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh'];

const BREED_MAP = {
  cow: ['Gir', 'Sahiwal', 'HF', 'Jersey', 'Kangayam', 'Sindhi'],
  buffalo: ['Murrah', 'Surti', 'Jafarabadi', 'Nili-Ravi', 'Banni'],
  goat: ['Boer', 'Jamnapari', 'Barbari', 'Beetal', 'Sirohi'],
  sheep: ['Dorper', 'Nellore', 'Mandya', 'Deccani', 'Marwari'],
  poultry: ['Aseel', 'Kadaknath', 'Leghorn', 'Rhode Island Red', 'Brahma'],
  dog: ['Labrador', 'German Shepherd', 'Golden Retriever', 'Beagle', 'Indie', 'Rajapalayam'],
  cat: ['Persian', 'Siamese', 'Maine Coon', 'Bengal', 'Indie'],
  bird: ['Parrot', 'Pigeon', 'Cockatiel', 'Lovebirds', 'Finch']
};

const IMAGE_MAP = {
  cow: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=480',
  buffalo: 'https://images.unsplash.com/photo-1590432298711-20921ecfb25f?auto=format&fit=crop&q=80&w=480',
  goat: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&q=80&w=480',
  sheep: 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&q=80&w=480',
  poultry: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=480',
  dog: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=480',
  cat: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=480',
  bird: 'https://images.unsplash.com/photo-1444464666168-49b626f86641?auto=format&fit=crop&q=80&w=480'
};

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randBool = () => Math.random() > 0.5;

async function run() {
  console.log("Fetching an existing user...");
  let userId = TEST_USER_ID;
  const { data: users, error: userError } = await supabase.from('profiles').select('id').limit(1);
  
  if (userError || !users || users.length === 0) {
    console.error("No existing users found in 'profiles'. We will try to use the fallback ID, but inserts might fail if user_id is strictly checked by RLS.");
  } else {
    userId = users[0].id;
    console.log("Found existing user to attach mock listings to:", userId);
  }

  let listings = [];

  for (const cat of CATEGORIES) {
    console.log(`Generating 50 listings for ${cat}...`);
    for (let i = 0; i < 50; i++) {
      const breed = randItem(BREED_MAP[cat]);
      const price = rand(1000, 150000);
      const age = (Math.random() * 10).toFixed(1);
      
      let milk_yield = null;
      if (['cow', 'buffalo', 'goat'].includes(cat)) {
         milk_yield = rand(2, 30);
      }

      listings.push({
        user_id: userId,
        title: `Test ${breed} ${cat.charAt(0).toUpperCase() + cat.slice(1)} - ${i + 1}`,
        category: cat,
        breed: breed,
        age_years: parseFloat(age),
        weight_kg: rand(5, 500),
        milk_yield_liters: milk_yield,
        is_vaccinated: randBool(),
        is_pregnant: ['cow', 'buffalo', 'goat', 'sheep'].includes(cat) ? randBool() : false,
        is_verified: randBool(),
        is_promoted: randBool(),
        for_adoption: randBool() && ['dog', 'cat'].includes(cat),
        price: price,
        location: randItem(LOCATIONS),
        state: randItem(STATES),
        description: `This is an auto-generated test listing for a ${breed} ${cat}. Ideal for test purposes.`,
        image_url: IMAGE_MAP[cat],
        status: 'active',
        gender: randBool() ? 'male' : 'female',
        is_trained: ['dog', 'cat'].includes(cat) ? randBool() : false,
        is_neutered: ['dog', 'cat'].includes(cat) ? randBool() : false
      });
    }
  }

  console.log(`Prepared ${listings.length} listings. Generating SQL file...`);

  let sqlContent = `-- Mock Data for Kosalai
-- Run this in your Supabase SQL Editor to bypass RLS policies

`;

  // We'll just generate the UUID for each listing to avoid syntax issues
  listings.forEach((listing, index) => {
    sqlContent += `INSERT INTO listings (id, user_id, title, category, breed, age_years, weight_kg, milk_yield_liters, is_vaccinated, is_pregnant, is_verified, is_promoted, for_adoption, price, location, state, description, image_url, status, gender, is_trained, is_neutered) VALUES (
      gen_random_uuid(),
      '${listing.user_id}',
      '${listing.title.replace(/'/g, "''")}',
      '${listing.category}',
      '${listing.breed}',
      ${listing.age_years},
      ${listing.weight_kg},
      ${listing.milk_yield_liters === null ? 'NULL' : listing.milk_yield_liters},
      ${listing.is_vaccinated},
      ${listing.is_pregnant},
      ${listing.is_verified},
      ${listing.is_promoted},
      ${listing.for_adoption},
      ${listing.price},
      '${listing.location.replace(/'/g, "''")}',
      '${listing.state.replace(/'/g, "''")}',
      '${listing.description.replace(/'/g, "''")}',
      '${listing.image_url}',
      '${listing.status}',
      '${listing.gender}',
      ${listing.is_trained},
      ${listing.is_neutered}
    );\n`;
  });

  fs.writeFileSync('mock_data_inserts.sql', sqlContent);
  console.log("SQL file generated successfully! Run 'mock_data_inserts.sql' in your Supabase SQL Editor.");
}

run();
