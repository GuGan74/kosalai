/**
 * prefetchData.js
 *
 * Starts fetching the most-needed data IMMEDIATELY when the JS bundle
 * is parsed — before React even mounts.
 *
 * By the time HomePage asks for data, it's already been fetched.
 * Now caches PER-CATEGORY so tab switches are instant.
 */

import { supabase } from './supabase';

const LIVESTOCK_CATEGORIES = ['cow', 'buffalo', 'goat', 'horse', 'poultry', 'sheep', 'other'];
const PET_CATEGORIES = ['dog', 'cat', 'bird', 'fish', 'rabbit', 'other-pet'];
const SELECTED_COLS = 'id,title,category,breed,location,state,price,milk_yield_liters,age_years,for_adoption,image_url,user_id,status,gender,created_at';

// Start fetching ALL data the moment this module is imported (before React mounts)
// Increased limit to 1000 to cover all categories adequately since we have 800+ test rows
const _livestockPromise = supabase
    .from('listings')
    .select(SELECTED_COLS)
    .eq('status', 'active')
    .in('category', LIVESTOCK_CATEGORIES)
    .order('created_at', { ascending: false })
    .limit(1000);

const _petsPromise = supabase
    .from('listings')
    .select(SELECTED_COLS)
    .eq('status', 'active')
    .in('category', PET_CATEGORIES)
    .order('created_at', { ascending: false })
    .limit(1000);

// In-memory caches
let _livestockCache = null;   // full list
let _petsCache = null;        // full list

// Per-category caches: { cow: [...], buffalo: [...], ... }
const _categoryCache = {};

function buildCategoryCache(data) {
    const map = {};
    for (const listing of data) {
        if (!map[listing.category]) map[listing.category] = [];
        map[listing.category].push(listing);
    }
    return map;
}

// When livestock data arrives, split into per-category caches
_livestockPromise.then(({ data }) => {
    if (data && data.length > 0) {
        _livestockCache = data;
        const cats = buildCategoryCache(data);
        Object.assign(_categoryCache, cats);

        // Store full list in sessionStorage
        try {
            sessionStorage.setItem('ks_home_livestock_all_recent', JSON.stringify(data));
        } catch (e) {}

        // Store each category in sessionStorage for instant access
        for (const [cat, listings] of Object.entries(cats)) {
            try {
                sessionStorage.setItem(`ks_home_cat_${cat}`, JSON.stringify(listings));
            } catch (e) {}
        }
    }
});

// When pets data arrives, split into per-category caches
_petsPromise.then(({ data }) => {
    if (data && data.length > 0) {
        _petsCache = data;
        const cats = buildCategoryCache(data);
        Object.assign(_categoryCache, cats);

        try {
            sessionStorage.setItem('ks_home_pets_all_recent', JSON.stringify(data));
        } catch (e) {}

        for (const [cat, listings] of Object.entries(cats)) {
            try {
                sessionStorage.setItem(`ks_home_cat_${cat}`, JSON.stringify(listings));
            } catch (e) {}
        }
    }
});

/**
 * Get all prefetched listings for a type (livestock or pets).
 * Returns instantly from cache, or waits for the in-flight request.
 */
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

/**
 * Get prefetched listings for a SPECIFIC category — returns instantly.
 * Falls back to full list filter if per-category cache is not ready.
 */
export function getPrefetchedByCategory(category) {
    // Check in-memory cache first
    if (_categoryCache[category]) return _categoryCache[category];

    // Check sessionStorage
    try {
        const cached = sessionStorage.getItem(`ks_home_cat_${category}`);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
                _categoryCache[category] = parsed;
                return parsed;
            }
        }
    } catch (e) {}

    return null; // not ready yet — caller should fall back to full list filter
}
