import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';
import LanguageSelector from '../components/LanguageSelector';
import logoImg from '../assets/kosalai-logo-removebg-preview.png';
// Background image served from Cloudinary CDN for fast global delivery
const cowImg = 'https://res.cloudinary.com/dmdrjb2n5/image/upload/f_auto,q_auto,w_1400/v1776332424/kosalai-static/splash-bg.png';
import toast from 'react-hot-toast';
import './SplashPage.css';

export default function SplashPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { signInWithGoogle } = useAuth();

    async function handleGoogleLogin() {
        const { error } = await signInWithGoogle();
        if (error) {
            toast.error('Google sign-in failed: ' + error.message);
        }
    }

    return (
        <>
            <SEOHead url="https://kosalai.in/" />
            <div className="splash-wrapper">
            <img src={cowImg} alt="Cattle field" className="splash-bg-img" />
            <div className="splash-img-overlay" />
            
            <div className="splash-image-panel">
                <div className="splash-img-content">
                    <span className="splash-trust-badge hide-mobile">{t('splash_redesign.trust_badge')}</span>
                    <span className="splash-trust-badge show-mobile-inline">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 6 }}>
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        {t('splash_redesign.verified_badge')}
                    </span>
                    
                    <h1 className="splash-headline hide-mobile">
                        {t('splash_redesign.headline')}
                    </h1>
                    
                    <p className="splash-subtext hide-mobile">
                        {t('splash_redesign.subtitle_desktop')}
                    </p>
                    <p className="splash-subtext-mobile show-mobile">
                        {t('splash_redesign.subtitle_mobile')}
                    </p>
                </div>
            </div>

            {/* RIGHT — Sign-in panel */}
            <div className="splash-right-panel anti-gravity-glass" style={{ position: 'relative' }}>
                <div className="splash-lang-container" style={{ position: 'absolute', top: 24, right: 32, zIndex: 10 }}>
                    <LanguageSelector />
                </div>
                <div className="splash-right-inner">
                    {/* Anti-Gravity Logo */}
                    <div className="splash-brand-top">
                        <img src={logoImg} alt="Kosalai" className="splash-logo anti-gravity-logo" />
                    </div>

                    {/* Welcome card */}
                    <div className="splash-card">
                        <h2 className="splash-card-title">{t('splash_redesign.welcome')}</h2>
                        
                        <p className="splash-card-desc hide-mobile" style={{ whiteSpace: 'pre-line' }}>
                            {t('splash_redesign.card_desc_desktop')}
                        </p>
                        <p className="splash-card-desc show-mobile" style={{ maxWidth: 300, margin: '0 auto 12px' }}>
                            {t('splash_redesign.card_desc_mobile')}
                        </p>

                        <button className="btn-google-white" onClick={handleGoogleLogin}>
                            <svg width="18" height="18" viewBox="0 0 48 48">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.33 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z" />
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.67 14.62 48 24 48z" />
                            </svg>
                            {t('splash_redesign.continue_google')}
                        </button>

                        {/* Feature badges (Desktop only) */}
                        <div className="splash-features hide-mobile">
                            <div className="splash-feature-item">
                                <span className="splash-feature-icon">🛡️</span>
                                <span className="splash-feature-label">{t('splash_redesign.feature_secure')}</span>
                            </div>
                            <div className="splash-feature-item">
                                <span className="splash-feature-icon">💎</span>
                                <span className="splash-feature-label">{t('splash_redesign.feature_direct')}</span>
                            </div>
                            <div className="splash-feature-item">
                                <span className="splash-feature-icon">📊</span>
                                <span className="splash-feature-label">{t('splash_redesign.feature_insights')}</span>
                            </div>
                        </div>

                        {/* Mobile Secure Entry Divider */}
                        <div className="mobile-divider show-mobile">
                            {t('splash_redesign.secure_entry')}
                        </div>
                    </div>

                    {/* Legal */}
                    <p className="splash-legal hide-mobile">
                        {t('splash_redesign.legal_agree')} <a href="#">{t('splash_redesign.terms')}</a> {t('splash_redesign.and_ack')} <a href="#">{t('splash_redesign.privacy')}</a>.
                    </p>
                </div>

                {/* Footer */}
                <footer className="splash-footer">
                    <a href="#">{t('splash_redesign.privacy')}</a>
                    <span className="hide-mobile">•</span>
                    <a href="#">{t('splash_redesign.terms')}</a>
                    <span className="hide-mobile">•</span>
                    <a href="#">{t('splash_redesign.contact')}</a>
                    <div className="splash-footer-copy">{t('splash_redesign.rights')}</div>
                </footer>
            </div>
        </div>
    </>
    );
}
