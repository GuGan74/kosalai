import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';
import BackButton from '../components/BackButton';
import toast from 'react-hot-toast';
import './MyListingsPage.css';

const DEMO = [
    { id: 'd1', title: 'HF Cow — High Milk Yield', category: 'cow', breed: 'HF Holstein', age_years: 4, price: 65000, location: 'Coimbatore', state: 'Tamil Nadu', milk_yield_liters: 18, is_vaccinated: true, is_verified: true, is_pregnant: true, is_promoted: true, for_adoption: false, image_url: null, status: 'active', created_at: new Date().toISOString() },
    { id: 'd2', title: 'Gir Heifer Cow', category: 'cow', breed: 'Gir', age_years: 3, price: 48000, location: 'Amreli', state: 'Gujarat', milk_yield_liters: 12, is_vaccinated: true, is_verified: true, is_pregnant: false, is_promoted: false, for_adoption: false, image_url: null, status: 'pending', created_at: new Date().toISOString() },
];

export default function MyListingsPage() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('active');
    const [error, setError] = useState(null);

    async function markSold(id) {
        if (!window.confirm('Mark this listing as sold?')) return;
        await supabase.from('listings').update({ status: 'sold' }).eq('id', id);
        setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'sold' } : l));
        toast.success('Marked as sold! 🎉');
    }

    async function deleteListing(id) {
        if (!window.confirm('Delete this listing permanently? This cannot be undone.')) return;
        
        console.log('DELETE PARAM', id);
        console.log('DELETE PARAM TYPE', typeof id);
        
        try {
            const { data, error, status, statusText } = await supabase.from('listings').delete().eq('id', id).select();
            
            console.log({ data, error, status, statusText });
            
            if (error) throw error;
            
            if (!data || data.length === 0) {
                throw new Error('Deletion blocked by database security policy or listing not found.');
            }

            setListings(prev => prev.filter(l => l.id !== id));
            toast.success('Listing deleted');
        } catch (err) {
            console.error('Delete error:', err);
            toast.error(err.message || 'Failed to delete listing. Please try again.');
        }
    }

    async function relistListing(id) {
        await supabase.from('listings').update({ status: 'active' }).eq('id', id);
        setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'active' } : l));
        toast.success('Listing relisted! ✓');
    }

    const fetchMyListings = React.useCallback(async () => {
        if (!currentUser?.id) {
            setListings([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const { data, error: fetchErr } = await supabase
                .from('listings')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false });
            if (fetchErr) throw fetchErr;
            setListings(data ?? []);
            setError(null);
        } catch (err) {
            console.error('Error fetching listings:', err);
            setError('Failed to load your listings. Please try again.');
            setListings([]);
        } finally {
            setLoading(false);
        }
    }, [currentUser?.id]);

    useEffect(() => {
        fetchMyListings();
    }, [fetchMyListings]);

    const filtered = listings.filter(l => l.status === tab);

    return (
        <div className="myl-wrap">
            <BackButton fallbackPath="/" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 22, fontWeight: 900 }}>📋 {t('myListingsPage.title')}</h2>
                <button className="btn-primary" onClick={() => navigate('/sell')}>+ Create a New Listing</button>
            </div>
            {error && (
                <div style={{ background: '#ffebee', color: '#c62828', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                    {error}
                </div>
            )}

            <div className="myl-tabs">
                {[['active', t('myListingsPage.active'), 'green'], ['sold', t('myListingsPage.sold'), '']].map(([id, label, color]) => {
                    const count = listings.filter(l => l.status === id).length;
                    return (
                        <button key={id} className={`myl-tab${tab === id ? ' act' : ''}${color === 'orange' ? ' or' : ''}`} onClick={() => setTab(id)}>
                            {label}
                            {count > 0 && <span className={`tbdg${color === 'orange' ? ' or' : ''}`}>{count}</span>}
                        </button>
                    );
                })}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner dark" style={{ margin: '0 auto' }} /></div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--g3)' }}>
                    <div style={{ fontSize: 60 }}>📋</div>
                    <h3 style={{ marginTop: 12, color: 'var(--g1)' }}>{t('myListingsPage.noListings')}</h3>
                    {tab === 'active' && <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/sell')}>{t('myListingsPage.postFirst')}</button>}
                </div>
            ) : (
                <div className="myl-grid">
                    {filtered.map(l => (
                        <div key={l.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 14px', marginBottom: -4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 12, color: 'var(--g3)', fontWeight: 600 }}>Listing ID</span>
                                <span style={{ fontSize: 14, color: 'var(--blue)', fontWeight: 800 }}>{l.listing_code || 'N/A'}</span>
                            </div>
                            <ListingCard listing={l} />
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                {l.status === 'active' && (
                                    <>
                                        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12, borderRadius: 20 }} onClick={() => navigate('/sell', { state: { editListing: l } })}>✏️ {t('myListingsPage.edit')}</button>
                                        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12, borderRadius: 20, color: 'var(--green)', borderColor: 'var(--green)' }} onClick={() => markSold(l.id)}>✅ {t('myListingsPage.markSold')}</button>
                                        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12, borderRadius: 20, color: 'var(--red)', borderColor: 'var(--red)' }} onClick={() => { console.log('DELETE CLICK VALUE', l.id); deleteListing(l.id); }}>🗑️ {t('myListingsPage.delete')}</button>
                                    </>
                                )}
                                {l.status === 'pending' && (
                                    <>
                                        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12, borderRadius: 20 }} onClick={() => navigate('/sell', { state: { editListing: l } })}>✏️ Edit</button>
                                        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12, borderRadius: 20, color: 'var(--red)', borderColor: 'var(--red)' }} onClick={() => { console.log('DELETE CLICK VALUE', l.id); deleteListing(l.id); }}>🗑️ Delete</button>
                                    </>
                                )}
                                {l.status === 'sold' && (
                                    <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12, borderRadius: 20, color: 'var(--blue)', borderColor: 'var(--blue)' }} onClick={() => relistListing(l.id)}>🔄 Relist</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
