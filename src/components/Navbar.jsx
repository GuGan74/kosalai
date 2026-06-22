import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import cowLogo from '../assets/kosalai-logo-removebg-preview.png';
import heroBg from '../assets/image.png';
import LanguageSelector from './LanguageSelector';
import './Navbar.css';


export default function Navbar() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { currentProfile, signOut, isLoggedIn, listingType, setListingType } = useAuth();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const initials = (currentProfile?.full_name || 'U').slice(0, 2).toUpperCase();

    function handleToggleType() {
        const next = listingType === 'livestock' ? 'pets' : 'livestock';
        setListingType(next);
        navigate('/');
    }

    const toggleIcon = listingType === 'livestock' ? '🐾' : '🐄';
    const toggleLabel = listingType === 'livestock' ? t('nav.buy_pets') : t('nav.buy_cattle');

    const mainLinks = [
        { icon: '🏠', label: t('nav.home'), path: '/' },
        ...(isLoggedIn ? [{ icon: '👤', label: t('nav.profile'), path: '/profile' }] : [])
    ];

    async function handleSignOut() {
        await signOut();
        navigate('/');
    }

    return (
        <>
            {/* Hero Navbar with background image */}
            <nav className="navbar navbar-container" style={{ backgroundImage: `url(${heroBg})` }}>
                {/* Left gradient fade so text stays readable */}
                <div className="nav-bg-fade" />

                <div className="nav-wrapper">
                    <div className="nav-inner">

                        {/* Logo badge + Brand text */}
                        <div className="nav-logo" onClick={() => navigate('/')}>
                            <div className="nav-logo-badge">
                                <img src={cowLogo} className="nav-logo-icon" alt="Logo" />
                            </div>
                            <div className="nav-brand-group">
                                <div className="nav-brand">Kosalai</div>
                                <div className="nav-subtitle">Your Trusted Livestock Marketplace</div>
                            </div>
                        </div>

                        {/* Desktop nav links */}
                        <div className="nav-links hide-mobile">
                            {mainLinks.map(l => (
                                <button
                                    key={l.path}
                                    className={`nav-link${pathname === l.path ? ' active' : ''}`}
                                    onClick={() => navigate(l.path)}
                                >
                                    <span style={{ marginRight: '6px' }}>{l.icon}</span>
                                    {l.label}
                                </button>
                            ))}
                        </div>

                        {/* Right controls */}
                        <div className="nav-right">
                            {/* Desktop toggle */}
                            <button
                                className="hide-mobile nav-toggle-btn"
                                onClick={handleToggleType}
                                title={`Switch to ${toggleLabel}`}
                            >
                                <span>{toggleIcon}</span>
                                <span>{toggleLabel}</span>
                            </button>

                            <span className="hide-mobile">
                                <LanguageSelector />
                            </span>

                            {/* Avatar / Sign In */}
                            {isLoggedIn ? (
                                <div className="nav-avatar" onClick={() => navigate('/profile')} title={t('navbar.myProfile')}>
                                    {initials}
                                </div>
                            ) : (
                                pathname !== '/login' && (
                                    <button className="nav-signin-btn hide-mobile" onClick={() => {
                                        sessionStorage.setItem('pb_redirect_after_login', window.location.pathname);
                                        navigate('/login');
                                    }}>
                                        {t('navbar.signIn')}
                                    </button>
                                )
                            )}

                            {isLoggedIn && (
                                <button className="btn-sell-nav hide-mobile" onClick={() => navigate('/sell')}>
                                    {t('navbar.sellCattle')}
                                </button>
                            )}

                            {/* Hamburger — card style */}
                            <button
                                className="ham-btn hide-tablet-up"
                                onClick={() => setDrawerOpen(true)}
                                aria-label="Open menu"
                            >
                                <span /><span /><span />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

        {/* Mobile Drawer */}
            <div
                className={`mob-overlay${drawerOpen ? ' open' : ''}`}
                onClick={() => setDrawerOpen(false)}
            />
            <div className={`mob-drawer${drawerOpen ? ' open' : ''}`}>
                <div className="mob-drawer-hd">
                    <img src={cowLogo} className="nav-logo-icon" alt="Logo" style={{ height: 40, width: 'auto', objectFit: 'contain' }} />
                    <div className="nav-brand" style={{ fontSize: 16 }}>Kosalai</div>
                    <button className="mob-close-btn" onClick={() => setDrawerOpen(false)}>✕</button>
                </div>
                <div className="mob-drawer-links">
                    {mainLinks.map(l => (
                        <button key={l.path} className="mob-dl" onClick={() => { navigate(l.path); setDrawerOpen(false); }}>
                            {l.icon} {l.label}
                        </button>
                    ))}
                    <hr style={{ border: 'none', borderTop: '1px solid var(--g5)', margin: '8px 0' }} />

                    {/* Admin Dashboard — only for admin role + verified email */}
                    {currentProfile?.role === 'admin' && currentProfile?.email === 'mail.kosalai@gmail.com' && (
                        <>
                            <button className="mob-dl" onClick={() => { navigate('/admin'); setDrawerOpen(false); }} style={{ color: '#8b5cf6', background: 'rgba(139,92,246,0.08)' }}>
                                🛡️ {t('manage_admin', { defaultValue: 'Admin Dashboard' })}
                            </button>
                            <hr style={{ border: 'none', borderTop: '1px solid var(--g5)', margin: '8px 0' }} />
                        </>
                    )}

                    {isLoggedIn && (
                        <>
                            <button className="mob-dl" onClick={() => { navigate('/sell'); setDrawerOpen(false); }} style={{ color: 'var(--green)', background: 'var(--green-light)' }}>
                                📝 {t('navbar.postNewListing')}
                            </button>
                            <hr style={{ border: 'none', borderTop: '1px solid var(--g5)', margin: '8px 0' }} />
                        </>
                    )}

                    <button className="mob-dl" onClick={() => { navigate('/about-us'); setDrawerOpen(false); }}>
                        ℹ️ {t('aboutUs.title', 'About Us')}
                    </button>
                    <button className="mob-dl" onClick={() => { navigate('/privacy'); setDrawerOpen(false); }}>
                        🔒 {t('profilePage.privacyPolicy', 'Privacy Policy')}
                    </button>
                    <button className="mob-dl" onClick={() => { navigate('/terms'); setDrawerOpen(false); }}>
                        📄 {t('profilePage.termsConditions', 'Terms & Conditions')}
                    </button>
                    <button className="mob-dl" onClick={() => { navigate('/help'); setDrawerOpen(false); }}>
                        ❓ {t('profilePage.helpFaq', 'Help & FAQ')}
                    </button>
                    
                    <hr style={{ border: 'none', borderTop: '1px solid var(--g5)', margin: '8px 0' }} />

                    <div style={{ padding: '8px 4px' }}>
                        <LanguageSelector />
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--g5)', margin: '8px 0' }} />

                    {isLoggedIn ? (
                        <button className="mob-dl" onClick={handleSignOut} style={{ color: 'var(--red)' }}>🚪 {t('navbar.signOut')}</button>
                    ) : (
                        <button className="mob-dl" onClick={() => { sessionStorage.setItem('pb_redirect_after_login', window.location.pathname); navigate('/login'); setDrawerOpen(false); }} style={{ color: 'var(--green)', fontWeight: 800 }}>🔑 {t('navbar.signInRegister')}</button>
                    )}
                </div>
            </div>
        </>
    );
}
