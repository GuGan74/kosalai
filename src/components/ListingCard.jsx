import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { getPostAgeInfo, parseImageUrls } from '../utils/helpers';
import TranslatedText from './TranslatedText';
import './ListingCard.css';
import { useFavorites } from '../hooks/useFavorites';
import { shareListing } from '../utils/shareListing';
import { getOptimizedCloudinaryUrl } from '../lib/cloudinary';
const BG_MAP = {
    cow: '#fffde7', buffalo: '#e8edf5', goat: '#f0fff4', horse: '#fff8e1',
    poultry: '#fff3e8', dog: '#f0ebff', cat: '#fff0f6', bird: '#e3f8ff',
};

const ListingCard = React.memo(function ListingCard({ listing, isLiked: isLikedProp = false, onToggleFavorite }) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const {
        id, title, category, location: loc, state, price,
        milk_yield_liters, age_years, for_adoption, image_url, image_urls,
        user_id: owner_id, status,
    } = listing;
    
    const parsedUrls = parseImageUrls(image_urls);
    const displayImage = parsedUrls.length > 0 ? parsedUrls[0] : image_url;

    const ageInfo = getPostAgeInfo(listing.created_at);

    const { currentUser, currentProfile, isLoggedIn } = useAuth();
    const { toggleFavorite } = useFavorites(currentUser?.id);

    // Use prop-driven liked state (from parent batch query), with local override capability
    const [localLiked, setLocalLiked] = React.useState(null);
    const isLiked = localLiked !== null ? localLiked : isLikedProp;

    const bg = BG_MAP[category] || '#f7f8fa';

    const emoji = {
        cow: '🐄', buffalo: '🦬', goat: '🐐', horse: '🐎',
        poultry: '🐓', sheep: '🐑', other: '🐾',
        dog: '🐕', cat: '🐈', bird: '🦜', fish: '🐠', rabbit: '🐇', 'other-pet': '🐾',
    }[category] || '🐾';

    const isPet = ['dog', 'cat', 'bird', 'fish', 'rabbit', 'other-pet'].includes(category);

    async function handleLike(e) {
        e.stopPropagation();
        if (!currentUser) {
            toast.error('Please log in to like posts');
            return;
        }

        // Optimistic update
        setLocalLiked(!isLiked);

        if (onToggleFavorite) {
            await onToggleFavorite(id, listing, currentProfile);
        } else {
            // Fallback: use unified hook to handle DB and notification
            const wasLiked = isLiked; // store state before toggle evaluates it
            await toggleFavorite(id, listing, currentProfile, wasLiked);
            if (wasLiked) {
                toast.success(t('listingCard.removedFromFavorites'));
            } else {
                toast.success(t('listingCard.addedToFavorites'));
            }
        }
    }

    return (
        <div
            className="listing-card"
            role="button"
            tabIndex={0}
            aria-label={`View ${title}, priced at ${for_adoption ? 'Free' : '₹' + Number(price).toLocaleString('en-IN')}`}
            onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/listing/${id}`);
                }
            }}
            onClick={() => {
                if (!isLoggedIn) {
                    sessionStorage.setItem('pb_redirect_after_login', `/listing/${id}`);
                    toast('Sign in to view full listing details 🔐', { icon: '👆', duration: 2500 });
                    setTimeout(() => navigate('/login'), 800);
                    return;
                }
                navigate(`/listing/${id}`);
            }}
        >
            {/* Image Box */}
            <div className={`lc-img-box${!displayImage ? ' show-emoji' : ''}`} style={{ background: bg }}>

                <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8, zIndex: 10 }}>
                    <div className="lc-share-btn" onClick={(e) => { e.stopPropagation(); shareListing(listing); }} aria-label="Share" style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="5" r="3"></circle>
                            <circle cx="6" cy="12" r="3"></circle>
                            <circle cx="18" cy="19" r="3"></circle>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                    </div>
                    <div className={`lc-heart ${isLiked ? 'liked' : ''}`} onClick={handleLike} aria-label={t('listingCard.addToFavorites')} style={{ position: 'relative', top: 0, right: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={isLiked ? "#EF4444" : "none"} stroke={isLiked ? "#EF4444" : "currentColor"} strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                </div>

                {/* Post Age Badge */}
                <div className={`lc-age-badge ${ageInfo.className}`}>
                    <span className="lc-age-icon">{ageInfo.icon}</span>
                    <span className="lc-age-label">{ageInfo.label}</span>
                </div>

                {displayImage ? (
                    <img
                        src={getOptimizedCloudinaryUrl(displayImage, 400)}
                        alt={title}
                        className="lc-img-actual"
                        loading="lazy"
                        width={480}
                        height={320}
                        onError={e => {
                            e.target.style.display = 'none';
                            e.target.parentElement.classList.add('show-emoji');
                        }}
                    />
                ) : null}
                <div className="lc-emoji">{emoji}</div>

                {/* SOLD overlay — shown only when listing.status === 'sold' */}
                {status === 'sold' && (
                    <>
                        {/* Semi-transparent dark overlay covering full image */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'rgba(0,0,0,0.45)',
                            borderRadius: 'inherit',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 5,
                        }}>
                            <span style={{
                                color: '#fff',
                                fontWeight: 800,
                                fontSize: 'clamp(22px, 6vw, 36px)',
                                letterSpacing: '0.18em',
                                textShadow: '0 2px 12px rgba(0,0,0,0.7)',
                                fontFamily: 'Poppins, sans-serif',
                                userSelect: 'none',
                            }}>SOLD</span>
                        </div>
                        {/* Corner badge — top-left */}
                        <div style={{
                            position: 'absolute', top: 10, left: 10,
                            background: '#e53935',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: 11,
                            padding: '3px 8px',
                            borderRadius: 20,
                            letterSpacing: '0.06em',
                            zIndex: 6,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                            fontFamily: 'Poppins, sans-serif',
                        }}>✓ SOLD</div>
                    </>
                )}
            </div>

            {/* Content Box */}
            <div className="lc-content">
                <div className="lc-header-row">
                    <div className="lc-title"><TranslatedText>{title}</TranslatedText></div>
                    <div className="lc-price" style={for_adoption ? { color: 'var(--purple)' } : {}}>
                        {for_adoption ? 'Free Adoption' : `₹${Number(price).toLocaleString('en-IN')}`}
                    </div>
                </div>

                <div className="lc-location">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <TranslatedText>{loc}</TranslatedText>{state ? `, ` : ''}{state && <TranslatedText>{state}</TranslatedText>}
                </div>

                <div className="lc-stats-grid">
                    {!isPet ? (
                        <>
                            {['cow', 'buffalo', 'goat', 'sheep'].includes(category) && listing.gender?.toLowerCase() !== 'male' && (
                                <div className="stat-col">
                                    <div className="stat-lbl">{t('listingCard.milkYield')}</div>
                                    <div className="stat-val">
                                        {milk_yield_liters 
                                            ? (String(milk_yield_liters).length > 6 
                                                ? `${String(milk_yield_liters).substring(0, 6)}...` 
                                                : `${milk_yield_liters}L/day`)
                                            : 'N/A'}
                                    </div>
                                </div>
                            )}
                            <div className="stat-col">
                                <div className="stat-lbl">{t('listingCard.age')}</div>
                                <div className="stat-val">{age_years ? `${age_years} ${t('listingCard.years')}` : t('listingCard.unknown')}</div>
                            </div>
                            <div className="stat-col">
                                <div className="stat-lbl">{t('listingCard.gender')}</div>
                                <div className="stat-val" style={{ textTransform: 'capitalize' }}>{listing.gender ? t('listing.' + listing.gender.toLowerCase(), { defaultValue: listing.gender }) : t('listingCard.unknown')}</div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="stat-col">
                                <div className="stat-lbl">{t('listingCard.age')}</div>
                                <div className="stat-val">{age_years ? `${age_years} ${t('listingCard.years')}` : t('listingCard.unknown')}</div>
                            </div>
                            <div className="stat-col">
                                <div className="stat-lbl">{t('listingCard.gender')}</div>
                                <div className="stat-val" style={{ textTransform: 'capitalize' }}>{listing.gender ? t('listing.' + listing.gender.toLowerCase(), { defaultValue: listing.gender }) : t('listingCard.unknown')}</div>
                            </div>
                        </>
                    )}
                </div>

                <div className="lc-actions">
                    <button className="lc-btn-chat" onClick={async (e) => {
                        e.stopPropagation();
                        if (!isLoggedIn) {
                            sessionStorage.setItem('pb_redirect_after_login', `/listing/${id}`);
                            toast('Sign in to view seller profile 🔐', { icon: '👆', duration: 2500 });
                            setTimeout(() => navigate('/login'), 800);
                            return;
                        }
                        navigate(`/seller/${owner_id}`);
                    }}>
                        <TranslatedText>View Seller</TranslatedText>
                    </button>
                    <button className="lc-btn-call" onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/listing/${id}`);
                    }}>
                        <TranslatedText>Details</TranslatedText>
                    </button>
                </div>
            </div>
        </div>
    );
});

export default ListingCard;
