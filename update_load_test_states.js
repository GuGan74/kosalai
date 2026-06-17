import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ulbrlhcelwoojwnvznrd.supabase.co';
const supabaseKey = 'sb_publishable_YWwkOCwcVoNUM0xnC3Wbiw_y1rX3Y4i';
const supabase = createClient(supabaseUrl, supabaseKey);

const INDIAN_STATES = [
    'Tamil Nadu', 'Maharashtra', 'Uttar Pradesh', 'Rajasthan',
    'Gujarat', 'Punjab', 'Haryana', 'Telangana', 'Karnataka',
    'Andhra Pradesh', 'Madhya Pradesh', 'Bihar',
    'Arunachal Pradesh', 'Assam', 'Chhattisgarh', 'Goa',
    'Himachal Pradesh', 'Jharkhand', 'Kerala', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Sikkim',
    'Tripura', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh',
    'Puducherry', 'Andaman & Nicobar', 'Dadra & Nagar Haveli',
    'Daman & Diu', 'Lakshadweep'
];

// Mapping to provide at least one realistic city for some major states
const STATE_CITY_MAP = {
    'Tamil Nadu': 'Chennai',
    'Maharashtra': 'Mumbai',
    'Karnataka': 'Bangalore',
    'Gujarat': 'Ahmedabad',
    'Rajasthan': 'Jaipur',
    'Punjab': 'Ludhiana',
    'Uttar Pradesh': 'Lucknow',
    'Haryana': 'Gurugram',
    'Kerala': 'Kochi',
    'Andhra Pradesh': 'Visakhapatnam',
    'Telangana': 'Hyderabad',
    'Delhi': 'New Delhi',
    'West Bengal': 'Kolkata',
};

async function updateStates() {
    console.log('Fetching load test listings...');
    
    // Fetch all load test listings
    const { data: listings, error: fetchError } = await supabase
        .from('listings')
        .select('id')
        .eq('state', 'Load Test State');

    if (fetchError) {
        console.error('Error fetching listings:', fetchError);
        return;
    }

    if (!listings || listings.length === 0) {
        console.log('No listings found with state "Load Test State".');
        return;
    }

    console.log(`Found ${listings.length} listings to update. Processing...`);

    let successCount = 0;
    
    // Process sequentially or in small batches to avoid rate limits
    for (const listing of listings) {
        const randomState = INDIAN_STATES[Math.floor(Math.random() * INDIAN_STATES.length)];
        const randomCity = STATE_CITY_MAP[randomState] || 'District City';
        
        const { error: updateError } = await supabase
            .from('listings')
            .update({ 
                state: randomState,
                location: randomCity 
            })
            .eq('id', listing.id);
            
        if (updateError) {
            console.error(`Failed to update listing ${listing.id}:`, updateError);
        } else {
            successCount++;
            if (successCount % 100 === 0) {
                console.log(`Updated ${successCount} listings...`);
            }
        }
    }

    console.log(`\nFinished! Successfully updated ${successCount} out of ${listings.length} listings with realistic states.`);
}

updateStates();
