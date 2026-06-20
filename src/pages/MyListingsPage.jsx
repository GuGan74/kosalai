import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';
import BackButton from '../components/BackButton';
import toast from 'react-hot-toast';
import './MyListingsPage.css';

const REPORT_CATEGORIES = [
    'Listing not showing correctly',
    'Wrong category or details',
    'Image upload issue',
    'Price display problem',
    'Buyer harassment',
    'Duplicate listing',
    'Other',
];

export default function MyListingsPage() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('active');
    const [error, setError] = useState(null);

    // Seller Report Modal state
    const [reportModal, setReportModal] = useState(null); // listing object or null
    const [reportCategory, setReportCategory] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [submittingReport, setSubmittingReport] = useState(false);

    async function markSold(id) {
        if (!window.confirm('Mark this listing as sold?')) return;
        await supabase.from('listings').update({ status: 'sold' }).eq('id', id);
        setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'sold' } : l));
        toast.success('Marked as sold! 🎉');
    }

    async function deleteListing(id) {
        if (!window.confirm('Delete this listing permanently? This cannot be undone.')) return;
        try {
            const { data, error } = await supabase.from('listings').delete().eq('id', id).select();
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

    async function submitSellerReport() {
        if (!reportCategory) { toast.error('Please select an issue category'); return; }
        if (!reportDescription.trim()) { toast.error('Please describe the issue'); return; }
        setSubmittingReport(true);
        try {
            const { error } = await supabase.from('reports').insert({
                listing_id: reportModal.id,
                reporter_id: currentUser.id,
                reason: `[${reportCategory}] ${reportDescription.trim()}`,
                report_type: 'seller',
                status: 'pending',
            });
            if (error) throw error;
            toast.success('Report submitted! Our team will review it shortly. ✅');
            setReportModal(null);
            setReportCategory('');
            setReportDescription('');
        } catch (err) {
            console.error('Seller report error:', err);
            toast.error('Failed to submit report. Please try again.');
        } finally {
            setSubmittingReport(false);
        }
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
            setError(`Supabase Error: ${err.message || JSON.stringify(err)}`);
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
                        <div key={l.id} style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 14px', marginBottom: -4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 12, color: 'var(--g3)', fontWeight: 600 }}>Listing ID</span>
                                <span style={{ fontSize: 14, color: 'var(--blue)', fontWeight: 800 }}>{l.listing_code || 'N/A'}</span>
                            </div>
                            <ListingCard listing={l} />
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                                {l.status === 'active' && (
                                    <>
                                        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12, borderRadius: 20 }} onClick={() => navigate('/sell', { state: { editListing: l } })}>✏️ {t('myListingsPage.edit')}</button>
                                        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12, borderRadius: 20, color: 'var(--green)', borderColor: 'var(--green)' }} onClick={() => markSold(l.id)}>✅ {t('myListingsPage.markSold')}</button>
                                        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12, borderRadius: 20, color: 'var(--red)', borderColor: 'var(--red)' }} onClick={() => deleteListing(l.id)}>🗑️ {t('myListingsPage.delete')}</button>
                                        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12, borderRadius: 20, color: '#8b5cf6', borderColor: '#8b5cf6' }} onClick={() => setReportModal(l)}>⚠️ Report Issue</button>
                                    </>
                                )}
                                {l.status === 'pending' && (
                                    <>
                                        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12, borderRadius: 20 }} onClick={() => navigate('/sell', { state: { editListing: l } })}>✏️ Edit</button>
                                        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12, borderRadius: 20, color: 'var(--red)', borderColor: 'var(--red)' }} onClick={() => deleteListing(l.id)}>🗑️ Delete</button>
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

            {/* ── SELLER REPORT MODAL ──────────────────────────── */}
            {reportModal && (
                <>
                    <div
                        onClick={() => { setReportModal(null); setReportCategory(''); setReportDescription(''); }}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.5)', zIndex: 999,
                            backdropFilter: 'blur(4px)',
                        }}
                    />
                    <div style={{
                        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        background: 'white', borderRadius: 20, padding: '28px 24px', width: '90%', maxWidth: 440,
                        zIndex: 1000, boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 18, margin: 0 }}>⚠️ Report Issue</h3>
                            <button onClick={() => { setReportModal(null); setReportCategory(''); setReportDescription(''); }}
                                style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--g3)' }}>✕</button>
                        </div>

                        {/* Listing reference */}
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 14px', marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: 11, color: 'var(--g3)', fontWeight: 600 }}>Listing</div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--g1)' }}>{reportModal.title}</div>
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 800 }}>{reportModal.listing_code || 'N/A'}</div>
                        </div>

                        {/* Issue Category */}
                        <div style={{ marginBottom: 14 }}>
                            <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--g3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Issue Category <span style={{ color: 'var(--red)' }}>*</span>
                            </label>
                            <select
                                value={reportCategory}
                                onChange={e => setReportCategory(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--g5)', outline: 'none', fontSize: 14, marginTop: 6, background: 'white' }}
                            >
                                <option value="">Select category...</option>
                                {REPORT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {/* Description */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--g3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Description <span style={{ color: 'var(--red)' }}>*</span>
                            </label>
                            <textarea
                                value={reportDescription}
                                onChange={e => setReportDescription(e.target.value)}
                                placeholder="Describe the issue in detail..."
                                rows={4}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--g5)', outline: 'none', fontSize: 14, marginTop: 6, resize: 'vertical', fontFamily: 'Nunito, sans-serif' }}
                            />
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button
                                onClick={() => { setReportModal(null); setReportCategory(''); setReportDescription(''); }}
                                style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid var(--g5)', background: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'Nunito, sans-serif' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitSellerReport}
                                disabled={submittingReport}
                                style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: '#8b5cf6', color: 'white', fontWeight: 800, cursor: 'pointer', fontSize: 14, fontFamily: 'Poppins, sans-serif', opacity: submittingReport ? 0.7 : 1 }}
                            >
                                {submittingReport ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
