/**
 * prefetchData.js
 * 
 * This module starts fetching the most-needed data IMMEDIATELY
 * when the JS bundle is parsed — before React even mounts.
 * 
 * By the time the HomePage component mounts and asks for data,
 * it's already been fetched and is waiting here.
 */

import { supabase } from './supabase';

const LIVESTOCK_CATEGORIES = ['cow', 'buffalo', 'goat', 'horse', 'poultry', 'sheep', 'other'];
const SELECTED_COLS = 'id,title,category,breed,location,state,price,milk_yield_liters,age_years,for_adoption,image_url,user_id,status,gender,created_at';

// Start fetching the moment this module is imported (before React mounts)
const _livestockPromise = supabase
    .from('listings')
    .select(SELECTED_COLS)
    .eq('status', 'active')
    .in('category', LIVESTOCK_CATEGORIES)
    .order('created_at', { ascending: false })
    .limit(60);

const _petsPromise = supabase
    .from('listings')
    .select(SELECTED_COLS)
    .eq('status', 'active')
    .not('category', 'in', `(${LIVESTOCK_CATEGORIES.join(',')})`)
    .order('created_at', { ascending: false })
    .limit(60);

// Cache the results when they arrive
let _livestockCache = null;
let _petsCache = null;

_livestockPromise.then(({ data }) => {
    if (data && data.length > 0) {
        _livestockCache = data;
        try { sessionStorage.setItem('ks_home_livestock_all_recent', JSON.stringify(data)); } catch (e) {}
    }
});

_petsPromise.then(({ data }) => {
    if (data && data.length > 0) {
        _petsCache = data;
        try { sessionStorage.setItem('ks_home_pets_all_recent', JSON.stringify(data)); } catch (e) {}
    }
});

// Consumers call this to get the pre-fetched data instantly, or wait for it
export async function getPrefetchedListings(type = 'livestock') {
    if (type === 'livestock') {
        if (_livestockCache) return _livestockCache;
        const { data } = await _livestockPromise;
        return data || [];
    } else {
        if (_petsCache) return _petsCache;
        const { data } = await _petsPromise;
        return data || [];
    }
}
