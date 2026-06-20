import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotificationBadge } from '../context/NotificationContext';
import { useTranslation } from 'react-i18next';
import './BottomNav.css';

export default function BottomNav() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { isLoggedIn, isGuest, guestPrefs, listingType, setListingType } = useAuth();
    const { unreadCount } = useNotificationBadge();
    
    // Hide the Sell button for guests (they're browsing, not selling)
    const isBuyer = !isLoggedIn;

    function handleToggleType() {
        const next = listingType === 'livestock' ? 'pets' : 'livestock';
        setListingType(next);
        // Navigate home to instantly see the filtered listings
        navigate('/');
    }

    const toggleIcon = listingType === 'livestock' ? '🐾' : '🐄';
    const toggleLabel = listingType === 'livestock' ? t('navbar.buyPets', { defaultValue: 'Buy Pets' }) : t('navbar.buyCattle', { defaultValue: 'Buy Cattle' });

    return (
        <nav className="bottom-nav">
            <div className="bottom-nav-inner">
                <button
                    className={`bnav-btn${pathname === '/' ? ' active' : ''}`}
                    onClick={() => navigate('/')}
                    aria-label="Home"
                >
                    <span className="bnav-icon">🏠</span>
                    <span className="bnav-label">{t('bottomNav.home')}</span>
                </button>

                {/* Cattle / Pets Toggle */}
                <button
                    className="bnav-btn bnav-toggle"
                    onClick={handleToggleType}
                    aria-label={toggleLabel}
                    title={`Switch to ${toggleLabel}`}
                >
                    <span className="bnav-icon">{toggleIcon}</span>
                    <span className="bnav-label" style={{ fontSize: 9 }}>{toggleLabel}</span>
                </button>

                {!isBuyer && (
                    <button
                        className="bnav-btn bnav-sell"
                        onClick={() => navigate('/sell')}
                        aria-label="Sell"
                    >
                        <span className="bnav-sell-icon">+</span>
                        <span className="bnav-label">{t('bottomNav.sell')}</span>
                    </button>
                )}

                <button
                    className={`bnav-btn${pathname === '/notifications' ? ' active' : ''}`}
                    onClick={() => navigate('/notifications')}
                    aria-label="Alerts"
                >
                    <span className="bnav-icon" style={{ position: 'relative' }}>
                        🔔
                        {unreadCount > 0 && (
                            <span className="bnav-badge" style={{
                                position: 'absolute',
                                top: -4,
                                right: -8,
                                background: '#ef4444',
                                color: 'white',
                                fontSize: 10,
                                fontWeight: 'bold',
                                padding: '2px 5px',
                                borderRadius: '10px',
                                minWidth: 16,
                                textAlign: 'center',
                                border: '2px solid white'
                            }}>
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </span>
                    <span className="bnav-label">{t('bottomNav.alerts')}</span>
                </button>

                {isLoggedIn ? (
                    <button
                        className={`bnav-btn${pathname === '/profile' ? ' active' : ''}`}
                        onClick={() => navigate('/profile')}
                        aria-label="Profile"
                    >
                        <span className="bnav-icon">👤</span>
                        <span className="bnav-label">{t('bottomNav.profile')}</span>
                    </button>
                ) : (
                    <button
                        className={`bnav-btn${pathname === '/login' ? ' active' : ''}`}
                        onClick={() => navigate('/login')}
                        aria-label="Sign In"
                    >
                        <span className="bnav-icon">🔑</span>
                        <span className="bnav-label">{t('navbar.signInRegister', { defaultValue: 'Sign In' })}</span>
                    </button>
                )}
            </div>
        </nav>
    );
}
