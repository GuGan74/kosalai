import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AdminPage.css';

const ADMIN_EMAIL = 'mail.kosalai@gmail.com';

export default function AdminPage() {
    const navigate = useNavigate();
    const { currentProfile, isLoggedIn, loading: authLoading, signOut } = useAuth();

    // Dashboard state
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({ users: 0, listings: 0, active: 0, sold: 0, buyerReports: 0, sellerReports: 0 });
    const [listings, setListings] = useState([]);
    const [users, setUsers] = useState([]);
    const [buyerReports, setBuyerReports] = useState([]);
    const [sellerReports, setSellerReports] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [reportFilter, setReportFilter] = useState('all'); // all, pending, resolved

    // Double-layer admin check: role + email
    const isAdmin = currentProfile?.role === 'admin' && currentProfile?.email === ADMIN_EMAIL;

    useEffect(() => {
        if (isAdmin) fetchDashboardData();
    }, [isAdmin]);

    // Redirect: not logged in at all → home; logged in but not admin → home
    if (!authLoading && (!isLoggedIn || !isAdmin)) {
        return <Navigate to="/" />;
    }

    async function handleLogout() {
        await signOut();
    }

    async function fetchDashboardData() {
        setLoadingData(true);
        try {
            // Fetch listings
            const { data: lData, count: lCount } = await supabase
                .from('listings')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .limit(100);

            // Fetch profiles
            const { data: pData, count: pCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .limit(100);

            const activeCount = (lData || []).filter(l => l.status === 'active').length;
            const soldCount = (lData || []).filter(l => l.status === 'sold').length;

            // Fetch buyer reports
            const { data: brData } = await supabase
                .from('reports')
                .select('*, listings(*)')
                .eq('report_type', 'buyer')
                .order('created_at', { ascending: false });

            // Fetch seller reports (join with listing + reporter profile)
            const { data: srData } = await supabase
                .from('reports')
                .select('*, listings(*)')
                .eq('report_type', 'seller')
                .order('created_at', { ascending: false });

            setStats({
                users: pCount || (pData?.length ?? 0),
                listings: lCount || (lData?.length ?? 0),
                active: activeCount,
                sold: soldCount,
                buyerReports: (brData || []).filter(r => r.status === 'pending').length,
                sellerReports: (srData || []).filter(r => r.status === 'pending').length
            });
            setListings(lData || []);
            setUsers(pData || []);
            setBuyerReports(brData || []);
            setSellerReports(srData || []);
        } catch (e) {
            toast.error('Failed to load DB data: ' + e.message);
        } finally {
            setLoadingData(false);
        }
    }

    async function removeListing(id) {
        if (!window.confirm('Permanently delete this listing?')) return;
        const { error } = await supabase.from('listings').delete().eq('id', id);
        if (error) { toast.error('Failed to remove: ' + error.message); return; }
        setListings(prev => prev.filter(l => l.id !== id));
        toast.success('Listing removed ✓');
    }

    async function hideListing(id) {
        const { error } = await supabase.from('listings').update({ status: 'hidden' }).eq('id', id);
        if (error) { toast.error('Failed to hide: ' + error.message); return; }
        setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'hidden' } : l));
        toast.success('Listing hidden from public ✓');
    }

    async function unhideListing(id) {
        const { error } = await supabase.from('listings').update({ status: 'active' }).eq('id', id);
        if (error) { toast.error('Failed to unhide: ' + error.message); return; }
        setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'active' } : l));
        toast.success('Listing restored to active ✓');
    }

    async function toggleStatus(id, current) {
        const newStatus = current === 'active' ? 'hidden' : 'active';
        const { error } = await supabase.from('listings').update({ status: newStatus }).eq('id', id);
        if (error) { toast.error('Update failed'); return; }
        setListings(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
        toast.success(`Status → ${newStatus}`);
    }

    async function resolveReport(reportId, action, listingId, reportType) {
        if (action === 'remove') {
            await supabase.from('listings').delete().eq('id', listingId);
            toast.success('Listing removed & Report resolved');
            setListings(prev => prev.filter(l => l.id !== listingId));
        } else {
            toast.success('Report resolved');
        }
        await supabase.from('reports').update({ status: 'resolved' }).eq('id', reportId);
        if (reportType === 'seller') {
            setSellerReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'resolved' } : r));
            setStats(s => ({ ...s, sellerReports: s.sellerReports - 1 }));
        } else {
            setBuyerReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'resolved' } : r));
            setStats(s => ({ ...s, buyerReports: s.buyerReports - 1 }));
        }
    }

    // Filter reports
    function filterReports(reports) {
        if (reportFilter === 'all') return reports;
        return reports.filter(r => r.status === reportFilter);
    }

    // ─── DASHBOARD ───────────────────────────────────────
    const statCards = [
        { label: 'Total Users', val: stats.users, icon: '👥', color: 'var(--blue)' },
        { label: 'Total Listings', val: stats.listings, icon: '📋', color: 'var(--green)' },
        { label: 'Active Listings', val: stats.active, icon: '✅', color: 'var(--green)' },
        { label: 'Sold Listings', val: stats.sold, icon: '🏷️', color: 'var(--orange, #f59e0b)' },
        { label: 'Buyer Reports', val: stats.buyerReports, icon: '🚩', color: 'var(--red)' },
        { label: 'Seller Reports', val: stats.sellerReports, icon: '📨', color: 'var(--purple, #8b5cf6)' },
    ];

    return (
        <div className="admin-page">
            <div className="adm-top">
                <div>
                    <div className="adm-brand">Kosalai Admin Panel</div>
                    <div className="adm-title">🛡️ Admin Dashboard</div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <button
                        onClick={fetchDashboardData}
                        style={{ padding: '8px 16px', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 8, color: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
                    >
                        🔄 Refresh
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        style={{ padding: '8px 16px', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8, color: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
                    >
                        ← Back
                    </button>
                    <button
                        onClick={handleLogout}
                        style={{ padding: '8px 16px', background: 'rgba(220,38,38,.25)', border: '1px solid rgba(220,38,38,.4)', borderRadius: 8, color: '#f87171', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
                    >
                        🚪 Logout
                    </button>
                    <div className="adm-av">AD</div>
                </div>
            </div>

            <div className="adm-tabs">
                {['overview', 'listings', 'users', 'buyer-reports', 'seller-reports'].map(t => (
                    <button key={t} className={`adm-tab${activeTab === t ? ' act' : ''}`} onClick={() => setActiveTab(t)}>
                        {t === 'overview' ? '📊 Overview' : t === 'listings' ? '📋 Listings' : t === 'users' ? '👥 Users' : t === 'buyer-reports' ? '🚩 Buyer Reports' : '📨 Seller Reports'}
                        {t === 'buyer-reports' && stats.buyerReports > 0 && <span style={{ marginLeft: 6, background: 'var(--red)', color: 'white', borderRadius: 10, padding: '2px 7px', fontSize: 10, fontWeight: 800 }}>{stats.buyerReports}</span>}
                        {t === 'seller-reports' && stats.sellerReports > 0 && <span style={{ marginLeft: 6, background: 'var(--purple, #8b5cf6)', color: 'white', borderRadius: 10, padding: '2px 7px', fontSize: 10, fontWeight: 800 }}>{stats.sellerReports}</span>}
                    </button>
                ))}
            </div>

            <div className="adm-body">
                {loadingData && (
                    <div className="adm-loading">
                        <div className="spinner" style={{ borderTopColor: 'var(--green)', width: 28, height: 28 }} />
                        <span>Loading live data…</span>
                    </div>
                )}

                {/* OVERVIEW */}
                {activeTab === 'overview' && !loadingData && (
                    <div className="animate-fadeIn">
                        <div className="adm-stats-grid">
                            {statCards.map(s => (
                                <div key={s.label} className="adm-stat-card">
                                    <div className="adm-stat-icon" style={{ background: s.color + '22', color: s.color }}>{s.icon}</div>
                                    <div className="adm-stat-val">{s.val}</div>
                                    <div className="adm-stat-lbl">{s.label}</div>
                                </div>
                            ))}
                        </div>
                        <div className="adm-section">
                            <h3 className="adm-sec-title">Recent Listings (Live from Database)</h3>
                            {listings.length === 0 ? (
                                <div style={{ color: 'rgba(255,255,255,.4)', textAlign: 'center', padding: 40 }}>No listings in database yet</div>
                            ) : (
                                <div className="adm-table-wrap">
                                    <table className="adm-table">
                                        <thead><tr><th>Code</th><th>Title</th><th>Category</th><th>Price</th><th>Location</th><th>Status</th><th>Date</th></tr></thead>
                                        <tbody>
                                            {listings.slice(0, 10).map(l => (
                                                <tr key={l.id}>
                                                    <td style={{ color: 'var(--blue)', fontWeight: 800, fontSize: 11 }}>{l.listing_code || '—'}</td>
                                                    <td style={{ color: 'rgba(255,255,255,.85)', fontWeight: 700 }}>{l.title || '—'}</td>
                                                    <td style={{ textTransform: 'capitalize' }}>{l.category || '—'}</td>
                                                    <td>{l.for_adoption ? 'Free' : l.price ? `₹${Number(l.price).toLocaleString('en-IN')}` : '—'}</td>
                                                    <td>{l.location || l.city || '—'}</td>
                                                    <td><span className={`adm-status ${l.status}`}>{l.status}</span></td>
                                                    <td>{new Date(l.created_at).toLocaleDateString('en-IN')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* LISTINGS */}
                {activeTab === 'listings' && !loadingData && (
                    <div className="animate-fadeIn">
                        <div className="adm-section">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                                <h3 className="adm-sec-title" style={{ marginBottom: 0 }}>All Listings — {listings.length} total</h3>
                                <button className="adm-primary-btn" onClick={() => navigate('/sell')}>+ Add Listing</button>
                            </div>
                            {listings.length === 0 ? (
                                <div style={{ color: 'rgba(255,255,255,.4)', textAlign: 'center', padding: 60 }}>
                                    <div style={{ fontSize: 60 }}>📋</div>
                                    <div style={{ marginTop: 12 }}>No listings in database yet</div>
                                </div>
                            ) : (
                                <div className="adm-table-wrap">
                                    <table className="adm-table">
                                        <thead><tr><th>Code</th><th>Title</th><th>Category</th><th>Price</th><th>Location</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {listings.map(l => (
                                                <tr key={l.id}>
                                                    <td style={{ color: 'var(--blue)', fontWeight: 800, fontSize: 11 }}>{l.listing_code || '—'}</td>
                                                    <td style={{ color: 'rgba(255,255,255,.85)', fontWeight: 700 }}>{l.title || '—'}</td>
                                                    <td style={{ textTransform: 'capitalize' }}>{l.category || '—'}</td>
                                                    <td>{l.for_adoption ? '💜 Free' : l.price ? `₹${Number(l.price).toLocaleString('en-IN')}` : '—'}</td>
                                                    <td>{l.location || '—'}</td>
                                                    <td>
                                                        <span className={`adm-status ${l.status}`}>{l.status}</span>
                                                    </td>
                                                    <td>{new Date(l.created_at).toLocaleDateString('en-IN')}</td>
                                                    <td>
                                                        <button className="adm-act-btn" onClick={() => navigate(`/listing/${l.listing_code || l.id}`)}>View</button>
                                                        {l.status === 'active' && (
                                                            <button className="adm-act-btn" style={{ color: '#f59e0b', borderColor: '#f59e0b' }} onClick={() => hideListing(l.id)}>Hide</button>
                                                        )}
                                                        {l.status === 'hidden' && (
                                                            <button className="adm-act-btn" style={{ color: 'var(--green)', borderColor: 'var(--green)' }} onClick={() => unhideListing(l.id)}>Unhide</button>
                                                        )}
                                                        <button className="adm-act-btn danger" onClick={() => removeListing(l.id)}>Remove</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* USERS */}
                {activeTab === 'users' && !loadingData && (
                    <div className="animate-fadeIn">
                        <div className="adm-section">
                            <h3 className="adm-sec-title">Registered Users — {users.length} total</h3>
                            {users.length === 0 ? (
                                <div style={{ color: 'rgba(255,255,255,.4)', textAlign: 'center', padding: 60 }}>
                                    <div style={{ fontSize: 60 }}>👥</div>
                                    <div style={{ marginTop: 12 }}>No users in database yet</div>
                                </div>
                            ) : (
                                <div className="adm-table-wrap">
                                    <table className="adm-table">
                                        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Location</th><th>Joined</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {users.map(u => (
                                                <tr key={u.id}>
                                                    <td style={{ color: 'rgba(255,255,255,.85)', fontWeight: 700 }}>{u.full_name || '—'}</td>
                                                    <td style={{ fontSize: 11 }}>{u.email || '—'}</td>
                                                    <td>{u.phone || '—'}</td>
                                                    <td><span className={`adm-status ${u.role === 'admin' ? 'active' : ''}`} style={{ textTransform: 'capitalize' }}>{u.role || 'user'}</span></td>
                                                    <td>{u.location || '—'}</td>
                                                    <td>{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                                                    <td>
                                                        <button className="adm-act-btn" onClick={() => navigate(`/seller/${u.id}`)}>Profile</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* BUYER REPORTS */}
                {activeTab === 'buyer-reports' && !loadingData && (
                    <div className="animate-fadeIn">
                        <div className="adm-section">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                                <h3 className="adm-sec-title" style={{ marginBottom: 0 }}>🚩 Buyer Reports — {filterReports(buyerReports).length} shown</h3>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    {['all', 'pending', 'resolved'].map(f => (
                                        <button key={f} className={`adm-act-btn${reportFilter === f ? ' act-filter' : ''}`}
                                            style={reportFilter === f ? { background: 'var(--green)', color: 'white' } : {}}
                                            onClick={() => setReportFilter(f)}>
                                            {f.charAt(0).toUpperCase() + f.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {filterReports(buyerReports).length === 0 ? (
                                <div style={{ color: 'rgba(255,255,255,.4)', textAlign: 'center', padding: 60 }}>
                                    <div style={{ fontSize: 60 }}>🚩</div>
                                    <div style={{ marginTop: 12 }}>No {reportFilter !== 'all' ? reportFilter : ''} buyer reports</div>
                                </div>
                            ) : (
                                <div className="adm-table-wrap">
                                    <table className="adm-table">
                                        <thead><tr><th>Listing</th><th>Reason</th><th>Status</th><th>Reported On</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {filterReports(buyerReports).map(r => (
                                                <tr key={r.id}>
                                                    <td>
                                                        <div style={{ color: 'rgba(255,255,255,.85)', fontWeight: 700 }}>{r.listings?.title || 'Unknown/Deleted'}</div>
                                                        <div style={{ fontSize: 11, color: 'var(--blue)' }}>{r.listings?.listing_code || '—'}</div>
                                                    </td>
                                                    <td style={{ color: '#ff4d4f', maxWidth: 200, whiteSpace: 'normal', lineHeight: 1.4 }}>{r.reason}</td>
                                                    <td><span className={`adm-status ${r.status}`}>{r.status}</span></td>
                                                    <td>{new Date(r.created_at).toLocaleDateString('en-IN')}</td>
                                                    <td>
                                                        {r.listings && <button className="adm-act-btn" onClick={() => window.open(`/listing/${r.listings.listing_code || r.listing_id}`, '_blank')}>View</button>}
                                                        {r.status === 'pending' && (
                                                            <>
                                                                <button className="adm-act-btn" style={{ marginLeft: 6, borderColor: 'var(--green)', color: 'var(--green)' }} onClick={() => resolveReport(r.id, 'keep', r.listing_id, 'buyer')}>Dismiss</button>
                                                                <button className="adm-act-btn danger" style={{ marginLeft: 6 }} onClick={() => resolveReport(r.id, 'remove', r.listing_id, 'buyer')}>Remove Listing</button>
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* SELLER REPORTS */}
                {activeTab === 'seller-reports' && !loadingData && (
                    <div className="animate-fadeIn">
                        <div className="adm-section">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                                <h3 className="adm-sec-title" style={{ marginBottom: 0 }}>📨 Seller Reports — {filterReports(sellerReports).length} shown</h3>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    {['all', 'pending', 'resolved'].map(f => (
                                        <button key={f} className={`adm-act-btn${reportFilter === f ? ' act-filter' : ''}`}
                                            style={reportFilter === f ? { background: 'var(--green)', color: 'white' } : {}}
                                            onClick={() => setReportFilter(f)}>
                                            {f.charAt(0).toUpperCase() + f.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {filterReports(sellerReports).length === 0 ? (
                                <div style={{ color: 'rgba(255,255,255,.4)', textAlign: 'center', padding: 60 }}>
                                    <div style={{ fontSize: 60 }}>📨</div>
                                    <div style={{ marginTop: 12 }}>No {reportFilter !== 'all' ? reportFilter : ''} seller reports</div>
                                </div>
                            ) : (
                                <div className="adm-table-wrap">
                                    <table className="adm-table">
                                        <thead><tr><th>Listing</th><th>Seller</th><th>Issue</th><th>Status</th><th>Submitted</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {filterReports(sellerReports).map(r => (
                                                <tr key={r.id}>
                                                    <td>
                                                        <div style={{ color: 'rgba(255,255,255,.85)', fontWeight: 700 }}>{r.listings?.title || 'Unknown/Deleted'}</div>
                                                        <div style={{ fontSize: 11, color: 'var(--blue)' }}>{r.listings?.listing_code || '—'}</div>
                                                    </td>
                                                    <td style={{ fontSize: 12 }}>
                                                        <div style={{ color: 'rgba(255,255,255,.7)' }}>{r.reporter_id?.substring(0, 8)}...</div>
                                                    </td>
                                                    <td style={{ color: '#c084fc', maxWidth: 250, whiteSpace: 'normal', lineHeight: 1.4 }}>{r.reason}</td>
                                                    <td><span className={`adm-status ${r.status}`}>{r.status}</span></td>
                                                    <td>{new Date(r.created_at).toLocaleDateString('en-IN')}</td>
                                                    <td>
                                                        {r.listings && <button className="adm-act-btn" onClick={() => window.open(`/listing/${r.listings.listing_code || r.listing_id}`, '_blank')}>View Listing</button>}
                                                        {r.status === 'pending' && (
                                                            <button className="adm-act-btn" style={{ marginLeft: 6, borderColor: 'var(--green)', color: 'var(--green)' }} onClick={() => resolveReport(r.id, 'keep', r.listing_id, 'seller')}>Mark Resolved</button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
