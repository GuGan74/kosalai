import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';
import BackButton from '../components/BackButton';
import SEOHead from '../components/SEOHead';
import './SearchPage.css';

const CATTLE_PILLS = [
    { label: '🐄', key: 'cow', cat: 'cow' },
    { label: '🦬', key: 'buffalo', cat: 'buffalo' },
    { label: '🐐', key: 'goat', cat: 'goat' },
    { label: '🐑', key: 'sheep', cat: 'sheep' },
    { label: '🐔', key: 'poultry', cat: 'poultry' },
];

const PETS_PILLS = [
    { label: '🐕', key: 'dog', cat: 'dog' },
    { label: '🐈', key: 'cat', cat: 'cat' },
    { label: '🦜', key: 'bird', cat: 'bird' },
    { label: '🐇', key: 'rabbit', cat: 'rabbit' },
    { label: '🐟', key: 'fish', cat: 'fish' },
];

const COMMON_PILLS = [
    { label: '💉', key: 'vaccinated', prop: 'vaccinated' },
    { label: '✅', key: 'verified', prop: 'verified' },
];

const LIVESTOCK_IDS = ['cow', 'buffalo', 'goat', 'sheep', 'horse', 'poultry', 'other'];
const PET_IDS = ['dog', 'cat', 'bird', 'fish', 'rabbit', 'other-pet'];

const DEMO_DATA = [
    { id: 'd1', title: 'HF Cow — High Milk Yield', category: 'cow', breed: 'HF Holstein', age_years: 4, price: 65000, location: 'Coimbatore', state: 'Tamil Nadu', milk_yield_liters: 18, is_vaccinated: true, is_verified: true, is_pregnant: true, is_promoted: true, for_adoption: false, image_url: null },
    { id: 'd3', title: 'Murrah Buffalo — Top Dairy', category: 'buffalo', breed: 'Murrah', age_years: 5, price: 120000, location: 'Karnal', state: 'Haryana', milk_yield_liters: 35, is_vaccinated: true, is_verified: true, is_pregnant: false, is_promoted: false, for_adoption: false, image_url: null },
    { id: 'd4', title: 'Boer Goat Pair', category: 'goat', breed: 'Boer', age_years: 2, price: 18000, location: 'Hyderabad', state: 'Telangana', milk_yield_liters: null, is_vaccinated: true, is_verified: true, is_pregnant: false, is_promoted: false, for_adoption: false, image_url: null },
    { id: 'd6', title: 'Labrador Puppy', category: 'dog', breed: 'Labrador', age_years: 0, price: 20000, location: 'Bengaluru', state: 'Karnataka', milk_yield_liters: null, is_vaccinated: true, is_verified: false, is_pregnant: false, is_promoted: false, for_adoption: false, image_url: null },
];

export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();
    const { listingType } = useAuth();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [results, setResults] = useState([]);
    const [activePills, setActivePills] = useState([]);
    const [loading, setLoading] = useState(false);

    // Clear active pills when listingType changes
    useEffect(() => {
        setActivePills([]);
    }, [listingType]);

    const activePillsList = listingType === 'livestock' ? [...CATTLE_PILLS, ...COMMON_PILLS] : [...PETS_PILLS, ...COMMON_PILLS];
    const allowedCats = listingType === 'livestock' ? LIVESTOCK_IDS : PET_IDS;

    const doSearch = React.useCallback(async () => {
        setLoading(true);
        try {
            let q = supabase.from('listings').select('*').eq('status', 'active');
            if (query) q = q.ilike('title', `%${query}%`);
            
            const activeCats = activePills.filter(p => p.cat).map(p => p.cat);
            const finalCats = activeCats.length > 0 ? activeCats.filter(c => allowedCats.includes(c)) : allowedCats;

            if (finalCats.length === 1) {
                q = q.eq('category', finalCats[0]);
            } else if (finalCats.length > 1) {
                q = q.in('category', finalCats);
            } else {
                q = q.in('category', allowedCats);
            }

            activePills.forEach(p => {
                if (p.prop === 'vaccinated') q = q.eq('is_vaccinated', true);
                if (p.prop === 'verified') q = q.eq('is_verified', true);
            });
            const { data } = await q.order('created_at', { ascending: false }).limit(40);
            
            const fallbackFilter = (d) => {
                if (!allowedCats.includes(d.category)) return false;
                if (query && !d.title.toLowerCase().includes(query.toLowerCase())) return false;
                return true;
            };

            let filtered = data && data.length > 0 ? data : DEMO_DATA.filter(fallbackFilter);
            setResults(filtered);
        } catch {
            const fallbackFilter = (d) => {
                if (!allowedCats.includes(d.category)) return false;
                if (query && !d.title.toLowerCase().includes(query.toLowerCase())) return false;
                return true;
            };
            let fallback = DEMO_DATA.filter(fallbackFilter);
            setResults(fallback);
        } finally {
            setLoading(false);
        }
    }, [query, activePills, allowedCats]);

    useEffect(() => {
        doSearch();
    }, [doSearch]);

    function togglePill(pill) {
        setActivePills(prev =>
            prev.find(p => JSON.stringify(p) === JSON.stringify(pill))
                ? prev.filter(p => JSON.stringify(p) !== JSON.stringify(pill))
                : [...prev, pill]
        );
    }

    return (
        <div className="search-page">
            <SEOHead
                title={query ? t('searchPage.seoTitleQuery', { query }) : t('searchPage.seoTitle')}
                description={t('searchPage.seoDescription')}
                url="https://kosalai.in/search"
            />
            <div className="search-bar-top">
                <BackButton fallbackPath="/" className="" />
                <div className="search-inp-wrap">
                    <span>🔍</span>
                    <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder={t('searchPage.searchPlaceholder')}
                        autoFocus
                    />
                    {query && <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--g3)', fontSize: 16 }}>✕</button>}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', margin: '0 16px 10px' }}>
                <div className="filter-pills" style={{ flex: 1 }}>
                    {activePillsList.map(p => (
                        <button
                            key={JSON.stringify(p)}
                            className={`fpill${activePills.find(a => JSON.stringify(a) === JSON.stringify(p)) ? ' act' : ''}`}
                            onClick={() => togglePill(p)}
                        >
                            {p.label} {t(`searchPage.${p.key}`)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="search-results">
                <div style={{ fontSize: 13, color: 'var(--g3)', fontWeight: 600, marginBottom: 12 }}>
                    {loading ? t('searchPage.searching') : results.length === 1 ? t('searchPage.resultsFound', { count: results.length }) : t('searchPage.resultsFoundPlural', { count: results.length })}
                </div>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner dark" style={{ margin: '0 auto' }} /></div>
                ) : results.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60, color: 'var(--g3)' }}>
                        <div style={{ fontSize: 60 }}>🔍</div>
                        <h3 style={{ marginTop: 12, color: 'var(--g1)' }}>{t('searchPage.noResults')}</h3>
                        <p>{t('searchPage.tryDifferent')}</p>
                    </div>
                ) : (
                    <div className="search-cards-grid">
                        {results.map(l => <ListingCard key={l.id} listing={l} />)}
                    </div>
                )}
            </div>
        </div>
    );
}
