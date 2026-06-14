import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// 1. Manually parse .env to avoid external dependencies
const envConfig = fs.readFileSync('.env', 'utf-8')
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .reduce((acc, line) => {
        const [key, ...value] = line.split('=');
        if (key && value) acc[key.trim()] = value.join('=').replace(/"/g, '').trim();
        return acc;
    }, {});

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Anon Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TEST_EMAIL = 'kosalailoadtest1@gmail.com';
const TEST_PASSWORD = 'LoadTestPassword123!';

const CLOUDINARY_URLS = [
    `https://res.cloudinary.com/${envConfig.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/v1/sample.jpg`,
    `https://res.cloudinary.com/${envConfig.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/v1/cld-sample.jpg`,
    `https://res.cloudinary.com/${envConfig.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/v1/cld-sample-2.jpg`
];

// Distribution: 30% cow, 20% buffalo, 20% goat, 10% sheep, 10% poultry, 5% dog, 5% cat
const CATEGORIES = [];
for(let i=0; i<30; i++) CATEGORIES.push('cow');
for(let i=0; i<20; i++) CATEGORIES.push('buffalo');
for(let i=0; i<20; i++) CATEGORIES.push('goat');
for(let i=0; i<10; i++) CATEGORIES.push('sheep');
for(let i=0; i<10; i++) CATEGORIES.push('poultry');
for(let i=0; i<5; i++) CATEGORIES.push('dog');
for(let i=0; i<5; i++) CATEGORIES.push('cat');

function getRandomCategory() {
    return CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
}

async function runLoadTest() {
    console.log('--- KOSALAI LOAD TEST SCRIPT ---');
    // Hardcoded UUID from existing mock data inserts to avoid Auth requirements
    const userId = '041d014e-9c56-4563-afb6-34f76890e56d';

    // 2. Generate 2000 Listings SQL
    console.log('\n2. Generating load_test_inserts.sql...');
    const TOTAL_LISTINGS = 2000;
    
    let sqlContent = `-- Load Test Inserts for ${TEST_EMAIL}\n`;
    sqlContent += `-- Run this in your Supabase SQL Editor to bypass RLS policies\n\n`;

    for (let i = 0; i < TOTAL_LISTINGS; i++) {
        const category = getRandomCategory();
        const forAdoption = Math.random() > 0.9;
        const price = forAdoption ? 0 : Math.floor(Math.random() * 50000) + 500;
        const age = Math.floor(Math.random() * 10) + 1;
        
        sqlContent += `INSERT INTO listings (id, user_id, title, category, breed, age_years, price, village, taluk, location, state, description, image_url, image_urls, status, is_vaccinated, for_adoption) VALUES (gen_random_uuid(), '${userId}', 'Load Test ${category.toUpperCase()} #${i+1}', '${category}', 'Mixed', ${age}, ${price}, 'Test Village', 'Test Taluk', 'Load Test City', 'Load Test State', 'This is an automated load testing listing to verify system capacity and performance.', '${CLOUDINARY_URLS[0]}', '["${CLOUDINARY_URLS[0]}", "${CLOUDINARY_URLS[1]}", "${CLOUDINARY_URLS[2]}"]'::jsonb, 'active', true, ${forAdoption});\n`;
    }

    fs.writeFileSync('load_test_inserts.sql', sqlContent);

    console.log(`\n--- LOAD TEST GENERATION COMPLETE ---`);
    console.log(`Successfully generated load_test_inserts.sql with ${TOTAL_LISTINGS} listings for user ${TEST_EMAIL}.`);
    console.log(`Please copy the contents of load_test_inserts.sql and run it in your Supabase SQL Editor.`);
}

runLoadTest();
