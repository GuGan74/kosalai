import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ulbrlhcelwoojwnvznrd.supabase.co';
const supabaseKey = 'sb_publishable_YWwkOCwcVoNUM0xnC3Wbiw_y1rX3Y4i';
const supabase = createClient(supabaseUrl, supabaseKey);

async function getCurrentStates() {
    console.log('Fetching all current listing states from the database...\n');
    
    // We fetch all states and count them locally
    const { data: listings, error } = await supabase
        .from('listings')
        .select('state');

    if (error) {
        console.error('Error fetching data:', error.message);
        return;
    }

    if (!listings || listings.length === 0) {
        console.log('No listings found in the database.');
        return;
    }

    const stateCounts = {};
    listings.forEach(listing => {
        const state = listing.state || 'Unknown / Null';
        stateCounts[state] = (stateCounts[state] || 0) + 1;
    });

    // Sort by count descending
    const sortedStates = Object.entries(stateCounts)
        .sort((a, b) => b[1] - a[1]);

    console.log(`Found ${listings.length} total listings. Breakdown by state:`);
    console.log('---------------------------------------------------------');
    
    sortedStates.forEach(([state, count]) => {
        console.log(`- ${state}: ${count} listing(s)`);
    });
}

getCurrentStates();
