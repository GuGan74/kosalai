import React from 'react';
import { useTranslation } from 'react-i18next';
import BackButton from '../components/BackButton';
import SEOHead from '../components/SEOHead';
import './AboutUsPage.css';

export default function AboutUsPage() {
    const { t } = useTranslation();

    return (
        <div className="about-us-page">
            <SEOHead
                title="Kosalai - About Us"
                description="Learn about Kosalai, India's trusted marketplace for livestock, pets, birds, and animal trading."
            />
            <div className="about-header">
                <BackButton fallbackPath="/profile" />
                <h1 className="about-title">ℹ️ {t('aboutUs.title', 'About Us')}</h1>
            </div>

            <div className="about-content-container">
                <div className="about-card intro-card">
                    <p>{t('aboutUs.intro1')}</p>
                    <p style={{ marginTop: '16px' }}>{t('aboutUs.intro2')}</p>
                </div>

                <div className="about-sections-grid">
                    <div className="about-card section-card">
                        <div className="section-icon">🎯</div>
                        <h2>{t('aboutUs.missionTitle', 'Our Mission')}</h2>
                        <p>{t('aboutUs.missionDesc')}</p>
                    </div>

                    <div className="about-card section-card">
                        <div className="section-icon">🔭</div>
                        <h2>{t('aboutUs.visionTitle', 'Our Vision')}</h2>
                        <p>{t('aboutUs.visionDesc')}</p>
                    </div>
                </div>

                <div className="about-card outro-card" style={{ marginTop: '24px' }}>
                    <p style={{ fontWeight: 600, color: '#1a3c28', textAlign: 'center' }}>
                        {t('aboutUs.outro')}
                    </p>
                </div>
            </div>
        </div>
    );
}
