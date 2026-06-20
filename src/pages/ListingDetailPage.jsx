import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { DEMO_MAP } from '../data/demoData';
import SEOHead from '../components/SEOHead';
import BackButton from '../components/BackButton';
import loadingGif from '../assets/379.gif';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import TranslatedText from '../components/TranslatedText';
import { shareListing } from '../utils/shareListing';
import { getOptimizedCloudinaryUrl } from '../lib/cloudinary';
import { parseImageUrls } from '../utils/helpers';
import './ListingDetailPage.css';

export default function ListingDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser, currentProfile } = useAuth();
    const { t } = useTranslation();
    const [listing, setListing] = useState(null);
    const [sellerPhone, setSellerPhone] = useState(null);
    const [sellerName, setSellerName] = useState(null);
    const [sellerJoinDate, setSellerJoinDate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reporting, setReporting] = useState(false);
    const [activeImgIndex, setActiveImgIndex] = useState(0);

    const [isLiked, setIsLiked] = useState(false);

    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const parsedUrls = listing?.image_urls ? parseImageUrls(listing.image_urls) : [];
        const imgs = parsedUrls.length > 0 ? parsedUrls : (listing?.image_url ? [listing.image_url] : []);
        
        if (distance > minSwipeDistance) {
            setActiveImgIndex(i => i === imgs.length - 1 ? 0 : i + 1);
        } else if (distance < -minSwipeDistance) {
            setActiveImgIndex(i => i === 0 ? imgs.length - 1 : i - 1);
        }
    };
    const fetchAllData = React.useCallback(async () => {
        // Demo mode shortcut
        if (String(id).startsWith('d') && String(id).length < 10) {
            setListing(DEMO_MAP[id] || DEMO_MAP['d1']);
            setLoading(false);
            return;
        }

        // 1. Check cache first for instant display on refresh
        const cacheKey = `ks_listing_${id}`;
        try {
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                const { listing: cl, seller } = JSON.parse(cached);
                if (cl) {
                    setListing(cl);
                    setLoading(false); // Show immediately from cache
                    if (seller?.phone) setSellerPhone(seller.phone);
                    if (seller?.full_name) setSellerName(seller.full_name);
                    if (seller?.created_at) setSellerJoinDate(seller.created_at);
                }
            }
        } catch (e) { /* ignore cache errors */ }

        // 2. Fetch listing data first
        let listingData = null;
        let trueUuid = null;

        if (String(id).startsWith('KSL')) {
            const { data } = await supabase.from('listings').select('*').eq('listing_code', id).single();
            listingData = data;
            trueUuid = data?.id;
        } else {
            const { data } = await supabase.from('listings').select('*').eq('id', id).single();
            listingData = data;
            trueUuid = id;
        }

        // 3. Fetch favorites using the true UUID
        if (currentUser && trueUuid) {
            const { data: likedData } = await supabase.from('favorites').select('id').eq('user_id', currentUser.id).eq('listing_id', trueUuid);
            if (likedData && likedData.length > 0) setIsLiked(true);
        }

        if (listingData) {
            setListing(listingData);

            // 3. Fetch seller profile in parallel with the above (non-blocking)
            if (listingData.user_id) {
                supabase.from('profiles')
                    .select('phone, full_name, created_at')
                    .eq('id', listingData.user_id)
                    .single()
                    .then(({ data: profile }) => {
                        if (profile?.phone) setSellerPhone(profile.phone);
                        if (profile?.full_name) setSellerName(profile.full_name);
                        if (profile?.created_at) setSellerJoinDate(profile.created_at);
                        // Save to cache
                        try {
                            sessionStorage.setItem(cacheKey, JSON.stringify({ listing: listingData, seller: profile }));
                        } catch(e) {}
                    });
            }
        }

        setLoading(false);
    }, [id, currentUser]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    async function handleToggleLike() {
        if (!currentUser) {
            sessionStorage.setItem('pb_redirect_after_login', `/listing/${listing?.listing_code || id}`);
            navigate('/login');
            return;
        }

        if (isLiked) {
            if (String(id).startsWith('d') && String(id).length < 10) {
                setIsLiked(false); toast.success('Removed from Favorites'); return;
            }
            const { error } = await supabase.from('favorites').delete()
                .eq('user_id', currentUser.id).eq('listing_id', id);
            if (!error) setIsLiked(false);
        } else {
            if (String(id).startsWith('d') && String(id).length < 10) {
                setIsLiked(true); toast.success('Added to Favorites ❤️');
                toast('Owner notified! (Demo Mode)'); return;
            }
            const { error } = await supabase.from('favorites')
                .insert({ user_id: currentUser.id, listing_id: id });
            if (!error) {
                setIsLiked(true);
                toast.success('Added to Favorites ❤️');
                const targetUid = listing.user_id || currentUser.id;
                await supabase.from('notifications').insert({
                    user_id: targetUid,
                    actor_id: currentUser.id,
                    type: 'like',
                    icon: '❤️',
                    title: 'New Like on your post!',
                    message: `${currentProfile?.full_name || 'Someone'} liked your ${listing.title}.`,
                    metadata: { listing_id: id }
                }).then(({ error: notifError }) => {
                    if (notifError) {
                        toast.error(`Notification Error: ${notifError.message}`);
                    }
                });
            }
        }
    }

    async function handleReport() {
        if (!currentUser) {
            sessionStorage.setItem('pb_redirect_after_login', `/listing/${listing?.listing_code || id}`);
            navigate('/login');
            return;
        }
        const reason = window.prompt("Why are you reporting this listing? (e.g. Fake, Spam, Sold)");
        if (!reason) return;
        if (String(id).startsWith('d') && String(id).length < 10) {
            toast.success('Report submitted (Demo mode) ✅'); return;
        }
        setReporting(true);
        try {
            const { error } = await supabase.from('reports').insert({
                listing_id: id, reporter_id: currentUser.id, reason, report_type: 'buyer'
            });
            if (error) throw error;
            toast.success('Thank you. Report submitted for review.');
        } catch (err) {
            console.error('Report error:', err);
            toast.success('Thank you. Your report has been submitted.');
        } finally {
            setReporting(false);
        }
    }

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><img src={loadingGif} alt="Loading..." style={{ width: 60, height: 60, objectFit: 'contain', margin: '0 auto' }} /></div>;
    if (!listing) return <div style={{ padding: 40, textAlign: 'center' }}>Listing not found. <button onClick={() => navigate('/')}>Go Home</button></div>;

    const isPet = ['dog', 'cat', 'bird'].includes(listing.category);


    // Removed unused WhatsApp variables

    // JSON-LD structured data for Product schema
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": listing.title,
        "description": listing.description || `${listing.breed}, ${listing.age_years} years old`,
        "image": (listing.image_urls && parseImageUrls(listing.image_urls).length > 0) ? parseImageUrls(listing.image_urls)[0] : (listing.image_url || ''),
        "offers": {
            "@type": "Offer",
            "priceCurrency": "INR",
            "price": listing.for_adoption ? 0 : listing.price,
            "availability": "https://schema.org/InStock",
            "url": `https://kosalai.in/listing/${listing.listing_code || listing.id}`
        }
    };

    const parsedDisplayUrls = listing.image_urls ? parseImageUrls(listing.image_urls) : [];
    const displayImages = parsedDisplayUrls.length > 0 ? parsedDisplayUrls : (listing.image_url ? [listing.image_url] : []);

    const initials = sellerName
        ?.split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word[0])
        .join('')
        .toUpperCase() || 'U';

    return (
        <div className="det-page">
            <SEOHead
                title={`${listing.title} for sale in ${listing.location} | Kosalai`}
                description={`${listing.breed || ''}, ${listing.age_years ? listing.age_years + ' years old' : ''}. Price: ${listing.for_adoption ? 'Free' : '₹' + Number(listing.price).toLocaleString('en-IN')}. Located in ${listing.location}${listing.state ? ', ' + listing.state : ''}.`}
                imageUrl={displayImages[0] || null}
                url={`https://kosalai.in/listing/${listing.listing_code || listing.id}`}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="det-layout">
                {/* LEFT */}
                <div className="det-left">
                    <BackButton fallbackPath="/" />
                    <div className="breadcrumb">
                        <span onClick={() => navigate('/')} style={{ color: 'var(--green)', cursor: 'pointer' }}>{t('listingDetail.home')}</span>
                        <span>›</span>
                        <span style={{ textTransform: 'capitalize' }}><TranslatedText>{listing.category}</TranslatedText></span>
                        <span>›</span>
                        <span><TranslatedText>{listing.title}</TranslatedText></span>
                    </div>

                    <div 
                        className="det-img-wrap" 
                        style={{ position: 'relative' }}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        {displayImages.length > 0 ? (
                            <>
                                <img
                                    src={getOptimizedCloudinaryUrl(displayImages[activeImgIndex], 900)}
                                    alt={`${listing.title} - ${activeImgIndex + 1}`}
                                    className="det-img"
                                    style={{ objectFit: 'cover', objectPosition: 'center', width: '100%' }}
                                    onError={e => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                                {displayImages.length > 1 && (
                                    <>
                                        <button 
                                            onClick={() => setActiveImgIndex(i => i === 0 ? displayImages.length - 1 : i - 1)}
                                            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', fontSize: 20, boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                                            ❮
                                        </button>
                                        <button 
                                            onClick={() => setActiveImgIndex(i => i === displayImages.length - 1 ? 0 : i + 1)}
                                            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', fontSize: 20, boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                                            ❯
                                        </button>
                                        <div style={{ position: 'absolute', bottom: 15, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
                                            {displayImages.map((_, idx) => (
                                                <div key={idx} onClick={() => setActiveImgIndex(idx)} style={{ width: 8, height: 8, borderRadius: '50%', background: activeImgIndex === idx ? 'white' : 'rgba(255,255,255,0.5)', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.3)' }} />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="det-img det-img-placeholder">
                                <span style={{ fontSize: 80 }}>
                                    {listing.category === 'cow' ? '🐄' :
                                        listing.category === 'buffalo' ? '🦬' :
                                            listing.category === 'goat' ? '🐐' :
                                                listing.category === 'horse' ? '🐎' :
                                                    listing.category === 'dog' ? '🐕' :
                                                        listing.category === 'cat' ? '🐈' :
                                                            listing.category === 'bird' ? '🦜' : '🐾'}
                                </span>
                            </div>
                        )}
                        <div className="gal-badges">
                            {listing.is_promoted && <span className="gal-badge o">⚡ <TranslatedText>Promoted</TranslatedText></span>}
                            {listing.for_adoption && <span className="gal-badge p">💜 <TranslatedText>Free Adoption</TranslatedText></span>}
                        </div>

                        {/* SOLD overlay on the detail image */}
                        {listing.status === 'sold' && (
                            <>
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    background: 'rgba(0,0,0,0.45)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    zIndex: 5,
                                }}>
                                    <span style={{
                                        color: '#d32f2f',
                                        fontWeight: 900,
                                        fontSize: 'clamp(32px, 10vw, 52px)',
                                        letterSpacing: '0.15em',
                                        fontFamily: 'Impact, Poppins, sans-serif',
                                        userSelect: 'none',
                                        border: '6px solid #d32f2f',
                                        borderRadius: '12px',
                                        padding: '10px 30px',
                                        transform: 'rotate(-15deg)',
                                        display: 'inline-block',
                                        background: 'rgba(255,255,255,0.85)',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                                        textTransform: 'uppercase',
                                    }}><TranslatedText>SOLD</TranslatedText></span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="det-badges">
                        {listing.is_vaccinated && <span className="badge g">💉 <TranslatedText>Vaccinated</TranslatedText></span>}
                        {listing.is_pregnant && <span className="badge g">🤰 <TranslatedText>Pregnant</TranslatedText></span>}
                        {listing.breed && <span className="badge b"><TranslatedText>{listing.breed}</TranslatedText></span>}
                        {listing.age_years != null && <span className="badge b">{listing.age_years} <TranslatedText>Years Old</TranslatedText></span>}
                    </div>

                    <h1 className="det-title"><TranslatedText>{listing.title}</TranslatedText></h1>
                    <div className="det-meta">
                        {t('listingDetail.listedBy')} {sellerName || t('listingDetail.verifiedSeller')}
                        · {t('listingDetail.memberSince', { year: new Date(sellerJoinDate || Date.now()).getFullYear() })}
                    </div>

                    <div className="stats-grid">
                        {listing.age_years != null && <div className="sg"><div className="lb">{t('listingDetail.age')}</div><div className="vl">{listing.age_years} {t('listingDetail.years')}</div></div>}
                        {['cow', 'buffalo', 'goat', 'sheep'].includes(listing.category) && listing.gender?.toLowerCase() !== 'male' && listing.milk_yield_liters && <div className="sg"><div className="lb">{t('listingDetail.milkYield')}</div><div className="vl">{listing.milk_yield_liters}{t('listingDetail.perDay')}</div></div>}
                        {listing.weight_kg && <div className="sg"><div className="lb">{t('listingDetail.weight')}</div><div className="vl">{listing.weight_kg} {t('listingDetail.kg')}</div></div>}
                        {listing.gender && <div className="sg"><div className="lb">{t('listingDetail.gender')}</div><div className="vl" style={{ textTransform: 'capitalize' }}>{t('listing.' + listing.gender.toLowerCase(), { defaultValue: listing.gender })}</div></div>}
                        <div className="sg"><div className="lb">{t('listingDetail.category')}</div><div className="vl" style={{ textTransform: 'capitalize' }}><TranslatedText>{listing.category}</TranslatedText></div></div>
                        {listing.breed && <div className="sg"><div className="lb">{t('listingDetail.breed')}</div><div className="vl"><TranslatedText>{listing.breed}</TranslatedText></div></div>}
                    </div>

                    {listing.description && (
                        <div className="det-desc" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                            <h4>{t('listingDetail.description', { defaultValue: 'Description' })}</h4>
                            <p style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'normal', margin: 0, marginTop: 8 }}>
                                <TranslatedText>{listing.description}</TranslatedText>
                            </p>
                        </div>
                    )}

                    {/* ── Location Details Card ── */}
                    {(() => {
                        const fields = [
                            { label: t('sellPage.landmark', 'Near Landmark'), value: listing.landmark },
                            { label: t('sellPage.village', 'Village'), value: listing.village },
                            { label: t('sellPage.taluk', 'Taluk'), value: listing.taluk },
                            { label: t('listingDetail.city', 'City'), value: listing.location },
                            { label: t('listingDetail.state', 'State'), value: listing.state },
                        ].filter(f => f.value);

                        if (fields.length === 0) return null;

                        return (
                            <div style={{
                                background: 'white',
                                borderRadius: 16,
                                border: '1px solid #e8f5e9',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                padding: '16px 18px',
                                marginTop: 16,
                                maxWidth: '100%',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    marginBottom: 12,
                                    fontFamily: 'Poppins, sans-serif',
                                    fontWeight: 700, fontSize: 15, color: '#1a3c28'
                                }}>
                                    <span style={{ fontSize: 18 }}>📍</span>
                                    <TranslatedText>Location Details</TranslatedText>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 12px', alignItems: 'start' }}>
                                    {fields.map((field, i) => (
                                        <React.Fragment key={i}>
                                            <div style={{ 
                                                fontWeight: 700, 
                                                color: '#4b5563', 
                                                whiteSpace: 'nowrap',
                                                fontSize: 14,
                                                fontFamily: 'Nunito, sans-serif',
                                                lineHeight: 1.6,
                                                marginTop: '1px' // slight alignment tweak
                                            }}>
                                                {field.label}:
                                            </div>
                                            <div 
                                                title={field.value}
                                                style={{ 
                                                fontWeight: 600, 
                                                color: i === fields.length - 1 ? '#1a7a3c' : '#111827',
                                                wordBreak: 'break-word',
                                                overflowWrap: 'anywhere',
                                                whiteSpace: 'normal',
                                                fontSize: 14,
                                                fontFamily: 'Nunito, sans-serif',
                                                lineHeight: 1.6,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                minWidth: 0
                                            }}>
                                                <TranslatedText>{field.value}</TranslatedText>
                                            </div>
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* RIGHT: Seller Widget */}
                <div className="seller-w">
                    <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--g3)', fontWeight: 600, marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                        Listing ID: {listing.listing_code || 'N/A'}
                    </div>
                    <div className="s-top">
                        <div className={`s-av${isPet ? ' p' : ''}`}>{initials}</div>
                        <div>
                            <div className="s-name">{t('listingDetail.verifiedSeller')}</div>
                            <div className="s-sub">{t('listingDetail.memberSince', { year: new Date(sellerJoinDate || Date.now()).getFullYear() })}</div>
                        </div>
                    </div>
                    <div className="price-w">
                        {listing.for_adoption ? (
                            <div className="price-big p" style={{ fontSize: 24 }}>💜 {t('listingDetail.freeAdoption', 'Free Adoption')}</div>
                        ) : (
                            <div className={`price-big${isPet ? ' p' : ''}`}>₹{Number(listing.price).toLocaleString('en-IN')}</div>
                        )}
                        {!listing.for_adoption && <div className="price-note">{t('listingDetail.negotiable')}</div>}
                    </div>
                    <div className="w-btns">
                        {listing.status === 'sold' ? (
                            /* SOLD notice — replaces contact buttons */
                            <div style={{
                                background: '#fef2f2',
                                border: '1.5px solid #fca5a5',
                                borderRadius: 12,
                                padding: '16px 12px',
                                textAlign: 'center',
                                marginBottom: 8,
                            }}>
                                <div style={{ fontSize: 28, marginBottom: 6 }}>🏷️</div>
                                <div style={{ fontWeight: 800, fontSize: 16, color: '#e53935', fontFamily: 'Poppins, sans-serif' }}>This listing is sold</div>
                                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>This animal is no longer available for purchase.</div>
                            </div>
                        ) : (
                            <>
                            {currentUser ? (
                                /* LOGGED-IN: View Seller Profile CTA — contact info lives on SellerProfilePage */
                                <button
                                    className={`btn-wcall${isPet ? ' p' : ''}`}
                                    onClick={() => {
                                        if (listing.user_id) {
                                            navigate(`/seller/${listing.user_id}`);
                                        } else {
                                            toast.error('Seller profile not available');
                                        }
                                    }}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 16, padding: '16px' }}
                                >
                                    👤 {t('listing.viewSeller', 'View Seller Profile')}
                                </button>
                            ) : (
                                /* GUEST: blurred phone + login prompt */
                                <>
                                <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '12px', textAlign: 'center', fontSize: '18px', fontWeight: '700', color: '#94a3b8', filter: 'blur(4px)', userSelect: 'none', letterSpacing: '0.05em' }}>
                                    📞 +91 XXXXX XXXXX
                                </div>
                                <button
                                    className={`btn-wcall${isPet ? ' p' : ''}`}
                                    onClick={() => {
                                        sessionStorage.setItem('pb_redirect_after_login', `/listing/${listing.listing_code || id}`);
                                        navigate('/login');
                                    }}
                                    style={{ background: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                >
                                    {t('listingDetail.loginToContact', 'Login to Contact Seller')}
                                </button>
                                </>
                            )}
                            {/* Share is always visible */}
                            <button
                                className="btn-fav-large"
                                onClick={() => shareListing(listing)}
                                style={{
                                    width: '100%', marginTop: '10px', padding: '14px',
                                    borderRadius: '12px', background: 'white',
                                    color: 'var(--blue)', fontWeight: 800,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    gap: '8px', cursor: 'pointer',
                                    border: '1px solid #bfdbfe',
                                    transition: '0.2s'
                                }}
                            >
                                {t('listingDetail.shareListing', 'Share Listing')}
                            </button>
                            {/* Favorite — only for logged-in users */}
                            {currentUser && (
                                <button
                                    className={`btn-fav-large ${isLiked ? 'active' : ''}`}
                                    onClick={handleToggleLike}
                                    style={{
                                        width: '100%', marginTop: '10px', padding: '14px',
                                        borderRadius: '12px', background: isLiked ? '#fff0f0' : 'white',
                                        color: isLiked ? '#e63946' : '#666', fontWeight: 800,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        gap: '8px', cursor: 'pointer',
                                        border: isLiked ? '1px solid #fecaca' : '1px solid #e5e7eb',
                                        transition: '0.2s'
                                    }}
                                >
                                    {isLiked ? '❤️ ' + t('listingDetail.savedToProfile') : '🤍 ' + t('listingDetail.addToFavorites')}
                                </button>
                            )}
                            </>
                        )}
                    </div>
                    {/* Report — only for logged-in users */}
                    {currentUser && (
                        <button
                            onClick={handleReport}
                            disabled={reporting}
                            style={{ width: '100%', marginTop: '12px', padding: '12px', background: 'transparent', border: '1px solid #ff4d4f', color: '#ff4d4f', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}
                        >
                            {reporting ? t('listingDetail.submitting') : '🚩 ' + t('listingDetail.reportPost')}
                        </button>
                    )}
                    <div className="w-safety">{t('listingDetail.safetyTip')}</div>
                </div>
            </div>
        </div>
    );
}
