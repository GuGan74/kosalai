import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import BackButton from '../components/BackButton';
import ListingCard from '../components/ListingCard';

const DEMO_SELLER = {
    id: 'demo-seller',
    full_name: 'Rajan Kumar',
    phone: '9876543210',
    email: 'rajan@example.com',
    location: 'Coimbatore, Tamil Nadu',
    created_at: new Date(Date.now() - 365 * 24 * 3600000).toISOString(),
};

const DEMO_SELLER_LISTINGS = [
    { id: 'd1', title: 'HF Cow — High Milk Yield', category: 'cow', breed: 'HF Holstein', age_years: 4, price: 65000, location: 'Coimbatore', state: 'Tamil Nadu', milk_yield_liters: 18, is_vaccinated: true, is_verified: true, is_promoted: false, for_adoption: false, image_url: null, status: 'active', gender: 'female', created_at: new Date().toISOString() },
    { id: 'd2', title: 'Gir Cow — A2 Milk', category: 'cow', breed: 'Gir', age_years: 3, price: 48000, location: 'Coimbatore', state: 'Tamil Nadu', milk_yield_liters: 12, is_vaccinated: true, is_verified: false, is_promoted: false, for_adoption: false, image_url: null, status: 'active', gender: 'female', created_at: new Date().toISOString() },
];

export default function SellerProfilePage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { currentUser, isLoggedIn } = useAuth();
    const [seller, setSeller] = useState(null);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Guard: guests cannot view seller profiles
        if (isLoggedIn === false) {
            sessionStorage.setItem('pb_redirect_after_login', `/seller/${userId}`);
            navigate('/login');
            return;
        }

        // Still resolving auth state — wait
        if (isLoggedIn === undefined || isLoggedIn === null) return;

        async function fetchData() {
            // Demo mode fallback
            if (!userId || userId.startsWith('demo')) {
                setSeller(DEMO_SELLER);
                setListings(DEMO_SELLER_LISTINGS);
                setLoading(false);
                return;
            }
            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                setSeller(profile || DEMO_SELLER);

                const { data: listingsData } = await supabase
                    .from('listings')
                    .select('id,title,category,breed,location,state,price,milk_yield_liters,age_years,for_adoption,image_url,image_urls,user_id,status,gender,created_at')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                setListings(listingsData || []);
            } catch (err) {
                console.error('Seller fetch error:', err);
                setSeller(DEMO_SELLER);
                setListings(DEMO_SELLER_LISTINGS);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [userId, isLoggedIn]);

    if (loading || isLoggedIn === undefined || isLoggedIn === null) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <div className="spinner dark" style={{ margin: '0 auto' }} />
        </div>
    );

    if (!seller) return (
        <div style={{ textAlign: 'center', padding: 40 }}>
            Seller not found. <button onClick={() => navigate('/')}>Go Home</button>
        </div>
    );

    const initials = (seller.full_name || seller.phone || 'S').slice(0, 2).toUpperCase();
    const memberYear = new Date(seller.created_at || Date.now()).getFullYear();
    const displayPhone = seller.phone
        ? (seller.phone.startsWith('+') ? seller.phone : `+91 ${seller.phone}`)
        : null;
    const whatsappUrl = seller.phone
        ? `https://wa.me/${seller.phone.replace(/\D/g, '').replace(/^0/, '91').replace(/^(?!91)/, '91')}?text=Hi, I saw your listing on Kosalai and I am interested.`
        : null;

    const activeListings = listings.filter(l => l.status === 'active');
    const activeCount = activeListings.length;
    const soldCount = listings.filter(l => l.status === 'sold').length;

    return (
        <div className="seller-profile-page">
            <BackButton fallbackPath="/" />

            {/* Hero Card */}
            <div className="seller-hero-card">
                <div className="seller-avatar-circle">{initials}</div>
                <h1 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 4px', fontFamily: 'Poppins,sans-serif' }}>
                    {seller.full_name || 'Verified Seller'}
                </h1>
                <p style={{ opacity: 0.8, fontSize: 13, margin: '0 0 8px' }}>
                    ✓ {t('listingDetail.verifiedSeller', 'Verified Seller')} · {t('listingDetail.memberSince', { year: memberYear })}
                </p>
                {seller.location && (
                    <p style={{ opacity: 0.7, fontSize: 12, margin: 0 }}>📍 {seller.location}</p>
                )}
            </div>



            {/* Contact Info — visible only to logged-in users */}
            <div className="seller-contact-card">
                <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, marginBottom: 16, color: '#1a3c28' }}>
                    {t('sellerProfile.contactInfo')}
                </h3>

                {displayPhone && (
                    <div className="seller-contact-item" style={{ marginBottom: 12 }}>
                        <span>📞</span>
                        <span style={{ color: '#6B7280', fontWeight: 600 }}>{t('sellerProfile.phoneNumber')}:</span>
                        <a href={`tel:${seller.phone}`} style={{ color: '#1a7a3c', fontWeight: 700, textDecoration: 'none', letterSpacing: '0.02em' }}>
                            {displayPhone}
                        </a>
                    </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                    {whatsappUrl && (
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                background: '#25D366', color: 'white', fontWeight: 800,
                                borderRadius: 12, padding: '14px 16px', textDecoration: 'none',
                                fontSize: 15, fontFamily: 'Nunito, sans-serif',
                                boxShadow: '0 4px 12px rgba(37,211,102,0.25)',
                                transition: 'opacity 0.2s'
                            }}
                        >
                            {t('listing.whatsappSeller', 'WhatsApp Seller')}
                        </a>
                    )}
                    {displayPhone && (
                        <a
                            href={`tel:${seller.phone}`}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                background: '#1a7a3c', color: 'white', fontWeight: 800,
                                borderRadius: 12, padding: '14px 16px', textDecoration: 'none',
                                fontSize: 15, fontFamily: 'Nunito, sans-serif',
                                boxShadow: '0 4px 12px rgba(26,122,60,0.2)',
                                transition: 'opacity 0.2s'
                            }}
                        >
                            📞 {t('listing.callSeller', 'Call Seller')}
                        </a>
                    )}
                </div>
            </div>

            {/* Seller Listings */}
            <div>
                <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, marginBottom: 16, color: '#1a3c28', fontSize: 18 }}>
                    {t('sellerProfile.listingsCount', { count: listings.length })}
                </h2>

                {activeListings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>
                        <div style={{ fontSize: 48 }}>📭</div>
                        <p>{t('sellerProfile.noListings')}</p>
                    </div>
                ) : (
                    <div className="seller-listings-grid">
                        {activeListings.map(l => <ListingCard key={l.id} listing={l} />)}
                    </div>
                )}
            </div>
        </div>
    );
}
