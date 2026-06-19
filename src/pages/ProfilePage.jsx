import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { DISTRICTS } from '../constants/locations';
import { INDIAN_STATES } from '../constants/states';
import ListingCard from '../components/ListingCard';
import BackButton from '../components/BackButton';
import toast from 'react-hot-toast';
import TranslatedText from '../components/TranslatedText';
import './ProfilePage.css';

export default function ProfilePage() {
    const navigate = useNavigate();
    const { currentProfile, signOut, currentUser, loadProfile, profileReady } = useAuth();
    const { t } = useTranslation();
    const p = currentProfile || {};
    const initials = (p.full_name || 'U').slice(0, 2).toUpperCase();
    const yr = new Date(p.created_at || Date.now()).getFullYear();

    const [likedListings, setLikedListings] = useState([]);
    const [loadingLiked, setLoadingLiked] = useState(true);
    const [stats, setStats] = useState({ listings: 0, activeListings: 0, sold: 0 });
    const [statsLoading, setStatsLoading] = useState(true);

    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        full_name: '', phone: '', state: '', location: '', language: 'English'
    });
    const [errors, setErrors] = useState({});

    const fetchStats = React.useCallback(async () => {
        if (!currentUser) return;
        setStatsLoading(true);
        try {
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Stats fetch timeout')), 5000));
            const fetchPromise = Promise.all([
                supabase.from('listings').select('id', { count: 'exact', head: true }).eq('user_id', currentUser.id),
                supabase.from('listings').select('id', { count: 'exact', head: true }).eq('user_id', currentUser.id).eq('status', 'sold')
            ]);

            const [listingsRes, soldRes] = await Promise.race([fetchPromise, timeoutPromise]);

            const totalListings = listingsRes?.count || 0;
            const soldListings = soldRes?.count || 0;

            setStats({
                listings: totalListings,
                activeListings: totalListings - soldListings,
                sold: soldListings
            });
        } catch (err) {
            console.error('Stats fetch error:', err);
        } finally {
            setStatsLoading(false);
        }
    }, [currentUser]);

    const fetchLikedListings = React.useCallback(async () => {
        try {
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Liked fetch timeout')), 5000));
            const fetchPromise = supabase
                .from('favorites')
                .select(`
                    listing_id,
                    listings (*)
                `)
                .eq('user_id', currentUser.id);

            const { data } = await Promise.race([fetchPromise, timeoutPromise]);

            if (data) {
                const list = data.map(item => item.listings).filter(l => l && l.status === 'active');
                setLikedListings(list);
            }
        } catch (err) {
            console.error('Error fetching liked listings:', err);
        } finally {
            setLoadingLiked(false);
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            fetchLikedListings();
            fetchStats();
        }
    }, [currentUser, fetchLikedListings, fetchStats]);

    async function handleSignOut() {
        await signOut();
        toast.success('Signed out. See you soon! 👋');
    }

    async function saveProfile() {
        const newErrors = {};
        const fullNameStr = (editForm.full_name || '').trim();
        const phoneStr = (editForm.phone || '').trim();
        const stateStr = (editForm.state || '').trim();
        const locationStr = (editForm.location || '').trim();
        const languageStr = (editForm.language || '').trim();

        const phoneDigits = phoneStr.replace(/\D/g, '');

        if (!fullNameStr) newErrors.full_name = 'Full Name is required.';
        if (!phoneDigits || phoneDigits.length < 10) newErrors.phone = 'Enter a valid 10-digit number.';
        if (!stateStr) newErrors.state = 'State is required.';
        if (!locationStr) newErrors.location = 'District is required.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error('Please complete all required profile fields.');
            return;
        }

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: fullNameStr,
                phone: phoneStr,
                location: `${locationStr}, ${stateStr}`,
                language: languageStr,
            })
            .eq('id', currentUser.id);
        if (error) { toast.error('Failed to update profile'); return; }
        await loadProfile(currentUser.id);
        setEditing(false);
        toast.success('Profile updated! ✓');
    }

    const isAdminEmail = p?.email === "mail.kosalai@gmail.com" || currentUser?.email === "mail.kosalai@gmail.com";

    const menuItems = [
        { icon: '📋', label: t('profilePage.myListings'), sub: t('profilePage.viewManage'), action: () => navigate('/my-listings') },
        { icon: '🔔', label: t('profilePage.notifications'), sub: t('profilePage.buyerInquiries'), action: () => navigate('/notifications') },
        { icon: '❓', label: t('profilePage.helpFaq'), sub: t('profilePage.supportGuides'), action: () => navigate('/help') },
        { icon: '🔐', label: t('profilePage.privacyPolicy'), sub: t('profilePage.termsConditions'), action: () => navigate('/privacy') },
        { icon: 'ℹ️', label: t('aboutUs.title', 'About Us'), sub: t('aboutUs.learnMore', 'Learn more about Kosalai'), action: () => navigate('/about-us') },
        // Admin Dashboard — only visible for verified admin email
        ...(isAdminEmail ? [{
            icon: '🛡️', label: t('manage_admin', { defaultValue: 'Admin Dashboard' }), sub: 'Manage listings, users & reports', action: () => navigate('/admin')
        }] : []),
    ];

    return (
        <div className="prof-wrap">
            <BackButton fallbackPath="/" />
            {/* Left Card */}
            <div className="prof-card">
                {!profileReady ? (
                    <div className="prof-hd-bg" style={{ minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                    </div>
                ) : (
                    <div className="prof-hd-bg">
                        <div className="p-av">{initials}</div>
                        <div className="p-nm">{p.full_name || t('profilePage.myAccount')}</div>
                        <div className="p-meta">{p.location ? <>📍 <TranslatedText>{p.location}</TranslatedText> · </> : ''}{t('profilePage.memberSince', { year: yr })}</div>
                        <div className="p-badges"></div>
                    </div>
                )}

                {editing ? (
                    <div className="section-card" style={{ margin: '16px' }}>
                        <h4>{t('profilePage.editProfile', { defaultValue: 'Edit Profile' })}</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div>
                                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--g3)', textTransform: 'uppercase' }}>{t('profilePage.fullName', { defaultValue: 'Full Name' })} <span style={{ color: 'var(--red)' }}>*</span></label>
                                <input
                                    value={editForm.full_name}
                                    onChange={e => {
                                        setEditForm({ ...editForm, full_name: e.target.value });
                                        if (e.target.value.trim()) setErrors(prev => ({ ...prev, full_name: null }));
                                    }}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1.5px solid ${errors.full_name ? 'var(--red)' : 'var(--g5)'}`, outline: 'none' }}
                                />
                                {errors.full_name && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errors.full_name}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--g3)', textTransform: 'uppercase' }}>{t('profilePage.phone', { defaultValue: 'Phone' })} <span style={{ color: 'var(--red)' }}>*</span></label>
                                <input
                                    type="tel"
                                    maxLength={10}
                                    value={editForm.phone}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setEditForm({ ...editForm, phone: val });
                                        if (val.length === 10) setErrors(prev => ({ ...prev, phone: null }));
                                    }}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1.5px solid ${errors.phone ? 'var(--red)' : 'var(--g5)'}`, outline: 'none' }}
                                />
                                {errors.phone && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errors.phone}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--g3)', textTransform: 'uppercase' }}>{t('profilePage.state', { defaultValue: 'State' })} <span style={{ color: 'var(--red)' }}>*</span></label>
                                <select
                                    value={editForm.state}
                                    onChange={e => {
                                        setEditForm({ ...editForm, state: e.target.value, location: '' });
                                        if (e.target.value.trim()) setErrors(prev => ({ ...prev, state: null }));
                                    }}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1.5px solid ${errors.state ? 'var(--red)' : 'var(--g5)'}`, outline: 'none', background: 'white' }}
                                >
                                    <option value="">{t('profilePage.selectState', { defaultValue: 'Select State' })}</option>
                                    {INDIAN_STATES.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                                {errors.state && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errors.state}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--g3)', textTransform: 'uppercase' }}>{t('profilePage.district', { defaultValue: 'District' })} <span style={{ color: 'var(--red)' }}>*</span></label>
                                {editForm.state && DISTRICTS.find(g => g.group === editForm.state) ? (
                                    <select
                                        value={editForm.location}
                                        onChange={e => {
                                            setEditForm({ ...editForm, location: e.target.value });
                                            if (e.target.value.trim()) setErrors(prev => ({ ...prev, location: null }));
                                        }}
                                        disabled={!editForm.state}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1.5px solid ${errors.location ? 'var(--red)' : 'var(--g5)'}`, outline: 'none', background: !editForm.state ? '#f3f4f6' : 'white', cursor: !editForm.state ? 'not-allowed' : 'pointer' }}
                                    >
                                        <option value="">{editForm.state ? t('profilePage.selectDistrict', { defaultValue: 'Select District' }) : t('profilePage.selectStateFirst', { defaultValue: 'Select State First' })}</option>
                                        {DISTRICTS.find(g => g.group === editForm.state)?.opts.map(o => (
                                            <option key={o} value={o}>{o}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        placeholder={editForm.state ? "Enter your district / city" : "Select State First"}
                                        value={editForm.location}
                                        onChange={e => {
                                            setEditForm({ ...editForm, location: e.target.value });
                                            if (e.target.value.trim()) setErrors(prev => ({ ...prev, location: null }));
                                        }}
                                        disabled={!editForm.state}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1.5px solid ${errors.location ? 'var(--red)' : 'var(--g5)'}`, outline: 'none', background: !editForm.state ? '#f3f4f6' : 'white', cursor: !editForm.state ? 'not-allowed' : 'text' }}
                                    />
                                )}
                                {errors.location && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errors.location}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--g3)', textTransform: 'uppercase' }}>{t('profilePage.language', { defaultValue: 'Language' })}</label>
                                <select
                                    value={editForm.language}
                                    onChange={e => {
                                        setEditForm({ ...editForm, language: e.target.value });
                                        if (e.target.value.trim()) setErrors(prev => ({ ...prev, language: null }));
                                    }}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1.5px solid ${errors.language ? 'var(--red)' : 'var(--g5)'}`, outline: 'none', background: 'white' }}
                                >
                                    <option value="">{t('profilePage.selectLanguage', { defaultValue: 'Select Language' })}</option>
                                    <option value="English">English</option>
                                    <option value="Tamil">Tamil</option>
                                    <option value="Hindi">Hindi</option>
                                    <option value="Telugu">Telugu</option>
                                    <option value="Kannada">Kannada</option>
                                    <option value="Malayalam">Malayalam</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button className="btn-primary" style={{ flex: 1 }} onClick={saveProfile}>{t('profilePage.save', { defaultValue: 'Save' })}</button>
                                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setEditing(false)}>{t('profilePage.cancel', { defaultValue: 'Cancel' })}</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="p-stats">
                            <div className="pst"><div className="n">{statsLoading ? '-' : stats.listings}</div><div className="l">{t('profilePage.totalListings', 'Total Listings')}</div></div>
                            <div className="pst"><div className="n">{statsLoading ? '-' : stats.activeListings}</div><div className="l">{t('profilePage.activeListings', 'Active Listings')}</div></div>
                            <div className="pst"><div className="n">{statsLoading ? '-' : stats.sold}</div><div className="l">{t('profilePage.soldListings', 'Sold Listings')}</div></div>
                        </div>
                        <div className="prof-body">
                            {menuItems.map((m, i) => (
                                <div key={i} className="prof-mi" onClick={m.action}>
                                    <div className="pmi-l">
                                        <div className="pmi-ic-box">{m.icon}</div>
                                        <div>
                                            <div className="pmi-lbl">{m.label}</div>
                                            <div style={{ fontSize: 11, color: 'var(--g3)', marginTop: 1 }}>{m.sub}</div>
                                        </div>
                                    </div>
                                    <span className="pmi-r">›</span>
                                </div>
                            ))}
                            <div className="prof-mi" onClick={handleSignOut}>
                                <div className="pmi-l">
                                    <div className="pmi-ic-box" style={{ color: 'var(--red)', background: 'var(--red-light)' }}>🚪</div>
                                    <div>
                                        <div className="pmi-lbl" style={{ color: 'var(--red)' }}>{t('profilePage.signOut')}</div>
                                        <div style={{ fontSize: 11, color: 'var(--red)', opacity: 0.7 }}>{t('profilePage.securelyLeave')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Right — Quick Actions */}
            <div className="prof-right">
                <div className="section-card" style={{ marginBottom: 16 }}>
                    <h4>{t('profilePage.quickActions')}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/sell')}>
                            {t('profilePage.postNewListing')}
                        </button>
                        <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/my-listings')}>
                            📋 {t('profilePage.myListings')}
                        </button>
                    </div>
                </div>

                <div className="section-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <h4 style={{ marginBottom: 0 }}>{t('profilePage.accountDetails')}</h4>
                        <button
                            style={{ background: 'none', border: 'none', color: 'var(--green)', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                            onClick={() => {
                                setEditForm({
                                    full_name: p.full_name || '',
                                    phone: p.phone || '',
                                    state: p.location?.includes(', ') ? p.location.split(', ')[1] : '',
                                    location: p.location?.includes(', ') ? p.location.split(', ')[0] : (p.location || ''),
                                    language: p.language || 'English'
                                });
                                setEditing(true);
                            }}
                        >
                            ✏️ {t('profilePage.edit', { defaultValue: 'Edit' })}
                        </button>
                    </div>
                    <div className="prof-detail-row"><span>{t('profilePage.phoneIcon')}</span><span>{p.phone || '—'}</span></div>
                    <div className="prof-detail-row"><span>📍 {t('profilePage.location', { defaultValue: 'Location' })}</span><span>{p.location ? <TranslatedText>{p.location}</TranslatedText> : '—'}</span></div>
                    <div className="prof-detail-row"><span>{t('profilePage.email')}</span><span>{p.email || '—'}</span></div>
                </div>

                <div className="section-card" style={{ marginTop: 16 }}>
                    <h4>❤️ {t('profilePage.savedListings', { defaultValue: 'Saved Listings' })}</h4>
                    {loadingLiked ? (
                        <div style={{ padding: 20, textAlign: 'center' }}><div className="spinner dark" /></div>
                    ) : likedListings.length === 0 ? (
                        <p style={{ fontSize: 13, color: 'var(--g3)', textAlign: 'center', padding: '20px 0' }}>{t('profilePage.noLikedYet')}</p>
                    ) : (
                        <div className="liked-animals-grid">
                            {likedListings.map(l => (
                                <div key={l.id} className="mini-liked-card" onClick={() => navigate(`/listing/${l.listing_code || l.id}`)}>
                                    <div className="mlc-img">
                                        {l.image_url ? <img src={l.image_url} alt={l.title} /> : <span>🐾</span>}
                                    </div>
                                    <div className="mlc-info">
                                        <div className="mlc-name"><TranslatedText>{l.title}</TranslatedText></div>
                                        <div className="mlc-price">₹{Number(l.price).toLocaleString()}</div>
                                    </div>
                                    <span className="mlc-arrow">›</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div >
        </div >
    );
}
