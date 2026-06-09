import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getPrefetchedListings } from '../lib/prefetchData';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import { useTranslation } from 'react-i18next';
import ListingCard from '../components/ListingCard';
import SkeletonCard from '../components/SkeletonCard';
import SEOHead from '../components/SEOHead';
import './HomePage.css';

const PAGE_SIZE = 16;
const PET_IDS = ['dog', 'cat', 'bird', 'fish', 'rabbit', 'other-pet'];
const LIVESTOCK_IDS = ['cow', 'buffalo', 'goat', 'sheep', 'horse', 'poultry', 'other'];
const SELECTED_COLS = 'id,title,category,breed,location,state,price,milk_yield_liters,age_years,for_adoption,image_url,user_id,status,gender,created_at';

const INDIAN_STATES = [
    'Tamil Nadu', 'Karnataka', 'Kerala', 'Andhra Pradesh', 'Telangana',
    'Maharashtra', 'Gujarat', 'Rajasthan', 'Punjab', 'Haryana',
    'Uttar Pradesh', 'Bihar', 'West Bengal', 'Odisha', 'Madhya Pradesh',
    'Assam', 'Jharkhand', 'Uttarakhand', 'Himachal Pradesh', 'Chhattisgarh',
    'Goa', 'Tripura', 'Meghalaya', 'Manipur', 'Arunachal Pradesh',
    'Delhi', 'Jammu & Kashmir', 'Puducherry',
];

const DEMO_LISTINGS = import.meta.env.VITE_SHOW_DEMO_DATA === 'true' ? [
    { id: 'd1', title: 'HF Cow — High Milk Yield', category: 'cow', breed: 'HF Holstein', age_years: 4, price: 65000, location: 'Coimbatore', state: 'Tamil Nadu', milk_yield_liters: 18, is_vaccinated: true, is_verified: true, is_pregnant: true, is_promoted: false, for_adoption: false, image_url: null, status: 'active', gender: 'female', created_at: new Date().toISOString() },
    { id: 'd2', title: 'Murrah Buffalo — Milk Breed', category: 'buffalo', breed: 'Murrah', age_years: 5, price: 85000, location: 'Amreli', state: 'Gujarat', milk_yield_liters: 14, is_vaccinated: true, is_verified: true, is_pregnant: false, is_promoted: false, for_adoption: false, image_url: null, status: 'active', gender: 'female', created_at: new Date().toISOString() },
    { id: 'd3', title: 'Boer Goat — Meat Breed', category: 'goat', breed: 'Boer', age_years: 2, price: 12000, location: 'Pune', state: 'Maharashtra', milk_yield_liters: null, is_vaccinated: false, is_verified: false, is_pregnant: false, is_promoted: false, for_adoption: false, image_url: null, status: 'active', gender: 'male', created_at: new Date().toISOString() },
    { id: 'd4', title: 'Gir Cow — A2 Milk', category: 'cow', breed: 'Gir', age_years: 3, price: 48000, location: 'Junagadh', state: 'Gujarat', milk_yield_liters: 12, is_vaccinated: true, is_verified: true, is_pregnant: true, is_promoted: false, for_adoption: false, image_url: null, status: 'active', gender: 'female', created_at: new Date().toISOString() },
    { id: 'd5', title: 'Labrador Retriever Puppy', category: 'dog', breed: 'Labrador', age_years: 0.3, price: 15000, location: 'Chennai', state: 'Tamil Nadu', is_vaccinated: true, is_verified: true, is_pregnant: false, is_promoted: false, for_adoption: false, image_url: null, status: 'active', gender: 'male', created_at: new Date().toISOString() },
    { id: 'd6', title: 'Persian Cat — Ready for Adoption', category: 'cat', breed: 'Persian', age_years: 1, price: 8000, location: 'Bengaluru', state: 'Karnataka', is_vaccinated: true, is_verified: false, is_pregnant: false, is_promoted: false, for_adoption: false, image_url: null, status: 'active', gender: 'female', created_at: new Date().toISOString() },
] : [];

export default function HomePage() {
    const { t } = useTranslation();
    const { currentUser, listingType } = useAuth();
    const navigate = useNavigate();

    // ─── State ────────────────────────────────────────────────────────────────
    const [listings, setListings] = useState(() => {
        try {
            const savedType = localStorage.getItem('ks_listing_type') || 'livestock';
            const cached = sessionStorage.getItem(`ks_home_${savedType}_all_all_recent`);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {}
        return [];
    });

    const [loading, setLoading] = useState(() => {
        try {
            const savedType = localStorage.getItem('ks_listing_type') || 'livestock';
            const cached = sessionStorage.getItem(`ks_home_${savedType}_all_all_recent`);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) return false;
            }
        } catch (e) {}
        return true;
    });

    const [activeTab, setActiveTab] = useState('all');
    const [selectedState, setSelectedState] = useState('all');
    const [sortBy, setSortBy] = useState('recent');
    const [filterBy, setFilterBy] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    // ─── Favorites ────────────────────────────────────────────────────────────
    const { likedIds, toggleFavorite } = useFavorites(currentUser?.id);

    // ─── Category tabs ────────────────────────────────────────────────────────
    const LIVESTOCK_CATEGORIES = [
        { id: 'all', emoji: '🎯', label: t('homePage.all') },
        { id: 'cow', emoji: '🐄', label: t('homePage.cows') },
        { id: 'buffalo', emoji: '🦬', label: t('homePage.buffalos') },
        { id: 'goat', emoji: '🐐', label: t('homePage.goats') },
        { id: 'horse', emoji: '🐎', label: t('homePage.horses') },
        { id: 'poultry', emoji: '🐓', label: t('homePage.poultry') },
        { id: 'sheep', emoji: '🐑', label: t('homePage.sheep') },
    ];

    const PET_CATEGORIES = [
        { id: 'all', emoji: '🎯', label: t('homePage.all') },
        { id: 'dog', emoji: '🐕', label: t('homePage.dogs') },
        { id: 'cat', emoji: '🐈', label: t('homePage.cats') },
        { id: 'bird', emoji: '🐦', label: t('homePage.birds') },
        { id: 'fish', emoji: '🐟', label: t('homePage.fish') },
        { id: 'rabbit', emoji: '🐰', label: t('homePage.rabbits') },
        { id: 'other-pet', emoji: '🐾', label: t('homePage.other') },
    ];

    const categories = listingType === 'livestock' ? LIVESTOCK_CATEGORIES : PET_CATEGORIES;

    // ─── Data fetch ───────────────────────────────────────────────────────────
    // KEY FIX: activeTab is now part of the fetch dependencies.
    // Each unique combination of (listingType, activeTab, selectedState, sortBy)
    // gets its own cache entry and its own targeted DB query.
    const fetchListings = useCallback(async (signal) => {
        const cacheKey = `ks_home_${listingType}_${activeTab}_${selectedState}_${sortBy}`;
        const isAllTabDefaultView = activeTab === 'all' && selectedState === 'all' && sortBy === 'recent';

        // 1. Show cached data instantly (no skeleton flash)
        try {
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed && Array.isArray(parsed) && parsed.length > 0) {
                    setListings(parsed);
                    setLoading(false);
                    // Still refresh in background — but skip the loading spinner
                }
            }
        } catch (e) {}

        setLoading(prev => {
            // Only show skeleton if we have no data at all yet
            try {
                const cached = sessionStorage.getItem(cacheKey);
                if (cached) { const p = JSON.parse(cached); if (p?.length > 0) return false; }
            } catch (e) {}
            return true;
        });

        try {
            let fetched = [];

            if (isAllTabDefaultView) {
                // Use pre-fetched module data (started loading before React mounted)
                fetched = await getPrefetchedListings(listingType);
                if (signal?.aborted) return;
            } else {
                // All other cases: precise targeted query
                let query = supabase.from('listings')
                    .select(SELECTED_COLS)
                    .eq('status', 'active');

                if (activeTab !== 'all') {
                    // Specific category tab: filter by that exact category
                    query = query.eq('category', activeTab);
                } else {
                    // "All" tab: filter by livestock vs pet type
                    if (listingType === 'livestock') query = query.in('category', LIVESTOCK_IDS);
                    else query = query.in('category', PET_IDS);
                }

                if (selectedState !== 'all') query = query.eq('state', selectedState);

                if (sortBy === 'recent') query = query.order('created_at', { ascending: false });
                else if (sortBy === 'price_low') query = query.order('price', { ascending: true });
                else if (sortBy === 'price_high') query = query.order('price', { ascending: false });

                query = query.limit(1000);

                const { data, error } = await query;
                if (signal?.aborted) return;
                if (error) throw error;
                fetched = data || [];
            }

            if (fetched.length === 0) {
                const fallback = listingType === 'livestock'
                    ? DEMO_LISTINGS.filter(l => !PET_IDS.includes(l.category))
                    : DEMO_LISTINGS.filter(l => PET_IDS.includes(l.category));
                setListings(fallback);
                try { sessionStorage.setItem(cacheKey, JSON.stringify(fallback)); } catch (e) {}
            } else {
                setListings(fetched);
                try { sessionStorage.setItem(cacheKey, JSON.stringify(fetched)); } catch (e) {}
            }
        } catch (err) {
            if (signal?.aborted) return;
            console.error('Fetch error:', err);
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listingType, activeTab, selectedState, sortBy]);

    useEffect(() => {
        setFilterBy('all');
        setVisibleCount(PAGE_SIZE);
        const controller = new AbortController();
        fetchListings(controller.signal);
        return () => controller.abort();
    }, [fetchListings]);

    // ─── Client-side filters (applied on top of the already-targeted DB result) 
    const filteredListings = useMemo(() => {
        let result = [...listings];
        // NOTE: No category filter needed here — the DB query already scoped by activeTab
        if (filterBy === 'verified') result = result.filter(l => l.is_verified);
        else if (filterBy === 'with_images') result = result.filter(l => l.image_url);
        else if (filterBy === 'high_yield') result = result.filter(l => l.milk_yield_liters > 10);
        else if (filterBy === 'pregnant') result = result.filter(l => l.is_pregnant);
        else if (filterBy === 'vaccinated') result = result.filter(l => l.is_vaccinated);
        else if (filterBy === 'young') result = result.filter(l => l.age_years && l.age_years <= 1);
        else if (filterBy === 'male') result = result.filter(l => l.gender && l.gender.toLowerCase() === 'male');
        else if (filterBy === 'female') result = result.filter(l => l.gender && l.gender.toLowerCase() === 'female');
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(l =>
                (l.title || '').toLowerCase().includes(q) ||
                (l.breed || '').toLowerCase().includes(q) ||
                (l.location || '').toLowerCase().includes(q)
            );
        }
        return result;
    }, [listings, filterBy, searchQuery]);

    // ─── Pagination ───────────────────────────────────────────────────────────
    const visibleListings = useMemo(
        () => filteredListings.slice(0, visibleCount),
        [filteredListings, visibleCount]
    );

    const hasMore = visibleCount < filteredListings.length;

    function handleLoadMore() {
        setVisibleCount(prev => prev + PAGE_SIZE);
    }

    function handleSearchKeyDown(e) {
        if (e.key === 'Enter' && searchQuery.trim())
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="home-layout">
            <SEOHead
                title="Buy & Sell Cattle in India | Kosalai"
                description="India's trusted marketplace for cows, buffaloes, goats, horses and pets."
            />
            <div className="home-container">
                {/* SEARCH + STATE FILTER ROW */}
                <div className="hp-top-row">
                    <div className="hp-search-box">
                        <select
                            value={selectedState}
                            onChange={e => setSelectedState(e.target.value)}
                            className="hp-state-select-inline"
                        >
                            <option value="all">{t('homePage.allStates')}</option>
                            {INDIAN_STATES.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <div className="hp-search-divider"></div>
                        <span style={{ fontSize: 18, flexShrink: 0 }}>🔍</span>
                        <input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            placeholder={listingType === 'livestock'
                                ? t('homePage.searchCowPlaceholder')
                                : t('homePage.searchPetPlaceholder')}
                            className="hp-search-input"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="hp-search-clear">✕</button>
                        )}
                    </div>
                </div>

                {/* CATEGORY TABS */}
                <div className="hp-category-tabs">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            className={`hp-cat-tab${activeTab === cat.id ? ' active' : ''}`}
                            onClick={() => setActiveTab(cat.id)}
                        >
                            <span>{cat.emoji}</span>
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>

                {/* SORT / FILTER CONTROL BAR */}
                <div className="hp-controls-bar">
                    <div className="hp-sort-group">
                        <span className="hp-sort-label">{t('homePage.filterLabel')}</span>
                        <select value={filterBy} onChange={e => setFilterBy(e.target.value)} className="hp-sort-select">
                            <option value="all">{t('homePage.allListings')}</option>
                            <option value="verified">{t('homePage.verifiedOnly')}</option>
                            <option value="with_images">{t('homePage.withPhotos')}</option>
                            <option value="male">{t('homePage.male')}</option>
                            <option value="female">{t('homePage.female')}</option>
                            {listingType === 'livestock' ? (
                                <>
                                    <option value="high_yield">{t('homePage.highMilkYield')}</option>
                                    <option value="pregnant">{t('homePage.pregnantOnly')}</option>
                                </>
                            ) : (
                                <>
                                    <option value="vaccinated">{t('homePage.vaccinatedOnly')}</option>
                                    <option value="young">{t('homePage.youngPets')}</option>
                                </>
                            )}
                        </select>
                    </div>
                    <div className="hp-sort-group">
                        <span className="hp-sort-label">{t('homePage.sortLabel')}</span>
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="hp-sort-select">
                            <option value="recent">{t('homePage.recentlyAdded')}</option>
                            <option value="price_low">{t('homePage.priceLow')}</option>
                            <option value="price_high">{t('homePage.priceHigh')}</option>
                        </select>
                    </div>
                    {!loading && (
                        <span className="hp-result-count">
                            {filteredListings.length} listing{filteredListings.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {/* LISTINGS GRID */}
                {loading ? (
                    <div className="hp-grid">
                        {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : filteredListings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9CA3AF' }}>
                        <div style={{ fontSize: 60, marginBottom: 16 }}>
                            {listingType === 'livestock' ? '🐄' : '🐾'}
                        </div>
                        <h3 style={{ color: '#374151' }}>{t('homePage.noListingsFound')}</h3>
                        <p style={{ fontSize: 14 }}>{t('homePage.tryDifferent')}</p>
                    </div>
                ) : (
                    <>
                        <div className="hp-grid">
                            {visibleListings.map(listing => (
                                <ListingCard
                                    key={listing.id}
                                    listing={listing}
                                    isLiked={likedIds.has(listing.id)}
                                    onToggleFavorite={toggleFavorite}
                                />
                            ))}
                        </div>

                        {hasMore && (
                            <div className="hp-load-more-wrap">
                                <button className="hp-load-more-btn" onClick={handleLoadMore}>
                                    Load More
                                    <span className="hp-load-more-count">
                                        ({filteredListings.length - visibleCount} more)
                                    </span>
                                </button>
                            </div>
                        )}

                        {!hasMore && filteredListings.length > PAGE_SIZE && (
                            <div className="hp-end-of-results">
                                ✅ All {filteredListings.length} listings shown
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
